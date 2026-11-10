// ============================================================================
//  ALED08 — Configuration centrale du site
//  ⚠️  Les valeurs marquées « À REMPLACER » doivent être complétées avant la
//      mise en ligne (le build affiche un avertissement tant qu'elles restent).
// ============================================================================

const site = {
  // Domaine définitif (sans slash final). Sert aux balises canonical, au sitemap, à l'Open Graph.
  url: 'https://www.aled08.fr',
  name: 'ALED08',
  legalName: 'ALED08, Alexandre Poquet', // raison sociale / nom commercial
  owner: 'Alexandre Poquet',
  // Photo de vous (facultatif, vivement conseillé) : déposez un portrait carré dans
  // src/assets/img/ (ex. portrait.jpg, 600 × 600 px) puis indiquez '/assets/img/portrait.jpg'.
  portrait: '',
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
    rm: '[Immatriculation au Registre national des entreprises, à compléter]',
    tva: '', // ex. : 'TVA non applicable, art. 293 B du CGI' si vous êtes en franchise de TVA
    insurer: '[Nom de l’assureur, à compléter]',
    insuranceContract: '[N° de contrat, à compléter]',
    insuranceScope: 'Responsabilité civile professionnelle (et garantie décennale le cas échéant)',
    insuranceArea: 'France métropolitaine',
    mediator: '[Nom et coordonnées du médiateur de la consommation, à compléter]',
    mediatorUrl: '',
    host: '[Nom, adresse et téléphone de l’hébergeur, à compléter, ex. OVH SAS, 2 rue Kellermann, 59100 Roubaix]',
    publicationDirector: 'Alexandre Poquet',
  },

  // Endpoint du formulaire. Par défaut : script PHP fourni (/envoi.php), compatible hébergements mutualisés.
  // Pour Formspree ou autre service, mettre l'URL complète ici.
  formAction: '/envoi.php',

  // Avis clients : seuls de VRAIS avis sont affichés (src/content/avis.js). Tant que la liste est
  // vide, la section « Avis » n'apparaît pas sur le site.
  googleReviewsUrl: '', // ⚠️ lien vers votre fiche Google Business Profile (bouton « Voir / laisser un avis »)

  // Les tarifs affichés s'appliquent aussi en soirée et le week-end (pas de majoration).
  weekendSurcharge: false,

  social: {
    facebook: '',
    google: '',
  },
};

// Disponibilités : aucun horaire affiché, « à tout moment, sur rendez-vous ».
const hours = [
  { days: 'En journée', label: 'Sur rendez-vous' },
  { days: 'Le soir', label: 'Sur rendez-vous' },
  { days: 'Le week-end', label: 'Sur rendez-vous' },
];

// Forfait dépannage : prix unique, tout compris jusqu'au devis de réparation.
const forfait = {
  // Prix du forfait : sur devis, annoncé au téléphone avant le déplacement (non affiché sur le site).
  price: null,
  priceText: 'Sur devis',
  // Engagement : si l'origine de la panne n'est pas trouvée, une remise est accordée sur le forfait.
  // Le montant de la remise n'est volontairement pas affiché sur le site.
  notFoundDiscount: true,
  label: 'Forfait dépannage',
  includes: [
    { icon: 'car-front', text: 'Le déplacement à domicile', detail: 'partout dans les Ardennes' },
    { icon: 'search', text: 'La recherche de panne', detail: 'méthodique, mesures à l’appui' },
    { icon: 'lightbulb', text: 'La proposition de solution', detail: 'expliquée clairement, sans jargon' },
    { icon: 'file-text', text: 'Le devis de réparation', detail: 'sans aucune obligation' },
  ],
};

// Grille tarifaire (prix TTC). Aucun prix de pièce n'est affiché : toute réparation fait l'objet
// d'un devis remis à la fin du dépannage.
const tarifs = [
  { id: 'depannage', label: 'Forfait dépannage', price: null, priceText: 'Sur devis', icon: 'zap', highlight: true, note: 'Déplacement, recherche de panne, proposition de solution et devis de réparation sans obligation. Prix annoncé au téléphone, avant de venir.' },
  { id: 'reparation', label: 'Réparation et pièces', price: null, priceText: 'Sur devis', icon: 'wrench', note: 'Chiffrée à la fin du dépannage. Vous acceptez ou non, sans obligation.' },
  { id: 'travaux', label: 'Travaux et installations', price: null, priceText: 'Sur devis', icon: 'clipboard-check', note: 'Tableau, mise en sécurité, éclairage, prises, circuits : devis gratuit et détaillé.' },
];

// Ancienne tarification kilométrique (plus affichée sur le site : le forfait est sur devis).
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
  { name: 'Saulces-Monclin', km: 17, page: 'electricien-saulces-monclin' },
  { name: 'Chaumont-Porcien', km: 18, page: 'electricien-chaumont-porcien' },
  { name: 'Poix-Terron', km: 20, page: 'electricien-poix-terron', main: true },
  { name: 'Rumigny', km: 22, page: 'electricien-rumigny' },
  { name: 'Rethel', km: 24, page: 'electricien-rethel', main: true },
  { name: 'Sault-lès-Rethel', km: 25, page: 'electricien-sault-les-rethel' },
  { name: 'Boulzicourt', km: 25, page: 'electricien-boulzicourt' },
  { name: 'Maubert-Fontaine', km: 27, page: 'electricien-maubert-fontaine' },
  { name: 'Château-Porcien', km: 28, page: 'electricien-chateau-porcien', main: true },
  { name: 'Renwez', km: 29, page: 'electricien-renwez' },
  { name: 'Charleville-Mézières', km: 32, page: 'electricien-charleville-mezieres', main: true },
  { name: 'Signy-le-Petit', km: 32, page: 'electricien-signy-le-petit' },
  { name: 'Rimogne', km: 33, page: 'electricien-rimogne' },
  { name: 'Attigny', km: 33, page: 'electricien-attigny' },
  { name: 'Prix-lès-Mézières', km: 33, page: 'electricien-prix-les-mezieres' },
  { name: 'Villers-Semeuse', km: 35, page: 'electricien-villers-semeuse' },
  { name: 'Rocroi', km: 38, page: 'electricien-rocroi', main: true },
  { name: 'Nouzonville', km: 41, page: 'electricien-nouzonville' },
  { name: 'Juniville', km: 42, page: 'electricien-juniville' },
  { name: 'Sedan', km: 45, page: 'electricien-sedan', main: true },
  { name: 'Vouziers', km: 50 },
  { name: 'Revin', km: 55 },
  { name: 'Givet', km: 85 },
  { name: 'Fumay', km: 70 },
  { name: 'Bogny-sur-Meuse', km: 50 },
  { name: 'Carignan', km: 60 },
  { name: 'Mouzon', km: 60 },
  { name: 'Le Chesne', km: 35 },
  { name: 'Grandpré', km: 65 },
];

// Secteurs des Ardennes (pour la page zone d'intervention).
const secteurs = [
  { name: 'Crêtes préardennaises et Porcien', towns: ["Signy-l'Abbaye", 'Wasigny', 'Thin-le-Moutier', 'Launois-sur-Vence', 'Liart', 'Novion-Porcien', 'Saulces-Monclin', 'Chaumont-Porcien', 'Poix-Terron', 'Château-Porcien', 'Dommery', 'Lalobbe', 'Neuvizy', 'Mesmont', 'Saint-Jean-aux-Bois', 'Jandun', 'Le Fréty', 'Viel-Saint-Remy', 'Draize', 'Wagnon', 'Faissault', 'Remilly-les-Pothées', 'Lucquy'] },
  { name: 'Charleville-Mézières, Sedan et la Meuse', towns: ['Charleville-Mézières', 'Sedan', 'Villers-Semeuse', 'Prix-lès-Mézières', 'Nouzonville', 'Boulzicourt', 'Bogny-sur-Meuse', 'Revin', 'Fumay', 'Givet', 'Mouzon', 'Carignan'] },
  { name: 'Rethélois, Aisne et Argonne', towns: ['Rethel', 'Sault-lès-Rethel', 'Attigny', 'Juniville', 'Vouziers', 'Le Chesne', 'Grandpré'] },
  { name: 'Thiérache et plateau de Rocroi', towns: ['Rocroi', 'Rumigny', 'Maubert-Fontaine', 'Renwez', 'Signy-le-Petit', 'Rimogne'] },
];

function tierFor(km) {
  return kmTiers.find((t) => km <= t.max);
}

module.exports = { site, hours, forfait, tarifs, kmTiers, communes, secteurs, tierFor };
