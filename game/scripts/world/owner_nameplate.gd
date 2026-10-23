class_name OwnerNameplate
extends Node3D
## Floating ownership badge above a building:
##   [avatar]  Owner name
##             Company name
##             STATUS
## Player companies show the owner's profile picture (Steam avatar when
## available); AI companies use a distinct square "IA" badge and grey tint.
## Fades and shrinks with distance to keep the screen readable.

var biz_id := ""
var avatar: Sprite3D
var line_owner: Label3D
var line_name: Label3D
var line_status: Label3D
var _t := 0.0


func setup(id: String, height: float) -> void:
	biz_id = id
	position = Vector3(0, height, 0)
	avatar = Sprite3D.new()
	avatar.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	avatar.pixel_size = 0.018
	avatar.position = Vector3(0, 0.95, 0)
	avatar.no_depth_test = false
	avatar.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	add_child(avatar)
	line_owner = MeshFactory.label(self, "", Vector3(0, 0.15, 0), 52, Color.WHITE)
	line_name = MeshFactory.label(self, "", Vector3(0, -0.25, 0), 40, Color("#ffe8a3"))
	line_status = MeshFactory.label(self, "", Vector3(0, -0.6, 0), 32, Color("#9ef01a"))
	refresh()
	Identity.profile_changed.connect(func(_id): refresh())


func refresh() -> void:
	var b: Business = Economy.businesses.get(biz_id)
	if b == null:
		visible = false
		return
	visible = true
	if b.is_ai():
		avatar.texture = Identity.get_ai_avatar()
		line_owner.text = "Groupe Horizon (IA)"
		line_owner.modulate = Color("#c8d0dc")
	else:
		avatar.texture = Identity.get_avatar(b.owner_id)
		line_owner.text = Identity.display_name(b.owner_id)
		line_owner.modulate = Color.WHITE
	line_name.text = b.name
	var st := b.status_label()
	line_status.text = st if st != "À VENDRE" else "À VENDRE — %s" % Economy.money(b.asking_price)
	match st:
		"OUVERT": line_status.modulate = Color("#9ef01a")
		"FERMÉ": line_status.modulate = Color("#adb5bd")
		"À VENDRE": line_status.modulate = Color("#ffd166")
		_: line_status.modulate = Color("#ff6b6b")


func _process(delta: float) -> void:
	_t -= delta
	if _t > 0.0:
		return
	_t = 0.15
	var cam := get_viewport().get_camera_3d()
	if cam == null:
		return
	var d := cam.global_position.distance_to(global_position)
	# Near: full card. Mid: avatar + owner. Far: avatar only, faded.
	var a: float = clamp(1.0 - (d - 30.0) / 70.0, 0.25, 1.0)
	var s: float = clamp(0.8 + d / 60.0, 0.9, 2.2)
	scale = Vector3.ONE * s
	avatar.modulate.a = a
	line_owner.visible = d < 70.0
	line_name.visible = d < 45.0
	line_status.visible = d < 35.0
	line_owner.modulate.a = a
	var bb = get_parent()
	visible = d < 160.0 and Economy.businesses.has(biz_id) and not (bb.has_method("is_player_inside") and bb.is_player_inside())
