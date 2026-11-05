/*
 * Flore & Chenilles — textes des pages de contenu (référencement)
 * ------------------------------------------------------------------
 * Ces pages présentent les fleurs, les occasions et des conseils. Elles
 * renvoient vers le site ; le site, lui, ne les affiche pas dans son menu.
 * Pour les régénérer après une modification : node tools/seo/build.js
 *
 * Petits raccourcis dans les textes :
 *   [texte](#boutique)        lien vers une rubrique du site
 *   [texte](/fleurs/rose/)    lien vers une autre page de contenu
 *   [texte](creation:pastel)  lien vers la page d'une création
 */

/* Sens des couleurs dans le langage des fleurs (pour les fleurs à l'unité). */
const colors = {
  rouge: 'le rouge dit l’amour et la passion',
  fuchsia: 'le fuchsia exprime une affection vive et joyeuse',
  bleue: 'le bleu, si rare au jardin, évoque le rêve et la sérénité',
  ciel: 'le bleu ciel apporte douceur et apaisement',
  rose: 'le rose parle de tendresse et de délicatesse',
  peche: 'la couleur pêche dit la douceur et la sympathie',
  jaune: 'le jaune est la couleur de la joie et de l’amitié',
  bleu: 'le bleu, si rare au jardin, évoque le rêve et la sérénité',
  orange: 'l’orange rayonne d’enthousiasme et d’énergie'
};

const flowers = [
  {
    slug: 'rose',
    name: 'Rose',
    title: 'Rose en fil chenille : la rose éternelle faite main',
    desc: 'Rose en fil chenille faite main dans les Ardennes : une rose éternelle rouge, fuchsia, bleue ou bleu ciel. Dès 8 €, carte de vœux offerte.',
    hero: 'u-rose-rouge',
    intro: [
      'Enroulée pétale après pétale autour de sa tige de fer, la rose est l’une des fleurs les plus délicates de l’atelier. En fil chenille, elle garde sa forme et ses couleurs, sans eau ni entretien : c’est une rose éternelle, façonnée à la main dans les Ardennes.',
      'Chaque rose demande du temps : il faut plier le fil chenille, l’enrouler pour former le cœur, ouvrir les pétales un à un, puis habiller la tige et ses feuilles. Aucune n’est tout à fait identique à une autre, et c’est ce qui fait son charme.'
    ],
    langage: 'Dans le langage des fleurs, la rose parle d’amour sous toutes ses formes : la rouge dit la passion, la rose la tendresse, la blanche un amour sincère. Les roses bleues, qui n’existent pas dans la nature, évoquent le rêve et l’impossible : en fil chenille, tout devient possible.',
    usage: [
      'Offerte seule, dans sa pochette transparente fermée d’un nœud, la rose est un cadeau simple et plein de sens, pour la Saint-Valentin, une fête des mères ou un simple merci.',
      'Réunies en bouquet, les roses composent des créations généreuses : [roses bleues](creation:roses-bleues), [roses rouges](creation:roses-rouges), [roses flamboyantes](creation:roses-flamboyantes) aux tons orangés ou [roses blanches et roses](creation:roses-blanches).'
    ],
    tip: 'Pour fleurir une sépulture, la rose peut être fixée à l’intérieur d’un bocal transparent : protégée de la pluie et du vent, elle reste belle au fil des saisons.',
    products: ['u-rose-rouge', 'u-rose-fuchsia', 'u-rose-bleue', 'u-rose-ciel', 'roses-bleues', 'roses-rouges', 'roses-flamboyantes', 'roses-blanches', 'rose-tendre', 'bouquet-a-offrir', 'rubis', 'sunny']
  },
  {
    slug: 'tulipe',
    name: 'Tulipe',
    title: 'Tulipe en fil chenille : tulipes éternelles faites main',
    desc: 'Tulipes en fil chenille faites main : bleues, rouges, roses ou jaunes, à l’unité ou en bouquet. Des tulipes éternelles qui ne fanent jamais.',
    hero: 'tulipes-bleues',
    intro: [
      'Avec ses pétales en coupe et ses longues feuilles, la tulipe apporte un air de printemps en toute saison. Je la façonne en fil chenille dans des couleurs franches ou plus douces : bleu roi, bleu ciel, rouge, rose, jaune, orange…',
      'Ses pétales sont formés un à un puis assemblés pour garder cette jolie forme de calice, et ses feuilles sont mises en forme à la main pour retomber avec naturel.'
    ],
    langage: 'Dans le langage des fleurs, la tulipe rouge est une déclaration d’amour, la jaune un rayon de soleil, la rose une marque d’affection. Les tulipes bleues, très rares au jardin, sont une jolie façon de surprendre.',
    usage: [
      'À l’unité, la tulipe se glisse facilement dans un petit vase. En bouquet, elle se décline en [tulipes de feu](creation:tulipes-de-feu), en [tulipes bleues](creation:tulipes-bleues), en [tulipes rouges et roses](creation:tulipes-rouges-roses) ou en [tulipes jaunes et orange](creation:tulipes-jaunes-orange).'
    ],
    tip: 'Une tulipe de votre couleur préférée ? Composez-la dans [Votre bouquet à vous](#bouquet) ou précisez-la dans votre demande.',
    products: ['u-tulipe-bleue', 'u-tulipe-ciel', 'u-tulipe-rouge', 'tulipes', 'tulipes-bleues', 'tulipes-de-feu', 'tulipes-rouges-roses', 'tulipes-jaunes-orange', 'sunny', 'colore']
  },
  {
    slug: 'lys',
    name: 'Lys',
    title: 'Lys en fil chenille : des lys éternels faits main',
    desc: 'Lys en fil chenille faits main dans les Ardennes : rose, pêche, jaune, rouge ou bleu, à l’unité ou en bouquet. Sans pollen et sans entretien.',
    hero: 'u-lys-rose',
    intro: [
      'Grandes étoiles aux étamines délicates, les lys font partie des fleurs signatures de l’atelier. En fil chenille, leurs longs pétales sont pliés et galbés un à un, avec parfois une touche de maquillage pour leur donner de douces nuances.',
      'Le lys a un vrai avantage en version éternelle : ses étamines ne tachent pas et il ne libère aucun pollen. On peut donc le poser partout, même dans une chambre.'
    ],
    langage: 'Le lys symbolise la pureté et l’élégance. Le lys blanc accompagne les grands moments de la vie, le lys rose dit l’admiration, l’orange et le jaune la gaieté.',
    usage: [
      'Seul, un lys suffit à habiller un soliflore. En bouquet, il donne de la hauteur et de l’éclat : [lys roses](creation:lys-roses), [lys orange et jaunes](creation:lys-orange), [lys bleus](creation:lys-bleus) ou [lys blanc et bordeaux](creation:lys-bordeaux).'
    ],
    tip: 'Le lys XL est au cœur des bouquets [Améthyste](creation:amethyste), [Sunny](creation:sunny) et [Rubis](creation:rubis).',
    products: ['u-lys-rose', 'u-lys-peche', 'u-lys-jaune', 'u-lys-rouge', 'u-lys-bleu', 'lys-roses', 'lys-orange', 'lys-bleus', 'lys-bordeaux', 'amethyste', 'rubis', 'hortensia-lys']
  },
  {
    slug: 'gerbera',
    name: 'Gerbera',
    title: 'Gerbera en fil chenille : la fleur de la bonne humeur',
    desc: 'Gerberas en fil chenille faits main : rose, bleu, blanc ou jaune. À l’unité dès 8 € ou en bouquet, une fleur éternelle pleine de joie.',
    hero: 'u-gerbera-rose',
    intro: [
      'Tout doux et plein de pétales, le gerbera est la fleur de la bonne humeur. Je le façonne en fil chenille avec un cœur bien rond et une couronne de pétales réguliers, en rose, en bleu, en blanc ou en jaune.',
      'C’est l’une des fleurs les plus minutieuses à réaliser : chaque petit pétale est formé puis fixé autour du cœur, un par un.'
    ],
    langage: 'Le gerbera évoque la joie, la gaieté et l’optimisme : une fleur à offrir pour dire merci, pour encourager ou pour souhaiter une belle journée.',
    usage: [
      'On le retrouve dans de nombreux bouquets colorés, comme le [bouquet coloré](creation:colore), le [bouquet soleil](creation:bouquet-soleil) ou le [bouquet rose tendre](creation:rose-tendre).'
    ],
    tip: 'Un gerbera à l’unité est un joli cadeau de fin d’année pour la maîtresse : [voir les idées](/occasions/cadeau-maitresse/).',
    products: ['u-gerbera-rose', 'u-gerbera-bleu', 'fleur-unite', 'colore', 'bouquet-soleil', 'rose-tendre', 'sunny', 'mauve-violet']
  },
  {
    slug: 'pavot-coquelicot',
    name: 'Pavot et coquelicot',
    title: 'Pavot et coquelicot en fil chenille, faits main',
    desc: 'Pavots et coquelicots en fil chenille faits main : rouges ou multicolores, en bouquet champêtre ou à l’unité. Ils ne perdent jamais leurs pétales.',
    hero: 'u-pavot-rouge',
    intro: [
      'Quatre grands pétales et un cœur sombre : le pavot, et son cousin le coquelicot, ont un charme champêtre irrésistible. Au jardin, ils ne durent que quelques jours ; en fil chenille, ils ne perdent jamais leurs pétales.',
      'Je leur ajoute des étamines fines autour du cœur pour retrouver leur air léger, presque froissé.'
    ],
    langage: 'Le coquelicot rouge est la fleur du souvenir et de la consolation. Les pavots multicolores, eux, ont un vrai air de fête.',
    usage: [
      'À découvrir en [bouquet de coquelicots](creation:coquelicots) avec lavande et mimosa, en [pavots multicolores](creation:pavots-multicolores) ou tout seul, en [pavot rouge](creation:pavot-rouge).'
    ],
    tip: 'En souvenir d’un être cher, un coquelicot peut être fixé à l’intérieur d’un bocal transparent : [en savoir plus](/occasions/fleur-sepulture/).',
    products: ['u-pavot-rouge', 'pavots-multicolores', 'coquelicots', 'fleur-unite', 'amethyste', 'colore']
  },
  {
    slug: 'arum',
    name: 'Arum',
    title: 'Arum en fil chenille : une fleur éternelle élégante',
    desc: 'Arums en fil chenille faits main : bleu ciel, jaune pâle, orange ou en bouquet de feu. Une fleur éternelle graphique, façonnée dans les Ardennes.',
    hero: 'arums-de-feu',
    intro: [
      'Un cornet élégant et un spadice bien droit : l’arum est une fleur graphique, très chic. En fil chenille, son grand pétale est mis en forme à la main pour s’enrouler avec souplesse.',
      'Il se suffit à lui-même dans un soliflore, ou apporte une silhouette élancée au cœur d’un bouquet.'
    ],
    langage: 'Dans le langage des fleurs, l’arum représente l’élégance et la beauté raffinée ; on le retrouve souvent dans les bouquets de mariage.',
    usage: [
      'À l’unité en bleu ciel, en jaune pâle ou en orange, ou réuni en [arums de feu](creation:arums-de-feu), rouges et jaunes.'
    ],
    tip: 'L’arum blanc accompagne joliment un [bouquet de mariée](/occasions/mariage/).',
    products: ['u-arum-ciel', 'u-arum-jaune', 'u-arum-orange', 'arums-de-feu', 'sunny', 'colore', 'amethyste', 'hortensia-lys']
  },
  {
    slug: 'hortensia',
    name: 'Hortensia',
    title: 'Hortensia en fil chenille : un nuage de fleurs éternelles',
    desc: 'Hortensias en fil chenille faits main : bleu ciel, lilas ou mauve, en bouquet ou en composition. Des fleurs éternelles tout en douceur.',
    hero: 'hortensias',
    intro: [
      'Un nuage de petites fleurs : l’hortensia demande de la patience, car chaque petite fleur est façonnée puis assemblée à la main pour former une boule généreuse.',
      'En bleu ciel, en lilas ou en mauve, il apporte du volume et beaucoup de douceur aux bouquets.'
    ],
    langage: 'L’hortensia est souvent associé à la gratitude : une jolie façon de remercier quelqu’un qui compte.',
    usage: [
      'À découvrir dans les [hortensias](creation:hortensias) bleu ciel et lilas, le bouquet [hortensia bleu et lys roses](creation:hortensia-lys) ou le [bouquet Améthyste](creation:amethyste).'
    ],
    tip: 'Tout doux et sans pollen, l’hortensia est parfait pour une [chambre de bébé](/occasions/naissance/).',
    products: ['hortensias', 'hortensia-lys', 'amethyste', 'mauve-violet', 'petit-pastel', 'pastel']
  },
  {
    slug: 'tournesol',
    name: 'Tournesol',
    title: 'Tournesol en fil chenille : un soleil qui ne fane pas',
    desc: 'Tournesols en fil chenille faits main dans les Ardennes : en pot ou en centre de table. Un soleil éternel pour la maison, sans eau ni entretien.',
    hero: 'centre-de-table',
    intro: [
      'Un soleil au milieu du bouquet : le tournesol en fil chenille, avec son cœur brun et ses pétales dorés, illumine une table ou un rebord de fenêtre.',
      'Ses grands pétales sont pliés et disposés en couronne autour d’un cœur bien dense : c’est une fleur qui se remarque.'
    ],
    langage: 'Le tournesol symbolise l’admiration, la fidélité et la joie de vivre.',
    usage: [
      'Tout rond dans son [petit pot en terre cuite](creation:tournesol-pot), ou en [centre de table](creation:centre-de-table) avec de petites fleurs bleues et mauves.'
    ],
    tip: 'Le tournesol en pot est un cadeau de remerciement qui fait toujours sourire : [d’autres idées](/occasions/remerciement/).',
    products: ['tournesol-pot', 'centre-de-table', 'bouquet-soleil', 'sunny']
  },
  {
    slug: 'muguet',
    name: 'Muguet',
    title: 'Muguet en fil chenille : le porte-bonheur qui ne fane pas',
    desc: 'Bouquet de muguet en fil chenille fait main : des clochettes blanches qui ne fanent jamais, à offrir le 1er mai ou toute l’année. Création des Ardennes.',
    hero: 'muguet',
    intro: [
      'Des clochettes toutes blanches sur une tige arquée : le muguet en fil chenille est le porte-bonheur qui ne fane pas, à offrir le 1er mai… ou quand on veut.',
      'Chaque clochette est formée à la main puis fixée sur sa tige, pour retrouver la grâce du muguet des bois.'
    ],
    langage: 'Le muguet annonce le retour du bonheur : c’est la fleur des vœux et des nouveaux départs.',
    usage: [
      'À découvrir en [bouquet de muguet](creation:muguet) noué d’un ruban, ou en brins délicats dans le bouquet [lys blanc et bordeaux](creation:lys-bordeaux).'
    ],
    tip: 'Pensez à commander un peu avant le 1er mai : chaque brin est fait à la main.',
    products: ['muguet', 'lys-bordeaux', 'bouquet-jonquilles', 'jonquilles']
  },
  {
    slug: 'lavande',
    name: 'Lavande',
    title: 'Lavande en fil chenille : brins éternels en arrosoir',
    desc: 'Lavande en fil chenille faite main : des brins violets et duveteux dans un petit arrosoir. Une déco champêtre éternelle, sans entretien.',
    hero: 'lavande',
    intro: [
      'Des brins de lavande en fil chenille, violets et duveteux : une touche de Provence qui ne sèche jamais et ne perd pas ses épis.',
      'Je les présente dans de petits arrosoirs, en métal ou en jaune, pour une déco champêtre à poser dans la cuisine, la salle de bain ou sur une étagère.'
    ],
    langage: 'La lavande évoque la sérénité, la tendresse et la douceur de vivre.',
    usage: [
      'À découvrir dans l’[arrosoir de lavande](creation:arrosoir-de-lavande) en métal, la [lavande à l’arrosoir jaune](creation:lavande-a-l-arrosoir-jaune), ou mêlée aux coquelicots dans le [bouquet de coquelicots](creation:coquelicots).'
    ],
    tip: 'Un joli cadeau pour une [fête des grands-mères](/occasions/fete-des-grands-meres/).',
    products: ['lavande', 'lavande-jaune', 'coquelicots', 'arrosoir-fleuri', 'pensees-seaux']
  },
  {
    slug: 'jonquille',
    name: 'Jonquille',
    title: 'Jonquilles en fil chenille : le printemps toute l’année',
    desc: 'Jonquilles en fil chenille faites main dans les Ardennes : en bouquet ou en petit pot, crème et jaune soleil. Le printemps éternel, sans eau ni entretien.',
    hero: 'bouquet-jonquilles',
    intro: [
      'Crème et jaune soleil, avec leur trompette bien ouverte : les jonquilles en fil chenille gardent leur fraîcheur de premier jour du printemps, toute l’année.',
      'Leur trompette est formée à part puis posée au centre de la corolle, pour un joli relief.'
    ],
    langage: 'Première fleur du printemps, la jonquille est le symbole du renouveau et de la joie retrouvée.',
    usage: [
      'En [bouquet de jonquilles](creation:bouquet-de-jonquilles), vase offert, ou en [petit pot de jonquilles](creation:petit-pot-de-jonquilles), pot offert.'
    ],
    tip: 'Une idée de cadeau pour la [fête des mères](/occasions/fete-des-meres/) ou pour un simple merci.',
    products: ['bouquet-jonquilles', 'jonquilles', 'muguet', 'pensees']
  },
  {
    slug: 'marguerite',
    name: 'Marguerite',
    title: 'Marguerites en fil chenille, en pot ou au pichet',
    desc: 'Marguerites en fil chenille faites main, en pot ou au pichet, pot ou vase offert. Une déco fraîche et champêtre qui ne fane jamais.',
    hero: 'marguerites-pichet',
    intro: [
      'Des pétales blancs autour d’un cœur jaune : la marguerite en fil chenille a la simplicité des prés au mois de juin.',
      'Je les rassemble en petits bouquets bien fournis, en pot ou dans un pichet, pour une déco fraîche à poser sur une table.'
    ],
    langage: 'Je t’aime, un peu, beaucoup… La marguerite symbolise l’innocence, la simplicité et la sincérité.',
    usage: [
      'À découvrir en [pot de marguerites](creation:pot-de-marguerites) ou en [marguerites au pichet](creation:marguerites-au-pichet).'
    ],
    tip: 'Les marguerites font de jolis cadeaux de remerciement : [d’autres idées](/occasions/remerciement/).',
    products: ['marguerites-pichet', 'marguerites-pot', 'tournesol-pot', 'jonquilles']
  },
  {
    slug: 'pensee',
    name: 'Pensée',
    title: 'Pensées en fil chenille, en pot ou en mini arrosoir',
    desc: 'Pensées en fil chenille faites main : petites fleurs veloutées en pot lilas ou en mini arrosoir, couleurs au choix. Une déco éternelle à offrir.',
    hero: 'pensees',
    intro: [
      'Petites fleurs aux couleurs veloutées, les pensées en fil chenille sont parmi les plus fines de l’atelier : leurs pétales sont superposés et nuancés à la main.',
      'Blanches, mauves, jaunes, bordeaux, bleues ou orangées : on choisit sa couleur, ou on les mélange.'
    ],
    langage: 'La pensée, comme son nom l’indique, dit « je pense à toi » : un message tendre, idéal pour un souvenir ou une fête des grands-mères.',
    usage: [
      'En [pensées en pot](creation:pensees-en-pot), pot offert, ou dans un [mini arrosoir](creation:pensees-en-mini-arrosoir).'
    ],
    tip: 'Toute petite et sans entretien, la pensée se pose partout : bureau, table de nuit, étagère.',
    products: ['pensees', 'pensees-seaux', 'jonquilles', 'marguerites-pot']
  }
];

const occasions = [
  {
    slug: 'cadeau-maitresse',
    name: 'Cadeau pour la maîtresse',
    title: 'Cadeau maîtresse de fin d’année : une fleur éternelle faite main',
    desc: 'Cadeau pour la maîtresse, le maître ou l’ATSEM : une fleur éternelle en fil chenille à 8 €, emballée, avec sa carte de vœux offerte.',
    hero: 'fleur-unite',
    lead: 'Pour dire merci à la fin de l’année scolaire, une fleur qui ne fanera jamais : façonnée à la main, emballée dans sa pochette transparente avec un nœud, et accompagnée d’une carte de vœux offerte.',
    sections: [
      { h: 'Une fleur pour dire merci', p: ['La maîtresse, le maître, l’ATSEM ou l’AESH ont accompagné votre enfant toute l’année : une fleur en fil chenille est un cadeau simple, joli et durable. Elle se garde sur un bureau ou une étagère, sans eau ni entretien, et rappelle longtemps une belle année.', 'Chaque fleur à l’unité coûte 8 €. Rose, pavot, gerbera, lys, tulipe ou arum : votre enfant peut choisir sa fleur et sa couleur préférées.'] },
      { h: 'Une carte écrite par votre enfant', p: ['Chaque fleur est accompagnée d’une carte de vœux offerte. Indiquez le message au moment de la commande, par exemple :'], msgs: ['Merci pour cette belle année !', 'Merci maîtresse, je ne vous oublierai pas.', 'Pour la meilleure ATSEM du monde.', 'Merci de m’avoir appris à lire (et à rêver).'], tint: 'tint' },
      { h: 'Pour toute la classe', p: ['Vous organisez un cadeau commun avec les autres parents ? Je peux préparer plusieurs fleurs, ou un petit bouquet pour l’équipe de l’école. Écrivez-moi via le [formulaire de contact](#contact) en précisant le nombre de fleurs et la date de fin d’année.'] },
      { h: 'Comment commander', ol: ['Choisissez une fleur dans [Fleurs à l’unité](#boutique) ou composez-la dans [Votre bouquet à vous](#bouquet).', 'Écrivez le message de la carte de vœux.', 'Envoyez votre demande : je vous confirme la date. Retrait gratuit à l’atelier de Signy-l’Abbaye ou livraison autour de l’atelier.'] }
    ],
    products: ['fleur-unite', 'u-rose-rouge', 'u-gerbera-rose', 'u-tulipe-bleue', 'u-lys-rose', 'u-arum-ciel', 'tournesol-pot', 'pensees', 'marguerites-pot', 'jonquilles']
  },
  {
    slug: 'fleur-sepulture',
    name: 'Fleurir une sépulture',
    title: 'Fleur éternelle pour une tombe : une fleur protégée en bocal',
    desc: 'Pour fleurir une sépulture : une fleur éternelle en fil chenille fixée dans un bocal transparent, protégée de la pluie et du vent. Fait main.',
    hero: 'u-rose-ciel',
    lead: 'Pour honorer la mémoire d’un être cher, une fleur éternelle façonnée à la main, fixée à l’intérieur d’un bocal transparent : protégée de la pluie et du vent, elle reste belle au fil des saisons.',
    sections: [
      { h: 'Une fleur qui traverse les saisons', p: ['Les fleurs coupées fanent en quelques jours et les plantes souffrent du gel ou de la sécheresse. Une fleur en fil chenille, elle, ne fane pas. Fixée à l’intérieur d’un bocal transparent, elle est à l’abri des intempéries et garde ses couleurs, sans aucun entretien.', 'Le bocal est proposé en option pour les fleurs à l’unité, pour 5 € de plus que la fleur.'] },
      { h: 'Choisir sa fleur', p: ['Rose, lys, tulipe, arum, pavot… Vous pouvez choisir la fleur et la couleur qui lui ressemblent : une rose bleu ciel pour la douceur, un lys pêche pour la tendresse, un coquelicot rouge, fleur du souvenir.'], tint: 'mint' },
      { h: 'Un mot sur la carte', p: ['Une carte est offerte avec chaque fleur. Quelques mots peuvent l’accompagner, par exemple :'], msgs: ['Toujours dans nos cœurs.', 'Tu nous manques.', 'Avec tout notre amour, pour toujours.', 'Pensées affectueuses.'] },
      { h: 'Pour la Toussaint et toute l’année', p: ['Toussaint, anniversaire, fête : pensez à commander un peu à l’avance. Vous pouvez venir chercher la fleur gratuitement à l’atelier de Signy-l’Abbaye, ou la faire livrer autour de l’atelier. Si vous avez une demande particulière, écrivez-moi en toute simplicité via le [formulaire de contact](#contact).'] }
    ],
    products: ['fleur-unite', 'u-rose-ciel', 'u-rose-rouge', 'u-lys-peche', 'u-lys-rose', 'u-tulipe-ciel', 'u-pavot-rouge', 'u-arum-ciel']
  },
  {
    slug: 'anniversaire',
    name: 'Anniversaire',
    title: 'Bouquet d’anniversaire qui ne fane pas, fait main',
    desc: 'Un bouquet d’anniversaire en fleurs éternelles qui durera plus longtemps que les bougies : bouquets colorés, boîte gâteau, carte offerte.',
    hero: 'pavots-multicolores',
    lead: 'Un bouquet qui durera bien plus longtemps que les bougies : des fleurs éternelles en fil chenille, joyeuses et colorées, avec une carte de vœux offerte pour écrire votre plus beau message.',
    sections: [
      { h: 'Un cadeau qui se garde', p: ['Un bouquet classique s’offre, puis se fane en une semaine. Un bouquet en fil chenille reste sur la table, au salon ou dans la chambre, et rappelle longtemps ce jour particulier.', 'Pavots multicolores, bouquet soleil, roses flamboyantes : choisissez une création, ou composez un bouquet aux couleurs préférées de la personne fêtée dans [Votre bouquet à vous](#bouquet).'] },
      { h: 'La petite touche gourmande', p: ['La [boîte gâteau d’anniversaire](creation:boite-gateau-d-anniversaire), avec sa bougie et ses fraises en fil chenille, est une petite boîte dans laquelle on peut glisser un cadeau. Elle ne fond pas et se garde pour toujours.'], tint: 'tint' },
      { h: 'Des idées de messages', msgs: ['Joyeux anniversaire ! Que cette année soit aussi douce que ces fleurs.', 'Des fleurs qui ne fanent pas, comme mon affection pour toi.', 'Une année de plus, et toujours autant de soleil.'] }
    ],
    products: ['pavots-multicolores', 'gateau', 'bouquet-soleil', 'colore', 'sunny', 'roses-flamboyantes', 'rose-tendre', 'tulipes-de-feu']
  },
  {
    slug: 'naissance',
    name: 'Naissance',
    title: 'Fleurs de naissance sans pollen pour la chambre de bébé',
    desc: 'Pour une naissance, des fleurs éternelles en fil chenille, douces et sans pollen : hortensias, bouquets pastel, tulipes bleu ciel. Fait main.',
    hero: 'petit-pastel',
    lead: 'Tout doux et sans pollen : des fleurs en fil chenille aux couleurs pastel pour souhaiter la bienvenue à un bébé, et décorer sa chambre sans contrainte.',
    sections: [
      { h: 'Des fleurs adaptées à une chambre de bébé', p: ['Les fleurs en fil chenille ne libèrent aucun pollen, ne demandent pas d’eau et ne fanent pas : pas de vase à surveiller ni d’odeur forte. Elles apportent de la douceur sur une commode ou une étagère.', 'Ce sont des objets de décoration : comme ils contiennent une tige de fer, placez-les hors de portée des tout-petits.'] },
      { h: 'Les couleurs de la naissance', p: ['Bleu ciel, rose poudré, lilas, blanc : les hortensias, les petits bouquets pastel et les tulipes bleu ciel s’accordent avec toutes les chambres. Vous pouvez aussi composer un bouquet aux couleurs de la décoration dans [Votre bouquet à vous](#bouquet).'], tint: 'tint' },
      { h: 'Un mot pour bébé', msgs: ['Bienvenue, petit cœur !', 'Bienvenue dans la vie, petite merveille.', 'Félicitations aux heureux parents !'] }
    ],
    products: ['hortensias', 'petit-pastel', 'pastel', 'hortensia-lys', 'u-rose-ciel', 'u-tulipe-ciel', 'muguet', 'u-arum-ciel']
  },
  {
    slug: 'mariage',
    name: 'Mariage',
    title: 'Bouquet de mariée et centres de table en fleurs éternelles',
    desc: 'Bouquet de mariée qui se garde toute la vie, centres de table et décorations en fleurs éternelles en fil chenille, faits main dans les Ardennes.',
    hero: 'lys-bordeaux',
    lead: 'Un bouquet de mariée qui se garde toute la vie, des centres de table qui ne fanent pas avant la fin de la soirée : les fleurs en fil chenille racontent votre histoire, aux couleurs de votre mariage.',
    sections: [
      { h: 'Un bouquet de mariée éternel', p: ['Le bouquet de mariée est souvent le seul objet du mariage que l’on aimerait garder intact. En fil chenille, il ne fane pas : il se pose ensuite dans le salon, comme un souvenir du grand jour.', 'Lys blancs, arums, roses, hortensias : nous choisissons ensemble les fleurs et les couleurs, à partir de vos idées ou d’une de mes créations.'] },
      { h: 'Centres de table et décorations', p: ['Un [centre de table](creation:centre-de-table-tournesols) se regarde de tous les côtés : je le compose avec des fleurs à voir de chaque place. Pour les mariages, je réalise aussi des petites fleurs à offrir aux invités ou à poser sur les tables.'], tint: 'tint' },
      { h: 'Parlons de votre projet', p: ['Décrivez-moi votre mariage, vos couleurs et la date via le [formulaire de contact](#contact), en choisissant le sujet « Mariage & événements ». Je vous réponds avec des propositions et un prix, calculé à 8 € par fleur.'] }
    ],
    products: ['lys-bordeaux', 'roses-blanches', 'sunny', 'centre-de-table', 'pastel', 'amethyste', 'petit-pastel', 'u-arum-ciel']
  },
  {
    slug: 'fete-des-meres',
    name: 'Fête des mères',
    title: 'Fête des mères : un bouquet éternel fait main pour maman',
    desc: 'Pour la fête des mères, un bouquet de fleurs éternelles en fil chenille qui ne fanera jamais : roses, lys, jonquilles. Carte de vœux offerte.',
    hero: 'rose-tendre',
    lead: 'Pour la fête des mères, un bouquet que maman pourra garder : des fleurs façonnées à la main, emballées avec soin, et une carte de vœux pour lui écrire tout ce que vous ressentez.',
    sections: [
      { h: 'Un bouquet qui dure', p: ['Les fleurs en fil chenille ne fanent pas : le bouquet de la fête des mères reste sur la table bien après le dimanche de la fête. Le bouquet rose tendre, le bouquet pastel aux perles ou les lys roses sont parmi les plus demandés.', 'Vous pouvez aussi créer le bouquet de ses rêves dans [Votre bouquet à vous](#bouquet), fleur par fleur.'] },
      { h: 'Pour les petites mains', p: ['Une fleur à l’unité, à 8 €, est un joli cadeau à offrir par un enfant : il choisit sa fleur et sa couleur, et écrit son message sur la carte.'], tint: 'tint' },
      { h: 'Des idées de messages', msgs: ['Bonne fête, maman !', 'À la plus douce des mamans.', 'Des fleurs éternelles, comme mon amour pour toi.'] }
    ],
    products: ['rose-tendre', 'pastel', 'lys-roses', 'hortensia-lys', 'roses-rouges', 'u-rose-fuchsia', 'bouquet-jonquilles', 'pensees']
  },
  {
    slug: 'saint-valentin',
    name: 'Saint-Valentin',
    title: 'Saint-Valentin : rose éternelle et bouquets d’amour faits main',
    desc: 'Pour la Saint-Valentin, une rose éternelle en fil chenille ou un bouquet de roses rouges qui ne fanera jamais. Fait main, carte offerte.',
    hero: 'roses-rouges',
    lead: 'Une rose rouge qui ne fanera jamais : pour la Saint-Valentin, une fleur éternelle façonnée à la main, avec une carte de vœux pour glisser une déclaration.',
    sections: [
      { h: 'La rose rouge, symbole de l’amour', p: ['Dans le langage des fleurs, la rose rouge dit l’amour et la passion. En fil chenille, elle garde son éclat jour après jour : une jolie façon de dire que vos sentiments, eux non plus, ne faneront pas.', 'Une [rose rouge](creation:rose-rouge) à l’unité coûte 8 €. Pour un geste plus généreux, découvrez les [roses rouges](creation:roses-rouges) en bouquet ou le [bouquet Rubis](creation:bouquet-rubis).'] },
      { h: 'Des mots doux pour la carte', msgs: ['Pour toi, pour toujours.', 'Mon amour pour toi ne fanera jamais.', 'Une rose pour chaque raison de t’aimer.'], tint: 'tint' },
      { h: 'À commander à l’avance', p: ['Chaque fleur est faite à la main : pensez à passer commande quelques jours avant le 14 février. Retrait gratuit à l’atelier de Signy-l’Abbaye ou livraison autour de l’atelier.'] }
    ],
    products: ['u-rose-rouge', 'roses-rouges', 'rubis', 'u-tulipe-rouge', 'u-lys-rouge', 'bouquet-a-offrir', 'roses-blanches', 'u-rose-fuchsia']
  },
  {
    slug: 'remerciement',
    name: 'Remerciement',
    title: 'Cadeau de remerciement : des fleurs éternelles pour dire merci',
    desc: 'Pour dire merci à une voisine, une collègue ou une nounou : une fleur éternelle, un tournesol en pot ou des marguerites, faits main.',
    hero: 'tournesol-pot',
    lead: 'Un service rendu, un départ, une belle attention : une petite fleur éternelle est une façon délicate et durable de dire merci.',
    sections: [
      { h: 'Des petits cadeaux qui font plaisir', p: ['Un tournesol en pot, des marguerites, un petit pot de jonquilles ou une fleur à l’unité : des créations faciles à offrir, qui se posent sur un bureau ou une table, sans eau ni entretien.', 'Pour les petites fleurs en pot, le pot est offert.'] },
      { h: 'Pour une nounou, une soignante, une collègue', p: ['Les fleurs en fil chenille ne libèrent pas de pollen et n’ont pas besoin d’eau : elles conviennent aussi aux lieux où les fleurs naturelles sont peu pratiques. Pour un établissement de soins, renseignez-vous tout de même auprès de lui avant d’offrir.'], tint: 'mint' },
      { h: 'Des idées de messages', msgs: ['Merci pour tout !', 'Merci pour votre gentillesse.', 'Un grand merci, avec toute ma reconnaissance.'] }
    ],
    products: ['tournesol-pot', 'marguerites-pichet', 'marguerites-pot', 'u-gerbera-rose', 'hortensias', 'jonquilles', 'bouquet-soleil', 'arrosoir-fleuri']
  },
  {
    slug: 'fete-des-grands-meres',
    name: 'Fête des grands-mères',
    title: 'Fête des grands-mères : une déco fleurie faite main pour mamie',
    desc: 'Pour la fête des grands-mères, une déco fleurie en fil chenille : lavande en arrosoir, pensées, théière fleurie. Faite main dans les Ardennes.',
    hero: 'pensees-seaux',
    lead: 'Pour mamie, une petite déco fleurie qui ne fane pas : de la lavande dans un arrosoir, des pensées, une théière chinée et fleurie… avec un mot tendre sur la carte offerte.',
    sections: [
      { h: 'Des créations qui ont du charme', p: ['Les pensées en mini arrosoir, la lavande dans son arrosoir en métal ou la théière fleurie, pièce unique chinée en brocante, ont un petit air d’autrefois qui plaît beaucoup aux grands-mères.', 'Elles se posent sur un buffet, une table de cuisine ou une fenêtre, et restent jolies sans aucun entretien.'] },
      { h: 'Un message pour mamie', msgs: ['Bonne fête, mamie chérie !', 'À la plus douce des grands-mères.', 'Pour toi qui penses toujours à nous.'], tint: 'tint' }
    ],
    products: ['pensees-seaux', 'lavande', 'lavande-jaune', 'theiere', 'pensees', 'arrosoir-fleuri', 'muguet', 'marguerites-pot']
  },
  {
    slug: 'noel',
    name: 'Noël',
    title: 'Noël : bouquets et centres de table en fleurs éternelles',
    desc: 'Pour Noël, des fleurs éternelles en fil chenille : centre de table pour le repas de fête, roses rouges, bonsaï, théière fleurie. Fait main.',
    hero: 'centre-de-table',
    lead: 'Un centre de table qui ne fane pas avant le dessert, un bouquet rouge à glisser sous le sapin : pour Noël, des fleurs éternelles faites main, à offrir ou à garder.',
    sections: [
      { h: 'Décorer la table des fêtes', p: ['Un centre de table en fil chenille se regarde de toutes les places et ne craint ni la chaleur du repas ni la lumière des bougies. Il se range ensuite pour l’année suivante, ou reste en déco toute l’année.'] },
      { h: 'Des cadeaux à glisser sous le sapin', p: ['Roses rouges, bonsaï azalée, théière fleurie, bouquet Rubis : des cadeaux originaux, faits à la main, qui changent des cadeaux habituels. Chaque création est emballée dans une pochette transparente fermée d’un nœud, avec sa carte de vœux offerte.'], tint: 'tint' },
      { h: 'Commander à temps', p: ['En décembre, pensez à commander tôt : chaque fleur est façonnée à la main. Retrait gratuit à l’atelier de Signy-l’Abbaye ou livraison autour de l’atelier.'] }
    ],
    products: ['centre-de-table', 'rubis', 'roses-rouges', 'bonsai', 'theiere', 'u-rose-rouge', 'lys-bordeaux', 'gateau']
  }
];

const conseils = [
  {
    slug: 'fleur-en-fil-chenille',
    name: 'Qu’est-ce qu’une fleur en fil chenille ?',
    title: 'Fleur en fil chenille (cure-pipe) : qu’est-ce que c’est ?',
    desc: 'Fleurs en fil chenille, ou fleurs en cure-pipe : la matière, la fabrication à la main, la durée de vie et les atouts des fleurs éternelles.',
    hero: 'pastel',
    lead: 'On les appelle fleurs en fil chenille, fleurs en cure-pipe ou fleurs éternelles : ce sont des fleurs façonnées à la main dans un fil tout doux, qui ne fanent jamais.',
    sections: [
      { h: 'Le fil chenille, une matière toute douce', p: ['Le fil chenille, que l’on appelle aussi cure-pipe, est un fil métallique recouvert de fibres douces et légèrement duveteuses. Il se plie, se torsade et garde la forme qu’on lui donne : c’est ce qui permet de modeler pétales, cœurs et feuillages.', 'Chez Flore & Chenilles, les fils sont sélectionnés pour leur qualité et leur durabilité, pour que les couleurs tiennent dans le temps.'] },
      { h: 'Comment naît une fleur', ol: ['Les pétales sont pliés et torsadés un à un, puis mis en forme.', 'Le cœur est formé à part, puis les pétales sont assemblés autour.', 'La fleur est montée sur une tige de fer, habillée de scotch de masquage et de fil vert.', 'Un peu de colle fixe les détails, et une touche de maquillage donne parfois de douces nuances aux pétales.', 'La fleur est emballée dans une pochette transparente fermée d’un nœud.'], tint: 'tint' },
      { h: 'Pourquoi choisir une fleur éternelle ?', ul: ['Elle ne fane jamais et ne demande ni eau ni entretien.', 'Elle ne libère aucun pollen : idéale pour les personnes allergiques et les chambres.', 'Elle est faite à la main : chaque fleur est unique.', 'Elle se garde comme un souvenir, des années durant.'] },
      { h: 'Combien de temps faut-il pour la fabriquer ?', p: ['Tout dépend de la fleur : une tulipe se façonne plus vite qu’un gerbera aux dizaines de petits pétales ou qu’un hortensia fait de nombreuses petites fleurs. C’est ce temps de travail, avec le matériel, qui explique [le prix d’une fleur](/conseils/prix-bouquet-fil-chenille/).'] }
    ],
    products: ['pastel', 'amethyste', 'fleur-unite', 'u-gerbera-rose']
  },
  {
    slug: 'entretien-fleurs-eternelles',
    name: 'Entretenir ses fleurs éternelles',
    title: 'Entretien des fleurs éternelles en fil chenille : nos conseils',
    desc: 'Entretenir ses fleurs en fil chenille : poussière, lumière, humidité, remise en forme des pétales et fleurs en extérieur protégées en bocal.',
    hero: 'colore',
    lead: 'Les fleurs en fil chenille ne demandent presque rien : ni eau, ni taille, ni engrais. Quelques gestes simples suffisent à les garder belles pendant des années.',
    sections: [
      { h: 'La poussière', p: ['Comme tout objet de décoration, les fleurs prennent un peu la poussière. Un coup de pinceau doux, de plumeau, ou un sèche-cheveux réglé sur l’air froid, tenu à bonne distance, suffit à les rafraîchir.'] },
      { h: 'La lumière et l’humidité', p: ['Comme les tissus, les fibres colorées peuvent pâlir si elles restent longtemps en plein soleil derrière une vitre : préférez une place lumineuse, sans soleil direct toute la journée.', 'Les tiges contiennent du fer : évitez de laisser les fleurs dans l’eau ou dans une pièce très humide.'], tint: 'mint' },
      { h: 'Redonner sa forme à une fleur', p: ['Si un pétale s’est aplati pendant un transport ou un rangement, il suffit de le remettre en forme du bout des doigts, doucement : le fil chenille garde la forme qu’on lui donne.'] },
      { h: 'Et en extérieur ?', p: ['Pour une fleur posée dehors, par exemple sur une sépulture, je peux la fixer à l’intérieur d’un bocal transparent : protégée de la pluie et du vent, elle traverse les saisons. [En savoir plus](/occasions/fleur-sepulture/).'], tint: 'tint' }
    ],
    products: ['colore', 'hortensias', 'u-rose-ciel', 'lavande']
  },
  {
    slug: 'fleurs-eternelles-sechees-stabilisees',
    name: 'Fleurs éternelles, séchées ou stabilisées ?',
    title: 'Fleurs éternelles, séchées, stabilisées ou artificielles : les différences',
    desc: 'Fleurs en fil chenille, séchées, stabilisées ou artificielles : durée, entretien, pollen et aspect comparés pour bien choisir.',
    hero: 'sunny',
    lead: 'Fleurs séchées, stabilisées, artificielles ou en fil chenille : toutes promettent de durer, mais elles ne se ressemblent pas. Voici de quoi s’y retrouver.',
    sections: [
      { h: 'Le comparatif', table: { head: ['', 'Fil chenille', 'Séchées', 'Stabilisées', 'Artificielles'], rows: [
        ['Matière', 'Fil doux façonné à la main', 'Vraies fleurs séchées', 'Vraies fleurs traitées', 'Tissu ou plastique, souvent industriel'],
        ['Durée', 'Des années', 'Fragiles, se décolorent', 'Plusieurs années à l’abri', 'Des années'],
        ['Entretien', 'Un peu de dépoussiérage', 'Ne pas toucher, craint la casse', 'Craint l’humidité et le soleil', 'Dépoussiérage'],
        ['Pollen', 'Aucun', 'Possible', 'Très peu', 'Aucun'],
        ['Toucher', 'Tout doux', 'Sec et cassant', 'Souple', 'Variable']
      ] } },
      { h: 'Ce qui rend le fil chenille unique', p: ['Une fleur en fil chenille n’imite pas une fleur réelle au millimètre : elle en garde l’esprit, avec un aspect doux et duveteux, et des couleurs impossibles dans la nature, comme les roses bleues. Elle est façonnée à la main, une par une, ce qui en fait un vrai cadeau artisanal.'], tint: 'tint' },
      { h: 'Pour quel usage ?', ul: ['Pour offrir et garder longtemps : le fil chenille ou les fleurs stabilisées.', 'Pour une ambiance bohème et naturelle : les fleurs séchées.', 'Pour une chambre d’enfant ou une personne allergique : le fil chenille, sans pollen et tout doux.', 'Pour l’extérieur : une fleur en fil chenille fixée à l’intérieur d’un bocal.'] }
    ],
    products: ['sunny', 'roses-bleues', 'pastel', 'bouquet-soleil']
  },
  {
    slug: 'fleurs-sans-pollen-allergie',
    name: 'Fleurs sans pollen pour les allergiques',
    title: 'Fleurs sans pollen : un bouquet pour les personnes allergiques',
    desc: 'Offrir des fleurs à une personne allergique : les fleurs éternelles en fil chenille ne libèrent aucun pollen et ne demandent pas d’eau.',
    hero: 'lys-bleus',
    lead: 'Offrir des fleurs à quelqu’un d’allergique, c’est souvent un casse-tête. Les fleurs en fil chenille ne libèrent aucun pollen : on peut les offrir sans arrière-pensée.',
    sections: [
      { h: 'Aucun pollen, aucune odeur forte', p: ['Les fleurs en fil chenille sont façonnées dans un fil doux : elles n’ont ni pollen, ni parfum entêtant, ni eau stagnante. Le lys, qui tache et fait éternuer en version naturelle, devient une fleur que l’on peut poser partout.'] },
      { h: 'Les bonnes idées de cadeaux', ul: ['Un bouquet de lys, de roses ou de tulipes pour le salon.', 'Une fleur à l’unité pour un bureau ou une table de nuit.', 'Des fleurs tout en douceur pour la chambre d’un enfant allergique.'], tint: 'mint' },
      { h: 'Bon à savoir', p: ['Comme tout objet de décoration, les fleurs en fil chenille prennent un peu la poussière : un coup de pinceau doux de temps en temps suffit. [Nos conseils d’entretien](/conseils/entretien-fleurs-eternelles/).'] }
    ],
    products: ['lys-bleus', 'lys-roses', 'u-lys-peche', 'hortensias', 'roses-bleues', 'tulipes-bleues']
  },
  {
    slug: 'prix-bouquet-fil-chenille',
    name: 'Le prix d’un bouquet en fil chenille',
    title: 'Combien coûte un bouquet en fil chenille ? Prix et explications',
    desc: 'Prix d’un bouquet en fil chenille : 8 € la fleur, feuillage, vase ou pot offerts, bocal en option, livraison autour de Signy-l’Abbaye.',
    hero: 'amethyste',
    lead: 'Chez Flore & Chenilles, le calcul est simple : 8 € par fleur. Voici ce que comprend ce prix, et ce qui est offert.',
    sections: [
      { h: 'Une fleur à 8 €, c’est…', ul: ['Du temps : chaque pétale est plié, torsadé et ajusté à la main.', 'Des fils chenille choisis pour leur qualité et leur durabilité.', 'Une tige de fer, pour que la fleur se tienne bien droite.', 'Du scotch de masquage, pour assembler et habiller la tige.', 'De la colle, pour que chaque détail tienne longtemps.', 'Du maquillage, pour donner aux pétales leurs douces nuances.', 'Un emballage : une pochette transparente fermée d’un nœud.', 'Et plein d’amour.'], tint: 'tint' },
      { h: 'Le prix d’un bouquet', p: ['Un bouquet coûte 8 € par fleur, et le feuillage est offert. Les bouquets présentés en vase sont livrés avec leur vase, offert. Quelques exemples :'], examples: true },
      { h: 'Ce qui est offert, ce qui est en option', ul: ['Offerts : l’emballage (pochette transparente et nœud) et la carte de vœux personnalisée.', 'Offert : le vase des bouquets présentés en vase, le petit pot des petites fleurs en pot.', 'En option : une fleur à l’unité fixée à l’intérieur d’un bocal transparent, pour 5 € de plus.', 'Retrait gratuit à l’atelier, ou livraison : 5 € jusqu’à 15 km, 10 € jusqu’à 25 km autour de Signy-l’Abbaye.'] },
      { h: 'Composer son propre bouquet', p: ['Dans [Votre bouquet à vous](#bouquet), le prix s’affiche au fur et à mesure que vous ajoutez des fleurs : 8 € par fleur, le feuillage est offert.'] }
    ],
    products: ['amethyste', 'pastel', 'roses-bleues', 'fleur-unite']
  },
  {
    slug: 'composer-son-bouquet',
    name: 'Composer son bouquet en ligne',
    title: 'Composer son bouquet de fleurs éternelles en ligne',
    desc: 'Composez votre bouquet en fil chenille en ligne, fleur par fleur : lys, roses, tulipes, gerberas, hortensias… avec le prix affiché en direct.',
    hero: 'colore',
    lead: 'Sur le site, le compositeur « Votre bouquet à vous » permet de créer son bouquet fleur par fleur, de voir son aperçu et son prix en direct, puis de me l’envoyer.',
    sections: [
      { h: 'En trois étapes', ol: ['Choisissez une couleur, puis ajoutez vos fleurs : lys, arum, pavot, gerbera, rose, tulipe, hortensia, tournesol, jonquille et feuillage.', 'Écrivez votre carte de vœux, offerte : pour qui, votre message et de la part de qui.', 'Ajoutez le bouquet à votre sélection et envoyez votre demande : je vous confirme la date et la remise.'], tint: 'tint' },
      { h: 'Des harmonies qui marchent', ul: ['Mauve, lavande et fuchsia, comme le bouquet Améthyste.', 'Blanc et jaune, lumineux comme le bouquet Sunny.', 'Bordeaux et rose, comme le bouquet Rubis.', 'Bleu ciel, bleu et lavande, tout en fraîcheur.', 'Rouge, orange et jaune, pour un bouquet plein de soleil.'] },
      { h: 'Le prix, en direct', p: ['Chaque fleur coûte 8 €, et le feuillage est offert : le prix s’affiche à mesure que le bouquet prend forme. Le bouton « Surprise » propose une composition au hasard, et « Partager » donne un lien vers votre bouquet.'] }
    ],
    cta: { label: 'Composer mon bouquet', href: '#bouquet' },
    products: ['amethyste', 'sunny', 'rubis', 'colore']
  },
  {
    slug: 'idees-messages-carte',
    name: 'Idées de messages pour la carte',
    title: 'Quoi écrire sur une carte avec des fleurs ? 40 idées de messages',
    desc: 'Idées de messages pour la carte d’un bouquet : anniversaire, merci, maîtresse, naissance, amour, fête des mères ou souvenir.',
    hero: 'bouquet-a-offrir',
    lead: 'Chaque création Flore & Chenilles est accompagnée d’une carte de vœux offerte. Vous ne savez pas quoi écrire ? Voici des idées, à reprendre telles quelles ou à adapter.',
    sections: [
      { h: 'Pour un anniversaire', msgs: ['Joyeux anniversaire ! Des fleurs qui ne fanent pas, pour une année qui ne finit pas de te sourire.', 'Une année de plus, et toujours autant de douceur.', 'Que cette nouvelle année soit aussi belle que ce bouquet.', 'Joyeux anniversaire, avec toute mon affection.', 'Pour souffler tes bougies en beauté.'] },
      { h: 'Pour dire merci', msgs: ['Merci pour tout !', 'Merci pour votre gentillesse et votre patience.', 'Un immense merci, du fond du cœur.', 'Pour vous remercier d’avoir été là.', 'Merci, tout simplement.'], tint: 'tint' },
      { h: 'Pour la maîtresse ou l’ATSEM', msgs: ['Merci pour cette belle année !', 'Merci maîtresse, je ne vous oublierai pas.', 'Pour la meilleure ATSEM du monde.', 'Merci de m’avoir appris tant de choses.', 'Bonnes vacances, et merci pour tout !'] },
      { h: 'Pour une naissance', msgs: ['Bienvenue, petit cœur !', 'Bienvenue dans la vie, petite merveille.', 'Félicitations aux heureux parents !', 'Un bébé, des fleurs, beaucoup d’amour.', 'Que la vie te soit douce.'], tint: 'mint' },
      { h: 'Pour la personne que vous aimez', msgs: ['Pour toi, pour toujours.', 'Mon amour pour toi ne fanera jamais.', 'Une fleur pour chaque raison de t’aimer.', 'À toi, qui embellis chacun de mes jours.', 'Juste parce que je t’aime.'] },
      { h: 'Pour la fête des mères et des grands-mères', msgs: ['Bonne fête, maman !', 'À la plus douce des mamans.', 'Bonne fête, mamie chérie !', 'Pour toi qui penses toujours à nous.', 'Merci d’être toi.'], tint: 'tint' },
      { h: 'En souvenir', msgs: ['Toujours dans nos cœurs.', 'Tu nous manques.', 'Avec tout notre amour, pour toujours.', 'Pensées affectueuses.', 'Que ces fleurs veillent sur toi.'] },
      { h: 'Juste parce que', msgs: ['Juste parce que.', 'Pour illuminer ta journée.', 'Une petite douceur, rien que pour toi.', 'Parce que tu le vaux bien.', 'Pense à moi en les regardant.'], tint: 'mint' }
    ],
    products: ['bouquet-a-offrir', 'roses-blanches', 'fleur-unite', 'rose-tendre']
  }
];

const local = [
  {
    slug: 'fleurs-eternelles-ardennes',
    name: 'Fleurs éternelles dans les Ardennes',
    title: 'Fleurs éternelles faites main dans les Ardennes | Flore & Chenilles',
    desc: 'Flore & Chenilles, artisane de fleurs éternelles en fil chenille à Signy-l’Abbaye, dans les Ardennes : bouquets, fleurs à l’unité, déco.',
    hero: 'about',
    lead: 'Flore & Chenilles, c’est un atelier à Signy-l’Abbaye, dans les Ardennes. J’y façonne à la main, avec passion, des bouquets et des décorations en fleurs éternelles en fil chenille.',
    sections: [
      { h: 'Un atelier ardennais', p: ['Toutes les créations naissent à l’atelier de Signy-l’Abbaye, entre la Thiérache et le Porcien. Chaque fleur est façonnée à la main, à la commande, avec des fils sélectionnés pour leur qualité et leur durabilité.', 'Lys, arums, pavots, gerberas, roses, tulipes, hortensias, tournesols, jonquilles : les fleurs se déclinent dans toutes les couleurs, en bouquet, à l’unité ou en petites décorations.'] },
      { h: 'Des cadeaux faits main, près de chez vous', p: ['Pour un anniversaire, une naissance, la fête des mères ou la fin de l’année scolaire, offrir une création artisanale des Ardennes a du sens : elle est unique, faite près de chez vous, et ne fanera jamais.'], tint: 'tint' },
      { h: 'Retrait et livraison', p: ['Vous pouvez venir chercher votre création gratuitement à l’atelier de Signy-l’Abbaye, ou la faire livrer : 5 € jusqu’à 15 km, 10 € jusqu’à 25 km autour de l’atelier. [Voir les communes livrées](/livraison-fleurs-signy-l-abbaye/).'] },
      { h: 'Me suivre', p: ['Les nouveautés et les coulisses de l’atelier sont sur Instagram : [@flore_et_chenilles](https://www.instagram.com/flore_et_chenilles/).'] }
    ],
    products: ['amethyste', 'bonsai', 'pastel', 'theiere', 'fleur-unite', 'sunny', 'coquelicots', 'lavande']
  },
  {
    slug: 'livraison-fleurs-signy-l-abbaye',
    name: 'Livraison autour de Signy-l’Abbaye',
    title: 'Livraison de fleurs éternelles autour de Signy-l’Abbaye (Ardennes)',
    desc: 'Livraison de fleurs éternelles autour de Signy-l’Abbaye : 5 € jusqu’à 15 km, 10 € jusqu’à 25 km, retrait gratuit à l’atelier.',
    hero: 'sunny',
    lead: 'Les créations Flore & Chenilles se récupèrent gratuitement à l’atelier de Signy-l’Abbaye, ou se font livrer dans les environs.',
    sections: [
      { h: 'Les tarifs de livraison', table: { head: ['Distance depuis l’atelier', 'Prix'], rows: [['Retrait à l’atelier, à Signy-l’Abbaye', 'Gratuit'], ['Jusqu’à 15 km', '5 €'], ['De 15 à 25 km', '10 €'], ['Au-delà de 25 km', 'On en parle ensemble']] }, p: ['Le tarif dépend de la distance par la route jusqu’à votre adresse : je vous le confirme avec votre commande.'], tint: 'tint' },
      { h: 'Quelques communes des environs', p: ['Signy-l’Abbaye, Wasigny, Launois-sur-Vence, Novion-Porcien, Liart, Chaumont-Porcien, Thin-le-Moutier, Rumigny, Poix-Terron, Château-Porcien, Rethel, Charleville-Mézières… et tous les villages alentour. Votre commune n’y figure pas ? Écrivez-moi via le [formulaire de contact](#contact).'] },
      { h: 'Comment se passe une commande', ol: ['Ajoutez vos créations à votre sélection sur le site et écrivez votre carte de vœux.', 'Choisissez le retrait à l’atelier ou la livraison, puis envoyez votre demande.', 'Je vous confirme le prix, la date et la remise par e-mail. Aucun paiement n’est demandé sur le site.'] }
    ],
    products: ['sunny', 'bouquet-soleil', 'u-rose-rouge', 'tournesol-pot']
  }
];

module.exports = { colors, flowers, occasions, conseils, local };
