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
    h = h.replace(/<p class="bandeau">[\s\S]*?<\/p>/, ''); // dans la vidéo, pas de bandeau « maquette »
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
    // la vraie vidéo (MP4) : un défilement doux et lent, environ 10 secondes (Alex, 28 novembre 2026 : « un peu plus lent, 10 secondes »)
    const vdir = fs.mkdtempSync(path.join(OUT, '.film-'));
    const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: vdir, size: { width: 1280, height: 800 } } });
    const v = await ctx.newPage();
    await v.goto('file://' + tmp, { waitUntil: 'networkidle' });
    await v.waitForTimeout(2100); // 1,2 s coupées au montage, puis l'accueil reste visible un instant
    // le défilement, pas à pas depuis ici (l'animation de la page n'est pas filmée de façon fiable) : 8 s, départ et arrivée en douceur
    const Hv = await v.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const doux = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const etapes = 200, t0 = Date.now(), duree = 8000;
    for (let i = 1; i <= etapes; i++) {
      await v.evaluate(y => window.scrollTo(0, y), Math.round(Hv * doux(i / etapes)));
      const reste = t0 + duree * i / etapes - Date.now();
      if (reste > 0) await v.waitForTimeout(reste);
    }
    await v.waitForTimeout(700);
    const brut = await v.video().path();
    await ctx.close();
    // l'enregistrement dure plus que prévu (chaque pas prend du temps) : on le ramène à environ 10 secondes au montage
    const duree0 = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', brut]).toString()) - 1.2;
    const vitesse = Math.max(0.2, Math.min(1, 10.5 / duree0));
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '1.2', '-i', brut, '-vf', 'setpts=' + vitesse.toFixed(4) + '*PTS,fps=30,scale=960:-2:flags=lanczos', '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path.join(OUT, j.groupe + '.mp4')]);
    fs.rmSync(vdir, { recursive: true, force: true });
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(tmp, { force: true });
    console.log(j.groupe, 'gif ' + Math.round(fs.statSync(gif).size / 1024) + ' Ko', 'mp4 ' + Math.round(fs.statSync(path.join(OUT, j.groupe + '.mp4')).size / 1024) + ' Ko');
  }
  await nav.close();
})();
