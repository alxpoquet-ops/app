extends AudioStreamPlayer
## Ambiance sonore générée en temps réel : nappes graves, coups à la porte, vibreur…
## Provisoire : pratique pour le prototype, à remplacer par une vraie musique.

const RATE := 11025.0
const MOODS := {
	"c1": {"f": [49.0, 49.35, 73.4], "a": 0.10, "n": 0.012},
	"c2": {"f": [51.9, 52.3, 77.8], "a": 0.10, "n": 0.015},
	"c3": {"f": [46.2, 46.7, 65.4, 97.9], "a": 0.11, "n": 0.025},
	"c4": {"f": [55.0, 82.4, 110.0, 138.6], "a": 0.075, "n": 0.008},
	"dark": {"f": [41.2, 41.6, 58.3], "a": 0.13, "n": 0.03},
	"silence": {"f": [], "a": 0.0, "n": 0.0},
	"credits": {"f": [110.0, 164.8, 220.0, 277.2], "a": 0.05, "n": 0.0},
	"dawn": {"f": [110.0, 138.6, 164.8, 220.0, 329.6], "a": 0.055, "n": 0.0},
}
const SFX_LEN := {"knock": 1.2, "buzz": 0.9, "chime": 2.0, "static": 1.4, "thud": 0.8, "creak": 1.6, "flicker": 1.0, "rip": 0.6}

var pb: AudioStreamGeneratorPlayback
var freqs: Array = []
var phases: Array = []
var amp := 0.0
var amp_target := 0.0
var noise_amp := 0.0
var noise_target := 0.0
var brown := 0.0
var lfo := 0.0
var sfx_list: Array = []


func _ready() -> void:
	var gen := AudioStreamGenerator.new()
	gen.mix_rate = RATE
	gen.buffer_length = 0.25
	stream = gen
	# Sur le web, Godot joue par défaut des « échantillons » : un flux généré doit passer en mode flux.
	playback_type = AudioServer.PLAYBACK_TYPE_STREAM
	volume_db = -3.0
	play()
	pb = get_stream_playback() as AudioStreamGeneratorPlayback


func set_mood(mood: String) -> void:
	var m: Dictionary = MOODS.get(mood, MOODS["silence"])
	freqs.clear()
	for f in m.f:
		freqs.append(float(f))
	while phases.size() < freqs.size():
		phases.append(0.0)
	amp *= 0.3
	amp_target = m.a
	noise_target = m.n


func sfx(kind: String) -> void:
	sfx_list.append({"k": kind, "t": 0.0})


func _process(_delta: float) -> void:
	if pb == null:
		return
	var n := pb.get_frames_available()
	if n <= 0:
		return
	var buf := PackedVector2Array()
	buf.resize(n)
	var dt := 1.0 / RATE
	for i in n:
		amp += (amp_target - amp) * 0.0004
		noise_amp += (noise_target - noise_amp) * 0.0004
		lfo += dt * 0.11
		var s := 0.0
		for k in freqs.size():
			phases[k] = fmod(phases[k] + freqs[k] * dt, 1.0)
			s += sin(phases[k] * TAU) / (1.0 + k * 0.6)
		s *= amp * (0.8 + 0.2 * sin(lfo * TAU))
		brown = clampf(brown * 0.995 + (randf() - 0.5) * 0.06, -1.0, 1.0)
		s += brown * noise_amp * 4.0
		for e in sfx_list:
			s += _sample(e, dt)
		s = clampf(s, -0.9, 0.9)
		buf[i] = Vector2(s, s)
	pb.push_buffer(buf)
	sfx_list = sfx_list.filter(func(e): return e.t < SFX_LEN.get(e.k, 1.0))


func _sample(e: Dictionary, dt: float) -> float:
	var t: float = e.t
	e.t = t + dt
	match e.k:
		"knock":
			var v := 0.0
			for t0 in [0.0, 0.42, 0.84]:
				var u: float = t - t0
				if u >= 0.0 and u < 0.3:
					v += (sin(u * TAU * 68.0) * 0.9 + (randf() - 0.5) * 0.5) * exp(-u * 22.0)
			return v * 0.7
		"buzz":
			var on := fmod(t * 7.0, 1.0) < 0.55
			return (0.05 if sin(t * TAU * 150.0) > 0.0 else -0.05) * (1.0 if on else 0.0)
		"chime":
			return (sin(t * TAU * 659.3) + 0.5 * sin(t * TAU * 987.8)) * 0.07 * exp(-t * 2.2)
		"static":
			return (randf() - 0.5) * 0.16 * (0.6 + 0.4 * sin(t * 37.0)) * (1.0 - t / 1.4)
		"thud":
			return sin(t * TAU * (45.0 - t * 20.0)) * 0.6 * exp(-t * 5.0)
		"creak":
			var f := 90.0 + t * 120.0
			return (fmod(t * f, 1.0) - 0.5) * 0.1 * sin(t * PI / 1.6) + (randf() - 0.5) * 0.02
		"flicker":
			return (randf() - 0.5) * 0.25 if randf() < 0.08 else 0.0
		"rip":
			return (randf() - 0.5) * 0.3 * exp(-t * 3.0)
	return 0.0
