// Pages du site
const { site, sections, formules, options, modification, jeux, automatisations, initiation, fidelite, paiement, abonnement } = require('../config');
const { icon } = require('../lib/icons');
const { md, inline, esc } = require('../lib/md');
const C = require('../lib/components');
const FAQ = require('../content/faq');
const legal = require('../content/legal');

const HOME = { name: 'Accueil', path: '/' };
const crumb = (k) => [HOME, { name: sections[k].label, path: sections[k].path }];
const euro = C.euro;
const opt = (id) => options.find((o) => o.id === id);
const F = (id) => formules.find((f) => f.id === id);

// ====================================================================== ACCUEIL
function home() {
  const minis = formules
    .map(
      (f) => `<a class="mini acc-${f.accent} reveal" href="/tarifs/#${f.id}">
    <span class="mini-ico">${icon(f.icon)}</span>
    <strong>${esc(f.name)}</strong>
    <span class="mini-price"><b>dès ${euro(f.unique)}</b> en une fois</span>
    <span class="mini-or">ou <b>${euro(f.mensuel)}/mois</b> tout compris</span>
  </a>`
    )
    .join('');
  const doors = [
    ['amber', 'monitor', 'Présenter mon activité', 'Un site d’une page ou avec onglets', `dès ${euro(F('une-page').unique)}`, '/sites-internet/'],
    ['coral', 'shopping-bag', 'Vendre en ligne', 'Une boutique avec paiement par carte', `dès ${euro(F('boutique').unique)}`, '/sites-internet/#boutique'],
    ['teal', 'gamepad-2', 'Créer un petit jeu', 'Un jeu 2D qui se joue dans le navigateur', 'dès 150 €', '/jeux-2d/'],
    ['sky', 'workflow', 'Gagner du temps', 'Tri des mails, rappels, routines', 'dès 49 €', '/automatisations/'],
  ];
  const body = `<section class="hero">
  <div class="container hero-in">
    <div class="hero-copy">
      <h1>Votre site internet dès 100 €, prêt en quelques jours</h1>
      <p class="hero-lead">Je crée des sites internet, des boutiques en ligne, des petits jeux et des automatisations avec l’aide de l’IA. Je vérifie et je teste tout moi-même. Vous avez un site moderne, à un prix que tout le monde peut se permettre.</p>
      <div class="hero-ctas">${C.btn('/tarifs/', 'btn-primary btn-lg', 'coins', 'Voir les formules')}${C.btnDevis('btn-light btn-lg', null, 'Demander un devis')}</div>
      <ul class="hero-points">
        <li>${icon('check')}Paiement en une fois ou au mois</li>
        <li>${icon('check')}Devis gratuit, réponse rapide</li>
        <li>${icon('check')}Un seul interlocuteur, du début à la fin</li>
      </ul>
    </div>
    <div class="mock" aria-hidden="true">
      <div class="mock-bar"><i></i><i></i><i></i><span>votre-site.fr</span></div>
      <div class="mock-body">
        <div class="mock-nav"><b></b><span></span><span></span><span></span></div>
        <div class="mock-hero"><span class="mh-1"></span><span class="mh-2"></span><span class="mh-btn"></span></div>
        <div class="mock-cards"><span></span><span></span><span></span></div>
      </div>
      <p class="mock-tag">${icon('sparkles')}Créé avec l’IA, vérifié par moi</p>
    </div>
  </div>
</section>

<section class="section"><div class="container">
  <h2 class="section-title">Que voulez-vous faire ?</h2>
  <p class="section-sub">Choisissez une porte, je vous montre la suite.</p>
  <div class="doors">${doors
    .map(
      ([a, ic, t, d, p, href]) => `<a class="door acc-${a} reveal" href="${href}">
    <span class="door-ico">${icon(ic)}</span>
    <span class="door-text"><strong>${t}</strong><span>${d}</span></span>
    <span class="door-price">${p}</span>
    <span class="door-go">${icon('arrow-right')}</span>
  </a>`
    )
    .join('')}</div>
</div></section>

<section class="section section-alt"><div class="container">
  <h2 class="section-title">Comment ça se passe</h2>
  <p class="section-sub">Pas de jargon, pas de mauvaise surprise.</p>
  ${C.steps([
    { t: 'Vous m’expliquez votre projet', d: 'Par message, au téléphone ou avec le formulaire. Dix minutes suffisent souvent.' },
    { t: 'Je vous envoie un prix', d: 'Un devis clair et gratuit. Vous êtes libre de dire non.' },
    { t: 'Je crée, vous validez', d: 'Vous voyez votre site avant qu’il soit en ligne et vous demandez les changements.' },
    { t: 'C’est en ligne', d: 'Je m’occupe de la mise en ligne. Vous n’avez rien de technique à faire.' },
  ])}
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Trois formules de sites</h2>
  <p class="section-sub">En une fois, ou au mois avec l’hébergement et les modifications compris.</p>
  <div class="minis">${minis}</div>
  <p class="center more">${C.btn('/tarifs/', 'btn-light', 'arrow-right', 'Comparer les formules et les options')}</p>
</div></section>

<section class="section section-alt"><div class="container split">
  <div class="reveal">
    <h2>L’IA, je vous en parle franchement</h2>
    <p>Oui, j’utilise l’intelligence artificielle. C’est même ce qui me passionne. Elle m’aide à écrire le code, à proposer des mises en page et des premiers textes, beaucoup plus vite qu’avant.</p>
    <p>Ce temps gagné, je le répercute sur mes prix. C’est pour ça qu’un site peut démarrer à 100 €.</p>
    <p>${C.btn('/methode/', 'btn-light', 'sparkles', 'Ma méthode en détail')}</p>
  </div>
  <div class="who-box reveal">
    <h3>Ce que je fais moi-même</h3>
    <ul class="list-check">
      <li>Je comprends votre besoin et je fais les choix.</li>
      <li>Je relis et je corrige tout ce que l’IA propose.</li>
      <li>Je teste le site sur ordinateur et sur téléphone.</li>
      <li>Je reste votre contact après la mise en ligne.</li>
    </ul>
  </div>
</div></section>

<section class="section"><div class="container">
  <a class="promo acc-pink reveal" href="/fidelite/">
    <span class="promo-ico">${icon('gift')}</span>
    <span class="promo-text"><strong>Recommandez-moi : ${fidelite.parrainage} € pour vous, ${fidelite.parrainage} € pour votre ami</strong><span>Et ${fidelite.remise} % de remise sur tous vos projets suivants.</span></span>
    <span class="door-go">${icon('arrow-right')}</span>
  </a>
</div></section>

${C.ctaBand({ title: 'On en parle ?', text: 'Expliquez-moi votre idée en deux lignes. Je vous réponds vite, avec un prix.' })}`;
  return {
    path: '/',
    title: 'Création de site internet dès 100 € avec l’IA | ALED08',
    description: 'Sites internet modernes dès 100 € ou en abonnement, boutiques en ligne, jeux 2D et automatisations, créés avec l’IA et vérifiés par moi. Devis gratuit.',
    crumbs: [HOME],
    body,
    priority: 1,
    changefreq: 'weekly',
  };
}

// ====================================================================== SITES INTERNET
function wire(id) {
  if (id === 'une-page')
    return `<div class="wire wire-one" aria-hidden="true"><span class="w-top"></span><span class="w-hero"></span><span class="w-row"></span><span class="w-row short"></span><span class="w-cards"><i></i><i></i><i></i></span><span class="w-row"></span><span class="w-btn"></span><span class="w-scroll">${icon('chevron-down')}</span></div>`;
  if (id === 'onglets')
    return `<div class="wire wire-tabs" aria-hidden="true"><span class="w-bar"><i></i><i></i><i></i></span><span class="w-tabs"><i class="on"></i><i></i><i></i><i></i></span><span class="w-hero"></span><span class="w-cols"><i></i><i></i></span><span class="w-row"></span></div>`;
  return `<div class="wire wire-shop" aria-hidden="true"><span class="w-bar"><i></i><i></i><i></i></span><span class="w-cart">${icon('shopping-cart')}<em>2</em></span><span class="w-grid"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>`;
}

function sitesPage() {
  const crumbs = crumb('sites');
  const formats = formules
    .map(
      (f) => `<article class="format acc-${f.accent}" id="${f.id}">
    <div class="format-visual reveal">${wire(f.id)}</div>
    <div class="format-body reveal">
      <h2>${C.projetLabel(f)}</h2>
      <p>${inline(f.detail)}</p>
      <p class="format-for">${icon('users')}<span><strong>Pour qui ?</strong> ${esc(f.pourQui)}</span></p>
      <ul class="list-check">${f.inclus.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>
      <p class="format-price"><span><strong>dès ${euro(f.unique)}</strong> en une fois</span><span class="or">ou</span><span><strong>${euro(f.mensuel)}/mois</strong> tout compris</span></p>
      <div class="format-ctas">${C.btnDevis('btn-primary', C.projetLabel(f), 'Demander un devis')}${C.btn('/tarifs/#' + f.id, 'btn-light', 'coins', 'Détail des prix')}</div>
    </div>
  </article>`
    )
    .join('');
  const feats = [
    ['smartphone', 'Parfait sur téléphone', 'La plupart de vos visiteurs arriveront d’un téléphone. Le site est pensé pour eux d’abord.'],
    ['zap', 'Rapide', 'Des pages légères qui s’affichent vite, même avec une connexion moyenne.'],
    ['shield-check', 'Sécurisé', 'Le cadenas https, et des sauvegardes avec l’abonnement ou la maintenance.'],
    ['search-check', 'Prêt pour Google', 'Titres, descriptions et structure soignés pour que Google comprenne vos pages.'],
    ['mail', 'Formulaire de contact', 'Les messages de vos visiteurs arrivent directement dans votre boîte mail.'],
    ['file-text', 'Pages légales', 'Mentions légales et confidentialité préparées, à compléter avec vos informations.'],
  ];
  const f = C.faq(FAQ.sites, 'Vos questions sur les sites', 'faq-sites');
  const body = `${C.pageHero({
    section: 'sites',
    h1: 'Création de sites internet à petit prix',
    lead: 'Une page, plusieurs onglets ou une boutique en ligne : choisissez le format qui vous va. Je m’occupe du reste, de la maquette à la mise en ligne.',
    crumbs,
  })}
<section class="section"><div class="container formats">${formats}</div></section>

<section class="section section-alt"><div class="container">
  <h2 class="section-title">Dans tous mes sites</h2>
  <div class="feats">${feats.map(([i, t, d]) => `<div class="feat reveal">${icon(i)}<h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Paiement unique ou abonnement ?</h2>
  <p class="section-sub">Les deux donnent le même site. Seule la façon de payer change.</p>
  <div class="compare">
    <div class="compare-col reveal">
      <h3>${icon('credit-card')}Paiement unique</h3>
      <p>Vous payez le site une fois, il vous appartient.</p>
      <ul class="list-check">
        <li>Le site est à vous dès le paiement complet.</li>
        <li>Hébergement et nom de domaine en option : ${euro(opt('heberg').u.year)} par an.</li>
        <li>Modifications ensuite : ${euro(modification)} l’une, ou maintenance à ${euro(opt('maint').u.month)} par mois.</li>
      </ul>
      <p class="small">Idéal si vous voulez être propriétaire tout de suite et toucher peu au site.</p>
    </div>
    <div class="compare-col is-hl reveal">
      <h3>${icon('refresh-cw')}Abonnement mensuel</h3>
      <p>Pas de frais de création : tout est compris dans un petit montant chaque mois.</p>
      <ul class="list-check">${abonnement.inclus.slice(1).map((i) => `<li>${inline(i)}</li>`).join('')}</ul>
      <p class="small">Engagement ${abonnement.engagement} mois, puis sans engagement. Idéal si vous ne voulez rien gérer.</p>
    </div>
  </div>
</div></section>

${f.html}
${C.ctaBand({ title: 'Quel site vous faut-il ?', text: 'Dites-moi ce que vous faites et ce que vous attendez de votre site. Je vous conseille la bonne formule.' })}`;
  return {
    path: '/sites-internet/',
    section: 'sites',
    title: 'Sites internet : une page, avec onglets ou boutique | ALED08',
    description: 'Site d’une page dès 100 €, avec onglets dès 290 €, boutique en ligne dès 590 €, ou en abonnement tout compris. Rapide, adapté au mobile, prêt pour Google.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== TARIFS
function tarifsPage() {
  const crumbs = crumb('tarifs');
  const f = C.faq(FAQ.tarifs, 'Vos questions sur les prix', 'faq-tarifs');
  const others = [
    ['teal', 'gamepad-2', 'Jeux 2D', jeux[0].price, 'Un mini-jeu pour votre site, un événement ou un cadeau.', '/jeux-2d/'],
    ['sky', 'workflow', 'Automatisations', automatisations[0].price, 'Une tâche répétitive qui se fait toute seule.', '/automatisations/'],
    ['lavender', initiation.icon, initiation.name, initiation.price, 'Apprendre à vous servir de l’IA, en visio.', '/automatisations/#initiation'],
  ];
  const body = `${C.pageHero({
    section: 'tarifs',
    h1: 'Tarifs : en une fois ou au mois, à vous de choisir',
    lead: 'Tous les prix sont des prix de départ. Le devis est gratuit et vous dit exactement ce que vous paierez.',
    crumbs,
    actions: false,
  })}
<section class="section" id="formules"><div class="container">
  <h2 class="section-title">Les formules de sites</h2>
  <p class="section-sub">Changez de façon de payer pour comparer.</p>
  ${C.modeSwitch()}
  ${C.formuleCards()}
  <div class="pay-notes" data-mode="unique">
    <p class="pay-note" data-for="unique">${icon('info')}<span>Avec le paiement unique, le site vous appartient. Comptez ${euro(opt('heberg').u.year)} par an pour l’hébergement et le nom de domaine, sauf si vous avez déjà les vôtres.</span></p>
    <p class="pay-note" data-for="mensuel">${icon('info')}<span>Avec l’abonnement, pas de frais de création. Engagement ${abonnement.engagement} mois, puis vous arrêtez quand vous voulez et vous gardez votre site.</span></p>
  </div>
  ${C.aboBox()}
</div></section>

<section class="section section-alt" id="options"><div class="container">
  <h2 class="section-title">Les options</h2>
  <p class="section-sub">À ajouter si vous en avez besoin, rien n’est obligatoire.</p>
  ${C.optionsTable()}
  <p class="small muted center">Sans abonnement ni maintenance, une petite modification coûte ${euro(modification)}.</p>
</div></section>

<section class="section" id="estimation"><div class="container">
  <h2 class="section-title">Faites votre estimation</h2>
  <p class="section-sub">Choisissez votre site et vos options, le prix se met à jour.</p>
  ${C.estimator()}
</div></section>

<section class="section section-alt" id="autres"><div class="container">
  <h2 class="section-title">Mes autres services</h2>
  <div class="others">${others
    .map(
      ([a, ic, t, p, d, href]) => `<a class="other acc-${a} reveal" href="${href}"><span class="door-ico">${icon(ic)}</span><strong>${esc(t)}</strong><span class="other-price">${esc(p)}</span><span>${esc(d)}</span></a>`
    )
    .join('')}</div>
</div></section>

<section class="section"><div class="container split">
  <div class="reveal">
    <h2>Comment je suis payé</h2>
    <ul class="list-check">
      <li>Paiement unique : ${paiement.acompte} % à la commande, le reste à la mise en ligne.</li>
      <li>Abonnement : un paiement chaque mois, à partir de la mise en ligne.</li>
      <li>Jeux et automatisations : selon le devis, en une ou deux fois.</li>
    </ul>
  </div>
  <a class="promo acc-pink reveal" href="/fidelite/">
    <span class="promo-ico">${icon('gift')}</span>
    <span class="promo-text"><strong>${fidelite.remise} % de remise dès votre deuxième projet</strong><span>Et ${fidelite.parrainage} € offerts quand vous me recommandez.</span></span>
    <span class="door-go">${icon('arrow-right')}</span>
  </a>
</div></section>

${f.html}
${C.ctaBand({ title: 'Un prix précis pour votre projet ?', text: 'Le devis est gratuit et sans engagement. Je vous réponds rapidement.' })}`;
  return {
    path: '/tarifs/',
    section: 'tarifs',
    title: 'Tarifs site internet : paiement unique ou abonnement | ALED08',
    description: 'Prix des sites internet : une page dès 100 € ou 15 €/mois, avec onglets dès 290 €, boutique dès 590 €. Options, simulateur de prix et devis gratuit.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== JEUX 2D
function jeuxPage() {
  const crumbs = crumb('jeux');
  const f = C.faq(FAQ.jeux, 'Vos questions sur les jeux', 'faq-jeux');
  const idees = [
    ['monitor', 'Pour votre site', 'Un petit jeu qui donne envie de rester et de revenir.'],
    ['users', 'Pour un événement', 'Un salon, une fête, un mariage : un jeu à vos couleurs avec un tableau des scores.'],
    ['book-open', 'Pour apprendre', 'Écoles, associations, formateurs : réviser en jouant.'],
    ['heart', 'En cadeau', 'Un jeu avec les prénoms, les photos ou les blagues de vos proches.'],
    ['store', 'Pour votre marque', 'Vos produits et votre univers dans un jeu simple et rapide.'],
  ];
  const body = `${C.pageHero({
    section: 'jeux',
    h1: 'Création de petits jeux 2D',
    lead: 'Un mini-jeu à vos couleurs, pour votre site, une animation, une école ou un cadeau original. Il se joue dans le navigateur, sur ordinateur comme sur téléphone.',
    crumbs,
    projet: 'Jeu 2D',
  })}
<section class="section"><div class="container">
  <h2 class="section-title">Essayez la démo</h2>
  <p class="section-sub">Un petit jeu fait avec l’IA, pour vous donner une idée. Attrapez les éclairs, évitez les bugs.</p>
  <div class="game reveal" data-game>
    <canvas width="720" height="420" role="img" aria-label="Jeu de démonstration : un panier attrape des éclairs qui tombent"></canvas>
    <div class="game-ui"><span>Score <b data-score>0</b></span><span>Vies <b data-lives>3</b></span><span>Record <b data-best>0</b></span></div>
    <div class="game-start" data-start>
      <p class="game-title">Attrape-éclairs</p>
      <p>Déplacez le panier avec la souris, le doigt ou les flèches du clavier. Un éclair manqué ou un bug attrapé, et vous perdez une vie.</p>
      <button class="btn btn-primary" type="button" data-play>${icon('play')}<span>Jouer</span></button>
    </div>
  </div>
</div></section>

<section class="section section-alt"><div class="container">
  <h2 class="section-title">Des idées de jeux</h2>
  <div class="feats">${idees.map(([i, t, d]) => `<div class="feat reveal">${icon(i)}<h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Les prix</h2>
  <div class="others">${jeux.map((j) => `<div class="other acc-teal reveal"><span class="door-ico">${icon(j.icon)}</span><strong>${esc(j.name)}</strong><span class="other-price">${esc(j.price)}</span><span>${inline(j.desc)}</span></div>`).join('')}</div>
</div></section>

<section class="section section-alt"><div class="container">
  <h2 class="section-title">Comment je travaille</h2>
  ${C.steps([
    { t: 'Votre idée', d: 'Vous me racontez le jeu que vous imaginez, pour qui et pour quelle occasion.' },
    { t: 'Un premier essai jouable', d: 'Je vous envoie vite une version simple, pour sentir le jeu.' },
    { t: 'Les réglages', d: 'Couleurs, difficulté, textes : on ajuste ensemble.' },
    { t: 'La livraison', d: 'Un lien à partager, ou le jeu intégré dans votre site.' },
  ])}
</div></section>

${f.html}
${C.ctaBand({ title: 'Une idée de jeu ?', text: 'Racontez-la-moi, même en vrac. Je vous dis ce qui est faisable et à quel prix.', projet: 'Jeu 2D' })}`;
  return {
    path: '/jeux-2d/',
    section: 'jeux',
    title: 'Création de jeux 2D pour le web, dès 150 € | ALED08',
    description: 'Mini-jeux 2D jouables dans le navigateur, pour un site, un événement, une école ou un cadeau. Essayez la démo jouable. Dès 150 €, devis gratuit.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.8,
  };
}

// ====================================================================== AUTOMATISATIONS
function autoPage() {
  const crumbs = crumb('auto');
  const f = C.faq(FAQ.auto, 'Vos questions sur les automatisations', 'faq-auto');
  const exemples = [
    ['mail-check', 'Tri des mails', 'Vos mails rangés tout seuls par dossier : clients, factures, publicités.'],
    ['message-square', 'Réponses toutes prêtes', 'Les questions qui reviennent ont leur réponse, prête à envoyer.'],
    ['bell', 'Rappels de rendez-vous', 'Vos clients reçoivent un rappel la veille, sans que vous y pensiez.'],
    ['folder-open', 'Factures rangées', 'Les pièces jointes partent dans le bon dossier, nommées proprement.'],
    ['newspaper', 'Résumé du jour', 'Un résumé de vos mails importants, chaque matin.'],
    ['rotate-ccw', 'Relance des devis', 'Un message de relance part si un client n’a pas répondu.'],
    ['chart-line', 'Tableau de suivi', 'Vos ventes, vos demandes ou vos stocks mis à jour automatiquement.'],
    ['calendar-check', 'Publications programmées', 'Vos posts sur les réseaux préparés à l’avance, publiés à l’heure.'],
  ];
  const body = `${C.pageHero({
    section: 'auto',
    h1: 'Automatisations : gagnez du temps sur les tâches répétitives',
    lead: 'Trier vos mails, ranger vos factures, envoyer des rappels, préparer un résumé du jour. Je mets en place des routines qui le font à votre place, avec les outils que vous utilisez déjà.',
    crumbs,
    projet: 'Automatisation',
  })}
<section class="section"><div class="container">
  <h2 class="section-title">Un exemple : le tri des mails</h2>
  <div class="inbox reveal" aria-hidden="true">
    <div class="inbox-list">
      <div class="mail t-coral"><b>Facture n° 1042</b><span>Fournisseur</span></div>
      <div class="mail t-teal"><b>Demande de devis</b><span>Nouveau client</span></div>
      <div class="mail t-pink"><b>Moins 50 % ce week-end</b><span>Publicité</span></div>
      <div class="mail t-teal"><b>Rendez-vous jeudi</b><span>Client</span></div>
    </div>
    <div class="inbox-arrow">${icon('workflow')}</div>
    <div class="inbox-folders">
      <div class="folder t-teal">${icon('folder-open')}Clients<em>2</em></div>
      <div class="folder t-coral">${icon('folder-open')}Factures<em>1</em></div>
      <div class="folder t-pink">${icon('folder-open')}Publicités<em>1</em></div>
    </div>
  </div>
  <p class="small muted center">Illustration : chaque mail part dans le bon dossier, sans que vous y touchiez.</p>
</div></section>

<section class="section section-alt"><div class="container">
  <h2 class="section-title">Ce que je peux automatiser pour vous</h2>
  <div class="feats feats-4">${exemples.map(([i, t, d]) => `<div class="feat reveal">${icon(i)}<h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Les prix</h2>
  <div class="others">${automatisations.map((a) => `<div class="other acc-sky reveal"><span class="door-ico">${icon(a.icon)}</span><strong>${esc(a.name)}</strong><span class="other-price">${esc(a.price)}</span><span>${inline(a.desc)}</span></div>`).join('')}</div>
</div></section>

<section class="section section-alt" id="initiation"><div class="container split">
  <div class="reveal">
    <h2>${esc(initiation.name)}</h2>
    <p>${inline(initiation.desc)}</p>
    <p>C’est pour tout le monde, même si vous n’y connaissez rien. On part de vos besoins à vous : écrire un courrier, résumer un document, préparer un voyage, aider les enfants dans leurs devoirs.</p>
    <p>${C.btnDevis('btn-primary', 'Initiation à l’IA', 'Réserver une heure')}</p>
  </div>
  <div class="other acc-lavender big reveal"><span class="door-ico">${icon(initiation.icon)}</span><strong>Une heure en visio</strong><span class="other-price">${esc(initiation.price)}</span><span>À votre rythme, avec vos questions.</span></div>
</div></section>

<section class="section"><div class="container container-narrow">
  <div class="trust reveal">
    <h2>${icon('lock')}Et vos données ?</h2>
    <p>Je travaille sur vos propres comptes : Gmail, Outlook, Google Agenda ou ce que vous utilisez. Je n’accède qu’à ce qui est utile pour la routine, et vous pouvez tout couper quand vous voulez. Vos données ne sont jamais revendues.</p>
  </div>
</div></section>

${f.html}
${C.ctaBand({ title: 'Une tâche vous fait perdre du temps ?', text: 'Décrivez-la-moi. Je vous dis si elle peut se faire toute seule, et pour combien.', projet: 'Automatisation' })}`;
  return {
    path: '/automatisations/',
    section: 'auto',
    title: 'Automatisations et IA : tri des mails, rappels, routines | ALED08',
    description: 'Tri automatique des mails, rappels de rendez-vous, factures rangées, relances : des routines dès 49 € avec vos outils. Initiation à l’IA en visio.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.8,
  };
}

// ====================================================================== MA MÉTHODE
function methodePage() {
  const crumbs = crumb('methode');
  const f = C.faq(FAQ.methode, 'Vos questions sur l’IA', 'faq-ia');
  const body = `${C.pageHero({
    section: 'methode',
    h1: 'Ma méthode : l’IA pour aller vite, un humain pour vérifier',
    lead: 'Je suis passionné d’intelligence artificielle. Je teste les nouveaux outils dès leur sortie et je m’en sers pour créer plus vite. Voici comment je travaille, sans rien cacher.',
    crumbs,
  })}
<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Pourquoi mes prix sont plus bas

Un site vitrine demande d’habitude de longues heures de travail : mise en page, code, textes, tests. Avec l’IA, une bonne partie de ce travail va beaucoup plus vite. Je passe moins d’heures sur votre projet, donc je peux vous le facturer moins cher.

Le résultat, lui, reste du travail soigné : un site rapide, adapté au téléphone, sécurisé et prêt pour Google.`)}
</div></section>

<section class="section section-alt"><div class="container">
  <h2 class="section-title">Qui fait quoi ?</h2>
  <div class="compare">
    <div class="compare-col reveal">
      <h3>${icon('bot')}L’IA m’aide à…</h3>
      <ul class="list-check">
        <li>écrire le code du site ;</li>
        <li>proposer des mises en page ;</li>
        <li>rédiger une première version des textes ;</li>
        <li>repérer des erreurs.</li>
      </ul>
    </div>
    <div class="compare-col is-hl reveal">
      <h3>${icon('user')}Moi, je…</h3>
      <ul class="list-check">
        <li>vous écoute et je fais les choix ;</li>
        <li>relis, corrige et améliore ce qu’elle propose ;</li>
        <li>teste le site sur plusieurs appareils ;</li>
        <li>mets en ligne et je reste là après.</li>
      </ul>
    </div>
  </div>
</div></section>

<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Mes limites, honnêtement

Pour un site vitrine, une petite boutique, un mini-jeu ou une routine, je suis rapide et efficace. En revanche, je ne remplace pas un développeur expérimenté sur un projet complexe : une application sur mesure, un logiciel métier, un site avec des milliers de produits, un service qui demande une sécurité renforcée.

Dans ces cas-là, je vous le dis dès le premier échange, et je peux vous orienter vers les bonnes personnes.

## Qui je suis

${site.name}, c’est moi : un jeune entrepreneur des Ardennes. Ma passion pour l’IA est récente, mais elle ne me lâche plus. Mon idée est simple : que tout le monde puisse en profiter, pas seulement les grandes entreprises, avec des prix que chacun peut se permettre.`)}
</div></section>

${f.html}
${C.ctaBand({ title: 'Envie d’essayer ?', text: 'Parlez-moi de votre projet. Vous verrez vite ce que l’IA et moi pouvons faire pour vous.' })}`;
  return {
    path: '/methode/',
    section: 'methode',
    title: 'Ma méthode : sites créés avec l’IA, vérifiés par moi | ALED08',
    description: 'Comment je crée des sites et des outils avec l’IA : ce que fait l’IA, ce que je fais moi-même, pourquoi c’est moins cher, et mes limites, honnêtement.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.7,
  };
}

// ====================================================================== FIDÉLITÉ
function fidelitePage() {
  const crumbs = crumb('fidelite');
  const f = C.faq(FAQ.fidelite, 'Vos questions sur la fidélité', 'faq-fidelite');
  const perks = [
    ['pink', 'users', 'Parrainage', `${fidelite.parrainage} € pour vous, ${fidelite.parrainage} € pour votre filleul`, `Un ami passe commande grâce à vous : vous avez ${fidelite.parrainage} € de remise sur votre prochaine facture, et lui aussi. Si vous êtes abonné, c’est ${fidelite.parrainageAbo} mois offerts.`],
    ['amber', 'badge-percent', 'Client fidèle', `${fidelite.remise} % sur vos projets suivants`, `Dès votre deuxième projet, que ce soit un autre site, un jeu ou une automatisation, vous avez ${fidelite.remise} % de remise.`],
    ['teal', 'sparkles', 'Abonnés', 'Un coup de neuf chaque année', 'Après chaque année d’abonnement, je rafraîchis votre site gratuitement : couleurs, photos, textes ou une section en plus.'],
  ];
  const body = `${C.pageHero({
    section: 'fidelite',
    h1: 'Fidélité et parrainage : vos avantages',
    lead: 'Merci de me faire confiance, et de parler de moi autour de vous. Voici ce que vous y gagnez.',
    crumbs,
    actions: false,
  })}
<section class="section"><div class="container">
  <div class="perks">${perks
    .map(([a, ic, t, big, d]) => `<article class="perk acc-${a} reveal"><span class="door-ico">${icon(ic)}</span><p class="perk-kind">${t}</p><h2>${big}</h2><p>${d}</p></article>`)
    .join('')}</div>
</div></section>

<section class="section section-alt"><div class="container">
  <h2 class="section-title">Le parrainage, en pratique</h2>
  ${C.steps([
    { t: 'Parlez de moi', d: 'Donnez mon contact ou le lien du site à quelqu’un qui a un projet.' },
    { t: 'Il donne votre nom', d: 'Votre filleul indique votre nom dans sa demande de devis.' },
    { t: 'Vous en profitez tous les deux', d: 'Dès sa commande, la remise s’applique sur sa facture et sur la vôtre.' },
  ])}
  <p class="small muted center">Parrainage valable à partir d’une commande de 100 €. Avantages non convertibles en argent, cumulables dans la limite de la moitié du prix d’un projet.</p>
</div></section>

${f.html}
${C.ctaBand({ title: 'Quelqu’un a un projet autour de vous ?', text: 'Envoyez-lui le lien du site. Vous y gagnez tous les deux.' })}`;
  return {
    path: '/fidelite/',
    section: 'fidelite',
    title: 'Fidélité et parrainage : 30 € offerts | ALED08',
    description: 'Parrainage : 30 € pour vous et 30 € pour votre filleul. 10 % de remise dès votre deuxième projet, et un coup de neuf offert chaque année aux abonnés.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.6,
  };
}

// ====================================================================== CONTACT
function formHidden() {
  return `<input type="hidden" name="type" value="devis"><input type="hidden" name="_t" value=""><div class="hp" aria-hidden="true"><label>Site web <input type="text" name="site_web" tabindex="-1" autocomplete="off"></label></div>`;
}
function contactPage() {
  const crumbs = crumb('contact');
  const projets = [...formules.map(C.projetLabel), 'Jeu 2D', 'Automatisation', 'Initiation à l’IA', 'Autre projet'];
  const body = `${C.pageHero({
    section: 'contact',
    h1: 'Contact et devis gratuit',
    lead: 'Décrivez votre projet en quelques lignes. Je vous réponds rapidement, avec un prix.',
    crumbs,
    actions: false,
  })}
<section class="section"><div class="container contact-grid">
  <div class="form-card" id="devis">
    <h2 class="h3">Votre demande</h2>
    <form class="form" method="post" action="${site.formAction}" data-form novalidate>
      ${formHidden()}
      <p class="form-alert" data-form-error hidden>L’envoi n’a pas abouti. Vérifiez les champs obligatoires, ou écrivez-moi sur WhatsApp.</p>
      <div class="form-row">
        <div class="field"><label for="c-nom">Votre nom <span class="req">*</span></label><input id="c-nom" name="nom" type="text" autocomplete="name" required></div>
        <div class="field"><label for="c-email">Votre e-mail <span class="req">*</span></label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="c-tel">Téléphone <span class="opt">(facultatif)</span></label><input id="c-tel" name="telephone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="c-projet">Votre projet <span class="req">*</span></label>
          <select id="c-projet" name="projet" required><option value="">Choisir…</option>${projets.map((p) => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select></div>
      </div>
      <div class="field"><span class="label">Façon de payer</span>
        <div class="radio-group">
          <label><input type="radio" name="paiement" value="Paiement unique"> Paiement unique</label>
          <label><input type="radio" name="paiement" value="Abonnement"> Abonnement</label>
          <label><input type="radio" name="paiement" value="Je ne sais pas encore" checked> Je ne sais pas encore</label>
        </div>
      </div>
      <div class="field"><label for="c-message">Votre message <span class="req">*</span></label><textarea id="c-message" name="message" required minlength="10" placeholder="Votre activité, ce que vous attendez, un site que vous aimez…"></textarea></div>
      <label class="check"><input type="checkbox" name="consentement" value="oui" required><span>J’accepte que mes informations servent à me répondre. <a href="/politique-de-confidentialite/">En savoir plus</a></span></label>
      <button class="btn btn-primary btn-lg" type="submit">${icon('send')}<span>Envoyer ma demande</span></button>
    </form>
  </div>
  <aside class="contact-side">
    <a class="contact-card wa" href="${C.waUrl()}" target="_blank" rel="noopener">${icon('whatsapp')}<div><strong>WhatsApp</strong><span>Le plus rapide pour échanger, même avec des photos.</span></div></a>
    <a class="contact-card" href="${C.tel}">${icon('phone')}<div><strong>${site.phoneDisplay}</strong><span>Appel ou SMS.</span></div></a>
    <a class="contact-card" href="mailto:${site.email}">${icon('mail')}<div><strong>${site.email}</strong><span>Pour envoyer des documents.</span></div></a>
    <div class="contact-note">
      <p>${icon('clock')}<span>Je réponds en général dans la journée.</span></p>
      <p>${icon('map-pin')}<span>Basé dans les Ardennes, je travaille à distance partout en France. On peut aussi se voir en visio.</span></p>
    </div>
  </aside>
</div></section>`;
  return {
    path: '/contact/',
    section: 'contact',
    title: 'Contact et devis gratuit pour votre site | ALED08',
    description: 'Demandez un devis gratuit pour votre site internet, votre boutique en ligne, un jeu 2D ou une automatisation. Réponse rapide par mail ou WhatsApp.',
    crumbs,
    body,
    priority: 0.8,
  };
}

// ====================================================================== PAGE LOCALE
function ardennesPage() {
  const crumbs = [HOME, { name: 'Sites internet', path: '/sites-internet/' }, { name: 'Dans les Ardennes', path: '/creation-site-internet-ardennes/' }];
  const f = C.faq(
    [
      { q: 'Peut-on se rencontrer ?', a: 'Oui. Dans les Ardennes, on peut se voir autour d’un café ou dans vos locaux. Pour les autres départements, on se parle en visio.' },
      { q: 'Travaillez-vous avec les associations ?', a: 'Oui, avec plaisir. Une page simple pour présenter l’association, ses dates et ses contacts, c’est souvent la formule à 100 €.' },
      { q: 'Mon commerce sera-t-il trouvé sur Google Maps ?', a: 'L’option référencement local s’occupe de votre fiche Google : c’est elle qui vous fait apparaître sur la carte quand quelqu’un cherche près de chez vous.' },
    ],
    'Vos questions',
    'faq-ardennes'
  );
  const body = `${C.pageHero({
    section: 'sites',
    h1: 'Création de site internet dans les Ardennes',
    lead: 'Artisans, commerçants, associations, indépendants des Ardennes : je crée votre site à petit prix, et on peut se rencontrer pour en parler.',
    crumbs,
  })}
<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Un interlocuteur près de chez vous

Je suis installé à ${site.address.city}. Que vous soyez à Charleville-Mézières, Sedan, Rethel, Rocroi, Vouziers ou dans un village du département, je peux venir vous voir pour comprendre votre activité et repartir avec vos idées.

## Ce que je propose

- **Site d’une page** dès ${euro(F('une-page').unique)}, ou ${euro(F('une-page').mensuel)} par mois tout compris.
- **Site avec onglets** dès ${euro(F('onglets').unique)}, ou ${euro(F('onglets').mensuel)} par mois.
- **Boutique en ligne** dès ${euro(F('boutique').unique)}, ou ${euro(F('boutique').mensuel)} par mois.

Le détail est sur la page [tarifs](/tarifs/).

## Être trouvé par les Ardennais

Quand quelqu’un cherche un commerce ou un artisan, Google lui montre d’abord les entreprises proches. L’option référencement local prépare votre fiche Google et des pages pour vos villes, pour que les clients du coin vous trouvent.`)}
</div></section>
${f.html}
${C.ctaBand({ title: 'Vous êtes dans les Ardennes ?', text: 'Écrivez-moi : on peut se voir pour parler de votre site.' })}`;
  return {
    path: '/creation-site-internet-ardennes/',
    section: 'sites',
    title: 'Création de site internet dans les Ardennes | ALED08',
    description: 'Création de site internet pour les artisans, commerces et associations des Ardennes : dès 100 €, rencontre possible, référencement local pour être trouvé.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.7,
  };
}

// ====================================================================== FAQ COMPLÈTE
function faqPage() {
  const crumbs = [HOME, { name: 'Questions fréquentes', path: '/faq/' }];
  const groups = [
    ['Les sites', FAQ.sites, 'sites'],
    ['Les prix', FAQ.tarifs, 'tarifs'],
    ['L’IA', FAQ.methode, 'methode'],
    ['Les jeux 2D', FAQ.jeux, 'jeux'],
    ['Les automatisations', FAQ.auto, 'auto'],
    ['La fidélité', FAQ.fidelite, 'fidelite'],
  ];
  const all = groups.flatMap((g) => g[1]);
  const body = `${C.pageHero({ h1: 'Questions fréquentes', lead: 'Les réponses aux questions qu’on me pose le plus souvent. Il en manque une ? Écrivez-moi.', crumbs, actions: false })}
<section class="section"><div class="container container-narrow">
  ${groups
    .map(
      ([t, items, k]) => `<div class="faq-group acc-${sections[k].accent}"><h2>${icon(sections[k].icon)}${t}</h2><div class="faq">${items
        .map((it) => `<details class="faq-item"><summary>${inline(it.q)}${icon('chevron-down')}</summary><div class="faq-a"><p>${inline(it.a)}</p></div></details>`)
        .join('')}</div></div>`
    )
    .join('')}
</div></section>
${C.ctaBand()}`;
  return {
    path: '/faq/',
    title: 'Questions fréquentes : sites, prix, IA, jeux | ALED08',
    description: 'Toutes les réponses sur mes sites internet, les prix et l’abonnement, l’utilisation de l’IA, les jeux 2D, les automatisations et le parrainage.',
    crumbs,
    body,
    schema: [{ '@type': 'FAQPage', mainEntity: all.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })) }],
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
    body: `${C.pageHero({ h1: l.name, lead: l.lead, crumbs, actions: false })}
<section class="section"><div class="container container-narrow prose legal">${md(l.body)}<p class="small muted">Dernière mise à jour : ${frDate(l.updated)}.</p></div></section>`,
    priority: 0.2,
    changefreq: 'yearly',
  };
}

function planDuSite() {
  const crumbs = [HOME, { name: 'Plan du site', path: '/plan-du-site/' }];
  const links = [
    ['/', 'Accueil'],
    ...Object.values(sections).map((s) => [s.path, s.label]),
    ['/creation-site-internet-ardennes/', 'Création de site dans les Ardennes'],
    ['/faq/', 'Questions fréquentes'],
    ...legal.map((l) => [l.path, l.name]),
  ];
  return {
    path: '/plan-du-site/',
    title: 'Plan du site | ALED08 sites internet et IA',
    description: 'Toutes les pages du site ALED08 : sites internet, tarifs, jeux 2D, automatisations, méthode, fidélité, contact, questions fréquentes et pages légales.',
    crumbs,
    body: `${C.pageHero({ h1: 'Plan du site', lead: 'Toutes les pages du site, au même endroit.', crumbs, actions: false })}
<section class="section"><div class="container container-narrow"><ul class="sitemap-list">${links.map(([p, l]) => `<li><a href="${p}">${esc(l)}</a></li>`).join('')}</ul></div></section>`,
    priority: 0.2,
  };
}

function merci() {
  return {
    path: '/merci/',
    noindex: true,
    title: 'Demande envoyée | ALED08',
    description: 'Votre demande a bien été envoyée à ALED08. Je vous réponds rapidement, en général dans la journée.',
    body: `${C.pageHero({ h1: 'Merci, votre demande est bien partie !', lead: 'Je vous réponds rapidement, en général dans la journée. Si c’est pressé, écrivez-moi aussi sur WhatsApp.', actions: false })}
<section class="section"><div class="container center"><div class="hero-ctas centered">${C.btnWa('btn-wa btn-lg')}${C.btn('/', 'btn-light btn-lg', 'arrow-right', 'Retour à l’accueil')}</div></div></section>`,
  };
}

function notFound() {
  return {
    path: '/404/',
    file: '404.html',
    noindex: true,
    title: 'Page introuvable | ALED08',
    description: 'Cette page n’existe pas ou a été déplacée. Retrouvez les sites internet, les tarifs, les jeux 2D et les automatisations depuis l’accueil.',
    body: `${C.pageHero({ h1: 'Cette page n’existe pas', lead: 'Elle a peut-être été déplacée. Voici où aller :', actions: false })}
<section class="section"><div class="container"><div class="doors">${['sites', 'tarifs', 'jeux', 'auto']
      .map(
        (k) => `<a class="door acc-${sections[k].accent}" href="${sections[k].path}"><span class="door-ico">${icon(sections[k].icon)}</span><span class="door-text"><strong>${sections[k].label}</strong></span><span class="door-go">${icon('arrow-right')}</span></a>`
      )
      .join('')}</div></div></section>`,
  };
}

function build() {
  return [
    home(), sitesPage(), tarifsPage(), jeuxPage(), autoPage(), methodePage(), fidelitePage(), contactPage(), ardennesPage(), faqPage(),
    ...legal.map(legalPage), planDuSite(), merci(), notFound(),
  ];
}

module.exports = { build };
