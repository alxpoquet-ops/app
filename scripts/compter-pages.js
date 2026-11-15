#!/usr/bin/env node
// Compte les pages publiques des sites clients (page « Ils nous ont fait confiance »).
// Lit le plan de site de chaque client (sitemap, y compris un index de plusieurs plans) et écrit
// src/content/clients-pages.json. À lancer avant « node build.js » pour mettre les chiffres à jour :
//   node scripts/compter-pages.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { clients } = require('../src/config');

const OUT = path.join(__dirname, '../src/content/clients-pages.json');
const lire = (url) => execFileSync('curl', ['-sL', '-m', '25', url], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));

function compter(url, niveau = 0) {
  const xml = lire(url);
  if (/<sitemapindex/i.test(xml)) return niveau > 2 ? 0 : locs(xml).reduce((n, u) => n + compter(u, niveau + 1), 0);
  return /<urlset/i.test(xml) ? new Set(locs(xml)).size : 0;
}

const avant = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const res = {};
for (const c of clients) {
  if (!c.sitemap) continue;
  let n = 0;
  try { n = compter(c.sitemap); } catch (e) { console.log(`✖ ${c.domaine} : plan de site illisible`); }
  // un plan illisible ne remet pas le compteur à zéro : on garde le dernier chiffre connu
  res[c.domaine] = n > 0 ? { pages: n, le: new Date().toISOString().slice(0, 10) } : avant[c.domaine] || { pages: 0, le: '' };
  console.log(`${c.domaine} : ${res[c.domaine].pages} page(s)`);
}
fs.writeFileSync(OUT, JSON.stringify(res, null, 2) + '\n');
