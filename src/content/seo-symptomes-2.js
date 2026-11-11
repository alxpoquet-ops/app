// Pages « symptômes » (suite) : pannes fréquentes du quotidien
module.exports = [
  // ------------------------------------------------------------------ COUPURE TOTALE
  {
    slug: 'coupure-courant-maison-entiere', group: 'symptomes', prestation: 'depannage',
    label: 'Plus de courant dans toute la maison',
    title: 'Plus de courant dans toute la maison : que faire ? | ALED08',
    description: "Plus aucune électricité chez vous ? Réseau, disjoncteur général ou différentiel : les vérifications à faire, et quand appeler un électricien dans les Ardennes.",
    chips: [{ icon: 'zap-off', text: 'Coupure totale' }, { icon: 'search', text: 'Les 3 vérifications à faire' }, { icon: 'message-circle', text: 'Dépannage sur RDV, 7 j/7' }],
    kicker: 'Panne · Coupure totale',
    h1: 'Plus de courant dans toute la maison : les bons réflexes',
    lead: "Tout s'éteint d'un coup : lumières, frigo, box. Avant de paniquer, quelques vérifications simples permettent de savoir si la panne vient du réseau, de votre disjoncteur général ou d'un appareil de la maison. Voici l'ordre à suivre.",
    body: `## 1. Regardez autour de vous

Les voisins ont-ils de la lumière ? L'éclairage public fonctionne-t-il ? Si tout le quartier est dans le noir, la panne vient du **réseau public** : c'est Enedis qu'il faut appeler, au numéro de dépannage indiqué sur votre facture. Un électricien ne peut rien faire dans ce cas.

## 2. Le disjoncteur général

Il se trouve près du compteur, souvent à l'entrée ou au garage. S'il est en position basse, réarmez-le **une seule fois**. S'il redéclenche aussitôt, un appareil ou un circuit est en court-circuit.

## 3. Les différentiels du tableau

Si le disjoncteur général est enclenché mais que tout reste éteint, regardez les **interrupteurs différentiels** de votre tableau. Abaissez tous les petits disjoncteurs, réarmez le différentiel, puis remontez les disjoncteurs un par un : celui qui fait tout retomber désigne le circuit en défaut. Laissez-le baissé et récupérez le courant ailleurs.

[[cta]]

## Quand faut-il appeler ?

Écrivez-moi si le disjoncteur général ne tient pas, si un circuit important (chauffage, congélateur) reste en défaut, ou si vous sentez une odeur de brûlé. Je vous annonce le prix du forfait dépannage au téléphone, et sur place je trouve **l'origine exacte** de la coupure avant toute réparation.`,
    cases: [
      { tag: 'Disjoncteur général', icon: 'zap-off', title: 'Tout coupe au démarrage du four', text: "Le disjoncteur de branchement saute dès que le four et la plaque fonctionnent ensemble.", result: 'Installation saine mais puissance souscrite trop juste : conseil d’abonnement et délestage proposé.' },
      { tag: 'Court-circuit', icon: 'triangle-alert', title: 'Un congélateur en cause', text: "Le différentiel principal ne se réarme plus, toute la maison est dans le noir.", result: 'Congélateur du garage en défaut identifié, débranché : le reste de la maison retrouve le courant.' },
      { tag: 'Réseau', icon: 'house', title: 'Une panne qui n’était pas chez soi', text: "Plus de courant un soir d'orage, tableau en ordre.", result: 'Coupure du réseau confirmée au téléphone : orientation vers Enedis, pas de déplacement facturé.' },
    ],
    faq: [
      { q: 'Combien de fois puis-je réarmer le disjoncteur général ?', a: "Une fois. S'il redéclenche immédiatement, ne insistez pas : un défaut est présent et forcer peut aggraver les dégâts." },
      { q: 'Mon congélateur risque-t-il de décongeler ?', a: "Fermé, un congélateur garde le froid plusieurs heures. N'ouvrez pas la porte en attendant le retour du courant." },
      { q: 'Venez-vous le soir ou le week-end ?', a: "Oui, la semaine comme le week-end, sur rendez-vous et au même prix. Envoyez-moi un message : je vous dis quand je peux venir." },
    ],
    cta: { title: 'Toujours dans le noir ?', text: 'Écrivez-moi : je vous guide au téléphone et je vous annonce le prix avant de venir.' },
    links: ['/disjoncteur-qui-saute/', '/differentiel-qui-saute/', '/panne-courant-partielle/', '/linky-qui-disjoncte/', '/electricien-urgence-ardennes/'],
    nearby: ['/depannage-electrique-ardennes/', '/depannage-electrique-charleville-mezieres/', '/depannage-electrique-sedan/', '/depannage-electrique-rethel/'],
    nearbyTitle: 'Dépannage près de chez vous',
  },

  // ------------------------------------------------------------------ VOLET ROULANT
  {
    slug: 'volet-roulant-electrique-en-panne', group: 'symptomes', prestation: 'depannage',
    label: 'Volet roulant électrique en panne',
    title: 'Volet roulant électrique en panne : causes et solutions | ALED08',
    description: "Volet roulant électrique bloqué ou qui ne répond plus ? Alimentation, inverseur, moteur ou fin de course : comment trouver la panne, dans les Ardennes.",
    kicker: 'Panne · Volet roulant',
    h1: 'Volet roulant électrique en panne : alimentation, commande ou moteur ?',
    lead: "Un volet qui reste bloqué en bas, c'est une pièce dans le noir, ou une maison qui ne ferme plus. Avant de changer le moteur, il faut savoir où se situe la panne : l'alimentation, l'interrupteur de commande ou le moteur lui-même.",
    body: `## Les trois causes principales

1. **Pas de courant au volet** : disjoncteur des volets baissé, connexion desserrée dans une boîte de dérivation.
2. **L'inverseur de commande** (le bouton monter/descendre) : contacts usés, surtout sur les volets les plus utilisés.
3. **Le moteur** ou ses **fins de course** : le moteur chauffe et se met en sécurité, ou ses réglages sont perdus.

## Ce que vous pouvez vérifier

Regardez si les autres volets fonctionnent. Si aucun ne répond, le disjoncteur du circuit est probablement en cause. Si un seul volet est bloqué, attendez une vingtaine de minutes : un moteur trop sollicité se coupe par sécurité, puis repart une fois refroidi.

[[cta]]

## Mon intervention

Je mesure la tension à chaque étape : au tableau, à l'interrupteur, puis à l'arrivée du moteur. Je sais ainsi s'il suffit de **remplacer l'inverseur**, de refaire une connexion ou s'il faut changer le moteur. Le remplacement fait l'objet d'un devis, que vous acceptez ou non.`,
    cases: [
      { tag: 'Commande', icon: 'toggle-right', title: 'Le volet ne descend plus', text: "Le volet de la chambre monte, mais ne descend plus.", result: 'Inverseur usé remplacé : le volet fonctionne à nouveau dans les deux sens.' },
      { tag: 'Alimentation', icon: 'cable', title: 'Tous les volets de l’étage bloqués', text: "Aucun volet de l'étage ne répond, alors que ceux du bas fonctionnent.", result: 'Connexion brûlée dans une boîte de dérivation du palier, refaite et contrôlée.' },
      { tag: 'Moteur', icon: 'wrench', title: 'Un moteur en fin de vie', text: "Le volet du séjour bourdonne mais ne bouge plus.", result: 'Tension présente au moteur, moteur défaillant : remplacement sur devis.' },
    ],
    faq: [
      { q: 'Peut-on ouvrir un volet roulant électrique bloqué ?', a: "Certains modèles ont une manivelle de secours. Sinon, ne forcez pas le tablier : vous risquez d'endommager le moteur ou les lames." },
      { q: 'Remplacez-vous les moteurs de volets ?', a: "Oui, sur devis, après avoir vérifié que l'alimentation et la commande ne sont pas en cause." },
      { q: 'Mon volet a une télécommande, intervenez-vous ?', a: "Oui. Je vérifie l'alimentation et le récepteur ; pour un reprogrammage spécifique, je vous indique la marche à suivre selon le fabricant." },
    ],
    cta: { title: 'Un volet bloqué ?', text: 'Je trouve d’où vient la panne avant de changer quoi que ce soit. Prix annoncé avant de venir.' },
    links: ['/interrupteur-qui-ne-fonctionne-plus/', '/panne-courant-partielle/', '/disjoncteur-qui-saute/', '/petits-travaux-electriques/', '/prestations/recherche-de-panne/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-charleville-mezieres/', '/electricien-rethel/'],
    nearbyTitle: 'Électricien près de chez vous',
  },

  // ------------------------------------------------------------------ VMC
  {
    slug: 'vmc-ne-fonctionne-plus', group: 'symptomes', prestation: 'depannage',
    label: 'VMC qui ne fonctionne plus',
    title: 'VMC qui ne fonctionne plus : vérifier l’alimentation | ALED08',
    description: "Votre VMC s'est arrêtée ou fait disjoncter ? Disjoncteur dédié, commande deux vitesses, moteur : les vérifications électriques à faire.",
    kicker: 'Panne · Ventilation',
    h1: 'VMC qui ne fonctionne plus : la panne est-elle électrique ?',
    lead: "Une VMC à l'arrêt, c'est de la condensation sur les vitres et des moisissures qui arrivent vite, surtout dans les maisons ardennaises. Avant de remplacer le caisson, il faut vérifier son alimentation électrique, qui est souvent la vraie cause.",
    body: `## Ce qu'il faut savoir sur la VMC

La VMC doit fonctionner **en permanence**. Elle est normalement alimentée par un **circuit dédié** avec son propre disjoncteur, et souvent commandée par un interrupteur deux vitesses dans la cuisine. Si quelqu'un a coupé ce disjoncteur par erreur, ou si l'interrupteur est défaillant, la ventilation s'arrête sans bruit.

## Les vérifications simples

- Le **disjoncteur VMC** du tableau est-il enclenché ?
- Posez une feuille de papier devant une bouche d'extraction : est-elle aspirée ?
- La grande vitesse fonctionne-t-elle, alors que la petite ne marche plus, ou l'inverse ?

[[cta]]

## Mon intervention

Je contrôle l'alimentation jusqu'au caisson, la commande deux vitesses et l'état du moteur. Si le moteur est en cause, je vous le dis et je chiffre le remplacement du caisson. Si c'est le circuit ou la commande, la réparation est généralement rapide.`,
    cases: [
      { tag: 'Commande', icon: 'toggle-right', title: 'La petite vitesse ne marche plus', text: "La VMC ne tourne plus qu'en grande vitesse, bruyante en permanence.", result: 'Commutateur deux vitesses défectueux, remplacé : les deux vitesses fonctionnent.' },
      { tag: 'Circuit', icon: 'zap-off', title: 'Une VMC coupée depuis des mois', text: "De la moisissure apparaît dans la salle de bain d'une maison récemment achetée.", result: 'Disjoncteur VMC trouvé baissé et non repéré : remis en service et étiqueté.' },
      { tag: 'Moteur', icon: 'wrench', title: 'Le différentiel saute à cause de la VMC', text: "Le différentiel du circuit déclenche quelques secondes après la remise en marche.", result: 'Moteur du caisson en défaut d’isolement : remplacement du caisson sur devis.' },
    ],
    faq: [
      { q: 'Peut-on arrêter la VMC pour économiser ?', a: "Non. Une VMC arrêtée laisse l'humidité s'installer, ce qui abîme le logement et coûte plus cher en chauffage." },
      { q: 'Remplacez-vous le caisson de VMC ?', a: "Oui, sur devis, lorsque le moteur est hors service. Je vérifie d'abord l'alimentation et la commande." },
      { q: 'Ma VMC fait beaucoup de bruit, est-ce électrique ?', a: "Souvent non : c'est plutôt un problème de roulement ou d'encrassement. Je peux toutefois vérifier la commande et l'alimentation." },
    ],
    cta: { title: 'Votre VMC est à l’arrêt ?', text: 'Je vérifie son alimentation et sa commande. Prix annoncé avant de venir.' },
    links: ['/differentiel-qui-saute/', '/electricite-salle-de-bain/', '/panne-courant-partielle/', '/petits-travaux-electriques/', '/prestations/recherche-de-panne/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-sedan/', '/electricien-charleville-mezieres/'],
    nearbyTitle: 'Électricien près de chez vous',
  },

  // ------------------------------------------------------------------ PLAQUE INDUCTION
  {
    slug: 'plaque-induction-qui-disjoncte', group: 'symptomes', prestation: 'prise-specialisee',
    label: 'Plaque à induction qui fait disjoncter',
    title: 'Plaque à induction qui fait disjoncter : pourquoi ? | ALED08',
    description: "Votre plaque à induction fait sauter le disjoncteur ? Ligne trop faible, protection inadaptée, abonnement ou appareil : comment trouver la cause dans les Ardennes.",
    kicker: 'Panne · Plaque de cuisson',
    h1: 'Plaque à induction qui fait disjoncter : ligne, protection ou abonnement ?',
    lead: "Vous venez de passer à l'induction, et le courant coupe dès que plusieurs foyers chauffent ? La plaque n'est pas forcément en cause : c'est souvent la ligne qui l'alimente qui n'est pas adaptée à sa puissance.",
    body: `## Une plaque, une ligne dédiée

Une plaque à induction demande jusqu'à **7 kW**. Elle doit être alimentée par un **circuit dédié**, en câble de 6 mm² protégé par un disjoncteur 32 A, et raccordée par une sortie de câble, pas par une prise ordinaire. Dans les cuisines anciennes, on la trouve parfois sur une ligne prévue pour une simple cuisinière, ou pire, sur le circuit des prises.

## Quel disjoncteur saute ?

- **Le disjoncteur de la plaque** : la ligne ou la protection est trop faible, ou la plaque a un défaut.
- **Le différentiel** : un défaut d'isolement, sur la plaque ou ailleurs sur le même différentiel.
- **Le disjoncteur général** : la puissance souscrite est dépassée quand la plaque, le four et le chauffe-eau fonctionnent ensemble.

[[cta]]

## Ma méthode

Je vérifie la section du câble, la protection, le raccordement de la plaque et la puissance de votre abonnement. Si la ligne est sous-dimensionnée, je vous propose une **nouvelle ligne dédiée** sur devis. Si c'est l'abonnement, je vous explique comment l'ajuster ou répartir les consommations.`,
    cases: [
      { tag: 'Ligne', icon: 'cable', title: 'Une plaque sur un câble trop fin', text: "La nouvelle plaque coupe dès que trois foyers chauffent.", result: 'Câble de 2,5 mm² remplacé par une ligne dédiée en 6 mm² avec disjoncteur 32 A.' },
      { tag: 'Raccordement', icon: 'plug-zap', title: 'Une prise qui noircit derrière la plaque', text: "La plaque était branchée sur une prise 32 A dont les bornes chauffaient.", result: 'Raccordement par sortie de câble, plus fiable, et bornes refaites.' },
      { tag: 'Abonnement', icon: 'gauge', title: 'Tout coupe à l’heure du repas', text: "Le disjoncteur général saute quand plaque, four et chauffe-eau fonctionnent ensemble.", result: 'Installation conforme, puissance souscrite de 6 kVA trop juste : conseil d’abonnement et délestage.' },
    ],
    faq: [
      { q: 'Peut-on brancher une plaque à induction sur une prise normale ?', a: "Non. Une plaque à induction demande une ligne dédiée, protégée en 32 A, et un raccordement par sortie de câble." },
      { q: 'Faut-il augmenter mon abonnement ?', a: "Seulement si le disjoncteur général saute. Si c'est le disjoncteur de la plaque, c'est la ligne qui est en cause, pas l'abonnement." },
      { q: 'Combien coûte une ligne pour plaque à induction ?', a: "Cela dépend de la distance entre le tableau et la cuisine et de la place disponible au tableau : je vous remets un devis gratuit." },
    ],
    cta: { title: 'Votre plaque fait tout couper ?', text: 'Je vérifie la ligne, la protection et l’abonnement. Prix annoncé avant de venir.' },
    links: ['/prise-specialisee/', '/ajout-circuit-electrique/', '/disjoncteur-qui-saute/', '/linky-qui-disjoncte/', '/lave-linge-qui-fait-disjoncter/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-villers-semeuse/', '/electricien-charleville-mezieres/'],
    nearbyTitle: 'Électricien près de chez vous',
  },

  // ------------------------------------------------------------------ LAVE-LINGE
  {
    slug: 'lave-linge-qui-fait-disjoncter', group: 'symptomes', prestation: 'recherche-panne',
    label: 'Lave-linge qui fait disjoncter',
    title: 'Lave-linge qui fait disjoncter : machine ou installation ? | ALED08',
    description: "Votre lave-linge fait sauter le différentiel ou le disjoncteur ? Résistance, prise, circuit partagé : la machine ou l'installation, comment savoir.",
    kicker: 'Panne · Électroménager',
    h1: 'Lave-linge qui fait disjoncter : la machine ou l’installation ?',
    lead: "Le courant coupe au milieu du cycle, souvent au moment où l'eau chauffe. Le réflexe est d'accuser la machine, et c'est parfois justifié. Mais la prise, le circuit ou le différentiel peuvent aussi être en cause. Voici comment faire la différence.",
    body: `## Différentiel ou disjoncteur ?

- **Le différentiel saute** : il y a une fuite de courant. Sur un lave-linge, c'est souvent la **résistance** de chauffe, entartrée ou fissurée, mais une prise humide ou un câble abîmé peuvent produire le même effet.
- **Le disjoncteur du circuit saute** : le circuit est surchargé, par exemple si le lave-linge partage une ligne avec le sèche-linge ou le four.

## Le test simple

Branchez la machine sur une autre prise, d'un autre circuit, avec une rallonge adaptée, juste le temps d'un essai. Si elle fait encore disjoncter, la machine est en cause. Si tout va bien, c'est **l'installation de la buanderie** qu'il faut contrôler.

[[cta]]

## Mon intervention

Je mesure l'isolement de la machine et du circuit séparément. Vous savez ainsi s'il faut faire réparer l'appareil ou si c'est l'installation qui doit être corrigée. Le lave-linge, comme le sèche-linge et le lave-vaisselle, doit disposer de sa **propre ligne protégée en 20 A** : si ce n'est pas le cas, je vous propose de la créer, sur devis.`,
    cases: [
      { tag: 'Résistance', icon: 'droplets', title: 'Le différentiel saute à la chauffe', text: "Le courant coupe toujours au même moment du cycle, quand l'eau commence à chauffer.", result: 'Résistance du lave-linge mesurée en défaut : diagnostic écrit pour le réparateur.' },
      { tag: 'Circuit partagé', icon: 'plug-zap', title: 'Lave-linge et sèche-linge ensemble', text: "Les deux machines branchées sur le même circuit faisaient sauter le disjoncteur.", result: 'Ligne dédiée créée pour le sèche-linge, plus aucune coupure.' },
      { tag: 'Prise', icon: 'plug', title: 'Une prise humide au sous-sol', text: "La machine du sous-sol fait disjoncter, mais fonctionne parfaitement à l'étage.", result: 'Prise oxydée remplacée par un modèle étanche, posé plus haut.' },
    ],
    faq: [
      { q: 'Puis-je utiliser une multiprise pour le lave-linge ?', a: "Non. Un lave-linge doit être branché directement sur sa prise, idéalement sur un circuit dédié protégé en 20 A." },
      { q: 'Réparez-vous les lave-linge ?', a: "Non, mais je vous dis si la panne vient de la machine ou de l'installation, pour que vous appeliez la bonne personne." },
      { q: 'Le lave-linge peut-il être dans la salle de bain ?', a: "Oui, à condition de respecter les volumes de sécurité et d'être protégé par un différentiel 30 mA." },
    ],
    cta: { title: 'Votre machine fait tout couper ?', text: 'Je sépare la machine et l’installation pour trouver la vraie cause. Prix annoncé avant.' },
    links: ['/differentiel-qui-saute/', '/disjoncteur-qui-saute/', '/prise-specialisee/', '/electricite-salle-de-bain/', '/plaque-induction-qui-disjoncte/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-rethel/', '/electricien-sedan/'],
    nearbyTitle: 'Électricien près de chez vous',
  },

  // ------------------------------------------------------------------ INTERRUPTEUR
  {
    slug: 'interrupteur-qui-ne-fonctionne-plus', group: 'symptomes', prestation: 'prises',
    label: 'Interrupteur qui ne fonctionne plus',
    title: 'Interrupteur qui ne fonctionne plus : causes et réparation | ALED08',
    description: "Un interrupteur qui ne commande plus la lumière, qui grésille ou qui chauffe ? Ampoule, connexion, va-et-vient : les causes et la réparation par un électricien.",
    kicker: 'Panne · Interrupteur',
    h1: 'Interrupteur qui ne fonctionne plus : ampoule, connexion ou va-et-vient ?',
    lead: "Vous appuyez, rien ne s'allume. Avant d'accuser l'interrupteur, vérifiez l'ampoule et le disjoncteur de l'éclairage. Si tout est en ordre, la panne vient de l'interrupteur, de ses connexions ou du câblage entre deux interrupteurs.",
    body: `## Les vérifications de base

1. **Changez l'ampoule**, en essayant une ampoule qui fonctionne ailleurs.
2. Vérifiez le **disjoncteur du circuit d'éclairage** au tableau.
3. Si la lumière est commandée depuis deux endroits, essayez **l'autre interrupteur** : c'est peut-être lui qui est en cause.

## Les signes qui doivent alerter

- Un interrupteur qui **grésille** ou qui **chauffe** au toucher.
- Une **odeur de plastique chaud** près de l'interrupteur.
- Une lumière qui **clignote** quand on effleure la touche.

Dans ces cas, une connexion est desserrée ou abîmée : coupez le disjoncteur du circuit et faites intervenir un électricien.

[[cta]]

## La réparation

Je contrôle l'interrupteur, ses bornes et le câblage, en particulier sur les **va-et-vient**, souvent mal raccordés lors d'un remplacement. Le remplacement d'un interrupteur est rapide ; j'en profite pour vérifier les autres points du circuit si vous le souhaitez.`,
    cases: [
      { tag: 'Va-et-vient', icon: 'toggle-right', title: 'Un couloir qui ne s’allume que d’un côté', text: "Depuis le remplacement d'un interrupteur, la lumière du couloir ne marche plus que d'un seul bout.", result: 'Va-et-vient mal recâblé lors du remplacement : fils remis dans le bon ordre.' },
      { tag: 'Connexion', icon: 'triangle-alert', title: 'Un interrupteur qui grésille', text: "L'interrupteur de la cuisine grésille et sa plaque est tiède.", result: 'Borne desserrée et noircie : interrupteur et extrémité du câble remplacés.' },
      { tag: 'Usure', icon: 'lightbulb', title: 'Une touche qui accroche', text: "L'interrupteur de l'entrée ne bascule plus franchement et la lumière clignote.", result: 'Mécanisme usé remplacé par un interrupteur neuf de la même gamme.' },
    ],
    faq: [
      { q: 'Puis-je changer un interrupteur moi-même ?', a: "C'est possible en coupant le bon disjoncteur, mais les va-et-vient sont souvent mal recâblés. En cas de doute, faites appel à un électricien." },
      { q: 'Un interrupteur qui chauffe est-il dangereux ?', a: "Oui : c'est le signe d'une mauvaise connexion. Coupez le circuit et faites-le contrôler rapidement." },
      { q: 'Pouvez-vous remplacer tous les interrupteurs d’une maison ?', a: "Oui, sur devis gratuit, avec la gamme d'appareillage de votre choix." },
    ],
    cta: { title: 'Un interrupteur en panne ?', text: 'Je le répare ou le remplace, et je vérifie le circuit. Prix annoncé avant de venir.' },
    links: ['/lumiere-qui-clignote/', '/prise-qui-chauffe/', '/prestations/prises-et-interrupteurs/', '/petits-travaux-electriques/', '/volet-roulant-electrique-en-panne/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-charleville-mezieres/', '/electricien-rethel/'],
    nearbyTitle: 'Électricien près de chez vous',
  },
];
