// YouTube (Shorts) — API YouTube Data v3, connexion OAuth Google.
import fs from 'node:fs';
import { getSettings } from '../config.js';
import { request, fileBlob, PublishError } from './http.js';

export const configured = () => Boolean(getSettings().youtube.clientId && getSettings().youtube.clientSecret);

export function authUrl({ state, redirectUri }) {
  const { clientId } = getSettings().youtube;
  const q = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: 'code', state,
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

async function token(form) {
  const { clientId, clientSecret } = getSettings().youtube;
  const { data } = await request('https://oauth2.googleapis.com/token', { method: 'POST', form: { client_id: clientId, client_secret: clientSecret, ...form } });
  return data;
}

export async function exchange({ code, redirectUri }) {
  const t = await token({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' });
  const { data } = await request('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: { Authorization: `Bearer ${t.access_token}` } });
  const ch = data.items?.[0];
  if (!ch) throw new Error('Aucune chaîne YouTube sur ce compte Google. Crée d\'abord ta chaîne sur youtube.com.');
  return {
    accessToken: t.access_token, refreshToken: t.refresh_token, expiresAt: Date.now() + t.expires_in * 1000,
    account: { id: ch.id, name: ch.snippet.title, avatar: ch.snippet.thumbnails?.default?.url },
  };
}

export async function refresh(conn) {
  if (!conn.refreshToken) throw new PublishError('Reconnecte YouTube (jeton expiré).');
  const t = await token({ refresh_token: conn.refreshToken, grant_type: 'refresh_token' });
  return { ...conn, accessToken: t.access_token, expiresAt: Date.now() + t.expires_in * 1000 };
}

export async function publish({ conn, file, text, title, hashtags, report }) {
  const size = fs.statSync(file).size;
  const fullTitle = /#shorts/i.test(title) ? title : `${title} #Shorts`.trim();
  report('Création de l\'envoi YouTube…');
  const { res } = await request('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${conn.accessToken}`, 'X-Upload-Content-Length': String(size), 'X-Upload-Content-Type': 'video/mp4' },
    json: {
      snippet: { title: fullTitle.slice(0, 100), description: text.slice(0, 4900), tags: (hashtags || []).slice(0, 15), categoryId: '22' },
      status: { privacyStatus: getSettings().youtubePrivacy || 'public', selfDeclaredMadeForKids: false },
    },
  });
  const uploadUrl = res.headers.get('location');
  if (!uploadUrl) throw new PublishError('YouTube n\'a pas fourni d\'adresse d\'envoi.', { retryable: true });
  report('Envoi de la vidéo à YouTube…');
  const { data } = await request(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'video/mp4' }, body: await fileBlob(file), timeout: 30 * 60_000 });
  return { id: data.id, url: `https://www.youtube.com/shorts/${data.id}` };
}
