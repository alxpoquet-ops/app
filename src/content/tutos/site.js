// Mini Tuto, thème « site » : voir le format dans ./index.js.
// Consigne d'Alex (24 novembre 2026) : un tuto explique vite l'essentiel, sans tout dire ; la formation dit tout.
// Faits vérifiés le 24 novembre 2026 : web.dev (seuils des Core Web Vitals : LCP 2,5 s, INP 200 ms, CLS 0,1),
// entreprendre.service-public.gouv.fr F37351 (mentions obligatoires d'un site, vérifié le 13 octobre 2026),
// cnil.fr (cookies : refus aussi simple que l'acceptation, mesure d'audience exemptée sous conditions).
const { forfaits, creationSeule } = require('../../config');
const MINI = (forfaits.find((f) => f.id === 'base') || forfaits[0]).name; // Mini
const AUTO = creationSeule.name; // Autonome
module.exports = [
  {
    slug: 'les-regles-d-un-beau-site',
    groupe: 'site',
    icon: 'palette',
    monstre: 'bricou',
    nom: 'Les règles d’un beau site',
    resume: 'Lisible, aéré, cohérent, vrai : les quatre règles qui font un site agréable, sans être graphiste.',
    duree: 10,
    niveau: 'Débutant',
    h1: 'Les règles d’un beau site, même sans être graphiste',
    title: 'Les règles d’un beau site internet | Les Minis Monstres',
    description: 'Un beau site n’est pas un site chargé : un texte lisible, de l’espace, deux ou trois couleurs, de vraies photos. Les règles d’un site qui inspire confiance.',
    lead: 'Un beau site ne se remarque pas pour ses effets. On le remarque parce qu’on y trouve tout, sans effort, et qu’il ressemble à votre commerce. Bonne nouvelle : cela tient en quelques règles.',
    body: `## À quoi ça sert

En arrivant sur un site, on se fait une idée en un coup d’œil : sérieux ou bricolé, accueillant ou confus. Cette première impression décide si le visiteur reste. Un site soigné inspire confiance avant même qu’on ait lu une ligne.

## Les quatre règles

1. **Lisible d’abord.** Un texte assez grand pour être lu sur un téléphone sans zoomer, foncé sur fond clair (ou l’inverse en mode sombre), et jamais posé sur une photo chargée. Si vous plissez les yeux, vos clients aussi.
2. **De l’espace.** Les marges et les blancs entre les blocs ne sont pas de la place perdue : ils laissent respirer le regard. Un bloc, une idée.
3. **Peu de choses, toujours les mêmes.** Deux ou trois couleurs, une ou deux polices de caractères, des boutons qui se ressemblent tous. La cohérence fait sérieux.
4. **Du vrai.** Vos photos, votre équipe, votre vitrine, vos réalisations. Une photo de banque d’images se repère tout de suite, et elle ne dit rien de vous.

## Choisir ses couleurs sans se tromper

Partez de ce qui existe déjà : votre logo, votre devanture, vos emballages. Prenez-en une couleur principale pour les boutons et les titres, une couleur douce pour les fonds, et gardez le texte presque noir. Si vous hésitez, moins de couleurs vaut toujours mieux que plus.

## Un exemple

Prenons un exemple inventé. Camille est céramiste. Son premier site mélangeait cinq couleurs, trois polices et un fond à motifs. On ne voyait plus ses bols.

Elle garde le bleu de ses émaux pour les boutons, un fond crème, une seule police, et laisse beaucoup d’espace autour de chaque photo. Ses pièces deviennent les vraies vedettes. Le site paraît plus calme, et plus haut de gamme, sans rien ajouter.

## L’erreur à éviter

Ajouter des effets pour faire moderne : textes qui défilent, images qui bougent toutes seules, animations à chaque mouvement. Ils fatiguent, ralentissent le site, et cachent l’essentiel. Un effet n’a sa place que s’il aide à comprendre.

## À faire aujourd’hui

- Ouvrez votre site sur votre téléphone, en plein jour. Tout est-il lisible ?
- Comptez vos couleurs et vos polices. Au-delà de trois couleurs, simplifiez.
- Repérez une photo de banque d’images et notez la vraie photo qui pourrait la remplacer.

## Pour aller plus loin

Un beau site commence par une bonne page d’accueil, puis de bonnes photos : deux tutos de ce thème vous guident pas à pas. Et si vous préférez partir d’une base déjà soignée, Mini Site assemble votre site à partir de modules prêts, à vos couleurs.`,
    faq: [
      { q: 'Faut-il un logo avant de faire son site ?', a: 'C’est mieux, mais pas obligatoire. Un nom bien écrit dans une belle police, avec votre couleur, fait très bien l’affaire pour commencer.' },
      { q: 'Le mode sombre est-il utile ?', a: 'Beaucoup de gens règlent leur téléphone en sombre, le soir surtout. Un bouton qui permet de choisir entre clair et sombre est un vrai confort, à condition que le texte reste bien lisible dans les deux.' },
    ],
    voir: ['page-d-accueil-qui-donne-envie', 'belles-photos-avec-son-telephone', 'site-une-page-ou-site-vitrine'],
  },
  {
    slug: 'page-d-accueil-qui-donne-envie',
    groupe: 'site',
    icon: 'layout-template',
    monstre: 'bricou',
    nom: 'Une page d’accueil qui donne envie',
    resume: 'Qui vous êtes, ce que vous faites, où, et comment vous joindre : le test des cinq secondes.',
    duree: 15,
    niveau: 'Débutant',
    h1: 'Une page d’accueil qui donne envie en cinq secondes',
    title: 'Une page d’accueil qui donne envie | Les Minis Monstres',
    description: 'En quelques secondes, votre page d’accueil doit dire ce que vous faites, où, et comment vous joindre. Le test à faire, la bonne structure, un exemple.',
    lead: 'Un visiteur décide très vite s’il reste ou s’il repart. Pendant ce court instant, il ne lit pas : il cherche trois informations. Si elles sont là, il continue.',
    body: `## Le test des cinq secondes

Montrez votre page d’accueil à quelqu’un qui ne vous connaît pas, sur un téléphone, pendant cinq secondes. Cachez l’écran. Puis demandez-lui :

- **Que fait cette entreprise ?**
- **Où ?**
- **Comment la contacter ?**

S’il hésite sur une seule réponse, le haut de votre page est à revoir.

## Les étapes

1. **Un grand titre concret.** Votre activité et votre lieu, avec les mots de vos clients : « Fleuriste à Sedan, bouquets et deuil ». Jamais « Bienvenue sur notre site » : personne ne tape ça dans Google.
2. **Une phrase qui dit le bénéfice.** Ce que le client y gagne : « Des bouquets frais, prêts en dix minutes, livrés dans la journée. » Seulement si c’est vrai.
3. **Un bouton principal.** Ce que vous voulez qu’il fasse : appeler, réserver, demander un devis. Un seul bouton bien visible dans le premier écran.
4. **Une vraie photo.** Votre vitrine, vos mains au travail, votre plus belle réalisation. Une seule, nette et lumineuse.
5. **Puis, en descendant :** vos services en quelques blocs, une preuve (avis, années d’expérience, label réel), vos horaires et votre adresse.

On appelle **premier écran** tout ce qui se voit sans faire défiler. C’est la partie la plus précieuse de votre site : gardez-la pour l’essentiel. Sur un téléphone, il est petit : le titre, la phrase, le bouton et le haut de la photo, guère plus. Chaque élément doit y mériter sa place.

## Un exemple

Prenons un exemple inventé. Nadia est traiteur. Le haut de son ancien site affichait son logo en grand, un carrousel de cinq photos et le mot « Bienvenue ».

Elle le remplace par le titre « Traiteur pour vos fêtes de famille, autour de Reims », la phrase « Buffets et plats cuisinés maison, de 10 à 150 personnes » et un bouton « Demander un devis ». Dessous, une photo de buffet. Ses visiteurs comprennent tout de suite, et son bouton devient enfin visible.

## L’erreur à éviter

Le carrousel, ces images qui défilent seules en haut de page. Il ralentit le site, on ne voit presque jamais que la première image, et il pousse le texte important vers le bas. Une seule belle photo fait mieux.

## À faire aujourd’hui

- Faites le test des cinq secondes avec un proche, sur téléphone.
- Réécrivez votre grand titre : votre activité et votre lieu.
- Choisissez l’unique action que vous attendez de vos visiteurs.

## Pour aller plus loin

Le bouton principal mérite à lui seul un tuto : comment l’écrire, où le placer, combien en mettre. Et pour la phrase qui dit le bénéfice, le tuto sur les textes qui parlent aux clients vous donne la méthode.`,
    faq: [
      { q: 'Faut-il présenter mon histoire sur la page d’accueil ?', a: 'Une ou deux phrases, oui, plus bas dans la page : elles rendent votre commerce humain. L’histoire complète trouve mieux sa place sur une page « Qui sommes-nous ».' },
      { q: 'Ma page d’accueil doit-elle être longue ?', a: 'Elle doit surtout être bien rangée. Le premier écran dit l’essentiel, la suite répond aux questions dans l’ordre où un client se les pose.' },
    ],
    voir: ['bouton-qui-fait-appeler', 'ecrire-des-textes-qui-parlent-aux-clients', 'les-regles-d-un-beau-site'],
  },
  {
    slug: 'belles-photos-avec-son-telephone',
    groupe: 'site',
    icon: 'camera',
    monstre: 'ravie',
    nom: 'De belles photos avec son téléphone',
    resume: 'La lumière, le fond, le cadrage : des photos nettes et lumineuses, sans matériel.',
    duree: 15,
    niveau: 'Débutant',
    h1: 'De belles photos pour votre site, avec votre téléphone',
    title: 'De belles photos avec son téléphone | Les Minis Monstres',
    description: 'Lumière du jour, fond simple, objectif propre, cadrage net : de belles photos pour votre site avec votre téléphone, allégées avant d’être publiées.',
    lead: 'Votre téléphone suffit largement pour les photos de votre site. Ce qui fait une belle photo, ce n’est pas l’appareil : c’est la lumière, le fond et un peu de méthode.',
    body: `## À quoi ça sert

Sur un site, les photos parlent avant les mots. Une photo sombre ou floue fait douter de votre sérieux. Une photo claire et vraie montre votre travail mieux que n’importe quelle phrase.

## Les étapes

1. **Essuyez l’objectif.** Un coup de chiffon doux sur la lentille de votre téléphone. Une trace de doigt suffit à rendre une photo floue et voilée.
2. **Cherchez la lumière du jour.** Placez-vous près d’une fenêtre, sans soleil direct. Coupez le flash, qui écrase les couleurs et fait des reflets.
3. **Dégagez le fond.** Un mur clair, un plan de travail rangé, une nappe unie. Tout ce qui traîne derrière attire l’œil au détriment du sujet.
4. **Cadrez avec la grille.** Activez la grille dans les réglages de l’appareil photo. Gardez l’horizon droit et placez votre sujet sur l’une des lignes plutôt qu’en plein centre.
5. **Rapprochez-vous au lieu de zoomer.** Le zoom fait souvent perdre en netteté. Avancez de deux pas, et prenez plusieurs photos sous plusieurs angles.

## Avant de publier : alléger

Une photo de téléphone est souvent très lourde, et une image trop lourde ralentit votre site. Avant de la mettre en ligne, réduisez-la : pour un site, une largeur d’environ 1 600 pixels suffit largement. La plupart des téléphones et des ordinateurs savent le faire, à l’export ou au partage. L’outil « Fiche produit » de la bande recadre et allège aussi une photo pour vous.

## Un exemple

Prenons un exemple inventé. Hugo est menuisier. Il photographiait ses meubles le soir, dans l’atelier, au flash, avec les outils autour.

Il attend un matin clair, sort la table devant la porte de l’atelier, sur un mur blanc, et prend dix photos : de face, de trois quarts, un détail des assemblages. Il garde les trois meilleures. Sur son site, ses tables ressemblent enfin à ce qu’elles sont.

## L’erreur à éviter

Publier une personne sans son accord. Un client, un salarié, un enfant : avant de mettre une photo où l’on reconnaît quelqu’un, demandez-lui la permission, et gardez une trace écrite de sa réponse, un simple message suffit.

## À faire aujourd’hui

- Nettoyez l’objectif et activez la grille de votre appareil photo.
- Photographiez votre meilleur produit ou votre plus belle réalisation, près d’une fenêtre.
- Comparez avec vos photos actuelles, et remplacez la plus faible.

## Pour aller plus loin

Une série de photos qui se ressemblent, même lumière, même fond, donne une vraie unité à votre site. Le tuto sur les règles d’un beau site vous aide à les mettre en valeur, et celui sur la vitesse explique pourquoi chaque image doit rester légère.`,
    faq: [
      { q: 'Faut-il retoucher ses photos ?', a: 'Un peu de lumière et un recadrage, oui. Des filtres forts ou des couleurs changées, non : le client doit retrouver en vrai ce qu’il a vu sur votre site.' },
      { q: 'Puis-je prendre des photos trouvées sur internet ?', a: 'Non, sauf si leur licence le permet clairement. Une photo trouvée sur internet appartient à son auteur. Vos propres photos sont plus sûres, et elles montrent votre vrai travail.' },
    ],
    voir: ['les-regles-d-un-beau-site', 'site-rapide', 'creer-boutique-en-ligne'],
  },
  {
    slug: 'ecrire-des-textes-qui-parlent-aux-clients',
    groupe: 'site',
    icon: 'pen-tool',
    monstre: 'champi',
    formation: 'formation-assistant-qui-ecrit',
    nom: 'Écrire des textes qui parlent aux clients',
    resume: 'Parler du client plutôt que de soi, des mots simples, du concret : la méthode pour des textes qui donnent envie.',
    duree: 20,
    niveau: 'Débutant',
    h1: 'Écrire des textes qui parlent à vos clients, pas seulement de vous',
    title: 'Écrire des textes qui parlent aux clients | Les Minis Monstres',
    description: 'Parler du client avant de parler de soi, des mots simples, des preuves concrètes, des phrases courtes : la méthode pour écrire les textes de votre site.',
    lead: 'Beaucoup de sites commencent par « Nous sommes une entreprise passionnée ». Le client, lui, se demande surtout si vous pouvez régler son problème. Un bon texte part de sa question.',
    body: `## À quoi ça sert

Vos textes font le travail d’un vendeur qui ne dort jamais. Ils répondent aux questions, rassurent, et donnent envie de vous contacter. Et parce qu’ils emploient les mots de vos clients, ils aident aussi Google à vous trouver.

## Les étapes

1. **Pensez à une vraie personne.** Un client type : qui il est, ce qui l’inquiète, ce qu’il veut. Écrivez pour lui, comme si vous lui parliez.
2. **Parlez de lui avant de parler de vous.** Comptez les « nous » et les « vous » dans votre texte. Le client doit se reconnaître dans les premières lignes.
3. **Dites ce qu’il y gagne.** Pas seulement ce que vous faites, mais ce que ça change pour lui. « Pose de fenêtres » devient « Une maison plus chaude cet hiver, posée en une journée », si c’est vrai.
4. **Prouvez avec du concret.** Un délai réel, une zone précise, une garantie que vous offrez vraiment, une photo d’un chantier. Le concret convainc mieux que les grands mots.
5. **Écrivez court.** Une idée par phrase, des paragraphes de deux ou trois lignes, des intertitres. Sur un téléphone, un pavé de texte ne se lit pas.

## Un exemple

Prenons un exemple inventé. Élodie est couvreuse. Son texte disait : « Entreprise de couverture reconnue, nous mettons notre savoir-faire et notre passion au service de nos clients. »

Elle le réécrit : « Une fuite, une tuile envolée après un coup de vent ? On vient voir votre toit sous 48 heures autour d’Épernay, et on vous dit franchement ce qu’il faut réparer. » Même métier, mais cette fois le client se reconnaît, et il sait quoi attendre.

## L’erreur à éviter

Les mots vides. « Leader », « qualité », « passion », « sur mesure », « professionnalisme » : tout le monde les emploie, donc ils ne disent plus rien. Remplacez chacun par un fait : ce que vous faites, comment, en combien de temps. Et n’écrivez jamais une promesse que vous ne pouvez pas tenir.

## À faire aujourd’hui

- Relisez le premier paragraphe de votre page d’accueil. Combien de « nous » ? Combien de « vous » ?
- Barrez tous les mots vides et remplacez-en un par un fait.
- Notez les trois questions que vos clients vous posent le plus : chacune mérite sa réponse sur le site.

## Pour aller plus loin

Écrire facilement, c’est une habitude qui s’apprend. La formation sur l’assistant qui écrit vous montre comment préparer un premier jet en quelques minutes, puis le reprendre avec votre voix. Pour les textes destinés à Google, voyez aussi le tuto sur la page que Google aime.`,
    faq: [
      { q: 'Faut-il vouvoyer ou tutoyer ses clients ?', a: 'Comme au comptoir. Le vouvoiement convient à la plupart des métiers. Le tutoiement peut coller à une marque très jeune, mais il doit être tenu sur tout le site.' },
      { q: 'Je n’aime pas écrire, par où commencer ?', a: 'Parlez au lieu d’écrire : expliquez votre métier à voix haute à un proche, enregistrez-vous, puis recopiez vos meilleures phrases. Elles seront plus naturelles que tout ce que vous auriez écrit à froid.' },
    ],
    voir: ['ecrire-une-page-que-google-aime', 'page-d-accueil-qui-donne-envie', 'bouton-qui-fait-appeler'],
  },
  {
    slug: 'bouton-qui-fait-appeler',
    groupe: 'site',
    icon: 'mouse-pointer-click',
    monstre: 'bricou',
    nom: 'Le bouton qui fait appeler',
    resume: 'Un seul bouton principal, un verbe clair, toujours à portée de pouce : l’appel à l’action qui marche.',
    duree: 10,
    niveau: 'Débutant',
    h1: 'Le bouton qui fait appeler : réussir son appel à l’action',
    title: 'Le bouton qui fait appeler vos clients | Les Minis Monstres',
    description: 'Un bon appel à l’action dit ce qui va se passer, se voit tout de suite et reste à portée de pouce. Comment écrire et placer le bouton principal de votre site.',
    lead: 'Un visiteur intéressé qui ne trouve pas comment vous joindre repart. Souvent chez un concurrent. Le bouton qui transforme une visite en appel est le détail le plus rentable de votre site.',
    body: `## Un appel à l’action, c’est quoi ?

Un **appel à l’action**, c’est le bouton ou le lien qui invite le visiteur à faire le pas suivant : appeler, réserver, demander un devis, commander. Sans lui, le visiteur doit chercher. Et il ne cherche pas longtemps.

## Les étapes

1. **Choisissez une seule action principale.** Celle qui vous amène le plus de clients. Pour un dépanneur, c’est souvent l’appel. Pour un traiteur, la demande de devis. Pour une boutique, la commande.
2. **Écrivez un verbe et son objet.** « Appeler l’atelier », « Réserver une table », « Demander un devis ». Le visiteur sait ce qui va se passer quand il touche le bouton. Bannissez « Envoyer », « Cliquez ici » et « En savoir plus ».
3. **Faites-le appeler pour de vrai.** Sur un site, un numéro peut être un lien : touché depuis un téléphone, il lance l’appel directement, sans avoir à recopier le numéro.
4. **Placez-le là où l’on décide.** En haut de la page, à la fin de chaque section importante, et en bas. Toujours avec le même texte et la même couleur.
5. **Rassurez juste à côté.** Une petite phrase vraie sous le bouton : « Réponse le jour même », « Devis gratuit », « Du lundi au samedi ». Seulement ce que vous tenez.

## Les formulaires : le plus court possible

Si votre action est un formulaire, chaque case en trop fait fuir quelqu’un. Nom, moyen de contact, message : c’est souvent assez. Le reste, vous le demanderez au téléphone.

## Un exemple

Prenons un exemple inventé. Paul est plombier. Son site affichait cinq boutons : « Nos services », « Contact », « Devis », « Urgence » et « Facebook ». Les visiteurs ne savaient pas lequel choisir.

Il garde un seul bouton principal, « Appeler Paul », qui lance l’appel depuis un téléphone. Il le place en haut, après ses services et en bas de page, avec dessous « Urgences du lundi au samedi ». Les autres liens restent, mais en plus discret.

## L’erreur à éviter

Mettre plusieurs boutons qui se battent. Quand tout est mis en avant, rien ne l’est. Un bouton principal bien visible, et éventuellement un second plus discret, suffisent.

## À faire aujourd’hui

- Choisissez votre action principale, et une seule.
- Réécrivez le texte de votre bouton avec un verbe et son objet.
- Depuis votre téléphone, touchez votre numéro sur le site : l’appel se lance-t-il ?

## Pour aller plus loin

Un bon bouton marche encore mieux avec une page d’accueil claire et des textes qui donnent envie : deux tutos de ce thème vous guident. Sur les sites créés avec Mini Site, l’action principale est choisie avec vous selon la façon dont vos clients vous contactent.`,
    faq: [
      { q: 'Faut-il un bouton WhatsApp ?', a: 'Seulement si vous répondez vraiment sur WhatsApp, rapidement. Un canal que vous ne suivez pas déçoit plus qu’il n’aide. Mieux vaut un seul moyen de contact bien tenu.' },
      { q: 'Quelle couleur pour le bouton ?', a: 'Une couleur qui ressort sur la page, avec un texte bien lisible dessus. Gardez-la pour les boutons seulement, pour que l’œil la repère tout de suite.' },
    ],
    voir: ['page-d-accueil-qui-donne-envie', 'ecrire-des-textes-qui-parlent-aux-clients', 'site-internet-auto-entrepreneur'],
  },
  {
    slug: 'heberger-son-site-en-securite',
    groupe: 'site',
    icon: 'server',
    monstre: 'dino',
    nom: 'Héberger son site, en sécurité',
    resume: 'Hébergement, cadenas, sauvegardes, mises à jour : ce qui garde votre site en ligne et à l’abri.',
    duree: 15,
    niveau: 'Intermédiaire',
    h1: 'Héberger son site et le garder en sécurité : les bases',
    title: 'Héberger son site en sécurité | Les Minis Monstres',
    description: 'Hébergement, cadenas https, sauvegardes, mises à jour, mots de passe : ce qui compte pour qu’un petit site reste en ligne, rapide et à l’abri des pirates.',
    lead: 'Un site doit vivre quelque part, sur un ordinateur allumé jour et nuit. Choisir cet endroit, et le protéger, ne demande pas d’être informaticien. Il suffit de savoir quoi regarder.',
    body: `## L’hébergement, c’est quoi ?

L’**hébergement**, c’est la location d’une place sur un **serveur**, un ordinateur qui reste allumé en permanence et qui envoie votre site à chaque visiteur. Sans hébergement, pas de site en ligne. Le nom de domaine, lui, est seulement l’adresse qui mène à cette place.

## Les grandes solutions

- **L’hébergement partagé** : votre site partage un serveur avec d’autres. C’est la solution la plus courante pour un petit site, simple et peu coûteuse.
- **Les créateurs de sites tout-en-un** : le site et l’hébergement viennent ensemble. Pratique, mais vérifiez si vous pouvez partir avec votre site le jour où vous changez.
- **Le serveur à soi** : puissant, mais il faut savoir l’entretenir. Rarement utile pour un commerce ou un artisan.

## Ce qui compte vraiment

1. **Le cadenas.** L’adresse de votre site doit commencer par https, avec le petit cadenas dans le navigateur. Le **certificat** qui permet ça est souvent offert par l’hébergeur. Sans lui, les navigateurs affichent un avertissement qui fait fuir.
2. **Des sauvegardes automatiques.** Une copie complète de votre site, faite régulièrement et gardée ailleurs que sur le même serveur. Demandez aussi comment on la remet en place : une sauvegarde qu’on ne sait pas restaurer ne sert à rien.
3. **Les mises à jour.** Le logiciel du site et ses extensions se mettent à jour pour boucher les failles. Un site oublié depuis des années est une cible facile.
4. **De bons mots de passe.** Un mot de passe long et unique pour l’accès au site, et la **double vérification** (un code reçu sur votre téléphone) partout où elle existe.
5. **Une aide qui répond.** En français, quand quelque chose ne va pas. C’est le jour où le site est en panne qu’on mesure ce point.

## Un exemple

Prenons un exemple inventé. Bastien est photographe. Son site, fait par un ami il y a des années, n’avait jamais été mis à jour. Un matin, des liens bizarres apparaissent sur ses pages : il a été piraté. Sans sauvegarde récente, il faut tout refaire.

Sur son nouveau site, il vérifie trois choses : le cadenas, une sauvegarde automatique chaque jour, et qui s’occupe des mises à jour.

## L’erreur à éviter

Ne pas savoir qui détient quoi. Le nom de domaine, l’accès à l’hébergement, les sauvegardes : tout doit être à votre nom, ou au moins accessible par vous. Le jour où le prestataire disparaît, vous ne devez pas perdre votre site.

## À faire aujourd’hui

- Vérifiez que votre site affiche bien le cadenas.
- Notez où se trouvent vos sauvegardes, et quand date la dernière.
- Activez la double vérification sur votre compte d’hébergement et sur votre boîte mail.

## Pour aller plus loin

Vous préférez ne pas vous en occuper ? Avec le forfait ${MINI}, l’hébergement, les copies de sécurité et les mises à jour sont gérés pour vous. Avec le forfait ${AUTO}, votre site vous est remis pour l’héberger où vous voulez. Le guide sur le nom de domaine complète ce tuto.`,
    faq: [
      { q: 'Mon site est petit, peut-il vraiment être piraté ?', a: 'Oui. La plupart des attaques ne visent personne en particulier : des programmes parcourent internet à la recherche de sites mal protégés. Un petit site non mis à jour est une proie facile.' },
      { q: 'Où doit se trouver mon hébergement ?', a: 'Un hébergement en Europe simplifie le respect des règles sur les données personnelles et rapproche le site de vos visiteurs. C’est un bon critère de choix pour un commerce français.' },
    ],
    voir: ['choisir-nom-de-domaine', 'site-rapide', 'mentions-legales-et-rgpd-sans-stress'],
  },
  {
    slug: 'site-rapide',
    groupe: 'site',
    icon: 'gauge',
    monstre: 'chaton',
    nom: 'Un site rapide',
    resume: 'Mesurer la vitesse de son site gratuitement, et les gestes simples qui la font gagner.',
    duree: 15,
    niveau: 'Intermédiaire',
    h1: 'Un site rapide : mesurer sa vitesse et la gagner',
    title: 'Un site rapide : mesurer et accélérer | Les Minis Monstres',
    description: 'Un site lent perd ses visiteurs avant qu’ils aient lu une ligne. Mesurer sa vitesse avec l’outil gratuit de Google, et les gestes simples pour l’accélérer.',
    lead: 'Sur un téléphone, dans la rue, avec un réseau moyen, chaque seconde d’attente compte. Un site rapide garde ses visiteurs, et Google en tient compte. Bonne nouvelle : la vitesse se mesure gratuitement.',
    body: `## À quoi ça sert

Un visiteur qui attend devant une page blanche part chercher ailleurs. Google le sait : la facilité d’utilisation d’une page, vitesse comprise, fait partie de ce qu’il regarde. Un site rapide, c’est donc plus de visiteurs qui restent, et un petit avantage sur Google.

## Mesurer, gratuitement

Cherchez « PageSpeed Insights », l’outil gratuit de Google, et collez l’adresse de votre site. Regardez l’onglet **mobile** en premier : c’est là que vos clients vous voient.

Google retient trois mesures, avec un objectif pour chacune, d’après son site de référence web.dev :

- **Le temps d’affichage du plus gros élément** du haut de page (souvent la grande photo) : 2,5 secondes au plus.
- **Le temps de réaction** quand on touche un bouton : 200 millisecondes au plus.
- **La stabilité** : la page ne doit pas sauter pendant qu’elle se charge, ce qui fait toucher le mauvais bouton.

## Les gestes qui font gagner

1. **Allégez les images.** C’est la cause la plus fréquente d’un site lent. Une photo de téléphone se réduit avant d’être mise en ligne, et le format WebP, plus léger, est lu par tous les navigateurs récents.
2. **Retirez ce qui ne sert pas.** Chaque extension, chaque vidéo intégrée, chaque fil de réseau social affiché sur la page ajoute du poids. Gardez l’utile.
3. **Pas de vidéo ni de carrousel en haut de page.** Une belle photo légère s’affiche bien plus vite.
4. **Un bon hébergement.** Un hébergeur lent freine tout le reste, quels que soient vos efforts.
5. **Testez sur votre propre téléphone**, en 4G, pas seulement sur le wifi de la maison.

## Un exemple

Prenons un exemple inventé. Lucie est fleuriste. Sa page d’accueil mettait longtemps à s’afficher. PageSpeed Insights pointe tout de suite la cause : sa grande photo de bouquet, prise au téléphone, pesait plusieurs mégaoctets.

Elle la réduit à une largeur raisonnable et l’enregistre en WebP. La photo semble identique à l’œil, mais elle est bien plus légère, et la page s’affiche presque instantanément.

## L’erreur à éviter

Courir après la note parfaite. Le chiffre sur 100 de PageSpeed Insights est un repère, pas un but. Ce qui compte, ce sont les trois mesures et le ressenti sur un vrai téléphone. Mieux vaut un site sobre et rapide qu’une course aux réglages.

## À faire aujourd’hui

- Testez votre page d’accueil dans PageSpeed Insights, onglet mobile.
- Notez les trois mesures et leur couleur : vert, orange ou rouge.
- Repérez la plus grosse image de votre page d’accueil et allégez-la.

## Pour aller plus loin

La vitesse dépend beaucoup des photos et de l’hébergement : les tutos sur les belles photos et sur l’hébergement vous aident sur ces deux points. Les sites Mini Site sont construits légers dès le départ, sans carrousel ni vidéo qui démarre seule.`,
    faq: [
      { q: 'Mon site est rapide chez moi, pourquoi l’outil dit-il le contraire ?', a: 'Chez vous, le site est souvent déjà en mémoire et le wifi est bon. L’outil simule un téléphone et un réseau moyen, comme ceux de vos clients dans la rue.' },
      { q: 'Faut-il refaire tout son site pour le rendre rapide ?', a: 'Rarement. Alléger les images et retirer ce qui ne sert pas règle déjà une grande partie des problèmes. Commencez par là, puis mesurez de nouveau.' },
    ],
    voir: ['belles-photos-avec-son-telephone', 'heberger-son-site-en-securite', 'comment-google-choisit-qui-il-montre'],
  },
  {
    slug: 'mentions-legales-et-rgpd-sans-stress',
    groupe: 'site',
    icon: 'scale',
    monstre: 'clin',
    nom: 'Mentions légales et RGPD, sans stress',
    resume: 'Les informations obligatoires sur un site pro, la confidentialité et les cookies : l’essentiel, vérifié.',
    duree: 20,
    niveau: 'Intermédiaire',
    h1: 'Mentions légales et RGPD : ce qui est obligatoire sur votre site',
    title: 'Mentions légales et RGPD sans stress | Les Minis Monstres',
    description: 'Mentions légales, politique de confidentialité, cookies : ce que la loi impose vraiment sur le site d’un professionnel, d’après les sources officielles.',
    lead: 'Les mots « mentions légales » et « RGPD » font peur. Pourtant, pour un petit site, l’essentiel tient sur deux pages bien remplies. Voici ce qui est obligatoire, d’après les sources officielles.',
    body: `## À quoi ça sert

Ces pages disent qui se cache derrière le site et ce que vous faites des informations de vos visiteurs. Elles protègent vos clients, et vous protègent aussi : selon Service-Public, l’absence des mentions obligatoires peut coûter jusqu’à 75 000 € d’amende à un entrepreneur individuel.

## Les mentions légales

D’après la page officielle de Service-Public (entreprendre.service-public.gouv.fr), un entrepreneur individuel indique sur son site :

1. **Son identité** : nom et prénom, avec la mention « entrepreneur individuel » ou « EI ».
2. **Ses coordonnées** : adresse, e-mail et téléphone.
3. **Son numéro d’immatriculation** : au registre national des entreprises (RNE), et au registre du commerce (RCS) pour une activité commerciale.
4. **Son numéro de TVA**, s’il en a un.
5. **L’hébergeur du site** : son nom, son adresse et son téléphone.

S’y ajoutent, selon les cas, le nom du responsable de la publication, et pour une profession réglementée, votre titre et l’ordre auquel vous êtes inscrit. Pour une société, les informations diffèrent un peu : vérifiez sur la même page officielle.

## La politique de confidentialité

Dès que votre site recueille des informations personnelles, par exemple avec un formulaire de contact, le **RGPD** (le règlement européen sur les données personnelles) vous demande d’informer vos visiteurs. Une page simple suffit :

- quelles informations vous recueillez, et pourquoi ;
- combien de temps vous les gardez ;
- comment demander à les consulter, les corriger ou les effacer.

Ne demandez que ce dont vous avez besoin. Une date de naissance n’a rien à faire dans un formulaire de devis.

## Les cookies

Un **cookie** est un petit fichier déposé par le site dans le navigateur du visiteur. Selon la CNIL, les traceurs publicitaires demandent l’accord préalable du visiteur. Le bandeau doit alors permettre de refuser aussi facilement que d’accepter. Certains outils de mesure d’audience peuvent s’en passer, à des conditions strictes fixées par la CNIL.

Le plus simple reste de ne rien ajouter d’inutile : une carte, une vidéo ou un fil de réseau social intégrés peuvent déposer des cookies à votre insu.

## Vous vendez à des particuliers ?

Il faut en plus des **conditions générales de vente** visibles sur le site, et la possibilité pour vos clients de recourir gratuitement à un **médiateur de la consommation**, que vous indiquez.

## Un exemple

Prenons un exemple inventé. Amandine est esthéticienne. Sa page de mentions légales oubliait l’hébergeur, et son formulaire de rendez-vous demandait la date de naissance. Elle ajoute les coordonnées de l’hébergeur, retire le champ inutile, et écrit sous le formulaire une phrase qui renvoie vers sa politique de confidentialité.

## L’erreur à éviter

Copier les mentions d’un autre site. Elles contiennent ses informations, son hébergeur, ses choix. Une page copiée est fausse pour vous, et donc inutile le jour où on vous la demande.

## À faire aujourd’hui

- Vérifiez que vos mentions légales contiennent les cinq informations ci-dessus.
- Listez les informations que demande votre formulaire, et retirez celles qui ne servent pas.
- Repérez ce que votre site intègre de l’extérieur : carte, vidéo, fil de réseau social.

## Pour aller plus loin

Ce tuto donne les bases, pas un conseil juridique : pour un cas particulier, les sites de Service-Public et de la CNIL font foi. Sur les sites que nous créons, les pages légales sont préparées avec vos informations, et aucun traceur publicitaire n’est ajouté.`,
    faq: [
      { q: 'Un site sans formulaire a-t-il besoin d’une politique de confidentialité ?', a: 'Dès que le site recueille ou traite des informations personnelles, même par un outil intégré, il faut informer les visiteurs. Une page courte et honnête est la solution la plus sûre.' },
      { q: 'Où placer ces pages ?', a: 'Dans le pied de page, sur toutes les pages du site, avec des liens bien lisibles. Le visiteur doit les trouver sans chercher.' },
    ],
    voir: ['heberger-son-site-en-securite', 'creer-boutique-en-ligne', 'site-internet-auto-entrepreneur'],
  },
];
