// Articles de blog (1/2)
module.exports = [
  // ------------------------------------------------------------------
  {
    slug: 'comment-trouver-une-panne-electrique',
    short: 'Trouver une panne électrique',
    title: 'Comment trouver une panne électrique ? La méthode pas à pas',
    description: "Plus de courant, disjoncteur qui saute, prise morte : la méthode d'un électricien pour localiser une panne chez soi, en sécurité, étape par étape.",
    h1: 'Comment trouver une panne électrique ? La méthode pas à pas',
    lead: "Face à une panne, on a tendance à tout essayer au hasard. Pourtant, quelques étapes dans le bon ordre suffisent souvent à localiser le problème, voire à le régler sans aide. Voici la méthode que j'applique moi-même, adaptée à ce que vous pouvez faire en toute sécurité.",
    category: 'Pannes', icon: 'search', date: '2026-11-04', prestation: 'recherche-panne',
    body: `## Étape 1 : la panne vient-elle de chez vous ?

Commencez par regarder dehors. Les lampadaires sont-ils allumés ? Les voisins ont-ils de la lumière ? Votre compteur affiche-t-il quelque chose ?

- **Compteur éteint, voisins dans le noir** : c'est une coupure du réseau. Rien à faire chez vous, si ce n'est signaler la panne à Enedis.
- **Compteur allumé, voisins éclairés** : la panne est dans votre installation. On continue.

## Étape 2 : lire son tableau électrique

Ouvrez la porte du tableau et repérez les manettes en position basse. Trois cas se présentent :

1. **Le disjoncteur de branchement** (souvent près du compteur, avec un réglage en ampères) est tombé : toute la maison est coupée.
2. **Un interrupteur différentiel** (bouton « T » de test, mention 30 mA) est tombé : toute une rangée de circuits est coupée.
3. **Un disjoncteur divisionnaire** est tombé : un seul circuit est concerné, souvent identifié par une étiquette.

Si aucune manette n'est en bas et qu'une partie de la maison est privée de courant, le défaut se trouve sur le trajet d'un circuit : passez directement à l'étape 5.

## Étape 3 : le test du débranchement

Avant de réarmer, **débranchez tous les appareils** des pièces concernées. Pas seulement ceux qui fonctionnaient au moment de la coupure : tous. Pensez aussi aux appareils qu'on oublie, comme le congélateur du garage ou la pompe du bassin.

Réarmez **une seule fois**.

- **Ça tient** : l'installation est probablement saine. Rebranchez les appareils **un par un**, en laissant quelques minutes entre chacun. Celui qui fait retomber la protection est votre suspect principal.
- **Ça retombe immédiatement** : le défaut se trouve dans l'installation fixe (câble, boîte, prise, luminaire). N'insistez pas.

!> Ne réarmez pas en boucle une protection qui retombe aussitôt. Chaque tentative fait passer un courant de défaut important, ce qui peut aggraver les dégâts.

[[cta]]

## Étape 4 : interpréter ce que vous avez observé

Les circonstances de la coupure en disent long :

- **Coupure en allumant un appareil précis** (bouilloire, aspirateur, four) : l'appareil est très probablement en cause, ou la prise sur laquelle il est branché.
- **Coupure après plusieurs minutes de fonctionnement** : surcharge du circuit. Trop d'appareils puissants sur la même ligne.
- **Coupure par temps de pluie** : infiltration d'eau dans un équipement extérieur ou une boîte de raccordement.
- **Coupure la nuit** : appareils qui démarrent seuls en heures creuses, comme le chauffe-eau ou le chauffage.
- **Coupure après des travaux** : un clou, une vis ou un perçage a pu toucher un câble.

Notez ces éléments : ils feront gagner un temps précieux à l'électricien si vous devez en appeler un.

## Étape 5 : quand la panne est sur un circuit

Si une pièce ou un groupe de prises ne fonctionne plus alors que tout est enclenché au tableau, le courant est interrompu quelque part sur le trajet. Les causes classiques sont une **borne desserrée** dans une boîte de dérivation, une **prise en début de chaîne** défectueuse, ou un **câble endommagé**.

À ce stade, la recherche implique d'ouvrir des boîtes et des prises, donc de travailler à proximité de conducteurs. C'est le moment de passer la main, sauf si vous avez une réelle expérience et le matériel pour vérifier l'absence de tension.

## Étape 6 : savoir s'arrêter

Certains signes doivent vous faire arrêter immédiatement toute recherche :

- une **odeur de brûlé** ou de plastique chaud ;
- une **trace noire** sur une prise, un interrupteur ou dans le tableau ;
- un **crépitement** ou un grésillement ;
- un **tableau tiède ou chaud** au toucher ;
- une **sensation de picotement** en touchant un appareil ou un robinet.

Dans ces cas, coupez le disjoncteur général et faites appel à un professionnel.

## Ce que fait un électricien de plus

Là où vos observations s'arrêtent, l'électricien mesure. Avec un **contrôleur d'isolement**, il vérifie circuit par circuit si le courant fuit vers la terre, et localise ainsi un défaut même invisible. Avec une **pince ampèremétrique**, il voit si un circuit est surchargé. Avec un **testeur de différentiel**, il s'assure que vos protections réagissent correctement. C'est cette combinaison d'observation et de mesure qui permet de trouver les pannes les plus sournoises, notamment celles qui ne se produisent que de temps en temps.`,
    faq: [
      { q: 'Peut-on chercher une panne électrique soi-même ?', a: "Les étapes d'observation, de lecture du tableau et de débranchement des appareils sont sans risque. L'ouverture de boîtes, de prises ou du tableau demande en revanche des compétences et du matériel de vérification." },
      { q: 'Pourquoi la panne disparaît-elle quand l’électricien arrive ?', a: "C'est fréquent avec les défauts liés à l'humidité ou à la température. Les mesures d'isolement permettent souvent de détecter le défaut même lorsqu'il ne se manifeste pas." },
    ],
    cta: { title: 'La panne résiste à votre enquête ?', text: 'Transmettez-moi vos observations : je viens mesurer le soir ou le week-end, au prix annoncé avant.' },
    links: ['/prestations/recherche-de-panne/', '/disjoncteur-qui-saute/', '/differentiel-qui-saute/', '/panne-courant-partielle/', '/recherche-panne-electrique-ardennes/'],
    related: ['pourquoi-une-prise-disjoncte', 'differentiel-ou-disjoncteur-difference', 'prix-depannage-electrique'],
  },

  // ------------------------------------------------------------------
  {
    slug: 'pourquoi-remplacer-un-tableau-electrique',
    short: 'Pourquoi remplacer son tableau',
    title: 'Pourquoi remplacer un tableau électrique ? 7 bonnes raisons',
    description: "Sécurité des personnes, incendie, confort, nouveaux usages, vente : les vraies raisons de remplacer un tableau électrique et les signes d'alerte.",
    h1: 'Pourquoi remplacer un tableau électrique ? Les 7 bonnes raisons',
    lead: "On ne regarde son tableau électrique que lorsqu'il y a une panne. Pourtant, c'est l'élément qui conditionne toute la sécurité de la maison. Voici pourquoi, dans bien des logements, son remplacement est l'investissement le plus utile qui soit en électricité.",
    category: 'Tableau électrique', icon: 'panel-top', date: '2026-10-28', prestation: 'tableau',
    body: `## 1. Protéger les personnes contre l'électrocution

C'est la raison principale. Un tableau ancien ne comporte souvent **aucun interrupteur différentiel 30 mA**, ou un seul pour une partie des circuits. Or c'est ce dispositif, et lui seul, qui coupe le courant assez vite lorsqu'une personne touche un conducteur sous tension. Un fusible ou un disjoncteur classique ne réagit pas à ce type de défaut.

## 2. Réduire le risque d'incendie

Un tableau vieillissant cumule les facteurs de risque : **connexions desserrées** qui chauffent, **fusibles surcalibrés** qui ne protègent plus les câbles, matières plastiques qui se fragilisent. Les échauffements dans le tableau lui-même sont une cause d'incendie bien réelle, d'autant plus dangereuse que le tableau est souvent placé dans une entrée ou un couloir, sur le chemin de sortie.

## 3. En finir avec les fusibles

Changer un fusible à la lampe de poche, sans savoir lequel a fondu, avec des cartouches de rechange introuvables : c'est le quotidien des maisons encore équipées. Avec un tableau à disjoncteurs, il suffit de **relever une manette**. C'est aussi la fin de la tentation de « dépanner » avec un fil de cuivre ou un fusible plus gros.

[[cta]]

## 4. Accueillir les usages d'aujourd'hui

Plaque à induction, four à pyrolyse, pompe à chaleur, voiture électrique, bureau à domicile : les besoins électriques d'un foyer n'ont plus rien à voir avec ceux d'il y a trente ans. Un tableau plein, sans emplacement disponible, empêche d'ajouter proprement de nouveaux circuits. Un tableau neuf prévoit **au moins 20 % de réserve**.

## 5. Savoir enfin ce qui coupe quoi

Combien de foyers ignorent quel disjoncteur alimente la cuisine ? Un tableau neuf est **entièrement repéré** : chaque protection est étiquetée, et un schéma est remis. En cas de panne ou de travaux, vous coupez le bon circuit sans priver toute la maison de courant.

## 6. Limiter les coupures générales

Dans les anciennes installations, un seul différentiel protège souvent tout le logement : le moindre défaut plonge toute la maison dans le noir, congélateur compris. Un tableau moderne répartit les circuits sur **plusieurs différentiels**, si bien qu'un défaut ne coupe qu'une partie de l'installation.

## 7. Valoriser le logement

Lors d'une vente ou d'une location, le diagnostic électrique pointe systématiquement l'absence de protection différentielle adaptée et les tableaux vétustes. Un tableau récent rassure les acheteurs et évite que l'électricité ne devienne un argument de négociation contre vous.

## Les signes qui doivent alerter

- Des **fusibles** à broches ou à cartouches.
- Un tableau **monté sur une planche en bois**, sans capot.
- Des **traces de chauffe**, un plastique jauni, une odeur.
- Une absence de bouton **« Test »** (pas de différentiel).
- Des **fils volants** reliant plusieurs coffrets.
- Des protections qui sautent souvent **sans cause identifiée**.

## Combien ça coûte ?

Le remplacement d'un tableau démarre généralement autour de quelques centaines d'euros pour un petit logement, et augmente avec le nombre de circuits et de différentiels. Chez ALED08, il fait l'objet d'un **devis gratuit et détaillé**, établi après comptage des circuits. La plupart du temps, les câbles existants sont conservés : seul le tableau change, en une journée.`,
    faq: [
      { q: 'Quelle est la durée de vie d’un tableau électrique ?', a: "Il n'y a pas de date de péremption, mais au-delà de 25 à 30 ans, les tableaux ne correspondent plus aux exigences de sécurité actuelles et leurs composants vieillissent." },
      { q: 'Peut-on simplement ajouter un différentiel à un vieux tableau ?', a: "Parfois, oui, quand le tableau est en bon état et dispose de place. C'est une solution intermédiaire intéressante ; elle ne règle cependant pas le problème des fusibles ou des connexions vétustes." },
    ],
    cta: { title: 'Votre tableau coche plusieurs cases ?', text: 'Envoyez-moi une photo : je vous dis s’il faut le remplacer et à quel prix.' },
    links: ['/prestations/tableau-electrique/', '/remplacement-tableau-a-fusibles/', '/tableau-electrique-ardennes/', '/installation-parafoudre/'],
    related: ['differentiel-ou-disjoncteur-difference', 'quand-refaire-son-installation-electrique', 'risques-installation-electrique-ancienne'],
  },

  // ------------------------------------------------------------------
  {
    slug: 'quand-refaire-son-installation-electrique',
    short: 'Quand refaire son installation',
    title: 'Quand refaire son installation électrique ? Signes et bons moments',
    description: "Âge, signes d'usure, achat, rénovation, nouveaux besoins : comment savoir s'il faut refaire son électricité, en totalité ou en partie, et quand.",
    h1: 'Quand faut-il refaire son installation électrique ?',
    lead: "Refaire toute l'électricité d'une maison est un chantier important. Le faire trop tôt, c'est dépenser inutilement ; trop tard, c'est prendre des risques. Voici les critères concrets qui permettent de décider, et les moments les plus opportuns pour se lancer.",
    category: 'Rénovation', icon: 'hammer', date: '2026-10-21', prestation: 'mise-en-securite',
    body: `## L'âge, un indicateur parmi d'autres

On entend souvent qu'une installation de plus de 30 ans doit être refaite. C'est un raccourci. Une installation des années 80, bien réalisée et peu sollicitée, peut être en meilleur état qu'une installation des années 2000 bricolée. L'âge doit surtout **déclencher un contrôle**, pas automatiquement des travaux.

En revanche, certaines générations d'installations posent presque toujours problème :

- **Avant les années 1960** : conducteurs gainés de tissu ou de caoutchouc, souvent sans terre, fusibles.
- **Années 1960-1970** : peu de prises par pièce, terre parfois absente, protections différentielles inexistantes ou peu sensibles.
- **Années 1980** : installations plutôt correctes, mais protections différentielles à mettre à niveau.

## Les signes d'usure qui ne trompent pas

- Des **disjoncteurs ou fusibles** qui sautent régulièrement.
- Des **prises qui chauffent**, noircissent ou ne tiennent plus les fiches.
- Des **lumières qui baissent** quand un appareil puissant démarre.
- Des **fils dont l'isolant** craquelle ou s'effrite au moindre mouvement.
- Des **multiprises partout**, faute de prises en nombre suffisant.
- Des **picotements** en touchant un appareil ou un robinet.

Plusieurs de ces signes réunis indiquent que l'installation arrive en bout de course.

[[cta]]

## Refaire en totalité ou en partie ?

Entre « ne rien faire » et « tout refaire », il existe une voie intermédiaire, souvent la plus raisonnable :

1. **Sécuriser** : tableau avec différentiels 30 mA, prise de terre, suppression des connexions dangereuses.
2. **Contrôler circuit par circuit** : les mesures d'isolement disent quels câbles sont sains.
3. **Refaire ce qui doit l'être** : les circuits dégradés, les pièces sous-équipées, la salle de bain.
4. **Planifier le reste** au rythme des rénovations.

La réfection totale s'impose surtout quand **la majorité des conducteurs est dégradée**, ou quand une **rénovation lourde** ouvre de toute façon les murs.

## Les meilleurs moments pour agir

### À l'achat, avant d'emménager

Pièces vides, pas de meubles à déplacer, poussière sans conséquence : c'est le moment idéal. Et le coût des travaux peut être anticipé dans le plan de financement.

### Lors d'une rénovation de pièce

Refaire la cuisine ou la salle de bain sans reprendre l'électricité serait une erreur. C'est l'occasion de mettre ces pièces aux normes, avec les circuits spécialisés et le nombre de prises adaptés.

### Avant d'isoler ou de refaire les murs

Doublages, isolation par l'intérieur, nouveaux plafonds : faites passer les gaines **avant** de fermer. Après, il faudrait tout rouvrir.

### Lors d'un changement de vie

L'arrivée d'un enfant, le maintien à domicile d'un parent âgé, le passage au télétravail ou l'achat d'une voiture électrique modifient les besoins. C'est souvent le bon moment pour faire le point.

## Ce qu'il faut retenir

Une installation ancienne n'est pas forcément à refaire, mais elle doit être **contrôlée**. Le contrôle permet de distinguer l'urgent du souhaitable, et de construire un plan de travaux adapté à votre budget. Commencer par la sécurité, puis moderniser pièce par pièce, est presque toujours la stratégie gagnante.`,
    faq: [
      { q: 'Combien coûte une réfection électrique complète ?', a: "Le budget dépend de la surface, du nombre de pièces, de l'accessibilité et du niveau d'équipement souhaité. Un devis après visite est indispensable ; la mise en sécurité préalable représente en général une fraction de ce montant." },
      { q: 'Peut-on habiter la maison pendant les travaux ?', a: "Pour une mise en sécurité ou une rénovation pièce par pièce, oui. Pour une réfection totale, c'est plus contraignant, d'où l'intérêt d'intervenir avant d'emménager." },
    ],
    cta: { title: 'Vous hésitez à refaire votre électricité ?', text: 'Je contrôle votre installation et je vous dis honnêtement ce qui doit être refait, et ce qui peut rester.' },
    links: ['/prestations/mise-en-securite/', '/diagnostic-electrique-ardennes/', '/electricien-maison-ancienne/', '/mise-aux-normes-electrique/'],
    related: ['risques-installation-electrique-ancienne', 'pourquoi-remplacer-un-tableau-electrique', 'norme-nf-c-15-100-essentiel'],
  },

  // ------------------------------------------------------------------
  {
    slug: 'pourquoi-une-prise-disjoncte',
    short: 'Pourquoi une prise disjoncte',
    title: 'Pourquoi une prise disjoncte ? Causes et solutions',
    description: "Quand vous branchez un appareil, tout disjoncte ? Appareil défectueux, prise abîmée, circuit surchargé, humidité : comment identifier la cause et y remédier.",
    h1: 'Pourquoi une prise disjoncte-t-elle quand on branche un appareil ?',
    lead: "Vous branchez l'aspirateur, la bouilloire ou le radiateur… et clac, le courant saute. Est-ce la prise, l'appareil ou l'installation ? Quelques tests simples permettent de répondre, et d'éviter de remplacer ce qui fonctionne très bien.",
    category: 'Pannes', icon: 'plug-zap', date: '2026-10-14', prestation: 'prises',
    body: `## Trois coupables possibles

Quand un branchement fait disjoncter, le problème se trouve dans l'un de ces trois éléments :

1. **L'appareil** lui-même (moteur, résistance, cordon abîmé).
2. **La prise** sur laquelle il est branché.
3. **Le circuit** qui alimente la prise (surcharge, défaut sur la ligne).

L'objectif est de les isoler l'un après l'autre.

## Le test croisé

- **Branchez l'appareil suspect sur une autre prise**, idéalement d'une autre pièce, donc d'un autre circuit. Si ça disjoncte encore, l'appareil est très probablement en cause.
- **Branchez un autre appareil**, sans problème connu, sur la prise suspecte. Si ça disjoncte, c'est la prise ou le circuit.

Ce simple échange règle la question dans la majorité des cas.

## Quelle protection a sauté ?

Regardez votre tableau : la nature de la protection qui a déclenché oriente fortement le diagnostic.

- **Un interrupteur différentiel** (avec bouton « Test ») : il y a une **fuite de courant vers la terre**. Typique d'un appareil à résistance vieillissante ou d'une prise humide.
- **Un disjoncteur divisionnaire** : il y a soit un **court-circuit** (déclenchement instantané au branchement), soit une **surcharge** (déclenchement après quelques minutes).

[[cta]]

## Les appareils les plus souvent en cause

- **Bouilloire, cafetière, grille-pain** : la résistance s'abîme avec le calcaire et l'âge, et finit par fuir.
- **Aspirateur** : le cordon, tiré et enroulé des milliers de fois, se dénude à l'intérieur de la gaine.
- **Sèche-cheveux** : même problème de cordon, plus l'humidité de la salle de bain.
- **Radiateur d'appoint** : très puissant, il surcharge facilement un circuit déjà chargé.
- **Lave-linge et lave-vaisselle** : résistance de chauffe, pompe ou électrovanne en défaut.
- **Outils électroportatifs** : poussière et chocs fragilisent leur isolation.

Un appareil qui fait disjoncter de manière répétée doit être **réparé ou remplacé** : il présente un risque, même s'il semble fonctionner sur une autre prise.

## Quand c'est la prise

Une prise peut faire disjoncter si :

- ses **contacts sont abîmés** ou oxydés ;
- elle est **humide** (cave, garage, extérieur, proximité d'un évier) ;
- un **fil s'est desserré** et touche une autre borne ou la boîte métallique ;
- elle a **chauffé** et son isolant a fondu.

Dans ces cas, la prise doit être remplacée, et ses conducteurs contrôlés.

## Quand c'est le circuit

Si le disjoncteur saute après quelques minutes et que vous utilisez plusieurs appareils puissants en même temps, le circuit est simplement **surchargé**. La solution n'est surtout pas de mettre un disjoncteur plus gros, mais de **répartir les appareils** sur plusieurs circuits, voire d'en créer un nouveau pour les gros consommateurs.

!> Un disjoncteur remplacé par un calibre supérieur ne protège plus le câble. C'est l'une des modifications les plus dangereuses que l'on puisse faire sur une installation.

## En résumé

Testez l'appareil ailleurs, testez la prise avec un autre appareil, regardez quelle protection a sauté. Si le problème vient de l'installation (prise, circuit) ou si vous ne parvenez pas à conclure, faites appel à un électricien : il mesurera l'isolement et la charge pour trancher.`,
    faq: [
      { q: 'Est-ce dangereux d’utiliser un appareil qui fait disjoncter ?', a: "Oui. S'il fait déclencher un différentiel, il fuit vers la terre : sa carcasse peut être sous tension. Mieux vaut cesser de l'utiliser jusqu'à réparation." },
      { q: 'Pourquoi ça disjoncte seulement avec la bouilloire et le micro-ondes ensemble ?', a: "Parce que leurs puissances cumulées dépassent ce que le circuit peut fournir. Ce n'est pas une panne, mais le signe qu'il faut répartir les usages ou créer un circuit supplémentaire." },
    ],
    cta: { title: 'La prise ou le circuit est en cause ?', text: 'Je remplace la prise ou je crée le circuit qui manque, prix annoncé avant.' },
    links: ['/prestations/prises-et-interrupteurs/', '/disjoncteur-qui-saute/', '/prise-qui-chauffe/', '/ajout-circuit-electrique/'],
    related: ['comment-trouver-une-panne-electrique', 'differentiel-ou-disjoncteur-difference', 'comment-securiser-son-logement-electricite'],
  },

  // ------------------------------------------------------------------
  {
    slug: 'risques-installation-electrique-ancienne',
    short: 'Risques d’une installation ancienne',
    title: 'Les risques d’une installation électrique ancienne',
    description: "Électrocution, incendie, pannes à répétition, appareils endommagés : les risques d'une installation électrique ancienne et comment les réduire.",
    h1: 'Les risques d’une installation électrique ancienne',
    lead: "Une installation électrique ne prévient pas quand elle devient dangereuse. Elle continue de fonctionner, jusqu'au jour où un défaut se produit. Comprendre les risques réels d'une installation ancienne permet de les traiter avant, sans céder à la panique ni à la négligence.",
    category: 'Sécurité', icon: 'triangle-alert', date: '2026-10-07', prestation: 'mise-en-securite',
    body: `## Risque n° 1 : l'électrocution

Le corps humain est sensible à des courants très faibles. Au-delà de quelques dizaines de milliampères traversant le corps, les conséquences peuvent être graves. Dans une installation récente, deux protections travaillent ensemble pour l'éviter : la **prise de terre**, qui évacue les fuites de courant, et le **différentiel 30 mA**, qui coupe en une fraction de seconde.

Dans une installation ancienne, l'une ou l'autre manque souvent, parfois les deux. Les situations à risque sont alors nombreuses :

- un appareil à carcasse métallique dont un fil intérieur s'est dénudé ;
- une prise fendue ou un interrupteur cassé qui laisse apparaître une partie sous tension ;
- une salle de bain où l'humidité et les éléments métalliques favorisent les contacts ;
- un enfant qui introduit un objet dans une prise sans protection.

## Risque n° 2 : l'incendie

Une part importante des incendies domestiques a une origine électrique. Les causes typiques dans une installation vieillissante :

- des **connexions desserrées** qui chauffent progressivement, dans le tableau, une boîte de dérivation ou derrière une prise ;
- des **fusibles surdimensionnés** ou contournés, qui laissent un câble surchauffer sans couper ;
- des **conducteurs dont l'isolant s'est dégradé**, qui finissent par créer un court-circuit ;
- des **multiprises en cascade** qui alimentent des appareils puissants.

Ces échauffements se produisent souvent dans des endroits cachés : dans un mur, sous un plancher, dans un faux plafond.

[[cta]]

## Risque n° 3 : les pannes à répétition

Moins grave, mais pénible au quotidien : une installation ancienne supporte mal les usages actuels. Disjonctions quand on cuisine, coupures en plein hiver, lumières qui faiblissent. Chacune de ces pannes est aussi un signal : l'installation travaille à la limite de ses capacités.

## Risque n° 4 : les appareils endommagés

Faux contacts, neutres desserrés, absence de protection contre les surtensions : les appareils électroniques modernes, plus sensibles que leurs ancêtres, en font les frais. Box internet, téléviseurs, cartes électroniques de chaudière ou d'électroménager peuvent griller prématurément.

## Comment repérer une installation à risque

Quelques indices visibles sans rien démonter :

- **Le tableau** : fusibles, planche en bois, absence de bouton « Test », traces de chauffe.
- **Les prises** : deux trous seulement, boîtier fendu ou jauni, fiches qui tombent.
- **Les fils visibles** : gaine en tissu, isolant craquelé, dominos sans boîte.
- **La salle de bain** : prise près de la baignoire, luminaire ordinaire au-dessus de la douche.
- **Les usages** : multiprises partout, rallonges permanentes.

## Réduire les risques, étape par étape

La bonne nouvelle, c'est que les risques les plus graves se traitent souvent **rapidement et à coût maîtrisé** :

1. **Installer des différentiels 30 mA** sur tous les circuits.
2. **Vérifier ou créer la prise de terre**, et y raccorder les circuits.
3. **Supprimer les connexions dangereuses** : dominos nus, fils dénudés, matériel cassé.
4. **Remettre la salle de bain en sécurité.**
5. **Planifier ensuite** la modernisation du reste.

C'est tout l'objet d'une mise en sécurité : traiter d'abord ce qui protège les personnes, puis améliorer progressivement.`,
    faq: [
      { q: 'Une installation ancienne est-elle forcément dangereuse ?', a: "Non. Certaines installations anciennes, bien réalisées et entretenues, restent sûres une fois équipées de différentiels 30 mA et d'une terre correcte. Seul un contrôle permet de le dire." },
      { q: 'Mon assurance peut-elle refuser de m’indemniser à cause de l’électricité ?', a: "Les conditions varient selon les contrats. Une installation entretenue et sécurisée limite en tout cas les discussions en cas de sinistre. Renseignez-vous auprès de votre assureur." },
    ],
    cta: { title: 'Votre installation a de l’âge ?', text: 'Je fais le point, mesures à l’appui, et je vous propose un plan de mise en sécurité par priorités.' },
    links: ['/prestations/mise-en-securite/', '/electricien-maison-ancienne/', '/prise-sans-terre/', '/mise-en-securite-electrique-ardennes/'],
    related: ['quand-refaire-son-installation-electrique', 'comment-securiser-son-logement-electricite', 'pourquoi-remplacer-un-tableau-electrique'],
  },

  // ------------------------------------------------------------------
  {
    slug: 'differentiel-ou-disjoncteur-difference',
    short: 'Différentiel ou disjoncteur',
    title: 'Différentiel ou disjoncteur : quelle différence ?',
    description: 'Interrupteur différentiel, disjoncteur divisionnaire ou de branchement : à quoi sert chaque appareil de votre tableau électrique, expliqué simplement.',
    h1: 'Différentiel ou disjoncteur : quelle différence ?',
    lead: "Dans un tableau électrique, tout se ressemble : des modules blancs avec une manette. Pourtant, interrupteur différentiel et disjoncteur ont des rôles très différents. Les distinguer aide à comprendre une panne… et à ne pas faire d'erreur dangereuse.",
    category: 'Comprendre', icon: 'zap', date: '2026-09-30', prestation: 'tableau',
    body: `## Le disjoncteur protège les câbles

Le disjoncteur surveille **la quantité de courant** qui circule dans un circuit. Si elle devient trop importante, il coupe. Deux situations le font réagir :

- **La surcharge** : trop d'appareils branchés en même temps sur le même circuit. Le câble commence à chauffer ; le disjoncteur coupe après un certain délai.
- **Le court-circuit** : deux conducteurs entrent en contact direct. Le courant explose ; le disjoncteur coupe instantanément.

Son calibre (10, 16, 20, 32 A…) est choisi **en fonction de la section du câble** qu'il protège. C'est pourquoi on ne remplace jamais un disjoncteur par un calibre supérieur : le câble ne serait plus protégé.

## Le différentiel protège les personnes

L'interrupteur différentiel ne mesure pas la quantité de courant, mais **l'équilibre** entre le courant qui part dans le circuit et celui qui en revient. Normalement, tout ce qui part revient. Si une partie du courant s'échappe ailleurs, par la terre ou à travers une personne, le différentiel détecte la différence et coupe.

Sa **sensibilité** s'exprime en milliampères :

- **30 mA** : haute sensibilité, protège les personnes contre l'électrocution. Obligatoire sur tous les circuits d'un logement.
- **300 ou 500 mA** : sensibilité plus faible, protège surtout contre les risques d'incendie. On le trouve souvent dans le disjoncteur de branchement.

[[cta]]

## Les types de différentiels

Tous les différentiels 30 mA ne se valent pas. Leur **type** indique les formes de courant de fuite qu'ils savent détecter :

- **Type AC** : pour les circuits courants (éclairage, prises, chauffage).
- **Type A** : détecte aussi les fuites particulières générées par certains appareils électroniques. Requis notamment pour la plaque de cuisson et le lave-linge.
- **Type F** : version encore plus adaptée à certains appareils à moteur à vitesse variable, comme certains lave-linge ou pompes à chaleur.

Votre tableau peut donc comporter plusieurs différentiels de types différents, chacun protégeant un groupe de circuits.

## Et le disjoncteur différentiel ?

C'est un appareil **deux-en-un** : il assure à la fois la protection contre les surcharges et courts-circuits, et la protection différentielle. On le trouve dans certains tableaux, ou sous forme de **disjoncteur de branchement**, l'appareil qui coupe toute la maison près du compteur.

## Comment les reconnaître dans votre tableau

- **L'interrupteur différentiel** porte un bouton **« T » ou « Test »** et la mention de sa sensibilité (30 mA). Il est généralement placé en tête d'une rangée et alimente plusieurs disjoncteurs.
- **Le disjoncteur divisionnaire** porte son calibre (C16, C20, C32…), sans bouton de test. Il protège un seul circuit.
- **Le disjoncteur de branchement** est souvent plus gros, près du compteur, et porte un réglage en ampères correspondant à votre abonnement.

## Ce que cela change en cas de panne

- **Un disjoncteur saute** : regardez du côté de la charge (trop d'appareils) ou d'un court-circuit (appareil, prise, câble abîmé).
- **Un différentiel saute** : cherchez une fuite de courant, souvent liée à l'humidité ou à un appareil défectueux.
- **Le disjoncteur de branchement saute** : dépassement de la puissance de votre abonnement, ou défaut important dans l'installation.

## Le bon réflexe mensuel

Appuyez une fois par mois sur le bouton « Test » de chaque différentiel. Il doit couper immédiatement. Si rien ne se passe, il ne vous protège plus : faites-le remplacer.`,
    faq: [
      { q: 'Peut-on avoir trop de différentiels ?', a: "Non. Plusieurs différentiels bien répartis limitent l'étendue des coupures en cas de défaut. La norme fixe un minimum selon la surface du logement et le nombre de circuits." },
      { q: 'Mon tableau n’a qu’un différentiel 500 mA : est-ce suffisant ?', a: "Non pour la protection des personnes. Seul un différentiel 30 mA coupe assez vite en cas de contact avec un conducteur sous tension." },
    ],
    cta: { title: 'Votre tableau mérite une mise à niveau ?', text: 'J’ajoute les différentiels qui manquent ou je remplace le tableau, selon ce qui est le plus pertinent.' },
    links: ['/prestations/tableau-electrique/', '/differentiel-qui-saute/', '/disjoncteur-qui-saute/', '/remplacement-disjoncteur/'],
    related: ['pourquoi-remplacer-un-tableau-electrique', 'comment-trouver-une-panne-electrique', 'pourquoi-une-prise-disjoncte'],
  },
];
