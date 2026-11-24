// Gabarit commun : <head>, en-tête, pied de page, données structurées
const { site, sections, types, forfaits, creation, jetonsLia, enService, fractionne, creationSeule, ateliers, outilsOffre } = require('../config');
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
    slogan: `Un site internet pour être visible, dès ${creation.prix} €`,
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
// La maison et ses ateliers (décision d'Alex, 24 novembre 2026) : un grand onglet par atelier non caché (config.ateliers),
// avec l'image de son monstre. « La maison » et « Les sites » ouvrent un petit menu avec leurs pages.
// L'onglet en surbrillance : posé ici à la construction, puis recalculé par le script du site (sous WordPress, l'en-tête
// est le même pour toutes les pages : data-chemins dit quelles pages appartiennent à quel atelier).
// Sur téléphone : chaque atelier est une carte, ses pages en petits boutons avec icône, et « Créer mon site » tout en bas.
const ATELIERS = ateliers.filter((a) => !a.cache && (a.id !== 'outils' || (outilsOffre && outilsOffre.actif)));
// Mini Tuto : les thèmes qui ont au moins un tuto (voir TUTOS dans src/lib/components.js), puis les guides gratuits
const TUTOS = C.TUTOS;
const lien = (k) => ({ path: sections[k].path, label: sections[k].label, icon: sections[k].icon, color: sections[k].color });
const AT = (id) => ateliers.find((a) => a.id === id) || {};
const SOUS_MENU = {
  maison: [{ path: AT('maison').path, label: 'Le concept', icon: 'house', color: 'lilac' }, lien('equipe'), lien('liaalex'), lien('contact')],
  sites: ['creer', 'forfaits', 'seo', 'confiance', 'metiers', 'accompagnement'].map(lien),
  ecole: [
    { path: TUTOS.HUB, label: 'Tous les tutos', icon: 'book-open', color: 'lilac' },
    ...TUTOS.themes().map((g) => ({ path: `${TUTOS.HUB}#${g.id}`, label: g.titre, icon: g.icon, color: g.color })),
    ...(TUTOS.guides.length ? [{ path: `${TUTOS.HUB}#guides`, label: 'Nos guides gratuits', icon: 'gift', color: 'sky' }] : []),
  ],
};
const prixOutilMin = outilsOffre ? Math.min(...outilsOffre.outils.filter((o) => o.statut === 'pret').map((o) => o.prix)) : 0;
const DESC_ATELIER = {
  maison: 'Le concept, Alex et la bande',
  sites: `Votre site, dès ${creation.prix} €`,
  outils: outilsOffre ? `Dès ${C.euro(prixOutilMin)} par mois, ${outilsOffre.essaiJours} jours gratuits` : '',
  ecole: (C.TUTOS.offre && C.TUTOS.offre.slogan) || 'Des tutos clairs et complets',
};
// Les pages rattachées à chaque atelier, en plus de celles de son menu (pour savoir quel onglet allumer)
const RATTACHE = {
  maison: ['/faq/'],
  sites: ['/commander/', '/commande-confirmee/', '/etre-visible-sur-google/', '/pourquoi-un-site-internet/', '/creation-site-internet-ardennes/', '/lexique/', '/comparatif/', '/pourquoi-moins-cher/', '/fidelite/', ...METIERS.map((m) => `/${m.slug}/`)],
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
  const actif = atelierDe(currentPath);
  const onglet = (a) => {
    const sous = SOUS_MENU[a.id] || [];
    const on = a.id === actif;
    const cur = on ? ` aria-current="${a.path === currentPath ? 'page' : 'true'}"` : '';
    return `<li class="onglet-li c-${a.color}${on ? ' is-on' : ''}" data-chemins="${cheminsDe(a).join(' ')}">
          <div class="onglet-tete"><a class="onglet" href="${a.path}"${cur}>${imgMonstre(a.monstre, 32, 'onglet-img')}<span class="onglet-txt">${esc(a.label)}<small>${esc(DESC_ATELIER[a.id] || a.court || '')}</small></span>${icon('chevron-right')}</a>${sous.length ? `<button class="onglet-plus" type="button" aria-expanded="false" aria-controls="sm-${a.id}"><span class="sr-only">Les pages : ${esc(a.label)}</span>${icon('chevron-down')}</button>` : ''}</div>
          ${sous.length ? `<ul class="sous-menu${sous.length > 5 ? ' is-long' : ''}" id="sm-${a.id}">${sous.map((s) => `<li><a class="nav-link sous-lien c-${s.color}" href="${s.path}"${currentPath === s.path ? ' aria-current="page"' : ''}>${icon(s.icon)}<span>${esc(s.label)}</span></a></li>`).join('')}</ul>` : ''}
        </li>`;
  };
  return `<a class="skip" href="#contenu">Aller au contenu</a>
<header class="site-header">
  <div class="container header-in">
    <a class="brand" href="/" aria-label="${site.name}, accueil">${logoMark({ id: 'lgh' })}<span class="brand-text"><strong>${brandName}</strong></span></a>
    <nav class="nav" id="nav" aria-label="Navigation principale">
      <ul class="nav-list onglets">
        ${ATELIERS.map(onglet).join('\n        ')}
        <li class="nav-creer"><span class="nav-creer-art" aria-hidden="true">${petit('mochi', { humeur: 'ravi' })}</span>${C.btn(sections.creer.path, 'btn-primary btn-lg', sections.creer.icon, sections.creer.label, onCreer ? ' aria-current="page"' : '')}<small>Pour être visible. Le prix s’affiche tout de suite.</small><a class="nav-demo" href="/mon-espace/demo/">${icon('eye')}<span>Essayer l’espace client en démo</span></a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <button class="theme-btn" type="button" aria-label="Passer en apparence sombre" aria-pressed="false"><svg class="t-soleil" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg><svg class="t-lune" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></button>
      <a class="btn-espace" href="${sections.monespace.path}"${currentPath.startsWith(sections.monespace.path) ? ' aria-current="page"' : ''}>${icon('circle-user')}<span>Mon espace</span></a>
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
        <li><a href="${TUTOS.HUB}">Mini Tuto : les tutos</a></li>
        <li><a href="/lexique/">Lexique : les mots d’internet</a></li>`)}
    ${col('Votre métier', `${METIERS.map((m) => `<li><a href="/${m.slug}/">${m.nom}</a></li>`).join('')}
        <li><a href="/creation-site-internet-ardennes/">Création de site dans les Ardennes</a></li>`)}
    ${col('Les Minis Monstres', `<li><a href="${AT('maison').path}">Le concept de la maison</a></li>
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
// En bas de chaque page. Sur le site : Cerise répond tout de suite à quelques questions (réponses écrites ici, sans appel au modèle).
// Dans l'espace client : on lui écrit, elle répond, aide à formuler la demande, la fait confirmer puis la transmet à Alex
// (voir main.js et includes/bulle.php). Aucun petit monstre ne modifie le site : c'est Alex qui fait les modifications.
function liaFlot() {
  const eur = C.euro;
  const questions = [
    ['À quoi sert un site ?', 'À être visible, tout simplement ! Sans site internet, ton activité est comme une jolie vitrine dans une rue où personne ne passe. Avec un site, tes futurs clients te trouvent, sur Google comme sur leur téléphone. Te rendre visible, c’est notre métier à nous, la petite bande !', sections.seo.path, 'Être trouvé sur Google'],
    ['C’est combien ?', `Bonne nouvelle : tu paies ton site une seule fois ! Le ${C.ESSENTIEL.name}, ${eur(C.ESSENTIEL.price)}, et ${eur(C.ECOMMERCE.prix)} de plus avec l’option ${C.ECOMMERCE.name} pour vendre en ligne. Tu peux payer en ${fractionne.fois} fois avec ${fractionne.organismes}. Ensuite, c’est toi qui choisis : le forfait ${AUTO.name}, ${eur(AUTO.month)} par mois, tu gères tout toi-même. Ou le forfait ${ABO.name}, ${eur(ABO.month)} par mois sans engagement, et on s’occupe de tout (${eur(ABO.month + (ABO.domaine || 0))} si on te fournit le nom de domaine).`, sections.forfaits.path, 'Voir les tarifs'],
    ['Quel site choisir ?', `Facile, il n’y en a qu’un : le ${C.ESSENTIEL.name} ! On l’assemble avec nos modules déjà prêts, et on le remplit avec tes infos et tes photos. Tu vends en ligne ? Coche l’option ${C.ECOMMERCE.name}. Et pour grandir sur Google, des pages à ${eur(C.prixPageSeo)}, quand tu veux.`, sections.creer.path, 'Créer mon site'],
    ['Qui fait mon site ?', 'C’est Alex ! Il conçoit ton site et vérifie tout. Et nous, sa petite bande, on l’aide chacun à notre façon. Moi, je suis Cerise : je réponds à tes questions avec le sourire.', sections.equipe.path, 'Rencontrer la bande'],
    ['Et pour changer mon site après ?', `Avec le forfait ${ABO.name}, tes modifications sont incluses, youpi ! Tu écris ta demande dans ton espace client, ${C.BRICOU} la clarifie avec toi, et Alex fait la modification.`, sections.accompagnement.path, 'L’accompagnement'],
  ];
  const exemples = ['Comment demander une modification ?', 'Où sont mes factures ?', enService.outils ? 'Comment avoir plus d’avis Google ?' : 'Comment marche ma boutique ?', `Que comprend le forfait ${ABO.name} ?`];
  return `<div class="lia-flot" data-lia-flot hidden>
  <div class="lia-flot-panel" id="lia-panel" role="dialog" aria-label="Cerise, l’assistante automatique de la bande" hidden>
    <div class="lia-tete">${monster('coucou')}<p><strong>Cerise</strong><small>L’assistante automatique de la bande. Pour parler à Alex : <a href="${C.contactUrl}">page Contact</a>.</small></p><span class="lia-jetons" data-lia-jetons hidden></span><button type="button" class="lia-flot-fermer" aria-label="Fermer la bulle de Cerise">${icon('x')}</button></div>
    <div class="lia-fil" data-lia-fil aria-live="polite">
      <p class="lia-msg is-lia" data-lia-accueil="site">Coucou, moi c’est Cerise, de la bande des Minis Monstres ! Ici, on est une petite famille, et on crée des sites internet pour te rendre visible. Choisis une question, ou écris-moi la tienne !</p>
      <p class="lia-msg is-lia" data-lia-accueil="ok" hidden>Coucou ! Une question sur ton site ou ton espace ? Je suis là. Et pour une modification, c’est Bricou qui t’attend dans l’onglet Demandes !</p>
      <p class="lia-msg is-lia" data-lia-accueil="demo" hidden>Coucou ! Ici, c’est une démonstration : écris-moi comme un client, je te montre comment je réponds.</p>
      <p class="lia-msg is-lia" data-lia-accueil="attente" hidden>Coucou ! Je ne suis pas encore branchée dans cet espace. En attendant, écris ta demande dans l’onglet Demandes.</p>
      <p class="lia-msg is-lia" data-lia-accueil="abonnement" hidden>Coucou ! Je te réponds ici avec le forfait ${ABO.name}, dès qu’il a démarré. En attendant, écris ta demande dans l’onglet Demandes.</p>
    </div>
    <div class="lia-puces" data-lia-liens="site">
      ${questions.map(([q], i) => `<button type="button" data-lia-q="${i}">${q}</button>`).join('')}
      <a href="${C.contactUrl}">Nous écrire</a>
    </div>
    <div hidden>${questions.map(([, r, href, label], i) => `<p data-lia-r="${i}">${r} <a href="${href}">${label}</a></p>`).join('')}</div>
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
<meta property="og:image:alt" content="${esc(`${site.name} : un site internet pour être visible, dès ${creation.prix} €`)}">
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
<script>if(window.matchMedia&&matchMedia('(min-width:900px)').matches)document.querySelectorAll('details[data-ordi]').forEach(function(d){d.open=true})</script>
<script src="/assets/js/main.js?v=${assetsVersion.js}" defer></script>
</body>
</html>
`;
}

module.exports = { page, businessSchema, setAssetVersion };
