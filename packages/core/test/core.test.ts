import { describe, expect, it } from 'vitest';
import {
  applyStockDeltas,
  averageStepMinutes,
  buildDayPlan,
  buildRecap,
  completeBlock,
  demoData,
  expectEvent,
  purchaseSuggestions,
  rankEvents,
  slugify,
  type Snapshot,
} from '../src/index.ts';

const TODAY = '2026-10-13';

function snap(): Snapshot {
  const d = demoData(TODAY);
  return {
    today: TODAY,
    products: d.products!,
    items: d.items!,
    orders: d.orders!,
    events: d.events!,
    eventResults: d.eventResults!,
    sales: d.sales!,
    timeLogs: [],
    profile: d.profile![0],
  };
}

describe('planificateur', () => {
  it('met la commande client en premier et prépare le poste', () => {
    const plan = buildDayPlan(snap(), { availableMinutes: 120, energy: 'normal', pauses: false });
    expect(plan.blocks[0].kind).toBe('preparation');
    expect(plan.blocks[1].orderId).toBe('o-dupont');
    expect(plan.headline).toContain('Mme Dupont');
  });

  it('découpe une série étape par étape (pétales, puis tiges, puis assemblage)', () => {
    const plan = buildDayPlan(snap(), { availableMinutes: 240, energy: 'normal', pauses: false });
    const rose = plan.blocks.filter((b) => b.productId === 'p-rose-rubis' && b.orderId === 'o-dupont');
    expect(rose.map((b) => b.subtitle)).toEqual([
      'Étape 1/3 · Pétales',
      'Étape 2/3 · Tiges',
      'Étape 3/3 · Assemblage',
      'Contrôle',
      'Mise en boîte',
    ]);
    expect(rose.every((b) => b.target === 3)).toBe(true);
    expect(rose.filter((b) => b.completesUnits)).toHaveLength(1);
    expect(rose.at(-1)!.completesUnits).toBe(true);
  });

  it('regroupe les étapes légères de tous les produits à la fin', () => {
    const plan = buildDayPlan(snap(), { availableMinutes: 480, energy: 'normal', pauses: false });
    const kinds = plan.blocks.map((b) => b.kind);
    const firstLight = kinds.findIndex((k) => k === 'controle' || k === 'photo' || k === 'emballage');
    const lastHeavy = kinds.map((k, i) => (k === 'fabrication' || k === 'assemblage' ? i : -1)).reduce((a, b) => Math.max(a, b));
    expect(firstLight).toBeGreaterThan(lastHeavy);
  });

  it('respecte le temps disponible et insère des pauses conseillées', () => {
    const plan = buildDayPlan(snap(), { availableMinutes: 120, energy: 'normal', pauses: true });
    expect(plan.workMinutes + plan.pauseMinutes).toBeLessThanOrEqual(125);
    expect(plan.blocks.some((b) => b.kind === 'pause' && b.optional)).toBe(true);
  });

  it('signale les manques de matière', () => {
    const s = snap();
    s.items.find((i) => i.id === 'it-tige')!.stock = 1;
    const plan = buildDayPlan(s, { availableMinutes: 480, energy: 'normal', pauses: false });
    expect(plan.shortages.some((x) => x.itemId === 'it-tige')).toBe(true);
  });

  it('ne propose rien sans produit, avec un message clair', () => {
    const plan = buildDayPlan({ ...snap(), products: [], orders: [], events: [] }, { availableMinutes: 60, energy: 'normal', pauses: true });
    expect(plan.blocks).toHaveLength(0);
    expect(plan.headline).toMatch(/premier produit/);
  });
});

describe('temps moyen', () => {
  it('apprend du temps réel et pondère les sessions récentes', () => {
    const s = snap();
    const p = s.products[0];
    const step = p.steps[0];
    const logs = [1, 2, 3, 4].map((i) => ({ id: `l${i}`, updatedAt: i, date: TODAY, productId: p.id, stepId: step.id, stepKind: 'fabrication' as const, units: 10, minutes: 60 }));
    expect(averageStepMinutes(p, step, logs)).toBeCloseTo(6, 5);
  });
});

describe('production', () => {
  it('le dernier bloc incrémente la commande et consomme la matière', () => {
    const s = snap();
    const plan = buildDayPlan(s, { availableMinutes: 240, energy: 'normal', pauses: false });
    const last = plan.blocks.find((b) => b.orderId === 'o-dupont' && b.completesUnits)!;
    const ch = completeBlock(s, last, 3, 5);
    expect(ch.orders[0].status).toBe('prete');
    expect(ch.items.find((i) => i.id === 'it-tige')!.stock).toBe(15);
    expect(ch.timeLogs).toHaveLength(1);
  });

  it('une baisse de stock produit marquée vendue crée une vente', () => {
    const ch = applyStockDeltas(snap(), [{ table: 'products', id: 'p-lys-perle', delta: -2, isSale: true }]);
    expect(ch.products[0].stock).toBe(2);
    expect(ch.sales[0]).toMatchObject({ qty: 2, unitPrice: 24 });
  });
});

describe('événements', () => {
  it("apprend de l'historique (Rethel 520 / 610 / 580)", () => {
    const s = snap();
    const e = s.events.find((x) => x.id === 'e-rethel')!;
    const exp = expectEvent(e, s.eventResults, s.products);
    expect(exp.basis).toBe('historique');
    expect(exp.history.map((h) => h.revenue)).toEqual([520, 610, 580]);
    expect(exp.revenue).toBeGreaterThan(560);
    expect(exp.revenue).toBeLessThan(600);
  });

  it('classe et explique, en écartant ce qui sort du profil', () => {
    const ranked = rankEvents(snap());
    const paris = ranked.find((r) => r.event.id === 'e-paris')!;
    expect(paris.tier).toBe('faible');
    expect(paris.blockers.join(' ')).toMatch(/Trop loin/);
    const rethel = ranked.find((r) => r.event.id === 'e-rethel')!;
    expect(rethel.tier).toBe('prioritaire');
    expect(rethel.reasons.length).toBeGreaterThan(0);
  });

  it('slugify retire les années pour relier les éditions', () => {
    expect(slugify('Marché de Noël de Rethel 2027')).toBe('marche-de-noel-de-rethel');
  });
});

describe('achats & récap', () => {
  it('recommande des achats arrondis au conditionnement', () => {
    const sug = purchaseSuggestions(snap());
    const rouge = sug.find((x) => x.itemId === 'it-fil-rouge')!;
    expect(rouge.recommended % 25).toBe(0);
    expect(rouge.recommended).toBeGreaterThan(0);
    expect(sug.find((x) => x.itemId === 'it-adhesif')).toBeTruthy();
  });

  it('récap minimaliste', () => {
    const r = buildRecap(snap());
    expect(r.goal).toBe(1500);
    expect(r.urgentOrder).toBeUndefined();
    expect(r.nextEvent?.name).toBe('Marché de Noël de Rethel');
  });
});
