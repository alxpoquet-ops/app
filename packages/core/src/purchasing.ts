/**
 * "À ACHETER" : le responsable achats.
 *
 * Besoin matière = (besoins produits sur 45 j : commandes + événements +
 * prévisions + stock mini) × nomenclature + stock minimum de l'article.
 * Recommandation = besoin − stock, arrondi au conditionnement fournisseur.
 * Rien n'est jamais acheté automatiquement : chaque ligne passe par une validation.
 */
import { productDemand } from './forecast.ts';
import type { ID, Snapshot } from './types.ts';

export interface PurchaseSuggestion {
  itemId: ID;
  name: string;
  unit: string;
  current: number;
  recommended: number;
  budget?: number;
  supplierName?: string;
  supplierUrl?: string;
  urgency: 'rupture' | 'bientot' | 'prevoir';
  reasons: string[];
}

export function purchaseSuggestions(s: Snapshot, horizonDays = 45): PurchaseSuggestion[] {
  const products = new Map(s.products.filter((p) => !p.deleted).map((p) => [p.id, p]));
  const need = new Map<ID, { qty: number; reasons: Set<string>; urgent: number }>();
  const add = (itemId: ID, qty: number, why: string, inDays: number) => {
    const n = need.get(itemId) ?? { qty: 0, reasons: new Set<string>(), urgent: 999 };
    n.qty += qty;
    n.reasons.add(why);
    n.urgent = Math.min(n.urgent, inDays);
    need.set(itemId, n);
  };

  // Unités finies à produire = demande − stock, + commandes clients non couvertes.
  const toMake = new Map<ID, { units: number; why: string; inDays: number }>();
  const demand = productDemand(s, horizonDays);
  for (const [pid, d] of Object.entries(demand)) {
    const p = products.get(pid);
    if (!p) continue;
    const units = Math.ceil(d.units - Math.max(0, p.stock));
    if (units > 0) toMake.set(pid, { units, why: `${p.name} (${d.reasons[0]})`, inDays: d.urgencyDays });
  }
  for (const o of s.orders) {
    if (o.deleted || !o.productId || !(o.status === 'nouvelle' || o.status === 'en_cours')) continue;
    const p = products.get(o.productId);
    if (!p) continue;
    const t = toMake.get(p.id) ?? { units: 0, why: `commande ${o.client}`, inDays: 999 };
    t.units += Math.max(0, o.quantity - o.produced);
    t.why = `commande ${o.client}`;
    toMake.set(p.id, t);
  }
  for (const [pid, t] of toMake) {
    const p = products.get(pid)!;
    for (const l of [...p.components, ...p.consumables]) add(l.itemId, l.qty * t.units, t.why, t.inDays);
  }

  const out: PurchaseSuggestion[] = [];
  for (const it of s.items) {
    if (it.deleted) continue;
    const n = need.get(it.id);
    const required = (n?.qty ?? 0) + it.minStock;
    let missing = required - it.stock;
    if (missing <= 0 && it.stock > it.minStock) continue;
    if (missing <= 0) missing = Math.max(0, it.minStock - it.stock);
    if (missing <= 0) continue;
    const pack = it.packSize && it.packSize > 0 ? it.packSize : 1;
    const recommended = Math.ceil(missing / pack) * pack;
    const reasons = n ? [...n.reasons].slice(0, 3) : [];
    if (it.stock <= it.minStock) reasons.unshift(it.stock <= 0 ? 'en rupture' : `sous le minimum (${it.minStock})`);
    const urgency: PurchaseSuggestion['urgency'] =
      it.stock <= 0 || (n && n.urgent <= 7 && it.stock < n.qty) ? 'rupture' : n && n.urgent <= 21 ? 'bientot' : 'prevoir';
    out.push({
      itemId: it.id,
      name: it.name,
      unit: it.unit,
      current: it.stock,
      recommended,
      budget: it.unitCost != null ? Math.round(recommended * it.unitCost * 100) / 100 : undefined,
      supplierName: it.supplierName,
      supplierUrl: it.supplierUrl,
      urgency,
      reasons,
    });
  }
  const rank = { rupture: 0, bientot: 1, prevoir: 2 };
  return out.sort((a, b) => rank[a.urgency] - rank[b.urgency] || (b.budget ?? 0) - (a.budget ?? 0));
}
