// Orchestrateur : enchaîne analyse → découpage → textes → musique → montage → validation.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PATHS, FORMATS, NETWORKS, getSettings } from '../config.js';
import { jobs } from '../store.js';
import { analyzeMedia, pickLocally } from './analyze.js';
import { aiEnabled, planWithAI } from './ai.js';
import { localPlan, MOODS } from './text.js';
import { pickTrack, findTrack } from './music.js';
import { renderVideo } from './render.js';

export const STEPS = [
  { key: 'analyse', label: 'Analyse' },
  { key: 'decoupage', label: 'Découpage' },
  { key: 'textes', label: 'Textes & hashtags' },
  { key: 'musique', label: 'Musique' },
  { key: 'montage', label: 'Montage' },
  { key: 'validation', label: 'Ta validation' },
  { key: 'envoi', label: 'Envoi' },
  { key: 'publie', label: 'Publié' },
];

export function newJob({ description, networks, media, options }) {
  const id = `${new Date().toISOString().slice(0, 10)}-${crypto.randomBytes(4).toString('hex')}`;
  return {
    id,
    createdAt: new Date().toISOString(),
    description,
    networks,
    options: options || {},
    media,
    status: 'queued',
    steps: Object.fromEntries(STEPS.map((s) => [s.key, { status: 'pending', progress: 0, detail: '' }])),
    log: [],
    posts: {},
    renders: {},
    publish: {},
  };
}

// Helpers de progression (chaque appel est diffusé en direct à l'interface).
export function step(job, key, patch) {
  Object.assign(job.steps[key], patch);
  jobs.save(job);
}
export function log(job, msg) {
  job.log.push({ at: new Date().toISOString(), msg });
  if (job.log.length > 200) job.log.splice(0, job.log.length - 200);
  jobs.save(job);
}

const workDirOf = (job) => path.join(PATHS.work, job.id);

// Durée par image calée sur le tempo de la musique (changement d'image sur le temps fort).
export function timing(count, bpm, maxDuration) {
  if (!bpm) {
    const d = Math.max(1.5, Math.min(2.6, maxDuration / count));
    return { slideDuration: d, firstBonus: 1, beat: null };
  }
  const beat = 60 / bpm;
  let beats = [8, 6, 4, 3, 2].find((b) => b * beat <= 3.4 && b * beat * count + beat * 2 <= maxDuration) || 2;
  if (beats * beat < 1.2) beats = Math.ceil(1.2 / beat);
  return { slideDuration: beats * beat, firstBonus: beat * 2, beat };
}

export function formatsFor(networks) {
  const map = getSettings().networkFormats;
  return [...new Set(networks.map((n) => map[n] || NETWORKS[n].format))];
}

export async function processJob(job) {
  const settings = getSettings();
  const workDir = workDirOf(job);
  fs.mkdirSync(workDir, { recursive: true });
  job.status = 'processing';
  job.error = null;
  const maxDuration = Number(job.options.duration) || settings.video.maxDuration || 30;

  // 1-2. Analyse & découpage
  step(job, 'analyse', { status: 'running', detail: `${job.media.length} fichier(s)` });
  const { candidates, videoSeconds } = await analyzeMedia(job, workDir, (detail, progress) => {
    const key = detail.startsWith('Découpage') ? 'decoupage' : 'analyse';
    if (key === 'decoupage' && job.steps.analyse.status !== 'done') step(job, 'analyse', { status: 'done', progress: 1 });
    step(job, key, { status: 'running', detail, progress });
  });
  job.candidates = candidates;
  step(job, 'analyse', { status: 'done', progress: 1, detail: `${job.media.length} fichier(s) analysé(s)` });
  const photos = candidates.filter((c) => c.kind === 'photo').length;
  step(job, 'decoupage', { status: 'running', progress: 0.9, detail: `${candidates.length} images candidates` });
  log(job, videoSeconds
    ? `🎞️ ${Math.round(videoSeconds)} s de vidéo découpées en ${candidates.length - photos} images clés`
    : `🖼️ ${photos} photo(s) prêtes`);

  // 3. Choix des meilleurs moments + textes
  const target = Math.max(1, Math.min(candidates.length, photos > 0 && photos === candidates.length ? Math.min(photos, 20) : Math.round(maxDuration / 2.4)));
  step(job, 'textes', { status: 'running', detail: aiEnabled() ? 'L\'IA regarde tes images…' : 'Rédaction automatique…' });
  let plan;
  if (aiEnabled()) {
    try {
      plan = await planWithAI({ description: job.description, candidates, networks: job.networks, targetSlides: target, brand: settings.brand });
      log(job, `🧠 L'IA a choisi ${plan.picked.length} images et rédigé les textes`);
    } catch (err) {
      log(job, `⚠️ IA indisponible (${err.message.slice(0, 120)}) — passage en mode automatique`);
    }
  }
  if (!plan) {
    const picked = pickLocally(candidates, target);
    plan = { ...localPlan({ description: job.description, slideCount: picked.length, networks: job.networks, brand: settings.brand }), picked };
    log(job, `✍️ ${picked.length} images retenues, textes et hashtags générés automatiquement`);
  }
  if (job.options.mood && MOODS[job.options.mood]) plan.mood = job.options.mood;
  step(job, 'decoupage', { status: 'done', progress: 1, detail: `${plan.picked.length} moments forts retenus` });

  job.title = plan.title;
  job.posts = Object.fromEntries(job.networks.map((n) => [n, { enabled: true, caption: plan.captions[n] || '', hashtags: plan.hashtags[n] || [] }]));
  if (job.networks.includes('youtube')) job.posts.youtube.title = plan.title;
  step(job, 'textes', { status: 'done', progress: 1, detail: plan.source === 'ia' ? 'Rédigés par l\'IA' : 'Rédigés automatiquement' });

  job.plan = {
    source: plan.source,
    mood: plan.mood,
    hook: plan.hook,
    cta: plan.cta,
    slides: plan.picked.map((c, i) => ({ candidateId: c.id, src: c.src, width: c.width, height: c.height, caption: plan.slideCaptions[i] || '' })),
  };
  await chooseMusic(job, maxDuration);
  await renderAll(job);
}

export async function chooseMusic(job, maxDuration, { exclude, trackId } = {}) {
  step(job, 'musique', { status: 'running', detail: 'Recherche de la musique idéale…' });
  const track = (trackId && findTrack(trackId)) || pickTrack(job.plan.mood, exclude);
  const t = timing(job.plan.slides.length, track?.bpm, maxDuration || Number(job.options.duration) || getSettings().video.maxDuration || 30);
  Object.assign(job.plan, t, { music: track ? { id: track.id, title: track.title, bpm: track.bpm, file: track.file, origin: track.origin } : null });
  step(job, 'musique', { status: 'done', progress: 1, detail: track ? `${track.title}${track.bpm ? ` · ${track.bpm} BPM` : ''}` : 'Sans musique' });
  log(job, track ? `🎵 Musique « ${track.title} » (${MOODS[job.plan.mood]?.label}) — images calées sur le rythme` : '🔇 Aucune musique disponible');
}

export async function renderAll(job) {
  step(job, 'montage', { status: 'running', progress: 0, detail: 'Préparation…' });
  const formats = formatsFor(job.networks);
  job.renders = {};
  for (const [fi, fid] of formats.entries()) {
    const format = FORMATS[fid];
    const outFile = path.join(PATHS.renders, `${job.id}-${fid}-${Date.now().toString(36)}.mp4`);
    const { duration } = await renderVideo({
      plan: job.plan, format, workDir: workDirOf(job), outFile,
      onProgress: (p, detail) => {
        const progress = (fi + p) / formats.length;
        if (Math.abs(progress - job.steps.montage.progress) > 0.02 || p === 1) step(job, 'montage', { status: 'running', progress, detail: `${format.label} · ${detail}` });
      },
    });
    job.renders[fid] = { file: outFile, thumb: outFile.replace(/\.mp4$/, '.jpg'), duration, label: format.label, w: format.w, h: format.h, v: Date.now() };
    log(job, `🎬 Vidéo ${format.label} montée (${duration.toFixed(1)} s)`);
  }
  step(job, 'montage', { status: 'done', progress: 1, detail: formats.map((f) => FORMATS[f].label).join(' + ') });
  step(job, 'validation', { status: 'running', detail: 'En attente de ta validation' });
  job.status = 'review';
  jobs.save(job);
}

// Remontage après modification (textes, musique, ordre…) depuis l'écran de validation.
export async function rerenderJob(job, { mode, trackId, edits }) {
  job.status = 'processing';
  job.error = null;
  step(job, 'validation', { status: 'pending', detail: '' });
  if (edits) {
    if (typeof edits.hook === 'string') job.plan.hook = edits.hook;
    if (typeof edits.cta === 'string') job.plan.cta = edits.cta;
    if (Array.isArray(edits.slides)) {
      const byId = new Map(job.plan.slides.map((s) => [s.candidateId, s]));
      const cands = new Map((job.candidates || []).map((c) => [c.id, c]));
      job.plan.slides = edits.slides
        .map((e) => {
          const base = byId.get(e.candidateId) || (cands.get(e.candidateId) && { candidateId: e.candidateId, src: cands.get(e.candidateId).src, width: cands.get(e.candidateId).width, height: cands.get(e.candidateId).height });
          return base && { ...base, caption: String(e.caption ?? base.caption ?? '') };
        })
        .filter(Boolean);
      if (!job.plan.slides.length) throw new Error('Il faut au moins une image.');
    }
    if (edits.mood && MOODS[edits.mood]) job.plan.mood = edits.mood;
    log(job, '✏️ Modifications appliquées, nouveau montage…');
  }
  if (mode === 'music' || edits?.mood || trackId || edits?.slides) {
    await chooseMusic(job, null, { exclude: mode === 'music' ? job.plan.music?.id : undefined, trackId });
  }
  for (const r of Object.values(job.renders || {})) { fs.rmSync(r.file, { force: true }); fs.rmSync(r.thumb, { force: true }); }
  await renderAll(job);
}

export function cleanupJobFiles(job, { keepRenders = false } = {}) {
  fs.rmSync(workDirOf(job), { recursive: true, force: true });
  fs.rmSync(path.join(PATHS.uploads, job.id), { recursive: true, force: true });
  if (!keepRenders) for (const r of Object.values(job.renders || {})) { fs.rmSync(r.file, { force: true }); fs.rmSync(r.thumb, { force: true }); }
}
