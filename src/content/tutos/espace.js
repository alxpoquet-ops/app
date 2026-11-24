// Mini Tuto, thème « espace » : voir le format dans ./index.js.
// Tout est relu contre le code de l'espace client (src/wordpress/aled08-espace/, 24 novembre 2026) : noms des onglets
// (Accueil, Mon site avec Ma commande, Modifications, Extras, Ma boutique, puis Mon compte), boutons, étapes de la jauge,
// délais (config.delais.reponse) et limites. Le mode modification vient du connecteur (src/wordpress/alexlia-connecteur/editeur.php).
// Les prix viennent de src/config.js : rien n'est écrit en dur.
const cfg = require('../../config');

const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mini = cfg.forfaits.find((f) => f.id === 'base') || cfg.forfaits[0];
const dom = mini.domaine || 0; // le nom de domaine fourni par nos soins, en plus chaque mois
const delai = cfg.delais.reponse; // « 48 heures » : la date affichée dans la jauge, une fois la demande confirmée
const nom = (id) => (cfg.bande.find((b) => b.id === id) || {}).nom;
const BRICOU = nom('constructeur'), CERISE = nom('support');

module.exports = [
  // ------------------------------------------------------------------ se connecter
  {
    slug: 'acceder-a-mon-espace-client',
    groupe: 'espace',
    icon: 'circle-user',
    monstre: 'mascotte',
    espace: 'accueil',
    nom: 'Accéder à mon espace client',
    resume: 'Où le trouver, comment vous connecter, et ce qui vous attend à l’intérieur.',
    h1: 'Accéder à mon espace client, sur téléphone ou ordinateur',
    title: 'Accéder à mon espace client | Les Minis Monstres',
    description: 'Comment ouvrir votre espace client des Minis Monstres : le bouton Mon espace, votre e-mail, votre mot de passe, puis le tour des onglets en deux minutes.',
    lead: 'Votre espace client, c’est votre page privée chez nous. Un bouton, votre e-mail, votre mot de passe : vous y êtes.',
    body: `Il s’ouvre avec le bouton **« Mon espace »**, en haut de chaque page de notre site. Ensuite, votre adresse e-mail et votre mot de passe suffisent. Il marche aussi bien sur un téléphone que sur un ordinateur, sans rien installer.

## Se connecter, pas à pas

1. Sur le site des Minis Monstres, touchez **« Mon espace »**, en haut de la page.
2. Dans le cadre **« Connexion »**, écrivez votre adresse e-mail dans la case « E-mail ou identifiant ».
3. Écrivez votre mot de passe juste en dessous.
4. Sur votre propre téléphone, cochez **« Rester connecté sur cet appareil »** : la prochaine fois, vous arrivez directement chez vous.
5. Touchez **« Me connecter »**. Votre espace s’ouvre sur l’onglet **« Accueil »**.

## Vous n’avez pas encore de mot de passe ?

Vous avez commandé votre site ? Votre compte a été créé avec la commande. Un e-mail intitulé « Votre espace client des Minis Monstres » vous a été envoyé, avec un lien pour choisir votre mot de passe. Pensez à regarder dans les indésirables.

Vous n’avez rien commandé ? À côté du cadre de connexion, la partie **« Pas encore de compte ? »** vous en crée un gratuitement : votre prénom, votre nom, votre e-mail, puis « Créer mon compte ». Un e-mail arrive pour choisir votre mot de passe.

## Le tour du propriétaire

Le menu de votre espace tient en peu d’onglets :

- **Accueil** : les nouvelles de la bande et ce qui vous attend, par exemple un questionnaire à remplir.
- **Mon site** : l’adresse de votre site, votre forfait, et le bouton pour changer vous-même un texte ou une photo. Juste dessous se rangent « Ma commande », « Modifications », « Extras » et « Ma boutique ».
- **Mon compte** : vos informations, votre mot de passe, votre abonnement et vos factures.

En bas de l’écran, une petite bulle vous attend : c’est ${CERISE}, la secrétaire de la bande. Une question sur votre espace ? Écrivez-lui, elle vous oriente vers le bon onglet. Pour parler à Alex, la page Contact reste ouverte.

> Bon à savoir : tant que votre site est en création, les modifications, les extras et la boutique restent fermés. Tout s’ouvre le jour où votre site est en ligne.

Pour partir, le lien **« Me déconnecter »** se trouve sous le menu. C’est utile sur un ordinateur partagé.`,
    faq: [
      { q: 'Je ne retrouve plus l’e-mail pour choisir mon mot de passe.', a: 'Pas de souci : touchez « Mot de passe oublié ? » sous le formulaire de connexion, avec l’adresse donnée à la commande. Un nouveau lien vous est envoyé.' },
    ],
    voir: ['mes-identifiants-et-le-mot-de-passe-oublie', 'suivre-ma-commande-et-mes-demandes'],
  },
  {
    slug: 'mes-identifiants-et-le-mot-de-passe-oublie',
    groupe: 'espace',
    icon: 'key-round',
    monstre: 'clin',
    espace: 'compte',
    nom: 'Mes identifiants et le mot de passe oublié',
    resume: 'Votre identifiant, un nouveau mot de passe en deux minutes, et changer votre e-mail.',
    h1: 'Mes identifiants, et que faire si j’ai oublié mon mot de passe',
    title: 'Identifiants et mot de passe oublié | Les Minis Monstres',
    description: 'Votre identifiant, c’est votre adresse e-mail. Mot de passe oublié, nouveau mot de passe, e-mail à changer : chaque étape de votre espace client, clairement.',
    lead: 'Pour vous connecter, il vous faut deux choses : votre adresse e-mail et votre mot de passe. Vous avez perdu le second ? Il se remplace en deux minutes.',
    body: `Votre identifiant, c’est **l’adresse e-mail** donnée à la commande. L’e-mail de bienvenue vous indique aussi un identifiant court, tiré de cette adresse : les deux marchent dans la case « E-mail ou identifiant ». Le mot de passe, c’est vous qui l’avez choisi. Personne chez nous ne le connaît, Alex non plus.

## J’ai oublié mon mot de passe

1. Sur la page de connexion, touchez **« Mot de passe oublié ? »**, sous le bouton « Me connecter ».
2. Écrivez l’adresse e-mail de votre compte (ou votre identifiant), puis validez.
3. Vous revenez sur la page de connexion. Un message confirme qu’un e-mail est parti, si l’adresse correspond bien à un compte.
4. Ouvrez cet e-mail et suivez son lien. Il vous laisse choisir un nouveau mot de passe.
5. Reconnectez-vous avec ce nouveau mot de passe, et c’est reparti.

Rien dans votre boîte ? Attendez quelques minutes et jetez un œil aux indésirables. Vous avez peut-être utilisé une autre adresse pour commander : essayez-la aussi.

## Changer mon mot de passe quand je suis connecté

1. Ouvrez l’onglet **« Mon compte »**.
2. Descendez jusqu’à **« Mon mot de passe »**.
3. Écrivez votre mot de passe actuel, puis le nouveau deux fois (10 caractères au moins).
4. Touchez **« Changer mon mot de passe »**.

Par sécurité, vos autres appareils sont alors déconnectés. Celui que vous tenez en main reste connecté.

## Changer mon adresse e-mail

Dans « Mon compte », la partie **« Mon adresse e-mail »** sert à vous connecter et à recevoir les nouvelles de la bande. Écrivez la nouvelle adresse, confirmez avec votre mot de passe actuel, puis touchez « Changer mon e-mail ». Un message de confirmation part vers l’ancienne adresse, pour vous protéger.

Au même endroit, vous mettez aussi à jour votre prénom, votre nom, votre entreprise et votre téléphone.

> Bon à savoir : un compte resté douze mois sans connexion, et sans abonnement actif, est supprimé. Vous êtes prévenu par e-mail 30 jours avant, et une simple connexion annule tout.

Gardez vos identifiants pour vous. Un doute sur une connexion que vous n’avez pas faite ? Changez votre mot de passe tout de suite, puis écrivez-nous.`,
    faq: [
      { q: 'Alex peut-il me redonner mon mot de passe ?', a: 'Non, et c’est voulu : personne ne le voit. Le lien « Mot de passe oublié ? » vous en fait choisir un nouveau, en toute sécurité.' },
    ],
    voir: ['acceder-a-mon-espace-client', 'mes-factures-mon-forfait-et-la-resiliation'],
  },

  // ------------------------------------------------------------------ modifier son site
  {
    slug: 'modifier-mon-site-moi-meme',
    groupe: 'espace',
    icon: 'pencil',
    monstre: 'ravie',
    espace: 'site',
    nom: 'Modifier mon site moi-même',
    resume: 'Un texte ou une photo à changer : vous le faites en direct, c’est en ligne tout de suite.',
    h1: 'Modifier mon site moi-même, pas à pas',
    title: 'Modifier mon site moi-même, pas à pas | Les Minis Monstres',
    description: 'Un horaire, un prix, une photo : avec le bouton Modifier mon site moi-même, vous touchez le texte, vous le changez, et votre site est à jour. Le pas à pas.',
    lead: 'Un horaire qui bouge, un prix à revoir, une photo plus jolie ? Inutile d’attendre : vous le changez vous-même, directement sur votre site.',
    body: `Dans votre espace, le bouton **« Modifier mon site moi-même »** ouvre votre propre site en mode modification. Vous touchez un texte ou une photo, vous le changez, vous enregistrez : c’est en ligne aussitôt. C’est compris dans le forfait ${mini.name}, aussi souvent que vous voulez.

## Changer un texte

1. Dans votre espace, ouvrez **« Mon site »**, puis touchez la carte **« Modifier mon site moi-même »**.
2. Votre site s’ouvre, avec une barre **« Mode modification »** en haut de l’écran.
3. Touchez le texte à changer : un titre, un paragraphe, une ligne de liste, le texte d’un bouton.
4. Écrivez directement dedans, comme dans un message.
5. Touchez **« Enregistrer »**. Le message « C’est enregistré : votre site est à jour. » confirme que c’est fait. « Annuler » remet le texte tel qu’il était.

## Changer une photo

1. Toujours en mode modification, touchez la photo à remplacer.
2. Touchez **« Changer la photo »**, puis choisissez une image sur votre téléphone ou votre ordinateur (JPG, PNG ou WebP).
3. Elle est allégée toute seule avant l’envoi, pour que votre site reste rapide. Quelques secondes plus tard, « Nouvelle photo en place. » s’affiche.

## Passer d’une page à l’autre, puis finir

Pour modifier une autre page, passez par le menu de votre site, comme un visiteur : le mode modification vous suit. Quand vous avez fini, touchez **« Terminer »** dans la barre du haut. Le lien **« Mon application »** vous ramène à votre espace client.

> Bon à savoir : une erreur ? Le bouton **« Annuler la dernière »** apparaît dans la barre dès votre premier changement. Il remet en place ce que vous venez de modifier, une étape après l’autre.

## Ce qui ne se change pas ici

Un texte ne peut pas rester vide : pour supprimer un passage entier, ajouter une section ou une page, faites plutôt une demande à la bande. Quelques textes viennent de la mise en page du site, comme certains blocs de l’accueil : un message vous le dit, et ils passent aussi par une demande. Les articles d’une boutique se gèrent, eux, dans « Ma boutique ».

Le mode reste ouvert deux heures dans ce navigateur. Au-delà, rouvrez-le depuis votre espace. Vous ne voyez pas le bouton ? Votre site n’a pas encore ce mode : écrivez simplement votre changement dans « Modifications », Alex et la bande s’en chargent.`,
    faq: [
      { q: 'Est-ce que je risque de casser mon site ?', a: 'Non. Seuls les textes et les photos du contenu se changent, pas la mise en page. Et « Annuler la dernière » revient en arrière en un geste.' },
      { q: 'Faut-il un mot de passe en plus ?', a: 'Non. Le bouton de votre espace vous ouvre le mode modification directement, sans autre compte.' },
    ],
    voir: ['demander-une-modification-a-la-bande', 'combien-de-temps-prend-une-modification'],
  },
  {
    slug: 'demander-une-modification-a-la-bande',
    groupe: 'espace',
    icon: 'message-circle',
    monstre: 'bricou',
    espace: 'demandes',
    nom: 'Demander une modification à la bande',
    resume: 'Vous écrivez ce qui doit changer, Bricou vérifie avec vous, puis c’est fait.',
    h1: 'Demander une modification à la bande, et ce qui se passe ensuite',
    title: 'Demander une modification à la bande | Les Minis Monstres',
    description: 'Une page à ajouter, un passage à retirer, une idée à mettre en forme : écrivez votre demande dans votre espace. Chaque étape, jusqu’à la modification faite.',
    lead: `Plus compliqué qu’un mot à changer, ou pas envie de le faire vous-même ? Écrivez-le à ${BRICOU}. Il prépare votre demande avec vous, puis la bande s’en occupe.`,
    body: `Votre demande s’écrit dans l’onglet **« Modifications »**, en quelques mots, comme un message. ${BRICOU} la relit, vous pose une question si quelque chose manque, puis vous montre ce qu’il a compris. Vous confirmez, et la modification se fait. Avec le forfait ${mini.name}, les modifications sont incluses.

## Envoyer ma demande

1. Dans votre espace, ouvrez **« Mon site »**, puis **« Modifications »**. Depuis l’accueil, le bouton « Demander une modification » mène au même endroit.
2. Dans la case **« Votre demande »**, dites ce qui doit changer et où. Par exemple : « Sur la page Contact, ajoutez que nous fermons le samedi en août. »
3. Une photo à mettre en ligne ? Touchez **« Ajouter jusqu’à 3 photos (facultatif) »**. Chaque photo pèse 8 Mo au plus.
4. Touchez **« Envoyer ma demande »**. Elle apparaît aussitôt dans une jauge, juste au-dessus.

## Ce qui se passe ensuite

1. **Demande reçue** : ${BRICOU} relit votre demande, avec votre site sous les yeux.
2. **Une question ?** S’il manque un détail, il vous le demande. Le bouton « Répondre à ${BRICOU} » s’affiche dans la jauge : écrivez votre réponse, joignez une capture d’écran si ça aide.
3. **Précisée avec ${BRICOU}** : vous recevez un e-mail « Votre demande est prête à vérifier ». Touchez « Vérifier ma demande », lisez le résumé, puis « Oui, c’est bien ça : transmettre à Alex ». Ce n’est pas ça ? « Non, je corrige », et on reprend avec vos remarques.
4. **Chez Alex** : la jauge affiche la date à laquelle ce sera fait. La bande réalise la modification, une seconde vérification passe derrière, et Alex traite lui-même les cas délicats.
5. **Faite** : un e-mail « Votre modification est en ligne » vous prévient, et la demande rejoint votre historique.

> Bon à savoir : vous changez d’avis ? La petite croix de la jauge, « Annuler cette demande », reste là tant que le travail n’a pas commencé. Rien n’est changé sur votre site, et elle ne compte pas.

## Une demande à la fois

Avec votre abonnement, une demande avance à la fois. La suivante peut partir dès que la première est faite : la jauge vous le rappelle. Les petites choses, un mot ou une photo, se font plus vite vous-même, avec le bouton « Modifier mon site moi-même ».

Si ${BRICOU} attend votre réponse pendant sept jours, la demande s’annule toute seule pour libérer votre place. Vous pouvez la refaire quand vous voulez.`,
    faq: [
      { q: 'Comment bien écrire ma demande ?', a: 'Dites où (la page, l’endroit) et quoi (le texte exact, le prix, la photo). Une demande précise part plus vite chez Alex.' },
    ],
    voir: ['combien-de-temps-prend-une-modification', 'modifier-mon-site-moi-meme', 'suivre-ma-commande-et-mes-demandes'],
  },
  {
    slug: 'combien-de-temps-prend-une-modification',
    groupe: 'espace',
    icon: 'clock',
    monstre: 'chaton',
    espace: 'demandes',
    nom: 'Combien de temps prend une modification',
    resume: 'Tout de suite si vous la faites vous-même, une date affichée si vous la demandez.',
    h1: 'Combien de temps prend une modification de mon site ?',
    title: 'Combien de temps prend une modification | Les Minis Monstres',
    description: `Vous la faites vous-même : c’est immédiat. Vous la demandez : une date s’affiche dès votre accord, en général sous ${delai}. Ce qui accélère, ce qui ralentit.`,
    lead: 'La réponse courte : tout de suite si vous la faites vous-même, et une date précise affichée dans votre espace si vous la demandez à la bande.',
    body: `Tout dépend de qui fait la modification.

- **Vous-même**, avec « Modifier mon site moi-même » : c’est en ligne à la seconde où vous enregistrez.
- **La bande**, avec une demande : une fois que vous avez confirmé le résumé de ${BRICOU}, la jauge affiche une date. En général, c’est fait sous ${delai}.
- **Votre boutique**, si vous avez l’option e-commerce : un prix, un article, une promo ou le mode vacances changent dès que vous enregistrez.

## Lire la jauge de ma demande

1. Ouvrez **« Mon site »**, puis **« Modifications »**.
2. En haut, la jauge de votre demande montre quatre étapes : **Demande reçue**, **Précisée avec ${BRICOU}**, **Chez Alex**, **Faite**.
3. Un bouton apparaît sous la jauge ? C’est à vous de jouer : « Vérifier ma demande » ou « Répondre à ${BRICOU} ».
4. À l’étape « Chez Alex », une phrase vous dit d’ici quel jour ce sera fait, avec l’heure quand c’est proche.
5. À « Faite », vous êtes prévenu. La jauge se libère pour votre demande suivante.

La page se met à jour seule, sans recharger : vous pouvez la laisser ouverte.

## Ce qui accélère votre demande

- **Une demande précise** : la page, l’endroit, le texte exact. ${BRICOU} n’a pas de question à poser.
- **Une réponse rapide** quand il en pose une. Le délai ne démarre qu’après votre confirmation.
- **Les photos jointes** dès le départ, plutôt qu’envoyées après.

## Ce qui prend plus longtemps

Une nouvelle page, une fonction en plus ou une traduction ne sont pas des modifications ordinaires. Elles passent par l’onglet « Extras ». Une page de visibilité Google est écrite puis mise en ligne pour vous : un e-mail vous prévient dès qu’elle est visible. Une demande sur devis suit le délai écrit dans le devis.

> Bon à savoir : le délai affiché est un délai habituel, pas une garantie, comme le disent nos conditions générales. Une demande délicate peut prendre un peu plus : Alex la traite alors lui-même, avec soin.

Et sans réponse de votre part pendant sept jours, quand ${BRICOU} vous attend, la demande s’annule seule. Rien n’est perdu : vous la renvoyez quand vous êtes prêt.`,
    faq: [
      { q: 'Et le week-end ?', a: 'Vous pouvez écrire votre demande à toute heure, tous les jours. La date affichée dans la jauge est celle qui compte.' },
    ],
    voir: ['demander-une-modification-a-la-bande', 'modifier-mon-site-moi-meme'],
  },

  // ------------------------------------------------------------------ suivre, payer
  {
    slug: 'suivre-ma-commande-et-mes-demandes',
    groupe: 'espace',
    icon: 'list-checks',
    monstre: 'mochi',
    espace: 'commande',
    nom: 'Suivre ma commande et mes demandes',
    resume: 'La création de votre site étape par étape, puis l’historique de vos demandes.',
    h1: 'Suivre ma commande et mes demandes depuis mon espace',
    title: 'Suivre ma commande et mes demandes | Les Minis Monstres',
    description: 'Où voir l’avancement de la création de votre site, le questionnaire à remplir, puis l’historique de vos demandes de modification, avec leur statut.',
    lead: 'De la commande à la mise en ligne, puis à chaque modification : tout se suit au même endroit, sans avoir à nous écrire pour savoir où on en est.',
    body: `Pendant la création, une barre de progression s’affiche en haut de votre espace, avec un pourcentage. Une fois le site en ligne, ce sont vos demandes de modification qui se suivent, une par une.

## Pendant la création de votre site

La barre passe par six étapes : **Paiement**, **Questionnaire**, **Domaine et hébergement**, **Création**, **Vérification**, **En ligne**. Quand c’est à vous d’agir, son titre commence par « À vous ».

1. Ouvrez **« Mon site »**, puis **« Ma commande »**.
2. En tête, vous voyez la référence de votre commande et son état, par exemple « Je crée votre site ».
3. Le questionnaire de création n’est pas encore rempli ? Un rappel « À faire » s’affiche aussi sur l’accueil, avec le bouton « Le remplir ». C’est ce questionnaire qui lance la création.
4. Plus bas : votre type de site, votre nom de domaine, votre abonnement et ce que vous avez payé.
5. Quand l’état devient **« En ligne »**, votre site est publié, et les autres rubriques s’ouvrent.

La frise se met à jour d’elle-même pendant que nous préparons votre domaine et votre hébergement : pas besoin de recharger la page.

## Une fois votre site en ligne

1. Ouvrez **« Mon site »**, puis **« Modifications »**.
2. La demande en cours est en haut, dans sa jauge, avec l’étape où elle en est.
3. Dessous, **l’historique** liste toutes vos demandes, de la plus récente à la plus ancienne.
4. Chacune porte son statut : **Reçue**, **En cours**, **Faite** ou **Annulée**, avec la réponse de la bande quand il y en a une.

Les trois dernières demandes apparaissent aussi sur la page « Mon site », sous les grands boutons. Les extras commandés, comme une page de visibilité Google ou un devis, rejoignent le même historique.

> Bon à savoir : pas besoin de surveiller. Un e-mail vous prévient quand une demande attend votre accord, et quand elle est faite.

## Et si quelque chose coince ?

Un paiement en attente, un questionnaire oublié : votre espace vous le signale dès l’accueil. Pour tout le reste, ${CERISE} répond dans sa bulle, et Alex sur la page Contact.`,
    voir: ['acceder-a-mon-espace-client', 'combien-de-temps-prend-une-modification'],
  },
  {
    slug: 'mes-factures-mon-forfait-et-la-resiliation',
    groupe: 'espace',
    icon: 'receipt',
    monstre: 'dino',
    espace: 'compte',
    nom: 'Mes factures, mon forfait, la résiliation',
    resume: 'Retrouver une facture, changer de carte, et arrêter le forfait si un jour vous le voulez.',
    h1: 'Mes factures, mon forfait et la résiliation',
    title: 'Mes factures, mon forfait, la résiliation | Les Minis Monstres',
    description: `Votre forfait ${mini.name} à ${eur(mini.month)} € par mois, vos factures à télécharger, votre carte à changer, et la résiliation en un bouton, sans engagement.`,
    lead: `Tout ce qui touche à l’argent se trouve dans « Mon compte » : votre forfait, vos factures, votre moyen de paiement. Et le bouton pour arrêter, sans engagement.`,
    body: `Ouvrez l’onglet **« Mon compte »**, puis descendez jusqu’à **« Mon abonnement et mes factures »**. Vous y voyez votre forfait ${mini.name}, son prix, le total de chaque mois et la liste de vos factures.

## Ce que vous payez chaque mois

Le forfait ${mini.name} coûte ${eur(mini.month)} € par mois. Si nous vous fournissons votre nom de domaine, il s’ajoute ${eur(dom)} € par mois, soit ${eur(mini.month + dom)} € en tout. La partie « Le détail » montre chaque ligne, puis le total.

Les extras payés une fois, comme une page de visibilité Google, ne changent pas votre abonnement : ils se règlent par carte au moment de la commande, avec leur propre facture. Il n’y a qu’un forfait : rien à choisir, rien à changer.

## Retrouver une facture

1. Dans « Mon compte », trouvez la partie **« Factures »**.
2. Chaque ligne donne la date, le numéro et le montant.
3. Touchez **« Voir »** pour l’ouvrir, ou **« PDF »** pour la télécharger.

## Changer ma carte bancaire

1. Touchez **« Gérer mon paiement et mes factures »**.
2. Une page de paiement sécurisée s’ouvre. Vous y changez votre carte et retrouvez aussi vos factures.
3. Revenez à votre espace avec le lien prévu sur cette page.

Un paiement n’est pas passé ? Un message vous le signale, avec un bouton pour mettre à jour votre moyen de paiement.

## Résilier mon forfait

Le forfait est sans engagement.

1. Toujours dans « Mon compte », touchez **« Résilier mon forfait »**.
2. La page sécurisée s’ouvre directement sur l’arrêt de l’abonnement. Confirmez.
3. De retour dans votre espace, un message vous le confirme : le forfait s’arrête à la fin de la période déjà payée, sans autre prélèvement.

La page ne s’ouvre pas ? Votre demande est quand même enregistrée, et un e-mail vous le confirme.

> Bon à savoir : à la fin du forfait, vous recevez l’export de votre site, prêt à installer ailleurs. Votre nom de domaine vous appartient. L’hébergement chez nous s’arrête 30 jours après la fin de l’abonnement.

Une question sur une facture ? Écrivez à Alex : il vous répond lui-même.`,
    faq: [
      { q: 'Mes coordonnées bancaires sont-elles chez vous ?', a: 'Non. Les paiements passent par une page sécurisée : nous ne voyons jamais votre numéro de carte.' },
    ],
    voir: ['mes-identifiants-et-le-mot-de-passe-oublie', 'suivre-ma-commande-et-mes-demandes'],
  },

  // ------------------------------------------------------------------ la boutique (option e-commerce)
  {
    slug: 'ma-boutique-ajouter-un-article',
    groupe: 'espace',
    icon: 'shopping-bag',
    monstre: 'gelee',
    espace: 'vacances',
    nom: 'Ma boutique : ajouter un article',
    resume: 'Une photo, un nom, un prix : votre article est en vente. Et le mode vacances.',
    h1: 'Ma boutique : ajouter un article, changer un prix, partir en vacances',
    title: 'Ma boutique : ajouter un article | Les Minis Monstres',
    description: 'Avec l’option e-commerce, vous gérez votre boutique vous-même : ajouter un article et sa photo, changer un prix, créer un code promo, fermer pour les vacances.',
    lead: 'Avec l’option e-commerce, votre boutique se gère depuis votre téléphone, sans passer par nous. Un nouvel article prend une minute.',
    body: `L’onglet **« Ma boutique »** se trouve sous « Mon site ». Il se range en six rubriques : **Mes articles**, **Mes prix**, **Paiements**, **Livraison**, **Commandes**, **Promos et soldes**. Tout ce que vous y faites part sur votre site dès que vous enregistrez, et ne compte pas dans vos modifications.

## Ajouter un article

1. Ouvrez **« Mon site »**, puis **« Ma boutique »**. La rubrique « Mes articles » s’ouvre en premier.
2. Touchez **« Ajouter un article »**.
3. Remplissez **le nom de l’article**, par exemple « Bougie à la figue ».
4. Indiquez **le prix**. Vous préférez seulement le présenter ? Cochez « Je ne mets pas de prix » : il s’affiche, sans achat en ligne.
5. Vous avez des catégories ? Cochez celle qui lui va.
6. Écrivez **la description** : ce qui le rend unique, sa taille, sa matière.
7. Touchez **« Ajouter la photo »** et choisissez-la (JPG, PNG ou WebP).
8. Touchez **« Mettre en ligne »**. Votre article est en vente.

Pour ranger vos articles, **« Créer une catégorie »** se trouve juste en dessous : un nom, par exemple « Coffrets », et c’est prêt.

## Changer un prix ou faire une promo

Dans **« Mes prix »**, vous changez un prix, vous mettez une promotion, vous retirez un article de la vente ou vous le marquez en rupture. Dans **« Promos et soldes »**, vous créez un code promo, comme NOEL10, avec sa réduction en pourcentage ou en euros.

## Fermer pour les vacances

Toujours dans « Promos et soldes », la partie **« Mode vacances »** met la boutique en pause :

1. Choisissez la date de départ et la date de retour. Sans date de départ, c’est dès maintenant.
2. Choisissez **« Boutique fermée »** (on voit vos articles, sans pouvoir commander) ou **« Commandes acceptées »** (l’envoi se fera à votre retour).
3. Écrivez le message du bandeau, ou laissez celui qu’on vous propose.
4. Touchez **« Activer le mode vacances »**. Un aperçu vous montre ce que verront vos visiteurs.

Tout repart seul à la date de retour. « Arrêter, rouvrir la boutique » met fin aux vacances plus tôt.

> Bon à savoir : vous n’avez pas encore l’option e-commerce ? L’onglet « Ma boutique » s’affiche fermé, avec un cadenas, et vous propose de la débloquer.

Les commandes reçues se lisent dans **« Commandes »**, et vos moyens de paiement se règlent dans **« Paiements »**.`,
    faq: [
      { q: 'Combien d’articles puis-je ajouter ?', a: 'Autant que vous voulez : c’est écrit sous « Ajouter un article ». Chacun a sa photo, son prix et sa description.' },
    ],
    voir: ['boutique-en-ligne-e-commerce', 'combien-de-temps-prend-une-modification'],
  },
];
