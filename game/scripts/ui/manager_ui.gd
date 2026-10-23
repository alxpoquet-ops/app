class_name ManagerUI
extends CanvasLayer
## The manager's tablet and every management window. Buttons call
## Hotel.request_* methods; the UI never writes the simulation state itself.

var world: Node
var root: Control
var current: Control = null
var current_kind := ""
var current_arg = null
var _tab := 0
var _refresh_t := 0.0
var _hire_shift := {}

const STATE_NAMES := {"ready": "Libre et prête", "occupied": "Occupée", "dnd": "Ne pas déranger", "dirty": "À nettoyer", "to_prepare": "À préparer", "locked": "À rénover"}
const TAB_NAMES := ["Tableau de bord", "Chambres", "Clients & avis", "Personnel", "Tâches", "Prix", "Stocks", "Finances", "Journal"]


func _init(w: Node) -> void:
	world = w
	layer = 10


func _ready() -> void:
	root = Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.theme = UITheme.theme()
	add_child(root)


func is_open() -> bool:
	return current != null


func close() -> void:
	if current:
		current.queue_free()
	current = null
	current_kind = ""
	world.on_ui_closed()


func _process(delta: float) -> void:
	if current == null or current_kind != "tablet":
		return
	_refresh_t -= delta
	if _refresh_t <= 0.0:
		_refresh_t = 2.0
		var focus := root.get_viewport().gui_get_focus_owner()
		if not (focus is LineEdit):
			open_tablet(_tab, true)


func _window(title: String, kind: String, w := 1180.0, h := 760.0) -> VBoxContainer:
	if current:
		current.queue_free()
	current_kind = kind
	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.custom_minimum_size = Vector2(w, h)
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


func _r(res: Dictionary) -> void:
	world.toast(res.msg, "ok" if res.ok else "warn")
	if current_kind == "tablet":
		open_tablet(_tab, true)


func _m(v: float) -> String:
	return Hotel.money(v)


func _grid(parent: Control, cols: int, sep := 22) -> GridContainer:
	var g := GridContainer.new()
	g.columns = cols
	g.add_theme_constant_override("h_separation", sep)
	g.add_theme_constant_override("v_separation", 4)
	parent.add_child(g)
	return g


func _cell(g: GridContainer, text: String, col := UITheme.TEXT, size := 15) -> Label:
	var l := UITheme.label(text, size, col)
	g.add_child(l)
	return l


# =====================================================================
#  TABLET
# =====================================================================
func open_tablet(tab := 0, keep := false) -> void:
	_tab = tab
	var scroll_pos := 0
	if keep and current:
		var sc := current.find_child("PageScroll", true, false)
		if sc:
			scroll_pos = sc.scroll_vertical
	var v := _window("Tablette du directeur — Grand Hôtel Wobble", "tablet")
	var tabs := UITheme.hbox(v, 4)
	for i in TAB_NAMES.size():
		var idx := i
		var b := UITheme.button(TAB_NAMES[i], func(): open_tablet(idx))
		if i == _tab:
			b.add_theme_stylebox_override("normal", UITheme.box(UITheme.ACCENT, 6, 10, 6))
			b.add_theme_color_override("font_color", Color("#1b1b1b"))
		tabs.add_child(b)
	var sc := ScrollContainer.new()
	sc.name = "PageScroll"
	sc.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	v.add_child(sc)
	var p := VBoxContainer.new()
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	p.add_theme_constant_override("separation", 6)
	sc.add_child(p)
	match _tab:
		0: _page_dashboard(p)
		1: _page_rooms(p)
		2: _page_guests(p)
		3: _page_staff(p)
		4: _page_tasks(p)
		5: _page_prices(p)
		6: _page_stock(p)
		7: _page_finance(p)
		8: _page_journal(p)
	if keep:
		sc.set_deferred("scroll_vertical", scroll_pos)


# ------------------------------------------------------------------ dashboard
func _page_dashboard(p: VBoxContainer) -> void:
	var g := _grid(p, 4, 40)
	var kpis := [
		["Trésorerie", _m(Hotel.cash)], ["Résultat du jour", _m(Hotel.revenue_today() - Hotel.expenses_today())],
		["Recettes du jour", _m(Hotel.revenue_today())], ["Dépenses du jour", _m(Hotel.expenses_today())],
		["Taux d'occupation", "%d%% (%d/%d)" % [int(Hotel.occupancy() * 100), Hotel.occupied_count(), Hotel.unlocked_rooms().size()]],
		["Réputation", "%.2f ★ (%d avis)" % [Hotel.reputation, Hotel.reviews.size()]],
		["Prix moyen hier (ADR)", _m(float(Hotel.history[-1].adr)) if Hotel.history.size() > 0 else "—"],
		["RevPAR hier", _m(float(Hotel.history[-1].revpar)) if Hotel.history.size() > 0 else "—"],
		["Clients dans l'hôtel", str(Hotel.in_house_guests().size())], ["Arrivées encore attendues", str(Hotel.bookings_today().size())],
		["Réservations perdues (prix)", str(int(Hotel.stats.lost_price))], ["Réservations perdues (complet)", str(int(Hotel.stats.lost_capacity))],
		["Clients repartis (attente)", str(int(Hotel.stats.lost_waiting))], ["Pannes aujourd'hui", str(int(Hotel.stats.breakdowns))],
		["Attente moyenne ascenseur", "%.1f s" % world.elevator.avg_wait()], ["Dette bancaire", _m(Hotel.debt)],
	]
	for k in kpis:
		var box := VBoxContainer.new()
		box.add_child(UITheme.label(k[0], 13, UITheme.MUTED))
		box.add_child(UITheme.label(k[1], 20, Color.WHITE))
		g.add_child(box)
	var charts := UITheme.hbox(p, 12)
	var hist: Array = Hotel.history.slice(-14)
	var c1 := BarChart.new()
	c1.title = "Recettes / dépenses / résultat (14 jours)"
	c1.custom_minimum_size = Vector2(560, 220)
	c1.labels = hist.map(func(r): return "J%d" % int(r.day))
	c1.series = [{"name": "Recettes", "color": Color("#80ed99"), "values": hist.map(func(r): return float(r.revenue))},
		{"name": "Dépenses", "color": Color("#ff8fa3"), "values": hist.map(func(r): return float(r.expenses))},
		{"name": "Résultat", "color": Color("#ffd166"), "values": hist.map(func(r): return float(r.profit))}]
	charts.add_child(c1)
	var c2 := BarChart.new()
	c2.title = "Taux d'occupation"
	c2.percent = true
	c2.custom_minimum_size = Vector2(560, 220)
	c2.labels = c1.labels
	c2.series = [{"name": "Occupation", "color": Color("#4cc9f0"), "values": hist.map(func(r): return float(r.occupancy))}]
	charts.add_child(c2)
	UITheme.section(p, "État des chambres")
	var counts := {}
	for r in Hotel.rooms.values():
		var s := Hotel.room_light(r)
		counts[s] = int(counts.get(s, 0)) + 1
	var h := UITheme.hbox(p, 18)
	for s in ["ready", "occupied", "dnd", "dirty", "to_prepare", "locked"]:
		var chip := UITheme.label("■ %s : %d" % [STATE_NAMES[s], int(counts.get(s, 0))], 16, RoomNode.LIGHT_COLORS[s])
		h.add_child(chip)
	UITheme.section(p, "Alertes")
	for a in _alerts():
		var l := UITheme.label("• " + a, 15, Color("#ffd6a5"))
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		p.add_child(l)


func _alerts() -> Array:
	var out := []
	var counts := {}
	for t in Hotel.tasks:
		counts[t.type] = int(counts.get(t.type, 0)) + 1
	for role in GameData.roles:
		var waiting := 0
		for t in Hotel.tasks:
			if t.assignee == "" and Hotel.task_def(t).role == role:
				waiting += 1
		if waiting >= 3 and Hotel.staff_on_duty(role) == 0:
			out.append("%d tâches de %s en attente et personne en service : embauchez ou faites-les vous-même." % [waiting, GameData.roles[role].name])
	if Hotel.ready_rooms().is_empty() and not Hotel.bookings_today().is_empty():
		out.append("Aucune chambre prête alors que des clients arrivent : priorité au ménage et à la préparation !")
	if Hotel.clean_linen < 3:
		out.append("Presque plus de linge propre (%d parures) : lancez la laverie ou achetez du linge neuf (onglet Stocks)." % Hotel.clean_linen)
	for s in GameData.supplies:
		var d: Dictionary = GameData.supplies[s]
		if float(Hotel.stock[s]) <= float(d.threshold) and Hotel.incoming(s) <= 0 and float(d.threshold) > 0:
			out.append("Stock bas : %s (%d)." % [d.name, int(Hotel.stock[s])])
	if not Hotel.facilities.elevator.ok:
		out.append("L'ascenseur est en panne : tout le monde prend l'escalier, les clients râlent.")
	if Hotel.cash < 300:
		out.append("Trésorerie faible : pensez à un prêt (onglet Finances).")
	if Hotel.stats.lost_price > 3:
		out.append("%d clients ont trouvé vos prix trop élevés aujourd'hui (onglet Prix)." % int(Hotel.stats.lost_price))
	if Hotel.stats.lost_capacity > 3:
		out.append("%d réservations refusées faute de chambres : rénovez de nouvelles chambres !" % int(Hotel.stats.lost_capacity))
	for sid in Hotel.staff:
		if float(Hotel.staff[sid].morale) < 30:
			out.append("%s a le moral très bas (risque de démission)." % Hotel.staff[sid].name)
	if out.is_empty():
		out.append("Tout roule. Profitez-en pour décorer le lobby (B) ou investir.")
	return out


# ------------------------------------------------------------------ rooms
func _page_rooms(p: VBoxContainer) -> void:
	p.add_child(UITheme.label("Cliquez une chambre pour sa fiche (rénover, monter en gamme, ne pas déranger…).", 14, UITheme.MUTED))
	for f in range(int(GameData.building.floors) - 1, 0, -1):
		UITheme.section(p, GameData.floor_name(f))
		var row := UITheme.hbox(p, 6)
		var ids := Hotel.rooms.keys().filter(func(id): return int(Hotel.rooms[id].floor) == f)
		ids.sort()
		for rid in ids:
			var r: Dictionary = Hotel.rooms[rid]
			var st := Hotel.room_light(r)
			var txt := "%s\n%s\n%s" % [rid, GameData.room_tiers[r.tier].name, STATE_NAMES[st]]
			if r.guest != "" and Hotel.guests.has(r.guest):
				txt += "\n" + Hotel.guests[r.guest].name.split(" ")[0]
			var nb := Hotel.broken_items(r).size()
			if nb > 0:
				txt += "\n(!) %d panne(s)" % nb
			var id: String = rid
			var b := UITheme.button(txt, func(): open_room(id))
			b.custom_minimum_size = Vector2(132, 110)
			b.add_theme_stylebox_override("normal", UITheme.box(RoomNode.LIGHT_COLORS[st].darkened(0.45), 8, 6, 6))
			b.add_theme_stylebox_override("hover", UITheme.box(RoomNode.LIGHT_COLORS[st].darkened(0.25), 8, 6, 6))
			row.add_child(b)


func open_room(rid: String) -> void:
	var r: Dictionary = Hotel.rooms[rid]
	var v := _window("Chambre %s — %s (%s)" % [rid, GameData.room_tiers[r.tier].name, GameData.floor_name(int(r.floor))], "room", 760, 560)
	var p := _scroll(v)
	UITheme.kv(p, "État", STATE_NAMES[Hotel.room_light(r)], RoomNode.LIGHT_COLORS[Hotel.room_light(r)])
	UITheme.kv(p, "Prix de la nuit (catégorie)", _m(float(Hotel.prices[r.tier])))
	UITheme.kv(p, "Entretien quotidien", _m(float(GameData.room_tiers[r.tier].upkeep)))
	if r.guest != "" and Hotel.guests.has(r.guest):
		var g: Dictionary = Hotel.guests[r.guest]
		UITheme.kv(p, "Client", "%s (%s) — encore %d nuit(s) — satisfaction %d%%" % [g.name, GameData.guests[g.type].name, int(g.nights_left), int(g.sat)])
	var items := []
	for k in r["items"]:
		items.append("%s %s" % [GameData.room_items[k].name, "OK" if r["items"][k] else "EN PANNE"])
	UITheme.kv(p, "Équipements", ", ".join(items))
	var h := UITheme.hbox(p)
	if not r.unlocked:
		h.add_child(UITheme.button("Rénover et ouvrir (%s)" % _m(Hotel.renovate_cost(rid)), func(): _r(Hotel.request_renovate(rid)); open_room(rid)))
	else:
		var nt := Hotel._next_tier(r.tier)
		if nt != "":
			h.add_child(UITheme.button("Monter en gamme → %s (%s)" % [GameData.room_tiers[nt].name, _m(Hotel.upgrade_cost(rid))], func(): _r(Hotel.request_upgrade_room(rid)); open_room(rid)))
		if r.guest != "":
			h.add_child(UITheme.button("Ne pas déranger : %s" % ("OUI" if r.dnd else "NON"), func(): _r(Hotel.request_toggle_dnd(rid)); open_room(rid)))
	p.add_child(UITheme.button("Placer un repère GPS sur la chambre", func(): world.waypoint_key = "door:" + rid; close()))


# ------------------------------------------------------------------ guests
func _page_guests(p: VBoxContainer) -> void:
	UITheme.section(p, "Clients présents")
	var g := _grid(p, 6)
	for hd in ["Client", "Profil", "Chambre", "Nuits restantes", "Satisfaction", "Où ?"]:
		_cell(g, hd, UITheme.MUTED, 13)
	var where := {"at_desk": "à la réception", "to_room": "monte en chambre", "in_room": "en chambre", "away": "en ville", "returning": "revient",
		"cafe": "au café", "concierge": "conciergerie", "checkout_walk": "part (check-out)", "checkout_desk": "à la réception (départ)",
		"leaving": "s'en va", "arriving": "arrive", "going_out": "sort"}
	for gd in Hotel.in_house_guests():
		_cell(g, gd.name)
		_cell(g, GameData.guests[gd.type].name)
		_cell(g, gd.room if gd.room != "" else "—")
		_cell(g, str(int(gd.nights_left)))
		var sat := int(gd.sat)
		_cell(g, "%d%% %s" % [sat, "★".repeat(clamp(int(round(sat / 20.0)), 1, 5))], UITheme.GOOD if sat >= 70 else (Color("#ffd166") if sat >= 45 else UITheme.BAD))
		_cell(g, where.get(gd.state, gd.state))
	UITheme.section(p, "Arrivées attendues aujourd'hui")
	var bk := Hotel.bookings_today()
	bk.sort_custom(func(a, b): return float(a.arrival) < float(b.arrival))
	if bk.is_empty():
		p.add_child(UITheme.label("Aucune.", 14, UITheme.MUTED))
	for gd in bk:
		var hh := fmod(float(gd.arrival), 24.0)
		p.add_child(UITheme.label("%02dh%02d — %s (%s) — %s, %d nuit(s)" % [int(hh), int(fmod(hh, 1.0) * 60), gd.name, GameData.guests[gd.type].name, GameData.room_tiers[gd.tier].name, int(gd.nights)], 15))
	UITheme.section(p, "Derniers avis (réputation %.2f ★)" % Hotel.reputation)
	if Hotel.reviews.is_empty():
		p.add_child(UITheme.label("Pas encore d'avis : ils arrivent au départ des clients.", 14, UITheme.MUTED))
	for rv in Hotel.reviews.slice(0, 15):
		var l := UITheme.label("%s  %s (%s, ch. %s, jour %d) : « %s »" % ["★".repeat(int(rv.stars)) + "☆".repeat(5 - int(rv.stars)), rv.name, GameData.guests[rv.type].name, rv.room, int(rv.day), rv.text], 14, Color("#ffd166") if int(rv.stars) >= 4 else (UITheme.TEXT if int(rv.stars) == 3 else UITheme.BAD))
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		p.add_child(l)


# ------------------------------------------------------------------ staff
func _page_staff(p: VBoxContainer) -> void:
	UITheme.section(p, "Équipe (%d) — masse salariale %s/jour" % [Hotel.staff.size(), _m(_wages())])
	var g := _grid(p, 9, 14)
	for hd in ["Nom", "Métier", "Service", "Compétence", "Moral", "Énergie", "Salaire", "Tâches (jour/total)", "Actions"]:
		_cell(g, hd, UITheme.MUTED, 13)
	for sid in Hotel.staff:
		var st: Dictionary = Hotel.staff[sid]
		var on := Hotel.on_shift(st, Clock.hour())
		_cell(g, st.name + (" (malade)" if int(st.get("sick_until", 0)) >= Clock.day else ""), UITheme.TEXT if on else UITheme.MUTED, 14)
		_cell(g, GameData.roles[st.role].name, UITheme.TEXT, 14)
		var shift_btn := UITheme.button("%s %s" % [st.shift, "●" if on else "○"], func(): _r(Hotel.request_set_shift(sid, _next_shift(st.shift))))
		shift_btn.tooltip_text = "Cliquer pour changer : jour 7h-15h, soir 15h-23h, nuit 23h-7h"
		g.add_child(shift_btn)
		_cell(g, "%d%%%s" % [int(float(st.skill) * 100), (" " + ", ".join(st.traits)) if not st.traits.is_empty() else ""], UITheme.TEXT, 14)
		_cell(g, "%d%%" % int(st.morale), UITheme.GOOD if float(st.morale) >= 60 else (Color("#ffd166") if float(st.morale) >= 30 else UITheme.BAD), 14)
		_cell(g, "%d%%" % int(st.energy), UITheme.TEXT, 14)
		var wage := UITheme.hbox(g, 2)
		wage.add_child(UITheme.button("-", func(): _r(Hotel.request_wage(sid, -5))))
		wage.add_child(UITheme.label(" %s " % _m(float(st.wage)), 14))
		wage.add_child(UITheme.button("+", func(): _r(Hotel.request_wage(sid, 5))))
		_cell(g, "%d / %d" % [int(st.tasks_today), int(st.tasks_total)], UITheme.TEXT, 14)
		var act := UITheme.hbox(g, 2)
		act.add_child(UITheme.button("Prime 50$", func(): _r(Hotel.request_bonus(sid))))
		act.add_child(UITheme.button("Former 180$", func(): _r(Hotel.request_train(sid))))
		act.add_child(UITheme.button("Licencier", func(): _r(Hotel.request_fire(sid))))
	UITheme.section(p, "Recrutement (nouveaux candidats chaque jour)")
	for role in GameData.roles:
		var rd: Dictionary = GameData.roles[role]
		var on_duty := Hotel.staff_on_duty(role)
		var total := Hotel.staff.values().filter(func(s): return s.role == role).size()
		p.add_child(UITheme.label("%s — %s  (équipe : %d, en service : %d)" % [rd.name, rd.desc, total, on_duty], 15, UITheme.ACCENT))
		var list: Array = Hotel.candidates.get(role, [])
		for i in list.size():
			var c: Dictionary = list[i]
			var h := UITheme.hbox(p)
			var l := UITheme.label("     %s — compétence %d%%%s — %s/jour" % [c.name, int(float(c.skill) * 100), (" (" + ", ".join(c.traits) + ")") if not c.traits.is_empty() else "", _m(float(c.wage))], 14)
			l.custom_minimum_size.x = 560
			h.add_child(l)
			var idx := i
			var r: String = role
			for sh in ["jour", "soir", "nuit"]:
				var shift: String = sh
				h.add_child(UITheme.button("Embaucher (%s)" % shift, func(): _r(Hotel.request_hire(r, idx, shift))))


func _next_shift(s: String) -> String:
	return {"jour": "soir", "soir": "nuit", "nuit": "jour"}[s]


func _wages() -> float:
	var w := 0.0
	for sid in Hotel.staff:
		w += float(Hotel.staff[sid].wage)
	return w


# ------------------------------------------------------------------ tasks
func _page_tasks(p: VBoxContainer) -> void:
	var counts := {}
	for t in Hotel.tasks:
		counts[t.type] = int(counts.get(t.type, 0)) + 1
	var h := UITheme.hbox(p, 14)
	for k in counts:
		h.add_child(UITheme.label("%s : %d" % [GameData.tasks[k].label.split(" ")[0], counts[k]], 14, UITheme.ACCENT))
	var g := _grid(p, 6, 16)
	for hd in ["Tâche", "Lieu", "Métier", "Attente", "Pris en charge par", ""]:
		_cell(g, hd, UITheme.MUTED, 13)
	var list := Hotel.tasks.duplicate()
	list.sort_custom(func(a, b): return world._score(a) > world._score(b))
	for t in list:
		var why := Hotel.blocked_reason(t)
		_cell(g, Hotel.task_label(t), UITheme.BAD if why != "" else UITheme.TEXT, 14)
		_cell(g, world.task_place(t), UITheme.TEXT, 14)
		_cell(g, GameData.roles[Hotel.task_def(t).role].name, UITheme.TEXT, 14)
		_cell(g, "%d min%s" % [int((Hotel.now() - float(t.created)) * 60), (" — " + why) if why != "" else ""], UITheme.TEXT, 14)
		var who := "—"
		if t.assignee == Hotel.PLAYER:
			who = "VOUS"
		elif Hotel.staff.has(t.assignee):
			who = Hotel.staff[t.assignee].name
		_cell(g, who, UITheme.GOOD if who != "—" else UITheme.MUTED, 14)
		var tid := int(t.id)
		g.add_child(UITheme.button("Je m'en charge", func(): world.take_task(tid); close(), t.assignee != ""))


# ------------------------------------------------------------------ prices
func _page_prices(p: VBoxContainer) -> void:
	UITheme.section(p, "Prix des chambres (par nuit) — part des clients prêts à payer ce prix")
	var types := GameData.guests.keys()
	var g := _grid(p, 5 + types.size(), 12)
	for hd in ["Catégorie", "Votre prix", "", "Concurrent", "Chambres"]:
		_cell(g, hd, UITheme.MUTED, 13)
	for t in types:
		_cell(g, GameData.guests[t].name.split(" ")[0], UITheme.MUTED, 13)
	for tier in GameData.room_tiers:
		_cell(g, GameData.room_tiers[tier].name, UITheme.TEXT, 15)
		_cell(g, _m(float(Hotel.prices[tier])), UITheme.ACCENT, 17)
		var hb := UITheme.hbox(g, 2)
		var key: String = tier
		for dv in [-10, -1, 1, 10]:
			var d: float = dv
			hb.add_child(UITheme.button("%+d" % dv, func(): _r(Hotel.request_set_price(key, float(Hotel.prices[key]) + d))))
		_cell(g, _m(Hotel.reference_price(tier)), UITheme.TEXT, 14)
		_cell(g, "%d" % Hotel.unlocked_rooms().filter(func(r): return r.tier == key).size(), UITheme.TEXT, 14)
		for t in types:
			var wants: bool = tier in GameData.guests[t].tiers
			var acc := Hotel.acceptance(t, tier)
			_cell(g, ("%d%%" % int(acc * 100)) if wants else "—", UITheme.GOOD if acc > 0.7 else (Color("#ffd166") if acc > 0.35 else UITheme.BAD), 14)
	p.add_child(UITheme.label("Plus le prix est élevé, plus vous gagnez par nuit… mais moins de clients réservent, et les plus exigeants le notent dans leur avis.", 13, UITheme.MUTED))
	UITheme.section(p, "Café, room service et minibar")
	var g2 := _grid(p, 4, 18)
	for hd in ["Produit", "Prix", "", "Ingrédients"]:
		_cell(g2, hd, UITheme.MUTED, 13)
	for m in GameData.menu:
		var md: Dictionary = GameData.menu[m]
		_cell(g2, "%s (%s)" % [md.name, {"cafe": "café", "room": "room service", "minibar": "minibar"}[md.where]])
		_cell(g2, _m(float(Hotel.prices[m])), UITheme.ACCENT, 16)
		var hb2 := UITheme.hbox(g2, 2)
		var key2: String = m
		for dv in [-1.0, -0.5, 0.5, 1.0]:
			var d2: float = dv
			hb2.add_child(UITheme.button("%+.1f" % dv, func(): _r(Hotel.request_set_price(key2, float(Hotel.prices[key2]) + d2))))
		var needs := []
		for s in md.needs:
			needs.append("%s ×%d" % [GameData.supplies[s].name, int(md.needs[s])])
		_cell(g2, ", ".join(needs) if not needs.is_empty() else "—", UITheme.MUTED, 13)


# ------------------------------------------------------------------ stock
func _page_stock(p: VBoxContainer) -> void:
	UITheme.section(p, "Linge")
	UITheme.kv(p, "Parures propres", str(Hotel.clean_linen), UITheme.GOOD if Hotel.clean_linen >= 4 else UITheme.BAD)
	UITheme.kv(p, "Parures sales (à laver)", str(Hotel.dirty_linen))
	for wid in Hotel.washers:
		if not Hotel.facilities[wid].locked:
			UITheme.kv(p, GameData.facilities[wid].name, "%s — %s" % [Hotel.washers[wid].state, "OK" if Hotel.facilities[wid].ok else "EN PANNE"])
	var hl := UITheme.hbox(p)
	hl.add_child(UITheme.button("Acheter 10 parures neuves (60 $)", func(): _r(Hotel.request_buy_linen(10))))
	UITheme.section(p, "Fournitures")
	var auto := CheckButton.new()
	auto.text = "Réapprovisionnement automatique sous le seuil"
	auto.button_pressed = Hotel.auto_reorder
	auto.toggled.connect(func(on): Hotel.auto_reorder = on)
	p.add_child(auto)
	var g := _grid(p, 6, 18)
	for hd in ["Article", "En stock", "En livraison", "Seuil", "Prix unitaire", "Commander"]:
		_cell(g, hd, UITheme.MUTED, 13)
	for s in GameData.supplies:
		if s == "linge":
			continue
		var d: Dictionary = GameData.supplies[s]
		var q := float(Hotel.stock[s])
		_cell(g, d.name)
		_cell(g, str(int(q)), UITheme.BAD if q <= float(d.threshold) else UITheme.TEXT)
		_cell(g, str(int(Hotel.incoming(s))))
		_cell(g, str(int(d.threshold)))
		_cell(g, _m(float(d.price)))
		var hb := UITheme.hbox(g, 2)
		var sup: String = s
		for mult in [1, 3]:
			var qty: int = int(d.pack) * mult
			hb.add_child(UITheme.button("+%d (%s)" % [qty, _m(float(d.price) * qty)], func(): _r(Hotel.request_order(sup, qty))))


# ------------------------------------------------------------------ finance
func _page_finance(p: VBoxContainer) -> void:
	UITheme.section(p, "Comptes des 7 derniers jours")
	var hist: Array = Hotel.history.slice(-7)
	var cats := []
	for r in hist:
		for k in r.detail:
			if not k in cats:
				cats.append(k)
	for k in Hotel.today:
		if not k in cats:
			cats.append(k)
	cats.sort_custom(func(a, b): return a < b)
	var g := _grid(p, hist.size() + 2, 16)
	_cell(g, "Poste", UITheme.MUTED, 13)
	for r in hist:
		_cell(g, "Jour %d" % int(r.day), UITheme.MUTED, 13)
	_cell(g, "Aujourd'hui", UITheme.MUTED, 13)
	for c in cats:
		_cell(g, c, UITheme.TEXT, 14)
		for r in hist:
			var v := float(r.detail.get(c, 0.0))
			_cell(g, _m(v) if v != 0 else "", UITheme.GOOD if v > 0 else UITheme.BAD, 14)
		var tv := float(Hotel.today.get(c, 0.0))
		_cell(g, _m(tv) if tv != 0 else "", UITheme.GOOD if tv > 0 else UITheme.BAD, 14)
	_cell(g, "RÉSULTAT", UITheme.ACCENT, 15)
	for r in hist:
		_cell(g, _m(float(r.profit)), UITheme.GOOD if float(r.profit) >= 0 else UITheme.BAD, 15)
	_cell(g, _m(Hotel.revenue_today() - Hotel.expenses_today()), UITheme.ACCENT, 15)
	UITheme.section(p, "Banque (dette %s, intérêts %.1f%%/jour)" % [_m(Hotel.debt), float(GameData.bal("loan_interest_daily", 0.004)) * 100])
	var h := UITheme.hbox(p)
	h.add_child(UITheme.button("Emprunter 2 000 $", func(): _r(Hotel.request_loan(2000))))
	h.add_child(UITheme.button("Emprunter 5 000 $", func(): _r(Hotel.request_loan(5000))))
	h.add_child(UITheme.button("Rembourser 1 000 $", func(): _r(Hotel.request_repay(1000)), Hotel.debt <= 0))
	UITheme.section(p, "Investissements")
	for id in GameData.upgrades:
		var d: Dictionary = GameData.upgrades[id]
		var hh := UITheme.hbox(p)
		var l := UITheme.label("%s — %s" % [d.name, d.desc], 15, UITheme.GOOD if Hotel.upgrades.has(id) else UITheme.TEXT)
		l.custom_minimum_size.x = 760
		hh.add_child(l)
		var uid: String = id
		hh.add_child(UITheme.button("Acquis" if Hotel.upgrades.has(id) else "Acheter (%s)" % _m(float(d.cost)), func(): _r(Hotel.request_upgrade(uid)), Hotel.upgrades.has(id)))
	UITheme.section(p, "Marketing")
	p.add_child(UITheme.button("Campagne publicitaire 3 jours (+30 %% de demande) — %s" % _m(float(GameData.bal("marketing_cost", 300))), func(): _r(Hotel.request_marketing()), Clock.day <= Hotel.marketing_until))


# ------------------------------------------------------------------ journal
func _page_journal(p: VBoxContainer) -> void:
	if not Hotel.event.is_empty():
		UITheme.section(p, "Événement en cours")
		p.add_child(UITheme.label("%s — %s" % [Hotel.event.title, Hotel.event.text], 16, Color("#4cc9f0")))
	UITheme.section(p, "Journal de l'hôtel")
	for n in Hotel.news:
		var l := UITheme.label(n, 14)
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		p.add_child(l)
	UITheme.section(p, "Vos compétences (tâches réalisées vous-même)")
	for role in GameData.roles:
		var xp := int(Hotel.player_xp.get(role, 0))
		UITheme.kv(p, GameData.roles[role].name, "%d tâche(s) — vitesse ×%.2f" % [xp, Hotel.player_speed(role)])


# =====================================================================
#  OTHER WINDOWS
# =====================================================================
func open_elevator(from: int) -> void:
	var v := _window("Ascenseur — vous êtes au %s" % GameData.floor_name(from), "elevator", 420, 470)
	if not world.elevator.is_ok():
		v.add_child(UITheme.label("En panne : vous prendrez l'escalier de service (plus lent).", 14, UITheme.BAD))
	for f in range(int(GameData.building.floors) - 1, -1, -1):
		var target: int = f
		var b := UITheme.button("%s%s" % [GameData.floor_name(f), "  (vous êtes ici)" if f == from else ""], func(): close(); world.player_ride(target), f == from)
		b.custom_minimum_size.y = 52
		v.add_child(b)


## Player check-in: choose the room (an upgrade makes guests happy).
func open_checkin(t: Dictionary, done: Callable) -> void:
	var g: Dictionary = Hotel.guests.get(t.guest, {})
	var v := _window("Check-in : %s" % g.get("name", "?"), "checkin", 720, 520)
	v.add_child(UITheme.label("%s — souhaite : %s, %d nuit(s)." % [GameData.guests[g.type].name, GameData.room_tiers[g.tier].name, int(g.nights)], 16))
	var best := Hotel.best_room_for(g)
	var p := _scroll(v)
	var rooms := Hotel.ready_rooms()
	rooms.sort_custom(func(a, b): return a.id < b.id)
	for r in rooms:
		var diff := Hotel.tier_rank(r.tier) - Hotel.tier_rank(g.tier)
		var note := "surclassement (+satisfaction)" if diff > 0 else ("catégorie inférieure (client mécontent)" if diff < 0 else "conforme")
		var nb := Hotel.broken_items(r).size()
		if nb > 0:
			note += " — %d panne(s) !" % nb
		var rid: String = r.id
		var b := UITheme.button("Chambre %s — %s — %s%s" % [rid, GameData.room_tiers[r.tier].name, note, "  ★ conseillée" if rid == best else ""], func():
			t["room_choice"] = rid
			close()
			done.call())
		p.add_child(b)


func open_pause() -> void:
	var v := _window("Pause", "pause", 520, 520)
	var p := _scroll(v)
	p.add_child(UITheme.button("Reprendre", close))
	p.add_child(UITheme.button("Sauvegarder (F5)", func(): world.save_game()))
	p.add_child(UITheme.button("Charger la dernière sauvegarde (F9)", func(): close(); world.get_parent().load_game(), not SaveSystem.has_save()))
	p.add_child(UITheme.button("Aide (H)", open_help))
	for opt in [[0.0, "Pause du temps"], [1.0, "Vitesse normale"], [3.0, "Vitesse ×3"], [6.0, "Vitesse ×6"]]:
		var sc: float = opt[0]
		var b := UITheme.button(opt[1] + ("  ✓" if is_equal_approx(Clock.time_scale, sc) else ""), func(): Clock.time_scale = sc; open_pause())
		p.add_child(b)
	if Identity.provider == "local":
		var h := UITheme.hbox(p)
		var e := LineEdit.new()
		e.text = Identity.display_name(Identity.local_id())
		e.max_length = 20
		e.custom_minimum_size.x = 220
		h.add_child(e)
		h.add_child(UITheme.button("Changer de pseudo", func(): Identity.set_local_name(e.text); world.toast("Pseudo mis à jour.", "ok")))
	p.add_child(UITheme.button("Quitter (sauvegarde automatique)", func(): world.save_game(); get_tree().quit()))


func open_help() -> void:
	var v := _window("Aide — Grand Hôtel Wobble", "help", 900, 700)
	var p := _scroll(v)
	for line in [
		"BUT : faire tourner un hôtel de luxe sur 5 niveaux. Remplissez les chambres, gardez les clients satisfaits (avis → réputation → demande), gagnez de l'argent, rénovez, embauchez, investissez.",
		"DÉPLACEMENTS : ZQSD/WASD, souris = tourner la caméra, molette = zoom, Maj = courir. Les étages supérieurs sont masqués : vous voyez toujours votre étage.",
		"ASCENSEUR : E devant les portes, choisissez l'étage. Il est partagé avec les clients et le personnel. En panne → escalier de service, lent.",
		"TOUS LES MÉTIERS : approchez-vous d'un poste (réception, chambre, porte, machine, laverie, cuisine, atelier, flaque…) et appuyez sur E pour prendre la tâche, puis E à chaque étape (une flèche bleue vous guide). R = action secondaire, X = abandonner.",
		"LISTE À GAUCHE : les tâches les plus urgentes pour le métier choisi (J pour changer de métier ; « Directeur » = tout). 1 à 6 pour prendre une tâche.",
		"VOYANTS AU-DESSUS DES PORTES : vert = libre et prête, bleu = occupée, violet = ne pas déranger, orange = à nettoyer, jaune = à préparer, gris = à rénover, rouge clignotant = panne.",
		"CYCLE D'UNE CHAMBRE : client parti → ménage (valet/femme de chambre, linge sale) → préparation (gouvernante : linge propre, kit d'accueil, minibar) → prête.",
		"LINGE : le linge sale part à la laverie (lave-linge → pliage). Sans linge propre, impossible de préparer une chambre !",
		"PANNES : lampes, prises, télés, douches, clims, minibars, ascenseur, machine à café, lave-linge, cuisine. Il faut une pièce de l'atelier (stock) puis réparer sur place (mini-jeu).",
		"CLIENTS : affaires, touristes, couples, familles, routards, célébrités. Ils jugent l'attente, la propreté, les pannes, le prix, le café, le room service, la conciergerie, le bruit, le décor.",
		"TABLETTE (Tab) : tableau de bord, chambres, clients & avis, personnel (horaires jour/soir/nuit, salaires, primes, formation, recrutement), tâches, prix, stocks, finances & investissements, journal.",
		"DÉCORATION (B, au rez-de-chaussée) : le confort du lobby augmente la satisfaction ; la salle du personnel améliore le moral.",
		"F5 sauvegarder, F9 charger. Échap : pause (vitesse du temps ×3 / ×6).",
	]:
		var l := UITheme.label(line, 15)
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		p.add_child(l)
