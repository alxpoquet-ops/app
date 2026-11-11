extends Node
## Scène principale : construit le monde, la lumière, l'interface, et relie le tout.
## La logique de l'histoire est dans director.gd, les textes dans story/dialogues.json.

const Iso := preload("res://scripts/iso.gd")
const Rooms := preload("res://scripts/rooms.gd")
const RoomScript := preload("res://scripts/room.gd")
const PlayerScript := preload("res://scripts/player.gd")
const ShadowScript := preload("res://scripts/shadow.gd")
const DialogueScript := preload("res://scripts/dialogue.gd")
const DirectorScript := preload("res://scripts/director.gd")
const AmbienceScript := preload("res://scripts/ambience.gd")
const DarkShader := preload("res://shaders/darkness.gdshader")

const VIEW := Vector2(384, 216)

## L'humeur de chaque boucle : teinte du monde, obscurité, portée de la lanterne, son.
const MOODS := {
	1: {"tint": Color("6a76a0"), "dark": 0.94, "radius": 60.0, "col": Color("030409"), "audio": "c1", "flicker": 0.15},
	2: {"tint": Color("767aa6"), "dark": 0.91, "radius": 66.0, "col": Color("05040b"), "audio": "c2", "flicker": 0.2},
	3: {"tint": Color("7a8f86"), "dark": 0.89, "radius": 70.0, "col": Color("030705"), "audio": "c3", "flicker": 0.4},
	4: {"tint": Color("ad9fc2"), "dark": 0.78, "radius": 86.0, "col": Color("0e0915"), "audio": "c4", "flicker": 0.1},
	5: {"tint": Color("5a6488"), "dark": 0.96, "radius": 50.0, "col": Color("020206"), "audio": "dark", "flicker": 0.6},
	6: {"tint": Color("ffffff"), "dark": 0.0, "radius": 0.0, "col": Color("1a100c"), "audio": "dawn", "flicker": 0.0},
}

signal any_pressed

var world: Node2D
var room
var room_id := ""
var player
var shadow = null
var dark_mat: ShaderMaterial
var fx_layer: Control
var ui: Control
var dlg
var prompt: Label
var fade: ColorRect
var audio
var director

var busy := false
var overlay_open := false
var lantern_dead := false
var target_id := ""
var tap_id := ""
var cooldown := 0.0

var lantern_r := 18.0
var lantern_r_target := 18.0
var darkness := 0.94
var darkness_target := 0.94
var dark_speed := 0.6
var door_light := 7.0
var door_light_target := 7.0
var door_speed := 30.0
var flicker := 0.0
var whisper_t := 14.0
var shake_t := 0.0
var shake_amp := 0.0
var t := 0.0


func _ready() -> void:
	world = Node2D.new()
	add_child(world)

	var dark_layer := CanvasLayer.new()
	dark_layer.layer = 1
	add_child(dark_layer)
	var dark_rect := ColorRect.new()
	dark_rect.size = VIEW
	dark_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	dark_mat = ShaderMaterial.new()
	dark_mat.shader = DarkShader
	dark_mat.set_shader_parameter("screen_size", VIEW)
	dark_rect.material = dark_mat
	dark_layer.add_child(dark_rect)
	fx_layer = Control.new()
	fx_layer.size = VIEW
	fx_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	dark_layer.add_child(fx_layer)

	var ui_layer := CanvasLayer.new()
	ui_layer.layer = 2
	add_child(ui_layer)
	ui = Control.new()
	ui.size = VIEW
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.theme = _make_theme()
	ui_layer.add_child(ui)
	prompt = Label.new()
	prompt.position = Vector2(8, 193)
	prompt.mouse_filter = Control.MOUSE_FILTER_STOP
	prompt.add_theme_color_override("font_color", Color("e8dcc4"))
	prompt.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.9))
	prompt.add_theme_constant_override("outline_size", 4)
	prompt.gui_input.connect(_on_prompt_input)
	ui.add_child(prompt)
	dlg = DialogueScript.new()
	ui.add_child(dlg)
	dlg.fx.connect(_on_fx)
	fade = ColorRect.new()
	fade.size = VIEW
	fade.color = Color(0, 0, 0, 1)
	fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(fade)

	audio = AmbienceScript.new()
	add_child(audio)
	player = PlayerScript.new()
	director = DirectorScript.new()
	director.main = self
	director.dlg = dlg
	add_child(director)

	var args := _parse_args()
	if args.has("autoplay"):
		Engine.time_scale = 12.0
		await run(director.autoplay)
		await wait(2.0)
		if args.has("shot"):
			get_viewport().get_texture().get_image().save_png(str(args.shot))
		get_tree().quit()
	elif args.has("cycle") or args.has("room"):
		_debug_start(args)
	else:
		_show_title()


func _make_theme() -> Theme:
	var th := Theme.new()
	th.default_font = Game.font
	th.default_font_size = 19          # Jersey 10 : 1 pixel de police = 1 pixel d'écran à 19
	th.set_constant("line_spacing", "Label", -6)
	return th


# --- Pièces --------------------------------------------------------------------

func load_room_now(id: String, from := "", spawn = null) -> void:
	if room:
		if player.get_parent():
			player.get_parent().remove_child(player)
		room.queue_free()
	room_id = id
	room = RoomScript.new()
	room.setup(Rooms.build(id))
	world.add_child(room)
	room.entities.add_child(player)
	player.room = room
	player.g = spawn if spawn != null else room.spawn_from(from)
	player.target = null
	player.position = Iso.S(player.g).round()
	tap_id = ""
	_setup_shadow()


func rebuild_room() -> void:
	load_room_now(room_id, "", player.g)


func change_room(to: String, from := "", spawn = null) -> void:
	await fade_to(1.0, 0.3)
	load_room_now(to, from, spawn)
	await fade_to(0.0, 0.3)
	await director.on_enter(to)


func _setup_shadow() -> void:
	shadow = null
	var conf: Dictionary = director.shadow_for(room_id)
	if conf.is_empty():
		return
	shadow = ShadowScript.new()
	shadow.g = conf.g
	shadow.persist = conf.get("persist", false)
	shadow.blocks = shadow.persist
	room.entities.add_child(shadow)
	room.extra_blockers = [shadow]


# --- Humeur et lumière -----------------------------------------------------------

func apply_mood(instant := false) -> void:
	var c := Game.cycle
	var m: Dictionary = MOODS.get(c, MOODS[1])
	var tint: Color = m.tint
	var dark: float = m.dark
	if c == 4:
		tint = tint.lerp(Color.WHITE, Game.openness * 0.04)
		dark -= Game.openness * 0.02 + (0.1 if Game.has("window_ripped") else 0.0)
	lantern_r_target = m.radius if player.has_lantern else 18.0
	darkness_target = dark
	door_light_target = 7.0
	flicker = m.flicker
	dark_mat.set_shader_parameter("dark_color", m.col)
	if instant:
		world.modulate = tint
		darkness = dark
		lantern_r = lantern_r_target
	else:
		create_tween().tween_property(world, "modulate", tint, 1.5)
	audio.set_mood(m.audio)


func kill_lantern() -> void:
	lantern_dead = true
	lantern_r = 0.0
	lantern_r_target = 0.0
	darkness = 1.0
	darkness_target = 1.0
	door_light = 0.0
	door_light_target = 0.0
	audio.set_mood("silence")
	player.queue_redraw()


func open_front_door() -> void:
	audio.sfx("creak")
	Game.set_flag("door_open")
	Game.cycle = Game.CYCLE_DAWN
	lantern_dead = false
	player.has_lantern = false
	load_room_now("entree", "", player.g)
	dark_mat.set_shader_parameter("dark_color", MOODS[6].col)
	door_speed = 140.0
	door_light_target = 420.0
	dark_speed = 0.28
	darkness_target = 0.0
	lantern_r_target = 0.0
	flicker = 0.0
	create_tween().tween_property(world, "modulate", Color.WHITE, 4.0)
	audio.set_mood("dawn")
	await wait(4.0)
	door_speed = 30.0
	dark_speed = 0.6


func _update_light(delta: float) -> void:
	lantern_r = lerpf(lantern_r, lantern_r_target, 1.0 - exp(-delta * 2.5))
	darkness = move_toward(darkness, darkness_target, delta * dark_speed)
	door_light = move_toward(door_light, door_light_target, delta * door_speed)
	var fl := 1.0 + sin(t * 11.0) * 0.02 + sin(t * 23.7) * 0.012
	if flicker > 0.0:
		fl *= 1.0 - flicker * randf() * 0.25
		if randf() < flicker * 0.04:
			fl *= 0.45
	var lp := Vector2(-999, -999)
	var r := 0.0
	var floor_lantern = room.find_prop("lantern")
	if lantern_dead:
		pass
	elif player.has_lantern:
		lp = room.global_position + player.position + player.lantern_offset()
		r = lantern_r * fl
	elif floor_lantern != null:
		lp = room.global_position + Iso.S(floor_lantern.def.g + floor_lantern.def.s * 0.5) + Vector2(0, -4)
		r = 46.0 * fl
	else:
		lp = room.global_position + player.position + Vector2(0, -8)
		r = lantern_r
	dark_mat.set_shader_parameter("light_pos", lp)
	dark_mat.set_shader_parameter("light_radius", r)
	dark_mat.set_shader_parameter("darkness", darkness)
	var base = room.front_door_base()
	if base != null:
		dark_mat.set_shader_parameter("door_pos", room.global_position + base)
		dark_mat.set_shader_parameter("door_radius", door_light)
	else:
		dark_mat.set_shader_parameter("door_radius", 0.0)


# --- Boucle principale ----------------------------------------------------------

func _process(delta: float) -> void:
	t += delta
	if room == null:
		return
	_update_light(delta)
	_update_shake(delta)
	var can_act: bool = not busy and not dlg.active and not overlay_open
	player.can_move = can_act
	if not can_act:
		cooldown = 0.2
	else:
		cooldown = maxf(cooldown - delta, 0.0)
	_update_prompt()
	_update_whispers(delta)
	director.tick(delta)
	if can_act and cooldown <= 0.0:
		if Input.is_action_just_pressed("interact") and target_id != "":
			_do_interact(target_id)
		elif tap_id != "":
			if _in_reach(tap_id):
				var id := tap_id
				tap_id = ""
				player.target = null
				_do_interact(id)
			elif player.target == null:
				tap_id = ""


func _do_interact(id: String) -> void:
	busy = true
	prompt.hide()
	await director.interact(id)
	busy = false


## Joue une séquence de dialogue en dehors d'une interaction (événements).
func run_seq(id: String) -> void:
	if busy:
		return
	busy = true
	await dlg.play(id)
	busy = false


func run(callable: Callable) -> void:
	busy = true
	await callable.call()
	busy = false


func _interactables() -> Array:
	var list: Array = room.interactables()
	if shadow != null and is_instance_valid(shadow) and shadow.persist and not shadow.vanishing:
		list.append({"id": "shadow", "label": "???", "rect": shadow.grid_rect(), "reach": 0.9, "bbox": shadow.screen_bbox()})
	return list


func _dist(it: Dictionary) -> float:
	if it.has("rect"):
		var r: Rect2 = it.rect
		var c := Vector2(clampf(player.g.x, r.position.x, r.end.x), clampf(player.g.y, r.position.y, r.end.y))
		return player.g.distance_to(c)
	return player.g.distance_to(it.pt)


func _in_reach(id: String) -> bool:
	for it in _interactables():
		if it.id == id and _dist(it) < it.reach:
			return true
	return false


func _update_prompt() -> void:
	target_id = ""
	if not player.can_move:
		prompt.hide()
		return
	var best := 99.0
	var label := ""
	for it in _interactables():
		var d := _dist(it)
		if d < it.reach and d < best:
			best = d
			target_id = it.id
			label = it.label
	if target_id == "":
		prompt.hide()
		return
	var key := "[E] "
	if Game.input_mode == "pad":
		key = "(A) "
	elif Game.input_mode == "touch":
		key = "Toucher : "
	prompt.text = key + label
	prompt.show()


func _on_prompt_input(ev: InputEvent) -> void:
	if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
		if target_id != "" and player.can_move and cooldown <= 0.0:
			_do_interact(target_id)


## Toucher l'écran ou cliquer : Noé marche jusque-là (et interagit si on a touché un objet).
func _unhandled_input(event: InputEvent) -> void:
	if room == null or not player.can_move:
		return
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	var p: Vector2 = room.get_local_mouse_position()
	var hit = null
	var best_area := INF
	for it in _interactables():
		var bb: Rect2 = it.bbox
		if bb.has_point(p) and bb.get_area() < best_area:
			best_area = bb.get_area()
			hit = it
	var dest: Vector2
	if hit != null:
		tap_id = hit.id
		if hit.has("rect"):
			var r: Rect2 = hit.rect.grow(0.4)
			dest = Vector2(clampf(player.g.x, r.position.x, r.end.x), clampf(player.g.y, r.position.y, r.end.y))
		else:
			dest = hit.pt
	else:
		tap_id = ""
		dest = Iso.G(p)
	dest.x = clampf(dest.x, 0.25, room.w - 0.25)
	dest.y = clampf(dest.y, 0.25, room.h - 0.25)
	player.target = dest


func _input(event: InputEvent) -> void:
	var pressed := false
	if event is InputEventKey and event.pressed and not event.echo:
		pressed = true
	elif event is InputEventMouseButton and event.pressed:
		pressed = true
	elif event is InputEventJoypadButton and event.pressed:
		pressed = true
	if pressed:
		any_pressed.emit()


# --- Effets ----------------------------------------------------------------------

func wait(sec: float) -> void:
	await get_tree().create_timer(sec).timeout


func fade_to(alpha: float, dur: float, color := Color.BLACK) -> void:
	if fade.color.a < 0.01 or fade.color.r != color.r or fade.color.g != color.g or fade.color.b != color.b:
		fade.color = Color(color.r, color.g, color.b, fade.color.a)
	var tw := create_tween()
	tw.tween_property(fade, "color:a", alpha, dur)
	await tw.finished


func shake(amp: float, dur: float) -> void:
	shake_amp = amp
	shake_t = dur


func _update_shake(delta: float) -> void:
	if shake_t > 0.0:
		shake_t -= delta
		var a := int(shake_amp)
		world.position = Vector2(randi_range(-a, a), randi_range(-a, a))
	else:
		world.position = Vector2.ZERO


func _on_fx(fx_name: String) -> void:
	match fx_name:
		"shake":
			shake(2.0, 0.4)
		"knock":
			audio.sfx("knock")
			for d in [0.0, 0.42, 0.84]:
				get_tree().create_timer(d).timeout.connect(func(): shake(2.0, 0.12))
		"thud":
			audio.sfx("thud")
			shake(3.0, 0.3)
		"flash":
			fade.color = Color(1, 1, 1, 0.8)
			create_tween().tween_property(fade, "color:a", 0.0, 0.6)
		_:
			audio.sfx(fx_name)


## Les murmures : la petite voix de la dépression, qui flotte dans le noir.
func _update_whispers(delta: float) -> void:
	var c := Game.cycle
	if not (c == 2 or c == 3 or (c == Game.CYCLE_DARK and not lantern_dead)):
		return
	if busy or dlg.active or overlay_open:
		return
	whisper_t -= delta
	if whisper_t > 0.0:
		return
	whisper_t = randf_range(14.0, 26.0)
	var words: Array = Game.story.get("whispers", [])
	if words.is_empty():
		return
	var lbl := Label.new()
	lbl.text = str(words.pick_random())
	lbl.add_theme_color_override("font_color", Color(0.75, 0.66, 0.72))
	lbl.modulate.a = 0.0
	var pos := Vector2.ZERO
	for _i in 8:
		pos = Vector2(randf_range(30, VIEW.x - 110), randf_range(30, 150))
		if pos.distance_to(room.global_position + player.position) > 70.0:
			break
	lbl.position = pos
	fx_layer.add_child(lbl)
	var tw := create_tween()
	tw.tween_property(lbl, "modulate:a", 0.55, 1.6)
	tw.parallel().tween_property(lbl, "position:y", pos.y - 6.0, 5.0)
	tw.tween_property(lbl, "modulate:a", 0.0, 2.2)
	tw.tween_callback(lbl.queue_free)


# --- Écrans ----------------------------------------------------------------------

func _label(text: String, font_size: int, color: Color, rect: Rect2) -> Label:
	var l := Label.new()
	# Le retour à la ligne doit être activé AVANT de fixer la taille.
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	l.add_theme_font_size_override("font_size", font_size)
	l.add_theme_color_override("font_color", color)
	l.text = text
	l.position = rect.position
	l.size = rect.size
	return l


func _overlay(bg_color: Color) -> Control:
	var c := Control.new()
	c.size = VIEW
	c.mouse_filter = Control.MOUSE_FILTER_STOP
	var bg := ColorRect.new()
	bg.name = "bg"
	bg.color = bg_color
	bg.size = VIEW
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(bg)
	ui.add_child(c)
	ui.move_child(fade, -1)
	return c


func _blink(node: CanvasItem) -> void:
	var tw := create_tween().set_loops()
	tw.tween_property(node, "modulate:a", 0.25, 0.9)
	tw.tween_property(node, "modulate:a", 1.0, 0.9)


func _show_title() -> void:
	overlay_open = true
	var ts: Dictionary = Game.story.get("title", {})
	var c := _overlay(Color("050508"))
	c.add_child(_label(ts.get("name", "3h12"), 57, Color("e8e2d6"), Rect2(0, 38, VIEW.x, 50)))
	c.add_child(_label(ts.get("subtitle", ""), 19, Color("a89f94"), Rect2(30, 90, VIEW.x - 60, 32)))
	c.add_child(_label(ts.get("warning", ""), 19, Color("8a7f88"), Rect2(30, 128, VIEW.x - 60, 32)))
	var press := _label(ts.get("press", ""), 19, Color("ffe3a8"), Rect2(0, 182, VIEW.x, 20))
	c.add_child(press)
	_blink(press)
	await fade_to(0.0, 1.5)
	await wait(0.6)
	await any_pressed
	audio.sfx("chime")
	await fade_to(1.0, 1.2)
	c.queue_free()
	overlay_open = false
	run(director.start)


## La fausse fin : un générique… qui se brise.
func fake_credits() -> void:
	overlay_open = true
	await fade_to(1.0, 1.8, Color.WHITE)
	audio.set_mood("credits")
	var c := _overlay(Color("0b0a0d"))
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", -4)
	col.position = Vector2(0, VIEW.y)
	var lines: Array = Game.story.get("fake_credits", [])
	var last: Label
	for i in lines.size():
		var l := Label.new()
		l.text = str(lines[i])
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.custom_minimum_size = Vector2(VIEW.x, 0)
		l.add_theme_color_override("font_color", Color("e8e2d6"))
		if i == 0:
			l.add_theme_font_size_override("font_size", 38)
		col.add_child(l)
		last = l
	c.add_child(col)
	await fade_to(0.0, 1.5)
	await get_tree().process_frame
	var hgt := col.get_combined_minimum_size().y
	var tw := create_tween()
	tw.tween_property(col, "position:y", VIEW.y * 0.5 - hgt + 6.0, 14.0)
	await tw.finished
	await wait(2.5)
	# Ça se brise.
	audio.sfx("static")
	var bg: ColorRect = c.get_node("bg")
	var labels := col.get_children()
	for k in 28:
		c.position = Vector2(randi_range(-4, 4), randi_range(-2, 2))
		var l: Label = labels.pick_random()
		l.add_theme_color_override("font_color", Color("c0484e") if randf() < 0.5 else Color("e8e2d6"))
		bg.color = Color("2a0608") if randf() < 0.25 else Color("0b0a0d")
		if k % 6 == 0:
			audio.sfx("thud")
		await wait(0.06)
	c.position = Vector2.ZERO
	bg.color = Color("0b0a0d")
	for l in labels:
		l.modulate.a = 0.0
	last.modulate.a = 1.0
	last.text = str(Game.story.get("fake_glitch", "Il te manque quelque chose."))
	last.add_theme_color_override("font_color", Color("c0484e"))
	await wait(2.2)
	audio.set_mood("silence")
	fade.color = Color(0, 0, 0, 1)
	c.queue_free()
	overlay_open = false


func ending() -> void:
	await dlg.play("epilogue")
	await fade_to(1.0, 3.0)
	await _end_screen()


func _end_screen() -> void:
	overlay_open = true
	var es: Dictionary = Game.story.get("end_screen", {})
	var c := _overlay(Color("0d0a09"))
	c.add_child(_label(es.get("title", "3h13"), 38, Color("ffe3a8"), Rect2(0, 8, VIEW.x, 40)))
	var body := "\n".join(PackedStringArray(es.get("lines", [])))
	c.add_child(_label(body, 19, Color("e8e2d6"), Rect2(16, 50, VIEW.x - 32, 96)))
	c.add_child(_label(es.get("thanks", ""), 19, Color("f3d3c9"), Rect2(0, 158, VIEW.x, 20)))
	var press := _label(es.get("press", ""), 19, Color("a89f94"), Rect2(0, 186, VIEW.x, 20))
	c.add_child(press)
	_blink(press)
	await fade_to(0.0, 2.0)
	await wait(3.0)
	if dlg.auto:
		return
	await any_pressed
	Game.reset()
	get_tree().reload_current_scene()


# --- Outils de test : lancer directement une boucle / une pièce ------------------
#   godot --path . -- --cycle=3 --room=entree --at=3,3 --flags=lantern --say=knock --shot=out.png

func _parse_args() -> Dictionary:
	var d := {}
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--"):
			var kv := a.substr(2).split("=", true, 1)
			d[kv[0]] = kv[1] if kv.size() > 1 else "1"
	return d


func _debug_start(args: Dictionary) -> void:
	Game.cycle = int(args.get("cycle", "1"))
	for f in str(args.get("flags", "")).split(",", false):
		Game.set_flag(f)
	if Game.cycle > 1:
		Game.set_flag("lantern")
	player.has_lantern = Game.has("lantern")
	var spawn = Rooms.START
	if args.has("at"):
		var xy := str(args.at).split(",")
		spawn = Vector2(float(xy[0]), float(xy[1]))
	load_room_now(str(args.get("room", "chambre")), "", spawn)
	apply_mood(true)
	if args.has("dead"):
		kill_lantern()
		door_light = 24.0
		door_light_target = 24.0
	if args.has("facing_back"):
		player.facing_back = true
	fade.color.a = 0.0
	if args.has("say"):
		run_seq(str(args.say))
	if args.has("credits"):
		fake_credits()
	if args.has("title"):
		room.hide()
		_show_title()
	if args.has("end"):
		_end_screen()
	if args.has("shot"):
		await wait(float(args.get("wait", "1.0")))
		var img := get_viewport().get_texture().get_image()
		img.save_png(str(args.shot))
		get_tree().quit()
