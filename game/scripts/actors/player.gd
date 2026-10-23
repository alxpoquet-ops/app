class_name Player
extends CharacterBody3D
## Third-person avatar: walk/sprint/jump, orbit camera, interactions,
## carrying items (drinks, crates) and entering vehicles.

signal interaction_prompt(text: String, alt_text: String)

const WALK := 5.0
const SPRINT := 8.5
const CARRY_CRATE := 3.8
const JUMP := 6.0
const GRAVITY := 18.0

var world: Node
var visual: CharacterVisual
var cam_pivot: Node3D
var spring: SpringArm3D
var camera: Camera3D
var yaw := 0.0
var pitch := -0.35
var zoom := 5.5
var carrying := {}            # {} | {type:"drink", item, quality, biz_id} | {type:"crate", order_id, good}
var carry_node: Node3D
var vehicle: Node = null      # car we're driving
var busy := false             # e.g. brewing: movement locked
var input_locked := false     # UI open
var focus: Interactable = null
var player_id := ""
var _indoor_pitch := 0.0


func _ready() -> void:
	player_id = Identity.local_id()
	collision_layer = 2
	collision_mask = 1
	var cs := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = 0.4
	cap.height = 1.8
	cs.shape = cap
	cs.position = Vector3(0, 0.9, 0)
	add_child(cs)
	visual = CharacterVisual.new()
	add_child(visual)
	var prof := Identity.get_profile(player_id)
	visual.build(Color(str(prof.get("color", "#3d5a80"))), Color("#ffdbac"), Color("#e63946"), 1.0)
	cam_pivot = Node3D.new()
	cam_pivot.top_level = true
	add_child(cam_pivot)
	spring = SpringArm3D.new()
	spring.spring_length = zoom
	spring.collision_mask = 1
	spring.margin = 0.3
	cam_pivot.add_child(spring)
	camera = Camera3D.new()
	camera.fov = 70
	camera.far = 600
	spring.add_child(camera)
	camera.current = true
	var sh := SphereShape3D.new()
	sh.radius = 0.25
	spring.shape = sh
	spring.add_excluded_object(get_rid())


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		yaw -= event.relative.x * 0.0035
		pitch = clamp(pitch - event.relative.y * 0.003, -1.25, 0.45)
	elif event is InputEventMouseButton and event.pressed and not input_locked:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			zoom = clamp(zoom - 0.6, 2.5, 14.0)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			zoom = clamp(zoom + 0.6, 2.5, 14.0)
		elif event.button_index == MOUSE_BUTTON_LEFT and Input.mouse_mode != Input.MOUSE_MODE_CAPTURED and world.can_capture_mouse():
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	elif event is InputEventKey and event.pressed and not event.echo and not input_locked:
		match event.physical_keycode:
			KEY_E:
				if vehicle == null and focus and not busy:
					focus.action_fn.call(self)
			KEY_R:
				if vehicle == null and focus and not busy and focus.alt_action_fn.is_valid() and focus.alt_prompt(self) != "":
					focus.alt_action_fn.call(self)
			KEY_F:
				if vehicle:
					vehicle.exit_vehicle(self)
				else:
					var car = world.nearest_vehicle(global_position, 3.5)
					if car:
						car.enter_vehicle(self)
			KEY_G:
				if not carrying.is_empty() and vehicle == null:
					drop_carried()


func _physics_process(delta: float) -> void:
	if vehicle != null:
		global_position = vehicle.seat_position()
		yaw = lerp_angle(yaw, vehicle.heading + PI, 1.5 * delta)
		_update_camera(delta, vehicle.global_position + Vector3(0, 1.2, 0), 9.0)
		interaction_prompt.emit("", "")
		return
	var dir := Vector3.ZERO
	if not input_locked and not busy:
		var f := Vector3(-sin(yaw), 0, -cos(yaw))
		var r := Vector3(cos(yaw), 0, -sin(yaw))
		if Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP):
			dir += f
		if Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN):
			dir -= f
		if Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT):
			dir += r
		if Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT):
			dir -= r
	dir = dir.normalized()
	var spd := WALK
	if carrying.get("type", "") == "crate":
		spd = CARRY_CRATE
	elif Input.is_physical_key_pressed(KEY_SHIFT):
		spd = SPRINT
	var target := dir * spd
	velocity.x = move_toward(velocity.x, target.x, 40.0 * delta)
	velocity.z = move_toward(velocity.z, target.z, 40.0 * delta)
	if is_on_floor():
		if Input.is_physical_key_pressed(KEY_SPACE) and not input_locked and not busy:
			velocity.y = JUMP
	else:
		velocity.y -= GRAVITY * delta
	move_and_slide()
	if global_position.y < -20:
		global_position = Vector3(0, 2, 16)
	var hv := Vector2(velocity.x, velocity.z)
	visual.speed = hv.length()
	if hv.length() > 0.3:
		var target_rot := atan2(velocity.x, velocity.z)
		visual.rotation.y = lerp_angle(visual.rotation.y, target_rot, 12.0 * delta)
	# Inside an enterable building the roof is hidden: look from above, ignore walls.
	var indoors: bool = world != null and world.inside != null and world.inside.service != null
	spring.collision_mask = 0 if indoors else 1
	_indoor_pitch = lerp(_indoor_pitch, 1.0 if indoors and not input_locked else 0.0, 4.0 * delta)
	_update_camera(delta, global_position + Vector3(0, 1.6, 0), lerp(zoom, max(zoom, 8.0), _indoor_pitch))
	_update_focus()


func _update_camera(delta: float, target: Vector3, length: float) -> void:
	cam_pivot.global_position = cam_pivot.global_position.lerp(target, clamp(14.0 * delta, 0.0, 1.0))
	cam_pivot.rotation = Vector3(lerp(pitch, min(pitch, -0.85), _indoor_pitch), yaw, 0)
	spring.spring_length = lerp(spring.spring_length, length, 8.0 * delta)


func _update_focus() -> void:
	var best: Interactable = null
	var best_score := INF
	var fwd := Vector3(sin(visual.rotation.y), 0, cos(visual.rotation.y))
	for n in get_tree().get_nodes_in_group("interactable"):
		var it := n as Interactable
		if it == null or not it.is_visible_in_tree():
			continue
		var d := it.global_position - global_position
		d.y *= 0.5
		var dist := d.length()
		if dist > it.radius:
			continue
		if it.prompt(self) == "":
			continue
		var facing := fwd.dot(Vector3(d.x, 0, d.z).normalized()) if dist > 0.3 else 1.0
		var score := dist - facing * 0.8 - it.priority * 2.0
		if score < best_score:
			best_score = score
			best = it
	focus = best
	if busy:
		interaction_prompt.emit("", "")
	elif focus:
		interaction_prompt.emit(focus.prompt(self), focus.alt_prompt(self))
	else:
		interaction_prompt.emit("", "")


# ------------------------------------------------------------------ carrying
func carry(data: Dictionary, mesh_builder: Callable) -> void:
	drop_visual()
	carrying = data
	carry_node = Node3D.new()
	visual.held.add_child(carry_node)
	mesh_builder.call(carry_node)


func drop_visual() -> void:
	if carry_node:
		carry_node.queue_free()
		carry_node = null


func clear_carry() -> void:
	drop_visual()
	carrying = {}


func drop_carried() -> void:
	if carrying.get("type", "") == "crate":
		world.drop_crate(carrying, global_position + visual.global_transform.basis.z * 0.9)
	else:
		world.toast("Vous jetez votre %s." % carrying.get("label", "objet"), "info")
	clear_carry()


func to_dict() -> Dictionary:
	return {"pos": [global_position.x, global_position.y, global_position.z], "yaw": yaw}


func from_dict(d: Dictionary) -> void:
	if d.has("pos"):
		global_position = Vector3(d.pos[0], d.pos[1] + 0.2, d.pos[2])
	yaw = float(d.get("yaw", 0.0))
	cam_pivot.global_position = global_position
