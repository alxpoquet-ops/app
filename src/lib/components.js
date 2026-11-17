// Composants HTML réutilisables
const { site, sections, types, forfaits, annuel, lissage, options, fidelite, paiement, creation, marche, boost, aLaDemande, bande, evenement, delais, creationSeule } = require('../config');
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
const ABO = forfaits[0]; // Mini
const EVO = forfaits.find((f) => f.id === 'evolution') || forfaits[forfaits.length - 1]; // Maxi
const UNIQUE = forfaits.length === 1; // un seul abonnement (du 17 novembre 2026 au retour de Mini et Maxi)
const delaiTxt = (f) => f.delaiTexte || (f.delaiMoyen || f.priorite ? `en ${f.delai} en moyenne` : `sous ${f.delai} au plus`);
// La liste d'un abonnement sans la ligne du délai (le délai a sa propre ligne sous la liste)
const sansDelai = (arr) => arr.filter((x) => !/^Délai/.test(x));
// La différence entre Mini et Maxi, en une phrase
const DIFF_ABO = `Avec ${EVO.name}, vos demandes passent en premier : les petites modifications sont faites dans l’heure, les grosses sous 48 h. Vous avez une page SEO optimisée chaque semaine au lieu d’une par mois, et la bande surveille votre site pour vous proposer des améliorations.`;
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
    <li><strong>Votre abonnement</strong> : ${forfaits.map((f) => `${f.name} ${euro(f.month)} par mois`).join(' ou ')}. À l’année, ${annuel.moisOfferts} mois offerts.</li>
  </ul>
</div>`;
}

// ---------------------------------------------------------------- l'offre : le site, deux options, deux formules
// Le site à 500 € : ce qui est compris (dans cet ordre, comme sur la page Tarifs)
const INCLUS_SITE = [`Jusqu’à ${creation.pages} pages`, 'Design personnalisé', 'Adapté à tous les écrans', 'Formulaire de contact', 'Accompagnement personnalisé', 'Les Minis Monstres pour vous aider'];
// « On s'occupe de tout » (avec une formule) et « Je m'en occupe moi-même » (création seule, code fourni)
const INCLUS_NOUS = ['Nom de domaine à votre nom', 'Hébergement', 'Installation et mise en ligne', 'Sauvegardes et sécurité', 'Surveillance et maintenance', 'Modifications incluses', 'Tableau de bord de vos visites'];
const INCLUS_MOI = ['Le code de votre site, prêt à installer', 'Une sauvegarde complète', 'Une petite notice d’installation'];
// Les pages non utilisées deviennent des pages pour Google : l'exemple chiffré
const PAGES_SEO = `Les pages non utilisées peuvent être transformées en pages SEO pour améliorer votre visibilité sur Google. Par exemple : vous utilisez ${creation.exemplePages} pages pour votre activité, les ${creation.pages - creation.exemplePages} pages restantes servent à vous faire trouver sur Google.`;
const PACK_SEO = options.find((o) => o.id === 'packseo' && !o.retire);
const BOUTIQUE_INCLUS = ['Vos produits présentés en images', 'Panier et paiement en ligne', 'Achat sans créer de compte', 'Gestion des commandes', 'E-mails automatiques'];
// Ce que la boutique ajoute dans l'espace client (extension WordPress : includes/boutique.php et vacances.php)
const BOUTIQUE_ESPACE = ['Codes promo et soldes', 'Mode vacances', 'Bandeau d’annonce', 'Vos commandes dans le tableau de bord'];
const BOUTIQUE_STOCK = 'Pas de stock à tenir : on ne compte pas les quantités, vos produits sont présentés en images. Un produit manque ? Il passe en épuisé.';
// Une formule, en carte. compact : sans la liste complète.
function formuleCarte(f, { compact = false } = {}) {
  return `<article class="formule c-${f.color}${f.priorite ? ' is-evo' : ''}">
    ${f.optimisation ? `<span class="formule-tag">${icon('rocket')}Le plus complet</span>` : ''}
    <p class="formule-nom">${esc(f.name)}</p>
    <p class="formule-prix"><b>${euro(f.month)}</b><small>/mois</small></p>
    <ul class="plan-list">${(compact ? sansDelai(f.main).slice(0, 4) : sansDelai(f.main)).map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>
    <p class="formule-delai">${icon('clock')}<span>Modifications ${delaiTxt(f)}</span></p>
  </article>`;
}
// compact : pour l'accueil (moins de lignes) ; choose : avec le bouton « Créer mon site »
function offre({ compact = false, choose = true } = {}) {
  const liste = (items) => `<ul class="plan-list">${items.map((x) => `<li>${icon('check')}<span>${inline(x)}</span></li>`).join('')}</ul>`;
  return `<div class="offre reveal" id="offre">
  <div class="offre-lia" aria-hidden="true">${petit('bricou')}${petit('etoile', { humeur: 'ravi' })}</div>
  <div class="offre-cols">
    <article class="offre-col c-butter">
      <p class="offre-k"><span>1</span>Votre site</p>
      <p class="offre-titre">Site Internet Professionnel</p>
      <p class="offre-prix"><b>${euro(creation.prix)}</b><small>une fois</small></p>
      ${liste(compact ? INCLUS_SITE.slice(0, 6) : INCLUS_SITE)}
      <!--commun--><p class="offre-seo">${icon('search-check')}<span>${compact ? `Les pages non utilisées deviennent des pages pour Google.` : PAGES_SEO}</span></p><!--/commun-->
    </article>
    <span class="offre-plus" aria-hidden="true">+</span>
    <article class="offre-col c-lilac">
      <p class="offre-k"><span>2</span>Votre abonnement, chaque mois</p>
      <div class="formules${UNIQUE ? ' is-solo' : ''}">${forfaits.map((f) => formuleCarte(f, { compact })).join('')}</div>
      <p class="offre-sous">Sans engagement. À l’année : ${annuel.moisOfferts} mois offerts. Vous préférez tout gérer vous-même ? <a href="#creation-seule">C’est possible aussi</a>.</p>
    </article>
  </div>
  <p class="offre-options">${icon('plus')}<span>Une seule option : <b>la boutique en ligne, + ${euro(creation.boutique)}</b>, si vous vendez sur internet. Le nom de domaine et l’hébergement offerts la première année, c’est avec un abonnement, pour un site sans boutique.</span></p>
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
  <h3>${icon('scale')}${marche.fois} fois moins cher, à site égal</h3>
  <p class="eco-base">Pour comparer justement : un site vitrine de ${n} pages, avec son référencement sur Google${n === creation.pages ? ', exactement ce que comprend le nôtre' : ''}.</p>
  <div class="eco-barres" role="img" aria-label="Un site vitrine de ${n} pages avec référencement coûte en général ${euro(marche.agenceMin)} à ${euro(marche.agenceMax)} en agence, ${euro(marche.vitrineMin)} à ${euro(marche.vitrineMax)} chez un indépendant. Chez les Minis Monstres : ${euro(creation.prix)}.">
    <p class="eco-ligne"><span>Agence web</span><i style="width:${w(mAgence)}"></i><b>${euro(marche.agenceMin)} à ${euro(marche.agenceMax)}</b></p>
    <p class="eco-ligne"><span>Indépendant</span><i style="width:${w(mInde)}"></i><b>${euro(marche.vitrineMin)} à ${euro(marche.vitrineMax)}</b></p>
    <p class="eco-ligne is-nous"><span>Chez les Minis Monstres</span><i style="width:${w(creation.prix)}"></i><b>${euro(creation.prix)}</b></p>
  </div>
  <p>Pas de secret : j’ai passé du temps à automatiser mon travail, et tout ce qui se répète se fait maintenant tout seul. Je conçois le site et je vérifie tout à la main. Vous ne payez pas des semaines de travail. Le prix est le même pour tout le monde, affiché ici, sans devis.</p>
  <p class="eco-note">Nos repères : les prix publiés en France en 2026 pour un site vitrine de ${n} pages avec référencement, textes pour Google compris. Ce sont des moyennes : chaque devis est différent. Chez nous, ${creation.pages} pages au plus pour ${euro(creation.prix)}, référencement de base compris.</p>
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
  const prixDe = (b) => (b.option === 'boutique' ? (prix ? `Avec la boutique en ligne, + ${euro(creation.boutique)}` : 'Avec la boutique en ligne') : b.compris ? 'Avec l’abonnement' : '');
  const art = (b) => (b.monstre === 'lia' ? monster('coucou') : petit(b.monstre));
  return `<div class="bande">${bande
    .map((b) => `<div class="bande-carte reveal${b.compris ? ' is-compris' : ''}"><span class="bande-art">${art(b)}</span><strong>${esc(b.nom)}<small>${esc(b.role)}</small></strong>${complet && b.missions ? `<ul class="bande-missions">${b.missions.map((m) => `<li>${esc(m)}</li>`).join('')}</ul><em class="bande-perso">${esc(b.perso)}</em>` : `<span class="bande-fait">${inline(b.court)}</span>`}<em class="bande-prix">${prixDe(b)}</em></div>`)
    .join('')}</div>`;
}
// Les deux options, expliquées simplement
function optionsCompact() {
  const carte = (id, nom, prix, texte, inclus, info) => `<article class="opt-carte reveal"><span class="opt-carte-art">${petit(MONSTRE_OPTION[id])}</span><div><h3><span>${nomI(nom, id, info)}</span><b>+ ${euro(prix)}</b></h3><p>${inline(texte)}</p><ul class="plan-list">${inclus.map((x) => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul></div></article>`;
  return `<div class="opt-cartes">
  ${carte('boutique', 'Boutique en ligne', creation.boutique, 'Vos clients achètent sur votre site, même quand vous êtes fermé, sans créer de compte. Dans votre espace client, vous gérez vos codes promo, vos soldes et le mode vacances. Pas de stock à tenir : vos produits sont présentés en images.', BOUTIQUE_INCLUS, BOUTIQUE.info)}
  ${PACK_SEO ? carte('packseo', `${PACK_SEO.name}, plus tard`, PACK_SEO.price.once, 'Plus votre site a de pages utiles, plus il apparaît dans Google. Quand vous le voulez, après la mise en ligne, vous en commandez depuis votre espace client, une par une.', ['Une page de plus pour Google', `Par exemple : ${PACK_SEO.exemples.join(', ').toLowerCase().replace('faq', 'FAQ')}`, 'Payée une fois, depuis votre espace client'], PACK_SEO.info) : ''}
</div>
<p class="opt-note">À la commande, la boutique est la seule option. Les pages SEO supplémentaires se prennent plus tard, si vous en avez envie.</p>`;
}
// Plus d'extras à la demande (offre simplifiée) : gardé pour les pages qui l'appellent encore
function extrasDemande() { return ''; }

// ---------------------------------------------------------------- l'offre événement
// prix : false sur l'accueil (pas de prix affiché, seulement la remise en pourcentage)
function offreEvenement() { return ''; } // l'offre événement est retirée (17 novembre 2026)

// ---------------------------------------------------------------- comment se passe une modification
const ETAPES_MODIF = [
  ['message-circle', 'Vous faites votre demande', 'Dans votre espace client, avec vos mots, et une photo si besoin.'],
  ['wrench', 'Bricou prépare la modification', 'Le constructeur de la bande s’en charge.'],
  ['eye', 'Un aperçu est créé', 'Vous voyez le résultat avant tout le monde.'],
  ['user-check', 'Je reçois la proposition', 'Je la vérifie moi-même.'],
  ['clock', 'Sans refus de ma part sous 30 minutes, elle est validée', 'Pas d’attente inutile.'],
  ['circle-check', 'La modification est en ligne', 'Vos visiteurs voient la nouvelle version.'],
];
function processusModif({ titre = true } = {}) {
  return `<!--commun--><div class="modif-etapes reveal">
  ${titre ? `<h3>${icon('repeat')}Comment se passe une modification</h3>` : ''}
  <ol>${ETAPES_MODIF.map(([ic, t, d], i) => `<li><span class="modif-n">${i + 1}</span><span class="modif-ico">${icon(ic)}</span><span><strong>${esc(t)}</strong><small>${esc(d)}</small></span></li>`).join('')}</ol>
  <p class="modif-delai">${icon('timer')}<span>Délai : avec ${esc(ABO.name)}, ${esc(delaiTxt(ABO))}. Avec ${esc(EVO.name)}, ${esc(delaiTxt(EVO))}. Si une demande demande plus de travail, je la fais moi-même, à la main.</span></p>
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
  <div class="b-choices b-solo"><div class="b-choice c-butter"><span class="b-card is-on"><span class="type-ico">${icon('layout-grid')}</span><span class="b-solo-txt"><strong>Site Internet Professionnel</strong><small>Jusqu’à ${creation.pages} pages, design personnalisé</small></span><span class="b-price">${euro(creation.prix)}</span><span class="b-check">${icon('check')}</span></span></div></div>`;
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
    <span class="cf-art" aria-hidden="true">${petit('bricou', { humeur: 'ravi' })}</span>
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
        <span class="cf-txt">Une boutique sur votre site : vos clients achètent même quand vous êtes fermé.</span>
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
          <span class="cf-prix">${UNIQUE ? '' : '<small>dès</small>'}<b>${euro(ABO.month)}</b><small>/mois, sans engagement</small></span>
          <span class="cf-txt">Je réserve votre nom de domaine, j’installe votre site chez nous, puis on veille sur lui chaque mois. Nom de domaine et hébergement offerts la première année, sauf avec la boutique.</span>
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
// Les deux formules, en grandes cartes, avec la différence en une phrase. name : le champ envoyé (base | evolution).
function formulesChoix({ name = 'b-forfait', court = false } = {}) {
  if (UNIQUE) {
    // un seul abonnement : une grande carte claire, déjà comprise (le champ reste pour la commande)
    const f = ABO;
    return `<input type="hidden" name="${name}" value="${f.id}">
  <div class="cf-site cf-abo c-${f.color}">
    <span class="cf-art" aria-hidden="true">${petit('etoile', { humeur: 'ravi' })}</span>
    <div class="cf-corps">
      <p class="cf-nom">L’abonnement ${esc(f.name)}</p>
      <p class="cf-prix"><b>${euro(f.month)}</b><small>/mois, sans engagement</small></p>
      ${court ? `<p class="cf-txt">${f.main.slice(0, 4).join(', ')}, et bien plus.</p>` : `<!--commun-->${cfListe(f.main)}<!--/commun-->`}
    </div>
    <span class="cf-badge">${icon('check')}Tout compris</span>
  </div>`;
  }
  return `<div class="cf-duo" role="radiogroup" aria-label="Votre abonnement">
  ${forfaits.map((f, i) => `<label class="cf-choix cf-formule c-${f.color}">
      <input type="radio" name="${name}" value="${f.id}"${i === 0 ? ' checked' : ''} class="cf-input">
      <span class="cf-carte">
        ${f.optimisation ? '<span class="cf-tag">Le plus complet</span>' : ''}
        <span class="cf-art" aria-hidden="true">${petit(f.optimisation ? 'gelee' : 'dino', { humeur: 'ravi' })}</span>
        <span class="cf-corps">
          <strong class="cf-nom">${esc(f.name)}</strong>
          <span class="cf-prix"><b>${euro(f.month)}</b><small>/mois, sans engagement</small></span>
          ${court ? '' : `<!--commun-->${cfListe(sansDelai(f.main))}<!--/commun-->`}
          <span class="cf-delai">${icon('clock')}<span>Modifications ${delaiTxt(f)}</span></span>
        </span>
        <span class="cf-coche" aria-hidden="true">${icon('check')}</span>
      </span>
    </label>`).join('')}
  </div>
  ${court ? '' : `<p class="cf-info c-lilac">${icon('scale')}<span><b>La différence :</b> ${esc(DIFF_ABO)}</span></p>`}`;
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
  <span class="b-pages-txt"><strong>Pages en plus</strong><small>${creation.pages} pages sont comprises. Au-delà, ${euro(creation.pagePlus)} la page. Les pages pour Google ne comptent pas.</small></span>
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
  return `<div class="builder cf" data-builder="${priceData()}" data-billing-scope>
  <form class="cf-form" data-builder-form>
    ${etape('Votre site', `Un seul site, un seul prix. Tout ceci est compris.`, `${siteCarte()}<!--commun--><p class="cf-info c-butter">${icon('search-check')}<span>${esc(PAGES_SEO)}</span></p><!--/commun-->`)}
    ${etape('Vous voulez vendre en ligne ?', 'C’est la seule option. Cochez-la si vous voulez une boutique, sinon passez à la suite.', `${boutiqueCarte()}<p class="cf-plus-tard">${icon('search-check')}<span>Et pour être encore plus visible sur Google ? Plus tard, depuis votre espace client, vous pourrez ajouter des pages pour Google${PACK_SEO ? `, ${euro(PACK_SEO.price.once)} la page` : ''}.</span></p>`)}
    ${etape('Qui s’occupe de la mise en ligne ?', 'Le nom de domaine (l’adresse de votre site), l’hébergement et l’installation : on s’en charge, ou vous le faites vous-même.', gestionChoix())}
    ${etape('Votre nom de domaine', 'C’est l’adresse de votre site, par exemple mon-entreprise.fr. Je vérifie qu’il est libre, puis je le réserve à votre nom.', domainBox(), ' data-avec-formule')}
    ${etape('Votre abonnement', 'Il démarre à la réception du site. Sans engagement : vous changez ou vous arrêtez quand vous voulez.', `${formulesChoix()}<div class="cf-periode">${billingSwitch()}</div>`, ' data-avec-formule')}
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
  const prixMois = `${forfaits.map((f) => `${f.name} ${euro(f.month)}`).join(' ou ')} par mois, nom de domaine, hébergement et modifications compris`;
  const rows = [
    ['Qui fait le travail', 'Je conçois votre site. Mes automatisations s’occupent des tâches répétitives.', 'Une équipe, sur devis', 'Une personne, selon son emploi du temps', 'Vous-même, avec des modèles'],
    ['Prix de création', prixCreation, 'Sur devis', 'Sur devis, selon le prestataire', 'Compris dans l’abonnement, votre temps en plus'],
    ['Prix chaque mois', prixMois, 'Contrat de maintenance, sur devis', 'Selon le prestataire, souvent en option', 'Abonnement mensuel, plus les applications en option'],
    ['Délai', `${types[1].delai} pour un site, ${types[2].delai} pour une boutique`, 'Selon le planning de l’équipe', 'Selon le prestataire', 'Dès que vous avez fini'],
    ['Modifications', `Incluses. Avec ${ABO.name}, ${delaiTxt(ABO)}. Avec ${EVO.name}, ${delaiTxt(EVO)}`, 'Sur devis, ou dans un contrat', 'Sur devis', 'Vous-même'],
    ['Prix', 'Juste et affiché : rien de caché, rien au devis', 'Sur devis', 'Sur devis', 'Abonnement affiché, options en plus'],
    ['SEO (être trouvé sur Google)', `Les pages non utilisées deviennent des pages pour Google. L’abonnement en ajoute une par mois avec ${ABO.name}, une par semaine avec ${EVO.name}`, 'Souvent une prestation à part', 'Selon ses compétences', 'Vous-même, avec des applications'],
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
  billingSwitch, billed, lisse, typeCards, payBox, forfaitMinis, forfaitCards, offre, economie, ABO, EVO, UNIQUE, optsCreation, optsMois, prixType, optPrice, optionsCompact, extrasDemande, priceData, typeChoices, forfaitChoices, optionChoices, domainBox,
  offreEvenement, processusModif, formuleCarte, codeEvenementBox, creationSeuleBox, siteCarte, boutiqueCarte, gestionChoix, formulesChoix, paiementChoix, INCLUS_NOUS, INCLUS_MOI, INCLUS_SITE, PAGES_SEO, PACK_SEO, DIFF_ABO, delaiTxt, sansDelai, BOUTIQUE_INCLUS, BOUTIQUE_ESPACE, BOUTIQUE_STOCK, ETAPES_MODIF,
  configurator, phoneEdit, phoneSocial, statsCard, comparatifTable,
  petit, bouille, deco, PETIT_SECTION, bandeGrid, alexPortrait, nomI,
};
