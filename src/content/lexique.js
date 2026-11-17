// Lexique : « c'est quoi … ? », des définitions simples des mots du web.
// Règles (scripts/check.js) : title de 65 caractères au plus, description de 120 à 160, aucun tiret long, pas de phrase de 9 mots ou plus reprise d'une autre page.
const { types, forfaits, options, bande, creation } = require('../config');
const gardien = bande.find((b) => b.id === 'gardien').role; // Le gardien, compris dans l'abonnement (présenté sans prénom)
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const T = (id) => types.find((t) => t.id === id);
const O = (id) => options.find((o) => o.id === id);
const page = T('une-page');
// L'offre unique : un seul abonnement (forfaits[0]), qui comprend tout, dont une page SEO par semaine. Les anciens extras
// au mois (Suivi Google, Chiffres détaillés, Adresse e-mail pro) ne sont plus proposés depuis le 17 novembre 2026.
// V2 (novembre 2026) : Alex fait chaque site, sa petite bande d'automatisations (des petits monstres) s'occupe du
// répétitif. « Chez les Minis Monstres » reste : c'est le nom de la marque. Petites retouches et outils compris pour un usage normal.
const abo = forfaits[0];

const PUBLIE = '2026-11-15';

const termes = [
  // ------------------------------------------------------------------ technique de base
  {
    slug: 'hebergement-web',
    icon: 'server',
    nom: 'Hébergement web',
    resume: 'L’endroit où les fichiers de votre site sont rangés pour être visibles jour et nuit.',
    h1: "Hébergement web : c'est quoi, et pourquoi chaque site en a besoin ?",
    title: 'Hébergement web : définition simple pour les pros | Les Minis Monstres',
    description: 'L’hébergement web, c’est la place louée sur un ordinateur allumé en permanence pour que votre site reste visible. Ce que ça change pour votre entreprise.',
    lead: `Un hébergement web, c'est un espace loué sur un ordinateur qui ne s'éteint jamais, et qui garde votre site disponible pour tout le monde. Sans lui, votre adresse internet ne mène nulle part.`,
    body: `## La définition en une phrase

L'hébergement est **le terrain sur lequel votre site est construit**. Les textes, les photos et le code y sont stockés, puis envoyés au téléphone de chaque visiteur qui tape votre adresse.

On parle aussi d'hébergeur pour désigner l'entreprise qui loue cet espace. Elle s'occupe des machines, de l'électricité, du refroidissement et de la connexion à internet.

## À quoi ça sert pour une petite entreprise

Imaginez une boulangerie. Le nom de domaine, c'est l'enseigne au-dessus de la porte. L'hébergement, c'est le local lui-même. Une enseigne sans local ne sert à rien, et un local sans enseigne, personne ne le trouve.

Concrètement, un bon hébergement vous apporte :

- **Un site qui répond vite**, même aux heures où beaucoup de monde regarde.
- **Un site toujours en ligne**, sans coupure le dimanche soir.
- **Des copies de sécurité**, pour revenir en arrière si un problème arrive.
- **Une protection** contre les robots qui essaient d'entrer sur les sites mal gardés.

## Un exemple de la vie réelle

Une fleuriste prend un hébergement très bon marché pour son site. Tout va bien jusqu'à la Saint-Valentin : le site rame, des pages ne s'ouvrent plus, et les clients commandent ailleurs. Le problème ne venait pas du site, mais de la machine trop petite qui le faisait tourner.

## Ce qu'il faut savoir

- **Le moins cher coûte souvent plus tard.** Un hébergement lent fait fuir les visiteurs et pèse sur votre place dans Google.
- **Vérifiez à qui il appartient.** Le contrat doit être à votre nom ou celui de votre prestataire doit prévoir que vous récupérez tout.
- **Il faut le renouveler.** Un hébergement non payé, c'est un site qui disparaît du jour au lendemain.

!> L'hébergement et le nom de domaine sont deux choses différentes, souvent vendues séparément. Avoir l'un ne veut pas dire avoir l'autre.

## Chez les Minis Monstres

Je ne vous demande pas de chercher un hébergeur. L'[abonnement](/tarifs/) comprend l'hébergement sur un serveur de qualité, quel que soit votre site. Vous n'avez ni facture à part ni réglage à faire. Pour comprendre ce qu'est la machine elle-même, lisez la définition du [serveur](/lexique/serveur-web/).`,
    faq: [
      { q: 'Peut-on avoir un site sans hébergement ?', a: 'Non. Un site doit être posé quelque part pour être visible. Certaines plateformes intègrent l’hébergement dans leur abonnement, mais il existe toujours, même quand on ne le voit pas.' },
      { q: 'Combien coûte un hébergement ?', a: `Les prix varient beaucoup selon la puissance et le service. Chez moi, il est compris dans l’abonnement à ${abo.month} € par mois, qui couvre aussi votre nom de domaine et l’entretien du site.` },
      { q: 'Puis-je changer d’hébergeur plus tard ?', a: 'Oui. On copie les fichiers du site chez le nouvel hébergeur, puis on fait pointer le nom de domaine vers lui. Bien fait, le changement passe inaperçu pour vos visiteurs.' },
    ],
    voir: ['serveur-web', 'maintenance-site', 'sauvegarde-site'],
  },
  {
    slug: 'serveur-web',
    icon: 'cpu',
    nom: 'Serveur web',
    resume: 'La machine qui reçoit les visites de votre site et envoie les pages à chaque écran.',
    h1: "Serveur web : c'est quoi, concrètement ?",
    title: 'Serveur web : c’est quoi, expliqué sans jargon | Les Minis Monstres',
    description: 'Un serveur web est un ordinateur qui envoie les pages de votre site à ceux qui les demandent. Ce qui le rend rapide ou lent, et pourquoi ça compte pour vous.',
    lead: `Un serveur web est un ordinateur spécialisé, branché à internet en continu, qui livre les pages de votre site à chaque visiteur. Plus il est puissant et bien réglé, plus votre site s'affiche vite.`,
    body: `## La définition en une phrase

Un serveur, c'est **un ordinateur sans écran qui attend des demandes et y répond**. Quand quelqu'un tape votre adresse, son téléphone envoie une demande au serveur, qui renvoie la page, les images et le style.

Il vit dans un centre de données, une grande salle remplie de machines, avec une alimentation de secours et une climatisation.

## Serveur et hébergement : quelle différence ?

Les deux mots sont souvent mélangés. Le **serveur** est la machine. L'**hébergement** est le service qu'on vous loue sur cette machine : une part de sa place, de sa mémoire et de sa puissance, plus la surveillance. La page [hébergement web](/lexique/hebergement-web/) détaille ce service.

## Pourquoi ça compte pour votre entreprise

Le serveur influence trois choses que vos clients ressentent sans le savoir :

- **La vitesse.** Un serveur chargé met plus de temps à répondre, et chaque seconde d'attente fait partir des visiteurs.
- **La disponibilité.** Un serveur mal entretenu peut tomber en panne, et votre site avec lui.
- **La tenue quand il y a du monde.** Le jour d'une promotion ou d'un passage à la radio, les visites arrivent d'un coup.

## Un exemple de la vie réelle

Un traiteur partage un serveur bas de gamme avec des centaines d'autres sites. Un de ces voisins reçoit soudain beaucoup de trafic. Résultat : le site du traiteur ralentit à son tour, alors que lui n'a rien changé. C'est le risque des offres où trop de sites se serrent sur la même machine.

## Ce qu'il faut savoir

- **Vous n'avez pas besoin de votre propre serveur.** Pour un commerce ou un artisan, une bonne part d'un serveur bien géré suffit largement.
- **Le réglage compte autant que la puissance.** Un serveur à jour et bien configuré va plus vite qu'une grosse machine laissée à l'abandon.
- **La sécurité se joue aussi ici.** Les mises à jour du système ferment les portes que les pirates cherchent.

!> Un site lent n'est pas toujours la faute du serveur. Des photos trop lourdes ou trop d'extensions ralentissent aussi. Le bon diagnostic regarde les deux.

## Chez les Minis Monstres

Je m'occupe du serveur pour vous. Avec l'abonnement, votre site tourne sur une machine de qualité qui tient les pics de visites. Le détail est sur la page des [tarifs](/tarifs/).`,
    faq: [
      { q: 'Où se trouve physiquement le serveur de mon site ?', a: 'Dans un centre de données, chez un hébergeur. Pour un site qui s’adresse à des clients en France, il vaut mieux un serveur situé en Europe : les pages arrivent plus vite et les règles sur les données sont plus claires.' },
      { q: 'Mon site peut-il tomber en panne si le serveur s’arrête ?', a: 'Oui, c’est pour ça qu’un serveur doit être surveillé et entretenu. Un bon hébergeur répare vite, et une sauvegarde récente permet de tout remettre en place.' },
    ],
    voir: ['hebergement-web', 'temps-de-chargement', 'https-certificat-ssl'],
  },
  {
    slug: 'https-certificat-ssl',
    icon: 'lock',
    nom: 'HTTPS et certificat SSL',
    resume: 'Le petit cadenas dans la barre d’adresse : vos visiteurs échangent avec vous en toute sécurité.',
    h1: "HTTPS et certificat SSL : c'est quoi, ce petit cadenas ?",
    title: 'HTTPS et certificat SSL : le cadenas expliqué | Les Minis Monstres',
    description: 'Le HTTPS chiffre ce qui passe entre votre site et vos visiteurs, grâce à un certificat SSL. Pourquoi c’est devenu obligatoire, même pour un petit site.',
    lead: `Le HTTPS est la version protégée de l'adresse d'un site : ce qui circule entre le visiteur et vous est brouillé pour les curieux. Le certificat SSL est la pièce qui rend cette protection possible.`,
    body: `## La définition en une phrase

Quand une adresse commence par **https://** et qu'un cadenas apparaît à côté, les informations envoyées sont **chiffrées**. Personne ne peut les lire en route, même sur le wifi d'une gare.

Le **certificat SSL** (on dit aussi TLS, son nom plus récent) est une sorte de carte d'identité du site. Il prouve au navigateur que le site est bien celui qu'il prétend être, et il sert à chiffrer les échanges.

## À quoi ça sert pour une petite entreprise

Vous pensez peut-être que votre site ne transmet rien de secret. Pourtant, dès qu'un client remplit votre formulaire, il envoie son nom, son téléphone, parfois son adresse. Ces données méritent d'être protégées.

Le HTTPS apporte aussi :

- **La confiance.** Sans lui, les navigateurs affichent « Non sécurisé » à côté de votre adresse. Beaucoup de visiteurs s'en vont aussitôt.
- **Un meilleur accueil chez Google.** Le moteur préfère les sites protégés.
- **Le droit de vendre.** Aucun moyen de paiement sérieux n'accepte un site sans HTTPS.

## Un exemple de la vie réelle

Une couturière ouvre son site sur son téléphone pour le montrer à une cliente. En haut de l'écran : « Non sécurisé ». La cliente demande si c'est dangereux. Le site n'avait rien de grave, mais la question suffit à semer le doute. Un certificat aurait réglé l'affaire.

## Ce qu'il faut savoir

- **Un certificat expire.** Il doit être renouvelé régulièrement. S'il est oublié, le navigateur affiche une page d'alerte rouge qui fait fuir tout le monde.
- **Le cadenas ne dit pas que le site est honnête.** Il dit seulement que la connexion est protégée. Un site douteux peut aussi en avoir un.
- **Tout le site doit passer en HTTPS**, pas seulement la page du formulaire. Une seule image chargée sans protection peut faire disparaître le cadenas.

!> Si votre site affiche encore « Non sécurisé » aujourd'hui, c'est la première chose à corriger, avant même le design.

## Chez les Minis Monstres

Le HTTPS est compris dans l'[abonnement](/tarifs/), pour chaque site. Je pose le certificat à la mise en ligne et il se renouvelle tout seul. Vous n'avez pas à y penser. Pour voir ce que contient le reste de l'entretien, lisez la page sur la [maintenance de site](/lexique/maintenance-site/).`,
    faq: [
      { q: 'Le certificat SSL est-il payant ?', a: 'Il existe des certificats gratuits, reconnus par tous les navigateurs, qui conviennent très bien à un site d’entreprise. Les certificats payants servent surtout aux très grandes structures. Ce qui compte, c’est qu’il soit posé correctement et renouvelé à temps.' },
      { q: 'Comment savoir si mon site est en HTTPS ?', a: 'Ouvrez-le et regardez la barre d’adresse. Un cadenas ou une icône de réglages à gauche de l’adresse veut dire que c’est bon. La mention « Non sécurisé » veut dire qu’il manque le certificat.' },
    ],
    voir: ['hebergement-web', 'formulaire-de-contact', 'maintenance-site'],
  },
  // ------------------------------------------------------------------ outils pour fabriquer un site
  {
    slug: 'cms',
    icon: 'layers',
    nom: 'CMS',
    resume: 'Le logiciel qui permet de modifier les pages d’un site sans écrire une ligne de code.',
    h1: "CMS : c'est quoi, un système de gestion de contenu ?",
    title: 'CMS : définition simple d’un gestionnaire de site | Les Minis Monstres',
    description: 'Un CMS est le logiciel qui fait tourner un site et permet d’en changer les textes et les images sans coder. Les avantages, les pièges, et qui doit s’en servir.',
    lead: `Un CMS est un logiciel installé derrière un site, qui sert à ajouter ou changer des pages comme on remplit un document. Le sigle vient de l'anglais Content Management System, système de gestion de contenu.`,
    body: `## La définition en une phrase

Sans CMS, chaque modification passe par le code, ligne par ligne. Avec un CMS, on se connecte à une **interface d'administration**, on écrit dans des cases, on ajoute une photo, et on clique sur « Publier ».

Le CMS range tout dans une base de données : les textes, les images, les menus, les comptes des utilisateurs. Il assemble ensuite les pages à la demande.

## À quoi ça sert pour une petite entreprise

Un CMS rend un site **vivant**. On peut y ajouter une actualité, changer un horaire ou publier une nouvelle réalisation sans tout reconstruire. C'est aussi ce qui permet d'ajouter des fonctions plus tard : une boutique, une prise de rendez-vous, une galerie.

Les plus connus sont WordPress, Joomla, Drupal, ou PrestaShop pour la vente. Il existe aussi des plateformes en ligne où le CMS et l'hébergement sont vendus ensemble.

## Un exemple de la vie réelle

Un moniteur d'auto-école veut afficher ses nouvelles dates de stage code chaque mois. Avec un site codé à la main, il doit appeler son prestataire à chaque fois. Avec un CMS, la date se change en deux minutes depuis un formulaire.

## Ce qu'il faut savoir

- **Un CMS demande de l'entretien.** Le logiciel et ses modules reçoivent des mises à jour, souvent pour boucher des failles. Un CMS jamais mis à jour devient une cible.
- **La liberté a un prix.** Plus on peut tout changer, plus on peut aussi casser la mise en page sans le vouloir.
- **Le temps reste le vrai sujet.** Avoir un outil simple ne veut pas dire avoir le temps de s'en servir le soir, après le travail.

!> Avant de choisir un CMS, demandez-vous qui fera les modifications. Si la réponse est « personne », le meilleur outil du monde restera vide.

## Chez les Minis Monstres

Vous n'avez pas à apprendre d'outil. Vous décrivez ce que vous voulez changer dans votre espace client, et c'est fait pour vous : par ma petite bande d'automatisations, en quelques minutes, pour une petite retouche avec un aperçu à valider, ou par moi pour les changements plus grands. Le fonctionnement est expliqué dans la [documentation](/documentation/). Pour le CMS le plus répandu, voyez la définition de [WordPress](/lexique/wordpress/).`,
    faq: [
      { q: 'Un CMS est-il obligatoire pour avoir un site ?', a: 'Non. Un site peut être fait de simples fichiers, sans base de données. C’est même souvent plus rapide et plus sûr. Le CMS devient utile quand le contenu change souvent ou quand plusieurs personnes doivent publier.' },
      { q: 'Quel CMS choisir pour mon entreprise ?', a: 'Celui qui répond à votre besoin et que quelqu’un saura entretenir. Pour un site de présentation ou une petite boutique, les grands CMS connus ont l’avantage d’être bien suivis et de trouver facilement de l’aide.' },
    ],
    voir: ['wordpress', 'theme-site', 'extension-plugin'],
  },
  {
    slug: 'wordpress',
    icon: 'newspaper',
    nom: 'WordPress',
    resume: 'Le logiciel gratuit qui fait tourner une très grande partie des sites dans le monde.',
    h1: "WordPress : c'est quoi, et est-ce fait pour vous ?",
    title: 'WordPress : c’est quoi, avantages et limites | Les Minis Monstres',
    description: 'WordPress est un logiciel libre et gratuit pour créer et gérer un site. Ce qu’il permet, ce qu’il demande comme entretien, et les erreurs à éviter au départ.',
    lead: `WordPress est un CMS libre et gratuit, c'est-à-dire un logiciel qui sert à construire un site et à en modifier le contenu sans coder. Né pour les blogs, il fait aujourd'hui tourner des sites vitrines comme des boutiques.`,
    body: `## La définition en une phrase

WordPress est **un logiciel qu'on installe sur un hébergement**, puis qu'on pilote depuis une page d'administration. On y crée des pages, des articles, des menus, et on lui ajoute des fonctions avec des modules.

Attention à la confusion : le logiciel libre se télécharge sur wordpress.org, alors que wordpress.com est un service commercial qui l'héberge pour vous avec ses propres règles.

## Pourquoi il est si répandu

- **Il est gratuit et libre.** Personne ne peut vous enfermer dedans : vos contenus restent à vous.
- **Il fait presque tout.** Grâce à des milliers de thèmes et d'extensions, on peut ajouter une boutique, une réservation ou une newsletter.
- **Beaucoup de gens le connaissent.** Si votre prestataire change, un autre pourra reprendre le site.

## Un exemple de la vie réelle

Une éleveuse de chèvres crée son site WordPress seule, un week-end, avec un thème gratuit. Deux ans plus tard, le site affiche des erreurs. Elle n'a jamais fait les mises à jour, et une extension abandonnée a laissé passer un pirate. Le logiciel n'était pas en cause : c'est l'absence de suivi qui a coûté cher.

## Les erreurs fréquentes

- **Installer trop d'extensions.** Chacune ajoute du poids et un risque. Mieux vaut quelques modules sérieux que vingt gadgets.
- **Oublier les mises à jour.** WordPress, le thème et les extensions évoluent souvent. Les laisser vieillir, c'est laisser la porte entrouverte.
- **Choisir un thème trop chargé.** Les thèmes « qui font tout » sont souvent lents sur téléphone.
- **Garder le mot de passe « admin ».** Les robots essaient ces identifiants en boucle, jour et nuit.

!> WordPress est gratuit, mais un site WordPress ne l'est pas : il lui faut un hébergement, un nom de domaine et de l'entretien régulier.

## Chez les Minis Monstres

Que votre site soit sur WordPress ou non, la question pour vous reste la même : qui s'en occupe ? Avec l'[abonnement](/tarifs/), je fais les mises à jour des extensions pour vous et je surveille que tout tourne. Si vous hésitez entre faire seul ou déléguer, le guide [créer son site soi-même ou le faire faire](/guides/creer-son-site-soi-meme-ou-le-faire-faire/) vous aide à trancher.`,
    faq: [
      { q: 'WordPress est-il sûr ?', a: 'Oui, s’il est tenu à jour. La plupart des piratages viennent d’une version ancienne, d’une extension abandonnée ou d’un mot de passe trop simple, pas du logiciel lui-même.' },
      { q: 'Peut-on vendre en ligne avec WordPress ?', a: 'Oui, grâce à des extensions de commerce qui ajoutent un panier, le paiement par carte et la gestion des commandes. Il faut alors être encore plus attentif aux mises à jour et à la sécurité.' },
      { q: 'Faut-il savoir coder pour utiliser WordPress ?', a: 'Pas pour écrire un texte ou changer une photo. Pour modifier la mise en page en profondeur, régler la vitesse ou corriger une erreur, des connaissances techniques deviennent vite nécessaires.' },
    ],
    voir: ['cms', 'extension-plugin', 'theme-site'],
  },
  {
    slug: 'theme-site',
    icon: 'palette',
    nom: 'Thème',
    resume: 'Le modèle graphique qui donne au site ses couleurs, ses polices et sa mise en page.',
    h1: "Thème de site internet : c'est quoi, et comment bien le choisir ?",
    title: 'Thème de site internet : définition et conseils | Les Minis Monstres',
    description: 'Un thème est le modèle de présentation d’un site : couleurs, polices, disposition des blocs. Comment il influence la vitesse, la lisibilité et votre image.',
    lead: `Un thème est l'habit d'un site : il décide des couleurs, des polices, de la place du menu et de l'allure des pages. On change le thème sans toucher aux textes, un peu comme on repeint une boutique sans changer la marchandise.`,
    body: `## La définition en une phrase

Dans un CMS comme WordPress, le **thème** est un ensemble de fichiers qui dit comment afficher le contenu. Le texte « Ouvert du mardi au samedi » reste le même, mais selon le thème il apparaîtra en gros ou en petit, en haut ou en bas, sur fond clair ou foncé.

On trouve des thèmes gratuits, des thèmes payants vendus sur des catalogues, et des thèmes faits sur mesure pour une seule entreprise.

## À quoi ça sert pour une petite entreprise

Le thème porte votre **image**. Un cabinet d'avocats et un glacier n'ont pas besoin de la même ambiance. Il joue aussi sur des choses moins visibles mais très importantes :

- **La lisibilité** sur un petit écran.
- **La vitesse** d'affichage, selon le poids du code qu'il charge.
- **La facilité** à trouver le bouton d'appel ou le formulaire.

## Un exemple de la vie réelle

Un paysagiste choisit un thème magnifique sur la démonstration : grandes vidéos, animations à chaque défilement. Une fois ses vraies photos en place, le site met longtemps à s'ouvrir sur téléphone, et le numéro est caché sous trois animations. Un thème plus sobre aurait mieux servi son métier.

## Les erreurs fréquentes

- **Choisir sur la démonstration.** Elle est remplie d'images parfaites et de textes courts. Votre contenu réel n'aura pas cette allure.
- **Prendre un thème « tout-en-un ».** Il charge des dizaines de fonctions dont vous n'utiliserez qu'une petite partie.
- **Modifier le thème directement.** À la prochaine mise à jour du thème, les retouches disparaissent. On passe par un thème enfant, une copie qui garde vos changements.
- **Oublier de tester sur mobile.** La plupart de vos visiteurs viendront d'un téléphone.

!> Un thème acheté une fois peut cesser d'être suivi par son auteur. Vérifiez qu'il reçoit encore des mises à jour avant de vous engager.

## Chez les Minis Monstres

Je ne vous fais pas choisir dans un catalogue. Je pars de votre métier, de vos couleurs et de vos photos pour faire un site qui vous ressemble, léger et lisible sur téléphone. Vous pouvez voir comment ça se passe sur la page [créer mon site](/creer-mon-site/). Pour la partie qui ajoute des fonctions, voyez la définition d'une [extension](/lexique/extension-plugin/).`,
    faq: [
      { q: 'Changer de thème fait-il perdre le contenu ?', a: 'Non, les textes et les images restent en place. En revanche, la mise en page peut bouger, des blocs propres à l’ancien thème peuvent disparaître, et il faut tout revérifier page par page.' },
      { q: 'Un thème gratuit suffit-il ?', a: 'Parfois, oui, s’il est léger, bien noté et encore mis à jour. Le prix compte moins que la qualité du code et le sérieux de celui qui le maintient.' },
    ],
    voir: ['cms', 'responsive', 'temps-de-chargement'],
  },
  {
    slug: 'extension-plugin',
    icon: 'puzzle',
    nom: 'Extension (plugin)',
    resume: 'Un petit module qu’on ajoute à un site pour lui donner une fonction de plus.',
    h1: "Extension ou plugin : c'est quoi, sur un site internet ?",
    title: 'Extension (plugin) de site : définition et pièges | Les Minis Monstres',
    description: 'Une extension, ou plugin, ajoute une fonction à un site : formulaire, galerie, paiement. Pourquoi il en faut peu, et pourquoi chacune doit rester à jour.',
    lead: `Une extension, qu'on appelle aussi plugin en anglais, est un module qu'on branche sur un site pour lui apprendre à faire quelque chose de nouveau. C'est comme ajouter un accessoire à un robot de cuisine.`,
    body: `## La définition en une phrase

Le CMS fournit la base : des pages, des menus, des comptes. Les **extensions** ajoutent le reste : un formulaire de contact, un module de réservation, une galerie photo, un outil contre les messages indésirables, un panier d'achat.

Elles sont écrites par des milliers de développeurs différents. Certaines sont gratuites, d'autres payantes, certaines sont suivies de près, d'autres abandonnées depuis des années.

## À quoi ça sert pour une petite entreprise

Grâce aux extensions, un site peut grandir avec votre activité. Vous commencez par une simple présentation, puis vous ajoutez la prise de rendez-vous quand le carnet se remplit, ou la vente en ligne le jour où vous lancez un produit.

## Un exemple de la vie réelle

Un ostéopathe installe une extension de rendez-vous, une de galerie, une pour les avis, une pour la vitesse, une pour le référencement, et ainsi de suite. Au bout d'un an, il en a vingt-cinq. Une mise à jour de l'une entre en conflit avec une autre, et le formulaire ne fonctionne plus pendant une semaine. Il ne s'en rend compte qu'en voyant les demandes s'arrêter.

## Ce qu'il faut savoir

- **Chaque extension est une porte.** Une extension mal écrite ou ancienne est l'une des premières causes de piratage.
- **Chaque extension a un poids.** Elle ajoute du code à charger, et le site ralentit.
- **Les mises à jour sont indispensables**, mais il faut vérifier après coup que tout fonctionne encore.
- **Une extension peut disparaître.** Si son auteur arrête, elle ne reçoit plus de correctifs et doit être remplacée.

!> Avant d'en ajouter une, posez-vous la question : est-ce que je m'en servirai vraiment chaque mois ? Si la réponse est non, passez votre chemin.

## Les bons réflexes

- Préférer les extensions **connues, récentes et bien notées**.
- **Supprimer** celles qui ne servent plus, au lieu de simplement les désactiver.
- Faire une **sauvegarde** avant chaque grosse mise à jour.

## Chez les Minis Monstres

Les mises à jour des extensions font partie de l'[abonnement](/tarifs/). Je les fais pour vous et je vérifie que le site tient debout ensuite. Vous gardez un site léger, sans module inutile. Pour savoir comment on revient en arrière quand quelque chose casse, lisez la page sur la [sauvegarde de site](/lexique/sauvegarde-site/).`,
    faq: [
      { q: 'Combien d’extensions faut-il sur un site ?', a: 'Il n’y a pas de bon nombre. La règle est simple : uniquement celles dont vous avez besoin, chacune choisie avec soin. Un petit site bien fait en a souvent peu.' },
      { q: 'Les extensions gratuites sont-elles dangereuses ?', a: 'Pas forcément. Beaucoup sont excellentes et suivies par des équipes sérieuses. Le danger vient surtout des extensions plus mises à jour, gratuites ou payantes.' },
    ],
    voir: ['wordpress', 'maintenance-site', 'sauvegarde-site'],
  },
  {
    slug: 'responsive',
    icon: 'smartphone',
    nom: 'Site responsive',
    resume: 'Un site qui s’adapte tout seul à l’écran : téléphone, tablette ou ordinateur.',
    h1: "Site responsive : c'est quoi, et pourquoi c'est indispensable ?",
    title: 'Site responsive : définition et bonnes pratiques | Les Minis Monstres',
    description: 'Un site responsive change sa mise en page selon la taille de l’écran pour rester lisible sur téléphone. Pourquoi c’est vital pour un commerce ou un artisan.',
    lead: `Un site responsive réorganise ses blocs selon l'écran qui l'affiche : en colonnes sur un ordinateur, l'un sous l'autre sur un téléphone. On dit aussi site adaptatif. Le visiteur n'a jamais besoin de zoomer.`,
    body: `## La définition en une phrase

Le mot vient de l'anglais *responsive*, qui veut dire « qui réagit ». Le site **réagit à la largeur de l'écran** : le menu se replie dans un bouton, les images rétrécissent, les colonnes se placent les unes sous les autres, les boutons deviennent assez gros pour le pouce.

C'est le même site, avec la même adresse et les mêmes textes. Seule la présentation change.

## À quoi ça sert pour une petite entreprise

Vos clients vous cherchent souvent depuis leur téléphone, dans la rue, au travail ou depuis leur canapé. Si votre site ne s'adapte pas, ils voient une page minuscule, doivent zoomer, ratent le bon bouton, et finissent par appeler un concurrent.

Un site responsive vous apporte :

- **Une lecture confortable** sur tous les appareils.
- **Un appel en un geste**, grâce au numéro cliquable.
- **Une meilleure place sur Google**, qui regarde d'abord la version mobile des sites pour les classer.

## Un exemple de la vie réelle

Un garagiste a un site fait il y a longtemps, pensé pour l'ordinateur. Sur téléphone, son numéro est écrit tout petit dans une image, impossible à toucher pour appeler. Un client en panne au bord de la route n'a ni le temps ni l'envie de recopier le numéro à la main.

## Ce qu'il faut vérifier

- **Le texte se lit sans zoomer.**
- **Les boutons sont assez grands** et pas collés les uns aux autres.
- **Rien ne dépasse** de l'écran sur les côtés.
- **Les photos s'affichent vite**, même avec une connexion moyenne.
- **Le formulaire se remplit facilement**, avec le bon clavier pour le téléphone ou l'e-mail.

!> Testez votre site sur votre propre téléphone, debout, d'une seule main. C'est comme ça que vos clients le regardent le plus souvent.

## Chez les Minis Monstres

Tous les sites que je crée sont pensés d'abord pour le téléphone, puis élargis pour l'ordinateur. Le numéro est cliquable, le menu se replie proprement, et je teste sur plusieurs tailles d'écran avant la mise en ligne. Vous pouvez composer le vôtre et voir son prix sur [créer mon site](/creer-mon-site/). La vitesse sur mobile est expliquée à la page [temps de chargement](/lexique/temps-de-chargement/).`,
    faq: [
      { q: 'Faut-il une application en plus d’un site responsive ?', a: 'Pour la plupart des petites entreprises, non. Un site bien adapté au téléphone suffit, et vos clients n’ont rien à installer pour vous trouver.' },
      { q: 'Comment savoir si mon site est responsive ?', a: 'Ouvrez-le sur un téléphone. Si vous devez zoomer pour lire ou si la page déborde sur le côté, il ne l’est pas, ou mal. Sur ordinateur, vous pouvez aussi réduire la largeur de la fenêtre et regarder si les blocs se réorganisent.' },
    ],
    voir: ['temps-de-chargement', 'page-d-accueil', 'theme-site'],
  },
  // ------------------------------------------------------------------ être trouvé sur Google
  {
    slug: 'referencement-naturel-seo',
    icon: 'search',
    nom: 'Référencement naturel (SEO)',
    resume: 'Tout ce qui aide votre site à apparaître dans les résultats de Google, sans payer de publicité.',
    h1: "Référencement naturel (SEO) : c'est quoi, simplement ?",
    title: 'Référencement naturel (SEO) : définition simple | Les Minis Monstres',
    description: 'Le référencement naturel, ou SEO, regroupe le travail qui aide un site à se montrer dans Google sans publicité. Ce qui compte, et ce qui ne sert à rien.',
    lead: `Le référencement naturel, ou SEO, c'est l'ensemble du travail qui rend un site plus facile à trouver dans les résultats gratuits de Google. On ne paie pas pour chaque clic : on gagne sa place avec un site clair, utile et bien construit.`,
    body: `## La définition en une phrase

**SEO** veut dire *Search Engine Optimization*, optimisation pour les moteurs de recherche. En français, on dit référencement naturel, par opposition aux annonces payantes qu'on voit marquées « Sponsorisé » en haut des résultats.

Google lit des milliards de pages et essaie de montrer les plus utiles pour chaque recherche. Le SEO consiste à l'aider à comprendre votre site et à lui prouver qu'il mérite d'être montré.

## Les trois piliers

- **La technique.** Un site rapide, sécurisé, lisible sur téléphone, que Google peut parcourir sans obstacle.
- **Le contenu.** Des pages qui répondent vraiment aux questions de vos clients, avec les mots qu'ils utilisent.
- **La réputation.** Des liens venant d'autres sites, des avis, une fiche d'établissement bien remplie : autant de signes que vous existez vraiment.

## À quoi ça sert pour une petite entreprise

Un client qui tape « serrurier Charleville » a un besoin immédiat. S'il vous trouve, il vous appelle. Le SEO travaille pour vous de façon continue, même pendant que vous dormez, sans payer chaque visite comme avec la publicité.

## Un exemple de la vie réelle

Une esthéticienne écrit sur son site « Bienvenue dans mon univers de douceur ». C'est joli, mais personne ne tape ces mots dans Google. Le jour où elle ajoute une page claire sur l'épilation, une autre sur les soins du visage, avec le nom de sa ville, Google sait enfin quoi lui associer.

## Ce qu'il faut savoir

- **Ça prend du temps.** Le SEO se construit sur des semaines et des mois, pas en un clic.
- **Personne ne peut garantir une place.** Méfiez-vous de quiconque promet la première position : Google décide seul.
- **Les vieilles astuces ne marchent plus.** Répéter un mot vingt fois ou acheter des liens en masse peut même vous pénaliser.

!> Le meilleur SEO pour un commerce local reste simple : dire clairement ce que vous faites, où, et comment vous joindre.

## Chez les Minis Monstres

Sur votre site, les pages que vous n'utilisez pas parmi les ${creation.pages} prévues deviennent des pages SEO, chacune écrite pour une recherche de vos clients. L'[abonnement](/tarifs/) en ajoute ensuite une nouvelle chaque semaine. Tout est expliqué sur la page [référencement SEO](/referencement-seo/). Pour la partie liée à votre ville, voyez le [référencement local](/lexique/referencement-local/).`,
    faq: [
      { q: 'Quelle différence entre SEO et publicité Google ?', a: 'La publicité vous place en haut des résultats tant que vous payez chaque clic. Le SEO vise les résultats gratuits : il demande du travail au départ, mais ne s’arrête pas le jour où vous cessez de payer.' },
      { q: 'Au bout de combien de temps voit-on des effets ?', a: 'Cela dépend de votre métier, de votre ville et de la concurrence. Il faut en général compter plusieurs mois avant de juger. C’est un travail de fond, pas un interrupteur.' },
      { q: 'Puis-je faire mon SEO moi-même ?', a: 'Oui, en partie : écrire des pages claires, remplir votre fiche Google, demander des avis. La partie technique et le suivi régulier demandent plus de temps et d’outils.' },
    ],
    voir: ['referencement-local', 'mot-cle', 'indexation'],
  },
  {
    slug: 'referencement-local',
    icon: 'map-pin',
    nom: 'Référencement local',
    resume: 'Être trouvé par les gens qui cherchent votre métier près de chez eux, dans votre ville.',
    h1: "Référencement local : c'est quoi, et comment ça marche ?",
    title: 'Référencement local : être trouvé dans votre ville | Les Minis Monstres',
    description: 'Le référencement local aide votre entreprise à sortir quand on cherche votre métier tout près. Ce qui compte : fiche Google, site, avis et adresse cohérente.',
    lead: `Le référencement local est la partie du SEO qui vise les recherches liées à un lieu, comme « boulangerie Rethel » ou « plombier près de moi ». Il fait apparaître votre entreprise sur la carte et dans les résultats proches du client.`,
    body: `## La définition en une phrase

Quand une recherche a une intention locale, Google affiche souvent une **carte avec quelques établissements**, puis les sites classiques en dessous. Le référencement local consiste à mettre toutes les chances de votre côté pour figurer dans cette carte et dans ces résultats.

Google s'appuie surtout sur trois choses : la **proximité** avec la personne qui cherche, la **pertinence** de votre activité pour la recherche, et votre **notoriété**.

## À quoi ça sert pour une petite entreprise

Pour un commerce ou un artisan, c'est souvent la recherche la plus précieuse. Quelqu'un qui tape « coiffeur » à côté de chez vous est prêt à venir. Il ne compare pas cinquante pages : il regarde la carte, les avis, et il appelle.

## Ce qui fait la différence

- **Votre fiche d'établissement Google**, complète et à jour : catégorie, horaires, photos, description. Le guide [fiche Google](/guides/fiche-google-entreprise/) explique comment la remplir.
- **Un site qui cite votre ville et votre zone**, en toutes lettres, sur les bonnes pages.
- **Les mêmes coordonnées partout** : nom, adresse et téléphone identiques sur le site, la fiche, les annuaires et les réseaux.
- **Des avis réels** de vos clients, et vos réponses à ces avis.

## Un exemple de la vie réelle

Un électricien a déménagé son atelier dans la commune voisine. Sur son site, l'ancienne adresse. Sur sa fiche Google, la nouvelle. Dans un annuaire, un vieux numéro. Google reçoit des informations qui se contredisent et hésite à le montrer. Remettre tout en ordre a été le premier chantier.

## Les erreurs fréquentes

- **Viser trop large.** Écrire « partout en France » quand vous travaillez dans un rayon de trente kilomètres brouille le message.
- **Créer des pages copiées pour chaque village.** Des pages presque identiques n'apportent rien et peuvent nuire.
- **Oublier les horaires exceptionnels.** Un client qui trouve porte close ne revient pas.

!> Le référencement local ne s'achète pas. Il se gagne avec des informations justes, une présence régulière et de vrais clients contents.

## Chez les Minis Monstres

Je suis installé dans les Ardennes et je travaille avec des entreprises de toute la France. Sur chaque site, je soigne la zone que vous couvrez, et vos pages SEO peuvent viser les communes où vous travaillez. Plus de détails sur la page [référencement SEO](/referencement-seo/).`,
    faq: [
      { q: 'Faut-il une adresse pour faire du référencement local ?', a: 'Une adresse aide, mais les entreprises qui se déplacent chez le client peuvent aussi définir une zone desservie sur leur fiche, sans afficher leur domicile.' },
      { q: 'Le site ou la fiche Google : lequel compte le plus ?', a: 'Les deux travaillent ensemble. La fiche vous place sur la carte, le site donne les détails et rassure. Une fiche qui renvoie vers un bon site est plus convaincante qu’une fiche seule.' },
    ],
    voir: ['referencement-naturel-seo', 'mot-cle', 'backlink'],
  },
  {
    slug: 'mot-cle',
    icon: 'tag',
    nom: 'Mot-clé',
    resume: 'Les mots que vos clients tapent dans Google, et que votre site doit savoir employer.',
    h1: "Mot-clé : c'est quoi, en référencement ?",
    title: 'Mot-clé en SEO : définition et comment les trouver | Les Minis Monstres',
    description: 'Un mot-clé, c’est la recherche que tape un client dans Google. Comment trouver les vôtres, où les placer sur votre site, et pourquoi il ne faut pas en abuser.',
    lead: `Un mot-clé est le mot ou le groupe de mots qu'une personne tape dans un moteur de recherche, comme « menuisier sur mesure » ou « gâteau d'anniversaire Sedan ». Pour être trouvé, votre site doit parler avec ces mots-là.`,
    body: `## La définition en une phrase

En référencement, un mot-clé n'est pas forcément un seul mot. C'est plutôt **une expression de recherche**. « Taxi » est un mot-clé, « taxi conventionné hôpital Reims » aussi, et ce second est bien plus précis.

On distingue souvent :

- **Les mots-clés courts**, très recherchés mais très disputés, comme « restaurant ».
- **Les expressions longues**, moins tapées, mais par des gens qui savent exactement ce qu'ils veulent, comme « restaurant avec terrasse pour chiens ».

## À quoi ça sert pour une petite entreprise

Les mots-clés font le lien entre ce que vous vendez et ce que les gens cherchent. Souvent, ce ne sont pas les mêmes mots. Un professionnel dit « ravalement de façade », son client tape « nettoyer mur maison ». Si votre site ne parle que votre langage de métier, vous passez à côté.

## Un exemple de la vie réelle

Une couturière propose des « retouches et créations textiles ». Elle découvre que ses clients cherchent plutôt « ourlet pantalon », « changer fermeture éclair » et « couturière près de chez moi ». En écrivant une page qui reprend ces besoins concrets, elle répond enfin aux vraies questions.

## Comment trouver vos mots-clés

- **Écoutez vos clients.** Notez les mots exacts qu'ils emploient au téléphone ou au comptoir.
- **Regardez les suggestions de Google**, qui s'affichent quand on commence à taper.
- **Lisez le bas de la page de résultats**, où Google propose des recherches associées.
- **Consultez la Search Console** une fois votre site en ligne : elle montre les recherches qui vous font déjà apparaître.

## Où les placer

Dans la [balise title](/lexique/balise-title/), dans le grand titre de la page, dans les premières phrases, dans les intertitres et dans l'adresse de la page. Toujours de façon naturelle.

!> Répéter un mot-clé à chaque ligne ne fait pas monter un site. Google le repère, et vos lecteurs aussi. Écrivez d'abord pour des humains.

## Chez les Minis Monstres

Pour vos pages SEO, dont celle que l'abonnement ajoute chaque semaine, je choisis avec vous les recherches qui comptent pour votre métier et votre zone. La méthode complète est sur [référencement SEO](/referencement-seo/).`,
    faq: [
      { q: 'Combien de mots-clés par page ?', a: 'Une page doit viser un sujet principal, avec son mot-clé et quelques variantes proches. Si vous voulez couvrir un autre sujet, mieux vaut lui donner sa propre page.' },
      { q: 'Faut-il viser les mots-clés les plus recherchés ?', a: 'Pas forcément. Pour une petite entreprise, des expressions plus précises, avec votre ville ou un service particulier, attirent souvent des visiteurs plus prêts à vous contacter.' },
    ],
    voir: ['referencement-naturel-seo', 'balise-title', 'google-search-console'],
  },
  {
    slug: 'balise-title',
    icon: 'hash',
    nom: 'Balise title',
    resume: 'Le titre bleu qui s’affiche dans Google pour chaque page de votre site.',
    h1: "Balise title : c'est quoi, et comment bien l'écrire ?",
    title: 'Balise title : définition et exemples concrets | Les Minis Monstres',
    description: 'La balise title est le titre cliquable d’une page dans Google et dans l’onglet du navigateur. Comment l’écrire pour donner envie de cliquer, avec des exemples.',
    lead: `La balise title est le titre officiel d'une page, caché dans son code. C'est lui que Google affiche en gros et en couleur dans ses résultats, et lui qu'on lit dans l'onglet du navigateur.`,
    body: `## La définition en une phrase

Chaque page d'un site possède une **balise title**, écrite dans le code sous la forme d'une petite étiquette. Elle ne se voit pas dans la page elle-même, mais elle apparaît à deux endroits clés :

- **Dans les résultats de Google**, en titre cliquable.
- **Dans l'onglet** du navigateur, en haut de l'écran.

Elle est différente du grand titre visible sur la page, même si les deux parlent souvent du même sujet.

## À quoi ça sert pour une petite entreprise

Le title est **votre vitrine dans Google**. Entre dix résultats, le client choisit en une seconde, souvent d'après ce titre. Il aide aussi Google à comprendre de quoi parle la page. Un bon title dit le service, le lieu si c'est utile, et le nom de l'entreprise.

## Un exemple de la vie réelle

Un menuisier a cinq pages, et toutes portent le même title : « Accueil ». Dans Google, impossible de savoir quelle page parle des escaliers et laquelle des cuisines. En écrivant « Escalier en bois sur mesure à Givet | Menuiserie Dubois », chaque page devient claire pour le moteur comme pour le client.

## Les règles d'un bon title

- **Unique.** Chaque page a le sien. Deux pages avec le même title se font concurrence.
- **Court.** Au-delà d'une soixantaine de caractères environ, Google coupe la fin et ajoute des points de suspension.
- **L'essentiel au début.** Le service ou le produit d'abord, le nom de marque à la fin.
- **Honnête.** Le title promet ce que la page contient. Sinon, le visiteur repart aussitôt.

## Les erreurs fréquentes

- Laisser le title par défaut, comme « Page 2 » ou « Nouveau site ».
- Empiler les mots-clés à la suite, séparés par des virgules.
- Mettre seulement le nom de l'entreprise, que personne ne cherche encore.

!> Google réécrit parfois le title qu'il affiche, s'il le juge peu clair. Un title précis et fidèle à la page a plus de chances d'être gardé tel quel.

## Chez les Minis Monstres

J'écris le title de chaque page à la création, avec le bon [mot-clé](/lexique/mot-cle/) et votre nom. C'est l'un des premiers gestes du SEO. Pour la petite phrase qui s'affiche juste en dessous dans Google, voyez la [meta description](/lexique/meta-description/).`,
    faq: [
      { q: 'Le title et le titre de la page sont-ils la même chose ?', a: 'Pas tout à fait. Le title s’affiche dans Google et dans l’onglet, le grand titre s’affiche sur la page. Ils peuvent se ressembler, mais le title est souvent plus court et contient le nom de l’entreprise.' },
      { q: 'Changer un title peut-il changer ma place dans Google ?', a: 'Cela peut jouer, en bien ou en mal, et il faut quelques jours ou semaines pour que Google en tienne compte. Mieux vaut le modifier avec une raison claire, pas tous les quatre matins.' },
    ],
    voir: ['meta-description', 'mot-cle', 'lien-interne'],
  },
  {
    slug: 'meta-description',
    icon: 'file-text',
    nom: 'Meta description',
    resume: 'Les deux lignes de résumé qui apparaissent sous le titre de votre page dans Google.',
    h1: "Meta description : c'est quoi, et à quoi elle sert ?",
    title: 'Meta description : définition et comment l’écrire | Les Minis Monstres',
    description: 'La meta description est le court résumé affiché sous le titre d’une page dans Google. Elle ne fait pas monter le site, mais elle donne envie de cliquer.',
    lead: `La meta description est un petit texte caché dans le code de chaque page, qui la résume en une ou deux phrases. Google l'affiche souvent sous le titre bleu, pour aider la personne à choisir.`,
    body: `## La définition en une phrase

Dans la page de résultats, chaque site est présenté par un titre, une adresse et quelques lignes grises. Ces lignes viennent souvent de la **meta description**, un texte que l'auteur du site écrit exprès pour cet endroit.

Si elle manque ou si elle ne correspond pas à la recherche, Google prend à la place un morceau du texte de la page, pas toujours le plus parlant.

## À quoi ça sert pour une petite entreprise

La meta description ne fait pas remonter votre site dans le classement. Son rôle est autre : **convaincre de cliquer**. C'est un peu la phrase d'accroche sur l'ardoise devant votre boutique. Deux commerces sont côte à côte, le passant entre chez celui qui lui parle le mieux.

## Un exemple de la vie réelle

Deux pizzerias sortent l'une sous l'autre. La première affiche un morceau de texte au hasard : « Mentions légales. Tous droits réservés. Cookies ». La seconde dit : « Pizzas au feu de bois, à emporter ou livrées le soir, pâte maison. Commandez par téléphone. » Le choix se fait tout seul.

## Comment bien l'écrire

- **Une par page**, jamais copiée d'une page à l'autre.
- **Une longueur raisonnable** : assez pour dire l'essentiel, pas au point d'être coupée trop tôt. Comptez à peu près entre cent dix et cent soixante caractères.
- **Ce que la personne va trouver**, dit simplement.
- **Un détail qui vous distingue** : fait maison, devis gratuit, ouvert le dimanche.
- **Une invitation douce** à agir, comme « découvrez nos menus » ou « demandez votre devis ».

## Les erreurs fréquentes

- Recopier la première phrase de la page sans la retravailler.
- Promettre ce que la page ne contient pas.
- Écrire pour Google au lieu d'écrire pour un humain pressé.

!> Une meta description n'est pas une liste de mots-clés. Si le mot cherché y figure, Google le met en gras, ce qui attire l'œil. Une fois suffit.

## Chez les Minis Monstres

À la création, j'écris une meta description pour chaque page de votre site, en pensant à ce que votre client cherche. Si votre offre change, vous me le dites depuis votre espace client et je l'adapte. Pour le titre qui l'accompagne, lisez la page [balise title](/lexique/balise-title/), et pour la vue d'ensemble, celle sur le [référencement naturel](/lexique/referencement-naturel-seo/).`,
    faq: [
      { q: 'Google affiche-t-il toujours ma meta description ?', a: 'Non. Il la remplace parfois par un extrait de la page qu’il juge plus proche de la recherche. Une description claire et fidèle au contenu reste tout de même la meilleure façon de garder la main.' },
      { q: 'Est-ce grave si mes pages n’en ont pas ?', a: 'Le site fonctionne sans, mais vous laissez Google choisir le texte à votre place. Pour les pages importantes, ça vaut vraiment la peine d’en écrire une.' },
    ],
    voir: ['balise-title', 'referencement-naturel-seo', 'call-to-action'],
  },
  {
    slug: 'sitemap',
    icon: 'map',
    nom: 'Plan du site (sitemap)',
    resume: 'La liste de toutes les pages de votre site, préparée pour que Google n’en oublie aucune.',
    h1: "Sitemap : c'est quoi, le plan du site pour Google ?",
    title: 'Sitemap (plan du site) : définition et utilité | Les Minis Monstres',
    description: 'Un sitemap est un fichier qui liste les pages d’un site pour que Google les trouve. À quoi il sert, comment le déclarer, et les erreurs qui le rendent inutile.',
    lead: `Un sitemap, ou plan du site, est un fichier qui donne à Google la liste des pages de votre site, avec leur date de mise à jour. C'est une feuille de route qui l'aide à ne rien rater.`,
    body: `## La définition en une phrase

Le mot anglais veut dire « carte du site ». Il existe deux sortes de plan :

- **Le sitemap XML**, un fichier technique destiné aux moteurs de recherche. Il ressemble à une longue liste d'adresses. C'est de lui qu'on parle le plus souvent.
- **Le plan du site en HTML**, une page normale qui liste les rubriques pour les visiteurs. Il est moins courant aujourd'hui sur les petits sites.

## À quoi ça sert pour une petite entreprise

Google trouve les pages en suivant les liens, d'une page à l'autre. Mais une page récente, ou mal reliée au reste, peut lui échapper longtemps. Le sitemap lui dit en un coup d'œil : **voici toutes les pages qui comptent, et voici celles qui ont changé**.

Sur un site de cinq pages bien reliées, son effet est discret. Sur une boutique avec des dizaines de produits, il devient très utile.

## Un exemple de la vie réelle

Une librairie ajoute une page pour chaque rencontre d'auteur. Ces pages ne sont reliées que depuis une vieille actualité. Google met des semaines à les voir. Une fois le sitemap déclaré dans la Search Console, les nouvelles pages sont repérées bien plus vite.

## Ce qu'il faut savoir

- **Le sitemap ne garantit pas l'apparition dans Google.** Il aide à découvrir une page, mais Google décide ensuite s'il la garde.
- **Il doit rester à jour.** Un sitemap qui liste des pages supprimées envoie Google vers des impasses.
- **Il ne doit contenir que les pages utiles**, pas les pages de remerciement, de connexion ou de test.
- **On le déclare** dans la Google Search Console et on l'indique souvent dans le fichier robots.txt.

!> La plupart des CMS et des outils modernes créent le sitemap tout seuls. Vérifiez quand même qu'il existe et qu'il ne liste pas des pages à cacher.

## Chez les Minis Monstres

Chaque site que je mets en ligne a son sitemap, qui se met à jour quand une page est ajoutée ou retirée. Je le déclare à Google pour vous. Pour comprendre la suite, quand Google range vos pages dans son catalogue, lisez la définition de l'[indexation](/lexique/indexation/). Le fichier qui guide les robots est expliqué sur la page [robots.txt](/lexique/robots-txt/).`,
    faq: [
      { q: 'Où se trouve le sitemap d’un site ?', a: 'En général à une adresse comme votresite.fr/sitemap.xml, ou dans un fichier d’index qui regroupe plusieurs plans. Le fichier robots.txt indique souvent son emplacement.' },
      { q: 'Un petit site a-t-il vraiment besoin d’un sitemap ?', a: 'Il n’est pas indispensable si toutes les pages sont bien reliées entre elles, mais il ne coûte rien et facilite le suivi dans la Search Console. Autant l’avoir.' },
    ],
    voir: ['indexation', 'robots-txt', 'google-search-console'],
  },
  {
    slug: 'robots-txt',
    icon: 'bot',
    nom: 'Fichier robots.txt',
    resume: 'Un petit fichier texte qui dit aux robots des moteurs où ils peuvent aller sur votre site.',
    h1: "Robots.txt : c'est quoi, ce fichier pour les moteurs de recherche ?",
    title: 'Robots.txt : définition simple et erreurs à éviter | Les Minis Monstres',
    description: 'Le fichier robots.txt donne des consignes aux robots qui visitent votre site, comme celui de Google. À quoi il sert, et la petite erreur qui peut tout bloquer.',
    lead: `Le robots.txt est un fichier texte posé à la racine d'un site, qui indique aux robots des moteurs de recherche les parties qu'ils peuvent visiter et celles à laisser de côté. C'est un panneau à l'entrée, pas une serrure.`,
    body: `## La définition en une phrase

Google, Bing et d'autres services envoient des **robots**, des programmes qui parcourent les sites pour les lire. Avant d'entrer, un robot poli regarde d'abord le fichier **robots.txt**, à l'adresse votresite.fr/robots.txt. Il y trouve des consignes simples, du genre « ce dossier, n'y va pas ».

Le fichier peut aussi indiquer où se trouve le [sitemap](/lexique/sitemap/), le plan des pages à découvrir.

## À quoi ça sert pour une petite entreprise

Sur un petit site, le robots.txt sert surtout à éviter que les robots perdent leur temps dans des zones sans intérêt : l'administration, les pages de recherche interne, les paniers d'achat, les fichiers techniques. Les robots se concentrent ainsi sur vos vraies pages.

## Un exemple de la vie réelle

Pendant la fabrication d'un site, le prestataire ajoute une ligne qui interdit tout aux robots, pour que le chantier ne soit pas visible. Le site est mis en ligne, mais personne ne retire la ligne. Des mois plus tard, le gérant s'étonne de ne jamais apparaître dans Google. Une seule ligne oubliée bloquait tout.

## Ce qu'il faut savoir

- **Ce n'est pas une protection.** Le fichier est public, n'importe qui peut le lire, et les robots malveillants l'ignorent. Une page secrète doit être protégée par un mot de passe.
- **Bloquer une page n'est pas la retirer de Google.** Une adresse bloquée peut encore apparaître si d'autres sites pointent vers elle. Pour la faire disparaître, il faut une consigne « noindex » sur la page elle-même.
- **Une petite faute peut avoir de gros effets.** Une barre oblique de trop, et c'est tout le site qui est fermé aux robots.
- **Ne bloquez pas les fichiers de style**, sans quoi Google voit votre site comme une page sans mise en forme.

!> Si votre site n'apparaît pas du tout dans Google après plusieurs semaines, le robots.txt fait partie des premières choses à vérifier.

## Chez les Minis Monstres

Je règle le robots.txt à la mise en ligne de votre site, et je vérifie qu'il laisse bien passer Google sur les pages qui comptent. C'est un petit réglage, mais tout le reste du SEO en dépend. Pour la suite du parcours, lisez la page sur l'[indexation](/lexique/indexation/).`,
    faq: [
      { q: 'Mon site doit-il avoir un fichier robots.txt ?', a: 'Ce n’est pas obligatoire : sans lui, les robots considèrent qu’ils peuvent tout visiter. En avoir un, bien réglé, permet d’indiquer le sitemap et d’écarter les zones inutiles.' },
      { q: 'Peut-on bloquer les robots qui recopient les textes des sites ?', a: 'Certains de ces robots respectent des consignes données dans le robots.txt, d’autres non. C’est un choix à faire selon votre activité, en sachant que le fichier reste une demande et non une barrière.' },
    ],
    voir: ['sitemap', 'indexation', 'google-search-console'],
  },
  {
    slug: 'indexation',
    icon: 'search-check',
    nom: 'Indexation',
    resume: 'Le moment où Google range une page dans son catalogue, pour pouvoir la montrer ensuite.',
    h1: "Indexation : c'est quoi, quand Google range votre site ?",
    title: 'Indexation Google : définition et vérification | Les Minis Monstres',
    description: 'L’indexation, c’est l’entrée d’une page dans le catalogue de Google. Sans elle, la page ne sort pas dans les résultats. Comment la vérifier et la faciliter.',
    lead: `L'indexation est l'étape où Google enregistre une page dans son immense catalogue, appelé index. Une page non indexée est invisible dans les résultats, même si elle est en ligne et parfaitement belle.`,
    body: `## La définition en une phrase

Avant de montrer une page, Google passe par trois étapes :

- **L'exploration** : son robot découvre la page en suivant un lien ou grâce au sitemap.
- **L'indexation** : il lit la page, essaie de comprendre son sujet et décide de la ranger, ou non, dans son index.
- **Le classement** : quand quelqu'un fait une recherche, il choisit parmi les pages indexées celles qui répondent le mieux.

L'indexation est donc **le ticket d'entrée**. Sans elle, le classement n'a même pas lieu.

## À quoi ça sert pour une petite entreprise

Vous pouvez avoir le plus beau site du monde : s'il n'est pas indexé, personne ne le trouve par Google. C'est souvent la première chose à vérifier quand un site récent reste introuvable.

## Un exemple de la vie réelle

Un pâtissier met en ligne une page sur ses pièces montées. Trois semaines plus tard, elle n'apparaît nulle part. En regardant dans la Search Console, il découvre que Google a vu la page mais ne l'a pas gardée : elle contenait seulement deux lignes et une photo. En ajoutant un vrai texte, les prix de départ et les délais de commande, la page finit par être indexée.

## Pourquoi une page peut ne pas être indexée

- **Elle est bloquée** par une consigne « noindex » ou par le fichier robots.txt.
- **Elle est trop pauvre** : peu de texte, rien de neuf par rapport à d'autres pages.
- **Elle ressemble trop à une autre page**, du site ou d'ailleurs.
- **Personne n'y mène** : aucun lien, absente du sitemap.
- **Elle est trop récente** : Google n'est pas encore passé.

## Comment vérifier

Tapez dans Google site: suivi de votre adresse, sans espace, par exemple site:votresite.fr. Vous verrez une partie des pages connues. Pour une réponse précise page par page, la [Google Search Console](/lexique/google-search-console/) reste l'outil de référence.

!> Être indexé ne veut pas dire être bien placé. C'est une condition de départ, pas une garantie de visites.

## Chez les Minis Monstres

À la mise en ligne, je déclare votre site à Google et je surveille que les pages importantes entrent bien dans l'index. La suite du travail est détaillée sur [référencement SEO](/referencement-seo/).`,
    faq: [
      { q: 'Combien de temps faut-il pour qu’une page soit indexée ?', a: 'Cela varie de quelques jours à quelques semaines, selon la notoriété du site et la façon dont la page est reliée. Un sitemap déclaré et un lien depuis une page déjà connue aident à aller plus vite.' },
      { q: 'Peut-on demander à Google d’indexer une page ?', a: 'Oui, depuis la Search Console, avec l’outil d’inspection d’adresse. C’est une demande : Google reste libre de garder la page ou non.' },
    ],
    voir: ['google-search-console', 'sitemap', 'robots-txt'],
  },
  {
    slug: 'backlink',
    icon: 'link',
    nom: 'Backlink (lien entrant)',
    resume: 'Un lien posé sur un autre site et qui mène au vôtre : une forme de recommandation.',
    h1: "Backlink : c'est quoi, un lien entrant ?",
    title: 'Backlink (lien entrant) : définition et conseils | Les Minis Monstres',
    description: 'Un backlink est un lien d’un autre site vers le vôtre. Google y voit une recommandation. Lesquels comptent pour une petite entreprise, et lesquels éviter.',
    lead: `Un backlink, ou lien entrant, est un lien placé sur un autre site qui renvoie vers le vôtre. Pour Google, c'est un peu comme un voisin qui vous recommande : plus la source est sérieuse et proche de votre activité, plus la recommandation pèse.`,
    body: `## La définition en une phrase

Quand le site de l'office de tourisme écrit « dormir au gîte des Tilleuls » et que ces mots mènent à votre site, c'est un **backlink** pour vous. Le mot anglais signifie « lien retour ».

À l'inverse, un lien de votre site vers un autre est un lien sortant, et un lien entre deux de vos propres pages est un [lien interne](/lexique/lien-interne/).

## À quoi ça sert pour une petite entreprise

Les liens entrants jouent deux rôles :

- **Ils amènent des visiteurs**, qui cliquent depuis un site qu'ils consultent déjà.
- **Ils renforcent votre crédibilité** aux yeux de Google, qui y voit le signe que d'autres vous font confiance.

Pour un commerce local, quelques bons liens bien placés valent bien plus qu'une montagne de liens douteux.

## Des liens naturels pour une petite entreprise

- Le site de votre **mairie** ou de votre communauté de communes, dans l'annuaire des entreprises.
- Votre **chambre de métiers** ou de commerce, votre syndicat professionnel.
- Les **fournisseurs** ou partenaires qui listent leurs revendeurs.
- Le **journal local**, s'il parle de votre ouverture ou d'un événement.
- Les **associations** que vous soutenez, le club de sport que vous sponsorisez.

## Un exemple de la vie réelle

Un apiculteur vend son miel sur les marchés. Il demande au site du marché de producteurs, à l'épicerie qui le revend et au syndicat apicole de mettre un lien vers sa page. Trois liens, tous logiques, tous liés à son activité. C'est exactement le genre de signal que Google apprécie.

## Ce qu'il faut éviter

- **Acheter des liens en lot.** Ces offres placent votre lien sur des sites sans rapport, et Google peut sanctionner.
- **Les échanges de liens à la chaîne** avec n'importe qui.
- **Les commentaires remplis de liens** sur des blogs ou des forums.

!> Un bon lien entrant se mérite. Le plus simple est souvent d'avoir quelque chose à montrer : une actualité, un savoir-faire, un partenariat réel.

## Chez les Minis Monstres

Je n'achète jamais de liens pour tromper Google. Si vous travaillez avec des partenaires locaux, un lien de leur site vers le vôtre a du sens : pensez à le leur demander. La démarche complète est sur [référencement SEO](/referencement-seo/).`,
    faq: [
      { q: 'Les liens depuis les réseaux sociaux comptent-ils ?', a: 'Ils amènent des visiteurs, ce qui est déjà bien, mais Google leur accorde en général peu de poids pour le classement. Ils restent utiles pour faire connaître votre site.' },
      { q: 'Un mauvais lien peut-il me faire du tort ?', a: 'Un lien isolé venant d’un site douteux n’a en général pas d’effet, Google sait l’ignorer. Le risque apparaît quand on cherche à tromper avec des liens achetés ou fabriqués en masse.' },
    ],
    voir: ['lien-interne', 'referencement-local', 'referencement-naturel-seo'],
  },
  {
    slug: 'google-search-console',
    icon: 'chart-line',
    nom: 'Google Search Console',
    resume: 'L’outil gratuit de Google pour voir comment votre site apparaît dans ses résultats.',
    h1: "Google Search Console : c'est quoi, et à quoi ça sert ?",
    title: 'Google Search Console : définition et usage simple | Les Minis Monstres',
    description: 'La Google Search Console est un outil gratuit qui montre comment Google voit votre site : recherches, clics, pages indexées, erreurs. Ce qu’il faut y regarder.',
    lead: `La Google Search Console est un outil gratuit fourni par Google aux propriétaires de sites. Elle montre les recherches qui vous font apparaître, les clics obtenus, et les problèmes que Google rencontre en lisant vos pages.`,
    body: `## La définition en une phrase

C'est **le tableau de bord de votre site vu par Google**. Pour y accéder, il faut prouver que le site vous appartient, par exemple en ajoutant un petit code ou un réglage sur le nom de domaine. Ensuite, Google vous ouvre ses données sur votre site.

Elle ne compte pas toutes les visites de votre site : elle ne parle que de ce qui se passe **dans Google**, avant le clic. Les outils de statistiques de visite font un autre travail.

## Ce qu'on y trouve

- **Les performances** : les mots tapés par les internautes, le nombre de fois où vos pages se sont affichées, le nombre de clics, la position moyenne.
- **L'indexation** : les pages que Google a gardées, celles qu'il a écartées, et pourquoi.
- **Les sitemaps** déclarés et leur état.
- **L'expérience sur la page** : la vitesse et la tenue sur téléphone.
- **Les alertes** : problème de sécurité, action manuelle, erreurs graves.

## À quoi ça sert pour une petite entreprise

Elle répond à des questions très concrètes. Est-ce que Google connaît mes pages ? Sur quelles recherches j'apparais ? Les gens cliquent-ils ou passent-ils leur chemin ? Une page a-t-elle disparu du jour au lendemain ?

## Un exemple de la vie réelle

Un vendeur de bois de chauffage découvre dans la Search Console qu'il apparaît souvent pour « livraison bois sec » alors qu'aucune de ses pages n'en parle vraiment. Il ajoute une page claire sur la livraison, avec les zones et les délais. Il répond enfin à une demande qui existait déjà.

## Les erreurs fréquentes

- **Ne jamais l'ouvrir.** Beaucoup de sites l'ont installée sans que personne n'y jette un œil.
- **S'affoler au moindre avertissement.** Certaines pages non indexées sont normales, comme une page de remerciement.
- **Confondre position moyenne et place réelle.** Le chiffre varie selon le lieu, l'appareil et la personne qui cherche.

!> La Search Console est réservée au propriétaire du site et aux personnes qu'il autorise. Gardez la main sur l'accès principal, même si un prestataire s'en sert.

## Chez les Minis Monstres

Je relie votre site à la Search Console dès la mise en ligne et je déclare le sitemap. Voyez aussi la définition de l'[indexation](/lexique/indexation/), et la page [référencement SEO](/referencement-seo/) pour la méthode.`,
    faq: [
      { q: 'La Search Console est-elle payante ?', a: 'Non, elle est gratuite pour tous les propriétaires de sites. Il suffit d’un compte Google et de prouver que le site est à vous.' },
      { q: 'Quelle différence avec un outil de statistiques ?', a: 'La Search Console montre ce qui se passe dans Google avant le clic. Un outil de statistiques montre ce que font les visiteurs une fois sur votre site, d’où qu’ils viennent.' },
    ],
    voir: ['indexation', 'sitemap', 'mot-cle'],
  },
  // ------------------------------------------------------------------ les pages et ce qui fait agir
  {
    slug: 'page-d-accueil',
    icon: 'house',
    nom: 'Page d’accueil',
    resume: 'La première page de votre site, celle qui doit dire en quelques secondes ce que vous faites.',
    h1: "Page d'accueil : c'est quoi, et que faut-il y mettre ?",
    title: 'Page d’accueil d’un site : définition et contenu | Les Minis Monstres',
    description: 'La page d’accueil est la porte d’entrée de votre site. Ce qu’elle doit dire en un coup d’œil, ce qu’on oublie souvent, et comment guider le visiteur ensuite.',
    lead: `La page d'accueil est la page qui s'ouvre quand on tape simplement votre adresse, sans rien derrière. Elle doit dire tout de suite qui vous êtes, ce que vous proposez, où, et comment vous joindre.`,
    body: `## La définition en une phrase

C'est **la porte d'entrée principale** du site, à l'adresse votresite.fr, sans autre chemin. Sur un site une page, elle contient tout. Sur un site de plusieurs pages, elle présente l'essentiel et oriente vers les pages détaillées.

Attention : beaucoup de visiteurs n'arrivent pas par elle. Google les envoie souvent directement sur une page de service. La page d'accueil n'est donc pas la seule à soigner.

## À quoi ça sert pour une petite entreprise

En quelques secondes, le visiteur décide s'il reste. Il cherche trois réponses : **est-ce bien ce que je cherche, est-ce près de chez moi, est-ce sérieux ?** Votre page d'accueil doit y répondre sans qu'il ait à défiler longtemps.

## Ce qu'il faut voir sans faire défiler

- **Votre métier en clair**, pas seulement votre nom ou un slogan poétique.
- **Votre zone** : la ville ou le secteur.
- **Un bouton d'action** : appeler, demander un devis, réserver.
- **Une vraie photo** de vous, de votre boutique ou de votre travail.

## Ce qu'on met ensuite

- Vos principaux services, chacun avec un lien vers sa page.
- Ce qui vous distingue : savoir-faire, garanties, années d'expérience.
- Les horaires, l'adresse et un plan.
- Quelques réalisations ou produits phares.

## Un exemple de la vie réelle

Une agence de voyages locale ouvre son site sur un diaporama de plages, avec la phrase « Le monde vous attend ». Rien sur le fait qu'elle est en centre-ville, qu'on peut venir sans rendez-vous, qu'elle s'occupe aussi des voyages de groupe. En remplaçant le slogan par une phrase simple sur ses services et son adresse, elle donne enfin les bonnes informations au bon moment.

## Les erreurs fréquentes

- **Un texte de bienvenue trop long**, qui ne dit rien de concret.
- **Un diaporama automatique** qui fait défiler les messages trop vite.
- **Le téléphone caché** tout en bas.
- **Une vidéo lourde** qui ralentit l'arrivée sur téléphone.

!> Faites le test : montrez votre page d'accueil cinq secondes à quelqu'un qui ne vous connaît pas, puis demandez-lui ce que vous faites. S'il hésite, la page doit être plus claire.

## Chez les Minis Monstres

Je construis la page d'accueil autour de ce que vos clients viennent chercher, avec un bouton d'appel visible sur téléphone. Le parcours de création est expliqué sur [créer mon site](/creer-mon-site/). Pour une page pensée autour d'une seule offre, voyez la [landing page](/lexique/landing-page/).`,
    faq: [
      { q: 'La page d’accueil doit-elle être longue ?', a: 'Elle doit être aussi longue que nécessaire, pas plus. L’important est que l’essentiel soit visible tout de suite et que chaque partie mène quelque part.' },
      { q: 'Faut-il mettre des actualités sur la page d’accueil ?', a: 'Seulement si vous les tenez à jour. Une actualité vieille de deux ans en page d’accueil donne l’impression d’une entreprise fermée.' },
    ],
    voir: ['call-to-action', 'landing-page', 'responsive'],
  },
  {
    slug: 'landing-page',
    icon: 'target',
    nom: 'Landing page',
    resume: 'Une page pensée pour une seule offre et une seule action, souvent liée à une campagne.',
    h1: "Landing page : c'est quoi, une page d'atterrissage ?",
    title: 'Landing page : définition simple et exemples | Les Minis Monstres',
    description: 'Une landing page est une page conçue pour une seule offre et un seul but : appeler, réserver, s’inscrire. Quand en créer une, et ce qui la rend efficace.',
    lead: `Une landing page, ou page d'atterrissage, est une page faite pour accueillir les visiteurs venus d'une publicité, d'un e-mail ou d'un flyer, et les pousser vers une seule action. Elle parle d'une seule chose, et elle le fait bien.`,
    body: `## La définition en une phrase

Le nom vient de l'anglais *to land*, atterrir. C'est **la page sur laquelle on atterrit** après avoir cliqué sur un lien précis. Contrairement à la page d'accueil, qui présente toute l'entreprise, la landing page se concentre sur un seul sujet : une offre de saison, un nouveau service, un événement.

## À quoi ça sert pour une petite entreprise

Quand vous faites une action ciblée, vous voulez que la personne trouve **exactement ce qu'on lui a promis**, sans chercher. Si votre publicité parle d'une offre sur l'entretien de chaudière et que le clic mène à votre page d'accueil générale, le visiteur se perd et repart.

Une landing page sert aussi à mesurer : combien de personnes sont venues de cette campagne, et combien ont agi.

## Un exemple de la vie réelle

Un salon de toilettage distribue des cartes chez les vétérinaires du coin, avec un QR code « première séance pour chiot ». Le code mène à une page dédiée : les détails de la séance, le prix, des photos, et un seul gros bouton pour réserver. Pas de menu qui distrait, pas de liste de tous les services.

## Ce qui rend une landing page efficace

- **Un titre qui reprend la promesse** de l'annonce ou du flyer.
- **Une seule offre**, expliquée simplement.
- **Les réponses aux questions** qu'on se pose avant de dire oui : prix, durée, conditions.
- **Une seule action principale**, répétée si la page est longue.
- **Peu ou pas de sorties** : on retire souvent le menu pour éviter que le visiteur s'éparpille.

## Ce qu'il faut savoir

- **Une landing page n'est pas toujours faite pour Google.** Si elle sert une campagne temporaire, on peut même la cacher des moteurs une fois l'offre terminée.
- **Elle doit être rapide**, surtout depuis un téléphone, car les visiteurs payés ou démarchés sont peu patients.
- **Elle ne remplace pas un site.** Elle s'ajoute à lui pour une occasion précise.

!> Une landing page se juge sur une chose : le nombre de personnes qui font l'action prévue. Le reste n'est que décoration.

## Chez les Minis Monstres

Un site d'une seule page peut faire office de landing page pour lancer une activité ou un événement. Il coûte ${page.price} €, le même prix qu'un site plus grand, jusqu'à ${creation.pages} pages. Le prix et les options sont détaillés sur [créer mon site](/creer-mon-site/). Le bouton qui fait agir est détaillé à la page [call to action](/lexique/call-to-action/).`,
    faq: [
      { q: 'Quelle différence entre landing page et page d’accueil ?', a: 'La page d’accueil présente toute l’entreprise et oriente vers le reste du site. La landing page parle d’une seule offre et vise une seule action.' },
      { q: 'Faut-il faire de la publicité pour avoir une landing page ?', a: 'Non. Elle peut aussi recevoir des visiteurs depuis un e-mail, un QR code, un post sur les réseaux ou une carte de visite. Ce qui compte, c’est qu’ils arrivent avec une attente précise.' },
    ],
    voir: ['call-to-action', 'page-d-accueil', 'analytics'],
  },
  {
    slug: 'call-to-action',
    icon: 'mouse-pointer-click',
    nom: 'Call to action',
    resume: 'Le bouton ou la phrase qui invite le visiteur à passer à l’action : appeler, réserver, commander.',
    h1: "Call to action : c'est quoi, un appel à l'action ?",
    title: 'Call to action (CTA) : définition et exemples | Les Minis Monstres',
    description: 'Un call to action est un bouton ou une phrase qui invite à agir : appeler, réserver, demander un devis. Comment l’écrire et où le placer pour qu’il soit vu.',
    lead: `Un call to action, souvent abrégé CTA, est un élément qui invite clairement le visiteur à faire quelque chose : un bouton « Appeler », un lien « Demander un devis », une phrase « Réservez votre table ». C'est le pont entre l'intérêt et le contact.`,
    body: `## La définition en une phrase

En français, on dit **appel à l'action**. C'est le moment où le site cesse d'informer pour **proposer une suite**. Le plus souvent, il prend la forme d'un bouton bien visible, d'une autre couleur que le reste de la page.

## À quoi ça sert pour une petite entreprise

Un visiteur intéressé ne cherche pas longtemps comment vous contacter. S'il ne voit pas tout de suite quoi faire, il ferme la page et passe à autre chose. Un bon appel à l'action lui **montre le chemin** au moment où il est prêt.

## Un exemple de la vie réelle

Un couvreur a un site joli et complet. Tout en bas, en petit, une ligne : « Pour nous joindre, voir la page contact ». En ajoutant en haut de chaque page un bouton « Appeler » qui lance l'appel sur téléphone, et en fin de page un bouton « Demander un devis gratuit », il rend le passage à l'acte évident, sans rien changer au reste.

## Comment écrire un bon appel à l'action

- **Un verbe d'action** : appeler, réserver, commander, recevoir, découvrir.
- **Ce que la personne obtient** : « Recevoir mon devis » parle plus que « Envoyer ».
- **Court** : deux à cinq mots, lisibles d'un coup d'œil.
- **Rassurant si besoin** : « sans engagement », « réponse sous 48 heures », seulement si c'est vrai.

## Où le placer

- **En haut de page**, visible sans faire défiler.
- **Après chaque partie importante**, quand le visiteur vient d'être convaincu.
- **En fin de page**, pour ceux qui ont tout lu.
- **Fixe en bas de l'écran sur téléphone**, pour un métier où l'appel est le contact principal.

## Les erreurs fréquentes

- **Trop de boutons différents** sur la même page. Le visiteur ne sait plus lequel choisir.
- **Des boutons vagues** comme « En savoir plus » partout.
- **Un bouton qui ne mène nulle part**, ou vers un formulaire cassé.
- **Une couleur qui se fond** dans le décor.

!> Chaque page devrait avoir une action principale. Demandez-vous : si le visiteur ne fait qu'une chose ici, laquelle je veux qu'il fasse ?

## Chez les Minis Monstres

Sur chaque site, je place un appel à l'action clair, adapté à votre métier : appel direct pour un dépanneur, réservation pour un restaurant, ajout au panier pour une boutique. Vous pouvez en voir le principe sur [créer mon site](/creer-mon-site/). Ce qui se passe après le clic est expliqué à la page [formulaire de contact](/lexique/formulaire-de-contact/).`,
    faq: [
      { q: 'Un numéro de téléphone peut-il servir d’appel à l’action ?', a: 'Oui, s’il est cliquable sur téléphone et bien mis en valeur. Pour beaucoup d’artisans et de commerces de proximité, c’est même le plus efficace.' },
      { q: 'Quelle couleur choisir pour un bouton ?', a: 'Une couleur qui ressort bien sur le fond et qui reste dans l’esprit de votre site. Le plus important est le contraste et la cohérence : le même style pour toutes les actions principales.' },
    ],
    voir: ['formulaire-de-contact', 'landing-page', 'page-d-accueil'],
  },
  {
    slug: 'formulaire-de-contact',
    icon: 'send',
    nom: 'Formulaire de contact',
    resume: 'Les quelques cases à remplir sur votre site pour qu’un client vous écrive sans ouvrir sa messagerie.',
    h1: "Formulaire de contact : c'est quoi, et comment le rendre utile ?",
    title: 'Formulaire de contact : définition et bons usages | Les Minis Monstres',
    description: 'Un formulaire de contact permet à un visiteur de vous écrire depuis votre site. Les champs à demander, ceux à éviter, et pourquoi certains messages se perdent.',
    lead: `Un formulaire de contact est un petit bloc de cases sur votre site, où le visiteur écrit son nom, son moyen de contact et sa demande. Il clique sur un bouton, et le message arrive dans votre boîte mail.`,
    body: `## La définition en une phrase

C'est **une boîte aux lettres posée sur votre site**. Le visiteur n'a pas besoin de copier votre adresse e-mail ni d'ouvrir son logiciel de messagerie : il remplit, il envoie, c'est fini.

Derrière, un petit programme vérifie le message, le met en forme et vous l'expédie. Souvent, une réponse automatique confirme au visiteur que sa demande est bien partie.

## À quoi ça sert pour une petite entreprise

- **Recevoir des demandes en dehors des heures d'ouverture**, le soir ou le dimanche.
- **Obtenir les bonnes informations dès le départ** : le type de travaux, la date souhaitée, la ville.
- **Garder une trace écrite**, plus facile à retrouver qu'un message vocal.
- **Toucher les clients qui n'aiment pas téléphoner**, et il y en a beaucoup.

## Un exemple de la vie réelle

Un photographe de mariage reçoit des messages du genre « Bonjour, c'est combien ? ». Il doit à chaque fois répondre pour demander la date, le lieu et le nombre d'invités. En ajoutant ces trois champs au formulaire, il reçoit des demandes complètes et peut répondre avec un tarif dès le premier échange.

## Les bons réglages

- **Peu de champs.** Chaque case en plus fait abandonner quelqu'un. Gardez l'indispensable.
- **Des champs adaptés au téléphone**, avec le bon clavier pour le numéro et l'e-mail.
- **Un message clair après l'envoi**, pour que la personne sache que c'est parti.
- **Une protection contre les robots**, sans casse-tête pour les humains.
- **Une phrase sur l'usage des données** : ce que vous en faites, combien de temps vous les gardez.

## Les erreurs fréquentes

- **Un formulaire qui ne marche plus** depuis des mois sans que personne ne le remarque. Testez-le régulièrement en vous envoyant un message.
- **Des messages qui tombent dans les indésirables.** Une mauvaise configuration d'envoi en est souvent la cause.
- **Demander des informations inutiles**, comme la date de naissance pour un devis de peinture.

!> Un formulaire ne remplace pas le téléphone. Affichez les deux, et laissez le client choisir sa façon de vous joindre.

## Chez les Minis Monstres

Chaque site que je livre a son formulaire, relié à votre messagerie. Je le teste avant la mise en ligne et il tourne sur une connexion protégée en HTTPS. Tout ce que comprend l'abonnement est listé sur la page des [tarifs](/tarifs/). Les règles sur les données personnelles sont résumées à la page [RGPD et cookies](/lexique/rgpd-cookies/).`,
    faq: [
      { q: 'Où arrivent les messages du formulaire ?', a: 'Dans la boîte mail de votre choix. Il peut s’agir de votre adresse habituelle ou d’une adresse professionnelle à votre nom de domaine.' },
      { q: 'Pourquoi je reçois des messages publicitaires par mon formulaire ?', a: 'Des robots remplissent automatiquement les formulaires trouvés sur internet. Une protection bien réglée en bloque la plus grande partie, sans gêner vos vrais clients.' },
    ],
    voir: ['call-to-action', 'rgpd-cookies', 'email-professionnel'],
  },
  // ------------------------------------------------------------------ règles et obligations
  {
    slug: 'rgpd-cookies',
    icon: 'cookie',
    nom: 'RGPD et cookies',
    resume: 'Les règles européennes sur les données personnelles, et ce qu’elles changent pour votre site.',
    h1: "RGPD et cookies : c'est quoi, pour le site d'une petite entreprise ?",
    title: 'RGPD et cookies : ce que doit faire un petit site | Les Minis Monstres',
    description: 'Le RGPD encadre l’usage des données personnelles, et les cookies en font partie. Ce que cela change pour le site d’une petite entreprise, expliqué simplement.',
    lead: `Le RGPD est le règlement européen qui protège les données personnelles : nom, e-mail, téléphone, adresse, mais aussi certaines traces de navigation. Les cookies sont de petits fichiers déposés par un site dans le navigateur, et ils sont concernés par ces règles.`,
    body: `## La définition en une phrase

**RGPD** veut dire Règlement général sur la protection des données. Il s'applique à toute entreprise, même très petite, qui recueille des informations sur des personnes. Un formulaire de contact suffit pour être concerné.

Un **cookie** est un petit fichier texte qu'un site enregistre sur l'appareil du visiteur. Certains sont nécessaires au fonctionnement, comme celui qui garde votre panier. D'autres servent à mesurer l'audience ou à suivre la personne pour la publicité.

## Ce que cela veut dire pour vous

- **Ne demander que ce qui sert.** Pour un devis, le nom, un moyen de contact et la demande suffisent souvent.
- **Expliquer ce que vous faites des données** : pourquoi vous les gardez, combien de temps, qui y a accès.
- **Les protéger** : site en HTTPS, accès limité, pas de fichier qui traîne partout.
- **Permettre à chacun de les consulter ou de les faire effacer**, sur simple demande.

## Et les cookies ?

En France, la règle générale est la suivante : les cookies **indispensables** au fonctionnement peuvent être posés sans demander. Pour les autres, en particulier la publicité et certains outils de mesure, il faut **l'accord du visiteur avant** de les déposer. D'où les bandeaux qui demandent d'accepter ou de refuser.

Refuser doit être aussi simple qu'accepter. Un bandeau où seul le bouton « Tout accepter » est visible ne respecte pas l'esprit de la règle.

## Un exemple de la vie réelle

Un caviste ajoute à son site une vidéo, une carte et un bouton de partage. Sans le savoir, chacun de ces modules dépose ses propres cookies dès l'arrivée du visiteur. Le site, pensé comme une simple vitrine, se retrouve à envoyer des données à plusieurs services extérieurs. Il a suffi de les charger seulement après accord pour remettre les choses d'aplomb.

!> Le plus simple, pour un petit site, reste de limiter les outils qui déposent des cookies. Moins d'outils, c'est aussi moins de bandeau et un site plus rapide.

## Ce qu'il faut savoir

La CNIL est l'autorité française qui veille au respect de ces règles. Son site propose des fiches pratiques pour les petites structures. Pour un cas particulier, un professionnel du droit reste le bon interlocuteur.

## Chez les Minis Monstres

Je construis des sites sobres, sans traceurs inutiles, en HTTPS, avec un formulaire qui ne demande que l'essentiel. Si votre site a besoin d'un bandeau de consentement, je le mets en place. La page sur les [mentions légales](/lexique/mentions-legales/) complète ce sujet, et vous pouvez me poser vos questions sur la page [contact](/contact/).`,
    faq: [
      { q: 'Mon site doit-il forcément avoir un bandeau cookies ?', a: 'Seulement s’il dépose des cookies qui demandent un accord, comme ceux de publicité ou certains outils de mesure. Un site qui n’utilise que des cookies indispensables peut s’en passer.' },
      { q: 'Le RGPD concerne-t-il les auto-entrepreneurs ?', a: 'Oui. La taille de l’entreprise ne change pas le principe : dès que vous recueillez des données sur des personnes, vous devez les traiter avec soin et expliquer ce que vous en faites.' },
    ],
    voir: ['mentions-legales', 'formulaire-de-contact', 'analytics'],
  },
  {
    slug: 'mentions-legales',
    icon: 'scale',
    nom: 'Mentions légales',
    resume: 'La page obligatoire qui dit qui édite le site, qui l’héberge et comment vous joindre.',
    h1: "Mentions légales : c'est quoi, et que doivent-elles contenir ?",
    title: 'Mentions légales d’un site : définition et contenu | Les Minis Monstres',
    description: 'Les mentions légales sont une page obligatoire sur le site d’une entreprise : identité, contact, hébergeur. Ce qu’on y met en général et les oublis fréquents.',
    lead: `Les mentions légales sont une page de votre site qui indique qui en est responsable : le nom de l'entreprise, ses coordonnées, ses numéros d'immatriculation et l'hébergeur. En France, tout site professionnel doit en avoir une.`,
    body: `## La définition en une phrase

C'est **la carte d'identité officielle du site**. Elle permet à n'importe quel visiteur de savoir à qui il a affaire, et de vous contacter si besoin. On la trouve en général par un lien discret en bas de chaque page.

## Ce qu'on y trouve en général

Pour une entreprise, on retrouve le plus souvent :

- **Le nom ou la raison sociale**, et la forme juridique.
- **L'adresse** du siège ou de l'établissement.
- **Un e-mail et un téléphone** pour vous joindre.
- **Le numéro d'immatriculation**, par exemple le SIREN ou le numéro au registre concerné.
- **Le numéro de TVA intracommunautaire**, si vous en avez un.
- **Le nom du responsable de la publication**, la personne qui répond du contenu.
- **Le nom, l'adresse et le contact de l'hébergeur.**

Certaines professions réglementées ont des informations en plus à afficher, comme l'ordre ou la chambre dont elles dépendent.

## À quoi ça sert pour une petite entreprise

Au-delà de l'obligation, c'est une question de **confiance**. Un client qui hésite à commander va parfois vérifier qu'il y a bien une vraie entreprise derrière le site. Une page vide ou absente fait douter.

## Un exemple de la vie réelle

Une créatrice de bijoux lance sa boutique en ligne et recopie les mentions légales d'un autre site, en changeant seulement le nom. L'hébergeur indiqué n'est pas le sien, l'adresse est celle de l'ancienne société. Un client méfiant le remarque et le lui signale. Des mentions fausses font pire effet que des mentions courtes mais justes.

## Ce qu'il faut savoir

- **Mentions légales, politique de confidentialité et conditions de vente** sont trois choses différentes. Une boutique a besoin des trois.
- **Elles doivent rester à jour** : un déménagement, un changement de statut ou d'hébergeur doit s'y retrouver.
- **Un auto-entrepreneur qui travaille chez lui** doit en principe indiquer une adresse. Des solutions de domiciliation existent pour ne pas afficher son domicile.

!> Pour un cas particulier ou une profession réglementée, vérifiez auprès de votre chambre consulaire ou d'un professionnel du droit. Cette page donne des repères, pas un avis juridique.

## Chez les Minis Monstres

Je prévois une page de mentions légales sur chaque site et je vous indique les informations à me fournir. Le contenu juridique reste sous votre responsabilité, et mes petits monstres ne touchent jamais à ce type de texte : c'est moi qui m'en occupe quand il faut le modifier. Pour les données de vos visiteurs, voyez la page [RGPD et cookies](/lexique/rgpd-cookies/).`,
    faq: [
      { q: 'Que risque-t-on sans mentions légales ?', a: 'L’absence de mentions légales sur un site professionnel est un manquement qui peut être sanctionné. Surtout, c’est un signal négatif pour les visiteurs qui cherchent à vous identifier.' },
      { q: 'Où placer le lien vers les mentions légales ?', a: 'En bas de chaque page, dans le pied de site. Il doit être facile à trouver depuis n’importe quel endroit du site.' },
    ],
    voir: ['rgpd-cookies', 'hebergement-web', 'formulaire-de-contact'],
  },
  // ------------------------------------------------------------------ faire vivre et protéger son site
  {
    slug: 'maintenance-site',
    icon: 'wrench',
    nom: 'Maintenance de site',
    resume: 'L’entretien régulier qui garde un site sûr, rapide et en état de marche, mois après mois.',
    h1: "Maintenance de site internet : c'est quoi, et pourquoi c'est nécessaire ?",
    title: 'Maintenance de site internet : définition simple | Les Minis Monstres',
    description: 'La maintenance d’un site, c’est l’entretien qui le garde sûr et en état : mises à jour, sauvegardes, surveillance, petites corrections. Ce qu’elle comprend.',
    lead: `La maintenance d'un site, c'est tout ce qu'on fait après la mise en ligne pour qu'il continue de bien fonctionner : mises à jour, sauvegardes, surveillance, corrections. Un site n'est pas un objet qu'on pose et qu'on oublie.`,
    body: `## La définition en une phrase

Un site ressemble plus à une voiture qu'à une affiche. Il a un moteur, le logiciel, et des pièces, les extensions, qui s'usent avec le temps. La **maintenance** est la révision régulière qui évite la panne.

## Ce qu'elle comprend

- **Les mises à jour** du logiciel, du thème et des extensions, pour boucher les failles et rester compatible.
- **Les sauvegardes** régulières, pour pouvoir revenir en arrière.
- **La surveillance** : le site est-il en ligne, rapide, sans erreur ?
- **La sécurité** : certificat HTTPS renouvelé, accès protégés, tentatives d'intrusion bloquées.
- **Les petites corrections** : un lien cassé, une image qui ne s'affiche plus, un formulaire qui n'envoie rien.

On y ajoute souvent les **modifications de contenu** : un nouveau tarif, une photo, un horaire. Ce n'est pas de la réparation, mais c'est ce qui garde le site juste.

## À quoi ça sert pour une petite entreprise

Sans entretien, un site vieillit en silence. Il ralentit, affiche des erreurs, puis un jour il est piraté ou il ne s'ouvre plus. Le problème, c'est qu'on s'en rend compte tard, souvent par un client qui appelle pour dire « votre site ne marche pas ».

## Un exemple de la vie réelle

Un gîte rural a un site fait il y a quelques années par un neveu. Personne n'y a touché depuis. Un matin, la page d'accueil affiche des publicités qui n'ont rien à voir. Le site a été piraté par une faille connue, corrigée depuis longtemps dans une mise à jour jamais installée. La réparation a pris plus de temps que des années d'entretien.

## Ce qu'il faut savoir

- **La maintenance est rarement visible** quand elle est bien faite. C'est justement le but.
- **Une mise à jour peut casser quelque chose.** Il faut vérifier après coup, et garder une sauvegarde à portée de main.
- **Demandez ce qui est compris.** « Maintenance » peut vouloir dire beaucoup ou très peu selon les prestataires.

!> Un site sans maintenance coûte rarement moins cher. Il coûte plus tard, d'un coup, et souvent au pire moment.

## Chez les Minis Monstres

C'est le cœur de l'[abonnement](/tarifs/). Pour ${abo.month} € par mois, j'héberge votre site, et ${minus(gardien)}, un petit monstre que j'ai programmé, fait les mises à jour, garde le HTTPS et surveille que tout tourne. Je vérifie ce qu'il fait. Vos changements de contenu passent par l'espace client : ils sont compris sans limite, et en ligne en ${abo.delai} en moyenne. Voyez aussi la page sur la [sauvegarde de site](/lexique/sauvegarde-site/).`,
    faq: [
      { q: 'À quelle fréquence faut-il faire la maintenance ?', a: 'La surveillance doit être continue, et les mises à jour faites dès qu’elles sortent, surtout celles de sécurité. Les autres vérifications peuvent suivre un rythme régulier, par exemple chaque mois.' },
      { q: 'Puis-je faire la maintenance de mon site moi-même ?', a: 'C’est possible si vous avez le temps et les bases techniques. Le plus dur n’est pas de cliquer sur « mettre à jour », mais de savoir quoi faire quand une mise à jour casse quelque chose.' },
    ],
    voir: ['sauvegarde-site', 'extension-plugin', 'hebergement-web'],
  },
  {
    slug: 'sauvegarde-site',
    icon: 'history',
    nom: 'Sauvegarde de site',
    resume: 'Une copie complète de votre site, gardée à l’abri, pour tout remettre en place après un problème.',
    h1: "Sauvegarde de site internet : c'est quoi, et pourquoi en faire ?",
    title: 'Sauvegarde de site internet : définition et conseils | Les Minis Monstres',
    description: 'Une sauvegarde est une copie de votre site gardée ailleurs, pour le restaurer après une panne, une erreur ou un piratage. Les règles d’une bonne sauvegarde.',
    lead: `Une sauvegarde de site est une copie de tous ses fichiers et de sa base de données, rangée à un autre endroit. Si le site casse, est piraté ou qu'une modification tourne mal, on le remet dans l'état de la copie.`,
    body: `## La définition en une phrase

C'est **la roue de secours du site**. On ne s'en sert presque jamais, mais le jour où on en a besoin, rien ne la remplace.

Une sauvegarde complète contient deux choses :

- **Les fichiers** : le logiciel, le thème, les extensions, les images.
- **La base de données** : les textes, les pages, les réglages, et pour une boutique les produits et les commandes.

## À quoi ça sert pour une petite entreprise

Les causes de problème ne manquent pas : une mise à jour qui se passe mal, une erreur de manipulation, un piratage, une panne chez l'hébergeur. Avec une sauvegarde récente, on revient en arrière en peu de temps. Sans elle, il faut parfois tout refaire à partir de rien.

## Un exemple de la vie réelle

Une épicerie fine supprime par erreur la page de ses paniers garnis, la plus visitée avant Noël. Pas de panique : la sauvegarde de la veille permet de la retrouver telle quelle, avec ses photos et ses prix. Sans copie, il aurait fallu tout réécrire en pleine saison.

## Les règles d'une bonne sauvegarde

- **Régulière.** Plus le site change souvent, plus il faut sauvegarder souvent. Une boutique qui reçoit des commandes chaque jour a besoin de copies plus fréquentes qu'une vitrine.
- **Automatique.** Une sauvegarde qui dépend de la mémoire de quelqu'un finit par être oubliée.
- **Rangée ailleurs.** Une copie gardée sur le même serveur que le site disparaît avec lui en cas de gros souci.
- **Plusieurs versions.** Si le problème date de plusieurs jours, la copie d'hier est déjà touchée. Il faut pouvoir remonter plus loin.
- **Testée.** Une sauvegarde qu'on n'a jamais essayé de restaurer reste une promesse.

!> Faites toujours une sauvegarde juste avant une grosse modification ou une mise à jour importante. C'est le réflexe qui évite le plus de sueurs froides.

## Les erreurs fréquentes

- Croire que l'hébergeur s'en occupe forcément. Ce n'est pas le cas de toutes les offres.
- Garder une seule copie, écrasée chaque nuit.
- Oublier la base de données et ne sauvegarder que les fichiers.

## Chez les Minis Monstres

Les sauvegardes font partie de l'entretien compris dans l'[abonnement](/tarifs/). ${gardien}, le petit monstre qui veille sur votre site, les fait pour vous, et je m'en sers si quelque chose doit être remis en place. Vous n'avez rien à programmer. Pour le reste de l'entretien, voyez la page [maintenance de site](/lexique/maintenance-site/).`,
    faq: [
      { q: 'Combien de temps faut-il garder les sauvegardes ?', a: 'Assez longtemps pour revenir avant un problème qui serait passé inaperçu quelques jours. Garder plusieurs copies d’âges différents est plus sûr qu’une seule copie très récente.' },
      { q: 'Puis-je récupérer une copie de mon site ?', a: 'Oui. Votre site vous appartient : si vous changez de prestataire, je vous transmets ses fichiers.' },
    ],
    voir: ['maintenance-site', 'hebergement-web', 'extension-plugin'],
  },
  {
    slug: 'temps-de-chargement',
    icon: 'timer',
    nom: 'Temps de chargement',
    resume: 'Le temps qu’il faut à une page pour s’afficher : quelques secondes qui comptent beaucoup.',
    h1: "Temps de chargement : c'est quoi, et pourquoi la vitesse compte ?",
    title: 'Temps de chargement d’un site : définition et causes | Les Minis Monstres',
    description: 'Le temps de chargement est la durée avant qu’une page s’affiche et réponde. Pourquoi un site lent perd des clients, et les causes de lenteur les plus courantes.',
    lead: `Le temps de chargement est le temps qui s'écoule entre le moment où l'on tape une adresse ou touche un lien, et celui où la page est lisible et utilisable. Sur téléphone, chaque seconde de trop fait partir des visiteurs.`,
    body: `## La définition en une phrase

Quand on ouvre une page, le navigateur doit demander les fichiers au serveur, les recevoir, puis les assembler : le texte, le style, les images, les scripts. Le **temps de chargement** mesure cette attente.

On parle souvent de plusieurs moments : quand le premier élément apparaît, quand le contenu principal est visible, et quand la page réagit enfin aux gestes.

## À quoi ça sert pour une petite entreprise

Un client qui cherche un dépanneur ou une pharmacie de garde n'attend pas. Si votre page reste blanche, il revient en arrière et touche le résultat suivant. La vitesse joue aussi sur Google, qui tient compte de l'expérience des visiteurs.

## Un exemple de la vie réelle

Un photographe met sur sa page d'accueil quinze photos en très haute définition, telles qu'elles sortent de l'appareil. Sur son ordinateur fibré, tout va bien. Sur le téléphone d'un client en zone rurale, la page met une éternité. En réduisant le poids des images sans perte visible, la même page s'ouvre presque tout de suite.

## Les causes de lenteur les plus courantes

- **Des images trop lourdes**, de loin la cause la plus fréquente.
- **Trop d'extensions** et de scripts chargés sur chaque page.
- **Un thème chargé** de fonctions inutilisées.
- **Un hébergement faible** ou surchargé.
- **Des vidéos ou des polices** chargées dès l'ouverture, même si personne ne les regarde.
- **Des outils extérieurs** : cartes, réseaux sociaux, mesure d'audience, chacun ajoutant ses fichiers.

## Comment vérifier

Ouvrez votre site sur votre téléphone, en 4G plutôt qu'en wifi. C'est le test le plus honnête. Des outils gratuits, comme PageSpeed Insights de Google, donnent ensuite un diagnostic plus détaillé avec des pistes d'amélioration.

!> Le score d'un outil de test n'est qu'un indicateur. Ce qui compte, c'est ce que ressent un vrai client, sur un vrai téléphone, avec une vraie connexion.

## Chez les Minis Monstres

Je fais des sites légers : images allégées, peu de modules, code propre. Votre site tourne sur un serveur de qualité, qui tient bon quand il y a du monde. L'hébergement fait partie de l'abonnement, décrit sur la page des [tarifs](/tarifs/). Pour comprendre le rôle de la machine, voyez la définition du [serveur web](/lexique/serveur-web/).`,
    faq: [
      { q: 'Quel est un bon temps de chargement ?', a: 'Le plus court possible. Une page dont le contenu principal apparaît en un clin d’œil sur téléphone donne une bonne impression. Au-delà de quelques secondes d’attente, beaucoup de visiteurs abandonnent.' },
      { q: 'Un site rapide sur mon ordinateur l’est-il aussi pour mes clients ?', a: 'Pas forcément. Votre ordinateur a peut-être déjà gardé les fichiers en mémoire et profite d’une bonne connexion. Testez depuis un téléphone, en données mobiles, et si possible depuis un autre appareil que le vôtre.' },
    ],
    voir: ['serveur-web', 'responsive', 'hebergement-web'],
  },
  {
    slug: 'email-professionnel',
    icon: 'at-sign',
    nom: 'E-mail professionnel',
    resume: 'Une adresse à votre nom de domaine, comme contact@votreboite.fr, au lieu d’une adresse gratuite.',
    h1: "E-mail professionnel : c'est quoi, et pourquoi en avoir un ?",
    title: 'E-mail professionnel : définition et avantages | Les Minis Monstres',
    description: 'Un e-mail professionnel utilise le nom de domaine de votre entreprise au lieu d’une adresse gratuite. Ce qu’il apporte en confiance, et ce qu’il faut vérifier.',
    lead: `Un e-mail professionnel est une adresse qui finit par le nom de domaine de votre entreprise, par exemple contact@boulangerie-martin.fr. Il remplace l'adresse gratuite du type prenom.nom1987 chez un grand fournisseur.`,
    body: `## La définition en une phrase

Votre site a une adresse, votre nom de domaine. Ce même nom peut servir à créer des **adresses e-mail** : contact@, devis@, ou prenom@ suivi de votre domaine. Les messages arrivent dans une boîte que vous consultez sur votre téléphone et votre ordinateur, comme n'importe quelle messagerie.

## À quoi ça sert pour une petite entreprise

- **Inspirer confiance.** Un devis qui vient de contact@votre-entreprise.fr fait plus sérieux qu'une adresse gratuite avec des chiffres.
- **Rappeler votre nom à chaque envoi.** Chaque e-mail fait un peu de publicité pour votre site.
- **Rester maître de votre adresse.** Si vous changez de fournisseur de messagerie, l'adresse reste la même.
- **Séparer le travail et la vie privée**, plus facilement qu'avec une seule boîte pour tout.

## Un exemple de la vie réelle

Un plaquiste répond aux demandes de devis depuis une adresse gratuite créée il y a quinze ans, avec un vieux surnom. Une cliente lui avoue plus tard qu'elle a hésité, pensant à une arnaque. Avec une adresse à son nom de domaine, la question ne se serait pas posée.

## Ce qu'il faut savoir

- **Il faut un nom de domaine.** L'e-mail professionnel en dépend. Le guide [choisir son nom de domaine](/guides/choisir-nom-de-domaine/) vous aide à le trouver.
- **Les réglages techniques comptent.** Sans eux, vos messages risquent d'arriver dans les indésirables de vos clients. Ces réglages prouvent que vous êtes bien l'expéditeur.
- **Une adresse générique et une adresse personnelle** n'ont pas le même rôle. contact@ se donne à tout le monde, prenom@ sert aux échanges suivis.
- **Pensez au départ d'un salarié** : une adresse générique reste en place, une adresse personnelle doit être redirigée.

!> Gardez votre ancienne adresse active quelque temps et faites-la renvoyer vers la nouvelle. Les clients qui ont l'ancienne pourront encore vous joindre.

## Chez les Minis Monstres

La boîte e-mail ne fait pas partie de l'offre. Votre nom de domaine reste à votre nom : vous pouvez y relier des adresses chez le fournisseur de messagerie de votre choix. Les messages de votre [formulaire de contact](/lexique/formulaire-de-contact/) peuvent y arriver directement.`,
    faq: [
      { q: 'Peut-on avoir plusieurs adresses avec le même nom de domaine ?', a: 'Oui, autant que nécessaire en général : une pour les contacts, une pour la facturation, une par personne. Chaque boîte peut avoir un coût selon le fournisseur.' },
      { q: 'Vais-je perdre mes anciens e-mails ?', a: 'Non. Vos anciens messages restent dans l’ancienne boîte. Vous pouvez aussi les transférer ou les garder en parallèle le temps de la transition.' },
    ],
    voir: ['formulaire-de-contact', 'hebergement-web', 'mentions-legales'],
  },
  // ------------------------------------------------------------------ mesurer et relier
  {
    slug: 'analytics',
    icon: 'chart-no-axes-column',
    nom: 'Statistiques de visite',
    resume: 'Les chiffres qui montrent combien de personnes viennent sur votre site, d’où, et ce qu’elles regardent.',
    h1: "Statistiques de site (analytics) : c'est quoi, et que regarder ?",
    title: 'Statistiques de site (analytics) : définition simple | Les Minis Monstres',
    description: 'Les statistiques de visite, ou analytics, montrent qui vient sur votre site, d’où et sur quelles pages. Les quelques chiffres utiles pour une petite entreprise.',
    lead: `Les statistiques de visite, qu'on appelle souvent analytics, sont les chiffres qui racontent la vie de votre site : combien de visiteurs, d'où ils viennent, sur quel appareil et quelles pages ils lisent. Elles servent à décider sur du concret plutôt qu'à l'intuition.`,
    body: `## La définition en une phrase

Un outil de mesure d'audience compte les passages sur votre site et les range dans un tableau de bord. Le mot anglais *analytics* désigne cette analyse. Google Analytics est l'outil le plus connu, mais il en existe d'autres, plus simples ou plus respectueux de la vie privée.

## Les chiffres utiles pour une petite entreprise

Pas besoin de regarder cinquante courbes. Quelques repères suffisent :

- **Le nombre de visiteurs**, et son évolution d'un mois à l'autre.
- **La provenance** : Google, réseaux sociaux, liens d'autres sites, adresse tapée directement.
- **Les appareils** : téléphone, ordinateur, tablette.
- **Les pages les plus vues**, et celles que personne n'ouvre.
- **Les actions** : clics sur le téléphone, formulaires envoyés, commandes.

## À quoi ça sert concrètement

Les statistiques répondent à des questions pratiques. Ma page sur la vente à emporter est-elle lue ? Mes flyers amènent-ils du monde ? Mes clients viennent-ils surtout du téléphone ? Elles aident à savoir **où mettre ses efforts**.

## Un exemple de la vie réelle

Un loueur de vélos pense que ses clients sont surtout des touristes étrangers. Les statistiques montrent que la plupart des visites viennent de la région, le week-end, depuis un téléphone. Il renforce sa page sur les balades à la journée et met en avant son numéro. Il parle enfin aux bonnes personnes.

## Ce qu'il faut savoir

- **Certains outils déposent des cookies** et demandent l'accord du visiteur. Les chiffres ne comptent alors que ceux qui ont accepté.
- **Un chiffre seul ne dit pas tout.** Mieux vaut comparer d'un mois sur l'autre que juger une journée.
- **Le taux de rebond**, la part de visiteurs qui repartent sans rien faire d'autre, se lit avec prudence : une personne qui trouve votre numéro et appelle peut quitter la page tout de suite, et c'est une réussite.

!> Une statistique ne vaut que si elle fait changer quelque chose. Si vous ne regardez jamais un chiffre, il n'est pas utile de le suivre.

## Chez les Minis Monstres

L'observatrice de ma petite bande suit les visites de votre site, et je regarde avec elle ce qui peut être amélioré. Pour la partie qui se passe dans Google avant le clic, voyez la [Google Search Console](/lexique/google-search-console/).`,
    faq: [
      { q: 'Les statistiques de visite sont-elles compatibles avec le RGPD ?', a: 'Cela dépend de l’outil et de ses réglages. Certains peuvent fonctionner sans consentement s’ils restent limités à la mesure d’audience, d’autres demandent l’accord du visiteur. La CNIL publie des repères à ce sujet.' },
      { q: 'Quelle différence avec la Search Console ?', a: 'La Search Console parle de votre présence dans Google : recherches, affichages, clics. Les statistiques de visite montrent ce que font les gens une fois arrivés, qu’ils viennent de Google ou d’ailleurs.' },
    ],
    voir: ['google-search-console', 'rgpd-cookies', 'landing-page'],
  },
  {
    slug: 'lien-interne',
    icon: 'route',
    nom: 'Lien interne',
    resume: 'Un lien qui relie deux pages de votre propre site, pour guider le visiteur et Google.',
    h1: "Lien interne : c'est quoi, et pourquoi c'est utile ?",
    title: 'Lien interne : définition et rôle pour le SEO | Les Minis Monstres',
    description: 'Un lien interne relie deux pages d’un même site. Il guide le visiteur vers la suite et aide Google à comprendre quelles pages comptent. Comment bien les placer.',
    lead: `Un lien interne est un lien qui mène d'une page de votre site à une autre page de ce même site. Le menu en est un, mais les plus utiles sont souvent glissés au milieu d'un texte, au moment où le lecteur a besoin d'en savoir plus.`,
    body: `## La définition en une phrase

Sur une page qui parle de vos massages, la phrase « découvrez aussi nos soins du visage » est un **lien interne** si elle mène vers une autre page de votre site. Il reste chez vous, contrairement au lien sortant, qui envoie vers un autre site, ou au [backlink](/lexique/backlink/), qui arrive d'ailleurs.

## À quoi ça sert pour une petite entreprise

Les liens internes ont deux publics :

- **Le visiteur**, qu'ils guident vers la page suivante logique : un service lié, les tarifs, le formulaire de contact. Il reste plus longtemps et trouve ce qu'il cherche.
- **Google**, qui découvre les pages en suivant les liens. Une page vers laquelle beaucoup de liens pointent lui paraît plus importante. Une page qui n'est reliée à rien risque d'être ignorée.

## Un exemple de la vie réelle

Un plombier a une page « chauffe-eau » bien faite, mais elle n'est accessible que par un sous-menu peu visible. Personne ne la lit et Google la montre rarement. En ajoutant un lien vers elle depuis la page d'accueil et depuis la page « dépannage », avec les mots « remplacement de chauffe-eau », il lui donne enfin sa place.

## Les bonnes pratiques

- **Un texte de lien parlant.** « Voir nos tarifs de ramonage » dit où l'on va. « Cliquez ici » ne dit rien, ni au visiteur ni à Google.
- **Des liens utiles, pas décoratifs.** Chaque lien doit répondre à une question que le lecteur peut se poser à cet endroit.
- **Relier les pages proches.** Les pages d'un même sujet se renvoient l'une vers l'autre.
- **Ne laisser aucune page orpheline**, c'est-à-dire sans aucun lien qui y mène.
- **Réparer les liens cassés** après avoir supprimé ou renommé une page.

!> Mettre des liens partout n'aide pas. Quelques liens bien choisis valent mieux qu'une page couverte de mots soulignés.

## Ce qu'il faut savoir

Le [plan du site](/lexique/sitemap/) aide Google à trouver les pages, mais il ne remplace pas les liens internes. Le premier est une liste, les seconds montrent les relations entre les pages et leur importance.

## Chez les Minis Monstres

Sur un site vitrine, chaque page parle d'un sujet précis, et je les relie entre elles de façon logique. Chaque nouvelle page, comme celle que l'abonnement ajoute chaque semaine, rejoint ce réseau de liens. La méthode est expliquée sur [référencement SEO](/referencement-seo/).`,
    faq: [
      { q: 'Combien de liens internes mettre sur une page ?', a: 'Il n’y a pas de chiffre magique. Mettez ceux qui aident vraiment le lecteur à continuer. Sur une page de service, quelques liens bien placés suffisent en général.' },
      { q: 'Le menu compte-t-il comme lien interne ?', a: 'Oui. Les liens du menu et du pied de page sont des liens internes. Ceux placés dans le texte ont souvent plus de poids, parce qu’ils sont entourés de mots qui expliquent leur sujet.' },
    ],
    voir: ['backlink', 'sitemap', 'referencement-naturel-seo'],
  },
];

module.exports = { termes, PUBLIE };
