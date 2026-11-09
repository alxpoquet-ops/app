// Composants HTML réutilisables
const { site, hours, tarifs, kmTiers, communes, tierFor } = require('../config');
const { icon } = require('./icons');
const { md, inline, esc, plain } = require('./md');
const { mainServices } = require('../content/services-list');

// ---------------------------------------------------------------- registre des pages
const registry = new Map(); // path -> { label, desc, icon }
function register(path, info) {
  registry.set(path, info);
}
function label(path) {
  const r = registry.get(path);
  if (!r) {
    if (process.env.LENIENT) return path;
    throw new Error('Lien interne vers une page inconnue : ' + path);
  }
  return r.label;
}

const tel = `tel:${site.phoneIntl}`;
const waUrl = (msg = site.whatsappMessage) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;
const devisUrl = (prestation, commune) => {
  const q = [];
  if (prestation) q.push('prestation=' + encodeURIComponent(prestation));
  if (commune) q.push('commune=' + encodeURIComponent(commune));
  return '/devis/' + (q.length ? '?' + q.join('&') : '');
};
const euro = (n) => `${n} €`;

// ---------------------------------------------------------------- logo
const logoSvg = (id = 'lg') => `<svg class="logo" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3CC8FF"/><stop offset=".55" stop-color="#1D6BFF"/><stop offset="1" stop-color="#1446B8"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(#${id})"/><path d="M27.5 7 13 27h9.2l-2.7 14L35 20.5h-9.4L27.5 7Z" fill="#fff"/></svg>`;

// ---------------------------------------------------------------- boutons
function btnCall(cls = 'btn-primary', text) {
  return `<a class="btn ${cls}" href="${tel}" data-track="call">${icon('phone')}<span>${text || 'Appeler le ' + site.phoneDisplay}</span></a>`;
}
function btnDevis(cls = 'btn-light', prestation, text = 'Demander un devis') {
  return `<a class="btn ${cls}" href="${devisUrl(prestation)}">${icon('file-text')}<span>${text}</span></a>`;
}
function btnWa(cls = 'btn-wa', text = 'WhatsApp', msg) {
  return `<a class="btn ${cls}" href="${waUrl(msg)}" target="_blank" rel="noopener" data-track="whatsapp">${icon('whatsapp')}<span>${text}</span></a>`;
}

// ---------------------------------------------------------------- fil d'Ariane
function breadcrumbs(items) {
  return `<nav class="crumbs" aria-label="Fil d’Ariane"><ol>${items
    .map((it, i) =>
      i < items.length - 1
        ? `<li><a href="${it.path}">${esc(it.name)}</a></li>`
        : `<li aria-current="page">${esc(it.name)}</li>`
    )
    .join('')}</ol></nav>`;
}

// ---------------------------------------------------------------- en-tête de page intérieure
function pageHero({ kicker, h1, lead, crumbs, prestation, chips = [], compact = false }) {
  return `<section class="page-hero${compact ? ' page-hero--compact' : ''}">
  ${circuitBg('ph')}
  <div class="container page-hero-in">
    ${crumbs ? breadcrumbs(crumbs) : ''}
    ${kicker ? `<p class="eyebrow"><span class="pulse" aria-hidden="true"></span>${esc(kicker)}</p>` : ''}
    <h1>${inline(h1)}</h1>
    ${lead ? `<p class="lead">${inline(lead)}</p>` : ''}
    ${chips.length ? `<ul class="chips">${chips.map((c) => `<li>${icon(c.icon || 'check')}${inline(c.text)}</li>`).join('')}</ul>` : ''}
    ${compact ? '' : `<div class="hero-ctas">${btnCall('btn-primary btn-lg')}${btnDevis('btn-light btn-lg', prestation)}</div>`}
  </div>
</section>`;
}

// Fond « circuit » lumineux (décoratif)
function circuitBg(id = 'c') {
  return `<div class="circuit" aria-hidden="true"><svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#3CC8FF" stop-opacity="0"/><stop offset=".5" stop-color="#3CC8FF"/><stop offset="1" stop-color="#1D6BFF" stop-opacity="0"/></linearGradient></defs>
<g class="traces" fill="none" stroke="currentColor" stroke-width="1.2">
<path d="M0 120h220l40 40h260l30-30h170"/><path d="M1200 90H960l-40 40H760"/><path d="M0 470h140l50-50h210l40 40h180"/><path d="M1200 420h-180l-60 60H780l-30-30H640"/><path d="M700 0v70l40 40v90"/><path d="M380 600v-80l-40-40v-70"/><path d="M1040 600v-90l40-40v-60"/></g>
<g class="nodes" fill="currentColor"><circle cx="720" cy="130" r="4"/><circle cx="760" cy="130" r="4"/><circle cx="640" cy="450" r="4"/><circle cx="740" cy="200" r="4"/><circle cx="340" cy="410" r="4"/><circle cx="1080" cy="410" r="4"/><circle cx="580" cy="460" r="4"/></g>
<g class="flow" fill="none" stroke="url(#${id}g)" stroke-width="2.4" stroke-linecap="round"><path d="M0 120h220l40 40h260l30-30h170"/><path d="M1200 420h-180l-60 60H780l-30-30H640"/><path d="M0 470h140l50-50h210l40 40h180"/></g>
</svg></div>`;
}

// ---------------------------------------------------------------- bandeau de confiance
function trustBar() {
  const items = [
    ['moon', 'Soirs & week-ends', 'Sur rendez-vous'],
    ['badge-check', 'Norme NF C 15-100', 'Travail conforme et soigné'],
    ['euro', 'Tarifs affichés', 'Prix annoncé avant travaux'],
    ['map-pin', 'Artisan local', 'Basé à Signy-l’Abbaye'],
  ];
  return `<section class="trustbar" aria-label="Nos engagements"><div class="container trustbar-in">${items
    .map(([i, t, s]) => `<div class="trust-item">${icon(i)}<div><strong>${t}</strong><span>${s}</span></div></div>`)
    .join('')}</div></section>`;
}

// ---------------------------------------------------------------- cartes de services
function serviceCards(list = mainServices, opts = {}) {
  return `<div class="grid grid-cards${opts.cols === 4 ? ' grid-4' : ''}">${list
    .map(
      (s) => `<a class="card card-service reveal" href="${s.path}">
  <span class="icon-tile">${icon(s.icon)}</span>
  <h3>${esc(s.name)}</h3>
  ${s.short ? `<p>${esc(s.short)}</p>` : ''}
  <span class="card-more">En savoir plus ${icon('arrow-right')}</span>
</a>`
    )
    .join('')}</div>`;
}

// ---------------------------------------------------------------- disponibilités
function hoursTable(cls = '') {
  return `<table class="hours ${cls}"><caption class="sr-only">Horaires d’intervention, sur rendez-vous</caption><tbody>${hours
    .map((h) => `<tr><th scope="row">${h.days}</th><td>${h.label}</td></tr>`)
    .join('')}</tbody></table>`;
}

function dispoCard() {
  return `<aside class="dispo-card reveal" aria-label="Disponibilités et tarifs clés">
  <div class="dispo-head"><span class="dot" aria-hidden="true"></span><span data-dispo>Créneaux en soirée et le week-end</span></div>
  ${hoursTable('hours-dark')}
  <p class="dispo-note">${icon('calendar-days')} Uniquement sur rendez-vous — appelez ou envoyez un message.</p>
  <ul class="dispo-prices">
    <li><span>Diagnostic de panne</span><strong>${euro(79)}</strong></li>
    <li><span>Déplacement</span><strong>dès ${euro(20)}</strong></li>
    <li><span>Remplacement de prise</span><strong>dès ${euro(35)}</strong></li>
  </ul>
  ${btnCall('btn-primary btn-block', 'Appeler maintenant')}
  ${btnWa('btn-wa btn-block', 'Écrire sur WhatsApp')}
</aside>`;
}

// ---------------------------------------------------------------- grille tarifaire
function pricingTable(ids) {
  const list = ids ? tarifs.filter((t) => ids.includes(t.id)) : tarifs;
  return `<div class="price-table" role="table" aria-label="Grille tarifaire">
  ${list
    .map(
      (t) => `<div class="price-row" role="row">
    <div class="price-label" role="cell">${icon(t.icon)}<div><strong>${t.label}</strong><span>${esc(t.note)}</span></div></div>
    <div class="price-value" role="cell">${t.price == null ? '<b>Sur devis</b>' : `${t.from ? '<small>à partir de</small>' : ''}<b>${euro(t.price)}</b>`}</div>
  </div>`
    )
    .join('')}
  <p class="price-foot">Prix TTC${site.legal.tva ? ' — ' + esc(site.legal.tva) : ''}. Tarifs identiques en soirée et le week-end. Le montant exact est toujours annoncé avant toute intervention.</p>
</div>`;
}

function kmTable() {
  return `<div class="km-grid">${kmTiers
    .map(
      (t, i) => `<div class="km-tier km-${i}"><span class="km-range">${t.label}</span><strong>${t.text}</strong><small>${
        t.supplement === 0 ? 'Déplacement de base : 20 €' : t.supplement ? `Déplacement : ${20 + t.supplement} €` : 'Forfait annoncé à l’avance'
      }</small></div>`
    )
    .join('')}</div><p class="small muted">Distance calculée par la route depuis Signy-l’Abbaye jusqu’à votre adresse. Le supplément vous est toujours confirmé au téléphone, avant le déplacement.</p>`;
}

// Badge distance pour une commune
function distanceBadge(name) {
  const c = communes.find((x) => x.name === name);
  if (!c) return '';
  const t = tierFor(c.km);
  const sup = c.note || (t.supplement === 0 ? 'Sans supplément kilométrique' : t.supplement ? `Supplément kilométrique : ${t.text}` : 'Déplacement sur devis');
  return `<div class="distance-badge">${icon('route')}<div><strong>${c.km === 0 ? 'Commune de base d’ALED08' : `≈ ${c.km} km de Signy-l’Abbaye`}</strong><span>${sup}</span></div></div>`;
}

// ---------------------------------------------------------------- étapes
function steps(list) {
  return `<ol class="steps">${list
    .map((s, i) => `<li class="step reveal"><span class="step-num">${i + 1}</span><div><h3>${esc(s.t)}</h3><p>${inline(s.d)}</p></div></li>`)
    .join('')}</ol>`;
}

// ---------------------------------------------------------------- cas concrets
function cases(list, title = 'Cas concrets') {
  if (!list || !list.length) return '';
  return `<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">Sur le terrain</p><h2>${esc(title)}</h2></div>
  <div class="grid grid-cases">${list
    .map(
      (c) => `<article class="card case reveal"><span class="case-tag">${icon(c.icon || 'wrench')}${esc(c.tag || 'Intervention type')}</span><h3>${inline(c.title)}</h3><p>${inline(c.text)}</p>${
        c.result ? `<p class="case-result">${icon('circle-check')}<span>${inline(c.result)}</span></p>` : ''
      }</article>`
    )
    .join('')}</div>
  <p class="small muted center" style="margin-top:20px">Exemples types d’interventions, présentés pour illustrer la démarche. Chaque situation est évaluée sur place.</p>
</div></section>`;
}

// ---------------------------------------------------------------- FAQ
function faq(list, title = 'Questions fréquentes', id = 'faq') {
  if (!list || !list.length) return { html: '', schema: null };
  const html = `<section class="section" id="${id}"><div class="container container-narrow">
  <div class="section-head"><p class="kicker">FAQ</p><h2>${esc(title)}</h2></div>
  <div class="faq">${list
    .map((f) => `<details class="faq-item reveal"><summary>${inline(f.q)}${icon('chevron-down')}</summary><div class="faq-a">${md(f.a)}</div></details>`)
    .join('')}</div>
</div></section>`;
  const schema = {
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
  };
  return { html, schema };
}

// ---------------------------------------------------------------- appel à l'action
function ctaBand({ title, text, prestation } = {}) {
  return `<section class="cta-band"><div class="container">
  <div class="cta-box reveal">
    ${circuitBg('cta')}
    <div class="cta-copy">
      <h2>${inline(title || 'Un souci électrique ? Parlons-en ce soir.')}</h2>
      <p>${inline(text || 'Appelez ou envoyez un message : je vous rappelle pour fixer un créneau en soirée ou le week-end, avec le prix annoncé à l’avance.')}</p>
    </div>
    <div class="cta-actions">
      ${btnCall('btn-primary btn-lg')}
      ${btnDevis('btn-light btn-lg', prestation, 'Demande de devis gratuit')}
      ${btnWa('btn-wa btn-lg')}
    </div>
  </div>
</div></section>`;
}

// Petit encart CTA dans le contenu
function inlineCta({ title, text, prestation } = {}) {
  return `<aside class="inline-cta reveal">
  <div><strong>${inline(title || 'Besoin d’un électricien ?')}</strong><p>${inline(text || 'Devis gratuit, tarifs annoncés à l’avance, interventions en soirée et le week-end.')}</p></div>
  <div class="inline-cta-actions">${btnDevis('btn-primary', prestation, 'Demander un devis')}${btnCall('btn-ghost', site.phoneDisplay)}</div>
</aside>`;
}

// ---------------------------------------------------------------- liens internes
function relatedLinks(paths, title = 'Pages utiles') {
  if (!paths || !paths.length) return '';
  return `<nav class="related" aria-label="${esc(title)}"><h2 class="h3">${esc(title)}</h2><ul>${paths
    .map((p) => `<li><a href="${p}">${icon('chevron-right')}<span>${esc(label(p))}</span></a></li>`)
    .join('')}</ul></nav>`;
}

// ---------------------------------------------------------------- avis
function reviewsBlock(reviews, limit = 6) {
  const list = reviews.slice(0, limit);
  return `<section class="section section-alt" id="avis"><div class="container">
  <div class="section-head"><p class="kicker">Avis clients</p><h2>Ils m’ont fait confiance</h2>
  ${site.demoReviews ? '<p class="demo-flag">' + icon('info') + 'Avis d’exemple — en attente des premiers avis clients publiés.</p>' : ''}</div>
  <div class="grid grid-reviews">${list
    .map(
      (r) => `<figure class="card review reveal"><div class="stars" aria-label="Note : ${r.rating} sur 5">${icon('star').repeat(r.rating)}</div>
    <blockquote><p>${esc(r.text)}</p></blockquote>
    <figcaption><strong>${esc(r.name)}</strong><span>${esc(r.city)} · ${esc(r.service)}</span></figcaption></figure>`
    )
    .join('')}</div>
  ${site.googleReviewsUrl ? `<p class="center"><a class="btn btn-ghost" href="${site.googleReviewsUrl}" target="_blank" rel="noopener">${icon('star')}<span>Voir les avis Google</span></a></p>` : ''}
</div></section>`;
}

// ---------------------------------------------------------------- galerie avant / après
function beforeAfter(items) {
  return `<div class="grid grid-ba">${items
    .map(
      (g, i) => `<figure class="ba reveal">
  <div class="ba-frame" style="--pos:50%">
    <img src="${g.after}" alt="${esc(g.altAfter)}" width="800" height="560" loading="lazy" decoding="async">
    <div class="ba-before"><img src="${g.before}" alt="${esc(g.altBefore)}" width="800" height="560" loading="lazy" decoding="async"></div>
    <span class="ba-label ba-l">Avant</span><span class="ba-label ba-r">Après</span>
    <span class="ba-handle" aria-hidden="true"></span>
    <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Comparer avant et après : ${esc(g.title)}">
  </div>
  <figcaption><strong>${esc(g.title)}</strong><span>${esc(g.text)}</span></figcaption>
</figure>`
    )
    .join('')}</div>`;
}

// ---------------------------------------------------------------- carte Google Maps (après consentement)
function mapEmbed(query = "Signy-l'Abbaye 08460", titleText = 'Carte de la zone d’intervention autour de Signy-l’Abbaye') {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=10&output=embed`;
  return `<div class="map" data-map-src="${esc(src)}" data-map-title="${esc(titleText)}">
  <div class="map-placeholder">
    ${icon('map-pin')}
    <p><strong>Carte Google Maps</strong><br>L’affichage de la carte dépose des cookies de Google. Elle ne se charge qu’avec votre accord.</p>
    <button type="button" class="btn btn-primary" data-map-load>${icon('eye')}<span>Afficher la carte</span></button>
    <a class="small" href="${esc(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`)}" target="_blank" rel="noopener">Ouvrir dans Google Maps</a>
  </div>
</div>`;
}

// ---------------------------------------------------------------- liste des communes
function communesList(opts = {}) {
  const groups = kmTiers.map((t, i) => ({
    tier: t,
    items: communes.filter((c) => tierFor(c.km) === t),
  }));
  return `<div class="communes">${groups
    .map(
      (g) => `<div class="communes-group"><h3><span>${g.tier.label}</span><em>${g.tier.text}</em></h3><ul>${g.items
        .map((c) => `<li>${c.page ? `<a href="/${c.page}/">${esc(c.name)}</a>` : esc(c.name)}<small>${c.km} km</small></li>`)
        .join('')}</ul></div>`
    )
    .join('')}</div>`;
}

module.exports = {
  register, label, registry, tel, waUrl, devisUrl, euro, logoSvg,
  btnCall, btnDevis, btnWa, breadcrumbs, pageHero, circuitBg, trustBar, serviceCards, hoursTable, dispoCard,
  pricingTable, kmTable, distanceBadge, steps, cases, faq, ctaBand, inlineCta, relatedLinks, reviewsBlock,
  beforeAfter, mapEmbed, communesList,
};
