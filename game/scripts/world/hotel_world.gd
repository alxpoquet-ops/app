class_name HotelWorld
extends Node3D
## Builds the hotel from data, spawns guests/staff actors, links the
## simulation (Hotel autoload) to the 3D world and lets the player perform
## any job through generic work points.

var layout: HotelLayout
var elevator: Elevator
var player: Player
var hud: HUD
var ui: ManagerUI
var build_mode: Node = null
var room_nodes := {}            # rid -> RoomNode
var guest_actors := {}          # gid -> GuestActor
var staff_actors := {}          # sid -> StaffActor
var walkins := []
var reception_q: QueueLine
var cafe_q: QueueLine
var concierge_q: QueueLine
var spill_nodes := {}           # sid -> Node3D
var decor_root: Node3D
var facility_labels := {}       # fid -> Label3D
var rng := RandomNumberGenerator.new()
var view_floor := 0
var view_all := false
var player_task := -1           # task id the player is doing
var player_role := ""           # job focus for the priority list ("" = director: everything)
var waypoint_key := ""
var sun: DirectionalLight3D
var env: Environment
var sky_mat: ProceduralSkyMaterial
var _arrow: Node3D
var _tick := 0.0
var _walkin_t := 0.0
var _loading := false


func _ready() -> void:
	add_to_group("world")
	rng.randomize()


func build(player_state := {}) -> void:
	_loading = true
	_environment()
	layout = HotelLayout.new(self)
	layout.build()
	elevator = Elevator.new()
	add_child(elevator)
	elevator.setup(layout)
	for rid in Hotel.rooms:
		var r: Dictionary = Hotel.rooms[rid]
		var rn := RoomNode.new()
		layout.floor_nodes[int(r.floor)].add_child(rn)
		rn.setup(self, layout, r)
		room_nodes[rid] = rn
	reception_q = QueueLine.new(self, 0, Vector3(-14.6, 0, 4.5), Vector3(1.0, 0, 0))
	cafe_q = QueueLine.new(self, 0, Vector3(12.3, 0, 4.5), Vector3(-1.0, 0, 0))
	concierge_q = QueueLine.new(self, 0, Vector3(-9.0, 0, 8.8), Vector3(0, 0, -1.0))
	_work_points()
	decor_root = Node3D.new()
	layout.floor_nodes[0].add_child(decor_root)
	_rebuild_decor()
	for s in Hotel.spills.values():
		_on_spill(s)
	player = Player.new()
	player.world = self
	add_child(player)
	player.teleport(0, Vector3(0, 0, 9))
	hud = HUD.new(self)
	add_child(hud)
	ui = ManagerUI.new(self)
	add_child(ui)
	player.interaction_prompt.connect(hud.set_prompt)
	_arrow = Node3D.new()
	add_child(_arrow)
	var cone := MeshFactory.cylinder(_arrow, 0.32, 0.9, Vector3.ZERO, Color("#4cc9f0"), 0.0, 8)
	cone.rotation.x = PI / 2
	cone.material_override = MeshFactory.mat(Color("#4cc9f0"), 1.5)
	if not player_state.is_empty():
		player.from_dict(player_state.get("player", {}))
		player_role = str(player_state.get("role", ""))
	# guests already in the hotel (after loading) get an actor in their room
	for g in Hotel.guests.values():
		if g.state == "in_room":
			var a := _spawn_guest(g.id)
			a.place_at("room:" + g.room)
	for sid in Hotel.staff:
		if Hotel.on_shift(Hotel.staff[sid], Clock.hour()):
			_spawn_staff(sid, true)
	Hotel.guest_arrive.connect(_on_guest_arrive)
	Hotel.guest_intent.connect(_on_guest_intent)
	Hotel.room_changed.connect(func(rid): if room_nodes.has(rid): room_nodes[rid].refresh())
	Hotel.spill_added.connect(_on_spill)
	Hotel.spill_removed.connect(_on_spill_removed)
	Hotel.notify.connect(toast)
	Hotel.decor_changed.connect(_rebuild_decor)
	Hotel.task_removed.connect(_on_task_removed)
	Clock.day_passed.connect(_on_day)
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	Clock.running = true
	_loading = false
	toast("Bienvenue au Grand Hôtel Wobble, %s ! Tab = tablette de gestion, H = aide." % Identity.display_name(player.player_id), "event")


func _environment() -> void:
	var we := WorldEnvironment.new()
	env = Environment.new()
	env.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	sky_mat = ProceduralSkyMaterial.new()
	sky.sky_material = sky_mat
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("#fff4e6")
	env.ambient_light_energy = 0.6
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	we.environment = env
	add_child(we)
	sun = DirectionalLight3D.new()
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 70.0
	sun.light_energy = 0.7
	sun.rotation = Vector3(-1.1, 0.5, 0)
	add_child(sun)


func _update_sky() -> void:
	var h := Clock.hour_f()
	var k: float = clamp(sin((h - 6.0) / 14.0 * PI), 0.0, 1.0)
	sky_mat.sky_top_color = Color("#0b1d3a").lerp(Color("#4a90d9"), k)
	sky_mat.sky_horizon_color = Color("#3c2f5c").lerp(Color("#bfe3ff"), k)
	sky_mat.ground_horizon_color = sky_mat.sky_horizon_color
	sky_mat.ground_bottom_color = Color("#1b3a1b").lerp(Color("#6a994e"), k)
	sun.light_energy = 0.25 + 0.5 * k
	env.ambient_light_energy = 0.5 + 0.18 * k


# =====================================================================
#  WORK POINTS (player can do any job)
# =====================================================================
func _work_points() -> void:
	var keys := ["reception_staff", "reception_front", "concierge_staff", "cafe_station_machine", "cafe_display", "cafe_counter",
		"kitchen", "washer_1", "washer_2", "workshop", "storage", "staff_room"]
	for f in layout.floors:
		keys.append("linen:%d" % f)
		keys.append("elevator_front:%d" % f)
	for key in keys:
		var pkey: String = "cafe_machine" if key == "cafe_station_machine" else key
		var p: Dictionary = layout.point(pkey)
		if p.is_empty():
			continue
		var it := Interactable.make(layout.floor_nodes[int(p.floor)], p.pos + Vector3(0, 0.8, 0), 2.0 if key.begins_with("elevator") else 1.7,
			func(pl): return point_prompt(pkey, pl), func(pl): point_action(pkey, pl))
		it.alt_prompt_fn = func(pl): return point_alt_prompt(pkey, pl)
		it.alt_action_fn = func(pl): point_alt_action(pkey, pl)
	for fid in ["cafe_machine", "washer_1", "washer_2", "kitchen"]:
		var p: Dictionary = layout.point(fid)
		var l := MeshFactory.label(layout.floor_nodes[0], "", p.pos + Vector3(0, 2.4, 0), 34, Color("#ffd166"))
		facility_labels[fid] = l


## Where a task step happens.
func resolve_key(t: Dictionary, at: String) -> String:
	match at:
		"room": return "room:" + str(t.room)
		"door": return "door:" + str(t.room)
		"item":
			if str(t.facility) != "":
				return str(GameData.facilities[t.facility].point)
			return "item:%s:%s" % [t.room, t.item]
		"linen":
			if str(t.room) != "" and Hotel.rooms.has(t.room):
				return "linen:%d" % int(Hotel.rooms[t.room].floor)
			return "linen:0"
		"washer": return str(t.washer)
		"spill": return "spill:%d" % int(t.spill)
		"cafe_station":
			return "cafe_machine" if GameData.menu[t.menu].get("machine", false) else "cafe_display"
	return at


func step_duration(t: Dictionary, step: Dictionary, speed: float) -> float:
	var base := float(step.t)
	if t.type == "repair":
		var d: Dictionary = GameData.facilities.get(t.facility, {}) if str(t.facility) != "" else GameData.room_items[t.item]
		if base <= 0.0:
			base = float(d.repair_time)
	if t.type in ["clean", "prepare", "turndown"] and Hotel.rooms.has(t.room):
		base *= float(GameData.room_tiers[Hotel.rooms[t.room].tier].clean_mult)
	if t.type in ["checkin", "checkout"] and Hotel.upgrades.has("keycards"):
		base *= 0.7
	if t.type == "cafe_order" and Hotel.upgrades.has("cafe_pro"):
		base *= 0.6
	return max(0.8, base / max(0.2, speed))


func _tasks_at(key: String) -> Array:
	var out := []
	for t in Hotel.tasks:
		if t.assignee != "":
			continue
		var steps: Array = Hotel.task_def(t).steps
		for i in range(int(t.step), steps.size()):
			if resolve_key(t, steps[i].at) == key:
				out.append(t)
				break
	out.sort_custom(func(a, b): return Hotel.task_def(a).priority > Hotel.task_def(b).priority)
	return out


func _current_step() -> Dictionary:
	var t: Dictionary = Hotel.get_task(player_task)
	if t.is_empty():
		return {}
	return Hotel.task_def(t).steps[int(t.step)]


func point_prompt(key: String, pl: Player) -> String:
	if pl.riding:
		return ""
	if player_task >= 0:
		var t: Dictionary = Hotel.get_task(player_task)
		if not t.is_empty():
			var st := _current_step()
			if resolve_key(t, st.at) == key:
				var why := Hotel.blocked_reason(t)
				if why != "":
					return "Impossible : " + why
				var how := "maintenir" if not st.has("minigame") else "mini-jeu"
				return "[E] %s (%s)" % [Hotel.task_label(t, st.verb), how]
	else:
		var list := _tasks_at(key)
		if not list.is_empty():
			var t: Dictionary = list[0]
			var why := Hotel.blocked_reason(t)
			return "[E] Prendre : %s%s" % [Hotel.task_label(t), "  (bloqué : %s)" % why if why != "" else ""]
	# special interactions
	if key.begins_with("elevator_front:"):
		return "[E] Prendre l'ascenseur" + ("" if elevator.is_ok() else " (en panne → escalier de service)")
	if key.begins_with("door:"):
		var rid := key.substr(5)
		var r: Dictionary = Hotel.rooms[rid]
		if not r.unlocked:
			return "[E] Chambre %s à rénover (%s)" % [rid, Hotel.money(Hotel.renovate_cost(rid))]
	if key == "reception_staff" and player_task < 0:
		return "Réception — aucun client à enregistrer"
	return ""


func point_action(key: String, pl: Player) -> void:
	if player_task >= 0:
		var t: Dictionary = Hotel.get_task(player_task)
		if not t.is_empty() and resolve_key(t, _current_step().at) == key:
			_player_do_step(t)
			return
	elif not _tasks_at(key).is_empty():
		var t: Dictionary = _tasks_at(key)[0]
		take_task(int(t.id))
		if player_task >= 0 and resolve_key(t, _current_step().at) == key:
			_player_do_step(t)
		return
	if key.begins_with("elevator_front:"):
		ui.open_elevator(int(key.substr(15)))
	elif key.begins_with("door:"):
		var rid := key.substr(5)
		if not Hotel.rooms[rid].unlocked:
			ui.open_room(rid)


func point_alt_prompt(key: String, _pl: Player) -> String:
	if key.begins_with("door:") or key.begins_with("room:"):
		return "[R] Fiche de la chambre %s" % key.split(":")[1]
	if player_task >= 0:
		return "[R] Abandonner la tâche en cours"
	return ""


func point_alt_action(key: String, _pl: Player) -> void:
	if key.begins_with("door:") or key.begins_with("room:"):
		ui.open_room(key.split(":")[1])
	elif player_task >= 0:
		abandon_task()


func take_task(tid: int) -> void:
	if player_task >= 0:
		abandon_task()
	if not Hotel.claim_task(tid, Hotel.PLAYER):
		toast("Cette tâche vient d'être prise par un collègue.", "warn")
		return
	player_task = tid
	var t: Dictionary = Hotel.get_task(tid)
	toast("Tâche : %s" % Hotel.task_label(t), "info")


func abandon_task() -> void:
	if player_task >= 0:
		Hotel.release_task(player_task)
	player_task = -1
	player.carry("")
	toast("Tâche abandonnée.", "info")


func _on_task_removed(tid: int) -> void:
	if tid == player_task:
		player_task = -1
		player.carry("")


func _player_do_step(t: Dictionary) -> void:
	var why := Hotel.blocked_reason(t)
	if why != "":
		toast("Impossible : " + why, "warn")
		return
	if t.type == "checkin" and not t.has("room_choice"):
		ui.open_checkin(t, func(): _player_do_step(t))
		return
	var st := _current_step()
	var role: String = Hotel.task_def(t).role
	var dur := step_duration(t, st, Hotel.player_speed(role))
	var tid := int(t.id)
	if st.get("minigame", "") != "":
		player.busy = true
		hud.start_minigame(st.minigame, dur, func(mult: float):
			player.busy = false
			_finish_player_step(tid, st, mult))
	else:
		start_hold_action(Hotel.task_label(t, st.verb), dur, func(): _finish_player_step(tid, st, 1.0))


func _finish_player_step(tid: int, st: Dictionary, q: float) -> void:
	var res: Dictionary = Hotel.step_done(tid, Hotel.PLAYER, q)
	if not res.ok:
		toast(res.msg, "warn")
		return
	if res.get("done", false):
		player_task = -1
		player.carry("")
		player.visual.excited = 0.6
		toast(res.msg, "money" if res.msg.contains("+") else "ok")
	else:
		player.carry(str(st.get("carry", "")))
		var t: Dictionary = Hotel.get_task(tid)
		toast("Étape suivante : %s" % Hotel.task_label(t, _current_step().verb), "info")


func start_hold_action(text: String, duration: float, done: Callable) -> void:
	player.busy = true
	hud.start_hold(text, duration, func():
		player.busy = false
		done.call())


## Priority list shown on the left of the screen (filtered by the chosen job).
func priority_list(n := 6) -> Array:
	var out := []
	for t in Hotel.tasks:
		if t.assignee != "" and t.assignee != Hotel.PLAYER:
			continue
		if player_role != "" and not (player_role in Hotel.task_roles(t)):
			continue
		out.append(t)
	out.sort_custom(func(a, b):
		var ba := Hotel.blocked_reason(a) != ""
		var bb := Hotel.blocked_reason(b) != ""
		if ba != bb:
			return bb
		return _score(a) > _score(b))
	return out.slice(0, n)


func _score(t: Dictionary) -> float:
	var s := float(Hotel.task_def(t).priority) * 10.0 + (Hotel.now() - float(t.created)) * 6.0
	if int(t.id) == player_task:
		s += 1000.0
	return s


func cycle_role(dirn := 1) -> void:
	var roles := [""] + GameData.roles.keys()
	var i := roles.find(player_role)
	player_role = roles[(i + dirn + roles.size()) % roles.size()]
	toast("Métier affiché : %s" % role_name(player_role), "info")


func role_name(r: String) -> String:
	return "Directeur (toutes les tâches)" if r == "" else GameData.roles[r].name


func task_place(t: Dictionary) -> String:
	var steps: Array = Hotel.task_def(t).steps
	var key := resolve_key(t, steps[int(t.step)].at)
	var p: Dictionary = layout.point(key)
	var f := int(p.get("floor", 0))
	return "%s, %s" % [Hotel.task_label(t, "{place}") if str(t.place) != "" else "", "RDC" if f == 0 else "ét. %d" % f]


# =====================================================================
#  GPS
# =====================================================================
func gps_target() -> Dictionary:
	var key := ""
	var label := ""
	if player_task >= 0:
		var t: Dictionary = Hotel.get_task(player_task)
		if not t.is_empty():
			key = resolve_key(t, _current_step().at)
			label = Hotel.task_label(t, _current_step().verb)
	elif waypoint_key != "":
		key = waypoint_key
		label = "Repère"
	if key == "":
		return {}
	var p: Dictionary = layout.point(key)
	if p.is_empty():
		return {}
	var f := int(p.floor)
	if f != player.floor:
		var e: Dictionary = layout.point("elevator_front:%d" % player.floor)
		return {"pos": layout.world_pos(player.floor, e.pos), "label": "%s → ascenseur, %s" % [label, GameData.floor_name(f)]}
	return {"pos": layout.world_pos(f, p.pos), "label": label}


func gps_text() -> String:
	var t := gps_target()
	if t.is_empty():
		return ""
	var d: float = Vector2(t.pos.x, t.pos.z).distance_to(Vector2(player.global_position.x, player.global_position.z))
	return "➜ %s — %d m" % [t.label, int(d)]


func _update_arrow(delta: float) -> void:
	var t := gps_target()
	_arrow.visible = not t.is_empty() and not player.riding
	if not _arrow.visible:
		return
	_arrow.global_position = player.global_position + Vector3(0, 2.7, 0)
	var to: Vector3 = t.pos - player.global_position
	to.y = 0
	if to.length() > 0.5:
		_arrow.rotation.y = lerp_angle(_arrow.rotation.y, atan2(to.x, to.z), 8.0 * delta)


# =====================================================================
#  ACTORS
# =====================================================================
func _spawn_guest(gid: String) -> GuestActor:
	var a := GuestActor.new()
	add_child(a)
	a.setup_guest(self, gid, rng)
	guest_actors[gid] = a
	return a


func _on_guest_arrive(gid: String) -> void:
	var a := _spawn_guest(gid)
	a.arrive()


func _on_guest_intent(gid: String, intent: String) -> void:
	for w in walkins:
		if is_instance_valid(w) and w.gid == gid:
			w.handle(intent)
			return
	var a: GuestActor = guest_actors.get(gid)
	if a == null or not is_instance_valid(a):
		if intent == "leave" or intent == "cafe_done" or intent == "concierge_done":
			return
		a = _spawn_guest(gid)
		var g: Dictionary = Hotel.guests.get(gid, {})
		if intent == "return":
			a.place_at("street")
		elif not g.is_empty() and g.room != "":
			a.place_at("room:" + g.room)
		else:
			a.place_at("street")
	if intent == "return":
		a.go_room()
	else:
		a.handle(intent)


func remove_guest_actor(gid: String) -> void:
	var a = guest_actors.get(gid)
	guest_actors.erase(gid)
	if a and is_instance_valid(a):
		elevator.cancel(a)
		a.queue_free()


func remove_walkin(a: GuestActor) -> void:
	walkins.erase(a)
	a.queue_free()


func _spawn_staff(sid: String, at_post: bool) -> void:
	var a := StaffActor.new()
	add_child(a)
	a.setup_staff(self, sid, rng)
	if at_post:
		a.place_at(GameData.roles[Hotel.staff[sid].role].post)
		a.global_position += Vector3(rng.randf_range(-1, 1), 0, rng.randf_range(-1, 1))
	else:
		a.place_at("street")
	staff_actors[sid] = a


func remove_staff_actor(a: StaffActor) -> void:
	staff_actors.erase(a.sid)
	elevator.cancel(a)
	a.queue_free()


func any_actor_near(p: Vector3, r: float) -> bool:
	for a in staff_actors.values():
		if is_instance_valid(a) and abs(a.global_position.y - p.y) < 1.0 and a.global_position.distance_to(p) < r:
			return true
	for a in guest_actors.values():
		if is_instance_valid(a) and abs(a.global_position.y - p.y) < 1.0 and a.global_position.distance_to(p) < r:
			return true
	return false


func is_floor_visible(f: int) -> bool:
	return f == 0 if view_all else f == view_floor


# =====================================================================
#  SPILLS / DECOR / FACILITIES
# =====================================================================
func _on_spill(s: Dictionary) -> void:
	var n := Node3D.new()
	layout.floor_nodes[int(s.floor)].add_child(n)
	n.position = Vector3(float(s.x), 0.04, float(s.z))
	var puddle := MeshFactory.cylinder(n, 0.7, 0.02, Vector3.ZERO, Color(0.45, 0.3, 0.15, 0.85))
	puddle.scale = Vector3(1.3, 1, 0.9)
	MeshFactory.cylinder(n, 0.05, 0.6, Vector3(0.9, 0.3, 0), Color("#ffd60a"), 0.2)
	var key := "spill:%d" % int(s.id)
	layout.add_point(key, int(s.floor), float(s.x) + 0.8, float(s.z))
	Interactable.make(n, Vector3(0, 0.8, 0), 1.8, func(pl): return point_prompt(key, pl), func(pl): point_action(key, pl))
	spill_nodes[int(s.id)] = n


func _on_spill_removed(sid: int) -> void:
	if spill_nodes.has(sid):
		spill_nodes[sid].queue_free()
		spill_nodes.erase(sid)


func _rebuild_decor() -> void:
	for c in decor_root.get_children():
		c.queue_free()
	for e in Hotel.decor:
		var n := Node3D.new()
		decor_root.add_child(n)
		n.position = Vector3(float(e.x), 0, float(e.z))
		n.rotation.y = float(e.rot)
		DecorProps.build(n, e.def)
		n.set_meta("uid", int(e.uid))


func _update_facilities() -> void:
	for fid in facility_labels:
		var l: Label3D = facility_labels[fid]
		var real_fid: String = "stove" if fid == "kitchen" else fid
		if not Hotel.facilities.has(real_fid):
			continue
		var f: Dictionary = Hotel.facilities[real_fid]
		if f.locked:
			l.text = "(non installé)"
			l.modulate = Color("#adb5bd")
		elif not f.ok:
			l.text = "(!) EN PANNE"
			l.modulate = Color("#ff006e")
		elif Hotel.washers.has(fid):
			var w: Dictionary = Hotel.washers[fid]
			match w.state:
				"running":
					var k: float = 1.0 - (float(w.until) - Hotel.now()) / float(GameData.bal("laundry_cycle_hours", 1.5))
					l.text = "Lavage %d%%" % int(clamp(k, 0.0, 1.0) * 100)
				"done": l.text = "Linge prêt à plier"
				_: l.text = "Libre"
			l.modulate = Color("#ffd166")
		else:
			l.text = ""


# =====================================================================
#  LOOP / INPUT
# =====================================================================
func _process(delta: float) -> void:
	_update_sky()
	_update_arrow(delta)
	# which floors to show
	var outside: bool = player.global_position.z > 12.3
	view_all = outside
	view_floor = player.floor
	for f in layout.floor_nodes.size():
		layout.floor_nodes[f].visible = f <= view_floor or view_all
	_tick -= delta
	if _tick <= 0.0:
		_tick = 0.5
		_sync_staff()
		_update_facilities()
		for rn in room_nodes.values():
			rn.interior.visible = Hotel.rooms[rn.rid].unlocked
	_walkin_t -= delta * Clock.time_scale
	if _walkin_t <= 0.0:
		_walkin_t = rng.randf_range(10.0, 26.0)
		var h := Clock.hour()
		var cafe_staffed := Hotel.staff_on_duty("barista") > 0 or (player.floor == 0 and player.global_position.x > 6.0)
		if h >= 7 and h < 20 and walkins.size() < 4 and cafe_q.length() < 5 and cafe_staffed:
			var a := GuestActor.new()
			add_child(a)
			a.setup_guest(self, "w%d" % rng.randi(), rng, true)
			walkins.append(a)
			a.walkin_start()


func _sync_staff() -> void:
	var h := Clock.hour()
	for sid in Hotel.staff:
		if Hotel.on_shift(Hotel.staff[sid], h) and not staff_actors.has(sid):
			_spawn_staff(sid, false)


func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventKey) or not event.pressed or event.echo:
		return
	var k: int = event.physical_keycode
	if k == KEY_ESCAPE:
		if build_mode:
			exit_build_mode()
		elif ui.is_open():
			ui.close()
		else:
			ui.open_pause()
		return
	if ui.is_open() and k != KEY_TAB:
		return
	match k:
		KEY_TAB:
			if ui.is_open():
				ui.close()
			else:
				ui.open_tablet()
		KEY_H:
			ui.open_help()
		KEY_J:
			cycle_role(1)
		KEY_X:
			if player_task >= 0:
				abandon_task()
		KEY_B:
			if build_mode:
				exit_build_mode()
			else:
				enter_build_mode()
		KEY_F5:
			save_game()
		KEY_F9:
			get_parent().load_game()
		KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6:
			var idx := k - KEY_1
			var list := priority_list()
			if idx < list.size():
				var t: Dictionary = list[idx]
				if int(t.id) != player_task:
					take_task(int(t.id))


func enter_build_mode() -> void:
	if player.floor != 0:
		toast("La décoration se place au rez-de-chaussée (lobby, café, salle du personnel).", "warn")
		return
	build_mode = BuildMode.new(self)
	add_child(build_mode)
	player.input_locked = true
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func exit_build_mode() -> void:
	if build_mode:
		build_mode.queue_free()
		build_mode = null
	player.input_locked = ui.is_open()
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


## The player rides the elevator to floor `to`.
func player_ride(to: int) -> void:
	if to == player.floor:
		return
	player.riding = true
	player.visual.visible = false
	player.collision_layer = 0
	var from := player.floor
	hud.ride_text = "Ascenseur : %s → %s…" % [GameData.floor_name(from), GameData.floor_name(to)]
	if not elevator.is_ok():
		hud.ride_text = "Escalier de service : %s → %s…" % [GameData.floor_name(from), GameData.floor_name(to)]
	elevator.request(player, from, to, func():
		player.teleport(to, layout.point("elevator_front:%d" % to).pos + Vector3(0, 0, 0.6))
		player.riding = false
		player.visual.visible = true
		player.collision_layer = 2
		hud.ride_text = "")


func toast(text: String, kind := "info") -> void:
	if hud:
		hud.toast(text, kind)


func _on_day(day: int) -> void:
	if Hotel.history.size() > 0:
		var r: Dictionary = Hotel.history[-1]
		toast("Bilan du jour %d : résultat %s, occupation %d%%, réputation %.1f★" % [int(r.day), Hotel.money(float(r.profit)), int(float(r.occupancy) * 100), float(r.reputation)], "money" if float(r.profit) >= 0 else "warn")
	save_game(true)


func save_state() -> Dictionary:
	return {"player": player.to_dict(), "role": player_role}


func save_game(auto := false) -> void:
	if SaveSystem.save_game():
		toast("Sauvegarde automatique." if auto else "Partie sauvegardée.", "ok")


## Autoload signals hold lambdas bound to this world: disconnect on exit.
func _exit_tree() -> void:
	for src in [Hotel, Clock, Identity]:
		for sig in src.get_signal_list():
			for c in src.get_signal_connection_list(sig.name):
				var cb: Callable = c.callable
				var o = cb.get_object()
				if o == self or (o is Node and is_ancestor_of(o)):
					src.disconnect(sig.name, cb)
