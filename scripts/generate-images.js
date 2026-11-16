// Génère les images PNG (Open Graph, icônes) à partir de gabarits HTML, via Playwright.
// Usage : node scripts/generate-images.js   (nécessite Playwright + Chromium ; CHROME_PATH=/chemin/chrome pour un navigateur déjà installé)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(ROOT, 'src/assets/fonts', f)).toString('base64');
const { logoMark, monster } = require('../src/lib/monsters');
const { petit } = require('../src/lib/bestiaire');
const { forfaits, types } = require('../src/config');
const logo = logoMark({ id: 'g' }).replace('class="logo"', 'width="100%" height="100%"');
// l'icône de l'onglet (SVG) : le même logo
fs.writeFileSync(path.join(ROOT, 'src/static/favicon.svg'), logoMark().replace('class="logo" ', 'xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true" focusable="false"', '') + '\n');
const { creation, marche } = require('../src/config');
const PILLS = [
  ['Tout', 'compris', '#FFD9E7', '#A3305F'],
  ['Sans', 'devis', '#E8E0FF', '#5B3FC4'],
  ['Sans', 'engagement', '#D5F5E8', '#176A4C'],
];
const base = `<style>@font-face{font-family:Jakarta;src:url(${font('jakarta-var.woff2')});font-weight:200 800}*{margin:0;box-sizing:border-box}body{background:transparent}.monster{display:block;width:100%;height:auto;overflow:visible}.noel .monster-lia .m-noel{display:inline}.noel .monster-lia .m-arceau{display:none}.brand-co{position:relative;z-index:0;display:inline-block;margin-left:.1em;padding:0 .26em 0 .2em;color:#2A1F3D}.brand-co::before{content:"";position:absolute;z-index:-1;left:-.14em;right:-.2em;top:-.26em;bottom:-.3em;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50' preserveAspectRatio='none'%3E%3Cg fill='%23FF7AB8'%3E%3Cpath d='M8 22C6 12 18 5 32 7C42 3 56 4 66 8C78 5 92 9 94 19C98 27 92 35 84 36C82 40 82 46 79 47C76 48 76 42 74 38C64 41 52 40 44 39C40 41 38 45 35 45C32 45 33 41 33 38C22 40 10 38 7 31C3 28 4 24 8 22Z'/%3E%3Ccircle cx='98' cy='9' r='2.2'/%3E%3Ccircle cx='3' cy='39' r='1.8'/%3E%3Ccircle cx='89' cy='45' r='1.5'/%3E%3C/g%3E%3Cpath d='M16 15C22 10 30 10 36 11' fill='none' stroke='%23fff' stroke-width='2.4' stroke-linecap='round' opacity='.5'/%3E%3C/svg%3E") center/100% 100% no-repeat;transform:rotate(-4deg)}</style>`;
// À Noël (du 15 novembre au 6 janvier), Cerise porte son bonnet sur l'image de partage aussi
const jour = (new Date().getMonth() + 1) * 100 + new Date().getDate();
const NOEL = jour >= 1115 || jour <= 106 ? ' class="noel"' : '';
const og = `${base}<div${NOEL} style="width:1200px;height:630px;position:relative;overflow:hidden;font-family:Jakarta;color:#4B4668;background:radial-gradient(520px 380px at 88% 18%,#FFE8F1,transparent 70%),radial-gradient(480px 340px at 0% 100%,#DDF7EC,transparent 70%),radial-gradient(420px 300px at 50% 0%,#EEE7FF,transparent 70%),#FFF8F2">
<div style="position:absolute;left:72px;top:62px;display:flex;align-items:center;gap:18px"><div style="width:84px;height:84px">${logo}</div><div><div style="font-weight:900;font-size:56px;line-height:1;color:#2E2A47">Alex <span class="brand-co">&amp; Co</span></div><div style="font-size:24px;font-weight:800;color:#6B6789;margin-top:6px">Sites internet et SEO</div></div></div>
<div style="position:absolute;left:72px;top:212px;width:700px;font-weight:900;font-size:66px;line-height:1.06;letter-spacing:-1px;color:#2E2A47">Votre site internet, <span style="background:linear-gradient(transparent 58%,#BFF0DA 58% 94%,transparent 94%)">${marche.fois} fois moins cher</span></div>
<div style="position:absolute;left:72px;top:440px;width:660px;font-size:27px;line-height:1.35;font-weight:700">Tout est compris : maquette, nom de domaine, hébergement et mises à jour.</div>
<div style="position:absolute;left:72px;bottom:52px;display:flex;gap:12px;font-size:22px">${PILLS.map(([a, b, bg, fg]) => `<span style="display:flex;align-items:center;gap:8px;padding:9px 18px;border-radius:999px;background:${bg};color:${fg};font-weight:900"><b style="font-weight:900;color:#2E2A47">${a}</b> ${b}</span>`).join('')}</div>
<div style="position:absolute;right:250px;top:96px;width:200px">${petit('mochi')}</div>
<div style="position:absolute;right:60px;top:70px;width:170px">${petit('fantome', { humeur: 'ravi' })}</div>
<div style="position:absolute;right:170px;top:300px;width:190px">${petit('gelee')}</div>
<div style="position:absolute;right:20px;top:300px;width:150px">${petit('chaton', { humeur: 'ravi' })}</div>
<div style="position:absolute;right:420px;top:330px;width:110px">${petit('etoile')}</div>
</div>`;
const icon = (s, pad = 0, bg = 'transparent') => `${base}<div style="width:${s}px;height:${s}px;padding:${pad}px;background:${bg}">${logo}</div>`;
(async () => {
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const p = await b.newPage({ deviceScaleFactor: 1 });
  const shots = [
    [og, 1200, 630, 'src/assets/img/og-image.png'],
    [icon(512), 512, 512, 'src/assets/img/logo-512.png'],
    [icon(192), 192, 192, 'src/assets/img/logo-192.png'],
    [icon(180, 14, '#16142A'), 180, 180, 'src/static/apple-touch-icon.png'],
    [icon(32), 32, 32, 'src/static/favicon-32.png'],
  ];
  for (const [html, w, h, out] of shots) {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<!doctype html><html><body>${html}</body></html>`, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(ROOT, out), omitBackground: !out.includes('og-') && !out.includes('apple'), clip: { x: 0, y: 0, width: w, height: h } });
    console.log('✔', out);
  }
  await b.close();
})();
