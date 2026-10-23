class_name BusinessBuilding
extends Node3D
## Scene representation of a company: shell, sign, owner badge, delivery dock,
## and for enterable types (café) the interior with equipment and the live
## service. Rebuilds itself when the Business data changes.

var biz_id := ""
var world: Node
var size := Vector2(12, 10)
var equipment_nodes: Array = []
var service: CafeService = null
var nameplate: OwnerNameplate
var sign_label: Label3D
var roof: Node3D
var _equip_root: Node3D
var _awning_mats: Array = []
var _player_inside := false
var dock: Interactable


func setup(w: Node, id: String, animate := false) -> void:
	world = w
	biz_id = id
	var b := biz()
	var s: Array = b.def().get("size", [12, 10])
	size = Vector2(float(s[0]), float(s[1]))
	position = Vector3(b.pos.x, 0, b.pos.y)
	rotation.y = deg_to_rad(b.rot)
	_build_shell(b)
	if b.def().get("enterable", false):
		_build_cafe_interior(b)
	else:
		_build_producer_extras(b)
	nameplate = OwnerNameplate.new()
	add_child(nameplate)
	nameplate.setup(biz_id, 7.0 if b.type_id != "mill" else 12.0)
	dock = Interactable.make(self, Vector3(size.x / 2 - 1.0, 0, size.y / 2 + 1.6), 2.6, _dock_prompt, _dock_action)
	dock.alt_prompt_fn = func(p): return "[R] Infos entreprise" if _dock_prompt(p).begins_with("[E] Livrer") else ""
	dock.alt_action_fn = func(_p): world.ui.open_business(biz_id)
	MeshFactory.box(self, Vector3(1.6, 0.05, 1.6), Vector3(size.x / 2 - 1.0, 0.03, size.y / 2 + 1.6), Color("#ffb703"))
	_sign_post(Vector3(size.x / 2 - 1.0, 0, size.y / 2 + 2.6))
	refresh()
	if animate:
		scale = Vector3(1, 0.05, 1)
		var tw := create_tween()
		tw.tween_property(self, "scale", Vector3.ONE, 1.4).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)


func biz() -> Business:
	return Economy.businesses.get(biz_id)


func _sign_post(p: Vector3) -> void:
	MeshFactory.cylinder(self, 0.06, 1.6, p + Vector3(0, 0.8, 0), Color("#555555"))
	var board := MeshFactory.box(self, Vector3(1.2, 0.6, 0.06), p + Vector3(0, 1.6, 0), Color("#ffb703"))
	board.name = "DockBoard"
	var l := MeshFactory.label(self, "QUAI / INFOS", p + Vector3(0, 1.6, 0.05), 28, Color("#222222"), false)
	l.outline_size = 0


func _build_shell(b: Business) -> void:
	var w := size.x
	var d := size.y
	var h := 4.0 if b.type_id != "mill" else 5.0
	var wall_col := Color("#f8edeb") if b.def().get("enterable", false) else Color(str(b.def().get("color", "#dddddd"))).lightened(0.35)
	var t := 0.3
	MeshFactory.box(self, Vector3(w, 0.12, d), Vector3(0, -0.05, 0), Color("#d4a373") if b.def().get("enterable", false) else Color("#b0a8a0"))
	MeshFactory.box(self, Vector3(w, h, t), Vector3(0, h / 2, -d / 2 + t / 2), wall_col, true)
	MeshFactory.box(self, Vector3(t, h, d), Vector3(-w / 2 + t / 2, h / 2, 0), wall_col, true)
	MeshFactory.box(self, Vector3(t, h, d), Vector3(w / 2 - t / 2, h / 2, 0), wall_col, true)
	var door_w := 3.0 if b.def().get("enterable", false) else 0.0
	var side := (w - door_w) / 2.0
	MeshFactory.box(self, Vector3(side, h, t), Vector3(-w / 2 + side / 2, h / 2, d / 2 - t / 2), wall_col, true)
	MeshFactory.box(self, Vector3(side, h, t), Vector3(w / 2 - side / 2, h / 2, d / 2 - t / 2), wall_col, true)
	if door_w > 0:
		MeshFactory.box(self, Vector3(door_w, h - 2.8, t), Vector3(0, 2.8 + (h - 2.8) / 2, d / 2 - t / 2), wall_col)
	else:
		MeshFactory.box(self, Vector3(1.6, 2.4, 0.1), Vector3(0, 1.2, d / 2 + 0.02), Color("#6b4f3a"))
	# windows
	for x in [-w / 2 + side / 2, w / 2 - side / 2]:
		MeshFactory.box(self, Vector3(min(side - 1.0, 3.0), 1.5, 0.08), Vector3(x, 1.9, d / 2 + 0.02), Color(0.65, 0.85, 1.0, 0.7))
	roof = Node3D.new()
	add_child(roof)
	MeshFactory.box(roof, Vector3(w + 0.6, 0.35, d + 0.6), Vector3(0, h + 0.17, 0), Color("#6d6875"))
	# awning in company colour (updated on refresh)
	var aw := MeshFactory.box(self, Vector3(w * 0.9, 0.15, 1.4), Vector3(0, 3.0, d / 2 + 0.7), Color.WHITE)
	aw.rotation.x = 0.25
	aw.material_override = StandardMaterial3D.new()
	_awning_mats.append(aw.material_override)
	var board := MeshFactory.box(self, Vector3(w * 0.7, 0.8, 0.1), Vector3(0, h - 0.4, d / 2 + 0.12), Color("#fffaf0"))
	_awning_mats.append(board)   # keep reference (not recoloured)
	sign_label = MeshFactory.label(self, "", Vector3(0, h - 0.4, d / 2 + 0.2), 72, Color("#222222"), false)
	sign_label.outline_size = 0


func _build_cafe_interior(b: Business) -> void:
	# counter with a gap on the right for staff
	MeshFactory.box(self, Vector3(8.0, 1.1, 0.8), Vector3(-0.5, 0.55, -1.8), Color("#8d6346"), true)
	MeshFactory.box(self, Vector3(8.2, 0.08, 0.95), Vector3(-0.5, 1.14, -1.8), Color("#3d2c22"))
	MeshFactory.box(self, Vector3(0.5, 0.35, 0.3), Vector3(-3.8, 1.33, -1.8), Color("#2b2d42"))   # cash register
	MeshFactory.label(self, "COMPTOIR", Vector3(-0.5, 0.6, -1.38), 40, Color("#ffe8a3"), false).outline_size = 4
	# back shelves
	MeshFactory.box(self, Vector3(9.0, 0.08, 0.4), Vector3(0, 2.4, -size.y / 2 + 0.5), Color("#8d6346"))
	for i in 8:
		MeshFactory.cylinder(self, 0.12, 0.35, Vector3(-4 + i * 1.1, 2.62, -size.y / 2 + 0.5), [Color("#e63946"), Color("#ffb703"), Color("#2a9d8f")][i % 3])
	var light := OmniLight3D.new()
	light.position = Vector3(0, 3.4, 0)
	light.omni_range = 9.0
	light.light_energy = 1.2
	light.light_color = Color("#ffe8c2")
	add_child(light)
	var counter := Interactable.make(self, Vector3(-0.5, 1.0, -1.8), 2.8, func(p): return service.counter_prompt(p), func(p): service.counter_action(p))
	counter.priority = 0
	_equip_root = Node3D.new()
	add_child(_equip_root)
	service = CafeService.new()
	add_child(service)
	service.setup(self)


func _build_producer_extras(b: Business) -> void:
	var w := size.x
	var d := size.y
	match b.type_id:
		"coffee_farm":
			# greenhouse glass + harvestable bushes in front
			MeshFactory.box(self, Vector3(w - 1, 2.0, 0.1), Vector3(0, 5.0, 0), Color(0.8, 1.0, 0.85, 0.4))
			for ix in 5:
				for iz in 3:
					var plant := HarvestPlant.new()
					add_child(plant)
					plant.position = Vector3(-6.0 + ix * 3.0, 0, d / 2 + 4.0 + iz * 2.4)
					plant.setup(world, biz_id)
			MeshFactory.label(self, "Cueillette : ramassez les cerises mûres (rouges) !", Vector3(0, 2.2, d / 2 + 3.0), 36, Color("#ffe8a3"))
		"dairy":
			for i in 4:
				var cow := _cow()
				cow.position = Vector3(-8.0 + i * 2.6, 0, -d / 2 - 4.0 - (i % 2) * 2.0)
				cow.rotation.y = randf() * TAU
			_fence(Vector3(-2, 0, -d / 2 - 5), Vector2(16, 6))
		"wheat_farm":
			for ix in 10:
				for iz in 3:
					var stalk := MeshFactory.box(self, Vector3(1.2, 0.9 + randf() * 0.3, 1.6), Vector3(-w / 2 - 3.0 - iz * 2.0, 0.5, -d / 2 + ix * 1.7), Color("#e9c46a"))
					stalk.rotation.y = randf() * 0.2
			MeshFactory.cylinder(self, 2.0, 7.0, Vector3(w / 2 + 3.0, 3.5, -2), Color("#adb5bd"))
			MeshFactory.cylinder(self, 2.1, 1.0, Vector3(w / 2 + 3.0, 7.4, -2), Color("#6c757d"), 0.2)
			MeshFactory.add_box_collider(self, Vector3(4, 7, 4), Vector3(w / 2 + 3.0, 3.5, -2))
		"mill":
			MeshFactory.cylinder(self, 2.6, 9.0, Vector3(0, 4.5, -1), Color("#e9d8a6"), 1.8)
			var hub := Node3D.new()
			hub.name = "Blades"
			hub.position = Vector3(0, 8.0, 1.3)
			add_child(hub)
			for i in 4:
				var blade := MeshFactory.box(hub, Vector3(0.7, 4.5, 0.1), Vector3(0, 2.3, 0), Color("#f8f9fa"))
				var pivot := Node3D.new()
				hub.add_child(pivot)
				blade.reparent(pivot)
				pivot.rotation.z = i * PI / 2
		"roastery":
			MeshFactory.cylinder(self, 0.8, 6.0, Vector3(w / 2 - 2, 7.0, -d / 2 + 2), Color("#6c584c"))
			var smoke := CPUParticles3D.new()
			smoke.amount = 20
			smoke.lifetime = 4.0
			smoke.direction = Vector3.UP
			smoke.initial_velocity_min = 1.0
			smoke.initial_velocity_max = 1.6
			smoke.gravity = Vector3(0.3, 0.2, 0)
			smoke.scale_amount_min = 0.6
			smoke.scale_amount_max = 1.4
			var sm := SphereMesh.new()
			sm.radius = 0.5
			sm.height = 1.0
			sm.material = MeshFactory.mat(Color(0.85, 0.82, 0.8, 0.5), 0.0, true)
			smoke.mesh = sm
			smoke.position = Vector3(w / 2 - 2, 10.2, -d / 2 + 2)
			add_child(smoke)
			for i in 6:
				MeshFactory.capsule(self, 0.35, 0.9, Vector3(-w / 2 - 1.0, 0.35, -3 + i * 0.9), Color("#a98467")).rotation.x = PI / 2
		"bakery":
			var c := MeshFactory.capsule(self, 0.6, 2.6, Vector3(0, 5.0, d / 2 - 0.5), Color("#e09f3e"))
			c.rotation.z = PI / 2
			for i in 3:
				MeshFactory.box(self, Vector3(1.0, 0.8, 0.8), Vector3(-w / 2 + 2 + i * 1.2, 0.4, d / 2 + 1.2), Color("#6b4f3a"))


func _cow() -> Node3D:
	var cow := Node3D.new()
	add_child(cow)
	MeshFactory.box(cow, Vector3(0.9, 0.8, 1.6), Vector3(0, 0.9, 0), Color.WHITE)
	MeshFactory.box(cow, Vector3(0.5, 0.3, 0.6), Vector3(0.2, 1.2, 0.2), Color("#222222"))
	MeshFactory.box(cow, Vector3(0.55, 0.55, 0.6), Vector3(0, 1.2, 0.95), Color.WHITE)
	MeshFactory.box(cow, Vector3(0.4, 0.25, 0.2), Vector3(0, 1.05, 1.3), Color("#ffb5a7"))
	for p in [Vector3(-0.3, 0.25, 0.6), Vector3(0.3, 0.25, 0.6), Vector3(-0.3, 0.25, -0.6), Vector3(0.3, 0.25, -0.6)]:
		MeshFactory.box(cow, Vector3(0.18, 0.5, 0.18), p, Color("#eeeeee"))
	return cow


func _fence(center: Vector3, sz: Vector2) -> void:
	for i in int(sz.x / 2) + 1:
		for zz in [-sz.y / 2, sz.y / 2]:
			MeshFactory.box(self, Vector3(0.12, 1.0, 0.12), center + Vector3(-sz.x / 2 + i * 2, 0.5, zz), Color("#7f5539"))
	MeshFactory.box(self, Vector3(sz.x, 0.1, 0.06), center + Vector3(0, 0.8, -sz.y / 2), Color("#7f5539"))
	MeshFactory.box(self, Vector3(sz.x, 0.1, 0.06), center + Vector3(0, 0.8, sz.y / 2), Color("#7f5539"))


func _process(delta: float) -> void:
	var blades := get_node_or_null("Blades")
	if blades:
		blades.rotation.z += delta * 0.8
	if world == null or world.player == null or roof == null:
		return
	var lp := to_local(world.player.global_position)
	var inside: bool = abs(lp.x) < size.x / 2 and abs(lp.z) < size.y / 2 and lp.y < 4.0
	if inside != _player_inside:
		_player_inside = inside
		roof.visible = not inside or not biz().def().get("enterable", false)
		nameplate.visible = not inside
		world.on_player_inside(self if inside else null)


func refresh() -> void:
	var b := biz()
	if b == null:
		return
	sign_label.text = b.name
	var c := Color(b.color)
	for m in _awning_mats:
		if m is StandardMaterial3D:
			m.albedo_color = c
	nameplate.refresh()
	if service != null:
		_rebuild_equipment(b)


func _rebuild_equipment(b: Business) -> void:
	var by_uid := {}
	for n in equipment_nodes:
		by_uid[int(n.entry.uid)] = n
	var keep := []
	for e in b.equipment:
		var uid := int(e.uid)
		if by_uid.has(uid):
			var n: EquipmentNode = by_uid[uid]
			n.entry = e
			n.position = Vector3(float(e.x), 0, float(e.z))
			n.rotation.y = float(e.rot)
			keep.append(n)
			by_uid.erase(uid)
		else:
			var n := EquipmentNode.new()
			_equip_root.add_child(n)
			n.setup(self, e)
			keep.append(n)
	for uid in by_uid:
		var n: EquipmentNode = by_uid[uid]
		if n.busy_by is NPC:
			pass
		n.queue_free()
	equipment_nodes = keep


func is_player_inside() -> bool:
	return _player_inside


# ------------------------------------------------------------------ dock
func _dock_prompt(p: Player) -> String:
	if p.vehicle != null:
		return ""
	if p.carrying.get("type", "") == "crate":
		var o := _order(int(p.carrying.order_id))
		if not o.is_empty() and o.buyer == biz_id:
			return "[E] Livrer la caisse (%s)" % GameData.good_name(o.good)
	var b := biz()
	return "[E] %s « %s »" % ["Gérer" if b.owner_id == p.player_id else "Consulter", b.name]


func _dock_action(p: Player) -> void:
	if p.carrying.get("type", "") == "crate":
		var o := _order(int(p.carrying.order_id))
		if not o.is_empty() and o.buyer == biz_id:
			var r: Dictionary = Economy.request_complete_delivery(p.player_id, int(o.id))
			world.toast(r.msg, "money" if r.ok else "warn")
			if r.ok:
				p.clear_carry()
				world.stats_add("deliveries", 1)
			return
	world.ui.open_business(biz_id)


func _order(id: int) -> Dictionary:
	for o in Economy.orders:
		if int(o.id) == id:
			return o
	return {}
