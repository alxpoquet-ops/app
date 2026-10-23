class_name BuildMode
extends CanvasLayer
## Decoration editor for the ground floor (lobby, café area, staff room).
## Lobby comfort raises guest satisfaction; staff-room items raise morale.

const AREAS := [Rect2(-15.8, -1.0, 28.6, 12.4), Rect2(6.5, -11.6, 6.2, 9.6)]   # hall, staff room
const KEEP_CLEAR := [Rect2(-16.6, 0.6, 3.6, 8.6), Rect2(-15.5, -1.5, 31.0, 1.5), Rect2(11.0, 0.6, 3.0, 8.6),
	Rect2(-10.6, 7.6, 3.2, 4.4), Rect2(-2.2, 9.0, 4.4, 3.2), Rect2(-3.4, -1.5, 4.8, 2.4)]

var world: Node
var selected := ""
var moving_uid := -1
var rot := 0.0
var ghost: Node3D
var _valid := false
var _pos := Vector3.ZERO
var _hover := -1
var _info: Label


func _init(w: Node) -> void:
	world = w
	layer = 8


func _ready() -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.theme = UITheme.theme()
	add_child(root)
	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	panel.position = Vector2(10, -190)
	panel.custom_minimum_size = Vector2(0, 180)
	root.add_child(panel)
	var v := VBoxContainer.new()
	panel.add_child(v)
	_info = UITheme.label("", 15, UITheme.ACCENT)
	v.add_child(_info)
	var sc := ScrollContainer.new()
	sc.custom_minimum_size = Vector2(0, 110)
	sc.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	v.add_child(sc)
	var bar := HBoxContainer.new()
	sc.add_child(bar)
	for id in GameData.decor:
		var d: Dictionary = GameData.decor[id]
		var def_id: String = id
		var extra := "confort +%d" % int(d.get("comfort", 0)) if int(d.get("comfort", 0)) > 0 else "moral +%d" % int(d.get("staff_comfort", 0))
		var b := UITheme.button("%s\n%s\n%s" % [d.name, Hotel.money(float(d.price)), extra], func(): _select(def_id))
		b.custom_minimum_size = Vector2(170, 90)
		bar.add_child(b)
	world.player.pitch = -1.25
	world.player.zoom = 20.0
	_update_info()


func _update_info() -> void:
	var s := "DÉCORATION — confort du lobby %d/60, confort du personnel %d/20 — trésorerie %s\nClic gauche : poser • R/molette : tourner • Clic droit : annuler • Survol + Suppr : revendre • B/Échap : quitter" % [int(Hotel.lobby_comfort()), int(Hotel.staff_comfort()), Hotel.money(Hotel.cash)]
	if selected != "":
		s = "Placer : %s\n" % GameData.decor[selected].name + s
	_info.text = s


func _select(id: String) -> void:
	selected = id
	moving_uid = -1
	rot = 0.0
	_ghost(id)
	_update_info()


func _ghost(id: String) -> void:
	if ghost:
		ghost.queue_free()
	ghost = Node3D.new()
	world.layout.floor_nodes[0].add_child(ghost)
	DecorProps.build(ghost, id)
	for c in ghost.get_children():
		if c is StaticBody3D:
			c.queue_free()


func _footprint(id: String, p: Vector3, r: float) -> Rect2:
	var sz: Array = GameData.decor[id].size
	var w := float(sz[0])
	var d := float(sz[1])
	if abs(sin(r)) > 0.5:
		var t := w
		w = d
		d = t
	return Rect2(p.x - w / 2, p.z - d / 2, w, d)


func _fits(id: String, p: Vector3, r: float, ignore: int) -> bool:
	var fp := _footprint(id, p, r)
	var inside := false
	for a in AREAS:
		if a.encloses(fp):
			inside = true
	if not inside:
		return false
	for k in KEEP_CLEAR:
		if fp.intersects(k):
			return false
	for e in Hotel.decor:
		if int(e.uid) != ignore and fp.grow(-0.05).intersects(_footprint(e.def, Vector3(float(e.x), 0, float(e.z)), float(e.rot))):
			return false
	return true


func _process(_d: float) -> void:
	var cam := get_viewport().get_camera_3d()
	var mp := get_viewport().get_mouse_position()
	var from := cam.project_ray_origin(mp)
	var dir := cam.project_ray_normal(mp)
	if abs(dir.y) < 0.001:
		return
	var t := -from.y / dir.y
	if t < 0:
		return
	var hit := from + dir * t
	_pos = Vector3(snappedf(hit.x, 0.25), 0, snappedf(hit.z, 0.25))
	_hover = -1
	if ghost:
		ghost.position = _pos + Vector3(0, 0.02, 0)
		ghost.rotation.y = rot
		var id: String = selected if selected != "" else str(_entry(moving_uid).get("def", ""))
		_valid = _fits(id, _pos, rot, moving_uid)
		var m := MeshFactory.mat(Color(0.3, 1.0, 0.4, 0.55) if _valid else Color(1.0, 0.3, 0.3, 0.55), 0.0, true)
		for c in ghost.get_children():
			if c is MeshInstance3D:
				c.material_override = m
	else:
		for e in Hotel.decor:
			if Vector2(float(e.x), float(e.z)).distance_to(Vector2(_pos.x, _pos.z)) < 0.8:
				_hover = int(e.uid)
				_info.text = "%s — clic : déplacer • Suppr : revendre (%s)" % [GameData.decor[e.def].name, Hotel.money(float(GameData.decor[e.def].price) * 0.4)]
				break


func _entry(uid: int) -> Dictionary:
	for e in Hotel.decor:
		if int(e.uid) == uid:
			return e
	return {}


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		match event.button_index:
			MOUSE_BUTTON_LEFT:
				_click()
			MOUSE_BUTTON_RIGHT:
				_cancel()
			MOUSE_BUTTON_WHEEL_UP, MOUSE_BUTTON_WHEEL_DOWN:
				rot = fmod(rot + PI / 2, TAU)
		get_viewport().set_input_as_handled()
	elif event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_R:
				rot = fmod(rot + PI / 2, TAU)
			KEY_DELETE, KEY_BACKSPACE:
				if _hover >= 0:
					world.toast(Hotel.request_sell_decor(_hover).msg, "ok")
					_update_info()


func _click() -> void:
	if ghost and selected != "":
		if not _valid:
			world.toast("Emplacement impossible (passage, comptoir, file d'attente ou objet).", "warn")
			return
		var r: Dictionary = Hotel.request_buy_decor(selected, _pos.x, _pos.z, rot)
		world.toast(r.msg, "ok" if r.ok else "warn")
		_update_info()
	elif ghost and moving_uid >= 0:
		if _valid:
			Hotel.request_move_decor(moving_uid, _pos.x, _pos.z, rot)
			_cancel()
	elif _hover >= 0:
		var e := _entry(_hover)
		moving_uid = _hover
		rot = float(e.rot)
		_ghost(e.def)


func _cancel() -> void:
	if ghost:
		ghost.queue_free()
		ghost = null
	selected = ""
	moving_uid = -1
	_update_info()


func _exit_tree() -> void:
	if ghost:
		ghost.queue_free()
	world.player.pitch = -0.95
	world.player.zoom = 11.0
