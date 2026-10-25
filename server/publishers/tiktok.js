// TikTok — Content Posting API (publication directe), connexion Login Kit.
import fs from 'node:fs';
import { getSettings } from '../config.js';
import { request, readChunk, PublishError, wait } from './http.js';

const API = 'https://open.tiktokapis.com/v2';

export const configured = () => Boolean(getSettings().tiktok.clientKey && getSettings().tiktok.clientSecret);

export function authUrl({ state, redirectUri }) {
  const q = new URLSearchParams({ client_key: getSettings().tiktok.clientKey, scope: 'user.info.basic,video.publish', response_type: 'code', redirect_uri: redirectUri, state });
  return `https://www.tiktok.com/v2/auth/authorize/?${q}`;
}

async function token(form) {
  const { clientKey, clientSecret } = getSettings().tiktok;
  const { data } = await request(`${API}/oauth/token/`, { method: 'POST', form: { client_key: clientKey, client_secret: clientSecret, ...form } });
  if (data.error) throw new Error(`TikTok : ${data.error_description || data.error}`);
  return data;
}

const asConn = (t, account) => ({
  accessToken: t.access_token, refreshToken: t.refresh_token, openId: t.open_id,
  expiresAt: Date.now() + t.expires_in * 1000, refreshExpiresAt: Date.now() + (t.refresh_expires_in || 0) * 1000, account,
});

export async function exchange({ code, redirectUri }) {
  const t = await token({ code, grant_type: 'authorization_code', redirect_uri: redirectUri });
  let account = { id: t.open_id, name: 'Compte TikTok' };
  try {
    const { data } = await request(`${API}/user/info/?fields=open_id,display_name,avatar_url`, { headers: { Authorization: `Bearer ${t.access_token}` } });
    account = { id: t.open_id, name: data.data?.user?.display_name || account.name, avatar: data.data?.user?.avatar_url };
  } catch { /* nom facultatif */ }
  return asConn(t, account);
}

export async function refresh(conn) {
  const t = await token({ grant_type: 'refresh_token', refresh_token: conn.refreshToken });
  return { ...conn, ...asConn(t, conn.account) };
}

const api = (conn, pathname, json) => request(`${API}${pathname}`, { method: 'POST', headers: { Authorization: `Bearer ${conn.accessToken}` }, json });

export async function publish({ conn, file, text, report }) {
  report('Vérification du compte TikTok…');
  const { data: info } = await api(conn, '/post/publish/creator_info/query/', {});
  const options = info.data?.privacy_level_options || ['SELF_ONLY'];
  const wanted = getSettings().tiktok.privacy;
  const privacy = options.includes(wanted) ? wanted : options.includes('SELF_ONLY') ? 'SELF_ONLY' : options[0];

  const size = fs.statSync(file).size;
  const MB = 1024 * 1024;
  const chunkSize = size <= 64 * MB ? size : 10 * MB;
  const chunks = size <= 64 * MB ? 1 : Math.floor(size / chunkSize);
  const { data: init } = await api(conn, '/post/publish/video/init/', {
    post_info: { title: text.slice(0, 2200), privacy_level: privacy, disable_duet: false, disable_comment: false, disable_stitch: false, video_cover_timestamp_ms: 1000 },
    source_info: { source: 'FILE_UPLOAD', video_size: size, chunk_size: chunkSize, total_chunk_count: chunks },
  });
  const { publish_id: publishId, upload_url: uploadUrl } = init.data || {};
  if (!uploadUrl) throw new PublishError(`TikTok : ${init.error?.message || 'envoi refusé'}`);

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = i === chunks - 1 ? size - 1 : start + chunkSize - 1;
    report(`Envoi à TikTok ${chunks > 1 ? `(${i + 1}/${chunks})` : ''}…`);
    await request(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4', 'Content-Range': `bytes ${start}-${end}/${size}` },
      body: await readChunk(file, start, end - start + 1),
      timeout: 15 * 60_000,
    });
  }
  report('TikTok traite la vidéo…');
  for (let i = 0; i < 120; i++) {
    const { data } = await api(conn, '/post/publish/status/fetch/', { publish_id: publishId });
    const status = data.data?.status;
    if (status === 'PUBLISH_COMPLETE' || status === 'SEND_TO_USER_INBOX') {
      const postId = data.data?.publicaly_available_post_id?.[0];
      return { id: postId || publishId, url: postId ? `https://m.tiktok.com/v/${postId}.html` : 'https://www.tiktok.com/', note: privacy === 'SELF_ONLY' ? 'Publié en privé (app TikTok non auditée)' : undefined };
    }
    if (status === 'FAILED') throw new PublishError(`TikTok a refusé la vidéo : ${data.data?.fail_reason || 'raison inconnue'}`);
    await wait(5000);
  }
  return { id: publishId, url: 'https://www.tiktok.com/', note: 'Toujours en traitement chez TikTok' };
}
