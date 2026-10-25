// Facebook (Page) + Instagram (compte pro relié à la Page) — API Graph de Meta.
import fs from 'node:fs';
import { getSettings } from '../config.js';
import { request, fileBlob, PublishError, wait } from './http.js';

const V = 'v21.0';
const GRAPH = `https://graph.facebook.com/${V}`;

export const configured = () => Boolean(getSettings().meta.appId && getSettings().meta.appSecret);

export function authUrl({ state, redirectUri }) {
  const q = new URLSearchParams({
    client_id: getSettings().meta.appId, redirect_uri: redirectUri, state, response_type: 'code',
    scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,business_management',
  });
  return `https://www.facebook.com/${V}/dialog/oauth?${q}`;
}

export async function exchange({ code, redirectUri }) {
  const { appId, appSecret } = getSettings().meta;
  const { data: short } = await request(`${GRAPH}/oauth/access_token?${new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code })}`);
  // Jeton longue durée : les jetons de Page qui en découlent n'expirent pas.
  const { data: long } = await request(`${GRAPH}/oauth/access_token?${new URLSearchParams({ grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: short.access_token })}`);
  const { data: me } = await request(`${GRAPH}/me?fields=id,name&access_token=${long.access_token}`);
  const { data: acc } = await request(`${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=100&access_token=${long.access_token}`);
  const pages = (acc.data || []).map((p) => ({
    id: p.id, name: p.name, token: p.access_token,
    ig: p.instagram_business_account ? { id: p.instagram_business_account.id, username: p.instagram_business_account.username } : null,
  }));
  if (!pages.length) throw new Error('Aucune Page Facebook trouvée. Crée une Page (et relie-y ton compte Instagram pro), puis reconnecte-toi.');
  const selected = pages.find((p) => p.ig) || pages[0];
  return { userToken: long.access_token, account: { id: me.id, name: me.name }, pages, selectedPageId: selected.id };
}

export const selectedPage = (conn) => conn?.pages?.find((p) => p.id === conn.selectedPageId) || conn?.pages?.[0];

export async function publishFacebook({ conn, file, text, title, report }) {
  const page = selectedPage(conn);
  if (!page) throw new PublishError('Aucune Page Facebook sélectionnée.');
  const form = new FormData();
  form.append('access_token', page.token);
  form.append('description', text);
  form.append('title', title || '');
  form.append('source', await fileBlob(file), 'video.mp4');
  report(`Envoi vers la Page « ${page.name} »…`);
  const { data } = await request(`https://graph-video.facebook.com/${V}/${page.id}/videos`, { method: 'POST', body: form, timeout: 30 * 60_000 });
  return { id: data.id, url: `https://www.facebook.com/${page.id}/videos/${data.id}` };
}

export async function publishInstagram({ conn, file, text, publicVideoUrl, report }) {
  const page = selectedPage(conn);
  if (!page?.ig) throw new PublishError('Aucun compte Instagram professionnel relié à la Page Facebook choisie.');
  const token = page.token;
  report('Préparation du Reel Instagram…');
  let containerId;
  try {
    // Envoi direct du fichier (pas besoin que l'app soit accessible depuis Internet).
    const { data } = await request(`${GRAPH}/${page.ig.id}/media`, { method: 'POST', form: { media_type: 'REELS', upload_type: 'resumable', caption: text, share_to_feed: 'true', access_token: token } });
    containerId = data.id;
    const size = fs.statSync(file).size;
    report('Envoi de la vidéo à Instagram…');
    await request(`https://rupload.facebook.com/ig-api-upload/${V}/${containerId}`, {
      method: 'POST', headers: { Authorization: `OAuth ${token}`, offset: '0', file_size: String(size) }, body: await fileBlob(file), timeout: 30 * 60_000,
    });
  } catch (err) {
    if (!publicVideoUrl) throw err;
    // Repli : Instagram télécharge lui-même la vidéo depuis le lien public de l'app.
    const { data } = await request(`${GRAPH}/${page.ig.id}/media`, { method: 'POST', form: { media_type: 'REELS', video_url: publicVideoUrl, caption: text, share_to_feed: 'true', access_token: token } });
    containerId = data.id;
  }
  report('Instagram traite la vidéo…');
  for (let i = 0; i < 90; i++) {
    const { data } = await request(`${GRAPH}/${containerId}?fields=status_code,status&access_token=${token}`);
    if (data.status_code === 'FINISHED') break;
    if (data.status_code === 'ERROR' || data.status_code === 'EXPIRED') throw new PublishError(`Instagram a rejeté la vidéo : ${data.status || data.status_code}`);
    if (i === 89) throw new PublishError('Instagram met trop de temps à traiter la vidéo.', { retryable: true });
    await wait(5000);
  }
  const { data: pub } = await request(`${GRAPH}/${page.ig.id}/media_publish`, { method: 'POST', form: { creation_id: containerId, access_token: token } });
  let url = `https://www.instagram.com/${page.ig.username || ''}`;
  try { url = (await request(`${GRAPH}/${pub.id}?fields=permalink&access_token=${token}`)).data.permalink || url; } catch { /* lien par défaut */ }
  return { id: pub.id, url };
}
