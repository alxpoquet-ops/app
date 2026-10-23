class_name GuestActor
extends Actor
## A hotel guest (or a café walk-in visitor) moving through the building
## according to the intents decided by the simulation.

var gid := ""
var walkin := false


func setup_guest(w: Node, guest_id: String, rng: RandomNumberGenerator, is_walkin := false) -> void:
	gid = guest_id
	walkin = is_walkin
	var hat := Color(0, 0, 0, 0)
	if not walkin and Hotel.guests.has(gid):
		match Hotel.guests[gid].type:
			"vip": hat = Color("#ffd166")
			"affaires": hat = Color("#343a40")
			"touriste": hat = Color("#f4a261")
	setup_actor(w, rng, Color(0, 0, 0, 0), hat)
	move_speed = rng.randf_range(2.2, 3.0)


func g() -> Dictionary:
	return Hotel.guests.get(gid, {})


# ------------------------------------------------------------------ flows
func arrive() -> void:
	place_at("street")
	carry("suitcase")
	world.reception_q.join(self, func(): Hotel.guest_at_desk(gid))


func handle(intent: String) -> void:
	match intent:
		"go_room":
			world.reception_q.leave(self)
			drop()
			say("Merci !", 1.5, Color("#80ed99"))
			go_room()
		"cafe":
			_from_room()
			world.cafe_q.join(self, func(): Hotel.guest_at_cafe(gid))
		"cafe_done":
			world.cafe_q.leave(self)
			if walkin:
				_exit()
			else:
				go_room()
		"concierge":
			_from_room()
			world.concierge_q.join(self, func(): Hotel.guest_at_concierge(gid))
		"concierge_done":
			world.concierge_q.leave(self)
			go_room()
		"out":
			_from_room()
			say("À ce soir !", 1.5)
			_exit()
		"checkout":
			_from_room()
			world.reception_q.join(self, func(): Hotel.guest_at_desk(gid))
		"leave":
			world.reception_q.leave(self)
			world.cafe_q.leave(self)
			world.concierge_q.leave(self)
			var gd := g()
			if not gd.is_empty() and not Hotel.reviews.is_empty() and Hotel.reviews[0].name == gd.name:
				var stars := int(Hotel.reviews[0].stars)
				say("★".repeat(stars) + "☆".repeat(5 - stars), 4.0, Color("#ffd166") if stars >= 4 else Color("#ff8fa3"))
			_exit()


func _from_room() -> void:
	hidden_in_room = false


func go_room() -> void:
	var gd := g()
	if gd.is_empty() or gd.room == "":
		_exit()
		return
	var off := Vector3(randf_range(-1.2, 1.2), 0, randf_range(-1.0, 1.0))
	go_point("room:" + gd.room, func(): Hotel.guest_in_room(gid), off)


func _exit() -> void:
	go_point("street", func():
		if walkin:
			world.remove_walkin(self)
		else:
			Hotel.guest_left_building(gid)
			world.remove_guest_actor(gid))


func walkin_start() -> void:
	place_at("street")
	world.cafe_q.join(self, func(): Hotel.walkin_cafe_order(gid))
