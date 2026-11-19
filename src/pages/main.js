// Pages du site
const { site, sections, types, forfaits, annuel, lissage, delais, fidelite, paiement, jetonsLia, creation, marche, enService, limites, creationSeule, bande } = require('../config');
// Les outils de l'espace client sont en pause (config enService) : la page Outils n'est pas construite.
const OUTILS_ON = enService.outils;
// OFFRE FINALE (19 novembre 2026). Créer le site, payé une fois : Site Essentiel, Site Visibilité ou Site Boutique (config.types).
// Ensuite, au choix : Autonomie (creationSeule, 0 € par mois, le client gère tout) ou Mini (forfaits[0], 10 € par mois, sans engagement).
// Trois extras seulement, depuis l'espace client (C.extrasListe) : page de visibilité Google, traduction anglaise, fonctionnalité spécifique.
const ABO = forfaits[0];
const AUTO = creationSeule;
const { icon } = require('../lib/icons');
const { monster } = require('../lib/monsters');
const { md, inline, esc } = require('../lib/md');
const C = require('../lib/components');
const FAQ = require('../content/faq');
const legal = require('../content/legal');
const OUTILS = require('../content/outils');
const OUTILS_LIA = require('../content/outils-lia').outils;
const FAMILLES_OUTILS = require('../content/outils-lia').FAMILLES;
// Les trois sites, et l'extra « page de visibilité Google » (15 € la page, payée une fois)
const ESS = C.ESSENTIEL, VIS = C.VISIBILITE, BOU = C.BOUTIQUE_T;
const PAGE_GOOGLE = C.PACK_SEO || { name: 'Page de visibilité Google', price: { once: 15 }, exemples: [] };
const PRIX_PAGE = PAGE_GOOGLE.price.once;
// Un bloc repris tel quel sur plusieurs pages (scripts/check.js ne le compte pas comme une phrase en double)
const commun = (html) => `<!--commun-->${html}<!--/commun-->`;
const GUIDES = require('../content/guides');
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

// ====================================================================== ACCUEIL
// La phrase principale d'abord (config.phrase), puis le positionnement (un site, un but), les prix en clair,
// la bande, et pourquoi c'est moins cher. Peu de blocs : la plupart des visiteurs sont sur téléphone.
// La vitrine de l'accueil : une petite boutique (store rayé, enseigne, vitre éclairée) et un repère de carte au-dessus : on la voit, on la trouve.
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
  <circle cx="248" cy="228" r="4.500" fill="#2E2A47"/>
  <rect x="36" y="96" width="288" height="12" rx="6" fill="#FF8FB8"/>
  <path d="M40 104h40v28a20 20 0 0 1-40 0z" fill="#FF9EC4"/><path d="M80 104h40v28a20 20 0 0 1-40 0z" fill="#FFF1F6"/><path d="M120 104h40v28a20 20 0 0 1-40 0z" fill="#FF9EC4"/><path d="M160 104h40v28a20 20 0 0 1-40 0z" fill="#FFF1F6"/><path d="M200 104h40v28a20 20 0 0 1-40 0z" fill="#FF9EC4"/><path d="M240 104h40v28a20 20 0 0 1-40 0z" fill="#FFF1F6"/><path d="M280 104h40v28a20 20 0 0 1-40 0z" fill="#FF9EC4"/>
  <g class="vit-pin"><path d="M300 0c-17 0-30 13-30 29 0 21 30 46 30 46s30-25 30-46c0-16-13-29-30-29z" fill="#FF8FB8"/><circle cx="300" cy="29" r="11" fill="#FFFDF9"/></g>
  ${etoile(28, 60, 0)}${etoile(238, 22, 1)}${etoile(340, 120, 2)}
</svg>`.replace('.500', '.5');
}
function home() {
  const art = (b) => (b.monstre === 'lia' ? monster('coucou') : C.petit(b.monstre));
  const body = `<section class="hero">
  <div class="container hero-in">
    <div class="hero-text">
      <p class="hero-sur">${icon('store')}Sites internet pour artisans et commerçants</p>
      <h1>Votre activité mérite <mark>d’être vue</mark>.</h1>
      <p class="hero-lead">Sans site internet, c’est une belle vitrine dans une rue où personne ne passe. On crée le vôtre, et on vous rend visible.</p>
      <div class="hero-ctas">${C.btnCreer('btn-primary btn-lg')}<a class="hero-lien" href="${sections.forfaits.path}">Voir les tarifs, dès ${euro(creation.prix)}${icon('arrow-right')}</a></div>
      <ul class="hero-points">
        <li>${icon('check')}Prix affichés</li>
        <li>${icon('check')}Sans abonnement obligatoire</li>
        <li>${icon('check')}On vous répond</li>
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

<section class="section" id="prix"><div class="container">
  <h2 class="section-title">Trois sites pour être visible</h2>
  <p class="section-sub">Créez votre site : payez une seule fois. Ensuite, ${esc(AUTO.name)} ou le forfait ${esc(ABO.name)}, à vous de choisir.</p>
  ${commun(C.offre({ compact: true }))}
</div></section>

<section class="section section-soft" id="visible"><div class="container">
  <h2 class="section-title">Notre métier : vous rendre visible</h2>
  <p class="section-sub">Une vitrine, oui, mais dans une rue où l’on passe.</p>
  <div class="feats feats-3 feats-courts">
    <div class="feat reveal">${icon('search-check')}<h3>Un site que Google comprend</h3><p>Des pages claires et rapides, lisibles sur téléphone. Google sait ce que vous faites, et où.</p></div>
    <div class="feat reveal">${icon('tag')}<h3>Des prix affichés</h3><p>Pas de devis, pas de rendez-vous commercial. Le prix est le même pour tout le monde.</p></div>
    <div class="feat reveal">${icon('message-circle')}<h3>Quelqu’un qui répond</h3><p>Une question ? Vous écrivez, et on vous répond. Pas de standard, pas d’attente.</p></div>
  </div>
  <p class="center more">${C.btn(sections.seo.path, 'btn-light', sections.seo.icon, 'Comment on vous rend visible')}</p>
</div></section>

<section class="section" id="qui-fait-quoi"><div class="container">
  <h2 class="section-title">Alex et la bande</h2>
  <p class="section-sub">Alex conçoit votre site et vérifie tout. Les Minis Monstres l’aident, chacun son métier.</p>
  <ul class="bande-courte reveal">${bande.map((b) => `<li><span class="bande-courte-art" aria-hidden="true">${art(b)}</span><strong>${esc(b.nom)}</strong><small>${esc(b.role)}</small></li>`).join('')}</ul>
  <p class="center more">${C.btn(sections.equipe.path, 'btn-light', sections.equipe.icon, 'Rencontrer la bande')}</p>
</div></section>

${C.ctaBand({ title: 'On ouvre votre vitrine sur internet ?', text: 'Choisissez votre site en deux minutes. Le prix s’affiche tout de suite.' })}`;
  return {
    path: '/',
    bodyClass: 'page-accueil',
    title: `Un site internet pour être visible, dès ${creation.prix} € | Les Minis Monstres`,
    description: `Sans site internet, personne ne passe devant votre vitrine. On vous rend visible : ${types.map((t) => `${t.name} ${euro(t.price)}`).join(', ')}, payé une fois.`,
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
  const crumbs = crumb('creer');
  const f = C.faq(FAQ.creation, 'Vos questions sur la création', 'faq-creation');
  const body = `${C.pageHero({
    section: 'creer',
    h1: 'Choisissez votre site en deux minutes',
    lead: `Trois façons d’être visible. Créez votre site : payez une seule fois. Ensuite, ${AUTO.name} ou le forfait ${ABO.name}. Le total s’affiche en bas.`,
    crumbs,
  })}
<section class="section section-builder"><div class="container">${C.configurator()}</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Et ensuite ?</h2>
  ${C.steps([
    { t: 'Vous commandez', d: `Vous réglez ${paiement.acompte} % du site. Le reste vient à la réception, en une fois ou étalé.` },
    { t: 'On s’appelle', d: 'Un rendez-vous téléphonique pour découvrir votre activité.' },
    { t: 'Votre site est créé', d: 'Vous le voyez avant la mise en ligne, et vous dites ce qui doit changer, jusqu’à ce qu’il vous plaise.' },
    { t: 'Il est mis en ligne', d: `Avec le forfait ${ABO.name}, on s’occupe de tout. Avec ${AUTO.name}, on vous remet votre site, prêt à installer chez votre hébergeur.` },
  ])}
</div></section>

${f.html}`;
  return {
    path: sections.creer.path,
    section: 'creer',
    bodyClass: 'page-creer',
    noMobileBar: true,
    title: 'Créer mon site internet et devenir visible | Les Minis Monstres',
    description: `Devenez visible : ${ESS.name} ${creation.prix} €, ${VIS.name} ${creation.visibilite} € ou ${BOU.name} ${euro(creation.boutiquePrix)}. Puis ${AUTO.name} ou le forfait ${ABO.name}. Le total s’affiche tout de suite.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== TARIFS
// La fonction garde son nom : la rubrique s'appelle toujours « forfaits » dans config.js (sections.forfaits).
// Deux choses bien séparées : créer le site (trois sites, payés une fois) et le faire vivre (Autonomie ou Mini). Puis les trois extras.
function forfaitsPage() {
  const crumbs = crumb('forfaits');
  const f = C.faq(FAQ.forfaits || FAQ.tarifs || [], 'Vos questions sur les tarifs', 'faq-tarifs');
  const body = `${C.pageHero({
    section: 'forfaits',
    h1: `Tarifs : être visible, dès ${euro(creation.prix)}`,
    lead: `Des prix affichés, les mêmes pour tous. Créez votre site : payez une seule fois. Ensuite, ${AUTO.name} à ${euro(AUTO.month)} ou le forfait ${ABO.name} à ${euro(ABO.month)} par mois. Enfin, les extras, si vous en avez besoin.`,
    crumbs,
  })}
<section class="section"><div class="container" data-billing-scope>
  <h2 class="section-title">Un site, un but, un prix</h2>
  <p class="section-sub">Exister sur internet, être trouvé sur Google ou vendre sur internet : à vous de choisir.</p>
  ${commun(C.offre())}
</div></section>

<section class="section section-soft" id="extras"><div class="container">
  <h2 class="section-title">Enfin, les extras</h2>
  ${C.presente('etoile', `<strong>Moi, c’est ${esc(C.PEPITE)}.</strong> Les extras, c’est mon rayon : trois extras, pas plus. Vous me les demandez depuis votre espace client, quand vous en avez besoin.`, { humeur: 'ravi' })}
  ${C.extrasListe()}
  <p class="center more">${C.btn(site.espaceClient.demo, 'btn-light', 'eye', 'Voir l’espace client en démo')}</p>
</div></section>

<section class="section" id="detail"><div class="container container-narrow">
  <h2 class="section-title">Le détail, si vous le voulez</h2>
  <p class="section-sub">Touchez une ligne pour l’ouvrir.</p>
  ${C.deroulants([
    C.deroulant(`Ce que comprend le forfait ${esc(ABO.name)}, ligne par ligne`, `<ul class="list-check">${ABO.details.map((d) => `<li>${inline(d)}</li>`).join('')}</ul>`, { id: 'maintenir', ico: 'shield-check' }),
    C.deroulant(`Une modification avec le forfait ${esc(ABO.name)}, comment ça se passe ?`, `<p>Vous écrivez votre demande dans votre espace client. ${esc(C.CERISE)} vous aide à la formuler, et la modification est faite pour vous.</p>${C.processusModif({ titre: false })}`, { id: 'modifications', ico: 'repeat' }),
    C.deroulant(`${esc(AUTO.name)} : vous préférez tout gérer vous-même ?`, commun(C.creationSeuleBox()), { id: 'creation-seule', ico: 'download' }),
    C.deroulant(`Le ${esc(BOU.name)}, pour vendre sur internet`, C.optionsCompact(), { id: 'boutique', ico: 'shopping-bag' }),
    C.deroulant('Comment payer ?', C.payBox(), { id: 'payer', ico: 'calendar-check' }),
    C.deroulant(`Et si vous arrêtez le forfait ${esc(ABO.name)} ?`, `<ul class="list-check">
      <li><strong>Quand vous voulez</strong> : un message suffit, ou le bouton de votre espace client. Le forfait ${esc(ABO.name)} s’arrête à la fin de la période déjà payée.</li>
      <li><strong>Votre nom de domaine reste à vous</strong> : il est à votre nom, et vous le transférez où vous voulez.</li>
      <li><strong>Vous repartez avec votre site</strong> : son export est possible, pour le faire héberger ailleurs.</li>
      <li><strong>Un seul engagement</strong> : si vous payez votre site en ${C.lissageTxt} fois, vous vous engagez le temps de ce paiement.</li>
    </ul>`, { id: 'arreter', ico: 'log-out' }),
  ])}
</div></section>

<section class="section section-soft" id="comparer"><div class="container">
  <h2 class="section-title">Et ailleurs, ça coûte combien ?</h2>
  <p class="section-sub">Une comparaison honnête, avec les sources.</p>
  ${C.economie()}
  <div class="promos">
    <a class="promo c-butter reveal" href="${sections.comparatif.path}">
      <span class="promo-ico">${icon('scale')}</span>
      <span class="promo-text"><strong>Et par rapport aux autres solutions ?</strong><span>Agence, indépendant, plateforme : la comparaison, ligne par ligne.</span></span>
      <span class="promo-go">${icon('arrow-right')}</span>
    </a>
  </div>
</div></section>

${f.html}
${C.ctaBand({ title: 'Le prix vous convient ?', text: 'Il ne reste qu’à devenir visible. Choisissez votre site en deux minutes : le total s’affiche avant de commander.' })}`;
  return {
    path: sections.forfaits.path,
    section: 'forfaits',
    title: `Tarifs : un site internet pour être visible, dès ${creation.prix} € | Les Minis Monstres`,
    description: `${ESS.name} ${creation.prix} €, ${VIS.name} ${creation.visibilite} €, ${BOU.name} ${euro(creation.boutiquePrix)}, payés une fois. Ensuite, ${AUTO.name} à ${AUTO.month} € ou le forfait ${ABO.name} à ${ABO.month} € par mois, sans engagement.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== NOS OUTILS (en pause : config enService.outils)
// La page n'est construite que si les outils reviennent. Quelques noms changent sur la page publique.
const PUBLIC_OUTIL = {
  question: ['Une question sur internet', 'Vous posez votre question avec vos mots, sur votre site, Google ou les réseaux. La réponse arrive en quelques phrases simples, avec ce qu’il faut faire en premier.'],
  conseilphoto: ['Conseils sur une photo'],
  conseilpage: ['Conseils pour ma page'],
};
function outilsPage() {
  const crumbs = crumb('espace');
  const f = C.faq(FAQ.espace, 'Vos questions sur l’espace client', 'faq-outils');
  const body = `${C.pageHero({
    section: 'espace',
    h1: 'Des outils simples pour vous faire connaître',
    lead: `Corriger un texte, préparer une photo, publier sur vos réseaux : les Minis Monstres vous aident, et vous gardez la main. Les outils sont dans votre espace client, avec le forfait ${ABO.name}.`,
    crumbs,
  })}
${site.espaceClient.ouvert ? '' : `<div class="container"><p class="notice reveal">${icon('hourglass')}<span>L’espace client ouvre bientôt. D’ici là, envoyez vos demandes par le formulaire de contact.</span></p></div>`}
<div class="container demo-cta demo-cta-duo">${C.btn(sections.monespace.path + '#outils', 'btn-primary btn-lg', 'circle-user', 'Ouvrir mes outils')}${C.btn(site.espaceClient.demo, 'btn-light btn-lg', 'eye', 'Essayer la démo')}</div>

<section class="section" id="outils-lia"><div class="container">
  <h2 class="section-title">Les outils de votre espace</h2>
  <p class="section-sub">Il suffit d’être connecté. Rien d’autre à installer, aucun autre compte à créer.</p>
  ${Object.entries(FAMILLES_OUTILS).map(([fid, fnom]) => `<h3 class="tools-famille reveal">${fnom}</h3>
  <div class="tools">${OUTILS_LIA.filter((t) => t.categorie === fid).map(
    (t) => `<div class="tool c-${t.color} reveal"><span class="tool-ico">${icon(t.icon)}</span><span class="tool-body"><strong>${(PUBLIC_OUTIL[t.id] || [])[0] || t.name}</strong><span>${(PUBLIC_OUTIL[t.id] || [])[1] || t.desc}</span></span><span class="tool-tag c-mint">Compris</span></div>`
  ).join('')}</div>`).join('\n  ')}
</div></section>

<section class="section section-soft"><div class="container split">
  <div class="reveal">
    <p class="kicker c-mint">${icon('message-circle')}Demande de modification</p>
    <h2>Une demande, et c’est fait</h2>
    <p>Un horaire, un prix, une photo ? Écrivez-le dans votre espace, avec une photo si besoin. ${esc(C.CERISE)} vous aide à bien formuler votre demande, vous la confirmez, et la modification est faite sous ${delais.reponse}.</p>
    <ul class="list-check">
      <li>Vous suivez chaque demande : reçue, en cours, faite</li>
      <li>Modifications incluses avec le forfait ${esc(ABO.name)}, une demande à la fois</li>
    </ul>
  </div>
  ${C.phoneEdit(true)}
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Aussi dans votre espace client</h2>
  <div class="tools">${OUTILS.filter((t) => !['qr', 'avis'].includes(t.id)).map(
    (t) => `<a class="tool c-${t.color} reveal" href="${site.espaceClient.demo}?outil=${t.demo}"><span class="tool-ico">${icon(t.icon)}</span><span class="tool-body"><strong>${t.name}</strong><span>${t.desc}</span></span><span class="tool-tag c-mint">Compris</span></a>`
  ).join('')}</div>
</div></section>

${f.html}
${C.ctaBand({ title: 'Envie d’essayer les outils ?', text: `Créez votre site : les outils arrivent avec le forfait ${ABO.name}.` })}`;
  return {
    path: sections.espace.path,
    section: 'espace',
    title: 'Outils : textes, photos, réseaux et votre site | Les Minis Monstres',
    description: `Corriger ou traduire un texte, préparer une photo, publier sur vos réseaux : les Minis Monstres vous aident, et les outils sont compris avec le forfait ${ABO.name}.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.8,
  };
}

// ====================================================================== SEO
function seoPage() {
  const crumbs = crumb('seo');
  const f = C.faq(FAQ.seo, 'Vos questions sur la visibilité Google', 'faq-seo');
  const pack = PAGE_GOOGLE;

  // Les trois façons d'être plus visible : [couleur, monstre, titre, prix, liste]
  const levels = [
    [ESS.color, ESS.monstre, `Avec le ${ESS.name}`, `Compris, ${euro(ESS.price)}`, ['Un site rapide et sécurisé', 'Lisible sur téléphone et sur ordinateur', 'Un titre et une description pour Google']],
    [VIS.color, VIS.monstre, `Avec le ${VIS.name}`, `Compris, ${euro(VIS.price)}`, [`Jusqu’à ${creation.pages} pages`, 'Pages de visibilité Google intégrées', 'FAQ personnalisée', 'Référencement local renforcé']],
    ['lilac', 'gelee', pack.name, `${euro(pack.price.once)} la page, payée une fois`, ['Une page de plus, quand vous voulez', `Par exemple : ${(pack.exemples || []).join(', ').toLowerCase().replace('faq', 'FAQ')}`, 'Commandée depuis votre espace client']],
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
  <h2 class="section-title">Trois façons d’être plus visible</h2>
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

Ce site applique la même méthode. Ses [guides](/guides/) répondent chacun à une question précise : le prix d’un site, le choix d’un nom de domaine, la fiche Google, et d’autres.`), { ico: 'file-text' }),
    C.deroulant('Ce qu’on ne promet pas', md(`Personne ne peut garantir la première place sur Google. Méfiez-vous de ceux qui le font.

Les premiers effets arrivent en général en quelques semaines, parfois quelques mois pour les recherches les plus disputées.

On ne publie pas des centaines de pages vides pour gonfler votre site : Google les repère et les pénalise. On préfère peu de contenus, mais vraiment utiles à vos clients.`), { ico: 'shield-check', ordi: true }),
  ])}
</div></section>

${f.html}
${C.ctaBand({ title: 'Être trouvé, ça commence ici', text: `Les bases sont comprises dans chaque site. Pour aller plus loin : le ${VIS.name}, ou une page de visibilité Google en plus.`, mascot: 'clin' })}`;
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
    ['mint', 'sparkles', 'Les Minis Monstres', `Des prix affichés, dès ${euro(creation.prix)}, et quelqu’un qui répond. On crée votre site pour vous, et on le rend visible.`],
  ];
  const body = `${C.pageHero({
    section: 'comparatif',
    h1: 'Les Minis Monstres et les autres solutions',
    lead: 'Agence, indépendant ou plateforme à faire soi-même : chaque solution a sa place. La nôtre : vous rendre visible sur internet, avec des prix affichés et quelqu’un qui répond.',
    crumbs,
  })}
<section class="section"><div class="container">
  ${C.comparatifTable()}
  <p class="source">Les prix des autres solutions dépendent du prestataire et du projet : le tableau ne les chiffre pas. Nos prix sont ceux de la page <a href="${sections.forfaits.path}">tarifs</a>.</p>
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Pour qui, chaque solution ?</h2>
  <div class="feats feats-courts">${who
    .map(([c, ic, t, d]) => `<div class="feat who c-${c} reveal">${icon(ic)}<h3>${t}</h3><p>${d}</p></div>`)
    .join('')}</div>
</div></section>

<section class="section"><div class="container container-narrow">
  <h2 class="section-title">${marche.fois} fois moins cher qu’un indépendant, sans tour de magie</h2>
  <p class="section-sub">Pour un site de quelques pages, pensé pour être trouvé sur Google.</p>
  ${C.deroulants([
    C.deroulant('Les prix, côte à côte', md(`Un indépendant demande en général entre ${euro(marche.vitrineMin)} et ${euro(marche.vitrineMax)}. Une agence, plutôt ${euro(marche.agenceMin)} à ${euro(marche.agenceMax)}. Notre ${VIS.name} coûte ${euro(VIS.price)}.

Soyons honnêtes : ces fourchettes sont publiées par des prestataires, et chaque devis est différent. Certains indépendants vendent un site dès ${euro(C.INDEPENDANT_DES)}. L’écart est alors d’environ ${C.ecartBas} fois.`) + C.sourcesMarche(), { ico: 'scale', ouvert: true }),
    C.deroulant('Pourquoi ce prix ?', md(`Une méthode rodée, des outils préparés à l’avance, et pas de bureaux à payer. Les prix sont affichés : pas de rendez-vous commercial, pas de devis à attendre. Le détail est sur la page [pourquoi c’est moins cher](${sections.methode.path}).`), { ico: 'piggy-bank' }),
    C.deroulant('Et l’entretien, chaque mois ?', md(`Avec ${AUTO.name}, vous gérez tout vous-même, pour ${euro(AUTO.month)} par mois. Avec le forfait ${ABO.name}, ${euro(ABO.month)} par mois comprennent l’hébergement, les sauvegardes, la sécurité, la maintenance et les modifications. Pas de nom de domaine ? On vous le fournit pour ${euro(C.DOM)} de plus par mois. Les prestataires consultés demandent ${euro(marche.entretienMin)} à ${euro(marche.entretienMax)} par mois pour l’entretien d’un site.`), { ico: 'repeat' }),
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
  demarrage: 'Pour commander, il faut accepter que la création commence tout de suite.',
  engagement: 'Pour payer le reste en plusieurs fois, il faut accepter l’engagement le temps du paiement.',
  paiement: 'Le paiement n’a pas abouti. Votre commande est gardée : vous pouvez réessayer, ou nous écrire.',
  robot: 'L’envoi a été bloqué par la protection contre les robots. Attendez quelques secondes et réessayez.',
  annule: 'Le paiement a été annulé. Rien n’a été débité : vous pouvez reprendre quand vous voulez.',
  inconnu: 'Quelque chose n’a pas fonctionné. Réessayez, ou écrivez-nous par le formulaire de contact : on finalise la commande avec vous.',
};
function commanderPage() {
  const S = sections.commander;
  const crumbs = [HOME, { name: sections.creer.label, path: sections.creer.path }, { name: S.label, path: S.path }];
  const t0 = T('vitrine'), f0 = ABO;
  const acompte0 = round2((t0.price * paiement.acompte) / 100);
  const today0 = acompte0;
  const field = (name, label, attrs, { req = true, hint = '' } = {}) =>
    `<div class="field"><label for="o-${name}">${label} ${req ? '<span class="req">*</span>' : '<span class="opt">(facultatif)</span>'}</label><input id="o-${name}" name="${name}" ${attrs}${req ? ' required' : ''}>${hint ? `<small class="field-hint">${hint}</small>` : ''}</div>`;
  const nextSteps = [
    ['globe', 'Votre nom de domaine est prêt', 'Le vôtre, ou celui qu’on réserve à votre nom.'],
    ['mail-check', 'On vous écrit sous 24 heures', 'Pour fixer le rendez-vous téléphonique de découverte.'],
    ['circle-user', 'Votre espace client arrive par e-mail', 'Vous y suivez votre commande et vos demandes.'],
    ['rocket', 'Votre site est en ligne', `Sous <span data-order="delai">${esc(t0.delai)}</span> pour le site choisi.`],
  ];
  const body = `${C.pageHero({
    section: 'commander',
    h1: 'Votre commande',
    lead: 'Vérifiez votre choix, donnez vos coordonnées et payez en ligne. C’est tout.',
    crumbs,
    compact: true,
  })}
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
        <div class="form-row">
          ${field('email', 'E-mail', 'type="email" autocomplete="email" maxlength="150" inputmode="email"')}
          ${field('telephone', 'Téléphone', 'type="tel" autocomplete="tel" maxlength="30" inputmode="tel"')}
        </div>
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
        <label class="check"><input type="checkbox" name="demarrage" value="oui" required><span>Je demande que la création commence tout de suite. Si je me rétracte dans les 14 jours, je paie le travail déjà fait. <span class="req">*</span></span></label>
        <label class="check" data-order-engagement hidden><input type="checkbox" name="engagement" value="oui"><span>Je m’engage pour <span data-order="eng-n">${C.LMAX}</span> mois à partir de la réception, le temps de payer mon site. <span class="req">*</span></span></label>
        <div class="o-pay">
          <p class="o-pay-today"><span>Aujourd’hui vous payez</span><b data-order="today">${euro(today0)}</b></p>
          <ul class="o-pay-lines" data-order-lines>
            <li><span>Acompte de ${paiement.acompte} % sur la création (${t0.label.toLowerCase()})</span><b>${euro(acompte0)}</b></li>
          </ul>
          <p class="o-pay-next"><span data-order="next-label">À la réception : le reste, et votre forfait</span><b data-order="next">${euro(t0.price - acompte0)} + ${euro(f0.month + C.DOM)}/mois</b></p>
          <p class="o-pay-note" data-order-solde>À la réception de votre site, vous réglez le reste, <b data-order="solde">${euro(t0.price - acompte0)}</b><span data-avec-formule>, et votre forfait démarre</span>. Vous pourrez encore choisir de payer le reste en ${C.lissageTxt} fois.</p>
          <p class="o-pay-note" data-order-lisse-note hidden>À la réception, le reste se paie en <span data-order="lisse-n">${C.LMAX}</span> fois sans frais : <b data-order="lisse">${euro(C.lisse(t0.price))}</b> par mois<span data-avec-formule>, avec votre forfait. Ensuite, il ne reste que l’abonnement, sans engagement</span>.</p>
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
          <p><span data-order="next-label">À la réception : le reste, et votre forfait</span><b data-order="next">${euro(t0.price - acompte0)} + ${euro(f0.month + C.DOM)}/mois</b></p>
        </div>
        <p class="b-sum-note">${icon('check')}<span data-avec-formule>Votre forfait démarre à la réception de votre site, pas avant. Si on vous fournit le nom de domaine, il est réservé dès la commande.</span><span data-seule-txt hidden>${esc(AUTO.name)} : pas d’abonnement. À la réception, on vous remet votre site, prêt à installer.</span></p>
      </div>
      <div class="o-next reveal">
        <h2 class="h3">${icon('list-checks')}Ce qui se passe ensuite</h2>
        <ol>${nextSteps.map(([ic, t, d]) => `<li${ic === 'globe' ? ' data-avec-formule' : ''}>${icon(ic)}<span><strong>${t}</strong><small>${d}</small></span></li>`).join('')}</ol>
        <p class="o-help">Une question avant de commander ? ${C.btnWa('btn-light btn-sm', 'Nous écrire')}</p>
      </div>
    </aside>
  </div>
</div></section>`;
  return {
    path: S.path,
    section: 'commander',
    bodyClass: 'page-commander',
    noindex: true,
    noMobileBar: true,
    title: 'Votre commande | Les Minis Monstres',
    description: 'Vérifiez votre site, choisissez Autonomie ou Mini, donnez vos coordonnées et payez en ligne en toute sécurité. Aujourd’hui, vous réglez seulement l’acompte.',
    crumbs,
    body,
  };
}

// ====================================================================== COMMANDE CONFIRMÉE
function confirmationPage() {
  const S = sections.confirmation;
  const delaiList = types.map((t) => `${t.delai} pour ${C.unType(t)}`).join(', ');
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
      { t: 'On vous écrit sous 24 heures', d: 'Pour fixer le rendez-vous téléphonique de découverte.' },
      { t: 'Votre nom de domaine est prêt', d: `Vous gardez le vôtre, ou on vous en fournit un, à votre nom, avec le forfait ${ABO.name}.` },
      { t: 'Votre espace client arrive par e-mail', d: 'Vous y suivez votre commande et, ensuite, vos demandes de modification.' },
      { t: 'Votre site est prêt', d: `Dans le délai de votre site : ${delaiList}.` },
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
    description: 'Merci pour votre commande. On vous écrit sous 24 heures pour le rendez-vous de découverte, et votre espace client arrive par e-mail.',
    body,
  };
}

// ====================================================================== FIDÉLITÉ
function fidelitePage() {
  const crumbs = crumb('fidelite');
  const perks = [
    ['butter', 'badge-percent', 'Deuxième site', `${fidelite.remiseSecondSite} % sur la création`, `Un deuxième site ? Sa création coûte ${fidelite.remiseSecondSite} % de moins, quel que soit le site. Par exemple, un ${ESS.name} à ${euro(ESS.price * (100 - fidelite.remiseSecondSite) / 100)} au lieu de ${euro(ESS.price)}.`],
  ];
  const body = `${C.pageHero({
    section: 'fidelite',
    h1: 'Fidélité : merci de nous faire confiance',
    lead: 'Un petit avantage, simple et affiché.',
    crumbs,
  })}
<section class="section"><div class="container">
  <div class="perks perks-1">${perks
    .map(([c, ic, t, big, d]) => `<article class="perk c-${c} reveal"><span class="perk-ico">${icon(ic)}</span><p class="perk-kind">${t}</p><h2>${big}</h2><p>${d}</p></article>`)
    .join('')}</div>
  <p class="center more">${C.btn(sections.forfaits.path, 'btn-light', sections.forfaits.icon, 'Voir les tarifs')}</p>
</div></section>
${C.ctaBand()}`;
  return {
    path: sections.fidelite.path,
    section: 'fidelite',
    noindex: true, // plus de parrainage : la page reste à son adresse, très courte, sans lien depuis le site
    title: 'Fidélité : un deuxième site à prix réduit | Les Minis Monstres',
    description: `Vous avez déjà un site chez les Minis Monstres ? La création d’un deuxième site coûte ${fidelite.remiseSecondSite} % de moins, quel que soit le site choisi.`,
    crumbs,
    body,
    priority: 0.3,
  };
}

// Les petits mots de la bande, dans l'espace client : un monstre, un message court et un petit visuel.
// Les monstres viennent de config.bande (prénom, métier, dessin).
const DEMO_MSGS = [
  { qui: 'Bricou', quand: 'ce matin', titre: 'Votre demande est chez Alex', texte: '« Fermé le lundi 24 novembre » : c’est clair, je l’ai envoyée à Alex.' },
  { qui: 'Bricou', quand: 'hier', titre: 'Modification en ligne', texte: 'Vos horaires d’été sont à jour sur la page Contact.', vis: 'voyants' },
  { qui: 'Mirette', quand: 'lundi', titre: 'Votre page de visibilité Google est en ligne', texte: '« Gâteau d’anniversaire à Rethel » est intégrée à votre site.', vis: 'google' },
];
function msgVisuel(x) {
  switch (x.vis) {
    case 'google': return `<div class="msg-vis msg-google" aria-hidden="true"><small>patisserie-lila.fr › anniversaire</small><b>Gâteau d’anniversaire à Rethel | Pâtisserie Lila</b><span>Gâteaux sur commande, à partager…</span></div>`;
    case 'voyants': return `<div class="msg-vis msg-voyants" aria-hidden="true"><span>${icon('check')}En ligne</span><span>${icon('lock')}HTTPS</span><span>${icon('zap')}Rapide</span></div>`;
    default: return '';
  }
}
function bandeMessages() {
  const art = (b) => (b.monstre === 'lia' ? monster('coucou') : C.petit(b.monstre));
  return `<div class="msgs" data-msgs>
  <p class="app-sub">Les petits mots de la bande</p>
  ${DEMO_MSGS.map((x) => {
    const b = bande.find((m) => m.nom === x.qui);
    return `<article class="msg">
    <span class="msg-art">${art(b)}</span>
    <div class="msg-corps">
      <p class="msg-qui"><strong>${esc(b.nom)}</strong><small>${esc(b.role)} · ${esc(x.quand)}</small></p>
      <p class="msg-titre">${esc(x.titre)}</p>
      <p class="msg-txt">${esc(x.texte)}</p>
      ${msgVisuel(x)}
    </div>
  </article>`;
  }).join('')}
</div>`;
}

// La démo de l'espace client : « Pâtisserie Lila », une cliente imaginaire, avec un Site Visibilité et Mini.
// Onglets : Accueil, Demandes (Bricou clarifie la demande, Alex fait la modification), Extras (présentés par Pépite), Ma boutique (verrouillé sans Site Boutique,
// avec son sous-menu en gros boutons : cases radio et CSS, sans script), Mon compte. Plus d'onglet « Mon site » ni de parrainage.
// Les attributs data-* sont ceux que lit src/assets/js/main.js (data-tab, data-go, data-req, data-reqs, data-log, data-toast-msg…).
function monEspacePage() {
  const tab = (id, ic, label, on) => `<button type="button" role="tab" id="tab-${id}" aria-controls="t-${id}" aria-selected="${on ? 'true' : 'false'}"${on ? '' : ' tabindex="-1"'} data-tab="${id}">${icon(ic)}<span>${label}</span></button>`;
  const extras = C.EXTRAS_PAR_FAMILLE.flatMap((g) => g.items);
  const extraBtn = (x) => (x.devis
    ? `<button type="button" class="btn btn-light btn-sm" data-toast-msg="Demande de devis envoyée : on vous répond avec un prix (démo)"><span>Demander un devis</span></button>`
    : `<button type="button" class="btn btn-primary btn-sm" data-toast-msg="Paiement par carte, tout de suite : ${euro(x.fois)} (démo)"><span>Commander</span></button>`);
  // Les articles de la démo : [nom, prix, dessin, description]. Les vignettes sont de petits dessins pastel, sans image externe.
  const articles = [
    ['Tarte aux fraises', '4,50 €', 'tarte', 'Une pâte sablée, une crème légère et des fraises fraîches. À la part, à emporter.'],
    ['Éclair au chocolat', '3,20 €', 'eclair', 'Pâte à choux, crème au chocolat noir et glaçage brillant.'],
    ['Gâteau d’anniversaire, 8 parts', '32 €', 'gateau', 'Génoise, crème vanille et fruits rouges. À commander 48 h à l’avance.'],
  ];
  const VIGNETTE = {
    tarte: '<rect width="64" height="64" rx="14" fill="#FFE8F1"/><ellipse cx="32" cy="42" rx="22" ry="9" fill="#F3C98B"/><path d="M10 42c0-9 10-15 22-15s22 6 22 15z" fill="#FFF6CF"/><circle cx="22" cy="34" r="5" fill="#FF6F91"/><circle cx="32" cy="30" r="5" fill="#FF8FA9"/><circle cx="42" cy="34" r="5" fill="#FF6F91"/><circle cx="27" cy="39" r="4" fill="#FF8FA9"/><circle cx="37" cy="39" r="4" fill="#FF6F91"/><path d="M31 25l1-3 1 3z" fill="#7EDDB5"/>',
    eclair: '<rect width="64" height="64" rx="14" fill="#DDF0FF"/><rect x="9" y="30" width="46" height="16" rx="8" fill="#F3C98B"/><path d="M11 34a8 8 0 0 1 8-8h26a8 8 0 0 1 8 8v1H11z" fill="#7A4B3A"/><path d="M18 30h14" stroke="#B98A75" stroke-width="2.500" stroke-linecap="round"/><rect x="12" y="38" width="40" height="3" rx="1.500" fill="#FFF6CF"/>',
    gateau: '<rect width="64" height="64" rx="14" fill="#EEE7FF"/><rect x="13" y="34" width="38" height="16" rx="5" fill="#FFD9E6"/><rect x="18" y="24" width="28" height="12" rx="5" fill="#FFF6CF"/><path d="M13 40c5 4 8-3 13 0s8-3 12 0 8-3 13 0" fill="none" stroke="#FF8FB8" stroke-width="3" stroke-linecap="round"/><rect x="30.500" y="13" width="3" height="11" rx="1.500" fill="#B9A6FF"/><path d="M32 6c3 3 2 6 0 7-2-1-3-4 0-7z" fill="#FFD45E"/>',
  };
  const vignette = (k) => `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${VIGNETTE[k].replace(/\.500/g, '.5')}</svg>`;
  // Une carte d'article, comme dans le vrai espace client : fermée, on voit la vignette, le nom, le prix et « En ligne » ;
  // ouverte (« Modifier »), on voit le formulaire rempli : photo, nom, description, prix.
  const articleCarte = ([nom, prix, dessin, desc], i) => `<details class="art-carte"${i === 0 ? ' open' : ''}>
                <summary><span class="art-vignette">${vignette(dessin)}</span><span class="art-txt"><strong>${nom}</strong><b>${prix}</b><em class="st st-done">En ligne</em></span><span class="art-modifier">${icon('pen-tool')}<span>Modifier</span></span></summary>
                <div class="art-form">
                  <div class="art-photo"><span class="art-vignette">${vignette(dessin)}</span><button type="button" class="btn btn-light btn-sm" data-toast-msg="Dans votre vrai espace : choisissez une photo sur votre téléphone (démo)">${icon('image-plus')}<span>Changer la photo</span></button></div>
                  <div class="field"><label for="art-nom-${i}">Nom</label><input id="art-nom-${i}" type="text" value="${nom}" maxlength="80"></div>
                  <div class="field"><label for="art-desc-${i}">Description</label><textarea id="art-desc-${i}" rows="3" maxlength="400">${desc}</textarea></div>
                  <div class="field art-prix"><label for="art-prix-${i}">Prix (en €)</label><input id="art-prix-${i}" type="text" inputmode="decimal" value="${prix.replace(' €', '')}" maxlength="10"></div>
                  <button type="button" class="btn btn-primary" data-toast-msg="Enregistré (démo)">${icon('check')}<span>Enregistrer</span></button>
                </div>
              </details>`;
  // Le sous-menu de « Ma boutique », comme dans le vrai espace client
  const BQ = [['articles', 'shopping-bag', 'Mes articles'], ['prix', 'tag', 'Mes prix'], ['paiements', 'credit-card', 'Paiements'], ['livraison', 'package', 'Livraison'], ['commandes', 'clipboard-check', 'Commandes'], ['promos', 'badge-percent', 'Promos']];
  const body = `${C.pageHero({
    section: 'monespace',
    h1: 'Mon espace : la démo',
    lead: 'Voici l’espace de « Pâtisserie Lila », une cliente imaginaire. Essayez : envoyez une demande, regardez les extras, ouvrez Ma boutique. Rien n’est envoyé.',
    crumbs: DEMO_CRUMBS,
  })}
<section class="section section-app"><div class="container">
  <div class="app" data-app>
    <div hidden data-lia-chat="demo" data-prix="${jetonsLia.bulle.jetons}" data-solde="0" data-uid="demo" data-sans-energie="1"></div>
    <div hidden data-lia-demo>
      <p data-mots="horaire,fermé,ferme,ouvert,ouvre,hours,closed,open" data-type="demande" data-par="lia" data-cout="0" data-texte="Sur la page Contact, changer les horaires : nous serons fermés le lundi 24 novembre.">Coucou ! Pour changer tes horaires, c’est Bricou qu’il te faut : écris-lui dans l’onglet Demandes, il prépare tout pour Alex. Je t’ai mis ta phrase juste ici, c’est bien ça ?</p>
      <p data-mots="photo,image,picture" data-type="demande" data-par="lia" data-cout="0" data-texte="Sur la page d’accueil, remplacer la photo du haut par celle que je joins.">Avec plaisir ! Une nouvelle photo en haut de l’accueil, bonne idée. Tu pourras la joindre juste avant d’envoyer ta demande à Bricou.</p>
      <p data-mots="google,visibilité,visibilite,extra,traduction,anglais" data-type="onglet" data-onglet="extras" data-nom="Extras">Super question ! Une page de visibilité Google coûte ${euro(PRIX_PAGE)}, payée une fois, par carte. La traduction anglaise et les fonctionnalités spécifiques sont sur devis. Pépite t’attend dans l’onglet Extras !</p>
      <p data-mots="combien,reste,limite,modification,comment,how,limit" data-type="onglet" data-onglet="demandes" data-nom="Demandes">Avec le forfait ${esc(ABO.name)}, tes modifications sont incluses. Tu écris ce que tu veux changer, ${esc(C.BRICOU)} clarifie ta demande avec toi, puis il l’envoie à Alex, qui fait la modification. Une demande à la fois.</p>
      <p data-mots="boutique,vendre,panier,shop,sell" data-type="demande" data-par="alex" data-texte="Je voudrais vendre en ligne. Pouvez-vous me dire comment passer au ${esc(BOU.name)} ?">Oh, quel beau projet ! Pour vendre en ligne, il te faut le ${esc(BOU.name)} : une boutique complète, un panier et le paiement sécurisé. Tu gères ton catalogue toi-même, sans limite d’articles. Voici ton message, c’est bien ça ?</p>
      <p data-defaut>Coucou ! Dans ton vrai espace, je réponds à tes questions et je te guide. Essaie par exemple : changer mes horaires.</p>
    </div>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user">${monster('mascotte')}<div><strong>Pâtisserie Lila</strong><small>patisserie-lila.fr</small></div></div>
        <p class="app-badge">${icon('wrench')}<span>Modifications incluses</span></p>
        <div class="app-tabs" role="tablist" aria-label="Mon espace">
          ${tab('accueil', 'house', 'Accueil', true)}
          ${tab('demandes', 'message-circle', 'Demandes')}
          ${tab('extras', 'sparkles', 'Extras')}
          ${tab('boutique', 'shopping-bag', 'Ma boutique')}
          ${tab('forfait', 'circle-user', 'Mon compte')}
        </div>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bonjour Lila !</h2>
          <div class="app-cards">
            <button type="button" class="app-card c-${VIS.color}" data-go="forfait"><span class="app-card-art">${C.petit(VIS.monstre)}</span><span><small>Votre site</small><strong>${esc(VIS.name)}</strong><span class="dot-ok">En ligne</span></span></button>
            <button type="button" class="app-card c-${ABO.color}" data-go="forfait"><span class="app-card-art">${C.petit('maxi')}</span><span><small>Votre forfait</small><strong>Forfait ${esc(ABO.name)}</strong><span>${euro(ABO.month + C.DOM)} par mois, nom de domaine fourni</span></span></button>
            <button type="button" class="app-card c-sky" data-go="extras"><span class="app-card-ico">${icon('sparkles')}</span><span><small>Envie d’aller plus loin ?</small><strong>Les extras</strong><span>Voir les trois extras</span></span></button>
          </div>
          ${bandeMessages()}
          <div class="cerise-box"><span aria-hidden="true">${monster('coucou')}</span><div>
            <p>Écrire à Cerise<small>Une question, une modification ? Elle vous répond tout de suite et prépare votre demande.</small></p>
            <form class="cerise-form" data-cerise-form><input type="text" maxlength="600" placeholder="Ex. : nous serons fermés lundi" aria-label="Votre message à Cerise"><button class="btn btn-primary btn-sm" type="submit">${icon('send')}<span>Envoyer</span></button></form>
            <div class="cerise-ideas">${['Changer mes horaires', 'Ajouter une photo sur mon site', 'Une page de visibilité Google', 'Vendre en ligne'].map((x) => `<button type="button" data-cerise-idee>${x}</button>`).join('')}</div>
          </div></div>
          <p class="app-sub">Dernières activités</p>
          <ul class="app-log" data-log>
            <li>${icon('check')}<span>Horaires d’été mis à jour</span><small>il y a 2 jours</small></li>
            <li>${icon('file-text')}<span>Page « Gâteau d’anniversaire à Rethel » mise en ligne</span><small>lundi</small></li>
          </ul>
        </div>

        <div class="app-panel" role="tabpanel" id="t-demandes" aria-labelledby="tab-demandes" hidden>
          <h2 class="app-h">Demandes</h2>
          <div class="demo-bricou"><span aria-hidden="true">${C.petit('bricou', { humeur: 'ravi' })}</span><p><strong>Une modification ? Dites-le à ${esc(C.BRICOU)}</strong><small>Il prépare votre demande, puis Alex fait la modification.</small></p></div>
          <form class="req-form" data-req>
            <div class="field"><label for="req-txt">Votre demande</label><textarea id="req-txt" rows="3" placeholder="Ex. : nous serons fermés le lundi 24 novembre"></textarea></div>
            <label class="req-photo"><input type="file" accept="image/*" class="sr-only" data-req-file>${icon('image-plus')}<span data-req-file-name>Ajouter une photo (facultatif)</span></label>
            <button class="btn btn-primary" type="submit">${icon('send')}<span>Envoyer ma demande</span></button>
          </form>
          <p class="app-sub">Suivi</p>
          <ul class="reqs" data-reqs>
            <li><span><strong>Horaires d’été</strong><small>envoyée le 10 novembre</small></span><em class="st st-done">Faite</em></li>
            <li><span><strong>Nouvelle photo de l’accueil</strong><small>envoyée le 3 novembre</small></span><em class="st st-done">Faite</em></li>
          </ul>
        </div>

        <div class="app-panel" role="tabpanel" id="t-extras" aria-labelledby="tab-extras" hidden>
          <h2 class="app-h">Extras</h2>
          ${C.presente('etoile', `<strong>Moi, c’est ${esc(C.PEPITE)}.</strong> Voici les trois extras. Une page de visibilité Google se paie par carte, tout de suite. Les deux autres sont sur devis.`, { humeur: 'ravi' })}
          <div class="app-opts">${extras.map((x) => `<div class="app-opt app-opt-once"><span class="app-opt-ico">${icon(x.icon)}</span><span class="app-opt-txt"><strong>${esc(x.name)}</strong><small>${esc(x.devis ? 'Sur devis' : `${euro(x.fois)} la page, payée une fois`)}</small><small>${inline(x.desc)}</small></span>${extraBtn(x)}</div>`).join('')}</div>
        </div>

        <div class="app-panel" role="tabpanel" id="t-boutique" aria-labelledby="tab-boutique" hidden>
          <h2 class="app-h">Ma boutique</h2>
          <div class="app-lock">${icon('lock')}<div><strong>Onglet verrouillé</strong><p>Il s’ouvre avec le ${esc(BOU.name)}. Pâtisserie Lila a un ${esc(VIS.name)} : voici ce qu’elle gérerait ici, elle-même.</p><button type="button" class="btn btn-light btn-sm" data-toast-msg="Demande envoyée : on vous répond avec un prix (démo)"><span>Passer au ${esc(BOU.name)}</span></button></div></div>
          <div class="bq">
            ${BQ.map(([id], i) => `<input type="radio" name="bq" id="bq-${id}" class="bq-r"${i === 0 ? ' checked' : ''}>`).join('')}
            <div class="bq-menu" role="group" aria-label="Les rubriques de Ma boutique">${BQ.map(([id, ic, nom]) => `<label for="bq-${id}">${icon(ic)}<span>${nom}</span></label>`).join('')}</div>
            <div class="bq-panel" data-bq="articles">
              <p class="art-ajout"><button type="button" class="btn btn-primary btn-sm" data-toast-msg="Nouvel article : une photo, un nom, une description, un prix (démo)">${icon('plus')}<span>Ajouter un article</span></button></p>
              <div class="art-cartes">${articles.map(articleCarte).join('')}</div>
              <p class="app-note">Pour chaque article : une photo, un nom, une description, un prix. Autant d’articles que vous voulez.</p>
            </div>
            <div class="bq-panel" data-bq="prix">
              <ul class="ranks ranks-pages">${articles.map(([n, pr]) => `<li><span>${n}</span><b>${pr}</b></li>`).join('')}</ul>
              <p class="app-note">Vous changez un prix quand vous voulez. Un prix en promotion s’affiche barré, tout seul.</p>
            </div>
            <div class="bq-panel" data-bq="paiements">
              <ul class="reqs">
                <li><span><strong>Stripe (carte bancaire)</strong><small>paiement en ligne sécurisé</small></span><em class="st st-done">Actif</em></li>
                <li><span><strong>PayPal</strong><small>s’installe en un clic</small></span><em class="st st-new">Pas installé</em></li>
                <li><span><strong>Virement</strong><small>votre client reçoit vos coordonnées bancaires</small></span><em class="st st-done">Actif</em></li>
                <li><span><strong>Chèque</strong><small>si vous préférez</small></span><em class="st st-done">Actif</em></li>
              </ul>
            </div>
            <div class="bq-panel" data-bq="livraison">
              <ul class="reqs">
                <li><span><strong>Livraison à prix fixe</strong><small>5,90 € par commande</small></span><em class="st st-done">Actif</em></li>
                <li><span><strong>Livraison gratuite</strong><small>à partir de 50 € d’achat</small></span><em class="st st-done">Actif</em></li>
                <li><span><strong>Retrait sur place</strong><small>gratuit : votre client vient chercher sa commande</small></span><em class="st st-done">Actif</em></li>
              </ul>
            </div>
            <div class="bq-panel" data-bq="commandes">
              <ul class="reqs demo-commandes">
                <li><span><strong>Commande n° 1042</strong><small>Gâteau d’anniversaire, 8 parts · 32 €</small></span><em class="st st-new">Payée</em><span class="demo-cmd-btns"><button type="button" class="btn btn-light btn-sm" data-toast-msg="Commande n° 1042 : en préparation (démo)">${icon('clock')}<span>Je la prépare</span></button><button type="button" class="btn btn-primary btn-sm" data-toast-msg="Commande n° 1042 : expédiée ou remise, votre client est prévenu (démo)">${icon('check')}<span>Expédiée ou remise</span></button></span></li>
                <li><span><strong>Commande n° 1041</strong><small>6 éclairs au chocolat · 19,20 €</small></span><em class="st st-done">Expédiée ou remise</em></li>
              </ul>
              <p class="app-note">Quand vous marquez une commande « Expédiée ou remise », votre client reçoit un e-mail.</p>
            </div>
            <div class="bq-panel" data-bq="promos">
              <ul class="reqs">
                <li><span><strong>Code BIENVENUE10</strong><small>10 % sur la première commande</small></span><em class="st st-done">Actif</em></li>
                <li><span><strong>Bandeau d’annonce</strong><small>« Livraison offerte ce week-end »</small></span><em class="st st-new">Éteint</em></li>
              </ul>
              <p class="app-note">Codes promo, soldes et bandeau en haut du site : vous les allumez et les éteignez vous-même.</p>
            </div>
          </div>
          <p class="app-note">Exemple inventé, pour la démo.</p>
        </div>

        <div class="app-panel" role="tabpanel" id="t-forfait" aria-labelledby="tab-forfait" hidden>
          <h2 class="app-h">Mon compte</h2>
          <p class="app-sub">Votre forfait</p>
          <p class="app-domain">${icon('shield-check')}<span><strong>Le forfait ${esc(ABO.name)}, ${euro(ABO.month + C.DOM)} par mois</strong><small>${euro(ABO.month)} pour le forfait, et ${euro(C.DOM)} pour le nom de domaine qu’on vous fournit. Sans engagement.</small></span></p>
          <p class="app-note">Vous préférez tout gérer vous-même ? Vous passez en ${esc(AUTO.name)} quand vous voulez : ${euro(AUTO.month)} par mois, et vous repartez avec votre site.</p>
          <p class="app-sub">Factures</p>
          <ul class="invoices">
            <li><span>Novembre 2026</span><button type="button" class="link-btn" data-toast-msg="Facture téléchargée (démo)">PDF</button></li>
            <li><span>Octobre 2026</span><button type="button" class="link-btn" data-toast-msg="Facture téléchargée (démo)">PDF</button></li>
          </ul>
          <p class="app-sub">Nom de domaine</p>
          <p class="app-domain">${icon('globe')}<span><strong>patisserie-lila.fr</strong><small>À votre nom, fourni avec le forfait ${esc(ABO.name)} : ${euro(C.DOM)} par mois</small></span></p>
        </div>

      </div>
    </div>
    <p class="app-toast" data-toast role="status" hidden></p>
    <template data-icons>${['check', 'message-circle', 'history'].map((n) => `<span data-i="${n}">${icon(n)}</span>`).join('')}</template>
  </div>
</div></section>

${C.ctaBand({ title: 'Ça vous plaît ?', text: 'Créez votre site : on vous rend visible, vous envoyez vos demandes, et on s’occupe du reste.' })}`;
  return {
    path: '/mon-espace/demo/',
    section: 'monespace',
    noindex: true,
    noMobileBar: true,
    title: 'Mon espace, la démo | Les Minis Monstres',
    description: 'Essayez l’espace client des Minis Monstres : demandes de modification, extras, votre boutique et votre compte. Une démonstration sans compte.',
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
            <select id="c-type" name="type" required><option value="">Choisir…</option>${types.map((t) => opt(t.label)).join('')}${opt('Je ne sais pas encore')}${opt('Autre projet')}</select></div>
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
    <a class="contact-card" href="${sections.forfaits.path}">${icon(sections.forfaits.icon)}<div><strong>Voir les tarifs</strong><span>Trois sites, dès ${euro(creation.prix)}. Puis ${euro(AUTO.month)} ou ${euro(ABO.month)} par mois, au choix.</span></div></a>
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

// ====================================================================== GUIDES (pages utiles pour le référencement)
const guideCard = (g) => `<a class="guide-card reveal" href="/guides/${g.slug}/"><span class="type-ico">${icon(g.icon)}</span><span class="guide-card-text"><strong>${inline(g.nom)}</strong><span>${inline(g.resume)}</span></span>${icon('arrow-right')}</a>`;

function guidesHub() {
  const crumbs = crumb('guides');
  const body = `${C.pageHero({
    section: 'guides',
    h1: 'Guides : tout comprendre avant de créer votre site',
    lead: 'Des explications simples pour créer votre site et devenir visible. Pas de jargon, pas de blabla : ce qu’il faut savoir, et rien d’autre.',
    crumbs,
  })}
${GUIDES.groupes
  .map(
    (gr, i) => `<section class="section${i % 2 ? ' section-soft' : ''}"><div class="container">
  <h2 class="section-title">${gr.titre}</h2>
  <p class="section-lead">${inline(gr.texte)}</p>
  <div class="guide-cards">${GUIDES.guides.filter((g) => g.groupe === gr.id).map(guideCard).join('')}</div>
</div></section>`
  )
  .join('\n')}
${C.ctaBand({ title: 'Vous avez votre réponse ?', text: 'Il ne manque que votre vitrine sur internet. Choisissez votre site en deux minutes : le prix s’affiche avant de commander.' })}`;
  return {
    path: '/guides/',
    section: 'guides',
    title: 'Guides pour créer son site, sans jargon | Les Minis Monstres',
    description: 'Prix d’un site, nom de domaine, fiche Google, boutique en ligne, site pour artisan, restaurant ou association : des guides simples pour décider sans se tromper.',
    crumbs,
    body,
    schema: [{ '@type': 'ItemList', itemListElement: GUIDES.guides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.nom, url: site.url + '/guides/' + g.slug + '/' })) }],
    priority: 0.8,
  };
}

function guidePage(g) {
  const path = `/guides/${g.slug}/`;
  const crumbs = [...crumb('guides'), { name: g.nom, path }];
  const f = C.faq(g.faq, 'Vos questions', 'faq-guide');
  const voir = g.voir.map((s) => GUIDES.guides.find((x) => x.slug === s)).filter(Boolean);
  const body = `${C.pageHero({ section: 'guides', h1: g.h1, lead: g.lead, crumbs })}
<section class="section"><div class="container container-narrow prose reveal">
  ${md(g.body)}
</div></section>
${f.html}
<nav class="related" aria-label="À lire aussi"><div class="container"><h2 class="section-title">À lire aussi</h2><div class="guide-cards">${voir.map(guideCard).join('')}</div><p class="center"><a class="link-more" href="/guides/">Tous les guides</a></p></div></nav>
${C.ctaBand({ text: CTA_TEXTE })}`;
  return {
    path,
    section: 'guides',
    title: g.title,
    description: g.description,
    crumbs,
    body,
    schema: [
      {
        '@type': 'Article',
        '@id': site.url + path + '#article',
        headline: g.h1,
        description: g.description,
        inLanguage: 'fr-FR',
        datePublished: GUIDES.PUBLIE,
        dateModified: GUIDES.PUBLIE,
        author: { '@id': site.url + '/#entreprise' },
        publisher: { '@id': site.url + '/#entreprise' },
        image: site.url + '/assets/img/og-image.png',
        mainEntityOfPage: { '@id': site.url + path + '#page' },
      },
      f.schema,
    ],
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
  <p class="center"><a class="link-more" href="/guides/">Et nos guides pour créer votre site</a></p>
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
    lead: `Alex conçoit votre site et vérifie tout. Avec lui, ${NB_BANDE} petits monstres, chacun son métier. Leur but commun : vous rendre visible.`,
    crumbs,
  })}
<section class="section section-bande" id="bande"><div class="container">
  <div class="alex-bulle reveal"><span class="alex-art">${C.alexPortrait({ title: 'Alex' })}</span><p><strong>Moi, c’est Alex.</strong> Je conçois votre site pour qu’il vous rende visible, je vérifie tout et je reste votre interlocuteur. Avec moi, les Minis Monstres : ${bande.map((b) => b.nom).join(', ').replace(/, ([^,]*)$/, ' et $1')}. Rien ne part en ligne sans mon accord.</p></div>
  ${C.bandeGrid({ complet: true })}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Comment on travaille</h2>
  <div class="feats feats-3">
    <div class="feat reveal">${icon('list-checks')}<h3>Une méthode rodée</h3><p>Un appel pour vous connaître, puis votre site est construit étape par étape. Vous le voyez avant la mise en ligne.</p></div>
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
    description: `Alex conçoit chaque site et vérifie tout. Avec lui, ${NB_BANDE} petits monstres, chacun son métier : ${bande.map((b) => b.nom).join(', ')}. Faites connaissance.`,
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
  <p class="center muted">Votre métier n’est pas dans la liste ? Les <a href="/guides/">guides</a> parlent aussi des restaurants, des instituts et des auto-entrepreneurs. Et vous pouvez <a href="${C.contactUrl}">nous écrire</a>.</p>
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
  const g = GUIDES.guides.find((x) => '/guides/' + x.slug + '/' === path);
  if (g) return [g.nom, g.resume, g.icon];
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
  // Conseils d'une page métier : un des trois sites (une-page, vitrine, boutique), Mini (base) ou un extra (packseo…). Le reste est ignoré.
  const opts = (m.options || []).map((o) => {
    const ty = T(o.id);
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
${f.html}
${voirCards(m.voir || [])}
${C.ctaBand({ title: 'On vous rend visible ?', text: `Choisissez votre site en deux minutes : dès ${euro(creation.prix)}, prix affichés. Ou écrivez-nous pour en parler d’abord.` })}`;
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
  const body = `${C.pageHero({ section: k || 'guides', h1: p.h1, lead: p.lead, crumbs })}
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
    ['sites', 'layout-template', 'Les trois sites'],
    ['prix', sections.forfaits.icon, 'Le prix'],
    ['espace', 'circle-user', 'L’espace client'],
    ['demandes', 'message-circle', 'Demander une modification'],
    ['jetons', 'sparkles', 'La petite bande'],
    ['tableau', 'gauge', 'Mon site : vos chiffres'],
    ['messages', 'plus', 'Les extras'],
    ['boutique', 'shopping-bag', 'Le Site Boutique'],
    ['seo', 'search-check', 'Être trouvé sur Google'],
    ['paiement', 'credit-card', 'Paiement et fidélité'],
  ];
  const tabs = [
    ['house', 'Accueil', 'votre site, votre formule et les petits mots de la bande.'],
    ['package', 'Ma commande', 'le suivi de la création de votre site, étape par étape.'],
    ['message-circle', 'Demandes', `vous écrivez ce qu’il faut changer, ${C.BRICOU} clarifie votre demande, Alex fait la modification, et vous suivez où ça en est.`],
    ['sparkles', 'Extras', `les trois extras, présentés par ${C.PEPITE} : page de visibilité Google, traduction anglaise, fonctionnalité spécifique.`],
    ['shopping-bag', 'Ma boutique', `vos articles, vos prix, vos paiements, la livraison, vos commandes et vos promos. Il s’ouvre avec le ${BOU.name}.`],
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
    <li><strong>Vous choisissez votre site.</strong> ${types.map((t) => esc(t.name)).join(', ')} : le prix total s’affiche avant de commander.</li>
    <li><strong>Vous réglez un acompte de ${paiement.acompte} %.</strong> C’est le signal de départ.</li>
    <li><strong>On s’appelle.</strong> Un rendez-vous téléphonique pour découvrir votre activité.</li>
    <li><strong>Vous remplissez le questionnaire de création.</strong> Dans votre espace client : couleurs, ambiance, photos, prix ou produits.</li>
    <li><strong>Votre site est créé.</strong> Vous demandez des changements autant de fois qu’il le faut, jusqu’à ce que vous le validiez.</li>
    <li><strong>Vous recevez votre site et payez le reste.</strong> En une fois, ou en ${C.lissageTxt} fois sans frais.</li>
    <li><strong>Ensuite, vous choisissez.</strong> Le forfait ${esc(ABO.name)}, ${euro(ABO.month)} par mois : on s’occupe de tout. Ou ${esc(AUTO.name)}, ${euro(AUTO.month)} : vous gérez tout vous-même.</li>
  </ol>
  <p class="doc-more">${C.btnCreer('btn-primary')}</p>`)}

${chap('lia-alex', `2. Cerise et Alex`, `  <h2>Deux pour s’occuper de vos demandes</h2>
  <div class="doc-duo-qui">
    <div class="doc-qui c-pink reveal"><span class="doc-qui-art">${monster('coucou')}</span><h3>Cerise, la secrétaire de la bande</h3><p>Elle répond à vos questions et vous aide à formuler vos demandes. Elle vous les fait relire, puis les transmet.</p></div>
    <div class="doc-qui c-sky reveal"><span class="doc-qui-art">${C.alexPortrait({ title: 'Alex' })}</span><h3>Alex</h3><p>Il conçoit votre site et vérifie tout. Il répond aussi à vos questions quand Cerise ne sait pas.</p></div>
  </div>
  <p class="doc-more">${C.btn(sections.equipe.path, 'btn-primary', sections.equipe.icon, 'Rencontrer la bande')} ${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>`)}

${chap('questionnaire', `3. Le questionnaire de création`, `  <h2>Ce qu’on vous demande pour créer votre site</h2>
  <p>Après votre commande, un questionnaire vous attend dans l’onglet « Ma commande ». Il est déjà prérempli avec vos coordonnées. Vous pouvez modifier vos réponses tant que le site n’est pas en ligne.</p>
  <div class="doc-brief">
    ${types.map((t, k) => `<details class="doc-brief-type"${k === 0 ? ' open' : ''}><summary>${icon(t.icon)}Pour un ${esc(t.name)}</summary>
      <ol class="doc-brief-sections">${BRIEF.pour(t.id).map((sec) => `<li><strong>${icon(sec.icon)}${esc(sec.titre)}</strong><ul>${sec.champs.map((c) => `<li><span>${esc(c.label)}${c.requis ? ' <em class="doc-req">à remplir</em>' : ''}</span>${briefDetail(c)}</li>`).join('')}</ul></li>`).join('')}</ol>
    </details>`).join('')}
  </div>`)}

${chap('sites', `4. Les trois sites`, `  <div class="container-narrow">
    <h2>Un site, un but, un prix</h2>
    <p>Chaque site vous rend visible à sa façon, et se paie une seule fois. Le prix ne change pas en cours de route. ${esc(C.PLUS_DE_PAGES)}</p>
  </div>
  <div class="doc-types">
    ${types.map((t) => `<div class="doc-type reveal"><strong>${esc(t.name)}</strong><b>${C.prixType(t)}</b><span>${icon('clock')}${esc(t.delai)}</span><p><strong>${esc(t.but)}.</strong> ${esc(t.pitch)}</p></div>`).join('')}
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
    <div class="doc-type reveal"><strong>Créer le site</strong><b>dès ${euro(creation.prix)}</b><span>${icon('wand-sparkles')}Une seule fois</span><p>${types.map((t) => `${esc(t.name)} ${euro(t.price)}`).join(', ')}. Payable en ${C.lissageTxt} fois sans frais.</p></div>
    <div class="doc-type reveal"><strong>${esc(AUTO.name)}</strong><b>${euro(AUTO.month)}</b><span>${icon('download')}Par mois</span><p>Vous gérez votre hébergement, votre nom de domaine, vos sauvegardes et vos mises à jour.</p></div>
    <div class="doc-type reveal"><strong>Forfait ${esc(ABO.name)}</strong><b>${euro(ABO.month)}</b><span>${icon('repeat')}Par mois, sans engagement</span><p>On s’occupe de tout, modifications incluses.</p></div>
    <div class="doc-type reveal"><strong>Les extras</strong><b>${euro(PRIX_PAGE)} la page</b><span>${icon('sparkles')}Ou sur devis</span><p>Page de visibilité Google, traduction anglaise, fonctionnalité spécifique. Depuis votre espace client.</p></div>
  </div>
  <div class="container-narrow">
    <h3>Ce que comprend le forfait ${esc(ABO.name)}</h3><ul class="list-check">${ABO.details.map((d) => `<li>${inline(d)}</li>`).join('')}</ul>
  </div>
  <div class="doc-cards3">
    <div class="doc-mini reveal"><strong>${icon('wrench')}Révisions jusqu’à validation</strong><p>Pendant la création, vous demandez des changements autant de fois qu’il le faut. Après la mise en ligne, les modifications passent par le forfait ${esc(ABO.name)}.</p></div>
    <div class="doc-mini reveal"><strong>${icon('search-check')}Page de visibilité Google</strong><p>${euro(PRIX_PAGE)} la page, payée une fois, par carte, depuis votre espace client.</p></div>
    <div class="doc-mini reveal"><strong>${icon('ticket')}Code promo</strong><p>Une seule case, à la commande. La remise s’applique sur la création du site.</p></div>
  </div>
  <p class="doc-more center">${C.btn(sections.forfaits.path, 'btn-light', sections.forfaits.icon, 'Voir les tarifs')}</p>`)}

${chap('espace', `6. L’espace client`, `  <div class="doc-split">
    <div>
      <h2>Tout votre site, au même endroit</h2>
      <p>Chaque client a son espace, sur téléphone comme sur ordinateur.</p>
      <ul class="doc-tabs">${tabs.map(([ic, t, d]) => `<li>${icon(ic)}<span><strong>${t}</strong> : ${d}</span></li>`).join('')}</ul>
      <p class="doc-note">Sans ${esc(BOU.name)}, l’onglet « Ma boutique » reste verrouillé.</p>
    </div>
    ${fig('espace', 'L’espace client : les onglets et la page d’accueil', 'L’accueil de l’espace client (exemple : « Pâtisserie Lila », une cliente imaginaire).')}
  </div>
  <p class="doc-more">${C.btn('/mon-espace/demo/', 'btn-light', 'eye', 'Essayer la démo')}</p>`)}

${chap('demandes', `7. Demander une modification`, `  <div class="doc-split doc-split-rev">
    ${fig('demandes', 'L’onglet Mes demandes', 'L’onglet « Mes demandes » : on écrit, on ajoute une photo si besoin, on suit l’avancement.')}
    <div>
      <h2>Vous demandez, on s’en charge</h2>
      <p>Avec le forfait ${esc(ABO.name)}, vos modifications sont incluses. Voici comment ça se passe :</p>
      <ol class="doc-steps">${C.ETAPES_MODIF.map(([, t, d]) => `<li><strong>${esc(t)}.</strong> ${esc(d)}</li>`).join('')}</ol>
      <ul class="list-check">
        <li>${esc(C.BRICOU)} clarifie votre demande, Alex fait la modification. Une demande à la fois.</li>
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
      ${C.EXTRAS_PAR_FAMILLE.flatMap((g) => g.items).map((x) => `<li><strong>${esc(x.name)}</strong>, ${x.devis ? 'sur devis' : `${euro(x.fois)} la page, payée une fois, par carte`}. ${inline(x.desc)}</li>`).join('')}
    </ul>
    <p>Tout se demande depuis l’onglet « Extras » de votre espace client.</p>
  </div>
  ${fig('messages', 'Les petits mots de la bande dans l’espace client', 'Dans l’espace client : les petits mots de la bande (exemple).', 'doc-fig-flat')}
  <p class="doc-more center">${C.btn(sections.forfaits.path + '#extras', 'btn-light', 'plus', 'Voir les extras')}</p>`)}

${chap('boutique', `10. Le ${esc(BOU.name)}`, `  <div class="container-narrow">
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
  <p>Tous les sites partent avec de bonnes bases : des pages rapides, lisibles sur téléphone, avec un titre et une description pour Google. Le ${esc(VIS.name)} va plus loin : jusqu’à ${creation.pages} pages, des pages de visibilité Google intégrées et le référencement local renforcé. Ensuite, chaque page de visibilité Google en plus coûte ${euro(PRIX_PAGE)}, payée une fois.</p>
  <div class="go-links">
    <a class="go-link c-${sections.seo.color}" href="${sections.seo.path}"><span class="type-ico">${icon(sections.seo.icon)}</span><strong>Être trouvé sur Google, en détail</strong>${icon('arrow-right')}</a>
    <a class="go-link c-${sections.guides.color}" href="${sections.guides.path}"><span class="type-ico">${icon(sections.guides.icon)}</span><strong>Les guides pratiques</strong>${icon('arrow-right')}</a>
    ${LEXIQUE.termes.length ? `<a class="go-link c-${sections.lexique.color}" href="${sections.lexique.path}"><span class="type-ico">${icon(sections.lexique.icon)}</span><strong>Le lexique</strong>${icon('arrow-right')}</a>` : ''}
    <a class="go-link c-${sections.confiance.color}" href="${sections.confiance.path}"><span class="type-ico">${icon(sections.confiance.icon)}</span><strong>Les pages créées pour nos clients</strong>${icon('arrow-right')}</a>
  </div>`)}

${chap('paiement', `12. Paiement`, `  <h2>Payer simplement</h2>
  <ul class="list-check">
    <li>Acompte de ${paiement.acompte} % à la commande, le reste à la réception du site, en une fois ou en ${C.lissageTxt} fois sans frais.</li>
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
    description: 'Tout comprendre en images : les trois sites, le prix, Autonomie ou Mini, les modifications, l’espace client, les extras et le Site Boutique.',
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
  // Les pages du parcours de commande (noindex) ne figurent pas dans le plan.
  // Outils et Documentation (noindex depuis la V2) restent dans le plan : les clients les cherchent.
  const hidden = ['commander', 'confirmation', 'fidelite', ...(OUTILS_ON ? [] : ['espace'])];
  const links = [
    ['/', 'Accueil'],
    ...Object.entries(sections).filter(([k]) => !hidden.includes(k)).map(([, s]) => [s.path, s.label]),
    ['/faq/', 'Questions fréquentes'],
    ...METIERS.map((m) => ['/' + m.slug + '/', 'Site internet : ' + m.nom.toLowerCase()]),
    ...PAGES_V2.filter((p) => !Object.values(sections).some((x) => x.path === p.path)).map((p) => [p.path, p.nom]),
    ...GUIDES.guides.map((g) => ['/guides/' + g.slug + '/', g.nom]),
    ...legal.map((l) => [l.path, l.name]),
  ];
  return {
    path: '/plan-du-site/',
    title: 'Plan du site | Les Minis Monstres',
    description: 'Toutes les pages du site des Minis Monstres : créer mon site, tarifs, réalisations, votre métier, accompagnement, guides, contact, FAQ et pages légales.',
    crumbs,
    body: `${C.pageHero({ h1: 'Plan du site', lead: 'Toutes les pages du site, au même endroit.', crumbs })}
<section class="section"><div class="container container-narrow"><ul class="sitemap-list">${links.map(([p, l]) => `<li><a href="${p}">${esc(l)}</a></li>`).join('')}</ul></div></section>`,
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
    ...(OUTILS_ON ? [outilsPage()] : []),
    confiancePage(),
    equipePage(),
    // V2 : pages métier, réassurance, guides de fond, page locale (remplacent /methode/ et /lia-et-alex/)
    ...(METIERS.length ? [metiersHub(), ...METIERS.map(metierPage)] : []),
    ...PAGES_V2.map(pageV2),
    docPage(),
    guidesHub(), ...GUIDES.guides.map(guidePage),
    ...(LEXIQUE.termes.length ? [lexiqueHub(), ...LEXIQUE.termes.map(lexiquePage)] : []),
    ...legal.map(legalPage), planDuSite(), merci(), notFound(),
  ];
}

module.exports = { build };
