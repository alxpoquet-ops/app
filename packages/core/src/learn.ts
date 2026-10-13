/**
 * Mémoire et apprentissage : ce que l'application a compris de l'entreprise.
 * Sert à la fois à l'interface (valeurs par défaut) et au contexte des agents IA.
 */
import { monthKey } from './dates.ts';
import { seasonality } from './forecast.ts';
import { averageProductMinutes } from './timeStats.ts';
import type { Snapshot } from './types.ts';

export interface Knowledge {
  usualSessionMinutes?: number;
  usualStartHour?: number;
  bestEnergy?: string;
  popularProducts: { name: string; qty: number }[];
  bestEvents: { name: string; avgRevenue: number; editions: number }[];
  productTimes: { name: string; avgMinutes: number }[];
  peakMonths: string[];
  monthlyRevenue: { month: string; revenue: number }[];
}

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function learn(s: Snapshot): Knowledge {
  const logs = s.timeLogs.filter((l) => !l.deleted && l.stepKind !== 'pause');

  // Rythme de travail : durée habituelle d'une journée d'atelier, heure de démarrage.
  const perDay = new Map<string, number>();
  const hours: number[] = [];
  for (const l of logs) {
    perDay.set(l.date, (perDay.get(l.date) ?? 0) + l.minutes);
    if (l.hour != null) hours.push(l.hour);
  }
  const days = [...perDay.values()].sort((a, b) => a - b);
  const usualSessionMinutes = days.length ? days[Math.floor(days.length / 2)] : undefined;
  const usualStartHour = hours.length ? Math.round(median(hours)) : undefined;

  // Énergie la plus productive (unités par heure).
  const byEnergy = new Map<string, { u: number; m: number }>();
  for (const l of logs) if (l.energy) {
    const e = byEnergy.get(l.energy) ?? { u: 0, m: 0 };
    e.u += l.units;
    e.m += l.minutes;
    byEnergy.set(l.energy, e);
  }
  let bestEnergy: string | undefined;
  let bestRate = 0;
  for (const [k, v] of byEnergy) if (v.m > 0 && v.u / v.m > bestRate) { bestRate = v.u / v.m; bestEnergy = k; }

  const qty = new Map<string, number>();
  for (const x of s.sales) if (!x.deleted) qty.set(x.productId, (qty.get(x.productId) ?? 0) + x.qty);
  const popularProducts = [...qty.entries()]
    .map(([pid, q]) => ({ name: s.products.find((p) => p.id === pid)?.name ?? '?', qty: q }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const ev = new Map<string, { name: string; sum: number; n: number }>();
  for (const r of s.eventResults) if (!r.deleted) {
    const e = ev.get(r.seriesKey) ?? { name: r.name, sum: 0, n: 0 };
    e.sum += r.revenue - r.cost;
    e.n += 1;
    ev.set(r.seriesKey, e);
  }
  const bestEvents = [...ev.values()]
    .map((e) => ({ name: e.name, avgRevenue: Math.round(e.sum / e.n), editions: e.n }))
    .sort((a, b) => b.avgRevenue - a.avgRevenue)
    .slice(0, 5);

  const season = seasonality(s.sales);
  const peakMonths = season
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
    .map((x) => MONTHS[x.i]);

  const rev = new Map<string, number>();
  for (const x of s.sales) if (!x.deleted) rev.set(monthKey(x.date), (rev.get(monthKey(x.date)) ?? 0) + x.qty * x.unitPrice);
  const monthlyRevenue = [...rev.entries()].sort().slice(-12).map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));

  return {
    usualSessionMinutes,
    usualStartHour,
    bestEnergy,
    popularProducts,
    bestEvents,
    productTimes: s.products.filter((p) => !p.deleted).map((p) => ({ name: p.name, avgMinutes: Math.round(averageProductMinutes(p, s.timeLogs)) })),
    peakMonths,
    monthlyRevenue,
  };
}

function median(a: number[]) {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}
