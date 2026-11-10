// Pages « symptômes » : pannes et signes d'alerte
module.exports = [
  {
    slug: 'disjoncteur-qui-saute', group: 'symptomes', prestation: 'depannage',
    label: 'Disjoncteur qui saute',
    title: 'Disjoncteur qui saute : causes, solutions | ALED08 Ardennes',
    description: 'Votre disjoncteur saute ? Surcharge, court-circuit ou abonnement trop juste : comment faire la différence, que faire et quand appeler un électricien.',
    kicker: 'Panne · Disjoncteur qui saute',
    h1: 'Disjoncteur qui saute : surcharge, court-circuit ou abonnement ?',
    lead: "Un disjoncteur qui saute fait son travail : il protège un câble contre la surchauffe ou un court-circuit. La vraie question est **pourquoi il saute**. Et selon le disjoncteur concerné, la réponse n'est pas du tout la même.",
    body: `## Quel disjoncteur a sauté ?

Avant tout, identifiez l'appareil qui a déclenché :

- **Un disjoncteur divisionnaire** (un seul circuit est coupé : la cuisine, les chambres, le chauffe-eau…) : le problème est sur ce circuit.
- **Le disjoncteur de branchement**, souvent situé près du compteur, avec un réglage indiqué en ampères : il coupe toute la maison, soit par **dépassement de la puissance souscrite**, soit parce qu'il intègre une protection différentielle qui a détecté une fuite.

## Le moment du déclenchement est un indice

- **Il saute instantanément au réarmement** : c'est très probablement un **court-circuit**. Un appareil, une prise, une douille ou un câble endommagé met directement en contact deux conducteurs. Inutile d'insister.
- **Il saute après quelques minutes d'utilisation** : c'est typiquement une **surcharge**. Le circuit alimente plus que ce qu'il peut supporter : radiateur d'appoint, four et lave-vaisselle en même temps, multiprises.
- **Le disjoncteur général saute quand tout fonctionne en même temps** : c'est souvent l'**abonnement** qui est trop juste pour vos usages.

!> Ne remplacez jamais un disjoncteur par un modèle de calibre supérieur pour qu'il arrête de sauter. Le câble, lui, reste le même : il n'est alors plus protégé contre la surchauffe, et c'est un risque d'incendie.

[[cta]]

## Ce que je fais sur place

Je commence par écouter : quand, avec quels appareils, depuis quand. Puis je mesure le courant réellement consommé sur le circuit, je contrôle les connexions du tableau et je teste l'isolement si un court-circuit est suspecté. La solution dépend de la cause : **réparer un élément défectueux**, **répartir la charge** sur un nouveau circuit, ou vous conseiller d'**ajuster votre puissance** auprès de votre fournisseur.`,
    cases: [
      { tag: 'Court-circuit', icon: 'zap', title: 'Le circuit des chambres saute au réarmement', text: "Impossible de réenclencher le disjoncteur des chambres. Une applique de tête de lit, tombée la veille, avait écrasé ses fils.", result: 'Applique déposée, câble réparé dans une boîte, circuit remis en service en une demi-heure.' },
      { tag: 'Surcharge', icon: 'thermometer', title: 'Coupure au bout de vingt minutes de chauffage', text: "Un radiateur bain d'huile de 2 000 W ajouté dans une chambre, sur le même circuit que deux autres pièces.", result: 'Charge mesurée à la pince, création d’une prise sur un circuit moins chargé, explication sur les appareils d’appoint.' },
      { tag: 'Abonnement', icon: 'gauge', title: 'Tout s’éteint à l’heure du dîner', text: "Le disjoncteur de branchement coupe vers 19 h, plaque, four et chauffe-eau en marche, sur un abonnement de 6 kVA.", result: 'Installation saine : conseil de passage à 9 kVA, démarche faite par le client auprès de son fournisseur.' },
    ],
    faq: [
      { q: 'Puis-je réarmer le disjoncteur plusieurs fois ?', a: "Une fois, après avoir débranché les appareils du circuit. S'il redéclenche aussitôt, n'insistez pas : chaque réarmement sur un court-circuit sollicite inutilement l'installation." },
      { q: 'Un disjoncteur peut-il être usé ?', a: "Oui, c'est possible après de nombreux déclenchements ou s'il a chauffé, mais c'est plus rare qu'on ne le croit. Je teste le disjoncteur avant de conclure qu'il doit être remplacé. Voir [remplacement de disjoncteur](/remplacement-disjoncteur/)." },
      { q: 'Comment augmenter la puissance de mon abonnement ?', a: "Auprès de votre fournisseur d'électricité. Le changement est télécommandé sur les compteurs Linky. Je vous indique la puissance adaptée après avoir vérifié vos usages et votre installation." },
    ],
    cta: { title: 'Votre disjoncteur ne tient plus ?', text: 'Je trouve la cause (court-circuit, surcharge ou abonnement) et je vous propose la bonne solution, prix annoncé.' },
    links: ['/differentiel-qui-saute/', '/remplacement-disjoncteur/', '/ajout-circuit-electrique/', '/prestations/depannage-electrique/', '/blog/differentiel-ou-disjoncteur-difference/', '/blog/pourquoi-une-prise-disjoncte/'],
    nearby: ['/depannage-electrique-ardennes/', '/depannage-electrique-rethel/', '/depannage-electrique-charleville-mezieres/'],
    nearbyTitle: 'Dépannage près de chez vous',
  },
  {
    slug: 'differentiel-qui-saute', group: 'symptomes', prestation: 'recherche-panne',
    label: 'Différentiel qui saute',
    title: 'Interrupteur différentiel qui saute : que faire ? | ALED08',
    description: 'Votre interrupteur différentiel déclenche ? Fuite de courant, humidité, appareil défectueux : la méthode pour trouver le coupable et y remédier.',
    kicker: 'Panne · Différentiel qui saute',
    h1: 'Interrupteur différentiel qui saute : trouver la fuite de courant',
    lead: "Un interrupteur différentiel ne réagit pas à la surcharge : il détecte une **fuite de courant vers la terre**, celle qui pourrait passer par votre corps. Quand il déclenche, il y a donc une fuite quelque part. Toute la difficulté est de la trouver.",
    body: `## La méthode pour identifier l'appareil en cause

Dans de nombreux cas, le coupable est un appareil. Ce test simple permet souvent de le démasquer :

1. **Débranchez tous les appareils** des circuits protégés par le différentiel qui a sauté (prises, mais aussi chauffe-eau ou radiateurs s'ils ont un interrupteur).
2. **Réarmez le différentiel.** S'il tient, l'installation elle-même n'est probablement pas en cause.
3. **Rebranchez les appareils un par un**, en attendant un peu à chaque fois.
4. Celui qui fait déclencher est très probablement le responsable.

Si le différentiel **saute même tout débranché**, le défaut se situe dans l'installation : boîte humide, câble abîmé, luminaire infiltré. C'est alors une recherche de panne qui s'impose.

## Les coupables les plus fréquents

- **Les appareils à résistance** : chauffe-eau, lave-linge, lave-vaisselle, four. Une résistance qui vieillit fuit vers la terre.
- **L'humidité** : prises de cave, de garage ou extérieures, boîtes de dérivation encastrées dans un mur humide.
- **Les fuites cumulées** : plusieurs petites fuites qui, additionnées, dépassent le seuil de 30 mA. Fréquent quand un seul différentiel protège trop de circuits.
- **Les orages** : une surtension peut faire déclencher sans laisser de défaut.

[[cta]]

## Bon à savoir : le bouton « Test »

Chaque interrupteur différentiel possède un bouton marqué **T** ou **Test**. Appuyez dessus une fois par mois : le différentiel doit déclencher. S'il ne réagit pas, il ne vous protège plus et doit être remplacé sans attendre.`,
    cases: [
      { tag: 'Appareil', icon: 'thermometer', title: 'Le chauffe-eau, coupable silencieux', text: "Un différentiel qui saute la nuit, sans personne debout. La mesure montre une fuite importante sur le circuit du chauffe-eau, qui démarre en heures creuses.", result: 'Résistance entartrée et percée identifiée ; remplacement de la résistance coordonné avec le plombier.' },
      { tag: 'Fuites cumulées', icon: 'gauge', title: 'Un seul différentiel pour douze circuits', text: "Des déclenchements de plus en plus fréquents, sans appareil fautif identifiable.", result: 'Mesure circuit par circuit, fuites réparties sur trois différentiels : déclenchements intempestifs supprimés.' },
      { tag: 'Humidité', icon: 'droplets', title: 'La prise du garage, toujours elle', text: "Un congélateur dans un garage non chauffé, branché sur une prise ordinaire posée au ras du sol.", result: 'Prise étanche remontée à 1 m, isolement redevenu normal.' },
    ],
    faq: [
      { q: 'Mon différentiel est-il défectueux s’il saute souvent ?', a: "Rarement. Un différentiel qui saute signale un défaut. Il peut toutefois devenir trop sensible avec l'âge : un testeur adapté permet de vérifier son seuil de déclenchement." },
      { q: 'Puis-je remplacer mon différentiel 30 mA par un 300 mA ?', a: "Non, surtout pas. Seul le 30 mA protège les personnes contre l'électrocution. Augmenter la sensibilité revient à supprimer cette protection." },
      { q: 'Combien coûte une recherche de fuite ?', a: "Elle fait partie du forfait dépannage de 79 €, déplacement compris jusqu'à 15 km. Une fois la fuite trouvée, je vous remets un devis de réparation, sans obligation." },
    ],
    cta: { title: 'Un différentiel qui ne tient plus ?', text: 'Je mesure l’isolement circuit par circuit et je trouve la fuite. Forfait dépannage 79 €, le soir ou le week-end.' },
    links: ['/disjoncteur-qui-saute/', '/disjoncte-quand-il-pleut/', '/prestations/recherche-de-panne/', '/recherche-panne-electrique-ardennes/', '/blog/differentiel-ou-disjoncteur-difference/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-signy-l-abbaye/', '/electricien-rethel/'],
    nearbyTitle: 'Dépannage près de chez vous',
  },
  {
    slug: 'panne-courant-partielle', group: 'symptomes', prestation: 'depannage',
    label: 'Panne de courant partielle',
    title: 'Plus de courant dans une pièce ou un étage ? | ALED08',
    description: 'Une partie de la maison sans électricité, le reste fonctionne ? Disjoncteur, différentiel, connexion, phase manquante : causes et bons réflexes.',
    kicker: 'Panne · Coupure partielle',
    h1: 'Plus de courant dans une partie de la maison',
    lead: "La cuisine fonctionne, mais plus rien dans les chambres. Ou l'éclairage marche, mais aucune prise du séjour. Une panne partielle est souvent **plus simple à localiser qu'une coupure totale**, à condition de suivre un ordre logique.",
    body: `## Les vérifications dans l'ordre

1. **Le tableau** : un disjoncteur est-il en position basse ? Un interrupteur différentiel a-t-il coupé toute une rangée ? Réarmez une fois après avoir débranché les appareils concernés.
2. **Les prises commandées** : dans certaines pièces, une prise est commandée par un interrupteur mural. Vérifiez qu'il est en position marche.
3. **Le périmètre exact** : notez précisément ce qui fonctionne et ce qui ne fonctionne plus. Ce relevé m'aide énormément.

Si tout est enclenché au tableau et que la panne persiste, le défaut se trouve **sur le trajet du circuit** : boîte de dérivation, borne desserrée, câble endommagé. C'est le moment d'appeler.

## Les causes que je trouve le plus souvent

- **Une connexion lâche dans une boîte de dérivation** : avec les années, une borne se desserre, chauffe, puis coupe le passage du courant vers la suite du circuit.
- **Un câble percé** : un clou, une vis ou un perçage récent dans un mur ou un plancher. Pensez à vos derniers travaux !
- **Une prise « en tête de ligne »** défectueuse : quand les prises sont raccordées en chaîne, un défaut sur la première coupe toutes les suivantes.

[[cta]]

## Le cas particulier du triphasé

Dans une maison alimentée en **triphasé**, si environ un tiers de l'installation est privé de courant, il est possible qu'une **phase manque** à l'arrivée. Si vos voisins constatent la même chose, contactez Enedis. Sinon, le problème peut venir de votre tableau ou de votre disjoncteur de branchement : je le vérifie avec un simple contrôle de tension.`,
    cases: [
      { tag: 'Après travaux', icon: 'hammer', title: 'Plus de prises depuis la pose d’une étagère', text: "Le lendemain de la pose d'étagères dans le séjour, toutes les prises de la pièce sont mortes, le disjoncteur refusant de tenir.", result: 'Une vis avait traversé le câble : tronçon remplacé par une boîte de raccordement, étagère refixée ailleurs.' },
      { tag: 'Connexion', icon: 'cable', title: 'La moitié des chambres dans le noir', text: "Deux chambres sur trois n'ont plus ni lumière ni prises, alors que tout est enclenché au tableau.", result: 'Borne carbonisée dans une boîte de dérivation du couloir, connexion refaite et boîte remplacée.' },
      { tag: 'Triphasé', icon: 'zap-off', title: 'Un tiers de la maison sans courant', text: "Dans une maison en triphasé, cuisine et garage fonctionnent, mais plus rien à l'étage.", result: 'Phase absente en amont du tableau, voisins également touchés : panne réseau signalée à Enedis, rétablie dans la soirée.' },
    ],
    faq: [
      { q: 'Est-ce dangereux d’utiliser le reste de la maison ?', a: "Si rien ne sent le brûlé et que le tableau n'est pas chaud, vous pouvez utiliser les circuits qui fonctionnent. En cas d'odeur ou de trace de chauffe, coupez le disjoncteur général." },
      { q: 'Pourquoi une prise peut-elle couper les autres ?', a: "Quand les prises sont câblées les unes à la suite des autres, le courant passe par les bornes de chaque prise. Une borne desserrée interrompt l'alimentation de toutes celles qui suivent." },
      { q: 'Combien coûte ce type de dépannage ?', a: "Le forfait dépannage de 79 € couvre le déplacement, la recherche et le devis. La réparation d'une connexion ou d'une boîte est généralement rapide : je vous la chiffre sur place." },
    ],
    cta: { title: 'Une pièce ou un étage sans courant ?', text: 'Décrivez-moi ce qui fonctionne et ce qui ne fonctionne plus : je viens le soir même si possible.' },
    links: ['/prise-qui-ne-fonctionne-plus/', '/disjoncteur-qui-saute/', '/prestations/depannage-electrique/', '/depannage-electrique-ardennes/', '/blog/comment-trouver-une-panne-electrique/'],
    nearby: ['/depannage-electrique-rethel/', '/depannage-electrique-charleville-mezieres/', '/electricien-signy-l-abbaye/'],
    nearbyTitle: 'Dépannage près de chez vous',
  },
  {
    slug: 'prise-qui-chauffe', group: 'symptomes', prestation: 'prises',
    label: 'Prise qui chauffe ou noircie',
    title: 'Prise qui chauffe, noircie ou odeur de brûlé | ALED08',
    description: 'Prise chaude, jaunie, noircie ou qui sent le brûlé : un échauffement dangereux. Causes, gestes immédiats et réparation par un électricien ardennais.',
    kicker: 'Alerte · Prise qui chauffe',
    h1: 'Prise qui chauffe, noircie ou qui sent le brûlé',
    lead: "Une prise électrique ne doit **jamais** être chaude. Si elle est tiède au toucher, jaunie, noircie, déformée ou si elle dégage une odeur de plastique chaud, il y a un **échauffement anormal**. C'est l'une des premières causes d'incendie d'origine électrique dans les logements.",
    body: `!> Coupez le disjoncteur du circuit concerné (ou le disjoncteur général si vous ne savez pas lequel), débranchez l'appareil sans toucher aux parties noircies et n'utilisez plus la prise avant réparation.

## D'où vient l'échauffement ?

Un échauffement naît presque toujours d'une **mauvaise connexion** ou d'un **courant trop important** :

- **Borne desserrée** derrière la prise : le contact se fait sur une petite surface, qui chauffe. C'est la cause la plus fréquente.
- **Contacts usés** : à force de branchements, les pinces de la prise ne serrent plus la fiche. On le voit quand une fiche « tombe » toute seule.
- **Appareil trop puissant** : radiateur, plaque de cuisson d'appoint, chauffe-eau électrique mobile branchés sur une prise ordinaire, souvent via une multiprise.
- **Fiche ou multiprise de mauvaise qualité** : les adaptateurs bon marché supportent mal les fortes charges.

## Pourquoi il ne suffit pas de changer la prise

Quand une prise a chauffé, l'isolant des fils a souvent souffert sur quelques centimètres derrière elle : il est durci, cassant, parfois carbonisé. Je **recoupe les conducteurs** jusqu'à retrouver du cuivre sain, je vérifie la boîte d'encastrement et je contrôle les autres prises du circuit, qui ont pu subir la même contrainte.

[[cta]]

## Éviter que cela se reproduise

- Branchez les appareils de chauffage et de cuisson **directement sur une prise murale**, jamais sur une multiprise.
- Remplacez les prises dont la fiche ne tient plus.
- Pour les gros appareils, prévoyez une **prise sur circuit spécialisé**.`,
    cases: [
      { tag: 'Chauffage d’appoint', icon: 'flame', title: 'Une multiprise fondue derrière le canapé', text: "Un radiateur soufflant branché tout l'hiver sur une multiprise. La prise murale derrière a noirci et déformé son cache.", result: 'Prise et 10 cm de conducteurs remplacés, prise dédiée créée pour l’appareil d’appoint.' },
      { tag: 'Contacts usés', icon: 'plug', title: 'Une fiche qui tombait toute seule', text: "Dans une cuisine, la fiche de la cafetière glissait de la prise, et la prise était tiède en permanence.", result: 'Prise remplacée, conducteurs recoupés ; contrôle des quatre autres prises du plan de travail.' },
      { tag: 'Borne desserrée', icon: 'triangle-alert', title: 'Une odeur de plastique chaud la nuit', text: "Des occupants sentent une odeur de brûlé dans la chambre, sans trouver d'où elle vient.", result: 'Prise derrière la table de nuit, borne desserrée et carbonisée : réparée, circuit contrôlé.' },
    ],
    faq: [
      { q: 'Une prise un peu tiède, est-ce normal ?', a: "La fiche d'un appareil puissant peut être légèrement tiède après un long fonctionnement. La prise murale, elle, ne doit pas chauffer. En cas de doute, faites contrôler." },
      { q: 'Puis-je réutiliser la prise après l’avoir laissée refroidir ?', a: "Non. Une prise qui a chauffé a été endommagée, même si elle semble fonctionner. Elle doit être remplacée, et ses conducteurs contrôlés." },
      { q: 'Combien coûte le remplacement d’une prise qui a chauffé ?', a: "Le dépannage est au forfait de 79 €. Le remplacement de la prise, et éventuellement des conducteurs abîmés, vous est ensuite chiffré sur devis : rien n'est fait sans votre accord." },
    ],
    cta: { title: 'Une prise qui chauffe ou qui sent le brûlé ?', text: 'Ne la réutilisez pas : appelez-moi, j’interviens le soir ou le week-end pour remettre en état durablement.' },
    links: ['/prestations/prises-et-interrupteurs/', '/prise-specialisee/', '/prise-qui-ne-fonctionne-plus/', '/blog/pourquoi-une-prise-disjoncte/', '/blog/comment-securiser-son-logement-electricite/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-rethel/', '/electricien-charleville-mezieres/'],
    nearbyTitle: 'Intervention près de chez vous',
  },
  {
    slug: 'lumiere-qui-clignote', group: 'symptomes', prestation: 'eclairage-interieur',
    label: 'Lumière qui clignote ou grésille',
    title: 'Lumière qui clignote ou LED qui reste allumée | ALED08',
    description: 'LED qui clignote, grésille ou luit éteinte, lumières qui baissent : variateur, interrupteur lumineux, faux contact ou neutre desserré. Explications.',
    kicker: 'Panne · Éclairage qui clignote',
    h1: 'Lumière qui clignote, grésille ou reste faiblement allumée',
    lead: "Les LED ont transformé l'éclairage… et fait apparaître de nouvelles pannes. Une ampoule qui scintille, qui grésille ou qui **luit faiblement même éteinte** n'a souvent rien de grave. Mais quand **toutes les lumières baissent en même temps**, c'est un signal à prendre au sérieux.",
    body: `## Une seule lampe concernée

### L'ampoule LED et le variateur

Les anciens variateurs, conçus pour les ampoules à incandescence ou halogènes, ne savent pas piloter correctement une LED. Résultat : scintillement à faible intensité, grésillement, plage de variation réduite. Il faut une **ampoule réellement dimmable** et un **variateur compatible LED**.

### La LED qui brille éteinte

Une LED qui reste **faiblement allumée** ou qui **clignote alors que l'interrupteur est éteint** est un phénomène courant. Deux causes principales :

- un **interrupteur à voyant lumineux**, qui laisse passer un très faible courant suffisant pour allumer une LED ;
- un **câble de commande long**, qui induit une petite tension par couplage avec les autres fils.

Ce n'est pas dangereux, mais c'est agaçant. Je remplace l'interrupteur, ou j'ajoute un petit composant qui absorbe ce courant résiduel.

### Le faux contact

Une douille fatiguée, une connexion desserrée au plafond ou dans l'interrupteur provoquent des clignotements aléatoires, parfois en tapant la porte. À réparer : un faux contact chauffe.

[[cta]]

## Toutes les lumières baissent ou varient

Si plusieurs pièces voient leur éclairage **baisser quand un gros appareil démarre**, ou si certaines lampes deviennent **plus brillantes** pendant que d'autres faiblissent, il peut s'agir d'un **neutre desserré**. C'est un défaut sérieux, qui peut endommager vos appareils : faites intervenir un électricien rapidement. Si tout le quartier est concerné, la cause est sur le réseau.`,
    cases: [
      { tag: 'Variateur', icon: 'sun-moon', title: 'Des spots qui papillonnent à 30 %', text: "Après le passage aux LED, les spots du salon clignotent dès qu'on baisse la lumière.", result: 'Variateur remplacé par un modèle universel LED, réglage de la valeur minimale : éclairage stable.' },
      { tag: 'Interrupteur lumineux', icon: 'lightbulb-off', title: 'Une LED qui luit toute la nuit', text: "Dans une chambre, le plafonnier LED reste légèrement allumé une fois éteint, empêchant de dormir.", result: 'Interrupteur à voyant remplacé par un interrupteur standard : extinction totale.' },
      { tag: 'Neutre', icon: 'triangle-alert', title: 'Des lampes qui baissent quand le four chauffe', text: "Dans toute la maison, l'éclairage faiblit dès que le four démarre, et une ampoule a grillé deux fois.", result: 'Neutre desserré au tableau, échauffé : borne remplacée, tous les serrages contrôlés.' },
    ],
    faq: [
      { q: 'Une LED qui clignote peut-elle provoquer un incendie ?', a: "Le scintillement lié à un variateur ou un interrupteur lumineux n'est pas dangereux. En revanche, un clignotement aléatoire lié à un faux contact doit être réparé, car la connexion chauffe." },
      { q: 'Pourquoi mes ampoules LED grillent-elles vite ?', a: "Chaleur excessive dans un luminaire fermé, variateur incompatible, qualité médiocre ou surtensions répétées. Je regarde le luminaire et l'installation avant d'accuser l'ampoule." },
      { q: 'Combien coûte le remplacement d’un variateur ?', a: "Le modèle compatible dépend de vos ampoules et du nombre de points commandés. Je vous indique le bon variateur et vous remets un devis avant de le poser." },
    ],
    cta: { title: 'Un éclairage capricieux ?', text: 'Je trouve s’il s’agit d’une incompatibilité, d’un faux contact ou d’un défaut plus sérieux.' },
    links: ['/prestations/eclairage-interieur/', '/remplacement-eclairage-led/', '/installation-spots-led/', '/prestations/recherche-de-panne/', '/blog/bien-choisir-eclairage-led/'],
    nearby: ['/depannage-electrique-sedan/', '/depannage-electrique-rethel/', '/electricien-signy-l-abbaye/'],
    nearbyTitle: 'Intervention près de chez vous',
  },
  {
    slug: 'prise-qui-ne-fonctionne-plus', group: 'symptomes', prestation: 'prises',
    label: 'Prise qui ne fonctionne plus',
    title: 'Prise électrique qui ne fonctionne plus : que faire ? | ALED08',
    description: 'Une ou plusieurs prises ne fonctionnent plus ? Disjoncteur, prise commandée, raccordement en chaîne, borne desserrée : vérifications et réparation.',
    kicker: 'Panne · Prise morte',
    h1: 'Une prise ne fonctionne plus : les vérifications à faire',
    lead: "Vous branchez un appareil, rien ne se passe. Avant d'accuser la prise, **quelques vérifications simples** permettent souvent de comprendre. Et si la panne persiste, la réparation est généralement rapide.",
    body: `## Avant d'appeler

1. **Testez avec un autre appareil** dont vous êtes sûr, comme une lampe ou un chargeur. L'appareil lui-même est parfois en cause.
2. **Regardez le tableau** : le disjoncteur des prises de cette pièce est-il enclenché ? Un différentiel a-t-il sauté ?
3. **Cherchez un interrupteur** : dans certaines chambres ou séjours, une prise est commandée par un interrupteur pour y brancher une lampe.
4. **Vérifiez les prises voisines** : si plusieurs prises d'une même pièce sont mortes, le problème est sur le circuit, pas sur une prise isolée.

## Les prises en chaîne

Dans la plupart des logements, les prises d'un même circuit sont **raccordées les unes à la suite des autres** : le courant arrive sur la première, repart vers la deuxième, et ainsi de suite. Si une borne se desserre sur l'une d'elles, **toutes les prises situées après** cessent de fonctionner.

C'est pourquoi la prise réellement en défaut n'est pas toujours celle qui ne marche pas. Je contrôle les prises du circuit dans l'ordre du câblage pour trouver la connexion défaillante.

[[cta]]

## Les autres causes

- **Prise endommagée** : contacts usés, boîtier fendu, éclipses bloquées.
- **Câble coupé** par un perçage ou un clou.
- **Connexion carbonisée** après un échauffement, parfois invisible de l'extérieur.

!> Si la prise est noircie, déformée ou sent le brûlé, ne la démontez pas sous tension : coupez le disjoncteur et consultez la page [prise qui chauffe](/prise-qui-chauffe/).`,
    cases: [
      { tag: 'Prises en chaîne', icon: 'cable', title: 'Trois prises mortes dans le séjour', text: "Les trois prises du mur de la télévision ne fonctionnent plus, alors que celles du mur opposé marchent.", result: 'Borne desserrée sur la prise précédente, derrière le buffet : resserrée et prise remplacée.' },
      { tag: 'Prise commandée', icon: 'toggle-right', title: 'Une panne qui n’en était pas une', text: "Une prise de chambre « morte » depuis l'emménagement. Elle était en réalité commandée par l'interrupteur de l'entrée de la pièce.", result: 'Explication sur place ; à la demande du client, prise transformée en prise permanente.' },
      { tag: 'Câble percé', icon: 'hammer', title: 'Une prise hors service après une fixation de TV', text: "Le support mural de la télévision a été fixé juste au-dessus de la prise, qui ne fonctionne plus depuis.", result: 'Câble traversé par une cheville, tronçon repris en boîte de raccordement accessible.' },
    ],
    faq: [
      { q: 'Combien coûte la réparation d’une prise ?', a: "La recherche du défaut sur le circuit est comprise dans le forfait dépannage de 79 €. La réparation elle-même fait l'objet d'un devis remis sur place, que vous acceptez ou non." },
      { q: 'Puis-je changer une prise moi-même ?', a: "C'est possible pour une personne avertie, disjoncteur coupé et absence de tension vérifiée. Mais une prise qui ne fonctionne plus cache souvent un défaut ailleurs sur le circuit." },
      { q: 'Pourquoi les autres prises de la pièce fonctionnent-elles encore ?', a: "Elles sont soit placées avant le défaut dans la chaîne, soit raccordées sur un autre circuit. Le repérage au tableau permet de le vérifier." },
    ],
    cta: { title: 'Une ou plusieurs prises hors service ?', text: 'Je trouve la connexion défaillante et je répare dans la foulée, prix annoncé.' },
    links: ['/prestations/prises-et-interrupteurs/', '/panne-courant-partielle/', '/prise-qui-chauffe/', '/prise-sans-terre/', '/petits-travaux-electriques/'],
    nearby: ['/electricien-signy-l-abbaye/', '/electricien-rethel/', '/electricien-charleville-mezieres/'],
    nearbyTitle: 'Intervention près de chez vous',
  },
  {
    slug: 'panne-electrique-apres-orage', group: 'symptomes', prestation: 'depannage',
    label: 'Panne électrique après un orage',
    title: 'Panne électrique après un orage : que faire ? | ALED08',
    description: "Plus de courant ou appareils grillés après un orage ? Les vérifications, la déclaration à l'assurance, l'attestation d'électricien et la protection.",
    kicker: 'Panne · Après un orage',
    h1: 'Panne électrique après un orage : les bons réflexes',
    lead: "Un orage est passé, et depuis plus rien ne fonctionne, ou seulement une partie de la maison. Parfois, des appareils sont définitivement hors service. Voici **dans quel ordre agir**, comment préparer votre **déclaration à l'assurance**, et comment mieux vous protéger ensuite.",
    body: `## 1. Identifier le type de panne

- **Plus de courant chez vous ni chez vos voisins** : le réseau est touché. Attendez le rétablissement par Enedis, ou signalez la panne au 09 726 750 08 pour les Ardennes.
- **Votre différentiel ou votre disjoncteur a sauté** : la surtension a pu provoquer un déclenchement sans dégât. Réarmez une fois. S'il tient, contrôlez vos appareils.
- **Le différentiel ne se réarme pas** : un équipement ou une partie de l'installation a été endommagé. Débranchez tout et réessayez ; sinon, faites intervenir un électricien.
- **Tout remarche, sauf certains appareils** : box, télévision, portail, chaudière… La surtension les a endommagés.

## 2. Préparer la déclaration à l'assurance

Les dommages électriques liés à la foudre sont souvent couverts par l'assurance habitation, selon votre contrat. Pour constituer votre dossier :

- déclarez le sinistre **dans le délai prévu par votre contrat**, souvent cinq jours ouvrés ;
- **conservez les appareils endommagés** : l'assureur peut demander à les voir ;
- notez la **date et l'heure** de l'orage ;
- rassemblez les factures d'achat si vous les avez.

Après mon intervention, je vous remets une **attestation** décrivant les constats sur l'installation et les travaux réalisés, document souvent demandé par les assureurs.

[[cta]]

## 3. Se protéger pour la prochaine fois

Le **parafoudre** limite les surtensions qui arrivent par le réseau électrique. Il est particulièrement utile pour les maisons isolées, alimentées par une ligne aérienne ou équipées de matériel électronique coûteux. Pensez aussi à la ligne téléphonique ou internet, une autre porte d'entrée des surtensions. Plus de détails sur la page [installation de parafoudre](/installation-parafoudre/).`,
    cases: [
      { tag: 'Différentiel', icon: 'cloud-lightning', title: 'Un différentiel qui ne tient plus après l’orage', text: "Au réveil, le différentiel du rez-de-chaussée est en bas et redéclenche immédiatement.", result: 'Alimentation de la pompe de puits grillée et en défaut : isolée, remplacée par le client, installation contrôlée saine.' },
      { tag: 'Appareils', icon: 'zap-off', title: 'Box, décodeur et alarme hors service', text: "Une maison isolée retrouve le courant, mais trois appareils sont définitivement éteints.", result: 'Contrôle de l’installation, attestation pour l’assurance, parafoudre posé dans le tableau.' },
      { tag: 'Tableau', icon: 'panel-top', title: 'Un disjoncteur noirci', text: "Après un orage violent, une odeur de brûlé près du tableau : un disjoncteur porte une trace noire.", result: 'Disjoncteur et peigne remplacés, contrôle de tous les circuits avant remise sous tension.' },
    ],
    faq: [
      { q: 'L’assurance rembourse-t-elle les appareils grillés par la foudre ?', a: "Souvent, oui, selon les garanties de votre contrat habitation (dommages électriques, foudre). Vérifiez vos conditions et déclarez rapidement le sinistre." },
      { q: 'Pouvez-vous fournir une attestation pour l’assurance ?', a: "Oui, après contrôle de l'installation : elle décrit les dégâts constatés et les travaux réalisés." },
      { q: 'Faut-il débrancher ses appareils pendant un orage ?', a: "C'est la meilleure protection pour les appareils sensibles, en particulier la box internet et le téléviseur, qui peuvent aussi être touchés par la ligne téléphonique." },
    ],
    cta: { title: 'Des dégâts après un orage ?', text: 'Je contrôle votre installation, je remets en service en sécurité et je vous fournis une attestation.' },
    links: ['/installation-parafoudre/', '/differentiel-qui-saute/', '/prestations/depannage-electrique/', '/electricien-novion-porcien/', '/electricien-chaumont-porcien/'],
    nearby: ['/electricien-novion-porcien/', '/electricien-chaumont-porcien/', '/electricien-porcien/'],
    nearbyTitle: 'Secteurs exposés',
  },
  {
    slug: 'disjoncte-quand-il-pleut', group: 'symptomes', prestation: 'recherche-panne',
    label: 'Ça disjoncte quand il pleut',
    title: 'Ça disjoncte quand il pleut : trouver l’infiltration | ALED08',
    description: 'Votre différentiel saute à chaque pluie ? Luminaires extérieurs, prises de jardin, câbles enterrés, boîtes humides : localiser et réparer la fuite.',
    kicker: 'Panne · Coupures par temps de pluie',
    h1: 'Ça disjoncte quand il pleut : où l’eau s’infiltre-t-elle ?',
    lead: "Le différentiel tient tout l'été, puis saute à chaque averse dès l'automne. Ce scénario, très courant dans les Ardennes, a presque toujours la même cause : **de l'eau entre en contact avec une partie sous tension**. Il reste à trouver où.",
    body: `## Les suspects habituels

Par ordre de fréquence, voici ce que je trouve le plus souvent :

1. **Un luminaire extérieur** dont le joint a vieilli : l'eau s'accumule dans le corps de l'applique ou du projecteur.
2. **Une prise extérieure** sans clapet, ou dont le clapet ne ferme plus.
3. **Une boîte de raccordement extérieure** non étanche, souvent sous une gouttière ou au pied d'un mur.
4. **Un câble enterré** ancien, posé sans gaine, dont l'isolant s'est dégradé.
5. **Une infiltration dans les combles** qui atteint une boîte de dérivation ou un spot.
6. **Une pompe de bassin ou de fontaine** dont le câble est abîmé.

## Comment je localise le défaut

Le défaut n'apparaît souvent qu'avec l'humidité. Je procède donc en deux temps :

- **Isoler les circuits extérieurs** : si le différentiel tient quand ils sont déconnectés, la recherche se concentre dehors.
- **Mesurer l'isolement** de chaque circuit, idéalement par temps humide, quand le défaut est actif.

Une fois le circuit identifié, l'inspection de chaque point de raccordement révèle généralement le coupable : traces d'eau, oxydation, condensation dans un hublot.

[[cta]]

## Réparer durablement

Remplacer un luminaire par un modèle de même qualité ne fait que repousser la panne. Je choisis un **indice de protection adapté à l'exposition** (IP65 sur une façade battue par la pluie), je soigne les **entrées de câble par le bas** avec presse-étoupe, et je place les boîtes de raccordement à l'abri. Pour les circuits extérieurs, une **protection différentielle séparée** évite qu'un défaut dehors ne prive toute la maison de courant.`,
    cases: [
      { tag: 'Applique', icon: 'lamp-wall-up', title: 'Une applique pleine d’eau', text: "Un différentiel qui saute à chaque pluie depuis deux automnes. L'applique au-dessus de la porte de garage contenait un fond d'eau.", result: 'Applique IP65 posée avec entrée de câble par le bas, plus aucun déclenchement.' },
      { tag: 'Câble enterré', icon: 'cable', title: 'Un lampadaire de jardin des années 90', text: "Le lampadaire du fond du jardin était alimenté par un câble enterré sans gaine, à 20 cm de profondeur.", result: 'Câble remplacé sous gaine rouge à 50 cm, avec grillage avertisseur ; circuit extérieur séparé.' },
      { tag: 'Combles', icon: 'droplets', title: 'Un spot sous une tuile cassée', text: "Des déclenchements uniquement lors des pluies de vent d'ouest. Une tuile déplacée laissait l'eau couler sur un spot de la salle de bain.", result: 'Boîtier du spot remplacé, signalement de la tuile au couvreur, circuit mesuré sain.' },
    ],
    faq: [
      { q: 'Pourquoi le défaut disparaît-il quand il fait sec ?', a: "Parce que l'eau est le conducteur qui crée la fuite vers la terre. Une fois sèche, la fuite disparaît… jusqu'à la prochaine pluie. C'est pourquoi la mesure d'isolement est précieuse." },
      { q: 'Puis-je couper les circuits extérieurs en attendant ?', a: "Oui, si votre tableau le permet : c'est une bonne mesure provisoire pour garder le reste de la maison en service." },
      { q: 'Combien coûte la recherche ?', a: "Le forfait dépannage de 79 € (plus le supplément kilométrique éventuel) couvre la recherche de l'infiltration. Le remplacement du luminaire, de la boîte ou du câble vous est proposé sur devis." },
    ],
    cta: { title: 'Votre maison disjoncte à chaque pluie ?', text: 'Je localise l’infiltration et je répare avec du matériel adapté à l’exposition.' },
    links: ['/differentiel-qui-saute/', '/prestations/eclairage-exterieur/', '/prise-exterieure/', '/eclairage-exterieur-detecteur/', '/recherche-panne-electrique-ardennes/'],
    nearby: ['/electricien-chateau-porcien/', '/electricien-thierache-ardennaise/', '/electricien-rethel/'],
    nearbyTitle: 'Secteurs concernés',
  },
  {
    slug: 'linky-qui-disjoncte', group: 'symptomes', prestation: 'depannage',
    label: 'Compteur Linky qui disjoncte',
    title: 'Linky qui disjoncte : causes et solutions | ALED08 Ardennes',
    description: "Votre compteur Linky coupe le courant ? Puissance dépassée, appareil en défaut ou abonnement trop juste : comment réarmer, et quand appeler un électricien.",
    kicker: 'Panne · Compteur Linky',
    h1: 'Compteur Linky qui disjoncte : dépassement de puissance ou vraie panne ?',
    lead: "Tout s'éteint d'un coup, et l'écran du compteur affiche un message de **puissance dépassée** : c'est le Linky lui-même qui a coupé. Le plus souvent, il ne s'agit pas d'une panne, mais d'une **consommation supérieure à votre abonnement**. Encore faut-il s'en assurer.",
    body: `## Pourquoi le Linky coupe

Avec les anciens compteurs, c'était le disjoncteur de branchement qui limitait la puissance. Avec le Linky, **le compteur surveille lui-même** la puissance appelée. Si vous dépassez la puissance souscrite (6, 9 ou 12 kVA par exemple), il coupe l'alimentation.

## Comment remettre le courant

1. **Éteignez quelques appareils puissants** : four, plaques, radiateurs, lave-linge, sèche-linge.
2. **Réarmez** : selon votre installation, appuyez environ deux secondes sur le bouton « + » du compteur, ou abaissez puis relevez la manette du disjoncteur de branchement.
3. Rallumez vos appareils **progressivement**.

Si le courant revient et tient, vous étiez simplement au-dessus de votre abonnement.

## Quand ce n'est pas qu'une question d'abonnement

Le dépassement peut aussi révéler un problème :

- un **chauffe-eau qui chauffe en journée** à cause d'un contacteur bloqué, et s'ajoute au reste ;
- un **appareil en défaut** qui consomme anormalement ;
- un **chauffage électrique** dont le délestage ne fonctionne plus ;
- un **disjoncteur de branchement** qui déclenche pour une fuite de courant, et non pour la puissance.

[[cta]]

## Les solutions durables

- **Décaler les usages** : lave-linge et lave-vaisselle en heures creuses, pas en même temps que le four.
- **Installer un délesteur**, qui coupe temporairement le chauffage quand la puissance approche de la limite.
- **Augmenter la puissance souscrite** auprès de votre fournisseur : avec le Linky, le changement se fait à distance.

Avant d'augmenter votre abonnement, et donc votre facture, il vaut la peine de vérifier que rien ne consomme anormalement. C'est ce que je contrôle avec une pince ampèremétrique, circuit par circuit.`,
    cases: [
      { tag: 'Chauffe-eau', icon: 'thermometer', title: 'Des coupures chaque soir à 19 h', text: "Depuis l'automne, le Linky coupe au moment du repas. Le foyer pensait devoir passer de 6 à 9 kVA.", result: 'Chauffe-eau en marche forcée permanente : contacteur remplacé sur devis, abonnement conservé.' },
      { tag: 'Abonnement', icon: 'gauge', title: 'Une pompe à chaleur ajoutée sur un 6 kVA', text: "Après la pose d'une pompe à chaleur, les coupures surviennent à chaque dégivrage.", result: 'Mesures normales : puissance réellement insuffisante, passage à 9 kVA conseillé et demandé par le client.' },
      { tag: 'Délestage', icon: 'zap', title: 'Un délesteur qui ne délestait plus', text: "Une maison tout électrique équipée d'un délesteur ancien, pourtant sujette aux coupures.", result: 'Délesteur hors service identifié, remplacement chiffré sur devis.' },
    ],
    faq: [
      { q: 'Comment savoir si c’est le Linky qui a coupé ?', a: "L'écran du compteur affiche un message de dépassement de puissance, et les manettes de votre tableau sont restées en position haute." },
      { q: 'Combien coûte une augmentation de puissance ?', a: "Elle se demande à votre fournisseur d'électricité, qui applique des frais de mise en service et un abonnement plus élevé. Vérifiez d'abord que l'installation ne consomme pas anormalement." },
      { q: 'Un électricien peut-il intervenir sur le Linky ?', a: "Non : le compteur appartient au réseau, seul Enedis y intervient. En revanche, je contrôle tout ce qui se trouve en aval, c'est-à-dire votre installation." },
    ],
    cta: { title: 'Votre Linky coupe régulièrement ?', text: 'Avant de payer un abonnement plus élevé, faisons vérifier que rien ne consomme anormalement. Forfait dépannage 79 €.' },
    links: ['/disjoncteur-qui-saute/', '/chauffe-eau-electrique-ne-chauffe-plus/', '/radiateur-electrique-ne-chauffe-plus/', '/prestations/recherche-de-panne/', '/blog/differentiel-ou-disjoncteur-difference/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-rocroi/', '/electricien-nouzonville/'],
    nearbyTitle: 'Dépannage près de chez vous',
  },
  {
    slug: 'chauffe-eau-electrique-ne-chauffe-plus', group: 'symptomes', prestation: 'depannage',
    label: 'Chauffe-eau électrique qui ne chauffe plus',
    title: 'Chauffe-eau électrique qui ne chauffe plus : que vérifier ? | ALED08',
    description: "Plus d'eau chaude ? Disjoncteur, contacteur heures creuses, thermostat de sécurité, résistance : les vérifications à faire sur un chauffe-eau électrique en panne.",
    kicker: 'Panne · Plus d’eau chaude',
    h1: 'Chauffe-eau électrique qui ne chauffe plus : la panne est souvent en amont',
    lead: "Une douche froide un matin, et l'on imagine déjà le ballon à remplacer. Pourtant, dans une bonne partie des cas, **le chauffe-eau n'y est pour rien** : c'est son alimentation ou sa commande qui est en défaut. Voici les vérifications à faire dans l'ordre.",
    body: `## Ce que vous pouvez vérifier vous-même

1. **Le disjoncteur du chauffe-eau**, au tableau : est-il enclenché ?
2. **Le contacteur heures creuses** (ou jour/nuit), juste à côté. Il possède en général trois positions : arrêt, automatique et marche forcée. Il doit être sur **automatique**.
3. **Le test en marche forcée** : basculez le contacteur sur marche forcée. Si l'eau est chaude quelques heures plus tard, le ballon fonctionne, et c'est la commande heures creuses qui ne se déclenche plus.

N'ouvrez pas le capot du chauffe-eau : les bornes qu'il protège sont sous tension.

## Les causes électriques les plus fréquentes

- **Contacteur heures creuses défaillant** : il ne colle plus, ou reste bloqué.
- **Signal heures creuses absent** depuis le compteur.
- **Disjoncteur fatigué** ou connexion desserrée sur la ligne du ballon.
- **Thermostat de sécurité déclenché** après une surchauffe : il se réarme, mais il faut comprendre pourquoi il a déclenché.
- **Résistance entartrée ou percée**, qui ne chauffe plus ou fait sauter le différentiel.

[[cta]]

## Ce que je fais sur place

Je contrôle la présence de tension à chaque étape, du tableau jusqu'aux bornes du ballon, puis je mesure la résistance et le thermostat. Vous savez alors précisément **quelle pièce est en cause**. Si la réparation relève de l'électricité, je vous la chiffre sur devis. Si le ballon doit être vidangé ou remplacé, je vous le dis pour que vous fassiez appel à un plombier en sachant quoi demander.`,
    cases: [
      { tag: 'Contacteur', icon: 'zap-off', title: 'De l’eau chaude un jour sur deux', text: "L'eau est chaude certains matins, froide d'autres. Le contacteur du tableau grésille légèrement.", result: 'Contacteur usé qui ne collait plus à chaque fois : remplacé sur devis, eau chaude tous les matins.' },
      { tag: 'Thermostat', icon: 'thermometer', title: 'Une sécurité qui a déclenché', text: "Après une coupure de courant générale, le chauffe-eau ne redémarre pas.", result: 'Thermostat de sécurité déclenché, réarmé après contrôle ; fonctionnement vérifié sur un cycle.' },
      { tag: 'Résistance', icon: 'droplets', title: 'Le différentiel saute la nuit', text: "Chaque nuit vers 23 h, le différentiel déclenche et l'eau reste tiède.", result: 'Résistance percée mesurée en défaut : remplacement orienté vers le plombier, avec le diagnostic écrit.' },
    ],
    faq: [
      { q: 'Combien de temps faut-il pour retrouver de l’eau chaude ?', a: "Une fois l'alimentation rétablie, comptez quatre à six heures de chauffe pour un ballon de 200 litres." },
      { q: 'Dois-je appeler un plombier ou un électricien ?', a: "Si le disjoncteur ou le contacteur est en cause, l'électricien. Si le ballon fuit ou si la résistance est entartrée, le plombier. En cas de doute, le diagnostic électrique permet de trancher." },
      { q: 'Peut-on laisser le contacteur en marche forcée ?', a: "Provisoirement, oui, pour avoir de l'eau chaude. Mais le ballon chauffera en heures pleines : pensez à le remettre sur automatique une fois la panne réglée." },
    ],
    cta: { title: 'Plus d’eau chaude ?', text: 'Avant de changer le ballon, faisons vérifier son alimentation. Forfait dépannage 79 €, devis compris.' },
    links: ['/linky-qui-disjoncte/', '/differentiel-qui-saute/', '/remplacement-disjoncteur/', '/prestations/depannage-electrique/', '/electricien-saulces-monclin/'],
    nearby: ['/depannage-electrique-ardennes/', '/depannage-electrique-rethel/', '/depannage-electrique-charleville-mezieres/'],
    nearbyTitle: 'Dépannage près de chez vous',
  },
  {
    slug: 'radiateur-electrique-ne-chauffe-plus', group: 'symptomes', prestation: 'depannage',
    label: 'Radiateur électrique qui ne chauffe plus',
    title: 'Radiateur électrique qui ne chauffe plus : causes | ALED08 Ardennes',
    description: "Un radiateur électrique reste froid ? Alimentation, fil pilote, thermostat, sécurité thermique : les causes possibles et les vérifications avant de le remplacer.",
    kicker: 'Panne · Chauffage électrique',
    h1: 'Radiateur électrique qui ne chauffe plus : faut-il vraiment le remplacer ?',
    lead: "Au premier froid, un radiateur reste glacé alors que les autres chauffent. Avant d'en acheter un neuf, sachez qu'**un radiateur froid n'est pas forcément un radiateur en panne** : son alimentation ou sa commande sont souvent seules en cause.",
    body: `## Un seul radiateur, ou plusieurs ?

- **Tous les radiateurs d'une zone sont froids** : cherchez du côté du tableau (disjoncteur, délesteur) ou du programmateur qui les commande.
- **Un seul radiateur est froid** : la cause se situe dans son raccordement ou dans l'appareil.

## Les vérifications simples

1. **Le disjoncteur** du circuit de chauffage est-il enclenché ?
2. **Le thermostat** du radiateur est-il réglé au-dessus de la température de la pièce, et sur un mode « confort » ?
3. **Le programmateur central**, s'il existe, n'envoie-t-il pas un ordre « éco », « hors-gel » ou « arrêt » ?
4. **Le radiateur est-il dégagé** ? Un linge posé dessus ou un meuble collé devant déclenche sa sécurité thermique.

## Le fil pilote, coupable discret

Les radiateurs modernes obéissent à un **fil pilote**, qui leur transmet les ordres du programmateur. Si ce fil reçoit un ordre d'arrêt permanent, à cause d'un programmateur déréglé, d'un délesteur ou d'un raccordement défectueux, le radiateur reste froid alors qu'il est en parfait état.

[[cta]]

## Quand le radiateur est réellement en panne

Thermostat électronique hors service, résistance coupée, carte de commande défaillante : cela arrive, surtout sur des appareils de plus de quinze ou vingt ans. Je mesure la résistance et la tension aux bornes pour le confirmer. Le remplacement, et un éventuel passage à un radiateur à inertie plus confortable, font alors l'objet d'un devis.`,
    cases: [
      { tag: 'Fil pilote', icon: 'cable', title: 'Une chambre froide tout l’hiver', text: "Le radiateur de la chambre ne chauffait plus depuis le remplacement du programmateur.", result: 'Fil pilote raccordé sur la mauvaise zone : corrigé, radiateur parfaitement fonctionnel.' },
      { tag: 'Sécurité thermique', icon: 'flame', title: 'Un radiateur derrière le canapé', text: "Le convecteur du salon se coupait au bout de vingt minutes, puis repartait.", result: 'Sécurité thermique déclenchée par le canapé collé à l’appareil : meuble décalé, aucun remplacement.' },
      { tag: 'Remplacement', icon: 'thermometer', title: 'Un convecteur de 1995 en fin de vie', text: "Un radiateur froid dont la résistance était coupée, sur un appareil de près de trente ans.", result: 'Remplacement par un radiateur à inertie sur devis, raccordé sur la sortie de câble existante.' },
    ],
    faq: [
      { q: 'Mon radiateur est tiède mais ne chauffe pas la pièce : pourquoi ?', a: "Il peut recevoir un ordre « éco » par le fil pilote, être sous-dimensionné pour la pièce, ou avoir un thermostat déréglé. Une mesure permet de le savoir." },
      { q: 'Peut-on remplacer un radiateur sans refaire le circuit ?', a: "Oui, si la puissance du nouvel appareil est comparable et que la ligne est en bon état. Je le vérifie avant de vous remettre le devis." },
      { q: 'Plusieurs radiateurs se coupent quand le four fonctionne : est-ce normal ?', a: "C'est probablement un délesteur, qui coupe le chauffage pour éviter de dépasser la puissance de votre abonnement. S'il coupe trop souvent, l'abonnement ou le réglage sont à revoir." },
    ],
    cta: { title: 'Un radiateur froid en plein hiver ?', text: 'Je vérifie l’alimentation et la commande avant de parler de remplacement. Forfait dépannage 79 €.' },
    links: ['/linky-qui-disjoncte/', '/disjoncteur-qui-saute/', '/ajout-circuit-electrique/', '/electricien-rocroi/', '/electricien-sault-les-rethel/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-rocroi/', '/electricien-rimogne/'],
    nearbyTitle: 'Dépannage près de chez vous',
  },
  {
    slug: 'tableau-electrique-qui-gresille', group: 'symptomes', prestation: 'depannage',
    label: 'Tableau électrique qui grésille ou chauffe',
    title: 'Tableau électrique qui grésille, bourdonne ou chauffe | ALED08',
    description: "Votre tableau électrique grésille, bourdonne, chauffe ou sent le brûlé ? Les bruits normaux, les signes de danger et les gestes à faire tout de suite.",
    kicker: 'Alerte · Tableau électrique',
    h1: 'Tableau électrique qui grésille, bourdonne ou chauffe',
    lead: "Un tableau électrique en bon état est **presque silencieux et froid**. S'il se met à grésiller, à crépiter, à chauffer ou à sentir le plastique chaud, une connexion est probablement en train de se dégrader. C'est un signal à prendre au sérieux.",
    body: `!> Odeur de brûlé, traces noires, crépitement ou capot chaud : coupez le disjoncteur général et ne remettez pas le courant avant un contrôle. En cas de fumée ou de flammes, sortez et appelez le 18.

## Les bruits qui sont normaux

- Un **léger bourdonnement** du contacteur heures creuses lorsqu'il est enclenché.
- Un **« clac » franc** quand un télérupteur ou un contacteur change d'état.
- Le déclic d'une **horloge** ou d'un programmateur.

Ces bruits sont réguliers, discrets et ne s'accompagnent d'aucune chaleur.

## Les signes qui doivent alerter

- Un **grésillement ou un crépitement** irrégulier, comme de petites étincelles.
- Un bourdonnement qui **s'amplifie** quand un gros appareil fonctionne.
- Un disjoncteur ou un capot **tiède ou chaud** au toucher.
- Une **odeur** de plastique chaud ou de poisson, typique d'un isolant qui chauffe.
- Des **traces brunes ou noires** autour d'une borne.

## D'où vient le problème ?

Presque toujours d'une **connexion desserrée**. Le courant passe mal, un petit arc se forme, la borne chauffe, le métal se dilate puis se rétracte, et le serrage se dégrade encore. Le phénomène s'entretient jusqu'à faire fondre l'isolant. Les autres causes sont un **disjoncteur en fin de vie**, un **contacteur usé** ou un **circuit surchargé**.

[[cta]]

## Mon intervention

Tableau hors tension, je dépose les capots, je repère la borne ou l'appareil échauffé et je contrôle le serrage de l'ensemble des connexions. Je vous montre ce que j'ai trouvé, puis je vous remets un devis : remplacement d'un disjoncteur, d'un peigne ou d'un contacteur, ou remplacement du tableau s'il est trop dégradé.`,
    cases: [
      { tag: 'Grésillement', icon: 'zap', title: 'Un crépitement quand le four chauffe', text: "Un petit bruit d'étincelles se fait entendre au tableau à chaque utilisation du four.", result: 'Borne du disjoncteur four desserrée et noircie : disjoncteur et câble repris sur devis.' },
      { tag: 'Bourdonnement', icon: 'info', title: 'Un contacteur de plus en plus bruyant', text: "Le bourdonnement nocturne du tableau, d'abord discret, s'entendait désormais depuis la chambre.", result: 'Contacteur heures creuses usé remplacé par un modèle silencieux.' },
      { tag: 'Odeur', icon: 'flame', title: 'Une odeur de poisson dans l’entrée', text: "Une odeur étrange, sans origine apparente, près du placard du tableau.", result: 'Peigne d’alimentation en surchauffe sous le capot : rangée refaite après mise en sécurité immédiate.' },
    ],
    faq: [
      { q: 'Un tableau qui bourdonne est-il dangereux ?', a: "Un léger bourdonnement régulier du contacteur est normal. Un bruit irrégulier, qui grésille ou s'accompagne de chaleur, ne l'est pas : faites contrôler sans attendre." },
      { q: 'Puis-je resserrer les bornes moi-même ?', a: "Non. Même disjoncteur général coupé, certaines parties du tableau restent sous tension. C'est une intervention à confier à un électricien." },
      { q: 'Faudra-t-il changer tout le tableau ?', a: "Pas forcément. Souvent, le remplacement de l'élément échauffé et un resserrage général suffisent. Si le tableau est ancien ou très abîmé, je vous chiffre aussi son remplacement." },
    ],
    cta: { title: 'Votre tableau fait du bruit ou chauffe ?', text: 'Coupez le courant en cas de doute et appelez-moi : je contrôle et je vous dis ce qu’il en est. Forfait 79 €.' },
    links: ['/prise-qui-chauffe/', '/remplacement-disjoncteur/', '/prestations/tableau-electrique/', '/electricien-urgence-ardennes/', '/blog/pourquoi-remplacer-un-tableau-electrique/'],
    nearby: ['/depannage-electrique-ardennes/', '/electricien-signy-l-abbaye/', '/electricien-rethel/'],
    nearbyTitle: 'Dépannage près de chez vous',
  },
];
