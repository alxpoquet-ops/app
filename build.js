#!/usr/bin/env node
// ============================================================================
//  ALED08 : générateur de site statique (Node.js ≥ 18, aucune dépendance)
//  Usage : node build.js   →   génère le site complet dans ./dist
// ============================================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const { site } = require('./src/config');
const { page, setAssetVersion } = require('./src/lib/layout');
const mainPages = require('./src/pages/main');

// ---------------------------------------------------------------- utilitaires
function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }
function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}
const hash = (f) => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 8);

// ---------------------------------------------------------------- build
rmrf(OUT);
fs.mkdirSync(OUT, { recursive: true });
copyDir(path.join(ROOT, 'src/assets'), path.join(OUT, 'assets'));
copyDir(path.join(ROOT, 'src/static'), OUT);
// Minification du CSS (commentaires et espaces superflus)
{
  const cssFile = path.join(OUT, 'assets/css/style.css');
  const min = fs.readFileSync(cssFile, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*\n\s*/g, '')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}');
  fs.writeFileSync(cssFile, min);
}
setAssetVersion({ css: hash(path.join(ROOT, 'src/assets/css/style.css')), js: hash(path.join(ROOT, 'src/assets/js/main.js')) });

// 1) rendu
const rendered = mainPages.build();
const titles = new Map();
for (const p of rendered) {
  if (!p.noindex) {
    if (titles.has(p.title)) throw new Error(`Titre en double : « ${p.title} » (${p.path} et ${titles.get(p.title)})`);
    titles.set(p.title, p.path);
  }
  const file = p.file || (p.path === '/' ? 'index.html' : p.path.replace(/^\//, '') + 'index.html');
  write(file, page(p));
}

// 2) sitemap.xml & robots.txt
const today = new Date().toISOString().slice(0, 10);
const urls = rendered.filter((p) => !p.noindex && !p.file);
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((p) => `  <url><loc>${site.url}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq || 'monthly'}</changefreq><priority>${(p.priority ?? 0.6).toFixed(1)}</priority></url>`)
    .join('\n')}\n</urlset>\n`
);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /merci/\nDisallow: /envoi.php\n\nSitemap: ${site.url}/sitemap.xml\n`);

// 3) manifest
write(
  'site.webmanifest',
  JSON.stringify(
    {
      name: 'ALED08, sites internet et IA',
      short_name: 'ALED08',
      start_url: '/',
      display: 'standalone',
      background_color: '#15254A',
      theme_color: '#15254A',
      icons: [
        { src: '/assets/img/logo-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/img/logo-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2
  )
);

// 4) script d'envoi des formulaires (PHP) : injection de l'adresse e-mail
const php = fs.readFileSync(path.join(ROOT, 'src/server/envoi.php'), 'utf8').replace('__EMAIL__', site.email).replace('__SITE__', site.url);
write('envoi.php', php);

// ---------------------------------------------------------------- rapport
const warn = [];
if (JSON.stringify(site).includes('à compléter')) warn.push('Informations légales à compléter dans src/config.js (SIRET, médiateur).');
console.log(`✔ ${rendered.length} pages générées dans dist/ (${urls.length} URL dans le sitemap)`);
if (warn.length) console.log('\n⚠ À faire avant la mise en ligne :\n  - ' + warn.join('\n  - '));
