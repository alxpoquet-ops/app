class_name Player
extends CharacterBody3D
## The director: walks around the hotel, can do any job by interacting with
## work points, rides the elevator, carries items. Overhead orbit camera
## (upper floors are hidden so you always see the current floor).

signal interaction_prompt(text: String, alt_text: String)

const WALK := 5.0
const SPRINT := 8.5
const JUMP := 6.0
const GRAVITY := 18.0

var world: Node
var visual: CharacterVisual
var cam_pivot: Node3D
var spring: SpringArm3D
var camera: Camera3D
var yaw := 0.0
var pitch := -0.95
var zoom := 11.0
var carry_node: Node3D
var busy := false             # doing a hold action / mini-game
var input_locked := false     # UI open
var riding := false           # in the elevator
var focus: Interactable = null
var player_id := ""
var floor := 0


func _ready() -> void:
	player_id = Identity.local_id()
	collision_layer = 2
	collision_mask = 1
	var cs := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = 0.35
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
	spring.collision_mask = 0
	cam_pivot.add_child(spring)
	camera = Camera3D.new()
	camera.fov = 60
	camera.far = 400
	spring.add_child(camera)
	camera.current = true


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		yaw -= event.relative.x * 0.0035
		pitch = clamp(pitch - event.relative.y * 0.003, -1.45, -0.25)
	elif event is InputEventMouseButton and event.pressed and not input_locked:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			zoom = clamp(zoom - 0.8, 4.0, 22.0)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			zoom = clamp(zoom + 0.8, 4.0, 22.0)
		elif event.button_index == MOUSE_BUTTON_LEFT and Input.mouse_mode != Input.MOUSE_MODE_CAPTURED and world.can_capture_mouse():
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	elif event is InputEventKey and event.pressed and not event.echo and not input_locked and not riding:
		match event.physical_keycode:
			KEY_E:
				if focus and not busy:
					focus.action_fn.call(self)
			KEY_R:
				if focus and not busy and focus.alt_action_fn.is_valid() and focus.alt_prompt(self) != "":
					focus.alt_action_fn.call(self)


func _physics_process(delta: float) -> void:
	if riding:
		interaction_prompt.emit("", "")
		_update_camera(delta)
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
	var spd := SPRINT if Input.is_physical_key_pressed(KEY_SHIFT) else WALK
	velocity.x = move_toward(velocity.x, dir.x * spd, 40.0 * delta)
	velocity.z = move_toward(velocity.z, dir.z * spd, 40.0 * delta)
	if is_on_floor():
		if Input.is_physical_key_pressed(KEY_SPACE) and not input_locked and not busy:
			velocity.y = JUMP
	else:
		velocity.y -= GRAVITY * delta
	move_and_slide()
	floor = world.layout.floor_of_y(global_position.y + 0.5)
	if global_position.y < -10:
		global_position = Vector3(0, 0.3, 8)
	var hv := Vector2(velocity.x, velocity.z)
	visual.speed = hv.length()
	if hv.length() > 0.3:
		visual.rotation.y = lerp_angle(visual.rotation.y, atan2(velocity.x, velocity.z), 12.0 * delta)
	_update_camera(delta)
	_update_focus()


func _update_camera(delta: float) -> void:
	var target := global_position + Vector3(0, 1.4, 0)
	cam_pivot.global_position = cam_pivot.global_position.lerp(target, clamp(12.0 * delta, 0.0, 1.0))
	cam_pivot.rotation = Vector3(pitch, yaw, 0)
	spring.spring_length = lerp(spring.spring_length, zoom, 8.0 * delta)


func _update_focus() -> void:
	var best: Interactable = null
	var best_score := INF
	var fwd := Vector3(sin(visual.rotation.y), 0, cos(visual.rotation.y))
	for n in get_tree().get_nodes_in_group("interactable"):
		var it := n as Interactable
		if it == null or not it.is_visible_in_tree():
			continue
		var d := it.global_position - global_position
		if abs(d.y) > 2.2:
			continue
		d.y = 0
		var dist := d.length()
		if dist > it.radius:
			continue
		if it.prompt(self) == "":
			continue
		var facing := fwd.dot(d.normalized()) if dist > 0.3 else 1.0
		var score := dist - facing * 0.6 - it.priority * 1.2
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


func carry(kind: String) -> void:
	if carry_node:
		carry_node.queue_free()
		carry_node = null
	if kind == "":
		return
	carry_node = Node3D.new()
	visual.held.add_child(carry_node)
	CarryProps.build(carry_node, kind)


func teleport(f: int, local: Vector3) -> void:
	global_position = world.layout.world_pos(f, local) + Vector3(0, 0.1, 0)
	velocity = Vector3.ZERO
	floor = f
	cam_pivot.global_position = global_position + Vector3(0, 1.4, 0)


func to_dict() -> Dictionary:
	return {"pos": [global_position.x, global_position.y, global_position.z], "yaw": yaw}


func from_dict(d: Dictionary) -> void:
	if d.has("pos"):
		global_position = Vector3(d.pos[0], d.pos[1] + 0.2, d.pos[2])
	yaw = float(d.get("yaw", 0.0))
	floor = world.layout.floor_of_y(global_position.y + 0.5)
	cam_pivot.global_position = global_position
