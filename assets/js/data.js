/* ==========================================================================
   Flore & Chenilles — CONTENU DU SITE
   --------------------------------------------------------------------------
   C'est ici que l'on modifie les créations, les prix, la livraison, les
   fleurs du compositeur « Votre bouquet à vous », les occasions et les
   coordonnées. Pas besoin de toucher au reste du code.

   Prix : les fleurs à l'unité coûtent unitPrice (8 €) ; les autres créations
   sont « sur demande » tant qu'aucun prix n'est indiqué. Pour afficher un
   prix, ajoutez par exemple price: 45 dans la création.

   Photos :
   - photo: 'g087' utilise les images de la galerie de Laurine
     (assets/gallery/g087-s.webp pour la vignette, g087.webp en grand) ;
   - image: 'assets/photos/mon-bouquet.jpg' pour une photo déposée dans
     assets/photos/ (format portrait 4:5 idéalement) ;
   - more: ['g046', …] ajoute d'autres photos de la même création.
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
    // Adresse e-mail qui reçoit les messages du formulaire et les commandes.
    // L'envoi passe par le service gratuit FormSubmit (formsubmit.co) : au tout
    // premier envoi, FormSubmit écrit à cette adresse pour faire confirmer
    // l'activation (un clic sur « Activate Form »). Ensuite, tout arrive directement.
    email: '',
    // Afficher aussi cette adresse sur le site (rubrique Contact et pied de page) ?
    showEmail: true,
    // Lien de la page Facebook, si vous voulez l'afficher (ex. 'https://www.facebook.com/...').
    facebook: '',
    // Optionnel : adresse d'un autre service d'envoi (Formspree…), à la place de FormSubmit.
    formEndpoint: ''
  },

  /* ---------- Prix d'une fleur à l'unité (en €) ---------- */
  unitPrice: 8,

  /* ---------- Offre de lancement ----------
     Remise appliquée automatiquement à toutes les créations, du jour « from »
     au jour « until » inclus (format AAAA-MM-JJ). Après cette date, l'offre
     disparaît toute seule du site. Pour la supprimer plus tôt : percent: 0. */
  promo: {
    label: 'Offre de lancement',
    percent: 10,
    from: '2026-11-04',
    until: '2027-01-04'
  },

  /* ---------- Papillons et chenilles animés un peu partout sur la page ---------- */
  critters: true,

  /* ---------- Emballage (le même pour toutes les créations) ---------- */
  packaging: 'Pochette transparente et nœud',

  /* ---------- Livraison & retrait ----------
     Retrait gratuit à l'atelier. Livraison selon la distance depuis l'atelier ;
     au-delà de la dernière zone, on en parle ensemble. */
  delivery: {
    zones: [
      { upToKm: 15, price: 5 },
      { upToKm: 25, price: 10 }
    ]
  },

  /* ---------- Carte de vœux offerte avec chaque création ---------- */
  card: {
    maxLength: 160,
    suggestions: ['Joyeux anniversaire !', 'Merci pour tout', 'Félicitations !', 'Bienvenue, petit cœur', 'Avec tout mon amour', 'Bonne fête, maman', 'Merci, maîtresse !', 'Pensées affectueuses']
  },

  /* ---------- Couleurs des fleurs (celles de ses créations) ---------- */
  colors: {
    blanc: { name: 'Blanc', hex: '#FBF6F1' },
    jaune: { name: 'Jaune', hex: '#F7D25E' },
    orange: { name: 'Orange doux', hex: '#F5B07D' },
    rose: { name: 'Rose', hex: '#F4ADC5' },
    fuchsia: { name: 'Fuchsia', hex: '#E26DA6' },
    rouge: { name: 'Rouge', hex: '#D9455F' },
    bordeaux: { name: 'Bordeaux', hex: '#A3365D' },
    mauve: { name: 'Mauve', hex: '#C8A0E2' },
    lavande: { name: 'Lavande', hex: '#B3B0EC' },
    ciel: { name: 'Bleu ciel', hex: '#A8D3F0' },
    bleu: { name: 'Bleu', hex: '#6E9DE6' },
    turquoise: { name: 'Turquoise', hex: '#8ED6D0' },
    sauge: { name: 'Vert feuillage', hex: '#A9C3A2', hidden: true },
    tournesol: { name: 'Jaune tournesol', hex: '#F5C451', hidden: true }
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
      card: { to: '', msg: 'Pour toi, avec douceur', from: '' },
      flowers: [['lys', 'mauve'], ['hortensia', 'mauve'], ['pavot', 'mauve'], ['pavot', 'lavande'], ['hortensia', 'lavande'], ['pavot', 'fuchsia'], ['arum', 'fuchsia'], ['eucalyptus'], ['eucalyptus']]
    },
    // Harmonies utilisées par le bouton « Surprise » (inspirées de ses bouquets)
    palettes: [
      { colors: ['mauve', 'lavande', 'fuchsia'] },
      { colors: ['blanc', 'jaune'] },
      { colors: ['bordeaux', 'rose'] },
      { colors: ['ciel', 'rose', 'jaune'] },
      { colors: ['ciel', 'bleu', 'lavande'] },
      { colors: ['fuchsia', 'turquoise', 'jaune', 'orange'] },
      { colors: ['rouge', 'orange', 'jaune'] }
    ]
  },

  /* ---------- Boutique ----------
     blurb : petite phrase affichée pour les créations sans description.
     intro : texte affiché au-dessus des créations quand on choisit ce filtre
     ({prix} est remplacé par le prix d'une fleur). */
  categories: [
    { id: 'all', name: 'Tout' },
    { id: 'bouquets', name: 'Bouquets', blurb: 'Un bouquet de fleurs éternelles, façonné à la main dans mon atelier.' },
    {
      id: 'unite',
      name: 'Fleurs à l’unité',
      blurb: 'Une fleur éternelle façonnée à la main, emballée et prête à offrir.',
      intro: 'Une rose délicate, un pavot mignon, un gerbera tout doux, un joli lys, une tulipe lumineuse… Chaque fleur est à {prix}, emballée dans sa pochette transparente avec un nœud, et sa carte de vœux est offerte. Envie d’une surprise ? Essayez la fleur mystère.'
    },
    { id: 'deco', name: 'Déco & cadeaux', blurb: 'Une petite douceur fleurie, faite main, pour la maison ou pour offrir.' },
    { id: 'sur-mesure', name: 'Sur-mesure' }
  ],

  /*
   * Chaque création : id, name, category, price (sinon « sur demande »),
   * quote (true = sur devis), desc, words (ses mots), composition,
   * photo / image / more (photos), post (lien Instagram), badge,
   * preset (bouquet à personnaliser dans le compositeur), options.
   * L'ordre ci-dessous est l'ordre d'affichage.
   */
  products: [
    {
      id: 'pastel',
      name: 'Bouquet pastel aux perles',
      category: 'bouquets',
      image: 'assets/photos/pastel.jpg',
      slideImage: 'assets/photos/pastel-detail.jpg',
      more: ['assets/photos/pastel-detail.jpg', 'g097', 'g009', 'g103'],
      bg: '#F6E6EC',
      desc: 'Un bouquet tout en douceur, aux tons pêche, lilas, rose et menthe, rehaussé de petites perles nacrées.',
      preset: { flowers: [['lys', 'rose'], ['hortensia', 'lavande'], ['rose', 'orange'], ['gerbera', 'rose'], ['tulipe', 'orange'], ['pavot', 'lavande'], ['eucalyptus'], ['eucalyptus']] }
    },
    {
      id: 'amethyste',
      name: 'Bouquet Améthyste',
      category: 'bouquets',
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
      preset: { flowers: [['lys', 'mauve'], ['hortensia', 'mauve'], ['pavot', 'mauve'], ['pavot', 'lavande'], ['hortensia', 'lavande'], ['pavot', 'fuchsia'], ['arum', 'fuchsia'], ['eucalyptus'], ['eucalyptus']] }
    },
    {
      id: 'fleur-unite',
      name: 'Fleur à l’unité, au choix',
      category: 'unite',
      image: 'assets/photos/fleur-unite.jpg',
      more: ['g034'],
      post: 'https://www.instagram.com/p/DZp6uWft2Xz/',
      bg: '#F3ECE6',
      words: 'Une rose délicate, un pavot mignon, un gerbera tout doux, un joli lys, une tulipe lumineuse… Laquelle choisissez-vous ?',
      desc: 'Choisissez votre fleur et sa couleur. Une jolie attention pour dire merci, par exemple à la maîtresse, au maître ou à l’ATSEM en fin d’année.',
      options: {
        label: 'Votre fleur',
        colors: true, // propose aussi de choisir la couleur
        choices: [
          { name: 'Une rose délicate', type: 'rose', image: 'assets/photos/fu-rose.jpg' },
          { name: 'Un pavot mignon', type: 'pavot', image: 'assets/photos/fu-pavot.jpg' },
          { name: 'Un gerbera tout doux', type: 'gerbera', image: 'assets/photos/fu-gerbera.jpg' },
          { name: 'Un joli lys', type: 'lys', image: 'assets/photos/fu-lys.jpg' },
          { name: 'Une tulipe lumineuse', type: 'tulipe', image: 'assets/photos/fu-tulipe.jpg' },
          { name: 'Un arum élégant', type: 'arum', image: 'g040' }
        ]
      }
    },
    {
      id: 'fleur-mystere',
      name: 'Fleur mystère',
      category: 'unite',
      price: 6,
      art: 'mystery', // illustration dessinée : une fleur en point d'interrogation
      badge: 'Surprise',
      bg: '#F1EAF9',
      desc: 'Laissez-moi vous surprendre : je choisis la fleur et sa couleur parmi mes créations du moment. Elle arrive dans sa pochette transparente fermée d’un nœud, avec sa carte de vœux offerte.'
    },
    {
      id: 'bonsai',
      name: 'Bonsaï azalée',
      category: 'deco',
      badge: 'Nouveauté',
      image: 'assets/photos/bonsai.jpg',
      post: 'https://www.instagram.com/p/DemhAU9OqEY/',
      bg: '#EDF3E4',
      words: 'Voici une de mes nouvelles créations, j’en suis si fière ! Alors, vous l’adoptez ?',
      desc: 'Un bonsaï azalée en fil chenille : tronc torsadé, feuillage vert et fleurs roses, dans un petit pot blanc.'
    },
    {
      id: 'sunny',
      name: 'Bouquet Sunny',
      category: 'bouquets',
      image: 'assets/photos/sunny.jpg',
      post: 'https://www.instagram.com/p/DZiO8gHuCi0/',
      bg: '#FBF1D8',
      words: 'Du jaune et du blanc par cette belle journée ensoleillée.',
      desc: 'Arums, lys XL, gerberas, pavots, tulipes et roses, en blanc et en jaune.',
      composition: [
        { color: 'blanc', text: 'Arum, lys XL et gerbera' },
        { color: 'jaune', text: 'Pavot, tulipe, rose et gerbera' }
      ],
      preset: { flowers: [['arum', 'blanc'], ['lys', 'blanc'], ['gerbera', 'blanc'], ['pavot', 'jaune'], ['tulipe', 'jaune'], ['rose', 'jaune'], ['gerbera', 'jaune'], ['eucalyptus']] }
    },
    { id: 'pavots-multicolores', name: 'Pavots multicolores', category: 'bouquets', photo: 'g087', desc: 'Des pavots de toutes les couleurs, rouge, bleu, lilas, orange… Un bouquet joyeux comme un jour de fête.' },
    {
      id: 'rubis',
      name: 'Bouquet Rubis',
      category: 'bouquets',
      image: 'assets/photos/rubis.jpg',
      post: 'https://www.instagram.com/p/DZfomFwASlV/',
      bg: '#F8E1E8',
      words: 'Du rouge profond et un rose clair pour contraster.',
      desc: 'Lys, arums, roses, pavots, tulipes et gerberas, en bordeaux et en rose.',
      composition: [
        { color: 'bordeaux', text: 'Lys XL, arum, rose et pavot' },
        { color: 'rose', text: 'Lys, tulipe et gerbera' }
      ],
      preset: { flowers: [['lys', 'bordeaux'], ['arum', 'bordeaux'], ['rose', 'bordeaux'], ['pavot', 'bordeaux'], ['lys', 'rose'], ['tulipe', 'rose'], ['gerbera', 'rose'], ['eucalyptus']] }
    },
    {
      id: 'theiere',
      name: 'Théière fleurie',
      category: 'deco',
      badge: 'Pièce unique',
      image: 'assets/photos/theiere.jpg',
      post: 'https://www.instagram.com/p/Da5WBcjAoWX/',
      bg: '#E9F0F7',
      words: 'En brocante, j’ai trouvé cette jolie petite théière d’une ancienne dînette. Je me suis amusée à la fleurir.',
      desc: 'Une théière en porcelaine chinée, fleurie de bleu, de lilas et de rose. Chaque pièce chinée est unique : demandez-moi les contenants disponibles.'
    },
    {
      id: 'coquelicots',
      name: 'Bouquet de coquelicots',
      category: 'bouquets',
      image: 'assets/photos/coquelicots.jpg',
      more: ['g046'],
      bg: '#F7E3E1',
      desc: 'Des coquelicots rouges, des brins de lavande et du mimosa : un bouquet champêtre et lumineux.'
    },
    { id: 'roses-bleues', name: 'Roses bleues', category: 'bouquets', photo: 'g075', desc: 'Des roses dans tous les bleus, du bleu ciel au bleu roi, avec leur feuillage.' },
    {
      id: 'gateau',
      name: 'Gâteau d’anniversaire',
      category: 'deco',
      image: 'assets/photos/gateau.jpg',
      more: ['g025'],
      bg: '#E6EFFA',
      desc: 'Un petit gâteau en fil chenille, avec sa bougie et ses fraises, à offrir pour un anniversaire. Il ne fond pas et se garde pour toujours.'
    },
    {
      id: 'a-votre-image',
      name: 'Un bouquet à votre image',
      category: 'sur-mesure',
      quote: true,
      badge: 'Sur-mesure',
      image: 'assets/photos/odile.jpg',
      post: 'https://www.instagram.com/p/DZsDjVbghCY/',
      bg: '#ECE9F8',
      words: 'C’est une commande que j’ai reçue, et la voici terminée ! N’hésitez pas à me commander un bouquet à votre image.',
      desc: 'Vos couleurs, vos fleurs préférées, votre occasion : je compose un bouquet rien que pour vous, comme celui-ci en bleu et violet.'
    },
    {
      id: 'colore',
      name: 'Bouquet coloré',
      category: 'bouquets',
      image: 'assets/photos/colore.jpg',
      post: 'https://www.instagram.com/p/DZchj73g6-p/',
      bg: '#E3F3F1',
      words: 'J’ai préparé un bouquet plein de couleurs. Est-ce qu’il irait bien chez vous ?',
      desc: 'Un bouquet joyeux et multicolore. Une idée de couleurs pour votre salon ou votre chambre ? On peut essayer ensemble.',
      preset: { flowers: [['lys', 'fuchsia'], ['arum', 'turquoise'], ['gerbera', 'turquoise'], ['tulipe', 'jaune'], ['rose', 'fuchsia'], ['pavot', 'orange'], ['eucalyptus']] }
    },
    { id: 'lys-roses', name: 'Lys roses', category: 'bouquets', photo: 'g005', more: ['g080'], desc: 'Une gerbe de lys roses aux étamines blanches. Sur la deuxième photo, elle est prête à offrir dans sa pochette transparente.' },
    {
      id: 'lavande',
      name: 'Arrosoir de lavande',
      category: 'deco',
      image: 'assets/photos/lavande.jpg',
      bg: '#EEE9F5',
      desc: 'Des brins de lavande en fil chenille dans un petit arrosoir en métal : une touche champêtre pour la maison.'
    },
    { id: 'hortensia-lys', name: 'Hortensia bleu et lys roses', category: 'bouquets', photo: 'g027', desc: 'Un nuage d’hortensia bleu ciel, des lys roses et un arum bleu : un bouquet frais et tendre.' },
    {
      id: 'tulipes',
      name: 'Tulipes',
      category: 'bouquets',
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
      preset: { flowers: [['tulipe', 'bleu'], ['tulipe', 'rose'], ['tulipe', 'jaune'], ['eucalyptus']] }
    },
    { id: 'arums-de-feu', name: 'Arums de feu', category: 'bouquets', photo: 'g104', desc: 'Des arums rouges et jaunes, éclatants comme un coucher de soleil.' },
    { id: 'pensees-seaux', name: 'Pensées en mini seaux', category: 'deco', photo: 'g037', desc: 'De petites pensées de toutes les couleurs, chacune dans son mini seau en métal.' },
    {
      id: 'hortensias',
      name: 'Hortensias',
      category: 'bouquets',
      image: 'assets/photos/hortensias.jpg',
      post: 'https://www.instagram.com/p/DZU2kcKAtXf/',
      bg: '#E6EEF9',
      words: 'N’hésitez pas à passer commande.',
      desc: 'Des hortensias bleu ciel et lilas. Des blancs et des violets arrivent bientôt.',
      composition: [
        { color: 'ciel', text: 'Hortensias' },
        { color: 'lavande', text: 'Hortensia' }
      ],
      preset: { flowers: [['hortensia', 'ciel'], ['hortensia', 'ciel'], ['hortensia', 'lavande'], ['eucalyptus']] }
    },
    {
      id: 'muguet',
      name: 'Bouquet de muguet',
      category: 'bouquets',
      image: 'assets/photos/muguet.jpg',
      bg: '#EEF2EA',
      desc: 'Des clochettes de muguet toutes blanches, nouées d’un ruban : le porte-bonheur qui ne fane pas.'
    },
    { id: 'bouquet-soleil', name: 'Bouquet soleil', category: 'bouquets', photo: 'g129', desc: 'Gerberas, roses et lys dans des tons orangés et dorés : un bouquet plein de soleil.' },
    { id: 'lys-orange', name: 'Lys orange et jaunes', category: 'bouquets', photo: 'g092', more: ['g065'], desc: 'Une brassée de lys orange et jaune pâle, pleine de lumière.' },
    {
      id: 'souvenir',
      name: 'Fleurs du souvenir en bocal',
      category: 'sur-mesure',
      quote: true,
      badge: 'En souvenir',
      bg: '#EDF0F2',
      bouquet: { container: 'bocal', flowers: [['rose', 'blanc'], ['hortensia', 'lavande'], ['lys', 'blanc'], ['rose', 'rose'], ['pavot', 'mauve'], ['eucalyptus'], ['eucalyptus']] },
      desc: 'Pour honorer la mémoire d’un être cher : une composition de fleurs éternelles dans un bocal transparent qui la protège des intempéries, pour fleurir une sépulture avec délicatesse en toute saison.',
      illustration: 'Illustration : chaque composition est réalisée sur-mesure, selon vos souhaits.'
    },
    { id: 'rose-tendre', name: 'Bouquet rose tendre', category: 'bouquets', photo: 'g002', desc: 'Des lys, des gerberas et de petites roses dans toutes les nuances de rose.' },
    { id: 'mauve-violet', name: 'Bouquet mauve et violet', category: 'bouquets', photo: 'g017', desc: 'Un grand lys mauve, un gerbera rose et des hortensias violets.' },
    {
      id: 'jonquilles',
      name: 'Petit pot de jonquilles',
      category: 'deco',
      image: 'assets/photos/jonquilles.jpg',
      post: 'https://www.instagram.com/p/DZSA5rWOpb6/',
      bg: '#FBF3D6',
      words: 'Un joli petit pot de jonquilles.',
      desc: 'Des jonquilles jaunes dans un pot lilas noué d’un ruban : le printemps toute l’année.',
      preset: { flowers: [['jonquille', 'jaune'], ['jonquille', 'jaune'], ['jonquille', 'jaune'], ['jonquille', 'jaune'], ['jonquille', 'jaune'], ['eucalyptus']] }
    },
    { id: 'bouquet-jonquilles', name: 'Bouquet de jonquilles', category: 'bouquets', photo: 'g078', more: ['g015'], desc: 'Des jonquilles crème et jaune soleil, comme au premier jour du printemps.' },
    { id: 'lys-bordeaux', name: 'Lys blanc et bordeaux', category: 'bouquets', photo: 'g058', desc: 'Des lys blanc et bordeaux, de petites roses et des brins de muguet, noués d’un ruban rose.' },
    { id: 'petit-pastel', name: 'Petit bouquet pastel', category: 'bouquets', photo: 'g016', desc: 'Un petit bouquet tout doux : lys pêche, roses et hortensia lilas.' },
    {
      id: 'pensees',
      name: 'Pensées en pot',
      category: 'deco',
      image: 'assets/photos/pensees.jpg',
      bg: '#EFE8F6',
      desc: 'Des pensées blanches, mauves et jaunes dans un petit pot lilas : un air de printemps, toute l’année.'
    },
    { id: 'arrosoir-fleuri', name: 'Arrosoir fleuri', category: 'deco', photo: 'g141', more: ['g007'], desc: 'Un petit arrosoir garni de fleurs : ici en rose, et en jaune et orange sur la deuxième photo.' },
    { id: 'tulipes-bleues', name: 'Tulipes bleues', category: 'bouquets', photo: 'g088', desc: 'Des tulipes dans un camaïeu de bleus, du bleu ciel au bleu roi.' },
    { id: 'tulipes-de-feu', name: 'Tulipes de feu', category: 'bouquets', photo: 'g024', desc: 'Des tulipes rouges, orange et jaunes : un bouquet qui réchauffe.' },
    { id: 'tulipes-rouges-roses', name: 'Tulipes rouges et roses', category: 'bouquets', photo: 'g093', desc: 'Des tulipes rouges, roses et orangées, avec leurs longues feuilles.' },
    {
      id: 'centre-de-table',
      name: 'Centre de table tournesols',
      category: 'sur-mesure',
      quote: true,
      badge: 'Sur commande',
      image: 'assets/photos/tournesols.jpg',
      post: 'https://www.instagram.com/p/Da3c-dyjutu/',
      bg: '#FCEFD9',
      words: 'Peu importe où l’on est assis à la table, le bouquet offre des fleurs à voir de chaque côté.',
      desc: 'Une commande spéciale pour fleurir une table : des tournesols, de petites fleurs bleues et mauves et du feuillage. Pour tous vos projets fleuris, demandez-moi un devis.'
    },
    { id: 'tulipes-jaunes-orange', name: 'Tulipes jaunes et orange', category: 'bouquets', photo: 'g004', desc: 'Des tulipes jaunes et orange, lumineuses comme un matin de printemps.' },
    { id: 'roses-rouges', name: 'Roses rouges', category: 'bouquets', photo: 'g094', desc: 'Des roses rouges et framboise avec leur feuillage : un classique qui ne fane jamais.' },
    { id: 'roses-flamboyantes', name: 'Roses flamboyantes', category: 'bouquets', photo: 'g144', desc: 'Des roses orange, rouges et jaunes, pleines de chaleur.' },
    { id: 'lys-bleus', name: 'Lys bleus', category: 'bouquets', photo: 'g107', desc: 'Des lys bleus et bleu ciel aux étamines blanches : un bouquet original et lumineux.' },
    { id: 'bouquet-a-offrir', name: 'Petit bouquet à offrir', category: 'bouquets', photo: 'g057', desc: 'Un lys rose, une rose rouge et un gerbera, dans leur pochette transparente fermée d’un nœud.' },
    { id: 'roses-blanches', name: 'Roses blanches et roses', category: 'bouquets', photo: 'g077', desc: 'Des roses blanches et roses dans leur pochette transparente fermée d’un nœud, prêtes à offrir.' },
    { id: 'tournesol-pot', name: 'Tournesol en pot', category: 'deco', photo: 'g031', desc: 'Un tournesol tout rond dans un petit pot en terre cuite : un rayon de soleil pour la maison.' },
    { id: 'marguerites-pichet', name: 'Marguerites au pichet', category: 'deco', photo: 'g083', desc: 'Des marguerites blanches au cœur jaune, dans un pichet vert.' },
    { id: 'marguerites-pot', name: 'Pot de marguerites', category: 'deco', photo: 'g143', desc: 'Un petit pot de marguerites blanches, frais et champêtre.' },
    { id: 'lavande-jaune', name: 'Lavande à l’arrosoir jaune', category: 'deco', photo: 'g134', desc: 'Des brins de lavande dans un petit arrosoir jaune.' },

    /* --- Fleurs à l'unité : chacune au prix d'une fleur (unitPrice) --- */
    { id: 'u-rose-rouge', name: 'Rose rouge', category: 'unite', photo: 'g044' },
    { id: 'u-rose-fuchsia', name: 'Rose fuchsia', category: 'unite', photo: 'g127' },
    { id: 'u-rose-bleue', name: 'Rose bleue', category: 'unite', photo: 'g062' },
    { id: 'u-rose-ciel', name: 'Rose bleu ciel', category: 'unite', photo: 'g063' },
    { id: 'u-lys-rose', name: 'Lys rose', category: 'unite', photo: 'g028' },
    { id: 'u-lys-peche', name: 'Lys pêche', category: 'unite', photo: 'g118' },
    { id: 'u-lys-jaune', name: 'Lys jaune', category: 'unite', photo: 'g102' },
    { id: 'u-lys-rouge', name: 'Lys rouge', category: 'unite', photo: 'g073' },
    { id: 'u-lys-bleu', name: 'Lys bleu', category: 'unite', photo: 'g050' },
    { id: 'u-gerbera-rose', name: 'Gerbera rose', category: 'unite', photo: 'g010' },
    { id: 'u-gerbera-bleu', name: 'Gerbera bleu', category: 'unite', photo: 'g014' },
    { id: 'u-tulipe-bleue', name: 'Tulipe bleue', category: 'unite', photo: 'g003' },
    { id: 'u-tulipe-ciel', name: 'Tulipe bleu ciel', category: 'unite', photo: 'g086' },
    { id: 'u-tulipe-rouge', name: 'Tulipe rouge', category: 'unite', photo: 'g139' },
    { id: 'u-pavot-rouge', name: 'Pavot rouge', category: 'unite', photo: 'g008' },
    { id: 'u-arum-ciel', name: 'Arum bleu ciel', category: 'unite', photo: 'g040' },
    { id: 'u-arum-jaune', name: 'Arum jaune pâle', category: 'unite', photo: 'g056' },
    { id: 'u-arum-orange', name: 'Arum orange', category: 'unite', photo: 'g066' }
  ],

  /* ---------- Occasions ----------
     preset : bouquet pré-rempli dans le compositeur (message = texte de la carte) ;
     product : ouvre une création ; cat : affiche une catégorie de la boutique. */
  occasions: [
    { id: 'anniversaire', title: 'Anniversaire', text: 'Un bouquet qui durera bien plus longtemps que les bougies.', bg: '#FBE6EA', preset: { message: 'Joyeux anniversaire !', flowers: [['gerbera', 'rose'], ['rose', 'fuchsia'], ['lys', 'rose'], ['tulipe', 'jaune'], ['pavot', 'orange'], ['eucalyptus']] } },
    { id: 'naissance', title: 'Naissance', text: 'Tout doux et sans pollen : parfait pour une chambre de bébé.', bg: '#E3EDF8', preset: { message: 'Bienvenue, petit cœur', flowers: [['hortensia', 'ciel'], ['tulipe', 'blanc'], ['rose', 'ciel'], ['gerbera', 'blanc'], ['eucalyptus']] } },
    { id: 'evenements', title: 'Mariage & évènements', text: 'Bouquets, centres de table, décorations : je fleuris vos évènements sur-mesure.', bg: '#F5EFE8', preset: { message: 'Pour la vie', flowers: [['arum', 'blanc'], ['lys', 'blanc'], ['rose', 'blanc'], ['hortensia', 'blanc'], ['gerbera', 'rose'], ['eucalyptus'], ['eucalyptus']] } },
    { id: 'maitresse', title: 'Merci la maîtresse', text: 'Une fleur éternelle pour remercier la maîtresse, le maître ou l’ATSEM : {prix} la fleur, avec sa carte offerte.', bg: '#F1E9F8', cat: 'unite', preset: { message: 'Merci pour cette belle année', flowers: [['lys', 'rose']] } },
    { id: 'souvenir', title: 'En souvenir', text: 'Une composition dans un bocal transparent, à l’abri des intempéries, pour fleurir avec délicatesse la sépulture d’un être cher.', bg: '#EDF0F2', product: 'souvenir', preset: { container: 'bocal', flowers: [['rose', 'blanc'], ['hortensia', 'lavande'], ['lys', 'blanc'], ['rose', 'rose'], ['eucalyptus']] } },
    { id: 'merci', title: 'Juste parce que', text: 'Les plus jolis bouquets n’attendent pas d’occasion.', bg: '#FBEEDF', preset: { message: 'Juste parce que', flowers: [['tournesol'], ['pavot', 'orange'], ['gerbera', 'jaune'], ['tulipe', 'jaune'], ['eucalyptus']] } }
  ],

  /* ---------- Accueil ---------- */
  hero: {
    slides: ['pastel', 'centre-de-table', 'amethyste', 'coquelicots', 'sunny', 'muguet'],
    featured: 'bonsai'
  },

  /* ---------- Instagram : photos de la mosaïque, reliées à leur publication ---------- */
  instagram: {
    // Pour afficher automatiquement les dernières publications : créez un flux gratuit
    // sur https://behold.so (connectez @flore_et_chenilles), puis collez ici l'adresse
    // « JSON feed URL », par exemple 'https://feeds.behold.so/abc123'.
    // Tant que c'est vide (ou si le flux ne répond pas), les photos ci-dessous s'affichent.
    feedUrl: '',
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
