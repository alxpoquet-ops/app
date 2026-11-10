// Composants HTML réutilisables
const { site, hours, forfait, tarifs, kmTiers, communes, tierFor } = require('../config');
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
    ['zap', 'Spécialiste dépannage', 'Recherche de panne méthodique'],
    ['euro', 'Forfait 79 € TTC', 'Remise si panne non trouvée'],
    ['moon', 'Soirs & week-ends', 'Sans majoration'],
    ['user', `${site.experienceYears} ans de métier`, 'Un seul interlocuteur'],
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
  ${opts.featured === s.key ? `<span class="specialty">${icon('zap')}Ma spécialité</span>` : ''}
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
  <div class="dispo-forfait">
    <div class="dispo-forfait-head"><span>Forfait dépannage</span><strong>${euro(forfait.price)}</strong></div>
    <ul>${forfait.includes.map((i) => `<li>${icon('check')}${i.text}</li>`).join('')}</ul>
    <p>Réparation sur devis, sans obligation.${forfait.notFoundDiscount ? ' <strong>Panne non trouvée : remise sur le forfait.</strong>' : ''}</p>
  </div>
  ${btnCall('btn-primary btn-block', 'Appeler maintenant')}
  ${btnWa('btn-wa btn-block', 'Écrire sur WhatsApp')}
</aside>`;
}

// ---------------------------------------------------------------- forfait dépannage
function forfaitBlock(opts = {}) {
  return `<div class="forfait reveal${opts.compact ? ' forfait--compact' : ''}">
  <div class="forfait-price">
    <span class="forfait-label">${icon('zap')}Forfait dépannage</span>
    <strong>${euro(forfait.price)}<small>TTC</small></strong>
    <span class="forfait-sub">tout compris jusqu’au devis</span>
  </div>
  <ul class="forfait-list">${forfait.includes
    .map((i) => `<li>${icon(i.icon)}<div><strong>${i.text}</strong><span>${i.detail}</span></div></li>`)
    .join('')}</ul>
  ${forfait.notFoundDiscount ? `<p class="forfait-guarantee">${icon('shield-check')}<span><strong>Panne non trouvée ? Je vous fais une remise.</strong> Vous ne payez pas le forfait plein tarif.</span></p>` : ''}
  <p class="forfait-foot">${icon('info')}<span>La réparation et les pièces font l’objet d’un <strong>devis remis à la fin du dépannage</strong> : vous l’acceptez ou non, sans obligation. Au-delà de 15 km : + 10 € (15 à 30 km) ou + 20 € (30 à 45 km). Même prix le soir et le week-end.</span></p>
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
  <p class="price-foot">Prix TTC${site.legal.tva ? ' — ' + esc(site.legal.tva) : ''}. Aucun prix de pièce n’est fixé à l’avance : chaque réparation est chiffrée sur devis, après le diagnostic. Tarifs identiques en soirée et le week-end.</p>
</div>`;
}

function kmTable() {
  return `<div class="km-grid">${kmTiers
    .map((t, i) => {
      const towns = communes.filter((c) => tierFor(c.km) === t && (c.main || c.page)).sort((x, y) => (y.main ? 1 : 0) - (x.main ? 1 : 0) || x.km - y.km).slice(0, 5);
      const price = t.supplement == null ? 'Sur devis' : euro(forfait.price + t.supplement);
      return `<div class="km-tier km-${i}"><span class="km-range">${t.label}</span><strong>${price}</strong><small>${
        t.supplement === 0 ? 'Forfait dépannage, déplacement compris' : t.supplement ? `Forfait ${euro(forfait.price)} ${t.text} de déplacement` : 'Supplément annoncé à l’avance'
      }</small>${towns.length ? `<span class="km-towns">${towns.map((c) => (c.page ? `<a href="/${c.page}/">${esc(c.name)}</a>` : esc(c.name))).join(', ')}…</span>` : ''}</div>`;
    })
    .join('')}</div><p class="small muted">Distance calculée par la route depuis Signy-l’Abbaye jusqu’à votre adresse. Le prix vous est toujours confirmé au téléphone, avant le déplacement.</p>`;
}

// Prix du forfait pour une commune (79 / 89 / 99 € ou null au-delà de 45 km)
function forfaitFor(name) {
  const c = communes.find((x) => x.name === name);
  if (!c) return forfait.price;
  const t = tierFor(c.km);
  return t.supplement == null ? null : forfait.price + t.supplement;
}

// Badge distance pour une commune
function distanceBadge(name) {
  const c = communes.find((x) => x.name === name);
  if (!c) return '';
  const t = tierFor(c.km);
  const sup = c.note
    ? c.note
    : t.supplement === 0
    ? `Forfait dépannage : ${euro(forfait.price)}, sans supplément kilométrique`
    : t.supplement
    ? `Forfait dépannage : ${euro(forfait.price + t.supplement)} (79 € ${t.text})`
    : 'Supplément kilométrique sur devis';
  return `<div class="distance-badge">${icon('route')}<div><strong>${c.km === 0 ? 'Commune de base d’ALED08' : `≈ ${c.km} km de Signy-l’Abbaye`}</strong><span>${sup}</span></div></div>`;
}

// ---------------------------------------------------------------- mon passage, étape par étape
const PASSAGE = [
  { icon: 'phone', t: 'Avant de venir', d: 'Vous m’appelez ou m’écrivez. Je vous confirme le prix du forfait pour votre commune et nous fixons un créneau, le soir ou le week-end.' },
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
    `<strong>Le forfait dépannage : ${euro(forfait.price)} TTC.</strong> Déplacement jusqu’à 15 km, recherche de panne, proposition de solution et devis de réparation.`,
    '<strong>Le supplément kilométrique</strong>, seulement au-delà de 15 km : + 10 € (15 à 30 km) ou + 20 € (30 à 45 km).',
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

// ---------------------------------------------------------------- repères de marché (sources publiques)
function marketCompare() {
  const rows = [
    ['Déplacement', 'Souvent facturé à part : 20 à 50 € en province', 'Compris dans le forfait jusqu’à 15 km'],
    ['Soir, week-end', 'Majoration fréquente de 50 à 100 %', 'Aucune majoration'],
    ['Recherche de panne', 'Souvent au temps passé : 50 à 100 € de l’heure', 'Comprise dans le forfait'],
    ['Panne non trouvée', 'Variable selon les entreprises', 'Remise sur le forfait'],
    ['Prix', 'Rarement affiché avant l’appel', 'Publié ici, confirmé au téléphone'],
    ['Interlocuteur', 'Parfois une plateforme ou un standard', `${site.owner}, du premier appel à la facture`],
  ];
  return `<div class="compare reveal" role="table" aria-label="Repères de prix du marché et pratique ALED08">
  <div class="compare-row compare-head" role="row"><span role="columnheader"></span><span role="columnheader">Ce qui se pratique souvent</span><span role="columnheader">Chez ALED08</span></div>
  ${rows.map((r) => `<div class="compare-row" role="row"><strong role="rowheader">${r[0]}</strong><span role="cell">${r[1]}</span><span role="cell" class="compare-me">${icon('check')}${r[2]}</span></div>`).join('')}
</div>
<p class="small muted">Repères issus de guides de prix nationaux consultés en novembre 2026 (notamment Quelle Énergie). Ils varient d’une entreprise à l’autre : demandez toujours le prix avant le déplacement.</p>`;
}

// ---------------------------------------------------------------- présentation de l'artisan
function avatar(cls = '') {
  const initials = site.owner.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return site.portrait
    ? `<img class="avatar ${cls}" src="${site.portrait}" alt="${esc(site.owner)}, électricien à ${esc(site.address.city)}" width="160" height="160" loading="lazy" decoding="async">`
    : `<span class="avatar avatar-mono ${cls}" aria-hidden="true">${initials}</span>`;
}
function artisanCard() {
  return `<aside class="artisan reveal" aria-label="${esc(site.owner)}, électricien">
  <div class="artisan-id">${avatar()}<div><strong>${site.owner}</strong><span>Électricien · ${site.experienceYears} ans de métier</span><span>${site.address.city} (${site.address.postalCode.slice(0, 2)})</span></div></div>
  <ul class="artisan-facts">
    <li>${icon('zap')}<span><strong>Spécialité</strong>Dépannage et recherche de panne</span></li>
    <li>${icon('user')}<span><strong>Interlocuteur unique</strong>Je réponds, je me déplace, je répare</span></li>
    <li>${icon('moon')}<span><strong>Créneaux</strong>Soirs de semaine et week-ends, sur rendez-vous</span></li>
    <li>${icon('clipboard-check')}<span><strong>Référence</strong>Norme NF C 15-100</span></li>
  </ul>
  ${btnCall('btn-primary btn-block', 'Appeler ' + site.owner.split(' ')[0])}
</aside>`;
}
function authorBox(id = 'lga') {
  return `<div class="author-box">${site.portrait ? avatar('avatar-sm') : logoSvg(id)}<p><strong>${site.owner}</strong> — électricien depuis ${site.experienceYears} ans, installé à ${site.address.city} (ALED08). J’interviens en soirée et le week-end, sur rendez-vous, chez les particuliers des Ardennes. <a href="/qui-suis-je/">En savoir plus</a></p></div>`;
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
  forfaitBlock, forfaitFor, pricingTable, kmTable, passage, payBlock, marketCompare, avatar, artisanCard, authorBox, distanceBadge, steps, cases, faq, ctaBand, inlineCta, relatedLinks, reviewsBlock,
  beforeAfter, mapEmbed, communesList,
};
