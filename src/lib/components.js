// Composants HTML réutilisables
const { site, sections, types, forfaits, annuel, lissage, options, fidelite, paiement, creation, marche, boost, aLaDemande, bande, evenement, delais, creationSeule, extrasGroupes, revisionsNote, phrase } = require('../config');
const { icon } = require('./icons');
const { monster } = require('./monsters');
const { petit, alexPortrait } = require('./bestiaire');

// ---------------------------------------------------------------- la petite famille de monstres
// Sur les pages publiques, ce sont eux qu'on voit, un peu partout. Cerise n'apparaît que dans la bulle, en bas de l'écran.
// Les anciens noms de Cerise (ses humeurs) donnent un monstre de la famille.
const PETIT_DE = { mascotte: 'mochi', bonjour: 'mochi', coucou: 'mochi', clin: 'chaton', ravie: 'etoile', pense: 'nuage', triste: 'fantome', alex: 'dino' };
// Le monstre de chaque rubrique, dans le haut de ses pages
const PETIT_SECTION = { creer: 'mochi', forfaits: 'etoile', espace: 'gelee', seo: 'nuage', contact: 'chaton', confiance: 'mochi', liaalex: 'mochi', metiers: 'dino', equipe: 'gelee', accompagnement: 'gelee', guides: 'nuage', documentation: 'fantome', lexique: 'mochi', comparatif: 'chaton', fidelite: 'etoile', methode: 'mochi', monespace: 'fantome', commander: 'etoile', confirmation: 'etoile' };
const bouille = (nom, opts) => petit(PETIT_DE[nom] || nom, opts);
// Un petit monstre posé au bord d'un bloc : place = haut-droite, haut-gauche, bas-droite, bas-gauche, cote-gauche, cote-droite
const deco = (nom, place = 'haut-droite', humeur) => `<span class="deco deco-${place}" aria-hidden="true">${petit(nom, { humeur })}</span>`;
const { inline, esc, plain } = require('./md');

// ---------------------------------------------------------------- liens et prix
const contactUrl = site.contactPath || '/contact/';
const euro = (n) => `${(Math.round(n * 100) / 100 % 1 ? (Math.round(n * 100) / 100).toFixed(2) : String(Math.round(n * 100) / 100)).replace('.', ',').replace(/^(\d+)(\d{3})(?=,|$)/, '$1 $2')} €`;
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
const ABO = forfaits[0]; // Mini : le seul abonnement (Maxi est retiré, voir forfaitsAnciens dans config.js)
// Le nom de domaine : le client a le sien (rien à ajouter), ou on le lui fournit pour DOM € de plus par mois
const DOM = ABO.domaine || 0;
const DOMAINE_REGLE = `Vous avez déjà un nom de domaine ? ${euro(ABO.month)} par mois. Vous n’en avez pas ? On vous le fournit : ${euro(ABO.month + DOM)} par mois.`;
const DOMAINE_PLUS = `+ ${euro(DOM)} par mois si on vous fournit le nom de domaine`;
const delaiTxt = (f) => f.delaiTexte || '';
// La liste d'un abonnement sans la ligne du délai (le délai a sa propre ligne sous la liste)
const sansDelai = (arr) => arr.filter((x) => !/^Délai/.test(x));
// 19 novembre 2026 : plus aucun délai annoncé pour une modification (gardé vide pour les pages qui l'appellent encore)
const DELAI_MODIF = '';
const optsCreation = options.filter((o) => o.quand === 'creation' && !o.retire);
const optsMois = options.filter((o) => o.quand === 'mois' && !o.retire);

// Prix affiché au mois ou à l'année : le sélecteur (JS) montre l'un ou l'autre
const billed = (month) => `<b>${euro(month)}</b><small>/mois</small>`;

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
function pageHero({ section, h1, lead, crumbs, mascot, actions = false, compact = false, humeur }) {
  const s = section ? sections[section] : null;
  // un petit monstre de la famille à droite du titre : celui demandé, sinon celui de la rubrique
  const art = mascot ? bouille(mascot, { humeur }) : petit(PETIT_SECTION[section] || 'mochi', { humeur });
  return `<section class="page-hero c-${s ? s.color : 'mint'}${compact ? ' page-hero-compact' : ''}">
  <div class="container page-hero-in has-mascot">
    <div class="page-hero-text">
      ${crumbs ? breadcrumbs(crumbs) : ''}
      ${s ? `<p class="where">${icon(s.icon)}<span>${s.label}</span></p>` : ''}
      <h1>${inline(h1)}</h1>
      ${lead ? `<p class="lead">${inline(lead)}</p>` : ''}
      ${actions ? `<div class="hero-ctas">${btnCreer('btn-primary btn-lg btn-flaque')}${btnWa('btn-wa btn-lg')}</div>` : ''}
    </div>
    <div class="page-hero-art" aria-hidden="true">${art}</div>
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

// ---------------------------------------------------------------- menus déroulants
// Le même dessin que la FAQ (.faq-item), pour le détail secondaire : sources, « comment payer », listes complètes, chapitres.
// ordi : ouvert d'office sur ordinateur (le petit script de fin de page, dans layout.js, ouvre les [data-ordi]) ; ouvert : ouvert partout.
function deroulant(titre, html, { id = '', ico = '', ordi = false, ouvert = false, cls = '' } = {}) {
  return `<details class="faq-item deroulant${cls ? ' ' + cls : ''}"${id ? ` id="${id}"` : ''}${ouvert ? ' open' : ''}${ordi ? ' data-ordi' : ''}><summary><span class="deroulant-titre">${ico ? icon(ico) : ''}${titre}</span>${icon('chevron-down')}</summary><div class="faq-a deroulant-corps">${html}</div></details>`;
}
const deroulants = (items) => `<div class="faq deroulants">${items.filter(Boolean).join('')}</div>`;
// Une liste « ce qui est compris » : les premières lignes visibles, la suite dans un petit déroulant (ouvert d'office sur ordinateur).
function listePlus(items, { vis = 5, ordi = true, texte = 'Voir tout ce qui est compris' } = {}) {
  const li = (x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`;
  if (items.length <= vis + 1) return `<ul class="plan-list">${items.map(li).join('')}</ul>`;
  return `<ul class="plan-list">${items.slice(0, vis).map(li).join('')}</ul><details class="liste-plus"${ordi ? ' data-ordi' : ''}><summary><span>${texte}</span>${icon('chevron-down')}</summary><ul class="plan-list">${items.slice(vis).map(li).join('')}</ul></details>`;
}

// ---------------------------------------------------------------- appel à l'action
function ctaBand({ title = 'On vous rend visible ?', text = 'Un site internet, c’est votre vitrine dans une rue où l’on passe. Choisissez le vôtre en deux minutes : le prix s’affiche tout de suite.', mascot = 'mascotte' } = {}) {
  return `<section class="cta-band"><div class="container">
  <div class="cta-box reveal">
    <div class="cta-art cta-duo" aria-hidden="true">${bouille(mascot)}${petit(mascot === 'mascotte' ? 'fantome' : 'gelee', { humeur: 'ravi' })}</div>
    <div class="cta-text"><h2>${esc(title)}</h2><p>${inline(text)}</p></div>
    <div class="cta-actions">${btnCreer('btn-primary btn-lg')}${btn(sections.forfaits.path, 'btn-light btn-lg', sections.forfaits.icon, 'Voir les tarifs')}</div>
  </div>
</div></section>`;
}

// ---------------------------------------------------------------- sélecteur au mois / à l'année
// Le paiement à l'année n'est plus proposé (novembre 2026) : Mini se paie au mois, sans engagement.
function billingSwitch() { return ''; }

// Annotation au crayon : « Cerise » écrit à la main, et une flèche qui fait un looping avant de pointer la mascotte
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

// ---------------------------------------------------------------- les trois sites (Essentiel, Visibilité, Boutique)
const prixType = (t) => euro(t.price);
function typeCards() {
  return `<div class="types">${types
    .map(
      (t) => `<a class="type-card c-${t.color} reveal" href="${creerUrl({ type: t.id })}">
    <span class="type-ico">${icon(t.icon)}</span>
    <span class="type-name">${esc(t.label)}</span>
    <span class="type-price"><b>${euro(t.price)}</b><small>une seule fois</small></span>
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
const unType = (t) => (t.id === 'boutique' ? 'un Site Boutique' : t.id === 'une-page' ? 'un Site Essentiel' : 'un Site Visibilité');

function payBox() {
  return `<ul class="list-check">
    <li><strong>À la commande</strong> : ${paiement.acompte} % du site, soit ${euro(acompteDe(creation.prix))} pour un ${ESSENTIEL.name} à ${euro(creation.prix)}.</li>
    <li><strong>À la réception du site</strong> : le reste en une fois (${euro(creation.prix - acompteDe(creation.prix))}), ou en ${lissageTxt} fois sans frais, par exemple ${euro(lisse(creation.prix))} par mois pendant ${LMAX} mois.</li>
    <li><strong>Ensuite</strong> : ${creationSeule.name}, ${euro(0)} par mois, vous gérez tout vous-même. Ou le forfait ${ABO.name}, ${euro(ABO.month)} par mois, sans engagement : on s’occupe de tout. ${DOMAINE_REGLE}</li>
  </ul>`;
}

// ---------------------------------------------------------------- l'offre finale : trois sites, puis Autonomie ou Mini
const ESSENTIEL = types[0], VISIBILITE = types[1], BOUTIQUE_T = types[2];
const INCLUS_SITE = ESSENTIEL.inclus;
// « On s'occupe de tout » (Mini) et « Je gère tout moi-même » (Autonomie)
const INCLUS_NOUS = forfaits[0].main;
const INCLUS_MOI = creationSeule.main;
const PACK_SEO = options.find((o) => o.id === 'packseo' && !o.retire);
const prixPageSeo = PACK_SEO ? PACK_SEO.price.once : 15;
const packsSeo = PACK_SEO && PACK_SEO.packs ? PACK_SEO.packs.filter((n) => n > 1).join(' ou ') : '5 ou 10';
const PLUS_DE_PAGES = `Envie d’être trouvé sur encore plus de recherches ? Une page de visibilité Google en plus coûte ${euro(prixPageSeo)}, payée une fois. Elle se commande depuis votre espace client, quand vous voulez.`;
// La boutique : le client gère tout lui-même depuis l'onglet « Ma boutique » de son espace client
const BOUTIQUE_ARTICLES = 'Vous gérez votre catalogue vous-même depuis votre espace client : photo, description, prix, autant d’articles que vous voulez.';
const BOUTIQUE_INCLUS = BOUTIQUE_T.inclus.slice(1);
const BOUTIQUE_ESPACE = ['Vos articles : photo, description, prix', 'Vos prix et vos promotions', 'Vos moyens de paiement', 'Le suivi de vos commandes'];
const BOUTIQUE_PAIEMENT = 'Vous choisissez comment on vous paie : Stripe, PayPal, virement, chèque ou paiement à la livraison. Stripe et PayPal s’installent en un clic depuis votre espace client. Vos clés de paiement sont enregistrées sur votre propre site, jamais chez nous.';
const BOUTIQUE_STOCK = 'Pas de stock à tenir si vous ne le voulez pas : un produit qui manque passe simplement en épuisé.';
const liste = (items) => `<ul class="plan-list">${items.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>`;
// Un site, en carte : nom, but, prix, ce qui est compris. compact (accueil) : quatre lignes visibles, la suite toujours repliée.
const ancreSite = (t) => (t.id === 'une-page' ? 'site-essentiel' : t.id === 'vitrine' ? 'site-visibilite' : 'site-boutique');
// Le dessin de chaque site : un petit écran qui montre ce qu'on obtient, avec son monstre posé devant.
// Essentiel : une page toute simple. Visibilité : une recherche qui trouve le site. Boutique : un store et des articles.
function siteIcone(t) {
  const INK = '#2E2A47';
  const P = {
    'une-page': { barre: '#BFE3FF', trait: '#3D84C9', doux: '#E3F2FF' },
    vitrine: { barre: '#FFE59A', trait: '#B98A10', doux: '#FFF4CF' },
    boutique: { barre: '#FFC4AC', trait: '#C2603F', doux: '#FFE3D6' },
  }[t.id] || { barre: '#DCD2FF', trait: '#6E54D6', doux: '#F1ECFF' };
  const ligne = (x, y, w, c = '#DAD5EC') => `<rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="${c}"/>`;
  let dedans = '';
  if (t.id === 'une-page') {
    dedans = `<rect x="20" y="40" width="56" height="20" rx="6" fill="${P.doux}" stroke="${P.trait}" stroke-width="2"/>
<path d="M48 45.5l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6Z" fill="#FFD75E" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
${ligne(20, 66, 40)}${ligne(20, 75, 28)}`;
  } else if (t.id === 'vitrine') {
    dedans = `<rect x="20" y="40" width="56" height="13" rx="6.5" fill="#fff" stroke="${P.trait}" stroke-width="2"/>
<circle cx="29" cy="46" r="3.2" fill="none" stroke="${INK}" stroke-width="2"/><path d="M31.4 48.4l3 3" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>${ligne(39, 44, 26, P.barre)}
<rect x="20" y="59" width="56" height="12" rx="5" fill="${P.doux}" stroke="${P.trait}" stroke-width="2"/>
<circle cx="28" cy="65" r="4.2" fill="#FFD75E" stroke="${INK}" stroke-width="1.4"/><path d="M27 63.6l1.3-.7v4.2" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>${ligne(37, 62.5, 30, P.trait)}
${ligne(20, 77, 40)}`;
  } else {
    dedans = `<path d="M18 40h60v8a5 5 0 0 1-10 0a5 5 0 0 1-10 0a5 5 0 0 1-10 0a5 5 0 0 1-10 0a5 5 0 0 1-10 0a5 5 0 0 1-10 0Z" fill="${P.barre}" stroke="${P.trait}" stroke-width="2" stroke-linejoin="round"/>
<path d="M28 40v8M38 40v8M48 40v8M58 40v8M68 40v8" stroke="${P.trait}" stroke-width="1.6"/>
<rect x="22" y="60" width="20" height="20" rx="5" fill="${P.doux}" stroke="${P.trait}" stroke-width="2"/><path d="M28 66a4 4 0 0 0 8 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
<rect x="48" y="60" width="20" height="20" rx="5" fill="#FFE1EC" stroke="#C24A80" stroke-width="2"/><path d="M58 73.5c-5-3.2-5.5-8 -2.6-8.6 1.4-.3 2.3.6 2.6 1.5.3-.9 1.2-1.8 2.6-1.5 2.9.6 2.4 5.4-2.6 8.6Z" fill="#FF8FB8" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>`;
  }
  const monstre = petit(t.monstre, { humeur: 'ravi' }).replace('<svg class="petit', '<svg x="60" y="56" width="62" height="62" class="petit');
  return `<svg class="site-ico" viewBox="0 0 124 120" aria-hidden="true" focusable="false">
<ellipse cx="50" cy="104" rx="42" ry="5" fill="${INK}" opacity=".16"/>
<rect x="8" y="14" width="80" height="84" rx="14" fill="#FFFBF5" stroke="${INK}" stroke-width="3.2"/>
<path d="M8 28a14 14 0 0 1 14-14h52a14 14 0 0 1 14 14v6H8Z" fill="${P.barre}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
<circle cx="20" cy="24.5" r="2.6" fill="#FF8FB8"/><circle cx="29" cy="24.5" r="2.6" fill="#FFD75E"/><circle cx="38" cy="24.5" r="2.6" fill="#7BDDB1"/>
${dedans}
<path d="M98 16l1.9 4.6 4.6 1.9-4.6 1.9-1.9 4.6-1.9-4.6-4.6-1.9 4.6-1.9Z" fill="#FFD75E" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
<circle cx="110" cy="38" r="2.4" fill="#FF8FB8"/>
${monstre}
</svg>`;
}
function siteOffreCarte(t, { compact = false, choose = true } = {}) {
  return `<article class="site-carte c-${t.color}${t.vedette ? ' is-vedette' : ''} reveal"${compact ? '' : ` id="${ancreSite(t)}"`}>
    ${t.vedette ? '<span class="site-tag">Le plus choisi</span>' : ''}
    <span class="site-art" aria-hidden="true">${siteIcone(t)}</span>
    <p class="site-nom">${esc(t.name)}</p>
    <p class="site-but">${icon('arrow-right')}<span>${esc(t.but)}</span></p>
    <p class="site-prix"><b>${euro(t.price)}</b><small>une seule fois</small></p>
    ${listePlus(t.inclus, { vis: compact ? 4 : 5, ordi: !compact })}
    ${choose ? `<p class="site-go"><a class="btn ${t.vedette ? 'btn-primary' : 'btn-light'}" href="${creerUrl({ type: t.id })}">${icon('wand-sparkles')}<span>Choisir ce site</span></a></p>` : ''}
  </article>`;
}
// Autonomie ou Mini, en carte
function formuleCarte(f, { compact = false } = {}) {
  const seule = f.id === creationSeule.id;
  return `<article class="formule c-${f.color}${seule ? ' is-autonomie' : ' is-mini'} reveal">
    <span class="formule-art" aria-hidden="true">${petit(seule ? 'chaton' : 'maxi')}</span>
    <p class="formule-nom">${seule ? '' : 'Forfait '}${esc(f.name)}</p>
    <p class="formule-prix">${seule ? `<b>${euro(0)}</b><small>/mois</small>` : billed(f.month)}</p><p class="formule-sans">${seule ? 'Vous gérez tout vous-même' : 'Sans engagement, on s’occupe de tout'}</p>${seule ? '' : `<p class="formule-plus">${DOMAINE_PLUS}</p>`}
    ${compact ? '' : liste(f.main.filter((x) => !/^Nom de domaine fourni/.test(x)))}
  </article>`;
}
// compact : pour l'accueil (moins de lignes) ; choose : avec les boutons
// Deux choses bien séparées : « Créer le site » (une seule fois) et « Le faire vivre » (Autonomie ou Mini).
function offre({ compact = false, choose = true } = {}) {
  return `<div class="offre offre-finale${compact ? ' is-compact' : ''}" id="offre">
  <p class="offre-k"><span>1</span>Créer votre site : payez une seule fois</p>
  <div class="site-cartes">${types.map((t) => siteOffreCarte(t, { compact, choose })).join('')}</div>
  <p class="offre-sous">${icon('calendar-check')}<span>${paiement.acompte} % à la commande, le reste à la réception. Payable en ${lissageTxt} fois sans frais.</span></p>
  ${compact ? '' : `<p class="offre-note">${esc(revisionsNote)}</p>`}
  <p class="offre-k"><span>2</span>Ensuite, ${esc(creationSeule.name)} ou le forfait ${esc(ABO.name)}</p>
  <div class="formules is-duo">${[creationSeule, ...forfaits].map((f) => formuleCarte(f, { compact })).join('')}</div>
  <p class="offre-sous">${icon('heart-handshake')}<span>Aucune obligation d’abonnement. Le forfait ${ABO.name} : ${euro(ABO.month)} par mois, sans engagement, ou ${euro(ABO.month + DOM)} si on vous fournit le nom de domaine.</span></p>
  ${choose ? `<p class="offre-go">${btnCreer('btn-primary btn-lg')}${compact ? btn(sections.forfaits.path, 'btn-light btn-lg', sections.forfaits.icon, 'Voir les tarifs') : ''}</p>` : ''}
</div>`;
}
// Le positionnement, en trois lignes : chaque site a son but
function positionnement() {
  return `<ul class="posi reveal">${types.map((t) => `<li class="c-${t.color}"><a href="${creerUrl({ type: t.id })}"><span class="posi-art" aria-hidden="true">${siteIcone(t)}</span><strong>${esc(t.name)}</strong>${icon('arrow-right')}<em>${esc(t.but)}</em></a></li>`).join('')}</ul>`;
}
// Anciens noms, gardés pour les pages qui les appellent encore
const forfaitMinis = () => offre({ compact: true });
const forfaitCards = ({ choose = true } = {}) => offre({ choose });

// Pourquoi c'est moins cher : la comparaison avec un site fait à la main, chiffres du marché à l'appui.
// On compare ce qui est comparable (un site de marche.pagesCompare pages, comme le nôtre, avec les bases du référencement), on dit la vérité
// et on cite les sources (marche.sources, consultées en novembre 2026). marche.fois et marche.entretienFois sont calculés dans config.js.
const INDEPENDANT_DES = 800; // des indépendants existent dès ce prix : l'écart n'est alors que de INDEPENDANT_DES / creation.prix fois
const ecartBas = String(Math.round((INDEPENDANT_DES / creation.visibilite) * 10) / 10).replace('.', ',');
// Les sources, en vrais liens
const nomSource = (x) => x.nom.replace(', ', ' : ');
function sourcesMarche() {
  const l = (marche.sources || []).map((x) => `<li><a href="${x.url}" target="_blank" rel="noopener">${esc(nomSource(x))}</a>.</li>`).join('');
  return `<div class="sources"><p class="sources-titre"><strong>Sources</strong>, consultées en novembre 2026 :</p><ul>${l}</ul></div>`;
}
// Les mêmes sources en markdown, pour les pages de contenu (les liens externes s'ouvrent dans un nouvel onglet)
const sourcesMd = () => (marche.sources || []).map((x) => `- [${nomSource(x)}](${x.url}).`).join('\n');
const sourcesInline = () => (marche.sources || []).map((x) => `[${nomSource(x)}](${x.url})`).join(', ');
function economie() {
  const n = marche.pagesCompare || creation.pages;
  const mAgence = (marche.agenceMin + marche.agenceMax) / 2;
  const mInde = (marche.vitrineMin + marche.vitrineMax) / 2;
  const w = (x) => `${Math.max(6, Math.round((x / mAgence) * 100))}%`;
  return `<div class="eco reveal">
  <h3>${icon('scale')}${marche.fois} fois moins cher qu’un indépendant, à site comparable</h3>
  <p class="eco-base">On compare un site de ${n} pages chez un indépendant ou dans une agence avec notre ${VISIBILITE.name}, qui va jusqu’à ${creation.pages} pages.</p>
  <div class="eco-barres" role="img" aria-label="Un site de ${n} pages coûte en général ${euro(marche.agenceMin)} à ${euro(marche.agenceMax)} en agence, ${euro(marche.vitrineMin)} à ${euro(marche.vitrineMax)} chez un indépendant. Notre ${VISIBILITE.name}, jusqu’à ${creation.pages} pages : ${euro(creation.visibilite)}.">
    <p class="eco-ligne"><span>Agence</span><i style="width:${w(mAgence)}"></i><b>${euro(marche.agenceMin)} à ${euro(marche.agenceMax)}</b></p>
    <p class="eco-ligne"><span>Indépendant</span><i style="width:${w(mInde)}"></i><b>${euro(marche.vitrineMin)} à ${euro(marche.vitrineMax)}</b></p>
    <p class="eco-ligne is-nous"><span>Notre ${VISIBILITE.name}</span><i style="width:${w(creation.visibilite)}"></i><b>${euro(creation.visibilite)}</b></p>
  </div>
  <p>Pas de secret : une méthode bien rodée, des outils préparés à l’avance, et pas de bureaux à payer.</p>
  ${deroulants([
    deroulant('Et pour l’entretien, chaque mois ?', `<p>Avec le forfait ${ABO.name}, ${euro(ABO.month)} par mois comprennent l’hébergement, les sauvegardes, la sécurité, la maintenance et les modifications (${euro(ABO.month + DOM)} si on vous fournit aussi le nom de domaine). Les prestataires consultés demandent ${euro(marche.entretienMin)} à ${euro(marche.entretienMax)} par mois, l’hébergement étant souvent en plus : c’est de ${marche.entretienFois} fois moins cher.</p>`),
    deroulant('Nos sources, et ce qu’il faut en penser', `<p>Soyons honnêtes. Ces fourchettes sont publiées par des prestataires, donc à lire avec prudence. Il existe des indépendants dès ${euro(INDEPENDANT_DES)}, et l’écart est alors très faible (environ ${ecartBas} fois), ainsi que des offres à bas prix.</p>${sourcesMarche()}`, { id: 'sources' }),
  ])}
</div>`;
}

// Prix d'une option, lisible
const optPrice = (p) => (p.once ? euro(p.once) : `${euro(p.month)}/mois`);

// Les options (une fois, à la création) et les extras (au mois), en deux listes
// Le petit « i » à côté d'une option ou d'un extra : au survol ou au clic, une bulle dit ce qu'il ajoute,
// avec une capture d'exemple (src/assets/img/options/<id>.webp). Le texte est dans des attributs : main.js fait la bulle.
const CAPTURES = (() => { try { return new Set(require('fs').readdirSync(require('path').join(__dirname, '../assets/img/options')).map((f) => f.replace(/\.webp$/, ''))); } catch (e) { return new Set(); } })();
// Le nom d'une option suivi de son « i » : le dernier mot et le bouton restent sur la même ligne
function nomI(nom, id, texte, entre = '') {
  const i = nom.lastIndexOf(' ');
  return `${i > 0 ? esc(nom.slice(0, i + 1)) : ''}<span class="nw">${esc(nom.slice(i + 1))}${entre}${infoBtn(id, nom, texte)}</span>`;
}
function infoBtn(id, nom, texte) {
  if (!texte) return '';
  const img = CAPTURES.has(id) ? ` data-img="/assets/img/options/${id}.webp"` : '';
  return `<button type="button" class="opt-i" data-titre="${esc(nom)}" data-info="${esc(texte)}"${img} aria-label="${esc('Voir ce que ça ajoute : ' + nom)}">${icon('info')}</button>`;
}
const BOUTIQUE = types.find((t) => t.id === 'boutique') || {};
// Le petit monstre qui s'occupe de chaque option
const MONSTRE_OPTION = { packseo: 'gelee', boutique: 'mochi' };
// La petite bande (six monstres), en cartes : métier, missions et personnalité. complet : avec les missions (pages Équipe et Accueil).
function bandeGrid({ complet = false, prix = true } = {}) {
  const prixDe = () => '';
  const art = (b) => (b.monstre === 'lia' ? monster('coucou') : petit(b.monstre));
  return `<div class="bande">${bande
    .map((b) => `<div class="bande-carte reveal${b.compris ? ' is-compris' : ''}"><span class="bande-art">${art(b)}</span><strong>${esc(b.nom)}<small>${esc(b.role)}</small></strong>${complet && b.missions ? `<ul class="bande-missions">${b.missions.map((m) => `<li>${esc(m)}</li>`).join('')}</ul><em class="bande-perso">${esc(b.perso)}</em>` : `<span class="bande-fait">${inline(b.court)}</span>`}</div>`)
    .join('')}</div>`;
}
// Le Site Boutique, expliqué simplement
function optionsCompact() {
  return `<p>Vos clients achètent sur votre site, même quand vous êtes fermé. Tout se gère depuis l’onglet « Ma boutique » de votre espace client : vos articles, vos prix et vos promotions, vos moyens de paiement, la livraison et le suivi de vos commandes.</p><p>${BOUTIQUE_ARTICLES}</p><p>${BOUTIQUE_PAIEMENT} La boutique est un outil : elle ne promet aucune vente.</p>`;
}
// Plus d'extras à la demande (offre simplifiée) : gardé pour les pages qui l'appellent encore
function extrasDemande() { return ''; }

// ---------------------------------------------------------------- les extras (tout se prend à la carte, depuis l'espace client)
// Les prix viennent de config.js : aLaDemande (payés une fois, sauf retire: true) et options au mois (price.month, sauf retire: true),
// regroupés par famille (extrasGroupes). Le champ `groupe` des premiers et `group` des seconds dit la famille.
const EXTRAS_UNE_FOIS = aLaDemande.filter((x) => !x.retire);
const EXTRAS_MOIS = options.filter((o) => o.quand === 'mois' && !o.retire && o.price && o.price.month);
const UNITE = { page: 'la page', article: 'l’article', produit: 'le produit' };
const listeDe = (l) => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ou ${l[l.length - 1]}` : l.join(''));
const EXTRA_EMOJI = { packseo: '📈', anglais: '🌍', specifique: '⚙️' };
const EXTRAS_PAR_FAMILLE = extrasGroupes
  .map((g) => ({
    ...g,
    items: [
      ...EXTRAS_UNE_FOIS.filter((x) => x.groupe === g.id).map((x) => ({ id: x.id, name: x.name, icon: x.icon, desc: x.court || x.desc, fois: x.prix, mois: 0, packs: x.packs || null, unite: x.unite || '', badge: x.badge || '', devis: !!x.devis, inclus: x.inclus || null })),
      ...EXTRAS_MOIS.filter((o) => o.group === g.id).map((o) => ({ id: o.id, name: o.name, icon: o.icon, desc: o.court || o.desc, fois: 0, mois: o.price.month, packs: null, unite: '', badge: o.badge || '' })),
    ],
  }))
  .filter((g) => g.items.length);
// « 15 € une fois », « 5 €/mois », ou « à partir de 5 € la page » quand il existe des packs
const prixExtra = (x) => (x.devis ? 'sur devis' : x.mois ? `${euro(x.mois)}/mois` : x.packs ? `à partir de ${euro(x.fois)} ${UNITE[x.unite] || ''}`.trim() : `${euro(x.fois)} une fois`);
const prixExtraHtml = (x) => (x.devis ? '<b>Sur devis</b>' : x.packs ? `<b>${euro(x.fois)}</b><small>${UNITE[x.unite] || 'une fois'}</small>` : x.mois ? `<b>${euro(x.mois)}</b><small>/mois</small>` : x.packs ? `<small>à partir de</small><b>${euro(x.fois)}</b><small>${UNITE[x.unite] || 'une fois'}</small>` : `<b>${euro(x.fois)}</b><small>une fois</small>`);
const packsTxt = () => '';
function extrasListe() {
  const tous = EXTRAS_PAR_FAMILLE.flatMap((g) => g.items);
  return `<div class="extras-cartes">${tous
    .map((x) => `<article class="extra-carte reveal"><span class="opt-ico">${icon(x.icon)}</span><h3>${esc(x.name)}</h3><p class="extra-prix">${prixExtraHtml(x)}</p><p>${inline(x.desc)}</p></article>`)
    .join('')}</div>
<p class="opt-note extras-note">${icon('circle-user')}<span>Une page de visibilité Google se paie par carte, au moment de la commander. Pour un devis, vous décrivez votre besoin et vous recevez un prix, sans engagement.</span></p>`;
}

// ---------------------------------------------------------------- l'offre événement
// prix : false sur l'accueil (pas de prix affiché, seulement la remise en pourcentage)
function offreEvenement() { return ''; } // l'offre événement est retirée (17 novembre 2026)

// ---------------------------------------------------------------- comment se passe une modification
// 17 novembre 2026 : Cerise aide à formuler la demande, le client confirme, Alex fait la modification à la main.
const CERISE = (bande.find((b) => b.id === 'support') || { nom: 'Cerise' }).nom;
const BRICOU = (bande.find((b) => b.id === 'constructeur') || { nom: 'Bricou' }).nom;
const PEPITE = (bande.find((b) => b.id === 'extras') || { nom: 'Pépite' }).nom;
const ETAPES_MODIF = [
  ['message-circle', 'Vous écrivez votre demande', 'Dans votre espace client, avec vos mots, et une photo si besoin.'],
  ['list-checks', `${BRICOU} la clarifie avec vous`, 'Il pose les bonnes questions, vous la résume, et vous dites oui.'],
  ['wrench', 'Alex fait la modification', 'Bricou lui envoie votre demande, bien claire. Vos visiteurs voient ensuite la nouvelle version.'],
];
// Un petit monstre qui présente un bloc (Pépite et les extras, Bricou et les modifications)
function presente(monstre, html, { humeur } = {}) {
  return `<div class="presente reveal"><span class="presente-art" aria-hidden="true">${petit(monstre, { humeur })}</span><p>${html}</p></div>`;
}
function processusModif({ titre = true } = {}) {
  return `<!--commun--><div class="modif-etapes reveal">
  ${titre ? `<h3>${icon('repeat')}Comment se passe une modification</h3>` : ''}
  <ol>${ETAPES_MODIF.map(([ic, t, d], i) => `<li><span class="modif-n">${i + 1}</span><span class="modif-ico">${icon(ic)}</span><span><strong>${esc(t)}</strong><small>${esc(d)}</small></span></li>`).join('')}</ol>
  <p class="modif-delai">${icon('timer')}<span>Une demande à la fois. Vous pouvez annuler une demande tant qu’elle n’est pas commencée.</span></p>
</div><!--/commun-->`;
}

// ---------------------------------------------------------------- choix partagés (configurateur et page Commander)
// Données injectées dans la page pour le calcul des prix côté navigateur (le serveur recalcule tout).
function priceData() {
  return esc(
    JSON.stringify({
      types: types.map((t) => ({ id: t.id, label: t.label, price: t.price, delai: t.delai })),
      lissage: lissage.durees,
      acompte: paiement.acompte,
      forfaits: [...forfaits, ...(creationSeule ? [creationSeule] : [])].map((f) => ({ id: f.id, name: f.name, month: f.month })),
      options: options.filter((o) => !o.retire).map((o) => ({ id: o.id, name: o.name, once: o.price.once || 0, month: o.price.month || 0, types: o.types || null })),
      remise: evenement.remise,
      free: annuel.moisOfferts,
      domaine: forfaits[0].domaine || 0,
      pages: creation.pages,
      pagePlus: 0,
      pagesPlusMax: creation.pagesPlusMax,
    })
  );
}

// Autonomie, expliquée en une carte (page Tarifs)
function creationSeuleBox() {
  if (!creationSeule) return '';
  return `<p>C’est possible, et c’est ${euro(0)} par mois. Vous payez seulement votre site. On vous le remet prêt à installer, et vous gérez votre hébergement, votre nom de domaine (l’adresse de votre site), vos sauvegardes et vos mises à jour.</p>
  <p>Sans abonnement, la maintenance et les modifications ne sont pas comprises. Si un jour vous changez d’avis, le forfait ${ABO.name} peut s’ajouter quand vous voulez.</p>`;
}

// ---------------------------------------------------------------- le parcours de commande, en grandes cartes (novembre 2026)
// 1. le site (toujours compris)  2. la boutique (la seule option)  3. qui s'occupe de la mise en ligne : nous (une formule)
// ou moi (création seule, le code est fourni)  4. le nom de domaine et 5. la formule, seulement avec « nous »  6. le total.
const cfLi = (x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`;
// vis : lignes visibles ; la suite se déplie (« Voir tout ce qui est compris »), ouverte d'office sur ordinateur
const cfListe = (items, vis = 4) => (items.length <= vis + 1
  ? `<ul class="cf-liste">${items.map(cfLi).join('')}</ul>`
  : `${vis ? `<ul class="cf-liste">${items.slice(0, vis).map(cfLi).join('')}</ul>` : ''}<details class="liste-plus" data-ordi><summary><span>Voir tout ce qui est compris</span>${icon('chevron-down')}</summary><ul class="cf-liste">${items.slice(vis).map(cfLi).join('')}</ul></details>`);
// Le site : trois grandes cartes à choisir (Essentiel, Visibilité, Boutique). name : le champ envoyé (une-page | vitrine | boutique).
function siteCarte({ name = 'b-type', court = false } = {}) {
  return `<div class="cf-trio" role="radiogroup" aria-label="Quel site voulez-vous" data-type-choix>
    ${types.map((t) => `<label class="cf-choix c-${t.color}">
      <input type="radio" name="${name}" value="${t.id}"${t.vedette ? ' checked' : ''} class="cf-input">
      <span class="cf-carte">
        ${t.vedette ? '<span class="cf-tag">Le plus choisi</span>' : ''}
        <span class="cf-art" aria-hidden="true">${petit(t.monstre)}</span>
        <span class="cf-corps">
          <strong class="cf-nom">${esc(t.name)}</strong>
          <span class="cf-but">${esc(t.but)}</span>
          <span class="cf-prix"><b>${euro(t.price)}</b><small>une fois</small></span>
          ${court ? `<span class="cf-txt">${esc(t.pitch)}</span>` : cfListe(t.inclus)}
        </span>
        <span class="cf-coche" aria-hidden="true">${icon('check')}</span>
      </span>
    </label>`).join('')}
  </div>`;
}
// Plus de case « boutique » : le Site Boutique est l'un des trois sites
function boutiqueCarte() { return ''; }
// Qui s'occupe de la mise en ligne ? Deux grandes cartes. name : le champ envoyé (nous | moi).
function gestionChoix({ name = 'b-gestion', court = false } = {}) {
  return `<div class="cf-duo" role="radiogroup" aria-label="Qui s’occupe de la mise en ligne de votre site">
    <label class="cf-choix c-mint">
      <input type="radio" name="${name}" value="nous" checked class="cf-input">
      <span class="cf-carte">
        <span class="cf-tag">Le plus simple</span>
        <span class="cf-art" aria-hidden="true">${petit('dino', { humeur: 'ravi' })}</span>
        <span class="cf-corps">
          <strong class="cf-nom">Forfait ${esc(ABO.name)} : on s’occupe de tout</strong>
          <span class="cf-prix"><b>${euro(ABO.month)}</b><small>/mois, sans engagement</small></span>
          <span class="cf-but">${DOMAINE_PLUS}</span>
          <span class="cf-txt">On installe votre site, puis on veille sur lui chaque mois. Vos modifications sont incluses.</span>
          ${court ? '' : cfListe(INCLUS_NOUS, 0)}
        </span>
        <span class="cf-coche" aria-hidden="true">${icon('check')}</span>
      </span>
    </label>
    <label class="cf-choix c-peach">
      <input type="radio" name="${name}" value="moi" class="cf-input">
      <span class="cf-carte">
        <span class="cf-art" aria-hidden="true">${petit('chaton')}</span>
        <span class="cf-corps">
          <strong class="cf-nom">${esc(creationSeule.name)} : vous gérez tout vous-même</strong>
          <span class="cf-prix"><b>${euro(0)}</b><small>/mois, sans abonnement</small></span>
          <span class="cf-txt">Vous gérez votre nom de domaine, votre hébergement et l’installation. On vous remet votre site, prêt à installer.</span>
        </span>
        <span class="cf-coche" aria-hidden="true">${icon('check')}</span>
      </span>
    </label>
  </div>
  <p class="cf-info c-peach" data-seule-txt hidden>${icon('book-open')}<span>Besoin d’un coup de main pour l’installer ? Votre hébergeur a ses propres guides pas à pas, et on trouve beaucoup de tutoriels gratuits sur internet. Sans abonnement, la maintenance et les modifications ne sont pas comprises. Le forfait ${esc(ABO.name)} peut s’ajouter plus tard.</span></p>`;
}
// L'abonnement : un seul (Mini), en grande carte claire, déjà comprise. name : le champ envoyé (base).
function formulesChoix({ name = 'b-forfait', court = false } = {}) {
  const f = ABO;
  if (court === 'sans-carte') return `<input type="hidden" name="${name}" value="${f.id}">`;
  return `<input type="hidden" name="${name}" value="${f.id}">
  <div class="cf-site cf-abo c-${f.color}">
    <span class="cf-art cf-art-maxi" aria-hidden="true">${petit('maxi', { humeur: 'ravi' })}</span>
    <div class="cf-corps">
      <p class="cf-nom">Le forfait ${esc(f.name)}</p>
      <p class="cf-prix"><b>${euro(f.month)}</b><small>/mois, sans engagement</small></p>
      ${court ? `<p class="cf-txt">${f.main.slice(0, 5).join(', ')}, et vos modifications incluses.</p>` : `<!--commun-->${cfListe(f.main)}<!--/commun-->`}
    </div>
    <span class="cf-badge">${icon('check')}Tout compris</span>
  </div>`;
}
// Comment payer le site : en une fois, ou étalé (6 ou 12 fois sans frais). main.js écrit les montants.
function paiementChoix({ name = 'b-lisse', une = 'non' } = {}) {
  return `<div class="cf-paie" role="radiogroup" aria-label="Comment payer votre site">
    <label class="cf-choix"><input type="radio" name="${name}" value="${une}" checked class="cf-input"><span class="cf-carte"><strong>En une fois</strong><small data-sum="p-0" data-order="p-0"></small><span class="cf-coche" aria-hidden="true">${icon('check')}</span></span></label>
    ${lissage.durees.map((n) => `<label class="cf-choix"><input type="radio" name="${name}" value="${n}" class="cf-input"><span class="cf-carte"><strong>En ${n} fois sans frais</strong><small data-sum="p-${n}" data-order="p-${n}"></small><span class="cf-coche" aria-hidden="true">${icon('check')}</span></span></label>`).join('')}
  </div>
  <p class="cf-info" data-lisse-note hidden>${icon('info')}<span>Sans frais. Vous vous engagez le temps du paiement<span data-avec-formule>, et le forfait se règle alors chaque mois</span>.</span></p>`;
}

// Cases « options » (une fois) et « extras » (au mois)
// Pages en plus : un compteur (0 à pagesPlusMax), payé une fois. name : le champ envoyé avec la commande.
function pagesPlusBox() { return ''; }
function optionChoices() { return ''; }

// Le code événement (foire, marché, salon) : -20 % sur la création. Vérifié par le serveur à la commande.
function codeEvenementBox({ name = '' } = {}) {
  return `<div class="b-code" data-code-box>
  <label for="${name || 'b-code'}"><strong>${icon('ticket')}Code promo</strong><small>Vous avez un code promo ? Entrez-le ici.</small></label>
  <input id="${name || 'b-code'}" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="30" placeholder="Votre code (facultatif)"${name ? ` name="${name}"` : ''} data-code-evenement>
  <p class="b-code-etat" data-code-etat aria-live="polite"></p>
</div>`;
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
// Une seule colonne, de haut en bas : le site, la boutique, qui s'occupe de la mise en ligne, puis (avec nous) le nom de
// domaine et la formule, et enfin le total avec la façon de payer. Les étapes se numérotent toutes seules (CSS), même
// quand celles de la formule sont cachées.
function configurator() {
  const etape = (titre, sous, body, attrs = '') => `<section class="cf-etape"${attrs}>
      <h2 class="cf-titre"><span class="cf-n" aria-hidden="true"></span>${titre}</h2>
      ${sous ? `<p class="cf-sous">${sous}</p>` : ''}
      ${body}
    </section>`;
  const P0 = VISIBILITE.price; // le site coché au départ
  const acompte0 = Math.round(P0 * paiement.acompte) / 100;
  const partie = (couleur, titre, texte, attrs = '') => `<div class="cf-partie c-${couleur}"${attrs}><p class="cf-partie-titre">${titre}</p><p class="cf-partie-txt">${texte}</p></div>`;
  return `<div class="builder cf" data-builder="${priceData()}" data-billing-scope>
  <form class="cf-form" data-builder-form>
    ${partie('butter', 'Créer votre site : payez une seule fois', `Ou en ${lissageTxt} fois sans frais, si vous préférez.`)}
    ${etape('Quel site voulez-vous ?', 'Exister sur internet, être trouvé sur Google, ou vendre sur internet.', `${siteCarte()}<p class="cf-info c-butter">${icon('info')}<span>${esc(revisionsNote)}</span></p>`)}
    ${partie('lilac', `Ensuite, ${esc(creationSeule.name)} ou le forfait ${esc(ABO.name)}`, 'Aucune obligation d’abonnement : c’est vous qui choisissez.')}
    ${etape('Qui s’occupe de votre site ?', 'L’hébergement, le nom de domaine, les sauvegardes et les mises à jour : on s’en charge, ou vous le faites vous-même.', gestionChoix())}
    ${etape('Votre nom de domaine', `C’est l’adresse de votre site, par exemple mon-entreprise.fr. Vous en avez déjà une ? Cochez la case : ${euro(ABO.month)} par mois. Sinon, on vous la fournit, à votre nom : ${euro(ABO.month + DOM)} par mois.`, domainBox(), ' data-avec-formule')}
    ${etape(`Le forfait ${esc(ABO.name)}`, `${euro(ABO.month)} par mois, sans engagement. Il démarre à la réception du site, et vous l’arrêtez quand vous voulez.`, `${formulesChoix({ court: 'sans-carte' })}<p class="cf-plus-tard">${icon('plus')}<span>Les extras (page de visibilité Google, traduction anglaise, fonctionnalité spécifique) se demandent plus tard, depuis votre espace client. <a href="${sections.forfaits.path}#extras">Voir les extras</a></span></p>`, ' data-avec-formule')}
    <section class="cf-etape cf-total b-sum" id="cf-total" aria-live="polite">
      <h2 class="cf-titre"><span class="cf-n" aria-hidden="true"></span>Votre total</h2>
      <ul class="cf-lignes">
        <li><span data-sum="type">${esc(VISIBILITE.name)}</span><b data-sum="type-price">${euro(P0)}</b></li>
        <li data-sum-remise hidden><span>Code promo (- ${evenement.remise} %)</span><b data-sum="remise">0 €</b></li>
        <li><span data-sum="forfait">Forfait ${esc(ABO.name)}</span><b data-sum="forfait-price">${euro(ABO.month)}/mois</b></li>
        <li data-avec-formule><span data-sum="domain">Nom de domaine fourni</span><b data-sum="domain-prix">+ ${euro(DOM)}/mois</b></li>
      </ul>
      <p class="cf-q">Comment voulez-vous payer votre site ?</p>
      ${paiementChoix()}
      ${codeEvenementBox()}
      <div class="cf-recap">
        <p class="cf-auj"><span data-sum="today-label">Aujourd’hui, l’acompte de ${paiement.acompte} %</span><b data-sum="today">${euro(acompte0)}</b></p>
        <p><span data-sum="reste-label">À la réception du site, le reste</span><b data-sum="reste">${euro(P0 - acompte0)}</b></p>
        <p><span data-sum="recur-label">Ensuite, chaque mois</span><b data-sum="recur">${euro(ABO.month + DOM)}/mois</b></p>
      </div>
      <p class="cf-detail" data-sum="detail">Prix total du site : ${euro(P0)}.</p>
      <div class="cf-actions">
        <a class="btn btn-primary btn-lg btn-flaque" href="${sections.commander.path}" data-sum-order>${icon('shopping-bag')}<span>Commander</span></a>
        <a class="btn btn-light btn-lg" href="/contact/#devis" data-sum-go>${icon('message-circle')}<span>Nous écrire</span></a>
      </div>
      <p class="cf-secu">${icon('shield-check')}<span>Paiement sécurisé par Stripe. Aujourd’hui, vous réglez seulement ${paiement.acompte} % du site.</span></p>
    </section>
  </form>
  <div class="b-bar" data-sum-bar>
    <p data-sum="bar"><b>${euro(P0)}</b> puis <b>${euro(ABO.month + DOM)}/mois</b></p>
    <a class="btn btn-primary btn-sm" href="#cf-total" data-sum-total>${icon('arrow-right')}<span>Mon total</span></a>
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

// ---------------------------------------------------------------- comparatif : Les Minis Monstres et les autres solutions
// Sans chiffres pour les autres solutions (fourchettes sourcées ajoutées plus tard), sans nommer de marque.
function comparatifTable() {
  const cols = ['Les Minis Monstres', 'Agence', 'Indépendant', 'Plateforme à faire soi-même'];
  const prixCreation = `${types.map((t) => `${t.name} ${euro(t.price)}`).join(', ')}. Les prix sont affichés, les mêmes pour tous`;
  const prixMois = `${creationSeule.name} : ${euro(0)}. Ou le forfait ${ABO.name} : ${euro(ABO.month)} par mois, hébergement et modifications compris (${euro(ABO.month + DOM)} si on vous fournit le nom de domaine)`;
  const rows = [
    ['Qui fait le travail', 'Alex et les Minis Monstres, du premier appel à la mise en ligne', 'Une équipe, sur devis', 'Une personne, selon son emploi du temps', 'Vous-même, avec des modèles'],
    ['Prix de création', prixCreation, 'Sur devis', 'Sur devis, selon le prestataire', 'Compris dans l’abonnement, votre temps en plus'],
    ['Prix chaque mois', prixMois, 'Contrat de maintenance, sur devis', 'Selon le prestataire, souvent en option', 'Abonnement mensuel, plus les applications en option'],
    ['Délai', `${types[0].delai} pour un ${types[0].name}, ${types[1].delai} pour un ${types[1].name}, ${types[2].delai} pour un ${types[2].name}`, 'Selon le planning de l’équipe', 'Selon le prestataire', 'Dès que vous avez fini'],
    ['Modifications', `Révisions illimitées jusqu’à validation du site. Ensuite, incluses avec le forfait ${ABO.name}`, 'Sur devis, ou dans un contrat', 'Sur devis', 'Vous-même'],
    ['Prix', 'Juste et affiché : rien de caché, rien au devis', 'Sur devis', 'Sur devis', 'Abonnement affiché, options en plus'],
    ['Visibilité Google (être trouvé)', `Comprise dans le ${types[1].name} et le ${types[2].name}. Une page en plus : ${euro(prixPageSeo)}`, 'Souvent une prestation à part', 'Selon ses compétences', 'Vous-même, avec des applications'],
    ['Engagement', `Aucun, et aucune obligation d’abonnement. Seulement le temps du paiement si le reste est payé en ${lissageTxt} fois`, 'Selon le contrat', 'Selon le contrat', 'Selon l’abonnement choisi'],
  ];
  const cell = (txt, i) => `<span class="cmp-cell${i === 0 ? ' cmp-me' : ''}" role="cell" data-label="${esc(cols[i])}">${esc(txt)}</span>`;
  // Sur téléphone : une carte par ligne, notre réponse visible, les trois autres dans un petit déroulant
  const mobile = `<div class="cmp-mobile">${rows.map(([l, nous, ...autres]) => `<div class="cmp-m reveal"><p class="cmp-m-l">${esc(l)}</p><p class="cmp-m-nous"><small>${esc(cols[0])}</small>${esc(nous)}</p><details class="liste-plus"><summary><span>Et ailleurs ?</span>${icon('chevron-down')}</summary><ul class="cmp-m-autres">${autres.map((a, i) => `<li><small>${esc(cols[i + 1])}</small>${esc(a)}</li>`).join('')}</ul></details></div>`).join('')}</div>`;
  return `${mobile}<div class="cmp cmp-4 reveal" role="table" aria-label="Les Minis Monstres comparés à une agence, un indépendant et une plateforme à faire soi-même">
  <div class="cmp-head" role="row"><span role="columnheader"></span>${cols.map((c, i) => `<span role="columnheader" class="cmp-cell${i === 0 ? ' cmp-me' : ''}">${i === 0 ? petit('mochi') : ''}${esc(c)}</span>`).join('')}</div>
  ${rows.map(([l, ...cells]) => `<div class="cmp-row" role="row"><span class="cmp-label" role="rowheader">${esc(l)}</span>${cells.map(cell).join('')}</div>`).join('')}
</div>`;
}

module.exports = {
  infoBtn, deroulant, deroulants, listePlus,
  LMAX,
  lissageTxt,
  unType,
  contactUrl, acompteDe, flecheLia, euro, creerUrl, commanderUrl, year, btn, btnCreer, btnWa, breadcrumbs, pageHero, steps, faq, faqItem, faqSchema, ctaBand,
  billingSwitch, billed, lisse, typeCards, payBox, forfaitMinis, forfaitCards, offre, economie, sourcesMarche, sourcesMd, sourcesInline, ecartBas, INDEPENDANT_DES, ABO, DELAI_MODIF, optsCreation, optsMois, EXTRAS_PAR_FAMILLE, extrasListe, prixExtra, prixType, optPrice, optionsCompact, extrasDemande, priceData, optionChoices, domainBox,
  offreEvenement, processusModif, formuleCarte, codeEvenementBox, creationSeuleBox, siteCarte, boutiqueCarte, gestionChoix, formulesChoix, paiementChoix, INCLUS_NOUS, INCLUS_MOI, INCLUS_SITE, PLUS_DE_PAGES, BOUTIQUE_ARTICLES, BOUTIQUE_PAIEMENT, PACK_SEO, delaiTxt, sansDelai, BOUTIQUE_INCLUS, BOUTIQUE_ESPACE, BOUTIQUE_STOCK, ETAPES_MODIF,
  siteOffreCarte, siteIcone, positionnement, ESSENTIEL, VISIBILITE, BOUTIQUE_T, revisionsNote, phrase,
  configurator, phoneEdit, phoneSocial, statsCard, comparatifTable,
  CERISE, BRICOU, PEPITE, presente, DOM, DOMAINE_REGLE, DOMAINE_PLUS, petit, bouille, deco, PETIT_SECTION, bandeGrid, alexPortrait, nomI,
};
