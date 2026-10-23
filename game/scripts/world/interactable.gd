class_name Interactable
extends Node3D
## Generic interaction point. The player picks the closest one in range and
## shows its prompt; E triggers `action_fn`, R triggers `alt_action_fn`.
## Prompts are callables so the text always reflects the live game state.

var radius := 2.2
var prompt_fn: Callable      # func(player) -> String  ("" = nothing to do here)
var action_fn: Callable      # func(player) -> void
var alt_prompt_fn: Callable
var alt_action_fn: Callable
var priority := 0            # higher wins when several are in range


func _ready() -> void:
	add_to_group("interactable")


static func make(parent: Node, pos: Vector3, r: float, p_fn: Callable, a_fn: Callable) -> Interactable:
	var i := Interactable.new()
	i.radius = r
	i.prompt_fn = p_fn
	i.action_fn = a_fn
	i.position = pos
	parent.add_child(i)
	return i


func prompt(player: Node) -> String:
	return prompt_fn.call(player) if prompt_fn.is_valid() else ""


func alt_prompt(player: Node) -> String:
	return alt_prompt_fn.call(player) if alt_prompt_fn.is_valid() else ""
