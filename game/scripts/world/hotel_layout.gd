class_name HotelLayout
extends RefCounted
## Geometry of the building + navigation + named work points.
##
## Navigation is a tree of rectangular zones per floor (rooms, back rooms,
## desks…) hanging off a convex "hall" (corridor / lobby). A path climbs from
## the start zone to the common ancestor through door points, then goes down
## to the target. Floors are linked by the elevator (see Elevator).

const WALL_H := 3.4
const T := 0.2
const DOOR_W := 1.4

var H := 4.0
var floors := 5
var zones := {}      # floor -> {zone_id: {rect, parent, inner, outer}}
var points := {}     # key -> {floor, pos (local x,z as Vector3, y=0)}
var floor_nodes := []
var world: Node3D


func _init(w: Node3D) -> void:
	world = w
	H = GameData.floor_height()
	floors = int(GameData.building.floors)


# ------------------------------------------------------------------ points
func add_point(key: String, f: int, x: float, z: float) -> void:
	points[key] = {"floor": f, "pos": Vector3(x, 0, z)}


func point(key: String) -> Dictionary:
	return points.get(key, {})


func world_pos(f: int, p: Vector3) -> Vector3:
	return Vector3(p.x, f * H, p.z)


func floor_of_y(y: float) -> int:
	return clamp(int(floor((y + 1.0) / H)), 0, floors - 1)


# ------------------------------------------------------------------ zones
func _zone(f: int, id: String, rect: Rect2, parent: String, inner: Vector2, outer: Vector2) -> void:
	if not zones.has(f):
		zones[f] = {}
	zones[f][id] = {"rect": rect, "parent": parent, "inner": Vector3(inner.x, 0, inner.y), "outer": Vector3(outer.x, 0, outer.y)}


func zone_at(f: int, p: Vector3) -> String:
	var best := "hall"
	var best_area := INF
	for id in zones.get(f, {}):
		if id == "hall":
			continue
		var z: Dictionary = zones[f][id]
		var r: Rect2 = z.rect
		if r.has_point(Vector2(p.x, p.z)) and r.get_area() < best_area:
			best = id
			best_area = r.get_area()
	return best


func _chain(f: int, id: String) -> Array:
	var c := [id]
	while id != "hall":
		id = zones[f][id].parent
		c.append(id)
	return c


## Local-space waypoints (y=0) from a to b on floor f.
func path(f: int, a: Vector3, b: Vector3) -> Array:
	var za := zone_at(f, a)
	var zb := zone_at(f, b)
	if za == zb:
		return [b]
	var ca := _chain(f, za)
	var cb := _chain(f, zb)
	var lca := "hall"
	for z in ca:
		if z in cb:
			lca = z
			break
	var pts := []
	for z in ca:
		if z == lca:
			break
		pts.append(zones[f][z].inner)
		pts.append(zones[f][z].outer)
	var down := []
	for z in cb:
		if z == lca:
			break
		down.push_front(zones[f][z].inner)
		down.push_front(zones[f][z].outer)
	pts.append_array(down)
	pts.append(b)
	return pts


# ------------------------------------------------------------------ build
func build() -> void:
	for f in floors:
		var n := Node3D.new()
		n.name = "Floor%d" % f
		n.position.y = f * H
		world.add_child(n)
		floor_nodes.append(n)
		_slab(n, f)
		_outer_walls(n, f)
		if f == 0:
			_ground_floor(n)
		else:
			_upper_floor(n, f)
		_elevator_shaft(n, f)
	_exterior()


func _mat_wall(f: int) -> Color:
	return Color("#f4ede4") if f == 0 else Color("#efe6dd")


func _slab(n: Node3D, f: int) -> void:
	var col := Color("#c9a66b") if f == 0 else Color("#7f4f24")
	MeshFactory.box(n, Vector3(40.4, 0.2, 24.4), Vector3(0, -0.1, 0), Color("#6d6875"), true)
	MeshFactory.box(n, Vector3(39.8, 0.02, 23.8), Vector3(0, 0.01, 0), col.lightened(0.25) if f == 0 else Color("#dcd0c0"))
	if f > 0:
		# luxury corridor carpet
		MeshFactory.box(n, Vector3(39.6, 0.03, 2.8), Vector3(0, 0.02, 0), Color("#8d0801"))
		MeshFactory.box(n, Vector3(39.6, 0.031, 0.12), Vector3(0, 0.025, 1.2), Color("#e9c46a"))
		MeshFactory.box(n, Vector3(39.6, 0.031, 0.12), Vector3(0, 0.025, -1.2), Color("#e9c46a"))
		var lbl := MeshFactory.label(n, GameData.floor_name(f).to_upper(), Vector3(-17.5, 0.05, 0), 90, Color("#e9c46a"), false)
		lbl.rotation.x = -PI / 2
		lbl.outline_size = 0


## Axis-aligned wall from a to b (x,z) with door gaps [[center, width], ...].
func wall(n: Node3D, a: Vector2, b: Vector2, gaps: Array, col: Color, h := WALL_H) -> void:
	var horizontal: bool = abs(a.y - b.y) < 0.01
	var s0: float = min(a.x, b.x) if horizontal else min(a.y, b.y)
	var s1: float = max(a.x, b.x) if horizontal else max(a.y, b.y)
	var fixed: float = a.y if horizontal else a.x
	var segs := []
	var cur := s0
	var sorted_gaps := gaps.duplicate()
	sorted_gaps.sort_custom(func(g1, g2): return g1[0] < g2[0])
	for g in sorted_gaps:
		var g0: float = g[0] - g[1] / 2.0
		var g1: float = g[0] + g[1] / 2.0
		if g0 > cur:
			segs.append([cur, g0])
		cur = max(cur, g1)
	if cur < s1:
		segs.append([cur, s1])
	for s in segs:
		var length: float = s[1] - s[0]
		if length < 0.05:
			continue
		var mid: float = (s[0] + s[1]) / 2.0
		if horizontal:
			MeshFactory.box(n, Vector3(length, h, T), Vector3(mid, h / 2, fixed), col, true)
		else:
			MeshFactory.box(n, Vector3(T, h, length), Vector3(fixed, h / 2, mid), col, true)
	# lintels above gaps (visual only)
	for g in gaps:
		if horizontal:
			MeshFactory.box(n, Vector3(g[1], h - 2.4, T), Vector3(g[0], 2.4 + (h - 2.4) / 2, fixed), col)
		else:
			MeshFactory.box(n, Vector3(T, h - 2.4, g[1]), Vector3(fixed, 2.4 + (h - 2.4) / 2, g[0]), col)


func _outer_walls(n: Node3D, f: int) -> void:
	var c := Color("#d8c3a5")
	var south_gaps := [[0.0, 4.0]] if f == 0 else []
	wall(n, Vector2(-20, 12), Vector2(20, 12), south_gaps, c)
	wall(n, Vector2(-20, -12), Vector2(20, -12), [], c)
	wall(n, Vector2(-20, -12), Vector2(-20, 12), [], c)
	wall(n, Vector2(20, -12), Vector2(20, 12), [], c)
	for x in [-16.0, -8.0, 8.0, 16.0]:
		for z in [12.12, -12.12]:
			MeshFactory.box(n, Vector3(3.0, 1.6, 0.06), Vector3(x, 1.9, z), Color(0.6, 0.82, 1.0, 0.75))
	for z in [-7.0, 6.0]:
		for x in [20.12, -20.12]:
			MeshFactory.box(n, Vector3(0.06, 1.6, 3.0), Vector3(x, 1.9, z), Color(0.6, 0.82, 1.0, 0.75))


func _elevator_shaft(n: Node3D, f: int) -> void:
	var e: Dictionary = GameData.building.elevator
	var wc := Color("#adb5bd")
	wall(n, Vector2(e.x0, e.z0), Vector2(e.x1, e.z0), [], wc)
	wall(n, Vector2(e.x0, e.z0), Vector2(e.x0, e.z1), [], wc)
	wall(n, Vector2(e.x1, e.z0), Vector2(e.x1, e.z1), [], wc)
	add_point("elevator_front:%d" % f, f, -1.0, -0.3)
	_zone(f, "elevator", Rect2(e.x0, e.z0, e.x1 - e.x0, e.z1 - e.z0), "hall", Vector2(-1, -2.4), Vector2(-1, -0.3))


func _upper_floor(n: Node3D, f: int) -> void:
	_zone(f, "hall", Rect2(-20, -1.5, 40, 3), "", Vector2.ZERO, Vector2.ZERO)
	var wc := _mat_wall(f)
	var north_gaps := [[-1.0, 4.6], [4.0, DOOR_W]]
	var south_gaps := []
	for r in GameData.building.rooms:
		var cx := (float(r.x0) + float(r.x1)) / 2.0
		var rid := "%d%02d" % [f, int(r.idx)]
		var north: bool = r.side == "N"
		var z0 := -12.0 if north else 1.5
		var z1 := -1.5 if north else 12.0
		if north:
			north_gaps.append([cx, DOOR_W])
		else:
			south_gaps.append([cx, DOOR_W])
		var front := -1.5 if north else 1.5
		var s := -1.0 if north else 1.0
		_zone(f, "room:" + rid, Rect2(float(r.x0), z0, float(r.x1) - float(r.x0), z1 - z0), "hall",
			Vector2(cx, front + s * 1.0), Vector2(cx, front - s * 0.8))
		add_point("room:" + rid, f, cx, front + s * 5.0)
		add_point("door:" + rid, f, cx, front - s * 0.75)
		# partitions
		for x in [float(r.x0), float(r.x1)]:
			if abs(x) < 19.9:
				wall(n, Vector2(x, z0), Vector2(x, z1), [], wc)
	wall(n, Vector2(-20, -1.5), Vector2(20, -1.5), north_gaps, wc)
	wall(n, Vector2(-20, 1.5), Vector2(20, 1.5), south_gaps, wc)
	# linen / service closet
	var li: Dictionary = GameData.building.linen
	wall(n, Vector2(li.x0, -12), Vector2(li.x0, -1.5), [], wc)
	wall(n, Vector2(li.x1, -12), Vector2(li.x1, -1.5), [], wc)
	_zone(f, "linen", Rect2(li.x0, -12, li.x1 - li.x0, 10.5), "hall", Vector2(4, -2.5), Vector2(4, -0.3))
	add_point("linen:%d" % f, f, 4.0, -5.0)
	_linen_shelves(n)


func _linen_shelves(n: Node3D) -> void:
	MeshFactory.box(n, Vector3(3.4, 2.2, 0.6), Vector3(4, 1.1, -11.5), Color("#8d6346"))
	for i in 4:
		MeshFactory.box(n, Vector3(0.7, 0.35, 0.45), Vector3(2.8 + i * 0.8, 1.6, -11.4), Color("#f8f9fa"))
		MeshFactory.box(n, Vector3(0.7, 0.35, 0.45), Vector3(2.8 + i * 0.8, 0.8, -11.4), Color("#bde0fe"))
	var cart := Node3D.new()
	n.add_child(cart)
	cart.position = Vector3(4.8, 0, -7.5)
	MeshFactory.box(cart, Vector3(0.8, 0.9, 1.2), Vector3(0, 0.55, 0), Color("#457b9d"))
	MeshFactory.box(cart, Vector3(0.6, 0.3, 1.0), Vector3(0, 1.1, 0), Color("#f8f9fa"))


func _ground_floor(n: Node3D) -> void:
	var wc := _mat_wall(0)
	_zone(0, "hall", Rect2(-16.5, -1.5, 30, 13.5), "", Vector2.ZERO, Vector2.ZERO)
	var back_gaps := [[-1.0, 4.6]]
	for r in GameData.building.ground_rooms:
		var cx := (float(r.x0) + float(r.x1)) / 2.0
		var dx := cx
		if r.id == "laundry":
			dx = -14.5   # door away from the reception desk
		back_gaps.append([dx, DOOR_W])
		for x in [float(r.x0), float(r.x1)]:
			if abs(x) < 19.9:
				wall(n, Vector2(x, -12), Vector2(x, -1.5), [], wc)
		var parent := "cafe_back" if r.id == "kitchen" else "hall"
		_zone(0, r.id, Rect2(float(r.x0), -12, float(r.x1) - float(r.x0), 10.5), parent, Vector2(dx, -2.5), Vector2(dx, -0.4))
		var lbl := MeshFactory.label(n, r.name.to_upper(), Vector3(dx, 2.75, -1.38), 34, Color("#333333"), false)
		lbl.outline_size = 0
	wall(n, Vector2(-20, -1.5), Vector2(20, -1.5), back_gaps, wc)
	# Reception: desk + staff zone behind it
	MeshFactory.box(n, Vector3(1.0, 1.15, 8.0), Vector3(-16.0, 0.58, 5.0), Color("#5e3023"), true)
	MeshFactory.box(n, Vector3(1.2, 0.08, 8.2), Vector3(-16.0, 1.18, 5.0), Color("#e9c46a"))
	MeshFactory.box(n, Vector3(0.3, 2.6, 6.0), Vector3(-19.8, 1.3, 5.0), Color("#5e3023"))
	for i in 12:
		MeshFactory.box(n, Vector3(0.1, 0.12, 0.08), Vector3(-19.6, 1.4 + (i / 6) * 0.4, 2.5 + (i % 6) * 0.9), Color("#ffd166"))
	var rl := MeshFactory.label(n, "RÉCEPTION", Vector3(-15.45, 0.75, 5.0), 60, Color("#e9c46a"), false)
	rl.rotation.y = PI / 2
	rl.outline_size = 0
	_zone(0, "reception_back", Rect2(-20, -1.5, 3.5, 13.5), "hall", Vector2(-18, -0.6), Vector2(-15.2, -0.6))
	add_point("reception_staff", 0, -17.6, 4.5)
	add_point("reception_front", 0, -14.6, 4.5)
	# Concierge
	MeshFactory.box(n, Vector3(2.6, 1.1, 0.8), Vector3(-9.0, 0.55, 10.0), Color("#3d405b"), true)
	MeshFactory.label(n, "CONCIERGE", Vector3(-9.0, 0.7, 9.58), 40, Color("#e9c46a"), false).outline_size = 0
	add_point("concierge_staff", 0, -9.0, 11.2)
	add_point("concierge_front", 0, -9.0, 8.8)
	# Café
	MeshFactory.box(n, Vector3(1.0, 1.15, 8.0), Vector3(13.5, 0.58, 5.0), Color("#7f5539"), true)
	MeshFactory.box(n, Vector3(1.2, 0.08, 8.2), Vector3(13.5, 1.18, 5.0), Color("#3d2c22"))
	var cl := MeshFactory.label(n, "CAFÉ WOBBLE", Vector3(12.95, 0.75, 5.0), 56, Color("#ffd166"), false)
	cl.rotation.y = -PI / 2
	cl.outline_size = 0
	_zone(0, "cafe_back", Rect2(14.0, -1.5, 6.0, 13.5), "hall", Vector2(16.5, -0.5), Vector2(12.0, -0.5))
	add_point("cafe_staff", 0, 16.2, 6.0)
	add_point("cafe_counter", 0, 14.6, 4.5)
	add_point("cafe_front", 0, 12.3, 4.5)
	add_point("cafe_machine", 0, 18.3, 3.0)
	add_point("cafe_display", 0, 18.3, 7.0)
	_cafe_machine(n)
	# back rooms
	add_point("laundry", 0, -15.5, -6.0)
	add_point("washer_1", 0, -18.0, -8.6)
	add_point("washer_2", 0, -14.0, -8.6)
	add_point("linen:0", 0, -12.6, -4.0)
	add_point("workshop", 0, -7.5, -8.0)
	add_point("storage", 0, 4.0, -7.0)
	add_point("staff_room", 0, 9.5, -7.0)
	add_point("kitchen", 0, 16.5, -8.4)
	add_point("porter_post", 0, 3.2, 10.2)
	add_point("lobby", 0, 0.0, 4.0)
	add_point("entrance", 0, 0.0, 11.4)
	add_point("street", 0, 0.0, 22.0)
	_back_room_props(n)
	# entrance
	MeshFactory.box(n, Vector3(4.6, 0.2, 0.4), Vector3(0, 3.3, 12.0), Color("#e9c46a"))
	var sign := MeshFactory.label(n, "GRAND HÔTEL WOBBLE ★★★★", Vector3(0, 3.0, 12.25), 72, Color("#e9c46a"), false)
	sign.outline_size = 0
	# chandelier
	MeshFactory.sphere(n, 0.6, Vector3(-2, 3.0, 5), Color("#fff3b0"), 1.5)


func _cafe_machine(n: Node3D) -> void:
	MeshFactory.box(n, Vector3(0.9, 1.0, 1.2), Vector3(19.4, 0.5, 3.0), Color("#6b4f3a"), true)
	MeshFactory.box(n, Vector3(0.7, 0.6, 0.9), Vector3(19.4, 1.3, 3.0), Color("#c0c0c0"))
	MeshFactory.box(n, Vector3(0.9, 0.9, 1.6), Vector3(19.4, 0.45, 7.0), Color("#6b4f3a"), true)
	MeshFactory.box(n, Vector3(0.8, 0.5, 1.5), Vector3(19.4, 1.15, 7.0), Color(0.75, 0.92, 1.0, 0.5))
	for i in 4:
		var c := MeshFactory.capsule(n, 0.07, 0.3, Vector3(19.4, 1.0, 6.4 + i * 0.4), Color("#d99a3d"))
		c.rotation.x = PI / 2


func _back_room_props(n: Node3D) -> void:
	# laundry machines
	for p in [Vector3(-18.0, 0, -10.4), Vector3(-14.0, 0, -10.4)]:
		MeshFactory.box(n, Vector3(1.3, 1.3, 1.1), p + Vector3(0, 0.65, 0), Color("#f8f9fa"), true)
		MeshFactory.cylinder(n, 0.4, 0.05, p + Vector3(0, 0.75, 0.56), Color("#4cc9f0")).rotation.x = PI / 2
	MeshFactory.box(n, Vector3(2.4, 0.9, 0.9), Vector3(-12.6, 0.45, -6.0), Color("#8d6346"), true)
	# workshop bench
	MeshFactory.box(n, Vector3(4.0, 1.0, 1.0), Vector3(-7.5, 0.5, -11.2), Color("#6c584c"), true)
	MeshFactory.box(n, Vector3(3.6, 1.6, 0.1), Vector3(-7.5, 2.0, -11.85), Color("#495057"))
	for i in 6:
		MeshFactory.box(n, Vector3(0.12, 0.5, 0.08), Vector3(-9.0 + i * 0.6, 2.0, -11.75), Color("#ff7b00"))
	# storage shelves
	for i in 3:
		MeshFactory.box(n, Vector3(3.0, 0.4, 0.8), Vector3(4.0, 0.5 + i * 0.8, -11.4), Color("#a98467"))
	# staff room
	MeshFactory.box(n, Vector3(2.4, 0.8, 1.2), Vector3(9.5, 0.4, -10.5), Color("#bc8a5f"), true)
	for i in 4:
		MeshFactory.box(n, Vector3(0.5, 0.5, 0.5), Vector3(8.4 + i * 0.75, 0.25, -9.4), Color("#e9c46a"))
	# kitchen stove
	MeshFactory.box(n, Vector3(3.0, 1.0, 1.0), Vector3(16.5, 0.5, -10.6), Color("#adb5bd"), true)
	for i in 4:
		MeshFactory.cylinder(n, 0.22, 0.05, Vector3(15.6 + i * 0.6, 1.03, -10.6), Color("#212529"))
	MeshFactory.box(n, Vector3(3.0, 0.8, 0.6), Vector3(16.5, 2.4, -11.6), Color("#ced4da"))


func _exterior() -> void:
	MeshFactory.box(world, Vector3(200, 1, 200), Vector3(0, -0.6, 20), Color("#80b918"), true)
	MeshFactory.box(world, Vector3(60, 0.05, 6), Vector3(0, -0.07, 15.5), Color("#d6ccc2"))
	MeshFactory.box(world, Vector3(80, 0.05, 8), Vector3(0, -0.08, 22.5), Color("#4a4e57"))
	for x in [-14.0, -6.0, 6.0, 14.0]:
		MeshFactory.sphere(world, 0.9, Vector3(x, 0.9, 14.2), Color("#2d6a4f"))
		MeshFactory.cylinder(world, 0.5, 0.6, Vector3(x, 0.3, 14.2), Color("#9c6644"))
	# red carpet at the entrance
	MeshFactory.box(world, Vector3(2.4, 0.04, 6), Vector3(0, 0.0, 15.0), Color("#9d0208"))
