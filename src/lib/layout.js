// Gabarit commun : <head>, en-tête, pied de page, données structurées
const { site, sections, formules } = require('../config');
const { icon } = require('./icons');
const { esc, typo } = require('./md');
const C = require('./components');

const assetsVersion = { css: '1', js: '1' };
function setAssetVersion(v) { Object.assign(assetsVersion, v); }

// ---------------------------------------------------------------- schema.org
function businessSchema() {
  const b = {
    '@type': 'ProfessionalService',
    '@id': site.url + '/#entreprise',
    name: site.name,
    slogan: 'Des sites internet et des outils créés avec l’IA, vérifiés par un humain',
    description:
      'Création de sites internet à petit prix (une page, avec onglets, boutique en ligne), en paiement unique ou en abonnement, mini-jeux 2D et automatisations. Basé dans les Ardennes, pour des clients partout en France.',
    url: site.url + '/',
    telephone: site.phoneIntl,
    email: site.email,
    image: site.url + '/assets/img/og-image.png',
    logo: site.url + '/assets/img/logo-512.png',
    priceRange: '€',
    currenciesAccepted: 'EUR',
    address: {
      '@type': 'PostalAddress',
      ...(site.address.street ? { streetAddress: site.address.street } : {}),
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: [{ '@type': 'Country', name: 'France' }, { '@type': 'AdministrativeArea', name: 'Ardennes (08)' }],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Formules de sites internet',
      itemListElement: formules.map((f) => ({
        '@type': 'Offer',
        name: 'Site internet ' + f.name,
        price: f.unique,
        priceCurrency: 'EUR',
        description: f.pitch.replace(/’/g, "'"),
        url: site.url + '/tarifs/#' + f.id,
      })),
    },
    knowsAbout: ['Création de site internet', 'Site vitrine', 'Boutique en ligne', 'Référencement naturel', 'Intelligence artificielle', 'Automatisation', 'Jeux 2D'],
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
const NAV = ['sites', 'tarifs', 'jeux', 'auto', 'methode', 'fidelite', 'contact'];

function header(currentPath) {
  return `<a class="skip" href="#contenu">Aller au contenu</a>
<header class="site-header">
  <div class="container header-in">
    <a class="brand" href="/" aria-label="${site.name}, accueil">${C.logoSvg('lgh')}<span class="brand-text"><strong>${site.name}</strong><small>${site.baseline}</small></span></a>
    <nav class="nav" id="nav" aria-label="Navigation principale">
      <ul class="nav-list">
        ${NAV.map((k) => {
          const s = sections[k];
          const on = currentPath === s.path || currentPath.startsWith(s.path);
          return `<li><a class="nav-link acc-${s.accent}" href="${s.path}"${on ? ' aria-current="page"' : ''}><span class="nav-dot" aria-hidden="true"></span>${s.label}</a></li>`;
        }).join('')}
      </ul>
      <div class="nav-mobile-cta">
        ${C.btnDevis('btn-primary btn-block')}
        ${C.btnWa('btn-wa btn-block', 'Écrire sur WhatsApp')}
      </div>
    </nav>
    <div class="header-actions">
      ${C.btnDevis('btn-primary btn-devis')}
      <button class="burger" type="button" aria-controls="nav" aria-expanded="false" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

// ---------------------------------------------------------------- pied de page
function footer() {
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand brand-light" href="/">${C.logoSvg('lgf')}<span class="brand-text"><strong>${site.name}</strong><small>${site.baseline}</small></span></a>
      <p>Des sites internet et des outils créés avec l’IA, vérifiés par un humain. Basé dans les Ardennes, je travaille avec des clients partout en France.</p>
      <ul class="footer-contact">
        <li><a href="${C.waUrl()}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a></li>
        <li><a href="${C.tel}">${icon('phone')}${site.phoneDisplay}</a></li>
        <li><a href="mailto:${site.email}">${icon('mail')}${site.email}</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Sites internet</h2>
      <ul class="footer-links">
        ${formules.map((f) => `<li><a href="/tarifs/#${f.id}">${C.projetLabel(f)}</a></li>`).join('')}
        <li><a href="/tarifs/#options">Options</a></li>
        <li><a href="/creation-site-internet-ardennes/">Création de site dans les Ardennes</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Autres services</h2>
      <ul class="footer-links">
        <li><a href="/jeux-2d/">Jeux 2D</a></li>
        <li><a href="/automatisations/">Automatisations</a></li>
        <li><a href="/automatisations/#initiation">Initiation à l’IA</a></li>
        <li><a href="/fidelite/">Fidélité et parrainage</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Infos</h2>
      <ul class="footer-links">
        <li><a href="/methode/">Ma méthode avec l’IA</a></li>
        <li><a href="/faq/">Questions fréquentes</a></li>
        <li><a href="/contact/">Contact et devis</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom"><div class="container footer-bottom-in">
    <p>© ${new Date().getFullYear()} ${site.name}. Sites internet et IA.</p>
    <ul>
      <li><a href="/mentions-legales/">Mentions légales</a></li>
      <li><a href="/politique-de-confidentialite/">Confidentialité</a></li>
      <li><a href="/conditions-generales/">Conditions générales</a></li>
      <li><a href="/plan-du-site/">Plan du site</a></li>
    </ul>
  </div></div>
</footer>
<nav class="mobile-bar" aria-label="Contact rapide">
  <a href="${C.waUrl()}" class="mb-wa" target="_blank" rel="noopener">${icon('whatsapp')}<span>WhatsApp</span></a>
  <a href="${C.devisUrl()}" class="mb-devis">${icon('file-text')}<span>Devis gratuit</span></a>
</nav>
<a class="wa-float" href="${C.waUrl()}" target="_blank" rel="noopener" aria-label="Écrire à ${site.name} sur WhatsApp">${icon('whatsapp')}</a>`;
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
  const accent = p.section ? sections[p.section].accent : 'amber';
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
<meta name="theme-color" content="#15254a">
<meta name="format-detection" content="telephone=no">
<meta property="og:locale" content="fr_FR">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="ALED08, sites internet et IA à petit prix">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="preload" href="/assets/fonts/nunito-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${assetsVersion.css}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<script type="application/ld+json">${graph(p)}</script>
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="acc-${accent}${p.bodyClass ? ' ' + p.bodyClass : ''}">
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
