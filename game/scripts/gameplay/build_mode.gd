class_name BuildMode
extends CanvasLayer
## Simple 3D placement editor for the interior of a company you own:
## buy & place, move, rotate and resell equipment. Server-validated through
## Economy.request_buy_equipment / request_move_equipment / request_sell_equipment.

var world: Node
var building: BusinessBuilding
var selected_def := ""
var moving_uid := -1
var rot := 0.0
var ghost: Node3D
var _valid := false
var _local := Vector3.ZERO
var _bar: HBoxContainer
var _info: Label
var _hover_uid := -1

const COUNTER := Rect2(-4.8, -2.5, 8.6, 1.4)   # x, z, w, d (local)


func _init(w: Node, b: BusinessBuilding) -> void:
	world = w
	building = b
	layer = 8


func _ready() -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.theme = UITheme.theme()
	add_child(root)
	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	panel.position = Vector2(10, -200)
	panel.custom_minimum_size = Vector2(0, 190)
	root.add_child(panel)
	var v := VBoxContainer.new()
	panel.add_child(v)
	_info = UITheme.label("", 16, UITheme.ACCENT)
	v.add_child(_info)
	var sc := ScrollContainer.new()
	sc.custom_minimum_size = Vector2(0, 120)
	sc.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	v.add_child(sc)
	_bar = HBoxContainer.new()
	sc.add_child(_bar)
	for id in GameData.equipment:
		var d := GameData.equip(id)
		var def_id: String = id
		var bt := UITheme.button("%s\n%s" % [d.name, Economy.money(float(d.price))], func(): _select(def_id))
		bt.custom_minimum_size = Vector2(170, 90)
		bt.tooltip_text = _tooltip(d)
		_bar.add_child(bt)
	_update_info()


func _tooltip(d: Dictionary) -> String:
	var parts := []
	if d.has("speed"):
		parts.append("vitesse ×%.2f" % float(d.speed))
	if d.has("quality"):
		parts.append("qualité ×%.2f" % float(d.quality))
	if float(d.get("comfort", 0)) > 0:
		parts.append("confort +%d" % int(d.comfort))
	if float(d.get("decor", 0)) > 0:
		parts.append("déco +%d" % int(d.decor))
	if d.has("energy_per_hour"):
		parts.append("énergie %.1f/h" % float(d.energy_per_hour))
	if float(d.get("start_condition", 100)) < 100:
		parts.append("occasion (état %d%%)" % int(d.start_condition))
	return ", ".join(parts)


func _update_info() -> void:
	var b: Business = building.biz()
	var base := "MODE CONSTRUCTION — trésorerie de l'entreprise : %s  |  Clic gauche : poser • R / molette : tourner • Clic droit : annuler • Survol + Suppr : revendre • B / Échap : quitter" % Economy.money(Economy.biz_cash(b.id))
	if selected_def != "":
		var d := GameData.equip(selected_def)
		base = "Placer : %s (%s) — %s\n" % [d.name, Economy.money(float(d.price)), _tooltip(d)] + base
	elif moving_uid >= 0:
		base = "Déplacement en cours…\n" + base
	else:
		base = "Choisissez un objet ci-dessous, ou cliquez un objet existant pour le déplacer.\n" + base
	_info.text = base


func _select(def_id: String) -> void:
	selected_def = def_id
	moving_uid = -1
	rot = 0.0
	_make_ghost(def_id)
	_update_info()


func _make_ghost(def_id: String) -> void:
	if ghost:
		ghost.queue_free()
	ghost = Node3D.new()
	building.add_child(ghost)
	EquipmentNode.build_visual(ghost, def_id)


func _set_ghost_color(ok: bool) -> void:
	var m := MeshFactory.mat(Color(0.3, 1.0, 0.4, 0.55) if ok else Color(1.0, 0.3, 0.3, 0.55), 0.0, true)
	for c in ghost.get_children():
		if c is MeshInstance3D:
			c.material_override = m


func _process(_d: float) -> void:
	var cam := get_viewport().get_camera_3d()
	if cam == null:
		return
	var mp := get_viewport().get_mouse_position()
	var from := cam.project_ray_origin(mp)
	var dir := cam.project_ray_normal(mp)
	if abs(dir.y) < 0.001:
		return
	var t := -from.y / dir.y
	if t < 0:
		return
	var hit := from + dir * t
	var lp := building.to_local(hit)
	lp.x = snappedf(lp.x, 0.25)
	lp.z = snappedf(lp.z, 0.25)
	_local = lp
	_hover_uid = -1
	if ghost:
		ghost.position = Vector3(lp.x, 0.02, lp.z)
		ghost.rotation.y = rot
		var def_id := selected_def
		if moving_uid >= 0:
			def_id = _entry(moving_uid).get("def", "")
		_valid = _fits(def_id, lp, rot, moving_uid)
		_set_ghost_color(_valid)
	else:
		for n in building.equipment_nodes:
			if Vector2(n.position.x, n.position.z).distance_to(Vector2(lp.x, lp.z)) < 0.7:
				_hover_uid = int(n.entry.uid)
				var d := GameData.equip(n.def_id)
				_info.text = "%s — état %d%% — clic : déplacer • Suppr : revendre %s" % [d.name, int(n.entry.condition), Economy.money(float(d.price) * 0.4 * float(n.entry.condition) / 100.0)]
				break
		if _hover_uid < 0 and Engine.get_process_frames() % 30 == 0:
			_update_info()


func _footprint(def_id: String, p: Vector3, r: float) -> Rect2:
	var sz: Array = GameData.equip(def_id).get("size", [1, 1])
	var w := float(sz[0])
	var d := float(sz[1])
	if abs(sin(r)) > 0.5:
		var t := w
		w = d
		d = t
	return Rect2(p.x - w / 2, p.z - d / 2, w, d)


func _fits(def_id: String, p: Vector3, r: float, ignore_uid: int) -> bool:
	var fp := _footprint(def_id, p, r)
	var half := building.size / 2.0 - Vector2(0.35, 0.35)
	if fp.position.x < -half.x or fp.end.x > half.x or fp.position.y < -half.y or fp.end.y > half.y:
		return false
	if fp.intersects(COUNTER):
		return false
	if fp.intersects(Rect2(-1.6, 3.4, 3.2, 2.0)):   # keep the entrance clear
		return false
	for n in building.equipment_nodes:
		if int(n.entry.uid) == ignore_uid:
			continue
		if fp.grow(-0.05).intersects(_footprint(n.def_id, n.position, n.rotation.y)):
			return false
	return true


func _entry(uid: int) -> Dictionary:
	for e in building.biz().equipment:
		if int(e.uid) == uid:
			return e
	return {}


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			_click()
			get_viewport().set_input_as_handled()
		elif event.button_index == MOUSE_BUTTON_RIGHT:
			_cancel()
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP or event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			if ghost:
				rot = fmod(rot + PI / 2, TAU)
				get_viewport().set_input_as_handled()
	elif event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_R:
				rot = fmod(rot + PI / 2, TAU)
			KEY_DELETE, KEY_X, KEY_BACKSPACE:
				if _hover_uid >= 0:
					world.ui._result(Economy.request_sell_equipment(world.player.player_id, building.biz_id, _hover_uid))
					_update_info()


func _click() -> void:
	var pid: String = world.player.player_id
	if ghost and selected_def != "":
		if not _valid:
			world.toast("Emplacement impossible (mur, comptoir, entrée ou objet).", "warn")
			return
		var r: Dictionary = Economy.request_buy_equipment(pid, building.biz_id, selected_def, _local.x, _local.z, rot)
		world.ui._result(r)
		_update_info()
	elif ghost and moving_uid >= 0:
		if not _valid:
			world.toast("Emplacement impossible.", "warn")
			return
		world.ui._result(Economy.request_move_equipment(pid, building.biz_id, moving_uid, _local.x, _local.z, rot))
		_cancel()
	elif _hover_uid >= 0:
		var e := _entry(_hover_uid)
		moving_uid = _hover_uid
		selected_def = ""
		rot = float(e.rot)
		_make_ghost(e.def)
		_update_info()


func _cancel() -> void:
	if ghost:
		ghost.queue_free()
		ghost = null
	selected_def = ""
	moving_uid = -1
	_update_info()


func close() -> void:
	_cancel()
	queue_free()
