// Mini Tuto, thème « pourquoi » : voir le format dans ./index.js.
// Pourquoi les Minis Monstres : le prix (pas de local, pas de loyer, tout depuis chez Alex), les modules, la bande, et ce qu'Alex fait lui-même.
// 25 novembre 2026 : ton premium, « 2 à 3 fois moins cher » (config.marche.foisTexte), le lave-vaisselle reste sur /la-maison/ seulement.
// Exact par rapport au code : l'appel d'Alex avant chaque site et son feu vert (atelier.php), le contrôle par un second
// petit monstre avant toute livraison, les cas délicats qui remontent à Alex (regles/escalade.md), les CGV (src/content/legal.js).
// Aucun prix écrit en dur : tout vient de src/config.js (les repères du marché : config.marche, sources sur la page Tarifs).
const cfg = require('../../config');
const { forfaits, creationSeule, offreSite, marche, bande, site } = cfg;

const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const ESS = offreSite.site, BOU = offreSite.avecBoutique, ECO = offreSite.option;
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0];
const AUTO = creationSeule.name;
const DELAI = ESS.delai;
const ville = site.address.city.replace(/'/g, '’');
const dept = site.address.department;
const B = (id) => bande.find((b) => b.id === id) || { nom: '', role: '' };

// La bande, écrite pour ce tuto : le caractère de chacun et ce qu'il fait pour vous (différent des textes de config.bande).
const PORTRAIT = {
  support: 'la plus bavarde de la bande, dans le bon sens. Elle répond dans la petite bulle de votre espace client, de jour comme de nuit.',
  constructeur: 'le bricoleur. Il assemble vos pages, et il vous aide à formuler vos demandes de modification pour qu’elles soient bien claires.',
  ecrivain: 'la rêveuse qui choisit ses mots avec soin. Elle tire de vos réponses des textes simples, faciles à lire sur un téléphone.',
  observateur: 'l’œil rivé sur Google. Elle prépare les pages qui aident vos futurs clients à vous trouver près de chez eux.',
  organisateur: 'le maniaque du rangement. Chaque page, chaque produit et chaque commande retrouve sa place avec lui.',
  extras: 'l’enthousiaste aux mille idées. Elle vous présente les extras et prépare un devis quand il en faut un.',
};
const laBande = bande.map((b) => `- **${b.nom}, ${minus(b.role)}** : ${PORTRAIT[b.id] || minus(b.court)}`).join('\n');

module.exports = [
  // ------------------------------------------------------------------ pourquoi nous
  {
    slug: 'pourquoi-choisir-les-minis-monstres',
    groupe: 'pourquoi',
    icon: 'heart-handshake',
    monstre: 'mochi',
    nom: 'Pourquoi passer par nous ?',
    resume: 'Ce que vous trouvez chez les Minis Monstres, et ce que vous ne trouverez pas.',
    duree: 3,
    h1: 'Pourquoi passer par les Minis Monstres plutôt que par quelqu’un d’autre ?',
    title: 'Pourquoi passer par les Minis Monstres ? | Les Minis Monstres',
    description: 'Un site professionnel soigné, une personne qui vous répond, l’accès à toutes vos pages et un prix juste : ce qui fait notre différence.',
    lead: 'Beaucoup d’entrepreneurs n’ont pas plusieurs milliers d’euros à mettre dans un site. C’est pour eux que les Minis Monstres existent.',
    body: `La réponse tout de suite : chez nous, vous avez un site professionnel, fait avec soin, suivi de près, et vous gardez la main sur tout. Et derrière, il y a une personne qui vous connaît : Alex.

## Ce que vous trouvez chez nous

1. **Un prix clair, le même pour tous.** ${eur(ESS.price)} € la création du ${ESS.name}, ${eur(BOU.price)} € avec l’option ${ECO.name}. Pas de devis à attendre, pas de ligne surprise.
2. **Un vrai site, pas un modèle à remplir seul.** Nos modules sont assemblés pour vous, puis garnis de vos textes, de vos informations et de vos photos.
3. **Un parcours sans mauvaise surprise.** Un questionnaire précis, puis un appel d’Alex avant qu’il commence votre site. Rien n’est inventé sur votre activité.
4. **Une vérification avant chaque livraison.** Votre site est relu d’un œil neuf avant d’arriver chez vous.
5. **L’accès à tout.** Votre espace client vous montre la liste de toutes vos pages, dont vos pages de visibilité Google. Avec le forfait ${mini.name}, vous modifiez vous-même un texte ou une photo, en direct.
6. **Un site qui suit votre budget.** Vous commencez avec l’essentiel, et vous ajoutez des pages ou des extras plus tard, quand vous le décidez.
7. **Votre liberté.** Le nom de domaine est à votre nom, le forfait ${mini.name} est sans engagement, et l’export de votre site reste possible.

## Pour qui nous travaillons

Artisans, commerçants, indépendants, associations, professions libérales : des activités qui font du bon travail et qui méritent d’être trouvées sur internet. D’après les repères publics affichés sur notre page [tarifs](/tarifs/), un site vitrine fait par un indépendant coûte souvent entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €. Chez nous, elle coûte ${marche.foisTexte} fois moins, parce qu’Alex travaille depuis chez lui : ni local, ni agence, ni loyer à faire payer.

## Ce que nous ne promettons pas

Nous ne faisons pas d’applications sur mesure ni de catalogues de plusieurs milliers d’articles. Si votre projet demande cela, nous vous le disons tout de suite, et nous vous orientons ailleurs.

> Bon à savoir : vous hésitez encore ? Écrivez-nous par le [formulaire de contact](/contact/). Poser une question ne vous engage à rien.`,
    faq: [
      { q: 'Faut-il habiter dans les Ardennes ?', a: `Non. Alex travaille depuis ${ville}, mais tout se fait à distance, partout en France : la commande en ligne, le questionnaire, puis l’appel.` },
    ],
    voir: ['minis-monstres-ou-developpeur-web', 'site-pas-cher-sans-etre-bacle', 'alex-sera-toujours-la'],
  },

  // ------------------------------------------------------------------ face à un développeur
  {
    slug: 'minis-monstres-ou-developpeur-web',
    groupe: 'pourquoi',
    icon: 'scale',
    monstre: 'champi',
    nom: 'Nous ou un développeur web ?',
    resume: 'Qui fait le travail, comment, et pour quel prix : les vraies différences.',
    duree: 4,
    h1: 'Quelle différence entre les Minis Monstres et un développeur web ?',
    title: 'Les Minis Monstres ou un développeur web ? | Les Minis Monstres',
    description: 'Alex est autodidacte et travaille avec les dernières technologies. Ce qui change avec un développeur web : résultat, méthode, contrôle, prix.',
    lead: 'Disons-le franchement : Alex n’a pas de diplôme de développeur. Il a appris seul, et il s’entoure des meilleurs outils pour faire le même travail.',
    body: `La réponse tout de suite : pour présenter une activité ou vendre quelques produits, le résultat se compare. Un développeur web écrirait le même genre de site, rapide, clair et lisible sur téléphone. La différence se trouve dans la façon de le fabriquer, donc dans le temps passé, donc dans le prix.

## Alex, autodidacte

Alex a construit les Minis Monstres sans formation de développeur. Il s’appuie sur des outils qui l’aident à écrire et à vérifier le code, et il suit de près les dernières technologies du web. Là où un développeur écrit tout lui-même, Alex prépare, guide et contrôle. Le site final respecte les mêmes exigences : vitesse, sécurité, lisibilité, bases de la visibilité sur Google.

## Point par point

1. **Qui conçoit votre site ?** Chez un développeur, lui. Chez nous, Alex a conçu une fois pour toutes les modules dont votre site est fait, puis il les remplit avec vos réponses.
2. **Combien de temps ?** Des jours ou des semaines pour un site fait entièrement à la main. Chez nous, ${DELAI} en général après l’appel d’Alex.
3. **Qui vérifie ?** Chez nous, un second petit monstre contrôle le travail du premier avant toute livraison, selon les règles écrites par Alex. Les cas délicats arrivent toujours chez lui.
4. **Qui vous parle ?** Alex vous appelle avant chaque site, et il répond à vos messages.
5. **Combien ça coûte ?** Comptez souvent, chez un indépendant, pour ${marche.pagesCompare} pages de site vitrine, entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €, d’après les repères de notre page [tarifs](/tarifs/). Le ${ESS.name} coûte ${eur(ESS.price)} €, soit ${marche.foisTexte} fois moins : Alex travaille depuis chez lui, sans loyer à répercuter sur vos factures.
6. **Et après ?** Avec le forfait ${mini.name}, vos modifications sont comprises dans les ${eur(mini.month)} € par mois. Avec le forfait ${AUTO}, vous repartez avec votre site.

## Quand un développeur reste le bon choix

Une application métier, un logiciel sur mesure, un très gros catalogue, une connexion à des outils internes : ces projets demandent un développeur expérimenté. Nous ne les prenons pas, et nous vous le disons dès le premier échange.

> Bon à savoir : un outil peut se tromper, comme une personne. C’est pour cela que rien n’est livré sans contrôle, et qu’Alex garde la main sur tout ce qui compte pour vous.`,
    faq: [
      { q: 'Mon site sera-t-il moins solide ?', a: 'Non. Il repose sur une base commune, éprouvée site après site, qui gère la vitesse, la sécurité et l’affichage sur téléphone. C’est le même socle pour chaque client.' },
    ],
    voir: ['site-pas-cher-sans-etre-bacle', 'alex-sera-toujours-la', 'qui-sont-les-minis-monstres'],
  },

  // ------------------------------------------------------------------ le prix
  {
    slug: 'site-pas-cher-sans-etre-bacle',
    groupe: 'pourquoi',
    icon: 'piggy-bank',
    monstre: 'bricou',
    nom: 'Moins cher, sans rien bâcler',
    resume: 'Les trois raisons du prix, et tout ce qui ne baisse jamais.',
    duree: 3,
    h1: `Comment un site soigné peut-il coûter ${marche.foisTexte} fois moins cher ?`,
    title: 'Un site moins cher, sans rien bâcler : comment ? | Les Minis Monstres',
    description: `Comment le ${ESS.name} coûte ${marche.foisTexte} fois moins cher qu’un site d’indépendant : ni local ni loyer, des modules soignés, et Alex qui vérifie tout.`,
    lead: 'Un prix doux fait parfois peur. Ici, il vient des frais que nous n’avons pas, jamais des étapes sautées. Voici comment.',
    body: `La réponse tout de suite : nous n’avons ni local, ni agence, ni loyer à vous faire payer. Alex fait tout depuis chez lui. Le soin, lui, reste le même.

## Les trois raisons du prix

1. **Ni local, ni agence, ni loyer.** Pas de bureaux à chauffer et à éclairer, pas de vitrine en ville, pas de commerciaux à rémunérer. Ces frais n’existent pas chez nous, donc ils n’apparaissent nulle part sur votre facture.
2. **Des modules soignés une fois pour toutes.** Accueil, présentation, galerie, contact, questions fréquentes, services et tarifs : Alex a peaufiné chacun d’eux. Pour votre site, il les assemble et les façonne à votre image.
3. **Les tâches répétitives outillées.** Alléger les photos ou vérifier les liens ne demande pas de talent particulier : nos petits monstres s’en chargent, et le temps gagné va au design et aux détails.

## Un prix juste, pas un prix au rabais

Le prix doit rester doux pour vous, et assez juste pour qu’Alex vive de son travail. C’est ce qui lui permet de prendre le temps de chaque site, et d’être encore là dans quelques années pour vous répondre.

## Ce qui ne baisse jamais

- **L’écoute** : un questionnaire précis, et l’appel d’Alex avant chaque site.
- **Le contrôle** : Alex vérifie votre site une dernière fois, en entier, avant de vous le livrer.
- **La qualité** : un site rapide, lisible sur téléphone, avec un formulaire de contact et les bases de la visibilité sur Google.
- **La vérité** : rien n’est inventé sur votre activité, ni avis, ni prix, ni service.

## Un prix qui suit votre budget

Le ${ESS.name} est une base complète. Vous l’enrichissez plus tard, une page ou un extra à la fois, quand vous en avez envie et les moyens. Rien ne vous oblige à tout prendre d’un coup.

> Bon à savoir : la méthode complète, avec les repères du marché et leurs sources, est expliquée sur la page [pourquoi moins cher](/pourquoi-moins-cher/).`,
    voir: ['minis-monstres-ou-developpeur-web', 'qui-sont-les-minis-monstres', 'pourquoi-choisir-les-minis-monstres'],
  },

  // ------------------------------------------------------------------ la bande
  {
    slug: 'qui-sont-les-minis-monstres',
    groupe: 'pourquoi',
    icon: 'users',
    monstre: 'mascotte',
    nom: 'Qui sont les Minis Monstres ?',
    resume: `${bande.length} petits monstres, un caractère chacun, et beaucoup de travail derrière.`,
    duree: 3,
    h1: 'Qui sont les Minis Monstres ?',
    title: 'Qui sont les Minis Monstres de la bande ? | Les Minis Monstres',
    description: `${bande.map((b) => b.nom).join(', ').replace(/, ([^,]+)$/, ' et $1')} : qui sont les petits monstres d’Alex, ce que fait chacun, et le travail qu’il a fallu pour les créer.`,
    lead: `Derrière chaque site, il y a Alex et une petite bande de ${bande.length} compagnons. Chacun a son prénom, son métier et son caractère.`,
    body: `La réponse tout de suite : les Minis Monstres, ce sont les outils qu’Alex a programmés pour l’aider, dessinés en petits personnages. Chacun s’occupe d’une tâche précise. Ensemble, ils permettent de faire un site soigné en beaucoup moins de temps.

## La petite bande

${laBande}

## Le travail derrière

Les Minis Monstres ne sont pas sortis d’une boîte. Alex y a mis beaucoup de temps :

1. **Les programmer**, un par un, pour qu’ils fassent bien une seule chose.
2. **Leur donner une personnalité**, pour qu’ils s’adressent à vous simplement, avec le sourire.
3. **Les faire travailler en équipe** : l’un fabrique, un autre relit d’un œil neuf, et seuls les cas délicats montent jusqu’à Alex.
4. **Écrire leurs règles** : ne rien inventer, retirer plutôt qu’ajouter en cas de doute, et toujours préférer la prudence.

Tout cela coûte du temps et de l’argent. Alex a fait ce choix pour une raison simple : que tout le monde en profite, et surtout les entrepreneurs qui ne peuvent pas payer un site de plusieurs milliers d’euros.

## Ce qu’ils ne font pas

Aucun d’eux ne fait de choix pour vous, et aucun ne prend la place d’Alex. Il les a créés, il fixe leurs règles, et il reprend la main dès qu’un cas sort de l’ordinaire.

> Bon à savoir : vous croiserez surtout ${B('support').nom} et ${B('constructeur').nom} dans votre espace client. Vous voulez voir toute la bande en images ? Elle vous attend sur la page [notre équipe](/notre-equipe/).`,
    faq: [
      { q: 'Est-ce que je parle à un petit monstre ou à une personne ?', a: `Les deux. ${B('support').nom} répond dans la bulle de votre espace client, et ${B('constructeur').nom} prépare vos demandes. Alex vous appelle avant votre site, et il répond aux messages du formulaire de contact.` },
    ],
    voir: ['alex-sera-toujours-la', 'site-pas-cher-sans-etre-bacle', 'minis-monstres-ou-developpeur-web'],
  },

  // ------------------------------------------------------------------ Alex
  {
    slug: 'alex-sera-toujours-la',
    groupe: 'pourquoi',
    icon: 'user-check',
    monstre: 'clin',
    nom: 'Alex sera toujours là',
    resume: 'Ce qu’Alex fait lui-même, pour chaque site, et comment le joindre.',
    duree: 3,
    h1: 'Alex sera toujours là : ce qu’il fait lui-même, à chaque site',
    title: 'Alex sera toujours là, à chaque site | Les Minis Monstres',
    description: 'La bande travaille vite, mais Alex reste derrière chaque site : l’appel avant la création, les règles du contrôle, les cas délicats et vos messages.',
    lead: 'Nos petits monstres font beaucoup. Mais vous n’êtes jamais seul face à une machine : Alex est là, du premier appel jusqu’à longtemps après la mise en ligne.',
    body: `La réponse tout de suite : Alex a créé les Minis Monstres, et il en répond personnellement. Il vous appelle avant votre site, il a écrit les règles que suit la bande, il est prévenu de chaque livraison, et il traite lui-même tout ce qui est délicat.

## Ce qu’Alex fait lui-même

1. **Il vous appelle avant chaque site.** Une fois votre questionnaire reçu, il vous téléphone pour parler de votre projet. C’est lui qui donne ensuite le feu vert à la bande.
2. **Il a écrit les règles du travail.** Ne rien inventer, tout vérifier, rester prudent : chaque petit monstre suit ses consignes, à chaque site.
3. **Il organise le contrôle.** Chaque site est relu par un second petit monstre avant toute livraison, et Alex reçoit un message dès qu’un site part chez son client.
4. **Il tranche les cas délicats.** Un remboursement, une réclamation, un accès à votre nom de domaine, une demande qui sort du forfait : tout cela arrive directement chez lui.
5. **Il répond à vos messages.** Ce que vous écrivez par le formulaire de contact, c’est lui qui le lit.

## Comment le joindre

- Par le [formulaire de contact](/contact/), avant ou après votre commande.
- En répondant simplement à un e-mail que nous vous avons envoyé.
- Pendant l’appel, avant la création de votre site.

## Pourquoi c’est important pour lui

Alex est installé à ${ville}, dans les ${dept}. Il a construit les Minis Monstres pour rendre le web accessible aux petites activités, sans les laisser seules avec un outil. Les petits monstres lui font gagner du temps. Ce temps, il le garde pour vous écouter.

> Bon à savoir : avec le forfait ${mini.name}, vous n’êtes pas lâché après la mise en ligne. Vos modifications sont comprises, et une vraie personne reste derrière votre site, mois après mois.`,
    voir: ['appel-avec-alex', 'qui-sont-les-minis-monstres', 'pourquoi-choisir-les-minis-monstres'],
  },
];
