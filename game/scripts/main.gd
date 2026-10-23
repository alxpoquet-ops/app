extends Node3D
## Entry point: main menu, new game / continue, automated self-test
## (godot --headless --fixed-fps 60 -- --selftest) and screenshot tour
## (-- --screenshot=<dir>).

var world: HotelWorld = null
var menu: CanvasLayer = null


func _ready() -> void:
	var args := OS.get_cmdline_user_args()
	if "--selftest" in args:
		# Loaded by path: tests/ is excluded from exported builds.
		var t: Node = load("res://tests/self_test.gd").new()
		add_child(t)
		t.run(self)
		return
	for a in args:
		if a.begins_with("--screenshot="):
			_screenshots(a.substr(13))
			return
	_show_menu()


func _show_menu() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	menu = CanvasLayer.new()
	add_child(menu)
	var bg := ColorRect.new()
	bg.color = Color("#3c1642")
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	menu.add_child(bg)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	center.theme = UITheme.theme()
	menu.add_child(center)
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(660, 0)
	center.add_child(panel)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 12)
	panel.add_child(v)
	var title := UITheme.label("GRAND HÔTEL WOBBLE", 50, UITheme.ACCENT)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(title)
	var sub := UITheme.label("Dirigez un palace de 5 niveaux… et mettez la main à la pâte !", 18, UITheme.MUTED)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(sub)
	var h := UITheme.hbox(v)
	h.add_child(UITheme.label("Pseudo :", 18))
	var name_edit := LineEdit.new()
	name_edit.text = Identity.display_name(Identity.local_id())
	name_edit.max_length = 20
	name_edit.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_edit.editable = Identity.provider == "local"
	h.add_child(name_edit)
	var cont := UITheme.button("Continuer la partie", func(): Identity.set_local_name(name_edit.text); load_game(), not SaveSystem.has_save())
	cont.custom_minimum_size.y = 48
	v.add_child(cont)
	var newg := UITheme.button("Nouvelle partie", func(): Identity.set_local_name(name_edit.text); new_game())
	newg.custom_minimum_size.y = 48
	v.add_child(newg)
	v.add_child(UITheme.button("Quitter", func(): get_tree().quit()))
	var help := UITheme.label("ZQSD/WASD + souris • E agir • Tab tablette • J changer de métier • H aide", 14, UITheme.MUTED)
	help.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(help)
	v.add_child(UITheme.label("Version 0.2 — solo. 11 métiers jouables, gestion complète. Multijoueur/Steam : à venir.", 13, UITheme.MUTED))


func _clear() -> void:
	if menu:
		menu.queue_free()
		menu = null
	if world:
		world.queue_free()
		world = null
	Clock.running = false


func new_game() -> void:
	_clear()
	Clock.day = 1
	Clock.minutes = float(GameData.bal("start_hour", 8)) * 60.0
	Clock.time_scale = 1.0
	Hotel.new_game()
	_spawn_world({})


func load_game() -> void:
	var d := SaveSystem.read_save()
	if d.is_empty():
		if world:
			world.toast("Aucune sauvegarde compatible.", "warn")
		return
	_clear()
	SaveSystem.apply_save(d)
	_spawn_world(d.get("player", {}))
	world.toast("Partie chargée (%s)." % str(d.get("saved_at", "")), "ok")


func _spawn_world(player_state: Dictionary) -> void:
	world = HotelWorld.new()
	add_child(world)
	world.build(player_state)


# ------------------------------------------------------------------ screenshots
func _screenshots(dir: String) -> void:
	DirAccess.make_dir_recursive_absolute(dir)
	_show_menu()
	await _frames(10)
	await _shot(dir + "/01_menu.png")
	new_game()
	var p := world.player
	Clock.time_scale = 4.0
	Clock.minutes = 13.5 * 60.0
	await _frames(400)
	Clock.time_scale = 1.0
	p.teleport(0, Vector3(-4, 0, 6))
	p.yaw = deg_to_rad(10)
	await _frames(60)
	await _shot(dir + "/02_lobby.png")
	p.teleport(0, Vector3(6, 0, 4))
	p.yaw = deg_to_rad(-60)
	p.pitch = -0.8
	await _frames(40)
	await _shot(dir + "/03_cafe.png")
	p.teleport(1, Vector3(-6, 0, 0))
	p.yaw = deg_to_rad(90)
	p.pitch = -0.85
	p.zoom = 14.0
	await _frames(60)
	await _shot(dir + "/04_corridor.png")
	p.teleport(1, Vector3(-15, 0, -6))
	p.zoom = 9.0
	p.pitch = -1.1
	await _frames(40)
	await _shot(dir + "/05_room.png")
	world.ui.open_tablet(0)
	await _frames(10)
	await _shot(dir + "/06_dashboard.png")
	world.ui.open_tablet(1)
	await _frames(10)
	await _shot(dir + "/07_rooms.png")
	world.ui.open_tablet(3)
	await _frames(10)
	await _shot(dir + "/08_staff.png")
	world.ui.open_tablet(5)
	await _frames(10)
	await _shot(dir + "/09_prices.png")
	world.ui.close()
	p.teleport(0, Vector3(0, 0, 5))
	world.enter_build_mode()
	world.build_mode._select("piano")
	await _frames(30)
	await _shot(dir + "/10_decor.png")
	world.exit_build_mode()
	get_tree().quit()


func _frames(n: int) -> void:
	for i in n:
		await get_tree().process_frame


func _shot(path: String) -> void:
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png(path)
	print("SHOT ", path)
