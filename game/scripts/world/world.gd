class_name World
extends Node3D
## Builds and runs the 3D town from Economy data, owns the player, the HUD/UI,
## and decides which companies are simulated "live" (near the player) versus
## abstractly (far away) — the key performance trick of the simulation.

## Road rectangles: [x1, z1, x2, z2]
const ROADS := [
	[-125, 15, 235, 25],     # Grand-Rue (east-west)
	[-5, -85, 5, 15],        # Avenue du Nord
	[-5, 25, 5, 140],        # Route du Port
	[-60, -85, 60, -75],     # Rue de l'Industrie
]

const ACHIEVEMENTS := [
	{"id": "first_wage", "title": "Premier salaire", "desc": "Gagner de l'argent en travaillant."},
	{"id": "barista10", "title": "Main de barista", "desc": "Servir 10 commandes."},
	{"id": "courier5", "title": "Toujours à l'heure", "desc": "Effectuer 5 livraisons."},
	{"id": "picker20", "title": "Doigts de fée", "desc": "Cueillir 20 buissons de café."},
	{"id": "founder", "title": "Entrepreneur", "desc": "Posséder sa première entreprise."},
	{"id": "tycoon", "title": "Petit empire", "desc": "Posséder 2 entreprises ou plus."},
	{"id": "rich", "title": "Notable de Bourgade", "desc": "Atteindre 10 000 $ de patrimoine net."},
]

var player: Player
var car: Vehicle
var hud: HUD
var ui: GameUI
var build_mode: BuildMode = null
var buildings := {}            # biz_id -> BusinessBuilding
var lot_nodes := {}            # lot_id -> LotNode
var sun: DirectionalLight3D
var env: Environment
var sky_mat: ProceduralSkyMaterial
var rng := RandomNumberGenerator.new()
var waypoint := Vector3.ZERO
var waypoint_active := false
var waypoint_label := ""
var stats := {"served": 0, "deliveries": 0, "harvested": 0}
var achievements := {}
var inside: BusinessBuilding = null
var _arrow: Node3D
var _live_t := 0.0
var _ped_t := 0.0
var _pedestrians: Array = []
var _job_crate: Node3D = null
var _autosave_day := 0
var _start_cash := 0.0


func _ready() -> void:
	add_to_group("world")
	rng.seed = 12345


## Builds every node from the current Economy state.
func build(player_state: Dictionary = {}) -> void:
	_build_environment()
	_build_ground()
	_build_town_hall()
	_build_port()
	for id in Economy.businesses:
		_add_building(id, false)
	for lid in Economy.lots:
		var ln := LotNode.new()
		add_child(ln)
		ln.setup(self, lid)
		lot_nodes[lid] = ln
	_scatter_trees()
	_street_furniture()
	player = Player.new()
	player.world = self
	add_child(player)
	var sp: Array = GameData.layout.player_spawn
	player.global_position = Vector3(sp[0], sp[1], sp[2])
	car = Vehicle.new()
	add_child(car)
	var cs: Array = GameData.layout.car_spawn
	car.global_position = Vector3(cs[0], cs[1], cs[2])
	car.heading = PI / 2
	car.rotation.y = car.heading
	hud = HUD.new(self)
	add_child(hud)
	ui = GameUI.new(self)
	add_child(ui)
	player.interaction_prompt.connect(hud.set_prompt)
	_arrow = Node3D.new()
	add_child(_arrow)
	var cone := MeshFactory.cylinder(_arrow, 0.35, 0.9, Vector3.ZERO, Color("#4cc9f0"), 0.0, 8)
	cone.rotation.x = PI / 2
	cone.material_override = MeshFactory.mat(Color("#4cc9f0"), 1.5)
	_arrow.visible = false
	if not player_state.is_empty():
		player.from_dict(player_state.get("player", {}))
		car.from_dict(player_state.get("car", {}))
		stats = player_state.get("stats", stats)
		achievements = player_state.get("achievements", {})
		if player_state.has("waypoint"):
			var w: Array = player_state.waypoint
			set_waypoint(Vector3(w[0], 0, w[1]), str(player_state.get("waypoint_label", "")))
	Economy.live_customer.connect(_on_live_customer)
	Economy.business_added.connect(func(id): _add_building(id, true); _check_achievements())
	Economy.business_changed.connect(_on_business_changed)
	Economy.ownership_changed.connect(func(id): _on_business_changed(id); _check_achievements())
	Economy.lot_changed.connect(func(lid): lot_nodes[lid].refresh())
	Economy.notify.connect(toast)
	Clock.hour_passed.connect(_on_hour)
	Clock.day_passed.connect(_on_day)
	_autosave_day = Clock.day
	_start_cash = Economy.player_cash()
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	Clock.running = true
	_update_sun()
	toast("Bienvenue à Bourgade, %s ! Appuyez sur H pour l'aide, Tab pour trouver un emploi." % Identity.display_name(player.player_id), "event")


func _add_building(id: String, animate: bool) -> void:
	if buildings.has(id):
		return
	var bb := BusinessBuilding.new()
	add_child(bb)
	bb.setup(self, id, animate)
	buildings[id] = bb


func _on_business_changed(id: String) -> void:
	if buildings.has(id):
		buildings[id].refresh()


# ------------------------------------------------------------------ environment
func _build_environment() -> void:
	var we := WorldEnvironment.new()
	env = Environment.new()
	env.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	sky_mat = ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color("#4a90d9")
	sky_mat.sky_horizon_color = Color("#bfe3ff")
	sky_mat.ground_horizon_color = Color("#bfe3ff")
	sky_mat.ground_bottom_color = Color("#6a994e")
	sky.sky_material = sky_mat
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("#b8c6db")
	env.ambient_light_energy = 0.5
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	env.fog_enabled = true
	env.fog_light_color = Color("#cfe8ff")
	env.fog_density = 0.0022
	we.environment = env
	add_child(we)
	sun = DirectionalLight3D.new()
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 90.0
	sun.light_energy = 1.1
	add_child(sun)


func _update_sun() -> void:
	var h := Clock.hour_f()
	var day_k: float = clamp(sin((h - 6.0) / 14.0 * PI), 0.0, 1.0)   # 6h → 20h
	sun.rotation = Vector3(-0.25 - day_k * 0.95, deg_to_rad(-40.0 + (h - 13.0) * 12.0), 0)
	sun.light_energy = 0.12 + 0.68 * day_k
	sun.light_color = Color("#ffd6a5").lerp(Color("#fffaf0"), day_k)
	var night := Color("#0b1d3a")
	sky_mat.sky_top_color = night.lerp(Color("#4a90d9"), day_k)
	sky_mat.sky_horizon_color = Color("#3c2f5c").lerp(Color("#bfe3ff"), day_k)
	sky_mat.ground_horizon_color = sky_mat.sky_horizon_color
	env.ambient_light_energy = 0.22 + 0.33 * day_k
	env.fog_light_color = sky_mat.sky_horizon_color


func _build_ground() -> void:
	MeshFactory.box(self, Vector3(700, 1, 700), Vector3(55, -0.5, 30), Color("#8fd16f"), true)
	for r in ROADS:
		var w: float = r[2] - r[0]
		var d: float = r[3] - r[1]
		var c := Vector3((r[0] + r[2]) / 2.0, 0.01, (r[1] + r[3]) / 2.0)
		MeshFactory.box(self, Vector3(w, 0.04, d), c, Color("#4a4e57"))
		# sidewalks
		if w > d:
			MeshFactory.box(self, Vector3(w, 0.1, 3.5), c + Vector3(0, 0.03, -d / 2 - 1.75), Color("#d6ccc2"))
			MeshFactory.box(self, Vector3(w, 0.1, 3.5), c + Vector3(0, 0.03, d / 2 + 1.75), Color("#d6ccc2"))
			var x: float = r[0] + 2.0
			while x < r[2]:
				MeshFactory.box(self, Vector3(2.5, 0.05, 0.25), Vector3(x, 0.02, c.z), Color("#f8f9fa"))
				x += 6.0
		else:
			MeshFactory.box(self, Vector3(3.5, 0.1, d), c + Vector3(-w / 2 - 1.75, 0.03, 0), Color("#d6ccc2"))
			MeshFactory.box(self, Vector3(3.5, 0.1, d), c + Vector3(w / 2 + 1.75, 0.03, 0), Color("#d6ccc2"))
			var z: float = r[1] + 2.0
			while z < r[3]:
				MeshFactory.box(self, Vector3(0.25, 0.05, 2.5), Vector3(c.x, 0.02, z), Color("#f8f9fa"))
				z += 6.0
	# town square fountain
	MeshFactory.cylinder(self, 3.0, 0.6, Vector3(-12, 0.3, 30), Color("#adb5bd"))
	MeshFactory.cylinder(self, 2.6, 0.62, Vector3(-12, 0.32, 30), Color("#4cc9f0"))
	MeshFactory.cylinder(self, 0.3, 2.0, Vector3(-12, 1.0, 30), Color("#adb5bd"))
	MeshFactory.add_box_collider(self, Vector3(5.5, 0.8, 5.5), Vector3(-12, 0.4, 30))


func _build_town_hall() -> void:
	var th: Dictionary = GameData.layout.town_hall
	var n := Node3D.new()
	add_child(n)
	n.position = Vector3(th.pos[0], 0, th.pos[1])
	n.rotation.y = deg_to_rad(float(th.rot))
	MeshFactory.box(n, Vector3(14, 6, 10), Vector3(0, 3, 0), Color("#f8f9fa"), true)
	MeshFactory.box(n, Vector3(15, 0.6, 11), Vector3(0, 6.3, 0), Color("#6d6875"))
	MeshFactory.box(n, Vector3(5, 2.5, 5), Vector3(0, 7.8, 0), Color("#f8f9fa"))
	MeshFactory.cylinder(n, 1.2, 0.2, Vector3(0, 8.2, 2.55), Color.WHITE).rotation.x = PI / 2
	for i in 5:
		MeshFactory.cylinder(n, 0.35, 5.5, Vector3(-5 + i * 2.5, 2.75, 5.6), Color("#e9ecef"))
	MeshFactory.box(n, Vector3(2.2, 3.2, 0.1), Vector3(0, 1.6, 5.05), Color("#6b4f3a"))
	var l := MeshFactory.label(n, "MAIRIE DE BOURGADE", Vector3(0, 5.3, 5.1), 80, Color("#222222"), false)
	l.outline_size = 0
	MeshFactory.cylinder(n, 0.06, 8.0, Vector3(6.5, 4, 6.5), Color("#adb5bd"))
	MeshFactory.box(n, Vector3(1.6, 1.0, 0.05), Vector3(7.3, 7.4, 6.5), Color("#3a86ff"))
	# job board
	MeshFactory.box(n, Vector3(3.0, 2.0, 0.2), Vector3(-4.5, 1.6, 7.5), Color("#8d6346"))
	MeshFactory.box(n, Vector3(2.7, 1.7, 0.05), Vector3(-4.5, 1.6, 7.62), Color("#fefae0"))
	MeshFactory.label(n, "OFFRES D'EMPLOI", Vector3(-4.5, 2.2, 7.7), 40, Color("#9c6644"), false).outline_size = 0
	MeshFactory.label(n, "Livreur • Barista\nCueilleur • Registre", Vector3(-4.5, 1.5, 7.7), 30, Color("#333333"), false).outline_size = 0
	Interactable.make(n, Vector3(-4.5, 1.0, 8.4), 2.8, func(p): return "[E] Consulter les offres d'emploi et le registre" if p.vehicle == null else "", func(_p): ui.open_phone(0))


func _build_port() -> void:
	var pp: Array = GameData.layout.port.pos
	var base := Vector3(pp[0], 0, pp[1])
	var water := MeshInstance3D.new()
	var pm := PlaneMesh.new()
	pm.size = Vector2(400, 120)
	water.mesh = pm
	water.material_override = MeshFactory.mat(Color("#4895ef"), 0.0, false, 0.2)
	water.position = Vector3(base.x, 0.05, base.z + 70)
	add_child(water)
	MeshFactory.box(self, Vector3(60, 0.8, 18), base + Vector3(0, 0.0, 2), Color("#adb5bd"), true)
	var cols := [Color("#e63946"), Color("#457b9d"), Color("#f4a261"), Color("#2a9d8f")]
	for i in 6:
		MeshFactory.box(self, Vector3(6, 2.6, 2.6), base + Vector3(-24 + i * 7, 1.7, -2 + (i % 2) * 3.2), cols[i % 4], true)
	MeshFactory.box(self, Vector3(1, 14, 1), base + Vector3(20, 7, 4), Color("#ffb703"))
	MeshFactory.box(self, Vector3(16, 1, 1), base + Vector3(16, 14, 4), Color("#ffb703"))
	MeshFactory.box(self, Vector3(6, 3.5, 5), base + Vector3(10, 1.75, -4), Color("#f8f9fa"), true)
	MeshFactory.label(self, "PORT DE COMMERCE", base + Vector3(10, 4.3, -1.4), 60, Color("#1d3557"), false).outline_size = 0
	Interactable.make(self, base + Vector3(10, 0.5, -7.5), 3.0, func(p): return "[E] Capitainerie : prix import / export" if p.vehicle == null else "", func(_p): ui.open_phone(2))
	MeshFactory.box(self, Vector3(1.6, 0.05, 1.6), port_dock(), Color("#ffb703"))


func port_dock() -> Vector3:
	var pp: Array = GameData.layout.port.pos
	return Vector3(pp[0] + 4, 0.45, pp[1] - 8)


func _scatter_trees() -> void:
	var placed := 0
	var tries := 0
	while placed < 170 and tries < 3000:
		tries += 1
		var p := Vector3(rng.randf_range(-125, 235), 0, rng.randf_range(-125, 140))
		if _blocked(p, 4.0):
			continue
		MeshFactory.tree(self, p, rng)
		placed += 1


func _blocked(p: Vector3, margin: float) -> bool:
	for r in ROADS:
		if p.x > r[0] - 4 - margin and p.x < r[2] + 4 + margin and p.z > r[1] - 4 - margin and p.z < r[3] + 4 + margin:
			return true
	for id in Economy.businesses:
		var b: Business = Economy.businesses[id]
		if Vector2(p.x, p.z).distance_to(b.pos) < 24:
			return true
	for lid in Economy.lots:
		var l: Dictionary = Economy.lots[lid]
		if Vector2(p.x, p.z).distance_to(Vector2(l.pos[0], l.pos[1])) < 14:
			return true
	var th: Array = GameData.layout.town_hall.pos
	if Vector2(p.x, p.z).distance_to(Vector2(th[0], th[1])) < 16 or p.z > 125:
		return true
	return false


func _street_furniture() -> void:
	var x := -110.0
	while x < 225.0:
		for z in [12.0, 28.0]:
			if not _blocked_lamp(Vector3(x, 0, z)):
				MeshFactory.cylinder(self, 0.08, 4.0, Vector3(x, 2.0, z), Color("#343a40"))
				MeshFactory.add_box_collider(self, Vector3(0.25, 4.0, 0.25), Vector3(x, 2.0, z))
				MeshFactory.sphere(self, 0.25, Vector3(x, 4.1, z), Color("#fff3b0"), 1.5)
		x += 18.0
	for i in 4:
		var bx := -24.0 + i * 3.0
		MeshFactory.box(self, Vector3(1.8, 0.45, 0.5), Vector3(bx, 0.35, 34), Color("#9c6644"), true)


func _blocked_lamp(p: Vector3) -> bool:
	return abs(p.x) < 7.0


# ------------------------------------------------------------------ per-frame
func _process(delta: float) -> void:
	_update_sun()
	_live_t -= delta
	if _live_t <= 0.0:
		_live_t = 0.4
		_update_live()
		_check_job_state()
	_ped_t -= delta
	if _ped_t <= 0.0:
		_ped_t = 1.0
		_update_pedestrians()
	_update_arrow(delta)


## Companies within `live_radius` of the player are simulated with visible NPCs.
func _update_live() -> void:
	if player == null:
		return
	var radius := float(GameData.bal("live_radius", 55))
	for id in buildings:
		var bb: BusinessBuilding = buildings[id]
		if bb.service == null:
			continue
		var near := bb.global_position.distance_to(player.global_position) < radius
		if near:
			Economy.live_businesses[id] = bb.service.queue_length()
		elif Economy.live_businesses.has(id):
			Economy.live_businesses.erase(id)
			bb.service.despawn_all()
	for id in Economy.player_present.keys():
		if inside == null or inside.biz_id != id:
			Economy.player_present.erase(id)
	if inside != null and inside.service != null and inside.service.player_can_work(player):
		Economy.player_present[inside.biz_id] = true


func _on_live_customer(biz_id: String, c: Dictionary) -> void:
	if buildings.has(biz_id) and buildings[biz_id].service:
		buildings[biz_id].service.enqueue_customer(c)


func _check_job_state() -> void:
	var j: Dictionary = Economy.job_of(player.player_id)
	if j.get("type", "") == "barista" and buildings.has(j.biz_id):
		if buildings[j.biz_id].global_position.distance_to(player.global_position) > 40.0:
			Economy.request_end_shift(player.player_id)
			toast("Vous avez quitté votre poste : fin du service.", "info")
	if j.get("type", "") == "delivery":
		var exists := false
		for o in Economy.orders:
			if int(o.id) == int(j.order_id) and o.status == "taken":
				exists = true
		if not exists:
			remove_job_crate()
			Economy.player_jobs.erase(player.player_id)
	elif player.carrying.get("type", "") == "crate":
		player.clear_carry()
		if player.vehicle:
			player.vehicle._show_cargo(false)


func _update_pedestrians() -> void:
	if player == null:
		return
	var want := 16
	for n in _pedestrians.duplicate():
		if not is_instance_valid(n):
			_pedestrians.erase(n)
		elif n.global_position.distance_to(player.global_position) > 90.0:
			_pedestrians.erase(n)
			n.queue_free()
		elif not n.is_moving():
			n.go([_sidewalk_point_near(n.global_position, 30.0)])
	var tries := 0
	while _pedestrians.size() < want and tries < 20:
		tries += 1
		var p := _sidewalk_point_near(player.global_position, 70.0)
		if p.distance_to(player.global_position) < 25.0:
			continue
		var n := NPC.new()
		add_child(n)
		n.setup(rng, Color(0, 0, 0, 0), Color("#f4a261") if rng.randf() < 0.3 else Color(0, 0, 0, 0))
		n.global_position = p
		n.move_speed = rng.randf_range(1.4, 2.2)
		n.go([_sidewalk_point_near(p, 30.0)])
		_pedestrians.append(n)


func _sidewalk_point_near(c: Vector3, r: float) -> Vector3:
	for i in 10:
		var road: Array = ROADS[rng.randi() % ROADS.size()]
		var w: float = road[2] - road[0]
		var d: float = road[3] - road[1]
		var p: Vector3
		if w > d:
			var side := -1.75 if rng.randf() < 0.5 else 1.75
			var z: float = (road[1] - side * 0) + (0.0 if side < 0 else d) + side
			p = Vector3(clamp(c.x + rng.randf_range(-r, r), road[0], road[2]), 0.08, z)
		else:
			var side2 := -1.75 if rng.randf() < 0.5 else 1.75
			var x: float = road[0] + (0.0 if side2 < 0 else w) + side2
			p = Vector3(x, 0.08, clamp(c.z + rng.randf_range(-r, r), road[1], road[3]))
		if p.distance_to(c) < r * 1.5:
			return p
	return c + Vector3(rng.randf_range(-5, 5), 0, rng.randf_range(-5, 5))


# ------------------------------------------------------------------ input
func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventKey) or not event.pressed or event.echo:
		return
	match event.physical_keycode:
		KEY_ESCAPE:
			if build_mode:
				_exit_build_mode()
			elif ui.is_open():
				ui.close()
			else:
				ui.open_pause()
		KEY_TAB:
			if ui.current_kind == "phone":
				ui.close()
			elif not build_mode:
				ui.open_phone(0)
		KEY_M:
			if ui.current_kind == "map":
				ui.close()
			elif not build_mode:
				ui.open_map()
		KEY_H:
			if ui.current_kind == "help":
				ui.close()
			elif not build_mode:
				ui.open_help()
		KEY_B:
			if build_mode:
				_exit_build_mode()
			elif not ui.is_open():
				_enter_build_mode()
		KEY_F5:
			save_game()
		KEY_F9:
			request_load()


func _enter_build_mode() -> void:
	if inside == null or inside.service == null:
		toast("Le mode construction s'utilise à l'intérieur d'un établissement que vous possédez.", "warn")
		return
	if inside.biz().owner_id != player.player_id:
		toast("Vous n'êtes pas propriétaire de cet établissement.", "warn")
		return
	build_mode = BuildMode.new(self, inside)
	add_child(build_mode)
	player.input_locked = true
	player.pitch = -1.05
	player.zoom = 11.0
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func _exit_build_mode() -> void:
	if build_mode:
		build_mode.close()
		build_mode = null
	player.input_locked = ui.is_open()
	player.zoom = 5.5
	player.pitch = -0.35
	if not ui.is_open():
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func can_capture_mouse() -> bool:
	return not ui.is_open() and build_mode == null


func on_ui_opened() -> void:
	player.input_locked = true
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func on_ui_closed() -> void:
	if build_mode == null:
		player.input_locked = false
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func on_player_inside(b: BusinessBuilding) -> void:
	inside = b
	if b == null and build_mode:
		_exit_build_mode()
	if b != null and b.service != null and b.biz().owner_id == player.player_id:
		toast("Votre établissement : B = mode construction, comptoir/machines pour servir vous-même.", "info")


# ------------------------------------------------------------------ helpers
func toast(text: String, kind := "info") -> void:
	if hud:
		hud.toast(text, kind)


func celebrate() -> void:
	player.visual.excited = 1.5
	var fx := CPUParticles3D.new()
	fx.amount = 60
	fx.one_shot = true
	fx.explosiveness = 0.9
	fx.lifetime = 1.6
	fx.direction = Vector3.UP
	fx.spread = 60
	fx.initial_velocity_min = 5
	fx.initial_velocity_max = 9
	var bm := BoxMesh.new()
	bm.size = Vector3(0.12, 0.12, 0.02)
	bm.material = MeshFactory.mat(Color("#ffd166"), 1.0)
	fx.mesh = bm
	fx.color_ramp = null
	add_child(fx)
	fx.global_position = player.global_position + Vector3(0, 2, 0)
	fx.emitting = true
	get_tree().create_timer(3.0).timeout.connect(fx.queue_free)


func start_hold_action(p: Player, text: String, duration: float, done: Callable) -> void:
	p.busy = true
	hud.start_hold(text, duration, func():
		p.busy = false
		done.call())


func nearest_vehicle(pos: Vector3, r: float) -> Vehicle:
	if car and car.global_position.distance_to(pos) < r:
		return car
	return null


func stats_add(k: String, n: int) -> void:
	stats[k] = int(stats.get(k, 0)) + n
	_check_achievements()


func _unlock(id: String) -> void:
	if achievements.has(id):
		return
	achievements[id] = Clock.day
	for a in ACHIEVEMENTS:
		if a.id == id:
			toast("★ Succès débloqué : %s — %s" % [a.title, a.desc], "achievement")
			celebrate()


func _check_achievements() -> void:
	if player == null:
		return
	var pid := player.player_id
	if Economy.player_cash() > _start_cash + 0.5 or int(stats.served) > 0 or int(stats.harvested) > 0 or int(stats.deliveries) > 0:
		_unlock("first_wage")
	if int(stats.served) >= 10:
		_unlock("barista10")
	if int(stats.deliveries) >= 5:
		_unlock("courier5")
	if int(stats.harvested) >= 20:
		_unlock("picker20")
	var mine := Economy.owned_businesses(pid)
	if mine.size() >= 1:
		_unlock("founder")
	if mine.size() >= 2:
		_unlock("tycoon")
	var worth := Economy.player_cash()
	for b in mine:
		worth += Economy.valuation(b)
	if worth >= 10000:
		_unlock("rich")


func _on_hour(_d: int, _h: int) -> void:
	_check_achievements()


func _on_day(day: int) -> void:
	var mine := Economy.owned_businesses(player.player_id)
	for b in mine:
		if b.history.size() > 0:
			var r: Dictionary = b.history[-1]
			toast("Bilan d'hier — %s : %s (%d clients servis, %d perdus)" % [b.name, Economy.money(float(r.profit)), int(r.served), int(r.lost)], "money" if float(r.profit) >= 0 else "warn")
	if day > _autosave_day:
		_autosave_day = day
		save_game(true)


# ------------------------------------------------------------------ GPS / delivery
func set_waypoint(p: Vector3, label: String) -> void:
	waypoint = p
	waypoint_active = true
	waypoint_label = label
	toast("GPS : %s" % label, "info")


func gps_target() -> Dictionary:
	var j: Dictionary = Economy.job_of(player.player_id)
	if j.get("type", "") == "delivery":
		for o in Economy.orders:
			if int(o.id) == int(j.order_id):
				if player.carrying.get("type", "") == "crate":
					var bb: BusinessBuilding = buildings.get(o.buyer)
					if bb:
						return {"pos": bb.dock.global_position, "label": "Livrer à " + o.buyer_name}
				elif _job_crate and is_instance_valid(_job_crate):
					return {"pos": _job_crate.global_position, "label": "Récupérer la caisse chez " + o.seller_name}
	if waypoint_active:
		return {"pos": waypoint, "label": waypoint_label}
	return {}


func gps_text() -> String:
	var t := gps_target()
	if t.is_empty() or player == null:
		return ""
	var d: float = Vector2(t.pos.x, t.pos.z).distance_to(Vector2(player.global_position.x, player.global_position.z))
	if waypoint_active and t.pos == waypoint and d < 6.0:
		waypoint_active = false
		return ""
	return "➜ %s — %d m" % [t.label, int(d)]


func _update_arrow(delta: float) -> void:
	var t := gps_target()
	_arrow.visible = not t.is_empty() and player != null
	if not _arrow.visible:
		return
	var origin: Vector3 = (player.vehicle.global_position + Vector3(0, 3.2, 0)) if player.vehicle else player.global_position + Vector3(0, 2.6, 0)
	_arrow.global_position = origin
	var to: Vector3 = t.pos - origin
	to.y = 0
	if to.length() > 0.5:
		_arrow.rotation.y = lerp_angle(_arrow.rotation.y, atan2(to.x, to.z), 8.0 * delta)


func spawn_job_crate(o: Dictionary) -> void:
	remove_job_crate()
	var pos := port_dock()
	if o.seller != "port" and buildings.has(o.seller):
		pos = buildings[o.seller].dock.global_position
	var c := Crate.new()
	add_child(c)
	c.global_position = Vector3(pos.x, 0.05, pos.z)
	c.setup(self, int(o.id), o.good)
	_job_crate = c


func remove_job_crate() -> void:
	if _job_crate and is_instance_valid(_job_crate):
		_job_crate.queue_free()
	_job_crate = null
	if player and player.carrying.get("type", "") == "crate":
		player.clear_carry()


func drop_crate(data: Dictionary, pos: Vector3) -> void:
	var c := Crate.new()
	add_child(c)
	c.global_position = Vector3(pos.x, 0.05, pos.z)
	c.setup(self, int(data.order_id), data.good)
	_job_crate = c


# ------------------------------------------------------------------ save / load
func save_state() -> Dictionary:
	var d := {"player": player.to_dict(), "car": car.to_dict(), "stats": stats, "achievements": achievements}
	if waypoint_active:
		d["waypoint"] = [waypoint.x, waypoint.z]
		d["waypoint_label"] = waypoint_label
	return d


func save_game(auto := false) -> void:
	if SaveSystem.save_game():
		toast("Sauvegarde automatique effectuée." if auto else "Partie sauvegardée.", "ok")
	else:
		toast("Échec de la sauvegarde !", "warn")


func request_load() -> void:
	get_parent().load_game()


## Autoload signals hold lambdas bound to this world and its children:
## disconnect them so a reload never calls into freed objects.
func _exit_tree() -> void:
	for src in [Economy, Clock, Identity]:
		for sig in src.get_signal_list():
			for c in src.get_signal_connection_list(sig.name):
				var cb: Callable = c.callable
				var o = cb.get_object()
				if o == self or (o is Node and is_ancestor_of(o)):
					src.disconnect(sig.name, cb)
