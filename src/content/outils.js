// Nos outils : gratuits pour les clients hébergés chez moi. Les modifications, c'est moi qui les fais.
// demo : onglet de la démo où l'essayer (la démo n'a pas d'onglet « commande » : on renvoie vers le forfait).
module.exports = [
  { id: 'demande', icon: 'message-circle', color: 'mint', name: 'Demande de modification', desc: 'Vous écrivez ce que vous voulez changer, avec une photo si besoin. Je m’en occupe et je vous préviens quand c’est en ligne.', demo: 'demandes' },
  { id: 'commande', icon: 'package', color: 'peach', name: 'Ma commande', desc: 'Le suivi de votre commande, de votre nom de domaine et de vos paiements, étape par étape.', demo: 'forfait' },
  { id: 'tableau', icon: 'chart-line', color: 'lilac', name: 'Tableau de bord', desc: 'Visites, appels et recherches Google qui vous amènent, en un coup d’œil.', demo: 'visibilite' },
  { id: 'qr', icon: 'qr-code', color: 'peach', name: 'QR code', desc: 'Un QR code vers votre site, prêt à imprimer sur vos cartes, votre vitrine ou vos flyers.', demo: 'outils' },
  { id: 'avis', icon: 'star', color: 'butter', name: 'Lien d’avis Google', desc: 'Un lien tout prêt à envoyer à vos clients contents pour qu’ils laissent un avis.', demo: 'outils' },
  { id: 'factures', icon: 'receipt', color: 'sky', name: 'Forfait et factures', desc: 'Votre forfait, vos options et toutes vos factures, au même endroit.', demo: 'forfait' },
];
