// Les outils de Lia : dans l'espace client, dès le forfait Chico. Chacun coûte des Jetons Lia (1 jeton = 1 centime).
// Une seule définition, utilisée par la page « Outils », la Documentation et l'espace client (PHP, via data.json).
//
// jetons : prix fixe de l'outil. Règle : ce que l'outil me coûte chez Claude (coutCts, en centimes, estimé
//          pour Claude Opus 5.5) × la marge des outils (config.jetonsLia.margeOutils), arrondi au jeton du dessus.
//          0 = gratuit : l'outil tourne dans le navigateur, il ne me coûte rien.
// champs : le formulaire (kind : texte, texte_long, choix, multi, image). consigne : ce que Lia doit rendre.
// blocs  : titres attendus dans la réponse (un bloc = un texte prêt à copier).
const RESEAUX = ['Facebook', 'Instagram', 'LinkedIn', 'X', 'Fiche Google', 'TikTok', 'Bluesky', 'Mastodon'];

const outils = [
  {
    id: 'publier',
    icon: 'megaphone',
    color: 'pink',
    name: 'Publier partout',
    court: 'Une photo, une description : publiez sur tous vos réseaux depuis la même page.',
    desc: 'Vous donnez une photo et quelques mots, puis vous publiez sur tous vos réseaux depuis la même page. Avec votre texte, c’est gratuit. Lia peut aussi l’adapter à chaque réseau, avec les hashtags.',
    coutCts: 5,
    jetons: 20,
    bouton: 'Écrire mes publications',
    champs: [
      { id: 'image', label: 'Votre photo (facultatif)', kind: 'image' },
      { id: 'description', label: 'De quoi parle la publication ?', kind: 'texte_long', requis: true, aide: 'Par exemple : nouveau bouquet de printemps, disponible dès samedi à l’atelier.' },
      { id: 'reseaux', label: 'Pour quels réseaux ?', kind: 'multi', options: RESEAUX, defaut: ['Facebook', 'Instagram'] },
      { id: 'ton', label: 'Le ton', kind: 'choix', options: ['Chaleureux', 'Professionnel', 'Drôle', 'Sobre'], defaut: 'Chaleureux' },
    ],
    consigne: 'Écris une publication pour chaque réseau demandé, adaptée à ses usages : Facebook (2 à 4 phrases, chaleureux), Instagram (accroche courte, 2 à 3 phrases, puis une ligne de 8 à 12 hashtags), LinkedIn (professionnel, 3 à 5 phrases, 3 hashtags), X (moins de 260 caractères, 1 ou 2 hashtags), Fiche Google (factuel, 2 à 3 phrases, sans hashtag, avec une invitation à venir ou à appeler), TikTok (légende courte et vivante, 4 à 6 hashtags), Bluesky (moins de 280 caractères, 1 ou 2 hashtags), Mastodon (moins de 450 caractères, 2 à 4 hashtags). Un bloc par réseau, dont le titre est exactement le nom du réseau. Si une photo est jointe, décris ce qu’on y voit sans inventer.',
  },
  {
    id: 'idees',
    icon: 'lightbulb',
    color: 'butter',
    name: 'Idées de publications',
    court: 'Sept idées pour la semaine, avec le texte déjà écrit.',
    desc: 'Plus de page blanche : Lia propose sept publications pour votre activité, une par jour, chacune avec son texte prêt à copier.',
    coutCts: 3,
    jetons: 12,
    bouton: 'Trouver mes idées',
    champs: [
      { id: 'activite', label: 'Votre activité', kind: 'texte', requis: true, prerempli: 'activite', aide: 'Par exemple : fleuriste à Signy-l’Abbaye.' },
      { id: 'actualite', label: 'Une actualité en ce moment ? (facultatif)', kind: 'texte_long', aide: 'Une promotion, une nouveauté, un événement, une saison.' },
    ],
    consigne: 'Propose sept publications pour les réseaux sociaux de cette activité, une par jour du lundi au dimanche, variées (coulisses, conseil, produit, client, question posée aux abonnés, humeur, annonce). Un bloc par jour : le titre est le jour suivi de l’idée en quelques mots, le texte est la publication prête à copier (2 à 4 phrases et 3 à 5 hashtags).',
  },
  {
    id: 'hashtags',
    icon: 'tag',
    color: 'lilac',
    name: 'Hashtags',
    court: 'Les bons hashtags pour votre publication.',
    desc: 'Vous écrivez le sujet, Lia donne trois listes de hashtags : les plus cherchés, ceux de votre métier, et ceux de votre région.',
    coutCts: 1.2,
    jetons: 5,
    bouton: 'Trouver mes hashtags',
    champs: [
      { id: 'sujet', label: 'Le sujet de la publication', kind: 'texte', requis: true },
      { id: 'lieu', label: 'Votre ville ou votre région (facultatif)', kind: 'texte' },
    ],
    consigne: 'Donne trois blocs de hashtags en français pour ce sujet : « Les plus cherchés » (8 hashtags), « Votre métier » (8 hashtags), « Près de chez vous » (6 hashtags, avec la ville ou la région donnée ; sans lieu, des hashtags France). Chaque bloc : les hashtags sur une seule ligne, séparés par un espace.',
  },
  {
    id: 'avis',
    icon: 'star',
    color: 'peach',
    name: 'Répondre à un avis',
    court: 'Une réponse polie à un avis Google, même difficile.',
    desc: 'Vous collez l’avis d’un client. Lia écrit une réponse courte et polie, que l’avis soit bon ou mauvais. Vous la copiez sur votre fiche Google.',
    coutCts: 1.2,
    jetons: 5,
    bouton: 'Écrire la réponse',
    champs: [
      { id: 'avis', label: 'L’avis du client', kind: 'texte_long', requis: true },
      { id: 'note', label: 'Sa note', kind: 'choix', options: ['5 étoiles', '4 étoiles', '3 étoiles', '2 étoiles', '1 étoile'], defaut: '5 étoiles' },
    ],
    consigne: 'Écris la réponse du commerçant à cet avis Google : polie, sincère, 2 à 4 phrases, au « vous ». Pour un bon avis : remercier et inviter à revenir. Pour un avis moyen ou mauvais : remercier, reconnaître le problème sans se justifier longuement ni accuser, proposer d’en parler directement. Ne promets rien de précis. Deux blocs : « Réponse » et « Variante plus courte ».',
  },
  {
    id: 'produit',
    icon: 'shopping-bag',
    color: 'mint',
    name: 'Fiche produit',
    court: 'Le titre et la description d’un produit, prêts à vendre.',
    desc: 'Une photo ou quelques mots sur votre produit : Lia écrit un titre, une phrase d’accroche et une description claire pour votre boutique.',
    coutCts: 3,
    jetons: 12,
    bouton: 'Écrire la fiche',
    champs: [
      { id: 'image', label: 'La photo du produit (facultatif)', kind: 'image' },
      { id: 'nom', label: 'Le nom du produit', kind: 'texte', requis: true },
      { id: 'infos', label: 'Ce qu’il faut savoir', kind: 'texte_long', aide: 'Matière, taille, couleurs, fabrication, à qui il plaît.' },
    ],
    consigne: 'Écris la fiche de ce produit pour une boutique en ligne. Trois blocs : « Titre » (moins de 60 caractères), « Accroche » (une phrase), « Description » (80 à 120 mots, phrases simples, ce que c’est, pour qui, les détails utiles). N’invente ni prix, ni dimensions, ni matière : utilise seulement ce qui est donné ou visible sur la photo.',
  },
  {
    id: 'google',
    icon: 'search',
    color: 'sky',
    name: 'Titre et description Google',
    court: 'Ce que Google affiche pour votre page, bien écrit.',
    desc: 'Pour une page de votre site, Lia écrit le titre et la description que Google affiche dans ses résultats, à la bonne longueur.',
    coutCts: 1.2,
    jetons: 5,
    bouton: 'Écrire pour Google',
    champs: [
      { id: 'page', label: 'De quoi parle la page ?', kind: 'texte_long', requis: true },
      { id: 'lieu', label: 'Votre ville (facultatif)', kind: 'texte' },
    ],
    consigne: 'Écris ce que Google affichera pour cette page. Deux blocs : « Titre » (50 à 60 caractères, le sujet d’abord, la ville si elle est donnée) et « Description » (140 à 155 caractères, une phrase qui donne envie de cliquer, sans majuscules abusives).',
  },
  {
    id: 'formats',
    icon: 'image-plus',
    color: 'sky',
    name: 'Photo aux bons formats',
    court: 'Votre photo recadrée pour chaque réseau, en un clic.',
    desc: 'Vous choisissez une photo : elle est recadrée au bon format pour Instagram, les stories, Facebook et LinkedIn. Vous téléchargez celles que vous voulez. Rien ne quitte votre appareil.',
    coutCts: 0,
    jetons: 0,
    local: true,
  },
  {
    id: 'qr',
    icon: 'qr-code',
    color: 'peach',
    name: 'QR code',
    court: 'Un QR code vers votre site, prêt à imprimer.',
    desc: 'Un QR code vers votre site, à imprimer sur vos cartes, votre vitrine ou vos flyers.',
    coutCts: 0,
    jetons: 0,
    local: true,
  },
  {
    id: 'lienavis',
    icon: 'link',
    color: 'butter',
    name: 'Lien d’avis Google',
    court: 'Le lien à envoyer à vos clients contents.',
    desc: 'Un lien tout prêt à envoyer à vos clients contents pour qu’ils laissent un avis.',
    coutCts: 0,
    jetons: 0,
    local: true,
  },
];

module.exports = { outils, RESEAUX };
