// Pages « Votre métier » (V2) : une page par métier, à la racine du site (/<slug>/).
// Règles (scripts/check.js) : title de 65 caractères au plus, description de 120 à 160, aucun tiret long
// ni demi-cadratin, aucun point-virgule, aucun prix écrit en dur (tout vient de config.js), aucun client,
// avis ou chiffre inventé, et pas de phrase de 9 mots ou plus reprise d'une autre page.
// Lia apparaît au plus une fois par page, comme l'assistante d'Alex.
const { creation, types, forfaits, options, aLaDemande, paiement, lissage, delais, marche } = require('../config');

const O = (id) => options.find((o) => o.id === id);
const A = (id) => aLaDemande.find((x) => x.id === id);
const T = (id) => types.find((t) => t.id === id);
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500

const abo = forfaits[0]; // l'abonnement de base, le seul
const prix = eur(creation.prix); // création d'un site, toujours écrite « à partir de »
const prixBoutique = eur(creation.prix + creation.boutique); // création avec la boutique en ligne
const mensuel = `${eur(abo.month)} € par mois`;
const periode = abo.periode; // une intervention d'Alex par trimestre
const durees = lissage.durees.join(' ou ');
const acompte = `${paiement.acompte} %`;
const once = (id) => `${eur(O(id).price.once)} €`;
const mois = (id) => `${eur(O(id).price.month)} € par mois`;
const extra = (id) => `${eur(A(id).prix)} €`;
const marcheVitrine = `${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €`;
const produits = (T('boutique').inclus.join(' ').match(/\d+/) || ['20'])[0]; // produits ajoutés par Alex à la création

const PUBLIE = '2026-11-16';

const metiers = [
  // ------------------------------------------------------------------ artisans
  {
    slug: 'site-internet-artisan',
    nom: 'Artisans',
    qui: 'Plombiers, électriciens, maçons, menuisiers, peintres, couvreurs, paysagistes',
    icon: 'hammer',
    color: 'butter',
    title: 'Site internet pour artisan : être trouvé et rassurer | Alex & Lia',
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
      { id: 'seo', pourquoi: 'Chaque mois, je regarde ce que tapent les gens de votre secteur et je retouche vos pages pour qu’elles ressortent mieux.' },
      { id: 'pages', pourquoi: 'Dépannage, rénovation, salle de bain clé en main : une page par prestation donne à chacune sa chance d’être trouvée.' },
      { id: 'mail', pourquoi: 'Un devis envoyé depuis une adresse à votre nom fait plus sérieux qu’une boîte gratuite.' },
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

## Une page ou un site vitrine ?

Si vous faites un seul métier, une page bien construite suffit pour démarrer. Si vous proposez plusieurs prestations, par exemple plomberie, chauffage et salle de bain clé en main, le site vitrine donne une page à chacune. Celui qui cherche « installation pompe à chaleur » tombe alors sur la page qui en parle, et pas sur un texte fourre-tout. Le guide [une page ou un site vitrine](/guides/site-une-page-ou-site-vitrine/) vous aide à trancher.

Pour être trouvé autour de chez vous, le site fait équipe avec votre [fiche Google](/guides/fiche-google-entreprise/). La fiche vous place sur la carte, le site achève de convaincre. Les deux doivent afficher exactement les mêmes coordonnées.

## Vous êtes sur les chantiers, je m’occupe du site

Vous n’avez ni le temps ni l’envie de gérer un site le soir, et c’est normal. Je rédige les textes avec vous après un court échange, je prépare la mise en page et je mets tout en ligne. Plus tard, un tarif change ou une nouvelle photo arrive ? Vous me l’envoyez depuis votre téléphone, et c’est fait.

Pour aller vite sans bâcler, je travaille avec Lia, mon assistante numérique. Elle automatise les tâches répétitives, et moi je relis chaque page avant qu’elle parte en ligne. C’est ce qui garde des délais courts et un prix doux.

## Combien ça coûte

Un site vitrine confié à un indépendant se paie en général entre ${marcheVitrine}. Le mien revient ${marche.fois} fois moins cher, sans rien enlever à l’essentiel : je gagne du temps sur la technique, jamais sur la relecture.

La création coûte à partir de ${prix} €, pour une page comme pour un site vitrine. Vous versez ${acompte} à la commande, puis le reste à la mise en ligne, d’un coup ou en ${durees} fois sans frais. L’abonnement de base suit, à ${mensuel} et sans engagement : nom de domaine, hébergement, mises à jour, sauvegardes, support, et mon intervention une fois par ${periode}. Tout est détaillé sur la page [tarifs](/tarifs/).`,
    faq: [
      { q: 'Combien coûte un site internet pour un artisan ?', a: `La création coûte à partir de ${prix} €, que vous preniez une page ou un site vitrine de cinq pages. Ensuite, l’abonnement de base à ${mensuel} couvre l’adresse du site, l’hébergement et l’entretien. Vous connaissez le total avant de commander.` },
      { q: 'Je travaille sur une grande zone, comment être trouvé partout ?', a: 'Citez les principales communes où vous intervenez, sans en aligner des dizaines. Une liste honnête sur le site, et une zone d’intervention bien réglée sur votre fiche Google, valent mieux qu’une page par village.' },
      { q: 'Je n’ai presque pas de photos de chantier, est-ce un problème ?', a: 'Non. On démarre avec ce que vous avez, même deux clichés pris au téléphone. Le site s’étoffe ensuite chantier après chantier : vous m’envoyez les photos, je les ajoute.' },
      { q: 'J’ai déjà un vieux site, faut-il tout recommencer ?', a: `Rien n’est perdu. Avec l’option ${O('reprise').name}, je récupère vos textes, vos photos et les adresses de vos pages, pour garder la place que vous avez déjà sur Google.` },
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
    title: 'Site internet pour thérapeute et sophrologue | Alex & Lia',
    description: 'Sophrologue, naturopathe, magnétiseur, réflexologue : un site sobre qui présente votre pratique, vos séances et vos tarifs, avec des mots justes et prudents.',
    h1: 'Site internet pour thérapeute : donner envie d’oser le premier rendez-vous',
    lead: 'Avant de réserver, on veut savoir à qui l’on va parler et comment se passe une séance. Je crée un site sobre et chaleureux qui répond à ces questions, avec des mots justes et prudents.',
    resume: 'Présenter votre pratique avec justesse et prudence.',
    besoins: [
      { icon: 'smile', t: 'Un visage avant la séance', d: 'Votre photo, votre parcours et votre façon d’accueillir aident la personne à franchir le pas.' },
      { icon: 'book-open', t: 'Une séance expliquée simplement', d: 'Durée, déroulé, tarif : celui qui n’a jamais essayé sait à quoi s’attendre en arrivant.' },
      { icon: 'calendar-check', t: 'Réserver sans téléphoner', d: 'Certaines personnes n’osent pas appeler. Un formulaire ou un agenda en ligne leur laisse le temps de se décider.' },
      { icon: 'search', t: 'Être trouvé près de chez vous', d: 'Les mots que tapent les gens, comme « sophrologue » ou « réflexologie » avec leur ville, figurent sur vos pages.' },
    ],
    exemple: {
      client: 'dodedo',
      texte: 'Une page principale pour présenter la pratique et donner envie de prendre contact, puis des pages de conseils qui répondent chacune à une question précise que l’on tape sur Google. C’est un bon modèle pour un praticien qui veut rester simple.',
    },
    options: [
      { id: 'rdv', pourquoi: 'La personne choisit son créneau quand elle se sent prête, même tard le soir, sans avoir à décrocher son téléphone.' },
      { id: 'article', pourquoi: 'Un article de conseils de temps en temps répond aux questions de vos futurs clients et donne au site de nouvelles portes d’entrée.' },
      { id: 'seo', pourquoi: 'Je surveille ce que l’on tape pour trouver une pratique comme la vôtre dans votre secteur, et j’ajuste vos pages chaque mois.' },
    ],
    body: `## Ce qui aide à franchir le pas

Les personnes qui cherchent un sophrologue, un naturopathe ou un magnétiseur hésitent souvent longtemps. Elles ne savent pas toujours ce qu’elles vont trouver, ni si elles oseront se confier. Votre site les accueille avant vous.

Trois choses comptent plus que tout le reste :

- **Votre présence** : une photo naturelle, votre prénom, quelques lignes sur votre parcours et vos formations.
- **Le déroulé d’une séance** : sa durée, ce qui s’y passe, ce qu’il faut prévoir, son prix.
- **Un contact sans pression** : un formulaire, un bouton d’appel, ou une réservation en ligne.

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

Pour une seule pratique, une page bien construite fait l’affaire : présentation, séance, tarifs, accès, contact. Avec plusieurs pratiques, sophrologie et ateliers de relaxation par exemple, un site vitrine donne à chacune sa page. Quelqu’un qui tape « réflexologie plantaire » et le nom de sa ville tombe alors sur la page qui en parle vraiment.

Les pages de conseils sont une autre piste, à petits pas. Comment se passe une première séance de réflexologie, trois exercices de respiration à faire chez soi : chaque page répond à une vraie question et ouvre une porte de plus vers vous. C’est le choix fait pour le site d’un magnétiseur que vous pouvez découvrir parmi mes [réalisations](/realisations/).

## Vous accompagnez, je m’occupe du site

Vous n’avez pas à écrire seul. Racontez-moi votre pratique avec vos mots, au téléphone ou par écrit. Lia, mon assistante numérique, met ces notes en forme et prépare la mise en page, ce qui raccourcit les délais et allège la facture. Je relis ensuite chaque phrase avec vous, surtout les plus délicates. Rien ne part en ligne sans votre accord.

## Le prix

La création coûte à partir de ${prix} €, pour une page comme pour un site vitrine. Si vous voulez que l’on réserve directement en ligne, l’option ${O('rdv').name} s’ajoute pour ${once('rdv')}, payés une seule fois.

Ensuite, l’abonnement de base est à ${mensuel}, sans engagement. Il garde votre site en ligne et à jour, avec son nom de domaine, son hébergement et le support. Vos horaires ou vos tarifs bougent ? Les petites retouches sont comprises, et j’interviens moi-même une fois par ${periode} pour un changement plus important.`,
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
    title: 'Site pour créateur ou artiste : galerie et boutique | Alex & Lia',
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
      { id: 'stock', pourquoi: 'Pour les pièces uniques ou en petite série : dès qu’une pièce est vendue, elle passe en « Épuisé » toute seule.' },
      { id: 'en', pourquoi: 'Un acheteur étranger ou une galerie d’un autre pays découvre votre démarche dans une langue qu’il comprend.' },
      { id: 'article', pourquoi: 'Une collection qui sort, une exposition, les coulisses d’une pièce : chaque article donne une raison de revenir sur votre site.' },
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

Deux formules, selon votre façon de vendre :

- **La galerie seule**, si vous vendez à l’atelier, sur les salons ou sur commande. Le site montre votre travail, et un formulaire reçoit les demandes.
- **La galerie et la boutique**, si vous voulez vendre en ligne. Vos clients choisissent, paient par carte, et vous recevez la commande par e-mail. J’ajoute moi-même jusqu’à ${produits} produits pour commencer.

La boutique arrive avec un modèle de conditions de vente que nous complétons ensemble, avec vos frais d’envoi et vos délais de fabrication.

!> Une pièce faite sur mesure ou personnalisée à la demande du client échappe au droit de rétractation de 14 jours. Pour vos pièces déjà prêtes, ce droit s’applique. Vos conditions de vente doivent le dire clairement.

Le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/) détaille chaque étape, de la photo jusqu’au colis.

## Vous créez, je m’occupe du reste

Vous m’envoyez vos photos et quelques notes sur chaque pièce. Lia, mon assistante numérique, s’occupe de la partie répétitive : elle prépare les fiches et la mise en page à partir de vos notes, en bien moins de temps qu’à la main. Je reprends ensuite chaque texte pour qu’il sonne comme vous, et je vérifie chaque page avant la mise en ligne.

Côté prix, la création coûte à partir de ${prix} € pour la galerie, et à partir de ${prixBoutique} € avec la boutique. Vous réglez ${acompte} en commandant, puis le solde à la réception, en une fois ou en ${durees} fois sans frais. L’abonnement de base, à ${mensuel} et sans engagement, garde le site en ligne, sauvegardé et à jour. Une nouvelle collection à ajouter ? Envoyez-la-moi, je m’en charge.`,
    faq: [
      { q: 'Faut-il un statut pour vendre ses créations en ligne ?', a: 'Oui, dès que vous vendez de façon régulière. La micro-entreprise est la solution la plus courante pour démarrer. Les artistes auteurs ont un régime à part : renseignez-vous auprès de l’Urssaf avant d’ouvrir la boutique.' },
      { q: 'Mes photos sont-elles protégées une fois en ligne ?', a: 'Vos œuvres et vos photos restent à vous : le droit d’auteur s’applique sans aucune démarche. Je publie des images assez grandes pour être belles à l’écran, sans mettre en ligne vos fichiers en pleine qualité.' },
      { q: 'Je vends déjà sur une place de marché, un site est-il utile ?', a: 'Oui, les deux se complètent. La place de marché amène du passage. Votre site, lui, porte votre nom, sans concurrent affiché à côté, et vous y renvoyez depuis vos cartes, vos salons et vos réseaux.' },
      { q: 'Combien coûte un site avec boutique pour un créateur ?', a: `La création coûte à partir de ${prixBoutique} € avec la boutique, paiement par carte compris. L’abonnement de base reste à ${mensuel}. Pour suivre vos pièces uniques, l’extra ${O('stock').name} ajoute ${mois('stock')}.` },
    ],
    voir: ['/guides/creer-boutique-en-ligne/', '/realisations/', '/tarifs/#options'],
  },

  // ------------------------------------------------------------------ hébergements touristiques
  {
    slug: 'site-internet-gite-chambre-hotes',
    nom: 'Hébergements touristiques',
    qui: 'Gîtes, chambres d’hôtes, meublés de tourisme',
    icon: 'house',
    color: 'sky',
    title: 'Site internet pour gîte et chambre d’hôtes | Alex & Lia',
    description: 'Gîte, chambre d’hôtes, meublé de tourisme : un site avec vos photos, vos tarifs, l’accès et une version anglaise, pour recevoir des réservations en direct.',
    h1: 'Site internet pour gîte et chambre d’hôtes : vos réservations en direct',
    lead: 'Beaucoup de voyageurs cherchent le nom d’un gîte repéré ailleurs avant de réserver. Je crée le site qui les accueille : de belles photos, des tarifs clairs, l’accès, et une demande de séjour qui arrive chez vous, sans commission.',
    resume: 'Réservations en direct, photos, accès et version anglaise.',
    besoins: [
      { icon: 'calendar-days', t: 'Réserver en direct', d: 'La demande de séjour arrive dans votre boîte mail, sans commission à reverser.' },
      { icon: 'camera', t: 'Des photos qui donnent envie', d: 'Chaque chambre, la cuisine, le jardin, la vue : le voyageur fait la visite avant de venir.' },
      { icon: 'languages', t: 'Accueillir les voyageurs étrangers', d: 'Une version anglaise relue permet aux visiteurs venus d’ailleurs de tout comprendre avant de réserver.' },
      { icon: 'route', t: 'Un accès sans détour', d: 'Plan, itinéraire, gare la plus proche, heure d’arrivée : vos hôtes arrivent sans vous appeler en route.' },
    ],
    exemple: {
      client: null,
      texte: 'Aucun hébergement ne figure encore parmi mes réalisations. Pour des chambres d’hôtes, je proposerais un accueil avec la plus belle photo, une page pour les chambres et leurs tarifs, une page sur les environs, puis l’accès et une demande de séjour, en français et en anglais.',
    },
    options: [
      { id: 'en', pourquoi: 'Vos voyageurs étrangers lisent tout dans une langue qu’ils comprennent, et Google peut leur montrer cette version.' },
      { id: 'pages', pourquoi: 'Plusieurs gîtes ou plusieurs chambres ? Chacun mérite sa page, avec ses photos, sa capacité et ses prix.' },
      { id: 'mail', pourquoi: 'Une adresse comme reservation@votregite.fr inspire confiance au moment où le voyageur envoie ses dates.' },
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

## Parler aux voyageurs venus d’ailleurs

Une partie de vos hôtes ne lit pas le français. Avec l’option ${O('en').name}, chaque page a sa version anglaise, que je relis moi-même, et un bouton passe d’une langue à l’autre. Le voyageur comprend vos conditions, vos horaires d’arrivée et le chemin, et il réserve l’esprit tranquille.

## Les avis et les règles à respecter

Dans le tourisme, les avis pèsent lourd. Publiez seulement de vrais commentaires de vos hôtes, avec leur accord, ou renvoyez vers votre [fiche Google](/guides/fiche-google-entreprise/), où chacun peut en laisser librement. Cette fiche vous place aussi sur la carte quand quelqu’un cherche où dormir dans le coin.

!> Les meublés de tourisme et les chambres d’hôtes se déclarent en mairie. Si vous avez reçu un numéro d’enregistrement, il doit apparaître sur vos annonces, et votre site en est une : je l’y ajoute.

## Le prix, et qui s’en occupe

La création coûte à partir de ${prix} €. La plupart des hébergements choisissent un site vitrine : l’accueil, les chambres, les environs, les tarifs et le contact avec l’accès tiennent dans les cinq pages comprises.

Ensuite, l’abonnement de base coûte ${mensuel} et ne vous engage à rien. Il garde le site en ligne, à jour et sauvegardé, avec son nom de domaine. Les petites retouches de saison, un tarif d’été ou une date de fermeture, passent par Lia, mon assistante numérique, qui automatise ces changements répétitifs pour qu’ils soient faits vite. Une fois par ${periode}, je prends moi-même en charge un travail plus important.`,
    faq: [
      { q: 'Le site peut-il afficher mes disponibilités ?', a: 'Si vous tenez déjà un calendrier en ligne, le site peut y renvoyer. Sinon, la demande de séjour suffit souvent : vous gardez la main sur votre planning et vous confirmez chaque réservation vous-même.' },
      { q: 'Faut-il vraiment une version anglaise ?', a: 'Si vous recevez des voyageurs étrangers, c’est souvent utile. Une personne qui ne comprend pas vos conditions préfère réserver là où tout est clair pour elle. Si vos hôtes sont surtout français, vous pouvez attendre.' },
      { q: 'J’ai deux gîtes sur le même terrain, faut-il deux sites ?', a: 'Non. Un seul site présente les deux, chacun sur sa page, avec ses photos et ses tarifs. Le voyageur compare d’un coup d’œil, et vous n’avez qu’un abonnement.' },
      { q: 'Combien coûte un site pour un gîte ?', a: `La création coûte à partir de ${prix} €. La version anglaise est une option à ${once('en')}, payée une fois. L’abonnement de base est à ${mensuel}, sans engagement, et le site peut se régler en ${durees} fois sans frais.` },
    ],
    voir: ['/guides/fiche-google-entreprise/', '/tarifs/#options', '/guides/choisir-nom-de-domaine/'],
  },

  // ------------------------------------------------------------------ commerçants
  {
    slug: 'site-internet-commercant',
    nom: 'Commerçants',
    qui: 'Boutiques, commerces de proximité, producteurs',
    icon: 'store',
    color: 'peach',
    title: 'Site internet pour commerçant et producteur local | Alex & Lia',
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
      { id: 'seo', pourquoi: 'Chaque mois, j’observe comment vos clients cherchent un commerce comme le vôtre, et je retouche vos pages en conséquence.' },
      { id: 'stock', pourquoi: 'Avec une boutique en ligne, le stock se décompte à chaque vente sur le site, et un produit épuisé ne peut plus être commandé.' },
      { id: 'urgent', pourquoi: `Une fermeture imprévue, une promotion de dernière minute : votre changement passe en priorité, en ligne sous ${delais.urgent} les jours ouvrés.` },
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

Vendre en ligne n’a rien d’obligatoire. Un site vitrine qui montre vos rayons, vos arrivages et vos spécialités donne déjà une bonne raison de passer.

Pour aller plus loin, la boutique en ligne permet à vos clients de commander à toute heure. Ils paient par carte sur le site, puis choisissent la livraison ou le retrait au magasin. Le retrait évite les frais de port, et votre client en profite parfois pour découvrir autre chose dans vos rayons. Pour un producteur, c’est aussi une façon simple de prendre les commandes de paniers ou de colis, sans noter chaque demande au téléphone.

Commencez petit, avec vos produits les plus demandés, ceux qui se gardent et se transportent bien. J’en mets jusqu’à ${produits} en ligne pour vous à la création. Le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/) explique le paiement, la livraison et les règles de vente.

## Un site qui suit la vie du magasin

Un commerce bouge tout le temps : les horaires d’été, la fermeture d’une semaine en août, la nouvelle gamme, le marché de Noël. Un site qui affiche encore les horaires de l’an dernier déçoit, et le client ne revient pas forcément.

Avec l’abonnement de base, à ${mensuel} et sans engagement, ces changements ne vous demandent qu’un message. Lia, mon assistante numérique, prend en charge les retouches répétitives comme un horaire ou un prix, ce qui les rend rapides et peu coûteuses. Pour un changement plus important, j’interviens moi-même une fois par ${periode}, et vous pouvez demander un passage de plus, à ${extra('alex')}, quand la saison l’exige.

## Combien ça coûte

La création coûte à partir de ${prix} € pour un site vitrine, et à partir de ${prixBoutique} € avec la boutique en ligne. Pour comparer, un site de ce genre fait par un indépendant demande souvent entre ${marcheVitrine}. Vous versez ${acompte} à la commande et le reste à la mise en ligne, en une fois ou en ${durees} mensualités sans frais.`,
    faq: [
      { q: 'J’ai déjà une page sur les réseaux sociaux, ai-je besoin d’un site ?', a: 'Les deux se complètent. Sur les réseaux, vos horaires et vos produits se noient vite sous les publications, et tout le monde n’y a pas de compte. Le site garde l’essentiel au même endroit, à votre nom.' },
      { q: 'Comment fonctionne le retrait en magasin ?', a: 'Le client choisit ses produits, paie en ligne et coche le retrait au moment de valider. Vous recevez la commande par e-mail, vous la préparez, et il passe la prendre aux horaires que vous avez fixés.' },
      { q: 'Je suis producteur et je vends à la ferme, un site m’est-il utile ?', a: 'Oui. Le site indique vos jours de vente, vos produits de saison et le chemin jusqu’à la ferme. Avec la boutique, vos clients peuvent même réserver leur panier à l’avance, et vous savez combien en préparer.' },
      { q: 'Le stock du magasin et celui du site sont-ils liés ?', a: `Avec l’extra ${O('stock').name}, le stock baisse tout seul à chaque vente en ligne. Les ventes au comptoir ne sont pas comptées automatiquement : vous ajustez les quantités quand vous le souhaitez, ou vous me les envoyez.` },
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
    title: 'Site internet pour association : agenda et adhésions | Alex & Lia',
    description: 'Club, comité des fêtes, association de quartier : un site clair pour annoncer vos dates, accueillir adhérents et bénévoles, avec un budget facile à voter.',
    h1: 'Site internet pour association : faire connaître vos activités sans vider la caisse',
    lead: 'Pour qu’on vous rejoigne, il faut d’abord savoir que vous existez. Je crée un site simple qui dit ce que vous faites, quand et où, et qui ne dépend d’aucun bénévole en particulier.',
    resume: 'Agenda, adhésions, bénévoles, avec un petit budget.',
    besoins: [
      { icon: 'calendar', t: 'Un agenda toujours à jour', d: 'Assemblée générale, tournoi, brocante, répétition : les dates sont au même endroit pour tout le monde.' },
      { icon: 'user-check', t: 'Des adhésions plus simples', d: 'Tarifs, bulletin à télécharger ou lien vers votre outil d’inscription : rejoindre l’association devient facile.' },
      { icon: 'heart-handshake', t: 'Trouver des bénévoles', d: 'Une page dit clairement où vous avez besoin de bras et comment proposer son aide.' },
      { icon: 'piggy-bank', t: 'Un budget facile à voter', d: 'Un prix de création connu d’avance et un petit abonnement, sans surprise pour le trésorier.' },
    ],
    exemple: {
      client: null,
      texte: 'Pas encore d’association parmi mes réalisations. Pour un comité des fêtes, je proposerais une seule page : qui vous êtes, l’agenda de l’année, les photos de la dernière fête, comment devenir bénévole, et un formulaire qui arrive dans la boîte de l’association.',
    },
    options: [
      { id: 'mail', pourquoi: 'Une adresse au nom de l’association, qui passe d’un bureau à l’autre sans changer sur les affiches.' },
      { id: 'alex', pourquoi: 'En pleine saison, je fais une modification de plus à la main, payée seulement le jour où vous la demandez.' },
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

C’est le problème classique : le membre qui avait fait le site s’en va, et plus personne ne sait le modifier. Ici, le site ne dépend d’aucun bénévole. Le président, la secrétaire ou le nouveau trésorier envoie sa demande depuis l’espace client, et je m’en occupe. Quand le bureau change, il suffit de transmettre l’accès.

Lia, mon assistante numérique, se charge des petits changements répétitifs, une date ou un horaire, ce qui permet de garder un prix très bas. Une fois par ${periode}, je fais moi-même une modification plus importante.

## Un budget qui se vote

- **La création** : à partir de ${prix} €, avec ${acompte} à la commande et le reste à la mise en ligne, ou étalé sur ${durees} mois sans frais.
- **L’abonnement de base** : ${mensuel}, sans engagement. Il paie l’adresse du site, l’hébergement, les mises à jour, les sauvegardes et le support.

Pour la plupart des associations, une page suffit, sans aucune option. Si vous avez plusieurs sections, comme le foot, la gym et la randonnée, un site vitrine leur donne une page chacune, pour le même prix de création. Un nom de domaine au nom de l’association fait aussi sérieux sur un dossier de subvention : le guide pour [choisir un nom de domaine](/guides/choisir-nom-de-domaine/) vous aide à le trouver.`,
    faq: [
      { q: 'Notre budget est très serré, que faut-il prévoir ?', a: `Le site coûte à partir de ${prix} €, une seule fois, puis ${mensuel}. Le prix du site peut s’étaler sur ${durees} mois. Les options restent facultatives, et l’abonnement de base suffit dans la plupart des cas.` },
      { q: 'Qui peut demander des changements sur le site ?', a: 'Le bureau décide qui reçoit les codes de l’espace client. À chaque changement d’équipe, il suffit de mettre à jour l’adresse e-mail et le mot de passe du compte, et le site continue sans interruption.' },
      { q: 'Peut-on recevoir des dons ou des adhésions en ligne ?', a: 'Oui, par un bouton qui mène vers le service de paiement que vous utilisez déjà pour vos cotisations. Si vous n’en avez pas, un bulletin à télécharger et un contact par e-mail suffisent pour commencer.' },
      { q: 'Le site peut-il servir pour un événement, comme un festival ?', a: 'Oui. Une page dédiée présente le programme, les horaires, l’accès et les partenaires. Après l’événement, elle reste en ligne avec les photos, et on la met à jour pour l’édition suivante.' },
    ],
    voir: ['/tarifs/', '/guides/choisir-nom-de-domaine/', '/accompagnement/'],
  },
];

module.exports = { metiers, PUBLIE };
