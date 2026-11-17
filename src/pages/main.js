// Pages du site
const { site, sections, types, forfaits, annuel, lissage, delais, options, fidelite, paiement, jetonsLia, boost, aLaDemande, creation, marche, enService, limites, evenement } = require('../config');
// Énergie et outils en pause (config enService) : la page Outils, l'énergie et les outils disparaissent des pages.
const ENERGIE = enService.energie, OUTILS_ON = enService.outils;
// L'offre unique : le site à prix unique (creation), un seul abonnement (forfaits[0]), des options et des extras (options).
const ABO = forfaits[0];
const { icon } = require('../lib/icons');
const { monster } = require('../lib/monsters');
const { md, inline, esc } = require('../lib/md');
const C = require('../lib/components');
const FAQ = require('../content/faq');
const legal = require('../content/legal');
const OUTILS = require('../content/outils');
const OUTILS_LIA = require('../content/outils-lia').outils;
const FAMILLES_OUTILS = require('../content/outils-lia').FAMILLES;
// Prix d'un outil ou d'une modification, en Jetons Cerise
const jl = (n) => (n ? `${n} d’énergie` : 'Sans énergie');
const JL_MODIF = `${jetonsLia.modif.base} d’énergie, plus 1 par tranche de ${jetonsLia.modif.mots} mots et ${jetonsLia.modif.image} par photo`;
// Une modification par Cerise coûte de 30 jetons (la base) à 65 (la plus grosse demande que Cerise accepte : trois photos et leur légende).
const JL_MODIF_FOURCHETTE = `${jetonsLia.modif.base} à 65`;
// Ce que font les jetons de l'abonnement en un mois : des modifications par Cerise, ou des utilisations d'outils.
const JL_MODIFS_MOIS = '2 à 3';
const JL_OUTILS_MOIS = 'une dizaine';
// Le prix des outils payants, du moins cher au plus cher (en jetons)
const JL_OUTIL_MIN = Math.min(...OUTILS_LIA.filter((t) => t.jetons).map((t) => t.jetons));
const JL_OUTIL_MAX = Math.max(...OUTILS_LIA.map((t) => t.jetons));
// « 100 jetons pour 1 €, 500 pour 5 €, 1000 pour 10 € »
const RECHARGES = jetonsLia.recharge.map((r, i) => `${r.jetons}${i ? '' : ' d’énergie'} pour ${r.prix} €`).join(', ');
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
const O = (id) => options.find((o) => o.id === id);
const round2 = (n) => Math.round(n * 100) / 100;
// L'abonnement à l'année, et « une modification » (par Alex, chaque mois) écrit en toutes lettres
const ABO_AN = C.year(ABO.month);
const UNE_MODIF = ABO.quota === 1 ? 'une intervention' : `${ABO.quota} interventions`;
// « par trimestre » (V2) ou « par mois »
const PAR_PERIODE = ABO.periode === 'trimestre' ? 'par trimestre' : 'par mois';
// Texte des appels à l'action de bas de page
const CTA_TEXTE = 'Composez votre site en deux minutes. Vous voyez le prix tout de suite, et vous commandez quand vous êtes prêt.';
// Champs cachés communs aux formulaires : horodatage anti-robot et champ piège.
function formHidden() {
  return `<input type="hidden" name="_t" value=""><div class="hp" aria-hidden="true"><label>Site web <input type="text" name="site_web" tabindex="-1" autocomplete="off"></label></div>`;
}

// ====================================================================== ACCUEIL (V2)
// La promesse d'abord (un site pro, visible, quelqu'un qui s'occupe de tout), puis pour qui, les preuves,
// ce que vous y gagnez, comment ça se passe, et le prix en clair. Cerise apparaît une fois, comme l'assistante d'Alex.
function home() {
  const gains = [
    ['search-check', 'Être trouvé sur Google', 'Votre site est préparé pour Google dès le premier jour. Les pages que vous n’utilisez pas deviennent des pages pour vous faire trouver.'],
    ['shield-check', 'Ne plus vous occuper de rien', 'Adresse du site, hébergement, sauvegardes, sécurité : on s’en charge. Vous, vous faites votre métier.'],
    ['repeat', 'Changer votre site quand vous voulez', 'Vous demandez une modification, elle est faite. C’est compris dans votre formule.'],
    ['message-circle', 'Parler à une vraie personne', 'Une question ? Vous m’écrivez, et c’est moi qui vous réponds.'],
  ];
  const PACK = C.PACK_SEO || { name: 'Pack SEO', price: { once: 25 } };
  const body = `<section class="hero">
  <div class="container hero-in">
    <div class="hero-text">
      <h1>Votre site internet professionnel, <mark>${euro(creation.prix)}</mark></h1>
      <p class="hero-lead">Je crée votre site avec ma petite bande de monstres. Ensuite, on s’en occupe chaque mois, à partir de ${euro(ABO.month)} : hébergement, sécurité, modifications. Vous, vous vous occupez de votre métier.</p>
      <div class="hero-ctas">${C.btnCreer('btn-primary btn-lg btn-flaque')}${C.btn(sections.forfaits.path, 'btn-light btn-lg', sections.forfaits.icon, 'Voir les tarifs')}</div>
      <ul class="hero-points">
        <li>${icon('check')}Jusqu’à ${creation.pages} pages</li>
        <li>${icon('check')}Adresse et hébergement offerts la première année</li>
        <li>${icon('check')}Modifications incluses</li>
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
      <span class="scene-m sm-5">${C.petit('etoile')}</span>
      <p class="hero-tag">${icon('sparkles')}Fait par moi, Alex, avec ma petite bande</p>
    </div>
  </div>
</section>

<section class="section" id="en-bref"><div class="container">
  <h2 class="section-title">L’offre en 30 secondes</h2>
  <p class="section-sub">Trois étapes, des prix affichés, rien de caché.</p>
  <ol class="parcours">
    <li class="parcours-etape c-butter reveal"><span class="parcours-n">1</span><p class="parcours-quoi">Je crée mon site</p><p class="parcours-prix"><b>${euro(creation.prix)}</b><small>une fois</small></p><p class="parcours-d">Site Internet Professionnel : jusqu’à ${creation.pages} pages, design personnalisé, mise en ligne.</p></li>
    <li class="parcours-etape c-mint reveal"><span class="parcours-n">2</span><p class="parcours-quoi">J’ajoute une option, si je veux</p><p class="parcours-prix"><span>${esc(PACK.name)} <b>+ ${euro(PACK.price.once)}</b></span><span>Boutique en ligne <b>+ ${euro(creation.boutique)}</b></span></p><p class="parcours-d">Plus de pages pour Google, ou une boutique pour vendre en ligne.</p></li>
    <li class="parcours-etape c-lilac reveal"><span class="parcours-n">3</span><p class="parcours-quoi">Je choisis ma formule</p><p class="parcours-prix">${forfaits.map((f) => `<span>${esc(f.name)} <b>${euro(f.month)}/mois</b></span>`).join('')}</p><p class="parcours-d">On s’occupe de votre site chaque mois. Sans engagement. Vous avez déjà votre hébergement ? <a href="${sections.forfaits.path}#creation-seule">Prenez la création seule</a>.</p></li>
  </ol>
  <p class="center more">${C.btnCreer('btn-primary btn-lg')} ${C.btn(sections.forfaits.path, 'btn-light btn-lg', 'list-checks', 'Ce qui est inclus')}</p>
</div></section>

<section class="section section-soft" id="qui-fait-quoi"><div class="container">
  <h2 class="section-title">Qui fait quoi ?</h2>
  <p class="section-sub">Moi, Alex, je conçois votre site et je vérifie tout. Ma petite bande de monstres s’occupe du reste, chacun son métier.</p>
  ${C.bandeGrid()}
  <p class="center more">${C.btn(sections.equipe.path, 'btn-light btn-flaque', sections.equipe.icon, 'Rencontrer la bande')}</p>
</div></section>

${C.offreEvenement()}

<section class="section">${C.deco('nuage', 'cote-droite')}<div class="container">
  <h2 class="section-title">Ce que vous y gagnez</h2>
  <div class="feats">${gains.map(([ic, t, d]) => `<div class="feat reveal">${icon(ic)}<h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</div></section>

<section class="section section-soft c-butter">${C.deco('etoile', 'haut-gauche', 'ravi')}<div class="container">
  <h2 class="section-title">Pourquoi des prix aussi abordables ?</h2>
  <p class="section-sub">Ce n’est pas de la magie, c’est de l’organisation. J’ai pris le temps de bien m’organiser, et vous en profitez.</p>
  <div class="feats feats-3">
    <div class="feat reveal">${icon('sparkles')}<h3>Le répétitif est automatisé</h3><p>Sauvegardes, mises à jour, préparation des modifications : ce sont mes petits monstres qui s’en chargent. Ce temps-là, vous ne le payez pas.</p></div>
    <div class="feat reveal">${icon('server')}<h3>Pas d’intermédiaire</h3><p>J’ai des accès directs chez des hébergeurs français. Pas de revendeur au milieu, donc pas de marge en plus sur votre facture.</p></div>
    <div class="feat reveal">${icon('tag')}<h3>Un prix affiché, sans devis</h3><p>Le même prix pour tous, visible tout de suite. Pas de rendez-vous commercial à payer, pas de mauvaise surprise à la fin.</p></div>
  </div>
  <p class="center more">${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>
</div></section>

${C.ctaBand({ title: 'Les Minis Monstres s’occupent de votre site', text: 'Pendant que vous vous occupez de votre métier. Composez votre site en deux minutes, le prix s’affiche tout de suite.' })}`;
  return {
    path: '/',
    title: `Site internet professionnel à ${creation.prix} € | Les Minis Monstres`,
    description: `Votre site internet professionnel à ${creation.prix} €, jusqu’à ${creation.pages} pages, puis une formule dès ${ABO.month} € par mois avec les modifications incluses. Sans devis.`,
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
// Prix estimé d'un site client avec la grille actuelle : le prix unique, la boutique si c'en est une, 10 € par page
// au-delà des pages comprises, et ses options payées une fois. Les fiches produits ne comptent pas comme des pages,
// et les pages faites pour Google (clients[].seo dans config) sont comprises : elles ne sont pas comptées en plus.
// C'est une estimation (ce que le site coûterait aujourd'hui), pas le prix payé par le client.
function estimeClient(c) {
  const t = types.find((x) => x.id === c.type);
  const compte = CLIENTS_PAGES[c.domaine] || {};
  if (!t || !compte.pages) return null;
  const produits = compte.produits || 0;
  const pages = compte.pages - produits;
  const seo = compte.seo || 0;
  const plus = Math.max(0, pages - seo - creation.pages);
  const opts = (c.optionsCreation || []).map((id) => options.find((o) => o.id === id)).filter(Boolean);
  const supplement = t.supplement || 0;
  const total = creation.prix + supplement + plus * creation.pagePlus + opts.reduce((n, o) => n + o.price.once, 0);
  return { total, pages, produits, seo, plus, supplement, opts };
}
function clientPrix(c) {
  const e = estimeClient(c);
  if (!e) return '';
  const parts = [`${mille(creation.prix)} € le site`];
  if (e.supplement) parts.push(`${mille(e.supplement)} € la boutique`);
  e.opts.forEach((o) => parts.push(`${mille(o.price.once)} € ${o.name.toLowerCase()}`));
  if (e.plus) parts.push(`${mille(e.plus * creation.pagePlus)} € pour ${e.plus} page${s_(e.plus)} en plus`);
  const detail = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}` : parts[0];
  const compris = e.seo ? ` Les ${e.seo} pages pour Google sont comprises.` : '';
  return `<span class="client-prix"><span class="client-prix-t">Prix estimé au tarif actuel</span><b>${mille(e.total)} €</b><span class="client-prix-d">${detail}, puis ${forfaits[0].month} € par mois.${compris}</span></span>`;
}
function clientPages(c) {
  const e = estimeClient(c);
  const n = e ? e.pages : pagesDe(c);
  if (!n) return '';
  const seo = e && e.seo ? `, dont <b>${e.seo}</b> pour Google` : '';
  const produits = e && e.produits ? `${seo ? ',' : ''} et <b>${e.produits}</b> produit${s_(e.produits)}` : '';
  return `<span class="client-pages"><b>${n}</b> page${s_(n)}${seo}${produits}</span>`;
}
function clientCards({ max = 0, desc = true, prix = true } = {}) {
  const liste = max ? CLIENTS_EN_LIGNE.slice(0, max) : CLIENTS_EN_LIGNE;
  return `<div class="client-cards">${liste
    .map((c) => `<a class="client-card c-${c.color} reveal" href="${c.url}" target="_blank" rel="noopener"><span class="type-ico">${icon(c.icon)}</span><span class="client-genre">${esc(c.genre)}</span><strong>${esc(c.nom)}</strong>${desc ? `<span class="client-desc">${inline(c.desc)}</span>` : ''}${clientPages(c)}${prix ? clientPrix(c) : ''}<span class="client-url">${icon('globe')}${esc(c.domaine)}${icon('arrow-right')}</span></a>`)
    .join('')}</div>`;
}

// ====================================================================== CRÉER MON SITE
function creerPage() {
  const crumbs = crumb('creer');
  const f = C.faq(FAQ.creation, 'Vos questions sur la création', 'faq-creation');
  const body = `${C.pageHero({
    section: 'creer',
    h1: 'Composez votre site en deux minutes',
    lead: `Votre site à ${euro(creation.prix)}, une option si vous voulez, puis votre formule. Le total s’affiche tout de suite, et vous commandez en ligne quand vous êtes prêt.`,
    crumbs,
  })}
<section class="section section-builder"><div class="container">${C.configurator()}</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Et ensuite ?</h2>
  ${C.steps([
    { t: 'Vous commandez', d: `Vous réglez ${paiement.acompte} % du site et vos options. Le reste et la formule viennent à la réception.` },
    { t: 'Je réserve votre nom de domaine', d: 'Il est à votre nom. Je vous écris sous 24 heures avec les questions utiles pour démarrer.' },
    { t: 'Je crée votre site', d: 'Vous recevez un aperçu. Vous me dites ce qui change, je corrige.' },
    { t: 'C’est en ligne', d: `Vous réglez le reste, en une fois ou en ${C.lissageTxt} fois sans frais. Votre formule démarre, et vous demandez vos modifications depuis votre espace client.` },
  ])}
</div></section>

${f.html}`;
  return {
    path: sections.creer.path,
    section: 'creer',
    bodyClass: 'page-creer',
    noMobileBar: true,
    title: 'Créer mon site : composez-le en deux minutes | Les Minis Monstres',
    description: `Composez votre site en deux minutes : ${creation.prix} € jusqu’à ${creation.pages} pages, deux options possibles, puis votre formule. Le total s’affiche tout de suite.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== TARIFS (l'offre unique)
// La fonction garde son nom : la rubrique s'appelle toujours « forfaits » dans config.js (sections.forfaits).
function forfaitsPage() {
  const crumbs = crumb('forfaits');
  const f = C.faq(FAQ.forfaits || FAQ.tarifs || [], 'Vos questions sur les tarifs', 'faq-tarifs');
  const body = `${C.pageHero({
    section: 'forfaits',
    h1: `Tarifs : votre site à ${euro(creation.prix)}, puis dès ${euro(ABO.month)} par mois`,
    lead: `Un prix clair, affiché, sans devis. Vous créez votre site, vous ajoutez une option si vous voulez, puis vous choisissez votre formule. Rien d’autre à prévoir.`,
    crumbs,
  })}
<section class="section"><div class="container" data-billing-scope>
  <h2 class="section-title">Votre site, puis votre formule</h2>
  <p class="section-sub">Le site se paie une fois. Ensuite, une formule au mois s’occupe de tout. Sans engagement.</p>
  ${C.billingSwitch()}
  ${C.offre()}
  ${C.economie()}
  ${C.creationSeuleBox()}
</div></section>

<section class="section section-soft" id="options"><div class="container">
  <h2 class="section-title">Deux options, pas plus</h2>
  <p class="section-sub">Elles se paient une seule fois, avec la création du site. Rien n’est obligatoire.</p>
  ${C.optionsCompact()}
</div></section>

${C.offreEvenement()}

<section class="section" id="modifications"><div class="container">
  <h2 class="section-title">Vos modifications, incluses</h2>
  <p class="section-sub">Vous demandez, on s’en occupe. Voici comment ça se passe, à chaque fois.</p>
  ${C.processusModif({ titre: false })}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Payer, et arrêter si vous le voulez</h2>
  ${C.payBox()}
  <div class="jetons-box reveal">
    <h3>${icon('log-out')}Et si vous arrêtez ?</h3>
    <ul class="list-check">
      <li><strong>Vous arrêtez quand vous voulez</strong> : un message suffit, ou le bouton de votre espace client. Votre formule se termine à la fin de la période déjà payée.</li>
      <li><strong>Votre nom de domaine reste à vous</strong> : il est à votre nom, et vous le transférez où vous voulez.</li>
      <li><strong>Vous repartez avec votre site</strong> : je vous remets ses fichiers, textes, images et pages, pour le faire héberger ailleurs. Notre hébergement s’arrête 30 jours après la fin de votre formule.</li>
      <li><strong>La seule exception</strong> : si vous payez le reste du site en ${C.lissageTxt} fois, vous vous engagez le temps de ce paiement. Si vous partez avant, ce qui reste du prix du site est dû en une fois.</li>
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
    <span class="promo-text"><strong>Parrainez, et gagnez un mois</strong><span>Un mois de formule offert, pour vous comme pour votre filleul.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
</div></section>

${f.html}
${C.ctaBand({ title: 'Le prix vous convient ?', text: 'Composez votre site en deux minutes : le total s’affiche avant de commander.' })}`;
  return {
    path: sections.forfaits.path,
    section: 'forfaits',
    title: `Tarifs : site à ${creation.prix} €, formules dès ${ABO.month} € | Les Minis Monstres`,
    description: `Site Internet Professionnel à ${creation.prix} €, jusqu’à ${creation.pages} pages. Deux options, deux formules (${forfaits.map((x) => `${x.month} €`).join(' et ')} par mois), modifications incluses.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== NOS OUTILS
// Sur la page publique, les outils sont présentés sans parler de Cerise (elle vit dans la bulle et dans l'espace client) :
// on montre la phrase courte de chaque outil, et ces trois-là sont redits autrement.
// Sur la page publique, chaque outil est expliqué en entier (sa description complète). Quelques noms changent.
const PUBLIC_OUTIL = {
  question: ['Une question sur internet', 'Vous posez votre question avec vos mots, sur votre site, Google ou les réseaux. La réponse arrive en quelques phrases simples, avec ce qu’il faut faire en premier et l’outil de votre espace qui peut s’en charger.'],
  conseilphoto: ['Conseils sur une photo'],
  conseilpage: ['Conseils pour ma page'],
};
// Le système d'énergie, expliqué en haut de la page Outils : tout est compris, la bande a juste besoin d'énergie
function energieOutils() {
  const e = ABO.jetons;
  const cout = (id) => (OUTILS_LIA.find((t) => t.id === id) || {}).jetons || 1;
  const fois = (n) => Math.floor(e / n);
  return `<section class="section section-energie" id="energie"><div class="container">
  <div class="energie reveal">
    <div class="energie-jauge" aria-hidden="true"><span class="energie-art">${C.petit('mochi', { humeur: 'ravi' })}</span><p class="energie-nb">${icon('zap')}<b>${e}</b></p><span class="energie-barre"><i></i></span><small>d’énergie chaque mois</small></div>
    <div class="energie-txt">
      <p class="kicker c-butter">${icon('zap')}L’énergie de la bande</p>
      <h2>Tout est compris, il faut juste de l’énergie</h2>
      <p>Les outils sont tous compris dans l’abonnement. Pour travailler, mes petits monstres utilisent de l’énergie, et votre abonnement leur en donne ${e} chaque mois.</p>
      <p class="energie-ex">Avec ${e} d’énergie, vous pouvez par exemple corriger ${fois(cout('corriger'))} textes, répondre à ${fois(cout('avis'))} avis ou faire ${fois(jetonsLia.modif.base)} retouches de votre site.</p>
    </div>
  </div>
</div></section>`;
}
// Le prix d'un outil en énergie, sur sa carte : « 12 », ou « 2 à 14 » pour un outil qui marche aussi sans Cerise
function prixOutil(t) {
  const n = t.jetons || 0, l = t.jetonsLocal || 0;
  const txt = l && l !== n ? `${Math.min(l, n)} à ${Math.max(l, n)}` : String(n);
  return `<span class="tool-tag tool-energie" title="${txt} d’énergie">${icon('zap')}${txt}<span class="sr-only"> d’énergie</span></span>`;
}
function outilsPage() {
  const crumbs = crumb('espace');
  const f = C.faq(FAQ.espace, 'Vos questions sur l’espace client', 'faq-outils');
  const pub = OUTILS_LIA.find((o) => o.id === 'publier');
  const body = `${C.pageHero({
    section: 'espace',
    h1: 'Des outils simples pour vous faire connaître',
    lead: `Corriger un texte, préparer une photo, publier sur vos réseaux, savoir quoi améliorer sur une page : ma petite bande vous aide, et vous gardez la main. Les outils sont dans votre espace client, compris dans l’abonnement.`,
    crumbs,
  })}
${site.espaceClient.ouvert ? '' : `<div class="container"><p class="notice reveal">${icon('hourglass')}<span>L’espace client ouvre bientôt. D’ici là, envoyez vos demandes par le formulaire de contact : on s’en occupe de la même façon.</span></p></div>`}
<div class="container demo-cta demo-cta-duo">${C.btn(sections.monespace.path + '#outils', 'btn-primary btn-lg', 'circle-user', 'Ouvrir mes outils')}${C.btn(site.espaceClient.demo, 'btn-light btn-lg', 'eye', 'Essayer la démo')}</div>

${energieOutils()}

<section class="section" id="outils-lia"><div class="container">
  <h2 class="section-title">Les outils de votre espace</h2>
  <p class="section-sub">Ils sont dans votre espace client : il suffit d’être connecté. Rien d’autre à installer, aucun autre compte à créer.</p>
  ${Object.entries(FAMILLES_OUTILS).map(([fid, fnom]) => `<h3 class="tools-famille reveal">${fnom}</h3>
  <div class="tools">${OUTILS_LIA.filter((t) => t.categorie === fid).map(
    (t) => `<div class="tool c-${t.color} reveal"><span class="tool-ico">${icon(t.icon)}</span><span class="tool-body"><strong>${(PUBLIC_OUTIL[t.id] || [])[0] || t.name}</strong><span>${(PUBLIC_OUTIL[t.id] || [])[1] || t.desc}</span></span>${prixOutil(t)}</div>`
  ).join('')}</div>`).join('\n  ')}
</div></section>

<section class="section section-soft" id="publier"><div class="container container-narrow">
  <p class="kicker c-pink">${icon('megaphone')}${pub.name}</p>
  <h2>Tous vos réseaux, depuis la même page</h2>
  <p>Facebook, Instagram, LinkedIn, Bluesky, Mastodon, X, votre fiche Google, TikTok : vous n’écrivez qu’une fois, et vous publiez partout sans changer de page.</p>
  <ol class="doc-steps">
    <li><strong>Vous reliez vos comptes, une seule fois.</strong> Dans l’outil, à la ligne « Mes réseaux ».</li>
    <li><strong>Vous donnez une photo et quelques mots.</strong> Par exemple : « Nouveau bouquet de printemps, disponible samedi ».</li>
    <li><strong>Vous gardez votre texte, ou le messager l’adapte.</strong> Il peut écrire une version par réseau : le bon ton, la bonne longueur, les hashtags.</li>
    <li><strong>Vous relisez, puis vous publiez.</strong> Un bouton par réseau, ou « Tout publier » : la photo et le texte partent sur vos comptes reliés. Rien ne part sans vous.</li>
    <li><strong>Un réseau n’est pas relié ?</strong> Le texte est copié et le réseau s’ouvre : il reste à coller. Sur téléphone, « Partager » envoie la photo et le texte à l’application de votre choix.</li>
  </ol>
</div></section>

<section class="section section-soft"><div class="container split">
  <div class="reveal">
    <p class="kicker c-mint">${icon('message-circle')}Demande de modification</p>
    <h2>Une demande, et c’est fait</h2>
    <p>Un horaire, un prix, une photo, un nouveau produit ? Écrivez-le dans votre espace, avec une photo si besoin. La petite bande prépare la retouche en 5 minutes, avec un aperçu : votre site ne change qu’après votre accord. Ou je m’en charge à la main, sous ${delais.reponse}, et je vérifie moi-même.</p>
    <ul class="list-check">
      <li>Vous suivez chaque demande : reçue, en cours, faite</li>
      <li>Avec moi : ${UNE_MODIF} ${PAR_PERIODE}, comprise dans l’abonnement</li>
      <li>Une de plus faite par moi ? ${euro(boost.prix)} à l’unité, ajoutée à votre prochaine facture</li>
    </ul>
  </div>
  ${C.phoneEdit(true)}
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Aussi dans votre espace client</h2>
  <p class="section-sub">Compris dans l’abonnement, eux aussi.</p>
  <div class="tools">${OUTILS.filter((t) => !['qr', 'avis'].includes(t.id)).map(
    (t) => `<a class="tool c-${t.color} reveal" href="${site.espaceClient.demo}?outil=${t.demo}"><span class="tool-ico">${icon(t.icon)}</span><span class="tool-body"><strong>${t.name}</strong><span>${t.desc}</span></span><span class="tool-tag c-mint">Compris</span></a>`
  ).join('')}</div>
</div></section>

${f.html}
${C.ctaBand({ title: 'Envie d’essayer les outils ?', text: 'Créez votre site : les outils et toute la petite bande arrivent avec votre abonnement.' })}`;
  return {
    path: sections.espace.path,
    section: 'espace',
    title: 'Outils : textes, photos, réseaux et votre site | Les Minis Monstres',
    description: 'Corriger ou traduire un texte, préparer une photo, publier sur vos réseaux : ma petite bande vous aide, et les outils sont compris dans l’abonnement.',
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
  const pack = C.PACK_SEO || { name: 'Pack SEO', price: { once: 25 }, pages: 10 };
  const EVO = C.EVO;
  // Les trois façons d'être plus visible : [couleur, humeur de Cerise, titre, prix, liste]
  const levels = [
    ['pink', 'mascotte', 'Avec votre site', `Compris dans les ${euro(creation.prix)}`, ['Site rapide, sécurisé et adapté au téléphone', 'Titres, descriptions et données lues par Google', `Les pages non utilisées, sur les ${creation.pages}, deviennent des pages SEO`]],
    ['butter', 'clin', pack.name, `Option à ${euro(pack.price.once)}, une fois`, [`${pack.pages} pages SEO supplémentaires`, 'Chacune répond à une recherche de vos clients', 'Plus de chances d’apparaître sur Google']],
    ['lilac', 'pense', `Formule ${EVO.name}`, `${euro(EVO.month)} par mois`, ['Tout le forfait Tranquillité', 'Une page SEO supplémentaire chaque semaine', 'Votre site grandit tout seul, semaine après semaine']],
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
    <div class="feat reveal">${icon('zap')}<h3>Les bases techniques</h3><p>Un site rapide, sécurisé, parfait sur téléphone, avec les balises et les données que Google sait lire.</p></div>
    <div class="feat reveal">${icon('map-pin')}<h3>Le référencement local</h3><p>Fiche Google, pages pour vos villes, avis clients : pour sortir quand vos clients cherchent près de chez vous.</p></div>
    <div class="feat reveal">${icon('pen-tool')}<h3>Des contenus utiles</h3><p>Articles et pages qui répondent aux vraies questions de vos clients, préparés avec mes automatisations et relus par moi.</p></div>
    <div class="feat reveal">${icon('chart-line')}<h3>Une page de plus chaque semaine</h3><p>Avec la formule ${EVO.name}, Lumi prépare une nouvelle page SEO chaque semaine, et je la vérifie avant sa mise en ligne.</p></div>
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
      ([c, humeur, t, prix, list]) => `<div class="seo-level c-${c} reveal"><span class="seo-art">${C.bouille(humeur)}</span><p class="seo-name">${esc(t)}<small>${prix}</small></p><ul class="list-check">${list.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>`
    )
    .join('')}</div>
  <p class="source">Tous les prix sont sur la page <a href="${sections.forfaits.path}#options">tarifs</a>.</p>
</div></section>

<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Ce que je ne promets pas

Personne ne peut garantir la première place sur Google. Méfiez-vous de ceux qui le font.

Les premiers résultats arrivent en général en quelques semaines, parfois quelques mois pour les recherches les plus disputées.

Je ne publie pas des centaines de pages vides pour gonfler votre site : Google les repère et les pénalise. Je préfère peu de contenus, mais vraiment utiles à vos clients.`)}
</div></section>

${f.html}
${C.ctaBand({ title: 'Être trouvé, ça commence ici', text: 'Créez votre site : les bases du SEO sont comprises, et vos pages non utilisées travaillent pour Google.', mascot: 'clin' })}`;
  return {
    path: sections.seo.path,
    section: 'seo',
    title: 'Référencement SEO : être trouvé sur Google | Les Minis Monstres',
    description: `Le SEO, c’est ce qui aide votre site à être trouvé sur Google. Bases comprises, pages SEO en plus avec le Pack SEO ou la formule ${C.EVO.name}.`,
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
    ['sky', 'user', 'Le freelance', 'Une personne qui fait tout. La qualité dépend beaucoup de qui vous choisissez. Les modifications et le suivi se font souvent au devis, quand le freelance est disponible.'],
    ['lilac', 'mouse-pointer-click', 'La plateforme à faire soi-même', 'Vous construisez votre site à partir de modèles, pour un abonnement mensuel. C’est vous qui faites le travail, les mises à jour et le référencement.'],
    ['mint', 'sparkles', 'Les Minis Monstres', `Un prix affiché, à partir de ${euro(creation.prix)}, et un interlocuteur qui répond. Je crée votre site et je reste à vos côtés, et ma petite bande de monstres s’occupe des tâches répétitives. Pour les très gros projets, je vous oriente vers une agence.`],
  ];
  const body = `${C.pageHero({
    section: 'comparatif',
    h1: 'Les Minis Monstres et les autres solutions',
    lead: 'Agence web, freelance ou plateforme à faire soi-même : chaque solution a sa place. Chez les Minis Monstres, deux choses comptent : des modifications rapides et un prix affiché, le même pour tous.',
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
  ${md(`## Des modifications rapides

Un horaire, un prix, une actualité : Bricou prépare le changement et un aperçu, puis je le vérifie avant la mise en ligne. Les modifications sont comprises dans votre formule, en ligne sous ${delais.reponse} au plus. Dans une agence ou chez un freelance, la même demande passe souvent par un devis et un délai.

## ${marche.fois} fois moins cher, et sans tour de magie

Un site vitrine commandé à un freelance coûte en général entre ${euro(marche.vitrineMin)} et ${euro(marche.vitrineMax)}. Une agence demande souvent plus. C’est un ordre de grandeur, pas un devis : chaque prestataire a ses prix. Ici, un site vitrine coûte ${euro(creation.prix)}.

La raison est simple. Pour un site vitrine ou une petite boutique, mes automatisations font en quelques heures ce qui prend des jours à la main. Je fais le reste et je contrôle le résultat, page par page. Ces jours en moins, c’est le prix en moins. Le détail est sur la page [pourquoi c’est moins cher](${sections.methode.path}).

## Ce que vous ne faites pas vous-même

Avec une plateforme à faire soi-même, le site n’est jamais fini : il faut apprendre l’outil, choisir les réglages, faire les mises à jour, écrire pour Google. Avec les Minis Monstres, vous dites ce que vous voulez : les automatisations s’occupent du répétitif, et moi du reste. Vous gardez votre temps pour votre activité.

## Quand je vous dirai d’aller ailleurs

Une application sur mesure, un logiciel métier, un catalogue de milliers de produits : ces projets demandent une agence ou un développeur expérimenté. Je vous le dis dès le premier échange.`)}
</div></section>

${f.html}
${C.ctaBand({ title: 'On regarde votre projet ?', text: 'Composez votre site en deux minutes, ou posez vos questions par le formulaire de contact.' })}`;
  return {
    path: sections.comparatif.path,
    section: 'comparatif',
    title: 'Comparatif : agence web, freelance, plateforme | Les Minis Monstres',
    description: 'Agence web, freelance ou plateforme à faire soi-même : qui fait le travail, les prix, les délais, les modifications et le SEO, comparés simplement.',
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
  champs: 'Il manque une information obligatoire. Vérifiez les champs marqués d’une étoile.',
  email: 'Cette adresse e-mail ne semble pas valide. Vérifiez-la, s’il vous plaît.',
  domaine: 'Indiquez le nom de domaine souhaité, ou cochez « J’ai déjà un nom de domaine ».',
  code: 'Ce code événement n’est pas reconnu. Vérifiez-le, ou laissez la case vide : vous pourrez m’écrire ensuite.',
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
    ['globe', 'Je réserve votre nom de domaine', 'Il est à votre nom. Je m’occupe de tout.'],
    ['mail-check', 'Je vous écris sous 24 heures', 'Avec les questions utiles pour démarrer votre site.'],
    ['circle-user', 'Votre espace client arrive par e-mail', 'Vous y suivez votre commande et vos demandes.'],
    ['rocket', 'Votre site est en ligne', `Sous <span data-order="delai">${esc(t0.delai)}</span> pour le type choisi.`],
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
        ${C.siteChoice({ name: 'type' })}
        ${C.optionChoices({ name: 'options[]', quand: 'creation' })}
        <p class="b-label">Ensuite, votre formule chaque mois</p>
        ${C.forfaitChoices({ name: 'forfait' })}
        <div data-avec-formule>
        <p class="b-label">La formule est payée</p>
        <div class="b-seg" role="radiogroup" aria-label="Période de la formule">
          <label><input type="radio" name="periode" value="mois" checked><span>Au mois</span></label>
          <label><input type="radio" name="periode" value="annee"><span>À l’année <em>${annuel.moisOfferts} mois offerts</em></span></label>
        </div>
        <p class="b-label">Le site est payé</p>
        <div class="b-seg" role="radiogroup" aria-label="Paiement du site">
          <label><input type="radio" name="lissage" value="" checked><span>En une fois</span></label>
          ${lissage.durees.map((n) => `<label><input type="radio" name="lissage" value="${n}"><span>En ${n} fois</span></label>`).join('')}
        </div>
        <p class="b-note" data-lisse-note hidden>${icon('info')}Sans frais. Vous vous engagez le temps du paiement, et la formule se règle alors chaque mois.</p>
        </div>
        ${C.codeEvenementBox({ name: 'code_evenement' })}
        </div>
      </fieldset>

      <fieldset class="o-card">
        <legend><span class="b-n">${icon('globe')}</span><span class="b-t">Votre nom de domaine</span></legend>
        <div class="o-in">
        <p class="b-hint">Le nom de domaine, c’est l’adresse de votre site. Il est offert la première année, puis compris dans votre formule, et il reste à votre nom. Je vérifie qu’il est libre, puis je le réserve à la commande.</p>
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
        ${field('parrain', 'Code de parrainage', 'type="text" autocomplete="off" maxlength="20" placeholder="Ex. : LILA-7K2"', { req: false })}
        </div>
      </fieldset>

      <fieldset class="o-card">
        <legend><span class="b-n">3</span><span class="b-t">Paiement sécurisé</span></legend>
        <div class="o-in">
        <label class="check"><input type="checkbox" name="cgv" value="oui" required><span>J’accepte les <a href="/conditions-generales/" target="_blank" rel="noopener">conditions générales de vente</a>. <span class="req">*</span></span></label>
        <label class="check"><input type="checkbox" name="demarrage" value="oui" required><span>Je demande que la création commence tout de suite. Si je me rétracte dans les 14 jours, je paie le travail déjà fait. <span class="req">*</span></span></label>
        <label class="check" data-order-engagement hidden><input type="checkbox" name="engagement" value="oui"><span>Je m’engage pour <span data-order="eng-n">${C.LMAX}</span> mois à partir de la réception, le temps de payer mon site. <span class="req">*</span></span></label>
        <div class="o-pay">
          <p class="o-pay-today"><span>Aujourd’hui vous payez</span><b data-order="today">${euro(today0)}</b></p>
          <ul class="o-pay-lines" data-order-lines>
            <li><span>Acompte de ${paiement.acompte} % sur la création (${t0.label.toLowerCase()})</span><b>${euro(acompte0)}</b></li>
          </ul>
          <p class="o-pay-next"><span data-order="next-label">À la réception : le reste, et votre formule</span><b data-order="next">${euro(t0.price - acompte0)} + ${euro(f0.month)}/mois</b></p>
          <p class="o-pay-note" data-order-solde>À la réception de votre site, vous réglez le reste, <b data-order="solde">${euro(t0.price - acompte0)}</b>, et votre formule démarre. Vous pourrez encore choisir de payer le reste en ${C.lissageTxt} fois.</p>
          <p class="o-pay-note" data-order-lisse-note hidden>À la réception, le reste se paie en <span data-order="lisse-n">${C.LMAX}</span> fois sans frais : <b data-order="lisse">${euro(C.lisse(t0.price))}</b> par mois, avec votre formule. Ensuite, il ne reste que la formule, sans engagement.</p>
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
          <li><span data-order="type">Site Internet Professionnel</span><b data-order="type-price">${euro(t0.price)}</b></li>
          <li><span data-order="domain">Nom de domaine à choisir</span><b data-order="domain-prix">offert</b></li>
          <li><span data-order="forfait">${esc(f0.name)}</span><b data-order="forfait-price">${euro(f0.month)}/mois</b></li>
          <li data-order-opts hidden><span data-order="opts-label">Options</span><b data-order="opts">0 €</b></li>
        </ul>
        <div class="b-total">
          <p><span>Aujourd’hui</span><b data-order="today">${euro(today0)}</b></p>
          <p><span data-order="next-label">À la réception : le reste, et votre formule</span><b data-order="next">${euro(t0.price - acompte0)} + ${euro(f0.month)}/mois</b></p>
          <p data-order-parrain hidden><span>Parrainage</span><b>${fidelite.parrainageMois} mois offert</b></p>
        </div>
        <p class="b-sum-note">${icon('check')}<span data-avec-formule>Votre formule démarre à la réception de votre site, pas avant. Le nom de domaine, lui, est réservé dès la commande.</span><span data-seule-txt hidden>Création seule : pas de formule au mois. À la réception, je vous remets le code de votre site.</span></p>
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
    description: 'Vérifiez votre site, vos options et votre formule, donnez vos coordonnées et payez en ligne en toute sécurité. Je réserve votre nom de domaine sans attendre.',
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
    lead: 'Je m’en occupe dès maintenant. Voici ce qui se passe ensuite.',
    mascot: 'ravie',
  })}
<section class="section"><div class="container container-narrow">
  <div class="confirm reveal">
    <p class="confirm-ref" data-ref-box hidden>${icon('receipt')}<span>Référence de votre commande : <b data-ref></b></span></p>
    <p class="confirm-msg" data-confirm-paid>${icon('circle-check')}<span>Votre paiement est enregistré. La facture arrive par e-mail, et vous la retrouvez dans votre espace client.</span></p>
    <p class="confirm-msg is-wait" data-confirm-wait hidden>${icon('hourglass')}<span>Je vous envoie le lien de paiement sous 24 heures. Votre commande est gardée : rien à faire de votre côté pour l’instant.</span></p>
    <h2 class="h3">Les prochaines étapes</h2>
    ${C.steps([
      { t: 'Je réserve votre nom de domaine', d: 'Il est à votre nom, et compris dans l’abonnement.' },
      { t: 'Je vous écris sous 24 heures', d: 'Pour poser les questions utiles et démarrer votre site.' },
      { t: 'Votre espace client arrive par e-mail', d: 'Vous y suivez votre commande et, ensuite, vos demandes de modification.' },
      { t: 'Votre site est en ligne', d: `Dans le délai de votre type de site : ${delaiList}.` },
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
    description: 'Merci pour votre commande. Je réserve votre nom de domaine, je vous écris sous 24 heures et votre espace client arrive par e-mail.',
    body,
  };
}

// ====================================================================== FIDÉLITÉ
function fidelitePage() {
  const crumbs = crumb('fidelite');
  const f = C.faq(FAQ.fidelite, 'Vos questions sur la fidélité', 'faq-fidelite');
  const perks = [
    ['pink', 'users', 'Parrainage', `${fidelite.parrainageMois} mois offert pour vous deux`, `Un proche fait créer son site grâce à vous : quand il est en ligne, vous recevez chacun un mois d’abonnement offert.`],
    ['butter', 'badge-percent', 'Deuxième site', `${fidelite.remiseSecondSite} % sur la création`, `Un deuxième site ? Sa création coûte ${euro(creation.prix * (100 - fidelite.remiseSecondSite) / 100)} au lieu de ${euro(creation.prix)}. Pour une boutique en ligne, la remise est la même.`],
    ['mint', 'calendar-check', 'À l’année', `${annuel.moisOfferts} mois offerts`, `En payant votre formule à l’année, vous réglez ${12 - annuel.moisOfferts} mois sur 12 : ${euro(ABO_AN)} au lieu de ${euro(ABO.month * 12)} avec ${ABO.name}.`],
  ];
  const body = `${C.pageHero({
    section: 'fidelite',
    h1: 'Fidélité et parrainage',
    lead: 'Merci de me faire confiance, et de parler de moi autour de vous. Voici ce que vous y gagnez.',
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
    { t: 'Un mois offert chacun', d: 'Dès que son site est en ligne, vous recevez tous les deux un mois d’abonnement. Vous suivez vos filleuls dans votre espace.' },
  ])}
</div></section>

${f.html}
${C.ctaBand({ title: 'Quelqu’un a un projet autour de vous ?', text: 'Envoyez-lui le lien du site. Vous y gagnez tous les deux.' })}`;
  return {
    path: sections.fidelite.path,
    section: 'fidelite',
    title: 'Fidélité et parrainage : un mois offert | Les Minis Monstres',
    description: `Parrainez un proche : vous recevez chacun un mois d’abonnement offert. ${fidelite.remiseSecondSite} % de remise sur la création d’un deuxième site, et ${annuel.moisOfferts} mois offerts à l’année.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.5,
  };
}

const DEMO_QR = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const cells = [];
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
    const finder = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17);
    if (!finder && rnd() > 0.52) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
  }
  const eye = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" rx="1.5"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".6"/>`;
  return `<svg viewBox="-2 -2 29 29" class="qr" aria-hidden="true"><rect x="-2" y="-2" width="29" height="29" rx="3" fill="#fff"/><g fill="#2E2A47">${cells.join('')}${eye(0, 0)}${eye(18, 0)}${eye(0, 18)}</g></svg>`;
})();

function monEspacePage() {
  const tab = (id, ic, label, on) => `<button type="button" role="tab" id="tab-${id}" aria-controls="t-${id}" aria-selected="${on ? 'true' : 'false'}"${on ? '' : ' tabindex="-1"'} data-tab="${id}">${icon(ic)}<span>${label}</span></button>`;
  // La cliente imaginaire a la formule Tranquillité. Les modifications sont incluses : pas de jauge à compter.
  const total = ABO.month;
  const reste = 0;
  const body = `${C.pageHero({
    section: 'monespace',
    h1: 'Mon espace : la démo',
    lead: 'Voici l’espace de « Pâtisserie Lila », une cliente imaginaire. Essayez : envoyez une demande de modification, suivez-la, regardez les formules. Rien n’est envoyé.',
    crumbs: DEMO_CRUMBS,
  })}
<section class="section section-app"><div class="container">
  <div class="app" data-app>
    <div hidden data-lia-chat="demo" data-prix="${jetonsLia.bulle.jetons}" data-solde="${reste}" data-uid="demo"${ENERGIE ? '' : ' data-sans-energie="1"'}></div>
    <div hidden data-lia-demo>
      <p data-mots="horaire,fermé,ferme,ouvert,ouvre,hours,closed,open" data-type="demande" data-par="lia" data-cout="31" data-texte="Sur la page Contact, changer les horaires : nous serons fermés le lundi 24 novembre.">C’est noté. J’ai préparé votre demande : il vous reste à la relire et à l’envoyer.</p>
      <p data-mots="photo,image,picture" data-type="demande" data-par="lia" data-cout="41" data-texte="Sur la page d’accueil, remplacer la photo du haut par celle que je joins.">Bien sûr. J’ai préparé la demande : vous pourrez ajouter votre photo avant d’envoyer.</p>
      ${OUTILS_ON ? '<p data-mots="avis,google,review" data-type="outil" data-outil="lienavis" data-nom="Lien d’avis Google" data-cout="0">Le plus simple : donnez à vos clients un lien qui ouvre tout de suite la page pour laisser un avis. Un outil le prépare pour vous.</p>' : ''}
      <p data-mots="combien,reste,limite,modification,comment,how,limit" data-type="onglet" data-onglet="demandes" data-nom="Mes demandes">Vos modifications sont incluses dans votre formule. Vous faites votre demande, Bricou prépare un aperçu, Alex le vérifie, et c’est en ligne.</p>
      <p data-mots="boutique,vendre,nouvelle page,refaire,shop,sell" data-type="demande" data-par="alex" data-texte="Je voudrais ajouter une boutique en ligne à mon site. Pouvez-vous me dire comment faire ?">C’est une grande modification : c’est Alex qui s’en occupe. J’ai préparé votre message pour lui.</p>
      <p data-defaut>Dans votre vrai espace, je réponds à votre question et je prépare ce que vous voulez changer. Essayez par exemple : changer mes horaires.</p>
    </div>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user">${monster('mascotte')}<div><strong>Pâtisserie Lila</strong><small>patisserie-lila.fr</small></div></div>
        <p class="app-badge">${icon('wrench')}<span>Modifications incluses</span></p>
        <div class="app-tabs" role="tablist" aria-label="Mon espace">
          ${tab('accueil', 'house', 'Accueil', true)}
          ${tab('demandes', 'message-circle', 'Mes demandes')}
          ${tab('visibilite', 'gauge', 'Tableau de bord')}
          ${tab('forfait', 'circle-user', 'Mon compte')}
        </div>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bonjour Lila !</h2>
          <div class="app-cards">
            <button type="button" class="app-card c-${ABO.color}" data-go="forfait"><span class="app-card-art" data-app-plan-art>${monster('mascotte')}</span><span><small>Votre compte</small><strong data-app-plan-name>${esc(ABO.name)}</strong><span data-app-plan-price>${euro(ABO.month)} par mois</span></span></button>
            <div class="app-card c-mint"><span class="app-card-ico">${icon('globe')}</span><span><small>Votre site</small><strong>patisserie-lila.fr</strong><span class="dot-ok">En ligne</span></span></div>
            <button type="button" class="app-card c-sky" data-go="visibilite"><span class="app-card-ico">${icon('chart-line')}</span><span><small>Sur 30 jours</small><strong>1 240 visiteurs</strong><span>Voir le tableau de bord</span></span></button>
          </div>
          <p class="app-sub">Que voulez-vous faire ?</p>
          <div class="app-actions">
            <button type="button" data-go="demandes">${icon('message-circle')}<strong>Demander une modification</strong><small>Je m’en occupe</small></button>
            <button type="button" data-go="forfait">${icon('receipt')}<strong>Abonnement et factures</strong><small>Tout au même endroit</small></button>
          </div>
          <p class="app-sub">Dernières activités</p>
          <ul class="app-log" data-log>
            <li>${icon('check')}<span>Horaires d’été mis à jour</span><small>il y a 2 jours</small></li>
            <li>${icon('file-text')}<span>Horaires d’hiver changés par Bricou</span><small>1er novembre</small></li>
          </ul>
        </div>

        <div class="app-panel" role="tabpanel" id="t-demandes" aria-labelledby="tab-demandes" hidden>
          <h2 class="app-h">Mes demandes</h2>
          <p class="app-p">Écrivez ce que vous voulez changer, avec une photo si besoin. Je m’en occupe et vous suivez l’avancement ici.</p>
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

        <div class="app-panel" role="tabpanel" id="t-visibilite" aria-labelledby="tab-visibilite" hidden>
          <h2 class="app-h">Tableau de bord</h2>
          <ul class="demo-voyants" aria-label="État de votre site">
            <li><i></i><span><strong>Site en ligne</strong><small>Tout va bien</small></span></li>
            <li><i></i><span><strong>Sécurité HTTPS</strong><small>Cadenas actif</small></span></li>
            <li><i></i><span><strong>Vitesse</strong><small>Rapide</small></span></li>
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
          <p class="app-note">Position moyenne dans Google sur les 28 derniers jours.</p>
          <p class="app-sub">Pages les plus vues</p>
          <ul class="ranks ranks-pages">
            <li><span>Accueil</span><b>612</b></li>
            <li><span>Nos gâteaux</span><b>298</b></li>
            <li><span>Contact et horaires</span><b>187</b></li>
          </ul>
          <p class="app-note">Mirette, l’observatrice de la bande, suit aussi vos visites heure par heure, les appareils et d’où viennent vos visiteurs.</p>
        </div>

        ${OUTILS_ON ? `<div class="app-panel" role="tabpanel" id="t-outils" aria-labelledby="tab-outils" hidden>
          <h2 class="app-h">QR code et lien d’avis</h2>
          <div class="tool-duo">
            <div class="tool-card">
              <p class="app-sub">${icon('qr-code')}Votre QR code</p>
              ${DEMO_QR}
              <p class="app-note">Il mène à patisserie-lila.fr. À imprimer sur vos cartes, votre vitrine ou vos sacs.</p>
              <button type="button" class="btn btn-light btn-block" data-toast-msg="QR code téléchargé (démo)">${icon('download')}<span>Télécharger</span></button>
            </div>
            <div class="tool-card">
              <p class="app-sub">${icon('star')}Votre lien d’avis Google</p>
              <p class="app-note">Envoyez-le à vos clients contents : il ouvre directement la page pour laisser un avis.</p>
              <input class="copy-in" type="text" readonly value="https://g.page/r/patisserie-lila/review" aria-label="Lien d’avis Google" data-copy-src>
              <button type="button" class="btn btn-primary btn-block" data-copy>${icon('check')}<span>Copier le lien</span></button>
            </div>
          </div>
        </div>` : ''}

        <div class="app-panel" role="tabpanel" id="t-forfait" aria-labelledby="tab-forfait" hidden>
          <h2 class="app-h">Votre formule et vos factures</h2>
          <p class="app-sub">Votre formule</p>
          <div class="app-plans">${forfaits.map((f, i) => `<label class="app-plan c-${f.color}"><input type="radio" name="app-plan" value="${f.id}" data-month="${f.month}" data-name="${esc(f.name)}" data-jetons="0"${i === 0 ? ' checked' : ''}><span class="app-plan-card"><span class="app-plan-art">${monster(i ? 'ravie' : 'mascotte')}</span><strong>${esc(f.name)}</strong><small>${euro(f.month)}/mois</small><small>${esc(f.modifs)}</small></span></label>`).join('')}</div>
          <p class="app-note">Vous changez de formule quand vous voulez. Le changement compte à partir du mois suivant.</p>
          <p class="app-total"><span>Total chaque mois</span><b data-app-total>${euro(total)}</b></p>
          <p class="app-sub">Factures</p>
          <ul class="invoices">
            <li><span>Novembre 2026</span><b>${euro(total)}</b><button type="button" class="link-btn" data-toast-msg="Facture téléchargée (démo)">PDF</button></li>
            <li><span>Octobre 2026</span><b>${euro(total)}</b><button type="button" class="link-btn" data-toast-msg="Facture téléchargée (démo)">PDF</button></li>
          </ul>
          <p class="app-sub">Nom de domaine</p>
          <p class="app-domain">${icon('globe')}<span><strong>patisserie-lila.fr</strong><small>À votre nom, renouvelé automatiquement le 3 mars 2027</small></span></p>
        </div>

      </div>
    </div>
    <p class="app-toast" data-toast role="status" hidden></p>
    <template data-icons>${['check', 'message-circle', 'history'].map((n) => `<span data-i="${n}">${icon(n)}</span>`).join('')}</template>
    <template data-monsters>${forfaits.map((f, i) => `<span data-m="${f.id}">${monster(i ? 'ravie' : 'mascotte')}</span>`).join('')}</template>
  </div>
</div></section>

${C.ctaBand({ title: 'Ça vous plaît ?', text: 'Créez votre site : vous m’envoyez vos demandes, je m’occupe du reste.' })}`;
  return {
    path: '/mon-espace/demo/',
    section: 'monespace',
    noindex: true,
    noMobileBar: true,
    title: 'Mon espace, la démo | Les Minis Monstres',
    description: 'Essayez l’espace client des Minis Monstres : demandes de modification et leur suivi, tableau de bord, formule et factures. Une démonstration sans compte.',
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
    description: 'Connectez-vous à votre espace client des Minis Monstres : demandes de modification et leur suivi, tableau de bord, factures et parrainage.',
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
    lead: `Écrivez-moi. Je vous réponds rapidement, en général dans la journée. Les prix sont déjà affichés : ${euro(creation.prix)} le site, puis ${euro(ABO.month)} par mois. Vous n’avez pas de devis à demander.`,
    crumbs,
  })}
<section class="section"><div class="container contact-grid">
  <div class="form-card" id="devis">
    <h2 class="h3">Votre demande</h2>
    <form class="form" method="post" action="${site.formAction}" data-form novalidate>
      ${formHidden()}
      <p class="form-alert" data-form-error hidden>L’envoi n’a pas abouti. Vérifiez les champs obligatoires, puis réessayez.</p>
      <div class="form-row">
        <div class="field"><label for="c-nom">Votre nom <span class="req">*</span></label><input id="c-nom" name="nom" type="text" autocomplete="name" required></div>
        <div class="field"><label for="c-email">Votre e-mail <span class="req">*</span></label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="c-tel">Téléphone <span class="opt">(facultatif)</span></label><input id="c-tel" name="telephone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="c-type">Votre site <span class="req">*</span></label>
          <select id="c-type" name="type" required><option value="">Choisir…</option>${types.map((t) => opt(t.label)).join('')}${opt('Je ne sais pas encore')}${opt('Autre projet')}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="c-domaine">Nom de domaine <span class="opt">(facultatif)</span></label><input id="c-domaine" name="domaine" type="text" autocomplete="off" placeholder="mon-entreprise.fr"></div>
        <div class="field"><label for="c-parrain">Code de parrainage <span class="opt">(facultatif)</span></label><input id="c-parrain" name="parrain" type="text" autocomplete="off" maxlength="20" placeholder="Ex. : LILA-7K2"></div>
      </div>
      <div class="field"><span class="label">Paiement de l’abonnement</span>
        <div class="radio-group">
          <label><input type="radio" name="paiement" value="Au mois"> Au mois</label>
          <label><input type="radio" name="paiement" value="À l’année"> À l’année</label>
          <label><input type="radio" name="paiement" value="Je ne sais pas encore" checked> Je ne sais pas encore</label>
        </div>
      </div>
      <div class="field"><label for="c-message">Votre message <span class="req">*</span></label><textarea id="c-message" name="message" required minlength="10" placeholder="Votre activité, ce que vous attendez, un site que vous aimez…"></textarea></div>
      <label class="check"><input type="checkbox" name="consentement" value="oui" required><span>J’accepte que mes informations servent à me répondre. <a href="/politique-de-confidentialite/">En savoir plus</a></span></label>
      <button class="btn btn-primary btn-lg" type="submit">${icon('send')}<span>Envoyer ma demande</span></button>
    </form>
  </div>
  <aside class="contact-side">
    ${site.email ? `<a class="contact-card" href="mailto:${site.email}">${icon('mail')}<div><strong>${site.email}</strong><span>Pour envoyer des documents.</span></div></a>` : ''}
    <a class="contact-card c-mint" href="/mon-espace/">${icon('circle-user')}<div><strong>Déjà client ?</strong><span>Vos demandes de modification se font depuis votre espace client.</span></div></a>
    <a class="contact-card c-pink" href="${sections.creer.path}">${icon('wand-sparkles')}<div><strong>Créer mon site</strong><span>Composez votre site et voyez le prix tout de suite.</span></div></a>
    <a class="contact-card" href="${sections.forfaits.path}">${icon(sections.forfaits.icon)}<div><strong>Voir les tarifs</strong><span>${euro(creation.prix)} le site, ${euro(ABO.month)} par mois, et le prix de chaque option.</span></div></a>
    <p class="contact-note">${icon('map-pin')}<span>Tout se fait en ligne : la commande, les échanges, le suivi. Je travaille avec des clients partout en France.</span></p>
  </aside>
</div></section>`;
  return {
    path: '/contact/',
    section: 'contact',
    title: 'Contact : posez votre question | Les Minis Monstres',
    description: 'Une question, un projet de site, de boutique ou de référencement ? Écrivez-nous par le formulaire. Réponse rapide, en général dans la journée.',
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
${C.ctaBand({ title: 'Vous avez votre réponse ?', text: 'Composez votre site en deux minutes : le prix s’affiche avant de commander.' })}`;
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
${C.ctaBand({ title: 'Plus besoin de tout savoir', text: 'On s’occupe de la technique pour vous. Composez votre site en deux minutes, le prix s’affiche tout de suite.' })}`;
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
  const enCours = clients.filter((c) => c.enCreation && c.url && !c.url.includes('aled08'));
  const body = `${C.pageHero({
    section: 'confiance',
    h1: 'Nos réalisations',
    lead: 'Des sites en ligne, que vous pouvez visiter. Pas de faux avis ici : allez les voir par vous-même.',
    crumbs,
  })}
<section class="section"><div class="container">
  ${total ? `<p class="client-total reveal"><b>${total}</b><span>pages en ligne sur les sites de nos clients${le ? `, au ${frDate(le)}` : ''}.<br>Chaque page utile est une porte d’entrée de plus depuis Google.</span></p>` : ''}
  ${clientCards()}
  <p class="small muted center">Les prix sont des estimations : ce que coûterait chaque site aujourd’hui avec notre grille, d’après les pages en ligne. Les pages faites pour Google sont comprises, et les fiches produits ne comptent pas comme des pages. Ces sites s’ouvrent dans un nouvel onglet.</p>
  ${enCours.length ? `<p class="center muted">En ce moment, je prépare aussi ${enCours.map((c) => esc(c.nom)).join(' et ')}.</p>` : ''}
</div></section>
${METIERS.length ? `<section class="section section-soft"><div class="container">
  <h2 class="section-title">Et pour votre métier ?</h2>
  <p class="section-sub">Ce qu’un site doit montrer change d’un métier à l’autre. Voici ce que je prévois pour le vôtre.</p>
  ${metierCards()}
</div></section>` : ''}
${C.ctaBand({ title: 'Le prochain, c’est le vôtre ?', text: `Composez votre site en deux minutes. Le prix est affiché, le même pour tous : à partir de ${euro(creation.prix)}.` })}`;
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
// Alex, et sa petite bande de monstres : un prénom et une tâche chacun. Ce que l'accueil montrait avant, en entier.
function equipePage() {
  const crumbs = crumb('equipe');
  const body = `${C.pageHero({
    section: 'equipe',
    h1: 'Notre équipe : moi et ma petite bande',
    lead: 'Un humain qui conçoit et vérifie tout, et une bande de petits monstres, chacun avec son métier. C’est comme ça que votre site coûte moins cher, sans être fait à la va-vite.',
    crumbs,
  })}
<section class="section section-bande" id="bande"><div class="container">
  <div class="alex-bulle reveal"><span class="alex-art">${C.alexPortrait({ title: 'Alex' })}</span><p><strong>Moi, c’est Alex.</strong> Je conçois votre site, je vérifie tout et je reste votre interlocuteur. À côté, j’ai programmé une petite bande de compagnons : ce sont mes automatisations, dessinées en petits monstres. Chacun a un métier, des missions et son caractère. Ils travaillent seuls, et rien ne part en ligne sans mon accord.</p></div>
  ${C.bandeGrid({ complet: true })}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Comment on travaille ensemble</h2>
  <div class="feats feats-3">
    <div class="feat reveal">${icon('palette')}<h3>Je conçois</h3><p>Votre maquette, vos pages et vos textes importants : c’est moi, du début à la fin.</p></div>
    <div class="feat reveal">${icon('sparkles')}<h3>La bande s’occupe du répétitif</h3><p>Sauvegardes, préparation des modifications, pages pour Google, statistiques : chaque monstre fait son métier, sans se lasser.</p></div>
    <div class="feat reveal">${icon('shield-check')}<h3>Je vérifie</h3><p>Rien ne part en ligne sans un œil humain. Et pour tout le reste, vous parlez directement avec moi.</p></div>
  </div>
  <p class="center more">${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Une modification, du début à la fin</h2>
  ${C.processusModif({ titre: false })}
</div></section>
${C.ctaBand({ title: 'On s’occupe de votre site ?', text: 'Composez-le en deux minutes, le prix s’affiche tout de suite. Ou écrivez-moi pour en parler.' })}`;
  return {
    path: sections.equipe.path,
    section: 'equipe',
    title: 'Notre équipe : moi, Alex, et ma petite bande de monstres | Les Minis Monstres',
    description: 'Je conçois chaque site et je vérifie tout. Ma petite bande de monstres a chacun son métier : secrétaire, constructeur, rédactrice, gardien. Faites connaissance.',
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
  // Conseils d'une page métier : une option (packseo, boutique) ou une formule (base, evolution). Les anciennes options sont ignorées.
  const opts = (m.options || []).map((o) => {
    if (o.id === 'boutique') return { ic: 'shopping-bag', nom: 'Boutique en ligne', prix: `+ ${euro(creation.boutique)}, une fois`, pourquoi: o.pourquoi };
    const fo = forfaits.find((x) => x.id === o.id);
    if (fo) return { ic: 'repeat', nom: `Formule ${fo.name}`, prix: `${euro(fo.month)} par mois`, pourquoi: o.pourquoi };
    const opt = options.find((x) => x.id === o.id && !x.retire);
    if (opt) return { ic: opt.icon, nom: opt.name, prix: `+ ${euro(opt.price.once)}, une fois`, pourquoi: o.pourquoi };
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
  ${opts.length ? `<h2 class="section-title">Ce que je vous conseille</h2>
  <p class="section-sub">Rien n’est obligatoire. Voici ce qui sert le plus.</p>
  <div class="opt-group opt-conseil reveal"><ul>${opts.map((o) => `<li><span class="opt-ico">${icon(o.ic)}</span><span class="opt-txt"><strong>${esc(o.nom)}</strong><small>${inline(o.pourquoi)}</small></span><span class="opt-price">${o.prix}</span></li>`).join('')}</ul></div>` : ''}
  ${ex ? `<h2 class="section-title metier-ex-titre">Un exemple en ligne</h2>
  ${m.exemple.texte ? `<p class="section-sub">${inline(m.exemple.texte)}</p>` : ''}
  <div class="client-cards client-cards-solo"><a class="client-card c-${ex.color} reveal" href="${ex.url}" target="_blank" rel="noopener"><span class="type-ico">${icon(ex.icon)}</span><span class="client-genre">${esc(ex.genre)}</span><strong>${esc(ex.nom)}</strong><span class="client-url">${icon('globe')}${esc(ex.domaine)}${icon('arrow-right')}</span></a></div>` : ''}
</div></section>` : ''}
${f.html}
${voirCards(m.voir || [])}
${C.ctaBand({ title: `On crée votre site ?`, text: `Composez votre site en deux minutes : ${euro(creation.prix)}, jusqu’à ${creation.pages} pages. Ou écrivez-moi pour en parler d’abord.` })}`;
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

// ====================================================================== DOCUMENTATION
function docPage() {
  const crumbs = crumb('documentation');
  const IMG = {
    espace: [1668, 1071], demandes: [1668, 1286], chico: [1482, 1082], titan: [1482, 2697],
    boutique: [1482, 1823], vacances: [654, 650], 'site-dodedo': [1500, 938], 'site-flore': [1500, 938],
  };
  const fig = (k, alt, cap, cls = '') => `<figure class="doc-fig ${cls} reveal"><img src="/assets/img/doc/${k}.webp" width="${IMG[k][0]}" height="${IMG[k][1]}" alt="${esc(alt)}" loading="lazy" decoding="async"><figcaption>${cap}</figcaption></figure>`;
  const une = T('une-page'), vit = T('vitrine'), bou = T('boutique');
  const seo = O('seo');
  const toc = [
    ['etapes', 'list-checks', 'Comment ça se passe'],
    ['lia-alex', 'sparkles', 'Bricou et moi'],
    ['questionnaire', 'clipboard-check', 'Le questionnaire de création'],
    ['sites', 'layout-template', 'Les sites'],
    ['prix', sections.forfaits.icon, 'Le prix'],
    ['espace', 'circle-user', 'L’espace client'],
    ['demandes', 'message-circle', 'Demander une modification'],
    ENERGIE ? ['jetons', 'coins', 'L’énergie et les outils'] : ['jetons', 'sparkles', 'Cerise et Bricou'],
    ['tableau', 'gauge', 'Le tableau de bord'],
    ['boutique', 'shopping-bag', 'La boutique en ligne'],
    ['seo', 'search-check', 'Le référencement (SEO)'],
    ['paiement', 'credit-card', 'Paiement et fidélité'],
  ];
  // Les deux tableaux de la partie « Le prix » : les options (une fois, à la création) et les extras (au mois).
  // Chaque ligne : le nom, pour quel site, le prix. Les descriptions sont sur la page Tarifs.
  const pourQui = (o) => (o.types ? o.types.map((id) => T(id).label).join(', ') : 'Tous les sites');
  const ligne = (nom, qui, prix) => `<tr><th scope="row">${nom}</th><td>${qui}</td><td>${prix}</td></tr>`;
  const tableau = (titre, lignes) => `<div class="doc-table-wrap reveal"><table class="doc-table jl-table">
    <colgroup><col style="width:44%"><col style="width:34%"><col style="width:22%"></colgroup>
    <thead><tr><th scope="col">${titre}</th><th scope="col">Pour quel site</th><th scope="col">Prix</th></tr></thead>
    <tbody>${lignes.join('')}</tbody>
  </table></div>`;
  const lignesOptions = [ligne(esc(bou.label), 'Tous les sites', `+ ${euro(creation.boutique)}`),...C.optsCreation.map((o) => ligne(esc(o.name), pourQui(o), `+ ${euro(o.price.once)}`))];
  const lignesExtras = C.optsMois.map((o) => ligne(esc(o.name), pourQui(o), `${euro(o.price.month)} par mois`));
  const tabs = [
    ['gauge', 'Tableau de bord', 'vos visiteurs et l’état de votre site, en un coup d’œil.'],
    ['house', 'Accueil', 'votre abonnement, votre site, vos dernières activités.'],
    ['package', 'Ma commande', 'le suivi de la création de votre site, étape par étape.'],
    ['message-circle', 'Mes demandes', 'vous écrivez ce qu’il faut changer, et vous suivez où ça en est.'],
    ['shopping-bag', 'Ma boutique', 'codes promo, soldes, bandeau et mode vacances (boutiques en ligne).'],
    ['gift', 'Parrainage', 'votre code à partager, et les mois offerts gagnés.'],
    ['circle-user', 'Mon compte', 'vos coordonnées, votre mot de passe, votre formule et vos factures.'],
  ];
  const body = `${C.pageHero({
    section: 'documentation',
    h1: 'Documentation : tout comprendre, en images',
    lead: 'Comment on crée votre site, ce que vous payez, à quoi ressemble votre espace client et ce que vous voyez dans votre tableau de bord. Les captures sont des exemples, avec des chiffres inventés.',
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
    <li><strong>Vous composez votre site en ligne.</strong> Type de site, nom de domaine, options : le prix total s’affiche avant de commander.</li>
    <li><strong>Vous réglez un acompte de ${paiement.acompte} %.</strong> C’est le signal de départ : je commence la création.</li>
    <li><strong>Vous remplissez le questionnaire de création.</strong> Dans votre espace client : couleurs, ambiance, photos, prix ou produits. C’est lui qui lance la création.</li>
    <li><strong>Je crée votre site.</strong> Vous suivez chaque étape dans l’onglet « Ma commande » de votre espace client.</li>
    <li><strong>Vous recevez votre site et payez le reste.</strong> En une fois, ou en ${lissage.durees.join(' ou ')} fois sans frais.</li>
    <li><strong>Votre abonnement démarre.</strong> Hébergement, sécurité, mises à jour et modifications du mois : on s’occupe de tout.</li>
  </ol>
  <p class="doc-more">${C.btn(sections.creer.path, 'btn-primary', 'wand-sparkles', 'Composer mon site')}</p>
</div></section>

<section class="section section-soft doc-sec" id="lia-alex"><div class="container container-narrow">
  <p class="doc-kicker">2. Bricou et moi</p>
  <h2>Deux pour s’occuper de votre site</h2>
  <div class="doc-duo-qui">
    <div class="doc-qui c-pink reveal"><span class="doc-qui-art">${C.petit('bricou')}</span><h3>Bricou, le bricoleur de la bande</h3><p>Il fait les petites et moyennes modifications. Il me montre d’abord votre demande, puis vous laisse valider l’aperçu : rien ne change sans votre accord.</p></div>
    <div class="doc-qui c-sky reveal"><span class="doc-qui-art">${C.alexPortrait({ title: 'Alex' })}</span><h3>Moi, l’humain de la bande</h3><p>Je crée votre site, je fais les grandes modifications à la main, je vérifie et je réponds à vos questions. Ce que Bricou ne sait pas faire me revient.</p></div>
  </div>
  <p class="doc-more">${C.btn(sections.liaalex.path, 'btn-primary', 'sparkles', 'Pourquoi les Minis Monstres')} ${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>
</div></section>

<section class="section doc-sec" id="questionnaire"><div class="container container-narrow">
  <p class="doc-kicker">3. Le questionnaire de création</p>
  <h2>Ce que je vous demande pour créer votre site</h2>
  <p>Après votre commande, un questionnaire vous attend dans l’onglet « Ma commande ». Il est déjà prérempli avec votre nom de domaine et vos coordonnées. Vos réponses me suffisent pour créer le site : pas de rendez-vous, pas d’allers-retours. Vous pouvez les modifier tant que le site n’est pas en ligne.</p>
  <div class="doc-brief">
    ${['une-page', 'vitrine', 'boutique'].map((tid, k) => `<details class="doc-brief-type"${k === 0 ? ' open' : ''}><summary>${icon(tid === 'boutique' ? 'shopping-bag' : tid === 'vitrine' ? 'layout-template' : 'file-text')}Pour ${tid === 'boutique' ? 'une' : 'un'} ${esc(T(tid).label.toLowerCase())}</summary>
      <ol class="doc-brief-sections">${BRIEF.pour(tid).map((sec) => `<li><strong>${icon(sec.icon)}${esc(sec.titre)}</strong><ul>${sec.champs.map((c) => `<li><span>${esc(c.label)}${c.requis ? ' <em class="doc-req">obligatoire</em>' : ''}</span>${briefDetail(c)}</li>`).join('')}</ul></li>`).join('')}</ol>
    </details>`).join('')}
  </div>
</div></section>

<section class="section section-soft doc-sec" id="sites"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">4. Les sites</p>
    <h2>Un seul prix, jusqu’à ${creation.pages} pages</h2>
    <p>Une seule page ou plusieurs : le site coûte ${euro(creation.prix)} jusqu’à ${creation.pages} pages, et le prix ne change pas en cours de route. ${esc(C.PAGES_SEO)} La boutique en ligne ajoute ${euro(creation.boutique)}.</p>
  </div>
  <div class="doc-types">
    ${[[une, 'Pour être présent sur internet sans complication : tout tient sur une page qu’on fait défiler.'], [vit, 'Pour présenter une activité en détail, avec une page par sujet et un menu.'], [bou, 'Pour vendre en ligne : paiement par carte, suivi des commandes, et les outils de la boutique.']].map(([t, d]) => `<div class="doc-type reveal"><strong>${esc(t.label)}</strong><b>${C.prixType(t)}</b><span>${icon('clock')}${esc(t.delai)}</span><p>${d}</p></div>`).join('')}
  </div>
  <div class="doc-duo">
    ${fig('site-dodedo', 'Page d’accueil du site Dodedo', 'Un vrai site client : <a href="https://www.dodedo.fr/" target="_blank" rel="noopener">dodedo.fr</a>, un site une page avec des pages de conseils autour.')}
    ${fig('site-flore', 'Aperçu du site Flore & Chenilles', 'Un autre site client : <a href="https://www.floreetchenilles.fr/" target="_blank" rel="noopener">floreetchenilles.fr</a>, des compositions à découvrir et à réserver par e-mail.')}
  </div>
  <p class="doc-more center">${C.btn(sections.confiance.path, 'btn-light', 'handshake', 'Voir les sites de nos clients')}</p>
</div></section>

<section class="section doc-sec" id="prix"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">5. Le prix</p>
    <h2>Un site, deux options, deux formules</h2>
    <p>Il n’y a qu’une offre, la même pour tous les clients. Vous payez votre site une fois. Ensuite, vous choisissez votre formule : elle démarre à la réception du site, et vous l’arrêtez quand vous voulez depuis votre espace client.</p>
  </div>
  <div class="doc-types">
    <div class="doc-type reveal"><strong>Le site</strong><b>${euro(creation.prix)}</b><span>${icon('wand-sparkles')}Une fois</span><p>Jusqu’à ${creation.pages} pages. Nom de domaine et hébergement offerts la première année.</p></div>
    <div class="doc-type reveal"><strong>Les options</strong><b>${C.PACK_SEO ? `+ ${euro(C.PACK_SEO.price.once)}` : ''} ou + ${euro(creation.boutique)}</b><span>${icon('plus')}Une fois, si vous voulez</span><p>${C.PACK_SEO ? `${esc(C.PACK_SEO.name)} : ${C.PACK_SEO.pages} pages SEO en plus. ` : ''}Boutique en ligne : vendre sur votre site.</p></div>
    <div class="doc-type reveal"><strong>La formule</strong><b>${forfaits.map((x) => euro(x.month)).join(' ou ')}</b><span>${icon('repeat')}Par mois, sans engagement</span><p>${forfaits.map((x) => esc(x.name)).join(' ou ')}. À l’année : ${annuel.moisOfferts} mois offerts.</p></div>
  </div>
  <div class="container-narrow">
    ${forfaits.map((x) => `<h3>Ce que comprend ${esc(x.name)}</h3><ul class="list-check">${x.details.map((d) => `<li>${inline(d)}</li>`).join('')}</ul>`).join('')}
  </div>
  <div class="doc-cards3">
    <div class="doc-mini reveal"><strong>${icon('wrench')}Modifications incluses</strong><p>Dans les deux formules, sans les compter. En ligne sous ${ABO.delai} au plus, ou ${C.EVO.delai} en moyenne avec ${esc(C.EVO.name)}.</p></div>
    <div class="doc-mini reveal"><strong>${icon('search-check')}Pages pour Google</strong><p>Les pages que vous n’utilisez pas sur les ${creation.pages} deviennent des pages SEO, pour être trouvé plus souvent.</p></div>
    <div class="doc-mini reveal"><strong>${icon('ticket')}Code événement</strong><p>Rencontrés sur une foire, un marché ou un salon ? Votre code donne ${evenement.remise} % de remise sur la création du site.</p></div>
  </div>
  <p class="doc-more center">${C.btn(sections.forfaits.path, 'btn-light', sections.forfaits.icon, 'La page des tarifs')}</p>
</div></section>

<section class="section section-soft doc-sec" id="espace"><div class="container">
  <div class="doc-split">
    <div>
      <p class="doc-kicker">6. L’espace client</p>
      <h2>Tout votre site, au même endroit</h2>
      <p>Chaque client a son espace, sur ordinateur comme sur téléphone. Tous les onglets sont visibles d’un coup, sans rien faire glisser.</p>
      <ul class="doc-tabs">${tabs.map(([ic, t, d]) => `<li>${icon(ic)}<span><strong>${t}</strong> : ${d}</span></li>`).join('')}</ul>
      <p class="doc-note">L’onglet « Ma boutique » n’apparaît que pour les boutiques en ligne.</p>
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
      <h2>Vous demandez, on s’en charge ensemble</h2>
      <p>Vos modifications sont comprises dans votre formule, sans les compter. Voici comment ça se passe :</p>
      <ol class="doc-steps">${C.ETAPES_MODIF.map(([, t, d]) => `<li><strong>${esc(t)}.</strong> ${esc(d)}</li>`).join('')}</ol>
      <ul class="list-check">
        <li>Si une demande demande plus de travail, je la fais moi-même, à la main.</li>
        <li>Une demande peut être annulée gratuitement pendant 24 heures, 3 fois par mois.</li>
      </ul>
      <p class="doc-more">${C.btn(sections.accompagnement.path, 'btn-light', sections.accompagnement.icon, 'L’accompagnement')}</p>
    </div>
  </div>
</div></section>

${ENERGIE ? `<section class="section doc-sec" id="jetons"><div class="container container-narrow">
  <p class="doc-kicker">8. L’énergie et les outils</p>
  <h2>L’énergie de vos petits monstres</h2>
  <p>Chaque mois, votre petite bande a ${ABO.jetons} d’énergie. Vous l’utilisez comme vous voulez, en retouches de votre site ou en outils.</p>
  <div class="doc-table-wrap reveal"><table class="doc-table jl-table">
    <thead><tr><th scope="col">Dans l’onglet « Outils »</th><th scope="col">Ce que ça fait</th><th scope="col">Prix</th></tr></thead>
    <tbody>
      ${OUTILS_LIA.map((t) => `<tr><th scope="row">${t.name}</th><td>${t.court}</td><td>${t.jetonsLocal ? `${t.jetonsLocal} à ${t.jetons} d’énergie` : jl(t.jetons)}</td></tr>`).join('')}
      <tr><th scope="row">Retouche du site par la bande</th><td>Depuis l’onglet « Mes demandes ».</td><td>${JL_MODIF}</td></tr>
    </tbody>
  </table></div>
  <ul class="list-check">
    <li>L’énergie de l’abonnement repart à ${ABO.jetons} le 1<sup>er</sup> de chaque mois. Ce qui reste ne se garde pas.</li>
    <li>Pour en reprendre : à partir de ${jetonsLia.recharge[0].jetons} d’énergie pour ${jetonsLia.recharge[0].prix} €, ajoutés à votre prochaine facture. Cette énergie-là reste jusqu’à ce que vous l’utilisiez.</li>
    <li>Les outils qui tournent sur votre appareil en utilisent juste un peu, une seule fois pour un même résultat.</li>
  </ul>
  <p class="doc-more">${C.btn(sections.espace.path, 'btn-light', 'toolbox', 'Voir tous les outils')}</p>
</div></section>` : `<section class="section doc-sec" id="jetons"><div class="container container-narrow">
  <p class="doc-kicker">8. Cerise et Bricou</p>
  <h2>Deux petits monstres, à votre service</h2>
  <p>Dans votre espace client, deux membres de ma petite bande vous aident chaque jour.</p>
  <ul class="list-check">
    <li><strong>Cerise</strong>, la secrétaire, répond à vos questions dans la bulle, en bas de l’écran, et prépare vos demandes. Jusqu’à ${limites.bulleJour} messages par jour.</li>
    <li><strong>Bricou</strong>, le constructeur, prépare vos modifications et leur aperçu. Je les vérifie avant la mise en ligne.</li>
  </ul>
</div></section>`}

<section class="section section-soft doc-sec" id="tableau"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">9. Le tableau de bord</p>
    <h2>Vos chiffres, suivis par Mirette</h2>
    <p>Le tableau de bord est compris dans votre formule. Mirette, l’observatrice de la bande, suit vos visites et la vitesse de votre site. Les visites sont comptées sans cookie et sans donnée personnelle. Les chiffres se mettent à jour toutes les heures.</p>
  </div>
  <div class="doc-compare">
    <div class="doc-compare-col reveal">
      <p class="doc-badge c-${ABO.color}"><span>${monster('mascotte')}</span>L’essentiel, en un coup d’œil</p>
      ${fig('chico', 'Tableau de bord, l’essentiel', 'L’essentiel : les voyants de votre site, vos visiteurs sur 30 jours, vos apparitions et vos meilleures recherches sur Google, vos pages les plus vues, et vos commandes si vous avez une boutique.', 'doc-fig-flat')}
    </div>
    <div class="doc-compare-col reveal">
      <p class="doc-badge c-lilac"><span>${monster('clin')}</span>Tout le détail, plus bas</p>
      ${fig('titan', 'Tableau de bord complet', `Plus bas dans le même tableau : la courbe des 30 derniers jours, les visites heure par heure, les appareils, la provenance des visiteurs et la santé du serveur. Et un rapport simple chaque mois.`, 'doc-fig-flat')}
    </div>
  </div>
  <ul class="doc-legend reveal">
    <li><span class="doc-dot ok"></span><span><strong>Voyants</strong> : site en ligne, cadenas HTTPS, vitesse, serveur, espace disque. Vert, tout va bien.</span></li>
    <li><span class="doc-dot"></span><span><strong>Provenance</strong> : Google, accès direct, réseaux sociaux ou autres sites.</span></li>
    <li><span class="doc-dot"></span><span><strong>Serveur</strong> : la mémoire de votre site, la charge du serveur et l’espace disque, en jauges.</span></li>
  </ul>
</div></section>

<section class="section doc-sec" id="boutique"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">10. La boutique en ligne</p>
    <h2>Vos outils de vente, réglés en quelques secondes</h2>
    <p>Dans l’onglet « Ma boutique », vous gérez vous-même vos petites opérations, en quelques secondes.</p>
  </div>
  <div class="doc-split">
    <ul class="doc-tools">
      <li>${icon('badge-percent')}<span><strong>Codes promo</strong>En % ou en €, ou la livraison offerte. Date de fin, commande minimum, nombre d’utilisations : tout se règle en un formulaire.</span></li>
      <li>${icon('tag')}<span><strong>Soldes rapides</strong>De -5 à -70 % sur toute la boutique ou une catégorie. Les prix barrés apparaissent seuls et disparaissent à la date de fin.</span></li>
      <li>${icon('megaphone')}<span><strong>Bandeau d’annonce</strong>Une phrase en haut du site, en quatre couleurs au choix.</span></li>
      <li>${icon('sun')}<span><strong>Mode vacances</strong>Boutique fermée, ou commandes acceptées avec expédition au retour. Un aperçu montre ce que verront vos visiteurs.</span></li>
    </ul>
    ${fig('vacances', 'Aperçu du mode vacances', 'L’aperçu du mode vacances, tel qu’il s’affiche pendant que vous remplissez le formulaire.', 'doc-fig-small')}
  </div>
  ${fig('boutique', 'L’onglet Ma boutique', 'L’onglet « Ma boutique » : codes promo, soldes rapides et bandeau (exemple).', 'doc-fig-wide')}
</div></section>

<section class="section section-soft doc-sec" id="seo"><div class="container container-narrow">
  <p class="doc-kicker">11. Le référencement (SEO)</p>
  <h2>Être trouvé sur Google</h2>
  <p>Tous les sites partent avec de bonnes bases : des titres et des descriptions écrits pour Google, un plan du site, des pages rapides et lisibles sur téléphone. Avec l’extra ${esc(seo.name)}, à ${euro(seo.price.month)} par mois, le travail continue : je suis les mots que vos clients tapent, j’améliore vos pages pour Google et je vous dis où vous en êtes.</p>
  <div class="go-links">
    <a class="go-link c-${sections.seo.color}" href="${sections.seo.path}"><span class="type-ico">${icon(sections.seo.icon)}</span><strong>Le référencement en détail</strong>${icon('arrow-right')}</a>
    <a class="go-link c-${sections.guides.color}" href="${sections.guides.path}"><span class="type-ico">${icon(sections.guides.icon)}</span><strong>Les guides pratiques</strong>${icon('arrow-right')}</a>
    ${LEXIQUE.termes.length ? `<a class="go-link c-${sections.lexique.color}" href="${sections.lexique.path}"><span class="type-ico">${icon(sections.lexique.icon)}</span><strong>Le lexique du web</strong>${icon('arrow-right')}</a>` : ''}
    <a class="go-link c-${sections.confiance.color}" href="${sections.confiance.path}"><span class="type-ico">${icon(sections.confiance.icon)}</span><strong>Les pages créées pour nos clients</strong>${icon('arrow-right')}</a>
  </div>
</div></section>

<section class="section doc-sec" id="paiement"><div class="container container-narrow">
  <p class="doc-kicker">12. Paiement et fidélité</p>
  <h2>Payer simplement, et être remercié</h2>
  <ul class="list-check">
    <li>Acompte de ${paiement.acompte} % à la commande, le reste à la réception du site, en une fois ou en ${lissage.durees.join(' ou ')} fois sans frais.</li>
    <li>Abonnement au mois, ou à l’année avec ${annuel.moisOfferts} mois offerts. Sans engagement.</li>
    <li>Parrainage : quand le site d’un filleul est en ligne, vous recevez chacun ${fidelite.parrainageMois} mois d’abonnement offert.</li>
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
    description: 'Tout comprendre en images : la création de votre site, le prix, les deux formules, les modifications, l’espace client, le tableau de bord et la boutique.',
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
