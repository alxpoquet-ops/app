#!/usr/bin/env node
// ============================================================================
//  ALED08 — générateur de site statique (Node.js ≥ 18, aucune dépendance)
//  Usage : node build.js   →   génère le site complet dans ./dist
// ============================================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const { site, communes } = require('./src/config');
const { page, setAssetVersion } = require('./src/lib/layout');
const C = require('./src/lib/components');
const T = require('./src/pages/templates');

// ---------------------------------------------------------------- contenus
const seoPages = [
  ...require('./src/content/seo-villes'),
  ...require('./src/content/seo-ardennes'),
  ...require('./src/content/seo-symptomes'),
  ...require('./src/content/seo-services'),
  ...require('./src/content/seo-contextes'),
];
const posts = [...require('./src/content/blog-1'), ...require('./src/content/blog-2')].sort((a, b) => (a.date < b.date ? 1 : -1));
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
setAssetVersion({ css: hash(path.join(ROOT, 'src/assets/css/style.css')), js: hash(path.join(ROOT, 'src/assets/js/main.js')) });

// 1) registre des pages (libellés pour le maillage interne)
const seen = new Set();
for (const p of seoPages) {
  if (seen.has(p.slug)) throw new Error('Slug en double : ' + p.slug);
  seen.add(p.slug);
  C.register(`/${p.slug}/`, { label: p.label, group: p.group });
}
for (const a of posts) C.register(`/blog/${a.slug}/`, { label: a.short || a.h1, group: 'blog' });
mainPages.registerAll(C.register);

// 2) rendu
const rendered = [];
const ctx = { seoPages, posts };
for (const p of mainPages.build(ctx)) rendered.push(p);
for (const p of seoPages) rendered.push({ ...T.seoPage(p), _seo: p });
for (const a of posts) rendered.push(T.blogPost(a, posts));

const titles = new Map();
for (const p of rendered) {
  if (!p.noindex) {
    if (titles.has(p.title)) throw new Error(`Titre en double : « ${p.title} » (${p.path} et ${titles.get(p.title)})`);
    titles.set(p.title, p.path);
  }
  const file = p.file || (p.path === '/' ? 'index.html' : p.path.replace(/^\//, '') + 'index.html');
  write(file, page(p));
}

// 3) sitemap.xml & robots.txt
const today = new Date().toISOString().slice(0, 10);
const urls = rendered.filter((p) => !p.noindex && !p.file);
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (p) =>
        `  <url><loc>${site.url}${p.path}</loc><lastmod>${p.modified || p.published || today}</lastmod><changefreq>${p.changefreq || 'monthly'}</changefreq><priority>${(p.priority ?? 0.6).toFixed(1)}</priority></url>`
    )
    .join('\n')}\n</urlset>\n`
);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /merci/\nDisallow: /envoi.php\n\nSitemap: ${site.url}/sitemap.xml\n`);

// 4) manifest
write(
  'site.webmanifest',
  JSON.stringify(
    {
      name: 'ALED08 — Électricien Ardennes',
      short_name: 'ALED08',
      start_url: '/',
      display: 'standalone',
      background_color: '#161A1F',
      theme_color: '#1D6BFF',
      icons: [
        { src: '/assets/img/logo-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/img/logo-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2
  )
);

// 5) script d'envoi des formulaires (PHP) — injection de l'adresse e-mail
const php = fs.readFileSync(path.join(ROOT, 'src/server/envoi.php'), 'utf8').replace('__EMAIL__', site.email).replace('__SITE__', site.url);
write('envoi.php', php);

// ---------------------------------------------------------------- rapport
const warn = [];
const cfg = JSON.stringify(site);
if (cfg.includes('à compléter')) warn.push('Informations légales à compléter dans src/config.js (SIRET, assurance, médiateur, hébergeur).');
if (site.phoneIntl === '+33639980000') warn.push('Numéro de téléphone fictif : remplacez-le dans src/config.js.');
if (site.demoReviews) warn.push('Avis clients d’exemple affichés : remplacez-les par de vrais avis (src/content/avis.js) puis passez demoReviews à false.');
console.log(`✔ ${rendered.length} pages générées dans dist/ (${seoPages.length} pages SEO, ${posts.length} articles, ${urls.length} URL dans le sitemap)`);
if (warn.length) console.log('\n⚠ À faire avant la mise en ligne :\n  - ' + warn.join('\n  - '));
