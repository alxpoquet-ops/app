// Pages du site
const { site, sections, types, forfaits, annuel, lissage, options, fidelite, paiement, shopify, pageEnPlus } = require('../config');
const base = forfaits[0];
const { icon } = require('../lib/icons');
const { monster } = require('../lib/monsters');
const { md, inline, esc } = require('../lib/md');
const C = require('../lib/components');
const FAQ = require('../content/faq');
const legal = require('../content/legal');
const OUTILS = require('../content/outils');

const HOME = { name: 'Accueil', path: '/' };
const crumb = (k) => [HOME, { name: sections[k].label, path: sections[k].path }];
const euro = C.euro;
const F = (id) => forfaits.find((f) => f.id === id);
const T = (id) => types.find((t) => t.id === id);

// ====================================================================== ACCUEIL
function home() {
  const pillars = [
    ['zap', 'Technique', 'Rapide, sécurisé, parfait sur téléphone.'],
    ['map-pin', 'Local', 'Fiche Google, avis, pages pour vos villes.'],
    ['pen-tool', 'Contenus', 'Des textes utiles, écrits pour vos clients.'],
    ['chart-line', 'Suivi', 'Positions et visites, chaque mois.'],
  ];
  const body = `<section class="hero">
  <div class="container hero-in">
    <div class="hero-text">
      <p class="kicker">${icon('sparkles')}Sites internet, SEO et IA</p>
      <h1>Votre site internet à partir de ${euro(T('une-page').price)}, <mark>tout compris</mark></h1>
      <p class="hero-lead">Je crée votre site à prix fixe, puis je m’en occupe pour ${euro(base.month)} par mois : hébergement, nom de domaine, sauvegardes, mises à jour et une modification par mois. Le prix du site peut aussi être lissé sur 2 ans.</p>
      <div class="hero-ctas">${C.btnCreer('btn-primary btn-lg')}${C.btn('/forfaits/', 'btn-light btn-lg', 'heart', 'Voir les forfaits')}</div>
      <ul class="hero-points">
        <li>${icon('check')}Prix de création fixe</li>
        <li>${icon('check')}Dès ${euro(base.month)} par mois</li>
        <li>${icon('check')}Sans engagement</li>
      </ul>
    </div>
    <div class="hero-art">
      ${monster('mascotte', { cls: 'hero-mascotte' })}
      <p class="hero-tag">${icon('sparkles')}Créé avec l’IA, vérifié par moi</p>
    </div>
  </div>
</section>

<section class="section"><div class="container">
  <h2 class="section-title">Quel site vous faut-il ?</h2>
  <p class="section-sub">Un prix de création fixe, et votre site est en ligne en quelques jours.</p>
  ${C.typeCards()}
</div></section>

<section class="section section-soft c-mint"><div class="container split split-rev">
  ${C.statsCard()}
  <div class="reveal">
    <p class="kicker c-mint">${icon('search-check')}Référencement</p>
    <h2>Le SEO, je maîtrise</h2>
    <p>Être joli ne suffit pas : votre site doit sortir quand vos clients cherchent. Le référencement, c’est ma spécialité. Chaque site est construit pour Google dès le départ, puis je le suis mois après mois.</p>
    <ul class="pillars">${pillars.map(([ic, t, d]) => `<li>${icon(ic)}<span><strong>${t}</strong><small>${d}</small></span></li>`).join('')}</ul>
    <p>${C.btn('/referencement-seo/', 'btn-light', 'search-check', 'Ma méthode SEO')}</p>
  </div>
</div></section>

<section class="section"><div class="container">
  <h2 class="section-title">Choisissez votre petit monstre</h2>
  <p class="section-sub">Deux forfaits simples, au mois ou à l’année avec deux mois offerts.</p>
  ${C.forfaitMinis()}
  <p class="center more">${C.btn('/forfaits/', 'btn-light', 'arrow-right', 'Comparer les forfaits')}</p>
</div></section>

<section class="section section-soft c-sky"><div class="container split">
  <div class="reveal">
    <p class="kicker c-sky">${icon('toolbox')}Nos outils</p>
    <h2>Vous demandez, je m’en occupe</h2>
    <p>Une modification ? Envoyez votre demande depuis votre espace client, avec une photo si besoin. Je la fais de mon côté et je vous préviens quand c’est en ligne. Vous n’avez rien de technique à gérer.</p>
    <div class="hero-ctas">${C.btn('/nos-outils/', 'btn-primary', 'toolbox', 'Découvrir nos outils')}${C.btn('/mon-espace/', 'btn-light', 'circle-user', 'Essayer la démo')}</div>
  </div>
  ${C.phoneEdit()}
</div></section>

<section class="section"><div class="container duo">
  <a class="promo c-pink reveal" href="/fidelite/">
    <span class="promo-ico">${icon('gift')}</span>
    <span class="promo-text"><strong>Un mois offert en parrainant</strong><span>Pour vous et pour la personne que vous recommandez.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
  <a class="promo c-butter reveal" href="/comparatif-shopify/">
    <span class="promo-ico">${icon('store')}</span>
    <span class="promo-text"><strong>Moins cher que Shopify chaque mois</strong><span>Une boutique entretenue pour ${euro(base.month)} par mois, contre ${euro(shopify.basicMensuel)} pour Shopify Basic seul.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
</div></section>

${C.ctaBand()}`;
  return {
    path: '/',
    title: 'Création de site internet à partir de 100 €, tout compris | ALED08',
    description: 'Votre site internet à prix fixe dès 100 €, entretenu pour 10 € par mois. Je gère vos modifications et votre SEO, et nos outils vous laissent la main.',
    crumbs: [HOME],
    body,
    priority: 1,
    changefreq: 'weekly',
  };
}

// ====================================================================== CRÉER MON SITE
function creerPage() {
  const crumbs = crumb('creer');
  const f = C.faq(FAQ.creation, 'Vos questions sur la création', 'faq-creation');
  const body = `${C.pageHero({
    section: 'creer',
    h1: 'Créez votre site en deux minutes',
    lead: 'Choisissez votre site, votre nom de domaine et votre forfait. Rien à payer maintenant : je vous réponds avec un récapitulatif à valider.',
    crumbs,
  })}
<section class="section section-builder"><div class="container">${C.configurator()}</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Et ensuite ?</h2>
  ${C.steps([
    { t: 'Je vous réponds', d: 'Rapidement, en général dans la journée, avec le récapitulatif et les questions utiles pour démarrer.' },
    { t: 'Vous validez', d: `Vous réglez ${paiement.acompte} % de la création et je réserve votre nom de domaine.` },
    { t: 'Je crée votre site', d: 'Vous voyez l’aperçu et vous demandez les changements.' },
    { t: 'C’est en ligne', d: 'Vous réglez le reste de la création et votre forfait démarre.' },
  ])}
</div></section>

${f.html}`;
  return {
    path: '/creer-mon-site/',
    section: 'creer',
    bodyClass: 'page-creer',
    noMobileBar: true,
    title: 'Créer mon site : prix, nom de domaine et forfait | ALED08',
    description: 'Choisissez votre type de site, vérifiez votre nom de domaine, prenez le forfait Chico ou Power et vos options. Récapitulatif gratuit, sans engagement.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== FORFAITS
function forfaitsPage() {
  const crumbs = crumb('forfaits');
  const f = C.faq(FAQ.forfaits, 'Vos questions sur les forfaits', 'faq-forfaits');
  const body = `${C.pageHero({
    section: 'forfaits',
    h1: 'Les forfaits : choisissez votre monstre',
    lead: 'Deux forfaits, pas plus. Chico garde votre site en ligne et à jour. Power ajoute le SEO, un rapport chaque mois et une modification par semaine.',
    crumbs,
  })}
<section class="section"><div class="container" data-billing-scope>
  ${C.billingSwitch()}
  ${C.forfaitCards()}
  ${C.payBox()}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">La création, à prix fixe</h2>
  <p class="section-sub">En une fois, avec un acompte de ${paiement.acompte} % au départ, ou lissée sur 2 ans.</p>
  <div class="create-prices">${types
    .map(
      (t) => `<a class="create-price c-${t.color} reveal" href="${C.creerUrl({ type: t.id })}">
      <span class="type-ico">${icon(t.icon)}</span>
      <strong>${esc(t.label)}</strong>
      <b>${euro(t.price)}</b>
      <small>${icon('timer')}${esc(t.delai)}</small>
      <ul>${t.inclus.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>
    </a>`
    )
    .join('')}</div>
  <p class="center small muted">Une page en plus : ${euro(pageEnPlus)}. Un projet plus grand ? Je vous fais un devis.</p>
</div></section>

<section class="section" id="options"><div class="container">
  <h2 class="section-title">Les options</h2>
  <p class="section-sub">À ajouter quand vous voulez, depuis votre espace client ou par message.</p>
  ${C.optionsCompact()}
</div></section>

<section class="section section-soft"><div class="container duo">
  <a class="promo c-butter reveal" href="/comparatif-shopify/">
    <span class="promo-ico">${icon('store')}</span>
    <span class="promo-text"><strong>Et par rapport à Shopify ?</strong><span>Le détail des prix, ligne par ligne.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
  <a class="promo c-pink reveal" href="/fidelite/">
    <span class="promo-ico">${icon('gift')}</span>
    <span class="promo-text"><strong>Un mois offert en parrainant</strong><span>Pour vous et pour la personne que vous recommandez.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
</div></section>

${f.html}
${C.ctaBand({ title: 'Votre monstre est choisi ?', text: 'Composez votre site en deux minutes. Rien à payer maintenant.' })}`;
  return {
    path: '/forfaits/',
    section: 'forfaits',
    title: 'Forfaits site internet Chico et Power, dès 5 € par mois | ALED08',
    description: 'Chico à 5 € par mois : hébergement, domaine, sauvegardes, une modification. Power à 20 € : SEO, rapport mensuel, une modification par semaine.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== NOS OUTILS
function outilsPage() {
  const crumbs = crumb('espace');
  const f = C.faq(FAQ.espace, 'Vos questions sur l’espace client', 'faq-outils');
  const body = `${C.pageHero({
    section: 'espace',
    h1: 'Nos outils : vous demandez, je m’en occupe',
    lead: 'Depuis votre espace client, vous m’envoyez vos demandes de modification. Je les fais de mon côté, vous n’avez rien de technique à gérer. Et les outils de l’espace sont gratuits pour les sites hébergés chez moi.',
    crumbs,
  })}
${site.espaceClient.ouvert ? '' : `<div class="container"><p class="notice reveal">${icon('hourglass')}<span>L’espace client ouvre bientôt. D’ici là, envoyez-moi vos demandes par message ou par WhatsApp : je m’en occupe de la même façon.</span></p></div>`}
<div class="container center demo-cta">${C.btn('/mon-espace/', 'btn-primary btn-lg', 'circle-user', 'Essayer la démo')}</div>

<section class="section"><div class="container split">
  <div class="reveal">
    <p class="kicker c-mint">${icon('message-circle')}Demande de modification</p>
    <h2>Une demande, et c’est fait</h2>
    <p>Un horaire, un prix, une photo, une nouvelle page ? Écrivez-le dans votre espace, avec une photo si besoin. Je fais la modification, je vérifie que tout s’affiche bien, et je vous préviens quand c’est en ligne.</p>
    <ul class="list-check">
      <li>Vous suivez chaque demande : reçue, en cours, faite</li>
      <li>Chaque version du site est gardée</li>
      <li>Chico : une modification par mois. Power : une par semaine.</li>
    </ul>
  </div>
  ${C.phoneEdit(true)}
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Dans votre espace client</h2>
  <p class="section-sub">Gratuit pour les sites hébergés chez moi.</p>
  <div class="tools">${OUTILS.map(
    (t) => `<a class="tool c-${t.color} reveal" href="/mon-espace/?outil=${t.demo}"><span class="tool-ico">${icon(t.icon)}</span><span class="tool-body"><strong>${t.name}</strong><span>${t.desc}</span></span><span class="tool-tag c-mint">Gratuit</span></a>`
  ).join('')}</div>
</div></section>

${f.html}
${C.ctaBand({ title: 'Prêt à vous libérer du technique ?', text: 'Créez votre site : vous m’envoyez vos demandes, je m’occupe du reste.' })}`;
  return {
    path: '/nos-outils/',
    section: 'espace',
    title: 'Nos outils : vos demandes de modification, gérées par moi | ALED08',
    description: 'Envoyez vos demandes de modification depuis votre espace client, je m’en occupe. Tableau de bord, QR code et lien d’avis gratuits pour les sites hébergés chez moi.',
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
  const levels = [
    ['chico', 'Les bases', ['Site rapide, sécurisé et adapté au téléphone', 'Titres, descriptions et données lues par Google', 'Google Search Console et suivi']],
    ['power', 'Le suivi', ['Tout Chico', 'SEO suivi chaque mois', 'Un rapport de visibilité mensuel']],
  ];
  const body = `${C.pageHero({
    section: 'seo',
    h1: 'Référencement SEO : être trouvé sur Google',
    lead: 'Un site que personne ne trouve ne sert à rien. Le SEO, c’est mon terrain : chaque site part avec des bases solides, et je le suis dans le temps.',
    crumbs,
  })}
<section class="section"><div class="container">
  <h2 class="section-title">Ce que je fais pour votre visibilité</h2>
  <div class="feats feats-4">
    <div class="feat reveal">${icon('zap')}<h3>Les bases techniques</h3><p>Un site rapide, sécurisé, parfait sur téléphone, avec les balises et les données que Google sait lire.</p></div>
    <div class="feat reveal">${icon('map-pin')}<h3>Le référencement local</h3><p>Fiche Google, pages pour vos villes, avis clients : pour sortir quand on cherche près de chez vous.</p></div>
    <div class="feat reveal">${icon('pen-tool')}<h3>Des contenus utiles</h3><p>Articles et pages qui répondent aux vraies questions de vos clients, préparés avec l’IA et relus par moi.</p></div>
    <div class="feat reveal">${icon('chart-line')}<h3>Le suivi</h3><p>Positions, recherches, visites : je regarde ce qui marche et j’ajuste, mois après mois.</p></div>
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
  <h2 class="section-title">Le SEO dans chaque forfait</h2>
  <div class="seo-levels">${levels
    .map(
      ([id, t, list]) => `<div class="seo-level c-${F(id).color} reveal"><span class="seo-art">${monster(id)}</span><p class="seo-name">${F(id).name}<small>${t}</small></p><ul class="list-check">${list.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>`
    )
    .join('')}</div>
</div></section>

<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Ce que je ne promets pas

Personne ne peut garantir la première place sur Google. Méfiez-vous de ceux qui le font.

Les premiers résultats arrivent en général en quelques semaines, parfois quelques mois pour les recherches les plus disputées.

Je ne publie pas des centaines de pages vides pour gonfler votre site : Google les repère et les pénalise. Je préfère peu de contenus, mais vraiment utiles à vos clients.`)}
</div></section>

${f.html}
${C.ctaBand({ title: 'Être trouvé, ça commence ici', text: 'Créez votre site avec un forfait qui suit votre référencement.', mascot: 'chico' })}`;
  return {
    path: '/referencement-seo/',
    section: 'seo',
    title: 'Référencement SEO : être trouvé sur Google | ALED08',
    description: 'Bases techniques, référencement local, contenus utiles et suivi chaque mois : comment je rends votre site visible sur Google, sans fausses promesses.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.8,
  };
}

// ====================================================================== COMPARATIF SHOPIFY
function shopifyPage() {
  const crumbs = crumb('shopify');
  const f = C.faq(FAQ.shopify, 'Vos questions', 'faq-shopify');
  const b = T('boutique');
  const shopYear = shopify.basicAnnuel * 12;
  const meYear = C.year(base.month);
  const body = `${C.pageHero({
    section: 'shopify',
    h1: 'Shopify ou ALED08 : le vrai prix d’une petite boutique',
    lead: 'Shopify est un très bon outil, si vous avez le temps de construire et de gérer votre boutique vous-même. Voici la différence, chiffres à l’appui.',
    crumbs,
  })}
<section class="section"><div class="container">
  ${C.shopifyTable()}
  <p class="source">Prix publics de Shopify pour la France relevés en ${shopify.releve}, forfait Basic. Les prix peuvent changer : vérifiez-les sur <a href="${shopify.source}" rel="noopener" target="_blank">la page tarifs de Shopify</a>.</p>
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Sur un an, pour une boutique de 20 produits</h2>
  <div class="years">
    <div class="year-card reveal">
      <p class="year-who">Shopify Basic, payé à l’année</p>
      <p class="year-big">${euro(shopYear)}</p>
      <ul class="list-dot"><li>Abonnement : ${euro(shopify.basicAnnuel)} × 12 mois</li><li>Nom de domaine en plus</li><li>Applications payantes selon vos besoins</li><li>Et le temps de tout construire vous-même</li></ul>
    </div>
    <div class="year-card is-me reveal">
      <p class="year-who">${monster('chico')}ALED08, forfait Chico à l’année</p>
      <p class="year-big">${euro(b.price + meYear)}<small>la première année</small></p>
      <ul class="list-check"><li>Création : ${euro(b.price)}, une fois</li><li>Forfait Chico : ${euro(meYear)} (${annuel.moisOfferts} mois offerts)</li><li>Nom de domaine, mises à jour et bases du SEO compris</li></ul>
      <p class="year-after">Puis ${euro(meYear)} par an.</p>
    </div>
  </div>
  <p class="center years-note">La première année, vous payez la création. Ensuite, ${euro(meYear)} par an au lieu de ${euro(shopYear)}, et c’est moi qui m’occupe de tout. Power reste en option.</p>
</div></section>

<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Quand choisir Shopify ?

Si vous avez des centaines de produits, vendez dans plusieurs pays ou voulez tout gérer vous-même, Shopify est un excellent choix. Je vous le dirai franchement.

## Quand choisir ALED08 ?

Si vous voulez une boutique simple et jolie, trouvée sur Google, avec quelqu’un qui s’en occupe pour vous et un prix fixe chaque mois.`)}
</div></section>

${f.html}
${C.ctaBand({ title: 'On regarde votre projet ?', text: 'Composez votre boutique en deux minutes, ou posez-moi vos questions sur WhatsApp.' })}`;
  return {
    path: '/comparatif-shopify/',
    section: 'shopify',
    title: 'Shopify ou boutique sur mesure : le vrai prix | ALED08',
    description: 'Shopify Basic comparé à une boutique ALED08 : abonnement, création, nom de domaine, SEO et frais de paiement. Les chiffres sur un an, expliqués simplement.',
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
    ['pink', 'users', 'Parrainage', `${fidelite.parrainageMois} mois offert pour vous deux`, 'Un proche fait créer son site grâce à vous : quand il est en ligne, vous recevez chacun un mois de forfait offert.'],
    ['butter', 'badge-percent', 'Deuxième site', `${fidelite.remiseSecondSite} % sur la création`, 'Un deuxième site, une boutique en plus ? La création vous coûte moins cher.'],
    ['mint', 'calendar-check', 'À l’année', `${annuel.moisOfferts} mois offerts`, 'En payant à l’année, d’un coup, vous ne payez que dix mois sur douze.'],
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
    { t: 'Parlez de moi', d: 'Donnez mon contact ou le lien du site à quelqu’un qui a un projet.' },
    { t: 'Il donne votre nom', d: 'Votre filleul indique votre nom dans sa demande.' },
    { t: 'Un mois offert chacun', d: 'Dès que son site est en ligne, vous recevez tous les deux un mois de forfait.' },
  ])}
</div></section>

${f.html}
${C.ctaBand({ title: 'Quelqu’un a un projet autour de vous ?', text: 'Envoyez-lui le lien du site. Vous y gagnez tous les deux.' })}`;
  return {
    path: '/fidelite/',
    section: 'fidelite',
    title: 'Fidélité et parrainage : un mois de forfait offert | ALED08',
    description: 'Parrainez un proche : vous recevez chacun un mois de forfait offert. 10 % de remise sur la création d’un deuxième site, et 2 mois offerts à l’année.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.5,
  };
}

// ====================================================================== MA MÉTHODE
function methodePage() {
  const crumbs = crumb('methode');
  const f = C.faq(FAQ.methode, 'Vos questions sur l’IA', 'faq-ia');
  const body = `${C.pageHero({
    section: 'methode',
    h1: 'Ma méthode : l’IA pour aller vite, moi pour vérifier',
    lead: 'Je suis passionné d’intelligence artificielle. Je teste les nouveaux outils dès leur sortie et je m’en sers pour créer plus vite. Voici comment je travaille, sans rien cacher.',
    crumbs,
  })}
<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Pourquoi mes prix sont plus bas

Un site vitrine demande d’habitude de longues heures de travail : mise en page, code, textes, tests. Avec l’IA, une bonne partie de ce travail va beaucoup plus vite. Je passe moins d’heures sur votre projet, donc je peux vous le facturer moins cher.

Le résultat, lui, reste du travail soigné : un site rapide, adapté au téléphone, sécurisé et prêt pour Google.`)}
</div></section>

<section class="section section-soft"><div class="container">
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
    <div class="compare-col is-me reveal">
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

Pour un site vitrine ou une petite boutique, je suis rapide et efficace. En revanche, je ne remplace pas un développeur expérimenté sur un projet complexe : une application sur mesure, un logiciel métier, un site avec des milliers de produits, un service qui demande une sécurité renforcée.

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
    description: 'Comment je crée des sites avec l’IA : ce que fait l’IA, ce que je fais moi-même, pourquoi c’est moins cher, et mes limites, dites honnêtement.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.6,
  };
}

// ====================================================================== MON ESPACE (démonstration)
// Un faux QR code dessiné (illustration de l'outil).
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
  const P = forfaits[1];
  const mail = options.find((o) => o.id === 'mail');
  const tab = (id, ic, label, on) => `<button type="button" role="tab" id="tab-${id}" aria-controls="t-${id}" aria-selected="${on ? 'true' : 'false'}"${on ? '' : ' tabindex="-1"'} data-tab="${id}">${icon(ic)}<span>${label}</span></button>`;
  const plans = forfaits.map((x) => ({ ...x, quota: x.id === 'power' ? 4 : 1 }));
  const total = P.month + mail.price.month;
  const body = `${C.pageHero({
    section: 'monespace',
    h1: 'Mon espace : la démo',
    lead: 'Voici l’espace de « Pâtisserie Lila », une cliente imaginaire. Essayez : envoyez une demande de modification, suivez-la, créez un QR code, changez de forfait. Rien n’est envoyé.',
    crumbs: [HOME, { name: 'Nos outils', path: '/nos-outils/' }, { name: 'Démo', path: '/mon-espace/' }],
  })}
<section class="section section-app"><div class="container">
  <div class="app" data-app>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user">${monster('mascotte')}<div><strong>Pâtisserie Lila</strong><small>patisserie-lila.fr</small></div></div>
        <div class="jauge" data-jauge>
          <p class="jauge-head">${icon('pencil')}<span>Modifications du mois</span><b><span data-jetons>3</span> / <span data-jetons-max>4</span></b></p>
          <span class="jauge-bar"><i data-jauge-fill style="width:75%"></i></span>
        </div>
        <div class="app-tabs" role="tablist" aria-label="Mon espace">
          ${tab('accueil', 'house', 'Accueil', true)}
          ${tab('demandes', 'message-circle', 'Mes demandes')}
          ${tab('visibilite', 'chart-line', 'Tableau de bord')}
          ${tab('outils', 'qr-code', 'QR code et avis')}
          ${tab('forfait', 'heart', 'Forfait et factures')}
        </div>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bonjour Lila !</h2>
          <div class="app-cards">
            <button type="button" class="app-card c-lilac" data-go="forfait"><span class="app-card-art" data-app-plan-art>${monster('power')}</span><span><small>Votre forfait</small><strong data-app-plan-name>${P.name}</strong><span data-app-plan-price>${euro(P.month)} par mois</span></span></button>
            <div class="app-card c-mint"><span class="app-card-ico">${icon('globe')}</span><span><small>Votre site</small><strong>patisserie-lila.fr</strong><span class="dot-ok">En ligne</span></span></div>
            <button type="button" class="app-card c-sky" data-go="visibilite"><span class="app-card-ico">${icon('chart-line')}</span><span><small>Ce mois-ci</small><strong>1 240 visites</strong><span>+18 % sur un mois</span></span></button>
          </div>
          <p class="app-sub">Que voulez-vous faire ?</p>
          <div class="app-actions">
            <button type="button" data-go="demandes">${icon('message-circle')}<strong>Demander une modification</strong><small>Je m’en occupe</small></button>
            <button type="button" data-go="outils">${icon('qr-code')}<strong>QR code et lien d’avis</strong><small>Prêts à partager</small></button>
            <button type="button" data-go="forfait">${icon('receipt')}<strong>Forfait et factures</strong><small>Tout au même endroit</small></button>
          </div>
          <p class="app-sub">Dernières activités</p>
          <ul class="app-log" data-log>
            <li>${icon('check')}<span>Horaires d’été mis à jour</span><small>il y a 2 jours</small></li>
            <li>${icon('file-text')}<span>Rapport de visibilité d’octobre</span><small>1er novembre</small></li>
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
          <div class="kpis">
            <div><b>1 240</b><small>visites ce mois-ci</small></div>
            <div><b>3 420</b><small>apparitions sur Google</small></div>
            <div><b>23</b><small>appels depuis le site</small></div>
            <div><b>41</b><small>itinéraires demandés</small></div>
          </div>
          <div class="stats-bars big" aria-hidden="true">${[30, 42, 38, 55, 49, 66, 61, 78].map((h) => `<i style="height:${h}%"></i>`).join('')}</div>
          <p class="app-sub">Vos meilleures recherches sur Google</p>
          <ul class="ranks">
            <li><span>tarte aux fraises rethel</span><b>2<sup>e</sup></b></li>
            <li><span>pâtisserie rethel</span><b>4<sup>e</sup></b></li>
            <li><span>gâteau d’anniversaire ardennes</span><b>9<sup>e</sup></b></li>
          </ul>
          <button type="button" class="btn btn-light" data-toast-msg="Rapport téléchargé (démo)">${icon('download')}<span>Rapport de novembre</span></button>
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
          <h2 class="app-h">Forfait et factures</h2>
          <div class="app-plans">${plans
            .map(
              (x) => `<label class="app-plan c-${x.color}"><input type="radio" name="app-plan" value="${x.id}" data-month="${x.month}" data-name="${x.name}" data-jetons="${x.quota}"${x.id === 'power' ? ' checked' : ''}><span class="app-plan-card"><span class="app-plan-art">${monster(x.id)}</span><strong>${x.name}</strong><small>${euro(x.month)}/mois</small><small>${x.modifs}</small></span></label>`
            )
            .join('')}</div>
          <p class="app-sub">Options</p>
          <div class="app-opts"><label class="app-opt"><span class="app-opt-ico">${icon(mail.icon)}</span><span class="app-opt-txt"><strong>${esc(mail.name)}</strong><small>${euro(mail.price.month)} par mois</small></span><input type="checkbox" role="switch" value="mail" data-month="${mail.price.month}" checked><span class="switch" aria-hidden="true"></span></label></div>
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
    <template data-monsters>${plans.map((x) => `<span data-m="${x.id}">${monster(x.id)}</span>`).join('')}</template>
  </div>
</div></section>

${C.ctaBand({ title: 'Ça vous plaît ?', text: 'Créez votre site : vous m’envoyez vos demandes, je m’occupe du reste.' })}`;
  return {
    path: '/mon-espace/',
    section: 'monespace',
    noindex: true,
    noMobileBar: true,
    title: 'Mon espace, la démo | ALED08',
    description: 'Essayez l’espace client ALED08 : demandes de modification et leur suivi, tableau de bord, QR code, lien d’avis, forfait et factures. Démonstration.',
    crumbs: [HOME, { name: 'Nos outils', path: '/nos-outils/' }, { name: 'Démo', path: '/mon-espace/' }],
    body,
  };
}

// ====================================================================== CONTACT
function formHidden() {
  return `<input type="hidden" name="_t" value=""><div class="hp" aria-hidden="true"><label>Site web <input type="text" name="site_web" tabindex="-1" autocomplete="off"></label></div>`;
}
function contactPage() {
  const crumbs = crumb('contact');
  const opt = (v) => `<option value="${esc(v)}">${esc(v)}</option>`;
  const body = `${C.pageHero({
    section: 'contact',
    h1: 'Contact et devis gratuit',
    lead: 'Une question, un projet ? Écrivez-moi. Je vous réponds rapidement, en général dans la journée.',
    crumbs,
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
        <div class="field"><label for="c-type">Votre site <span class="req">*</span></label>
          <select id="c-type" name="type" required><option value="">Choisir…</option>${types.map((t) => opt(t.label)).join('')}${opt('Je ne sais pas encore')}${opt('Autre projet')}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="c-forfait">Forfait</label>
          <select id="c-forfait" name="forfait">${forfaits.map((x) => opt(x.name)).join('')}<option value="Je ne sais pas encore" selected>Je ne sais pas encore</option></select></div>
        <div class="field"><label for="c-domaine">Nom de domaine <span class="opt">(facultatif)</span></label><input id="c-domaine" name="domaine" type="text" autocomplete="off" placeholder="mon-entreprise.fr"></div>
      </div>
      <div class="field"><span class="label">Paiement du forfait</span>
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
    <a class="contact-card wa" href="${C.waUrl()}" target="_blank" rel="noopener">${icon('whatsapp')}<div><strong>WhatsApp</strong><span>Le plus rapide pour échanger, même avec des photos.</span></div></a>
    <a class="contact-card" href="${C.tel}">${icon('phone')}<div><strong>${site.phoneDisplay}</strong><span>Appel ou SMS.</span></div></a>
    <a class="contact-card" href="mailto:${site.email}">${icon('mail')}<div><strong>${site.email}</strong><span>Pour envoyer des documents.</span></div></a>
    <a class="contact-card c-pink" href="/creer-mon-site/">${icon('wand-sparkles')}<div><strong>Créer mon site</strong><span>Composez votre site et voyez le prix tout de suite.</span></div></a>
    <p class="contact-note">${icon('map-pin')}<span>Basé dans les Ardennes, je travaille avec des clients partout en France, à distance ou en visio.</span></p>
  </aside>
</div></section>`;
  return {
    path: '/contact/',
    section: 'contact',
    title: 'Contact et devis gratuit pour votre site internet | ALED08',
    description: 'Une question, un projet de site, de boutique ou de référencement ? Écrivez-moi par le formulaire, WhatsApp ou e-mail. Réponse rapide, en général dans la journée.',
    crumbs,
    body,
    priority: 0.8,
  };
}

// ====================================================================== PAGE LOCALE
function ardennesPage() {
  const crumbs = [HOME, { name: 'Dans les Ardennes', path: '/creation-site-internet-ardennes/' }];
  const f = C.faq(
    [
      { q: 'Peut-on se rencontrer ?', a: 'Oui. Dans les Ardennes, on peut se voir autour d’un café ou dans vos locaux. Pour les autres départements, on se parle en visio.' },
      { q: 'Travaillez-vous avec les associations ?', a: `Oui, avec plaisir. Une page simple pour présenter l’association, ses dates et ses contacts, c’est souvent le site d’une page à ${euro(T('une-page').price)}.` },
      { q: 'Mon commerce sera-t-il sur Google Maps ?', a: 'C’est le rôle de votre fiche Google. Je peux la créer ou l’améliorer pour que vous apparaissiez sur la carte quand quelqu’un cherche près de chez vous.' },
    ],
    'Vos questions',
    'faq-ardennes'
  );
  const body = `${C.pageHero({
    h1: 'Création de site internet dans les Ardennes',
    lead: 'Artisans, commerçants, associations, indépendants des Ardennes : je crée votre site à prix fixe, et on peut se rencontrer pour en parler.',
    crumbs,
    mascot: 'chico',
  })}
<section class="section"><div class="container container-narrow prose reveal">
  ${md(`## Un interlocuteur près de chez vous

Je suis installé à ${site.address.city}. Que vous soyez à Charleville-Mézières, Sedan, Rethel, Rocroi, Vouziers ou dans un village du département, je peux venir vous voir pour comprendre votre activité et repartir avec vos idées.

## Ce que je propose

- **Site d’une page** : ${euro(T('une-page').price)} de création.
- **Site vitrine** : ${euro(T('vitrine').price)} de création, jusqu’à 5 pages.
- **Boutique en ligne** : ${euro(T('boutique').price)} de création.

Puis ${euro(base.month)} par mois pour l’hébergement, le nom de domaine et une modification par mois, ou ${euro(forfaits[1].month)} avec le SEO suivi. Le détail est sur la page [forfaits](/forfaits/).

## Être trouvé par les Ardennais

Quand quelqu’un cherche un commerce ou un artisan, Google lui montre d’abord les entreprises proches. Je soigne votre fiche Google et les pages de vos villes, pour que les clients du coin vous trouvent.`)}
</div></section>
${f.html}
${C.ctaBand({ title: 'Vous êtes dans les Ardennes ?', text: 'Écrivez-moi : on peut se voir pour parler de votre site.' })}`;
  return {
    path: '/creation-site-internet-ardennes/',
    title: 'Création de site internet dans les Ardennes | ALED08',
    description: 'Création de site internet pour les artisans, commerces et associations des Ardennes : prix fixe dès 100 €, rencontre possible, référencement local soigné.',
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
    ['La création', FAQ.creation, 'creer'],
    ['Les forfaits', FAQ.forfaits, 'forfaits'],
    ['Nos outils', FAQ.espace, 'espace'],
    ['Le référencement', FAQ.seo, 'seo'],
    ['Ma méthode', FAQ.methode, 'methode'],
    ['Shopify', FAQ.shopify, 'shopify'],
    ['La fidélité', FAQ.fidelite, 'fidelite'],
  ];
  const all = groups.flatMap((g) => g[1]);
  const body = `${C.pageHero({ h1: 'Questions fréquentes', lead: 'Les réponses aux questions qu’on me pose le plus souvent. Il en manque une ? Écrivez-moi.', crumbs })}
<section class="section"><div class="container container-narrow">
  ${groups
    .map(([t, items, k]) => `<div class="faq-group c-${sections[k].color}"><h2>${icon(sections[k].icon)}${t}</h2><div class="faq">${items.map(C.faqItem).join('')}</div></div>`)
    .join('')}
</div></section>
${C.ctaBand()}`;
  return {
    path: '/faq/',
    title: 'Questions fréquentes : création, forfaits, IA, SEO | ALED08',
    description: 'Toutes les réponses sur la création de votre site, les forfaits Chico et Power, nos outils, le référencement et le parrainage.',
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
  const links = [
    ['/', 'Accueil'],
    ...Object.values(sections).map((s) => [s.path, s.label]),
    ['/creation-site-internet-ardennes/', 'Création de site dans les Ardennes'],
    ['/faq/', 'Questions fréquentes'],
    ...legal.map((l) => [l.path, l.name]),
  ];
  return {
    path: '/plan-du-site/',
    title: 'Plan du site | ALED08 sites internet et SEO',
    description: 'Toutes les pages du site ALED08 : créer mon site, forfaits, espace client, SEO, comparatif Shopify, fidélité, contact, questions fréquentes et pages légales.',
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
    title: 'Demande envoyée | ALED08',
    description: 'Votre demande a bien été envoyée à ALED08. Je vous réponds rapidement, en général dans la journée, avec un récapitulatif clair.',
    body: `${C.pageHero({ h1: 'Merci, votre demande est bien partie !', lead: 'Je vous réponds rapidement, en général dans la journée. Si c’est pressé, écrivez-moi aussi sur WhatsApp.', mascot: 'mascotte' })}
<section class="section"><div class="container center"><div class="hero-ctas centered">${C.btnWa('btn-wa btn-lg')}${C.btn('/', 'btn-light btn-lg', 'arrow-right', 'Retour à l’accueil')}</div></div></section>`,
  };
}

function notFound() {
  return {
    path: '/404/',
    file: '404.html',
    noindex: true,
    title: 'Page introuvable | ALED08',
    description: 'Cette page n’existe pas ou a été déplacée. Retrouvez la création de site, les forfaits, l’espace client et le référencement depuis l’accueil.',
    body: `${C.pageHero({ h1: 'Oups, cette page s’est perdue', lead: 'Elle a peut-être été déplacée. Voici où aller :', mascot: 'triste' })}
<section class="section"><div class="container"><div class="go-links">${['creer', 'forfaits', 'espace', 'seo']
      .map((k) => `<a class="go-link c-${sections[k].color}" href="${sections[k].path}"><span class="type-ico">${icon(sections[k].icon)}</span><strong>${sections[k].label}</strong>${icon('arrow-right')}</a>`)
      .join('')}</div></div></section>`,
  };
}

function build() {
  return [
    home(), creerPage(), forfaitsPage(), outilsPage(), monEspacePage(), seoPage(), shopifyPage(), fidelitePage(), methodePage(), contactPage(), ardennesPage(), faqPage(),
    ...legal.map(legalPage), planDuSite(), merci(), notFound(),
  ];
}

module.exports = { build };
