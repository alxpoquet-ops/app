// Composants HTML réutilisables
const { site, sections, types, forfaits, annuel, lissage, options, fidelite, paiement } = require('../config');
const { icon } = require('./icons');
const { monster } = require('./monsters');
const { inline, esc, plain } = require('./md');

// ---------------------------------------------------------------- liens et prix
const contactUrl = site.contactPath || '/contact/';
const euro = (n) => `${(Math.round(n * 100) / 100 % 1 ? (Math.round(n * 100) / 100).toFixed(2) : String(Math.round(n * 100) / 100)).replace('.', ',')} €`;
const withQuery = (path, params = {}) => {
  const q = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return path + (q ? '?' + q : '');
};
const creerUrl = (params = {}) => withQuery(sections.creer.path, params);
const commanderUrl = (params = {}) => withQuery(sections.commander.path, params);
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
// Bouton « Nous écrire » (formulaire de contact) : aucun numéro ni adresse personnelle sur le site
const btnWa = (cls = 'btn-light', text = 'Nous écrire') => btn(contactUrl, cls.replace('btn-wa', 'btn-light'), 'message-circle', text);

// ---------------------------------------------------------------- fil d'Ariane
function breadcrumbs(crumbs) {
  return `<nav class="crumbs" aria-label="Vous êtes ici"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.path}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

// ---------------------------------------------------------------- en-tête de page
// La pastille (couleur + icône de la rubrique) dit tout de suite où l'on est.
function pageHero({ section, h1, lead, crumbs, mascot, actions = false, compact = false }) {
  const s = section ? sections[section] : null;
  return `<section class="page-hero c-${s ? s.color : 'mint'}${compact ? ' page-hero-compact' : ''}">
  <div class="container page-hero-in${mascot ? ' has-mascot' : ''}">
    <div class="page-hero-text">
      ${crumbs ? breadcrumbs(crumbs) : ''}
      ${s ? `<p class="where">${icon(s.icon)}<span>${s.label}</span></p>` : ''}
      <h1>${inline(h1)}</h1>
      ${lead ? `<p class="lead">${inline(lead)}</p>` : ''}
      ${actions ? `<div class="hero-ctas">${btnCreer('btn-primary btn-lg btn-flaque')}${btnWa('btn-wa btn-lg')}</div>` : ''}
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
  if (!items || !items.length) return { html: '', schema: null };
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
function ctaBand({ title = 'On crée votre site ?', text = 'Choisissez votre site et votre forfait en deux minutes. Vous voyez le prix tout de suite, et vous commandez quand vous êtes prêt.', mascot = 'mascotte' } = {}) {
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

// Annotation au crayon : « Lia » écrit à la main, et une flèche qui fait un looping avant de pointer la mascotte
function flecheLia() {
  const trait = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const d = {
    L: 'M13 9C11.500 19 10.500 29 12 38.500 18.500 38.800 25 37.600 31 36',
    i: 'M37.500 22C36.300 28 36.200 34 37.400 38.500',
    a: 'M57.500 25.500C51.500 19.500 43 26 45 33.500 47 40.500 55.500 36 57.500 27 56.500 32 57.500 37.500 62 38.500',
    fleche: 'M56 54C70 40 97 44 95 62 93 77 72 78 74 63 76 50 100 52 121 73',
    pointe: 'M121 73 107.500 70.500M121 73 117.500 59.500',
  };
  const p = (k, extra = '') => `<path class="fl-${k}" pathLength="1" d="${d[k].replace(/(\.\d)00/g, '$1')}"${extra}/>`;
  return `<svg class="hero-fleche" viewBox="0 0 128 92" aria-hidden="true" focusable="false"><defs><filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="g"/><feDisplacementMap in="SourceGraphic" in2="g" scale="2.200"/></filter></defs>
<g ${trait} filter="url(#crayon)"><g stroke="#F3F0FF" stroke-width="3" transform="rotate(-7 36 24)">${p('L')}${p('i')}<path class="fl-i" d="M37.800 14.200l.300.900" stroke-width="3.600"/>${p('a')}</g>
<g stroke="#FFD45E" stroke-width="2.800">${p('fleche')}${p('pointe')}</g>
<g stroke="#FFD45E" stroke-width="1.200" opacity=".5" transform="translate(1.500 1.200)">${p('fleche')}</g></g></svg>`.replace(/(\.\d)00/g, '$1');
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
    <span class="type-qui">${inline(t.qui)}</span>
    <span class="type-go">Choisir ${icon('arrow-right')}</span>
  </a>`
    )
    .join('')}</div>`;
}

// ---------------------------------------------------------------- prix du site lissé (arrondi au centime inférieur)
// Mensualité du site payé en n fois (12 par défaut), arrondie au centime inférieur : jamais plus que le prix.
// Mensualité du reste (après l'acompte) payé en n fois à la réception du site
const acompteDe = (price) => Math.round(price * paiement.acompte) / 100;
const lisse = (price, n = lissage.durees[lissage.durees.length - 1]) => Math.floor(((price - acompteDe(price)) / n) * 100) / 100;
const LMAX = lissage.durees[lissage.durees.length - 1];
const lissageTxt = lissage.durees.join(' ou ');
// « un site une page », « un site vitrine », « une boutique en ligne »
const unType = (t) => (t.id === 'boutique' ? 'une boutique en ligne' : 'un ' + t.label.toLowerCase());

function payBox() {
  return `<div class="jetons-box reveal">
  <h3>${icon('calendar-check')}Comment payer ?</h3>
  <ul class="list-check">
    <li><strong>À la commande</strong> : ${paiement.acompte} % du site. Par exemple ${types.map((t) => `${euro(acompteDe(t.price))} pour ${unType(t)}`).join(', ')}.</li>
    <li><strong>À la réception du site</strong> : le reste en une fois, ou en ${lissageTxt} fois sans frais (engagement le temps de payer), et votre forfait démarre. Par exemple, pour ${unType(types[0])} : ${euro(types[0].price - acompteDe(types[0].price))} en une fois, ou ${euro(lisse(types[0].price))} par mois pendant ${LMAX} mois.</li>
    <li><strong>Le forfait</strong> : au mois, ou à l’année avec ${annuel.moisOfferts} mois offerts. Forfait et options se changent quand vous voulez.</li>
  </ul>
</div>`;
}

// ---------------------------------------------------------------- forfaits
// Version courte (accueil) : monstre, nom, prix, accroche
function forfaitMinis() {
  return `<div class="minis">${forfaits
    .map(
      (f) => `<article class="mini c-${f.color} reveal">
    <span class="mini-art">${monster(f.id)}</span>
    <h3 class="mini-name">${f.name}</h3>
    <span class="mini-price"><b>${euro(f.month)}</b>/mois</span>
    <ul class="mini-main">${f.main.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>
    <details class="mini-more"><summary>${icon('info')}<span>Tout ce que comprend ${f.name}</span></summary>
      <ul>${f.details.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>
    </details>
    ${btn(creerUrl({ forfait: f.id }), 'btn-light btn-block', null, `Choisir ${f.name}`)}
  </article>`
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
    <p class="plan-jetons">${icon('lightbulb')}${f.bulle || f.modifs}</p>
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
    .map((o) => `<li><span class="opt-ico">${icon(o.icon)}</span><span class="opt-txt"><strong>${esc(o.name)}${o.types ? ' <em class="opt-only">boutique</em>' : ''}</strong><small>${inline(o.desc)}</small></span><span class="opt-price">${optPrice(o.price)}</span></li>`)
    .join('')}</ul></div></div>`;
}

// ---------------------------------------------------------------- choix partagés (configurateur et page Commander)
// Données injectées dans la page pour le calcul des prix côté navigateur (le serveur recalcule tout).
function priceData() {
  return esc(
    JSON.stringify({
      types: types.map((t) => ({ id: t.id, label: t.label, price: t.price, delai: t.delai })),
      lissage: lissage.durees,
      acompte: paiement.acompte,
      forfaits: forfaits.map((f) => ({ id: f.id, name: f.name, month: f.month })),
      options: options.map((o) => ({ id: o.id, name: o.name, once: o.price.once || 0, month: o.price.month || 0, types: o.types || null })),
      free: annuel.moisOfferts,
    })
  );
}

// Cartes « type de site » (radios)
function typeChoices({ name = 'b-type', checked = 'vitrine' } = {}) {
  return `<div class="b-choices b-types">${types
    .map(
      (t) => `<label class="b-choice c-${t.color}"><input type="radio" name="${name}" value="${t.id}"${t.id === checked ? ' checked' : ''}>
        <span class="b-card"><span class="type-ico">${icon(t.icon)}</span><strong>${esc(t.label)}</strong><span class="b-price">${euro(t.price)}</span><small>${esc(t.delai)}</small><span class="b-check">${icon('check')}</span></span></label>`
    )
    .join('')}</div>`;
}

// Cartes « forfait » (radios, avec les monstres)
function forfaitChoices({ name = 'b-forfait', checked = 'power' } = {}) {
  return `<div class="b-choices b-plans">${forfaits
    .map(
      (f) => `<label class="b-choice c-${f.color}"><input type="radio" name="${name}" value="${f.id}"${f.id === checked ? ' checked' : ''}>
        <span class="b-card"><span class="b-art">${monster(f.id)}</span><strong>${f.name}</strong><span class="b-price">${billed(f.month)}</span><small>${f.modifs}</small><span class="b-check">${icon('check')}</span></span></label>`
    )
    .join('')}</div>`;
}

// Cases « options »
function optionChoices({ name = '' } = {}) {
  return `<div class="b-opts">${options
    .map(
      (o) => `<label class="b-opt"${o.types ? ` data-types="${o.types.join(' ')}"` : ''}><input type="checkbox"${name ? ` name="${name}"` : ''} value="${o.id}"><span class="b-box">${icon('check')}</span><span class="b-opt-txt"><strong>${esc(o.name)}</strong></span><em class="p-opt">${o.price.once ? euro(o.price.once) : `<span class="p-month">${euro(o.price.month)}/mois</span><span class="p-year">${euro(year(o.price.month))}/an</span>`}</em></label>`
    )
    .join('')}</div>`;
}

// Nom de domaine : saisie, extension, vérification RDAP (JS), case « j'ai déjà un nom de domaine »
function domainBox({ prefix = 'b', ownName = '' } = {}) {
  return `<div class="domain" data-domain>
        <label class="sr-only" for="${prefix}-domain">Nom de domaine souhaité</label>
        <div class="domain-bar">
          <span class="domain-www">www.</span>
          <input id="${prefix}-domain" type="text" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="mon-entreprise" maxlength="63" data-domain-name>
          <label class="sr-only" for="${prefix}-tld">Extension</label>
          <select id="${prefix}-tld" data-domain-tld><option>.fr</option><option>.com</option><option>.net</option><option>.org</option></select>
          <button type="button" class="btn btn-primary" data-domain-check>${icon('search')}<span>Vérifier</span></button>
        </div>
        <p class="domain-result" data-domain-result aria-live="polite"></p>
        <label class="b-tick"><input type="checkbox"${ownName ? ` name="${ownName}" value="1"` : ''} data-domain-own><span>J’ai déjà un nom de domaine</span></label>
      </div>`;
}

// ---------------------------------------------------------------- configurateur « Créer mon site »
function configurator() {
  const step = (n, title, hint, body, cls = '') => `<fieldset class="b-step${cls}">
      <legend><span class="b-n">${n}</span><span class="b-t">${title}</span></legend>
      ${hint ? `<p class="b-hint">${hint}</p>` : ''}
      ${body}
    </fieldset>`;
  const typeBody = `${typeChoices()}<div class="b-note b-note-types">${icon('info')}<ul>${types.map((t) => `<li><strong>${esc(t.label)}</strong> : ${inline(t.ideal)}</li>`).join('')}<li><strong>Un site plus grand ?</strong> Sur devis : <a href="/contact/">écrivez-nous</a>.</li></ul></div>`;
  const forfaitBody = `${forfaitChoices()}<p class="b-note">${icon('info')}Chico : hébergement, nom de domaine, mises à jour, ${F('chico').jetons} Jetons Lia et 1 modification par Alex. Power : SEO pour remonter sur Google, serveur plus rapide, ${F('power').jetons} Jetons Lia et 2 modifications par Alex. Titan : retour de vos ventes, ${F('titan').jetons} Jetons Lia et 2 modifications par Alex. <a href="/forfaits/">Comparer</a></p>`;
  const payChoices = `<p class="b-label">Le site</p>
      <div class="b-seg" role="radiogroup" aria-label="Paiement du site">
        <label><input type="radio" name="b-lisse" value="non" checked><span>En une fois</span></label>
        ${lissage.durees.map((n) => `<label><input type="radio" name="b-lisse" value="${n}"><span>En ${n} fois</span></label>`).join('')}
      </div>
      <p class="b-note" data-lisse-note hidden>${icon('info')}Sans frais. Engagement le temps du paiement, et le forfait se paie au mois.</p>
      <p class="b-label">Le forfait</p>
      ${billingSwitch()}`;
  const optionList = `<details class="b-options">
        <summary>${icon('plus')}<span>Ajouter des options <small>(facultatif, activables plus tard)</small></span>${icon('chevron-down')}</summary>
        ${optionChoices()}
        <p class="b-more"><a href="/forfaits/#options">Le détail de chaque option</a></p>
      </details>`;
  return `<div class="builder" data-builder="${priceData()}" data-billing-scope>
  <form class="b-steps" data-builder-form>
    ${step(1, 'Votre site', 'Le prix de création est fixe. Il comprend la maquette, le site complet et la mise en ligne.', typeBody)}
    ${step(2, 'Votre nom de domaine', 'L’adresse de votre site. Elle est comprise dans les forfaits et elle reste à votre nom.', domainBox())}
    ${step(3, 'Votre forfait', 'Votre site reste en ligne et à jour chaque mois. Les modifications, c’est Lia ou Alex, au choix.', forfaitBody)}
    ${step(4, 'Paiement', `${paiement.acompte} % du site à la commande. À la réception : le reste en une fois, ou en ${lissageTxt} fois sans frais, et le forfait démarre (au mois, ou à l’année avec deux mois offerts). Aucun engagement, sauf le temps de payer le reste en plusieurs fois.`, payChoices)}
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
      <p data-sum-lisse hidden><span data-sum="lisse-label">Site en ${LMAX} fois</span><b data-sum="lisse">0 €</b></p>
      <p data-sum-parrain hidden><span>Parrainage</span><b>${fidelite.parrainageMois} mois offert</b></p>
      <p><span data-sum="recur-label">Forfait, dès la réception, par mois</span><b data-sum="recur">20 €</b></p>
    </div>
    <div class="b-sum-actions">
      <a class="btn btn-primary btn-block btn-lg btn-flaque" href="${sections.commander.path}" data-sum-order>${icon('shopping-bag')}<span>Commander</span></a>
      <a class="btn btn-light btn-block" href="/contact/#devis" data-sum-go>${icon('message-circle')}<span>Poser une question</span></a>
    </div>
    <p class="b-sum-note">${icon('shield-check')}Paiement sécurisé par Stripe. Aujourd’hui, vous réglez seulement ${paiement.acompte} % du site. Le reste et le forfait, à la réception.</p>
  </aside>
  <div class="b-bar" data-sum-bar>
    <p data-sum="bar"><b>250 €</b> puis <b>20 €/mois</b></p>
    <a class="btn btn-primary btn-sm" href="${sections.commander.path}" data-sum-order>${icon('shopping-bag')}<span>Commander</span></a>
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

// ---------------------------------------------------------------- comparatif : Alex & Lia et les autres solutions
// Sans chiffres pour les autres solutions (fourchettes sourcées ajoutées plus tard), sans nommer de marque.
function comparatifTable() {
  const cols = ['Alex & Lia', 'Agence web', 'Freelance', 'Plateforme à faire soi-même'];
  const prixCreation = `${euro(types[0].price)} à ${euro(types[types.length - 1].price)}, prix fixe`;
  const prixMois = forfaits.map((f) => euro(f.month)).join(', ') + ' par mois, selon le forfait';
  const rows = [
    ['Qui fait le travail', 'Lia, l’IA, pour l’automatique. Alex, un humain, vérifie et règle tout.', 'Une équipe, sur devis', 'Une personne, selon son emploi du temps', 'Vous-même, avec des modèles'],
    ['Prix de création', prixCreation, 'Sur devis', 'Sur devis, selon le prestataire', 'Compris dans l’abonnement, votre temps en plus'],
    ['Prix chaque mois', prixMois, 'Contrat de maintenance, sur devis', 'Selon le prestataire, souvent en option', 'Abonnement mensuel, plus les applications en option'],
    ['Délai', `${types[0].delai} pour une page, ${types[1].delai} pour un site vitrine, ${types[2].delai} pour une boutique`, 'Selon le planning de l’équipe', 'Selon le prestataire', 'Dès que vous avez fini'],
    ['Modifications', 'Rapides et comprises : par Lia ou par Alex, au choix', 'Sur devis, ou dans un contrat', 'Sur devis', 'Vous-même'],
    ['Prix', 'Juste et affiché : rien de caché, rien au devis', 'Sur devis', 'Sur devis', 'Abonnement affiché, options en plus'],
    ['SEO', 'Bases comprises sur chaque site. Avec Power, je fais remonter votre site chaque mois', 'Souvent une prestation à part', 'Selon ses compétences', 'Vous-même, avec des applications'],
    ['Engagement', `Aucun. Seulement le temps du paiement si le reste est payé en ${lissageTxt} fois`, 'Selon le contrat', 'Selon le contrat', 'Selon l’abonnement choisi'],
  ];
  const cell = (txt, i) => `<span class="cmp-cell${i === 0 ? ' cmp-me' : ''}" role="cell" data-label="${esc(cols[i])}">${esc(txt)}</span>`;
  return `<div class="cmp cmp-4 reveal" role="table" aria-label="Alex & Lia comparé à une agence web, un freelance et une plateforme à faire soi-même">
  <div class="cmp-head" role="row"><span role="columnheader"></span>${cols.map((c, i) => `<span role="columnheader" class="cmp-cell${i === 0 ? ' cmp-me' : ''}">${i === 0 ? monster('mascotte') : ''}${esc(c)}</span>`).join('')}</div>
  ${rows.map(([l, ...cells]) => `<div class="cmp-row" role="row"><span class="cmp-label" role="rowheader">${esc(l)}</span>${cells.map(cell).join('')}</div>`).join('')}
</div>`;
}

module.exports = {
  LMAX,
  lissageTxt,
  unType,
  contactUrl, acompteDe, flecheLia, euro, creerUrl, commanderUrl, year, btn, btnCreer, btnWa, breadcrumbs, pageHero, steps, faq, faqItem, faqSchema, ctaBand,
  billingSwitch, billed, lisse, typeCards, payBox, forfaitMinis, forfaitCards, optPrice, optionsCompact, priceData, typeChoices, forfaitChoices, optionChoices, domainBox,
  configurator, phoneEdit, phoneSocial, statsCard, comparatifTable,
};
