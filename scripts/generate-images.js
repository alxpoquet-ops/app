// Génère les images PNG (Open Graph, icônes) à partir de gabarits HTML, via Playwright.
// Usage : node scripts/generate-images.js   (nécessite Playwright + Chromium)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(ROOT, 'src/assets/fonts', f)).toString('base64');
const logo = `<svg viewBox="0 0 48 48" width="100%" height="100%"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3CC8FF"/><stop offset=".55" stop-color="#1D6BFF"/><stop offset="1" stop-color="#1446B8"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(#g)"/><path d="M27.5 7 13 27h9.2l-2.7 14L35 20.5h-9.4L27.5 7Z" fill="#fff"/></svg>`;
const base = `<style>@font-face{font-family:Inter;src:url(${font('inter-var.woff2')})}@font-face{font-family:Sora;src:url(${font('sora-var.woff2')})}*{margin:0;box-sizing:border-box}body{background:transparent}</style>`;
const og = `${base}<div style="width:1200px;height:630px;position:relative;overflow:hidden;font-family:Inter;color:#dfe6ef;background:radial-gradient(800px 420px at 85% 10%,rgba(29,107,255,.55),transparent 60%),radial-gradient(600px 300px at 0% 100%,rgba(60,200,255,.18),transparent 60%),linear-gradient(160deg,#161a1f,#1e2329)">
<svg style="position:absolute;inset:0" width="1200" height="630"><g fill="none" stroke="rgba(140,170,210,.14)" stroke-width="1.5"><path d="M0 120h220l40 40h260l30-30h170"/><path d="M1200 90H960l-40 40H760"/><path d="M0 520h140l50-50h210l40 40h180"/><path d="M1200 470h-180l-60 60H780"/></g><path d="M1200 470h-180l-60 60H780" stroke="#3CC8FF" stroke-width="3" stroke-dasharray="120 900" fill="none" opacity=".8"/></svg>
<div style="position:absolute;left:80px;top:78px;display:flex;align-items:center;gap:22px"><div style="width:96px;height:96px;filter:drop-shadow(0 10px 30px rgba(29,107,255,.6))">${logo}</div><div style="font-family:Sora;font-weight:800;font-size:64px;color:#fff;letter-spacing:-1px">ALED08</div></div>
<div style="position:absolute;left:80px;top:230px;width:1000px;font-family:Sora;font-weight:700;font-size:62px;line-height:1.08;letter-spacing:-1.5px;color:#fff">Dépannage &amp; Travaux Électriques dans les Ardennes</div>
<div style="position:absolute;left:80px;top:410px;font-size:30px;color:#a9dcff;font-weight:600">Intervention en soirée et le week-end, sur rendez-vous</div>
<div style="position:absolute;left:80px;bottom:70px;display:flex;gap:16px;font-size:24px;font-weight:600">${['Recherche de panne','Tableaux','Éclairage','Mise en sécurité'].map(t=>`<span style="padding:10px 20px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)">${t}</span>`).join('')}</div>
<div style="position:absolute;right:80px;top:112px;font-size:24px;color:#95a2b3;font-weight:500">Signy-l’Abbaye · Ardennes (08)</div></div>`;
const icon = (s, pad = 0, bg = 'transparent') => `${base}<div style="width:${s}px;height:${s}px;padding:${pad}px;background:${bg}">${logo}</div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  const shots = [
    [og, 1200, 630, 'src/assets/img/og-image.png'],
    [icon(512), 512, 512, 'src/assets/img/logo-512.png'],
    [icon(192), 192, 192, 'src/assets/img/logo-192.png'],
    [icon(180, 0, '#1D6BFF'), 180, 180, 'src/static/apple-touch-icon.png'],
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
