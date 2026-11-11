extends RefCounted
## Projection isométrique : tuiles de 32×16 pixels.
## Coordonnées « grille » (g) : x va vers le bas-droite de l'écran, y vers le bas-gauche.

const TW := 32.0
const TH := 16.0
const WALL_H := 56.0


## Grille -> écran.
static func S(g: Vector2) -> Vector2:
	return Vector2((g.x - g.y) * TW * 0.5, (g.x + g.y) * TH * 0.5)


## Écran -> grille.
static func G(s: Vector2) -> Vector2:
	var a := s.x / (TW * 0.5)
	var b := s.y / (TH * 0.5)
	return Vector2((a + b) * 0.5, (b - a) * 0.5)


## Dessine un pavé : position g et taille s en tuiles, hauteur h en pixels, posé à z pixels du sol.
static func box(ci: CanvasItem, g: Vector2, s: Vector2, h: float, top: Color, left: Color, right: Color, z := 0.0, outline := Color(0, 0, 0, 0)) -> void:
	var up := Vector2(0, -z)
	var a := S(g) + up
	var b := S(g + Vector2(s.x, 0)) + up
	var c := S(g + s) + up
	var d := S(g + Vector2(0, s.y)) + up
	var hh := Vector2(0, -h)
	if h > 0.0:
		ci.draw_colored_polygon(PackedVector2Array([d, c, c + hh, d + hh]), left)
		ci.draw_colored_polygon(PackedVector2Array([b, c, c + hh, b + hh]), right)
	ci.draw_colored_polygon(PackedVector2Array([a + hh, b + hh, c + hh, d + hh]), top)
	if outline.a > 0.0:
		ci.draw_polyline(PackedVector2Array([a + hh, b + hh, c + hh, d + hh, a + hh]), outline)
		if h > 0.0:
			ci.draw_polyline(PackedVector2Array([d + hh, d, c, b, b + hh]), outline)
			ci.draw_line(c, c + hh, outline)


## Losange plat au sol (ou à hauteur z).
static func flat(g: Vector2, s: Vector2, z := 0.0) -> PackedVector2Array:
	var up := Vector2(0, -z)
	return PackedVector2Array([S(g) + up, S(g + Vector2(s.x, 0)) + up, S(g + s) + up, S(g + Vector2(0, s.y)) + up])
