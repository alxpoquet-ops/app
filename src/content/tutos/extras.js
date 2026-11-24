// Mini Tuto, thème « extras » : voir le format dans ./index.js.
// Les trois premiers sont « À la une » (config.tutosOffre.aLaUne) : ils donnent envie de prendre l'extra, sans forcer.
// Relu contre le code de l'espace client (24 novembre 2026) :
//  - la page de visibilité Google s'achète dans l'onglet « Extras » (includes/extras.php) : packs, case d'accord, paiement par
//    carte sur la page sécurisée, puis Mirette choisit les sujets et la bande écrit et publie (includes/lumi.php, pages-google.php) ;
//  - la traduction anglaise et la fonctionnalité spécifique sont sur devis (« Demander un devis », gratuit, rien à payer avant l'accord) ;
//  - l'option e-commerce ne s'achète pas d'un clic : sans boutique, l'onglet « Ma boutique » est verrouillé et son bouton
//    « Débloquer ma boutique : demander le prix » envoie une demande de prix (includes/vacances.php).
// Les prix viennent de src/config.js : rien n'est écrit en dur.
const cfg = require('../../config');

const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const x = (id) => cfg.aLaDemande.find((e) => e.id === id && !e.retire) || {};
const page = x('packseo'); // la page de visibilité Google, payée une fois
const packs = page.packs || [1, 5, 10];
const prixPage = eur(page.prix || 0);
const pack = (n) => eur((page.prix || 0) * n); // le prix d'un pack de n pages
const ANGLAIS = x('anglais').name || 'Traduction anglaise';
const MESURE = x('specifique').name || 'Fonctionnalité spécifique';
const site = cfg.creation.prix, eco = cfg.creation.ecommerce; // le Site Essentiel, l'option e-commerce
const nom = (id) => (cfg.bande.find((b) => b.id === id) || {}).nom;
const MIRETTE = nom('observateur'), PEPITE = nom('extras');

module.exports = [
  // ------------------------------------------------------------------ À la une
  {
    slug: 'page-de-visibilite-google',
    groupe: 'extras',
    icon: 'search-check',
    monstre: 'gelee',
    espace: 'extras',
    nom: 'À quoi sert une page de visibilité Google',
    resume: `Une porte de plus vers votre site, écrite pour ce que vos clients tapent. ${prixPage} € la page.`,
    h1: 'À quoi sert une page de visibilité Google, et comment la commander',
    title: 'À quoi sert une page de visibilité Google | Les Minis Monstres',
    description: `Une page écrite pour une recherche de vos clients, comme un service et une ville. ${prixPage} € la page, à l’unité ou en pack de ${packs[1]} ou ${packs[2]}, depuis votre espace client.`,
    lead: 'Vos clients ne tapent pas votre nom sur Google : ils tapent ce dont ils ont besoin, et où. Une page de visibilité Google leur répond, avec votre site au bout.',
    body: `Une page de visibilité Google, c’est **une page de plus sur votre site**, écrite pour une recherche précise de vos clients. Par exemple « ramonage à Rethel », « gâteau d’anniversaire sur commande » ou « que faire en cas de fuite d’eau ». Chaque page est une nouvelle porte d’entrée : plus votre site en a de bonnes, plus il a de chances d’apparaître.

## Ce que ça change pour vous

- **Être trouvé au-delà de votre nom.** Votre accueil parle de vous. Une page de visibilité parle d’un besoin précis, celui qu’on tape un soir sur son téléphone.
- **Toucher les villages autour.** Une page par commune ou par service : c’est ainsi qu’un artisan apparaît à vingt kilomètres de chez lui.
- **Répondre avant qu’on vous appelle.** Une page de questions fréquentes rassure, et le visiteur arrive en sachant déjà ce que vous faites.

Quelques idées selon les métiers : un couvreur avec une page par type de toiture, une esthéticienne avec une page par soin, un gîte avec une page sur les balades du coin, un garage avec une page « contrôle technique à prix doux près de chez vous ».

## Le prix

${prixPage} € la page, payée une fois, jamais au mois. Vous choisissez :

- **une page** : ${pack(packs[0])} € ;
- **un pack de ${packs[1]} pages** : ${pack(packs[1])} € ;
- **un pack de ${packs[2]} pages** : ${pack(packs[2])} €.

## La commander depuis votre espace

1. Ouvrez **« Mon site »**, puis **« Extras »**.
2. Sur la carte **« ${page.name || 'Page de visibilité Google'} »**, touchez **« Je le veux »**.
3. Choisissez une page, ${packs[1]} pages ou ${packs[2]} pages : le total s’affiche sous chaque choix.
4. Des idées de sujets ? Notez-les. Sinon, laissez vide : ${MIRETTE} choisit pour vous.
5. Cochez la case qui accepte le prix, puis touchez **« Commander et payer »**.
6. Vous payez par carte sur la page de paiement sécurisée, puis vous revenez dans votre espace.

Ensuite, vous n’avez rien à faire. ${MIRETTE} regarde votre site et ce qu’on cherche dans votre métier, puis choisit un sujet utile, pas encore traité. La bande écrit la page, la relit et la met en ligne, intégrée à votre site. Dès que c’est en ligne, un e-mail vous le dit, avec le lien de chaque page. Chaque page apparaît aussi dans votre historique, dans « Modifications ».

> Bon à savoir : un mot à changer dans votre nouvelle page ? Le bouton « Modifier mon site moi-même » s’en charge, comme pour le reste du site.

Soyons honnêtes : personne ne choisit la place que Google vous donne, et une page ne promet pas la première ligne. Mais un site qui répond à beaucoup de questions utiles a bien plus de chances d’être montré. Commencez par une page, regardez, puis continuez à votre rythme : votre espace client vous attend, onglet « Extras ».`,
    faq: [
      { q: 'Qui écrit la page ?', a: `La bande des Minis Monstres, à partir de votre site et de votre questionnaire de création, sans rien inventer. ${MIRETTE} en choisit le sujet, Alex veille sur le tout.` },
      { q: 'Est-ce un abonnement ?', a: 'Non. Chaque page se paie une fois, au moment de la commande. Rien ne s’ajoute à votre forfait.' },
    ],
    voir: ['quel-extra-choisir-selon-mon-metier', 'traduction-anglaise'],
  },
  {
    slug: 'boutique-en-ligne-e-commerce',
    groupe: 'extras',
    icon: 'shopping-bag',
    monstre: 'mochi',
    espace: 'vacances',
    nom: 'Les avantages du e-commerce',
    resume: 'Vendre même quand vous êtes fermé, être payé en ligne, et tout gérer vous-même.',
    h1: 'Le e-commerce : vendre sur votre site, jour et nuit',
    title: 'Le e-commerce sur votre site : les avantages | Les Minis Monstres',
    description: `L’option e-commerce ajoute une boutique à votre site : panier, paiement sécurisé, e-mail à chaque commande, articles gérés par vous. + ${eco} € une fois.`,
    lead: 'Votre boutique ferme le soir, pas votre site. Avec l’option e-commerce, vos clients choisissent, paient en ligne, et vous recevez la commande.',
    body: `L’option e-commerce ajoute **une vraie boutique à votre site** : vos articles avec leur photo et leur prix, un panier, le paiement en ligne sécurisé et un e-mail à chaque commande. Elle coûte ${eco} € de plus, payés une fois : le Site Essentiel passe de ${site} € à ${site + eco} €.

## Pourquoi vendre en ligne

- **Vous vendez pendant que vous dormez.** Un dimanche soir, un client trouve le cadeau qu’il cherchait et paie tout de suite. Vous découvrez la commande le lundi matin.
- **Vous êtes payé avant d’expédier.** Le paiement se fait en ligne, sur une page sécurisée. Vous choisissez vos moyens : carte, PayPal, virement.
- **Vous allez plus loin que votre rue.** Un client de passage l’été dernier peut recommander en décembre, depuis chez lui.
- **Vous restez maître de tout.** Les articles, les prix, les promotions, la livraison : vous les changez vous-même, depuis votre téléphone, sans attendre personne.
- **Vous partez l’esprit léger.** Le mode vacances ferme la boutique ou prévient que l’envoi se fera à votre retour, et elle repart seule.

## Pour qui ?

Un créateur qui vend ses bijoux, un producteur et ses colis de terrine, une fleuriste et ses compositions à retirer, une librairie, un torréfacteur, un artisan d’art. Des services aussi : un bon cadeau, une séance, une place à un atelier.

## Ce que vous gérez vous-même

Dans votre espace, l’onglet « Ma boutique » vous donne six rubriques : **Mes articles** (ajouter, changer, retirer), **Mes prix** (promo, rupture), **Paiements**, **Livraison**, **Commandes** et **Promos et soldes** (codes promo, mode vacances). Un nouvel article prend une minute : un nom, un prix, une description, une photo.

## L’ajouter à votre site

1. **Vous commandez votre site ?** Cochez la case « E-commerce » au moment de la commande. La boutique est créée avec le reste.
2. **Votre site est déjà en ligne ?** Ouvrez « Mon site », puis **« Ma boutique »**. Sans boutique, la rubrique s’affiche avec un cadenas, « Option verrouillée ».
3. Touchez **« Débloquer ma boutique : demander le prix »**. Votre demande part, gratuite et sans engagement.
4. Alex vous répond avec le prix pour votre site : vous le lisez dans l’historique de « Modifications ».
5. Vous dites oui ? La boutique est mise en place, puis l’onglet s’ouvre pour vous.

> Bon à savoir : rien n’est payé tant que vous n’avez pas accepté le prix. Et vous pouvez présenter un article sans le vendre, avec « Je ne mets pas de prix ».

Vous hésitez ? Regardez combien de clients vous demandent « vous livrez ? » ou « je peux commander ? ». Si la réponse est souvent, la boutique est faite pour vous.`,
    faq: [
      { q: 'Je dois tout remplir le premier jour ?', a: 'Non. Commencez avec quelques articles, ceux qu’on vous demande le plus. Vous en ajoutez quand vous voulez.' },
      { q: 'Je reçois un message à chaque vente ?', a: 'Oui, un e-mail de commande arrive à chaque achat. La liste se retrouve aussi dans « Commandes », dans votre espace.' },
    ],
    voir: ['ma-boutique-ajouter-un-article', 'quel-extra-choisir-selon-mon-metier'],
  },
  {
    slug: 'traduction-anglaise',
    groupe: 'extras',
    icon: 'languages',
    monstre: 'etoile',
    espace: 'extras',
    nom: 'La traduction anglaise de votre site',
    resume: 'Accueillir les touristes et les clients étrangers, avec un bouton pour changer de langue.',
    h1: 'La traduction anglaise : accueillir les clients venus d’ailleurs',
    title: 'Traduire votre site en anglais | Les Minis Monstres',
    description: 'Votre site aussi en anglais, avec un bouton pour changer de langue : utile pour les touristes et les clients étrangers. Sur devis, gratuit et sans engagement.',
    lead: 'Un touriste qui cherche où dormir, manger ou acheter un souvenir lit souvent en anglais. Avec la traduction, votre site lui parle dans sa langue.',
    body: `La traduction anglaise met **chaque page de votre site aussi en anglais**, avec un bouton pour passer d’une langue à l’autre. Le prix dépend du nombre de pages : vous demandez un devis depuis votre espace, gratuit et sans engagement.

## Ce que ça vous apporte

- **Les touristes vous comprennent.** Ils comparent sur leur téléphone avant de choisir. Une page qu’ils lisent sans effort, c’est une réservation de plus.
- **Vous rassurez avant la visite.** Les horaires, les prix, l’accès : tout est clair, dans une langue qu’ils lisent sans peine.
- **Vous touchez les clients étrangers.** Un acheteur à l’étranger, un fournisseur, un client d’une entreprise voisine qui ne parle pas français.
- **Google sait à qui montrer quoi.** La version anglaise peut apparaître aux visiteurs qui cherchent en anglais.

## Pour quels métiers ?

Les gîtes et chambres d’hôtes, les campings, les restaurants et les bars près d’un lieu touristique, les caves et les producteurs qui reçoivent des visiteurs, les guides, les artisans d’art, les boutiques de souvenirs. Et tout commerce proche d’une frontière ou d’une gare.

## Demander votre devis

1. Ouvrez **« Mon site »**, puis **« Extras »**.
2. Sur la carte **« ${ANGLAIS} »**, marquée « Sur devis », touchez **« Demander un devis »**.
3. Dans la case **« Les pages à traduire (toutes, ou lesquelles) »**, dites ce que vous voulez : tout le site, ou seulement l’accueil et la page tarifs, par exemple.
4. Touchez **« Envoyer ma demande de devis »**. Un message confirme que votre demande est partie.
5. Vous recevez un prix, sans engagement, dans la liste de vos demandes de « Modifications ».
6. Vous dites oui ? Le travail commence, avec le délai écrit dans le devis.

> Bon à savoir : rien n’est à payer tant que vous n’avez pas accepté. Vous pouvez demander un devis juste pour vous faire une idée.

## Par où commencer ?

Pas besoin de tout traduire d’un coup. Les pages les plus utiles à un visiteur étranger suffisent souvent : l’accueil, ce que vous proposez, vos tarifs et le contact. Vous ajouterez le reste plus tard.

Une question avant de demander ? ${PEPITE} s’occupe des extras et des devis : écrivez dans votre espace, on vous répond vite.`,
    faq: [
      { q: 'Faut-il que je traduise moi-même ?', a: 'Non. Vous dites quelles pages vous voulez en anglais, et on s’en occupe. Vous relisez si vous le souhaitez.' },
    ],
    voir: ['page-de-visibilite-google', 'une-fonctionnalite-sur-mesure'],
  },

  // ------------------------------------------------------------------ les autres
  {
    slug: 'une-fonctionnalite-sur-mesure',
    groupe: 'extras',
    icon: 'wrench',
    monstre: 'bricou',
    espace: 'extras',
    nom: 'Une fonctionnalité sur mesure',
    resume: 'Une prise de rendez-vous, une galerie, un espace réservé : décrivez, on vous dit le prix.',
    h1: 'Une fonctionnalité sur mesure pour mon site, sur devis',
    title: 'Une fonctionnalité sur mesure, sur devis | Les Minis Monstres',
    description: 'Prise de rendez-vous, galerie, espace réservé à vos clients : décrivez votre besoin dans votre espace, et recevez un devis gratuit, sans engagement.',
    lead: 'Votre métier a ses habitudes, et votre site peut les suivre. Un besoin qui sort de l’ordinaire ? Dites-le, on vous répond avec un prix.',
    body: `La fonctionnalité spécifique, c’est **tout ce que votre site ne fait pas encore** et qui vous serait utile. Vous la décrivez depuis votre espace, avec vos mots, et Alex vous envoie un devis. C’est gratuit, et vous décidez ensuite.

## Quelques idées

- **Une prise de rendez-vous en ligne** pour un coiffeur, un ostéopathe ou un garage : le client choisit son créneau.
- **Une galerie de réalisations** pour un menuisier, un paysagiste ou une photographe.
- **Un espace réservé** à vos clients ou à vos adhérents, avec des documents à télécharger.
- **Un formulaire particulier** : une demande de devis détaillée, une inscription à un atelier, une réservation de salle.

Vous ne savez pas comment l’appeler ? Ce n’est pas grave. Expliquez ce que vous voulez que vos clients puissent faire, c’est ce qui compte.

## Décrire votre besoin

1. Dans votre espace, touchez **« Mon site »**, puis l’onglet **« Extras »**.
2. Sur la carte **« ${MESURE} »**, touchez **« Demander un devis »**.
3. Dans **« Décrivez ce que vous voulez ajouter à votre site »**, racontez le besoin : qui s’en sert, quand, et ce qui doit se passer à la fin.
4. Touchez **« Envoyer ma demande de devis »**.
5. Le prix arrive dans votre historique, dans « Modifications ». Rien à payer tant que vous n’avez pas dit oui.
6. Vous acceptez ? Le travail démarre, avec le délai écrit dans le devis.

> Bon à savoir : un besoin simple, comme un texte, une photo ou un horaire, n’a pas besoin de devis. C’est une modification incluse dans votre forfait : écrivez-la dans « Modifications ».

## Pour une demande claire

Trois choses aident Alex à vous répondre juste : un exemple d’un site que vous aimez, le nombre de personnes concernées, et ce que vous faites aujourd’hui sans le site. Plus c’est concret, plus le prix est précis.`,
    voir: ['quel-extra-choisir-selon-mon-metier', 'traduction-anglaise'],
  },
  {
    slug: 'quel-extra-choisir-selon-mon-metier',
    groupe: 'extras',
    icon: 'lightbulb',
    monstre: 'champi',
    espace: 'extras',
    nom: 'Quel extra choisir selon mon métier',
    resume: 'Artisan, commerçant, tourisme, santé : l’extra qui vous sert le plus, en un coup d’œil.',
    h1: 'Quel extra choisir selon mon métier ?',
    title: 'Quel extra choisir selon mon métier | Les Minis Monstres',
    description: 'Artisan, commerçant, créateur, gîte ou cabinet : l’extra qui vous rapporte le plus selon votre activité, et pourquoi. Aucun n’est obligatoire.',
    lead: 'Aucun extra n’est obligatoire : votre site marche très bien sans. Mais selon votre métier, l’un d’eux peut vraiment faire la différence.',
    body: `Il existe quatre façons d’aller plus loin : **la page de visibilité Google** (${prixPage} € la page), **l’option e-commerce** (${eco} € une fois), **la traduction anglaise** et **la fonctionnalité spécifique** (toutes deux sur devis). Voici laquelle regarder en premier, selon ce que vous faites.

## Vous êtes artisan

Plombier, électricien, couvreur, menuisier : vos clients cherchent un service près de chez eux, souvent dans l’urgence. **Les pages de visibilité Google** sont faites pour vous. Une page par service et par secteur, et vous apparaissez là où vous travaillez vraiment. Un pack de ${packs[1]} pages couvre déjà vos services principaux.

## Vous vendez des produits

Créateur, producteur, commerçant, fleuriste : **l’option e-commerce** vous fait vendre même boutique fermée. Vos clients commandent le soir, vous préparez le matin.

## Vous accueillez des visiteurs

Gîte, restaurant, camping, cave, site de loisirs : **la traduction anglaise** parle aux touristes. Ajoutez une page de visibilité sur ce qu’il y a à voir autour de chez vous, et vous voilà dans leurs recherches de vacances.

## Vous travaillez sur rendez-vous

Coiffeur, esthéticienne, kiné, coach : une **prise de rendez-vous en ligne** évite les appels pendant vos séances. Elle se demande en fonctionnalité spécifique, sur devis.

## Vous êtes une association

Les pages de visibilité Google font connaître vos activités aux habitants du coin. Un espace réservé à vos adhérents se demande en fonctionnalité spécifique.

## Comment décider, en trois questions

1. Ce que vos clients vous demandent le plus souvent au téléphone : une réponse sur une page de plus ?
2. Ce que vous perdez quand vous êtes fermé : des ventes, donc une boutique ?
3. Qui vous visite : des étrangers, donc l’anglais ?

> Bon à savoir : on peut commencer petit. Une seule page Google, un devis pour voir : rien ne vous engage, et tout se prend depuis l’onglet « Extras » de votre espace, au moment qui vous va.

Vous hésitez encore ? ${PEPITE} présente les extras, et Alex vous conseille volontiers. Écrivez-nous, on regarde votre site avec vous.`,
    voir: ['page-de-visibilite-google', 'boutique-en-ligne-e-commerce', 'traduction-anglaise'],
  },
];
