import { daysBetween, monthKey } from './dates.ts';
import { monthRevenue } from './forecast.ts';
import { purchaseSuggestions } from './purchasing.ts';
import { workshopMinutes } from './timeStats.ts';
import type { Snapshot } from './types.ts';

export interface Recap {
  revenue: number;
  goal: number;
  progress: number;
  bestProduct?: { name: string; qty: number };
  workshopMinutes: number;
  urgentOrder?: { client: string; dueDate?: string; description: string };
  nextEvent?: { name: string; date: string; inDays: number };
  alert?: string;
}

/** RÉCAP : huit chiffres, pas un de plus. */
export function buildRecap(s: Snapshot): Recap {
  const month = monthKey(s.today);
  const revenue = monthRevenue(s.sales, month);
  const goal = s.profile?.monthlyRevenueGoal ?? 0;

  const qtyBy = new Map<string, number>();
  for (const x of s.sales) if (!x.deleted && monthKey(x.date) === month) qtyBy.set(x.productId, (qtyBy.get(x.productId) ?? 0) + x.qty);
  let bestProduct: Recap['bestProduct'];
  for (const [pid, qty] of qtyBy) {
    if (!bestProduct || qty > bestProduct.qty) {
      const p = s.products.find((p) => p.id === pid);
      if (p) bestProduct = { name: p.name, qty };
    }
  }

  const urgent = s.orders
    .filter((o) => !o.deleted && o.status !== 'livree' && o.status !== 'annulee')
    .filter((o) => o.priority === 'urgente' || (o.dueDate && daysBetween(s.today, o.dueDate) <= 3))
    .sort((a, b) => (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9'))[0];

  const next = s.events
    .filter((e) => !e.deleted && e.status === 'inscrit' && e.date >= s.today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  let alert: string | undefined;
  const rupture = purchaseSuggestions(s).find((x) => x.urgency === 'rupture');
  const outProducts = s.products.filter((p) => !p.deleted && p.minStock > 0 && p.stock <= 0);
  if (urgent && urgent.dueDate && daysBetween(s.today, urgent.dueDate) < 0) alert = `Commande de ${urgent.client} en retard.`;
  else if (rupture) alert = `${rupture.name} : rupture imminente.`;
  else if (outProducts.length) alert = `${outProducts[0].name} n'est plus en stock.`;

  return {
    revenue,
    goal,
    progress: goal > 0 ? Math.round((revenue / goal) * 100) : 0,
    bestProduct,
    workshopMinutes: workshopMinutes(s.timeLogs, `${month}-01`, `${month}-31`),
    urgentOrder: urgent ? { client: urgent.client, dueDate: urgent.dueDate, description: urgent.description } : undefined,
    nextEvent: next ? { name: next.name, date: next.date, inDays: daysBetween(s.today, next.date) } : undefined,
    alert,
  };
}
