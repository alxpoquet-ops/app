#!/usr/bin/env node
// Contrôle qualité du site généré (dist/) :
//  - liens internes cassés
//  - un seul <h1> par page, title/description présents, longueurs, unicité
//  - JSON-LD valide
//  - phrases dupliquées entre pages (contenu éditorial uniquement)
const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, '..', 'dist');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const files = walk(DIST);
const exists = (href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '' ) return true;
  const p = path.join(DIST, clean);
  if (clean.endsWith('/')) return fs.existsSync(path.join(p, 'index.html'));
  return fs.existsSync(p);
};

const errors = [], warns = [];
const titles = new Map(), descs = new Map();
const sentences = new Map(); // phrase -> Set(pages)

for (const f of files) {
  const rel = '/' + path.relative(DIST, f).replace(/index\.html$/, '');
  const html = fs.readFileSync(f, 'utf8');
  const noindex = /noindex/.test(html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || '');

  // liens internes
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (!m[1].startsWith("/wp-login.php") && !exists(m[1])) errors.push(`${rel} → lien cassé ${m[1]}`);
  }
  // h1
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel} : ${h1} balise(s) <h1>`);
  // title / description
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  const tl = title.replace(/&[a-z#0-9]+;/g, 'x').length, dl = desc.replace(/&[a-z#0-9]+;/g, 'x').length;
  if (!noindex) {
    if (tl > 70) warns.push(`${rel} : title long (${tl}) « ${title} »`);
    if (dl < 110 || dl > 165) warns.push(`${rel} : description ${dl} caractères`);
    if (titles.has(title)) errors.push(`title dupliqué : ${rel} et ${titles.get(title)}`);
    if (descs.has(desc)) errors.push(`description dupliquée : ${rel} et ${descs.get(desc)}`);
    titles.set(title, rel); descs.set(desc, rel);
  }
  // JSON-LD
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { errors.push(`${rel} : JSON-LD invalide`); }
  }
  // images sans alt
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) errors.push(`${rel} : image sans alt`);

  // contenu éditorial : <main> sans les composants communs
  if (noindex) continue;
  let main = html.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] || '';
  main = main
    .replace(/<section class="cta-band">[\s\S]*?<\/section>/g, '')
    .replace(/<aside class="aside-sticky"[\s\S]*?<\/aside>\s*<\/div><\/section>/g, '</div></section>')
    .replace(/<aside class="inline-cta[\s\S]*?<\/aside>/g, '')
    .replace(/<section class="trustbar"[\s\S]*?<\/section>/g, '')
    .replace(/<nav class="related"[\s\S]*?<\/nav>/g, '')
    .replace(/<div class="distance-badge">[\s\S]*?<\/div><\/div>/g, '')
    .replace(/<p class="small muted center">[\s\S]*?<\/p>/g, '')
    .replace(/<div class="author-box">[\s\S]*?<\/div>/g, '');
  const text = main.replace(/<[^>]+>/g, ' ').replace(/&nbsp;| | /g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');
  for (const s of text.split(/(?<=[.!?:])\s+/)) {
    const norm = s.toLowerCase().replace(/[^a-zà-ÿœ0-9 ]/g, '').trim();
    if (norm.split(' ').length < 9) continue;
    if (!sentences.has(norm)) sentences.set(norm, new Set());
    sentences.get(norm).add(rel);
  }
}

const dups = [...sentences.entries()].filter(([, set]) => set.size > 1);
// La page /faq/ reprend volontairement les questions de chaque rubrique : tolérance
const sharedOk = (set) => set.has('/faq/') && set.size === 2;
const realDups = dups.filter(([, set]) => !sharedOk(set));

console.log(`Pages analysées : ${files.length}`);
console.log(`Erreurs : ${errors.length}`);
errors.slice(0, 50).forEach((e) => console.log('  ✖ ' + e));
console.log(`Avertissements : ${warns.length}`);
warns.slice(0, 50).forEach((w) => console.log('  ⚠ ' + w));
console.log(`Phrases dupliquées entre pages de contenu : ${realDups.length}`);
realDups.slice(0, 40).forEach(([s, set]) => console.log(`  ≡ « ${s.slice(0, 110)}… » → ${[...set].join(', ')}`));
process.exit(errors.length || realDups.length ? 1 : 0);
