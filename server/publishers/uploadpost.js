// Mode simple : un seul compte Upload-Post (upload-post.com) relié à TikTok, Instagram,
// Facebook, YouTube et X. Une seule clé API à copier dans l'app.
import { getSettings } from '../config.js';
import { request, fileBlob, PublishError } from './http.js';

const API = 'https://api.upload-post.com/api';

export function uploadPostReady() {
  const { apiKey, user } = getSettings().uploadPost;
  return Boolean(apiKey && user);
}

export async function testUploadPost() {
  const { apiKey } = getSettings().uploadPost;
  if (!apiKey) throw new Error('Clé API Upload-Post manquante.');
  const { data } = await request(`${API}/uploadposts/users`, { headers: { Authorization: `Apikey ${apiKey}` } });
  return data;
}

function findUrl(obj) {
  if (!obj || typeof obj !== 'object') return null;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && /^https?:\/\//.test(v) && /url|link|permalink/i.test(k)) return v;
    if (typeof v === 'object') { const u = findUrl(v); if (u) return u; }
  }
  return null;
}

export async function publish({ net, file, text, title, report }) {
  const { apiKey, user, facebookPageId } = getSettings().uploadPost;
  if (!apiKey || !user) throw new PublishError('Upload-Post n\'est pas configuré (Réglages → Comptes).');
  const form = new FormData();
  form.append('user', user);
  form.append('platform[]', net);
  form.append('title', net === 'youtube' ? title : text);
  if (net === 'youtube') form.append('description', text);
  if (net === 'facebook' && facebookPageId) form.append('facebook_page_id', facebookPageId);
  form.append('video', await fileBlob(file), 'video.mp4');
  report('Envoi de la vidéo à Upload-Post…');
  const { data } = await request(`${API}/upload`, { method: 'POST', headers: { Authorization: `Apikey ${apiKey}` }, body: form, timeout: 15 * 60_000 });
  const result = data?.results?.[net] ?? data?.results ?? data;
  if (data?.success === false || result?.success === false) {
    throw new PublishError(result?.error || data?.error || data?.message || 'Échec côté Upload-Post', { retryable: false });
  }
  return { url: findUrl(result) || findUrl(data), id: result?.id || data?.request_id || null };
}
