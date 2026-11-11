extends RefCounted
## Pixel art « écrit en code » : chaque caractère est un pixel, « . » est transparent.
## Provisoire : ces sprites seront remplacés par de vraies planches (Aseprite).

const PAL := {
	"h": Color("3d261a"), "H": Color("5e3d29"),            # cheveux bruns
	"s": Color("eab89a"), "S": Color("c98d72"),            # peau
	"g": Color("1d1b24"), "L": Color("9fc3dc"),            # lunettes
	"M": Color("a8665a"),                                  # bouche
	"c": Color("4f6385"), "C": Color("3a4a66"),            # sweat
	"w": Color("d8d8e0"),                                  # cordons
	"p": Color("2e2f3d"), "b": Color("1b1b22"),            # pantalon, chaussures
	"k": Color("2a2a30"), "y": Color("ffd98a"), "Y": Color("fff3c4"), "o": Color("8a6a3a"),
}

## L'Autre : la même silhouette, toute noire, sauf l'éclat des lunettes.
const SHADOW_PAL := {"*": Color("06060a"), "L": Color("6d8098")}

## Noé, de face (12×18, sans les jambes).
const NOE_FRONT := [
	"....hhhh....",
	"..hhhhhhhh..",
	".hhhHHHhhhh.",
	".hhhhhhhhhh.",
	".hhsshhsshh.",
	".hssssssssh.",
	".sgLLggLLgs.",
	".sssssSssss.",
	"..ssssssss..",
	"...ssMMss...",
	"....SSSS....",
	"..cccccccc..",
	".ccccwwcccc.",
	".cCccwwccCc.",
	".cCccccccCc.",
	".sCccccccCs.",
	"..CCCCCCCC..",
	"..pppppppp..",
]

## Noé, de dos.
const NOE_BACK := [
	"....hhhh....",
	"..hhhhhhhh..",
	".hhhHHHhhhh.",
	".hhhhhhhhhh.",
	".hhhhhhhhhh.",
	".hhhhhhhhhh.",
	".shhhhhhhhs.",
	"..hhhhhhhh..",
	"..hhhhhhhh..",
	"...ssssss...",
	"....SSSS....",
	"..cccccccc..",
	".cccCCCCccc.",
	".cCccCCccCc.",
	".cCccccccCc.",
	".sCccccccCs.",
	"..CCCCCCCC..",
	"..pppppppp..",
]

const LEGS_IDLE := [
	"..ppp..ppp..",
	"..ppp..ppp..",
	"..ppp..ppp..",
	"..bbb..bbb..",
]

const LEGS_WALK := [
	"..ppp..ppp..",
	".ppp....ppp.",
	".ppp....ppp.",
	".bbb....bbb.",
]

const LANTERN := [
	"..k..",
	".kkk.",
	"kyYyk",
	"kyYyk",
	"kyyyk",
	".kkk.",
]

const LANTERN_OFF := [
	"..k..",
	".kkk.",
	"k.o.k",
	"k...k",
	"k...k",
	".kkk.",
]


## Dessine une image « texte ». flip = miroir horizontal.
## Si pal contient « * », toutes les couleurs non listées prennent cette couleur.
static func draw(ci: CanvasItem, rows: Array, origin: Vector2, flip := false, pal: Dictionary = PAL, alpha := 1.0) -> void:
	for y in rows.size():
		var row: String = rows[y]
		var n := row.length()
		var x := 0
		while x < n:
			var ch := row[x]
			if ch == ".":
				x += 1
				continue
			var run := 1
			while x + run < n and row[x + run] == ch:
				run += 1
			var col: Color = pal.get(ch, pal.get("*", Color.MAGENTA))
			col.a *= alpha
			var px := (n - x - run) if flip else x
			ci.draw_rect(Rect2(origin.x + px, origin.y + y, run, 1), col)
			x += run


## Noé (ou son ombre) complet, pieds en (0, 0).
static func draw_noe(ci: CanvasItem, back: bool, flip: bool, walk_frame: int, pal: Dictionary = PAL, alpha := 1.0) -> void:
	var bob := 1.0 if walk_frame == 1 else 0.0
	var body: Array = NOE_BACK if back else NOE_FRONT
	draw(ci, body, Vector2(-6, -22 - bob), flip, pal, alpha)
	draw(ci, LEGS_WALK if walk_frame == 1 else LEGS_IDLE, Vector2(-6, -4), flip, pal, alpha)
