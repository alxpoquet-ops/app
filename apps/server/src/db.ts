/**
 * Stockage serveur : un journal d'enregistrements versionnés (SQLite).
 *
 * Chaque appareil pousse ses modifications ({table, id, data, updatedAt}) et
 * récupère celles des autres depuis un curseur `seq`. Résolution des conflits :
 * last-write-wins par enregistrement (updatedAt le plus récent gagne).
 */
import { DatabaseSync } from 'node:sqlite';
import { TABLES, type TableName } from '@boss/core';

export interface RecordRow {
  table: TableName;
  id: string;
  data: Record<string, unknown>;
  updatedAt: number;
  deleted?: boolean;
}

export class Store {
  private db: DatabaseSync;

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS records (
        tbl TEXT NOT NULL,
        id TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        deleted INTEGER NOT NULL DEFAULT 0,
        seq INTEGER NOT NULL,
        PRIMARY KEY (tbl, id)
      );
      CREATE INDEX IF NOT EXISTS records_seq ON records(seq);
      CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS ai_log (
        ts INTEGER NOT NULL, agent TEXT NOT NULL, input_tokens INTEGER, output_tokens INTEGER, ok INTEGER NOT NULL
      );
    `);
  }

  private nextSeq(): number {
    const row = this.db.prepare(`SELECT v FROM meta WHERE k = 'seq'`).get() as { v: string } | undefined;
    const n = (row ? Number(row.v) : 0) + 1;
    this.db.prepare(`INSERT INTO meta (k, v) VALUES ('seq', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v`).run(String(n));
    return n;
  }

  /** Applique les modifications d'un appareil. Retourne le nombre accepté. */
  push(rows: RecordRow[]): number {
    let accepted = 0;
    const get = this.db.prepare(`SELECT updated_at FROM records WHERE tbl = ? AND id = ?`);
    const upsert = this.db.prepare(`
      INSERT INTO records (tbl, id, data, updated_at, deleted, seq) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(tbl, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at,
        deleted = excluded.deleted, seq = excluded.seq`);
    this.db.exec('BEGIN');
    try {
      for (const r of rows) {
        if (!TABLES.includes(r.table) || typeof r.id !== 'string' || typeof r.updatedAt !== 'number') continue;
        const cur = get.get(r.table, r.id) as { updated_at: number } | undefined;
        if (cur && cur.updated_at >= r.updatedAt) continue; // la version serveur est plus récente
        upsert.run(r.table, r.id, JSON.stringify(r.data), r.updatedAt, r.deleted ? 1 : 0, this.nextSeq());
        accepted++;
      }
      this.db.exec('COMMIT');
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
    return accepted;
  }

  pull(since: number, limit = 2000): { rows: RecordRow[]; cursor: number; more: boolean } {
    const res = this.db
      .prepare(`SELECT tbl, id, data, updated_at, deleted, seq FROM records WHERE seq > ? ORDER BY seq LIMIT ?`)
      .all(since, limit + 1) as { tbl: TableName; id: string; data: string; updated_at: number; deleted: number; seq: number }[];
    const more = res.length > limit;
    const page = res.slice(0, limit);
    return {
      rows: page.map((r) => ({ table: r.tbl, id: r.id, data: JSON.parse(r.data), updatedAt: r.updated_at, deleted: !!r.deleted })),
      cursor: page.length ? page[page.length - 1].seq : since,
      more,
    };
  }

  all<T>(table: TableName): T[] {
    return (this.db.prepare(`SELECT data FROM records WHERE tbl = ? AND deleted = 0`).all(table) as { data: string }[]).map(
      (r) => JSON.parse(r.data) as T,
    );
  }

  logAi(agent: string, usage: { input_tokens?: number; output_tokens?: number } | undefined, ok: boolean) {
    this.db
      .prepare(`INSERT INTO ai_log (ts, agent, input_tokens, output_tokens, ok) VALUES (?, ?, ?, ?, ?)`)
      .run(Date.now(), agent, usage?.input_tokens ?? null, usage?.output_tokens ?? null, ok ? 1 : 0);
  }
}
