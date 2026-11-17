// Captures de l'espace client pour expliquer l'offre (pages Tarifs et Documentation) : les petits mots de la bande,
// tels qu'ils s'affichent dans la démo (/mon-espace/demo/, abonnement Maxi).
// Usage : node build.js && node scripts/captures-espace.js && node build.js
// (Playwright + Chromium ; écrit src/assets/img/doc/messages.webp et messages.json avec ses dimensions)
const path = require('path');
const fs = require('fs');
const http = require('http');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'src/assets/img/doc');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };

// un petit serveur pour dist/, le temps des captures
function serveur() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(DIST, p);
      if (!f.startsWith(DIST) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, () => ok(s));
  });
}

(async () => {
  if (!fs.existsSync(path.join(DIST, 'mon-espace/demo/index.html'))) { console.error('Lancez d’abord node build.js'); process.exit(1); }
  const srv = await serveur();
  const base = `http://localhost:${srv.address().port}`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 820, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto(base + '/mon-espace/demo/', { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.reveal{opacity:1!important;transform:none!important} .lia-flot,.mobile-bar{display:none!important} [data-msgs]{padding:18px;background:var(--card);border-radius:22px;margin:0!important}' });
  const el = await p.$('[data-msgs]');
  const png = path.join(OUT, 'messages.png');
  await el.screenshot({ path: png });
  const box = await el.boundingBox();
  const webp = png.replace(/\.png$/, '.webp');
  execFileSync('python3', ['-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]);im.save(sys.argv[2],"WEBP",quality=82,method=6);print(im.size[0],im.size[1])', png, webp]);
  fs.unlinkSync(png);
  fs.writeFileSync(path.join(OUT, 'messages.json'), JSON.stringify([Math.round(box.width * 2), Math.round(box.height * 2)]));
  console.log('✔', path.relative(ROOT, webp), Math.round(fs.statSync(webp).size / 1024) + ' Ko');
  await b.close();
  srv.close();
})();
