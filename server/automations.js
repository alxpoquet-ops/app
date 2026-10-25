// Automatisations internes, exécutées en tâche de fond.
import fs from 'node:fs';
import path from 'node:path';
import { getSettings, PATHS } from './config.js';
import { jobs, connections, oauthStates, publicMedia } from './store.js';
import { enqueueProcess, enqueuePublish } from './queue.js';
import { PROVIDERS } from './publishers/index.js';
import { cleanupJobFiles, log } from './pipeline/index.js';
import { ensureGeneratedMusic } from './pipeline/music.js';

export function startAutomations() {
  // Au démarrage : reprise des travaux interrompus (redémarrage, coupure…).
  for (const job of jobs.list()) {
    if (job.status === 'queued' || job.status === 'processing') {
      log(job, '🔄 Reprise automatique après redémarrage');
      enqueueProcess(job.id);
    }
    if (job.status === 'publishing') {
      const pending = Object.keys(job.posts).filter((n) => job.posts[n].enabled && job.publish[n]?.status !== 'done');
      log(job, '🔄 Reprise de la publication après redémarrage');
      enqueuePublish(job.id, { only: pending });
    }
  }

  // Composition des musiques libres de droits (1re fois uniquement).
  ensureGeneratedMusic().catch((err) => console.error('Musique :', err.message));

  setInterval(tick, 30_000).unref();
  setInterval(maintenance, 60 * 60_000).unref();
  setTimeout(maintenance, 10_000).unref();
}

async function tick() {
  const now = Date.now();
  for (const job of jobs.list()) {
    // Publications programmées arrivées à échéance.
    if (job.status === 'scheduled' && job.scheduledAt && new Date(job.scheduledAt).getTime() <= now) {
      log(job, '⏰ Heure de publication programmée atteinte');
      job.status = 'publishing';
      jobs.save(job);
      enqueuePublish(job.id);
    }
    // Nouvel essai automatique des réseaux en échec temporaire.
    if (['partial', 'failed'].includes(job.status)) {
      const due = Object.entries(job.publish || {}).filter(([, p]) => p.status === 'error' && p.nextRetryAt && new Date(p.nextRetryAt).getTime() <= now).map(([n]) => n);
      if (due.length) {
        for (const n of due) job.publish[n].nextRetryAt = null;
        log(job, `🔁 Nouvel essai automatique : ${due.join(', ')}`);
        enqueuePublish(job.id, { only: due });
      }
    }
  }
}

async function maintenance() {
  const s = getSettings();
  // Renouvellement préventif des jetons de connexion.
  for (const [provider, conn] of Object.entries(connections.all())) {
    const p = PROVIDERS[provider];
    if (p?.refresh && conn.expiresAt && conn.expiresAt - Date.now() < 2 * 60 * 60_000) {
      try { connections.set(provider, await p.refresh(conn)); } catch (err) { console.warn(`Jeton ${provider} :`, err.message); }
    }
  }
  oauthStates.purge();
  publicMedia.purge(48 * 60 * 60_000);

  // Ménage : fichiers de travail des publications terminées, vieux fichiers.
  const maxAge = (s.automations.cleanupDays || 14) * 24 * 60 * 60_000;
  for (const job of jobs.list()) {
    const age = Date.now() - new Date(job.updatedAt || job.createdAt).getTime();
    if (job.status === 'published' && !job.cleaned) {
      cleanupJobFiles(job, { keepRenders: true });
      job.cleaned = true;
      jobs.save(job);
    }
    if (age > maxAge && ['published', 'failed', 'partial'].includes(job.status) && !job.archived) {
      cleanupJobFiles(job);
      job.archived = true;
      job.renders = {};
      jobs.save(job);
    }
  }
  // Fichiers orphelins.
  const known = new Set(jobs.list().map((j) => j.id));
  for (const dir of [PATHS.uploads, PATHS.work]) {
    for (const name of fs.readdirSync(dir)) {
      if (!known.has(name)) fs.rmSync(path.join(dir, name), { recursive: true, force: true });
    }
  }
}

