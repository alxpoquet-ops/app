// Composants HTML réutilisables
const { site, sections, types, forfaits, annuel, lissage, options, fidelite, paiement, creation, marche, boost, aLaDemande, bande, evenement, delais, creationSeule, extrasGroupes } = require('../config');
const { icon } = require('./icons');
const { monster } = require('./monsters');
const { petit, alexPortrait } = require('./bestiaire');

// ---------------------------------------------------------------- la petite famille de monstres
// Sur les pages publiques, ce sont eux qu'on voit, un peu partout. Cerise n'apparaît que dans la bulle, en bas de l'écran.
// Les anciens noms de Cerise (ses humeurs) donnent un monstre de la famille.
const PETIT_DE = { mascotte: 'mochi', bonjour: 'mochi', coucou: 'mochi', clin: 'chaton', ravie: 'etoile', pense: 'nuage', triste: 'fantome', alex: 'dino' };
// Le monstre de chaque rubrique, dans le haut de ses pages
const PETIT_SECTION = { creer: 'mochi', forfaits: 'etoile', espace: 'gelee', seo: 'nuage', contact: 'chaton', confiance: 'champi', liaalex: 'mochi', metiers: 'dino', equipe: 'gelee', accompagnement: 'gelee', guides: 'nuage', documentation: 'fantome', lexique: 'champi', comparatif: 'chaton', fidelite: 'etoile', methode: 'mochi', monespace: 'fantome', commander: 'etoile', confirmation: 'etoile' };
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
const delaiTxt = (f) => f.delaiTexte || `en ${f.delai} au plus`;
// La liste d'un abonnement sans la ligne du délai (le délai a sa propre ligne sous la liste)
const sansDelai = (arr) => arr.filter((x) => !/^Délai/.test(x));
// Le délai d'une modification, en toutes lettres (une modification peut prendre jusqu'à 48 h)
const DELAI_MODIF = `jusqu’à ${ABO.delai.replace(/ heures?$/, ' h')}`;
const optsCreation = options.filter((o) => o.quand === 'creation' && !o.retire);
const optsMois = options.filter((o) => o.quand === 'mois' && !o.retire);

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

// ---------------------------------------------------------------- appel à l'action
function ctaBand({ title = 'On crée votre site ?', text = 'Choisissez votre site et vos options en deux minutes. Vous voyez le prix tout de suite, et vous commandez quand vous êtes prêt.', mascot = 'mascotte' } = {}) {
  return `<section class="cta-band"><div class="container">
  <div class="cta-box reveal">
    <div class="cta-art cta-duo" aria-hidden="true">${bouille(mascot)}${petit(mascot === 'mascotte' ? 'fantome' : 'gelee', { humeur: 'ravi' })}</div>
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
const unType = (t) => (t.id === 'boutique' ? 'une boutique en ligne' : t.id === 'une-page' ? 'une seule page' : 'un site de plusieurs pages');

function payBox() {
  return `<div class="jetons-box reveal">
  <h3>${icon('calendar-check')}Comment payer ?</h3>
  <ul class="list-check">
    <li><strong>À la commande</strong> : ${paiement.acompte} % du site, soit ${euro(acompteDe(creation.prix))} pour un site à ${euro(creation.prix)}, et les options choisies.</li>
    <li><strong>À la réception du site</strong> : le reste en une fois (${euro(creation.prix - acompteDe(creation.prix))}), ou en ${lissageTxt} fois sans frais, par exemple ${euro(lisse(creation.prix))} par mois pendant ${LMAX} mois. Votre abonnement démarre ce jour-là.</li>
    <li><strong>Votre abonnement</strong> : ${ABO.name}, ${euro(ABO.month)} par mois, sans engagement. À l’année, ${annuel.moisOfferts} mois offerts.</li>
  </ul>
</div>`;
}

// ---------------------------------------------------------------- l'offre : le site, deux options, deux formules
// Le site à 500 € : ce qui est compris (dans cet ordre, comme sur la page Tarifs)
const INCLUS_SITE = [`${creation.pages} pages`, 'Design personnalisé', 'Adapté à tous les supports : ordinateur, tablette, téléphone', 'Formulaire de contact', 'Accompagnement personnalisé', 'Les Minis Monstres pour vous aider'];
// « On s'occupe de tout » (avec une formule) et « Je m'en occupe moi-même » (création seule, code fourni)
const INCLUS_NOUS = ['Nom de domaine à votre nom, offert tant que l’abonnement est actif', 'Hébergement', 'Installation et mise en ligne', 'Sauvegardes et sécurité', 'Maintenance technique', 'Modifications incluses', 'Tableau de bord de vos visites'];
const INCLUS_MOI = ['Le code de votre site, prêt à installer', 'Une sauvegarde complète', 'Une petite notice d’installation'];
// Le site compte creation.pages pages : pour en avoir plus, ou être trouvé sur plus de recherches, on prend des extras (depuis l'espace client)
const PACK_SEO = options.find((o) => o.id === 'packseo' && !o.retire);
const prixPageSeo = PACK_SEO ? PACK_SEO.price.once : 5;
const packsSeo = PACK_SEO && PACK_SEO.packs ? PACK_SEO.packs.filter((n) => n > 1).join(' ou ') : '5 ou 10';
const PLUS_DE_PAGES = `Besoin de plus de pages, ou d’être trouvé sur plus de recherches ? Une page en plus coûte ${euro(creation.pagePlus)}, et une page SEO ${euro(prixPageSeo)}, seule ou en packs de ${packsSeo}. Ce sont des extras, qui se prennent plus tard depuis votre espace client.`;
// Les articles de la boutique : le client les ajoute lui-même dans l'onglet « Ma boutique » de son espace client, dans des emplacements.
const BOUTIQUE_ARTICLES = `Vous ajoutez vos articles vous-même depuis votre espace client : photo, description, prix. ${creation.boutiqueProduits} emplacements sont compris, puis ${euro(creation.boutiqueSlot)} l’emplacement, à vous pour toujours.`;
const BOUTIQUE_INCLUS = [`${creation.boutiqueProduits} emplacements d’articles compris`, 'Panier et paiement en ligne', 'Achat sans créer de compte', 'Gestion des commandes', 'E-mails automatiques'];
// Ce que la boutique ajoute dans l'espace client (extension WordPress : includes/boutique.php et vacances.php)
const BOUTIQUE_ESPACE = ['Codes promo et soldes', 'Mode vacances', 'Bandeau d’annonce', 'Vos commandes dans le tableau de bord'];
const BOUTIQUE_STOCK = 'Par défaut, pas de stock à tenir : on ne compte pas les quantités, et un produit qui manque passe en épuisé. L’extra « Gestion du stock » décompte le stock à chaque vente.';
// Une formule, en carte. compact : sans la liste complète.
function formuleCarte(f, { compact = false } = {}) {
  // L'abonnement unique a pour mascotte le monstre Maxi
  return `<article class="formule c-${f.color}">
    <span class="formule-art" aria-hidden="true">${petit('maxi')}</span>
    <p class="formule-nom">${esc(f.name)}</p>
    <p class="formule-prix"><b>${euro(f.month)}</b><small>/mois, sans engagement</small></p>
    <ul class="plan-list">${(compact ? sansDelai(f.main).slice(0, 5) : sansDelai(f.main)).map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>
  </article>`;
}
// compact : pour l'accueil (moins de lignes) ; choose : avec le bouton « Créer mon site »
// Deux choses bien séparées : « Créer le site » (une seule fois) et « Le maintenir » (l'abonnement, chaque mois).
function offre({ compact = false, choose = true } = {}) {
  const liste = (items) => `<ul class="plan-list">${items.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>`;
  return `<div class="offre reveal" id="offre">
  <div class="offre-lia" aria-hidden="true">${petit('mochi')}${petit('etoile', { humeur: 'ravi' })}</div>
  <div class="offre-cols">
    <article class="offre-col c-butter" id="creer-le-site">
      <p class="offre-k"><span>1</span>Créer le site</p>
      <p class="offre-titre">Site Internet Professionnel</p>
      <p class="offre-prix"><b>${euro(creation.prix)}</b><small>une seule fois</small></p>
      ${liste(compact ? INCLUS_SITE.slice(0, 6) : INCLUS_SITE)}
      <p class="offre-sous">Payable en ${lissageTxt} fois sans frais. Boutique en ligne : + ${euro(creation.boutique)}.</p>
      <!--commun--><p class="offre-seo">${icon('search-check')}<span>${compact ? `Besoin de plus de pages ? Elles se prennent en extra.` : PLUS_DE_PAGES}</span></p><!--/commun-->
    </article>
    <span class="offre-plus offre-puis" aria-hidden="true">puis</span>
    <article class="offre-col c-lilac" id="le-maintenir">
      <p class="offre-k"><span>2</span>Le maintenir, chaque mois</p>
      <div class="formules is-solo">${forfaits.map((f) => formuleCarte(f, { compact })).join('')}</div>
      <p class="offre-sous">Sans engagement. À l’année : ${annuel.moisOfferts} mois offerts. Vous préférez tout gérer vous-même ? <a href="#creation-seule">C’est possible aussi</a>.</p>
    </article>
  </div>
  <p class="offre-options">${icon('globe')}<span>Le nom de domaine, l’adresse de votre site, est <b>offert tant que l’abonnement est actif</b>. Pour aller plus loin, <a href="#extras">les extras</a> se prennent à la carte, quand vous en avez besoin.</span></p>
  ${choose ? `<p class="offre-go">${btnCreer('btn-primary btn-lg')}</p>` : ''}
</div>`;
}
// Anciens noms, gardés pour les pages qui les appellent encore
const forfaitMinis = () => offre({ compact: true });
const forfaitCards = ({ choose = true } = {}) => offre({ choose });

// Pourquoi c'est moins cher : la comparaison avec un site fait à la main, chiffres du marché à l'appui
function economie() {
  // à prestation égale : un site vitrine de 10 pages avec référencement. Les barres suivent le milieu de chaque fourchette.
  const n = marche.pagesCompare || 10;
  const mAgence = (marche.agenceMin + marche.agenceMax) / 2;
  const mInde = (marche.vitrineMin + marche.vitrineMax) / 2;
  const w = (x) => `${Math.max(10, Math.round((x / mAgence) * 100))}%`;
  return `<div class="eco reveal">
  <h3>${icon('scale')}${marche.fois} fois moins cher${n === creation.pages ? ', à site égal' : ''}</h3>
  <p class="eco-base">Pour comparer : un site vitrine de ${n} pages, avec son référencement sur Google${n === creation.pages ? ', exactement ce que comprend le nôtre' : `. Le nôtre compte ${creation.pages} pages, et les pages en plus se prennent à la carte`}.</p>
  <div class="eco-barres" role="img" aria-label="Un site vitrine de ${n} pages avec référencement coûte en général ${euro(marche.agenceMin)} à ${euro(marche.agenceMax)} en agence, ${euro(marche.vitrineMin)} à ${euro(marche.vitrineMax)} chez un indépendant. Chez les Minis Monstres : ${euro(creation.prix)}.">
    <p class="eco-ligne"><span>Agence web</span><i style="width:${w(mAgence)}"></i><b>${euro(marche.agenceMin)} à ${euro(marche.agenceMax)}</b></p>
    <p class="eco-ligne"><span>Indépendant</span><i style="width:${w(mInde)}"></i><b>${euro(marche.vitrineMin)} à ${euro(marche.vitrineMax)}</b></p>
    <p class="eco-ligne is-nous"><span>Chez les Minis Monstres</span><i style="width:${w(creation.prix)}"></i><b>${euro(creation.prix)}</b></p>
  </div>
  <p>Pas de secret : j’ai passé du temps à automatiser mon travail, et tout ce qui se répète se fait maintenant tout seul. Je conçois le site et je vérifie tout à la main. Vous ne payez pas des semaines de travail. Le prix est le même pour tout le monde, affiché ici, sans devis.</p>
  <p class="eco-note">Nos repères : les prix publiés en France en 2026 pour un site vitrine de ${n} pages avec référencement, textes pour Google compris. Ce sont des moyennes : chaque devis est différent. Chez nous, ${creation.pages} pages pour ${euro(creation.prix)}, référencement de base compris.</p>
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
const MONSTRE_OPTION = { packseo: 'etoile', boutique: 'champi' };
// La petite bande, en cartes : métier, missions et personnalité. complet : avec les missions (pages Équipe et Accueil).
function bandeGrid({ complet = false, prix = true } = {}) {
  const extraDe = (b) => options.find((o) => o.id === b.option && !o.retire);
  const prixDe = (b) => (b.option === 'boutique' ? (prix ? `Avec la boutique en ligne, + ${euro(creation.boutique)}` : 'Avec la boutique en ligne') : b.compris ? 'Avec l’abonnement' : extraDe(b) ? (b.option === 'seomois' ? 'Avec les extras pages SEO' : `Avec l’extra « ${extraDe(b).name} »`) : '');
  const art = (b) => (b.monstre === 'lia' ? monster('coucou') : petit(b.monstre));
  return `<div class="bande">${bande
    .map((b) => `<div class="bande-carte reveal${b.compris ? ' is-compris' : ''}"><span class="bande-art">${art(b)}</span><strong>${esc(b.nom)}<small>${esc(b.role)}</small></strong>${complet && b.missions ? `<ul class="bande-missions">${b.missions.map((m) => `<li>${esc(m)}</li>`).join('')}</ul><em class="bande-perso">${esc(b.perso)}</em>` : `<span class="bande-fait">${inline(b.court)}</span>`}<em class="bande-prix">${prixDe(b)}</em></div>`)
    .join('')}</div>`;
}
// La boutique en ligne, la seule option à la commande, expliquée simplement
function optionsCompact() {
  return `<div class="opt-cartes">
  <article class="opt-carte reveal"><span class="opt-carte-art">${petit(MONSTRE_OPTION.boutique)}</span><div><h3><span>${nomI('Boutique en ligne', 'boutique', BOUTIQUE.info)}</span><b>+ ${euro(creation.boutique)}</b></h3><p>Vos clients achètent sur votre site, même quand vous êtes fermé, sans créer de compte. ${BOUTIQUE_ARTICLES} Dans votre espace client, vous gérez vos codes promo, vos soldes et le mode vacances.</p><ul class="plan-list">${BOUTIQUE_INCLUS.map((x) => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul></div></article>
</div>
<p class="opt-note">La boutique en ligne est la seule option à la commande, payée une fois. Tout le reste se prend plus tard, comme extra.</p>`;
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
const EXTRAS_PAR_FAMILLE = extrasGroupes
  .map((g) => ({
    ...g,
    items: [
      ...EXTRAS_UNE_FOIS.filter((x) => x.groupe === g.id).map((x) => ({ id: x.id, name: x.name, icon: x.icon, desc: x.court || x.desc, fois: x.prix, mois: 0, packs: x.packs || null, unite: x.unite || '', badge: x.badge || '' })),
      ...EXTRAS_MOIS.filter((o) => o.group === g.id).map((o) => ({ id: o.id, name: o.name, icon: o.icon, desc: o.court || o.desc, fois: 0, mois: o.price.month, packs: null, unite: '', badge: o.badge || '' })),
    ],
  }))
  .filter((g) => g.items.length);
// « 15 € une fois », « 5 €/mois », ou « à partir de 5 € la page » quand il existe des packs
const prixExtra = (x) => (x.mois ? `${euro(x.mois)}/mois` : x.packs ? `à partir de ${euro(x.fois)} ${UNITE[x.unite] || ''}`.trim() : `${euro(x.fois)} une fois`);
const prixExtraHtml = (x) => (x.mois ? `<b>${euro(x.mois)}</b><small>/mois</small>` : x.packs ? `<small>à partir de</small><b>${euro(x.fois)}</b><small>${UNITE[x.unite] || 'une fois'}</small>` : `<b>${euro(x.fois)}</b><small>une fois</small>`);
const packsTxt = (x) => { const l = (x.packs || []).filter((n) => n > 1); return l.length ? `Packs de ${listeDe(l)}` : ''; };
function extrasListe() {
  return `<div class="opt-groups extras">${EXTRAS_PAR_FAMILLE.map((g) => `<div class="opt-group extras-groupe reveal"><h3>${icon(g.icon)}<span>${esc(g.nom)}</span></h3><ul>${g.items
    .map((x) => `<li><span class="opt-ico">${icon(x.icon)}</span><span class="opt-txt"><strong>${esc(x.name)}${x.badge ? ` <em class="extra-badge">${esc(x.badge)}</em>` : ''}</strong><small>${inline(x.desc)}</small>${packsTxt(x) ? `<small class="extra-packs">${packsTxt(x)}</small>` : ''}</span><span class="opt-price">${prixExtraHtml(x)}</span></li>`)
    .join('')}</ul></div>`).join('')}</div>
<p class="opt-note extras-note">${icon('circle-user')}<span>Tout se prend depuis votre espace client, quand vous en avez besoin, sans engagement. Un extra payé une fois s’ajoute à votre prochaine facture. Un extra au mois se coupe quand vous voulez.</span></p>`;
}

// ---------------------------------------------------------------- l'offre événement
// prix : false sur l'accueil (pas de prix affiché, seulement la remise en pourcentage)
function offreEvenement() { return ''; } // l'offre événement est retirée (17 novembre 2026)

// ---------------------------------------------------------------- comment se passe une modification
// 17 novembre 2026 : Cerise aide à formuler la demande, le client confirme, Alex fait la modification à la main.
const CERISE = (bande.find((b) => b.id === 'support') || { nom: 'Cerise' }).nom;
const ETAPES_MODIF = [
  ['message-circle', 'Vous faites votre demande', 'Dans votre espace client, avec vos mots, et une photo si besoin.'],
  ['list-checks', `${CERISE} vous pose les bonnes questions`, 'Pour que la demande soit claire et complète.'],
  ['clipboard-check', 'Vous confirmez la demande', `${CERISE} vous la résume, vous dites oui.`],
  ['send', 'Elle est transmise à Alex', '« Merci pour vos précisions, je transmets à Alex ! »'],
  ['user-check', 'Je fais la modification', 'Moi-même, à la main.'],
  ['circle-check', 'La modification est en ligne', 'Vos visiteurs voient la nouvelle version.'],
];
function processusModif({ titre = true } = {}) {
  return `<!--commun--><div class="modif-etapes reveal">
  ${titre ? `<h3>${icon('repeat')}Comment se passe une modification</h3>` : ''}
  <ol>${ETAPES_MODIF.map(([ic, t, d], i) => `<li><span class="modif-n">${i + 1}</span><span class="modif-ico">${icon(ic)}</span><span><strong>${esc(t)}</strong><small>${esc(d)}</small></span></li>`).join('')}</ol>
  <p class="modif-delai">${icon('timer')}<span>Une modification peut prendre ${DELAI_MODIF}, une demande à la fois. Vous pouvez annuler une demande tant que je ne l’ai pas commencée.</span></p>
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
      pages: creation.pages,
      pagePlus: creation.pagePlus,
      pagesPlusMax: creation.pagesPlusMax,
    })
  );
}

// Cartes « type de site » (radios) : même prix, la boutique ajoute son option
// Le site : un seul choix, le même prix pour tous. La boutique en ligne est une option payée une fois, juste en dessous
// (une case data-boutique ; main.js met alors « boutique » dans le champ caché du type de site).
function siteChoice({ name = 'b-type' } = {}) {
  return `<input type="hidden" name="${name}" value="vitrine" data-type-field>
  <div class="b-choices b-solo"><div class="b-choice c-butter"><span class="b-card is-on"><span class="type-ico">${icon('layout-grid')}</span><span class="b-solo-txt"><strong>Site Internet Professionnel</strong><small>${creation.pages} pages, design personnalisé</small></span><span class="b-price">${euro(creation.prix)}</span><span class="b-check">${icon('check')}</span></span></div></div>`;
}
function typeChoices({ name = 'b-type', checked = 'vitrine' } = {}) {
  return `<div class="b-choices b-types">${types
    .map(
      (t) => `<label class="b-choice c-${t.color}"><input type="radio" name="${name}" value="${t.id}"${t.id === checked ? ' checked' : ''}>
        <span class="b-card"><span class="type-ico">${icon(t.icon)}</span><strong>${nomI(t.label, t.id, t.info)}</strong><span class="b-price">${prixType(t)}</span><small>${esc(t.delai)}</small><span class="b-check">${icon('check')}</span></span></label>`
    )
    .join('')}</div>`;
}

// Les deux formules : deux cartes à cocher (Tranquillité par défaut). Le nom du champ est celui attendu par le script et la commande.
function forfaitChoices({ name = 'b-forfait' } = {}) {
  const seule = creationSeule ? `<label class="b-choice b-seule c-${creationSeule.color}"><input type="radio" name="${name}" value="${creationSeule.id}" data-seule>
        <span class="b-card b-formule"><strong>${esc(creationSeule.name)}</strong><span class="b-price">Sans abonnement</span>
        <small>${esc(creationSeule.court)}</small><span class="b-check">${icon('check')}</span></span></label>` : '';
  return `<div class="b-choices b-formules">${forfaits
    .map((f, i) => `<label class="b-choice c-${f.color}"><input type="radio" name="${name}" value="${f.id}"${i === 0 ? ' checked' : ''}>
        <span class="b-card b-formule"><strong>${esc(f.name)}</strong><span class="b-price">${billed(f.month)}</span>
        <ul>${f.main.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul><span class="b-check">${icon('check')}</span></span></label>`)
    .join('')}${seule}</div>`;
}
// La création seule, expliquée en une carte (page Tarifs)
function creationSeuleBox() {
  if (!creationSeule) return '';
  return `<div class="seule reveal" id="creation-seule">
  <span class="seule-ico">${icon('code')}</span>
  <div><h3>Vous avez déjà votre nom de domaine et votre hébergement ?</h3>
  <p>Choisissez la <strong>création seule</strong> : vous payez seulement votre site, ${euro(creation.prix)}, sans abonnement au mois. Je vous remets le code de votre site, prêt à installer chez votre hébergeur. Vous l’installez vous-même, ou votre hébergeur le fait pour vous.</p>
  <p class="seule-note">${icon('info')}<span>Pas d’abonnement, donc ni maintenance ni modifications comprises. Si un jour vous changez d’avis, un abonnement peut s’ajouter quand vous voulez.</span></p></div>
</div>`;
}

// ---------------------------------------------------------------- le parcours de commande, en grandes cartes (novembre 2026)
// 1. le site (toujours compris)  2. la boutique (la seule option)  3. qui s'occupe de la mise en ligne : nous (une formule)
// ou moi (création seule, le code est fourni)  4. le nom de domaine et 5. la formule, seulement avec « nous »  6. le total.
const cfListe = (items) => `<ul class="cf-liste">${items.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>`;
// Le site : une grande carte claire, déjà comprise. name : le champ caché du type de site (vitrine ou boutique).
function siteCarte({ name = 'b-type', court = false } = {}) {
  return `<input type="hidden" name="${name}" value="vitrine" data-type-field>
  <div class="cf-site c-butter">
    <span class="cf-art" aria-hidden="true">${petit('fantome', { humeur: 'ravi' })}</span>
    <div class="cf-corps">
      <p class="cf-nom">Site Internet Professionnel</p>
      <p class="cf-prix"><b>${euro(creation.prix)}</b><small>une fois</small></p>
      ${court ? `<p class="cf-txt">${INCLUS_SITE.slice(0, 6).join(', ')}.</p>` : cfListe(INCLUS_SITE)}
    </div>
    <span class="cf-badge">${icon('check')}Compris</span>
  </div>`;
}
// La boutique en ligne : une grande case à cocher. Elle passe le type de site à « boutique » (main.js, initBoutique).
function boutiqueCarte({ court = false } = {}) {
  return `<label class="cf-choix cf-boutique c-pink">
    <input type="checkbox" value="boutique" data-boutique class="cf-input">
    <span class="cf-carte">
      <span class="cf-art" aria-hidden="true">${petit('champi')}</span>
      <span class="cf-corps">
        <strong class="cf-nom">Oui, je veux vendre en ligne</strong>
        <span class="cf-prix"><b>+ ${euro(creation.boutique)}</b><small>une fois</small></span>
        <span class="cf-txt">Une boutique sur votre site, avec ${creation.boutiqueProduits} emplacements d’articles : vos clients achètent même quand vous êtes fermé.</span>
        ${court ? '' : `${cfListe(BOUTIQUE_INCLUS)}
        <span class="cf-bq-sous">${icon('circle-user')}Dans votre espace client, en plus</span>
        ${cfListe(BOUTIQUE_ESPACE)}
        <span class="cf-bq-note">${esc(BOUTIQUE_STOCK)}</span>`}
      </span>
      <span class="cf-coche" aria-hidden="true">${icon('check')}</span>
    </span>
  </label>`;
}
// Qui s'occupe de la mise en ligne ? Deux grandes cartes. name : le champ envoyé (nous | moi).
function gestionChoix({ name = 'b-gestion', court = false } = {}) {
  return `<div class="cf-duo" role="radiogroup" aria-label="Qui s’occupe de la mise en ligne de votre site">
    <label class="cf-choix c-mint">
      <input type="radio" name="${name}" value="nous" checked class="cf-input">
      <span class="cf-carte">
        <span class="cf-tag">Le plus simple</span>
        <span class="cf-art" aria-hidden="true">${petit('dino', { humeur: 'ravi' })}</span>
        <span class="cf-corps">
          <strong class="cf-nom">On s’occupe de tout</strong>
          <span class="cf-prix"><b>${euro(ABO.month)}</b><small>/mois, sans engagement</small></span>
          <span class="cf-txt">Je réserve votre nom de domaine, j’installe votre site chez nous, puis on veille sur lui chaque mois. Le nom de domaine est offert tant que l’abonnement est actif.</span>
          ${court ? '' : cfListe(INCLUS_NOUS)}
        </span>
        <span class="cf-coche" aria-hidden="true">${icon('check')}</span>
      </span>
    </label>
    <label class="cf-choix c-peach">
      <input type="radio" name="${name}" value="moi" class="cf-input">
      <span class="cf-carte">
        <span class="cf-art" aria-hidden="true">${petit('chaton')}</span>
        <span class="cf-corps">
          <strong class="cf-nom">Je m’en occupe moi-même</strong>
          <span class="cf-prix"><b>${euro(0)}</b><small>/mois, sans abonnement</small></span>
          <span class="cf-txt">Vous gérez votre nom de domaine, votre hébergement et l’installation. Je vous remets le code de votre site, prêt à installer.</span>
          ${court ? '' : cfListe(INCLUS_MOI)}
        </span>
        <span class="cf-coche" aria-hidden="true">${icon('check')}</span>
      </span>
    </label>
  </div>
  <p class="cf-info c-peach" data-seule-txt hidden>${icon('book-open')}<span>Besoin d’un coup de main pour l’installer ? Votre hébergeur a ses propres guides pas à pas, et on trouve beaucoup de tutoriels gratuits sur internet. Sans abonnement, la maintenance et les modifications ne sont pas comprises. Vous pourrez en prendre un plus tard.</span></p>`;
}
// L'abonnement : un seul (Mini), en grande carte claire, déjà comprise. name : le champ envoyé (base).
function formulesChoix({ name = 'b-forfait', court = false } = {}) {
  const f = ABO;
  return `<input type="hidden" name="${name}" value="${f.id}">
  <div class="cf-site cf-abo c-${f.color}">
    <span class="cf-art cf-art-maxi" aria-hidden="true">${petit('maxi', { humeur: 'ravi' })}</span>
    <div class="cf-corps">
      <p class="cf-nom">L’abonnement ${esc(f.name)}</p>
      <p class="cf-prix"><b>${euro(f.month)}</b><small>/mois, sans engagement</small></p>
      ${court ? `<p class="cf-txt">${f.main.slice(0, 4).join(', ')}, et bien plus.</p>` : `<!--commun-->${cfListe(f.main)}<!--/commun-->`}
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
  <p class="cf-info" data-lisse-note hidden>${icon('info')}<span>Sans frais. Vous vous engagez le temps du paiement<span data-avec-formule>, et l’abonnement se règle alors chaque mois</span>.</span></p>`;
}

// Cases « options » (une fois) et « extras » (au mois)
// Pages en plus : un compteur (0 à pagesPlusMax), payé une fois. name : le champ envoyé avec la commande.
function pagesPlusBox({ name = '' } = {}) {
  return `<div class="b-pages" data-pages-box>
  <span class="b-pages-txt"><strong>Pages en plus</strong><small>${creation.pages} pages sont comprises. Au-delà, ${euro(creation.pagePlus)} la page.</small></span>
  <span class="b-pages-ctrl"><button type="button" class="b-pp" data-pp-step="-1" aria-label="Une page de moins">${icon('minus')}</button><input type="number" min="0" max="${creation.pagesPlusMax}" step="1" value="0" inputmode="numeric"${name ? ` name="${name}"` : ''} data-pages-plus aria-label="Nombre de pages en plus"><button type="button" class="b-pp" data-pp-step="1" aria-label="Une page de plus">${icon('plus')}</button></span>
  <span class="b-pages-prix" data-pp-prix>0 €</span>
</div>`;
}
function optionChoices({ name = '', quand = 'tout' } = {}) {
  const ligne = (o) => `<label class="b-opt"${o.types ? ` data-types="${o.types.join(' ')}"` : ''}><input type="checkbox"${name ? ` name="${name}"` : ''} value="${o.id}"><span class="b-box">${icon('check')}</span><span class="b-opt-txt"><strong>${nomI(o.name, o.id, o.info)}</strong><small>${inline((o.court || o.desc))}</small></span><em class="p-opt">+ ${euro(o.price.once)}</em></label>`;
  const boutique = `<label class="b-opt b-opt-boutique"><input type="checkbox" value="boutique" data-boutique><span class="b-box">${icon('check')}</span><span class="b-opt-txt"><strong>${nomI('Boutique en ligne', 'boutique', BOUTIQUE.info)}</strong><small>${BOUTIQUE_INCLUS.join(', ')}.</small></span><em class="p-opt">+ ${euro(creation.boutique)}</em></label>`;
  if (quand === 'mois') return '';
  return `<p class="b-label">Deux options, si vous voulez (payées une fois)</p><div class="b-opts">${optsCreation.map(ligne).join('')}${boutique}</div>`;
}

// Le code événement (foire, marché, salon) : -20 % sur la création. Vérifié par le serveur à la commande.
function codeEvenementBox({ name = '' } = {}) {
  return `<div class="b-code" data-code-box>
  <label for="${name || 'b-code'}"><strong>${icon('ticket')}Code promo ou parrainage</strong><small>Vous avez un code promo, ou le code d’un client qui vous a recommandé ? Entrez-le ici.</small></label>
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
  const acompte0 = Math.round(creation.prix * paiement.acompte) / 100;
  const partie = (couleur, titre, texte, attrs = '') => `<div class="cf-partie c-${couleur}"${attrs}><p class="cf-partie-titre">${titre}</p><p class="cf-partie-txt">${texte}</p></div>`;
  return `<div class="builder cf" data-builder="${priceData()}" data-billing-scope>
  <form class="cf-form" data-builder-form>
    ${partie('butter', 'Créer le site', `${euro(creation.prix)} une seule fois, ${creation.pages} pages, payable en ${lissageTxt} fois sans frais.`)}
    ${etape('Votre site', `Un seul site, un seul prix. Tout ceci est compris.`, `${siteCarte()}<!--commun--><p class="cf-info c-butter">${icon('search-check')}<span>${esc(PLUS_DE_PAGES)}</span></p><!--/commun-->`)}
    ${etape('Vous voulez vendre en ligne ?', 'C’est la seule option à la commande. Cochez-la si vous voulez une boutique, sinon passez à la suite.', boutiqueCarte())}
    ${partie('lilac', 'Le maintenir', `L’abonnement ${ABO.name}, ${euro(ABO.month)} par mois, sans engagement : on garde votre site en ligne, protégé et à jour, et le nom de domaine est offert tant qu’il est actif. Vous pouvez aussi tout gérer vous-même.`)}
    ${etape('Qui s’occupe de la mise en ligne ?', 'Le nom de domaine (l’adresse de votre site), l’hébergement et l’installation : on s’en charge, ou vous le faites vous-même.', gestionChoix())}
    ${etape('Votre nom de domaine', 'C’est l’adresse de votre site, par exemple mon-entreprise.fr. Je vérifie qu’il est libre, puis je le réserve à votre nom. Il est offert tant que l’abonnement est actif.', domainBox(), ' data-avec-formule')}
    ${etape('Votre abonnement', 'Il démarre à la réception du site. Sans engagement : vous l’arrêtez quand vous voulez.', `${formulesChoix()}<div class="cf-periode">${billingSwitch()}</div><p class="cf-plus-tard">${icon('plus')}<span>Et si vous voulez aller plus loin ? Pages pour Google, article de blog, avis Google, prise de rendez-vous : ces extras ne se choisissent pas ici. Ils se prennent plus tard, depuis votre espace client, quand vous en avez besoin. <a href="${sections.forfaits.path}#extras">Voir les extras</a></span></p>`, ' data-avec-formule')}
    <section class="cf-etape cf-total b-sum" id="cf-total" aria-live="polite">
      <h2 class="cf-titre"><span class="cf-n" aria-hidden="true"></span>Votre total</h2>
      <ul class="cf-lignes">
        <li><span data-sum="type">Site Internet Professionnel</span><b data-sum="type-price">${euro(creation.prix)}</b></li>
        <li data-sum-remise hidden><span>Code promo (- ${evenement.remise} %)</span><b data-sum="remise">0 €</b></li>
        <li data-avec-formule><span data-sum="domain">Nom de domaine à choisir</span><b data-sum="domain-prix">offert</b></li>
        <li><span data-sum="forfait">Abonnement ${esc(ABO.name)}</span><b data-sum="forfait-price">${euro(ABO.month)}/mois</b></li>
      </ul>
      <p class="cf-q">Comment voulez-vous payer votre site ?</p>
      ${paiementChoix()}
      ${codeEvenementBox()}
      <div class="cf-recap">
        <p class="cf-auj"><span data-sum="today-label">Aujourd’hui, l’acompte de ${paiement.acompte} %</span><b data-sum="today">${euro(acompte0)}</b></p>
        <p><span data-sum="reste-label">À la réception du site, le reste</span><b data-sum="reste">${euro(creation.prix - acompte0)}</b></p>
        <p><span data-sum="recur-label">Puis votre abonnement, chaque mois</span><b data-sum="recur">${euro(ABO.month)}/mois</b></p>
        <p data-sum-parrain hidden><span>Parrainage</span><b>${fidelite.parrainageMois} mois offert</b></p>
      </div>
      <p class="cf-detail" data-sum="detail">Prix total du site : ${euro(creation.prix)}.</p>
      <div class="cf-actions">
        <a class="btn btn-primary btn-lg btn-flaque" href="${sections.commander.path}" data-sum-order>${icon('shopping-bag')}<span>Commander</span></a>
        <a class="btn btn-light btn-lg" href="/contact/#devis" data-sum-go>${icon('message-circle')}<span>Poser une question</span></a>
      </div>
      <p class="cf-secu">${icon('shield-check')}<span>Paiement sécurisé par Stripe. Aujourd’hui, vous réglez seulement ${paiement.acompte} % du site.</span></p>
    </section>
  </form>
  <div class="b-bar" data-sum-bar>
    <p data-sum="bar"><b>${euro(creation.prix)}</b> puis <b>${euro(ABO.month)}/mois</b></p>
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
  const cols = ['Les Minis Monstres', 'Agence web', 'Freelance', 'Plateforme à faire soi-même'];
  const prixCreation = `${euro(creation.prix)}, le même prix pour tous. Boutique en ligne : + ${euro(creation.boutique)}`;
  const prixMois = `${ABO.name} ${euro(ABO.month)} par mois, nom de domaine, hébergement et modifications compris`;
  const rows = [
    ['Qui fait le travail', 'Je conçois votre site. Mes automatisations s’occupent des tâches répétitives.', 'Une équipe, sur devis', 'Une personne, selon son emploi du temps', 'Vous-même, avec des modèles'],
    ['Prix de création', prixCreation, 'Sur devis', 'Sur devis, selon le prestataire', 'Compris dans l’abonnement, votre temps en plus'],
    ['Prix chaque mois', prixMois, 'Contrat de maintenance, sur devis', 'Selon le prestataire, souvent en option', 'Abonnement mensuel, plus les applications en option'],
    ['Délai', `${types[1].delai} pour un site, ${types[2].delai} pour une boutique`, 'Selon le planning de l’équipe', 'Selon le prestataire', 'Dès que vous avez fini'],
    ['Modifications', `Incluses dans l’abonnement, une modification peut prendre ${DELAI_MODIF}`, 'Sur devis, ou dans un contrat', 'Sur devis', 'Vous-même'],
    ['Prix', 'Juste et affiché : rien de caché, rien au devis', 'Sur devis', 'Sur devis', 'Abonnement affiché, options en plus'],
    ['SEO (être trouvé sur Google)', `Le site compte ${creation.pages} pages. D’autres pages pour Google se prennent à la carte, ${euro(prixPageSeo)} la page`, 'Souvent une prestation à part', 'Selon ses compétences', 'Vous-même, avec des applications'],
    ['Engagement', `Aucun. Seulement le temps du paiement si le reste est payé en ${lissageTxt} fois`, 'Selon le contrat', 'Selon le contrat', 'Selon l’abonnement choisi'],
  ];
  const cell = (txt, i) => `<span class="cmp-cell${i === 0 ? ' cmp-me' : ''}" role="cell" data-label="${esc(cols[i])}">${esc(txt)}</span>`;
  return `<div class="cmp cmp-4 reveal" role="table" aria-label="Les Minis Monstres comparé à une agence web, un freelance et une plateforme à faire soi-même">
  <div class="cmp-head" role="row"><span role="columnheader"></span>${cols.map((c, i) => `<span role="columnheader" class="cmp-cell${i === 0 ? ' cmp-me' : ''}">${i === 0 ? petit('mochi') : ''}${esc(c)}</span>`).join('')}</div>
  ${rows.map(([l, ...cells]) => `<div class="cmp-row" role="row"><span class="cmp-label" role="rowheader">${esc(l)}</span>${cells.map(cell).join('')}</div>`).join('')}
</div>`;
}

module.exports = {
  infoBtn, siteChoice,
  LMAX,
  lissageTxt,
  unType,
  contactUrl, acompteDe, flecheLia, euro, creerUrl, commanderUrl, year, btn, btnCreer, btnWa, breadcrumbs, pageHero, steps, faq, faqItem, faqSchema, ctaBand,
  billingSwitch, billed, lisse, typeCards, payBox, forfaitMinis, forfaitCards, offre, economie, ABO, DELAI_MODIF, optsCreation, optsMois, EXTRAS_PAR_FAMILLE, extrasListe, prixExtra, prixType, optPrice, optionsCompact, extrasDemande, priceData, typeChoices, forfaitChoices, optionChoices, domainBox,
  offreEvenement, processusModif, formuleCarte, codeEvenementBox, creationSeuleBox, siteCarte, boutiqueCarte, gestionChoix, formulesChoix, paiementChoix, INCLUS_NOUS, INCLUS_MOI, INCLUS_SITE, PLUS_DE_PAGES, BOUTIQUE_ARTICLES, PACK_SEO, delaiTxt, sansDelai, BOUTIQUE_INCLUS, BOUTIQUE_ESPACE, BOUTIQUE_STOCK, ETAPES_MODIF,
  configurator, phoneEdit, phoneSocial, statsCard, comparatifTable,
  CERISE, petit, bouille, deco, PETIT_SECTION, bandeGrid, alexPortrait, nomI,
};
