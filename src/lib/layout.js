// Gabarit commun : <head>, en-tête, pied de page, données structurées
const { site, sections, types, forfaits, creation, lancement, marche, jetonsLia, enService, fractionne, creationSeule, ateliers, outilsOffre } = require('../config');
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
const brandName = '<span class="brand-l1">Les Minis</span><span class="brand-l2">Monstres</span>'; // tout le nom, en dégradé pastel lumineux (20 novembre 2026)
const { esc, typo } = require('./md');
const C = require('./components');

// L'offre (21 novembre 2026) : le Site Essentiel payé une fois, option e-commerce, puis Autonomie (0 € par mois) ou Mini (10 € par mois,
// sans engagement). Le Site Visibilité (config.types, retire: true) n'apparaît plus nulle part.
const ABO = forfaits[0];
const AUTO = creationSeule;
const PRIX_SITES = `${C.ESSENTIEL.name} ${C.euro(C.ESSENTIEL.price)}, ou ${C.euro(C.BOUTIQUE_T.price)} avec l’option ${C.ECOMMERCE.name}`;

const assetsVersion = { css: '1', js: '1' };
function setAssetVersion(v) { Object.assign(assetsVersion, v); }

// ---------------------------------------------------------------- schema.org
function businessSchema() {
  const offers = [
    ...types.filter((t) => !t.retire).map((t) => ({
      '@type': 'Offer',
      name: t.name + ' : ' + t.but.toLowerCase(),
      price: t.price,
      priceCurrency: 'EUR',
      ...(C.enLancement() && t.prixNormal && t.prixNormal !== t.price ? { priceValidUntil: lancement.jusquau } : {}), // l'offre de lancement
      description: t.pitch.replace(/’/g, "'"),
      url: site.url + C.creerUrl({ type: t.id }),
    })),
    // Mini : le seul abonnement, jamais imposé (Autonomie : 0 € par mois, le client gère tout)
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
    slogan: `Un site internet soigné pour être visible, ${marche.foisTexte} fois moins cher qu’un indépendant`,
    description:
      `Un site internet rend votre activité visible : on crée le vôtre. Sites pour artisans, commerçants et associations, création : ${PRIX_SITES}. Ensuite, au choix : le forfait ${AUTO.name} à ${AUTO.month} € par mois, ou le forfait ${ABO.name} à ${ABO.month} € par mois sans engagement (hébergement, sauvegardes, sécurité, maintenance, modifications), ou ${ABO.month + (ABO.domaine || 0)} € par mois si on vous fournit le nom de domaine. Tout se fait en ligne, pour des clients partout en France.`,
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
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Sites internet et forfait Mini', itemListElement: offers },
    knowsAbout: ['Création de site internet', 'Site vitrine', 'Boutique en ligne', 'Visibilité sur Google', 'Référencement local'],
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
// Trois onglets (décision d'Alex, 24 novembre 2026, soir) : La maison, Mon Site, Mes Tutos (config.ateliers, sans les cachés),
// chacun avec son petit monstre et un sous-menu court. La première lettre de chaque onglet est discrètement teintée :
// L, M, M, un clin d'œil à LMM. À droite : un seul bouton d'action (« Créer mon site »), le soleil / la lune et « Mon espace ».
// L'onglet en surbrillance : posé ici à la construction, puis recalculé par le script du site (sous WordPress, l'en-tête
// est le même pour toutes les pages : data-chemins dit quelles pages appartiennent à quel atelier).
// Sur téléphone : chaque atelier est une carte, ses pages en boutons avec icône, et deux gros boutons tout en bas.
const ATELIERS = ateliers.filter((a) => !a.cache && (a.id !== 'outils' || (outilsOffre && outilsOffre.actif)));
const TUTOS = C.TUTOS;
const lien = (k, label) => ({ path: sections[k].path, label: label || sections[k].label, icon: sections[k].icon, color: sections[k].color });
const AT = (id) => ateliers.find((a) => a.id === id) || {};
const SOUS_MENU = {
  maison: [{ path: AT('maison').path, label: 'Le concept', icon: 'house', color: 'lilac' }, lien('equipe'), lien('methode'), lien('contact')],
  sites: [lien('creer'), lien('forfaits'), lien('confiance'), lien('metiers'), lien('seo')],
  // Mes Tutos : les étapes de la création, « À la une » s'il y a des tutos à mettre en avant, puis les thèmes qui ont des tutos
  get ecole() {
    return [
      { path: `${TUTOS.HUB}#etapes`, label: 'Les étapes de votre site', icon: 'route', color: 'mint' },
      ...(TUTOS.aLaUne.length ? [{ path: `${TUTOS.HUB}#a-la-une`, label: 'À la une', icon: 'star', color: 'butter' }] : []),
      ...TUTOS.themes().map((g) => ({ path: `${TUTOS.HUB}#${g.id}`, label: g.titre, icon: g.icon, color: g.color })),
    ];
  },
};
const DESC_ATELIER = {
  maison: 'Le concept, Alex et la bande',
  sites: 'Votre site professionnel, soigné et suivi',
  ecole: 'Toutes vos questions, gratuites',
};
// La teinte de la première lettre (le monstre de l'onglet : Cerise en rose, Bricou en vert, Mochi en pêche)
const TEINTE_LETTRE = { maison: 'pink', sites: 'mint', ecole: 'peach' };
const lettre = (a) => `<span class="onglet-l c-${TEINTE_LETTRE[a.id] || a.color}">${esc(a.label.charAt(0))}</span>${esc(a.label.slice(1))}`;
// Les pages rattachées à chaque atelier, en plus de celles de son menu (pour savoir quel onglet allumer)
const RATTACHE = {
  maison: ['/faq/', '/pourquoi-les-minis-monstres/'],
  sites: ['/commander/', '/commande-confirmee/', '/etre-visible-sur-google/', '/pourquoi-un-site-internet/', '/creation-site-internet-ardennes/', '/lexique/', '/comparatif/', '/parrainage/', '/accompagnement/', ...METIERS.map((m) => `/${m.slug}/`)],
  ecole: ['/guides/'],
  outils: [],
};
// les ancres (#theme) ne servent pas à choisir l'onglet : seule l'adresse compte
const cheminsDe = (a) => [a.path, ...(SOUS_MENU[a.id] || []).map((x) => x.path), ...(RATTACHE[a.id] || [])].filter((x, i, t) => !x.includes('#') && t.indexOf(x) === i);
// L'atelier d'une page : le chemin le plus long qui la contient (« / » seulement pour l'accueil)
function atelierDe(path) {
  let best = null, len = -1;
  for (const a of ATELIERS) for (const c of cheminsDe(a)) {
    const ok = c === '/' ? path === '/' : path.startsWith(c);
    if (ok && c.length > len) { best = a.id; len = c.length; }
  }
  return best;
}
const imgMonstre = (m, taille, cls) => `<img class="${cls}" src="/assets/img/mail/${m}.png" alt="" width="${taille}" height="${taille}" decoding="async">`;

function header(currentPath) {
  const onCreer = currentPath.startsWith(sections.creer.path);
  const onEspace = currentPath.startsWith(sections.monespace.path);
  const actif = atelierDe(currentPath);
  const onglet = (a) => {
    const sous = SOUS_MENU[a.id] || [];
    const on = a.id === actif;
    const cur = on ? ` aria-current="${a.path === currentPath ? 'page' : 'true'}"` : '';
    return `<li class="onglet-li c-${a.color}${on ? ' is-on' : ''}" data-chemins="${cheminsDe(a).join(' ')}">
          <div class="onglet-tete"><a class="onglet" href="${a.path}"${cur}>${imgMonstre(a.monstre, 32, 'onglet-img')}<span class="onglet-txt"><span class="onglet-nom">${lettre(a)}</span><small>${esc(DESC_ATELIER[a.id] || a.court || '')}</small></span>${icon('chevron-right')}</a>${sous.length ? `<button class="onglet-plus" type="button" aria-expanded="false" aria-controls="sm-${a.id}"><span class="sr-only">Les pages : ${esc(a.label)}</span>${icon('chevron-down')}</button>` : ''}</div>
          ${sous.length ? `<ul class="sous-menu" id="sm-${a.id}">${sous.map((s) => `<li><a class="nav-link sous-lien c-${s.color}" href="${s.path}"${currentPath === s.path ? ' aria-current="page"' : ''}>${icon(s.icon)}<span>${esc(s.label)}</span></a></li>`).join('')}</ul>` : ''}
        </li>`;
  };
  return `<a class="skip" href="#contenu">Aller au contenu</a>
<header class="site-header">
  <div class="container header-in">
    <a class="brand" href="/" aria-label="${site.name}, accueil">${logoMark({ id: 'lgh' })}<span class="brand-text"><strong>${brandName}</strong></span></a>
    <nav class="nav" id="nav" aria-label="Navigation principale">
      <ul class="nav-list onglets">
        ${ATELIERS.map(onglet).join('\n        ')}
        <li class="nav-creer">${C.btn(sections.creer.path, 'btn-primary btn-lg', sections.creer.icon, sections.creer.label, onCreer ? ' aria-current="page"' : '')}${C.btn(sections.monespace.path, 'btn-light btn-lg', 'circle-user', 'Mon espace client', onEspace ? ' aria-current="page"' : '')}<small>Le prix s’affiche avant de payer. Chaque site est vérifié avant sa mise en ligne.</small></li>
      </ul>
    </nav>
    <div class="header-actions">
      <a class="btn btn-primary header-creer" href="${sections.creer.path}"${onCreer ? ' aria-current="page"' : ''}>${icon(sections.creer.icon)}<span>${sections.creer.label}</span></a>
      <button class="theme-btn" type="button" aria-label="Passer en apparence sombre" aria-pressed="false"><svg class="t-soleil" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg><svg class="t-lune" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></button>
      <a class="btn-espace" href="${sections.monespace.path}"${onEspace ? ' aria-current="page"' : ''}>${icon('circle-user')}<span>Mon espace</span></a>
      <button class="burger" type="button" aria-controls="nav" aria-expanded="false" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

// ---------------------------------------------------------------- pied de page
function footer(p) {
  // la petite famille, assise sur le bord du pied de page
  const parade = ['bricou', 'mochi', 'fantome', 'gelee', 'chaton', 'nuage', 'dino', 'etoile'];
  // Une colonne de liens : un menu déroulant sur téléphone, ouvert d'office sur ordinateur (data-ordi, voir le script de fin de page)
  const col = (titre, liens) => `<details class="footer-col" data-ordi><summary><span class="footer-title">${titre}</span>${icon('chevron-down')}</summary><ul class="footer-links">
        ${liens}
      </ul></details>`;
  return `<footer class="site-footer">
  <div class="parade" aria-hidden="true">${parade.map((n, i) => `<span class="parade-m pm-${i}">${petit(n, { humeur: i % 3 === 1 ? 'ravi' : 'content' })}</span>`).join('')}</div>
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand" href="/">${logoMark({ id: 'lgf' })}<span class="brand-text"><strong>${brandName}</strong></span></a>
      <p>Un site internet vous rend visible, et c’est notre métier. Des prix affichés, quelqu’un qui vous répond. Depuis les Ardennes, pour des clients partout en France.</p>
      <ul class="footer-contact">
        <li><a href="${C.contactUrl}">${icon('message-circle')}Nous écrire</a></li>
        ${site.email ? `<li><a href="mailto:${site.email}">${icon('mail')}${site.email}</a></li>` : ''}
      </ul>
    </div>
    ${col('Votre site', `<li><a href="${sections.creer.path}">Créer mon site</a></li>
        <li><a href="${C.creerUrl()}">${C.ESSENTIEL.name}</a></li>
        <li><a href="${C.creerUrl({ type: C.BOUTIQUE_T.id })}">Option ${C.ECOMMERCE.name}</a></li>
        <li><a href="${sections.forfaits.path}">Voir les tarifs</a></li>`)}
    ${col('Être visible', `<li><a href="/pourquoi-un-site-internet/">Pourquoi avoir un site internet ?</a></li>
        <li><a href="/etre-visible-sur-google/">Être visible sur Google</a></li>
        <li><a href="${sections.seo.path}">Être trouvé sur Google : notre méthode</a></li>
        <li><a href="${TUTOS.HUB}">${esc(AT('ecole').label || 'Mes Tutos')} : l’aide en petits tutos</a></li>
        <li><a href="/lexique/">Lexique : les mots d’internet</a></li>`)}
    ${col('Votre métier', `${METIERS.slice(0, 6).map((m) => `<li><a href="/${m.slug}/">${m.nom}</a></li>`).join('')}
        ${METIERS.length > 6 ? `<li><a href="${sections.metiers.path}">Tous les métiers</a></li>` : ''}
        <li><a href="/creation-site-internet-ardennes/">Création de site dans les Ardennes</a></li>`)}
    ${col('Les Minis Monstres', `<li><a href="${AT('maison').path}">Le concept</a></li>
        <li><a href="${sections.liaalex.path}">Pourquoi les Minis Monstres ?</a></li>
        <li><a href="${sections.methode.path}">Pourquoi c’est moins cher</a></li>
        <li><a href="${sections.comparatif.path}">Comparatif avec les autres solutions</a></li>
        <li><a href="${sections.equipe.path}">Notre équipe</a></li>
        <li><a href="${sections.confiance.path}">Réalisations</a></li>
        <li><a href="${sections.accompagnement.path}">Accompagnement</a></li>`)}
    ${col('Aide', `<li><a href="/faq/">Questions fréquentes</a></li>
        <li><a href="/mon-espace/demo/">Essayer l’espace client</a></li>
        ${outilsOffre && outilsOffre.actif ? `<li><a href="${sections.espace.path}">Les outils de la bande</a></li>` : ''}
        <li><a href="${sections.documentation.path}">Documentation</a></li>
        <li><a href="/contact/">Contact</a></li>`)}
  </div>
  <div class="footer-bottom"><div class="container footer-bottom-in">
    <p><strong>© ${new Date().getFullYear()} ${site.name}</strong><span>Des sites internet pour être visible.</span></p>
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
// En bas de chaque page. Sur le site : on écrit sa question dans la barre et Cerise répond (includes/bulle-site.php).
// Plus de questions toutes faites sur le site : elles prenaient la place de la conversation (Alex, 25 novembre 2026).
// Dans l'espace client : on lui écrit, elle répond, aide à formuler la demande, la fait confirmer puis la transmet à Alex
// (voir main.js et includes/bulle.php). Aucun petit monstre ne modifie le site : c'est Alex qui fait les modifications.
function liaFlot() {
  const exemples = ['Comment demander une modification ?', 'Où sont mes factures ?', enService.outils ? 'Comment avoir plus d’avis Google ?' : 'Comment marche ma boutique ?', `Que comprend le forfait ${ABO.name} ?`];
  return `<div class="lia-flot" data-lia-flot hidden>
  <div class="lia-flot-panel" id="lia-panel" role="dialog" aria-label="Cerise, l’assistante automatique de la bande" hidden>
    <div class="lia-tete">${monster('coucou')}<p><strong>Cerise</strong><small>L’assistante automatique de la bande. Pour parler à Alex : <a href="${C.contactUrl}">page Contact</a>.</small></p><span class="lia-jetons" data-lia-jetons hidden></span><button type="button" class="lia-flot-fermer" aria-label="Fermer la bulle de Cerise">${icon('x')}</button></div>
    <div class="lia-fil" data-lia-fil aria-live="polite">
      <p class="lia-msg is-lia" data-lia-accueil="site">Coucou, moi c’est Cerise, de la bande des Minis Monstres ! Ici, on est une petite famille, et on crée des sites internet pour te rendre visible. Écris-moi ta question, je te réponds tout de suite !</p>
      <p class="lia-msg is-lia" data-lia-accueil="ok" hidden>Coucou ! Une question sur ton site ou ton espace ? Je suis là. Et pour une modification, c’est Bricou qui t’attend dans l’onglet Demandes !</p>
      <p class="lia-msg is-lia" data-lia-accueil="demo" hidden>Coucou ! Ici, c’est une démonstration : écris-moi comme un client, je te montre comment je réponds.</p>
      <p class="lia-msg is-lia" data-lia-accueil="attente" hidden>Coucou ! Je ne suis pas encore branchée dans cet espace. En attendant, écris ta demande dans l’onglet Demandes.</p>
      <p class="lia-msg is-lia" data-lia-accueil="abonnement" hidden>Coucou ! Je te réponds ici avec le forfait ${ABO.name}, dès qu’il a démarré. En attendant, écris ta demande dans l’onglet Demandes.</p>
    </div>
    <div class="lia-puces" data-lia-liens="espace" hidden>
      ${exemples.map((e) => `<button type="button" data-lia-ex>${e}</button>`).join('')}
    </div>
    <form class="lia-saisie" data-lia-form data-site-ajax="/wp-json/aled08/v1/bulle-site" hidden>
      <label class="sr-only" for="lia-champ">Ton message pour Cerise</label>
      <textarea id="lia-champ" rows="2" maxlength="${jetonsLia.bulle.max}" placeholder="Pose ta question à Cerise…" required></textarea>
      <button type="submit" aria-label="Envoyer à Cerise">${icon('send')}</button>
    </form>
    <p class="lia-note" data-lia-note-site hidden>Cerise répond automatiquement et peut se tromper. Pour une demande précise, <a href="${C.contactUrl}">écrivez-nous</a>.</p>
    <p class="lia-note" data-lia-note hidden><span data-lia-prix></span> Cerise répond automatiquement et peut se tromper. Elle ne touche pas à ton site. <button type="button" class="link-btn" data-lia-nouveau>Nouvelle conversation</button></p>
  </div>
  <p class="lia-flot-coucou" hidden><strong>Coucou, je suis là pour toi !</strong><small>Cerise, la secrétaire de la bande</small></p>
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
  const color = p.color || (p.section ? sections[p.section].color : 'mint');
  return `<!doctype html>
<html lang="fr" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titreCourt(p.title))}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${robots}">
<meta name="author" content="${esc(site.name)}">
<meta name="theme-color" content="#FFF8F2">
<meta name="color-scheme" content="light">
<script>(function(h){var t;try{t=localStorage.getItem('mm-theme')}catch(e){}h.setAttribute('data-theme',t==='dark'?'dark':'light')})(document.documentElement)</script>
<meta name="darkreader-lock">
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
<meta property="og:image:alt" content="${esc(`${site.name} : un site internet soigné et suivi, pour être visible`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titreCourt(p.title))}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="preload" href="/assets/fonts/jakarta-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${assetsVersion.css}">${(p.css || []).map((f) => `\n<link rel="stylesheet" href="/assets/css/${f}?v=${assetsVersion.css}">`).join('')}
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
<script>if(window.matchMedia&&matchMedia('(min-width:900px)').matches)document.querySelectorAll('details[data-ordi]').forEach(function(d){d.open=true})</script>
<script src="/assets/js/main.js?v=${assetsVersion.js}" defer></script>
</body>
</html>
`;
}

module.exports = { page, businessSchema, setAssetVersion };
