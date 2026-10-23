class_name SelfTest
extends Node
## Automated end-to-end checks of the core systems. Run:
##   godot --headless --path game -- --selftest
## Exit code 0 = all passed.

var failures := 0
var checks := 0


func ok(cond: bool, what: String) -> void:
	checks += 1
	if cond:
		print("  PASS  ", what)
	else:
		failures += 1
		print("  FAIL  ", what)


func near0(v: float) -> bool:
	return abs(v) < 0.01


func days(n: int) -> void:
	for i in n * 24:
		Clock.advance(60.0)


func run(main: Node) -> void:
	print("TEST Bourgade Inc. self-test")
	var pid := Identity.local_id()
	Clock.day = 1
	Clock.minutes = 7 * 60.0
	Economy.new_world(7)
	ok(near0(Economy.total_money()), "money conservation after world creation")
	ok(Economy.businesses.size() == 8, "8 starting companies")
	days(5)
	ok(near0(Economy.total_money()), "money conservation after 5 days")
	var sold := 0
	for id in Economy.businesses:
		for h in Economy.businesses[id].history:
			sold += int(h.served)
	ok(sold > 200, "customers served by AI companies over 5 days (%d)" % sold)
	var b2b := 0.0
	for g in Economy.market:
		b2b += float(Economy.market[g].volume_yesterday)
	ok(b2b > 0, "goods flowing between companies (B2B volume %d)" % int(b2b))
	Economy.transfer(Economy.EXTERNAL, "player:" + pid, 6000.0, "test", "test grant")
	var r: Dictionary = Economy.request_found_business(pid, "lot_a", "cafe", "Test Café", "#ff0000", false)
	ok(r.ok, "found a café on a rented lot: " + r.msg)
	var bid: String = r.get("biz_id", "")
	var b: Business = Economy.businesses.get(bid)
	ok(b != null and b.owner_id == pid, "player owns the new company")
	ok(not Economy.request_found_business(pid, "lot_a", "cafe", "Dup", "#ff0000", false).ok, "cannot build twice on the same lot")
	ok(Economy.request_deposit(pid, bid, 1500).ok, "deposit into company")
	ok(not Economy.request_deposit(pid, bid, 999999).ok, "deposit rejected when player can't afford it")
	ok(Economy.request_buy_equipment(pid, bid, "coffee_machine_used", -1.5, -3.6, 0).ok, "buy used coffee machine")
	ok(Economy.request_buy_equipment(pid, bid, "display_case", 1.5, -3.6, 0).ok, "buy display case")
	ok(not Economy.request_buy_equipment(pid, bid, "plant", 30, 30, 0).ok, "equipment outside the building rejected")
	ok(not Economy.request_buy_equipment("intruder", bid, "plant", 0, 0, 0).ok, "non-owner cannot buy equipment")
	var o: Dictionary = Economy.request_order(pid, bid, "roasted_coffee", 50, Economy.suppliers_for("roasted_coffee", b, 50)[0].id)
	ok(o.ok, "order roasted coffee: " + o.msg)
	Economy.request_order(pid, bid, "milk", 40, Economy.suppliers_for("milk", b, 40)[0].id)
	Economy.request_order(pid, bid, "croissant", 30, Economy.suppliers_for("croissant", b, 30)[0].id)
	for i in 4:
		Clock.advance(60.0)
	ok(b.qty("roasted_coffee") >= 40, "delivery arrived (coffee stock %d)" % int(b.qty("roasted_coffee")))
	ok(Economy.request_hire(pid, bid, 0).ok and b.employees.size() == 1, "hire a barista")
	var before := Economy.biz_cash(bid)
	var s: Dictionary = Economy.request_live_serve(pid, bid, "cappuccino", 1.2, Economy.POPULATION)
	ok(s.ok and Economy.biz_cash(bid) > before, "live serve: owner sells a cappuccino")
	# barista job at an AI café
	var cash0 := Economy.player_cash(pid)
	ok(Economy.request_start_shift(pid, "cafe_coin").ok, "start barista shift at an AI café")
	Economy.businesses["cafe_coin"].stock["roasted_coffee"] = 50.0
	var s2: Dictionary = Economy.request_live_serve(pid, "cafe_coin", "espresso", 1.25, Economy.POPULATION)
	ok(s2.ok and Economy.player_cash(pid) > cash0, "barista paid per order + tip (+%.2f)" % (Economy.player_cash(pid) - cash0))
	Economy.request_end_shift(pid)
	# harvest job
	var cash1 := Economy.player_cash(pid)
	ok(Economy.request_harvest(pid, "farm_cafe", 6).ok and Economy.player_cash(pid) > cash1, "harvest job pays")
	# delivery job
	var jobs := Economy.open_delivery_jobs()
	if jobs.is_empty():
		Economy.request_order(pid, bid, "milk", 30, "port")
		jobs = Economy.open_delivery_jobs()
	ok(not jobs.is_empty(), "delivery jobs available")
	if not jobs.is_empty():
		var oid := int(jobs[0].id)
		var cash2 := Economy.player_cash(pid)
		ok(Economy.request_take_delivery(pid, oid).ok, "take delivery job")
		ok(not Economy.request_take_delivery(pid, oid).ok, "cannot take a second delivery")
		ok(Economy.request_complete_delivery(pid, oid).ok and Economy.player_cash(pid) > cash2, "deliver and get paid")
	# acquisition
	var target: Business = Economy.businesses["cafe_kawa"]
	var low: Dictionary = Economy.request_offer(pid, "cafe_kawa", 10)
	ok(not low.ok, "lowball offer refused")
	ok(not Economy.request_offer(pid, "cafe_kawa", 999999).ok, "anti-spam cooldown blocks immediate re-offer")
	Clock.advance(70.0)
	var price: float = target.asking_price if target.for_sale else Economy.valuation(target) * 1.2
	Economy.transfer(Economy.EXTERNAL, "player:" + pid, price + 100.0, "test", "test grant")
	var acq: Dictionary = Economy.request_offer(pid, "cafe_kawa", price + 1.0)
	ok(acq.ok and target.owner_id == pid, "buy an AI company: " + acq.msg)
	ok(near0(Economy.total_money()), "money conservation after player actions")
	# save / load round-trip through JSON
	var snapshot := JSON.stringify({"clock": Clock.to_dict(), "economy": Economy.to_dict()})
	var parsed: Dictionary = JSON.parse_string(snapshot)
	var cash_before := Economy.biz_cash(bid)
	var n_before := Economy.businesses.size()
	Economy.from_dict(parsed.economy)
	ok(Economy.businesses.size() == n_before and abs(Economy.biz_cash(bid) - cash_before) < 0.01, "save/load round-trip")
	ok(Economy.businesses[bid].equipment.size() == 2, "equipment restored after load")
	days(10)
	ok(near0(Economy.total_money()), "money conservation after 10 more days")
	var bb: Business = Economy.businesses[bid]
	var served := 0
	for h in bb.history:
		served += int(h.served)
	ok(served > 0, "player café serves customers while player is away (%d)" % served)
	print("  INFO  player café: cash %s, debt %s, reputation %d, last profit %s" % [Economy.money(Economy.biz_cash(bid)), Economy.money(bb.debt), int(bb.reputation), Economy.money(float(bb.history[-1].profit))])
	for h in bb.history.slice(-3):
		print("  INFO  day %d served %d lost %d (cap %d) detail %s" % [h.day, h.served, h.lost, h.get("lost_capacity", 0), h.detail])
	for id in Economy.businesses:
		var x: Business = Economy.businesses[id]
		print("  INFO  %-26s owner=%-12s cash=%9s debt=%7s staff=%d rep=%d %s" % [x.name, "IA" if x.is_ai() else "joueur", Economy.money(Economy.biz_cash(id)), Economy.money(x.debt), x.employees.size(), int(x.reputation), x.status_label()])
	# --- scene test: build the 3D world and run frames
	print("TEST world scene")
	var w := World.new()
	main.add_child(w)
	w.build({})
	for i in 30:
		await get_tree().process_frame
	ok(w.buildings.size() == Economy.businesses.size(), "one building per company")
	ok(w.player != null and w.player.is_inside_tree(), "player spawned")
	Clock.advance(60.0)
	for i in 120:
		await get_tree().physics_frame
	var live := Economy.live_businesses.size()
	ok(live >= 1, "cafés near the player are simulated live (%d)" % live)
	w.ui.open_business("cafe_coin")
	await get_tree().process_frame
	ok(w.ui.is_open(), "business window opens")
	w.ui.close()
	w.ui.open_business(bid)
	await get_tree().process_frame
	w.ui.close()
	w.ui.open_phone(0)
	await get_tree().process_frame
	w.ui.open_map()
	await get_tree().process_frame
	w.ui.close()
	w.ui.open_found_dialog("lot_b")
	await get_tree().process_frame
	w.ui.close()
	await _gameplay_barista(w)
	await _gameplay_delivery(w)
	await _gameplay_misc(w)
	ok(SaveSystem.save_game("selftest"), "save game to disk")
	ok(not SaveSystem.read_save("selftest").is_empty(), "read save from disk")
	# full load path: tear down the world and rebuild it from the save
	SaveSystem.save_game()
	var biz_count := Economy.businesses.size()
	main.world = w
	main.load_game()
	for i in 20:
		await get_tree().process_frame
	ok(main.world != null and main.world != w and main.world.buildings.size() == biz_count, "load game rebuilds the world")
	Clock.advance(60.0)
	for i in 30:
		await get_tree().process_frame
	ok(near0(Economy.total_money()), "money conservation after load + 1h")
	print("TEST done: %d checks, %d failures" % [checks, failures])
	get_tree().quit(1 if failures > 0 else 0)


## Plays the barista loop through the real scene nodes: customer walks in,
## player brews at the machine (mini-game), carries the cup, serves at the counter.
func _gameplay_barista(w: World) -> void:
	print("TEST gameplay: barista loop")
	var pid := Identity.local_id()
	var bb: BusinessBuilding = w.buildings["cafe_coin"]
	var b: Business = bb.biz()
	# Reproduce the real situation: AI baristas are present while the player works.
	while b.employees.size() < 2:
		b.employees.append(Economy._make_candidate(b, 1.0))
	b.stock["roasted_coffee"] = 50.0
	b.stock["milk"] = 50.0
	Economy.live_businesses["cafe_coin"] = 0
	var p := w.player
	p.global_position = bb.to_global(Vector3(0, 0.2, -3.0))
	ok(Economy.request_start_shift(pid, "cafe_coin").ok, "start shift from the scene")
	var svc := bb.service
	for n in svc.customers.duplicate():
		n.queue_free()
	svc.customers.clear()
	svc._spawn_customer({"profile": "gourmet", "item": "espresso", "payer": Economy.POPULATION, "category": "cafe", "origin": Vector2.ZERO})
	var t := 0.0
	while t < 12.0 and (svc.customers.is_empty() or svc.customers[0].state != "ordering"):
		await get_tree().create_timer(0.25).timeout
		t += 0.25
	ok(not svc.customers.is_empty() and svc.customers[0].state == "ordering", "customer walked to the counter and ordered")
	ok(svc.workers.size() == 1, "player on shift replaces one AI barista (%d visible)" % svc.workers.size())
	ok(svc.customers.size() > 0 and svc.customers[0].data.claimed == null, "AI baristas leave the fresh order to the player")
	var machine: EquipmentNode = null
	for e in bb.equipment_nodes:
		if GameData.equip(e.def_id).category == "machine":
			machine = e
	ok(machine != null and machine._machine_prompt(p).begins_with("[E]"), "machine offers to brew: " + (machine._machine_prompt(p) if machine else "none"))
	if machine == null:
		return
	machine._machine_action(p)
	ok(p.busy and w.hud.is_minigame_active(), "brew mini-game started")
	t = 0.0
	while w.hud._brew_state.get("phase", "") != "aim" and t < 10.0:
		await get_tree().create_timer(0.1).timeout
		t += 0.1
	w.hud._brew_state.needle = w.hud._brew_state.zone_x + w.hud._brew_state.zone_w / 2.0 - 3.0
	w.hud._finish_brew()
	ok(p.carrying.get("item", "") == "espresso", "player carries the espresso")
	var cash := Economy.player_cash(pid)
	ok(svc.counter_prompt(p).begins_with("[E] Servir"), "counter offers to serve: " + svc.counter_prompt(p))
	svc.counter_action(p)
	ok(Economy.player_cash(pid) > cash and p.carrying.is_empty(), "served: player earned %.2f (wage + tip)" % (Economy.player_cash(pid) - cash))
	Economy.request_end_shift(pid)


func _gameplay_delivery(w: World) -> void:
	print("TEST gameplay: physical delivery")
	var pid := Identity.local_id()
	var b: Business = Economy.businesses["cafe_coin"]
	var o: Dictionary = Economy._create_order(b, "roast_or", "roasted_coffee", 20)
	if o.is_empty():
		Economy.businesses["roast_or"].stock["roasted_coffee"] = 100.0
		o = Economy._create_order(b, "roast_or", "roasted_coffee", 20)
	ok(not o.is_empty(), "order created for delivery")
	var r: Dictionary = Economy.request_take_delivery(pid, int(o.id))
	ok(r.ok, "accept delivery from the phone")
	w.spawn_job_crate(r.order)
	var crate: Crate = w._job_crate
	ok(crate != null and crate._prompt(w.player) != "", "crate waits at the roastery dock")
	crate._pick(w.player)
	ok(w.player.carrying.get("type", "") == "crate", "crate picked up")
	var stock_before := b.qty("roasted_coffee")
	var cash := Economy.player_cash(pid)
	var bb: BusinessBuilding = w.buildings["cafe_coin"]
	ok(bb._dock_prompt(w.player).begins_with("[E] Livrer"), "buyer dock accepts the crate")
	bb._dock_action(w.player)
	ok(b.qty("roasted_coffee") >= stock_before + 20 and Economy.player_cash(pid) > cash, "goods delivered, carrier paid %.2f" % (Economy.player_cash(pid) - cash))


func _gameplay_misc(w: World) -> void:
	print("TEST gameplay: vehicle & harvest")
	var p := w.player
	p.global_position = w.car.global_position + Vector3(-2, 0, 0)
	ok(w.nearest_vehicle(p.global_position, 3.5) == w.car, "car is reachable")
	w.car.enter_vehicle(p)
	for i in 10:
		await get_tree().physics_frame
	ok(p.vehicle == w.car, "player drives the car")
	w.car.exit_vehicle(p)
	ok(p.vehicle == null and p.visual.visible, "player leaves the car")
	var plant: HarvestPlant = null
	for c in w.buildings["farm_cafe"].get_children():
		if c is HarvestPlant:
			plant = c
			break
	plant.ripe_at = 0.0
	p.global_position = plant.global_position + Vector3(0.5, 0.2, 0)
	var cash := Economy.player_cash()
	var beans: float = Economy.businesses["farm_cafe"].qty("coffee_beans")
	plant._pick(p)
	await get_tree().create_timer(1.6).timeout
	ok(Economy.player_cash() > cash and Economy.businesses["farm_cafe"].qty("coffee_beans") > beans - 1.0 and not plant.is_ripe(), "harvesting pays the picker and stocks the farm")
