// X (Twitter) — API v2 : OAuth 2.0 PKCE, envoi vidéo par morceaux, puis publication.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { getSettings } from '../config.js';
import { request, readChunk, PublishError, wait } from './http.js';

const API = 'https://api.x.com/2';

export const configured = () => Boolean(getSettings().x.clientId);

export function pkce() {
  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function authUrl({ state, redirectUri, challenge }) {
  const q = new URLSearchParams({
    response_type: 'code', client_id: getSettings().x.clientId, redirect_uri: redirectUri, state,
    scope: 'tweet.read tweet.write users.read media.write offline.access', code_challenge: challenge, code_challenge_method: 'S256',
  });
  return `https://x.com/i/oauth2/authorize?${q}`;
}

async function token(form) {
  const { clientId, clientSecret } = getSettings().x;
  const headers = clientSecret ? { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` } : {};
  const { data } = await request(`${API}/oauth2/token`, { method: 'POST', headers, form: { client_id: clientId, ...form } });
  return data;
}

export async function exchange({ code, redirectUri, verifier }) {
  const t = await token({ code, grant_type: 'authorization_code', redirect_uri: redirectUri, code_verifier: verifier });
  const { data } = await request(`${API}/users/me`, { headers: { Authorization: `Bearer ${t.access_token}` } });
  return {
    accessToken: t.access_token, refreshToken: t.refresh_token, expiresAt: Date.now() + t.expires_in * 1000,
    account: { id: data.data.id, name: `@${data.data.username}`, username: data.data.username },
  };
}

export async function refresh(conn) {
  if (!conn.refreshToken) throw new PublishError('Reconnecte X (jeton expiré).');
  const t = await token({ grant_type: 'refresh_token', refresh_token: conn.refreshToken });
  return { ...conn, accessToken: t.access_token, refreshToken: t.refresh_token || conn.refreshToken, expiresAt: Date.now() + t.expires_in * 1000 };
}

const mediaId = (data) => data?.data?.id || data?.media_id_string || data?.data?.media_id;
const processing = (data) => data?.data?.processing_info || data?.processing_info;

export async function publish({ conn, file, text, report }) {
  const auth = { Authorization: `Bearer ${conn.accessToken}` };
  const size = fs.statSync(file).size;
  report('Préparation de l\'envoi sur X…');
  const { data: init } = await request(`${API}/media/upload`, { method: 'POST', headers: auth, form: { command: 'INIT', media_type: 'video/mp4', total_bytes: size, media_category: 'tweet_video' } });
  const id = mediaId(init);
  if (!id) throw new PublishError('X n\'a pas créé l\'envoi.');
  const CHUNK = 4 * 1024 * 1024;
  const parts = Math.ceil(size / CHUNK);
  for (let i = 0; i < parts; i++) {
    report(`Envoi à X (${i + 1}/${parts})…`);
    const form = new FormData();
    form.append('command', 'APPEND');
    form.append('media_id', id);
    form.append('segment_index', String(i));
    form.append('media', new Blob([await readChunk(file, i * CHUNK, CHUNK)]), 'chunk');
    await request(`${API}/media/upload`, { method: 'POST', headers: auth, body: form, timeout: 10 * 60_000 });
  }
  const { data: fin } = await request(`${API}/media/upload`, { method: 'POST', headers: auth, form: { command: 'FINALIZE', media_id: id } });
  let info = processing(fin);
  while (info && info.state !== 'succeeded') {
    if (info.state === 'failed') throw new PublishError(`X a refusé la vidéo : ${info.error?.message || 'format non accepté'}`);
    report('X traite la vidéo…');
    await wait(Math.max(1, info.check_after_secs || 3) * 1000);
    const { data } = await request(`${API}/media/upload?command=STATUS&media_id=${id}`, { headers: auth });
    info = processing(data);
  }
  report('Publication du post…');
  const { data: tweet } = await request(`${API}/tweets`, { method: 'POST', headers: auth, json: { text: text.slice(0, 280), media: { media_ids: [id] } } });
  return { id: tweet.data.id, url: `https://x.com/${conn.account?.username || 'i'}/status/${tweet.data.id}` };
}
