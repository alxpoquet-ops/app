// L'obscurité du jeu : un voile tramé (dithering) qui ne laisse voir
// que ce qu'éclaire la lanterne… et le fil de lumière sous la porte.
shader_type canvas_item;

uniform vec2 screen_size = vec2(384.0, 216.0);
uniform vec2 light_pos = vec2(-999.0);
uniform float light_radius = 60.0;
uniform float darkness : hint_range(0.0, 1.0) = 0.9;
uniform vec4 dark_color : source_color = vec4(0.01, 0.015, 0.035, 1.0);
uniform vec4 warm_color : source_color = vec4(1.0, 0.78, 0.45, 1.0);
uniform vec2 door_pos = vec2(-999.0);
uniform float door_radius = 0.0;

float bayer4(vec2 p) {
	int x = int(mod(p.x, 4.0));
	int y = int(mod(p.y, 4.0));
	int i = x + y * 4;
	float m[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0,
			3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
	return (m[i] + 0.5) / 16.0;
}

void fragment() {
	vec2 p = floor(UV * screen_size);
	float l1 = 0.0;
	if (light_radius > 1.0) {
		l1 = 1.0 - smoothstep(light_radius * 0.3, light_radius, length(p - light_pos));
	}
	float l2 = 0.0;
	if (door_radius > 1.0) {
		vec2 q = p - door_pos;
		q.y *= 2.6;
		l2 = 1.0 - smoothstep(door_radius * 0.15, door_radius, length(q));
	}
	float light = max(l1, l2);
	float t = bayer4(p);
	float a = darkness * (1.0 - light);
	float qa = clamp(floor(a * 4.0 + t) / 4.0, 0.0, 1.0);
	if (qa > 0.001) {
		COLOR = vec4(dark_color.rgb, qa);
	} else {
		float glow = floor(light * light * 3.0 + t) / 3.0;
		COLOR = vec4(warm_color.rgb, glow * 0.10 * step(0.01, darkness));
	}
}
