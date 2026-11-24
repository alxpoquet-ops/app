// Mini Tuto, thème « creer » : voir le format dans ./index.js.
// Créer son site avec nous, de la commande à la mise en ligne. Tout est vérifié sur le code réel du parcours :
// src/pages/main.js (page /creer-mon-site/, formulaire de commande), src/content/brief.js (le questionnaire),
// src/wordpress/aled08-espace/includes/ commandes.php, brief.php, atelier.php (l'appel d'Alex, le feu vert, le contrôle) et provision.php.
// Aucun prix écrit en dur : tout vient de src/config.js.
const cfg = require('../../config');
const { forfaits, creationSeule, fractionne, offreSite, aLaDemande } = cfg;

const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const ESS = offreSite.site, BOU = offreSite.avecBoutique, ECO = offreSite.option;
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0]; // Mini, le seul abonnement, facultatif
const dom = mini.domaine || 0; // le nom de domaine fourni par nos soins : en plus, par mois
const avecDom = mini.month + dom;
const AUTO = creationSeule.name; // Autonome, sans abonnement
const pageGoogle = aLaDemande.find((x) => x.id === 'packseo' && !x.retire) || { name: 'Page de visibilité Google', prix: 0, packs: [1] };
const packs = (pageGoogle.packs || [1]).join(', ').replace(/, (\d+)$/, ' ou $1'); // « 1, 5 ou 10 »
const FOIS = fractionne.fois, ORG = fractionne.organismes; // « 3 ou 4 », « Alma ou Klarna »
const DELAI = ESS.delai; // « quelques heures », après l'appel d'Alex

module.exports = [
  // ------------------------------------------------------------------ l'essentiel
  {
    slug: 'creer-mon-site-avec-nous',
    groupe: 'creer',
    icon: 'wand-sparkles',
    monstre: 'bricou',
    nom: 'Créer mon site avec vous : l’essentiel',
    resume: 'Le chemin complet en sept étapes, de la commande à votre site en ligne.',
    duree: 3,
    h1: 'Comment créer mon site avec les Minis Monstres ?',
    title: 'Créer son site avec nous : l’essentiel | Les Minis Monstres',
    description: `Commander, payer, répondre au questionnaire, parler avec Alex, recevoir son site : le parcours complet pour créer votre ${ESS.name}, expliqué simplement.`,
    lead: 'Vous commandez en ligne, vous répondez au questionnaire, Alex vous appelle, puis votre site arrive. Voici le chemin, sans jargon.',
    espace: 'commande',
    body: `La réponse courte : tout commence sur la page [Créer mon site](/creer-mon-site/). Vous y choisissez votre site et vous payez en ligne. Votre espace client s’ouvre aussitôt, et la suite se passe là-bas, à votre rythme.

## Les étapes, dans l’ordre

1. **Vous choisissez votre site.** Le ${ESS.name} coûte ${eur(ESS.price)} € la création. Vous voulez vendre en ligne ? Cochez la case « ${ECO.name} » : ${eur(ECO.prix)} € de plus, soit ${eur(BOU.price)} € en tout.
2. **Vous choisissez qui s’en occupe.** Avec le forfait ${mini.name}, nous hébergeons et entretenons votre site pour ${eur(mini.month)} € par mois, sans engagement. Avec le forfait ${AUTO}, rien à payer chaque mois : vous installez le site vous-même.
3. **Vous donnez vos coordonnées**, et vous choisissez le mot de passe de votre espace client.
4. **Vous payez** sur la page de paiement sécurisée, d’un seul coup ou en ${FOIS} fois avec ${ORG}.
5. **Vous répondez au questionnaire de création**, depuis votre espace client. Comptez une dizaine de minutes.
6. **Alex vous appelle** pour parler de votre site. Ensuite seulement, la petite bande se met au travail.
7. **Votre site est en ligne**, en général ${DELAI} après cet appel. Un e-mail vous donne le lien.

## Ce que vous n’avez pas à faire

Inutile de savoir coder ou de connaître les mots du web. Avec le forfait ${mini.name}, le nom de domaine, l’hébergement et le cadenas de sécurité se mettent en place tout seuls après le paiement. En haut de votre espace client, une barre d’avancement montre où en est votre site, du paiement jusqu’à la mise en ligne.

## Ce qu’il est utile d’avoir sous la main

- Quelques phrases sur votre activité, comme vous la présenteriez à un client au comptoir.
- Vos photos, si vous en avez : jusqu’à dix dans le questionnaire. Sinon, des images liées à votre métier prennent leur place, et vous les changez quand vous voulez.
- Votre logo, si vous en avez un.
- Vos prix ou vos produits, si vous souhaitez les montrer.

> Bon à savoir : votre site est construit avec vos réponses, sans rien inventer. Et il est vérifié avant d’arriver chez vous.

Une question avant de vous lancer ? Écrivez-nous par le [formulaire de contact](/contact/) : c’est Alex qui lit et qui répond.`,
    faq: [
      { q: 'Faut-il prendre rendez-vous avant de commander ?', a: 'Non. Vous commandez directement en ligne. C’est après votre questionnaire qu’Alex vous appelle, pour parler de votre site.' },
      { q: 'Puis-je changer d’avis pendant la commande ?', a: 'Oui. Tant que vous n’avez pas payé, cochez ou décochez ce que vous voulez : le prix se met à jour tout de suite.' },
    ],
    voir: ['deroulement-d-un-achat', 'questionnaire-de-creation', 'combien-de-temps-pour-mon-site'],
  },

  // ------------------------------------------------------------------ le déroulement d'un achat
  {
    slug: 'deroulement-d-un-achat',
    groupe: 'creer',
    icon: 'route',
    monstre: 'mochi',
    nom: 'Un achat, étape par étape',
    resume: 'Les dix étapes d’une commande, et qui a la main à chaque moment.',
    duree: 4,
    h1: 'Comment se déroule un achat chez les Minis Monstres, étape par étape ?',
    title: 'Le déroulement d’un achat, pas à pas | Les Minis Monstres',
    description: 'De la page de commande à l’e-mail « Votre site est en ligne », les dix étapes d’un achat chez nous, avec ce que vous faites et ce que nous faisons.',
    lead: 'Une commande suit toujours le même chemin. Vous savez à chaque instant où en est votre site, et qui a la main : vous, Alex ou la bande.',
    espace: 'commande',
    body: `La réponse tout de suite : quatre étapes sur la page de commande, puis six dans votre espace client. Rien n’est caché : la barre d’avancement de votre espace client vous montre toujours l’étape en cours.

## Sur la page Créer mon site

1. **Votre site.** Le ${ESS.name} est déjà compris. La case « ${ECO.name} » ajoute la boutique en ligne. Le prix change dès que vous la cochez ou la décochez.
2. **Qui s’occupe de votre site ?** Le forfait ${mini.name}, où l’on s’occupe de tout, ou le forfait ${AUTO}, où vous gérez tout vous-même. Avec ${mini.name}, un encadré vérifie aussi si le nom de domaine voulu est libre.
3. **Vos coordonnées.** Prénom, nom, e-mail, téléphone, adresse, et le mot de passe de votre espace client, de 8 caractères au moins. Une case facultative, « Votre projet », vous laisse noter vos premières idées.
4. **Le paiement.** Vous acceptez les conditions générales de vente. Vous indiquez quand la création commence : tout de suite, ou à la fin de votre délai de rétractation de 14 jours. Puis le bouton « Commander et payer » ouvre la page de paiement sécurisée.

## Dans votre espace client

5. **La confirmation.** L’e-mail « Merci, c’est payé ! » arrive avec le récapitulatif, la référence de votre commande et un bouton vers le questionnaire.
6. **Le nom de domaine et l’hébergement.** Avec le forfait ${mini.name}, ils se préparent automatiquement. Rien à faire de votre côté pendant cette étape.
7. **Le questionnaire de création**, dans l’onglet « Ma commande ». C’est son envoi qui lance la création.
8. **L’appel d’Alex.** Il vous téléphone au numéro donné à la commande, pour parler de votre site. Après l’appel, c’est lui qui autorise la bande à commencer.
9. **La création, puis la vérification.** Un petit monstre construit votre site avec vos réponses, et un second le relit d’un œil neuf avant toute livraison. S’il manque une précision, vous recevez l’e-mail « Une petite question pour votre site », et vous répondez dans « Ma commande ».
10. **La mise en ligne.** L’e-mail « Votre site est en ligne ! » vous donne le lien. C’est la première version de votre site, et elle peut évoluer ensuite.

> Bon à savoir : avec le forfait ${mini.name}, rien n’est prélevé chaque mois avant la mise en ligne. Votre forfait démarre ce jour-là, quand vous enregistrez votre carte.

## Avec le forfait ${AUTO}

Le chemin est le même jusqu’à la création, sans nom de domaine ni hébergement à préparer chez nous. À la fin, votre site vous est remis en entier, avec une notice, pour que vous l’installiez chez votre propre hébergeur.`,
    faq: [
      { q: 'Que se passe-t-il si je choisis d’attendre 14 jours ?', a: 'Vous gardez votre droit de rétractation jusque-là. Vous pouvez déjà remplir le questionnaire, mais la création commence seulement à la fin de ce délai.' },
      { q: 'Je ne réponds pas à une question de la bande, que se passe-t-il ?', a: 'Votre site attend votre réponse. Au bout de trois jours, un petit e-mail vous le rappelle, une seule fois.' },
    ],
    voir: ['creer-mon-site-avec-nous', 'appel-avec-alex', 'payer-mon-site-en-plusieurs-fois'],
  },

  // ------------------------------------------------------------------ le questionnaire
  {
    slug: 'questionnaire-de-creation',
    groupe: 'creer',
    icon: 'clipboard-check',
    monstre: 'champi',
    nom: 'Bien remplir le questionnaire',
    resume: 'Pourquoi il pose autant de questions, et nos conseils pour y répondre vite.',
    duree: 4,
    h1: 'Le questionnaire de création : pourquoi il est précis, et comment bien le remplir',
    title: 'Le questionnaire de création, mode d’emploi | Les Minis Monstres',
    description: 'Le questionnaire de création est précis pour que votre site ne contienne que du vrai. Où le trouver, ce qu’il demande et comment le remplir en dix minutes.',
    lead: 'Votre site est construit avec vos réponses, et seulement avec elles. Plus elles sont justes, moins il y aura de surprises à la livraison.',
    espace: 'commande',
    body: `La réponse tout de suite : nous n’inventons rien sur votre activité. Pas de faux avis, pas de prix au hasard, pas de service que vous ne proposez pas. Le questionnaire rassemble donc tout ce qu’il faut pour construire votre site sans deviner. C’est notre façon d’éviter les mauvaises surprises.

## Où le trouver

Dans votre espace client, onglet « Ma commande ». L’e-mail de confirmation contient aussi un bouton « Remplir mon questionnaire ». Plusieurs réponses sont déjà préremplies avec votre commande : le nom de votre activité, votre e-mail, votre téléphone, votre adresse.

## Ce qu’il vous demande

- **Votre site** : son nom, votre activité, pourquoi vos clients vous choisissent, votre ville.
- **Votre façon de travailler** : comment on vous contacte, comment se passe une commande ou une prestation.
- **Être trouvé sur Google** : les villes visées, et ce que vos clients tapent pour vous trouver.
- **Le style** : les couleurs, l’ambiance, votre logo, un site que vous aimez.
- **Vos coordonnées sur le site**, **vos photos**, **le contenu**, **vos prix** ou **ce que vous vendez**, et ce qu’il faut pour les mentions légales.

## Nos conseils pour bien le remplir

1. **Écrivez comme vous parlez.** Des phrases simples suffisent : la mise en forme, c’est notre travail.
2. **Commencez par les questions marquées d’une étoile.** Ce sont les seules obligatoires.
3. **Ajoutez une phrase sous chaque photo**, par exemple « l’atelier » ou « le gâteau de mariage ». Dix photos au plus, de 8 Mo chacune au maximum.
4. **Gardez toutes les parties cochées** si vous hésitez. Une partie encore vide affichera « bientôt », et vous la remplirez plus tard.
5. **Choisissez qui écrit les textes** : nous, à partir de vos réponses, ou vous-même.
6. **Cliquez sur « Envoyer et lancer la création ».** Il manque une réponse obligatoire ? Rien n’est perdu : vos réponses restent gardées, complétez puis renvoyez.

> Bon à savoir : vous pouvez revenir sur vos réponses après l’envoi, avec le bouton « Enregistrer mes réponses ». Nous travaillons toujours avec la dernière version.

## Et ensuite ?

Un message vous confirme la bonne réception. Alex lit vos réponses, puis il vous appelle pour en parler avant que la bande commence. Une réponse vous a semblé floue ? C’est le bon moment pour la préciser de vive voix.`,
    faq: [
      { q: 'Je n’ai pas encore de photos, je peux envoyer le questionnaire ?', a: 'Oui. Des images en rapport avec votre métier sont posées à leur place, et vous mettrez les vôtres quand vous les aurez.' },
      { q: 'Pourquoi demander mon adresse ?', a: 'La loi demande l’adresse de la personne qui publie un site. Elle apparaît seulement dans les mentions légales, en bas de votre site.' },
    ],
    voir: ['appel-avec-alex', 'deroulement-d-un-achat', 'combien-de-temps-pour-mon-site'],
  },

  // ------------------------------------------------------------------ l'appel d'Alex
  {
    slug: 'appel-avec-alex',
    groupe: 'creer',
    icon: 'phone-call',
    monstre: 'ravie',
    nom: 'L’appel avec Alex',
    resume: 'Pourquoi Alex vous téléphone avant chaque site, et comment s’y préparer.',
    duree: 3,
    h1: 'L’appel avec Alex : à quoi sert-il ?',
    title: 'L’appel avec Alex, avant votre site | Les Minis Monstres',
    description: 'Avant de lancer votre site, Alex vous appelle pour bien comprendre ce que vous attendez. À quoi sert cet appel, quand il a lieu et comment vous y préparer.',
    lead: 'Un questionnaire dit beaucoup, mais pas tout. Avant que la bande se mette au travail, Alex prend son téléphone et vous appelle.',
    espace: 'commande',
    body: `La réponse tout de suite : cet appel sert à dégrossir votre projet. Alex a lu vos réponses, il vous écoute, et il s’assure d’avoir bien compris ce que vous attendez de votre site. Il a lieu pour chaque site, sans exception, et c’est un choix d’Alex.

## Comment il se passe

1. **Vous envoyez votre questionnaire.** Alex est prévenu aussitôt, avec vos réponses sous les yeux.
2. **Alex vous appelle** au numéro que vous avez donné à la commande. Vous n’avez rien à réserver.
3. **Vous parlez de votre site** : ce qui compte le plus pour vous, ce que vos visiteurs doivent faire en premier, ce qui vous fait hésiter.
4. **Alex note ce qu’il retient** de votre échange, et il le transmet à la bande avec votre questionnaire.
5. **Il donne le feu vert.** Avant ce feu vert, personne ne commence votre site. Après, comptez en général ${DELAI} jusqu’à la mise en ligne.

## Pourquoi c’est important

Un même mot ne veut pas dire la même chose pour tout le monde. « Moderne », « chaleureux », « simple » : quelques minutes de conversation suffisent à lever le doute. C’est aussi l’occasion de régler un détail qui ne rentrait dans aucune case du questionnaire.

Ce n’est pas un appel commercial. Votre site est déjà commandé : il s’agit seulement de bien le faire.

## Comment vous y préparer

- Gardez votre questionnaire à portée de main, ou ouvrez votre espace client.
- Pensez à l’action principale de vos visiteurs : vous appeler, vous écrire, venir sur place, acheter.
- Repérez la photo ou le service que vous voulez voir en premier.
- Notez vos questions, même petites. Il n’y en a pas de bête.

> Bon à savoir : vous avez choisi d’attendre la fin de votre délai de rétractation ? La création commence seulement à cette date, même après l’appel.

Après la mise en ligne, Alex reste joignable : vous lui écrivez depuis le [formulaire de contact](/contact/) ou en répondant à nos e-mails.`,
    faq: [
      { q: 'Combien de temps dure l’appel ?', a: 'Aucune durée n’est fixée. L’appel sert à bien comprendre votre projet, et il s’arrête quand tout est clair pour vous et pour Alex.' },
      { q: 'Puis-je modifier mon questionnaire après l’appel ?', a: 'Oui. Vos réponses restent modifiables dans « Ma commande », et la bande travaille avec la dernière version.' },
    ],
    voir: ['questionnaire-de-creation', 'alex-sera-toujours-la', 'combien-de-temps-pour-mon-site'],
  },

  // ------------------------------------------------------------------ les délais
  {
    slug: 'combien-de-temps-pour-mon-site',
    groupe: 'creer',
    icon: 'timer',
    monstre: 'dino',
    nom: 'Combien de temps ça prend ?',
    resume: 'Le temps de chaque étape, de votre commande à la mise en ligne.',
    duree: 3,
    h1: 'Combien de temps faut-il pour avoir mon site ?',
    title: 'Combien de temps pour avoir mon site ? | Les Minis Monstres',
    description: `Votre site est en ligne en général ${DELAI} après l’appel d’Alex. Le temps de chaque étape, ce qui peut l’allonger et comment aller plus vite.`,
    lead: `Comptez en général ${DELAI} après l’appel avec Alex. Voici le détail, étape par étape, et ce qui peut rallonger un peu l’attente.`,
    espace: 'commande',
    body: `La réponse tout de suite : une fois l’appel avec Alex passé et vos éléments reçus, votre site est en général en ligne en ${DELAI}. C’est possible parce que nos modules sont déjà prêts. Ce délai reste indicatif, comme le précisent nos [conditions générales](/conditions-generales/).

## Le temps de chaque étape

1. **La commande** : quelques minutes sur la page Créer mon site, paiement compris.
2. **L’adresse et l’hébergement** (avec le forfait ${mini.name}) : tout se fait automatiquement. Une fois le nom réservé, l’hébergement et le cadenas de sécurité sont souvent prêts en une heure environ.
3. **Le questionnaire** : une dizaine de minutes, quand vous voulez. Vous pouvez le remplir pendant que le nom de domaine se prépare.
4. **L’appel d’Alex** : il a lieu après l’envoi de votre questionnaire.
5. **La création et la vérification** : ${DELAI} en général, contrôle compris.
6. **Le grand jour** : vous êtes prévenu par e-mail dès que tout est bon.

## Ce qui peut rallonger un peu

- **Certains noms de domaine** prennent plus de temps à être attribués par le registre. Votre espace client vous le signale.
- **Vous gardez votre propre nom de domaine** : ses réglages se changent chez votre fournisseur actuel, ce qui peut demander un peu de temps.
- **Une question de la bande** reste sans réponse : votre site attend votre précision.
- **Vous avez choisi d’attendre 14 jours** avant le début de la création : le délai court à partir de cette date.

## Comment aller plus vite

1. Remplissez le questionnaire dès réception de l’e-mail de confirmation.
2. Préparez vos photos et vos prix à l’avance.
3. Répondez vite si une question arrive dans « Ma commande ».

> Bon à savoir : aller vite ne veut pas dire sauter des étapes. Chaque site passe par la vérification, même quand tout est prêt en quelques heures.

Après la mise en ligne, vos modifications n’ont pas de délai garanti : chacune est traitée dans un délai raisonnable, selon ce qu’elle demande, et vous la suivez dans votre espace client.`,
    voir: ['deroulement-d-un-achat', 'appel-avec-alex', 'nom-de-domaine-le-mien-ou-le-votre'],
  },

  // ------------------------------------------------------------------ le paiement
  {
    slug: 'payer-mon-site-en-plusieurs-fois',
    groupe: 'creer',
    icon: 'credit-card',
    monstre: 'clin',
    nom: `Payer en une fois ou en ${FOIS} fois`,
    resume: `Comment régler votre site, d’un coup ou avec ${ORG}, et ce qui vient ensuite.`,
    duree: 3,
    h1: `Payer mon site en une fois, ou en ${FOIS} fois`,
    title: `Payer son site en une fois ou en ${FOIS} fois | Les Minis Monstres`,
    description: `Votre site se paie à la commande, en une fois ou en ${FOIS} fois avec ${ORG}. Comment choisir, ce que fait l’organisme, et quand démarre votre forfait.`,
    lead: `Le prix de votre site se règle en entier à la commande. Vous choisissez simplement comment : d’un coup, ou en ${FOIS} fois.`,
    body: `La réponse tout de suite : votre site se règle le jour de la commande, sur la page de paiement sécurisée. C’est là que vous décidez : tout d’un coup, ou en ${FOIS} fois avec ${ORG}. Ensuite, plus rien n’est dû pour la création.

## Les étapes

1. **Choisissez votre site et votre forfait.** L’encadré « Aujourd’hui vous payez » affiche le montant du jour. Pour le ${ESS.name} seul, c’est ${eur(ESS.price)} €. Avec la boutique, ${eur(BOU.price)} €.
2. **Un code promo ?** Entrez-le dans la case prévue. Le prix remisé s’affiche avant le paiement.
3. **Cliquez sur « Commander et payer ».** La page de paiement s’ouvre.
4. **Choisissez votre façon de payer.** D’un coup, avec les moyens affichés sur la page (carte, Apple Pay, Google Pay, PayPal). Ou bien en ${FOIS} fois avec ${ORG}.
5. **Recevez votre facture** par e-mail. Elle est gardée aussi dans votre espace client.

## Comment marche le paiement en ${FOIS} fois

L’organisme, ${ORG}, nous verse le prix entier tout de suite. Vous le remboursez ensuite en ${FOIS} fois, selon l’échéancier qu’il vous propose. C’est lui qui donne son accord, avec ses propres conditions : le contrat se fait entre vous et lui. Que vous preniez le forfait ${mini.name} ou le forfait ${AUTO}, cette possibilité vous est offerte.

## Et le forfait ${mini.name} ?

Il se paie à part, chaque mois, et seulement à partir de la mise en ligne de votre site : ${eur(mini.month)} € par mois, ou ${eur(avecDom)} € si nous fournissons le nom de domaine. Vous enregistrez votre carte ce jour-là, pas avant. Avec le forfait ${AUTO}, il n’y a rien à payer chaque mois.

> Bon à savoir : vous disposez de 14 jours pour vous rétracter. Vous aviez choisi un démarrage immédiat ? Seule la part du travail déjà faite est alors retenue, et le reste vous est remboursé. Le détail est dans nos [conditions générales](/conditions-generales/).

Pas de frais cachés : le montant affiché avant de payer est celui de votre site, et les extras éventuels ont leur prix indiqué à l’avance.`,
    faq: [
      { q: 'Puis-je payer le forfait en plusieurs fois ?', a: `Le forfait ${mini.name} se paie déjà au mois, sans engagement. Le paiement en ${FOIS} fois concerne le prix de création du site.` },
      { q: 'Et si l’organisme refuse ?', a: 'Vous pouvez régler en une fois sur la même page. Votre commande reste gardée si le paiement n’aboutit pas, et vous pouvez réessayer.' },
    ],
    voir: ['deroulement-d-un-achat', 'apres-la-mise-en-ligne', 'site-pas-cher-sans-etre-bacle'],
  },

  // ------------------------------------------------------------------ le nom de domaine
  {
    slug: 'nom-de-domaine-le-mien-ou-le-votre',
    groupe: 'creer',
    icon: 'globe',
    monstre: 'gelee',
    nom: 'Le nom de domaine : le mien ou le vôtre ?',
    resume: 'Garder votre adresse ou en recevoir une à votre nom : les deux cas expliqués.',
    duree: 3,
    h1: 'Le nom de domaine : garder le mien, ou prendre le vôtre ?',
    title: 'Nom de domaine : le mien ou le vôtre ? | Les Minis Monstres',
    description: `Vous avez déjà une adresse pour votre site, ou il vous en faut une ? Les deux cas avec le forfait ${mini.name}, le prix, et ce qui reste toujours à votre nom.`,
    lead: 'Le nom de domaine, c’est l’adresse de votre site, comme votre-activite.fr. Vous gardez le vôtre, ou nous vous en fournissons un. Dans les deux cas, il est à votre nom.',
    espace: 'commande',
    body: `La réponse tout de suite : avec le forfait ${mini.name}, vous avez le choix. Si votre adresse existe déjà, vous payez ${eur(mini.month)} € par mois. Si elle reste à créer, nous la fournissons pour ${eur(dom)} € de plus, donc ${eur(avecDom)} € par mois. Avec le forfait ${AUTO}, vous gérez votre nom de domaine vous-même.

## Vous n’avez pas encore de nom de domaine

1. **Tapez le nom voulu** dans l’encadré « Votre nom de domaine » de la page de commande, et choisissez l’extension : .fr, .com, .net ou .org.
2. **Cliquez sur « Vérifier »** : vous voyez tout de suite s’il est libre.
3. **Commandez.** Le nom est réservé à votre nom après le paiement, s’il est toujours libre à ce moment-là.
4. **Laissez-nous faire le reste** : l’hébergement et le cadenas de sécurité se préparent ensuite, automatiquement.

Pas d’idée de nom ? Laissez la case vide : Alex le choisit avec vous. Les autres extensions, et les noms vendus plus cher par les registres, se font sur devis.

## Vous avez déjà votre nom de domaine

1. **Cochez « J’ai déjà un nom de domaine »** sur la page de commande, et indiquez-le. Oublié ? Le questionnaire vous le demandera.
2. **Recevez vos réglages par e-mail.** Pour que votre adresse mène à votre nouveau site, ses réglages se changent chez votre fournisseur actuel.
3. **Faites-les vous-même, ou confiez-les-nous** : vous pouvez nous envoyer vos identifiants, et nous nous en chargeons. Vous pouvez aussi transférer votre nom chez nous.

> Bon à savoir : le nom de domaine est toujours enregistré à votre nom. Avec le forfait ${mini.name}, nous figurons seulement comme contact technique, pour pouvoir le gérer pour vous.

## Si vous arrêtez un jour

Votre nom de domaine vous appartient. Vous pouvez le transférer chez le prestataire de votre choix. Votre site vous est remis sous forme d’export, prêt à déménager. Tant que votre abonnement est actif, le renouvellement chaque année est compris dans le supplément de ${eur(dom)} €.`,
    faq: [
      { q: 'Un bon nom de domaine, c’est quoi ?', a: 'Un nom court, facile à dire au téléphone et à écrire sans faute. Le plus souvent, c’est simplement le nom de votre activité.' },
    ],
    voir: ['deroulement-d-un-achat', 'combien-de-temps-pour-mon-site', 'apres-la-mise-en-ligne'],
  },

  // ------------------------------------------------------------------ après la mise en ligne
  {
    slug: 'apres-la-mise-en-ligne',
    groupe: 'creer',
    icon: 'rocket',
    monstre: 'etoile',
    nom: 'Après la mise en ligne',
    resume: `Votre première version, puis le forfait ${mini.name} ou ${AUTO} : ce qui se passe ensuite.`,
    duree: 4,
    h1: 'Que se passe-t-il après la mise en ligne de mon site ?',
    title: 'Que se passe-t-il après la mise en ligne ? | Les Minis Monstres',
    description: `Votre site est en ligne : voici la suite avec le forfait ${mini.name} ou ${AUTO}, comment le modifier et comment le faire grandir quand votre budget le permet.`,
    lead: 'Votre site n’est pas figé le jour de sa mise en ligne. C’est une première version, qui grandit avec vous, à votre rythme et selon votre budget.',
    espace: 'demandes',
    body: `La réponse tout de suite : vous recevez la première version de votre site, faite avec vos réponses et vos photos. Avec le forfait ${mini.name}, vous l’ajustez autant que vous voulez, seul ou avec notre aide. Avec le forfait ${AUTO}, on vous remet votre site et vous continuez seul.

## Avec le forfait ${mini.name}

1. **Ouvrez l’e-mail « Votre site est en ligne ! »** et cliquez sur « Voir mon site ». Regardez-le aussi sur votre téléphone, comme vos clients.
2. **Enregistrez votre carte** pour le forfait, qui démarre ce jour-là : ${eur(mini.month)} € par mois, sans engagement.
3. **Un texte ou une photo à changer ?** Dans votre espace client, « Modifier mon site moi-même » ouvre votre site en mode modification. Vous touchez, vous changez, c’est en ligne tout de suite. « Annuler la dernière » revient en arrière.
4. **Un changement plus important ?** Demandez-le dans « Mes modifications ». Bricou vous aide à le formuler, vous confirmez, et vous recevez un e-mail dès qu’il est en ligne. Une demande à la fois.
5. **Envie d’aller plus loin ?** Les extras s’ouvrent dans votre espace client dès la mise en ligne.

Pendant ce temps, nous gardons votre site en ligne, sauvegardé, protégé et à jour.

## Améliorable à tout moment

Commencez avec ce dont vous avez besoin, puis ajoutez le reste quand votre budget le permet :

- **une ${pageGoogle.name.toLowerCase()}** à ${eur(pageGoogle.prix)} € la page, en packs de ${packs}, pour être trouvé sur plus de recherches,
- **une traduction anglaise**, ou **une fonctionnalité spécifique** pour un besoin particulier : vous demandez un devis, il est gratuit.

## Avec le forfait ${AUTO}

Une fois votre site validé, il vous est remis en entier, fichiers et sauvegarde compris, avec une notice. Vous l’installez chez votre hébergeur, seul ou avec son aide. L’hébergement, les sauvegardes, les mises à jour et les modifications sont alors à votre charge. Vous changez d’avis ? Le forfait ${mini.name} peut s’ajouter plus tard.

> Bon à savoir : le forfait ${mini.name} s’arrête quand vous voulez. Vous gardez votre nom de domaine, vous recevez l’export de votre site, et il reste en ligne encore 30 jours, le temps de déménager.`,
    faq: [
      { q: 'Combien de modifications puis-je demander ?', a: `Autant que vous voulez avec le forfait ${mini.name}, une à la fois. Dès qu’une demande est terminée, vous pouvez envoyer la suivante.` },
    ],
    voir: ['creer-mon-site-avec-nous', 'alex-sera-toujours-la', 'nom-de-domaine-le-mien-ou-le-votre'],
  },
];
