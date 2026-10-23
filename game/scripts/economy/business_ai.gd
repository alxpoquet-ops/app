class_name BusinessAI
extends RefCounted
## Daily strategy of AI-run companies (and of player companies that pay for the
## "Gérant IA" automation). Same rules as players: no free money, no infinite
## stock. It reacts to its own P&L, its stock levels and its competitors.


static func daily(eco: Node, b: Business) -> void:
	var last: Dictionary = b.history[-1] if b.history.size() > 0 else {}
	var profit := float(last.get("profit", 0.0))
	var cash: float = eco.biz_cash(b.id)
	_adjust_prices(eco, b, last)
	_maintain_machines(eco, b)
	# --- staffing
	var max_staff := int(b.def().get("max_staff", 4))
	var lost_capacity := int(last.get("lost_capacity", 0))
	if b.is_retail() and lost_capacity > 6 and profit > 0 and cash > 300 and b.employees.size() < max_staff:
		_hire_best(eco, b)
	elif b.kind() == "producer" and _output_is_short(eco, b) and b.avg_profit(3) > 10 and cash > 400 and b.employees.size() < max_staff:
		_hire_best(eco, b)
	var overstaffed := (b.kind() == "producer" and _output_fill(b) > 0.4) or (b.is_retail() and b.kind() == "retail" and lost_capacity == 0)
	if (b.days_in_loss >= 2 or b.avg_profit(3) < 0.0) and b.employees.size() > 1 and overstaffed:
		var weakest := 0
		for i in b.employees.size():
			if float(b.employees[i].skill) / float(b.employees[i].wage) < float(b.employees[weakest].skill) / float(b.employees[weakest].wage):
				weakest = i
		var e: Dictionary = b.employees[weakest]
		eco.transfer(b.account(), Economy.POPULATION, float(e.wage), "indemnités", "Licenciement " + e.name, true)
		b.employees.remove_at(weakest)
		eco._add_news("%s réduit ses effectifs." % b.name)
	# --- investment
	if b.is_ai() and profit > 40 and cash > 1500 and b.level < 3 and b.kind() == "producer" and _output_is_short(eco, b):
		if eco.transfer(b.account(), Economy.EXTERNAL, eco.upgrade_cost(b), "investissement", "Agrandissement"):
			b.level += 1
			eco._add_news("%s s'agrandit (niveau %d)." % [b.name, b.level])
	if b.is_ai() and b.type_id == "cafe" and cash > 2200 and b.avg_profit(5) > 30 and b.machines().size() < 2:
		if eco.transfer(b.account(), Economy.EXTERNAL, 650.0, "équipement", "Nouvelle machine"):
			eco._add_equipment_entry(b, "coffee_machine", 0.3, -3.6, 0)
			eco._add_news("%s investit dans une nouvelle machine à café." % b.name)
	# --- surplus export for producers (keeps warehouses breathing)
	if b.kind() == "producer":
		for g in b.def().get("outputs", []):
			var limit := b.stock_capacity() * 0.45
			if b.qty(g) > limit and b.is_ai():
				var q: float = floor(b.qty(g) - limit)
				b.add_stock(g, -q)
				eco.transfer(Economy.EXTERNAL, b.account(), q * GameData.good_base_price(g) * float(GameData.bal("export_discount", 0.55)), "export", "Export " + g)
	# --- finance
	repay_debt(eco, b)
	if b.is_ai():
		var val: float = eco.valuation(b)
		if not b.for_sale and b.days_in_loss >= 5 and b.debt > 400:
			b.for_sale = true
			b.asking_price = snappedf(val * 0.75, 10.0)
			eco._add_news("« %s » est en difficulté et cherche un repreneur (%s)." % [b.name, Economy.money(b.asking_price)])
		elif b.for_sale and b.days_in_loss == 0 and b.debt < 100:
			b.for_sale = false
		elif not b.for_sale and eco.rng.randf() < 0.08:
			# Occasionally the group sells a healthy business to raise funds.
			b.for_sale = true
			b.asking_price = snappedf(val * 1.1, 10.0)
			eco._add_news("Le Groupe Horizon met « %s » en vente (%s)." % [b.name, Economy.money(b.asking_price)])
		elif b.for_sale:
			b.asking_price = snappedf(lerp(b.asking_price, val * 0.9, 0.2), 10.0)


static func repay_debt(eco: Node, b: Business) -> void:
	if b.debt <= 0:
		return
	var spare: float = eco.biz_cash(b.id) - 400.0
	if spare > 0:
		var amt: float = min(spare * 0.5, b.debt)
		if eco.transfer(b.account(), Economy.BANK, amt, "remboursement", "Remboursement"):
			b.debt -= amt


static func _hire_best(eco: Node, b: Business) -> void:
	var list: Array = eco.candidates.get(b.id, [])
	if list.is_empty():
		return
	var best := 0
	for i in list.size():
		if float(list[i].skill) / float(list[i].wage) > float(list[best].skill) / float(list[best].wage):
			best = i
	var c: Dictionary = list[best]
	c.hired_day = Clock.day
	b.employees.append(c)
	list.remove_at(best)
	eco._add_news("%s embauche %s." % [b.name, c.name])


## True when buyers are draining our warehouse faster than we produce.
static func _output_is_short(eco: Node, b: Business) -> bool:
	for g in b.def().get("outputs", []):
		if b.qty(g) < b.stock_capacity() * 0.08:
			return true
		var importing := 0.0
		for o in eco.orders:
			if o.good == g and o.seller == "port":
				importing += float(o.qty)
		if importing > 0.0 and b.qty(g) < b.stock_capacity() * 0.2:
			return true
	return false


static func _output_fill(b: Business) -> float:
	var f := 0.0
	for g in b.def().get("outputs", []):
		f = max(f, b.qty(g) / max(1.0, b.stock_capacity() * 0.6))
	return f


static func _maintain_machines(eco: Node, b: Business) -> void:
	for e in b.equipment:
		if float(e.condition) < (65.0 if b.is_ai() else 45.0):
			var cost: float = eco.repair_cost(e)
			if eco.biz_cash(b.id) > cost + 200 and eco.transfer(b.account(), Economy.EXTERNAL, cost, "réparations", "Réparation"):
				e.condition = 100.0


static func _adjust_prices(eco: Node, b: Business, last: Dictionary) -> void:
	# Retail: follow competitors and own load.
	for item in b.menu():
		var base := float(b.menu()[item].base_price)
		var mine := b.price_of(item)
		var comp := _competitor_avg(eco, b, item)
		var target := mine
		var served := int(last.get("served", 0))
		var lost := int(last.get("lost", 0))
		if int(last.get("lost_capacity", 0)) > 5 or (lost > served * 0.3 and served > 10):
			target = mine * 1.04          # saturated: raise prices
		elif comp > 0 and mine > comp * 1.12:
			target = mine * 0.96          # price war: follow competition
		elif served < 15:
			target = mine * 0.97
		if b.days_in_loss >= 2:
			target = max(target, mine * 1.03)
		b.sell_prices[item] = clamp(snappedf(target, 0.05), base * 0.6, base * 1.8)
	# Producers: price by stock level (scarcity raises price, surplus lowers it).
	if b.kind() == "producer":
		for g in b.def().get("outputs", []):
			var base_g := GameData.good_base_price(g)
			var fill: float = b.qty(g) / max(1.0, b.stock_capacity() * 0.6)
			var p := b.price_of(g)
			if fill < 0.25:
				p *= 1.06
			elif fill > 0.75:
				p *= 0.96
			else:
				p = lerp(p, base_g, 0.08)
			# never sell under input cost
			var floor_p := base_g * 0.8
			for inp in b.def().recipe.inputs:
				floor_p = max(floor_p, float(b.def().recipe.inputs[inp]) * float(eco.market[inp].ref_price) / float(b.def().recipe.outputs[g]) * 1.1)
			b.sell_prices[g] = clamp(snappedf(p, 0.01), floor_p, base_g * 2.5)


static func _competitor_avg(eco: Node, b: Business, item: String) -> float:
	var s := 0.0
	var n := 0
	for id in eco.businesses:
		var o: Business = eco.businesses[id]
		if o != b and o.menu().has(item) and o.type_id == b.type_id:
			s += o.price_of(item)
			n += 1
	return s / n if n > 0 else 0.0


## Holding-level decisions (once a day).
static func holding_daily(eco: Node) -> void:
	# The holding buys back player companies listed for sale at a fair price after a while.
	for id in eco.businesses:
		var b: Business = eco.businesses[id]
		if not b.is_ai() and b.for_sale and b.asking_price <= eco.valuation(b) * 0.95 and eco.rng.randf() < 0.3:
			if eco.balance(Economy.HOLDING) >= b.asking_price:
				eco.transfer(Economy.HOLDING, "player:" + b.owner_id, b.asking_price, "cession", "Rachat par le groupe")
				eco.notify.emit("Le Groupe Horizon a racheté « %s » pour %s." % [b.name, Economy.money(b.asking_price)], "info")
				b.owner_id = Business.AI_OWNER
				b.for_sale = false
				eco.ownership_changed.emit(b.id)
