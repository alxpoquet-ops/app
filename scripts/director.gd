extends Node
## Le metteur en scène : ce qui arrive, quand, et dans quel ordre.
## Les textes sont dans story/dialogues.json : ici, seulement la logique.

const Rooms := preload("res://scripts/rooms.gd")

## L'objet qui contient l'indice de chaque boucle.
const CLUES := {"carton": 1, "phone": 2, "mirror": 3, "bed": 4}

var main
var dlg
var _pending := ""
var _buzz_t := 2.0


func say(id: String) -> int:
	return await dlg.play(id)


func has_seq(id: String) -> bool:
	return Game.story.has(id)


## Choisit la meilleure variante d'un texte : objet_c3, objet_after, puis objet.
func pick(id: String) -> String:
	var c := Game.cycle
	var keys := [id + "_c%d" % c]
	if CLUES.has(id) and Game.has("clue_%d" % CLUES[id]):
		keys.append(id + "_after")
	keys.append(id)
	for k in keys:
		if has_seq(k):
			return k
	return "nothing"


func start() -> void:
	Game.cycle = 1
	main.load_room_now("chambre", "", Rooms.START)
	main.apply_mood(true)
	await main.wait(1.0)
	await main.fade_to(0.0, 2.5)
	await say("intro")


# --- Chaque image ------------------------------------------------------------

func tick(delta: float) -> void:
	var sh = main.shadow
	if sh != null and is_instance_valid(sh) and not sh.persist and not sh.vanishing:
		if main.player.g.distance_to(sh.g) < 1.9:
			sh.vanish()
			Game.set_flag("shadow_%d" % Game.cycle)
			_pending = "shadow_gone_c%d" % Game.cycle
	if _pending != "" and not main.busy and not dlg.active and not main.overlay_open:
		var s := _pending
		_pending = ""
		if has_seq(s):
			main.run_seq(s)
	# Le téléphone vibre dans la cuisine tant qu'on ne l'a pas regardé.
	if Game.cycle == 2 and main.room_id == "cuisine" and not Game.has("clue_2"):
		_buzz_t -= delta
		if _buzz_t <= 0.0:
			_buzz_t = 5.0
			main.audio.sfx("buzz")


## L'Autre apparaît à certains endroits, à certaines boucles.
func shadow_for(room: String) -> Dictionary:
	match Game.cycle:
		2:
			if room == "entree" and not Game.has("shadow_2"):
				return {"g": Vector2(5.3, 5.2)}
		3:
			if room == "chambre" and not Game.has("shadow_3"):
				return {"g": Vector2(4.9, 4.9)}
		4:
			if room == "entree" and not Game.has("shadow_met"):
				return {"g": Vector2(4.05, 1.05), "persist": true}
	return {}


func on_enter(room: String) -> void:
	var c := Game.cycle
	if c == 3 and room == "entree" and not Game.has("knocked"):
		Game.set_flag("knocked")
		await main.wait(1.2)
		var ch := await say("knock")
		if ch == 0:
			Game.openness += 1
		await say("knock_answer" if ch == 0 else "knock_still")
		await say("knock_end")
	elif c == Game.CYCLE_DAWN and room == "palier" and not Game.has("palier_seen"):
		Game.set_flag("palier_seen")
		await main.wait(0.6)
		await say("palier_arrive")


# --- Interactions -----------------------------------------------------------

func interact(id: String) -> void:
	var c := Game.cycle
	if id.begins_with("door:"):
		await _door(id.substr(5))
		return
	if id == "front":
		await _front()
		return
	if id == "shadow":
		await _shadow()
		return
	if c == 1 and not Game.has("lantern") and id != "lantern":
		await say("too_dark")
		return
	if c == Game.CYCLE_DARK:
		await say("dark_" + id if has_seq("dark_" + id) else "dark_generic")
		return
	match id:
		"lantern":
			Game.set_flag("lantern")
			main.player.has_lantern = true
			main.rebuild_room()
			main.apply_mood()
			main.audio.sfx("chime")
			await say("lantern")
		"carton":
			await _clue(1, "carton", "carton_open", "carton_closed", "carton_open")
		"phone":
			await _clue(2, "phone", "phone_listen", "phone_hide", "")
		"mirror":
			await _clue(3, "mirror", "mirror_wipe", "mirror_keep", "mirror_wiped")
		"bed":
			if c == 4 and not Game.has("clue_4"):
				await _clue(4, "bed_c4", "photo_look", "photo_leave", "photo_seen")
			else:
				await say(pick("bed"))
		"window":
			await _window()
		"clock":
			await say("clock_late" if c >= 4 else pick("clock"))
		"window_palier":
			await _ending()
		_:
			await say(pick(id))


## Un objet-indice : une question, deux chemins, et le souvenir revient quoi qu'on choisisse.
func _clue(n: int, intro: String, seq_a: String, seq_b: String, open_flag: String) -> void:
	if Game.cycle != n or Game.has("clue_%d" % n):
		await say(pick(intro.trim_suffix("_c4")))
		return
	var ch := await say(intro)
	if ch == 0:
		Game.openness += 1
		if open_flag != "":
			Game.set_flag(open_flag)
	await say(seq_a if ch == 0 else seq_b)
	if has_seq(intro + "_end"):
		await say(intro + "_end")
	Game.set_flag("clue_%d" % n)
	main.audio.sfx("chime")
	main.apply_mood()


func _window() -> void:
	var c := Game.cycle
	if c == 4 and not Game.has("window_ripped"):
		var ch := await say("window_c4")
		if ch == 0:
			Game.set_flag("window_ripped")
			Game.openness += 1
			main.audio.sfx("rip")
			main.rebuild_room()
			main.apply_mood()
			await say("window_rip")
		else:
			await say("window_leave")
	elif c == 4:
		await say("window_open")
	else:
		await say(pick("window"))


func _door(to: String) -> void:
	var d: Dictionary = main.room.door("door:" + to)
	var c := Game.cycle
	if d.get("kind", "") == "closed":
		await say("closed_door")
		return
	if c == 1 and not Game.has("lantern"):
		await say("too_dark")
		return
	if main.room_id == "palier":
		await say("palier_back")
		return
	# Dans la boucle 3, la salle de bain ne veut pas vous laisser partir… la première fois.
	if main.room_id == "sdb" and c == 3 and not Game.has("sdb_loop"):
		Game.set_flag("sdb_loop")
		await main.change_room("sdb", "entree")
		await say("sdb_loop")
		return
	await main.change_room(to, main.room_id)


func _shadow() -> void:
	var ch := await say("shadow_c4")
	await say("shadow_talk" if ch == 0 else "shadow_pass")
	await say("shadow_end")
	Game.set_flag("shadow_met")
	if main.shadow != null and is_instance_valid(main.shadow):
		main.shadow.vanish()


func _front() -> void:
	var c := Game.cycle
	if c == Game.CYCLE_DAWN:
		await main.change_room("palier", "entree")
		return
	if c == 4 and not Game.has("shadow_met"):
		await _shadow()
		return
	if c == Game.CYCLE_DARK and main.lantern_dead:
		await say("front_light")
		await say("handle")
		await main.open_front_door()
		await say("door_open")
		await say("note")
		return
	var ch := await say("front")
	match ch:
		0:
			await say(pick("sign"))
		1:
			if c == Game.CYCLE_DARK:
				await say("lock_dark")
				await _lantern_dies()
			elif Game.has("clue_%d" % c):
				await _leave_cycle()
			else:
				main.audio.sfx("thud")
				await say("lock_fail")
				await say("hint_c%d" % c)


func _leave_cycle() -> void:
	var c := Game.cycle
	await say("leave_c%d" % c)
	main.audio.sfx("creak")
	if c < Game.LAST_CYCLE:
		await main.fade_to(1.0, 1.2, Color.WHITE)
		Game.cycle += 1
		main.load_room_now("chambre", "", Rooms.START)
		main.apply_mood(true)
		await main.wait(0.8)
		await main.fade_to(0.0, 1.4)
		await say("arrive_c%d" % Game.cycle)
	else:
		await main.fake_credits()
		Game.cycle = Game.CYCLE_DARK
		for f in ["carton_open", "mirror_wiped", "photo_seen", "window_ripped"]:
			Game.flags.erase(f)
		main.load_room_now("chambre", "", Rooms.START)
		main.apply_mood(true)
		await main.wait(1.8)
		await main.fade_to(0.0, 0.15)
		await say("dark_arrive")


func _lantern_dies() -> void:
	main.flicker = 1.0
	main.audio.sfx("flicker")
	await main.wait(1.6)
	await say("lantern_flicker")
	main.audio.sfx("flicker")
	await main.wait(0.8)
	main.kill_lantern()
	await main.wait(2.5)
	await say("lantern_dead")
	main.door_speed = 12.0
	main.door_light_target = 24.0
	await main.wait(2.2)
	main.door_speed = 30.0
	await say("light_under_door")


func _ending() -> void:
	if Game.has("ending"):
		return
	Game.set_flag("ending")
	await say("phone_final")
	await say("call")
	await say("openness_high" if Game.openness >= 4 else "openness_low")
	await say("call_end")
	await main.ending()


# --- Test automatique ---------------------------------------------------------
# Joue toute l'histoire, du réveil à l'écran de fin.  « id|0,1 » = interagir avec id
# en répondant 0 puis 1 aux choix qui se présentent.

const AUTOPLAY := [
	"lantern", "carton|0", "door:entree", "front|1",
	"door:entree", "door:cuisine", "phone|1", "door:entree", "front|1",
	"door:entree|0", "tally", "door:sdb", "mirror|0", "door:entree", "door:entree", "front|1",
	"clock", "window|0", "bed|0", "door:entree", "front|1", "front|1",
	"door:entree", "front|1", "front|0",
	"mail", "front", "window_palier|0",
]


func autoplay() -> void:
	dlg.auto = true
	Game.cycle = 1
	main.load_room_now("chambre", "", Rooms.START)
	main.apply_mood(true)
	main.fade.color.a = 0.0
	for step in AUTOPLAY:
		var parts: PackedStringArray = step.split("|")
		var id := parts[0]
		if parts.size() > 1:
			for x in parts[1].split(","):
				dlg.auto_choices.append(int(x))
		var here := false
		for it in main._interactables():
			if it.id == id:
				here = true
		print("> ", id, "   (boucle ", Game.cycle, ", ", main.room_id, ")", "" if here else "   !!! ABSENT DE LA PIÈCE")
		await interact(id)
		if not dlg.auto_choices.is_empty():
			print("   !!! choix non utilisés : ", dlg.auto_choices)
			dlg.auto_choices.clear()
	print("AUTOPLAY TERMINÉ — boucle ", Game.cycle, ", ouverture ", Game.openness)
