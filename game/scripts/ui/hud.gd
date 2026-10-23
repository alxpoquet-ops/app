class_name HUD
extends CanvasLayer
## In-game overlay: stats bar on top, priority to-do list on the left
## (filtered by the job you play), prompts, toasts, mini-games.

var world: Node
var ride_text := ""
var _stats: HBoxContainer
var _stat_labels := {}
var _todo_title: Label
var _todo_box: VBoxContainer
var _prompt: Label
var _alt: Label
var _gps: Label
var _ride: Label
var _event: Label
var _toasts: VBoxContainer
var _mg: PanelContainer
var _mg_title: Label
var _mg_bar: ColorRect
var _mg_zone: ColorRect
var _mg_needle: ColorRect
var _hold: PanelContainer
var _hold_label: Label
var _hold_bar: ProgressBar
var _hold_state := {}
var _refresh_t := 0.0

const STAT_KEYS := ["cash", "profit", "occ", "rep", "guests", "arrivals", "tasks", "staff", "time"]


func _init(w: Node) -> void:
	world = w
	layer = 5


func _ready() -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.theme = UITheme.theme()
	add_child(root)
	# ---- top stats bar
	var top := PanelContainer.new()
	top.add_theme_stylebox_override("panel", UITheme.box(Color(0.06, 0.08, 0.12, 0.88), 0, 14, 6))
	top.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(top)
	_stats = HBoxContainer.new()
	_stats.add_theme_constant_override("separation", 26)
	_stats.alignment = BoxContainer.ALIGNMENT_CENTER
	top.add_child(_stats)
	for k in STAT_KEYS:
		var v := VBoxContainer.new()
		v.add_theme_constant_override("separation", -2)
		_stats.add_child(v)
		var cap := UITheme.label("", 12, UITheme.MUTED)
		var val := UITheme.label("", 19, Color.WHITE)
		v.add_child(cap)
		v.add_child(val)
		_stat_labels[k] = [cap, val]
	_event = UITheme.label("", 16, Color("#4cc9f0"))
	_event.set_anchors_preset(Control.PRESET_CENTER_TOP)
	_event.position = Vector2(-400, 60)
	_event.size = Vector2(800, 24)
	_event.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(_event)
	_gps = UITheme.label("", 17, Color("#4cc9f0"))
	_gps.set_anchors_preset(Control.PRESET_CENTER_TOP)
	_gps.position = Vector2(-400, 84)
	_gps.size = Vector2(800, 24)
	_gps.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(_gps)
	# ---- left priority list
	var left := PanelContainer.new()
	left.add_theme_stylebox_override("panel", UITheme.box(Color(0.06, 0.08, 0.12, 0.82), 10, 12, 10))
	left.position = Vector2(12, 74)
	left.custom_minimum_size = Vector2(390, 0)
	left.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(left)
	var lv := VBoxContainer.new()
	lv.add_theme_constant_override("separation", 4)
	left.add_child(lv)
	_todo_title = UITheme.label("", 16, UITheme.ACCENT)
	lv.add_child(_todo_title)
	_todo_box = VBoxContainer.new()
	_todo_box.add_theme_constant_override("separation", 3)
	lv.add_child(_todo_box)
	lv.add_child(UITheme.label("1-6 : prendre • X : abandonner • J : changer de métier", 12, UITheme.MUTED))
	# ---- prompts
	_prompt = UITheme.label("", 21, Color.WHITE)
	_prompt.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	_prompt.position = Vector2(-500, -120)
	_prompt.size = Vector2(1000, 32)
	_prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(_prompt)
	_alt = UITheme.label("", 16, Color("#ffd166"))
	_alt.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	_alt.position = Vector2(-500, -88)
	_alt.size = Vector2(1000, 26)
	_alt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(_alt)
	_ride = UITheme.label("", 24, Color("#ffd166"))
	_ride.set_anchors_preset(Control.PRESET_CENTER)
	_ride.position = Vector2(-400, -20)
	_ride.size = Vector2(800, 40)
	_ride.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(_ride)
	var hint := UITheme.label("Tab : tablette de gestion • B : décorer • H : aide • Échap : menu", 13, Color(1, 1, 1, 0.55))
	hint.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	hint.position = Vector2(14, -28)
	root.add_child(hint)
	# ---- toasts (bottom right)
	_toasts = VBoxContainer.new()
	_toasts.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	_toasts.position = Vector2(-540, -340)
	_toasts.size = Vector2(520, 300)
	_toasts.alignment = BoxContainer.ALIGNMENT_END
	_toasts.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_toasts)
	_build_minigame(root)
	_build_hold(root)


func _build_minigame(root: Control) -> void:
	_mg = PanelContainer.new()
	_mg.add_theme_stylebox_override("panel", UITheme.box(Color(0.06, 0.08, 0.12, 0.92), 12))
	_mg.set_anchors_preset(Control.PRESET_CENTER)
	_mg.position = Vector2(-230, 70)
	_mg.custom_minimum_size = Vector2(460, 100)
	root.add_child(_mg)
	var v := VBoxContainer.new()
	_mg.add_child(v)
	_mg_title = UITheme.label("", 17, Color.WHITE)
	_mg_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(_mg_title)
	var track := Control.new()
	track.custom_minimum_size = Vector2(440, 34)
	v.add_child(track)
	_mg_bar = ColorRect.new()
	_mg_bar.size = Vector2(440, 34)
	track.add_child(_mg_bar)
	_mg_zone = ColorRect.new()
	_mg_zone.color = Color("#2dc653")
	track.add_child(_mg_zone)
	_mg_needle = ColorRect.new()
	_mg_needle.color = Color.WHITE
	_mg_needle.size = Vector2(6, 42)
	_mg_needle.position.y = -4
	track.add_child(_mg_needle)
	_mg.visible = false


func _build_hold(root: Control) -> void:
	_hold = PanelContainer.new()
	_hold.add_theme_stylebox_override("panel", UITheme.box(Color(0.06, 0.08, 0.12, 0.92), 10))
	_hold.set_anchors_preset(Control.PRESET_CENTER)
	_hold.position = Vector2(-200, 80)
	_hold.custom_minimum_size = Vector2(400, 60)
	root.add_child(_hold)
	var v := VBoxContainer.new()
	_hold.add_child(v)
	_hold_label = UITheme.label("", 16, Color.WHITE)
	v.add_child(_hold_label)
	_hold_bar = ProgressBar.new()
	_hold_bar.custom_minimum_size = Vector2(380, 18)
	_hold_bar.show_percentage = false
	v.add_child(_hold_bar)
	_hold.visible = false


func set_prompt(text: String, alt: String) -> void:
	_prompt.text = text
	_alt.text = alt


func toast(text: String, kind := "info") -> void:
	var colors := {"info": Color("#e9ecef"), "ok": Color("#80ed99"), "warn": Color("#ff8fa3"), "money": Color("#ffd166"), "event": Color("#4cc9f0")}
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", UITheme.box(Color(0.06, 0.08, 0.12, 0.85), 8))
	var l := UITheme.label(text, 15, colors.get(kind, Color.WHITE))
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.custom_minimum_size = Vector2(490, 0)
	p.add_child(l)
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_toasts.add_child(p)
	while _toasts.get_child_count() > 6:
		_toasts.get_child(0).free()
	var tw := p.create_tween()
	tw.tween_interval(5.5)
	tw.tween_property(p, "modulate:a", 0.0, 0.8)
	tw.tween_callback(p.queue_free)


func _set_stat(k: String, cap: String, val: String, col := Color.WHITE) -> void:
	_stat_labels[k][0].text = cap
	_stat_labels[k][1].text = val
	_stat_labels[k][1].add_theme_color_override("font_color", col)


func _process(delta: float) -> void:
	_update_minigame(delta)
	_update_hold(delta)
	_ride.text = ride_text
	_gps.text = world.gps_text()
	_refresh_t -= delta
	if _refresh_t > 0.0:
		return
	_refresh_t = 0.25
	var profit := Hotel.revenue_today() - Hotel.expenses_today()
	_set_stat("cash", "TRÉSORERIE", Hotel.money(Hotel.cash), UITheme.GOOD if Hotel.cash >= 0 else UITheme.BAD)
	_set_stat("profit", "RÉSULTAT DU JOUR", Hotel.money(profit), UITheme.GOOD if profit >= 0 else UITheme.BAD)
	_set_stat("occ", "OCCUPATION", "%d/%d (%d%%)" % [Hotel.occupied_count(), Hotel.unlocked_rooms().size(), int(Hotel.occupancy() * 100)])
	_set_stat("rep", "RÉPUTATION", "%.1f ★" % Hotel.reputation, Color("#ffd166"))
	_set_stat("guests", "CLIENTS", str(Hotel.in_house_guests().size()))
	_set_stat("arrivals", "ARRIVÉES À VENIR", str(Hotel.bookings_today().size()))
	var open := Hotel.tasks.filter(func(t): return t.assignee == "").size()
	_set_stat("tasks", "TÂCHES EN ATTENTE", str(open), UITheme.BAD if open > 8 else Color.WHITE)
	var on_duty := 0
	for sid in Hotel.staff:
		if Hotel.on_shift(Hotel.staff[sid], Clock.hour()):
			on_duty += 1
	_set_stat("staff", "PERSONNEL EN SERVICE", "%d/%d" % [on_duty, Hotel.staff.size()])
	_set_stat("time", Hotel.WEEKDAYS[Hotel.weekday()].to_upper() + (" (x%d)" % int(Clock.time_scale) if Clock.time_scale > 1.0 else ("  PAUSE" if Clock.time_scale <= 0.0 else "")), Clock.time_string())
	_event.text = ("★ " + str(Hotel.event.title)) if not Hotel.event.is_empty() else ""
	_refresh_todo()


func _refresh_todo() -> void:
	_todo_title.text = "À FAIRE — %s" % world.role_name(world.player_role)
	for c in _todo_box.get_children():
		c.free()
	var list: Array = world.priority_list()
	if list.is_empty():
		_todo_box.add_child(UITheme.label("Rien d'urgent. Bravo !", 15, UITheme.GOOD))
		return
	for i in list.size():
		var t: Dictionary = list[i]
		var mine: bool = int(t.id) == int(world.player_task)
		var why := Hotel.blocked_reason(t)
		var age := int((Hotel.now() - float(t.created)) * 60.0)
		var col := Color("#ffd166") if mine else (UITheme.BAD if why != "" else (Color("#ff8fa3") if age > 45 else Color.WHITE))
		var txt := "%d. %s%s" % [i + 1, "▶ " if mine else "", Hotel.task_label(t)]
		var l := UITheme.label(txt, 15, col)
		l.custom_minimum_size.x = 360
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		_todo_box.add_child(l)
		var sub := "    %s • il y a %d min" % [world.task_place(t), age]
		if why != "":
			sub += " • BLOQUÉ : " + why
		elif mine:
			var st: Dictionary = Hotel.task_def(t).steps[int(t.step)]
			sub = "    Étape %d/%d : %s" % [int(t.step) + 1, Hotel.task_def(t).steps.size(), Hotel.task_label(t, st.verb)]
		_todo_box.add_child(UITheme.label(sub, 12, UITheme.MUTED if not mine else Color("#bde0fe")))


# ------------------------------------------------------------------ mini-games
## kind "brew" (coffee) or "repair": a work phase, then hit E in the green zone.
func start_minigame(kind: String, duration: float, done: Callable) -> void:
	var zone_w := 95.0 if kind == "brew" else 70.0
	_mg_state_set({"kind": kind, "t": 0.0, "duration": duration, "done": done, "phase": "work",
		"zone_x": randf_range(110.0, 440.0 - zone_w - 20.0), "zone_w": zone_w, "needle": 0.0, "dir": 1.0, "timeout": 3.5, "released": false})
	_mg.visible = true


var _mgs := {}


func _mg_state_set(d: Dictionary) -> void:
	_mgs = d


func is_minigame_active() -> bool:
	return not _mgs.is_empty()


func _update_minigame(delta: float) -> void:
	if _mgs.is_empty():
		return
	var s := _mgs
	var dt: float = delta * max(1.0, Clock.time_scale)
	if s.phase == "work":
		s.t += dt
		var k: float = clamp(s.t / s.duration, 0.0, 1.0)
		_mg_title.text = ("Préparation… %d%%" if s.kind == "brew" else "Démontage et diagnostic… %d%%") % int(k * 100)
		_mg_zone.visible = false
		_mg_bar.color = Color("#6f4518") if s.kind == "brew" else Color("#343a40")
		_mg_needle.position.x = k * 434.0
		if k >= 1.0:
			s.phase = "aim"
			_mg_zone.visible = true
			_mg_zone.position = Vector2(s.zone_x, 0)
			_mg_zone.size = Vector2(s.zone_w, 34)
			_mg_bar.color = Color("#495057")
	else:
		_mg_title.text = "Mousse parfaite : [E] dans la zone verte !" if s.kind == "brew" else "Serrez au bon moment : [E] dans la zone verte !"
		s.needle += s.dir * (520.0 if s.kind == "brew" else 600.0) * delta
		if s.needle > 434.0 or s.needle < 0.0:
			s.dir *= -1.0
			s.needle = clamp(s.needle, 0.0, 434.0)
		_mg_needle.position.x = s.needle
		s.timeout -= delta
		var pressed := Input.is_physical_key_pressed(KEY_E)
		if pressed and s.released:
			finish_minigame()
		elif not pressed:
			s.released = true
		if not _mgs.is_empty() and s.timeout <= 0.0:
			finish_minigame()


func finish_minigame() -> void:
	var s := _mgs
	var center: float = s.zone_x + s.zone_w / 2.0
	var err: float = abs(s.needle + 3.0 - center) / (s.zone_w / 2.0)
	var mult := 1.3 if err <= 0.35 else (1.12 if err <= 1.0 else (0.92 if err <= 2.0 else 0.8))
	if s.timeout <= 0.0:
		mult = 0.85
	_mgs = {}
	_mg.visible = false
	world.toast(["Parfait !", "Bien joué.", "Bof…", "Raté…"][0 if mult >= 1.3 else (1 if mult >= 1.1 else (2 if mult >= 0.9 else 3))], "ok" if mult >= 1.1 else "info")
	s.done.call(mult)


# ------------------------------------------------------------------ hold
func start_hold(text: String, duration: float, done: Callable) -> void:
	_hold_state = {"t": 0.0, "d": duration, "done": done}
	_hold_label.text = text
	_hold.visible = true


func is_holding() -> bool:
	return not _hold_state.is_empty()


func _update_hold(delta: float) -> void:
	if _hold_state.is_empty():
		return
	_hold_state.t += delta * max(1.0, Clock.time_scale)
	_hold_bar.value = 100.0 * _hold_state.t / _hold_state.d
	if _hold_state.t >= _hold_state.d:
		var cb: Callable = _hold_state.done
		_hold_state = {}
		_hold.visible = false
		cb.call()
