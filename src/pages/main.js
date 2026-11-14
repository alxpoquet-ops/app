// Pages du site
const { site, sections, types, forfaits, annuel, options, fidelite, paiement, shopify, pageEnPlus } = require('../config');
const { icon } = require('../lib/icons');
const { monster } = require('../lib/monsters');
const { md, inline, esc } = require('../lib/md');
const C = require('../lib/components');
const FAQ = require('../content/faq');
const legal = require('../content/legal');

const HOME = { name: 'Accueil', path: '/' };
const crumb = (k) => [HOME, { name: sections[k].label, path: sections[k].path }];
const euro = C.euro;
const F = (id) => forfaits.find((f) => f.id === id);
const T = (id) => types.find((t) => t.id === id);
const boutiqueChico = F('chico').month + T('boutique').supplement;

// ====================================================================== ACCUEIL
function home() {
  const body = `<section class="hero">
  <div class="container hero-in">
    <div class="hero-text">
      <p class="kicker">${icon('sparkles')}Sites internet, SEO et IA</p>
      <h1>Votre site internet dès ${euro(T('une-page').price)}, <mark>pensé pour Google</mark></h1>
      <p class="hero-lead">Je crée votre site, je le mets en ligne et je m’occupe de son référencement. Ensuite, vous le modifiez quand vous voulez, en écrivant simplement à l’IA.</p>
      <div class="hero-ctas">${C.btnCreer('btn-primary btn-lg')}${C.btn('/forfaits/', 'btn-light btn-lg', 'heart', 'Voir les forfaits')}</div>
      <ul class="hero-points">
        <li>${icon('check')}Prix de création fixe</li>
        <li>${icon('check')}Forfait au mois, sans engagement</li>
        <li>${icon('check')}Nom de domaine inclus</li>
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

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Ensuite, choisissez votre petit monstre</h2>
  <p class="section-sub">Il garde votre site en ligne, à jour et bien placé sur Google.</p>
  ${C.forfaitMinis()}
  <p class="center more">${C.btn('/forfaits/', 'btn-light', 'arrow-right', 'Comparer les forfaits')}</p>
</div></section>

<section class="section"><div class="container split">
  <div class="reveal">
    <p class="kicker c-sky">${icon('smartphone')}Espace client</p>
    <h2>Votre site dans la poche</h2>
    <p>Depuis votre téléphone, écrivez ce que vous voulez changer : « ajoute nos horaires d’été », « change la photo de l’accueil ». L’IA prépare la modification, vous validez, c’est en ligne.</p>
    <p>Avec ${F('titan').name}, une photo et quelques mots suffisent pour publier sur Instagram, Facebook et votre fiche Google.</p>
    <p>${C.btn('/espace-client/', 'btn-light', 'smartphone', 'Découvrir l’espace client')}</p>
  </div>
  ${C.phoneEdit()}
</div></section>

<section class="section section-soft c-mint"><div class="container split split-rev">
  ${C.statsCard()}
  <div class="reveal">
    <p class="kicker c-mint">${icon('search-check')}Référencement</p>
    <h2>Le SEO, je maîtrise</h2>
    <p>Être joli ne suffit pas : votre site doit sortir quand vos clients cherchent. Chaque site part rapide, lisible sur téléphone et bien structuré pour Google. Ensuite, je suis vos résultats et j’ajoute des contenus utiles.</p>
    <ul class="list-check">
      <li>Fiche Google et référencement local</li>
      <li>Contenus optimisés chaque mois avec ${F('power').name} et ${F('titan').name}</li>
      <li>Un rapport clair, sans jargon</li>
    </ul>
    <p>${C.btn('/referencement-seo/', 'btn-light', 'search-check', 'Mon approche du SEO')}</p>
  </div>
</div></section>

<section class="section"><div class="container">
  <a class="promo c-butter reveal" href="/comparatif-shopify/">
    <span class="promo-ico">${icon('store')}</span>
    <span class="promo-text"><strong>Une boutique moins chère que Shopify chaque mois</strong><span>Avec ${F('chico').name} : ${euro(boutiqueChico)} par mois tout compris, après la création. Shopify Basic seul : ${euro(shopify.basicMensuel)} par mois.</span></span>
    <span class="promo-go">${icon('arrow-right')}</span>
  </a>
</div></section>

${C.ctaBand()}`;
  return {
    path: '/',
    title: 'Création de site internet dès 100 €, pensé pour Google | ALED08',
    description: 'Votre site internet à prix fixe dès 100 €, un forfait dès 15 €/mois avec hébergement et SEO, et un espace client pour le modifier avec l’IA. Devis gratuit.',
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
    description: 'Choisissez votre type de site, vérifiez votre nom de domaine, prenez un forfait Chico, Power ou Titan et vos options. Récapitulatif gratuit, sans engagement.',
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
    lead: 'Après la création, votre site a besoin d’un hébergement, de mises à jour et de référencement. Je m’en occupe. Vous choisissez jusqu’où.',
    crumbs,
  })}
<section class="section"><div class="container" data-billing-scope>
  ${C.billingSwitch()}
  ${C.forfaitCards()}
  <p class="plans-note">${icon('shopping-bag')}<span>Boutique en ligne : ${euro(T('boutique').supplement)} de plus par mois sur chaque forfait. Au mois, sans engagement. À l’année, ${annuel.moisOfferts} mois offerts.</span></p>
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">La création, à prix fixe</h2>
  <p class="section-sub">Payée une seule fois : un acompte de ${paiement.acompte} % au départ, le solde à la mise en ligne.</p>
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
    title: 'Forfaits site internet Chico, Power et Titan dès 15 €/mois | ALED08',
    description: 'Hébergement, nom de domaine, mises à jour et SEO dès 15 €/mois, modification par IA avec Power, publication sur les réseaux avec Titan. Sans engagement.',
    crumbs,
    body,
    schema: [f.schema],
    priority: 0.9,
  };
}

// ====================================================================== ESPACE CLIENT
function espacePage() {
  const crumbs = crumb('espace');
  const f = C.faq(FAQ.espace, 'Vos questions sur l’espace client', 'faq-espace');
  const tag = (id) => `<span class="tag c-${F(id).color}">${F(id).name}</span>`;
  const body = `${C.pageHero({
    section: 'espace',
    h1: 'Votre espace client : votre site dans la poche',
    lead: 'Vous modifiez votre site en écrivant ce que vous voulez, vous publiez sur vos réseaux et vous suivez vos visites. Depuis votre téléphone.',
    crumbs,
  })}
${site.espaceClient.ouvert ? '' : `<div class="container"><p class="notice reveal">${icon('hourglass')}<span>L’espace client ouvre bientôt. D’ici là, envoyez-moi vos demandes par message : je les traite avec les mêmes outils, au même prix.</span></p></div>`}
<section class="section"><div class="container features">
  <div class="feature">
    <div class="feature-text reveal">
      <p class="tags">${tag('power')}${tag('titan')}</p>
      <h2>Modifier votre site en écrivant</h2>
      <p>« Ajoute nos horaires d’été », « change la photo de l’accueil », « mets la tarte du jour en avant » : vous l’écrivez comme à un ami. L’IA prépare le changement et vous montre l’aperçu.</p>
      <ul class="list-check">
        <li>Vous validez avant la mise en ligne</li>
        <li>Chaque version est gardée : un clic pour revenir en arrière</li>
        <li>Textes, photos, horaires, prix, nouvelles sections</li>
      </ul>
    </div>
    ${C.phoneEdit()}
  </div>
  <div class="feature feature-rev">
    <div class="feature-text reveal">
      <p class="tags">${tag('titan')}</p>
      <h2>Publier sur vos réseaux</h2>
      <p>Ajoutez une photo et quelques mots. L’IA écrit un texte adapté à chaque réseau, recadre l’image au bon format et publie sur Instagram, Facebook et votre fiche Google.</p>
      <ul class="list-check">
        <li>Vous relisez avant, ou vous laissez faire</li>
        <li>Publication tout de suite ou programmée</li>
        <li>Vos comptes restent les vôtres</li>
      </ul>
    </div>
    ${C.phoneSocial()}
  </div>
  <div class="feature">
    <div class="feature-text reveal">
      <p class="tags"><span class="tag c-mint">Tous les forfaits</span></p>
      <h2>Suivre votre visibilité</h2>
      <p>Visites, recherches Google qui vous amènent, appels depuis le site : l’essentiel en un coup d’œil. Avec ${F('power').name} et ${F('titan').name}, un rapport chaque mois, sans jargon.</p>
    </div>
    ${C.statsCard()}
  </div>
</div></section>

<section class="section section-soft"><div class="container">
  <h2 class="section-title">Tout gérer au même endroit</h2>
  <div class="feats">
    <div class="feat reveal">${icon('toggle-right')}<h3>Ajouter une option</h3><p>Réservation, e-mail pro, fiche Google : en un clic, quand vous en avez besoin.</p></div>
    <div class="feat reveal">${icon('refresh-cw')}<h3>Changer de forfait</h3><p>Passez de ${F('chico').name} à ${F('power').name} le temps d’une saison, puis revenez.</p></div>
    <div class="feat reveal">${icon('receipt')}<h3>Vos factures</h3><p>Toutes au même endroit, prêtes à télécharger pour votre comptable.</p></div>
    <div class="feat reveal">${icon('globe')}<h3>Votre nom de domaine</h3><p>À votre nom, renouvelé chaque année sans que vous ayez à y penser.</p></div>
  </div>
</div></section>

<section class="section"><div class="container container-narrow">
  <div class="trust reveal">
    <h2>${icon('lock')}Et la sécurité ?</h2>
    <ul class="list-check">
      <li>L’IA ne touche qu’au contenu de votre site : textes, images, horaires. Jamais au reste.</li>
      <li>Rien n’est publié sans votre accord.</li>
      <li>Chaque version est sauvegardée.</li>
      <li>Vous retirez l’accès à vos réseaux quand vous voulez.</li>
    </ul>
  </div>
</div></section>

${f.html}
${C.ctaBand({ title: 'Envie d’essayer ?', text: 'Créez votre site, choisissez Power ou Titan, et pilotez-le depuis votre téléphone.' })}`;
  return {
    path: '/espace-client/',
    section: 'espace',
    title: 'Espace client : modifiez votre site avec l’IA | ALED08',
    description: 'Modifiez votre site en écrivant à l’IA, publiez sur Instagram, Facebook et Google en un geste, suivez vos visites : tout depuis votre téléphone.',
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
    ['power', 'Le suivi', ['Tout Chico', '2 contenus optimisés chaque mois', 'Un rapport de visibilité mensuel']],
    ['titan', 'Le renfort', ['Tout Power', 'Jusqu’à 10 contenus optimisés par mois', 'Fiche Google suivie et avis']],
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
  const meYear = C.year(boutiqueChico);
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
      <p class="year-who">${monster('chico')}ALED08, forfait ${F('chico').name} à l’année</p>
      <p class="year-big">${euro(b.price + meYear)}<small>la première année</small></p>
      <ul class="list-check"><li>Création : ${euro(b.price)}, une fois</li><li>Forfait : ${euro(meYear)} (${annuel.moisOfferts} mois offerts)</li><li>Nom de domaine, mises à jour et SEO de base compris</li></ul>
      <p class="year-after">Puis ${euro(meYear)} par an.</p>
    </div>
  </div>
  <p class="center years-note">La première année, vous payez la création. Ensuite, vous payez moins qu’un Shopify Basic seul, et c’est moi qui m’occupe de tout.</p>
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
    ['mint', 'calendar-check', 'À l’année', `${annuel.moisOfferts} mois offerts`, 'En payant votre forfait à l’année, vous ne payez que dix mois sur douze.'],
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

Puis un forfait dès ${euro(F('chico').month)} par mois, avec l’hébergement, le nom de domaine et le suivi de votre référencement. Le détail est sur la page [forfaits](/forfaits/).

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
    ['L’espace client et l’IA', FAQ.espace, 'espace'],
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
    description: 'Toutes les réponses sur la création de votre site, les forfaits Chico, Power et Titan, l’espace client et l’IA, le référencement et le parrainage.',
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
    home(), creerPage(), forfaitsPage(), espacePage(), seoPage(), shopifyPage(), fidelitePage(), methodePage(), contactPage(), ardennesPage(), faqPage(),
    ...legal.map(legalPage), planDuSite(), merci(), notFound(),
  ];
}

module.exports = { build };
