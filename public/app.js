// Publik — interface (aucune étape de build : modules natifs du navigateur).

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const view = $('#view');

const state = { status: null, meta: null, jobs: new Map(), connections: null, settings: null, route: null };

// ---------- Icônes (traits fins) ----------
const svg = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
const ICONS = {
  analyse: svg('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>'),
  decoupage: svg('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5 20 17M8 16.5 20 7"/>'),
  textes: svg('<path d="M4 6h16M4 12h10M4 18h7"/><path d="m16 15 2 2 3-4"/>'),
  musique: svg('<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
  montage: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18M8 5v4M13 5v4M18 5v4"/>'),
  validation: svg('<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'),
  envoi: svg('<path d="M21 3 10 14"/><path d="m21 3-7 18-4-7-7-4z"/>'),
  publie: svg('<path d="M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 15.6 7.1 18.2 8 12.7 4 8.8 9.6 8z"/>'),
  upload: svg('<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'),
  film: svg('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3z"/>'),
  check: svg('<path d="m5 12 4.5 4.5L19 7"/>'),
  cross: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
};
const NET_LETTER = { tiktok: 'Tt', instagram: 'Ig', facebook: 'Fb', youtube: 'Yt', x: 'X' };
const STATUS = {
  queued: ['En file d\'attente', 'run'], processing: ['Montage en cours', 'run'], review: ['À valider', 'warn'],
  scheduled: ['Programmé', 'run'], publishing: ['Publication…', 'run'], published: ['Publié', 'ok'],
  partial: ['Publié en partie', 'warn'], failed: ['Échec', 'err'],
};

// ---------- Outils ----------
async function api(method, url, body) {
  const opts = { method, headers: {} };
  if (body instanceof FormData) opts.body = body;
  else if (body !== undefined) { opts.body = JSON.stringify(body); opts.headers['Content-Type'] = 'application/json'; }
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !url.startsWith('/api/login')) { state.status.loggedIn = false; render(); throw new Error('Connexion requise'); }
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), type === 'err' ? 6000 : 3500);
}

function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#c9bfff', '#f7c2d6', '#ffd9c2', '#cdeedd', '#cfe3fb', '#fff0bf'];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('i');
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = `${2 + Math.random() * 2.5}s`;
    c.style.animationDelay = `${Math.random() * 0.6}s`;
    box.append(c);
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 5500);
}

const fmtDate = (iso) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const badge = (status) => { const [label, cls] = STATUS[status] || [status, '']; return `<span class="badge ${cls}"><span class="dot"></span>${label}</span>`; };
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

// ---------- Démarrage ----------
async function boot() {
  state.status = await api('GET', '/api/status');
  if (state.status.loggedIn) await loadBase();
  window.addEventListener('hashchange', render);
  render();
}

async function loadBase() {
  const [meta, jobs, connections, settings] = await Promise.all([
    api('GET', '/api/meta'), api('GET', '/api/jobs'), api('GET', '/api/connections'), api('GET', '/api/settings'),
  ]);
  Object.assign(state, { meta, connections, settings });
  state.jobs = new Map(jobs.map((j) => [j.id, j]));
  connectEvents();
}

let events;
function connectEvents() {
  events?.close();
  events = new EventSource('/api/events');
  events.addEventListener('job', (e) => {
    const job = JSON.parse(e.data);
    const prev = state.jobs.get(job.id);
    state.jobs.set(job.id, job);
    if (prev && prev.status !== 'published' && job.status === 'published') {
      confetti();
      notify('Publication en ligne 🎉', job.description);
    }
    if (prev && prev.status !== 'review' && job.status === 'review') notify('Ta vidéo est prête', 'Elle attend ta validation.');
    onJobUpdate(job);
  });
  events.addEventListener('job-removed', (e) => { state.jobs.delete(JSON.parse(e.data).id); if (state.route === 'publications') render(); });
  events.addEventListener('connections', async () => { state.connections = await api('GET', '/api/connections'); if (state.route === 'comptes') render(); });
}

function notify(title, body) {
  if (document.visibilityState === 'visible') return;
  if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body, icon: '/icon-192.png' });
}

// ---------- Routeur ----------
function parseRoute() {
  const [pathPart, query] = location.hash.replace(/^#/, '').split('?');
  const parts = pathPart.split('/').filter(Boolean);
  return { name: parts[0] || 'create', id: parts[1], query: new URLSearchParams(query || '') };
}

function render() {
  if (!state.status.loggedIn) return renderAuth();
  const route = parseRoute();
  state.route = route.name;
  $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === route.name || (route.name === 'job' && a.dataset.route === 'publications')));
  window.scrollTo({ top: 0 });
  ({ create: renderCreate, job: () => renderJob(route.id), publications: renderPublications, comptes: () => renderAccounts(route.query), reglages: renderSettings }[route.name] || renderCreate)();
}

// ---------- Connexion / premier lancement ----------
function renderAuth() {
  const setup = state.status.needsSetup;
  $('#nav').classList.add('hidden');
  view.innerHTML = `
    <div class="auth card">
      <img src="/icon.svg" alt="">
      <h1>${setup ? 'Bienvenue sur Publik' : 'Bon retour'}</h1>
      <p class="muted">${setup ? 'Choisis un mot de passe pour protéger ton espace. Tu pourras partager l\'app avec ton équipe en leur donnant ce mot de passe.' : 'Entre ton mot de passe pour continuer.'}</p>
      <form id="authForm" class="stack" style="text-align:left">
        <div class="field"><label for="pw">Mot de passe</label><input id="pw" type="password" autocomplete="${setup ? 'new-password' : 'current-password'}" required minlength="${setup ? 6 : 1}"></div>
        <button class="btn primary big">${setup ? 'Créer mon espace' : 'Entrer'}</button>
      </form>
      ${state.status.ffmpeg ? '' : '<p class="badge err" style="margin-top:14px">ffmpeg manquant sur le serveur : le montage ne fonctionnera pas.</p>'}
    </div>`;
  $('#authForm').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('POST', setup ? '/api/setup' : '/api/login', { password: $('#pw').value });
      state.status = await api('GET', '/api/status');
      $('#nav').classList.remove('hidden');
      await loadBase();
      render();
    } catch (err) { toast(err.message, 'err'); }
  };
}

// ---------- Créer ----------
const draft = { files: [], description: '', networks: null, mood: 'auto', duration: '' };

function renderCreate() {
  const nets = state.connections.networks;
  if (!draft.networks) draft.networks = (state.settings.video.defaultNetworks || Object.keys(nets)).filter((n) => nets[n]);
  const shared = parseRoute().query.get('text');
  if (shared && !draft.description) draft.description = shared;
  const notReady = draft.networks.filter((n) => !nets[n].ready);

  view.innerHTML = `
    <section class="hero">
      <h1>Une vidéo, <em>tous tes réseaux</em>.</h1>
      <p>Dépose tes photos ou ta vidéo, décris ton idée. Publik choisit les meilleurs moments, ajoute musique, effets, sous-titres et hashtags — puis publie après ta validation.</p>
    </section>
    <div class="grid two">
      <div class="card stack">
        <h2>1 · Tes fichiers</h2>
        <div class="drop" id="drop" tabindex="0" role="button" aria-label="Ajouter des photos ou vidéos">
          <div class="big-ico">${ICONS.upload}</div>
          <strong>Ajouter des photos ou vidéos</strong>
          <span class="muted small">Glisse-les ici ou touche pour choisir · jusqu'à 30 fichiers</span>
          <input id="files" type="file" accept="image/*,video/*" multiple hidden>
        </div>
        <div class="thumbs" id="thumbs"></div>
      </div>
      <div class="card stack">
        <h2>2 · Ta publication</h2>
        <div class="field">
          <label for="desc">Décris ce que tu veux publier</label>
          <textarea id="desc" rows="5" maxlength="3000" placeholder="Ex : Notre week-end surf à Biarritz ! Session au lever du soleil, puis crêpes face à l'océan. Ambiance détente et bonne humeur.">${esc(draft.description)}</textarea>
          <div class="hint">Raconte en quelques phrases : l'ambiance, le message, à qui tu t'adresses. Tu peux ajouter tes propres #hashtags.</div>
        </div>
        <div class="field">
          <label>Où publier ?</label>
          <div class="chips" id="nets">
            ${Object.entries(nets).map(([k, n]) => `
              <label class="chip ${draft.networks.includes(k) ? 'on' : ''}" title="${n.ready ? 'Prêt' : 'Compte à connecter'}">
                <input type="checkbox" value="${k}" ${draft.networks.includes(k) ? 'checked' : ''}>
                <span class="state ${n.ready ? 'ok' : ''}"></span>${esc(n.label)}
              </label>`).join('')}
          </div>
          ${notReady.length ? `<div class="hint">Pas encore connecté : ${notReady.map((n) => nets[n].label).join(', ')} — <a href="#/comptes">relier mes comptes</a>. Tu peux quand même créer la vidéo.</div>` : ''}
        </div>
        <details class="opts">
          <summary>Options (facultatif)</summary>
          <div class="grid two" style="margin-top:12px">
            <div class="field"><label for="mood">Ambiance musicale</label>
              <select id="mood"><option value="auto">Automatique</option>${Object.entries(state.meta.moods).map(([k, v]) => `<option value="${k}" ${draft.mood === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
            <div class="field"><label for="dur">Durée maximale</label>
              <select id="dur"><option value="">Automatique (${state.settings.video.maxDuration} s)</option>${[15, 30, 45, 60].map((d) => `<option value="${d}" ${String(draft.duration) === String(d) ? 'selected' : ''}>${d} secondes</option>`).join('')}</select></div>
          </div>
        </details>
        <div id="uploadState" class="hidden"><div class="progress"><i id="upBar"></i></div><p class="hint" id="upText">Envoi…</p></div>
        <button class="btn primary big" id="go">Créer ma vidéo</button>
      </div>
    </div>`;

  const input = $('#files');
  const drop = $('#drop');
  drop.onclick = () => input.click();
  drop.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') input.click(); };
  input.onchange = () => { addFiles(input.files); input.value = ''; };
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('over'); addFiles(e.dataTransfer.files); };
  $('#desc').oninput = (e) => { draft.description = e.target.value; };
  $('#mood').onchange = (e) => { draft.mood = e.target.value; };
  $('#dur').onchange = (e) => { draft.duration = e.target.value; };
  $$('#nets input').forEach((cb) => { cb.onchange = () => {
    cb.parentElement.classList.toggle('on', cb.checked);
    draft.networks = $$('#nets input').filter((x) => x.checked).map((x) => x.value);
  }; });
  $('#go').onclick = submitDraft;
  drawThumbs();
}

function addFiles(list) {
  for (const f of list) {
    if (!/^(image|video)\//.test(f.type) && !/\.(heic|mov|mp4|m4v|webm|mkv|avi)$/i.test(f.name)) { toast(`« ${f.name} » n'est ni une photo ni une vidéo`, 'err'); continue; }
    if (draft.files.length >= 30) { toast('30 fichiers maximum', 'err'); break; }
    draft.files.push({ file: f, url: URL.createObjectURL(f), video: f.type.startsWith('video/') || /\.(mov|mp4|m4v|webm|mkv|avi)$/i.test(f.name) });
  }
  drawThumbs();
}

function drawThumbs() {
  const box = $('#thumbs');
  if (!box) return;
  box.innerHTML = draft.files.map((f, i) => `
    <div class="thumb">
      ${f.video ? `<video src="${f.url}#t=0.5" muted playsinline preload="metadata"></video><span class="kind">Vidéo</span>` : `<img src="${f.url}" alt="">`}
      <button class="x" data-i="${i}" aria-label="Retirer">✕</button>
    </div>`).join('');
  $$('.x', box).forEach((b) => { b.onclick = () => { URL.revokeObjectURL(draft.files[b.dataset.i].url); draft.files.splice(b.dataset.i, 1); drawThumbs(); }; });
}

function submitDraft() {
  if (!draft.files.length) return toast('Ajoute au moins une photo ou une vidéo', 'err');
  if (!draft.description.trim()) return toast('Décris ta publication en quelques mots', 'err');
  if (!draft.networks.length) return toast('Choisis au moins un réseau', 'err');
  const fd = new FormData();
  draft.files.forEach((f) => fd.append('files', f.file, f.file.name));
  fd.append('description', draft.description);
  fd.append('networks', JSON.stringify(draft.networks));
  fd.append('mood', draft.mood);
  if (draft.duration) fd.append('duration', draft.duration);

  $('#go').disabled = true;
  $('#uploadState').classList.remove('hidden');
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  // XHR pour afficher la progression de l'envoi.
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/jobs');
  xhr.upload.onprogress = (e) => {
    if (!e.lengthComputable) return;
    const p = Math.round((e.loaded / e.total) * 100);
    $('#upBar').style.width = `${p}%`;
    $('#upText').textContent = p < 100 ? `Envoi des fichiers… ${p} %` : 'Fichiers reçus, démarrage du montage…';
  };
  xhr.onload = () => {
    const data = JSON.parse(xhr.responseText || '{}');
    if (xhr.status >= 300) { toast(data.error || 'Erreur', 'err'); $('#go').disabled = false; return; }
    draft.files.forEach((f) => URL.revokeObjectURL(f.url));
    Object.assign(draft, { files: [], description: '', mood: 'auto', duration: '' });
    state.jobs.set(data.id, data);
    location.hash = `#/job/${data.id}`;
  };
  xhr.onerror = () => { toast('Envoi impossible : vérifie ta connexion', 'err'); $('#go').disabled = false; };
  xhr.send(fd);
}

// ---------- Suivi d'une publication ----------
let jobSignature = '';

function renderJob(id) {
  const job = state.jobs.get(id);
  if (!job) { view.innerHTML = '<div class="empty"><div class="big-ico">?</div><p>Publication introuvable.</p><a class="btn" href="#/publications">Retour</a></div>'; return; }
  jobSignature = '';
  view.innerHTML = `
    <div class="row between" style="margin-bottom:12px">
      <a href="#/publications" class="btn ghost small">← Publications</a>
      <span id="jobBadge">${badge(job.status)}</span>
    </div>
    <h1 style="font-size:clamp(1.4rem,4vw,2rem)">${esc(job.description.split(/\n/)[0].slice(0, 90))}${job.description.length > 90 ? '…' : ''}</h1>
    <p class="muted small">Créée le ${fmtDate(job.createdAt)} · ${job.media.length} fichier(s) · ${job.networks.map((n) => state.meta.networks[n].label).join(', ')}</p>
    <div class="card" id="pipeCard"></div>
    <div id="jobMain" style="margin-top:16px"></div>`;
  onJobUpdate(job);
}

function onJobUpdate(job) {
  if (state.route === 'publications') return renderPublications();
  if (state.route !== 'job' || parseRoute().id !== job.id) return;
  $('#jobBadge').innerHTML = badge(job.status);
  drawPipeline(job);
  // La zone principale n'est redessinée que si son contenu change vraiment
  // (pour ne pas interrompre la lecture vidéo ou la saisie).
  const sig = [job.status, Object.values(job.renders || {}).map((r) => r.url).join(), job.status === 'publishing' || ['published', 'partial', 'failed'].includes(job.status) ? JSON.stringify(job.publish) : ''].join('|');
  if (sig !== jobSignature) {
    jobSignature = sig;
    drawJobMain(job);
  }
}

function drawPipeline(job) {
  const steps = state.meta.steps;
  const current = steps.find((s) => job.steps[s.key].status === 'running');
  const cur = current && job.steps[current.key];
  const picked = new Set(job.plan?.slides?.map((s) => s.candidateId) || []);
  $('#pipeCard').innerHTML = `
    <div class="pipeline">
      ${steps.map((s) => {
        const st = job.steps[s.key];
        const icon = st.status === 'done' ? ICONS.check : st.status === 'error' ? ICONS.cross : ICONS[s.key];
        return `<div class="pstep ${st.status}"><div class="pcircle">${icon}</div><div><div class="plabel">${s.label}</div><div class="pdetail">${esc(st.detail || '')}</div></div></div>`;
      }).join('')}
    </div>
    ${cur && current.key !== 'validation' ? `<div class="now"><div class="spinner"></div><div style="flex:1"><strong>${current.label}</strong><div class="small muted">${esc(cur.detail || '')}</div>${cur.progress ? `<div class="progress" style="margin-top:8px"><i style="width:${Math.round(cur.progress * 100)}%"></i></div>` : ''}</div></div>` : ''}
    ${job.error ? `<div class="now" style="background:var(--err-soft)"><div><strong>Oups</strong><div class="small">${esc(job.error)}</div></div><span class="spacer"></span><button class="btn small" id="retryAll">Relancer</button></div>` : ''}
    ${job.candidates?.length ? `<div style="margin-top:16px"><div class="small muted" style="margin-bottom:6px">${picked.size ? `${picked.size} moments retenus sur ${job.candidates.length} images clés` : `${job.candidates.length} images clés détectées`}</div>
      <div class="filmstrip">${job.candidates.map((c) => `<img loading="lazy" src="/api/jobs/${job.id}/candidate/${c.id}" class="${!picked.size || picked.has(c.id) ? 'picked' : ''}" alt="">`).join('')}</div></div>` : ''}
    <details style="margin-top:6px"><summary class="small muted" style="cursor:pointer">Journal détaillé</summary>
      <div class="logbox" style="margin-top:8px">${[...job.log].reverse().map((l) => `<div><span class="t">${fmtTime(l.at)}</span>${esc(l.msg)}</div>`).join('') || '<span class="muted small">—</span>'}</div>
    </details>`;
  const retry = $('#retryAll');
  if (retry) retry.onclick = () => api('POST', `/api/jobs/${job.id}/retry`).catch((e) => toast(e.message, 'err'));
}

function drawJobMain(job) {
  const main = $('#jobMain');
  if (['review', 'scheduled'].includes(job.status)) return drawReview(job, main);
  if (['publishing', 'published', 'partial', 'failed'].includes(job.status) && Object.keys(job.publish || {}).length) return drawPublishing(job, main);
  if (job.status === 'failed') { main.innerHTML = `<div class="row"><button class="btn danger" id="del">Supprimer</button></div>`; $('#del').onclick = () => deleteJob(job); return; }
  main.innerHTML = '<p class="muted small" style="text-align:center">Tu peux fermer cette page : le montage continue et la vidéo t\'attendra ici.</p>';
}

function videoBlock(job) {
  const formats = Object.keys(job.renders);
  return `
    <div class="card player">
      ${formats.length > 1 ? `<div class="tabs" id="ftabs" style="margin-bottom:10px">${formats.map((f, i) => `<button data-f="${f}" class="${i ? '' : 'on'}">${job.renders[f].label}</button>`).join('')}</div>` : ''}
      <video id="vid" src="${job.renders[formats[0]].url}" poster="${job.renders[formats[0]].thumb}" controls playsinline preload="metadata"></video>
      <div class="row" style="margin-top:10px">
        <span class="small muted">${job.renders[formats[0]].duration.toFixed(0)} s · ${job.plan?.music ? esc(job.plan.music.title) : 'sans musique'}</span>
        <span class="spacer"></span>
        <a class="btn small" id="dl" href="/api/jobs/${job.id}/download/${formats[0]}">Télécharger</a>
      </div>
    </div>`;
}

function bindVideoTabs(job) {
  $$('#ftabs button').forEach((b) => { b.onclick = () => {
    $$('#ftabs button').forEach((x) => x.classList.toggle('on', x === b));
    const r = job.renders[b.dataset.f];
    Object.assign($('#vid'), { src: r.url, poster: r.thumb });
    $('#dl').href = `/api/jobs/${job.id}/download/${b.dataset.f}`;
  }; });
}

function composeLength(post) {
  const tags = post.hashtags.map((t) => `#${t}`).join(' ');
  return [post.caption.trim(), tags].filter(Boolean).join('\n\n').length;
}

function drawReview(job, main) {
  const nets = state.meta.networks;
  const conns = state.connections.networks;
  const moods = state.meta.moods;
  main.innerHTML = `
    <div class="review">
      ${videoBlock(job)}
      <div class="stack">
        <div class="card">
          <div class="row between"><h2 style="margin:0">Ta vidéo est prête</h2><span class="badge">${job.plan?.source === 'ia' ? 'Préparée par l\'IA' : 'Préparée automatiquement'}</span></div>
          <p class="muted small" style="margin-top:6px">Regarde-la, ajuste les textes si besoin, puis valide. Rien n'est publié sans ton accord.</p>
          <div class="row">
            <button class="btn soft small" id="otherMusic">Autre musique</button>
            <select id="moodSel" style="width:auto">${Object.entries(moods).map(([k, v]) => `<option value="${k}" ${job.plan?.mood === k ? 'selected' : ''}>Ambiance : ${v}</option>`).join('')}</select>
          </div>
        </div>
        <details class="card" id="editBox">
          <summary style="cursor:pointer;font-weight:600">Modifier le montage (textes incrustés, images, ordre)</summary>
          <div class="stack" style="margin-top:14px">
            <div class="grid two">
              <div class="field"><label>Accroche (début)</label><input type="text" id="hook" value="${esc(job.plan.hook)}"></div>
              <div class="field"><label>Message de fin</label><input type="text" id="cta" value="${esc(job.plan.cta)}"></div>
            </div>
            <label>Images et sous-titres</label>
            <div class="slides-edit" id="slidesEdit"></div>
            <div class="row"><select id="addCand" style="flex:1"><option value="">+ Ajouter une autre image…</option>${(job.candidates || []).filter((c) => !job.plan.slides.some((s) => s.candidateId === c.id)).map((c) => `<option value="${c.id}">${c.kind === 'photo' ? 'Photo' : `Image vidéo à ${c.time}s`} (${c.id})</option>`).join('')}</select></div>
            <button class="btn primary" id="applyEdits">Appliquer et remonter la vidéo</button>
          </div>
        </details>
        ${Object.entries(job.posts).map(([n, p]) => `
          <div class="netcard ${p.enabled ? '' : 'off'}" data-net="${n}">
            <header>
              <span class="netlogo n-${n}">${NET_LETTER[n]}</span>
              <div style="flex:1"><strong>${nets[n].label}</strong><div class="small ${conns[n].ready ? 'muted' : ''}" style="${conns[n].ready ? '' : 'color:var(--warn)'}">${conns[n].ready ? esc(conns[n].mode === 'uploadpost' ? 'via Upload-Post' : conns[n].account?.name || 'Connecté') : 'Compte non connecté'}</div></div>
              <label class="toggle"><input type="checkbox" class="en" ${p.enabled ? 'checked' : ''}><span></span></label>
            </header>
            ${n === 'youtube' ? `<div class="field"><label>Titre</label><input type="text" class="ttl" maxlength="100" value="${esc(p.title || job.title || '')}"></div>` : ''}
            <textarea class="cap" rows="4">${esc(p.caption)}</textarea>
            <div class="tags">${p.hashtags.map((t, i) => `<span class="tag">#${esc(t)}<button data-i="${i}" aria-label="Retirer">✕</button></span>`).join('')}<input class="tag-input" placeholder="+ hashtag"></div>
            <div class="counter"></div>
          </div>`).join('')}
        <div class="actions-bar">
          ${job.status === 'scheduled'
            ? `<div class="row"><div style="flex:1"><strong>Programmé</strong><div class="small muted">${fmtDate(job.scheduledAt)}</div></div><button class="btn" id="unsched">Annuler</button><button class="btn primary" id="approve">Publier maintenant</button></div>`
            : `<div class="row">
                <button class="btn primary big" id="approve" style="flex:2">Valider et publier</button>
                <button class="btn" id="schedBtn" style="flex:1">Programmer</button>
              </div>
              <div class="row hidden" id="schedRow" style="margin-top:10px"><input type="datetime-local" id="schedAt" style="flex:1"><button class="btn" id="schedGo">Confirmer</button></div>`}
        </div>
        <div class="row"><span class="spacer"></span><button class="btn ghost small danger" id="del">Supprimer cette vidéo</button></div>
      </div>
    </div>`;
  bindVideoTabs(job);

  // Éditeur du montage.
  let slides = job.plan.slides.map((s) => ({ ...s }));
  const drawSlides = () => {
    $('#slidesEdit').innerHTML = slides.map((s, i) => `
      <div class="slide-row">
        <img src="/api/jobs/${job.id}/candidate/${s.candidateId}" alt="">
        <input type="text" data-i="${i}" value="${esc(s.caption)}" placeholder="${i === 0 ? '(l\'accroche s\'affiche ici)' : 'Sous-titre (facultatif)'}">
        <div class="mini">
          <button class="btn small" data-up="${i}" ${i ? '' : 'disabled'} aria-label="Monter">↑</button>
          <button class="btn small" data-rm="${i}" aria-label="Retirer">✕</button>
        </div>
      </div>`).join('');
    $$('#slidesEdit input').forEach((inp) => { inp.oninput = () => { slides[inp.dataset.i].caption = inp.value; }; });
    $$('#slidesEdit [data-up]').forEach((b) => { b.onclick = () => { const i = +b.dataset.up; [slides[i - 1], slides[i]] = [slides[i], slides[i - 1]]; drawSlides(); }; });
    $$('#slidesEdit [data-rm]').forEach((b) => { b.onclick = () => { if (slides.length > 1) { slides.splice(+b.dataset.rm, 1); drawSlides(); } }; });
  };
  drawSlides();
  $('#addCand').onchange = (e) => { if (e.target.value) { slides.push({ candidateId: e.target.value, caption: '' }); e.target.selectedOptions[0].remove(); e.target.value = ''; drawSlides(); } };
  $('#applyEdits').onclick = () => rerender(job, { edits: { hook: $('#hook').value, cta: $('#cta').value, slides } });
  $('#otherMusic').onclick = () => rerender(job, { mode: 'music' });
  $('#moodSel').onchange = (e) => rerender(job, { edits: { mood: e.target.value } });

  // Textes par réseau (enregistrement automatique).
  const save = debounce((n, patch) => api('PATCH', `/api/jobs/${job.id}/posts`, { posts: { [n]: patch } }).catch((e) => toast(e.message, 'err')), 600);
  $$('.netcard').forEach((card) => {
    const n = card.dataset.net;
    const post = job.posts[n];
    const counter = $('.counter', card);
    const updateCounter = () => {
      const len = composeLength(post);
      counter.textContent = `${len} / ${nets[n].maxCaption} caractères · ${post.hashtags.length} hashtag(s)`;
      counter.classList.toggle('over', len > nets[n].maxCaption);
    };
    const drawTags = () => {
      $$('.tag', card).forEach((t) => t.remove());
      $('.tag-input', card).insertAdjacentHTML('beforebegin', post.hashtags.map((t, i) => `<span class="tag">#${esc(t)}<button data-i="${i}" aria-label="Retirer">✕</button></span>`).join(''));
      $$('.tag button', card).forEach((b) => { b.onclick = () => { post.hashtags.splice(+b.dataset.i, 1); drawTags(); save(n, { hashtags: post.hashtags }); }; });
      updateCounter();
    };
    drawTags();
    $('.cap', card).oninput = (e) => { post.caption = e.target.value; updateCounter(); save(n, { caption: post.caption }); };
    const ttl = $('.ttl', card);
    if (ttl) ttl.oninput = () => { post.title = ttl.value; save(n, { title: ttl.value }); };
    const tagInput = $('.tag-input', card);
    tagInput.onkeydown = (e) => {
      if (!['Enter', ' ', ','].includes(e.key)) return;
      e.preventDefault();
      const tags = tagInput.value.split(/[\s,#]+/).filter(Boolean);
      if (!tags.length) return;
      post.hashtags.push(...tags);
      tagInput.value = '';
      drawTags();
      save(n, { hashtags: post.hashtags });
    };
    $('.en', card).onchange = (e) => { post.enabled = e.target.checked; card.classList.toggle('off', !post.enabled); save(n, { enabled: post.enabled }); };
  });

  const approve = async (scheduledAt) => {
    const enabled = Object.entries(job.posts).filter(([, p]) => p.enabled).map(([n]) => n);
    const missing = enabled.filter((n) => !conns[n].ready);
    if (missing.length && !confirm(`Pas encore connecté : ${missing.map((n) => nets[n].label).join(', ')}.\nLa publication échouera sur ce(s) réseau(x). Continuer quand même ?`)) return;
    try {
      await api('PATCH', `/api/jobs/${job.id}/posts`, { posts: job.posts });
      await api('POST', `/api/jobs/${job.id}/approve`, { scheduledAt, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      toast(scheduledAt ? 'Publication programmée' : 'C\'est parti !', 'ok');
    } catch (e) { toast(e.message, 'err'); }
  };
  $('#approve').onclick = () => approve(null);
  if ($('#schedBtn')) {
    $('#schedBtn').onclick = () => {
      $('#schedRow').classList.toggle('hidden');
      const d = new Date(Date.now() + 3600_000);
      d.setMinutes(0, 0, 0);
      $('#schedAt').value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };
    $('#schedGo').onclick = () => { const v = $('#schedAt').value; if (v) approve(new Date(v).toISOString()); };
  }
  if ($('#unsched')) $('#unsched').onclick = () => api('POST', `/api/jobs/${job.id}/unschedule`).catch((e) => toast(e.message, 'err'));
  $('#del').onclick = () => deleteJob(job);
}

async function rerender(job, body) {
  try {
    await api('POST', `/api/jobs/${job.id}/rerender`, body);
    toast('Nouveau montage en cours…');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) { toast(e.message, 'err'); }
}

async function deleteJob(job) {
  if (!confirm('Supprimer cette publication et ses fichiers ? (Ce qui est déjà en ligne sur les réseaux n\'est pas supprimé.)')) return;
  try { await api('DELETE', `/api/jobs/${job.id}`); state.jobs.delete(job.id); location.hash = '#/publications'; } catch (e) { toast(e.message, 'err'); }
}

function drawPublishing(job, main) {
  const nets = state.meta.networks;
  const entries = Object.entries(job.posts).filter(([, p]) => p.enabled);
  const failed = entries.filter(([n]) => job.publish[n]?.status === 'error');
  main.innerHTML = `
    <div class="review">
      ${Object.keys(job.renders || {}).length ? videoBlock(job) : '<div></div>'}
      <div class="stack">
        <div class="card">
          <h2>${job.status === 'published' ? 'C\'est en ligne' : job.status === 'publishing' ? 'Publication en cours' : 'Résultat de la publication'}</h2>
          <div class="pubgrid" style="margin-top:12px">
            ${entries.map(([n]) => {
              const p = job.publish[n] || { status: 'waiting', detail: 'En attente' };
              const icon = p.status === 'done' ? `<span class="badge ok">${ICONS.check.replace('<svg', '<svg width="14" height="14" style="stroke:currentColor;fill:none;stroke-width:2"')}</span>` : p.status === 'error' ? '<span class="badge err">!</span>' : '<div class="spinner"></div>';
              return `<div class="pubcard"><span class="netlogo n-${n}">${NET_LETTER[n]}</span><div style="flex:1;min-width:0"><strong>${nets[n].label}</strong>
                <div class="small ${p.status === 'error' ? '' : 'muted'}" style="${p.status === 'error' ? 'color:var(--err)' : ''};overflow-wrap:anywhere">${esc(p.status === 'error' ? p.error : p.detail || '')}</div>
                ${p.nextRetryAt ? `<div class="small muted">Nouvel essai auto à ${fmtTime(p.nextRetryAt)}</div>` : ''}
                ${p.url ? `<a class="small" href="${esc(p.url)}" target="_blank" rel="noopener">Voir la publication →</a>` : ''}</div>${icon}</div>`;
            }).join('')}
          </div>
          <div class="row" style="margin-top:14px">
            ${failed.length ? '<button class="btn primary" id="retryPub">Réessayer les échecs</button>' : ''}
            ${failed.some(([n]) => !state.connections.networks[n].ready) ? '<a class="btn" href="#/comptes">Vérifier mes comptes</a>' : ''}
            <span class="spacer"></span>
            ${job.status !== 'publishing' ? '<button class="btn ghost small danger" id="del">Supprimer</button>' : ''}
          </div>
        </div>
        ${job.status === 'published' ? '<a class="btn primary big" href="#/">Créer une nouvelle vidéo</a>' : ''}
      </div>
    </div>`;
  if (Object.keys(job.renders || {}).length) bindVideoTabs(job);
  if ($('#retryPub')) $('#retryPub').onclick = () => api('POST', `/api/jobs/${job.id}/retry`).catch((e) => toast(e.message, 'err'));
  if ($('#del')) $('#del').onclick = () => deleteJob(job);
}

// ---------- Liste des publications ----------
function renderPublications() {
  const jobs = [...state.jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  view.innerHTML = `
    <div class="row between" style="margin-bottom:16px"><h1 style="margin:0">Publications</h1><a class="btn primary" href="#/">Nouvelle vidéo</a></div>
    ${jobs.length ? `<div class="jobs">${jobs.map((j) => {
      const r = j.renders?.vertical || Object.values(j.renders || {})[0];
      return `<a class="jobcard" href="#/job/${j.id}">
        <div class="cover" style="${r ? `background-image:url('${r.thumb}')` : ''}">${r ? '' : ICONS.film}${badge(j.status)}</div>
        <div class="body"><div class="desc">${esc(j.description)}</div><div class="small muted" style="margin-top:4px">${fmtDate(j.createdAt)} · ${j.networks.length} réseau(x)</div></div>
      </a>`;
    }).join('')}</div>`
      : `<div class="empty card"><div class="big-ico">Aucune vidéo pour l'instant</div><p>Crée ta première publication en quelques secondes.</p><a class="btn primary" href="#/">Commencer</a></div>`}`;
}

// ---------- Comptes ----------
async function renderAccounts(query) {
  if (query?.get('connected')) toast('Compte connecté', 'ok');
  if (query?.get('error')) toast(query.get('error'), 'err');
  if (query?.toString()) history.replaceState(null, '', '#/comptes');
  state.connections = await api('GET', '/api/connections');
  const c = state.connections;
  const s = state.settings;
  const mode = s.publishMode;
  const provider = (key, title, nets, fields, extra = '') => {
    const st = c.networks[nets[0]];
    return `
      <div class="card provider">
        <div class="row">
          ${nets.map((n) => `<span class="netlogo n-${n}">${NET_LETTER[n]}</span>`).join('')}
          <div style="flex:1"><h3 style="margin:0">${title}</h3>
            <div class="small muted">${st.connected ? nets.map((n) => `${state.meta.networks[n].label} : ${esc(c.networks[n].account?.name || '—')}`).join(' · ') : st.keysConfigured ? 'Prêt à connecter' : 'Identifiants développeur à renseigner'}</div></div>
          ${st.connected ? '<span class="badge ok"><span class="dot"></span>Connecté</span>' : ''}
        </div>
        ${nets.map((n) => c.networks[n].warning ? `<div class="badge warn">${esc(c.networks[n].warning)}</div>` : '').join('')}
        ${extra}
        <div class="row">
          ${st.connected
            ? `<a class="btn small" href="/api/connect/${key}">Reconnecter</a><button class="btn small danger" data-disconnect="${key}">Déconnecter</button>`
            : `<a class="btn primary ${st.keysConfigured ? '' : 'disabled'}" href="/api/connect/${key}" ${st.keysConfigured ? '' : 'aria-disabled="true" onclick="return false" style="opacity:.5"'}>Connecter ${title}</a>`}
        </div>
        <details ${st.keysConfigured ? '' : 'open'}>
          <summary class="small muted" style="cursor:pointer">Identifiants de l'application développeur</summary>
          <form class="stack keys" data-key="${key}" style="margin-top:12px">
            ${fields.map(([name, label, value]) => `<div class="field"><label>${label}</label><input type="${/secret/i.test(name) ? 'password' : 'text'}" name="${name}" value="${esc(value)}" autocomplete="off"></div>`).join('')}
            <div class="field"><label>Adresse de redirection à déclarer</label><div class="copy"><input type="text" readonly value="${esc(st.redirectUri)}"><button type="button" class="btn small" data-copy="${esc(st.redirectUri)}">Copier</button></div></div>
            <div class="row"><button class="btn small">Enregistrer</button><a class="small" href="${st.devPortal}" target="_blank" rel="noopener">Ouvrir le portail développeur →</a><a class="small" href="/guide.html#${key}" target="_blank" rel="noopener">Guide pas à pas</a></div>
          </form>
        </details>
      </div>`;
  };

  view.innerHTML = `
    <h1>Comptes</h1>
    <p class="muted">Choisis comment Publik publie sur tes réseaux.</p>
    <div class="modes" style="margin:16px 0 22px">
      <label class="mode ${mode === 'uploadpost' ? 'on' : ''}"><input type="radio" name="mode" value="uploadpost" ${mode === 'uploadpost' ? 'checked' : ''}>
        <strong>Simple</strong> <span class="badge ok">Recommandé</span>
        <p class="small muted" style="margin:6px 0 0">Un seul compte Upload-Post relie TikTok, Instagram, Facebook, YouTube et X. Une clé à copier, c'est tout.</p></label>
      <label class="mode ${mode === 'direct' ? 'on' : ''}"><input type="radio" name="mode" value="direct" ${mode === 'direct' ? 'checked' : ''}>
        <strong>Direct</strong> <span class="badge">Avancé · gratuit</span>
        <p class="small muted" style="margin:6px 0 0">Connexion aux API officielles de chaque réseau. Nécessite de créer une « app développeur » par réseau.</p></label>
    </div>
    <div id="modeBody" class="stack">
      ${mode === 'uploadpost' ? `
        <div class="card stack">
          <h2>Mode simple · Upload-Post</h2>
          <ol class="steps-list">
            <li>Crée un compte gratuit sur <a href="https://www.upload-post.com" target="_blank" rel="noopener">upload-post.com</a>.</li>
            <li>Dans « Manage Users », crée un profil (ex. <em>moi</em>) et connecte-y tes réseaux.</li>
            <li>Dans « API Keys », copie ta clé, puis colle-la ci-dessous avec le nom du profil.</li>
          </ol>
          <form id="upForm" class="stack">
            <div class="grid two">
              <div class="field"><label>Clé API</label><input type="password" name="apiKey" value="${esc(s.uploadPost.apiKey)}" autocomplete="off"></div>
              <div class="field"><label>Nom du profil</label><input type="text" name="user" value="${esc(s.uploadPost.user)}" placeholder="moi"></div>
            </div>
            <div class="field"><label>Identifiant de Page Facebook (facultatif)</label><input type="text" name="facebookPageId" value="${esc(s.uploadPost.facebookPageId || '')}"><div class="hint">Seulement si plusieurs Pages sont reliées à ton profil.</div></div>
            <div class="row"><button class="btn primary">Enregistrer</button><button type="button" class="btn" id="upTest">Tester la connexion</button></div>
          </form>
        </div>
        <div class="card"><div class="chips">${Object.entries(c.networks).map(([n, v]) => `<span class="chip ${v.ready ? 'on' : ''}"><span class="state ${v.ready ? 'ok' : ''}"></span>${v.label}</span>`).join('')}</div></div>`
      : `
        ${provider('youtube', 'YouTube', ['youtube'], [['clientId', 'Client ID', s.youtube.clientId], ['clientSecret', 'Client secret', s.youtube.clientSecret]])}
        ${provider('meta', 'Facebook & Instagram', ['facebook', 'instagram'], [['appId', 'App ID', s.meta.appId], ['appSecret', 'App secret', s.meta.appSecret]],
          c.metaPages.length > 1 ? `<div class="field"><label>Page utilisée</label><select id="metaPage">${c.metaPages.map((p) => `<option value="${p.id}" ${p.id === c.metaSelected ? 'selected' : ''}>${esc(p.name)}${p.instagram ? ` (Instagram @${esc(p.instagram)})` : ''}</option>`).join('')}</select></div>` : '')}
        ${provider('tiktok', 'TikTok', ['tiktok'], [['clientKey', 'Client key', s.tiktok.clientKey], ['clientSecret', 'Client secret', s.tiktok.clientSecret]],
          '<p class="hint" style="margin:0">Tant que ton app TikTok n\'est pas validée par TikTok, les vidéos sont publiées en privé (visibles par toi seul).</p>')}
        ${provider('x', 'X (Twitter)', ['x'], [['clientId', 'Client ID (OAuth 2.0)', s.x.clientId], ['clientSecret', 'Client secret', s.x.clientSecret]])}`}
    </div>`;

  $$('input[name=mode]').forEach((r) => { r.onchange = async () => { state.settings = await api('PUT', '/api/settings', { publishMode: r.value }); renderAccounts(); }; });
  $$('[data-copy]').forEach((b) => { b.onclick = () => { navigator.clipboard?.writeText(b.dataset.copy); toast('Copié'); }; });
  $$('[data-disconnect]').forEach((b) => { b.onclick = async () => { if (confirm('Déconnecter ce compte ?')) { await api('DELETE', `/api/connections/${b.dataset.disconnect}`); renderAccounts(); } }; });
  $$('form.keys').forEach((f) => { f.onsubmit = async (e) => {
    e.preventDefault();
    state.settings = await api('PUT', '/api/settings', { [f.dataset.key]: Object.fromEntries(new FormData(f)) });
    toast('Enregistré', 'ok');
    renderAccounts();
  }; });
  if ($('#metaPage')) $('#metaPage').onchange = async (e) => { await api('POST', '/api/connections/meta/page', { pageId: e.target.value }); toast('Page mise à jour', 'ok'); };
  if ($('#upForm')) {
    $('#upForm').onsubmit = async (e) => {
      e.preventDefault();
      state.settings = await api('PUT', '/api/settings', { uploadPost: Object.fromEntries(new FormData(e.target)) });
      toast('Enregistré', 'ok');
      renderAccounts();
    };
    $('#upTest').onclick = async () => {
      try { await api('POST', '/api/connections/uploadpost/test'); toast('Connexion Upload-Post réussie', 'ok'); } catch (err) { toast(err.message, 'err'); }
    };
  }
}

// ---------- Réglages ----------
let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });

async function renderSettings() {
  const s = state.settings;
  const tracks = await api('GET', '/api/music');
  const nets = state.meta.networks;
  view.innerHTML = `
    <h1>Réglages</h1>
    <div class="grid two" style="margin-top:16px">
      <form class="card stack" id="fAi">
        <h2>Intelligence artificielle</h2>
        <p class="small muted">Avec une clé Claude (Anthropic), l'IA regarde tes images pour choisir les plus belles et écrit des textes sur mesure. Sans clé, Publik fonctionne en mode automatique.</p>
        <div class="field"><label>Clé API Anthropic</label><input type="password" name="anthropicApiKey" value="${esc(s.anthropicApiKey)}" placeholder="sk-ant-…" autocomplete="off">
          <div class="hint">À créer sur <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a> · quelques centimes par vidéo.</div></div>
        <div class="row"><button class="btn primary">Enregistrer</button><span class="badge ${s.anthropicApiKey ? 'ok' : ''}">${s.anthropicApiKey ? 'Mode IA actif' : 'Mode automatique'}</span></div>
      </form>

      <form class="card stack" id="fVideo">
        <h2>Vidéo</h2>
        <div class="field"><label>Durée maximale par défaut</label><select name="maxDuration">${[15, 20, 30, 45, 60].map((d) => `<option ${s.video.maxDuration === d ? 'selected' : ''} value="${d}">${d} secondes</option>`).join('')}</select></div>
        <div class="field"><label>Réseaux cochés par défaut</label><div class="chips">${Object.entries(nets).map(([k, n]) => `<label class="chip ${s.video.defaultNetworks.includes(k) ? 'on' : ''}"><input type="checkbox" name="net" value="${k}" ${s.video.defaultNetworks.includes(k) ? 'checked' : ''}>${n.label}</label>`).join('')}</div></div>
        <div class="field"><label>Format par réseau</label>
          ${Object.entries(nets).map(([k, n]) => `<div class="row" style="margin-bottom:6px"><span style="flex:1">${n.label}</span><select name="fmt-${k}" style="width:auto">${Object.values(state.meta.formats).map((f) => `<option value="${f.id}" ${s.networkFormats[k] === f.id ? 'selected' : ''}>${f.label}</option>`).join('')}</select></div>`).join('')}
        </div>
        <button class="btn primary">Enregistrer</button>
      </form>

      <form class="card stack" id="fBrand">
        <h2>Ta signature</h2>
        <div class="field"><label>Message de fin dans la vidéo</label><input type="text" name="cta" value="${esc(s.brand.cta)}"></div>
        <div class="field"><label>Signature ajoutée aux légendes</label><input type="text" name="signature" value="${esc(s.brand.signature)}" placeholder="Ex : 📍 Biarritz · lien en bio"></div>
        <div class="field"><label>Visibilité YouTube</label><select name="youtubePrivacy">${[['public', 'Publique'], ['unlisted', 'Non répertoriée'], ['private', 'Privée']].map(([v, l]) => `<option value="${v}" ${s.youtubePrivacy === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label>Visibilité TikTok (mode direct)</label><select name="tiktokPrivacy">${[['PUBLIC_TO_EVERYONE', 'Publique'], ['MUTUAL_FOLLOW_FRIENDS', 'Amis'], ['SELF_ONLY', 'Privée']].map(([v, l]) => `<option value="${v}" ${s.tiktok.privacy === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <button class="btn primary">Enregistrer</button>
      </form>

      <div class="card stack">
        <h2>Musique</h2>
        <p class="small muted">Publik compose ses propres musiques (100 % libres de droits). Tu peux ajouter tes morceaux libres de droits (ex. YouTube Audio Library, Pixabay Music) : ils seront utilisés en priorité.</p>
        <details><summary class="small" style="cursor:pointer;font-weight:600">Écouter la bibliothèque (${tracks.length} morceaux)</summary>
        <div class="tracks" style="margin-top:10px">${tracks.map((t) => `<div class="track"><div><strong class="small">${esc(t.title)}</strong> <span class="badge">${esc(state.meta.moods[t.mood] || t.mood)}${t.bpm ? ` · ${t.bpm} BPM` : ''}</span><audio controls preload="none" src="/api/music/play/${encodeURIComponent(t.id)}"></audio></div>${t.id.startsWith('user:') ? `<button class="btn small danger" data-rmtrack="${esc(t.id)}">✕</button>` : ''}</div>`).join('') || '<p class="small muted">Composition des musiques en cours… (premier démarrage)</p>'}</div></details>
        <form id="fMusic" class="row"><input type="file" name="file" accept="audio/*" required style="flex:1;min-width:0"><select name="mood" style="width:auto">${Object.entries(state.meta.moods).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><button class="btn small">Ajouter</button></form>
      </div>

      <form class="card stack" id="fAdvanced">
        <h2>Application</h2>
        <div class="field"><label>Adresse publique de l'app</label><input type="url" name="publicUrl" value="${esc(s.publicUrl)}" placeholder="https://publik.mondomaine.fr">
          <div class="hint">Nécessaire pour connecter les réseaux en mode direct. Actuellement : ${esc(state.meta.baseUrl)}</div></div>
        <div class="field"><label>Supprimer les fichiers après</label><select name="cleanupDays">${[3, 7, 14, 30, 90].map((d) => `<option value="${d}" ${s.automations.cleanupDays === d ? 'selected' : ''}>${d} jours</option>`).join('')}</select></div>
        <div class="row"><label class="toggle"><input type="checkbox" name="retryPublish" ${s.automations.retryPublish ? 'checked' : ''}><span></span></label><span>Réessayer automatiquement une publication échouée</span></div>
        <div class="field"><label>Nouveau mot de passe</label><input type="password" name="newPassword" autocomplete="new-password" placeholder="Laisser vide pour ne pas changer"></div>
        <button class="btn primary">Enregistrer</button>
      </form>

      <div class="card stack">
        <h2>Partager & installer</h2>
        <p class="small muted">Ouvre Publik sur ton téléphone ou ta tablette avec ce lien, puis « Ajouter à l'écran d'accueil » pour l'utiliser comme une app.</p>
        <div class="copy"><input type="text" readonly value="${esc(state.meta.baseUrl)}"><button class="btn small" id="share">Partager</button></div>
        <div class="row">${installPrompt ? '<button class="btn soft" id="install">Installer l\'app</button>' : ''}<button class="btn ghost danger" id="logout">Se déconnecter</button></div>
      </div>
    </div>`;

  const saveForm = (id, build) => { $(id).onsubmit = async (e) => {
    e.preventDefault();
    try { state.settings = await api('PUT', '/api/settings', build(new FormData(e.target), e.target)); toast('Enregistré', 'ok'); renderSettings(); } catch (err) { toast(err.message, 'err'); }
  }; };
  saveForm('#fAi', (fd) => ({ anthropicApiKey: fd.get('anthropicApiKey') }));
  saveForm('#fVideo', (fd) => ({
    video: { maxDuration: Number(fd.get('maxDuration')), defaultNetworks: fd.getAll('net') },
    networkFormats: Object.fromEntries(Object.keys(nets).map((k) => [k, fd.get(`fmt-${k}`)])),
  }));
  saveForm('#fBrand', (fd) => ({ brand: { cta: fd.get('cta'), signature: fd.get('signature') }, youtubePrivacy: fd.get('youtubePrivacy'), tiktok: { privacy: fd.get('tiktokPrivacy') } }));
  saveForm('#fAdvanced', (fd) => ({ publicUrl: fd.get('publicUrl'), automations: { cleanupDays: Number(fd.get('cleanupDays')), retryPublish: fd.get('retryPublish') === 'on' }, ...(fd.get('newPassword') ? { newPassword: fd.get('newPassword') } : {}) }));
  $$('#fVideo .chip input').forEach((cb) => { cb.onchange = () => cb.parentElement.classList.toggle('on', cb.checked); });
  $('#fMusic').onsubmit = async (e) => {
    e.preventDefault();
    try { await api('POST', '/api/music', new FormData(e.target)); toast('Morceau ajouté', 'ok'); renderSettings(); } catch (err) { toast(err.message, 'err'); }
  };
  $$('[data-rmtrack]').forEach((b) => { b.onclick = async () => { await api('DELETE', `/api/music/${encodeURIComponent(b.dataset.rmtrack)}`); renderSettings(); }; });
  $('#share').onclick = async () => {
    const url = state.meta.baseUrl;
    if (navigator.share) { try { await navigator.share({ title: 'Publik', text: 'Mon studio de publication', url }); } catch { /* annulé */ } } else { navigator.clipboard?.writeText(url); toast('Lien copié'); }
  };
  if ($('#install')) $('#install').onclick = async () => { installPrompt.prompt(); installPrompt = null; };
  $('#logout').onclick = async () => { await api('POST', '/api/logout'); events?.close(); state.status.loggedIn = false; render(); };
}

// ---------- PWA ----------
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

boot().catch((err) => { view.innerHTML = `<div class="empty"><p>Impossible de joindre le serveur.</p><p class="small muted">${esc(err.message)}</p></div>`; });
