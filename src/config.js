// ============================================================================
//  ALED08 : configuration centrale du site (identité, formules, options, tarifs)
//  Tous les prix du site viennent de ce fichier : on les change ici, une seule fois.
//  ⚠️  Les valeurs marquées « À REMPLACER » doivent être complétées avant la
//      mise en ligne (le build affiche un avertissement tant qu'elles restent).
// ============================================================================

const site = {
  // Domaine définitif (sans slash final). Sert aux balises canonical, au sitemap, à l'Open Graph.
  url: 'https://www.aled08.fr',
  name: 'ALED08',
  baseline: 'Sites internet & IA',
  legalName: 'ALED08, Alexandre Poquet', // raison sociale / nom commercial
  owner: 'Alexandre Poquet',

  phoneDisplay: '06 02 46 12 58',
  phoneIntl: '+33602461258',
  // WhatsApp : même numéro au format international sans le « + ».
  whatsapp: '33602461258',
  whatsappMessage: 'Bonjour, je voudrais un renseignement pour un projet.',

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

  social: {
    facebook: '',
    instagram: '',
  },
};

// ---------------------------------------------------------------- couleurs des rubriques
// Chaque rubrique a sa couleur : on la retrouve dans le menu, l'en-tête de page et les cartes.
const sections = {
  sites: { path: '/sites-internet/', label: 'Sites internet', accent: 'amber', icon: 'monitor' },
  tarifs: { path: '/tarifs/', label: 'Tarifs', accent: 'coral', icon: 'coins' },
  jeux: { path: '/jeux-2d/', label: 'Jeux 2D', accent: 'teal', icon: 'gamepad-2' },
  auto: { path: '/automatisations/', label: 'Automatisations', accent: 'sky', icon: 'workflow' },
  methode: { path: '/methode/', label: 'Ma méthode', accent: 'lavender', icon: 'sparkles' },
  fidelite: { path: '/fidelite/', label: 'Fidélité', accent: 'pink', icon: 'gift' },
  contact: { path: '/contact/', label: 'Contact', accent: 'green', icon: 'message-circle' },
};

// ---------------------------------------------------------------- formules de sites
// unique : prix « à partir de », paiement en une fois (le site vous appartient)
// mensuel : abonnement tout compris (hébergement, nom de domaine, maintenance, petites modifications)
const formules = [
  {
    id: 'une-page',
    name: 'Une page',
    icon: 'layout-template',
    accent: 'amber',
    pitch: 'Tout tient sur une seule page qu’on fait défiler. Parfait pour présenter une activité, un projet ou un événement.',
    detail: 'Vos visiteurs font défiler une seule page : qui vous êtes, ce que vous proposez, vos prix et comment vous joindre. C’est simple, vite prêt, et souvent suffisant pour démarrer.',
    pourQui: 'Indépendants, artisans, associations, événements.',
    unique: 100,
    mensuel: 15,
    delai: '3 à 5 jours',
    inclus: ['Une page avec plusieurs sections', 'Design adapté au téléphone', 'Formulaire de contact', 'Bases du référencement Google', 'Mise en ligne'],
  },
  {
    id: 'onglets',
    name: 'Avec onglets',
    icon: 'layout-grid',
    accent: 'sky',
    popular: true,
    pitch: 'Un menu en haut et plusieurs pages : accueil, services, tarifs, contact. Le format classique d’une entreprise.',
    detail: 'Chaque sujet a sa page, accessible depuis le menu. Vos visiteurs trouvent tout de suite ce qu’ils cherchent, et Google peut mettre en avant chacune de vos pages.',
    pourQui: 'Entreprises, commerces, professions libérales.',
    unique: 290,
    mensuel: 29,
    delai: '1 à 2 semaines',
    inclus: ['Jusqu’à 5 pages', 'Menu clair sur ordinateur et téléphone', 'Formulaire de contact', 'Référencement de chaque page', 'Mise en ligne'],
  },
  {
    id: 'boutique',
    name: 'Boutique en ligne',
    icon: 'shopping-bag',
    accent: 'coral',
    pitch: 'Vendez sur internet : catalogue, panier, paiement par carte et suivi des commandes.',
    detail: 'Vos produits en ligne avec leurs photos et leurs prix. Vos clients commandent et paient par carte quand ils veulent, et chaque commande vous arrive par e-mail.',
    pourQui: 'Créateurs, commerçants, producteurs.',
    unique: 590,
    mensuel: 49,
    delai: '2 à 3 semaines',
    inclus: ['Jusqu’à 20 produits mis en ligne par moi', 'Paiement par carte sécurisé', 'Gestion des commandes et des stocks', 'Conditions de vente à compléter', 'Prise en main expliquée'],
  },
];

// Ce que comprend l'abonnement, en plus du site
const abonnement = {
  engagement: 12, // mois
  inclus: ['La création du site', 'L’hébergement', 'Le nom de domaine (.fr ou .com)', 'La sécurité (https) et les sauvegardes', 'Les mises à jour', 'Les petites modifications chaque mois', 'Une réponse rapide par message'],
};

// ---------------------------------------------------------------- options
// u = avec paiement unique, a = avec abonnement. 'inclus' ou { once, month, year } en euros.
const options = [
  { id: 'heberg', name: 'Hébergement + nom de domaine', icon: 'globe', desc: 'Votre adresse en .fr ou .com et votre site en ligne toute l’année.', u: { year: 59 }, a: 'inclus' },
  { id: 'maint', name: 'Maintenance et sauvegardes', icon: 'shield-check', desc: 'Mises à jour, sécurité, sauvegardes et une petite modification par mois.', u: { month: 9 }, a: 'inclus' },
  { id: 'mail', name: 'Adresse e-mail pro', icon: 'at-sign', desc: 'Une adresse comme contact@votresite.fr, sur votre téléphone et votre ordinateur.', u: { month: 3 }, a: { month: 3 } },
  { id: 'textes', name: 'Rédaction des textes', icon: 'pen-tool', desc: 'Vous me parlez de votre activité, j’écris les textes du site avec vous.', u: { once: 50 }, a: { once: 50 } },
  { id: 'logo', name: 'Logo simple', icon: 'palette', desc: 'Un logo net et lisible, livré en plusieurs formats.', u: { once: 49 }, a: { once: 49 } },
  { id: 'seo', name: 'Référencement local', icon: 'map', desc: 'Votre fiche Google, des pages pour vos villes, et le site déclaré à Google.', u: { once: 90 }, a: { once: 90 } },
  { id: 'suivi', name: 'Suivi Google mensuel', icon: 'chart-line', desc: 'Chaque mois, vos positions sur Google et des améliorations concrètes.', u: { month: 29 }, a: { month: 19 } },
  { id: 'page', name: 'Page en plus', icon: 'layers', desc: 'Une page de plus dans votre site, au-delà de ce que prévoit la formule.', u: { once: 40 }, a: { month: 4 } },
  { id: 'rdv', name: 'Réservation en ligne', icon: 'calendar-check', desc: 'Vos clients choisissent un créneau directement sur le site.', u: { once: 60 }, a: { month: 5 } },
  { id: 'en', name: 'Version anglaise', icon: 'languages', desc: 'Votre site traduit en anglais, relu avant la mise en ligne.', u: { once: 60 }, a: { month: 5 } },
  { id: 'assistant', name: 'Assistant IA sur le site', icon: 'bot', desc: 'Un assistant qui répond aux questions fréquentes de vos visiteurs, même la nuit.', u: { once: 99, month: 9 }, a: { once: 99, month: 9 } },
];

// Petites modifications hors abonnement
const modification = 25;

// ---------------------------------------------------------------- autres services
const jeux = [
  { name: 'Mini-jeu', icon: 'gamepad-2', price: 'dès 150 €', desc: 'Un jeu simple qui se joue dans le navigateur, sur ordinateur et téléphone. Pour votre site, une animation ou un cadeau.' },
  { name: 'Jeu à niveaux', icon: 'trophy', price: 'dès 400 €', desc: 'Plusieurs niveaux, un score, des graphismes à vos couleurs. Pour une marque, une école ou un événement.' },
  { name: 'Projet sur mesure', icon: 'puzzle', price: 'sur devis', desc: 'Une idée précise en tête ? On en parle, et je vous dis franchement ce qui est faisable.' },
];

const automatisations = [
  { name: 'Une routine', icon: 'repeat', price: 'dès 49 €', desc: 'Une tâche répétitive qui se fait toute seule : trier des mails, ranger des factures, envoyer un rappel.' },
  { name: 'Pack de 3 routines', icon: 'workflow', price: 'dès 129 €', desc: 'Trois routines qui travaillent ensemble, pensées pour votre façon de faire.' },
  { name: 'Suivi', icon: 'refresh-cw', price: '9 €/mois', desc: 'Je vérifie que tout tourne, j’ajuste quand vos besoins changent.' },
];

const initiation = { name: 'Initiation à l’IA', icon: 'brain', price: '35 € l’heure', desc: 'Une heure en visio pour apprendre à vous servir de l’IA au quotidien : écrire, résumer, chercher, organiser.' };

// ---------------------------------------------------------------- fidélité
const fidelite = {
  parrainage: 30, // euros offerts au parrain et au filleul
  parrainageAbo: 2, // mois offerts si le parrain est abonné
  remise: 10, // % sur les projets suivants
};

// Paiement
const paiement = {
  acompte: 30, // % à la commande (paiement unique)
};

module.exports = { site, sections, formules, abonnement, options, modification, jeux, automatisations, initiation, fidelite, paiement };
