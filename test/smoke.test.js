// Test de bout en bout : serveur → envoi d'une vidéo → montage → vidéo prête à valider.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PORT = 3911;
const BASE = `http://127.0.0.1:${PORT}`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'publik-test-'));
let server;
let cookie = '';

const call = async (method, url, body) => {
  const opts = { method, headers: { cookie } };
  if (body instanceof FormData) opts.body = body;
  else if (body) { opts.body = JSON.stringify(body); opts.headers['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + url, opts);
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  return { status: res.status, data: await res.json().catch(() => null) };
};

before(async () => {
  // Réutilise les musiques déjà composées pour accélérer le test.
  const gen = path.resolve('data/music-generated');
  fs.mkdirSync(path.join(tmp, 'data/music-generated'), { recursive: true });
  if (fs.existsSync(gen)) for (const f of fs.readdirSync(gen)) fs.copyFileSync(path.join(gen, f), path.join(tmp, 'data/music-generated', f));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=1280x720:d=8', '-f', 'lavfi', '-i', 'sine=d=8', '-shortest', '-pix_fmt', 'yuv420p', path.join(tmp, 'clip.mp4')]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'mandelbrot=s=900x1200', '-frames:v', '1', path.join(tmp, 'photo.jpg')]);
  server = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, PORT: String(PORT), DATA_DIR: path.join(tmp, 'data'), ANTHROPIC_API_KEY: '' }, stdio: 'inherit' });
  for (let i = 0; i < 50; i++) {
    try { await fetch(`${BASE}/api/status`); return; } catch { await new Promise((r) => setTimeout(r, 200)); }
  }
});

after(() => { server?.kill(); fs.rmSync(tmp, { recursive: true, force: true }); });

test('premier lancement, protection par mot de passe', async () => {
  assert.equal((await call('GET', '/api/status')).data.needsSetup, true);
  assert.equal((await call('GET', '/api/jobs')).status, 401);
  assert.equal((await call('POST', '/api/setup', { password: 'secret123' })).status, 200);
  assert.equal((await call('GET', '/api/jobs')).status, 200);
});

test('réglages : les secrets ne sont jamais renvoyés en clair', async () => {
  await call('PUT', '/api/settings', { uploadPost: { apiKey: 'cle-tres-secrete', user: 'moi' } });
  const { data } = await call('GET', '/api/settings');
  assert.notEqual(data.uploadPost.apiKey, 'cle-tres-secrete');
  assert.equal(data.uploadPost.user, 'moi');
  assert.equal(data.appPasswordHash, undefined);
});

test('photo + vidéo → montage complet prêt à valider', { timeout: 240_000 }, async () => {
  const fd = new FormData();
  fd.append('files', new Blob([fs.readFileSync(path.join(tmp, 'photo.jpg'))], { type: 'image/jpeg' }), 'photo.jpg');
  fd.append('files', new Blob([fs.readFileSync(path.join(tmp, 'clip.mp4'))], { type: 'video/mp4' }), 'clip.mp4');
  fd.append('description', 'Super week-end à la plage avec les amis ! Session surf au lever du soleil. Puis crêpes face à l\'océan. #surf');
  fd.append('networks', JSON.stringify(['tiktok', 'instagram', 'x']));
  fd.append('duration', '15');
  const created = await call('POST', '/api/jobs', fd);
  assert.equal(created.status, 200, JSON.stringify(created.data));

  let job;
  for (let i = 0; i < 220; i++) {
    job = (await call('GET', `/api/jobs/${created.data.id}`)).data;
    if (['review', 'failed'].includes(job.status)) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert.equal(job.status, 'review', job.error || JSON.stringify(job.log));
  assert.ok(job.renders.vertical && job.renders.square, 'formats 9:16 et 1:1 montés');
  assert.ok(job.plan.slides.length >= 3);
  assert.ok(job.posts.tiktok.hashtags.includes('surf'));
  assert.ok(job.renders.vertical.duration <= 15.5);

  const video = await fetch(BASE + job.renders.vertical.url, { headers: { cookie } });
  assert.equal(video.status, 200);
  assert.ok((await video.arrayBuffer()).byteLength > 50_000);

  // Validation sans compte configuré : la publication échoue proprement (pas de plantage).
  await call('PUT', '/api/settings', { uploadPost: { apiKey: '', user: '' } });
  const approved = await call('POST', `/api/jobs/${job.id}/approve`, {});
  assert.equal(approved.status, 200);
  for (let i = 0; i < 30; i++) {
    job = (await call('GET', `/api/jobs/${job.id}`)).data;
    if (['published', 'partial', 'failed'].includes(job.status)) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.equal(job.status, 'failed');
  assert.match(job.publish.tiktok.error, /Upload-Post/);
});
