// Mini Tuto, thème « temps » : voir le format dans ./index.js.
// Consigne d'Alex (24 novembre 2026) : un tuto explique vite l'essentiel, sans tout dire ; la formation dit tout.
// Faits vérifiés le 24 novembre 2026 :
// - Gmail (aide Google, answer 6579) : « Afficher les options de recherche », « Créer un filtre » ; gestion dans
//   « Afficher tous les paramètres », onglet « Filtres et adresses bloquées ». Réglages sur ordinateur.
// - Gmail (aide Google, answer 14864208) : les réponses enregistrées s'activent dans « Paramètres avancés » (bouton « Activer »,
//   puis « Enregistrer les modifications ») et s'utilisent par « Plus d'options » dans un nouveau message, sur ordinateur seulement.
//   Le nom exact de la fonction chez Google n'est pas écrit ici (mot interdit sur le site) : on la décrit.
// - Outlook (support Microsoft, « Gérer les messages électroniques à l'aide de règles ») : Paramètres, Courrier, Règles,
//   « Ajouter une nouvelle règle » ; clic droit sur un message, « Règle » (ou « Règles »), « Créer une règle ». Sur Outlook.com,
//   une règle ne s'applique qu'aux nouveaux messages. Réponses enregistrées d'Outlook : complément sur l'onglet « Message »,
//   avec un abonnement Microsoft 365 éligible (support Microsoft, « Créer des modèles de courrier »).
// - Google Agenda (aide Google, answer 10729749) : « Créer », puis planning de rendez-vous, sur ordinateur ; un compte personnel suffit
//   pour une page de réservation ; certaines options demandent un abonnement.
// - Facturation électronique (impots.gouv.fr « Je découvre la facturation électronique », economie.gouv.fr) : réception obligatoire
//   pour toutes les entreprises assujetties à la TVA (franchise en base comprise) dès le 1er septembre 2026 ; émission au
//   1er septembre 2027 pour les PME et les micro-entreprises (2026 pour les grandes entreprises et les ETI) ; plateforme agréée
//   au choix (liste sur impots.gouv.fr) ; e-reporting au même calendrier ; un PDF simple ne suffit plus.
// - Mots de passe (cybermalveillance.gouv.fr, « Pourquoi et comment bien gérer ses mots de passe ? ») : un mot de passe par service,
//   gestionnaire conseillé (KeePassXC, libre, en français, certifié par l'ANSSI), double authentification.
// Prix : jamais écrits en dur, lus dans config.js (outilsOffre).
const cfg = require('../../config');
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const outil = (id) => cfg.outilsOffre.outils.find((o) => o.id === id);
const COMPARER = outil('comparer');
const ESSAI = cfg.outilsOffre.essaiJours;

const SRC_FE = 'https://www.impots.gouv.fr/professionnel/je-decouvre-la-facturation-electronique';
const SRC_FE_ECO = 'https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises';
const SRC_MDP = 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/mots-de-passe';

module.exports = [
  // ------------------------------------------------------------------ trier ses mails
  {
    slug: 'trier-ses-mails-automatiquement',
    groupe: 'temps',
    icon: 'inbox',
    monstre: 'chaton',
    formation: 'formation-automatiser-ses-taches',
    nom: 'Trier ses mails automatiquement',
    resume: 'Filtres Gmail et règles Outlook, pas à pas.',
    duree: 15,
    niveau: 'Débutant',
    h1: 'Trier ses mails automatiquement avec Gmail et Outlook',
    title: 'Trier ses mails tout seul : Gmail et Outlook | Les Minis Monstres',
    description: 'Un filtre Gmail ou une règle Outlook range vos messages sans vous : factures d’un côté, clients de l’autre. La méthode pas à pas, et le piège à éviter.',
    lead: 'Vous ouvrez votre boîte et tout est mélangé : un client qui attend, une facture, trois publicités. Donnez une consigne une seule fois, et le rangement se fera ensuite sans vous.',
    body: `## À quoi ça sert

Un **filtre** (dans Gmail) ou une **règle** (dans Outlook) est une consigne que votre messagerie applique à chaque message qui arrive : « si le message vient de telle adresse, ou contient tel mot, range-le à tel endroit ».

Dans Gmail, cet endroit s’appelle un **libellé** : une étiquette collée sur le message, qui fonctionne comme un dossier. Dans Outlook, c’est un dossier, tout simplement.

Faites ces réglages sur un ordinateur : c’est là que les menus sont complets.

## Dans Gmail, étape par étape

1. Ouvrez Gmail. Au bout de la barre de recherche, cliquez sur l’icône **Afficher les options de recherche**.
2. Remplissez un seul critère pour commencer : l’adresse de l’expéditeur dans « De », ou un mot dans « Contient les mots ».
3. Cliquez sur **Rechercher** pour voir les messages concernés. Si la liste vous convient, rouvrez les options et cliquez sur **Créer un filtre**, en bas.
4. Choisissez l’action : appliquer un libellé (créez-en un, par exemple « Factures »). Vous pouvez aussi faire sortir ces messages de la boîte de réception, pour qu’ils aillent directement dans leur libellé.
5. Cochez la case qui applique le filtre aux conversations déjà reçues, puis validez avec **Créer un filtre**.

Pour revoir ou supprimer un filtre : l’icône des paramètres, **Afficher tous les paramètres**, puis l’onglet **Filtres et adresses bloquées**.

## Dans Outlook

- **Outlook.com ou Outlook sur le web** : Paramètres, puis **Courrier**, puis **Règles**, et **Ajouter une nouvelle règle**. Donnez un nom à la règle, choisissez une condition et une action, puis **Enregistrer**.
- **Le raccourci** : faites un clic droit sur un message de l’expéditeur, puis **Règle** (ou **Règles** dans le nouvel Outlook) et **Créer une règle**. Choisissez le dossier, validez.

Sur Outlook.com, une règle ne touche que les messages qui arrivent après sa création. Les anciens, rangez-les une fois à la main.

## Un exemple

Prenons Nadia, une fleuriste imaginaire. Elle crée trois libellés : « Factures », « Fournisseurs », « À lire plus tard ».

- Les messages qui contiennent le mot « facture » reçoivent le libellé « Factures ».
- Ceux de ses deux grossistes vont dans « Fournisseurs ».
- Les lettres d’information, qu’elle repère avec les mots « désinscrire OR désabonner », filent dans « À lire plus tard » sans passer par la boîte de réception.

Le matin, il ne reste devant elle que les messages de ses clients.

## L’erreur à éviter

Le filtre trop large. Si vous rangez hors de la boîte tout ce qui contient « devis », vous cacherez aussi les demandes de devis de vos clients. Pour les messages qui peuvent venir d’un client, ajoutez un libellé, mais laissez-les dans la boîte de réception.

## À faire aujourd’hui

- Créez deux ou trois libellés ou dossiers, pas plus.
- Faites un premier filtre pour vos factures.
- Faites un deuxième filtre pour les lettres d’information.
- Dans une semaine, regardez ce qui a été rangé et corrigez si besoin.

## Pour aller plus loin

Ranger, c’est la première marche. Une messagerie sait aussi transférer un message à votre comptable, répondre seule à une question fréquente, ou vous alerter quand un client important écrit. La formation sur l’automatisation de vos tâches montre comment enchaîner ces consignes sans rien casser.`,
    faq: [
      { q: 'Un filtre peut-il supprimer un message important par erreur ?', a: 'Seulement si vous lui demandez de supprimer. Commencez par des filtres qui ajoutent un libellé : rien ne disparaît, tout se retrouve.' },
      { q: 'Peut-on créer un filtre depuis le téléphone ?', a: 'L’aide de Gmail décrit la création des filtres sur ordinateur. Une fois créé, le filtre agit aussi sur les messages que vous lisez sur votre téléphone.' },
    ],
    voir: ['reponses-toutes-faites-mails', 'premiere-automatisation-sans-coder'],
  },

  // ------------------------------------------------------------------ réponses toutes faites
  {
    slug: 'reponses-toutes-faites-mails',
    groupe: 'temps',
    icon: 'message-square-reply',
    monstre: 'chaton',
    formation: 'formation-automatiser-ses-taches',
    nom: 'Les réponses toutes faites',
    resume: 'Écrire une fois, répondre cent fois.',
    duree: 15,
    niveau: 'Débutant',
    h1: 'Les réponses toutes faites : écrire une fois, répondre en deux clics',
    title: 'Réponses toutes faites : gagner du temps | Les Minis Monstres',
    description: 'Horaires, tarifs, délais : ces réponses que vous tapez chaque semaine peuvent être enregistrées une fois. Comment faire dans Gmail, Outlook et sur votre téléphone.',
    lead: 'Combien de fois avez-vous écrit vos horaires, vos tarifs ou votre délai cette semaine ? Une réponse bien écrite peut servir des dizaines de fois, sans retaper un mot.',
    body: `## À quoi ça sert

Une bonne partie des messages reçus posent les mêmes questions : « Vous êtes ouverts samedi ? », « C’est combien ? », « Vous livrez où ? ». Une réponse toute faite est un texte que vous préparez une seule fois, soigné et sans faute, puis que vous insérez quand la question revient. Vous le complétez de deux ou trois mots personnels, et c’est envoyé.

## Étape 1 : faire la liste

Pendant une semaine, notez les questions qui reviennent. En général, cinq ou six suffisent à couvrir la plupart des messages. Pour chacune, écrivez la réponse idéale, avec la formule de politesse et un lien utile (votre site, votre page de tarifs, votre adresse).

## Étape 2 : les ranger dans votre messagerie

**Dans Gmail, sur ordinateur** (la fonction n’existe pas dans l’application du téléphone) :

1. Icône des paramètres, puis **Afficher tous les paramètres**, puis **Paramètres avancés**.
2. Sur la ligne des réponses enregistrées, cliquez sur **Activer**, puis sur **Enregistrer les modifications**, en bas de la page.
3. Ouvrez un **Nouveau message** et tapez votre réponse.
4. En bas de la fenêtre, cliquez sur **Plus d’options** (les trois points) : la rubrique des réponses enregistrées apparaît. Enregistrez votre texte sous un nom clair, comme « Horaires ».
5. Pour vous en servir : dans un message, **Plus d’options**, la même rubrique, puis le nom de la réponse.

**Dans Outlook** (nouvel Outlook ou Outlook sur le web), la même fonction se trouve sur l’onglet **Message** d’un nouveau courrier, sous forme d’un petit volet. Elle demande un abonnement Microsoft 365 éligible. Si vous ne la voyez pas, passez à l’étape suivante : elle marche partout.

## Étape 3 : les avoir aussi sur le téléphone

Rangez vos réponses dans une note de votre téléphone, une par paragraphe. Un appui long, « Copier », puis « Coller » dans le message : c’est simple et ça marche avec les SMS, WhatsApp et Messenger.

Sur iPhone, le **remplacement de texte** (Réglages, Général, Clavier) va plus loin : vous tapez un raccourci comme « hhh », et le téléphone écrit vos horaires en entier. Sur Android, cherchez « Dictionnaire personnel » dans les réglages de votre clavier.

## Un exemple

Prenons Thomas, un réparateur de vélos imaginaire. Il a préparé quatre réponses : « Horaires », « Prix d’une révision », « Délai », « Devis reçu ». Quand on lui demande un tarif, il insère la réponse, ajoute « Bonjour Claire, » au début, et précise le modèle du vélo si besoin. Trente secondes au lieu de cinq minutes.

## L’erreur à éviter

La réponse qui sent le copier-coller. Un client qui pose une question précise et reçoit un texte général se sent mal écouté. Gardez toujours une ligne personnelle : son prénom, et un mot sur sa demande à lui.

Pensez aussi à mettre à jour vos réponses quand vos horaires ou vos prix changent.

## À faire aujourd’hui

- Notez les trois questions qu’on vous pose le plus souvent.
- Écrivez la réponse idéale à chacune.
- Enregistrez-les dans Gmail, Outlook, ou dans une note du téléphone.
- Utilisez-en une dès le prochain message.

## Pour aller plus loin

Une réponse enregistrée peut aussi partir toute seule, quand un message correspond à un filtre : idéal pour accuser réception d’une demande de devis le soir ou le week-end. La grande formation sur l’automatisation vous montre comment le faire sans paraître froid.`,
    faq: [
      { q: 'Mes clients vont-ils voir que c’est une réponse toute faite ?', a: 'Pas si elle est bien écrite et que vous ajoutez une ligne personnelle. Ce qu’ils remarquent surtout, c’est que vous répondez vite.' },
      { q: 'Combien de réponses préparer ?', a: 'Commencez par trois. Vous en ajouterez au fil des semaines, quand une question revient souvent.' },
    ],
    voir: ['trier-ses-mails-automatiquement', 'premiere-automatisation-sans-coder'],
  },

  // ------------------------------------------------------------------ première automatisation
  {
    slug: 'premiere-automatisation-sans-coder',
    groupe: 'temps',
    icon: 'workflow',
    monstre: 'chaton',
    formation: 'formation-automatiser-ses-taches',
    nom: 'Votre première automatisation',
    resume: 'Un déclencheur, une action, sans coder.',
    duree: 20,
    niveau: 'Débutant',
    h1: 'Votre première automatisation, sans savoir coder',
    title: 'Première automatisation sans savoir coder | Les Minis Monstres',
    description: 'Repérer une tâche qui se répète, la découper en déclencheur et action, choisir un outil simple et tester : une première automatisation, expliquée pas à pas.',
    lead: 'Automatiser, ce n’est pas réservé aux informaticiens. C’est confier à un outil une petite tâche toujours identique, pour ne plus jamais avoir à y penser.',
    body: `## À quoi ça sert

Copier une demande reçue par mail dans un tableau, prévenir un collègue quand une commande arrive, ranger les pièces jointes dans un dossier : ces gestes prennent deux minutes, mais ils reviennent tous les jours. Une **automatisation** les fait à votre place, toujours de la même façon.

Toute automatisation se lit comme une phrase : **quand** il se passe ceci, **alors** fais cela.

- Le **déclencheur**, c’est le « quand » : un mail arrive, un formulaire est rempli, une date approche.
- L’**action**, c’est le « alors » : ajouter une ligne, envoyer un message, créer un rendez-vous.

## Les étapes

1. **Repérez une tâche répétitive.** Elle doit être toujours identique, sans décision à prendre. « Répondre à une réclamation » ne se prête pas à l’exercice ; « noter chaque demande de devis dans un tableau », oui.
2. **Écrivez la phrase.** « Quand je reçois un mail avec le libellé Devis, alors ajoute une ligne avec le nom, la date et le sujet dans mon tableau. »
3. **Cherchez d’abord dans vos outils.** Beaucoup d’automatisations existent déjà sans rien installer : un filtre de messagerie, la réponse d’absence, un rappel récurrent dans l’agenda.
4. **Sinon, prenez un outil de liaison.** Des services comme Zapier ou Make relient des applications entre elles : vous choisissez l’application du déclencheur, celle de l’action, et vous remplissez les cases. Les deux proposent une formule gratuite, limitée.
5. **Testez avant de compter dessus.** Envoyez-vous un faux message, vérifiez que la ligne apparaît, corrigez. Puis surveillez la première semaine.

## Un exemple

Prenons Karim, un plombier imaginaire. Les demandes arrivent par le formulaire de son site, dans sa boîte mail, et il en oubliait parfois une.

Il a d’abord créé un filtre Gmail qui colle le libellé « Demandes » sur chaque message du formulaire. Puis, dans un outil de liaison, il a écrit sa phrase : quand un mail reçoit le libellé « Demandes », ajoute une ligne dans un tableau Google Sheets. Le soir, il ouvre le tableau et voit d’un coup d’œil qui rappeler.

## L’erreur à éviter

Automatiser un message envoyé au client sans le relire. Un texte qui part tout seul avec une erreur de prénom ou un mauvais prix fait plus de dégâts que le temps gagné. Pour commencer, automatisez ce qui reste chez vous (un tableau, un rangement, un rappel), pas ce qui part chez les autres.

## À faire aujourd’hui

- Notez trois tâches que vous refaites à l’identique chaque semaine.
- Choisissez la plus simple.
- Écrivez sa phrase « quand… alors… ».
- Vérifiez si un réglage de votre messagerie ou de votre agenda suffit.

## Pour aller plus loin

Une seule automatisation fait gagner quelques minutes par jour. Plusieurs, bien enchaînées, changent une semaine. Dans la formation consacrée à l’automatisation, on construit ensemble une petite chaîne complète : de la demande du client jusqu’au rappel de relance.`,
    faq: [
      { q: 'Faut-il payer pour automatiser ?', a: 'Pas pour commencer. Les réglages de votre messagerie et de votre agenda sont gratuits, et les outils de liaison ont une formule gratuite limitée.' },
      { q: 'Et si l’outil tombe en panne ?', a: 'Gardez une vérification simple, comme un coup d’œil au tableau en fin de semaine. Une automatisation aide, elle ne remplace pas votre regard.' },
    ],
    voir: ['trier-ses-mails-automatiquement', 'organiser-sa-semaine'],
  },

  // ------------------------------------------------------------------ prise de rendez-vous
  {
    slug: 'prise-de-rendez-vous-en-ligne',
    groupe: 'temps',
    icon: 'calendar-check',
    monstre: 'chaton',
    formation: 'formation-automatiser-ses-taches',
    nom: 'La prise de rendez-vous en ligne',
    resume: 'Vos clients réservent seuls, vous gardez la main.',
    duree: 15,
    niveau: 'Débutant',
    h1: 'La prise de rendez-vous en ligne, simplement',
    title: 'Prise de rendez-vous en ligne : bien démarrer | Les Minis Monstres',
    description: 'Moins d’appels pour caler un créneau : une page de réservation, vos disponibilités, un lien partagé partout. La méthode avec Google Agenda, et les pièges.',
    lead: 'Trois messages pour trouver un créneau, un rappel oublié, un client qui ne vient pas : la prise de rendez-vous en ligne règle une bonne partie de ces soucis.',
    body: `## À quoi ça sert

Une **page de réservation** affiche vos créneaux libres. Le client choisit le sien, laisse son nom et son adresse mail, et le rendez-vous s’inscrit dans votre agenda. Il reçoit une confirmation, et vous aussi. Plus besoin d’échanger trois messages pour trouver une heure.

## Avec Google Agenda, en 5 étapes

Un compte Google personnel suffit pour créer une page de réservation simple. Certaines options, comme les paiements, demandent un abonnement ou un compte relié.

1. Sur un ordinateur, ouvrez Google Agenda et cliquez sur **Créer**, puis choisissez le planning de rendez-vous. Cette création ne se fait pas depuis l’application du téléphone.
2. Donnez un titre clair, comme « Coupe femme » ou « Premier rendez-vous ».
3. Réglez la **durée** d’un rendez-vous et vos **disponibilités** : les jours et les heures où l’on peut réserver.
4. Choisissez les informations demandées au client (prénom, nom, adresse mail, téléphone si besoin) et activez les mails de confirmation et de rappel.
5. Enregistrez, puis copiez le lien de la page.

D’autres outils existent, souvent pensés pour un métier précis. La logique reste la même : des créneaux, un formulaire, des confirmations.

## Où mettre le lien

- **Sur votre site**, avec un bouton « Prendre rendez-vous ».
- **Sur votre fiche Google**, dans le champ prévu pour la réservation quand il existe pour votre activité.
- **Dans votre signature de mail** et dans la présentation de vos réseaux sociaux.
- **Dans vos réponses toutes faites**, quand on vous demande « Vous avez de la place quand ? ».

Vous avez un site chez nous ? Ajouter un bouton vers votre page de réservation est une simple demande de modification. Un système de réservation construit dans le site lui-même, c’est autre chose : c’est une fonctionnalité spécifique, sur devis.

## Un exemple

Prenons Élodie, une esthéticienne imaginaire. Elle ouvre des créneaux du mardi au samedi, laisse le lundi libre, et ne propose pas de rendez-vous à moins de 24 heures pour garder de la souplesse. Le lien est dans sa fiche Google et sur son site. Le téléphone sonne moins pendant les soins, et les rappels réduisent les oublis.

## L’erreur à éviter

Ouvrir des créneaux sans regarder le reste de votre vie. Si votre agenda perso n’est pas dans le même outil, un client peut réserver pendant votre rendez-vous chez le médecin. Bloquez vos absences dans l’agenda, et prévoyez une marge entre deux rendez-vous pour souffler, ranger ou vous déplacer.

## À faire aujourd’hui

- Listez les prestations que l’on peut réserver sans vous parler.
- Fixez leur durée réelle, marge comprise.
- Créez une première page de réservation pour une seule prestation.
- Réservez vous-même un créneau pour tester, puis supprimez-le.

## Pour aller plus loin

Une page de réservation peut faire plus : un message la veille, une relance après le rendez-vous pour demander un avis, un tableau des clients qui reviennent. La formation sur l’automatisation relie ces petites briques entre elles.`,
    faq: [
      { q: 'Mes clients âgés vont-ils s’en servir ?', a: 'Certains oui, d’autres préféreront appeler. Gardez les deux : la réservation en ligne libère surtout votre téléphone des cas simples.' },
      { q: 'Peut-on demander un acompte à la réservation ?', a: 'Certains outils le permettent, souvent avec un compte de paiement relié ou un abonnement. Vérifiez les conditions de l’outil choisi avant de l’annoncer.' },
    ],
    voir: ['reponses-toutes-faites-mails', 'fiche-google-entreprise'],
  },

  // ------------------------------------------------------------------ facture électronique
  {
    slug: 'facture-electronique-2026-2027',
    groupe: 'temps',
    icon: 'receipt',
    monstre: 'champi',
    nom: 'La facture électronique sans stress',
    resume: 'Les deux dates à connaître, et quoi faire.',
    duree: 12,
    niveau: 'Débutant',
    h1: 'La facture électronique en 2026 et 2027, sans stress',
    title: 'Facture électronique 2026 et 2027 : quoi faire | Les Minis Monstres',
    description: 'Recevoir dès septembre 2026, émettre en septembre 2027 pour les petites entreprises : ce qui change, la plateforme agréée à choisir et les étapes simples.',
    lead: 'La facture électronique devient obligatoire entre entreprises, en deux temps. Pas de panique : pour une petite entreprise, il s’agit surtout de choisir le bon outil et de s’y prendre tôt.',
    body: `## Ce qui change

Entre entreprises installées en France et assujetties à la TVA, la facture va passer par des **plateformes agréées** : des entreprises privées autorisées par l’État à transmettre les factures et à envoyer certaines données à l’administration. Une facture électronique n’est pas un PDF envoyé par mail : c’est un fichier structuré, que les logiciels savent lire tout seuls. Un PDF simple ou un papier scanné ne suffiront plus.

## Les deux dates

D’après [impots.gouv.fr](${SRC_FE) et [economie.gouv.fr](${SRC_FE_ECO}) :

- **Depuis le 1er septembre 2026**, toutes les entreprises concernées doivent pouvoir **recevoir** des factures électroniques, quelle que soit leur taille. Les micro-entreprises aussi, y compris en franchise de TVA.
- **Le 1er septembre 2027**, les petites et moyennes entreprises et les micro-entreprises devront **émettre** leurs factures sous forme électronique. Les grandes entreprises et les entreprises de taille intermédiaire le font depuis septembre 2026.

Pour les ventes aux particuliers, pas de facture électronique, mais une transmission de données à l’administration, appelée **e-reporting**, qui suit le même calendrier.

Nous sommes fin 2026 : la réception est donc déjà obligatoire.

## Les étapes, dans l’ordre

1. **Interrogez votre outil actuel.** Logiciel de facturation, de caisse ou de comptabilité : demandez à son éditeur s’il est relié à une plateforme agréée, et ce que cela coûte.
2. **Choisissez votre plateforme.** La liste officielle est publiée sur impots.gouv.fr. Vous pouvez prendre une plateforme différente de celle de vos clients ou de vos fournisseurs.
3. **Vérifiez vos informations.** Votre SIREN, votre adresse et votre TVA doivent être exacts partout. Les nouvelles factures demandent aussi des mentions supplémentaires, comme le SIREN de votre client.
4. **Testez avec un fournisseur.** Demandez à l’un d’eux de vous envoyer sa prochaine facture par la plateforme, et vérifiez qu’elle arrive bien.
5. **Préparez 2027.** Faites vos premières factures électroniques avant l’échéance, quand vous avez le temps de corriger.

## Un exemple

Prenons Sophie, une couturière imaginaire en micro-entreprise. Elle facturait avec un tableur. Elle a choisi un outil de facturation relié à une plateforme agréée, rempli les SIREN de ses clients professionnels, et reçu sa première facture de fournisseur par ce canal. Pour l’émission, elle a encore jusqu’en septembre 2027, et elle commence à l’essayer dès maintenant.

## L’erreur à éviter

Attendre l’été 2027. Les éditeurs et les plateformes seront débordés, et une première facture refusée par un client tombe toujours au mauvais moment. Chaque cas particulier (activité mixte, ventes à l’étranger) se règle plus sereinement avec votre comptable, à l’avance.

## À faire aujourd’hui

- Vérifiez que vous pouvez déjà recevoir des factures électroniques.
- Écrivez à l’éditeur de votre outil de facturation.
- Ouvrez la liste des plateformes agréées sur impots.gouv.fr.
- Notez dans votre agenda une date de test, avant l’été 2027.

## Pour aller plus loin

Une fois vos factures sur une plateforme, beaucoup de tâches deviennent faciles à automatiser : relances, classement, suivi des paiements. On en reparle dans nos tutos pour gagner du temps.`,
    faq: [
      { q: 'Je suis micro-entrepreneur sans TVA : suis-je concerné ?', a: 'Oui pour la réception, depuis septembre 2026, et pour l’émission en septembre 2027, selon impots.gouv.fr. Votre plateforme ou votre comptable vous confirmera les détails de votre cas.' },
      { q: 'Je ne vends qu’à des particuliers. Qu’est-ce qui change ?', a: 'Pas de facture électronique pour eux, mais une transmission de données à l’administration (e-reporting), au même calendrier. Et vous devez quand même pouvoir recevoir les factures de vos fournisseurs.' },
    ],
    voir: ['comparer-et-negocier-ses-depenses', 'premiere-automatisation-sans-coder'],
  },

  // ------------------------------------------------------------------ comparer et négocier
  {
    slug: 'comparer-et-negocier-ses-depenses',
    groupe: 'temps',
    icon: 'piggy-bank',
    monstre: 'champi',
    formation: 'formation-monter-sa-petite-bande',
    nom: 'Économiser en comparant',
    resume: 'Devis, abonnements, assurances : la méthode.',
    duree: 20,
    niveau: 'Débutant',
    h1: 'Économiser en comparant : devis, abonnements, assurances',
    title: 'Comparer ses devis et négocier ses dépenses | Les Minis Monstres',
    description: 'Lister vos dépenses, comparer à prestation égale, demander un meilleur prix avec un message poli : la méthode simple pour réduire vos frais fixes.',
    lead: 'Les petites dépenses qui reviennent chaque mois finissent par peser lourd. Une heure de tri et deux messages bien écrits suffisent souvent à faire baisser la note.',
    body: `## À quoi ça sert

Un abonnement oublié, une assurance jamais renégociée, un fournisseur choisi il y a cinq ans : ces frais tournent sans que personne ne les regarde. Comparer, c’est vérifier que vous payez le juste prix pour ce dont vous avez vraiment besoin.

## Les étapes

1. **Faites la liste.** Prenez vos relevés bancaires des trois derniers mois et notez chaque dépense qui revient : téléphone, logiciels, assurances, banque, fournisseurs.
2. **Triez en trois colonnes.** « Indispensable », « utile », « je ne m’en sers plus ». Résiliez tout de suite la troisième colonne.
3. **Comparez à prestation égale.** Pour chaque grosse dépense, demandez deux ou trois devis pour exactement la même chose : même quantité, mêmes options, même délai. Vérifiez si les prix sont HT (hors taxes) ou TTC (toutes taxes comprises).
4. **Regardez ce qui n’est pas le prix.** Pour une assurance : les garanties, les exclusions, la **franchise** (la somme qui reste à votre charge en cas de sinistre). Pour un fournisseur : les frais de port, le délai, les conditions de paiement.
5. **Négociez avec votre fournisseur actuel.** Avant de partir, demandez-lui s’il peut s’aligner. C’est souvent plus simple que de tout changer.

## Le message pour négocier

Court, poli, chiffré. Par exemple :

> Bonjour, je suis cliente chez vous depuis quatre ans et j’en suis contente. J’ai reçu une offre à 38 € par mois pour un service équivalent, contre 52 € aujourd’hui. Pouvez-vous me proposer un tarif plus proche ? Je préférerais rester chez vous. Merci de votre retour avant le 15.

Les montants de cet exemple sont inventés : mettez les vôtres, tels qu’ils figurent sur les devis.

## Un exemple

Prenons Julien, un traiteur imaginaire. Il achète ses barquettes chez le même grossiste depuis toujours. Il a demandé deux devis pour la même quantité, puis envoyé le message à son grossiste avec le meilleur prix trouvé. Le grossiste a fait un geste, et Julien n’a rien eu à changer dans son organisation.

## L’outil qui fait gagner du temps

Dans votre espace client, l’outil **${COMPARER.nom}** met jusqu’à quatre devis côte à côte, à partir d’une photo, d’un PDF ou d’un texte collé : le prix, ce qui est compris, les délais, les points à vérifier. ${COMPARER.chef} écrit ensuite le message pour demander un meilleur prix. Il coûte ${eur(COMPARER.prix)} € par mois, avec ${ESSAI} jours d’essai gratuit, et vous relisez toujours les montants avant de décider.

## L’erreur à éviter

Comparer des choses différentes. Un devis moins cher qui oublie la livraison, ou une assurance moins chère avec une franchise trois fois plus haute, n’est pas une économie. Mettez toujours les devis ligne à ligne avant de regarder le total.

## À faire aujourd’hui

- Téléchargez vos trois derniers relevés bancaires.
- Surlignez chaque dépense qui revient.
- Résiliez un abonnement dont vous ne vous servez plus.
- Choisissez une seule dépense à renégocier cette semaine.

## Pour aller plus loin

Comparer une fois, c’est bien. Le faire chaque année, sans y penser, c’est mieux : un rappel dans l’agenda, une liste tenue à jour, des petits outils qui préparent le travail. La formation pour monter sa petite bande d’outils vous aide à organiser tout ça.`,
    faq: [
      { q: 'Est-ce mal vu de négocier ?', a: 'Non, c’est courant entre professionnels. Un message poli, avec un chiffre précis et l’envie de rester client, est en général bien reçu.' },
      { q: 'Tous les combien faut-il comparer ?', a: 'Une fois par an pour les abonnements et les assurances, par exemple à la date anniversaire du contrat, et à chaque grosse commande pour les fournisseurs.' },
    ],
    voir: ['organiser-sa-semaine', 'facture-electronique-2026-2027'],
  },

  // ------------------------------------------------------------------ gestionnaire de mots de passe
  {
    slug: 'gestionnaire-de-mots-de-passe',
    groupe: 'temps',
    icon: 'key-round',
    monstre: 'champi',
    nom: 'Un gestionnaire de mots de passe',
    resume: 'Un seul mot de passe à retenir.',
    duree: 15,
    niveau: 'Débutant',
    h1: 'Un gestionnaire de mots de passe : plus de sécurité, moins d’oublis',
    title: 'Gestionnaire de mots de passe : bien démarrer | Les Minis Monstres',
    description: 'Un mot de passe différent pour chaque compte, sans rien retenir : comment fonctionne un gestionnaire de mots de passe, comment le choisir et l’installer.',
    lead: 'Le même mot de passe partout, c’est pratique jusqu’au jour où un seul site se fait pirater. Un gestionnaire retient tout à votre place, et vous fait gagner du temps chaque jour.',
    body: `## À quoi ça sert

Un **gestionnaire de mots de passe** est un coffre-fort numérique. Il garde tous vos mots de passe, en invente de solides pour vous, et les remplit quand vous vous connectez. Vous ne retenez plus qu’un seul secret : le **mot de passe maître**, celui qui ouvre le coffre.

Le site officiel [cybermalveillance.gouv.fr](${SRC_MDP}) conseille un mot de passe différent pour chaque service, et un gestionnaire pour les retenir, plutôt qu’un carnet, un mail ou un fichier non protégé.

## Les étapes

1. **Choisissez un gestionnaire.** Ceux de votre navigateur ou de votre téléphone (Google, Apple) sont simples pour commencer. Cybermalveillance.gouv.fr cite aussi KeePassXC, un logiciel libre et en français, certifié par l’ANSSI, l’agence nationale de la sécurité informatique.
2. **Créez un mot de passe maître solide.** Une phrase que vous seul connaissez, transformée : les premières lettres de chaque mot, des chiffres, une majuscule, un signe. Ne le notez nulle part en ligne.
3. **Commencez par votre messagerie.** C’est elle qui reçoit les liens « mot de passe oublié » de tous vos autres comptes : c’est le compte le plus précieux. Donnez-lui un mot de passe neuf, créé par le gestionnaire.
4. **Continuez avec les comptes sensibles.** La banque, la fiche Google de votre commerce, vos réseaux sociaux, votre espace client, vos logiciels de facturation.
5. **Activez la double authentification** partout où elle existe : en plus du mot de passe, un code reçu sur votre téléphone confirme que c’est bien vous.

## Un exemple

Prenons Marc, un menuisier imaginaire. Il utilisait le même mot de passe depuis des années, avec la date de naissance de sa fille. En une soirée, il a installé un gestionnaire sur son téléphone et son ordinateur, changé les mots de passe de sa messagerie, de sa banque et de sa page Facebook, et activé la double authentification. Aujourd’hui, il se connecte plus vite qu’avant : le gestionnaire remplit les cases.

## L’erreur à éviter

Tout faire d’un coup un soir de fatigue, et perdre le mot de passe maître. Sans lui, le coffre ne s’ouvre plus. Testez-le plusieurs fois les premiers jours, et gardez en lieu sûr, chez vous, le moyen de récupération que propose votre gestionnaire.

## À faire aujourd’hui

- Choisissez votre gestionnaire et installez-le.
- Inventez votre phrase de mot de passe maître.
- Changez le mot de passe de votre messagerie.
- Activez la double authentification sur ce compte.

## Pour aller plus loin

Chaque semaine, changez le mot de passe d’un compte de plus, en commençant par ceux qui touchent à l’argent et à vos clients. En un mois, vos comptes les plus importants seront protégés.`,
    faq: [
      { q: 'Mettre tous ses mots de passe au même endroit, ce n’est pas risqué ?', a: 'Le coffre est chiffré et protégé par votre mot de passe maître. C’est bien plus sûr qu’un mot de passe identique partout, ou qu’un carnet qui traîne.' },
      { q: 'Et sur un ordinateur partagé ?', a: 'Évitez d’y taper vos mots de passe, n’enregistrez rien dans le navigateur, et fermez toujours vos sessions, comme le conseille cybermalveillance.gouv.fr.' },
    ],
    voir: ['organiser-sa-semaine', 'trier-ses-mails-automatiquement'],
  },

  // ------------------------------------------------------------------ organiser sa semaine
  {
    slug: 'organiser-sa-semaine',
    groupe: 'temps',
    icon: 'calendar-days',
    monstre: 'chaton',
    formation: 'formation-monter-sa-petite-bande',
    nom: 'Organiser sa semaine',
    resume: 'Une liste, des blocs, un bilan du vendredi.',
    duree: 15,
    niveau: 'Débutant',
    h1: 'Organiser sa semaine quand on travaille seul',
    title: 'Organiser sa semaine quand on est à son compte | Les Minis Monstres',
    description: 'Une seule liste, des blocs de temps, les tâches semblables regroupées et un bilan le vendredi : une méthode simple pour ne plus courir après sa semaine.',
    lead: 'Quand on fait tout soi-même, la semaine part dans tous les sens. Quelques habitudes simples suffisent à remettre de l’ordre, sans application compliquée.',
    body: `## À quoi ça sert

Seul à la tête de votre activité, vous êtes à la fois l’artisan, le vendeur, le comptable et le service client. Sans organisation, l’urgent mange l’important : on répond aux messages toute la journée, et le devis à envoyer attend. Organiser sa semaine, c’est décider à l’avance quand chaque type de travail a sa place.

## Les étapes

1. **Une seule liste.** Notez toutes vos tâches au même endroit : un carnet, une note du téléphone ou une application de liste. Pas trois post-it et deux carnets.
2. **Des blocs de temps.** Réservez dans l’agenda des plages fixes : le métier lui-même, l’administratif, la prospection, les réseaux sociaux. Par exemple, l’administratif le lundi matin, chaque semaine.
3. **Regroupez ce qui se ressemble.** Tous les appels d’affilée, tous les devis le même après-midi, toutes les publications préparées d’un coup. Passer d’une tâche à une autre fait perdre du temps à chaque fois.
4. **Deux rendez-vous avec vos messages.** Ouvrez votre messagerie à deux moments choisis de la journée plutôt qu’en continu, et coupez les notifications qui ne viennent pas de vos clients.
5. **Le bilan du vendredi.** Un quart d’heure pour cocher ce qui est fait, reporter le reste, et choisir les trois priorités de la semaine suivante.

## Un exemple

Prenons Léa, une céramiste imaginaire. Avant, elle répondait aux messages entre deux pièces et oubliait ses commandes de terre. Maintenant, le lundi matin est réservé à l’administratif et aux commandes, l’atelier occupe du mardi au jeudi, le vendredi après-midi sert aux photos et aux publications. Elle lit ses messages à 9 h et à 17 h. Les clients ont toujours une réponse dans la journée, et ses pièces avancent.

## L’erreur à éviter

Remplir chaque minute. Une semaine prévue au quart d’heure explose au premier imprévu, et vous vous sentez en retard dès le mardi. Laissez des plages vides : elles absorbent les urgences, et les bonnes semaines elles vous laissent souffler.

## À faire aujourd’hui

- Rassemblez toutes vos tâches sur une seule liste.
- Bloquez dans votre agenda un créneau d’administratif pour la semaine prochaine.
- Choisissez vos deux horaires de messagerie.
- Notez un rendez-vous de bilan vendredi.

## Pour aller plus loin

Une fois la semaine posée, on voit vite quelles tâches pourraient être confiées à un outil : les relances, les publications, le tri des mails. La formation pour monter sa petite bande vous aide à choisir lesquelles, et dans quel ordre.`,
    faq: [
      { q: 'Faut-il une application spéciale ?', a: 'Non. Un agenda et une liste suffisent. Choisissez ce que vous ouvrez déjà tous les jours, sur votre téléphone ou sur papier.' },
      { q: 'Et si un client a une urgence ?', a: 'Les plages laissées vides sont là pour ça. Une vraie urgence passe avant, le reste attend votre prochain rendez-vous avec vos messages.' },
    ],
    voir: ['premiere-automatisation-sans-coder', 'comparer-et-negocier-ses-depenses'],
  },
];
