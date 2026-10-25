// Accès protégé par mot de passe (cookie de session signé).
import crypto from 'node:crypto';
import { getSettings } from './config.js';

const COOKIE = 'publik_session';
const MAX_AGE = 30 * 24 * 60 * 60; // 30 jours

const sign = (value) => crypto.createHmac('sha256', getSettings().sessionSecret).update(value).digest('base64url');

export function createSession(res, req) {
  const payload = `${Date.now() + MAX_AGE * 1000}`;
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE}=${payload}.${sign(payload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure ? '; Secure' : ''}`);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function isLoggedIn(req) {
  const raw = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return false;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(payload) > Date.now();
}

export function requireAuth(req, res, next) {
  if (isLoggedIn(req)) return next();
  res.status(401).json({ error: 'Connexion requise' });
}

// Anti force brute : 10 essais / 15 min par adresse IP.
const attempts = new Map();
export function loginThrottle(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const list = (attempts.get(key) || []).filter((t) => now - t < 15 * 60_000);
  if (list.length >= 10) return res.status(429).json({ error: 'Trop d\'essais, réessaie dans quelques minutes.' });
  list.push(now);
  attempts.set(key, list);
  next();
}
