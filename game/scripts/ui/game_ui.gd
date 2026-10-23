class_name GameUI
extends CanvasLayer
## All management windows. Every button calls an Economy.request_* method and
## displays its result: the UI never mutates economic state itself.

var world: Node
var root: Control
var current: Control = null
var current_kind := ""
var current_arg = null
var _tab_index := 0
var _qty := {}                    # biz_id -> selected order quantity
var _refresh_queued := false
var _offer_feedback := ""
var _counter_price := 0.0

const COLORS := ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#e63946", "#457b9d", "#8338ec", "#ff006e", "#06d6a0", "#ffb703"]


func _init(w: Node) -> void:
	world = w
	layer = 10


func _ready() -> void:
	root = Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.theme = UITheme.theme()
	add_child(root)
	Economy.business_changed.connect(_on_data_changed)
	Economy.ownership_changed.connect(_on_data_changed)
	Economy.orders_changed.connect(func(): _on_data_changed(""))
	Clock.hour_passed.connect(func(_d, _h): _on_data_changed(""))


func is_open() -> bool:
	return current != null


func close() -> void:
	if current:
		current.queue_free()
	current = null
	current_kind = ""
	current_arg = null
	world.on_ui_closed()


func _on_data_changed(id: String) -> void:
	if current == null or _refresh_queued:
		return
	if current_kind in ["business", "phone", "found"] and (id == "" or current_arg == null or id == str(current_arg) or current_kind == "phone"):
		_refresh_queued = true
		call_deferred("_refresh")


func _refresh() -> void:
	_refresh_queued = false
	if current == null:
		return
	# Don't wipe a text field the player is typing in.
	var focus := root.get_viewport().gui_get_focus_owner()
	if focus is LineEdit and current.is_ancestor_of(focus):
		return
	match current_kind:
		"business": open_business(str(current_arg), true)
		"phone": open_phone(_tab_index, true)
		"found": pass


## Generic window: returns the content container.
func _window(title: String, kind: String, arg = null, w := 980.0, h := 680.0) -> VBoxContainer:
	if current:
		current.queue_free()
	current_kind = kind
	current_arg = arg
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(w, h)
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.position = -Vector2(w, h) / 2.0
	panel.size = Vector2(w, h)
	root.add_child(panel)
	current = panel
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 8)
	panel.add_child(v)
	var head := UITheme.hbox(v)
	var t := UITheme.label(title, 24, UITheme.ACCENT)
	t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(t)
	head.add_child(UITheme.button("✕ Fermer (Échap)", close))
	world.on_ui_opened()
	return v


func _scroll(parent: Control) -> VBoxContainer:
	var sc := ScrollContainer.new()
	sc.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	parent.add_child(sc)
	var v := VBoxContainer.new()
	v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	v.add_theme_constant_override("separation", 6)
	sc.add_child(v)
	return v


func _tabs(parent: Control, names: Array, keep_index: bool) -> Array:
	var tc := TabContainer.new()
	tc.size_flags_vertical = Control.SIZE_EXPAND_FILL
	parent.add_child(tc)
	var pages := []
	for n in names:
		var sc := ScrollContainer.new()
		sc.name = n
		sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
		tc.add_child(sc)
		var v := VBoxContainer.new()
		v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		v.add_theme_constant_override("separation", 6)
		sc.add_child(v)
		pages.append(v)
	if keep_index and _tab_index < names.size():
		tc.current_tab = _tab_index
	else:
		_tab_index = 0
	tc.tab_changed.connect(func(i): _tab_index = i)
	return pages


func _result(r: Dictionary) -> void:
	world.toast(r.msg, "ok" if r.ok else "warn")


func _pid() -> String:
	return Identity.local_id()


func _m(v: float) -> String:
	return Economy.money(v)


# =====================================================================
#  BUSINESS WINDOW
# =====================================================================
func open_business(biz_id: String, keep_tab := false) -> void:
	var b: Business = Economy.businesses.get(biz_id)
	if b == null:
		return
	var v := _window(b.name, "business", biz_id)
	var head := UITheme.hbox(v, 12)
	var av := TextureRect.new()
	av.texture = Identity.get_ai_avatar() if b.is_ai() else Identity.get_avatar(b.owner_id)
	av.custom_minimum_size = Vector2(48, 48)
	av.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	head.add_child(av)
	var hv := VBoxContainer.new()
	head.add_child(hv)
	hv.add_child(UITheme.label("%s — propriétaire : %s" % [b.def().get("name", b.type_id), "Groupe Horizon (IA)" if b.is_ai() else Identity.display_name(b.owner_id)], 17))
	var st := b.status_label()
	hv.add_child(UITheme.label("Statut : %s   •   Réputation %d/100   •   Trésorerie %s" % [st, int(b.reputation), _m(Economy.biz_cash(biz_id)) if _can_see_accounts(b) else "confidentielle"], 15, UITheme.MUTED))
	if b.owner_id == _pid():
		var pages := _tabs(v, ["Aperçu", "Prix", "Stocks & commandes", "Personnel", "Équipement", "Finances & stratégie"], keep_tab)
		_tab_overview(pages[0], b, true)
		_tab_prices(pages[1], b)
		_tab_stock(pages[2], b)
		_tab_staff(pages[3], b)
		_tab_equipment(pages[4], b)
		_tab_finance(pages[5], b)
	else:
		var pages := _tabs(v, ["Informations", "Rachat"], keep_tab)
		_tab_overview(pages[0], b, _can_see_accounts(b))
		_tab_acquire(pages[1], b)


func _can_see_accounts(b: Business) -> bool:
	# AI companies publish their accounts (public registry); player companies only when for sale.
	return b.owner_id == _pid() or b.is_ai() or b.for_sale


func _tab_overview(p: VBoxContainer, b: Business, full: bool) -> void:
	UITheme.section(p, "Situation")
	UITheme.kv(p, "Type", b.def().get("name", ""))
	UITheme.kv(p, "Employés", "%d / %d" % [b.employees.size(), int(b.def().get("max_staff", 4))])
	UITheme.kv(p, "Qualité perçue", "%d%%" % int(b.quality() * 100))
	if b.is_retail():
		UITheme.kv(p, "Confort & décoration", "%d / 40" % int(b.comfort_score()))
	UITheme.kv(p, "Horaires", "%dh – %dh%s" % [int(b.def().get("open_hour", 7)), int(b.def().get("close_hour", 22)), "" if b.open else " (FERMÉ par le patron)"])
	if b.is_retail():
		var prices := []
		for item in b.menu():
			prices.append("%s %s" % [b.menu()[item].name, _m(b.effective_price(item, Clock.day))])
		UITheme.kv(p, "Carte", ", ".join(prices))
	for g in b.def().get("outputs", []):
		UITheme.kv(p, "Prix de gros : " + GameData.good_name(g), _m(b.price_of(g)) + " / " + str(GameData.goods[g].unit))
	if not full:
		p.add_child(UITheme.label("Les comptes de cette entreprise de joueur sont confidentiels (visibles si elle est mise en vente).", 15, UITheme.MUTED))
		return
	UITheme.section(p, "Comptes")
	UITheme.kv(p, "Trésorerie", _m(Economy.biz_cash(b.id)), UITheme.GOOD if Economy.biz_cash(b.id) >= 0 else UITheme.BAD)
	UITheme.kv(p, "Dette bancaire", _m(b.debt), UITheme.BAD if b.debt > 0 else UITheme.TEXT)
	UITheme.kv(p, "Aujourd'hui", "recettes %s  •  dépenses %s  •  %d clients servis, %d perdus" % [_m(b.revenue_today()), _m(b.expenses_today()), b.served_today, b.lost_today])
	UITheme.kv(p, "Valeur estimée", _m(Economy.valuation(b)))
	if b.history.size() > 0:
		UITheme.section(p, "Historique (7 derniers jours)")
		var grid := GridContainer.new()
		grid.columns = 6
		grid.add_theme_constant_override("h_separation", 26)
		p.add_child(grid)
		for h in ["Jour", "Recettes", "Dépenses", "Résultat", "Servis", "Perdus"]:
			grid.add_child(UITheme.label(h, 15, UITheme.MUTED))
		for i in range(max(0, b.history.size() - 7), b.history.size()):
			var r: Dictionary = b.history[i]
			grid.add_child(UITheme.label(str(int(r.day)), 15))
			grid.add_child(UITheme.label(_m(float(r.revenue)), 15))
			grid.add_child(UITheme.label(_m(float(r.expenses)), 15))
			grid.add_child(UITheme.label(_m(float(r.profit)), 15, UITheme.GOOD if float(r.profit) >= 0 else UITheme.BAD))
			grid.add_child(UITheme.label(str(int(r.served)), 15))
			grid.add_child(UITheme.label(str(int(r.lost)), 15))
		var last: Dictionary = b.history[-1]
		var detail: Dictionary = last.get("detail", {})
		if not detail.is_empty():
			var parts := []
			for k in detail:
				parts.append("%s %s" % [k, _m(float(detail[k]))])
			p.add_child(UITheme.label("Détail d'hier : " + ", ".join(parts), 14, UITheme.MUTED))
	if b.owner_id == _pid():
		UITheme.section(p, "Conseiller de gestion")
		for tip in advisor_tips(b):
			var l := UITheme.label("• " + tip, 15, Color("#bde0fe"))
			l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			p.add_child(l)


func advisor_tips(b: Business) -> Array:
	var tips := []
	if b.type_id == "cafe":
		if b.machines().is_empty():
			tips.append("Aucune machine à café : entrez dans le café et appuyez sur B pour en installer une (une d'occasion suffit pour démarrer).")
		if not b.has_display():
			tips.append("Sans vitrine, vous ne pouvez pas vendre de croissants.")
		if b.employees.is_empty():
			tips.append("Sans employé, le café ne sert que lorsque vous êtes vous-même derrière le comptoir. Embauchez un barista pour qu'il tourne en votre absence.")
	for g in b.def().get("inputs", []):
		var have := b.qty(g) + Economy.incoming_qty(b.id, g)
		if have < 15:
			tips.append("Stock de %s presque vide (%d). Commandez dans l'onglet « Stocks »%s." % [GameData.good_name(g), int(b.qty(g)), "" if b.auto_reorder else " ou activez le réapprovisionnement automatique"])
	for item in b.menu():
		var comp := BusinessAI._competitor_avg(Economy, b, item)
		if comp > 0:
			var diff := (b.price_of(item) - comp) / comp
			if diff > 0.15:
				tips.append("%s : %d%% plus cher que la concurrence (%s). Les clients économes iront ailleurs." % [b.menu()[item].name, int(diff * 100), _m(comp)])
			elif diff < -0.2:
				tips.append("%s : %d%% moins cher que la concurrence. Vous pourriez augmenter vos marges." % [b.menu()[item].name, int(-diff * 100)])
	for e in b.equipment:
		if float(e.condition) < 40:
			tips.append("%s en mauvais état (%d%%) : elle est plus lente et la qualité baisse. Réparez-la (R devant la machine)." % [GameData.equip(e.def).name, int(e.condition)])
	if Economy.biz_cash(b.id) < 60:
		tips.append("Trésorerie faible : faites un apport (onglet Finances) pour éviter le découvert bancaire automatique.")
	if b.history.size() > 0:
		var last: Dictionary = b.history[-1]
		if int(last.lost) > max(5, int(last.served) * 0.3):
			tips.append("Hier, %d clients sont repartis sans rien (attente, rupture ou fermeture)." % int(last.lost))
		if int(last.get("lost_capacity", 0)) > 5:
			tips.append("Vous manquez de capacité : embauchez ou achetez une machine plus rapide.")
	if tips.is_empty():
		tips.append("Tout va bien ! Pensez à la décoration (confort) et à la publicité pour attirer plus de clients.")
	return tips


func _tab_prices(p: VBoxContainer, b: Business) -> void:
	if b.is_retail():
		UITheme.section(p, "Prix de vente aux clients")
		for item in b.menu():
			var m: Dictionary = b.menu()[item]
			var h := UITheme.hbox(p)
			var n := UITheme.label(m.name, 17)
			n.custom_minimum_size.x = 160
			h.add_child(n)
			var comp := BusinessAI._competitor_avg(Economy, b, item)
			var pl := UITheme.label(_m(b.price_of(item)), 20, UITheme.ACCENT)
			pl.custom_minimum_size.x = 90
			h.add_child(pl)
			for dv in [-0.5, -0.1, 0.1, 0.5]:
				var it: String = item
				var delta: float = dv
				h.add_child(UITheme.button(("%+.2f" % delta), func(): _result(Economy.request_set_price(_pid(), b.id, it, b.price_of(it) + delta))))
			var needs := []
			for g in m.needs:
				needs.append("%s×%d" % [GameData.good_name(g), int(m.needs[g])])
			h.add_child(UITheme.label("  réf. %s • concurrence %s • ingrédients : %s" % [_m(float(m.base_price)), _m(comp) if comp > 0 else "—", ", ".join(needs)], 14, UITheme.MUTED))
		var promo := "Promotion -%d%% active jusqu'au jour %d." % [int(b.promo_discount * 100), b.promo_until_day] if Clock.day <= b.promo_until_day else ""
		if promo != "":
			p.add_child(UITheme.label(promo, 15, UITheme.GOOD))
	for g in b.def().get("outputs", []):
		UITheme.section(p, "Prix de gros : " + GameData.good_name(g))
		var h2 := UITheme.hbox(p)
		h2.add_child(UITheme.label(_m(b.price_of(g)), 20, UITheme.ACCENT))
		for dv in [-0.05, -0.01, 0.01, 0.05]:
			var delta: float = dv
			var good: String = g
			h2.add_child(UITheme.button("%+.2f" % delta, func(): _result(Economy.request_set_price(_pid(), b.id, good, b.price_of(good) + delta))))
		h2.add_child(UITheme.label("  prix de référence du marché : %s" % _m(float(Economy.market[g].ref_price)), 14, UITheme.MUTED))


func _tab_stock(p: VBoxContainer, b: Business) -> void:
	UITheme.section(p, "Entrepôt (%d / %d)" % [int(b.stock_total()), b.stock_capacity()])
	var goods: Array = []
	for g in b.def().get("inputs", []) + b.def().get("outputs", []):
		if not goods.has(g):
			goods.append(g)
	for g in goods:
		var h := UITheme.hbox(p)
		var n := UITheme.label(GameData.good_name(g), 16)
		n.custom_minimum_size.x = 200
		h.add_child(n)
		h.add_child(UITheme.label("%d en stock" % int(b.qty(g)), 16, UITheme.ACCENT))
		var inc := Economy.incoming_qty(b.id, g)
		if inc > 0:
			h.add_child(UITheme.label("(+%d en livraison)" % int(inc), 15, UITheme.GOOD))
		if g in b.def().get("inputs", []):
			var target := float(b.reorder_target.get(g, 50))
			h.add_child(UITheme.label("   seuil auto : %d" % int(target), 15, UITheme.MUTED))
			var good: String = g
			h.add_child(UITheme.button("-10", func(): _result(Economy.request_set_reorder(_pid(), b.id, good, target - 10, b.auto_reorder))))
			h.add_child(UITheme.button("+10", func(): _result(Economy.request_set_reorder(_pid(), b.id, good, target + 10, b.auto_reorder))))
		if g in b.def().get("outputs", []) and b.qty(g) >= 1:
			var good2: String = g
			var q: float = floor(b.qty(g) * 0.5)
			h.add_child(UITheme.button("Exporter %d au port (%s/u)" % [int(q), _m(GameData.good_base_price(g) * float(GameData.bal("export_discount", 0.55)))], func(): _result(Economy.request_export(_pid(), b.id, good2, q))))
	var auto := CheckButton.new()
	auto.text = "Réapprovisionnement automatique (commande quand le stock passe sous la moitié du seuil)"
	auto.button_pressed = b.auto_reorder
	auto.toggled.connect(func(on): _result(Economy.request_set_reorder(_pid(), b.id, "", 0, on)))
	p.add_child(auto)
	if b.def().get("inputs", []).is_empty():
		return
	UITheme.section(p, "Passer une commande")
	var qh := UITheme.hbox(p)
	qh.add_child(UITheme.label("Quantité :", 16))
	var sel: int = _qty.get(b.id, 50)
	for q in [20, 50, 100, 200]:
		var qq: int = q
		var bt := UITheme.button(("▶ %d" if q == sel else "%d") % q, func(): _qty[b.id] = qq; open_business(b.id, true))
		qh.add_child(bt)
	for g in b.def().get("inputs", []):
		p.add_child(UITheme.label(GameData.good_name(g), 17, UITheme.ACCENT))
		var sup: Array = Economy.suppliers_for(g, b, sel)
		for s in sup.slice(0, 4):
			var h := UITheme.hbox(p)
			var q2: float = min(sel, float(s.available))
			var total: float = float(s.price) * q2 + float(s.fee)
			var who := " (vous)" if s.owner == _pid() else (" (joueur)" if s.owner != "" else "")
			var l := UITheme.label("   %s%s — %s/u, dispo %d, livraison %s" % [s.name, who, _m(float(s.price)), int(s.available), _m(float(s.fee))], 15)
			l.custom_minimum_size.x = 580
			h.add_child(l)
			var sid: String = s.id
			var good: String = g
			h.add_child(UITheme.button("Commander %d (%s)" % [int(q2), _m(total)], func(): _result(Economy.request_order(_pid(), b.id, good, q2, sid))))
	UITheme.section(p, "Commandes en cours")
	var any := false
	for o in Economy.orders:
		if o.buyer == b.id or o.seller == b.id:
			any = true
			var dir := "Achat" if o.buyer == b.id else "Vente"
			var st := "livreur joueur en route" if o.status == "taken" else "transporteur IA (livraison ~%dh)" % int(max(0.0, float(o.due) - Clock.absolute_hours()))
			p.add_child(UITheme.label("#%d %s : %d × %s — %s → %s — %s" % [o.id, dir, int(o.qty), GameData.good_name(o.good), o.seller_name, o.buyer_name, st], 15))
	if not any:
		p.add_child(UITheme.label("Aucune.", 15, UITheme.MUTED))


func _tab_staff(p: VBoxContainer, b: Business) -> void:
	UITheme.section(p, "Équipe (%s) — salaires %s/jour" % [b.def().get("staff_role", "Employé"), _m(b.wages_per_day())])
	if b.employees.is_empty():
		p.add_child(UITheme.label("Personne. Vous pouvez travailler vous-même ou embaucher.", 15, UITheme.MUTED))
	for i in b.employees.size():
		var e: Dictionary = b.employees[i]
		var h := UITheme.hbox(p)
		var l := UITheme.label("%s — compétence %d%% — %s/jour — depuis le jour %d" % [e.name, int(float(e.skill) * 100), _m(float(e.wage)), int(e.hired_day)], 16)
		l.custom_minimum_size.x = 620
		h.add_child(l)
		var idx := i
		h.add_child(UITheme.button("Licencier (1 jour d'indemnité)", func(): _result(Economy.request_fire(_pid(), b.id, idx))))
	UITheme.section(p, "Candidats du jour")
	var list: Array = Economy.candidates.get(b.id, [])
	for i in list.size():
		var c: Dictionary = list[i]
		var h := UITheme.hbox(p)
		var l := UITheme.label("%s — compétence %d%% — demande %s/jour" % [c.name, int(float(c.skill) * 100), _m(float(c.wage))], 16)
		l.custom_minimum_size.x = 620
		h.add_child(l)
		var idx := i
		h.add_child(UITheme.button("Embaucher", func(): _result(Economy.request_hire(_pid(), b.id, idx))))
	UITheme.section(p, "Automatisation")
	var mgr := CheckButton.new()
	mgr.text = "Gérant IA : fixe les prix, commande, embauche et répare à votre place (%s/jour)" % _m(float(GameData.bal("manager_ai_cost_per_day", 35)))
	mgr.button_pressed = b.manager_ai
	mgr.toggled.connect(func(on): _result(Economy.request_toggle(_pid(), b.id, "manager_ai", on)))
	p.add_child(mgr)


func _tab_equipment(p: VBoxContainer, b: Business) -> void:
	if b.def().get("enterable", false):
		p.add_child(UITheme.label("Pour acheter, placer, déplacer ou revendre du matériel : entrez dans le bâtiment et appuyez sur B (mode construction).", 16, Color("#bde0fe")))
	else:
		UITheme.section(p, "Capacité de production")
		UITheme.kv(p, "Niveau", "%d / 5 (production ×%.1f, stockage %d)" % [b.level, 1.0 + 0.5 * (b.level - 1), b.stock_capacity()])
		p.add_child(UITheme.button("Agrandir l'exploitation (%s)" % _m(Economy.upgrade_cost(b)), func(): _result(Economy.request_upgrade(_pid(), b.id)), b.level >= 5))
	UITheme.section(p, "Matériel installé")
	if b.equipment.is_empty():
		p.add_child(UITheme.label("Aucun.", 15, UITheme.MUTED))
	for e in b.equipment:
		var d := GameData.equip(e.def)
		var h := UITheme.hbox(p)
		var l := UITheme.label("%s — état %d%%%s" % [d.name, int(e.condition), "  (vitesse ×%.2f, qualité ×%.2f)" % [float(d.get("speed", 1)), float(d.get("quality", 1))] if d.get("category", "") == "machine" else ""], 15)
		l.custom_minimum_size.x = 560
		h.add_child(l)
		var uid := int(e.uid)
		if float(e.condition) < 99:
			h.add_child(UITheme.button("Réparer (%s)" % _m(Economy.repair_cost(e)), func(): _result(Economy.request_repair(_pid(), b.id, uid))))
		h.add_child(UITheme.button("Revendre (%s)" % _m(float(d.price) * 0.4 * float(e.condition) / 100.0), func(): _result(Economy.request_sell_equipment(_pid(), b.id, uid))))


func _tab_finance(p: VBoxContainer, b: Business) -> void:
	UITheme.section(p, "Trésorerie : %s  •  vos fonds personnels : %s" % [_m(Economy.biz_cash(b.id)), _m(Economy.player_cash())])
	var h := UITheme.hbox(p)
	h.add_child(UITheme.label("Apport :", 16))
	for a in [50, 200, 500, 1000]:
		var amt: float = a
		h.add_child(UITheme.button("+%d" % a, func(): _result(Economy.request_deposit(_pid(), b.id, amt))))
	h.add_child(UITheme.label("   Retrait :", 16))
	for a in [50, 200, 500]:
		var amt2: float = a
		h.add_child(UITheme.button("-%d" % a, func(): _result(Economy.request_withdraw(_pid(), b.id, amt2))))
	var h2 := UITheme.hbox(p)
	h2.add_child(UITheme.label("Banque (dette %s, intérêts %.1f%%/jour) :" % [_m(b.debt), float(GameData.bal("loan_interest_daily", 0.004)) * 100], 16))
	h2.add_child(UITheme.button("Emprunter 300", func(): _result(Economy.request_loan(_pid(), b.id, 300))))
	h2.add_child(UITheme.button("Emprunter 1000", func(): _result(Economy.request_loan(_pid(), b.id, 1000))))
	h2.add_child(UITheme.button("Rembourser 200", func(): _result(Economy.request_repay(_pid(), b.id, 200)), b.debt <= 0))
	if b.is_retail() and b.kind() == "retail":
		UITheme.section(p, "Marketing & concurrence")
		var h3 := UITheme.hbox(p)
		h3.add_child(UITheme.button("Campagne d'affichage 3 jours (90 $)", func(): _result(Economy.request_marketing(_pid(), b.id, "ad")), Clock.day <= b.ad_until_day))
		h3.add_child(UITheme.button("Promotion -20% pendant 2 jours", func(): _result(Economy.request_marketing(_pid(), b.id, "promo")), Clock.day <= b.promo_until_day))
		var loyal := CheckButton.new()
		loyal.text = "Programme de fidélité (120 $ une fois, clients plus fidèles)"
		loyal.button_pressed = b.loyalty
		loyal.toggled.connect(func(on): _result(Economy.request_toggle(_pid(), b.id, "loyalty", on)))
		p.add_child(loyal)
	UITheme.section(p, "Établissement")
	var op := CheckButton.new()
	op.text = "Ouvert au public"
	op.button_pressed = b.open
	op.toggled.connect(func(on): _result(Economy.request_toggle(_pid(), b.id, "open", on)))
	p.add_child(op)
	var h4 := UITheme.hbox(p)
	var name_edit := LineEdit.new()
	name_edit.text = b.name
	name_edit.custom_minimum_size.x = 320
	name_edit.max_length = 28
	h4.add_child(name_edit)
	h4.add_child(UITheme.button("Renommer", func(): _result(Economy.request_rename(_pid(), b.id, name_edit.text, ""))))
	var h5 := UITheme.hbox(p)
	h5.add_child(UITheme.label("Couleur de l'enseigne :", 16))
	for c in COLORS:
		var col: String = c
		var bt := UITheme.button("   ", func(): _result(Economy.request_rename(_pid(), b.id, "", col)))
		bt.add_theme_stylebox_override("normal", UITheme.box(Color(col), 6, 10, 6))
		h5.add_child(bt)
	UITheme.section(p, "Vente de l'entreprise (valeur estimée %s)" % _m(Economy.valuation(b)))
	var h6 := UITheme.hbox(p)
	var price_edit := LineEdit.new()
	price_edit.placeholder_text = "prix demandé"
	price_edit.text = str(int(b.asking_price)) if b.for_sale else str(int(Economy.valuation(b)))
	price_edit.custom_minimum_size.x = 140
	h6.add_child(price_edit)
	h6.add_child(UITheme.button("Mettre en vente" if not b.for_sale else "Modifier le prix", func(): _result(Economy.request_list_for_sale(_pid(), b.id, float(price_edit.text)))))
	if b.for_sale:
		h6.add_child(UITheme.button("Retirer de la vente", func(): _result(Economy.request_list_for_sale(_pid(), b.id, 0))))
	p.add_child(UITheme.button("Vendre immédiatement au Groupe Horizon (IA) pour %s" % _m(snappedf(Economy.valuation(b) * 0.8, 10.0)), func(): _confirm("Vendre « %s » au Groupe Horizon ?" % b.name, func(): _result(Economy.request_sell_to_holding(_pid(), b.id)); close())))


func _tab_acquire(p: VBoxContainer, b: Business) -> void:
	UITheme.section(p, "Racheter « %s »" % b.name)
	if b.for_sale:
		UITheme.kv(p, "Prix demandé", _m(b.asking_price), UITheme.ACCENT)
	if _can_see_accounts(b):
		UITheme.kv(p, "Valeur estimée (actifs + stock + trésorerie - dette + clientèle)", _m(Economy.valuation(b)))
	UITheme.kv(p, "Vos fonds personnels", _m(Economy.player_cash()))
	p.add_child(UITheme.label("Le rachat transfère le bâtiment, le matériel, le stock, la trésorerie, les dettes, les employés et les commandes en cours.", 15, UITheme.MUTED))
	var h := UITheme.hbox(p)
	var edit := LineEdit.new()
	edit.placeholder_text = "votre offre ($)"
	edit.text = str(int(b.asking_price if b.for_sale else Economy.valuation(b)))
	edit.custom_minimum_size.x = 160
	h.add_child(edit)
	var propose := func():
		var r: Dictionary = Economy.request_offer(_pid(), b.id, float(edit.text))
		_offer_feedback = r.msg
		_counter_price = float(r.get("counter", 0.0))
		_result(r)
		if r.ok:
			_offer_feedback = ""
			close()
			world.celebrate()
		else:
			open_business(b.id, true)
	h.add_child(UITheme.button("Proposer cette offre", propose))
	if _offer_feedback != "":
		p.add_child(UITheme.label(_offer_feedback, 16, Color("#ffd166")))
	if _counter_price > 0:
		var accept_counter := func():
			var r: Dictionary = Economy.request_offer(_pid(), b.id, _counter_price)
			_result(r)
			_counter_price = 0.0
			_offer_feedback = ""
			if r.ok:
				close()
				world.celebrate()
		p.add_child(UITheme.button("Accepter la contre-proposition (%s)" % _m(_counter_price), accept_counter))
	if b.is_ai():
		p.add_child(UITheme.label("Astuce : une entreprise IA en difficulté est mise en vente avec une décote. Une entreprise saine exige une prime (~+20%).", 14, UITheme.MUTED))


func _confirm(text: String, yes: Callable) -> void:
	var dlg := ConfirmationDialog.new()
	dlg.dialog_text = text
	dlg.ok_button_text = "Oui"
	dlg.cancel_button_text = "Non"
	root.add_child(dlg)
	dlg.confirmed.connect(yes)
	dlg.popup_centered()


# =====================================================================
#  FOUND A COMPANY ON A LOT
# =====================================================================
func open_found_dialog(lot_id: String) -> void:
	var lot: Dictionary = Economy.lots[lot_id]
	var v := _window("Créer une entreprise", "found", lot_id, 760, 560)
	var p := _scroll(v)
	var type_id: String = lot.allowed[0]
	var t := GameData.btype(type_id)
	UITheme.kv(p, "Terrain", "%d × %d m" % [int(lot.size[0]), int(lot.size[1])])
	UITheme.kv(p, "Type d'activité", t.name + " (autres secteurs : prochaines versions)")
	UITheme.kv(p, "Construction", _m(float(t.build_cost)))
	UITheme.kv(p, "Location", "caution %s + loyer %s/jour (payé par l'entreprise)" % [_m(float(lot.deposit)), _m(float(lot.rent_per_day))])
	UITheme.kv(p, "Achat du terrain", _m(float(lot.buy_price)) + " (pas de loyer, revendable avec l'entreprise)")
	UITheme.kv(p, "Vos fonds", _m(Economy.player_cash()), UITheme.GOOD)
	var h := UITheme.hbox(p)
	h.add_child(UITheme.label("Nom :", 16))
	var name_edit := LineEdit.new()
	name_edit.text = "Chez %s" % Identity.display_name(_pid())
	name_edit.max_length = 28
	name_edit.custom_minimum_size.x = 340
	h.add_child(name_edit)
	var chosen := {"c": COLORS[0]}
	var h2 := UITheme.hbox(p)
	h2.add_child(UITheme.label("Couleur :", 16))
	for c in COLORS:
		var col: String = c
		var bt := UITheme.button("   ", func(): chosen.c = col)
		bt.add_theme_stylebox_override("normal", UITheme.box(Color(col), 6, 10, 6))
		h2.add_child(bt)
	p.add_child(UITheme.label("Ensuite : entrez, appuyez sur B pour installer une machine à café et une vitrine, faites un apport de trésorerie, et commandez du café, du lait et des croissants.", 15, Color("#bde0fe")))
	var h3 := UITheme.hbox(p)
	var cost_rent := float(t.build_cost) + float(lot.deposit)
	var cost_buy := float(t.build_cost) + float(lot.buy_price)
	h3.add_child(UITheme.button("Louer et construire (%s)" % _m(cost_rent), func(): _found(lot_id, type_id, name_edit.text, chosen.c, false), Economy.player_cash() < cost_rent))
	h3.add_child(UITheme.button("Acheter et construire (%s)" % _m(cost_buy), func(): _found(lot_id, type_id, name_edit.text, chosen.c, true), Economy.player_cash() < cost_buy))


func _found(lot_id: String, type_id: String, n: String, c: String, buy: bool) -> void:
	var r: Dictionary = Economy.request_found_business(_pid(), lot_id, type_id, n, c, buy)
	_result(r)
	if r.ok:
		close()
		world.celebrate()


# =====================================================================
#  PHONE (jobs, my companies, market, registry, news)
# =====================================================================
func open_phone(tab := 0, keep := false) -> void:
	_tab_index = tab
	var v := _window("Téléphone", "phone", null, 1000, 680)
	var pages := _tabs(v, ["Emplois", "Mes entreprises", "Marché", "Registre", "Actualités", "Succès"], true)
	_page_jobs(pages[0])
	_page_mine(pages[1])
	_page_market(pages[2])
	_page_registry(pages[3])
	_page_news(pages[4])
	_page_achievements(pages[5])


func _page_jobs(p: VBoxContainer) -> void:
	var j: Dictionary = Economy.job_of(_pid())
	UITheme.section(p, "Emploi actuel")
	match j.get("type", ""):
		"delivery":
			p.add_child(UITheme.label("Livraison #%d en cours — suivez la flèche bleue." % int(j.order_id), 16, UITheme.GOOD))
			p.add_child(UITheme.button("Abandonner la livraison", func(): _result(Economy.request_cancel_delivery(_pid())); world.remove_job_crate(); open_phone(0, true)))
		"barista":
			p.add_child(UITheme.label("Barista chez %s — servez les clients au comptoir." % Economy.businesses[j.biz_id].name, 16, UITheme.GOOD))
			p.add_child(UITheme.button("Terminer mon service", func(): _result(Economy.request_end_shift(_pid())); open_phone(0, true)))
		_:
			p.add_child(UITheme.label("Aucun. Choisissez un métier ci-dessous — l'argent gagné permet d'ouvrir votre propre entreprise !", 16, UITheme.MUTED))
	UITheme.section(p, "Livreur / transporteur — commandes entre entreprises")
	var jobs := Economy.open_delivery_jobs()
	if jobs.is_empty():
		p.add_child(UITheme.label("Aucune livraison disponible pour l'instant (revenez dans une heure de jeu).", 15, UITheme.MUTED))
	for o in jobs.slice(0, 8):
		var h := UITheme.hbox(p)
		var dist := Vector2(o.from[0], o.from[1]).distance_to(Vector2(o.to[0], o.to[1]))
		var l := UITheme.label("#%d  %d × %s : %s → %s (%d m)" % [o.id, int(o.qty), GameData.good_name(o.good), o.seller_name, o.buyer_name, int(dist)], 15)
		l.custom_minimum_size.x = 620
		h.add_child(l)
		var oid := int(o.id)
		var accept := func():
			var r: Dictionary = Economy.request_take_delivery(_pid(), oid)
			_result(r)
			if r.ok:
				world.spawn_job_crate(r.order)
				close()
		h.add_child(UITheme.button("Accepter (+%s)" % _m(float(o.fee)), accept, j.get("type", "") == "delivery"))
	UITheme.section(p, "Barista (cafés de l'IA)")
	for id in Economy.businesses:
		var b: Business = Economy.businesses[id]
		if b.type_id == "cafe" and b.is_ai():
			var h := UITheme.hbox(p)
			var l := UITheme.label("%s — %s/commande + pourboires (allez au comptoir et appuyez sur E)" % [b.name, _m(float(GameData.bal("barista_job_pay_per_drink", 1.6)))], 15)
			l.custom_minimum_size.x = 620
			h.add_child(l)
			var pos := b.pos
			var nm := b.name
			h.add_child(UITheme.button("GPS", func(): world.set_waypoint(Vector3(pos.x, 0, pos.y + 4), nm); close()))
	UITheme.section(p, "Ouvrier agricole (cueillette)")
	for id in Economy.businesses:
		var b: Business = Economy.businesses[id]
		if b.type_id == "coffee_farm":
			var h := UITheme.hbox(p)
			var l := UITheme.label("%s — %s par buisson cueilli" % [b.name, _m(float(GameData.bal("harvest_pay_per_plant", 2.5)))], 15)
			l.custom_minimum_size.x = 620
			h.add_child(l)
			var pos := b.pos
			var nm := b.name
			h.add_child(UITheme.button("GPS", func(): world.set_waypoint(Vector3(pos.x, 0, pos.y + 12), nm); close()))


func _page_mine(p: VBoxContainer) -> void:
	var mine := Economy.owned_businesses(_pid())
	UITheme.section(p, "Mes entreprises (%d)" % mine.size())
	if mine.is_empty():
		p.add_child(UITheme.label("Vous n'avez pas encore d'entreprise. Louez un terrain disponible (panneaux verts en ville) ou rachetez une entreprise (onglet Registre).", 15, UITheme.MUTED))
	var total := Economy.player_cash()
	for b in mine:
		total += Economy.valuation(b)
		var h := UITheme.hbox(p)
		var last: Dictionary = b.history[-1] if b.history.size() > 0 else {"profit": 0.0}
		var l := UITheme.label("%s — trésorerie %s — hier %s — %s" % [b.name, _m(Economy.biz_cash(b.id)), _m(float(last.profit)), b.status_label()], 16)
		l.custom_minimum_size.x = 640
		h.add_child(l)
		var id: String = b.id
		h.add_child(UITheme.button("Gérer", func(): open_business(id)))
		var pos: Vector2 = b.pos
		var nm: String = b.name
		h.add_child(UITheme.button("GPS", func(): world.set_waypoint(Vector3(pos.x, 0, pos.y + 6), nm); close()))
	UITheme.kv(p, "Patrimoine net estimé", _m(total), UITheme.ACCENT)


func _page_market(p: VBoxContainer) -> void:
	UITheme.section(p, "Prix de gros (offre et demande)")
	var grid := GridContainer.new()
	grid.columns = 5
	grid.add_theme_constant_override("h_separation", 30)
	p.add_child(grid)
	for hd in ["Produit", "Prix de référence", "Volume hier", "Import (port)", "Export (port)"]:
		grid.add_child(UITheme.label(hd, 15, UITheme.MUTED))
	for g in Economy.market:
		var m: Dictionary = Economy.market[g]
		var base := GameData.good_base_price(g)
		var ref := float(m.ref_price)
		grid.add_child(UITheme.label(GameData.good_name(g), 15))
		grid.add_child(UITheme.label("%s %s" % [_m(ref), "▲" if ref > base * 1.05 else ("▼" if ref < base * 0.95 else "=")], 15, UITheme.BAD if ref > base * 1.05 else (UITheme.GOOD if ref < base * 0.95 else UITheme.TEXT)))
		grid.add_child(UITheme.label(str(int(m.volume_yesterday)), 15))
		grid.add_child(UITheme.label(_m(base * float(GameData.bal("import_markup", 1.6))), 15))
		grid.add_child(UITheme.label(_m(base * float(GameData.bal("export_discount", 0.55))), 15))
	UITheme.section(p, "Chaînes de production")
	for line in ["Ferme caféière → (grains) → Torréfaction → (café torréfié) → Cafés → clients",
			"Laiterie → (lait) → Cafés & Boulangerie",
			"Ferme céréalière → (blé) → Moulin → (farine) → Boulangerie → (croissants) → Cafés & clients",
			"Le port importe ce qui manque (cher) et achète les surplus (bon marché)."]:
		p.add_child(UITheme.label("• " + line, 15))
	UITheme.section(p, "Économie de la ville")
	UITheme.kv(p, "Épargne des habitants", _m(Economy.balance(Economy.POPULATION)))
	UITheme.kv(p, "Pouvoir d'achat (demande)", "×%.2f" % Economy.wealth_factor())
	if not Economy.event.is_empty():
		UITheme.kv(p, "Événement", Economy.event.title, UITheme.ACCENT)


func _page_registry(p: VBoxContainer) -> void:
	UITheme.section(p, "Registre du commerce")
	for id in Economy.businesses:
		var b: Business = Economy.businesses[id]
		var h := UITheme.hbox(p)
		var owner := "IA" if b.is_ai() else Identity.display_name(b.owner_id)
		var extra := " — À VENDRE %s" % _m(b.asking_price) if b.for_sale else ""
		var l := UITheme.label("%s (%s) — %s — %s%s" % [b.name, b.def().name, owner, b.status_label(), extra], 15, UITheme.ACCENT if b.for_sale else UITheme.TEXT)
		l.custom_minimum_size.x = 680
		h.add_child(l)
		var bid: String = id
		h.add_child(UITheme.button("Infos", func(): open_business(bid)))
		var pos := b.pos
		var nm := b.name
		h.add_child(UITheme.button("GPS", func(): world.set_waypoint(Vector3(pos.x, 0, pos.y + 6), nm); close()))
	UITheme.section(p, "Terrains")
	for lid in Economy.lots:
		var lot: Dictionary = Economy.lots[lid]
		var h := UITheme.hbox(p)
		var occ: String = "libre" if lot.tenant_biz == "" else "occupé (%s)" % Economy.businesses[lot.tenant_biz].name
		var l := UITheme.label("Terrain %s — %s — loyer %s/j, achat %s" % [lid.substr(4).to_upper(), occ, _m(float(lot.rent_per_day)), _m(float(lot.buy_price))], 15)
		l.custom_minimum_size.x = 680
		h.add_child(l)
		var pos := Vector3(lot.pos[0], 0, lot.pos[1] + 6)
		h.add_child(UITheme.button("GPS", func(): world.set_waypoint(pos, "Terrain"); close()))


func _page_news(p: VBoxContainer) -> void:
	UITheme.section(p, "Gazette de Bourgade")
	if Economy.news.is_empty():
		p.add_child(UITheme.label("Rien de neuf… pour l'instant.", 15, UITheme.MUTED))
	for n in Economy.news:
		var l := UITheme.label(n, 15)
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		p.add_child(l)


func _page_achievements(p: VBoxContainer) -> void:
	UITheme.section(p, "Succès")
	for a in world.ACHIEVEMENTS:
		var got: bool = world.achievements.has(a.id)
		p.add_child(UITheme.label(("★ " if got else "☆ ") + a.title + " — " + a.desc, 16, UITheme.ACCENT if got else UITheme.MUTED))
	UITheme.section(p, "Statistiques")
	for k in world.stats:
		UITheme.kv(p, {"served": "Commandes servies", "deliveries": "Livraisons", "harvested": "Buissons cueillis"}.get(k, k), str(world.stats[k]))


# =====================================================================
#  PAUSE / HELP / MAP
# =====================================================================
func open_pause() -> void:
	var v := _window("Pause", "pause", null, 520, 520)
	var p := _scroll(v)
	p.add_child(UITheme.button("Reprendre", close))
	p.add_child(UITheme.button("Sauvegarder (F5)", func(): world.save_game()))
	p.add_child(UITheme.button("Charger la dernière sauvegarde (F9)", func(): close(); world.request_load(), not SaveSystem.has_save()))
	p.add_child(UITheme.button("Aide & commandes (H)", open_help))
	var paused := CheckButton.new()
	paused.text = "Mettre le temps en pause (solo)"
	paused.button_pressed = Clock.time_scale <= 0.0
	paused.toggled.connect(func(on): Clock.time_scale = 0.0 if on else 1.0)
	p.add_child(paused)
	var fast := CheckButton.new()
	fast.text = "Temps accéléré ×3 (solo)"
	fast.button_pressed = Clock.time_scale > 1.0
	fast.toggled.connect(func(on): Clock.time_scale = 3.0 if on else 1.0)
	p.add_child(fast)
	if Identity.provider == "local":
		var h := UITheme.hbox(p)
		var e := LineEdit.new()
		e.text = Identity.display_name(_pid())
		e.max_length = 20
		e.custom_minimum_size.x = 220
		h.add_child(e)
		h.add_child(UITheme.button("Changer de pseudo", func(): Identity.set_local_name(e.text); world.toast("Pseudo mis à jour.", "ok")))
	p.add_child(UITheme.label("Profil : %s (%s)" % [Identity.display_name(_pid()), "Steam" if Identity.provider == "steam" else "profil local de test"], 14, UITheme.MUTED))
	p.add_child(UITheme.button("Quitter le jeu (sauvegarde automatique)", func(): world.save_game(); get_tree().quit()))


func open_help() -> void:
	var v := _window("Aide", "help", null, 820, 640)
	var p := _scroll(v)
	for line in [
		"DÉPLACEMENTS : ZQSD / WASD (ou flèches), Maj = courir, Espace = sauter, souris = caméra, molette = zoom.",
		"E : interagir (le texte en bas de l'écran indique l'action).  R : action secondaire (réparer, infos).",
		"F : monter / descendre du véhicule utilitaire.  G : poser l'objet porté.",
		"Tab : téléphone (emplois, entreprises, marché, registre).  M : carte.  B : mode construction (dans votre café).",
		"F5 : sauvegarder.  F9 : charger.  Échap : menu / fermer.",
		"",
		"DÉBUTER : prenez un emploi ! Barista au Café du Coin ou chez Kawa Express (comptoir → E), livreur (Tab → Emplois), ou cueilleur aux Serres Caféières (à l'est).",
		"BARISTA : un client au comptoir affiche sa commande. Allez à la machine (E) puis appuyez sur E dans la zone verte pour une mousse parfaite (pourboire !), revenez au comptoir (E) pour servir. Croissants : vitrine.",
		"ENTREPRENDRE : louez un terrain (panneau vert), construisez votre café, installez une machine et une vitrine (B), faites un apport, commandez des ingrédients, fixez vos prix, embauchez.",
		"RACHETER : toute entreprise peut être rachetée (E au quai → Rachat). Celles en difficulté sont soldées.",
		"ÉCONOMIE : les clients choisissent selon le prix, la qualité, la réputation, la distance, l'attente et le confort. Les produits circulent réellement entre fermes, usines et commerces.",
	]:
		var l := UITheme.label(line, 16)
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		p.add_child(l)


func open_map() -> void:
	var v := _window("Carte de Bourgade", "map", null, 900, 700)
	var m := MapView.new()
	m.world = world
	m.size_flags_vertical = Control.SIZE_EXPAND_FILL
	m.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	v.add_child(m)
	v.add_child(UITheme.label("Cliquez sur la carte pour placer un repère GPS (flèche bleue au-dessus de votre personnage).", 14, UITheme.MUTED))
