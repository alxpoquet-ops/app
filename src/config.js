// ============================================================================
//  ALED08 : configuration centrale du site (identité, types de site, formules,
//  options, comparatif). Tous les prix du site viennent d'ici.
//  ⚠️  Les valeurs marquées « À REMPLACER » doivent être complétées avant la
//      mise en ligne (le build affiche un avertissement tant qu'elles restent).
// ============================================================================

const site = {
  // Domaine définitif (sans slash final). Sert aux balises canonical, au sitemap, à l'Open Graph.
  url: 'https://www.aled08.fr',
  name: 'ALED08',
  baseline: 'Sites internet & SEO',
  legalName: 'ALED08, Alexandre Poquet', // raison sociale / nom commercial
  owner: 'Alexandre Poquet',

  phoneDisplay: '06 02 46 12 58',
  phoneIntl: '+33602461258',
  // WhatsApp : même numéro au format international sans le « + ».
  whatsapp: '33602461258',
  whatsappMessage: 'Bonjour, je voudrais un renseignement pour un site internet.',

  // Adresse e-mail affichée et de réception des demandes.
  email: 'alx.poquet@gmail.com',

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
    siret: '[SIRET à compléter]',
    tva: '', // ex. : 'TVA non applicable, art. 293 B du CGI' si vous êtes en franchise de TVA
    mediator: '[Nom et coordonnées du médiateur de la consommation, à compléter]',
    mediatorUrl: '',
    host: 'o2switch, Clermont-Ferrand (France), www.o2switch.fr',
    publicationDirector: 'Alexandre Poquet',
  },

  // Endpoint du formulaire. Par défaut : script PHP fourni (/envoi.php). Sous WordPress, le thème s'en charge.
  formAction: '/envoi.php',

  // Espace client : tant qu'il n'est pas ouvert, la page le présente et les demandes passent par message.
  // La page /mon-espace/ est une démonstration interactive tant que l'espace n'est pas ouvert.
  espaceClient: { ouvert: false, url: '/mon-espace/' },

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
  shopify: { path: '/comparatif-shopify/', label: 'Comparatif Shopify', color: 'butter', icon: 'store' },
  fidelite: { path: '/fidelite/', label: 'Fidélité', color: 'pink', icon: 'gift' },
  methode: { path: '/methode/', label: 'Ma méthode', color: 'lilac', icon: 'sparkles' },
  monespace: { path: '/mon-espace/', label: 'Mon espace', color: 'sky', icon: 'circle-user' },
};

// ---------------------------------------------------------------- types de site (création, prix fixe)
const types = [
  {
    id: 'une-page',
    name: 'Une page',
    label: 'Site une page',
    color: 'sky',
    icon: 'layout-template',
    price: 150,
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
    price: 250,
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
    price: 450,
    delai: '2 à 3 semaines',
    pitch: 'Vos produits en ligne, le paiement par carte et le suivi des commandes.',
    pourQui: 'Créateurs, commerçants, producteurs.',
    inclus: ['Jusqu’à 20 produits ajoutés par moi', 'Paiement par carte sécurisé', 'Commandes et stocks', 'Conditions de vente à compléter'],
  },
];
const pageEnPlus = 40; // € par page au-delà de ce que prévoit le type de site

// ---------------------------------------------------------------- formules mensuelles (un petit monstre chacune)
// En paiement annuel : 2 mois offerts sur l'abonnement.
const forfaits = [
  {
    id: 'chico',
    name: 'Chico',
    color: 'pink',
    month: 5,
    modifs: 'Une modification par mois',
    tagline: 'L’essentiel',
    pitch: 'Votre site en ligne, protégé et à jour. Une modification par mois, faite par moi.',
    features: ['Hébergement et nom de domaine', 'Sauvegardes et mises à jour', 'Une modification par mois, sur simple demande', 'Votre espace client et nos outils, gratuits'],
  },
  {
    id: 'power',
    name: 'Power',
    color: 'lilac',
    month: 20,
    modifs: 'Une modification par semaine',
    conseil: true,
    tagline: 'Pour être trouvé',
    pitch: 'Tout Chico, plus le SEO de votre site et un rapport clair chaque mois.',
    features: ['Tout ce que comprend Chico', 'SEO de votre site, suivi chaque mois', 'Rapport mensuel : visiteurs, ventes, positions sur Google', 'Une modification par semaine'],
  },
];
const annuel = { moisOfferts: 2 };
// Prix du site lissé sur 24 mois, au besoin (engagement de 2 ans).
const lissage = { mois: 24 };

// ---------------------------------------------------------------- options (activables plus tard)
// price : { once } pour un paiement unique, { month } pour un paiement mensuel.
const options = [
  { id: 'mail', group: 'site', name: 'Adresse e-mail pro', icon: 'at-sign', price: { month: 3 }, desc: 'Une adresse comme contact@votreboite.fr, sur votre téléphone et votre ordinateur.' },
  { id: 'en', group: 'site', name: 'Traduction en anglais', icon: 'languages', price: { once: 50 }, desc: 'Votre site traduit en anglais et relu, pour les touristes et les clients venus d’ailleurs.' },
]

// ---------------------------------------------------------------- fidélité et paiement
const fidelite = { parrainageMois: 1, remiseSecondSite: 10 };
const paiement = { acompte: 30 }; // création : 30 % à la commande, le reste à la mise en ligne

// ---------------------------------------------------------------- comparatif Shopify
// Prix publics relevés pour la France. À revérifier sur la source avant chaque mise à jour du site.
const shopify = {
  releve: 'novembre 2026',
  source: 'https://www.shopify.com/fr/tarifs',
  basicMensuel: 36, // € par mois, facturation mensuelle
  basicAnnuel: 27, // € par mois, facturation annuelle
  fraisCarte: '1,5 % + 0,25 €', // Shopify Payments, carte européenne standard, forfait Basic
  fraisTiers: '2 %', // en plus, si on n'utilise pas Shopify Payments (forfait Basic)
};
const stripe = { fraisCarte: '1,5 % + 0,25 €' }; // carte européenne standard

module.exports = { site, sections, types, pageEnPlus, forfaits, annuel, lissage, options, fidelite, paiement, shopify, stripe };
