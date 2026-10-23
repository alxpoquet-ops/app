class_name CafeService
extends Node3D
## "Live" simulation of a café when a player is nearby: visible customers walk
## in, queue, order; AI baristas (one per employee, max 3 shown) or the player
## prepare and serve. When nobody is near, the same café is simulated
## abstractly by Economy._serve_abstract (same rules, no animation).

const SERVE_SPOTS := [Vector3(-2.4, 0, -0.85), Vector3(-0.8, 0, -0.85), Vector3(0.8, 0, -0.85)]
const STAFF_Z := -2.6
const DOOR_IN := Vector3(0, 0, 3.6)
const DOOR := Vector3(0, 0, 5.6)
const STREET := Vector3(0, 0, 9.5)
const MAX_CUSTOMERS := 9

var building: Node3D          # BusinessBuilding
var biz_id := ""
var customers: Array = []     # NPC nodes in arrival order
var workers: Array = []       # NPC nodes
var rng := RandomNumberGenerator.new()
var _pending_spawns: Array = []   # [time_left, customer_dict]


func setup(b: Node3D) -> void:
	building = b
	biz_id = b.biz_id
	rng.randomize()


func biz() -> Business:
	return Economy.businesses.get(biz_id)


func item_name(item: String) -> String:
	var m: Dictionary = biz().menu().get(item, {})
	return m.get("name", item)


func queue_length() -> int:
	return customers.size()


# ------------------------------------------------------------------ spawning
func enqueue_customer(c: Dictionary) -> void:
	# Spread arrivals across the in-game hour so they don't come in clumps.
	var hour_seconds := float(GameData.bal("real_seconds_per_game_day", 720)) / 24.0
	_pending_spawns.append([rng.randf_range(0.0, hour_seconds * 0.9), c])


func _spawn_customer(c: Dictionary) -> void:
	if customers.size() >= MAX_CUSTOMERS:
		# Visibly full: the customer gives up immediately.
		Economy.record_lost_customer(biz_id, "attente")
		return
	var n := NPC.new()
	building.add_child(n)
	n.setup(rng)
	n.position = STREET + Vector3(rng.randf_range(-3, 3), 0, 0)
	n.data = c.duplicate()
	n.data["patience"] = 38.0 + (25.0 if c.profile == "gourmet" else 0.0) - (12.0 if c.profile == "pressé" else 0.0)
	n.data["claimed"] = null
	n.state = "walking_in"
	customers.append(n)
	n.go([_g(DOOR), _g(DOOR_IN), _g(_slot_pos(customers.size() - 1))])


func _g(local: Vector3) -> Vector3:
	return building.to_global(local)


func _slot_pos(i: int) -> Vector3:
	if i < SERVE_SPOTS.size():
		return SERVE_SPOTS[i]
	return Vector3(2.4, 0, 0.4 + 0.85 * (i - SERVE_SPOTS.size()))


func despawn_all() -> void:
	# Player left: customers still waiting are served abstractly (no free loss).
	for n in customers:
		if is_instance_valid(n):
			Economy._serve_abstract(biz(), n.data)
			n.queue_free()
	customers.clear()
	for pending in _pending_spawns:
		Economy._serve_abstract(biz(), pending[1])
	_pending_spawns.clear()
	for w in workers:
		if is_instance_valid(w):
			w.queue_free()
	workers.clear()


# ------------------------------------------------------------------ main loop
func _process(delta: float) -> void:
	var b := biz()
	if b == null:
		return
	for pending in _pending_spawns.duplicate():
		pending[0] -= delta
		if pending[0] <= 0.0:
			_pending_spawns.erase(pending)
			_spawn_customer(pending[1])
	_sync_workers(b)
	# queue management
	for i in customers.size():
		var n: NPC = customers[i]
		if not is_instance_valid(n):
			continue
		if n.state in ["walking_in", "waiting", "ordering"]:
			var slot := _g(_slot_pos(i))
			if not n.is_moving() and n.global_position.distance_to(slot) > 0.2:
				n.go([slot])
			if not n.is_moving():
				if i < SERVE_SPOTS.size():
					if n.state != "ordering":
						n.state = "ordering"
						n.say("%s ?" % item_name(n.data.item), 999.0, Color("#fff1a8"))
					n.face(_g(Vector3(n.position.x, 0, STAFF_Z)))
				elif n.state == "walking_in":
					n.state = "waiting"
			n.data.patience -= delta
			if n.data.patience <= 0.0 and (n.data.claimed == null or n.data.patience < -25.0):
				_leave(n, "Trop long !", Color("#ff6b6b"))
				Economy.record_lost_customer(biz_id, "attente")
				return
	for w in workers:
		_update_worker(w, delta)


func _leave(n: NPC, text: String, col: Color) -> void:
	customers.erase(n)
	n.state = "leaving"
	n.data.claimed = null
	n.say(text, 2.5, col)
	n.go([_g(DOOR_IN), _g(DOOR), _g(STREET + Vector3(rng.randf_range(-6, 6), 0, 2))])
	n.arrived.connect(n.queue_free, CONNECT_ONE_SHOT)


func _complete(n: NPC, paid: float) -> void:
	n.visual.excited = 0.6
	_leave(n, "Merci ! +%s" % Economy.money(paid), Color("#80ed99"))


# ------------------------------------------------------------------ AI baristas
func _sync_workers(b: Business) -> void:
	var wanted: int = min(b.employees.size(), 3)
	while workers.size() < wanted:
		var w := NPC.new()
		building.add_child(w)
		w.setup(rng, Color("#264653"), Color("#2a9d8f"))
		w.move_speed = 3.2
		w.position = Vector3(-1.5 + workers.size() * 1.4, 0, -3.3)
		var emp: Dictionary = b.employees[workers.size()]
		w.data = {"skill": float(emp.skill), "name": emp.name, "customer": null, "machine": null, "timer": 0.0}
		w.state = "idle"
		workers.append(w)
	while workers.size() > wanted:
		var w: NPC = workers.pop_back()
		_release(w)
		w.queue_free()


func _release(w: NPC) -> void:
	if w.data.customer and is_instance_valid(w.data.customer):
		w.data.customer.data.claimed = null
	if w.data.machine and is_instance_valid(w.data.machine):
		w.data.machine.busy_by = null
		w.data.machine.progress = 0.0
	w.data.customer = null
	w.data.machine = null


func _update_worker(w: NPC, delta: float) -> void:
	var c = w.data.customer
	if c != null and (not is_instance_valid(c) or c.state == "leaving"):
		_release(w)
		w.state = "idle"
		return
	match w.state:
		"idle":
			for n in customers:
				if n.state == "ordering" and n.data.claimed == null:
					_start_order(w, n)
					break
		"to_station":
			if not w.is_moving():
				w.state = "preparing"
				var m = w.data.machine
				var speed := 1.0
				if m != null:
					var d := GameData.equip(m.def_id)
					speed = float(d.get("speed", 1.0)) * Business.condition_factor(float(m.entry.condition))
				w.data.timer = float(biz().menu()[c.data.item].get("prep_time", 4.0)) * 0.6 / max(0.2, speed * float(w.data.skill))
				w.data.total = w.data.timer
		"preparing":
			w.data.timer -= delta
			if w.data.machine:
				w.data.machine.progress = 1.0 - w.data.timer / max(0.01, float(w.data.total))
			if w.data.timer <= 0.0:
				if w.data.machine:
					w.data.machine.busy_by = null
					w.data.machine.progress = 0.0
					w.data.machine = null
				w.state = "to_counter"
				w.go([_g(Vector3(c.position.x, 0, STAFF_Z))])
		"to_counter":
			if not w.is_moving():
				var b := biz()
				var q := b.quality()
				var paid := Economy.complete_sale(biz_id, c.data.item, q, c.data.payer, 0.0)
				if paid > 0.0:
					_complete(c, paid)
				else:
					_leave(c, "Rupture de stock !", Color("#ff6b6b"))
					Economy.record_lost_customer(biz_id, "stock")
				w.data.customer = null
				w.state = "idle"
				w.go([_g(Vector3(-1.5 + workers.find(w) * 1.4, 0, -3.3))])


func _start_order(w: NPC, n: NPC) -> void:
	var b := biz()
	var needs_machine: bool = b.menu()[n.data.item].get("machine", false)
	var station = _find_station(needs_machine, w)
	if station == null:
		_leave(n, "Pas de %s ici ?!" % ("machine" if needs_machine else "vitrine"), Color("#ff6b6b"))
		Economy.record_lost_customer(biz_id, "stock")
		return
	n.data.claimed = w
	w.data.customer = n
	if needs_machine:
		station.busy_by = w
		w.data.machine = station
	w.state = "to_station"
	w.go([_g(Vector3(station.position.x, 0, STAFF_Z)), station.to_global(Vector3(0, 0, 0.85))])


func _find_station(machine: bool, user) -> EquipmentNode:
	var best: EquipmentNode = null
	for e in building.equipment_nodes:
		var cat: String = GameData.equip(e.def_id).get("category", "")
		if machine and cat == "machine" and (e.busy_by == null or e.busy_by == user):
			if best == null or GameData.equip(e.def_id).get("speed", 1.0) > GameData.equip(best.def_id).get("speed", 1.0):
				best = e
		elif not machine and cat == "display":
			return e
	return best


# ------------------------------------------------------------------ player as barista
func player_can_work(p: Player) -> bool:
	var b := biz()
	if b == null:
		return false
	if b.owner_id == p.player_id:
		return true
	var j: Dictionary = Economy.job_of(p.player_id)
	return j.get("type", "") == "barista" and j.get("biz_id", "") == biz_id


func work_hint(p: Player) -> String:
	var b := biz()
	if b.is_ai():
		return "Demandez un service au comptoir (E) pour travailler ici"
	return ""


func next_order_for(machine: bool):
	var b := biz()
	for n in customers:
		if n.state == "ordering" and n.data.claimed == null and bool(b.menu()[n.data.item].get("machine", false)) == machine:
			return n
	return null


func player_brew(p: Player, m: EquipmentNode) -> void:
	var c = next_order_for(true)
	if c == null:
		return
	var b := biz()
	var item: String = c.data.item
	if not Economy._has_ingredients(b, item):
		p.world.toast("Stock insuffisant pour un %s ! Commandez des ingrédients." % item_name(item), "warn")
		return
	c.data.claimed = p
	m.busy_by = p
	p.busy = true
	var d := GameData.equip(m.def_id)
	var speed := float(d.get("speed", 1.0)) * Business.condition_factor(float(m.entry.condition))
	var duration: float = float(b.menu()[item].get("prep_time", 4.0)) * 0.7 / max(0.2, speed)
	p.world.hud.start_brew_minigame(duration, m, func(mult: float):
		p.busy = false
		m.busy_by = null
		m.progress = 0.0
		var q: float = b.machine_quality() * mult
		var label := "Excellent !" if mult >= 1.2 else ("Correct" if mult >= 0.95 else "Un peu raté…")
		p.carry({"type": "drink", "item": item, "quality": q, "biz_id": biz_id, "label": item_name(item), "for": c},
			func(n): _drink_mesh(n, item))
		p.world.toast("%s préparé — %s" % [item_name(item), label], "ok" if mult >= 0.95 else "info"))


func player_take_pastry(p: Player) -> void:
	var c = next_order_for(false)
	if c == null:
		return
	if not Economy._has_ingredients(biz(), "croissant"):
		p.world.toast("Plus de croissants en stock !", "warn")
		return
	c.data.claimed = p
	p.carry({"type": "drink", "item": "croissant", "quality": 1.05, "biz_id": biz_id, "label": "croissant", "for": c},
		func(n): _drink_mesh(n, "croissant"))


static func _drink_mesh(n: Node3D, item: String) -> void:
	if item == "croissant":
		var c := MeshFactory.capsule(n, 0.08, 0.32, Vector3.ZERO, Color("#d99a3d"))
		c.rotation.z = PI / 2
		MeshFactory.cylinder(n, 0.18, 0.02, Vector3(0, -0.07, 0), Color.WHITE)
	else:
		MeshFactory.cylinder(n, 0.09 if item == "espresso" else 0.12, 0.14 if item == "espresso" else 0.2, Vector3.ZERO, Color.WHITE)
		MeshFactory.cylinder(n, 0.08 if item == "espresso" else 0.11, 0.01, Vector3(0, 0.08 if item == "espresso" else 0.1, 0), Color("#6f4518") if item == "espresso" else Color("#e6ccb2"))
		MeshFactory.cylinder(n, 0.18, 0.02, Vector3(0, -0.08, 0), Color.WHITE)


## Counter interaction: start a shift, or serve what we carry.
func counter_prompt(p: Player) -> String:
	var b := biz()
	if b == null:
		return ""
	if not player_can_work(p):
		if b.is_ai():
			return "[E] Travailler ici comme barista (%s/commande + pourboires)" % Economy.money(float(GameData.bal("barista_job_pay_per_drink", 1.6)))
		return ""
	if p.carrying.get("type", "") == "drink" and p.carrying.get("biz_id", "") == biz_id:
		var target = _customer_for(p)
		if target == null:
			return "Personne n'attend ce %s… [G] pour le jeter" % p.carrying.label
		return "[E] Servir %s" % p.carrying.label
	if customers.is_empty():
		return "Comptoir — en attente de clients"
	return "Clients en attente : %d — préparez à la machine / vitrine" % customers.size()


func _customer_for(p: Player):
	var want = p.carrying.get("for")
	if want != null and is_instance_valid(want) and want.state == "ordering":
		return want
	for n in customers:
		if n.state == "ordering" and n.data.item == p.carrying.item and (n.data.claimed == null or n.data.claimed == p):
			return n
	return null


func counter_action(p: Player) -> void:
	var b := biz()
	if not player_can_work(p):
		if b.is_ai():
			var r: Dictionary = Economy.request_start_shift(p.player_id, biz_id)
			p.world.toast(r.msg, "ok" if r.ok else "warn")
		return
	if p.carrying.get("type", "") != "drink":
		return
	var target = _customer_for(p)
	if target == null:
		return
	var r: Dictionary = Economy.request_live_serve(p.player_id, biz_id, p.carrying.item, float(p.carrying.quality), target.data.payer)
	if r.ok:
		_complete(target, float(r.paid))
		var earned := float(r.get("earned", 0.0))
		if earned > 0.0:
			p.world.toast("Commande servie : +%s pour vous (dont pourboire %s)" % [Economy.money(earned), Economy.money(float(r.tip))], "money")
		else:
			p.world.toast("Vente : +%s pour votre café%s" % [Economy.money(float(r.paid)), " (pourboire inclus)" if float(r.tip) > 0 else ""], "money")
		p.world.stats_add("served", 1)
	else:
		p.world.toast(r.msg, "warn")
		_leave(target, "Bon… tant pis.", Color("#ff6b6b"))
		Economy.record_lost_customer(biz_id, "stock")
	p.clear_carry()
