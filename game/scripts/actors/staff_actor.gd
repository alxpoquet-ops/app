class_name StaffActor
extends Actor
## An employee: follows its shift, takes the most urgent task of its job
## (or helps another team when idle), walks there (elevator included),
## works, rests when tired.

var sid := ""
var task_id := -1
var state := "idle"        # idle | to_post | to_step | working | to_break | resting | leaving
var work_t := 0.0
var work_total := 1.0
var _think := 0.0
var _rest_until := 0.0
var _at_post := false


func setup_staff(w: Node, staff_id: String, rng: RandomNumberGenerator) -> void:
	sid = staff_id
	var st: Dictionary = Hotel.staff[sid]
	var role: Dictionary = GameData.roles[st.role]
	setup_actor(w, rng, Color(str(role.outfit)), Color(str(role.hat)) if str(role.hat) != "" else Color(0, 0, 0, 0), 1.0)
	move_speed = 3.2 * (1.15 if "rapide" in st.traits else 1.0)


func st() -> Dictionary:
	return Hotel.staff.get(sid, {})


func _process(delta: float) -> void:
	super._process(delta)
	var s := st()
	if s.is_empty():
		if state != "leaving":
			_abort()
			_leave()
		return
	s["status"] = state
	var dt := delta * Clock.time_scale
	if task_id >= 0:
		var t: Dictionary = Hotel.get_task(task_id)
		if t.is_empty() or t.assignee != sid:
			_abort()
			return
	match state:
		"working":
			work_t -= dt
			bubble.text = "%s %d%%" % [_verb(), int(100.0 * (1.0 - work_t / work_total))]
			bubble.visible = true
			if work_t <= 0.0:
				_finish_step()
		"resting":
			if Hotel.now() >= _rest_until:
				s.energy = 100.0
				state = "idle"
				say("Au boulot !", 1.5)
		"idle", "to_post":
			_think -= dt
			if _think <= 0.0:
				_think = 0.4
				_decide(s)


func _decide(s: Dictionary) -> void:
	if not Hotel.on_shift(s, Clock.hour()):
		_leave()
		return
	if float(s.energy) < 25.0:
		state = "to_break"
		say("Pause…", 2.0)
		go_point("staff_room", func():
			state = "resting"
			_rest_until = Hotel.now() + 1.0, _jitter())
		return
	var t: Dictionary = Hotel.next_task_for(sid)
	if not t.is_empty() and Hotel.claim_task(int(t.id), sid):
		task_id = int(t.id)
		_at_post = false
		_start_step()
		return
	if state == "idle" and not _at_post:
		state = "to_post"
		go_point(GameData.roles[s.role].post, func():
			_at_post = true
			state = "idle", _jitter())


func _jitter() -> Vector3:
	var h := float(abs(sid.hash()) % 100) / 100.0
	return Vector3((h - 0.5) * 2.0, 0, (fmod(h * 7.0, 1.0) - 0.5) * 1.5)


func _step() -> Dictionary:
	var t: Dictionary = Hotel.get_task(task_id)
	return Hotel.task_def(t).steps[int(t.step)]


func _verb() -> String:
	var t: Dictionary = Hotel.get_task(task_id)
	if t.is_empty():
		return ""
	return Hotel.task_label(t, _step().verb)


func _start_step() -> void:
	var t: Dictionary = Hotel.get_task(task_id)
	var key: String = world.resolve_key(t, _step().at)
	state = "to_step"
	go_point(key, _arrived)


func _arrived() -> void:
	if task_id < 0:
		return
	var t: Dictionary = Hotel.get_task(task_id)
	if t.is_empty():
		_abort()
		return
	work_total = world.step_duration(t, _step(), Hotel.staff_speed(st()))
	work_t = work_total
	state = "working"
	var key: String = world.resolve_key(t, _step().at)
	var p: Dictionary = world.layout.point(key)
	if not p.is_empty():
		face(world.layout.world_pos(int(p.floor), p.pos) + Vector3(0, 0, -0.01))


func _finish_step() -> void:
	var step := _step()
	var q: float = clamp(0.85 + 0.25 * float(st().skill), 0.8, 1.25)
	var res: Dictionary = Hotel.step_done(task_id, sid, q)
	bubble.visible = false
	if not res.ok:
		Hotel.release_task(task_id)
		task_id = -1
		drop()
		state = "idle"
		say("Impossible…", 1.5, Color("#ff8fa3"))
		return
	if res.get("done", false):
		task_id = -1
		drop()
		state = "idle"
		_at_post = false
		return
	carry(str(step.get("carry", "")))
	_start_step()


func _abort() -> void:
	if task_id >= 0:
		Hotel.release_task(task_id)
	task_id = -1
	drop()
	stop()
	bubble.visible = false
	state = "idle"
	_at_post = false


func _leave() -> void:
	if state == "leaving":
		return
	_abort()
	state = "leaving"
	go_point("street", func(): world.remove_staff_actor(self))
