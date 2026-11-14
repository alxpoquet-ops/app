// Génère les images PNG (Open Graph, icônes) à partir de gabarits HTML, via Playwright.
// Usage : node scripts/generate-images.js   (nécessite Playwright + Chromium)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(ROOT, 'src/assets/fonts', f)).toString('base64');
const { logoMark, monster } = require('../src/lib/monsters');
const logo = logoMark({ id: 'g' }).replace('class="logo"', 'width="100%" height="100%"');
const base = `<style>@font-face{font-family:Nunito;src:url(${font('nunito-var.woff2')});font-weight:200 1000}*{margin:0;box-sizing:border-box}body{background:transparent}.monster{display:block;width:100%;height:auto;overflow:visible}</style>`;
const og = `${base}<div style="width:1200px;height:630px;position:relative;overflow:hidden;font-family:Nunito;color:#4B4668;background:radial-gradient(520px 380px at 88% 18%,#DDF7EC,transparent 70%),radial-gradient(480px 340px at 0% 100%,#FFE8F1,transparent 70%),radial-gradient(420px 300px at 50% 0%,#EEE7FF,transparent 70%),#FFF8F2">
<div style="position:absolute;left:72px;top:62px;display:flex;align-items:center;gap:18px"><div style="width:84px;height:84px">${logo}</div><div><div style="font-weight:900;font-size:56px;line-height:1;color:#2E2A47">ALED08</div><div style="font-size:24px;font-weight:800;color:#6B6789;margin-top:6px">Sites internet &amp; SEO</div></div></div>
<div style="position:absolute;left:72px;top:212px;width:700px;font-weight:900;font-size:66px;line-height:1.06;letter-spacing:-1px;color:#2E2A47">Votre site internet à partir de 100&nbsp;€, <span style="background:linear-gradient(transparent 58%,#BFF0DA 58% 94%,transparent 94%)">tout compris</span></div>
<div style="position:absolute;left:72px;top:440px;width:660px;font-size:27px;line-height:1.35;font-weight:700">Entretien 10&nbsp;€ par mois. Vous modifiez votre site et publiez sur vos réseaux avec l’IA.</div>
<div style="position:absolute;left:72px;bottom:52px;display:flex;gap:12px;font-size:22px">${[['Chico','15','#FFD9E7','#A3305F'],['Power','20','#E8E0FF','#5B3FC4'],['Titan','25','#FFE4D6','#9C4220']].map(([n,p,bg,fg])=>`<span style="display:flex;align-items:center;gap:8px;padding:9px 18px;border-radius:999px;background:${bg};color:${fg};font-weight:900">${n} <b style="font-weight:900;color:#2E2A47">${p}&nbsp;€/mois</b></span>`).join('')}</div>
<div style="position:absolute;right:262px;top:118px;width:140px">${monster("chico")}</div>
<div style="position:absolute;right:56px;top:96px;width:250px">${monster('mascotte')}</div>
<div style="position:absolute;right:250px;bottom:46px;width:150px">${monster('power')}</div>
<div style="position:absolute;right:70px;bottom:40px;width:170px">${monster('titan')}</div>
</div>`;
const icon = (s, pad = 0, bg = 'transparent') => `${base}<div style="width:${s}px;height:${s}px;padding:${pad}px;background:${bg}">${logo}</div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  const shots = [
    [og, 1200, 630, 'src/assets/img/og-image.png'],
    [icon(512), 512, 512, 'src/assets/img/logo-512.png'],
    [icon(192), 192, 192, 'src/assets/img/logo-192.png'],
    [icon(180, 18, '#DDF7EC'), 180, 180, 'src/static/apple-touch-icon.png'],
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
