// Composants HTML réutilisables
const { site, sections, types, pageEnPlus, forfaits, annuel, options, paiement, shopify, stripe } = require('../config');
const { icon } = require('./icons');
const { monster } = require('./monsters');
const { inline, esc, plain } = require('./md');

// ---------------------------------------------------------------- liens et prix
const tel = `tel:${site.phoneIntl}`;
const waUrl = (msg = site.whatsappMessage) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;
const euro = (n) => `${String(n).replace('.', ',')} €`;
const creerUrl = (params = {}) => {
  const q = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return '/creer-mon-site/' + (q ? '?' + q : '');
};
const year = (month) => month * (12 - annuel.moisOfferts);
const F = (id) => forfaits.find((f) => f.id === id);
const T = (id) => types.find((t) => t.id === id);

// Prix affiché au mois ou à l'année : le sélecteur (JS) montre l'un ou l'autre
const billed = (month) =>
  `<span class="p-month"><b>${euro(month)}</b><small>/mois</small></span><span class="p-year"><b>${euro(year(month))}</b><small>/an</small></span>`;

// ---------------------------------------------------------------- boutons
function btn(href, cls, ico, text, extra = '') {
  return `<a class="btn ${cls}" href="${href}"${extra}>${ico ? icon(ico) : ''}<span>${text}</span></a>`;
}
const btnCreer = (cls = 'btn-primary', text = 'Créer mon site', params) => btn(creerUrl(params), cls, 'wand-sparkles', text);
const btnWa = (cls = 'btn-wa', text = 'WhatsApp', msg) => btn(waUrl(msg), cls, 'whatsapp', text, ' target="_blank" rel="noopener"');

// ---------------------------------------------------------------- fil d'Ariane
function breadcrumbs(crumbs) {
  return `<nav class="crumbs" aria-label="Vous êtes ici"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.path}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

// ---------------------------------------------------------------- en-tête de page
// La pastille (couleur + icône de la rubrique) dit tout de suite où l'on est.
function pageHero({ section, h1, lead, crumbs, mascot, actions = false }) {
  const s = section ? sections[section] : null;
  return `<section class="page-hero c-${s ? s.color : 'lilac'}">
  <div class="container page-hero-in${mascot ? ' has-mascot' : ''}">
    <div class="page-hero-text">
      ${crumbs ? breadcrumbs(crumbs) : ''}
      ${s ? `<p class="where">${icon(s.icon)}<span>${s.label}</span></p>` : ''}
      <h1>${inline(h1)}</h1>
      ${lead ? `<p class="lead">${inline(lead)}</p>` : ''}
      ${actions ? `<div class="hero-ctas">${btnCreer('btn-primary btn-lg')}${btnWa('btn-wa btn-lg')}</div>` : ''}
    </div>
    ${mascot ? `<div class="page-hero-art">${monster(mascot)}</div>` : ''}
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
  <div class="faq">${items.map(faqItem).join('')}</div>
</div></section>`;
  return { html, schema: faqSchema(items) };
}
const faqItem = (it) => `<details class="faq-item"><summary>${inline(it.q)}${icon('chevron-down')}</summary><div class="faq-a"><p>${inline(it.a)}</p></div></details>`;
const faqSchema = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((it) => ({ '@type': 'Question', name: plain(it.q), acceptedAnswer: { '@type': 'Answer', text: plain(it.a) } })),
});

// ---------------------------------------------------------------- appel à l'action
function ctaBand({ title = 'On crée votre site ?', text = 'Choisissez votre site et votre forfait en deux minutes. Je vous réponds vite, avec un récapitulatif clair.', mascot = 'mascotte' } = {}) {
  return `<section class="cta-band"><div class="container">
  <div class="cta-box reveal">
    <div class="cta-art">${monster(mascot)}</div>
    <div class="cta-text"><h2>${esc(title)}</h2><p>${inline(text)}</p></div>
    <div class="cta-actions">${btnCreer('btn-primary btn-lg')}${btnWa('btn-wa btn-lg')}</div>
  </div>
</div></section>`;
}

// ---------------------------------------------------------------- sélecteur au mois / à l'année
function billingSwitch() {
  return `<div class="billing-switch" role="group" aria-label="Façon de payer le forfait" data-billing-switch>
  <button type="button" class="is-on" data-billing="mensuel" aria-pressed="true">Au mois</button>
  <button type="button" data-billing="annuel" aria-pressed="false">À l’année <em>${annuel.moisOfferts} mois offerts</em></button>
</div>`;
}

// ---------------------------------------------------------------- types de site
function typeCards() {
  return `<div class="types">${types
    .map(
      (t) => `<a class="type-card c-${t.color} reveal" href="${creerUrl({ type: t.id })}">
    <span class="type-ico">${icon(t.icon)}</span>
    <span class="type-name">${esc(t.label)}</span>
    <span class="type-price"><small>Création</small><b>${euro(t.price)}</b></span>
    <span class="type-pitch">${inline(t.pitch)}</span>
    <span class="type-go">Choisir ${icon('arrow-right')}</span>
  </a>`
    )
    .join('')}</div>`;
}

// ---------------------------------------------------------------- forfaits
// Version courte (accueil) : monstre, nom, prix, accroche
function forfaitMinis() {
  return `<div class="minis">${forfaits
    .map(
      (f) => `<a class="mini c-${f.color} reveal" href="/forfaits/#${f.id}">
    <span class="mini-art">${monster(f.id)}</span>
    <span class="mini-name">${f.name}</span>
    <span class="mini-price"><b>${euro(f.month)}</b>/mois</span>
    <span class="mini-tag">${inline(f.tagline)}</span>
  </a>`
    )
    .join('')}</div>`;
}

// Version complète : liste cumulée (« Tout Chico, plus : »)
function forfaitCards({ choose = true } = {}) {
  return `<div class="plans" data-billing-scope>${forfaits
    .map((f, i) => {
      const prev = i > 0 ? forfaits[i - 1].name : null;
      return `<article class="plan c-${f.color}${f.conseil ? ' is-conseil' : ''} reveal" id="${f.id}">
    ${f.conseil ? '<p class="plan-badge">Conseillé</p>' : ''}
    <div class="plan-top">
      <div class="plan-art">${monster(f.id)}</div>
      <h3 class="plan-name">${f.name}</h3>
      <p class="plan-tagline">${inline(f.tagline)}</p>
    </div>
    <p class="plan-price">${billed(f.month)}</p>
    <p class="plan-pitch">${inline(f.pitch)}</p>
    ${prev ? `<p class="plan-plus">Tout ${prev}, plus :</p>` : ''}
    <ul class="plan-list">${f.features.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>
    ${choose ? btn(creerUrl({ forfait: f.id }), 'btn-primary btn-block', null, `Choisir ${f.name}`) : ''}
  </article>`;
    })
    .join('')}</div>`;
}

// Prix d'une option, lisible
const optPrice = (p) => (p.once ? euro(p.once) : `${euro(p.month)}/mois`);

// Liste compacte des options (page forfaits)
function optionsCompact() {
  const groups = [
    ['connaitre', 'Pour vous faire connaître', 'megaphone'],
    ['site', 'Pour votre site', 'layout-template'],
  ];
  return `<div class="opt-groups">${groups
    .map(
      ([g, t, ic]) => `<div class="opt-group reveal"><h3>${icon(ic)}${t}</h3><ul>${options
        .filter((o) => o.group === g)
        .map((o) => `<li><span class="opt-ico">${icon(o.icon)}</span><span class="opt-txt"><strong>${esc(o.name)}</strong><small>${inline(o.desc)}</small></span><span class="opt-price">${optPrice(o.price)}</span></li>`)
        .join('')}</ul></div>`
    )
    .join('')}</div>`;
}

// ---------------------------------------------------------------- configurateur « Créer mon site »
function configurator() {
  const data = esc(
    JSON.stringify({
      types: types.map((t) => ({ id: t.id, label: t.label, price: t.price, sup: t.supplement || 0 })),
      forfaits: forfaits.map((f) => ({ id: f.id, name: f.name, month: f.month })),
      options: options.map((o) => ({ id: o.id, name: o.name, once: o.price.once || 0, month: o.price.month || 0 })),
      free: annuel.moisOfferts,
    })
  );
  const step = (n, title, hint, body, cls = '') => `<fieldset class="b-step${cls}">
      <legend><span class="b-n">${n}</span><span class="b-t">${title}</span></legend>
      ${hint ? `<p class="b-hint">${hint}</p>` : ''}
      ${body}
    </fieldset>`;
  const typeChoices = `<div class="b-choices b-types">${types
    .map(
      (t, i) => `<label class="b-choice c-${t.color}"><input type="radio" name="b-type" value="${t.id}"${i === 1 ? ' checked' : ''}>
        <span class="b-card"><span class="type-ico">${icon(t.icon)}</span><strong>${esc(t.label)}</strong><span class="b-price">${euro(t.price)}</span><small>${esc(t.delai)}</small><span class="b-check">${icon('check')}</span></span></label>`
    )
    .join('')}</div><p class="b-note">${icon('info')}Besoin de plus de pages ? ${euro(pageEnPlus)} la page.</p>`;
  const domain = `<div class="domain" data-domain>
        <label class="sr-only" for="b-domain">Nom de domaine souhaité</label>
        <div class="domain-bar">
          <span class="domain-www">www.</span>
          <input id="b-domain" type="text" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="mon-entreprise" maxlength="63">
          <label class="sr-only" for="b-tld">Extension</label>
          <select id="b-tld"><option>.fr</option><option>.com</option><option>.net</option><option>.org</option></select>
          <button type="button" class="btn btn-primary" data-domain-check>${icon('search')}<span>Vérifier</span></button>
        </div>
        <p class="domain-result" data-domain-result aria-live="polite"></p>
        <label class="b-tick"><input type="checkbox" data-domain-own><span>J’ai déjà un nom de domaine</span></label>
      </div>`;
  const forfaitChoices = `<div class="b-choices b-plans">${forfaits
    .map(
      (f) => `<label class="b-choice c-${f.color}"><input type="radio" name="b-forfait" value="${f.id}"${f.conseil ? ' checked' : ''}>
        <span class="b-card"><span class="b-art">${monster(f.id)}</span><strong>${f.name}</strong><span class="b-price">${billed(f.month)}</span><small>${inline(f.tagline)}</small><span class="b-check">${icon('check')}</span></span></label>`
    )
    .join('')}</div><p class="b-note">${icon('info')}Pour une boutique, le forfait coûte ${euro(T('boutique').supplement)} de plus par mois. <a href="/forfaits/">Comparer les forfaits</a></p>`;
  const optionList = `<details class="b-options">
        <summary>${icon('plus')}<span>Ajouter des options <small>(facultatif, activables plus tard)</small></span>${icon('chevron-down')}</summary>
        ${[
          ['connaitre', 'Pour vous faire connaître'],
          ['site', 'Pour votre site'],
        ]
          .map(
            ([g, t]) => `<p class="b-group">${t}</p><div class="b-opts">${options
              .filter((o) => o.group === g)
              .map(
                (o) => `<label class="b-opt"><input type="checkbox" value="${o.id}"><span class="b-box">${icon('check')}</span><span class="b-opt-txt"><strong>${esc(o.name)}</strong></span><em class="p-opt">${o.price.once ? euro(o.price.once) : `<span class="p-month">${euro(o.price.month)}/mois</span><span class="p-year">${euro(year(o.price.month))}/an</span>`}</em></label>`
              )
              .join('')}</div>`
          )
          .join('')}
        <p class="b-more"><a href="/forfaits/#options">Le détail de chaque option</a></p>
      </details>`;
  return `<div class="builder" data-builder="${data}" data-billing-scope>
  <form class="b-steps" data-builder-form>
    ${step(1, 'Votre site', 'Le prix de création est fixe. Il comprend la maquette, le site complet et la mise en ligne.', typeChoices)}
    ${step(2, 'Votre nom de domaine', 'L’adresse de votre site. Elle est incluse dans tous les forfaits et elle reste à votre nom.', domain)}
    ${step(3, 'Votre forfait', 'Hébergement, mises à jour et SEO, par mes soins.', forfaitChoices)}
    ${step(4, 'Paiement du forfait', '', billingSwitch())}
    ${step(5, 'Options', 'Rien n’est obligatoire : vous pourrez aussi les ajouter plus tard depuis votre espace client.', optionList, ' b-step-last')}
  </form>
  <aside class="b-sum" aria-live="polite">
    <p class="b-sum-title">Votre récapitulatif</p>
    <ul class="b-lines">
      <li><span data-sum="type">Site vitrine</span><b data-sum="type-price">290 €</b></li>
      <li><span data-sum="domain">Nom de domaine à choisir</span><b>inclus</b></li>
      <li><span data-sum="forfait">Forfait Power</span><b data-sum="forfait-price">29 €/mois</b></li>
      <li data-sum-opts hidden><span>Options</span><b data-sum="opts">0 €</b></li>
    </ul>
    <div class="b-total">
      <p><span>Création, une fois</span><b data-sum="once">290 €</b></p>
      <p><span data-sum="recur-label">Puis chaque mois</span><b data-sum="recur">29 €</b></p>
    </div>
    <a class="btn btn-primary btn-block btn-lg" href="/contact/#devis" data-sum-go>${icon('send')}<span>Envoyer ma demande</span></a>
    <p class="b-sum-note">Gratuit et sans engagement : je vous réponds avec un récapitulatif à valider.</p>
  </aside>
  <div class="b-bar" data-sum-bar>
    <p><b data-sum="once">290 €</b> puis <b data-sum="recur-short">29 €/mois</b></p>
    <a class="btn btn-primary btn-sm" href="/contact/#devis" data-sum-go>${icon('send')}<span>Envoyer</span></a>
  </div>
</div>`;
}

// ---------------------------------------------------------------- maquettes de l'espace client (illustrations)
function phoneEdit() {
  return `<div class="phone reveal" aria-hidden="true">
  <div class="phone-top">${monster('mascotte')}<span>Mon espace</span><em>Exemple</em></div>
  <div class="phone-body chat">
    <p class="bubble me">Ajoute qu’on est fermés le lundi, et mets la photo de notre nouvelle vitrine en haut.</p>
    <div class="bubble ai"><p>C’est prêt ! Voici l’aperçu :</p>
      <div class="mini-site"><i class="ms-photo"></i><i class="ms-line"></i><i class="ms-line short"></i><span class="ms-hl">Fermé le lundi</span></div>
      <div class="bubble-actions"><span class="pill pill-go">${icon('check')}Publier</span><span class="pill">${icon('undo-2')}Annuler</span></div>
    </div>
  </div>
</div>`;
}
function phoneSocial() {
  const nets = [
    ['camera', 'Instagram', 'Format carré'],
    ['thumbs-up', 'Facebook', 'Texte plus long'],
    ['map-pin', 'Fiche Google', 'Avec l’adresse'],
  ];
  return `<div class="phone reveal" aria-hidden="true">
  <div class="phone-top">${monster('titan')}<span>Publier</span><em>Exemple</em></div>
  <div class="phone-body social">
    <div class="post-photo">${icon('image')}</div>
    <p class="post-desc">« Nouvelle tarte aux fraises ce week-end »</p>
    <ul class="post-nets">${nets.map(([ic, n, d]) => `<li>${icon(ic)}<span><strong>${n}</strong><small>${d}</small></span>${icon('circle-check', 'ok')}</li>`).join('')}</ul>
    <div class="bubble-actions"><span class="pill pill-go">${icon('send')}Publier partout</span><span class="pill">${icon('clock')}Programmer</span></div>
  </div>
</div>`;
}
function statsCard() {
  const bars = [38, 52, 46, 64, 58, 76, 88];
  return `<div class="stats-card reveal" aria-hidden="true">
  <p class="stats-head">${icon('chart-no-axes-column')}<span>Ce mois-ci</span><em>Exemple</em></p>
  <div class="stats-bars">${bars.map((h) => `<i style="height:${h}%"></i>`).join('')}</div>
  <ul class="stats-kpis">
    <li><b>1 240</b><small>visites</small></li>
    <li><b>4<sup>e</sup></b><small>sur Google pour « pâtisserie Rethel »</small></li>
    <li><b>23</b><small>appels depuis le site</small></li>
  </ul>
</div>`;
}

// ---------------------------------------------------------------- comparatif Shopify
function shopifyTable() {
  const b = T('boutique');
  const chico = F('chico');
  const rows = [
    ['Création de la boutique', 'À faire vous-même, ou à confier à un prestataire', `Faite par moi : ${euro(b.price)}, une fois`],
    ['Abonnement', `${euro(shopify.basicMensuel)} par mois, ou ${euro(shopify.basicAnnuel)} par mois à l’année`, `${euro(chico.month + b.supplement)} par mois, ou ${euro(year(chico.month + b.supplement))} par an (forfait Chico)`],
    ['Nom de domaine', 'En plus', 'Inclus'],
    ['Mises à jour, sécurité, sauvegardes', 'À surveiller vous-même', 'Incluses'],
    ['Référencement (SEO)', 'À faire vous-même, souvent avec des applications', 'Bases faites et suivies par moi'],
    ['Modifications', 'Vous-même, dans l’interface Shopify', 'Sur simple message, ou par l’IA avec Power'],
    ['Fonctions en plus (avis, réservation…)', 'Applications, souvent payantes chaque mois', 'Options à prix fixe'],
    ['Frais par paiement par carte', `${shopify.fraisCarte} (Shopify Payments)`, `${stripe.fraisCarte} (Stripe)`],
  ];
  return `<div class="cmp reveal" role="table" aria-label="Shopify Basic comparé à une boutique ALED08">
  <div class="cmp-head" role="row"><span role="columnheader"></span><span role="columnheader" class="cmp-shop">Shopify Basic</span><span role="columnheader" class="cmp-me">${monster('chico')}Boutique ALED08</span></div>
  ${rows.map(([l, a, m]) => `<div class="cmp-row" role="row"><span class="cmp-label" role="rowheader">${esc(l)}</span><span class="cmp-shop" role="cell" data-label="Shopify Basic">${esc(a)}</span><span class="cmp-me" role="cell" data-label="ALED08">${esc(m)}</span></div>`).join('')}
</div>`;
}

module.exports = {
  tel, waUrl, euro, creerUrl, year, btn, btnCreer, btnWa, breadcrumbs, pageHero, steps, faq, faqItem, faqSchema, ctaBand,
  billingSwitch, billed, typeCards, forfaitMinis, forfaitCards, optPrice, optionsCompact, configurator, phoneEdit, phoneSocial, statsCard, shopifyTable,
};
