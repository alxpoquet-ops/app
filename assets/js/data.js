/* ==========================================================================
   Flore & Chenilles — CONTENU DU SITE
   --------------------------------------------------------------------------
   C'est ici que l'on modifie les créations, les prix, les couleurs, les fleurs
   du compositeur « Votre bouquet à vous », les occasions et les coordonnées.
   Pas besoin de toucher au reste du code.

   Les créations, photos et descriptions viennent du compte Instagram
   @flore_et_chenilles. Prix : seule la fleur à l'unité (5 €) est connue ;
   les autres créations sont « sur demande » (price: null). Pour afficher un
   prix, remplacez null par un nombre, par exemple price: 45.

   Photos : déposez le fichier dans assets/photos/ puis indiquez
   image: 'assets/photos/mon-bouquet.jpg'
   ========================================================================== */

window.SITE = {
  brand: {
    name: 'Flore & Chenilles',
    instagram: 'flore_et_chenilles', // identifiant Instagram, sans le @
    logo: 'assets/photos/logo.jpg',
    city: 'Signy-l’Abbaye',
    region: 'Ardennes'
  },

  contact: {
    // Laissez vide pour que les messages et commandes passent par Instagram.
    // Renseignez une adresse pour ajouter le bouton « Envoyer par e-mail ».
    email: '',
    // Lien de la page Facebook, si vous voulez l'afficher (ex. 'https://www.facebook.com/...').
    facebook: '',
    // Optionnel : URL d'un formulaire Formspree (https://formspree.io/f/xxxxxx)
    // pour recevoir les messages directement par e-mail, sans quitter le site.
    formEndpoint: ''
  },

  /* ---------- Livraison & retrait ---------- */
  delivery: {
    radiusKm: 20,     // livraison possible dans ce rayon autour de l'atelier
    pricePerKm: 0.4   // puis ce prix par kilomètre supplémentaire (en €)
  },

  /* ---------- Couleurs des fleurs (celles de ses créations) ---------- */
  colors: {
    blanc: { name: 'Blanc', hex: '#FBF6F1' },
    jaune: { name: 'Jaune', hex: '#F7D25E' },
    orange: { name: 'Orange doux', hex: '#F5B07D' },
    rose: { name: 'Rose', hex: '#F4ADC5' },
    fuchsia: { name: 'Fuchsia', hex: '#E26DA6' },
    bordeaux: { name: 'Bordeaux', hex: '#A3365D' },
    mauve: { name: 'Mauve', hex: '#C8A0E2' },
    lavande: { name: 'Lavande', hex: '#B3B0EC' },
    ciel: { name: 'Bleu ciel', hex: '#A8D3F0' },
    bleu: { name: 'Bleu', hex: '#6E9DE6' },
    turquoise: { name: 'Turquoise', hex: '#8ED6D0' },
    sauge: { name: 'Vert feuillage', hex: '#A9C3A2', hidden: true },
    tournesol: { name: 'Jaune tournesol', hex: '#F5C451', hidden: true }
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

  /* ---------- Fleurs du compositeur « Votre bouquet à vous » ---------- */
  flowers: {
    lys: { name: 'Lys', plural: 'Lys', desc: 'Grandes étoiles aux étamines dorées.' },
    arum: { name: 'Arum', plural: 'Arums', desc: 'Un cornet élégant.' },
    pavot: { name: 'Pavot', plural: 'Pavots', desc: 'Quatre grands pétales et un cœur sombre.' },
    gerbera: { name: 'Gerbera', plural: 'Gerberas', desc: 'Tout doux, plein de pétales.' },
    rose: { name: 'Rose', plural: 'Roses', desc: 'Une rose délicate, enroulée à la main.' },
    tulipe: { name: 'Tulipe', plural: 'Tulipes', desc: 'Une tulipe lumineuse.' },
    hortensia: { name: 'Hortensia', plural: 'Hortensias', desc: 'Un nuage de petites fleurs.' },
    tournesol: { name: 'Tournesol', plural: 'Tournesols', desc: 'Un soleil au milieu du bouquet.', fixedColor: 'tournesol' },
    jonquille: { name: 'Jonquille', plural: 'Jonquilles', desc: 'Le printemps toute l’année.' },
    eucalyptus: { name: 'Feuillage', plural: 'Feuillages', desc: 'Pour habiller le bouquet.', fixedColor: 'sauge' }
  },

  builder: {
    maxFlowers: 20,
    start: {
      color: 'mauve',
      paper: 'lilas',
      ribbon: 'lilas',
      message: 'Pour toi, avec douceur',
      flowers: [['lys', 'mauve'], ['hortensia', 'mauve'], ['pavot', 'mauve'], ['pavot', 'lavande'], ['hortensia', 'lavande'], ['pavot', 'fuchsia'], ['arum', 'fuchsia'], ['eucalyptus'], ['eucalyptus']]
    },
    // Harmonies utilisées par le bouton « Surprise » (inspirées de ses bouquets)
    palettes: [
      { colors: ['mauve', 'lavande', 'fuchsia'], paper: 'lilas', ribbon: 'lilas' },
      { colors: ['blanc', 'jaune'], paper: 'nacre', ribbon: 'ivoire' },
      { colors: ['bordeaux', 'rose'], paper: 'poudre', ribbon: 'satin_rose' },
      { colors: ['ciel', 'rose', 'jaune'], paper: 'ciel', ribbon: 'ivoire' },
      { colors: ['ciel', 'bleu', 'lavande'], paper: 'ciel', ribbon: 'ciel' },
      { colors: ['fuchsia', 'turquoise', 'jaune', 'orange'], paper: 'nacre', ribbon: 'peche' }
    ]
  },

  /* ---------- Boutique ---------- */
  categories: [
    { id: 'all', name: 'Tout' },
    { id: 'bouquets', name: 'Bouquets' },
    { id: 'deco', name: 'Déco' },
    { id: 'cadeaux', name: 'Petits cadeaux' },
    { id: 'sur-mesure', name: 'Sur-mesure' }
  ],

  /*
   * Chaque création : id, name, category, price (null = sur demande),
   * quote (true = sur devis), desc, quote_text (ses mots), composition,
   * image, post (lien Instagram), badge, preset (bouquet à personnaliser
   * dans le compositeur), options.
   */
  products: [
    {
      id: 'amethyste',
      name: 'Bouquet Améthyste',
      category: 'bouquets',
      price: null,
      image: 'assets/photos/amethyste.jpg',
      post: 'https://www.instagram.com/p/DZnYTQ9uuTf/',
      bg: '#EFE7F7',
      words: 'Un joli camaïeu de violet et du vert pâle pour un bouquet plein de douceur.',
      desc: 'Lys XL, hortensias, pavots et arums, du mauve au fuchsia.',
      composition: [
        { color: 'mauve', text: 'Lys XL, hortensia et pavot' },
        { color: 'lavande', text: 'Pavot et hortensia' },
        { color: 'fuchsia', text: 'Pavot et arum' }
      ],
      preset: { paper: 'lilas', ribbon: 'lilas', flowers: [['lys', 'mauve'], ['hortensia', 'mauve'], ['pavot', 'mauve'], ['pavot', 'lavande'], ['hortensia', 'lavande'], ['pavot', 'fuchsia'], ['arum', 'fuchsia'], ['eucalyptus'], ['eucalyptus']] }
    },
    {
      id: 'sunny',
      name: 'Bouquet Sunny',
      category: 'bouquets',
      price: null,
      image: 'assets/photos/sunny.jpg',
      post: 'https://www.instagram.com/p/DZiO8gHuCi0/',
      bg: '#FBF1D8',
      words: 'Du jaune et du blanc par cette belle journée ensoleillée.',
      desc: 'Arums, lys XL, gerberas, pavots, tulipes et roses, en blanc et en jaune.',
      composition: [
        { color: 'blanc', text: 'Arum, lys XL et gerbera' },
        { color: 'jaune', text: 'Pavot, tulipe, rose et gerbera' }
      ],
      preset: { paper: 'nacre', ribbon: 'ivoire', flowers: [['arum', 'blanc'], ['lys', 'blanc'], ['gerbera', 'blanc'], ['pavot', 'jaune'], ['tulipe', 'jaune'], ['rose', 'jaune'], ['gerbera', 'jaune'], ['eucalyptus']] }
    },
    {
      id: 'rubis',
      name: 'Bouquet Rubis',
      category: 'bouquets',
      price: null,
      image: 'assets/photos/rubis.jpg',
      post: 'https://www.instagram.com/p/DZfomFwASlV/',
      bg: '#F8E1E8',
      words: 'Du rouge profond et un rose clair pour contraster.',
      desc: 'Lys, arums, roses, pavots, tulipes et gerberas, en bordeaux et en rose.',
      composition: [
        { color: 'bordeaux', text: 'Lys XL, arum, rose et pavot' },
        { color: 'rose', text: 'Lys, tulipe et gerbera' }
      ],
      preset: { paper: 'poudre', ribbon: 'satin_rose', flowers: [['lys', 'bordeaux'], ['arum', 'bordeaux'], ['rose', 'bordeaux'], ['pavot', 'bordeaux'], ['lys', 'rose'], ['tulipe', 'rose'], ['gerbera', 'rose'], ['eucalyptus']] }
    },
    {
      id: 'colore',
      name: 'Bouquet coloré',
      category: 'bouquets',
      price: null,
      image: 'assets/photos/colore.jpg',
      post: 'https://www.instagram.com/p/DZchj73g6-p/',
      bg: '#E3F3F1',
      words: 'J’ai préparé un bouquet plein de couleurs. Est-ce qu’il irait bien chez vous ?',
      desc: 'Un bouquet joyeux et multicolore. Une idée de couleurs pour votre salon ou votre chambre ? On peut essayer ensemble.',
      preset: { paper: 'nacre', ribbon: 'peche', flowers: [['lys', 'fuchsia'], ['arum', 'turquoise'], ['gerbera', 'turquoise'], ['tulipe', 'jaune'], ['rose', 'fuchsia'], ['pavot', 'orange'], ['eucalyptus']] }
    },
    {
      id: 'tulipes',
      name: 'Tulipes',
      category: 'bouquets',
      price: null,
      image: 'assets/photos/tulipes.jpg',
      post: 'https://www.instagram.com/p/DZW6_7iOtcA/',
      bg: '#EAF2FA',
      words: 'Quelques tulipes pour fleurir votre journée.',
      desc: 'Des tulipes bleue, rose et jaune, avec leur feuillage.',
      composition: [
        { color: 'bleu', text: 'Tulipe' },
        { color: 'rose', text: 'Tulipe' },
        { color: 'jaune', text: 'Tulipe' }
      ],
      preset: { paper: 'nacre', ribbon: 'ivoire', flowers: [['tulipe', 'bleu'], ['tulipe', 'rose'], ['tulipe', 'jaune'], ['eucalyptus']] }
    },
    {
      id: 'hortensias',
      name: 'Hortensias',
      category: 'bouquets',
      price: null,
      image: 'assets/photos/hortensias.jpg',
      post: 'https://www.instagram.com/p/DZU2kcKAtXf/',
      bg: '#E6EEF9',
      words: 'N’hésitez pas à passer commande.',
      desc: 'Des hortensias bleu ciel et lilas. Des blancs et des violets arrivent bientôt.',
      composition: [
        { color: 'ciel', text: 'Hortensias' },
        { color: 'lavande', text: 'Hortensia' }
      ],
      preset: { paper: 'ciel', ribbon: 'ciel', flowers: [['hortensia', 'ciel'], ['hortensia', 'ciel'], ['hortensia', 'lavande'], ['eucalyptus']] }
    },
    {
      id: 'bonsai',
      name: 'Bonsaï azalée',
      category: 'deco',
      price: null,
      badge: 'Nouveauté',
      image: 'assets/photos/bonsai.jpg',
      post: 'https://www.instagram.com/p/DemhAU9OqEY/',
      bg: '#EDF3E4',
      words: 'Voici une de mes nouvelles créations, j’en suis si fière ! Alors, vous l’adoptez ?',
      desc: 'Un bonsaï azalée en fil chenille : tronc torsadé, feuillage vert et fleurs roses, dans un petit pot blanc.'
    },
    {
      id: 'theiere',
      name: 'Théière fleurie',
      category: 'deco',
      price: null,
      badge: 'Pièce unique',
      image: 'assets/photos/theiere.jpg',
      post: 'https://www.instagram.com/p/Da5WBcjAoWX/',
      bg: '#E9F0F7',
      words: 'En brocante, j’ai trouvé cette jolie petite théière d’une ancienne dînette. Je me suis amusée à la fleurir.',
      desc: 'Une théière en porcelaine chinée, fleurie de bleu, de lilas et de rose. Chaque pièce chinée est unique : demandez-moi les contenants disponibles.'
    },
    {
      id: 'jonquilles',
      name: 'Petit pot de jonquilles',
      category: 'deco',
      price: null,
      image: 'assets/photos/jonquilles.jpg',
      post: 'https://www.instagram.com/p/DZSA5rWOpb6/',
      bg: '#FBF3D6',
      words: 'Un joli petit pot de jonquilles.',
      desc: 'Des jonquilles jaunes dans un pot lilas noué d’un ruban : le printemps toute l’année.',
      preset: { paper: 'lilas', ribbon: 'ivoire', flowers: [['jonquille', 'jaune'], ['jonquille', 'jaune'], ['jonquille', 'jaune'], ['jonquille', 'jaune'], ['jonquille', 'jaune'], ['eucalyptus']] }
    },
    {
      id: 'fleur-unite',
      name: 'Fleur à l’unité',
      category: 'cadeaux',
      price: 5,
      image: 'assets/photos/fleur-unite.jpg',
      post: 'https://www.instagram.com/p/DZp6uWft2Xz/',
      bg: '#F3ECE6',
      words: 'Une rose délicate, un pavot mignon, un gerbera tout doux, un joli lys, une tulipe lumineuse… Laquelle choisissez-vous ?',
      desc: 'Une fleur éternelle et douce, à offrir pour dire merci, par exemple à la maîtresse, au maître ou à l’ATSEM en fin d’année.',
      options: {
        label: 'Votre fleur',
        choices: [
          { name: 'Une rose délicate', image: 'assets/photos/fu-rose.jpg' },
          { name: 'Un pavot mignon', image: 'assets/photos/fu-pavot.jpg' },
          { name: 'Un gerbera tout doux', image: 'assets/photos/fu-gerbera.jpg' },
          { name: 'Un joli lys', image: 'assets/photos/fu-lys.jpg' },
          { name: 'Une tulipe lumineuse', image: 'assets/photos/fu-tulipe.jpg' }
        ]
      }
    },
    {
      id: 'centre-de-table',
      name: 'Centre de table tournesols',
      category: 'sur-mesure',
      price: null,
      quote: true,
      badge: 'Sur commande',
      image: 'assets/photos/tournesols.jpg',
      post: 'https://www.instagram.com/p/Da3c-dyjutu/',
      bg: '#FCEFD9',
      words: 'Peu importe où l’on est assis à la table, le bouquet offre des fleurs à voir de chaque côté.',
      desc: 'Une commande spéciale pour fleurir une table : des tournesols, de petites fleurs bleues et mauves et du feuillage. Pour tous vos projets fleuris, demandez-moi un devis.'
    },
    {
      id: 'souvenir',
      name: 'Fleurs du souvenir sous cloche',
      category: 'sur-mesure',
      price: null,
      quote: true,
      badge: 'En souvenir',
      bg: '#EDF0F2',
      bouquet: { container: 'cloche', flowers: [['rose', 'blanc'], ['hortensia', 'lavande'], ['lys', 'blanc'], ['rose', 'rose'], ['pavot', 'mauve'], ['eucalyptus'], ['eucalyptus']] },
      desc: 'Pour honorer la mémoire d’un être cher : une composition de fleurs éternelles, à l’abri sous une cloche de verre, pour fleurir une sépulture avec délicatesse en toute saison.',
      illustration: 'Illustration : chaque composition est réalisée sur-mesure, selon vos souhaits.'
    },
    {
      id: 'a-votre-image',
      name: 'Un bouquet à votre image',
      category: 'sur-mesure',
      price: null,
      quote: true,
      badge: 'Sur-mesure',
      image: 'assets/photos/odile.jpg',
      post: 'https://www.instagram.com/p/DZsDjVbghCY/',
      bg: '#ECE9F8',
      words: 'C’est une commande que j’ai reçue, et la voici terminée ! N’hésitez pas à me commander un bouquet à votre image.',
      desc: 'Vos couleurs, vos fleurs préférées, votre occasion : je compose un bouquet rien que pour vous, comme celui-ci en bleu et violet.'
    }
  ],

  /* ---------- Occasions (chaque carte pré-remplit le compositeur) ---------- */
  occasions: [
    { id: 'anniversaire', title: 'Anniversaire', text: 'Un bouquet qui durera bien plus longtemps que les bougies.', bg: '#FBE6EA', preset: { paper: 'poudre', ribbon: 'satin_rose', message: 'Joyeux anniversaire !', flowers: [['gerbera', 'rose'], ['rose', 'fuchsia'], ['lys', 'rose'], ['tulipe', 'jaune'], ['pavot', 'orange'], ['eucalyptus']] } },
    { id: 'naissance', title: 'Naissance', text: 'Tout doux et sans pollen : parfait pour une chambre de bébé.', bg: '#E3EDF8', preset: { paper: 'ciel', ribbon: 'ivoire', message: 'Bienvenue petit cœur', flowers: [['hortensia', 'ciel'], ['tulipe', 'blanc'], ['rose', 'ciel'], ['gerbera', 'blanc'], ['eucalyptus']] } },
    { id: 'evenements', title: 'Mariage & évènements', text: 'Bouquets, centres de table, décorations : je fleuris vos évènements sur-mesure.', bg: '#F5EFE8', preset: { paper: 'nacre', ribbon: 'ivoire', message: 'Pour la vie', flowers: [['arum', 'blanc'], ['lys', 'blanc'], ['rose', 'blanc'], ['hortensia', 'blanc'], ['gerbera', 'rose'], ['eucalyptus'], ['eucalyptus']] } },
    { id: 'maitresse', title: 'Merci la maîtresse', text: 'Une fleur éternelle pour remercier la maîtresse, le maître ou l’ATSEM : 5 € la fleur.', bg: '#F1E9F8', product: 'fleur-unite', preset: { paper: 'nacre', ribbon: 'satin_rose', message: 'Merci pour cette belle année', flowers: [['lys', 'rose']] } },
    { id: 'souvenir', title: 'En souvenir', text: 'Une composition sous cloche de verre, pour fleurir avec délicatesse la sépulture d’un être cher.', bg: '#EDF0F2', product: 'souvenir', preset: { container: 'cloche', flowers: [['rose', 'blanc'], ['hortensia', 'lavande'], ['lys', 'blanc'], ['rose', 'rose'], ['eucalyptus']] } },
    { id: 'merci', title: 'Juste parce que', text: 'Les plus jolis bouquets n’attendent pas d’occasion.', bg: '#FBEEDF', preset: { paper: 'lin', ribbon: 'peche', message: 'Juste parce que', flowers: [['tournesol'], ['pavot', 'orange'], ['gerbera', 'jaune'], ['tulipe', 'jaune'], ['eucalyptus']] } }
  ],

  /* ---------- Accueil ---------- */
  hero: {
    slides: ['amethyste', 'sunny', 'rubis', 'centre-de-table', 'colore', 'tulipes'],
    featured: 'bonsai'
  },

  /* ---------- Instagram : photos de la mosaïque, reliées à leur publication ---------- */
  instagram: {
    photos: [
      { src: 'assets/photos/insta-hortensias.jpg', alt: 'Hortensias bleus et lilas', url: 'https://www.instagram.com/p/DZU2kcKAtXf/' },
      { src: 'assets/photos/insta-tournesol.jpg', alt: 'Tournesol et petites fleurs mauves', url: 'https://www.instagram.com/p/Da3c-dyjutu/' },
      { src: 'assets/photos/insta-odile.jpg', alt: 'Bouquet bleu et violet réalisé sur commande', url: 'https://www.instagram.com/p/DZsDjVbghCY/' },
      { src: 'assets/photos/insta-tulipes.jpg', alt: 'Tulipes bleue, rose et jaune', url: 'https://www.instagram.com/p/DZW6_7iOtcA/' },
      { src: 'assets/photos/insta-tournesol-2.jpg', alt: 'Tournesol en fil chenille', url: 'https://www.instagram.com/p/Da3c-dyjutu/' },
      { src: 'assets/photos/insta-theiere.jpg', alt: 'Théière de dînette fleurie', url: 'https://www.instagram.com/p/Da5WBcjAoWX/' }
    ]
  },

  /* ---------- Avis clients ----------
     La section n'apparaît que si vous ajoutez de vrais avis, par exemple :
     { name: 'Camille', text: 'Un bouquet magnifique…', occasion: 'Anniversaire' } */
  reviews: []
};
