// ============================================================================
//  ALED08 : configuration centrale du site (identité, types de site, forfaits,
//  options, comparatif). Tous les prix du site viennent de ce fichier.
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
  // Le jour de l'ouverture, passer à true et indiquer l'adresse de connexion.
  espaceClient: { ouvert: false, url: '/mon-espace/' },

  social: {
    facebook: '',
    instagram: '',
  },
};

// ---------------------------------------------------------------- rubriques
// Chaque rubrique a sa couleur pastel : on la retrouve dans le menu et en haut de la page.
const sections = {
  creer: { path: '/creer-mon-site/', label: 'Créer mon site', color: 'pink', icon: 'wand-sparkles' },
  forfaits: { path: '/forfaits/', label: 'Forfaits', color: 'lilac', icon: 'heart' },
  espace: { path: '/espace-client/', label: 'Espace client', color: 'sky', icon: 'smartphone' },
  seo: { path: '/referencement-seo/', label: 'SEO', color: 'mint', icon: 'search-check' },
  contact: { path: '/contact/', label: 'Contact', color: 'peach', icon: 'message-circle' },
  // Hors du menu principal
  shopify: { path: '/comparatif-shopify/', label: 'Comparatif Shopify', color: 'butter', icon: 'store' },
  fidelite: { path: '/fidelite/', label: 'Fidélité', color: 'pink', icon: 'gift' },
  methode: { path: '/methode/', label: 'Ma méthode', color: 'lilac', icon: 'sparkles' },
};

// ---------------------------------------------------------------- types de site (création, prix fixe)
const types = [
  {
    id: 'une-page',
    name: 'Une page',
    label: 'Site une page',
    color: 'sky',
    icon: 'layout-template',
    price: 100,
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
    price: 290,
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
    price: 590,
    delai: '2 à 3 semaines',
    pitch: 'Vos produits en ligne, le paiement par carte et le suivi des commandes.',
    pourQui: 'Créateurs, commerçants, producteurs.',
    inclus: ['Jusqu’à 20 produits ajoutés par moi', 'Paiement par carte sécurisé', 'Commandes et stocks', 'Conditions de vente à compléter'],
    supplement: 10, // € par mois ajoutés au forfait (paiements, stocks et commandes à surveiller)
  },
];
const pageEnPlus = 40; // € par page au-delà de ce que prévoit le type de site

// ---------------------------------------------------------------- forfaits (un petit monstre chacun)
// Prix mensuels. En paiement annuel : 2 mois offerts sur tout ce qui est mensuel.
const forfaits = [
  {
    id: 'chico',
    name: 'Chico',
    color: 'mint',
    month: 15,
    tagline: 'L’essentiel, sans souci',
    pitch: 'Votre site en ligne, à jour et protégé. Vous m’écrivez, je fais les changements.',
    features: [
      'Hébergement rapide et sécurisé',
      'Nom de domaine inclus (.fr, .com, .net ou .org)',
      'Sauvegardes et mises à jour',
      'Une modification par mois, sur simple message',
      'SEO de base : Google Search Console et suivi',
      'Une page « liens » pour votre bio Instagram ou TikTok',
    ],
  },
  {
    id: 'power',
    name: 'Power',
    color: 'lilac',
    month: 29,
    conseil: true,
    tagline: 'Vous modifiez tout avec l’IA',
    pitch: 'Vous écrivez ce que vous voulez changer, l’IA modifie votre site. Je suis votre SEO tous les mois.',
    features: [
      'Modifications à volonté depuis votre espace : vous écrivez, l’IA change votre site',
      'Retour en arrière en un clic',
      'SEO suivi chaque mois, avec 2 contenus optimisés',
      'Rapport de visibilité chaque mois',
    ],
  },
  {
    id: 'titan',
    name: 'Titan',
    color: 'peach',
    month: 59,
    tagline: 'Pour vous faire connaître',
    pitch: 'Une photo et quelques mots : l’IA met en forme et publie sur vos réseaux. Et un SEO renforcé.',
    features: [
      'Publication sur vos réseaux : Instagram, Facebook et votre fiche Google',
      'SEO renforcé : jusqu’à 10 contenus optimisés par mois',
      'Fiche Google suivie, réponses aux avis préparées',
      'Réponse prioritaire',
    ],
  },
];
const annuel = { moisOfferts: 2 };

// ---------------------------------------------------------------- options (activables plus tard)
// price : { once } pour un paiement unique, { month } pour un paiement mensuel.
const options = [
  { id: 'google', group: 'connaitre', name: 'Fiche Google', icon: 'map-pin', price: { once: 49 }, desc: 'Je crée ou j’améliore votre fiche Google, pour apparaître sur la carte quand on cherche près de chez vous.' },
  { id: 'avis', group: 'connaitre', name: 'Avis clients', icon: 'star', price: { month: 5 }, desc: 'Un QR code et un message envoyé après chaque vente pour demander un avis Google.' },
  { id: 'kit', group: 'connaitre', name: 'Kit QR code et cartes de visite', icon: 'qr-code', price: { once: 29 }, desc: 'Cartes de visite et affichette avec un QR code vers votre site, prêtes à imprimer.' },
  { id: 'lettre', group: 'connaitre', name: 'Lettre d’info', icon: 'mail-open', price: { month: 5 }, desc: 'Vos nouveautés envoyées par e-mail à vos clients, avec un formulaire d’inscription sur le site.' },
  { id: 'mail', group: 'site', name: 'Adresse e-mail pro', icon: 'at-sign', price: { month: 3 }, desc: 'Une adresse comme contact@votresite.fr, sur votre téléphone et votre ordinateur.' },
  { id: 'rdv', group: 'site', name: 'Réservation en ligne', icon: 'calendar-check', price: { month: 5 }, desc: 'Vos clients choisissent un créneau directement sur le site.' },
  { id: 'chat', group: 'site', name: 'Assistant IA pour vos visiteurs', icon: 'bot', price: { month: 9 }, desc: 'Une bulle de discussion qui répond aux questions fréquentes, même la nuit.' },
  { id: 'en', group: 'site', name: 'Version anglaise', icon: 'languages', price: { month: 5 }, desc: 'Votre site traduit en anglais et relu avant la mise en ligne.' },
  { id: 'logo', group: 'site', name: 'Logo simple', icon: 'palette', price: { once: 49 }, desc: 'Un logo net et lisible, livré dans tous les formats utiles.' },
  { id: 'textes', group: 'site', name: 'Rédaction des textes', icon: 'pen-tool', price: { once: 50 }, desc: 'Vous me parlez de votre activité, j’écris les textes du site avec vous.' },
];

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

module.exports = { site, sections, types, pageEnPlus, forfaits, annuel, options, fidelite, paiement, shopify, stripe };
