// Pages thématiques « Ardennes » et service × ville
module.exports = [
  // ------------------------------------------------------------------ ÉLECTRICIEN ARDENNES
  {
    slug: 'electricien-ardennes', group: 'ardennes', prestation: 'depannage',
    label: 'Électricien dans les Ardennes',
    title: 'Électricien dans les Ardennes (08) pour particuliers | ALED08',
    description: 'Électricien indépendant dans les Ardennes : dépannage, recherche de panne, tableau, prises, éclairage, mise en sécurité. Soirs et week-ends, tarifs publiés.',
    kicker: 'Électricien · Ardennes (08)',
    h1: 'Électricien dans les Ardennes, pour les particuliers',
    lead: "ALED08 intervient chez les particuliers de tout le département des Ardennes pour le dépannage, la recherche de panne et les petits et moyens travaux électriques. Avec une particularité : je travaille le soir et le week-end, quand vous êtes chez vous.",
    body: `## Un parc de logements qui a vieilli

Les Ardennes comptent une proportion importante de logements anciens : maisons de bourg, fermes, maisons de la Reconstruction, pavillons des années 60 et 70. Beaucoup ont connu plusieurs rénovations partielles, rarement une réfection électrique complète. On y retrouve donc très souvent :

- des **tableaux à fusibles** ou des tableaux sans protection différentielle 30 mA ;
- des **prises sans terre** dans les pièces les plus anciennes ;
- des **circuits surchargés** par les usages modernes (électroménager, chauffage d'appoint, informatique) ;
- des **dépendances alimentées de façon provisoire**… depuis des années.

Rien de tout cela n'impose de tout refaire. Mais cela demande un électricien qui sache **hiérarchiser** : ce qui est dangereux, ce qui est gênant, ce qui peut attendre.

## Comment bien choisir son électricien

Quelques repères simples, que je m'applique à moi-même :

1. Il annonce le **prix de son intervention** (déplacement, recherche de panne) avant de venir.
2. Il remet un **devis écrit** pour tous travaux importants, détaillé ligne par ligne.
3. Il est **assuré** et l'indique sur ses devis et factures.
4. Il **explique** ce qu'il a trouvé, sans jargon et sans dramatiser.
5. Il ne propose **que les travaux utiles**, et sait dire quand un remplacement n'est pas nécessaire.

[[cta]]

## Ma zone dans le département

J'interviens dans tout le département : Charleville-Mézières et son agglomération, Sedan, Rethel et le Rethélois, Rocroi et son plateau, la vallée de la Meuse jusqu'à Revin, Fumay et Givet, Vouziers et l'Argonne, le Porcien, la Thiérache ardennaise et les Crêtes préardennaises.`,
    cases: [
      { tag: 'Rethélois', icon: 'house', title: 'Une maison des années 60 restée d’origine', text: "Tableau à fusibles, deux prises par pièce, aucune terre à l'étage. Les propriétaires pensaient devoir tout refaire.", result: 'Tableau neuf et terre créée en priorité ; les pièces seront reprises au fil de la rénovation.' },
      { tag: 'Agglomération de Charleville', icon: 'plug-zap', title: 'Un appartement aux multiprises en cascade', text: "Un T2 avec une seule prise dans le séjour, prolongée par trois multiprises pour la télévision, la box et l'ordinateur.", result: 'Trois prises supplémentaires sur un circuit existant qui le permettait, multiprises supprimées.' },
      { tag: 'Thiérache', icon: 'warehouse', title: 'Une grange alimentée « provisoirement » depuis 1985', text: "Un câble souple courant au sol entre la maison et la grange, branché sur une prise de la buanderie.", result: 'Ligne enterrée conforme, tableau secondaire et éclairage étanche dans la grange.' },
    ],
    faq: [
      { q: 'Intervenez-vous dans tout le département des Ardennes ?', a: "Oui, dans toutes les communes des Ardennes. Le prix du forfait dépannage vous est annoncé au téléphone, avant que je me déplace." },
      { q: 'Êtes-vous disponible en semaine dans la journée ?', a: "Oui : j'interviens 7 j/7, sur rendez-vous, en journée comme le soir ou le week-end. On choisit ensemble le créneau qui vous convient." },
      { q: 'Travaillez-vous seul ?', a: "Oui. C'est moi qui réponds au téléphone, qui viens chez vous et qui réalise les travaux. Vous avez un seul interlocuteur, du premier appel à la facture." },
    ],
    cta: { title: 'Un électricien dans les Ardennes, le soir ou le week-end', text: 'Envoyez-moi un message ou décrivez votre besoin : je vous réponds avec un prix et un créneau.' },
    links: ['/zone-intervention/', '/prestations/', '/tarifs/', '/electricien-signy-l-abbaye/', '/electricien-charleville-mezieres/', '/electricien-rethel/', '/blog/pourquoi-faire-appel-a-un-electricien-local/'],
    nearby: ['/electricien-rethel/', '/electricien-charleville-mezieres/', '/electricien-sedan/', '/electricien-rocroi/', '/electricien-signy-l-abbaye/'],
    nearbyTitle: 'Principales communes',
  },

  // ------------------------------------------------------------------ DÉPANNAGE ARDENNES
  {
    slug: 'depannage-electrique-ardennes', group: 'ardennes', prestation: 'depannage',
    label: 'Dépannage électrique Ardennes',
    title: 'Dépannage électrique Ardennes, soirs & week-ends | ALED08',
    description: "Dépannage électrique dans les Ardennes le soir et le week-end : plus de courant, disjoncteur qui saute, panne partielle. Forfait sur devis, annoncé avant de venir.",
    kicker: 'Dépannage · Ardennes',
    h1: 'Dépannage électrique dans les Ardennes, le soir et le week-end',
    lead: "Vous rentrez du travail et une partie de la maison est dans le noir ? Le disjoncteur refuse de se réarmer un samedi matin ? Dans les Ardennes, j'assure le dépannage électrique des particuliers sur les créneaux où vous êtes chez vous, avec un prix annoncé avant de venir.",
    body: `## Comment j'organise les dépannages

Quand vous m'écrivez ou m'appelez, c'est moi qui réponds. Je vous pose quelques questions pour **évaluer l'urgence** et préparer l'intervention :

- Avez-vous encore du courant dans une partie du logement ?
- Quelle protection a déclenché, et se réarme-t-elle ?
- Y a-t-il une odeur, une trace de chauffe, un bruit ?
- Des personnes fragiles ou des équipements vitaux sont-ils concernés (congélateur plein, personne âgée, appareil médical) ?

Ces réponses me permettent de **prioriser** : une maison entièrement sans courant en hiver passe avant une prise de chambre hors service. Je vous propose ensuite le premier créneau disponible, le soir même quand c'est possible.

## Enedis ou électricien : qui appeler ?

!> Si votre compteur est éteint et que les voisins sont aussi privés de courant, la panne vient du réseau. Contactez le dépannage Enedis des Ardennes au 09 726 750 08, joignable à toute heure.

Si votre compteur est allumé et que vos voisins ont du courant, la panne se situe dans votre installation : c'est mon domaine.

[[cta]]

## Ce que coûte un dépannage

Un dépannage commence toujours par le **forfait dépannage**, dont je vous annonce le prix au téléphone avant de venir. Il couvre mon déplacement, la recherche de la panne, la solution proposée et un **devis de réparation que vous êtes libre de refuser**. La **réparation** et les pièces ne sont réalisées qu'après acceptation de ce devis : vous gardez la main sur la dépense. Pour le détail, lire [quel est le prix d'un dépannage électrique](/blog/prix-depannage-electrique/).`,
    cases: [
      { tag: 'Priorité hiver', icon: 'thermometer', title: 'Plus de chauffage chez une personne âgée', text: "Un dimanche de janvier, le circuit des radiateurs d'une habitante de 79 ans ne se réarme plus. Sa fille appelle à 10 h.", result: 'Intervention avant midi : un radiateur en court-circuit isolé, chauffage rétabli dans les autres pièces.' },
      { tag: 'Congélateur', icon: 'zap-off', title: 'Un congélateur plein à sauver', text: "Retour de week-end : le différentiel du sous-sol a déclenché depuis la veille et ne se réarme pas. Le congélateur est plein.", result: 'Le congélateur est rebranché sur un circuit sain en attendant, puis le défaut (prise du sous-sol) est réparé.' },
      { tag: 'Soirée', icon: 'moon', title: 'La cuisine dans le noir un mardi soir', text: "Plus d'éclairage dans la cuisine et le séjour à 19 h, en plein repas. Le disjoncteur de l'éclairage saute à chaque réarmement.", result: 'Douille de suspension en court-circuit localisée et remplacée : lumière rétablie avant 21 h.' },
    ],
    faq: [
      { q: 'Quand êtes-vous disponible ?', a: "À tout moment, sur rendez-vous : écrivez-moi, nous fixons ensemble le créneau le plus proche. Les coupures du réseau public relèvent d'Enedis, joignable jour et nuit." },
      { q: 'Que faire en attendant votre arrivée ?', a: "Laissez la protection qui a déclenché en position basse, débranchez les appareils de la zone et, en cas d'odeur de brûlé, coupez le disjoncteur général. Ne réarmez pas plusieurs fois de suite." },
      { q: 'Facturez-vous plus cher un dépannage le dimanche ?', a: "Non. Les tarifs sont identiques tous les jours de la semaine, soirées comprises." },
    ],
    cta: { title: 'Une panne en cours ?', text: 'Écrivez-moi directement : c’est le moyen le plus rapide pour obtenir un créneau ce soir ou ce week-end.' },
    links: ['/prestations/depannage-electrique/', '/electricien-urgence-ardennes/', '/disjoncteur-qui-saute/', '/differentiel-qui-saute/', '/panne-courant-partielle/', '/depannage-electrique-rethel/', '/depannage-electrique-charleville-mezieres/'],
    nearby: ['/depannage-electrique-rethel/', '/depannage-electrique-charleville-mezieres/', '/depannage-electrique-sedan/', '/electricien-signy-l-abbaye/'],
    nearbyTitle: 'Dépannage par ville',
  },

  // ------------------------------------------------------------------ RECHERCHE DE PANNE ARDENNES
  {
    slug: 'recherche-panne-electrique-ardennes', group: 'ardennes', prestation: 'recherche-panne',
    label: 'Recherche de panne électrique Ardennes',
    title: 'Recherche de panne électrique Ardennes, mesures | ALED08',
    description: "Recherche de panne électrique dans les Ardennes avec de vrais appareils de mesure : isolement, terre, différentiels. Prix annoncé avant de venir.",
    kicker: 'Recherche de panne · Ardennes',
    h1: 'Recherche de panne électrique dans les Ardennes : ce que disent les mesures',
    lead: "Une panne électrique se trouve rarement « au feeling ». Elle se trouve avec des mesures, et un peu de méthode. Voici comment je travaille quand on m'appelle dans les Ardennes pour une panne que personne n'a réussi à localiser.",
    body: `## Les outils de la recherche de panne

Chaque appareil répond à une question précise :

- **Le multimètre** : y a-t-il bien 230 V à cet endroit ? Le circuit est-il coupé ou continu ?
- **Le contrôleur d'isolement** : le courant fuit-il entre les conducteurs et la terre ? C'est l'outil clé pour les différentiels qui sautent.
- **Le testeur de différentiel** : la protection déclenche-t-elle au bon seuil, et assez vite ?
- **La pince ampèremétrique** : quel courant circule réellement dans ce câble ? Un appareil consomme-t-il anormalement ?
- **La mesure de terre** : la prise de terre est-elle assez efficace pour évacuer un défaut ?

## Lire une valeur, c'est comprendre une panne

Prenons l'exemple d'un différentiel qui saute « tout seul ». Une mesure d'isolement élevée sur tous les circuits, maison débranchée, indique que l'installation est saine : le coupable est alors **un appareil**. À l'inverse, un circuit qui présente une valeur faible désigne une zone précise : il ne reste plus qu'à chercher la boîte, la prise ou le câble en défaut sur ce circuit.

Cette démarche évite de remplacer des pièces au hasard. Elle permet aussi de vous dire honnêtement quand l'électricité n'est pas en cause, mais votre lave-linge ou votre chauffe-eau.

[[cta]]

## Les pannes typiques du climat ardennais

Le climat humide et frais du département favorise certaines pannes : condensation dans les boîtes extérieures, câbles enterrés anciens qui prennent l'eau, caves où l'appareillage s'oxyde. Ces défauts sont souvent **intermittents** : ils apparaissent avec la pluie ou le froid et disparaissent ensuite. La mesure d'isolement, réalisée dans de bonnes conditions, les révèle même quand ils ne se manifestent pas.`,
    cases: [
      { tag: 'Mesure d’isolement', icon: 'gauge', title: 'Le lave-linge accusé à tort', text: "Un différentiel qui saute au moment de l'essorage : le lave-linge semblait coupable. La mesure révèle pourtant un isolement faible sur le circuit, pas sur l'appareil.", result: 'Boîte de dérivation humide derrière le lave-linge, refaite : l’appareil fonctionne parfaitement.' },
      { tag: 'Pince ampèremétrique', icon: 'zap', title: 'Un chauffe-eau qui consommait la nuit… et le jour', text: "Un disjoncteur qui chauffe et des factures en hausse. La pince montre que le chauffe-eau fonctionne en permanence.", result: 'Contacteur jour/nuit bloqué en position forcée, remplacé : retour au fonctionnement en heures creuses.' },
      { tag: 'Terre', icon: 'shield-check', title: 'Des picotements en touchant l’évier', text: "Une légère sensation de picotement en touchant l'évier métallique et le robinet.", result: 'Prise de terre déconnectée retrouvée sous un regard de jardin, refaite et mesurée.' },
    ],
    faq: [
      { q: 'La recherche de panne est-elle comprise dans le forfait ?', a: "Oui : elle fait partie du forfait dépannage, annoncé avant de venir, qui inclut aussi le déplacement et le devis de réparation. La réparation n'est faite que si vous acceptez ce devis." },
      { q: 'Et si la panne vient d’un appareil électroménager ?', a: "Je vous le dis clairement, mesures à l'appui. Je ne répare pas l'électroménager, mais vous savez exactement où agir : réparateur, garantie ou remplacement." },
      { q: 'Faut-il que la panne soit présente au moment de votre venue ?', a: "C'est préférable, mais pas indispensable : la mesure d'isolement révèle souvent un défaut même quand il ne fait pas déclencher à ce moment-là." },
    ],
    cta: { title: 'Une panne que personne ne trouve ?', text: 'Je viens avec les appareils de mesure et je cherche méthodiquement, le soir ou le week-end.' },
    links: ['/prestations/recherche-de-panne/', '/differentiel-qui-saute/', '/disjoncte-quand-il-pleut/', '/mise-a-la-terre/', '/blog/comment-trouver-une-panne-electrique/'],
    nearby: ['/electricien-rethel/', '/electricien-charleville-mezieres/', '/electricien-signy-l-abbaye/', '/electricien-rocroi/'],
    nearbyTitle: 'Principales communes',
  },

  // ------------------------------------------------------------------ TABLEAU ARDENNES
  {
    slug: 'tableau-electrique-ardennes', group: 'ardennes', prestation: 'tableau',
    label: 'Tableau électrique Ardennes',
    title: 'Tableau électrique Ardennes : remplacement sur devis | ALED08',
    description: "Remplacement de tableau électrique dans les Ardennes : composition selon la surface, différentiels 30 mA, repérage, 20 % de réserve. Devis gratuit, pose le samedi.",
    kicker: 'Tableau électrique · Ardennes',
    h1: 'Tableau électrique dans les Ardennes : bien le dimensionner',
    lead: "Un tableau électrique ne se choisit pas sur catalogue. Sa composition dépend de la surface du logement, du nombre de circuits, du mode de chauffage et des appareils que vous utilisez. Voici comment je conçois un tableau neuf pour les maisons et appartements des Ardennes.",
    body: `## Les règles qui guident la composition

La norme NF C 15-100 encadre précisément la composition d'un tableau. Les principes essentiels :

- **Tous les circuits sont protégés par un différentiel 30 mA.** Le nombre d'interrupteurs différentiels augmente avec la surface du logement, et un même différentiel ne doit pas protéger trop de circuits.
- **Certains circuits demandent un différentiel de type A** (ou F selon les cas) : plaque de cuisson, lave-linge, recharge de véhicule électrique.
- **Chaque circuit a son disjoncteur**, au calibre adapté à la section du câble : 16 A pour des prises en 1,5 mm², 20 A en 2,5 mm², 32 A pour une plaque en 6 mm².
- **Une réserve d'au moins 20 %** doit rester disponible pour les évolutions futures.

## Les cas que je rencontre dans le département

### La maison chauffée à l'électricité

Avec plusieurs circuits de radiateurs, un chauffe-eau et parfois un plancher chauffant, le tableau grandit vite. Je répartis les circuits de chauffage sur plusieurs différentiels pour éviter qu'un seul défaut ne coupe toute la maison en plein hiver.

### L'appartement

Le tableau doit tenir dans un espace restreint, souvent dans l'entrée. Un coffret bien organisé, avec des peignes et un repérage clair, reste lisible même compact.

### La maison avec dépendances

Garage, atelier ou grange gagnent à avoir leur propre départ, voire un tableau secondaire. Un défaut dans l'atelier ne doit pas priver la maison de courant.

[[cta]]

## Le choix du matériel

J'utilise du matériel de grandes marques, disponible partout, pour que n'importe quel électricien puisse intervenir dessus dans vingt ans. Un tableau monté avec des pièces introuvables est un mauvais service rendu au client.`,
    cases: [
      { tag: 'Chauffage électrique', icon: 'thermometer', title: 'Une maison de 140 m² tout électrique', text: "Neuf radiateurs, un chauffe-eau de 300 litres et un seul différentiel pour l'ensemble. Le moindre défaut coupait tout le chauffage.", result: 'Tableau de quatre rangées, chauffage réparti sur trois différentiels, délestage conservé.' },
      { tag: 'Appartement', icon: 'building-2', title: 'Un tableau dans un placard de 30 cm', text: "Un T3 dont le tableau, logé dans un placard d'entrée étroit, débordait de fils.", result: 'Coffret deux rangées, peignes, repérage complet : tout tient proprement dans le placard.' },
      { tag: 'Dépendances', icon: 'warehouse', title: 'Une maison et deux bâtiments', text: "Une maison avec garage et atelier séparés, tout alimenté depuis le tableau de la cuisine.", result: 'Tableau principal refait et tableau secondaire dans l’atelier, chacun avec ses protections.' },
    ],
    faq: [
      { q: 'Combien de différentiels faut-il dans un tableau ?', a: "Au minimum deux pour un petit logement, davantage à mesure que la surface et le nombre de circuits augmentent. Je les détermine selon votre logement et ses équipements." },
      { q: 'Quel est le prix d’un tableau neuf dans les Ardennes ?', a: "Il dépend du nombre de circuits, du nombre et du type de différentiels et des reprises éventuelles. Je ne donne donc pas de prix « à partir de » : je compte vos circuits et je vous remets un devis gratuit et détaillé." },
      { q: 'Puis-je ajouter un circuit plus tard ?', a: "Oui : c'est précisément le rôle de la réserve de 20 %. Un tableau bien conçu accepte une plaque à induction ou une recharge de voiture sans être remplacé." },
    ],
    cta: { title: 'Un tableau à remplacer dans les Ardennes ?', text: 'Je viens compter vos circuits et je vous remets un devis détaillé, gratuitement.' },
    links: ['/prestations/tableau-electrique/', '/remplacement-tableau-a-fusibles/', '/remplacement-tableau-electrique-rethel/', '/remplacement-tableau-electrique-charleville-mezieres/', '/blog/pourquoi-remplacer-un-tableau-electrique/'],
    nearby: ['/remplacement-tableau-electrique-rethel/', '/remplacement-tableau-electrique-charleville-mezieres/', '/electricien-thin-le-moutier/', '/electricien-launois-sur-vence/'],
    nearbyTitle: 'Tableau près de chez vous',
  },

  // ------------------------------------------------------------------ MISE EN SÉCURITÉ ARDENNES
  {
    slug: 'mise-en-securite-electrique-ardennes', group: 'ardennes', prestation: 'mise-en-securite',
    label: 'Mise en sécurité électrique Ardennes',
    title: 'Mise en sécurité électrique Ardennes, sur devis | ALED08',
    description: 'Mise en sécurité électrique dans les Ardennes : anomalies fréquentes, ordre des priorités, devis hiérarchisé et travaux le soir ou le week-end.',
    kicker: 'Mise en sécurité · Ardennes',
    h1: 'Mise en sécurité électrique dans les Ardennes : les bonnes priorités',
    lead: "Une mise en sécurité réussie, c'est d'abord un bon ordre de priorité. Après des visites dans de nombreuses maisons ardennaises, voici les anomalies que je rencontre le plus souvent, et l'ordre dans lequel je recommande de les traiter.",
    body: `## Les anomalies les plus fréquentes

Classées de la plus urgente à la moins urgente :

1. **Conducteurs nus ou dominos accessibles** : risque de contact direct, à supprimer immédiatement.
2. **Absence de différentiel 30 mA** : la protection des personnes contre l'électrocution n'est pas assurée.
3. **Fusibles surcalibrés ou « réparés »** : les câbles ne sont plus protégés contre la surchauffe.
4. **Prise de terre absente ou inefficace** : les fuites de courant ne sont pas évacuées.
5. **Salle de bain non conforme** : prises ou luminaires dans les volumes interdits, liaison équipotentielle absente.
6. **Matériel vétuste** : prises fendues, interrupteurs en porcelaine fissurés, douilles en laiton.
7. **Circuits surchargés** : trop de prises ou de radiateurs sur un même circuit.

## Pourquoi cet ordre ?

Les trois premiers points présentent un **danger immédiat**, pour un coût souvent modeste. Les points suivants demandent parfois plus de travaux, mais leur absence ne présente pas le même niveau d'urgence lorsque les différentiels 30 mA sont en place. C'est cette logique qui permet de **sécuriser vite et à budget maîtrisé**, puis de compléter progressivement.

[[cta]]

## Le devis hiérarchisé

Après la visite, vous recevez un devis organisé en trois blocs :

- **À faire immédiatement** : les dangers pour les personnes.
- **À faire dans l'année** : ce qui améliore nettement la sécurité et le confort.
- **À prévoir lors de travaux** : ce qui pourra être intégré à une future rénovation.

Vous pouvez valider un seul bloc, ou tout. Rien n'est imposé.`,
    cases: [
      { tag: 'Priorité 1', icon: 'triangle-alert', title: 'Des dominos dans le faux plafond de la cuisine', text: "En démontant un luminaire, une propriétaire découvre plusieurs dominos sans boîte, dont un dont l'isolant a fondu.", result: 'Boîte de dérivation posée, connexions refaites par bornes automatiques, contrôle des autres points lumineux.' },
      { tag: 'Priorité 2', icon: 'shield-check', title: 'Une maison sans aucun 30 mA', text: "Une maison des années 70 protégée uniquement par un différentiel 500 mA de branchement.", result: 'Ajout de deux interrupteurs différentiels 30 mA en tête des circuits existants, en une soirée.' },
      { tag: 'Priorité 5', icon: 'bath', title: 'Une prise à côté de la baignoire', text: "Une prise ordinaire posée à 30 cm de la baignoire pour le sèche-cheveux.", result: 'Prise déplacée hors volume, liaison équipotentielle réalisée lors du même passage.' },
    ],
    faq: [
      { q: 'Combien coûte une mise en sécurité dans les Ardennes ?', a: "Le budget dépend de l'état de départ et des blocs retenus. Les priorités 1 et 2 représentent souvent une dépense raisonnable ; le devis détaille chaque ligne." },
      { q: 'La visite pour le devis est-elle longue ?', a: "Comptez environ une heure pour une maison : contrôle du tableau, de la terre, de la salle de bain et d'un échantillon de prises et de points lumineux." },
      { q: 'Peut-on habiter pendant les travaux ?', a: "Oui. Les coupures de courant sont limitées à quelques heures et annoncées à l'avance." },
    ],
    cta: { title: 'Faire le point sur la sécurité de votre maison', text: 'Je viens, je mesure, et vous recevez un devis classé par priorités. Vous décidez ensuite.' },
    links: ['/prestations/mise-en-securite/', '/mise-aux-normes-electrique/', '/electricien-maison-ancienne/', '/electricite-salle-de-bain/', '/blog/risques-installation-electrique-ancienne/'],
    nearby: ['/electricien-rethel/', '/electricien-charleville-mezieres/', '/electricien-chateau-porcien/', '/electricien-attigny/'],
    nearbyTitle: 'Près de chez vous',
  },

  // ------------------------------------------------------------------ SOIRÉE
  {
    slug: 'electricien-soiree-ardennes', group: 'ardennes', prestation: 'depannage',
    label: 'Électricien le soir dans les Ardennes',
    title: 'Électricien le soir dans les Ardennes, sur rendez-vous | ALED08',
    description: 'Électricien le soir dans les Ardennes, après votre journée de travail : dépannage, prises, luminaires, diagnostic. Sans majoration, sur RDV.',
    kicker: 'Disponibilités · En soirée',
    h1: 'Un électricien le soir, après votre journée de travail',
    lead: "ALED08 intervient toute la semaine, y compris en soirée : je me déplace chez les particuliers des Ardennes pour les dépannages et les petits travaux. Vous n'avez pas à poser de congé : j'interviens quand vous êtes rentré, au même tarif qu'en journée.",
    body: `## Ce qui se fait très bien en soirée

Une soirée d'intervention dure en général d'une à trois heures. C'est le format idéal pour :

- un **dépannage** ou une **recherche de panne** ;
- le **remplacement de prises et d'interrupteurs**, même en nombre ;
- la **pose de luminaires**, de plafonniers ou d'appliques ;
- l'**ajout d'un point lumineux** ou d'une prise ;
- le **remplacement d'un disjoncteur** ;
- une **visite de devis** pour des travaux plus importants.

Les chantiers plus longs, comme un remplacement de tableau, demandent une coupure prolongée : je les programme plutôt le samedi.

## Travailler de nuit, ça se prépare

En hiver, il fait nuit dès 17 h. Je viens donc avec **mon propre éclairage de chantier** sur batterie, indispensable quand on coupe le courant pour travailler en sécurité. De votre côté, quelques gestes facilitent l'intervention :

- dégager l'accès au tableau électrique ;
- repérer les pièces ou prises concernées ;
- prévoir, si possible, une place pour garer le véhicule à proximité.

[[cta]]

## Pourquoi pas de majoration ?

Chez ALED08, la soirée est un **créneau normal de travail**, choisi dès le départ. Il n'y a donc aucune raison de vous le facturer plus cher.`,
    cases: [
      { tag: 'Après le travail', icon: 'clock', title: 'Trois prises et deux interrupteurs après le travail', text: "Un couple qui travaille à Charleville voulait remplacer l'appareillage abîmé du séjour sans perdre une journée.", result: 'Intervention en début de soirée, tout est remplacé et testé avant le dîner.' },
      { tag: 'Le soir même', icon: 'search', title: 'Une panne découverte en rentrant', text: "En rentrant du travail, une famille constate que le circuit des chambres ne fonctionne plus.", result: 'Rendez-vous le soir même, borne desserrée retrouvée dans une boîte de dérivation du couloir, réparée.' },
      { tag: 'Visite de devis', icon: 'file-text', title: 'Une visite de devis sans poser de congé', text: "Des propriétaires souhaitaient faire chiffrer le remplacement de leur tableau, mais travaillent tous les deux en journée.", result: 'Visite en soirée, devis envoyé le lendemain, travaux réalisés le samedi suivant.' },
    ],
    faq: [
      { q: 'Jusqu’à quelle heure intervenez-vous le soir ?', a: "Il n'y a pas d'heure limite affichée : on convient du créneau ensemble, au téléphone. Pour un dépannage qui s'avère plus long, on décide ensemble de la suite." },
      { q: 'Peut-on travailler sans lumière si le courant est coupé ?', a: "Oui : j'apporte un éclairage autonome. C'est d'ailleurs indispensable pour travailler hors tension en toute sécurité." },
      { q: 'Le soir, est-ce plus cher ?', a: "Non, mes tarifs sont identiques tous les jours." },
    ],
    cta: { title: 'Un rendez-vous ce soir ?', text: 'Écrivez-moi dès que possible : plus tôt vous me contactez, plus j’ai de chances de vous proposer un créneau dans la soirée.' },
    links: ['/electricien-week-end-ardennes/', '/prestations/depannage-electrique/', '/prestations/prises-et-interrupteurs/', '/petits-travaux-electriques/', '/tarifs/'],
    nearby: ['/electricien-charleville-mezieres/', '/electricien-rethel/', '/electricien-poix-terron/', '/electricien-signy-l-abbaye/'],
    nearbyTitle: 'Principales communes',
  },

  // ------------------------------------------------------------------ WEEK-END
  {
    slug: 'electricien-week-end-ardennes', group: 'ardennes', prestation: 'tableau',
    label: 'Électricien le week-end dans les Ardennes',
    title: 'Électricien le week-end dans les Ardennes, samedi, dimanche | ALED08',
    description: "Électricien le samedi et le dimanche dans les Ardennes : tableau, mise en sécurité, éclairage, dépannage. Mêmes tarifs qu'en semaine, sur rendez-vous.",
    kicker: 'Disponibilités · Week-end',
    h1: 'Électricien le week-end : samedi et dimanche sur rendez-vous',
    lead: "Le samedi comme le dimanche, sur rendez-vous, j'interviens chez les particuliers des Ardennes. C'est le moment idéal pour les chantiers qui demandent du temps (tableau, mise en sécurité, éclairage extérieur), comme pour les pannes qui surviennent en fin de semaine.",
    body: `## Le samedi, jour des chantiers

Une journée complète permet de réaliser les travaux qui nécessitent une coupure prolongée ou plusieurs heures de pose :

- **Remplacement de tableau électrique** : de quatre à huit heures selon la maison.
- **Mise en sécurité** : terre, différentiels, salle de bain en une ou deux journées.
- **Création de circuits** : plaque à induction, recharge de voiture, extension.
- **Éclairage extérieur** avec ligne enterrée, de préférence de jour pour les tranchées.

Vous êtes présent, vous voyez le travail avancer, et je peux vous expliquer chaque étape. Le soir, tout est remis en service et testé.

## Le dimanche, plutôt les interventions discrètes

Le dimanche, je reste disponible pour les **dépannages** et les travaux peu bruyants : raccordements, remplacement d'appareillage, pose de luminaires, recherche de panne. Par respect pour le voisinage, je réserve les perçages importants et les saignées au samedi.

[[cta]]

## Mêmes prix que la semaine

Intervenir le week-end est mon choix d'organisation, pas un service d'exception. **Aucune majoration** ne s'applique : le forfait dépannage et les devis sont les mêmes du lundi au dimanche.

## Réserver son samedi

Les samedis se remplissent plus vite que les soirées, surtout au printemps et à l'automne. Pour un chantier planifié, **anticipez de quelques semaines** ; pour un dépannage, envoyez simplement un message : je fais au mieux pour vous caser entre deux interventions.`,
    cases: [
      { tag: 'Samedi', icon: 'panel-top', title: 'Un tableau remplacé pendant le week-end', text: "Une famille ne pouvait pas se libérer en semaine pour une coupure de courant d'une journée.", result: 'Tableau remplacé dans la journée du samedi ; les enfants étaient chez les grands-parents, tout était prêt pour le dîner.' },
      { tag: 'Samedi', icon: 'lamp-wall-up', title: 'Une tranchée creusée en famille', text: "Les propriétaires voulaient éclairer leur allée et ont creusé eux-mêmes la tranchée le matin.", result: 'Pose de la gaine, du câble et des bornes l’après-midi : allée éclairée le soir même.' },
      { tag: 'Dimanche', icon: 'zap', title: 'Une panne un dimanche midi', text: "Le four et la plaque s'arrêtent en pleine préparation du repas de famille. Le disjoncteur de la plaque saute au réarmement.", result: 'Borne de raccordement de la plaque brûlée, refaite en début d’après-midi.' },
    ],
    faq: [
      { q: 'Travaillez-vous tous les week-ends ?', a: "Oui, samedi et dimanche, sur rendez-vous. Il peut arriver qu'un week-end soit déjà complet : mieux vaut réserver tôt pour un chantier." },
      { q: 'Peut-on remplacer un tableau un dimanche ?', a: "C'est possible, mais je privilégie le samedi pour les chantiers longs. Le dimanche est plutôt réservé aux dépannages et aux travaux calmes." },
      { q: 'Le tarif est-il majoré le week-end ?', a: "Non, aucune majoration le samedi ni le dimanche." },
    ],
    cta: { title: 'Réserver un samedi pour vos travaux', text: 'Tableau, sécurité, éclairage : fixons ensemble un week-end qui vous convient.' },
    links: ['/electricien-soiree-ardennes/', '/prestations/tableau-electrique/', '/prestations/mise-en-securite/', '/prestations/eclairage-exterieur/', '/tarifs/'],
    nearby: ['/electricien-rethel/', '/electricien-charleville-mezieres/', '/electricien-sedan/', '/electricien-renwez/'],
    nearbyTitle: 'Principales communes',
  },

  // ================================================================== SERVICE × VILLE
  {
    slug: 'depannage-electrique-rethel', group: 'services-villes', city: 'Rethel', prestation: 'depannage',
    label: 'Dépannage électrique à Rethel',
    title: 'Dépannage électrique à Rethel, soir & week-end | ALED08',
    description: 'Dépannage électrique à Rethel le soir et le week-end : coupure, disjoncteur qui saute, prise ou éclairage en panne. Prix annoncé avant de venir, devis compris.',
    kicker: 'Dépannage · Rethel',
    h1: 'Dépannage électrique à Rethel, le soir et le week-end',
    lead: "Une panne à Rethel après votre journée de travail ou un samedi matin ? Je me déplace le soir même quand le planning le permet. Le forfait dépannage, annoncé au téléphone, comprend le déplacement, recherche de panne, solution et devis de réparation sans obligation.",
    body: `## Les pannes que je rencontre à Rethel

Dans les logements rethélois, beaucoup reconstruits dans les années 1950 ou rénovés par étapes, certaines pannes reviennent régulièrement :

- **Disjoncteur qui saute dans la cuisine** : un circuit d'origine qui alimente aujourd'hui micro-ondes, bouilloire et lave-vaisselle.
- **Différentiel qui déclenche en automne** : humidité dans un sous-sol, une cave ou une boîte de raccordement extérieure.
- **Lumières qui vacillent** : connexions anciennes desserrées, en particulier sur les circuits d'éclairage d'origine.
- **Prises mortes** dans une chambre ou un couloir : borne desserrée dans une boîte de dérivation.

## Un trajet court, un créneau rapide

Rethel fait partie de mes secteurs réguliers. Pour un dépannage, écrivez-moi dès que la panne se présente : je peux alors souvent vous proposer un passage le jour même. J'interviens 7 j/7, sur rendez-vous.

[[cta]]

## En attendant mon arrivée

Repérez la protection en position basse dans votre tableau, débranchez les appareils de la zone concernée et n'insistez pas si elle redéclenche. Si une prise ou le tableau sent le brûlé, coupez le disjoncteur général. Ces précautions protègent votre installation… et me font gagner du temps sur place.`,
    cases: [
      { tag: 'Un mardi soir', icon: 'plug-zap', title: 'La cuisine coupe à chaque petit-déjeuner', text: "Dans une maison du centre, le disjoncteur des prises de cuisine déclenche chaque matin, bouilloire et grille-pain en marche.", result: 'Circuit surchargé dédoublé, lave-vaisselle sur sa propre ligne : plus aucune coupure.' },
      { tag: 'Un samedi matin', icon: 'droplets', title: 'Le différentiel du sous-sol ne tient plus', text: "Après une semaine de pluie, impossible de réarmer le différentiel qui protège le sous-sol et le garage.", result: 'Boîte de dérivation extérieure infiltrée, remplacée par une boîte étanche : courant rétabli.' },
      { tag: 'Un jeudi soir', icon: 'lightbulb', title: 'Les lumières de l’étage vacillent', text: "Les ampoules de trois pièces faiblissent et clignotent par moments depuis quelques jours.", result: 'Neutre desserré dans une boîte du palier, connexions refaites et contrôlées.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Rethel ?', a: "Le forfait dépannage à Rethel est sur devis, annoncé au téléphone avant de venir. Il couvre le déplacement, la recherche de la panne et le devis de réparation, que vous acceptez ou non." },
      { q: 'Pouvez-vous venir dans l’heure ?', a: "Cela dépend des rendez-vous déjà prévus. Le plus souvent, je propose un créneau le soir même ou le lendemain soir." },
      { q: 'Intervenez-vous à Sault-lès-Rethel ou Acy-Romance ?', a: "Oui, aux mêmes conditions que Rethel, sous réserve que l'adresse reste dans la tranche des 30 km." },
    ],
    cta: { title: 'Une panne à Rethel ?', text: 'Écrivez-moi maintenant : je vous propose un créneau ce soir ou ce week-end, prix annoncé.' },
    links: ['/electricien-rethel/', '/remplacement-tableau-electrique-rethel/', '/prestations/depannage-electrique/', '/disjoncteur-qui-saute/', '/lumiere-qui-clignote/'],
    nearby: ['/electricien-rethel/', '/electricien-chateau-porcien/', '/electricien-novion-porcien/', '/electricien-attigny/'],
  },
  {
    slug: 'depannage-electrique-charleville-mezieres', group: 'services-villes', city: 'Charleville-Mézières', prestation: 'depannage',
    label: 'Dépannage électrique à Charleville-Mézières',
    title: 'Dépannage électrique Charleville-Mézières, soir | ALED08',
    description: "Dépannage électrique à Charleville-Mézières, 7 j/7 sur rendez-vous : appartement sans courant, disjoncteur d'abonné, prise en panne. Prix annoncé avant.",
    kicker: 'Dépannage · Charleville-Mézières',
    h1: 'Dépannage électrique à Charleville-Mézières, en appartement comme en maison',
    lead: "À Charleville-Mézières, une grande partie des pannes que je dépanne se produisent en appartement. Elles ont leurs spécificités : disjoncteur de branchement sur le palier, tableau à l'étroit, parties communes à distinguer. J'interviens toute la semaine et le week-end, sur rendez-vous, prix annoncé avant.",
    body: `## Appartement sans courant : par où commencer ?

Quand tout est coupé dans un appartement, trois situations sont possibles :

1. **Tout l'immeuble est dans le noir** : la panne vient du réseau ou de la colonne montante. Contactez Enedis, ou le syndic pour les parties communes.
2. **Votre compteur est allumé mais le disjoncteur de branchement a déclenché** : c'est souvent une **surcharge** (trop d'appareils en même temps pour votre abonnement) ou un défaut dans votre installation.
3. **Le disjoncteur de branchement est enclenché mais rien ne fonctionne** : le défaut se situe dans votre tableau.

Dans les cas 2 et 3, c'est à un électricien d'intervenir. Selon les immeubles, le disjoncteur de branchement se trouve dans votre entrée, à côté du compteur, ou dans une gaine sur le palier.

## Les pannes fréquentes dans les immeubles de la ville

- **Tableau d'abonné ancien**, avec un seul différentiel pour tout l'appartement.
- **Chauffe-eau** qui ne chauffe plus à cause d'un contacteur jour/nuit défaillant.
- **Prises de cuisine** saturées par l'électroménager.
- **Éclairage de salle de bain** en défaut à cause de l'humidité.

[[cta]]

## Pratique : accès et stationnement

Indiquez-moi le code d'accès, l'étage et la présence ou non d'un ascenseur : je prévois le matériel en conséquence. Dans le centre-ville, si vous disposez d'une place de parking privée, signalez-le, cela facilite l'intervention en soirée.`,
    cases: [
      { tag: 'Appartement', icon: 'zap-off', title: 'Le disjoncteur du palier coupe chaque soir', text: "Dans un appartement de Montcy-Notre-Dame, le disjoncteur de branchement déclenche vers 19 h, four et radiateurs en marche.", result: 'Installation saine : la puissance souscrite était insuffisante. Conseil d’augmentation auprès du fournisseur, délestage proposé.' },
      { tag: 'Chauffe-eau', icon: 'thermometer', title: 'Plus d’eau chaude dans un T3', text: "Un locataire n'a plus d'eau chaude depuis deux jours ; le disjoncteur du chauffe-eau est enclenché.", result: 'Contacteur heures creuses défectueux, remplacé avec l’accord du propriétaire bailleur.' },
      { tag: 'Maison de ville', icon: 'plug', title: 'Toutes les prises d’un étage hors service', text: "Dans une maison de ville de Mohon, l'étage n'a plus de prises alors que l'éclairage fonctionne.", result: 'Borne de raccordement fondue dans une boîte du palier, conducteurs recoupés, connexion refaite.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Charleville-Mézières ?', a: "Le forfait est sur devis : je vous annonce son prix pour votre quartier de Charleville-Mézières avant de venir. La réparation fait ensuite l'objet d'un devis sur place, sans obligation." },
      { q: 'Je suis locataire : qui paie le dépannage ?', a: "Cela dépend de la cause : l'entretien courant revient en général au locataire, le remplacement d'équipements vétustes au propriétaire. La facture détaillée vous aide à en discuter avec lui." },
      { q: 'La panne vient peut-être des parties communes, que faire ?', a: "Si plusieurs logements sont touchés, prévenez le syndic. Je n'interviens pas sur les parties communes sans mandat du gestionnaire." },
    ],
    cta: { title: 'Une panne à Charleville-Mézières ?', text: 'J’interviens 7 j/7, sur rendez-vous. Écrivez-moi : forfait dépannage annoncé tout de suite, devis de réparation sans obligation.' },
    links: ['/electricien-charleville-mezieres/', '/remplacement-tableau-electrique-charleville-mezieres/', '/disjoncteur-qui-saute/', '/panne-courant-partielle/', '/electricien-proprietaire-bailleur/'],
    nearby: ['/electricien-charleville-mezieres/', '/electricien-renwez/', '/electricien-poix-terron/', '/electricien-thin-le-moutier/'],
  },
  {
    slug: 'depannage-electrique-sedan', group: 'services-villes', city: 'Sedan', prestation: 'recherche-panne',
    label: 'Dépannage électrique à Sedan',
    title: 'Dépannage électrique à Sedan, planifié soir & week-end | ALED08',
    description: 'Dépannage électrique planifié à Sedan : pannes récurrentes, différentiel qui saute, lumière qui clignote. Le soir et le week-end, déplacement annoncé.',
    kicker: 'Dépannage · Sedan',
    h1: 'Dépannage électrique à Sedan : régler enfin les pannes récurrentes',
    lead: "À Sedan, pour une coupure totale en urgence, écrivez-moi : je vous dis tout de suite quand je peux venir. Et pour les pannes récurrentes (différentiel qui saute régulièrement, lumière qui clignote, prise capricieuse), un dépannage planifié le soir ou le week-end est la bonne solution.",
    body: `## Les pannes qu'on finit par « supporter »

Beaucoup de foyers vivent avec une panne chronique : on réarme le différentiel une fois par semaine, on évite d'allumer le four et le lave-linge en même temps, on secoue l'interrupteur de la salle de bain. Ce n'est pas une fatalité, et ce n'est **pas sans risque** : un défaut qui revient est un défaut qui évolue.

Ce type de panne se prête très bien à une intervention programmée :

- **Différentiel qui déclenche de façon aléatoire** : recherche par mesure d'isolement, circuit par circuit.
- **Disjoncteur qui saute à l'usage de certains appareils** : vérification de la charge et du calibre.
- **Éclairage qui clignote ou grésille** : connexion, variateur ou compatibilité LED.
- **Prise qui fonctionne par intermittence** : borne desserrée, début d'échauffement.

[[cta]]

## Préparer l'intervention pour gagner du temps

Avant ma venue, notez pendant quelques jours **quand la panne se produit** : heure, météo, appareils en marche. Ces informations, transmises par message, me permettent d'arriver avec des hypothèses précises. Sur place, la recherche est plus courte, et le dépannage plus efficace.

## Le déplacement jusqu'à Sedan

Le **prix du forfait dépannage est fixé à l'avance**, au téléphone, selon votre adresse à Sedan. Profitez du passage pour me signaler les autres petits soucis de la maison : je les intègre au même devis.`,
    cases: [
      { tag: 'Récurrent', icon: 'search', title: 'Un différentiel réarmé chaque semaine depuis un an', text: "Dans une maison du Fond de Givonne, le différentiel saute environ une fois par semaine, sans logique apparente.", result: 'Après relevé des déclenchements par la cliente, défaut trouvé sur le circuit du cellier : prise du congélateur oxydée.' },
      { tag: 'Clignotement', icon: 'lightbulb', title: 'Des spots qui clignotent à faible intensité', text: "Les spots LED du séjour clignotent dès qu'on baisse le variateur, depuis le remplacement des ampoules.", result: 'Variateur remplacé par un modèle compatible LED : éclairage stable sur toute la plage.' },
      { tag: 'Intermittent', icon: 'plug', title: 'La prise du bureau marche un jour sur deux', text: "L'ordinateur s'éteint parfois sans raison, branché sur une prise murale de la chambre-bureau.", result: 'Borne desserrée avec début de chauffe, prise et conducteurs refaits.' },
    ],
    faq: [
      { q: 'Combien coûte un dépannage planifié à Sedan ?', a: "Le forfait dépannage, au montant annoncé selon votre adresse à Sedan. La réparation fait l'objet d'un devis. Tout est connu avant que je prenne la route." },
      { q: 'Pouvez-vous venir le jour même à Sedan ?', a: "Rarement le jour même, compte tenu de la distance. Je propose généralement un créneau dans la semaine, en soirée ou le week-end." },
      { q: 'Une panne récurrente est-elle dangereuse ?', a: "Elle peut l'être : un échauffement ou un défaut d'isolement qui revient tend à s'aggraver. Mieux vaut la traiter avant qu'elle ne devienne une vraie panne." },
    ],
    cta: { title: 'Une panne qui revient sans cesse à Sedan ?', text: 'Planifions une intervention en soirée ou le week-end : on trouve la cause, une bonne fois pour toutes.' },
    links: ['/electricien-sedan/', '/prestations/recherche-de-panne/', '/differentiel-qui-saute/', '/lumiere-qui-clignote/', '/prise-qui-chauffe/'],
    nearby: ['/electricien-sedan/', '/electricien-charleville-mezieres/', '/electricien-poix-terron/'],
  },
  {
    slug: 'remplacement-tableau-electrique-rethel', group: 'services-villes', city: 'Rethel', prestation: 'tableau',
    label: 'Remplacement de tableau électrique à Rethel',
    title: 'Remplacement tableau électrique à Rethel, sur devis | ALED08',
    description: 'Remplacement de tableau électrique à Rethel : maisons de la Reconstruction, tableaux à fusibles, différentiels 30 mA. Devis gratuit, pose le samedi.',
    kicker: 'Tableau électrique · Rethel',
    h1: 'Remplacement de tableau électrique à Rethel',
    lead: "Les logements rethélois issus de la Reconstruction conservent souvent un tableau d'origine ou modernisé à moitié. Je remplace ces tableaux par un équipement neuf, conforme NF C 15-100, sur devis gratuit et détaillé, en une journée, de préférence un samedi.",
    body: `## Les tableaux que je remplace à Rethel

Trois profils reviennent régulièrement :

- **Le tableau à fusibles d'origine**, souvent sur planche, avec des fusibles à broches ou à cartouche.
- **Le tableau « années 80 »** avec disjoncteurs, mais un seul différentiel 500 mA et pas de 30 mA.
- **Le tableau rafistolé**, où des disjoncteurs modernes ont été ajoutés à côté d'anciens éléments, sans logique d'ensemble.

Dans tous les cas, l'objectif est le même : **tous les circuits protégés par un différentiel 30 mA**, un disjoncteur au bon calibre pour chaque circuit, et un repérage qui permette à n'importe qui de couper la bonne ligne.

## Comment est établi le devis

Je compte d'abord les circuits avec vous, je vérifie la terre et l'état des câbles. Le devis tient compte du **nombre de circuits**, du **nombre et du type de différentiels**, et des reprises éventuelles : circuit à dédoubler, terre à créer, ligne spécialisée à ajouter pour une plaque ou une recharge. Chaque ligne est détaillée, sans prix « d'appel ».

[[cta]]

## Le déroulement d'une journée de remplacement

Arrivée le matin, coupure générale, repérage de chaque circuit avec vous, dépose de l'ancien tableau, pose et câblage du nouveau, essais de chaque protection, remise sous tension en fin de journée. Avant de partir, je vous remets un **schéma de repérage** et je vous montre comment réarmer chaque élément.`,
    cases: [
      { tag: 'Reconstruction', icon: 'panel-top', title: 'Un tableau à fusibles de 1955', text: "Une maison du centre, tableau à fusibles d'origine sur planche, avec un disjoncteur ajouté pour la salle de bain.", result: 'Tableau deux rangées, trois différentiels, dix circuits repérés ; terre existante vérifiée et conforme.' },
      { tag: 'Années 80', icon: 'shield-check', title: 'Un seul différentiel 500 mA', text: "Un pavillon de la périphérie avec un tableau propre mais sans aucune protection 30 mA.", result: 'Remplacement du tableau en conservant tous les circuits, réalisé en une matinée de samedi.' },
      { tag: 'Rafistolé', icon: 'cable', title: 'Deux coffrets reliés par des fils volants', text: "Un appartement dont le tableau d'origine alimentait un second coffret par des fils non protégés.", result: 'Un seul tableau, peignes de raccordement, suppression des fils volants.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un remplacement de tableau à Rethel ?', a: "Il est fixé sur devis, après comptage des circuits : deux maisons de la même rue peuvent avoir des besoins très différents. Le devis est gratuit et sans engagement." },
      { q: 'Combien de temps sans courant ?', a: "De quatre à huit heures selon la maison. Le réfrigérateur et le congélateur tiennent sans problème cette durée s'ils restent fermés." },
      { q: 'Faut-il prévenir Enedis ?', a: "Non, pour un remplacement de tableau, le disjoncteur de branchement et le compteur ne sont pas modifiés. Je coupe simplement l'alimentation en aval." },
    ],
    cta: { title: 'Un tableau à changer à Rethel ?', text: 'Envoyez une photo de votre tableau : je vous donne une première estimation, puis un devis gratuit.' },
    links: ['/electricien-rethel/', '/depannage-electrique-rethel/', '/prestations/tableau-electrique/', '/remplacement-tableau-a-fusibles/', '/tableau-electrique-ardennes/'],
    nearby: ['/electricien-rethel/', '/electricien-chateau-porcien/', '/electricien-novion-porcien/'],
  },
  {
    slug: 'remplacement-tableau-electrique-charleville-mezieres', group: 'services-villes', city: 'Charleville-Mézières', prestation: 'tableau',
    label: 'Remplacement de tableau électrique à Charleville-Mézières',
    title: 'Tableau électrique Charleville-Mézières : remplacement | ALED08',
    description: 'Remplacement de tableau électrique à Charleville-Mézières, appartement ou maison de ville : coffret compact, différentiels 30 mA. Devis gratuit.',
    kicker: 'Tableau électrique · Charleville-Mézières',
    h1: 'Remplacement de tableau électrique à Charleville-Mézières',
    lead: "En appartement comme en maison de ville, Charleville-Mézières compte de nombreux tableaux électriques d'un autre âge. Je les remplace le samedi, sans gêner le voisinage, par un tableau compact, clair et conforme, sur devis gratuit.",
    body: `## Remplacer un tableau en appartement

L'appartement pose des contraintes particulières, que je prends en compte dès la visite :

- **L'espace** : le tableau se loge souvent dans un placard d'entrée ou une gaine technique étroite. Je choisis un coffret aux dimensions adaptées, sans sacrifier la réserve pour l'avenir.
- **La limite avec les parties communes** : mon intervention commence après le disjoncteur de branchement. La colonne montante et le compteur ne sont pas concernés, et vos voisins ne sont pas privés de courant.
- **Le bruit** : un remplacement de tableau génère peu de nuisances, et je limite les perçages au strict nécessaire.

## Remplacer un tableau en maison de ville

Dans les maisons sur plusieurs niveaux, la difficulté tient au **repérage** : au fil des rénovations, les circuits se sont mélangés entre les étages. Je prends le temps d'identifier chaque ligne, avec vous, avant de démonter quoi que ce soit. Le nouveau tableau est organisé **par étage et par usage**, avec un schéma clair.

[[cta]]

## Le devis à Charleville-Mézières

La visite de devis peut avoir lieu en soirée. Un appartement de trois pièces compte moins de circuits qu'une maison de ville sur trois niveaux : le devis reflète cette réalité, en précisant le nombre de différentiels, de disjoncteurs et les éventuelles reprises. Il est gratuit et sans engagement.`,
    cases: [
      { tag: 'Appartement', icon: 'building-2', title: 'Un tableau en bakélite dans un T2 du centre', text: "Un ancien tableau en bakélite avec deux fusibles et un interrupteur rotatif, dans le placard de l'entrée.", result: 'Coffret une rangée avec deux différentiels 30 mA et six circuits, posé en une matinée.' },
      { tag: 'Maison de ville', icon: 'house', title: 'Trois étages, quatorze circuits mélangés', text: "Une maison de ville dont personne ne savait quel disjoncteur alimentait quel étage.", result: 'Repérage complet, tableau trois rangées organisé par étage, schéma plastifié remis aux propriétaires.' },
      { tag: 'Bailleur', icon: 'key-round', title: 'Un tableau à refaire entre deux locataires', text: "Un propriétaire bailleur souhaitait profiter de la vacance d'un appartement pour remplacer un tableau vétuste.", result: 'Remplacement en une journée, attestation de travaux remise pour le dossier de location.' },
    ],
    faq: [
      { q: 'Mes voisins seront-ils privés de courant ?', a: "Non. Je coupe uniquement votre alimentation, en aval de votre disjoncteur de branchement. Les autres logements ne sont pas concernés." },
      { q: 'Faut-il l’accord de la copropriété ?', a: "Pas pour remplacer votre propre tableau, qui fait partie de votre partie privative. Seuls les travaux sur les parties communes relèvent du syndic." },
      { q: 'Quel est le prix pour un appartement ?', a: "Je l'établis sur devis, selon le nombre réel de circuits et la configuration du placard ou de la gaine technique. Le devis est gratuit." },
    ],
    cta: { title: 'Un tableau à remplacer à Charleville-Mézières ?', text: 'Visite de devis possible en soirée, travaux le samedi : contactez-moi.' },
    links: ['/electricien-charleville-mezieres/', '/depannage-electrique-charleville-mezieres/', '/prestations/tableau-electrique/', '/electricien-proprietaire-bailleur/', '/tableau-electrique-ardennes/'],
    nearby: ['/electricien-charleville-mezieres/', '/electricien-renwez/', '/electricien-thin-le-moutier/', '/electricien-poix-terron/'],
  },
];
