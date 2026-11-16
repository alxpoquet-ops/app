// ============================================================================
//  Alex & Lia : configuration centrale du site (identité, rubriques, l'offre unique :
//  création à 500 €, abonnement à 10 € par mois, options et extras, Jetons Lia,
//  fidélité, paiement). Tous les prix du site viennent d'ici : le configurateur, la page
//  /commander/, les données structurées et l'extension WordPress (data.json)
//  se mettent à jour au prochain build.
//  ⚠️  Les valeurs marquées « À REMPLACER » doivent être complétées avant la
//      mise en ligne (le build affiche un avertissement tant qu'elles restent).
// ============================================================================

const site = {
  // Domaine définitif (sans slash final). Sert aux balises canonical, au sitemap, à l'Open Graph.
  url: 'https://www.aled08.fr',
  name: 'Alex & Lia',
  baseline: 'Sites internet et SEO', // n'est plus affiché sous le logo
  legalName: 'Alex & Lia, nom commercial d’Alexandre Poquet EI', // raison sociale / nom commercial
  // Le jour où le domaine alexetlia.fr est pris : changer url ci-dessus et rediriger aled08.fr.
  futurDomaine: 'alexetlia.fr',
  owner: 'Alexandre Poquet',

  // Aucune coordonnée personnelle affichée : on écrit par le formulaire de contact (/contact/).
  // Quand une adresse de support existe (ex. support@alexetlia.fr), la mettre ici : elle s'affichera.
  email: '',
  contactPath: '/contact/',

  address: {
    street: '', // Optionnel : rue (laisser vide pour n'afficher que la commune)
    postalCode: '08460',
    city: "Signy-l'Abbaye",
    region: 'Grand Est',
    department: 'Ardennes',
    country: 'FR',
  },
  geo: { lat: 49.6996, lng: 4.4183 },

  // Informations légales : ⚠️ À REMPLACER
  legal: {
    status: 'Entreprise individuelle', // ex. : Entreprise individuelle (micro-entreprise)
    siret: 'en cours d’attribution', // ⚠️ À REMPLACER par le numéro dès réception
    tva: '', // ex. : 'TVA non applicable, art. 293 B du CGI' si vous êtes en franchise de TVA
    mediator: 'en cours de désignation, ses coordonnées seront indiquées ici', // ⚠️ À REMPLACER
    mediatorUrl: '',
    host: 'o2switch, 222-224 boulevard Gustave Flaubert, 63000 Clermont-Ferrand, 04 44 44 60 40, www.o2switch.fr',
    publicationDirector: 'Alexandre Poquet',
  },

  // Endpoint du formulaire. Par défaut : script PHP fourni (/envoi.php). Sous WordPress, le thème s'en charge.
  formAction: '/envoi.php',

  // Espace client : /mon-espace/ (connexion, sous WordPress) et sa démonstration /mon-espace/demo/.
  // ouvert: false affiche « ouvre bientôt » sur la page Outils.
  espaceClient: { ouvert: true, url: '/mon-espace/', demo: '/mon-espace/demo/' },

  social: {
    facebook: '',
    instagram: '',
  },
};

// ---------------------------------------------------------------- rubriques
// Chaque rubrique a sa couleur pastel : on la retrouve dans le menu et en haut de la page.
const sections = {
  creer: { path: '/creer-mon-site/', label: 'Créer mon site', color: 'mint', icon: 'wand-sparkles' },
  forfaits: { path: '/tarifs/', label: 'Tarifs', color: 'lilac', icon: 'tag' },
  espace: { path: '/outils/', label: 'Outils', color: 'sky', icon: 'toolbox' },
  seo: { path: '/referencement-seo/', label: 'SEO', color: 'butter', icon: 'search-check' },
  contact: { path: '/contact/', label: 'Contact', color: 'peach', icon: 'message-circle' },
  confiance: { path: '/ils-nous-ont-fait-confiance/', label: 'Ils nous ont fait confiance', color: 'butter', icon: 'handshake' },
  liaalex: { path: '/lia-et-alex/', label: 'Lia et Alex', color: 'pink', icon: 'sparkles' },
  guides: { path: '/guides/', label: 'Guides', color: 'sky', icon: 'book-open' },
  documentation: { path: '/documentation/', label: 'Documentation', color: 'sky', icon: 'book-open' },
  lexique: { path: '/lexique/', label: 'Lexique', color: 'mint', icon: 'book-open' },
  // Hors du menu principal
  comparatif: { path: '/comparatif/', label: 'Comparatif', color: 'butter', icon: 'scale' },
  fidelite: { path: '/fidelite/', label: 'Fidélité', color: 'pink', icon: 'gift' },
  methode: { path: '/methode/', label: 'Ma méthode', color: 'lilac', icon: 'sparkles' },
  monespace: { path: '/mon-espace/', label: 'Mon espace', color: 'sky', icon: 'circle-user' },
  // Parcours de commande (pages noindex, hors menu et hors plan du site)
  commander: { path: '/commander/', label: 'Commander', color: 'mint', icon: 'shopping-bag' },
  confirmation: { path: '/commande-confirmee/', label: 'Commande confirmée', color: 'mint', icon: 'party-popper' },
};

// ---------------------------------------------------------------- l'offre : un seul prix
// Création du site : 500 €, quel que soit le site (une page ou plusieurs). Une boutique en ligne : + 200 €.
// Puis un abonnement obligatoire : 10 € par mois, sur lequel on ajoute ou on retire des extras quand on veut.
const creation = { prix: 500, boutique: 200 };
// Repères du marché pour la page Tarifs : prix publics relevés en France en novembre 2026 pour un site fait
// par un indépendant (sources dans docs/prix-et-ia-2026.md). À relire une fois par an.
// vitrine : site vitrine d'environ cinq pages. boutique : boutique en ligne simple. entretien : maintenance par mois.
// bas : les offres à bas prix qui existent aussi (on le dit, par transparence).
const marche = { vitrineMin: 1500, vitrineMax: 3000, boutiqueMin: 2000, boutiqueMax: 6000, entretienMin: 60, entretienMax: 200, basMin: 400, basMax: 1300, fois: '4 à 5' };

// ---------------------------------------------------------------- types de site (même prix, sauf la boutique)
const types = [
  {
    id: 'une-page',
    name: 'Une page',
    label: 'Site une page',
    color: 'sky',
    icon: 'layout-template',
    price: creation.prix,
    delai: '3 à 5 jours',
    pitch: 'Une seule page qu’on fait défiler, comme une grande carte de visite : qui vous êtes, ce que vous faites, vos horaires, comment vous joindre.',
    qui: 'Pour démarrer, ou pour être simplement trouvé et joignable.',
    ideal: 'idéal pour démarrer, une carte de visite sur internet',
    pourQui: 'Pour vous si vous démarrez, si votre activité se présente en quelques lignes, ou si vous voulez surtout être trouvé et joignable. Par exemple : artisan, indépendant, association, événement.',
    inclus: ['Une page en plusieurs parties', 'Formulaire de contact', 'Parfait sur téléphone', 'Bases du SEO'],
  },
  {
    id: 'vitrine',
    name: 'Site vitrine',
    label: 'Site vitrine',
    color: 'butter',
    icon: 'layout-grid',
    price: creation.prix,
    delai: '1 à 2 semaines',
    pitch: 'Plusieurs pages avec un menu : l’accueil, vos services, vos tarifs, qui vous êtes, le contact.',
    qui: 'Pour présenter plusieurs services. Le meilleur choix pour sortir sur Google.',
    ideal: 'idéal pour le référencement, avec une page par sujet',
    pourQui: 'Pour vous si vous proposez plusieurs services, ou si vous voulez bien sortir sur Google. Chaque page parle d’un sujet précis, et Google peut montrer chacune dans ses résultats : c’est le meilleur choix pour le référencement. Par exemple : entreprise, commerce, profession libérale.',
    inclus: ['Jusqu’à 5 pages', 'Menu clair sur téléphone', 'Formulaire de contact', 'SEO de chaque page'],
  },
  {
    id: 'boutique',
    name: 'Boutique en ligne',
    label: 'Boutique en ligne',
    color: 'pink',
    icon: 'shopping-bag',
    price: creation.prix + creation.boutique,
    supplement: creation.boutique, // l'option « boutique en ligne », ajoutée au prix unique
    info: 'Une page boutique avec vos produits, leurs photos et leurs prix, un panier et le paiement par carte. Vous recevez un e-mail à chaque commande et vous suivez vos ventes dans votre espace.',
    delai: '2 à 3 semaines',
    pitch: 'Un magasin sur internet : vos clients choisissent vos produits, paient par carte sur le site, et vous recevez la commande.',
    qui: 'Pour vendre vos produits sur internet, même quand votre magasin est fermé.',
    ideal: 'idéal pour vendre, avec le paiement par carte',
    pourQui: 'Pour vous si vous voulez vendre vos produits en ligne, même quand votre boutique est fermée. Par exemple : créateur, commerçant, producteur.',
    inclus: ['Jusqu’à 20 produits ajoutés par moi', 'Paiement par carte sécurisé', 'Commandes et stocks', 'Conditions de vente à compléter'],
  },
];

// ---------------------------------------------------------------- l'abonnement (un seul, obligatoire)
// En paiement annuel : 2 mois offerts.
// quota : modifications faites à la main par Alex, par mois. jetons : Jetons Lia donnés chaque mois.
// Les anciens forfaits (chico, power, titan) n'existent plus : un ancien client garde ce qu'il avait
// (power : extra SEO ; titan : extras SEO et chiffres détaillés), c'est géré dans l'extension WordPress.
const forfaits = [
  {
    id: 'base',
    name: 'Abonnement',
    color: 'pink',
    month: 10,
    quota: 1, // modifications par Alex, par mois
    jetons: 100, // Jetons Lia par mois
    partage: false,
    bulle: 'Tout ce qu’il faut pour que votre site tourne',
    modifs: '100 Jetons Lia et une modification par Alex, chaque mois',
    conseil: false,
    tagline: 'Obligatoire, sans engagement',
    pitch: 'Votre site en ligne, sûr et à jour, avec son nom de domaine, le support et 100 Jetons Lia chaque mois.',
    main: ['Nom de domaine et hébergement compris', 'Mises à jour, suivi et support', '100 Jetons Lia et une modification par Alex, chaque mois'],
    details: ['Nom de domaine relié à votre site et renouvelé chaque année, à votre nom', 'Hébergement sur un serveur de qualité', 'HTTPS : le petit cadenas qui protège vos visiteurs', 'Mises à jour faites pour vous, et sauvegardes', 'Suivi : le site est surveillé, il tient quand il y a du monde', 'Support : une question, une réponse sous 72 heures', 'Formulaire de contact qui arrive dans votre boîte mail', 'Bases du SEO : Google sait lire et comprendre votre site', '100 Jetons Lia chaque mois, pour les modifications par Lia et les outils de l’espace client', 'Une modification par Alex chaque mois, faite et vérifiée à la main', 'Votre espace client : demandes, outils, suivi et parrainage', 'Sans engagement : vous arrêtez quand vous voulez'],
    features: ['Nom de domaine relié et renouvelé', 'Hébergement sur un serveur de qualité', 'Mises à jour, sauvegardes et HTTPS', 'Suivi du site et support sous 72 heures', 'Bases du SEO : Google sait lire votre site', '100 Jetons Lia chaque mois', 'Une modification par Alex chaque mois', 'Votre espace client et ses outils'],
  },
];
const annuel = { moisOfferts: 2 };
// Prix du site payable en 6 ou 12 fois sans frais (engagement le temps du paiement ; sinon, aucun engagement).
// Le paiement en plusieurs fois se fait au mois : l'abonnement passe alors au mois.
const lissage = { durees: [6, 12] };
// Délai de réponse aux demandes de modification (le même pour tous).
const delais = { reponse: '72 heures', titan: '72 heures' };

// ---------------------------------------------------------------- options et extras
// quand : 'creation' = payé une fois, à la création du site ; 'mois' = extra de l'abonnement, activable et désactivable.
// price : { once } pour un paiement unique, { month } pour un paiement mensuel.
// types : réservé à ces types de site (ex. ['boutique']) ; absent = tous les sites.
// court : la version en une ligne, pour le configurateur. desc : la description complète, pour la page Tarifs.
// info : ce que l'option ajoute, montré par le petit « i », avec sa capture d'exemple (src/assets/img/options/<id>.webp,
// fabriquée par scripts/captures-options.js).
const options = [
  { id: 'en', quand: 'creation', group: 'site', name: 'Traduction en anglais', icon: 'languages', price: { once: 100 }, court: 'Avec un bouton pour changer de langue.', info: 'Chaque page existe aussi en anglais, relue à la main. Un bouton en haut du site passe d’une langue à l’autre, et Google peut montrer la version anglaise aux visiteurs étrangers.', desc: 'Votre site traduit en anglais et relu, avec un bouton pour changer de langue. Pour les touristes et les clients venus d’ailleurs.' },
  { id: 'rdv', quand: 'creation', group: 'site', name: 'Prise de rendez-vous', icon: 'calendar-check', price: { once: 100 }, court: 'Vos clients réservent un créneau en ligne.', info: 'Une page avec vos créneaux libres. Le client choisit son jour et son heure, reçoit une confirmation, et vous êtes prévenu par e-mail. Vous ouvrez et fermez les créneaux vous-même.', desc: 'Vos clients réservent un créneau sur votre site, selon vos disponibilités. Vous recevez un e-mail à chaque réservation.' },
  { id: 'reprise', quand: 'creation', group: 'site', name: 'Reprise de votre ancien site', icon: 'refresh-cw', price: { once: 100 }, court: 'On garde vos textes, photos et adresses.', info: 'Je récupère les textes, les photos et les adresses des pages de votre ancien site, et je les remets au propre. Les anciens liens mènent au bon endroit : vous gardez votre place sur Google.', desc: 'Vos textes, vos photos et vos adresses de pages repris de l’ancien site, pour garder votre place sur Google.' },
  { id: 'pages', quand: 'creation', group: 'site', name: 'Cinq pages de plus', icon: 'layers', price: { once: 100 }, types: ['vitrine', 'boutique'], court: 'Cinq pages en plus des cinq comprises.', info: 'Votre site passe de cinq à dix pages : une page par service, par produit phare ou par événement. Chaque page utile est une chance de plus d’être trouvé sur Google.', desc: 'Pour un site plus grand : cinq pages en plus des cinq comprises.' },
  { id: 'seo', quand: 'mois', group: 'site', name: 'SEO suivi', icon: 'search-check', price: { month: 10 }, court: 'Je travaille votre place sur Google, chaque mois.', info: 'Chaque mois, je suis les mots que tapent vos clients, je retouche vos pages pour les aider à monter sur Google, et vous recevez un rapport simple : votre place pour chaque mot et les visites venues de Google.', desc: 'Chaque mois, je regarde les mots que vos clients tapent, j’améliore vos pages pour Google et je vous montre où vous en êtes.' },
  { id: 'liaplus', quand: 'mois', group: 'site', name: 'Lia +', icon: 'sparkles', price: { month: 5 }, court: '500 Jetons Lia en plus chaque mois.', info: '500 jetons de plus chaque mois, soit 600 en tout : de quoi faire jusqu’à une vingtaine de modifications par Lia, ou une cinquantaine de textes avec les outils.', desc: '500 Jetons Lia en plus chaque mois, pour ceux qui changent souvent leur site ou publient beaucoup.' },
  { id: 'stats', quand: 'mois', group: 'site', name: 'Chiffres détaillés', icon: 'chart-line', price: { month: 5 }, court: 'Visiteurs, provenance et ventes, heure par heure.', info: 'Le tableau de bord complet : la courbe de vos visites, les appareils, d’où viennent vos visiteurs, vos ventes, et un rapport chaque mois.', desc: 'Votre site heure par heure : visiteurs, pages vues, provenance, ventes. Et un rapport simple chaque mois.' },
  { id: 'mail', quand: 'mois', group: 'site', name: 'Adresse e-mail pro', icon: 'at-sign', price: { month: 3 }, court: 'Une adresse comme contact@votreboite.fr.', info: 'Une vraie boîte à votre nom, comme contact@votreboite.fr, sur votre téléphone et votre ordinateur. Je la crée et je vous envoie les réglages.', desc: 'Une adresse comme contact@votreboite.fr, sur votre téléphone et votre ordinateur.' },
  { id: 'stock', quand: 'mois', group: 'site', name: 'Gestion du stock', icon: 'warehouse', price: { month: 5 }, types: ['boutique'], court: 'Le stock se décompte à chaque vente.', info: 'Vous indiquez combien vous avez de chaque produit. Le stock baisse tout seul à chaque vente, le site affiche « Plus que 2 » quand il en reste peu, puis « Épuisé » à zéro.', desc: 'Le stock de votre commerce se décompte tout seul à chaque vente. Vous savez toujours ce qu’il reste.' },
  { id: 'comptes', quand: 'mois', group: 'site', name: 'Comptes clients', icon: 'users', price: { month: 5 }, types: ['boutique'], court: 'Vos clients gardent commandes, adresses et favoris.', info: 'Vos clients se créent un compte : ils retrouvent leurs commandes, leurs adresses et leurs produits favoris, et recommandent en un clic.', desc: 'Vos clients se créent un compte sur votre site : commandes passées, adresses et favoris gardés.' },
];

// ---------------------------------------------------------------- fidélité et paiement
const fidelite = { parrainageMois: 1, remiseSecondSite: 10 };
const paiement = { acompte: 25 }; // 25 % à la commande ; à la réception : le reste (en une fois, ou en 6 / 12 fois sans frais) et l'abonnement démarre

// ---------------------------------------------------------------- Jetons Lia
// 1 Jeton Lia = 1 centime. Les jetons paient ce que fait Lia : les modifications du site et les outils.
// Règle de prix : ce que Lia me coûte (Claude) × margeOutils pour les outils, × margeLia pour les modifications.
// modif : prix d'une modification par Lia = base + 1 jeton par tranche de `mots` mots écrits + `image` par photo jointe.
// recharge : jetons en plus, à l'unité, ajoutés à la prochaine facture. liaplus : jetons de l'option Lia +, chaque mois.
const jetonsLia = {
  valeur: 0.01,
  margeOutils: 4,
  margeLia: 2,
  modif: { base: 30, mots: 10, image: 10 },
  recharge: [{ jetons: 100, prix: 1 }, { jetons: 500, prix: 5 }, { jetons: 1000, prix: 10 }],
  liaplus: 500,
  // La bulle de Lia, en bas de l'espace client : on lui écrit, elle répond et prépare l'action à valider.
  // jetons : prix d'un message (avec le modèle rapide ; l'extension le recalcule si on change de modèle).
  // parJour : messages par jour et par client. max : longueur d'un message.
  bulle: { jetons: 1, parJour: 40, max: 600 },
};

// Boost : une modification par Alex en plus de celle du mois, à l'unité, ajoutée à la prochaine facture.
const boost = { prix: 5 };
// ---------------------------------------------------------------- sites réalisés (page « Ils nous ont fait confiance »)
// Uniquement de vrais clients, avec leur accord. desc : une phrase factuelle, pas d'avis inventé.
const clients = [
  { nom: 'Flore et Chenilles', domaine: 'floreetchenilles.fr', url: 'https://www.floreetchenilles.fr/', sitemap: 'https://www.floreetchenilles.fr/sitemap_index.xml', forfait: 'base', genre: 'Boutique en ligne', icon: 'shopping-bag', color: 'mint', desc: 'Des fleurs éternelles en fil chenille, faites main à Signy-l’Abbaye, dans les Ardennes. La boutique ouvre très bientôt.' },
  { nom: 'Dodedo', domaine: 'dodedo.fr', url: 'https://dodedo.fr/', sitemap: 'https://www.dodedo.fr/sitemap.xml', forfait: 'base', genre: 'Site une page', icon: 'hand-heart', color: 'lilac', desc: 'Le site de Dominique Schneider, magnétiseur et barreur de feu. Une seule page principale, et des pages de conseils autour pour le référencement.' },
  { nom: 'Alex & Lia', domaine: 'alexetlia.fr', url: '/', sitemap: 'https://www.aled08.fr/wp-sitemap.xml' /* à passer sur https://www.alexetlia.fr/wp-sitemap.xml au changement de domaine */, genre: 'Notre propre site', icon: 'sparkles', color: 'lilac', desc: 'Notre site à nous : on se fait confiance, alors on se met dedans aussi. En français et en anglais.' },
  { nom: 'Les Notes du Temps', domaine: 'lesnotesdutemps.fr', url: 'https://www.lesnotesdutemps.fr/', sitemap: 'https://www.lesnotesdutemps.fr/sitemap.xml', forfait: 'base', genre: 'Site une page', icon: 'music', color: 'peach', enCreation: true, desc: '' },
  { nom: 'ALED08', domaine: 'aled08.fr', url: 'https://www.aled08.fr/', forfait: '', genre: 'Site vitrine', icon: 'zap', color: 'butter', enCreation: true, desc: '' },
];

module.exports = { clients, site, sections, types, forfaits, annuel, lissage, delais, options, fidelite, paiement, boost, jetonsLia, creation, marche };
