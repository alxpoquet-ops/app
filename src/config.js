// ============================================================================
//  ALED08 — Configuration centrale du site
//  ⚠️  Les valeurs marquées « À REMPLACER » doivent être complétées avant la
//      mise en ligne (le build affiche un avertissement tant qu'elles restent).
// ============================================================================

const site = {
  // Domaine définitif (sans slash final). Sert aux balises canonical, au sitemap, à l'Open Graph.
  url: 'https://www.aled08.fr',
  name: 'ALED08',
  legalName: 'ALED08 — Alexandre Poquet', // raison sociale / nom commercial
  owner: 'Alexandre Poquet',
  tagline: 'Dépannage & Travaux Électriques dans les Ardennes',

  // ⚠️ À REMPLACER : numéro réel. Le numéro ci-dessous est un numéro fictif (plage réservée ARCEP).
  phoneDisplay: '06 39 98 00 00',
  phoneIntl: '+33639980000',
  // WhatsApp : même numéro au format international sans le « + ».
  whatsapp: '33639980000',
  whatsappMessage: "Bonjour, je souhaite un renseignement pour une intervention électrique.",

  // ⚠️ À REMPLACER si besoin : adresse e-mail de réception des demandes.
  email: 'contact@aled08.fr',

  address: {
    street: '', // ⚠️ Optionnel : rue (laisser vide pour n'afficher que la commune)
    postalCode: '08460',
    city: "Signy-l'Abbaye",
    region: 'Grand Est',
    department: 'Ardennes',
    country: 'FR',
  },
  geo: { lat: 49.6996, lng: 4.4183 },

  // Informations légales — ⚠️ À REMPLACER
  legal: {
    status: 'Entreprise individuelle', // ex. : Entreprise individuelle (micro-entreprise)
    siret: '[SIRET à compléter]',
    rm: '[Immatriculation au Registre national des entreprises — à compléter]',
    tva: '', // ex. : 'TVA non applicable, art. 293 B du CGI' si vous êtes en franchise de TVA
    insurer: '[Nom de l’assureur — à compléter]',
    insuranceContract: '[N° de contrat — à compléter]',
    insuranceScope: 'Responsabilité civile professionnelle (et garantie décennale le cas échéant)',
    insuranceArea: 'France métropolitaine',
    mediator: '[Nom et coordonnées du médiateur de la consommation — à compléter]',
    mediatorUrl: '',
    host: '[Nom, adresse et téléphone de l’hébergeur — à compléter, ex. OVH SAS, 2 rue Kellermann, 59100 Roubaix]',
    publicationDirector: 'Alexandre Poquet',
  },

  // Endpoint du formulaire. Par défaut : script PHP fourni (/envoi.php), compatible hébergements mutualisés.
  // Pour Formspree ou autre service, mettre l'URL complète ici.
  formAction: '/envoi.php',

  // Avis clients : tant que DEMO = true, un bandeau « avis d'exemple » s'affiche. Remplacez-les par
  // de vrais avis (Google, etc.) dans src/content/avis.js puis passez demoReviews à false.
  demoReviews: true,
  googleReviewsUrl: '', // ⚠️ lien vers votre fiche Google Business Profile (bouton « Laisser un avis »)

  // Les tarifs affichés s'appliquent aussi en soirée et le week-end (pas de majoration).
  weekendSurcharge: false,

  social: {
    facebook: '',
    google: '',
  },
};

// Horaires (tous sur rendez-vous). Format 24 h. dayOfWeek au format schema.org.
const hours = [
  { days: 'Lundi – Vendredi', short: 'Lun–Ven', schemaDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '18:00', closes: '21:30', label: '18 h 00 – 21 h 30' },
  { days: 'Samedi', short: 'Sam', schemaDays: ['Saturday'], opens: '08:00', closes: '19:00', label: '8 h 00 – 19 h 00' },
  { days: 'Dimanche', short: 'Dim', schemaDays: ['Sunday'], opens: '09:00', closes: '18:00', label: '9 h 00 – 18 h 00' },
];

// Grille tarifaire (prix TTC, « à partir de » = intervention simple, matériel standard compris).
const tarifs = [
  { id: 'diagnostic', label: 'Diagnostic de panne', price: 79, from: false, icon: 'search', note: 'Recherche méthodique de l’origine de la panne, mesures et explication claire.' },
  { id: 'deplacement', label: 'Déplacement', price: 20, from: true, icon: 'car-front', note: 'Jusqu’à 15 km de Signy-l’Abbaye, puis supplément kilométrique selon la distance.' },
  { id: 'prise', label: 'Remplacement de prise', price: 35, from: true, icon: 'plug', note: 'Prise standard 16 A sur installation existante.' },
  { id: 'interrupteur', label: 'Remplacement d’interrupteur', price: 35, from: true, icon: 'toggle-right', note: 'Simple allumage ou va-et-vient sur installation existante.' },
  { id: 'point-lumineux', label: 'Ajout de point lumineux', price: 90, from: true, icon: 'lightbulb', note: 'Création d’un point lumineux avec sa commande, selon accessibilité.' },
  { id: 'disjoncteur', label: 'Remplacement de disjoncteur', price: 45, from: true, icon: 'zap', note: 'Disjoncteur divisionnaire modulaire dans un tableau existant.' },
  { id: 'tableau', label: 'Remplacement de tableau électrique', price: 650, from: true, icon: 'panel-top', note: 'Tableau neuf conforme NF C 15-100 : différentiels 30 mA, disjoncteurs, repérage.' },
  { id: 'securite', label: 'Mise en sécurité', price: null, from: false, icon: 'shield-check', note: 'Sur devis, après visite : chaque installation est différente.' },
];

// Tarification kilométrique depuis Signy-l'Abbaye (distance par la route).
const kmTiers = [
  { max: 15, label: '0 à 15 km', supplement: 0, text: 'Sans supplément' },
  { max: 30, label: '15 à 30 km', supplement: 10, text: '+ 10 €' },
  { max: 45, label: '30 à 45 km', supplement: 20, text: '+ 20 €' },
  { max: Infinity, label: 'Au-delà de 45 km', supplement: null, text: 'Sur devis' },
];

// Communes desservies — distances indicatives par la route depuis Signy-l'Abbaye.
// page: slug de la page locale dédiée (si elle existe).
const communes = [
  { name: "Signy-l'Abbaye", km: 0, page: 'electricien-signy-l-abbaye', main: true },
  { name: 'Dommery', km: 5 },
  { name: 'Lalobbe', km: 6 },
  { name: 'Neuvizy', km: 7 },
  { name: 'Mesmont', km: 8 },
  { name: 'Saint-Jean-aux-Bois', km: 8 },
  { name: 'Wasigny', km: 9, page: 'electricien-wasigny' },
  { name: 'Thin-le-Moutier', km: 9, page: 'electricien-thin-le-moutier', main: true },
  { name: 'Jandun', km: 9 },
  { name: 'Le Fréty', km: 9 },
  { name: 'Viel-Saint-Remy', km: 10 },
  { name: 'Draize', km: 10 },
  { name: 'Wagnon', km: 11 },
  { name: 'Launois-sur-Vence', km: 11, page: 'electricien-launois-sur-vence' },
  { name: 'Faissault', km: 12 },
  { name: 'Liart', km: 13, page: 'electricien-liart', main: true },
  { name: 'Novion-Porcien', km: 13, page: 'electricien-novion-porcien', main: true },
  { name: 'Remilly-les-Pothées', km: 14 },
  { name: 'Lucquy', km: 15 },
  { name: 'Saulces-Monclin', km: 17 },
  { name: 'Chaumont-Porcien', km: 18, page: 'electricien-chaumont-porcien' },
  { name: 'Poix-Terron', km: 20, page: 'electricien-poix-terron', main: true },
  { name: 'Rumigny', km: 22, page: 'electricien-rumigny' },
  { name: 'Rethel', km: 24, page: 'electricien-rethel', main: true },
  { name: 'Sault-lès-Rethel', km: 25 },
  { name: 'Boulzicourt', km: 25 },
  { name: 'Maubert-Fontaine', km: 27, page: 'electricien-maubert-fontaine' },
  { name: 'Château-Porcien', km: 28, page: 'electricien-chateau-porcien', main: true },
  { name: 'Renwez', km: 29, page: 'electricien-renwez' },
  { name: 'Charleville-Mézières', km: 32, page: 'electricien-charleville-mezieres', main: true },
  { name: 'Signy-le-Petit', km: 32, page: 'electricien-signy-le-petit' },
  { name: 'Rimogne', km: 33 },
  { name: 'Attigny', km: 33, page: 'electricien-attigny' },
  { name: 'Prix-lès-Mézières', km: 33 },
  { name: 'Villers-Semeuse', km: 35 },
  { name: 'Rocroi', km: 38, page: 'electricien-rocroi', main: true },
  { name: 'Nouzonville', km: 41 },
  { name: 'Juniville', km: 42 },
  { name: 'Sedan', km: 45, page: 'electricien-sedan', main: true, note: 'Selon l’adresse : + 20 € ou forfait annoncé à l’avance' },
  { name: 'Vouziers', km: 50 },
  { name: 'Revin', km: 55 },
];

function tierFor(km) {
  return kmTiers.find((t) => km <= t.max);
}

module.exports = { site, hours, tarifs, kmTiers, communes, tierFor };
