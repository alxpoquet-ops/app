// ============================================================================
//  Les Minis Monstres : configuration centrale du site (identité, rubriques, l'offre unique :
//  création à 500 €, abonnement à 10 € par mois, options et extras, Jetons Cerise,
//  fidélité, paiement). Tous les prix du site viennent d'ici : le configurateur, la page
//  /commander/, les données structurées et l'extension WordPress (data.json)
//  se mettent à jour au prochain build.
//  ⚠️  Les valeurs marquées « À REMPLACER » doivent être complétées avant la
//      mise en ligne (le build affiche un avertissement tant qu'elles restent).
// ============================================================================

const site = {
  // Domaine définitif (sans slash final). Sert aux balises canonical, au sitemap, à l'Open Graph.
  url: 'https://www.aled08.fr',
  name: 'Les Minis Monstres',
  baseline: 'Sites internet et SEO', // n'est plus affiché sous le logo
  legalName: 'Les Minis Monstres, nom commercial d’Alexandre Poquet EI', // raison sociale / nom commercial
  // Le jour où le domaine les-minis-monstres.com est réservé et relié : changer url ci-dessus et rediriger aled08.fr.
  futurDomaine: 'les-minis-monstres.com',
  owner: 'Alexandre Poquet',

  // Aucune coordonnée personnelle affichée : on écrit par le formulaire de contact (/contact/).
  // Quand une adresse de support existe (ex. support@les-minis-monstres.com), la mettre ici : elle s'affichera.
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
  seo: { path: '/referencement-seo/', label: 'SEO', color: 'butter', icon: 'search-check' },
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
const creation = { prix: 500, pages: 15, pagePlus: 10, pagesPlusMax: 0, boutique: 200, exemplePages: 8 };
// Offre événement : un code donné sur une foire, un marché, un salon ou un événement professionnel.
// remise : en %, sur la création du site (site et options payés une fois). Les codes valables se règlent dans
// l'extension WordPress (Réglages, « Codes événement ») : le serveur vérifie le code et recalcule le prix.
const evenement = { remise: 20, lieux: ['une foire', 'un marché', 'un salon', 'un événement professionnel'] };
// Repères du marché pour la page Tarifs : prix publics relevés en France en novembre 2026 pour un site fait
// par un indépendant (sources dans docs/prix-et-ia-2026.md). À relire une fois par an.
// vitrine : site vitrine d'environ cinq pages. boutique : boutique en ligne simple. entretien : maintenance par mois.
// bas : les offres à bas prix qui existent aussi (plus affichées sur le site depuis novembre 2026, gardées pour mémoire).
// Repères de marché pour comparer à prestation égale : un site vitrine de 15 pages (autant que chez nous) AVEC
// référencement (SEO), en France, en 2026. Indépendant : 1 500 à 5 000 € HT pour 10 pages selon les sources, plus
// 60 à 200 € par page de texte écrit pour Google (900 à 3 000 € pour 15 pages) : on retient 2 500 à 4 000 €.
// Agence : 3 000 à 12 000 € pour 5 à 10 pages, 5 500 à 8 000 € pour 15 à 25 pages, 150 à 400 € la page rédigée pour
// Google : on retient 4 000 à 10 000 €. Sources consultées en novembre 2026 (guides de prix publiés par des prestataires).
const marche = { pagesCompare: 15, agenceMin: 4000, agenceMax: 10000, vitrineMin: 2500, vitrineMax: 4000, boutiqueMin: 2000, boutiqueMax: 6000, entretienMin: 60, entretienMax: 200, basMin: 400, basMax: 1300, fois: '4 à 5' };

// ---------------------------------------------------------------- types de site (même prix, sauf la boutique)
const types = [
  {
    id: 'une-page',
    name: 'Une page',
    label: 'Site une page',
    color: 'sky',
    icon: 'layout-template',
    price: creation.prix,
    delai: '3 à 5 jours',
    pitch: 'Une seule page qu’on fait défiler, comme une grande carte de visite : qui vous êtes, ce que vous faites, vos horaires, comment vous joindre.',
    qui: 'Pour démarrer, ou pour être simplement trouvé et joignable.',
    ideal: 'idéal pour démarrer, une carte de visite sur internet',
    pourQui: 'Pour vous si vous démarrez, si votre activité se présente en quelques lignes, ou si vous voulez surtout être trouvé et joignable. Par exemple : artisan, indépendant, association, événement.',
    inclus: ['Une page en plusieurs parties', 'Formulaire de contact', 'Adapté à tous les écrans', 'Bases du SEO'],
  },
  {
    id: 'vitrine',
    name: 'Site vitrine',
    label: 'Site vitrine',
    color: 'butter',
    icon: 'layout-grid',
    price: creation.prix,
    delai: '1 à 2 semaines',
    pitch: 'Plusieurs pages avec un menu : l’accueil, vos services, vos tarifs, qui vous êtes, le contact.',
    qui: 'Pour présenter plusieurs services. Le meilleur choix pour sortir sur Google.',
    ideal: 'idéal pour le référencement, avec une page par sujet',
    pourQui: 'Pour vous si vous proposez plusieurs services, ou si vous voulez bien sortir sur Google. Chaque page parle d’un sujet précis, et Google peut montrer chacune dans ses résultats : c’est le meilleur choix pour le référencement. Par exemple : entreprise, commerce, profession libérale.',
    inclus: [`Jusqu’à ${creation.pages} pages`, 'Menu clair sur téléphone', 'Formulaire de contact', 'SEO de chaque page'],
  },
  {
    id: 'boutique',
    name: 'Boutique en ligne',
    label: 'Boutique en ligne',
    color: 'pink',
    icon: 'shopping-bag',
    price: creation.prix + creation.boutique,
    supplement: creation.boutique, // l'option « boutique en ligne », ajoutée au prix unique
    info: 'Une page boutique avec vos produits, leurs photos et leurs prix, un panier et le paiement par carte. Vous recevez un e-mail à chaque commande et vous suivez vos ventes dans votre espace.',
    delai: '2 à 3 semaines',
    pitch: 'Un magasin sur internet : vos clients choisissent vos produits, paient par carte sur le site, et vous recevez la commande.',
    qui: 'Pour vendre vos produits sur internet, même quand votre magasin est fermé.',
    ideal: 'idéal pour vendre, avec le paiement par carte',
    pourQui: 'Pour vous si vous voulez vendre vos produits en ligne, même quand votre boutique est fermée. Par exemple : créateur, commerçant, producteur.',
    inclus: ['Catalogue produits', 'Panier', 'Paiement en ligne', 'Gestion des commandes', 'E-mails automatiques'],
  },
];

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
// l'espace client. Cerise (la bulle) et Bricou (les modifications) restent compris, sans énergie : les modifications
// sont sans limite, la bulle garde limites.bulleJour messages par jour.
// Pour tout remettre : outils et energie à true (les textes, l'onglet Outils et la page /outils/ reviennent).
const enService = { outils: false, energie: false };
const limites = { bulleJour: 40 }; // messages par jour dans la bulle de Cerise (les modifications sont sans limite)
const enPause = !enService.energie;
// Un seul abonnement au mois, sans engagement : id 'base' = Tranquillité, qui comprend tout (dont une page SEO par semaine).
// illimite : modifications incluses, sans quota (quota et periode ne servent plus que pour les anciens comptes de l'extension).
// delai : délai des modifications. priorite : passe avant les autres. pageSeoSemaine : une page pour Google en plus chaque semaine.
const forfaits = [
  {
    id: 'base',
    name: 'Tranquillité',
    color: 'mint',
    month: 10,
    quota: 1,
    periode: 'trimestre',
    illimite: true,
    pageSeoSemaine: true,
    delaiMoyen: true, // « 12 à 24 heures en moyenne »
    jetons: energieMois, // énergie (en pause)
    partage: false,
    delai: '12 à 24 heures',
    bulle: 'Votre site entretenu, à jour, et qui grandit chaque semaine',
    modifs: 'modifications incluses et une page SEO chaque semaine',
    conseil: false,
    tagline: 'Sans engagement',
    pitch: 'Votre site reste en ligne, protégé et à jour. Vous demandez une modification, on s’en occupe, et une nouvelle page pour Google s’ajoute chaque semaine.',
    main: ['Hébergement', 'Nom de domaine', 'Sauvegardes', 'Sécurité', 'Surveillance', 'Maintenance', 'Modifications incluses, en 12 à 24 h en moyenne', 'Une page SEO en plus chaque semaine'],
    details: ['Hébergement : l’endroit où votre site reste accessible 24 h/24', 'Nom de domaine : l’adresse de votre site, à votre nom', 'Sauvegardes : une copie de sécurité de votre site', 'Sécurité : le petit cadenas HTTPS et les protections à jour', 'Surveillance : on vérifie jour et nuit que votre site répond', 'Maintenance : les vérifications techniques qui gardent votre site en forme', 'Modifications incluses, en ligne en 12 à 24 heures en moyenne', 'Une page SEO en plus chaque semaine, pour être trouvé sur plus de recherches Google'],
    features: ['Hébergement', 'Nom de domaine', 'Sauvegardes', 'Sécurité', 'Surveillance', 'Maintenance', 'Modifications incluses', 'Une page SEO chaque semaine'],
  },
  // La formule Évolution (20 €/mois) est retirée le 17 novembre 2026 : un seul abonnement, qui comprend tout.
  // Un ancien client « evolution » est lu comme cet abonnement (l'extension retombe sur le premier forfait).
];
// Création seule : pour un client qui a déjà son nom de domaine et son hébergement. Il paie seulement la création,
// sans formule au mois, et reçoit le code de son site (fichiers et sauvegarde), prêt à installer chez son hébergeur.
// Pas de modifications ni de maintenance incluses : il peut prendre une formule plus tard. id 'sans' dans la commande.
const creationSeule = {
  id: 'sans',
  name: 'Création seule',
  month: 0,
  color: 'peach',
  court: 'J’ai déjà mon nom de domaine et mon hébergement : je reçois le code de mon site, prêt à installer.',
  main: ['Votre site, payé une seule fois', 'Le code de votre site, prêt à installer', 'Vous l’installez vous-même, ou avec votre hébergeur', 'Sans maintenance ni modifications incluses'],
};
const annuel = { moisOfferts: 2 };
// Prix du site payable en 6 ou 12 fois sans frais (engagement le temps du paiement ; sinon, aucun engagement).
// Le paiement en plusieurs fois se fait au mois : l'abonnement passe alors au mois.
const lissage = { durees: [6, 12] };
// Délai de réponse aux demandes de modification (le même pour tous).
const delais = { reponse: '72 heures', titan: '72 heures', urgent: '24 heures', evolution: '12 à 24 heures' };

// ---------------------------------------------------------------- options et extras
// quand : 'creation' = payé une fois, à la création du site ; 'mois' = extra de l'abonnement, activable et désactivable.
// price : { once } pour un paiement unique, { month } pour un paiement mensuel.
// types : réservé à ces types de site (ex. ['boutique']) ; absent = tous les sites.
// court : la version en une ligne, pour le configurateur. desc : la description complète, pour la page Tarifs.
// info : ce que l'option ajoute, montré par le petit « i », avec sa capture d'exemple (src/assets/img/options/<id>.webp,
// fabriquée par scripts/captures-options.js).
// 17 novembre 2026 : deux options seulement, payées une fois. Le Pack SEO ici, et la boutique en ligne (creation.boutique,
// le type de site « boutique »). Les anciennes options et extras restent listés avec retire: true, pour les clients qui
// les ont déjà (l'extension les montre encore dans leur compte), mais ne sont plus proposés.
const options = [
  { id: 'packseo', quand: 'espace' /* plus à la commande : se commande plus tard, depuis l'espace client (novembre 2026) */, group: 'site', name: 'Pack SEO', icon: 'search-check', price: { once: 25 }, pages: 10, court: '10 pages SEO en plus, pour être trouvé sur plus de recherches Google.', info: 'Dix pages de plus, chacune écrite pour une recherche que font vos clients sur Google : un service, une ville, une question fréquente. Plus votre site a de pages utiles, plus il a de chances d’apparaître.', desc: '10 pages SEO en plus. Chaque page répond à une recherche que font vos clients sur Google. Plus de pages utiles, plus de chances d’être trouvé.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'en', quand: 'creation', group: 'site', name: 'Traduction en anglais', icon: 'languages', price: { once: 100 }, court: 'Avec un bouton pour changer de langue.', info: 'Chaque page existe aussi en anglais, relue à la main. Un bouton en haut du site passe d’une langue à l’autre, et Google peut montrer la version anglaise aux visiteurs étrangers.', desc: 'Votre site traduit en anglais et relu, avec un bouton pour changer de langue. Pour les touristes et les clients venus d’ailleurs.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'rdv', quand: 'creation', group: 'site', name: 'Prise de rendez-vous', icon: 'calendar-check', price: { once: 100 }, court: 'Vos clients réservent un créneau en ligne.', info: 'Une page avec vos créneaux libres. Le client choisit son jour et son heure, reçoit une confirmation, et vous êtes prévenu par e-mail. Vous ouvrez et fermez les créneaux vous-même.', desc: 'Vos clients réservent un créneau sur votre site, selon vos disponibilités. Vous recevez un e-mail à chaque réservation.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'reprise', quand: 'creation', group: 'site', name: 'Reprise de votre ancien site', icon: 'refresh-cw', price: { once: 100 }, court: 'On garde vos textes, photos et adresses.', info: 'Je récupère les textes, les photos et les adresses des pages de votre ancien site, et je les remets au propre. Les anciens liens mènent au bon endroit : vous gardez votre place sur Google.', desc: 'Vos textes, vos photos et vos adresses de pages repris de l’ancien site, pour garder votre place sur Google.' },
  { id: 'pages', retire: true /* remplacée par « 10 € la page en plus » (novembre 2026) : gardée pour les anciennes commandes */, quand: 'creation', group: 'site', name: 'Cinq pages de plus', icon: 'layers', price: { once: 100 }, types: ['vitrine', 'boutique'], court: 'Cinq pages en plus des cinq comprises.', info: 'Votre site passe de cinq à dix pages : une page par service, par produit phare ou par événement. Chaque page utile est une chance de plus d’être trouvé sur Google.', desc: 'Pour un site plus grand : cinq pages en plus des cinq comprises.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'seo', quand: 'mois', group: 'site', name: 'Suivi Google', icon: 'search-check', price: { month: 10 }, court: 'Je travaille votre place sur Google, chaque mois.', info: 'Chaque mois, je suis les mots que tapent vos clients, je retouche vos pages pour les aider à monter sur Google, et vous recevez un rapport simple : votre place pour chaque mot et les visites venues de Google.', desc: 'Chaque mois, je regarde les mots que vos clients tapent, j’améliore vos pages pour Google et je vous montre où vous en êtes.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'stats', quand: 'mois', group: 'site', name: 'Chiffres détaillés', icon: 'chart-line', price: { month: 5 }, court: 'Visiteurs, provenance et ventes, heure par heure.', info: 'Le tableau de bord complet : la courbe de vos visites, les appareils, d’où viennent vos visiteurs, vos ventes, et un rapport chaque mois.', desc: 'Votre site heure par heure : visiteurs, pages vues, provenance, ventes. Et un rapport simple chaque mois.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'mail', quand: 'mois', group: 'site', name: 'Adresse e-mail pro', icon: 'at-sign', price: { month: 3 }, court: 'Une adresse comme contact@votreboite.fr.', info: 'Une vraie boîte à votre nom, comme contact@votreboite.fr, sur votre téléphone et votre ordinateur. Je la crée et je vous envoie les réglages.', desc: 'Une adresse comme contact@votreboite.fr, sur votre téléphone et votre ordinateur.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'stock', quand: 'mois', group: 'site', name: 'Gestion du stock', icon: 'warehouse', price: { month: 5 }, types: ['boutique'], court: 'Le stock se décompte à chaque vente.', info: 'Vous indiquez combien vous avez de chaque produit. Le stock baisse tout seul à chaque vente, le site affiche « Plus que 2 » quand il en reste peu, puis « Épuisé » à zéro.', desc: 'Le stock de votre commerce se décompte tout seul à chaque vente. Vous savez toujours ce qu’il reste.' },
  { retire: true /* retirée le 17 novembre 2026 : gardée pour les anciens clients */, id: 'comptes', quand: 'mois', group: 'site', name: 'Comptes clients', icon: 'users', price: { month: 5 }, types: ['boutique'], court: 'Vos clients gardent commandes, adresses et favoris.', info: 'Vos clients se créent un compte : ils retrouvent leurs commandes, leurs adresses et leurs produits favoris, et recommandent en un clic.', desc: 'Vos clients se créent un compte sur votre site : commandes passées, adresses et favoris gardés.' },
];

// ---------------------------------------------------------------- la petite bande : les automatisations d'Alex
// Alex conçoit et fait chaque site lui-même. À côté, il a programmé une petite bande de compagnons : ce sont ses
// automatisations, dessinées en petits monstres (src/lib/bestiaire.js). Chacun s'occupe d'une tâche répétitive mais
// utile, travaille en autonomie, et Alex vérifie tout ce qu'il fait. C'est ce qui permet un site 4 à 5 fois moins cher.
// Sur le site public, on ne parle ni d'IA ni de jetons : seulement de ces petits monstres. Chacun a un prénom et UN rôle :
// un seul pour la bulle (Cerise), un seul pour les modifications (Bricou), un par outil ou par option.
// option : l'option au mois qui l'ajoute à votre abonnement. compris : dans l'abonnement de base.
// outils : il aide aussi le client au quotidien, dans son espace (au service de tous).
// 17 novembre 2026 : chaque monstre a un métier clair, ses missions et sa personnalité. Sur le site, on ne parle pas d'IA :
// seulement de ces petits monstres. role : son métier. missions : ce qu'il fait pour le client. perso : son caractère.
// compris : avec toutes les formules. option : 'boutique' (il arrive avec la boutique en ligne).
// court / fait : une phrase courte et une phrase complète, reprises par les pages et les FAQ.
const bandeTout = [
  { id: 'support', nom: 'Cerise', monstre: 'lia', role: 'La secrétaire', compris: true, missions: ['Accueille vos demandes', 'Organise vos projets', 'Prépare les réponses', 'Vous accompagne pas à pas'], perso: 'Souriante et toujours là, elle n’oublie jamais personne.', court: 'Elle accueille vos demandes et vous accompagne.', fait: 'Elle accueille vos demandes, organise vos projets, prépare les réponses et vous accompagne pas à pas. C’est elle qui vous répond dans la petite bulle.' },
  { id: 'bricoleur', nom: 'Bricou', monstre: 'bricou', role: 'Le constructeur', compris: true, missions: ['Construit votre site', 'Prépare vos modifications', 'Construit vos nouvelles pages'], perso: 'Minutieux, le casque vissé sur la tête, il mesure deux fois avant de poser une brique.', court: 'Il construit votre site et prépare vos modifications.', fait: 'Il construit votre site, prépare vos modifications avec un aperçu et construit vos nouvelles pages.' },
  { id: 'ecrivain', nom: 'Plume', monstre: 'fantome', role: 'La rédactrice', compris: true, missions: ['Prépare vos contenus', 'Vous aide à écrire vos textes', 'Rend chaque phrase facile à lire'], perso: 'Rêveuse mais précise, elle cherche toujours le mot juste.', court: 'Elle prépare vos textes et les rend faciles à lire.', fait: 'Elle prépare vos contenus, vous aide à écrire vos textes et rend chaque phrase facile à lire.' },
  { id: 'organisateur', nom: 'Mochi', monstre: 'mochi', role: 'L’organisateur', compris: true, missions: ['Classe vos contenus', 'Organise vos pages', 'Garde tout bien rangé'], perso: 'Un peu maniaque, il adore quand chaque chose est à sa place.', court: 'Il classe vos contenus et garde tout bien rangé.', fait: 'Il classe vos contenus, organise vos pages et garde tout bien rangé, pour que vos visiteurs trouvent vite ce qu’ils cherchent.' },
  { id: 'gardien', nom: 'Pistache', monstre: 'dino', role: 'Le gardien', compris: true, missions: ['Fait les sauvegardes', 'Veille sur la sécurité', 'Surveille votre site jour et nuit', 'Fait la maintenance'], perso: 'Costaud et calme, il ne dort que d’un œil.', court: 'Il protège votre site, jour et nuit.', fait: 'Il fait les sauvegardes et la maintenance, veille sur la sécurité et surveille votre site jour et nuit.' },
  { id: 'observateur', nom: 'Mirette', monstre: 'gelee', role: 'L’observatrice', compris: true, missions: ['Surveille vos statistiques', 'Observe la vitesse de votre site', 'Repère ce qui peut être amélioré'], perso: 'Curieuse, elle ne quitte jamais ses jumelles.', court: 'Elle suit vos visites et repère ce qui peut être amélioré.', fait: 'Elle surveille vos statistiques, observe la vitesse de votre site et repère ce qui peut être amélioré.' },
  { id: 'etoile', nom: 'Lumi', monstre: 'etoile', role: 'L’étoile de Google', compris: true, missions: ['Prépare vos pages SEO', 'Aide Google à comprendre votre site', 'Vous rend plus facile à trouver'], perso: 'Elle brille un peu plus fort chaque fois qu’un client vous trouve.', court: 'Elle prépare vos pages pour être trouvé sur Google.', fait: 'Elle prépare vos pages SEO et aide Google à comprendre votre site, pour que vos clients vous trouvent plus facilement.' },
  { id: 'vendeur', nom: 'Champi', monstre: 'champi', role: 'Le vendeur', option: 'boutique', missions: ['Range votre catalogue', 'Suit vos commandes', 'Envoie les e-mails à vos clients'], perso: 'Toujours aimable, il connaît chaque produit par cœur.', court: 'Il tient votre boutique en ligne.', fait: 'Avec la boutique en ligne, il range votre catalogue, suit vos commandes et envoie les e-mails à vos clients.' },
];
const bande = bandeTout;

// ---------------------------------------------------------------- fidélité et paiement
const fidelite = { parrainageMois: 1, remiseSecondSite: 10 };
const paiement = { acompte: 25 }; // 25 % à la commande ; à la réception : le reste (en une fois, ou en 6 / 12 fois sans frais) et l'abonnement démarre

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
  { retire: true, id: 'urgent', name: 'Votre demande sous 24 heures', prix: 5, icon: 'zap', desc: 'Votre demande passe avant les autres et elle est traitée sous 24 heures, du lundi au vendredi.' },
  { retire: true, id: 'article', name: 'Un article écrit et publié', prix: 15, icon: 'pen-tool', desc: 'Vous donnez le sujet. Je prépare l’article, je le relis, je l’illustre et je le publie sur votre site.' },
  { retire: true, id: 'page', name: 'Une page en plus', prix: creation.pagePlus, icon: 'file-text', desc: 'Une nouvelle page sur votre site, après sa mise en ligne. Je la prépare avec vos textes et vos photos, puis je la publie.' },
  { retire: true, id: 'point', name: 'Un point de 30 minutes ensemble', prix: 15, icon: 'phone', desc: 'Au téléphone ou en visio : on fait le tour de votre site, de vos résultats et de vos idées.' },
  // Le Pack SEO ne se choisit plus à la commande : le client le prend quand il veut, depuis son espace (onglet Mes demandes)
  { id: 'packseo', name: 'Pack SEO : 10 pages pour Google', prix: 25, icon: 'search-check', desc: 'Dix pages de plus, chacune écrite pour une recherche que font vos clients sur Google : un service, une ville, une question fréquente. Lumi les prépare, je les relis, puis elles sont mises en ligne.' },
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
  { nom: 'Les Minis Monstres', domaine: 'les-minis-monstres.com', url: '/', sitemap: 'https://www.aled08.fr/wp-sitemap.xml' /* à passer sur https://www.les-minis-monstres.com/wp-sitemap.xml au changement de domaine */, genre: 'Notre propre site', icon: 'sparkles', color: 'lilac', desc: 'Notre site à nous : on se fait confiance, alors on se met dedans aussi. En français et en anglais.' },
  { nom: 'Les Notes du Temps', domaine: 'lesnotesdutemps.fr', url: 'https://www.lesnotesdutemps.fr/', sitemap: 'https://www.lesnotesdutemps.fr/sitemap.xml', forfait: 'base', genre: 'Site une page', icon: 'music', color: 'peach', enCreation: true, desc: '' },
  { nom: 'ALED08', domaine: 'aled08.fr', url: 'https://www.aled08.fr/', forfait: '', genre: 'Site vitrine', icon: 'zap', color: 'butter', enCreation: true, desc: '' },
];

module.exports = { clients, site, sections, types, forfaits, annuel, lissage, delais, options, fidelite, paiement, boost, aLaDemande, jetonsLia, creation, marche, bande, enService, limites, evenement, creationSeule };
