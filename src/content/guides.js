// Guides : des pages utiles qui répondent aux vraies questions de ceux qui veulent un site.
// Règles (scripts/check.js) : title de 65 caractères au plus, description de 120 à 160,
// aucun tiret long, aucun prix d'un concurrent nommé (seule la fourchette du marché de config.marche est citée),
// aucun faux avis, et pas de phrase de 9 mots ou plus reprise d'une autre page.
// Offre du 19 novembre 2026 : trois sites payés une fois (config.types : Site Essentiel, Site Visibilité, Site Boutique),
// puis deux façons de faire vivre le site : Autonomie (config.creationSeule, sans abonnement, export du site remis au client)
// ou Mini (config.forfaits[0], au mois, sans engagement, modifications incluses, une demande à la fois). L'abonnement est facultatif.
// Trois extras seulement : la page de visibilité Google (payée une fois, par carte, depuis l'espace client), la traduction
// anglaise et la fonctionnalité spécifique (sur devis). La petite bande (config.bande) compte six Minis Monstres.
// Chaque mot technique est expliqué la première fois qu'il apparaît dans un guide.
// Ton (tour global du 19 novembre 2026) : « nous / on », Alex nommé quand c'est utile (jamais « je »), vouvoiement, « site internet »,
// « visibilité sur Google » plutôt que « référencement », « modification ». Ordre de l'offre : le site, puis Autonomie ou Mini, enfin les extras.
// Fil rouge : un site internet rend visible. Guides courts, pensés pour le téléphone.
const cfg = require('../config');
const { sourcesMd, INDEPENDANT_DES } = require('../lib/components');
const { forfaits, paiement, fractionne, creation, marche, bande, types, creationSeule, aLaDemande } = cfg;
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500
const acompte = (p) => eur(Math.round(p * paiement.acompte) / 100);
const reste = (p) => eur(p - Math.round(p * paiement.acompte) / 100);
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);

// L'offre : trois sites, un abonnement facultatif (Mini) ou la formule Autonomie, et trois extras.
const T = (id) => types.find((t) => t.id === id) || {};
const ESS = T('une-page'), VIS = T('vitrine'), BOU = T('boutique');
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0]; // Mini, le seul abonnement
const dom = mini.domaine || 2; // le nom de domaine fourni par nos soins : en plus, par mois
const avecDom = mini.month + dom; // le forfait Mini avec le nom de domaine
const AUTO = creationSeule.name; // sans abonnement
const pageGoogle = aLaDemande.find((x) => x.id === 'packseo' && !x.retire) || { name: 'Page de visibilité Google', prix: 0 };
const prixPage = eur(pageGoogle.prix); // la page de visibilité Google, payée une fois
const delaiModif = `jusqu’à ${mini.delai.replace(/ heures?$/, ' h')}`; // une modification peut prendre jusqu'à 48 h
const EN_FOIS = `en ${fractionne.fois} fois avec ${fractionne.organismes}`; // par un organisme externe, sur la page de paiement
// La petite bande : prénom et métier (« Cerise, la secrétaire »).
const B = (id) => bande.find((b) => b.id === id);
const qui = (id) => `${B(id).nom}, ${minus(B(id).role)}`;

const PUBLIE = '2026-11-14';

const guides = [
  // ------------------------------------------------------------------ par métier
  {
    slug: 'site-internet-restaurant',
    groupe: 'metier',
    icon: 'store',
    nom: 'Site internet pour restaurant',
    resume: 'La carte, les horaires, l’adresse : les trois choses que vos clients cherchent, et comment les montrer.',
    h1: 'Site internet pour restaurant : la carte, les horaires, la réservation',
    title: 'Site internet pour restaurant : carte et horaires | Les Minis Monstres',
    description: 'Ce que les clients cherchent sur le site d’un restaurant : la carte, les horaires, l’adresse et un moyen de réserver. Comment le faire simplement, à prix fixe.',
    lead: 'Avant de pousser votre porte, un client veut savoir trois choses : ce qu’on mange, à quel prix, et si vous êtes ouvert ce soir. Votre site doit répondre en dix secondes.',
    body: `## Être dans la liste quand on a faim

Celui qui cherche où manger choisit parmi les restaurants qu’il voit sur son téléphone. Un site internet, avec votre fiche Google, vous met dans cette liste.

## Ce que vos clients cherchent vraiment

Quelqu'un qui tape le nom de votre restaurant est presque toujours sur son téléphone, souvent dans la rue ou en voiture. Il ne lit pas de longs textes. Il veut :

- **La carte et les prix**, lisibles sans zoomer.
- **Les horaires du jour**, y compris les jours de fermeture.
- **L'adresse**, avec un bouton qui ouvre l'itinéraire.
- **Un moyen de réserver** : un bouton d'appel, un formulaire, ou un lien vers votre outil de réservation si vous en utilisez déjà un.

## L'erreur la plus fréquente : la carte en photo ou en PDF

Une carte prise en photo est illisible sur un petit écran, et Google ne peut pas la lire du tout. Résultat : si un client cherche « restaurant couscous » dans votre ville, vous n'apparaissez pas, même si c'est votre spécialité.

La bonne méthode est d'**écrire la carte en vrai texte** sur le site. Elle se lit bien partout, et chaque plat devient un mot que Google peut associer à votre établissement.

## Une carte qui change souvent

C'est la vraie difficulté pour un restaurant : le plat du jour, la carte de saison, les congés annuels. Un site qui affiche encore le menu de l'été en plein hiver donne une mauvaise image.

Avec le forfait ${mini.name}, vous ne touchez jamais au site. Vous envoyez la nouvelle carte depuis votre espace client, la page privée où vous faites vos demandes. ${qui('constructeur')} de notre petite bande, vérifie avec vous ce qui change. Puis Alex met la carte à jour.

Ces changements sont compris dans le forfait : vous envoyez votre demande, et vous êtes prévenu dès que la nouvelle carte est en ligne. Vous préférez tout gérer seul ? Le forfait ${AUTO} existe aussi. Les deux sont présentées sur la page [tarifs](/tarifs/).

## Quel site choisir ?

Une seule page bien faite convient à beaucoup de restaurants : une belle photo de la salle, la carte, les horaires, le plan, le contact. Tout se fait défiler d’un doigt. C’est le ${ESS.name}, à ${eur(ESS.price)} €.

Vous avez plusieurs activités, comme le traiteur, la privatisation de salle ou la vente à emporter ? Prenez le ${VIS.name}, à ${eur(VIS.price)} €, qui compte jusqu’à ${creation.pages} pages. Ses pages de visibilité Google aident à vous faire trouver sur des recherches comme « menu du midi » ou « repas de groupe », suivies du nom de votre ville.

## Ne négligez pas les photos

Deux ou trois photos lumineuses de vos plats et de votre salle font plus que n'importe quel texte. Prenez-les à la lumière du jour, près d'une fenêtre, sans flash. Pas besoin d'un photographe pour commencer.

## Votre fiche Google compte autant que le site

Les horaires que Google affiche viennent de votre fiche d'établissement. Si elle est fausse, le client se déplace pour rien. Le guide sur la [fiche Google](/guides/fiche-google-entreprise/) explique comment la tenir à jour.`,
    faq: [
      { q: 'Puis-je changer ma carte moi-même ?', a: 'Vous n’avez pas besoin de toucher au site. Écrivez la nouvelle carte, ou envoyez une photo de votre ardoise, depuis votre espace client. La page est préparée pour vous, Alex la vérifie, puis elle est publiée.' },
      { q: 'Mon restaurant a déjà une page sur les réseaux sociaux, est-ce suffisant ?', a: 'C’est un bon complément, mais une personne sans compte ne voit pas toujours votre page, et la carte y est vite enterrée sous les publications. Un site garde les informations essentielles toujours au même endroit.' },
      { q: 'Peut-on réserver une table depuis le site ?', a: 'Oui : par un bouton d’appel, par un formulaire qui arrive dans votre boîte mail, ou par un lien vers l’outil de réservation que vous utilisez déjà.' },
    ],
    voir: ['fiche-google-entreprise', 'prix-site-internet', 'site-une-page-ou-site-vitrine'],
  },
  {
    slug: 'site-internet-coiffeur-institut',
    groupe: 'metier',
    icon: 'scissors',
    nom: 'Site internet pour coiffeur ou institut',
    resume: 'Tarifs, photos, prise de rendez-vous : un site simple pour un salon de coiffure ou de beauté.',
    h1: 'Site internet pour salon de coiffure ou institut de beauté',
    title: 'Site internet pour coiffeur ou institut de beauté | Les Minis Monstres',
    description: 'Tarifs clairs, photos de vos réalisations, horaires et prise de rendez-vous : ce qu’il faut sur le site d’un salon de coiffure ou d’un institut de beauté.',
    lead: 'Une nouvelle cliente compare deux ou trois salons avant de choisir. Elle regarde les tarifs, les photos et la facilité à prendre rendez-vous. Le salon qui montre tout ça clairement a une longueur d’avance.',
    body: `## Le salon que l’on trouve a une longueur d’avance

Un salon sans site internet ne se compare pas : on ne le voit pas. Voici ce qu’il faut montrer une fois que l’on vous a trouvé.

## Les tarifs d'abord

C'est la première chose que l'on cherche, et la première chose que beaucoup de salons cachent. Une grille de tarifs claire évite les appels « juste pour un prix » et rassure : personne n'aime découvrir le montant à la caisse.

Écrivez vos prestations comme vous les dites au salon : coupe femme, couleur, balayage, soin du visage, épilation. Ce sont exactement les mots que vos clientes tapent sur Google.

## Vos réalisations en photos

Dans votre métier, le résultat se voit. Quelques photos de vos coupes, de vos couleurs ou de votre cabine donnent envie bien mieux qu'une longue présentation.

Demandez toujours l'accord de la personne avant de publier sa photo. Un simple « je peux la mettre sur mon site ? » suffit, et la plupart disent oui avec plaisir.

## La prise de rendez-vous

Votre site doit rendre le rendez-vous facile, quelle que soit votre façon de travailler :

- Vous prenez les rendez-vous **par téléphone** : un gros bouton d'appel, visible dès l'ouverture de la page.
- Vous utilisez **un agenda en ligne** : un bouton « Prendre rendez-vous » mène directement à votre agenda.
- Vous préférez **être contactée par écrit** : un formulaire court, qui arrive dans votre boîte mail.

Pas encore d’agenda en ligne ? Commencez avec le téléphone et le formulaire. Le jour où vous en adoptez un, demandez l’ajout du bouton : avec le forfait ${mini.name}, c’est une modification comme une autre. Pour une prise de rendez-vous construite dans votre site, demandez un devis : c’est une fonctionnalité spécifique.

## Ce qui fait venir de nouvelles clientes

Une cliente qui vient d'emménager tape « coiffeur » suivi du nom de son quartier ou de sa ville. Pour apparaître, deux choses comptent : votre [fiche Google](/guides/fiche-google-entreprise/) avec de vrais avis, et un site qui dit clairement où vous êtes et ce que vous faites.

Votre site peut aller plus loin. Le ${VIS.name} compte jusqu’à ${creation.pages} pages, pensées pour Google. Plus tard, vous pouvez commander des pages de visibilité Google depuis votre espace client, à ${prixPage} € la page. Chacune vise une recherche précise, comme « balayage » ou « coiffeur à domicile ». Votre [visibilité sur Google](/referencement-seo/) grandit ainsi page après page.

## Quel site pour un salon ?

Une seule page contient souvent l’essentiel : la présentation, les tarifs, les photos, les horaires et le contact. C’est le ${ESS.name}, à ${eur(ESS.price)} €.

Si vous avez plusieurs univers (coiffure, esthétique, onglerie, vente de produits), chacun peut avoir sa page. Prenez alors le ${VIS.name}, à ${eur(VIS.price)} € pour ${creation.pages} pages au plus.

## Les horaires et les congés

Un salon change souvent ses horaires : nocturne, fermeture exceptionnelle, vacances. Vous l'indiquez dans votre espace client, et le site est à jour sans que vous ayez à apprendre quoi que ce soit.`,
    faq: [
      { q: 'Faut-il afficher tous mes tarifs sur le site ?', a: 'Nous vous le conseillons. Les prestations dont le prix dépend de la longueur ou du travail peuvent être indiquées avec un « à partir de ». Ce qui compte, c’est que la cliente ait un ordre d’idée avant de venir.' },
      { q: 'Je travaille seule à domicile, un site est-il utile ?', a: 'Oui, peut-être encore plus : sans vitrine dans la rue, votre site et votre fiche Google sont le seul endroit où l’on peut vous découvrir. Une seule page suffit largement pour commencer.' },
      { q: 'Puis-je relier mon agenda de rendez-vous en ligne ?', a: 'Oui. Si vous utilisez déjà un service de prise de rendez-vous, le bouton du site y mène directement. Sinon, un bouton d’appel et un formulaire font très bien l’affaire en attendant.' },
    ],
    voir: ['fiche-google-entreprise', 'site-une-page-ou-site-vitrine', 'choisir-nom-de-domaine'],
  },
  {
    slug: 'site-internet-auto-entrepreneur',
    groupe: 'metier',
    icon: 'rocket',
    nom: 'Site internet pour auto-entrepreneur',
    resume: 'Vous lancez votre activité : un site sérieux sans y laisser votre trésorerie de départ.',
    h1: 'Site internet pour auto-entrepreneur : bien démarrer sans se ruiner',
    title: 'Site internet pour auto-entrepreneur : bien démarrer | Les Minis Monstres',
    description: `Vous lancez votre micro-entreprise ? Un site clair pour inspirer confiance et trouver vos premiers clients, dès ${eur(ESS.price)} € avec ${paiement.acompte} % seulement à la commande.`,
    lead: 'Quand on démarre seul, on n’a ni réputation ni budget. Un site propre règle le premier problème sans creuser le second.',
    body: `## Pourquoi un site dès le début

Vos premiers clients ne vous connaissent pas. Avant de vous confier quelque chose, ils vérifient que vous existez vraiment. Un site à votre nom change la façon dont on vous regarde : vous n'êtes plus « quelqu'un qui fait ça à côté », vous êtes une entreprise.

Et surtout, on peut enfin vous trouver. Sans site internet, une activité qui démarre reste invisible pour tous ceux qui ne vous connaissent pas encore.

## Par quoi commencer

Inutile de voir grand. Pour un lancement, il faut un site qui réponde à quatre questions :

1. **Que proposez-vous ?** En une phrase, sans jargon.
2. **Pour qui ?** Particuliers, entreprises, dans quelle zone.
3. **À quel prix ?** Ou au moins une fourchette, ou « devis gratuit ».
4. **Comment vous joindre ?** Formulaire, e-mail, téléphone professionnel.

Une seule page peut contenir tout cela : c’est le ${ESS.name}, à ${eur(ESS.price)} €. Vous démarrez petit, et rien ne vous empêche de voir plus grand ensuite. Si vous comptez sur Google pour trouver vos clients, regardez plutôt le ${VIS.name}, à ${eur(VIS.price)} €.

## Ménager sa trésorerie

Au démarrage, chaque euro compte. C'est pour cela que le paiement est découpé :

- **${acompte(ESS.price)} € à la commande** pour un ${ESS.name}, soit ${paiement.acompte} % du prix.
- **Le reste à la réception du site**, en une fois ou ${EN_FOIS}.
- **Ensuite, c’est vous qui choisissez** : ${eur(creationSeule.month)} € par mois avec le forfait ${AUTO}, où vous gérez tout vous-même, ou ${eur(mini.month)} € par mois avec le forfait ${mini.name}, sans engagement.

Avec le forfait ${mini.name}, l’hébergement, l’endroit où votre site reste accessible jour et nuit, est compris. Pas encore de nom de domaine (l’adresse de votre site) ? Nous le fournissons pour ${eur(dom)} € de plus par mois. Vous connaissez donc le coût exact avant de vous engager, sans devis à rallonge.

## Les mentions obligatoires

Un site professionnel doit afficher des mentions légales : votre nom, votre numéro SIRET, un moyen de contact et le nom de l'hébergeur. Ce n'est pas compliqué, mais c'est obligatoire. Nous vous indiquons quoi fournir, et la page est prête à la mise en ligne.

## Faire le site soi-même ?

C'est possible, et pour certains c'est le bon choix. Le guide [faire son site soi-même ou le faire faire](/guides/creer-son-site-soi-meme-ou-le-faire-faire/) pèse honnêtement les deux options, pour que vous décidiez selon votre temps et vos envies.

## Et après le lancement

Votre activité va évoluer : nouvelles prestations, nouveaux tarifs, premières réalisations à montrer. Avec le forfait ${mini.name}, chaque changement se demande depuis votre espace client, et il est inclus. Pour toucher de nouveaux clients sur Google, vous pouvez aussi commander des pages de visibilité Google, à ${prixPage} € la page, payées une fois.`,
    faq: [
      { q: 'Le site est-il une dépense déductible ?', a: 'En micro-entreprise, vous ne déduisez pas vos frais un par un : l’administration applique un abattement forfaitaire sur votre chiffre d’affaires. Pour votre situation précise, le mieux est de poser la question à votre service des impôts ou à un comptable.' },
      { q: 'Puis-je commencer petit et agrandir le site plus tard ?', a: `Oui. Vous démarrez avec un ${ESS.name}. Le jour où une page ne suffit plus, écrivez-nous : vos textes et vos photos sont repris pour passer au ${VIS.name}.` },
      { q: 'Dois-je déjà avoir mon numéro SIRET pour commander ?', a: 'Non, vous pouvez commander pendant vos démarches. Le SIRET sera ajouté dans les mentions légales dès que vous l’aurez reçu.' },
    ],
    voir: ['creer-son-site-soi-meme-ou-le-faire-faire', 'choisir-nom-de-domaine', 'prix-site-internet'],
  },

  // ------------------------------------------------------------------ les grandes questions
  {
    slug: 'prix-site-internet',
    groupe: 'question',
    icon: 'badge-euro',
    nom: 'Combien coûte un site internet ?',
    resume: 'Création, nom de domaine, hébergement, entretien : tout ce qui compose le vrai prix d’un site.',
    h1: 'Combien coûte un site internet ? Le vrai prix, sans surprise',
    title: 'Combien coûte un site internet ? Le vrai prix | Les Minis Monstres',
    description: 'Création, nom de domaine, hébergement, mises à jour, modifications : tout ce qui compose le prix d’un site internet, avec des exemples chiffrés sur un an.',
    lead: 'Un site internet sert à être visible, et cela a un prix. Mais ce prix ne s’arrête pas à la création. Il y a ce que l’on paie une fois, et ce que l’on paie tant que le site existe. Voici comment tout additionner avant de signer.',
    body: `## Les deux parties du prix

Un site internet, c'est un peu comme une voiture : il y a le prix d'achat, puis l'assurance, le carburant et l'entretien. Beaucoup de mauvaises surprises viennent du fait qu'on ne regarde que le premier chiffre.

**Ce que l'on paie une fois :** la création du site, c'est-à-dire sa conception, ses textes, sa mise en page et sa mise en ligne.

**Ce que l'on paie chaque année ou chaque mois :**

- **Le nom de domaine** : l'adresse de votre site, qui se loue à l'année.
- **L'hébergement** : le serveur qui garde votre site en ligne, jour et nuit.
- **La maintenance** : les vérifications techniques régulières qui gardent le site en état de marche. Sans elle, un site finit par tomber en panne ou par se faire pirater.
- **Les sauvegardes** : une copie de sécurité de votre site, pour repartir vite en cas de problème.
- **Les modifications** : un horaire, un tarif, une photo. Elles sont souvent facturées à l'heure.

## Les questions à poser avant de signer

Quel que soit le prestataire, demandez toujours :

1. Le nom de domaine et l'hébergement sont-ils compris ? Pour combien de temps ?
2. Qui fait la maintenance, et à quel prix ?
3. Combien coûte une modification ?
4. Y a-t-il un engagement de durée ?
5. Que se passe-t-il si j'arrête ?

Un devis qui ne répond pas à ces cinq questions n'est pas complet.

## Nos prix, dans l’ordre

Chez nous, tout est affiché avant la commande, toujours dans le même ordre.

### 1. Le site, payé une seule fois

- **${ESS.name}, ${eur(ESS.price)} €** : une page, pour exister sur internet.
- **${VIS.name}, ${eur(VIS.price)} €** : jusqu’à ${creation.pages} pages, pour être trouvé sur Google.
- **${BOU.name}, ${mille(BOU.price)} €** : une boutique complète, pour vendre sur internet.

Chaque site reprend tout ce que contient le précédent. Vos modifications sont illimitées jusqu’à ce que vous validiez le site.

### 2. Ensuite : Forfait ${AUTO} ou Forfait ${mini.name}

- **Forfait ${AUTO}, ${eur(creationSeule.month)} € par mois** : vous recevez l’export du site, une copie complète avec une courte notice. L’hébergement, le nom de domaine, les sauvegardes et les mises à jour sont à votre charge.
- **Forfait ${mini.name}, ${eur(mini.month)} € par mois**, sans engagement : nous gardons le site en ligne, protégé et à jour. Vos modifications sont incluses, une demande à la fois.

Vous avez déjà un nom de domaine ? Le forfait reste à ${eur(mini.month)} € par mois. Vous n’en avez pas ? Il est fourni à votre nom pour ${eur(dom)} € de plus, soit ${eur(avecDom)} € par mois.

L’abonnement est facultatif, et il démarre à la réception du site.

### 3. Les extras, seulement si besoin

- **Une ${minus(pageGoogle.name)}, ${prixPage} € la page**, payée une fois, par carte, depuis votre espace client.
- **Une traduction anglaise ou une fonctionnalité spécifique** : sur devis, gratuit et sans engagement.

Rien d’autre n’est vendu en plus. Une refonte complète du site se fait sur devis.

Côté paiement, vous versez ${paiement.acompte} % à la commande et le reste à la réception du site, en une fois ou ${EN_FOIS}.

## Trois exemples sur la première année

- **Un artisan avec un ${ESS.name}, avec le forfait ${AUTO}** : ${eur(ESS.price)} €. Son hébergement et son nom de domaine sont à sa charge.
- **Un commerce avec un ${VIS.name} et le forfait ${mini.name}** : ${eur(VIS.price)} € + 12 × ${eur(mini.month)} € = **${eur(VIS.price + 12 * mini.month)} €**.
- **Un créateur avec un ${BOU.name} et le forfait ${mini.name}** : ${mille(BOU.price)} € + 12 × ${eur(mini.month)} € = **${mille(BOU.price + 12 * mini.month)} €**.

Ces exemples comptent un nom de domaine que le client possède déjà. S’il est fourni par nos soins, ajoutez 12 × ${eur(dom)} € = ${eur(12 * dom)} € par an.

Les années suivantes, il ne reste que l'abonnement : ${eur(mini.month)} € par mois avec le forfait ${mini.name}, ou ${eur(avecDom)} € avec le nom de domaine.

## Pourquoi ces prix sont bas

Chez un indépendant, un site vitrine de ${marche.pagesCompare} pages se paie en général entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €. Notre ${VIS.name}, à ${eur(VIS.price)} €, coûte donc ${marche.fois} fois moins.

La différence vient de la méthode : Alex conçoit et vérifie chaque site, et les Minis Monstres se chargent de ce qui revient d’un projet à l’autre.

Soyons honnêtes : ces chiffres viennent de prestataires, donc prudence. Certains indépendants vendent un site dès ${eur(INDEPENDANT_DES)} €, et l’écart devient alors très faible. La page [pourquoi moins cher](/pourquoi-moins-cher/) détaille tout, sources comprises.

> Le bon calcul ne s’arrête pas au prix. Une activité que personne ne trouve sur internet a aussi un coût : celui des clients qui vont ailleurs.

Vous composez le tout sur la page [créer mon site](/creer-mon-site/), et le total s'affiche au fur et à mesure.`,
    faq: [
      { q: 'Un site gratuit, ça existe ?', a: 'Des outils permettent de publier une page sans payer, mais avec une adresse qui porte le nom de l’outil et souvent de la publicité. Pour une activité professionnelle, une adresse à votre nom reste préférable, et elle n’est jamais gratuite.' },
      { q: 'Pourquoi les prix varient-ils autant d’un prestataire à l’autre ?', a: 'Parce que le temps passé n’est pas le même. Un site dessiné sur mesure par une équipe demande des semaines de travail. Un site bâti sur une base éprouvée, avec une méthode rodée, en demande beaucoup moins. Les deux approches sont valables, pour des besoins différents.' },
      { q: 'Dois-je tout payer d’un coup ?', a: `Non. Vous réglez ${paiement.acompte} % à la commande. Le reste est dû à la réception du site, en une fois ou ${EN_FOIS}.` },
    ],
    voir: ['site-une-page-ou-site-vitrine', 'creer-son-site-soi-meme-ou-le-faire-faire', 'creer-boutique-en-ligne'],
  },
  {
    slug: 'site-une-page-ou-site-vitrine',
    groupe: 'question',
    icon: 'layers',
    nom: 'Site une page ou site vitrine ?',
    resume: 'La différence entre les deux, et un test en trois questions pour savoir lequel est fait pour vous.',
    h1: 'Site une page ou site vitrine : lequel choisir ?',
    title: 'Site une page ou site vitrine : lequel choisir ? | Les Minis Monstres',
    description: 'La différence entre un site une page et un site vitrine, expliquée simplement, avec un test en trois questions pour choisir celui qui convient à votre activité.',
    lead: 'C’est la première question que l’on nous pose. La réponse dépend peu de votre budget. Elle dépend surtout de ce que vous avez à dire, et de la façon dont vos clients vous cherchent.',
    body: `## La différence en une image

Un **site une page**, c'est une grande affiche. Tout est au même endroit : on fait défiler vers le bas et l'on découvre qui vous êtes, ce que vous faites, vos tarifs, puis comment vous joindre.

Un **site vitrine**, c'est un petit livret. Il y a une couverture (l'accueil), puis une page par chapitre : vos services, vos tarifs, votre histoire, le contact. On passe de l'une à l'autre par le menu.

Chez nous, l’affiche s’appelle le ${ESS.name} : ${eur(ESS.price)} €, pour exister sur internet. Le livret s’appelle le ${VIS.name} : ${eur(VIS.price)} €, jusqu’à ${creation.pages} pages, pour être trouvé sur Google. L’écart de prix est faible. Choisissez donc d’abord selon votre activité.

## Quand le site une page suffit

Le site une page est le bon choix si :

- Vous proposez **une seule activité**, facile à présenter.
- Vos clients vous cherchent surtout **par votre nom**, après une recommandation.
- Vous voulez un site **court**, que l'on parcourt d'un seul geste.

C'est le cas de beaucoup d'indépendants, de petits commerces de quartier et d'associations.

## Quand il faut un site vitrine

Le site vitrine devient préférable si :

- Vous avez **plusieurs services** assez différents les uns des autres.
- Vous voulez que des inconnus vous trouvent **par ce que vous faites**, pas seulement par votre nom.
- Vous avez besoin de **place** pour expliquer, montrer des réalisations ou détailler vos tarifs.

## Pourquoi plusieurs pages vous rendent plus visible

Google ne classe pas des sites, il classe des pages. Chaque page est évaluée pour un sujet précis.

Prenons un paysagiste. Sur un site une page, tout est mélangé : tonte, élagage, création de jardin, clôtures. Google comprend que c'est un paysagiste, mais aucune partie n'est assez développée pour sortir sur « élagage » dans sa ville.

Sur un site vitrine, la page « Élagage » ne parle que de cela, avec ses mots, ses photos et ses tarifs. Elle a de bien meilleures chances d'apparaître pour cette recherche précise.

## Le test en trois questions

1. **Pouvez-vous décrire votre activité en une seule phrase ?** Si oui, une page suffit probablement.
2. **Proposez-vous au moins trois services qu'un client pourrait chercher séparément ?** Si oui, prenez la vitrine.
3. **Comptez-vous sur Google pour trouver de nouveaux clients ?** Si oui, la vitrine sera plus efficace.

## Et si je me trompe ?

Ce n’est pas grave. On peut commencer avec une page et passer au site de plusieurs pages ensuite : vos textes et vos photos resservent. Rien n’est figé.

## Et la boutique en ligne ?

Elle répond à un autre besoin : encaisser des commandes sur le site. C’est le ${BOU.name}, qui reprend tout le ${VIS.name}. Si vous voulez vendre des produits, lisez le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/).`,
    faq: [
      { q: 'Combien de pages contient un site vitrine ?', a: `Chez nous, le ${VIS.name} va jusqu’à ${creation.pages} pages. On y trouve en général l’accueil, les services, les tarifs, une présentation, une FAQ et le contact. Une fois le site en ligne, une page de visibilité Google de plus coûte ${prixPage} €, commandée depuis votre espace client.` },
      { q: 'Un site une page peut-il sortir sur Google ?', a: 'Oui, surtout sur votre nom et sur votre métier dans votre ville. Il est simplement moins armé qu’un site vitrine pour les recherches portant sur un service précis.' },
      { q: 'Peut-on transformer un site une page en site vitrine plus tard ?', a: 'Oui. Les textes et les photos existants sont repris, et les nouvelles pages viennent s’y ajouter. Écrivez-nous quand le besoin se présente, et nous vous disons ce que cela représente.' },
    ],
    voir: ['prix-site-internet', 'fiche-google-entreprise', 'creer-boutique-en-ligne'],
  },
  {
    slug: 'creer-son-site-soi-meme-ou-le-faire-faire',
    groupe: 'question',
    icon: 'puzzle',
    nom: 'Faire son site soi-même ou le faire faire ?',
    resume: 'Les avantages et les limites de chaque solution, dits honnêtement, pour décider sans regret.',
    h1: 'Créer son site soi-même ou le faire faire ?',
    title: 'Créer son site soi-même ou le faire faire ? | Les Minis Monstres',
    description: 'Faire son site seul avec un outil en ligne ou le confier à quelqu’un : le temps, le coût, le résultat et l’entretien, comparés honnêtement pour bien choisir.',
    lead: 'Les deux solutions sont bonnes, mais pas pour les mêmes personnes. La vraie question n’est pas « est-ce que j’en suis capable ? », c’est « est-ce que j’ai envie d’y passer mes soirées ? ».',
    body: `## Faire son site soi-même

Des outils en ligne permettent aujourd'hui de monter un site sans écrire une ligne de code. On choisit un modèle, on remplace les textes et les photos, et l'on publie.

**Les avantages :**

- Vous gardez la main sur tout, à toute heure.
- Vous apprenez quelque chose d'utile.
- Le coût de départ est faible.

**Les limites :**

- **Le temps.** Comptez plusieurs soirées pour un premier résultat, puis du temps à chaque changement.
- **La page blanche.** L'outil fournit la forme, pas le fond. Écrire des textes clairs est la partie la plus difficile, et personne ne la fait à votre place.
- **La visibilité.** Un site publié n'est pas un site trouvé. Les réglages qui aident Google demandent de s'y connaître un peu.
- **L'abonnement.** Ces outils se paient chaque mois, et le tarif augmente souvent avec les fonctions dont on a besoin.

## Le faire faire

Vous confiez le travail à quelqu'un dont c'est le métier : agence, indépendant, ou un service comme le nôtre.

**Les avantages :**

- Vous gagnez du temps, que vous passez sur votre vrai métier.
- Le site est pensé pour être lu, compris et trouvé.
- Quelqu'un répond quand quelque chose ne va pas.

**Les limites :**

- Le prix de départ est plus élevé.
- Vous dépendez de la disponibilité du prestataire pour les changements.
- Tous les prestataires ne se valent pas : comparez ce qui est vraiment compris.

## Pour qui le « soi-même » est le bon choix

Honnêtement, faites-le vous-même si vous aimez bidouiller, si vous avez du temps devant vous, et si votre site n'est pas pressé. Certaines personnes y prennent un vrai plaisir, et leur site leur ressemble.

## Pour qui il vaut mieux déléguer

Confiez-le si votre temps est compté, si l'écran vous fatigue, ou si vous avez déjà un site commencé il y a des mois et jamais terminé. C'est le cas le plus fréquent que nous rencontrons.

## Une troisième voie

Notre service est né de ce constat. Vous ne construisez rien vous-même, mais vous gardez la main sur ce qui compte :

- Le site est pensé pour être trouvé : c’est notre métier.
- Le prix est fixe et connu d’avance : ${eur(ESS.price)} €, ${eur(VIS.price)} € ou ${mille(BOU.price)} € selon le site, payés une fois.
- Vous aimez quand même bricoler ? Avec le forfait ${AUTO}, vous recevez l’export du site (une copie complète) et vous l’installez chez votre hébergeur, sans abonnement.
- Vous préférez ne rien gérer ? Avec le forfait ${mini.name}, à ${eur(mini.month)} € par mois, vous demandez vos changements en une phrase depuis votre espace client, une page privée rien qu’à vous.
- ${qui('constructeur')} de notre petite bande, clarifie chaque changement avec vous, puis l’envoie à Alex.
- Les modifications sont alors incluses, une demande à la fois.
- L'abonnement est sans engagement.

Pour voir à quoi cela ressemble avant de vous décider, [essayez la démo de l'espace client](/mon-espace/demo/). Et pour une vue d'ensemble des solutions, le [comparatif](/comparatif/) les met côte à côte.`,
    faq: [
      { q: 'J’ai commencé un site moi-même sans le finir, pouvez-vous le reprendre ?', a: 'Nous repartons d’un site neuf, mais rien n’est perdu : vos textes, vos photos et vos idées servent de base. Envoyez-nous l’adresse de ce que vous avez commencé, c’est un excellent point de départ.' },
      { q: 'Si je fais faire mon site, est-ce que je peux encore le modifier ?', a: `Oui. Avec le forfait ${mini.name}, vous décrivez le changement dans votre espace client, et il est fait pour vous, sans rien apprendre. Avec le forfait ${AUTO}, le site est chez vous : vous le modifiez vous-même, comme vous voulez.` },
      { q: 'Combien de temps faut-il pour faire un site seul ?', a: 'Cela dépend beaucoup de chacun. Le montage lui-même va assez vite. Ce qui prend du temps, ce sont les textes, le choix des photos et tous les petits réglages auxquels on ne pense pas au départ.' },
    ],
    voir: ['prix-site-internet', 'site-une-page-ou-site-vitrine', 'site-internet-auto-entrepreneur'],
  },
  {
    slug: 'choisir-nom-de-domaine',
    groupe: 'question',
    icon: 'globe',
    nom: 'Bien choisir son nom de domaine',
    resume: 'L’adresse de votre site : comment la choisir courte, claire et facile à retenir.',
    h1: 'Nom de domaine : comment bien choisir l’adresse de son site',
    title: 'Nom de domaine : comment bien choisir le sien | Les Minis Monstres',
    description: 'Un nom de domaine, c’est l’adresse de votre site. Les règles simples pour le choisir court, clair, facile à dicter, et vérifier tout de suite s’il est libre.',
    lead: 'Le nom de domaine est ce que l’on tape pour arriver chez vous, par exemple « maboulangerie.fr ». Il figurera sur vos cartes, votre camionnette et vos factures. C’est par lui que l’on vous trouve : autant bien le choisir.',
    body: `## Un nom de domaine, c'est quoi ?

C'est l'adresse de votre site sur internet. Elle a deux parties :

- **Le nom**, que vous choisissez : « maboulangerie ».
- **L'extension**, après le point : « .fr », « .com », et d'autres.

Un nom de domaine ne s'achète pas pour toujours. Il se **loue à l'année**, et il reste à vous tant qu'il est renouvelé. S'il n'est plus payé, quelqu'un d'autre peut le prendre.

## Les six règles d'un bon nom

1. **Court.** Plus il est long, plus on fait de fautes en le tapant.
2. **Facile à dicter.** Faites le test du téléphone : dites-le à voix haute à quelqu'un. S'il faut épeler, cherchez plus simple.
3. **Sans piège d'orthographe.** Évitez les doubles lettres ambiguës et les mots que l'on écrit de plusieurs façons.
4. **Peu ou pas de tirets.** Un tiret passe encore. Trois, personne ne s'en souvient.
5. **Sans accent.** Les accents sont possibles techniquement, mais ils posent des soucis dans les adresses e-mail.
6. **Qui vous ressemble.** Le nom de votre entreprise est presque toujours le meilleur choix.

## Faut-il mettre son métier et sa ville ?

« plombier-sedan.fr » peut sembler malin pour Google. En réalité, le nom de domaine pèse peu dans le classement aujourd'hui. Le contenu de vos pages compte bien davantage.

Notre conseil : prenez le nom de votre entreprise. Si ce nom est très courant et déjà pris, ajouter votre ville est une bonne solution de secours.

## Quelle extension choisir : .fr ou .com ?

Pour une activité en France, le **.fr** est le choix naturel : il dit tout de suite que vous êtes ici, et il inspire confiance aux clients français. Le **.com** est une bonne alternative, surtout si vous visez d'autres pays.

Méfiez-vous des extensions originales : elles sont amusantes, mais vos clients taperont « .fr » par réflexe et n'arriveront pas chez vous.

## Vérifier que le nom n'est pas pris

Avant de vous attacher à un nom, vérifiez deux choses :

- **Qu'il est libre.** L'outil de la page [créer mon site](/creer-mon-site/) vous le dit en quelques secondes et vous propose des variantes.
- **Qu'il ne copie pas une marque.** Un nom trop proche d'une marque connue peut vous valoir des ennuis, même s'il est disponible.

## Et si j'ai déjà un nom de domaine ?

Vous le gardez, et le forfait ${mini.name} reste à ${eur(mini.month)} € par mois. Il suffit de l’indiquer à la commande, et nous le relions à votre nouveau site. Vous avez aussi votre hébergement ? Choisissez le forfait ${AUTO} : vous recevez l’export de votre site, à installer chez votre hébergeur.

## Qui s'occupe du renouvellement ?

C’est le piège classique : on oublie l’échéance, le nom expire, et le site disparaît du jour au lendemain. Avec le [forfait](/tarifs/) ${mini.name}, nous pouvons fournir votre nom de domaine pour ${eur(dom)} € de plus par mois, soit ${eur(avecDom)} € : il est à votre nom, et nous le renouvelons pour vous chaque année. Vous n’avez aucune date à surveiller. Si vous gardez le vôtre, le forfait reste à ${eur(mini.month)} € et le renouvellement reste chez vous. Avec le forfait ${AUTO}, notez bien la date : le renouvellement est à votre charge.`,
    faq: [
      { q: 'Le nom que je voulais est déjà pris, que faire ?', a: 'Essayez une variante simple : ajouter votre ville, votre prénom ou votre métier. Évitez seulement de changer une lettre par rapport à un concurrent, cela crée de la confusion pour vos clients.' },
      { q: 'Dois-je prendre le .fr et le .com en même temps ?', a: 'Ce n’est pas nécessaire pour démarrer. Un seul nom bien choisi suffit à la grande majorité des petites entreprises.' },
      { q: 'Puis-je changer de nom de domaine plus tard ?', a: 'C’est possible, mais à éviter : il faut prévenir vos clients, refaire vos supports imprimés, et Google met du temps à s’y retrouver. Mieux vaut prendre quelques jours pour bien choisir dès le départ.' },
    ],
    voir: ['prix-site-internet', 'site-internet-auto-entrepreneur', 'fiche-google-entreprise'],
  },
  {
    slug: 'fiche-google-entreprise',
    groupe: 'question',
    icon: 'map-pin',
    nom: 'La fiche Google de votre entreprise',
    resume: 'Gratuite et indispensable : comment apparaître sur Google et sur la carte près de chez vous.',
    h1: 'Fiche Google : apparaître sur Google et sur la carte, gratuitement',
    title: 'Fiche Google : apparaître sur la carte gratuitement | Les Minis Monstres',
    description: 'La fiche d’établissement Google est gratuite. Comment la créer, la remplir et obtenir de vrais avis pour apparaître quand on vous cherche près de chez vous.',
    lead: 'Quand vous cherchez un commerce sur Google, un encadré apparaît avec une carte, des horaires, des photos et des étoiles. C’est une fiche d’établissement. La vôtre est gratuite, et c’est souvent elle que l’on voit en premier.',
    body: `## À quoi sert cette fiche

C’est le premier pas, gratuit, pour être visible près de chez vous.

La fiche d'établissement Google (on l'appelait avant « Google My Business ») est votre carte de visite sur Google et sur Google Maps. Elle affiche votre nom, votre adresse, vos horaires, votre téléphone, vos photos, vos avis et un lien vers votre site.

Elle joue surtout pour les recherches de proximité : « boulangerie ouverte », « garagiste près de moi », « fleuriste » suivi d'une ville. Sur ces recherches, Google montre d'abord une carte avec trois établissements. Sans fiche, vous ne pouvez pas en faire partie.

## Comment la créer

1. Cherchez « fiche d'établissement Google » et connectez-vous avec un compte Google.
2. Tapez le nom de votre entreprise. Si une fiche existe déjà, demandez à en devenir le propriétaire au lieu d'en créer une deuxième.
3. Choisissez votre **catégorie** avec soin : c'est elle qui décide sur quelles recherches vous sortez.
4. Indiquez votre adresse, ou la zone où vous vous déplacez si vous allez chez vos clients.
5. Google vérifie ensuite que l'établissement existe bien, par un code ou une courte vidéo selon les cas.

## Les cinq choses à bien remplir

- **Les horaires**, y compris les jours fériés et les congés. Un client qui trouve porte close à cause d'une fiche fausse ne revient pas.
- **Les photos** : la devanture pour qu'on vous reconnaisse, l'intérieur, vos produits ou vos réalisations.
- **La description**, avec vos mots : ce que vous faites, pour qui, dans quel secteur.
- **Les services ou produits**, listés un par un.
- **Le lien vers votre site**, pour ceux qui veulent en savoir plus.

## Les avis : les vrais, uniquement

Les avis pèsent lourd, dans le choix des clients comme dans le classement de Google. La meilleure méthode est aussi la plus simple : **demandez-les**. Un client content accepte volontiers, encore faut-il le lui proposer au bon moment, juste après un travail réussi.

!> N'achetez jamais d'avis et n'en écrivez pas vous-même. C'est interdit, Google supprime les fiches qui trichent, et vos clients sentent vite les avis trop parfaits.

Répondez à tous les avis, y compris aux mauvais, avec calme et courtoisie. Votre réponse est lue par tous ceux qui viendront ensuite.

## La fiche ne remplace pas le site

La fiche dit **où** vous êtes et **quand** vous êtes ouvert. Le site explique **ce que vous faites** et **pourquoi vous choisir**. Les deux se renforcent : Google fait davantage confiance à une fiche reliée à un vrai site, dont les informations concordent.

Veillez justement à ce que le nom, l'adresse et le téléphone soient écrits **exactement de la même façon** sur la fiche, sur le site et partout ailleurs.

## Ce que nous faisons pour vous

Sur chaque site que nous créons, votre nom, votre adresse et votre téléphone sont écrits comme sur votre fiche, et votre activité est décrite dans un format que Google sait lire.

Pour aller plus loin, ${qui('observateur')} de notre petite bande, repère les recherches de votre secteur et prépare vos pages de visibilité Google. Le ${VIS.name} en contient dès le départ, et vous pouvez en commander d’autres quand vous le voulez. La fiche et le site travaillent alors ensemble pour votre [visibilité sur Google](/referencement-seo/), près de chez vous.`,
    faq: [
      { q: 'La fiche Google est-elle vraiment gratuite ?', a: 'Oui, sa création et sa gestion ne coûtent rien. Méfiez-vous des démarcheurs qui prétendent vous la vendre ou qui vous réclament un paiement pour la « maintenir en ligne ».' },
      { q: 'Je travaille de chez moi, dois-je afficher mon adresse ?', a: 'Non. Vous pouvez masquer votre adresse et indiquer seulement les communes où vous intervenez. Votre fiche apparaît alors sur les recherches de cette zone.' },
      { q: 'Que faire face à un avis injuste ?', a: 'Répondez poliment en donnant votre version des faits, sans vous énerver. Si l’avis ne concerne pas votre entreprise ou enfreint les règles, vous pouvez le signaler à Google depuis votre fiche.' },
    ],
    voir: ['site-internet-restaurant', 'site-une-page-ou-site-vitrine', 'choisir-nom-de-domaine'],
  },
  {
    slug: 'creer-boutique-en-ligne',
    groupe: 'question',
    icon: 'shopping-bag',
    nom: 'Créer une boutique en ligne',
    resume: 'Produits, paiement, livraison, obligations : par où commencer pour vendre sur internet.',
    h1: 'Créer une boutique en ligne : par où commencer ?',
    title: 'Créer une boutique en ligne : par où commencer ? | Les Minis Monstres',
    description: `Produits, photos, paiement par carte, livraison, conditions de vente : les étapes pour ouvrir une boutique en ligne sans se perdre. ${mille(BOU.price)} €, à prix fixe.`,
    lead: 'Vendre sur internet, ce n’est pas seulement mettre des produits en ligne. Il faut penser au paiement, à l’envoi et à quelques règles. Rien d’insurmontable, à condition de prendre les choses dans l’ordre.',
    body: `## Une boutique en ligne, c'est quoi exactement ?

C'est un site où vos clients choisissent des produits, les mettent dans un panier et paient par carte. Vous recevez la commande, vous préparez le colis et vous l'envoyez. Votre magasin reste ouvert la nuit, le dimanche et pendant vos vacances.

## Étape 1 : choisir par quoi commencer

L'erreur classique est de vouloir tout mettre en ligne d'un coup. Commencez par vos **meilleurs produits**, ceux que l'on vous demande le plus. C'est largement assez pour démarrer et voir ce qui se vend. Le reste du catalogue viendra au fil des mois.

## Étape 2 : des photos et des descriptions qui vendent

En ligne, le client ne peut ni toucher ni essayer. Vos photos et vos textes font le travail du vendeur.

- **Les photos** : fond neutre, lumière du jour, plusieurs angles, et une photo qui montre la taille réelle de l'objet.
- **La description** : matière, dimensions, entretien, et surtout à quoi sert le produit et pour qui.

Dans l’onglet « Ma boutique » de votre espace client, vous saisissez vous-même chaque article : une photo, une description, un prix. Vos prix et vos promotions se règlent au même endroit, et le nombre d’articles n’est pas limité. Un texte vous résiste ? ${qui('ecrivain')} de notre petite bande, peut vous aider à le formuler.

## Étape 3 : le paiement

Vous choisissez comment vos clients vous paient : par carte avec Stripe, ou avec PayPal. Vous installez vous-même ces moyens de paiement depuis votre espace client, en quelques étapes guidées. Vous n’avez jamais accès aux numéros de carte : tout passe par le service de paiement.

À chaque vente, vous êtes prévenu par e-mail, et votre client reçoit tout seul les messages qui le tiennent au courant.

## Étape 4 : la livraison

C'est le point que l'on oublie le plus souvent, alors qu'il décide de votre marge. Avant l'ouverture, répondez à ces questions :

- Dans quels pays livrez-vous ?
- Avec quel transporteur, et à quel tarif selon le poids ?
- Offrez-vous la livraison à partir d'un certain montant ?
- Proposez-vous le retrait sur place ?

Pesez vos produits emballés avant de fixer les frais de port : le carton et le calage comptent dans le poids.

## Étape 5 : les règles à respecter

Vendre en ligne à des particuliers impose quelques obligations : afficher des **conditions générales de vente**, indiquer les prix toutes taxes comprises, et respecter le **droit de rétractation de 14 jours** pour la plupart des produits. Une base de conditions de vente est fournie avec la boutique. Vous la complétez avec vos propres règles de livraison et de retour.

## Combien ça coûte

- **Le ${BOU.name} : ${mille(BOU.price)} €**, payés une fois. Il reprend tout le ${VIS.name} et ajoute la boutique complète : le catalogue, le panier, le paiement en ligne sécurisé, la gestion des commandes et les e-mails automatiques. Nous configurons la boutique, puis vous gérez votre catalogue en toute liberté. Vous réglez ${acompte(BOU.price)} € à la commande et ${reste(BOU.price)} € à la réception.
- **Ensuite, Forfait ${AUTO} ou Forfait ${mini.name}.** Avec le forfait ${AUTO}, vous hébergez la boutique vous-même, sans rien nous payer chaque mois. Avec le forfait ${mini.name}, à ${eur(mini.month)} € par mois, nous gardons votre boutique en ligne et en bon état : l’hébergement (l’endroit où elle reste accessible 24 h/24), des copies de sécurité régulières et les vérifications techniques. Le nom de domaine, si nous le fournissons, ajoute ${eur(dom)} € par mois. Le détail est sur la page [tarifs](/tarifs/).

Le service de paiement prélève de son côté une petite commission sur chaque vente. C'est le cas pour toutes les boutiques en ligne, quelle que soit la solution choisie.

## Étape 6 : faire venir des visiteurs

Une boutique sans visiteurs ne vend rien : elle doit d’abord être vue. Parlez-en à vos clients actuels, glissez l'adresse dans chaque colis et sur vos emballages, et pensez à votre [visibilité sur Google](/referencement-seo/) : chaque fiche produit bien écrite est une porte d'entrée de plus.`,
    faq: [
      { q: 'Combien de produits puis-je vendre ?', a: `Autant que vous voulez. Chaque article demande une photo, une description et un prix, que vous saisissez dans votre espace client. Vous ajoutez, modifiez et retirez vos produits librement, sans supplément.` },
      { q: 'Faut-il un statut d’entreprise pour vendre en ligne ?', a: 'Oui. Vendre régulièrement, même de petites quantités, suppose une activité déclarée, par exemple en micro-entreprise. Renseignez-vous avant d’ouvrir : la démarche est rapide et se fait en ligne.' },
      { q: 'Puis-je garder mon magasin et ajouter une boutique en ligne ?', a: 'Oui, c’est même un très bon cas. La boutique ne voit pas vos ventes au comptoir : quand un article part en magasin, retirez-le vous-même depuis votre espace client, en quelques secondes.' },
    ],
    voir: ['prix-site-internet', 'choisir-nom-de-domaine', 'site-une-page-ou-site-vitrine'],
  },
];

const groupes = [
  { id: 'metier', titre: 'Selon votre activité', texte: 'Ce qu’il faut sur votre site, métier par métier.' },
  { id: 'question', titre: 'Les grandes questions', texte: 'Pour comprendre avant de vous lancer, sans jargon.' },
];

module.exports = { guides, groupes, PUBLIE };
