#!/usr/bin/env node
/*
 * Flore & Chenilles — génération des pages de contenu (référencement)
 * ------------------------------------------------------------------
 * Fabrique, à partir du catalogue (assets/js/data.js) et des textes
 * (tools/seo/content.js) :
 *   - une page par création          creations/<nom>/
 *   - une page par fleur             fleurs/<fleur>/
 *   - une page par occasion          occasions/<occasion>/
 *   - des pages de conseils          conseils/<sujet>/
 *   - deux pages locales             fleurs-eternelles-ardennes/, livraison-fleurs-signy-l-abbaye/
 *   - un plan des pages              guide/
 *   - sitemap.xml et robots.txt
 * Ces pages renvoient vers le site ; le site ne les affiche pas dans son menu.
 *
 * Utilisation (depuis le dossier du site) :
 *   node tools/seo/build.js
 *   SITE_URL=https://www.mon-domaine.fr/ node tools/seo/build.js   (si le site change d'adresse)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = String(process.env.SITE_URL || 'https://alxpoquet-ops.github.io/app/').replace(/\/?$/, '/');
const TODAY = new Date().toISOString().slice(0, 10);
const FIRST_PUBLISHED = '2026-11-05';
const CSS_VERSION = '20261105b';

/* ---------- Données ---------- */
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'), sandbox);
const S = sandbox.window.SITE;
const C = require('./content.js');
const UNIT = S.unitPrice || 8;
const JAR = (S.jar && S.jar.price) || 5;
const IG = 'https://www.instagram.com/' + ((S.brand && S.brand.instagram) || 'flore_et_chenilles') + '/';
const EMAIL = (S.contact && S.contact.email) || '';
const CITY = (S.brand && S.brand.city) || 'Signy-l’Abbaye';

/* ---------- Utilitaires ---------- */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/* Espaces insécables de la typographie française. */
const fr = (s) => String(s).replace(/ ([:])/g, ' $1').replace(/ ([;!?»])/g, ' $1').replace(/« /g, '« ');
const slugify = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',')) + ' €';
const lcFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const clip = (s, n) => {
  s = String(s).replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…';
};
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

/* ---------- Créations ---------- */
const products = S.products.slice();
const byId = new Map(products.map((p) => [p.id, p]));
const slugOf = new Map();
const usedSlugs = new Set();
products.forEach((p) => {
  let s = slugify(p.name) || p.id;
  while (usedSlugs.has(s)) s += '-2';
  usedSlugs.add(s);
  slugOf.set(p.id, s);
});
const bySlug = new Map(products.map((p) => [slugOf.get(p.id), p]));
const findCreation = (key) => byId.get(key) || bySlug.get(key);
const catName = (id) => ((S.categories || []).find((c) => c.id === id) || {}).name || '';
function priceOf(p) {
  if (p.price != null) return p.price;
  if (p.count > 0) return p.count * UNIT + (p.jar ? JAR : 0);
  return p.category === 'unite' ? UNIT : null;
}
const priceLabel = (p) => { const v = priceOf(p); return v == null ? 'Sur demande' : (p.priceFrom ? 'dès ' : '') + fmt(v); };
function pics(p) {
  const g = (ref) => (/^g\d+$/.test(ref) ? { s: `assets/gallery/${ref}-s.webp`, l: `assets/gallery/${ref}.webp` } : { s: ref, l: ref });
  const main = p.photo ? g(p.photo) : p.image ? { s: p.image, l: p.image } : null;
  return (main ? [main] : []).concat((p.more || []).map(g));
}
const creationPath = (p) => `creations/${slugOf.get(p.id)}/`;

/* Fleur et couleur des fleurs à l'unité (identifiants u-<fleur>-<couleur>). */
const UNIT_TYPES = {
  rose: { flower: 'rose', fem: true }, tulipe: { flower: 'tulipe', fem: true }, lys: { flower: 'lys', fem: false },
  gerbera: { flower: 'gerbera', fem: false }, pavot: { flower: 'pavot-coquelicot', fem: false }, arum: { flower: 'arum', fem: false }
};
function unitInfo(p) {
  const m = /^u-([a-z]+)-([a-z]+)$/.exec(p.id);
  if (!m || !UNIT_TYPES[m[1]]) return null;
  return Object.assign({ type: m[1], color: m[2] }, UNIT_TYPES[m[1]]);
}
/* Pages de fleurs et d'occasions qui citent chaque création. */
const flowersOf = new Map();
C.flowers.forEach((f) => f.products.forEach((id) => { if (!flowersOf.has(id)) flowersOf.set(id, []); flowersOf.get(id).push(f); }));
const occasionsOf = new Map();
C.occasions.forEach((o) => o.products.forEach((id) => { if (!occasionsOf.has(id)) occasionsOf.set(id, []); occasionsOf.get(id).push(o); }));

const THE = { rose: 'La rose', tulipe: 'La tulipe', lys: 'Le lys', gerbera: 'Le gerbera', 'pavot-coquelicot': 'Le pavot et le coquelicot', arum: 'L’arum', hortensia: 'L’hortensia', tournesol: 'Le tournesol', muguet: 'Le muguet', lavande: 'La lavande', jonquille: 'La jonquille', marguerite: 'La marguerite', pensee: 'La pensée' };
const WITH = { rose: 'des roses', tulipe: 'des tulipes', lys: 'des lys', gerbera: 'des gerberas', 'pavot-coquelicot': 'des pavots et des coquelicots', arum: 'des arums', hortensia: 'des hortensias', tournesol: 'des tournesols', muguet: 'du muguet', lavande: 'de la lavande', jonquille: 'des jonquilles', marguerite: 'des marguerites', pensee: 'des pensées' };

/* ---------- Mise en page ---------- */
const pages = [];
function prefixFor(p) { const d = p.split('/').filter(Boolean).length; return d ? '../'.repeat(d) : './'; }
/* Liens écrits dans les textes : [texte](#rubrique), [texte](/page/), [texte](creation:nom), [texte](https://…) */
function inline(text, pre) {
  return fr(esc(text)).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => {
    let url = href;
    if (href.startsWith('#')) url = pre + href;
    else if (href.startsWith('/')) url = pre + href.slice(1);
    else if (href.startsWith('creation:')) {
      const p = findCreation(href.slice(9));
      if (!p) throw new Error('Création inconnue dans un lien : ' + href);
      url = pre + creationPath(p);
    } else if (!/^https?:/.test(href)) throw new Error('Lien inconnu : ' + href);
    const ext = /^https?:/.test(url) ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${esc(url)}"${ext}>${label}</a>`;
  });
}
function sectionHTML(sec, pre) {
  let h = `<section class="pg-sec${sec.tint ? ' is-' + sec.tint : ''}">`;
  if (sec.h) h += `<h2>${fr(esc(sec.h))}</h2>`;
  if (sec.quote) h += `<blockquote class="pg-quote"><p>« ${fr(esc(sec.quote.text))} »</p>${sec.quote.cite ? `<cite>${esc(sec.quote.cite)}</cite>` : ''}</blockquote>`;
  (sec.p || []).forEach((t) => { h += `<p>${inline(t, pre)}</p>`; });
  if (sec.table) {
    h += '<div class="pg-table-wrap"><table class="pg-table"><thead><tr>' + sec.table.head.map((c) => `<th scope="col">${fr(esc(c))}</th>`).join('') + '</tr></thead><tbody>' +
      sec.table.rows.map((r) => '<tr>' + r.map((c, i) => (i === 0 ? `<th scope="row">${fr(esc(c))}</th>` : `<td>${fr(esc(c))}</td>`)).join('') + '</tr>').join('') + '</tbody></table></div>';
  }
  if (sec.ul) h += `<ul class="pg-list-check">${sec.ul.map((t) => `<li>${inline(t, pre)}</li>`).join('')}</ul>`;
  if (sec.ol) h += `<ol class="pg-steps">${sec.ol.map((t) => `<li>${inline(t, pre)}</li>`).join('')}</ol>`;
  if (sec.msgs) h += `<ul class="pg-msgs">${sec.msgs.map((t) => `<li>${fr(esc(t))}</li>`).join('')}</ul>`;
  if (sec.html) h += sec.html;
  return h + '</section>';
}
function cardsHTML(list, pre, title) {
  const items = list.filter(Boolean);
  if (!items.length) return '';
  return `<section class="pg-grid-sec"><h2>${fr(esc(title))}</h2><ul class="pg-grid">` + items.map((p) => {
    const ph = pics(p)[0];
    return `<li><a class="pg-card" href="${pre}${creationPath(p)}">` +
      `<span class="pg-card-img">${ph ? `<img src="${pre}${ph.s}" alt="${esc(p.name)} en fil chenille" loading="lazy" decoding="async" width="480" height="600">` : ''}</span>` +
      `<span class="pg-card-body"><span class="pg-card-name">${esc(p.name)}</span><span class="pg-card-price">${esc(priceLabel(p))}</span></span></a></li>`;
  }).join('') + '</ul></section>';
}
function linksHTML(title, links, pre) {
  const ls = links.filter(Boolean);
  if (!ls.length) return '';
  return `<section class="pg-sec"><h2>${fr(esc(title))}</h2><ul class="pg-links">${ls.map((l) => `<li><a href="${pre}${l.path}">${fr(esc(l.name))}</a></li>`).join('')}</ul></section>`;
}
const ORG = {
  '@type': 'Florist',
  '@id': BASE + '#atelier',
  name: 'Flore & Chenilles',
  url: BASE,
  logo: BASE + 'assets/photos/logo.jpg',
  image: BASE + 'assets/img/og-image.png',
  email: EMAIL || undefined,
  address: { '@type': 'PostalAddress', addressLocality: CITY, postalCode: '08460', addressRegion: 'Ardennes', addressCountry: 'FR' },
  areaServed: { '@type': 'AdministrativeArea', name: 'Ardennes' },
  sameAs: [IG]
};
function page(o) {
  const pre = prefixFor(o.path);
  const url = BASE + o.path;
  const image = o.image || 'assets/img/og-image.png';
  const crumbs = [{ name: 'Accueil', path: '' }].concat(o.crumbs || []);
  const ld = [{
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: BASE + c.path }))
  }].concat(o.ld || []);
  const crumbsHTML = '<nav class="pg-crumbs" aria-label="Fil d’Ariane"><ol>' + crumbs.map((c, i) =>
    i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${pre}${c.path}">${esc(c.name)}</a></li>`).join('') + '</ol></nav>';
  const tags = (o.tags || []).length ? `<ul class="pg-tags">${o.tags.map((t) => `<li${t.cls ? ` class="${t.cls}"` : ''}>${esc(t.label)}</li>`).join('')}</ul>` : '';
  const ctas = (o.ctas || []).map((c, i) => `<a class="pg-btn${i ? ' pg-btn--ghost' : ''}" href="${c.href.startsWith('#') ? pre + c.href : c.href}">${esc(c.label)}</a>`).join('');
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#FBF7F2">
<link rel="icon" href="${pre}assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="${pre}assets/img/apple-touch-icon.png">
<meta property="og:type" content="${o.ogType || 'article'}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Flore &amp; Chenilles">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(BASE + image)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="${pre}assets/fonts/fraunces-latin-full-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${pre}assets/css/pages.css?v=${CSS_VERSION}">
<script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': ld })}</script>
</head>
<body>
<header class="pg-top"><div class="pg-wrap"><a class="pg-logo" href="${pre}"><img src="${pre}assets/photos/logo.jpg" alt="" width="40" height="40"><span>Flore <em>&amp;</em> Chenilles</span></a><a class="pg-btn pg-btn--ghost" href="${pre}#boutique">Voir les créations</a></div></header>
<main class="pg-wrap">
${crumbsHTML}
<section class="pg-hero">
<div class="pg-hero-media">${o.image ? `<img src="${pre}${o.image}" alt="${esc(o.imageAlt || o.h1)}" width="900" height="1125" fetchpriority="high">` : ''}</div>
<div class="pg-hero-copy">
<p class="pg-eyebrow">${esc(o.eyebrow || 'Flore & Chenilles')}</p>
<h1>${fr(esc(o.h1))}</h1>
${o.price ? `<p class="pg-price">${esc(o.price)}${o.priceNote ? ` <small>${esc(o.priceNote)}</small>` : ''}</p>` : ''}
${o.lead ? `<p class="pg-lead">${inline(o.lead, pre)}</p>` : ''}
${tags}
<div class="pg-ctas">${ctas}</div>
</div>
</section>
<div class="pg-body">
${(o.sections || []).map((s) => sectionHTML(s, pre)).join('\n')}
</div>
${o.cards ? cardsHTML(o.cards.list, pre, o.cards.title) : ''}
<div class="pg-body">
${(o.linkGroups || []).map((g) => linksHTML(g.title, g.links, pre)).join('\n')}
</div>
</main>
<footer class="pg-foot"><div class="pg-wrap">
<div><h2>Flore &amp; Chenilles</h2><p>Bouquets et décorations en fleurs éternelles en fil chenille, façonnés à la main avec passion dans mon atelier de ${esc(CITY)}, dans les Ardennes.</p><p><a href="${pre}">Découvrir le site</a> · <a href="${esc(IG)}" target="_blank" rel="noopener">Instagram</a></p></div>
<div><h2>Sur le site</h2><ul><li><a href="${pre}#boutique">Mes créations</a></li><li><a href="${pre}#bouquet">Votre bouquet à vous</a></li><li><a href="${pre}#occasions">Occasions</a></li><li><a href="${pre}#livraison">Livraison &amp; retrait</a></li><li><a href="${pre}#contact">Contact</a></li></ul></div>
<div><h2>Guides</h2><ul><li><a href="${pre}guide/">Toutes les pages</a></li><li><a href="${pre}conseils/fleur-en-fil-chenille/">La fleur en fil chenille</a></li><li><a href="${pre}conseils/prix-bouquet-fil-chenille/">Le prix d’un bouquet</a></li><li><a href="${pre}conseils/idees-messages-carte/">Idées de messages</a></li><li><a href="${pre}livraison-fleurs-signy-l-abbaye/">Livraison autour de ${esc(CITY)}</a></li></ul></div>
</div></footer>
</body>
</html>
`;
  pages.push({ path: o.path, html, priority: o.priority || 0.6 });
}

/* ---------- Liens communs ---------- */
const flowerLink = (f) => ({ name: f.name + ' en fil chenille', path: `fleurs/${f.slug}/` });
const occasionLink = (o) => ({ name: o.name, path: `occasions/${o.slug}/` });
const conseilLink = (c) => ({ name: c.name, path: `conseils/${c.slug}/` });
const localLink = (l) => ({ name: l.name, path: `${l.slug}/` });
const productLD = (p, url) => {
  const v = priceOf(p);
  const imgs = pics(p).map((ph) => BASE + ph.l);
  const o = {
    '@type': 'Product',
    name: p.name,
    description: p.desc || catText(p),
    sku: p.id,
    category: catName(p.category),
    brand: { '@type': 'Brand', name: 'Flore & Chenilles' },
    image: imgs.length ? imgs : [BASE + 'assets/img/og-image.png'],
    url
  };
  if (v != null) o.offers = { '@type': 'Offer', price: v.toFixed(2), priceCurrency: 'EUR', availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', url, seller: { '@id': BASE + '#atelier' } };
  return o;
};
function catText(p) {
  if (p.category === 'unite') return 'Une fleur éternelle en fil chenille, façonnée à la main dans mon atelier des Ardennes : elle ne fane pas, ne demande pas d’eau et se garde des années.';
  if (p.category === 'deco') return 'Une décoration fleurie en fil chenille, faite main dans mon atelier des Ardennes, à poser sur une table, une étagère ou un buffet.';
  return 'Un bouquet de fleurs éternelles en fil chenille, façonné à la main dans mon atelier des Ardennes : il ne fane pas, ne demande pas d’eau et ne libère aucun pollen.';
}

/* ---------- Pages des créations ---------- */
products.forEach((p) => {
  const pth = creationPath(p);
  const url = BASE + pth;
  const ui = unitInfo(p);
  const flowerPages = flowersOf.get(p.id) || (ui ? [C.flowers.find((f) => f.slug === ui.flower)] : []);
  const occ = occasionsOf.get(p.id) || [];
  const ph = pics(p);
  const name = p.name;
  const isBouquetName = /bouquet/i.test(name);
  const h1 = p.id === 'fleur-unite' ? 'Fleur à l’unité en fil chenille, au choix' : isBouquetName ? name : name + ' en fil chenille';
  const kind = p.category === 'unite' ? 'fleur éternelle' : p.category === 'deco' ? 'déco faite main' : 'bouquet éternel';
  const title = p.id === 'fleur-unite' ? `Fleur à l’unité en fil chenille au choix, ${fmt(UNIT)} | Flore & Chenilles` : `${isBouquetName ? name + ' en fil chenille' : h1}, ${kind} | Flore & Chenilles`;
  const v = priceOf(p);
  let intro = p.desc || '';
  if (!intro && ui) {
    const f = C.flowers.find((x) => x.slug === ui.flower);
    intro = `${ui.fem ? 'Une' : 'Un'} ${lcFirst(name)} en fil chenille, ${ui.fem ? 'façonnée' : 'façonné'} à la main dans mon atelier des Ardennes. ${ui.fem ? 'Elle' : 'Il'} ne fane pas, ne demande pas d’eau et se garde des années, dans sa pochette transparente fermée d’un nœud.`;
  }
  const desc = clip(ui
    ? `${name} en fil chenille, ${ui.fem ? 'façonnée' : 'façonné'} à la main dans les Ardennes : une fleur éternelle qui ne fane jamais, ${priceLabel(p)}, emballée avec sa carte de vœux offerte. Bocal en option.`
    : `${name} en fil chenille : ${lcFirst(clip(intro || catText(p), 84))} ${v != null ? priceLabel(p) + ', ' : ''}fait main dans les Ardennes, carte de vœux offerte.`, 158);
  const sections = [];
  const first = { h: 'La création', p: [intro || catText(p)] };
  if (p.words) first.quote = { text: p.words, cite: 'Laurine, Flore & Chenilles' };
  if (p.composition && p.composition.length) first.ul = p.composition.map((c) => `${(S.colors[c.color] || {}).name || c.color} : ${c.text}`);
  if (p.count) first.p.push(`Ce bouquet compte ${p.count} fleurs, à ${fmt(UNIT)} la fleur ; le feuillage est offert.`);
  if (p.priceFrom) first.p.push('Ses fleurs se regardent des deux côtés : le prix dépend de sa taille, je vous le confirme avec votre demande.');
  sections.push(first);
  const incl = ['Façonné à la main, à la commande, dans mon atelier de ' + CITY + '.', 'Emballé dans une pochette transparente fermée d’un nœud.', 'Une carte de vœux offerte, avec le message de votre choix.'];
  if (p.gift) incl.push(p.gift + ' avec cette création.');
  if (p.category === 'unite') incl.push(`Sur demande, la fleur peut être fixée à l’intérieur d’un bocal transparent, pour ${fmt(JAR)} de plus : protégée de la pluie et du vent, elle peut fleurir une sépulture.`);
  sections.push({ h: 'Ce qui est compris', ul: incl, tint: 'mint' });
  const fp = flowerPages[0];
  if (ui && fp) {
    sections.push({ h: 'Le langage des fleurs', p: [`Dans le langage des fleurs, ${C.colors[ui.color] || 'chaque couleur a son message'}. ${fp.langage}`], tint: 'tint' });
  } else if (fp) {
    sections.push({ h: 'Le langage des fleurs', p: [fp.langage], tint: 'tint' });
  }
  sections.push({ h: 'Commander', ol: [`Ouvrez [cette création sur le site](#creation-${p.id}) et ajoutez-la à votre sélection.`, 'Écrivez le message de votre carte de vœux, offerte.', `Envoyez votre demande : je vous confirme la date. Retrait gratuit à l’atelier de ${CITY}, ou livraison à 5 € jusqu’à 15 km et 10 € jusqu’à 25 km.`] });
  const related = [];
  const push = (id) => { const x = byId.get(id); if (x && x.id !== p.id && !related.includes(x)) related.push(x); };
  flowerPages.forEach((f) => f.products.forEach(push));
  products.filter((x) => x.category === p.category).forEach((x) => push(x.id));
  page({
    path: pth,
    title,
    desc,
    h1,
    eyebrow: catName(p.category) + ' · fait main',
    image: ph[0] ? ph[0].l : null,
    imageAlt: name + ' en fil chenille, création Flore & Chenilles',
    price: priceLabel(p),
    priceNote: p.count ? `${p.count} fleurs × ${fmt(UNIT)}` : p.category === 'unite' ? 'la fleur' : '',
    lead: p.category === 'unite' ? 'Une fleur éternelle, emballée et prête à offrir, avec sa carte de vœux.' : 'Fait main dans les Ardennes, emballé avec soin, avec sa carte de vœux offerte.',
    tags: [p.gift ? { label: p.gift, cls: /pot/i.test(p.gift) ? 'is-mint' : 'is-pink' } : null, p.category === 'unite' ? { label: 'Bocal en option', cls: 'is-sky' } : null, { label: 'Carte de vœux offerte' }, { label: 'Sans pollen', cls: 'is-mint' }].filter(Boolean),
    ctas: [{ label: 'Commander sur le site', href: `#creation-${p.id}` }, { label: 'Composer mon bouquet', href: '#bouquet' }],
    sections,
    cards: { title: 'Vous aimerez aussi', list: related.slice(0, 8) },
    linkGroups: [
      { title: 'À découvrir aussi', links: [].concat(flowerPages.filter(Boolean).map(flowerLink), occ.map(occasionLink), [conseilLink(C.conseils[0]), conseilLink(C.conseils.find((c) => c.slug === 'prix-bouquet-fil-chenille'))]) }
    ],
    crumbs: [{ name: 'Créations', path: 'guide/' }, { name: name, path: pth }],
    ogType: 'product',
    priority: 0.7,
    ld: [productLD(p, url)]
  });
});

/* ---------- Pages des fleurs ---------- */
C.flowers.forEach((f) => {
  const pth = `fleurs/${f.slug}/`;
  const list = f.products.map((id) => byId.get(id)).filter(Boolean);
  const hero = findCreation(f.hero) || list[0];
  const sections = [
    { h: `${THE[f.slug] || f.name} en fil chenille`, p: f.intro },
    { h: 'Le langage des fleurs', p: [f.langage], tint: 'tint' },
    { h: 'Dans mes créations', p: f.usage },
    { h: 'Bon à savoir', p: [f.tip, `Une fleur à l’unité coûte ${fmt(UNIT)}, et un bouquet ${fmt(UNIT)} par fleur, feuillage offert. Chaque création est emballée dans une pochette transparente fermée d’un nœud, avec sa carte de vœux offerte.`], tint: 'mint' }
  ];
  page({
    path: pth,
    title: f.title + ' | Flore & Chenilles',
    desc: f.desc,
    h1: f.title.split(' : ')[0],
    eyebrow: 'Les fleurs de l’atelier',
    image: hero ? pics(hero)[0].l : null,
    imageAlt: f.name + ' en fil chenille, création Flore & Chenilles',
    lead: f.intro[0],
    tags: [{ label: 'Fait main' }, { label: 'Sans pollen', cls: 'is-mint' }, { label: 'Ne fane jamais', cls: 'is-pink' }],
    ctas: [{ label: 'Voir les créations', href: '#boutique' }, { label: 'Composer mon bouquet', href: '#bouquet' }],
    sections,
    cards: { title: `Mes créations avec ${WITH[f.slug] || 'ces fleurs'}`, list },
    linkGroups: [
      { title: 'Les autres fleurs', links: C.flowers.filter((x) => x !== f).map(flowerLink) },
      { title: 'Idées et conseils', links: C.occasions.slice(0, 5).map(occasionLink).concat(C.conseils.slice(0, 3).map(conseilLink)) }
    ],
    crumbs: [{ name: 'Les fleurs', path: 'guide/' }, { name: f.name, path: pth }],
    priority: 0.8,
    ld: [{ '@type': 'CollectionPage', name: f.title, description: f.desc, url: BASE + pth, inLanguage: 'fr-FR', isPartOf: { '@type': 'WebSite', url: BASE, name: 'Flore & Chenilles' }, mainEntity: { '@type': 'ItemList', itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: BASE + creationPath(p), name: p.name })) } }]
  });
});

/* ---------- Pages des occasions, des conseils et pages locales ---------- */
function contentPage(o, kind) {
  const base = kind === 'occasion' ? 'occasions/' : kind === 'conseil' ? 'conseils/' : '';
  const pth = `${base}${o.slug}/`;
  const list = o.products.map((id) => byId.get(id)).filter(Boolean);
  const hero = o.hero === 'about' ? null : findCreation(o.hero) || list[0];
  const image = o.hero === 'about' ? 'assets/photos/about.jpg' : hero ? pics(hero)[0].l : null;
  const sections = o.sections.map((s) => {
    if (!s.examples) return s;
    const ex = products.filter((p) => p.count && !p.priceFrom).sort((a, b) => a.count - b.count);
    const pick = [ex[0], ex[Math.floor(ex.length / 3)], ex[Math.floor((2 * ex.length) / 3)], ex[ex.length - 1]].filter((x, i, a) => x && a.indexOf(x) === i);
    return Object.assign({}, s, { ul: pick.map((p) => `[${p.name}](creation:${p.id}) : ${p.count} fleurs, ${fmt(priceOf(p))}${p.gift ? ', ' + p.gift.toLowerCase() : ''}.`) });
  });
  const eyebrow = kind === 'occasion' ? 'Une idée pour chaque occasion' : kind === 'conseil' ? 'Conseils & savoir-faire' : 'Près de chez vous';
  const others = kind === 'occasion' ? C.occasions : kind === 'conseil' ? C.conseils : C.local;
  const link = kind === 'occasion' ? occasionLink : kind === 'conseil' ? conseilLink : localLink;
  const ld = kind === 'conseil'
    ? [{ '@type': 'Article', headline: o.title, description: o.desc, image: image ? [BASE + image] : undefined, author: { '@type': 'Organization', name: 'Flore & Chenilles', url: BASE }, publisher: { '@id': BASE + '#atelier' }, datePublished: FIRST_PUBLISHED, dateModified: TODAY, mainEntityOfPage: BASE + pth, inLanguage: 'fr-FR' }, ORG]
    : [{ '@type': 'WebPage', name: o.title, description: o.desc, url: BASE + pth, inLanguage: 'fr-FR', about: { '@id': BASE + '#atelier' }, mainEntity: { '@type': 'ItemList', itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: BASE + creationPath(p), name: p.name })) } }, ORG];
  page({
    path: pth,
    title: o.title.includes('Flore & Chenilles') ? o.title : o.title + ' | Flore & Chenilles',
    desc: o.desc,
    h1: kind === 'conseil' ? o.name : o.title.replace(/ \| Flore & Chenilles$/, '').split(' : ')[0],
    eyebrow,
    image,
    imageAlt: o.name + ', créations en fil chenille Flore & Chenilles',
    lead: o.lead,
    tags: kind === 'local' ? [{ label: 'Retrait gratuit à l’atelier', cls: 'is-mint' }, { label: 'Livraison 5 € / 10 €', cls: 'is-sky' }] : [{ label: 'Carte de vœux offerte' }, { label: 'Fait main dans les Ardennes', cls: 'is-pink' }],
    ctas: [o.cta || { label: 'Voir les créations', href: '#boutique' }, kind === 'local' ? { label: 'Me contacter', href: '#contact' } : { label: 'Composer mon bouquet', href: '#bouquet' }],
    sections,
    cards: { title: kind === 'conseil' ? 'Quelques créations' : 'Mes idées de créations', list },
    linkGroups: [
      { title: kind === 'occasion' ? 'Les autres occasions' : kind === 'conseil' ? 'Les autres conseils' : 'À voir aussi', links: others.filter((x) => x !== o).map(link).concat(kind === 'local' ? C.conseils.slice(0, 3).map(conseilLink) : []) },
      { title: 'Les fleurs de l’atelier', links: C.flowers.map(flowerLink) }
    ],
    crumbs: [{ name: kind === 'occasion' ? 'Occasions' : kind === 'conseil' ? 'Conseils' : 'Près de chez vous', path: 'guide/' }, { name: o.name, path: pth }],
    priority: kind === 'conseil' ? 0.6 : 0.8,
    ld
  });
}
C.occasions.forEach((o) => contentPage(o, 'occasion'));
C.conseils.forEach((o) => contentPage(o, 'conseil'));
C.local.forEach((o) => contentPage(o, 'local'));

/* ---------- Plan des pages ---------- */
(function hub() {
  const pre = prefixFor('guide/');
  const group = (title, links) => ({ h: title, html: `<ul class="pg-links">${links.map((l) => `<li><a href="${pre}${l.path}">${fr(esc(l.name))}</a></li>`).join('')}</ul>` });
  const cats = (S.categories || []).filter((c) => c.id !== 'all');
  page({
    path: 'guide/',
    title: 'Guide des fleurs éternelles en fil chenille | Flore & Chenilles',
    desc: 'Les fleurs en fil chenille, des idées pour chaque occasion, des conseils, la livraison autour de Signy-l’Abbaye et toutes les créations faites main.',
    h1: 'Le guide des fleurs éternelles',
    eyebrow: 'Flore & Chenilles',
    image: 'assets/photos/about.jpg',
    imageAlt: 'Fleurs en fil chenille de l’atelier Flore & Chenilles',
    lead: 'Les fleurs de l’atelier, des idées pour chaque occasion, des conseils et toutes mes créations faites main dans les Ardennes.',
    ctas: [{ label: 'Découvrir le site', href: '#boutique' }, { label: 'Composer mon bouquet', href: '#bouquet' }],
    sections: [
      group('Les fleurs', C.flowers.map(flowerLink)),
      group('Pour chaque occasion', C.occasions.map(occasionLink)),
      group('Conseils & savoir-faire', C.conseils.map(conseilLink)),
      group('Près de chez vous', C.local.map(localLink))
    ].concat(cats.map((c) => group(c.name, products.filter((p) => p.category === c.id).map((p) => ({ name: `${p.name} · ${priceLabel(p)}`, path: creationPath(p) }))))),
    crumbs: [{ name: 'Guide', path: 'guide/' }],
    priority: 0.5,
    ld: [{ '@type': 'CollectionPage', name: 'Le guide des fleurs éternelles', url: BASE + 'guide/', inLanguage: 'fr-FR', isPartOf: { '@type': 'WebSite', url: BASE, name: 'Flore & Chenilles' } }]
  });
})();

/* ---------- Écriture ---------- */
const OUT_DIRS = ['creations', 'fleurs', 'occasions', 'conseils', 'guide'].concat(C.local.map((l) => l.slug));
OUT_DIRS.forEach((d) => fs.rmSync(path.join(ROOT, d), { recursive: true, force: true }));
pages.forEach((pg) => {
  const dir = path.join(ROOT, pg.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pg.html);
});
const urls = [{ loc: BASE, priority: 1.0 }].concat(pages.map((pg) => ({ loc: BASE + pg.path, priority: pg.priority })));
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${TODAY}</lastmod><priority>${u.priority.toFixed(1)}</priority></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}sitemap.xml\n`);
console.log(`${pages.length} pages générées, sitemap de ${urls.length} adresses (${BASE})`);
