extends Node
## Autoload « Game » : l'état de la partie, les textes de l'histoire et les contrôles.

const LAST_CYCLE := 4      ## dernière boucle « normale »
const CYCLE_DARK := 5      ## la boucle noire, après la fausse fin
const CYCLE_DAWN := 6      ## après avoir ouvert la porte

var cycle := 1
var flags := {}
## Nombre de choix « tournés vers l'extérieur » (ouvrir, écouter, regarder…).
## Ça ne bloque rien : ça colore seulement la lumière et quelques répliques.
var openness := 0
## « kb », « pad » ou « touch » : pour adapter les aides à l'écran.
var input_mode := "kb"
var font: FontFile
var story := {}


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_setup_input()
	font = load("res://assets/fonts/Jersey10-Regular.ttf")
	font.antialiasing = TextServer.FONT_ANTIALIASING_NONE
	font.hinting = TextServer.HINTING_NONE
	font.subpixel_positioning = TextServer.SUBPIXEL_POSITIONING_DISABLED
	_load_story()


func reset() -> void:
	cycle = 1
	flags = {}
	openness = 0


func has(flag: String) -> bool:
	return flags.get(flag, false)


func set_flag(flag: String, value := true) -> void:
	flags[flag] = value


## Renvoie une séquence de dialogue (tableau de lignes) depuis story/dialogues.json.
func seq(id: String) -> Array:
	if story.has(id) and story[id] is Array:
		return story[id]
	push_warning("Séquence de dialogue introuvable : " + id)
	return [{"w": "d", "t": "[" + id + "]"}]


func _load_story() -> void:
	var path := "res://story/dialogues.json"
	var res = load(path)
	if res is JSON:
		story = res.data
	else:
		story = JSON.parse_string(FileAccess.get_file_as_string(path))


func _input(event: InputEvent) -> void:
	if event is InputEventKey:
		input_mode = "kb"
		if event.pressed and not event.echo and event.physical_keycode == KEY_F11:
			var full := DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if full else DisplayServer.WINDOW_MODE_FULLSCREEN)
	elif event is InputEventJoypadButton:
		input_mode = "pad"
	elif event is InputEventJoypadMotion and absf(event.axis_value) > 0.5:
		input_mode = "pad"
	elif event is InputEventScreenTouch:
		input_mode = "touch"


func _setup_input() -> void:
	# Touches physiques : ZQSD sur un clavier AZERTY = WASD sur un QWERTY.
	_bind("move_up", [KEY_W, KEY_UP], [JOY_BUTTON_DPAD_UP], JOY_AXIS_LEFT_Y, -1.0)
	_bind("move_down", [KEY_S, KEY_DOWN], [JOY_BUTTON_DPAD_DOWN], JOY_AXIS_LEFT_Y, 1.0)
	_bind("move_left", [KEY_A, KEY_LEFT], [JOY_BUTTON_DPAD_LEFT], JOY_AXIS_LEFT_X, -1.0)
	_bind("move_right", [KEY_D, KEY_RIGHT], [JOY_BUTTON_DPAD_RIGHT], JOY_AXIS_LEFT_X, 1.0)
	_bind("interact", [KEY_E, KEY_SPACE, KEY_ENTER, KEY_KP_ENTER], [JOY_BUTTON_A])


func _bind(action: String, keys: Array, buttons: Array, axis := -1, axis_dir := 0.0) -> void:
	if InputMap.has_action(action):
		InputMap.erase_action(action)
	InputMap.add_action(action, 0.35)
	for k in keys:
		var e := InputEventKey.new()
		e.physical_keycode = k
		InputMap.action_add_event(action, e)
	for b in buttons:
		var j := InputEventJoypadButton.new()
		j.button_index = b
		InputMap.action_add_event(action, j)
	if axis >= 0:
		var m := InputEventJoypadMotion.new()
		m.axis = axis
		m.axis_value = axis_dir
		InputMap.action_add_event(action, m)
