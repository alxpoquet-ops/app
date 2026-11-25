// Mini Tuto, thème « pourquoi » : voir le format dans ./index.js.
// Pourquoi les Minis Monstres : le prix (des charges réduites au maximum, sans les détailler), les modules, la bande, et ce qu'Alex fait lui-même.
// 25 novembre 2026 : ton premium, « 2 à 3 fois moins cher » (config.marche.foisTexte), le lave-vaisselle reste sur /la-maison/ seulement.
// Exact par rapport au code : depuis le 25 novembre 2026, plus d'appel ni de feu vert, le questionnaire envoyé lance la
// création (atelier.php) ; le contrôle par un second petit monstre avant toute livraison, les cas délicats qui remontent à Alex (regles/escalade.md), les CGV (src/content/legal.js).
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
2. **Un vrai site, fait pour vous.** Alex le crée avec vos textes, vos informations et vos photos. Vous n’avez rien à monter vous-même.
3. **Un parcours sans mauvaise surprise.** Un questionnaire précis, et votre site se construit avec vos réponses. Rien n’est inventé sur votre activité.
4. **Une vérification avant chaque livraison.** Votre site est relu d’un œil neuf avant d’arriver chez vous.
5. **L’accès à tout.** Votre espace client vous montre la liste de toutes vos pages, dont vos pages de visibilité Google. Avec le forfait ${mini.name}, vous modifiez vous-même un texte ou une photo, en direct.
6. **Un site qui suit votre budget.** Vous commencez avec l’essentiel, et vous ajoutez des pages ou des extras plus tard, quand vous le décidez.
7. **Votre liberté.** Le nom de domaine est à votre nom, le forfait ${mini.name} est sans engagement, et l’export de votre site reste possible.

## Pour qui nous travaillons

Artisans, commerçants, indépendants, associations, professions libérales : des activités qui font du bon travail et qui méritent d’être trouvées sur internet. D’après les repères publics affichés sur notre page [tarifs](/tarifs/), un site vitrine fait par un indépendant coûte souvent entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €. Chez nous, il coûte ${marche.foisTexte} fois moins, parce que nous gardons nos charges au plus bas.

## Ce que nous ne promettons pas

Nous ne faisons pas d’applications sur mesure ni de catalogues de plusieurs milliers d’articles. Si votre projet demande cela, nous vous le disons tout de suite, et nous vous orientons ailleurs.

> Bon à savoir : vous hésitez encore ? Écrivez-nous par le [formulaire de contact](/contact/). Poser une question ne vous engage à rien.`,
    faq: [
      { q: 'Faut-il habiter dans les Ardennes ?', a: `Non. Alex travaille depuis ${ville}, mais tout se fait à distance, partout en France : la commande en ligne, le questionnaire, puis vos messages si besoin.` },
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

Alex a construit les Minis Monstres sans formation de développeur. Il s’appuie sur des outils qui l’aident à écrire et à vérifier le code, et il suit de près les dernières technologies du web. Là où un développeur écrit tout lui-même, Alex prépare, guide et fixe les règles du contrôle. Le site final respecte les mêmes exigences : vitesse, sécurité, lisibilité, bases de la visibilité sur Google.

## Point par point

1. **Qui conçoit votre site ?** Chez un développeur, lui. Chez nous aussi, une personne : Alex crée votre site avec vos réponses, vos textes, vos photos et vos couleurs.
2. **Combien de temps ?** Des jours ou des semaines pour un site fait entièrement à la main. Chez nous, ${DELAI} en général une fois vos éléments reçus.
3. **Qui vérifie ?** Chez nous, un second petit monstre contrôle le travail du premier avant toute livraison, selon les règles écrites par Alex. Les cas délicats arrivent toujours chez lui.
4. **Qui vous parle ?** Alex, la personne derrière les Minis Monstres : il répond à vos messages.
5. **Combien ça coûte ?** Comptez souvent, chez un indépendant, pour ${marche.pagesCompare} pages de site vitrine, entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €, d’après les repères de notre page [tarifs](/tarifs/). Le ${ESS.name} coûte ${eur(ESS.price)} €, soit ${marche.foisTexte} fois moins : nos charges sont minimes, et vos factures aussi.
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
    description: `Comment le ${ESS.name} coûte ${marche.foisTexte} fois moins cher qu’un site d’indépendant : des charges réduites au maximum, et un contrôle avant chaque livraison.`,
    lead: 'Un prix doux fait parfois peur. Ici, il vient de charges tenues au plus bas, jamais d’étapes sautées. Voici comment.',
    body: `La réponse tout de suite : nous avons réduit nos charges au maximum, et c’est vous qui en profitez. Le soin, lui, reste le même.

## Les deux raisons du prix

1. **Des charges au plus bas.** Nous dépensons le strict nécessaire pour faire tourner la maison : tout ce que vous réglez sert à votre site.
2. **Pas de réunion, pas de devis à attendre.** Un questionnaire précis suffit : Alex crée votre site avec vos réponses, vos photos et vos couleurs. Le temps qu’une agence passe en rendez-vous, il le passe sur votre site.

## Un prix juste, pas un prix au rabais

Le prix doit rester doux pour vous, et assez juste pour qu’Alex vive de son travail. C’est ce qui lui permet de prendre le temps de chaque site, et d’être encore là dans quelques années pour vous répondre.

## Ce qui ne baisse jamais

- **L’écoute** : un questionnaire précis, et Alex qui répond à vos messages.
- **Le contrôle** : votre site est vérifié page par page avant de vous être livré.
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
      { q: 'Est-ce que je parle à un petit monstre ou à une personne ?', a: `Les deux. ${B('support').nom} répond dans la bulle de votre espace client, et ${B('constructeur').nom} prépare vos demandes. Alex, lui, répond aux messages du formulaire de contact.` },
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
    description: 'La bande travaille vite, mais Alex reste derrière chaque site : les règles du travail, l’organisation du contrôle, les cas délicats et vos messages.',
    lead: 'Nos petits monstres font beaucoup. Mais vous n’êtes jamais seul face à une machine : Alex est là, de votre commande jusqu’à longtemps après la mise en ligne.',
    body: `La réponse tout de suite : Alex a créé les Minis Monstres, et il en répond personnellement. Il a écrit les règles que suit la bande, il est prévenu de chaque livraison, et il traite lui-même tout ce qui est délicat.

## Ce qu’Alex fait lui-même

1. **Il a écrit les règles du travail.** Ne rien inventer, tout vérifier, rester prudent : chaque petit monstre suit ses consignes, à chaque site.
2. **Il organise le contrôle.** Chaque site est relu par un second petit monstre avant toute livraison, et Alex reçoit un message dès qu’un site part chez son client.
3. **Il tranche les cas délicats.** Un remboursement, une réclamation, un accès à votre nom de domaine, une demande qui sort du forfait : tout cela arrive directement chez lui.
4. **Il répond à vos messages.** Ce que vous écrivez par le formulaire de contact, c’est lui qui le lit.

## Comment le joindre

- Par le [formulaire de contact](/contact/), avant ou après votre commande.
- En répondant simplement à un e-mail que nous vous avons envoyé.

## Pourquoi c’est important pour lui

Alex est installé à ${ville}, dans les ${dept}. Il a construit les Minis Monstres pour rendre le web accessible aux petites activités, sans les laisser seules avec un outil. Les petits monstres lui font gagner du temps. Ce temps, il le garde pour vous écouter.

> Bon à savoir : avec le forfait ${mini.name}, vous n’êtes pas lâché après la mise en ligne. Vos modifications sont comprises, et une vraie personne reste derrière votre site, mois après mois.`,
    voir: ['qui-sont-les-minis-monstres', 'pourquoi-choisir-les-minis-monstres', 'minis-monstres-ou-developpeur-web'],
  },
];
