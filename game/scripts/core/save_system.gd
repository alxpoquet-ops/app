extends Node
## Local JSON save. The economy (server-side state) and the local player's
## avatar state are stored separately so a future dedicated server can persist
## the world while each client only keeps its own preferences.

const SAVE_DIR := "user://saves"
const VERSION := 1

signal saved(path: String)
signal loaded(path: String)


func slot_path(slot: String = "slot1") -> String:
	return "%s/%s.json" % [SAVE_DIR, slot]


func has_save(slot: String = "slot1") -> bool:
	return FileAccess.file_exists(slot_path(slot))


func save_game(slot: String = "slot1") -> bool:
	DirAccess.make_dir_recursive_absolute(SAVE_DIR)
	var data := {
		"version": VERSION,
		"saved_at": Time.get_datetime_string_from_system(),
		"clock": Clock.to_dict(),
		"economy": Economy.to_dict(),
		"player": {},
	}
	var world := get_tree().get_first_node_in_group("world")
	if world and world.has_method("save_state"):
		data.player = world.save_state()
	var tmp := slot_path(slot) + ".tmp"
	var f := FileAccess.open(tmp, FileAccess.WRITE)
	if f == null:
		push_error("Save failed: %s" % FileAccess.get_open_error())
		return false
	f.store_string(JSON.stringify(data, "\t"))
	f.close()
	# atomic-ish replace so a crash never corrupts the previous save
	if DirAccess.rename_absolute(tmp, slot_path(slot)) != OK:
		# Some platforms refuse to rename over an existing file.
		DirAccess.remove_absolute(slot_path(slot))
		if DirAccess.rename_absolute(tmp, slot_path(slot)) != OK:
			push_error("Save failed: cannot replace %s" % slot_path(slot))
			return false
	saved.emit(slot_path(slot))
	return true


func read_save(slot: String = "slot1") -> Dictionary:
	if not has_save(slot):
		return {}
	var f := FileAccess.open(slot_path(slot), FileAccess.READ)
	var d = JSON.parse_string(f.get_as_text())
	if typeof(d) != TYPE_DICTIONARY or int(d.get("version", 0)) != VERSION:
		push_warning("Save incompatible or corrupted")
		return {}
	return d


## Restores economy + clock. The world rebuilds its nodes from Economy afterwards.
func apply_save(d: Dictionary) -> void:
	Clock.from_dict(d.get("clock", {}))
	Economy.from_dict(d.get("economy", {}))
	loaded.emit(slot_path())
