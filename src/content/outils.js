// Nos outils : ce que le client peut faire lui-même depuis son espace, s'il le souhaite.
// cout : nombre de jetons utilisés (0 = compris, sans jeton). demo : onglet de la démo où l'essayer.
module.exports = [
  {
    id: 'site',
    title: 'Votre site',
    icon: 'monitor',
    color: 'mint',
    tools: [
      { id: 'modif', icon: 'zap', name: 'Modification rapide', desc: 'Un texte, une photo, un prix ou des horaires à changer : vous l’écrivez, l’outil prépare le changement et vous montre l’aperçu avant de publier.', cout: 1, demo: 'modifier' },
      { id: 'annonce', icon: 'bell-ring', name: 'Annonce express', desc: 'Fermeture exceptionnelle, promo, nouveauté : un bandeau en haut de votre site en un clic, retiré tout seul à la date choisie.', cout: 1 },
      { id: 'produit', icon: 'shopping-bag', name: 'Fiche produit express', desc: 'Pour les boutiques : une photo et un prix, et l’outil rédige le titre et la description du produit.', cout: 1 },
      { id: 'traduction', icon: 'languages', name: 'Traduction', desc: 'Une page ou une annonce traduite en anglais, à relire avant de la publier.', cout: 1 },
    ],
  },
  {
    id: 'reseaux',
    title: 'Vos réseaux',
    icon: 'send',
    color: 'peach',
    tools: [
      { id: 'studio', icon: 'send', name: 'Studio publication', desc: 'Une photo et quelques mots : un texte adapté à chaque réseau, l’image au bon format, et c’est publié sur Instagram, Facebook et Google.', cout: 1, demo: 'publier' },
      { id: 'hashtags', icon: 'hash', name: 'Hashtags malins', desc: 'Les mots-clés qui marchent pour votre métier et votre ville, prêts à copier.', cout: 0 },
      { id: 'calendrier', icon: 'calendar-days', name: 'Calendrier des publications', desc: 'Préparez les posts du mois en une fois : ils partent tout seuls, au bon moment.', cout: 0 },
      { id: 'idees', icon: 'lightbulb', name: 'Idées de posts', desc: 'En panne d’inspiration ? Dix idées adaptées à votre activité et à la saison.', cout: 1 },
    ],
  },
  {
    id: 'clients',
    title: 'Vos clients',
    icon: 'heart',
    color: 'pink',
    tools: [
      { id: 'avis-reponse', icon: 'message-square-reply', name: 'Réponses aux avis', desc: 'Une réponse polie et personnelle à chaque avis Google, prête à envoyer.', cout: 1 },
      { id: 'avis-demande', icon: 'star', name: 'Demande d’avis', desc: 'Un lien à envoyer après une vente, pour que vos clients contents le disent sur Google.', cout: 0 },
      { id: 'qr', icon: 'qr-code', name: 'QR code', desc: 'Vers votre site, votre carte ou votre page d’avis, prêt à imprimer.', cout: 0 },
      { id: 'affiche', icon: 'printer', name: 'Affiche et flyer', desc: 'Une affiche A4 à vos couleurs avec votre offre du moment et un QR code.', cout: 1 },
    ],
  },
  {
    id: 'suivi',
    title: 'Vos images et votre suivi',
    icon: 'chart-line',
    color: 'lilac',
    tools: [
      { id: 'photo', icon: 'scissors', name: 'Retouche photo', desc: 'Fond détouré, lumière corrigée, recadrage aux formats de chaque réseau.', cout: 1 },
      { id: 'tableau', icon: 'chart-line', name: 'Tableau de bord', desc: 'Visites, appels et recherches Google qui vous amènent, en un coup d’œil.', cout: 0, demo: 'visibilite' },
    ],
  },
];
