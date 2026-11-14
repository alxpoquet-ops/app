// Composants HTML réutilisables
const { site, sections, formules, options, abonnement } = require('../config');
const { icon } = require('./icons');
const { inline, esc, plain } = require('./md');

// ---------------------------------------------------------------- liens de contact
const tel = `tel:${site.phoneIntl}`;
const smsUrl = (body = 'Bonjour, je voudrais un devis pour un projet.') => `sms:${site.phoneIntl}?body=${encodeURIComponent(body)}`;
const waUrl = (msg = site.whatsappMessage) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;
const devisUrl = (projet) => '/contact/' + (projet ? '?projet=' + encodeURIComponent(projet) : '') + '#devis';
const euro = (n) => `${n} €`;
// Libellé du projet, identique dans les boutons et dans la liste du formulaire
const projetLabel = (f) => (f.id === 'boutique' ? 'Boutique en ligne' : 'Site ' + f.name.toLowerCase());

// ---------------------------------------------------------------- logo
const logoSvg = (id = 'lg') => `<svg class="logo" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#F39B00"/></linearGradient></defs><rect width="48" height="48" rx="15" fill="url(#${id})"/><path d="M27.5 7 13 27h9.2l-2.7 14L35 20.5h-9.4L27.5 7Z" fill="#24304A"/></svg>`;

// ---------------------------------------------------------------- boutons
function btn(href, cls, ico, text, extra = '') {
  return `<a class="btn ${cls}" href="${href}"${extra}>${ico ? icon(ico) : ''}<span>${text}</span></a>`;
}
const btnDevis = (cls = 'btn-primary', projet, text = 'Devis gratuit') => btn(devisUrl(projet), cls, 'file-text', text);
const btnWa = (cls = 'btn-wa', text = 'WhatsApp', msg) => btn(waUrl(msg), cls, 'whatsapp', text, ' target="_blank" rel="noopener"');
const btnTarifs = (cls = 'btn-light', text = 'Voir les tarifs') => btn('/tarifs/', cls, 'coins', text);

// ---------------------------------------------------------------- fil d'Ariane
function breadcrumbs(crumbs) {
  return `<nav class="crumbs" aria-label="Vous êtes ici"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.path}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

// ---------------------------------------------------------------- en-tête de page intérieure
// La pastille de rubrique (couleur + icône) dit tout de suite où l'on est.
function pageHero({ section, h1, lead, crumbs, actions = true, projet }) {
  const s = section ? sections[section] : null;
  return `<section class="page-hero">
  <div class="container page-hero-in">
    ${crumbs ? breadcrumbs(crumbs) : ''}
    ${s ? `<p class="where">${icon(s.icon)}<span>${s.label}</span></p>` : ''}
    <h1>${inline(h1)}</h1>
    ${lead ? `<p class="lead">${inline(lead)}</p>` : ''}
    ${actions ? `<div class="hero-ctas">${btnDevis('btn-primary btn-lg', projet)}${btnWa('btn-wa btn-lg')}</div>` : ''}
  </div>
</section>`;
}

// ---------------------------------------------------------------- étapes
function steps(list) {
  return `<ol class="steps">${list
    .map((s, i) => `<li class="step reveal"><span class="step-n">${i + 1}</span><div><h3>${inline(s.t)}</h3><p>${inline(s.d)}</p></div></li>`)
    .join('')}</ol>`;
}

// ---------------------------------------------------------------- FAQ (avec données structurées)
function faq(items, title = 'Questions fréquentes', id = 'faq') {
  const html = `<section class="section" id="${id}"><div class="container container-narrow">
  <h2 class="section-title">${esc(title)}</h2>
  <div class="faq">${items
    .map((it) => `<details class="faq-item"><summary>${inline(it.q)}${icon('chevron-down')}</summary><div class="faq-a"><p>${inline(it.a)}</p></div></details>`)
    .join('')}</div>
</div></section>`;
  const schema = {
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({ '@type': 'Question', name: plain(it.q), acceptedAnswer: { '@type': 'Answer', text: plain(it.a) } })),
  };
  return { html, schema };
}

// ---------------------------------------------------------------- appel à l'action
function ctaBand({ title = 'Un projet en tête ?', text = 'Expliquez-moi votre idée en quelques mots : je vous réponds vite, avec un prix.', projet } = {}) {
  return `<section class="cta-band"><div class="container">
  <div class="cta-box reveal">
    <div><h2>${esc(title)}</h2><p>${inline(text)}</p></div>
    <div class="cta-actions">${btnDevis('btn-primary btn-lg', projet)}${btnWa('btn-wa btn-lg')}</div>
  </div>
</div></section>`;
}

// ---------------------------------------------------------------- formules
// Une carte par formule, avec les deux façons de payer. Le sélecteur (JS) met l'une ou l'autre en avant.
function formuleCards({ link = true } = {}) {
  return `<div class="formules" data-mode="unique">${formules
    .map(
      (f) => `<article class="formule acc-${f.accent}${f.popular ? ' is-popular' : ''} reveal" id="${f.id}">
    ${f.popular ? '<p class="formule-badge">Conseillé</p>' : ''}
    <div class="formule-head"><span class="formule-ico">${icon(f.icon)}</span><h3>${esc(f.name)}</h3></div>
    <p class="formule-pitch">${inline(f.pitch)}</p>
    <div class="formule-price">
      <p class="price price-unique"><small>à partir de</small><strong>${euro(f.unique)}</strong><span>une fois</span></p>
      <p class="price price-mensuel"><small>tout compris</small><strong>${euro(f.mensuel)}</strong><span>par mois</span></p>
    </div>
    <ul class="formule-list">${f.inclus.map((i) => `<li>${icon('check')}${inline(i)}</li>`).join('')}</ul>
    <p class="formule-meta">${icon('timer')}Délai : ${esc(f.delai)}</p>
    ${link ? btnDevis('btn-primary btn-block', projetLabel(f), 'Choisir cette formule') : ''}
  </article>`
    )
    .join('')}</div>`;
}

// Sélecteur paiement unique / abonnement
function modeSwitch(id = 'mode') {
  return `<div class="mode-switch" role="group" aria-label="Façon de payer" data-mode-switch="${id}">
  <button type="button" class="is-on" data-mode="unique" aria-pressed="true">${icon('credit-card')}Paiement unique</button>
  <button type="button" data-mode="mensuel" aria-pressed="false">${icon('refresh-cw')}Abonnement mensuel</button>
</div>`;
}

// Prix d'une option, lisible
function optPrice(p) {
  if (p === 'inclus') return '<span class="tag-in">Inclus</span>';
  if (!p) return 'sur devis';
  const parts = [];
  if (p.once) parts.push(`${euro(p.once)}`);
  if (p.month) parts.push(`${euro(p.month)}/mois`);
  if (p.year) parts.push(`${euro(p.year)}/an`);
  return parts.join(' + ');
}

function optionsTable() {
  return `<div class="table-wrap reveal"><table class="opt-table">
  <caption class="sr-only">Options et leurs prix selon la façon de payer</caption>
  <thead><tr><th scope="col">Option</th><th scope="col">Avec paiement unique</th><th scope="col">Avec abonnement</th></tr></thead>
  <tbody>${options
    .map(
      (o) => `<tr><th scope="row"><span class="opt-name">${icon(o.icon)}<span><strong>${esc(o.name)}</strong><small>${inline(o.desc)}</small></span></span></th><td data-label="Paiement unique">${optPrice(o.u)}</td><td data-label="Abonnement">${optPrice(o.a)}</td></tr>`
    )
    .join('')}</tbody>
</table></div>`;
}

// Simulateur : les prix viennent de la configuration (attribut data-*)
function estimator() {
  const data = esc(JSON.stringify({ formules: formules.map((f) => ({ id: f.id, label: projetLabel(f), u: f.unique, m: f.mensuel })), options: options.map((o) => ({ id: o.id, name: o.name, u: o.u, a: o.a })) }));
  return `<div class="estimator reveal" data-estimator="${data}">
  <div class="est-col">
    <p class="est-label">1. Votre site</p>
    <div class="est-choices">${formules
      .map((f, i) => `<label class="est-choice"><input type="radio" name="est-f" value="${f.id}"${i === 0 ? ' checked' : ''}><span>${icon(f.icon)}${esc(f.name)}</span></label>`)
      .join('')}</div>
    <p class="est-label">2. Façon de payer</p>
    <div class="est-choices">
      <label class="est-choice"><input type="radio" name="est-m" value="unique" checked><span>${icon('credit-card')}Paiement unique</span></label>
      <label class="est-choice"><input type="radio" name="est-m" value="mensuel"><span>${icon('refresh-cw')}Abonnement</span></label>
    </div>
    <p class="est-label">3. Options</p>
    <div class="est-opts">${options
      .map((o) => `<label class="est-opt" data-opt="${o.id}"><input type="checkbox" value="${o.id}"><span>${esc(o.name)}</span><em data-opt-price></em></label>`)
      .join('')}</div>
  </div>
  <div class="est-total" aria-live="polite">
    <p class="est-label">Votre estimation</p>
    <p class="est-line"><span>À payer au départ</span><strong data-est="once">100 €</strong></p>
    <p class="est-line"><span>Chaque mois</span><strong data-est="month">0 €</strong></p>
    <p class="est-line"><span>Chaque année</span><strong data-est="year">0 €</strong></p>
    ${btnDevis('btn-primary btn-block', null, 'Demander mon devis')}
  </div>
</div>`;
}

// Ce que comprend l'abonnement
function aboBox() {
  return `<div class="abo-box reveal">
  <h3>${icon('refresh-cw')}L’abonnement comprend</h3>
  <ul>${abonnement.inclus.map((i) => `<li>${icon('check')}${inline(i)}</li>`).join('')}</ul>
  <p class="small">Engagement ${abonnement.engagement} mois, puis sans engagement. Si vous arrêtez, je vous remets votre site et votre nom de domaine.</p>
</div>`;
}

module.exports = {
  tel, smsUrl, waUrl, devisUrl, euro, projetLabel, logoSvg, btn, btnDevis, btnWa, btnTarifs, breadcrumbs, pageHero, steps, faq, ctaBand,
  formuleCards, modeSwitch, optPrice, optionsTable, estimator, aboBox,
};
