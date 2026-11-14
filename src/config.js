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
  baseline: 'L’IA pour tout le monde',
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
  // ouvert: false affiche « ouvre bientôt » sur la page Nos outils.
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
  espace: { path: '/nos-outils/', label: 'Nos outils', color: 'sky', icon: 'toolbox' },
  seo: { path: '/referencement-seo/', label: 'SEO', color: 'butter', icon: 'search-check' },
  contact: { path: '/contact/', label: 'Contact', color: 'peach', icon: 'message-circle' },
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
    pitch: 'Tout sur une seule page qu’on fait défiler : qui vous êtes, ce que vous faites, comment vous joindre.',
    pourQui: 'Indépendants, artisans, associations, événements.',
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
    pitch: 'Un menu en haut et plusieurs pages : accueil, services, tarifs, contact.',
    pourQui: 'Entreprises, commerces, professions libérales.',
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
    pitch: 'Vos produits en ligne, le paiement par carte et le suivi des commandes.',
    pourQui: 'Créateurs, commerçants, producteurs.',
    inclus: ['Jusqu’à 20 produits ajoutés par moi', 'Paiement par carte sécurisé', 'Commandes et stocks', 'Conditions de vente à compléter'],
  },
];
const pageEnPlus = 40; // € par page au-delà de ce que prévoit le type de site

// ---------------------------------------------------------------- forfaits mensuels (un petit monstre chacun)
// En paiement annuel : 2 mois offerts sur le forfait.
// quota : nombre de demandes de modification par mois dans l'espace client.
// Un seul compteur : chaque forfait donne des modifications par mois, et pour chacune le client choisit qui la fait :
//  - Lia (l'IA) : instantanée, avec un aperçu à valider ;
//  - Alex (l'humain) : à la main, sous 72 heures.
// quota = modifications par mois ; jetons = quota et partage = true (compteur commun Lia + Alex).
// Lia est instantanée et montre l'aperçu à confirmer avant de modifier le site ; Alex répond sous 72 heures et vérifie à la main.
const forfaits = [
  {
    id: 'chico',
    name: 'Chico',
    color: 'pink',
    month: 5,
    quota: 1,
    jetons: 1,
    partage: true,
    modifs: 'Une modification par mois',
    tagline: 'L’essentiel',
    pitch: 'Votre site en ligne, sûr et à jour, sur un serveur de qualité. Une modification par mois, faite par Lia ou par Alex, au choix.',
    main: ['Site hébergé, sécurisé et tenu à jour', 'Nom de domaine compris', 'Une modification par mois, par Lia ou par Alex'],
    details: ['Hébergement sur un serveur de qualité', 'Nom de domaine relié à votre site et renouvelé chaque année (liaison OVH)', 'HTTPS : le petit cadenas qui protège vos visiteurs', 'Mises à jour des extensions, faites pour vous', 'Formulaire de contact qui arrive dans votre boîte mail', 'Gestion du flux de visites : le site tient quand il y a du monde', 'Bases du SEO : Google sait lire et comprendre votre site', 'Une modification par mois, et vous choisissez qui la fait :', 'Lia, instantanée : elle vous montre l’aperçu et attend votre accord avant de modifier votre site', 'ou Alex, sous 72 heures : fait et vérifié à la main', 'Votre espace client : demandes, suivi et parrainage', 'Sans engagement : vous arrêtez quand vous voulez'],
    features: ['Hébergement sur un serveur de qualité', 'Nom de domaine relié et renouvelé', 'Mises à jour des extensions', 'Formulaire de contact et HTTPS', 'Gestion du flux de visites', 'Bases du SEO : Google sait lire votre site', 'Une modification par mois, par Lia ou par Alex, au choix'],
  },
  {
    id: 'power',
    name: 'Power',
    color: 'lilac',
    month: 15,
    quota: 4,
    jetons: 4,
    partage: true,
    modifs: 'Quatre modifications par mois',
    conseil: true,
    tagline: 'Pour être trouvé',
    pitch: 'Tout Chico, plus le SEO : je fais remonter votre site sur Google. Serveur plus rapide, support et modifications rapides.',
    main: ['Tout ce que comprend Chico', 'Le SEO : votre site monte sur Google', 'Quatre modifications par mois, par Lia ou par Alex'],
    details: ['Tout ce que comprend Chico, et en plus :', 'Le SEO suivi chaque mois : je choisis avec vous les mots que vos clients tapent et je fais monter votre site', 'Des pages utiles pour le référencement, qui renvoient vers votre site (jamais des pages inutiles)', 'Un serveur plus rapide, pour accueillir plus de visites', 'Un support rapide quand vous avez une question', 'Quatre modifications par mois, et vous choisissez qui fait chacune : Lia ou Alex'],
    features: ['Tout ce que comprend Chico', 'SEO : je fais remonter votre site sur Google, chaque mois', 'Serveur plus rapide, pour plus de visites', 'Support rapide', 'Quatre modifications par mois, par Lia ou par Alex'],
  },
  {
    id: 'titan',
    name: 'Titan',
    color: 'peach',
    month: 30,
    quota: 10,
    jetons: 10,
    partage: true,
    modifs: 'Dix modifications par mois',
    conseil: false,
    tagline: 'Le meilleur',
    pitch: 'Tout Power, plus le retour de vos ventes et de vos chiffres chaque mois, et dix modifications par mois.',
    main: ['Tout ce que comprend Power', 'Vos ventes et vos chiffres chaque mois', 'Dix modifications par mois, par Lia ou par Alex'],
    details: ['Tout ce que comprend Power, et en plus :', 'Un rapport chaque mois : vos ventes, vos visites et vos chiffres, expliqués simplement', 'Dix modifications par mois, par Lia ou par Alex', 'Avec Alex, réponse sous 24 heures'],
    features: ['Tout ce que comprend Power', 'Retour de vos ventes et de vos chiffres chaque mois', 'Dix modifications par mois, par Lia ou par Alex'],
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
  { id: 'comptes', group: 'site', name: 'Comptes clients', icon: 'users', price: { month: 5 }, types: ['boutique'], desc: 'Vos clients se créent un compte sur votre site : commandes passées, adresses et favoris gardés.' },
];

// ---------------------------------------------------------------- fidélité et paiement
const fidelite = { parrainageMois: 1, remiseSecondSite: 10 };
const paiement = { acompte: 100 }; // création payée en une fois à la commande (ou en 6 / 12 fois sans frais)

// Boost : une modification en plus du forfait, à l'unité, ajoutée à la prochaine facture.
const boost = { prix: 1 };
module.exports = { site, sections, types, pageEnPlus, forfaits, annuel, lissage, delais, options, fidelite, paiement, boost };
