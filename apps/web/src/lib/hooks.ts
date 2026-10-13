import { useLiveQuery } from 'dexie-react-hooks';
import { toISODate, type Snapshot, type TableName, type Tables } from '@boss/core';
import { db } from './db.ts';

/** Enregistrements vivants (non supprimés) d'une table, mis à jour en direct. */
export function useRows<K extends TableName>(table: K): Tables[K][] | undefined {
  return useLiveQuery(async () => (await db.t(table).toArray()).filter((r) => !r.deleted), [table]);
}

/** Instantané complet pour les moteurs de décision. */
export function useSnapshot(): Snapshot | undefined {
  return useLiveQuery(async () => {
    const [products, items, orders, events, eventResults, sales, timeLogs, profile] = await Promise.all([
      db.t('products').toArray(),
      db.t('items').toArray(),
      db.t('orders').toArray(),
      db.t('events').toArray(),
      db.t('eventResults').toArray(),
      db.t('sales').toArray(),
      db.t('timeLogs').toArray(),
      db.t('profile').toArray(),
    ]);
    const live = <T extends { deleted?: boolean }>(a: T[]) => a.filter((x) => !x.deleted);
    return {
      today: toISODate(new Date()),
      products: live(products),
      items: live(items),
      orders: live(orders),
      events: live(events),
      eventResults: live(eventResults),
      sales: live(sales),
      timeLogs: live(timeLogs),
      profile: live(profile)[0],
    } satisfies Snapshot;
  });
}

export const euros = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 });

export const frDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
