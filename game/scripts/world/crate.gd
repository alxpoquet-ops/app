class_name Crate
extends Node3D
## A physical delivery crate tied to a purchase order (logistics gameplay).

var order_id := 0
var good := ""
var world: Node


static func build_mesh(n: Node3D) -> void:
	MeshFactory.box(n, Vector3(0.8, 0.6, 0.6), Vector3(0, 0.0, 0), Color("#c08552"))
	MeshFactory.box(n, Vector3(0.84, 0.08, 0.64), Vector3(0, 0.2, 0), Color("#8c5a3c"))
	MeshFactory.box(n, Vector3(0.84, 0.08, 0.64), Vector3(0, -0.2, 0), Color("#8c5a3c"))


func setup(w: Node, oid: int, g: String) -> void:
	world = w
	order_id = oid
	good = g
	var holder := Node3D.new()
	holder.position = Vector3(0, 0.3, 0)
	add_child(holder)
	build_mesh(holder)
	var lbl := MeshFactory.label(self, "Commande #%d\n%s" % [oid, GameData.good_name(g)], Vector3(0, 1.1, 0), 36, Color("#ffe8a3"))
	lbl.pixel_size = 0.005
	Interactable.make(self, Vector3.ZERO, 2.0, _prompt, _pick)


func _prompt(p: Player) -> String:
	if not p.carrying.is_empty():
		return ""
	var job: Dictionary = Economy.job_of(p.player_id)
	if job.get("type", "") == "delivery" and int(job.order_id) == order_id:
		return "[E] Ramasser la caisse (%s)" % GameData.good_name(good)
	return ""


func _pick(p: Player) -> void:
	if _prompt(p) == "":
		return
	p.carry({"type": "crate", "order_id": order_id, "good": good, "label": "caisse"}, func(n): Crate.build_mesh(n))
	world.toast("Caisse chargée ! Livrez-la au quai de l'acheteur (suivez la flèche).", "info")
	queue_free()
