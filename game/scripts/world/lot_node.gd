class_name LotNode
extends Node3D
## Empty plot that can be rented or bought to found a company.

var lot_id := ""
var world: Node
var _sign: Node3D
var _label: Label3D


func setup(w: Node, id: String) -> void:
	world = w
	lot_id = id
	var lot: Dictionary = Economy.lots[id]
	position = Vector3(lot.pos[0], 0, lot.pos[1])
	rotation.y = deg_to_rad(float(lot.get("rot", 0)))
	var sz := Vector2(lot.size[0], lot.size[1])
	_sign = Node3D.new()
	add_child(_sign)
	MeshFactory.box(_sign, Vector3(sz.x, 0.06, sz.y), Vector3(0, 0.02, 0), Color("#b08968"))
	for i in int(sz.x / 2) + 1:
		MeshFactory.box(_sign, Vector3(0.12, 0.8, 0.12), Vector3(-sz.x / 2 + i * 2.0, 0.4, -sz.y / 2), Color("#e9ecef"))
	MeshFactory.cylinder(_sign, 0.08, 2.2, Vector3(0, 1.1, sz.y / 2 - 0.5), Color("#555555"))
	MeshFactory.box(_sign, Vector3(2.6, 1.2, 0.1), Vector3(0, 2.2, sz.y / 2 - 0.5), Color("#2a9d8f"))
	_label = MeshFactory.label(_sign, "", Vector3(0, 2.2, sz.y / 2 - 0.43), 30, Color.WHITE, false)
	MeshFactory.box(_sign, Vector3(0.6, 0.4, 0.6), Vector3(3, 0.2, 1), Color("#f77f00"))
	MeshFactory.cylinder(_sign, 0.25, 0.7, Vector3(-3, 0.35, 0), Color("#f77f00"), 0.05)
	Interactable.make(_sign, Vector3(0, 0, sz.y / 2 + 0.3), 3.0, _prompt, func(_p): world.ui.open_found_dialog(lot_id))
	refresh()


func refresh() -> void:
	var lot: Dictionary = Economy.lots[lot_id]
	_sign.visible = lot.tenant_biz == ""
	_label.text = "TERRAIN DISPONIBLE\nLocation %s/j\nAchat %s" % [Economy.money(float(lot.rent_per_day)), Economy.money(float(lot.buy_price))]


func _prompt(p: Player) -> String:
	if not _sign.visible or p.vehicle != null:
		return ""
	return "[E] Créer une entreprise sur ce terrain"
