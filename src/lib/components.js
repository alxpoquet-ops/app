// Composants HTML réutilisables
const { site, hours, forfait, tarifs, kmTiers, communes, secteurs, tierFor } = require('../config');
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
const logoSvg = (id = 'lg') => `<svg class="logo" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#F39B00"/></linearGradient></defs><rect width="48" height="48" rx="15" fill="url(#${id})"/><path d="M27.5 7 13 27h9.2l-2.7 14L35 20.5h-9.4L27.5 7Z" fill="#24304A"/></svg>`;

// ---------------------------------------------------------------- boutons
// Prise de rendez-vous par message (SMS) : c'est le canal à privilégier.
const smsUrl = (body = 'Bonjour, je souhaite prendre rendez-vous pour une intervention électrique.') => `sms:${site.phoneIntl}?body=${encodeURIComponent(body)}`;
function btnCall(cls = 'btn-primary', text) {
  return `<a class="btn ${cls}" href="${smsUrl()}" data-track="sms">${icon('message-circle')}<span>${text || 'Envoyer un SMS'}</span></a>`;
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
    <h1>${inline(h1)}</h1>
    ${lead ? `<p class="lead">${inline(lead)}</p>` : ''}
    ${compact ? '' : `<div class="hero-ctas">${btnCall('btn-primary btn-lg')}${btnWa('btn-wa btn-lg')}${btnDevis('btn-light btn-lg', prestation, 'Devis gratuit')}</div>`}
  </div>
</section>`;
}

// Fond « circuit » lumineux (décoratif)
function circuitBg() {
  return '';
}

// ---------------------------------------------------------------- bandeau de confiance
function trustBar() {
  const items = [
    ['zap', 'Dépannage', 'En priorité'],
    ['plug', 'Installation', 'De la prise au tableau'],
    ['calendar-days', '7 jours sur 7', 'Sur rendez-vous'],
    ['map-pin', 'Toutes les Ardennes', 'Du nord au sud'],
  ];
  return `<section class="trustbar" aria-label="Nos engagements"><div class="container trustbar-in">${items
    .map(([i, t, s]) => `<div class="trust-item">${icon(i)}<div><strong>${t}</strong><span>${s}</span></div></div>`)
    .join('')}</div></section>`;
}

// ---------------------------------------------------------------- cartes de services
function serviceCards(list = mainServices, opts = {}) {
  return `<div class="grid grid-cards${opts.cols === 4 ? ' grid-4' : ''}">${list
    .map(
      (s) => `<a class="card card-service reveal${opts.featured === s.key ? ' card-featured' : ''}" href="${s.path}">
  ${opts.featured === s.key ? `<span class="specialty">${icon('zap')}En priorité</span>` : ''}
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
  return `<table class="hours ${cls}"><caption class="sr-only">Disponibilités : toute la semaine et le week-end, sur rendez-vous</caption><tbody>${hours
    .map((h) => `<tr><th scope="row">${h.days}</th><td>${h.label}</td></tr>`)
    .join('')}</tbody></table>`;
}

function dispoCard() {
  return `<aside class="dispo-card reveal" aria-label="Disponibilités et tarifs clés">
  <div class="dispo-head"><span class="dot" aria-hidden="true"></span><span>Disponible 7 j/7 sur rendez-vous</span></div>
  ${hoursTable('hours-dark')}
  <p class="dispo-note">${icon('calendar-days')} Rendez-vous par message : SMS ou WhatsApp, je vous réponds vite.</p>
  <div class="dispo-forfait">
    <div class="dispo-forfait-head"><span>Forfait dépannage</span><strong class="is-text">${forfait.priceText}</strong></div>
    <ul>${forfait.includes.map((i) => `<li>${icon('check')}${i.text}</li>`).join('')}</ul>
    <p>Prix annoncé par message ou au téléphone, avant de venir. Réparation sur devis, sans obligation.${forfait.notFoundDiscount ? ' <strong>Panne non trouvée : remise sur le forfait.</strong>' : ''}</p>
  </div>
  ${btnCall('btn-primary btn-block', 'Prendre RDV par SMS')}
  ${btnWa('btn-wa btn-block', 'Écrire sur WhatsApp')}
</aside>`;
}

// ---------------------------------------------------------------- forfait dépannage
function forfaitBlock(opts = {}) {
  return `<div class="forfait reveal${opts.compact ? ' forfait--compact' : ''}">
  <div class="forfait-price">
    <span class="forfait-label">${icon('zap')}Forfait dépannage</span>
    <strong class="is-text">Prix annoncé avant de venir</strong>
    <span class="forfait-sub">tout compris jusqu’au devis de réparation</span>
  </div>
  <ul class="forfait-list">${forfait.includes
    .map((i) => `<li>${icon(i.icon)}<div><strong>${i.text}</strong><span>${i.detail}</span></div></li>`)
    .join('')}</ul>
  ${forfait.notFoundDiscount ? `<p class="forfait-guarantee">${icon('shield-check')}<span><strong>Panne non trouvée ?</strong> Je vous fais une remise sur le forfait.</span></p>` : ''}
  <p class="forfait-foot">${icon('info')}<span>Le prix dépend de votre commune et de la panne. La réparation fait l’objet d’un devis à la fin de mon passage : vous l’acceptez ou non. Même prix le soir et le week-end.</span></p>
</div>`;
}

// ---------------------------------------------------------------- grille tarifaire
function pricingTable(ids) {
  const list = ids ? tarifs.filter((t) => ids.includes(t.id)) : tarifs;
  return `<div class="price-table" role="table" aria-label="Grille tarifaire">
  ${list
    .map(
      (t) => `<div class="price-row${t.highlight ? ' price-row--hl' : ''}" role="row">
    <div class="price-label" role="cell">${icon(t.icon)}<div><strong>${t.label}</strong><span>${esc(t.note)}</span></div></div>
    <div class="price-value" role="cell">${t.price == null ? `<b class="price-text">${esc(t.priceText || 'Sur devis')}</b>` : `<b>${euro(t.price)}</b>`}</div>
  </div>`
    )
    .join('')}
  <p class="price-foot">Prix annoncés TTC${site.legal.tva ? ', ' + esc(site.legal.tva) : ''}. Aucun prix de pièce n’est fixé à l’avance : chaque réparation est chiffrée sur devis, après le diagnostic. Tarifs identiques en soirée et le week-end.</p>
</div>`;
}

// Secteurs desservis (remplace l'ancienne grille kilométrique)
function kmTable() {
  return `<div class="km-grid">${secteurs
    .map((s, i) => {
      const towns = s.towns.map((n) => communes.find((c) => c.name === n)).filter((c) => c && c.page).slice(0, 6);
      return `<div class="km-tier km-s${i}"><span class="km-range">Secteur</span><strong class="km-name">${esc(s.name)}</strong>${towns.length ? `<span class="km-towns">${towns.map((c) => `<a href="/${c.page}/">${esc(c.name)}</a>`).join(', ')}…</span>` : ''}</div>`;
    })
    .join('')}</div><p class="small muted">J’interviens dans tout le département. Le prix du forfait vous est toujours annoncé avant le déplacement. Rendez-vous par message, 7 j/7.</p>`;
}

// Le forfait est sur devis : plus de prix par commune.
function forfaitFor() {
  return null;
}

// Badge « intervention dans votre commune »
function distanceBadge(name) {
  const c = communes.find((x) => x.name === name);
  if (!c) return '';
  return `<div class="distance-badge">${icon('map-pin')}<div><strong>J’interviens à ${esc(c.name)}</strong><span>Forfait dépannage sur devis : prix annoncé au téléphone, avant de venir.</span></div></div>`;
}

// ---------------------------------------------------------------- mon passage, étape par étape
const PASSAGE = [
  { icon: 'message-circle', t: 'Avant de venir', d: 'Vous m’envoyez un message (SMS ou WhatsApp) ou vous m’appelez. Je vous annonce le prix du forfait pour votre commune et votre panne, et nous fixons un créneau.' },
  { icon: 'house', t: 'À mon arrivée', d: 'Vous me montrez la panne et le tableau électrique. Je vérifie d’abord qu’il n’y a pas de danger immédiat.' },
  { icon: 'search', t: 'La recherche de panne', d: 'Je teste, j’isole les circuits et je mesure, jusqu’à trouver l’origine du problème. Si je ne la trouve pas, je vous fais une remise sur le forfait.' },
  { icon: 'lightbulb', t: 'L’explication', d: 'Je vous montre ce que j’ai trouvé et je vous présente les solutions possibles, simplement.' },
  { icon: 'file-text', t: 'Le devis', d: 'Je vous remets un devis de réparation écrit. Vous l’acceptez, vous réfléchissez ou vous refusez : aucune obligation.' },
  { icon: 'circle-check', t: 'La suite', d: 'Devis accepté ? Je répare, souvent dans la foulée. Sinon, vous ne réglez que le forfait.' },
];
function passage() {
  return `<ol class="passage">${PASSAGE.map(
    (s, i) => `<li class="passage-step reveal"><span class="passage-ico">${icon(s.icon)}</span><div><p class="passage-n">Étape ${i + 1}</p><h3>${s.t}</h3><p>${s.d}</p></div></li>`
  ).join('')}</ol>`;
}

// ---------------------------------------------------------------- ce que vous payez / ne payez pas
function payBlock() {
  const yes = [
    '<strong>Le forfait dépannage, au prix annoncé avant de venir.</strong> Il comprend le déplacement, la recherche de panne, la proposition de solution et le devis de réparation.',
    '<strong>La réparation</strong>, uniquement si vous acceptez le devis.',
  ];
  const no = [
    'De majoration le soir, le samedi ou le dimanche.',
    'D’heures « au compteur » pendant la recherche de panne.',
    'Le forfait plein tarif si je ne trouve pas l’origine de la panne : je vous fais une remise.',
    'De réparation que vous n’avez pas validée sur devis.',
    'Le devis de vos travaux hors dépannage : il est gratuit.',
  ];
  return `<div class="pay reveal">
  <div class="pay-col pay-yes"><h3>${icon('circle-check')}Ce que vous payez</h3><ul>${yes.map((x) => `<li>${x}</li>`).join('')}</ul></div>
  <div class="pay-col pay-no"><h3>${icon('x')}Ce que vous ne payez jamais</h3><ul>${no.map((x) => `<li>${x}</li>`).join('')}</ul></div>
</div>`;
}

// ---------------------------------------------------------------- présentation de l'artisan
function avatar(cls = '') {
  return site.portrait
    ? `<img class="avatar ${cls}" src="${site.portrait}" alt="${esc(site.name)}, électricien à ${esc(site.address.city)}" width="160" height="160" loading="lazy" decoding="async">`
    : `<span class="avatar avatar-mono ${cls}" aria-hidden="true">${icon('zap')}</span>`;
}
function artisanCard() {
  return `<aside class="artisan reveal" aria-label="${esc(site.name)}, électricien">
  <div class="artisan-id">${avatar()}<div><strong>${site.name}</strong><span>Jeune artisan électricien</span><span>Ardennes (08)</span></div></div>
  <ul class="artisan-facts">
    <li>${icon('zap')}<span><strong>Métier</strong>Dépannage et installation, de la prise au tableau</span></li>
    <li>${icon('euro')}<span><strong>Prix</strong>Annoncé avant de venir</span></li>
    <li>${icon('map-pin')}<span><strong>Secteur</strong>Toutes les Ardennes (08)</span></li>
    <li>${icon('user')}<span><strong>Votre interlocuteur</strong>Je réponds, je me déplace, je répare</span></li>
    <li>${icon('clock')}<span><strong>Disponibilité</strong>Semaine et week-end, RDV par message</span></li>
  </ul>
  ${btnCall('btn-primary btn-block', 'Envoyer un message')}
</aside>`;
}
function authorBox(id = 'lga') {
  return `<div class="author-box">${site.portrait ? avatar('avatar-sm') : logoSvg(id)}<p><strong>${site.name}</strong>, jeune artisan électricien : dépannage et installation électrique, de la prise au tableau. Je me déplace toute la semaine et le week-end, sur rendez-vous, chez les particuliers de toutes les Ardennes. <a href="/qui-suis-je/">Faisons connaissance</a></p></div>`;
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
      <p>${inline(text || 'Envoyez-moi un message : je vous rappelle pour fixer un créneau en soirée ou le week-end, avec le prix annoncé à l’avance.')}</p>
    </div>
    <div class="cta-actions">
      ${btnCall('btn-primary btn-lg')}
      ${btnWa('btn-wa btn-lg')}
      ${btnDevis('btn-light btn-lg', prestation, 'Devis gratuit')}
    </div>
  </div>
</div></section>`;
}

// Petit encart CTA dans le contenu
function inlineCta({ title, text, prestation } = {}) {
  return `<aside class="inline-cta reveal">
  <div><strong>${inline(title || 'Besoin d’un électricien ?')}</strong><p>${inline(text || 'Devis gratuit, tarifs annoncés à l’avance, interventions en soirée et le week-end.')}</p></div>
  <div class="inline-cta-actions">${btnDevis('btn-primary', prestation, 'Demander un devis')}${btnCall('btn-ghost', 'SMS : ' + site.phoneDisplay)}</div>
</aside>`;
}

// ---------------------------------------------------------------- liens internes
function relatedLinks(paths, title = 'Pages utiles') {
  if (!paths || !paths.length) return '';
  return `<nav class="related" aria-label="${esc(title)}"><h2 class="h3">${esc(title)}</h2><ul>${paths
    .map((p) => `<li><a href="${p}">${icon('chevron-right')}<span>${esc(label(p))}</span></a></li>`)
    .join('')}</ul></nav>`;
}

// ---------------------------------------------------------------- avis (réels uniquement)
function reviewsBlock(reviews, limit = 6) {
  const list = (reviews || []).slice(0, limit);
  if (!list.length) return '';
  return `<section class="section section-alt" id="avis"><div class="container">
  <div class="section-head"><p class="kicker">Avis clients</p><h2>Ce qu’en disent les clients</h2></div>
  <div class="grid grid-reviews">${list
    .map(
      (r) => `<figure class="card review reveal"><div class="stars" role="img" aria-label="Note : ${r.rating} sur 5">${icon('star').repeat(r.rating)}</div>
    <blockquote><p>${esc(r.text)}</p></blockquote>
    <figcaption><strong>${esc(r.name)}</strong><span>${esc(r.city)} · ${esc(r.service)}${r.source ? ' · Avis ' + esc(r.source) : ''}</span></figcaption></figure>`
    )
    .join('')}</div>
  ${site.googleReviewsUrl ? `<p class="center" style="margin-top:28px"><a class="btn btn-ghost" href="${site.googleReviewsUrl}" target="_blank" rel="noopener">${icon('star')}<span>Voir tous les avis Google</span></a></p>` : ''}
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
function mapEmbed(query = 'Ardennes, France', titleText = 'Carte de la zone d’intervention : les Ardennes') {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=9&output=embed`;
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
function communesList() {
  return `<div class="communes">${secteurs
    .map(
      (s) => `<div class="communes-group"><h3><span>${esc(s.name)}</span></h3><ul>${s.towns
        .map((n) => communes.find((c) => c.name === n) || { name: n })
        .map((c) => `<li>${c.page ? `<a href="/${c.page}/">${esc(c.name)}</a>` : esc(c.name)}</li>`)
        .join('')}</ul></div>`
    )
    .join('')}</div>`;
}

module.exports = {
  register, label, registry, tel, smsUrl, waUrl, devisUrl, euro, logoSvg,
  btnCall, btnDevis, btnWa, breadcrumbs, pageHero, circuitBg, trustBar, serviceCards, hoursTable, dispoCard,
  forfaitBlock, forfaitFor, pricingTable, kmTable, passage, payBlock, avatar, artisanCard, authorBox, distanceBadge, steps, cases, faq, ctaBand, inlineCta, relatedLinks, reviewsBlock,
  beforeAfter, mapEmbed, communesList,
};
