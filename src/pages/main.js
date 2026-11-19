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
// L'abonnement à l'année, et « une modification » (par Alex, chaque mois) écrit en toutes lettres
const ABO_AN = C.year(ABO.month);
const UNE_MODIF = ABO.quota === 1 ? 'une intervention' : `${ABO.quota} interventions`;
// « par trimestre » (V2) ou « par mois »
const PAR_PERIODE = ABO.periode === 'trimestre' ? 'par trimestre' : 'par mois';
// Texte des appels à l'action de bas de page
const CTA_TEXTE = 'Choisissez votre site en deux minutes. Vous voyez le prix tout de suite, et vous commandez quand vous êtes prêt.';
// Champs cachés communs aux formulaires : horodatage anti-robot et champ piège.
function formHidden() {
  return `<input type="hidden" name="_t" value=""><div class="hp" aria-hidden="true"><label>Site web <input type="text" name="site_web" tabindex="-1" autocomplete="off"></label></div>`;
}

// ====================================================================== ACCUEIL
// La phrase principale d'abord (config.phrase), puis le positionnement (un site, un but), les prix en clair,
// la bande, et pourquoi c'est moins cher. Peu de blocs : la plupart des visiteurs sont sur téléphone.
function home() {
  const titre = C.phrase.titre.replace('une rue où personne ne passe', '<mark>une rue où personne ne passe</mark>');
  const body = `<section class="hero">
  <div class="container hero-in">
    <div class="hero-text">
      <h1>${titre}</h1>
      <p class="hero-lead">${esc(C.phrase.suite)}</p>
      <div class="hero-ctas">${C.btnCreer('btn-primary btn-lg btn-flaque')}${C.btn(sections.forfaits.path, 'btn-light btn-lg', sections.forfaits.icon, 'Voir les tarifs')}</div>
      <ul class="hero-points">
        <li>${icon('check')}Dès ${euro(creation.prix)}, prix affichés</li>
        <li>${icon('check')}Aucune obligation d’abonnement</li>
        <li>${icon('check')}Quelqu’un qui vous répond</li>
      </ul>
    </div>
    <div class="hero-art hero-scene" aria-hidden="true">
      <div class="scene-site">
        <p class="scene-bar"><i></i><i></i><i></i><span></span></p>
        <div class="scene-page">
          <b class="sc-t"></b><b class="sc-t sc-t2"></b><b class="sc-l"></b><b class="sc-l sc-l2"></b>
          <span class="sc-btn"></span>
          <div class="sc-cards"><i></i><i></i><i></i></div>
        </div>
      </div>
      <span class="scene-m sm-1">${C.petit('mochi')}</span>
      <span class="scene-m sm-2">${C.petit('fantome', { humeur: 'ravi' })}</span>
      <span class="scene-m sm-3">${C.petit('gelee')}</span>
      <span class="scene-m sm-4">${C.petit('bricou', { humeur: 'ravi' })}</span>
      <p class="hero-tag">${icon('sparkles')}Fait par Alex et les Minis Monstres</p>
    </div>
  </div>
</section>

<section class="section" id="en-bref"><div class="container">
  <h2 class="section-title">Trois sites, trois buts</h2>
  <p class="section-sub">Choisissez celui qui vous ressemble. Le prix est affiché, le même pour tous.</p>
  ${commun(C.positionnement())}
</div></section>

<section class="section section-soft" id="prix"><div class="container">
  <h2 class="section-title">Les prix, en clair</h2>
  <p class="section-sub">Votre site se paie une seule fois. Ensuite, c’est vous qui choisissez : ${euro(AUTO.month)} ou ${euro(ABO.month)} par mois.</p>
  ${commun(C.offre({ compact: true }))}
</div></section>

<section class="section" id="qui-fait-quoi"><div class="container">
  <h2 class="section-title">Qui fait quoi ?</h2>
  <p class="section-sub">Alex conçoit votre site et vérifie tout. Les Minis Monstres l’aident, chacun son métier.</p>
  ${C.bandeGrid({ prix: false })}
  <p class="center more">${C.btn(sections.equipe.path, 'btn-light btn-flaque', sections.equipe.icon, 'Rencontrer la bande')}</p>
</div></section>

<section class="section section-soft c-butter">${C.deco('etoile', 'haut-gauche', 'ravi')}<div class="container">
  <h2 class="section-title">Pourquoi c’est moins cher ?</h2>
  <p class="section-sub">Pas de magie. Trois choses simples.</p>
  <div class="feats feats-3">
    <div class="feat reveal">${icon('list-checks')}<h3>Une méthode rodée</h3><p>On fait le même travail soigné pour chaque site. On sait où on va, donc on va vite.</p></div>
    <div class="feat reveal">${icon('tag')}<h3>Des prix affichés</h3><p>Pas de devis, pas de rendez-vous commercial. Le prix est le même pour tout le monde.</p></div>
    <div class="feat reveal">${icon('message-circle')}<h3>Quelqu’un qui répond</h3><p>Une question ? Vous écrivez, et on vous répond. Pas de standard, pas d’attente.</p></div>
  </div>
  <p class="center more">${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>
</div></section>

${C.ctaBand({ title: 'On ouvre votre vitrine sur internet ?', text: 'Choisissez votre site en deux minutes. Le prix s’affiche tout de suite.' })}`;
  return {
    path: '/',
    title: `Sites internet dès ${creation.prix} €, prix affichés | Les Minis Monstres`,
    description: `Un site pour exister sur internet, être trouvé sur Google ou vendre en ligne : ${types.map((t) => euro(t.price)).join(', ')}, payé une fois. Abonnement au choix, jamais imposé.`,
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
  const info = `<a class="client-i" href="${sections.seo.path}" aria-label="Pourquoi chaque page compte : le guide du référencement">${icon('info')}</a>`;
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
    lead: `D’abord votre site, payé une seule fois : ${types.map((t) => `${t.name} ${euro(t.price)}`).join(', ')}. Ensuite, qui s’en occupe : nous, avec ${ABO.name} à ${euro(ABO.month)} par mois, ou vous, avec ${AUTO.name} à ${euro(AUTO.month)}. Le total s’affiche en bas.`,
    crumbs,
  })}
<section class="section section-builder"><div class="container">${C.configurator()}</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Et ensuite ?</h2>
  ${C.steps([
    { t: 'Vous commandez', d: `Vous réglez ${paiement.acompte} % du site. Le reste vient à la réception, en une fois ou étalé.` },
    { t: 'On s’appelle', d: 'Un rendez-vous téléphonique pour découvrir votre activité et ce que vous attendez de votre site.' },
    { t: 'Votre site est créé', d: 'Vous le voyez avant la mise en ligne. Vous dites ce qui doit changer, autant de fois qu’il le faut, jusqu’à ce qu’il vous plaise.' },
    { t: 'Il est mis en ligne', d: `Avec ${ABO.name}, on s’occupe de tout. Avec ${AUTO.name}, je vous remets votre site, prêt à installer chez votre hébergeur.` },
  ])}
</div></section>

${f.html}`;
  return {
    path: sections.creer.path,
    section: 'creer',
    bodyClass: 'page-creer',
    noMobileBar: true,
    title: 'Créer mon site : choisissez-le en deux minutes | Les Minis Monstres',
    description: `Choisissez votre site : ${ESS.name} ${creation.prix} €, ${VIS.name} ${creation.visibilite} € ou ${BOU.name} ${euro(creation.boutiquePrix)}. Puis ${AUTO.month} € ou ${ABO.month} € par mois. Le total s’affiche tout de suite.`,
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
    h1: `Tarifs : trois sites, dès ${euro(creation.prix)}`,
    lead: `Des prix affichés, les mêmes pour tous, sans devis. Votre site se paie une seule fois. Ensuite, c’est vous qui choisissez : ${AUTO.name} à ${euro(AUTO.month)}, ou ${ABO.name} à ${euro(ABO.month)} par mois.`,
    crumbs,
  })}
<section class="section"><div class="container" data-billing-scope>
  <h2 class="section-title">Un site, un but, un prix</h2>
  ${commun(C.positionnement())}
  ${C.billingSwitch()}
  ${commun(C.offre())}
</div></section>

<section class="section section-soft" id="comparer"><div class="container">
  <h2 class="section-title">Et ailleurs, ça coûte combien ?</h2>
  <p class="section-sub">Une comparaison honnête, avec les sources.</p>
  ${C.economie()}
</div></section>

<section class="section" id="boutique"><div class="container">
  <h2 class="section-title">Le ${esc(BOU.name)}, pour vendre sur internet</h2>
  <p class="section-sub">Une boutique complète, et vous gérez votre catalogue vous-même. Pas de limite d’articles.</p>
  ${C.optionsCompact()}
</div></section>

<section class="section section-soft" id="maintenir"><div class="container">
  <h2 class="section-title">Ensuite : ${esc(AUTO.name)} ou ${esc(ABO.name)}</h2>
  <p class="section-sub">Aucun abonnement n’est imposé. Vous gérez tout vous-même, ou on s’occupe de tout pour ${euro(ABO.month)} par mois, sans engagement.</p>
  ${C.creationSeuleBox()}
  <div class="duo">
    <div class="jetons-box reveal">
      <h3>${icon('shield-check')}Ce que comprend ${esc(ABO.name)}</h3>
      <ul class="list-check">${ABO.details.map((d) => `<li>${inline(d)}</li>`).join('')}</ul>
    </div>
    <div class="jetons-box reveal" id="modifications">
      <h3>${icon('repeat')}Vos modifications, avec ${esc(ABO.name)}</h3>
      <p>Vous écrivez votre demande dans votre espace client. ${esc(C.CERISE)} vous aide à la formuler, et la modification est faite pour vous.</p>
      <p>Une modification peut prendre ${C.DELAI_MODIF}. Une demande à la fois.</p>
    </div>
  </div>
  <div class="modif-bloc">${C.processusModif({ titre: false })}</div>
</div></section>

<section class="section" id="extras"><div class="container">
  <h2 class="section-title">Les extras</h2>
  <p class="section-sub">Trois extras, pas plus. Vous les demandez depuis votre espace client, quand vous en avez besoin.</p>
  ${C.extrasListe()}
  <p class="center more">${C.btn(site.espaceClient.demo, 'btn-light', 'eye', 'Voir l’espace client en démo')}</p>
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Payer, et arrêter si vous le voulez</h2>
  ${C.payBox()}
  <div class="jetons-box reveal">
    <h3>${icon('log-out')}Et si vous arrêtez ${esc(ABO.name)} ?</h3>
    <ul class="list-check">
      <li><strong>Quand vous voulez</strong> : un message suffit, ou le bouton de votre espace client. ${esc(ABO.name)} s’arrête à la fin de la période déjà payée.</li>
      <li><strong>Votre nom de domaine reste à vous</strong> : il est à votre nom, et vous le transférez où vous voulez.</li>
      <li><strong>Vous repartez avec votre site</strong> : son export est possible, pour le faire héberger ailleurs.</li>
      <li><strong>Un seul engagement</strong> : si vous payez votre site en ${C.lissageTxt} fois, vous vous engagez le temps de ce paiement.</li>
    </ul>
  </div>
</div></section>

<section class="section"><div class="container duo">
  <a class="promo c-butter reveal" href="${sections.comparatif.path}">
    <span class="promo-ico">${icon('scale')}</span>
    <span class="promo-text"><strong>Et par rapport aux autres solutions ?</strong><span>Agence, freelance, plateforme : la comparaison, ligne par ligne.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
  <a class="promo c-pink reveal" href="${sections.fidelite.path}">
    <span class="promo-ico">${icon('gift')}</span>
    <span class="promo-text"><strong>Parrainez, et gagnez un mois</strong><span>Un mois de ${esc(ABO.name)} offert, pour vous comme pour votre filleul.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
</div></section>

${f.html}
${C.ctaBand({ title: 'Le prix vous convient ?', text: 'Choisissez votre site en deux minutes : le total s’affiche avant de commander.' })}`;
  return {
    path: sections.forfaits.path,
    section: 'forfaits',
    title: `Tarifs : sites internet dès ${creation.prix} €, sans devis | Les Minis Monstres`,
    description: `${ESS.name} ${creation.prix} €, ${VIS.name} ${creation.visibilite} €, ${BOU.name} ${euro(creation.boutiquePrix)}, payés une fois. Ensuite, ${AUTO.name} à ${AUTO.month} € ou ${ABO.name} à ${ABO.month} € par mois, sans engagement.`,
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
    lead: `Corriger un texte, préparer une photo, publier sur vos réseaux : les Minis Monstres vous aident, et vous gardez la main. Les outils sont dans votre espace client, avec ${ABO.name}.`,
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
      <li>Modifications incluses avec ${esc(ABO.name)}, une demande à la fois</li>
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
${C.ctaBand({ title: 'Envie d’essayer les outils ?', text: `Créez votre site : les outils arrivent avec ${ABO.name}.` })}`;
  return {
    path: sections.espace.path,
    section: 'espace',
    title: 'Outils : textes, photos, réseaux et votre site | Les Minis Monstres',
    description: `Corriger ou traduire un texte, préparer une photo, publier sur vos réseaux : les Minis Monstres vous aident, et les outils sont compris avec ${ABO.name}.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.8,
  };
}

// ====================================================================== SEO
function seoPage() {
  const crumbs = crumb('seo');
  const f = C.faq(FAQ.seo, 'Vos questions sur le SEO', 'faq-seo');
  const pack = PAGE_GOOGLE;

  // Les trois façons d'être plus visible : [couleur, monstre, titre, prix, liste]
  const levels = [
    [ESS.color, ESS.monstre, `Avec le ${ESS.name}`, `Compris, ${euro(ESS.price)}`, ['Un site rapide et sécurisé', 'Lisible sur téléphone et sur ordinateur', 'Un titre et une description pour Google']],
    [VIS.color, VIS.monstre, `Avec le ${VIS.name}`, `Compris, ${euro(VIS.price)}`, [`Jusqu’à ${creation.pages} pages`, 'Pages de visibilité Google intégrées', 'FAQ personnalisée', 'Référencement local renforcé']],
    ['lilac', 'gelee', pack.name, `${euro(pack.price.once)} la page, payée une fois`, ['Une page de plus, quand vous voulez', `Par exemple : ${(pack.exemples || []).join(', ').toLowerCase().replace('faq', 'FAQ')}`, 'Commandée depuis votre espace client']],
  ];
  const body = `${C.pageHero({
    section: 'seo',
    h1: 'Référencement SEO : être trouvé sur Google',
    lead: 'Le SEO, c’est tout ce qui aide Google à trouver votre site et à le faire monter en haut des résultats. Plus il est haut, plus on clique dessus. Je vous explique simplement.',
    crumbs,
  })}
<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Le SEO, c’est quoi ?

Quand quelqu’un cherche quelque chose sur Google, il tape quelques mots. Google lui montre alors une liste de sites, du premier au dernier. Presque tout le monde clique sur les premiers. Très peu de gens vont voir la deuxième page.

Le SEO (on dit aussi « référencement naturel »), c’est l’ensemble des réglages qui permettent à Google de **trouver votre site**, de **comprendre ce que vous faites** et de le **montrer le plus haut possible**. C’est gratuit pour chaque clic : ce n’est pas de la publicité.

## Un exemple

Vous êtes fleuriste à Reims. Une cliente tape « fleuriste Reims » sur Google.

- Sans SEO, votre site existe, mais Google le range en page 3. Personne ne le voit.
- Avec du SEO, Google comprend que vous êtes fleuriste, à Reims, avec vos horaires et vos avis. Votre site remonte dans les premiers résultats, et la cliente vous appelle.

## Ce que ça vous rapporte

Plus de visites, plus d’appels, plus de ventes, sans payer chaque clic. Le SEO se travaille dans le temps : les premiers résultats arrivent en quelques semaines, puis ça progresse.

## Des pages utiles, pas des pages pour rien

Une grande partie du SEO, c’est de **créer des pages qui renvoient vers votre site**. Chaque page répond à une recherche précise de vos clients, par exemple « bouquet de mariage Reims » ou « livraison de fleurs Épernay ». Elle explique, elle aide, et elle mène vers votre page principale ou votre contact.

Ce ne sont **pas des pages inutiles** remplies de mots-clés : Google les repère et les met de côté. Une page n’est créée que si elle sert vraiment à quelqu’un.

## Une seule page principale, c’est possible

Votre site peut garder **une seule page principale**, simple et claire, avec tout ce que vous faites. À côté, on ajoute **une série de pages pour le référencement**, chacune sur un sujet précis. Vos visiteurs voient un site simple, et Google trouve plus de bonnes raisons de vous montrer.

> Ce site applique la même méthode. Ses [guides](/guides/) répondent chacun à une question précise : le prix d’un site, le choix d’un nom de domaine, la fiche Google, et d’autres.`)}
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Ce que je fais pour votre visibilité</h2>
  <div class="feats feats-4">
    <div class="feat reveal">${icon('zap')}<h3>Les bases techniques</h3><p>Un site rapide, sécurisé, parfait sur tous les supports, avec les balises et les données que Google sait lire.</p></div>
    <div class="feat reveal">${icon('map-pin')}<h3>Le référencement local</h3><p>Fiche Google, pages pour vos villes, avis clients : pour sortir quand vos clients cherchent près de chez vous.</p></div>
    <div class="feat reveal">${icon('pen-tool')}<h3>Des contenus utiles</h3><p>Des pages qui répondent aux vraies questions de vos clients, écrites avec soin et relues.</p></div>
    <div class="feat reveal">${icon('chart-line')}<h3>Des pages en plus, payées une fois</h3><p>Une page de visibilité Google coûte ${euro(pack.price.once)}. Mirette prépare le sujet avec vous, et la page est vérifiée avant sa mise en ligne.</p></div>
  </div>
</div></section>

<section class="section"><div class="container split">
  <div class="reveal">
    <h2>Ma méthode, concrètement</h2>
    <p>Voici ce que je fais sur chaque site, sans exception. C’est le socle qui permet ensuite de gagner des places.</p>
    <p class="proof">${icon('badge-check')}<span>Ce site est construit exactement comme ça : rapide, sans publicité, et chaque page décrit à Google qui je suis et ce que je propose.</span></p>
  </div>
  <ul class="checklist reveal">
    <li>Des pages qui s’affichent vite, mesurées avec les outils de Google</li>
    <li>Un titre et une description écrits pour chaque page</li>
    <li>Des données structurées pour que Google comprenne votre activité, vos prix et vos horaires</li>
    <li>Un plan du site déclaré à Google, des adresses propres</li>
    <li>Des liens bien pensés entre vos pages</li>
    <li>Le site déclaré dans Google Search Console dès la mise en ligne</li>
    <li>Une fiche Google, des avis, les mêmes infos partout</li>
    <li>Des contenus qui répondent aux questions de vos clients</li>
  </ul>
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Trois façons d’être plus visible</h2>
  <div class="seo-levels">${levels
    .map(
      ([c, m, t, prix, list]) => `<div class="seo-level c-${c} reveal"><span class="seo-art">${C.petit(m)}</span><p class="seo-name">${esc(t)}<small>${prix}</small></p><ul class="list-check">${list.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>`
    )
    .join('')}</div>
  <p class="source">Tous les prix sont sur la page <a href="${sections.forfaits.path}">tarifs</a>.</p>
</div></section>

<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Ce que je ne promets pas

Personne ne peut garantir la première place sur Google. Méfiez-vous de ceux qui le font.

Les premiers résultats arrivent en général en quelques semaines, parfois quelques mois pour les recherches les plus disputées.

Je ne publie pas des centaines de pages vides pour gonfler votre site : Google les repère et les pénalise. Je préfère peu de contenus, mais vraiment utiles à vos clients.`)}
</div></section>

${f.html}
${C.ctaBand({ title: 'Être trouvé, ça commence ici', text: `Les bases sont comprises dans chaque site. Pour aller plus loin : le ${VIS.name}, ou une page de visibilité Google en plus.`, mascot: 'clin' })}`;
  return {
    path: sections.seo.path,
    section: 'seo',
    title: 'Référencement SEO : être trouvé sur Google | Les Minis Monstres',
    description: `Le SEO, c’est ce qui aide votre site à être trouvé sur Google. Bases comprises dans chaque site, puis des pages de visibilité Google à ${euro(pack.price.once)} la page.`,
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
    ['butter', 'building-2', 'L’agence web', 'Une équipe complète : chef de projet, graphiste, développeur. Idéale pour un gros projet avec un budget à la hauteur. Le prix et le délai dépendent du devis.'],
    ['sky', 'user', 'Le freelance', 'Une personne qui fait tout. La qualité dépend beaucoup de qui vous choisissez. Les modifications et le suivi se font souvent au devis.'],
    ['lilac', 'mouse-pointer-click', 'La plateforme à faire soi-même', 'Vous construisez votre site à partir de modèles, pour un abonnement mensuel. C’est vous qui faites le travail, les mises à jour et le référencement.'],
    ['mint', 'sparkles', 'Les Minis Monstres', `Des prix affichés, dès ${euro(creation.prix)}, et quelqu’un qui répond. On crée votre site pour vous, avec une méthode rodée. Pour les très gros projets, on vous oriente vers une agence.`],
  ];
  const body = `${C.pageHero({
    section: 'comparatif',
    h1: 'Les Minis Monstres et les autres solutions',
    lead: 'Agence web, freelance ou plateforme à faire soi-même : chaque solution a sa place. Chez les Minis Monstres, trois choses comptent : une méthode rodée, des prix affichés, quelqu’un qui répond.',
    crumbs,
  })}
<section class="section"><div class="container">
  ${C.comparatifTable()}
  <p class="source">Les prix des autres solutions dépendent du prestataire et du projet : le tableau ne les chiffre pas. Les prix des Minis Monstres sont ceux de la page <a href="${sections.forfaits.path}">tarifs</a>.</p>
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Pour qui, chaque solution ?</h2>
  <div class="feats">${who
    .map(([c, ic, t, d]) => `<div class="feat who c-${c} reveal">${icon(ic)}<h3>${t}</h3><p>${d}</p></div>`)
    .join('')}</div>
</div></section>

<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## ${marche.fois} fois moins cher qu’un freelance, sans tour de magie

Pour un petit site vitrine avec les bases du référencement, un freelance demande en général entre ${euro(marche.vitrineMin)} et ${euro(marche.vitrineMax)}. Une agence, plutôt ${euro(marche.agenceMin)} à ${euro(marche.agenceMax)}. Notre ${VIS.name} coûte ${euro(VIS.price)}.

Soyons honnêtes : ces fourchettes sont publiées par des prestataires, et chaque devis est différent. Certains freelances vendent un site dès ${euro(C.INDEPENDANT_DES)}. L’écart est alors d’environ ${C.ecartBas} fois.

## Pourquoi ce prix

Une méthode rodée, des outils préparés à l’avance, et pas de bureaux à payer. Les prix sont affichés : pas de rendez-vous commercial, pas de devis à attendre. Le détail est sur la page [pourquoi c’est moins cher](${sections.methode.path}).

## L’entretien : à vous de choisir

Avec ${AUTO.name}, vous gérez tout vous-même, pour ${euro(AUTO.month)} par mois. Avec ${ABO.name}, ${euro(ABO.month)} par mois comprennent l’hébergement, le nom de domaine, les sauvegardes, la sécurité, la maintenance et les modifications. Les prestataires consultés demandent ${euro(marche.entretienMin)} à ${euro(marche.entretienMax)} par mois pour l’entretien d’un site.

## Ce que vous ne faites pas vous-même

Avec une plateforme à faire soi-même, le site n’est jamais fini : il faut apprendre l’outil, choisir les réglages, écrire pour Google. Ici, vous dites ce que vous voulez, et votre site est fait pour vous. Vous gardez votre temps pour votre métier.

## Quand on vous dira d’aller ailleurs

Une application sur mesure, un logiciel métier, un catalogue de milliers de produits : ces projets demandent une agence ou un développeur. On vous le dit dès le premier échange.`)}
  ${C.sourcesMarche()}
</div></section>

${f.html}
${C.ctaBand({ title: 'On regarde votre projet ?', text: 'Choisissez votre site en deux minutes, ou posez vos questions par le formulaire de contact.' })}`;
  return {
    path: sections.comparatif.path,
    section: 'comparatif',
    title: 'Comparatif : agence web, freelance, plateforme | Les Minis Monstres',
    description: 'Agence web, freelance ou plateforme à faire soi-même : qui fait le travail, les prix, les délais, les modifications et la visibilité Google, comparés simplement.',
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
  code: 'Ce code promo ou de parrainage n’est pas reconnu. Vérifiez-le, ou laissez la case vide : vous pourrez m’écrire ensuite.',
  cgv: 'Pour commander, il faut accepter les conditions générales de vente.',
  demarrage: 'Pour commander, il faut accepter que la création commence tout de suite.',
  engagement: 'Pour payer le reste en plusieurs fois, il faut accepter l’engagement le temps du paiement.',
  paiement: 'Le paiement n’a pas abouti. Votre commande est gardée : vous pouvez réessayer, ou m’écrire.',
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
    ['globe', 'Votre nom de domaine est réservé', 'Il est à votre nom. On s’occupe de tout.'],
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
        <p class="b-label">Votre formule</p>
        ${C.formulesChoix({ name: 'forfait', court: true })}
        <p class="b-label">${esc(ABO.name)} se paie</p>
        <div class="b-seg" role="radiogroup" aria-label="Période de paiement de ${esc(ABO.name)}">
          <label><input type="radio" name="periode" value="mois" checked><span>Au mois</span></label>
          <label><input type="radio" name="periode" value="annee"><span>À l’année <em>${annuel.moisOfferts} mois offerts</em></span></label>
        </div>
        </div>
        </div>
        </div>
      </fieldset>

      <fieldset class="o-card" data-avec-formule>
        <legend><span class="b-n">${icon('globe')}</span><span class="b-t">Votre nom de domaine</span></legend>
        <div class="o-in">
        <p class="b-hint">Le nom de domaine, c’est l’adresse de votre site. Il est compris avec ${esc(ABO.name)}, et il reste à votre nom. On vérifie qu’il est libre, puis on le réserve à la commande.</p>
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
        <input type="hidden" name="parrain" value="">
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
          <p class="o-pay-next"><span data-order="next-label">À la réception : le reste, et votre abonnement</span><b data-order="next">${euro(t0.price - acompte0)} + ${euro(f0.month)}/mois</b></p>
          <p class="o-pay-note" data-order-solde>À la réception de votre site, vous réglez le reste, <b data-order="solde">${euro(t0.price - acompte0)}</b><span data-avec-formule>, et votre abonnement démarre</span>. Vous pourrez encore choisir de payer le reste en ${C.lissageTxt} fois.</p>
          <p class="o-pay-note" data-order-lisse-note hidden>À la réception, le reste se paie en <span data-order="lisse-n">${C.LMAX}</span> fois sans frais : <b data-order="lisse">${euro(C.lisse(t0.price))}</b> par mois<span data-avec-formule>, avec votre abonnement. Ensuite, il ne reste que l’abonnement, sans engagement</span>.</p>
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
          <li data-avec-formule><span data-order="domain">Nom de domaine à choisir</span><b data-order="domain-prix">compris</b></li>
          <li><span data-order="forfait">Abonnement ${esc(f0.name)}</span><b data-order="forfait-price">${euro(f0.month)}/mois</b></li>
          <li data-order-opts hidden><span data-order="opts-label">Options</span><b data-order="opts">0 €</b></li>
        </ul>
        <div class="b-total">
          <p><span>Aujourd’hui</span><b data-order="today">${euro(today0)}</b></p>
          <p><span data-order="next-label">À la réception : le reste, et votre abonnement</span><b data-order="next">${euro(t0.price - acompte0)} + ${euro(f0.month)}/mois</b></p>
          <p data-order-parrain hidden><span>Parrainage</span><b>${fidelite.parrainageMois} mois offert</b></p>
        </div>
        <p class="b-sum-note">${icon('check')}<span data-avec-formule>Votre abonnement démarre à la réception de votre site, pas avant. Le nom de domaine, lui, est réservé dès la commande.</span><span data-seule-txt hidden>${esc(AUTO.name)} : pas d’abonnement. À la réception, je vous remets votre site, prêt à installer.</span></p>
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
    description: 'Vérifiez votre site et votre formule, donnez vos coordonnées et payez en ligne en toute sécurité. Aujourd’hui, vous réglez seulement l’acompte.',
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
    <p class="confirm-msg is-wait" data-confirm-wait hidden>${icon('hourglass')}<span>Je vous envoie le lien de paiement sous 24 heures. Votre commande est gardée : rien à faire de votre côté pour l’instant.</span></p>
    <h2 class="h3">Les prochaines étapes</h2>
    ${C.steps([
      { t: 'On vous écrit sous 24 heures', d: 'Pour fixer le rendez-vous téléphonique de découverte.' },
      { t: `Avec ${ABO.name}, votre nom de domaine est réservé`, d: `Il est à votre nom. Avec ${AUTO.name}, vous gardez le vôtre.` },
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
  const f = C.faq(FAQ.fidelite, 'Vos questions sur la fidélité', 'faq-fidelite');
  const perks = [
    ['pink', 'users', 'Parrainage', `${fidelite.parrainageMois} mois offert pour vous deux`, `Un proche fait créer son site grâce à vous : quand il est en ligne, vous recevez chacun un mois de ${ABO.name} offert.`],
    ['butter', 'badge-percent', 'Deuxième site', `${fidelite.remiseSecondSite} % sur la création`, `Un deuxième site ? Sa création coûte ${fidelite.remiseSecondSite} % de moins, quel que soit le site. Par exemple, un ${ESS.name} à ${euro(ESS.price * (100 - fidelite.remiseSecondSite) / 100)} au lieu de ${euro(ESS.price)}.`],
    ['mint', 'calendar-check', 'À l’année', `${annuel.moisOfferts} mois offerts`, `En payant ${ABO.name} à l’année, vous réglez ${12 - annuel.moisOfferts} mois sur 12 : ${euro(ABO_AN)} au lieu de ${euro(ABO.month * 12)}.`],
  ];
  const body = `${C.pageHero({
    section: 'fidelite',
    h1: 'Fidélité et parrainage',
    lead: 'Merci de nous faire confiance, et de parler de nous autour de vous. Voici ce que vous y gagnez.',
    crumbs,
  })}
<section class="section"><div class="container">
  <div class="perks">${perks
    .map(([c, ic, t, big, d]) => `<article class="perk c-${c} reveal"><span class="perk-ico">${icon(ic)}</span><p class="perk-kind">${t}</p><h2>${big}</h2><p>${d}</p></article>`)
    .join('')}</div>
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Le parrainage, en pratique</h2>
  ${C.steps([
    { t: 'Partagez votre lien', d: 'Votre lien et votre code de parrainage sont dans votre espace client, onglet Parrainage.' },
    { t: 'Il crée son site', d: 'Votre filleul passe par votre lien, ou donne votre code dans sa commande.' },
    { t: 'Un mois offert chacun', d: `Dès que son site est en ligne, vous recevez tous les deux un mois de ${ABO.name}. Vous suivez vos filleuls dans votre espace.` },
  ])}
</div></section>

${f.html}
${C.ctaBand({ title: 'Quelqu’un a un projet autour de vous ?', text: 'Envoyez-lui le lien du site. Vous y gagnez tous les deux.' })}`;
  return {
    path: sections.fidelite.path,
    section: 'fidelite',
    title: 'Fidélité et parrainage : un mois offert | Les Minis Monstres',
    description: `Parrainez un proche : vous recevez chacun un mois de ${ABO.name} offert. ${fidelite.remiseSecondSite} % de remise sur la création d’un deuxième site, et ${annuel.moisOfferts} mois offerts à l’année.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.5,
  };
}

// Les petits mots de la bande, dans l'espace client : un monstre, un message court et un petit visuel.
// Les cinq monstres viennent de config.bande (prénom, métier, dessin).
const DEMO_MSGS = [
  { qui: 'Cerise', quand: 'ce matin', titre: 'Votre demande est transmise', texte: '« Fermé le lundi 24 novembre » : c’est noté. Vous la suivez dans l’onglet Mes demandes.' },
  { qui: 'Bricou', quand: 'hier', titre: 'Modification en ligne', texte: 'Vos horaires d’été sont à jour sur la page Contact.', vis: 'voyants' },
  { qui: 'Plume', quand: 'hier', titre: 'Un texte plus simple', texte: 'Le texte de la page « Nos gâteaux » est relu. Il se lit mieux sur téléphone.' },
  { qui: 'Mirette', quand: 'lundi', titre: 'Votre page de visibilité Google est en ligne', texte: '« Gâteau d’anniversaire à Rethel » est intégrée à votre site.', vis: 'google' },
  { qui: 'Mochi', quand: 'lundi', titre: 'Tout est rangé', texte: 'Vos photos sont classées et vos pages sont en ordre.' },
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
// Onglets : Accueil, Mes demandes, Extras (les trois extras), Mon site, Ma boutique (verrouillé sans Site Boutique), Mon compte.
// Les attributs data-* sont ceux que lit src/assets/js/main.js (data-tab, data-go, data-req, data-reqs, data-log, data-toast-msg…).
function monEspacePage() {
  const tab = (id, ic, label, on) => `<button type="button" role="tab" id="tab-${id}" aria-controls="t-${id}" aria-selected="${on ? 'true' : 'false'}"${on ? '' : ' tabindex="-1"'} data-tab="${id}">${icon(ic)}<span>${label}</span></button>`;
  const extras = C.EXTRAS_PAR_FAMILLE.flatMap((g) => g.items);
  const extraBtn = (x) => (x.devis
    ? `<button type="button" class="btn btn-light btn-sm" data-toast-msg="Demande de devis envoyée : on vous répond avec un prix (démo)"><span>Demander un devis</span></button>`
    : `<button type="button" class="btn btn-primary btn-sm" data-toast-msg="Paiement par carte, tout de suite : ${euro(x.fois)} (démo)"><span>Commander</span></button>`);
  const articles = [['Tarte aux fraises', '4,50 €'], ['Éclair au chocolat', '3,20 €'], ['Gâteau d’anniversaire, 8 parts', '32 €']];
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
      <p data-mots="horaire,fermé,ferme,ouvert,ouvre,hours,closed,open" data-type="demande" data-par="lia" data-cout="0" data-texte="Sur la page Contact, changer les horaires : nous serons fermés le lundi 24 novembre.">C’est noté ! Si j’ai bien compris, vous voulez indiquer sur la page Contact que vous serez fermés le lundi 24 novembre. Voici votre demande, bien claire. C’est bien ça ?</p>
      <p data-mots="photo,image,picture" data-type="demande" data-par="lia" data-cout="0" data-texte="Sur la page d’accueil, remplacer la photo du haut par celle que je joins.">Avec plaisir ! Vous voulez remplacer la grande photo en haut de l’accueil, c’est bien ça ? Vous pourrez joindre votre photo juste avant d’envoyer.</p>
      <p data-mots="google,visibilité,visibilite,extra,traduction,anglais" data-type="onglet" data-onglet="extras" data-nom="Extras">Une page de visibilité Google coûte ${euro(PRIX_PAGE)}, payée une fois, par carte. La traduction anglaise et les fonctionnalités spécifiques sont sur devis. Tout se demande dans l’onglet Extras.</p>
      <p data-mots="combien,reste,limite,modification,comment,how,limit" data-type="onglet" data-onglet="demandes" data-nom="Mes demandes">Avec ${esc(ABO.name)}, vos modifications sont incluses. Vous me dites ce que vous voulez changer, je vous pose quelques questions, vous confirmez, et je transmets. Une modification peut prendre ${C.DELAI_MODIF}, une demande à la fois.</p>
      <p data-mots="boutique,vendre,panier,shop,sell" data-type="demande" data-par="alex" data-texte="Je voudrais vendre en ligne. Pouvez-vous me dire comment passer au ${esc(BOU.name)} ?">Quel beau projet ! Pour vendre en ligne, il faut le ${esc(BOU.name)} : une boutique complète, un panier et le paiement sécurisé. Vous gérez votre catalogue vous-même, sans limite d’articles. Voici votre message, c’est bien ça ?</p>
      <p data-defaut>Dans votre vrai espace, je réponds à votre question, je vous aide à formuler ce que vous voulez changer, puis je transmets. Essayez par exemple : changer mes horaires.</p>
    </div>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user">${monster('mascotte')}<div><strong>Pâtisserie Lila</strong><small>patisserie-lila.fr</small></div></div>
        <p class="app-badge">${icon('wrench')}<span>Modifications incluses</span></p>
        <div class="app-tabs" role="tablist" aria-label="Mon espace">
          ${tab('accueil', 'house', 'Accueil', true)}
          ${tab('demandes', 'message-circle', 'Mes demandes')}
          ${tab('extras', 'sparkles', 'Extras')}
          ${tab('site', 'gauge', 'Mon site')}
          ${tab('boutique', 'shopping-bag', 'Ma boutique')}
          ${tab('forfait', 'circle-user', 'Mon compte')}
        </div>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bonjour Lila !</h2>
          <div class="app-cards">
            <button type="button" class="app-card c-${VIS.color}" data-go="site"><span class="app-card-art">${C.petit(VIS.monstre)}</span><span><small>Votre site</small><strong>${esc(VIS.name)}</strong><span class="dot-ok">En ligne</span></span></button>
            <button type="button" class="app-card c-${ABO.color}" data-go="forfait"><span class="app-card-art">${C.petit('maxi')}</span><span><small>Votre formule</small><strong>${esc(ABO.name)}</strong><span>${euro(ABO.month)} par mois, sans engagement</span></span></button>
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
          <h2 class="app-h">Mes demandes</h2>
          <p class="app-p">Écrivez ce que vous voulez changer, avec une photo si besoin. Avec ${esc(ABO.name)}, vos modifications sont incluses. Une modification peut prendre ${C.DELAI_MODIF}, une demande à la fois.</p>
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
          <p class="app-p">Trois extras, quand vous en avez besoin. Une page de visibilité Google se paie par carte, tout de suite. Les deux autres sont sur devis, gratuit et sans engagement.</p>
          <div class="app-opts">${extras.map((x) => `<div class="app-opt app-opt-once"><span class="app-opt-ico">${icon(x.icon)}</span><span class="app-opt-txt"><strong>${esc(x.name)}</strong><small>${esc(x.devis ? 'Sur devis' : `${euro(x.fois)} la page, payée une fois`)}</small><small>${inline(x.desc)}</small></span>${extraBtn(x)}</div>`).join('')}</div>
        </div>

        <div class="app-panel" role="tabpanel" id="t-site" aria-labelledby="tab-site" hidden>
          <h2 class="app-h">Mon site</h2>
          <p class="app-domain">${icon('globe')}<span><strong>patisserie-lila.fr</strong><small>${esc(VIS.name)}, 8 pages en ligne</small></span></p>
          <ul class="demo-voyants" aria-label="État de votre site">
            <li><i></i><span><strong>Site en ligne</strong><small>Tout va bien</small></span></li>
            <li><i></i><span><strong>Sécurité HTTPS</strong><small>Cadenas actif</small></span></li>
            <li><i></i><span><strong>Sauvegarde</strong><small>Faite cette nuit</small></span></li>
          </ul>
          <div class="kpis kpis-2">
            <div><b>1 240</b><small>visiteurs sur 30 jours</small></div>
            <div><b>3 420</b><small>apparitions sur Google</small></div>
          </div>
          <p class="app-sub">Vos meilleures recherches sur Google</p>
          <ul class="ranks">
            <li><span>tarte aux fraises rethel<small>410 apparitions · 64 clics</small></span><b>2<sup>e</sup></b></li>
            <li><span>pâtisserie rethel<small>980 apparitions · 71 clics</small></span><b>4<sup>e</sup></b></li>
            <li><span>gâteau d’anniversaire ardennes<small>520 apparitions · 19 clics</small></span><b>9<sup>e</sup></b></li>
          </ul>
          <p class="app-note">Position moyenne dans Google sur les 28 derniers jours. Les chiffres sont inventés, pour l’exemple.</p>
        </div>

        <div class="app-panel" role="tabpanel" id="t-boutique" aria-labelledby="tab-boutique" hidden>
          <h2 class="app-h">Ma boutique</h2>
          <div class="app-lock">${icon('lock')}<div><strong>Option verrouillée</strong><p>Cet onglet s’ouvre avec le ${esc(BOU.name)}. Pâtisserie Lila a un ${esc(VIS.name)} : pour vendre en ligne, elle peut passer au ${esc(BOU.name)}.</p><button type="button" class="btn btn-light btn-sm" data-toast-msg="Demande envoyée : on vous répond avec un prix (démo)"><span>Passer au ${esc(BOU.name)}</span></button></div></div>
          <p class="app-p">Avec le ${esc(BOU.name)}, voici ce que vous gérez ici, vous-même. Autant d’articles que vous voulez.</p>
          <p class="app-sub">${icon('image-plus')}Vos articles et vos prix</p>
          <ul class="ranks ranks-pages">${articles.map(([n, p]) => `<li><span>${n}</span><b>${p}</b></li>`).join('')}</ul>
          <p class="app-note">Pour chaque article : une photo, une description, un prix. Vous ajoutez, changez ou retirez un article quand vous voulez.</p>
          <p class="app-sub">${icon('credit-card')}Vos paiements</p>
          <ul class="reqs">
            <li><span><strong>Carte bancaire (Stripe)</strong><small>paiement en ligne sécurisé</small></span><em class="st st-done">Actif</em></li>
            <li><span><strong>PayPal</strong><small>s’installe en un clic</small></span><em class="st st-new">Pas installé</em></li>
            <li><span><strong>Virement ou chèque</strong><small>si vous préférez</small></span><em class="st st-done">Actif</em></li>
          </ul>
          <p class="app-sub">${icon('package')}Vos commandes</p>
          <ul class="reqs">
            <li><span><strong>Commande n° 1042</strong><small>Gâteau d’anniversaire, 8 parts · 32 €</small></span><em class="st st-doing">À préparer</em></li>
            <li><span><strong>Commande n° 1041</strong><small>6 éclairs au chocolat · 19,20 €</small></span><em class="st st-done">Remise</em></li>
          </ul>
          <p class="app-note">Vous recevez un e-mail à chaque commande, et votre client aussi. Exemple inventé, pour la démo.</p>
        </div>

        <div class="app-panel" role="tabpanel" id="t-forfait" aria-labelledby="tab-forfait" hidden>
          <h2 class="app-h">Mon compte</h2>
          <p class="app-sub">Votre formule</p>
          <p class="app-domain">${icon('shield-check')}<span><strong>${esc(ABO.name)}, ${euro(ABO.month)} par mois</strong><small>Sans engagement. Hébergement, nom de domaine, sauvegardes, sécurité, maintenance et modifications.</small></span></p>
          <p class="app-note">Vous préférez tout gérer vous-même ? Vous passez en ${esc(AUTO.name)} quand vous voulez : ${euro(AUTO.month)} par mois, et vous repartez avec votre site.</p>
          <p class="app-sub">Factures</p>
          <ul class="invoices">
            <li><span>Novembre 2026</span><button type="button" class="link-btn" data-toast-msg="Facture téléchargée (démo)">PDF</button></li>
            <li><span>Octobre 2026</span><button type="button" class="link-btn" data-toast-msg="Facture téléchargée (démo)">PDF</button></li>
          </ul>
          <p class="app-sub">Nom de domaine</p>
          <p class="app-domain">${icon('globe')}<span><strong>patisserie-lila.fr</strong><small>À votre nom, compris avec ${esc(ABO.name)}</small></span></p>
        </div>

      </div>
    </div>
    <p class="app-toast" data-toast role="status" hidden></p>
    <template data-icons>${['check', 'message-circle', 'history'].map((n) => `<span data-i="${n}">${icon(n)}</span>`).join('')}</template>
  </div>
</div></section>

${C.ctaBand({ title: 'Ça vous plaît ?', text: 'Créez votre site : vous envoyez vos demandes, on s’occupe du reste.' })}`;
  return {
    path: '/mon-espace/demo/',
    section: 'monespace',
    noindex: true,
    noMobileBar: true,
    title: 'Mon espace, la démo | Les Minis Monstres',
    description: 'Essayez l’espace client des Minis Monstres : demandes de modification, extras, votre site, votre boutique et votre compte. Une démonstration sans compte.',
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
    description: 'Connectez-vous à votre espace client des Minis Monstres : demandes de modification, extras, votre site, vos factures et le parrainage.',
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
    lead: `Écrivez-nous, pour un site ou pour une simple question. On vous répond vite, en général dans la journée. Les prix sont déjà affichés : dès ${euro(creation.prix)} le site, puis ${euro(AUTO.month)} ou ${euro(ABO.month)} par mois, au choix.`,
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
        <div class="field"><label for="c-motif">Votre demande <span class="req">*</span></label>
          <select id="c-motif" name="motif" required data-motif><option value="">Choisir…</option>
            <optgroup label="Un site internet">
              <option value="Site : un devis précis">Un site : j’ai un projet précis</option>
              <option value="Site : une information">Un site : j’ai une question ou je veux une information</option>
              <option value="Site : je ne sais pas encore">Un site : je ne sais pas encore, je veux en parler</option>
            </optgroup>
            <optgroup label="Autre chose">
              <option value="Contact simple">Juste vous contacter, sans projet de site</option>
            </optgroup>
          </select></div>
      </div>
      <div data-site-only>
        <div class="form-row">
          <div class="field"><label for="c-type">Votre site <span class="req">*</span></label>
            <select id="c-type" name="type" required><option value="">Choisir…</option>${types.map((t) => opt(t.label)).join('')}${opt('Je ne sais pas encore')}${opt('Autre projet')}</select></div>
          <div class="field"><label for="c-domaine">Nom de domaine <span class="opt">(facultatif)</span></label><input id="c-domaine" name="domaine" type="text" autocomplete="off" placeholder="mon-entreprise.fr"></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="c-parrain">Code de parrainage <span class="opt">(facultatif)</span></label><input id="c-parrain" name="parrain" type="text" autocomplete="off" maxlength="20" placeholder="Ex. : LILA-7K2"></div>
        </div>
        <div class="field"><span class="label">Si vous prenez ${esc(ABO.name)}, vous le payez</span>
          <div class="radio-group">
            <label><input type="radio" name="paiement" value="Au mois"> Au mois</label>
            <label><input type="radio" name="paiement" value="À l’année"> À l’année</label>
            <label><input type="radio" name="paiement" value="Je ne sais pas encore" checked> Je ne sais pas encore</label>
          </div>
        </div>
      </div>
      <div class="field"><label for="c-message">Votre message <span class="req">*</span></label><textarea id="c-message" name="message" required minlength="10" placeholder="Votre activité, ce que vous attendez, un site que vous aimez…" data-ph-site="Votre activité, ce que vous attendez, un site que vous aimez…" data-ph-contact="Dites-moi tout : une question, une idée, un coup de main, ou simplement bonjour…"></textarea></div>
      <label class="check"><input type="checkbox" name="consentement" value="oui" required><span>J’accepte que mes informations servent à me répondre. <a href="/politique-de-confidentialite/">En savoir plus</a></span></label>
      <button class="btn btn-primary btn-lg" type="submit">${icon('send')}<span>Envoyer ma demande</span></button>
    </form>
  </div>
  <aside class="contact-side">
    ${site.email ? `<a class="contact-card" href="mailto:${site.email}">${icon('mail')}<div><strong>${site.email}</strong><span>Pour envoyer des documents.</span></div></a>` : ''}
    <a class="contact-card c-mint" href="/mon-espace/">${icon('circle-user')}<div><strong>Déjà client ?</strong><span>Vos demandes de modification se font depuis votre espace client.</span></div></a>
    <a class="contact-card c-pink" href="${sections.creer.path}">${icon('wand-sparkles')}<div><strong>Créer mon site</strong><span>Choisissez votre site et voyez le prix tout de suite.</span></div></a>
    <a class="contact-card" href="${sections.forfaits.path}">${icon(sections.forfaits.icon)}<div><strong>Voir les tarifs</strong><span>Trois sites, dès ${euro(creation.prix)}. Puis ${euro(AUTO.month)} ou ${euro(ABO.month)} par mois, au choix.</span></div></a>
    <p class="contact-note">${icon('map-pin')}<span>Tout se fait en ligne et par téléphone : la commande, les échanges, le suivi. Pour des clients partout en France.</span></p>
  </aside>
</div></section>`;
  return {
    path: '/contact/',
    section: 'contact',
    title: 'Contact : posez votre question | Les Minis Monstres',
    description: 'Une question, un projet de site ou de boutique en ligne ? Écrivez-nous par le formulaire. Quelqu’un vous répond, en général dans la journée.',
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
    lead: 'Des explications simples, écrites pour ceux qui n’y connaissent rien. Pas de jargon, pas de blabla : ce qu’il faut savoir, et rien d’autre.',
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
${C.ctaBand({ title: 'Vous avez votre réponse ?', text: 'Choisissez votre site en deux minutes : le prix s’affiche avant de commander.' })}`;
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
    h1: 'Lexique du web : les mots d’internet expliqués simplement',
    lead: 'Nom de domaine, hébergement, SEO, HTTPS… Vous entendez ces mots sans savoir ce qu’ils veulent dire ? Chaque page explique un mot, avec un exemple concret.',
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
    title: 'Lexique du web : les mots d’internet expliqués | Les Minis Monstres',
    description: 'Nom de domaine, hébergement, SEO, HTTPS, responsive, CMS : les mots du web expliqués simplement, avec un exemple concret pour chacun. Sans jargon.',
    crumbs,
    body,
    schema: [{ '@type': 'DefinedTermSet', '@id': site.url + '/lexique/#lexique', name: 'Lexique du web', hasDefinedTerm: LEXIQUE.termes.map((t) => ({ '@type': 'DefinedTerm', name: t.nom, url: site.url + '/lexique/' + t.slug + '/' })) }],
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
${C.ctaBand({ title: 'Le prochain, c’est le vôtre ?', text: `Choisissez votre site en deux minutes. Les prix sont affichés, les mêmes pour tous : dès ${euro(creation.prix)}.` })}`;
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
// Alex, et les cinq Minis Monstres (config.bande) : un prénom et un métier chacun.
function equipePage() {
  const crumbs = crumb('equipe');
  const body = `${C.pageHero({
    section: 'equipe',
    h1: 'Notre équipe : Alex et les Minis Monstres',
    lead: 'Alex conçoit votre site et vérifie tout. Avec lui, cinq petits monstres, chacun son métier.',
    crumbs,
  })}
<section class="section section-bande" id="bande"><div class="container">
  <div class="alex-bulle reveal"><span class="alex-art">${C.alexPortrait({ title: 'Alex' })}</span><p><strong>Moi, c’est Alex.</strong> Je conçois votre site, je vérifie tout et je reste votre interlocuteur. Avec moi, les Minis Monstres : ${bande.map((b) => b.nom).join(', ').replace(/, ([^,]*)$/, ' et $1')}. Rien ne part en ligne sans mon accord.</p></div>
  ${C.bandeGrid({ complet: true })}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Comment on travaille</h2>
  <div class="feats feats-3">
    <div class="feat reveal">${icon('list-checks')}<h3>Une méthode rodée</h3><p>Un appel pour vous connaître, puis votre site est construit étape par étape. Vous le voyez avant la mise en ligne.</p></div>
    <div class="feat reveal">${icon('tag')}<h3>Des prix affichés</h3><p>Les mêmes pour tout le monde, sans devis. Vous savez ce que vous payez avant de commander.</p></div>
    <div class="feat reveal">${icon('message-circle')}<h3>Quelqu’un qui répond</h3><p>${esc(C.CERISE)} prend vos questions et vos demandes. Derrière, Alex relit tout.</p></div>
  </div>
  <p class="center more">${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Une modification, du début à la fin</h2>
  ${C.processusModif({ titre: false })}
</div></section>
${C.ctaBand({ title: 'On s’occupe de votre site ?', text: 'Choisissez-le en deux minutes, le prix s’affiche tout de suite. Ou écrivez-nous pour en parler.' })}`;
  return {
    path: sections.equipe.path,
    section: 'equipe',
    title: 'Notre équipe : Alex et sa petite bande | Les Minis Monstres',
    description: `Alex conçoit chaque site et vérifie tout. Avec lui, cinq petits monstres : ${bande.map((b) => `${b.nom} ${b.role.toLowerCase()}`).join(', ')}.`,
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
    lead: 'Un artisan, une sophrologue, un gîte ou une association n’ont pas les mêmes clients. Choisissez votre activité : je vous montre ce que votre site doit faire pour vous.',
    crumbs,
  })}
<section class="section"><div class="container">
  ${metierCards()}
  <p class="center muted">Votre métier n’est pas dans la liste ? Les <a href="/guides/">guides</a> parlent aussi des restaurants, des instituts et des auto-entrepreneurs. Et vous pouvez <a href="${C.contactUrl}">m’écrire</a>.</p>
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
const MONSTRE_METIER = { 'site-internet-artisan': 'dino', 'site-internet-therapeute': 'nuage', 'site-internet-createur-artiste': 'champi', 'site-internet-gite-chambre-hotes': 'chaton', 'site-internet-commercant': 'mochi', 'site-internet-association': 'etoile' };
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
    if (fo) return { ic: 'repeat', nom: fo.name, prix: `${euro(fo.month)} par mois, sans engagement`, pourquoi: o.pourquoi };
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
${C.ctaBand({ title: `On crée votre site ?`, text: `Choisissez votre site en deux minutes : dès ${euro(creation.prix)}, prix affichés. Ou écrivez-nous pour en parler d’abord.` })}`;
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
${C.ctaBand({ title: (p.cta && p.cta.titre) || 'On crée votre site ?', text: (p.cta && p.cta.texte) || CTA_TEXTE })}`;
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
  const toc = [
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
    ['message-circle', 'Mes demandes', 'vous écrivez ce qu’il faut changer, et vous suivez où ça en est.'],
    ['sparkles', 'Extras', 'les trois extras : page de visibilité Google, traduction anglaise, fonctionnalité spécifique.'],
    ['gauge', 'Mon site', 'vos visiteurs et l’état de votre site, en un coup d’œil.'],
    ['shopping-bag', 'Ma boutique', `vos articles, vos prix, vos paiements et vos commandes. Il s’ouvre avec le ${BOU.name}.`],
    ['gift', 'Parrainage', 'votre code à partager, et les mois offerts gagnés.'],
    ['circle-user', 'Mon compte', 'vos coordonnées, votre mot de passe, votre formule et vos factures.'],
  ];
  const body = `${C.pageHero({
    section: 'documentation',
    h1: 'Documentation : tout comprendre, en images',
    lead: 'Comment on crée votre site, ce que vous payez et à quoi ressemble votre espace client. Les captures sont des exemples, avec des chiffres inventés.',
    crumbs,
    mascot: 'pense',
  })}
<section class="section section-tight"><div class="container">
  <nav class="doc-toc reveal" aria-label="Sommaire de la documentation">
    ${toc.map(([id, ic, t], i) => `<a href="#${id}"><span class="doc-num">${i + 1}</span>${icon(ic)}<span>${t}</span></a>`).join('')}
  </nav>
</div></section>

<section class="section doc-sec" id="etapes"><div class="container container-narrow">
  <p class="doc-kicker">1. Comment ça se passe</p>
  <h2>De la commande à la mise en ligne</h2>
  <ol class="doc-steps">
    <li><strong>Vous choisissez votre site.</strong> ${types.map((t) => esc(t.name)).join(', ')} : le prix total s’affiche avant de commander.</li>
    <li><strong>Vous réglez un acompte de ${paiement.acompte} %.</strong> C’est le signal de départ.</li>
    <li><strong>On s’appelle.</strong> Un rendez-vous téléphonique pour découvrir votre activité.</li>
    <li><strong>Vous remplissez le questionnaire de création.</strong> Dans votre espace client : couleurs, ambiance, photos, prix ou produits.</li>
    <li><strong>Votre site est créé.</strong> Vous demandez des changements autant de fois qu’il le faut, jusqu’à ce que vous le validiez.</li>
    <li><strong>Vous recevez votre site et payez le reste.</strong> En une fois, ou en ${C.lissageTxt} fois sans frais.</li>
    <li><strong>Ensuite, vous choisissez.</strong> ${esc(ABO.name)}, ${euro(ABO.month)} par mois : on s’occupe de tout. Ou ${esc(AUTO.name)}, ${euro(AUTO.month)} : vous gérez tout vous-même.</li>
  </ol>
  <p class="doc-more">${C.btn(sections.creer.path, 'btn-primary', 'wand-sparkles', 'Choisir mon site')}</p>
</div></section>

<section class="section section-soft doc-sec" id="lia-alex"><div class="container container-narrow">
  <p class="doc-kicker">2. Cerise et moi</p>
  <h2>Deux pour s’occuper de vos demandes</h2>
  <div class="doc-duo-qui">
    <div class="doc-qui c-pink reveal"><span class="doc-qui-art">${monster('coucou')}</span><h3>Cerise, la secrétaire de la bande</h3><p>Elle répond à vos questions et vous aide à formuler vos demandes. Elle vous les fait relire, puis les transmet.</p></div>
    <div class="doc-qui c-sky reveal"><span class="doc-qui-art">${C.alexPortrait({ title: 'Alex' })}</span><h3>Moi, Alex</h3><p>Je conçois votre site et je vérifie tout. Je réponds aussi à vos questions quand Cerise ne sait pas.</p></div>
  </div>
  <p class="doc-more">${C.btn(sections.equipe.path, 'btn-primary', sections.equipe.icon, 'Rencontrer la bande')} ${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>
</div></section>

<section class="section doc-sec" id="questionnaire"><div class="container container-narrow">
  <p class="doc-kicker">3. Le questionnaire de création</p>
  <h2>Ce qu’on vous demande pour créer votre site</h2>
  <p>Après votre commande, un questionnaire vous attend dans l’onglet « Ma commande ». Il est déjà prérempli avec vos coordonnées. Vous pouvez modifier vos réponses tant que le site n’est pas en ligne.</p>
  <div class="doc-brief">
    ${types.map((t, k) => `<details class="doc-brief-type"${k === 0 ? ' open' : ''}><summary>${icon(t.icon)}Pour un ${esc(t.name)}</summary>
      <ol class="doc-brief-sections">${BRIEF.pour(t.id).map((sec) => `<li><strong>${icon(sec.icon)}${esc(sec.titre)}</strong><ul>${sec.champs.map((c) => `<li><span>${esc(c.label)}${c.requis ? ' <em class="doc-req">à remplir</em>' : ''}</span>${briefDetail(c)}</li>`).join('')}</ul></li>`).join('')}</ol>
    </details>`).join('')}
  </div>
</div></section>

<section class="section section-soft doc-sec" id="sites"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">4. Les trois sites</p>
    <h2>Un site, un but, un prix</h2>
    <p>Chaque site se paie une seule fois. Le prix ne change pas en cours de route. ${esc(C.PLUS_DE_PAGES)}</p>
  </div>
  <div class="doc-types">
    ${types.map((t) => `<div class="doc-type reveal"><strong>${esc(t.name)}</strong><b>${C.prixType(t)}</b><span>${icon('clock')}${esc(t.delai)}</span><p><strong>${esc(t.but)}.</strong> ${esc(t.pitch)}</p></div>`).join('')}
  </div>
  <div class="doc-duo">
    ${fig('site-dodedo', 'Page d’accueil du site Dodedo', 'Un vrai site client : <a href="https://www.dodedo.fr/" target="_blank" rel="noopener">dodedo.fr</a>.')}
    ${fig('site-flore', 'Aperçu du site Flore & Chenilles', 'Un autre site client : <a href="https://www.floreetchenilles.fr/" target="_blank" rel="noopener">floreetchenilles.fr</a>.')}
  </div>
  <p class="doc-more center">${C.btn(sections.confiance.path, 'btn-light', 'handshake', 'Voir les sites de nos clients')}</p>
</div></section>

<section class="section doc-sec" id="prix"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">5. Le prix</p>
    <h2>Le site une fois, puis ${euro(AUTO.month)} ou ${euro(ABO.month)} par mois</h2>
    <p>Les prix sont les mêmes pour tous. Vous payez votre site une fois. Ensuite, c’est vous qui choisissez, sans obligation d’abonnement.</p>
  </div>
  <div class="doc-types">
    <div class="doc-type reveal"><strong>Créer le site</strong><b>dès ${euro(creation.prix)}</b><span>${icon('wand-sparkles')}Une seule fois</span><p>${types.map((t) => `${esc(t.name)} ${euro(t.price)}`).join(', ')}. Payable en ${C.lissageTxt} fois sans frais.</p></div>
    <div class="doc-type reveal"><strong>${esc(AUTO.name)}</strong><b>${euro(AUTO.month)}</b><span>${icon('download')}Par mois</span><p>Vous gérez votre hébergement, votre nom de domaine, vos sauvegardes et vos mises à jour.</p></div>
    <div class="doc-type reveal"><strong>${esc(ABO.name)}</strong><b>${euro(ABO.month)}</b><span>${icon('repeat')}Par mois, sans engagement</span><p>On s’occupe de tout, modifications incluses. À l’année : ${annuel.moisOfferts} mois offerts.</p></div>
    <div class="doc-type reveal"><strong>Les extras</strong><b>${euro(PRIX_PAGE)} la page</b><span>${icon('sparkles')}Ou sur devis</span><p>Page de visibilité Google, traduction anglaise, fonctionnalité spécifique. Depuis votre espace client.</p></div>
  </div>
  <div class="container-narrow">
    <h3>Ce que comprend ${esc(ABO.name)}</h3><ul class="list-check">${ABO.details.map((d) => `<li>${inline(d)}</li>`).join('')}</ul>
  </div>
  <div class="doc-cards3">
    <div class="doc-mini reveal"><strong>${icon('wrench')}Révisions jusqu’à validation</strong><p>Pendant la création, vous demandez des changements autant de fois qu’il le faut. Après la mise en ligne, les modifications passent par ${esc(ABO.name)}.</p></div>
    <div class="doc-mini reveal"><strong>${icon('search-check')}Page de visibilité Google</strong><p>${euro(PRIX_PAGE)} la page, payée une fois, par carte, depuis votre espace client.</p></div>
    <div class="doc-mini reveal"><strong>${icon('ticket')}Code promo ou parrainage</strong><p>Une seule case, à la commande. Un code de parrainage offre ${fidelite.parrainageMois} mois de ${esc(ABO.name)} à chacun.</p></div>
  </div>
  <p class="doc-more center">${C.btn(sections.forfaits.path, 'btn-light', sections.forfaits.icon, 'La page des tarifs')}</p>
</div></section>

<section class="section section-soft doc-sec" id="espace"><div class="container">
  <div class="doc-split">
    <div>
      <p class="doc-kicker">6. L’espace client</p>
      <h2>Tout votre site, au même endroit</h2>
      <p>Chaque client a son espace, sur téléphone comme sur ordinateur.</p>
      <ul class="doc-tabs">${tabs.map(([ic, t, d]) => `<li>${icon(ic)}<span><strong>${t}</strong> : ${d}</span></li>`).join('')}</ul>
      <p class="doc-note">Sans ${esc(BOU.name)}, l’onglet « Ma boutique » affiche « Option verrouillée ».</p>
    </div>
    ${fig('espace', 'L’espace client : les onglets et la page d’accueil', 'L’accueil de l’espace client (exemple : « Pâtisserie Lila », une cliente imaginaire).')}
  </div>
  <p class="doc-more">${C.btn('/mon-espace/demo/', 'btn-light', 'eye', 'Essayer la démo')}</p>
</div></section>

<section class="section doc-sec" id="demandes"><div class="container">
  <div class="doc-split doc-split-rev">
    ${fig('demandes', 'L’onglet Mes demandes', 'L’onglet « Mes demandes » : on écrit, on ajoute une photo si besoin, on suit l’avancement.')}
    <div>
      <p class="doc-kicker">7. Demander une modification</p>
      <h2>Vous demandez, on s’en charge</h2>
      <p>Avec ${esc(ABO.name)}, vos modifications sont incluses. Voici comment ça se passe :</p>
      <ol class="doc-steps">${C.ETAPES_MODIF.map(([, t, d]) => `<li><strong>${esc(t)}.</strong> ${esc(d)}</li>`).join('')}</ol>
      <ul class="list-check">
        <li>Une modification peut prendre ${C.DELAI_MODIF}, une demande à la fois.</li>
        <li>Tant que votre demande n’est pas commencée, vous pouvez l’annuler d’un clic.</li>
      </ul>
      <p class="doc-more">${C.btn(sections.accompagnement.path, 'btn-light', sections.accompagnement.icon, 'L’accompagnement')}</p>
    </div>
  </div>
</div></section>

<section class="section doc-sec" id="jetons"><div class="container container-narrow">
  <p class="doc-kicker">8. La petite bande</p>
  <h2>Cinq Minis Monstres, chacun son métier</h2>
  <ul class="list-check">
    ${bande.map((b) => `<li><strong>${esc(b.nom)}</strong>, ${esc(b.role.toLowerCase())}. ${esc(b.court)}</li>`).join('')}
  </ul>
  <p>Cerise répond dans la bulle, en bas de l’écran, jusqu’à ${limites.bulleJour} messages par jour.</p>
  <p class="doc-more">${C.btn(sections.equipe.path, 'btn-light', sections.equipe.icon, 'Notre équipe')}</p>
</div></section>

<section class="section section-soft doc-sec" id="tableau"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">9. Mon site : vos chiffres</p>
    <h2>Vos visites et l’état de votre site</h2>
    <p>Dans l’onglet « Mon site », vous voyez vos visiteurs et la santé de votre site. Les visites sont comptées sans cookie et sans donnée personnelle.</p>
  </div>
  <div class="doc-compare">
    <div class="doc-compare-col reveal">
      <p class="doc-badge c-${ABO.color}"><span>${monster('mascotte')}</span>L’essentiel, en un coup d’œil</p>
      ${fig('chico', 'Mon site, l’essentiel', 'L’essentiel : les voyants de votre site, vos visiteurs sur 30 jours, vos meilleures recherches sur Google et vos pages les plus vues.', 'doc-fig-flat')}
    </div>
    <div class="doc-compare-col reveal">
      <p class="doc-badge c-lilac"><span>${monster('clin')}</span>Tout le détail, plus bas</p>
      ${fig('titan', 'Mon site, le détail', 'Plus bas : la courbe des 30 derniers jours, les appareils et la provenance des visiteurs.', 'doc-fig-flat')}
    </div>
  </div>
  <ul class="doc-legend reveal">
    <li><span class="doc-dot ok"></span><span><strong>Voyants</strong> : site en ligne, cadenas HTTPS, vitesse. Vert, tout va bien.</span></li>
    <li><span class="doc-dot"></span><span><strong>Provenance</strong> : Google, accès direct, réseaux sociaux ou autres sites.</span></li>
  </ul>
</div></section>

<section class="section section-soft doc-sec" id="messages"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">10. Les extras</p>
    <h2>Trois extras, quand vous en avez besoin</h2>
    <ul class="list-check">
      ${C.EXTRAS_PAR_FAMILLE.flatMap((g) => g.items).map((x) => `<li><strong>${esc(x.name)}</strong>, ${x.devis ? 'sur devis' : `${euro(x.fois)} la page, payée une fois, par carte`}. ${inline(x.desc)}</li>`).join('')}
    </ul>
    <p>Tout se demande depuis l’onglet « Extras » de votre espace client.</p>
  </div>
  ${fig('messages', 'Les petits mots de la bande dans l’espace client', 'Dans l’espace client : les petits mots de la bande (exemple).', 'doc-fig-flat')}
  <p class="doc-more center">${C.btn(sections.forfaits.path + '#extras', 'btn-light', 'plus', 'Voir les extras')}</p>
</div></section>

<section class="section doc-sec" id="boutique"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">11. Le ${esc(BOU.name)}</p>
    <h2>Votre boutique, gérée par vous</h2>
    <p>Dans l’onglet « Ma boutique », vous gérez vos articles, vos prix, vos paiements et vos commandes. ${esc(C.BOUTIQUE_ARTICLES)}</p>
  </div>
  <div class="doc-split">
    <ul class="doc-tools">
      <li>${icon('image-plus')}<span><strong>Vos articles</strong>Une photo, une description et un prix par article. Pas de limite d’articles.</span></li>
      <li>${icon('credit-card')}<span><strong>Vos moyens de paiement</strong>Stripe, PayPal, virement, chèque ou paiement à la livraison. Vos clés de paiement restent sur votre propre site.</span></li>
      <li>${icon('package')}<span><strong>Vos commandes</strong>Vous recevez un e-mail à chaque commande, et vous suivez tout au même endroit.</span></li>
      <li>${icon('badge-percent')}<span><strong>Codes promo et soldes</strong>En % ou en €, avec une date de fin. Les prix barrés apparaissent seuls.</span></li>
      <li>${icon('megaphone')}<span><strong>Bandeau d’annonce</strong>Une phrase en haut du site, en quatre couleurs au choix.</span></li>
      <li>${icon('sun')}<span><strong>Mode vacances</strong>Boutique fermée, ou commandes acceptées avec expédition au retour.</span></li>
    </ul>
    ${fig('vacances', 'Aperçu du mode vacances', 'L’aperçu du mode vacances, tel qu’il s’affiche pendant que vous remplissez le formulaire.', 'doc-fig-small')}
  </div>
  ${fig('boutique', 'L’onglet Ma boutique', 'L’onglet « Ma boutique » : codes promo, soldes rapides et bandeau (exemple).', 'doc-fig-wide')}
</div></section>

<section class="section section-soft doc-sec" id="seo"><div class="container container-narrow">
  <p class="doc-kicker">12. Être trouvé sur Google</p>
  <h2>La visibilité Google, pas à pas</h2>
  <p>Tous les sites partent avec de bonnes bases : des pages rapides, lisibles sur téléphone, avec un titre et une description pour Google. Le ${esc(VIS.name)} va plus loin : jusqu’à ${creation.pages} pages, des pages de visibilité Google intégrées et le référencement local renforcé. Ensuite, chaque page de visibilité Google en plus coûte ${euro(PRIX_PAGE)}, payée une fois.</p>
  <div class="go-links">
    <a class="go-link c-${sections.seo.color}" href="${sections.seo.path}"><span class="type-ico">${icon(sections.seo.icon)}</span><strong>Le référencement en détail</strong>${icon('arrow-right')}</a>
    <a class="go-link c-${sections.guides.color}" href="${sections.guides.path}"><span class="type-ico">${icon(sections.guides.icon)}</span><strong>Les guides pratiques</strong>${icon('arrow-right')}</a>
    ${LEXIQUE.termes.length ? `<a class="go-link c-${sections.lexique.color}" href="${sections.lexique.path}"><span class="type-ico">${icon(sections.lexique.icon)}</span><strong>Le lexique du web</strong>${icon('arrow-right')}</a>` : ''}
    <a class="go-link c-${sections.confiance.color}" href="${sections.confiance.path}"><span class="type-ico">${icon(sections.confiance.icon)}</span><strong>Les pages créées pour nos clients</strong>${icon('arrow-right')}</a>
  </div>
</div></section>

<section class="section doc-sec" id="paiement"><div class="container container-narrow">
  <p class="doc-kicker">13. Paiement et fidélité</p>
  <h2>Payer simplement, et être remercié</h2>
  <ul class="list-check">
    <li>Acompte de ${paiement.acompte} % à la commande, le reste à la réception du site, en une fois ou en ${C.lissageTxt} fois sans frais.</li>
    <li>${esc(ABO.name)} se paie au mois, ou à l’année avec ${annuel.moisOfferts} mois offerts. Sans engagement.</li>
    <li>Une page de visibilité Google se paie par carte, au moment de la commander.</li>
    <li>Parrainage : quand le site d’un filleul est en ligne, vous recevez chacun ${fidelite.parrainageMois} mois de ${esc(ABO.name)} offert.</li>
    <li>Un deuxième site : ${fidelite.remiseSecondSite} % de remise sur sa création.</li>
  </ul>
  <p class="doc-more">${C.btn(sections.fidelite.path, 'btn-light', 'gift', 'La fidélité')} ${C.btn('/faq/', 'btn-light', 'circle-help', 'Questions fréquentes')}</p>
</div></section>
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
    ['Les tarifs et l’abonnement', FAQ.forfaits || FAQ.tarifs || [], 'forfaits'],
    ['Votre espace client', FAQ.espace, 'espace'],
    ['Le référencement', FAQ.seo, 'seo'],
    ['Ma méthode', FAQ.methode, 'methode'],
    ['Le comparatif', FAQ.comparatif || [], 'comparatif'],
    ['La fidélité', FAQ.fidelite, 'fidelite'],
  ].filter((g) => g[1] && g[1].length);
  const all = groups.flatMap((g) => g[1]);
  const body = `${C.pageHero({ h1: 'Questions fréquentes', lead: 'Les réponses aux questions qu’on me pose le plus souvent. Il en manque une ? Écrivez-moi.', crumbs })}
<section class="section"><div class="container container-narrow">
  ${groups
    .map(([t, items, k]) => `<div class="faq-group c-${sections[k].color}"><h2>${icon(sections[k].icon)}${t}</h2><div class="faq">${items.map(C.faqItem).join('')}</div></div>`)
    .join('')}
</div></section>
${C.ctaBand({ text: CTA_TEXTE })}`;
  return {
    path: '/faq/',
    title: 'Questions fréquentes : création, tarifs, SEO | Les Minis Monstres',
    description: 'Toutes les réponses sur la création de votre site, la commande en ligne, les tarifs et l’abonnement, l’espace client, le référencement et le parrainage.',
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
  const hidden = ['commander', 'confirmation', ...(OUTILS_ON ? [] : ['espace'])];
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
    description: 'Votre demande a bien été envoyée aux Minis Monstres. Je vous réponds rapidement, en général dans la journée, avec un récapitulatif clair.',
    body: `${C.pageHero({ h1: 'Merci, votre demande est bien partie !', lead: 'Je vous réponds rapidement, en général dans la journée. Pensez à regarder vos e-mails, et vos indésirables.', mascot: 'mascotte' })}
<section class="section"><div class="container center"><div class="hero-ctas centered">${C.btnWa('btn-light btn-lg')}${C.btn('/', 'btn-light btn-lg', 'arrow-right', 'Retour à l’accueil')}</div></div></section>`,
  };
}

function notFound() {
  return {
    path: '/404/',
    file: '404.html',
    noindex: true,
    title: 'Page introuvable | Les Minis Monstres',
    description: 'Cette page n’existe pas ou a été déplacée. Retrouvez la création de site, les tarifs, l’espace client et le référencement depuis l’accueil.',
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
