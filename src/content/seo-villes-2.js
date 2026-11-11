// Pages communes (suite) : grandes villes et bourgs du nord et du sud des Ardennes
module.exports = [
  // ------------------------------------------------------------------ VOUZIERS
  {
    slug: 'electricien-vouziers', group: 'villes', city: 'Vouziers', prestation: 'depannage',
    label: 'Électricien à Vouziers',
    teaser: 'Sud des Ardennes et Argonne : maisons de bourg, fermes, dépannage planifié.',
    title: 'Électricien à Vouziers | ALED08',
    description: "Électricien à Vouziers et en Argonne ardennaise : dépannage électrique, recherche de panne, tableau, mise en sécurité. Prix annoncé avant de venir.",
    kicker: 'Électricien · Vouziers (08400)',
    h1: 'Électricien à Vouziers et dans l’Argonne ardennaise',
    lead: "Sous-préfecture du sud des Ardennes, **Vouziers** rayonne sur un vaste territoire rural, de la vallée de l'Aisne aux villages de l'Argonne. J'y interviens pour les **pannes**, la **recherche de panne** et la **mise en sécurité** des maisons, 7 j/7 sur rendez-vous.",
    body: `## Des installations très variées

Entre les maisons de ville du centre, les pavillons des années 70 et les corps de ferme des villages voisins, on trouve à Vouziers à peu près toutes les générations d'installations. C'est justement ce qui rend le **diagnostic** important : une même coupure n'a pas la même cause dans un logement récent et dans une ancienne ferme alimentée par une longue ligne.

## Bien préparer un dépannage dans le sud du département

Pour qu'un seul déplacement suffise, je vous pose quelques questions au téléphone et je vous demande, si possible, **une photo du tableau électrique**. J'arrive ainsi avec les bonnes pièces et les bons appareils de mesure. Le prix du forfait dépannage vous est annoncé à ce moment-là, avant que je prenne la route.

[[cta]]

## Fermes et dépendances

Granges transformées, ateliers, hangars : ces bâtiments ont souvent été raccordés au fil des besoins, parfois par une simple rallonge enterrée. Quand une dépendance fait disjoncter toute la maison, je contrôle l'**isolement de la ligne** et je propose, si besoin, un petit tableau secondaire protégé par son propre différentiel.`,
    cases: [
      { tag: 'Ferme', icon: 'house', title: 'La grange qui coupe toute la maison', text: "À chaque mise en route de l'éclairage de la grange, le différentiel général déclenche.", result: 'Défaut d’isolement trouvé sur une douille extérieure humide : remplacement par un hublot étanche.' },
      { tag: 'Maison de ville', icon: 'panel-top', title: 'Un tableau à fusibles en centre-ville', text: "Des fusibles en porcelaine et aucune protection différentielle dans une maison achetée récemment.", result: 'Devis de remplacement du tableau avec différentiels 30 mA, réalisé sur une journée.' },
      { tag: 'Pavillon', icon: 'thermometer', title: 'Chauffage coupé un dimanche', text: "Le disjoncteur du chauffage refuse de se réarmer en plein hiver.", result: 'Connexion brûlée dans la boîte d’un convecteur : réparée, chauffage rétabli dans la journée.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Vouziers ?', a: "Le forfait dépannage à Vouziers est sur devis : je vous annonce son prix au téléphone avant de venir, déplacement, recherche de panne et devis de réparation compris." },
      { q: 'Intervenez-vous dans les villages de l’Argonne ?', a: "Oui : Ballay, Grandpré, Monthois, Quatre-Champs, Buzancy et les communes voisines. Le prix est annoncé selon votre adresse." },
      { q: 'Pouvez-vous venir le week-end à Vouziers ?', a: "Oui, sur rendez-vous. Le week-end est souvent le meilleur moment pour les travaux qui demandent une coupure prolongée." },
    ],
    cta: { title: 'Une panne à Vouziers ?', text: 'Écrivez-moi : je vous annonce le prix et je vous propose un créneau, même le week-end.' },
    links: ['/panne-courant-partielle/', '/electricien-maison-ancienne/', '/remplacement-tableau-a-fusibles/', '/ligne-electrique-garage-atelier/', '/coupure-courant-maison-entiere/'],
    nearby: ['/electricien-le-chesne/', '/electricien-attigny/', '/electricien-juniville/', '/electricien-rethel/'],
  },

  // ------------------------------------------------------------------ REVIN
  {
    slug: 'electricien-revin', group: 'villes', city: 'Revin', prestation: 'depannage',
    label: 'Électricien à Revin',
    teaser: 'Vallée de la Meuse : maisons en pente, caves humides, logements anciens.',
    title: 'Électricien à Revin | ALED08',
    description: "Électricien à Revin, vallée de la Meuse : dépannage, disjoncteur qui saute, caves humides, tableaux anciens à sécuriser. Prix annoncé avant de venir.",
    kicker: 'Électricien · Revin (08500)',
    h1: 'Électricien à Revin, dans les méandres de la Meuse',
    lead: "Lovée dans un méandre de la Meuse, **Revin** compte beaucoup de maisons construites à flanc de coteau, avec des **sous-sols et des caves** où l'humidité ne pardonne pas aux installations électriques. J'y interviens pour les dépannages et les mises en sécurité, 7 j/7 sur rendez-vous.",
    body: `## L'humidité, ennemie numéro un

Dans une maison adossée à la pente, le niveau bas est souvent semi-enterré. Prises, boîtes de dérivation et luminaires y vieillissent plus vite : l'eau s'infiltre, les bornes s'oxydent, et le **différentiel finit par sauter**, parfois seulement par temps de pluie. La recherche se fait au mégohmmètre, circuit par circuit, jusqu'à trouver le point faible.

## Les logements anciens du centre

Les immeubles et maisons mitoyennes du centre ont souvent été rénovés par étapes. On y trouve des **tableaux mixtes**, avec des fusibles d'un côté et des disjoncteurs de l'autre, et parfois des circuits sans terre. Je fais le point et je vous propose une mise en sécurité par priorités, sans tout refaire si ce n'est pas nécessaire.

[[cta]]

## Un dépannage préparé à distance

Revin est dans le nord de mon secteur : pour un dépannage, je vous demande une description précise et, si vous le pouvez, une photo du tableau sur WhatsApp. Je vous annonce alors le prix du forfait et nous fixons un créneau.`,
    cases: [
      { tag: 'Sous-sol', icon: 'droplets', title: 'Le différentiel saute quand il pleut', text: "Dans une maison à flanc de coteau, le courant coupe à chaque grosse averse.", result: 'Boîte de dérivation noyée dans le sous-sol, remplacée par une boîte étanche posée en hauteur.' },
      { tag: 'Tableau', icon: 'panel-top', title: 'Fusibles et disjoncteurs mélangés', text: "Un tableau rafistolé au fil des années, sans repérage des circuits.", result: 'Tableau remplacé sur devis, chaque circuit repéré et protégé par un différentiel 30 mA.' },
      { tag: 'Escalier', icon: 'lightbulb', title: 'Un escalier extérieur dans le noir', text: "L'éclairage de l'escalier qui descend au jardin ne fonctionnait plus depuis l'automne.", result: 'Câble abîmé remplacé et éclairage à détection installé, étanche et sécurisé.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Revin ?', a: "À Revin, le forfait dépannage est sur devis : je vous annonce son montant au téléphone, avant de me déplacer, recherche de panne et devis de réparation inclus." },
      { q: 'Pourquoi mon courant coupe-t-il seulement par temps de pluie ?', a: "C'est presque toujours une infiltration d'eau dans une boîte, une prise ou un luminaire extérieur ou en sous-sol. La mesure d'isolement permet de la localiser." },
      { q: 'Intervenez-vous à Anchamps ou Haybes ?', a: "Oui, dans toute la vallée de la Meuse autour de Revin, avec un prix annoncé avant de venir." },
    ],
    cta: { title: 'Une panne à Revin ?', text: 'Décrivez-moi le problème ou envoyez une photo du tableau : je vous annonce le prix et un créneau.' },
    links: ['/disjoncte-quand-il-pleut/', '/differentiel-qui-saute/', '/remplacement-tableau-a-fusibles/', '/eclairage-exterieur-detecteur/', '/prise-sans-terre/'],
    nearby: ['/electricien-fumay/', '/electricien-bogny-sur-meuse/', '/electricien-montherme/', '/electricien-rocroi/'],
  },

  // ------------------------------------------------------------------ GIVET
  {
    slug: 'electricien-givet', group: 'villes', city: 'Givet', prestation: 'depannage',
    label: 'Électricien à Givet',
    teaser: 'Pointe de Givet : interventions planifiées, maisons de ville, frontière belge.',
    title: 'Électricien à Givet | ALED08',
    description: "Électricien à Givet et dans la pointe des Ardennes : dépannage planifié, tableaux électriques, mise en sécurité, éclairage. Prix annoncé avant de venir.",
    kicker: 'Électricien · Givet (08600)',
    h1: 'Électricien à Givet, au bout de la pointe des Ardennes',
    lead: "Tout au nord du département, entre la Meuse et la frontière belge, **Givet** est loin des grandes villes ardennaises. J'y interviens sur rendez-vous, en organisant mes passages pour **regrouper les interventions** du secteur et vous proposer un prix clair, annoncé avant de venir.",
    body: `## Des passages organisés dans la pointe

La pointe de Givet demande de la route. Pour que ce soit intéressant pour vous, je regroupe les interventions de Givet, Vireux, Fumay et des villages voisins sur les mêmes journées. Résultat : **un délai raisonnable**, et un prix du forfait dépannage annoncé au téléphone, sans surprise sur la facture.

## Ce que l'on me demande le plus souvent

- **Remise en sécurité** de maisons de ville anciennes, au pied du fort de Charlemont ou dans les rues commerçantes.
- **Remplacement de tableaux** vieillissants, souvent sans différentiel 30 mA.
- **Ajout de prises et de circuits** pour une cuisine refaite ou un logement rénové avant location.

[[cta]]

## Une panne qui ne peut pas attendre ?

Envoyez-moi un message : je vous réponds rapidement avec un créneau. En attendant, je vous guide au téléphone pour **isoler le circuit en défaut** et récupérer l'électricité dans le reste du logement, en toute sécurité.`,
    cases: [
      { tag: 'Location', icon: 'key-round', title: 'Un appartement à remettre en location', text: "Un propriétaire veut relouer un logement dont l'installation date des années 70.", result: 'Mise en sécurité ciblée : tableau neuf, terre vérifiée, prises de la salle de bain mises en conformité.' },
      { tag: 'Cuisine', icon: 'plug-zap', title: 'Une cuisine refaite sans circuit dédié', text: "La nouvelle plaque et le four étaient branchés sur le circuit des prises.", result: 'Deux circuits spécialisés tirés depuis le tableau, avec leurs protections adaptées.' },
      { tag: 'Dépannage', icon: 'zap-off', title: 'La moitié de la maison sans courant', text: "Un circuit entier ne revient pas après un orage.", result: 'Disjoncteur endommagé par la surtension remplacé, parafoudre proposé sur devis.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Givet ?', a: "Pour Givet, le forfait dépannage est sur devis : son prix vous est annoncé au téléphone avant mon déplacement, et il comprend la recherche de panne et le devis de réparation." },
      { q: 'Venez-vous vraiment jusqu’à Givet ?', a: "Oui, sur rendez-vous. Je regroupe les interventions de la pointe pour limiter les trajets et vous proposer un créneau dans un délai raisonnable." },
      { q: 'Intervenez-vous à Vireux-Molhain et Vireux-Wallerand ?', a: "Oui, ainsi qu'à Aubrives, Ham-sur-Meuse, Chooz et dans les villages de la pointe." },
    ],
    cta: { title: 'Un besoin à Givet ?', text: 'Envoyez-moi un message ou décrivez votre demande en ligne : prix annoncé avant, créneau organisé avec vous.' },
    links: ['/electricien-proprietaire-bailleur/', '/ajout-circuit-electrique/', '/panne-electrique-apres-orage/', '/installation-parafoudre/', '/mise-aux-normes-electrique/'],
    nearby: ['/electricien-fumay/', '/electricien-revin/', '/electricien-ardennes/', '/depannage-electrique-ardennes/'],
  },

  // ------------------------------------------------------------------ FUMAY
  {
    slug: 'electricien-fumay', group: 'villes', city: 'Fumay', prestation: 'depannage',
    label: 'Électricien à Fumay',
    teaser: 'Ancienne cité ardoisière : maisons anciennes, étages, rénovations par étapes.',
    title: 'Électricien à Fumay | ALED08',
    description: "Électricien à Fumay : dépannage électrique, maisons anciennes à mettre en sécurité, éclairage, prises et tableaux. Prix annoncé avant de venir, sur rendez-vous.",
    kicker: 'Électricien · Fumay (08170)',
    h1: 'Électricien à Fumay, cité des ardoisiers',
    lead: "Accrochée à un méandre de la Meuse, **Fumay** a gardé de son passé ardoisier des **maisons hautes et étroites**, souvent rénovées étage par étage. J'y interviens pour remettre de l'ordre dans ces installations et pour les dépannages du quotidien.",
    body: `## Une maison, plusieurs époques

Quand une maison a été rénovée par morceaux, l'installation électrique raconte son histoire : un étage refait aux normes, un autre resté d'origine, des câbles ajoutés en apparent. Mon premier travail est de **comprendre ce qui alimente quoi**, puis de repérer les points dangereux : absence de terre, conducteurs trop fins, protections inadaptées.

## Sécuriser sans tout refaire

Une rénovation complète n'est pas toujours nécessaire. Souvent, on gagne beaucoup en sécurité avec :

- un **tableau neuf** et des différentiels 30 mA ;
- la **mise à la terre** des circuits qui en manquent ;
- le remplacement des prises et des douilles abîmées.

Je vous présente ces travaux par ordre de priorité, sur devis gratuit.

[[cta]]

## Dépannage à Fumay

Pour une panne, je vous annonce le prix du forfait au téléphone et je viens au créneau convenu. Si vous êtes dans la vallée, je peux souvent regrouper mon passage avec une intervention à Revin ou à Givet.`,
    cases: [
      { tag: 'Maison ancienne', icon: 'house', title: 'Trois étages, trois installations', text: "Une maison de ville où chaque étage avait été refait à une époque différente.", result: 'Plan des circuits établi, tableau unique repéré, priorités de mise en sécurité chiffrées.' },
      { tag: 'Prises', icon: 'plug', title: 'Des prises qui chauffent dans la chambre', text: "Une prise noircie derrière un lit, alimentant un radiateur d'appoint.", result: 'Prise et conducteurs remplacés, conseil de ne plus brancher de chauffage sur ce circuit.' },
      { tag: 'Éclairage', icon: 'lamp-ceiling', title: 'Une cage d’escalier enfin éclairée', text: "Un seul plafonnier pour trois niveaux, commandé depuis le rez-de-chaussée.", result: 'Va-et-vient à chaque palier et éclairage LED, posés en apparent sous moulure.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Fumay ?', a: "Le forfait dépannage à Fumay est sur devis, annoncé au téléphone avant que je vienne, avec la recherche de panne et le devis de réparation." },
      { q: 'Faut-il refaire toute l’électricité d’une vieille maison ?', a: "Pas forcément. Un tableau neuf, la terre et le remplacement des éléments abîmés suffisent souvent à sécuriser l'essentiel." },
      { q: 'Peut-on éviter les saignées dans les murs anciens ?', a: "Oui, la pose en apparent sous moulure est propre, rapide et adaptée aux murs en pierre ou en schiste." },
    ],
    cta: { title: 'Une maison ancienne à Fumay ?', text: 'Je fais le point sur votre installation et je vous propose les travaux prioritaires, sur devis gratuit.' },
    links: ['/electricien-maison-ancienne/', '/mise-a-la-terre/', '/prise-qui-chauffe/', '/remplacement-tableau-a-fusibles/', '/interrupteur-qui-ne-fonctionne-plus/'],
    nearby: ['/electricien-revin/', '/electricien-givet/', '/electricien-montherme/', '/electricien-rocroi/'],
  },

  // ------------------------------------------------------------------ BOGNY-SUR-MEUSE
  {
    slug: 'electricien-bogny-sur-meuse', group: 'villes', city: 'Bogny-sur-Meuse', prestation: 'depannage',
    label: 'Électricien à Bogny-sur-Meuse',
    teaser: 'Maisons ouvrières de la vallée : tableaux anciens, garages, dépannages.',
    title: 'Électricien à Bogny-sur-Meuse | ALED08',
    description: "Électricien à Bogny-sur-Meuse : dépannage électrique, maisons ouvrières à sécuriser, garages et ateliers, tableaux anciens. Prix annoncé avant de venir.",
    kicker: 'Électricien · Bogny-sur-Meuse (08120)',
    h1: 'Électricien à Bogny-sur-Meuse, au pied des Quatre Fils Aymon',
    lead: "Ville de tradition industrielle étirée le long de la Meuse, **Bogny-sur-Meuse** compte de nombreuses **maisons ouvrières**, souvent avec garage ou petit atelier. J'y interviens pour les pannes, les tableaux à remplacer et les lignes à créer pour l'atelier ou le garage.",
    body: `## Les maisons ouvrières, solides mais souvent sous-équipées

Ces maisons ont été bâties à une époque où un logement comptait quelques points lumineux et deux ou trois prises par pièce. Aujourd'hui, avec l'électroménager, les écrans et le chauffage d'appoint, les circuits sont **surchargés** et les multiprises s'accumulent. La solution passe par des **circuits supplémentaires**, plutôt que par un disjoncteur plus gros.

## Garage et atelier : une vraie ligne

Perceuse à colonne, poste à souder, compresseur : un atelier a besoin d'une **ligne dédiée**, protégée par son propre disjoncteur et un différentiel. Brancher ces machines sur une rallonge depuis la maison, c'est la garantie de coupures, et parfois de câbles qui chauffent.

[[cta]]

## Un dépannage dans la vallée

Quand le courant saute, je vous aide d'abord au téléphone à identifier le circuit en cause, puis je vous annonce le prix du forfait et je viens à l'heure convenue. Sur place, je trouve l'origine de la panne et je vous remets un devis de réparation, sans obligation.`,
    cases: [
      { tag: 'Atelier', icon: 'hammer', title: 'Le poste à souder fait tout couper', text: "Le poste à souder du garage, branché sur une rallonge, fait sauter le disjoncteur de la maison.", result: 'Ligne dédiée tirée jusqu’au garage avec un petit tableau et ses protections.' },
      { tag: 'Surcharge', icon: 'plug-zap', title: 'Des multiprises en cascade', text: "Dans le séjour, trois multiprises branchées les unes sur les autres alimentaient tout l'audiovisuel.", result: 'Ajout de prises sur un nouveau circuit, multiprises supprimées.' },
      { tag: 'Tableau', icon: 'shield-check', title: 'Un vieux tableau sans 30 mA', text: "Un coffret des années 60 avec des fusibles à broche et aucune protection des personnes.", result: 'Remplacement complet du tableau sur devis, en une journée.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Bogny-sur-Meuse ?', a: "À Bogny-sur-Meuse, le forfait dépannage est sur devis : je vous en donne le montant au téléphone avant de venir, recherche de panne et devis de réparation compris." },
      { q: 'Pouvez-vous installer une prise pour un poste à souder ?', a: "Oui : une prise adaptée sur une ligne dédiée, avec le bon calibre de câble et de protection, sur devis gratuit." },
      { q: 'Intervenez-vous à Deville et Château-Regnault ?', a: "Oui, ainsi qu'à Monthermé, Laifour et dans toute la vallée entre Nouzonville et Revin." },
    ],
    cta: { title: 'Un souci électrique à Bogny-sur-Meuse ?', text: 'Écrivez-moi : prix annoncé avant de venir, devis de réparation sans obligation.' },
    links: ['/ligne-electrique-garage-atelier/', '/ajout-circuit-electrique/', '/disjoncteur-qui-saute/', '/remplacement-tableau-a-fusibles/', '/prise-specialisee/'],
    nearby: ['/electricien-nouzonville/', '/electricien-montherme/', '/electricien-revin/', '/electricien-charleville-mezieres/'],
  },

  // ------------------------------------------------------------------ MONTHERMÉ
  {
    slug: 'electricien-montherme', group: 'villes', city: 'Monthermé', prestation: 'depannage',
    label: 'Électricien à Monthermé',
    teaser: 'Meuse et Semoy : gîtes, résidences secondaires, maisons en pierre.',
    title: 'Électricien à Monthermé | ALED08',
    description: "Électricien à Monthermé, entre Meuse et Semoy : gîtes et résidences secondaires, remise en service, dépannage, éclairage extérieur. Prix annoncé avant.",
    kicker: 'Électricien · Monthermé (08800)',
    h1: 'Électricien à Monthermé, entre Meuse et Semoy',
    lead: "Au confluent de la Meuse et de la Semoy, **Monthermé** attire randonneurs et vacanciers. Beaucoup de maisons y sont des **gîtes** ou des **résidences secondaires**, avec des besoins bien à elles : remise en service après l'hiver, sécurité des locataires, éclairage extérieur.",
    body: `## Remettre une maison en service après l'hiver

Une maison fermée plusieurs mois souffre de l'humidité. À la remise sous tension, il n'est pas rare que le **différentiel saute** aussitôt. Plutôt que de forcer, je contrôle l'isolement des circuits un par un, je trouve celui qui pose problème et je le remets en état avant votre arrivée ou celle de vos locataires.

## Gîtes et locations : la sécurité avant tout

Accueillir du public engage votre responsabilité. Je vérifie les points essentiels : **différentiels 30 mA**, terre, prises de salle de bain, éclairage des extérieurs et des escaliers. Je vous remets un devis clair pour corriger ce qui doit l'être avant la saison.

[[cta]]

## Éclairer les abords

Allées en pente, escaliers en pierre, terrasses au bord de l'eau : un éclairage bien pensé évite les chutes et valorise la maison. Je pose des **luminaires étanches à détection**, adaptés à l'humidité de la vallée.`,
    cases: [
      { tag: 'Gîte', icon: 'key-round', title: 'Un gîte qui disjoncte à la réouverture', text: "Au printemps, impossible de remettre le courant dans un gîte resté fermé tout l'hiver.", result: 'Circuit de la buanderie en défaut d’isolement, remis en état avant l’arrivée des premiers vacanciers.' },
      { tag: 'Extérieur', icon: 'lamp-wall-up', title: 'Un escalier en pierre sans lumière', text: "Les locataires descendaient vers la rivière à la lampe de téléphone.", result: 'Trois appliques étanches à détection installées le long de l’escalier.' },
      { tag: 'Salle de bain', icon: 'droplets', title: 'Une prise trop près de la douche', text: "Une prise ordinaire posée à moins de 60 cm de la douche, dans une chambre d'hôtes.", result: 'Prise déplacée hors des volumes interdits et circuit protégé par un 30 mA.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Monthermé ?', a: "Pour Monthermé, je vous annonce au téléphone le prix du forfait dépannage avant de me déplacer, avec la recherche de panne et le devis de réparation." },
      { q: 'Pouvez-vous intervenir en mon absence dans ma résidence secondaire ?', a: "Oui, si une personne de confiance peut m'ouvrir ou si une boîte à clé est prévue. Je vous envoie ensuite le compte rendu et les photos." },
      { q: 'Faut-il couper le courant quand on ferme la maison pour l’hiver ?', a: "On peut couper les circuits inutiles, mais garder ceux du chauffage hors-gel et de la pompe éventuelle. Je peux vous aider à les repérer." },
    ],
    cta: { title: 'Un gîte ou une maison de vacances à Monthermé ?', text: 'Je fais le point avant la saison et je remets en état ce qui doit l’être. Prix annoncé avant.' },
    links: ['/differentiel-qui-saute/', '/electricite-salle-de-bain/', '/eclairage-exterieur-detecteur/', '/electricien-proprietaire-bailleur/', '/disjoncte-quand-il-pleut/'],
    nearby: ['/electricien-bogny-sur-meuse/', '/electricien-revin/', '/electricien-nouzonville/', '/electricien-renwez/'],
  },

  // ------------------------------------------------------------------ CARIGNAN
  {
    slug: 'electricien-carignan', group: 'villes', city: 'Carignan', prestation: 'depannage',
    label: 'Électricien à Carignan',
    teaser: 'Vallée de la Chiers : maisons de bourg, fermes, dépannage et tableaux.',
    title: 'Électricien à Carignan | ALED08',
    description: "Électricien à Carignan, vallée de la Chiers : dépannage électrique, tableaux, mise en sécurité de maisons anciennes et de fermes. Prix annoncé avant de venir.",
    kicker: 'Électricien · Carignan (08110)',
    h1: 'Électricien à Carignan, dans la vallée de la Chiers',
    lead: "À l'est de Sedan, **Carignan** et les villages de la vallée de la Chiers mêlent maisons de bourg, fermes et pavillons. J'y interviens pour les **dépannages**, les **tableaux électriques** et la **mise en sécurité** des maisons anciennes, sur rendez-vous.",
    body: `## Fermes et maisons de bourg

Beaucoup de maisons du secteur ont été agrandies ou transformées : une grange devenue garage, un grenier aménagé, une extension pour la cuisine. Chaque étape a ajouté des circuits, pas toujours bien protégés. Je contrôle l'ensemble et je vous dis clairement **ce qui est urgent** et ce qui peut attendre.

## Les orages de la vallée

La vallée de la Chiers n'est pas épargnée par les orages. Une surtension peut griller une box, un portail motorisé ou une carte de chaudière. Après un orage, je contrôle les protections du tableau et je vous propose, si c'est utile, un **parafoudre** adapté à votre installation.

[[cta]]

## Un dépannage dans le secteur de Carignan

Vous m'écrivez, vous me décrivez la panne, et je vous annonce le prix du forfait avant de venir. Je regroupe volontiers mes passages avec Mouzon et Sedan pour vous proposer un créneau rapide.`,
    cases: [
      { tag: 'Orage', icon: 'cloud-lightning', title: 'Portail et box grillés', text: "Après un orage, le portail motorisé et la box internet ne redémarrent plus.", result: 'Circuits contrôlés, protections remplacées, parafoudre installé sur devis.' },
      { tag: 'Extension', icon: 'house-plug', title: 'Une extension raccordée en direct', text: "La nouvelle cuisine avait été branchée sur un circuit existant, sans protection propre.", result: 'Circuits de la cuisine repris depuis le tableau, chacun avec sa protection.' },
      { tag: 'Ferme', icon: 'cable', title: 'Un câble aérien vers le hangar', text: "Le hangar était alimenté par un câble tendu entre deux bâtiments, abîmé par le vent.", result: 'Liaison remplacée par un câble adapté, protégé par un différentiel dédié.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Carignan ?', a: "Le forfait dépannage à Carignan vous est annoncé au téléphone avant mon déplacement, recherche de panne et devis de réparation compris." },
      { q: 'Un parafoudre est-il utile dans la vallée de la Chiers ?', a: "Dans les secteurs exposés aux orages, il protège les appareils sensibles. Je vous dis si votre installation s'y prête." },
      { q: 'Intervenez-vous à Blagny, Margut ou Linay ?', a: "Oui, dans toute la vallée de la Chiers et jusqu'à la frontière belge." },
    ],
    cta: { title: 'Une panne à Carignan ?', text: 'Écrivez-moi : prix annoncé avant, créneau organisé avec vous.' },
    links: ['/panne-electrique-apres-orage/', '/installation-parafoudre/', '/ajout-circuit-electrique/', '/ligne-electrique-garage-atelier/', '/electricien-maison-ancienne/'],
    nearby: ['/electricien-mouzon/', '/electricien-sedan/', '/electricien-bazeilles/', '/depannage-electrique-sedan/'],
  },

  // ------------------------------------------------------------------ MOUZON
  {
    slug: 'electricien-mouzon', group: 'villes', city: 'Mouzon', prestation: 'depannage',
    label: 'Électricien à Mouzon',
    teaser: 'Cité de l’abbatiale : maisons anciennes, éclairage, mise en sécurité.',
    title: 'Électricien à Mouzon | ALED08',
    description: "Électricien à Mouzon : dépannage électrique, maisons anciennes du centre, éclairage intérieur et extérieur, mise en sécurité. Prix annoncé avant de venir.",
    kicker: 'Électricien · Mouzon (08210)',
    h1: 'Électricien à Mouzon, au bord de la Meuse',
    lead: "Petite cité au patrimoine remarquable, dominée par son abbatiale, **Mouzon** possède un centre ancien aux maisons de caractère. J'y interviens pour **sécuriser ces installations** sans dénaturer les intérieurs, et pour les dépannages du quotidien.",
    body: `## Rénover sans abîmer

Dans une maison ancienne, chaque saignée dans un mur en pierre ou un plafond à la française se réfléchit. Selon les pièces, je propose de **passer les câbles dans les planchers**, de longer les plinthes ou de poser des **moulures discrètes**. L'objectif : une installation sûre, qui respecte le caractère de la maison.

## Éclairer les pièces à vivre

Les maisons du centre sont souvent sombres. Des **spots LED encastrés** là où le plafond le permet, des appliques murales ou des rubans lumineux sur des étagères changent l'ambiance d'une pièce, avec une consommation très faible.

[[cta]]

## Dépannage à Mouzon

Pour une panne, je vous annonce le prix du forfait au téléphone, je viens au créneau fixé ensemble et je vous remets un devis de réparation sans obligation. Si la maison est humide en bord de Meuse, je contrôle aussi l'isolement des circuits les plus exposés.`,
    cases: [
      { tag: 'Patrimoine', icon: 'house', title: 'Une maison de caractère à sécuriser', text: "Des fils sous tubes d'origine et des prises sans terre dans une maison du centre.", result: 'Nouveaux circuits passés sous les planchers, terre créée, aucune saignée dans les murs en pierre.' },
      { tag: 'Éclairage', icon: 'lightbulb', title: 'Un séjour trop sombre', text: "Un unique lustre central pour une grande pièce aux murs épais.", result: 'Appliques murales et spots LED dimmables, commandés par deux interrupteurs.' },
      { tag: 'Humidité', icon: 'droplets', title: 'La cave fait sauter le courant', text: "Le différentiel déclenche plusieurs fois par mois, sans raison apparente.", result: 'Luminaire de cave non étanche remplacé, isolement des circuits contrôlé.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Mouzon ?', a: "À Mouzon, le prix du forfait dépannage est annoncé au téléphone avant que je vienne, avec la recherche de panne et le devis de réparation." },
      { q: 'Peut-on refaire l’électricité sans saignées ?', a: "Souvent, oui : passage sous plancher, le long des plinthes ou sous moulure. Je vous propose la solution la plus discrète pour chaque pièce." },
      { q: 'Intervenez-vous à Douzy et Pouru-Saint-Remy ?', a: "Oui, dans tout le secteur entre Sedan, Mouzon et Carignan." },
    ],
    cta: { title: 'Une maison ancienne à Mouzon ?', text: 'Je vous propose une mise en sécurité respectueuse du bâti, sur devis gratuit.' },
    links: ['/electricien-maison-ancienne/', '/installation-spots-led/', '/remplacement-eclairage-led/', '/mise-a-la-terre/', '/disjoncte-quand-il-pleut/'],
    nearby: ['/electricien-carignan/', '/electricien-sedan/', '/electricien-bazeilles/', '/depannage-electrique-sedan/'],
  },

  // ------------------------------------------------------------------ BAZEILLES
  {
    slug: 'electricien-bazeilles', group: 'villes', city: 'Bazeilles', prestation: 'depannage',
    label: 'Électricien à Bazeilles',
    teaser: 'Porte de Sedan : pavillons, garages, recharge de voiture, dépannage.',
    title: 'Électricien à Bazeilles | ALED08',
    description: "Électricien à Bazeilles, près de Sedan : dépannage électrique, pavillons, prise de recharge pour voiture, éclairage extérieur. Prix annoncé avant de venir.",
    kicker: 'Électricien · Bazeilles (08140)',
    h1: 'Électricien à Bazeilles, aux portes de Sedan',
    lead: "Commune résidentielle voisine de Sedan, **Bazeilles** compte beaucoup de **pavillons avec garage et jardin**. Les demandes y suivent l'évolution des maisons : voiture électrique à recharger, éclairage du jardin, tableau à compléter, sans oublier les dépannages.",
    body: `## Recharger sa voiture électrique à la maison

Pour une voiture qui roule quelques dizaines de kilomètres par jour, une **prise renforcée** sur un circuit dédié suffit souvent : elle recharge la batterie pendant la nuit, en toute sécurité. Je vérifie d'abord que votre tableau et votre abonnement le permettent. Pour une borne plus puissante, je vous oriente vers un installateur qualifié IRVE.

## Le jardin et la terrasse

Prises extérieures étanches pour la tondeuse ou la plancha, éclairage à détection pour l'allée, spots pour la terrasse : je pose des équipements **adaptés à l'extérieur**, protégés par un différentiel 30 mA.

[[cta]]

## Un dépannage près de Sedan

Bazeilles est à quelques minutes de Sedan : je peux souvent regrouper un dépannage avec une intervention dans l'agglomération. Je vous donne le prix du forfait par message ou au téléphone, avant de me déplacer.`,
    cases: [
      { tag: 'Recharge', icon: 'car-front', title: 'Une voiture électrique branchée sur une rallonge', text: "La voiture était rechargée sur une rallonge depuis la cuisine, qui chauffait.", result: 'Prise renforcée sur un circuit dédié dans le garage, rallonge supprimée.' },
      { tag: 'Jardin', icon: 'lamp-wall-up', title: 'Une allée plongée dans le noir', text: "Le chemin du portail à la porte d'entrée n'était pas éclairé.", result: 'Bornes lumineuses à détection et prise extérieure étanche posées le long de l’allée.' },
      { tag: 'Tableau', icon: 'panel-top', title: 'Plus de place dans le tableau', text: "Impossible d'ajouter la ligne de la pompe à chaleur dans un coffret plein.", result: 'Rangée supplémentaire ajoutée, nouvelle ligne protégée et repérée.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage à Bazeilles ?', a: "Le prix du forfait dépannage à Bazeilles vous est donné au téléphone avant mon déplacement, recherche de panne et devis de réparation inclus." },
      { q: 'Installez-vous des bornes de recharge ?', a: "J'installe des prises renforcées pour la recharge lente. Au-delà de 3,7 kW, une borne doit être posée par un installateur qualifié IRVE." },
      { q: 'Intervenez-vous à Balan et Daigny ?', a: "Oui, ainsi que dans toute l'agglomération de Sedan." },
    ],
    cta: { title: 'Un projet ou une panne à Bazeilles ?', text: 'Écrivez-moi : prix annoncé avant de venir, devis gratuit pour les travaux.' },
    links: ['/prise-renforcee-voiture-electrique/', '/prise-exterieure/', '/eclairage-exterieur-detecteur/', '/ajout-circuit-electrique/', '/depannage-electrique-sedan/'],
    nearby: ['/electricien-sedan/', '/electricien-mouzon/', '/electricien-carignan/', '/depannage-electrique-sedan/'],
  },

  // ------------------------------------------------------------------ LE CHESNE
  {
    slug: 'electricien-le-chesne', group: 'villes', city: 'Le Chesne', prestation: 'depannage',
    label: 'Électricien au Chesne',
    teaser: 'Canal des Ardennes et lac de Bairon : maisons rurales, gîtes, dépannage.',
    title: 'Électricien au Chesne | ALED08',
    description: "Électricien au Chesne et autour du lac de Bairon : dépannage électrique, maisons rurales, gîtes, éclairage et mise en sécurité. Prix annoncé avant de venir.",
    kicker: 'Électricien · Le Chesne (08390)',
    h1: 'Électricien au Chesne, entre canal et lac de Bairon',
    lead: "Bourg traversé par le **canal des Ardennes**, à deux pas du **lac de Bairon**, Le Chesne est entouré de villages agricoles et de maisons de vacances. J'y interviens pour les pannes, la mise en sécurité des maisons rurales et l'équipement des gîtes.",
    body: `## Maisons rurales : de longues lignes et des dépendances

À la campagne, une maison est souvent accompagnée d'une grange, d'un hangar ou d'un ancien atelier. Ces bâtiments sont reliés par des lignes parfois anciennes, enterrées ou aériennes. Quand le différentiel saute sans raison apparente, je pense d'abord à elles et je **mesure leur isolement**.

## Autour du lac de Bairon

Les maisons de vacances et les gîtes du secteur ont besoin d'une installation fiable, qui supporte les périodes de fermeture et l'humidité. Je contrôle les circuits avant la saison et je mets en sécurité ce qui doit l'être : différentiels, prises extérieures, éclairage des abords.

[[cta]]

## Dépannage au Chesne

Vous m'écrivez, je vous annonce le prix du forfait dépannage et nous fixons un créneau. Je viens avec mes appareils de mesure, je trouve l'origine de la panne et je vous remets un devis de réparation, sans obligation.`,
    cases: [
      { tag: 'Dépendance', icon: 'cable', title: 'Le hangar fait sauter le courant', text: "Une ligne enterrée vers le hangar provoquait des coupures après chaque période de pluie.", result: 'Défaut localisé sur la ligne, câble remplacé dans une gaine adaptée.' },
      { tag: 'Gîte', icon: 'key-round', title: 'Préparer la saison', text: "Un propriétaire voulait s'assurer de la sécurité de son gîte avant l'été.", result: 'Contrôle complet, deux prises remplacées, éclairage extérieur à détection ajouté.' },
      { tag: 'Panne', icon: 'zap-off', title: 'Plus de courant dans la cuisine', text: "Le circuit de la cuisine ne revient plus après une coupure générale.", result: 'Disjoncteur défectueux remplacé, circuit contrôlé et remis en service.' },
    ],
    faq: [
      { q: 'Quel est le prix d’un dépannage au Chesne ?', a: "Au Chesne, je vous annonce le prix du forfait dépannage au téléphone avant de venir, recherche de panne et devis de réparation compris." },
      { q: 'Intervenez-vous autour du lac de Bairon ?', a: "Oui : Bairon et ses environs, Tannay, Sauville, Louvergny et les villages voisins." },
      { q: 'Ma ligne vers la grange est très ancienne, faut-il la refaire ?', a: "Pas forcément. Une mesure d'isolement permet de savoir si elle est encore saine ou s'il vaut mieux la remplacer." },
    ],
    cta: { title: 'Une panne au Chesne ?', text: 'Écrivez-moi : je vous annonce le prix et un créneau qui vous arrange.' },
    links: ['/ligne-electrique-garage-atelier/', '/differentiel-qui-saute/', '/eclairage-exterieur-detecteur/', '/electricien-proprietaire-bailleur/', '/coupure-courant-maison-entiere/'],
    nearby: ['/electricien-vouziers/', '/electricien-attigny/', '/electricien-poix-terron/', '/electricien-sedan/'],
  },
];
