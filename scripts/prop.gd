extends Node2D
## Un objet de la pièce (lit, cartons, frigo…), dessiné en pavés isométriques.

const Iso := preload("res://scripts/iso.gd")
const Pal := preload("res://scripts/pal.gd")
const Sprites := preload("res://scripts/sprites.gd")

var def: Dictionary
var t := 0.0


func grid_rect() -> Rect2:
	return Rect2(def.g, def.s)


func screen_span() -> Vector2:
	var r := grid_rect()
	return Vector2(Iso.S(Vector2(r.position.x, r.end.y)).x, Iso.S(Vector2(r.end.x, r.position.y)).x)


func screen_bbox() -> Rect2:
	var r := grid_rect()
	var span := screen_span()
	var top := Iso.S(r.position).y - float(def.get("h", 8.0)) - 6.0
	var bottom := Iso.S(r.end).y + 2.0
	return Rect2(span.x - 2, top, span.y - span.x + 4, bottom - top)


func _process(delta: float) -> void:
	t += delta
	if def.kind in ["lantern", "table", "counter"]:
		queue_redraw()


## Pavé avec ombrage et contour automatiques.
func B(g: Vector2, s: Vector2, h: float, base: Color, z := 0.0) -> void:
	Iso.box(self, g, s, h, base.lightened(0.16), base, base.darkened(0.22), z, base.darkened(0.6))


func _draw() -> void:
	var g: Vector2 = def.g
	var s: Vector2 = def.s
	var h: float = def.get("h", 8.0)
	match def.kind:
		"bed":
			B(g, Vector2(s.x, 0.2), 17, Pal.WOOD_DARK)
			B(g + Vector2(0, 0.2), Vector2(s.x, s.y - 0.2), 5, Pal.WOOD_DARK)
			B(g + Vector2(0.08, 0.25), Vector2(s.x - 0.16, s.y - 0.33), 4, Pal.SHEET, 5)
			B(g + Vector2(0.25, 0.32), Vector2(s.x - 0.5, 0.55), 3, Pal.PILLOW, 9)
			B(g + Vector2(0.06, 1.05), Vector2(s.x - 0.12, s.y - 1.15), 2, Pal.BLANKET, 9)
		"box":
			_box(g, s, h)
		"desk":
			_legs(g, s, h - 2)
			B(g, s, 2, Pal.WOOD, h - 2)
			B(g + Vector2(0.35, 0.15), Vector2(0.65, 0.45), 1, Pal.LAPTOP, h)
			draw_rect(Rect2(Iso.S(g + Vector2(0.62, 0.35)) + Vector2(-1, -h - 2), Vector2(2, 1)), Pal.POSTIT)
		"lantern":
			var p := Iso.S(g + s * 0.5)
			Sprites.draw(self, Sprites.LANTERN, p + Vector2(-2, -6))
			if fmod(t, 0.4) < 0.2:
				draw_rect(Rect2(p + Vector2(0, -4), Vector2(1, 1)), Color.WHITE)
		"table":
			_legs(g, s, h - 2)
			B(g, s, 2, Pal.WOOD_LIGHT, h - 2)
			if def.get("phone", false):
				_phone(g, h)
		"chair":
			_legs(g, s, 5)
			B(g, s, 2, Pal.WOOD, 5)
			B(g, Vector2(s.x, 0.12), 9, Pal.WOOD_DARK, 7)
		"fridge":
			_fridge(g, s, h)
		"counter":
			_counter(g, s, h)
		"basin":
			B(g + Vector2(0.22, 0.3), Vector2(0.26, 0.3), h - 4, Pal.PORCELAIN)
			B(g, s, 4, Pal.PORCELAIN, h - 4)
			draw_colored_polygon(Iso.flat(g + Vector2(0.15, 0.18), s - Vector2(0.3, 0.36), h), Color("9fb6c3"))
		"bath":
			B(g, s, h, Pal.PORCELAIN)
			draw_colored_polygon(Iso.flat(g + Vector2(0.15, 0.15), s - Vector2(0.3, 0.3), h), Color("c3ced3"))
			var cpt := Iso.S(g + Vector2(0.15, 0.15)) + Vector2(0, -h)
			draw_line(cpt, cpt + Vector2(5, 4), Color("e9eef0"))
			draw_line(cpt, cpt + Vector2(-1, 5), Color("e9eef0"))
			draw_line(cpt + Vector2(2, 2), cpt + Vector2(-1, 3), Color("e9eef0"))
		"shoes":
			B(g, s, h, Pal.WOOD)
			draw_line(Iso.S(g + Vector2(0, s.y)) + Vector2(0, -h * 0.5), Iso.S(g + s) + Vector2(0, -h * 0.5), Pal.WOOD_DARK)
			B(g + Vector2(0.15, 0.2), Vector2(0.22, 0.35), 2, Pal.SHOE, h)
			B(g + Vector2(0.45, 0.2), Vector2(0.22, 0.35), 2, Pal.SHOE, h)
		"mail":
			var cols := [Color("efe8da"), Color("dfe6ea"), Color("f0e2c8")]
			for k in 3:
				B(g + Vector2(k * 0.12, k * 0.06), Vector2(0.38, 0.26), 0.0, cols[k], k * 0.7)
			if Game.cycle == Game.CYCLE_DAWN:
				B(g + Vector2(0.3, 0.12), Vector2(0.28, 0.22), 0.0, Color("fff6d8"), 2.5)
		"laundry":
			B(g, s, h, Pal.WICKER)
			B(g + Vector2(0.1, 0.1), s - Vector2(0.2, 0.2), 2, Pal.HOODIE, h)
		"plant":
			B(g + Vector2(0.15, 0.15), s - Vector2(0.3, 0.3), 7, Pal.TERRACOTTA)
			var c := Iso.S(g + s * 0.5) + Vector2(0, -12)
			draw_circle(c + Vector2(-3, 0), 3.0, Pal.PLANT)
			draw_circle(c + Vector2(3, -1), 3.0, Pal.PLANT.lightened(0.12))
			draw_circle(c + Vector2(0, -4), 3.0, Pal.PLANT.darkened(0.1))
			draw_circle(c + Vector2(1, -8), 2.0, Pal.PLANT.lightened(0.2))
		"stairs":
			draw_colored_polygon(Iso.flat(g, s), Color("2a211c"))
			for k in 4:
				B(g + Vector2(0, k * s.y / 4.0), Vector2(s.x, s.y / 4.0), 2, Pal.TERRA_B.darkened(0.15 + k * 0.12), -k * 5.0)
			draw_line(Iso.S(g) + Vector2(0, -12), Iso.S(g + Vector2(0, s.y)) + Vector2(0, 8), Pal.WOOD_DARK)


func _legs(g: Vector2, s: Vector2, hh: float) -> void:
	for c in [Vector2(0.05, 0.05), Vector2(s.x - 0.15, 0.05), Vector2(0.05, s.y - 0.15), Vector2(s.x - 0.15, s.y - 0.15)]:
		B(g + c, Vector2(0.1, 0.1), hh, Pal.WOOD_DARK)


func _box(g: Vector2, s: Vector2, h: float) -> void:
	var fragile: bool = def.get("fragile", false)
	var open := fragile and Game.has("carton_open") and Game.cycle != Game.CYCLE_DARK
	B(g, s, h, Pal.CARDBOARD)
	var up := Vector2(0, -h)
	if open:
		draw_colored_polygon(Iso.flat(g + Vector2(0.08, 0.08), s - Vector2(0.16, 0.16), h), Pal.CARDBOARD.darkened(0.55))
		var a := Iso.S(g + Vector2(0, s.y)) + up
		var b := Iso.S(g + s) + up
		draw_colored_polygon(PackedVector2Array([a, b, b + Vector2(-2, 5), a + Vector2(-2, 5)]), Pal.CARDBOARD.lightened(0.1))
		draw_rect(Rect2(Iso.S(g + s * 0.5) + up + Vector2(-1, -1), Vector2(3, 2)), Pal.PAPER)
	else:
		draw_line(Iso.S(g + Vector2(0, s.y * 0.5)) + up, Iso.S(g + Vector2(s.x, s.y * 0.5)) + up, Pal.TAPE)
	var fl := Iso.S(g + Vector2(0, s.y))
	var fr := Iso.S(g + s)
	if fragile:
		for k in 2:
			var y := -h * 0.45 - k * 2.0
			draw_line(fl.lerp(fr, 0.2) + Vector2(0, y), fl.lerp(fr, 0.75) + Vector2(0, y), Pal.RED)
	else:
		draw_line(fl.lerp(fr, 0.25) + Vector2(0, -h * 0.5), fl.lerp(fr, 0.6) + Vector2(0, -h * 0.5), Color("3a2a1a"))


func _phone(g: Vector2, h: float) -> void:
	var buzzing := Game.cycle == 2 and not Game.has("clue_2")
	var jit := Vector2.ZERO
	if buzzing and fmod(t, 5.0) < 0.9:
		jit.x = float(randi_range(-1, 1))
	draw_set_transform(jit)
	var pg := g + Vector2(0.55, 0.35)
	B(pg, Vector2(0.22, 0.38), 1, Pal.PHONE, h)
	if buzzing and fmod(t, 5.0) < 0.9:
		draw_rect(Rect2(Iso.S(pg + Vector2(0.22, 0.38)) + Vector2(-1, -h), Vector2(2, 1)), Color("bfe0ff"))
	draw_set_transform(Vector2.ZERO)


func _fridge(g: Vector2, s: Vector2, h: float) -> void:
	B(g, s, h, Pal.FRIDGE)
	var dl := Iso.S(g + Vector2(0, s.y))
	var dr := Iso.S(g + s)
	draw_line(dl + Vector2(0, -h * 0.62), dr + Vector2(0, -h * 0.62), Pal.FRIDGE.darkened(0.35))
	var hp := dl.lerp(dr, 0.88)
	draw_line(hp + Vector2(0, -15), hp + Vector2(0, -20), Pal.FRIDGE.darkened(0.5))
	if Game.cycle == Game.CYCLE_DARK:
		draw_rect(Rect2(dl.lerp(dr, 0.35) + Vector2(0, -26), Vector2(2, 1)), Pal.RED)
		return
	# Le dessin de Lou, aimanté
	var q0 := dl.lerp(dr, 0.18) + Vector2(0, -16)
	var q1 := dl.lerp(dr, 0.58) + Vector2(0, -16)
	draw_colored_polygon(PackedVector2Array([q0, q1, q1 + Vector2(0, -10), q0 + Vector2(0, -10)]), Color("fbf8f0"))
	draw_rect(Rect2(q0 + Vector2(2, -5), Vector2(1, 3)), Color("3a5fa0"))
	draw_rect(Rect2(q0 + Vector2(4, -4), Vector2(3, 3)), Color("d0503c"))
	draw_rect(Rect2(q0 + Vector2(1, -2), Vector2(7, 1)), Color("3aa0c8"))
	draw_rect(Rect2(q0 + Vector2(5, -9), Vector2(1, 1)), Pal.RED)


func _counter(g: Vector2, s: Vector2, h: float) -> void:
	B(g, s, h - 1, Pal.CABINET)
	var fl := Iso.S(g + Vector2(0, s.y))
	var fr := Iso.S(g + s)
	for k in range(1, 4):
		var p := fl.lerp(fr, k / 4.0)
		draw_line(p + Vector2(0, -2), p + Vector2(0, -h + 3), Pal.CABINET.darkened(0.3))
	B(g, s, 1, Pal.COUNTER, h - 1)
	var sg := g + Vector2(0.4, 0.15)
	draw_colored_polygon(Iso.flat(sg, Vector2(0.8, 0.6), h), Color("5d6b73"))
	if Game.cycle != Game.CYCLE_DAWN:
		for k in 3:
			B(sg + Vector2(0.18, 0.12), Vector2(0.45, 0.36), 1, Pal.PLATE, h - 1 + k * 2.0)
	var mg := g + Vector2(2.1, 0.12)
	B(mg, Vector2(0.75, 0.6), 7, Pal.MICRO, h)
	var dp := Iso.S(mg + Vector2(0.45, 0.6)) + Vector2(0, -h - 4)
	if Game.cycle == Game.CYCLE_DAWN:
		draw_rect(Rect2(dp, Vector2(4, 1)), Color("7ee08a"))
	elif fmod(t, 1.0) < 0.6:
		draw_rect(Rect2(dp, Vector2(4, 1)), Color("ff4a3a"))
