// Gabarit commun : <head>, en-tête, pied de page, données structurées
const { site, sections, types, forfaits, creation, jetonsLia, marche, enService } = require('../config');
let METIERS = [];
try { METIERS = require('../content/metiers').metiers; } catch (e) { /* pas encore écrit */ }
const { icon } = require('./icons');
const { logoMark, monster } = require('./monsters');
const { petit } = require('./bestiaire');
// Les titres trop longs pour Google (plus de 70 caractères) gardent la marque en court, ou la perdent.
const MARQUE = ' | ' + site.name;
const MARQUE_COURTE = ' | Minis Monstres';
function titreCourt(t) {
  if (!t || t.length <= 70 || !t.endsWith(MARQUE)) return t;
  const b = t.slice(0, -MARQUE.length);
  return (b + MARQUE_COURTE).length <= 70 ? b + MARQUE_COURTE : b;
}
const brandName = '<span class="brand-pre">Les Minis</span> <span class="brand-co">Monstres</span>';
const { esc, typo } = require('./md');
const C = require('./components');

// L'offre unique : le site à prix unique, puis un seul abonnement
const ABO = forfaits[0];

const assetsVersion = { css: '1', js: '1' };
function setAssetVersion(v) { Object.assign(assetsVersion, v); }

// ---------------------------------------------------------------- schema.org
function businessSchema() {
  const offers = [
    ...types.map((t) => ({
      '@type': 'Offer',
      name: 'Création : ' + t.label,
      price: t.price,
      priceCurrency: 'EUR',
      description: t.pitch.replace(/’/g, "'"),
      url: site.url + C.creerUrl({ type: t.id }),
    })),
    // L'abonnement : un seul, le même pour tous les sites
    ...forfaits.map((f) => ({
      '@type': 'Offer',
      name: f.name + ' mensuel',
      priceCurrency: 'EUR',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: f.month, priceCurrency: 'EUR', unitCode: 'MON', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } },
      description: f.pitch.replace(/’/g, "'"),
      url: site.url + sections.forfaits.path + '#offre',
    })),
  ];
  const b = {
    '@type': 'ProfessionalService',
    '@id': site.url + '/#entreprise',
    name: site.name,
    slogan: `Votre site internet à ${creation.prix} €, le même prix pour tous`,
    description:
      `Création de sites internet à prix unique, ${creation.prix} € (une page ou site vitrine, boutique en ligne en option), puis un abonnement à ${ABO.month} € par mois : nom de domaine, hébergement, mises à jour, modifications et bases du SEO. Tout se fait en ligne, pour des clients partout en France.`,
    url: site.url + '/',
    ...(site.email ? { email: site.email } : {}),
    image: site.url + '/assets/img/og-image.png',
    logo: site.url + '/assets/img/logo-512.png',
    priceRange: '€',
    currenciesAccepted: 'EUR',
    address: {
      '@type': 'PostalAddress',
      addressCountry: site.address.country,
    },
    areaServed: [{ '@type': 'Country', name: 'France' }],
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Sites internet et abonnement', itemListElement: offers },
    knowsAbout: ['Création de site internet', 'Site vitrine', 'Boutique en ligne', 'Référencement naturel (SEO)', 'Référencement local', 'Intelligence artificielle'],
  };
  const sameAs = Object.values(site.social).filter(Boolean);
  if (sameAs.length) b.sameAs = sameAs;
  return b;
}

function graph(p) {
  const url = site.url + p.path;
  const g = [businessSchema()];
  g.push({ '@type': 'WebSite', '@id': site.url + '/#site', url: site.url + '/', name: site.name, inLanguage: 'fr-FR', publisher: { '@id': site.url + '/#entreprise' } });
  const webpage = {
    '@type': 'WebPage',
    '@id': url + '#page',
    url,
    name: p.title,
    description: p.description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': site.url + '/#site' },
    about: { '@id': site.url + '/#entreprise' },
  };
  if (p.crumbs && p.crumbs.length > 1) {
    webpage.breadcrumb = { '@id': url + '#ariane' };
    g.push({
      '@type': 'BreadcrumbList',
      '@id': url + '#ariane',
      itemListElement: p.crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: site.url + c.path })),
    });
  }
  g.push(webpage);
  for (const s of p.schema || []) if (s) g.push(s);
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': g }).replace(/</g, '\\u003c');
}

// ---------------------------------------------------------------- en-tête
// Notre équipe, Accompagnement, Tarifs, Outils, Réalisations, Contact. Outils et Documentation passent dans l'espace client.
// Sur téléphone, chaque lien a une petite phrase (NAV_DESC), et « Créer mon site » est le grand bouton du bas.
// Outils en pause (config enService) : l'onglet Outils disparaît du menu.
const NAV = ['equipe', 'accompagnement', 'forfaits', 'espace', 'confiance', 'contact'].filter((k) => k !== 'espace' || enService.outils);
const NAV_DESC = {
  equipe: 'Ma petite bande et moi',
  accompagnement: 'Après la mise en ligne',
  forfaits: 'Tout compris, voir nos tarifs',
  espace: 'Des outils pour vous aider',
  confiance: 'Des sites à visiter',
  contact: 'Une question, un projet ?',
};

function header(currentPath) {
  const onCreer = currentPath.startsWith(sections.creer.path);
  return `<a class="skip" href="#contenu">Aller au contenu</a>
<header class="site-header">
  <div class="container header-in">
    <a class="brand" href="/" aria-label="${site.name}, accueil">${logoMark({ id: 'lgh' })}<span class="brand-text"><strong>${brandName}</strong></span></a>
    <nav class="nav" id="nav" aria-label="Navigation principale">
      <ul class="nav-list">
        ${NAV.map((k) => {
          const s = sections[k];
          const on = currentPath.startsWith(s.path);
          return `<li><a class="nav-link c-${s.color}" href="${s.path}"${on ? ' aria-current="page"' : ''}>${icon(s.icon)}<span class="nav-txt">${s.label}<small>${NAV_DESC[k]}</small></span>${icon('chevron-right')}</a></li>`;
        }).join('')}
        <li class="nav-creer"><span class="nav-creer-art" aria-hidden="true">${petit('mochi', { humeur: 'ravi' })}</span>${C.btn(sections.creer.path, 'btn-primary btn-lg', sections.creer.icon, sections.creer.label, onCreer ? ' aria-current="page"' : '')}<small>Le prix s’affiche tout de suite, sans devis.</small></li>
      </ul>
    </nav>
    <div class="header-actions">
      <a class="btn-espace" href="${sections.monespace.path}"${currentPath.startsWith(sections.monespace.path) ? ' aria-current="page"' : ''}>${icon('circle-user')}<span>Mon espace</span></a>
      ${C.btn(sections.creer.path, 'btn-primary btn-sm btn-creer', 'wand-sparkles', 'Créer mon site', onCreer ? ' aria-current="page"' : '')}
      <button class="burger" type="button" aria-controls="nav" aria-expanded="false" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

// ---------------------------------------------------------------- pied de page
function footer(p) {
  // la petite famille, assise sur le bord du pied de page
  const parade = ['champi', 'mochi', 'fantome', 'gelee', 'chaton', 'nuage', 'dino', 'etoile'];
  return `<footer class="site-footer">
  <div class="parade" aria-hidden="true">${parade.map((n, i) => `<span class="parade-m pm-${i}">${petit(n, { humeur: i % 3 === 1 ? 'ravi' : 'content' })}</span>`).join('')}</div>
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand" href="/">${logoMark({ id: 'lgf' })}<span class="brand-text"><strong>${brandName}</strong></span></a>
      <p>Des sites internet professionnels, simples et faits pour être trouvés sur Google. Je conçois votre site et je reste à vos côtés, mes automatisations font le reste. Depuis les Ardennes, pour des clients partout en France.</p>
      <ul class="footer-contact">
        <li><a href="${C.contactUrl}">${icon('message-circle')}Nous écrire</a></li>
        ${site.email ? `<li><a href="mailto:${site.email}">${icon('mail')}${site.email}</a></li>` : ''}
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Votre site</h2>
      <ul class="footer-links">
        <li><a href="${sections.creer.path}">Créer mon site</a></li>
        <li><a href="${C.creerUrl()}">Site Internet Professionnel</a></li>
        <li><a href="${C.creerUrl({ type: 'boutique' })}">Avec une boutique en ligne</a></li>
        <li><a href="${sections.forfaits.path}">Tarifs : ${marche.fois} fois moins cher</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Votre métier</h2>
      <ul class="footer-links">
        ${METIERS.map((m) => `<li><a href="/${m.slug}/">${m.nom}</a></li>`).join('')}
        <li><a href="/creation-site-internet-ardennes/">Création de site dans les Ardennes</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Bon à savoir</h2>
      <ul class="footer-links">
        <li><a href="/pourquoi-un-site-internet/">Pourquoi avoir un site internet ?</a></li>
        <li><a href="/etre-visible-sur-google/">Être visible sur Google</a></li>
        <li><a href="/referencement-seo/">Référencement SEO</a></li>
        <li><a href="/guides/">Guides pour créer son site</a></li>
        <li><a href="/lexique/">Lexique du web</a></li>
        <li><a href="${sections.comparatif.path}">Les Minis Monstres et les autres solutions</a></li>
        <li><a href="/fidelite/">Fidélité et parrainage</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Infos</h2>
      <ul class="footer-links">
        <li><a href="${sections.liaalex.path}">Pourquoi les Minis Monstres ?</a></li>
        <li><a href="${sections.methode.path}">Pourquoi c’est moins cher</a></li>
        <li><a href="${sections.confiance.path}">Réalisations</a></li>
        <li><a href="${sections.accompagnement.path}">Accompagnement</a></li>
        <li><a href="/faq/">Questions fréquentes</a></li>
        <li><a href="/mon-espace/demo/">Essayer l’espace client</a></li>
        ${enService.outils ? `<li><a href="${sections.espace.path}">Les outils de l’espace client</a></li>` : ''}
        <li><a href="${sections.documentation.path}">Documentation client</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom"><div class="container footer-bottom-in">
    <p>© ${new Date().getFullYear()} ${site.name}. Sites internet et SEO.</p>
    <ul>
      <li><a href="/mentions-legales/">Mentions légales</a></li>
      <li><a href="/politique-de-confidentialite/">Confidentialité</a></li>
      <li><a href="/conditions-generales/">Conditions générales</a></li>
      <li><a href="/plan-du-site/">Plan du site</a></li>
    </ul>
  </div></div>
</footer>
${p.noMobileBar ? '' : `<nav class="mobile-bar" aria-label="Accès rapide">
  <a href="${C.contactUrl}" class="mb-wa">${icon('message-circle')}<span>Nous écrire</span></a>
  <a href="${sections.creer.path}" class="mb-creer">${icon('wand-sparkles')}<span>Créer mon site</span></a>
</nav>`}
${liaFlot()}`;
}

// ---------------------------------------------------------------- la bulle de Cerise
// En bas de chaque page. Sur le site : Cerise répond tout de suite à quelques questions (réponses écrites ici, sans appel au modèle).
// Dans l'espace client : on lui écrit, elle répond, aide à formuler la demande, la fait confirmer puis la transmet à Alex
// (voir main.js et includes/bulle.php). Aucun petit monstre ne modifie le site : c'est Alex qui fait les modifications.
function liaFlot() {
  const eur = (n) => `${n} €`;
  const questions = [
    ['C’est combien ?', `Votre site professionnel coûte ${eur(creation.prix)}, jusqu’à ${creation.pages} pages. Ensuite, l’abonnement s’occupe de tout : ${forfaits[0].name} à ${eur(forfaits[0].month)} par mois, avec vos modifications et une page pour Google chaque mois, ou ${forfaits[1].name} à ${eur(forfaits[1].month)}, avec vos modifications en priorité sous 48 h, une page chaque semaine et la bande qui surveille votre site. Vous avez déjà votre hébergement ? La création seule vous donne le code du site, sans abonnement.`, sections.forfaits.path, 'Voir les tarifs'],
    ['Comment ça marche ?', 'Vous composez votre site en deux minutes, et Alex le crée pour vous. Il vous le montre avant la mise en ligne, et vous lui dites ce qui doit changer. Vous voyez le prix avant de commander.', sections.creer.path, 'Créer mon site'],
    ['Qui fait mon site ?', 'Alex ! C’est lui qui conçoit votre site et qui vous répond. Moi, je suis la secrétaire de sa petite bande. Les Minis Monstres vous aident, c’est Alex qui modifie votre site.', sections.equipe.path, 'Rencontrer la bande'],
    ['Et pour changer mon site après ?', 'Écrivez-moi votre demande dans votre espace client. Je vous pose quelques questions pour bien comprendre, vous confirmez, et je transmets à Alex. C’est lui qui fait la modification, avec soin. C’est compris dans votre abonnement !', sections.accompagnement.path, 'L’accompagnement'],
  ];
  const exemples = ['Changer mes horaires', 'Ajouter une photo sur ma page d’accueil', enService.outils ? 'Comment avoir plus d’avis Google ?' : 'Comment se passe une modification ?', 'Que comprend mon abonnement ?'];
  return `<div class="lia-flot" data-lia-flot hidden>
  <div class="lia-flot-panel" id="lia-panel" role="dialog" aria-label="Cerise, la secrétaire d’Alex" hidden>
    <div class="lia-tete">${monster('coucou')}<p><strong>Cerise</strong><small>La secrétaire de la petite bande</small></p><span class="lia-jetons" data-lia-jetons hidden></span><button type="button" class="lia-flot-fermer" aria-label="Fermer la bulle de Cerise">${icon('x')}</button></div>
    <div class="lia-fil" data-lia-fil aria-live="polite">
      <p class="lia-msg is-lia" data-lia-accueil="site">Bonjour, moi c’est Cerise, de la petite bande d’Alex ! Choisissez une question, je vous réponds tout de suite.</p>
      <p class="lia-msg is-lia" data-lia-accueil="ok" hidden>Bonjour ! Dites-moi ce que vous voulez changer sur votre site, ou posez-moi une question.</p>
      <p class="lia-msg is-lia" data-lia-accueil="demo" hidden>Bonjour ! Ici, c’est une démonstration : écrivez-moi comme un client, je vous montre comment je réponds.</p>
      <p class="lia-msg is-lia" data-lia-accueil="attente" hidden>Bonjour ! Je ne suis pas encore branchée dans cet espace. En attendant, écrivez à Alex dans l’onglet Mes demandes.</p>
      <p class="lia-msg is-lia" data-lia-accueil="abonnement" hidden>Bonjour ! Je vous réponds ici dès que votre abonnement a démarré. En attendant, écrivez à Alex dans l’onglet Mes demandes.</p>
    </div>
    <div class="lia-puces" data-lia-liens="site">
      ${questions.map(([q], i) => `<button type="button" data-lia-q="${i}">${q}</button>`).join('')}
      <a href="${C.contactUrl}">Écrire à Alex</a>
    </div>
    <div hidden>${questions.map(([, r, href, label], i) => `<p data-lia-r="${i}">${r} <a href="${href}">${label}</a></p>`).join('')}</div>
    <div class="lia-puces" data-lia-liens="espace" hidden>
      ${exemples.map((e) => `<button type="button" data-lia-ex>${e}</button>`).join('')}
    </div>
    <form class="lia-saisie" data-lia-form hidden>
      <label class="sr-only" for="lia-champ">Votre message pour Cerise</label>
      <textarea id="lia-champ" rows="2" maxlength="${jetonsLia.bulle.max}" placeholder="Écrivez à Cerise…" required></textarea>
      <button type="submit" aria-label="Envoyer à Cerise">${icon('send')}</button>
    </form>
    <p class="lia-note" data-lia-note hidden><span data-lia-prix></span> Cerise répond automatiquement et peut se tromper. Elle ne touche pas à votre site : c’est Alex qui fait les modifications. <button type="button" class="link-btn" data-lia-nouveau>Nouvelle conversation</button></p>
  </div>
  <p class="lia-flot-coucou" hidden><strong>Je suis là pour vous aider !</strong><small>Cerise, la secrétaire de la bande</small></p>
  <button type="button" class="lia-flot-btn" aria-expanded="false" aria-controls="lia-panel"><span class="sr-only">Parler à Cerise</span>${monster('coucou')}</button>
</div>`;
}

// Typographie dans le texte visible (hors balises, scripts et styles) :
// apostrophes typographiques et espaces insécables (« 30 € », « faire ? »).
function smartQuotes(html) {
  return html.replace(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)|([^<]+)/g, (m, tag, text) =>
    tag ? tag : typo(text.replace(/([A-Za-zÀ-ÿœŒ])'(?=[A-Za-zÀ-ÿœŒ0-9])/g, '$1’'))
  );
}

// ---------------------------------------------------------------- page complète
function page(p) {
  const url = site.url + p.path;
  const ogImage = site.url + '/assets/img/og-image.png';
  const robots = p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  const color = p.section ? sections[p.section].color : 'mint';
  return `<!doctype html>
<html lang="fr" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titreCourt(p.title))}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${robots}">
<meta name="author" content="${esc(site.name)}">
<meta name="theme-color" content="#16142A">
<meta name="format-detection" content="telephone=no">
<meta property="og:locale" content="fr_FR">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(titreCourt(p.title))}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(`${site.name} : votre site internet tout compris, ${marche.fois} fois moins cher`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titreCourt(p.title))}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="preload" href="/assets/fonts/jakarta-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${assetsVersion.css}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<script type="application/ld+json">${graph(p)}</script>
<script>(function(h){h.classList.add('js');var d=new Date(),n=(d.getMonth()+1)*100+d.getDate(),q=/[?&]noel=([01])/.exec(location.search);if(q?q[1]==='1':(n>=1115||n<=106))h.classList.add('noel')})(document.documentElement)</script>
</head>
<body class="c-${color}${p.bodyClass ? ' ' + p.bodyClass : ''}">
${smartQuotes(`${header(p.path)}
<main id="contenu">
${p.body}
</main>
${footer(p)}`)}
<script src="/assets/js/main.js?v=${assetsVersion.js}" defer></script>
</body>
</html>
`;
}

module.exports = { page, businessSchema, setAssetVersion };
