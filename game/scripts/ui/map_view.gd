class_name MapView
extends Control
## Top-down town map drawn from economic data (always in sync with the world).

var world: Node
const BOUNDS := Rect2(-130, -130, 370, 330)   # x, z, w, d in metres


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	custom_minimum_size = Vector2(840, 560)


func _to_map(p: Vector2) -> Vector2:
	var s: float = min(size.x / BOUNDS.size.x, size.y / BOUNDS.size.y)
	var off := (size - BOUNDS.size * s) / 2.0
	return off + (p - BOUNDS.position) * s


func _from_map(m: Vector2) -> Vector2:
	var s: float = min(size.x / BOUNDS.size.x, size.y / BOUNDS.size.y)
	var off := (size - BOUNDS.size * s) / 2.0
	return (m - off) / s + BOUNDS.position


func _process(_d: float) -> void:
	queue_redraw()


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var p := _from_map(event.position)
		world.set_waypoint(Vector3(p.x, 0, p.y), "Repère")


func _draw() -> void:
	var s: float = min(size.x / BOUNDS.size.x, size.y / BOUNDS.size.y)
	draw_rect(Rect2(_to_map(BOUNDS.position), BOUNDS.size * s), Color("#74c69d"))
	draw_rect(Rect2(_to_map(Vector2(-60, 160)), Vector2(140, 40) * s), Color("#4895ef"))
	for r in world.ROADS:
		var a := _to_map(Vector2(r[0], r[1]))
		var b := _to_map(Vector2(r[2], r[3]))
		draw_rect(Rect2(a, b - a), Color("#495057"))
	var font := ThemeDB.fallback_font
	for lid in Economy.lots:
		var lot: Dictionary = Economy.lots[lid]
		if lot.tenant_biz == "":
			var c := _to_map(Vector2(lot.pos[0], lot.pos[1]))
			draw_rect(Rect2(c - Vector2(6, 5) * s, Vector2(12, 10) * s), Color("#2a9d8f"))
	for id in Economy.businesses:
		var b: Business = Economy.businesses[id]
		var sz: Array = b.def().get("size", [12, 10])
		var c := _to_map(b.pos)
		var col := Color("#adb5bd") if b.is_ai() else Color(b.color)
		draw_rect(Rect2(c - Vector2(sz[0], sz[1]) * 0.5 * s, Vector2(sz[0], sz[1]) * s), col)
		draw_string(font, c + Vector2(-40, -sz[1] * 0.5 * s - 4), b.name, HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color.BLACK)
	var th: Array = GameData.layout.town_hall.pos
	draw_rect(Rect2(_to_map(Vector2(th[0], th[1])) - Vector2(7, 5) * s, Vector2(14, 10) * s), Color("#f8f9fa"))
	draw_string(font, _to_map(Vector2(th[0] - 8, th[1] + 9)), "Mairie (emplois)", HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color.BLACK)
	draw_string(font, _to_map(Vector2(-10, 168)), "Port", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color.WHITE)
	if world.waypoint_active:
		var w := _to_map(Vector2(world.waypoint.x, world.waypoint.z))
		draw_circle(w, 7, Color("#f15bb5"))
	var lx := 10.0
	for item in [[Color("#ffd60a"), "vous"], [Color("#adb5bd"), "IA"], [Color("#e07a5f"), "joueurs"], [Color("#2a9d8f"), "terrain libre"], [Color("#f15bb5"), "repère"]]:
		draw_rect(Rect2(Vector2(lx, size.y - 22), Vector2(14, 14)), item[0])
		draw_string(font, Vector2(lx + 18, size.y - 10), item[1], HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color.WHITE)
		lx += 110.0
	var pp: Vector3 = world.player.global_position
	var pm := _to_map(Vector2(pp.x, pp.z))
	draw_circle(pm, 7, Color("#ffd60a"))
	draw_circle(pm, 3, Color.BLACK)
