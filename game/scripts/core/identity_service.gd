extends Node
## Player identity abstraction.
##
## The rest of the game only ever talks to this service (get_profile / get_avatar)
## and never to Steam directly. Two providers exist:
##   * "steam": used automatically when the GodotSteam GDExtension is installed and
##     Steam is running (Engine singleton "Steam"). Uses persona name, SteamID64 and
##     the medium avatar. Only public profile data is used (no friends list storage,
##     no e-mail, nothing persisted besides the SteamID needed to know who owns what).
##   * "local": temporary test profile stored in user://profile.json.
## Remote players (multiplayer) are registered with register_remote_profile().

signal profile_changed(player_id: String)

const PROFILE_PATH := "user://profile.json"

var provider := "local"
var local_profile := {"id": "local_player", "name": "Joueur", "color": "#3d5a80"}
var _profiles := {}    # player_id -> {id, name, color}
var _avatars := {}     # player_id -> Texture2D
var _steam: Object = null


func _ready() -> void:
	if Engine.has_singleton("Steam"):
		_steam = Engine.get_singleton("Steam")
		var init_ok := false
		if _steam.has_method("steamInitEx"):
			var res = _steam.call("steamInitEx")
			init_ok = typeof(res) == TYPE_DICTIONARY and int(res.get("status", 1)) == 0
		if init_ok:
			provider = "steam"
			var sid := str(_steam.call("getSteamID"))
			local_profile = {"id": "steam_" + sid, "name": str(_steam.call("getPersonaName")), "color": _color_from_id(sid)}
			if _steam.has_signal("avatar_loaded"):
				_steam.connect("avatar_loaded", _on_steam_avatar_loaded)
			_steam.call("getPlayerAvatar", 2, int(sid))
	if provider == "local":
		_load_local_profile()
	_profiles[local_profile.id] = local_profile


func _process(_delta: float) -> void:
	if _steam != null and provider == "steam":
		_steam.call("run_callbacks")


func local_id() -> String:
	return local_profile.id


func get_profile(player_id: String) -> Dictionary:
	return _profiles.get(player_id, {"id": player_id, "name": "Inconnu", "color": "#888888"})


func display_name(player_id: String) -> String:
	return get_profile(player_id).get("name", "?")


func register_remote_profile(profile: Dictionary) -> void:
	_profiles[profile.id] = profile
	_avatars.erase(profile.id)
	profile_changed.emit(profile.id)


func set_local_name(new_name: String) -> void:
	new_name = new_name.strip_edges().substr(0, 20)
	if new_name.is_empty() or provider == "steam":
		return
	local_profile.name = new_name
	_profiles[local_profile.id] = local_profile
	_avatars.erase(local_profile.id)
	_save_local_profile()
	profile_changed.emit(local_profile.id)


## Avatar texture for a player. Falls back to a generated round badge with initials.
func get_avatar(player_id: String) -> Texture2D:
	if _avatars.has(player_id):
		return _avatars[player_id]
	var p := get_profile(player_id)
	var tex := make_badge(str(p.get("name", "?")), Color.html(str(p.get("color", "#3d5a80"))), false)
	_avatars[player_id] = tex
	return tex


## Visual identity for AI-owned companies: square, gear-like badge.
func get_ai_avatar() -> Texture2D:
	if not _avatars.has("__ai__"):
		_avatars["__ai__"] = make_badge("IA", Color.html("#5c677d"), true)
	return _avatars["__ai__"]


func _on_steam_avatar_loaded(_id: int, size: int, data: PackedByteArray) -> void:
	var img := Image.create_from_data(size, size, false, Image.FORMAT_RGBA8, data)
	_avatars[local_profile.id] = ImageTexture.create_from_image(img)
	profile_changed.emit(local_profile.id)


func _load_local_profile() -> void:
	if FileAccess.file_exists(PROFILE_PATH):
		var f := FileAccess.open(PROFILE_PATH, FileAccess.READ)
		var d = JSON.parse_string(f.get_as_text())
		if typeof(d) == TYPE_DICTIONARY and d.has("name"):
			local_profile.name = str(d.name)
			local_profile.color = str(d.get("color", local_profile.color))
	else:
		_save_local_profile()


func _save_local_profile() -> void:
	var f := FileAccess.open(PROFILE_PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify({"name": local_profile.name, "color": local_profile.color}))


func _color_from_id(s: String) -> String:
	var h := float(abs(s.hash()) % 360) / 360.0
	return Color.from_hsv(h, 0.55, 0.8).to_html(false)


## Procedural avatar: a disc (players) or a rounded square with notches (AI).
static func make_badge(label: String, base: Color, is_ai: bool) -> Texture2D:
	var size := 64
	var img := Image.create(size, size, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	var c := Vector2(size / 2.0, size / 2.0)
	for y in size:
		for x in size:
			var p := Vector2(x + 0.5, y + 0.5)
			var inside := false
			var border := false
			if is_ai:
				var d: float = max(abs(p.x - c.x), abs(p.y - c.y))
				var notch: bool = (int(p.x) / 8 + int(p.y) / 8) % 2 == 0 and d > 27
				inside = d < 30 and not notch
				border = d > 26
			else:
				var d2 := p.distance_to(c)
				inside = d2 < 31
				border = d2 > 27
			if inside:
				img.set_pixel(x, y, Color.WHITE if border else base)
	# Initials drawn as a tiny 3x5 pixel font, upscaled.
	var initials := _initials(label)
	_draw_text(img, initials, Color.WHITE if base.get_luminance() < 0.6 else Color(0.1, 0.1, 0.1))
	return ImageTexture.create_from_image(img)


static func _initials(label: String) -> String:
	var parts := label.strip_edges().split(" ", false)
	var s := ""
	for p in parts:
		if s.length() < 2:
			s += p.substr(0, 1)
	if s.length() == 1 and label.length() > 1:
		s += label.substr(1, 1)
	return s.to_upper()


const _GLYPHS := {
	"A": "010101111101101", "B": "110101110101110", "C": "011100100100011", "D": "110101101101110",
	"E": "111100110100111", "F": "111100110100100", "G": "011100101101011", "H": "101101111101101",
	"I": "111010010010111", "J": "001001001101010", "K": "101101110101101", "L": "100100100100111",
	"M": "101111111101101", "N": "110101101101101", "O": "010101101101010", "P": "110101110100100",
	"Q": "010101101110011", "R": "110101110101101", "S": "011100010001110", "T": "111010010010010",
	"U": "101101101101111", "V": "101101101101010", "W": "101101111111101", "X": "101101010101101",
	"Y": "101101010010010", "Z": "111001010100111", "?": "110001010000010",
}


static func _draw_text(img: Image, text: String, col: Color) -> void:
	var scale := 4
	var w := text.length() * 4 * scale - scale
	var x0 := (img.get_width() - w) / 2
	var y0 := (img.get_height() - 5 * scale) / 2
	for i in text.length():
		var ch := text[i]
		var g: String = _GLYPHS.get(ch, _GLYPHS["?"])
		for row in 5:
			for colm in 3:
				if g[row * 3 + colm] == "1":
					for dy in scale:
						for dx in scale:
							var px := x0 + i * 4 * scale + colm * scale + dx
							var py := y0 + row * scale + dy
							if px >= 0 and py >= 0 and px < img.get_width() and py < img.get_height():
								img.set_pixel(px, py, col)
