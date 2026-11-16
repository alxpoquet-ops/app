// Composants HTML réutilisables
const { site, sections, types, forfaits, annuel, lissage, options, fidelite, paiement, creation, marche, boost } = require('../config');
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
// L'offre unique : un abonnement, des options payées une fois à la création, des extras au mois
const ABO = forfaits[0];
const optsCreation = options.filter((o) => o.quand === 'creation');
const optsMois = options.filter((o) => o.quand !== 'creation');

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
function ctaBand({ title = 'On crée votre site ?', text = 'Choisissez votre site et vos options en deux minutes. Vous voyez le prix tout de suite, et vous commandez quand vous êtes prêt.', mascot = 'mascotte' } = {}) {
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

// ---------------------------------------------------------------- types de site (même prix ; la boutique est une option)
// Le prix de création d'un type : « 500 € », et pour la boutique « 500 € + 200 € »
const prixType = (t) => (t.supplement ? `${euro(creation.prix)} + ${euro(t.supplement)}` : euro(creation.prix));
function typeCards() {
  return `<div class="types">${types
    .map(
      (t) => `<a class="type-card c-${t.color} reveal" href="${creerUrl({ type: t.id })}">
    <span class="type-ico">${icon(t.icon)}</span>
    <span class="type-name">${esc(t.label)}</span>
    <span class="type-price"><small>${t.supplement ? 'Avec un petit supplément' : 'Le même prix'}</small></span>
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
    <li><strong>À la commande</strong> : ${paiement.acompte} % du site, soit ${euro(acompteDe(creation.prix))} pour un site à ${euro(creation.prix)}.</li>
    <li><strong>À la réception du site</strong> : le reste en une fois (${euro(creation.prix - acompteDe(creation.prix))}), ou en ${lissageTxt} fois sans frais, par exemple ${euro(lisse(creation.prix))} par mois pendant ${LMAX} mois. L’abonnement démarre ce jour-là.</li>
    <li><strong>L’abonnement</strong> : ${euro(ABO.month)} par mois, ou ${euro(year(ABO.month))} par an (${annuel.moisOfferts} mois offerts). Les extras s’ajoutent et se retirent quand vous voulez.</li>
  </ul>
</div>`;
}

// ---------------------------------------------------------------- l'offre unique : le site, puis l'abonnement
const INCLUS_SITE = ['La maquette, le site complet et la mise en ligne', 'Une page ou plusieurs, jusqu’à cinq', 'Parfait sur téléphone', 'Formulaire de contact', 'Bases du SEO : Google sait lire votre site', 'Vos textes écrits avec vous'];
// compact : pour l'accueil (moins de lignes) ; choose : avec le bouton « Créer mon site »
function offre({ compact = false, choose = true } = {}) {
  const liste = (items) => `<ul class="plan-list">${items.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>`;
  return `<div class="offre reveal" id="offre">
  <div class="offre-lia">${monster('ravie')}${monster('alex')}</div>
  <div class="offre-cols">
    <article class="offre-col c-mint">
      <p class="offre-k"><span>1</span>Votre site</p>
      ${liste(compact ? INCLUS_SITE.slice(0, 4) : INCLUS_SITE)}
      ${compact ? `<p class="offre-doux">À partir de <b>${euro(creation.prix)}</b>, une fois</p>` : `<p class="offre-prix"><small>à partir de</small><b>${euro(creation.prix)}</b><small>une fois</small></p>`}
      <p class="offre-sous">${compact ? `Le même prix pour tous les sites. Payable en ${lissageTxt} fois sans frais.` : `Le même prix pour tous les sites. En ${lissageTxt} fois sans frais si vous voulez.`}</p>
    </article>
    <span class="offre-plus" aria-hidden="true">+</span>
    <article class="offre-col c-pink">
      <p class="offre-k"><span>2</span>L’abonnement</p>
      ${liste(compact ? ABO.main : ABO.features)}
      ${compact ? `<p class="offre-doux"><b>${euro(ABO.month)}</b> par mois</p>` : `<p class="offre-prix">${billed(ABO.month)}</p>`}
      <p class="offre-sous">Obligatoire, sans engagement. À l’année : ${annuel.moisOfferts} mois offerts.</p>
    </article>
  </div>
  <p class="offre-options">${icon('plus')}<span>${compact
    ? `Des options à la carte, comme la boutique en ligne, l’anglais ou la prise de rendez-vous. Les extras au mois s’ajoutent et se retirent en un clic.`
    : `En option : boutique en ligne <b>+ ${euro(creation.boutique)}</b>, ${optsCreation.slice(0, 2).map((o) => `${o.name.toLowerCase()} <b>+ ${euro(o.price.once)}</b>`).join(', ')}. Et des extras au mois, à ajouter ou retirer quand vous voulez.`}</span></p>
  ${choose ? `<p class="offre-go">${btnCreer('btn-primary btn-lg')}</p>` : ''}
</div>`;
}
// Anciens noms, gardés pour les pages qui les appellent encore
const forfaitMinis = () => offre({ compact: true });
const forfaitCards = ({ choose = true } = {}) => offre({ choose });

// Pourquoi c'est moins cher : la comparaison avec un site fait à la main, chiffres du marché à l'appui
function economie() {
  const milieu = Math.round((marche.vitrineMin + marche.vitrineMax) / 2);
  return `<div class="eco reveal">
  <h3>${icon('scale')}${marche.fois} fois moins cher qu’un site fait à la main</h3>
  <div class="eco-barres" role="img" aria-label="Un site vitrine fait à la main par un indépendant coûte en général entre ${euro(marche.vitrineMin)} et ${euro(marche.vitrineMax)}. Chez Alex & Lia : ${euro(creation.prix)}.">
    <p class="eco-ligne"><span>Site vitrine fait par un indépendant</span><i style="width:100%"></i><b>${euro(marche.vitrineMin)} à ${euro(marche.vitrineMax)}</b></p>
    <p class="eco-ligne is-nous"><span>Chez Alex & Lia</span><i style="width:${Math.max(14, Math.round((creation.prix / milieu) * 100))}%"></i><b>${euro(creation.prix)}</b></p>
  </div>
  <p>Pas de secret : Lia, l’IA, fait le gros du travail en quelques heures, et Alex vérifie tout à la main. Vous ne payez pas des semaines de travail. Le prix est le même pour tout le monde, affiché ici, sans devis.</p>
  <p class="eco-note">Nos repères : les prix publics relevés en France en 2026 pour un site vitrine de cinq pages fait par un indépendant. Une agence demande souvent plus. Il existe aussi des offres à bas prix, entre ${euro(marche.basMin)} et ${euro(marche.basMax)}, proches du nôtre.</p>
</div>`;
}

// Prix d'une option, lisible
const optPrice = (p) => (p.once ? euro(p.once) : `${euro(p.month)}/mois`);

// Les options (une fois, à la création) et les extras (au mois), en deux listes
// Le petit « i » à côté d'une option ou d'un extra : au survol ou au clic, une bulle dit ce qu'il ajoute,
// avec une capture d'exemple (src/assets/img/options/<id>.webp). Le texte est dans des attributs : main.js fait la bulle.
const CAPTURES = (() => { try { return new Set(require('fs').readdirSync(require('path').join(__dirname, '../assets/img/options')).map((f) => f.replace(/\.webp$/, ''))); } catch (e) { return new Set(); } })();
function infoBtn(id, nom, texte) {
  if (!texte) return '';
  const img = CAPTURES.has(id) ? ` data-img="/assets/img/options/${id}.webp"` : '';
  return `<button type="button" class="opt-i" data-titre="${esc(nom)}" data-info="${esc(texte)}"${img} aria-label="${esc('Voir ce que ça ajoute : ' + nom)}">${icon('info')}</button>`;
}
const BOUTIQUE = types.find((t) => t.id === 'boutique') || {};
function optionsCompact() {
  const ligne = (o) => `<li><span class="opt-ico">${icon(o.icon)}</span><span class="opt-txt"><strong>${esc(o.name)}${o.types && o.types.length === 1 && o.types[0] === 'boutique' ? ' <em class="opt-only">boutique</em>' : ''}${infoBtn(o.id, o.name, o.info)}</strong><small>${inline(o.desc)}</small></span><span class="opt-price">${o.price.once ? '+ ' + euro(o.price.once) : `${euro(o.price.month)}/mois`}</span></li>`;
  const boutique = `<li><span class="opt-ico">${icon('shopping-bag')}</span><span class="opt-txt"><strong>Boutique en ligne${infoBtn('boutique', 'Boutique en ligne', BOUTIQUE.info)}</strong><small>Vos produits, le panier, le paiement par carte et le suivi des commandes. Jusqu’à 20 produits ajoutés par moi.</small></span><span class="opt-price">+ ${euro(creation.boutique)}</span></li>`;
  return `<div class="opt-groups">
  <div class="opt-group reveal"><h3>${icon('wand-sparkles')}À la création, une fois</h3><ul>${boutique}${optsCreation.map(ligne).join('')}</ul></div>
  <div class="opt-group reveal"><h3>${icon('repeat')}Chaque mois, à ajouter ou retirer</h3><ul>${optsMois.map(ligne).join('')}</ul></div>
</div>`;
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

// Cartes « type de site » (radios) : même prix, la boutique ajoute son option
// Le site : un seul choix, le même prix pour tous. La boutique en ligne est une option payée une fois, juste en dessous
// (une case data-boutique ; main.js met alors « boutique » dans le champ caché du type de site).
function siteChoice({ name = 'b-type' } = {}) {
  return `<input type="hidden" name="${name}" value="vitrine" data-type-field>
  <div class="b-choices b-solo"><div class="b-choice c-butter"><span class="b-card is-on"><span class="type-ico">${icon('layout-grid')}</span><span class="b-solo-txt"><strong>Votre site</strong><small>Une page, ou jusqu’à cinq pages, au même prix</small></span><span class="b-price"><small>à partir de</small>${euro(creation.prix)}</span><span class="b-check">${icon('check')}</span></span></div></div>`;
}
function typeChoices({ name = 'b-type', checked = 'vitrine' } = {}) {
  return `<div class="b-choices b-types">${types
    .map(
      (t) => `<label class="b-choice c-${t.color}"><input type="radio" name="${name}" value="${t.id}"${t.id === checked ? ' checked' : ''}>
        <span class="b-card"><span class="type-ico">${icon(t.icon)}</span><strong>${esc(t.label)}${infoBtn(t.id, t.label, t.info)}</strong><span class="b-price">${prixType(t)}</span><small>${esc(t.delai)}</small><span class="b-check">${icon('check')}</span></span></label>`
    )
    .join('')}</div>`;
}

// L'abonnement : il n'y en a qu'un. Le bouton radio caché garde le nom attendu par le script et par la commande.
function forfaitChoices({ name = 'b-forfait' } = {}) {
  return `<div class="b-abo c-${ABO.color}"><input type="radio" name="${name}" value="${ABO.id}" checked hidden>
        <span class="b-art">${monster('mascotte')}</span>
        <div class="b-abo-txt"><strong>L’abonnement</strong><span class="b-price">${billed(ABO.month)}</span>
        <ul>${ABO.main.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul></div>
      </div>`;
}

// Cases « options » (une fois) et « extras » (au mois)
function optionChoices({ name = '', quand = 'tout' } = {}) {
  const prix = (o) => (o.price.once ? `+ ${euro(o.price.once)}` : `<span class="p-month">${euro(o.price.month)}/mois</span><span class="p-year">${euro(year(o.price.month))}/an</span>`);
  const ligne = (o) => `<label class="b-opt"${o.types ? ` data-types="${o.types.join(' ')}"` : ''}><input type="checkbox"${name ? ` name="${name}"` : ''} value="${o.id}"><span class="b-box">${icon('check')}</span><span class="b-opt-txt"><strong>${esc(o.name)}${infoBtn(o.id, o.name, o.info)}</strong><small>${inline((o.court || o.desc))}</small></span><em class="p-opt">${prix(o)}</em></label>`;
  const boutique = `<label class="b-opt b-opt-boutique"><input type="checkbox" value="boutique" data-boutique><span class="b-box">${icon('check')}</span><span class="b-opt-txt"><strong>Boutique en ligne${infoBtn('boutique', 'Boutique en ligne', BOUTIQUE.info)}</strong><small>Panier, paiement par carte et commandes.</small></span><em class="p-opt">+ ${euro(creation.boutique)}</em></label>`;
  const unefois = `<p class="b-label">À ajouter, une seule fois</p><div class="b-opts">${boutique}${optsCreation.map(ligne).join('')}</div>`;
  const aumois = `<p class="b-label">Extras au mois, à ajouter ou retirer quand vous voulez</p><div class="b-opts">${optsMois.map(ligne).join('')}</div>`;
  if (quand === 'creation') return unefois;
  if (quand === 'mois') return aumois;
  return unefois + aumois;
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
  const typeBody = `${siteChoice()}${optionChoices({ quand: 'creation' })}<p class="b-note">${icon('info')}Un site plus grand ? L’option « Cinq pages de plus », ou <a href="/contact/">écrivez-nous</a>.</p>`;
  const aboBody = `${forfaitChoices()}${billingSwitch()}${optionChoices({ quand: 'mois' })}<p class="b-note">${icon('info')}Un seul abonnement, pour tous les sites. Il démarre à la réception du site, et vous l’arrêtez quand vous voulez. <a href="${sections.forfaits.path}">Tout ce qu’il comprend</a></p>`;
  const payChoices = `<div class="b-seg" role="radiogroup" aria-label="Paiement du site">
        <label><input type="radio" name="b-lisse" value="non" checked><span>En une fois</span></label>
        ${lissage.durees.map((n) => `<label><input type="radio" name="b-lisse" value="${n}"><span>En ${n} fois</span></label>`).join('')}
      </div>
      <p class="b-note" data-lisse-note hidden>${icon('info')}Sans frais. Engagement le temps du paiement, et l’abonnement se paie alors au mois.</p>`;
  return `<div class="builder" data-builder="${priceData()}" data-billing-scope>
  <form class="b-steps" data-builder-form>
    ${step(1, 'Votre site', 'Tout est compris : la maquette, le site complet, parfait sur téléphone, et sa mise en ligne. Une page ou cinq, au même prix. En dessous, ce que vous pouvez ajouter, payé une seule fois.', typeBody)}
    ${step(2, 'Votre nom de domaine', 'L’adresse de votre site. Elle est comprise dans l’abonnement et elle reste à votre nom.', domainBox())}
    ${step(3, 'L’abonnement', 'Votre site reste en ligne, sûr et à jour. Nom de domaine, hébergement, support et Jetons Lia compris. En dessous, les extras au mois : rien n’est obligatoire.', aboBody)}
    ${step(4, 'Paiement du site', `${paiement.acompte} % à la commande. À la réception : le reste en une fois, ou en ${lissageTxt} fois sans frais. Aucun engagement, sauf le temps de payer le reste en plusieurs fois.`, payChoices, ' b-step-last')}
  </form>
  <aside class="b-sum" aria-live="polite">
    <p class="b-sum-title">Votre récapitulatif</p>
    <ul class="b-lines">
      <li><span data-sum="type">Votre site</span><b data-sum="type-price">${euro(creation.prix)}</b></li>
      <li><span data-sum="domain">Nom de domaine à choisir</span><b>inclus</b></li>
      <li><span data-sum="forfait">Abonnement</span><b data-sum="forfait-price">${euro(ABO.month)}/mois</b></li>
      <li data-sum-opts hidden><span>Options</span><b data-sum="opts">0 €</b></li>
    </ul>
    <div class="b-total">
      <p class="b-today"><span data-sum="today-label">Aujourd’hui : l’acompte de ${paiement.acompte} %</span><b data-sum="today">${euro(Math.round(creation.prix * paiement.acompte) / 100)}</b></p>
      <p><span data-sum="reste-label">À la réception du site : le reste</span><b data-sum="reste">${euro(creation.prix - Math.round(creation.prix * paiement.acompte) / 100)}</b></p>
      <p data-sum-parrain hidden><span>Parrainage</span><b>${fidelite.parrainageMois} mois offert</b></p>
      <p><span data-sum="recur-label">Et l’abonnement, chaque mois</span><b data-sum="recur">${euro(ABO.month)}/mois</b></p>
    </div>
    <p class="b-sum-detail" data-sum="detail">Prix total du site : ${euro(creation.prix)}.</p>
    <div class="b-sum-actions">
      <a class="btn btn-primary btn-block btn-lg btn-flaque" href="${sections.commander.path}" data-sum-order>${icon('shopping-bag')}<span>Commander</span></a>
      <a class="btn btn-light btn-block" href="/contact/#devis" data-sum-go>${icon('message-circle')}<span>Poser une question</span></a>
    </div>
    <p class="b-sum-note">${icon('shield-check')}Paiement sécurisé par Stripe. Aujourd’hui, vous réglez seulement ${paiement.acompte} % du site. Le reste et l’abonnement, à la réception.</p>
  </aside>
  <div class="b-bar" data-sum-bar>
    <p data-sum="bar"><b>${euro(creation.prix)}</b> puis <b>${euro(ABO.month)}/mois</b></p>
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
  <div class="phone-top">${monster('clin')}<span>Publier</span><em>Exemple</em></div>
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
  const prixCreation = `${euro(creation.prix)}, le même prix pour tous. Boutique en ligne : + ${euro(creation.boutique)}`;
  const prixMois = `${euro(ABO.month)} par mois, nom de domaine et hébergement compris`;
  const rows = [
    ['Qui fait le travail', 'Lia, l’IA, pour l’automatique. Alex, un humain, vérifie et règle tout.', 'Une équipe, sur devis', 'Une personne, selon son emploi du temps', 'Vous-même, avec des modèles'],
    ['Prix de création', prixCreation, 'Sur devis', 'Sur devis, selon le prestataire', 'Compris dans l’abonnement, votre temps en plus'],
    ['Prix chaque mois', prixMois, 'Contrat de maintenance, sur devis', 'Selon le prestataire, souvent en option', 'Abonnement mensuel, plus les applications en option'],
    ['Délai', `${types[0].delai} pour une page, ${types[1].delai} pour un site vitrine, ${types[2].delai} pour une boutique`, 'Selon le planning de l’équipe', 'Selon le prestataire', 'Dès que vous avez fini'],
    ['Modifications', 'Rapides et comprises : par Lia ou par Alex, au choix', 'Sur devis, ou dans un contrat', 'Sur devis', 'Vous-même'],
    ['Prix', 'Juste et affiché : rien de caché, rien au devis', 'Sur devis', 'Sur devis', 'Abonnement affiché, options en plus'],
    ['SEO', 'Bases comprises sur chaque site. Avec l’extra SEO suivi, je fais remonter votre site chaque mois', 'Souvent une prestation à part', 'Selon ses compétences', 'Vous-même, avec des applications'],
    ['Engagement', `Aucun. Seulement le temps du paiement si le reste est payé en ${lissageTxt} fois`, 'Selon le contrat', 'Selon le contrat', 'Selon l’abonnement choisi'],
  ];
  const cell = (txt, i) => `<span class="cmp-cell${i === 0 ? ' cmp-me' : ''}" role="cell" data-label="${esc(cols[i])}">${esc(txt)}</span>`;
  return `<div class="cmp cmp-4 reveal" role="table" aria-label="Alex & Lia comparé à une agence web, un freelance et une plateforme à faire soi-même">
  <div class="cmp-head" role="row"><span role="columnheader"></span>${cols.map((c, i) => `<span role="columnheader" class="cmp-cell${i === 0 ? ' cmp-me' : ''}">${i === 0 ? monster('mascotte') : ''}${esc(c)}</span>`).join('')}</div>
  ${rows.map(([l, ...cells]) => `<div class="cmp-row" role="row"><span class="cmp-label" role="rowheader">${esc(l)}</span>${cells.map(cell).join('')}</div>`).join('')}
</div>`;
}

module.exports = {
  infoBtn, siteChoice,
  LMAX,
  lissageTxt,
  unType,
  contactUrl, acompteDe, flecheLia, euro, creerUrl, commanderUrl, year, btn, btnCreer, btnWa, breadcrumbs, pageHero, steps, faq, faqItem, faqSchema, ctaBand,
  billingSwitch, billed, lisse, typeCards, payBox, forfaitMinis, forfaitCards, offre, economie, ABO, optsCreation, optsMois, prixType, optPrice, optionsCompact, priceData, typeChoices, forfaitChoices, optionChoices, domainBox,
  configurator, phoneEdit, phoneSocial, statsCard, comparatifTable,
};
