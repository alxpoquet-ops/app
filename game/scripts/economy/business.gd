class_name Business
extends RefCounted
## Pure data + rules for one company. No scene/node references here so the same
## object can live on a dedicated server, be serialised, and be simulated
## "abstractly" when no player is near.
##
## Money is NOT stored here: the business account lives in Economy.accounts
## under "biz:<id>" so every movement goes through Economy.transfer().

const AI_OWNER := ""

var id := ""
var type_id := ""
var name := ""
var owner_id := AI_OWNER          # "" = run by the economic AI
var color := "#e07a5f"
var pos := Vector2.ZERO           # world position (x, z) of the building
var rot := 0.0
var lot_id := ""                  # lot it stands on ("" = historic building)
var rented := false
var rent_per_day := 0.0
var level := 1                    # production capacity tier (producers)
var stock := {}                   # good -> qty
var sell_prices := {}             # menu item or good -> unit price
var employees := []               # [{name, skill, wage, hired_day}]
var equipment := []               # [{uid, def, x, z, rot, condition}]
var reputation := 50.0            # 0..100
var debt := 0.0
var for_sale := false
var asking_price := 0.0
var auto_reorder := true
var manager_ai := false           # paid automation for player companies
var open := true                  # owner switch
var reorder_target := {}          # good -> target stock level
var partners := {}                # player_id -> share (0..1), owner holds the rest
# Rolling statistics
var today := {}                   # category -> amount (revenue positive, costs negative)
var served_today := 0
var lost_today := 0               # customers lost (stock-out / waiting / closed)
var lost_capacity_today := 0
var history := []                 # [{day, revenue, expenses, profit, served, lost}]
var days_in_loss := 0
var hour_served := 0              # abstract capacity bookkeeping
var promo_until_day := 0
var promo_discount := 0.0
var ad_until_day := 0
var loyalty := false
var _uid_counter := 1


func def() -> Dictionary:
	return GameData.btype(type_id)


func kind() -> String:
	return def().get("kind", "retail")


func is_ai() -> bool:
	return owner_id == AI_OWNER


func account() -> String:
	return "biz:" + id


func is_retail() -> bool:
	return def().has("menu")


func menu() -> Dictionary:
	return def().get("menu", {})


func stock_capacity() -> int:
	return int(def().get("stock_capacity", 500) * (1.0 + 0.5 * (level - 1)))


func stock_total() -> float:
	var t := 0.0
	for g in stock:
		t += float(stock[g])
	return t


func qty(good: String) -> float:
	return float(stock.get(good, 0.0))


func add_stock(good: String, amount: float) -> void:
	stock[good] = max(0.0, qty(good) + amount)


func is_open_at(hour: int) -> bool:
	var d := def()
	return open and hour >= int(d.get("open_hour", 7)) and hour < int(d.get("close_hour", 22))


func price_of(item: String) -> float:
	var base := 0.0
	if menu().has(item):
		base = float(menu()[item].get("base_price", 1.0))
	else:
		base = GameData.good_base_price(item)
	return float(sell_prices.get(item, base))


func effective_price(item: String, day: int) -> float:
	var p := price_of(item)
	if day <= promo_until_day:
		p *= (1.0 - promo_discount)
	return p


func new_uid() -> int:
	_uid_counter += 1
	return _uid_counter


# ---------------------------------------------------------------- equipment
func machines() -> Array:
	return equipment.filter(func(e): return GameData.equip(e.def).get("category", "") == "machine")


func has_display() -> bool:
	for e in equipment:
		if GameData.equip(e.def).get("category", "") == "display":
			return true
	return false


func comfort_score() -> float:
	var s := 0.0
	for e in equipment:
		var d := GameData.equip(e.def)
		s += float(d.get("comfort", 0)) + float(d.get("decor", 0))
	return min(s, 40.0)


func machine_factor() -> float:
	## Throughput multiplier from the coffee machines (condition matters).
	var ms := machines()
	if ms.is_empty():
		return 0.0
	var total := 0.0
	for m in ms:
		var d := GameData.equip(m.def)
		total += float(d.get("speed", 1.0)) * condition_factor(float(m.condition))
	# The second, third... machine help less (staff becomes the bottleneck).
	return min(total, 1.0 + 0.6 * (ms.size() - 1))


func machine_quality() -> float:
	var ms := machines()
	if ms.is_empty():
		return 0.8
	var best := 0.0
	for m in ms:
		var d := GameData.equip(m.def)
		best = max(best, float(d.get("quality", 1.0)) * (0.7 + 0.3 * condition_factor(float(m.condition))))
	return best


static func condition_factor(c: float) -> float:
	return clamp(0.35 + c / 100.0 * 0.65, 0.35, 1.0)


func energy_per_hour() -> float:
	var e := 0.2
	for eq in equipment:
		e += float(GameData.equip(eq.def).get("energy_per_hour", 0.0))
	return e


# ---------------------------------------------------------------- staff
func staff_skill() -> float:
	var s := 0.0
	for e in employees:
		s += float(e.skill)
	return s


func wages_per_day() -> float:
	var w := 0.0
	for e in employees:
		w += float(e.wage)
	return w


## Abstract service capacity (customers / hour) for retail.
func service_capacity_per_hour(player_working: bool) -> float:
	var staff := staff_skill() + (1.0 if player_working else 0.0)
	var base := float(def().get("workers_per_hour", 14))
	var mf := machine_factor() if kind() == "retail" else 1.0
	if kind() == "retail" and mf <= 0.0:
		# no machine: only non-machine items possible, slower
		mf = 0.5 if has_display() else 0.0
	return staff * base * max(mf, 0.0)


# ---------------------------------------------------------------- quality / attractiveness
func quality() -> float:
	var q := machine_quality() if kind() == "retail" else 1.0
	var avg_skill: float = staff_skill() / float(employees.size()) if employees.size() > 0 else 1.0
	return clamp(q * (0.85 + 0.15 * avg_skill), 0.4, 1.6)


# ---------------------------------------------------------------- ledger
func book(category: String, amount: float) -> void:
	today[category] = float(today.get(category, 0.0)) + amount


func revenue_today() -> float:
	var r := 0.0
	for k in today:
		if today[k] > 0:
			r += today[k]
	return r


func expenses_today() -> float:
	var r := 0.0
	for k in today:
		if today[k] < 0:
			r -= today[k]
	return r


func close_day(day: int) -> Dictionary:
	var rec := {"day": day, "revenue": revenue_today(), "expenses": expenses_today(),
		"served": served_today, "lost": lost_today, "lost_capacity": lost_capacity_today, "detail": today.duplicate()}
	rec["profit"] = rec.revenue - rec.expenses
	history.append(rec)
	while history.size() > 14:
		history.pop_front()
	days_in_loss = days_in_loss + 1 if rec.profit < 0 else 0
	today = {}
	served_today = 0
	lost_today = 0
	lost_capacity_today = 0
	return rec


func avg_profit(days: int = 7) -> float:
	if history.is_empty():
		return 0.0
	var n: int = min(days, history.size())
	var s := 0.0
	for i in range(history.size() - n, history.size()):
		s += float(history[i].profit)
	return s / n


func status_label() -> String:
	if for_sale:
		return "À VENDRE"
	if not open:
		return "FERMÉ"
	if days_in_loss >= 3 or debt > 1500:
		return "EN DIFFICULTÉ"
	return "OUVERT"


# ---------------------------------------------------------------- persistence
func to_dict() -> Dictionary:
	return {
		"id": id, "type_id": type_id, "name": name, "owner_id": owner_id, "color": color,
		"pos": [pos.x, pos.y], "rot": rot, "lot_id": lot_id, "rented": rented, "rent_per_day": rent_per_day,
		"level": level, "stock": stock, "sell_prices": sell_prices, "employees": employees,
		"equipment": equipment, "reputation": reputation, "debt": debt, "for_sale": for_sale,
		"asking_price": asking_price, "auto_reorder": auto_reorder, "manager_ai": manager_ai, "open": open,
		"reorder_target": reorder_target, "partners": partners, "today": today, "served_today": served_today,
		"lost_today": lost_today, "history": history, "days_in_loss": days_in_loss,
		"promo_until_day": promo_until_day, "promo_discount": promo_discount, "ad_until_day": ad_until_day,
		"loyalty": loyalty, "uid": _uid_counter,
	}


static func from_dict(d: Dictionary) -> Business:
	var b := Business.new()
	b.id = d.id
	b.type_id = d.type_id
	b.name = d.name
	b.owner_id = d.get("owner_id", "")
	b.color = d.get("color", "#e07a5f")
	b.pos = Vector2(d.pos[0], d.pos[1])
	b.rot = float(d.get("rot", 0))
	b.lot_id = d.get("lot_id", "")
	b.rented = bool(d.get("rented", false))
	b.rent_per_day = float(d.get("rent_per_day", 0))
	b.level = int(d.get("level", 1))
	b.stock = d.get("stock", {})
	b.sell_prices = d.get("sell_prices", {})
	b.employees = d.get("employees", [])
	b.equipment = d.get("equipment", [])
	for e in b.equipment:
		e.uid = int(e.uid)
	b.reputation = float(d.get("reputation", 50))
	b.debt = float(d.get("debt", 0))
	b.for_sale = bool(d.get("for_sale", false))
	b.asking_price = float(d.get("asking_price", 0))
	b.auto_reorder = bool(d.get("auto_reorder", true))
	b.manager_ai = bool(d.get("manager_ai", false))
	b.open = bool(d.get("open", true))
	b.reorder_target = d.get("reorder_target", {})
	b.partners = d.get("partners", {})
	b.today = d.get("today", {})
	b.served_today = int(d.get("served_today", 0))
	b.lost_today = int(d.get("lost_today", 0))
	b.history = d.get("history", [])
	b.days_in_loss = int(d.get("days_in_loss", 0))
	b.promo_until_day = int(d.get("promo_until_day", 0))
	b.promo_discount = float(d.get("promo_discount", 0))
	b.ad_until_day = int(d.get("ad_until_day", 0))
	b.loyalty = bool(d.get("loyalty", false))
	b._uid_counter = int(d.get("uid", 1))
	return b
