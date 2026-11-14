// Génère les images PNG (Open Graph, icônes) à partir de gabarits HTML, via Playwright.
// Usage : node scripts/generate-images.js   (nécessite Playwright + Chromium)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(ROOT, 'src/assets/fonts', f)).toString('base64');
const logo = `<svg viewBox="0 0 48 48" width="100%" height="100%"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#F39B00"/></linearGradient></defs><rect width="48" height="48" rx="15" fill="url(#g)"/><path d="M27.5 7 13 27h9.2l-2.7 14L35 20.5h-9.4L27.5 7Z" fill="#24304A"/></svg>`;
const base = `<style>@font-face{font-family:Nunito;src:url(${font('nunito-var.woff2')});font-weight:200 1000}*{margin:0;box-sizing:border-box}body{background:transparent}</style>`;
const og = `${base}<div style="width:1200px;height:630px;position:relative;overflow:hidden;font-family:Nunito;color:#e6ebf5;background:radial-gradient(700px 440px at 92% 0%,rgba(255,182,39,.32),transparent 65%),radial-gradient(620px 380px at 0% 100%,rgba(47,211,192,.24),transparent 65%),radial-gradient(520px 320px at 60% 120%,rgba(255,122,92,.16),transparent 65%),linear-gradient(160deg,#1b2f63,#15254a 70%)">
<div style="position:absolute;left:80px;top:72px;display:flex;align-items:center;gap:22px"><div style="width:92px;height:92px;filter:drop-shadow(0 10px 24px rgba(255,182,39,.45))">${logo}</div><div><div style="font-weight:900;font-size:60px;line-height:1;color:#fff;letter-spacing:-1px">ALED08</div><div style="font-size:24px;font-weight:800;color:#aab6d0;margin-top:6px">Sites internet &amp; IA</div></div></div>
<div style="position:absolute;left:80px;top:222px;width:1040px;font-weight:900;font-size:70px;line-height:1.06;letter-spacing:-1.5px;color:#fff">Votre site internet dès 100&nbsp;€, prêt en quelques jours</div>
<div style="position:absolute;left:80px;top:402px;width:1000px;font-size:28px;line-height:1.35;color:#e6ebf5;font-weight:700">Créé avec l’IA, vérifié par un humain. En une fois ou au mois.</div>
<div style="position:absolute;left:80px;bottom:64px;display:flex;gap:14px;font-size:24px">${[['Une page','100','#ffb627'],['Avec onglets','290','#6cb6ff'],['Boutique en ligne','590','#ff7a5c']].map(([t,p,c])=>`<span style="display:flex;align-items:center;gap:12px;padding:12px 22px;border-radius:999px;background:#20356a;border:2px solid ${c};color:#fff;font-weight:800"><i style="width:12px;height:12px;border-radius:50%;background:${c}"></i>${t}<b style="color:${c};font-weight:900">dès ${p}&nbsp;€</b></span>`).join('')}</div>
<div style="position:absolute;right:80px;top:100px;display:flex;align-items:center;gap:10px;font-size:22px;color:#e6ebf5;font-weight:800;padding:10px 20px;border-radius:999px;background:rgba(32,53,106,.8);border:1px solid rgba(170,195,255,.28)"><i style="width:10px;height:10px;border-radius:50%;background:#2fd3c0"></i>Devis gratuit</div></div>`;
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
