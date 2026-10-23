class_name CharacterVisual
extends Node3D
## Wobbly, googly-eyed bean people. Pure procedural meshes + a squash/stretch
## wobble driven by movement speed — cheap and readable at any distance.

var body: MeshInstance3D
var head: Node3D
var hand_l: MeshInstance3D
var hand_r: MeshInstance3D
var held: Node3D             # anchor for carried items
var _t := 0.0
var speed := 0.0             # set by the owner each frame
var excited := 0.0           # little jump of joy / anger


func build(body_color: Color, skin: Color, hat_color := Color(0, 0, 0, 0), scale_f := 1.0) -> void:
	scale = Vector3.ONE * scale_f
	body = MeshFactory.capsule(self, 0.38, 1.1, Vector3(0, 0.62, 0), body_color)
	head = Node3D.new()
	head.position = Vector3(0, 1.38, 0)
	add_child(head)
	MeshFactory.sphere(head, 0.33, Vector3.ZERO, skin)
	for side in [-1, 1]:
		MeshFactory.sphere(head, 0.11, Vector3(0.12 * side, 0.06, 0.27), Color.WHITE)
		MeshFactory.sphere(head, 0.055, Vector3(0.12 * side, 0.06, 0.36), Color(0.08, 0.08, 0.1))
	MeshFactory.box(head, Vector3(0.16, 0.035, 0.03), Vector3(0, -0.12, 0.31), Color(0.35, 0.12, 0.12))
	if hat_color.a > 0.0:
		MeshFactory.cylinder(head, 0.36, 0.05, Vector3(0, 0.25, 0), hat_color)
		MeshFactory.cylinder(head, 0.22, 0.25, Vector3(0, 0.38, 0), hat_color)
	hand_l = MeshFactory.sphere(self, 0.12, Vector3(-0.45, 0.7, 0.1), skin)
	hand_r = MeshFactory.sphere(self, 0.12, Vector3(0.45, 0.7, 0.1), skin)
	held = Node3D.new()
	held.position = Vector3(0, 0.85, 0.55)
	add_child(held)


func _process(delta: float) -> void:
	_t += delta * (4.0 + speed * 2.0)
	var amp: float = clamp(speed / 5.0, 0.0, 1.0)
	if body:
		body.scale = Vector3(1.0 + 0.04 * sin(_t * 2.0) * amp, 1.0 - 0.05 * sin(_t * 2.0) * amp, 1.0)
		body.rotation.z = 0.08 * sin(_t) * amp
		head.position.y = 1.38 + 0.05 * abs(sin(_t)) * amp
		head.rotation.z = 0.12 * sin(_t * 0.5 + 1.0) * amp + 0.03 * sin(_t * 0.3)
		hand_l.position = Vector3(-0.45, 0.7 + 0.12 * sin(_t) * amp, 0.1 + 0.15 * cos(_t) * amp)
		hand_r.position = Vector3(0.45, 0.7 - 0.12 * sin(_t) * amp, 0.1 - 0.15 * cos(_t) * amp)
		if held.get_child_count() > 0:
			hand_l.position = Vector3(-0.3, 0.85, 0.45)
			hand_r.position = Vector3(0.3, 0.85, 0.45)
	if excited > 0.0:
		excited = max(0.0, excited - delta)
		position.y = abs(sin(excited * 12.0)) * 0.3 * excited


static func random_colors(rng: RandomNumberGenerator) -> Array:
	var bodies := ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#8338ec", "#ff7f51", "#3a86ff", "#fb5607", "#80ed99", "#f15bb5"]
	var skins := ["#ffdbac", "#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffe0bd"]
	return [Color(bodies[rng.randi() % bodies.size()]), Color(skins[rng.randi() % skins.size()])]
