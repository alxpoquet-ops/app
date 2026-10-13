import { addDays, daysBetween, monthKey, parseISODate } from './dates.ts';
import type { EventResult, ISODate, MarketEvent, Product, Sale, Snapshot } from './types.ts';

/**
 * Saisonnalité a priori des métiers d'art / création en France.
 * Mélangée progressivement avec la saisonnalité réellement observée.
 */
const PRIOR_SEASONALITY = [0.7, 0.8, 0.85, 0.95, 1.05, 1.0, 0.95, 0.9, 0.95, 1.05, 1.35, 1.75];

/** Indice saisonnier par mois (0 = janvier), appris de l'historique. */
export function seasonality(sales: Sale[]): number[] {
  const byMonth = new Array(12).fill(0);
  const months = new Set<string>();
  for (const s of sales) {
    if (s.deleted) continue;
    byMonth[parseISODate(s.date).getMonth()] += s.qty * s.unitPrice;
    months.add(monthKey(s.date));
  }
  const total = byMonth.reduce((a, b) => a + b, 0);
  if (total === 0) return PRIOR_SEASONALITY;
  const mean = total / 12;
  const observed = byMonth.map((v) => (mean > 0 ? v / mean : 1));
  // Confiance proportionnelle au nombre de mois d'historique (pleine à 24 mois).
  const c = Math.min(1, months.size / 24);
  return PRIOR_SEASONALITY.map((p, i) => p * (1 - c) + (observed[i] || 0.3) * c);
}

/** Ventes moyennes journalières hors marchés (ventes "de fond") sur 120 jours. */
export function baseDailyRate(productId: string, sales: Sale[], today: ISODate): number {
  const from = addDays(today, -120);
  const qty = sales
    .filter((s) => !s.deleted && s.productId === productId && s.channel !== 'marche' && s.date >= from && s.date <= today)
    .reduce((a, s) => a + s.qty, 0);
  return qty / 120;
}

/** Unités attendues (hors événements et commandes) sur un horizon. */
export function forecastUnits(product: Product, sales: Sale[], today: ISODate, days: number): number {
  const rate = baseDailyRate(product.id, sales, today);
  if (rate === 0) return 0;
  const season = seasonality(sales);
  const curMonth = parseISODate(today).getMonth();
  let total = 0;
  for (let i = 0; i < days; i++) {
    const m = parseISODate(addDays(today, i)).getMonth();
    total += (rate * season[m]) / season[curMonth];
  }
  return total;
}

export interface EventExpectation {
  revenue: number;
  cost: number;
  /** Unités attendues par produit. */
  units: Record<string, number>;
  basis: 'historique' | 'type' | 'defaut';
  history: { year: number; revenue: number }[];
  trend: 'hausse' | 'baisse' | 'stable' | 'inconnu';
}

/**
 * Ce qu'on peut attendre d'un événement, appris des éditions précédentes.
 * Ex : Marché de Rethel 2027 : 520 €, 2028 : 610 €, 2029 : 580 € → ~585 €.
 */
export function expectEvent(event: MarketEvent, results: EventResult[], products: Product[]): EventExpectation {
  const live = results.filter((r) => !r.deleted);
  const same = live.filter((r) => r.seriesKey === event.seriesKey).sort((a, b) => a.date.localeCompare(b.date));
  const history = same.map((r) => ({ year: parseISODate(r.date).getFullYear(), revenue: r.revenue }));

  let pool = same;
  let basis: EventExpectation['basis'] = 'historique';
  if (pool.length === 0) {
    pool = live;
    basis = pool.length ? 'type' : 'defaut';
  }

  let revenue: number;
  let cost: number;
  if (pool.length === 0) {
    revenue = event.type === 'noel' ? 450 : 300;
    cost = event.standCost ?? 40;
  } else {
    // Moyenne pondérée : les éditions récentes comptent davantage.
    let w = 0;
    let rv = 0;
    let cs = 0;
    pool.forEach((r, i) => {
      const wi = 1 + i;
      w += wi;
      rv += r.revenue * wi;
      cs += r.cost * wi;
    });
    revenue = rv / w;
    cost = event.standCost ?? cs / w;
    if (basis === 'type' && event.type === 'noel') revenue *= 1.3;
  }

  let trend: EventExpectation['trend'] = 'inconnu';
  if (same.length >= 2) {
    const last = same[same.length - 1].revenue;
    const prev = same.slice(0, -1).reduce((a, r) => a + r.revenue, 0) / (same.length - 1);
    trend = last > prev * 1.08 ? 'hausse' : last < prev * 0.92 ? 'baisse' : 'stable';
  }

  // Répartition des unités : mix produit observé sur ces événements, sinon prix moyen.
  const units: Record<string, number> = {};
  const soldMix: Record<string, number> = {};
  let soldTotal = 0;
  for (const r of pool) for (const p of r.productsSold) {
    soldMix[p.productId] = (soldMix[p.productId] ?? 0) + p.qty;
    soldTotal += p.qty;
  }
  const active = products.filter((p) => !p.deleted);
  if (soldTotal > 0) {
    const n = pool.length;
    for (const [pid, q] of Object.entries(soldMix)) units[pid] = q / n;
  } else if (active.length) {
    const avgPrice = active.reduce((a, p) => a + p.price, 0) / active.length;
    const totalUnits = avgPrice > 0 ? revenue / avgPrice : 0;
    for (const p of active) units[p.id] = totalUnits / active.length;
  }
  return { revenue, cost, units, basis, history, trend };
}

/** Événements confirmés (inscrit / candidature) dans l'horizon donné. */
export function upcomingEvents(s: Snapshot, days: number): MarketEvent[] {
  return s.events
    .filter((e) => !e.deleted && (e.status === 'inscrit' || e.status === 'candidature'))
    .filter((e) => {
      const d = daysBetween(s.today, e.date);
      return d >= 0 && d <= days;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Besoin total en unités finies par produit sur l'horizon :
 * commandes ouvertes + événements à venir + ventes de fond prévues + stock minimum.
 */
export function productDemand(s: Snapshot, horizonDays = 45) {
  const demand: Record<string, { units: number; reasons: string[]; urgencyDays: number }> = {};
  const add = (pid: string, u: number, reason: string, inDays: number) => {
    if (u <= 0) return;
    const d = (demand[pid] ??= { units: 0, reasons: [], urgencyDays: 999 });
    d.units += u;
    d.reasons.push(reason);
    d.urgencyDays = Math.min(d.urgencyDays, inDays);
  };
  const products = s.products.filter((p) => !p.deleted);
  for (const p of products) {
    const f = forecastUnits(p, s.sales, s.today, 30);
    if (f >= 0.5) add(p.id, Math.round(f), `≈${Math.round(f)} ventes prévues ce mois-ci`, 30);
    if (p.minStock > 0) add(p.id, p.minStock, `stock minimum ${p.minStock}`, 21);
  }
  for (const e of upcomingEvents(s, horizonDays)) {
    const exp = expectEvent(e, s.eventResults, products);
    const inDays = daysBetween(s.today, e.date);
    for (const [pid, u] of Object.entries(exp.units)) add(pid, Math.ceil(u), `${e.name} dans ${inDays} j`, inDays);
  }
  return demand;
}

export function monthRevenue(sales: Sale[], month: string): number {
  return sales.filter((s) => !s.deleted && monthKey(s.date) === month).reduce((a, s) => a + s.qty * s.unitPrice, 0);
}
