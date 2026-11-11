extends Node2D
## L'Autre : une silhouette qui a la forme de Noé. Elle disparaît quand on s'approche…
## sauf à la fin, devant la porte.

const Iso := preload("res://scripts/iso.gd")
const Sprites := preload("res://scripts/sprites.gd")

var g := Vector2.ZERO
var persist := false        ## true = ne s'enfuit pas, bloque le passage
var blocks := false
var vanishing := false
var alpha := 1.0
var t := 0.0


func grid_rect() -> Rect2:
	return Rect2(g - Vector2(0.2, 0.2), Vector2(0.4, 0.4))


func screen_span() -> Vector2:
	var x := Iso.S(g).x
	return Vector2(x - 7, x + 7)


func screen_bbox() -> Rect2:
	var p := Iso.S(g)
	return Rect2(p + Vector2(-8, -26), Vector2(16, 28))


func vanish() -> void:
	if vanishing:
		return
	vanishing = true
	blocks = false
	var tw := create_tween()
	tw.tween_property(self, "alpha", 0.0, 0.5)
	tw.tween_callback(queue_free)


func _process(delta: float) -> void:
	t += delta
	position = Iso.S(g).round()
	queue_redraw()


func _draw() -> void:
	# De temps en temps, il « saute » d'un pixel.
	var glitch := Vector2(1, 0) if fmod(t, 2.3) < 0.06 else Vector2.ZERO
	draw_set_transform(glitch)
	Sprites.draw_noe(self, false, true, 0, Sprites.SHADOW_PAL, alpha)
	draw_set_transform(Vector2.ZERO)
