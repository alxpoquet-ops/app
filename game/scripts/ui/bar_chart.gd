class_name BarChart
extends Control
## Minimal bar/line chart for the dashboard.

var series: Array = []      # [{name, color, values: Array[float]}]
var labels: Array = []
var title := ""
var percent := false


func _ready() -> void:
	custom_minimum_size = Vector2(440, 200)


func _draw() -> void:
	var font := ThemeDB.fallback_font
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.12, 0.14, 0.19))
	draw_string(font, Vector2(8, 18), title, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color("#ffb703"))
	if series.is_empty() or labels.is_empty():
		draw_string(font, Vector2(8, 50), "Pas encore de données (attendez la fin du 1er jour).", HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color("#adb5bd"))
		return
	var lo := 0.0
	var hi := 1.0 if percent else 10.0
	for s in series:
		for v in s.values:
			lo = min(lo, float(v))
			hi = max(hi, float(v))
	var top := 30.0
	var bottom := size.y - 22.0
	var h := bottom - top
	var y0 := bottom - (0.0 - lo) / (hi - lo) * h
	draw_line(Vector2(30, y0), Vector2(size.x - 6, y0), Color(1, 1, 1, 0.3))
	var n := labels.size()
	var slot := (size.x - 40.0) / n
	var bw := slot / (series.size() + 1)
	for i in n:
		for si in series.size():
			var v := float(series[si].values[i])
			var y := bottom - (v - lo) / (hi - lo) * h
			var x := 34.0 + i * slot + si * bw
			draw_rect(Rect2(Vector2(x, min(y, y0)), Vector2(bw - 1, abs(y - y0))), series[si].color)
		draw_string(font, Vector2(34.0 + i * slot, size.y - 6), str(labels[i]), HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("#adb5bd"))
	var lx := size.x - 10.0
	for si in range(series.size() - 1, -1, -1):
		var w := font.get_string_size(series[si].name, HORIZONTAL_ALIGNMENT_LEFT, -1, 12).x
		lx -= w + 24
		draw_rect(Rect2(Vector2(lx, 8), Vector2(12, 12)), series[si].color)
		draw_string(font, Vector2(lx + 16, 19), series[si].name, HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color.WHITE)
	var top_txt := ("%d%%" % int(hi * 100)) if percent else Hotel.money(hi)
	draw_string(font, Vector2(4, top + 10), top_txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color("#adb5bd"))
