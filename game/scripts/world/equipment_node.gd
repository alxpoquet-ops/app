class_name EquipmentNode
extends Node3D
## Visual + interactive representation of one equipment entry of a company.

var entry: Dictionary
var def_id := ""
var building: Node            # BusinessBuilding
var busy_by: Object = null    # worker NPC or player currently using it
var progress := 0.0           # 0..1 while brewing (visual)
var _steam: CPUParticles3D
var _bar: Label3D
var _cond_label: Label3D
var body: StaticBody3D


func setup(b: Node, e: Dictionary) -> void:
	building = b
	entry = e
	def_id = e.def
	position = Vector3(float(e.x), 0, float(e.z))
	rotation.y = float(e.rot)
	var d := GameData.equip(def_id)
	var col := Color(str(d.get("color", "#cccccc")))
	var sz: Array = d.get("size", [1, 1])
	build_visual(self, def_id)
	body = MeshFactory.add_box_collider(self, Vector3(float(sz[0]), 1.1, float(sz[1])), Vector3(0, 0.55, 0))
	body.set_meta("equipment_uid", int(e.uid))
	match d.get("category", ""):
		"machine":
			_steam = CPUParticles3D.new()
			_steam.amount = 12
			_steam.lifetime = 1.2
			_steam.emitting = false
			_steam.direction = Vector3.UP
			_steam.initial_velocity_min = 0.4
			_steam.initial_velocity_max = 0.8
			_steam.gravity = Vector3(0, 0.3, 0)
			_steam.scale_amount_min = 0.08
			_steam.scale_amount_max = 0.16
			var sm := SphereMesh.new()
			sm.radius = 0.5
			sm.height = 1.0
			sm.material = MeshFactory.mat(Color(1, 1, 1, 0.6), 0.0, true)
			_steam.mesh = sm
			_steam.position = Vector3(0, 1.7, 0)
			add_child(_steam)
			_bar = MeshFactory.label(self, "", Vector3(0, 2.2, 0), 36, Color("#ffe066"))
			_cond_label = MeshFactory.label(self, "", Vector3(0, 2.55, 0), 28, Color.WHITE)
			_cond_label.pixel_size = 0.004
			var it := Interactable.make(self, Vector3(0, 1.0, 0), 1.7, _machine_prompt, _machine_action)
			it.alt_prompt_fn = _repair_prompt
			it.alt_action_fn = _repair_action
			it.priority = 1
		"display":
			var it2 := Interactable.make(self, Vector3(0, 1.0, 0), 1.8, _display_prompt, _display_action)
			it2.priority = 1
		_:
			if def_id == "arcade":
				Interactable.make(self, Vector3(0, 1.0, 0), 1.6, func(p): return "[E] Jouer à « Wobble Kart » (gratuit, c'est le patron qui paie)" if p.vehicle == null else "", _arcade)
			elif def_id == "jukebox":
				Interactable.make(self, Vector3(0, 1.0, 0), 1.6, func(_p): return "[E] Changer de musique", func(p): p.world.toast("♪ Le juke-box joue « La Valse du Barista » ♪", "info"))


func _process(delta: float) -> void:
	if _steam:
		_steam.emitting = busy_by != null
		if busy_by != null and progress > 0.0:
			var n := int(progress * 10.0)
			_bar.text = "▮".repeat(n) + "▯".repeat(10 - n)
		else:
			_bar.text = ""
		var c := float(entry.condition)
		_cond_label.text = "État %d%%" % int(c) if c < 60 else ""
		_cond_label.modulate = Color("#ff6b6b") if c < 35 else Color("#ffd166")


static func build_visual(n: Node3D, id: String) -> void:
	var d := GameData.equip(id)
	var col := Color(str(d.get("color", "#cccccc")))
	var sz: Array = d.get("size", [1, 1])
	var w := float(sz[0])
	var dp := float(sz[1])
	match d.get("category", ""):
		"machine":
			MeshFactory.box(n, Vector3(w, 1.0, dp), Vector3(0, 0.5, 0), Color("#6b4f3a"))
			MeshFactory.box(n, Vector3(w * 0.8, 0.55, dp * 0.7), Vector3(0, 1.28, -0.05), col)
			MeshFactory.box(n, Vector3(w * 0.6, 0.06, dp * 0.4), Vector3(0, 1.03, 0.15), Color("#333333"))
			MeshFactory.cylinder(n, 0.06, 0.15, Vector3(-0.15, 1.08, 0.2), Color.WHITE)
			MeshFactory.cylinder(n, 0.06, 0.15, Vector3(0.15, 1.08, 0.2), Color.WHITE)
			MeshFactory.sphere(n, 0.05, Vector3(w * 0.3, 1.45, dp * 0.3), Color("#06d6a0"), 2.0)
			if id == "coffee_machine_pro":
				MeshFactory.sphere(n, 0.22, Vector3(0, 1.7, -0.05), Color("#c9a227"))
		"display":
			MeshFactory.box(n, Vector3(w, 0.9, dp), Vector3(0, 0.45, 0), Color("#6b4f3a"))
			MeshFactory.box(n, Vector3(w, 0.5, dp), Vector3(0, 1.15, 0), Color(0.75, 0.92, 1.0, 0.45))
			for i in 4:
				var c := MeshFactory.capsule(n, 0.07, 0.3, Vector3(-0.5 + i * 0.33, 1.0, 0), Color("#d99a3d"))
				c.rotation.z = PI / 2
		"furniture":
			if id == "table_set":
				MeshFactory.cylinder(n, 0.5, 0.06, Vector3(0, 0.75, 0), col)
				MeshFactory.cylinder(n, 0.06, 0.75, Vector3(0, 0.37, 0), Color("#444444"))
				for a in [0.0, PI / 2, PI, PI * 1.5]:
					var p := Vector3(cos(a) * 0.75, 0, sin(a) * 0.75)
					MeshFactory.box(n, Vector3(0.4, 0.06, 0.4), p + Vector3(0, 0.45, 0), Color("#e9c46a"))
					MeshFactory.box(n, Vector3(0.06, 0.45, 0.06), p + Vector3(0, 0.22, 0), Color("#444444"))
				MeshFactory.cylinder(n, 0.05, 0.1, Vector3(0.1, 0.83, 0.1), Color.WHITE)
			else:
				MeshFactory.box(n, Vector3(w, 0.45, dp), Vector3(0, 0.25, 0), col)
				MeshFactory.box(n, Vector3(w, 0.5, 0.2), Vector3(0, 0.7, -dp / 2 + 0.1), col.darkened(0.15))
				MeshFactory.box(n, Vector3(0.2, 0.35, dp), Vector3(-w / 2 + 0.1, 0.55, 0), col.darkened(0.1))
				MeshFactory.box(n, Vector3(0.2, 0.35, dp), Vector3(w / 2 - 0.1, 0.55, 0), col.darkened(0.1))
		_:
			match id:
				"plant":
					MeshFactory.cylinder(n, 0.22, 0.4, Vector3(0, 0.2, 0), Color("#c2703d"), 0.18)
					MeshFactory.sphere(n, 0.35, Vector3(0, 0.75, 0), col)
					MeshFactory.sphere(n, 0.25, Vector3(0.15, 1.05, 0.05), col.lightened(0.1))
				"lamp":
					MeshFactory.cylinder(n, 0.04, 1.6, Vector3(0, 0.8, 0), Color("#333333"))
					MeshFactory.cylinder(n, 0.25, 0.3, Vector3(0, 1.7, 0), col, 0.1)
					MeshFactory.sphere(n, 0.12, Vector3(0, 1.6, 0), Color("#fff3b0"), 3.0)
				"arcade":
					MeshFactory.box(n, Vector3(w, 1.8, dp), Vector3(0, 0.9, 0), col)
					MeshFactory.box(n, Vector3(w * 0.75, 0.55, 0.05), Vector3(0, 1.35, dp / 2 + 0.01), Color("#3a0ca3"), false).material_override = MeshFactory.mat(Color("#4cc9f0"), 1.5)
					MeshFactory.box(n, Vector3(w, 0.1, 0.35), Vector3(0, 0.95, dp / 2 + 0.1), Color("#222222"))
				"jukebox":
					MeshFactory.box(n, Vector3(w, 1.3, dp), Vector3(0, 0.65, 0), col)
					MeshFactory.sphere(n, w * 0.5, Vector3(0, 1.3, 0), col.lightened(0.3), 0.8)
				_:
					MeshFactory.box(n, Vector3(w, 1.0, dp), Vector3(0, 0.5, 0), col)


# ------------------------------------------------------------------ machine
func _service():
	return building.service if building and "service" in building else null


func _machine_prompt(p: Player) -> String:
	var svc = _service()
	if svc == null:
		return ""
	if busy_by != null and busy_by != p:
		return "Machine occupée…"
	if not p.carrying.is_empty():
		return ""
	if not svc.player_can_work(p):
		return svc.work_hint(p)
	var c = svc.next_order_for(true)
	if c == null:
		return "Aucune commande de boisson en attente"
	return "[E] Préparer : %s" % svc.item_name(c.data.item)


func _machine_action(p: Player) -> void:
	var svc = _service()
	if _machine_prompt(p).begins_with("[E]"):
		svc.player_brew(p, self)


func _repair_prompt(p: Player) -> String:
	var b: Business = Economy.businesses.get(building.biz_id)
	if b == null or b.owner_id != p.player_id or float(entry.condition) >= 99.0:
		return ""
	return "[R] Réparer soi-même (pièces : %s)" % Economy.money(Economy.repair_cost(entry) * 0.4)


func _repair_action(p: Player) -> void:
	p.world.start_hold_action(p, "Réparation en cours…", 3.0, func():
		var r: Dictionary = Economy.request_repair(p.player_id, building.biz_id, int(entry.uid), true)
		p.world.toast(r.msg, "ok" if r.ok else "warn"))


func _display_prompt(p: Player) -> String:
	var svc = _service()
	if svc == null or not p.carrying.is_empty():
		return ""
	if not svc.player_can_work(p):
		return svc.work_hint(p)
	var c = svc.next_order_for(false)
	if c == null:
		return "Aucune commande de viennoiserie"
	return "[E] Prendre un croissant"


func _display_action(p: Player) -> void:
	var svc = _service()
	if _display_prompt(p).begins_with("[E]"):
		svc.player_take_pastry(p)


func _arcade(p: Player) -> void:
	var scores := ["Nouveau record : 12 450 points !", "Game over… le fantôme vous a eu.", "Vous avez battu le boss final (en vrai, il dormait).", "Insérez une pièce… ah non, c'est gratuit."]
	p.world.toast(scores[randi() % scores.size()], "info")
	p.visual.excited = 1.0
