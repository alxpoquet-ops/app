// Pages prestations principales
module.exports = [
  // ------------------------------------------------------------------ DÉPANNAGE
  {
    key: 'depannage',
    path: '/prestations/depannage-electrique/',
    label: 'Dépannage électrique',
    title: 'Dépannage électrique dans les Ardennes, soir et week-end | ALED08',
    description: 'Plus de courant, disjoncteur qui saute, prise ou lumière en panne ? Dépannage électrique à domicile dans les Ardennes, le soir et le week-end.',
    kicker: 'Prestation · Dépannage électrique',
    h1: 'Dépannage électrique à domicile, en soirée et le week-end',
    lead: "Le dépannage, c'est **ma spécialité**. Une panne ne prévient pas, et elle arrive rarement aux heures de bureau : depuis Signy-l'Abbaye, j'interviens chez les particuliers des Ardennes **le soir après 18 h et le week-end**, sur rendez-vous. **Forfait de 79 €** : déplacement, recherche de panne, proposition de solution et devis de réparation sans obligation. **Panne non trouvée : remise sur le forfait.**",
    prestation: 'depannage',
    chips: [{ icon: 'zap', text: 'Forfait 79 € tout compris' }, { icon: 'clock', text: 'Soirs dès 18 h' }, { icon: 'calendar-days', text: 'Samedi & dimanche' }],
    intro: `## Les pannes que je dépanne le plus souvent

Un dépannage électrique, ce n'est pas seulement « remettre le disjoncteur ». Si un appareil de protection a coupé, c'est qu'il a détecté quelque chose. Mon travail consiste à **trouver ce qui a provoqué la coupure**, à le corriger durablement, puis à vérifier que tout est de nouveau sûr.`,
    includes: [
      'Coupure totale de courant dans la maison ou l’appartement',
      'Disjoncteur ou interrupteur différentiel qui saute, au réarmement ou de façon aléatoire',
      'Une pièce, un étage ou un circuit privé de courant',
      'Prise qui ne fonctionne plus, qui chauffe ou qui a noirci',
      'Lumière qui ne s’allume plus, qui clignote ou interrupteur hors service',
      'Panne après un orage, une coupure réseau ou un dégât des eaux',
      'Appareil (four, plaque, chauffe-eau, radiateur) qui fait disjoncter',
    ],
    body: `## Avant d'appeler : les bons réflexes

Quelques vérifications simples permettent parfois de gagner du temps, et elles m'aident à préparer l'intervention :

1. Regardez si vos voisins ont du courant. Si toute la rue est dans le noir, la panne vient du réseau : c'est Enedis qu'il faut contacter (dépannage Enedis Ardennes : 09 726 750 08).
2. Ouvrez votre tableau électrique et repérez la manette en position basse : disjoncteur général, interrupteur différentiel ou disjoncteur d'un circuit.
3. Débranchez les appareils de la zone concernée, puis tentez **une seule fois** de réarmer.
4. Si la protection redéclenche aussitôt, n'insistez pas : laissez-la en bas et appelez-moi.

!> Odeur de brûlé, prise noircie, crépitement ou tableau chaud au toucher : coupez le disjoncteur général et ne remettez pas sous tension. Ce sont des signes d'échauffement à traiter avant toute remise en service.

[[cta]]

## Pourquoi un dépannage le soir ou le week-end ?

Parce que c'est là que vous êtes chez vous. Quand la panne tombe un mardi soir ou un samedi matin, vous n'avez pas à attendre la semaine suivante ni à poser une demi-journée de congé : **mes créneaux sont justement les soirs de semaine et les week-ends**. Le forfait est le même tous les jours, sans majoration.

## Un dépannage propre, pas un rafistolage

Un domino sous un isolant, un disjoncteur remplacé par un calibre supérieur « pour qu'il arrête de sauter » : ces solutions dépannent dix minutes et créent un vrai risque. Je remplace ce qui doit l'être par du matériel de marque, au bon calibre, en respectant la **norme NF C 15-100**. Si je constate un danger sans rapport avec la panne, je vous le signale clairement, sans vous l'imposer : vous décidez.`,
    steps: [
      { t: 'Vous m’appelez ou m’écrivez', d: 'Vous décrivez la panne (une photo du tableau sur WhatsApp aide beaucoup). Je vous confirme le forfait pour votre commune.' },
      { t: 'Rendez-vous fixé', d: 'Un créneau le soir ou le week-end, selon vos disponibilités et l’urgence de la situation.' },
      { t: 'Recherche, solution et devis', d: 'Je localise l’origine de la panne, je vous l’explique et je vous remets un devis de réparation, sans obligation.' },
      { t: 'Réparation si vous acceptez', d: 'Remise en service, tests des protections et conseils pour éviter que la panne ne revienne.' },
    ],
    prices: ['diagnostic', 'deplacement', 'prise', 'interrupteur', 'disjoncteur'],
    cases: [
      { tag: 'Soirée en semaine', icon: 'moon', title: 'Le différentiel saute dès qu’on lance le lave-linge', text: "Un jeudi à 19 h, une famille ne peut plus faire tourner sa machine sans tout couper. Mesure d'isolement circuit par circuit : la prise du cellier, posée à même un mur humide, présente un défaut à la terre.", result: 'Prise remplacée par un modèle étanche, boîte de raccordement remise au sec : plus aucun déclenchement.' },
      { tag: 'Samedi matin', icon: 'calendar-days', title: 'Toute la cuisine sans courant', text: "Le disjoncteur des prises de cuisine refuse de se réarmer. Une prise derrière le réfrigérateur a fondu : le contact s'était desserré et chauffait depuis des mois.", result: 'Prise et départ de câble refaits, contrôle des autres prises du circuit, retour du courant dans l’heure.' },
      { tag: 'Dimanche', icon: 'zap', title: 'Plus de lumière à l’étage après un orage', text: "Après une nuit orageuse, le circuit d'éclairage de l'étage reste coupé. Un interrupteur va-et-vient a été endommagé et met le circuit en court-circuit.", result: 'Interrupteur remplacé, test des autres commandes, conseil sur l’intérêt d’un parafoudre.' },
    ],
    faq: [
      { q: 'Combien coûte un dépannage électrique ?', a: "Le forfait dépannage est de 79 € : il comprend le déplacement jusqu'à 15 km de Signy-l'Abbaye, la recherche de la panne, la proposition de solution et le devis de réparation. Au-delà de 15 km, comptez 10 € ou 20 € de supplément. La réparation fait l'objet d'un devis, que vous acceptez ou non. Et si je ne trouve pas la panne, je vous fais une remise sur le forfait. Voir les [tarifs](/tarifs/)." },
      { q: 'Intervenez-vous en urgence la nuit ?', a: "Non : j'interviens le soir jusqu'à 21 h 30 et le week-end, sur rendez-vous. Pour une coupure générale de la rue, contactez Enedis. Pour une situation dangereuse (fumée, odeur de brûlé), coupez le courant au disjoncteur général et, en cas de doute, appelez le 18." },
      { q: 'Faites-vous les dépannages le dimanche ?', a: 'Oui, le dimanche de 9 h à 18 h, sur rendez-vous, avec le même forfait que les autres jours.' },
      { q: 'Et si la panne vient de mon compteur Linky ?', a: "Le compteur et le disjoncteur de branchement relèvent d'Enedis. Si mon diagnostic montre que la panne se situe avant votre tableau, je vous le dis et vous oriente vers Enedis : il n'y a alors pas de devis de réparation de ma part." },
    ],
    cta: { title: 'Panne de courant ? On s’en occupe ce soir ou ce week-end.', text: 'Forfait dépannage 79 €, devis de réparation sans obligation. Appelez ou envoyez une photo de votre tableau sur WhatsApp.' },
    links: ['/depannage-electrique-ardennes/', '/disjoncteur-qui-saute/', '/differentiel-qui-saute/', '/panne-courant-partielle/', '/prise-qui-chauffe/', '/electricien-urgence-ardennes/', '/blog/prix-depannage-electrique/', '/blog/pourquoi-une-prise-disjoncte/'],
  },

  // ------------------------------------------------------------------ RECHERCHE DE PANNE
  {
    key: 'panne',
    path: '/prestations/recherche-de-panne/',
    label: 'Recherche de panne électrique',
    title: 'Recherche de panne électrique – forfait 79 € | ALED08 Ardennes',
    description: 'Panne intermittente, différentiel qui saute sans raison, circuit mort ? Recherche méthodique avec mesures dans les Ardennes. Forfait 79 €.',
    kicker: 'Prestation · Recherche de panne',
    h1: 'Recherche de panne électrique : trouver la vraie cause',
    lead: "Certaines pannes sont évidentes. D'autres se cachent : un différentiel qui saute une fois par semaine, un circuit qui coupe seulement quand il pleut, une lumière qui grésille. **La recherche de panne, c'est mon cœur de métier** : une méthode, des appareils de mesure, et une explication claire à la fin.",
    prestation: 'recherche-panne',
    chips: [{ icon: 'search', text: 'Inclus dans le forfait 79 €' }, { icon: 'gauge', text: 'Mesures d’isolement' }, { icon: 'clipboard-check', text: 'Explication claire' }],
    intro: `## Une méthode plutôt que des suppositions

Changer des pièces au hasard coûte cher et ne règle souvent rien. Ma démarche est toujours la même : **écouter, isoler, mesurer, confirmer**. Votre description compte beaucoup (quand la panne arrive-t-elle ? depuis quand ? après quel événement ?), car elle oriente les premières vérifications.`,
    includes: [
      'Entretien avec vous sur les circonstances exactes de la panne',
      'Contrôle visuel du tableau, des connexions et des appareils de protection',
      'Isolement des circuits un par un pour localiser la zone en défaut',
      'Mesures d’isolement (mégohmmètre), de continuité et de tension',
      'Contrôle de la prise de terre et du bon fonctionnement des différentiels',
      'Recherche des défauts liés à un appareil (four, chauffe-eau, congélateur…)',
      'Explication du défaut trouvé et chiffrage de la réparation avant intervention',
    ],
    body: `## Les pannes les plus difficiles à trouver

### Les défauts intermittents

Un différentiel qui déclenche « de temps en temps » est le cas le plus frustrant. Les causes possibles sont nombreuses : humidité dans une boîte de dérivation extérieure, isolant de câble abîmé qui ne touche que lorsqu'il fait froid, appareil qui fuit à la terre seulement en chauffe. Je procède par élimination, et je vous demande parfois de noter quelques jours les moments où la coupure survient : c'est souvent la pièce manquante du puzzle.

### Les défauts cumulés

Sur une installation ancienne, plusieurs petites fuites à la terre peuvent s'additionner : aucune ne suffit seule à faire déclencher, mais ensemble elles dépassent le seuil de 30 mA. La mesure circuit par circuit permet de les repérer et de traiter les plus importantes.

### Les faux contacts

Une borne mal serrée provoque des lumières qui vacillent, des prises qui chauffent ou une perte de courant aléatoire. C'est aussi la première cause d'échauffement dans les tableaux. Je contrôle les serrages et les traces de chauffe, souvent invisibles sans démonter les caches.

[[cta]]

## Ce que vous obtenez à la fin

Une recherche de panne se termine toujours par une explication concrète : **où était le défaut, pourquoi il s'est produit et comment l'éviter**. Je vous remets ensuite un **devis de réparation**, sans obligation. Si vous l'acceptez et que la réparation est simple, je la réalise dans la foulée ; si elle demande du matériel spécifique, on fixe un nouveau créneau.

> La recherche de panne est comprise dans le forfait dépannage de 79 €, avec le déplacement (jusqu'à 15 km), la proposition de solution et le devis. Ce prix est fixe et annoncé au téléphone : pas de compteur horaire qui tourne pendant que je cherche. Et si je ne trouve pas l'origine de la panne, je vous fais une remise sur le forfait.`,
    steps: [
      { t: 'Description de la panne', d: 'Au téléphone ou par message : symptômes, fréquence, travaux ou événements récents.' },
      { t: 'Isolement', d: 'Je sépare les circuits et les appareils pour localiser la zone en défaut.' },
      { t: 'Mesures', d: 'Isolement, continuité, terre, tension : les mesures confirment l’origine exacte.' },
      { t: 'Explication et solution', d: 'Vous savez ce qui s’est passé, et vous choisissez la suite en connaissant le prix.' },
    ],
    prices: ['diagnostic', 'deplacement', 'disjoncteur', 'prise'],
    cases: [
      { tag: 'Panne intermittente', icon: 'cloud-lightning', title: 'Coupures uniquement les jours de pluie', text: "Depuis l'automne, le différentiel saute presque à chaque averse. Les circuits intérieurs sont sains ; la mesure d'isolement pointe le circuit qui alimente l'éclairage de la terrasse. Le joint d'une applique a cédé et l'eau s'infiltre dans le luminaire.", result: 'Applique remplacée par un modèle IP65, presse-étoupe refait : plus de déclenchement depuis.' },
      { tag: 'Défauts cumulés', icon: 'gauge', title: 'Le différentiel saute la nuit, en hiver', text: "Une maison des années 70 avec un seul différentiel pour tous les circuits. Les radiateurs, le chauffe-eau et le congélateur fuient chacun un peu ; en heures creuses, tout démarre en même temps et le seuil est dépassé.", result: 'Répartition des circuits sur deux différentiels et remplacement d’une résistance de chauffe-eau défectueuse.' },
      { tag: 'Faux contact', icon: 'lightbulb', title: 'Lumières qui baissent quand le four chauffe', text: "Les ampoules du salon faiblissent dès que le four se met en route. Le neutre commun, mal serré dans le tableau, chauffait et créait une chute de tension.", result: 'Borne remplacée, toutes les connexions du tableau contrôlées et resserrées au couple.' },
    ],
    faq: [
      { q: 'Que comprend le forfait à 79 € ?', a: "Le déplacement jusqu'à 15 km, la recherche méthodique de l'origine de la panne (contrôles, isolement des circuits, mesures), l'explication de la solution et le devis de réparation. La réparation n'est réalisée que si vous acceptez ce devis." },
      { q: 'Et si vous ne trouvez pas la panne ?', a: "Je vous fais une remise sur le forfait. Cela peut arriver sur une panne intermittente qui ne se manifeste pas pendant ma visite : je vous explique alors ce qui a été écarté et je vous propose une méthode pour le prochain déclenchement (relevé des heures, appareils en marche), afin de cibler la suite." },
      { q: 'Pouvez-vous réparer le jour même ?', a: "Dans la majorité des cas, oui, une fois le devis accepté : prises, interrupteurs, disjoncteurs, connexions, luminaires. J'ai dans mon véhicule le matériel courant ; une pièce particulière peut nécessiter un second passage." },
      { q: 'Le diagnostic remplace-t-il un diagnostic immobilier ?', a: "Non. Pour une vente ou une location, le diagnostic électrique réglementaire doit être réalisé par un diagnostiqueur certifié. Ma recherche de panne vise à réparer. Voir aussi le [bilan avant achat](/bilan-electrique-avant-achat/)." },
    ],
    cta: { title: 'Une panne qui revient sans prévenir ?', text: 'Décrivez-moi les symptômes : je vous dis au téléphone par où commencer, et je viens mesurer le soir ou le week-end.' },
    links: ['/recherche-panne-electrique-ardennes/', '/differentiel-qui-saute/', '/disjoncte-quand-il-pleut/', '/lumiere-qui-clignote/', '/panne-electrique-apres-orage/', '/blog/comment-trouver-une-panne-electrique/', '/blog/differentiel-ou-disjoncteur-difference/'],
  },

  // ------------------------------------------------------------------ TABLEAU
  {
    key: 'tableau',
    path: '/prestations/tableau-electrique/',
    label: 'Tableau électrique',
    title: 'Remplacement de tableau électrique sur devis – Ardennes | ALED08',
    description: 'Tableau à fusibles, sans différentiel 30 mA ou qui chauffe ? Remplacement de tableau aux normes NF C 15-100 dans les Ardennes, devis gratuit.',
    kicker: 'Prestation · Tableau électrique',
    h1: 'Remplacement de tableau électrique aux normes NF C 15-100',
    lead: "Le tableau est le cœur de votre installation : c'est lui qui protège les personnes contre l'électrocution et les câbles contre la surchauffe. Un tableau à fusibles, sans différentiel 30 mA ou bricolé au fil des années **ne joue plus ce rôle**. Je le remplace par un tableau neuf, clair et repéré, **sur devis gratuit et détaillé**.",
    prestation: 'tableau',
    chips: [{ icon: 'file-text', text: 'Devis gratuit' }, { icon: 'shield-check', text: 'Différentiels 30 mA' }, { icon: 'calendar-days', text: 'Pose le samedi' }],
    intro: `## Faut-il changer votre tableau ?

Un remplacement s'impose, ou mérite d'être sérieusement envisagé, dans les situations suivantes :`,
    includes: [
      'Tableau à fusibles à broches ou porcelaine, ou fusibles « recalibrés » au fil de cuivre',
      'Absence d’interrupteur différentiel 30 mA protégeant tous les circuits',
      'Traces de chauffe, plastique jauni, odeur de brûlé ou bornes noircies',
      'Disjoncteurs qui sautent souvent alors qu’aucun appareil n’est en défaut',
      'Plus aucune place pour ajouter un circuit (plaque, borne, extension…)',
      'Tableau sur planche en bois, sans capot, avec des parties sous tension accessibles',
      'Circuits non repérés : impossible de savoir quel disjoncteur coupe quoi',
    ],
    body: `## Ce que comprend un tableau neuf

Chaque tableau est composé selon votre logement, mais on y retrouve toujours :

- un ou plusieurs **interrupteurs différentiels 30 mA** (type AC pour les circuits courants, type A ou F pour la plaque de cuisson, le lave-linge ou la recharge d'un véhicule électrique) ;
- un **disjoncteur divisionnaire par circuit**, au calibre adapté à la section des câbles ;
- des **peignes de raccordement** plutôt que des fils en cascade, pour des connexions fiables ;
- un **repérage clair** de chaque circuit, et au moins 20 % de place disponible pour l'avenir ;
- si nécessaire, un **parafoudre** et un contacteur heures creuses pour le chauffe-eau.

## Comment se déroule le remplacement

Je viens d'abord voir votre installation pour compter les circuits, vérifier la terre et repérer d'éventuels problèmes en aval : c'est la base d'un devis juste. Le jour du chantier, généralement **un samedi**, le courant est coupé quelques heures. J'identifie chaque circuit, je pose le nouveau coffret, je raccorde, puis je teste chaque différentiel et chaque disjoncteur avant de remettre sous tension.

[[cta]]

## Pourquoi un devis plutôt qu'un prix affiché ?

Aucun tableau ne ressemble à un autre. Le montant dépend du **nombre de circuits**, du **type de différentiels** nécessaires et des éventuelles reprises (circuit à dédoubler, câble trop court, terre à créer). Tout est détaillé ligne par ligne sur le devis : vous savez ce que vous payez et pourquoi.

> Le disjoncteur de branchement (celui réglé par Enedis selon votre abonnement) et le compteur ne font pas partie du tableau que je remplace : ils appartiennent au réseau de distribution.`,
    steps: [
      { t: 'Visite et devis', d: 'Comptage des circuits, contrôle de la terre, photos. Devis détaillé et gratuit, ou remis à la fin d’un dépannage.' },
      { t: 'Préparation', d: 'Commande du matériel de marque et choix d’un créneau, souvent un samedi.' },
      { t: 'Remplacement', d: 'Coupure de quelques heures, pose, raccordement par peignes, repérage.' },
      { t: 'Essais et explications', d: 'Test de chaque protection, schéma de repérage et prise en main du nouveau tableau.' },
    ],
    prices: ['tableau', 'disjoncteur', 'deplacement'],
    cases: [
      { tag: 'Maison des années 60', icon: 'panel-top', title: 'Du tableau à fusibles au tableau modulaire', text: "Un pavillon resté dans son jus : six fusibles porcelaine sur planche, aucun différentiel. Le circuit de la cuisine était protégé par un fil de cuivre enroulé autour d'un fusible grillé.", result: 'Tableau neuf de deux rangées, trois différentiels 30 mA, neuf circuits repérés. Coupure de 5 heures un samedi.' },
      { tag: 'Ajout de circuits', icon: 'plug-zap', title: 'Plus de place pour la plaque à induction', text: "Les propriétaires remplacent leur cuisinière gaz par une plaque à induction. Le tableau, complet, ne permet pas d'ajouter la ligne 32 A nécessaire.", result: 'Tableau agrandi, différentiel de type A dédié, ligne de plaque en 6 mm² tirée jusqu’à la cuisine.' },
      { tag: 'Échauffement', icon: 'flame', title: 'Un tableau qui sent le chaud', text: "Une légère odeur de plastique chaud près du tableau depuis quelques semaines. À l'ouverture : une rangée de disjoncteurs alimentée en cascade par des fils trop fins, dont une borne a fondu.", result: 'Tableau remplacé avec peignes de raccordement ; mise en sécurité immédiate le jour même du diagnostic.' },
    ],
    faq: [
      { q: 'Combien de temps faut-il pour remplacer un tableau ?', a: "Pour une maison standard, comptez une demi-journée à une journée. Le courant est coupé pendant ce temps, c'est pourquoi je propose ces chantiers en priorité le samedi." },
      { q: 'Que comprend le devis de remplacement ?', a: "Le coffret, les interrupteurs différentiels, les disjoncteurs, les peignes de raccordement, le repérage et la main-d'œuvre, ligne par ligne. Vous savez exactement ce qui sera posé et pourquoi." },
      { q: 'Faut-il refaire toute l’installation en même temps ?', a: "Pas forcément. Le tableau neuf apporte immédiatement une protection des personnes grâce aux différentiels 30 mA. Si certains circuits sont en mauvais état, je vous le signale et on peut les reprendre progressivement. Voir [quand refaire son installation](/blog/quand-refaire-son-installation-electrique/)." },
      { q: 'Le Consuel est-il nécessaire ?', a: "Pour un simple remplacement de tableau dans une installation existante, une attestation Consuel n'est généralement pas exigée. Elle l'est en cas de rénovation complète avec remise sous tension par le distributeur. Je vous indique ce qui s'applique à votre cas." },
    ],
    cta: { title: 'Votre tableau a plus de 30 ans ?', text: 'Envoyez-moi une photo sur WhatsApp : je vous dis s’il doit être remplacé et vous donne une première estimation.' },
    links: ['/tableau-electrique-ardennes/', '/remplacement-tableau-a-fusibles/', '/remplacement-disjoncteur/', '/remplacement-tableau-electrique-rethel/', '/remplacement-tableau-electrique-charleville-mezieres/', '/installation-parafoudre/', '/blog/pourquoi-remplacer-un-tableau-electrique/'],
  },

  // ------------------------------------------------------------------ PRISES & INTERRUPTEURS
  {
    key: 'prises',
    path: '/prestations/prises-et-interrupteurs/',
    label: 'Prises et interrupteurs',
    title: 'Remplacement de prises et interrupteurs – Ardennes | ALED08',
    description: 'Prise cassée, qui chauffe ou sans terre, interrupteur hors service, ajout de prise ou va-et-vient : pose soignée sur devis, le soir et le week-end.',
    kicker: 'Prestation · Prises et interrupteurs',
    h1: 'Prises et interrupteurs : remplacement, ajout et prises spécialisées',
    lead: "Une prise qui bouge dans le mur, un interrupteur qui craque, des multiprises en cascade derrière la télévision : ce sont de petits travaux, mais **ils touchent directement à votre sécurité au quotidien**. Je remplace ou j'ajoute prises et interrupteurs avec du matériel de marque, **sur devis**.",
    prestation: 'prises',
    chips: [{ icon: 'plug', text: 'Prises' }, { icon: 'toggle-right', text: 'Interrupteurs et va-et-vient' }, { icon: 'plug-zap', text: 'Prises spécialisées' }],
    intro: `## Les interventions courantes

Ces travaux se font en général en une soirée. Je peux en regrouper plusieurs lors d'un même passage, ce qui évite de payer plusieurs déplacements.`,
    includes: [
      'Remplacement de prises abîmées, fendues, branlantes ou noircies',
      'Remplacement d’interrupteurs simples, doubles ou va-et-vient',
      'Ajout de prises sur un circuit existant (dans la limite autorisée par la norme)',
      'Création d’un va-et-vient (commande d’une lumière depuis deux endroits)',
      'Prises spécialisées pour four, plaque, lave-linge, lave-vaisselle, congélateur',
      'Prise extérieure étanche pour la terrasse ou le jardin',
      'Prises USB, prises à volet de protection pour les enfants, interrupteurs à voyant',
    ],
    body: `## Remplacer une prise, ce n'est pas que la changer

Quand je remplace une prise, je regarde aussi **ce qu'il y a derrière** : état des conducteurs, présence et continuité de la terre, serrage, boîte d'encastrement fixée. Une prise qui a chauffé a souvent abîmé l'isolant des fils sur quelques centimètres : il faut recouper et refaire une connexion saine, sinon le problème revient.

> Remplacer une ancienne prise à deux trous par une prise avec broche de terre n'apporte aucune protection si aucun fil de terre n'arrive dans la boîte. Je vérifie la présence de la terre avant de vous proposer la bonne solution. Plus de détails sur la page [prise sans terre](/prise-sans-terre/).

## Combien de prises sur un circuit ?

La norme NF C 15-100 limite le nombre de prises par circuit : **8 prises maximum sur un circuit en 2,5 mm² protégé en 20 A**, 5 en 1,5 mm² protégé en 16 A. Au-delà, il faut créer un nouveau circuit. C'est l'une des raisons pour lesquelles les multiprises s'accumulent dans les maisons anciennes, et pour lesquelles certaines prises chauffent.

[[cta]]

## Les prises spécialisées

Les gros appareils doivent disposer de leur **propre circuit**, avec une protection dédiée : four, lave-linge, lave-vaisselle, sèche-linge, congélateur, plaque de cuisson (en 32 A). Brancher un four sur une prise ordinaire partagée avec la cuisine, c'est la garantie de déclenchements à répétition, voire d'échauffements. Je crée ces lignes depuis le tableau, avec la section de câble adaptée.`,
    steps: [
      { t: 'Liste des besoins', d: 'Vous me listez les prises et interrupteurs à changer ou ajouter, avec photos si possible.' },
      { t: 'Devis', d: 'Je vous remets un devis pour l’ensemble, déplacement compris.' },
      { t: 'Pose soignée', d: 'Contrôle des conducteurs et de la terre, pose de niveau, matériel de marque.' },
      { t: 'Vérification', d: 'Test de chaque prise et de chaque commande, nettoyage avant de partir.' },
    ],
    prices: ['prise', 'interrupteur', 'point-lumineux', 'deplacement'],
    cases: [
      { tag: 'Rénovation légère', icon: 'plug', title: 'Toutes les prises d’un salon remplacées', text: "Des prises des années 80 jaunies, dont deux fendues et une qui ne tenait plus dans le mur. Les boîtes d'encastrement étaient descellées.", result: 'Six prises et deux interrupteurs remplacés, boîtes refixées, en une soirée.' },
      { tag: 'Confort', icon: 'toggle-right', title: 'Un va-et-vient dans un long couloir', text: "Un couloir éclairé par un seul interrupteur, à une extrémité. Les propriétaires traversaient chaque soir dans le noir.", result: 'Création d’un va-et-vient avec saignée rebouchée proprement, prêt à peindre.' },
      { tag: 'Électroménager', icon: 'plug-zap', title: 'Le lave-vaisselle fait disjoncter la cuisine', text: "Le lave-vaisselle était branché sur une prise du plan de travail, en même temps que la bouilloire et le grille-pain.", result: 'Création d’une ligne spécialisée 20 A depuis le tableau : fini les coupures pendant le petit-déjeuner.' },
    ],
    faq: [
      { q: 'Combien coûte le remplacement d’une prise ?', a: "Je ne fixe pas de prix à l'avance : tout dépend de l'état des conducteurs, de la boîte et du modèle choisi. Si la prise est en panne, le forfait dépannage (79 €) couvre la recherche et le devis ; pour une liste de travaux, je vous remets un devis gratuit." },
      { q: 'Pouvez-vous ajouter une prise là où il n’y en a pas ?', a: "Oui, en repiquant sur un circuit existant si la norme le permet, ou en créant un nouveau circuit. Selon les murs, la pose se fait en encastré ou en apparent sous moulure. Je vous présente les deux options et leur prix." },
      { q: 'Mes prises n’ont pas de terre, est-ce grave ?', a: "Sans terre, une fuite de courant sur un appareil métallique peut passer par vous. Le différentiel 30 mA limite ce risque, mais la terre reste indispensable pour les appareils de classe I (lave-linge, four, réfrigérateur…). Voir [mise à la terre](/mise-a-la-terre/)." },
    ],
    cta: { title: 'Une liste de prises et d’interrupteurs à changer ?', text: 'Regroupez tout en une visite : je vous remets un devis global et je m’en occupe en soirée.' },
    links: ['/prise-specialisee/', '/prise-qui-chauffe/', '/prise-qui-ne-fonctionne-plus/', '/prise-sans-terre/', '/prise-exterieure/', '/prise-renforcee-voiture-electrique/', '/petits-travaux-electriques/'],
  },

  // ------------------------------------------------------------------ ÉCLAIRAGE INTÉRIEUR
  {
    key: 'eclairage-int',
    path: '/prestations/eclairage-interieur/',
    label: 'Éclairage intérieur',
    title: 'Installation d’éclairage intérieur et spots LED – Ardennes | ALED08',
    description: "Ajout de point lumineux, spots LED, plafonniers, appliques, variateurs, remplacement d'éclairage existant : électricien dans les Ardennes, sur devis.",
    kicker: 'Prestation · Éclairage intérieur',
    h1: 'Éclairage intérieur : la bonne lumière, au bon endroit',
    lead: "Un plafonnier unique au milieu de la pièce, une cuisine où l'on travaille dans son ombre, un escalier mal éclairé : **l'éclairage change complètement le confort d'une maison**. J'installe et je remplace vos luminaires, spots et commandes, et je vous conseille sur la lumière adaptée à chaque pièce, **sur devis gratuit**.",
    prestation: 'eclairage-interieur',
    chips: [{ icon: 'lightbulb', text: 'Points lumineux' }, { icon: 'sparkles', text: 'Spots LED' }, { icon: 'sun-moon', text: 'Variateurs' }],
    intro: `## Ce que je peux installer chez vous

Que ce soit pour une pièce entière ou un seul luminaire, je m'occupe de l'alimentation, de la commande et de la pose.`,
    includes: [
      'Ajout d’un point lumineux au plafond ou au mur, avec son interrupteur',
      'Pose de spots LED encastrés (plafond plaque de plâtre, faux plafond)',
      'Installation de plafonniers, suspensions, lustres et appliques',
      'Éclairage de plan de travail sous les meubles de cuisine',
      'Variateurs compatibles LED, détecteurs de présence pour couloirs et escaliers',
      'Remplacement des anciens tubes néon, halogènes et luminaires vétustes',
      'Éclairage de garage, cave, cellier et atelier',
    ],
    body: `## Bien choisir sa lumière

La puissance en watts ne veut plus dire grand-chose avec les LED. Pour bien éclairer, on regarde trois valeurs :

- **Les lumens (lm)** : la quantité de lumière. Comptez environ 100 à 300 lm par m² selon l'usage (davantage dans une cuisine ou un bureau que dans une chambre).
- **La température de couleur (K)** : 2 700 à 3 000 K pour une lumière chaude et reposante (salon, chambres), 4 000 K pour une lumière neutre et précise (cuisine, salle de bain, garage).
- **L'indice de rendu des couleurs (IRC)** : choisissez au moins 80, idéalement 90 dans les pièces où l'on cuisine, se maquille ou bricole.

## Les spots encastrés, oui mais bien posés

Les spots donnent un rendu moderne, à condition de respecter quelques règles : un espacement régulier, des boîtiers adaptés lorsqu'il y a de l'isolant au-dessus du plafond, et des alimentations de qualité pour éviter le scintillement. Pour une pose sous les combles isolés, j'utilise des **capots de protection** qui évitent que la laine ne soit en contact avec le spot.

[[cta]]

## Variateurs et LED : attention à la compatibilité

Une LED « dimmable » branchée sur un ancien variateur prévu pour halogène grésille, clignote ou ne descend pas en intensité. Je vérifie la compatibilité entre ampoules, transformateurs et variateurs, et je remplace ce qui doit l'être pour un fonctionnement stable.`,
    steps: [
      { t: 'Votre projet', d: 'Pièce, usage, style souhaité : vous me montrez ce que vous voulez éclairer.' },
      { t: 'Conseil et devis', d: 'Nombre de points, type de lumière, emplacement des commandes, prix détaillé.' },
      { t: 'Installation', d: 'Alimentation, boîtiers, luminaires, commandes : pose propre et soignée.' },
      { t: 'Réglages', d: 'Essais, réglage des détecteurs et variateurs, conseils d’utilisation.' },
    ],
    prices: ['point-lumineux', 'interrupteur', 'deplacement'],
    cases: [
      { tag: 'Cuisine', icon: 'lamp-ceiling', title: 'Une cuisine enfin bien éclairée', text: "Un unique plafonnier dans le dos de la personne qui cuisine : le plan de travail restait dans l'ombre.", result: 'Quatre spots LED 4 000 K au plafond et un bandeau LED sous les meubles hauts, commandés séparément.' },
      { tag: 'Escalier', icon: 'lightbulb', title: 'Un escalier sécurisé pour une personne âgée', text: "Un escalier étroit avec un seul point lumineux en haut, et un interrupteur difficile à trouver la nuit.", result: 'Deux appliques murales et un détecteur de présence en bas et en haut : la lumière s’allume toute seule.' },
      { tag: 'Remplacement', icon: 'sparkles', title: 'Des halogènes qui grillaient sans cesse', text: "Huit spots halogènes 12 V au plafond d'un séjour, dont un ou deux grillaient chaque mois, avec des transformateurs fatigués.", result: 'Remplacement par des spots LED 230 V de qualité : plus de transformateurs, consommation divisée par six.' },
    ],
    faq: [
      { q: 'Combien coûte l’ajout d’un point lumineux ?', a: "Cela dépend de l'accès à l'alimentation, d'une éventuelle saignée ou d'un nouveau circuit. Je vous remets un devis gratuit après avoir vu la pièce, ou sur photos pour les cas simples. Le luminaire peut être fourni par vous ou par moi." },
      { q: 'Pouvez-vous poser un luminaire que j’ai acheté ?', a: "Oui, bien sûr. Je vérifie simplement qu'il est adapté à la pièce (indice de protection dans une salle de bain, poids pour un lustre) avant la pose." },
      { q: 'Faut-il beaucoup de travaux pour installer des spots ?', a: "Dans un plafond en plaque de plâtre, les spots se posent proprement sans gros travaux. Dans un plafond en béton ou en lambris, c'est plus délicat : je vous propose alors d'autres solutions, comme les rails ou les appliques." },
    ],
    cta: { title: 'Envie d’une maison mieux éclairée ?', text: 'Envoyez-moi une photo de la pièce et ce que vous imaginez : je vous propose une solution et un prix.' },
    links: ['/installation-spots-led/', '/remplacement-eclairage-led/', '/lumiere-qui-clignote/', '/electricite-salle-de-bain/', '/blog/bien-choisir-eclairage-led/', '/prestations/eclairage-exterieur/'],
  },

  // ------------------------------------------------------------------ ÉCLAIRAGE EXTÉRIEUR
  {
    key: 'eclairage-ext',
    path: '/prestations/eclairage-exterieur/',
    label: 'Éclairage extérieur',
    title: 'Éclairage extérieur, détecteurs et prises de jardin | ALED08 Ardennes',
    description: "Éclairage de façade, d’allée, de terrasse ou de cour avec détecteur de présence, prises extérieures étanches et lignes enterrées. Électricien dans les Ardennes.",
    kicker: 'Prestation · Éclairage extérieur',
    h1: 'Éclairage extérieur : façade, allée, terrasse et jardin',
    lead: "Rentrer le soir dans une cour plongée dans le noir, chercher ses clés sur le pas de la porte, ne pas profiter de sa terrasse dès que le soleil se couche… Un éclairage extérieur bien pensé, c'est du confort, de la sécurité et un effet dissuasif. **Je l'installe avec du matériel étanche, adapté au climat ardennais.**",
    prestation: 'eclairage-exterieur',
    chips: [{ icon: 'lamp-wall-up', text: 'Appliques étanches' }, { icon: 'eye', text: 'Détecteurs de présence' }, { icon: 'droplets', text: 'IP44 à IP67' }],
    intro: `## Mes installations extérieures

Dehors, l'électricité doit résister à la pluie, au gel, aux UV et parfois aux chocs. Le choix du matériel et la qualité des raccordements font toute la différence sur la durée.`,
    includes: [
      'Appliques de façade et éclairage d’entrée avec détecteur de présence',
      'Projecteurs LED pour cour, allée ou garage',
      'Bornes et balisage d’allée, spots encastrés de terrasse',
      'Interrupteur crépusculaire ou horloge pour un allumage automatique',
      'Prises extérieures étanches pour terrasse, jardin et potager',
      'Ligne enterrée vers un abri, un portail ou un éclairage de jardin',
      'Remplacement de luminaires extérieurs rouillés ou infiltrés',
    ],
    body: `## L'étanchéité avant tout

L'indice de protection (IP) indique la résistance à la poussière et à l'eau. Pour une applique sous un avant-toit, un **IP44** suffit ; exposée à la pluie battante, on monte à **IP65** ; pour un spot encastré au sol, il faut au minimum **IP67**. Un luminaire sous-dimensionné finit par prendre l'eau, et c'est alors le différentiel qui saute, souvent un soir de pluie.

## Détecteur ou crépusculaire ?

- **Le détecteur de présence** allume la lumière au passage, puis l'éteint après une durée réglable : idéal pour une entrée, une allée ou un garage.
- **L'interrupteur crépusculaire** allume à la tombée de la nuit : utile pour un éclairage d'ambiance ou de balisage.
- **Les deux combinés** : lumière douce toute la soirée, puis pleine puissance au passage.

[[cta]]

## Les câbles enterrés, une affaire de règles

Pour alimenter un portail, un abri de jardin ou des bornes, le câble doit être adapté à l'enterrement, protégé par une **gaine rouge** et posé **à au moins 50 cm de profondeur**, avec un **grillage avertisseur** au-dessus. C'est ce qui évite de le sectionner d'un coup de bêche dans cinq ans. Je peux poser la ligne dans une tranchée que vous avez creusée vous-même : cela réduit la facture.`,
    steps: [
      { t: 'Repérage', d: 'Je viens voir les lieux de préférence à la tombée du jour, pour juger des zones d’ombre.' },
      { t: 'Proposition', d: 'Emplacements, type de luminaires, commandes, indice IP : devis détaillé.' },
      { t: 'Pose', d: 'Traversées de mur étanches, raccordements protégés, câbles adaptés.' },
      { t: 'Réglage de nuit', d: 'Portée et temporisation des détecteurs réglées dans les conditions réelles.' },
    ],
    prices: ['point-lumineux', 'deplacement', 'diagnostic'],
    cases: [
      { tag: 'Entrée', icon: 'lamp-wall-up', title: 'Une cour de ferme plongée dans le noir', text: "Une grande cour entre la maison et la grange, sans aucun éclairage. Les propriétaires traversaient à la lampe torche.", result: 'Deux projecteurs LED avec détecteurs sur la façade et une applique sur la grange, commandés aussi depuis la cuisine.' },
      { tag: 'Terrasse', icon: 'sun', title: 'Profiter de la terrasse le soir', text: "Une terrasse en bois sans lumière ni prise : impossible d'y dîner après 21 h l'été, ni d'y brancher une plancha.", result: 'Quatre spots encastrés IP67, une applique murale et une prise étanche sur circuit dédié.' },
      { tag: 'Panne', icon: 'droplets', title: 'Le différentiel saute chaque soir de pluie', text: "Une applique de façade d'origine, au joint fendu, laissait entrer l'eau. Le défaut d'isolement faisait couper toute la maison.", result: 'Applique remplacée par un modèle IP65 avec presse-étoupe, boîte de raccordement étanche refaite.' },
    ],
    faq: [
      { q: 'Quelle protection pour un éclairage extérieur ?', a: "Les circuits extérieurs doivent être protégés par un différentiel 30 mA. Je recommande souvent un circuit dédié : en cas de défaut dehors, la maison n'est pas privée de courant." },
      { q: 'Puis-je creuser la tranchée moi-même ?', a: "Oui, et c'est une bonne façon de réduire le coût. Je vous indique le tracé et la profondeur (au moins 50 cm), puis je pose la gaine, le câble et le grillage avertisseur avant que vous ne rebouchiez." },
      { q: 'Les luminaires solaires ne suffisent-ils pas ?', a: "Pour du balisage décoratif, ils peuvent dépanner. Pour éclairer réellement une entrée ou une cour, surtout en hiver dans les Ardennes où l'ensoleillement est faible, un éclairage raccordé reste bien plus fiable." },
    ],
    cta: { title: 'Une entrée, une cour ou une terrasse à éclairer ?', text: 'Je passe en fin de journée pour voir les lieux dans de vraies conditions et vous proposer une installation adaptée.' },
    links: ['/eclairage-exterieur-detecteur/', '/prise-exterieure/', '/ligne-electrique-garage-atelier/', '/disjoncte-quand-il-pleut/', '/prestations/eclairage-interieur/', '/blog/comment-securiser-son-logement-electricite/'],
  },

  // ------------------------------------------------------------------ MISE EN SÉCURITÉ
  {
    key: 'securite',
    path: '/prestations/mise-en-securite/',
    label: 'Mise en sécurité électrique',
    title: 'Mise en sécurité électrique de votre logement – Ardennes | ALED08',
    description: 'Installation ancienne, sans terre ou sans différentiel 30 mA ? Mise en sécurité électrique sur devis dans les Ardennes, à budget maîtrisé.',
    kicker: 'Prestation · Mise en sécurité',
    h1: 'Mise en sécurité électrique : supprimer les dangers en priorité',
    lead: "Refaire toute l'électricité d'une maison coûte cher et n'est pas toujours nécessaire. **La mise en sécurité vise l'essentiel** : protéger les personnes contre l'électrocution et le logement contre l'incendie, en traitant les points dangereux en priorité. C'est souvent la solution la plus raisonnable pour une maison ancienne.",
    prestation: 'mise-en-securite',
    chips: [{ icon: 'shield-check', text: 'Sur devis' }, { icon: 'list-checks', text: '6 points essentiels' }, { icon: 'euro', text: 'Budget maîtrisé' }],
    intro: `## Les six points de sécurité essentiels

Une installation est considérée comme sûre lorsqu'elle remplit six exigences de base. Ce sont elles que je vérifie, puis que je mets à niveau :`,
    includes: [
      'Un appareil général de commande et de protection accessible, pour tout couper d’un geste',
      'Une protection différentielle adaptée à la valeur de la prise de terre, idéalement 30 mA',
      'Une prise de terre et des conducteurs de terre reliés à toutes les prises et masses',
      'Une protection de chaque circuit contre les surintensités, au calibre adapté aux câbles',
      'Des règles respectées dans la salle de bain : volumes et liaison équipotentielle',
      'L’absence de matériel vétuste ou dangereux et de conducteurs nus accessibles',
    ],
    body: `## Mise en sécurité ou rénovation complète ?

La **rénovation complète** consiste à tout refaire selon la norme NF C 15-100 actuelle : nouveaux circuits, nouveaux câbles, nombre de prises par pièce, tableau neuf. C'est l'idéal lors d'une rénovation lourde, quand les murs sont ouverts.

La **mise en sécurité** conserve tout ce qui peut l'être et se concentre sur les dangers. On garde les câbles en bon état, on remplace le tableau ou on ajoute les différentiels, on crée ou on améliore la terre, on supprime les dominos et les fils nus, on reprend la salle de bain. Le budget est généralement bien inférieur, et la sécurité des occupants est assurée.

[[cta]]

## Pourquoi « sur devis » ?

Chaque installation est différente : une maison des années 50 jamais retouchée n'a rien à voir avec un pavillon des années 80 dont seul le tableau a vieilli. Je viens donc voir votre installation, je fais les mesures nécessaires (terre, isolement), puis je vous remets un **devis hiérarchisé** : ce qui est urgent, ce qui est conseillé, ce qui peut attendre. Vous décidez en connaissance de cause, et on peut étaler les travaux.

## Pour qui ?

- Les **acquéreurs** d'une maison ancienne qui veulent emménager en sécurité.
- Les **propriétaires bailleurs**, tenus de louer un logement qui ne présente pas de risque pour la santé et la sécurité des locataires.
- Les **familles** qui accueillent un bébé ou un parent âgé.
- Toute personne qui a reçu un **diagnostic électrique** pointant des anomalies.`,
    steps: [
      { t: 'Visite et mesures', d: 'Contrôle du tableau, de la terre, des circuits et de la salle de bain.' },
      { t: 'Devis hiérarchisé', d: 'Urgent, conseillé, facultatif : vous voyez clairement les priorités.' },
      { t: 'Travaux', d: 'Réalisés en soirée et le week-end, en une ou plusieurs étapes selon votre budget.' },
      { t: 'Contrôle final', d: 'Mesures de terre et tests des différentiels, compte rendu des travaux réalisés.' },
    ],
    prices: ['securite', 'tableau', 'diagnostic'],
    cases: [
      { tag: 'Achat immobilier', icon: 'house', title: 'Diagnostic rouge, budget serré', text: "Un jeune couple achète une maison des années 50. Le diagnostic immobilier liste douze anomalies et l'estimation d'une rénovation complète les inquiète.", result: 'Mise en sécurité en deux week-ends : tableau neuf, terre créée, salle de bain reprise. La rénovation des pièces se fera au fil des travaux.' },
      { tag: 'Location', icon: 'key-round', title: 'Un logement à relouer en sécurité', text: "Entre deux locataires, un propriétaire veut s'assurer que son appartement ne présente pas de danger : prises sans terre et salle de bain sans liaison équipotentielle.", result: 'Différentiels 30 mA, terre raccordée aux prises, liaison équipotentielle refaite, attestation de travaux remise.' },
      { tag: 'Famille', icon: 'shield-check', title: 'Sécuriser avant l’arrivée d’un bébé', text: "Des prises sans volets de protection à hauteur d'enfant et un tableau ancien sans protection 30 mA dans une maison de village.", result: 'Prises à éclipses, ajout de différentiels 30 mA et suppression de deux boîtes de dérivation ouvertes.' },
    ],
    faq: [
      { q: 'Combien coûte une mise en sécurité ?', a: "Cela dépend entièrement de l'état de départ : de quelques centaines d'euros (ajout de différentiels, reprise de quelques points) à davantage si le tableau et la terre sont à refaire. Après visite, le devis détaille chaque poste et ses priorités." },
      { q: 'La mise en sécurité rend-elle l’installation conforme à la norme actuelle ?', a: "Non, et c'est volontaire : elle rend l'installation sûre, pas identique à une construction neuve. Pour la différence entre les deux, voir [mise aux normes NF C 15-100](/mise-aux-normes-electrique/)." },
      { q: 'Peut-on étaler les travaux ?', a: "Oui. Le devis est construit par priorités : on traite d'abord ce qui présente un danger immédiat, puis le reste quand votre budget le permet." },
      { q: 'Remettez-vous un document à la fin ?', a: "Oui, une facture détaillée des travaux réalisés et, sur demande, un compte rendu des mesures (valeur de terre, tests des différentiels), utile pour votre assureur ou votre locataire." },
    ],
    cta: { title: 'Un doute sur la sécurité de votre installation ?', text: 'Je viens faire le point, mesures à l’appui, et je vous propose un plan d’action clair, par priorités.' },
    links: ['/mise-en-securite-electrique-ardennes/', '/mise-a-la-terre/', '/electricite-salle-de-bain/', '/electricien-maison-ancienne/', '/electricien-proprietaire-bailleur/', '/mise-aux-normes-electrique/', '/blog/risques-installation-electrique-ancienne/', '/blog/comment-securiser-son-logement-electricite/'],
  },
];
