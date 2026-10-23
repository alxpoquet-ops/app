class_name MeshFactory
extends RefCounted
## Tiny procedural "art pipeline": every prop in the prototype is built from
## primitives + flat colours. Swapping in real models later only means
## replacing these helpers (or the nodes they return) with imported scenes.

static var _mats := {}


static func mat(c: Color, emission := 0.0, transparent := false, roughness := 0.85) -> StandardMaterial3D:
	var key := "%s|%.2f|%s|%.2f" % [c.to_html(), emission, transparent, roughness]
	if _mats.has(key):
		return _mats[key]
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	m.roughness = roughness
	if emission > 0.0:
		m.emission_enabled = true
		m.emission = c
		m.emission_energy_multiplier = emission
	if transparent:
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_mats[key] = m
	return m


static func box(parent: Node, size: Vector3, pos: Vector3, c: Color, collide := false, name := "") -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = size
	mi.mesh = bm
	mi.material_override = mat(c, 0.0, c.a < 1.0)
	mi.position = pos
	if name != "":
		mi.name = name
	parent.add_child(mi)
	if collide:
		add_box_collider(parent, size, pos)
	return mi


static func add_box_collider(parent: Node, size: Vector3, pos: Vector3, layer := 1) -> StaticBody3D:
	var sb := StaticBody3D.new()
	sb.collision_layer = layer
	sb.collision_mask = 0
	var cs := CollisionShape3D.new()
	var sh := BoxShape3D.new()
	sh.size = size
	cs.shape = sh
	sb.add_child(cs)
	sb.position = pos
	parent.add_child(sb)
	return sb


static func cylinder(parent: Node, radius: float, height: float, pos: Vector3, c: Color, top_radius := -1.0, segments := 12) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.bottom_radius = radius
	cm.top_radius = radius if top_radius < 0 else top_radius
	cm.height = height
	cm.radial_segments = segments
	cm.rings = 1
	mi.mesh = cm
	mi.material_override = mat(c)
	mi.position = pos
	parent.add_child(mi)
	return mi


static func sphere(parent: Node, radius: float, pos: Vector3, c: Color, emission := 0.0) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var sm := SphereMesh.new()
	sm.radius = radius
	sm.height = radius * 2.0
	sm.radial_segments = 12
	sm.rings = 6
	mi.mesh = sm
	mi.material_override = mat(c, emission)
	mi.position = pos
	parent.add_child(mi)
	return mi


static func capsule(parent: Node, radius: float, height: float, pos: Vector3, c: Color) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var cm := CapsuleMesh.new()
	cm.radius = radius
	cm.height = height
	cm.radial_segments = 12
	cm.rings = 4
	mi.mesh = cm
	mi.material_override = mat(c)
	mi.position = pos
	parent.add_child(mi)
	return mi


static func label(parent: Node, text: String, pos: Vector3, size := 48, c := Color.WHITE, billboard := true) -> Label3D:
	var l := Label3D.new()
	l.text = text
	l.font_size = size
	l.pixel_size = 0.006
	l.modulate = c
	l.outline_size = 10
	l.outline_modulate = Color(0, 0, 0, 0.75)
	l.position = pos
	l.billboard = BaseMaterial3D.BILLBOARD_ENABLED if billboard else BaseMaterial3D.BILLBOARD_DISABLED
	l.double_sided = true
	parent.add_child(l)
	return l


static func tree(parent: Node, pos: Vector3, rng: RandomNumberGenerator) -> void:
	var h := rng.randf_range(2.5, 4.0)
	cylinder(parent, 0.22, h, pos + Vector3(0, h / 2, 0), Color("#7f5539"))
	var greens := [Color("#52b788"), Color("#40916c"), Color("#74c69d"), Color("#2d6a4f")]
	var g: Color = greens[rng.randi() % greens.size()]
	if rng.randf() < 0.5:
		sphere(parent, rng.randf_range(1.3, 1.9), pos + Vector3(0, h + 0.8, 0), g)
	else:
		cylinder(parent, rng.randf_range(1.4, 1.9), 3.2, pos + Vector3(0, h + 1.2, 0), g, 0.0, 8)
	add_box_collider(parent, Vector3(0.5, h, 0.5), pos + Vector3(0, h / 2, 0))
