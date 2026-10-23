extends Node3D
## Entry point: main menu, new game / continue, and the automated self-test
## (run with:  godot --headless -- --selftest).

var world: World = null
var menu: CanvasLayer = null


func _ready() -> void:
	if "--selftest" in OS.get_cmdline_user_args():
		# Loaded by path: tests/ is excluded from exported builds.
		var t: Node = load("res://tests/self_test.gd").new()
		add_child(t)
		t.run(self)
		return
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--screenshot="):
			_screenshots(a.substr(13))
			return
	_show_menu()


## Visual smoke test: plays a scripted tour and saves PNGs (needs a display).
func _screenshots(dir: String) -> void:
	DirAccess.make_dir_recursive_absolute(dir)
	await get_tree().process_frame
	_show_menu()
	for i in 10:
		await get_tree().process_frame
	await _shot(dir + "/01_menu.png")
	new_game()
	var p := world.player
	for i in 50:
		await get_tree().process_frame
	await _shot(dir + "/02_spawn.png")
	# Look at the café street from the sidewalk
	p.global_position = Vector3(-22, 0.2, 14)
	p.yaw = deg_to_rad(20)
	p.pitch = -0.25
	Clock.advance(60.0)
	for i in 90:
		await get_tree().process_frame
	await _shot(dir + "/03_street.png")
	# Inside Café du Coin, behind the counter
	p.global_position = Vector3(-30 + 4.5, 0.2, 4 - 3.0)
	p.yaw = deg_to_rad(200)
	p.pitch = -0.6
	p.zoom = 7.0
	Economy.request_start_shift(p.player_id, "cafe_coin")
	for i in 90:
		await get_tree().process_frame
	await _shot(dir + "/04_cafe_inside.png")
	world.ui.open_business("cafe_coin")
	for i in 10:
		await get_tree().process_frame
	await _shot(dir + "/05_business_panel.png")
	world.ui.close()
	world.ui.open_phone(0)
	for i in 10:
		await get_tree().process_frame
	await _shot(dir + "/06_phone_jobs.png")
	world.ui.close()
	world.ui.open_map()
	for i in 10:
		await get_tree().process_frame
	await _shot(dir + "/07_map.png")
	world.ui.close()
	# Found a café and open build mode
	Economy.transfer(Economy.EXTERNAL, "player:" + p.player_id, 5000.0, "test", "screenshot grant")
	var r: Dictionary = Economy.request_found_business(p.player_id, "lot_a", "cafe", "Chez Moi", "#8338ec", false)
	Economy.request_deposit(p.player_id, r.biz_id, 2000)
	Economy.request_buy_equipment(p.player_id, r.biz_id, "coffee_machine_pro", -1.5, -3.6, 0)
	Economy.request_buy_equipment(p.player_id, r.biz_id, "sofa", 3.5, 3.0, PI)
	Economy.request_buy_equipment(p.player_id, r.biz_id, "plant", -5, 4, 0)
	Economy.request_buy_equipment(p.player_id, r.biz_id, "arcade", -5, 1, PI / 2)
	for i in 50:
		await get_tree().process_frame
	p.global_position = Vector3(-12, 0.2, 18)
	p.yaw = deg_to_rad(0)
	p.pitch = -0.3
	p.zoom = 9.0
	for i in 50:
		await get_tree().process_frame
	await _shot(dir + "/08_player_cafe_nameplate.png")
	p.global_position = Vector3(-12, 0.2, 5)
	for i in 60:
		await get_tree().process_frame
	world._enter_build_mode()
	world.build_mode._select("table_set")
	for i in 60:
		await get_tree().process_frame
	await _shot(dir + "/09_build_mode.png")
	world._exit_build_mode()
	# Countryside
	p.global_position = Vector3(125, 0.2, 22)
	p.yaw = deg_to_rad(0)
	p.pitch = -0.3
	p.zoom = 8.0
	for i in 60:
		await get_tree().process_frame
	await _shot(dir + "/10_farm.png")
	p.global_position = Vector3(0, 0.2, -70)
	p.yaw = deg_to_rad(0)
	p.pitch = -0.2
	for i in 60:
		await get_tree().process_frame
	await _shot(dir + "/11_industry.png")
	Clock.minutes = 21.0 * 60.0
	p.global_position = Vector3(-6, 0.2, 16)
	p.yaw = deg_to_rad(30)
	for i in 100:
		await get_tree().process_frame
	await _shot(dir + "/12_evening.png")
	get_tree().quit()


func _shot(path: String) -> void:
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png(path)
	print("SHOT ", path)


func _show_menu() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	menu = CanvasLayer.new()
	add_child(menu)
	var bg := ColorRect.new()
	bg.color = Color("#264653")
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	menu.add_child(bg)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	center.theme = UITheme.theme()
	menu.add_child(center)
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(620, 0)
	center.add_child(panel)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 12)
	panel.add_child(v)
	var title := UITheme.label("BOURGADE INC.", 54, UITheme.ACCENT)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(title)
	var sub := UITheme.label("Travaillez, entreprenez, rachetez… et bâtissez votre empire.", 18, UITheme.MUTED)
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
	v.add_child(UITheme.label("Profil : %s" % ("Steam" if Identity.provider == "steam" else "local (test) — l'avatar Steam sera utilisé automatiquement avec Steamworks"), 14, UITheme.MUTED))
	var cont := UITheme.button("Continuer la partie", func(): Identity.set_local_name(name_edit.text); load_game(), not SaveSystem.has_save())
	cont.custom_minimum_size.y = 48
	v.add_child(cont)
	var newg := UITheme.button("Nouvelle partie", func(): Identity.set_local_name(name_edit.text); new_game())
	newg.custom_minimum_size.y = 48
	v.add_child(newg)
	v.add_child(UITheme.button("Quitter", func(): get_tree().quit()))
	var help := UITheme.label("ZQSD/WASD + souris • E interagir • Tab téléphone • M carte • H aide", 14, UITheme.MUTED)
	help.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(help)
	v.add_child(UITheme.label("Prototype v0.1 — solo local. Multijoueur et Steam : architecture prête, intégration à venir.", 13, UITheme.MUTED))


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
	Clock.minutes = float(GameData.bal("start_hour", 7)) * 60.0
	Clock.time_scale = 1.0
	Economy.new_world()
	_spawn_world({})


func load_game() -> void:
	var d := SaveSystem.read_save()
	if d.is_empty():
		if world:
			world.toast("Aucune sauvegarde compatible.", "warn")
		return
	_clear()
	SaveSystem.apply_save(d)
	Identity._profiles[Identity.local_id()] = Identity.local_profile
	_spawn_world(d.get("player", {}))
	world.toast("Partie chargée (%s)." % str(d.get("saved_at", "")), "ok")


func _spawn_world(player_state: Dictionary) -> void:
	world = World.new()
	add_child(world)
	world.build(player_state)
