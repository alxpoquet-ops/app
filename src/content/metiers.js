// Pages « Votre métier » (V2) : une page par métier, à la racine du site (/<slug>/).
// Règles (scripts/check.js) : title de 65 caractères au plus, description de 120 à 160, aucun tiret long
// ni demi-cadratin, aucun point-virgule, aucun prix écrit en dur (tout vient de config.js), aucun client,
// avis ou chiffre inventé, et pas de phrase de 9 mots ou plus reprise d'une autre page.
// Offre du 17 novembre 2026 : le Site Internet Professionnel (creation), une seule option à la commande (la boutique en
// ligne, payée une fois), le Pack SEO commandé plus tard depuis l'espace client, puis un seul abonnement au mois
// (forfaits[0], qui comprend tout : modifications sans limite et une page SEO par semaine) ou la création seule (le code
// du site est remis au client).
// Le prix bas vient de la petite bande d'Alex : ses automatisations, dessinées en petits monstres (config.bande).
// Alex fait chaque site, la bande s'occupe du répétitif et Alex vérifie tout. On ne dit jamais « IA ».
// options : les conseils de la page (« Ce que je vous conseille »). Ids acceptés : 'packseo' (payé une fois, commandé plus
// tard depuis l'espace client : le texte le dit), 'boutique' (option payée une fois, à la commande), 'base' (l'abonnement,
// le seul depuis le 17 novembre 2026 : 'evolution' n'existe plus). Le prix affiché vient de config.js.
// (Le code événement a été retiré le 17 novembre 2026 : un seul champ « code promo ou parrainage » à la commande.)
const { creation, forfaits, options, paiement, lissage, annuel, marche, bande, evenement } = require('../config');
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500

const tranquille = forfaits.find((f) => f.id === 'base') || forfaits[0]; // l'abonnement (Tranquillité), le seul
const prix = eur(creation.prix); // le Site Internet Professionnel
const prixBoutique = eur(creation.prix + creation.boutique); // le site avec l'option boutique en ligne
const packSeo = options.find((o) => o.id === 'packseo' && !o.retire) || { name: 'Pack SEO' }; // commandé plus tard, depuis l'espace client
const pagesComprises = creation.pages; // pages comprises dans le site (celles qui restent deviennent des pages SEO)
const durees = lissage.durees.join(' ou ');
const acompte = `${paiement.acompte} %`;
const marcheVitrine = `${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €`;
const remise = `${evenement.remise} %`; // le code événement, sur la création du site
// La petite bande : prénom et métier (« Bricou, le constructeur »).
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
    description: 'Plombier, électricien, maçon, couvreur : un site clair pour être trouvé dans votre secteur, montrer vos chantiers et recevoir des demandes de devis.',
    h1: 'Site internet pour artisan : vos chantiers en vitrine, vos devis en direct',
    lead: 'Vos futurs clients tapent votre métier et leur commune sur leur téléphone, puis appellent celui qui leur inspire confiance. Je crée le site qui vous fait trouver et qui montre votre travail, puis je m’occupe de tout.',
    resume: 'Vos chantiers en photos, des devis en direct.',
    besoins: [
      { icon: 'map-pin', t: 'Être trouvé dans votre secteur', d: 'Votre métier et les communes où vous intervenez sont écrits noir sur blanc, là où Google et vos clients les cherchent.' },
      { icon: 'camera', t: 'Montrer votre travail', d: 'Des photos de chantiers, avant et après, donnent une idée juste de vos finitions mieux que tous les discours.' },
      { icon: 'phone-call', t: 'Un appel en un geste', d: 'Sur téléphone, un bouton compose votre numéro, et un formulaire de devis recueille les détails du chantier.' },
      { icon: 'shield-check', t: 'Inspirer confiance', d: 'Assurance, qualifications, années de métier : le client sait à qui il ouvre sa porte.' },
    ],
    exemple: {
      client: null,
      texte: 'Je n’ai pas encore d’artisan parmi mes réalisations. Pour vous donner une idée, voici comment je bâtirais le site d’un couvreur : un accueil avec sa zone et son numéro, une page par prestation (toiture neuve, réparation, zinguerie, démoussage), une galerie de chantiers et un formulaire de devis.',
    },
    options: [
      { id: 'packseo', pourquoi: 'Dix pages de plus, chacune sur un travail précis que l’on tape sur Google, comme le démoussage d’un toit ou la pose d’une fenêtre de toit. À ajouter plus tard, depuis votre espace client.' },
      { id: 'base', pourquoi: 'Un tarif qui change ou une photo de chantier à ajouter : vous l’envoyez depuis le chantier, et je m’en occupe.' },
    ],
    body: `## Ce que votre client veut savoir en trente secondes

Un particulier qui cherche un artisan a presque toujours un projet ou un souci concret : une fuite, un disjoncteur qui saute, une façade à repeindre, un jardin à repenser. Il compare deux ou trois noms sur son téléphone, parfois depuis son canapé, parfois les pieds dans l’eau. Votre site doit lui répondre vite :

- **Ce que vous faites**, avec les mots qu’il emploie : dépannage, rénovation, pose, entretien.
- **Où vous intervenez** : votre commune et celles d’à côté, citées en toutes lettres.
- **À quoi ressemble votre travail** : quelques photos de vrais chantiers.
- **Comment vous joindre** : un numéro qui s’appelle d’un doigt et une demande de devis en ligne.

Le reste vient ensuite. Un site d’artisan n’a pas besoin d’être long. Il doit être clair, et à jour.

## Rassurer avant le premier appel

Faire entrer quelqu’un chez soi demande de la confiance. Votre site peut lever les doutes avant même que le téléphone sonne. Montrez votre visage et votre nom, vos années de métier, vos qualifications (RGE, par exemple, si vous l’avez) et votre assurance décennale si votre activité y est soumise.

Pour le dépannage, affichez votre taux horaire et vos frais de déplacement. Le client sait à quoi s’attendre, et la réglementation vous demande de toute façon de les annoncer avant d’intervenir.

Les photos de chantiers restent votre meilleur argument. Prenez l’habitude de photographier avant et après, même au téléphone. Trois vraies photos d’une salle de bain refaite parlent plus qu’une image de catalogue.

!> Ne publiez que des avis réels. Si vos clients sont contents, invitez-les à le dire sur votre fiche Google, et le site renvoie vers ces avis.

## Une page par prestation

Si vous faites un seul métier, quelques pages bien construites suffisent pour démarrer. Si vous proposez plusieurs prestations, par exemple plomberie, chauffage et salle de bain clé en main, chacune mérite sa page. Celui qui cherche « installation pompe à chaleur » tombe alors sur la page qui en parle, et pas sur un texte fourre-tout. Le guide [une page ou un site vitrine](/guides/site-une-page-ou-site-vitrine/) vous aide à trancher.

La place ne manque pas : le site compte jusqu’à ${pagesComprises} pages. Celles qui ne servent pas à vos prestations deviennent des pages SEO, c’est-à-dire des pages écrites pour vous faire trouver sur Google, sur des recherches comme « recherche de fuite » ou « remplacement de ballon d’eau chaude » dans votre secteur.

Pour être trouvé autour de chez vous, le site fait équipe avec votre [fiche Google](/guides/fiche-google-entreprise/). La fiche vous place sur la carte, le site achève de convaincre. Les deux doivent afficher exactement les mêmes coordonnées.

## Vous êtes sur les chantiers, je m’occupe du site

Vous n’avez ni le temps ni l’envie de gérer un site le soir, et c’est normal. Je rédige les textes avec vous après un court échange, je prépare la mise en page et je mets tout en ligne.

Plus tard, un tarif change ou une nouvelle photo arrive ? Envoyez le changement depuis votre téléphone, dans votre espace client, votre page privée sur mon site. ${qui('bricoleur')} de ma petite bande, prépare la modification, je la vérifie, et elle est en ligne en ${tranquille.delai} en moyenne. C’est compris dans votre abonnement, sans limite.

Pour aller vite sans bâcler, j’ai programmé cette petite bande de monstres : ils s’occupent de tout ce qui se répète d’un site à l’autre. Je garde pour moi la conception, puis la relecture de chaque page avant sa mise en ligne. C’est ce qui garde des délais courts et un prix doux.

## Combien ça coûte

Un site vitrine de ${marche.pagesCompare} pages avec référencement, confié à un indépendant, se paie en général entre ${marcheVitrine}. Le mien revient ${marche.fois} fois moins cher, sans rien enlever à l’essentiel : je gagne du temps sur la technique, jamais sur la relecture.

La création coûte ${prix} €, pour ${pagesComprises} pages au plus. Vous versez ${acompte} à la commande, puis le reste à la réception, d’un coup ou en ${durees} fois sans frais. Avec l’abonnement, à ${eur(tranquille.month)} € par mois et sans engagement, le nom de domaine, l’adresse de votre site, et l’hébergement, qui le garde accessible jour et nuit, sont offerts la première année, sauf avec la boutique en ligne. L’abonnement prend ensuite le relais avec vos modifications. Tout est détaillé sur la page [tarifs](/tarifs/).`,
    faq: [
      { q: 'Combien coûte un site internet pour un artisan ?', a: `La création coûte ${prix} €, que votre site compte une seule page ou ${pagesComprises}. Ensuite, l’abonnement, à ${eur(tranquille.month)} € par mois, garde le site en ligne, entretenu et à jour. Vous connaissez le total avant de commander.` },
      { q: 'Je travaille sur une grande zone, comment être trouvé partout ?', a: 'Citez les principales communes où vous intervenez, sans en aligner des dizaines. Une liste honnête sur le site, et une zone d’intervention bien réglée sur votre fiche Google, valent mieux qu’une page par village.' },
      { q: 'Je n’ai presque pas de photos de chantier, est-ce un problème ?', a: 'Non. On démarre avec ce que vous avez, même deux clichés pris au téléphone. Le site s’étoffe ensuite chantier après chantier : vous m’envoyez les photos, je les ajoute.' },
      { q: 'J’ai déjà un vieux site, faut-il tout recommencer ?', a: 'Le nouveau site est fait à neuf, mais rien n’est perdu : vos textes et vos photos servent de base. Si vous avez déjà un nom de domaine, vous le gardez, et je le relie au nouveau site.' },
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
    description: 'Sophrologue, naturopathe, magnétiseur, réflexologue : un site sobre qui présente votre pratique, vos séances et vos tarifs, avec des mots justes et prudents.',
    h1: 'Site internet pour thérapeute : donner envie d’oser le premier rendez-vous',
    lead: 'Avant de réserver, on veut savoir à qui l’on va parler et comment se passe une séance. Je crée un site sobre et chaleureux qui répond à ces questions, avec des mots justes et prudents.',
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
      { id: 'base', pourquoi: 'Une nouvelle page de conseils chaque semaine, préparée par ma petite bande et relue par moi : votre site gagne des lecteurs sans que vous ayez à écrire.' },
      { id: 'packseo', pourquoi: 'Dix pages de plus d’un coup, chacune sur une question que l’on se pose avant de consulter pour la première fois. Il se commande après coup, dans votre espace client.' },
    ],
    body: `## Ce qui aide à franchir le pas

Les personnes qui cherchent un sophrologue, un naturopathe ou un magnétiseur hésitent souvent longtemps. Elles ne savent pas toujours ce qu’elles vont trouver, ni si elles oseront se confier. Votre site les accueille avant vous.

Trois choses comptent plus que tout le reste :

- **Votre présence** : une photo naturelle, votre prénom, quelques lignes sur votre parcours et vos formations.
- **Le déroulé d’une séance** : sa durée, ce qui s’y passe, ce qu’il faut prévoir, son prix.
- **Un contact sans pression** : un formulaire, un bouton d’appel, ou un lien vers l’outil de réservation que vous utilisez déjà.

Précisez enfin où vous recevez : un cabinet, votre domicile, ou à distance. Un mot sur le stationnement ou l’étage évite une arrivée stressée, et montre déjà l’attention que vous portez aux personnes.

## Des mots justes, et prudents

Dans votre domaine, chaque mot compte double. Un site honnête rassure bien plus qu’un site qui promet monts et merveilles.

!> Ne promettez jamais de guérir, et ne laissez pas croire que vos séances remplacent un médecin ou un traitement. Écrivez plutôt que vous accompagnez en complément d’un suivi médical, jamais à sa place.

Voici les repères que j’applique quand j’écris vos textes avec vous :

- Parlez de **détente, d’accompagnement, de mieux-être**, plutôt que de soin ou de résultat.
- Évitez le vocabulaire médical : pas de « patients », pas de « diagnostic », pas de liste de maladies.
- Utilisez le nom exact de votre formation. Certains titres sont protégés par la loi, comme celui de psychothérapeute.
- Écartez les témoignages du genre « j’ai été guéri ». Un avis réel qui raconte l’accueil et le ressenti suffit largement.

## Une page, ou une page par pratique

Pour une seule pratique, une page bien construite fait l’affaire : présentation, séance, tarifs, accès, contact. Avec plusieurs pratiques, sophrologie et ateliers de relaxation par exemple, chacune peut avoir sa page. Quelqu’un qui tape « réflexologie plantaire » et le nom de sa ville tombe alors sur la page qui en parle vraiment.

Les pages de conseils sont une autre piste, à petits pas. Comment se passe une première séance de réflexologie, trois exercices de respiration à faire chez soi : chaque page répond à une vraie question et ouvre une porte de plus vers vous. On les appelle des pages SEO, car elles aident votre site à être trouvé sur Google. Sur les ${pagesComprises} pages comprises, celles que vous n’utilisez pas peuvent servir à cela. C’est le choix fait pour le site d’un magnétiseur que vous pouvez découvrir parmi mes [réalisations](/realisations/).

## Vous accompagnez, je m’occupe du site

Vous n’avez pas à écrire seul. Racontez-moi votre pratique avec vos mots, au téléphone ou par écrit. Je conçois la mise en page, et ${qui('ecrivain')} de ma petite bande, met vos notes en forme. Les délais raccourcissent, et la facture s’allège d’autant. Je relis ensuite chaque phrase avec vous, surtout les plus délicates. Rien ne part en ligne sans votre accord.

## Le prix

La création coûte ${prix} €, pour une seule page comme pour une page par pratique, jusqu’à ${pagesComprises} pages. Vous avez déjà un agenda en ligne ? Un bouton du site y mène, sans rien payer de plus.

Ensuite, l’abonnement, à ${eur(tranquille.month)} € par mois et sans engagement, garde votre site en ligne et à jour. Vos horaires ou vos tarifs bougent ? Vous le demandez, et c’est fait : les modifications sont comprises, sans limite. L’abonnement est présenté sur la page [tarifs](/tarifs/).`,
    faq: [
      { q: 'Ai-je le droit de parler des bienfaits de ma pratique ?', a: 'Oui, avec mesure. Décrivez ce que la personne peut ressentir, la détente, un moment pour soi, sans annoncer de résultat sur une maladie. Si une phrase vous fait douter, je vous en propose une version plus prudente.' },
      { q: 'Dois-je afficher le prix de mes séances ?', a: 'Je vous le conseille. Quelqu’un qui hésite déjà n’osera pas écrire pour demander combien ça coûte. Le prix et la durée de chaque séance, bien visibles, enlèvent ce frein.' },
      { q: 'Je reçois chez moi et je ne veux pas montrer mon adresse, comment faire ?', a: 'Le site peut afficher seulement votre commune et votre secteur. Vous donnez l’adresse exacte au moment de confirmer le rendez-vous.' },
      { q: 'Magnétiseur ou barreur de feu, ma pratique a-t-elle sa place sur internet ?', a: 'Oui. Beaucoup de gens vous découvrent par le bouche-à-oreille, puis cherchent votre nom en ligne avant d’appeler. Une page claire, qui dit ce que vous faites et ce que vous ne faites pas, leur permet de vous trouver et de vous joindre.' },
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
    description: 'Créateur, artiste, photographe, illustrateur : une galerie soignée pour montrer votre travail et, si vous le souhaitez, une boutique pour le vendre en ligne.',
    h1: 'Site internet pour créateur et artiste : montrer votre travail, et le vendre',
    lead: 'Vos créations méritent mieux qu’un fil de publications qui défile puis disparaît. Je crée un site à votre image, avec une galerie soignée et, si vous le voulez, une boutique où l’on achète en quelques clics.',
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
      { id: 'boutique', pourquoi: 'Vos pièces se choisissent, se paient en ligne et partent vers leur acheteur, même quand l’atelier est fermé.' },
      { id: 'packseo', pourquoi: 'Dix pages de plus sur vos techniques et vos matières, là où les amateurs commencent leurs recherches. Vous le demandez une fois le site lancé.' },
    ],
    body: `## Votre travail d’abord

Pour un créateur ou un artiste, le site est une galerie avant d’être un magasin. Celui qui arrive chez vous veut voir. La mise en page doit donc s’effacer derrière vos images : de grandes photos, un fond calme, un classement simple par série, par collection ou par technique.

Chaque pièce peut avoir sa fiche, avec un titre, ses dimensions, sa matière et quelques lignes sur sa fabrication. Ces mots servent deux fois. Ils renseignent l’acheteur, et ils aident Google à comprendre ce que vous faites. Un « vase en grès émaillé fait main » se trouve bien plus facilement qu’une « création numéro 12 ».

Pas besoin d’un studio pour de belles images. Une grande fenêtre, un fond uni, la lumière du matin et un téléphone récent suffisent souvent. Montrez la pièce entière, puis un détail de la matière, puis la pièce en situation, posée sur une table ou accrochée au mur.

Vous exposez sur des salons ou des marchés de créateurs ? Une petite page d’agenda dit où l’on peut voir votre travail en vrai.

## Raconter qui vous êtes

On achète une pièce d’artisan d’art ou un tirage photo aussi pour la personne qui l’a faite. Votre page de présentation compte autant que la galerie. Parlez de votre atelier, de vos matières, de votre parcours, de ce qui vous inspire. Une photo de vos mains au travail touche souvent plus qu’un portrait posé.

Photographes et illustrateurs, dites aussi ce que vous proposez concrètement : reportages, portraits, tirages, illustrations pour l’édition ou pour des marques. Précisez enfin comment vos images peuvent être utilisées, et à quelles conditions.

## Une galerie, ou une galerie et une boutique

Deux possibilités, selon votre façon de vendre :

- **La galerie seule**, si vous vendez à l’atelier, sur les salons ou sur commande. Le site montre votre travail, et un formulaire reçoit les demandes.
- **La galerie et la boutique**, si vous voulez vendre en ligne. Vos clients choisissent, paient par carte, et vous recevez la commande par e-mail.

Avec la boutique arrive ${qui('vendeur')} de ma petite bande : c’est lui qui tient le catalogue à jour, garde un œil sur chaque commande et prévient vos acheteurs par e-mail.

La boutique est livrée avec un modèle de conditions de vente que nous complétons ensemble, avec vos frais d’envoi et vos délais de fabrication.

!> Une pièce faite sur mesure ou personnalisée à la demande du client échappe au droit de rétractation de 14 jours. Pour vos pièces déjà prêtes, ce droit s’applique. Vos conditions de vente doivent le dire clairement.

Le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/) détaille chaque étape, de la photo jusqu’au colis.

## Vous créez, je m’occupe du reste

Vous m’envoyez vos photos et quelques notes sur chaque pièce. La partie répétitive revient à ma bande de petits monstres : les fiches se préparent à partir de vos notes, en bien moins de temps qu’à la main. Je reprends ensuite chaque texte pour qu’il sonne comme vous, et je vérifie chaque page avant la mise en ligne.

Côté prix, la création coûte ${prix} € pour la galerie, et ${prixBoutique} € avec la boutique. Vous réglez ${acompte} en commandant, puis le solde à la réception, en une fois ou en ${durees} fois sans frais. Ensuite, l’abonnement garde le site en ligne et à jour pour ${eur(tranquille.month)} € par mois, sans engagement, avec une copie de sécurité faite régulièrement. Une nouvelle collection à ajouter ? Envoyez-la-moi : c’est une modification, comprise dans votre abonnement.`,
    faq: [
      { q: 'Faut-il un statut pour vendre ses créations en ligne ?', a: 'Oui, dès que vous vendez de façon régulière. La micro-entreprise est la solution la plus courante pour démarrer. Les artistes auteurs ont un régime à part : renseignez-vous auprès de l’Urssaf avant d’ouvrir la boutique.' },
      { q: 'Mes photos sont-elles protégées une fois en ligne ?', a: 'Vos œuvres et vos photos restent à vous : le droit d’auteur s’applique sans aucune démarche. Je publie des images assez grandes pour être belles à l’écran, sans mettre en ligne vos fichiers en pleine qualité.' },
      { q: 'Je vends déjà sur une place de marché, un site est-il utile ?', a: 'Oui, les deux se complètent. La place de marché amène du passage. Votre site, lui, porte votre nom, sans concurrent affiché à côté, et vous y renvoyez depuis vos cartes, vos salons et vos réseaux.' },
      { q: 'Combien coûte un site avec boutique pour un créateur ?', a: `La création coûte ${prixBoutique} € avec la boutique : ${prix} € pour le site, et ${eur(creation.boutique)} € pour le panier, le paiement en ligne et le suivi des commandes. L’abonnement ne change pas avec la boutique : ${eur(tranquille.month)} € par mois.` },
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
    description: 'Gîte, chambre d’hôtes, location de vacances : un site avec vos photos, vos tarifs, l’accès et les environs, pour recevoir des réservations en direct.',
    h1: 'Site internet pour gîte et chambre d’hôtes : vos réservations en direct',
    lead: 'Beaucoup de voyageurs cherchent le nom d’un gîte repéré ailleurs avant de réserver. Je crée le site qui les accueille : de belles photos, des tarifs clairs, l’accès, et une demande de séjour qui arrive chez vous, sans commission.',
    resume: 'Réservations en direct, photos, accès et environs.',
    besoins: [
      { icon: 'calendar-days', t: 'Réserver en direct', d: 'La demande de séjour arrive dans votre boîte mail, sans commission à reverser.' },
      { icon: 'camera', t: 'Des photos qui donnent envie', d: 'Chaque chambre, la cuisine, le jardin, la vue : le voyageur fait la visite avant de venir.' },
      { icon: 'tree-pine', t: 'Être trouvé par les voyageurs', d: 'Des pages sur les balades et les visites du coin attirent ceux qui préparent leur séjour.' },
      { icon: 'route', t: 'Un accès sans détour', d: 'Plan, itinéraire, gare la plus proche, heure d’arrivée : vos hôtes arrivent sans vous appeler en route.' },
    ],
    exemple: {
      client: null,
      texte: 'Aucun hébergement ne figure encore parmi mes réalisations. Pour des chambres d’hôtes, je proposerais un accueil avec la plus belle photo, une page pour les chambres et leurs tarifs, une page sur les environs, puis l’accès et une demande de séjour.',
    },
    options: [
      { id: 'packseo', pourquoi: 'Dix pages sur la région, ses randonnées et ses visites, pour croiser la route des voyageurs qui préparent leurs vacances. Il s’ajoute quand vous voulez, depuis votre espace client.' },
      { id: 'base', pourquoi: 'Vos tarifs de saison sont mis à jour sans compter, et une page sur les environs s’ajoute chaque semaine.' },
    ],
    body: `## Ce que le voyageur regarde avant de réserver

Un voyageur qui hésite entre deux gîtes se pose toujours les mêmes questions. Est-ce aussi joli qu’on le dit ? Combien de couchages, et comment sont-ils répartis ? Combien pour une semaine en août ? Est-ce facile à trouver ? Votre site répond à chacune, sans qu’il ait besoin de vous écrire.

- **Les photos**, lumineuses, pièce par pièce, avec l’extérieur et la vue. C’est ce que l’on regarde en premier.
- **La capacité et l’équipement** : chambres, lits, salle d’eau, cuisine, connexion internet, animaux acceptés ou non.
- **Les tarifs par saison**, en précisant ce qui est compris : draps, ménage, taxe de séjour.
- **L’accès** : un plan, la route depuis la gare ou l’autoroute, les heures d’arrivée et de départ.
- **Les environs** : randonnées, sites à visiter, marchés, bonnes tables. Ces mots aident aussi Google à vous situer.

Pour les photos, choisissez une journée lumineuse, faites les lits, ouvrez les volets et rangez les objets du quotidien. Une photo par pièce, prise depuis la porte, montre l’espace tel qu’il est, sans décevoir personne à l’arrivée.

## Réserver en direct, sans commission

Les plateformes de réservation apportent des voyageurs, mais elles gardent une part de chaque séjour. Votre site ne les remplace pas forcément. Il ouvre une autre porte, à votre nom, pour les habitués, pour ceux à qui l’on vous a recommandé, et pour ceux qui cherchent directement le nom de votre maison.

Concrètement, le voyageur remplit une demande de séjour : ses dates, le nombre de personnes, un message. Elle arrive dans votre boîte mail, vous regardez votre planning et vous confirmez, avec vos conditions d’acompte. Si vous tenez déjà un calendrier de réservation en ligne, le site peut aussi y mener.

> Glissez l’adresse de votre site dans votre message de bienvenue et dans votre livret d’accueil. Vos hôtes contents sauront où vous retrouver l’an prochain, sans passer par un intermédiaire.

## Être trouvé par ceux qui préparent leur séjour

Avant de choisir où dormir, beaucoup de voyageurs cherchent d’abord une région, une randonnée, un lieu à visiter. Votre site compte jusqu’à ${pagesComprises} pages, et celles qui ne servent pas à vos chambres deviennent des pages SEO, des pages écrites pour être trouvé sur Google. Une sur la boucle de randonnée qui part de chez vous, une sur le marché du dimanche, une sur le château voisin. ${qui('etoile')} de ma petite bande, les prépare, et je les relis.

## Les avis et les règles à respecter

Dans le tourisme, les avis pèsent lourd. Publiez seulement de vrais commentaires de vos hôtes, avec leur accord, ou renvoyez vers votre [fiche Google](/guides/fiche-google-entreprise/), où chacun peut en laisser librement. Cette fiche vous place aussi sur la carte quand quelqu’un cherche où dormir dans le coin.

!> Les locations de vacances et les chambres d’hôtes se déclarent en mairie. Si vous avez reçu un numéro d’enregistrement, il doit apparaître sur vos annonces, et votre site en est une : je l’y ajoute.

## Le prix, et qui s’en occupe

La création coûte ${prix} €, avec jusqu’à ${pagesComprises} pages comprises. L’accueil, les chambres, les environs, les tarifs et le contact avec l’accès y tiennent sans peine. Il reste même de la place pour donner sa page à chaque gîte ou à chaque chambre, avec ses photos, sa capacité et ses prix.

Ensuite, l’abonnement au mois, sans engagement, garde le site en ligne et à jour. Le nom de domaine, c’est-à-dire l’adresse du site, et l’hébergement, l’endroit où il reste accessible jour et nuit, sont offerts la première année (pas avec la boutique en ligne), puis pris en charge par l’abonnement. Un tarif d’été ou une date de fermeture ? Vous le demandez, ${B('bricoleur').nom} le prépare, je vérifie, et c’est en ligne. Les modifications sont comprises, sans limite.`,
    faq: [
      { q: 'Le site peut-il afficher mes disponibilités ?', a: 'Si vous tenez déjà un calendrier en ligne, le site peut y renvoyer. Sinon, la demande de séjour suffit souvent : vous gardez la main sur votre planning et vous confirmez chaque réservation vous-même.' },
      { q: 'J’ai deux gîtes sur le même terrain, faut-il deux sites ?', a: 'Non. Un seul site présente les deux, chacun sur sa page, avec ses photos et ses tarifs. Le voyageur compare d’un coup d’œil, et vous n’avez qu’un abonnement.' },
      { q: 'Combien coûte un site pour un gîte ?', a: `La création coûte ${prix} €, jusqu’à ${pagesComprises} pages. Ensuite, l’abonnement est à ${eur(tranquille.month)} € par mois, sans engagement, et le site peut se régler en ${durees} fois sans frais.` },
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
    description: 'Horaires à jour, fiche Google, vitrine de vos produits et, si vous le voulez, boutique en ligne avec retrait en magasin : un site simple pour votre commerce.',
    h1: 'Site internet pour commerçant : votre vitrine ouverte jour et nuit',
    lead: 'Avant de passer la porte, vos clients vérifient vos horaires et regardent ce que vous vendez, depuis leur téléphone. Je crée un site qui leur répond sans détour, et je le tiens à jour pour vous.',
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
      { id: 'boutique', pourquoi: 'Vos clients commandent le soir ou le dimanche, paient en ligne et passent prendre leurs achats au comptoir.' },
      { id: 'base', pourquoi: `Une fermeture imprévue ou une promotion de dernière minute est en ligne en ${tranquille.delai} en moyenne, sans supplément.` },
    ],
    body: `## Ce que vos clients vérifient avant de venir

Un client qui pense à votre commerce part rarement sans vérifier. Il tape votre nom, ou « fromagerie » et sa ville, et regarde trois choses : êtes-vous ouvert, où êtes-vous, et qu’est-ce qu’on trouve chez vous ? Si la réponse est floue, il ira chez celui qui affiche tout clairement.

Votre site doit donc montrer, dès l’écran d’accueil :

- **Vos horaires**, avec les jours fériés, les congés et les éventuelles nocturnes.
- **Votre adresse**, avec un bouton qui ouvre l’itinéraire et une indication pour se garer.
- **Ce que vous vendez**, en vrais mots : pain au levain, fromages fermiers, vins de la région, bouquets de saison.
- **Votre numéro**, pour mettre un produit de côté ou poser une question.

Ajoutez deux ou trois photos de la devanture et de l’intérieur. On vous reconnaît plus facilement en arrivant dans la rue, et l’on se sent un peu chez vous avant d’entrer.

## Le site et la fiche Google, ensemble

Pour un commerce de proximité, la [fiche Google](/guides/fiche-google-entreprise/) est souvent ce qu’on voit en premier : la carte, les horaires, les photos, les avis. Le site prend le relais pour raconter votre histoire, présenter vos produits et vos fournisseurs, et donner envie de passer. Le nom, l’adresse, le téléphone et les horaires doivent être identiques des deux côtés. Je fais cette vérification avec vous au moment de la mise en ligne.

## Vendre en ligne, retirer en magasin

Vendre en ligne n’a rien d’obligatoire. Un site qui montre vos rayons, vos arrivages et vos spécialités donne déjà une bonne raison de passer.

Pour aller plus loin, l’option boutique en ligne, à ${eur(creation.boutique)} € payés une fois, permet à vos clients de commander à toute heure. Ils paient sur le site, puis choisissent la livraison ou le retrait au magasin. Le retrait évite les frais de port, et votre client en profite parfois pour découvrir autre chose dans vos rayons. Pour un producteur, c’est aussi une façon simple de prendre les commandes de paniers ou de colis, sans noter chaque demande au téléphone.

Commencez petit, avec vos produits les plus demandés, ceux qui se gardent et se transportent bien. ${qui('vendeur')} de ma petite bande, s’occupe ensuite du catalogue et des commandes. Le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/) explique le paiement, la livraison et les règles de vente.

## Un site qui suit la vie du magasin

Un commerce bouge tout le temps : les horaires d’été, la fermeture d’une semaine en août, la nouvelle gamme, le marché de Noël. Un site qui affiche encore les horaires de l’an dernier déçoit, et le client ne revient pas forcément.

Avec votre abonnement, ces changements ne vous demandent qu’un message dans votre espace client, la page privée où vous suivez votre site. Ce sont des modifications, comprises sans limite : ${B('bricoleur').nom} les prépare, je les vérifie, et elles sont en ligne en ${tranquille.delai} en moyenne.

## Combien ça coûte

La création coûte ${prix} € pour un site sans boutique, jusqu’à ${pagesComprises} pages, et ${prixBoutique} € avec la boutique en ligne. Pour comparer, un site de ce genre fait par un indépendant demande souvent entre ${marcheVitrine}. Vous versez ${acompte} à la commande et le reste à la réception, en une fois ou en ${durees} mensualités sans frais. L’abonnement est détaillé sur la page [tarifs](/tarifs/).`,
    faq: [
      { q: 'J’ai déjà une page sur les réseaux sociaux, ai-je besoin d’un site ?', a: 'Les deux se complètent. Sur les réseaux, vos horaires et vos produits se noient vite sous les publications, et tout le monde n’y a pas de compte. Le site garde l’essentiel au même endroit, à votre nom.' },
      { q: 'Comment fonctionne le retrait en magasin ?', a: 'Le client choisit ses produits, paie en ligne et coche le retrait au moment de valider. Vous recevez la commande par e-mail, vous la préparez, et il passe la prendre aux horaires que vous avez fixés.' },
      { q: 'Je suis producteur et je vends à la ferme, un site m’est-il utile ?', a: 'Oui. Le site indique vos jours de vente, vos produits de saison et le chemin jusqu’à la ferme. Avec la boutique, vos clients peuvent même réserver leur panier à l’avance, et vous savez combien en préparer.' },
      { q: 'Le stock du magasin et celui du site sont-ils liés ?', a: 'Pas automatiquement. La boutique suit les commandes passées en ligne, mais elle ne voit pas vos ventes au comptoir. Quand un produit vient à manquer, signalez-le dans votre espace client, et il est marqué épuisé sur le site : c’est une modification comprise.' },
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
    description: 'Club, comité des fêtes, association de quartier : un site clair pour annoncer vos dates, accueillir adhérents et bénévoles, avec un budget facile à voter.',
    h1: 'Site internet pour association : faire connaître vos activités sans vider la caisse',
    lead: 'Pour qu’on vous rejoigne, il faut d’abord savoir que vous existez. Je crée un site simple qui dit ce que vous faites, quand et où, et qui ne dépend d’aucun bénévole en particulier.',
    resume: 'Agenda, adhésions, bénévoles, avec un petit budget.',
    besoins: [
      { icon: 'calendar', t: 'Un agenda toujours à jour', d: 'Assemblée générale, tournoi, brocante, répétition : les dates sont au même endroit pour tout le monde.' },
      { icon: 'user-check', t: 'Des adhésions plus simples', d: 'Tarifs, bulletin à télécharger ou lien vers votre outil d’inscription : rejoindre l’association devient facile.' },
      { icon: 'heart-handshake', t: 'Trouver des bénévoles', d: 'Une page dit clairement où vous avez besoin de bras et comment proposer son aide.' },
      { icon: 'piggy-bank', t: 'Un budget facile à voter', d: 'Un prix de création connu d’avance et un petit abonnement au mois, sans surprise pour le trésorier.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore d’association parmi mes réalisations. Pour un comité des fêtes, je proposerais une seule page : qui vous êtes, l’agenda de l’année, les photos de la dernière fête, comment devenir bénévole, et un formulaire qui arrive dans la boîte de l’association.',
    },
    options: [
      { id: 'base', pourquoi: 'L’abonnement fait vivre le site sans effort pour le bureau, et chaque date de l’agenda est mise à jour sans compter.' },
    ],
    body: `## Ce qu’un futur membre cherche

Quelqu’un qui découvre votre association, sur une affiche, au forum de rentrée ou par un voisin, va presque toujours vérifier en ligne. Il veut comprendre en une minute :

- **Ce que vous faites**, et pour qui : enfants, adultes, familles, débutants ou confirmés.
- **Quand et où** : les jours, les horaires, la salle, la saison.
- **Combien coûte l’adhésion**, et comment s’inscrire.
- **Qui contacter**, sans exposer le numéro personnel d’un membre du bureau.

Ajoutez des photos de vos activités. Demandez l’accord des personnes que l’on reconnaît, et celui des parents quand il s’agit d’enfants.

## L’agenda, le cœur du site

Pour une association, la rubrique des dates est souvent la plus consultée. Tournoi, concert, sortie, assemblée générale, permanence : tout ce qui se prépare est réuni au même endroit, dans l’ordre. Vous m’envoyez la date, le lieu et une ligne de présentation, et c’est en ligne.

Après chaque événement, deux lignes de bilan et quelques photos montrent que l’association est bien vivante. C’est aussi ce que regardent un nouveau partenaire, un commerçant qui hésite à sponsoriser votre tournoi ou la mairie qui étudie votre demande de salle.

Ces annonces aident aussi à être trouvé. Quelqu’un qui cherche « brocante » et le nom de votre village, ou « cours de théâtre enfants » près de chez lui, peut tomber sur votre page.

## Adhésions et bénévoles

Vous encaissez déjà les cotisations avec un outil en ligne ? Un bouton du site y mène directement. Sinon, un bulletin à imprimer et un formulaire de contact font très bien l’affaire.

Pour les bénévoles, une page dédiée change beaucoup de choses. Dites précisément ce dont vous avez besoin : tenir la buvette deux heures, aider au montage, encadrer une sortie. Une demande précise et limitée dans le temps rassure ceux qui n’osent pas s’engager pour toute l’année.

## Un site qui ne repose sur personne

C’est le problème classique : le membre qui avait fait le site s’en va, et plus personne ne sait le modifier. Ici, le site ne dépend d’aucun bénévole. Le président, la secrétaire ou le nouveau trésorier envoie sa demande depuis l’espace client, une page privée réservée à l’association, et je m’en occupe. Quand le bureau change, il suffit de transmettre l’accès.

Une date, un horaire, le bilan de la dernière fête : chaque changement est une modification comprise dans l’abonnement, sans limite. ${qui('organisateur')} de ma petite bande, garde l’agenda dans l’ordre, et je vérifie chaque mise à jour avant sa publication.

## Un budget qui se vote

- **La création** : ${prix} €, avec ${acompte} à la commande et le reste à la réception, ou étalé sur ${durees} mois sans frais.
- **L’abonnement** : ${eur(tranquille.month)} € par mois, ou ${eur(tranquille.month * (12 - annuel.moisOfferts))} € à l’année avec ${annuel.moisOfferts} mois offerts, sans engagement. Il couvre l’hébergement (l’endroit où le site reste accessible 24 h/24), son adresse, des copies de sécurité régulières, son entretien technique, vos modifications et une nouvelle page pour Google chaque semaine.

Pour la plupart des associations, une page suffit, sans aucune option. Si vous avez plusieurs sections, comme le foot, la gym et la randonnée, chacune peut avoir sa page, sans changer le prix de création jusqu’à ${pagesComprises} pages. Une adresse de site au nom de l’association, ce qu’on appelle un nom de domaine, fait aussi sérieux sur un dossier de subvention : le guide pour [choisir un nom de domaine](/guides/choisir-nom-de-domaine/) vous aide à le trouver.`,
    faq: [
      { q: 'Notre budget est très serré, que faut-il prévoir ?', a: `Le site coûte ${prix} €, une seule fois, puis ${eur(tranquille.month)} € par mois pour l’abonnement. Le prix du site peut s’étaler sur ${durees} mois. La boutique en ligne et le ${packSeo.name} restent facultatifs, et la plupart des associations s’en passent très bien.` },
      { q: 'Qui peut demander des changements sur le site ?', a: 'Le bureau décide qui reçoit les codes de l’espace client. À chaque changement d’équipe, il suffit de mettre à jour l’adresse e-mail et le mot de passe du compte, et le site continue sans interruption.' },
      { q: 'Peut-on recevoir des dons ou des adhésions en ligne ?', a: 'Oui, par un bouton qui mène vers le service de paiement que vous utilisez déjà pour vos cotisations. Si vous n’en avez pas, un bulletin à télécharger et un contact par e-mail suffisent pour commencer.' },
      { q: 'Le site peut-il servir pour un événement, comme un festival ?', a: 'Oui. Une page dédiée présente le programme, les horaires, l’accès et les partenaires. Après l’événement, elle reste en ligne avec les photos, et on la met à jour pour l’édition suivante.' },
    ],
    voir: ['/tarifs/', '/guides/choisir-nom-de-domaine/', '/accompagnement/'],
  },
];

module.exports = { metiers, PUBLIE };
