extends Node
## Static, data-driven definitions loaded from res://data/*.json.
## Adding a good, a business type or a piece of equipment = editing JSON, not code.

var goods: Dictionary = {}
var business_types: Dictionary = {}
var equipment: Dictionary = {}
var balance: Dictionary = {}
var layout: Dictionary = {}
var names: Dictionary = {}


func _ready() -> void:
	goods = _load("res://data/goods.json")
	business_types = _load("res://data/business_types.json")
	equipment = _load("res://data/equipment.json")
	balance = _load("res://data/balance.json")
	layout = _load("res://data/world_layout.json")
	names = _load("res://data/names.json")


func _load(path: String) -> Dictionary:
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("GameData: missing %s" % path)
		return {}
	var parsed = JSON.parse_string(f.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		push_error("GameData: invalid JSON in %s" % path)
		return {}
	return parsed


func bal(key: String, default_value = 0.0):
	return balance.get(key, default_value)


func good_name(id: String) -> String:
	return goods.get(id, {}).get("name", id)


func good_base_price(id: String) -> float:
	return float(goods.get(id, {}).get("base_price", 1.0))


func btype(id: String) -> Dictionary:
	return business_types.get(id, {})


func equip(id: String) -> Dictionary:
	return equipment.get(id, {})


## Returns the business type ids that produce a given good.
func producers_of(good: String) -> Array:
	var out := []
	for t in business_types:
		if good in business_types[t].get("outputs", []):
			out.append(t)
	return out


func random_person_name(rng: RandomNumberGenerator) -> String:
	var first: Array = names.get("first", ["Alex"])
	var last: Array = names.get("last", ["Dupont"])
	return "%s %s" % [first[rng.randi() % first.size()], last[rng.randi() % last.size()]]


static func color(hex: String) -> Color:
	return Color.html(hex)
