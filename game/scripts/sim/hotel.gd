extends Node
## Hotel simulation (autoload "Hotel"): rooms, guests, staff, tasks, stock,
## finances, reputation and events. Pure data + rules: the 3D world only
## *executes* tasks (walking, animations) and reports back.
##
## Every player action goes through a `request_*` method that validates it,
## so the same code can run on a host/dedicated server later (multiplayer).

signal guest_arrive(gid: String)          # a booked guest shows up at the entrance
signal guest_intent(gid: String, intent: String)   # world must move the guest actor
signal task_added(task: Dictionary)
signal task_removed(tid: int)
signal tasks_changed
signal room_changed(rid: String)
signal staff_changed
signal spill_added(spill: Dictionary)
signal spill_removed(sid: int)
signal facility_changed(fid: String)
signal notify(text: String, kind: String)
signal day_report(day: int)
signal decor_changed

const WEEKDAYS := ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
const SHIFTS := {"jour": [7, 15], "soir": [15, 23], "nuit": [23, 7]}
const PLAYER := "player"

var rng := RandomNumberGenerator.new()
var cash := 0.0
var today := {}                 # category -> amount (+ revenue / - expense)
var history := []               # daily records
var rooms := {}                 # rid -> room dict
var guests := {}                # gid -> guest dict
var staff := {}                 # sid -> staff dict
var candidates := {}            # role -> [candidate]
var tasks := []                 # open / claimed tasks
var stock := {}                 # supply -> qty
var orders := []                # pending supply deliveries
var auto_reorder := true
var prices := {}                # tier or menu item -> price
var facilities := {}            # fid -> {ok, locked}
var upgrades := {}              # upgrade id -> true
var washers := {}               # washer fid -> {state: idle/running/done, until, load}
var dirty_linen := 0
var clean_linen := 0
var spills := {}                # sid -> {id, floor, x, z, created}
var decor := []                 # [{uid, def, x, z, rot}]
var reviews := []               # [{day, name, type, stars, text, room}]
var reputation := 3.0
var event := {}
var stats := {}                 # rolling counters for today
var news := []
var debt := 0.0
var player_xp := {}             # role -> tasks done by the player
var marketing_until := 0
var totals := {}                # cumulative counters (tasks done by type, by who…)
var _next_id := 1


func _ready() -> void:
	rng.randomize()
	Clock.hour_passed.connect(_on_hour)
	Clock.day_passed.connect(_on_day)


var _timeout_t := 0.0


func _process(delta: float) -> void:
	if not Clock.running:
		return
	_timeout_t -= delta * Clock.time_scale
	if _timeout_t <= 0.0:
		_timeout_t = 1.0
		_timeouts()


func _id() -> int:
	_next_id += 1
	return _next_id


# =====================================================================
#  NEW GAME
# =====================================================================
func new_game(seed_value := -1) -> void:
	if seed_value >= 0:
		rng.seed = seed_value
	cash = float(GameData.bal("start_cash", 6000))
	today = {}
	history = []
	rooms = {}
	guests = {}
	staff = {}
	tasks = []
	orders = []
	spills = {}
	decor = []
	reviews = []
	news = []
	reputation = 3.0
	event = {}
	debt = 0.0
	upgrades = {}
	player_xp = {}
	marketing_until = 0
	totals = {}
	auto_reorder = true
	_reset_stats()
	var b: Dictionary = GameData.building
	for f in range(1, int(b.floors)):
		var tier: String = b.floor_tiers[str(f)]
		for r in b.rooms:
			var rid := "%d%02d" % [f, int(r.idx)]
			rooms[rid] = {"id": rid, "floor": f, "idx": int(r.idx), "side": r.side, "x0": float(r.x0), "x1": float(r.x1),
				"tier": tier, "unlocked": rid in b.unlocked_start, "state": "ready" if rid in b.unlocked_start else "locked",
				"guest": "", "items": _fresh_items(), "dnd": false, "turndown_done": true}
	for t in GameData.room_tiers:
		prices[t] = float(GameData.room_tiers[t].base_price)
	for m in GameData.menu:
		prices[m] = float(GameData.menu[m].price)
	for s in GameData.supplies:
		stock[s] = float(GameData.supplies[s].start)
	for fid in GameData.facilities:
		facilities[fid] = {"ok": true, "locked": bool(GameData.facilities[fid].get("locked", false))}
	washers = {"washer_1": {"state": "idle", "until": 0.0, "load": 0}, "washer_2": {"state": "idle", "until": 0.0, "load": 0}}
	dirty_linen = 0
	clean_linen = int(GameData.bal("start_clean_linen", 14))
	for role_shift in [["reception", "jour"], ["housekeeper", "jour"], ["barista", "jour"], ["reception", "soir"]]:
		var c := _make_candidate(role_shift[0], 0.9 + rng.randf() * 0.2)
		c.shift = role_shift[1]
		_add_staff(c)
	for role in GameData.roles:
		_refresh_candidates(role)
	# decoration already in the lobby
	for d in [["sofa", -4.0, 9.5, 0.0], ["plant", -7.0, 11.0, 0.0], ["plant", 4.0, 11.0, 0.0], ["table_set", 8.0, 3.5, 0.0], ["table_set", 8.0, 8.0, 0.0], ["rug", -1.0, 5.0, 0.0]]:
		decor.append({"uid": _id(), "def": d[0], "x": d[1], "z": d[2], "rot": d[3]})
	_generate_bookings(Clock.day, Clock.hour())
	_add_news("Vous reprenez le Grand Hôtel Wobble. 4 chambres sont en service, les autres attendent d'être rénovées.")


func _fresh_items() -> Dictionary:
	var it := {}
	for k in GameData.room_items:
		it[k] = true
	return it


func _reset_stats() -> void:
	stats = {"arrivals": 0, "departures": 0, "lost_price": 0, "lost_capacity": 0, "lost_waiting": 0, "booked": 0,
		"tasks_done": 0, "cafe_served": 0, "room_service": 0, "repairs": 0, "cleaned": 0, "breakdowns": 0, "complaints": 0}


# =====================================================================
#  MONEY
# =====================================================================
func earn(category: String, amount: float) -> void:
	if amount <= 0.0:
		return
	cash += amount
	today[category] = float(today.get(category, 0.0)) + amount


func spend(category: String, amount: float, force := true) -> bool:
	if amount <= 0.0:
		return true
	if not force and cash < amount:
		return false
	cash -= amount
	today[category] = float(today.get(category, 0.0)) - amount
	return true


func revenue_today() -> float:
	var s := 0.0
	for k in today:
		if today[k] > 0:
			s += today[k]
	return s


func expenses_today() -> float:
	var s := 0.0
	for k in today:
		if today[k] < 0:
			s -= today[k]
	return s


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


# =====================================================================
#  QUERIES
# =====================================================================
func now() -> float:
	return Clock.absolute_hours()


func weekday(day := -1) -> int:
	return ((Clock.day if day < 0 else day) - 1) % 7


func is_weekend(day := -1) -> bool:
	return weekday(day) >= 5


func unlocked_rooms() -> Array:
	return rooms.values().filter(func(r): return r.unlocked)


func occupied_count() -> int:
	return rooms.values().filter(func(r): return r.guest != "").size()


func occupancy() -> float:
	var u := unlocked_rooms().size()
	return float(occupied_count()) / u if u > 0 else 0.0


func broken_items(r: Dictionary) -> Array:
	var out := []
	for k in r["items"]:
		if not r["items"][k]:
			out.append(k)
	return out


func room_light(r: Dictionary) -> String:
	## Colour code of the light above the door.
	if not r.unlocked:
		return "locked"
	if r.guest != "" and r.dnd:
		return "dnd"
	return r.state


func in_house_guests() -> Array:
	return guests.values().filter(func(g): return g.state not in ["booked", "gone"])


func lobby_comfort() -> float:
	var s := 0.0
	for d in decor:
		s += float(GameData.decor.get(d.def, {}).get("comfort", 0))
	return min(s, 60.0)


func staff_comfort() -> float:
	var s := 0.0
	for d in decor:
		s += float(GameData.decor.get(d.def, {}).get("staff_comfort", 0))
	return min(s, 20.0)


func on_shift(st: Dictionary, hour: int) -> bool:
	if int(st.get("sick_until", 0)) >= Clock.day:
		return false
	var sh: Array = SHIFTS[st.shift]
	if sh[0] < sh[1]:
		return hour >= sh[0] and hour < sh[1]
	return hour >= sh[0] or hour < sh[1]


func staff_on_duty(role: String) -> int:
	var n := 0
	for sid in staff:
		if staff[sid].role == role and on_shift(staff[sid], Clock.hour()):
			n += 1
	return n


func tier_rank(t: String) -> int:
	return int(GameData.room_tiers[t].rank)


func reference_price(tier: String) -> float:
	## Price of the competitor (Hôtel du Port), slightly variable.
	var base := float(GameData.room_tiers[tier].base_price)
	return base * (0.95 + 0.1 * sin(float(Clock.day) * 1.7 + tier_rank(tier)))


# =====================================================================
#  DEMAND & BOOKINGS
# =====================================================================
func demand_multiplier(gtype: String, day: int) -> float:
	var gt: Dictionary = GameData.guests[gtype]
	var m := float(gt.weekend if is_weekend(day) else gt.weekday)
	m *= pow(max(reputation, 0.5) / 3.0, 1.3)
	if upgrades.has("website"):
		m *= 1.2
	if day <= marketing_until:
		m *= 1.3
	m *= float(event.get("demand", {}).get(gtype, 1.0))
	return m


func willingness(gtype: String, tier: String) -> float:
	var gt: Dictionary = GameData.guests[gtype]
	return float(GameData.room_tiers[tier].base_price) * float(gt.budget) * (0.75 + 0.09 * reputation)


## Share of a guest type that accepts the current price of a tier (for the price board).
func acceptance(gtype: String, tier: String) -> float:
	var w := willingness(gtype, tier)
	var p := float(prices[tier])
	# willingness * U(0.85, 1.25)
	return clamp((w * 1.25 - p) / (w * 0.4), 0.0, 1.0)


func _generate_bookings(day: int, from_hour := 0) -> void:
	var capacity := {}
	for r in unlocked_rooms():
		var staying: bool = r.guest != "" and int(guests[r.guest].nights_left) > 0
		if not staying:
			capacity[r.tier] = int(capacity.get(r.tier, 0)) + 1
	# already booked for today
	for g in guests.values():
		if g.state == "booked" and int(g.day) == day:
			capacity[g.tier] = int(capacity.get(g.tier, 0)) - 1
	var total := float(GameData.bal("base_demand", 7)) + float(GameData.bal("demand_per_room", 0.55)) * unlocked_rooms().size()
	var wsum := 0.0
	for t in GameData.guests:
		wsum += float(GameData.guests[t].weight)
	var lo: int = max(from_hour, int(GameData.bal("checkin_from", 13)))
	var hi := int(GameData.bal("checkin_to", 22))
	if lo > hi:
		return
	for t in GameData.guests:
		var expected := total * float(GameData.guests[t].weight) / wsum * demand_multiplier(t, day)
		var n := int(floor(expected))
		if rng.randf() < expected - n:
			n += 1
		for i in n:
			var booked := false
			var price_issue := false
			for tier in GameData.guests[t].tiers:
				if int(capacity.get(tier, 0)) <= 0:
					continue
				if float(prices[tier]) > willingness(t, tier) * rng.randf_range(0.85, 1.25):
					price_issue = true
					continue
				capacity[tier] = int(capacity[tier]) - 1
				_book_guest(t, tier, day, rng.randi_range(lo, hi))
				booked = true
				break
			if not booked:
				if price_issue:
					stats.lost_price += 1
				else:
					stats.lost_capacity += 1


func _book_guest(gtype: String, tier: String, day: int, hour: int) -> Dictionary:
	var gt: Dictionary = GameData.guests[gtype]
	var gid := "g%d" % _id()
	var nights := rng.randi_range(int(gt.nights[0]), int(gt.nights[1]))
	var g := {"id": gid, "name": GameData.random_person_name(rng), "type": gtype, "tier": tier, "nights": nights,
		"nights_left": nights, "day": day, "arrival": float(day) * 24.0 + hour + rng.randf() * 0.8, "state": "booked",
		"room": "", "sat": 72.0, "factors": [], "spent": 0.0, "wait_since": 0.0, "breakfast_day": 0, "rs_day": 0,
		"concierge_done": false, "return_h": 0.0, "checkout_h": 0.0, "influencer": false}
	if event.get("influencer", false) and gtype == "couple" and not _has_influencer():
		g.influencer = true
		g.name += " (influenceuse)"
	guests[gid] = g
	stats.booked += 1
	return g


func _has_influencer() -> bool:
	for g in guests.values():
		if g.influencer and g.state != "gone":
			return true
	return false


func bookings_today() -> Array:
	return guests.values().filter(func(g): return g.state == "booked")


# =====================================================================
#  SATISFACTION
# =====================================================================
func adjust_sat(gid: String, delta: float, reason: String) -> void:
	var g: Dictionary = guests.get(gid, {})
	if g.is_empty():
		return
	g.sat = clamp(float(g.sat) + delta, 0.0, 100.0)
	g.factors.append([reason, delta])
	if delta <= -6:
		stats.complaints += 1


func _review(g: Dictionary) -> void:
	var stars: int = clamp(int(round(float(g.sat) / 20.0)), 1, 5)
	var best := ["", 0.0]
	var worst := ["", 0.0]
	for f in g.factors:
		if float(f[1]) > float(best[1]):
			best = f
		if float(f[1]) < float(worst[1]):
			worst = f
	var parts := []
	if stars >= 4:
		parts.append(["Séjour parfait !", "Très bel hôtel.", "On reviendra !"][rng.randi() % 3])
		if best[0] != "":
			parts.append("Top : %s." % best[0])
		if worst[0] != "" and float(worst[1]) <= -6:
			parts.append("Bémol : %s." % worst[0])
	else:
		parts.append(["Décevant.", "Peut mieux faire.", "À éviter…"][rng.randi() % 3] if stars <= 2 else "Correct, sans plus.")
		if worst[0] != "":
			parts.append("Problème : %s." % worst[0])
		if best[0] != "":
			parts.append("Point positif : %s." % best[0])
	var rv := {"day": Clock.day, "name": g.name, "type": g.type, "stars": stars, "text": " ".join(parts), "room": g.room}
	reviews.push_front(rv)
	if reviews.size() > 60:
		reviews.pop_back()
	var weight := 3 if g.influencer or g.type == "vip" else 1
	var total := 0.0
	var n := 0
	for i in min(30, reviews.size()):
		var w := 3 if (i == 0 and weight == 3) else 1
		total += float(reviews[i].stars) * w
		n += w
	# Reputation moves toward the recent average (a new hotel starts at 3★).
	reputation = clamp(lerp(reputation, total / n, 0.35 if weight == 3 else 0.15), 1.0, 5.0)
	if weight == 3:
		_add_news("%s publie un avis %d★ : « %s »" % [g.name, stars, rv.text])
		notify.emit("Avis très suivi de %s : %d★ !" % [g.name, stars], "event")


# =====================================================================
#  TASKS
# =====================================================================
func task_def(t: Dictionary) -> Dictionary:
	return GameData.tasks[t.type]


func add_task(type: String, data := {}) -> Dictionary:
	var t := {"id": _id(), "type": type, "guest": "", "room": "", "item": "", "place": "", "menu": "", "request": "",
		"spill": -1, "washer": "", "facility": "", "created": now(), "assignee": "", "step": 0, "complainant": ""}
	t.merge(data, true)
	var td: Dictionary = GameData.tasks[type]
	t["deadline"] = now() + float(td.timeout) if td.has("timeout") else 0.0
	tasks.append(t)
	task_added.emit(t)
	tasks_changed.emit()
	return t


func remove_task(t: Dictionary) -> void:
	tasks.erase(t)
	task_removed.emit(int(t.id))
	tasks_changed.emit()


func get_task(tid: int) -> Dictionary:
	for t in tasks:
		if int(t.id) == tid:
			return t
	return {}


func task_label(t: Dictionary, text := "") -> String:
	if text == "":
		text = task_def(t).label
	var g: Dictionary = guests.get(t.guest, {})
	var item_name := ""
	if t.item != "":
		item_name = GameData.room_items.get(t.item, GameData.facilities.get(t.item, {})).get("name", t.item)
	if t.menu != "":
		item_name = GameData.menu[t.menu].name
	var part := ""
	if t.type == "repair":
		part = GameData.supplies[_part_for(t)].name
	return text.format({"guest": g.get("name", "client"), "room": t.room, "item": item_name, "place": t.place,
		"request": t.request, "part": part})


func task_roles(t: Dictionary) -> Array:
	var d := task_def(t)
	return [d.role] + Array(d.get("alt", []))


func _part_for(t: Dictionary) -> String:
	if t.facility != "":
		return GameData.facilities[t.facility].part
	return GameData.room_items[t.item].part


## Why a task can't be done right now ("" = it can).
func blocked_reason(t: Dictionary) -> String:
	match t.type:
		"checkin":
			if t.get("room_choice", "") == "" and best_room_for(guests[t.guest]) == "":
				return "aucune chambre prête"
		"prepare":
			if clean_linen < 1:
				return "plus de linge propre (laverie !)"
			if stock.kits_accueil < 1:
				return "plus de kits d'accueil"
		"repair":
			if int(t.step) == 0 and stock.get(_part_for(t), 0) < 1:
				return "pièce manquante : " + GameData.supplies[_part_for(t)].name
		"laundry_wash":
			if not facilities[t.washer].ok:
				return "lave-linge en panne"
		"cafe_order":
			if not _menu_available(t.menu):
				return "ingrédients ou machine indisponibles"
		"room_service":
			if not facilities.stove.ok:
				return "piano de cuisson en panne"
			if int(t.step) == 0 and not _menu_available(t.menu):
				return "ingrédients manquants"
	return ""


func _menu_available(item: String) -> bool:
	var m: Dictionary = GameData.menu[item]
	for s in m.needs:
		if float(stock.get(s, 0)) < float(m.needs[s]):
			return false
	if m.get("machine", false) and not facilities.cafe_machine.ok:
		return false
	return true


func _consume_menu(item: String) -> void:
	var m: Dictionary = GameData.menu[item]
	for s in m.needs:
		stock[s] = float(stock[s]) - float(m.needs[s])


## Best open task for a staff member (primary role first, then helping roles).
func next_task_for(sid: String) -> Dictionary:
	var st: Dictionary = staff[sid]
	var best := {}
	var best_score := -INF
	for t in tasks:
		if t.assignee != "":
			continue
		var roles := task_roles(t)
		if not (st.role in roles):
			continue
		if blocked_reason(t) != "":
			continue
		var score := float(task_def(t).priority) * 10.0 + (now() - float(t.created)) * 6.0
		if roles[0] != st.role:
			score -= 25.0   # helping another team only when idle
		if score > best_score:
			best_score = score
			best = t
	return best


func claim_task(tid: int, who: String) -> bool:
	var t := get_task(tid)
	if t.is_empty() or t.assignee != "":
		return false
	t.assignee = who
	tasks_changed.emit()
	return true


func release_task(tid: int) -> void:
	var t := get_task(tid)
	if not t.is_empty():
		t.assignee = ""
		tasks_changed.emit()


## Called by the world when an actor (staff or player) finishes a step.
## quality: 1.0 normal, up to 1.3 for a perfect mini-game.
func step_done(tid: int, who: String, quality := 1.0) -> Dictionary:
	var t := get_task(tid)
	if t.is_empty() or t.assignee != who:
		return {"ok": false, "msg": "Tâche expirée."}
	var reason := blocked_reason(t)
	if reason != "":
		return {"ok": false, "msg": "Impossible : " + reason}
	var steps: Array = task_def(t).steps
	_on_step(t, int(t.step), who, quality)
	t.step = int(t.step) + 1
	if int(t.step) >= steps.size():
		var res := _complete(t, who, quality)
		remove_task(t)
		stats.tasks_done += 1
		totals[t.type] = int(totals.get(t.type, 0)) + 1
		var by := "player" if who == PLAYER else (str(staff[who].role) if staff.has(who) else "?")
		totals["by_" + by] = int(totals.get("by_" + by, 0)) + 1
		if who == PLAYER:
			var role: String = task_def(t).role
			player_xp[role] = int(player_xp.get(role, 0)) + 1
		elif staff.has(who):
			staff[who].tasks_today = int(staff[who].tasks_today) + 1
			staff[who].tasks_total = int(staff[who].tasks_total) + 1
			staff[who].energy = max(0.0, float(staff[who].energy) - 5.0)
		res["done"] = true
		return res
	tasks_changed.emit()
	return {"ok": true, "msg": "", "done": false}


func _on_step(t: Dictionary, step: int, _who: String, _q: float) -> void:
	if t.type == "repair" and step == 0:
		stock[_part_for(t)] = float(stock[_part_for(t)]) - 1.0
	if t.type == "room_service" and step == 0:
		_consume_menu(t.menu)
	if t.type == "cafe_order" and step == 0:
		_consume_menu(t.menu)


func _complete(t: Dictionary, who: String, q: float) -> Dictionary:
	var g: Dictionary = guests.get(t.guest, {})
	var r: Dictionary = rooms.get(t.room, {})
	var msg := "Tâche terminée."
	for s in task_def(t).get("consumes", {}):
		stock[s] = max(0.0, float(stock[s]) - float(task_def(t).consumes[s]))
	match t.type:
		"checkin":
			var rid: String = t.get("room_choice", "")
			if rid == "":
				rid = best_room_for(g)
			_checkin(g, rid, t)
			msg = "%s s'installe en chambre %s." % [g.name, rid]
		"checkout":
			_checkout(g, false)
			msg = "%s a réglé sa note et laissé un avis." % g.name
		"luggage":
			if not g.is_empty():
				adjust_sat(g.id, 5, "bagages montés en chambre")
				_tip(g, who, 2.0)
			msg = "Bagages livrés !"
		"clean":
			r.state = "to_prepare"
			dirty_linen += 1
			stats.cleaned += 1
			add_task("prepare", {"room": r.id, "place": "ch. " + r.id})
			room_changed.emit(r.id)
			_check_laundry()
			msg = "Chambre %s propre. Elle doit maintenant être préparée." % r.id
		"prepare":
			clean_linen -= 1
			r.state = "ready"
			room_changed.emit(r.id)
			msg = "Chambre %s prête à la location." % r.id
		"turndown":
			r.turndown_done = true
			dirty_linen += 1
			if r.guest != "":
				adjust_sat(r.guest, 3, "chambre faite chaque jour")
			_check_laundry()
			msg = "Recouche faite."
		"repair":
			if t.facility != "":
				facilities[t.facility].ok = true
				facility_changed.emit(t.facility)
			else:
				r["items"][t.item] = true
				if r.guest != "":
					adjust_sat(r.guest, 4, "réparation rapide")
				room_changed.emit(r.id)
			stats.repairs += 1
			msg = "Réparé : %s." % task_label(t, "{item}")
		"laundry_wash":
			var load: int = min(dirty_linen, int(GameData.bal("laundry_load", 8)))
			dirty_linen -= load
			washers[t.washer] = {"state": "running", "until": now() + float(GameData.bal("laundry_cycle_hours", 1.5)), "load": load}
			msg = "Machine lancée (%d parures)." % load
		"laundry_fold":
			var w: Dictionary = washers[t.washer]
			clean_linen += int(w.load)
			washers[t.washer] = {"state": "idle", "until": 0.0, "load": 0}
			_check_laundry()
			msg = "Linge propre rangé (+%d parures)." % int(w.load)
		"cafe_order":
			var price := float(prices[t.menu])
			earn("café", price)
			stats.cafe_served += 1
			var qual := q * (1.15 if upgrades.has("cafe_pro") else 1.0)
			if not g.is_empty():
				g.spent = float(g.spent) + price
				adjust_sat(g.id, 3.0 + (qual - 1.0) * 15.0, "petit-déjeuner délicieux" if qual >= 1.1 else "café correct")
				_tip(g, who, 0.5 + max(0.0, qual - 1.0) * 4.0)
			guest_intent.emit(t.guest, "cafe_done")
			msg = "%s servi : +%s" % [GameData.menu[t.menu].name, money(price)]
		"room_service":
			var price2 := float(prices[t.menu])
			earn("room service", price2)
			stats.room_service += 1
			if not g.is_empty():
				g.spent = float(g.spent) + price2
				adjust_sat(g.id, 6, "room service")
				_tip(g, who, 3.0)
			msg = "Room service livré : +%s" % money(price2)
		"concierge":
			var com := 6.0 + rng.randf() * 10.0 * float(GameData.guests[g.get("type", "touriste")].tip)
			earn("conciergerie", com)
			if not g.is_empty():
				adjust_sat(g.id, 6, "conciergerie aux petits soins")
				_tip(g, who, 2.0)
			guest_intent.emit(t.guest, "concierge_done")
			msg = "Demande satisfaite, commission +%s" % money(com)
		"noise":
			if t.complainant != "":
				adjust_sat(t.complainant, 3, "plainte pour bruit traitée vite")
			msg = "Le calme est revenu."
		"lost_key":
			if not g.is_empty():
				adjust_sat(g.id, 2, "nouvelle carte-clé rapide")
			msg = "Carte-clé remise."
		"spill":
			var sid := int(t.spill)
			spills.erase(sid)
			spill_removed.emit(sid)
			msg = "Sol propre !"
	return {"ok": true, "msg": msg}


func _tip(g: Dictionary, who: String, base: float) -> void:
	var tip: float = base * float(GameData.guests[g.type].tip) * clamp(float(g.sat) / 70.0, 0.3, 1.5)
	if who != PLAYER and staff.has(who):
		staff[who].morale = min(100.0, float(staff[who].morale) + 0.5)
	else:
		earn("pourboires", tip)   # the director puts tips in the common pot


func _check_laundry() -> void:
	for wid in washers:
		var w: Dictionary = washers[wid]
		if facilities[wid].locked:
			continue
		var has_task := tasks.any(func(t): return t.washer == wid)
		if has_task:
			continue
		if w.state == "idle" and dirty_linen >= int(GameData.bal("laundry_trigger", 4)):
			add_task("laundry_wash", {"washer": wid, "place": "laverie"})
		elif w.state == "running" and now() >= float(w.until):
			w.state = "done"
			add_task("laundry_fold", {"washer": wid, "place": "laverie"})


# =====================================================================
#  GUEST FLOW (called by the world when actors reach places)
# =====================================================================
func guest_at_desk(gid: String) -> void:
	var g: Dictionary = guests.get(gid, {})
	if g.is_empty():
		return
	if g.state == "arriving":
		g.state = "at_desk"
		g.wait_since = now()
		stats.arrivals += 1
		add_task("checkin", {"guest": gid, "place": "réception"})
	elif g.state == "checkout_walk":
		g.state = "checkout_desk"
		g.wait_since = now()
		add_task("checkout", {"guest": gid, "room": g.room, "place": "réception"})


func guest_at_cafe(gid: String) -> void:
	var g: Dictionary = guests.get(gid, {})
	if g.is_empty():
		return
	var items := ["petit_dejeuner", "petit_dejeuner", "cappuccino", "espresso", "croissant"] if Clock.hour() < 11 else ["cappuccino", "espresso", "croissant"]
	var item: String = items[rng.randi() % items.size()]
	g.breakfast_day = Clock.day
	add_task("cafe_order", {"guest": gid, "menu": item, "place": "café"})


func guest_at_concierge(gid: String) -> void:
	var g: Dictionary = guests.get(gid, {})
	if g.is_empty():
		return
	var req: Array = GameData.guests[g.type].requests
	g.concierge_done = true
	add_task("concierge", {"guest": gid, "request": req[rng.randi() % req.size()], "place": "conciergerie"})


func guest_in_room(gid: String) -> void:
	var g: Dictionary = guests.get(gid, {})
	if not g.is_empty() and g.state in ["to_room", "returning", "cafe", "concierge"]:
		g.state = "in_room"


func guest_left_building(gid: String) -> void:
	var g: Dictionary = guests.get(gid, {})
	if g.is_empty():
		return
	if g.state == "leaving":
		g.state = "gone"
	elif g.state == "going_out":
		g.state = "away"


## A wandering (non-guest) café visitor buys something.
func walkin_cafe_order(visitor_id: String) -> Dictionary:
	var items := ["espresso", "cappuccino", "croissant"]
	return add_task("cafe_order", {"guest": visitor_id, "menu": items[rng.randi() % items.size()], "place": "café"})


func best_room_for(g: Dictionary) -> String:
	## Ready room of the wanted tier (or the next best), preferring rooms with nothing broken.
	if g.is_empty():
		return ""
	var want := tier_rank(g.tier)
	var best := ""
	var best_score := -INF
	for r in rooms.values():
		if r.state != "ready" or not r.unlocked or r.guest != "":
			continue
		var diff := tier_rank(r.tier) - want
		var score: float = -abs(diff) * 10.0 - broken_items(r).size() * 8.0 + (2.0 if diff > 0 else 0.0)
		if score > best_score:
			best_score = score
			best = r.id
	return best


func ready_rooms() -> Array:
	return rooms.values().filter(func(r): return r.state == "ready" and r.unlocked and r.guest == "")


func _checkin(g: Dictionary, rid: String, t: Dictionary) -> void:
	var r: Dictionary = rooms[rid]
	r.guest = g.id
	r.state = "occupied"
	r.dnd = false
	r.turndown_done = true
	g.room = rid
	g.state = "to_room"
	var price := float(prices[r.tier])
	var nights := int(g.nights)
	earn("chambres", price * nights)
	spend("taxe de séjour", float(GameData.bal("tourist_tax", 1.5)) * nights)
	g.spent = float(g.spent) + price * nights
	g.price = price
	# first impressions
	var wait_min := (now() - float(g.wait_since)) * 60.0
	if wait_min > 12.0:
		adjust_sat(g.id, -min(20.0, (wait_min - 12.0) * 0.3), "longue attente à la réception")
	else:
		adjust_sat(g.id, 3, "accueil rapide")
	var diff := tier_rank(r.tier) - tier_rank(g.tier)
	if diff > 0:
		adjust_sat(g.id, 7, "surclassement offert")
	elif diff < 0:
		adjust_sat(g.id, -10 * -diff, "chambre moins bien que prévu")
	var value := price / reference_price(r.tier)
	if value > 1.15:
		adjust_sat(g.id, -(value - 1.15) * 40.0 * float(GameData.guests[g.type].exigence), "prix élevé")
	elif value < 0.9:
		adjust_sat(g.id, 4, "bon rapport qualité-prix")
	adjust_sat(g.id, float(GameData.room_tiers[r.tier].comfort) * 1.5 + lobby_comfort() / 10.0 - 4.0 * float(GameData.guests[g.type].exigence), "confort de l'hôtel")
	for it in broken_items(r):
		adjust_sat(g.id, -float(GameData.room_items[it].sat_penalty), "%s en panne dans la chambre" % GameData.room_items[it].name.to_lower())
	add_task("luggage", {"guest": g.id, "room": rid, "place": "ch. " + rid})
	room_changed.emit(rid)
	guest_intent.emit(g.id, "go_room")


func _checkout(g: Dictionary, express: bool) -> void:
	var r: Dictionary = rooms.get(g.room, {})
	# minibar consumption
	var mb := rng.randi_range(0, 3) if g.type != "routard" else rng.randi_range(0, 1)
	if mb > 0 and not r.is_empty() and r["items"].minibar:
		earn("minibar", float(prices.minibar_item) * mb)
		g.spent = float(g.spent) + float(prices.minibar_item) * mb
	if express:
		adjust_sat(g.id, -6, "personne à la réception pour le départ")
	if not r.is_empty():
		if not r.turndown_done:
			pass
		r.guest = ""
		r.state = "dirty"
		r.dnd = false
		add_task("clean", {"room": r.id, "place": "ch. " + r.id})
		room_changed.emit(r.id)
		for t in tasks.duplicate():
			if t.room == r.id and t.type in ["turndown", "room_service", "noise", "lost_key", "luggage"] and t.assignee == "":
				remove_task(t)
	_review(g)
	stats.departures += 1
	g.state = "leaving"
	guest_intent.emit(g.id, "leave")


func _guest_gives_up(g: Dictionary) -> void:
	stats.lost_waiting += 1
	adjust_sat(g.id, -40, "attente interminable à l'accueil, il est reparti")
	_review(g)
	g.state = "leaving"
	for t in tasks.duplicate():
		if t.guest == g.id:
			remove_task(t)
	guest_intent.emit(g.id, "leave")
	notify.emit("%s est reparti sans chambre (attente trop longue) !" % g.name, "warn")


# =====================================================================
#  HOURLY SIMULATION
# =====================================================================
func _on_hour(day: int, hour: int) -> void:
	var t := now()
	# arrivals
	for g in guests.values():
		if g.state == "booked" and t >= float(g.arrival) - 0.01:
			g.state = "arriving"
			guest_arrive.emit(g.id)
	_guest_behaviour(hour)
	_breakdowns(hour)
	if hour >= 7 and hour < 23 and rng.randf() < 0.22:
		_add_spill()
	if hour == 10:
		for r in rooms.values():
			if r.guest != "" and int(guests[r.guest].nights_left) > 0 and not r.dnd:
				r.turndown_done = false
				add_task("turndown", {"room": r.id, "place": "ch. " + r.id})
	_deliveries()
	_check_laundry()
	if auto_reorder:
		_auto_reorder()
	if hour == 8 and event.is_empty() and rng.randf() < 0.35 and day > 1:
		_start_event(day)
	if hour == 16 and event.get("inspection", false):
		_inspection()
	if hour == 0:
		pass
	tasks_changed.emit()


func _guest_behaviour(hour: int) -> void:
	for g in guests.values():
		var gt: Dictionary = GameData.guests[g.type]
		match g.state:
			"in_room":
				var checkout_day: bool = int(g.nights_left) <= 0
				if checkout_day and hour >= int(GameData.bal("checkout_from", 7)):
					if rng.randf() < 0.45 or hour >= int(GameData.bal("checkout_to", 11)):
						g.state = "checkout_walk"
						guest_intent.emit(g.id, "checkout")
						continue
				if hour >= 7 and hour <= 10 and int(g.breakfast_day) != Clock.day and rng.randf() < float(gt.wants.cafe) * 0.4:
					g.state = "cafe"
					guest_intent.emit(g.id, "cafe")
					continue
				if not g.concierge_done and hour >= 10 and hour <= 20 and rng.randf() < float(gt.wants.concierge) * 0.12:
					g.state = "concierge"
					guest_intent.emit(g.id, "concierge")
					continue
				if not checkout_day and hour >= 9 and hour <= 13 and rng.randf() < float(gt.wants.out) * 0.3:
					g.state = "going_out"
					g.return_h = Clock.absolute_hours() + rng.randf_range(4.0, 8.0)
					guest_intent.emit(g.id, "out")
					continue
				var meal_time: bool = (hour >= 12 and hour <= 13) or (hour >= 18 and hour <= 22)
				if meal_time and int(g.rs_day) != Clock.day and facilities.stove.ok and rng.randf() < float(gt.wants.room_service) * 0.4:
					g.rs_day = Clock.day
					var menu_item := "diner" if g.type in ["couple", "vip"] and rng.randf() < 0.6 else "club_sandwich"
					add_task("room_service", {"guest": g.id, "room": g.room, "menu": menu_item, "place": "ch. " + g.room})
				if (hour >= 22 or hour <= 2) and rng.randf() < float(gt.noise) * (0.5 if upgrades.has("soundproofing") else 1.0):
					_noise_from(g)
				if rng.randf() < (0.006 if upgrades.has("keycards") else 0.015):
					add_task("lost_key", {"guest": g.id, "room": g.room, "place": "ch. " + g.room})
			"away":
				if Clock.absolute_hours() >= float(g.return_h) or hour >= 22:
					g.state = "returning"
					guest_intent.emit(g.id, "return")


func _noise_from(g: Dictionary) -> void:
	var r: Dictionary = rooms[g.room]
	for other in rooms.values():
		if other.guest != "" and other.id != r.id and other.floor == r.floor and abs(int(other.idx) - int(r.idx)) <= 1:
			if not tasks.any(func(t): return t.type == "noise" and t.room == r.id):
				adjust_sat(other.guest, -3, "voisins bruyants")
				add_task("noise", {"room": r.id, "complainant": other.guest, "place": "ch. " + r.id})
			return


func _breakdowns(hour: int) -> void:
	var mult := 0.65 if upgrades.has("smart_maintenance") else 1.0
	for r in rooms.values():
		if not r.unlocked:
			continue
		var usage := 1.6 if r.guest != "" else 0.5
		for k in r["items"]:
			if not r["items"][k]:
				continue
			var p := float(GameData.room_items[k].break_per_day) / 24.0 * usage * mult
			p *= float(event.get("break", {}).get(k, 1.0))
			if rng.randf() < p:
				_break_item(r, k)
	for fid in facilities:
		var f: Dictionary = facilities[fid]
		if f.locked or not f.ok:
			continue
		if rng.randf() < float(GameData.facilities[fid].break_per_day) / 24.0 * mult:
			f.ok = false
			stats.breakdowns += 1
			add_task("repair", {"facility": fid, "item": fid, "place": GameData.facilities[fid].name})
			facility_changed.emit(fid)
			notify.emit("Panne : %s !" % GameData.facilities[fid].name, "warn")


func _break_item(r: Dictionary, k: String) -> void:
	r["items"][k] = false
	stats.breakdowns += 1
	add_task("repair", {"room": r.id, "item": k, "place": "ch. " + r.id})
	if r.guest != "" and guests[r.guest].state == "in_room":
		adjust_sat(r.guest, -float(GameData.room_items[k].sat_penalty), "%s en panne" % GameData.room_items[k].name.to_lower())
	room_changed.emit(r.id)


func _timeouts() -> void:
	var t := now()
	for g in guests.values():
		var pat := float(GameData.guests[g.type].patience)
		if g.state == "at_desk" and t - float(g.wait_since) > float(GameData.bal("guest_patience_hours", 1.6)) * pat:
			_guest_gives_up(g)
		elif g.state == "checkout_desk" and t - float(g.wait_since) > float(GameData.bal("checkout_patience_hours", 0.7)):
			for task in tasks.duplicate():
				if task.guest == g.id and task.type == "checkout":
					remove_task(task)
			_checkout(g, true)
	for task in tasks.duplicate():
		if float(task.deadline) <= 0.0 or t < float(task.deadline) or task.assignee != "":
			continue
		var g: Dictionary = guests.get(task.guest, {})
		match task.type:
			"luggage":
				if not g.is_empty():
					adjust_sat(g.id, -3, "a dû porter ses bagages")
			"cafe_order":
				if not g.is_empty():
					adjust_sat(g.id, -8, "service du café trop lent")
				guest_intent.emit(task.guest, "cafe_done")
			"room_service":
				adjust_sat(task.guest, -10, "room service jamais arrivé")
			"concierge":
				adjust_sat(task.guest, -6, "conciergerie débordée")
				guest_intent.emit(task.guest, "concierge_done")
			"noise":
				adjust_sat(task.complainant, -10, "nuit gâchée par le bruit")
			"lost_key":
				adjust_sat(task.guest, -6, "bloqué dehors sans carte-clé")
			"turndown":
				adjust_sat(rooms[task.room].guest, -5, "chambre pas faite")
			"spill":
				# still there: someone slips
				for gg in in_house_guests():
					if rng.randf() < 0.15:
						adjust_sat(gg.id, -4, "a glissé sur une flaque")
				task.deadline = t + 2.0
				continue
		remove_task(task)


func _add_spill() -> void:
	var floor := 0 if rng.randf() < 0.6 else rng.randi_range(1, int(GameData.building.floors) - 1)
	var s := {"id": _id(), "floor": floor, "x": rng.randf_range(-12, 10) if floor == 0 else rng.randf_range(-18, 18),
		"z": rng.randf_range(1, 10) if floor == 0 else rng.randf_range(-0.8, 0.8), "created": now()}
	spills[int(s.id)] = s
	spill_added.emit(s)
	add_task("spill", {"spill": int(s.id), "place": "rez-de-chaussée" if floor == 0 else "étage %d" % floor})


func _deliveries() -> void:
	for o in orders.duplicate():
		if now() >= float(o.eta):
			stock[o.supply] = float(stock.get(o.supply, 0)) + float(o.qty)
			orders.erase(o)


func incoming(supply: String) -> float:
	var q := 0.0
	for o in orders:
		if o.supply == supply:
			q += float(o.qty)
	return q


func _auto_reorder() -> void:
	for s in GameData.supplies:
		var d: Dictionary = GameData.supplies[s]
		if float(d.threshold) <= 0:
			continue
		if float(stock[s]) + incoming(s) <= float(d.threshold):
			request_order(s, int(d.pack), true)


func _start_event(day: int) -> void:
	var list: Array = GameData.events
	event = list[rng.randi() % list.size()].duplicate(true)
	event["until"] = day + int(event.get("days", 1)) - 1
	_add_news("%s — %s" % [event.title, event.text])
	notify.emit("★ " + event.title + " — " + event.text, "event")
	if event.has("instant_breaks"):
		for k in event.instant_breaks:
			for i in int(event.instant_breaks[k]):
				var candidates_r := unlocked_rooms().filter(func(r): return r["items"][k])
				if not candidates_r.is_empty():
					_break_item(candidates_r[rng.randi() % candidates_r.size()], k)
	if event.has("sick"):
		var ids := staff.keys()
		ids.shuffle()
		for i in min(int(event.sick), ids.size()):
			staff[ids[i]].sick_until = day
			notify.emit("%s est malade aujourd'hui." % staff[ids[i]].name, "warn")
	# extra bookings for the demand boost
	if event.has("demand"):
		_generate_bookings(day, Clock.hour() + 1)


func _inspection() -> void:
	var dirty := rooms.values().filter(func(r): return r.unlocked and r.guest == "" and r.state == "dirty").size()
	var sp := spills.size()
	if dirty + sp == 0:
		earn("subventions", 200)
		reputation = min(5.0, reputation + 0.15)
		notify.emit("Inspection réussie : établissement impeccable ! Prime de 200 $.", "ok")
		_add_news("L'inspecteur d'hygiène félicite le Grand Hôtel Wobble.")
	else:
		var fine := 120.0 * dirty + 60.0 * sp
		spend("amendes", fine)
		reputation = max(1.0, reputation - 0.1)
		notify.emit("Inspection : %d chambre(s) sale(s), %d flaque(s). Amende %s." % [dirty, sp, money(fine)], "warn")
	event.erase("inspection")


# =====================================================================
#  DAILY SIMULATION
# =====================================================================
func _on_day(day: int) -> void:
	# nights pass
	for g in guests.values():
		if g.state in ["in_room", "to_room", "away", "returning", "cafe", "concierge", "going_out"]:
			g.nights_left = int(g.nights_left) - 1
	# costs of the day that just ended
	var wages := 0.0
	for sid in staff:
		wages += float(staff[sid].wage)
	spend("salaires", wages)
	var energy := float(GameData.bal("energy_common", 35))
	var upkeep := 0.0
	for r in unlocked_rooms():
		upkeep += float(GameData.room_tiers[r.tier].upkeep)
	energy += float(GameData.bal("energy_per_occupied_room", 5)) * occupied_count()
	spend("énergie", energy)
	spend("entretien", upkeep)
	if debt > 0:
		spend("intérêts", debt * float(GameData.bal("loan_interest_daily", 0.004)))
	var profit := revenue_today() - expenses_today()
	if profit > 0:
		spend("impôts", profit * float(GameData.bal("profit_tax_rate", 0.1)))
	var u := unlocked_rooms().size()
	var occ := occupied_count()
	var room_rev := float(today.get("chambres", 0.0))
	var rec := {"day": day - 1, "revenue": revenue_today(), "expenses": expenses_today(), "detail": today.duplicate(),
		"occupancy": float(occ) / max(1, u), "rooms": u, "adr": room_rev / max(1, stats.arrivals), "revpar": room_rev / max(1, u),
		"reputation": reputation, "stats": stats.duplicate()}
	rec["profit"] = rec.revenue - rec.expenses
	history.append(rec)
	while history.size() > 30:
		history.pop_front()
	today = {}
	_reset_stats()
	_staff_daily()
	# cleanup gone guests
	for gid in guests.keys():
		if guests[gid].state == "gone":
			guests.erase(gid)
	if not event.is_empty() and int(event.get("until", 0)) < day:
		event = {}
	for role in GameData.roles:
		_refresh_candidates(role)
	_generate_bookings(day)
	day_report.emit(day - 1)


func _staff_daily() -> void:
	var sc := staff_comfort()
	for sid in staff.keys():
		var st: Dictionary = staff[sid]
		var expected := expected_wage(st.role, float(st.skill))
		var m := float(st.morale)
		m += 4.0 if float(st.wage) >= expected * 1.1 else (-5.0 if float(st.wage) < expected * 0.9 else 0.0)
		if int(st.tasks_today) > 14:
			m -= 3.0
		m += sc * 0.2 - 1.0
		st.morale = clamp(m, 0.0, 100.0)
		st.energy = 100.0
		st.tasks_today = 0
		if float(st.morale) < 20.0 and rng.randf() < 0.3:
			notify.emit("%s (%s) démissionne : moral au plus bas." % [st.name, GameData.roles[st.role].name], "warn")
			_add_news("%s quitte l'hôtel." % st.name)
			staff.erase(sid)
	staff_changed.emit()


# =====================================================================
#  STAFF
# =====================================================================
func expected_wage(role: String, skill: float) -> float:
	return snappedf(float(GameData.roles[role].wage) * (0.7 + 0.45 * skill), 1.0)


func _make_candidate(role: String, skill := -1.0) -> Dictionary:
	if skill < 0:
		skill = 0.6 + rng.randf() * 0.8
	var traits := []
	var pool := ["rapide", "soigneux", "aimable", "endurant", "râleur", "distrait"]
	if rng.randf() < 0.6:
		traits.append(pool[rng.randi() % pool.size()])
	return {"id": "", "name": GameData.random_person_name(rng), "role": role, "skill": snappedf(skill, 0.01),
		"wage": expected_wage(role, skill), "shift": ["jour", "soir", "nuit"][rng.randi() % 3] if role in ["reception", "security", "porter"] else "jour",
		"morale": 70.0, "energy": 100.0, "tasks_today": 0, "tasks_total": 0, "hired_day": Clock.day, "traits": traits, "sick_until": 0}


func _refresh_candidates(role: String) -> void:
	candidates[role] = [_make_candidate(role), _make_candidate(role)]


func _add_staff(c: Dictionary) -> String:
	c.id = "s%d" % _id()
	c.hired_day = Clock.day
	staff[c.id] = c
	staff_changed.emit()
	return c.id


func staff_speed(st: Dictionary) -> float:
	var s := float(st.skill) * (0.8 + 0.4 * float(st.morale) / 100.0) * (0.6 + 0.4 * float(st.energy) / 100.0)
	if "rapide" in st.traits:
		s *= 1.2
	if "distrait" in st.traits:
		s *= 0.85
	return max(0.25, s)


func player_speed(role: String) -> float:
	var xp := int(player_xp.get(role, 0))
	return float(GameData.bal("player_speed", 1.4)) * (1.0 + min(0.5, xp * 0.02))


# =====================================================================
#  PLAYER REQUESTS
# =====================================================================
func _ok(msg: String, extra := {}) -> Dictionary:
	var d := {"ok": true, "msg": msg}
	d.merge(extra)
	return d


func _fail(msg: String) -> Dictionary:
	return {"ok": false, "msg": msg}


func renovate_cost(rid: String) -> float:
	return float(GameData.room_tiers[rooms[rid].tier].renovate_cost)


func request_renovate(rid: String) -> Dictionary:
	var r: Dictionary = rooms.get(rid, {})
	if r.is_empty() or r.unlocked:
		return _fail("Chambre déjà en service.")
	var cost := renovate_cost(rid)
	if not spend("rénovations", cost, false):
		return _fail("Il faut %s." % money(cost))
	r.unlocked = true
	r.state = "to_prepare"
	r["items"] = _fresh_items()
	add_task("prepare", {"room": rid, "place": "ch. " + rid})
	room_changed.emit(rid)
	_add_news("La chambre %s (%s) est rénovée." % [rid, GameData.room_tiers[r.tier].name])
	return _ok("Chambre %s rénovée ! Faites-la préparer pour l'ouvrir." % rid)


func upgrade_cost(rid: String) -> float:
	var r: Dictionary = rooms[rid]
	var next := _next_tier(r.tier)
	if next == "":
		return 0.0
	return float(GameData.room_tiers[next].renovate_cost) - float(GameData.room_tiers[r.tier].renovate_cost) * 0.5


func _next_tier(t: String) -> String:
	var rank := tier_rank(t)
	for k in GameData.room_tiers:
		if tier_rank(k) == rank + 1:
			return k
	return ""


func request_upgrade_room(rid: String) -> Dictionary:
	var r: Dictionary = rooms.get(rid, {})
	if r.is_empty() or not r.unlocked:
		return _fail("Rénovez d'abord la chambre.")
	if r.guest != "":
		return _fail("La chambre est occupée.")
	var next := _next_tier(r.tier)
	if next == "":
		return _fail("Déjà au plus haut standing.")
	var cost := upgrade_cost(rid)
	if not spend("rénovations", cost, false):
		return _fail("Il faut %s." % money(cost))
	r.tier = next
	room_changed.emit(rid)
	return _ok("Chambre %s montée en gamme : %s." % [rid, GameData.room_tiers[next].name])


func request_set_price(key: String, price: float) -> Dictionary:
	if not prices.has(key):
		return _fail("?")
	var base := float(GameData.room_tiers[key].base_price) if GameData.room_tiers.has(key) else float(GameData.menu[key].price)
	prices[key] = clamp(snappedf(price, 0.5 if base < 30 else 1.0), base * 0.4, base * 3.0)
	return _ok("Prix mis à jour : %s" % money(prices[key]))


func request_hire(role: String, idx: int, shift := "") -> Dictionary:
	var list: Array = candidates.get(role, [])
	if idx < 0 or idx >= list.size():
		return _fail("Candidat introuvable.")
	if staff.size() >= 40:
		return _fail("Effectif maximum atteint.")
	var c: Dictionary = list[idx]
	if shift != "":
		c.shift = shift
	list.remove_at(idx)
	_add_staff(c)
	return _ok("%s rejoint l'équipe (%s, %s/jour, service %s)." % [c.name, GameData.roles[role].name, money(float(c.wage)), c.shift])


func request_fire(sid: String) -> Dictionary:
	var st: Dictionary = staff.get(sid, {})
	if st.is_empty():
		return _fail("?")
	spend("indemnités", float(st.wage) * 2.0)
	staff.erase(sid)
	for t in tasks:
		if t.assignee == sid:
			t.assignee = ""
	staff_changed.emit()
	tasks_changed.emit()
	return _ok("%s a quitté l'hôtel (2 jours d'indemnité)." % st.name)


func request_set_shift(sid: String, shift: String) -> Dictionary:
	if not staff.has(sid) or not SHIFTS.has(shift):
		return _fail("?")
	staff[sid].shift = shift
	staff_changed.emit()
	return _ok("%s passe en service de %s." % [staff[sid].name, shift])


func request_wage(sid: String, delta: float) -> Dictionary:
	if not staff.has(sid):
		return _fail("?")
	var st: Dictionary = staff[sid]
	st.wage = max(20.0, float(st.wage) + delta)
	if delta > 0:
		st.morale = min(100.0, float(st.morale) + delta * 0.6)
	else:
		st.morale = max(0.0, float(st.morale) + delta * 1.0)
	staff_changed.emit()
	return _ok("Salaire de %s : %s/jour." % [st.name, money(float(st.wage))])


func request_bonus(sid: String) -> Dictionary:
	if not staff.has(sid):
		return _fail("?")
	if not spend("primes", 50.0, false):
		return _fail("Fonds insuffisants.")
	staff[sid].morale = min(100.0, float(staff[sid].morale) + 15.0)
	staff_changed.emit()
	return _ok("Prime versée à %s : moral en hausse !" % staff[sid].name)


func request_train(sid: String) -> Dictionary:
	if not staff.has(sid):
		return _fail("?")
	var st: Dictionary = staff[sid]
	if float(st.skill) >= 1.6:
		return _fail("Compétence déjà maximale.")
	if not spend("formation", 180.0, false):
		return _fail("La formation coûte 180 $.")
	st.skill = snappedf(float(st.skill) + 0.12, 0.01)
	st.morale = min(100.0, float(st.morale) + 5.0)
	staff_changed.emit()
	return _ok("%s a suivi une formation : compétence %d%%." % [st.name, int(float(st.skill) * 100)])


func request_order(supply: String, qty: int, auto := false) -> Dictionary:
	var d: Dictionary = GameData.supplies.get(supply, {})
	if d.is_empty() or qty <= 0:
		return _fail("?")
	var cost := float(d.price) * qty
	if not spend("fournitures", cost, false):
		return _fail("Fonds insuffisants pour commander (%s)." % money(cost))
	var hours := float(GameData.bal("delivery_hours", 2.0)) * float(event.get("delivery_mult", 1.0))
	orders.append({"supply": supply, "qty": qty, "eta": now() + hours})
	return _ok(("Commande auto" if auto else "Commande") + " : %d × %s (%s), livraison dans %dh." % [qty, d.name, money(cost), int(ceil(hours))])


func request_buy_linen(qty: int) -> Dictionary:
	var cost := float(GameData.supplies.linge.price) * qty
	if not spend("fournitures", cost, false):
		return _fail("Fonds insuffisants.")
	clean_linen += qty
	return _ok("%d parures de linge neuf ajoutées." % qty)


func request_upgrade(id: String) -> Dictionary:
	var d: Dictionary = GameData.upgrades.get(id, {})
	if d.is_empty() or upgrades.has(id):
		return _fail("Déjà acquis.")
	if not spend("investissements", float(d.cost), false):
		return _fail("Il faut %s." % money(float(d.cost)))
	upgrades[id] = true
	if id == "washer_2":
		facilities.washer_2.locked = false
		facility_changed.emit("washer_2")
	_add_news("Investissement : %s." % d.name)
	return _ok("%s installé !" % d.name)


func request_marketing() -> Dictionary:
	var cost := float(GameData.bal("marketing_cost", 300))
	if not spend("marketing", cost, false):
		return _fail("Il faut %s." % money(cost))
	marketing_until = Clock.day + 2
	return _ok("Campagne publicitaire lancée : +30% de demande pendant 3 jours.")


func request_loan(amount: float) -> Dictionary:
	if debt + amount > 20000:
		return _fail("La banque refuse : plafond de 20 000 $.")
	cash += amount
	debt += amount
	return _ok("Prêt de %s accordé." % money(amount))


func request_repay(amount: float) -> Dictionary:
	amount = min(amount, debt)
	if amount <= 0 or cash < amount:
		return _fail("Impossible.")
	cash -= amount
	debt -= amount
	return _ok("Remboursé %s." % money(amount))


func request_buy_decor(def_id: String, x: float, z: float, r: float) -> Dictionary:
	var d: Dictionary = GameData.decor.get(def_id, {})
	if d.is_empty():
		return _fail("?")
	if not spend("décoration", float(d.price), false):
		return _fail("Il faut %s." % money(float(d.price)))
	var e := {"uid": _id(), "def": def_id, "x": x, "z": z, "rot": r}
	decor.append(e)
	decor_changed.emit()
	return _ok("%s installé." % d.name, {"uid": e.uid})


func request_move_decor(uid: int, x: float, z: float, r: float) -> Dictionary:
	for e in decor:
		if int(e.uid) == uid:
			e.x = x
			e.z = z
			e.rot = r
			decor_changed.emit()
			return _ok("Déplacé.")
	return _fail("?")


func request_sell_decor(uid: int) -> Dictionary:
	for e in decor:
		if int(e.uid) == uid:
			var refund := float(GameData.decor[e.def].price) * 0.4
			decor.erase(e)
			earn("reventes", refund)
			decor_changed.emit()
			return _ok("Revendu %s." % money(refund))
	return _fail("?")


func request_toggle_dnd(rid: String) -> Dictionary:
	var r: Dictionary = rooms.get(rid, {})
	if r.is_empty():
		return _fail("?")
	r.dnd = not r.dnd
	room_changed.emit(rid)
	return _ok("« Ne pas déranger » %s." % ("activé" if r.dnd else "retiré"))


func _add_news(t: String) -> void:
	news.push_front("[%s] %s" % [Clock.time_string(), t])
	if news.size() > 40:
		news.pop_back()


# =====================================================================
#  SAVE / LOAD
# =====================================================================
func to_dict() -> Dictionary:
	return {"cash": cash, "today": today, "history": history, "rooms": rooms, "guests": guests, "staff": staff,
		"candidates": candidates, "tasks": tasks, "stock": stock, "orders": orders, "auto_reorder": auto_reorder,
		"prices": prices, "facilities": facilities, "upgrades": upgrades, "washers": washers, "dirty_linen": dirty_linen,
		"clean_linen": clean_linen, "spills": spills.values(), "decor": decor, "reviews": reviews, "reputation": reputation,
		"event": event, "stats": stats, "news": news, "debt": debt, "player_xp": player_xp, "marketing_until": marketing_until,
		"totals": totals, "next_id": _next_id}


func from_dict(d: Dictionary) -> void:
	cash = float(d.cash)
	today = d.today
	history = d.history
	rooms = d.rooms
	for r in rooms.values():
		r.floor = int(r.floor)
		r.idx = int(r.idx)
	guests = d.guests
	staff = d.staff
	candidates = d.candidates
	tasks = d.tasks
	for t in tasks:
		t.id = int(t.id)
		t.step = int(t.step)
		t.spill = int(t.spill)
		t.assignee = ""          # actors are recreated: everything is re-dispatched
	stock = d.stock
	orders = d.orders
	auto_reorder = bool(d.auto_reorder)
	prices = d.prices
	facilities = d.facilities
	upgrades = d.upgrades
	washers = d.washers
	dirty_linen = int(d.dirty_linen)
	clean_linen = int(d.clean_linen)
	spills = {}
	for s in d.spills:
		s.id = int(s.id)
		s.floor = int(s.floor)
		spills[int(s.id)] = s
	decor = d.decor
	for e in decor:
		e.uid = int(e.uid)
	reviews = d.reviews
	reputation = float(d.reputation)
	event = d.event
	stats = d.stats
	news = d.news
	debt = float(d.debt)
	player_xp = d.player_xp
	marketing_until = int(d.marketing_until)
	totals = d.get("totals", {})
	_next_id = int(d.next_id)
	# Guests in transit when saving are put back in a stable state.
	for g in guests.values():
		match g.state:
			"arriving", "at_desk":
				g.state = "booked"
				g.arrival = now() + 0.2
				for t in tasks.duplicate():
					if t.guest == g.id and t.type == "checkin":
						tasks.erase(t)
			"to_room", "returning", "cafe", "concierge":
				g.state = "in_room"
			"going_out":
				g.state = "away"
			"checkout_walk", "checkout_desk":
				g.state = "in_room"
				for t in tasks.duplicate():
					if t.guest == g.id and t.type == "checkout":
						tasks.erase(t)
			"leaving":
				g.state = "gone"
		if g.state == "in_room":
			for t in tasks.duplicate():
				if t.guest == g.id and t.type in ["cafe_order", "concierge"]:
					tasks.erase(t)
