// Pages du site
const { site, sections, types, forfaits, annuel, lissage, delais, options, fidelite, paiement, jetonsLia, boost, aLaDemande, creation, marche } = require('../config');
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
const jl = (n) => (n ? `${n} point${n > 1 ? 's' : ''} d’énergie` : 'Gratuit');
const JL_MODIF = `${jetonsLia.modif.base} points d’énergie, plus 1 par tranche de ${jetonsLia.modif.mots} mots et ${jetonsLia.modif.image} par photo`;
// Une modification par Cerise coûte de 30 jetons (la base) à 65 (la plus grosse demande que Cerise accepte : trois photos et leur légende).
const JL_MODIF_FOURCHETTE = `${jetonsLia.modif.base} à 65`;
// Ce que font les jetons de l'abonnement en un mois : des modifications par Cerise, ou des utilisations d'outils.
const JL_MODIFS_MOIS = '2 à 3';
const JL_OUTILS_MOIS = 'une dizaine';
// Le prix des outils payants, du moins cher au plus cher (en jetons)
const JL_OUTIL_MIN = Math.min(...OUTILS_LIA.filter((t) => t.jetons).map((t) => t.jetons));
const JL_OUTIL_MAX = Math.max(...OUTILS_LIA.map((t) => t.jetons));
// « 100 jetons pour 1 €, 500 pour 5 €, 1000 pour 10 € »
const RECHARGES = jetonsLia.recharge.map((r, i) => `${r.jetons}${i ? '' : ' points d’énergie'} pour ${r.prix} €`).join(', ');
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
    ['search-check', 'Être trouvé sur Google', 'Votre site est préparé pour Google dès le premier jour : les bons mots, une page par service, un site rapide sur téléphone.'],
    ['badge-check', 'Avoir l’air aussi sérieux qu’un grand', 'Un site soigné, à votre nom, avec votre adresse e-mail pro si vous voulez. Vos clients vous prennent au sérieux tout de suite.'],
    ['shield-check', 'Ne plus vous occuper de rien', 'Nom de domaine, hébergement, mises à jour, sauvegardes : je m’en charge. Vous, vous faites votre métier.'],
    ['message-circle', 'Parler à une vraie personne', 'Une question, une modification ? Vous m’écrivez depuis votre espace client, et je vous réponds moi-même.'],
  ];
  const body = `<section class="hero">
  <div class="container hero-in">
    <div class="hero-text">
      <h1>Votre site professionnel, <mark>visible sur Google</mark></h1>
      <p class="hero-lead">Je crée votre site, je m’occupe de tout, et je reste votre interlocuteur. Sans jargon, sans surprise, sans devis compliqué. Et c’est ${marche.fois} fois moins cher qu’une création classique.</p>
      <div class="hero-ctas">${C.btnCreer('btn-primary btn-lg btn-flaque')}${C.btn(sections.confiance.path, 'btn-light btn-lg', sections.confiance.icon, 'Voir les réalisations')}</div>
      <ul class="hero-points">
        <li>${icon('check')}Tout compris, sans devis</li>
        <li>${icon('check')}Nom de domaine à votre nom</li>
        <li>${icon('check')}Sans engagement</li>
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
      <span class="scene-m sm-4">${C.petit('chaton', { humeur: 'ravi' })}</span>
      <span class="scene-m sm-5">${C.petit('etoile')}</span>
      <p class="hero-tag">${icon('sparkles')}Fait par Alex, aidé de sa petite bande</p>
    </div>
  </div>
</section>

<section class="section section-soft c-butter">${C.deco('dino', 'haut-gauche')}<div class="container">
  <h2 class="section-title">Des sites en ligne, à visiter</h2>
  <p class="section-sub">Pas de faux avis ici : allez voir par vous-même.</p>
  ${clientCards({ max: 3, desc: false })}
  <p class="center more">${C.btn(sections.confiance.path, 'btn-light', sections.confiance.icon, 'Toutes les réalisations')}</p>
</div></section>

<section class="section">${C.deco('nuage', 'cote-droite')}<div class="container">
  <h2 class="section-title">Ce que vous y gagnez</h2>
  <div class="feats">${gains.map(([ic, t, d]) => `<div class="feat reveal">${icon(ic)}<h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</div></section>

<section class="section section-soft section-equipe-court"><div class="container center">
  <h2 class="section-title">Notre équipe</h2>
  <p class="section-sub">Alex conçoit chaque site à la main. Ses petits monstres, programmés par lui, font le répétitif à côté.</p>
  <div class="equipe-court reveal" aria-hidden="true"><span>${C.alexPortrait()}</span>${['coucou', 'mochi', 'bricou', 'fantome', 'nuage'].map((n) => `<span>${n === 'coucou' ? monster('coucou') : C.petit(n)}</span>`).join('')}</div>
  <p class="more">${C.btn(sections.equipe.path, 'btn-light btn-flaque', sections.equipe.icon, 'Rencontrer l’équipe')}</p>
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Le prix, en clair</h2>
  <p class="section-sub">Tout est compris, rien n’est caché, et c’est le même prix pour tous.</p>
  ${C.offre({ compact: true })}
  <p class="center small muted">C’est moi qui conçois votre site. Ma petite bande s’occupe du répétitif, et j’ai des accès directs chez des hébergeurs français. Vous ne payez que le temps utile.</p>
  <p class="center more">${C.btn(sections.forfaits.path, 'btn-light btn-flaque', 'arrow-right', 'Tout le détail des tarifs')}</p>
</div></section>

${C.ctaBand({ title: 'Pas sûr de ce qu’il vous faut ?', text: 'Écrivez-moi en deux lignes : je vous dis quel site vous convient, sans engagement. Ou composez-le tout de suite.' })}`;
  return {
    path: '/',
    title: `Site internet professionnel, ${marche.fois} fois moins cher | Les Minis Monstres`,
    description: `Je crée votre site professionnel, visible sur Google, et je m’occupe de tout : nom de domaine, hébergement, mises à jour. Sans devis, ${marche.fois} fois moins cher.`,
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
function clientCards({ max = 0, desc = true } = {}) {
  const liste = max ? CLIENTS_EN_LIGNE.slice(0, max) : CLIENTS_EN_LIGNE;
  return `<div class="client-cards">${liste
    .map((c) => `<a class="client-card c-${c.color} reveal" href="${c.url}" target="_blank" rel="noopener"><span class="type-ico">${icon(c.icon)}</span><span class="client-genre">${esc(c.genre)}</span><strong>${esc(c.nom)}</strong>${desc ? `<span class="client-desc">${inline(c.desc)}</span>` : ''}${pagesDe(c) ? `<span class="client-pages"><b>${pagesDe(c)}</b> page${pagesDe(c) > 1 ? 's' : ''}</span>` : ''}<span class="client-url">${icon('globe')}${esc(c.domaine)}${icon('arrow-right')}</span></a>`)
    .join('')}</div>`;
}

// ====================================================================== CRÉER MON SITE
function creerPage() {
  const crumbs = crumb('creer');
  const f = C.faq(FAQ.creation, 'Vos questions sur la création', 'faq-creation');
  const body = `${C.pageHero({
    section: 'creer',
    h1: 'Composez votre site en deux minutes',
    lead: 'Choisissez votre site, votre nom de domaine et vos options. Tout est compris, le total s’affiche tout de suite, et vous commandez en ligne quand vous êtes prêt.',
    crumbs,
  })}
<section class="section section-builder"><div class="container">${C.configurator()}</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Et ensuite ?</h2>
  ${C.steps([
    { t: 'Vous commandez', d: `Vous réglez ${paiement.acompte} % du site. Le reste et l’abonnement viennent à la réception.` },
    { t: 'Je réserve votre nom de domaine', d: 'Il est à votre nom. Je vous écris sous 24 heures avec les questions utiles pour démarrer.' },
    { t: 'Je crée votre site', d: 'Vous recevez un aperçu. Vous me dites ce qui change, je corrige.' },
    { t: 'C’est en ligne', d: `Vous réglez le reste, en une fois ou en ${C.lissageTxt} fois sans frais. L’abonnement démarre, et vos modifications passent par votre espace client.` },
  ])}
</div></section>

${f.html}`;
  return {
    path: sections.creer.path,
    section: 'creer',
    bodyClass: 'page-creer',
    noMobileBar: true,
    title: 'Créer mon site : composez-le en deux minutes | Les Minis Monstres',
    description: `Composez votre site en deux minutes : tout est compris, à partir de ${creation.prix} €. Vérifiez votre nom de domaine, ajoutez vos options, le total s’affiche.`,
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
  const pages = O('pages');
  const body = `${C.pageHero({
    section: 'forfaits',
    h1: `Tarifs : tout compris, ${marche.fois} fois moins cher`,
    lead: `Le site, son nom de domaine, l’hébergement, les mises à jour et le suivi : tout est compris, le même prix pour tous, sans devis. À partir de ${euro(creation.prix)} le site, puis ${euro(ABO.month)} par mois. Les options sont à part, et vous les choisissez.`,
    crumbs,
  })}
<section class="section"><div class="container" data-billing-scope>
  <h2 class="section-title">L’offre, en entier</h2>
  <p class="section-sub">Le site se paie une fois. L’abonnement est obligatoire : sans nom de domaine, sans hébergement et sans mises à jour, un site ne tient pas longtemps.</p>
  ${C.billingSwitch()}
  ${C.offre()}
  ${C.economie()}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Quel site, pour ce prix ?</h2>
  <p class="section-sub">Une page, ou un site vitrine jusqu’à cinq pages : c’est ${euro(creation.prix)}. Avec une boutique en ligne, c’est ${euro(creation.prix + creation.boutique)}.</p>
  <div class="create-prices">${types
    .map(
      (t) => `<a class="create-price c-${t.color} reveal" href="${C.creerUrl({ type: t.id })}">
      <span class="type-ico">${icon(t.icon)}</span>
      <strong>${esc(t.label)}</strong>
      <b>${euro(t.price)}</b>
      <small>${icon('timer')}${esc(t.delai)}</small>
      <p class="create-qui">${inline(t.pourQui)}</p>
      <ul>${t.inclus.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>
    </a>`
    )
    .join('')}</div>
  <p class="center small muted">Un site plus grand ? L’option « ${esc(pages.name)} » coûte ${euro(pages.price.once)}. Au-delà, <a href="${C.contactUrl}">écrivez-nous</a>.</p>
</div></section>

<section class="section" id="options"><div class="container">
  <h2 class="section-title">Les options et les extras</h2>
  <p class="section-sub">Une option se paie une fois, à la création. Un extra au mois s’ajoute ou se retire quand vous voulez. Et quelques extras se commandent à l’unité, seulement quand vous en avez besoin.</p>
  ${C.optionsCompact()}
  ${C.extrasDemande()}
</div></section>

<section class="section section-soft" id="bande"><div class="container">
  <h2 class="section-title">Votre petite bande</h2>
  <p class="section-sub">L’abonnement de base, c’est un petit monstre : le gardien, qui veille sur votre site. Chaque option au mois en ajoute un, avec sa tâche. Et toute la bande vous aide au quotidien dans votre espace client.</p>
  ${C.bandeGrid()}
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Payer, et arrêter si vous le voulez</h2>
  ${C.payBox()}
  <div class="jetons-box reveal">
    <h3>${icon('log-out')}Et si vous arrêtez ?</h3>
    <ul class="list-check">
      <li><strong>Vous arrêtez quand vous voulez</strong> : un message suffit, ou le bouton de votre espace client. L’abonnement se termine à la fin de la période déjà payée.</li>
      <li><strong>Votre nom de domaine reste à vous</strong> : il est à votre nom, et vous le transférez où vous voulez.</li>
      <li><strong>Vous repartez avec votre site</strong> : je vous remets ses fichiers, textes, images et pages, pour le faire héberger ailleurs. Notre hébergement s’arrête 30 jours après la fin de l’abonnement.</li>
      <li><strong>La seule exception</strong> : si vous payez le reste du site en ${C.lissageTxt} fois, vous vous engagez le temps de ce paiement. Si vous partez avant, ce qui reste du prix du site est dû en une fois.</li>
    </ul>
  </div>
</div></section>

<section class="section section-soft"><div class="container duo">
  <a class="promo c-butter reveal" href="${sections.comparatif.path}">
    <span class="promo-ico">${icon('scale')}</span>
    <span class="promo-text"><strong>Et par rapport aux autres solutions ?</strong><span>Agence, freelance, plateforme : la comparaison, ligne par ligne.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
  <a class="promo c-pink reveal" href="${sections.fidelite.path}">
    <span class="promo-ico">${icon('gift')}</span>
    <span class="promo-text"><strong>Parrainez, et gagnez un mois</strong><span>Un mois d’abonnement offert, pour vous comme pour votre filleul.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
</div></section>

${f.html}
${C.ctaBand({ title: 'Le prix vous convient ?', text: 'Composez votre site en deux minutes : le total s’affiche avant de commander.' })}`;
  return {
    path: sections.forfaits.path,
    section: 'forfaits',
    title: `Tarifs : tout compris, ${marche.fois} fois moins cher | Les Minis Monstres`,
    description: `Tout compris : maquette, site complet, nom de domaine, hébergement, mises à jour et support. À partir de ${creation.prix} € le site, puis ${ABO.month} € par mois. Sans devis.`,
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== NOS OUTILS
// Sur la page publique, les outils sont présentés sans parler de Cerise (elle vit dans la bulle et dans l'espace client) :
// on montre la phrase courte de chaque outil, et ces trois-là sont redits autrement.
const PUBLIC_OUTIL = {
  question: ['Une question sur internet', 'Posez votre question sur votre site, Google ou les réseaux : la réponse arrive, simple et claire.'],
  conseilphoto: ['Conseils sur une photo', 'Des conseils simples pour réussir vos photos avec votre téléphone.'],
  conseilpage: ['Conseils pour ma page', 'Une page de votre site relue, avec ce qu’il faut changer en premier.'],
};
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

<section class="section" id="outils-lia"><div class="container">
  <h2 class="section-title">Les outils de votre espace</h2>
  <p class="section-sub">Ils sont dans votre espace client : il suffit d’être connecté. Rien d’autre à installer, aucun autre compte à créer.</p>
  ${Object.entries(FAMILLES_OUTILS).map(([fid, fnom]) => `<h3 class="tools-famille reveal">${fnom}</h3>
  <div class="tools">${OUTILS_LIA.filter((t) => t.categorie === fid).map(
    (t) => `<div class="tool c-${t.color} reveal"><span class="tool-ico">${icon(t.icon)}</span><span class="tool-body"><strong>${PUBLIC_OUTIL[t.id] ? PUBLIC_OUTIL[t.id][0] : t.name}</strong><span>${PUBLIC_OUTIL[t.id] ? PUBLIC_OUTIL[t.id][1] : t.court}</span></span>${t.jetons && !t.visuel ? '' : '<span class="tool-tag c-mint">Gratuit</span>'}</div>`
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

<section class="section" id="compris"><div class="container container-narrow">
  <p class="kicker c-butter">${icon('gift')}Compris dans l’abonnement</p>
  <h2>Des outils compris, sans compter</h2>
  <p>Les outils et les petites retouches de votre site sont compris dans l’abonnement, pour un usage normal. Si un mois vous en faites beaucoup plus, vous pouvez en reprendre depuis votre espace client, à petit prix. Une retouche qui échoue ne compte jamais.</p>
</div></section>

<section class="section section-soft"><div class="container split">
  <div class="reveal">
    <p class="kicker c-mint">${icon('message-circle')}Demande de modification</p>
    <h2>Une demande, et c’est fait</h2>
    <p>Un horaire, un prix, une photo, un nouveau produit ? Écrivez-le dans votre espace, avec une photo si besoin. La petite bande prépare la retouche en 5 minutes, avec un aperçu : votre site ne change qu’après votre accord. Ou Alex s’en charge à la main, sous ${delais.reponse}, et vérifie lui-même.</p>
    <ul class="list-check">
      <li>Vous suivez chaque demande : reçue, en cours, faite</li>
      <li>Avec Alex : ${UNE_MODIF} ${PAR_PERIODE}, comprise dans l’abonnement</li>
      <li>Une de plus par Alex ? ${euro(boost.prix)} à l’unité, ajoutée à votre prochaine facture</li>
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
  const seo = O('seo'), stats = O('stats');
  // Ce qui est compris dans l'abonnement, et les deux extras qui vont plus loin : [couleur, humeur de Cerise, titre, prix, liste]
  const levels = [
    ['pink', 'mascotte', 'Les bases', 'Comprises dans l’abonnement', ['Site rapide, sécurisé et adapté au téléphone', 'Titres, descriptions et données lues par Google', 'Site déclaré dans Google Search Console']],
    ['butter', 'clin', seo.name, `Extra à ${euro(seo.price.month)} par mois`, ['Les bases, bien sûr', 'Je regarde les mots que vos clients tapent', 'J’améliore vos pages pour Google, chaque mois', 'Je vous montre où vous en êtes']],
    ['lilac', 'pense', stats.name, `Extra à ${euro(stats.price.month)} par mois`, ['Vos visiteurs, heure par heure', 'Les pages vues et la provenance des visites', 'Un rapport simple chaque mois']],
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
    <div class="feat reveal">${icon('chart-line')}<h3>Le suivi, en extra</h3><p>Positions, recherches, visites : avec l’extra ${seo.name}, je regarde ce qui marche et j’ajuste vos pages chaque mois.</p></div>
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
  <h2 class="section-title">Ce qui est compris, et ce qui est en extra</h2>
  <div class="seo-levels">${levels
    .map(
      ([c, humeur, t, prix, list]) => `<div class="seo-level c-${c} reveal"><span class="seo-art">${C.bouille(humeur)}</span><p class="seo-name">${esc(t)}<small>${prix}</small></p><ul class="list-check">${list.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>`
    )
    .join('')}</div>
  <p class="source">Un extra s’ajoute ou se retire quand vous voulez, depuis votre espace client. Tous les prix sont sur la page <a href="${sections.forfaits.path}#options">tarifs</a>.</p>
</div></section>

<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Ce que je ne promets pas

Personne ne peut garantir la première place sur Google. Méfiez-vous de ceux qui le font.

Les premiers résultats arrivent en général en quelques semaines, parfois quelques mois pour les recherches les plus disputées.

Je ne publie pas des centaines de pages vides pour gonfler votre site : Google les repère et les pénalise. Je préfère peu de contenus, mais vraiment utiles à vos clients.`)}
</div></section>

${f.html}
${C.ctaBand({ title: 'Être trouvé, ça commence ici', text: 'Créez votre site : les bases du SEO sont comprises, et le suivi s’ajoute quand vous voulez.', mascot: 'clin' })}`;
  return {
    path: sections.seo.path,
    section: 'seo',
    title: 'Référencement SEO : être trouvé sur Google | Les Minis Monstres',
    description: `Bases du SEO comprises, référencement local, contenus utiles, et un suivi chaque mois en extra à ${seo.price.month} € : comment je rends votre site visible sur Google.`,
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
    ['mint', 'sparkles', 'Les Minis Monstres', `Un prix affiché, à partir de ${euro(creation.prix)}, et un interlocuteur qui répond. Alex crée et suit votre site, et ses automatisations s’occupent des petites retouches et des tâches répétitives. Pour les très gros projets, je vous oriente vers une agence.`],
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

Un horaire, un prix, une actualité : mes automatisations préparent le changement en quelques minutes, vous montre l’aperçu, puis le met en ligne dès que vous dites oui. Pour ce qui demande un regard humain, c’est Alex, sous ${delais.reponse}. Dans une agence ou chez un freelance, la même demande passe souvent par un devis et un délai.

## ${marche.fois} fois moins cher, et sans tour de magie

Un site vitrine commandé à un freelance coûte en général entre ${euro(marche.vitrineMin)} et ${euro(marche.vitrineMax)}. Une agence demande souvent plus. C’est un ordre de grandeur, pas un devis : chaque prestataire a ses prix. Ici, un site vitrine coûte ${euro(creation.prix)}.

Soyons complets : des offres à bas prix existent aussi, entre ${euro(marche.basMin)} et ${euro(marche.basMax)} le site. Face à elles, nous sommes au même niveau de prix.

La raison est simple. Pour un site vitrine ou une petite boutique, mes automatisations font en quelques heures ce qui prend des jours à la main. Je fais le reste et je contrôle le résultat, page par page. Ces jours en moins, c’est le prix en moins. Le détail est sur la page [pourquoi c’est moins cher](${sections.methode.path}).

## Ce que vous ne faites pas vous-même

Avec une plateforme à faire soi-même, le site n’est jamais fini : il faut apprendre l’outil, choisir les réglages, faire les mises à jour, écrire pour Google. Avec les Minis Monstres, vous dites ce que vous voulez : les automatisations s’occupent du répétitif, Alex du reste. Vous gardez votre temps pour votre activité.

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
        <p class="b-label">Ensuite, chaque mois</p>
        ${C.forfaitChoices({ name: 'forfait' })}
        ${C.optionChoices({ name: 'options[]', quand: 'mois' })}
        <p class="b-label">L’abonnement est payé</p>
        <div class="b-seg" role="radiogroup" aria-label="Période de l’abonnement">
          <label><input type="radio" name="periode" value="mois" checked><span>Au mois</span></label>
          <label><input type="radio" name="periode" value="annee"><span>À l’année <em>${annuel.moisOfferts} mois offerts</em></span></label>
        </div>
        <p class="b-label">Le site est payé</p>
        <div class="b-seg" role="radiogroup" aria-label="Paiement du site">
          <label><input type="radio" name="lissage" value="" checked><span>En une fois</span></label>
          ${lissage.durees.map((n) => `<label><input type="radio" name="lissage" value="${n}"><span>En ${n} fois</span></label>`).join('')}
        </div>
        <p class="b-note" data-lisse-note hidden>${icon('info')}Sans frais. Vous vous engagez le temps du paiement, et l’abonnement se règle alors chaque mois.</p>
        </div>
      </fieldset>

      <fieldset class="o-card">
        <legend><span class="b-n">${icon('globe')}</span><span class="b-t">Votre nom de domaine</span></legend>
        <div class="o-in">
        <p class="b-hint">L’adresse de votre site. Elle est comprise dans l’abonnement et reste à votre nom. Je vérifie qu’elle est libre, puis je la réserve à la commande.</p>
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
          <p class="o-pay-next"><span data-order="next-label">À la réception : le reste, et l’abonnement</span><b data-order="next">${euro(t0.price - acompte0)} + ${euro(f0.month)}/mois</b></p>
          <p class="o-pay-note" data-order-solde>À la réception de votre site, vous réglez le reste, <b data-order="solde">${euro(t0.price - acompte0)}</b>, et votre abonnement démarre. Vous pourrez encore choisir de payer le reste en ${C.lissageTxt} fois.</p>
          <p class="o-pay-note" data-order-lisse-note hidden>À la réception, le reste se paie en <span data-order="lisse-n">${C.LMAX}</span> fois sans frais : <b data-order="lisse">${euro(C.lisse(t0.price))}</b> par mois, avec l’abonnement. Ensuite, il ne reste que l’abonnement, sans engagement.</p>
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
          <li><span data-order="type">${esc(t0.label)}</span><b data-order="type-price">${euro(t0.price)}</b></li>
          <li><span data-order="domain">Nom de domaine à choisir</span><b>inclus</b></li>
          <li><span data-order="forfait">${esc(f0.name)}</span><b data-order="forfait-price">${euro(f0.month)}/mois</b></li>
          <li data-order-opts hidden><span data-order="opts-label">Options</span><b data-order="opts">0 €</b></li>
        </ul>
        <div class="b-total">
          <p><span>Aujourd’hui</span><b data-order="today">${euro(today0)}</b></p>
          <p><span data-order="next-label">À la réception : le reste, et l’abonnement</span><b data-order="next">${euro(t0.price - acompte0)} + ${euro(f0.month)}/mois</b></p>
          <p data-order-parrain hidden><span>Parrainage</span><b>${fidelite.parrainageMois} mois offert</b></p>
        </div>
        <p class="b-sum-note">${icon('check')}L’abonnement démarre à la réception de votre site, pas avant. Le nom de domaine, lui, est réservé dès la commande.</p>
      </div>
      <div class="o-next reveal">
        <h2 class="h3">${icon('list-checks')}Ce qui se passe ensuite</h2>
        <ol>${nextSteps.map(([ic, t, d]) => `<li>${icon(ic)}<span><strong>${t}</strong><small>${d}</small></span></li>`).join('')}</ol>
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
    description: 'Vérifiez votre site, l’abonnement et vos options, donnez vos coordonnées et payez en ligne en toute sécurité. Je réserve votre nom de domaine sans attendre.',
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
    ['mint', 'calendar-check', 'À l’année', `${annuel.moisOfferts} mois offerts`, `En payant l’abonnement à l’année, vous réglez ${euro(ABO_AN)} au lieu de ${euro(ABO.month * 12)}.`],
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
  // La cliente imaginaire a un site vitrine : on montre les extras de tous les sites, pas ceux des boutiques.
  const extras = C.optsMois.filter((o) => !o.types);
  const extrasBoutique = C.optsMois.filter((o) => o.types);
  const actifs = ['mail']; // les extras déjà pris dans la démo
  const stats = O('stats');
  const total = ABO.month + extras.filter((o) => actifs.includes(o.id)).reduce((n, o) => n + o.price.month, 0);
  // Jetons déjà dépensés ce mois-ci dans la démo (deux demandes faites) : la même valeur que « used » dans src/assets/js/main.js.
  const DEPENSES = 62;
  const reste = Math.max(0, ABO.jetons - DEPENSES);
  const body = `${C.pageHero({
    section: 'monespace',
    h1: 'Mon espace : la démo',
    lead: 'Voici l’espace de « Pâtisserie Lila », une cliente imaginaire. Essayez : envoyez une demande de modification, suivez-la, ajoutez un extra à l’abonnement. Rien n’est envoyé.',
    crumbs: DEMO_CRUMBS,
  })}
<section class="section section-app"><div class="container">
  <div class="app" data-app>
    <div hidden data-lia-chat="demo" data-prix="${jetonsLia.bulle.jetons}" data-solde="${reste}" data-uid="demo"></div>
    <div hidden data-lia-demo>
      <p data-mots="horaire,fermé,ferme,ouvert,ouvre,hours,closed,open" data-type="demande" data-par="lia" data-cout="31" data-texte="Sur la page Contact, changer les horaires : nous serons fermés le lundi 24 novembre.">C’est noté. J’ai préparé votre demande : il vous reste à la relire et à l’envoyer.</p>
      <p data-mots="photo,image,picture" data-type="demande" data-par="lia" data-cout="41" data-texte="Sur la page d’accueil, remplacer la photo du haut par celle que je joins.">Bien sûr. J’ai préparé la demande : vous pourrez ajouter votre photo avant d’envoyer.</p>
      <p data-mots="avis,google,review" data-type="outil" data-outil="lienavis" data-nom="Lien d’avis Google" data-cout="0">Le plus simple : donnez à vos clients un lien qui ouvre tout de suite la page pour laisser un avis. Un outil le prépare pour vous.</p>
      <p data-mots="jeton,reste,combien,token" data-type="onglet" data-onglet="forfait" data-nom="Abonnement et factures">Il vous reste ${reste - jetonsLia.bulle.jetons} points d’énergie ce mois-ci. Ils reviennent le 1er du mois. Une retouche faite par la bande en utilise ${jetonsLia.modif.base} et plus.</p>
      <p data-mots="boutique,vendre,nouvelle page,refaire,shop,sell" data-type="demande" data-par="alex" data-texte="Je voudrais ajouter une boutique en ligne à mon site. Pouvez-vous me dire comment faire ?">C’est une grande modification : c’est Alex qui s’en occupe. J’ai préparé votre message pour lui.</p>
      <p data-defaut>Dans votre vrai espace, je réponds à votre question et je prépare ce que vous voulez changer. Essayez par exemple : changer mes horaires.</p>
    </div>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user">${monster('mascotte')}<div><strong>Pâtisserie Lila</strong><small>patisserie-lila.fr</small></div></div>
        <div class="jauge" data-jauge>
          <p class="jauge-head">${icon('pencil')}<span>Énergie</span><b><span data-jetons>${reste}</span> / <span data-jetons-max>${ABO.jetons}</span></b></p>
          <span class="jauge-bar"><i data-jauge-fill style="width:${Math.round((reste / ABO.jetons) * 100)}%"></i></span>
        </div>
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
          <p class="app-note">Avec l’extra « ${esc(stats.name)} », en plus : vos visites heure par heure, les appareils, d’où viennent vos visiteurs, et un rapport chaque mois.</p>
        </div>

        <div class="app-panel" role="tabpanel" id="t-outils" aria-labelledby="tab-outils" hidden>
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
        </div>

        <div class="app-panel" role="tabpanel" id="t-forfait" aria-labelledby="tab-forfait" hidden>
          <h2 class="app-h">Abonnement et factures</h2>
          <p class="app-sub">Votre abonnement</p>
          <label class="app-plan c-${ABO.color}"><input type="radio" name="app-plan" value="${ABO.id}" data-month="${ABO.month}" data-name="${esc(ABO.name)}" data-jetons="${ABO.jetons}" checked><span class="app-plan-card"><span class="app-plan-art">${monster('mascotte')}</span><strong>${esc(ABO.name)}</strong><small>${euro(ABO.month)}/mois</small><small>${ABO.modifs}</small></span></label>
          <p class="app-sub">Vos extras</p>
          <div class="app-opts">${extras
            .map(
              (o) => `<label class="app-opt"><span class="app-opt-ico">${icon(o.icon)}</span><span class="app-opt-txt"><strong>${esc(o.name)}${C.infoBtn(o.id, o.name, o.info)}</strong><small>${euro(o.price.month)} par mois</small></span><input type="checkbox" role="switch" value="${o.id}" data-month="${o.price.month}"${actifs.includes(o.id) ? ' checked' : ''}><span class="switch" aria-hidden="true"></span></label>`
            )
            .join('')}</div>
          <p class="app-note">Un extra s’ajoute ou se retire quand vous voulez.${extrasBoutique.length ? ` Pour une boutique en ligne, il y en a ${extrasBoutique.length === 2 ? 'deux' : extrasBoutique.length} de plus : ${extrasBoutique.map((o) => esc(o.name.toLowerCase())).join(' et ')}.` : ''}</p>
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
    <template data-monsters><span data-m="${ABO.id}">${monster('mascotte')}</span></template>
  </div>
</div></section>

${C.ctaBand({ title: 'Ça vous plaît ?', text: 'Créez votre site : vous m’envoyez vos demandes, je m’occupe du reste.' })}`;
  return {
    path: '/mon-espace/demo/',
    section: 'monespace',
    noindex: true,
    noMobileBar: true,
    title: 'Mon espace, la démo | Les Minis Monstres',
    description: 'Essayez l’espace client des Minis Monstres : demandes de modification et leur suivi, tableau de bord, abonnement, extras et factures. Démonstration.',
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
    lead: 'Vos demandes de modification et leur suivi, votre tableau de bord, votre parrainage et vos factures, au même endroit.',
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
    lead: 'Des sites en ligne, que vous pouvez visiter. Pas de faux avis ici : allez voir par vous-même, et jugez sur pièce.',
    crumbs,
  })}
<section class="section"><div class="container">
  ${total ? `<p class="client-total reveal"><b>${total}</b><span>pages en ligne sur les sites de nos clients${le ? `, au ${frDate(le)}` : ''}.<br>Chaque page utile est une porte d’entrée de plus depuis Google.</span></p>` : ''}
  ${clientCards()}
  <p class="small muted center">Ces sites s’ouvrent dans un nouvel onglet.</p>
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
    h1: 'Notre équipe : Alex et sa petite bande',
    lead: 'Un humain qui conçoit et vérifie tout, et une bande de petits monstres qui s’occupent du répétitif. C’est comme ça que votre site coûte moins cher, sans être fait à la va-vite.',
    crumbs,
  })}
<section class="section section-bande" id="bande"><div class="container">
  <div class="alex-bulle reveal"><span class="alex-art">${C.alexPortrait({ title: 'Alex' })}</span><p><strong>Moi, c’est Alex.</strong> Je conçois et je fais votre site moi-même. À côté, j’ai pris le temps de programmer une petite bande de compagnons : ce sont mes automatisations. Chacun a son prénom et une seule tâche, répétitive mais utile. Ils travaillent en autonomie, et je vérifie tout ce qu’ils font.</p></div>
  ${C.bandeGrid({ complet: true })}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Comment on travaille ensemble</h2>
  <div class="feats">
    <div class="feat reveal">${icon('palette')}<h3>Alex conçoit</h3><p>Votre maquette, vos pages et vos textes importants : c’est moi, du début à la fin.</p></div>
    <div class="feat reveal">${icon('sparkles')}<h3>La bande s’occupe du répétitif</h3><p>Mises à jour, sauvegardes, petites retouches, chiffres du mois : chaque monstre fait sa tâche, sans se lasser.</p></div>
    <div class="feat reveal">${icon('shield-check')}<h3>Alex vérifie</h3><p>Rien ne part en ligne sans un œil humain. Et pour tout le reste, vous parlez directement avec moi.</p></div>
  </div>
  <p class="center more">${C.btn(sections.methode.path, 'btn-light', sections.methode.icon, 'Pourquoi c’est moins cher')}</p>
</div></section>
${C.ctaBand({ title: 'On s’occupe de votre site ?', text: 'Composez-le en deux minutes, le prix s’affiche tout de suite. Ou écrivez-moi pour en parler.' })}`;
  return {
    path: sections.equipe.path,
    section: 'equipe',
    title: 'Notre équipe : Alex et sa petite bande de monstres | Les Minis Monstres',
    description: 'Alex conçoit chaque site à la main. Sa petite bande de monstres programmés s’occupe du répétitif : mises à jour, sauvegardes, retouches. Faites connaissance.',
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
  const opts = (m.options || []).map((o) => {
    const opt = options.find((x) => x.id === o.id);
    if (opt) return { ic: opt.icon, nom: opt.name, prix: opt.price.once ? `+ ${euro(opt.price.once)}, une fois` : `${euro(opt.price.month)} par mois`, pourquoi: o.pourquoi };
    const x = aLaDemande.find((y) => y.id === o.id);
    if (x) return { ic: x.icon, nom: x.name, prix: `${euro(x.prix)}, à la demande`, pourquoi: o.pourquoi };
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
${C.ctaBand({ title: `On crée votre site ?`, text: `Composez votre site en deux minutes : tout est compris, à partir de ${euro(creation.prix)}. Ou écrivez-moi pour en parler d’abord.` })}`;
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
    espace: [1668, 1157], demandes: [1668, 1284], chico: [1482, 1082], titan: [1482, 2697],
    boutique: [1482, 1823], vacances: [654, 650], 'site-dodedo': [1500, 938], 'site-flore': [1500, 938],
  };
  const fig = (k, alt, cap, cls = '') => `<figure class="doc-fig ${cls} reveal"><img src="/assets/img/doc/${k}.webp" width="${IMG[k][0]}" height="${IMG[k][1]}" alt="${esc(alt)}" loading="lazy" decoding="async"><figcaption>${cap}</figcaption></figure>`;
  const une = T('une-page'), vit = T('vitrine'), bou = T('boutique');
  const stats = O('stats'), seo = O('seo');
  const toc = [
    ['etapes', 'list-checks', 'Comment ça se passe'],
    ['lia-alex', 'sparkles', 'Bricou et Alex'],
    ['questionnaire', 'clipboard-check', 'Le questionnaire de création'],
    ['sites', 'layout-template', 'Les sites'],
    ['prix', sections.forfaits.icon, 'Le prix'],
    ['espace', 'circle-user', 'L’espace client'],
    ['demandes', 'message-circle', 'Demander une modification'],
    ['jetons', 'coins', 'L’énergie et les outils'],
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
    ['circle-user', 'Mon compte', 'vos coordonnées, votre mot de passe, votre abonnement, vos extras et vos factures.'],
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
  <p class="doc-kicker">2. Bricou et Alex</p>
  <h2>Deux pour s’occuper de votre site</h2>
  <div class="doc-duo-qui">
    <div class="doc-qui c-pink reveal"><span class="doc-qui-art">${C.petit('bricou')}</span><h3>Bricou, le bricoleur de la bande</h3><p>Il fait les petites et moyennes modifications. Il montre d’abord votre demande à Alex, puis vous laisse valider l’aperçu : rien ne change sans votre accord.</p></div>
    <div class="doc-qui c-sky reveal"><span class="doc-qui-art">${icon('user')}</span><h3>Alex, l’humain</h3><p>Il crée votre site, fait les grandes modifications à la main, vérifie et répond à vos questions. Ce que Bricou ne sait pas faire lui revient.</p></div>
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
    <h2>Trois types de site, un seul prix</h2>
    <p>Une page ou un site vitrine : le prix de la création est le même, et il ne change pas en cours de route. La boutique en ligne ajoute ${euro(creation.boutique)}. Le délai court à partir du moment où j’ai vos textes et vos photos.</p>
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
    <h2>Un site, un abonnement, et vos options</h2>
    <p>Il n’y a qu’une offre, la même pour tous les clients. Vous payez votre site une fois. Ensuite, l’abonnement le fait vivre : il est obligatoire, et vous l’arrêtez quand vous voulez depuis votre espace client.</p>
  </div>
  <div class="doc-types">
    <div class="doc-type reveal"><strong>Le site</strong><b>${euro(creation.prix)}</b><span>${icon('wand-sparkles')}Une fois</span><p>Une page, ou un site vitrine jusqu’à cinq pages. Avec une boutique en ligne : ${euro(bou.price)}.</p></div>
    <div class="doc-type reveal"><strong>L’abonnement</strong><b>${euro(ABO.month)}</b><span>${icon('repeat')}Par mois, sans engagement</span><p>Il démarre à la réception du site. À l’année : ${euro(ABO_AN)}, soit ${annuel.moisOfferts} mois offerts.</p></div>
    <div class="doc-type reveal"><strong>Options et extras</strong><b>Au choix</b><span>${icon('plus')}Jamais obligatoires</span><p>Les options se règlent une seule fois, avec le site. Les extras se règlent au mois, et s’arrêtent quand vous voulez.</p></div>
  </div>
  <div class="container-narrow">
    <h3>Ce que comprend l’abonnement</h3>
    <ul class="list-check">${ABO.details.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>
    <h3>Le prix des options et des extras</h3>
  </div>
  ${tableau('À la création, une fois', lignesOptions)}
  ${tableau('Chaque mois, à ajouter ou retirer', lignesExtras)}
  <div class="doc-cards3">
    <div class="doc-mini reveal"><strong>${icon('coins')}Énergie</strong><p>L’abonnement en donne ${ABO.jetons} points par mois. Un point vaut 1 centime, et une modification par Bricou en coûte ${JL_MODIF_FOURCHETTE}.</p></div>
    <div class="doc-mini reveal"><strong>${icon('sparkles')}Plus d’énergie</strong><p>Vous en reprenez à l’utilisation : ${RECHARGES}, ajoutés à votre prochaine facture. Ces points-là restent jusqu’à ce que vous les utilisiez.</p></div>
    <div class="doc-mini reveal"><strong>${icon('hand-coins')}À la demande</strong><p>${aLaDemande.map((x) => `${esc(x.name)} : ${euro(x.prix)}`).join('. ')}. Payés une fois, ajoutés à votre prochaine facture.</p></div>
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
      <h2>Vous écrivez, Bricou ou Alex s’en charge</h2>
      <p>Pour chaque demande, vous choisissez qui la fait :</p>
      <ul class="list-check">
        <li><strong>Bricou</strong>, le bricoleur de ma petite bande, fait les petites et moyennes modifications, sur une seule page. Il vous montre l’aperçu, et ne change rien sans votre accord.</li>
        <li><strong>Alex</strong> fait les plus grandes, à la main. Si une demande est trop grosse pour Bricou, elle passe à Alex.</li>
        <li>Une demande peut être annulée gratuitement pendant 24 heures, 3 fois par mois.</li>
        <li>L’énergie de vos petits monstres et vos interventions d’Alex (${UNE_MODIF} ${PAR_PERIODE}) sont affichés en haut de votre espace.</li>
        <li>Besoin de plus ? Un article, un point avec Alex ou une demande sous 24 heures se commandent à l’unité, dans le même onglet.</li>
      </ul>
      <p class="doc-more">${C.btn(sections.accompagnement.path, 'btn-light', sections.accompagnement.icon, 'L’accompagnement')}</p>
    </div>
  </div>
</div></section>

<section class="section doc-sec" id="jetons"><div class="container container-narrow">
  <p class="doc-kicker">8. L’énergie et les outils</p>
  <h2>L’énergie de vos petits monstres</h2>
  <p>Chaque mois, votre petite bande a ${ABO.jetons} points d’énergie. Un point vaut 1 centime. Vous les utilisez comme vous voulez, en retouches de votre site ou en outils.</p>
  <div class="doc-table-wrap reveal"><table class="doc-table jl-table">
    <thead><tr><th scope="col">Dans l’onglet « Outils »</th><th scope="col">Ce que ça fait</th><th scope="col">Prix</th></tr></thead>
    <tbody>
      ${OUTILS_LIA.map((t) => `<tr><th scope="row">${t.name}</th><td>${t.court}</td><td>${jl(t.jetons)}</td></tr>`).join('')}
      <tr><th scope="row">Retouche du site par la bande</th><td>Depuis l’onglet « Mes demandes ».</td><td>${JL_MODIF}</td></tr>
    </tbody>
  </table></div>
  <ul class="list-check">
    <li>L’énergie de l’abonnement repart à ${ABO.jetons} points le 1<sup>er</sup> de chaque mois. Ce qui reste ne se garde pas.</li>
    <li>Pour en reprendre : à partir de ${jetonsLia.recharge[0].jetons} points pour ${jetonsLia.recharge[0].prix} €, ajoutés à votre prochaine facture. Ces points-là restent jusqu’à ce que vous les utilisiez.</li>
    <li>Les outils gratuits tournent sur votre appareil : ils ne consomment rien.</li>
  </ul>
  <p class="doc-more">${C.btn(sections.espace.path, 'btn-light', 'toolbox', 'Voir tous les outils')}</p>
</div></section>

<section class="section section-soft doc-sec" id="tableau"><div class="container">
  <div class="container-narrow">
    <p class="doc-kicker">9. Le tableau de bord</p>
    <h2>Le tableau simple, et le tableau complet</h2>
    <p>Le tableau de bord simple est compris dans l’abonnement. Le tableau complet vient avec l’extra « ${esc(stats.name)} », à ${euro(stats.price.month)} par mois. Les visites sont comptées sans cookie et sans donnée personnelle. Les chiffres se mettent à jour toutes les heures.</p>
  </div>
  <div class="doc-compare">
    <div class="doc-compare-col reveal">
      <p class="doc-badge c-${ABO.color}"><span>${monster('mascotte')}</span>Compris dans l’abonnement : l’essentiel</p>
      ${fig('chico', 'Tableau de bord simple, compris dans l’abonnement', 'Avec l’abonnement : les voyants de votre site, vos visiteurs sur 30 jours, vos apparitions et vos meilleures recherches sur Google, vos pages les plus vues, et vos commandes si vous avez une boutique.', 'doc-fig-flat')}
    </div>
    <div class="doc-compare-col reveal">
      <p class="doc-badge c-lilac"><span>${monster('clin')}</span>Avec l’extra ${esc(stats.name)} : tout le détail</p>
      ${fig('titan', `Tableau de bord complet, avec l’extra ${stats.name}`, `Avec l’extra « ${esc(stats.name)} », en plus : la courbe des 30 derniers jours, les visites heure par heure, les appareils, la provenance des visiteurs et la santé du serveur. Et un rapport simple chaque mois.`, 'doc-fig-flat')}
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
    <p>Dans l’onglet « Ma boutique », vous gérez vous-même vos petites opérations. Ça ne compte pas dans vos modifications du mois.</p>
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
    description: 'Tout comprendre en images : la création de votre site, le prix, l’abonnement et ses extras, l’espace client, le tableau de bord et les outils de boutique.',
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
  const hidden = ['commander', 'confirmation'];
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
    outilsPage(),
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
