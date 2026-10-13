/**
 * Effets métier purs : "j'ai fini N unités", "je valide mes changements de stock".
 * Retournent les enregistrements modifiés ; la couche stockage les persiste.
 */
import type { PlanBlock } from './planner.ts';
import type { CustomerOrder, Energy, ID, Item, Product, Sale, Snapshot, TimeLog } from './types.ts';

export const newId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

export interface Changes {
  products: Product[];
  items: Item[];
  orders: CustomerOrder[];
  sales: Sale[];
  timeLogs: TimeLog[];
}

const empty = (): Changes => ({ products: [], items: [], orders: [], sales: [], timeLogs: [] });

/**
 * Appelé quand un bloc de production se termine (ou est interrompu).
 * - historise le temps (toujours) ;
 * - si le bloc finalise des unités : stock produit +N (ou commande +N) et
 *   consommation des composants / consommables.
 */
export function completeBlock(
  s: Snapshot,
  block: PlanBlock,
  unitsDone: number,
  minutes: number,
  ctx: { energy?: Energy; now?: Date } = {},
): Changes {
  const out = empty();
  const now = ctx.now ?? new Date();
  const ts = now.getTime();
  if (minutes > 0 && block.kind !== 'pause') {
    out.timeLogs.push({
      id: newId(),
      updatedAt: ts,
      date: s.today,
      productId: block.productId,
      stepId: block.stepId,
      stepKind: block.kind === 'tache' ? 'rangement' : block.kind,
      units: block.productId ? unitsDone : 0,
      minutes,
      energy: ctx.energy,
      hour: now.getHours(),
    });
  }
  if (!block.completesUnits || unitsDone <= 0) return out;

  const product = block.productId ? s.products.find((p) => p.id === block.productId) : undefined;
  if (block.orderId) {
    const o = s.orders.find((x) => x.id === block.orderId);
    if (o) {
      const produced = Math.min(o.quantity, o.produced + unitsDone);
      out.orders.push({ ...o, produced, status: produced >= o.quantity ? 'prete' : 'en_cours', updatedAt: ts });
    }
  } else if (product) {
    out.products.push({ ...product, stock: product.stock + unitsDone, updatedAt: ts });
  }
  if (product) {
    const use = new Map<ID, number>();
    for (const l of [...product.components, ...product.consumables]) use.set(l.itemId, (use.get(l.itemId) ?? 0) + l.qty * unitsDone);
    for (const [id, q] of use) {
      const it = s.items.find((i) => i.id === id);
      if (it) out.items.push({ ...it, stock: Math.max(0, round(it.stock - q)), updatedAt: ts });
    }
  }
  return out;
}

export interface StockDelta {
  table: 'products' | 'items';
  id: ID;
  delta: number;
  /** Pour une baisse de produit fini : est-ce une vente ? (sinon casse / don / perte) */
  isSale?: boolean;
}

/** Validation des changements de stock en attente. */
export function applyStockDeltas(s: Snapshot, deltas: StockDelta[], now = new Date()): Changes {
  const out = empty();
  const ts = now.getTime();
  for (const d of deltas) {
    if (!d.delta) continue;
    if (d.table === 'products') {
      const p = s.products.find((x) => x.id === d.id);
      if (!p) continue;
      out.products.push({ ...p, stock: Math.max(0, p.stock + d.delta), updatedAt: ts });
      if (d.delta < 0 && d.isSale) {
        out.sales.push({ id: newId(), updatedAt: ts, date: s.today, productId: p.id, qty: -d.delta, unitPrice: p.price, channel: 'direct' });
      }
    } else {
      const it = s.items.find((x) => x.id === d.id);
      if (it) out.items.push({ ...it, stock: Math.max(0, round(it.stock + d.delta)), updatedAt: ts });
    }
  }
  return out;
}

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}
