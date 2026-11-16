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

// Renvoie les adresses du plan : { toutes, produits } (produits : plans dont l'adresse parle de « product »,
// comme ceux de WooCommerce). Sert à estimer le prix du site sur la page Réalisations.
function adresses(url, niveau = 0) {
  const xml = lire(url);
  if (/<sitemapindex/i.test(xml)) {
    const res = { toutes: new Set(), produits: new Set() };
    if (niveau > 2) return res;
    for (const u of locs(xml)) {
      const r = adresses(u, niveau + 1);
      r.toutes.forEach((a) => res.toutes.add(a));
      (/product/i.test(u) ? r.toutes : r.produits).forEach((a) => res.produits.add(a));
    }
    return res;
  }
  return { toutes: new Set(/<urlset/i.test(xml) ? locs(xml) : []), produits: new Set() };
}
// Une page « pour Google » : son chemin commence par un des débuts donnés dans config (clients[].seo).
const cheminDe = (a) => { try { return new URL(a).pathname; } catch (e) { return a; } };
function compter(c) {
  const r = adresses(c.sitemap);
  const seo = [...r.toutes].filter((a) => !r.produits.has(a) && (c.seo || []).some((d) => cheminDe(a).startsWith(d))).length;
  return { pages: r.toutes.size, produits: r.produits.size, seo };
}

const avant = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const res = {};
for (const c of clients) {
  if (!c.sitemap || c.enCreation) continue;
  let r = { pages: 0, produits: 0, seo: 0 };
  try { r = compter(c); } catch (e) { console.log(`✖ ${c.domaine} : plan de site illisible`); }
  // un plan illisible ne remet pas le compteur à zéro : on garde le dernier chiffre connu
  res[c.domaine] = r.pages > 0 ? { pages: r.pages, produits: r.produits, seo: r.seo, le: new Date().toISOString().slice(0, 10) } : avant[c.domaine] || { pages: 0, produits: 0, seo: 0, le: '' };
  console.log(`${c.domaine} : ${res[c.domaine].pages} page(s), dont ${res[c.domaine].produits || 0} produit(s) et ${res[c.domaine].seo || 0} pour Google`);
}
fs.writeFileSync(OUT, JSON.stringify(res, null, 2) + '\n');
