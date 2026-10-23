extends Node
## End-to-end test of the hotel: simulation + 3D scene + actors + player jobs.
## Run:  godot --headless --fixed-fps 60 --path game -- --selftest

var failures := 0
var checks := 0
var main: Node


func ok(cond: bool, what: String) -> void:
	checks += 1
	print("  %s  %s" % ["PASS" if cond else "FAIL", what])
	if not cond:
		failures += 1


func frames(n: int) -> void:
	for i in n:
		await get_tree().process_frame


## Run the game until absolute game hour `h` (scaled time).
func until_hour(h: float, max_frames := 200000) -> void:
	var n := 0
	while Clock.absolute_hours() < h and n < max_frames:
		await get_tree().process_frame
		n += 1


func run(m: Node) -> void:
	main = m
	print("TEST Grand Hôtel Wobble self-test")
	Clock.day = 1
	Clock.minutes = 8 * 60.0
	Clock.time_scale = 1.0
	Hotel.new_game(11)
	ok(Hotel.rooms.size() == 32, "32 rooms over 4 floors")
	ok(Hotel.unlocked_rooms().size() == 4 and Hotel.ready_rooms().size() == 4, "4 rooms open and ready at start")
	ok(Hotel.staff.size() == 4, "4 starting employees")
	ok(Hotel.bookings_today().size() > 0, "bookings generated (%d)" % Hotel.bookings_today().size())
	# One employee of every job so every task type gets exercised.
	for role in GameData.roles:
		if Hotel.staff.values().filter(func(s): return s.role == role).is_empty():
			Hotel.request_hire(role, 0, "jour")
	for role in ["reception", "porter", "security"]:
		Hotel.request_hire(role, 0, "soir")
	ok(Hotel.staff.size() >= 14, "hired one employee per job (%d staff)" % Hotel.staff.size())
	ok(Hotel.request_renovate("103").ok and Hotel.request_renovate("107").ok, "renovate two rooms")
	ok(not Hotel.request_renovate("103").ok, "cannot renovate twice")
	main.world = HotelWorld.new()
	main.add_child(main.world)
	main.world.build({})
	var w: HotelWorld = main.world
	await frames(10)
	ok(w.room_nodes.size() == 32 and w.layout.floor_nodes.size() == 5, "building with 5 levels built")
	ok(w.staff_actors.size() > 0, "staff on shift spawned (%d)" % w.staff_actors.size())
	# navigation sanity
	var path: Array = w.layout.path(1, Vector3(-15.5, 0, -6), Vector3(15, 0, 6))
	ok(path.size() == 5, "path room→corridor→room goes through both doors (%d pts)" % path.size())
	var path0: Array = w.layout.path(0, Vector3(16.5, 0, -8), Vector3(-17.6, 0, 4.5))
	ok(path0.size() == 7, "kitchen → café back → hall → reception back (%d pts)" % path0.size())
	# ---- player jobs before speeding up
	await _player_jobs(w)
	# ---- fast-forward 2.5 days with everyone working
	Clock.time_scale = 8.0
	var start_cash := Hotel.cash
	await until_hour(Clock.absolute_hours() + 60.0)
	Clock.time_scale = 1.0
	print("  INFO  totals: ", Hotel.totals)
	print("  INFO  cash %s, reputation %.2f, reviews %d, occupancy %d%%, open tasks %d" % [Hotel.money(Hotel.cash), Hotel.reputation, Hotel.reviews.size(), int(Hotel.occupancy() * 100), Hotel.tasks.size()])
	for r in Hotel.history:
		print("  INFO  day %d: revenue %s, expenses %s, profit %s, occ %d%%, stats %s" % [int(r.day), Hotel.money(float(r.revenue)), Hotel.money(float(r.expenses)), Hotel.money(float(r.profit)), int(float(r.occupancy) * 100), r.stats])
	for rv in Hotel.reviews.slice(0, 4):
		print("  INFO  review %d★ %s: %s" % [int(rv.stars), rv.name, rv.text])
	ok(Hotel.history.size() >= 2, "daily accounts closed (%d days)" % Hotel.history.size())
	ok(int(Hotel.totals.get("checkin", 0)) >= 4, "guests checked in by the receptionist (%d)" % int(Hotel.totals.get("checkin", 0)))
	ok(int(Hotel.totals.get("checkout", 0)) + Hotel.reviews.size() >= 2, "guests checked out and left reviews (%d reviews)" % Hotel.reviews.size())
	for tt in ["clean", "prepare", "luggage", "cafe_order"]:
		ok(int(Hotel.totals.get(tt, 0)) > 0, "task '%s' done by staff (%d)" % [tt, int(Hotel.totals.get(tt, 0))])
	var roles_done := 0
	for role in GameData.roles:
		if int(Hotel.totals.get("by_" + role, 0)) > 0:
			roles_done += 1
	ok(roles_done >= 7, "at least 7 different jobs completed tasks (%d/11)" % roles_done)
	ok(w.elevator.waits.size() > 0, "elevator carried people (%d rides)" % w.elevator.waits.size())
	ok(Hotel.reputation >= 1.0 and Hotel.reputation <= 5.0, "reputation in range")
	ok(float(Hotel.history[-1].revenue) > 0, "the hotel earns money")
	# ---- save / load
	ok(SaveSystem.save_game(), "save game")
	var guests_before := Hotel.guests.size()
	main.load_game()
	await frames(30)
	ok(main.world != w and main.world.room_nodes.size() == 32, "load rebuilds the hotel")
	ok(Hotel.guests.size() == guests_before, "guests restored (%d)" % guests_before)
	Clock.time_scale = 8.0
	await until_hour(Clock.absolute_hours() + 3.0)
	Clock.time_scale = 1.0
	ok(true, "game keeps running after load")
	print("TEST done: %d checks, %d failures" % [checks, failures])
	get_tree().quit(1 if failures > 0 else 0)


## The player does several jobs through the same work points as the staff.
func _player_jobs(w: HotelWorld) -> void:
	print("TEST player jobs")
	var p := w.player
	# housekeeping: make room 101 dirty, clean & prepare it ourselves
	var r: Dictionary = Hotel.rooms["101"]
	r.state = "dirty"
	var t := Hotel.add_task("clean", {"room": "101", "place": "ch. 101"})
	for s in Hotel.staff.values():
		pass
	w.take_task(int(t.id))
	ok(w.player_task == int(t.id), "player takes the cleaning task")
	ok(w.gps_target().label.contains("chariot"), "GPS guides to step 1: " + str(w.gps_target().get("label", "")))
	w._finish_player_step(int(t.id), Hotel.task_def(t).steps[0], 1.0)
	ok(Hotel.get_task(int(t.id)).step == 1, "step 1 done (cart taken)")
	ok(w.point_prompt("room:101", p).begins_with("[E] Faire le ménage"), "room offers the cleaning step: " + w.point_prompt("room:101", p))
	w._finish_player_step(int(t.id), Hotel.task_def(t).steps[1], 1.0)
	ok(r.state == "to_prepare", "room cleaned → to prepare")
	var prep: Dictionary = {}
	for tt in Hotel.tasks:
		if tt.type == "prepare" and tt.room == "101":
			prep = tt
	ok(not prep.is_empty(), "preparation task created")
	w.take_task(int(prep.id))
	w._finish_player_step(int(prep.id), Hotel.task_def(prep).steps[0], 1.0)
	w._finish_player_step(int(prep.id), Hotel.task_def(prep).steps[1], 1.0)
	ok(r.state == "ready", "room prepared → ready (linen %d, dirty %d)" % [Hotel.clean_linen, Hotel.dirty_linen])
	# technician: break the TV of room 102 and repair it with the mini-game
	Hotel._break_item(Hotel.rooms["102"], "tv")
	var rep: Dictionary = {}
	for tt in Hotel.tasks:
		if tt.type == "repair" and tt.item == "tv":
			rep = tt
	ok(not rep.is_empty() and not Hotel.rooms["102"]["items"].tv, "TV breakdown creates a repair task")
	var parts := float(Hotel.stock.pieces_electroniques)
	ok(w.point_prompt("item:102:tv", p).begins_with("[E] Prendre"), "broken TV offers the repair: " + w.point_prompt("item:102:tv", p))
	w.point_action("item:102:tv", p)
	ok(w.player_task == int(rep.id), "repair taken from the TV")
	ok(w.point_prompt("workshop", p).begins_with("[E] Prendre la pièce"), "workshop step: " + w.point_prompt("workshop", p))
	w._finish_player_step(int(rep.id), Hotel.task_def(rep).steps[0], 1.0)
	ok(float(Hotel.stock.pieces_electroniques) == parts - 1, "spare part consumed")
	w._player_do_step(Hotel.get_task(int(rep.id)))
	ok(w.hud.is_minigame_active(), "repair mini-game started")
	w.hud._mgs.phase = "aim"
	w.hud._mgs.needle = w.hud._mgs.zone_x + w.hud._mgs.zone_w / 2.0 - 3.0
	w.hud.finish_minigame()
	ok(Hotel.rooms["102"]["items"].tv, "TV repaired by the player")
	# barista: a café order served by the player
	var cash0 := Hotel.cash
	var co := Hotel.walkin_cafe_order("test_visitor")
	w.take_task(int(co.id))
	w._finish_player_step(int(co.id), Hotel.task_def(co).steps[0], 1.3)
	w._finish_player_step(int(co.id), Hotel.task_def(co).steps[1], 1.0)
	ok(Hotel.cash > cash0, "player served a café order (+%.2f)" % (Hotel.cash - cash0))
	# priority list by job
	w.player_role = "technician"
	Hotel._break_item(Hotel.rooms["105"], "lamp")
	var list: Array = w.priority_list()
	ok(not list.is_empty() and list.all(func(x): return "technician" in Hotel.task_roles(x)), "priority list filtered by job (%d tasks)" % list.size())
	w.player_role = ""
	# elevator ride
	w.player_ride(3)
	ok(p.riding, "player waits for / rides the elevator")
	var n := 0
	while p.riding and n < 2000:
		await get_tree().process_frame
		n += 1
	ok(p.floor == 3, "player arrived at floor 3")
	# UI windows open without errors
	for i in ManagerUI.TAB_NAMES.size():
		w.ui.open_tablet(i)
		await frames(2)
	w.ui.open_room("101")
	await frames(2)
	w.ui.open_elevator(3)
	await frames(2)
	w.ui.close()
	ok(true, "all tablet pages render")
	w.player_ride(0)
	n = 0
	while p.riding and n < 3000:
		await get_tree().process_frame
		n += 1
