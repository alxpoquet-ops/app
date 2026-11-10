// Gabarit commun : <head>, en-tête, pied de page, données structurées
const { site, hours, forfait, tarifs, communes } = require('../config');
const { icon } = require('./icons');
const { esc } = require('./md');
const C = require('./components');
const { mainServices } = require('../content/services-list');

const assetsVersion = { css: '1', js: '1' };
function setAssetVersion(v) { Object.assign(assetsVersion, v); }

// ---------------------------------------------------------------- schema.org
function businessSchema() {
  const b = {
    '@type': 'Electrician',
    '@id': site.url + '/#entreprise',
    name: site.name,
    alternateName: 'ALED08, dépannage électrique dans les Ardennes',
    slogan: 'Dépannage électrique au forfait, à tout moment sur rendez-vous',
    description:
      `Électricien spécialiste du dépannage basé à Signy-l'Abbaye (Ardennes). Forfait dépannage 79 € : déplacement, recherche de panne, proposition de solution et devis de réparation sans obligation. Travaux sur devis gratuit : tableau, prises, éclairage, mise en sécurité. À tout moment, sur rendez-vous.`,
    url: site.url + '/',
    telephone: site.phoneIntl,
    email: site.email,
    image: site.url + '/assets/img/og-image.png',
    logo: site.url + '/assets/img/logo-512.png',
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    makesOffer: {
      '@type': 'Offer',
      name: 'Forfait dépannage électrique',
      price: forfait.price,
      priceCurrency: 'EUR',
      description: "Déplacement jusqu'à 15 km de Signy-l'Abbaye, recherche de panne, proposition de solution et devis de réparation sans obligation. Remise accordée si l'origine de la panne n'est pas trouvée. Même prix le soir et le week-end.",
      url: site.url + '/tarifs/',
      itemOffered: { '@type': 'Service', name: 'Dépannage électrique à domicile', serviceType: 'Dépannage électrique' },
    },
    address: {
      '@type': 'PostalAddress',
      ...(site.address.street ? { streetAddress: site.address.street } : {}),
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: [
      { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng }, geoRadius: 45000 },
      { '@type': 'AdministrativeArea', name: 'Ardennes (08)' },
      ...communes.filter((c) => c.page).map((c) => ({ '@type': 'City', name: c.name })),
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Prestations et tarifs électricité',
      itemListElement: tarifs.map((t) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: t.label },
        ...(t.price != null
          ? { price: t.price, priceCurrency: 'EUR', description: t.note }
          : {}),
      })),
    },
    knowsAbout: ['Dépannage électrique', 'Recherche de panne', 'Recherche de panne électrique', 'Tableau électrique', 'Norme NF C 15-100', 'Mise en sécurité électrique', 'Éclairage LED'],
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
    '@type': p.webpageType || 'WebPage',
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
function header(currentPath) {
  const isActive = (p) => (currentPath === p || (p !== '/' && currentPath.startsWith(p)) ? ' aria-current="page"' : '');
  const links = [
    ['/tarifs/', 'Tarifs'],
    ['/zone-intervention/', 'Zone d’intervention'],
    ['/qui-suis-je/', 'Qui suis-je ?'],
    ['/blog/', 'Blog'],
    ['/contact/', 'Contact'],
  ];
  return `<a class="skip" href="#contenu">Aller au contenu</a>
<div class="topbar"><div class="container topbar-in">
  <span class="topbar-item hide-sm">${icon('zap')}Spécialiste du dépannage · forfait 79 €</span>
  <span class="topbar-item hide-lg">${icon('map-pin')}Signy-l’Abbaye · Ardennes (08)</span>
  <span class="topbar-item">${icon('clock')}<span>À tout moment, sur rendez-vous</span></span>
  <a class="topbar-phone" href="${C.tel}">${icon('phone')}${site.phoneDisplay}</a>
</div></div>
<header class="site-header">
  <div class="container header-in">
    <a class="brand" href="/" aria-label="ALED08, électricien dans les Ardennes, accueil">${C.logoSvg('lgh')}<span class="brand-text"><strong>ALED08</strong><small>Électricien · Ardennes</small></span></a>
    <nav class="nav" id="nav" aria-label="Navigation principale">
      <ul class="nav-list">
        <li><a class="nav-link nav-link--hl" href="/prestations/depannage-electrique/"${currentPath === '/prestations/depannage-electrique/' ? ' aria-current="page"' : ''}>${icon('zap')}Dépannage</a></li>
        <li class="has-sub">
          <a class="nav-link" href="/prestations/"${currentPath !== '/prestations/depannage-electrique/' ? isActive('/prestations/') : ''}>Prestations</a>
          <button class="sub-toggle" type="button" aria-expanded="false" aria-controls="sub-prestations" aria-label="Afficher les prestations">${icon('chevron-down')}</button>
          <div class="sub" id="sub-prestations"><ul>
            ${mainServices.map((s) => `<li><a href="${s.path}">${icon(s.icon)}<span><strong>${s.name}</strong></span></a></li>`).join('')}
            <li class="sub-all"><a href="/prestations/">${icon('list-checks')}<span><strong>Toutes les prestations</strong></span></a></li>
          </ul></div>
        </li>
        ${links.map(([p, t]) => `<li><a class="nav-link" href="${p}"${isActive(p)}>${t}</a></li>`).join('')}
      </ul>
      <div class="nav-mobile-cta">
        ${C.btnCall('btn-primary btn-block')}
        ${C.btnDevis('btn-light btn-block')}
        ${C.btnWa('btn-wa btn-block', 'Écrire sur WhatsApp')}
      </div>
    </nav>
    <div class="header-actions">
      <a class="btn btn-ghost btn-phone" href="${C.tel}" data-track="call">${icon('phone')}<span>${site.phoneDisplay}</span></a>
      <a class="btn btn-primary btn-devis" href="/devis/">${icon('file-text')}<span>Devis gratuit</span></a>
      <button class="burger" type="button" aria-controls="nav" aria-expanded="false" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

// ---------------------------------------------------------------- pied de page
function footer() {
  const zone = communes.filter((c) => c.page && c.main);
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand brand-light" href="/">${C.logoSvg('lgf')}<span class="brand-text"><strong>ALED08</strong><small>Électricien · Ardennes</small></span></a>
      <p><strong style="color:#fff">Dépannage électrique au forfait : 79 €</strong>, déplacement, recherche de panne et devis compris. Travaux sur devis gratuit. Un jeune artisan électricien à Signy-l’Abbaye, à votre écoute.</p>
      <ul class="footer-contact">
        <li><a href="${C.tel}">${icon('phone')}${site.phoneDisplay}</a></li>
        <li><a href="${C.waUrl()}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a></li>
        <li><a href="mailto:${site.email}">${icon('mail')}${site.email}</a></li>
        <li>${icon('map-pin')}${site.address.postalCode} ${site.address.city}</li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Prestations</h2>
      <ul class="footer-links">
        ${mainServices.map((s) => `<li><a href="${s.path}">${s.name}</a></li>`).join('')}
        <li><a href="/diagnostic-electrique-ardennes/">Diagnostic électrique</a></li>
        <li><a href="/petits-travaux-electriques/">Petits travaux électriques</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Zone d’intervention</h2>
      <ul class="footer-links">
        ${zone.map((c) => `<li><a href="/${c.page}/">Électricien ${c.name}</a></li>`).join('')}
        <li><a href="/electricien-ardennes/">Électricien Ardennes</a></li>
        <li><a href="/zone-intervention/"><strong>Toutes les communes</strong></a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Disponibilités</h2>
      ${C.hoursTable('hours-footer')}
      <p class="footer-note">Interventions uniquement sur rendez-vous.</p>
      <ul class="footer-links footer-links-inline">
        <li><a href="/tarifs/">Tarifs</a></li><li><a href="/realisations/">Réalisations</a></li><li><a href="/faq/">FAQ</a></li><li><a href="/blog/">Blog</a></li><li><a href="/qui-suis-je/">Qui suis-je ?</a></li><li><a href="/contact/">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom"><div class="container footer-bottom-in">
    <p>© ${new Date().getFullYear()} ${site.name}. Électricien à Signy-l’Abbaye, Ardennes (08).</p>
    <ul>
      <li><a href="/mentions-legales/">Mentions légales</a></li>
      <li><a href="/politique-de-confidentialite/">Confidentialité</a></li>
      <li><a href="/conditions-generales/">Conditions générales</a></li>
      <li><a href="/plan-du-site/">Plan du site</a></li>
      <li><button type="button" class="link-btn" data-cookie-settings>Gestion des cookies</button></li>
    </ul>
  </div></div>
</footer>
<nav class="mobile-bar" aria-label="Contact rapide">
  <a href="${C.tel}" class="mb-call" data-track="call">${icon('phone')}<span>Appeler</span></a>
  <a href="${C.waUrl()}" class="mb-wa" target="_blank" rel="noopener" data-track="whatsapp">${icon('whatsapp')}<span>WhatsApp</span></a>
  <a href="/devis/" class="mb-devis">${icon('file-text')}<span>Devis</span></a>
</nav>
<a class="wa-float" href="${C.waUrl()}" target="_blank" rel="noopener" aria-label="Contacter ALED08 sur WhatsApp" data-track="whatsapp">${icon('whatsapp')}</a>
<div class="cookie" id="cookie" role="dialog" aria-modal="false" aria-labelledby="cookie-title" hidden>
  <div class="cookie-in">
    <div class="cookie-text">
      <p id="cookie-title"><strong>${icon('cookie')}Vos choix en matière de cookies</strong></p>
      <p>Ce site n’utilise aucun cookie publicitaire ni de mesure d’audience. Seule la carte Google Maps, si vous l’affichez, peut déposer des cookies de Google. <a href="/politique-de-confidentialite/#cookies">En savoir plus</a></p>
      <label class="switch"><input type="checkbox" id="consent-maps"><span class="switch-ui" aria-hidden="true"></span><span>Autoriser la carte Google Maps</span></label>
    </div>
    <div class="cookie-actions">
      <button type="button" class="btn btn-ghost" data-consent="refuse">Tout refuser</button>
      <button type="button" class="btn btn-ghost" data-consent="save">Enregistrer</button>
      <button type="button" class="btn btn-primary" data-consent="accept">Tout accepter</button>
    </div>
  </div>
</div>`;
}

// Apostrophes typographiques dans le texte visible (hors balises, scripts et styles)
function smartQuotes(html) {
  return html.replace(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)|([^<]+)/g, (m, tag, text) =>
    tag ? tag : text.replace(/([A-Za-zÀ-ÿœŒ])'(?=[A-Za-zÀ-ÿœŒ0-9])/g, '$1\u2019')
  );
}

// ---------------------------------------------------------------- page complète
function page(p) {
  const url = site.url + p.path;
  const ogImage = site.url + (p.ogImage || '/assets/img/og-image.png');
  const robots = p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${robots}">
<meta name="author" content="${esc(site.name)}">
<meta name="theme-color" content="#161A1F">
<meta name="format-detection" content="telephone=no">
<meta name="geo.region" content="FR-08">
<meta name="geo.placename" content="${esc(p.geoPlace || "Signy-l'Abbaye")}">
<meta name="geo.position" content="${site.geo.lat};${site.geo.lng}">
<meta name="ICBM" content="${site.geo.lat}, ${site.geo.lng}">
<meta property="og:locale" content="fr_FR">
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(p.ogTitle || p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="ALED08, dépannage et travaux électriques dans les Ardennes">
${p.ogType === 'article' && p.published ? `<meta property="article:published_time" content="${p.published}">\n<meta property="article:modified_time" content="${p.modified || p.published}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.ogTitle || p.title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="preload" href="/assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/sora-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${assetsVersion.css}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<script type="application/ld+json">${graph(p)}</script>
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="${p.bodyClass || ''}">
${smartQuotes(`${header(p.path)}
<main id="contenu">
${p.body}
</main>
${footer()}`)}
<script src="/assets/js/main.js?v=${assetsVersion.js}" defer></script>
</body>
</html>
`;
}

module.exports = { page, businessSchema, setAssetVersion };
