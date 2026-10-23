class_name Actor
extends Node3D
## Physics-free walker that can change floors through the elevator.
## Used by guests, staff and café visitors. Movement is scaled by the game
## time scale so the whole hotel can be fast-forwarded.

var world: Node
var floor := 0
var visual: CharacterVisual
var bubble: Label3D
var move_speed := 3.0
var riding := false
var path: Array = []                 # world-space waypoints on the current floor
var _dest_floor := 0
var _dest_local := Vector3.ZERO
var _on_arrive := Callable()
var _bubble_t := 0.0
var carry_node: Node3D = null
var hidden_in_room := false


func setup_actor(w: Node, rng: RandomNumberGenerator, outfit := Color(0, 0, 0, 0), hat := Color(0, 0, 0, 0), scale_f := -1.0) -> void:
	world = w
	visual = CharacterVisual.new()
	add_child(visual)
	var cols := CharacterVisual.random_colors(rng)
	visual.build(outfit if outfit.a > 0 else cols[0], cols[1], hat, rng.randf_range(0.85, 1.05) if scale_f < 0 else scale_f)
	bubble = MeshFactory.label(self, "", Vector3(0, 2.35, 0), 34, Color.WHITE)
	bubble.visible = false


func place(f: int, local: Vector3) -> void:
	floor = f
	global_position = world.layout.world_pos(f, local)


func place_at(key: String) -> void:
	var p: Dictionary = world.layout.point(key)
	place(int(p.floor), p.pos)


## Walk to a named point (any floor). cb is called on arrival.
func go_point(key: String, cb := Callable(), offset := Vector3.ZERO) -> void:
	var p: Dictionary = world.layout.point(key)
	if p.is_empty():
		push_warning("Unknown point " + key)
		if cb.is_valid():
			cb.call()
		return
	go_to(int(p.floor), p.pos + offset, cb)


func go_to(f: int, local: Vector3, cb := Callable()) -> void:
	_dest_floor = f
	_dest_local = local
	world.elevator.cancel(self)
	riding = false
	if f == floor:
		_on_arrive = cb
		_walk_local(local)
	else:
		_final_cb = cb
		_on_arrive = _call_elevator
		_walk_local(world.layout.point("elevator_front:%d" % floor).pos)


var _final_cb := Callable()


func _call_elevator() -> void:
	riding = true
	path = []
	world.elevator.request(self, floor, _dest_floor, _off_elevator)


func _off_elevator() -> void:
	riding = false
	place_at("elevator_front:%d" % _dest_floor)
	_on_arrive = _final_cb
	_final_cb = Callable()
	_walk_local(_dest_local)


func _walk_local(local: Vector3) -> void:
	var start := Vector3(global_position.x, 0, global_position.z)
	var pts: Array = world.layout.path(floor, start, local)
	path = []
	for q in pts:
		path.append(world.layout.world_pos(floor, q))


func stop() -> void:
	path = []
	_on_arrive = Callable()
	_final_cb = Callable()
	world.elevator.cancel(self)
	riding = false


func is_moving() -> bool:
	return not path.is_empty() or riding


func say(text: String, duration := 2.5, col := Color.WHITE) -> void:
	bubble.text = text
	bubble.modulate = col
	bubble.visible = text != ""
	_bubble_t = duration


func carry(kind: String) -> void:
	drop()
	if kind == "":
		return
	carry_node = Node3D.new()
	visual.held.add_child(carry_node)
	CarryProps.build(carry_node, kind)


func drop() -> void:
	if carry_node:
		carry_node.queue_free()
		carry_node = null


func _process(delta: float) -> void:
	var dt := delta * Clock.time_scale
	if not path.is_empty():
		var target: Vector3 = path[0]
		var to := target - global_position
		to.y = 0
		var step := move_speed * dt
		if to.length() <= step:
			global_position = Vector3(target.x, global_position.y, target.z)
			path.pop_front()
			if path.is_empty():
				var cb := _on_arrive
				_on_arrive = Callable()
				if cb.is_valid():
					cb.call()
		else:
			global_position += to.normalized() * step
			visual.rotation.y = lerp_angle(visual.rotation.y, atan2(to.x, to.z), 10.0 * delta)
		visual.speed = move_speed * min(Clock.time_scale, 2.0)
	else:
		visual.speed = 0.0
	if _bubble_t > 0.0:
		_bubble_t -= delta
		if _bubble_t <= 0.0:
			bubble.visible = false
	visible = not riding and not hidden_in_room and world.is_floor_visible(floor)


func face(p: Vector3) -> void:
	var to := p - global_position
	visual.rotation.y = atan2(to.x, to.z)
