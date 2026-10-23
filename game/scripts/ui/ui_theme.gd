class_name UITheme
extends RefCounted
## Shared look & small widget helpers for code-built UI.

const BG := Color(0.09, 0.11, 0.15, 0.97)
const ACCENT := Color("#ffb703")
const TEXT := Color("#f1f3f5")
const MUTED := Color("#adb5bd")
const GOOD := Color("#80ed99")
const BAD := Color("#ff8fa3")

static var _theme: Theme


static func theme() -> Theme:
	if _theme:
		return _theme
	var t := Theme.new()
	t.default_font_size = 16
	t.set_color("font_color", "Label", TEXT)
	t.set_stylebox("panel", "PanelContainer", box(BG, 14))
	t.set_stylebox("normal", "Button", box(Color("#2f3747"), 8, 10, 6))
	t.set_stylebox("hover", "Button", box(Color("#3f4a60"), 8, 10, 6))
	t.set_stylebox("pressed", "Button", box(ACCENT.darkened(0.2), 8, 10, 6))
	t.set_stylebox("disabled", "Button", box(Color("#22272f"), 8, 10, 6))
	t.set_stylebox("focus", "Button", box(Color(0, 0, 0, 0), 8, 10, 6))
	t.set_color("font_color", "Button", TEXT)
	t.set_color("font_hover_color", "Button", Color.WHITE)
	t.set_color("font_disabled_color", "Button", Color("#6c757d"))
	t.set_stylebox("panel", "TabContainer", box(Color(0.12, 0.14, 0.19, 1.0), 8, 12, 10))
	t.set_stylebox("tab_selected", "TabContainer", box(ACCENT, 6, 14, 6))
	t.set_stylebox("tab_unselected", "TabContainer", box(Color("#2f3747"), 6, 14, 6))
	t.set_stylebox("tab_hovered", "TabContainer", box(Color("#3f4a60"), 6, 14, 6))
	t.set_color("font_selected_color", "TabContainer", Color("#1b1b1b"))
	t.set_color("font_unselected_color", "TabContainer", TEXT)
	t.set_stylebox("normal", "LineEdit", box(Color("#2f3747"), 6, 8, 6))
	t.set_stylebox("focus", "LineEdit", box(Color("#3f4a60"), 6, 8, 6))
	t.set_color("font_color", "LineEdit", TEXT)
	_theme = t
	return t


static func box(c: Color, radius := 8, pad_h := 12, pad_v := 8) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = c
	s.set_corner_radius_all(radius)
	s.content_margin_left = pad_h
	s.content_margin_right = pad_h
	s.content_margin_top = pad_v
	s.content_margin_bottom = pad_v
	return s


static func label(text: String, size := 16, c := TEXT) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", c)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


static func button(text: String, cb: Callable, disabled := false, min_w := 0) -> Button:
	var b := Button.new()
	b.text = text
	b.disabled = disabled
	b.focus_mode = Control.FOCUS_NONE
	if min_w > 0:
		b.custom_minimum_size.x = min_w
	b.pressed.connect(cb)
	return b


static func hbox(parent: Node, sep := 8) -> HBoxContainer:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", sep)
	parent.add_child(h)
	return h


static func section(parent: Node, title: String) -> void:
	var l := label(title, 19, ACCENT)
	parent.add_child(l)
	var sep := HSeparator.new()
	parent.add_child(sep)


static func kv(parent: Node, k: String, v: String, vc := TEXT) -> void:
	var h := hbox(parent)
	var kl := label(k, 16, MUTED)
	kl.custom_minimum_size.x = 260
	h.add_child(kl)
	h.add_child(label(v, 16, vc))
