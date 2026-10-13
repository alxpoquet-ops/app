/**
 * Base locale (IndexedDB via Dexie) : l'app fonctionne 100 % hors-ligne,
 * dans l'atelier sans réseau. Chaque écriture est mise en file d'attente
 * (outbox) puis synchronisée avec le serveur quand il est joignable.
 */
import Dexie, { type Table } from 'dexie';
import { TABLES, newId, type Observation, type TableName, type Tables } from '@boss/core';

export interface OutboxRow {
  key: string; // `${table}:${id}`
  table: TableName;
  id: string;
}
export interface MetaRow {
  k: string;
  v: unknown;
}

class BossDB extends Dexie {
  outbox!: Table<OutboxRow, string>;
  meta!: Table<MetaRow, string>;
  constructor() {
    super('boss-ia');
    const schema: Record<string, string> = { outbox: 'key', meta: 'k' };
    for (const t of TABLES) schema[t] = 'id, updatedAt';
    this.version(1).stores(schema);
  }
  t<K extends TableName>(name: K): Table<Tables[K], string> {
    return this.table(name);
  }
}

export const db = new BossDB();

type Listener = () => void;
const listeners = new Set<Listener>();
export const onLocalWrite = (l: Listener) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

/** Écrit (et horodate) des enregistrements, puis les place dans l'outbox. */
export async function save<K extends TableName>(table: K, rows: Tables[K] | Tables[K][]) {
  const list = (Array.isArray(rows) ? rows : [rows]).map((r) => ({ ...r, updatedAt: Math.max(Date.now(), (r.updatedAt ?? 0) + 1) }));
  if (!list.length) return;
  await db.transaction('rw', db.table(table), db.outbox, async () => {
    await db.t(table).bulkPut(list as Tables[K][]);
    await db.outbox.bulkPut(list.map((r) => ({ key: `${table}:${r.id}`, table, id: r.id })));
  });
  listeners.forEach((l) => l());
}

/** Suppression douce (propagée aux autres appareils). */
export async function remove<K extends TableName>(table: K, id: string) {
  const cur = await db.t(table).get(id);
  if (cur) await save(table, { ...cur, deleted: true } as Tables[K]);
}

/** La mémoire : on note tout ce qu'on observe. */
export function observe(kind: string, data: Record<string, unknown> = {}) {
  const o: Observation = { id: newId(), ts: Date.now(), updatedAt: Date.now(), kind, data };
  return save('observations', o);
}

export async function getMeta<T>(k: string, fallback: T): Promise<T> {
  const r = await db.meta.get(k);
  return (r?.v as T) ?? fallback;
}
export const setMeta = (k: string, v: unknown) => db.meta.put({ k, v });

export interface DeviceSettings {
  serverUrl: string;
  token: string;
}
export const getSettings = () => getMeta<DeviceSettings>('settings', { serverUrl: '', token: '' });
