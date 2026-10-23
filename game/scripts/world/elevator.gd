class_name Elevator
extends Node3D
## One shared cabin serving every floor (collective control: it stops at
## floors where someone waits or wants to get off). When the elevator is
## broken, riders take the service stairs (slower, guests complain).

const DOOR_TIME := 1.0

var layout: HotelLayout
var cabin := 0.0               # current (fractional) floor
var state := "idle"            # idle | moving | doors
var _door_t := 0.0
var pickups := {}              # floor -> [req]
var onboard := []              # [req]
var stairs := []               # [{req, t}]
var dir := 0
var _doors := []               # per floor: [left, right]
var _indicators := []
var waits := []                # recent waiting times (s)


func setup(lay: HotelLayout) -> void:
	layout = lay
	for f in layout.floors:
		var n: Node3D = layout.floor_nodes[f]
		var l := MeshFactory.box(n, Vector3(1.2, 2.5, 0.08), Vector3(-1.6, 1.25, -1.45), Color("#c0c0c0"))
		var r := MeshFactory.box(n, Vector3(1.2, 2.5, 0.08), Vector3(-0.4, 1.25, -1.45), Color("#c0c0c0"))
		_doors.append([l, r])
		MeshFactory.box(n, Vector3(2.8, 0.3, 0.1), Vector3(-1.0, 2.7, -1.42), Color("#212529"))
		var ind := MeshFactory.label(n, "", Vector3(-1.0, 2.7, -1.3), 40, Color("#ffd166"), false)
		ind.outline_size = 0
		_indicators.append(ind)
		MeshFactory.box(n, Vector3(0.2, 0.35, 0.06), Vector3(0.6, 1.3, -1.42), Color("#e9c46a"))


func sec_per_floor() -> float:
	return 0.9 if Hotel.upgrades.has("elevator_speed") else 1.6


func is_ok() -> bool:
	return bool(Hotel.facilities.elevator.ok)


## Ask for a ride. cb() is called when the rider reaches floor `to`.
func request(rider: Object, from: int, to: int, cb: Callable) -> void:
	var req := {"rider": rider, "from": from, "to": to, "cb": cb, "t0": Time.get_ticks_msec() / 1000.0}
	if from == to:
		cb.call()
		return
	if not is_ok():
		stairs.append({"req": req, "t": 2.0 + 2.6 * abs(to - from)})
		return
	if not pickups.has(from):
		pickups[from] = []
	pickups[from].append(req)


func waiting_count() -> int:
	var n := 0
	for f in pickups:
		n += pickups[f].size()
	return n


func cancel(rider: Object) -> void:
	for f in pickups:
		pickups[f] = pickups[f].filter(func(q): return q.rider != rider)
	onboard = onboard.filter(func(q): return q.rider != rider)
	stairs = stairs.filter(func(s): return s.req.rider != rider)


func _process(delta: float) -> void:
	var dt := delta * Clock.time_scale
	for s in stairs.duplicate():
		s.t -= dt
		if s.t <= 0.0:
			stairs.erase(s)
			_deliver(s.req)
	if not is_ok():
		# Waiting riders switch to the stairs.
		for f in pickups.keys():
			for q in pickups[f]:
				stairs.append({"req": q, "t": 2.0 + 2.6 * abs(int(q.to) - int(q.from))})
			pickups.erase(f)
	match state:
		"doors":
			_door_t -= dt
			if _door_t <= 0.0:
				state = "idle"
		"idle", "moving":
			var stop := _next_stop()
			if stop < 0:
				state = "idle"
				dir = 0
			elif abs(cabin - stop) < 0.02:
				cabin = stop
				_arrive(stop)
			else:
				state = "moving"
				dir = 1 if stop > cabin else -1
				cabin = move_toward(cabin, stop, dt / sec_per_floor())
	_update_visuals(delta)


func _next_stop() -> int:
	var stops := []
	for f in pickups:
		if not pickups[f].is_empty():
			stops.append(int(f))
	for q in onboard:
		stops.append(int(q.to))
	if stops.is_empty():
		return -1
	# keep going in the current direction if possible
	var best := -1
	var best_d := INF
	for s in stops:
		var d := float(s) - cabin
		if dir != 0 and sign(d) != dir and abs(d) > 0.02:
			continue
		if abs(d) < best_d:
			best_d = abs(d)
			best = s
	if best < 0:
		for s in stops:
			if abs(float(s) - cabin) < best_d:
				best_d = abs(float(s) - cabin)
				best = s
	return best


func _arrive(f: int) -> void:
	for q in onboard.duplicate():
		if int(q.to) == f:
			onboard.erase(q)
			_deliver(q)
	if pickups.has(f):
		for q in pickups[f]:
			waits.append(Time.get_ticks_msec() / 1000.0 - float(q.t0))
			onboard.append(q)
		pickups.erase(f)
	while waits.size() > 30:
		waits.pop_front()
	state = "doors"
	_door_t = DOOR_TIME


func _deliver(q: Dictionary) -> void:
	if is_instance_valid(q.rider):
		q.cb.call()


func avg_wait() -> float:
	if waits.is_empty():
		return 0.0
	var s := 0.0
	for w in waits:
		s += w
	return s / waits.size()


func _update_visuals(delta: float) -> void:
	var cur := int(round(cabin))
	for f in _doors.size():
		var open := state == "doors" and cur == f
		var l: MeshInstance3D = _doors[f][0]
		var r: MeshInstance3D = _doors[f][1]
		l.position.x = lerp(l.position.x, -2.6 if open else -1.6, 8.0 * delta)
		r.position.x = lerp(r.position.x, 0.6 if open else -0.4, 8.0 * delta)
		var arrow := "^" if dir > 0 else ("v" if dir < 0 else "")
		_indicators[f].text = ("EN PANNE" if not is_ok() else "%s %s" % [arrow, "RDC" if cur == 0 else str(cur)])
		_indicators[f].modulate = Color("#ff006e") if not is_ok() else Color("#ffd166")
