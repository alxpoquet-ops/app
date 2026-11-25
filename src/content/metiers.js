// Pages « Votre métier » (V2) : une page par métier, à la racine du site (/<slug>/).
// Règles (scripts/check.js) : title de 65 caractères au plus, description de 120 à 160, aucun tiret long
// ni demi-cadratin, aucun point-virgule, aucun prix écrit en dur (tout vient de config.js), aucun client,
// avis ou chiffre inventé, et pas de phrase de 9 mots ou plus reprise d'une autre page.
// Offre du 21 novembre 2026 : un seul site payé une fois, le Site Essentiel (config.offreSite), assemblé à partir de nos modules,
// avec l'option e-commerce (+ 200 €). Le Site Visibilité est retiré : les pages pour Google sont l'extra packseo (10 € la page).
// Puis Autonomie (config.creationSeule, sans abonnement, export du site remis au client) ou Mini (config.forfaits[0], au mois,
// sans engagement, modifications incluses, une demande à la fois). L'abonnement est facultatif. Trois extras : la page de
// visibilité Google (payée une fois, par carte), la traduction anglaise et la fonctionnalité spécifique (sur devis).
// La petite bande (config.bande) compte six Minis Monstres.
// Ton (tour global du 19 novembre 2026) : « nous / on », Alex nommé quand c'est utile (jamais « je »), vouvoiement, « site internet »,
// « modification ». Chaque page ouvre sur la visibilité (un site rend visible, c'est notre métier) et garde l'ordre de l'offre :
// le site, puis Autonomie ou Mini, enfin les extras. Pages courtes, pensées pour le téléphone.
// options : les conseils de la page (« Ce qu’on vous conseille »). Ids acceptés : 'boutique' (l'option e-commerce),
// 'base' (l'abonnement Mini), ou l'id d'un extra de config.aLaDemande encore proposé ('packseo', 'anglais', 'specifique').
// Le prix affiché vient de config.js. Chaque « pourquoi » doit coller à ce qui est conseillé.
// (Le code événement a été retiré le 17 novembre 2026 : un seul champ « Code promo » à la commande ; le parrainage est retiré.)
const { creation, forfaits, paiement, fractionne, marche, bande, evenement, creationSeule } = require('../config');
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500

const { offreSite, aLaDemande } = require('../config');
const ESS = offreSite.site, BOU = offreSite.avecBoutique, ECO = offreSite.option; // le site, le site avec l'option, l'option
const eco = ECO.name.toLowerCase(); // « e-commerce »
const prixPage = eur((aLaDemande.find((x) => x.id === 'packseo' && !x.retire) || { prix: 0 }).prix); // une page de visibilité Google
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0]; // Mini, le seul abonnement, facultatif
const AUTO = creationSeule.name; // sans abonnement
const delaiModif = `jusqu’à ${mini.delai.replace(/ heures?$/, ' h')}`; // une modification peut prendre jusqu'à 48 h
const prix = eur(ESS.price); // le Site Essentiel
const prixOption = eur(ECO.prix); // l'option e-commerce
const prixBoutique = eur(BOU.price); // le Site Essentiel avec l'option e-commerce
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
      { id: 'packseo', pourquoi: 'Une page de plus sur un travail précis que l’on tape sur Google, comme le démoussage d’un toit ou la pose d’une fenêtre de toit. À commander plus tard, depuis votre espace client, et à régler par carte, sans abonnement.' },
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

C’est le rôle des pages de visibilité Google : ${prixPage} € la page, ajoutées une fois votre ${ESS.name} en ligne, et écrites pour des recherches comme « recherche de fuite » dans votre secteur. Pour un seul métier, simple à présenter, le ${ESS.name} seul peut suffire. Le guide [une page ou un site vitrine](/guides/site-une-page-ou-site-vitrine/) vous aide à trancher.

Le site fait équipe avec votre [fiche Google](/guides/fiche-google-entreprise/) : la fiche vous place sur la carte, le site achève de convaincre.

## Vous êtes sur les chantiers, on s’occupe du site

Vous n’avez ni le temps ni l’envie de gérer un site le soir, et c’est normal. Nous écrivons les textes avec vous après un court échange, puis nous mettons tout en ligne.

Un tarif change, une nouvelle photo arrive ? Avec le forfait ${mini.name}, envoyez le changement depuis votre téléphone, dans votre espace client. ${qui('constructeur')} de notre petite bande, clarifie votre demande avec vous, puis l’envoie à Alex, qui fait la modification. Elle est incluse.

## Combien ça coûte

- **La création du site** : ${prix} € pour le ${ESS.name}, puis ${prixPage} € par page de visibilité Google, si vous en voulez.
- **Ensuite** : le forfait ${AUTO}, sans abonnement, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois et sans engagement.

Vous payez le site à la commande, d’un coup ou ${EN_FOIS}, au choix sur la page de paiement.

Pour comparer, un site vitrine de ${marche.pagesCompare} pages confié à un indépendant se paie en général entre ${marcheVitrine}, d’après des fourchettes publiées par des prestataires (les [sources](/pourquoi-moins-cher/) sont citées). Tout est détaillé sur la page [tarifs](/tarifs/).`,
    faq: [
      { q: 'Combien coûte un site internet pour un artisan ?', a: `${prix} € la création d’un ${ESS.name}, et ${prixPage} € par prestation que vous voulez mettre en avant sur Google. Ensuite, c’est le forfait ${AUTO}, sans rien payer chaque mois, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois.` },
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

Les pages de conseils sont une autre piste : comment se passe une première séance, trois exercices de respiration à faire chez soi. Chacune répond à une vraie question et ouvre une porte de plus vers vous. Ce sont des pages de visibilité Google, qui se commandent à la carte.

C’est le choix fait pour le site d’un magnétiseur, à découvrir parmi nos [réalisations](/realisations/).

## Vous accompagnez, on s’occupe du site

Vous n’avez pas à écrire seul. Racontez-nous votre pratique avec vos mots, au téléphone ou par écrit. ${qui('ecrivain')} de notre petite bande, met vos notes en forme.

Alex relit ensuite chaque phrase avec vous, surtout les plus délicates. Rien ne part en ligne sans votre accord.

## Le prix

- **Le site** : le ${ESS.name}, à ${prix} €. Puis, pour donner sa page à chaque pratique, ${prixPage} € la page de visibilité Google.
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
      { id: 'boutique', pourquoi: `Avec l’option ${eco}, vos pièces se choisissent, se paient en ligne et partent vers leur acheteur, même quand l’atelier est fermé.` },
      { id: 'packseo', pourquoi: 'Une page de plus sur une technique ou une matière, là où les amateurs commencent leurs recherches. Vous la commandez une fois le site lancé, sans abonnement.' },
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

- **La création du site** : ${prix} € le ${ESS.name} pour la galerie, et ${prixOption} € de plus avec l’option ${eco} pour vendre en ligne.
- **Ensuite** : le forfait ${AUTO} ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois, sans engagement.

Le site se règle en commandant, d’un coup ou ${EN_FOIS}. Une nouvelle collection à présenter ? Avec le forfait ${mini.name}, c’est une modification incluse.`,
    faq: [
      { q: 'Faut-il un statut pour vendre ses créations en ligne ?', a: 'Oui, dès que vous vendez de façon régulière. La micro-entreprise est la solution la plus courante pour démarrer. Les artistes auteurs ont un régime à part : renseignez-vous auprès de l’Urssaf avant d’ouvrir la boutique.' },
      { q: 'Mes photos sont-elles protégées une fois en ligne ?', a: 'Vos œuvres et vos photos restent à vous : le droit d’auteur s’applique sans aucune démarche. Nous publions des images assez grandes pour être belles à l’écran, sans mettre en ligne vos fichiers en pleine qualité.' },
      { q: 'Je vends déjà sur une place de marché, un site est-il utile ?', a: 'Oui, les deux se complètent. La place de marché amène du passage. Votre site, lui, porte votre nom, sans concurrent affiché à côté.' },
      { q: 'Combien coûte un site avec boutique pour un créateur ?', a: `Le ${ESS.name} avec l’option ${eco} coûte ${prixBoutique} € pour la création. Il comprend le site, le panier, le paiement en ligne sécurisé et le suivi des commandes. Vous ajoutez vos pièces vous-même, autant que vous voulez.` },
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

Les pages de visibilité Google sont faites pour eux, à ${prixPage} € la page : une sur la boucle de randonnée qui part de chez vous, une sur le marché du dimanche, une sur le château voisin. ${qui('observateur')} de notre petite bande, en prépare les sujets avec vous.

## Les avis et les règles à respecter

Publiez seulement de vrais commentaires de vos hôtes, avec leur accord, ou renvoyez vers votre [fiche Google](/guides/fiche-google-entreprise/). Cette fiche vous place aussi sur la carte quand quelqu’un cherche où dormir dans le coin.

!> Les locations de vacances et les chambres d’hôtes se déclarent en mairie. Si vous avez reçu un numéro d’enregistrement, il doit apparaître sur vos annonces, et votre site en est une : nous l’y ajoutons.

## Le prix, et qui s’en occupe

- **Le site** : ${prix} € pour le ${ESS.name}, qui présente votre hébergement, vos chambres et vos tarifs. Chaque page de visibilité Google ajoutée ensuite coûte ${prixPage} €.
- **Ensuite** : avec le forfait ${AUTO}, vous faites vos changements vous-même. Avec le forfait ${mini.name}, au mois et sans engagement, ils sont faits pour vous.

Un tarif d’été ou une date de fermeture ? Avec le forfait ${mini.name}, vous le demandez à ${B('constructeur').nom}, qui prépare votre demande pour Alex. Ce genre de modification est inclus.`,
    faq: [
      { q: 'Le site peut-il afficher mes disponibilités ?', a: 'Si vous tenez déjà un calendrier en ligne, le site peut y renvoyer. Sinon, la demande de séjour suffit souvent : vous gardez la main sur votre planning.' },
      { q: 'J’ai deux gîtes sur le même terrain, faut-il deux sites ?', a: 'Non. Un seul site présente les deux, chacun sur sa page, avec ses photos et ses tarifs. Vous n’avez qu’un site à faire vivre.' },
      { q: 'Combien coûte un site pour un gîte ?', a: `${prix} € la création d’un ${ESS.name}, puis ${prixPage} € par page de visibilité Google si vous voulez être trouvé sur plus de recherches. Le site peut se régler ${EN_FOIS}. Le forfait ${mini.name}, à ${eur(mini.month)} € par mois, reste facultatif.` },
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
      { id: 'boutique', pourquoi: `Avec l’option ${eco}, vos clients commandent le soir ou le dimanche, paient en ligne et passent prendre leurs achats au comptoir.` },
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

Pour aller plus loin, l’option ${eco} permet à vos clients de commander à toute heure. Ils paient sur le site, puis choisissent la livraison ou le retrait au magasin. Pour un producteur, c’est aussi une façon simple de prendre les commandes de paniers.

Commencez petit, avec vos produits les plus demandés. Vous complétez ensuite votre catalogue depuis votre espace client, et ${qui('organisateur')} de notre petite bande, garde le tout en ordre. Le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/) explique le paiement, la livraison et les règles de vente.

## Un site qui suit la vie du magasin

Horaires d’été, fermeture en août, nouvelle gamme, marché de Noël : un commerce bouge tout le temps. Un site qui affiche encore les horaires de l’an dernier déçoit.

Avec le forfait ${mini.name}, ces changements ne vous demandent qu’un message dans votre espace client. Ce sont des modifications incluses : ${B('constructeur').nom} prépare votre demande, et Alex s’en charge.

## Combien ça coûte

- **La création du site** : ${prix} € le ${ESS.name}, sans boutique, ou ${prixBoutique} € avec l’option ${eco}.
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

Pour la plupart des associations, le ${ESS.name} suffit, sans aucun extra. Avec plusieurs sections, comme le foot, la gym et la randonnée, chacune peut avoir sa page de visibilité Google, à ${prixPage} € la page.

Une adresse de site au nom de l’association fait aussi sérieux sur un dossier de subvention. Le guide pour [choisir un nom de domaine](/guides/choisir-nom-de-domaine/) vous aide à la trouver.`,
    faq: [
      { q: 'Notre budget est très serré, que faut-il prévoir ?', a: `La création du ${ESS.name} coûte ${prix} €, et peut se régler ${EN_FOIS}. Ensuite, soit un bénévole gère le site avec le forfait ${AUTO}, sans rien payer chaque mois, soit vous prenez le forfait ${mini.name}, à ${eur(mini.month)} € par mois.` },
      { q: 'Qui peut demander des changements sur le site ?', a: 'Le bureau décide qui reçoit les codes de l’espace client. À chaque changement d’équipe, il suffit de mettre à jour l’adresse e-mail et le mot de passe du compte.' },
      { q: 'Peut-on recevoir des dons ou des adhésions en ligne ?', a: 'Oui, par un bouton qui mène vers le service de paiement que vous utilisez déjà pour vos cotisations. Sinon, un bulletin à télécharger suffit pour commencer.' },
      { q: 'Le site peut-il servir pour un événement, comme un festival ?', a: 'Oui. Une page dédiée présente le programme, les horaires, l’accès et les partenaires. Après l’événement, elle reste en ligne avec les photos.' },
    ],
    voir: ['/tarifs/', '/guides/choisir-nom-de-domaine/', '/accompagnement/'],
  },

  // ------------------------------------------------------------------ boulangeries et pâtisseries
  {
    slug: 'site-internet-boulangerie-patisserie',
    nom: 'Boulangeries et pâtisseries',
    qui: 'Boulangers, pâtissiers, chocolatiers, dépôts de pain',
    icon: 'cookie',
    color: 'peach',
    title: 'Site internet pour boulangerie et pâtisserie | Les Minis Monstres',
    description: 'Un site internet pour boulangerie ou pâtisserie qui affiche vos horaires et vos spécialités, et prend les commandes de gâteaux sans bloquer le comptoir.',
    h1: 'Site internet pour boulangerie-pâtisserie : vos horaires, vos gâteaux, vos commandes',
    lead: 'Le dimanche matin, on vérifie sur son téléphone si la boulangerie est ouverte. Pour un anniversaire, on cherche qui fait les plus beaux entremets du coin. Nous créons le site internet qui répond aux deux, et qui rend votre fournil visible.',
    resume: 'Horaires, spécialités et gâteaux sur commande.',
    besoins: [
      { icon: 'clock', t: 'Ouvert ou fermé, sans hésiter', d: 'Jour de fermeture, congés d’été, horaires des fêtes : le client sait avant de sortir s’il trouvera du pain chaud.' },
      { icon: 'calendar-check', t: 'Commander son gâteau à l’avance', d: 'Entremets d’anniversaire, bûches, galettes, pièces montées : la demande arrive avec la date, le nombre de parts et le prénom à écrire.' },
      { icon: 'image', t: 'Des vitrines qui donnent faim', d: 'Vos viennoiseries, vos pains spéciaux et vos créations de saison, photographiés au sortir du four.' },
      { icon: 'info', t: 'Les allergènes à portée de main', d: 'Gluten, fruits à coque, œufs, lait : les familles concernées trouvent l’information avant de commander.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore de boulangerie parmi nos réalisations. Nous imaginerions un accueil avec les horaires du jour, une page pour la gamme et les spécialités, une galerie de vitrines, puis un formulaire pour les gâteaux sur commande.',
    },
    options: [
      { id: 'boutique', pourquoi: `Avec l’option ${eco}, vos clients réservent bûches et galettes en ligne, les paient d’avance, et passent les prendre au jour choisi.` },
      { id: 'packseo', pourquoi: 'Une page de plus pour les fêtes que l’on prépare tôt, comme la bûche de Noël ou la galette des rois, ou pour une spécialité de la maison. Commandée depuis votre espace client, réglée une fois.' },
    ],
    body: `## Le premier réflexe, c’est le téléphone

Vos habitués vous connaissent. Mais le nouvel arrivant du village, le vacancier ou le parent qui prépare un anniversaire tapent « boulangerie » ou « pâtisserie » avec le nom de la commune. Votre site internet et votre fiche Google leur répondent, même quand le rideau est baissé.

## Ce qu’on regarde avant de venir

- **Les horaires du jour**, surtout le dimanche, les jours fériés et pendant vos congés.
- **Ce qui sort du four** : vos pains, vos viennoiseries, vos spécialités maison.
- **Les gâteaux sur commande**, avec le délai à prévoir pour chacun.
- **Où vous trouver** : l’adresse, un bouton d’itinéraire, et vos dépôts de pain dans les villages voisins si vous en avez.

## Les modules qui servent

Le ${ESS.name} est assemblé à partir de nos modules. Pour une boulangerie, l’accueil montre les horaires et le numéro. La page services et tarifs présente la gamme. La galerie fait saliver, et les questions fréquentes répondent aux classiques : « faites-vous du sans gluten ? », « livrez-vous les mariages ? ».

## Les commandes de fêtes, sans carnet ni coup de fil

Noël, l’Épiphanie, Pâques, les communions : ces semaines-là, le téléphone sonne pendant que vous servez. Un formulaire de commande recueille la date, le parfum, le nombre de parts. Vous confirmez quand le calme revient.

Avec l’option ${eco}, la commande se paie en ligne. Fini la bûche réservée puis jamais retirée.

!> Les produits frais qui se gâtent vite ne sont pas soumis au droit de rétractation de 14 jours. Vos conditions de vente doivent le dire, avec vos règles d’annulation.

## Les allergènes et les mots protégés

Pour les produits vendus sans emballage, la loi impose d’informer sur les allergènes majeurs. Un tableau clair sur le site complète celui du magasin, et rassure les parents d’enfants allergiques.

Le titre de boulanger est réservé à ceux qui pétrissent, façonnent et cuisent leur pain sur place. Si c’est votre cas, dites-le fièrement. Écrivez aussi « fait maison », « au levain » ou « farine locale » seulement quand c’est vrai : nous n’ajoutons rien que vous ne fassiez pas.

## Être trouvé au-delà de la rue principale

La [fiche Google](/guides/fiche-google-entreprise/) vous met sur la carte. Le site ajoute les mots que les gens tapent : « pièce montée », « pain sans gluten », « galette frangipane ». Chaque spécialité peut avoir sa page de visibilité Google, à ${prixPage} € la page, quand vous voulez.

## Comment on s’y prend

Vous commandez en ligne, puis vous remplissez un questionnaire précis : horaires, gamme, commandes spéciales, photos. Alex vous appelle pour caler les détails. Alex crée le site, le vérifie en entier, puis tout part en ligne. Une nouvelle spécialité plus tard ? Votre site s’améliore à tout moment.

## Les tarifs

- **Le site** : ${prix} € la création du ${ESS.name}, ou ${prixBoutique} € avec l’option ${eco} pour les précommandes payées.
- **Après la mise en ligne** : le forfait ${AUTO}, sans mensualité, ou le forfait ${mini.name}, ${eur(mini.month)} € par mois, résiliable quand vous voulez.

Avec le forfait ${mini.name}, vos horaires de Noël ou votre fermeture d’août sont changés pour vous, depuis l’onglet « Mes modifications » de votre espace client.`,
    faq: [
      { q: 'Puis-je changer moi-même les horaires de la semaine ?', a: `Oui, avec le forfait ${mini.name} : le bouton « Modifier mon site moi-même » de votre espace client vous laisse changer un horaire ou une photo en deux minutes. Pour le reste, vous envoyez une demande.` },
      { q: 'Le site peut-il prendre les commandes de pièces montées ?', a: 'Oui. Un formulaire demande la date, le nombre de convives et les parfums souhaités. Pour une pièce aussi particulière, vous rappelez le client avant de fixer le prix.' },
      { q: 'Je livre du pain dans les villages en tournée, ça se met sur le site ?', a: 'Bien sûr. Une page indique les communes, les jours et l’heure approximative du passage. Les habitants savent ainsi quand guetter le klaxon.' },
      { q: 'Combien coûte un site internet pour une boulangerie ?', a: `Comptez ${prix} € pour créer le ${ESS.name}. Ajoutez ${prixOption} € pour l’option ${eco} si vous voulez des commandes payées en ligne. Le forfait ${mini.name}, à ${eur(mini.month)} € par mois, vient ensuite si vous le souhaitez.` },
    ],
    voir: ['/site-internet-commercant/', '/guides/fiche-google-entreprise/', '/guides/creer-boutique-en-ligne/'],
  },

  // ------------------------------------------------------------------ photographes
  {
    slug: 'site-internet-photographe',
    nom: 'Photographes',
    qui: 'Photographes de mariage, de famille, de portrait, d’entreprise ou d’immobilier',
    icon: 'camera',
    color: 'lilac',
    title: 'Site internet pour photographe professionnel | Les Minis Monstres',
    description: 'Mariage, portrait, famille, entreprise : un site internet pour photographe qui montre vos plus belles séries, vos formules et vos dates libres pour réserver.',
    h1: 'Site internet pour photographe : vos images d’abord, puis la réservation',
    lead: 'Un couple qui se marie, une famille qui attend un bébé, une entreprise qui veut des portraits : tous comparent des portfolios avant d’écrire. Nous créons le site internet qui met vos photos en grand et rend vos formules faciles à comprendre.',
    resume: 'Portfolio par spécialité, formules, réservation.',
    besoins: [
      { icon: 'layout-grid', t: 'Un portfolio par spécialité', d: 'Mariage, nouveau-né, portrait, immobilier : chaque visiteur voit tout de suite les séries qui le concernent.' },
      { icon: 'badge-euro', t: 'Des formules lisibles', d: 'Durée de la séance, nombre d’images livrées, délai de remise : on compare sans devoir vous écrire trois fois.' },
      { icon: 'calendar-days', t: 'Votre date est-elle libre ?', d: 'Pour un mariage, la première question est la date. Le formulaire la demande d’emblée, avec le lieu et le nombre d’invités.' },
      { icon: 'gift', t: 'Offrir une séance photo', d: 'Un bon cadeau à offrir pour une naissance, un anniversaire de mariage ou les fêtes de fin d’année.' },
    ],
    exemple: {
      client: null,
      texte: 'Aucun photographe ne figure encore parmi nos réalisations. Nous proposerions une galerie par spécialité, une page de formules avec un prix de départ, une présentation avec votre portrait et une demande de date.',
    },
    options: [
      { id: 'boutique', pourquoi: `Avec l’option ${eco}, vos bons cadeaux et vos tirages se commandent et se paient en ligne, sans rendez-vous.` },
      { id: 'specifique', pourquoi: 'Une galerie privée, protégée par un mot de passe, où chaque client retrouve ses photos ? C’est une fonctionnalité à part. Décrivez votre besoin, le devis est gratuit.' },
      { id: 'packseo', pourquoi: 'Une page de plus pour « photographe de mariage » ou « séance nouveau-né » avec votre ville, ces recherches précises que tapent les futurs clients. À ajouter depuis votre espace client.' },
    ],
    body: `## On choisit un photographe avec les yeux

Le bouche-à-oreille donne un nom. Ensuite, on regarde. Un futur client fait défiler vos images, compare votre lumière et votre style avec deux ou trois autres, puis décide. Votre site internet est votre book, ouvert jour et nuit, et il vous rend visible sur Google bien au-delà de votre réseau.

## Montrer moins, mais mieux

Quelques séries choisies valent mieux qu’un dossier entier déversé à l’écran. Classez-les par spécialité, et racontez chaque série en deux lignes : le lieu, la saison, l’ambiance.

Nous publions vos photos dans un format allégé, net à l’écran, pour que le site s’ouvre vite même au téléphone. Vos fichiers en haute définition restent chez vous.

## Ce que le client veut savoir avant d’écrire

- **Votre style**, en images et en quelques mots : naturel, posé, reportage, studio.
- **Vos formules**, avec la durée, le nombre de photos livrées et le délai.
- **Où vous travaillez** : en studio, en extérieur, à domicile, et jusqu’où vous vous déplacez.
- **Le déroulé**, de la prise de contact à la remise des photos.

Afficher un prix de départ par formule évite les demandes qui n’aboutiront pas. Pour les mariages, un « à partir de » suffit.

## Les modules qui comptent pour vous

La galerie passe en premier. La présentation dit qui tient l’appareil : on confie un mariage ou un nourrisson à une personne, pas à un logo. La page services et tarifs liste vos formules, et le contact demande la date, le lieu et le type de séance.

## Le droit à l’image, avant de publier

!> Une personne reconnaissable ne se montre en ligne qu’avec son accord. Prévoyez une autorisation écrite dans votre contrat, et pour les enfants, celle de leurs parents. Sans accord, la photo reste hors du site.

## Être trouvé sur les bonnes recherches

Personne ne tape seulement « photographe ». On cherche « photographe mariage » et une région, « shooting grossesse » et une ville, « portraits d’entreprise » pour une équipe. Une page par spécialité répond à chacune de ces recherches. Ce sont nos pages de visibilité Google, à ${prixPage} € la page, ajoutées quand vous le souhaitez. ${qui('observateur')} de notre petite bande, en repère les sujets.

Reliez aussi le site à votre [fiche Google](/guides/fiche-google-entreprise/), où vos clients peuvent laisser un avis réel.

## De la commande à la mise en ligne

La commande se passe en ligne. Un questionnaire précis vous demande vos spécialités, vos formules et vos meilleures séries. Alex vous appelle pour bien saisir votre style. Alex crée le site, le vérifie image par image, puis le publie. Une nouvelle série ensuite ? Le site évolue avec vous.

## Le budget

- **Pour commencer** : le ${ESS.name}, à ${prix} €. Comptez ${prixOption} € de plus avec l’option ${eco} pour vendre bons cadeaux et tirages.
- **Ensuite** : le forfait ${AUTO}, si vous préférez tout gérer, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois et sans engagement.

La création se paie à la commande, en une fois ou ${EN_FOIS}.`,
    faq: [
      { q: 'Mes photos risquent-elles d’être copiées ?', a: 'Le droit d’auteur vous protège sans démarche. Nous publions des images de taille raisonnable, et vous pouvez y apposer une signature discrète. Aucun site n’empêche une capture d’écran, mais un fichier léger ne permet pas un beau tirage.' },
      { q: 'Puis-je livrer les photos de mes clients par le site ?', a: 'Une galerie privée par client demande une fonctionnalité spécifique, sur devis gratuit. Si vous utilisez déjà un service de livraison de photos, le site peut simplement y renvoyer.' },
      { q: 'Je fais aussi de la vidéo, est-ce que ça se montre ?', a: 'Oui. Un court film peut s’afficher dans une page. Il est hébergé sur une plateforme vidéo, pour que votre site reste rapide.' },
      { q: 'Combien coûte un site pour un photographe ?', a: `La création d’un ${ESS.name} coûte ${prix} €. Avec l’option ${eco}, pour vendre des bons cadeaux, comptez ${prixBoutique} €. Les pages de visibilité Google s’ajoutent ensuite, à ${prixPage} € pièce.` },
    ],
    voir: ['/site-internet-createur-artiste/', '/realisations/', '/referencement-seo/'],
  },

  // ------------------------------------------------------------------ coachs sportifs
  {
    slug: 'site-internet-coach-sportif',
    nom: 'Coachs sportifs',
    qui: 'Coachs à domicile, préparateurs physiques, professeurs de yoga ou de pilates',
    icon: 'trophy',
    color: 'mint',
    title: 'Site internet pour coach sportif indépendant | Les Minis Monstres',
    description: 'Coach à domicile, en salle ou en extérieur : un site internet pour coach sportif qui présente vos séances, vos diplômes et vos tarifs, et donne envie de venir.',
    h1: 'Site internet pour coach sportif : donner envie de faire la première séance',
    lead: 'Avant de confier sa remise en forme à quelqu’un, on veut savoir qui il est, où se passent les séances et combien elles coûtent. Nous créons le site internet qui vous rend visible dans votre secteur et qui lève ces doutes.',
    resume: 'Séances, diplômes, tarifs et premier rendez-vous.',
    besoins: [
      { icon: 'badge-check', t: 'Vos diplômes en évidence', d: 'Diplôme, carte professionnelle, spécialités : on confie son dos et ses genoux à quelqu’un de formé.' },
      { icon: 'map-pin', t: 'Où ont lieu les séances', d: 'À domicile, au parc, en salle, en visio : le lieu et la zone de déplacement sont clairs.' },
      { icon: 'ticket', t: 'Séance, carnet ou abonnement', d: 'Le prix d’une séance, celui d’un carnet, l’offre à deux : on choisit sans avoir à négocier.' },
      { icon: 'calendar-check', t: 'Un premier pas facile', d: 'Un formulaire court pour réserver une séance découverte ou un bilan, sans engagement.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore de coach parmi nos réalisations. Nous construirions un accueil avec votre photo en action, une page par type de séance, vos diplômes, vos tarifs et une demande de séance découverte.',
    },
    options: [
      { id: 'packseo', pourquoi: 'Une page de plus pour une recherche précise, comme « coach sportif à domicile », « préparation au trail » ou « pilates » avec votre ville. Vous l’ajoutez après le lancement, depuis votre espace client.' },
      { id: 'boutique', pourquoi: `Avec l’option ${eco}, vos carnets de séances et vos cartes cadeaux se paient en ligne avant le premier cours.` },
      { id: 'specifique', pourquoi: 'Des créneaux à réserver en ligne, avec confirmation automatique ? C’est une fonctionnalité sur mesure : décrivez votre façon de travailler, le devis ne coûte rien.' },
    ],
    body: `## On cherche un coach près de chez soi

Une reprise après une grossesse, une course à préparer, l’envie de bouger plus : la décision mûrit longtemps, puis la recherche se fait en quelques minutes, sur le téléphone. « Coach sportif » et le nom de la ville. Si votre nom n’apparaît pas, la séance se réserve ailleurs.

## Ce qui décide à vous écrire

- **Votre parcours** : vos diplômes, vos spécialités, le public que vous accompagnez.
- **Le cadre** : à domicile, en extérieur, en salle, seul ou en petit groupe.
- **Vos prix**, à la séance et en formule, sans astérisque caché.
- **Une photo de vous en action**, plutôt qu’une image de banque d’images.

## Les diplômes, une obligation et un argument

!> Pour encadrer une activité physique contre rémunération, la loi exige un diplôme reconnu et une carte professionnelle d’éducateur sportif. Indiquez-les sur votre site : un client prudent y sera attentif.

Restez aussi mesuré dans vos promesses. « Perdre dix kilos en un mois » attire des ennuis, pas des clients fidèles. Parlez plutôt de régularité, de forme, de plaisir retrouvé. Pour un public fragile, rappelez qu’un avis médical passe avant la reprise.

## Les modules à mettre en avant

La présentation porte une grande partie du travail : on s’engage avec une personne. La page services et tarifs détaille chaque formule. La galerie montre vos séances, avec l’accord des participants. Les questions fréquentes préparent la première fois : la tenue, le matériel, ce qui se passe si l’on doit annuler.

## Être visible là où vous intervenez

Si vous vous déplacez, citez les communes que vous couvrez. Votre [fiche Google](/guides/fiche-google-entreprise/) peut afficher une zone d’intervention sans montrer votre adresse personnelle.

Vous avez plusieurs cordes, comme le renforcement, la course et le yoga ? Chaque pratique gagne à avoir sa page, pour répondre à ceux qui la cherchent. C’est le principe des pages de visibilité Google, ${prixPage} € l’unité, ou en pack de 5 ou de 10 pour aller plus loin.

## Votre site, étape par étape

Vous passez commande. Un questionnaire précis recueille vos formules, vos lieux, vos diplômes et vos photos. Alex vous appelle ensuite pour affiner. Alex crée le site et le vérifie en entier avant la mise en ligne, et vous pourrez l’améliorer à tout moment, au fil de vos nouvelles séances.

## Le prix

- **La création** : ${prix} € pour le ${ESS.name}. Avec l’option ${eco}, pour vendre vos carnets en ligne, le total monte à ${prixBoutique} €.
- **Le suivi** : le forfait ${AUTO}, sans frais mensuels, ou le forfait ${mini.name}, ${eur(mini.month)} € par mois, arrêtable à tout moment.

Planning d’été, nouveau créneau de groupe : avec le forfait ${mini.name}, ${B('constructeur').nom} prend votre demande et Alex la met en ligne.`,
    faq: [
      { q: 'Je n’ai pas de salle, ai-je vraiment besoin d’un site ?', a: 'Oui, peut-être même davantage. Sans vitrine physique, votre site et votre fiche Google sont les seuls endroits où l’on vous découvre en dehors du bouche-à-oreille.' },
      { q: 'Puis-je afficher les résultats de mes clients ?', a: 'Avec leur accord écrit, et sans en faire une promesse. Un témoignage réel sur le plaisir de bouger vaut mieux qu’un avant-après spectaculaire.' },
      { q: 'Je donne des cours collectifs en plein air, comment l’annoncer ?', a: 'Une page agenda présente les lieux, les jours et l’heure de rendez-vous, avec ce qu’il faut apporter. En cas de pluie, une modification suffit pour prévenir.' },
      { q: 'Combien coûte un site internet pour un coach ?', a: `${prix} € pour créer votre ${ESS.name}, payables ${EN_FOIS} si vous le souhaitez. Puis, au choix, le forfait ${AUTO} ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois.` },
    ],
    voir: ['/site-internet-therapeute/', '/guides/fiche-google-entreprise/', '/tarifs/'],
  },

  // ------------------------------------------------------------------ food trucks
  {
    slug: 'site-internet-food-truck',
    nom: 'Food trucks',
    qui: 'Food trucks, camions pizza, rôtisseries et cuisines ambulantes',
    icon: 'flame',
    color: 'butter',
    title: 'Site internet food truck et camion pizza | Les Minis Monstres',
    description: 'Tournée de la semaine, menu du moment, privatisations : un site internet pour food truck qui dit à vos clients où vous trouver aujourd’hui, et à quelle heure.',
    h1: 'Site internet pour food truck : où vous trouver, ce qu’il y a au menu',
    lead: 'Un camion bouge, et c’est toute la difficulté : vos clients doivent savoir où vous êtes ce soir. Nous créons le site internet qui affiche votre tournée, votre carte et vos privatisations, et qui vous rend visible dans chaque commune où vous vous garez.',
    resume: 'Tournée de la semaine, menu, privatisations.',
    besoins: [
      { icon: 'calendar-days', t: 'La tournée de la semaine', d: 'Lundi sur la place de l’église, jeudi devant la salle des fêtes : chaque emplacement avec ses horaires.' },
      { icon: 'file-text', t: 'Le menu du moment', d: 'Vos burgers, pizzas ou plats du jour, avec les prix et la recette de saison qui change.' },
      { icon: 'party-popper', t: 'Les privatisations', d: 'Mariage, anniversaire, fête d’entreprise, kermesse : une demande de devis précise la date, le lieu et le nombre de convives.' },
      { icon: 'phone-call', t: 'Commander pour éviter la file', d: 'Un bouton appelle le camion pour passer commande et venir chercher à l’heure dite.' },
    ],
    exemple: {
      client: null,
      texte: 'Aucun food truck dans nos réalisations pour l’instant. Nous mettrions la tournée en haut de l’accueil, puis la carte avec les prix, une galerie du camion et de vos plats, et une page pour les privatisations.',
    },
    options: [
      { id: 'base', pourquoi: 'Un emplacement annulé, une soirée ajoutée ? Vous l’envoyez depuis votre espace client, et votre planning en ligne est corrigé pour vous.' },
      { id: 'packseo', pourquoi: 'Une page de plus pour « food truck mariage » ou pour une commune de votre tournée, afin d’apparaître là où l’on vous attend. À commander quand le site tourne, sans abonnement.' },
    ],
    body: `## Vos clients vous cherchent, mais où ?

Un restaurant ne bouge pas. Votre camion, si. La question qui revient : « il est où, ce soir ? ». Un site internet à votre nom y répond toute la semaine, et il vous fait connaître dans chaque village de votre tournée.

## Le planning, au centre de l’accueil

- **Le jour et le lieu**, avec un repère simple : la place, le parking, le nom de l’entreprise qui vous accueille.
- **Les horaires** de service, du premier au dernier client.
- **Les absences** : vacances, panne, festival qui vous prend le week-end.
- **Un lien d’itinéraire** pour chaque emplacement.

Un planning faux fait plus de tort que pas de planning du tout. Pensez à prévenir à chaque changement.

## Les modules qui vous servent

L’accueil porte la tournée et le numéro. La page services et tarifs présente la carte, avec les prix. La galerie montre le camion, pour qu’on le reconnaisse de loin, et vos plats. Les questions fréquentes répondent à « prenez-vous la carte bancaire ? » ou « faites-vous un menu enfant ? ».

## Les privatisations, une autre façon de remplir l’agenda

Si vous travaillez aussi sur réservation, une page dédiée l’annonce. Mariages, fêtes de village, repas d’entreprise : elle présente vos formules et le nombre de repas que vous pouvez servir. Le formulaire de devis demande la date, le lieu, le nombre de personnes et l’accès pour le camion, comme un branchement électrique ou un terrain plat.

## Allergènes et autorisations

!> Comme tout professionnel qui sert à manger, vous devez pouvoir indiquer les allergènes de chaque plat. Une mention sur le site, à côté de la carte, renvoie vers l’information complète au camion.

Côté emplacements, les autorisations de stationnement se demandent à chaque commune ou propriétaire. Le site, lui, ne montre que les lieux confirmés.

## Être visible commune par commune

Votre [fiche Google](/guides/fiche-google-entreprise/) peut fonctionner avec une zone desservie plutôt qu’une adresse fixe. Sur le site, chaque emplacement cité en toutes lettres aide les habitants du coin à vous trouver.

Pour aller plus loin, une page de visibilité Google peut parler d’une commune précise ou de vos prestations pour les mariages, à ${prixPage} € la page.

## Comment se fait votre site

Commande en ligne, puis un questionnaire précis : votre tournée, votre carte, vos photos. Alex vous appelle pour clarifier ce qui doit l’être. Alex crée le site, en contrôle chaque détail, et c’est en ligne. Votre carte change avec les saisons ? Le site suit, à tout moment.

## Combien ça coûte

- **Le site** : ${prix} € la création d’un ${ESS.name}.
- **Puis** : le forfait ${AUTO}, si vous mettez à jour vous-même, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois, sans engagement, pour qu’on s’en charge.

Pas encore de nom de domaine ? Avec le forfait ${mini.name}, on vous le fournit, à votre nom, pour ${eur(mini.domaine)} € de plus par mois.`,
    faq: [
      { q: 'Ma tournée change chaque semaine, le site peut-il suivre ?', a: `Oui. Avec le forfait ${mini.name}, vous corrigez le planning vous-même depuis votre espace client, ou vous nous envoyez la nouvelle tournée pour qu’elle soit mise en ligne.` },
      { q: 'Puis-je prendre des commandes à l’avance par le site ?', a: `Pour commencer, un bouton d’appel suffit : le client commande et passe à l’heure convenue. Une commande payée en ligne est possible avec l’option ${eco}, si votre organisation le permet.` },
      { q: 'Je n’ai pas d’adresse fixe, puis-je quand même être sur Google ?', a: 'Oui. La fiche Google accepte une zone desservie sans adresse affichée. Le site complète avec la tournée et les communes où vous vous arrêtez.' },
      { q: 'Combien coûte un site pour un food truck ?', a: `La création du ${ESS.name} revient à ${prix} €, que vous pouvez régler ${EN_FOIS}. Ensuite, le forfait ${mini.name} et le forfait ${AUTO} restent au choix.` },
    ],
    voir: ['/guides/site-internet-restaurant/', '/guides/fiche-google-entreprise/', '/tarifs/'],
  },

  // ------------------------------------------------------------------ fleuristes
  {
    slug: 'site-internet-fleuriste',
    nom: 'Fleuristes',
    qui: 'Fleuristes, artisans fleuristes, ateliers floraux',
    icon: 'gift',
    color: 'pink',
    title: 'Site internet pour fleuriste : vos bouquets | Les Minis Monstres',
    description: 'Mariage, deuil, anniversaire : un site internet pour fleuriste qui montre vos compositions, annonce votre zone de livraison et prend les commandes avec la date.',
    h1: 'Site internet pour fleuriste : vos compositions, commandées et livrées près de chez vous',
    lead: 'On pense aux fleurs au dernier moment, ou de loin, pour quelqu’un qui habite ici. Nous créons le site internet qui rend votre boutique visible et permet de commander un bouquet, une couronne ou les fleurs d’un mariage, avec la date et le message.',
    resume: 'Bouquets, deuil, mariages, livraison locale.',
    besoins: [
      { icon: 'heart', t: 'Chaque occasion sa page', d: 'Anniversaire, naissance, mariage, deuil : le client va droit à ce qu’il cherche, avec des exemples réels.' },
      { icon: 'route', t: 'La zone de livraison', d: 'Les communes livrées, les frais et l’heure limite pour une livraison le jour même, si vous la proposez.' },
      { icon: 'message-square', t: 'Le mot qui accompagne', d: 'La carte à joindre, le nom du destinataire, l’adresse de la cérémonie : tout arrive dans la commande.' },
      { icon: 'image', t: 'Vos créations, pas un catalogue', d: 'Vos vraies compositions, de saison, photographiées dans votre boutique.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore de fleuriste parmi nos réalisations. Nous ferions un accueil avec vos horaires et votre zone, une galerie par occasion, une page dédiée au deuil et une commande avec date et message.',
    },
    options: [
      { id: 'boutique', pourquoi: `Avec l’option ${eco}, un bouquet se choisit, se paie et se programme en ligne, même un dimanche soir, pour une livraison le jour dit.` },
      { id: 'packseo', pourquoi: 'Une page de plus sur les fleurs de deuil, la décoration florale de mariage ou la Saint-Valentin, avec le nom de votre ville. Vous la commandez une fois le site ouvert.' },
      { id: 'base', pourquoi: 'Fête des mères, Toussaint, fermeture estivale : vous signalez le changement dans votre espace client, et la page d’accueil est mise à jour pour vous.' },
    ],
    body: `## Les fleurs se commandent souvent à distance

Un petit-fils qui habite loin veut fleurir l’anniversaire de sa grand-mère. Une famille doit commander une couronne pour des obsèques au village. Ces personnes ne passeront pas devant votre vitrine. Elles tapent « fleuriste » et le nom de la commune, et commandent chez le premier qui leur paraît sérieux.

## Ce qu’on veut voir avant de commander

- **Des exemples par occasion**, avec une fourchette de prix.
- **Les communes livrées**, les frais et les délais.
- **Comment se passe un deuil** : livraison au funérarium, à l’église ou au cimetière, ruban personnalisé.
- **Vos horaires**, dimanche matin et jours de fête compris.

## Les modules à mettre en valeur

L’accueil annonce vos horaires et votre zone. La galerie présente vos compositions par occasion. La page services et tarifs donne des repères de prix. La présentation raconte votre façon de travailler : fleurs de saison, horticulteurs du coin, si c’est votre cas. Rien n’est écrit que vous ne fassiez vraiment.

## Commander en ligne, ou simplement appeler

Le ${ESS.name} suffit à recevoir les demandes : un formulaire recueille l’occasion, le budget, la date et le message. Vous rappelez pour confirmer.

Avec l’option ${eco}, le client paie directement. Il indique le jour de livraison et le texte de la carte, et vous recevez la commande par e-mail.

!> Les fleurs coupées se fanent vite : elles échappent au droit de rétractation de 14 jours. Précisez-le dans vos conditions de vente, avec vos règles en cas d’absence du destinataire.

## Les grands rendez-vous de l’année

Saint-Valentin, fête des grands-mères, fête des mères, Toussaint : chaque date amène des recherches précises. Une page qui présente votre offre quelques semaines avant aide à capter ces clients. Ce sont des pages de visibilité Google, à ${prixPage} € la page, commandées depuis votre espace client.

Votre [fiche Google](/guides/fiche-google-entreprise/) complète le tout : la carte, vos horaires, et les avis de vos clients, vers lesquels le site renvoie.

## De votre commande au site en ligne

Vous commandez en ligne. Un questionnaire précis vous fait détailler vos occasions, votre zone, vos tarifs. Alex vous appelle pour lever les doutes. Alex crée le site, puis le relit en entier avant de le publier. Vous pourrez ensuite l’enrichir quand vous voulez.

## Le prix

- **Le site** : ${prix} € pour le ${ESS.name}. Pour vendre en ligne avec livraison programmée, choisissez l’option ${eco}, soit ${prixBoutique} € en tout.
- **Ensuite** : le forfait ${AUTO}, où vous restez maître de tout, ou le forfait ${mini.name}, ${eur(mini.month)} € par mois, sans engagement.

La création se règle à la commande, d’un coup ou ${EN_FOIS}.`,
    faq: [
      { q: 'Puis-je vendre des bouquets qui changent selon les arrivages ?', a: 'Oui. Présentez un « bouquet du fleuriste » à prix fixe, composé selon la saison, avec une photo d’exemple. Le client sait qu’il recevra un bouquet du même esprit, pas une copie exacte.' },
      { q: 'Comment gérer les commandes pour un enterrement ?', a: 'Le formulaire demande le lieu et l’heure de la cérémonie, le texte du ruban et un contact. Vous savez où et quand livrer, sans déranger la famille.' },
      { q: 'Je travaille surtout les mariages, le site peut-il le montrer ?', a: 'Bien sûr. Une galerie dédiée présente vos décors, et un formulaire recueille la date, le lieu et le style recherché, pour préparer une première rencontre.' },
      { q: 'Combien coûte un site pour un fleuriste avec commande en ligne ?', a: `${prixBoutique} € la création du ${ESS.name} avec l’option ${eco}, ou ${prix} € sans la boutique. Quant au forfait ${mini.name}, à ${eur(mini.month)} € par mois, vous le prenez seulement s’il vous rend service.` },
    ],
    voir: ['/site-internet-commercant/', '/guides/creer-boutique-en-ligne/', '/guides/fiche-google-entreprise/'],
  },

  // ------------------------------------------------------------------ garages automobiles
  {
    slug: 'site-internet-garage-automobile',
    nom: 'Garages automobiles',
    qui: 'Garagistes, mécaniciens, carrossiers, centres pneus, réparateurs de motos',
    icon: 'car-front',
    color: 'sky',
    title: 'Site internet pour garage automobile | Les Minis Monstres',
    description: 'Entretien, pneus, freins, carrosserie : un site internet pour garage automobile qui présente vos prestations, vos tarifs et facilite la prise de rendez-vous.',
    h1: 'Site internet pour garage automobile : des clients qui savent quoi attendre avant de venir',
    lead: 'Un voyant qui s’allume, une vidange à faire, un pare-chocs abîmé : l’automobiliste cherche un garage proche et fiable, souvent dans l’urgence. Nous créons le site internet qui rend votre atelier visible, explique ce que vous faites et fait sonner votre téléphone.',
    resume: 'Prestations, tarifs affichés, rendez-vous atelier.',
    besoins: [
      { icon: 'wrench', t: 'Toutes vos prestations', d: 'Révision, distribution, freins, pneus, climatisation, diagnostic : chaque intervention citée avec les mots du client.' },
      { icon: 'receipt', t: 'Des tarifs qui rassurent', d: 'Taux horaire, forfaits vidange ou pneus : le client arrive en sachant à quoi s’attendre.' },
      { icon: 'calendar-check', t: 'Demander un rendez-vous', d: 'Le formulaire demande la marque, le modèle, l’immatriculation et le souci, pour préparer l’atelier.' },
      { icon: 'car-front', t: 'Les petits plus qui comptent', d: 'Véhicule de prêt, dépannage, ouverture le samedi, voitures d’occasion à vendre : tout ce qui vous distingue.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore de garage parmi nos réalisations. Nous proposerions un accueil avec le numéro et les horaires, une page par grande prestation, vos tarifs courants, une galerie de l’atelier et une demande de rendez-vous.',
    },
    options: [
      { id: 'packseo', pourquoi: 'Une page de plus pour une réparation précise que l’on tape sur Google, comme « changement d’embrayage » ou « recharge clim », avec votre commune. Elle se commande depuis votre espace client, sans abonnement.' },
      { id: 'specifique', pourquoi: 'Un planning d’atelier où le client choisit lui-même son créneau ? C’est une fonctionnalité à part : expliquez comment vous organisez vos journées, et le devis est gratuit.' },
    ],
    body: `## Un garage, on le choisit souvent au téléphone

Quand la voiture fait un bruit inquiétant, on n’a pas le temps de comparer dix garages. On tape « garage » et le nom de sa commune, on regarde les premiers résultats, puis on appelle. Être visible à ce moment-là, avec un site clair et un numéro qu’on compose d’un geste, c’est ce qui fait entrer la voiture dans votre atelier.

## Ce que l’automobiliste veut savoir

- **Ce que vous réparez** : entretien, mécanique, carrosserie, pneus, et les marques que vous connaissez bien.
- **Combien ça coûte**, au moins pour les interventions courantes.
- **Quand vous êtes ouverts**, et si vous dépannez en cas de panne sur la route.
- **Comment déposer la voiture** : l’adresse, le parking, une boîte à clés si vous en avez une.

## Afficher ses tarifs, une obligation qui devient un atout

!> Les garages doivent déjà afficher leurs taux horaires et leurs principaux forfaits à l’accueil. Les reprendre sur le site ne coûte rien, et un client qui connaît le prix d’une vidange décroche plus facilement son téléphone.

## La garantie, la question qui revient

Des conducteurs croient encore perdre la garantie du constructeur s’ils font l’entretien ailleurs qu’en concession. C’est faux, tant que l’entretien respecte le programme prévu par le constructeur, avec des pièces de qualité équivalente. Dites-le sur votre site : cette réponse lève un vrai frein pour les voitures récentes.

La loi vous demande aussi de proposer des pièces de réemploi pour certaines réparations. Le mentionner rassure sur le budget.

## Les modules qui font venir

L’accueil met en avant le numéro et les horaires. La page services et tarifs détaille chaque prestation. La galerie montre l’atelier, le pont, l’équipe, et pourquoi pas une carrosserie avant et après réparation. Le contact devient une demande de rendez-vous qui vous fait gagner du temps au téléphone.

## Être trouvé dans votre secteur

Votre [fiche Google](/guides/fiche-google-entreprise/) vous place sur la carte et recueille les avis. Le site ajoute le détail que la fiche ne peut pas donner. Chaque grande prestation peut avoir sa page, pour sortir quand quelqu’un cherche « diagnostic voyant moteur » ou « parallélisme » près de chez lui. Ce sont nos pages de visibilité Google, à ${prixPage} € la page.

## Le chemin jusqu’à la mise en ligne

Après votre commande, vous répondez à un questionnaire précis : prestations, marques, tarifs, horaires, photos. Alex vous appelle pour compléter. Alex crée le site, le vérifie en entier, puis le met en ligne. Un nouveau service, comme l’entretien des voitures électriques, s’ajoute ensuite à tout moment.

## Combien prévoir

- **La création** : ${prix} € pour le ${ESS.name}, payés à la commande, d’un coup ou ${EN_FOIS}.
- **Ensuite** : le forfait ${AUTO}, sans abonnement, ou le forfait ${mini.name}, ${eur(mini.month)} € par mois, pour un site entretenu comme une voiture bien suivie.

Changement de taux horaire, fermeture pour congés : avec le forfait ${mini.name}, ${B('constructeur').nom} recueille votre demande et Alex fait la modification.`,
    faq: [
      { q: 'Puis-je montrer les voitures d’occasion que je vends ?', a: 'Oui, dans une galerie avec une photo, le modèle, l’année, le kilométrage et le prix. Quand une voiture est vendue, une modification la retire.' },
      { q: 'Faut-il afficher les prix de toutes les réparations ?', a: 'Non. Affichez votre taux horaire et vos forfaits courants. Pour une réparation complexe, le site invite à demander un devis, qui reste la règle.' },
      { q: 'Je fais aussi du dépannage, comment le mettre en avant ?', a: 'Un bouton d’appel bien visible en haut de chaque page, avec vos horaires de dépannage et votre secteur. Sur le bord de la route, personne ne lit un long texte.' },
      { q: 'Combien coûte un site internet pour un garage ?', a: `Le ${ESS.name} se crée pour ${prix} €, puis chaque page de visibilité Google coûte ${prixPage} € si vous voulez mettre une prestation en avant. Le forfait ${mini.name}, à ${eur(mini.month)} € par mois, est sans engagement.` },
    ],
    voir: ['/site-internet-artisan/', '/guides/fiche-google-entreprise/', '/etre-visible-sur-google/'],
  },

  // ------------------------------------------------------------------ producteurs locaux
  {
    slug: 'site-internet-producteur-local',
    nom: 'Producteurs locaux',
    qui: 'Maraîchers, éleveurs, fromagers fermiers, apiculteurs, vignerons, vente à la ferme',
    icon: 'tree-pine',
    color: 'mint',
    title: 'Site internet pour producteur local | Les Minis Monstres',
    description: 'Maraîcher, éleveur, apiculteur : un site internet pour producteur local qui annonce vos jours de vente à la ferme, vos produits de saison et vos marchés.',
    h1: 'Site internet pour producteur local : de votre ferme à la table de vos voisins',
    lead: 'Celui qui veut acheter en direct doit d’abord savoir qu’une ferme vend ses produits à deux villages de chez lui. Nous créons le site internet qui vous rend visible, avec vos produits du moment, vos jours d’ouverture et le chemin jusqu’à la cour.',
    resume: 'Vente à la ferme, saisons, marchés, paniers.',
    besoins: [
      { icon: 'calendar', t: 'Ce qui est de saison', d: 'Fraises en juin, courges à l’automne, miel après la récolte : le client sait quoi venir chercher, et quand.' },
      { icon: 'clock', t: 'Les jours de vente', d: 'Le vendredi à la ferme, le samedi au marché du bourg : chaque rendez-vous avec ses horaires.' },
      { icon: 'map', t: 'Le chemin jusqu’à la ferme', d: 'En campagne, une adresse ne suffit pas toujours. Un plan, un repère, le dernier virage avant la cour.' },
      { icon: 'package', t: 'Réserver son panier', d: 'Une commande passée en avance, prête à récupérer, et moins de produits invendus.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore de ferme parmi nos réalisations. Nous ferions un accueil avec les jours de vente et le produit du moment, une page sur la ferme, la liste des produits avec leurs prix, et le chemin pour venir.',
    },
    options: [
      { id: 'boutique', pourquoi: `Avec l’option ${eco}, vos clients réservent leur panier ou leur colis de viande en ligne, et le récupèrent à la ferme le jour prévu.` },
      { id: 'packseo', pourquoi: 'Une page de plus sur un produit que l’on cherche en direct, comme le miel, les œufs fermiers ou les colis de viande, avec votre secteur. Elle s’ajoute depuis votre espace client.' },
      { id: 'base', pourquoi: 'Une récolte en avance, un marché annulé, la fin des fraises : vous l’écrivez dans votre espace client, et le site suit vos saisons sans vous prendre vos soirées.' },
    ],
    body: `## On vous croise au marché, puis on vous cherche

Un client goûte votre fromage sur le marché, il veut en racheter, mais il a oublié votre nom. Un nouveau voisin cherche « œufs frais » ou « vente directe » près de chez lui. Sans site internet, ces gens ne vous trouvent pas. Avec, ils savent où et quand venir.

## Ce que vos clients ont besoin de savoir

- **Vos produits**, avec leur saison : ce qu’il y a maintenant, ce qui arrive bientôt.
- **Où les acheter** : à la ferme, sur les marchés, dans les magasins de producteurs ou les points de retrait que vous livrez.
- **Quand venir**, jour par jour, et ce qu’il se passe en cas de fermeture exceptionnelle.
- **Comment vous travaillez** : vos bêtes, vos champs, vos méthodes. C’est ce qui donne envie de revenir.

## Les modules du site

L’accueil donne les jours de vente et le produit du moment. La présentation raconte la ferme et ceux qui la font tourner. La galerie montre les champs, les animaux, le magasin. La page services et tarifs liste vos produits avec leurs prix au kilo ou à la pièce, et le contact sert aux commandes particulières.

## Des mots vrais, et des labels justes

!> Le mot « bio » est protégé : seule une production certifiée peut l’employer, avec le logo officiel. Sans certification, nous décrivons vos pratiques telles qu’elles sont, sans raccourci.

Certains mots, comme « fermier », ont aussi leurs règles selon les produits. Nous vérifions avec vous avant de les écrire.

## Les paniers et les colis, sans carnet de commandes

Colis de viande, paniers de légumes, volailles pour les fêtes : ces ventes se préparent à l’avance. Le formulaire de contact peut déjà les recueillir. Avec l’option ${eco}, le client choisit, paie, et indique son jour de retrait. Vous préparez juste ce qui est commandé.

Le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/) détaille le paiement et le retrait.

## Être visible au-delà du canton

Votre [fiche Google](/guides/fiche-google-entreprise/) place la ferme sur la carte, avec vos horaires de vente. Le site, lui, peut viser des recherches précises : « miel de forêt », « colis de bœuf », « cueillette de fraises ». Chacune peut avoir sa page de visibilité Google, à ${prixPage} € la page, en pack si vous en voulez plusieurs.

## Comment on avance ensemble

La commande se fait en ligne. Vous remplissez ensuite un questionnaire précis : vos produits, vos saisons, vos points de vente, vos photos de la ferme. Alex vous appelle pour bien comprendre votre organisation. Alex crée le site, vérifie le tout, puis c’est en ligne. À la saison suivante, le site s’améliore avec vous.

## Le budget

- **Le site** : ${prix} € pour le ${ESS.name}, ou ${prixBoutique} € avec la boutique pour réserver paniers et colis.
- **Ensuite** : le forfait ${AUTO}, sans rien à payer chaque mois, ou le forfait ${mini.name}, ${eur(mini.month)} € par mois, résiliable à tout moment.

Le règlement de la création se fait à la commande, en une fois ou ${EN_FOIS}.`,
    faq: [
      { q: 'Je n’ai pas de magasin, seulement les marchés, un site sert-il ?', a: 'Oui. Il indique vos marchés, jour par jour, et permet à vos clients de vous retrouver d’une semaine à l’autre. C’est aussi là qu’on prend une commande pour le samedi suivant.' },
      { q: 'Mes produits changent chaque semaine, comment tenir le site à jour ?', a: `Gardez une liste simple « en ce moment ». Avec le forfait ${mini.name}, vous la modifiez vous-même, ou vous nous envoyez la nouvelle liste.` },
      { q: 'Puis-je vendre de la viande ou du fromage en ligne ?', a: 'La boutique peut prendre la commande et le paiement, avec un retrait à la ferme. Expédier des produits frais demande une chaîne du froid et des règles sanitaires que vous connaissez mieux que nous. Le retrait reste le plus simple.' },
      { q: 'Combien coûte un site pour vendre à la ferme ?', a: `La création du ${ESS.name} coûte ${prix} €. Pour des réservations payées en ligne, l’option ${eco} ajoute ${prixOption} €. Le forfait ${mini.name}, à ${eur(mini.month)} € par mois, n’est jamais obligatoire.` },
    ],
    voir: ['/site-internet-commercant/', '/guides/creer-boutique-en-ligne/', '/creation-site-internet-ardennes/'],
  },

  // ------------------------------------------------------------------ toiletteurs
  {
    slug: 'site-internet-toiletteur',
    nom: 'Toiletteurs',
    qui: 'Salons de toilettage, toiletteurs à domicile ou en camion, pour chiens et chats',
    icon: 'bath',
    color: 'lilac',
    title: 'Site internet pour toiletteur canin et félin | Les Minis Monstres',
    description: 'Toilettage en salon ou à domicile : un site internet pour toiletteur qui présente vos soins par race et par taille, vos tarifs, et rassure les maîtres inquiets.',
    h1: 'Site internet pour toiletteur : des maîtres rassurés, un agenda bien rempli',
    lead: 'Confier son chien ou son chat à quelqu’un, c’est un vrai pas pour bien des maîtres. Ils veulent voir le salon, comprendre vos soins et connaître le prix pour leur animal. Nous créons le site internet qui leur montre tout cela et vous rend visible dans votre secteur.',
    resume: 'Soins par race, tarifs, photos avant et après.',
    besoins: [
      { icon: 'ruler', t: 'Un tarif selon la taille', d: 'Petit, moyen ou grand chien, chat, poil court ou long : le maître trouve son cas sans appeler.' },
      { icon: 'camera', t: 'Avant et après', d: 'Les photos de vos toilettages montrent votre coup de ciseaux mieux qu’un long discours.' },
      { icon: 'heart', t: 'Le bien-être de l’animal', d: 'Votre façon de manipuler, le temps laissé aux anxieux, l’absence de cage si c’est votre choix : voilà ce qui rassure.' },
      { icon: 'phone-call', t: 'Prendre rendez-vous vite', d: 'Un bouton pour appeler, un formulaire qui demande la race, l’âge et l’état du poil.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore de toiletteur parmi nos réalisations. Nous imaginerions un accueil avec vos horaires, une galerie avant et après, une grille de tarifs par taille et par poil, et une demande de rendez-vous.',
    },
    options: [
      { id: 'packseo', pourquoi: 'Une page de plus pour « toilettage chat », « tonte de caniche » ou « toiletteur à domicile » avec votre ville, ces recherches que font les maîtres. À ajouter depuis votre espace client.' },
      { id: 'specifique', pourquoi: 'Des créneaux réservables en ligne, avec un rappel la veille ? C’est une fonctionnalité particulière : décrivez votre agenda, vous recevez un devis gratuit.' },
      { id: 'boutique', pourquoi: `Avec l’option ${eco}, vos shampoings, brosses et bons cadeaux se vendent aussi en ligne, à retirer au salon.` },
    ],
    body: `## Un nouveau chien, une nouvelle recherche

Un chiot qui arrive, un déménagement, un toiletteur qui part à la retraite : c’est là qu’on tape « toiletteur » avec le nom de sa ville. Le maître regarde les photos, les prix, l’ambiance du salon. Votre site internet, relié à votre fiche Google, lui permet de vous choisir avant même d’avoir poussé la porte.

## Ce que le maître veut savoir

- **Vos prestations** : bain, coupe, tonte, épilation, démêlage, coupe des griffes.
- **Vos prix**, par race ou par taille, avec ce qui peut les faire varier : nœuds, poil feutré, comportement.
- **La durée**, et quand venir rechercher l’animal.
- **Vos conditions** : vaccins à jour, traitement contre les puces, animaux âgés ou craintifs acceptés ou non.

## Les modules qui comptent

La galerie avant et après fait le gros du travail. La présentation dit qui vous êtes et comment vous traitez les animaux. La page services et tarifs pose vos grilles, et les questions fréquentes rassurent sur les premières fois : un chiot, un chat qui griffe, un vieux chien raide des hanches.

## Les photos, avec un peu de méthode

Prenez l’animal sur la table, à la même place, avant et après. Un fond uni et la lumière du jour suffisent. Demandez l’accord du maître avant de publier, et cadrez sur l’animal plutôt que sur son propriétaire.

## À domicile ou en camion

Si vous vous déplacez, la page d’accueil cite les communes desservies et vos jours de passage. Votre [fiche Google](/guides/fiche-google-entreprise/) peut afficher une zone d’intervention, sans adresse publique.

Chaque spécialité peut aussi avoir sa page : le toilettage des chats, les races à poil long, le salon sans cage. Ce sont des pages de visibilité Google, à ${prixPage} € la page, pour être trouvé sur des recherches précises.

## De la commande au site publié

Vous commandez, puis un questionnaire précis vous demande vos prestations, vos grilles de prix et vos meilleures photos. Alex vous appelle pour préciser. Alex crée le site, vérifie chaque page, et c’est en ligne. Une nouvelle prestation plus tard ? Le site s’enrichit quand vous voulez.

## Combien ça coûte

- **La création** : ${prix} € le ${ESS.name}, ou ${prixBoutique} € si vous voulez vendre vos produits de soin en ligne.
- **Ensuite** : le forfait ${AUTO}, à zéro euro par mois, ou le forfait ${mini.name}, ${eur(mini.month)} € par mois, sans engagement.

Vos tarifs changent au premier janvier ? Avec le forfait ${mini.name}, c’est une modification incluse, demandée depuis l’onglet « Mes modifications ».`,
    faq: [
      { q: 'Faut-il afficher tous mes prix, race par race ?', a: 'Une grille par taille et par type de poil suffit, avec un « à partir de ». Précisez ce qui peut augmenter le prix, comme un poil très emmêlé, pour éviter les mauvaises surprises au comptoir.' },
      { q: 'Mon salon refuse les animaux agressifs, puis-je l’écrire ?', a: 'Oui, et c’est même conseillé. Une règle claire, dite avec douceur, évite des rendez-vous difficiles et montre que vous pensez à la sécurité de tous.' },
      { q: 'Je travaille seul et le téléphone sonne pendant les toilettages, une solution ?', a: 'Le formulaire de rendez-vous recueille la demande avec la race et les disponibilités du client. Vous le rappelez entre deux animaux, avec toutes les informations sous les yeux.' },
      { q: 'Combien coûte un site internet pour un salon de toilettage ?', a: `Le ${ESS.name} coûte ${prix} € à la création, et se règle ${EN_FOIS} si vous préférez. Le forfait ${mini.name}, à ${eur(mini.month)} € par mois, s’ajoute seulement si vous voulez qu’on gère le site pour vous.` },
    ],
    voir: ['/site-internet-commercant/', '/guides/fiche-google-entreprise/', '/referencement-seo/'],
  },

  // ------------------------------------------------------------------ services à domicile
  {
    slug: 'site-internet-services-a-domicile',
    nom: 'Services à domicile',
    qui: 'Ménage, repassage, jardinage, petits travaux, aide aux seniors',
    icon: 'toolbox',
    color: 'butter',
    title: 'Site internet pour services à domicile | Les Minis Monstres',
    description: 'Ménage, jardinage, petits travaux : un site internet pour services à domicile qui présente votre zone, vos tarifs et le crédit d’impôt, et rassure les familles.',
    h1: 'Site internet pour services à domicile : la confiance avant la première visite',
    lead: 'Laisser entrer quelqu’un chez soi chaque semaine, ou chez un parent âgé, demande d’être rassuré. Nous créons le site internet qui vous rend visible dans votre secteur et répond aux questions d’une famille avant même son premier appel.',
    resume: 'Zone, tarifs, crédit d’impôt et confiance.',
    besoins: [
      { icon: 'users', t: 'Rassurer les familles', d: 'Votre visage, votre statut, votre assurance, et la même personne à chaque passage si c’est votre façon de faire.' },
      { icon: 'coins', t: 'Le crédit d’impôt expliqué', d: 'Si votre activité est déclarée en services à la personne, le prix réel après crédit d’impôt est écrit clairement.' },
      { icon: 'map-pin', t: 'Votre zone de passage', d: 'Les communes couvertes, en toutes lettres, pour que l’on sache tout de suite si vous venez jusqu’ici.' },
      { icon: 'list-checks', t: 'Ce que vous faites, et ne faites pas', d: 'Ménage, vitres, repassage, tonte, taille de haies, petit bricolage : la liste évite les malentendus.' },
    ],
    exemple: {
      client: null,
      texte: 'Aucune activité de services à domicile ne figure encore parmi nos réalisations. Nous ferions une présentation avec votre photo, une page par service avec le prix après crédit d’impôt, votre zone et un formulaire de contact.',
    },
    options: [
      { id: 'packseo', pourquoi: 'Une page de plus par service que l’on cherche à part, comme le repassage, l’entretien de jardin ou l’aide aux courses, avec votre secteur. Vous la commandez depuis votre espace client, quand le site est en ligne.' },
      { id: 'base', pourquoi: 'Un créneau qui se libère, une commune ajoutée à votre zone : vous l’envoyez depuis votre espace client, et c’est mis à jour pour vous.' },
    ],
    body: `## La recherche vient parfois de loin

Une mère qui ne peut plus tondre, un père qui a besoin d’aide pour le ménage : la recherche vient parfois d’un fils ou d’une fille qui habite à une heure de là. Il tape « aide ménagère » ou « jardinier » avec le nom de la commune de ses parents. Votre site internet doit le rassurer à distance, et vous rendre visible là où il cherche.

## Ce qu’on veut savoir avant d’ouvrir sa porte

- **Qui viendra** : votre prénom, votre photo, votre expérience.
- **Ce que vous faites**, service par service, avec le matériel et les produits fournis ou non.
- **Votre zone**, commune par commune.
- **Vos tarifs à l’heure**, et ce qu’ils deviennent après crédit d’impôt si vous y ouvrez droit.
- **Comment ça se passe** : la première visite, les clés, le remplacement pendant vos congés.

## Le crédit d’impôt, à expliquer simplement

!> Les services à la personne déclarés ouvrent droit à un crédit d’impôt de 50 % des sommes payées, dans la limite de plafonds annuels. Certains travaux, comme le petit bricolage ou le jardinage, ont leurs propres règles. N’annoncez cet avantage que si votre activité est bien déclarée.

Un exemple avec votre propre tarif parle mieux qu’un long paragraphe : une heure facturée tant, soit tant après crédit d’impôt. Nous le calculons avec vous à partir de vos vrais prix. Si vous proposez l’avance immédiate du crédit d’impôt, dites-le : votre client ne paie alors que sa part.

## Les modules à privilégier

La présentation compte plus que tout : on fait entrer une personne, pas une enseigne. La page services et tarifs détaille chaque service. La galerie peut montrer un jardin entretenu ou une haie bien taillée, jamais l’intérieur d’un client sans son accord. Les questions fréquentes répondent à « dois-je être présent ? » ou « qui fournit les produits ? ».

## Visible dans votre secteur

Citez vos communes sur le site, et réglez la même zone sur votre [fiche Google](/guides/fiche-google-entreprise/), sans afficher votre adresse si vous travaillez de chez vous. Une page par service aide ensuite à sortir sur des recherches précises : « repassage à domicile », « entretien de jardin », « aide aux courses ». Ce sont nos pages de visibilité Google, ${prixPage} € chacune.

## Votre site, sans y passer vos soirées

Vous passez commande en ligne. Un questionnaire précis recueille vos services, votre zone, vos tarifs et votre statut. Alex vous appelle pour vérifier les points délicats, comme le crédit d’impôt. Alex crée le site, le vérifie de bout en bout, puis le publie. Il reste améliorable à tout moment.

## Le prix

- **Le site** : ${prix} € la création du ${ESS.name}, réglable en une fois ou ${EN_FOIS}.
- **Ensuite** : le forfait ${AUTO}, si vous préférez être indépendant, ou le forfait ${mini.name}, ${eur(mini.month)} € par mois, pour un site entretenu à votre place.

Avec le forfait ${mini.name}, vos demandes passent par ${B('constructeur').nom}, qui les clarifie avant qu’Alex fasse la modification.`,
    faq: [
      { q: 'Je suis auto-entrepreneur, puis-je proposer le crédit d’impôt ?', a: 'Oui, si votre activité est déclarée comme service à la personne et remplit les conditions prévues. Les démarches sont expliquées sur service-public.fr. Le site n’en parle qu’une fois la déclaration faite.' },
      { q: 'Puis-je regrouper ménage et jardinage sur le même site ?', a: 'Oui. Chaque service a sa partie, avec ses tarifs et ses règles. Une seule adresse, plus simple à retenir pour vos clients.' },
      { q: 'Comment rassurer sans avis clients au départ ?', a: 'Montrez-vous, avec une vraie photo. Indiquez votre statut, votre assurance, votre expérience. Les avis viendront ensuite, sur votre fiche Google, et le site y renverra.' },
      { q: 'Combien coûte un site pour une activité de ménage ou de jardinage ?', a: `Un ${ESS.name} coûte ${prix} € à créer. Le forfait ${mini.name}, à ${eur(mini.month)} € par mois, est facultatif, et une page de visibilité Google par service revient à ${prixPage} €.` },
    ],
    voir: ['/site-internet-artisan/', '/guides/site-internet-auto-entrepreneur/', '/guides/fiche-google-entreprise/'],
  },

  // ------------------------------------------------------------------ traiteurs
  {
    slug: 'site-internet-traiteur',
    nom: 'Traiteurs',
    qui: 'Traiteurs, chefs à domicile, plateaux-repas, buffets et cocktails',
    icon: 'party-popper',
    color: 'peach',
    title: 'Site internet pour traiteur : menus et devis | Les Minis Monstres',
    description: 'Mariage, baptême, repas d’entreprise : un site internet pour traiteur qui présente vos menus, vos prix par personne et recueille des demandes de devis précises.',
    h1: 'Site internet pour traiteur : vos menus en vitrine, des devis bien préparés',
    lead: 'Un mariage, une communion, un départ en retraite : on cherche un traiteur des semaines à l’avance, en comparant menus et prix par personne. Nous créons le site internet qui vous rend visible et fait arriver des demandes avec la date, le nombre de convives et le lieu.',
    resume: 'Menus, prix par personne, demandes de devis.',
    besoins: [
      { icon: 'file-text', t: 'Des menus qui font envie', d: 'Entrées, plats, desserts, buffets froids, cocktails dînatoires : chaque formule avec son prix par personne.' },
      { icon: 'users', t: 'Pour combien de convives', d: 'Le minimum de commande, les grandes tablées, la zone où vous livrez ou servez.' },
      { icon: 'clipboard-check', t: 'Une demande de devis complète', d: 'Date, lieu, nombre de personnes, budget, régimes particuliers : vous chiffrez sans courir après les informations.' },
      { icon: 'package', t: 'Livré ou servi', d: 'Plateaux livrés, buffet à installer, service à table, vaisselle prêtée : le client sait ce qui est compris.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore de traiteur parmi nos réalisations. Nous construirions une page par type de réception, vos menus avec un prix de départ, une galerie de buffets dressés et un formulaire de devis détaillé.',
    },
    options: [
      { id: 'boutique', pourquoi: `Avec l’option ${eco}, vos plateaux-repas et vos menus de fêtes se commandent et se paient en ligne, pour un retrait ou une livraison le jour choisi.` },
      { id: 'packseo', pourquoi: 'Une page de plus pour « traiteur mariage », « buffet d’entreprise » ou un menu de fêtes avec votre région, ces recherches qui précèdent une grosse commande. Commandée depuis votre espace client.' },
    ],
    body: `## Un repas de fête se prépare en ligne

Des futurs mariés, une famille qui organise une communion, une entreprise qui prépare sa soirée de fin d’année : avant d’appeler, ils comparent. Ils veulent des menus, des prix par personne, des photos de buffets. Si votre site internet les leur montre, vous entrez dans la liste. Sinon, vous restez dehors.

## Ce qu’on compare d’un traiteur à l’autre

- **Les formules**, du plateau-repas au menu de mariage, avec un prix par personne.
- **Ce qui est compris** : livraison, mise en place, service, vaisselle, nappage.
- **Le minimum de convives** et le délai pour réserver.
- **Votre zone**, et si vous servez dans les salles des fêtes du secteur.
- **Les régimes particuliers** : végétarien, sans porc, sans gluten, menu enfant.

## Les modules qui vous ressemblent

La galerie montre vos plats et vos buffets dressés, à la lumière du jour. La page services et tarifs détaille vos menus. La présentation parle de votre cuisine : vos produits, vos fournisseurs du coin si c’est vrai, votre parcours. Le contact devient une vraie demande de devis.

## Des devis plus rapides

Le formulaire pose les bonnes questions dès le départ : la date, le lieu, le nombre d’adultes et d’enfants, le budget, les allergies. Vous répondez avec un devis juste, sans trois échanges de messages.

!> Pour chaque plat, vous devez pouvoir informer vos clients des allergènes qu’il contient. Une phrase sur le site rappelle que la liste est disponible sur simple demande, et le formulaire de devis interroge sur les allergies des convives.

## Vendre plateaux et menus de fêtes en ligne

Les repas de Noël, les plateaux du midi pour les bureaux, les buffets du dimanche : ces commandes plus simples peuvent se passer de devis. Avec l’option ${eco}, le client choisit, paie et indique le jour du retrait ou de la livraison. Vous voyez tout de suite combien de parts préparer.

## Être trouvé avant les grandes dates

Les mariages se réservent longtemps à l’avance, les repas de fin d’année dès l’automne. Une page de visibilité Google sur « traiteur mariage » et votre région, une autre sur vos menus de Noël, vous placent sur ces recherches. Elles coûtent ${prixPage} € la page, à commander librement. Votre [fiche Google](/guides/fiche-google-entreprise/) fait le reste, avec vos avis réels.

## De la commande à la mise en ligne

Vous commandez sur notre site. Un questionnaire précis vous fait lister vos formules, vos prix, votre zone et vos photos. Alex vous appelle pour les détails. Alex crée votre site, le vérifie en entier, puis le publie. Votre carte de printemps arrive ? Le site s’améliore à tout moment.

## Combien ça coûte

- **Le site** : ${prix} € pour le ${ESS.name}. Pour la vente en ligne de plateaux et de menus, l’option ${eco} porte la création à ${prixBoutique} €.
- **Ensuite** : le forfait ${AUTO}, sans engagement ni mensualité, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois.

Avec le forfait ${mini.name}, un nouveau menu à afficher se demande depuis votre espace client, et c’est une modification incluse.`,
    faq: [
      { q: 'Dois-je afficher mes prix, alors que chaque devis est différent ?', a: 'Un prix de départ par formule suffit. Il trie les demandes et écarte les budgets trop éloignés de votre cuisine. Le devis détaillé se fait ensuite au cas par cas.' },
      { q: 'Je suis traiteur et je cuisine aussi chez les particuliers, ça se présente comment ?', a: 'Deux parties sur le même site : les réceptions livrées, et le chef à domicile. Chacune avec ses formules et son formulaire.' },
      { q: 'Un acompte peut-il se régler sur le site ?', a: `Oui, avec l’option ${eco} : un article « acompte » se paie en ligne, et le solde se règle selon vos conditions. Sans boutique, vous gardez vos habitudes de paiement.` },
      { q: 'Combien coûte un site internet pour un traiteur ?', a: `Pour un traiteur, le ${ESS.name} coûte ${prix} €, ou ${prixBoutique} € avec la vente en ligne. Le forfait ${mini.name}, à ${eur(mini.month)} € par mois, reste au choix.` },
    ],
    voir: ['/guides/site-internet-restaurant/', '/guides/creer-boutique-en-ligne/', '/tarifs/'],
  },
];

module.exports = { metiers, PUBLIE };
