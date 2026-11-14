// Composants HTML réutilisables
const { site, sections, types, pageEnPlus, forfaits, annuel, lissage, options, fidelite, paiement, shopify, stripe } = require('../config');
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
  return `<section class="page-hero c-${s ? s.color : 'mint'}">
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
  return `<div class="billing-switch" role="group" aria-label="Façon de payer" data-billing-switch>
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

// ---------------------------------------------------------------- prix du site lissé
const lisse = (price) => Math.round(price / lissage.mois * 100) / 100;
function payBox() {
  return `<div class="jetons-box reveal">
  <h3>${icon('calendar-check')}Comment payer ?</h3>
  <ul class="list-check">
    <li><strong>Le site</strong> : en une fois, ou lissé sur 2 ans si vous préférez (engagement de 2 ans). Par exemple ${types.map((t) => `${euro(lisse(t.price))} par mois pour ${t.label.toLowerCase()}`).join(', ')}.</li>
    <li><strong>Le forfait</strong> : au mois, ou à l’année avec ${annuel.moisOfferts} mois offerts.</li>
  </ul>
</div>`;
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
    <span class="mini-tag">${f.modifs}</span>
  </a>`
    )
    .join('')}</div>`;
}

// Version complète
function forfaitCards({ choose = true } = {}) {
  return `<div class="plans">${forfaits
    .map(
      (f) => `<article class="plan c-${f.color}${f.conseil ? ' is-conseil' : ''} reveal" id="${f.id}">
    ${f.conseil ? '<p class="plan-badge">Conseillé</p>' : ''}
    <div class="plan-top">
      <div class="plan-art">${monster(f.id)}</div>
      <h3 class="plan-name">${f.name}</h3>
      <p class="plan-tagline">${inline(f.tagline)}</p>
    </div>
    <p class="plan-price">${billed(f.month)}</p>
    <p class="plan-jetons">${icon('pencil')}${f.modifs}</p>
    <ul class="plan-list">${f.features.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>
    ${choose ? btn(creerUrl({ forfait: f.id }), 'btn-primary btn-block', null, `Choisir ${f.name}`) : ''}
  </article>`
    )
    .join('')}</div>`;
}

// Prix d'une option, lisible
const optPrice = (p) => (p.once ? euro(p.once) : `${euro(p.month)}/mois`);

// Liste compacte des options (page forfaits)
function optionsCompact() {
  return `<div class="opt-groups opt-single"><div class="opt-group reveal"><ul>${options
    .map((o) => `<li><span class="opt-ico">${icon(o.icon)}</span><span class="opt-txt"><strong>${esc(o.name)}</strong><small>${inline(o.desc)}</small></span><span class="opt-price">${optPrice(o.price)}</span></li>`)
    .join('')}</ul></div></div>`;
}

// ---------------------------------------------------------------- configurateur « Créer mon site »
function configurator() {
  const plans = forfaits;
  const data = esc(
    JSON.stringify({
      types: types.map((t) => ({ id: t.id, label: t.label, price: t.price })),
      lissage: lissage.mois,
      forfaits: plans.map((f) => ({ id: f.id, name: f.name, month: f.month })),
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
  const forfaitChoices = `<div class="b-choices b-plans">${plans
    .map(
      (f) => `<label class="b-choice c-${f.color}"><input type="radio" name="b-forfait" value="${f.id}"${f.conseil ? ' checked' : ''}>
        <span class="b-card"><span class="b-art">${monster(f.id)}</span><strong>${f.name}</strong><span class="b-price">${billed(f.month)}</span><small>${f.modifs}</small><span class="b-check">${icon('check')}</span></span></label>`
    )
    .join('')}</div><p class="b-note">${icon('info')}Chico : sauvegardes, mises à jour, nom de domaine. Power ajoute le SEO et un rapport mensuel. <a href="/forfaits/">Comparer</a></p>`;
  const payChoices = `<p class="b-label">Le site</p>
      <div class="b-seg" role="radiogroup" aria-label="Paiement du site">
        <label><input type="radio" name="b-lisse" value="non" checked><span>En une fois</span></label>
        <label><input type="radio" name="b-lisse" value="oui"><span>Lissé sur 2 ans</span></label>
      </div>
      <p class="b-label">Le forfait</p>
      ${billingSwitch()}`;
  const optionList = `<details class="b-options">
        <summary>${icon('plus')}<span>Ajouter des options <small>(facultatif, activables plus tard)</small></span>${icon('chevron-down')}</summary>
        <div class="b-opts">${options
          .map(
            (o) => `<label class="b-opt"><input type="checkbox" value="${o.id}"><span class="b-box">${icon('check')}</span><span class="b-opt-txt"><strong>${esc(o.name)}</strong></span><em class="p-opt">${o.price.once ? euro(o.price.once) : `<span class="p-month">${euro(o.price.month)}/mois</span><span class="p-year">${euro(year(o.price.month))}/an</span>`}</em></label>`
          )
          .join('')}</div>
        <p class="b-more"><a href="/forfaits/#options">Le détail de chaque option</a></p>
      </details>`;
  return `<div class="builder" data-builder="${data}" data-billing-scope>
  <form class="b-steps" data-builder-form>
    ${step(1, 'Votre site', 'Le prix de création est fixe. Il comprend la maquette, le site complet et la mise en ligne.', typeChoices)}
    ${step(2, 'Votre nom de domaine', 'L’adresse de votre site. Elle est comprise dans les forfaits et elle reste à votre nom.', domain)}
    ${step(3, 'Votre forfait', 'Je m’occupe de votre site chaque mois. Les modifications, c’est moi qui les fais.', forfaitChoices)}
    ${step(4, 'Paiement', 'Le site en une fois, ou lissé sur 2 ans (engagement de 2 ans). Le forfait au mois, ou à l’année avec deux mois offerts.', payChoices)}
    ${step(5, 'Options', 'E-mail pro ou traduction : rien n’est obligatoire, vous pourrez les ajouter plus tard.', optionList, ' b-step-last')}
  </form>
  <aside class="b-sum" aria-live="polite">
    <p class="b-sum-title">Votre récapitulatif</p>
    <ul class="b-lines">
      <li><span data-sum="type">Site vitrine</span><b data-sum="type-price">250 €</b></li>
      <li><span data-sum="domain">Nom de domaine à choisir</span><b>inclus</b></li>
      <li><span data-sum="forfait">Forfait Power</span><b data-sum="forfait-price">20 €/mois</b></li>
      <li data-sum-opts hidden><span>Options</span><b data-sum="opts">0 €</b></li>
    </ul>
    <div class="b-total">
      <p><span data-sum="once-label">Création, une fois</span><b data-sum="once">250 €</b></p>
      <p data-sum-lisse hidden><span>Site lissé, pendant 2 ans</span><b data-sum="lisse">0 €</b></p>
      <p data-sum-parrain hidden><span>Parrainage</span><b>${fidelite.parrainageMois} mois offert</b></p>
      <p><span data-sum="recur-label">Puis chaque mois</span><b data-sum="recur">20 €</b></p>
    </div>
    <p class="b-shopify" data-sum-shopify hidden>${icon('store')}<span>Chez Shopify, le forfait Basic seul coûte ${euro(shopify.basicMensuel)} par mois, sans création ni suivi. <a href="/comparatif-shopify/">Voir le comparatif</a></span></p>
    <a class="btn btn-primary btn-block btn-lg" href="/contact/#devis" data-sum-go>${icon('send')}<span>Envoyer ma demande</span></a>
    <p class="b-sum-note">Gratuit et sans engagement : je vous réponds avec un récapitulatif à valider.</p>
  </aside>
  <div class="b-bar" data-sum-bar>
    <p><b data-sum="once">250 €</b> puis <b data-sum="recur-short">20 €/mois</b></p>
    <a class="btn btn-primary btn-sm" href="/contact/#devis" data-sum-go>${icon('send')}<span>Envoyer</span></a>
  </div>
</div>`;
}

// ---------------------------------------------------------------- maquettes de l'espace client (illustrations)
function phoneEdit(alt) {
  return `<div class="phone reveal" aria-hidden="true">
  <div class="phone-top">${monster('mascotte')}<span>Mon espace</span><em>Exemple</em></div>
  <div class="phone-body chat">
    <p class="bubble me">${alt ? 'Pouvez-vous ajouter la tarte aux fraises à 4,50 € sur la carte ?' : 'Bonjour, on est fermés le lundi maintenant. Et voici la photo de notre nouvelle vitrine pour l’accueil.'}</p>
    <div class="bubble ai"><p>C’est fait, votre site est à jour :</p>
      <div class="mini-site"><i class="ms-photo"></i><i class="ms-line"></i><i class="ms-line short"></i><span class="ms-hl">${alt ? 'Tarte aux fraises : 4,50 €' : 'Fermé le lundi'}</span></div>
      <div class="bubble-actions"><span class="pill pill-go">${icon('check')}Demande terminée</span></div>
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
  <div class="phone-top">${monster('power')}<span>Publier</span><em>Exemple</em></div>
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
  const rows = [
    ['Création de la boutique', 'À faire vous-même, ou à confier à un prestataire', `Faite par moi : ${euro(b.price)}, une fois`],
    ['Abonnement', `${euro(shopify.basicMensuel)} par mois, ou ${euro(shopify.basicAnnuel)} par mois à l’année`, `${euro(forfaits[0].month)} par mois, ou ${euro(year(forfaits[0].month))} par an (forfait Chico)`],
    ['Nom de domaine', 'En plus', 'Inclus'],
    ['Mises à jour, sécurité, sauvegardes', 'À surveiller vous-même', 'Incluses'],
    ['Référencement (SEO)', 'À faire vous-même, souvent avec des applications', 'Bases faites par moi, suivi dans les forfaits'],
    ['Modifications', 'Vous-même, dans l’interface Shopify', 'Sur simple demande, je m’en occupe'],
    ['Fonctions en plus', 'Applications, souvent payantes chaque mois', 'Outils de l’espace client gratuits'],
    ['Frais par paiement par carte', `${shopify.fraisCarte} (Shopify Payments)`, `${stripe.fraisCarte} (Stripe)`],
  ];
  return `<div class="cmp reveal" role="table" aria-label="Shopify Basic comparé à une boutique ALED08">
  <div class="cmp-head" role="row"><span role="columnheader"></span><span role="columnheader" class="cmp-shop">Shopify Basic</span><span role="columnheader" class="cmp-me">${monster('mascotte')}Boutique ALED08</span></div>
  ${rows.map(([l, a, m]) => `<div class="cmp-row" role="row"><span class="cmp-label" role="rowheader">${esc(l)}</span><span class="cmp-shop" role="cell" data-label="Shopify Basic">${esc(a)}</span><span class="cmp-me" role="cell" data-label="ALED08">${esc(m)}</span></div>`).join('')}
</div>`;
}

module.exports = {
  tel, waUrl, euro, creerUrl, year, btn, btnCreer, btnWa, breadcrumbs, pageHero, steps, faq, faqItem, faqSchema, ctaBand,
  billingSwitch, billed, lisse, typeCards, payBox, forfaitMinis, forfaitCards, optPrice, optionsCompact, configurator, phoneEdit, phoneSocial, statsCard, shopifyTable,
};
