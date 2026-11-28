#!/usr/bin/env node
// La « vidéo » de chaque maquette de nouvelle génération, pour les mails de prospection (Alex, 28 novembre 2026 :
// « j'aime bien la vidéo, insère ça aux futurs mails »). Un mail ne lit pas de vidéo : on fabrique une image animée (GIF)
// qui fait défiler la page de haut en bas, comme la vidéo. Elle est générique (« Votre entreprise ») : le clic ouvre la
// maquette au nom de l'entreprise.
// Usage : node scripts/maquettes-video.js [groupe…]   →   maquettes/video/<groupe>.gif (et .mp4 pour la présentation)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const MET = path.join(ROOT, 'maquettes/metiers');
const IMG = path.join(ROOT, 'maquettes/img');
const OUT = path.join(ROOT, 'maquettes/video');
fs.mkdirSync(OUT, { recursive: true });

const voulus = process.argv.slice(2);
const groupes = fs.readdirSync(MET).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(MET, f), 'utf8')))
  .filter(j => (j.generation || 1) >= 2 && (!voulus.length || voulus.includes(j.groupe)));

(async () => {
  const nav = await chromium.launch();
  for (const j of groupes) {
    let h = fs.readFileSync(path.join(MET, j.groupe + '.html'), 'utf8')
      .replace(/\{\{ENTREPRISE\}\}/g, 'Votre entreprise').replace(/\{\{VILLE\}\}/g, 'votre ville').replace(/\{\{INITIALE\}\}/g, 'V');
    h = h.replace(/\{\{PHOTO:([a-z0-9_-]+)\}\}/g, (m, r) => 'file://' + path.join(IMG, j.groupe + '-' + r + '.jpg'));
    const tmp = path.join(OUT, '.' + j.groupe + '.html');
    fs.writeFileSync(tmp, h);
    const dir = fs.mkdtempSync(path.join(OUT, '.images-'));
    const p = await nav.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    await p.goto('file://' + tmp, { waitUntil: 'networkidle' });
    await p.waitForTimeout(2200);
    const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    let n = 0;
    const photo = async () => { await p.screenshot({ path: path.join(dir, String(n++).padStart(4, '0') + '.png') }); };
    for (let i = 0; i < 6; i++) { await photo(); await p.waitForTimeout(120); } // l'accueil, un instant
    const pas = 38, jusqua = 0.8; // les quatre cinquièmes de la page : le plus parlant, sans alourdir l'image
    for (let i = 1; i <= pas; i++) { await p.evaluate(y => scrollTo(0, y), Math.round(H * jusqua * i / pas)); await p.waitForTimeout(60); await photo(); }
    for (let i = 0; i < 5; i++) { await photo(); await p.waitForTimeout(120); }
    await p.close();
    const gif = path.join(OUT, j.groupe + '.gif');
    // 460 px de large, 8 images par seconde, une palette par fichier : moins de 1 Mo, léger pour un mail
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '8', '-i', path.join(dir, '%04d.png'), '-vf',
      'scale=460:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle', '-loop', '0', gif]);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '10', '-i', path.join(dir, '%04d.png'), '-vf', 'scale=800:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, j.groupe + '.mp4')]);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(tmp, { force: true });
    console.log(j.groupe, Math.round(fs.statSync(gif).size / 1024) + ' Ko');
  }
  await nav.close();
})();
