// ============================================================================
//  Les Minis Monstres : configuration centrale du site (identité, rubriques, l'offre unique :
//  le Site Essentiel à 400 €, option e-commerce + 200 €, abonnement à 10 € par mois, options et extras, Jetons Cerise,
//  fidélité, paiement). Tous les prix du site viennent d'ici : le configurateur, la page
//  /commander/, les données structurées et l'extension WordPress (data.json)
//  se mettent à jour au prochain build.
//  ⚠️  Les valeurs marquées « À REMPLACER » doivent être complétées avant la
//      mise en ligne (le build affiche un avertissement tant qu'elles restent).
// ============================================================================

const site = {
  // Domaine définitif (sans slash final). Sert aux balises canonical, au sitemap, à l'Open Graph.
  url: 'https://www.les-minis-monstres.fr',
  name: 'Les Minis Monstres',
  baseline: 'Sites internet et SEO', // n'est plus affiché sous le logo
  legalName: 'Les Minis Monstres, nom commercial d’Alexandre Poquet EI', // raison sociale / nom commercial
  // Novembre 2026 : le site a son propre WordPress sur les-minis-monstres.fr, entièrement séparé de aled08.fr (qui sera réutilisé
  // pour un autre site). Installation : extension « installeur » (scripts/wp-export.py) et docs/gestion-du-site.md (« Changer de domaine »).
  ancienDomaine: '', // vide : aled08.fr est séparé et sera réutilisé, aucune redirection
  owner: 'Alexandre Poquet',

  // Aucune coordonnée personnelle affichée : on écrit par le formulaire de contact (/contact/).
  // Quand une adresse de support existe (ex. support@les-minis-monstres.fr), la mettre ici : elle s'affichera.
  email: '',
  contactPath: '/contact/',

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
    siret: 'en cours d’attribution', // ⚠️ À REMPLACER par le numéro dès réception
    tva: '', // ex. : 'TVA non applicable, art. 293 B du CGI' si vous êtes en franchise de TVA
    mediator: 'en cours de désignation, ses coordonnées seront indiquées ici', // ⚠️ À REMPLACER
    mediatorUrl: '',
    host: 'o2switch, 222-224 boulevard Gustave Flaubert, 63000 Clermont-Ferrand, 04 44 44 60 40, www.o2switch.fr',
    publicationDirector: 'Alexandre Poquet',
  },

  // Endpoint du formulaire. Par défaut : script PHP fourni (/envoi.php). Sous WordPress, le thème s'en charge.
  formAction: '/envoi.php',

  // Espace client : /mon-espace/ (connexion, sous WordPress) et sa démonstration /mon-espace/demo/.
  // ouvert: false affiche « ouvre bientôt » sur la page Outils.
  espaceClient: { ouvert: true, url: '/mon-espace/', demo: '/mon-espace/demo/' },

  social: {
    facebook: '',
    instagram: '',
  },
};

// ---------------------------------------------------------------- rubriques
// Chaque rubrique a sa couleur pastel : on la retrouve dans le menu et en haut de la page.
const sections = {
  creer: { path: '/creer-mon-site/', label: 'Créer mon site', color: 'mint', icon: 'wand-sparkles' },
  forfaits: { path: '/tarifs/', label: 'Tarifs', color: 'lilac', icon: 'tag' },
  espace: { path: '/outils/', label: 'Outils', color: 'sky', icon: 'toolbox' },
  seo: { path: '/referencement-seo/', label: 'Visibilité Google', color: 'butter', icon: 'search-check' },
  contact: { path: '/contact/', label: 'Contact', color: 'peach', icon: 'message-circle' },
  // V2 (novembre 2026) : « Ils nous ont fait confiance » devient Réalisations, « Cerise et Alex » devient Pourquoi les Minis Monstres,
  // « Ma méthode » devient Pourquoi moins cher. Les anciennes adresses sont redirigées (scripts/wp-export.py).
  confiance: { path: '/realisations/', label: 'Réalisations', color: 'butter', icon: 'image' },
  liaalex: { path: '/pourquoi-les-minis-monstres/', label: 'Pourquoi les Minis Monstres', color: 'pink', icon: 'heart-handshake' },
  metiers: { path: '/metiers/', label: 'Votre métier', color: 'peach', icon: 'store' },
  equipe: { path: '/notre-equipe/', label: 'Notre équipe', color: 'lilac', icon: 'users' },
  accompagnement: { path: '/accompagnement/', label: 'Accompagnement', color: 'mint', icon: 'life-buoy' },
  guides: { path: '/guides/', label: 'Guides', color: 'sky', icon: 'book-open' },
  documentation: { path: '/documentation/', label: 'Documentation', color: 'sky', icon: 'book-open' },
  lexique: { path: '/lexique/', label: 'Lexique', color: 'mint', icon: 'book-open' },
  // Hors du menu principal
  comparatif: { path: '/comparatif/', label: 'Comparatif', color: 'butter', icon: 'scale' },
  fidelite: { path: '/fidelite/', label: 'Fidélité', color: 'pink', icon: 'gift' },
  methode: { path: '/pourquoi-moins-cher/', label: 'Pourquoi moins cher', color: 'lilac', icon: 'piggy-bank' },
  monespace: { path: '/mon-espace/', label: 'Mon espace', color: 'sky', icon: 'circle-user' },
  // Parcours de commande (pages noindex, hors menu et hors plan du site)
  commander: { path: '/commander/', label: 'Commander', color: 'mint', icon: 'shopping-bag' },
  confirmation: { path: '/commande-confirmee/', label: 'Commande confirmée', color: 'mint', icon: 'party-popper' },
};

// ---------------------------------------------------------------- l'offre : un seul prix
// Création du site : 500 €, quel que soit le site (une page ou plusieurs). Une boutique en ligne : + 200 €.
// Puis un abonnement obligatoire : 10 € par mois, sur lequel on ajoute ou on retire des extras quand on veut.
// pages : pages comprises dans la création. pagePlus : prix d'une page en plus (payée une fois). pagesPlusMax : au-delà, on en parle.
// Offre du 17 novembre 2026 : « Site Internet Professionnel », 500 €, jusqu'à 15 pages (20 au tout début, ramené à 15 le jour même). Les pages que le client n'utilise pas
// deviennent des pages pour Google (SEO). Deux options seulement : le Pack SEO et la boutique en ligne.
// pagePlus et pagesPlusMax ne sont plus proposés (gardés pour les anciennes commandes de l'extension).
// 18 novembre 2026 : le site compte 5 pages (plus 15). La boutique donne 5 emplacements d'articles (boutiqueProduits) que le client remplit lui-même
// (photo, description, prix) dans son espace client ; chaque emplacement en plus coûte boutiqueSlot € une fois, débloqué pour toujours.
// OFFRE FINALE (19 novembre 2026) : trois sites, trois prix. Site Essentiel (une page) 500 €, Site Visibilité (jusqu'à 15 pages, ramené de 20 à 15 le 21 novembre 2026) 750 €,
// Site Boutique 1 200 €. (Remplacée le 21 novembre 2026, voir juste en dessous.)
// UNE SEULE OFFRE (21 novembre 2026) : le Site Essentiel, 400 €, payé une fois. Dessous, une case « E-commerce : + 200 € »
// (600 € avec la boutique) : la boutique, les produits et services, le panier, le paiement en ligne sécurisé, les e-mails de
// commande, le catalogue, les prix, les promos, la livraison et les paiements gérés par le client depuis son espace client.
// Le Site Visibilité disparaît de l'offre : les pages pour Google sont l'extra « Page de visibilité Google » (packseo, 15 € la page,
// packs 1, 5 ou 10), commandé depuis l'espace client une fois le site en ligne.
// Pourquoi ce prix : Alex a créé et optimisé les « minis monstres », les modules dont un site est fait (accueil, présentation,
// services et tarifs, galerie, questions fréquentes, contact, boutique). Chaque module a été soigné une fois et se modifie à part ;
// un site s'assemble avec ces modules, rempli avec les informations et les photos du client. « Le cerveau est prêt : il ne
// manque que votre contenu. » Le client reçoit une première version (V1), qu'il modifie lui-même (bouton « Modifier mon site
// moi-même » de l'espace client) ou qu'il nous demande de modifier.
// prix : le Site Essentiel. ecommerce : l'option e-commerce (boutique : le même écart, nom gardé pour l'extension et les anciennes
// commandes). visibilite, boutiquePrix, pages et exemplePages sont retirés (plus aucune page ne les lit). pagePlus, pagesPlusMax,
// boutiqueProduits et boutiqueSlot restent : l'extension WordPress les lit (data.json).
const creation = { prix: 400, ecommerce: 200, boutique: 200, pagePlus: 10, pagesPlusMax: 0, boutiqueProduits: 0, boutiqueSlot: 0 };
// Offre événement : un code donné sur une foire, un marché, un salon ou un événement professionnel.
// remise : en %, sur la création du site (site et options payés une fois). Les codes valables se règlent dans
// l'extension WordPress (Réglages, « Codes événement ») : le serveur vérifie le code et recalcule le prix.
const evenement = { remise: 20, lieux: ['une foire', 'un marché', 'un salon', 'un événement professionnel'] };
// Repères du marché pour la page Tarifs : prix publics relevés en France en novembre 2026 pour un site fait
// par un indépendant (sources dans docs/prix-et-ia-2026.md). À relire une fois par an.
// vitrine : site vitrine d'environ cinq pages. boutique : boutique en ligne simple. entretien : maintenance par mois.
// bas : les offres à bas prix qui existent aussi (plus affichées sur le site depuis novembre 2026, gardées pour mémoire).
// Repères de marché pour comparer À PRESTATION ÉGALE (révisés le 18 novembre 2026) : un site vitrine de 5 pages (autant que chez nous) AVEC les bases du
// référencement, en France, en 2026. On retient la fourchette la plus citée, pas la plus flatteuse :
// - Indépendant : 1 500 à 3 000 € (un pack WordPress de 5 pages avec design adapté, formulaire et SEO de base). On trouve aussi des indépendants dès
//   800 €, et des budgets de 4 000 € et plus : voir `bas` et la note affichée sur la page Tarifs.
// - Agence : 3 000 à 8 000 € pour 5 à 10 pages (le haut de la fourchette publiée va à 12 000 €, médiane de 5 450 € chez les agences d'un baromètre).
// - Entretien : 40 à 200 € par mois chez les prestataires consultés (de 500 à 2 000 € par an chez La Fabrique du Net, de 60 € à 450 € par mois en agence),
//   hébergement souvent facturé à part (10 à 40 € par mois). Chez nous, 10 € par mois comprennent l'hébergement, le domaine, les sauvegardes, la
//   sécurité, la maintenance et les modifications.
// `fois` est CALCULÉ à partir de ces chiffres et du prix du site : si les chiffres changent, ou si le prix change, le texte du site suit.
// Sources (consultées en novembre 2026) : liste `sources` ci-dessous, affichée sur la page Tarifs.
const marche = {
  pagesCompare: 5,
  agenceMin: 3000, agenceMax: 8000,
  vitrineMin: 1500, vitrineMax: 3000,
  boutiqueMin: 2000, boutiqueMax: 6000,
  entretienMin: 40, entretienMax: 200,
  basMin: 400, basMax: 1300,
  sources: [
    { nom: 'La Fabrique du Net, tarifs moyens d’un site WordPress', url: 'https://www.lafabriquedunet.fr/creation-site-vitrine/articles/tarifs-moyens-creation-site-wordpress/' },
    { nom: 'Fenxi, combien coûte un site internet en 2026', url: 'https://fenxi.fr/blog/combien-coute-site-internet-2026-prix-delais/' },
    { nom: 'Plateya, coût de création d’un site internet en 2026', url: 'https://www.plateya.fr/blog/detail/cout-creation-site-internet-en-2026-guide-complet-des-prix-et-pieges-a-eviter' },
    { nom: 'Kolonell, agence web ou freelance : comparatif des prix', url: 'https://kolonell.com/fr/blog/agence-web-vs-freelance-site-vitrine-comparatif-prix-2026' },
    { nom: 'Kolonell, tarif mensuel d’une maintenance WordPress', url: 'https://kolonell.com/fr/blog/maintenance-site-wordpress-entreprise-tarif-mensuel-2026' },
  ],
};
// le nombre de fois : le prix bas et le prix haut de l'indépendant, divisés par notre prix (arrondis), donc « 3 à 6 » aujourd'hui
// 21 novembre 2026 : comparé au Site Essentiel (400 €), le seul site de l'offre.
marche.fois = Math.round(marche.vitrineMin / creation.prix) + ' à ' + Math.round(marche.vitrineMax / creation.prix);
// entretien : calculé plus bas, une fois le prix de l'abonnement connu (marche.entretienFois)

// ---------------------------------------------------------------- types de site
// 21 novembre 2026 : un seul site (le Site Essentiel), avec ou sans l'option e-commerce. Les ids restent, car l'extension WordPress
// et les anciennes commandes les lisent : 'une-page' = le Site Essentiel (400 €), 'boutique' = le Site Essentiel + e-commerce (600 €),
// 'vitrine' = l'ancien Site Visibilité (750 €), retiré (retire: true) : plus proposé nulle part, gardé pour les anciennes commandes.
// Sur le site public, on montre une seule offre (typesOfferts[0]) et une case « E-commerce » qui passe la commande en 'boutique'.
// delai : « quelques heures » (décision d'Alex, 21 novembre 2026), à partir de la réception du contenu : la base du site est préconfigurée.
const INCLUS_ESSENTIEL = ['Site internet personnalisé, assemblé à partir de nos modules', 'Rempli avec vos informations et vos photos', 'Design adapté à votre activité', 'Compatible téléphone et ordinateur', 'Formulaire de contact', 'Bases du référencement Google', 'Mise en ligne complète', 'Modifiable par vous-même, à volonté, avec le forfait Mini', 'Export du site possible'];
// La ligne de la liste qui a son petit « i » avec une capture (src/assets/img/options/modifier.webp)
const INCLUS_INFO = { 'Modifiable par vous-même, à volonté, avec le forfait Mini': { id: 'modifier', nom: 'Modifier mon site moi-même', texte: 'Depuis votre espace client, le bouton « Modifier mon site moi-même » ouvre votre site en mode modification : vous touchez un texte ou une photo, vous le changez, c’est en ligne tout de suite. Une erreur ? « Annuler la dernière » revient en arrière.' } };
// Ce que l'option e-commerce ajoute (ce qu'apportait le Site Boutique)
const INCLUS_ECOMMERCE = ['Boutique en ligne complète', 'Vente de produits et services', 'Panier d’achat', 'Paiement en ligne sécurisé', 'E-mails de commande automatiques', 'Catalogue, prix et promotions gérés par vous', 'Livraison et moyens de paiement réglés par vous', 'Configuration complète de la boutique'];
const types = [
  {
    id: 'une-page',
    name: 'Site Essentiel',
    label: 'Site Essentiel',
    emoji: '👾',
    but: 'Être visible sur internet',
    color: 'sky',
    icon: 'layout-template',
    monstre: 'bricou',
    vedette: true,
    price: creation.prix,
    delai: 'quelques heures',
    pitch: 'Votre site professionnel, assemblé à partir de nos modules déjà prêts et rempli avec vos informations et vos photos.',
    qui: 'Pour exister sur internet, être joignable et présenter votre activité.',
    ideal: 'idéal pour être visible vite, à petit prix',
    pourQui: 'Pour toute activité qui veut un site clair, rapide et à son image : artisan, commerçant, indépendant, association, profession libérale.',
    inclus: INCLUS_ESSENTIEL,
  },
  {
    id: 'boutique',
    name: 'Site Essentiel + e-commerce',
    label: 'Site Essentiel + e-commerce',
    emoji: '🛒',
    but: 'Vendre sur internet',
    color: 'pink',
    icon: 'shopping-bag',
    monstre: 'mochi',
    price: creation.prix + creation.ecommerce,
    base: 'Site Essentiel',
    option: true, // le Site Essentiel avec la case « E-commerce » cochée
    info: 'Une boutique complète sur votre site : vos produits et vos services, un panier et le paiement en ligne sécurisé. Vous recevez un e-mail à chaque commande, et vous gérez votre catalogue, vos prix, vos promotions, la livraison et vos paiements vous-même, depuis votre espace client.',
    delai: 'quelques heures',
    pitch: 'Le Site Essentiel avec une boutique : vos clients choisissent, paient en ligne sur votre site, et vous recevez la commande.',
    qui: 'Pour vendre vos produits et vos services sur internet.',
    ideal: 'idéal pour vendre, avec le paiement en ligne',
    pourQui: 'Pour vous si vous voulez vendre vos produits ou vos services en ligne, même quand votre boutique est fermée. Par exemple : créateur, commerçant, producteur.',
    inclus: ['Tout le Site Essentiel', ...INCLUS_ECOMMERCE, 'Export du site possible'],
  },
  {
    // RETIRÉ le 21 novembre 2026 : plus proposé. Gardé pour les anciennes commandes (l'extension le lit encore).
    id: 'vitrine',
    retire: true,
    name: 'Site Visibilité',
    label: 'Site Visibilité',
    emoji: '🚀',
    but: 'Être trouvé sur Google',
    color: 'butter',
    icon: 'search-check',
    monstre: 'gelee',
    price: 750,
    delai: '1 à 2 semaines',
    base: 'Site Essentiel',
    pitch: 'Jusqu’à 15 pages, pensées pour que Google comprenne votre activité et vous montre près de chez vous.',
    qui: 'Pour être trouvé sur Google par les clients de votre secteur.',
    ideal: 'idéal pour être trouvé sur Google, avec une page par sujet',
    pourQui: 'Pour vous si vous proposez plusieurs services, ou si vous voulez être trouvé sur Google.',
    inclus: ['Tout le contenu du Site Essentiel', 'Jusqu’à 15 pages', 'Pages de visibilité Google intégrées', 'Référencement local renforcé', 'Structure optimisée pour Google', 'FAQ personnalisée', 'Export du site possible'],
  },
];
// Les sites proposés aujourd'hui (sans les retirés) : le Site Essentiel, et le Site Essentiel + e-commerce.
const typesOfferts = types.filter((t) => !t.retire);
// L'offre, en un objet : le site, l'option e-commerce et ce qu'elle ajoute. Lu par les composants, les pages et les contenus.
const offreSite = {
  site: types[0],
  avecBoutique: types[1],
  option: { id: 'ecommerce', name: 'E-commerce', prix: creation.ecommerce, icon: 'shopping-bag', inclus: INCLUS_ECOMMERCE, court: 'La boutique en ligne : produits et services, panier, paiement sécurisé, e-mails de commande.' },
};
// Les modules dont un site est fait (« Comment est fait votre site ») : créés et optimisés une fois, modifiables chacun de leur côté.
// option : n'arrive qu'avec l'option e-commerce.
const modules = [
  { id: 'accueil', nom: 'Accueil', icon: 'house', d: 'Votre nom, ce que vous faites, et un bouton pour vous joindre.' },
  { id: 'presentation', nom: 'Présentation', icon: 'user', d: 'Qui vous êtes, votre histoire, votre façon de travailler.' },
  { id: 'services', nom: 'Services et tarifs', icon: 'tag', d: 'Ce que vous proposez, avec vos prix si vous le souhaitez.' },
  { id: 'galerie', nom: 'Galerie', icon: 'image', d: 'Vos photos : vos réalisations, votre lieu, vos produits.' },
  { id: 'faq', nom: 'Questions fréquentes', icon: 'message-circle', d: 'Les réponses aux questions que vos clients posent souvent.' },
  { id: 'contact', nom: 'Contact', icon: 'mail', d: 'Le formulaire, vos horaires, votre adresse.' },
  { id: 'boutique', nom: 'Boutique', icon: 'shopping-bag', option: true, d: 'Avec l’option e-commerce : vos articles, le panier et le paiement en ligne.' },
];
// (ancienne petite étoile des « révisions illimitées » : retirée le 21 novembre 2026, la V1 est livrée directement)
const revisionsNote = '';

// ---------------------------------------------------------------- l'abonnement de base (un seul, obligatoire)
// En paiement annuel : 2 mois offerts.
// quota : interventions d'Alex (modifications faites à la main) par période. periode : 'trimestre' depuis la V2
// (novembre 2026). Les clients inscrits avant gardent une intervention par mois : c'est géré dans l'extension WordPress.
// jetons : Jetons Cerise donnés chaque mois, pour les outils et les retouches faites par Cerise. Besoin de plus : le client
// en rachète à l'utilisation (jetonsLia.recharge), ajoutés à sa prochaine facture. L'option « Cerise + » n'existe plus.
// Les anciens forfaits (chico, power, titan) n'existent plus : un ancien client garde ce qu'il avait
// (power : extra Suivi Google ; titan : extras Suivi Google et chiffres détaillés), c'est géré dans l'extension WordPress.
// L'énergie donnée chaque mois avec l'abonnement : elle sert aux outils de l'espace client et aux petites retouches.
const energieMois = 250;
// ---------------------------------------------------------------- en pause
// Novembre 2026 : l'énergie et les outils de l'espace client sont retirés pour l'instant, du site public comme de
// l'espace client. Cerise (la bulle et les demandes) reste comprise, sans énergie : les modifications
// sont sans limite, la bulle garde limites.bulleJour messages par jour.
// Pour tout remettre : outils et energie à true (les textes, l'onglet Outils et la page /outils/ reviennent).
const enService = { outils: false, energie: false };
const limites = { bulleJour: 40 }; // messages par jour dans la bulle de Cerise (les modifications sont sans limite)
const enPause = !enService.energie;
// Un seul abonnement : Mini, 10 € par mois, sans engagement (18 novembre 2026). Maxi est retiré : tout ce qu'il apportait se prend
// maintenant en extra, depuis l'espace client (voir « extras » plus bas). Maxi (id 'evolution') reste défini dans `forfaitsAnciens`
// pour les clients qui l'ont déjà : l'extension WordPress le connaît mais ne le propose plus.
// illimite : modifications incluses, sans quota (quota et periode ne servent plus que pour les anciens comptes de l'extension).
// delai : délai des modifications (« 48 heures » : une modification peut prendre jusqu'à 48 h). delaiTexte : la phrase complète après « Modifications ».
// priorite, pageSeo, optimisation : ne servent plus que pour l'ancien abonnement Maxi.
// L'abonnement, c'est « maintenir le site » : hébergement, sauvegardes, sécurité, maintenance et modifications. Le nom de domaine est offert
// tant que l'abonnement est actif. La création du site (400 €, 600 € avec l'option e-commerce) est un autre achat, payé une fois.
const forfaits = [
  {
    id: 'base',
    name: 'Mini',
    emoji: '🔵',
    color: 'mint',
    month: 10,
    // 19 novembre 2026 : le forfait est à 10 € par mois avec le nom de domaine du client. S'il n'en a pas, on le lui fournit : + 2 € par mois (12 € en tout).
    domaine: 2,
    quota: 1,
    periode: 'trimestre',
    illimite: true,
    pageSeo: '',
    jetons: energieMois, // énergie (en pause)
    partage: false,
    delai: '',
    delaiTexte: 'faites par Alex', // 19 novembre 2026 : aucun délai annoncé
    demandesMax: 1,
    bulle: 'Votre site en ligne, protégé et à jour',
    modifs: 'modifications incluses',
    conseil: false,
    tagline: 'Sans engagement',
    pitch: 'On s’occupe de tout : votre site reste en ligne, protégé et à jour. Vos modifications sont incluses, et vous les demandez directement depuis votre espace client. Pas encore de nom de domaine ? On vous le fournit pour 2 € de plus par mois.',
    main: ['Modifications incluses', 'Hébergement', 'Les Minis Monstres à votre service', 'Sauvegardes automatiques', 'Sécurité', 'Maintenance technique', 'Espace client', 'Demandes de modification directement depuis votre espace client', 'Nom de domaine fourni si vous n’en avez pas : + 2 € par mois'],
    details: ['Hébergement : l’endroit où votre site reste accessible 24 h/24', 'Nom de domaine : l’adresse de votre site. Vous avez le vôtre : rien à ajouter. Vous n’en avez pas : on vous le fournit, à votre nom, pour 2 € de plus par mois', 'Sauvegardes automatiques : une copie de sécurité de votre site, faite toute seule', 'Sécurité : le petit cadenas et la protection contre les attaques', 'Maintenance technique : votre site reste à jour', 'Espace client : tout se gère au même endroit, depuis votre téléphone', 'Les Minis Monstres à votre service : une question, et on vous répond', 'Modifications incluses : Bricou clarifie votre demande, Alex fait la modification, une demande à la fois', 'Vos demandes se font directement depuis votre espace client'],
    features: ['Modifications incluses', 'Hébergement', 'Sauvegardes automatiques', 'Sécurité', 'Maintenance technique'],
  },
];
// Les anciens abonnements : plus proposés, mais un client qui en a un le garde (l'extension WordPress les lit ici).
marche.entretienFois = Math.round(marche.entretienMin / forfaits[0].month) + ' à ' + Math.round(marche.entretienMax / forfaits[0].month);
const forfaitsAnciens = [
  {
    id: 'evolution',
    name: 'Maxi',
    color: 'lilac',
    month: 20,
    quota: 1,
    periode: 'trimestre',
    illimite: true,
    priorite: true,
    pageSeo: 'semaine',
    pageSeoSemaine: true,
    optimisation: true,
    jetons: energieMois,
    partage: false,
    delai: '48 heures',
    delaiTexte: 'faites par Alex',
    demandesMax: 2,
    bulle: 'Votre site qui grandit chaque semaine, avec la bande aux petits soins',
    modifs: 'modifications prioritaires, une page SEO optimisée par semaine et l’optimisation continue',
    conseil: true,
    tagline: 'Sans engagement',
    retire: true,
    pitch: 'Tout Mini, avec vos modifications en priorité, deux demandes à la fois, une page SEO optimisée chaque semaine, et la bande qui surveille votre site.',
    main: ['Tout Mini', 'Modifications prioritaires, faites par Alex', 'Deux demandes à la fois', 'Une page SEO optimisée par semaine', 'Analyse régulière du site par Mirette', 'Suggestions d’amélioration par la bande'],
    details: [],
    features: ['Tout Mini', 'Deux demandes à la fois', 'Une page SEO optimisée par semaine', 'Optimisation continue'],
  },
];
// L'optimisation continue de Maxi, expliquée (page Tarifs, documentation, espace client)
const optimisation = {
  titre: 'Optimisation continue',
  texte: 'Les Minis Monstres surveillent votre site et proposent régulièrement des améliorations pour augmenter votre visibilité.',
};
// Création seule : pour un client qui a déjà son nom de domaine et son hébergement. Il paie seulement la création,
// sans formule au mois, et reçoit le code de son site (fichiers et sauvegarde), prêt à installer chez son hébergeur.
// Pas de modifications ni de maintenance incluses : il peut prendre une formule plus tard. id 'sans' dans la commande.
const creationSeule = {
  id: 'sans',
  name: 'Autonome',
  emoji: '⚪',
  month: 0,
  color: 'peach',
  court: 'Vous gérez tout vous-même : je vous remets votre site, prêt à installer chez votre hébergeur.',
  main: ['Aucune obligation d’abonnement', 'Vous gérez votre hébergement', 'Vous gérez votre nom de domaine', 'Vous gérez vos sauvegardes', 'Vous gérez vos mises à jour'],
};
const annuel = { moisOfferts: 0 }; // 19 novembre 2026 : plus de réduction à l'année (le paiement à l'année n'est plus proposé)
// Le paiement en plusieurs fois passe par un organisme externe (Alma, Klarna), proposé sur la page de paiement Stripe, à la
// commande : il avance la somme entière, nous sommes payés tout de suite. L'ancien étalement maison (6 ou 12 fois) est arrêté.
const lissage = { durees: [] };
const fractionne = { fois: '3 ou 4', organismes: 'Alma ou Klarna' };
// Délai de réponse aux demandes de modification (le même pour tous).
const delais = { reponse: '48 heures', titan: '72 heures', urgent: '24 heures', evolution: '48 heures' };

// ---------------------------------------------------------------- options et extras
// quand : 'creation' = payé une fois, à la création du site ; 'mois' = extra de l'abonnement, activable et désactivable.
// price : { once } pour un paiement unique, { month } pour un paiement mensuel.
// types : réservé à ces types de site (ex. ['boutique']) ; absent = tous les sites.
// court : la version en une ligne, pour le configurateur. desc : la description complète, pour la page Tarifs.
// info : ce que l'option ajoute, montré par le petit « i », avec sa capture d'exemple (src/assets/img/options/<id>.webp,
// fabriquée par scripts/captures-options.js).
// 17 novembre 2026 : deux options seulement, payées une fois. Le Pack SEO ici, et la boutique en ligne (creation.ecommerce,
// le type de site « boutique », l'option e-commerce depuis le 21 novembre 2026). Les anciennes options et extras restent listés avec retire: true, pour les clients qui
// les ont déjà (l'extension les montre encore dans leur compte), mais ne sont plus proposés.
const options = [
  { id: 'packseo', quand: 'espace' /* se commande depuis l'espace client, 10 € la page (21 novembre 2026) */, group: 'site', name: 'Page de visibilité Google', icon: 'search-check', price: { once: 10 }, pages: 1, exemples: ['Service + ville', 'FAQ', 'Métier', 'Page locale', 'Guide'], inclus: ['Nouvelle page optimisée pour Google', 'Intégration au site', 'Optimisation référencement local'], court: 'Une nouvelle page optimisée pour Google, intégrée à votre site.', packs: [1, 5, 10], info: 'Une page de plus, écrite pour une recherche que font vos clients sur Google. Par exemple : un service et une ville, une FAQ, votre métier, une page locale ou un guide. Plus votre site a de pages utiles, plus il a de chances d’apparaître.', desc: 'Une nouvelle page optimisée pour Google, intégrée à votre site, avec le référencement local soigné. Par exemple : service + ville, FAQ, métier, page locale ou guide.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'assistant', badge: 'Nouveau', quand: 'mois', group: 'contact', name: 'Assistant Cerise sur votre site', icon: 'message-circle', price: { month: 15 }, court: 'Un assistant qui répond aux questions de vos visiteurs, à toute heure.', info: 'Un petit assistant sur votre site répond aux questions de vos visiteurs (horaires, prix, services, délais), à toute heure, en s’appuyant sur ce que dit votre site. Alex le règle pour votre activité et vérifie ses réponses. Pour ce que l’assistant ne sait pas, il renvoie vers votre formulaire de contact.', desc: 'Un assistant sur votre site qui répond aux questions de vos visiteurs, adapté à votre activité. Alex le règle et le vérifie.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'deux', quand: 'mois', group: 'quotidien', name: 'Deux demandes à la fois', icon: 'layers', price: { month: 5 }, court: 'Deux demandes de modification en cours en même temps.', info: 'Avec l’abonnement, une demande de modification est en cours à la fois. Avec cet extra, vous pouvez en avoir deux en même temps, sans attendre que la première soit faite.', desc: 'Deux demandes de modification en cours en même temps, au lieu d’une.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'mirette', quand: 'mois', group: 'trouve', name: 'Analyse de Mirette', icon: 'chart-line', price: { month: 5 }, court: 'Mirette surveille votre site et vous propose des améliorations.', info: 'Chaque semaine, Mirette regarde vos visites, vos pages les plus vues et ce que cherchent vos visiteurs, puis la bande vous propose des améliorations dans votre espace client. Vous choisissez celles qui vous plaisent, Alex les fait.', desc: 'Mirette analyse votre site chaque semaine et la bande vous propose des améliorations, dans votre espace client.' },
  { retire: true /* 18 novembre 2026 : une page se paie à la page, une fois (extra packseo) */, id: 'seomois', quand: 'mois', group: 'trouve', name: 'Une page visibilité Google chaque mois', icon: 'search-check', price: { month: 15 }, court: 'Lumi choisit un sujet, Alex écrit la page, chaque mois.', info: 'Chaque mois, Lumi analyse votre site et choisit un sujet que cherchent vos clients sur Google. Alex écrit la page et la met en ligne : une porte de plus vers votre site. Plus votre site a de pages utiles, plus il a de chances d’apparaître.', desc: 'Chaque mois, Lumi choisit un sujet et Alex écrit une nouvelle page pour la visibilité de votre site sur Google, mise en ligne pour vous.' },
  { retire: true /* 18 novembre 2026 : une page se paie à la page, une fois (extra packseo) */, id: 'seosemaine', quand: 'mois', group: 'trouve', name: 'Une page visibilité Google chaque semaine', icon: 'search-check', price: { month: 50 }, court: 'Lumi choisit un sujet, Alex écrit la page, chaque semaine.', info: 'Chaque semaine, Lumi choisit un sujet et Alex écrit la page et la met en ligne : une nouvelle porte vers votre site chaque semaine, pour ceux qui veulent avancer vite.', desc: 'Chaque semaine, Lumi choisit un sujet et Alex écrit une nouvelle page de visibilité Google.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'en', quand: 'creation', group: 'site', name: 'Traduction en anglais', icon: 'languages', price: { once: 100 }, court: 'Avec un bouton pour changer de langue.', info: 'Chaque page existe aussi en anglais, relue à la main. Un bouton en haut du site passe d’une langue à l’autre, et Google peut montrer la version anglaise aux visiteurs étrangers.', desc: 'Votre site traduit en anglais et relu, avec un bouton pour changer de langue. Pour les touristes et les clients venus d’ailleurs.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'rdv', quand: 'creation', group: 'site', name: 'Prise de rendez-vous', icon: 'calendar-check', price: { once: 100 }, court: 'Vos clients réservent un créneau en ligne.', info: 'Une page avec vos créneaux libres. Le client choisit son jour et son heure, reçoit une confirmation, et vous êtes prévenu par e-mail. Vous ouvrez et fermez les créneaux vous-même.', desc: 'Vos clients réservent un créneau sur votre site, selon vos disponibilités. Vous recevez un e-mail à chaque réservation.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'reprise', quand: 'creation', group: 'site', name: 'Reprise de votre ancien site', icon: 'refresh-cw', price: { once: 100 }, court: 'On garde vos textes, photos et adresses.', info: 'Je récupère les textes, les photos et les adresses des pages de votre ancien site, et je les remets au propre. Les anciens liens mènent au bon endroit : vous gardez votre place sur Google.', desc: 'Vos textes, vos photos et vos adresses de pages repris de l’ancien site, pour garder votre place sur Google.' },
  { id: 'pages', retire: true /* remplacée par « 10 € la page en plus » (novembre 2026) : gardée pour les anciennes commandes */, quand: 'creation', group: 'site', name: 'Cinq pages de plus', icon: 'layers', price: { once: 100 }, types: ['vitrine', 'boutique'], court: 'Cinq pages en plus des cinq comprises.', info: 'Votre site passe de cinq à dix pages : une page par service, par produit phare ou par événement. Chaque page utile est une chance de plus d’être trouvé sur Google.', desc: 'Pour un site plus grand : cinq pages en plus des cinq comprises.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'seo', quand: 'mois', group: 'site', name: 'Suivi Google', icon: 'search-check', price: { month: 10 }, court: 'Je travaille votre place sur Google, chaque mois.', info: 'Chaque mois, je suis les mots que tapent vos clients, je retouche vos pages pour les aider à monter sur Google, et vous recevez un rapport simple : votre place pour chaque mot et les visites venues de Google.', desc: 'Chaque mois, je regarde les mots que vos clients tapent, j’améliore vos pages pour Google et je vous montre où vous en êtes.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'stats', quand: 'mois', group: 'site', name: 'Chiffres détaillés', icon: 'chart-line', price: { month: 5 }, court: 'Visiteurs, provenance et ventes, heure par heure.', info: 'Le tableau de bord complet : la courbe de vos visites, les appareils, d’où viennent vos visiteurs, vos ventes, et un rapport chaque mois.', desc: 'Votre site heure par heure : visiteurs, pages vues, provenance, ventes. Et un rapport simple chaque mois.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'mail', quand: 'mois', group: 'quotidien', name: 'Adresse e-mail pro', icon: 'at-sign', price: { month: 3 }, court: 'Une adresse comme contact@votreboite.fr.', info: 'Une vraie boîte à votre nom, comme contact@votreboite.fr, sur votre téléphone et votre ordinateur. Je la crée et je vous envoie les réglages.', desc: 'Une adresse comme contact@votreboite.fr, sur votre téléphone et votre ordinateur.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'stock', quand: 'mois', group: 'boutique', name: 'Gestion du stock', icon: 'warehouse', price: { month: 5 }, types: ['boutique'], court: 'Le stock se décompte à chaque vente.', info: 'Vous indiquez combien vous avez de chaque produit. Le stock baisse tout seul à chaque vente, le site affiche « Plus que 2 » quand il en reste peu, puis « Épuisé » à zéro.', desc: 'Le stock de votre commerce se décompte tout seul à chaque vente. Vous savez toujours ce qu’il reste.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'comptes', quand: 'mois', group: 'boutique', name: 'Comptes clients', icon: 'users', price: { month: 5 }, types: ['boutique'], court: 'Vos clients gardent commandes, adresses et favoris.', info: 'Vos clients se créent un compte : ils retrouvent leurs commandes, leurs adresses et leurs produits favoris, et recommandent en un clic.', desc: 'Vos clients se créent un compte sur votre site : commandes passées, adresses et favoris gardés.' },
];

// ---------------------------------------------------------------- la petite bande : les automatisations d'Alex
// Alex conçoit et fait chaque site lui-même. À côté, il a programmé une petite bande de compagnons : ce sont ses
// automatisations, dessinées en petits monstres (src/lib/bestiaire.js). Chacun s'occupe d'une tâche répétitive mais
// utile, travaille en autonomie, et Alex vérifie tout ce qu'il fait. C'est ce qui permet un site bien moins cher qu'un indépendant (voir `marche` : le rapport est calculé).
// Sur le site public, on ne parle ni d'IA ni de jetons : seulement de ces petits monstres. Chacun a un prénom et UN rôle :
// Cerise répond et prépare les demandes ; c'est Alex qui fait toutes les modifications (17 novembre 2026).
// option : l'extra qui l'ajoute à votre abonnement (id d'un extra de `options`, ou 'boutique'). compris : dans l'abonnement de base.
// Mirette (analyse) et Lumi (pages SEO) ne sont plus comprises dans l'abonnement : ce sont des extras, pris à la carte depuis l'espace client.
// outils : il aide aussi le client au quotidien, dans son espace (au service de tous).
// 17 novembre 2026 : chaque monstre a un métier clair, ses missions et sa personnalité. Sur le site, on ne parle pas d'IA :
// seulement de ces petits monstres. role : son métier. missions : ce qu'il fait pour le client. perso : son caractère.
// compris : avec l'abonnement. option : l'extra qui l'apporte ('mirette', 'packseo') ou 'boutique' (il arrive avec la boutique en ligne).
// court / fait : une phrase courte et une phrase complète, reprises par les pages et les FAQ.
const bandeTout = [
  { id: 'support', nom: 'Cerise', emoji: '🍒', monstre: 'lia', role: 'La secrétaire', compris: true, missions: ['Répond à vos questions', 'Vous guide sur le site', 'Vous accompagne pas à pas'], perso: 'Souriante et toujours disponible, elle ne laisse jamais une question sans réponse.', court: 'Elle répond à vos questions, à toute heure.' },
  { id: 'constructeur', nom: 'Bricou', emoji: '🔧', monstre: 'bricou', role: 'Le constructeur', compris: true, missions: ['Prend vos demandes de modification', 'Les clarifie avec vous', 'Les transmet à Alex, bien claires'], perso: 'Toujours un outil à la main, il aime le travail bien préparé.', court: 'Il prépare vos demandes de modification pour Alex.' },
  { id: 'ecrivain', nom: 'Plume', emoji: '✍️', monstre: 'fantome', role: 'La rédactrice', compris: true, missions: ['Prépare vos contenus', 'Vous aide à écrire vos textes', 'Rend chaque phrase facile à lire'], perso: 'Rêveuse mais précise, elle cherche toujours le mot juste.', court: 'Elle écrit et soigne vos textes.' },
  { id: 'observateur', nom: 'Mirette', emoji: '👀', monstre: 'gelee', role: 'La spécialiste visibilité', compris: true, missions: ['Prépare vos pages de visibilité Google', 'Aide Google à comprendre votre activité', 'Soigne votre référencement local'], perso: 'Curieuse, elle ne quitte jamais Google des yeux.', court: 'Elle vous aide à être trouvé sur Google.' },
  { id: 'organisateur', nom: 'Mochi', emoji: '📦', monstre: 'mochi', role: 'L’organisateur', compris: true, missions: ['Classe vos contenus', 'Organise vos pages', 'Range votre boutique et vos commandes'], perso: 'Un peu maniaque, il adore quand chaque chose est à sa place.', court: 'Il range vos pages, vos produits et vos commandes.' },
  { id: 'extras', nom: 'Pépite', emoji: '✨', monstre: 'etoile', role: 'La spécialiste des extras', compris: true, missions: ['Présente les extras', 'Prépare vos devis', 'Suit vos commandes d’extras'], perso: 'Pétillante, elle a toujours une bonne idée pour aller plus loin.', court: 'Elle s’occupe de vos extras et de vos devis.' },
];
const bande = bandeTout;

// ---------------------------------------------------------------- fidélité et paiement
// La phrase principale et le positionnement (accueil, tarifs)
const phrase = {
  titre: 'Avoir une activité sans site internet, c’est comme posséder une magnifique vitrine dans une rue où personne ne passe.',
  suite: 'Vos futurs clients ne peuvent pas découvrir ce que vous proposez si vous n’êtes pas visible.',
};
const fidelite = { parrainageMois: 1, remiseSecondSite: 10 };
// 20 novembre 2026 : la création du site se paie en entier à la commande (acompte: 100, le nom de la clé est gardé : le PHP la lit).
// Sur la page de paiement Stripe, le client choisit : en une fois, ou en 3 ou 4 fois avec Alma ou Klarna (l'organisme nous
// verse tout de suite la somme entière). Plus de « reste à la réception ». Le forfait démarre à la mise en ligne du site.
const paiement = { acompte: 100 };

// ---------------------------------------------------------------- Jetons Cerise
// 1 Jeton Cerise = 1 centime. Les jetons paient ce que fait Cerise : les modifications du site et les outils.
// Règle de prix : ce que Cerise me coûte (Claude) × margeOutils pour les outils, × margeLia pour les modifications.
// modif : prix d'une modification par Cerise = base + 1 jeton par tranche de `mots` mots écrits + `image` par photo jointe.
// recharge : jetons en plus, achetés à l'utilisation, ajoutés à la prochaine facture.
// liaplus : jetons de l'ancienne option Cerise + (supprimée en novembre 2026, plus aucun client ne l'avait), gardé pour l'extension.
const jetonsLia = {
  valeur: 0.01,
  margeOutils: 4,
  margeLia: 2,
  modif: { base: 30, mots: 10, image: 10 },
  recharge: [{ jetons: 100, prix: 1 }, { jetons: 500, prix: 5 }, { jetons: 1000, prix: 10 }],
  liaplus: 500,
  // La bulle de Cerise, en bas de l'espace client : on lui écrit, elle répond et prépare l'action à valider.
  // jetons : prix d'un message (avec le modèle rapide ; l'extension le recalcule si on change de modèle).
  // parJour : messages par jour et par client. max : longueur d'un message.
  bulle: { jetons: 1, parJour: 40, max: 600 },
};

// ---------------------------------------------------------------- extras à la demande (payés une fois)
// Commandés depuis l'espace client quand on en a besoin, ajoutés à la prochaine facture. Rien à payer si on ne s'en sert pas.
// alex : une intervention d'Alex en plus de celle de la période (l'ancien « Boost »).
// Retirés le 17 novembre 2026 (offre simplifiée) : gardés pour les anciennes commandes de l'extension.
const aLaDemande = [
  { retire: true, id: 'alex', name: 'Une intervention à la main en plus', prix: 5, icon: 'user-check', desc: 'Une modification que je fais à la main, en plus de celle du trimestre.' },
  // --- être trouvé sur Google
  { id: 'packseo', groupe: 'trouve', name: 'Page de visibilité Google', prix: 10, icon: 'search-check', packs: [1, 5, 10], unite: 'page', inclus: ['Nouvelle page optimisée pour Google', 'Intégration au site', 'Optimisation référencement local'], court: 'Une nouvelle page optimisée pour Google, intégrée à votre site.', desc: 'Une porte de plus vers votre site : une page écrite pour une recherche que font vos clients sur Google (un service et une ville, une FAQ, votre métier, une page locale, un guide). Mirette en choisit le sujet avec vous, la page est écrite puis intégrée à votre site, avec le référencement local soigné. 15 € la page, payée une fois.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'article', groupe: 'trouve', name: 'Article de blog écrit et publié', prix: 15, icon: 'pen-tool', packs: [1, 5, 10], unite: 'article', court: 'Un article de blog écrit, illustré et publié sur votre site.', desc: 'Vous donnez le sujet. J’écris l’article, je le relis, je l’illustre et je le publie sur votre site.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'avis', groupe: 'trouve', name: 'Vos avis Google sur votre site', prix: 40, icon: 'star', court: 'Vos meilleurs avis Google s’affichent sur votre site.', desc: 'Vos meilleurs avis Google s’affichent sur votre site, à jour tout seuls. Ça rassure vos futurs clients.' },
  // --- plus de contacts
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'rdv', groupe: 'contact', name: 'Prise de rendez-vous en ligne', prix: 100, icon: 'calendar-check', court: 'Vos clients réservent leur créneau en ligne, vous êtes prévenu.', desc: 'Une page avec vos créneaux libres : vos clients choisissent leur jour et leur heure, reçoivent une confirmation, et vous êtes prévenu par e-mail.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'whatsapp', groupe: 'contact', name: 'Bouton WhatsApp et appel direct', prix: 20, icon: 'phone', court: 'Un bouton pour vous écrire ou vous appeler en un clic.', desc: 'Un petit bouton sur chaque page pour vous écrire sur WhatsApp ou vous appeler en un clic, surtout depuis un téléphone.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'newsletter', groupe: 'contact', name: 'Inscription à votre lettre d’information', prix: 60, icon: 'mail', court: 'Un formulaire d’inscription et un modèle de lettre prêt à envoyer.', desc: 'Un formulaire d’inscription sur votre site et un modèle de lettre prêt à l’emploi, pour garder le contact avec vos clients.' },
  // --- réseaux sociaux
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'instagram', groupe: 'reseaux', name: 'Votre Instagram en direct sur le site', prix: 50, icon: 'camera', badge: 'Nouveau', court: 'Vos publications Instagram s’affichent seules sur votre site.', desc: 'Vos dernières publications Instagram s’affichent sur votre site et se mettent à jour toutes seules, dès que vous publiez.' },
  // --- langues
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'traduction', groupe: 'langue', name: 'Traduction du site en anglais', prix: 100, icon: 'languages', court: 'Votre site en anglais, relu à la main, avec un bouton de langue.', desc: 'Chaque page existe aussi en anglais, relue à la main, avec un bouton pour changer de langue. Utile pour vos visiteurs étrangers et pour Google.' },
  // --- pour les boutiques
  { retire: true /* remplacé par les emplacements d'articles (creation.boutiqueSlot) */, id: 'produits', groupe: 'boutique', types: ['boutique'], packs: [5, 10, 20], unite: 'produit', name: 'Produits en plus pour votre boutique', prix: 5, icon: 'shopping-bag', court: '', desc: '' },
  // --- au quotidien
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'page', groupe: 'quotidien', name: 'Une page en plus', prix: creation.pagePlus, icon: 'file-text', court: 'Une nouvelle page sur votre site, avec vos textes et vos photos.', desc: 'Une nouvelle page sur votre site, après sa mise en ligne. Je la prépare avec vos textes et vos photos, puis je la publie.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'photos', groupe: 'quotidien', name: 'Vos photos retouchées et mises en ligne', prix: 25, icon: 'image-plus', court: 'Vos photos retouchées, allégées et mises en ligne (jusqu’à 20).', desc: 'Vous m’envoyez vos photos (jusqu’à 20). Je les retouche, je les allège pour que le site reste rapide, et je les mets en ligne aux bons endroits.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'reprise', groupe: 'quotidien', name: 'Reprise de votre ancien site', prix: 100, icon: 'refresh-cw', court: 'Textes, photos et adresses de votre ancien site repris au propre.', desc: 'Je récupère les textes, les photos et les adresses de votre ancien site, je les remets au propre, et je mets en place les redirections pour ne pas perdre Google.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'urgent', groupe: 'quotidien', name: 'Votre demande en 24 heures', prix: 5, icon: 'zap', court: 'Votre demande de modification passe en premier et part en 24 h.', desc: 'Votre demande passe avant les autres et elle est faite en 24 heures, du lundi au vendredi.' },
  { retire: true /* offre finale du 19 novembre 2026 */, id: 'point', groupe: 'quotidien', name: 'Un point de 30 minutes ensemble', prix: 15, icon: 'phone', court: '30 minutes au téléphone ou en visio, pour faire le tour de votre site.', desc: 'Au téléphone ou en visio : on fait le tour de votre site, de vos résultats et de vos idées.' },
  // Sur devis : pas de prix affiché, pas de paiement à la commande. Le client décrit son besoin, Alex répond avec un prix (devis: true).
  { id: 'anglais', devis: true, groupe: 'langue', name: 'Traduction anglaise', prix: 0, icon: 'languages', court: 'Votre site aussi en anglais, avec un bouton pour changer de langue.', desc: 'Votre site existe aussi en anglais, avec un bouton pour changer de langue. Le prix dépend du nombre de pages : vous demandez un devis, gratuit et sans engagement.' },
  { id: 'specifique', devis: true, groupe: 'mesure', name: 'Fonctionnalité spécifique', prix: 0, icon: 'wrench', court: 'Un besoin particulier ? Dites-nous lequel, on vous répond avec un prix.', desc: 'Prise de rendez-vous, galerie, espace réservé, autre chose : décrivez votre besoin, et vous recevez un devis, gratuit et sans engagement.' },
];
// Les familles d'extras, dans l'ordre où elles s'affichent (page Tarifs et espace client)
const extrasGroupes = [
  { id: 'trouve', nom: 'Être trouvé sur Google', icon: 'search-check' },
  { id: 'contact', nom: 'Recevoir plus de contacts', icon: 'message-circle' },
  { id: 'reseaux', nom: 'Réseaux sociaux', icon: 'camera' },
  { id: 'langue', nom: 'Langues', icon: 'languages' },
  { id: 'quotidien', nom: 'Au quotidien', icon: 'wrench' },
  { id: 'boutique', nom: 'Pour les boutiques', icon: 'shopping-bag' },
  { id: 'mesure', nom: 'Sur mesure', icon: 'wrench' },
];
// Boost : l'ancien nom de l'intervention d'Alex en plus (gardé pour l'extension WordPress et l'espace client).
const boost = { prix: aLaDemande[0].prix };
// ---------------------------------------------------------------- sites réalisés (page « Ils nous ont fait confiance »)
// Uniquement de vrais clients, avec leur accord. desc : une phrase factuelle, pas d'avis inventé.
// type : le type de site de la grille (types plus haut), pour estimer son prix au tarif actuel (page Réalisations).
// optionsCreation : les options payées une fois qu'il a (ids de options), comptées dans l'estimation.
// seo : débuts de chemin des pages faites pour Google (conseils, lexique, pages par ville…). Elles sont comprises :
// elles ne comptent pas comme des pages en plus dans l'estimation (scripts/compter-pages.js les compte).
const clients = [
  { nom: 'Flore et Chenilles', domaine: 'floreetchenilles.fr', url: 'https://www.floreetchenilles.fr/', sitemap: 'https://www.floreetchenilles.fr/sitemap_index.xml', forfait: 'base', packsSeo: 2, type: 'boutique', optionsCreation: [], seo: ['/fleurs/', '/occasions/', '/conseils/', '/lexique/', '/guide/', '/fleurs-eternelles-ardennes/', '/livraison-fleurs-signy-l-abbaye/', '/artisan-fleuriste-signy-l-abbaye/'], genre: 'Boutique en ligne', icon: 'shopping-bag', color: 'mint', desc: 'Des fleurs éternelles en fil chenille, faites main à Signy-l’Abbaye, dans les Ardennes. La boutique ouvre très bientôt.' },
  { nom: 'Dodedo', domaine: 'dodedo.fr', url: 'https://dodedo.fr/', sitemap: 'https://www.dodedo.fr/sitemap.xml', forfait: 'base', packsSeo: 1, type: 'une-page', optionsCreation: [], seo: ['/comprendre/', '/conseils/'], genre: 'Site vitrine', icon: 'hand-heart', color: 'lilac', desc: 'Le site de Dominique Schneider, magnétiseur et barreur de feu. Une page d’accueil claire, entourée de pages de conseils pour être trouvé sur Google.' },
  { nom: 'Les Minis Monstres', domaine: 'les-minis-monstres.fr', url: '/', sitemap: 'https://www.les-minis-monstres.fr/wp-sitemap.xml', genre: 'Notre propre site', icon: 'sparkles', color: 'lilac', desc: 'Notre site à nous : on se fait confiance, alors on se met dedans aussi.' },
  { nom: 'Les Notes du Temps', domaine: 'lesnotesdutemps.fr', url: 'https://www.lesnotesdutemps.fr/', sitemap: 'https://www.lesnotesdutemps.fr/sitemap.xml', forfait: 'base', genre: 'Site vitrine', icon: 'music', color: 'peach', enCreation: true, desc: 'Bientôt en ligne. Je vous le montre dès qu’il est prêt.' },
  { nom: 'ALED08', domaine: 'aled08.fr', url: 'https://www.aled08.fr/', forfait: '', genre: 'Site vitrine', icon: 'zap', color: 'butter', enCreation: true, desc: 'Le site d’un électricien dans les Ardennes. Il sera en ligne très bientôt.' },
];

module.exports = { INCLUS_INFO, typesOfferts, offreSite, modules, fractionne, optimisation, clients, site, sections, types, forfaits, forfaitsAnciens, extrasGroupes, annuel, lissage, delais, options, fidelite, paiement, boost, aLaDemande, jetonsLia, creation, marche, bande, enService, limites, evenement, creationSeule, revisionsNote, phrase };
