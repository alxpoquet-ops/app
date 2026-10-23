class_name Vehicle
extends CharacterBody3D
## Arcade utility van: fun, stable and cheap (no wheel physics). Carries one
## crate in its cargo bed, which makes delivery jobs much faster.

var driver: Player = null
var speed := 0.0
var steer := 0.0
var heading := 0.0
var max_speed := 22.0
var color := Color("#4361ee")
var cargo_node: Node3D
var body_node: Node3D
var _wheels := []
var _honk_t := 0.0


func _ready() -> void:
	collision_layer = 1
	collision_mask = 1
	add_to_group("vehicles")
	var cs := CollisionShape3D.new()
	var sh := BoxShape3D.new()
	sh.size = Vector3(2.0, 1.4, 4.0)
	cs.shape = sh
	cs.position = Vector3(0, 0.95, 0)
	add_child(cs)
	body_node = Node3D.new()
	add_child(body_node)
	MeshFactory.box(body_node, Vector3(2.0, 0.8, 4.0), Vector3(0, 0.75, 0), color)
	MeshFactory.box(body_node, Vector3(1.9, 0.9, 1.6), Vector3(0, 1.55, 0.9), color.lightened(0.15))
	MeshFactory.box(body_node, Vector3(1.8, 0.6, 0.05), Vector3(0, 1.65, 1.71), Color(0.6, 0.85, 1.0, 0.8))
	MeshFactory.box(body_node, Vector3(1.9, 0.12, 2.0), Vector3(0, 1.2, -0.95), Color("#2b2d42"))
	MeshFactory.sphere(body_node, 0.15, Vector3(-0.7, 0.85, 2.02), Color("#fff3b0"), 2.0)
	MeshFactory.sphere(body_node, 0.15, Vector3(0.7, 0.85, 2.02), Color("#fff3b0"), 2.0)
	for p in [Vector3(-1.0, 0.4, 1.3), Vector3(1.0, 0.4, 1.3), Vector3(-1.0, 0.4, -1.3), Vector3(1.0, 0.4, -1.3)]:
		var w := MeshFactory.cylinder(body_node, 0.4, 0.3, p, Color("#222222"))
		w.rotation.z = PI / 2
		_wheels.append(w)
	MeshFactory.label(body_node, "UTILITAIRE", Vector3(0, 1.0, -2.05), 40, Color.WHITE, false).rotation.y = PI
	cargo_node = Node3D.new()
	cargo_node.position = Vector3(0, 1.3, -0.95)
	add_child(cargo_node)
	heading = rotation.y
	var it := Interactable.make(self, Vector3(-1.4, 1.0, 0.0), 3.0,
		func(p): return "[F] Conduire le véhicule" if p.vehicle == null else "", func(_p): pass)
	it.priority = -1


func seat_position() -> Vector3:
	return global_position + Vector3(0, 0.6, 0)


func enter_vehicle(p: Player) -> void:
	if driver != null:
		return
	driver = p
	p.vehicle = self
	p.visual.visible = false
	p.collision_layer = 0
	p.collision_mask = 0
	if p.carrying.get("type", "") == "crate":
		p.drop_visual()
		_show_cargo(true)
	p.world.toast("Au volant ! ZQSD/WASD pour conduire, Espace = frein, F pour sortir.", "info")


func exit_vehicle(p: Player) -> void:
	var exit_pos := global_position + global_transform.basis.x * -2.2 + Vector3(0, 0.5, 0)
	driver = null
	p.vehicle = null
	p.visual.visible = true
	p.collision_layer = 2
	p.collision_mask = 1
	p.global_position = exit_pos
	p.velocity = Vector3.ZERO
	speed = 0.0
	if p.carrying.get("type", "") == "crate":
		_show_cargo(false)
		p.carry(p.carrying, func(n): Crate.build_mesh(n))


func _show_cargo(on: bool) -> void:
	for c in cargo_node.get_children():
		c.queue_free()
	if on:
		Crate.build_mesh(cargo_node)


func _physics_process(delta: float) -> void:
	var throttle := 0.0
	var turn := 0.0
	var braking := false
	if driver and not driver.input_locked:
		if Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP):
			throttle += 1.0
		if Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN):
			throttle -= 1.0
		if Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT):
			turn += 1.0
		if Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT):
			turn -= 1.0
		braking = Input.is_physical_key_pressed(KEY_SPACE)
	if throttle > 0:
		speed = move_toward(speed, max_speed, 9.0 * delta)
	elif throttle < 0:
		speed = move_toward(speed, -6.0, (16.0 if speed > 0 else 6.0) * delta)
	else:
		speed = move_toward(speed, 0.0, 4.0 * delta)
	if braking:
		speed = move_toward(speed, 0.0, 25.0 * delta)
	steer = lerp(steer, turn, 6.0 * delta)
	var grip: float = clamp(abs(speed) / 6.0, 0.0, 1.0)
	heading += steer * 1.6 * grip * sign(speed) * delta
	rotation.y = heading
	var fwd := Vector3(sin(heading), 0, cos(heading))
	velocity.x = fwd.x * speed
	velocity.z = fwd.z * speed
	if not is_on_floor():
		velocity.y -= 20.0 * delta
	else:
		velocity.y = -0.5
	move_and_slide()
	if get_slide_collision_count() > 0 and abs(speed) > 4.0:
		for i in get_slide_collision_count():
			var n := get_slide_collision(i).get_normal()
			if abs(n.y) < 0.5:
				speed *= 0.4   # bonk!
				body_node.rotation.z = 0.15
				break
	body_node.rotation.z = lerp(body_node.rotation.z, -steer * grip * 0.06, 6.0 * delta)
	for w in _wheels:
		w.rotation.x += speed * delta / 0.4
	if global_position.y < -20:
		global_position = Vector3(-4, 2, 25)


func to_dict() -> Dictionary:
	return {"pos": [global_position.x, global_position.y, global_position.z], "heading": heading}


func from_dict(d: Dictionary) -> void:
	if d.has("pos"):
		global_position = Vector3(d.pos[0], d.pos[1] + 0.3, d.pos[2])
	heading = float(d.get("heading", 0.0))
	rotation.y = heading
