// ============================================================================
//  ALED08 : configuration centrale du site (identité, rubriques, types de site,
//  forfaits Chico / Power / Titan et leurs quotas, options, délais, fidélité,
//  paiement). Tous les prix du site viennent d'ici : le configurateur, la page
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
  forfaits: { path: '/forfaits/', label: 'Forfaits', color: 'lilac', icon: 'heart' },
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

// ---------------------------------------------------------------- types de site (création, prix fixe)
const types = [
  {
    id: 'une-page',
    name: 'Une page',
    label: 'Site une page',
    color: 'sky',
    icon: 'layout-template',
    price: 250,
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
    price: 350,
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
    price: 500,
    delai: '2 à 3 semaines',
    pitch: 'Un magasin sur internet : vos clients choisissent vos produits, paient par carte sur le site, et vous recevez la commande.',
    qui: 'Pour vendre vos produits sur internet, même quand votre magasin est fermé.',
    ideal: 'idéal pour vendre, avec le paiement par carte',
    pourQui: 'Pour vous si vous voulez vendre vos produits en ligne, même quand votre boutique est fermée. Par exemple : créateur, commerçant, producteur.',
    inclus: ['Jusqu’à 20 produits ajoutés par moi', 'Paiement par carte sécurisé', 'Commandes et stocks', 'Conditions de vente à compléter'],
  },
];

// ---------------------------------------------------------------- forfaits mensuels (un petit monstre chacun)
// En paiement annuel : 2 mois offerts sur le forfait.
// quota : nombre de demandes de modification par mois dans l'espace client.
// Un seul compteur : chaque forfait donne des modifications par mois, et pour chacune le client choisit qui la fait :
//  - Lia (l'IA) : en 5 minutes, avec un aperçu à valider par le client (pas de validation par Alex) ;
//  - Alex (l'humain) : à la main, sous 72 heures.
// quota = modifications par mois ; jetons = quota et partage = true (compteur commun Lia + Alex).
// Lia fait la modification en 5 minutes et montre l'aperçu à confirmer ; Alex répond sous 72 heures, à la main.
const forfaits = [
  {
    id: 'chico',
    name: 'Chico',
    color: 'mint',
    month: 5,
    quota: 1, // modifications par Alex, par mois
    jetons: 100, // Jetons Lia par mois
    partage: false,
    bulle: 'Le forfait de base pour faire tourner votre site',
    modifs: '100 Jetons Lia et une modification par Alex, chaque mois',
    tagline: 'L’essentiel',
    pitch: 'Votre site en ligne, sûr et à jour, sur un serveur de qualité. 100 Jetons Lia et une modification par Alex, chaque mois.',
    main: ['Site hébergé, sécurisé et tenu à jour', 'Nom de domaine compris', '100 Jetons Lia et une modification par Alex, chaque mois'],
    details: ['Hébergement sur un serveur de qualité', 'Nom de domaine relié à votre site et renouvelé chaque année (liaison OVH)', 'HTTPS : le petit cadenas qui protège vos visiteurs', 'Mises à jour des extensions, faites pour vous', 'Formulaire de contact qui arrive dans votre boîte mail', 'Gestion du flux de visites : le site tient quand il y a du monde', 'Bases du SEO : Google sait lire et comprendre votre site', '100 Jetons Lia et une modification par Alex, chaque mois', 'Vos Jetons Lia servent aux modifications par Lia et aux outils de l’espace client', 'Lia, en 5 minutes, pour les petites et moyennes modifications : elle vous montre l’aperçu de la page et attend votre accord', 'Alex, sous 72 heures, pour les plus grandes : fait et vérifié à la main', 'Votre espace client : demandes, suivi et parrainage', 'Sans engagement : vous arrêtez quand vous voulez'],
    features: ['Hébergement sur un serveur de qualité', 'Nom de domaine relié et renouvelé', 'Mises à jour des extensions', 'Formulaire de contact et HTTPS', 'Gestion du flux de visites', 'Bases du SEO : Google sait lire votre site', '100 Jetons Lia et une modification par Alex, chaque mois'],
  },
  {
    id: 'power',
    name: 'Power',
    color: 'lilac',
    month: 15,
    quota: 2, // modifications par Alex, par mois
    jetons: 250, // Jetons Lia par mois
    partage: false,
    bulle: 'Pour être trouvé sur Google et faire vivre votre site',
    modifs: '250 Jetons Lia et deux modifications par Alex, chaque mois',
    conseil: true,
    tagline: 'Pour être trouvé',
    pitch: 'Tout Chico, plus le SEO : je fais remonter votre site sur Google. Serveur plus rapide, support et modifications rapides.',
    main: ['Tout ce que comprend Chico', 'Le SEO : votre site monte sur Google', '250 Jetons Lia et deux modifications par Alex, chaque mois'],
    details: ['Tout ce que comprend Chico, et en plus :', 'Le SEO suivi chaque mois : je choisis avec vous les mots que vos clients tapent et je fais monter votre site', 'Des pages utiles pour le référencement, qui renvoient vers votre site (jamais des pages inutiles)', 'Un serveur plus rapide, pour accueillir plus de visites', 'Un support rapide quand vous avez une question', '250 Jetons Lia et deux modifications par Alex, chaque mois'],
    features: ['Tout ce que comprend Chico', 'SEO : je fais remonter votre site sur Google, chaque mois', 'Serveur plus rapide, pour plus de visites', 'Support rapide', '250 Jetons Lia et deux modifications par Alex, chaque mois'],
  },
  {
    id: 'titan',
    name: 'Titan',
    color: 'peach',
    month: 30,
    quota: 2, // modifications par Alex, par mois
    jetons: 600, // Jetons Lia par mois
    partage: false,
    bulle: 'Pour suivre votre site et vos ventes de près',
    modifs: '600 Jetons Lia et deux modifications par Alex, chaque mois',
    conseil: false,
    tagline: 'Le meilleur',
    pitch: 'Tout Power, plus le retour de vos ventes et de vos chiffres chaque mois, et 600 Jetons Lia chaque mois.',
    main: ['Tout ce que comprend Power', 'Votre site heure par heure : visiteurs, ventes, serveur', '600 Jetons Lia et deux modifications par Alex, chaque mois'],
    details: ['Tout ce que comprend Power, et en plus :', 'Votre site heure par heure : visiteurs, pages vues, appareils, provenance, mémoire et charge du serveur, mis à jour toutes les heures', 'Un rapport chaque mois : vos ventes, vos visites et vos chiffres, expliqués simplement', '600 Jetons Lia et deux modifications par Alex, chaque mois', 'Avec Alex, réponse sous 24 heures'],
    features: ['Tout ce que comprend Power', 'Votre site heure par heure : visiteurs, ventes, serveur', 'Retour de vos ventes et de vos chiffres chaque mois', '600 Jetons Lia et deux modifications par Alex, chaque mois'],
  },
];
const annuel = { moisOfferts: 2 };
// Prix du site payable en 6 ou 12 fois sans frais (engagement le temps du paiement ; sinon, aucun engagement).
// Le paiement en plusieurs fois se fait au mois : le forfait passe alors au mois.
const lissage = { durees: [6, 12] };
// Délai de réponse aux demandes de modification.
const delais = { reponse: '72 heures', titan: '24 heures' };

// ---------------------------------------------------------------- options (activables plus tard)
// price : { once } pour un paiement unique, { month } pour un paiement mensuel.
// types : réservée à ces types de site (ex. ['boutique']) ; absent = tous les sites.
const options = [
  { id: 'mail', group: 'site', name: 'Adresse e-mail pro', icon: 'at-sign', price: { month: 3 }, desc: 'Une adresse comme contact@votreboite.fr, sur votre téléphone et votre ordinateur.' },
  { id: 'en', group: 'site', name: 'Traduction en anglais', icon: 'languages', price: { once: 50 }, desc: 'Votre site traduit en anglais et relu, pour les touristes et les clients venus d’ailleurs.' },
  { id: 'stock', group: 'site', name: 'Gestion du stock', icon: 'warehouse', price: { month: 5 }, types: ['boutique'], desc: 'Le stock de votre commerce se décompte tout seul à chaque vente. Vous savez toujours ce qu’il reste.' },
  { id: 'liaplus', group: 'site', name: 'Lia +', icon: 'sparkles', price: { month: 5 }, desc: '500 Jetons Lia en plus chaque mois, pour ceux qui changent souvent leur site ou publient beaucoup.' },
  { id: 'comptes', group: 'site', name: 'Comptes clients', icon: 'users', price: { month: 5 }, types: ['boutique'], desc: 'Vos clients se créent un compte sur votre site : commandes passées, adresses et favoris gardés.' },
];

// ---------------------------------------------------------------- fidélité et paiement
const fidelite = { parrainageMois: 1, remiseSecondSite: 10 };
const paiement = { acompte: 25 }; // 25 % à la commande ; à la réception : le reste (en une fois, ou en 6 / 12 fois sans frais) et le forfait démarre

// ---------------------------------------------------------------- Jetons Lia
// 1 Jeton Lia = 1 centime. Les jetons paient ce que fait Lia : les modifications du site et les outils.
// Règle de prix : ce que Lia me coûte (Claude) × margeOutils pour les outils, × margeLia pour les modifications.
// modif : prix d'une modification par Lia = base + 1 jeton par tranche de `mots` mots écrits + `image` par photo jointe.
// recharge : jetons en plus, à l'unité, ajoutés à la prochaine facture. liaplus : jetons de l'option Lia +, chaque mois.
const jetonsLia = {
  valeur: 0.01,
  margeOutils: 1.5,
  margeLia: 2,
  modif: { base: 30, mots: 10, image: 10 },
  recharge: [{ jetons: 100, prix: 1 }, { jetons: 500, prix: 5 }, { jetons: 1000, prix: 10 }],
  liaplus: 500,
};

// Boost : une modification en plus du forfait, à l'unité, ajoutée à la prochaine facture.
const boost = { prix: 1 };
// ---------------------------------------------------------------- sites réalisés (page « Ils nous ont fait confiance »)
// Uniquement de vrais clients, avec leur accord. desc : une phrase factuelle, pas d'avis inventé.
const clients = [
  { nom: 'Flore et Chenilles', domaine: 'floreetchenilles.fr', url: 'https://www.floreetchenilles.fr/', sitemap: 'https://www.floreetchenilles.fr/sitemap_index.xml', forfait: 'titan', genre: 'Boutique en ligne', icon: 'shopping-bag', color: 'mint', desc: 'Des fleurs éternelles en fil chenille, faites main à Signy-l’Abbaye, dans les Ardennes. La boutique ouvre très bientôt.' },
  { nom: 'Dodedo', domaine: 'dodedo.fr', url: 'https://dodedo.fr/', sitemap: 'https://www.dodedo.fr/sitemap.xml', forfait: 'titan', genre: 'Site une page', icon: 'hand-heart', color: 'lilac', desc: 'Le site de Dominique Schneider, magnétiseur et barreur de feu. Une seule page principale, et des pages de conseils autour pour le référencement.' },
  { nom: 'Alex & Lia', domaine: 'alexetlia.fr', url: '/', sitemap: 'https://www.aled08.fr/wp-sitemap.xml' /* à passer sur https://www.alexetlia.fr/wp-sitemap.xml au changement de domaine */, genre: 'Notre propre site', icon: 'sparkles', color: 'lilac', desc: 'Notre site à nous : on se fait confiance, alors on se met dedans aussi. En français et en anglais.' },
  { nom: 'Les Notes du Temps', domaine: 'lesnotesdutemps.fr', url: 'https://www.lesnotesdutemps.fr/', sitemap: 'https://www.lesnotesdutemps.fr/sitemap.xml', forfait: 'chico', genre: 'Site une page', icon: 'music', color: 'peach', enCreation: true, desc: '' },
  { nom: 'ALED08', domaine: 'aled08.fr', url: 'https://www.aled08.fr/', forfait: '', genre: 'Site vitrine', icon: 'zap', color: 'butter', enCreation: true, desc: '' },
];

module.exports = { clients, site, sections, types, forfaits, annuel, lissage, delais, options, fidelite, paiement, boost, jetonsLia };
