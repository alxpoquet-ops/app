extends Node
## Authoritative economic simulation.
##
## Every change of money, stock or ownership goes through this node. Methods
## prefixed with `request_` are the *only* entry points a player (UI, gameplay
## scripts, and later network RPCs) may call: they validate the request
## (ownership, funds, cooldowns, bounds) before mutating state. In multiplayer,
## only the host/dedicated server executes them; clients send the request and
## receive the replicated result. In solo mode they run locally.
##
## Money conservation: all balances live in `accounts`. Money only moves through
## transfer(). The "external" (rest of the world: tourists, imports, energy,
## taxes) and "bank" (loans) accounts may go negative; the sum of all accounts is
## always 0, which tests assert. No company creates money out of nothing.

signal business_changed(biz_id: String)
signal business_added(biz_id: String)
signal ownership_changed(biz_id: String)
signal lot_changed(lot_id: String)
signal orders_changed
signal notify(text: String, kind: String)
signal live_customer(biz_id: String, customer: Dictionary)
signal day_report(day: int)

const EXTERNAL := "external"
const BANK := "bank"
const POPULATION := "population"
const HOLDING := "holding"   # "Groupe Horizon" — owner of AI companies and of unsold lots

## Financing flows: they move cash but are not revenue/expenses in the P&L.
const NON_PNL := ["init", "apport", "retrait", "prêt", "remboursement", "acquisition", "cession"]

const DEMAND_CURVE := {
	"cafe": [0, 0, 0, 0, 0, 0, 0.2, 1.3, 2.0, 1.6, 1.0, 0.8, 1.3, 1.4, 1.0, 0.9, 1.3, 1.1, 0.8, 0.6, 0.5, 0.4, 0, 0],
	"bakery": [0, 0, 0, 0, 0, 0.5, 1.5, 2.2, 1.6, 0.9, 0.8, 1.2, 1.4, 0.8, 0.6, 0.7, 1.2, 1.3, 1.0, 0.6, 0, 0, 0, 0],
}

const PROFILES := {
	"pressé":   {"w_price": 1.0, "w_quality": 0.6, "w_rep": 0.8, "w_comfort": 0.2, "w_dist": 2.0, "w_wait": 2.5},
	"gourmet":  {"w_price": 0.6, "w_quality": 2.5, "w_rep": 1.4, "w_comfort": 1.0, "w_dist": 0.8, "w_wait": 0.8},
	"économe":  {"w_price": 3.0, "w_quality": 0.5, "w_rep": 0.6, "w_comfort": 0.3, "w_dist": 1.2, "w_wait": 1.0},
	"touriste": {"w_price": 1.0, "w_quality": 1.0, "w_rep": 1.0, "w_comfort": 1.6, "w_dist": 0.5, "w_wait": 1.0},
}

var rng := RandomNumberGenerator.new()
var accounts := {}            # account_id -> float
var businesses := {}          # id -> Business
var lots := {}                # id -> {id, pos, rot, size, buy_price, rent_per_day, deposit, allowed, owner, tenant_biz}
var orders := []              # see _create_order
var market := {}              # good -> {ref_price, last_price, volume_today, volume_yesterday}
var candidates := {}          # biz_id -> [candidate employees]
var player_jobs := {}         # player_id -> {type, biz_id, order_id?}
var live_businesses := {}     # biz_id -> live queue length (set by world when a player is near)
var player_present := {}      # biz_id -> true when a player works inside (owner or employee)
var offer_cooldown := {}      # "player|biz" -> absolute hour when a new offer is allowed
var counter_offers := {}      # "player|biz" -> {price, expires}
var tx_log := []
var news := []                # recent economic events for the UI
var event := {}               # current random economic event
var energy_accum := {}        # biz_id -> energy cost accumulated today
var _next_order := 1
var _next_biz := 1


func _ready() -> void:
	rng.randomize()
	Clock.hour_passed.connect(_on_hour)
	Clock.day_passed.connect(_on_day)


# =====================================================================
#  WORLD CREATION
# =====================================================================
func new_world(seed_value: int = -1) -> void:
	if seed_value >= 0:
		rng.seed = seed_value
	accounts.clear()
	businesses.clear()
	lots.clear()
	orders.clear()
	market.clear()
	candidates.clear()
	player_jobs.clear()
	tx_log.clear()
	news.clear()
	event = {}
	offer_cooldown.clear()
	counter_offers.clear()
	accounts[EXTERNAL] = 0.0
	accounts[BANK] = 0.0
	accounts[POPULATION] = 0.0
	accounts[HOLDING] = 0.0
	transfer(EXTERNAL, POPULATION, float(GameData.bal("population_start_cash", 9000)), "init", "Épargne des habitants")
	transfer(EXTERNAL, HOLDING, 3000.0, "init", "Capital du groupe")
	for g in GameData.goods:
		var p := GameData.good_base_price(g)
		market[g] = {"ref_price": p, "last_price": p, "volume_today": 0.0, "volume_yesterday": 0.0}
	var layout: Dictionary = GameData.layout
	for entry in layout.get("businesses", []):
		var b := Business.new()
		b.id = entry.id
		b.type_id = entry.type
		b.name = entry.name
		b.color = b.def().get("color", "#e07a5f")
		b.pos = Vector2(entry.pos[0], entry.pos[1])
		b.rot = float(entry.get("rot", 0))
		b.level = int(entry.get("level", 1))
		b.reputation = 45.0 + rng.randf() * 15.0
		var pm := float(entry.get("price_mult", 1.0))
		for item in b.menu():
			b.sell_prices[item] = snappedf(float(b.menu()[item].base_price) * pm, 0.05)
		for g in b.def().get("outputs", []):
			b.sell_prices[g] = snappedf(GameData.good_base_price(g) * pm, 0.01)
		for e in entry.get("equipment", []):
			_add_equipment_entry(b, e[0], float(e[1]), float(e[2]), float(e[3]))
		for i in int(entry.get("staff", 1)):
			b.employees.append(_make_candidate(b, 0.85 + rng.randf() * 0.3))
		# starting stock: a day of inputs
		for g in b.def().get("inputs", []):
			b.stock[g] = 40.0
		for g in b.def().get("outputs", []):
			b.stock[g] = 60.0
		_setup_reorder_targets(b)
		accounts[b.account()] = 0.0
		businesses[b.id] = b
		transfer(EXTERNAL, b.account(), float(entry.get("cash", 600)), "init", "Capital de départ")
	for l in layout.get("lots", []):
		var lot: Dictionary = l.duplicate(true)
		lot["owner"] = HOLDING
		lot["tenant_biz"] = ""
		lots[lot.id] = lot
	_ensure_player_account(Identity.local_id())
	transfer(EXTERNAL, "player:" + Identity.local_id(), float(GameData.bal("player_start_cash", 350)), "init", "Économies de départ")
	for id in businesses:
		_refresh_candidates(businesses[id])


func _ensure_player_account(pid: String) -> void:
	if not accounts.has("player:" + pid):
		accounts["player:" + pid] = 0.0


func _setup_reorder_targets(b: Business) -> void:
	for g in b.def().get("inputs", []):
		if not b.reorder_target.has(g):
			b.reorder_target[g] = 110.0 if b.kind() == "retail" else 160.0


func _add_equipment_entry(b: Business, def_id: String, x: float, z: float, r: float) -> Dictionary:
	var d := GameData.equip(def_id)
	var e := {"uid": b.new_uid(), "def": def_id, "x": x, "z": z, "rot": r, "condition": float(d.get("start_condition", 100))}
	b.equipment.append(e)
	return e


func _make_candidate(b: Business, skill: float = -1.0) -> Dictionary:
	if skill < 0:
		skill = 0.6 + rng.randf() * 0.8
	var base_wage := float(b.def().get("base_wage", 30))
	return {"name": GameData.random_person_name(rng), "skill": snappedf(skill, 0.01),
		"wage": snappedf(base_wage * (0.6 + 0.5 * skill), 1.0), "hired_day": Clock.day}


func _refresh_candidates(b: Business) -> void:
	var list := []
	for i in 3:
		list.append(_make_candidate(b))
	candidates[b.id] = list


# =====================================================================
#  MONEY
# =====================================================================
func balance(acc: String) -> float:
	return float(accounts.get(acc, 0.0))


func player_cash(pid: String = "") -> float:
	if pid.is_empty():
		pid = Identity.local_id()
	return balance("player:" + pid)


func biz_cash(biz_id: String) -> float:
	return balance("biz:" + biz_id)


## Moves money. Returns false (and moves nothing) when the payer can't afford it.
## Only EXTERNAL and BANK may go negative, or a business with allow_overdraft
## (it then accumulates a bank loan automatically, see _cover_overdraft).
func transfer(from: String, to: String, amount: float, category: String, memo: String = "", allow_overdraft := false) -> bool:
	if amount < 0.0 or is_nan(amount):
		return false
	if amount == 0.0:
		return true
	if not accounts.has(from):
		accounts[from] = 0.0
	if not accounts.has(to):
		accounts[to] = 0.0
	var can_go_negative := from == EXTERNAL or from == BANK
	if not can_go_negative and accounts[from] + 1e-6 < amount:
		if allow_overdraft and from.begins_with("biz:"):
			_cover_overdraft(from.substr(4), amount - accounts[from])
		else:
			return false
	accounts[from] -= amount
	accounts[to] += amount
	if not (category in NON_PNL):
		if from.begins_with("biz:") and businesses.has(from.substr(4)):
			businesses[from.substr(4)].book(category, -amount)
		if to.begins_with("biz:") and businesses.has(to.substr(4)):
			businesses[to.substr(4)].book(category, amount)
	tx_log.append({"t": Clock.absolute_hours(), "from": from, "to": to, "amount": amount, "cat": category, "memo": memo})
	if tx_log.size() > 300:
		tx_log.pop_front()
	return true


## Automatic short-term bank loan so essential companies never "disappear".
func _cover_overdraft(biz_id: String, missing: float) -> void:
	var b: Business = businesses[biz_id]
	var amount: float = ceil(missing + 20.0)
	b.debt += amount
	accounts[BANK] -= amount
	accounts[b.account()] += amount
	b.book("prêt", 0.0)
	tx_log.append({"t": Clock.absolute_hours(), "from": BANK, "to": b.account(), "amount": amount, "cat": "prêt", "memo": "Découvert automatique"})


func total_money() -> float:
	var s := 0.0
	for a in accounts:
		s += float(accounts[a])
	return s


# =====================================================================
#  HOURLY SIMULATION
# =====================================================================
func _on_hour(day: int, hour: int) -> void:
	for id in businesses:
		var b: Business = businesses[id]
		b.hour_served = 0
		if b.is_open_at(hour):
			energy_accum[id] = float(energy_accum.get(id, 0.0)) + b.energy_per_hour() * float(GameData.bal("energy_price", 0.5))
			if b.def().has("recipe"):
				_produce(b)
	for cat in DEMAND_CURVE:
		_simulate_demand(cat, hour)
	_process_orders()
	for id in businesses:
		var b: Business = businesses[id]
		if b.is_ai() or b.manager_ai or b.auto_reorder:
			_auto_reorder(b)
	if hour == 12:
		_maybe_random_event(day)


func _produce(b: Business) -> void:
	var d := b.def()
	var recipe: Dictionary = d.recipe
	var batches := float(d.get("rate_per_worker", 5)) * b.staff_skill() * (1.0 + 0.5 * (b.level - 1))
	if event.get("type", "") == "harvest_boom" and recipe.inputs.is_empty():
		batches *= 1.5
	# inputs limit
	for g in recipe.inputs:
		batches = min(batches, floor(b.qty(g) / float(recipe.inputs[g])))
	# storage limit (AI also avoids flooding its own warehouse)
	var out_units := 0.0
	for g in recipe.outputs:
		out_units += float(recipe.outputs[g])
	var free: float = b.stock_capacity() - b.stock_total()
	if b.is_ai():
		for g in recipe.outputs:
			free = min(free, b.stock_capacity() * 0.6 - b.qty(g))
	batches = floor(min(batches, max(0.0, free) / max(out_units, 1.0)))
	if batches <= 0:
		return
	for g in recipe.inputs:
		b.add_stock(g, -batches * float(recipe.inputs[g]))
	for g in recipe.outputs:
		b.add_stock(g, batches * float(recipe.outputs[g]))
	energy_accum[b.id] = float(energy_accum.get(b.id, 0.0)) + batches * out_units * float(d.get("energy_per_unit", 0.05)) * float(GameData.bal("energy_price", 0.5))


func wealth_factor() -> float:
	var ref := float(GameData.bal("population_start_cash", 9000))
	return clamp(sqrt(max(balance(POPULATION), 0.0) / ref), 0.55, 1.35)


func _simulate_demand(category: String, hour: int) -> void:
	var curve: Array = DEMAND_CURVE[category]
	var total_w := 0.0
	for w in curve:
		total_w += w
	var per_day := float(GameData.bal(category + "_customers_per_day", 100))
	var expected: float = per_day * curve[hour] / total_w * wealth_factor()
	if event.get("type", "") == "festival":
		expected *= 1.4
	var count := int(floor(expected))
	if rng.randf() < expected - count:
		count += 1
	var tourist_share := float(GameData.bal("tourist_share", 0.18))
	for i in count:
		var profile: String = ["pressé", "gourmet", "économe", "pressé", "économe"][rng.randi() % 5]
		if rng.randf() < tourist_share:
			profile = "touriste"
		var origin := Vector2(rng.randf_range(-60, 70), rng.randf_range(-10, 60))
		var c := {"profile": profile, "origin": origin, "category": category,
			"payer": EXTERNAL if profile == "touriste" else POPULATION}
		_route_customer(c, hour)


func _choose_item(menu: Dictionary) -> String:
	var r := rng.randf()
	var acc := 0.0
	for item in menu:
		acc += float(menu[item].get("weight", 1.0))
		if r <= acc:
			return item
	return menu.keys()[0]


## Customer choice model: utility per open company of the category.
func utility(b: Business, item: String, c: Dictionary, hour: int) -> float:
	var w: Dictionary = PROFILES[c.profile]
	var base := float(b.menu()[item].base_price)
	var price_idx := b.effective_price(item, Clock.day) / base
	var dist: float = (b.pos - c.origin).length()
	var queue := float(live_businesses.get(b.id, 0)) if live_businesses.has(b.id) else float(b.hour_served) * 0.25
	var u := 0.0
	u -= w.w_price * (price_idx - 1.0) * 2.0
	u += w.w_quality * (b.quality() - 1.0) * 2.0
	u += w.w_rep * (b.reputation - 50.0) / 35.0
	u += w.w_comfort * b.comfort_score() / 20.0
	u -= w.w_dist * dist / 60.0
	u -= w.w_wait * queue / 3.0
	if Clock.day <= b.ad_until_day:
		u += 0.6
	if b.loyalty:
		u += 0.25
	return u + rng.randf_range(-0.5, 0.5)


func _route_customer(c: Dictionary, hour: int) -> void:
	var best: Business = null
	var best_u := -INF
	var best_item := ""
	var item := ""
	for id in businesses:
		var b: Business = businesses[id]
		if b.def().get("demand_category", "") != c.category or not b.is_open_at(hour):
			continue
		if item == "" or not b.menu().has(item):
			item = _choose_item(b.menu())
		var u := utility(b, item, c, hour)
		if u > best_u:
			best_u = u
			best = b
			best_item = item
	if best == null:
		return
	if best_u < -3.0:
		return  # too expensive / too far: the customer stays home (demand elasticity)
	c["item"] = best_item
	c["biz_id"] = best.id
	if live_businesses.has(best.id):
		live_customer.emit(best.id, c)   # a visible NPC will walk in
		return
	_serve_abstract(best, c)


func _serve_abstract(b: Business, c: Dictionary) -> void:
	var cap := b.service_capacity_per_hour(player_present.has(b.id))
	if b.hour_served >= int(cap) + (1 if rng.randf() < cap - floor(cap) else 0):
		b.lost_today += 1
		b.lost_capacity_today += 1
		b.reputation = max(0.0, b.reputation - 0.15)
		return
	var item: String = c.item
	if b.menu()[item].get("machine", false) and b.machines().is_empty():
		b.lost_today += 1
		return
	if not b.menu()[item].get("machine", false) and b.type_id == "cafe" and not b.has_display():
		b.lost_today += 1
		return
	if not _has_ingredients(b, item):
		b.lost_today += 1
		b.reputation = max(0.0, b.reputation - 0.3)
		return
	b.hour_served += 1
	var q := b.quality()
	complete_sale(b.id, item, q, c.get("payer", POPULATION), 0.0)


func _has_ingredients(b: Business, item: String) -> bool:
	var needs: Dictionary = b.menu()[item].needs
	for g in needs:
		if b.qty(g) < float(needs[g]):
			return false
	return true


## Final step of every retail sale (abstract or live). Returns paid amount (0 if failed).
func complete_sale(biz_id: String, item: String, q: float, payer: String, tip: float) -> float:
	var b: Business = businesses.get(biz_id)
	if b == null or not _has_ingredients(b, item):
		return 0.0
	var price := b.effective_price(item, Clock.day)
	if not transfer(payer, b.account(), price, "ventes", item):
		return 0.0
	if tip > 0.0:
		transfer(payer, b.account(), tip, "pourboires", item)
	var needs: Dictionary = b.menu()[item].needs
	for g in needs:
		b.add_stock(g, -float(needs[g]))
	# machine wear
	if b.menu()[item].get("machine", false):
		var ms := b.machines()
		if not ms.is_empty():
			var m: Dictionary = ms[rng.randi() % ms.size()]
			m.condition = max(0.0, float(m.condition) - float(GameData.equip(m.def).get("wear_per_use", 0.5)) * 0.5)
	b.served_today += 1
	var price_idx := price / float(b.menu()[item].base_price)
	var satisfaction: float = clamp(0.6 + (q - 1.0) * 0.8 - (price_idx - 1.0) * 0.6 + b.comfort_score() / 100.0, 0.0, 1.0)
	# Reputation tracks recent satisfaction (no snowballing to 100 = no permanent monopoly).
	b.reputation = clamp(lerp(b.reputation, satisfaction * 100.0, 0.03), 0.0, 100.0)
	return price + tip


func record_lost_customer(biz_id: String, reason: String) -> void:
	var b: Business = businesses.get(biz_id)
	if b == null:
		return
	b.lost_today += 1
	b.reputation = max(0.0, b.reputation - (0.4 if reason == "attente" else 0.25))


# =====================================================================
#  ORDERS & LOGISTICS
# =====================================================================
## Supplier candidates for a good, cheapest first (price incl. delivery estimate).
func suppliers_for(good: String, buyer: Business, qty: float) -> Array:
	var out := []
	for id in businesses:
		var s: Business = businesses[id]
		if s == buyer or not (good in s.def().get("outputs", [])):
			continue
		var avail := s.qty(good)
		if s.is_retail():
			avail -= 20.0   # keep some for own shop
		if avail < 1.0:
			continue
		var fee := delivery_fee(s.pos, buyer.pos, min(qty, avail))
		out.append({"id": s.id, "name": s.name, "price": s.price_of(good), "available": floor(avail), "fee": fee,
			"owner": s.owner_id})
	out.sort_custom(func(a, b): return a.price + a.fee / max(qty, 1.0) < b.price + b.fee / max(qty, 1.0))
	out.append({"id": "port", "name": "Import (Port)", "price": snappedf(GameData.good_base_price(good) * float(GameData.bal("import_markup", 1.6)), 0.01),
		"available": 9999, "fee": delivery_fee(port_pos(), buyer.pos, qty), "owner": ""})
	return out


func port_pos() -> Vector2:
	var p: Array = GameData.layout.get("port", {}).get("pos", [0, 150])
	return Vector2(p[0], p[1])


func delivery_fee(a: Vector2, b: Vector2, qty: float) -> float:
	return snappedf(float(GameData.bal("delivery_base_fee", 6)) + qty * float(GameData.bal("delivery_fee_per_unit", 0.12))
		+ a.distance_to(b) * float(GameData.bal("delivery_fee_per_meter", 0.04)), 0.1)


func incoming_qty(buyer_id: String, good: String) -> float:
	var q := 0.0
	for o in orders:
		if o.buyer == buyer_id and o.good == good and o.status != "delivered":
			q += float(o.qty)
	return q


## Creates a purchase order. The buyer pays goods + delivery up-front (escrow);
## seller is paid on delivery. Goods leave the seller's stock immediately.
func _create_order(buyer: Business, supplier_id: String, good: String, qty: float) -> Dictionary:
	qty = floor(qty)
	if qty < 5:
		return {}
	var price := 0.0
	var from_pos := port_pos()
	var seller_name := "Port (import)"
	if supplier_id == "port":
		price = GameData.good_base_price(good) * float(GameData.bal("import_markup", 1.6))
	else:
		var s: Business = businesses.get(supplier_id)
		if s == null:
			return {}
		qty = min(qty, floor(s.qty(good) - (20.0 if s.is_retail() else 0.0)))
		if qty < 5:
			return {}
		price = s.price_of(good)
		from_pos = s.pos
		seller_name = s.name
	var fee := delivery_fee(from_pos, buyer.pos, qty)
	var total := price * qty + fee
	if biz_cash(buyer.id) < total:
		# buy what we can afford
		qty = floor((biz_cash(buyer.id) - fee) / price)
		if qty < 5:
			return {}
		total = price * qty + fee
	if not transfer(buyer.account(), "escrow", total, "achats", "Commande %s" % good):
		return {}
	if supplier_id != "port":
		businesses[supplier_id].add_stock(good, -qty)
	var o := {"id": _next_order, "buyer": buyer.id, "seller": supplier_id, "seller_name": seller_name,
		"buyer_name": buyer.name, "good": good, "qty": qty, "unit_price": price, "fee": fee,
		"from": [from_pos.x, from_pos.y], "to": [buyer.pos.x, buyer.pos.y],
		"created": Clock.absolute_hours(), "due": Clock.absolute_hours() + float(GameData.bal("ai_delivery_hours", 3)),
		"status": "open", "carrier": "", "taken_at": 0.0}
	_next_order += 1
	orders.append(o)
	if supplier_id != "port":
		market[good].volume_today += qty
		market[good].last_price = price
		market[good].ref_price = lerp(float(market[good].ref_price), price, 0.15)
	orders_changed.emit()
	return o


func _process_orders() -> void:
	var now := Clock.absolute_hours()
	var changed := false
	for o in orders.duplicate():
		if o.status == "open" and now >= o.due:
			_deliver(o, "")
			changed = true
		elif o.status == "taken" and now >= float(o.taken_at) + float(GameData.bal("player_job_timeout_hours", 10)):
			var pid: String = o.carrier
			o.status = "open"
			o.carrier = ""
			o.due = now + 1.0
			player_jobs.erase(pid)
			notify.emit("Livraison #%d annulée : délai dépassé." % o.id, "warn")
			changed = true
	if changed:
		orders_changed.emit()


## Delivery completed: escrow pays the seller and the carrier, buyer gets goods.
func _deliver(o: Dictionary, carrier_player: String) -> void:
	var goods_value := float(o.unit_price) * float(o.qty)
	var seller_acc := EXTERNAL if o.seller == "port" else "biz:" + str(o.seller)
	transfer("escrow", seller_acc, goods_value, "ventes B2B", "Commande #%d" % o.id)
	var carrier_acc := "player:" + carrier_player if carrier_player != "" else POPULATION
	transfer("escrow", carrier_acc, float(o.fee), "transport", "Livraison #%d" % o.id)
	var buyer: Business = businesses.get(o.buyer)
	if buyer:
		buyer.add_stock(o.good, float(o.qty))
		business_changed.emit(buyer.id)
	o.status = "delivered"
	orders.erase(o)


func _auto_reorder(b: Business) -> void:
	if b.kind() == "producer" and BusinessAI._output_fill(b) > 0.65:
		return   # warehouse full of finished goods: don't buy more inputs
	for g in b.def().get("inputs", []):
		var target := float(b.reorder_target.get(g, 110.0))
		var have := b.qty(g) + incoming_qty(b.id, g)
		if have >= target * 0.5:
			continue
		var need := target - have
		var sup := suppliers_for(g, b, need)
		for s in sup:
			# Prefer local suppliers; import only if no local stock at all.
			if s.id == "port" and sup.size() > 1:
				continue
			var q: float = min(need, float(s.available))
			if q < 5.0:
				continue
			if _create_order(b, s.id, g, q).size() > 0:
				need -= q
			if need < 5:
				break
		if need >= 5 and sup.size() > 1 and sup[0].id != "port":
			pass   # local suppliers short: wait, unless critically empty
		if need >= 5 and b.qty(g) < target * 0.15:
			_create_order(b, "port", g, need)


# =====================================================================
#  DAILY SIMULATION
# =====================================================================
func _on_day(day: int) -> void:
	for id in businesses:
		var b: Business = businesses[id]
		# Energy
		transfer(b.account(), EXTERNAL, float(energy_accum.get(id, 0.0)), "énergie", "Facture énergie", true)
		# Wages go to the town's households (AI employees live in town)
		for e in b.employees:
			transfer(b.account(), POPULATION, float(e.wage), "salaires", e.name, true)
		# Rent
		if b.rented and b.rent_per_day > 0.0:
			var lot: Dictionary = lots.get(b.lot_id, {})
			transfer(b.account(), "player:" + lot.owner if lot.get("owner", HOLDING) != HOLDING else HOLDING, b.rent_per_day, "loyer", "Loyer", true)
		# Equipment maintenance
		var maint := 0.0
		for eq in b.equipment:
			maint += float(GameData.equip(eq.def).get("maintenance", 0.0))
		transfer(b.account(), EXTERNAL, maint, "entretien", "Maintenance", true)
		# Automation
		if b.manager_ai and not b.is_ai():
			transfer(b.account(), EXTERNAL, float(GameData.bal("manager_ai_cost_per_day", 35)), "gérant IA", "Gérant automatique", true)
		# Loan interest
		if b.debt > 0:
			transfer(b.account(), BANK, b.debt * float(GameData.bal("loan_interest_daily", 0.004)), "intérêts", "Intérêts", true)
		# Profit tax
		var profit := b.revenue_today() - b.expenses_today()
		if profit > 0:
			transfer(b.account(), EXTERNAL, profit * float(GameData.bal("profit_tax_rate", 0.1)), "impôts", "Impôt sur les bénéfices", true)
		b.close_day(day)
		if b.is_ai() or b.manager_ai:
			BusinessAI.daily(self, b)
		elif b.auto_reorder:
			BusinessAI.repay_debt(self, b)
		_refresh_candidates(b)
		business_changed.emit(id)
	energy_accum.clear()
	for g in market:
		market[g].volume_yesterday = market[g].volume_today
		market[g].volume_today = 0.0
	# Households: outside income (pensions, jobs out of town)
	transfer(EXTERNAL, POPULATION, float(GameData.bal("population_external_income_per_day", 260)), "revenus", "Revenus extérieurs")
	# Holding redistributes excess cash as dividends to households
	var thr := float(GameData.bal("holding_dividend_threshold", 6000))
	if balance(HOLDING) > thr:
		transfer(HOLDING, POPULATION, (balance(HOLDING) - thr) * 0.5, "dividendes", "Dividendes")
	BusinessAI.holding_daily(self)
	if event.get("until", 0) < day:
		event = {}
	day_report.emit(day)


func _maybe_random_event(day: int) -> void:
	if not event.is_empty() or rng.randf() > 0.25:
		return
	var events := [
		{"type": "festival", "title": "Festival du village !", "text": "La foule afflue : +40% de clients pendant 2 jours."},
		{"type": "harvest_boom", "title": "Récolte exceptionnelle", "text": "Les fermes produisent +50% pendant 2 jours."},
		{"type": "coffee_shortage", "title": "Pénurie mondiale de café", "text": "Le café importé coûte bien plus cher."},
	]
	event = events[rng.randi() % events.size()].duplicate()
	event["until"] = day + 1
	_add_news(event.title + " — " + event.text)
	notify.emit(event.title + " " + event.text, "event")


func _add_news(t: String) -> void:
	news.push_front("[%s] %s" % [Clock.time_string(), t])
	if news.size() > 30:
		news.pop_back()


# =====================================================================
#  VALUATION
# =====================================================================
func valuation(b: Business) -> float:
	var v := biz_cash(b.id) - b.debt
	for e in b.equipment:
		v += float(GameData.equip(e.def).get("price", 0)) * 0.55 * float(e.condition) / 100.0
	for g in b.stock:
		v += b.qty(g) * float(market.get(g, {}).get("ref_price", GameData.good_base_price(g))) * 0.8
	if not b.rented:
		var lot: Dictionary = lots.get(b.lot_id, {})
		v += float(lot.get("buy_price", 1500.0 + 400.0 * b.level))
	v += max(0.0, b.avg_profit(7)) * 25.0
	v += (b.reputation - 50.0) * 8.0
	v += b.employees.size() * 40.0
	return max(250.0, snappedf(v, 10.0))


# =====================================================================
#  PLAYER REQUESTS (validated entry points)
# =====================================================================
func _owns(pid: String, b: Business) -> bool:
	return b != null and b.owner_id == pid


func _fail(msg: String) -> Dictionary:
	return {"ok": false, "msg": msg}


func _ok(msg: String, extra := {}) -> Dictionary:
	var d := {"ok": true, "msg": msg}
	d.merge(extra)
	return d


func owned_businesses(pid: String) -> Array:
	var out := []
	for id in businesses:
		if businesses[id].owner_id == pid:
			out.append(businesses[id])
	return out


## Create a company on a lot, renting or buying the land.
func request_found_business(pid: String, lot_id: String, type_id: String, biz_name: String, color_hex: String, buy_land: bool) -> Dictionary:
	var lot: Dictionary = lots.get(lot_id, {})
	if lot.is_empty():
		return _fail("Terrain inconnu.")
	if lot.tenant_biz != "":
		return _fail("Ce terrain est déjà occupé.")
	if not (type_id in lot.get("allowed", [])):
		return _fail("Ce type d'entreprise n'est pas autorisé ici.")
	biz_name = biz_name.strip_edges().substr(0, 28)
	if biz_name.length() < 2:
		return _fail("Nom d'entreprise trop court.")
	var build := float(GameData.btype(type_id).get("build_cost", 600))
	var land := float(lot.buy_price) if buy_land else float(lot.deposit)
	var cost := build + land
	if player_cash(pid) < cost:
		return _fail("Il vous faut %s (construction %s + %s)." % [money(cost), money(build), ("terrain " if buy_land else "caution ") + money(land)])
	transfer("player:" + pid, EXTERNAL, build, "construction", "Construction " + biz_name)
	transfer("player:" + pid, HOLDING, land, "immobilier", ("Achat terrain " if buy_land else "Caution ") + lot_id)
	var b := Business.new()
	b.id = "biz_%d_%d" % [Clock.day, _next_biz]
	_next_biz += 1
	b.type_id = type_id
	b.name = biz_name
	b.owner_id = pid
	b.color = color_hex
	b.pos = Vector2(lot.pos[0], lot.pos[1])
	b.rot = float(lot.get("rot", 0))
	b.lot_id = lot_id
	b.rented = not buy_land
	b.rent_per_day = float(lot.rent_per_day) if not buy_land else 0.0
	b.reputation = 50.0
	b.auto_reorder = true
	for item in b.menu():
		b.sell_prices[item] = float(b.menu()[item].base_price)
	_setup_reorder_targets(b)
	for g in b.reorder_target:
		b.reorder_target[g] = 50.0
	accounts[b.account()] = 0.0
	businesses[b.id] = b
	lot.tenant_biz = b.id
	if buy_land:
		lot.owner = pid
	_refresh_candidates(b)
	_add_news("%s ouvre « %s »." % [Identity.display_name(pid), biz_name])
	business_added.emit(b.id)
	lot_changed.emit(lot_id)
	return _ok("« %s » est construit ! Équipez-le (touche B à l'intérieur) et approvisionnez-le." % biz_name, {"biz_id": b.id})


func request_deposit(pid: String, biz_id: String, amount: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	if amount <= 0 or not transfer("player:" + pid, b.account(), amount, "apport", "Apport du propriétaire"):
		return _fail("Fonds personnels insuffisants.")
	business_changed.emit(biz_id)
	return _ok("Apport de %s effectué." % money(amount))


func request_withdraw(pid: String, biz_id: String, amount: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	if amount <= 0 or not transfer(b.account(), "player:" + pid, amount, "retrait", "Retrait du propriétaire"):
		return _fail("Trésorerie de l'entreprise insuffisante.")
	business_changed.emit(biz_id)
	return _ok("Retrait de %s effectué." % money(amount))


func request_set_price(pid: String, biz_id: String, item: String, price: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	var base := float(b.menu()[item].base_price) if b.menu().has(item) else GameData.good_base_price(item)
	price = clamp(snappedf(price, 0.05), base * 0.3, base * 4.0)
	b.sell_prices[item] = price
	business_changed.emit(biz_id)
	return _ok("Prix mis à jour : %s" % money(price))


func request_buy_equipment(pid: String, biz_id: String, def_id: String, x: float, z: float, r: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	var d := GameData.equip(def_id)
	if d.is_empty():
		return _fail("Équipement inconnu.")
	if b.equipment.size() >= 40:
		return _fail("Plus de place.")
	var half: Vector2 = Vector2(GameData.btype(b.type_id).size[0], GameData.btype(b.type_id).size[1]) * 0.5 - Vector2(0.5, 0.5)
	if abs(x) > half.x or abs(z) > half.y:
		return _fail("Hors du bâtiment.")
	if not transfer(b.account(), EXTERNAL, float(d.price), "équipement", d.name):
		return _fail("Trésorerie insuffisante (%s). Faites un apport dans l'onglet Finances." % money(float(d.price)))
	var e := _add_equipment_entry(b, def_id, x, z, r)
	business_changed.emit(biz_id)
	return _ok("%s installé(e)." % d.name, {"uid": e.uid})


func request_move_equipment(pid: String, biz_id: String, uid: int, x: float, z: float, r: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	for e in b.equipment:
		if int(e.uid) == uid:
			e.x = x
			e.z = z
			e.rot = r
			business_changed.emit(biz_id)
			return _ok("Déplacé.")
	return _fail("Objet introuvable.")


func request_sell_equipment(pid: String, biz_id: String, uid: int) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	for e in b.equipment:
		if int(e.uid) == uid:
			var d := GameData.equip(e.def)
			var refund := float(d.price) * 0.4 * float(e.condition) / 100.0
			b.equipment.erase(e)
			transfer(EXTERNAL, b.account(), refund, "revente matériel", d.name)
			business_changed.emit(biz_id)
			return _ok("Revendu pour %s." % money(refund))
	return _fail("Objet introuvable.")


func repair_cost(e: Dictionary) -> float:
	return snappedf(float(GameData.equip(e.def).get("price", 0)) * 0.25 * (100.0 - float(e.condition)) / 100.0, 1.0)


func request_repair(pid: String, biz_id: String, uid: int, by_hand := false) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	for e in b.equipment:
		if int(e.uid) == uid:
			# Repairing by hand (gameplay) costs only spare parts (40%).
			var cost := repair_cost(e) * (0.4 if by_hand else 1.0)
			if not transfer(b.account(), EXTERNAL, cost, "réparations", "Réparation"):
				return _fail("Trésorerie insuffisante (%s)." % money(cost))
			e.condition = 100.0
			business_changed.emit(biz_id)
			return _ok("Réparé pour %s." % money(cost))
	return _fail("Objet introuvable.")


func request_hire(pid: String, biz_id: String, idx: int) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	var list: Array = candidates.get(biz_id, [])
	if idx < 0 or idx >= list.size():
		return _fail("Candidat introuvable.")
	if b.employees.size() >= int(b.def().get("max_staff", 4)):
		return _fail("Effectif maximum atteint.")
	var c: Dictionary = list[idx]
	c.hired_day = Clock.day
	b.employees.append(c)
	list.remove_at(idx)
	business_changed.emit(biz_id)
	return _ok("%s est embauché(e) (%s/jour)." % [c.name, money(float(c.wage))])


func request_fire(pid: String, biz_id: String, idx: int) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	if idx < 0 or idx >= b.employees.size():
		return _fail("Employé introuvable.")
	var e: Dictionary = b.employees[idx]
	transfer(b.account(), POPULATION, float(e.wage), "indemnités", "Indemnité " + e.name, true)
	b.employees.remove_at(idx)
	business_changed.emit(biz_id)
	return _ok("%s a quitté l'entreprise (indemnité d'un jour)." % e.name)


func request_order(pid: String, biz_id: String, good: String, qty: float, supplier_id: String) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	if not (good in b.def().get("inputs", [])):
		return _fail("Cette entreprise n'utilise pas ce produit.")
	if b.stock_total() + incoming_qty(b.id, good) + qty > b.stock_capacity():
		return _fail("Capacité de stockage insuffisante.")
	var o := _create_order(b, supplier_id, good, qty)
	if o.is_empty():
		return _fail("Commande impossible (stock fournisseur ou trésorerie insuffisants).")
	business_changed.emit(biz_id)
	return _ok("Commande #%d : %d × %s de %s (livraison %s)." % [o.id, o.qty, GameData.good_name(good), o.seller_name, money(o.fee)])


func request_export(pid: String, biz_id: String, good: String, qty: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	qty = floor(min(qty, b.qty(good)))
	if qty < 1:
		return _fail("Rien à vendre.")
	var price := GameData.good_base_price(good) * float(GameData.bal("export_discount", 0.55))
	b.add_stock(good, -qty)
	transfer(EXTERNAL, b.account(), price * qty, "export", "Export " + good)
	business_changed.emit(biz_id)
	return _ok("%d × %s exportés pour %s." % [qty, GameData.good_name(good), money(price * qty)])


func request_set_reorder(pid: String, biz_id: String, good: String, target: float, enabled: bool) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	b.auto_reorder = enabled
	if good != "":
		b.reorder_target[good] = clamp(target, 0.0, float(b.stock_capacity()) * 0.5)
	business_changed.emit(biz_id)
	return _ok("Réapprovisionnement mis à jour.")


func request_toggle(pid: String, biz_id: String, what: String, value: bool) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	match what:
		"open": b.open = value
		"manager_ai": b.manager_ai = value
		"loyalty":
			if value and not b.loyalty and not transfer(b.account(), EXTERNAL, 120.0, "marketing", "Cartes de fidélité"):
				return _fail("Il faut 120 $ pour lancer le programme de fidélité.")
			b.loyalty = value
	business_changed.emit(biz_id)
	return _ok("Paramètre mis à jour.")


func request_marketing(pid: String, biz_id: String, kind: String) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	if kind == "ad":
		if not transfer(b.account(), EXTERNAL, 90.0, "marketing", "Campagne d'affichage"):
			return _fail("Il faut 90 $ dans la trésorerie.")
		b.ad_until_day = Clock.day + 2
		return _ok("Campagne d'affichage lancée pour 3 jours.")
	if kind == "promo":
		b.promo_until_day = Clock.day + 1
		b.promo_discount = 0.2
		return _ok("Promotion -20% pendant 2 jours.")
	return _fail("?")


func request_upgrade(pid: String, biz_id: String) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	if b.level >= 5:
		return _fail("Niveau maximum.")
	var cost := upgrade_cost(b)
	if not transfer(b.account(), EXTERNAL, cost, "investissement", "Agrandissement"):
		return _fail("Il faut %s dans la trésorerie." % money(cost))
	b.level += 1
	business_changed.emit(biz_id)
	return _ok("Agrandissement réalisé : niveau %d." % b.level)


func upgrade_cost(b: Business) -> float:
	return 500.0 * b.level


func request_loan(pid: String, biz_id: String, amount: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	var limit: float = max(300.0, valuation(b) * 0.5) - b.debt
	if amount > limit:
		return _fail("La banque refuse : plafond restant %s." % money(max(limit, 0.0)))
	transfer(BANK, b.account(), amount, "prêt", "Prêt bancaire")
	b.debt += amount
	business_changed.emit(biz_id)
	return _ok("Prêt de %s accordé (%.1f%%/jour)." % [money(amount), float(GameData.bal("loan_interest_daily", 0.004)) * 100.0])


func request_repay(pid: String, biz_id: String, amount: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	amount = min(amount, b.debt)
	if amount <= 0 or not transfer(b.account(), BANK, amount, "remboursement", "Remboursement"):
		return _fail("Trésorerie insuffisante.")
	b.debt -= amount
	business_changed.emit(biz_id)
	return _ok("Remboursé %s." % money(amount))


func request_rename(pid: String, biz_id: String, new_name: String, color_hex: String) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	new_name = new_name.strip_edges().substr(0, 28)
	if new_name.length() >= 2:
		b.name = new_name
	if color_hex != "":
		b.color = color_hex
	business_changed.emit(biz_id)
	return _ok("Enseigne mise à jour.")


## Acquisition offer. AI companies answer with accept / counter / refuse.
func request_offer(pid: String, biz_id: String, offer: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if b == null:
		return _fail("Entreprise inconnue.")
	if b.owner_id == pid:
		return _fail("Vous possédez déjà cette entreprise.")
	if not b.is_ai():
		if not b.for_sale:
			return _fail("Le propriétaire (%s) ne vend pas." % Identity.display_name(b.owner_id))
		if offer + 0.01 < b.asking_price:
			return _fail("Le prix demandé est %s." % money(b.asking_price))
		return _execute_acquisition(pid, b, b.asking_price)
	var key := pid + "|" + biz_id
	var now := Clock.absolute_hours()
	if counter_offers.has(key) and now <= float(counter_offers[key].expires) and offer + 0.01 >= float(counter_offers[key].price):
		return _execute_acquisition(pid, b, float(counter_offers[key].price))
	if now < float(offer_cooldown.get(key, 0.0)):
		return _fail("Le vendeur a besoin de temps pour réfléchir (anti-spam : réessayez dans 1 h de jeu).")
	var target := b.asking_price if b.for_sale else valuation(b) * 1.2
	if offer >= target:
		return _execute_acquisition(pid, b, offer)
	offer_cooldown[key] = now + 1.0
	if offer >= target * 0.8:
		var counter: float = snappedf((offer + target) / 2.0 + target * 0.03, 10.0)
		counter_offers[key] = {"price": counter, "expires": now + 3.0}
		return {"ok": false, "counter": counter, "msg": "Contre-proposition : %s (valable 3 h de jeu)." % money(counter)}
	return _fail("Offre refusée : bien trop basse.")


func _execute_acquisition(pid: String, b: Business, price: float) -> Dictionary:
	var seller_acc := HOLDING if b.is_ai() else "player:" + b.owner_id
	if not transfer("player:" + pid, seller_acc, price, "acquisition", "Rachat de " + b.name):
		return _fail("Fonds personnels insuffisants (%s)." % money(price))
	var prev := b.owner_id
	b.owner_id = pid
	b.for_sale = false
	b.asking_price = 0.0
	b.manager_ai = false
	b.auto_reorder = true
	counter_offers.erase(pid + "|" + b.id)
	if b.lot_id != "" and lots.has(b.lot_id) and not b.rented:
		lots[b.lot_id].owner = pid
	_add_news("%s rachète « %s » pour %s." % [Identity.display_name(pid), b.name, money(price)])
	if prev != "":
		notify.emit("%s a été vendu à %s." % [b.name, Identity.display_name(pid)], "info")
	ownership_changed.emit(b.id)
	business_changed.emit(b.id)
	return _ok("Félicitations ! « %s » vous appartient." % b.name)


func request_list_for_sale(pid: String, biz_id: String, price: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	b.for_sale = price > 0
	b.asking_price = price
	business_changed.emit(biz_id)
	return _ok("Mise en vente à %s." % money(price) if price > 0 else "Retirée de la vente.")


## Immediate liquidity: the AI holding buys any player company at 80% of value.
func request_sell_to_holding(pid: String, biz_id: String) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if not _owns(pid, b):
		return _fail("Vous n'êtes pas propriétaire.")
	var price := snappedf(valuation(b) * 0.8, 10.0)
	# The holding can always borrow to buy (keeps the market liquid).
	if balance(HOLDING) < price:
		transfer(BANK, HOLDING, price - balance(HOLDING) + 100.0, "prêt", "Crédit holding")
	transfer(HOLDING, "player:" + pid, price, "cession", "Vente de " + b.name)
	b.owner_id = Business.AI_OWNER
	b.for_sale = false
	b.manager_ai = false
	if lots.has(b.lot_id) and lots[b.lot_id].owner == pid:
		lots[b.lot_id].owner = HOLDING
	_add_news("Le Groupe Horizon (IA) rachète « %s »." % b.name)
	ownership_changed.emit(b.id)
	business_changed.emit(b.id)
	return _ok("Vendu au Groupe Horizon pour %s." % money(price))


# ----------------------------------------------------------------- jobs
func job_of(pid: String) -> Dictionary:
	return player_jobs.get(pid, {})


func request_start_shift(pid: String, biz_id: String) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if b == null:
		return _fail("?")
	if b.owner_id == pid:
		player_jobs[pid] = {"type": "owner", "biz_id": biz_id}
		return _ok("Vous travaillez dans votre propre établissement.")
	if not b.is_ai():
		return _fail("Ce patron n'embauche pas de joueurs pour l'instant.")
	player_jobs[pid] = {"type": "barista", "biz_id": biz_id}
	return _ok("Service commencé chez %s : %s par commande servie + pourboires." % [b.name, money(float(GameData.bal("barista_job_pay_per_drink", 1.6)))])


func request_end_shift(pid: String) -> Dictionary:
	var j := job_of(pid)
	if j.get("type", "") in ["barista", "owner"]:
		player_jobs.erase(pid)
		return _ok("Fin de service.")
	return _fail("Pas de service en cours.")


func open_delivery_jobs() -> Array:
	return orders.filter(func(o): return o.status == "open")


func request_take_delivery(pid: String, order_id: int) -> Dictionary:
	if job_of(pid).get("type", "") == "delivery":
		return _fail("Terminez d'abord votre livraison en cours.")
	for o in orders:
		if int(o.id) == order_id and o.status == "open":
			o.status = "taken"
			o.carrier = pid
			o.taken_at = Clock.absolute_hours()
			player_jobs[pid] = {"type": "delivery", "order_id": order_id}
			orders_changed.emit()
			return _ok("Livraison #%d acceptée : récupérez la caisse chez %s." % [o.id, o.seller_name], {"order": o})
	return _fail("Livraison déjà prise.")


func request_complete_delivery(pid: String, order_id: int) -> Dictionary:
	for o in orders:
		if int(o.id) == order_id and o.status == "taken" and o.carrier == pid:
			var fee := float(o.fee)
			_deliver(o, pid)
			player_jobs.erase(pid)
			orders_changed.emit()
			return _ok("Livraison effectuée : +%s" % money(fee))
	return _fail("Livraison invalide.")


func request_cancel_delivery(pid: String) -> Dictionary:
	var j := job_of(pid)
	if j.get("type", "") != "delivery":
		return _fail("Aucune livraison.")
	for o in orders:
		if int(o.id) == int(j.order_id):
			o.status = "open"
			o.carrier = ""
			o.due = Clock.absolute_hours() + 1.0
	player_jobs.erase(pid)
	orders_changed.emit()
	return _ok("Livraison abandonnée.")


## Live barista service by a player (employee or owner). Returns money earned by the player.
func request_live_serve(pid: String, biz_id: String, item: String, q: float, payer: String) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if b == null:
		return _fail("?")
	var tip: float = snappedf(max(0.0, (q - 1.0)) * 1.5 + (0.3 if q >= 1.0 else 0.0), 0.05)
	var paid := complete_sale(biz_id, item, q, payer, tip)
	if paid <= 0.0:
		return _fail("Ingrédients manquants !")
	var earned := 0.0
	if b.owner_id != pid:
		# Employee: wage per order paid by the company, tips go to the player too.
		earned = float(GameData.bal("barista_job_pay_per_drink", 1.6))
		transfer(b.account(), "player:" + pid, earned, "salaires", "Barista joueur", true)
		if tip > 0:
			transfer(b.account(), "player:" + pid, tip, "pourboires reversés", "Pourboire", true)
			earned += tip
	return _ok("Servi !", {"earned": earned, "paid": paid, "tip": tip})


## Harvest job at a farm: the farm gets the goods, the picker gets a piece rate.
func request_harvest(pid: String, biz_id: String, units: float) -> Dictionary:
	var b: Business = businesses.get(biz_id)
	if b == null:
		return _fail("?")
	var good: String = b.def().get("outputs", ["coffee_beans"])[0]
	if b.stock_total() + units > b.stock_capacity():
		# Warehouse full: the AI sells surplus at the port to make room.
		var surplus: float = b.qty(good) * 0.5
		b.add_stock(good, -surplus)
		transfer(EXTERNAL, b.account(), surplus * GameData.good_base_price(good) * float(GameData.bal("export_discount", 0.55)), "export", "Export surplus")
	b.add_stock(good, units)
	if b.owner_id == pid:
		return _ok("+%d %s" % [units, GameData.good_name(good)], {"earned": 0.0})
	var pay := float(GameData.bal("harvest_pay_per_plant", 2.5))
	transfer(b.account(), "player:" + pid, pay, "salaires", "Cueillette", true)
	return _ok("+%s" % money(pay), {"earned": pay})


# =====================================================================
#  SAVE / LOAD
# =====================================================================
func to_dict() -> Dictionary:
	var bl := {}
	for id in businesses:
		bl[id] = businesses[id].to_dict()
	return {"accounts": accounts, "businesses": bl, "lots": lots, "orders": orders, "market": market,
		"candidates": candidates, "news": news, "event": event, "next_order": _next_order, "next_biz": _next_biz,
		"energy": energy_accum, "player_jobs": player_jobs}


func from_dict(d: Dictionary) -> void:
	accounts = d.get("accounts", {})
	businesses.clear()
	for id in d.get("businesses", {}):
		businesses[id] = Business.from_dict(d.businesses[id])
	lots = d.get("lots", {})
	orders = d.get("orders", [])
	for o in orders:
		o.id = int(o.id)
	market = d.get("market", {})
	candidates = d.get("candidates", {})
	news = d.get("news", [])
	event = d.get("event", {})
	_next_order = int(d.get("next_order", 1))
	_next_biz = int(d.get("next_biz", 1))
	energy_accum = d.get("energy", {})
	player_jobs = d.get("player_jobs", {})
	# carried crates are not persisted: give taken deliveries back to AI carriers
	for o in orders:
		if o.status == "taken":
			o.status = "open"
			o.carrier = ""
	player_jobs = {}
	live_businesses.clear()
	player_present.clear()


static func money(v: float) -> String:
	var neg := v < 0
	var s := "%.2f" % abs(v)
	if abs(v) >= 1000:
		s = "%d" % int(round(abs(v)))
		var out := ""
		var c := 0
		for i in range(s.length() - 1, -1, -1):
			out = s[i] + out
			c += 1
			if c % 3 == 0 and i > 0:
				out = " " + out
		s = out
	return ("-" if neg else "") + s + " $"
