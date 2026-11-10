// Génère les images PNG (Open Graph, icônes) à partir de gabarits HTML, via Playwright.
// Usage : node scripts/generate-images.js   (nécessite Playwright + Chromium)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(ROOT, 'src/assets/fonts', f)).toString('base64');
const logo = `<svg viewBox="0 0 48 48" width="100%" height="100%"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#F39B00"/></linearGradient></defs><rect width="48" height="48" rx="15" fill="url(#g)"/><path d="M27.5 7 13 27h9.2l-2.7 14L35 20.5h-9.4L27.5 7Z" fill="#24304A"/></svg>`;
const base = `<style>@font-face{font-family:Nunito;src:url(${font('nunito-var.woff2')});font-weight:200 1000}*{margin:0;box-sizing:border-box}body{background:transparent}</style>`;
const og = `${base}<div style="width:1200px;height:630px;position:relative;overflow:hidden;font-family:Nunito;color:#4a3f38;background:radial-gradient(700px 420px at 90% 0%,rgba(246,169,31,.45),transparent 65%),radial-gradient(600px 340px at 0% 100%,rgba(255,196,140,.5),transparent 65%),linear-gradient(180deg,#fff6e9,#fffbf5)">
<div style="position:absolute;left:80px;top:78px;display:flex;align-items:center;gap:22px"><div style="width:96px;height:96px;filter:drop-shadow(0 10px 24px rgba(214,128,0,.4))">${logo}</div><div style="font-family:Nunito;font-weight:900;font-size:64px;color:#2b2420;letter-spacing:-1px">ALED08</div></div>
<div style="position:absolute;left:80px;top:230px;width:1000px;font-family:Nunito;font-weight:900;font-size:64px;line-height:1.08;letter-spacing:-1px;color:#2b2420">Dépannage &amp; Travaux Électriques dans les Ardennes</div>
<div style="position:absolute;left:80px;top:410px;font-size:30px;color:#b4500b;font-weight:800">Spécialiste du dépannage · à tout moment, sur rendez-vous</div>
<div style="position:absolute;left:80px;bottom:70px;display:flex;gap:16px;font-size:24px;font-weight:600">${['Prix annoncé avant de venir','Remise si panne non trouvée','Devis sans obligation'].map(t=>`<span style="padding:10px 20px;border-radius:999px;background:#fff;border:1px solid #eee2d3;color:#2b2420;font-weight:800">${t}</span>`).join('')}</div>
<div style="position:absolute;right:80px;top:112px;font-size:24px;color:#6f6259;font-weight:700">Toutes les Ardennes (08)</div></div>`;
const icon = (s, pad = 0, bg = 'transparent') => `${base}<div style="width:${s}px;height:${s}px;padding:${pad}px;background:${bg}">${logo}</div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  const shots = [
    [og, 1200, 630, 'src/assets/img/og-image.png'],
    [icon(512), 512, 512, 'src/assets/img/logo-512.png'],
    [icon(192), 192, 192, 'src/assets/img/logo-192.png'],
    [icon(180, 0, '#F6A91F'), 180, 180, 'src/static/apple-touch-icon.png'],
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
