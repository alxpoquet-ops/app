// ============================================================================
//  ALED08 : configuration centrale du site (identité, types de site, entretien,
//  forfaits IA, jetons, options, comparatif). Tous les prix du site viennent d'ici.
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
  espace: { path: '/espace-client/', label: 'Espace client', color: 'sky', icon: 'smartphone' },
  seo: { path: '/referencement-seo/', label: 'SEO', color: 'butter', icon: 'search-check' },
  contact: { path: '/contact/', label: 'Contact', color: 'peach', icon: 'message-circle' },
  // Hors du menu principal
  shopify: { path: '/comparatif-shopify/', label: 'Comparatif Shopify', color: 'butter', icon: 'store' },
  visibilite: { path: '/se-faire-connaitre/', label: 'Se faire connaître', color: 'pink', icon: 'megaphone' },
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
    price: 150,
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
    price: 250,
    delai: '2 à 3 semaines',
    pitch: 'Vos produits en ligne, le paiement par carte et le suivi des commandes.',
    pourQui: 'Créateurs, commerçants, producteurs.',
    inclus: ['Jusqu’à 20 produits ajoutés par moi', 'Paiement par carte sécurisé', 'Commandes et stocks', 'Conditions de vente à compléter'],
  },
];
const pageEnPlus = 40; // € par page au-delà de ce que prévoit le type de site

// ---------------------------------------------------------------- entretien (toujours compris)
const entretien = {
  month: 10,
  features: [
    'Hébergement rapide et sécurisé',
    'Nom de domaine inclus (.fr, .com, .net ou .org)',
    'Sauvegardes et mises à jour des extensions',
    'Votre espace client, avec l’accès à tous nos outils IA',
  ],
};

// ---------------------------------------------------------------- jetons IA
// Un jeton = une petite modification du site ou une publication sur les réseaux.
const jetons = { recharge: { qty: 10, price: 5 } };

// ---------------------------------------------------------------- forfaits IA (un petit monstre chacun)
// « plus » : prix ajouté à l'entretien, par mois. En paiement annuel : 2 mois offerts.
const forfaits = [
  {
    id: 'chico',
    name: 'Chico',
    color: 'pink',
    plus: 5,
    jetons: 3,
    tagline: 'Pour bien démarrer',
    pitch: 'Tous nos outils IA, avec de quoi faire 2 ou 3 changements par mois.',
    features: ['De quoi faire 2 à 3 petites modifications par mois', '1 publication offerte chaque mois', 'SEO de base : Google Search Console et suivi'],
  },
  {
    id: 'power',
    name: 'Power',
    color: 'lilac',
    plus: 10,
    jetons: 10,
    conseil: true,
    tagline: 'Vous modifiez tout avec l’IA',
    pitch: 'Une dizaine de modifications par mois, un SEO suivi et un support prioritaire.',
    features: ['Une dizaine de modifications par mois', 'SEO suivi chaque mois, avec un rapport', 'Support prioritaire'],
  },
  {
    id: 'titan',
    name: 'Titan',
    color: 'peach',
    plus: 15,
    jetons: 30,
    tagline: 'Pour vous faire connaître',
    pitch: 'De quoi publier souvent : l’IA écrit vos textes, prépare vos images et choisit vos hashtags.',
    features: ['Une trentaine de modifications ou publications par mois', 'Publication automatique : texte, image et hashtags par l’IA', 'SEO suivi chaque mois, avec un rapport', 'Support prioritaire'],
  },
];
forfaits.forEach((f) => { f.month = entretien.month + f.plus; });
const annuel = { moisOfferts: 2 };

// ---------------------------------------------------------------- options (activables plus tard)
// price : { once } pour un paiement unique, { month } pour un paiement mensuel.
const options = [
  { id: 'google', group: 'connaitre', name: 'Fiche Google', icon: 'map-pin', price: { once: 49 }, desc: 'Je crée ou j’améliore votre fiche Google, pour apparaître sur la carte quand on cherche près de chez vous.' },
  { id: 'avis', group: 'connaitre', name: 'Avis clients', icon: 'star', price: { month: 5 }, desc: 'Un QR code et un message envoyé après chaque vente pour demander un avis Google.' },
  { id: 'annuaires', group: 'connaitre', name: 'Inscription dans les annuaires', icon: 'list-checks', price: { once: 39 }, desc: 'Votre entreprise ajoutée sur Apple Plans, Bing, les Pages Jaunes et les annuaires locaux, avec les mêmes informations partout.' },
  { id: 'kit', group: 'connaitre', name: 'Kit QR code et cartes de visite', icon: 'qr-code', price: { once: 29 }, desc: 'Cartes de visite et affichette avec un QR code vers votre site, prêtes à imprimer.' },
  { id: 'lettre', group: 'connaitre', name: 'Lettre d’info', icon: 'mail-open', price: { month: 5 }, desc: 'Vos nouveautés envoyées par e-mail à vos clients, avec un formulaire d’inscription sur le site.' },
  { id: 'carte', group: 'connaitre', name: 'Carte de fidélité numérique', icon: 'ticket', price: { month: 5 }, desc: 'Vos clients cumulent des tampons sur leur téléphone, sans application à installer.' },
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

module.exports = { site, sections, types, pageEnPlus, entretien, jetons, forfaits, annuel, options, fidelite, paiement, shopify, stripe };
