// Mini Tuto, thème « clients » : voir le format dans ./index.js.
// Consigne d'Alex (24 novembre 2026) : un tuto explique vite l'essentiel (400 à 700 mots), sans tout dire ;
// la grande formation liée (champ formation, omis quand rien n'est lié) dit tout ce qu'il faut savoir.
// Sources vérifiées en novembre 2026 : affichage des prix en euros TTC (economie.gouv.fr, service-public.fr) ;
// prospection par courrier électronique, consentement et désinscription (cnil.fr, fiche « La prospection commerciale
// par courrier électronique »).
module.exports = [
  {
    slug: 'bon-stand-marche-salon',
    groupe: 'clients',
    icon: 'store',
    monstre: 'mochi',
    nom: 'Avoir un bon stand sur un marché',
    resume: 'Se voir de loin, afficher ses prix, donner envie de toucher : le stand qui arrête les passants.',
    duree: 15,
    niveau: 'Débutant',
    h1: 'Avoir un bon stand sur un marché ou un salon',
    title: 'Un bon stand sur un marché ou un salon | Les Minis Monstres',
    description: 'Un stand qui se voit de loin, des prix affichés, des produits à hauteur des yeux et un moyen de vous retrouver après : la méthode pour un marché ou un salon.',
    lead: 'Sur un marché, vous avez quelques secondes pour arrêter quelqu’un qui passe. Un bon stand se voit de loin, se comprend tout de suite et donne envie de s’approcher.',
    body: `## À quoi ça sert

Un marché, un salon ou une fête de village, c’est une vitrine éphémère. Des dizaines de personnes passent devant vous sans vous connaître. Le stand doit répondre en un coup d’œil à deux questions : qu’est-ce que vous vendez, et est-ce pour moi ?

## Les étapes

1. **Une enseigne visible de loin.** Le nom de votre activité et votre métier, en grosses lettres, placés en hauteur. Une banderole, une ardoise sur un pied ou un drapeau suffit.
2. **Des prix affichés partout.** C’est obligatoire : les prix doivent être indiqués en euros, toutes taxes comprises, de façon visible. C’est aussi ce qui rassure : beaucoup de gens n’osent pas demander.
3. **Des niveaux.** Ne posez pas tout à plat. Avec des caisses, des présentoirs ou des paniers, placez vos plus beaux produits à hauteur des yeux.
4. **Laissez toucher et goûter.** Un échantillon, un produit à prendre en main, une démonstration : on achète plus volontiers ce qu’on a essayé.
5. **Prévoyez la suite.** Cartes de visite, QR code vers votre site ou vos réseaux : celui qui n’achète pas aujourd’hui doit pouvoir vous retrouver demain.

## Votre attitude compte autant que le stand

- Restez debout, devant ou à côté de la table, pas assis derrière.
- Rangez le téléphone : un vendeur penché sur son écran semble fermé.
- Dites bonjour, puis laissez regarder. Une question ouverte suffit : « Vous connaissez notre savon au lait d’ânesse ? »

## Un exemple

Prenons Lucie, une savonnière imaginée pour ce tuto. À son premier marché, ses savons étaient alignés à plat, sans prix, et elle attendait assise. Au suivant : une ardoise « Savons artisanaux des Ardennes » en hauteur, trois niveaux de caisses en bois, une étiquette prix sur chaque sorte, et un savon à sentir. Les passants s’arrêtent, sentent, et demandent son site.

## L’erreur à éviter

**Ne rien prévoir pour après.** Beaucoup de visiteurs repartent sans acheter, juste parce que ce n’est pas le bon jour. Sans carte ni QR code, ils vous ont oublié le soir même.

## À faire aujourd’hui

- Préparer une enseigne lisible à dix pas
- Faire une étiquette prix pour chaque produit
- Trouver trois caisses ou présentoirs pour créer des niveaux
- Imprimer des cartes avec un QR code vers votre site
- Prévoir un échantillon ou une démonstration

## Pour aller plus loin

Un marché réussi, c’est aussi ce qui se passe après : les contacts récoltés, les clients qui reviennent, les commandes qui arrivent en ligne. Le tuto sur [la carte de visite et le QR code](/mini-tuto/carte-de-visite-qr-code/) vous aide à ne laisser filer personne.`,
    faq: [
      { q: 'Faut-il accepter la carte bancaire sur un marché ?', a: 'Ce n’est pas obligatoire, mais beaucoup de clients n’ont plus d’espèces sur eux. Un petit terminal de paiement évite de perdre des ventes.' },
      { q: 'Peut-on afficher « prix sur demande » ?', a: 'Non pour les produits exposés à la vente : le prix doit être visible. Pour une prestation sur mesure, indiquez au moins un prix de départ.' },
    ],
    voir: ['carte-de-visite-qr-code', 'fixer-ses-prix', 'petite-etude-de-marche'],
  },
  {
    slug: 'petite-etude-de-marche',
    groupe: 'clients',
    icon: 'target',
    monstre: 'champi',
    nom: 'Une petite étude de marché simple',
    resume: 'Savoir qui sont vos clients, où ils sont et ce que font vos concurrents, en une après-midi.',
    duree: 20,
    niveau: 'Intermédiaire',
    h1: 'Trouver le bon marché et ses clients : une petite étude de marché simple',
    title: 'Une étude de marché simple en une après-midi | Les Minis Monstres',
    description: 'Une étude de marché à votre taille : décrire votre client, repérer vos concurrents, poser cinq questions et tester avant d’investir. Sans tableur ni jargon.',
    lead: 'Une étude de marché, ce n’est pas un dossier de cinquante pages. Pour un petit commerce, c’est surtout répondre honnêtement à trois questions avant de se lancer, ou avant de lancer un nouveau produit.',
    body: `## À quoi ça sert

Une **étude de marché**, c’est vérifier qu’il existe des gens prêts à acheter ce que vous proposez, là où vous êtes, au prix que vous visez. Elle vous évite d’investir dans un stock, un local ou un salon qui ne vous convient pas.

## Les étapes

1. **Décrivez votre client idéal.** Qui est-il, où habite-t-il, qu’est-ce qui l’embête aujourd’hui, combien est-il prêt à payer ? Écrivez-le en quelques lignes, comme un portrait.
2. **Regardez vos concurrents.** Tapez votre métier et votre ville sur Google et sur Google Maps. Notez trois à cinq concurrents : leurs prix, leurs horaires, ce que disent leurs avis clients. Les avis négatifs sont une mine d’or : ils disent ce que les clients ne trouvent pas.
3. **Posez cinq questions à de vrais gens.** Pas à votre famille, qui sera gentille : à des clients possibles. Par exemple : comment faites-vous aujourd’hui ? qu’est-ce qui vous manque ? où achetez-vous ? combien payez-vous ? me recommanderiez-vous à quelqu’un ?
4. **Trouvez où sont vos clients.** Quel marché, quel salon, quel quartier, quel groupe Facebook local ? Allez-y d’abord en visiteur, et regardez qui achète quoi.
5. **Testez petit avant d’investir.** Une table sur un marché, une précommande, une petite série : les premières ventes valent mieux que toutes les hypothèses.

> **Une source gratuite** : le site de l’Insee publie des chiffres sur la population de chaque commune (âge, nombre de familles). Utile pour savoir si votre ville compte assez de clients pour votre activité.

## Un exemple

Prenons Hugo, qui veut ouvrir une épicerie vrac, exemple imaginé pour ce tuto. Il repère deux concurrents dans un rayon de vingt kilomètres et lit leurs avis : on regrette des horaires trop courts le samedi. Il interroge quinze personnes sur le marché du dimanche. Il teste trois mois avec un stand avant de signer un bail. Il ouvre avec des horaires tardifs le samedi, ce qui manquait.

## L’erreur à éviter

**Ne demander l’avis qu’à ses proches.** Ils vous aiment, ils vous diront que c’est une super idée. Seules les personnes qui ne vous doivent rien vous diront la vérité, et seules les ventes la confirment.

## À faire aujourd’hui

- Écrire le portrait de votre client idéal en cinq lignes
- Noter trois concurrents, leurs prix et ce que disent leurs avis
- Préparer vos cinq questions
- Choisir l’endroit où vous irez les poser cette semaine

## Pour aller plus loin

Votre étude vous dit à qui vous parlez. Il reste à fixer le bon prix : le tuto [fixer ses prix sans se brader](/mini-tuto/fixer-ses-prix/) prend le relais, chiffres à la main.`,
    faq: [
      { q: 'Faut-il payer quelqu’un pour faire une étude de marché ?', a: 'Pas pour démarrer une petite activité. Une après-midi de recherche et quelques conversations avec de vrais clients apportent déjà l’essentiel.' },
    ],
    voir: ['fixer-ses-prix', 'bon-stand-marche-salon', 'site-internet-auto-entrepreneur'],
  },
  {
    slug: 'fixer-ses-prix',
    groupe: 'clients',
    icon: 'euro',
    monstre: 'champi',
    nom: 'Fixer ses prix sans se brader',
    resume: 'Calculer ce que vous coûte vraiment un produit ou une heure, puis choisir un prix qui vous fait vivre.',
    duree: 20,
    niveau: 'Intermédiaire',
    h1: 'Fixer ses prix sans se brader : la méthode simple',
    title: 'Fixer ses prix sans se brader | Les Minis Monstres',
    description: 'Compter vos vrais coûts, payer votre temps, regarder le marché, puis choisir votre prix et le présenter sans gêne : la méthode pour artisans et commerçants.',
    lead: 'Beaucoup d’indépendants fixent leurs prix en regardant le voisin, puis en enlevant un peu « pour être sûr ». Résultat : on travaille beaucoup et on gagne peu. Voici comment partir de vos vrais chiffres.',
    body: `## À quoi ça sert

Un prix trop bas ne fait pas venir plus de clients à coup sûr. Il fait surtout travailler plus pour gagner moins, et il peut même faire douter de la qualité. Un prix juste paie vos matières, votre temps et vos charges, puis laisse une marge pour vivre et investir.

## Les étapes

1. **Comptez le coût des matières.** Tout ce qui entre dans le produit ou la prestation : ingrédients, tissu, pièces, emballage, déplacement.
2. **Comptez votre temps.** Combien de temps vous prend ce produit, préparation et rangement compris ? Multipliez par ce que vous voulez gagner de l’heure. Votre temps n’est jamais gratuit.
3. **Ajoutez vos frais fixes.** Loyer, assurance, téléphone, site internet, cotisations : faites le total du mois, puis répartissez-le sur ce que vous vendez dans un mois.
4. **Regardez le marché.** Les prix de vos concurrents vous donnent une fourchette. Ils ne fixent pas votre prix : ils vous disent comment l’expliquer.
5. **Choisissez, puis expliquez.** Si vous êtes plus cher, dites pourquoi : fait main, local, sur mesure, garanti, livré. Les clients paient volontiers ce qu’ils comprennent.

> **Rappel** : les prix affichés pour les particuliers sont toujours toutes taxes comprises. Si vous êtes à la TVA, ajoutez-la à votre calcul avant d’afficher le prix.

## Un exemple

Prenons Camille, une céramiste imaginée pour ce tuto. Elle vendait ses bols au même prix qu’une boutique de décoration. En comptant la terre, l’émail, la cuisson, ses heures au tour et une part de son loyer d’atelier, elle découvre qu’elle perd de l’argent sur chaque bol. Elle remonte son prix, et l’explique sur son étiquette : « Tourné à la main dans les Ardennes, pièce unique ». Elle vend un peu moins de bols, mais elle gagne enfin sa vie.

## L’erreur à éviter

**Oublier son propre temps.** C’est l’erreur la plus fréquente chez les artisans : on compte les matières, jamais les heures. Si votre prix ne paie pas votre temps, chaque vente vous coûte.

## À faire aujourd’hui

- Choisir votre produit ou service le plus vendu
- Calculer ses matières, votre temps et sa part de frais fixes
- Comparer le total avec votre prix actuel
- Écrire une phrase qui explique ce qui fait votre valeur

## Pour aller plus loin

Un bon prix se défend mieux quand il est bien présenté, sur une étiquette comme sur votre site. Pour le montrer au bon endroit, le tuto [avoir un bon stand sur un marché](/mini-tuto/bon-stand-marche-salon/) et le guide sur [le prix d’un site internet](/guides/prix-site-internet/) vous donnent des repères.`,
    faq: [
      { q: 'Puis-je augmenter mes prix sans perdre mes clients ?', a: 'Oui, si vous prévenez à l’avance et si vous expliquez ce qui change (matières, temps, qualité). Les clients fidèles comprennent souvent mieux qu’on ne le croit.' },
      { q: 'Faut-il faire des remises pour démarrer ?', a: 'Une offre de lancement courte peut aider, mais affichez toujours le vrai prix à côté, pour que le client sache ce qu’il paiera ensuite.' },
    ],
    voir: ['petite-etude-de-marche', 'faire-revenir-ses-clients', 'prix-site-internet'],
  },
  {
    slug: 'carte-de-visite-qr-code',
    groupe: 'clients',
    icon: 'qr-code',
    monstre: 'bricou',
    nom: 'La carte de visite et le QR code',
    resume: 'Une carte claire et un QR code qui mène au bon endroit : votre site, vos avis ou votre contact.',
    duree: 15,
    niveau: 'Débutant',
    h1: 'La carte de visite et le QR code qui travaillent pour vous',
    title: 'Carte de visite et QR code qui travaillent | Les Minis Monstres',
    description: 'Ce qu’il faut sur une carte de visite, où placer un QR code et vers quoi le faire pointer (site, avis Google, contact) pour que chaque carte donnée rapporte.',
    lead: 'Une carte de visite finit souvent dans un tiroir. Avec les bonnes informations et un QR code bien choisi, elle devient un raccourci vers votre site, votre téléphone ou vos avis.',
    body: `## À quoi ça sert

La carte de visite reste l’objet le plus simple pour laisser une trace : sur un marché, chez un client, avec une commande. Le **QR code**, ce petit carré noir et blanc qu’on scanne avec l’appareil photo du téléphone, ajoute un raccourci : plus besoin de taper une adresse.

## Les étapes

1. **L’essentiel au recto** : votre nom, votre métier en clair, votre téléphone. Le client doit comprendre ce que vous faites sans retourner la carte.
2. **Le reste au verso** : adresse mail, site internet, zone d’intervention ou adresse, horaires si vous avez une boutique.
3. **Un QR code, une seule destination.** Choisissez ce qui vous sert le plus : votre site, votre page de contact, ou la page pour laisser un avis Google.
4. **Testez le QR code** avec deux téléphones différents avant d’imprimer. Une carte imprimée avec un QR code cassé, c’est tout le paquet à refaire.
5. **Écrivez à côté ce qu’il fait** : « Scannez pour voir nos réalisations » ou « Votre avis nous aide ». Sans phrase, peu de gens le scannent.

## Où placer d’autres QR codes

- Sur la vitrine ou la porte : vers vos horaires et votre site.
- Sur le comptoir, près de la caisse : vers la page d’avis Google.
- Sur vos devis et factures : vers vos réalisations.
- Sur les emballages : vers vos réseaux ou votre boutique en ligne.

## Un exemple

Prenons Antoine, un paysagiste imaginé pour ce tuto. Sa carte affiche au recto « Antoine Lemaire, paysagiste, Charleville » et son numéro. Au verso, un QR code vers les photos de ses jardins, avec « Scannez pour voir nos jardins ». Il laisse aussi un petit carton à chaque fin de chantier, avec un deuxième QR code vers la page d’avis Google. C’est exactement ce que prépare l’outil « Mes avis Google » : le lien, le QR code et le message à envoyer.

## L’erreur à éviter

**Un QR code vers une page qui changera.** Si le code mène à une publication Facebook ou à une promotion du mois, il sera inutile dans six mois. Faites-le pointer vers une adresse stable, comme votre site internet.

## À faire aujourd’hui

- Relire votre carte : métier et téléphone visibles au recto ?
- Choisir la destination de votre QR code
- Créer le QR code et le tester sur deux téléphones
- Ajouter la phrase qui donne envie de le scanner
- Prévoir un QR code d’avis pour votre comptoir

## Pour aller plus loin

Un QR code qui mène à un site clair, c’est un client de plus qui vous comprend en dix secondes. Si vous n’avez pas encore de site, [Mini Site](/creer-mon-site/) vous en prépare un, et le guide sur [la fiche Google](/guides/fiche-google-entreprise/) vous aide à récolter vos premiers avis.`,
    faq: [
      { q: 'Un QR code est-il gratuit ?', a: 'Oui, on peut en créer gratuitement. Préférez un QR code « statique », qui pointe directement vers votre adresse, plutôt qu’un service qui peut cesser de fonctionner.' },
      { q: 'Quelle taille pour le QR code sur une carte ?', a: 'Assez grand pour être scanné facilement, et entouré d’une marge blanche. Testez toujours sur l’épreuve avant d’imprimer en nombre.' },
    ],
    voir: ['bon-stand-marche-salon', 'bouche-a-oreille-parrainage', 'fiche-google-entreprise'],
  },
  {
    slug: 'faire-revenir-ses-clients',
    groupe: 'clients',
    icon: 'repeat',
    monstre: 'mochi',
    nom: 'Faire revenir ses clients',
    resume: 'Se souvenir d’eux, les remercier et leur donner une raison de revenir : la fidélité sans usine à gaz.',
    duree: 15,
    niveau: 'Débutant',
    formation: 'formation-monter-sa-petite-bande',
    h1: 'Faire revenir ses clients : la fidélité simple',
    title: 'Faire revenir ses clients, simplement | Les Minis Monstres',
    description: 'Un fichier clients simple, une carte de fidélité claire, un merci et une relance au bon moment : les gestes qui font revenir vos clients sans dépenser beaucoup.',
    lead: 'Un client qui revient vous connaît déjà, vous fait confiance et parle de vous. Le faire revenir demande souvent moins d’efforts qu’en trouver un nouveau. Encore faut-il y penser.',
    body: `## À quoi ça sert

La fidélité, c’est ce qui rend une activité solide : des clients qui reviennent en saison, qui recommandent, qui pardonnent un petit retard. Elle ne se décrète pas, elle se construit par de petits gestes répétés.

## Les étapes

1. **Notez vos clients.** Un simple carnet ou un tableau suffit : le prénom, le contact, ce qu’ils ont acheté, la date. Demandez toujours l’accord avant de garder une adresse mail ou un numéro pour leur écrire.
2. **Dites merci.** Un mot dans le colis, un message après une prestation, un « à bientôt » sincère. Ce qui est rare se remarque.
3. **Proposez une carte de fidélité claire.** Une règle simple à retenir : « la dixième coupe offerte », « le cinquième café offert ». Plus c’est simple, plus ça marche.
4. **Relancez au bon moment.** Un ramonage chaque année, un entretien de chaudière, une coupe toutes les six semaines, la saison des bulbes : envoyez un message quand le besoin revient.
5. **Soignez le moment après l’achat.** Une question, un souci, un retour : la façon dont vous réagissez fait revenir, ou fait fuir.

## Trois attentions qui marquent

- **Se souvenir d’un détail** : le prénom du chien, la couleur préférée, le chantier d’il y a deux ans.
- **Prévenir avant les autres** : vos fidèles découvrent la nouveauté ou la date de fermeture en premier.
- **Un petit plus sans le dire** : un échantillon glissé dans le sac, une retouche offerte. On s’en souvient longtemps.

## Un exemple

Prenons Élodie, une coiffeuse imaginée pour ce tuto. Dans son carnet, elle note la date de chaque coupe. Cinq semaines plus tard, elle envoie un message court : « Bonjour Martine, ça fait cinq semaines, on cale votre prochaine coupe ? » Avec sa carte « la dixième coupe à moitié prix », ses clientes ont deux bonnes raisons de revenir chez elle plutôt qu’ailleurs.

## L’erreur à éviter

**Récompenser seulement les nouveaux clients.** Une grosse remise de bienvenue que les fidèles n’ont jamais eue peut les vexer. Gardez vos plus belles attentions pour ceux qui reviennent.

## À faire aujourd’hui

- Ouvrir un carnet ou un tableau de vos clients
- Écrire votre message de remerciement type
- Choisir la règle de votre carte de fidélité
- Repérer quels clients relancer ce mois-ci

## Pour aller plus loin

Relancer chaque client au bon moment, c’est facile avec dix clients et difficile avec deux cents. La grande formation liée à ce tuto vous montre comment confier ces relances à une petite bande de monstres, qui les prépare pour vous au bon moment.`,
    faq: [
      { q: 'Une carte de fidélité papier suffit-elle ?', a: 'Oui, pour commencer. Elle coûte peu et tout le monde la comprend. Gardez aussi la trace dans votre carnet, au cas où le client la perd.' },
      { q: 'Peut-on envoyer des messages à ses clients sans leur demander ?', a: 'Pour un message commercial par mail ou SMS, demandez leur accord ou, au minimum, informez-les et proposez toujours un moyen simple de ne plus en recevoir. La CNIL détaille ces règles.' },
    ],
    voir: ['bouche-a-oreille-parrainage', 'lettre-information-simple', 'fixer-ses-prix'],
  },
  {
    slug: 'bouche-a-oreille-parrainage',
    groupe: 'clients',
    icon: 'users',
    monstre: 'ravie',
    nom: 'Le bouche-à-oreille et le parrainage',
    resume: 'Donner à vos clients contents l’envie et les moyens de parler de vous.',
    duree: 15,
    niveau: 'Débutant',
    formation: 'formation-monter-sa-petite-bande',
    h1: 'Le bouche-à-oreille et le parrainage : faire parler de soi',
    title: 'Bouche-à-oreille et parrainage | Les Minis Monstres',
    description: 'Le bouche-à-oreille se provoque : demander au bon moment, faciliter la recommandation, récolter des avis Google et lancer un parrainage simple et honnête.',
    lead: 'Vos clients contents parlent de vous, parfois. Pour qu’ils le fassent plus souvent, il suffit de leur demander au bon moment et de leur rendre la chose facile.',
    body: `## À quoi ça sert

Une recommandation d’un proche vaut plus que n’importe quelle publicité : celui qui arrive a déjà confiance. Le bouche-à-oreille se travaille, avec trois outils : la demande, les avis en ligne et le parrainage.

## Les étapes

1. **Demandez au bon moment.** Juste après un compliment, à la livraison, à la fin d’un chantier réussi. « Ça me ferait plaisir que vous parliez de moi autour de vous. » Simple et sincère.
2. **Donnez de quoi recommander.** Deux ou trois cartes de visite à donner, un lien facile à partager par message.
3. **Demandez un avis Google.** Un avis, c’est du bouche-à-oreille visible par tous. Envoyez le lien direct le jour même, tant que le souvenir est frais.
4. **Lancez un parrainage simple.** Le client qui vous envoie un ami reçoit un petit cadeau, et l’ami aussi. Une règle claire, écrite sur une carte ou sur votre site.
5. **Remerciez chaque recommandation.** Un message à celui qui vous a recommandé, même s’il n’y a pas de parrainage en jeu.

> **Restez honnête** : on ne paie jamais un avis et on n’en écrit pas soi-même. Le parrainage récompense une recommandation, jamais une note.

## Idées de cadeaux de parrainage

- Une petite remise sur la prochaine commande.
- Un produit offert, un échantillon, une prestation courte.
- Un service en plus : livraison offerte, petit entretien gratuit.

## Un exemple

Prenons Bastien, un électricien imaginé pour ce tuto. À la fin de chaque chantier, il laisse deux cartes « Un voisin a besoin d’un électricien ? Donnez-lui ma carte ». Le soir même, il envoie le lien pour laisser un avis Google. Pour chaque nouveau client recommandé, le parrain reçoit un contrôle gratuit de son tableau électrique. Ses clients deviennent ses meilleurs vendeurs.

## L’erreur à éviter

**Attendre que ça vienne tout seul.** Même ravis, la plupart des clients n’y pensent pas. Ils ne refusent pas de recommander : on ne le leur a simplement pas demandé.

## À faire aujourd’hui

- Écrire votre phrase pour demander une recommandation
- Préparer le lien direct vers votre page d’avis Google
- Choisir un cadeau de parrainage simple
- Demander un avis aux trois derniers clients contents

## Pour aller plus loin

Demander un avis à chaque client, répondre à chaque avis, relancer ceux qui oublient : c’est là que tout se joue. Notre outil « Mes avis Google » prépare le lien, le QR code et les réponses, et la grande formation liée à ce tuto vous montre comment organiser ces demandes sans y penser.`,
    faq: [
      { q: 'Peut-on offrir un cadeau en échange d’un avis Google ?', a: 'Non. Google interdit d’offrir une contrepartie en échange d’un avis. Le cadeau de parrainage récompense un nouveau client recommandé, pas une note.' },
      { q: 'Comment répondre à un avis négatif ?', a: 'Calmement, rapidement et sans vous justifier longuement : remerciez, reconnaissez le souci, proposez une solution. Les futurs clients lisent surtout votre réponse.' },
    ],
    voir: ['carte-de-visite-qr-code', 'faire-revenir-ses-clients', 'fiche-google-entreprise'],
  },
  {
    slug: 'repondre-vite-demande-client',
    groupe: 'clients',
    icon: 'message-square-reply',
    monstre: 'mascotte',
    nom: 'Répondre vite et bien à une demande',
    resume: 'Un appel, un mail ou un message : la réponse qui rassure et qui transforme une demande en client.',
    duree: 10,
    niveau: 'Débutant',
    formation: 'formation-assistant-qui-ecrit',
    h1: 'Répondre vite et bien à une demande de client',
    title: 'Répondre vite et bien à une demande client | Les Minis Monstres',
    description: 'Accuser réception, poser les bonnes questions, donner un délai et relancer : la méthode pour transformer une demande de devis ou un message en vrai client.',
    lead: 'Quand quelqu’un vous demande un devis, il écrit souvent à plusieurs professionnels en même temps. Celui qui répond le premier, clairement, part avec une longueur d’avance.',
    body: `## À quoi ça sert

Une demande, c’est un client qui lève la main. S’il attend trop, il en choisit un autre. Une réponse rapide montre que vous êtes sérieux et disponible, avant même de parler de prix.

## Les étapes

1. **Accusez réception tout de suite.** Même si vous ne pouvez pas répondre sur le fond : « Merci pour votre message, je regarde et je vous réponds demain avant midi. » Le client sait qu’il a été entendu.
2. **Posez les bonnes questions.** Ce qu’il vous faut vraiment pour répondre : photos, dimensions, date souhaitée, adresse, budget. Toutes d’un coup, pas une par jour.
3. **Donnez un délai, et tenez-le.** Une date précise rassure plus qu’une réponse vague.
4. **Répondez clairement.** Ce que vous proposez, le prix, le délai, la suite. Une réponse courte et nette vaut mieux qu’un long texte.
5. **Relancez une fois.** Pas de nouvelles au bout de quelques jours ? Un message poli : « Avez-vous pu regarder ma proposition ? Je reste disponible pour en parler. » Beaucoup de clients oublient simplement de répondre.

## Une réponse en quatre parties

- **Merci** pour la demande.
- **Ce que j’ai compris** de votre besoin, en une phrase.
- **Ce que je propose** et le prix, ou ce qu’il me manque pour le donner.
- **La suite** : quand et comment on avance.

## Un exemple

Prenons Fatou, une traiteuse imaginée pour ce tuto. Un vendredi soir, elle reçoit une demande pour un buffet de mariage. Elle répond dans l’heure : « Merci ! Pour vous faire une proposition, il me faut le nombre d’invités, la date et le lieu. Je vous envoie un devis lundi. » Lundi, le devis part comme promis. Le mercredi suivant, une relance courte. Les mariés signent : elle était la seule à avoir répondu le week-end.

## L’erreur à éviter

**Laisser une demande sans réponse parce qu’on n’a pas encore le prix.** Le silence est la pire des réponses. Un accusé de réception avec un délai suffit à garder le client.

## À faire aujourd’hui

- Écrire votre message d’accusé de réception
- Lister les questions à poser pour vos demandes les plus fréquentes
- Répondre aux demandes en attente, même brièvement
- Noter dans l’agenda une relance pour chaque devis envoyé

## Pour aller plus loin

Écrire une bonne réponse prend du temps, surtout le soir après le travail. La grande formation liée à ce tuto vous montre comment avoir vos réponses, devis et relances écrits pour vous, dans votre style, et prêts à envoyer. Pour les messages, le tuto [WhatsApp Business](/mini-tuto/whatsapp-business-repondre-vite/) aide déjà beaucoup.`,
    faq: [
      { q: 'Faut-il répondre le week-end ?', a: 'Pas forcément sur le fond. Mais un court message d’accusé de réception, ou un message d’absence automatique, évite que le client parte voir ailleurs.' },
      { q: 'Combien de fois relancer ?', a: 'Une relance polie, éventuellement une deuxième une semaine plus tard. Au-delà, le client a sa réponse, et vous pouvez passer à autre chose.' },
    ],
    voir: ['whatsapp-business-repondre-vite', 'faire-revenir-ses-clients', 'lettre-information-simple'],
  },
  {
    slug: 'lettre-information-simple',
    groupe: 'clients',
    icon: 'mail',
    monstre: 'chaton',
    nom: 'Une lettre d’information simple',
    resume: 'Un mail de temps en temps à vos clients : quoi écrire, à qui, et les règles à respecter.',
    duree: 20,
    niveau: 'Intermédiaire',
    formation: 'formation-assistant-qui-ecrit',
    h1: 'Une lettre d’information simple pour garder le lien avec ses clients',
    title: 'Une lettre d’information simple et efficace | Les Minis Monstres',
    description: 'Une lettre d’information courte, utile et régulière garde le lien avec vos clients. Qui inscrire, quoi écrire, à quel rythme, et les règles de la CNIL.',
    lead: 'Vos clients ne voient pas toutes vos publications sur les réseaux. Un mail, lui, arrive dans leur boîte. Une lettre d’information courte et utile garde le lien, sans dépendre d’un réseau.',
    body: `## À quoi ça sert

Une **lettre d’information** (on dit aussi « newsletter ») est un mail que vous envoyez à la même liste de clients, de temps en temps. Les réseaux décident qui voit vos publications. Votre liste de contacts, elle, est à vous.

## Les étapes

1. **Construisez votre liste avec leur accord.** Une case à cocher sur votre site, un cahier sur le comptoir, une question en caisse : « Voulez-vous recevoir nos nouveautés par mail ? » La case ne doit jamais être cochée d’avance.
2. **Choisissez un outil d’envoi.** Il existe des services d’envoi de lettres d’information, souvent gratuits pour une petite liste. Ils gèrent la désinscription et évitent que vos mails tombent en courrier indésirable.
3. **Fixez un rythme tenable.** Une fois par mois ou à chaque saison, c’est très bien. Mieux vaut quatre lettres par an envoyées que douze promises.
4. **Écrivez court et utile.** Un sujet principal, une ou deux photos, un bouton vers votre site. Un titre de mail qui dit ce qu’il y a dedans : « Les fraises sont arrivées » plutôt que « Lettre n° 12 ».
5. **Laissez partir facilement.** Un lien de désinscription dans chaque envoi, simple et visible. C’est obligatoire, et c’est aussi une marque de respect.

> **La règle de la CNIL** : pour envoyer des offres par mail à des particuliers, il faut en principe leur accord préalable. Une exception existe pour vos clients qui ont déjà acheté chez vous, si vous leur parlez de produits proches et s’ils ont pu refuser dès le départ. Dans tous les cas, chaque mail doit permettre de se désinscrire simplement.

## Quoi raconter

- Une nouveauté ou un produit de saison.
- Un conseil de votre métier.
- Les coulisses : un chantier, une recette, une rencontre.
- Les dates à retenir : marchés, fermetures, événements.

## Un exemple

Prenons Pauline, une maraîchère imaginée pour ce tuto. Sur son stand, un cahier invite à laisser son adresse « pour savoir ce qui arrive cette semaine ». Chaque début de mois, elle envoie un mail court : les légumes du moment, une recette, les dates de marché. Ses clients arrivent le samedi en sachant déjà ce qu’ils veulent.

## L’erreur à éviter

**Inscrire des gens sans leur demander.** Ajouter toutes les adresses de votre boîte mail à la liste, c’est agacer, et c’est contraire aux règles. Une petite liste de gens intéressés vaut bien plus qu’une grande liste qui ne lit pas.

## À faire aujourd’hui

- Choisir comment vous récoltez les inscriptions (site, comptoir, stand)
- Écrire la phrase qui donne envie de s’inscrire
- Choisir votre rythme d’envoi
- Noter trois sujets pour la première lettre

## Pour aller plus loin

Le plus long, c’est d’écrire chaque lettre. La grande formation liée à ce tuto vous montre comment avoir un premier jet écrit pour vous à partir de quelques notes et de vos photos, que vous n’avez plus qu’à relire. Le tuto [faire revenir ses clients](/mini-tuto/faire-revenir-ses-clients/) complète bien celui-ci.`,
    faq: [
      { q: 'Puis-je envoyer ma lettre depuis ma boîte mail habituelle ?', a: 'Pour quelques personnes, oui, en mettant les adresses en copie cachée. Au-delà, un service d’envoi est plus sûr : il gère les désinscriptions et la bonne arrivée des mails.' },
      { q: 'Faut-il une lettre d’information si je suis déjà sur les réseaux ?', a: 'Les deux se complètent. Les réseaux font découvrir votre activité ; la lettre garde le lien avec ceux qui vous connaissent déjà.' },
    ],
    voir: ['faire-revenir-ses-clients', 'repondre-vite-demande-client', 'quand-et-combien-publier'],
  },
];
