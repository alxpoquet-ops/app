import type { TableName, Tables } from '@boss/core';
import { db, getMeta, getSettings, onLocalWrite, setMeta } from './db.ts';

export type SyncState = { status: 'off' | 'ok' | 'pending' | 'error'; lastSync?: number; message?: string };
let state: SyncState = { status: 'off' };
const subs = new Set<(s: SyncState) => void>();
export const onSync = (f: (s: SyncState) => void) => {
  subs.add(f);
  f(state);
  return () => void subs.delete(f);
};
const set = (s: SyncState) => ((state = s), subs.forEach((f) => f(s)));

let running = false;

export function apiBase(serverUrl: string) {
  return serverUrl.replace(/\/$/, '');
}

/** Un cycle : pousser l'outbox, tirer les nouveautés depuis le curseur. */
export async function syncNow(): Promise<void> {
  if (running) return;
  const { serverUrl, token } = await getSettings();
  const base = apiBase(serverUrl);
  running = true;
  try {
    let more = true;
    while (more) {
      const outbox = await db.outbox.limit(500).toArray();
      const changes: { table: TableName; id: string; data: Tables[TableName]; updatedAt: number; deleted: boolean }[] = [];
      for (const o of outbox) {
        const rec = await db.t(o.table).get(o.id);
        if (rec) changes.push({ table: o.table, id: o.id, data: rec, updatedAt: rec.updatedAt, deleted: !!rec.deleted });
      }
      const since = await getMeta<number>('cursor', 0);
      const res = await fetch(`${base}/api/sync`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ since, changes }),
      });
      if (!res.ok) throw new Error(res.status === 401 ? 'Jeton refusé' : `Serveur ${res.status}`);
      const body = (await res.json()) as { rows: { table: TableName; id: string; data: Tables[TableName]; updatedAt: number }[]; cursor: number; more: boolean };
      await db.transaction('rw', [db.outbox, db.meta, ...body.rows.map((r) => db.table(r.table))], async () => {
        for (const r of body.rows) {
          const local = await db.t(r.table).get(r.id);
          if (!local || local.updatedAt <= r.updatedAt) await db.t(r.table).put(r.data as never);
        }
        // N'effacer que les entrées non modifiées depuis l'envoi.
        for (const c of changes) {
          const now = await db.t(c.table).get(c.id);
          if (now && now.updatedAt === c.updatedAt) await db.outbox.delete(`${c.table}:${c.id}`);
        }
        await setMeta('cursor', body.cursor);
      });
      more = body.more || (await db.outbox.count()) > 0 && outbox.length === 500;
    }
    set({ status: 'ok', lastSync: Date.now() });
  } catch (e) {
    const pending = await db.outbox.count();
    set({ status: pending ? 'pending' : 'error', message: (e as Error).message });
  } finally {
    running = false;
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;
export function startSync() {
  const soon = () => {
    clearTimeout(timer);
    timer = setTimeout(syncNow, 1500);
  };
  onLocalWrite(soon);
  window.addEventListener('online', soon);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && soon());
  setInterval(syncNow, 60_000);
  syncNow();
}
