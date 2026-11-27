#!/usr/bin/env node
// Les fonds des publications des Minis Monstres sur les réseaux (Instagram, Facebook, TikTok).
// Un fond par monstre, 1080 × 1350 (le format portrait d'Instagram), aux couleurs du site : le haut est laissé libre,
// le site y écrit le titre du jour (includes/reseaux-lmm.php, avec la police Nunito du site).
// Usage : node scripts/reseaux-fonds.js   →   src/wordpress/aled08-espace/reseaux/fonds/<monstre>.png
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { petit, eclat, COULEURS } = require('../src/lib/bestiaire');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src/wordpress/aled08-espace/reseaux/fonds');
const LOGO = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'src/assets/img/logo-512.png')).toString('base64');
const POLICE = 'data:font/woff2;base64,' + fs.readFileSync(path.join(ROOT, 'src/assets/fonts/nunito-var.woff2')).toString('base64');
const INK = '#2E2A47';
// Le monstre du fond et son voisin, qui passe une tête
const MONSTRES = ['mochi', 'fantome', 'nuage', 'chaton', 'gelee', 'champi', 'dino', 'etoile'];
const VOISIN = { mochi: 'gelee', fantome: 'chaton', nuage: 'champi', chaton: 'nuage', gelee: 'mochi', champi: 'dino', dino: 'etoile', etoile: 'fantome' };

function page(nom) {
  const c = COULEURS[nom];
  const v = COULEURS[VOISIN[nom]];
  const etoiles = [[150, 1010, 16], [940, 640, 22], [560, 1080, 12], [1010, 160, 14], [70, 760, 10]]
    .map(([x, y, r]) => `<svg class="ec" style="left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px" viewBox="${x - r} ${y - r} ${2 * r} ${2 * r}">${eclat(x, y, r, c.trait + '55')}</svg>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:N;src:url(${POLICE}) format('woff2');font-weight:200 1000}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{position:relative;font-family:N,sans-serif;color:${INK};background:linear-gradient(160deg,#FFFDF8 0%,${c.ventre} 55%,${c.corps}66 100%)}
.bulle{position:absolute;border-radius:50%}
.b1{width:760px;height:760px;right:-260px;bottom:-200px;background:${c.corps};opacity:.45}
.b2{width:340px;height:340px;left:-120px;bottom:120px;background:${v.corps};opacity:.30}
.b3{width:200px;height:200px;right:120px;top:-70px;background:${c.corps};opacity:.25}
.carte{position:absolute;left:64px;top:64px;width:952px;height:690px;border-radius:48px;background:rgba(255,255,255,.78);box-shadow:0 18px 50px ${c.trait}22;border:3px solid #ffffffcc}
.grand{position:absolute;right:18px;bottom:96px;width:600px;height:600px}
.voisin{position:absolute;left:300px;bottom:118px;width:250px;height:250px;transform:rotate(-6deg)}
.ec{position:absolute}
.pied{position:absolute;left:64px;bottom:44px;display:flex;align-items:center;gap:18px}
.pied img{width:78px;height:78px;border-radius:22px;box-shadow:0 6px 16px ${INK}22}
.pied b{display:block;font-size:34px;font-weight:900;letter-spacing:-.3px}
.pied span{display:block;font-size:25px;font-weight:700;opacity:.72}
svg.petit{overflow:visible}
</style></head><body>
<div class="bulle b1"></div><div class="bulle b2"></div><div class="bulle b3"></div>
${etoiles}
<div class="carte"></div>
<div class="voisin">${petit(VOISIN[nom], { humeur: 'ravi' })}</div>
<div class="grand">${petit(nom)}</div>
<div class="pied"><img src="${LOGO}" alt=""><div><b>Les Minis Monstres</b><span>les-minis-monstres.fr</span></div></div>
</body></html>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (const nom of MONSTRES) {
    await p.setContent(page(nom), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(OUT, nom + '.png') });
    console.log('fond', nom);
  }
  await nav.close();
})();
