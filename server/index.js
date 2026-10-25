// Serveur web : API, direct (SSE), fichiers de l'interface.
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import {
  PATHS, PORT, NETWORKS, FORMATS, getSettings, updateSettings, publicSettings, hashPassword, checkPassword, baseUrl,
} from './config.js';
import { jobs, connections, publicMedia, flush } from './store.js';
import { bus } from './bus.js';
import { createSession, clearSession, isLoggedIn, requireAuth, loginThrottle } from './auth.js';
import { newJob, STEPS, cleanupJobFiles, log, step } from './pipeline/index.js';
import { MOODS } from './pipeline/text.js';
import { listTracks, addUserTrack, removeUserTrack } from './pipeline/music.js';
import { aiEnabled } from './pipeline/ai.js';
import { enqueueProcess, enqueueRerender, enqueuePublish, queueSizes } from './queue.js';
import { networkStatus, startOAuth, finishOAuth } from './publishers/index.js';
import { selectedPage } from './publishers/meta.js';
import { testUploadPost } from './publishers/uploadpost.js';
import { startAutomations } from './automations.js';
import { ffmpegAvailable } from './util/ffmpeg.js';

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- Accès ----------
app.get('/api/status', wrap(async (req, res) => {
  res.json({
    needsSetup: !getSettings().appPasswordHash,
    loggedIn: isLoggedIn(req),
    ffmpeg: Boolean(await ffmpegAvailable()),
    ai: aiEnabled(),
  });
}));

app.post('/api/setup', loginThrottle, (req, res) => {
  if (getSettings().appPasswordHash) return res.status(400).json({ error: 'Déjà configuré.' });
  const { password } = req.body || {};
  if (!password || password.length < 6) return res.status(400).json({ error: 'Mot de passe : 6 caractères minimum.' });
  updateSettings({ appPasswordHash: hashPassword(password) });
  createSession(res, req);
  res.json({ ok: true });
});

app.post('/api/login', loginThrottle, (req, res) => {
  if (!checkPassword(req.body?.password || '', getSettings().appPasswordHash)) return res.status(401).json({ error: 'Mot de passe incorrect.' });
  createSession(res, req);
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => { clearSession(res); res.json({ ok: true }); });

// Lien public temporaire vers une vidéo (utilisé par Instagram pour la récupérer).
app.get('/media/:token.mp4', (req, res) => {
  const entry = publicMedia.get(req.params.token);
  if (!entry || !fs.existsSync(entry.file)) return res.sendStatus(404);
  res.sendFile(entry.file, { headers: { 'Content-Type': 'video/mp4' } });
});

// Retour de connexion OAuth des réseaux.
app.get('/api/oauth/:provider/callback', wrap(async (req, res) => {
  if (!isLoggedIn(req)) return res.redirect('/#/comptes?error=' + encodeURIComponent('Reconnecte-toi à l\'app puis recommence.'));
  try {
    await finishOAuth(req, req.params.provider);
    res.redirect(`/#/comptes?connected=${req.params.provider}`);
  } catch (err) {
    res.redirect(`/#/comptes?error=${encodeURIComponent(err.message)}`);
  }
}));

// ---------- Tout le reste nécessite d'être connecté ----------
app.use('/api', requireAuth);

app.get('/api/meta', (req, res) => {
  res.json({
    networks: Object.fromEntries(Object.entries(NETWORKS).map(([k, v]) => [k, { label: v.label, maxCaption: v.maxCaption, maxHashtags: v.maxHashtags }])),
    formats: FORMATS,
    moods: Object.fromEntries(Object.entries(MOODS).map(([k, v]) => [k, v.label])),
    steps: STEPS,
    baseUrl: baseUrl(req),
    queue: queueSizes(),
  });
});

// Direct : chaque changement de publication est poussé à l'interface.
app.get('/api/events', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  const onJob = (job) => send('job', publicJob(job));
  const onRemoved = (d) => send('job-removed', d);
  const onConn = () => send('connections', {});
  bus.on('job', onJob);
  bus.on('job-removed', onRemoved);
  bus.on('connections', onConn);
  const ping = setInterval(() => res.write(': ping\n\n'), 25_000);
  req.on('close', () => { clearInterval(ping); bus.off('job', onJob); bus.off('job-removed', onRemoved); bus.off('connections', onConn); });
});

// ---------- Réglages ----------
app.get('/api/settings', (req, res) => res.json(publicSettings()));
app.put('/api/settings', (req, res) => {
  const body = { ...req.body };
  delete body.appPasswordHash;
  delete body.sessionSecret;
  if (body.newPassword) {
    if (body.newPassword.length < 6) return res.status(400).json({ error: 'Mot de passe : 6 caractères minimum.' });
    body.appPasswordHash = hashPassword(body.newPassword);
  }
  delete body.newPassword;
  if (body.publicUrl) body.publicUrl = String(body.publicUrl).trim().replace(/\/+$/, '');
  updateSettings(body);
  res.json(publicSettings());
});

// ---------- Comptes ----------
app.get('/api/connections', (req, res) => {
  const meta = connections.get('meta');
  res.json({
    mode: getSettings().publishMode,
    networks: networkStatus(req),
    metaPages: meta?.pages?.map((p) => ({ id: p.id, name: p.name, instagram: p.ig?.username || null })) || [],
    metaSelected: selectedPage(meta)?.id || null,
  });
});
app.get('/api/connect/:provider', (req, res) => {
  try { res.redirect(startOAuth(req, req.params.provider)); } catch (err) { res.redirect(`/#/comptes?error=${encodeURIComponent(err.message)}`); }
});
app.delete('/api/connections/:provider', (req, res) => { connections.remove(req.params.provider); res.json({ ok: true }); });
app.post('/api/connections/meta/page', (req, res) => {
  const conn = connections.get('meta');
  if (!conn?.pages?.some((p) => p.id === req.body.pageId)) return res.status(400).json({ error: 'Page inconnue' });
  connections.set('meta', { ...conn, selectedPageId: req.body.pageId });
  res.json({ ok: true });
});
app.post('/api/connections/uploadpost/test', wrap(async (req, res) => {
  try { res.json({ ok: true, data: await testUploadPost() }); } catch (err) { res.status(400).json({ error: err.message }); }
}));

// ---------- Musique ----------
const audioUpload = multer({ dest: path.join(PATHS.data, 'tmp'), limits: { fileSize: 50 * 1024 * 1024 } });
app.get('/api/music', (req, res) => res.json(listTracks().map(({ file, ...t }) => t)));
app.get('/api/music/play/:id', (req, res) => {
  const track = listTracks().find((t) => t.id === req.params.id);
  if (!track) return res.sendStatus(404);
  res.sendFile(track.file);
});
app.post('/api/music', audioUpload.single('file'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
  try {
    const { file, ...track } = await addUserTrack(req.file.path, req.file.originalname, req.body.mood);
    res.json(track);
  } catch (err) {
    fs.rmSync(req.file.path, { force: true });
    res.status(400).json({ error: `Fichier audio illisible : ${err.message}` });
  }
}));
app.delete('/api/music/:id', (req, res) => {
  try { removeUserTrack(req.params.id); res.json({ ok: true }); } catch (err) { res.status(400).json({ error: err.message }); }
});

// ---------- Publications ----------
function publicJob(job) {
  if (!job) return null;
  const { media, candidates, plan, renders, ...rest } = job;
  return {
    ...rest,
    media: media.map((m) => ({ name: m.name, type: m.type, size: m.size })),
    candidates: (candidates || []).map((c) => ({ id: c.id, kind: c.kind, time: c.time })),
    plan: plan && {
      ...plan,
      music: plan.music && { id: plan.music.id, title: plan.music.title, bpm: plan.music.bpm, origin: plan.music.origin },
      slides: plan.slides.map((s) => ({ candidateId: s.candidateId, caption: s.caption })),
    },
    renders: Object.fromEntries(Object.entries(renders || {}).map(([k, r]) => [k, {
      label: r.label, w: r.w, h: r.h, duration: r.duration,
      url: `/api/jobs/${job.id}/video/${k}?v=${r.v}`, thumb: `/api/jobs/${job.id}/thumb/${k}?v=${r.v}`,
    }])),
  };
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      req.jobDraftId ||= `${new Date().toISOString().slice(0, 10)}-${Math.random().toString(16).slice(2, 10)}`;
      const dir = path.join(PATHS.uploads, req.jobDraftId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(16).slice(2, 6)}${path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '')}`),
  }),
  limits: { fileSize: 1024 * 1024 * 1024, files: 30 },
  fileFilter: (req, file, cb) => cb(null, /^(image|video)\//.test(file.mimetype) || /\.(jpe?g|png|webp|heic|mp4|mov|m4v|webm|avi|mkv)$/i.test(file.originalname)),
});

app.get('/api/jobs', (req, res) => res.json(jobs.list().map(publicJob)));
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  return job ? res.json(publicJob(job)) : res.status(404).json({ error: 'Introuvable' });
});

app.post('/api/jobs', upload.array('files', 30), (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'Ajoute au moins une photo ou une vidéo.' });
  let networks = [];
  try { networks = JSON.parse(req.body.networks || '[]'); } catch { /* vide */ }
  networks = networks.filter((n) => NETWORKS[n]);
  if (!networks.length) return res.status(400).json({ error: 'Choisis au moins un réseau.' });
  const description = String(req.body.description || '').trim().slice(0, 3000);
  if (!description) return res.status(400).json({ error: 'Décris ta publication en quelques mots.' });

  const job = newJob({
    description,
    networks,
    options: { mood: req.body.mood || 'auto', duration: Number(req.body.duration) || null },
    media: files.map((f) => ({
      path: f.path, name: f.originalname, size: f.size,
      type: /^video\//.test(f.mimetype) || /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(f.originalname) ? 'video' : 'image',
    })),
  });
  // Les fichiers ont été rangés sous l'identifiant provisoire : on aligne.
  const draftDir = path.join(PATHS.uploads, req.jobDraftId);
  const finalDir = path.join(PATHS.uploads, job.id);
  fs.renameSync(draftDir, finalDir);
  job.media.forEach((m) => { m.path = path.join(finalDir, path.basename(m.path)); });
  jobs.save(job);
  enqueueProcess(job.id);
  res.json(publicJob(job));
});

function getJobOr404(req, res) {
  const job = jobs.get(req.params.id);
  if (!job) res.status(404).json({ error: 'Introuvable' });
  return job;
}

app.get('/api/jobs/:id/video/:format', (req, res) => {
  const r = jobs.get(req.params.id)?.renders?.[req.params.format];
  if (!r || !fs.existsSync(r.file)) return res.sendStatus(404);
  res.sendFile(r.file, { headers: { 'Content-Type': 'video/mp4' } });
});
app.get('/api/jobs/:id/download/:format', (req, res) => {
  const job = jobs.get(req.params.id);
  const r = job?.renders?.[req.params.format];
  if (!r || !fs.existsSync(r.file)) return res.sendStatus(404);
  res.download(r.file, `${job.id}-${req.params.format}.mp4`);
});
app.get('/api/jobs/:id/thumb/:format', (req, res) => {
  const r = jobs.get(req.params.id)?.renders?.[req.params.format];
  if (!r || !fs.existsSync(r.thumb)) return res.sendStatus(404);
  res.sendFile(r.thumb);
});
app.get('/api/jobs/:id/candidate/:cid', (req, res) => {
  const c = jobs.get(req.params.id)?.candidates?.find((x) => x.id === req.params.cid);
  if (!c || !fs.existsSync(c.thumb)) return res.sendStatus(404);
  res.sendFile(c.thumb);
});

// Modifie les textes de publication (sans remonter la vidéo).
app.patch('/api/jobs/:id/posts', (req, res) => {
  const job = getJobOr404(req, res);
  if (!job) return;
  for (const [net, p] of Object.entries(req.body.posts || {})) {
    if (!job.posts[net]) continue;
    if (typeof p.caption === 'string') job.posts[net].caption = p.caption.slice(0, 5000);
    if (Array.isArray(p.hashtags)) job.posts[net].hashtags = p.hashtags.map((t) => String(t).replace(/^#/, '').replace(/\s+/g, '')).filter(Boolean).slice(0, 30);
    if (typeof p.enabled === 'boolean') job.posts[net].enabled = p.enabled;
    if (typeof p.title === 'string') job.posts[net].title = p.title.slice(0, 100);
  }
  jobs.save(job);
  res.json(publicJob(job));
});

// Remontage : autre musique, ambiance, textes incrustés, ordre des images.
app.post('/api/jobs/:id/rerender', (req, res) => {
  const job = getJobOr404(req, res);
  if (!job) return;
  if (!['review', 'failed'].includes(job.status) || !job.plan) return res.status(400).json({ error: 'Remontage impossible à ce stade.' });
  job.status = 'processing';
  jobs.save(job);
  enqueueRerender(job.id, { mode: req.body.mode, trackId: req.body.trackId, edits: req.body.edits });
  res.json(publicJob(job));
});

// Validation : publication immédiate ou programmée.
app.post('/api/jobs/:id/approve', (req, res) => {
  const job = getJobOr404(req, res);
  if (!job) return;
  if (job.status !== 'review' && job.status !== 'scheduled') return res.status(400).json({ error: 'Cette vidéo n\'est pas prête à être validée.' });
  const enabled = Object.keys(job.posts).filter((n) => job.posts[n].enabled);
  if (!enabled.length) return res.status(400).json({ error: 'Active au moins un réseau.' });
  const when = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
  if (when && !Number.isNaN(when.getTime()) && when.getTime() > Date.now() + 60_000) {
    job.status = 'scheduled';
    job.scheduledAt = when.toISOString();
    step(job, 'validation', { status: 'done', progress: 1, detail: `Programmé le ${when.toLocaleString('fr-FR', { timeZone: req.body.timeZone || 'Europe/Paris' })}` });
    log(job, `🗓️ Publication programmée`);
  } else {
    job.status = 'publishing';
    job.scheduledAt = null;
    jobs.save(job);
    enqueuePublish(job.id, { req: { headers: req.headers, protocol: req.protocol, get: (h) => req.get(h) } });
  }
  res.json(publicJob(job));
});

app.post('/api/jobs/:id/unschedule', (req, res) => {
  const job = getJobOr404(req, res);
  if (!job) return;
  if (job.status !== 'scheduled') return res.status(400).json({ error: 'Pas de programmation en cours.' });
  job.status = 'review';
  job.scheduledAt = null;
  step(job, 'validation', { status: 'running', progress: 0, detail: 'En attente de ta validation' });
  res.json(publicJob(job));
});

app.post('/api/jobs/:id/retry', (req, res) => {
  const job = getJobOr404(req, res);
  if (!job) return;
  if (!job.renders || !Object.keys(job.renders).length || !job.plan) {
    job.status = 'queued';
    job.error = null;
    for (const s of Object.values(job.steps)) Object.assign(s, { status: 'pending', progress: 0, detail: '' });
    jobs.save(job);
    enqueueProcess(job.id);
  } else {
    const failed = Object.keys(job.posts).filter((n) => job.posts[n].enabled && job.publish[n]?.status !== 'done');
    if (!failed.length) return res.status(400).json({ error: 'Rien à relancer.' });
    job.status = 'publishing';
    jobs.save(job);
    enqueuePublish(job.id, { only: failed, req: { headers: req.headers, protocol: req.protocol, get: (h) => req.get(h) } });
  }
  res.json(publicJob(job));
});

app.delete('/api/jobs/:id', (req, res) => {
  const job = getJobOr404(req, res);
  if (!job) return;
  if (['processing', 'publishing'].includes(job.status)) return res.status(400).json({ error: 'Patiente jusqu\'à la fin du traitement.' });
  cleanupJobFiles(job);
  jobs.remove(job.id);
  res.json({ ok: true });
});

app.get('/api/health', wrap(async (req, res) => res.json({ ok: true, ffmpeg: await ffmpegAvailable(), queue: queueSizes() })));

// ---------- Interface ----------
app.use(express.static(PATHS.public, { index: 'index.html', maxAge: '1h', setHeaders: (res, file) => { if (/(sw\.js|index\.html)$/.test(file)) res.setHeader('Cache-Control', 'no-cache'); } }));
app.use('/fonts', express.static(PATHS.fonts, { maxAge: '30d' }));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const message = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop lourd.' : err.message || 'Erreur interne';
  res.status(err.status || 500).json({ error: message });
});

const server = app.listen(PORT, async () => {
  const ff = await ffmpegAvailable();
  console.log(`\n  ✨ Publik est lancé : http://localhost:${PORT}\n`);
  if (!ff) console.warn('  ⚠️  ffmpeg est introuvable : installe-le (ou lance avec Docker) pour pouvoir monter les vidéos.\n');
  startAutomations();
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { flush(); server.close(); process.exit(0); });
}
export { app };
