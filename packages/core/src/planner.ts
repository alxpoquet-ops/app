/**
 * LE CERVEAU DE "À FAIRE".
 *
 * Construit la meilleure session de travail possible à partir de l'état de
 * l'entreprise. L'utilisateur ne construit jamais ses tâches : il donne son
 * temps, son énergie, et reçoit "quoi faire, dans quel ordre, et pourquoi".
 *
 * Algorithme (déterministe, hors-ligne, explicable) :
 *  1. Recenser les besoins : commandes clients, événements à venir, ventes
 *     prévues, stock minimum, objectif du mois.
 *  2. Les transformer en "jobs" (produit × quantité) avec un score
 *     (urgence × valeur par minute × retard sur l'objectif).
 *  3. Vérifier la faisabilité matière (composants / consommables).
 *  4. Remplir le temps disponible (pauses déduites) par score décroissant.
 *  5. Ordonnancer : préparation groupée → fabrication en série → étapes
 *     légères regroupées (contrôle, photo, emballage) → rangement, en
 *     adaptant l'ordre à l'énergie, avec pauses conseillées.
 */
import { addDays, daysBetween, formatMinutes, monthKey, parseISODate } from './dates.ts';
import { monthRevenue, productDemand, upcomingEvents } from './forecast.ts';
import { averageProductMinutes, averageStepMinutes } from './timeStats.ts';
import type { CustomerOrder, Energy, ID, Item, Product, ProductStep, Snapshot, StepKind } from './types.ts';

export type PlanBlockKind = StepKind | 'pause' | 'tache';

export interface PlanBlock {
  id: string;
  kind: PlanBlockKind;
  title: string;
  /** Sous-titre court (ex. "Étape 2/3 · Tiges"). */
  subtitle?: string;
  productId?: ID;
  stepId?: ID;
  orderId?: ID;
  eventId?: ID;
  /** Nombre de clics "TERMINÉ" attendus. */
  target: number;
  estMinutes: number;
  checklist?: string[];
  /** Ce bloc transforme les unités en produits finis (stock ou commande). */
  completesUnits?: boolean;
  reason: string;
  optional?: boolean;
}

export interface PlanOptions {
  availableMinutes: number;
  energy: Energy;
  pauses: boolean;
}

export interface Job {
  key: string;
  product?: Product;
  order?: CustomerOrder;
  title: string;
  qty: number;
  minutesPerUnit: number;
  score: number;
  reasons: string[];
  urgencyDays: number;
}

export interface Shortage {
  itemId: ID;
  name: string;
  missing: number;
  forWhat: string;
}

export interface DayPlan {
  blocks: PlanBlock[];
  /** "Pourquoi" global, 2-4 phrases courtes. */
  headline: string;
  why: string[];
  workMinutes: number;
  pauseMinutes: number;
  /** Ce qui n'a pas tenu dans la session (proposé pour la prochaine fois). */
  later: { title: string; qty: number }[];
  shortages: Shortage[];
}

const LIGHT_KINDS: StepKind[] = ['controle', 'photo', 'emballage'];
const KIND_LABEL: Record<PlanBlockKind, string> = {
  preparation: 'Préparation',
  fabrication: 'Fabrication',
  assemblage: 'Assemblage',
  controle: 'Contrôle qualité',
  photo: 'Photos',
  emballage: 'Emballage',
  rangement: 'Rangement',
  pause: 'Pause',
  tache: 'Tâche',
};
export const KIND_EMOJI: Record<PlanBlockKind, string> = {
  preparation: '🧰',
  fabrication: '🛠️',
  assemblage: '🧩',
  controle: '🔍',
  photo: '📸',
  emballage: '📦',
  rangement: '🧹',
  pause: '☕',
  tache: '✅',
};

const ENERGY_EFFICIENCY: Record<Energy, number> = { fatigue: 1.15, normal: 1, motive: 0.95 };

let seq = 0;
const bid = (p: string) => `${p}-${++seq}`;

function openOrders(s: Snapshot): CustomerOrder[] {
  return s.orders
    .filter((o) => !o.deleted && (o.status === 'nouvelle' || o.status === 'en_cours'))
    .sort((a, b) => {
      const pr = { urgente: 0, haute: 1, normale: 2 } as const;
      return (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || pr[a.priority] - pr[b.priority];
    });
}

/** Étape 1-2 : besoins → jobs scorés. */
export function buildJobs(s: Snapshot): Job[] {
  const jobs: Job[] = [];
  const products = s.products.filter((p) => !p.deleted);
  const byId = new Map(products.map((p) => [p.id, p]));
  const freeStock = new Map(products.map((p) => [p.id, Math.max(0, p.stock)]));

  // Objectif du mois : plus on est en retard, plus la valeur par minute compte.
  const goal = s.profile?.monthlyRevenueGoal ?? 0;
  const ca = monthRevenue(s.sales, monthKey(s.today));
  const d = parseISODate(s.today);
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const expectedPace = goal * (d.getDate() / daysInMonth);
  const goalPressure = goal > 0 ? Math.min(2, Math.max(1, expectedPace / Math.max(ca, 1))) : 1;

  // Commandes clients : toujours prioritaires.
  for (const o of openOrders(s)) {
    // Une commande se fabrique pour le client : le stock vitrine reste pour les ventes.
    const remaining = Math.max(0, o.quantity - o.produced);
    const p = o.productId ? byId.get(o.productId) : undefined;
    if (remaining <= 0) continue;
    const days = o.dueDate ? daysBetween(s.today, o.dueDate) : 30;
    const prio = o.priority === 'urgente' ? 3 : o.priority === 'haute' ? 1.6 : 1;
    const mpu = p ? averageProductMinutes(p, s.timeLogs) : 60;
    const when = !o.dueDate ? 'sans date' : days < 0 ? `en retard de ${-days} j` : days === 0 ? "à rendre aujourd'hui" : `à rendre dans ${days} j`;
    jobs.push({
      key: `order:${o.id}`,
      product: p,
      order: o,
      title: p ? `${p.name} — commande ${o.client}` : `Commande ${o.client} : ${o.description}`,
      qty: remaining,
      minutesPerUnit: mpu,
      score: 1000 * prio * (1 / (Math.max(days, 0) + 1)) + 200 * prio,
      reasons: [`Commande de ${o.client} ${when}`],
      urgencyDays: days,
    });
  }

  // Stock : événements + prévisions + minimum.
  const demand = productDemand(s);
  for (const [pid, dm] of Object.entries(demand)) {
    const p = byId.get(pid);
    if (!p) continue;
    const need = Math.ceil(dm.units - (freeStock.get(pid) ?? 0));
    if (need <= 0) continue;
    const mpu = averageProductMinutes(p, s.timeLogs);
    const valuePerMinute = p.price / Math.max(mpu, 1);
    const urgency = 1 / (Math.max(dm.urgencyDays, 0) / 7 + 1);
    const outOfStock = p.stock <= 0;
    jobs.push({
      key: `stock:${pid}`,
      product: p,
      title: p.name,
      qty: need,
      minutesPerUnit: mpu,
      score: 100 * urgency * (outOfStock ? 1.5 : 1) + 20 * valuePerMinute * goalPressure,
      reasons: [outOfStock ? `${p.name} en rupture` : `Stock ${p.stock}, il en faut ${Math.ceil(dm.units)}`, ...dm.reasons.slice(0, 2)],
      urgencyDays: dm.urgencyDays,
    });
  }
  return jobs.sort((a, b) => b.score - a.score);
}

/** Combien d'unités peut-on fabriquer avec la matière disponible ? */
function materialLimit(p: Product, avail: Map<ID, number>): { max: number; limiting?: ID } {
  let max = Infinity;
  let limiting: ID | undefined;
  for (const l of [...p.components, ...p.consumables]) {
    if (l.qty <= 0) continue;
    const can = Math.floor((avail.get(l.itemId) ?? 0) / l.qty);
    if (can < max) {
      max = can;
      limiting = l.itemId;
    }
  }
  return { max, limiting };
}

/** Temps de pauses recommandées pour une durée de travail donnée. */
export function pauseMinutesFor(work: number): number {
  const minis = Math.floor(work / 30);
  const longs = Math.floor(work / 120);
  return (minis - longs) * 5 + longs * 15;
}

export function buildDayPlan(s: Snapshot, opt: PlanOptions): DayPlan {
  seq = 0;
  const eff = ENERGY_EFFICIENCY[opt.energy];
  const items = new Map<ID, Item>(s.items.filter((i) => !i.deleted).map((i) => [i.id, i]));
  const avail = new Map<ID, number>([...items.values()].map((i) => [i.id, i.stock]));
  const why: string[] = [];
  const shortages: Shortage[] = [];
  const later: DayPlan['later'] = [];

  // Budget de travail effectif (pauses déduites, préparation/rangement réservés).
  let work = opt.availableMinutes;
  if (opt.pauses) {
    // Résolution simple : w + pauses(w) <= dispo.
    while (work > 0 && work + pauseMinutesFor(work) > opt.availableMinutes) work -= 5;
  }
  const overhead = opt.availableMinutes >= 90 ? 15 : 7; // préparation + rangement
  let capacity = Math.max(0, work - overhead);

  const jobs = buildJobs(s);
  type Chosen = { job: Job; qty: number };
  const chosen: Chosen[] = [];

  for (const job of jobs) {
    if (capacity < 5) {
      later.push({ title: job.title, qty: job.qty });
      continue;
    }
    let qty = job.qty;
    if (job.product) {
      const lim = materialLimit(job.product, avail);
      if (lim.max < qty) {
        const it = lim.limiting ? items.get(lim.limiting) : undefined;
        if (it) {
          const line = [...job.product.components, ...job.product.consumables].find((l) => l.itemId === it.id)!;
          shortages.push({
            itemId: it.id,
            name: it.name,
            missing: Math.ceil((qty - lim.max) * line.qty),
            forWhat: job.title,
          });
        }
        qty = lim.max;
      }
    }
    const mpu = job.minutesPerUnit * eff;
    const fit = Math.floor(capacity / mpu);
    // Une série trop courte ne vaut pas le coup d'être lancée, sauf commande.
    const minBatch = job.product?.mode === 'serie' && !job.order ? Math.min(3, qty) : 1;
    const take = Math.min(qty, fit);
    if (take < minBatch || take <= 0) {
      if (qty > 0) later.push({ title: job.title, qty });
      continue;
    }
    if (take < job.qty) later.push({ title: job.title, qty: job.qty - take });
    chosen.push({ job, qty: take });
    capacity -= take * mpu;
    if (job.product) for (const l of [...job.product.components, ...job.product.consumables]) {
      avail.set(l.itemId, (avail.get(l.itemId) ?? 0) - l.qty * take);
    }
  }

  // Ordre selon l'énergie.
  if (opt.energy === 'motive') {
    chosen.sort((a, b) => (b.job.order ? 1 : 0) - (a.job.order ? 1 : 0) || b.job.minutesPerUnit - a.job.minutesPerUnit);
    if (chosen.length > 1) why.push('Tu es motivé : on attaque le plus technique en premier.');
  } else if (opt.energy === 'fatigue' && chosen.length > 1) {
    const easiest = chosen.reduce((m, c, i) => (c.job.minutesPerUnit < chosen[m].job.minutesPerUnit ? i : m), 0);
    if (!chosen[easiest].job.order || chosen.every((c) => !!c.job.order)) {
      const [warm] = chosen.splice(easiest, 1);
      chosen.unshift(warm);
      why.push('Tu es fatigué : on commence par quelque chose de facile pour se lancer.');
    }
  }

  const blocks: PlanBlock[] = [];

  // Préparation groupée : on sort tout une seule fois.
  if (chosen.length) {
    const checklist: string[] = [];
    const tools = new Set<string>();
    const mat = new Map<ID, number>();
    for (const { job, qty } of chosen) {
      job.product?.tools.forEach((t) => tools.add(t));
      job.product?.components.concat(job.product.consumables).forEach((l) => mat.set(l.itemId, (mat.get(l.itemId) ?? 0) + l.qty * qty));
    }
    for (const [id, q] of mat) {
      const it = items.get(id);
      if (it) checklist.push(`${it.name} ×${round(q)}${it.unit && it.unit !== 'pièce' ? ' ' + it.unit : ''}`);
    }
    tools.forEach((t) => checklist.push(t));
    blocks.push({
      id: bid('prep'),
      kind: 'preparation',
      title: 'Préparer le poste',
      target: 1,
      estMinutes: Math.min(10, 3 + checklist.length),
      checklist,
      reason: 'Tout sortir une seule fois évite les allers-retours.',
    });
  }

  // Production : en série, étape par étape ; étapes légères regroupées à la fin.
  const lightBlocks: Record<string, PlanBlock[]> = { controle: [], photo: [], emballage: [] };
  for (const { job, qty } of chosen) {
    const p = job.product;
    const reason = job.reasons.join(' · ');
    if (!p) {
      blocks.push({
        id: bid('job'),
        kind: 'fabrication',
        title: job.title,
        orderId: job.order?.id,
        target: qty,
        estMinutes: job.minutesPerUnit * qty * eff,
        completesUnits: true,
        reason,
      });
      continue;
    }
    const steps = p.steps.length ? p.steps : [{ id: 'fab', name: 'Fabrication', kind: 'fabrication', minutesPerUnit: job.minutesPerUnit } as ProductStep];
    if (p.mode === 'unitaire') {
      blocks.push({
        id: bid('unit'),
        kind: 'fabrication',
        title: p.name,
        subtitle: steps.map((st) => st.name).join(' → '),
        productId: p.id,
        stepId: '*',
        orderId: job.order?.id,
        target: qty,
        estMinutes: job.minutesPerUnit * qty * eff,
        completesUnits: true,
        reason,
      });
      continue;
    }
    const heavy = steps.filter((st) => !LIGHT_KINDS.includes(st.kind) && st.kind !== 'preparation' && st.kind !== 'rangement');
    const light = steps.filter((st) => LIGHT_KINDS.includes(st.kind));
    const lastStep = (light.length ? light : heavy)[(light.length ? light : heavy).length - 1];
    heavy.forEach((st, i) => {
      blocks.push({
        id: bid('serie'),
        kind: st.kind,
        title: p.name,
        subtitle: `Étape ${i + 1}/${heavy.length} · ${st.name}`,
        productId: p.id,
        stepId: st.id,
        orderId: job.order?.id,
        target: qty,
        estMinutes: averageStepMinutes(p, st, s.timeLogs) * qty * eff,
        completesUnits: st === lastStep,
        reason: i === 0 ? reason : `En série : ${qty} ${st.name.toLowerCase()} d'affilée, c'est plus rapide.`,
      });
    });
    for (const st of light) {
      lightBlocks[st.kind].push({
        id: bid('light'),
        kind: st.kind,
        title: p.name,
        subtitle: st.name,
        productId: p.id,
        stepId: st.id,
        orderId: job.order?.id,
        target: qty,
        estMinutes: averageStepMinutes(p, st, s.timeLogs) * qty * eff,
        completesUnits: st === lastStep,
        reason: `${KIND_LABEL[st.kind]} regroupé(e)s pour tout faire d'un coup.`,
      });
    }
  }
  for (const k of LIGHT_KINDS) blocks.push(...lightBlocks[k]);

  // Petites tâches de contexte pour combler le temps restant.
  const filler = contextTasks(s);
  for (const t of filler) {
    if (capacity >= t.estMinutes) {
      // Les tâches de commande / stand passent devant la fabrication si elles sont urgentes.
      blocks.push(t);
      capacity -= t.estMinutes;
    }
  }

  if (opt.availableMinutes >= 90 && blocks.length) {
    blocks.push({
      id: bid('rang'),
      kind: 'rangement',
      title: 'Ranger le poste',
      target: 1,
      estMinutes: 8,
      reason: 'Un atelier rangé = un démarrage rapide demain.',
    });
  }

  const withPauses = opt.pauses ? insertPauses(blocks) : blocks;

  // Explications globales.
  const workMinutes = blocks.reduce((a, b) => a + b.estMinutes, 0);
  const pauseMinutes = withPauses.filter((b) => b.kind === 'pause').reduce((a, b) => a + b.estMinutes, 0);
  const top = chosen[0];
  let headline: string;
  if (!chosen.length && !blocks.length) {
    headline = s.products.length
      ? 'Rien d\'urgent aujourd\'hui. Profite-en pour créer ou faire des photos.'
      : 'Ajoute ton premier produit dans les réglages pour que je puisse organiser tes journées.';
  } else if (top?.job.order) {
    headline = `Priorité : la commande de ${top.job.order.client}.`;
  } else if (top) {
    headline = `Priorité : ${top.qty} × ${top.job.title}.`;
  } else {
    headline = 'Une session légère pour avancer sur l\'essentiel.';
  }
  for (const c of chosen.slice(0, 3)) why.push(`${c.qty} × ${c.job.product?.name ?? c.job.title} — ${c.job.reasons[0]}.`);
  if (shortages.length) why.push(`Il manque de la matière (${shortages.map((x) => x.name).join(', ')}) : c'est dans À ACHETER.`);
  if (later.length) why.push(`Pour la prochaine session : ${later.slice(0, 2).map((l) => `${l.qty} × ${l.title}`).join(', ')}.`);
  if (opt.pauses && pauseMinutes) why.push(`Pauses conseillées incluses (${formatMinutes(pauseMinutes)}), jamais obligatoires.`);

  return { blocks: withPauses, headline, why, workMinutes, pauseMinutes, later, shortages };
}

/** Tâches courtes déduites du contexte (emballage commande prête, stand, candidature). */
function contextTasks(s: Snapshot): PlanBlock[] {
  const out: PlanBlock[] = [];
  for (const o of s.orders) {
    if (o.deleted || o.status !== 'prete') continue;
    out.push({
      id: bid('ctx'),
      kind: 'emballage',
      title: `Emballer la commande de ${o.client}`,
      orderId: o.id,
      target: 1,
      estMinutes: 10,
      reason: o.dueDate ? `À livrer le ${fr(o.dueDate)}.` : 'Commande prête à partir.',
    });
  }
  for (const e of upcomingEvents(s, 4)) {
    if (e.status !== 'inscrit') continue;
    out.push({
      id: bid('ctx'),
      kind: 'tache',
      title: `Préparer le stand — ${e.name}`,
      eventId: e.id,
      target: 1,
      estMinutes: 30,
      checklist: ['Table + nappe', 'Présentoirs', 'Étiquettes prix', 'Terminal CB chargé', 'Fond de caisse', 'Sacs / papier de soie', 'Cartes de visite'],
      reason: `${e.name} le ${fr(e.date)}.`,
    });
  }
  const soon = addDays(s.today, 7);
  for (const e of s.events) {
    if (e.deleted || e.status !== 'interesse' || !e.applicationDeadline) continue;
    if (e.applicationDeadline >= s.today && e.applicationDeadline <= soon) {
      out.push({
        id: bid('ctx'),
        kind: 'tache',
        title: `Relire la candidature — ${e.name}`,
        eventId: e.id,
        target: 1,
        estMinutes: 10,
        reason: `Date limite le ${fr(e.applicationDeadline)}. Le dossier est préparé, il ne manque que ta validation.`,
      });
    }
  }
  return out;
}

/** Mini pause toutes les ~30 min de travail, pause longue toutes les ~2 h. */
export function insertPauses(blocks: PlanBlock[]): PlanBlock[] {
  const out: PlanBlock[] = [];
  let sinceMini = 0;
  let sinceLong = 0;
  blocks.forEach((b, i) => {
    out.push(b);
    sinceMini += b.estMinutes;
    sinceLong += b.estMinutes;
    const isLast = i === blocks.length - 1;
    if (isLast) return;
    if (sinceLong >= 120) {
      out.push(pause(15, 'Pause longue : marche, boisson, on étire le dos.'));
      sinceLong = 0;
      sinceMini = 0;
    } else if (sinceMini >= 30) {
      out.push(pause(5, 'Mini pause : lève-toi, étire les mains et les yeux.'));
      sinceMini = 0;
    }
  });
  return out;
}

function pause(min: number, reason: string): PlanBlock {
  return { id: bid('pause'), kind: 'pause', title: min >= 15 ? 'Pause' : 'Mini pause', target: 1, estMinutes: min, reason, optional: true };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function fr(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}
