class_name DecorProps
extends RefCounted
## Procedural meshes for buyable decoration (lobby, café, staff room).


static func build(n: Node3D, id: String) -> void:
	var d: Dictionary = GameData.decor.get(id, {})
	var col := Color(str(d.get("color", "#cccccc")))
	var sz: Array = d.get("size", [1, 1])
	var w := float(sz[0])
	var dp := float(sz[1])
	match id:
		"sofa":
			MeshFactory.box(n, Vector3(w, 0.45, dp), Vector3(0, 0.25, 0), col, true)
			MeshFactory.box(n, Vector3(w, 0.55, 0.22), Vector3(0, 0.7, -dp / 2 + 0.11), col.darkened(0.15))
		"armchair", "massage":
			MeshFactory.box(n, Vector3(w, 0.45, dp), Vector3(0, 0.25, 0), col, true)
			MeshFactory.box(n, Vector3(w, 0.7, 0.2), Vector3(0, 0.75, -dp / 2 + 0.1), col.darkened(0.15))
			MeshFactory.box(n, Vector3(0.15, 0.35, dp), Vector3(-w / 2 + 0.07, 0.6, 0), col.darkened(0.1))
			MeshFactory.box(n, Vector3(0.15, 0.35, dp), Vector3(w / 2 - 0.07, 0.6, 0), col.darkened(0.1))
		"plant":
			MeshFactory.cylinder(n, 0.28, 0.5, Vector3(0, 0.25, 0), Color("#c2703d"), 0.22)
			MeshFactory.sphere(n, 0.45, Vector3(0, 0.95, 0), col)
			MeshFactory.sphere(n, 0.3, Vector3(0.2, 1.3, 0.1), col.lightened(0.15))
		"table_set":
			MeshFactory.cylinder(n, 0.5, 0.06, Vector3(0, 0.75, 0), col)
			MeshFactory.cylinder(n, 0.06, 0.75, Vector3(0, 0.37, 0), Color("#444444"))
			for a in [0.0, PI / 2, PI, PI * 1.5]:
				var p := Vector3(cos(a) * 0.75, 0, sin(a) * 0.75)
				MeshFactory.box(n, Vector3(0.4, 0.06, 0.4), p + Vector3(0, 0.45, 0), Color("#e9c46a"))
			MeshFactory.add_box_collider(n, Vector3(1.0, 0.8, 1.0), Vector3(0, 0.4, 0))
		"piano":
			MeshFactory.box(n, Vector3(1.6, 0.35, 2.0), Vector3(0, 0.95, 0), col, true)
			MeshFactory.box(n, Vector3(1.5, 0.08, 0.3), Vector3(0, 0.92, 1.05), Color.WHITE)
			for p in [Vector3(-0.6, 0.4, -0.7), Vector3(0.6, 0.4, -0.7), Vector3(0, 0.4, 0.8)]:
				MeshFactory.cylinder(n, 0.06, 0.8, p, col)
		"fountain":
			MeshFactory.cylinder(n, 1.0, 0.5, Vector3(0, 0.25, 0), Color("#adb5bd"))
			MeshFactory.cylinder(n, 0.85, 0.52, Vector3(0, 0.27, 0), col)
			MeshFactory.cylinder(n, 0.15, 1.4, Vector3(0, 0.7, 0), Color("#adb5bd"))
			MeshFactory.add_box_collider(n, Vector3(2, 0.6, 2), Vector3(0, 0.3, 0))
		"statue":
			MeshFactory.box(n, Vector3(0.8, 0.6, 0.8), Vector3(0, 0.3, 0), Color("#e9ecef"), true)
			MeshFactory.capsule(n, 0.25, 1.0, Vector3(0, 1.1, 0), col)
			MeshFactory.sphere(n, 0.22, Vector3(0, 1.75, 0), col)
		"rug":
			MeshFactory.box(n, Vector3(w, 0.02, dp), Vector3(0, 0.025, 0), col)
			MeshFactory.box(n, Vector3(w - 0.4, 0.021, dp - 0.4), Vector3(0, 0.03, 0), Color("#e9c46a"))
		"lamp":
			MeshFactory.cylinder(n, 0.04, 1.6, Vector3(0, 0.8, 0), Color("#333333"))
			MeshFactory.cylinder(n, 0.25, 0.3, Vector3(0, 1.7, 0), col, 0.1)
		"arcade":
			MeshFactory.box(n, Vector3(w, 1.8, dp), Vector3(0, 0.9, 0), col, true)
			MeshFactory.box(n, Vector3(w * 0.75, 0.55, 0.05), Vector3(0, 1.35, dp / 2 + 0.01), Color("#4cc9f0")).material_override = MeshFactory.mat(Color("#4cc9f0"), 1.5)
		"coffee_corner":
			MeshFactory.box(n, Vector3(w, 0.9, dp), Vector3(0, 0.45, 0), col, true)
			MeshFactory.box(n, Vector3(0.4, 0.4, 0.4), Vector3(0, 1.1, 0), Color("#c0c0c0"))
		_:
			MeshFactory.box(n, Vector3(w, 1.0, dp), Vector3(0, 0.5, 0), col, true)
