class_name NPC
extends Node3D
## Lightweight non-physics character that follows waypoints (customers,
## staff, pedestrians). Physics-free on purpose: hundreds can exist cheaply.

signal arrived

var visual: CharacterVisual
var path: Array = []          # world-space Vector3 waypoints
var move_speed := 3.0
var bubble: Label3D
var _bubble_t := 0.0
var data := {}                # gameplay payload (customer order, etc.)
var state := ""


func setup(rng: RandomNumberGenerator, apron := Color(0, 0, 0, 0), hat := Color(0, 0, 0, 0)) -> void:
	visual = CharacterVisual.new()
	add_child(visual)
	var cols := CharacterVisual.random_colors(rng)
	visual.build(apron if apron.a > 0 else cols[0], cols[1], hat, rng.randf_range(0.85, 1.05))
	bubble = MeshFactory.label(self, "", Vector3(0, 2.3, 0), 40, Color.WHITE)
	bubble.visible = false
	move_speed = rng.randf_range(2.4, 3.4)


func go(points: Array) -> void:
	path = points.duplicate()


func is_moving() -> bool:
	return not path.is_empty()


func say(text: String, duration := 2.5, col := Color.WHITE) -> void:
	bubble.text = text
	bubble.modulate = col
	bubble.visible = text != ""
	_bubble_t = duration


func _process(delta: float) -> void:
	if not path.is_empty():
		var target: Vector3 = path[0]
		var to := target - global_position
		to.y = 0
		var step := move_speed * delta
		if to.length() <= step:
			global_position = Vector3(target.x, global_position.y, target.z)
			path.pop_front()
			if path.is_empty():
				arrived.emit()
		else:
			global_position += to.normalized() * step
			visual.rotation.y = lerp_angle(visual.rotation.y, atan2(to.x, to.z), 10.0 * delta)
		visual.speed = move_speed
	else:
		visual.speed = 0.0
	if _bubble_t > 0.0:
		_bubble_t -= delta
		if _bubble_t <= 0.0 and state != "ordering":
			bubble.visible = false


func face(point: Vector3) -> void:
	var to := point - global_position
	visual.rotation.y = atan2(to.x, to.z)
