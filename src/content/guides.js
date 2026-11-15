// Guides : des pages utiles qui répondent aux vraies questions de ceux qui veulent un site.
// Règles (scripts/check.js) : title de 70 caractères au plus, description de 110 à 165,
// aucun tiret long, aucun chiffre sur les concurrents, aucun faux avis,
// et pas de phrase de 9 mots ou plus reprise d'une autre page.
const { types, forfaits, options, paiement } = require('../config');
const T = (id) => types.find((t) => t.id === id);
const F = (id) => forfaits.find((f) => f.id === id);
const O = (id) => options.find((o) => o.id === id);
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const acompte = (p) => eur(Math.round(p * paiement.acompte) / 100);
const reste = (p) => eur(p - Math.round(p * paiement.acompte) / 100);

const page = T('une-page'), vitrine = T('vitrine'), boutique = T('boutique');
const chico = F('chico'), power = F('power'), titan = F('titan');

const PUBLIE = '2026-11-14';

const guides = [
  // ------------------------------------------------------------------ par métier
  {
    slug: 'site-internet-artisan',
    groupe: 'metier',
    icon: 'hammer',
    nom: 'Site internet pour artisan',
    resume: 'Plombier, électricien, maçon, peintre : ce qu’il faut sur votre site pour recevoir des demandes.',
    h1: 'Site internet pour artisan : être trouvé et recevoir des demandes',
    title: 'Site internet pour artisan : quoi mettre, quel prix | Alex & Lia',
    description: `Plombier, électricien, maçon, peintre : ce que votre site doit montrer pour recevoir des demandes de devis, et combien ça coûte. Dès ${page.price} €, à prix fixe.`,
    lead: 'Vos clients ne feuillettent plus l’annuaire. Ils tapent « plombier » et le nom de leur ville sur leur téléphone, puis ils appellent l’un des premiers. Voici comment en faire partie.',
    body: `## Pourquoi un artisan a besoin d'un site

Le bouche-à-oreille marche toujours, mais il a changé de forme. Quand un voisin donne votre nom, la personne vous cherche sur Google avant de décrocher. Si elle ne trouve rien, ou une vieille page sans photo, elle hésite.

Un site d'artisan sert à trois choses : **rassurer** celui qui a déjà votre nom, **être trouvé** par celui qui ne vous connaît pas, et **trier les demandes** pour ne garder que les chantiers qui vous intéressent.

## Ce qu'il faut absolument sur votre site

- **Votre métier et votre secteur**, écrits en toutes lettres : « électricien à Sedan et 30 km autour ». Google lit ces mots, vos clients aussi.
- **Vos prestations**, une par une : dépannage, rénovation, neuf, entretien.
- **Des photos de vos chantiers**, avant et après. Trois vraies photos valent mieux qu'une belle image achetée.
- **Un moyen simple de vous joindre** : un bouton d'appel visible sur téléphone et un formulaire de devis.
- **Vos garanties** : assurance décennale, qualifications, années de métier.

!> N'inventez jamais d'avis clients. Un faux avis se repère vite et fait perdre la confiance d'un coup. Demandez plutôt à vos derniers clients d'en laisser un vrai sur votre fiche Google.

## Une page ou plusieurs ?

Si vous faites un seul métier dans une seule zone, le **site une page à ${page.price} €** suffit pour démarrer : tout tient sur un écran qu'on fait défiler.

Si vous avez plusieurs activités (par exemple plomberie, chauffage et salle de bain), prenez le **site vitrine à ${vitrine.price} €**. Chaque activité a sa propre page, et chacune peut sortir sur Google pour sa recherche. C'est ce qui amène le plus de demandes dans le temps. Le guide [site une page ou site vitrine](/guides/site-une-page-ou-site-vitrine/) détaille ce choix.

## Et pendant que vous êtes sur le chantier ?

Vous n'avez pas le temps de vous occuper d'un site, et c'est normal. Avec un [forfait](/forfaits/), l'hébergement, le nom de domaine et les mises à jour sont gérés pour vous. Une photo à ajouter, un tarif à changer ? Vous l'écrivez depuis votre téléphone dans votre espace client, et c'est fait par Lia tout de suite ou par moi sous 72 heures.

## Le duo qui marche : site et fiche Google

Pour un artisan, le site ne travaille pas seul. La [fiche Google de votre entreprise](/guides/fiche-google-entreprise/) vous fait apparaître sur la carte quand quelqu'un cherche près de chez lui. Elle est gratuite, et elle renvoie vers votre site.`,
    faq: [
      { q: 'Combien coûte un site internet pour un artisan ?', a: `Chez moi, ${page.price} € pour un site une page et ${vitrine.price} € pour un site vitrine, à prix fixe. Vous payez ${paiement.acompte} % à la commande et le reste quand le site est en ligne. Ensuite, un forfait à partir de ${chico.month} € par mois couvre l'hébergement, le nom de domaine et les mises à jour.` },
      { q: 'Je n’ai pas de photos de mes chantiers, comment faire ?', a: 'Commencez avec ce que vous avez, même deux ou trois photos prises au téléphone. Prenez ensuite l’habitude de photographier chaque chantier avant et après : vous me les envoyez, et le site s’enrichit au fil des mois.' },
      { q: 'Est-ce qu’un site remplace les plateformes de mise en relation ?', a: 'Pas forcément tout de suite, mais il vous rend moins dépendant. Sur votre site, la demande arrive directement chez vous, sans commission et sans être mis en concurrence sur la même page.' },
    ],
    voir: ['fiche-google-entreprise', 'site-une-page-ou-site-vitrine', 'prix-site-internet'],
  },
  {
    slug: 'site-internet-restaurant',
    groupe: 'metier',
    icon: 'store',
    nom: 'Site internet pour restaurant',
    resume: 'La carte, les horaires, l’adresse : les trois choses que vos clients cherchent, et comment les montrer.',
    h1: 'Site internet pour restaurant : la carte, les horaires, la réservation',
    title: 'Site internet pour restaurant : carte et horaires | Alex & Lia',
    description: 'Ce que les clients cherchent sur le site d’un restaurant : la carte, les horaires, l’adresse et un moyen de réserver. Comment le faire simplement, à prix fixe.',
    lead: 'Avant de pousser votre porte, un client veut savoir trois choses : ce qu’on mange, à quel prix, et si vous êtes ouvert ce soir. Votre site doit répondre en dix secondes.',
    body: `## Ce que vos clients cherchent vraiment

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

Avec un [forfait](/forfaits/), vous envoyez le changement depuis votre espace client. Lia modifie la page en quelques instants et vous montre l'aperçu avant que ce soit visible par vos clients. Pour un restaurant dont la carte bouge chaque mois, le forfait ${power.name}, avec ses ${power.jetons} modifications par Lia chaque mois, est le plus adapté.

## Quel site choisir ?

Un **site une page à ${page.price} €** convient très bien à la plupart des restaurants : une belle photo de la salle, la carte, les horaires, le plan, le contact. Tout se fait défiler d'un doigt.

Le **site vitrine à ${vitrine.price} €** devient utile si vous avez plusieurs activités à présenter : traiteur, privatisation de salle, vente à emporter, chambres. Chacune mérite alors sa propre page.

## Ne négligez pas les photos

Deux ou trois photos lumineuses de vos plats et de votre salle font plus que n'importe quel texte. Prenez-les à la lumière du jour, près d'une fenêtre, sans flash. Pas besoin d'un photographe pour commencer.

## Votre fiche Google compte autant que le site

Les horaires que Google affiche viennent de votre fiche d'établissement. Si elle est fausse, le client se déplace pour rien. Le guide sur la [fiche Google](/guides/fiche-google-entreprise/) explique comment la tenir à jour.`,
    faq: [
      { q: 'Puis-je changer ma carte moi-même ?', a: 'Vous n’avez pas à toucher au site. Vous écrivez la nouvelle carte ou vous envoyez une photo de votre ardoise dans votre espace client, et la page est mise à jour pour vous. Chaque changement compte pour une modification de votre forfait.' },
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
    title: 'Site internet pour coiffeur ou institut de beauté | Alex & Lia',
    description: 'Tarifs clairs, photos de vos réalisations, horaires et prise de rendez-vous : ce qu’il faut sur le site d’un salon de coiffure ou d’un institut de beauté.',
    lead: 'Une nouvelle cliente compare deux ou trois salons avant de choisir. Elle regarde les tarifs, les photos et la facilité à prendre rendez-vous. Le salon qui montre tout ça clairement a une longueur d’avance.',
    body: `## Les tarifs d'abord

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

## Ce qui fait venir de nouvelles clientes

Une cliente qui vient d'emménager tape « coiffeur » suivi du nom de son quartier ou de sa ville. Pour apparaître, deux choses comptent : votre [fiche Google](/guides/fiche-google-entreprise/) avec de vrais avis, et un site qui dit clairement où vous êtes et ce que vous faites.

Avec le forfait ${power.name}, je travaille chaque mois votre [référencement](/referencement-seo/) pour faire remonter le salon sur ces recherches.

## Quel site pour un salon ?

Le **site une page à ${page.price} €** est le bon choix pour la grande majorité des salons. Il contient la présentation, les tarifs, les photos, les horaires et le contact, livré en ${page.delai}.

Si vous avez plusieurs univers (coiffure, esthétique, onglerie, vente de produits), le **site vitrine à ${vitrine.price} €** donne une page à chacun.

## Les horaires et les congés

Un salon change souvent ses horaires : nocturne, fermeture exceptionnelle, vacances. Vous l'indiquez dans votre espace client, et le site est à jour sans que vous ayez à apprendre quoi que ce soit.`,
    faq: [
      { q: 'Faut-il afficher tous mes tarifs sur le site ?', a: 'Je vous le conseille. Les prestations dont le prix dépend de la longueur ou du travail peuvent être indiquées avec un « à partir de ». Ce qui compte, c’est que la cliente ait un ordre d’idée avant de venir.' },
      { q: 'Je travaille seule à domicile, un site est-il utile ?', a: 'Oui, peut-être encore plus : sans vitrine dans la rue, votre site et votre fiche Google sont le seul endroit où l’on peut vous découvrir. Un site une page suffit largement.' },
      { q: 'Puis-je relier mon agenda de rendez-vous en ligne ?', a: 'Oui. Si vous utilisez déjà un service de prise de rendez-vous, le bouton du site y mène directement. Sinon, un bouton d’appel et un formulaire font très bien l’affaire.' },
    ],
    voir: ['fiche-google-entreprise', 'site-une-page-ou-site-vitrine', 'choisir-nom-de-domaine'],
  },
  {
    slug: 'site-internet-association',
    groupe: 'metier',
    icon: 'users',
    nom: 'Site internet pour association',
    resume: 'Faire connaître vos activités, trouver des adhérents et des bénévoles, avec un petit budget.',
    h1: 'Site internet pour association : simple, utile et pas cher',
    title: 'Site internet pour association : simple et pas cher | Alex & Lia',
    description: `Présenter vos activités, annoncer vos événements, trouver des adhérents et des bénévoles : un site d’association clair, dès ${page.price} €, sans rien gérer vous-même.`,
    lead: 'Une association vit de ceux qui la rejoignent. Encore faut-il qu’ils sachent qu’elle existe, ce qu’elle fait, et comment venir. C’est tout le rôle de votre site.',
    body: `## À quoi sert le site d'une association

Club de sport, comité des fêtes, association de parents, de quartier ou d'entraide : les besoins se ressemblent. Votre site doit permettre à quelqu'un qui ne vous connaît pas de comprendre en une minute :

- **Ce que vous faites**, et pour qui.
- **Quand et où** ont lieu vos activités.
- **Comment adhérer** ou donner un coup de main.
- **Qui contacter**, sans afficher le numéro personnel d'un bénévole.

## Le problème du bénévole qui s'en va

Beaucoup de sites d'associations ont été créés par un membre dévoué. Le jour où il part, plus personne ne sait comment modifier la page, et le site reste figé sur la kermesse d'il y a trois ans.

Avec un [forfait](/forfaits/), le site ne repose sur personne en particulier. N'importe quel membre du bureau écrit la demande dans l'espace client (« ajouter la date de l'assemblée générale »), et la modification est faite. Le jour où le bureau change, il suffit de transmettre l'accès.

## Un budget d'association

Je sais que chaque dépense se vote. Les chiffres sont donc simples à présenter en réunion :

- **${page.price} € une fois** pour un site une page, dont ${acompte(page.price)} € à la commande et ${reste(page.price)} € à la mise en ligne.
- **${chico.month} € par mois** pour le forfait ${chico.name} : hébergement, nom de domaine, mises à jour, deux modifications par Lia et une par Alex chaque mois.

Le reste du prix de création peut aussi être étalé sur 6 ou 12 mois, sans frais.

## Les événements et les actualités

Deux modifications par Lia suffisent pour annoncer les prochains rendez-vous. Si votre calendrier est chargé, le forfait ${power.name} en donne ${power.jetons}, et l’option Lia + en ajoute dix de plus pour 5 € par mois.

## Adhésions et dons

Si vous utilisez déjà un service pour encaisser les adhésions ou les dons, le site y renvoie par un bouton bien visible. Sinon, un bulletin d'adhésion à télécharger et un formulaire de contact font le travail.

## Une adresse à votre nom

Un nom de domaine comme le nom de votre association suivi de « .fr » fait sérieux sur une affiche ou un dossier de subvention. Le guide pour [choisir un nom de domaine](/guides/choisir-nom-de-domaine/) vous aide à le trouver.`,
    faq: [
      { q: 'Notre association a très peu de moyens, est-ce raisonnable ?', a: `Le site une page coûte ${page.price} € une seule fois, puis ${chico.month} € par mois. Sur une année, cela représente souvent moins que l’impression des affiches d’un événement.` },
      { q: 'Qui peut demander les modifications ?', a: 'Toute personne à qui le bureau confie l’accès à l’espace client. Vous pouvez changer le mot de passe et l’adresse e-mail du compte quand l’équipe change.' },
      { q: 'Peut-on mettre des photos de nos événements ?', a: 'Oui, c’est même ce qui donne envie de vous rejoindre. Pensez seulement à avoir l’accord des personnes reconnaissables, et celui des parents pour les enfants.' },
    ],
    voir: ['choisir-nom-de-domaine', 'prix-site-internet', 'site-une-page-ou-site-vitrine'],
  },
  {
    slug: 'site-internet-auto-entrepreneur',
    groupe: 'metier',
    icon: 'rocket',
    nom: 'Site internet pour auto-entrepreneur',
    resume: 'Vous lancez votre activité : un site sérieux sans y laisser votre trésorerie de départ.',
    h1: 'Site internet pour auto-entrepreneur : bien démarrer sans se ruiner',
    title: 'Site internet pour auto-entrepreneur : bien démarrer | Alex & Lia',
    description: `Vous lancez votre micro-entreprise ? Un site clair pour inspirer confiance et trouver vos premiers clients, dès ${page.price} € avec ${paiement.acompte} % seulement à la commande.`,
    lead: 'Quand on démarre seul, on n’a ni réputation ni budget. Un site propre règle le premier problème sans creuser le second.',
    body: `## Pourquoi un site dès le début

Vos premiers clients ne vous connaissent pas. Avant de vous confier quelque chose, ils vérifient que vous existez vraiment. Un site à votre nom, avec une adresse e-mail professionnelle, change la façon dont on vous regarde : vous n'êtes plus « quelqu'un qui fait ça à côté », vous êtes une entreprise.

## Par quoi commencer

Inutile de voir grand. Pour un lancement, il faut un site qui réponde à quatre questions :

1. **Que proposez-vous ?** En une phrase, sans jargon.
2. **Pour qui ?** Particuliers, entreprises, dans quelle zone.
3. **À quel prix ?** Ou au moins une fourchette, ou « devis gratuit ».
4. **Comment vous joindre ?** Formulaire, e-mail, téléphone professionnel.

Le **site une page à ${page.price} €** contient tout cela. Vous pourrez passer à un site vitrine plus tard, quand l'activité aura pris forme.

## Ménager sa trésorerie

Au démarrage, chaque euro compte. C'est pour cela que le paiement est découpé :

- **${acompte(page.price)} € à la commande**, soit ${paiement.acompte} % du prix.
- **Le reste à la mise en ligne**, en une fois ou étalé sur 6 ou 12 mois sans frais.
- **${chico.month} € par mois** pour le forfait ${chico.name}, qui démarre seulement quand le site est en ligne.

Vous connaissez donc le coût exact avant de vous engager, sans devis à rallonge.

## Les mentions obligatoires

Un site professionnel doit afficher des mentions légales : votre nom, votre numéro SIRET, un moyen de contact et le nom de l'hébergeur. Ce n'est pas compliqué, mais c'est obligatoire. Je vous indique quoi fournir, et la page est prête à la mise en ligne.

## L'adresse e-mail professionnelle

Écrire à un client depuis une adresse à votre nom de domaine inspire plus confiance qu'une adresse gratuite. C'est une option à ${O('mail').price.month} € par mois, à ajouter ou retirer quand vous voulez.

## Faire le site soi-même ?

C'est possible, et pour certains c'est le bon choix. Le guide [faire son site soi-même ou le faire faire](/guides/creer-son-site-soi-meme-ou-le-faire-faire/) pèse honnêtement les deux options, pour que vous décidiez selon votre temps et vos envies.

## Et après le lancement

Votre activité va évoluer : nouvelles prestations, nouveaux tarifs, premières réalisations à montrer. Le forfait et les options se changent à tout moment depuis votre espace client, sans engagement.`,
    faq: [
      { q: 'Le site est-il une dépense déductible ?', a: 'En micro-entreprise, vous ne déduisez pas vos frais un par un : l’administration applique un abattement forfaitaire sur votre chiffre d’affaires. Pour votre situation précise, le mieux est de poser la question à votre service des impôts ou à un comptable.' },
      { q: 'Puis-je commencer petit et agrandir le site plus tard ?', a: 'Oui. Beaucoup démarrent avec une page, puis passent à un site vitrine quand ils ont plusieurs prestations à présenter. On en parle au moment où le besoin se présente.' },
      { q: 'Dois-je déjà avoir mon numéro SIRET pour commander ?', a: 'Non, vous pouvez commander pendant vos démarches. Le SIRET sera ajouté dans les mentions légales dès que vous l’aurez reçu.' },
    ],
    voir: ['creer-son-site-soi-meme-ou-le-faire-faire', 'choisir-nom-de-domaine', 'prix-site-internet'],
  },
  {
    slug: 'site-internet-therapeute',
    groupe: 'metier',
    icon: 'hand-heart',
    nom: 'Site internet pour thérapeute ou praticien',
    resume: 'Sophrologue, naturopathe, coach, masseur : un site qui explique votre pratique et met en confiance.',
    h1: 'Site internet pour thérapeute et praticien du bien-être',
    title: 'Site internet pour thérapeute et praticien bien-être | Alex & Lia',
    description: 'Sophrologue, naturopathe, réflexologue, coach : comment présenter votre pratique, vos séances et vos tarifs sur un site qui met en confiance, sans jargon.',
    lead: 'On ne choisit pas un praticien comme on choisit un produit. On cherche quelqu’un à qui l’on osera parler. Votre site est souvent la première impression que vous donnez.',
    body: `## Mettre en confiance avant tout

La personne qui vous cherche traverse souvent une période difficile : stress, sommeil, douleurs, changement de vie. Elle hésite, elle compare, et elle a besoin de sentir à qui elle a affaire.

Trois éléments font la différence :

- **Votre photo**, simple et souriante. On prend plus facilement rendez-vous avec un visage qu'avec un logo.
- **Votre parcours**, en quelques lignes : formations, certifications, ce qui vous a amené à ce métier.
- **Votre façon de travailler**, racontée avec des mots de tous les jours.

## Expliquer une séance

Beaucoup de gens n'ont jamais consulté un sophrologue ou un réflexologue. Ils ne savent pas ce qui les attend, et cette inconnue les retient.

Décrivez simplement une première séance : combien de temps elle dure, comment elle se déroule, s'il faut apporter quelque chose, ce que l'on ressent en sortant. Ce texte lève plus de freins que n'importe quel argument.

## Rester honnête sur ce que vous proposez

!> Ne promettez jamais une guérison, et ne laissez pas penser que votre accompagnement remplace un suivi médical. C'est une question d'honnêteté, et c'est aussi ce que la loi attend de vous.

Parlez d'accompagnement, de mieux-être, de détente. Vos futurs clients apprécient cette clarté.

## Tarifs, lieu et rendez-vous

Indiquez le prix et la durée de chaque type de séance, l'adresse du cabinet ou votre zone de déplacement, et si vous proposez des séances à distance. Pour le rendez-vous, un formulaire ou un lien vers votre agenda en ligne suffit.

## Le bon format pour votre activité

Si vous proposez une seule pratique, le **site une page à ${page.price} €** est parfait.

Si vous en proposez plusieurs (par exemple sophrologie, hypnose et ateliers de groupe), le **site vitrine à ${vitrine.price} €** est préférable : une personne qui cherche « hypnose arrêt du tabac » dans votre ville doit tomber sur une page qui parle précisément de cela. C'est tout le principe des [pages utiles pour le référencement](/referencement-seo/).

## Écrire quand on n'aime pas écrire

Vous savez accompagner, pas forcément rédiger. Racontez-moi votre pratique avec vos mots, par écrit ou en quelques notes. Lia prépare les textes, je les relis, et vous validez chaque phrase avant la mise en ligne.`,
    faq: [
      { q: 'Dois-je afficher mes tarifs ?', a: 'Oui, je vous le recommande. Une personne qui hésite déjà à consulter ne vous écrira pas pour demander un prix. Afficher le tarif d’une séance évite ce blocage.' },
      { q: 'Je débute et je n’ai pas encore de témoignages, est-ce gênant ?', a: 'Pas du tout. Mieux vaut un site sans témoignage qu’un site avec des avis inventés. Votre parcours et la description d’une séance suffisent pour commencer.' },
      { q: 'Puis-je proposer des séances à distance depuis mon site ?', a: 'Oui. Le site explique comment se passe une séance en visio et permet de prendre contact. La séance elle-même a lieu avec l’outil de visio que vous utilisez déjà.' },
    ],
    voir: ['site-une-page-ou-site-vitrine', 'fiche-google-entreprise', 'choisir-nom-de-domaine'],
  },

  // ------------------------------------------------------------------ les grandes questions
  {
    slug: 'prix-site-internet',
    groupe: 'question',
    icon: 'badge-euro',
    nom: 'Combien coûte un site internet ?',
    resume: 'Création, nom de domaine, hébergement, entretien : tout ce qui compose le vrai prix d’un site.',
    h1: 'Combien coûte un site internet ? Le vrai prix, sans surprise',
    title: 'Combien coûte un site internet ? Le vrai prix | Alex & Lia',
    description: 'Création, nom de domaine, hébergement, mises à jour, modifications : tout ce qui compose le prix d’un site internet, avec des exemples chiffrés sur un an.',
    lead: 'Le prix d’un site ne s’arrête pas à sa création. Il y a ce que l’on paie une fois, et ce que l’on paie tant que le site existe. Voici comment tout additionner avant de signer.',
    body: `## Les deux parties du prix

Un site internet, c'est un peu comme une voiture : il y a le prix d'achat, puis l'assurance, le carburant et l'entretien. Beaucoup de mauvaises surprises viennent du fait qu'on ne regarde que le premier chiffre.

**Ce que l'on paie une fois :** la création du site, c'est-à-dire sa conception, ses textes, sa mise en page et sa mise en ligne.

**Ce que l'on paie chaque année ou chaque mois :**

- **Le nom de domaine** : l'adresse du site, qui se loue à l'année.
- **L'hébergement** : l'ordinateur allumé jour et nuit qui garde votre site et l'envoie aux visiteurs.
- **Les mises à jour** : un site qui n'est pas entretenu finit par tomber en panne ou par se faire pirater.
- **Les modifications** : un horaire, un tarif, une photo. Elles sont souvent facturées à l'heure.

## Les questions à poser avant de signer

Quel que soit le prestataire, demandez toujours :

1. Le nom de domaine et l'hébergement sont-ils compris ? Pour combien de temps ?
2. Qui fait les mises à jour, et à quel prix ?
3. Combien coûte une petite modification ?
4. Y a-t-il un engagement de durée ?
5. Que se passe-t-il si j'arrête ?

Un devis qui ne répond pas à ces cinq questions n'est pas complet.

## Mes prix, entièrement

Chez moi, la création est à prix fixe, affichée avant la commande :

- **Site une page : ${page.price} €**
- **Site vitrine : ${vitrine.price} €**
- **Boutique en ligne : ${boutique.price} €**

Vous payez ${paiement.acompte} % à la commande, le reste à la mise en ligne. Ce reste peut être étalé sur 6 ou 12 mois sans frais.

Ensuite, un forfait mensuel regroupe tout ce qui est récurrent : nom de domaine, hébergement, mises à jour et modifications.

- **${chico.name} : ${chico.month} € par mois**, avec ${chico.jetons} modifications par Lia et ${chico.quota} par Alex.
- **${power.name} : ${power.month} € par mois**, avec ${power.jetons} modifications par Lia, ${power.quota} par Alex et le suivi du référencement.
- **${titan.name} : ${titan.month} € par mois**, avec ${titan.jetons} modifications par Lia, ${titan.quota} par Alex et vos chiffres chaque mois.

## Trois exemples sur la première année

- **Un artisan avec un site une page et ${chico.name}** : ${page.price} € + 12 × ${chico.month} € = **${page.price + 12 * chico.month} €**.
- **Un commerce avec un site vitrine et ${power.name}** : ${vitrine.price} € + 12 × ${power.month} € = **${vitrine.price + 12 * power.month} €**.
- **Un créateur avec une boutique et ${power.name}** : ${boutique.price} € + 12 × ${power.month} € = **${boutique.price + 12 * power.month} €**.

Les années suivantes, il ne reste que le forfait. En payant le forfait à l'année, deux mois sont offerts.

## Pourquoi ces prix sont bas

Ce n'est pas un site au rabais. La différence vient de la méthode : Lia, mon assistante IA, prépare les textes, la mise en page et les réglages en quelques heures au lieu de plusieurs jours. Je relis, je corrige et je vérifie tout avant la mise en ligne. La page [ma méthode](/methode/) explique ce que fait l'une et ce que fait l'autre.

## Ce qui peut faire monter la note

Soyons clairs sur ce qui n'est pas dans le prix de base : une adresse e-mail professionnelle (${O('mail').price.month} € par mois), une traduction du site (${O('en').price.once} € une fois), et les sites plus grands que les formules, qui se font sur devis. Vous composez le tout sur la page [créer mon site](/creer-mon-site/), et le total s'affiche au fur et à mesure.`,
    faq: [
      { q: 'Un site gratuit, ça existe ?', a: 'Des outils permettent de publier une page sans payer, mais avec une adresse qui porte le nom de l’outil et souvent de la publicité. Pour une activité professionnelle, une adresse à votre nom reste préférable, et elle n’est jamais gratuite.' },
      { q: 'Pourquoi les prix varient-ils autant d’un prestataire à l’autre ?', a: 'Parce que le temps passé n’est pas le même. Un site dessiné sur mesure par une équipe demande des semaines de travail. Un site bâti sur une base éprouvée, avec l’aide de l’IA, en demande beaucoup moins. Les deux approches sont valables, pour des besoins différents.' },
      { q: 'Dois-je tout payer d’un coup ?', a: `Non. Vous réglez ${paiement.acompte} % à la commande. Le reste est dû quand le site est en ligne, en une fois ou en 6 ou 12 mensualités sans frais.` },
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
    title: 'Site une page ou site vitrine : lequel choisir ? | Alex & Lia',
    description: 'La différence entre un site une page et un site vitrine, expliquée simplement, avec un test en trois questions pour choisir celui qui convient à votre activité.',
    lead: 'C’est la première question que l’on me pose. La réponse dépend moins de votre budget que de ce que vous avez à dire, et de la façon dont vos clients vous cherchent.',
    body: `## La différence en une image

Un **site une page**, c'est une grande affiche. Tout est au même endroit : on fait défiler vers le bas et l'on découvre qui vous êtes, ce que vous faites, vos tarifs, puis comment vous joindre.

Un **site vitrine**, c'est un petit livret. Il y a une couverture (l'accueil), puis une page par chapitre : vos services, vos tarifs, votre histoire, le contact. On passe de l'une à l'autre par le menu.

## Quand le site une page suffit

Le site une page à ${page.price} € est le bon choix si :

- Vous proposez **une seule activité**, facile à présenter.
- Vos clients vous cherchent surtout **par votre nom**, après une recommandation.
- Vous voulez être en ligne **vite** : il est livré en ${page.delai}.

C'est le cas de beaucoup d'indépendants, de petits commerces de quartier et d'associations.

## Quand il faut un site vitrine

Le site vitrine à ${vitrine.price} € devient préférable si :

- Vous avez **plusieurs services** assez différents les uns des autres.
- Vous voulez que des inconnus vous trouvent **par ce que vous faites**, pas seulement par votre nom.
- Vous avez besoin de **place** pour expliquer, montrer des réalisations ou détailler vos tarifs.

## Pourquoi le site vitrine aide le référencement

Google ne classe pas des sites, il classe des pages. Chaque page est évaluée pour un sujet précis.

Prenons un paysagiste. Sur un site une page, tout est mélangé : tonte, élagage, création de jardin, clôtures. Google comprend que c'est un paysagiste, mais aucune partie n'est assez développée pour sortir sur « élagage » dans sa ville.

Sur un site vitrine, la page « Élagage » ne parle que de cela, avec ses mots, ses photos et ses tarifs. Elle a de bien meilleures chances d'apparaître pour cette recherche précise.

## Le test en trois questions

1. **Pouvez-vous décrire votre activité en une seule phrase ?** Si oui, une page suffit probablement.
2. **Proposez-vous au moins trois services qu'un client pourrait chercher séparément ?** Si oui, prenez la vitrine.
3. **Comptez-vous sur Google pour trouver de nouveaux clients ?** Si oui, la vitrine sera plus efficace.

## Et si je me trompe ?

Ce n'est pas grave. On peut commencer avec une page et évoluer ensuite. On peut aussi garder une seule page principale et lui ajouter, avec le forfait ${power.name}, des pages de référencement ciblées. Rien n'est figé.

## Et la boutique en ligne ?

Elle répond à un autre besoin : encaisser des commandes sur le site. Si vous voulez vendre des produits, lisez le guide pour [créer une boutique en ligne](/guides/creer-boutique-en-ligne/).`,
    faq: [
      { q: 'Combien de pages contient un site vitrine ?', a: 'Jusqu’à cinq pages dans la formule : en général l’accueil, les services, les tarifs, une présentation et le contact. Au-delà, le site se fait sur devis.' },
      { q: 'Un site une page peut-il sortir sur Google ?', a: 'Oui, surtout sur votre nom et sur votre métier dans votre ville. Il est simplement moins armé qu’un site vitrine pour les recherches portant sur un service précis.' },
      { q: 'Peut-on transformer un site une page en site vitrine plus tard ?', a: 'Oui. Les textes et les photos existants sont repris, et les nouvelles pages viennent s’y ajouter. Écrivez-moi quand le besoin se présente, je vous dis ce que cela représente.' },
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
    title: 'Créer son site soi-même ou le faire faire ? | Alex & Lia',
    description: 'Faire son site seul avec un outil en ligne ou le confier à quelqu’un : le temps, le coût réel, le résultat et l’entretien, comparés honnêtement pour bien choisir.',
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
- **Le référencement.** Un site publié n'est pas un site trouvé. Les réglages qui aident Google demandent de s'y connaître un peu.
- **L'abonnement.** Ces outils se paient chaque mois, et le tarif augmente souvent avec les fonctions dont on a besoin.

## Le faire faire

Vous confiez le travail à quelqu'un dont c'est le métier : agence, indépendant, ou un service comme le mien.

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

Confiez-le si votre temps est compté, si l'écran vous fatigue, ou si vous avez déjà un site commencé il y a des mois et jamais terminé. C'est le cas le plus fréquent que je rencontre.

## Une troisième voie

Mon service est né de ce constat. Vous ne construisez rien vous-même, mais vous gardez la main sur ce qui compte :

- Le prix est fixe et connu d'avance, à partir de ${page.price} €.
- Vous demandez vos changements en une phrase depuis votre espace client.
- Lia les réalise en 5 minutes et vous montre l'aperçu, ou je les fais à la main sous 72 heures. C'est vous qui choisissez à chaque fois.
- Le forfait est sans engagement.

Pour voir à quoi cela ressemble avant de vous décider, [essayez la démo de l'espace client](/mon-espace/demo/). Et pour une vue d'ensemble des solutions, le [comparatif](/comparatif/) les met côte à côte.`,
    faq: [
      { q: 'J’ai commencé un site moi-même sans le finir, pouvez-vous le reprendre ?', a: 'Je repars d’un site neuf, mais rien n’est perdu : vos textes, vos photos et vos idées servent de base. Envoyez-moi l’adresse de ce que vous avez commencé, c’est un excellent point de départ.' },
      { q: 'Si je fais faire mon site, est-ce que je peux encore le modifier ?', a: 'Oui, sans rien apprendre : vous décrivez le changement dans votre espace client. Selon votre forfait, Lia fait de deux à dix modifications par mois, et Alex une ou deux.' },
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
    title: 'Nom de domaine : comment bien choisir le sien | Alex & Lia',
    description: 'Un nom de domaine, c’est l’adresse de votre site. Les règles simples pour le choisir court, clair, facile à dicter, et vérifier tout de suite s’il est libre.',
    lead: 'Le nom de domaine est ce que l’on tape pour arriver chez vous, par exemple « maboulangerie.fr ». Il figurera sur vos cartes, votre camionnette et vos factures. Autant bien le choisir.',
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

Mon conseil : prenez le nom de votre entreprise. Si ce nom est très courant et déjà pris, ajouter votre ville est une bonne solution de secours.

## Quelle extension choisir : .fr ou .com ?

Pour une activité en France, le **.fr** est le choix naturel : il dit tout de suite que vous êtes ici, et il inspire confiance aux clients français. Le **.com** est une bonne alternative, surtout si vous visez d'autres pays.

Méfiez-vous des extensions originales : elles sont amusantes, mais vos clients taperont « .fr » par réflexe et n'arriveront pas chez vous.

## Vérifier que le nom n'est pas pris

Avant de vous attacher à un nom, vérifiez deux choses :

- **Qu'il est libre.** L'outil de la page [créer mon site](/creer-mon-site/) vous le dit en quelques secondes et vous propose des variantes.
- **Qu'il ne copie pas une marque.** Un nom trop proche d'une marque connue peut vous valoir des ennuis, même s'il est disponible.

## Et si j'ai déjà un nom de domaine ?

Vous le gardez. Il suffit de l'indiquer à la commande, et je le relie à votre nouveau site.

## Qui s'occupe du renouvellement ?

C'est le piège classique : on oublie l'échéance, le nom expire, et le site disparaît du jour au lendemain. Avec un [forfait](/forfaits/), le nom de domaine est relié à votre site et renouvelé chaque année pour vous. Vous n'avez aucune date à surveiller.`,
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
    title: 'Fiche Google : apparaître sur la carte gratuitement | Alex & Lia',
    description: 'La fiche d’établissement Google est gratuite. Comment la créer, la remplir et obtenir de vrais avis pour apparaître quand on vous cherche près de chez vous.',
    lead: 'Quand vous cherchez un commerce sur Google, un encadré apparaît avec une carte, des horaires, des photos et des étoiles. C’est une fiche d’établissement. La vôtre est gratuite, et c’est souvent elle que l’on voit en premier.',
    body: `## À quoi sert cette fiche

La fiche d'établissement Google (on l'appelait avant « Google My Business ») est votre carte de visite sur Google et sur Google Maps. Elle affiche votre nom, votre adresse, vos horaires, votre téléphone, vos photos, vos avis et un lien vers votre site.

Elle joue surtout pour les recherches de proximité : « boulangerie ouverte », « garagiste près de moi », « fleuriste » suivi d'une ville. Sur ces recherches, Google montre d'abord une carte avec trois établissements. Sans fiche, vous ne pouvez pas en faire partie.

## Comment la créer

1. Cherchez « fiche d'établissement Google » et connectez-vous avec un compte Google.
2. Tapez le nom de votre entreprise. Si une fiche existe déjà, demandez à en devenir le propriétaire au lieu d'en créer une deuxième.
3. Choisissez votre **catégorie** avec soin : c'est elle qui décide sur quelles recherches vous sortez.
4. Indiquez votre adresse, ou votre zone d'intervention si vous vous déplacez chez vos clients.
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

## Ce que je fais pour vous

Sur chaque site, les informations de votre activité sont décrites dans un format que Google sait lire. Avec le forfait ${power.name}, le [référencement local](/referencement-seo/) est suivi chaque mois, fiche comprise.`,
    faq: [
      { q: 'La fiche Google est-elle vraiment gratuite ?', a: 'Oui, sa création et sa gestion ne coûtent rien. Méfiez-vous des démarcheurs qui prétendent vous la vendre ou qui vous réclament un paiement pour la « maintenir en ligne ».' },
      { q: 'Je travaille de chez moi, dois-je afficher mon adresse ?', a: 'Non. Vous pouvez masquer votre adresse et indiquer seulement les communes où vous intervenez. Votre fiche apparaît alors sur les recherches de cette zone.' },
      { q: 'Que faire face à un avis injuste ?', a: 'Répondez poliment en donnant votre version des faits, sans vous énerver. Si l’avis ne concerne pas votre entreprise ou enfreint les règles, vous pouvez le signaler à Google depuis votre fiche.' },
    ],
    voir: ['site-internet-artisan', 'site-une-page-ou-site-vitrine', 'choisir-nom-de-domaine'],
  },
  {
    slug: 'creer-boutique-en-ligne',
    groupe: 'question',
    icon: 'shopping-bag',
    nom: 'Créer une boutique en ligne',
    resume: 'Produits, paiement, livraison, obligations : par où commencer pour vendre sur internet.',
    h1: 'Créer une boutique en ligne : par où commencer ?',
    title: 'Créer une boutique en ligne : par où commencer ? | Alex & Lia',
    description: `Produits, photos, paiement par carte, livraison, conditions de vente : les étapes pour ouvrir une boutique en ligne sans se perdre. Dès ${boutique.price} €, à prix fixe.`,
    lead: 'Vendre sur internet, ce n’est pas seulement mettre des produits en ligne. Il faut penser au paiement, à l’envoi et à quelques règles. Rien d’insurmontable, à condition de prendre les choses dans l’ordre.',
    body: `## Une boutique en ligne, c'est quoi exactement ?

C'est un site où vos clients choisissent des produits, les mettent dans un panier et paient par carte. Vous recevez la commande, vous préparez le colis et vous l'envoyez. Votre magasin reste ouvert la nuit, le dimanche et pendant vos vacances.

## Étape 1 : choisir par quoi commencer

L'erreur classique est de vouloir tout mettre en ligne d'un coup. Commencez par vos **meilleurs produits**, ceux que l'on vous demande le plus. La formule comprend jusqu'à 20 produits que j'ajoute pour vous. C'est largement assez pour démarrer et voir ce qui se vend.

## Étape 2 : des photos et des descriptions qui vendent

En ligne, le client ne peut ni toucher ni essayer. Vos photos et vos textes font le travail du vendeur.

- **Les photos** : fond neutre, lumière du jour, plusieurs angles, et une photo qui montre la taille réelle de l'objet.
- **La description** : matière, dimensions, entretien, et surtout à quoi sert le produit et pour qui.

Vous m'envoyez les photos et quelques notes. Lia rédige les fiches, je les relis, vous validez.

## Étape 3 : le paiement

Le paiement par carte sécurisé est compris dans la boutique. L'argent arrive sur votre compte bancaire, et le client reçoit une confirmation par e-mail. Vous n'avez jamais accès aux numéros de carte : tout passe par un service de paiement spécialisé.

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

- **Création de la boutique : ${boutique.price} €**, dont ${acompte(boutique.price)} € à la commande et ${reste(boutique.price)} € à la mise en ligne.
- **Un forfait mensuel** à partir de ${chico.month} € pour l'hébergement, le nom de domaine et les mises à jour.
- **Deux options réservées aux boutiques**, à ${O('stock').price.month} € par mois chacune : le suivi de vos stocks, et les comptes clients pour que vos acheteurs retrouvent leurs commandes.

Le service de paiement prélève de son côté une petite commission sur chaque vente. C'est le cas pour toutes les boutiques en ligne, quelle que soit la solution choisie.

## Étape 6 : faire venir des visiteurs

Une boutique sans visiteurs ne vend rien. Parlez-en à vos clients actuels, glissez l'adresse dans chaque colis et sur vos emballages, et pensez au [référencement](/referencement-seo/) : chaque fiche produit bien écrite est une porte d'entrée depuis Google.`,
    faq: [
      { q: 'Combien de produits puis-je vendre ?', a: 'La formule comprend la mise en ligne de 20 produits. Vous pouvez ensuite en ajouter d’autres avec les modifications de votre forfait. Pour un catalogue beaucoup plus grand dès le départ, la boutique se fait sur devis.' },
      { q: 'Faut-il un statut d’entreprise pour vendre en ligne ?', a: 'Oui. Vendre régulièrement, même de petites quantités, suppose une activité déclarée, par exemple en micro-entreprise. Renseignez-vous avant d’ouvrir : la démarche est rapide et se fait en ligne.' },
      { q: 'Puis-je garder mon magasin et ajouter une boutique en ligne ?', a: 'Oui, c’est même un très bon cas. L’option de suivi des stocks évite de vendre en ligne un article qui vient de partir en magasin.' },
    ],
    voir: ['prix-site-internet', 'choisir-nom-de-domaine', 'site-une-page-ou-site-vitrine'],
  },
];

const groupes = [
  { id: 'metier', titre: 'Selon votre activité', texte: 'Ce qu’il faut sur votre site, métier par métier.' },
  { id: 'question', titre: 'Les grandes questions', texte: 'Pour comprendre avant de vous lancer, sans jargon.' },
];

module.exports = { guides, groupes, PUBLIE };
