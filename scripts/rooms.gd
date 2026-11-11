extends RefCounted
## Plan des pièces de l'appartement. Leur contenu change selon la boucle (Game.cycle).
##
## Murs : « R » = mur du fond à droite (le long de x), « L » = mur du fond à gauche (le long de y).
## « at » et « width » se mesurent en tuiles le long du mur ; « y » et « h » en pixels.

const START := Vector2(2.4, 4.8)   ## là où Noé se réveille, à côté du lit


static func build(room: String) -> Dictionary:
	match room:
		"entree":
			return _entree()
		"cuisine":
			return _cuisine()
		"sdb":
			return _sdb()
		"palier":
			return _palier()
	return _chambre()


## Une porte intérieure s'ouvre à partir d'une certaine boucle.
static func _kind_from(min_cycle: int) -> String:
	return "passage" if Game.cycle >= min_cycle else "closed"


static func _chambre() -> Dictionary:
	var c := Game.cycle
	var win := "carton"
	if c == 3:
		win = "carton_text"
	elif c == 4:
		win = "open" if Game.has("window_ripped") else "torn"
	elif c == Game.CYCLE_DAWN:
		win = "dawn"
	var d := {
		"w": 7, "h": 6, "floor": "wood",
		"doors": [
			{"id": "door:entree", "wall": "R", "at": 4.8, "width": 1.1, "kind": "passage", "to": "entree", "label": "Entrée"},
		],
		"walls": [
			{"id": "window", "wall": "L", "at": 0.6, "width": 1.8, "y": 16.0, "h": 24.0, "kind": "window", "state": win, "label": "Fenêtre"},
			{"id": "clock", "wall": "R", "at": 0.8, "width": 0.6, "y": 32.0, "h": 12.0, "kind": "clock", "label": "Horloge"},
		],
		"props": [
			{"id": "bed", "kind": "bed", "g": Vector2(0, 3.0), "s": Vector2(1.8, 3.0), "h": 9.0, "label": "Lit"},
			{"id": "desk", "kind": "desk", "g": Vector2(2.2, 0), "s": Vector2(1.4, 0.8), "h": 13.0, "label": "Bureau"},
			{"id": "boxes", "kind": "box", "g": Vector2(3.9, 0.05), "s": Vector2(0.8, 0.8), "h": 12.0, "label": "Cartons"},
			{"id": "boxes", "kind": "box", "g": Vector2(5.7, 1.6), "s": Vector2(0.9, 0.9), "h": 12.0, "label": "Cartons"},
			{"id": "boxes", "kind": "box", "g": Vector2(5.9, 2.7), "s": Vector2(0.8, 0.8), "h": 9.0, "label": "Cartons"},
			{"id": "carton", "kind": "box", "fragile": true, "g": Vector2(3.6, 2.8), "s": Vector2(1, 1), "h": 11.0, "label": "Carton fragile"},
		],
	}
	if c == 1 and not Game.has("lantern"):
		d.props.append({"id": "lantern", "kind": "lantern", "g": Vector2(2.45, 3.75), "s": Vector2(0.3, 0.3), "h": 8.0, "block": false, "label": "Lanterne"})
	return d


static func _entree() -> Dictionary:
	var c := Game.cycle
	var d := {
		"w": 6, "h": 6, "floor": "wood",
		"doors": [
			{"id": "door:chambre", "wall": "L", "at": 0.8, "width": 1.1, "kind": "passage", "to": "chambre", "label": "Chambre"},
			{"id": "door:sdb", "wall": "L", "at": 3.6, "width": 1.1, "kind": _kind_from(3), "to": "sdb", "label": "Salle de bain"},
			{"id": "door:cuisine", "wall": "R", "at": 0.6, "width": 1.1, "kind": _kind_from(2), "to": "cuisine", "label": "Cuisine"},
			{"id": "front", "wall": "R", "at": 3.4, "width": 1.3, "kind": "open_front" if c == Game.CYCLE_DAWN else "front", "to": "palier",
				"label": "Sortir" if c == Game.CYCLE_DAWN else "Porte d'entrée"},
		],
		"walls": [],
		"props": [
			{"id": "shoes", "kind": "shoes", "g": Vector2(5.1, 0.05), "s": Vector2(0.8, 0.7), "h": 12.0, "label": "Meuble à chaussures"},
			{"id": "mail", "kind": "mail", "g": Vector2(2.4, 0.1), "s": Vector2(0.7, 0.45), "h": 2.0, "block": false, "label": "Courrier"},
		],
	}
	if c >= 3:
		d.walls.append({"id": "tally", "wall": "L", "at": 2.1, "width": 1.25, "y": 12.0, "h": 28.0, "kind": "tally", "label": "Traits sur le mur"})
	return d


static func _cuisine() -> Dictionary:
	return {
		"w": 6, "h": 5, "floor": "wood",
		"doors": [
			{"id": "door:entree", "wall": "L", "at": 2.0, "width": 1.1, "kind": "passage", "to": "entree", "label": "Entrée"},
		],
		"walls": [
			{"id": "calendar", "wall": "R", "at": 3.9, "width": 0.55, "y": 24.0, "h": 12.0, "kind": "calendar", "label": "Calendrier"},
		],
		"props": [
			{"id": "counter", "kind": "counter", "g": Vector2(0.6, 0), "s": Vector2(3.0, 0.9), "h": 15.0, "label": "Évier"},
			{"id": "fridge", "kind": "fridge", "g": Vector2(4.9, 0.05), "s": Vector2(1.0, 0.9), "h": 36.0, "label": "Frigo"},
			{"id": "phone", "kind": "table", "phone": true, "g": Vector2(2.2, 2.0), "s": Vector2(1.6, 1.2), "h": 11.0, "label": "Téléphone"},
			{"id": "chair", "kind": "chair", "g": Vector2(2.6, 3.45), "s": Vector2(0.7, 0.7), "h": 16.0, "label": "Chaise"},
		],
	}


static func _sdb() -> Dictionary:
	return {
		"w": 5, "h": 5, "floor": "tile",
		"doors": [
			{"id": "door:entree", "wall": "R", "at": 0.4, "width": 1.1, "kind": "passage", "to": "entree", "label": "Entrée"},
		],
		"walls": [
			{"wall": "L", "at": 1.85, "width": 0.9, "y": 22.0, "h": 18.0, "kind": "mirror"},
		],
		"props": [
			{"id": "mirror", "kind": "basin", "g": Vector2(0, 1.85), "s": Vector2(0.7, 0.9), "h": 15.0, "label": "Miroir"},
			{"id": "bath", "kind": "bath", "g": Vector2(2.0, 0), "s": Vector2(2.8, 1.3), "h": 11.0, "label": "Baignoire"},
			{"id": "laundry", "kind": "laundry", "g": Vector2(3.9, 3.7), "s": Vector2(0.7, 0.7), "h": 9.0, "label": "Panier à linge"},
		],
	}


static func _palier() -> Dictionary:
	return {
		"w": 7, "h": 5, "floor": "terracotta",
		"doors": [
			{"id": "door:entree", "wall": "L", "at": 1.2, "width": 1.2, "kind": "open_front", "to": "entree", "label": "Appartement"},
		],
		"walls": [
			{"id": "window_palier", "wall": "R", "at": 2.2, "width": 2.6, "y": 10.0, "h": 38.0, "kind": "sunrise", "label": "Fenêtre"},
		],
		"props": [
			{"id": "plant", "kind": "plant", "g": Vector2(6.1, 0.1), "s": Vector2(0.7, 0.7), "h": 18.0, "label": "Plante"},
			{"id": "stairs", "kind": "stairs", "g": Vector2(4.4, 3.0), "s": Vector2(2.6, 2.0), "h": 2.0, "label": "Escalier"},
		],
	}
