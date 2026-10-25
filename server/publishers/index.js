// Publication sur les réseaux + connexion des comptes (OAuth).
import crypto from 'node:crypto';
import { getSettings, NETWORKS, baseUrl } from '../config.js';
import { jobs, connections, oauthStates, publicMedia } from '../store.js';
import { composePost } from '../pipeline/text.js';
import { step, log, formatsFor } from '../pipeline/index.js';
import * as youtube from './youtube.js';
import * as meta from './meta.js';
import * as tiktok from './tiktok.js';
import * as x from './x.js';
import * as uploadpost from './uploadpost.js';

// Fournisseur OAuth de chaque réseau (Facebook et Instagram partagent la connexion Meta).
export const PROVIDERS = { youtube, meta, tiktok, x };
export const providerOf = (net) => (net === 'facebook' || net === 'instagram' ? 'meta' : net);

const DEV_PORTALS = {
  youtube: 'https://console.cloud.google.com/apis/library/youtube.googleapis.com',
  meta: 'https://developers.facebook.com/apps/',
  tiktok: 'https://developers.tiktok.com/apps/',
  x: 'https://developer.x.com/en/portal/dashboard',
};

export const redirectUri = (req, provider) => `${baseUrl(req)}/api/oauth/${provider}/callback`;

// État de chaque réseau pour l'écran « Comptes ».
export function networkStatus(req) {
  const s = getSettings();
  const out = {};
  for (const net of Object.keys(NETWORKS)) {
    const provider = providerOf(net);
    const conn = connections.get(provider);
    let account = conn?.account || null;
    if (provider === 'meta' && conn) {
      const page = meta.selectedPage(conn);
      account = net === 'instagram'
        ? (page?.ig ? { name: `@${page.ig.username}` } : null)
        : (page ? { name: page.name } : null);
    }
    out[net] = {
      label: NETWORKS[net].label,
      provider,
      mode: s.publishMode,
      ready: s.publishMode === 'uploadpost' ? uploadpost.uploadPostReady() : Boolean(conn && account),
      keysConfigured: PROVIDERS[provider].configured(),
      connected: Boolean(conn),
      account,
      redirectUri: redirectUri(req, provider),
      devPortal: DEV_PORTALS[provider],
      warning: provider === 'meta' && conn && net === 'instagram' && !account ? 'Relie un compte Instagram professionnel à ta Page Facebook.' : null,
    };
  }
  return out;
}

export function startOAuth(req, provider) {
  const p = PROVIDERS[provider];
  if (!p) throw new Error('Réseau inconnu');
  if (!p.configured()) throw new Error('Renseigne d\'abord les identifiants de l\'application développeur de ce réseau.');
  const state = crypto.randomBytes(16).toString('hex');
  const extra = provider === 'x' ? x.pkce() : {};
  oauthStates.put(state, { provider, verifier: extra.verifier });
  return p.authUrl({ state, redirectUri: redirectUri(req, provider), challenge: extra.challenge });
}

export async function finishOAuth(req, provider) {
  const { code, state, error, error_description: desc } = req.query;
  if (error) throw new Error(`Connexion annulée : ${desc || error}`);
  const saved = oauthStates.take(String(state || ''));
  if (!saved || saved.provider !== provider) throw new Error('Lien de connexion expiré, recommence.');
  const conn = await PROVIDERS[provider].exchange({ code: String(code), redirectUri: redirectUri(req, provider), verifier: saved.verifier });
  connections.set(provider, conn);
  return conn;
}

// Renouvelle le jeton s'il expire dans moins de 5 minutes.
export async function freshConnection(provider) {
  let conn = connections.get(provider);
  if (!conn) throw new Error(`${provider === 'meta' ? 'Facebook/Instagram' : NETWORKS[provider]?.label || provider} n'est pas connecté.`);
  if (conn.expiresAt && conn.expiresAt - Date.now() < 5 * 60_000 && PROVIDERS[provider].refresh) {
    conn = await PROVIDERS[provider].refresh(conn);
    connections.set(provider, conn);
  }
  return conn;
}

function formatOf(net, job) {
  const wanted = getSettings().networkFormats[net] || NETWORKS[net].format;
  return job.renders[wanted] ? wanted : formatsFor(job.networks).find((f) => job.renders[f]);
}

async function publishOne(job, net, req) {
  const s = getSettings();
  const post = job.posts[net];
  const render = job.renders[formatOf(net, job)];
  const text = composePost(net, post.caption, post.hashtags);
  const title = (post.title || job.title || job.plan?.hook || 'Nouvelle vidéo').slice(0, 95);
  const entry = (job.publish[net] = { ...(job.publish[net] || {}), status: 'uploading', detail: 'Démarrage…', error: null, startedAt: new Date().toISOString() });
  const report = (detail) => { entry.detail = detail; jobs.save(job); };
  jobs.save(job);

  // Lien public temporaire (Instagram peut en avoir besoin pour récupérer la vidéo).
  const token = crypto.randomBytes(24).toString('hex');
  publicMedia.put(token, render.file);
  const publicVideoUrl = /^https:/.test(baseUrl(req)) ? `${baseUrl(req)}/media/${token}.mp4` : null;

  const args = { job, net, file: render.file, text, title, hashtags: post.hashtags, report, publicVideoUrl };
  if (s.publishMode === 'uploadpost') return uploadpost.publish(args);
  const conn = await freshConnection(providerOf(net));
  if (net === 'youtube') return youtube.publish({ ...args, conn });
  if (net === 'facebook') return meta.publishFacebook({ ...args, conn });
  if (net === 'instagram') return meta.publishInstagram({ ...args, conn });
  if (net === 'tiktok') return tiktok.publish({ ...args, conn });
  if (net === 'x') return x.publish({ ...args, conn });
  throw new Error(`Réseau non pris en charge : ${net}`);
}

export async function publishJob(job, { only, req } = {}) {
  const targets = (only || Object.keys(job.posts).filter((n) => job.posts[n].enabled)).filter((n) => job.posts[n]);
  job.status = 'publishing';
  step(job, 'validation', { status: 'done', progress: 1, detail: `Validé le ${new Date().toLocaleString('fr-FR')}` });
  step(job, 'envoi', { status: 'running', progress: 0, detail: `0/${targets.length} réseau(x)` });

  // Tous les réseaux en parallèle.
  await Promise.all(targets.map(async (net) => {
    try {
      const result = await publishOne(job, net, req);
      job.publish[net] = { ...job.publish[net], status: 'done', detail: result.note || 'Publié', url: result.url, postId: result.id, at: new Date().toISOString(), error: null };
      log(job, `✅ Publié sur ${NETWORKS[net].label}`);
    } catch (err) {
      const prev = job.publish[net] || {};
      const attempts = (prev.attempts || 0) + 1;
      const retry = err.retryable && getSettings().automations.retryPublish && attempts < 3;
      job.publish[net] = {
        ...prev, status: 'error', detail: 'Échec', error: err.message, attempts,
        nextRetryAt: retry ? new Date(Date.now() + [2, 10, 30][attempts - 1] * 60_000).toISOString() : null,
      };
      log(job, `❌ ${NETWORKS[net].label} : ${err.message}${retry ? ' — nouvel essai automatique prévu' : ''}`);
    }
    const done = targets.filter((n) => ['done', 'error'].includes(job.publish[n]?.status)).length;
    step(job, 'envoi', { status: 'running', progress: done / targets.length, detail: `${done}/${targets.length} réseau(x)` });
  }));
  finalizeStatus(job);
}

export function finalizeStatus(job) {
  const enabled = Object.keys(job.posts).filter((n) => job.posts[n].enabled);
  const states = enabled.map((n) => job.publish[n]?.status);
  const ok = states.filter((s) => s === 'done').length;
  const pendingRetry = enabled.some((n) => job.publish[n]?.status === 'error' && job.publish[n]?.nextRetryAt);
  step(job, 'envoi', { status: ok === enabled.length ? 'done' : ok ? 'done' : 'error', progress: 1, detail: `${ok}/${enabled.length} réseau(x)` });
  if (ok === enabled.length) {
    job.status = 'published';
    step(job, 'publie', { status: 'done', progress: 1, detail: 'En ligne 🎉' });
  } else {
    job.status = ok ? 'partial' : 'failed';
    step(job, 'publie', { status: ok ? 'done' : 'error', progress: ok / enabled.length, detail: pendingRetry ? 'Nouvel essai automatique prévu' : `${enabled.length - ok} échec(s)` });
  }
  jobs.save(job);
}
