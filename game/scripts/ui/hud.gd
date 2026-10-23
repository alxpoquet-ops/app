class_name HUD
extends CanvasLayer
## In-game overlay: money, clock, current job, interaction prompt, toasts,
## the barista timing mini-game and hold-to-act progress bars.

var world: Node
var cash_label: Label
var time_label: Label
var job_label: Label
var prompt_label: Label
var alt_label: Label
var toast_box: VBoxContainer
var gps_label: Label
var hint_label: Label
var event_label: Label
var _brew: Control
var _brew_bar: ColorRect
var _brew_zone: ColorRect
var _brew_needle: ColorRect
var _brew_title: Label
var _brew_state := {}
var _hold: Control
var _hold_bar: ProgressBar
var _hold_label: Label
var _hold_state := {}
var _last_cash := -1.0


func _init(w: Node) -> void:
	world = w
	layer = 5


func _ready() -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)
	var top := PanelContainer.new()
	top.add_theme_stylebox_override("panel", UITheme.box(Color(0.08, 0.1, 0.14, 0.78), 10))
	top.position = Vector2(14, 12)
	root.add_child(top)
	var v := VBoxContainer.new()
	top.add_child(v)
	cash_label = UITheme.label("", 26, Color("#80ed99"))
	time_label = UITheme.label("", 17, Color("#e9ecef"))
	job_label = UITheme.label("", 15, Color("#ffd166"))
	v.add_child(cash_label)
	v.add_child(time_label)
	v.add_child(job_label)
	gps_label = UITheme.label("", 18, Color("#4cc9f0"))
	gps_label.position = Vector2(14, 150)
	root.add_child(gps_label)
	event_label = UITheme.label("", 17, Color("#ffb703"))
	event_label.set_anchors_preset(Control.PRESET_CENTER_TOP)
	event_label.position = Vector2(-300, 14)
	event_label.size = Vector2(600, 30)
	event_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(event_label)
	hint_label = UITheme.label("Tab : téléphone  •  M : carte  •  H : aide  •  Échap : menu", 14, Color(1, 1, 1, 0.6))
	hint_label.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	hint_label.position = Vector2(-520, -30)
	hint_label.size = Vector2(500, 24)
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	root.add_child(hint_label)
	prompt_label = UITheme.label("", 22, Color.WHITE)
	prompt_label.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	prompt_label.position = Vector2(-450, -150)
	prompt_label.size = Vector2(900, 34)
	prompt_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(prompt_label)
	alt_label = UITheme.label("", 18, Color("#ffd166"))
	alt_label.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	alt_label.position = Vector2(-450, -116)
	alt_label.size = Vector2(900, 30)
	alt_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(alt_label)
	toast_box = VBoxContainer.new()
	toast_box.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	toast_box.position = Vector2(14, -330)
	toast_box.size = Vector2(560, 300)
	toast_box.alignment = BoxContainer.ALIGNMENT_END
	toast_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(toast_box)
	_build_brew(root)
	_build_hold(root)


func _build_brew(root: Control) -> void:
	_brew = PanelContainer.new()
	_brew.add_theme_stylebox_override("panel", UITheme.box(Color(0.08, 0.1, 0.14, 0.9), 12))
	_brew.set_anchors_preset(Control.PRESET_CENTER)
	_brew.position = Vector2(-230, 60)
	_brew.custom_minimum_size = Vector2(460, 110)
	root.add_child(_brew)
	var v := VBoxContainer.new()
	_brew.add_child(v)
	_brew_title = UITheme.label("", 18, Color.WHITE)
	_brew_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(_brew_title)
	var track := Control.new()
	track.custom_minimum_size = Vector2(440, 34)
	v.add_child(track)
	_brew_bar = ColorRect.new()
	_brew_bar.color = Color("#495057")
	_brew_bar.size = Vector2(440, 34)
	track.add_child(_brew_bar)
	_brew_zone = ColorRect.new()
	_brew_zone.color = Color("#2dc653")
	track.add_child(_brew_zone)
	_brew_needle = ColorRect.new()
	_brew_needle.color = Color.WHITE
	_brew_needle.size = Vector2(6, 42)
	_brew_needle.position.y = -4
	track.add_child(_brew_needle)
	_brew.visible = false


func _build_hold(root: Control) -> void:
	_hold = PanelContainer.new()
	_hold.add_theme_stylebox_override("panel", UITheme.box(Color(0.08, 0.1, 0.14, 0.9), 10))
	_hold.set_anchors_preset(Control.PRESET_CENTER)
	_hold.position = Vector2(-160, 70)
	_hold.custom_minimum_size = Vector2(320, 60)
	root.add_child(_hold)
	var v := VBoxContainer.new()
	_hold.add_child(v)
	_hold_label = UITheme.label("", 16, Color.WHITE)
	v.add_child(_hold_label)
	_hold_bar = ProgressBar.new()
	_hold_bar.custom_minimum_size = Vector2(300, 18)
	_hold_bar.show_percentage = false
	v.add_child(_hold_bar)
	_hold.visible = false


func set_prompt(text: String, alt: String) -> void:
	prompt_label.text = text
	alt_label.text = alt


func toast(text: String, kind := "info") -> void:
	var colors := {"info": Color("#e9ecef"), "ok": Color("#80ed99"), "warn": Color("#ff8fa3"), "money": Color("#ffd166"), "event": Color("#4cc9f0"), "achievement": Color("#f15bb5")}
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", UITheme.box(Color(0.08, 0.1, 0.14, 0.85), 8))
	var l := UITheme.label(text, 16, colors.get(kind, Color.WHITE))
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.custom_minimum_size = Vector2(520, 0)
	p.add_child(l)
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	toast_box.add_child(p)
	while toast_box.get_child_count() > 6:
		toast_box.get_child(0).free()
	var tw := p.create_tween()
	tw.tween_interval(5.0)
	tw.tween_property(p, "modulate:a", 0.0, 0.8)
	tw.tween_callback(p.queue_free)


func _process(delta: float) -> void:
	var cash := Economy.player_cash()
	cash_label.text = Economy.money(cash)
	if _last_cash >= 0.0 and abs(cash - _last_cash) > 0.009:
		cash_label.modulate = Color(1.6, 1.6, 1.6) if cash > _last_cash else Color(1.6, 0.6, 0.6)
	cash_label.modulate = cash_label.modulate.lerp(Color.WHITE, 4.0 * delta)
	_last_cash = cash
	time_label.text = Clock.time_string() + ("  ⏸" if Clock.time_scale <= 0.0 else "")
	job_label.text = _job_text()
	event_label.text = ("★ " + Economy.event.title) if not Economy.event.is_empty() else ""
	gps_label.text = world.gps_text()
	_update_brew(delta)
	_update_hold(delta)


func _job_text() -> String:
	var j: Dictionary = Economy.job_of(Identity.local_id())
	var owned := Economy.owned_businesses(Identity.local_id()).size()
	var s := ""
	match j.get("type", ""):
		"barista":
			s = "Emploi : Barista chez %s" % Economy.businesses[j.biz_id].name
		"delivery":
			s = "Emploi : Livraison #%d" % int(j.order_id)
		"owner":
			s = "Au travail dans votre établissement"
		_:
			s = "Sans emploi — voir les offres (Tab)"
	if owned > 0:
		s += "\nEntreprises : %d" % owned
	return s + "\n" + _objective()


## Non-binding guidance from employee to entrepreneur (players can ignore it).
func _objective() -> String:
	var pid := Identity.local_id()
	var mine := Economy.owned_businesses(pid)
	if mine.is_empty():
		var cheapest := INF
		for lid in Economy.lots:
			var lot: Dictionary = Economy.lots[lid]
			if lot.tenant_biz == "":
				cheapest = min(cheapest, float(lot.deposit) + float(GameData.btype("cafe").get("build_cost", 600)))
		if cheapest == INF:
			return "Objectif : rachetez une entreprise (Tab → Registre)"
		if Economy.player_cash() < cheapest:
			return "Objectif : économisez %s pour ouvrir votre café (%d%%)" % [Economy.money(cheapest), int(100.0 * Economy.player_cash() / cheapest)]
		return "Objectif : louez un terrain libre (panneau vert) et construisez !"
	var b: Business = mine[0]
	if b.type_id == "cafe":
		if b.machines().is_empty():
			return "Objectif : entrez dans « %s » et installez une machine (B)" % b.name
		for g in ["roasted_coffee", "milk"]:
			if b.qty(g) + Economy.incoming_qty(b.id, g) < 5:
				return "Objectif : commandez des ingrédients (E au quai → Stocks)"
		if b.employees.is_empty():
			return "Objectif : servez vous-même ou embauchez un barista"
	if mine.size() < 2:
		return "Objectif : développez-vous et rachetez une 2e entreprise"
	return "Objectif : atteignez 10 000 $ de patrimoine"


# ------------------------------------------------------------------ brew mini-game
## Phase 1: brewing progress. Phase 2: needle sweeps, press E in the green zone.
func start_brew_minigame(duration: float, machine: Node, done: Callable) -> void:
	var zone_w := 90.0
	_brew_state = {"t": 0.0, "duration": duration, "machine": machine, "done": done, "phase": "brew",
		"zone_x": randf_range(120.0, 440.0 - zone_w - 20.0), "zone_w": zone_w, "needle": 0.0, "dir": 1.0, "timeout": 3.5}
	_brew.visible = true


func _update_brew(delta: float) -> void:
	if _brew_state.is_empty():
		return
	var s := _brew_state
	if s.phase == "brew":
		s.t += delta
		var k: float = clamp(s.t / s.duration, 0.0, 1.0)
		if is_instance_valid(s.machine):
			s.machine.progress = k
		_brew_title.text = "Préparation… %d%%" % int(k * 100)
		_brew_zone.visible = false
		_brew_needle.position.x = k * 434.0
		_brew_bar.color = Color("#6f4518")
		if k >= 1.0:
			s.phase = "aim"
			_brew_zone.visible = true
			_brew_zone.position = Vector2(s.zone_x, 0)
			_brew_zone.size = Vector2(s.zone_w, 34)
			_brew_bar.color = Color("#495057")
	else:
		_brew_title.text = "Mousse parfaite : appuyez sur [E] dans la zone verte !"
		s.needle += s.dir * 520.0 * delta
		if s.needle > 434.0 or s.needle < 0.0:
			s.dir *= -1.0
			s.needle = clamp(s.needle, 0.0, 434.0)
		_brew_needle.position.x = s.needle
		s.timeout -= delta
		if Input.is_physical_key_pressed(KEY_E) and s.get("released", false):
			_finish_brew()
		elif not Input.is_physical_key_pressed(KEY_E):
			s.released = true
		elif s.timeout <= 0.0:
			_finish_brew()
		if s.timeout <= 0.0 and not _brew_state.is_empty():
			_finish_brew()


func _finish_brew() -> void:
	var s := _brew_state
	var center: float = s.zone_x + s.zone_w / 2.0
	var err: float = abs(s.needle + 3.0 - center) / (s.zone_w / 2.0)
	var mult := 1.25 if err <= 0.35 else (1.1 if err <= 1.0 else (0.9 if err <= 2.0 else 0.75))
	if s.timeout <= 0.0:
		mult = 0.85
	_brew_state = {}
	_brew.visible = false
	s.done.call(mult)


func is_minigame_active() -> bool:
	return not _brew_state.is_empty()


# ------------------------------------------------------------------ hold action
func start_hold(text: String, duration: float, done: Callable) -> void:
	_hold_state = {"t": 0.0, "d": duration, "done": done}
	_hold_label.text = text
	_hold.visible = true


func _update_hold(delta: float) -> void:
	if _hold_state.is_empty():
		return
	_hold_state.t += delta
	_hold_bar.value = 100.0 * _hold_state.t / _hold_state.d
	if _hold_state.t >= _hold_state.d:
		var cb: Callable = _hold_state.done
		_hold_state = {}
		_hold.visible = false
		cb.call()
