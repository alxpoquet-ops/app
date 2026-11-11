extends Node2D
## Noé. Se déplace au clavier, à la manette, ou en touchant l'écran (le doigt, la souris).

const Iso := preload("res://scripts/iso.gd")
const Sprites := preload("res://scripts/sprites.gd")

const SPEED := 2.0          ## tuiles par seconde
const RADIUS := 0.2

var room
var g := Vector2(2, 2)
var target = null           ## destination (Vector2, en tuiles) quand on touche l'écran
var can_move := true
var has_lantern := false
var facing_back := false
var flip := false
var walk_t := 0.0
var _stuck_t := 0.0


func grid_rect() -> Rect2:
	return Rect2(g - Vector2(RADIUS, RADIUS), Vector2(RADIUS * 2, RADIUS * 2))


func screen_span() -> Vector2:
	var x := Iso.S(g).x
	return Vector2(x - 9, x + 9)


func lantern_offset() -> Vector2:
	return Vector2(-8 if flip else 7, -9)


func _physics_process(delta: float) -> void:
	if room == null:
		return
	var v := Vector2.ZERO
	var input := Input.get_vector("move_left", "move_right", "move_up", "move_down") if can_move else Vector2.ZERO
	if input.length() > 0.1:
		target = null
		# Vitesse à l'écran : deux fois moins vite en vertical, comme les axes isométriques.
		v = Iso.G(input * Vector2(46, 23))
	elif target != null and can_move:
		var to: Vector2 = target - g
		if to.length() < 0.08:
			target = null
		else:
			v = to.normalized() * SPEED
	var moving := v.length() > 0.01
	if moving:
		var before := g
		_try_move(Vector2(v.x * delta, 0))
		_try_move(Vector2(0, v.y * delta))
		var sv := Iso.S(v)
		if absf(sv.y) > 0.5:
			facing_back = sv.y < 0
		if absf(sv.x) > 0.5:
			flip = sv.x < 0
		walk_t += delta
		# Bloqué contre un meuble en allant vers un point touché : on abandonne.
		if target != null and before.distance_to(g) < 0.002:
			_stuck_t += delta
			if _stuck_t > 0.25:
				target = null
		else:
			_stuck_t = 0.0
	else:
		walk_t = 0.0
	position = Iso.S(g).round()
	queue_redraw()


func _try_move(step: Vector2) -> void:
	var ng := g + step
	if not room.blocked(ng, RADIUS):
		g = ng


func _draw() -> void:
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(1, 0.5))
	draw_circle(Vector2(0, 0), 6.0, Color(0, 0, 0, 0.28))
	draw_set_transform(Vector2.ZERO)
	var frame := 1 if walk_t > 0.0 and int(walk_t * 7.0) % 2 == 1 else 0
	var lantern_behind := facing_back
	if has_lantern and lantern_behind:
		_draw_lantern()
	Sprites.draw_noe(self, facing_back, flip, frame)
	if has_lantern and not lantern_behind:
		_draw_lantern()


func _draw_lantern() -> void:
	var off := lantern_offset()
	var main = get_tree().current_scene
	var lit: bool = not (main != null and main.get("lantern_dead"))
	Sprites.draw(self, Sprites.LANTERN if lit else Sprites.LANTERN_OFF, off + Vector2(-2, -1))
