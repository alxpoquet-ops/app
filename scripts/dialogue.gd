extends Control
## Boîte de dialogue : texte qui s'écrit lettre à lettre, voix de la narratrice, choix.
## Les séquences viennent de story/dialogues.json.

signal advanced
signal typed
signal choice_made(index: int)
signal fx(name: String)

const VIEW := Vector2(384, 216)

## Styles par « personne qui parle » :
## d = description, noe = pensées de Noé, narr = la voix douce,
## voice = voix au téléphone (même couleur que la narratrice : c'est voulu), echo = la petite voix qui ment.
const STYLES := {
	"d": {"pos": "box", "color": Color("e8e2d6"), "speed": 55.0},
	"noe": {"pos": "box", "color": Color("ffffff"), "name": "Noé", "name_color": Color("9fc3dc"), "speed": 48.0},
	"narr": {"pos": "center", "color": Color("f3d3c9"), "speed": 26.0},
	"voice": {"pos": "center", "color": Color("f3d3c9"), "speed": 30.0},
	"echo": {"pos": "center", "color": Color("c0484e"), "speed": 16.0},
	"sys": {"pos": "center", "color": Color("e8e2d6"), "speed": 60.0},
}

var active := false
## Mode test automatique : les répliques défilent seules, les choix sont lus dans auto_choices.
var auto := false
var auto_choices: Array = []
var _typing := false
var _shown := 0.0
var _speed := 40.0
var _label: Label
var _choosing := false
var _choice_idx := 0
var _options: Array = []
var _choice_labels: Array = []
var _guard := 0.0
var _nav_cool := 0.0
var _t := 0.0

var box: Panel
var name_lbl: Label
var text_lbl: Label
var center_lbl: Label
var more: Label
var choice_panel: PanelContainer
var choice_list: VBoxContainer


func _ready() -> void:
	size = VIEW
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	box = Panel.new()
	box.add_theme_stylebox_override("panel", _style())
	box.position = Vector2(8, 150)
	box.size = Vector2(368, 60)
	box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(box)
	name_lbl = Label.new()
	name_lbl.position = Vector2(14, 133)
	name_lbl.add_theme_color_override("font_outline_color", Color(0.02, 0.02, 0.04, 1))
	name_lbl.add_theme_constant_override("outline_size", 4)
	add_child(name_lbl)
	text_lbl = Label.new()
	text_lbl.position = Vector2(7, 1)
	text_lbl.size = Vector2(354, 58)
	text_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(text_lbl)
	more = Label.new()
	more.text = ">"
	more.position = Vector2(358, 42)
	more.add_theme_color_override("font_color", Color("c9b9a0"))
	box.add_child(more)
	center_lbl = Label.new()
	center_lbl.position = Vector2(20, 6)
	center_lbl.size = Vector2(344, 66)
	center_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	center_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	center_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	center_lbl.add_theme_color_override("font_outline_color", Color(0.02, 0.02, 0.04, 0.9))
	center_lbl.add_theme_constant_override("outline_size", 4)
	add_child(center_lbl)
	choice_panel = PanelContainer.new()
	choice_panel.add_theme_stylebox_override("panel", _style())
	add_child(choice_panel)
	choice_list = VBoxContainer.new()
	choice_list.add_theme_constant_override("separation", -5)
	choice_panel.add_child(choice_list)
	hide_all()


func _style() -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.035, 0.03, 0.055, 0.93)
	sb.border_color = Color("c9b9a0")
	sb.set_border_width_all(1)
	sb.set_content_margin_all(5)
	sb.content_margin_top = 3
	sb.content_margin_bottom = 4
	return sb


func hide_all() -> void:
	box.hide()
	name_lbl.hide()
	center_lbl.hide()
	choice_panel.hide()


## Joue une séquence. Renvoie l'indice du dernier choix fait (ou -1).
func play(seq_id: String) -> int:
	var seq: Array = Game.seq(seq_id)
	active = true
	mouse_filter = Control.MOUSE_FILTER_STOP
	var choice := -1
	for i in seq.size():
		var line: Dictionary = seq[i]
		if line.has("choice"):
			choice = await _ask(line.choice)
		elif line.has("fx"):
			fx.emit(str(line.fx))
		elif line.has("wait"):
			hide_all()
			await get_tree().create_timer(float(line.wait)).timeout
		else:
			var next_is_choice: bool = i + 1 < seq.size() and seq[i + 1].has("choice")
			await _say(str(line.get("w", "d")), str(line.get("t", "")), next_is_choice)
	hide_all()
	active = false
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	return choice


func _say(who: String, text: String, until_typed := false) -> void:
	if auto:
		print("    [", who, "] ", text)
		await get_tree().process_frame
		return
	var st: Dictionary = STYLES.get(who, STYLES["d"])
	box.visible = st.pos == "box"
	name_lbl.visible = false
	center_lbl.visible = st.pos == "center"
	if st.pos == "box":
		_label = text_lbl
		var nm: String = st.get("name", "")
		name_lbl.visible = nm != ""
		name_lbl.text = nm
		name_lbl.add_theme_color_override("font_color", st.get("name_color", Color.WHITE))
	else:
		_label = center_lbl
	_label.text = text
	_label.visible_characters = 0
	_label.add_theme_color_override("font_color", st.color)
	_speed = st.speed
	_shown = 0.0
	_typing = true
	_guard = 0.15
	if until_typed:
		await typed
	else:
		await advanced


func _finish_typing() -> void:
	_typing = false
	_label.visible_characters = -1
	typed.emit()


func _process(delta: float) -> void:
	_t += delta
	_guard = maxf(_guard - delta, 0.0)
	_nav_cool = maxf(_nav_cool - delta, 0.0)
	if _typing and _label:
		_shown += delta * _speed
		var total := _label.text.length()
		_label.visible_characters = int(_shown)
		if int(_shown) >= total:
			_finish_typing()
	more.visible = active and not _typing and not _choosing and fmod(_t, 0.8) < 0.5


func _input(event: InputEvent) -> void:
	if not active:
		return
	if _choosing:
		if _nav_cool <= 0.0 and event.is_action_pressed("move_up"):
			_choice_idx = posmod(_choice_idx - 1, _options.size())
			_refresh_choices()
			_nav_cool = 0.18
			get_viewport().set_input_as_handled()
		elif _nav_cool <= 0.0 and event.is_action_pressed("move_down"):
			_choice_idx = posmod(_choice_idx + 1, _options.size())
			_refresh_choices()
			_nav_cool = 0.18
			get_viewport().set_input_as_handled()
		elif event.is_action_pressed("interact") and not event.is_echo():
			get_viewport().set_input_as_handled()
			_pick(_choice_idx)
		return
	var pressed := event.is_action_pressed("interact") and not event.is_echo()
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		pressed = true
	if not pressed:
		return
	get_viewport().set_input_as_handled()
	if _guard > 0.0:
		return
	if _typing:
		_finish_typing()
		_guard = 0.08
	else:
		advanced.emit()


func _ask(opts: Array) -> int:
	if auto:
		var a: int = auto_choices.pop_front() if not auto_choices.is_empty() else 0
		print("    -> choix : ", opts[a])
		return a
	for c in choice_list.get_children():
		c.queue_free()
	_options = opts
	_choice_labels.clear()
	for i in opts.size():
		var l := Label.new()
		l.mouse_filter = Control.MOUSE_FILTER_STOP
		l.gui_input.connect(func(ev: InputEvent):
			if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
				_pick(i))
		l.mouse_entered.connect(func():
			_choice_idx = i
			_refresh_choices())
		choice_list.add_child(l)
		_choice_labels.append(l)
	_choice_idx = 0
	_refresh_choices()
	choice_panel.show()
	choice_panel.reset_size()
	await get_tree().process_frame
	var sz := choice_panel.get_combined_minimum_size()
	choice_panel.size = sz
	var bottom := 146.0 if box.visible else 140.0
	choice_panel.position = Vector2(VIEW.x - sz.x - 10, bottom - sz.y)
	_choosing = true
	_guard = 0.25
	var idx: int = await choice_made
	_choosing = false
	choice_panel.hide()
	return idx


func _pick(i: int) -> void:
	if _choosing and _guard <= 0.0:
		choice_made.emit(i)


func _refresh_choices() -> void:
	for i in _choice_labels.size():
		var l: Label = _choice_labels[i]
		var sel := i == _choice_idx
		l.text = ("> " if sel else "  ") + str(_options[i])
		l.add_theme_color_override("font_color", Color("ffe3a8") if sel else Color("a89f94"))
