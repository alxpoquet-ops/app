// Chemins, réglages persistants et secrets de l'application.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
export const PATHS = {
  data: DATA_DIR,
  uploads: path.join(DATA_DIR, 'uploads'),
  work: path.join(DATA_DIR, 'work'),
  renders: path.join(DATA_DIR, 'renders'),
  music: path.join(DATA_DIR, 'music'),
  musicGenerated: path.join(DATA_DIR, 'music-generated'),
  fonts: path.join(ROOT, 'assets', 'fonts'),
  public: path.join(ROOT, 'public'),
  settings: path.join(DATA_DIR, 'settings.json'),
  db: path.join(DATA_DIR, 'db.json'),
};
for (const key of ['data', 'uploads', 'work', 'renders', 'music', 'musicGenerated']) {
  fs.mkdirSync(PATHS[key], { recursive: true });
}

export const PORT = Number(process.env.PORT || 3000);
export const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
export const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';

export const NETWORKS = {
  tiktok: { label: 'TikTok', format: 'vertical', maxCaption: 2200, maxHashtags: 5 },
  instagram: { label: 'Instagram', format: 'vertical', maxCaption: 2200, maxHashtags: 15 },
  facebook: { label: 'Facebook', format: 'vertical', maxCaption: 5000, maxHashtags: 5 },
  youtube: { label: 'YouTube', format: 'vertical', maxCaption: 5000, maxHashtags: 8 },
  x: { label: 'X (Twitter)', format: 'square', maxCaption: 280, maxHashtags: 3 },
};

export const FORMATS = {
  vertical: { id: 'vertical', label: '9:16', w: 1080, h: 1920 },
  square: { id: 'square', label: '1:1', w: 1080, h: 1080 },
  landscape: { id: 'landscape', label: '16:9', w: 1920, h: 1080 },
};

// Secrets : jamais renvoyés en clair à l'interface.
const SECRET_KEYS = new Set([
  'anthropicApiKey', 'apiKey', 'clientSecret', 'appSecret', 'appPasswordHash', 'sessionSecret',
]);
export const MASK = '••••••••';

const DEFAULTS = {
  appPasswordHash: '',
  sessionSecret: '',
  publicUrl: process.env.PUBLIC_URL || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  publishMode: process.env.PUBLISH_MODE || 'uploadpost', // 'uploadpost' (simple) | 'direct'
  uploadPost: { apiKey: process.env.UPLOADPOST_API_KEY || '', user: process.env.UPLOADPOST_USER || '' },
  youtube: { clientId: process.env.YOUTUBE_CLIENT_ID || '', clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '' },
  meta: { appId: process.env.META_APP_ID || '', appSecret: process.env.META_APP_SECRET || '' },
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
    privacy: 'SELF_ONLY', // les apps TikTok non auditées ne peuvent publier qu'en privé
  },
  x: { clientId: process.env.X_CLIENT_ID || '', clientSecret: process.env.X_CLIENT_SECRET || '' },
  youtubePrivacy: 'public',
  video: { maxDuration: 30, defaultNetworks: ['tiktok', 'instagram', 'facebook', 'youtube', 'x'] },
  networkFormats: Object.fromEntries(Object.entries(NETWORKS).map(([k, v]) => [k, v.format])),
  brand: { cta: 'Abonne-toi pour la suite !', signature: '' },
  automations: { cleanupDays: 14, retryPublish: true },
};

function deepMerge(base, extra) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return extra === undefined ? base : extra;
  const out = { ...base };
  for (const [k, v] of Object.entries(extra || {})) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof base[k] === 'object' ? deepMerge(base[k], v) : v;
  }
  return out;
}

let settings = load();

function load() {
  let saved = {};
  try { saved = JSON.parse(fs.readFileSync(PATHS.settings, 'utf8')); } catch { /* premier lancement */ }
  const merged = deepMerge(DEFAULTS, saved);
  if (!merged.sessionSecret) merged.sessionSecret = crypto.randomBytes(32).toString('hex');
  if (process.env.APP_PASSWORD && !merged.appPasswordHash) merged.appPasswordHash = hashPassword(process.env.APP_PASSWORD);
  writeFile(merged);
  return merged;
}

function writeFile(data) {
  const tmp = PATHS.settings + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, PATHS.settings);
}

export function getSettings() { return settings; }

export function updateSettings(patch) {
  settings = deepMerge(settings, stripMasked(patch));
  writeFile(settings);
  return settings;
}

function stripMasked(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === MASK) continue; // valeur masquée renvoyée telle quelle : on garde l'ancienne
    out[k] = stripMasked(v);
  }
  return out;
}

export function publicSettings(obj = settings) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'appPasswordHash' || k === 'sessionSecret') continue;
    if (SECRET_KEYS.has(k)) out[k] = v ? MASK : '';
    else out[k] = publicSettings(v);
  }
  return out;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function checkPassword(password, stored) {
  if (!stored || !password) return false;
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

// URL publique de l'app (pour OAuth et les liens vidéo). Repli sur l'URL de la requête.
export function baseUrl(req) {
  const configured = settings.publicUrl?.replace(/\/+$/, '');
  if (configured) return configured;
  if (!req) return `http://localhost:${PORT}`;
  const proto = req.headers['x-forwarded-proto']?.split(',')[0] || req.protocol;
  return `${proto}://${req.get('host')}`;
}
