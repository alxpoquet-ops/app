// Pages principales du site
const { site, hours, tarifs, kmTiers, communes, tierFor } = require('../config');
const { icon } = require('../lib/icons');
const { md, inline, esc } = require('../lib/md');
const C = require('../lib/components');
const T = require('./templates');
const services = require('../content/services');
const { mainServices, allServices } = require('../content/services-list');
const avis = require('../content/avis');
const legal = require('../content/legal');
const faqPage = require('../content/faq');

const HOME = { name: 'Accueil', path: '/' };

const gallery = [
  { title: 'Tableau à fusibles remplacé', text: 'Fusibles porcelaine sur planche → tableau modulaire avec différentiels 30 mA et circuits repérés.', before: '/assets/img/realisations/tableau-avant.svg', after: '/assets/img/realisations/tableau-apres.svg', altBefore: 'Ancien tableau électrique à fusibles porcelaine sur planche en bois', altAfter: 'Tableau électrique modulaire neuf avec interrupteurs différentiels et disjoncteurs repérés' },
  { title: 'Prise ayant chauffé', text: 'Prise noircie par un faux contact → prise neuve avec terre, conducteurs recoupés et resserrés.', before: '/assets/img/realisations/prise-avant.svg', after: '/assets/img/realisations/prise-apres.svg', altBefore: 'Prise électrique noircie et fondue par un échauffement', altAfter: 'Prise électrique neuve avec broche de terre correctement posée' },
  { title: 'Éclairage de façade', text: 'Entrée sans lumière → appliques LED étanches avec détecteur de présence.', before: '/assets/img/realisations/exterieur-avant.svg', after: '/assets/img/realisations/exterieur-apres.svg', altBefore: 'Façade de maison dans l’obscurité, sans éclairage extérieur', altAfter: 'Façade éclairée par deux appliques LED avec détecteur de présence' },
  { title: 'Connexions mises en sécurité', text: 'Dominos à nu dans un plafond → boîte de dérivation fermée et bornes à levier.', before: '/assets/img/realisations/derivation-avant.svg', after: '/assets/img/realisations/derivation-apres.svg', altBefore: 'Fils électriques raccordés par des dominos sans boîte de protection', altAfter: 'Boîte de dérivation fermée avec connexions par bornes automatiques' },
];

function registerAll(register) {
  const pages = [
    ['/', 'Accueil'], ['/qui-suis-je/', 'Qui suis-je ?'], ['/prestations/', 'Toutes les prestations'], ['/tarifs/', 'Tarifs et grille de prix'],
    ['/zone-intervention/', 'Zone d’intervention'], ['/realisations/', 'Réalisations avant / après'], ['/faq/', 'FAQ complète'],
    ['/devis/', 'Demande de devis'], ['/contact/', 'Contact'], ['/blog/', 'Blog électricité'], ['/plan-du-site/', 'Plan du site'],
    ['/mentions-legales/', 'Mentions légales'], ['/politique-de-confidentialite/', 'Politique de confidentialité'], ['/conditions-generales/', 'Conditions générales'],
  ];
  for (const [p, l] of pages) register(p, { label: l, group: 'main' });
  for (const s of services) register(s.path, { label: s.label, group: 'prestations' });
}

// ====================================================================== ACCUEIL
function home({ posts }) {
  const f = C.faq(
    [
      { q: 'Combien coûte un dépannage ?', a: "Le dépannage est au forfait, sur devis : je vous annonce son prix au téléphone, selon votre commune et la panne décrite, avant de me déplacer. Il comprend le déplacement, la recherche de la panne, la proposition de solution et le devis de réparation, sans obligation. Détails sur la page [Tarifs](/tarifs/)." },
      { q: 'Et si vous ne trouvez pas la panne ?', a: "Je vous fais une remise sur le forfait. Le forfait rémunère un résultat, c'est-à-dire savoir d'où vient la panne et combien coûterait la réparation : si je n'y parviens pas, vous ne payez pas le plein tarif." },
      { q: 'Et la réparation, combien coûte-t-elle ?', a: "Elle dépend de la panne trouvée et des pièces à remplacer. C'est pourquoi je ne publie pas de prix de pièces : à la fin du dépannage, je vous remets un devis précis. Vous êtes libre de l'accepter ou non." },
      { q: 'Qui vient chez moi ?', a: "ALED08, c'est un seul artisan : un jeune électricien des Ardennes. Vous m'avez directement au téléphone, et c'est moi qui viens chez vous." },
      { q: 'Quand pouvez-vous intervenir ?', a: "À tout moment, sur rendez-vous : en journée, le soir ou le week-end. Appelez-moi, nous convenons ensemble du créneau qui vous arrange. Le forfait reste le même, sans majoration." },
      { q: 'Dans quelles communes intervenez-vous ?', a: "Dans toutes les Ardennes : Charleville-Mézières, Sedan, Rethel, Rocroi, Vouziers, la vallée de la Meuse, le Porcien, la Thiérache et les villages entre elles. Consultez la [zone d'intervention](/zone-intervention/)." },
      { q: 'Faites-vous aussi des travaux, en dehors des pannes ?', a: "Oui : tableau électrique, mise en sécurité, éclairage, prises, ajout de circuits. Pour ces travaux, le devis est gratuit et détaillé." },
    ],
    'Les questions qu’on me pose souvent',
    'faq-accueil'
  );
  const mainCities = communes.filter((c) => c.main && c.page);
  const body = `<section class="hero">
  ${C.circuitBg('hh')}
  <div class="container hero-in">
    <div class="hero-copy">
      <p class="eyebrow"><span class="pulse" aria-hidden="true"></span>Spécialiste du dépannage électrique · Ardennes (08)</p>
      <h1><span class="h1-brand">${icon('zap', 'bolt')}ALED08</span><span class="h1-main">Dépannage &amp; Travaux Électriques dans les Ardennes</span></h1>
      <p class="hero-lead"><strong>Intervention à tout moment, sur rendez-vous.</strong></p>
      <p class="hero-lead hero-sub">Recherche de panne, dépannage, tableaux électriques, éclairage, prises et mise en sécurité.</p>
      <div class="hero-ctas">
        ${C.btnCall('btn-primary btn-lg', 'Dépannage : ' + site.phoneDisplay)}
        ${C.btnDevis('btn-light btn-lg', null, 'Devis gratuit')}
        ${C.btnWa('btn-wa btn-lg')}
      </div>
      <ul class="hero-proofs">
        <li>${icon('zap')}Forfait dépannage sur devis, prix annoncé avant</li>
        <li>${icon('shield-check')}Remise si la panne n’est pas trouvée</li>
        <li>${icon('file-text')}Devis de réparation sans obligation</li>
        <li>${icon('user')}Un jeune artisan à votre écoute</li>
      </ul>
    </div>
    ${C.dispoCard()}
  </div>
</section>
${C.trustBar()}

<section class="section" id="depannage"><div class="container">
  <div class="section-head"><p class="kicker">Ma spécialité</p><h2>Le dépannage électrique, à un prix connu d’avance</h2><p>Plus de courant, un disjoncteur qui saute, une prise ou une lumière en panne : je viens, je trouve la cause et je vous propose une solution. Un seul forfait, sans surprise.</p></div>
  ${C.forfaitBlock()}
  <div class="section-head" style="margin:56px auto 28px"><h3 class="h2">Partout dans les Ardennes</h3><p>Du nord au sud du département, je me déplace chez vous. Le prix du forfait vous est annoncé au téléphone, avant que je vienne.</p></div>
  ${C.kmTable()}
  <p class="center" style="margin-top:22px"><a class="btn btn-ghost" href="/tarifs/">${icon('calculator')}<span>Tout comprendre sur les tarifs</span></a></p>
</div></section>

<section class="section section-alt" id="passage"><div class="container">
  <div class="section-head"><p class="kicker">Déroulement</p><h2>Mon passage chez vous, étape par étape</h2><p>Du premier appel à la remise du devis, voici exactement ce qui se passe, et ce que couvre le forfait.</p></div>
  ${C.passage()}
  <div class="hero-ctas" style="justify-content:center;margin-top:36px">${C.btnCall('btn-primary btn-lg', 'Appeler pour un dépannage')}${C.btnWa('btn-wa btn-lg', 'Envoyer une photo de la panne', 'Bonjour, j’ai une panne électrique, voici une photo.')}</div>
</div></section>

<section class="section" id="qui"><div class="container grid grid-2" style="align-items:center">
  <div class="reveal">
    <p class="kicker">Qui vient chez vous ?</p>
    <h2>Bonjour et bienvenue chez ALED08</h2>
    <p>ALED08, c’est un jeune artisan électricien des Ardennes. Je décroche quand vous appelez, je viens chez vous et je réalise la réparation. Vous savez à qui vous avez affaire, du premier appel à la facture.</p>
    <p>J’ai toujours la même envie : comprendre d’où vient une panne et vous l’expliquer simplement. C’est comme ça que le dépannage est devenu ma spécialité.</p>
    <p>Ce que vous pouvez attendre de moi :</p>
    <ul class="list-check">
      <li>un prix annoncé avant de venir, et tenu ;</li>
      <li>une explication claire, sans jargon ;</li>
      <li>un devis écrit avant toute réparation ;</li>
      <li>un travail soigné et un chantier laissé propre.</li>
    </ul>
    <p><a class="btn btn-ghost" href="/qui-suis-je/">${icon('user')}<span>Faisons connaissance</span></a></p>
  </div>
  ${C.artisanCard()}
</div></section>

<section class="section section-dark"><div class="container grid grid-2" style="align-items:center">
  <div class="reveal">
    <p class="kicker">Disponibilités</p>
    <h2>Je viens quand ça vous arrange</h2>
    <p>Une panne ne choisit pas son moment. ALED08 intervient donc à tout moment, sur rendez-vous : on trouve ensemble le créneau qui vous convient, sans bouleverser votre journée.</p>
    <ul class="list-check">
      <li><strong>En journée, le soir ou le week-end</strong> : pas besoin de poser un congé.</li>
      <li><strong>Un appel suffit</strong> : je vous propose le créneau le plus proche.</li>
      <li><strong>Même forfait</strong> à tout moment, sans majoration.</li>
      <li><strong>Sur rendez-vous</strong> : vous savez à quelle heure j’arrive.</li>
    </ul>
    <div class="hero-ctas">${C.btnCall('btn-primary')}${C.btnWa('btn-wa', 'Envoyer une photo')}</div>
  </div>
  <div class="split-media reveal">
    <h3>${icon('clock')} Disponible à tout moment</h3>
    ${C.hoursTable('hours-dark')}
    <div class="stat-row">
      <div class="stat"><strong>7 j/7</strong><span>sur rendez-vous</span></div>
      <div class="stat"><strong>08</strong><span>toutes les Ardennes</span></div>
      <div class="stat"><strong>0 €</strong><span>de majoration</span></div>
    </div>
  </div>
</div></section>

<section class="section section-alt" id="prestations"><div class="container">
  <div class="section-head"><p class="kicker">Travaux</p><h2>Et pour vos travaux : un devis gratuit</h2><p>Une fois la panne réglée, ou pour un projet, je réalise aussi les travaux électriques des particuliers. Vous recevez un devis gratuit et détaillé avant que je commence.</p></div>
  ${C.serviceCards(mainServices, { featured: 'depannage' })}
  <div class="center" style="margin-top:34px">
    <p class="small muted" style="margin-bottom:12px">Et aussi :</p>
    <ul class="link-cloud" style="justify-content:center">${allServices
      .filter((s) => !mainServices.some((m) => m.path === s.path))
      .map((s) => `<li><a href="${s.path}">${esc(s.name)}</a></li>`)
      .join('')}<li><a href="/prestations/"><strong>Toutes les prestations →</strong></a></li></ul>
  </div>
</div></section>

<section class="section" id="zone"><div class="container grid grid-2">
  <div class="reveal">
    <p class="kicker">Zone d’intervention</p>
    <h2>Dépannage électrique dans toutes les Ardennes</h2>
    <p>J’interviens dans tout le département : Charleville-Mézières, Sedan, Rethel, Rocroi, Vouziers, la vallée de la Meuse, le Porcien et la Thiérache. Où que vous soyez, je vous annonce le prix avant de venir.</p>
    <ul class="link-cloud" style="margin:20px 0 24px">${mainCities.map((c) => `<li><a href="/${c.page}/">Électricien ${esc(c.name)}</a></li>`).join('')}<li><a href="/electricien-ardennes/">Électricien Ardennes</a></li></ul>
    <a class="btn btn-primary" href="/zone-intervention/">${icon('map-pin')}<span>Voir toutes les communes</span></a>
  </div>
  <div class="reveal">${C.mapEmbed()}</div>
</div></section>

${C.reviewsBlock(avis, 3)}

${f.html}

<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">Blog</p><h2>Conseils d’électricien</h2><p>Comprendre une panne, savoir quand changer un tableau, sécuriser sa maison : des articles clairs, sans jargon.</p></div>
  <div class="grid grid-posts">${posts.slice(0, 3).map(T.postCard).join('')}</div>
  <p class="center" style="margin-top:28px"><a class="btn btn-ghost" href="/blog/">${icon('book-open')}<span>Tous les articles</span></a></p>
</div></section>

${C.ctaBand({ title: 'Une panne, un projet, une question ?', text: 'Appelez, écrivez sur WhatsApp ou demandez un devis en ligne. Je vous réponds rapidement et on fixe ensemble un créneau.' })}`;
  return {
    path: '/',
    title: 'Dépannage électrique Ardennes : électricien à tout moment | ALED08',
    description: `Dépannage électrique dans toutes les Ardennes : forfait sur devis, prix annoncé avant de venir, devis de réparation compris. ALED08, jeune artisan électricien.`,
    crumbs: [HOME],
    body,
    schema: [f.schema],
    priority: 1,
    changefreq: 'weekly',
  };
}

// ====================================================================== QUI SUIS-JE
function about() {
  const crumbs = [HOME, { name: 'Qui suis-je ?', path: '/qui-suis-je/' }];
  const body = `${C.pageHero({
    kicker: 'Qui suis-je ?',
    h1: 'ALED08, votre électricien dans les Ardennes',
    lead: "Bonjour ! ALED08, c'est un **jeune artisan électricien** qui intervient dans **toutes les Ardennes**. Vous m'avez directement au téléphone, je me déplace à tout moment sur rendez-vous, et je vous annonce le prix avant de venir.",
    crumbs,
    chips: [{ icon: 'user', text: 'Jeune artisan motivé' }, { icon: 'zap', text: 'Spécialiste du dépannage' }, { icon: 'map-pin', text: 'Toutes les Ardennes (08)' }],
  })}
<section class="section"><div class="container layout-aside">
  <div class="prose">
    ${md(`## Un jeune artisan, passionné par son métier

L'électricité, c'est un métier qui me plaît chaque jour. On y apprend vite que deux installations ne se ressemblent jamais : la maison câblée au cordeau, la ferme équipée par étapes sur trois générations, l'appartement où chaque occupant a ajouté sa prise. C'est ce qui m'a conduit vers ce que je préfère : **la recherche de panne**.

J'ai créé ALED08 avec une idée simple : rendre service aux gens d'ici, sérieusement et avec le sourire.

## Pourquoi le dépannage ?

Parce que c'est là que je me sens le plus utile. Quand le courant saute un soir d'hiver, vous n'avez pas besoin d'un discours : vous avez besoin de quelqu'un qui vient, qui trouve et qui explique. Faire repartir le courant est souvent facile. **Comprendre pourquoi il a sauté**, c'est le vrai travail, et c'est ce qui évite que la panne revienne.

## Vous m'avez directement

Quand vous appelez, c'est moi qui décroche, ou qui vous rappelle si je suis en intervention. C'est moi qui viens, qui cherche la panne, qui rédige le devis et qui répare. Et si vous avez une question après mon passage, vous savez qui rappeler.

## Disponible à tout moment

Une panne se découvre souvent en rentrant du travail, ou un dimanche matin. Poser une journée de congé pour attendre un artisan n'arrange personne : j'interviens donc **à tout moment, sur rendez-vous**, en journée comme le soir ou le week-end. Le prix ne change pas selon le jour ou l'heure.

## Ma façon de travailler

- **Écouter d'abord.** Vous connaissez votre maison : ce que vous me racontez de la panne m'aide à la trouver.
- **Comprendre avant de remplacer.** Changer un disjoncteur qui saute sans chercher pourquoi, c'est repousser le problème.
- **Mesurer plutôt que supposer.** Isolement, continuité, terre, tests des différentiels : les mesures confirment le diagnostic.
- **Expliquer simplement.** Vous savez ce qui s'est passé et comment l'éviter. Aucune question n'est bête.
- **Annoncer le prix avant.** Le forfait dépannage est confirmé au téléphone ; toute réparation fait l'objet d'un devis écrit, sans obligation.
- **Laisser un travail propre.** Matériel de marque, connexions soignées, circuits repérés, chantier nettoyé.

[[cta]]

## Ce à quoi je m'engage

Je préfère les engagements simples aux grandes promesses : un prix annoncé à l'avance, une explication claire et un devis avant toute réparation. Et quand une réparation n'est pas nécessaire, je vous le dis.

## La norme NF C 15-100, une évidence

La norme NF C 15-100 fixe les règles des installations électriques des logements : sections de câbles, protections, nombre de prises par circuit, salle de bain, mise à la terre. Je l'applique à chaque intervention, même la plus petite. Et lorsque je constate une anomalie dangereuse qui ne fait pas partie de votre demande, je vous la signale : vous décidez ensuite, sans pression.

## Ce sur quoi je me concentre

ALED08 s'adresse aux **particuliers** : dépannage et recherche de panne d'abord, puis petits et moyens travaux (tableaux, prises, interrupteurs, éclairage, circuits supplémentaires, mise en sécurité). Pour une construction neuve complète ou un gros chantier professionnel, je préfère vous le dire franchement et vous orienter vers une entreprise dimensionnée pour cela.`).replace('<p>[[cta]]</p>', C.inlineCta({ title: 'On en parle ?', text: 'Un appel suffit pour savoir si je peux vous aider, et à quel prix.' }))}
  </div>
  <aside class="aside-sticky">${C.artisanCard()}${C.forfaitBlock({ compact: true })}</aside>
</div></section>

<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">Engagements</p><h2>Mes engagements, noir sur blanc</h2></div>
  <div class="values">
    ${[
      ['euro', 'Prix annoncé avant', 'Le forfait dépannage vous est annoncé au téléphone, avant que je vienne. Pas de prix « à la tête du client ».'],
      ['file-text', 'Devis avant travaux', 'Gratuit pour vos travaux, compris dans le forfait lors d’un dépannage. Toujours sans obligation.'],
      ['clock', 'Ponctualité', 'Un rendez-vous fixé est tenu. En cas d’imprévu, je préviens.'],
      ['handshake', 'Conseil honnête', 'Je propose ce qui est utile, pas ce qui rapporte le plus.'],
      ['sparkles', 'Chantier propre', 'Protection des sols, nettoyage, aucun déchet laissé chez vous.'],
      ['receipt', 'Facture claire', 'Matériel posé et travaux réalisés détaillés sur la facture.'],
    ]
      .map(([i, t, d]) => `<div class="feature reveal">${icon(i)}<div><h3>${t}</h3><p>${d}</p></div></div>`)
      .join('')}
  </div>
</div></section>
${C.reviewsBlock(avis, 3).replace('section section-alt', 'section')}
${C.ctaBand({ title: 'Une panne ou un projet ? Parlons-en', text: 'Appelez-moi ou écrivez-moi : je vous réponds avec plaisir, et on fixe un créneau qui vous arrange.' })}`;
  return {
    path: '/qui-suis-je/',
    title: "Qui suis-je ? Un jeune artisan électricien des Ardennes | ALED08",
    description: "ALED08 : un jeune artisan électricien des Ardennes. Dépannage et recherche de panne à tout moment, sur rendez-vous, en toute confiance.",
    crumbs,
    body,
    webpageType: 'AboutPage',
    priority: 0.8,
  };
}

// ====================================================================== PRESTATIONS (hub)
function prestations({ seoPages }) {
  const crumbs = [HOME, { name: 'Prestations', path: '/prestations/' }];
  const groupLinks = (g) => seoPages.filter((p) => p.group === g).map((p) => `<li><a href="/${p.slug}/">${esc(p.label)}</a></li>`).join('');
  const body = `${C.pageHero({
    kicker: 'Prestations',
    h1: 'Prestations électriques pour les particuliers des Ardennes',
    lead: "**Ma spécialité, c'est le dépannage**, dans toutes les Ardennes : un forfait sur devis, annoncé avant de venir, comprenant le déplacement, la recherche de panne, la proposition de solution et le devis de réparation. Je réalise aussi les travaux électriques des particuliers, sur devis. **Quatorze prestations**, un même niveau d'exigence : sécurité et norme NF C 15-100.",
    crumbs,
  })}
<section class="section"><div class="container">
  <div class="section-head"><p class="kicker">Prestations principales</p><h2>Le dépannage d’abord, les travaux ensuite</h2></div>
  ${C.serviceCards(mainServices, { featured: 'depannage' })}
</div></section>
<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">Liste complète</p><h2>Les 14 prestations ALED08</h2><p>Chaque prestation renvoie vers une page détaillée : ce qu’elle comprend, son déroulement et son prix.</p></div>
  <div class="grid grid-cards">${allServices
    .map((s) => `<a class="card card-service reveal" href="${s.path}"><span class="icon-tile">${icon(s.icon)}</span><h3>${esc(s.name)}</h3><span class="card-more">Détails et tarifs ${icon('arrow-right')}</span></a>`)
    .join('')}</div>
</div></section>
<section class="section"><div class="container grid grid-2">
  <div class="reveal">
    <p class="kicker">Tarifs</p>
    <h2>Un forfait dépannage, des devis pour le reste</h2>
    <p>Le dépannage est facturé au forfait, sur devis : je vous annonce son prix au téléphone avant de venir. Déplacement, recherche de panne, solution proposée et devis de réparation : tout est inclus. La réparation et les pièces sont chiffrées sur devis, sans obligation. Les travaux planifiés font l’objet d’un devis gratuit.</p>
    <p><a class="btn btn-ghost" href="/tarifs/">${icon('calculator')}<span>Tarifs détaillés et exemples</span></a></p>
  </div>
  <div class="reveal">${C.pricingTable()}</div>
</div></section>
<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">Problèmes fréquents</p><h2>Vous reconnaissez votre situation ?</h2></div>
  <ul class="link-cloud" style="justify-content:center">${groupLinks('symptomes')}</ul>
  <div class="section-head" style="margin-top:48px"><p class="kicker">Travaux spécifiques</p><h2>Prestations techniques</h2></div>
  <ul class="link-cloud" style="justify-content:center">${groupLinks('services')}${groupLinks('contextes')}</ul>
</div></section>
${C.ctaBand({ title: 'Vous ne trouvez pas votre besoin ?', text: 'Décrivez-le moi en deux mots : si c’est de l’électricité chez un particulier, il y a de grandes chances que je puisse vous aider.' })}`;
  return {
    path: '/prestations/',
    title: 'Prestations : dépannage électrique et travaux sur devis | ALED08',
    description: "Les prestations d'ALED08 dans les Ardennes : dépannage, recherche de panne, tableau électrique, prises, éclairage, mise en sécurité, petits travaux.",
    crumbs,
    body,
    schema: [{ '@type': 'ItemList', name: 'Prestations ALED08', itemListElement: allServices.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: site.url + s.path })) }],
    priority: 0.9,
  };
}

// ====================================================================== PAGE PRESTATION
function servicePage(s) {
  const crumbs = [HOME, { name: 'Prestations', path: '/prestations/' }, { name: s.label, path: s.path }];
  const f = C.faq(s.faq, `Questions fréquentes : ${s.label.toLowerCase()}`);
  const body = `${C.pageHero({ kicker: s.kicker, h1: s.h1, lead: s.lead, crumbs, prestation: s.prestation, chips: s.chips })}
<section class="section"><div class="container layout-aside">
  <div class="prose">
    ${md(s.intro)}
    <ul class="list-check">${s.includes.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>
    ${md(s.body).replace('<p>[[cta]]</p>', C.inlineCta({ ...s.cta, prestation: s.prestation }))}
    ${C.relatedLinks(s.links, 'Situations et pages liées')}
  </div>
  ${T.aside({})}
</div></section>
<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">Déroulement</p><h2>${s.key === 'depannage' ? 'Mon passage chez vous, étape par étape' : 'Comment se passe l’intervention'}</h2></div>
  ${s.key === 'depannage' ? C.passage() : C.steps(s.steps)}
</div></section>
<section class="section"><div class="container container-narrow">
  <div class="section-head"><p class="kicker">Tarifs</p><h2>${s.key === 'depannage' || s.key === 'panne' ? 'Le forfait dépannage' : 'Comment est fixé le prix'}</h2><p>${s.key === 'depannage' || s.key === 'panne' ? 'Un prix annoncé au téléphone avant de venir, le même le soir et le week-end.' : 'Les travaux sont chiffrés sur devis gratuit. En cas de panne, le forfait dépannage s’applique.'}</p></div>
  ${s.key === 'depannage' || s.key === 'panne' ? C.forfaitBlock() : C.pricingTable()}
  <p class="center" style="margin-top:20px"><a href="/tarifs/">Voir le détail des tarifs et le déroulement de mon passage</a></p>
</div></section>
${C.cases(s.cases)}
${f.html}
${C.ctaBand({ ...s.cta, prestation: s.prestation })}`;
  return {
    path: s.path,
    title: s.title,
    description: s.description,
    crumbs,
    body,
    schema: [
      { '@type': 'Service', '@id': site.url + s.path + '#service', name: s.label, description: s.description, provider: { '@id': site.url + '/#entreprise' }, areaServed: { '@type': 'AdministrativeArea', name: 'Ardennes (08)' }, url: site.url + s.path },
      f.schema,
    ],
    priority: 0.9,
  };
}

// ====================================================================== TARIFS
function tarifsPage() {
  const crumbs = [HOME, { name: 'Tarifs', path: '/tarifs/' }];
  const f = C.faq([
    { q: 'Que comprend exactement le forfait dépannage ?', a: "Le déplacement à votre domicile, la recherche de la panne, la proposition de solution et le devis de réparation. Vous ne payez rien de plus tant que vous n'avez pas accepté le devis." },
    { q: 'Pourquoi n’affichez-vous pas le prix des pièces ?', a: "Parce qu'il dépend de ce que l'on trouve : une borne desserrée ne se répare pas comme un disjoncteur fondu ou un câble abîmé. Plutôt que d'afficher des prix « à partir de » qui ne correspondent jamais à la réalité, je vous remets un devis précis à la fin du dépannage." },
    { q: 'Que se passe-t-il si vous ne trouvez pas la panne ?', a: "Je vous fais une remise sur le forfait. C'est un engagement simple : si je repars sans avoir identifié l'origine du problème, vous ne payez pas le plein tarif. Le montant de la remise vous est indiqué sur place." },
    { q: 'Suis-je obligé d’accepter le devis de réparation ?', a: "Non. Le devis est sans obligation. Si vous le refusez, ou si vous souhaitez réfléchir, vous ne réglez que le forfait dépannage." },
    { q: 'Pouvez-vous réparer tout de suite si j’accepte le devis ?', a: "Dans la majorité des cas, oui : j'ai dans mon véhicule le matériel courant (prises, interrupteurs, disjoncteurs, connectique). Si une pièce particulière doit être commandée, on fixe un nouveau créneau." },
    { q: 'Le forfait est-il plus cher le soir ou le week-end ?', a: "Non. Le forfait dépannage est le même du lundi au dimanche, en soirée comme le week-end." },
    { q: 'Pourquoi le forfait est-il sur devis ?', a: "Parce qu'un dépannage à deux pas ou à l'autre bout du département, une prise qui ne marche plus ou une maison entière sans courant ne demandent pas le même temps. Au téléphone, vous me décrivez la panne et votre adresse : je vous annonce un prix ferme pour le forfait, avant de me déplacer. Il n'y a pas de surprise une fois sur place." },
    { q: 'Le devis est-il gratuit pour des travaux ?', a: "Oui. Pour des travaux sans panne (tableau, éclairage, prises, mise en sécurité…), le devis est gratuit et sans engagement. Lors d'un dépannage, le devis de réparation est compris dans le forfait." },
  ], 'Questions sur les tarifs');
  const body = `${C.pageHero({
    kicker: 'Tarifs',
    h1: 'Tarif du dépannage électrique : un forfait annoncé avant de venir',
    lead: "Pas de prix cachés, pas de majoration le soir ou le week-end. **Un forfait pour le dépannage, sur devis**, dont je vous annonce le prix au téléphone avant de venir. Ce forfait inclut mon déplacement, la recherche de la panne, la solution que je vous propose et le devis de réparation. **Si je ne trouve pas la panne, je vous fais une remise.** La réparation est ensuite chiffrée sur devis : vous décidez.",
    crumbs,
    prestation: 'depannage',
    chips: [{ icon: 'zap', text: 'Forfait sur devis, annoncé avant' }, { icon: 'shield-check', text: 'Remise si panne non trouvée' }, { icon: 'file-text', text: 'Devis de réparation sans obligation' }, { icon: 'moon', text: 'Sans majoration soir & week-end' }],
  })}
<section class="section"><div class="container">
  <div class="section-head"><p class="kicker">Le forfait</p><h2>Ce que comprend le forfait dépannage</h2></div>
  ${C.forfaitBlock()}
</div></section>
<section class="section section-alt" id="communes"><div class="container">
  <div class="section-head"><p class="kicker">Comment le prix est fixé</p><h2>Un prix annoncé avant de venir, partout dans les Ardennes</h2><p>Le forfait dépend de votre commune et de la panne que vous me décrivez. Je vous l’annonce au téléphone : c’est ce prix-là qui s’applique.</p></div>
  <div class="reveal prose" style="margin:0 auto">
      ${md(`### En pratique

1. **Vous m'appelez** et vous me décrivez la panne : ce qui ne marche plus, depuis quand, ce qui a été essayé. Une photo du tableau sur WhatsApp aide beaucoup.
2. **Je vous annonce le prix du forfait** pour votre adresse. Vous acceptez ou non, sans engagement.
3. **Je viens au créneau convenu**, au prix annoncé. Il couvre tout mon passage jusqu'au devis de réparation, que vous acceptez ou non.`)}
  </div>
</div></section>
<section class="section" id="passage"><div class="container">
  <div class="section-head"><p class="kicker">Déroulement</p><h2>Mon passage chez vous, étape par étape</h2><p>Voici ce que vous achetez avec le forfait : mon déplacement et mon temps, jusqu’à ce que vous sachiez d’où vient la panne et combien coûterait la réparation.</p></div>
  ${C.passage()}
</div></section>
<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">En clair</p><h2>Ce que vous payez, ce que vous ne payez jamais</h2></div>
  ${C.payBlock()}
</div></section>
<section class="section"><div class="container grid grid-2">
  <div class="reveal prose">
    ${md(`## Pourquoi pas de prix de pièces ?

Une même panne peut avoir des causes très différentes. Afficher un prix « à partir de » pour une prise ou un disjoncteur ne reflète jamais votre situation réelle. Je préfère **trouver la panne d'abord**, puis vous donner **un prix exact**, par écrit.

## Et pour des travaux ? Le devis est gratuit

Remplacement de tableau, mise en sécurité, éclairage, ajout de prises ou de circuits : pour ces travaux sans panne, je vous remets un **devis gratuit et détaillé**, après échange et, si besoin, une visite.

> Si une découverte en cours de réparation change la donne, je m'arrête, je vous explique et je vous laisse décider avant de poursuivre.`)}
    <p><a class="btn btn-primary" href="/devis/">${icon('file-text')}<span>Demander un devis gratuit</span></a></p>
  </div>
  <div class="reveal">${C.pricingTable()}</div>
</div></section>
${f.html}
${C.ctaBand({ title: 'Un prix clair avant de commencer', text: 'Forfait dépannage annoncé au téléphone, devis de réparation sans obligation : appelez-moi, on fixe un créneau ensemble.', prestation: 'depannage' })}
`;
  return {
    path: '/tarifs/',
    title: 'Tarif dépannage électrique Ardennes : forfait sur devis | ALED08',
    description: "Dépannage électrique dans les Ardennes : forfait sur devis, annoncé avant de venir, avec déplacement, recherche de panne et devis compris. Sans majoration le soir.",
    crumbs,
    body,
    schema: [f.schema, {
      '@type': 'Offer', '@id': site.url + '/tarifs/#forfait', name: 'Forfait dépannage électrique',
      description: "Forfait sur devis, prix annoncé avant le déplacement. Déplacement, recherche de panne, proposition de solution et devis de réparation sans obligation. Remise accordée si l'origine de la panne n'est pas trouvée.",
      seller: { '@id': site.url + '/#entreprise' }, areaServed: { '@type': 'AdministrativeArea', name: 'Ardennes (08)' },
      itemOffered: { '@type': 'Service', name: 'Dépannage électrique à domicile', serviceType: 'Dépannage électrique' },
    }],
    priority: 0.9,
  };
}

// ====================================================================== ZONE
function zone({ seoPages }) {
  const crumbs = [HOME, { name: 'Zone d’intervention', path: '/zone-intervention/' }];
  const villes = seoPages.filter((p) => p.group === 'villes');
  const f = C.faq([
    { q: 'Intervenez-vous en dehors de cette liste de communes ?', a: "Oui. J'interviens dans toutes les communes des Ardennes, même celles qui ne figurent pas ici. Appelez-moi : je vous annonce le prix du forfait pour votre adresse." },
    { q: 'Le délai est-il plus long pour les communes éloignées ?', a: "Pas forcément. J'organise mes tournées du soir et du week-end par secteur : une intervention à Givet, Sedan ou Rocroi peut être regroupée avec une autre dans le même secteur." },
    { q: 'Le prix est-il le même partout ?', a: "Le forfait dépend de votre commune et de la panne. C'est pourquoi il est sur devis : je vous annonce le montant au téléphone, avant de me déplacer, et c'est ce prix qui s'applique." },
  ], 'Questions sur la zone d’intervention');
  const body = `${C.pageHero({
    kicker: 'Zone d’intervention',
    h1: 'Zone d’intervention : toutes les Ardennes',
    lead: "J'interviens chez les particuliers dans **tout le département des Ardennes** : Charleville-Mézières, Sedan, Rethel, Rocroi, Vouziers, Givet, la vallée de la Meuse, le Porcien, la Thiérache et tous les villages entre ces communes.",
    crumbs,
  })}
<section class="section"><div class="container grid grid-2">
  <div class="prose reveal">
    ${md(`## Tout le département

Des villages du Porcien aux villes de la vallée de la Meuse, de la Thiérache à l'Argonne, je me déplace **partout dans les Ardennes**. J'organise mes interventions par secteur pour garder des délais courts, même loin des grandes villes.

## Un prix annoncé avant de venir

Le forfait dépannage est **sur devis** : il dépend de votre commune et de la panne. Vous m'appelez, vous me décrivez le problème, et **je vous annonce le prix avant de me déplacer**. C'est ce prix qui s'applique, sans surprise une fois sur place.`)}
  </div>
  <div class="reveal">${C.mapEmbed()}</div>
</div></section>
<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">Communes</p><h2>Les secteurs où j’interviens</h2><p>Quelques communes par secteur, à titre d’exemple : j’interviens dans toutes les communes des Ardennes. Cliquez sur une commune pour découvrir sa page dédiée.</p></div>
  ${C.communesList()}
</div></section>
<section class="section"><div class="container">
  <div class="section-head"><p class="kicker">Pages locales</p><h2>Votre électricien près de chez vous</h2></div>
  <div class="grid grid-cards">${villes
    .map((v) => `<a class="card card-service reveal" href="/${v.slug}/"><span class="icon-tile">${icon('map-pin')}</span><h3>${esc(v.label)}</h3><p>${esc(v.teaser || '')}</p><span class="card-more">Voir la page ${icon('arrow-right')}</span></a>`)
    .join('')}</div>
  <div class="section-head" style="margin:56px auto 24px"><h2 class="h3">Secteurs et services dans les Ardennes</h2></div>
  <ul class="link-cloud" style="justify-content:center">${seoPages
    .filter((p) => p.group === 'secteurs' || p.group === 'ardennes' || p.group === 'services-villes')
    .map((p) => `<li><a href="/${p.slug}/">${esc(p.label)}</a></li>`)
    .join('')}</ul>
</div></section>
${f.html}
${C.ctaBand({ title: 'Vous êtes dans le secteur ?', text: 'Appelez-moi : je vous annonce le forfait dépannage pour votre adresse et je vous propose un créneau.' })}
`;
  return {
    path: '/zone-intervention/',
    title: "Zone d'intervention : dépannage électrique dans les Ardennes | ALED08",
    description: "ALED08 intervient dans toutes les Ardennes : Charleville-Mézières, Sedan, Rethel, Rocroi, Vouziers, Givet et les villages. Prix annoncé avant de venir.",
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== RÉALISATIONS
function realisations() {
  const crumbs = [HOME, { name: 'Réalisations', path: '/realisations/' }];
  const body = `${C.pageHero({
    kicker: 'Réalisations',
    h1: 'Réalisations : avant / après',
    lead: "Un tableau à fusibles qui devient un tableau moderne et repéré, une prise brûlée remplacée dans les règles, une façade enfin éclairée : **faites glisser le curseur** pour voir la différence.",
    crumbs,
    compact: true,
  })}
<section class="section"><div class="container">
  ${C.beforeAfter(gallery)}
  <p class="notice" style="margin-top:32px">${icon('info')} Les visuels ci-dessus sont des illustrations des interventions types réalisées par ALED08. Ils seront complétés au fil des chantiers par des photos réelles, publiées avec l’accord des clients.</p>
</div></section>
<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">Types d’interventions</p><h2>Ce que je réalise le plus souvent</h2></div>
  ${C.serviceCards(mainServices)}
</div></section>
${C.reviewsBlock(avis, 6).replace('section section-alt', 'section')}
${C.ctaBand({ title: 'Votre installation pourrait être la prochaine', text: 'Envoyez-moi une photo de votre tableau ou de la zone à traiter : je vous dis ce qui est possible et à quel prix.' })}`;
  return {
    path: '/realisations/',
    title: 'Réalisations avant/après : tableaux, prises, éclairage | ALED08',
    description: "Avant/après d'interventions électriques types dans les Ardennes : remplacement de tableau à fusibles, prise brûlée, éclairage de façade, mise en sécurité.",
    crumbs,
    body,
    priority: 0.6,
  };
}

// ====================================================================== FAQ
function faqFull() {
  const crumbs = [HOME, { name: 'FAQ', path: '/faq/' }];
  const all = faqPage.flatMap((g) => g.items);
  const schema = { '@type': 'FAQPage', mainEntity: all.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: require('../lib/md').plain(f.a) } })) };
  const body = `${C.pageHero({
    kicker: 'FAQ',
    h1: 'Questions fréquentes sur ALED08 et vos travaux électriques',
    lead: "Tarifs, disponibilités, déroulement d'une intervention, sécurité : **les réponses aux questions qu'on me pose le plus souvent**. Vous ne trouvez pas la vôtre ? Appelez-moi.",
    crumbs,
    compact: true,
  })}
<section class="section"><div class="container container-narrow">
  <ul class="link-cloud" style="margin-bottom:40px">${faqPage.map((g) => `<li><a href="#${g.id}">${esc(g.title)}</a></li>`).join('')}</ul>
  ${faqPage
    .map(
      (g) => `<div class="faq-group" id="${g.id}"><h2>${icon(g.icon)}${esc(g.title)}</h2><div class="faq">${g.items
        .map((f) => `<details class="faq-item"><summary>${inline(f.q)}${icon('chevron-down')}</summary><div class="faq-a">${md(f.a)}</div></details>`)
        .join('')}</div></div>`
    )
    .join('')}
</div></section>
${C.ctaBand({ title: 'Une autre question ?', text: 'Le plus simple reste de m’appeler ou de m’écrire sur WhatsApp : je réponds volontiers, même sans intervention à la clé.' })}`;
  return { path: '/faq/', title: 'FAQ électricien : tarifs, délais, sécurité, devis | ALED08', description: "Toutes les réponses sur les interventions d'ALED08 dans les Ardennes : tarifs, déplacement, disponibilités, devis, paiement, sécurité électrique.", crumbs, body, schema: [schema], priority: 0.7 };
}

// ====================================================================== FORMULAIRES
function formHidden(type) {
  return `<input type="hidden" name="type" value="${type}"><input type="hidden" name="_t" value=""><div class="hp" aria-hidden="true"><label>Ne pas remplir <input type="text" name="site_web" tabindex="-1" autocomplete="off"></label></div>`;
}
function consentField(id) {
  return `<label class="check" for="${id}"><input type="checkbox" id="${id}" name="consentement" value="oui" required><span>J’accepte que mes informations soient utilisées pour répondre à ma demande. Elles ne sont ni revendues ni utilisées à d’autres fins. <a href="/politique-de-confidentialite/">Politique de confidentialité</a>.</span></label>`;
}

function devis() {
  const crumbs = [HOME, { name: 'Demande de devis', path: '/devis/' }];
  const f = C.faq([
    { q: 'Sous quel délai recevrai-je une réponse ?', a: "Je réponds en général dans la journée, le plus souvent en fin d'après-midi ou en soirée. Pour une panne, un appel reste le moyen le plus rapide." },
    { q: 'Puis-je envoyer des photos ?', a: "Oui, et c'est vivement conseillé : envoyez-les sur [WhatsApp](" + C.waUrl('Bonjour, voici des photos pour ma demande de devis.') + ") en précisant votre nom. Une photo du tableau électrique ouvert est souvent très parlante." },
    { q: 'Le devis m’engage-t-il ?', a: "Non. Le devis de travaux est gratuit et sans engagement. Vous êtes libre de l'accepter, de le comparer ou de le refuser." },
    { q: 'Et pour une panne ?', a: "Pour une panne, je me déplace au forfait dépannage, dont je vous annonce le prix avant de venir : déplacement, recherche de la panne, proposition de solution et devis de réparation sans obligation. Si je ne trouve pas la panne, je vous fais une remise sur le forfait. Le plus rapide reste de m'appeler." },
  ], 'Questions sur le devis');
  const body = `${C.pageHero({
    kicker: 'Dépannage & devis',
    h1: 'Demande de dépannage ou de devis',
    lead: "**Une panne ?** Je vous annonce le prix du forfait dépannage, je me déplace et je vous remets un devis de réparation sans obligation. **Un projet de travaux ?** Le devis est gratuit. Décrivez votre besoin : je vous recontacte rapidement avec un prix et un créneau.",
    crumbs,
    compact: true,
    chips: [{ icon: 'zap', text: 'Panne : forfait sur devis' }, { icon: 'file-text', text: 'Travaux : devis gratuit' }, { icon: 'whatsapp', text: 'Photos via WhatsApp' }],
  })}
<section class="section"><div class="container layout-aside">
  <div class="form-card">
    <h2 class="h3">Votre demande</h2>
    <form class="form" method="post" action="${site.formAction}" data-form novalidate>
      ${formHidden('devis')}
      <p class="form-alert" data-form-error hidden>L’envoi n’a pas abouti. Vérifiez les champs obligatoires ou appelez directement le ${site.phoneDisplay}.</p>
      <div class="form-row">
        <div class="field"><label for="d-prestation">Prestation souhaitée <span class="req">*</span></label>
          <select id="d-prestation" name="prestation" required><option value="">Choisir…</option>${allServices.map((s) => `<option value="${s.value}">${esc(s.name)}</option>`).join('')}<option value="autre">Autre demande</option></select></div>
        <div class="field"><label for="d-commune">Commune d’intervention <span class="req">*</span></label>
          <select id="d-commune" name="commune" required><option value="">Choisir…</option>${communes.map((c) => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('')}<option value="Autre commune">Autre commune</option></select></div>
      </div>
            <div class="field"><span class="label">Urgence</span>
        <div class="radio-group">
          <label><input type="radio" name="urgence" value="Dès que possible" checked> Dès que possible</label>
          <label><input type="radio" name="urgence" value="Cette semaine"> Cette semaine</label>
          <label><input type="radio" name="urgence" value="Pas pressé"> Pas pressé</label>
        </div></div>
      <div class="field"><span class="label">Créneaux qui vous arrangent</span>
        <div class="radio-group">
          <label><input type="checkbox" name="creneaux[]" value="Soir en semaine"> Soir en semaine</label>
          <label><input type="checkbox" name="creneaux[]" value="Samedi"> Samedi</label>
          <label><input type="checkbox" name="creneaux[]" value="Dimanche"> Dimanche</label>
        </div></div>
      <div class="field"><label for="d-message">Décrivez votre besoin <span class="req">*</span></label>
        <textarea id="d-message" name="message" required minlength="10" placeholder="Ex. : le différentiel saute quand il pleut depuis une semaine ; ou : remplacer un tableau à fusibles dans une maison des années 60…"></textarea>
        <span class="hint">Âge approximatif de l’installation, symptômes, pièces concernées : tout détail aide.</span></div>
      <div class="form-row">
        <div class="field"><label for="d-nom">Nom <span class="req">*</span></label><input id="d-nom" name="nom" type="text" autocomplete="name" required></div>
        <div class="field"><label for="d-tel">Téléphone <span class="req">*</span></label><input id="d-tel" name="telephone" type="tel" autocomplete="tel" required pattern="[0-9 +\\(\\).\\-]{10,20}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="d-email">E-mail</label><input id="d-email" name="email" type="email" autocomplete="email"></div>
        <div class="field"><label for="d-adresse">Adresse (facultatif)</label><input id="d-adresse" name="adresse" type="text" autocomplete="street-address"></div>
      </div>
      ${consentField('d-consent')}
      <button class="btn btn-primary btn-lg" type="submit">${icon('send')}<span>Envoyer ma demande de devis</span></button>
    </form>
  </div>
  <aside class="aside-sticky">
    <div class="aside-card">
      <h2>${icon('list-checks')} Et ensuite ?</h2>
      <ol class="list-num" style="font-size:.95rem">
        <li>Je lis votre demande et je vous rappelle, généralement dans la journée.</li>
        <li>On précise le besoin ; si nécessaire, je viens voir sur place.</li>
        <li>Vous recevez un prix clair, et on fixe ensemble un créneau.</li>
      </ol>
    </div>
    <div class="aside-card aside-card-dark">
      <h2>${icon('zap')} Une panne en cours ?</h2>
      <p class="small">Pour un dépannage, l’appel est le plus rapide.</p>
      ${C.btnCall('btn-primary btn-block', 'Appeler')}
      ${C.btnWa('btn-wa btn-block', 'Envoyer des photos', 'Bonjour, voici des photos pour ma demande de devis.')}
    </div>
    ${C.forfaitBlock({ compact: true })}
  </aside>
</div></section>
${f.html}
`;
  return { path: '/devis/', title: 'Demande de dépannage ou de devis, Ardennes | ALED08', description: "Panne électrique dans les Ardennes : forfait dépannage annoncé avant de venir, devis de réparation sans obligation. Travaux : devis gratuit. Réponse rapide.", crumbs, body, schema: [f.schema], priority: 0.9 };
}

function contact() {
  const crumbs = [HOME, { name: 'Contact', path: '/contact/' }];
  const body = `${C.pageHero({
    kicker: 'Contact',
    h1: 'Contacter ALED08',
    lead: "Téléphone, WhatsApp, e-mail ou formulaire : **choisissez le moyen qui vous arrange**. Pour une panne, l'appel reste le plus rapide.",
    crumbs,
    compact: true,
  })}
<section class="section"><div class="container grid grid-2">
  <div>
    <div class="contact-cards">
      <a class="contact-card" href="${C.tel}" data-track="call">${icon('phone-call')}<div><strong>${site.phoneDisplay}</strong><span>Appel ou SMS, le plus rapide pour un dépannage</span></div></a>
      <a class="contact-card wa" href="${C.waUrl()}" target="_blank" rel="noopener" data-track="whatsapp">${icon('whatsapp')}<div><strong>WhatsApp</strong><span>Idéal pour envoyer des photos de la panne ou du tableau</span></div></a>
      <a class="contact-card" href="mailto:${site.email}">${icon('mail')}<div><strong>${site.email}</strong><span>Pour une question ou un projet sans urgence</span></div></a>
      <div class="contact-card">${icon('map-pin')}<div><strong>${site.address.postalCode} ${site.address.city}</strong><span>Interventions à domicile dans les Ardennes, sur rendez-vous</span></div></div>
    </div>
    <div class="aside-card" style="margin-top:22px">
      <h2 class="h3">${icon('clock')} Disponible à tout moment</h2>
      ${C.hoursTable()}
      <p class="small muted" style="margin:10px 0 0">Uniquement sur rendez-vous. Messages et appels consultés chaque jour.</p>
    </div>
  </div>
  <div class="form-card">
    <h2 class="h3">Écrire un message</h2>
    <form class="form" method="post" action="${site.formAction}" data-form novalidate>
      ${formHidden('contact')}
      <p class="form-alert" data-form-error hidden>L’envoi n’a pas abouti. Vérifiez les champs obligatoires ou appelez le ${site.phoneDisplay}.</p>
      <div class="form-row">
        <div class="field"><label for="c-nom">Nom <span class="req">*</span></label><input id="c-nom" name="nom" type="text" autocomplete="name" required></div>
        <div class="field"><label for="c-tel">Téléphone <span class="req">*</span></label><input id="c-tel" name="telephone" type="tel" autocomplete="tel" required pattern="[0-9 +\\(\\).\\-]{10,20}"></div>
      </div>
      <div class="field"><label for="c-email">E-mail</label><input id="c-email" name="email" type="email" autocomplete="email"></div>
      <div class="field"><label for="c-commune">Commune</label><input id="c-commune" name="commune" type="text" autocomplete="address-level2"></div>
      <div class="field"><label for="c-message">Message <span class="req">*</span></label><textarea id="c-message" name="message" required minlength="10"></textarea></div>
      ${consentField('c-consent')}
      <button class="btn btn-primary btn-lg" type="submit">${icon('send')}<span>Envoyer le message</span></button>
      <p class="small muted" style="margin:0">Pour un devis détaillé, utilisez plutôt le <a href="/devis/">formulaire de devis</a>.</p>
    </form>
  </div>
</div></section>
<section class="section section-alt"><div class="container">
  <div class="section-head"><p class="kicker">Localisation</p><h2>J’interviens dans toutes les Ardennes</h2></div>
  ${C.mapEmbed()}
</div></section>`;
  return { path: '/contact/', title: "Contact électricien Ardennes : téléphone, WhatsApp | ALED08", description: "Contactez ALED08, électricien dans les Ardennes : téléphone, WhatsApp, e-mail ou formulaire. Dépannage à tout moment, sur rendez-vous, dans tout le département.", crumbs, body, webpageType: 'ContactPage', priority: 0.8 };
}

// ====================================================================== BLOG
function blogIndex({ posts }) {
  const crumbs = [HOME, { name: 'Blog', path: '/blog/' }];
  const body = `${C.pageHero({
    kicker: 'Blog',
    h1: 'Le blog électricité d’ALED08',
    lead: "Des conseils concrets d'électricien pour **comprendre vos pannes, sécuriser votre logement et préparer vos travaux**, sans jargon et sans chercher à vous faire peur.",
    crumbs,
    compact: true,
  })}
<section class="section"><div class="container">
  <div class="grid grid-posts">${posts.map(T.postCard).join('')}</div>
</div></section>
${C.ctaBand({ title: 'Une question après votre lecture ?', text: 'Si un article vous a fait penser à votre propre installation, appelez-moi : je vous dirai honnêtement s’il faut intervenir.' })}`;
  return {
    path: '/blog/',
    title: 'Blog électricité : pannes, tableaux, sécurité, conseils | ALED08',
    description: "Conseils d'un électricien des Ardennes : trouver une panne, remplacer un tableau, différentiel ou disjoncteur, sécuriser son logement, prix d'un dépannage.",
    crumbs,
    body,
    schema: [{ '@type': 'Blog', name: 'Blog ALED08', url: site.url + '/blog/', blogPost: posts.map((a) => ({ '@type': 'BlogPosting', headline: a.h1, url: `${site.url}/blog/${a.slug}/`, datePublished: a.date })) }],
    changefreq: 'weekly',
    priority: 0.7,
  };
}

// ====================================================================== LÉGAL / PLAN / MERCI / 404
function legalPage(l) {
  const crumbs = [HOME, { name: l.name, path: l.path }];
  return {
    path: l.path,
    title: l.title,
    description: l.description,
    crumbs,
    body: `${C.pageHero({ kicker: 'Informations légales', h1: l.name, lead: l.lead, crumbs, compact: true })}
<section class="section"><div class="container container-narrow prose legal">${md(l.body)}<p class="small muted">Dernière mise à jour : ${T.frDate(l.updated)}.</p></div></section>`,
    priority: 0.2,
    changefreq: 'yearly',
  };
}

function planDuSite({ seoPages, posts }) {
  const crumbs = [HOME, { name: 'Plan du site', path: '/plan-du-site/' }];
  const grp = (title, items) => `<section><h2>${title}</h2><ul>${items.map(([p, l]) => `<li><a href="${p}">${esc(l)}</a></li>`).join('')}</ul></section>`;
  const sp = (g) => seoPages.filter((p) => p.group === g).map((p) => [`/${p.slug}/`, p.label]);
  const body = `${C.pageHero({ kicker: 'Navigation', h1: 'Plan du site', lead: "L'ensemble des pages du site ALED08.", crumbs, compact: true })}
<section class="section"><div class="container sitemap-cols">
  ${grp('Pages principales', [['/', 'Accueil'], ['/qui-suis-je/', 'Qui suis-je ?'], ['/prestations/', 'Prestations'], ['/tarifs/', 'Tarifs'], ['/zone-intervention/', 'Zone d’intervention'], ['/realisations/', 'Réalisations'], ['/faq/', 'FAQ'], ['/devis/', 'Demande de devis'], ['/contact/', 'Contact'], ['/blog/', 'Blog']])}
  ${grp('Prestations', services.map((s) => [s.path, s.label]))}
  ${grp('Électricien par commune', sp('villes'))}
  ${grp('Secteurs', sp('secteurs'))}
  ${grp('Services dans les Ardennes', [...sp('ardennes'), ...sp('services-villes')])}
  ${grp('Pannes et symptômes', sp('symptomes'))}
  ${grp('Travaux spécifiques', sp('services'))}
  ${grp('Situations particulières', sp('contextes'))}
  ${grp('Blog', posts.map((a) => [`/blog/${a.slug}/`, a.h1]))}
  ${grp('Informations légales', [['/mentions-legales/', 'Mentions légales'], ['/politique-de-confidentialite/', 'Politique de confidentialité'], ['/conditions-generales/', 'Conditions générales']])}
</div></section>`;
  return { path: '/plan-du-site/', title: 'Plan du site | ALED08 électricien Ardennes', description: "Plan du site ALED08 : prestations, tarifs, zone d'intervention, pages par commune, blog et informations légales.", crumbs, body, priority: 0.3 };
}

function merci() {
  const crumbs = [HOME, { name: 'Message envoyé', path: '/merci/' }];
  const body = `${C.pageHero({ kicker: 'Message envoyé', h1: 'Merci, votre demande est bien partie !', lead: "Je vous recontacte rapidement, en général dans la journée. **Pour une panne en cours, n'hésitez pas à appeler directement.**", crumbs, compact: true })}
<section class="section"><div class="container container-narrow center">
  <div class="hero-ctas" style="justify-content:center">${C.btnCall('btn-primary btn-lg')}${C.btnWa('btn-wa btn-lg', 'Envoyer des photos', 'Bonjour, je viens d’envoyer une demande sur le site, voici des photos.')}</div>
  <p style="margin-top:32px">En attendant, vous pouvez consulter <a href="/tarifs/">mes tarifs</a> ou <a href="/blog/">les conseils du blog</a>.</p>
</div></section>`;
  return { path: '/merci/', title: 'Demande envoyée | ALED08', description: 'Votre demande a bien été envoyée à ALED08.', crumbs, body, noindex: true };
}

function notFound() {
  const body = `${C.pageHero({ kicker: 'Erreur 404', h1: 'Cette page a fait court-circuit', lead: "La page demandée n'existe pas ou a été déplacée. Pas de panique : le reste du site fonctionne parfaitement.", compact: true })}
<section class="section"><div class="container">
  <div class="section-head"><h2>Vous cherchiez peut-être…</h2></div>
  ${C.serviceCards(mainServices)}
  <p class="center" style="margin-top:28px"><a class="btn btn-primary" href="/">${icon('house')}<span>Retour à l’accueil</span></a></p>
</div></section>`;
  return { path: '/404.html', file: '404.html', title: 'Page introuvable | ALED08', description: 'Page introuvable.', body, noindex: true };
}

function build(ctx) {
  return [
    home(ctx), about(), prestations(ctx), ...services.map(servicePage), tarifsPage(), zone(ctx), realisations(), faqFull(),
    devis(), contact(), blogIndex(ctx), ...legal.map(legalPage), planDuSite(ctx), merci(), notFound(),
  ];
}

module.exports = { build, registerAll };
