/**
 * Serveur BOSS IA : synchronisation multi-appareils + agents IA + garde-fou
 * d'exécution des actions validées. Sert aussi la PWA compilée.
 */
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono, type Context } from 'hono';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Approval } from '@boss/core';
import { AiRefused, AiUnavailable, aiAvailable, analyzeMedia, coach, draftApplication, MODEL, searchEvents, searchSuppliers } from './agents.ts';
import { Store, type RecordRow } from './db.ts';
import { executeApproved } from './connectors.ts';

const PORT = Number(process.env.PORT ?? 8787);
const TOKEN = process.env.BOSS_TOKEN ?? '';
const store = new Store(process.env.BOSS_DB ?? resolve(process.cwd(), 'boss-ia.db'));
const onUsage = (agent: string, usage: { input_tokens?: number; output_tokens?: number } | undefined, ok: boolean) =>
  store.logAi(agent, usage, ok);

const app = new Hono();

app.get('/api/health', (c) => c.json({ ok: true, ai: aiAvailable(), model: aiAvailable() ? MODEL : null, auth: !!TOKEN }));

// Authentification simple par jeton partagé (application mono-entreprise).
app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/health') return next();
  if (TOKEN && c.req.header('authorization') !== `Bearer ${TOKEN}`) return c.json({ error: 'Jeton invalide' }, 401);
  return next();
});

// ------------------------------------------------------------- Synchronisation
app.post('/api/sync', async (c) => {
  const body = (await c.req.json()) as { since?: number; changes?: RecordRow[] };
  const accepted = store.push(Array.isArray(body.changes) ? body.changes : []);
  const page = store.pull(Number(body.since ?? 0));
  return c.json({ accepted, ...page });
});

// ------------------------------------------------------------- Agents IA
async function runAgent(c: Context, fn: () => Promise<unknown>) {
  try {
    return c.json(await fn());
  } catch (e) {
    if (e instanceof AiUnavailable) return c.json({ error: e.message }, 503);
    if (e instanceof AiRefused) return c.json({ error: e.message }, 422);
    console.error(e);
    return c.json({ error: "L'IA n'a pas pu répondre. Réessaie plus tard." }, 502);
  }
}

app.post('/api/ai/coach', async (c) => runAgent(c, async () => coach(await c.req.json(), onUsage)));
app.post('/api/ai/events', async (c) => runAgent(c, async () => searchEvents(await c.req.json(), onUsage)));
app.post('/api/ai/suppliers', async (c) => runAgent(c, async () => searchSuppliers(await c.req.json(), onUsage)));
app.post('/api/ai/application', async (c) => runAgent(c, async () => draftApplication(await c.req.json(), onUsage)));
app.post('/api/ai/media', async (c) => runAgent(c, async () => analyzeMedia(await c.req.json(), onUsage)));

// ------------------------------------------------------------- Exécution validée
/**
 * Seul point de sortie vers le monde extérieur. Refuse tout ce qui n'a pas
 * été approuvé par un humain (statut "approuve" synchronisé depuis l'appareil).
 */
app.post('/api/actions/:id/execute', async (c) => {
  const id = c.req.param('id');
  const approval = store.all<Approval>('approvals').find((a) => a.id === id);
  if (!approval) return c.json({ error: 'Action inconnue (synchronise avant).' }, 404);
  if (approval.status !== 'approuve' || !approval.decidedAt) return c.json({ error: 'Action non validée par un humain.' }, 403);
  return c.json(await executeApproved(approval));
});

// ------------------------------------------------------------- PWA
const webDist = resolve(process.cwd(), process.env.BOSS_WEB_DIST ?? '../web/dist');
if (existsSync(webDist)) {
  app.use('/*', serveStatic({ root: webDist }));
  app.get('*', serveStatic({ path: resolve(webDist, 'index.html') }));
}

serve({ fetch: app.fetch, port: PORT }, (i) => {
  console.log(`BOSS IA serveur sur http://localhost:${i.port}  (IA : ${aiAvailable() ? MODEL : 'désactivée'}, jeton : ${TOKEN ? 'oui' : 'NON — dev uniquement'})`);
});
