/**
 * Classement des événements : 🔥 Prioritaire / 👍 Intéressant / 💤 Faible intérêt.
 * Chaque recommandation est expliquée en phrases courtes.
 */
import { daysBetween, isFrenchHoliday, isWeekend, monthKey } from './dates.ts';
import { expectEvent, type EventExpectation } from './forecast.ts';
import type { BusinessProfile, EventTier, MarketEvent, Snapshot } from './types.ts';

export interface RankedEvent {
  event: MarketEvent;
  tier: EventTier;
  score: number;
  reasons: string[];
  blockers: string[];
  expectation: EventExpectation;
  expectedProfit: number;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\b(19|20)\d{2}\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function availabilityOk(date: string, p: BusinessProfile): boolean {
  if (isFrenchHoliday(date)) return p.availability.feries || (isWeekend(date) ? p.availability.weekend : p.availability.semaine);
  return isWeekend(date) ? p.availability.weekend : p.availability.semaine;
}

export function rankEvents(s: Snapshot): RankedEvent[] {
  const p = s.profile;
  const products = s.products.filter((x) => !x.deleted);
  const candidates = s.events.filter(
    (e) => !e.deleted && e.date >= s.today && e.status !== 'ignore' && e.status !== 'refuse' && e.status !== 'passe',
  );
  // Nombre d'événements déjà retenus par mois (pour respecter le plafond).
  const perMonth = new Map<string, number>();
  for (const e of candidates) if (e.status === 'inscrit' || e.status === 'candidature') {
    perMonth.set(monthKey(e.date), (perMonth.get(monthKey(e.date)) ?? 0) + 1);
  }

  const ranked = candidates.map((e): RankedEvent => {
    const exp = expectEvent(e, s.eventResults, products);
    const cost = e.standCost ?? exp.cost;
    const travel = (e.distanceKm ?? 0) * 2 * 0.35; // aller-retour, ~0,35 €/km
    const profit = exp.revenue - cost - travel;
    const reasons: string[] = [];
    const blockers: string[] = [];
    let score = 50;

    if (exp.basis === 'historique') {
      const h = exp.history.map((x) => `${x.year} : ${Math.round(x.revenue)} €`).join(', ');
      reasons.push(`Déjà fait : ${h}.`);
      if (exp.trend === 'hausse') { score += 10; reasons.push('Tendance en hausse.'); }
      if (exp.trend === 'baisse') { score -= 10; reasons.push('Tendance en baisse.'); }
    } else {
      reasons.push(`Jamais fait : estimation ~${Math.round(exp.revenue)} € de CA.`);
    }
    const ratio = cost > 0 ? exp.revenue / cost : exp.revenue / 10;
    score += Math.max(-25, Math.min(30, (ratio - 4) * 5));
    reasons.push(`Bénéfice estimé ~${Math.round(profit)} € (stand ${Math.round(cost)} €${travel ? `, route ~${Math.round(travel)} €` : ''}).`);
    if (e.type === 'noel') { score += 12; reasons.push('Période de Noël : forte affluence.'); }
    if (e.type === 'createurs' || e.type === 'exposition') score += 5;

    if (p) {
      if (e.distanceKm != null) {
        if (e.distanceKm > p.maxDistanceKm) blockers.push(`Trop loin (${e.distanceKm} km > ${p.maxDistanceKm} km).`);
        else if (e.distanceKm <= p.maxDistanceKm / 3) { score += 6; reasons.push(`Proche (${e.distanceKm} km).`); }
      }
      if (cost > p.maxStandBudget) blockers.push(`Stand au-dessus de ton budget (${cost} € > ${p.maxStandBudget} €).`);
      if (!availabilityOk(e.date, p)) blockers.push('Hors de tes disponibilités.');
      const already = perMonth.get(monthKey(e.date)) ?? 0;
      if (e.status !== 'inscrit' && e.status !== 'candidature' && already >= p.maxEventsPerMonth) {
        blockers.push(`Déjà ${already} événement(s) ce mois-ci (max ${p.maxEventsPerMonth}).`);
      }
    }
    if (e.applicationDeadline) {
      const d = daysBetween(s.today, e.applicationDeadline);
      if (d < 0 && e.status !== 'inscrit' && e.status !== 'candidature') blockers.push('Date limite de candidature dépassée.');
      else if (d >= 0 && d <= 10) reasons.push(`Candidature avant le ${e.applicationDeadline.split('-').reverse().slice(0, 2).join('/')}.`);
    }
    if (profit < 0) score -= 25;

    score -= blockers.length * 40;
    const tier: EventTier = score >= 70 ? 'prioritaire' : score >= 45 ? 'interessant' : 'faible';
    return { event: e, tier, score, reasons, blockers, expectation: exp, expectedProfit: profit };
  });

  return ranked.sort((a, b) => b.score - a.score || a.event.date.localeCompare(b.event.date));
}
