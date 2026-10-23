class_name CarryProps
extends RefCounted
## Small meshes for carried objects.


static func build(n: Node3D, kind: String) -> void:
	match kind:
		"suitcase":
			MeshFactory.box(n, Vector3(0.6, 0.45, 0.25), Vector3(0, -0.1, 0), Color("#9d4edd"))
			MeshFactory.box(n, Vector3(0.2, 0.08, 0.05), Vector3(0, 0.17, 0), Color("#333333"))
		"cart":
			MeshFactory.box(n, Vector3(0.7, 0.6, 0.5), Vector3(0, -0.2, 0.1), Color("#457b9d"))
			MeshFactory.box(n, Vector3(0.3, 0.25, 0.3), Vector3(-0.15, 0.2, 0.1), Color("#ffb703"))
			MeshFactory.cylinder(n, 0.08, 0.3, Vector3(0.18, 0.22, 0.1), Color("#06d6a0"))
		"linen":
			MeshFactory.box(n, Vector3(0.6, 0.35, 0.45), Vector3(0, 0, 0), Color("#f8f9fa"))
			MeshFactory.box(n, Vector3(0.25, 0.12, 0.2), Vector3(0, 0.24, 0), Color("#e9c46a"))
		"toolbox":
			MeshFactory.box(n, Vector3(0.55, 0.3, 0.3), Vector3(0, -0.05, 0), Color("#e63946"))
			MeshFactory.box(n, Vector3(0.3, 0.06, 0.06), Vector3(0, 0.16, 0), Color("#333333"))
		"cup":
			MeshFactory.cylinder(n, 0.1, 0.16, Vector3.ZERO, Color.WHITE)
			MeshFactory.cylinder(n, 0.09, 0.01, Vector3(0, 0.08, 0), Color("#6f4518"))
			MeshFactory.cylinder(n, 0.2, 0.02, Vector3(0, -0.08, 0), Color.WHITE)
		"tray":
			MeshFactory.cylinder(n, 0.35, 0.03, Vector3.ZERO, Color("#adb5bd"))
			MeshFactory.sphere(n, 0.22, Vector3(0, 0.08, 0), Color("#dee2e6"))
		"key":
			MeshFactory.box(n, Vector3(0.18, 0.02, 0.12), Vector3.ZERO, Color("#ffd166"))
