extends Node
## Static, data-driven definitions loaded from res://data/*.json.
## New jobs, tasks, rooms, supplies or events = editing JSON, not code.

var building: Dictionary = {}
var room_tiers: Dictionary = {}
var room_items: Dictionary = {}
var facilities: Dictionary = {}
var supplies: Dictionary = {}
var menu: Dictionary = {}
var roles: Dictionary = {}
var tasks: Dictionary = {}
var guests: Dictionary = {}
var events: Array = []
var decor: Dictionary = {}
var upgrades: Dictionary = {}
var balance: Dictionary = {}
var names: Dictionary = {}


func _ready() -> void:
	building = _load("building")
	room_tiers = _load("room_tiers")
	room_items = _load("room_items")
	facilities = _load("facilities")
	supplies = _load("supplies")
	menu = _load("menu")
	roles = _load("roles")
	tasks = _load("tasks")
	guests = _load("guests")
	events = _load("events")
	decor = _load("decor")
	upgrades = _load("upgrades")
	balance = _load("balance")
	names = _load("names")


func _load(n: String):
	var path := "res://data/%s.json" % n
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("GameData: missing %s" % path)
		return {}
	var parsed = JSON.parse_string(f.get_as_text())
	if parsed == null:
		push_error("GameData: invalid JSON in %s" % path)
		return {}
	return parsed


func bal(key: String, default_value = 0.0):
	return balance.get(key, default_value)


func floor_height() -> float:
	return float(building.get("floor_height", 4.0))


func floor_name(f: int) -> String:
	return "Rez-de-chaussée" if f == 0 else ("1er étage" if f == 1 else "%de étage" % f)


func random_person_name(rng: RandomNumberGenerator) -> String:
	var first: Array = names.get("first", ["Alex"])
	var last: Array = names.get("last", ["Dupont"])
	return "%s %s" % [first[rng.randi() % first.size()], last[rng.randi() % last.size()]]
