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

// Renvoie { pages, produits } : toutes les adresses du plan, et parmi elles les fiches produits
// (plans dont l'adresse parle de « product », comme ceux de WooCommerce). Sert à estimer le prix du site.
function compter(url, niveau = 0) {
  const xml = lire(url);
  if (/<sitemapindex/i.test(xml)) {
    if (niveau > 2) return { pages: 0, produits: 0 };
    return locs(xml).reduce((t, u) => {
      const r = compter(u, niveau + 1);
      return { pages: t.pages + r.pages, produits: t.produits + (/product/i.test(u) ? r.pages : r.produits) };
    }, { pages: 0, produits: 0 });
  }
  return { pages: /<urlset/i.test(xml) ? new Set(locs(xml)).size : 0, produits: 0 };
}

const avant = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const res = {};
for (const c of clients) {
  if (!c.sitemap || c.enCreation) continue;
  let r = { pages: 0, produits: 0 };
  try { r = compter(c.sitemap); } catch (e) { console.log(`✖ ${c.domaine} : plan de site illisible`); }
  // un plan illisible ne remet pas le compteur à zéro : on garde le dernier chiffre connu
  res[c.domaine] = r.pages > 0 ? { pages: r.pages, produits: r.produits, le: new Date().toISOString().slice(0, 10) } : avant[c.domaine] || { pages: 0, produits: 0, le: '' };
  console.log(`${c.domaine} : ${res[c.domaine].pages} page(s), dont ${res[c.domaine].produits || 0} produit(s)`);
}
fs.writeFileSync(OUT, JSON.stringify(res, null, 2) + '\n');
