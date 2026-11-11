extends Node2D
## Une pièce : sol, murs, portes et décor mural sont dessinés ici.
## Les objets et les personnages vivent dans `entities`, triés en profondeur chaque image.

const Iso := preload("res://scripts/iso.gd")
const Pal := preload("res://scripts/pal.gd")
const PropScript := preload("res://scripts/prop.gd")

const VIEW := Vector2(384, 216)
const DOOR_H := 38.0

var def: Dictionary
var w := 6
var h := 6
var entities: Node2D
var props: Array = []
var extra_blockers: Array = []   ## ex. l'ombre qui garde la porte
var t := 0.0


func setup(d: Dictionary) -> void:
	def = d
	w = d.w
	h = d.h
	var total_h := (w + h) * 8.0 + Iso.WALL_H
	position = Vector2(round(VIEW.x * 0.5 - (w - h) * 8.0), round((VIEW.y - total_h) * 0.5 + Iso.WALL_H - 10.0))
	entities = Node2D.new()
	add_child(entities)
	for p in d.props:
		var n := PropScript.new()
		n.def = p
		entities.add_child(n)
		props.append(n)


func _process(delta: float) -> void:
	t += delta
	_sort_entities()
	queue_redraw()


# --- Géométrie -----------------------------------------------------------------

func blocked(g: Vector2, r: float) -> bool:
	if g.x < r or g.y < r or g.x > w - r or g.y > h - r:
		return true
	for p in props:
		if p.def.get("block", true) and p.grid_rect().grow(r).has_point(g):
			return true
	for b in extra_blockers:
		if is_instance_valid(b) and b.blocks and b.grid_rect().grow(r).has_point(g):
			return true
	return false


## Point au sol, juste devant une porte ou un objet mural.
func wall_point(item: Dictionary, dist := 0.45) -> Vector2:
	var mid: float = item.at + item.width * 0.5
	return Vector2(mid, dist) if item.wall == "R" else Vector2(dist, mid)


func spawn_from(from: String) -> Vector2:
	for d in def.doors:
		if d.get("to", "") == from:
			return wall_point(d, 0.75)
	return Vector2(w * 0.5, h * 0.5)


func door(id: String) -> Dictionary:
	for d in def.doors:
		if d.id == id:
			return d
	return {}


## Bas de la porte d'entrée (pour le fil de lumière), en coordonnées de la pièce.
func front_door_base():
	var d := door("front")
	if d.is_empty():
		return null
	return Iso.S(Vector2(d.at + d.width * 0.5, 0.12))


func find_prop(id: String):
	for p in props:
		if p.def.get("id", "") == id:
			return p
	return null


func interactables() -> Array:
	var out := []
	for p in props:
		if p.def.has("id"):
			out.append({"id": p.def.id, "label": p.def.get("label", ""), "rect": p.grid_rect(), "reach": 0.6, "bbox": p.screen_bbox()})
	for d in def.doors:
		out.append({"id": d.id, "label": d.get("label", ""), "pt": wall_point(d), "reach": 0.9,
			"bbox": _bbox(_wall_quad(d.wall, d.at, d.width, 0.0, DOOR_H))})
	for it in def.walls:
		if it.has("id"):
			out.append({"id": it.id, "label": it.get("label", ""), "pt": wall_point(it), "reach": 0.95,
				"bbox": _bbox(_wall_quad(it.wall, it.at, it.width, it.y, it.h))})
	return out


func _bbox(q: PackedVector2Array) -> Rect2:
	var r := Rect2(q[0], Vector2.ZERO)
	for p in q:
		r = r.expand(p)
	return r.grow(2)


## Tri en profondeur : un objet passe devant un autre s'il est plus « près » de l'écran.
func _sort_entities() -> void:
	var items := []
	for n in entities.get_children():
		if n.has_method("grid_rect"):
			items.append(n)
	var count := items.size()
	var behind := []
	var indeg := []
	for i in count:
		behind.append([])
		indeg.append(0)
	for i in count:
		var a: Rect2 = items[i].grid_rect()
		var sa: Vector2 = items[i].screen_span()
		for j in range(i + 1, count):
			var sb: Vector2 = items[j].screen_span()
			if sa.y <= sb.x or sb.y <= sa.x:
				continue
			var b: Rect2 = items[j].grid_rect()
			if _is_behind(a, b):
				behind[i].append(j)
				indeg[j] += 1
			else:
				behind[j].append(i)
				indeg[i] += 1
	var order := []
	var avail := []
	for i in count:
		if indeg[i] == 0:
			avail.append(i)
	while not avail.is_empty():
		avail.sort_custom(func(x, y): return _depth(items[x]) < _depth(items[y]))
		var k: int = avail.pop_front()
		order.append(k)
		for j in behind[k]:
			indeg[j] -= 1
			if indeg[j] == 0:
				avail.append(j)
	if order.size() < count:
		for i in count:
			if not order.has(i):
				order.append(i)
	for idx in order.size():
		var node: Node = items[order[idx]]
		if node.get_index() != idx:
			entities.move_child(node, idx)


func _depth(n) -> float:
	var r: Rect2 = n.grid_rect()
	return r.get_center().x + r.get_center().y


func _is_behind(a: Rect2, b: Rect2) -> bool:
	if a.end.x <= b.position.x + 0.01:
		return true
	if b.end.x <= a.position.x + 0.01:
		return false
	if a.end.y <= b.position.y + 0.01:
		return true
	if b.end.y <= a.position.y + 0.01:
		return false
	return a.get_center().x + a.get_center().y < b.get_center().x + b.get_center().y


# --- Dessin --------------------------------------------------------------------

func _draw() -> void:
	_draw_floor()
	_draw_walls()
	for d in def.doors:
		_draw_door(d)
	for it in def.walls:
		_draw_item(it)


func _hash(i: int, j: int) -> float:
	var n := (i * 374761393 + j * 668265263) & 0x7fffffff
	n = ((n ^ (n >> 13)) * 1274126177) & 0x7fffffff
	return float(n % 1000) / 1000.0


func _draw_floor() -> void:
	var A := Iso.S(Vector2(w, 0))
	var B := Iso.S(Vector2(w, h))
	var C := Iso.S(Vector2(0, h))
	var th := Vector2(0, 5)
	draw_colored_polygon(PackedVector2Array([A, B, C, C + th, B + th, A + th]), Pal.SLAB)
	var style: String = def.get("floor", "wood")
	for i in w:
		for j in h:
			var g := Vector2(i, j)
			var n := _hash(i, j)
			var col: Color
			match style:
				"tile":
					col = Pal.TILE_A if (i + j) % 2 == 0 else Pal.TILE_B
				"terracotta":
					col = (Pal.TERRACOTTA if (i + j) % 2 == 0 else Pal.TERRA_B).darkened(n * 0.05)
				_:
					col = Pal.FLOOR_WOOD.lightened(0.05 if j % 2 == 0 else 0.0).darkened(n * 0.08)
			draw_colored_polygon(Iso.flat(g, Vector2.ONE), col)
			match style:
				"wood":
					draw_line(Iso.S(g), Iso.S(g + Vector2(1, 0)), Pal.FLOOR_WOOD.darkened(0.25))
					if n > 0.55:
						var a := Iso.S(g + Vector2(n, 0.02))
						draw_line(a, Iso.S(g + Vector2(n, 0.98)), Pal.FLOOR_WOOD.darkened(0.18))
				_:
					draw_polyline(PackedVector2Array([Iso.S(g), Iso.S(g + Vector2(1, 0)), Iso.S(g + Vector2(1, 1))]), col.darkened(0.15))


func _draw_walls() -> void:
	var top := Vector2(0, -Iso.WALL_H)
	var o := Iso.S(Vector2.ZERO)
	var rw := Iso.S(Vector2(w, 0))
	var lw := Iso.S(Vector2(0, h))
	var wall_r := Pal.WALL_R
	var wall_l := Pal.WALL_L
	if def.get("floor", "") == "tile":
		wall_r = Color("c9d6d9")
		wall_l = Color("dbe5e7")
	elif def.get("floor", "") == "terracotta":
		wall_r = Color("e2c7a4")
		wall_l = Color("eed7b8")
	draw_colored_polygon(PackedVector2Array([o, rw, rw + top, o + top]), wall_r)
	draw_colored_polygon(PackedVector2Array([o, lw, lw + top, o + top]), wall_l)
	# Rayures du papier peint
	for k in range(1, w * 2):
		var p := Iso.S(Vector2(k * 0.5, 0))
		draw_line(p + Vector2(0, -4), p + top, wall_r.darkened(0.04))
	for k in range(1, h * 2):
		var p := Iso.S(Vector2(0, k * 0.5))
		draw_line(p + Vector2(0, -4), p + top, wall_l.darkened(0.04))
	# Plinthes
	var bb := Vector2(0, -3)
	draw_colored_polygon(PackedVector2Array([o, rw, rw + bb, o + bb]), Pal.BASEBOARD)
	draw_colored_polygon(PackedVector2Array([o, lw, lw + bb, o + bb]), Pal.BASEBOARD.darkened(0.1))
	# Épaisseur du haut des murs
	var back_r := Iso.S(Vector2(0, -0.2))
	var back_l := Iso.S(Vector2(-0.2, 0))
	draw_colored_polygon(PackedVector2Array([o + top, rw + top, rw + top + back_r, o + top + back_r]), Pal.WALL_CAP)
	draw_colored_polygon(PackedVector2Array([o + top, lw + top, lw + top + back_l, o + top + back_l]), Pal.WALL_CAP.darkened(0.06))
	draw_colored_polygon(PackedVector2Array([o + top, o + top + back_r, o + top + back_r + back_l, o + top + back_l]), Pal.WALL_CAP)
	draw_line(o, o + top, wall_l.darkened(0.3))
	draw_line(rw, rw + top, wall_r.darkened(0.3))
	draw_line(lw, lw + top, wall_l.darkened(0.3))


func _wall_quad(wall: String, a: float, wd: float, y: float, hh: float) -> PackedVector2Array:
	var p0: Vector2
	var p1: Vector2
	if wall == "R":
		p0 = Iso.S(Vector2(a, 0))
		p1 = Iso.S(Vector2(a + wd, 0))
	else:
		p0 = Iso.S(Vector2(0, a))
		p1 = Iso.S(Vector2(0, a + wd))
	var v0 := Vector2(0, -y)
	var v1 := Vector2(0, -(y + hh))
	return PackedVector2Array([p0 + v0, p1 + v0, p1 + v1, p0 + v1])


## Petit quadrilatère sur un mur, en fractions (u le long du mur, v en hauteur) d'une zone.
func _sub(q: PackedVector2Array, u0: float, u1: float, v0: float, v1: float) -> PackedVector2Array:
	var b0 := q[0].lerp(q[1], u0)
	var b1 := q[0].lerp(q[1], u1)
	var up := q[3] - q[0]
	return PackedVector2Array([b0 + up * v0, b1 + up * v0, b1 + up * v1, b0 + up * v1])


func _draw_door(d: Dictionary) -> void:
	var q := _wall_quad(d.wall, d.at, d.width, 0.0, DOOR_H)
	var frame := Pal.WOOD_DARK
	match d.kind:
		"passage":
			draw_colored_polygon(q, Pal.DOORWAY)
		"closed":
			draw_colored_polygon(q, Pal.DOOR)
			draw_colored_polygon(_sub(q, 0.18, 0.82, 0.55, 0.9), Pal.DOOR.darkened(0.15))
			draw_colored_polygon(_sub(q, 0.18, 0.82, 0.1, 0.45), Pal.DOOR.darkened(0.15))
			_handle(q)
		"front":
			draw_colored_polygon(q, Pal.DOOR_FRONT)
			draw_colored_polygon(_sub(q, 0.15, 0.85, 0.08, 0.92), Pal.DOOR_FRONT.darkened(0.12))
			draw_rect(Rect2(q[0].lerp(q[1], 0.5) + Vector2(0, -27), Vector2(1, 1)), Color("2a1a12"))
			# Le fil de lumière, en bas : il est là depuis le début.
			draw_line(q[0].lerp(q[1], 0.08) + Vector2(0, -1), q[0].lerp(q[1], 0.92) + Vector2(0, -1), Pal.WARM)
			var hp := _handle(q)
			if Game.cycle != Game.CYCLE_DAWN:
				# Le panneau VERROUILLÉ pendu à la poignée
				var sp := hp + Vector2(-3, 4)
				draw_line(hp, sp + Vector2(1, 0), Color("d8d0c0"))
				draw_line(hp, sp + Vector2(7, 0), Color("d8d0c0"))
				draw_rect(Rect2(sp, Vector2(9, 5)), Color("e8e0cf"))
				draw_line(sp + Vector2(1, 2), sp + Vector2(8, 2), Pal.RED)
		"open_front":
			draw_colored_polygon(q, Color("fff0d4"))
			draw_colored_polygon(_sub(q, 0.0, 1.0, 0.0, 0.25), Color("ffe2b0"))
	draw_polyline(PackedVector2Array([q[0], q[3], q[2], q[1]]), frame)


func _handle(q: PackedVector2Array) -> Vector2:
	var hp := q[0].lerp(q[1], 0.8) + Vector2(0, -17)
	draw_rect(Rect2(hp, Vector2(2, 1)), Pal.BRASS)
	return hp


func _draw_item(it: Dictionary) -> void:
	var q := _wall_quad(it.wall, it.at, it.width, it.y, it.h)
	match it.kind:
		"window":
			_window(q, it.get("state", "carton"))
		"clock":
			_clock(q)
		"mirror":
			_mirror(q)
		"tally":
			_tally(it)
		"calendar":
			draw_colored_polygon(q, Pal.PAPER)
			draw_colored_polygon(_sub(q, 0.0, 1.0, 0.8, 1.0), Pal.RED)
			for k in 3:
				draw_line(_sub(q, 0.15, 0.85, 0.2 + k * 0.2, 0.2)[0], _sub(q, 0.15, 0.85, 0.2 + k * 0.2, 0.2)[1], Color("b9b2a4"))
		"sunrise":
			_sunrise(q)


func _window(q: PackedVector2Array, state: String) -> void:
	var inner := _sub(q, 0.08, 0.92, 0.08, 0.92)
	draw_colored_polygon(q, Color("ece4d4"))
	match state:
		"carton", "carton_text", "torn":
			draw_colored_polygon(inner, Pal.CARDBOARD.darkened(0.1))
			draw_line(inner[0], inner[2], Pal.TAPE)
			draw_line(inner[1], inner[3], Pal.TAPE)
			draw_polyline(PackedVector2Array([inner[0], inner[1], inner[2], inner[3], inner[0]]), Pal.TAPE)
			if state == "carton_text":
				var a := _sub(inner, 0.2, 0.8, 0.45, 0.6)
				draw_line(a[0], a[1], Color("1a1a1a"))
				draw_line(a[3], a[2], Color("1a1a1a"))
			if state == "torn":
				var s := _sub(inner, 0.62, 0.78, 0.35, 0.95)
				draw_colored_polygon(PackedVector2Array([s[3], s[2], s[1].lerp(s[0], 0.4), s[0]]), Color("e6edf0"))
		"open":
			draw_colored_polygon(inner, Color("aab6c0"))
			draw_colored_polygon(_sub(inner, 0.0, 1.0, 0.0, 0.35), Color("6f7882"))
			draw_colored_polygon(_sub(inner, 0.2, 0.45, 0.0, 0.5), Color("6f7882"))
		"dawn":
			draw_colored_polygon(inner, Color("f6c9a0"))
			draw_colored_polygon(_sub(inner, 0.0, 1.0, 0.5, 1.0), Color("fbe0c2"))
			draw_colored_polygon(_sub(inner, 0.0, 1.0, 0.0, 0.3), Color("b98a7a"))
	# croisillon
	var m0 := q[0].lerp(q[1], 0.5)
	draw_line(m0, m0 + (q[3] - q[0]), Color("ece4d4"))


func _clock(q: PackedVector2Array) -> void:
	var c := (q[0] + q[2]) * 0.5
	draw_circle(c, 5.0, Color("ece6da"))
	draw_arc(c, 5.0, 0.0, TAU, 16, Color("3a3a40"))
	var hour := (3.0 + 12.0 / 60.0) / 12.0 * TAU - PI * 0.5
	var minute := 12.0 / 60.0 * TAU - PI * 0.5
	draw_line(c, c + Vector2.from_angle(hour) * 2.5, Color("1d1b24"))
	draw_line(c, c + Vector2.from_angle(minute) * 4.0, Color("1d1b24"))
	if Game.cycle == Game.CYCLE_DAWN:
		var sec := t * TAU / 60.0 - PI * 0.5
		draw_line(c, c + Vector2.from_angle(sec) * 4.0, Pal.RED)
	else:
		# la trotteuse tressaute, sans jamais avancer
		var tremble := 0.08 if fmod(t, 1.0) < 0.12 else 0.0
		draw_line(c, c + Vector2.from_angle(-PI * 0.5 + 0.9 + tremble) * 4.0, Pal.RED)


func _mirror(q: PackedVector2Array) -> void:
	draw_colored_polygon(q, Color("e3e8ea"))
	var inner := _sub(q, 0.1, 0.9, 0.08, 0.92)
	var wiped := Game.has("mirror_wiped") and Game.cycle != Game.CYCLE_DARK
	if wiped:
		draw_colored_polygon(inner, Color("8ea3b1"))
		var s := _sub(inner, 0.35, 0.65, 0.0, 0.7)
		draw_colored_polygon(s, Color("4f6385"))
		draw_line(inner[0].lerp(inner[1], 0.1), inner[3].lerp(inner[2], 0.4), Color("b8c8d2"))
	else:
		draw_colored_polygon(inner, Color("c6cfd3"))
		# « ÇA VA » écrit dans la buée, encore et encore
		for row in 4:
			var r := _sub(inner, 0.12, 0.88, 0.18 + row * 0.2, 0.18 + row * 0.2)
			var p := r[0]
			var dir := (r[1] - r[0]) / 10.0
			for k in 10:
				if k % 5 != 4:
					draw_line(p + dir * k, p + dir * k + Vector2(0, -2), Color("8a9499"))


func _tally(it: Dictionary) -> void:
	var col := Color("6e5c4c")
	for row in 4:
		for grp in 6:
			var u: float = it.at + 0.06 + grp * 0.2
			var base := Iso.S(Vector2(0, u)) + Vector2(0, -(it.y + row * 7.0))
			for k in 4:
				var p := base + Vector2(-k * 2, k)
				draw_line(p, p + Vector2(0, -4), col)
			draw_line(base + Vector2(1, -1), base + Vector2(-7, 1), col)


func _sunrise(q: PackedVector2Array) -> void:
	draw_colored_polygon(q, Color("f1e6d2"))
	var inner := _sub(q, 0.04, 0.96, 0.05, 0.95)
	var bands := [Color("fbe7c6"), Color("f9d3a6"), Color("f4b98f"), Color("e89d86"), Color("c98a93"), Color("9d84a6")]
	for k in bands.size():
		draw_colored_polygon(_sub(inner, 0.0, 1.0, k / 6.0, (k + 1) / 6.0), bands[k])
	var sun := inner[0].lerp(inner[1], 0.62) + (inner[3] - inner[0]) * 0.22
	draw_circle(sun, 4.0, Color("fff6dc"))
	draw_colored_polygon(_sub(inner, 0.0, 1.0, 0.0, 0.12), Color("8a7268"))
	draw_colored_polygon(_sub(inner, 0.1, 0.3, 0.0, 0.22), Color("8a7268"))
	draw_colored_polygon(_sub(inner, 0.7, 0.85, 0.0, 0.18), Color("8a7268"))
	for u in [0.33, 0.66]:
		var b := q[0].lerp(q[1], u)
		draw_line(b, b + (q[3] - q[0]), Color("f1e6d2"))
