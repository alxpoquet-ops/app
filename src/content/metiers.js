// Pages « Votre métier » (V2) : une page par métier, à la racine du site (/<slug>/).
// Règles (scripts/check.js) : title de 65 caractères au plus, description de 120 à 160, aucun tiret long
// ni demi-cadratin, aucun point-virgule, aucun prix écrit en dur (tout vient de config.js), aucun client,
// avis ou chiffre inventé, et pas de phrase de 9 mots ou plus reprise d'une autre page.
// Offre du 19 novembre 2026 : trois sites payés une fois (config.types : Site Essentiel, Site Visibilité, Site Boutique),
// puis Autonomie (config.creationSeule, sans abonnement, export du site remis au client) ou Mini (config.forfaits[0], au mois,
// sans engagement, modifications incluses, une demande à la fois). L'abonnement est facultatif. Trois extras : la page de
// visibilité Google (payée une fois, par carte), la traduction anglaise et la fonctionnalité spécifique (sur devis).
// La petite bande (config.bande) compte six Minis Monstres.
// Ton (tour global du 19 novembre 2026) : « nous / on », Alex nommé quand c'est utile (jamais « je »), vouvoiement, « site internet »,
// « modification ». Chaque page ouvre sur la visibilité (un site rend visible, c'est notre métier) et garde l'ordre de l'offre :
// le site, puis Autonomie ou Mini, enfin les extras. Pages courtes, pensées pour le téléphone.
// options : les conseils de la page (« Ce qu’on vous conseille »). Ids acceptés : 'boutique' (le Site Boutique),
// 'base' (l'abonnement Mini), ou l'id d'un extra de config.aLaDemande encore proposé ('packseo', 'anglais', 'specifique').
// Le prix affiché vient de config.js. Chaque « pourquoi » doit coller à ce qui est conseillé.
// (Le code événement a été retiré le 17 novembre 2026 : un seul champ « Code promo » à la commande ; le parrainage est retiré.)
const { creation, forfaits, paiement, fractionne, marche, bande, evenement, types, creationSeule } = require('../config');
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500

const T = (id) => types.find((t) => t.id === id) || {};
const ESS = T('une-page'), VIS = T('vitrine'), BOU = T('boutique'); // les trois sites
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0]; // Mini, le seul abonnement, facultatif
const AUTO = creationSeule.name; // sans abonnement
const delaiModif = `jusqu’à ${mini.delai.replace(/ heures?$/, ' h')}`; // une modification peut prendre jusqu'à 48 h
const prix = eur(ESS.price); // le Site Essentiel
const prixVis = eur(VIS.price); // le Site Visibilité
const prixBoutique = mille(BOU.price); // le Site Boutique
const pagesComprises = creation.pages; // nombre maximal de pages du Site Visibilité
const EN_FOIS = `en ${fractionne.fois} fois avec ${fractionne.organismes}`; // par un organisme externe, sur la page de paiement
const marcheVitrine = `${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €`;
const remise = `${evenement.remise} %`; // le code événement, sur la création du site
// La petite bande : prénom et métier (« Cerise, la secrétaire »).
const B = (id) => bande.find((b) => b.id === id);
const qui = (id) => `${B(id).nom}, ${minus(B(id).role)}`;

const PUBLIE = '2026-11-16';

const metiers = [
  // ------------------------------------------------------------------ artisans
  {
    slug: 'site-internet-artisan',
    nom: 'Artisans',
    qui: 'Plombiers, électriciens, maçons, menuisiers, peintres, couvreurs, paysagistes',
    icon: 'hammer',
    color: 'butter',
    title: 'Site internet pour artisan : être trouvé et rassurer | Les Minis Monstres',
    description: 'Plombier, électricien, maçon, couvreur : un site internet clair pour être visible dans votre secteur, montrer vos chantiers et recevoir des demandes de devis.',
    h1: 'Site internet pour artisan : vos chantiers en vitrine, vos devis en direct',
    lead: 'Vos futurs clients tapent votre métier et leur commune sur leur téléphone, puis appellent celui qu’ils trouvent et qui leur inspire confiance. Nous créons le site internet qui vous rend visible et qui montre votre travail.',
    resume: 'Vos chantiers en photos, des devis en direct.',
    besoins: [
      { icon: 'map-pin', t: 'Être trouvé dans votre secteur', d: 'Votre métier et les communes où vous travaillez sont écrits noir sur blanc, là où Google et vos clients les cherchent.' },
      { icon: 'camera', t: 'Montrer votre travail', d: 'Des photos de chantiers, avant et après, donnent une idée juste de vos finitions.' },
      { icon: 'phone-call', t: 'Un appel en un geste', d: 'Sur téléphone, un bouton compose votre numéro, et un formulaire de devis recueille les détails du chantier.' },
      { icon: 'shield-check', t: 'Inspirer confiance', d: 'Assurance, qualifications, années de métier : le client sait à qui il ouvre sa porte.' },
    ],
    exemple: {
      client: null,
      texte: 'Nous n’avons pas encore d’artisan parmi nos réalisations. Pour vous donner une idée, voici comment nous bâtirions le site d’un couvreur : un accueil avec sa zone et son numéro, une page par prestation (toiture neuve, réparation, zinguerie, démoussage), une galerie de chantiers et un formulaire de devis.',
    },
    options: [
      { id: 'packseo', pourquoi: 'Une page de plus sur un travail précis que l’on tape sur Google, comme le démoussage d’un toit ou la pose d’une fenêtre de toit. À commander plus tard, depuis votre espace client, et à régler par carte, une seule fois.' },
    ],
    body: `## Un bon artisan que l’on ne trouve pas perd des chantiers

Le bouche-à-oreille ne suffit plus toujours. Un particulier qui a une fuite ou une façade à repeindre compare deux ou trois noms sur son téléphone. Si le vôtre n’apparaît pas, il appelle quelqu’un d’autre.

## Ce que votre client veut savoir en trente secondes

- **Ce que vous faites**, avec ses mots à lui : dépannage, rénovation, pose, entretien.
- **Où vous travaillez** : votre commune et celles d’à côté, citées en toutes lettres.
- **À quoi ressemble votre travail** : quelques photos de vrais chantiers.
- **Comment vous joindre** : un numéro qui s’appelle d’un doigt et une demande de devis en ligne.

Un site d’artisan n’a pas besoin d’être long. Il doit être clair, et à jour.

## Rassurer avant le premier appel

Faire entrer quelqu’un chez soi demande de la confiance. Montrez votre visage, vos années de métier, vos qualifications (RGE, par exemple) et votre assurance décennale si votre activité y est soumise.

Pour le dépannage, affichez votre taux horaire et vos frais de déplacement : la réglementation vous demande de toute façon de les annoncer avant de commencer.

Prenez l’habitude de photographier avant et après, même au téléphone. Trois vraies photos d’une salle de bain refaite parlent plus qu’une image de catalogue.

!> Ne publiez que des avis réels. Si vos clients sont contents, invitez-les à le dire sur votre fiche Google, et le site renvoie vers ces avis.

## Une page par prestation, pour être trouvé

Vous proposez plusieurs prestations, par exemple plomberie, chauffage et salle de bain ? Chacune mérite sa page. Celui qui cherche « installation pompe à chaleur » tombe alors sur la page qui en parle, et pas sur un texte fourre-tout.

C’est le rôle du ${VIS.name} : jusqu’à ${pagesComprises} pages, avec des pages de visibilité Google intégrées, écrites pour des recherches comme « recherche de fuite » dans votre secteur. Pour un seul métier, simple à présenter, le ${ESS.name} peut suffire. Le guide [une page ou un site vitrine](/guides/site-une-page-ou-site-vitrine/) vous aide à trancher.

Le site fait équipe avec votre [fiche Google](/guides/fiche-google-entreprise/) : la fiche vous place sur la carte, le site achève de convaincre.

## Vous êtes sur les chantiers, on s’occupe du site

Vous n’avez ni le temps ni l’envie de gérer un site le soir, et c’est normal. Nous écrivons les textes avec vous après un court échange, puis nous mettons tout en ligne.

Un tarif change, une nouvelle photo arrive ? Avec le forfait ${mini.name}, envoyez le changement depuis votre téléphone, dans votre espace client. ${qui('constructeur')} de notre petite bande, clarifie votre demande avec vous, puis l’envoie à Alex, qui fait la modification. Elle est incluse.

## Combien ça coûte

- **Le site, payé une fois** : ${prix} € pour le ${ESS.name}, ${prixVis} € pour le ${VIS.name}.
- **Ensuite** : le forfait ${AUTO}, sans abonnement, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois et sans engagement.

Vous payez le site à la commande, d’un coup ou ${EN_FOIS}, au choix sur la page de paiement.

Pour comparer, un site vitrine de ${marche.pagesCompare} pages confié à un indépendant se paie en général entre ${marcheVitrine}, d’après des fourchettes publiées par des prestataires (les [sources](/pourquoi-moins-cher/) sont citées). Tout est détaillé sur la page [tarifs](/tarifs/).`,
    faq: [
      { q: 'Combien coûte un site internet pour un artisan ?', a: `${prix} € pour un ${ESS.name}, sur une seule page, ou ${prixVis} € pour un ${VIS.name}, jusqu’à ${pagesComprises} pages. Ensuite, c’est le forfait ${AUTO}, sans rien payer chaque mois, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois.` },
      { q: 'Je travaille sur une grande zone, comment être trouvé partout ?', a: 'Citez les principales communes où vous travaillez, sans en aligner des dizaines. Une liste honnête sur le site, et une zone bien réglée sur votre fiche Google, valent mieux qu’une page par village.' },
      { q: 'Je n’ai presque pas de photos de chantier, est-ce un problème ?', a: 'Non. On démarre avec ce que vous avez, même deux clichés pris au téléphone. Le site s’étoffe ensuite chantier après chantier.' },
      { q: 'J’ai déjà un vieux site, faut-il tout recommencer ?', a: 'Le nouveau site est fait à neuf, mais vos textes et vos photos servent de base. Si vous avez déjà un nom de domaine, vous le gardez, et nous le relions au nouveau site.' },
    ],
    voir: ['/guides/fiche-google-entreprise/', '/guides/site-une-page-ou-site-vitrine/', '/etre-visible-sur-google/'],
  },

  // ------------------------------------------------------------------ bien-être et thérapeutes
  {
    slug: 'site-internet-therapeute',
    nom: 'Bien-être et thérapeutes',
    qui: 'Sophrologues, naturopathes, magnétiseurs, réflexologues, praticiens bien-être',
    icon: 'hand-heart',
    color: 'lilac',
    title: 'Site internet pour thérapeute et sophrologue | Les Minis Monstres',
    description: 'Sophrologue, naturopathe, magnétiseur, réflexologue : un site internet sobre qui vous rend visible et présente vos séances, avec des mots justes et prudents.',
    h1: 'Site internet pour thérapeute : donner envie d’oser le premier rendez-vous',
    lead: 'Avant de réserver, on veut savoir à qui l’on va parler et comment se passe une séance. Encore faut-il vous trouver. Nous créons un site internet sobre et chaleureux, qui vous rend visible avec des mots justes et prudents.',
    resume: 'Présenter votre pratique avec justesse et prudence.',
    besoins: [
      { icon: 'smile', t: 'Un visage avant la séance', d: 'Votre photo, votre parcours et votre façon d’accueillir aident la personne à franchir le pas.' },
      { icon: 'book-open', t: 'Une séance expliquée simplement', d: 'Durée, déroulé, tarif : celui qui n’a jamais essayé sait à quoi s’attendre en arrivant.' },
      { icon: 'calendar-check', t: 'Réserver sans téléphoner', d: 'Certaines personnes n’osent pas appeler. Un formulaire, ou un lien vers votre agenda en ligne, leur laisse le temps de se décider.' },
      { icon: 'search', t: 'Être trouvé près de chez vous', d: 'Les mots que tapent les gens, comme « sophrologue » ou « réflexologie » avec leur ville, figurent sur vos pages.' },
    ],
    exemple: {
      client: 'dodedo',
      texte: 'Une page principale pour présenter la pratique et donner envie de prendre contact, puis des pages de conseils qui répondent chacune à une question précise que l’on tape sur Google. C’est un bon modèle pour un praticien qui veut rester simple.',
    },
    options: [
      { id: 'packseo', pourquoi: 'Une page de plus sur une question que l’on se pose avant de consulter pour la première fois. Elle se commande après coup, dans votre espace client, et se paie une fois.' },
    ],
    body: `## On vous cherche avant d’oser vous appeler

Les personnes qui cherchent un sophrologue, un naturopathe ou un magnétiseur hésitent souvent longtemps. Elles tapent votre nom, ou votre pratique et leur ville. Votre site internet les accueille avant vous. S’il n’existe pas, elles ne vous voient pas.

## Ce qui aide à franchir le pas

- **Votre présence** : une photo naturelle, votre prénom, quelques lignes sur votre parcours et vos formations.
- **Le déroulé d’une séance** : sa durée, ce qui s’y passe, son prix.
- **Un contact sans pression** : un formulaire, un bouton d’appel, ou un lien vers l’outil de réservation que vous utilisez déjà.
- **Le lieu** : un cabinet, votre domicile, ou à distance. Un mot sur le stationnement évite une arrivée stressée.

## Des mots justes, et prudents

Dans votre domaine, un site honnête rassure bien plus qu’un site qui promet monts et merveilles.

!> Ne promettez jamais de guérir, et ne laissez pas croire que vos séances remplacent un médecin ou un traitement. Écrivez plutôt que vous accompagnez en complément d’un suivi médical, jamais à sa place.

Voici les repères que nous appliquons en écrivant vos textes avec vous :

- Parlez de **détente, d’accompagnement, de mieux-être**, plutôt que de soin ou de résultat.
- Évitez le vocabulaire médical : pas de « patients », pas de « diagnostic », pas de liste de maladies.
- Utilisez le nom exact de votre formation. Certains titres sont protégés par la loi, comme celui de psychothérapeute.
- Écartez les témoignages du genre « j’ai été guéri ». Un avis réel qui raconte l’accueil suffit largement.

## Une page, ou une page par pratique

Pour une seule pratique, une page bien construite fait l’affaire. Avec plusieurs pratiques, chacune peut avoir la sienne. Quelqu’un qui tape « réflexologie plantaire » et le nom de sa ville tombe alors sur la page qui en parle vraiment.

Les pages de conseils sont une autre piste : comment se passe une première séance, trois exercices de respiration à faire chez soi. Chacune répond à une vraie question et ouvre une porte de plus vers vous. Ce sont des pages de visibilité Google. Le ${VIS.name} en contient déjà, et d’autres se commandent à la carte.

C’est le choix fait pour le site d’un magnétiseur, à découvrir parmi nos [réalisations](/realisations/).

## Vous accompagnez, on s’occupe du site

Vous n’avez pas à écrire seul. Racontez-nous votre pratique avec vos mots, au téléphone ou par écrit. ${qui('ecrivain')} de notre petite bande, met vos notes en forme.

Alex relit ensuite chaque phrase avec vous, surtout les plus délicates. Rien ne part en ligne sans votre accord.

## Le prix

- **Le site** : le ${ESS.name}, à ${prix} €, pour une seule page. Le ${VIS.name}, à ${prixVis} €, pour une page par pratique, avec ${pagesComprises} pages au plus.
- **Ensuite** : le forfait ${AUTO} si vous gérez tout seul, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois et sans engagement.

Avec le forfait ${mini.name}, vos horaires ou vos tarifs bougent ? Vous le demandez, et c’est fait pour vous. Vous avez déjà un agenda en ligne ? Un bouton du site y mène, sans rien payer de plus. Les deux formules sont présentées sur la page [tarifs](/tarifs/).`,
    faq: [
      { q: 'Ai-je le droit de parler des bienfaits de ma pratique ?', a: 'Oui, avec mesure. Décrivez ce que la personne peut ressentir, la détente, un moment pour soi, sans annoncer de résultat sur une maladie. Si une phrase vous fait douter, nous vous proposons une version plus prudente.' },
      { q: 'Dois-je afficher le prix de mes séances ?', a: 'Nous vous le conseillons. Quelqu’un qui hésite déjà n’osera pas écrire pour demander combien ça coûte. Le prix et la durée, bien visibles, enlèvent ce frein.' },
      { q: 'Je reçois chez moi et je ne veux pas montrer mon adresse, comment faire ?', a: 'Le site peut afficher seulement votre commune et votre secteur. Vous donnez l’adresse exacte au moment de confirmer le rendez-vous.' },
      { q: 'Magnétiseur ou barreur de feu, ma pratique a-t-elle sa place sur internet ?', a: 'Oui. Beaucoup de gens vous découvrent par le bouche-à-oreille, puis cherchent votre nom en ligne avant d’appeler. Une page claire leur permet de vous trouver et de vous joindre.' },
    ],
    voir: ['/realisations/', '/guides/fiche-google-entreprise/', '/referencement-seo/'],
  },

  // ------------------------------------------------------------------ créateurs et artistes
  {
    slug: 'site-internet-createur-artiste',
    nom: 'Créateurs et artistes',
    qui: 'Créateurs, artisans d’art, artistes, photographes, illustrateurs',
    icon: 'palette',
    color: 'pink',
    title: 'Site pour créateur ou artiste : galerie et boutique | Les Minis Monstres',
    description: 'Créateur, artiste, photographe, illustrateur : un site internet qui rend votre travail visible, avec une galerie soignée et, si vous le voulez, une boutique.',
    h1: 'Site internet pour créateur et artiste : montrer votre travail, et le vendre',
    lead: 'Vos créations méritent mieux qu’un fil de publications qui défile puis disparaît. Nous créons un site internet à votre image, où votre travail reste visible : une galerie soignée et, si vous le voulez, une boutique.',
    resume: 'Galerie, boutique et commandes, à votre image.',
    besoins: [
      { icon: 'image', t: 'Une galerie qui vous met en valeur', d: 'Grandes photos, fond sobre, classement par série ou par collection : votre travail passe avant la mise en page.' },
      { icon: 'shopping-bag', t: 'Vendre en direct', d: 'Vos clients achètent chez vous, à votre nom, et seul le service de paiement prend une petite part.' },
      { icon: 'pen-tool', t: 'Raconter votre démarche', d: 'Votre atelier, vos matières, votre façon de faire : c’est souvent ce qui décide un acheteur.' },
      { icon: 'send', t: 'Recevoir des demandes sur mesure', d: 'Un formulaire dédié recueille les commandes personnalisées, les propositions d’exposition ou de collaboration.' },
    ],
    exemple: {
      client: 'flore',
      texte: 'Ici, tout est fait main, pièce par pièce. Le site laisse toute la place aux créations, et la boutique en ligne, qui ouvre très bientôt, permettra de les commander sans passer par l’atelier.',
    },
    options: [
      { id: 'boutique', pourquoi: `Avec le ${BOU.name}, vos pièces se choisissent, se paient en ligne et partent vers leur acheteur, même quand l’atelier est fermé.` },
      { id: 'packseo', pourquoi: 'Une page de plus sur une technique ou une matière, là où les amateurs commencent leurs recherches. Vous la commandez une fois le site lancé, et vous la payez en une fois.' },
    ],
    body: `## Un atelier que l’on voit de partout

Sur un salon, on voit votre travail un week-end. Sur un réseau social, une publication disparaît en deux jours. Un site internet à votre nom garde vos créations visibles toute l’année, pour ceux qui vous cherchent comme pour ceux qui vous découvrent.

## Votre travail d’abord

Celui qui arrive chez vous veut voir. La mise en page s’efface donc derrière vos images : de grandes photos, un fond calme, un classement simple par série ou par technique.

Chaque pièce peut avoir sa fiche, avec un titre, ses dimensions, sa matière. Ces mots renseignent l’acheteur, et ils aident Google à comprendre ce que vous faites. Un « vase en grès émaillé fait main » se trouve bien plus facilement qu’une « création numéro 12 ».

Pas besoin d’un studio : une grande fenêtre, un fond uni et un téléphone récent suffisent souvent. Montrez la pièce entière, un détail de la matière, puis la pièce en situation.

## Raconter qui vous êtes

On achète une pièce d’artisan d’art aussi pour la personne qui l’a faite. Parlez de votre atelier, de vos matières, de ce qui vous inspire. Une photo de vos mains au travail touche souvent plus qu’un portrait posé.

Photographes et illustrateurs, dites aussi ce que vous proposez : reportages, portraits, tirages, illustrations. Précisez comment vos images peuvent être utilisées.

## Une galerie, ou une galerie et une boutique

- **La galerie seule**, si vous vendez à l’atelier, sur les salons ou sur commande. Un formulaire reçoit les demandes.
- **La galerie et la boutique**, si vous voulez vendre en ligne. Vos clients choisissent, paient par carte, et vous recevez la commande par e-mail.

Avec la boutique, vous gérez votre catalogue vous-même, sans limite de pièces. ${qui('organisateur')} de notre petite bande, range vos produits et vos commandes.

!> Une pièce faite sur mesure ou personnalisée à la demande du client échappe au droit de rétractation de 14 jours. Pour vos pièces déjà prêtes, ce droit s’applique. Vos conditions de vente doivent le dire clairement.

Le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/) détaille chaque étape, de la photo jusqu’au colis.

## Vous créez, on s’occupe du reste

Vous nous envoyez vos photos et quelques notes sur chaque pièce. La petite bande prépare les fiches. Alex reprend ensuite chaque texte pour qu’il sonne comme vous, et vérifie chaque page avant la mise en ligne.

## Le prix

- **Le site, payé une fois** : ${prixVis} € le ${VIS.name} pour la galerie, ${prixBoutique} € le ${BOU.name} pour vendre en ligne.
- **Ensuite** : le forfait ${AUTO} ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois, sans engagement.

Le site se règle en commandant, en une seule fois ou ${EN_FOIS}. Une nouvelle collection à présenter ? Avec le forfait ${mini.name}, c’est une modification incluse.`,
    faq: [
      { q: 'Faut-il un statut pour vendre ses créations en ligne ?', a: 'Oui, dès que vous vendez de façon régulière. La micro-entreprise est la solution la plus courante pour démarrer. Les artistes auteurs ont un régime à part : renseignez-vous auprès de l’Urssaf avant d’ouvrir la boutique.' },
      { q: 'Mes photos sont-elles protégées une fois en ligne ?', a: 'Vos œuvres et vos photos restent à vous : le droit d’auteur s’applique sans aucune démarche. Nous publions des images assez grandes pour être belles à l’écran, sans mettre en ligne vos fichiers en pleine qualité.' },
      { q: 'Je vends déjà sur une place de marché, un site est-il utile ?', a: 'Oui, les deux se complètent. La place de marché amène du passage. Votre site, lui, porte votre nom, sans concurrent affiché à côté.' },
      { q: 'Combien coûte un site avec boutique pour un créateur ?', a: `Le ${BOU.name} coûte ${prixBoutique} €, payés une fois. Il comprend le site, le panier, le paiement en ligne sécurisé et le suivi des commandes. Vous ajoutez vos pièces vous-même, autant que vous voulez.` },
    ],
    voir: ['/guides/creer-boutique-en-ligne/', '/realisations/', '/tarifs/'],
  },

  // ------------------------------------------------------------------ hébergements touristiques
  {
    slug: 'site-internet-gite-chambre-hotes',
    nom: 'Hébergements touristiques',
    qui: 'Gîtes, chambres d’hôtes, locations de vacances',
    icon: 'house',
    color: 'sky',
    title: 'Site internet pour gîte et chambre d’hôtes | Les Minis Monstres',
    description: 'Gîte, chambre d’hôtes, location de vacances : un site internet qui vous rend visible, avec vos photos, vos tarifs et l’accès, pour des réservations en direct.',
    h1: 'Site internet pour gîte et chambre d’hôtes : vos réservations en direct',
    lead: 'Beaucoup de voyageurs cherchent le nom d’un gîte repéré ailleurs avant de réserver. Nous créons le site internet où ils vous trouvent : de belles photos, des tarifs clairs, l’accès, et une demande de séjour qui arrive chez vous, sans commission.',
    resume: 'Réservations en direct, photos, accès et environs.',
    besoins: [
      { icon: 'calendar-days', t: 'Réserver en direct', d: 'La demande de séjour arrive dans votre boîte mail, sans commission à reverser.' },
      { icon: 'camera', t: 'Des photos qui donnent envie', d: 'Chaque chambre, la cuisine, le jardin, la vue : le voyageur fait la visite avant de venir.' },
      { icon: 'tree-pine', t: 'Être trouvé par les voyageurs', d: 'Des pages sur les balades et les visites du coin attirent ceux qui préparent leur séjour.' },
      { icon: 'route', t: 'Un accès sans détour', d: 'Plan, itinéraire, gare la plus proche, heure d’arrivée : vos hôtes arrivent sans vous appeler en route.' },
    ],
    exemple: {
      client: null,
      texte: 'Aucun hébergement ne figure encore parmi nos réalisations. Pour des chambres d’hôtes, nous proposerions un accueil avec la plus belle photo, une page pour les chambres et leurs tarifs, une page sur les environs, puis l’accès et une demande de séjour.',
    },
    options: [
      { id: 'anglais', pourquoi: 'Vos voyageurs étrangers lisent vos pages dans leur langue, avec un bouton pour passer du français à l’anglais. Le prix dépend du nombre de pages : demandez un devis.' },
      { id: 'packseo', pourquoi: 'Une page de plus sur une randonnée, une visite ou un village voisin, pour croiser la route des voyageurs qui préparent leurs vacances. Elle s’ajoute quand vous voulez, depuis votre espace client.' },
    ],
    body: `## Exister ailleurs que sur les plateformes

Sur une plateforme de réservation, votre gîte est une annonce parmi des centaines. Avec un site internet à votre nom, on vous trouve directement, et le voyageur réserve chez vous.

## Ce que le voyageur regarde avant de réserver

- **Les photos**, lumineuses, pièce par pièce, avec l’extérieur et la vue.
- **La capacité et l’équipement** : chambres, lits, cuisine, connexion internet, animaux acceptés ou non.
- **Les tarifs par saison**, en précisant ce qui est compris : draps, ménage, taxe de séjour.
- **L’accès** : un plan, la route depuis la gare, les heures d’arrivée et de départ.
- **Les environs** : randonnées, visites, marchés, bonnes tables.

Pour les photos, choisissez une journée lumineuse, faites les lits et ouvrez les volets. Une photo par pièce, prise depuis la porte, montre l’espace tel qu’il est.

## Réserver en direct, sans commission

Les plateformes apportent des voyageurs, mais elles gardent une part de chaque séjour. Votre site ouvre une autre porte, pour les habitués et pour ceux à qui l’on vous a recommandé.

Le voyageur remplit une demande de séjour : ses dates, le nombre de personnes, un message. Elle arrive dans votre boîte mail, et vous confirmez avec vos conditions. Si vous tenez déjà un calendrier de réservation en ligne, le site peut y mener.

> Glissez l’adresse de votre site dans votre livret d’accueil. Vos hôtes contents sauront où vous retrouver l’an prochain, sans intermédiaire.

## Être trouvé par ceux qui préparent leur séjour

Avant de choisir où dormir, beaucoup de voyageurs cherchent d’abord une région, une randonnée, un lieu à visiter.

Le ${VIS.name} compte jusqu’à ${pagesComprises} pages, dont des pages de visibilité Google : une sur la boucle de randonnée qui part de chez vous, une sur le marché du dimanche, une sur le château voisin. ${qui('observateur')} de notre petite bande, en prépare les sujets avec vous.

## Les avis et les règles à respecter

Publiez seulement de vrais commentaires de vos hôtes, avec leur accord, ou renvoyez vers votre [fiche Google](/guides/fiche-google-entreprise/). Cette fiche vous place aussi sur la carte quand quelqu’un cherche où dormir dans le coin.

!> Les locations de vacances et les chambres d’hôtes se déclarent en mairie. Si vous avez reçu un numéro d’enregistrement, il doit apparaître sur vos annonces, et votre site en est une : nous l’y ajoutons.

## Le prix, et qui s’en occupe

- **Le site** : ${prixVis} € pour le ${VIS.name}, où chaque gîte ou chaque chambre peut avoir sa page. Pour un seul hébergement, le ${ESS.name}, à ${prix} €, peut suffire.
- **Ensuite** : avec le forfait ${AUTO}, vous faites vos changements vous-même. Avec le forfait ${mini.name}, au mois et sans engagement, ils sont faits pour vous.

Un tarif d’été ou une date de fermeture ? Avec le forfait ${mini.name}, vous le demandez à ${B('constructeur').nom}, qui prépare votre demande pour Alex. Ce genre de modification est inclus.`,
    faq: [
      { q: 'Le site peut-il afficher mes disponibilités ?', a: 'Si vous tenez déjà un calendrier en ligne, le site peut y renvoyer. Sinon, la demande de séjour suffit souvent : vous gardez la main sur votre planning.' },
      { q: 'J’ai deux gîtes sur le même terrain, faut-il deux sites ?', a: 'Non. Un seul site présente les deux, chacun sur sa page, avec ses photos et ses tarifs. Vous n’avez qu’un site à faire vivre.' },
      { q: 'Combien coûte un site pour un gîte ?', a: `${prixVis} € pour un ${VIS.name}, jusqu’à ${pagesComprises} pages, ou ${prix} € pour un ${ESS.name}. Le site peut se régler ${EN_FOIS}. Le forfait ${mini.name}, à ${eur(mini.month)} € par mois, reste facultatif.` },
    ],
    voir: ['/guides/fiche-google-entreprise/', '/tarifs/', '/guides/choisir-nom-de-domaine/'],
  },

  // ------------------------------------------------------------------ commerçants
  {
    slug: 'site-internet-commercant',
    nom: 'Commerçants',
    qui: 'Boutiques, commerces de proximité, producteurs',
    icon: 'store',
    color: 'peach',
    title: 'Site internet pour commerçant et producteur local | Les Minis Monstres',
    description: 'Horaires à jour, fiche Google, vitrine de vos produits et, si vous le voulez, boutique en ligne avec retrait en magasin : un site qui rend votre commerce visible.',
    h1: 'Site internet pour commerçant : votre vitrine ouverte jour et nuit',
    lead: 'Avant de passer la porte, vos clients vérifient vos horaires et regardent ce que vous vendez, depuis leur téléphone. Nous créons le site internet qui leur répond, et qui rend votre vitrine visible bien au-delà de votre rue.',
    resume: 'Horaires, vitrine en ligne, retrait en magasin.',
    besoins: [
      { icon: 'clock', t: 'Des horaires toujours justes', d: 'Jours fériés, congés, nocturnes : le client sait si vous êtes ouvert avant de prendre sa voiture.' },
      { icon: 'map-pin', t: 'Sur la carte du quartier', d: 'Le site et votre fiche Google disent la même chose, et vous aident à apparaître quand on cherche tout près.' },
      { icon: 'tag', t: 'Votre vitrine en ligne', d: 'Vos produits, vos arrivages, votre savoir-faire : on découvre le magasin avant même d’y entrer.' },
      { icon: 'shopping-cart', t: 'Commander, puis passer prendre', d: 'Avec la boutique en ligne, le client paie sur le site et récupère sa commande au comptoir.' },
    ],
    exemple: {
      client: 'flore',
      texte: 'Une petite entreprise de village qui ouvre sa boutique en ligne : bientôt, les commandes pourront arriver à toute heure, de clients qui habitent bien plus loin que la commune.',
    },
    options: [
      { id: 'boutique', pourquoi: `Avec le ${BOU.name}, vos clients commandent le soir ou le dimanche, paient en ligne et passent prendre leurs achats au comptoir.` },
      { id: 'base', pourquoi: `Une fermeture imprévue ou une promotion à annoncer ? Vous l’écrivez dans votre espace client, et le site est mis à jour pour vous.` },
    ],
    body: `## Une deuxième vitrine, dans la rue où tout le monde passe

Votre vitrine attire ceux qui passent devant. Sur internet, elle attire aussi ceux qui cherchent « fromagerie » ou « fleuriste » et le nom de votre ville, sans connaître votre adresse.

## Ce que vos clients vérifient avant de venir

Votre site doit montrer, dès l’écran d’accueil :

- **Vos horaires**, avec les jours fériés, les congés et les nocturnes.
- **Votre adresse**, avec un bouton qui ouvre l’itinéraire et une indication pour se garer.
- **Ce que vous vendez**, en vrais mots : pain au levain, fromages fermiers, bouquets de saison.
- **Votre numéro**, pour mettre un produit de côté ou poser une question.

Ajoutez deux ou trois photos de la devanture et de l’intérieur : on vous reconnaît plus facilement en arrivant dans la rue.

## Le site et la fiche Google, ensemble

Pour un commerce de proximité, la [fiche Google](/guides/fiche-google-entreprise/) est souvent ce qu’on voit en premier : la carte, les horaires, les avis. Le site prend le relais pour présenter vos produits et donner envie de passer.

Le nom, l’adresse, le téléphone et les horaires doivent être identiques des deux côtés. Nous le vérifions avec vous à la mise en ligne.

## Vendre en ligne, retirer en magasin

Vendre en ligne n’est pas un passage imposé. Un site qui montre vos rayons et vos spécialités donne déjà une bonne raison de venir.

Pour aller plus loin, le ${BOU.name} permet à vos clients de commander à toute heure. Ils paient sur le site, puis choisissent la livraison ou le retrait au magasin. Pour un producteur, c’est aussi une façon simple de prendre les commandes de paniers.

Commencez petit, avec vos produits les plus demandés. Vous complétez ensuite votre catalogue depuis votre espace client, et ${qui('organisateur')} de notre petite bande, garde le tout en ordre. Le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/) explique le paiement, la livraison et les règles de vente.

## Un site qui suit la vie du magasin

Horaires d’été, fermeture en août, nouvelle gamme, marché de Noël : un commerce bouge tout le temps. Un site qui affiche encore les horaires de l’an dernier déçoit.

Avec le forfait ${mini.name}, ces changements ne vous demandent qu’un message dans votre espace client. Ce sont des modifications incluses : ${B('constructeur').nom} prépare votre demande, et Alex s’en charge.

## Combien ça coûte

- **Le site, une seule fois** : ${prixVis} € le ${VIS.name}, sans boutique, ou ${prixBoutique} € le ${BOU.name}.
- **Puis** : le forfait ${AUTO}, où vous gérez tout, ou le forfait ${mini.name}, pour ${eur(mini.month)} € par mois.

Le paiement se fait à la commande : en une fois, ou ${EN_FOIS} si vous préférez étaler. Les extras possibles sont détaillés sur la page [tarifs](/tarifs/).`,
    faq: [
      { q: 'J’ai déjà une page sur les réseaux sociaux, ai-je besoin d’un site ?', a: 'Les deux se complètent. Sur les réseaux, vos horaires et vos produits se noient vite sous les publications. Le site garde l’essentiel au même endroit, à votre nom.' },
      { q: 'Comment fonctionne le retrait en magasin ?', a: 'Le client choisit ses produits, paie en ligne et coche le retrait au moment de valider. Vous recevez la commande par e-mail, et il passe la prendre aux horaires que vous avez fixés.' },
      { q: 'Je suis producteur et je vends à la ferme, un site m’est-il utile ?', a: 'Oui. Le site indique vos jours de vente, vos produits de saison et le chemin jusqu’à la ferme. Avec la boutique, vos clients peuvent réserver leur panier à l’avance.' },
      { q: 'Le stock du magasin et celui du site sont-ils liés ?', a: 'Non. La boutique ne compte pas les quantités. Quand un produit vient à manquer, signalez-le dans votre espace client, et il est marqué épuisé sur le site.' },
    ],
    voir: ['/guides/creer-boutique-en-ligne/', '/realisations/', '/etre-visible-sur-google/'],
  },

  // ------------------------------------------------------------------ associations
  {
    slug: 'site-internet-association',
    nom: 'Associations',
    qui: 'Clubs, comités des fêtes, associations culturelles ou solidaires',
    icon: 'users',
    color: 'mint',
    title: 'Site internet pour association : agenda et adhésions | Les Minis Monstres',
    description: 'Club, comité des fêtes, association de quartier : un site internet qui vous rend visible, annonce vos dates et accueille adhérents et bénévoles, à petit budget.',
    h1: 'Site internet pour association : faire connaître vos activités sans vider la caisse',
    lead: 'Pour qu’on vous rejoigne, il faut d’abord savoir que vous existez. Nous créons un site internet simple qui rend votre association visible, dit ce que vous faites, quand et où, et ne dépend d’aucun bénévole en particulier.',
    resume: 'Agenda, adhésions, bénévoles, avec un petit budget.',
    besoins: [
      { icon: 'calendar', t: 'Un agenda toujours à jour', d: 'Assemblée générale, tournoi, brocante, répétition : les dates sont au même endroit pour tout le monde.' },
      { icon: 'user-check', t: 'Des adhésions plus simples', d: 'Tarifs, bulletin à télécharger ou lien vers votre outil d’inscription : rejoindre l’association devient facile.' },
      { icon: 'heart-handshake', t: 'Trouver des bénévoles', d: 'Une page dit clairement où vous avez besoin de bras et comment proposer son aide.' },
      { icon: 'piggy-bank', t: 'Un budget facile à voter', d: 'Un prix de création connu d’avance, et un petit abonnement au mois si le bureau le souhaite, sans surprise pour le trésorier.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore d’association parmi nos réalisations. Pour un comité des fêtes, nous proposerions une seule page : qui vous êtes, l’agenda de l’année, les photos de la dernière fête, comment devenir bénévole, et un formulaire qui arrive dans la boîte de l’association.',
    },
    options: [
      { id: 'base', pourquoi: `Il fait vivre le site sans effort pour le bureau. Chaque date de l’agenda est mise à jour pour vous : envoyez-la un peu en avance.` },
    ],
    body: `## Une association que l’on voit, on la rejoint

Une affiche tient une semaine, et une publication sur un réseau se perd en quelques jours. Un site internet garde votre association visible toute l’année, pour les habitants comme pour la mairie ou un futur partenaire.

## Ce qu’un futur membre cherche

Il veut comprendre en une minute :

- **Ce que vous faites**, et pour qui : enfants, adultes, débutants ou confirmés.
- **Quand et où** : les jours, les horaires, la salle.
- **Combien coûte l’adhésion**, et comment s’inscrire.
- **Qui contacter**, sans exposer le numéro personnel d’un membre du bureau.

Ajoutez des photos de vos activités, avec l’accord des personnes que l’on reconnaît, et celui des parents pour les enfants.

## L’agenda, le cœur du site

Tournoi, concert, sortie, assemblée générale : tout ce qui se prépare est réuni au même endroit. Vous nous envoyez la date, le lieu et une ligne de présentation, et c’est en ligne.

Après chaque événement, deux lignes de bilan et quelques photos montrent que l’association est bien vivante. C’est ce que regarde un commerçant qui hésite à sponsoriser votre tournoi.

Ces annonces aident aussi à être trouvé. Quelqu’un qui cherche « brocante » et le nom de votre village peut tomber sur votre page.

## Adhésions et bénévoles

Vous encaissez déjà les cotisations avec un outil en ligne ? Un bouton du site y mène. Sinon, un bulletin à imprimer et un formulaire de contact font très bien l’affaire.

Pour les bénévoles, dites précisément ce dont vous avez besoin : tenir la buvette deux heures, aider au montage, encadrer une sortie. Une demande précise rassure ceux qui n’osent pas s’engager pour toute l’année.

## Un site qui ne repose sur personne

C’est le problème classique : le membre qui avait fait le site s’en va, et plus personne ne sait le modifier.

Avec le forfait ${mini.name}, le président, la secrétaire ou le trésorier envoie sa demande depuis l’espace client, une page privée réservée à l’association. Tout est fait pour vous. Quand le bureau change, il suffit de transmettre l’accès.

## Un budget qui se vote

- **Le site** : ${prix} € pour un ${ESS.name}, payés à la commande, en une fois ou ${EN_FOIS}.
- **Ensuite, au choix** : le forfait ${AUTO}, si un bénévole gère le site, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois, sans engagement.

Pour la plupart des associations, une page suffit, sans aucun extra. Avec plusieurs sections, comme le foot, la gym et la randonnée, chacune peut avoir sa page grâce au ${VIS.name}, à ${prixVis} €.

Une adresse de site au nom de l’association fait aussi sérieux sur un dossier de subvention. Le guide pour [choisir un nom de domaine](/guides/choisir-nom-de-domaine/) vous aide à la trouver.`,
    faq: [
      { q: 'Notre budget est très serré, que faut-il prévoir ?', a: `Le ${ESS.name} coûte ${prix} €, une seule fois, et peut se régler ${EN_FOIS}. Ensuite, soit un bénévole gère le site avec le forfait ${AUTO}, sans rien payer chaque mois, soit vous prenez le forfait ${mini.name}, à ${eur(mini.month)} € par mois.` },
      { q: 'Qui peut demander des changements sur le site ?', a: 'Le bureau décide qui reçoit les codes de l’espace client. À chaque changement d’équipe, il suffit de mettre à jour l’adresse e-mail et le mot de passe du compte.' },
      { q: 'Peut-on recevoir des dons ou des adhésions en ligne ?', a: 'Oui, par un bouton qui mène vers le service de paiement que vous utilisez déjà pour vos cotisations. Sinon, un bulletin à télécharger suffit pour commencer.' },
      { q: 'Le site peut-il servir pour un événement, comme un festival ?', a: 'Oui. Une page dédiée présente le programme, les horaires, l’accès et les partenaires. Après l’événement, elle reste en ligne avec les photos.' },
    ],
    voir: ['/tarifs/', '/guides/choisir-nom-de-domaine/', '/accompagnement/'],
  },
];

module.exports = { metiers, PUBLIE };
