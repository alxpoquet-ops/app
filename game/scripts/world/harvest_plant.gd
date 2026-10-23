class_name HarvestPlant
extends Node3D
## Coffee bush for the farm-hand job: ripe bushes carry red cherries; picking
## one adds beans to the farm's stock and pays the picker a piece rate.

var world: Node
var biz_id := ""
var ripe_at := 0.0           # absolute game hour when it becomes ripe again
var _berries: Array = []
var _bush: MeshInstance3D


func setup(w: Node, id: String) -> void:
	world = w
	biz_id = id
	_bush = MeshFactory.sphere(self, 0.7, Vector3(0, 0.7, 0), Color("#2d6a4f"))
	MeshFactory.sphere(self, 0.5, Vector3(0.3, 1.1, 0.1), Color("#40916c"))
	for i in 7:
		var a := i * TAU / 7.0
		_berries.append(MeshFactory.sphere(self, 0.09, Vector3(cos(a) * 0.6, 0.7 + (i % 3) * 0.25, sin(a) * 0.6), Color("#d62828"), 0.4))
	ripe_at = Clock.absolute_hours() - randf() * 2.0
	Interactable.make(self, Vector3(0, 0.8, 0), 1.6, _prompt, _pick)


func is_ripe() -> bool:
	return Clock.absolute_hours() >= ripe_at


func _process(_d: float) -> void:
	var r := is_ripe()
	for b in _berries:
		b.visible = r


func _prompt(p: Player) -> String:
	if not is_ripe() or not p.carrying.is_empty() or p.vehicle != null:
		return ""
	var b: Business = Economy.businesses.get(biz_id)
	if b != null and b.owner_id == p.player_id:
		return "[E] Récolter (+%d grains pour votre ferme)" % int(GameData.bal("harvest_beans_per_plant", 6))
	return "[E] Cueillir les cerises (+%s)" % Economy.money(float(GameData.bal("harvest_pay_per_plant", 2.5)))


func _pick(p: Player) -> void:
	if not is_ripe():
		return
	p.busy = true
	p.visual.excited = 0.3
	world.start_hold_action(p, "Cueillette…", 1.2, func():
		var r: Dictionary = Economy.request_harvest(p.player_id, biz_id, float(GameData.bal("harvest_beans_per_plant", 6)))
		ripe_at = Clock.absolute_hours() + float(GameData.bal("harvest_regrow_hours", 4))
		world.toast("Cueillette : " + r.msg, "money")
		world.stats_add("harvested", 1))
