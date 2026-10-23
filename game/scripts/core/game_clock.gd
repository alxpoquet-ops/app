extends Node
## World time. One in-game day lasts `real_seconds_per_game_day` real seconds.
## The economy ticks once per in-game hour (see Economy._on_hour).

signal hour_passed(day: int, hour: int)
signal day_passed(day: int)

var day := 1
var minutes := 7.0 * 60.0   # minutes since midnight
var time_scale := 1.0       # 0 = paused (solo only)
var running := false


func game_minutes_per_second() -> float:
	return 1440.0 / float(GameData.bal("real_seconds_per_game_day", 480))


func _process(delta: float) -> void:
	if not running or time_scale <= 0.0:
		return
	advance(delta * game_minutes_per_second() * time_scale)


## Advances time and fires hour/day signals. Also used by tests to fast-forward.
func advance(game_minutes: float) -> void:
	var prev_hour := int(minutes / 60.0)
	minutes += game_minutes
	while true:
		var h := int(minutes / 60.0)
		if h == prev_hour:
			break
		prev_hour += 1
		if prev_hour >= 24:
			minutes -= 1440.0
			prev_hour = 0
			day += 1
			day_passed.emit(day)
		hour_passed.emit(day, prev_hour)


func hour() -> int:
	return int(minutes / 60.0)


func hour_f() -> float:
	return minutes / 60.0


func absolute_hours() -> float:
	return float(day) * 24.0 + minutes / 60.0


func time_string() -> String:
	return "Jour %d — %02d:%02d" % [day, int(minutes / 60.0), int(fmod(minutes, 60.0))]


func to_dict() -> Dictionary:
	return {"day": day, "minutes": minutes}


func from_dict(d: Dictionary) -> void:
	day = int(d.get("day", 1))
	minutes = float(d.get("minutes", 420.0))
