// Pages du site
const { site, sections, types, typesOfferts, forfaits, annuel, lissage, delais, fidelite, paiement, jetonsLia, creation, marche, enService, limites, creationSeule, bande, ateliers, outilsOffre, modules } = require('../config');
// L'ancien système d'outils à énergie est en pause (config enService) : la page /outils/ suit désormais config.outilsOffre.
// OFFRE UNIQUE (21 novembre 2026). Créer le site, payé une fois : le Site Essentiel (400 €), avec ou sans l'option e-commerce
// (+ 200 €). Les pages de visibilité Google sont un extra (10 € la page). Le Site Visibilité est retiré (config.types, retire: true).
// Ensuite, au choix : Autonomie (creationSeule, 0 € par mois, le client gère tout) ou Mini (forfaits[0], 10 € par mois, sans engagement).
// Trois extras seulement, depuis l'espace client (C.extrasListe) : page de visibilité Google, traduction anglaise, fonctionnalité spécifique.
const ABO = forfaits[0];
const AUTO = creationSeule;
const { icon } = require('../lib/icons');
const { monster } = require('../lib/monsters');
const { md, inline, esc, plain } = require('../lib/md');
const C = require('../lib/components');
const FAQ = require('../content/faq');
const legal = require('../content/legal');
// Le site (Essentiel, option e-commerce), et l'extra « page de visibilité Google » (10 € la page, payée une fois)
const ESS = C.ESSENTIEL, BOU = C.BOUTIQUE_T, ECO = C.ECOMMERCE; // le Site Essentiel, le même avec l'option e-commerce, l'option seule
const PAGE_GOOGLE = C.PACK_SEO || { name: 'Page de visibilité Google', price: { once: 10 }, exemples: [] };
const PRIX_PAGE = PAGE_GOOGLE.price.once;
// Un bloc repris tel quel sur plusieurs pages (scripts/check.js ne le compte pas comme une phrase en double)
const commun = (html) => `<!--commun-->${html}<!--/commun-->`;
const BRIEF = require('../content/brief');
// V2 : pages métier (/<slug>/) et pages de réassurance, guides de fond et page locale
let METIERS = [], METIERS_PUBLIE = '2026-11-16';
try { ({ metiers: METIERS, PUBLIE: METIERS_PUBLIE } = require('../content/metiers')); } catch (e) { /* pas encore écrit */ }
let PAGES_V2 = [], PAGES_V2_PUBLIE = '2026-11-16';
try { ({ pages: PAGES_V2, PUBLIE: PAGES_V2_PUBLIE } = require('../content/pages-v2')); } catch (e) { /* pas encore écrit */ }
let LEXIQUE = { termes: [], PUBLIE: '' };
try { LEXIQUE = require('../content/lexique'); } catch (e) { /* lexique pas encore écrit */ }
const { clients } = require('../config');
let CLIENTS_PAGES = {};
try { CLIENTS_PAGES = require('../content/clients-pages.json'); } catch (e) { /* pas encore compté : node scripts/compter-pages.js */ }

const HOME = { name: 'Accueil', path: '/' };
const DEMO_CRUMBS = [HOME, { name: 'Mon espace', path: '/mon-espace/' }, { name: 'Démo', path: '/mon-espace/demo/' }];
const crumb = (k) => [HOME, { name: sections[k].label, path: sections[k].path }];
const euro = C.euro;
const T = (id) => types.find((t) => t.id === id);
const round2 = (n) => Math.round(n * 100) / 100;
// Le nombre de Minis Monstres, en toutes lettres (« six »)
const NB_BANDE = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit'][bande.length] || String(bande.length);
const Maj = (x) => x[0].toUpperCase() + x.slice(1);
// L'abonnement à l'année, et « une modification » (par Alex, chaque mois) écrit en toutes lettres
// « par trimestre » (V2) ou « par mois »
const PAR_PERIODE = ABO.periode === 'trimestre' ? 'par trimestre' : 'par mois';
// Texte des appels à l'action de bas de page
const CTA_TEXTE = 'Un site internet vous rend visible, et c’est notre métier. Choisissez le vôtre en deux minutes : vous voyez le prix tout de suite.';
// Champs cachés communs aux formulaires : horodatage anti-robot et champ piège.
function formHidden() {
  return `<input type="hidden" name="_t" value=""><div class="hp" aria-hidden="true"><label>Ne pas remplir <input type="text" name="site_web" tabindex="-1" autocomplete="off"></label></div>`;
}

// ====================================================================== LA MAISON (le concept) ET L'ACCUEIL
// 24 novembre 2026, fin de soirée : on se recentre sur les sites. Trois onglets (La maison, Mon Site, Mes Tutos), plus d'outils
// en public. L'accueil : la vitrine, le prix, le déroulement, la confiance, et une porte discrète vers Mes Tutos.
const MAISON = ateliers.find((x) => x.id === 'maison') || { path: '/la-maison/', label: 'La maison' };
const SITES = ateliers.find((x) => x.id === 'sites') || { path: sections.creer.path, label: 'Mon Site' };
const MODULES_SITE = modules.filter((m) => !m.option).map((m) => m.nom);
const listeEt = (l) => l.join(', ').replace(/, ([^,]*)$/, ' et $1');

function laMaisonPage() {
  const crumbs = [HOME, { name: MAISON.label, path: MAISON.path }];
  const B = (id) => bande.find((b) => b.id === id) || { nom: '', role: '' };
  const metierDe = (b) => `${b.nom}, ${b.role.charAt(0).toLowerCase()}${b.role.slice(1)}`;
  const promesse = (ico, t, d) => `<div class="promesse reveal">${icon(ico)}<h3>${t}</h3><p>${d}</p></div>`;
  const body = `<section class="page-hero maison-page-hero c-lilac">
  <div class="container page-hero-in has-mascot">
    <div class="page-hero-text">
      ${C.breadcrumbs(crumbs)}
      <p class="where">${icon('house')}<span>${esc(MAISON.label)} · le concept</span></p>
      <h1>Un site professionnel, <mark>à la portée de tous</mark>.</h1>
      <p class="lead">Les Minis Monstres existent pour une raison simple : quand on se lance, on n’a pas toujours ${mille(5000)} € à mettre dans un site internet. On mérite pourtant d’être vu.</p>
    </div>
    <div class="page-hero-art" aria-hidden="true">${C.imgMonstre('mascotte', 170, { tot: true })}</div>
  </div>
</section>

<section class="section" id="mot-d-alex"><div class="container">
  <div class="lettre reveal">
    <span class="lettre-art" aria-hidden="true">${C.alexPortrait({ cls: 'lettre-alex' })}</span>
    <div class="lettre-txt prose">
      <h2>Le mot d’Alex</h2>
      <p>J’ai créé les Minis Monstres pour les artisans, les commerçants, les associations, et pour tous ceux qui démarrent avec un petit budget.</p>
      <p>Un site fait sur mesure coûte souvent plusieurs milliers d’euros. C’est le juste prix du travail fourni. Mais beaucoup d’entrepreneurs ne peuvent pas se le permettre, alors ils restent invisibles.</p>
      <p>Je suis autodidacte : je n’ai pas suivi d’école de développeur, j’ai appris en construisant, un site après l’autre. J’ai réduit mes charges au maximum et automatisé une grande partie du travail répétitif : c’est ce qui me permet de vous proposer un prix doux, sans rien retirer au soin.</p>
      <p>Car je tiens à faire les choses bien : chaque page est vérifiée avant la mise en ligne, et je reste là ensuite. Un prix juste, c’est aussi un prix qui me permet de vivre de mon travail, et de le faire durer.</p>
      <p>Notre époque a quelque chose de beau : les efforts peuvent enfin être récompensés. Je voudrais que chacun en profite, pas seulement ceux qui ont un gros budget.</p>
      <p class="lettre-signe"><strong>Alex</strong><span>Fondateur des Minis Monstres</span></p>
    </div>
  </div>
</div></section>

<section class="section section-soft" id="la-bande"><div class="container">
  <h2 class="section-title">Vous faites votre métier. <mark>Les monstres font le reste</mark>.</h2>
  <p class="section-sub">Une petite bande, et énormément de travail derrière.</p>
  <div class="maison-bande reveal">
    <div class="maison-bande-art" aria-hidden="true">${['bricou', 'gelee', 'mochi', 'etoile', 'mascotte'].map((m) => C.imgMonstre(m, 76)).join('')}</div>
    <div class="prose">
      <p>Les Minis Monstres ne sont pas de simples dessins. Alex a passé des mois à les programmer un par un, à leur donner un caractère et un métier, puis à leur apprendre à travailler ensemble.</p>
      <p>${listeEt([B('constructeur'), B('ecrivain'), B('organisateur'), B('observateur'), B('support'), B('extras')].filter((b) => b.nom).map(metierDe))} : chacun connaît sa place, et la bande avance comme une vraie équipe.</p>
      <p>Ils prennent les tâches répétitives, et Alex garde pour lui ce qui demande du goût et de l’attention. Les faire tourner coûte aussi chaque mois, en temps comme en argent : c’est notre investissement, pour vous.</p>
    </div>
  </div>
  <p class="center more">${C.btn(sections.equipe.path, 'btn-light', sections.equipe.icon, 'Rencontrer la bande')}</p>
</div></section>

<section class="section" id="chez-alex"><div class="container">
  <div class="maison-vision reveal">
    <span class="maison-vision-art" aria-hidden="true">${C.imgMonstre('bricou', 150)}</span>
    <div class="maison-vision-txt prose">
      <h2>Une maison, pas une agence</h2>
      <p>Les Minis Monstres sont une petite maison, installée dans les ${esc(site.address.department)}. Nos charges sont réduites au strict minimum, et nos prix suivent : ce que la maison n’a pas à dépenser, votre site ne le coûte pas.</p>
      <p>Pour les tâches qui reviennent d’un site à l’autre, des outils font le travail, un peu comme un lave-vaisselle : la vaisselle est aussi propre, et le temps gagné va au reste.</p>
      <p><strong>Ce reste, c’est le plus beau du métier</strong> : comprendre votre activité, choisir les mots justes, soigner le design, vérifier chaque détail.</p>
    </div>
  </div>
</div></section>

<section class="section section-soft" id="promesses"><div class="container">
  <h2 class="section-title">Ce qui ne change jamais</h2>
  <p class="section-sub">Quel que soit votre site, et quel que soit votre budget.</p>
  <div class="promesses">
    ${promesse('list-checks', 'Un questionnaire précis', 'Avant de commencer, vous répondez à des questions claires. Nous savons ce que vous voulez, vous savez ce que vous aurez.')}
    ${promesse('user-check', 'Une vérification, à chaque fois', 'Chaque page est vérifiée sur ordinateur et sur téléphone. Rien n’est publié sans ce contrôle.')}
    ${promesse('key-round', 'La main sur tout', 'Votre espace client liste toutes vos pages. Vous modifiez vous-même, ou vous nous le demandez.')}
    ${promesse('piggy-bank', `${marche.foisTexte} fois moins cher qu’un indépendant`, `D’après les prix publics relevés en France, et avec plus d’avantages. Le détail est sur <a href="${sections.methode.path}">notre page sur les prix</a>.`)}
    ${promesse('heart-handshake', '« Je serai toujours là »', 'Une question, un doute, une idée pour votre site : vous écrivez, et c’est Alex qui vous répond.')}
  </div>
</div></section>

${C.ctaBand({ title: 'Et si on commençait par votre site ?', text: `Le ${esc(ESS.name)}, ${euro(ESS.price)} la création. Le prix s’affiche avant de payer, et votre site est en ligne 24 à 48 heures après votre questionnaire.` })}`;
  return {
    path: MAISON.path,
    color: 'lilac',
    bodyClass: 'page-maison',
    title: 'Notre concept : un site professionnel pour tous | Les Minis Monstres',
    description: 'Pourquoi Les Minis Monstres existent : des sites professionnels soignés, à un prix juste grâce à des charges réduites au maximum, et vérifiés par Alex.',
    crumbs,
    body,
    priority: 0.8,
  };
}

// ====================================================================== ACCUEIL
// La vitrine (retrouvée à la demande d'Alex, 24 novembre 2026) : une petite boutique (store rayé, enseigne, vitre éclairée)
// et un repère de carte au-dessus : on la voit, on la trouve. Puis le prix, le déroulement, Alex, et Mes Tutos en une porte.
function vitrineSvg() {
  const etoile = (x, y, k) => `<path class="vit-etoile" style="animation-delay:${k * 0.7}s" transform="translate(${x} ${y})" d="M0-11l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFE07A"/>`;
  return `<svg class="vitrine" viewBox="0 0 360 300" aria-hidden="true" focusable="false">
  <defs><radialGradient id="vit-lueur" cx="50%" cy="55%" r="60%"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".5"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>
  <linearGradient id="vit-vitre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8D9"/><stop offset="1" stop-color="#FFE07A"/></linearGradient></defs>
  <ellipse cx="170" cy="180" rx="175" ry="125" fill="url(#vit-lueur)"/>
  <ellipse cx="180" cy="284" rx="150" ry="11" fill="#000" opacity=".28"/>
  <rect x="50" y="80" width="260" height="204" rx="22" fill="#FFFDF9"/>
  <rect x="50" y="250" width="260" height="34" rx="14" fill="#EDE6FB"/>
  <rect x="84" y="50" width="192" height="46" rx="16" fill="#B9A6FF"/>
  <rect x="108" y="67" width="96" height="12" rx="6" fill="#2E2A47"/><rect x="214" y="67" width="38" height="12" rx="6" fill="#FFFDF9" opacity=".85"/>
  <rect x="74" y="152" width="142" height="104" rx="14" fill="url(#vit-vitre)"/>
  <path d="M90 164h22l-30 52v-44a8 8 0 0 1 8-8z" fill="#fff" opacity=".45"/>
  <rect x="66" y="252" width="158" height="12" rx="6" fill="#D9CFF5"/>
  <rect x="236" y="152" width="56" height="132" rx="12" fill="#7EDDB5"/>
  <rect x="246" y="164" width="36" height="48" rx="8" fill="#DDF7EC"/>
  <circle cx="248" cy="228" r="4.5" fill="#2E2A47"/>
  <rect x="36" y="96" width="288" height="12" rx="6" fill="#FF8FB8"/>
  <path d="M40 104h40v28a20 20 0 0 1-40 0z" fill="#FF9EC4"/><path d="M80 104h40v28a20 20 0 0 1-40 0z" fill="#FFF1F6"/><path d="M120 104h40v28a20 20 0 0 1-40 0z" fill="#FF9EC4"/><path d="M160 104h40v28a20 20 0 0 1-40 0z" fill="#FFF1F6"/><path d="M200 104h40v28a20 20 0 0 1-40 0z" fill="#FF9EC4"/><path d="M240 104h40v28a20 20 0 0 1-40 0z" fill="#FFF1F6"/><path d="M280 104h40v28a20 20 0 0 1-40 0z" fill="#FF9EC4"/>
  <g class="vit-pin"><path d="M300 0c-17 0-30 13-30 29 0 21 30 46 30 46s30-25 30-46c0-16-13-29-30-29z" fill="#FF8FB8"/><circle cx="300" cy="29" r="11" fill="#FFFDF9"/></g>
  ${etoile(28, 60, 0)}${etoile(238, 22, 1)}${etoile(340, 120, 2)}
</svg>`;
}
// Ce que contient votre site (accueil, 25 novembre 2026) : la valeur d'abord, le prix plus bas (comparatif) et à la commande.
// Uniquement ce qui existe : l'espace client (« Mes pages », « Modifier mon site moi-même », « Mes modifications », Ma commande,
// les factures : src/wordpress/aled08-espace/), l'appel et la vérification d'Alex, les pages de visibilité Google (extra packseo).
const COMPRIS = () => [
  ['layout-grid', 'mint', 'Un site complet, à votre image', `${esc(listeEt(MODULES_SITE.map((x, i) => (i ? x.toLowerCase() : x))))} : vos couleurs, vos photos, vos mots.`],
  ['gauge', 'sky', 'Rapide, sûr et bien vu de Google', 'Lisible sur téléphone, léger à charger, et préparé pour que Google comprenne ce que vous faites et où.'],
  ['search-check', 'mint', 'Des pages pour grandir sur Google', 'Quand vous le voulez, des pages de visibilité Google s’ajoutent depuis votre espace client, écrites pour les recherches de vos clients.'],
  ['shield-check', 'sky', 'Hébergé, protégé, sauvegardé', `Avec le forfait ${esc(ABO.name)}, l’hébergement, la sécurité, les sauvegardes et la maintenance sont faits pour vous.`],
];
function home() {
  const ECOLE_A = ateliers.find((x) => x.id === 'ecole') || { label: 'Mes Tutos', path: C.TUTOS.HUB, monstre: 'mochi' };
  const body = `<section class="hero">
  <div class="container hero-in">
    <div class="hero-text">
      <p class="hero-sur">${icon('store')}Création de site internet professionnel</p>
      <h1>Votre activité mérite <mark>d’être vue</mark>.</h1>
      <p class="hero-lead">Sans site internet, c’est une belle vitrine, mais dans une rue où personne ne passe. On crée le vôtre, et on vous rend visible.</p>
      <div class="hero-ctas">${C.btnCreer('btn-primary btn-lg')}<a class="hero-lien" href="#compris">Tout ce qui est compris${icon('arrow-right')}</a></div>
      <ul class="hero-points">
        <li>${icon('check')}Un site soigné, suivi par Alex</li>
        <li>${icon('check')}La main sur tout</li>
        <li>${icon('check')}Sans abonnement obligatoire</li>
      </ul>
    </div>
    <div class="hero-art hero-vitrine" aria-hidden="true">
      ${vitrineSvg()}
      <span class="vit-m vit-m1">${C.petit('gelee', { humeur: 'ravi' })}</span>
      <span class="vit-m vit-m2">${C.petit('bricou', { humeur: 'ravi' })}</span>
      <span class="vit-m vit-m3">${monster('coucou')}</span>
    </div>
  </div>
</section>

<section class="section" id="compris"><div class="container">
  <h2 class="section-title">Tout ce que vous avez, <mark>avec votre site</mark></h2>
  <p class="section-sub">Un site soigné jusque dans les détails, prêt à grandir avec votre activité.</p>
  <ul class="compris reveal">${COMPRIS().map(([ico, c, t, d]) => `<li class="compris-carte c-${c}"><span class="compris-ico" aria-hidden="true">${icon(ico)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ul>
  <p class="center more compris-pied">${C.btn(C.TUTOS.HUB, 'btn-light', 'book-open', 'Chaque étape, expliquée')}${C.btn(site.espaceClient && site.espaceClient.demo ? site.espaceClient.demo : sections.monespace.path, 'btn-light', 'circle-user', 'Visiter l’espace client')}</p>
</div></section>

<section class="section section-soft" id="uniques"><div class="container">
  <h2 class="section-title">Ce qui nous rend <mark>uniques</mark></h2>
  <p class="section-sub">Une personne qui vous connaît, un espace client où tout est à portée de main, et un site qui reste le vôtre.</p>
  ${C.avantagesNous()}
  ${C.prixJuste()}
</div></section>

<section class="section section-soft" id="deroulement"><div class="container">
  <h2 class="section-title">Comment se passe la création de votre site</h2>
  <p class="section-sub">Six étapes simples. Vous savez toujours où vous en êtes, et il n’y a pas de mauvaise surprise.</p>
  ${C.deroulementListe()}
  <p class="center more"><a class="link-more" href="${C.TUTOS.HUB}#etapes">Chaque étape expliquée en détail</a></p>
</div></section>

<section class="section" id="confiance"><div class="container">
  <h2 class="section-title">Alex, toujours là</h2>
  <div class="confiance-une">
    <div class="alex-carte reveal">
      <span class="alex-carte-art" aria-hidden="true">${C.alexPortrait({ cls: 'alex-carte-svg' })}</span>
      <div>
        <p class="alex-carte-txt">Derrière chaque site, il y a Alex. Il crée votre site avec sa petite bande, et il répond quand vous lui écrivez. Chaque page est vérifiée avant la mise en ligne.</p>
        <p class="alex-carte-bande"><span class="alex-carte-monstres" aria-hidden="true">${['bricou', 'mochi', 'gelee', 'etoile', 'mascotte'].map((m) => C.imgMonstre(m, 40)).join('')}</span><a href="${sections.equipe.path}">et sa petite bande</a></p>
      </div>
    </div>
    <div class="confiance-reals reveal">
      <h3>Ils ont déjà leur site</h3>
      ${clientCards({ max: 2, desc: false })}
      <p class="center"><a class="link-more" href="${sections.confiance.path}">Voir les réalisations</a></p>
    </div>
  </div>
</div></section>

<section class="section section-soft" id="questions"><div class="container">
  <h2 class="section-title">Les questions qu’on se pose avant de commander</h2>
  <p class="section-sub">Les vraies réponses, sans détour.</p>
  ${C.objections()}
</div></section>

<section class="section"><div class="container">
  <a class="pr-pub c-pink reveal" href="${sections.fidelite.path}">
    <span class="pr-pub-ico" aria-hidden="true">${icon('gift')}</span>
    <span class="pr-pub-txt"><strong>Parrainez vos proches : ${fidelite.parrainageMois} mois offerts pour vous, ${fidelite.parrainageMois} mois pour eux</strong><span>Chaque site créé avec votre code vous offre ${fidelite.parrainageMois} mois de forfait ${esc(forfaits[0].name)}, sans limite. Deux proches, c’est un an offert.</span></span>
    <span class="pr-pub-go">${icon('arrow-right')}</span>
  </a>
</div></section>

<section class="section jr-section" data-jeu-rubans hidden><div class="container" data-jeu-rubans-in></div></section>

<section class="section section-porte"><div class="container">
  <a class="porte-tutos c-lilac reveal" href="${ECOLE_A.path}">
    <span class="porte-tutos-art" aria-hidden="true">${C.imgMonstre(ECOLE_A.monstre || 'mochi', 72)}</span>
    <span class="porte-tutos-txt"><strong>${esc(ECOLE_A.label)}</strong><span>Une question ? Les réponses en petits tutos gratuits : la commande, votre espace client, les extras.</span></span>
    <span class="porte-tutos-go">${icon('arrow-right')}</span>
  </a>
</div></section>

${C.ctaBand({ title: 'On ouvre votre vitrine ?', text: `Le ${esc(ESS.name)} : ${euro(ESS.price)} la création, ${euro(BOU.price)} avec l’option ${esc(ECO.name)}. Vous commandez en deux minutes, et la création démarre dès votre questionnaire.` })}`;
  return {
    path: '/',
    bodyClass: 'page-accueil',
    title: 'Création de site internet professionnel, soigné et suivi | Les Minis Monstres',
    description: `Un site internet professionnel soigné, suivi par Alex et ${marche.foisTexte} fois moins cher qu’un indépendant. Votre espace client, toutes vos pages, la main sur tout.`,
    crumbs: [HOME],
    body,
    priority: 1,
    changefreq: 'weekly',
  };
}

// Cartes « Votre métier » (accueil et page /metiers/)
function metierCards() {
  return `<div class="guide-cards metier-cards">${METIERS.map((m) => `<a class="guide-card c-${m.color} reveal" href="/${m.slug}/"><span class="type-ico">${icon(m.icon)}</span><span class="guide-card-text"><strong>${inline(m.nom)}</strong><span>${inline(m.qui)}</span></span>${icon('arrow-right')}</a>`).join('')}</div>`;
}
// Cartes des sites réalisés : uniquement de vrais clients, déjà en ligne (pas notre propre site)
const CLIENTS_EN_LIGNE = clients.filter((c) => !c.enCreation && c.url && !c.url.startsWith('/'));
const pagesDe = (c) => (c.enCreation ? 0 : (CLIENTS_PAGES[c.domaine] || {}).pages || 0);
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1180 → 1 180
const s_ = (n) => (n > 1 ? 's' : '');
// Prix estimé d'un site client avec la grille actuelle : le prix de son type de site (config.types) et ses pages de
// visibilité Google prises en plus (clients[].packsSeo dans config).
// Les fiches produits ne comptent pas comme des pages. C'est une estimation, pas le prix payé par le client.
function estimeClient(c) {
  const t = types.find((x) => x.id === c.type);
  const compte = CLIENTS_PAGES[c.domaine] || {};
  if (!t || !compte.pages) return null;
  const produits = compte.produits || 0;
  const pages = compte.pages - produits;
  const pack = PAGE_GOOGLE;
  const packs = c.packsSeo || 0;
  const opts = [];
  const supplement = 0;
  const formule = forfaits.find((f) => f.id === c.forfait) || null;
  const packsPrix = packs * pack.price.once;
  const creationPrix = t.price;
  return { pages, produits, pack, packs, packsPrix, supplement, opts, formule, creationPrix, total: creationPrix + packsPrix };
}
function clientPages(c) {
  const e = estimeClient(c);
  const n = e ? e.pages : pagesDe(c);
  if (!n) return '';
  const produits = e && e.produits ? `<span class="client-pages-prod">et <b>${e.produits}</b> produit${s_(e.produits)} en vente</span>` : '';
  const info = `<a class="client-i" href="${sections.seo.path}" aria-label="Pourquoi chaque page compte : être trouvé sur Google">${icon('info')}</a>`;
  return `<span class="client-pages"><span class="client-pages-n"><b>${n}</b> page${s_(n)}</span><span class="client-pages-porte">${n} porte${s_(n)} d’entrée potentielle${s_(n)} depuis Google${info}</span>${produits}</span>`;
}
// Les sites en cours de création (pas notre propre site) : même carte, avec un badge « En cours » et sans lien
const CLIENTS_EN_COURS = clients.filter((c) => c.enCreation && c.url && !c.url.startsWith('/'));
function clientCards({ max = 0, desc = true, enCours = false } = {}) {
  const enLigne = max ? CLIENTS_EN_LIGNE.slice(0, max) : CLIENTS_EN_LIGNE;
  const liste = enCours ? enLigne.concat(CLIENTS_EN_COURS) : enLigne;
  return `<div class="client-cards">${liste
    .map((c) => `<div class="client-card c-${c.color}${c.enCreation ? ' is-encours' : ''} reveal"><span class="type-ico">${icon(c.icon)}</span><span class="client-genre">${esc(c.genre)}</span><strong>${esc(c.nom)}</strong>${c.enCreation ? `<span class="client-encours">${icon('clock')}En cours de création</span>` : ''}${desc && c.desc ? `<span class="client-desc">${inline(c.desc)}</span>` : ''}${c.enCreation ? '' : clientPages(c)}${c.enCreation ? `<span class="client-url is-off">${icon('globe')}${esc(c.domaine)}</span>` : `<a class="client-url" href="${c.url}" target="_blank" rel="noopener">${icon('globe')}${esc(c.domaine)}${icon('arrow-right')}</a>`}</div>`)
    .join('')}</div>`;
}

// ====================================================================== CRÉER MON SITE
function creerPage() {
  return commanderPage({ creer: true }); // une seule page pour choisir et commander (20 novembre 2026)
}
// eslint-disable-next-line no-unused-vars
function ancienneCreerPage() {
  const crumbs = crumb('creer');
  const f = C.faq(FAQ.creation, 'Vos questions sur la création', 'faq-creation');
  const body = `${C.pageHero({
    section: 'creer',
    h1: 'Choisissez votre site en deux minutes',
    lead: `Un site, une option e-commerce si vous vendez. D’abord la création de votre site, puis le forfait ${AUTO.name} ou le forfait ${ABO.name}. Le total s’affiche en bas.`,
    crumbs,
  })}
<section class="section section-builder"><div class="container">${C.configurator()}</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Et ensuite ?</h2>
  ${C.steps([
    { t: 'Vous commandez', d: `Vous payez votre site en entier, en une fois ou en ${C.lissageTxt} fois avec ${C.ORGANISMES}.` },
    { t: 'Vous répondez au questionnaire', d: 'Dans votre espace client : votre activité, vos couleurs, vos photos.' },
    { t: 'Alex crée votre site', d: 'Dès votre questionnaire envoyé, avec vos réponses. Chaque page est vérifiée avant la mise en ligne.' },
    { t: 'Votre site est en ligne', d: `En ${ESS.delai}, une première version faite avec vos réponses. Avec le forfait ${AUTO.name}, on vous remet votre site, prêt à installer chez votre hébergeur.` },
    { t: 'Vous le peaufinez', d: `Avec le forfait ${ABO.name}, vous changez vous-même un texte ou une photo, à volonté, ou vous nous demandez la modification.` },
  ])}
</div></section>

${f.html}`;
  return {
    path: sections.creer.path,
    section: 'creer',
    bodyClass: 'page-creer',
    noMobileBar: true,
    title: 'Créer mon site internet et devenir visible | Les Minis Monstres',
    description: `Devenez visible : ${ESS.name} ${creation.prix} €, option ${ECO.name} + ${ECO.prix} €. Puis forfait ${AUTO.name} ou forfait ${ABO.name}. Le total s’affiche tout de suite.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== TARIFS
// La fonction garde son nom : la rubrique s'appelle toujours « forfaits » dans config.js (sections.forfaits).
// Deux choses bien séparées : créer le site (le Site Essentiel, option e-commerce, payés une fois) et le faire vivre (Autonomie ou Mini). Puis les extras.
function forfaitsPage() {
  const crumbs = crumb('forfaits');
  const f = C.faq(FAQ.forfaits || FAQ.tarifs || [], 'Vos questions sur les tarifs', 'faq-tarifs');
  const body = `${C.pageHero({
    section: 'forfaits',
    h1: `Tarifs : un site soigné, dès ${euro(creation.prix)}`,
    lead: `${C.lancementPhrase() ? `**${C.lancementPhrase()}** ` : ''}Des prix affichés, les mêmes pour tous, ${marche.foisTexte} fois moins chers qu’un indépendant. D’abord la création de votre site. Ensuite, le **forfait ${AUTO.name}** à ${euro(AUTO.month)} ou le **forfait ${ABO.name}** à ${euro(ABO.month)} par mois. Enfin, les extras, si vous en avez besoin.`,
    crumbs,
  })}
<section class="section"><div class="container" data-billing-scope>
  <h2 class="section-title">Un site, un prix, une option</h2>
  <p class="section-sub">Le ${esc(ESS.name)} à ${euro(ESS.price)}. Vous vendez en ligne ? L’option ${esc(ECO.name)} ajoute ${euro(ECO.prix)}. Pour grandir sur Google, des pages à ${euro(PRIX_PAGE)}.</p>
  ${commun(C.offre())}
  <a class="pr-pub c-pink reveal" href="${sections.fidelite.path}"><span class="pr-pub-ico" aria-hidden="true">${icon('gift')}</span><span class="pr-pub-txt"><strong>Et avec le parrainage, votre forfait peut ne rien vous coûter</strong><span>Chaque proche qui crée son site avec votre code : ${fidelite.parrainageMois} mois de forfait ${esc(forfaits[0].name)} offerts pour vous, et autant pour lui.</span></span><span class="pr-pub-go">${icon('arrow-right')}</span></a>
</div></section>

${C.modulesSite({ titre: 'Pourquoi ce prix : comment est fait votre site', id: 'comment' })}

<section class="section section-soft" id="extras"><div class="container">
  <h2 class="section-title">Enfin, les extras</h2>
  ${C.presente('etoile', `<strong>Moi, c’est ${esc(C.PEPITE)}.</strong> Les extras, c’est mon rayon : trois extras, pas plus. Vous me les demandez depuis votre espace client, quand vous en avez besoin.`, { humeur: 'ravi' })}
  ${C.extrasListe()}
</div></section>

<section class="section" id="detail"><div class="container container-narrow">
  <h2 class="section-title">Le détail, si vous le voulez</h2>
  <p class="section-sub">Touchez une ligne pour l’ouvrir.</p>
  ${C.deroulants([
    C.deroulant(`Ce que comprend le forfait ${esc(ABO.name)}, ligne par ligne`, `<ul class="list-check">${ABO.details.map((d) => `<li>${inline(d)}</li>`).join('')}</ul>`, { id: 'maintenir', ico: 'shield-check' }),
    C.deroulant(`Une modification avec le forfait ${esc(ABO.name)}, comment ça se passe ?`, `<p>Vous écrivez votre demande dans votre espace client. ${esc(C.CERISE)} vous aide à la formuler, et la modification est faite pour vous.</p>${C.processusModif({ titre: false })}`, { id: 'modifications', ico: 'repeat' }),
    C.deroulant(`Forfait ${esc(AUTO.name)} : vous préférez tout gérer vous-même ?`, commun(C.creationSeuleBox()), { id: 'creation-seule', ico: 'download' }),
    C.deroulant(`L’option ${esc(ECO.name)}, pour vendre sur internet`, C.optionsCompact(), { id: 'boutique', ico: 'shopping-bag' }),
    C.deroulant('Les pages de visibilité Google, pour grandir sur Google', `<p>${esc(C.PLUS_DE_PAGES)}</p><p>Chaque page répond à une recherche que font vos clients : un service et une ville, une question fréquente, votre métier, un petit guide. Elle s’ajoute à votre site, sans rien changer au reste.</p>`, { id: 'pages-google-detail', ico: 'search-check' }),
    C.deroulant('Comment payer ?', C.payBox(), { id: 'payer', ico: 'calendar-check' }),
    C.deroulant(`Et si vous arrêtez le forfait ${esc(ABO.name)} ?`, `<ul class="list-check">
      <li><strong>Quand vous voulez</strong> : un message suffit, ou le bouton de votre espace client. Le forfait ${esc(ABO.name)} s’arrête à la fin de la période déjà payée.</li>
      <li><strong>Votre nom de domaine reste à vous</strong> : il est à votre nom, et vous le transférez où vous voulez.</li>
      <li><strong>Vous repartez avec votre site</strong> : son export est possible, pour le faire héberger ailleurs.</li>
    </ul>`, { id: 'arreter', ico: 'log-out' }),
  ])}
</div></section>

<section class="section section-soft" id="uniques"><div class="container">
  <h2 class="section-title">Ce qui nous rend <mark>uniques</mark></h2>
  <p class="section-sub">Ce que vous avez avec chaque site, compris dans le prix.</p>
  ${C.avantagesNous()}
  ${C.prixJuste()}
  <div class="promos">
    <a class="promo c-butter reveal" href="${sections.comparatif.path}">
      <span class="promo-ico">${icon('scale')}</span>
      <span class="promo-text"><strong>Agence, indépendant ou plateforme ?</strong><span>Les prix du marché, ligne par ligne, et quand choisir chaque solution.</span></span>
      <span class="promo-go">${icon('arrow-right')}</span>
    </a>
  </div>
</div></section>

<section class="section section-soft" id="questions"><div class="container">
  <h2 class="section-title">Avant de vous décider</h2>
  ${C.objections()}
</div></section>

${f.html}
${C.ctaBand({ title: 'Le prix vous convient ?', text: 'Il ne reste qu’à devenir visible. Choisissez votre site en deux minutes : le total s’affiche avant de commander.' })}`;
  return {
    path: sections.forfaits.path,
    section: 'forfaits',
    title: `Tarifs : un site internet pour être visible, dès ${creation.prix} € | Les Minis Monstres`,
    description: `${ESS.name} : ${creation.prix} € la création, option ${ECO.name} + ${ECO.prix} €, pages Google à ${PRIX_PAGE} €. Puis forfait ${AUTO.name} à ${AUTO.month} € ou forfait ${ABO.name} à ${ABO.month} € par mois.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== LES OUTILS : mis de côté (24 novembre 2026, fin de soirée)
// Alex se concentre sur les sites : plus de page /outils/ ni rien de public sur les outils (config.outilsOffre.actif = false).
// L'ancienne page est dans l'historique git (commit f5e76a4) ; /outils/ est redirigée par scripts/wp-export.py.
const OUTILS_PAGE = false;

// ====================================================================== SEO
function seoPage() {
  const crumbs = crumb('seo');
  const f = C.faq(FAQ.seo, 'Vos questions sur la visibilité Google', 'faq-seo');
  const pack = PAGE_GOOGLE;

  // Les deux façons d'être plus visible : [couleur, monstre, titre, prix, liste]
  const levels = [
    [ESS.color, ESS.monstre, `Avec le ${ESS.name}`, `Compris, ${euro(ESS.price)}`, ['Un site rapide et sécurisé', 'Lisible sur téléphone et sur ordinateur', 'Un titre et une description pour Google', 'Des pages pensées pour que Google comprenne votre activité']],
    ['lilac', 'gelee', pack.name, `${euro(pack.price.once)} la page, sans abonnement`, ['Une page de plus, quand vous voulez', `Par exemple : ${(pack.exemples || []).join(', ').toLowerCase().replace('faq', 'FAQ')}`, `À l’unité, ou par ${C.packsSeo} pages`, 'Commandée depuis votre espace client, une fois le site en ligne']],
  ];
  const body = `${C.pageHero({
    section: 'seo',
    h1: 'Être trouvé sur Google : votre visibilité, c’est notre métier',
    lead: 'Un site que personne ne trouve, c’est une vitrine dans une rue vide. On construit le vôtre pour que Google le comprenne et le montre à vos futurs clients.',
    crumbs,
  })}
<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Être visible, ça veut dire quoi ?

Quand quelqu’un cherche quelque chose sur Google, il tape quelques mots. Google lui montre une liste de sites, et presque tout le monde clique sur les premiers.

Être visible, c’est aider Google à **trouver votre site**, à **comprendre ce que vous faites** et à le **montrer à ceux qui vous cherchent**. On appelle aussi cela le référencement (ou SEO). Ce n’est pas de la publicité : vous ne payez pas chaque clic.

## Un exemple

Vous êtes fleuriste à Reims. Une cliente tape « fleuriste Reims » sur Google.

- Sans ce travail, votre site existe, mais Google le range en page 3. Personne ne le voit.
- Avec ce travail, Google comprend que vous êtes fleuriste, à Reims, avec vos horaires et vos avis. Votre site a de vraies chances de remonter, et la cliente vous appelle.`)}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Ce qu’on fait pour votre visibilité</h2>
  <div class="feats feats-4 feats-courts">
    <div class="feat reveal">${icon('zap')}<h3>Des bases solides</h3><p>Un site rapide, sécurisé, lisible sur téléphone, que Google sait lire.</p></div>
    <div class="feat reveal">${icon('map-pin')}<h3>Le référencement local</h3><p>Fiche Google, pages pour vos villes, avis clients : pour sortir quand on cherche près de chez vous.</p></div>
    <div class="feat reveal">${icon('pen-tool')}<h3>Des contenus utiles</h3><p>Des pages qui répondent aux vraies questions de vos clients, écrites avec soin et relues.</p></div>
    <div class="feat reveal">${icon('chart-line')}<h3>Des pages en plus, payées une fois</h3><p>Une page de visibilité Google coûte ${euro(pack.price.once)}. Mirette prépare le sujet avec vous, et la page est vérifiée avant sa mise en ligne.</p></div>
  </div>
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Deux façons d’être plus visible</h2>
  <div class="seo-levels">${levels
    .map(
      ([c, m, t, prix, list]) => `<div class="seo-level c-${c} reveal"><span class="seo-art">${C.petit(m)}</span><p class="seo-name">${esc(t)}<small>${prix}</small></p><ul class="list-check">${list.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>`
    )
    .join('')}</div>
  <p class="center more">${C.btn(sections.forfaits.path, 'btn-light', sections.forfaits.icon, 'Voir les tarifs')}</p>
</div></section>

<section class="section section-soft"><div class="container container-narrow">
  <h2 class="section-title">Pour aller plus loin</h2>
  ${C.deroulants([
    C.deroulant('Notre méthode, point par point', `<p>Voici ce qu’on fait sur chaque site, sans exception. C’est le socle qui permet ensuite de gagner des places.</p>
  <ul class="list-check">
    <li>Des pages qui s’affichent vite, mesurées avec les outils de Google</li>
    <li>Un titre et une description écrits pour chaque page</li>
    <li>Des informations bien rangées, pour que Google comprenne votre activité, vos prix et vos horaires</li>
    <li>Un plan du site déclaré à Google, des adresses propres</li>
    <li>Des liens bien pensés entre vos pages</li>
    <li>Le site déclaré à Google dès la mise en ligne</li>
    <li>Une fiche Google, des avis, les mêmes infos partout</li>
    <li>Des contenus qui répondent aux questions de vos clients</li>
  </ul>
  <p class="proof">${icon('badge-check')}<span>Ce site est construit exactement comme ça : rapide, sans publicité, et chaque page décrit à Google qui on est et ce qu’on propose.</span></p>`, { ico: 'list-checks', ordi: true }),
    C.deroulant('Des pages utiles, pas des pages pour rien', md(`Une grande partie du travail, c’est de **créer des pages qui mènent vers votre site**. Chaque page répond à une recherche précise de vos clients, par exemple « bouquet de mariage Reims » ou « livraison de fleurs Épernay ». Elle explique, elle aide, et elle mène vers votre page principale ou votre contact.

Ce ne sont **pas des pages inutiles** remplies de mots-clés : Google les repère et les met de côté. Une page n’est créée que si elle sert vraiment à quelqu’un.

Votre site peut garder **une seule page principale**, simple et claire. À côté, on ajoute des pages de visibilité Google, chacune sur un sujet précis. Vos visiteurs voient un site simple, et Google trouve plus de bonnes raisons de vous montrer.

Ce site applique la même méthode. Ses [tutos](/mini-tuto/) répondent chacun à une question précise : le prix d’un site, le choix d’un nom de domaine, la fiche Google, et d’autres.`), { ico: 'file-text' }),
    C.deroulant('Ce qu’on ne promet pas', md(`Personne ne peut garantir la première place sur Google. Méfiez-vous de ceux qui le font.

Les premiers effets arrivent en général en quelques semaines, parfois quelques mois pour les recherches les plus disputées.

On ne publie pas des centaines de pages vides pour gonfler votre site : Google les repère et les pénalise. On préfère peu de contenus, mais vraiment utiles à vos clients.`), { ico: 'shield-check', ordi: true }),
  ])}
</div></section>

${f.html}
${C.ctaBand({ title: 'Être trouvé, ça commence ici', text: `Les bases sont comprises dans le ${ESS.name}. Pour aller plus loin : des pages de visibilité Google, ${euro(PRIX_PAGE)} la page.`, mascot: 'clin' })}`;
  return {
    path: sections.seo.path,
    section: 'seo',
    title: 'Être trouvé sur Google : la visibilité, notre métier | Les Minis Monstres',
    description: `Un site internet sert à être visible. Les bases pour être trouvé sur Google sont comprises dans chaque site, puis une page de visibilité Google coûte ${euro(pack.price.once)}.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.8,
  };
}

// ====================================================================== COMPARATIF : Les Minis Monstres ET LES AUTRES SOLUTIONS
function comparatifPage() {
  const crumbs = crumb('comparatif');
  const f = C.faq(FAQ.comparatif || [], 'Vos questions sur le comparatif', 'faq-comparatif');
  const who = [
    ['butter', 'building-2', 'L’agence', 'Une équipe complète, idéale pour un gros projet avec un budget à la hauteur. Le prix et le délai dépendent du devis.'],
    ['sky', 'user', 'L’indépendant', 'Une personne qui fait tout. La qualité dépend beaucoup de qui vous choisissez, et le suivi se fait souvent au devis.'],
    ['lilac', 'mouse-pointer-click', 'La plateforme à faire soi-même', 'Vous construisez votre site à partir de modèles. C’est vous qui faites le travail, les mises à jour et la visibilité sur Google.'],
    ['mint', 'sparkles', 'Les Minis Monstres', `Un site soigné, fait pour vous, à ${euro(creation.prix)}. Puis un espace client où vous voyez toutes vos pages, et où vous modifiez vous-même.`],
  ];
  const body = `${C.pageHero({
    section: 'comparatif',
    h1: 'Les Minis Monstres et les autres solutions',
    lead: 'Agence, indépendant ou plateforme à faire soi-même : chaque solution a sa place. La nôtre : un site soigné, suivi de près, et l’accès à tout depuis votre espace client.',
    crumbs,
  })}
<section class="section"><div class="container">
  ${C.comparatifTable()}
  <p class="center more">${C.btnCreer('btn-primary btn-lg')}</p>
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Pour qui, chaque solution ?</h2>
  <div class="feats feats-courts">${who
    .map(([c, ic, t, d]) => `<div class="feat who c-${c} reveal">${icon(ic)}<h3>${t}</h3><p>${d}</p></div>`)
    .join('')}</div>
</div></section>

<section class="section"><div class="container container-narrow">
  <h2 class="section-title">${marche.foisTexte} fois moins cher qu’un indépendant</h2>
  <p class="section-sub">Pour un site vitrine complet : accueil, présentation, services, photos et contact.</p>
  ${C.deroulants([
    C.deroulant('Les prix, côte à côte', md(`Un indépendant demande en général entre ${euro(marche.vitrineMin)} et ${euro(marche.vitrineMax)}. Une agence, plutôt ${euro(marche.agenceMin)} à ${euro(marche.agenceMax)}. Notre ${ESS.name}, qui contient ces mêmes parties, coûte ${euro(ESS.price)}.

Ces fourchettes sont publiées par des prestataires, et chaque devis est différent. Certains indépendants vendent un site dès ${euro(C.INDEPENDANT_DES)}. L’écart est alors d’environ ${C.ecartBas} fois. Les sources sont citées sous le tableau, en haut de cette page.`), { ico: 'scale' }),
    C.deroulant('Pourquoi ce prix ?', md(`Nous avons choisi de réduire nos charges au maximum, et nous avons automatisé une grande partie du travail répétitif : c’est ce qui rend ce prix possible. Ce que vous payez, c’est le temps qu’Alex passe sur votre site, avec vos textes, vos photos et vos couleurs.

Le prix reste juste : assez doux pour vous, assez juste pour que nous vivions de notre travail. Le détail est sur la page [pourquoi c’est moins cher](${sections.methode.path}).`), { ico: 'piggy-bank' }),
    C.deroulant('Ce que vous avez avec votre site', md(`Votre espace client vous montre la liste de toutes vos pages, dont vos pages de visibilité Google, avec un lien pour voir ou modifier chacune.

Avec le forfait ${ABO.name}, vous changez un texte ou une photo vous-même, en direct. Vous suivez votre commande, vos demandes de modification et vos factures au même endroit.`), { ico: 'key-round' }),
    C.deroulant('Et l’entretien, chaque mois ?', md(`Avec le forfait ${AUTO.name}, vous gérez tout vous-même, pour ${euro(AUTO.month)} par mois. Avec le forfait ${ABO.name}, ${euro(ABO.month)} par mois comprennent l’hébergement, les sauvegardes, la sécurité, la maintenance et les modifications. Pas de nom de domaine ? On vous le fournit pour ${euro(C.DOM)} de plus par mois. Les prestataires consultés demandent ${euro(marche.entretienMin)} à ${euro(marche.entretienMax)} par mois pour l’entretien d’un site : chez nous, c’est bien moins cher.`), { ico: 'repeat' }),
    C.deroulant('Ce que vous ne faites pas vous-même', md(`Avec une plateforme à faire soi-même, le site n’est jamais fini : il faut apprendre l’outil, choisir les réglages, écrire pour Google. Ici, vous dites ce que vous voulez, et votre site est fait pour vous. Vous gardez votre temps pour votre métier.`), { ico: 'clock' }),
    C.deroulant('Quand on vous dira d’aller ailleurs', md(`Une application sur mesure, un logiciel métier, un catalogue de milliers de produits : ces projets demandent une agence ou un développeur. On vous le dit dès le premier échange.`), { ico: 'arrow-right' }),
  ])}
</div></section>

${f.html}
${C.ctaBand({ title: 'On regarde votre projet ?', text: 'Choisissez votre site en deux minutes, ou posez vos questions par le formulaire de contact.' })}`;
  return {
    path: sections.comparatif.path,
    section: 'comparatif',
    title: 'Comparatif : agence web, freelance, plateforme | Les Minis Monstres',
    description: 'Agence web, freelance ou plateforme à faire soi-même : qui fait le travail, les prix, les délais, les modifications et la visibilité sur Google, comparés simplement.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.7,
  };
}

// ====================================================================== COMMANDER
// Le formulaire est posté sur /commander/ : sous WordPress, l'extension remplace l'action et traite la commande.
// Le JS préremplit depuis l'URL et calcule les montants ; le serveur recalcule tout.
const ORDER_ERRORS = {
  champs: 'Il manque une information. Vérifiez les champs marqués d’une étoile.',
  email: 'Cette adresse e-mail ne semble pas valide. Vérifiez-la, s’il vous plaît.',
  domaine: 'Indiquez le nom de domaine souhaité, ou cochez « J’ai déjà un nom de domaine ».',
  code: 'Ce code promo n’est pas reconnu. Vérifiez-le, ou laissez la case vide : vous pourrez nous écrire ensuite.',
  cgv: 'Pour commander, il faut accepter les conditions générales de vente.',
  demarrage: 'Choisissez quand la création doit commencer : maintenant, ou après les 14 jours.',
  paiement: 'Le paiement n’a pas abouti. Votre commande est gardée : vous pouvez réessayer, ou nous écrire.',
  robot: 'L’envoi a été bloqué par la protection contre les robots. Attendez quelques secondes et réessayez.',
  annule: 'Le paiement a été annulé. Rien n’a été débité : vous pouvez reprendre quand vous voulez.',
  mot_de_passe: 'Choisissez un mot de passe d’au moins 8 caractères : il ouvre votre espace client.',
  compte: 'Cette adresse e-mail a déjà un espace client, et le mot de passe ne correspond pas. Tapez votre mot de passe habituel, ou choisissez-en un nouveau avec « Mot de passe oublié ».',
  inconnu: 'Quelque chose n’a pas fonctionné. Réessayez, ou écrivez-nous par le formulaire de contact : on finalise la commande avec vous.',
};
function commanderPage({ creer = false } = {}) {
  const S = sections.commander;
  const crumbs = creer ? crumb('creer') : [HOME, { name: sections.creer.label, path: sections.creer.path }, { name: S.label, path: S.path }];
  const t0 = ESS, f0 = ABO; // le Site Essentiel, sans l'option e-commerce au départ
  const today0 = round2((t0.price * paiement.acompte) / 100); // la création en entier, payée à la commande
  const field = (name, label, attrs, { req = true, hint = '' } = {}) =>
    `<div class="field"><label for="o-${name}">${label} ${req ? '<span class="req">*</span>' : '<span class="opt">(facultatif)</span>'}</label><input id="o-${name}" name="${name}" ${attrs}${req ? ' required' : ''}>${hint ? `<small class="field-hint">${hint}</small>` : ''}</div>`;
  // ce qui se passe après la commande : le domaine, l'espace client, puis le déroulement réel (C.DEROULEMENT, sans « Vous commandez »)
  const nextSteps = [
    ['globe', 'Votre nom de domaine est prêt', 'Le vôtre, ou celui qu’on réserve à votre nom.'],
    ['circle-user', 'Votre espace client est prêt tout de suite', 'Avec le mot de passe choisi ici : vous y suivez votre commande, puis vos modifications.'],
    ...C.DEROULEMENT.filter((e) => e.id !== 'commande').map((e) => [e.icon, e.titre, esc(e.court)]),
  ];
  const body = `${C.pageHero({
    section: creer ? 'creer' : 'commander',
    h1: creer ? 'Créez votre site' : 'Votre commande',
    lead: creer ? 'Choisissez votre site et votre forfait, donnez vos coordonnées et payez en ligne. Tout se fait sur cette page.' : 'Vérifiez votre choix, donnez vos coordonnées et payez en ligne. C’est tout.',
    crumbs,
    compact: true,
  })}
<div class="container"><p class="notice notice-ventes" data-ventes-bientot role="status" hidden>${icon('hourglass')}<span>Les commandes ouvrent très bientôt : quelques démarches administratives à finir. Vous pouvez déjà tout préparer.</span></p></div>
<section class="section section-order"><div class="container">
  <ol class="o-steps" aria-label="Les trois étapes de la commande">
    <li class="c-mint"><span>1</span>Votre site</li>
    <li class="c-lilac"><span>2</span>Vos coordonnées</li>
    <li class="c-peach"><span>3</span>Paiement sécurisé</li>
  </ol>
  <div class="order" data-aled-order data-order-data="${C.priceData()}" data-billing-scope>
    <form class="o-form" id="o-form" method="post" action="${S.path}" data-order-form novalidate>
      <input type="hidden" name="aled08_order" value="1">
      ${formHidden()}
      <input type="hidden" name="domaine" value="" data-order-domaine>
      <div class="form-alert o-alert" data-order-error hidden role="alert" tabindex="-1"></div>
      <template data-order-errors>${Object.entries(ORDER_ERRORS).map(([k, v]) => `<p data-code="${k}">${v}</p>`).join('')}</template>

      <fieldset class="o-card">
        <legend><span class="b-n">1</span><span class="b-t">Votre site</span></legend>
        <div class="o-in">
        <p class="b-hint">Vous pouvez encore changer d’avis : les prix se mettent à jour.</p>
        <div class="cf o-cf">
        ${C.siteCarte({ name: 'type', court: true })}
        <p class="b-label">Qui s’occupe de votre site ?</p>
        ${C.gestionChoix({ name: 'gestion', court: true })}
        <div data-avec-formule>
        ${C.formulesChoix({ name: 'forfait', court: 'sans-carte' })}
        <input type="hidden" name="periode" value="mois">
        </div>
        </div>
        </div>
      </fieldset>

      <fieldset class="o-card" data-avec-formule>
        <legend><span class="b-n">${icon('globe')}</span><span class="b-t">Votre nom de domaine</span></legend>
        <div class="o-in">
        <p class="b-hint">Le nom de domaine, c’est l’adresse de votre site. ${esc(C.DOMAINE_REGLE)} Il est toujours à votre nom.</p>
        ${C.domainBox({ prefix: 'o', ownName: 'domaine_mien' })}
        </div>
      </fieldset>

      <fieldset class="o-card">
        <legend><span class="b-n">2</span><span class="b-t">Vos coordonnées</span></legend>
        <div class="o-in">
        <p class="b-hint">Elles servent à la facture et au nom de domaine, qui est à votre nom.</p>
        <div class="form-row">
          ${field('prenom', 'Prénom', 'type="text" autocomplete="given-name" maxlength="80"')}
          ${field('nom', 'Nom', 'type="text" autocomplete="family-name" maxlength="80"')}
        </div>
        <p class="o-connecte" data-order-moi hidden></p>
        <div class="form-row">
          ${field('email', 'E-mail', 'type="email" autocomplete="email" maxlength="150" inputmode="email"')}
          ${field('telephone', 'Téléphone', 'type="tel" autocomplete="tel" maxlength="30" inputmode="tel"')}
        </div>
        <div class="field o-mdp" data-order-mdp><label for="o-mot_de_passe">Mot de passe de votre espace client <span class="req">*</span></label><input id="o-mot_de_passe" name="mot_de_passe" type="password" autocomplete="new-password" minlength="8" maxlength="200" required><small class="field-hint">Nouveau client : choisissez-le, 8 caractères minimum. Vous suivrez votre commande avec. Déjà client : votre mot de passe habituel (<a href="/mon-espace/">mot de passe oublié ?</a>).</small></div>
        ${field('entreprise', 'Nom de votre activité', 'type="text" autocomplete="organization" maxlength="120" placeholder="Ex. : Pâtisserie Lila"', { req: false })}
        ${field('adresse', 'Adresse', 'type="text" autocomplete="street-address" maxlength="200"')}
        <div class="form-row">
          ${field('code_postal', 'Code postal', 'type="text" autocomplete="postal-code" inputmode="numeric" maxlength="10"')}
          ${field('ville', 'Ville', 'type="text" autocomplete="address-level2" maxlength="100"')}
        </div>
        <div class="field"><label for="o-message">Votre projet <span class="opt">(facultatif)</span></label><textarea id="o-message" name="message" maxlength="5000" placeholder="Votre activité, vos idées, un site que vous aimez…"></textarea></div>
        </div>
      </fieldset>

      <fieldset class="o-card">
        <legend><span class="b-n">3</span><span class="b-t">Paiement sécurisé</span></legend>
        <div class="o-in">
        <div class="cf o-cf">
        <p class="b-label">Comment voulez-vous payer votre site ?</p>
        ${C.paiementChoix({ name: 'lissage', une: '' })}
        ${C.codeEvenementBox({ name: 'code_evenement' })}
        </div>
        <label class="check"><input type="checkbox" name="cgv" value="oui" required><span>J’accepte les <a href="/conditions-generales/" target="_blank" rel="noopener">conditions générales de vente</a>. <span class="req">*</span></span></label>
        <fieldset class="o-depart">
          <legend>Quand voulez-vous que la création commence ? <span class="req">*</span></legend>
          <label class="check"><input type="radio" name="demarrage" value="oui" required><span><strong>Démarrer mon site maintenant.</strong> Je demande expressément que la création commence tout de suite, avant la fin du délai de rétractation de 14 jours. Je reconnais que je perds mon droit de rétractation dès que mon site est entièrement livré. Si je me rétracte avant, le travail déjà fait est retenu et le reste m’est remboursé.</span></label>
          <label class="check"><input type="radio" name="demarrage" value="attendre" required><span><strong>Attendre 14 jours.</strong> La création commence à la fin du délai de rétractation. Je garde ce droit jusque-là. Mon nom de domaine n’est réservé qu’après ces 14 jours : s’il a été pris entre-temps, Les Minis Monstres n’en sont pas responsables et prennent la forme la plus proche encore libre.</span></label>
        </fieldset>
        <div class="o-pay">
          <p class="o-pay-today"><span>Aujourd’hui vous payez</span><b data-order="today">${euro(today0)}</b></p>
          <ul class="o-pay-lines" data-order-lines>
            <li><span>Création du site (${t0.label.toLowerCase()})</span><b>${euro(today0)}</b></li>
          </ul>
          <p class="o-pay-next"><span data-order="next-label">Dès la mise en ligne : votre forfait</span><b data-order="next">${euro(f0.month + C.DOM)}/mois</b></p>
          <p class="o-pay-note">C’est le prix complet de votre site : rien d’autre à payer pour la création. Sur la page de paiement, vous réglez en une fois, ou en ${C.lissageTxt} fois avec ${C.ORGANISMES}.<span data-avec-formule> Votre forfait démarre à la mise en ligne : vous enregistrez alors votre carte.</span></p>
        </div>
        <button class="btn btn-primary btn-lg btn-block btn-flaque" type="submit">${icon('lock')}<span>Commander et payer <b data-order="btn">${euro(today0)}</b></span></button>
        <p class="o-trust">${icon('shield-check')}<span>Paiement sécurisé par Stripe. Vous recevez vos factures par e-mail.</span></p>
        </div>
      </fieldset>
    </form>

    <aside class="o-side">
      <div class="b-sum o-sum" aria-live="polite">
        <p class="b-sum-title">Votre récapitulatif</p>
        <ul class="b-lines">
          <li><span data-order="type">${esc(t0.name)}</span><b data-order="type-price">${euro(t0.price)}</b></li>
          <li><span data-order="forfait">Forfait ${esc(f0.name)}</span><b data-order="forfait-price">${euro(f0.month)}/mois</b></li>
          <li data-avec-formule><span data-order="domain">Nom de domaine fourni</span><b data-order="domain-prix">+ ${euro(C.DOM)}/mois</b></li>
          <li data-order-opts hidden><span data-order="opts-label">Options</span><b data-order="opts">0 €</b></li>
        </ul>
        <div class="b-total">
          <p><span>Aujourd’hui</span><b data-order="today">${euro(today0)}</b></p>
          <p><span data-order="next-label">Dès la mise en ligne : votre forfait</span><b data-order="next">${euro(f0.month + C.DOM)}/mois</b></p>
        </div>
        <p class="b-sum-note">${icon('check')}<span data-avec-formule>Votre forfait démarre à la mise en ligne de votre site, pas avant. Si on vous fournit le nom de domaine, il est réservé dès la commande.</span><span data-seule-txt hidden>Forfait ${esc(AUTO.name)} : pas d’abonnement. Une fois votre site validé, on vous le remet, prêt à installer.</span></p>
      </div>
      <div class="o-next reveal">
        <h2 class="h3">${icon('list-checks')}Ce qui se passe ensuite</h2>
        <!--commun--><ol>${nextSteps.map(([ic, t, d]) => `<li${ic === 'globe' ? ' data-avec-formule' : ''}>${icon(ic)}<span><strong>${t}</strong><small>${d}</small></span></li>`).join('')}</ol><!--/commun-->
        <p class="o-help">Une question avant de commander ? ${C.btnWa('btn-light btn-sm', 'Nous écrire')}</p>
      </div>
    </aside>
  </div>
</div></section>`;
  if (creer) {
    const f = C.faq(FAQ.creation, 'Vos questions sur la création', 'faq-creation');
    return {
      path: sections.creer.path,
      section: 'creer',
      bodyClass: 'page-commander page-creer',
      noMobileBar: true,
      title: 'Créer mon site internet et devenir visible | Les Minis Monstres',
      description: `Créez votre site : ${ESS.name} ${creation.prix} €, ou ${BOU.price} € avec l’option ${ECO.name}, en une fois ou en ${C.lissageTxt} fois. Puis le forfait de votre choix.`,
      crumbs,
      body: body + f.html,
      schema: [f.schema],
      priority: 0.9,
    };
  }
  return {
    path: S.path,
    section: 'commander',
    bodyClass: 'page-commander',
    noindex: true,
    noMobileBar: true,
    title: 'Votre commande | Les Minis Monstres',
    description: `Vérifiez votre site, choisissez le forfait Autonome ou le forfait Mini, donnez vos coordonnées et payez en ligne en toute sécurité. Vous réglez votre site en une fois, ou en ${C.lissageTxt} fois avec ${C.ORGANISMES}.`,
    crumbs,
    body,
  };
}

// ====================================================================== COMMANDE CONFIRMÉE
function confirmationPage() {
  const S = sections.confirmation;
  const delaiList = `${ESS.delai}, avec ou sans l’option ${ECO.name.toLowerCase()}`;
  const body = `${C.pageHero({
    section: 'confirmation',
    h1: 'Merci, votre commande est bien reçue !',
    lead: 'On s’en occupe dès maintenant. Voici ce qui se passe ensuite.',
    mascot: 'ravie',
  })}
<section class="section"><div class="container container-narrow">
  <div class="confirm reveal">
    <p class="confirm-ref" data-ref-box hidden>${icon('receipt')}<span>Référence de votre commande : <b data-ref></b></span></p>
    <p class="confirm-msg" data-confirm-paid>${icon('circle-check')}<span>Votre paiement est enregistré. La facture arrive par e-mail, et vous la retrouvez dans votre espace client.</span></p>
    <p class="confirm-msg is-wait" data-confirm-wait hidden>${icon('hourglass')}<span>On vous envoie le lien de paiement sous 24 heures. Votre commande est gardée : rien à faire de votre côté pour l’instant.</span></p>
    <h2 class="h3">Les prochaines étapes</h2>
    ${C.steps([
      { t: 'Votre espace client est prêt', d: 'Vous y êtes connecté, avec le mot de passe choisi à la commande : vous y suivez votre commande et, ensuite, vos modifications.' },
      { t: 'Le questionnaire de création', d: 'Dans votre espace client : votre activité, vos couleurs, vos photos. Son envoi lance la création de votre site.' },
      { t: 'Votre nom de domaine est prêt', d: `Vous gardez le vôtre, ou on vous en fournit un, à votre nom, avec le forfait ${ABO.name}.` },
      { t: 'Votre site est en ligne', d: `Comptez ${delaiList} après l’envoi du questionnaire. Ensuite, vous le modifiez à volonté.` },
    ])}
    <div class="hero-ctas centered">${C.btn(sections.monespace.path, 'btn-primary btn-lg', 'circle-user', 'Accéder à mon espace')}${C.btnWa('btn-light btn-lg', 'Une question ? Nous écrire')}</div>
  </div>
</div></section>`;
  return {
    path: S.path,
    section: 'confirmation',
    noindex: true,
    noMobileBar: true,
    title: 'Commande confirmée | Les Minis Monstres',
    description: 'Merci pour votre commande. Votre espace client est prêt, avec le questionnaire de création : une fois envoyé, votre site est en ligne 24 à 48 heures après.',
    body,
  };
}

// ====================================================================== FIDÉLITÉ
// Le parrainage (25 novembre 2026, Alex : « montrer la puissance du parrainage ») : 6 mois de forfait Mini offerts au filleul
// ET au parrain, à chaque filleul, sans limite. Le code est dans l'espace client ; l'extension fait le reste (includes/parrainage.php).
function fidelitePage() {
  const crumbs = crumb('fidelite');
  const M = fidelite.parrainageMois;
  const mini = forfaits[0];
  const val = M * mini.month;
  const etapes = [
    ['butter', 'key-round', '1. Votre code', 'Il vous attend dans votre espace client, avec votre lien à envoyer en un geste : WhatsApp, SMS ou e-mail.'],
    ['mint', 'wand-sparkles', '2. Votre proche crée son site', `Il tape votre code dans « Code promo ou parrainage » en commandant son ${esc(ESS.name)}.`],
    ['pink', 'gift', `3. ${M} mois offerts, chacun`, `Un mois après la mise en ligne de son site : ${M} mois de forfait ${esc(mini.name)} offerts pour lui, et ${M} mois pour vous.`],
  ];
  const paliers = [1, 2, 4, 10];
  const ligne = (n) => { const mo = n * M; const ans = mo % 12 === 0 ? ` (${mo / 12 === 1 ? 'un an' : mo / 12 + ' ans'})` : ''; return `<tr><td><b>${n}</b> filleul${n > 1 ? 's' : ''}</td><td><b>${mo} mois</b>${ans}</td><td><b>${euro(mo * mini.month)}</b></td></tr>`; };
  const body = `${C.pageHero({
    section: 'fidelite',
    h1: `Parrainage : ${M} mois offerts pour vous, ${M} mois pour vos proches`,
    lead: `Vous aimez votre site ? Faites-le connaître. Chaque proche qui crée son site avec votre code vous rapporte ${M} mois de forfait ${esc(mini.name)} offerts, et il en reçoit autant. Sans limite.`,
    crumbs,
  })}
<section class="section"><div class="container">
  <h2 class="section-title">Comment ça marche</h2>
  <div class="perks perks-3">${etapes.map(([c, ic, t, d]) => `<article class="perk c-${c} reveal"><span class="perk-ico">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
</div></section>
<section class="section section-soft" id="puissance"><div class="container container-narrow">
  <h2 class="section-title">La puissance du parrainage</h2>
  <p class="section-sub">Chaque filleul compte. Avec ${M} mois par filleul, deux proches suffisent pour une année entière de forfait ${esc(mini.name)} offerte.</p>
  <div class="pr-tableau reveal"><table><thead><tr><th>Vos filleuls</th><th>Vos mois offerts</th><th>Vous économisez</th></tr></thead><tbody>${paliers.map(ligne).join('')}</tbody></table></div>
  <p class="center small muted">Sur la base du forfait ${esc(mini.name)} à ${euro(mini.month)} par mois. Et chacun de vos filleuls reçoit aussi ${M} mois offerts, soit ${euro(val)}.</p>
</div></section>
<section class="section"><div class="container container-narrow prose">${md(`## Les questions qu’on nous pose

**Qui peut parrainer ?** Toute personne qui a un espace client des Minis Monstres. Votre code est dans votre espace, sur l’accueil et dans Mon compte, rubrique « Parrainage ».

**Combien de proches puis-je parrainer ?** Autant que vous voulez. Chaque filleul vous rapporte ${M} mois de plus, qui s’ajoutent aux précédents.

**Quand les mois offerts commencent-ils ?** Un mois après la mise en ligne du site de votre filleul. Vous êtes prévenu par e-mail le jour de sa mise en ligne, puis le jour où vos mois s’activent. Si votre forfait est déjà en cours, ses prochaines factures sont suspendues pendant ${M} mois. S’il n’a pas encore commencé, il démarrera avec ${M} mois sans rien payer.

**Je n’ai pas encore de site, ça marche quand même ?** Oui : vos mois offerts vous attendent, et ils commenceront avec votre forfait ${esc(mini.name)}.

**Et mon filleul ?** Il reçoit ${M} mois de forfait ${esc(mini.name)} offerts, un mois après la mise en ligne de son site, s’il a choisi ce forfait.

Les conditions complètes sont dans les [conditions générales](${'/conditions-generales/'}), article 17.`)}</div></section>
<section class="section"><div class="container center"><div class="hero-ctas centered">${C.btn(sections.monespace.path, 'btn-primary btn-lg', 'gift', 'Mon code de parrainage')}${C.btn(sections.creer.path, 'btn-light btn-lg', 'wand-sparkles', 'Créer mon site avec un code')}</div></div></section>
${C.ctaBand()}`;
  return {
    path: sections.fidelite.path,
    section: 'fidelite',
    title: `Parrainage : ${M} mois de forfait offerts pour vous et vos proches | Les Minis Monstres`,
    description: `Parrainez vos proches : chaque site créé avec votre code vous rapporte ${M} mois de forfait ${mini.name} offerts, et autant pour votre filleul. Sans limite.`,
    crumbs,
    body,
    priority: 0.6,
  };
}

// ====================================================================== LA DÉMO DE L'ESPACE CLIENT (/mon-espace/demo/)
// Refaite le 24 novembre 2026 (fin de soirée) pour ressembler à l'espace client RÉEL d'aujourd'hui (src/wordpress/aled08-espace) :
// Accueil (cartes, fil de la bande, abonnement, petits mots), Mon site (Ma commande, Modifications, Extras, Ma boutique) et
// Mon compte. Mêmes classes que le vrai espace (la page charge aussi assets/css/espace.css). Une cliente imaginaire,
// « Pâtisserie Lila » (Site Essentiel avec l'option e-commerce, en ligne) ; chaque bouton affiche seulement un petit message.
// Rien sur les outils, l'énergie, les jetons ou des tutos payants : ils n'existent plus dans l'espace.
const DEMO = { nom: 'Pâtisserie Lila', prenom: 'Lila', domaine: 'patisserie-lila.fr', ref: 'DEMO-2611' };
// Les sous-menus des onglets de la démo : le même dessin que le vrai espace (includes/sous-menus.php, aled08e_sm_html).
// parts : [[id, icône, libellé, html], …] ; les rubriques vides ne sont pas proposées, la première est ouverte.
function smNav(items, label) {
  return items.length < 2 ? '' : `<nav class="ex-filtre bg-nav sm-nav" data-sm-nav aria-label="${label}">${items.map(([id, ic, lib], i) => `<button type="button" class="bg-lien${i ? '' : ' is-on'}" data-sm-go="${id}" aria-pressed="${i ? 'false' : 'true'}">${icon(ic)}<span>${lib}</span></button>`).join('')}</nav>`;
}
function smHtml(parts, label) {
  const l = parts.filter((p) => String(p[3] || '').trim() !== '');
  const nav = smNav(l, label);
  return nav + l.map(([id, , , html], i) => `<div class="sm-part" data-sm-part="${id}"${i ? ' hidden' : ''}>${html}</div>`).join('');
}
// L'onglet « Statistiques » de la démo : le même squelette que le vrai espace (src/wordpress/aled08-espace/includes/statistiques.php),
// rempli par src/assets/js/main.js avec ces chiffres d'EXEMPLE (une pâtisserie imaginaire), annoncés comme tels.
function demoStats() {
  const jours = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 9, 27 + i));
    const v = Math.max(4, Math.round(18 + i * 0.9 + 6 * Math.sin(i / 2.2) + (d.getUTCDay() === 6 ? 12 : 0)));
    return { jour: d.toISOString().slice(0, 10), visiteurs: v, vues: Math.round(v * 2.7) };
  });
  const ex = {
    etat: 'ok',
    aujourdhui: { vues: 94, visiteurs: 37, actifs: 4 },
    jours,
    pages: { '/': 1180, '/nos-gateaux/': 642, '/gateau-d-anniversaire-rethel/': 418, '/commander/': 305, '/contact/': 214, '/la-boutique/': 176, '/horaires-et-acces/': 133, '/qui-sommes-nous/': 71 },
    pages_infos: {
      '/': { titre: 'Accueil', adresse: `https://${DEMO.domaine}/` },
      '/nos-gateaux/': { titre: 'Nos gâteaux', adresse: `https://${DEMO.domaine}/nos-gateaux/` },
      '/gateau-d-anniversaire-rethel/': { titre: 'Gâteau d’anniversaire à Rethel', adresse: `https://${DEMO.domaine}/gateau-d-anniversaire-rethel/`, google: true },
      '/commander/': { titre: 'Commander un gâteau', adresse: `https://${DEMO.domaine}/commander/` },
      '/contact/': { titre: 'Contact', adresse: `https://${DEMO.domaine}/contact/` },
      '/la-boutique/': { titre: 'La boutique', adresse: `https://${DEMO.domaine}/la-boutique/` },
      '/horaires-et-acces/': { titre: 'Horaires et accès', adresse: `https://${DEMO.domaine}/horaires-et-acces/` },
      '/qui-sommes-nous/': { titre: 'Qui sommes-nous', adresse: `https://${DEMO.domaine}/qui-sommes-nous/` },
    },
    sources: { Google: 512, 'Accès direct': 268, 'Réseaux sociaux': 131, 'Autres moteurs': 24, 'Autres sites': 17 },
    appareils: { mobile: 641, ordinateur: 262, tablette: 49 },
    google: { etat: 'ok', jours: 28, apparitions: 6840, clics: 498, recherches: [
      { recherche: 'pâtisserie rethel', position: 2.1, apparitions: 1210, clics: 164 },
      { recherche: 'gâteau anniversaire rethel', position: 3.4, apparitions: 860, clics: 97 },
      { recherche: 'pâtisserie lila', position: 1, apparitions: 402, clics: 121 },
      { recherche: 'gâteau sur commande ardennes', position: 7.8, apparitions: 1530, clics: 41 },
      { recherche: 'entremets rethel', position: 5.2, apparitions: 390, clics: 22 },
      { recherche: 'boulangerie pâtisserie près de moi', position: 12.6, apparitions: 2448, clics: 18 },
    ] },
    serveur: { https: true, temps_reponse: 0.31 },
    contenu: { pages: 12, articles: 3 },
    boutique: { produits: 24, commandes_30j: 31, ventes_30j: 1184.5 },
  };
  const kpi = (k, ic, lab, c) => `<div class="st2-kpi c-${c}"><span class="st2-kpi-ico" aria-hidden="true">${icon(ic)}</span><small>${lab}</small><strong data-st2-v="${k}">…</strong><span class="st2-kpi-plus" data-st2-p="${k}"></span></div>`;
  const bloc = (id, ic, titre, corps, aide) => `<section class="st2-bloc" data-st2-bloc="${id}"><h3>${icon(ic)}<span>${titre}</span></h3>${corps}<p class="st2-aide">${aide}</p></section>`;
  return `<div class="st2" data-stats2 data-demo="1" data-exemple="${esc(JSON.stringify(ex))}">`
    + '<p class="st2-maj" data-st2-maj aria-live="polite">Connexion à votre site…</p><p class="esp-warn" data-st2-msg hidden></p>'
    + smHtml([
      ['resume', 'chart-line', 'Résumé', `<div class="st2-kpis">${kpi('visiteurs', 'users', 'Visiteurs sur 30 jours', 'mint')}${kpi('vues', 'eye', 'Pages vues sur 30 jours', 'sky')}${kpi('semaine', 'calendar-check', 'Visiteurs cette semaine', 'lilac')}${kpi('google', 'search', 'Clics depuis Google', 'peach')}</div>`],
      ['pages', 'trophy', 'Meilleures pages', bloc('pages', 'trophy', 'Vos meilleures pages', '<ol class="st2-pages" data-st2="pages"></ol>', 'Les pages les plus vues sur les 30 derniers jours. La part indique quelle proportion de toutes les pages vues elle représente.')],
      ['visiteurs', 'users', 'Visiteurs', bloc('jours', 'chart-line', 'Vos visiteurs, jour par jour', '<div class="st2-jours" data-st2="jours"></div><p class="st2-ligne" data-st2="record"></p>', 'Chaque barre est une journée : le nombre de personnes différentes venues sur votre site ce jour-là.')
        + '<div class="st2-duo">'
        + bloc('sources', 'navigation', 'D’où viennent vos visiteurs', '<ul class="st2-barres" data-st2="sources"></ul>', 'Accès direct : votre adresse tapée, un favori, un lien dans un e-mail ou un SMS.')
        + bloc('appareils', 'smartphone', 'Sur quel appareil', '<ul class="st2-barres" data-st2="appareils"></ul>', 'Sur téléphone, un site doit se lire sans zoomer : le vôtre est fait pour.')
        + '</div>'],
      ['google', 'search-check', 'Google', bloc('google', 'search-check', 'Sur Google', '<div class="st2-google" data-st2="google"></div>', 'Apparitions : combien de fois votre site s’est affiché dans les résultats. Position : votre place moyenne dans la page de Google (1 = tout en haut).')],
      ['infos', 'info', 'En bref', bloc('infos', 'info', 'Votre site en bref', '<dl class="st2-infos" data-st2="infos"></dl>', 'La vitesse est le temps moyen que met votre site à répondre. Sous une demi-seconde, c’est très rapide.')],
    ], 'Rubriques de Mes statistiques')
    + '<p class="app-note">Mesure d’audience sans cookie : vos visiteurs sont comptés de façon anonyme, sans aucune donnée personnelle gardée. Vos propres visites, quand vous êtes connecté, et celles des robots ne sont pas comptées.</p>'
    + '</div>';
}
// Les tutos d'une partie de l'espace (champ `espace` des tutos), comme les liens « ? » du vrai espace (includes/aide.php)
function demoAide(espace, max = 3) {
  const l = C.TUTOS.tutos.filter((t) => t.espace === espace);
  if (!l.length) return '';
  const liens = l.slice(0, max).map((t) => `<a href="${t.path}" target="_blank" rel="noopener">${esc(plain(t.nom))}</a>`);
  if (l.length > max) liens.push(`<a href="${C.TUTOS.HUB}" target="_blank" rel="noopener">tous les tutos</a>`);
  return `<p class="mm-aide"><span class="mm-aide-ico" aria-hidden="true">?</span><span class="mm-aide-txt"><span class="mm-aide-lab">${liens.length > 1 ? 'Les tutos :' : 'Le tuto :'}</span> ${liens.join('<span class="mm-aide-sep" aria-hidden="true"> · </span>')}</span></p>`;
}
// Les dessins, comme dans le vrai espace (scripts/wp-espace-data.js) : Cerise et ses humeurs, Alex, et la petite bande
const mon = (n) => (['mascotte', 'clin', 'ravie', 'pense', 'triste'].includes(n) ? monster(n) : n === 'alex' ? C.alexPortrait() : C.petit(n));
const demoToast = (msg) => ` data-toast-msg="${esc(msg)} (démo)"`;

function monEspacePage() {
  const ECOLE_A = ateliers.find((x) => x.id === 'ecole') || { label: 'Mes Tutos', path: C.TUTOS.HUB, monstre: 'mochi', color: 'lilac' };
  const SITES_A = ateliers.find((x) => x.id === 'sites') || { monstre: 'bricou', color: 'mint' };
  const tabM = (id, m, label, on) => `<button type="button" role="tab" id="tab-${id}" aria-controls="t-${id}" aria-selected="${on ? 'true' : 'false'}"${on ? '' : ' tabindex="-1"'} data-tab="${id}"><span class="tab-monstre" aria-hidden="true">${mon(m)}</span><span class="tab-ico" aria-hidden="true">${icon({ accueil: 'house', site: 'globe', outils: 'sparkles', compte: 'circle-user' }[id] || 'house')}</span><span>${label}</span></button>`;
  const tabS = (id, ic, label) => `<button type="button" role="tab" id="tab-${id}" aria-controls="t-${id}" aria-selected="false" tabindex="-1" data-tab="${id}" data-groupe="site" class="tab-sous">${icon(ic)}<span>${label}</span></button>`;
  const SITE_TABS = [['stats', 'chart-line', 'Statistiques'], ['commande', 'package', 'Ma commande'], ['demandes', 'pencil', 'Modifications'], ['extras', 'sparkles', 'Extras'], ['vacances', 'shopping-bag', 'Ma boutique']];
  const siteNav = (actif) => `<nav class="mm-site-nav" aria-label="Mon site">${SITE_TABS.map(([id, ic, l]) => `<button type="button" data-go="${id}"${id === actif ? ' aria-current="page"' : ''}>${icon(ic)}<span>${l}</span></button>`).join('')}</nav>`;
  const mensuel = ABO.month + C.DOM;
  // ---- Accueil : le fil de la bande et les petits mots (exemples inventés)
  const FIL = [
    ['bricou', 'Votre modification « horaires d’été » est en ligne.', 'il y a 2 jours'],
    ['mochi', 'Nouvelle commande dans votre boutique : n° 1042, un gâteau d’anniversaire.', 'hier'],
    ['gelee', 'Votre page « Gâteau d’anniversaire à Rethel » est en ligne.', 'lundi'],
    ['mascotte', 'Bienvenue dans votre espace, Lila ! Votre site est en ligne.', '3 novembre'],
  ];
  const MSGS = [
    { m: 'bricou', qui: C.BRICOU, role: 'Le constructeur', quand: 'cette semaine', titre: 'Je veille sur votre site', texte: 'Sauvegardes, cadenas et surveillance : tout est en place. Si quelque chose ne va pas, Alex est prévenu.', vis: `<div class="msg-vis msg-voyants" aria-hidden="true"><span>${icon('check')}Sauvegarde</span><span>${icon('lock')}HTTPS</span><span>${icon('shield-check')}Surveillé</span></div>` },
    { m: 'gelee', qui: 'Mirette', role: 'La spécialiste visibilité', quand: 'lundi', titre: 'Votre page de visibilité Google est en ligne', texte: '« Gâteau d’anniversaire à Rethel » est intégrée à votre site.', vis: `<div class="msg-vis msg-google" aria-hidden="true"><small>${DEMO.domaine} › anniversaire</small><b>Gâteau d’anniversaire à Rethel | ${DEMO.nom}</b><span>Gâteaux sur commande, à partager…</span></div>` },
  ];
  // ---- Ma boutique : les articles de la démo, en petits dessins pastel (sans image externe)
  const articles = [
    ['Tarte aux fraises', '4,50 €', 'tarte', 'Une pâte sablée, une crème légère et des fraises fraîches. À la part, à emporter.'],
    ['Éclair au chocolat', '3,20 €', 'eclair', 'Pâte à choux, crème au chocolat noir et glaçage brillant.'],
    ['Gâteau d’anniversaire, 8 parts', '32 €', 'gateau', 'Génoise, crème vanille et fruits rouges. À commander 48 h à l’avance.'],
  ];
  const VIGNETTE = {
    tarte: '<rect width="64" height="64" rx="14" fill="#FFE8F1"/><ellipse cx="32" cy="42" rx="22" ry="9" fill="#F3C98B"/><path d="M10 42c0-9 10-15 22-15s22 6 22 15z" fill="#FFF6CF"/><circle cx="22" cy="34" r="5" fill="#FF6F91"/><circle cx="32" cy="30" r="5" fill="#FF8FA9"/><circle cx="42" cy="34" r="5" fill="#FF6F91"/><circle cx="27" cy="39" r="4" fill="#FF8FA9"/><circle cx="37" cy="39" r="4" fill="#FF6F91"/><path d="M31 25l1-3 1 3z" fill="#7EDDB5"/>',
    eclair: '<rect width="64" height="64" rx="14" fill="#DDF0FF"/><rect x="9" y="30" width="46" height="16" rx="8" fill="#F3C98B"/><path d="M11 34a8 8 0 0 1 8-8h26a8 8 0 0 1 8 8v1H11z" fill="#7A4B3A"/><path d="M18 30h14" stroke="#B98A75" stroke-width="2.5" stroke-linecap="round"/><rect x="12" y="38" width="40" height="3" rx="1.5" fill="#FFF6CF"/>',
    gateau: '<rect width="64" height="64" rx="14" fill="#EEE7FF"/><rect x="13" y="34" width="38" height="16" rx="5" fill="#FFD9E6"/><rect x="18" y="24" width="28" height="12" rx="5" fill="#FFF6CF"/><path d="M13 40c5 4 8-3 13 0s8-3 12 0 8-3 13 0" fill="none" stroke="#FF8FB8" stroke-width="3" stroke-linecap="round"/><rect x="30.5" y="13" width="3" height="11" rx="1.5" fill="#B9A6FF"/><path d="M32 6c3 3 2 6 0 7-2-1-3-4 0-7z" fill="#FFD45E"/>',
  };
  const vignette = (k) => `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${VIGNETTE[k]}</svg>`;
  const articleCarte = ([nom, prix, dessin, desc], i) => `<details class="art-carte"${i === 0 ? ' open' : ''}>
                <summary><span class="art-vignette">${vignette(dessin)}</span><span class="art-txt"><strong>${nom}</strong><b>${prix}</b><em class="st st-done">En ligne</em></span><span class="art-modifier">${icon('pen-tool')}<span>Modifier</span></span></summary>
                <div class="art-form">
                  <div class="art-photo"><span class="art-vignette">${vignette(dessin)}</span><button type="button" class="btn btn-light btn-sm"${demoToast('Dans votre vrai espace : choisissez une photo sur votre téléphone')}>${icon('image-plus')}<span>Changer la photo</span></button></div>
                  <div class="field"><label for="art-nom-${i}">Nom</label><input id="art-nom-${i}" type="text" value="${nom}" maxlength="80"></div>
                  <div class="field"><label for="art-desc-${i}">Description</label><textarea id="art-desc-${i}" rows="3" maxlength="400">${desc}</textarea></div>
                  <div class="field art-prix"><label for="art-prix-${i}">Prix (en €)</label><input id="art-prix-${i}" type="text" inputmode="decimal" value="${prix.replace(' €', '')}" maxlength="10"></div>
                  <button type="button" class="btn btn-primary"${demoToast('Enregistré : l’article est à jour sur votre site')}>${icon('check')}<span>Enregistrer</span></button>
                </div>
              </details>`;
  const BQ = [['articles', 'shopping-bag', 'Mes articles'], ['prix', 'tag', 'Mes prix'], ['paiements', 'credit-card', 'Paiements'], ['livraison', 'package', 'Livraison'], ['commandes', 'clipboard-check', 'Commandes'], ['promos', 'badge-percent', 'Promos et soldes']];
  // ---- Extras : les mêmes cartes que le vrai espace (« À la une » d'abord, puis la fonctionnalité spécifique)
  const UNE = C.TUTOS.offre.aLaUne || [];
  const tutoDe = (slug) => C.TUTOS.trouve(slug);
  const exTuto = (slug) => { const t = slug && tutoDe(slug); return t ? `<p class="ex-tuto"><span class="mm-aide-ico" aria-hidden="true">?</span><a href="${t.path}" target="_blank" rel="noopener">Le tuto : comment ça marche</a></p>` : ''; };
  const badgeUne = `<em class="ex-badge ex-badge-une">${icon('star')}À la une</em>`;
  const extras = C.EXTRAS_PAR_FAMILLE.flatMap((g) => g.items.map((x) => ({ ...x, groupe: g.id })));
  const couleur = { trouve: 'mint', langue: 'sky', mesure: 'lilac' };
  const slugExtra = { packseo: UNE[0], anglais: UNE[2] };
  const carteExtra = (x) => `<article class="ex-carte${x.devis ? ' ex-devis' : ''} c-${couleur[x.groupe] || 'lilac'}" id="ex-${x.id}">
            <header class="ex-tete"><span class="ex-ico">${icon(x.icon)}</span><div class="ex-nom"><strong>${esc(x.name)}</strong>${slugExtra[x.id] ? badgeUne : ''}</div><span class="ex-prix"><b>${x.devis ? 'Sur devis' : euro(x.fois)}</b><small>${x.devis ? 'gratuit, sans engagement' : 'la page, sans abonnement'}</small></span></header>
            <p class="ex-court">${esc(x.court || plain(x.desc || ''))}</p>
            ${x.inclus ? `<ul class="ex-inclus">${x.inclus.map((l) => `<li>${icon('check')}<span>${esc(l)}</span></li>`).join('')}</ul>` : ''}
            ${exTuto(slugExtra[x.id])}
            <button type="button" class="btn ${x.devis ? 'btn-light' : 'btn-primary'} btn-sm"${demoToast(x.devis ? 'Demande de devis envoyée : vous recevez un prix, rien à payer tant que vous n’avez pas dit oui' : `Paiement par carte, ${euro(x.fois)} la page : Mirette prépare votre page`)}>${icon(x.devis ? 'file-text' : 'plus')}<span>${x.devis ? 'Demander un devis' : 'Je le veux'}</span></button>
          </article>`;
  const carteEcommerce = `<article class="ex-carte c-peach is-actif" id="ex-ecommerce">
            <header class="ex-tete"><span class="ex-ico">${icon('shopping-bag')}</span><div class="ex-nom"><strong>Option ${esc(ECO.name.toLowerCase())}</strong><em class="ex-badge ex-badge-actif">${icon('check')}Active</em></div></header>
            <p class="ex-court">Votre boutique en ligne est ouverte : vos articles, vos prix, vos paiements et vos commandes se gèrent dans « Ma boutique ».</p>
            ${exTuto(UNE[1])}
            <button type="button" class="btn btn-light btn-sm" data-go="vacances">${icon('shopping-bag')}<span>Ouvrir Ma boutique</span></button>
          </article>`;
  const cartesExtras = [...extras.filter((x) => slugExtra[x.id] === UNE[0]).map(carteExtra), carteEcommerce, ...extras.filter((x) => slugExtra[x.id] && slugExtra[x.id] !== UNE[0]).map(carteExtra), ...extras.filter((x) => !slugExtra[x.id]).map(carteExtra)];
  // ---- Ma commande : la frise du vrai espace, toute faite (le site est en ligne)
  const FRISE = [['Commande reçue', '3 nov, 9:12'], ['Paiement', '3 nov, 9:14'], ['Nom de domaine', '3 nov, 9:40'], ['Hébergement', ''], ['Sécurité (SSL)', '3 nov, 10:02'], ['Création du site', '4 nov, 15:30'], ['En ligne', '5 nov, 11:05']];

  const body = `${C.pageHero({
    section: 'monespace',
    h1: 'Mon espace : la démo',
    lead: `L’espace de « ${DEMO.nom} », une cliente imaginaire qui a un ${esc(ESS.name)} avec l’option ${esc(ECO.name.toLowerCase())}. Promenez-vous : modifiez un texte de son site, demandez une modification, changez un prix. Rien n’est envoyé.`,
    crumbs: DEMO_CRUMBS,
  })}
<section class="section section-app"><div class="container">
  <div class="app app-maison" data-app>
    <div hidden data-lia-chat="demo" data-prix="0" data-solde="0" data-uid="demo" data-sans-energie="1"></div>
    <div hidden data-lia-demo>
      <p data-mots="horaire,fermé,ferme,ouvert,ouvre,hours,closed,open" data-type="demande" data-par="lia" data-cout="0" data-texte="Sur la page Contact, changer les horaires : nous serons fermés le lundi 24 novembre.">Coucou ! Pour changer tes horaires, c’est Bricou qu’il te faut : écris-lui dans « Modifications », il prépare tout pour Alex. Je t’ai mis ta phrase juste ici, c’est bien ça ?</p>
      <p data-mots="photo,image,picture" data-type="demande" data-par="lia" data-cout="0" data-texte="Sur la page d’accueil, remplacer la photo du haut par celle que je joins.">Avec plaisir ! Une nouvelle photo en haut de l’accueil, bonne idée. Tu peux aussi la changer toi-même : « Mon site », puis « Modifier mon site moi-même ».</p>
      <p data-mots="google,visibilité,visibilite,extra,traduction,anglais" data-type="onglet" data-onglet="extras" data-nom="Extras">Super question ! Une page de visibilité Google coûte ${euro(PRIX_PAGE)}, sans abonnement, réglée par carte. La traduction anglaise et les fonctionnalités spécifiques sont sur devis. Pépite t’attend dans « Extras » !</p>
      <p data-mots="combien,reste,limite,modification,comment,how,limit" data-type="onglet" data-onglet="demandes" data-nom="Modifications">Avec le forfait ${esc(ABO.name)}, tes modifications sont incluses. Tu écris ce que tu veux changer, ${esc(C.BRICOU)} clarifie ta demande avec toi, puis Alex fait la modification. Une demande à la fois.</p>
      <p data-mots="boutique,vendre,panier,article,catégorie,categorie,shop,sell" data-type="onglet" data-onglet="vacances" data-nom="Ma boutique">Ta boutique est déjà là ! Dans « Ma boutique », tu ajoutes tes articles toi-même : une photo, un nom, un prix, et c’est en ligne.</p>
      <p data-defaut>Coucou ! Dans ton vrai espace, je réponds à tes questions et je te guide. Essaie par exemple : changer mes horaires.</p>
    </div>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user">${mon('mascotte')}<div><strong>${DEMO.nom}</strong><small>${DEMO.domaine}</small></div></div>
        <p class="app-badge">${icon('wrench')}<span>Modifications incluses</span></p>
        <div class="app-tabs" role="tablist" aria-label="Mon espace">
          ${tabM('accueil', 'mascotte', 'Accueil', true)}${tabM('site', 'bricou', 'Mon site')}
          ${SITE_TABS.map(([id, ic, l]) => tabS(id, ic, l)).join('')}
          ${tabM('compte', 'clin', 'Mon compte')}
        </div>
        <button type="button" class="app-logout"${demoToast('Dans la démo, vous restez connecté')}>${icon('log-out')}<span>Me déconnecter</span></button>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h mm-bonjour">Bonjour ${DEMO.prenom} <span aria-hidden="true">👋</span></h2>
          <p class="app-p acc-intro">Voici ce que la bande a fait pour vous ces derniers jours.</p>
          ${demoAide('accueil', 1)}
          <div class="mm-cartes">
            <article class="mm-carte c-${SITES_A.color || 'mint'}"><div class="mm-carte-tete"><span class="mm-carte-art" aria-hidden="true">${mon(SITES_A.monstre || 'bricou')}</span><div><strong>Mon site</strong><small>En ligne · ${DEMO.domaine}</small></div></div><button type="button" class="btn btn-light btn-sm" data-go="demandes">${icon('pencil')}<span>Demander une modification</span></button></article>
            <article class="mm-carte c-${ECOLE_A.color || 'lilac'}"><div class="mm-carte-tete"><span class="mm-carte-art" aria-hidden="true">${mon(ECOLE_A.monstre || 'mochi')}</span><div><strong>${esc(ECOLE_A.label)}</strong><small>Toutes les réponses à vos questions, pas à pas</small></div></div><a class="btn btn-light btn-sm" href="${ECOLE_A.path}" target="_blank" rel="noopener">${icon('book-open')}<span>Voir les tutos</span></a></article>
          </div>
          <section class="mm-bloc mm-fil" aria-labelledby="mm-fil-t"><h3 class="mm-bloc-t" id="mm-fil-t">Le fil de la bande</h3><ul class="mm-fil-l">${FIL.slice(0, 3).map(([m, t, q]) => `<li><span class="mm-fil-art" aria-hidden="true">${mon(m)}</span><p>${esc(t)}</p><time>${esc(q)}</time></li>`).join('')}</ul></section>
        </div>

        <div class="app-panel" role="tabpanel" id="t-site" aria-labelledby="tab-site" hidden>
          <h2 class="app-h">Mon site</h2>
          ${siteNav('')}${demoAide('site', 1)}
          ${smNav([['monsite', 'globe', 'Mon site'], ['pages', 'list-checks', 'Mes pages'], ['dernieres', 'clock', 'Mes demandes']], 'Rubriques de Mon site')}
          <div class="sm-part" data-sm-part="monsite">
          <div class="app-cards">
            <button type="button" class="app-card c-mint" data-go="commande"><span class="app-card-ico">${icon('globe')}</span><span><small>Votre site</small><strong>${DEMO.domaine}</strong><span class="dot-ok">En ligne · ${articles.length} articles</span></span></button>
            <button type="button" class="app-card c-${ABO.color || 'mint'}" data-go="forfait"><span class="app-card-art">${mon('clin')}</span><span><small>Votre forfait</small><strong>${esc(ABO.name)}</strong><span>${euro(mensuel)} par mois · tout compris</span></span></button>
          </div>
          <p class="mm-site-lien"><button type="button" class="btn btn-light btn-sm"${demoToast(`Votre site ${DEMO.domaine} s’ouvre dans un nouvel onglet`)}>${icon('eye')}<span>Voir mon site</span></button></p>
          <div class="acc-actions">
            <div class="ed-form"><button type="button" class="acc-action c-mint" data-ed-ouvrir><span class="acc-art" aria-hidden="true">${mon('ravie')}</span><strong>Modifier mon site moi-même</strong><small>Je clique sur un texte ou une photo, je le change : c’est en ligne tout de suite</small></button></div>
            <button type="button" class="acc-action c-sky" data-go="demandes"><span class="acc-art" aria-hidden="true">${mon('bricou')}</span><strong>Demander une modification</strong><small>${esc(C.BRICOU)} prépare, Alex modifie</small></button>
            <button type="button" class="acc-action c-butter" data-go="extras"><span class="acc-art" aria-hidden="true">${mon('etoile')}</span><strong>Ajouter un extra</strong><small>${esc(C.PEPITE)} vous montre les petits plus</small></button>
            <button type="button" class="acc-action c-pink" data-go="vacances"><span class="acc-art" aria-hidden="true">${mon('mochi')}</span><strong>Ma boutique</strong><small>Articles, prix et commandes</small></button>
          </div>
          <details class="demo-ed" data-demo-ed>
            <summary class="demo-ed-btn"><span class="demo-ed-ico" aria-hidden="true">${icon('pencil')}</span><span><strong>Votre site en mode modification</strong><small>Touchez un texte ou la photo pour le changer : c’est en ligne tout de suite</small></span>${icon('chevron-down')}</summary>
            <div class="demo-ed-site" data-ed-site>
              <div class="demo-ed-nav"><b>${DEMO.nom}</b><span>Accueil</span><span>Nos gâteaux</span><span>Contact</span></div>
              <div class="demo-ed-hero">
                <div>
                  <p class="demo-ed-k" data-ed-texte>Pâtisserie artisanale</p>
                  <h3 data-ed-texte>Des gâteaux faits maison, chaque matin</h3>
                  <p data-ed-texte>Tartes, éclairs et macarons préparés dans notre atelier, avec des fruits de saison.</p>
                </div>
                <button type="button" class="demo-ed-photo" data-ed-photo aria-label="Changer la photo">${C.petit('mochi', { humeur: 'ravi' })}</button>
              </div>
              <div class="demo-ed-barre"><p>Mode modification : touchez un texte ou la photo pour le changer.</p><button type="button" data-ed-annuler hidden>Annuler la dernière</button><button type="button" class="is-fin" data-ed-fin>Terminer</button></div>
            </div>
          </details>
          </div>
          <div class="sm-part" data-sm-part="pages" hidden>
          <p class="app-p">Toutes les pages de votre site, dont vos pages de visibilité Google. Touchez « Voir » pour l’ouvrir, « Modifier » pour la changer.</p>
          <ul class="reqs">${[['Accueil', 'Page d’accueil'], ['Nos gâteaux', 'Mise en ligne le 3 novembre'], ['Gâteau d’anniversaire à Rethel', 'Page Google, mise en ligne lundi'], ['Commander un gâteau', 'Mise en ligne le 3 novembre'], ['Horaires et accès', 'Mise en ligne le 3 novembre'], ['Contact', 'Mise en ligne le 3 novembre']].map(([t, d]) => `<li><span><strong>${t}</strong><small>${d}</small></span><span class="demo-pg-act"><button type="button" class="link-btn"${demoToast(`La page « ${t} » s’ouvre`)}>Voir</button> · <button type="button" class="link-btn"${demoToast('Le mode modification s’ouvre sur cette page')}>Modifier</button></span></li>`).join('')}</ul>
          </div>
          <div class="sm-part" data-sm-part="dernieres" hidden>
          <ul class="reqs">
            <li><span><strong>Horaires d’été</strong><small>envoyée le 10 novembre</small></span><em class="st st-done">Faite</em></li>
            <li><span><strong>Nouvelle photo de l’accueil</strong><small>envoyée le 3 novembre</small></span><em class="st st-done">Faite</em></li>
          </ul>
          </div>
        </div>

        <div class="app-panel" role="tabpanel" id="t-stats" aria-labelledby="tab-stats" hidden>
          <h2 class="app-h">Mes statistiques</h2>
          ${siteNav('stats')}${demoStats()}
        </div>

        <div class="app-panel" role="tabpanel" id="t-commande" aria-labelledby="tab-commande" hidden>
          <h2 class="app-h">Ma commande</h2>
          ${siteNav('commande')}${demoAide('commande')}
          <div class="esp-order">
            <p class="esp-order-head"><span>Référence <b>${DEMO.ref}</b></span><em class="st st-done">En ligne</em></p>
            <div class="esp-etat"><ol class="esp-timeline">${FRISE.map(([l, q]) => `<li class="is-done"><span class="esp-tl-ico">${icon('check')}</span><span class="esp-tl-txt">${l}${q ? `<small>${q}</small>` : ''}</span></li>`).join('')}</ol></div>
            <p class="esp-empty">Votre site est en ligne. Pour le faire évoluer, envoyez vos demandes depuis « Mes modifications ».</p>
          </div>
          <section class="bf" id="questionnaire">
            <div class="bf-head"><span class="bf-ico">${icon('circle-check')}</span><div><h3>Votre questionnaire de création</h3><p>Reçu le 3 novembre. Vous pouvez encore relire vos réponses.</p></div><em class="st st-done">Reçu</em></div>
            <button type="button" class="btn btn-light btn-sm"${demoToast('Vos réponses s’ouvrent ici : votre activité, vos couleurs, vos photos, vos produits')}>${icon('list-checks')}<span>Voir ou modifier mes réponses</span></button>
          </section>
          <p class="app-sub">Votre site</p>
          <dl class="esp-grid">
            <div><dt>Type de site</dt><dd>${esc(ESS.name)}, option ${esc(ECO.name.toLowerCase())}<small>${euro(BOU.price)} de création</small></dd></div>
            <div><dt>Nom de domaine</dt><dd>${DEMO.domaine}<small>Réservé à votre nom</small></dd></div>
            <div><dt>Abonnement</dt><dd>${euro(mensuel)} par mois<small>Nom de domaine, hébergement, suivi, modifications incluses</small></dd></div>
            <div><dt>Options</dt><dd>Option ${esc(ECO.name.toLowerCase())}</dd></div>
          </dl>
          <p class="app-sub">Paiement</p>
          <ul class="esp-amounts">
            <li><span>Création du site, à la commande</span><b>${euro(BOU.price)}</b><small>payé, merci !</small></li>
            <li><span>Abonnement</span><b>${euro(mensuel)} par mois</b><small>en cours</small></li>
          </ul>
        </div>

        <div class="app-panel" role="tabpanel" id="t-demandes" aria-labelledby="tab-demandes" hidden>
          <h2 class="app-h">Mes modifications</h2>
          ${siteNav('demandes')}${demoAide('demandes')}
          ${smNav([['nouvelle', 'send', 'Nouvelle demande'], ['moi', 'pencil', 'Moi-même'], ['historique', 'list-checks', 'Historique']], 'Rubriques de Mes modifications')}
          <div class="sm-part" data-sm-part="moi" hidden>
          <div class="ed-rappel demo-rappel"><p>${icon('sparkles')}<span><b>Un texte ou une photo à changer ?</b> Faites-le vous-même, en direct sur votre site : c’est en ligne tout de suite, et vous pouvez annuler.</span></p><button type="button" class="btn btn-primary btn-sm" data-ed-ouvrir>${icon('pencil')}<span>Modifier mon site moi-même</span></button></div>
          </div>
          <div class="sm-part" data-sm-part="nouvelle">
          <div class="demo-bricou"><span aria-hidden="true">${C.petit('bricou', { humeur: 'ravi' })}</span><p><strong>Une modification plus compliquée, ou pas envie de la faire vous-même ?</strong><small>Moi, c’est ${esc(C.BRICOU)} : écrivez-la-moi ici, je m’en occupe. Vous suivez où ça en est juste en dessous.</small></p></div>
          ${C.processusModif({ titre: false })}
          <form class="req-form" data-req>
            <div class="field"><label for="req-txt">Votre demande</label><textarea id="req-txt" rows="3" placeholder="Ex. : nous serons fermés le lundi 24 novembre"></textarea></div>
            <label class="req-photo"><input type="file" accept="image/*" class="sr-only" data-req-file>${icon('image-plus')}<span data-req-file-name>Ajouter jusqu’à 3 photos (facultatif)</span></label>
            <button class="btn btn-primary" type="submit">${icon('send')}<span>Envoyer ma demande</span></button>
          </form>
          </div>
          <div class="sm-part" data-sm-part="historique" hidden>
          <p class="app-sub">De la plus récente à la plus ancienne</p>
          <ul class="reqs" data-reqs>
            <li><span><strong>Horaires d’été</strong><small>envoyée le 10 novembre</small></span><em class="st st-done">Faite</em></li>
            <li><span><strong>Nouvelle photo de l’accueil</strong><small>envoyée le 3 novembre</small></span><em class="st st-done">Faite</em></li>
          </ul>
          </div>
        </div>

        <div class="app-panel" role="tabpanel" id="t-extras" aria-labelledby="tab-extras" hidden>
          <h2 class="app-h">Les extras</h2>
          ${siteNav('extras')}${demoAide('extras')}
          <section class="ex-hero"><span class="ex-hero-art" aria-hidden="true">${mon('etoile')}</span><div class="ex-hero-txt"><h3>Un petit plus ? ${esc(C.PEPITE)} s’en occupe</h3><p>La page se paie par carte. Le reste est sur devis, gratuit.</p></div><ul class="ex-garanties"><li>${icon('circle-check')}<span>Paiement sécurisé par carte</span></li><li>${icon('wrench')}<span>Suivi par ${esc(C.PEPITE)}</span></li></ul></section>
          <div class="ex-grille ex-grille-une">${cartesExtras.join('')}</div>
        </div>

        <div class="app-panel" role="tabpanel" id="t-vacances" aria-labelledby="tab-vacances" hidden>
          <h2 class="app-h">Ma boutique</h2>
          ${siteNav('vacances')}${demoAide('vacances')}
          <div class="bq">
            ${BQ.map(([id], i) => `<input type="radio" name="bq" id="bq-${id}" class="bq-r"${i === 0 ? ' checked' : ''}>`).join('')}
            <div class="bq-menu" role="group" aria-label="Les rubriques de Ma boutique">${BQ.map(([id, ic, nom]) => `<label for="bq-${id}">${icon(ic)}<span>${nom}</span></label>`).join('')}</div>
            <div class="bq-panel" data-bq="articles">
              <p class="art-ajout"><button type="button" class="btn btn-primary btn-sm"${demoToast('Nouvel article : une photo, un nom, une description, un prix')}>${icon('plus')}<span>Ajouter un article</span></button></p>
              <div class="art-cartes">${articles.map(articleCarte).join('')}</div>
              <p class="app-note">Pour chaque article : une photo, un nom, une description, un prix. Autant d’articles que vous voulez.</p>
            </div>
            <div class="bq-panel" data-bq="prix">
              <p class="app-note">Tous vos prix sur une seule page : changez-les, lancez une promo, mettez un article en pause. Un seul bouton pour tout enregistrer.</p>
              <div class="demo-prix">${[['Tarte aux fraises', '24', '', true, true], ['6 éclairs au chocolat', '19,20', '16,90', true, true], ['Boîte de 12 macarons', '18', '', true, false]].map(([nom, p, promo, vente, stock]) => `<div class="demo-prix-l"><strong>${nom}</strong><label><span>Prix (€)</span><input type="text" inputmode="decimal" value="${p}" aria-label="Prix de ${nom}"></label><label><span>Promo (€)</span><input type="text" inputmode="decimal" value="${promo}" placeholder="aucune" aria-label="Promo de ${nom}"></label><label class="check"><input type="checkbox"${vente ? ' checked' : ''}><span>En vente</span></label><label class="check"><input type="checkbox"${stock ? ' checked' : ''}><span>En stock</span></label></div>`).join('')}</div>
              <button type="button" class="btn btn-primary"${demoToast('Vos prix sont à jour sur votre site')}>${icon('check')}<span>Enregistrer mes prix</span></button>
            </div>
            <div class="bq-panel" data-bq="paiements">
              <ul class="reqs">
                <li><span><strong>Stripe (carte bancaire)</strong><small>paiement en ligne sécurisé</small></span><em class="st st-done">Actif</em></li>
                <li><span><strong>PayPal</strong><small>s’installe en un clic</small></span><em class="st st-new">Pas installé</em></li>
                <li><span><strong>Virement</strong><small>votre client reçoit vos coordonnées bancaires</small></span><em class="st st-done">Actif</em></li>
              </ul>
            </div>
            <div class="bq-panel" data-bq="livraison">
              <ul class="reqs">
                <li><span><strong>Retrait sur place</strong><small>gratuit : votre client vient chercher sa commande</small></span><em class="st st-done">Actif</em></li>
                <li><span><strong>Livraison à prix fixe</strong><small>5,90 € par commande</small></span><em class="st st-done">Actif</em></li>
              </ul>
            </div>
            <div class="bq-panel" data-bq="commandes">
              <ul class="reqs demo-commandes">
                <li><span><strong>Commande n° 1042</strong><small>Gâteau d’anniversaire, 8 parts · 32 €</small></span><em class="st st-new">Payée</em><span class="demo-cmd-btns"><button type="button" class="btn btn-light btn-sm"${demoToast('Commande n° 1042 : en préparation')}>${icon('clock')}<span>Je la prépare</span></button><button type="button" class="btn btn-primary btn-sm"${demoToast('Commande n° 1042 : remise, votre client est prévenu par e-mail')}>${icon('check')}<span>Expédiée ou remise</span></button></span></li>
                <li><span><strong>Commande n° 1041</strong><small>6 éclairs au chocolat · 19,20 €</small></span><em class="st st-done">Expédiée ou remise</em></li>
              </ul>
            </div>
            <div class="bq-panel" data-bq="promos">
              <ul class="reqs">
                <li><span><strong>Code BIENVENUE10</strong><small>10 % sur la première commande</small></span><em class="st st-done">Actif</em></li>
                <li><span><strong>Bandeau d’annonce</strong><small>« Livraison offerte ce week-end »</small></span><em class="st st-new">Éteint</em></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="app-panel" role="tabpanel" id="t-compte" aria-labelledby="tab-compte" hidden>
          <h2 class="app-h">Mon compte</h2>
          ${demoAide('compte')}
          ${smNav([['infos', 'circle-user', 'Mes infos'], ['forfait', 'credit-card', 'Mon forfait'], ['factures', 'receipt', 'Factures'], ['domaine', 'globe', 'Nom de domaine']], 'Rubriques de Mon compte')}
          <div class="sm-part" data-sm-part="infos">
          <p class="app-p">Vos informations, votre adresse e-mail et votre mot de passe. Vous changez tout vous-même, quand vous voulez.</p>
          <div class="esp-form-bloc">
            <p class="app-sub">${icon('circle-user')} Mes informations</p>
            <div class="esp-grid2"><div class="field"><label for="demo-prenom">Prénom</label><input id="demo-prenom" type="text" value="${DEMO.prenom}"></div><div class="field"><label for="demo-ent">Entreprise (facultatif)</label><input id="demo-ent" type="text" value="${DEMO.nom}"></div></div>
            <button type="button" class="btn btn-primary btn-sm"${demoToast('C’est enregistré')}>${icon('check')}<span>Enregistrer</span></button>
          </div>
          <div class="esp-form-bloc">
            <p class="app-sub">${icon('sparkles')} L’apparence de mon site</p>
            <p class="app-note">Votre site existe en version claire et en version sombre. Il s’ouvre en clair ; vos visiteurs passent en sombre avec le petit soleil ou la lune.</p>
            <div class="demo-apparence">${[['Clair', 'Conseillé : fond clair à l’ouverture', true], ['Sombre', 'Fond sombre à l’ouverture', false], ['Automatique', 'Selon le réglage du téléphone de chaque visiteur', false]].map(([t, d, on]) => `<label class="esp-reste"><input type="radio" name="demo-apparence"${on ? ' checked' : ''}><span><strong>${t}</strong><small>${d}</small></span></label>`).join('')}</div>
            <button type="button" class="btn btn-primary btn-sm"${demoToast('C’est enregistré : votre site s’ouvre comme vous l’avez choisi')}>${icon('check')}<span>Enregistrer</span></button>
          </div>
          <div class="esp-form-bloc">
            <p class="app-sub">${icon('lock')} Mon mot de passe</p>
            <p class="app-note">Vous le changez ici, avec votre mot de passe actuel. Oublié ? « Mot de passe oublié » sur la page de connexion.</p>
          </div>
          </div>
          <section class="compte-forfait sm-part" id="forfait-bloc" data-sm-part="forfait" hidden>
            <h2 class="app-h">Mon forfait</h2>
            <div class="app-card c-${ABO.color || 'mint'}"><span class="app-card-art">${mon('ravie')}</span><span><small>Votre forfait ${esc(ABO.name)}</small><strong>Hébergement, sécurité, modifications</strong><span>${euro(ABO.month)} par mois · modifications incluses</span></span></div>
            <p class="app-sub">Le détail</p>
            <p class="app-domain">${icon('check')}<span><strong>Forfait ${esc(ABO.name)}</strong><small>${euro(ABO.month)} par mois</small></span></p>
            ${C.DOM ? `<p class="app-domain">${icon('globe')}<span><strong>Option nom de domaine</strong><small>${euro(C.DOM)} par mois</small></span></p>` : ''}
            <p class="app-total"><span>Total chaque mois</span><b>${euro(mensuel)}</b></p>
            <div class="esp-actions">
              <button type="button" class="btn btn-primary"${demoToast('La page sécurisée de paiement s’ouvre : carte, factures')}>${icon('credit-card')}<span>Gérer mon paiement et mes factures</span></button>
              <button type="button" class="btn btn-light"${demoToast(`Sans engagement : votre forfait s’arrête à la fin du mois payé. Vous pouvez aussi passer au forfait ${AUTO.name}`)}><span>Résilier mon forfait</span></button>
            </div>
          </section>
          <div class="sm-part" data-sm-part="factures" hidden>
            <ul class="invoices">
              <li><span>Novembre 2026</span><button type="button" class="link-btn"${demoToast('Facture téléchargée')}>PDF</button></li>
              <li><span>Octobre 2026</span><button type="button" class="link-btn"${demoToast('Facture téléchargée')}>PDF</button></li>
            </ul>
          </div>
          <div class="sm-part" data-sm-part="domaine" hidden>
            <p class="app-domain">${icon('globe')}<span><strong>${DEMO.domaine}</strong><small>À votre nom, renouvelé avec votre forfait</small></span></p>
          </div>
        </div>

      </div>
    </div>
    <p class="app-toast" data-toast role="status" hidden></p>
    <p class="app-note demo-fictif">Exemple inventé, pour la démo : rien n’est envoyé, rien n’est payé.</p>
  </div>
</div></section>

${C.ctaBand({ title: 'Ça vous plaît ?', text: 'Créez votre site : en ligne en 24 à 48 heures, puis vous le modifiez à volonté, vous-même ou avec nous.' })}`;
  return {
    path: '/mon-espace/demo/',
    section: 'monespace',
    noindex: true,
    noMobileBar: true,
    css: ['espace.css'],
    title: 'Mon espace, la démo | Les Minis Monstres',
    description: 'Essayez l’espace client des Minis Monstres : modifier son site soi-même, demander une modification, gérer sa boutique et ses prix. Une démonstration sans compte.',
    crumbs: DEMO_CRUMBS,
    body,
  };
}

// ====================================================================== MON ESPACE (connexion)
// Sous WordPress, le bloc [data-aled-espace] devient le vrai espace client (extension « Les Minis Monstres Espace client ») :
// formulaire de connexion si on n'est pas connecté, tableau de bord sinon.
function espacePage() {
  const crumbs = [HOME, { name: 'Mon espace', path: '/mon-espace/' }];
  const body = `${C.pageHero({
    section: 'monespace',
    h1: 'Mon espace client',
    crumbs,
  })}
<section class="section section-app" data-aled-espace><div class="container">
  <div class="login-wrap">
    <div class="form-card login-card">
      <h2 class="h3">${icon('circle-user')}Connexion</h2>
      <p class="form-alert" data-login-error hidden>Identifiant ou mot de passe incorrect. Réessayez, ou demandez un nouveau mot de passe.</p>
      <form class="form" method="post" action="/mon-espace/">
        <input type="hidden" name="aled08_login" value="1">
        <input type="hidden" name="redirect_to" value="/mon-espace/">
        <div class="field"><label for="l-user">E-mail ou identifiant</label><input id="l-user" name="log" type="text" autocomplete="username" required></div>
        <div class="field"><label for="l-pass">Mot de passe</label><input id="l-pass" name="pwd" type="password" autocomplete="current-password" required></div>
        <label class="check"><input type="checkbox" name="rememberme" value="forever"><span>Rester connecté sur cet appareil</span></label>
        <button class="btn btn-primary btn-lg btn-block" type="submit">${icon('arrow-right')}<span>Me connecter</span></button>
      </form>
      <p class="login-links"><a href="/wp-login.php?action=lostpassword">Mot de passe oublié ?</a></p>
    </div>
    <aside class="login-side">
      <span class="login-art">${monster('mascotte')}</span>
      <h2 class="h3" id="inscription">Pas encore de compte ?</h2>
      <p>Créez-le en une minute, sans rien commander. Vous recevez un e-mail pour choisir votre mot de passe.</p>
      <p class="form-alert" data-signup-msg hidden></p>
      <form class="form signup-form" method="post" action="/mon-espace/">
        <input type="hidden" name="aled08e_inscription" value="1">
        <div class="hp" aria-hidden="true"><label for="s-web">Ne pas remplir</label><input id="s-web" name="site_web" type="text" tabindex="-1" autocomplete="off"></div>
        <div class="field"><label for="s-prenom">Prénom</label><input id="s-prenom" name="prenom" type="text" autocomplete="given-name" required maxlength="60"></div>
        <div class="field"><label for="s-nom">Nom</label><input id="s-nom" name="nom" type="text" autocomplete="family-name" maxlength="60"></div>
        <div class="field"><label for="s-email">E-mail</label><input id="s-email" name="email" type="email" autocomplete="email" required></div>
        <button class="btn btn-primary btn-block" type="submit">${icon('circle-user')}<span>Créer mon compte</span></button>
        <p class="form-note">Gratuit et sans engagement. Votre adresse sert seulement à votre compte (<a href="/politique-de-confidentialite/">confidentialité</a>).</p>
      </form>
      <div class="login-ctas">${C.btn(site.espaceClient.demo, 'btn-light', 'circle-user', 'Essayer la démo')}${C.btnCreer('btn-light')}</div>
    </aside>
  </div>
</div></section>`;
  return {
    path: '/mon-espace/',
    section: 'monespace',
    noindex: true,
    noMobileBar: true,
    title: 'Mon espace client | Les Minis Monstres',
    description: 'Connectez-vous à votre espace client des Minis Monstres : demandes de modification, extras, votre boutique, votre compte et vos factures.',
    crumbs,
    body,
  };
}

// ====================================================================== CONTACT
function contactPage() {
  const crumbs = crumb('contact');
  const opt = (v) => `<option value="${esc(v)}">${esc(v)}</option>`;
  const body = `${C.pageHero({
    section: 'contact',
    h1: 'Contact : une question, un projet ?',
    lead: 'Envie d’être enfin visible sur internet, ou juste une question ? Écrivez-nous : on vous répond vite, en général dans la journée.',
    crumbs,
  })}
<section class="section"><div class="container contact-grid">
  <div class="form-card" id="devis">
    <h2 class="h3">Votre message</h2>
    <form class="form" method="post" action="${site.formAction}" data-form novalidate>
      ${formHidden()}
      <p class="form-alert" data-form-error hidden>L’envoi n’a pas abouti. Vérifiez les champs marqués d’une étoile, puis réessayez.</p>
      <div class="form-row">
        <div class="field"><label for="c-nom">Votre nom <span class="req">*</span></label><input id="c-nom" name="nom" type="text" autocomplete="name" required></div>
        <div class="field"><label for="c-email">Votre e-mail <span class="req">*</span></label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="c-tel">Téléphone <span class="opt">(facultatif)</span></label><input id="c-tel" name="telephone" type="tel" autocomplete="tel"></div>
      </div>
      <fieldset class="field field-motif"><legend class="label">Votre demande <span class="req">*</span></legend>
        <div class="radio-group radio-cartes" data-motif>
          <label><input type="radio" name="motif" value="Site : un devis précis" required> Un site : j’ai un projet précis</label>
          <label><input type="radio" name="motif" value="Site : une information"> Un site : j’ai une question</label>
          <label><input type="radio" name="motif" value="Site : je ne sais pas encore"> Un site : je veux en parler</label>
          <label><input type="radio" name="motif" value="Contact simple"> Juste vous contacter</label>
        </div>
      </fieldset>
      <div data-site-only>
        <div class="form-row">
          <div class="field"><label for="c-type">Votre site <span class="req">*</span></label>
            <select id="c-type" name="type" required><option value="">Choisir…</option>${typesOfferts.map((t) => opt(t.label)).join('')}${opt('Je ne sais pas encore')}${opt('Autre projet')}</select></div>
          <div class="field"><label for="c-domaine">Nom de domaine <span class="opt">(facultatif)</span></label><input id="c-domaine" name="domaine" type="text" autocomplete="off" placeholder="mon-entreprise.fr"></div>
        </div>
      </div>
      <div class="field"><label for="c-message">Votre message <span class="req">*</span></label><textarea id="c-message" name="message" required minlength="10" placeholder="Votre activité, ce que vous attendez, un site que vous aimez…" data-ph-site="Votre activité, ce que vous attendez, un site que vous aimez…" data-ph-contact="Dites-nous tout : une question, une idée, un coup de main, ou simplement bonjour…"></textarea></div>
      <label class="check"><input type="checkbox" name="consentement" value="oui" required><span>J’accepte que mes informations servent à me répondre. <a href="/politique-de-confidentialite/">En savoir plus</a></span></label>
      <button class="btn btn-primary btn-lg" type="submit">${icon('send')}<span>Envoyer ma demande</span></button>
    </form>
  </div>
  <aside class="contact-side">
    ${site.email ? `<a class="contact-card" href="mailto:${site.email}">${icon('mail')}<div><strong>${site.email}</strong><span>Pour envoyer des documents.</span></div></a>` : ''}
    <a class="contact-card c-mint" href="/mon-espace/">${icon('circle-user')}<div><strong>Déjà client ?</strong><span>Vos demandes de modification se font depuis votre espace client.</span></div></a>
    <a class="contact-card c-pink" href="${sections.creer.path}">${icon('wand-sparkles')}<div><strong>Créer mon site</strong><span>Choisissez le site qui vous rendra visible. Le prix s’affiche tout de suite.</span></div></a>
    <a class="contact-card" href="${sections.forfaits.path}">${icon(sections.forfaits.icon)}<div><strong>Voir les tarifs</strong><span>Un site, dès ${euro(creation.prix)}. Puis ${euro(AUTO.month)} ou ${euro(ABO.month)} par mois, au choix.</span></div></a>
    <p class="contact-note">${icon('map-pin')}<span>Tout se fait en ligne et par téléphone : la commande, les échanges, le suivi. Pour des clients partout en France.</span></p>
  </aside>
</div></section>`;
  return {
    path: '/contact/',
    section: 'contact',
    noMobileBar: true,
    title: 'Contact : parlons de votre visibilité | Les Minis Monstres',
    description: 'Une question, l’envie d’être visible avec un site internet ou une boutique en ligne ? Écrivez-nous par le formulaire. On vous répond, en général dans la journée.',
    crumbs,
    body,
    priority: 0.8,
  };
}

// ====================================================================== MES TUTOS (l'atelier « ecole », adresse /mini-tuto/)
// 24 novembre 2026, soir : l'aide des Minis Monstres, en petits tutos GRATUITS (src/content/tutos/, format dans index.js).
// Le hub : la recherche, la jauge des étapes de la création, « À la une » (config.tutosOffre.aLaUne), les thèmes, puis les
// guides (/guides/<slug>/) en bas, « Pour aller plus loin ». Tout marche avec des listes vides comme pleines.
const TUTOS = C.TUTOS;
const HUB = TUTOS.HUB;
const ECOLE = ateliers.find((x) => x.id === 'ecole') || { label: 'Mes Tutos', path: HUB, monstre: 'mochi' };
const TUTO_PUBLIE = '2026-11-24'; // date des tutos sans date propre (champs facultatifs `date` et `modifie`)
const sansAccent = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const HUB_CRUMBS = [HOME, { name: ECOLE.label, path: HUB }];
const GUIDES_TITRE = 'Pour aller plus loin';
const ESPACE = sections.monespace.path;

// Une carte de tuto ou de guide : le monstre, le nom, le résumé, la durée. data-texte : ce que cherche la recherche (sans accents).
function tutoCarte(t, { titre = 'h3' } = {}) {
  const th = (t.type === 'tuto' && TUTOS.theme(t.groupe)) || { color: 'sky', titre: GUIDES_TITRE };
  return `<a class="tuto-carte c-${th.color || 'lilac'}" href="${t.path}" data-tuto data-texte="${esc(sansAccent(plain(`${t.nom} ${t.resume} ${th.titre || ''}`)))}">
      <span class="tuto-carte-art" aria-hidden="true">${C.imgMonstre(t.monstre, 56)}</span>
      <span class="tuto-carte-corps"><${titre} class="tuto-carte-nom">${inline(t.nom)}</${titre}><span class="tuto-carte-resume">${inline(t.resume)}</span>
      <span class="tuto-meta"><span>${icon('clock')}${t.duree} min</span>${t.type === 'guide' ? `<span>${icon('file-text')}Guide</span>` : ''}</span></span>
    </a>`;
}
// « À la une » : une grande carte en surbrillance
function uneCarte(t) {
  const th = TUTOS.theme(t.groupe) || { color: 'butter', titre: '' };
  return `<a class="une-carte c-${th.color || 'butter'}" href="${t.path}" data-tuto data-texte="${esc(sansAccent(plain(`${t.nom} ${t.resume} ${th.titre || ''}`)))}">
      <span class="une-carte-art" aria-hidden="true">${C.imgMonstre(t.monstre, 96)}</span>
      <span class="une-carte-badge">${icon('star')}À la une</span>
      <strong class="une-carte-nom">${inline(t.nom)}</strong>
      <span class="une-carte-resume">${inline(t.resume)}</span>
      <span class="une-carte-pied"><span>${icon('clock')}${t.duree} min</span><span class="une-carte-go">Lire le tuto${icon('arrow-right')}</span></span>
    </a>`;
}

// ---------------------------------------------------------------- le hub
function tutoHub() {
  const crumbs = HUB_CRUMBS;
  const themes = TUTOS.themes();
  const T = TUTOS.tutos, G = TUTOS.guides, UNE = TUTOS.aLaUne;
  const rien = !T.length;
  const body = `<section class="page-hero tuto-hub-hero c-lilac">
  <div class="container">
    ${C.breadcrumbs(crumbs)}
    <div class="tuto-hub-in">
      <span class="tuto-hub-art" aria-hidden="true">${C.imgMonstre(ECOLE.monstre || 'mochi', 96, { tot: true })}</span>
      <p class="tuto-sur">${icon('book-open')}<span>${esc(ECOLE.label)} · gratuits</span></p>
      <h1>Toutes vos questions, <mark>en petits tutos</mark></h1>
      <p class="lead">La commande, votre espace client, vos modifications, les extras : chaque réponse tient en quelques minutes de lecture.</p>
      ${T.length || G.length ? `<div class="tuto-recherche" data-tuto-recherche hidden>${icon('search')}<label class="sr-only" for="tuto-q">Chercher un tuto</label><input id="tuto-q" type="search" placeholder="Questionnaire, Google, boutique…" autocomplete="off" enterkeyhint="search"></div>` : ''}
    </div>
  </div>
</section>

<div class="tuto-liste" data-tuto-liste>
<section class="section tuto-etapes" id="etapes" data-masque-recherche><div class="container">
  <h2 class="section-title">Voici les étapes de la création de votre site</h2>
  <p class="section-sub frise-aide"><span class="aide-souris">Passez sur une étape</span><span class="aide-doigt">Touchez une étape</span> : un petit monstre vous explique ce qui s’y passe.</p>
  ${C.frise({ id: 'etape' })}
</div></section>

<p class="tuto-vide container" data-tuto-vide hidden>${C.imgMonstre('clin', 48)}<span>Aucun tuto ne parle de cela pour l’instant. Essayez un autre mot, ou <button type="button" class="link-btn" data-tuto-tout>voyez tous les tutos</button>.</span></p>
<p class="sr-only" aria-live="polite" data-tuto-compte></p>

${UNE.length ? `<section class="section tuto-une" id="a-la-une" data-theme="une" aria-labelledby="t-une"><div class="container">
  <h2 class="section-title" id="t-une">À la une</h2>
  <p class="section-sub">Les extras qui font grandir votre site. Ils se prennent depuis votre espace client, quand vous voulez.</p>
  <div class="une-cartes une-${UNE.length}">${UNE.map(uneCarte).join('')}</div>
</div></section>` : ''}

${themes.length ? `<section class="section tuto-themes"><div class="container">
  <nav class="tuto-filtres" aria-label="Les thèmes des tutos">${themes.map((g) => `<a class="tuto-filtre c-${g.color}" href="#${g.id}">${icon(g.icon)}<span>${esc(g.titre)}</span></a>`).join('')}</nav>
  ${themes.map((g) => `<section class="tuto-theme c-${g.color}" id="${g.id}" data-theme="${g.id}" aria-labelledby="t-${g.id}">
    <div class="tuto-theme-tete"><span class="tuto-theme-art" aria-hidden="true">${C.imgMonstre(g.monstre, 64)}</span><div><h2 class="tuto-theme-titre" id="t-${g.id}">${esc(g.titre)}</h2><p>${inline(g.texte)}</p></div></div>
    <div class="tuto-cartes">${TUTOS.duTheme(g.id).map((t) => tutoCarte(t)).join('')}</div>
  </section>`).join('\n  ')}
</div></section>` : ''}

${rien ? `<section class="section"><div class="container"><p class="tuto-bientot">${C.imgMonstre('mochi', 64)}<span><strong>Les premiers tutos arrivent très bientôt.</strong> En attendant, une question ? <a href="${C.contactUrl}">Écrivez-nous</a>, Alex vous répond.</span></p></div></section>` : ''}

${G.length ? `<section class="section tuto-plus" id="guides" data-theme="guides" aria-labelledby="t-guides"><div class="container">
  <h2 class="tuto-plus-titre" id="t-guides">${icon('map')}${GUIDES_TITRE}</h2>
  <p class="tuto-plus-sub">Des guides plus longs, pour bien choisir : le prix d’un site, le nom de domaine, la fiche Google, votre métier.</p>
  <div class="tuto-cartes tuto-cartes-plus">${G.map((t) => tutoCarte(t)).join('')}</div>
</div></section>` : ''}
</div>

${C.ctaBand({ title: 'Et si on le faisait pour vous ?', text: `Le ${esc(ESS.name)}, ${euro(ESS.price)} la création. Vous répondez au questionnaire, puis Alex crée votre site.` })}`;
  return {
    path: HUB,
    color: 'lilac',
    bodyClass: 'page-tuto-hub',
    title: `${ECOLE.label} : toutes vos questions en petits tutos | Les Minis Monstres`,
    description: 'Les tutos gratuits des Minis Monstres : les étapes de la création de votre site, votre espace client, vos modifications et les extras, expliqués simplement.',
    crumbs,
    body,
    schema: [...T, ...G].length ? [{ '@type': 'ItemList', name: ECOLE.label, itemListElement: [...T, ...G].map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: plain(t.nom), url: site.url + t.path })) }] : [],
    priority: 0.8,
    changefreq: 'weekly',
  };
}

// ---------------------------------------------------------------- le Markdown d'un tuto
// La partie « ## À faire… » (ou « ### À faire… ») est mise dans un encadré. Un paragraphe « > Bon à savoir… » devient un encadré.
function corpsTuto(src) {
  const rendu = (x) => md(x).replace(/<aside class="callout"><p>(Bon à savoir)\s*:?\s*(\S)?/g, (m, titre, c) => `<aside class="callout callout-savoir"><p><strong class="savoir-titre">${icon('lightbulb')}${titre}</strong>${c ? c.toUpperCase() : ''}`);
  const texte = String(src || '').trim();
  const m = /^(#{2,3}) (?:À|A) faire.*$/im.exec(texte);
  if (!m) return rendu(texte);
  const niveau = m[1].length;
  const reste = texte.slice(m.index);
  const suite = new RegExp(`\\n#{2,${niveau}} `).exec(reste.slice(niveau + 1));
  const fin = suite ? suite.index + niveau + 1 : reste.length;
  const bloc = rendu(reste.slice(0, fin)).replace(/^<(h[234])([^>]*)>/, (x, h, at) => `<${h} class="a-faire-titre"${at}>${icon('list-checks')}`);
  return `${rendu(texte.slice(0, m.index))}\n<div class="a-faire">${bloc}</div>\n${rendu(reste.slice(fin))}`;
}
// En bas d'un tuto : l'espace client (si le tuto en parle), l'extra à prendre (tutos d'extras), sinon un appel discret vers Mon Site.
function tutoAppel(t) {
  const extra = t.type === 'tuto' && t.groupe === 'extras';
  if (t.espace) {
    return `<aside class="inline-cta tuto-appel c-sky">
    <span class="tuto-appel-art" aria-hidden="true">${C.imgMonstre(extra ? 'etoile' : 'mascotte', 56)}</span>
    <p>${extra ? '<strong>Envie de l’ajouter à votre site ?</strong> Il se prend depuis votre espace client, en quelques clics.' : '<strong>À vous de jouer.</strong> Tout se passe dans votre espace client.'}</p>
    ${C.btn(`${ESPACE}#${encodeURIComponent(t.espace)}`, extra ? 'btn-light' : 'btn-primary', 'circle-user', extra ? 'Je le prends depuis mon espace' : 'Ouvrir mon espace client')}
  </aside>`;
  }
  const a = ateliers.find((x) => x.id === 'sites') || {};
  return `<aside class="inline-cta tuto-appel c-${a.color || 'mint'}">
    <span class="tuto-appel-art" aria-hidden="true">${C.imgMonstre(a.monstre || 'bricou', 56)}</span>
    <p><strong>Envie qu’on s’en occupe ?</strong> ${esc(a.label || 'Mon Site')} : votre site professionnel, ${euro(ESS.price)} la création.</p>
    ${C.btn(sections.creer.path, 'btn-light', 'arrow-right', 'Créer mon site')}
  </aside>`;
}
function lireEnsuite(slugs) {
  const liste = (slugs || []).map((s) => TUTOS.trouve(s)).filter(Boolean);
  if (!liste.length) return '';
  return `<nav class="related" aria-label="Tutos liés"><div class="container"><h2 class="section-title">À lire aussi</h2><div class="tuto-cartes tuto-cartes-voir">${liste.map((t) => tutoCarte(t, { titre: 'strong' })).join('')}</div><p class="center"><a class="link-more" href="${HUB}">Tous les tutos</a></p></div></nav>`;
}
function tutoHero(t, th, crumbs, faits) {
  return `<section class="page-hero tuto-hero c-${th.color}">
  <div class="container page-hero-in has-mascot">
    <div class="page-hero-text">
      ${C.breadcrumbs(crumbs)}
      <p class="where">${icon(th.icon)}<span>${esc(ECOLE.label)} · ${esc(th.titre)}</span></p>
      <h1>${inline(t.h1)}</h1>
      ${t.lead ? `<p class="lead">${inline(t.lead)}</p>` : ''}
      <!--commun--><ul class="tuto-faits">${faits}</ul><!--/commun-->
    </div>
    <div class="page-hero-art tuto-hero-art" aria-hidden="true">${C.imgMonstre(t.monstre, 170, { tot: true })}</div>
  </div>
</section>`;
}
const articleTuto = (t, date) => ({
  '@type': 'Article',
  '@id': site.url + t.path + '#article',
  headline: plain(t.h1),
  description: t.description,
  inLanguage: 'fr-FR',
  datePublished: date,
  dateModified: t.modifie || date,
  timeRequired: `PT${t.duree}M`,
  author: { '@id': site.url + '/#entreprise' },
  publisher: { '@id': site.url + '/#entreprise' },
  image: site.url + `/assets/img/mail/${t.monstre}.png`,
  mainEntityOfPage: { '@id': site.url + t.path + '#page' },
  isAccessibleForFree: true,
});

// ---------------------------------------------------------------- la page d'un tuto (/mini-tuto/<slug>/) ou d'un guide (/guides/<slug>/)
function tutoPage(t) {
  const guide = t.type === 'guide';
  const th = guide ? { id: 'guides', titre: GUIDES_TITRE, icon: 'map', color: 'sky' } : TUTOS.theme(t.groupe) || { id: '', titre: ECOLE.label, icon: 'book-open', color: 'lilac' };
  const crumbs = [...HUB_CRUMBS, ...(th.id ? [{ name: th.titre, path: `${HUB}#${th.id}` }] : []), { name: t.nom, path: t.path }];
  const f = C.faq(t.faq, 'Vos questions', guide ? 'faq-guide' : 'faq-tuto');
  const faits = `<li>${icon('clock')}<span>${t.duree} min de lecture</span></li><li>${icon(guide ? 'file-text' : 'gift')}<span>${guide ? 'Guide gratuit' : 'Gratuit'}</span></li>`;
  const { toc } = md(t.body, { withToc: true });
  const sommaire = guide && toc.length >= 3 ? `<details class="tuto-sommaire" data-ordi><summary>${icon('list-checks')}<span>Au sommaire</span>${icon('chevron-down')}</summary><ol>${toc.map((x, i) => `<li><a href="#${x.id}"><span class="ts-n">${i + 1}</span><span>${inline(x.title)}</span></a></li>`).join('')}</ol></details>` : '';
  const body = `${tutoHero(t, th, crumbs, faits)}
<section class="section tuto-section"><div class="container container-narrow">
  ${sommaire}
  <article class="prose tuto-prose">
    ${corpsTuto(t.body)}
  </article>
  ${tutoAppel(t)}
</div></section>
${f.html}
${lireEnsuite(t.voir)}`;
  return {
    path: t.path,
    color: th.color,
    bodyClass: `page-tuto${guide ? ' page-guide' : ''}`,
    title: t.title,
    description: t.description,
    crumbs,
    body,
    schema: [articleTuto(t, guide ? t.publie || TUTO_PUBLIE : t.date || TUTO_PUBLIE), f.schema],
    priority: 0.7,
  };
}

// ====================================================================== LEXIQUE
const lexCard = (t) => `<a class="guide-card reveal" href="/lexique/${t.slug}/"><span class="type-ico">${icon(t.icon)}</span><span class="guide-card-text"><strong>${inline(t.nom)}</strong><span>${inline(t.resume)}</span></span>${icon('arrow-right')}</a>`;

function lexiqueHub() {
  const crumbs = crumb('lexique');
  const tri = [...LEXIQUE.termes].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  const lettres = [...new Set(tri.map((t) => t.nom[0].toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')))];
  const body = `${C.pageHero({
    section: 'lexique',
    h1: 'Lexique : les mots d’internet expliqués simplement',
    lead: 'Nom de domaine, hébergement, référencement… Vous entendez ces mots sans savoir ce qu’ils veulent dire ? Chaque page explique un mot, avec un exemple concret.',
    crumbs,
  })}
<section class="section"><div class="container">
  <nav class="lex-lettres" aria-label="Aller à une lettre">${lettres.map((l) => `<a href="#lettre-${l}">${l}</a>`).join('')}</nav>
  ${lettres
    .map((l) => `<h2 class="lex-lettre" id="lettre-${l}">${l}</h2><div class="guide-cards">${tri.filter((t) => t.nom[0].toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '') === l).map(lexCard).join('')}</div>`)
    .join('\n')}
  <p class="center"><a class="link-more" href="${HUB}">Et nos tutos gratuits, dans ${esc(ECOLE.label)}</a></p>
</div></section>
${C.ctaBand({ title: 'Plus besoin de tout savoir', text: 'On peut s’occuper de la technique pour vous. Choisissez votre site en deux minutes, le prix s’affiche tout de suite.' })}`;
  return {
    path: '/lexique/',
    section: 'lexique',
    title: 'Lexique : les mots d’internet expliqués simplement | Les Minis Monstres',
    description: 'Nom de domaine, hébergement, référencement, cadenas de sécurité : les mots d’internet expliqués simplement, avec un exemple concret pour chacun. Sans jargon.',
    crumbs,
    body,
    schema: [{ '@type': 'DefinedTermSet', '@id': site.url + '/lexique/#lexique', name: 'Lexique d’internet', hasDefinedTerm: LEXIQUE.termes.map((t) => ({ '@type': 'DefinedTerm', name: t.nom, url: site.url + '/lexique/' + t.slug + '/' })) }],
    priority: 0.7,
  };
}

function lexiquePage(t) {
  const path = `/lexique/${t.slug}/`;
  const crumbs = [...crumb('lexique'), { name: t.nom, path }];
  const f = C.faq(t.faq, 'Vos questions', 'faq-lexique');
  const voir = t.voir.map((s) => LEXIQUE.termes.find((x) => x.slug === s)).filter(Boolean);
  const body = `${C.pageHero({ section: 'lexique', h1: t.h1, lead: t.lead, crumbs })}
<section class="section"><div class="container container-narrow prose reveal">
  ${md(t.body)}
</div></section>
${f.html}
<nav class="related" aria-label="À lire aussi"><div class="container"><h2 class="section-title">À lire aussi</h2><div class="guide-cards">${voir.map(lexCard).join('')}</div><p class="center"><a class="link-more" href="/lexique/">Tout le lexique</a></p></div></nav>
${C.ctaBand({ text: CTA_TEXTE })}`;
  return {
    path,
    section: 'lexique',
    title: t.title,
    description: t.description,
    crumbs,
    body,
    schema: [
      { '@type': 'DefinedTerm', '@id': site.url + path + '#terme', name: t.nom, description: t.description, inDefinedTermSet: site.url + '/lexique/#lexique' },
      { '@type': 'Article', '@id': site.url + path + '#article', headline: t.h1, description: t.description, inLanguage: 'fr-FR', datePublished: LEXIQUE.PUBLIE, dateModified: LEXIQUE.PUBLIE, author: { '@id': site.url + '/#entreprise' }, publisher: { '@id': site.url + '/#entreprise' }, image: site.url + '/assets/img/og-image.png', mainEntityOfPage: { '@id': site.url + path + '#page' } },
      f.schema,
    ],
    priority: 0.6,
  };
}

function confiancePage() {
  // V2 : « Réalisations ». Uniquement de vrais clients, avec un site en ligne. Pas d'avis inventé.
  const crumbs = crumb('confiance');
  const total = CLIENTS_EN_LIGNE.reduce((n, c) => n + pagesDe(c), 0);
  const le = CLIENTS_EN_LIGNE.map((c) => (CLIENTS_PAGES[c.domaine] || {}).le || '').sort().pop();
  const body = `${C.pageHero({
    section: 'confiance',
    h1: 'Nos réalisations',
    lead: 'Des sites en ligne, que vous pouvez visiter. Pas de faux avis ici : allez les voir par vous-même.',
    crumbs,
  })}
<section class="section"><div class="container">
  ${total ? `<p class="client-total reveal"><b>${total}</b><span>pages en ligne sur les sites de nos clients${le ? `, au ${frDate(le)}` : ''}.<br>Chaque page utile est une porte d’entrée de plus depuis Google.</span></p>` : ''}
  ${clientCards({ enCours: true })}
  <p class="small muted center">Les fiches produits ne comptent pas comme des pages. Les sites en ligne s’ouvrent dans un nouvel onglet.</p>
</div></section>
${METIERS.length ? `<section class="section section-soft"><div class="container">
  <h2 class="section-title">Et pour votre métier ?</h2>
  <p class="section-sub">Ce qu’un site doit montrer change d’un métier à l’autre. Voici ce qu’on prévoit pour le vôtre.</p>
  ${metierCards()}
</div></section>` : ''}
${C.ctaBand({ title: 'Le prochain site visible, c’est le vôtre ?', text: `Choisissez votre site en deux minutes. Les prix sont affichés, les mêmes pour tous : dès ${euro(creation.prix)}.` })}`;
  return {
    path: sections.confiance.path,
    section: 'confiance',
    title: 'Nos réalisations : des sites en ligne à visiter | Les Minis Monstres',
    description: `Les sites créés par les Minis Monstres, à visiter librement : ${CLIENTS_EN_LIGNE.map((c) => c.domaine).join(', ').replace(/, ([^,]*)$/, ' et $1')}. De vrais clients, de vrais sites, sans faux avis.`,
    crumbs,
    body,
    priority: 0.8,
  };
}

// ====================================================================== NOTRE ÉQUIPE
// Alex, et les Minis Monstres (config.bande) : un prénom et un métier chacun.
function equipePage() {
  const crumbs = crumb('equipe');
  const body = `${C.pageHero({
    section: 'equipe',
    h1: 'Notre équipe : Alex et les Minis Monstres',
    lead: `Alex conçoit votre site. Avec lui, ${NB_BANDE} petits monstres, chacun son métier. Leur but commun : vous rendre visible.`,
    crumbs,
  })}
<section class="section section-bande" id="bande"><div class="container">
  <div class="alex-bulle reveal"><span class="alex-art">${C.alexPortrait({ title: 'Alex' })}</span><p><strong>Moi, c’est Alex.</strong> Je conçois votre site pour qu’il vous rende visible, et je reste votre interlocuteur. Avec moi, les Minis Monstres : ${bande.map((b) => b.nom).join(', ').replace(/, ([^,]*)$/, ' et $1')}. Chaque page est vérifiée avant de partir en ligne.</p></div>
  ${C.bandeGrid({ complet: true })}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Comment on travaille</h2>
  <div class="feats feats-3">
    <div class="feat reveal">${icon('list-checks')}<h3>Une méthode rodée</h3><p>Un questionnaire précis pour vous connaître, puis Alex crée votre site avec vos réponses. Vous le modifiez ensuite comme vous voulez.</p></div>
    <div class="feat reveal">${icon('tag')}<h3>Des prix affichés</h3><p>Les mêmes pour tout le monde, sans devis. Vous savez ce que vous payez avant de commander.</p></div>
    <div class="feat reveal">${icon('message-circle')}<h3>Quelqu’un qui répond</h3><p>${esc(C.CERISE)} répond à vos questions, ${esc(C.BRICOU)} prépare vos demandes, et Alex fait vos modifications.</p></div>
  </div>
  <p class="center more">${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Une modification, du début à la fin</h2>
  ${C.processusModif({ titre: false })}
</div></section>
${C.ctaBand({ title: 'On s’occupe de votre visibilité ?', text: 'Choisissez votre site en deux minutes, le prix s’affiche tout de suite. Ou écrivez-nous pour en parler.' })}`;
  return {
    path: sections.equipe.path,
    section: 'equipe',
    title: 'Notre équipe : Alex et sa petite bande | Les Minis Monstres',
    description: `Alex conçoit chaque site. Avec lui, ${NB_BANDE} petits monstres, chacun son métier : ${bande.map((b) => b.nom).join(', ')}. Faites connaissance.`,
    crumbs,
    body,
    priority: 0.7,
  };
}

// ====================================================================== V2 : VOTRE MÉTIER
function metiersHub() {
  const crumbs = crumb('metiers');
  const body = `${C.pageHero({
    section: 'metiers',
    h1: 'Un site internet pensé pour votre métier',
    lead: 'Un artisan, une sophrologue, un gîte ou une association n’ont pas les mêmes clients. Choisissez votre activité : on vous montre ce que votre site doit faire pour être visible.',
    crumbs,
  })}
<section class="section"><div class="container">
  ${metierCards()}
  <p class="center muted">Votre métier n’est pas dans la liste ? Nos guides parlent aussi des <a href="/guides/site-internet-restaurant/">restaurants</a>, des <a href="/guides/site-internet-coiffeur-institut/">salons et instituts</a> et des <a href="/guides/site-internet-auto-entrepreneur/">auto-entrepreneurs</a>. Et vous pouvez <a href="${C.contactUrl}">nous écrire</a>.</p>
</div></section>
${C.ctaBand({ text: CTA_TEXTE })}`;
  return {
    path: sections.metiers.path,
    section: 'metiers',
    title: 'Site internet par métier : artisans, gîtes, thérapeutes | Les Minis Monstres',
    description: 'Artisans, thérapeutes, créateurs, gîtes et chambres d’hôtes, commerçants, associations : ce que votre site doit montrer pour rassurer vos clients et être trouvé.',
    crumbs,
    body,
    schema: [{ '@type': 'ItemList', itemListElement: METIERS.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.nom, url: site.url + '/' + m.slug + '/' })) }],
    priority: 0.8,
  };
}

// Le nom lisible d'une adresse interne (pour les liens « À lire aussi »)
function nomDe(path) {
  const m = METIERS.find((x) => '/' + x.slug + '/' === path);
  if (m) return [m.nom, m.resume, m.icon];
  const p = PAGES_V2.find((x) => x.path === path);
  if (p) return [p.nom, p.resume, p.icon];
  const g = [...C.TUTOS.tutos, ...C.TUTOS.guides].find((x) => x.path === path);
  if (g) return [g.nom, g.resume, g.icon || 'book-open'];
  const sec = Object.values(sections).find((x) => x.path === path);
  if (sec) return [sec.label, '', sec.icon];
  return null;
}
function voirCards(paths) {
  const cards = paths.map((p) => [p, nomDe(p)]).filter(([, n]) => n);
  if (!cards.length) return '';
  return `<nav class="related" aria-label="À lire aussi"><div class="container"><h2 class="section-title">À lire aussi</h2><div class="guide-cards">${cards
    .map(([p, [nom, resume, ic]]) => `<a class="guide-card reveal" href="${p}"><span class="type-ico">${icon(ic || 'arrow-right')}</span><span class="guide-card-text"><strong>${inline(nom)}</strong>${resume ? `<span>${inline(resume)}</span>` : ''}</span>${icon('arrow-right')}</a>`)
    .join('')}</div></div></nav>`;
}
// Schéma Article commun aux pages V2
const articleSchema = (path, h1, description, date) => ({
  '@type': 'Article',
  '@id': site.url + path + '#article',
  headline: h1,
  description,
  inLanguage: 'fr-FR',
  datePublished: date,
  dateModified: date,
  author: { '@id': site.url + '/#entreprise' },
  publisher: { '@id': site.url + '/#entreprise' },
  image: site.url + '/assets/img/og-image.png',
  mainEntityOfPage: { '@id': site.url + path + '#page' },
});

// Le petit monstre de chaque métier, dans le haut de sa page
const MONSTRE_METIER = { 'site-internet-artisan': 'dino', 'site-internet-therapeute': 'nuage', 'site-internet-createur-artiste': 'fantome', 'site-internet-gite-chambre-hotes': 'chaton', 'site-internet-commercant': 'mochi', 'site-internet-association': 'etoile' };
function metierPage(m) {
  const path = `/${m.slug}/`;
  const crumbs = [...crumb('metiers'), { name: m.nom, path }];
  const f = C.faq(m.faq, 'Vos questions', 'faq-metier');
  const ex = m.exemple && m.exemple.client ? clients.find((c) => c.domaine.startsWith(m.exemple.client)) : null;
  // Conseils d'une page métier : le site (une-page, ou boutique = l'option e-commerce), Mini (base) ou un extra (packseo…). Le reste
  // est ignoré, y compris l'ancien Site Visibilité (vitrine, retiré le 21 novembre 2026).
  const opts = (m.options || []).map((o) => {
    if (o.id === 'boutique') return { ic: BOU.icon, nom: `Option ${ECO.name}`, prix: `+ ${euro(ECO.prix)}, une fois`, pourquoi: o.pourquoi };
    const ty = typesOfferts.find((t) => t.id === o.id);
    if (ty) return { ic: ty.icon, nom: ty.name, prix: `${euro(ty.price)}, une fois`, pourquoi: o.pourquoi };
    const fo = forfaits.find((x) => x.id === o.id);
    if (fo) return { ic: 'repeat', nom: `Forfait ${fo.name}`, prix: `${euro(fo.month)} par mois, sans engagement`, pourquoi: o.pourquoi };
    const ext = C.EXTRAS_PAR_FAMILLE.flatMap((g) => g.items).find((x) => x.id === o.id);
    if (ext) return { ic: ext.icon, nom: ext.name, prix: C.prixExtra(ext), pourquoi: o.pourquoi };
    return null;
  }).filter(Boolean);
  const body = `${C.pageHero({ section: 'metiers', h1: m.h1, lead: m.lead, crumbs, mascot: MONSTRE_METIER[m.slug] })}
<section class="section"><div class="container">
  <div class="feats">${m.besoins.map((b) => `<div class="feat reveal">${icon(b.icon)}<h3>${inline(b.t)}</h3><p>${inline(b.d)}</p></div>`).join('')}</div>
</div></section>
<section class="section section-soft"><div class="container container-narrow prose reveal">
  ${md(m.body)}
</div></section>
${ex || opts.length ? `<section class="section"><div class="container">
  ${opts.length ? `<h2 class="section-title">Ce qu’on vous conseille</h2>
  <p class="section-sub">Rien n’est imposé. Voici ce qui sert le plus.</p>
  <div class="opt-group opt-conseil reveal"><ul>${opts.map((o) => `<li><span class="opt-ico">${icon(o.ic)}</span><span class="opt-txt"><strong>${esc(o.nom)}</strong><small>${inline(o.pourquoi)}</small></span><span class="opt-price">${o.prix}</span></li>`).join('')}</ul></div>` : ''}
  ${ex ? `<h2 class="section-title metier-ex-titre">Un exemple en ligne</h2>
  ${m.exemple.texte ? `<p class="section-sub">${inline(m.exemple.texte)}</p>` : ''}
  <div class="client-cards client-cards-solo"><a class="client-card c-${ex.color} reveal" href="${ex.url}" target="_blank" rel="noopener"><span class="type-ico">${icon(ex.icon)}</span><span class="client-genre">${esc(ex.genre)}</span><strong>${esc(ex.nom)}</strong><span class="client-url">${icon('globe')}${esc(ex.domaine)}${icon('arrow-right')}</span></a></div>` : ''}
</div></section>` : ''}
<section class="section section-soft" id="uniques"><div class="container">
  ${commun('<h2 class="section-title">Ce qui nous rend uniques</h2>')}
  ${C.avantagesNous({ court: true })}
</div></section>
${f.html}
${voirCards(m.voir || [])}
${C.ctaBand({ title: 'On vous rend visible ?', text: `Votre site, soigné et suivi : ${euro(creation.prix)} la création, à régler en commandant. Ou écrivez-nous pour en parler d’abord.` })}`;
  return {
    path,
    section: 'metiers',
    title: m.title,
    description: m.description,
    crumbs,
    body,
    schema: [articleSchema(path, m.h1, m.description, METIERS_PUBLIE), f.schema],
    priority: 0.8,
  };
}

// ====================================================================== V2 : RÉASSURANCE, GUIDES DE FOND, PAGE LOCALE
// La section (couleur, rubrique du fil d'Ariane) de chaque page V2 : celles qui ont leur rubrique dans config.js,
// sinon la rubrique « Guides » (guides de fond et page locale).
const SECTION_V2 = { '/pourquoi-moins-cher/': 'methode', '/pourquoi-les-minis-monstres/': 'liaalex', '/accompagnement/': 'accompagnement' };
function pageV2(p) {
  const k = SECTION_V2[p.path];
  const crumbs = k ? crumb(k) : [HOME, { name: p.nom, path: p.path }];
  const f = C.faq(p.faq || [], 'Vos questions', 'faq-v2');
  // Accompagnement : la démo de l'espace client vient tout de suite sous la présentation
  const demo = p.path === sections.accompagnement.path ? `<section class="section section-demo"><div class="container">${C.demoBande()}</div></section>` : '';
  const body = `${C.pageHero({ section: k || 'guides', h1: p.h1, lead: p.lead, crumbs })}
${demo}
${p.points && p.points.length ? `<section class="section"><div class="container">
  <div class="feats">${p.points.map((b) => `<div class="feat reveal">${icon(b.icon)}<h3>${inline(b.t)}</h3><p>${inline(b.d)}</p></div>`).join('')}</div>
</div></section>` : ''}
<section class="section${p.points && p.points.length ? ' section-soft' : ''}"><div class="container container-narrow prose reveal">
  ${md(p.body)}
</div></section>
${f.html}
${voirCards(p.voir || [])}
${C.ctaBand({ title: (p.cta && p.cta.titre) || 'On vous rend visible ?', text: (p.cta && p.cta.texte) || CTA_TEXTE })}`;
  return {
    path: p.path,
    section: k || 'guides',
    title: p.title,
    description: p.description,
    crumbs,
    body,
    schema: [articleSchema(p.path, p.h1, p.description, PAGES_V2_PUBLIE), f.schema],
    priority: 0.8,
  };
}

// Une question du questionnaire, décrite pour la page Documentation
function briefDetail(c) {
  const opts = (c.options || []).map((o) => `<i>${esc(o)}</i>`).join('');
  const si = c.si ? ` <small>(si « ${esc([].concat(c.si.vaut).join(' » ou « ').toLowerCase())} »)</small>` : '';
  const pre = c.prerempli ? ' <small>(prérempli)</small>' : '';
  switch (c.kind) {
    case 'choix': return `<span class="doc-opts">${opts}${c.autre ? '<i>Autre…</i>' : ''}</span>${si}`;
    case 'multi': return `<span class="doc-opts">${opts}${c.autre ? '<i>Autre…</i>' : ''}</span><small>plusieurs choix possibles</small>${si}`;
    case 'ouinon': return `<span class="doc-opts"><i>Oui</i><i>Non</i></span>${si}`;
    case 'images': return `<small>jusqu’à ${c.max} photos, chacune avec sa description</small>`;
    case 'fichier': return '<small>un fichier (image ou PDF)</small>';
    case 'liste': return `<small>un tableau : ${c.colonnes.map((x) => esc(x.label.toLowerCase())).join(', ')}</small>${si}`;
    default: return `${pre}${si}`;
  }
}

// Dimensions des captures de l'espace client (scripts/captures-espace.js écrit src/assets/img/doc/messages.webp)
const dimsDoc = (nom, defaut) => {
  try { const t = require('fs').readFileSync(require('path').join(__dirname, `../assets/img/doc/${nom}.json`), 'utf8'); return JSON.parse(t); } catch (e) { return defaut; }
};
const IMG_MSGS = dimsDoc('messages', [1600, 1700]);
// ====================================================================== DOCUMENTATION
function docPage() {
  const crumbs = crumb('documentation');
  const IMG = {
    espace: dimsDoc('espace', [1572, 2116]), demandes: dimsDoc('demandes', [1572, 1784]), chico: [1482, 1082], titan: [1482, 2697], messages: IMG_MSGS,
    boutique: [1482, 1823], vacances: [654, 650], 'site-dodedo': [1500, 938], 'site-flore': [1500, 938],
  };
  const fig = (k, alt, cap, cls = '') => `<figure class="doc-fig ${cls} reveal"><img src="/assets/img/doc/${k}.webp" width="${IMG[k][0]}" height="${IMG[k][1]}" alt="${esc(alt)}" loading="lazy" decoding="async"><figcaption>${cap}</figcaption></figure>`;
  // un chapitre : son titre (toujours visible) et son contenu, replié. Le premier est ouvert.
  const chap = (id, titre, html) => C.deroulant(titre, html, { id, ouvert: id === 'etapes', cls: 'doc-chap' });
  const toc_ = [
    ['etapes', 'list-checks', 'Comment ça se passe'],
    ['lia-alex', 'sparkles', 'Cerise et moi'],
    ['questionnaire', 'clipboard-check', 'Le questionnaire de création'],
    ['sites', 'layout-template', 'Votre site'],
    ['prix', sections.forfaits.icon, 'Le prix'],
    ['espace', 'circle-user', 'L’espace client'],
    ['demandes', 'message-circle', 'Demander une modification'],
    ['jetons', 'sparkles', 'La petite bande'],
    ['tableau', 'gauge', 'Mon site : vos chiffres'],
    ['messages', 'plus', 'Les extras'],
    ['boutique', 'shopping-bag', 'L’option e-commerce'],
    ['seo', 'search-check', 'Être trouvé sur Google'],
    ['paiement', 'credit-card', 'Paiement et fidélité'],
  ];
  const tabs = [
    ['house', 'Accueil', 'votre site, votre formule et les petits mots de la bande.'],
    ['package', 'Ma commande', 'le suivi de la création de votre site, étape par étape.'],
    ['pencil', 'Modifications', `vous changez vous-même un texte ou une photo ; pour le reste, vous l’écrivez à ${C.BRICOU}, il s’en occupe, et vous suivez où ça en est.`],
    ['sparkles', 'Extras', `les trois extras, présentés par ${C.PEPITE} : page de visibilité Google, traduction anglaise, fonctionnalité spécifique.`],
    ['shopping-bag', 'Ma boutique', `vos articles, vos prix, vos paiements, la livraison, vos commandes et vos promos. Il s’ouvre avec l’option ${ECO.name}.`],
    ['circle-user', 'Mon compte', 'vos coordonnées, votre mot de passe, votre formule et vos factures.'],
  ];
  const body = `${C.pageHero({
    section: 'documentation',
    h1: 'Documentation : tout comprendre, en images',
    lead: 'Comment on crée votre site, ce que vous payez et à quoi ressemble votre espace client. Touchez un chapitre pour l’ouvrir.',
    crumbs,
    mascot: 'pense',
  })}
<section class="section section-tight"><div class="container"><div class="faq deroulants doc-chapitres">
${chap('etapes', `1. Comment ça se passe`, `  <h2>De la commande à la mise en ligne</h2>
  <ol class="doc-steps">
    <li><strong>Vous commandez votre site.</strong> Le ${esc(ESS.name)}, avec l’option ${esc(ECO.name)} si vous vendez en ligne : le prix total s’affiche avant de commander.</li>
    <li><strong>Vous réglez votre site.</strong> En une fois, ou en ${C.lissageTxt} fois avec ${C.ORGANISMES}, sur la page de paiement. C’est le signal de départ.</li>
    <li><strong>Vous remplissez le questionnaire de création.</strong> Dans votre espace client : couleurs, ambiance, photos, prix ou produits.</li>
    <li><strong>Alex crée votre site.</strong> Dès votre questionnaire envoyé, avec vos réponses. Chaque page est vérifiée avant la mise en ligne.</li>
    <li><strong>Votre site prend forme.</strong> Vos textes, vos photos et vos couleurs, chacun à sa place. Votre première version est en ligne en ${esc(ESS.delai)}, et vous recevez un e-mail qui vous la présente.</li>
    <li><strong>Vous le peaufinez.</strong> Rien de plus à payer pour la création. Avec le forfait ${esc(ABO.name)}, qui démarre ce jour-là, vous changez vous-même un texte ou une photo, à volonté, ou vous nous demandez la modification dans « Mes modifications ».</li>
    <li><strong>Ensuite, vous choisissez.</strong> Le forfait ${esc(ABO.name)}, ${euro(ABO.month)} par mois : on s’occupe de tout. Ou le forfait ${esc(AUTO.name)}, ${euro(AUTO.month)} : vous gérez tout vous-même.</li>
  </ol>
  <p class="doc-more">${C.btnCreer('btn-primary')}</p>`)}

${chap('lia-alex', `2. Cerise et Alex`, `  <h2>Deux pour s’occuper de vos demandes</h2>
  <div class="doc-duo-qui">
    <div class="doc-qui c-pink reveal"><span class="doc-qui-art">${monster('coucou')}</span><h3>Cerise, la secrétaire de la bande</h3><p>Elle répond à vos questions et vous aide à formuler vos demandes. Elle vous les fait relire, puis les transmet.</p></div>
    <div class="doc-qui c-sky reveal"><span class="doc-qui-art">${C.alexPortrait({ title: 'Alex' })}</span><h3>Alex</h3><p>Il conçoit votre site, et il répond à vos questions quand Cerise ne sait pas.</p></div>
  </div>
  <p class="doc-more">${C.btn(sections.equipe.path, 'btn-primary', sections.equipe.icon, 'Rencontrer la bande')} ${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>`)}

${chap('questionnaire', `3. Le questionnaire de création`, `  <h2>Ce qu’on vous demande pour créer votre site</h2>
  <p>Après votre commande, un questionnaire vous attend dans l’onglet « Ma commande ». Il est déjà prérempli avec vos coordonnées. Vous pouvez modifier vos réponses tant que le site n’est pas en ligne.</p>
  <div class="doc-brief">
    ${typesOfferts.map((t, k) => `<details class="doc-brief-type"${k === 0 ? ' open' : ''}><summary>${icon(t.icon)}Pour un ${esc(t.name)}</summary>
      <ol class="doc-brief-sections">${BRIEF.pour(t.id).map((sec) => `<li><strong>${icon(sec.icon)}${esc(sec.titre)}</strong><ul>${sec.champs.map((c) => `<li><span>${esc(c.label)}${c.requis ? ' <em class="doc-req">à remplir</em>' : ''}</span>${briefDetail(c)}</li>`).join('')}</ul></li>`).join('')}</ol>
    </details>`).join('')}
  </div>`)}

${chap('sites', `4. Votre site`, `  <div class="container-narrow">
    <h2>Un site, une option, un prix</h2>
    <p>Votre site comprend les pages qui comptent (accueil, présentation, services et tarifs, galerie, questions fréquentes, contact), et Alex les crée avec votre contenu. Le prix est fixé dès la commande, et il ne change pas en cours de route. ${esc(C.PLUS_DE_PAGES)}</p>
  </div>
  <div class="doc-types">
    ${typesOfferts.map((t) => `<div class="doc-type reveal"><strong>${esc(t.name)}</strong><b>${C.prixType(t)}</b><span>${icon('clock')}Prêt en ${esc(t.delai)}</span><p><strong>${esc(t.but)}.</strong> ${esc(t.pitch)}</p></div>`).join('')}
  </div>
  <div class="doc-duo">
    ${fig('site-dodedo', 'Page d’accueil du site Dodedo', 'Un vrai site client : <a href="https://www.dodedo.fr/" target="_blank" rel="noopener">dodedo.fr</a>.')}
    ${fig('site-flore', 'Aperçu du site Flore & Chenilles', 'Un autre site client : <a href="https://www.floreetchenilles.fr/" target="_blank" rel="noopener">floreetchenilles.fr</a>.')}
  </div>
  <p class="doc-more center">${C.btn(sections.confiance.path, 'btn-light', 'handshake', 'Voir les sites de nos clients')}</p>`)}

${chap('prix', `5. Le prix`, `  <div class="container-narrow">
    <h2>Le site une fois, puis ${euro(AUTO.month)} ou ${euro(ABO.month)} par mois</h2>
    <p>Les prix sont les mêmes pour tous. Vous payez votre site une fois. Ensuite, c’est vous qui choisissez, sans obligation d’abonnement.</p>
  </div>
  <div class="doc-types">
    <div class="doc-type reveal"><strong>Créer le site</strong><b>dès ${euro(creation.prix)}</b><span>${icon('wand-sparkles')}Sans abonnement</span><p>${esc(ESS.name)} ${euro(ESS.price)}, option ${esc(ECO.name)} + ${euro(ECO.prix)}. Payable en ${C.lissageTxt} fois avec ${C.ORGANISMES}.</p></div>
    <div class="doc-type reveal"><strong>Forfait ${esc(AUTO.name)}</strong><b>${euro(AUTO.month)}</b><span>${icon('download')}Par mois</span><p>Vous gérez votre hébergement, votre nom de domaine, vos sauvegardes et vos mises à jour.</p></div>
    <div class="doc-type reveal"><strong>Forfait ${esc(ABO.name)}</strong><b>${euro(ABO.month)}</b><span>${icon('repeat')}Par mois, sans engagement</span><p>On s’occupe de tout, modifications incluses.</p></div>
    <div class="doc-type reveal"><strong>Les extras</strong><b>${euro(PRIX_PAGE)} la page</b><span>${icon('sparkles')}Ou sur devis</span><p>Page de visibilité Google, traduction anglaise, fonctionnalité spécifique. Depuis votre espace client.</p></div>
  </div>
  <div class="container-narrow">
    <h3>Ce que comprend le forfait ${esc(ABO.name)}</h3><ul class="list-check">${ABO.details.map((d) => `<li>${inline(d)}</li>`).join('')}</ul>
  </div>
  <div class="doc-cards3">
    <div class="doc-mini reveal"><strong>${icon('wrench')}Modifications à volonté</strong><p>Votre première version est en ligne : avec le forfait ${esc(ABO.name)}, vous changez vous-même vos textes et vos photos, ou vous nous demandez la modification.</p></div>
    <div class="doc-mini reveal"><strong>${icon('search-check')}Page de visibilité Google</strong><p>${euro(PRIX_PAGE)} la page, sans abonnement, réglée par carte depuis votre espace client.</p></div>
    <div class="doc-mini reveal"><strong>${icon('ticket')}Code promo</strong><p>Une seule case, à la commande. La remise s’applique sur la création du site.</p></div>
  </div>
  <p class="doc-more center">${C.btn(sections.forfaits.path, 'btn-light', sections.forfaits.icon, 'Voir les tarifs')}</p>`)}

${chap('espace', `6. L’espace client`, `  <div class="doc-split">
    <div>
      <h2>Tout votre site, au même endroit</h2>
      <p>Chaque client a son espace, sur téléphone comme sur ordinateur.</p>
      <ul class="doc-tabs">${tabs.map(([ic, t, d]) => `<li>${icon(ic)}<span><strong>${t}</strong> : ${d}</span></li>`).join('')}</ul>
      <p class="doc-note">Sans l’option ${esc(ECO.name)}, l’onglet « Ma boutique » reste verrouillé.</p>
    </div>
    ${fig('espace', 'L’espace client : les onglets et la page d’accueil', 'L’accueil de l’espace client (exemple : « Pâtisserie Lila », une cliente imaginaire).')}
  </div>
  <p class="doc-more">${C.btn('/mon-espace/demo/', 'btn-light', 'eye', 'Essayer la démo')}</p>`)}

${chap('demandes', `7. Demander une modification`, `  <div class="doc-split doc-split-rev">
    ${fig('demandes', 'L’onglet Mes modifications', 'L’onglet « Mes modifications » : on écrit, on ajoute une photo si besoin, on suit l’avancement.')}
    <div>
      <h2>Vous demandez, on s’en charge</h2>
      <p>Avec le forfait ${esc(ABO.name)}, vos modifications sont incluses. Voici comment ça se passe :</p>
      <ol class="doc-steps">${C.ETAPES_MODIF.map(([, t, d]) => `<li><strong>${esc(t)}.</strong> ${esc(d)}</li>`).join('')}</ol>
      <ul class="list-check">
        <li>${esc(C.BRICOU)} clarifie votre demande et s’en occupe. Une demande à la fois.</li>
        <li>Tant que votre demande n’est pas commencée, vous pouvez l’annuler d’un clic.</li>
      </ul>
      <p class="doc-more">${C.btn(sections.accompagnement.path, 'btn-light', sections.accompagnement.icon, 'L’accompagnement')}</p>
    </div>
  </div>`)}

${chap('jetons', `8. La petite bande`, `  <h2>${Maj(NB_BANDE)} Minis Monstres, chacun son métier</h2>
  <ul class="list-check">
    ${bande.map((b) => `<li><strong>${esc(b.nom)}</strong>, ${esc(b.role.toLowerCase())}. ${esc(b.court)}</li>`).join('')}
  </ul>
  <p>Cerise répond dans la bulle, en bas de l’écran, jusqu’à ${limites.bulleJour} messages par jour.</p>
  <p class="doc-more">${C.btn(sections.equipe.path, 'btn-light', sections.equipe.icon, 'Notre équipe')}</p>`)}

${chap('messages', `9. Les extras`, `  <div class="container-narrow">
    <h2>Trois extras, quand vous en avez besoin</h2>
    <ul class="list-check">
      ${C.EXTRAS_PAR_FAMILLE.flatMap((g) => g.items).map((x) => `<li><strong>${esc(x.name)}</strong>, ${x.devis ? 'sur devis' : `${euro(x.fois)} la page, sans abonnement, réglée par carte`}. ${inline(x.desc)}</li>`).join('')}
    </ul>
    <p>Tout se demande depuis l’onglet « Extras » de votre espace client.</p>
  </div>
  ${fig('messages', 'Les petits mots de la bande dans l’espace client', 'Dans l’espace client : les petits mots de la bande (exemple).', 'doc-fig-flat')}
  <p class="doc-more center">${C.btn(sections.forfaits.path + '#extras', 'btn-light', 'plus', 'Voir les extras')}</p>`)}

${chap('boutique', `10. L’option ${esc(ECO.name)}`, `  <div class="container-narrow">
    <h2>Votre boutique, gérée par vous</h2>
    <p>Dans l’onglet « Ma boutique », vous gérez vos articles, vos prix, vos paiements et vos commandes. ${esc(C.BOUTIQUE_ARTICLES)}</p>
  </div>
  <div class="doc-split">
    <ul class="doc-tools">
      <li>${icon('image-plus')}<span><strong>Vos articles</strong>Une photo, une description et un prix par article. Pas de limite d’articles.</span></li>
      <li>${icon('credit-card')}<span><strong>Vos moyens de paiement</strong>Stripe, PayPal, virement, chèque ou paiement à la livraison. Vos clés de paiement restent sur votre propre site.</span></li>
      <li>${icon('package')}<span><strong>La livraison</strong>À prix fixe, gratuite à partir d’un montant, ou retrait sur place.</span></li>
      <li>${icon('package')}<span><strong>Vos commandes</strong>Vous recevez un e-mail à chaque commande. Deux boutons : « Je la prépare », puis « Expédiée ou remise ».</span></li>
      <li>${icon('badge-percent')}<span><strong>Codes promo et soldes</strong>En % ou en €, avec une date de fin. Les prix barrés apparaissent seuls.</span></li>
      <li>${icon('megaphone')}<span><strong>Bandeau d’annonce</strong>Une phrase en haut du site, en quatre couleurs au choix.</span></li>
      <li>${icon('sun')}<span><strong>Mode vacances</strong>Boutique fermée, ou commandes acceptées avec expédition au retour.</span></li>
    </ul>
    ${fig('vacances', 'Aperçu du mode vacances', 'L’aperçu du mode vacances, tel qu’il s’affiche pendant que vous remplissez le formulaire.', 'doc-fig-small')}
  </div>
  ${fig('boutique', 'L’onglet Ma boutique', 'L’onglet « Ma boutique » : codes promo, soldes rapides et bandeau (exemple).', 'doc-fig-wide')}`)}

${chap('seo', `11. Être trouvé sur Google`, `  <h2>La visibilité Google, pas à pas</h2>
  <p>Tous les sites partent avec de bonnes bases : des pages rapides, lisibles sur téléphone, avec un titre et une description pour Google. Pour aller plus loin, une fois votre site en ligne, vous ajoutez des pages de visibilité Google depuis votre espace client : ${euro(PRIX_PAGE)} la page, sans abonnement, à l’unité ou par ${C.packsSeo}.</p>
  <div class="go-links">
    <a class="go-link c-${sections.seo.color}" href="${sections.seo.path}"><span class="type-ico">${icon(sections.seo.icon)}</span><strong>Être trouvé sur Google, en détail</strong>${icon('arrow-right')}</a>
    <a class="go-link c-lilac" href="${HUB}"><span class="type-ico">${icon('book-open')}</span><strong>Les tutos de ${esc(ECOLE.label)}</strong>${icon('arrow-right')}</a>
    ${LEXIQUE.termes.length ? `<a class="go-link c-${sections.lexique.color}" href="${sections.lexique.path}"><span class="type-ico">${icon(sections.lexique.icon)}</span><strong>Le lexique</strong>${icon('arrow-right')}</a>` : ''}
    <a class="go-link c-${sections.confiance.color}" href="${sections.confiance.path}"><span class="type-ico">${icon(sections.confiance.icon)}</span><strong>Les pages créées pour nos clients</strong>${icon('arrow-right')}</a>
  </div>`)}

${chap('paiement', `12. Paiement`, `  <h2>Payer simplement</h2>
  <ul class="list-check">
    <li>Le site se paie en entier à la commande : en une fois, ou en ${C.lissageTxt} fois avec ${C.ORGANISMES}, directement sur la page de paiement.</li>
    <li>Le forfait ${esc(ABO.name)} se paie au mois, sans engagement.</li>
    <li>Une page de visibilité Google se paie par carte, au moment de la commander.</li>
    <li>Un deuxième site : ${fidelite.remiseSecondSite} % de remise sur sa création.</li>
  </ul>
  <p class="doc-more">${C.btn('/faq/', 'btn-light', 'circle-help', 'Questions fréquentes')}</p>`)}
</div></div></section>
${C.ctaBand({ title: 'Une question qui n’est pas ici ?', text: 'Écrivez-nous : on vous répond, et on complète cette page.' })}`;
  return {
    path: sections.documentation.path,
    section: 'documentation',
    title: 'Documentation : tout comprendre en images | Les Minis Monstres',
    noindex: true, // V2 : la documentation est pour les clients
    description: 'Tout comprendre en images : votre site, le prix, le forfait Autonome ou le forfait Mini, les modifications, l’espace client, les extras et l’option e-commerce.',
    crumbs,
    body,
    priority: 0.7,
  };
}

// ====================================================================== FAQ COMPLÈTE
function faqPage() {
  const crumbs = [HOME, { name: 'Questions fréquentes', path: '/faq/' }];
  const groups = [
    ['La création', FAQ.creation, 'creer'],
    ['La commande', FAQ.commande || [], 'commander'],
    ['Les tarifs et le forfait Mini', FAQ.forfaits || FAQ.tarifs || [], 'forfaits'],
    ['Votre espace client', FAQ.espace, 'espace'],
    ...(OUTILS_PAGE ? [['Les outils', FAQ.outils || [], 'espace']] : []),
    ['Être trouvé sur Google', FAQ.seo, 'seo'],
    ['Notre méthode', FAQ.methode, 'methode'],
    ['Le comparatif', FAQ.comparatif || [], 'comparatif'],
  ].filter((g) => g[1] && g[1].length);
  const all = groups.flatMap((g) => g[1]);
  const body = `${C.pageHero({ h1: 'Questions fréquentes', lead: 'Les réponses aux questions qu’on nous pose le plus souvent. Il en manque une ? Écrivez-nous.', crumbs })}
<section class="section"><div class="container container-narrow">
  ${groups
    .map(([t, items, k]) => `<div class="faq-group c-${sections[k].color}"><h2>${icon(sections[k].icon)}${t}</h2><div class="faq">${items.map(C.faqItem).join('')}</div></div>`)
    .join('')}
</div></section>
${C.ctaBand({ text: CTA_TEXTE })}`;
  return {
    path: '/faq/',
    title: 'Questions fréquentes : création, tarifs, visibilité | Les Minis Monstres',
    description: 'Toutes les réponses sur la création de votre site, la commande en ligne, les tarifs et le forfait Mini, l’espace client et la visibilité sur Google.',
    crumbs,
    body,
    schema: [C.faqSchema(all)],
    priority: 0.6,
  };
}

// ====================================================================== PAGES LÉGALES ET UTILITAIRES
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const frDate = (d) => {
  const [y, m, j] = d.split('-').map(Number);
  return `${j} ${MOIS[m - 1]} ${y}`;
};

function legalPage(l) {
  const crumbs = [HOME, { name: l.name, path: l.path }];
  return {
    path: l.path,
    title: l.title,
    description: l.description,
    crumbs,
    body: `${C.pageHero({ h1: l.name, lead: l.lead, crumbs })}
<section class="section"><div class="container container-narrow prose legal">${md(l.body)}<p class="small muted">Dernière mise à jour : ${frDate(l.updated)}.</p></div></section>`,
    priority: 0.2,
    changefreq: 'yearly',
  };
}

function planDuSite() {
  const crumbs = [HOME, { name: 'Plan du site', path: '/plan-du-site/' }];
  // Les pages du parcours de commande (noindex) ne figurent pas dans le plan. Le hub des guides n'existe plus (/guides/ mène à Mini Tuto).
  // Outils et Documentation (noindex depuis la V2) restent dans le plan : les clients les cherchent.
  const hidden = ['commander', 'confirmation', 'fidelite', 'guides', ...(OUTILS_PAGE ? [] : ['espace'])];
  const links = [
    ['/', 'Accueil'],
    [MAISON.path, `${MAISON.label} : le concept`],
    ...Object.entries(sections).filter(([k]) => !hidden.includes(k)).map(([, s]) => [s.path, s.label]),
    ['/faq/', 'Questions fréquentes'],
    ...METIERS.map((m) => ['/' + m.slug + '/', 'Site internet : ' + m.nom.toLowerCase()]),
    ...PAGES_V2.filter((p) => !Object.values(sections).some((x) => x.path === p.path)).map((p) => [p.path, p.nom]),
    ...legal.map((l) => [l.path, l.name]),
  ];
  const liste = (l) => `<ul class="sitemap-list">${l.map(([p, t]) => `<li><a href="${p}">${esc(plain(t))}</a></li>`).join('')}</ul>`;
  return {
    path: '/plan-du-site/',
    title: 'Plan du site | Les Minis Monstres',
    description: 'Toutes les pages du site des Minis Monstres : créer mon site, tarifs, réalisations, votre métier, les petits tutos gratuits, contact, FAQ et pages légales.',
    crumbs,
    body: `${C.pageHero({ h1: 'Plan du site', lead: 'Toutes les pages du site, au même endroit.', crumbs })}
<section class="section"><div class="container container-narrow">${liste(links)}
  <h2 class="plan-titre" id="mini-tuto"><a href="${HUB}">${esc(ECOLE.label)}</a></h2>
  ${TUTOS.themes().map((g) => `<h3 class="plan-sous-titre">${esc(g.titre)}</h3>${liste(TUTOS.duTheme(g.id).map((t) => [t.path, t.nom]))}`).join('\n  ')}
  ${TUTOS.guides.length ? `<h3 class="plan-sous-titre">${GUIDES_TITRE}</h3>${liste(TUTOS.guides.map((t) => [t.path, t.nom]))}` : ''}
</div></section>`,
    priority: 0.2,
  };
}

function merci() {
  return {
    path: '/merci/',
    noindex: true,
    title: 'Demande envoyée | Les Minis Monstres',
    description: 'Votre demande a bien été envoyée aux Minis Monstres. On vous répond rapidement, en général dans la journée, avec un récapitulatif clair.',
    body: `${C.pageHero({ h1: 'Merci, votre demande est bien partie !', lead: 'On vous répond rapidement, en général dans la journée. Pensez à regarder vos e-mails, et vos indésirables.', mascot: 'mascotte' })}
<section class="section"><div class="container center"><div class="hero-ctas centered">${C.btn('/', 'btn-primary btn-lg', 'arrow-right', 'Retour à l’accueil')}${C.btn(sections.forfaits.path, 'btn-light btn-lg', sections.forfaits.icon, 'Voir les tarifs')}</div></div></section>`,
  };
}

function notFound() {
  return {
    path: '/404/',
    file: '404.html',
    noindex: true,
    title: 'Page introuvable | Les Minis Monstres',
    description: 'Cette page n’existe pas ou a été déplacée. Retrouvez la création de site, les tarifs, l’espace client et la visibilité sur Google depuis l’accueil.',
    body: `${C.pageHero({ h1: 'Oups, cette page s’est perdue', lead: 'Elle a peut-être été déplacée. Voici où aller :', mascot: 'triste' })}
<section class="section"><div class="container"><div class="go-links">${['creer', 'forfaits', 'seo', 'contact']
      .map((k) => `<a class="go-link c-${sections[k].color}" href="${sections[k].path}"><span class="type-ico">${icon(sections[k].icon)}</span><strong>${sections[k].label}</strong>${icon('arrow-right')}</a>`)
      .join('')}</div></div></section>`,
  };
}

function build() {
  return [
    home(), creerPage(), commanderPage(), confirmationPage(), forfaitsPage(), espacePage(), monEspacePage(), seoPage(), comparatifPage(), fidelitePage(), contactPage(), faqPage(),
    confiancePage(),
    equipePage(),
    // V2 : pages métier, réassurance, guides de fond, page locale (remplacent /methode/ et /lia-et-alex/)
    ...(METIERS.length ? [metiersHub(), ...METIERS.map(metierPage)] : []),
    ...PAGES_V2.map(pageV2),
    docPage(),
    laMaisonPage(),
    tutoHub(), ...TUTOS.tutos.map(tutoPage), ...TUTOS.guides.map(tutoPage),
    ...(LEXIQUE.termes.length ? [lexiqueHub(), ...LEXIQUE.termes.map(lexiquePage)] : []),
    ...legal.map(legalPage), planDuSite(), merci(), notFound(),
  ];
}

module.exports = { build };
