class_name RoomNode
extends Node3D
## One guest room: door with a status light above it, room number, and a
## simple interior whose equipment (lamp, socket, TV, shower, AC, minibar)
## can break and be repaired.

const LIGHT_COLORS := {
	"ready": Color("#2dc653"),       # libre et prête
	"occupied": Color("#3a86ff"),    # occupée
	"dnd": Color("#8338ec"),         # ne pas déranger
	"dirty": Color("#fb8500"),       # à nettoyer
	"to_prepare": Color("#ffd60a"),  # à préparer
	"locked": Color("#495057"),      # à rénover
}
const LIGHT_LABELS := {
	"ready": "LIBRE", "occupied": "OCCUPÉE", "dnd": "NE PAS DÉRANGER", "dirty": "À NETTOYER",
	"to_prepare": "À PRÉPARER", "locked": "À RÉNOVER",
}

var rid := ""
var world: Node
var layout: HotelLayout
var light_mesh: MeshInstance3D
var light_mat: StandardMaterial3D
var status_label: Label3D
var door_pivot: Node3D
var interior: Node3D
var bed_cover: MeshInstance3D
var item_nodes := {}      # item -> Node3D
var warn_labels := {}     # item -> Label3D
var _t := 0.0
var _front := 0.0
var _s := 1.0
var cx := 0.0


func setup(w: Node, lay: HotelLayout, r: Dictionary) -> void:
	world = w
	layout = lay
	rid = r.id
	var north: bool = r.side == "N"
	_front = -1.5 if north else 1.5
	_s = -1.0 if north else 1.0
	cx = (float(r.x0) + float(r.x1)) / 2.0
	var width := float(r.x1) - float(r.x0)
	# door + frame
	door_pivot = Node3D.new()
	door_pivot.position = Vector3(cx - 0.65, 0, _front)
	add_child(door_pivot)
	var door := MeshFactory.box(door_pivot, Vector3(1.3, 2.35, 0.08), Vector3(0.65, 1.18, 0), Color("#6f1d1b"))
	door.name = "Door"
	MeshFactory.sphere(door_pivot, 0.05, Vector3(1.15, 1.1, -_s * 0.07), Color("#e9c46a"))
	# status light above the door (corridor side)
	light_mat = StandardMaterial3D.new()
	light_mat.emission_enabled = true
	light_mat.emission_energy_multiplier = 2.2
	light_mesh = MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(1.3, 0.3, 0.16)
	light_mesh.mesh = bm
	light_mesh.material_override = light_mat
	light_mesh.position = Vector3(cx, 2.75, _front - _s * 0.13)
	add_child(light_mesh)
	# glowing strip on the corridor floor: readable from the overhead camera
	var strip := MeshInstance3D.new()
	var sm := BoxMesh.new()
	sm.size = Vector3(1.3, 0.03, 0.35)
	strip.mesh = sm
	strip.material_override = light_mat
	strip.position = Vector3(cx, 0.04, _front - _s * 0.3)
	add_child(strip)
	var num := MeshFactory.label(self, rid, Vector3(cx + 1.15, 2.1, _front - _s * 0.12), 64, Color("#e9c46a"), false)
	num.outline_size = 6
	if not north:
		num.rotation.y = PI
	status_label = MeshFactory.label(self, "", Vector3(cx, 3.3, _front - _s * 0.4), 40, Color.WHITE, true)
	status_label.pixel_size = 0.0075
	# interior
	interior = Node3D.new()
	add_child(interior)
	var floor_col := Color(str(GameData.room_tiers[r.tier].color)).lightened(0.55)
	var carpet := MeshFactory.box(interior, Vector3(width - 0.4, 0.02, 10.0), Vector3(cx, 0.03, _front + _s * 5.25), floor_col)
	carpet.name = "Carpet"
	_build_items(r, width)
	# door work point (corridor side) and room point
	_point_interactable("door:" + rid, 1.6)
	_point_interactable("room:" + rid, 2.2)
	refresh()


func _p(dx: float, d: float, y := 0.0) -> Vector3:
	## Local position: dx across the room, d depth from the door wall.
	return Vector3(cx + dx, y, _front + _s * d)


func _build_items(r: Dictionary, width: float) -> void:
	var half := width / 2.0 - 0.6
	# bed
	var bed := Node3D.new()
	interior.add_child(bed)
	bed.position = _p(0, 8.6)
	MeshFactory.box(bed, Vector3(2.2, 0.5, 2.4), Vector3(0, 0.25, 0), Color("#6b4f3a"), true)
	bed_cover = MeshFactory.box(bed, Vector3(2.1, 0.12, 2.0), Vector3(0, 0.56, _s * -0.15), Color(str(GameData.room_tiers[r.tier].bed)))
	MeshFactory.box(bed, Vector3(1.9, 0.18, 0.45), Vector3(0, 0.62, _s * 0.95), Color.WHITE)
	MeshFactory.box(bed, Vector3(2.2, 1.0, 0.1), Vector3(0, 0.6, _s * 1.2), Color("#5e3023"))
	# items
	var defs := {
		"lamp": _p(1.6, 9.6), "socket": _p(-1.6, 10.2), "tv": _p(min(2.6, half), 1.2),
		"shower": _p(-min(2.4, half - 0.4), 1.6), "ac": _p(-min(2.6, half), 10.0), "minibar": _p(min(2.6, half), 3.2),
	}
	for k in defs:
		var n := Node3D.new()
		interior.add_child(n)
		n.position = defs[k]
		_item_visual(n, k)
		item_nodes[k] = n
		var stand: Vector3 = defs[k] - Vector3(0, 0, _s * 0.9) if k in ["lamp", "socket", "ac"] else defs[k] + Vector3(0, 0, _s * 0.9)
		if k == "tv" or k == "minibar":
			stand = defs[k] + Vector3(-0.9 if defs[k].x > cx else 0.9, 0, 0)
		if k == "shower":
			stand = defs[k] + Vector3(1.2, 0, 0)
		layout.add_point("item:%s:%s" % [rid, k], int(r.floor), stand.x, stand.z)
		var warn := MeshFactory.label(n, "!", Vector3(0, 2.2, 0), 110, Color("#ff006e"))
		warn.visible = false
		warn_labels[k] = warn
		_point_interactable("item:%s:%s" % [rid, k], 1.5)
	# deco by tier
	var rank := int(GameData.room_tiers[r.tier].rank)
	if rank >= 2:
		MeshFactory.sphere(interior, 0.35, _p(-min(2.4, half), 6.0, 0.6), Color("#52b788"))
	if rank >= 3:
		MeshFactory.box(interior, Vector3(1.2, 0.8, 0.05), _p(0, 10.4, 1.9), Color("#e76f51"))
	if rank >= 4:
		MeshFactory.box(interior, Vector3(2.0, 0.45, 0.9), _p(-min(1.6, half - 1.0), 4.8, 0.25), Color("#6d597a"), true)


func _item_visual(n: Node3D, k: String) -> void:
	match k:
		"lamp":
			MeshFactory.box(n, Vector3(0.5, 0.55, 0.5), Vector3(0, 0.28, 0), Color("#8d6346"))
			MeshFactory.cylinder(n, 0.04, 0.4, Vector3(0, 0.75, 0), Color("#333333"))
			var shade := MeshFactory.cylinder(n, 0.22, 0.25, Vector3(0, 1.05, 0), Color("#fff3b0"), 0.12)
			shade.name = "Glow"
		"socket":
			MeshFactory.box(n, Vector3(0.25, 0.25, 0.05), Vector3(0, 0.45, _s * 0.02), Color.WHITE)
			MeshFactory.box(n, Vector3(0.05, 0.1, 0.06), Vector3(-0.05, 0.45, _s * 0.0), Color("#333333"))
			MeshFactory.box(n, Vector3(0.05, 0.1, 0.06), Vector3(0.05, 0.45, _s * 0.0), Color("#333333"))
		"tv":
			MeshFactory.box(n, Vector3(1.4, 0.7, 0.5), Vector3(0, 0.35, 0), Color("#5e3023"))
			MeshFactory.box(n, Vector3(1.3, 0.8, 0.08), Vector3(0, 1.15, 0), Color("#111111"))
			var scr := MeshFactory.box(n, Vector3(1.2, 0.7, 0.02), Vector3(0, 1.15, _s * 0.05), Color("#4cc9f0"))
			scr.material_override = MeshFactory.mat(Color("#4cc9f0"), 1.2)
			scr.name = "Glow"
		"shower":
			MeshFactory.box(n, Vector3(1.4, 0.1, 1.4), Vector3(0, 0.05, 0), Color("#e9ecef"), true)
			MeshFactory.box(n, Vector3(1.4, 2.2, 0.05), Vector3(0, 1.1, -_s * 0.7), Color(0.8, 0.95, 1.0, 0.5))
			MeshFactory.cylinder(n, 0.12, 0.05, Vector3(0, 2.1, 0), Color("#adb5bd"))
		"ac":
			MeshFactory.box(n, Vector3(1.2, 0.35, 0.3), Vector3(0, 2.5, 0), Color("#f8f9fa"))
			var g := MeshFactory.box(n, Vector3(1.0, 0.04, 0.02), Vector3(0, 2.38, -_s * 0.16), Color("#4cc9f0"))
			g.material_override = MeshFactory.mat(Color("#4cc9f0"), 1.0)
			g.name = "Glow"
		"minibar":
			MeshFactory.box(n, Vector3(0.6, 0.8, 0.6), Vector3(0, 0.4, 0), Color("#343a40"))
			var l := MeshFactory.sphere(n, 0.04, Vector3(0.2, 0.7, _s * 0.31), Color("#80ed99"), 2.0)
			l.name = "Glow"


func _point_interactable(key: String, r: float) -> void:
	var p: Dictionary = layout.point(key)
	if p.is_empty():
		return
	var it := Interactable.make(self, p.pos + Vector3(0, 0.8, 0), r, func(pl): return world.point_prompt(key, pl), func(pl): world.point_action(key, pl))
	it.alt_prompt_fn = func(pl): return world.point_alt_prompt(key, pl)
	it.alt_action_fn = func(pl): world.point_alt_action(key, pl)
	it.priority = 1 if key.begins_with("item:") else 0


func refresh() -> void:
	var r: Dictionary = Hotel.rooms[rid]
	var state := Hotel.room_light(r)
	light_mat.albedo_color = LIGHT_COLORS.get(state, Color.WHITE)
	light_mat.emission = LIGHT_COLORS.get(state, Color.WHITE)
	var broken := Hotel.broken_items(r)
	var txt: String = LIGHT_LABELS.get(state, state)
	if r.guest != "" and Hotel.guests.has(r.guest):
		txt += " — " + Hotel.guests[r.guest].name
	if not broken.is_empty():
		txt += "\n(!) PANNE"
	status_label.text = txt
	for k in item_nodes:
		var ok: bool = r["items"][k]
		warn_labels[k].visible = not ok
		var glow = item_nodes[k].get_node_or_null("Glow")
		if glow:
			glow.visible = ok
	interior.visible = r.unlocked or world.view_all
	bed_cover.visible = r.state != "dirty"


func _process(delta: float) -> void:
	_t += delta
	var r: Dictionary = Hotel.rooms[rid]
	# blinking red when something is broken
	if not Hotel.broken_items(r).is_empty() and r.unlocked:
		var on := fmod(_t, 1.0) < 0.5
		light_mat.emission = Color("#ff006e") if on else LIGHT_COLORS.get(Hotel.room_light(r), Color.WHITE)
	# open the door when someone is close
	var open := false
	var door_world := global_transform * Vector3(cx, 0, _front)
	if world.player and world.player.global_position.distance_to(door_world) < 2.0:
		open = true
	elif world.any_actor_near(door_world, 1.8):
		open = true
	var target := (-_s * 1.4) if open else 0.0
	door_pivot.rotation.y = lerp(door_pivot.rotation.y, target, 8.0 * delta)
