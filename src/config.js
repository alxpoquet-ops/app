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

// ---------------------------------------------------------------- forfaits mensuels (un petit monstre chacun)
// En paiement annuel : 2 mois offerts sur le forfait.
// quota : nombre de demandes de modification par mois dans l'espace client.
const forfaits = [
  {
    id: 'chico',
    name: 'Chico',
    color: 'pink',
    month: 5,
    quota: 1,
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
    quota: 4,
    modifs: 'Une modification par semaine',
    conseil: true,
    tagline: 'Pour être trouvé',
    pitch: 'Tout Chico, plus le SEO de votre site et un rapport clair chaque mois.',
    features: ['Tout ce que comprend Chico', 'SEO de votre site, suivi chaque mois', 'Rapport mensuel : visiteurs, ventes, positions sur Google', 'Une modification par semaine'],
  },
  {
    id: 'titan',
    name: 'Titan',
    color: 'peach',
    month: 40,
    quota: 20,
    modifs: 'Une modification par jour ouvré',
    conseil: false,
    tagline: 'Pour les boutiques',
    pitch: 'Tout Power, plus une modification par jour ouvré, un article de blog par mois et une réponse sous 24 heures.',
    features: ['Tout ce que comprend Power', 'Une modification par jour ouvré (produits compris)', 'Un article de blog par mois pour votre SEO', 'Réponse sous 24 heures'],
  },
];
const annuel = { moisOfferts: 2 };
// Prix du site lissé sur 24 mois, au besoin (engagement de 24 mois, le temps de payer le site).
const lissage = { mois: 24 };
// Délai de réponse aux demandes de modification.
const delais = { reponse: '48 heures', titan: '24 heures' };

// ---------------------------------------------------------------- options (activables plus tard)
// price : { once } pour un paiement unique, { month } pour un paiement mensuel.
// types : réservée à ces types de site (ex. ['boutique']) ; absent = tous les sites.
const options = [
  { id: 'mail', group: 'site', name: 'Adresse e-mail pro', icon: 'at-sign', price: { month: 3 }, desc: 'Une adresse comme contact@votreboite.fr, sur votre téléphone et votre ordinateur.' },
  { id: 'en', group: 'site', name: 'Traduction en anglais', icon: 'languages', price: { once: 50 }, desc: 'Votre site traduit en anglais et relu, pour les touristes et les clients venus d’ailleurs.' },
  { id: 'stock', group: 'site', name: 'Gestion du stock', icon: 'warehouse', price: { month: 5 }, types: ['boutique'], desc: 'Le stock de votre commerce se décompte tout seul à chaque vente. Vous savez toujours ce qu’il reste.' },
  { id: 'comptes', group: 'site', name: 'Comptes clients', icon: 'users', price: { month: 5 }, types: ['boutique'], desc: 'Vos clients se créent un compte sur votre site : commandes passées, adresses et favoris gardés.' },
  { id: 'illimite', group: 'site', name: 'Modifications illimitées', icon: 'infinity', price: { month: 10 }, desc: 'Autant de demandes de modification que vous voulez, en plus de votre forfait.' },
];

// ---------------------------------------------------------------- fidélité et paiement
const fidelite = { parrainageMois: 1, remiseSecondSite: 10 };
const paiement = { acompte: 30 }; // création : 30 % à la commande, le reste à la mise en ligne

module.exports = { site, sections, types, pageEnPlus, forfaits, annuel, lissage, delais, options, fidelite, paiement };
