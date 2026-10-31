/* ==========================================================================
   Flore & Chenilles — CONTENU DU SITE
   --------------------------------------------------------------------------
   C'est ici que l'on modifie les produits, les prix, les couleurs, les fleurs
   du compositeur « Votre bouquet à vous », les occasions et les coordonnées.
   Pas besoin de toucher au reste du code.

   ⚠️ Les prix et descriptions ci-dessous sont des propositions de départ :
      ajustez-les à votre catalogue réel.

   Photos : pour remplacer une illustration par une vraie photo, déposez le
   fichier dans  assets/photos/  puis renseignez  image: 'assets/photos/xxx.jpg'
   ========================================================================== */

window.SITE = {
  brand: {
    name: 'Flore & Chenilles',
    instagram: 'flore_et_chenilles' // identifiant Instagram, sans le @
  },

  contact: {
    // Laissez vide pour que les messages et commandes passent par Instagram.
    // Renseignez une adresse pour ajouter le bouton « Envoyer par e-mail ».
    email: '',
    // Optionnel : URL d'un formulaire Formspree (https://formspree.io/f/xxxxxx)
    // pour recevoir les messages directement par e-mail, sans quitter le site.
    formEndpoint: ''
  },

  /* ---------- Palette des fleurs (fil chenille) ---------- */
  colors: {
    blanc: { name: 'Blanc nacré', hex: '#FBF6F1' },
    vanille: { name: 'Vanille', hex: '#F7E6B0' },
    peche: { name: 'Pêche', hex: '#F8CDB5' },
    corail: { name: 'Corail doux', hex: '#F2AEA5' },
    rose: { name: 'Rose poudré', hex: '#F3C4CF' },
    bonbon: { name: 'Rose bonbon', hex: '#E9A6BE' },
    lilas: { name: 'Lilas', hex: '#D9CBF0' },
    lavande: { name: 'Lavande', hex: '#BBA9E2' },
    ciel: { name: 'Bleu ciel', hex: '#C9DDF2' },
    menthe: { name: 'Menthe', hex: '#C6E6D3' },
    sauge: { name: 'Vert sauge', hex: '#B5CDB8', hidden: true }
  },

  papers: {
    nacre: { name: 'Blanc nacré', hex: '#F6EFE6' },
    lin: { name: 'Lin naturel', hex: '#EADBC8' },
    poudre: { name: 'Rose poudré', hex: '#F4D9DF' },
    lilas: { name: 'Lilas', hex: '#E2D8F1' },
    sauge: { name: 'Sauge', hex: '#D8E6D6' },
    ciel: { name: 'Ciel', hex: '#D9E6F4' }
  },

  ribbons: {
    satin_rose: { name: 'Satin rose', hex: '#E6A4B6' },
    lilas: { name: 'Lilas', hex: '#C3B3E6' },
    ivoire: { name: 'Ivoire', hex: '#F2E6CC' },
    sauge: { name: 'Sauge', hex: '#A9C7A6' },
    ciel: { name: 'Bleu ciel', hex: '#AFCBEA' },
    peche: { name: 'Pêche', hex: '#F1BC9F' }
  },

  pots: {
    terracotta: { name: 'Terracotta', hex: '#EDC3AE' },
    lilas: { name: 'Lilas', hex: '#D8CCEE' }
  },

  /* ---------- Fleurs disponibles dans « Votre bouquet à vous » ---------- */
  flowers: {
    rose: { name: 'Rose spirale', plural: 'Roses spirales', price: 5, desc: 'Une spirale de fil enroulée à la main.' },
    tulipe: { name: 'Tulipe', plural: 'Tulipes', price: 4, desc: 'Trois boucles délicates, comme au printemps.' },
    marguerite: { name: 'Marguerite', plural: 'Marguerites', price: 4, desc: 'Onze pétales et un cœur doré.' },
    cosmos: { name: 'Cosmos', plural: 'Cosmos', price: 4, desc: 'Huit pétales ronds, tout en légèreté.' },
    hortensia: { name: 'Hortensia', plural: 'Hortensias', price: 6, desc: 'Un nuage de petites fleurs pour le volume.' },
    lavande: { name: 'Brin de lavande', plural: 'Brins de lavande', price: 3, desc: 'Une touche champêtre.' },
    gypsophile: { name: 'Gypsophile', plural: 'Brins de gypsophile', price: 3, desc: 'De minuscules fleurs comme des flocons.' },
    eucalyptus: { name: 'Eucalyptus', plural: 'Branches d’eucalyptus', price: 2, desc: 'Le feuillage vert sauge qui sublime tout.', fixedColor: 'sauge' }
  },

  builder: {
    basePrice: 8,      // papier, ruban et petite carte
    maxFlowers: 20,
    start: {
      color: 'rose',
      paper: 'nacre',
      ribbon: 'satin_rose',
      message: 'Pour toi, avec douceur',
      flowers: [['tulipe', 'rose'], ['marguerite', 'blanc'], ['rose', 'lilas'], ['cosmos', 'peche'], ['tulipe', 'lilas'], ['gypsophile', 'blanc'], ['eucalyptus']]
    },
    // Harmonies utilisées par le bouton « Surprise »
    palettes: [
      { colors: ['rose', 'blanc', 'lilas'], paper: 'nacre', ribbon: 'satin_rose' },
      { colors: ['peche', 'vanille', 'blanc'], paper: 'lin', ribbon: 'peche' },
      { colors: ['ciel', 'blanc', 'lilas'], paper: 'ciel', ribbon: 'ivoire' },
      { colors: ['lilas', 'lavande', 'rose'], paper: 'lilas', ribbon: 'lilas' },
      { colors: ['menthe', 'vanille', 'blanc'], paper: 'sauge', ribbon: 'sauge' },
      { colors: ['corail', 'peche', 'rose'], paper: 'poudre', ribbon: 'peche' },
      { colors: ['bonbon', 'rose', 'blanc'], paper: 'poudre', ribbon: 'satin_rose' }
    ]
  },

  /* ---------- Boutique ---------- */
  categories: [
    { id: 'all', name: 'Tout' },
    { id: 'bouquets', name: 'Bouquets' },
    { id: 'petits', name: 'Petites attentions' },
    { id: 'mariage', name: 'Mariage' },
    { id: 'cadeaux', name: 'Cartes cadeaux' }
  ],

  /*
   * Chaque produit : id, name, category, price, desc, bg (couleur de fond),
   * badge (facultatif), image (photo facultative), bouquet (illustration),
   * options (facultatif). Dans bouquet.flowers, '$main' prend la couleur
   * choisie dans les options.
   */
  products: [
    {
      id: 'guimauve',
      name: 'Bouquet Guimauve',
      category: 'bouquets',
      price: 39,
      badge: 'Coup de cœur',
      bg: '#F8E4E9',
      desc: 'Des tulipes rose poudré et des marguerites blanches, nouées d’un ruban satiné. Une douceur absolue, à offrir sans occasion particulière.',
      details: ['9 fleurs façonnées à la main', 'Papier blanc nacré & ruban satiné'],
      bouquet: { paper: 'nacre', ribbon: 'satin_rose', flowers: [['tulipe', '$main'], ['marguerite', 'blanc'], ['tulipe', '$main'], ['marguerite', 'blanc'], ['tulipe', '$main'], ['gypsophile', 'blanc'], ['eucalyptus'], ['marguerite', 'blanc'], ['tulipe', '$main']] },
      options: { label: 'Couleur des tulipes', choices: [{ name: 'Rose poudré', color: 'rose' }, { name: 'Lilas', color: 'lilas' }, { name: 'Pêche', color: 'peche' }] }
    },
    {
      id: 'lavande-lin',
      name: 'Bouquet Lavande & Lin',
      category: 'bouquets',
      price: 45,
      bg: '#ECE6F6',
      desc: 'Des brins de lavande, des hortensias lilas et de l’eucalyptus, dans un papier couleur lin. Un air de Provence qui ne fane pas.',
      details: ['10 fleurs & feuillages', 'Papier lin & ruban lilas'],
      bouquet: { paper: 'lin', ribbon: 'lilas', flowers: [['hortensia', 'lilas'], ['rose', 'lavande'], ['hortensia', 'lilas'], ['cosmos', 'blanc'], ['rose', 'lilas'], ['lavande', 'lavande'], ['lavande', 'lavande'], ['eucalyptus'], ['lavande', 'lavande'], ['eucalyptus']] }
    },
    {
      id: 'matin-de-mai',
      name: 'Bouquet Matin de Mai',
      category: 'bouquets',
      price: 52,
      badge: 'Nouveau',
      bg: '#FBEBDF',
      desc: 'Un joyeux mélange de cosmos, de roses spirales et de gypsophile, dans toutes les teintes tendres du printemps.',
      details: ['13 fleurs & feuillages', 'Papier rose poudré & ruban pêche'],
      bouquet: { paper: 'poudre', ribbon: 'peche', flowers: [['rose', 'peche'], ['cosmos', 'rose'], ['marguerite', 'blanc'], ['rose', 'vanille'], ['cosmos', 'lilas'], ['tulipe', 'corail'], ['hortensia', 'ciel'], ['cosmos', 'peche'], ['rose', 'bonbon'], ['gypsophile', 'blanc'], ['eucalyptus'], ['lavande', 'lavande'], ['gypsophile', 'blanc']] }
    },
    {
      id: 'nuage',
      name: 'Bouquet Nuage',
      category: 'bouquets',
      price: 44,
      bg: '#E3EDF8',
      desc: 'Des hortensias bleu ciel et blanc nacré, une gypsophile aérienne : comme un ciel d’été, tout en légèreté.',
      details: ['8 fleurs & feuillages', 'Papier ciel & ruban ivoire'],
      bouquet: { paper: 'ciel', ribbon: 'ivoire', flowers: [['hortensia', 'ciel'], ['hortensia', 'blanc'], ['rose', 'ciel'], ['hortensia', 'ciel'], ['marguerite', 'blanc'], ['gypsophile', 'blanc'], ['gypsophile', 'blanc'], ['eucalyptus']] }
    },
    {
      id: 'bonbon',
      name: 'Mini-bouquet Bonbon',
      category: 'petits',
      price: 19,
      bg: '#FBE4EC',
      desc: 'Trois roses spirales et un nuage de gypsophile. Le petit cadeau qui fait fondre, à glisser dans un sac ou sur un bureau.',
      details: ['4 fleurs façonnées à la main', 'Papier rose poudré'],
      bouquet: { paper: 'poudre', ribbon: 'satin_rose', flowers: [['rose', '$main'], ['rose', 'peche'], ['rose', 'bonbon'], ['gypsophile', 'blanc']] },
      options: { label: 'Teinte principale', choices: [{ name: 'Rose poudré', color: 'rose' }, { name: 'Lilas', color: 'lilas' }, { name: 'Vanille', color: 'vanille' }] }
    },
    {
      id: 'pot-marguerites',
      name: 'Petit pot de marguerites',
      category: 'petits',
      price: 26,
      bg: '#F6F0D8',
      desc: 'Des marguerites éternelles dans un petit pot : le rayon de soleil d’un bureau, d’une étagère ou d’une table de chevet.',
      details: ['5 fleurs & feuillage', 'Petit pot inclus'],
      bouquet: { container: 'pot', pot: 'terracotta', flowers: [['marguerite', 'blanc'], ['marguerite', 'vanille'], ['marguerite', 'blanc'], ['marguerite', 'blanc'], ['eucalyptus']] }
    },
    {
      id: 'tulipe-unite',
      name: 'Tulipe à l’unité',
      category: 'petits',
      price: 6,
      bg: '#F1EAF8',
      desc: 'Une tulipe nouée d’un petit ruban, dans la couleur de votre choix. Simple, mais tellement jolie.',
      details: ['1 tulipe façonnée à la main', 'Ruban noué'],
      bouquet: { container: 'none', ribbon: 'satin_rose', flowers: [['tulipe', '$main']] },
      options: { label: 'Couleur', choices: [{ name: 'Lilas', color: 'lilas' }, { name: 'Rose poudré', color: 'rose' }, { name: 'Pêche', color: 'peche' }, { name: 'Bleu ciel', color: 'ciel' }, { name: 'Vanille', color: 'vanille' }, { name: 'Blanc nacré', color: 'blanc' }] }
    },
    {
      id: 'mariee',
      name: 'Bouquet de mariée',
      category: 'mariage',
      price: 79,
      priceFrom: true,
      badge: 'Sur mesure',
      bg: '#F5EFE8',
      desc: 'Blanc nacré, rose poudré et eucalyptus, composé sur mesure pour le plus beau jour. Un souvenir qui ne fanera jamais. Boutonnières et décorations assorties sur demande.',
      details: ['Composition entièrement personnalisée', 'Boutonnières & déco de table assorties', 'Devis gratuit sur simple message'],
      bouquet: { container: 'none', ribbon: 'ivoire', flowers: [['rose', 'blanc'], ['hortensia', 'blanc'], ['rose', 'rose'], ['marguerite', 'blanc'], ['rose', 'blanc'], ['cosmos', 'rose'], ['gypsophile', 'blanc'], ['eucalyptus'], ['gypsophile', 'blanc'], ['eucalyptus'], ['rose', 'vanille']] }
    },
    {
      id: 'carte-cadeau',
      name: 'Carte cadeau',
      category: 'cadeaux',
      price: 25,
      giftcard: true,
      bg: '#E8F2EB',
      desc: 'Laissez-lui le plaisir de composer son propre bouquet. Valable sur toute la boutique et sur les créations sur mesure.',
      details: ['Envoyée par message, prête à offrir', 'Valable sur toute la boutique'],
      options: { label: 'Montant', choices: [{ name: '25 €', price: 25 }, { name: '50 €', price: 50 }, { name: '75 €', price: 75 }] }
    }
  ],

  /* ---------- Occasions (chaque carte pré-remplit le compositeur) ---------- */
  occasions: [
    { id: 'anniversaire', title: 'Anniversaire', text: 'Un bouquet qui durera bien plus longtemps que les bougies.', bg: '#FBE6EA', preset: { paper: 'poudre', ribbon: 'satin_rose', message: 'Joyeux anniversaire !', flowers: [['rose', 'bonbon'], ['cosmos', 'peche'], ['marguerite', 'blanc'], ['tulipe', 'corail'], ['rose', 'vanille'], ['gypsophile', 'blanc'], ['eucalyptus']] } },
    { id: 'naissance', title: 'Naissance', text: 'Tout doux et sans pollen : parfait pour une chambre de bébé.', bg: '#E3EDF8', preset: { paper: 'ciel', ribbon: 'ivoire', message: 'Bienvenue au monde, petit cœur', flowers: [['hortensia', 'ciel'], ['marguerite', 'blanc'], ['rose', 'ciel'], ['cosmos', 'blanc'], ['gypsophile', 'blanc'], ['eucalyptus']] } },
    { id: 'mariage', title: 'Mariage', text: 'Bouquet de mariée, boutonnières, décorations de table…', bg: '#F5EFE8', preset: { paper: 'nacre', ribbon: 'ivoire', message: 'Pour la vie', flowers: [['rose', 'blanc'], ['hortensia', 'blanc'], ['rose', 'rose'], ['marguerite', 'blanc'], ['gypsophile', 'blanc'], ['eucalyptus'], ['eucalyptus']] } },
    { id: 'fete-des-meres', title: 'Fête des mères', text: 'Pour lui dire merci, aujourd’hui et pour toujours.', bg: '#F1E9F8', preset: { paper: 'lilas', ribbon: 'lilas', message: 'Merci maman, je t’aime', flowers: [['tulipe', 'lilas'], ['rose', 'rose'], ['tulipe', 'lavande'], ['hortensia', 'lilas'], ['lavande', 'lavande'], ['eucalyptus']] } },
    { id: 'merci', title: 'Juste parce que', text: 'Les plus jolis bouquets n’attendent pas d’occasion.', bg: '#FBEEDF', preset: { paper: 'lin', ribbon: 'peche', message: 'Juste parce que', flowers: [['cosmos', 'peche'], ['marguerite', 'vanille'], ['rose', 'corail'], ['tulipe', 'peche'], ['gypsophile', 'blanc'], ['eucalyptus']] } },
    { id: 'deco', title: 'Déco maison', text: 'Une touche pastel qui illumine une pièce, sans jamais faner.', bg: '#E6F2EA', preset: { paper: 'sauge', ribbon: 'sauge', message: '', flowers: [['marguerite', 'blanc'], ['cosmos', 'menthe'], ['tulipe', 'vanille'], ['hortensia', 'menthe'], ['eucalyptus'], ['lavande', 'lavande']] } }
  ],

  /* ---------- Bouquet de la page d'accueil ---------- */
  hero: {
    bouquet: { paper: 'poudre', ribbon: 'lilas', flowers: [['hortensia', 'lilas'], ['rose', 'rose'], ['tulipe', 'peche'], ['marguerite', 'blanc'], ['cosmos', 'ciel'], ['rose', 'vanille'], ['tulipe', 'bonbon'], ['cosmos', 'lilas'], ['marguerite', 'blanc'], ['rose', 'peche'], ['tulipe', 'rose'], ['lavande', 'lavande'], ['gypsophile', 'blanc'], ['eucalyptus'], ['lavande', 'lavande'], ['eucalyptus'], ['gypsophile', 'blanc']] },
    featured: 'matin-de-mai'
  },

  /* ---------- Instagram ----------
     Ajoutez ici les photos de vos publications (déposées dans assets/photos/).
     Tant que la liste est vide, des illustrations sont affichées. */
  instagram: {
    photos: [
      // { src: 'assets/photos/insta-1.jpg', alt: 'Bouquet de tulipes rose poudré' },
    ]
  },

  /* ---------- Avis clients ----------
     La section n'apparaît que si vous ajoutez de vrais avis, par exemple :
     { name: 'Camille', text: 'Un bouquet magnifique…', occasion: 'Anniversaire' } */
  reviews: []
};
