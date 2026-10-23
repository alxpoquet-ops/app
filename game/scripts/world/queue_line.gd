class_name QueueLine
extends RefCounted
## A line of people waiting at a desk/counter. Members shuffle forward.

var world: Node
var floor := 0
var head := Vector3.ZERO
var step := Vector3(1, 0, 0)
var members: Array = []


func _init(w: Node, f: int, head_pos: Vector3, step_vec: Vector3) -> void:
	world = w
	floor = f
	head = head_pos
	step = step_vec


func spot(i: int) -> Vector3:
	return head + step * i


func join(a: Actor, on_reach := Callable()) -> void:
	if not a in members:
		members.append(a)
	a.set_meta("queue_cb", on_reach)
	_send(a, members.size() - 1)


func leave(a: Actor) -> void:
	if a in members:
		members.erase(a)
		for i in members.size():
			var m: Actor = members[i]
			if is_instance_valid(m) and not m.is_moving():
				_send(m, i)


func _send(a: Actor, i: int) -> void:
	var cb: Callable = a.get_meta("queue_cb", Callable())
	a.go_to(floor, spot(i), func():
		a.face(world.layout.world_pos(floor, head - step))
		if cb.is_valid():
			a.set_meta("queue_cb", Callable())
			cb.call())


func length() -> int:
	return members.size()
