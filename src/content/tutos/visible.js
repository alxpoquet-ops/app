// Mini Tuto, thème « visible » : voir le format dans ./index.js (tutos complets découpés en pages, « Minis Tutos, Minis Prix »).
// Faits vérifiés le 24 novembre 2026 :
//  - Google, « Comment fonctionne la recherche » et règles anti-spam (pages satellites, bourrage de mots-clés, liens achetés).
//  - Aide Google Business Profile : classement local selon la pertinence, la distance et la notoriété ; lien et QR code
//    « Recevoir plus d'avis » ; consignes de représentation (pas de mots-clés ajoutés au nom, pas d'adresse fictive ni de bureau virtuel).
//  - Règlement des contenus Google Maps : avis incités, sollicitation sélective, conflit d'intérêts interdits ; avis modifié contre un avantage.
//  - Code de la consommation, art. L121-4 : diffuser ou faire diffuser de faux avis est une pratique commerciale trompeuse.
//  - Bing Places for Business : gratuit, import d'une fiche Google. Apple Business : remplace Apple Business Connect (avril 2026).
module.exports = [
  // ------------------------------------------------------------------ 1. Les bases pour apparaître sur Google (offert)
  {
    slug: 'apparaitre-sur-google-les-bases',
    groupe: 'visible',
    icon: 'search',
    monstre: 'gelee',
    gratuit: true,
    nom: 'Apparaître sur Google : les bases',
    resume: 'Comment Google choisit, les mots de vos clients, une page bien construite et l’outil gratuit pour mesurer.',
    duree: 45,
    niveau: 'Débutant',
    h1: 'Apparaître sur Google : les bases, pas à pas',
    title: 'Apparaître sur Google : les bases | Les Minis Monstres',
    description: 'Comment Google choisit les sites qu’il montre, trouver les mots de vos clients, écrire une page claire et suivre vos progrès avec Search Console.',
    lead: 'Google ne tire pas au sort les sites qu’il affiche : il cherche la réponse la plus utile à chaque recherche. Ce tuto vous montre comment devenir cette réponse, avec des gestes simples et gratuits.',
    pages: [
      {
        titre: 'Comment Google choisit qui il montre',
        body: `## Ce qui s’achète, et ce qui se gagne

En haut des résultats, certaines lignes portent la mention « Sponsorisé » : ce sont des annonces payées. Juste en dessous viennent les **résultats naturels**. Ceux-là ne s’achètent pas. Google les classe lui-même, page par page, pour chaque recherche.

C’est une bonne nouvelle pour un petit commerce : sur ces résultats, un artisan de village peut passer devant une grande enseigne, s’il répond mieux à la question posée.

## Les trois questions que Google se pose

Google explique publiquement les grandes lignes de son fonctionnement. On peut les résumer en trois questions.

1. **Cette page répond-elle à la recherche ?** Google lit les mots de la page, ses titres, et les compare à ce que la personne a tapé. Une page qui parle clairement de « réparation de volets roulants » a sa chance sur ces mots. Une page d’accueil qui dit seulement « Bienvenue » n’en a aucune.
2. **Peut-on lui faire confiance ?** Google regarde si d’autres sites parlent de vous et renvoient vers vous, si vos informations sont cohérentes d’un site à l’autre et, pour un commerce, ce que racontent vos avis.
3. **Est-elle agréable à utiliser ?** Une page qui s’affiche vite, se lit bien sur un téléphone et ne cache pas son texte derrière des fenêtres qui surgissent part avec un avantage.

Google ajoute enfin le **contexte** : la langue de la personne, et souvent l’endroit où elle se trouve. C’est pour cela que deux personnes dans deux villes ne voient pas les mêmes résultats.

## Un exemple

Prenons un exemple inventé. Karim est serrurier. Son site tient en une page : son logo et la phrase « Serrurerie Karim, à votre service ». Quand quelqu’un tape « porte claquée que faire », Google ne trouve chez lui aucun texte qui réponde à cette question.

Karim ajoute une page qui explique quoi faire face à une porte claquée, avec ses horaires d’intervention et les communes où il se déplace. Cette fois, Google a une vraie raison de le montrer à la personne bloquée devant sa porte.

## Ce qu’il faut retenir

Il n’existe pas de bouton secret. Votre travail tient en trois mots : **répondre**, **rassurer**, **faciliter**. Les pages suivantes vous montrent comment, en commençant par le plus important : connaître les mots exacts de vos clients.

> Pour les recherches avec un lieu, comme « plombier » ou « boulangerie ouverte », Google affiche aussi une carte. Elle suit ses propres règles, que le tuto sur les recherches près de chez soi détaille.`,
      },
      {
        titre: 'Trouver les mots de vos clients, gratuitement',
        body: `## Un mot-clé, c’est quoi ?

Un **mot-clé**, c’est ce qu’une personne tape dans Google : un mot, ou plus souvent une petite phrase comme « fleuriste ouvert dimanche ». Si ces mots figurent sur votre site, Google comprend que vous pouvez répondre.

Le piège, c’est le jargon. Vous dites « pose de carrelage », votre client tape « refaire sa salle de bain ». Vous dites « toilettage canin », lui cherche « tonte chien ». Il faut partir de ses mots, pas des vôtres.

## Quatre sources gratuites

1. **Les suggestions de Google.** Tapez un de vos services dans la barre de recherche, lentement, sans valider. Google propose des fins de phrase : ce sont des recherches que d’autres font vraiment. Notez celles qui vous concernent.
2. **« Autres questions posées ».** Dans la page de résultats, cet encadré liste les questions que les gens se posent sur le sujet. Chacune peut devenir un paragraphe, voire une page entière.
3. **« Recherches associées ».** Tout en bas de la page de résultats, Google montre d’autres façons de dire la même chose.
4. **Vos clients.** Les questions qu’on vous pose au téléphone ou au comptoir sont souvent celles qu’on tape le soir dans Google. Notez-les pendant une semaine, telles quelles.

Une cinquième source arrive dès que votre site est en ligne : Google Search Console, qui montre les recherches ayant déjà affiché votre site. Elle a sa page à la fin de ce tuto.

## Bien choisir dans la liste

Toutes les recherches ne se valent pas. Préférez :

- **les recherches précises** : « taille de haie » plutôt que « jardin » ;
- **les recherches avec une intention** : « prix », « devis », « ouvert », « près de » signalent quelqu’un de prêt à agir ;
- **les recherches avec un lieu**, si vous travaillez près de chez vous.

Un mot trop large comme « chien » ou « coiffure » est tapé par des foules qui ne cherchent pas un professionnel. Une recherche longue et précise attire moins de monde, mais des gens prêts à vous appeler.

## Un exemple

Prenons un exemple inventé. Sophie est toiletteuse pour chiens. En tapant « toilettage chien » dans Google, elle voit les suggestions « tonte », « prix » ou « à domicile ». Dans « Autres questions posées », une question revient : à quelle fréquence faut-il toiletter son chien ? Sophie tient là le sujet d’une page entière, et les mots exacts à employer.

## Votre liste de travail

Faites un tableau tout simple, sur papier ou dans votre téléphone, avec trois colonnes : la recherche, la page de votre site qui y répond, et « à faire » si cette page n’existe pas encore. Cette liste sera votre feuille de route pour toutes les pages suivantes.`,
      },
      {
        titre: 'Une page, une question',
        body: `## La règle d’or

Une page qui parle de tout ne répond à rien. Une page qui répond à **une seule question**, celle d’un client, a toutes ses chances. « Combien coûte un ramonage ? », « Que faire en cas de fuite sous l’évier ? », « Taille de haie : à quelle saison ? » : chacune mérite sa page.

C’est aussi plus simple pour vous. Au lieu d’écrire un grand texte qui couvre tout votre métier, vous écrivez une réponse courte et claire, puis une autre, puis une autre.

## Les pages que tout site devrait avoir

Avant les questions, il y a les pages de base. Vérifiez que votre site les a :

- **Une page d’accueil** qui dit ce que vous faites et où, dès le premier coup d’œil.
- **Une page par service principal.** Un électricien qui fait du dépannage, de la mise aux normes et des bornes de recharge a trois pages, pas une seule page « Nos services » avec trois lignes.
- **Une page contact** avec votre adresse ou votre zone, vos horaires, votre téléphone.
- **Une page à propos**, courte, qui montre qui vous êtes.

Puis viennent les pages qui répondent aux questions trouvées dans votre liste de mots-clés.

## Comment choisir la question d’une page

Prenez votre liste et posez-vous trois questions pour chaque ligne :

1. **Est-ce que je sais vraiment y répondre ?** Une page sur un sujet que vous maîtrisez mal se sentira à la lecture.
2. **Est-ce que la réponse mène à mon métier ?** « Comment déboucher un évier » peut amener un client vers un plombier, à condition que la page dise aussi quand appeler un professionnel.
3. **Est-ce qu’une autre page de mon site y répond déjà ?** Si oui, améliorez-la plutôt que d’en créer une deuxième. Deux pages sur la même question se font concurrence.

## Un exemple

Prenons un exemple inventé. Julien est paysagiste. Sa liste contient « taille de haie », « prix entretien jardin », « quand tailler une haie » et « évacuation des déchets verts ».

Il remarque que la première, la troisième et la quatrième parlent du même chantier. Il en fait **une seule page**, centrée sur la question « Taille de haie : quand la faire et comment ça se passe ». La deuxième recherche, sur les prix de l’entretien, aura sa propre page, plus tard. Une question, une page.

## L’erreur à éviter

Les pages jumelles. Copier la même page dix fois en changeant seulement le nom de la ville ou du service, c’est ce que Google appelle des **pages satellites**. Ses règles les rangent parmi les pratiques trompeuses, et elles peuvent faire reculer tout le site. Chaque page doit avoir ses propres phrases et quelque chose de vrai à dire.`,
      },
      {
        titre: 'Écrire la page, étape par étape',
        body: `Vous avez votre question. Voici comment construire la page, de haut en bas.

## 1. Le titre qui s’affiche dans Google

Chaque page a un **titre de page** : c’est la ligne bleue qui apparaît dans les résultats de Google. Il reprend la question avec les mots du client, en une soixantaine de caractères au plus, et finit souvent par votre nom.

> Exemple : « Taille de haie près de Rethel : quand et comment | Jardins Julien »

## 2. Le grand titre en haut de la page

C’est le premier texte que lit le visiteur. Il dit la même chose que le titre de page, en un peu plus naturel. Une seule fois par page.

## 3. La réponse, tout de suite

Les deux ou trois premières phrases répondent à la question, sans détour. Le lecteur sur son téléphone veut savoir s’il est au bon endroit. Les détails viendront ensuite.

> Exemple : « On taille une haie en fin d’hiver, puis à la fin de l’été. On évite le printemps et le début de l’été, quand les oiseaux font leur nid. »

## 4. Les intertitres

Un **intertitre** est un petit titre au milieu du texte. Placez-en un tous les deux ou trois paragraphes. Sur un téléphone, on parcourt la page en lisant d’abord les intertitres, comme un sommaire. Écrivez-les comme des questions ou des étapes : « Combien de temps ça prend », « Que deviennent les branches ».

## 5. Les photos, avec leur description

Une ou deux vraies photos de votre travail. Ajoutez à chacune une courte description, le **texte alternatif** : il est lu par Google et par les personnes malvoyantes. Décrivez simplement ce qu’on voit : « Haie de thuyas taillée au carré dans un jardin ».

## 6. Les liens vers vos autres pages

Quand vous parlez d’un autre de vos services, faites un lien vers sa page. Cela aide le visiteur à continuer, et Google à comprendre comment votre site est organisé.

## 7. La fin : l’action

Votre zone, vos horaires, et un bouton pour vous appeler ou demander un devis. Celui qui a lu jusqu’au bout est intéressé : ne le laissez pas repartir sans moyen d’agir.

## Un plan à recopier

Pour une page de service, ce plan marche presque toujours :

- la réponse en trois phrases ;
- comment ça se passe, étape par étape ;
- combien de temps, et ce que le client doit prévoir ;
- les questions fréquentes, en trois ou quatre lignes chacune ;
- où vous intervenez, et comment vous joindre.

Ne répétez pas votre mot-clé à chaque phrase. Écrivez comme vous parleriez à un client : si la page répond vraiment à sa question, les bons mots y seront naturellement.`,
      },
      {
        titre: 'Ce qui fait reculer un site',
        body: `Beaucoup de « trucs » circulent pour monter sur Google. La plupart ne marchent pas, et certains font reculer. Voici ceux à fuir, et ce qu’il faut faire à la place.

## Les pratiques interdites par Google

Les règles de Google contre le spam sont publiques. Un site qui les enfreint peut reculer dans les résultats, voire en disparaître. Les plus courantes :

- **Le bourrage de mots-clés.** Répéter « plombier Reims » vingt fois dans une page, ou l’écrire en blanc sur fond blanc. Google le repère, et le lecteur fuit.
- **Les pages satellites.** Des dizaines de pages presque identiques, une par ville ou par variante, faites seulement pour attraper des recherches.
- **Les liens achetés.** Payer d’autres sites pour qu’ils renvoient vers le vôtre. Les liens qui comptent sont ceux qu’on vous donne parce que vous le méritez.
- **Le texte copié.** Reprendre les phrases d’un concurrent, ou d’un fabricant pour vos fiches produits. Votre page n’apporte alors rien de neuf.

## Les erreurs involontaires

D’autres freins n’ont rien de malhonnête, mais coûtent cher :

- **Le texte dans une image.** Une carte de restaurant ou une grille de tarifs en photo ou en PDF : Google les lit mal, et sur un téléphone il faut zoomer.
- **Les pages vides.** Une page « Services » avec une liste de cinq mots ne répond à aucune question.
- **Un site lent ou mal affiché sur téléphone.** C’est sur téléphone que la plupart de vos clients vous cherchent.
- **Des coordonnées différentes d’un endroit à l’autre.** Un ancien numéro sur le site, une autre adresse sur un annuaire : Google doute, le client aussi.
- **Des démarcheurs qui promettent la première place.** Personne ne peut la garantir, car Google ne la vend pas dans les résultats naturels.

## La patience

Une nouvelle page n’apparaît pas le lendemain. Google doit d’abord la découvrir, puis la comparer aux autres. Cela se compte plutôt en semaines qu’en jours, selon la concurrence dans votre métier. Pendant ce temps, ne changez pas tout chaque matin : laissez à vos pages le temps de faire leurs preuves.

## Ce qui marche vraiment, et dure

- Une page par service, et une page par grande question de vos clients.
- Des textes écrits par vous, avec vos mots et vos exemples.
- Vos coordonnées identiques partout.
- Une fiche Google complète, et de vrais avis.
- D’autres sites qui parlent de vous : votre fédération professionnelle, l’office de tourisme, la mairie, un article dans la presse locale, un partenaire.

> Ce dernier point est souvent oublié. Un lien depuis le site de votre commune ou de votre union des commerçants vaut bien plus qu’une centaine de liens achetés sur des sites inconnus.`,
      },
      {
        titre: 'Mesurer avec Google Search Console',
        body: `## À quoi ça sert

**Google Search Console** est un outil gratuit de Google, réservé au propriétaire du site. Il répond à trois questions : Google connaît-il mes pages ? Sur quelles recherches mon site apparaît-il ? Y a-t-il un problème à corriger ? Ce n’est pas un outil de publicité, c’est un tableau de bord.

## L’installer

1. Cherchez « Google Search Console » et connectez-vous avec votre compte Google.
2. Ajoutez votre site. Google demande de prouver qu’il est à vous. Le type « Domaine » est le plus complet : il se vérifie par une ligne ajoutée chez votre fournisseur de nom de domaine. Si c’est trop technique, demandez à la personne qui gère votre site de le faire, ou de vous ajouter comme utilisateur.
3. Envoyez le **plan du site** (en anglais, sitemap) : une liste de vos pages, prévue pour Google. Dans le menu « Sitemaps », collez son adresse, souvent celle de votre site suivie de /sitemap.xml.
4. Patientez quelques jours, le temps que les données arrivent.

## Lire le rapport « Performances »

Quatre chiffres, à lire ensemble :

- **les impressions** : combien de fois votre site a été affiché dans les résultats ;
- **les clics** : combien de fois quelqu’un a cliqué pour venir ;
- **le taux de clics** : la part des affichages qui ont donné un clic ;
- **la position moyenne** : votre place moyenne dans les résultats.

Juste en dessous, l’onglet « Requêtes » liste les recherches qui ont affiché votre site. C’est la cinquième source de mots-clés promise plus haut.

## Prenons un exemple inventé

Claire est couturière. Dans « Requêtes », elle voit que son site apparaît souvent sur « ourlet de rideau », sans presque jamais être cliqué. Sa page n’en parle qu’en une ligne. Elle lui consacre un paragraphe, avec un intertitre qui reprend ces mots. Regarder lui a montré où agir.

## Après une nouvelle page

Dans la barre du haut, l’outil « Inspection de l’URL » permet de coller l’adresse d’une page et de demander à Google de l’examiner. Utile après une création, inutile de le refaire chaque jour.

Ne regardez pas les chiffres tous les matins : ils bougent sans raison utile. Comparez un mois avec le précédent.

> Le temps manque pour écrire ? La page de visibilité Google, commandée depuis votre espace client, est écrite pour une recherche de votre secteur et intégrée à votre site.

### À faire aujourd’hui

- Tapez trois recherches qu’un client ferait pour vous trouver, et notez qui apparaît.
- Commencez votre liste de mots-clés avec les suggestions de Google et « Autres questions posées ».
- Choisissez la question la plus fréquente de vos clients et écrivez sa réponse en trois phrases.
- Ajoutez votre site à Search Console, ou demandez qu’on vous y donne accès.
- Notez dans votre agenda : « lire Search Console » dans un mois.`,
      },
    ],
    faq: [
      { q: 'Peut-on payer Google pour être premier ?', a: 'On peut payer des annonces, signalées par la mention « Sponsorisé ». Les résultats naturels, juste en dessous, ne se paient pas : ils se gagnent avec des pages utiles.' },
      { q: 'Faut-il un blog pour être visible ?', a: 'Non. Une page par service et une page par grande question de vos clients valent mieux qu’un blog abandonné après trois articles.' },
      { q: 'Les outils payants de mots-clés sont-ils indispensables ?', a: 'Pas pour un commerce ou un artisan qui débute. Les suggestions de Google, les questions de vos clients et Search Console suffisent largement pour trouver vos premiers sujets.' },
    ],
    voir: ['etre-trouve-pres-de-chez-soi', 'textes-et-photos-qui-donnent-envie', 'fiche-google-entreprise'],
  },

  // ------------------------------------------------------------------ 2. Être trouvé près de chez soi
  {
    slug: 'etre-trouve-pres-de-chez-soi',
    groupe: 'visible',
    icon: 'map-pin',
    monstre: 'gelee',
    nom: 'Être trouvé près de chez soi',
    resume: 'La carte de Google, votre fiche, votre site, Apple Plans et Bing : apparaître quand on cherche dans votre coin.',
    duree: 50,
    niveau: 'Débutant',
    h1: 'Être trouvé près de chez soi : la carte, la fiche, le site et le reste',
    title: 'Être trouvé près de chez soi sur internet | Les Minis Monstres',
    description: 'Apparaître sur la carte de Google, relier votre site à votre fiche, exister sur Apple Plans et Bing, éviter les pièges : le référencement local pas à pas.',
    lead: '« Électricien près de chez moi », « pizzeria à côté » : ces recherches viennent de gens prêts à appeler ou à passer la porte. Ce tuto vous montre comment faire partie de ceux qu’on leur propose.',
    pages: [
      {
        titre: 'Comment fonctionne la carte de Google',
        body: `## Le référencement local, c’est quoi ?

On appelle **référencement local** tout ce qui vous rend visible sur les recherches liées à un lieu. Quand quelqu’un tape « boulangerie », « garagiste ouvert samedi » ou « fleuriste à Sedan », Google affiche souvent une carte avec quelques établissements, avant les sites. Être dans cette liste, c’est souvent ce qui rapporte le plus à un commerce ou à un artisan.

Pourquoi ? Parce que la personne qui fait ce genre de recherche ne flâne pas. Elle a un besoin, souvent pour aujourd’hui, et elle choisit parmi ce qu’elle voit sur son écran.

## Les trois critères officiels

L’aide de Google le dit clairement : le classement local repose surtout sur trois critères.

1. **La pertinence.** Votre fiche et votre site correspondent-ils à ce qui est cherché ? Google lit votre catégorie, vos services, votre description et le contenu de votre site.
2. **La distance.** À quelle distance êtes-vous de la personne, ou du lieu qu’elle a tapé ?
3. **La notoriété.** Êtes-vous connu et reconnu ? Google tient compte de vos avis, de votre note, et de ce que le reste d’internet dit de vous : annuaires, articles, sites qui renvoient vers le vôtre.

Sur la distance, vous ne pouvez rien : vous n’allez pas déménager. Sur la pertinence et la notoriété, presque tout dépend de vous. C’est là que porte tout ce tuto.

## Ce que cela veut dire en pratique

- Un commerce mal décrit sera battu par un autre, plus loin, mais mieux décrit.
- Un établissement sans avis récents inspire moins confiance, à Google comme aux clients.
- Un site qui ne dit nulle part où vous êtes ne peut pas aider votre fiche.

## Un exemple

Prenons un exemple inventé. Deux boulangeries se trouvent à la même distance d’une habitante. La première a une fiche avec la catégorie « Boulangerie », des horaires à jour, des photos du matin et des avis récents. La seconde a une fiche créée il y a des années, sans photo, avec d’anciens horaires. Google mettra le plus souvent la première en avant, et l’habitante aussi.

## Le plan de ce tuto

Les pages suivantes suivent l’ordre logique :

- votre fiche Google, remplie à fond ;
- votre site, relié à cette fiche ;
- les pages locales, quand elles ont du sens ;
- votre présence ailleurs : Apple Plans, Bing, PagesJaunes, annuaires ;
- les pièges et les gestes qui entretiennent votre place.

> Si vous n’avez pas encore de fiche Google, le guide sur la fiche d’établissement explique comment la créer. Ce tuto part du principe qu’elle existe, et vous aide à en tirer le meilleur.`,
      },
      {
        titre: 'Votre fiche Google, remplie à fond',
        body: `Une fiche à moitié remplie, c’est une vitrine à moitié éclairée. Voici les champs qui comptent, et comment les remplir.

## La catégorie principale

C’est le réglage le plus important. Elle dit à Google sur quelles recherches vous montrer. Choisissez la catégorie la plus précise qui décrit votre activité principale : « Plombier » plutôt que « Entreprise de construction », « Pizzeria » plutôt que « Restaurant » si c’est votre spécialité.

Vous pouvez ajouter des **catégories secondaires** pour vos autres activités. N’en mettez que de vraies : une catégorie qui ne vous correspond pas vous fait apparaître devant des gens déçus.

## Le nom

Votre vrai nom, celui de votre devanture ou de vos factures. Les consignes de Google interdisent d’y ajouter des mots-clés ou une ville : « Garage Martin » oui, « Garage Martin pneus pas cher Reims » non. Une fiche dont le nom est gonflé peut être suspendue.

## L’adresse ou la zone

- Vous recevez des clients : indiquez l’adresse exacte, et vérifiez que l’épingle tombe au bon endroit sur la carte.
- Vous vous déplacez chez vos clients : masquez votre adresse et indiquez votre **zone d’intervention**, les communes ou le secteur où vous travaillez.

## Les horaires

Les horaires habituels, bien sûr, mais aussi les **horaires des jours fériés** et vos fermetures exceptionnelles. Un client qui trouve porte close à cause de votre fiche ne revient pas.

## Les services ou produits

Listez-les un par un, avec les mots de vos clients. Ils renforcent la pertinence de votre fiche sur des recherches précises.

## La description

Quelques phrases simples : ce que vous faites, pour qui, dans quel secteur, ce qui vous distingue vraiment. Pas de liste de mots-clés, pas de promotion criarde.

## Les photos

- la devanture, pour qu’on vous reconnaisse en arrivant ;
- l’intérieur, ou votre véhicule si vous vous déplacez ;
- vos produits ou vos réalisations ;
- vous et votre équipe, si vous êtes à l’aise.

Ajoutez-en régulièrement, au fil des saisons et des chantiers. Une fiche vivante rassure.

## Le lien vers votre site

Indispensable : la fiche dit où et quand, le site dit quoi et pourquoi vous. Les deux se renforcent.

## Un exemple

Prenons un exemple inventé. Thomas est électricien, il travaille seul depuis chez lui. Sa fiche affichait son adresse personnelle et une seule catégorie, « Électricien ». Il masque son adresse, déclare les communes de sa zone, ajoute ses services « dépannage », « mise aux normes » et « borne de recharge », puis quatre photos de chantiers récents. Sa fiche dit enfin tout ce qu’il fait, et où.

> Méfiez-vous des appels qui proposent de « mettre en conformité » ou de « certifier » votre fiche contre paiement. La fiche Google est gratuite, et rien ne vous oblige à payer qui que ce soit pour la gérer.`,
      },
      {
        titre: 'Relier votre site à votre fiche',
        body: `Votre fiche Google et votre site doivent raconter la même histoire. Plus ils concordent, plus Google a confiance. Voici comment.

## Vos coordonnées, au mot près

Écrivez une fois pour toutes votre **nom, adresse et téléphone**, exactement comme sur votre fiche Google. Puis recopiez-les tels quels sur votre site : en bas de chaque page et sur la page contact.

« 3 rue de la Gare » d’un côté et « 3, r. Gare » de l’autre, ce n’est rien pour un humain. Pour un moteur de recherche, c’est un petit doute. Même chose pour un ancien numéro de téléphone oublié sur une vieille page.

## Votre lieu, là où ça compte

Votre ville ou votre zone doit apparaître naturellement :

- **dans le titre de la page d’accueil** : « Électricien à Signy-l’Abbaye et alentour » ;
- **dans le grand titre** ou la phrase qui le suit ;
- **sur la page contact**, avec l’adresse et un lien qui ouvre l’itinéraire ;
- **sur chaque page de service**, avec les communes où vous le proposez.

Inutile de répéter la ville dans chaque phrase. Il suffit que Google et le visiteur la trouvent sans chercher.

## Une page par service principal

Votre fiche liste vos services ; votre site doit les développer. Chaque service principal mérite sa page, avec :

- ce que vous faites exactement ;
- comment ça se passe ;
- les communes où vous intervenez pour ce service ;
- un bouton pour vous appeler ou demander un devis.

C’est ce qui permet à Google de vous montrer sur « mise aux normes électriques » et pas seulement sur « électricien ».

## Des informations que Google lit facilement

Les sites bien construits décrivent aussi votre activité dans un format spécial, invisible pour le visiteur mais lu par Google : votre nom, votre adresse, vos horaires, votre type de commerce. Si votre site a été fait par un professionnel, demandez-lui si c’est le cas. Sur les sites que nous créons, c’est prévu d’office.

## La carte sur la page contact

Une carte Google intégrée dans la page ralentit le site et peut déposer des cookies. Un simple lien « Ouvrir l’itinéraire », ou une image de plan qui ouvre la carte quand on la touche, fait le même travail, plus vite.

## Un exemple

Prenons un exemple inventé. Lina tient un salon de thé. Son site indiquait « rue du Château » alors que sa fiche disait « 12 rue du Château », et son ancien numéro de portable traînait encore en bas de page. Elle aligne les deux, ajoute le nom de sa ville dans le titre de sa page d’accueil et sur sa page contact, avec un lien vers l’itinéraire. Rien de spectaculaire, mais tout concorde désormais.`,
      },
      {
        titre: 'Les pages locales, quand elles ont du sens',
        body: `## C’est quoi, une page locale ?

Une **page locale** présente votre activité dans un lieu précis : une ville voisine, un quartier, une vallée. Elle sert quand vous travaillez sur plusieurs communes et que des clients cherchent « couvreur » suivi du nom de leur ville.

Bien faite, c’est une porte d’entrée précieuse. Mal faite, c’est une page satellite qui peut faire reculer tout votre site.

## La règle : du vrai, propre à ce lieu

Une page locale n’a de valeur que si elle dit des choses vraies et propres à ce lieu. Posez-vous la question : un habitant de cette ville apprendrait-il quelque chose en la lisant ?

Ce qu’on peut y mettre :

- les types de chantiers ou de demandes que vous y rencontrez vraiment ;
- votre délai de passage ou de livraison dans ce secteur ;
- les particularités du coin : maisons anciennes, terrains en pente, marché du samedi ;
- des photos de réalisations faites sur place, avec l’accord des clients ;
- un avis d’un client de cette commune, s’il l’a publié lui-même ;
- comment venir, si vous recevez du public.

## Combien en créer ?

Autant que de lieux où vous avez quelque chose de vrai à dire, pas plus. Pour beaucoup d’artisans, ce sont quelques communes, celles où se trouve l’essentiel de leurs clients. Commencez par celle qui compte le plus.

## Un exemple de plan

Pour une page « Couvreur à Rethel », par exemple :

1. **Un titre clair** : votre métier et la ville.
2. **Une phrase d’accroche vraie** : depuis quand vous y travaillez, ou ce que vous y faites le plus souvent.
3. **Les travaux typiques du secteur**, en quelques lignes chacun.
4. **Votre délai de passage** dans cette commune.
5. **Deux ou trois photos** de chantiers locaux.
6. **Le bouton d’appel** et un lien vers vos pages de services.

## Prenons un exemple inventé

Élodie est couvreuse. Elle travaille dans six communes, mais la moitié de ses chantiers sont dans la même petite ville, où beaucoup de maisons ont des toits en ardoise. Sa page locale parle de ces toits, des réparations après les coups de vent d’automne et de son délai de passage habituel dans le secteur. Une page qu’aucun concurrent ne pourrait copier, parce qu’elle raconte son vrai travail.

## L’erreur à éviter

Dupliquer. Écrire une page pour une ville, puis la copier dans vingt autres communes en changeant seulement le nom. Google repère ces copies, et vos visiteurs aussi. Mieux vaut trois pages utiles que trente pages identiques.

> Les pages locales font partie de ce que propose la page de visibilité Google : le sujet est choisi parmi les recherches de votre zone, puis la page est écrite et intégrée à votre site.`,
      },
      {
        titre: 'Exister aussi sur Apple Plans, Bing et les annuaires',
        body: `Beaucoup de clients ne passent pas par Google. Ils demandent leur chemin à leur iPhone, cherchent depuis l’ordinateur du bureau avec Bing, ou ouvrent l’annuaire de leur ville. Chaque fiche est une porte de plus, et des coordonnées identiques partout renforcent aussi votre notoriété aux yeux de Google.

## Apple Plans

C’est la carte des iPhone. Votre fiche se gère dans **Apple Business**, le service gratuit d’Apple qui a remplacé Apple Business Connect au printemps 2026. Il faut un identifiant Apple, gratuit, et le service se gère aussi depuis un ordinateur.

1. Connectez-vous à Apple Business avec votre identifiant Apple.
2. Cherchez votre établissement ; s’il existe déjà dans Plans, revendiquez-le, sinon créez-le.
3. Suivez la vérification demandée par Apple.
4. Ajoutez photos, horaires, téléphone et lien vers votre site.

## Bing

Le moteur de Microsoft se gère dans **Bing Places for Business**, gratuit. Si votre fiche Google est déjà vérifiée, Bing propose de l’importer : connectez-vous avec le compte qui gère votre fiche Google, et vos informations sont reprises en quelques clics. Relisez tout de même le résultat.

## PagesJaunes

L’inscription de base, avec vos coordonnées, est gratuite. Des options payantes existent : elles ne sont pas nécessaires pour commencer. Si une fiche à votre nom existe déjà, réclamez-la plutôt que d’en créer une seconde.

## Les annuaires de votre métier et de votre ville

Ce sont souvent les plus utiles, car ils parlent à des gens de votre coin ou de votre secteur :

- le site de votre commune ou de votre communauté de communes ;
- l’office de tourisme, pour un restaurant, un gîte ou un commerce de bouche ;
- l’union des commerçants ou l’association des artisans ;
- l’annuaire de votre fédération ou de votre organisation professionnelle ;
- les labels réels que vous avez obtenus.

## La règle qui compte

Avant de commencer, écrivez votre nom, votre adresse, votre téléphone et l’adresse de votre site sur une note, exactement comme sur votre fiche Google. Puis copiez-collez cette note dans chaque fiche, sans rien retaper.

## Un exemple

Prenons un exemple inventé. Lina, qui tient le salon de thé, reçoit beaucoup de touristes équipés d’iPhone. Son salon n’apparaissait pas dans Plans. En une soirée, elle crée sa fiche Apple, importe sa fiche Google dans Bing et s’inscrit sur le site de l’office de tourisme. Les mêmes informations, au mot près, sur chaque fiche.

## Faut-il être partout ?

Non. Mieux vaut cinq fiches fiables et à jour qu’une centaine de fiches oubliées. Chaque fiche créée devra être tenue : quand vos horaires changent, il faudra la modifier aussi. Gardez une liste des endroits où vous êtes inscrit.`,
      },
      {
        titre: 'Les pièges et l’entretien de votre place',
        body: `## Les pièges à éviter

**Inventer une adresse.** Une boîte postale, un bureau partagé où vous n’allez jamais, l’adresse d’un ami dans la grande ville voisine : les consignes de Google l’interdisent, et une fiche qui triche peut être suspendue. Si vous vous déplacez chez vos clients, indiquez plutôt votre vraie zone d’intervention.

**Créer plusieurs fiches pour le même commerce.** Une fiche par établissement réel, pas une par service ou par ville. Les doublons se font concurrence, et Google peut les retirer.

**Gonfler le nom.** Ajouter « pas cher », « dépannage 24 h/24 » ou le nom d’une ville à votre nom de fiche. C’est interdit, et des concurrents ou des utilisateurs peuvent le signaler.

**Céder aux démarcheurs.** Des sociétés appellent pour vendre une inscription « obligatoire », une « garantie de première place » ou la « mise à jour » de votre fiche. Les fiches Google, Apple et Bing sont gratuites, aucun annuaire n’est obligatoire, et personne ne peut garantir une place. Raccrochez poliment, et ne signez rien au téléphone.

**Acheter des avis.** Le tuto sur les avis Google explique pourquoi, et comment en obtenir honnêtement.

## L’entretien, un quart d’heure par mois

Une place sur la carte s’entretient. Voici une petite routine mensuelle :

1. **Vérifiez vos horaires**, et ajoutez ceux des jours fériés et des congés à venir.
2. **Ajoutez une ou deux photos récentes** : un nouveau produit, un chantier terminé, la vitrine de saison.
3. **Répondez aux avis** arrivés dans le mois, bons comme mauvais.
4. **Relisez vos services et votre description** : un nouveau service, un tarif qui change, une spécialité abandonnée.
5. **Mettez à jour vos autres fiches** (Apple, Bing, annuaires) si quelque chose a changé.

## Mesurer vos progrès

Votre fiche Google affiche ses propres statistiques : combien de personnes l’ont vue, combien ont demandé l’itinéraire, appelé ou visité votre site. Regardez-les une fois par mois, et comparez avec le mois précédent. Une hausse des appels ou des itinéraires vaut plus que tous les classements.

## Un exemple

Prenons un exemple inventé. Inès, boulangère, a inscrit dans son agenda « fiche Google » le premier lundi du mois. En quinze minutes, elle ajoute les horaires du prochain jour férié, publie une photo de la galette de saison et répond aux avis de la semaine. Ce petit rendez-vous suffit à garder une fiche vivante toute l’année.

### À faire aujourd’hui

- Vérifiez la catégorie principale de votre fiche Google : est-ce la plus précise possible ?
- Comparez nom, adresse et téléphone entre votre site et votre fiche, caractère par caractère.
- Ajoutez votre ville ou votre zone dans le titre de votre page d’accueil.
- Cherchez votre commerce dans Plans sur un iPhone, et sur Bing : créez la fiche qui manque.
- Inscrivez dans votre agenda un quart d’heure « fiche Google » chaque mois.`,
      },
    ],
    faq: [
      { q: 'Je travaille chez mes clients, sans local : puis-je être sur la carte ?', a: 'Oui. Sur votre fiche Google, vous pouvez masquer votre adresse et indiquer la zone où vous vous déplacez. Votre fiche peut alors apparaître sur les recherches de cette zone.' },
      { q: 'Combien de pages locales faut-il créer ?', a: 'Autant que de lieux où vous avez quelque chose de vrai à dire. Mieux vaut quelques pages utiles qu’une longue série de pages identiques.' },
      { q: 'Je n’ai pas d’iPhone, puis-je créer ma fiche Apple ?', a: 'Oui. Apple Business se gère aussi depuis un navigateur sur ordinateur. Il vous faut seulement un identifiant Apple, que l’on peut créer gratuitement.' },
    ],
    voir: ['apparaitre-sur-google-les-bases', 'avis-google-en-avoir-plus-et-bien-repondre', 'fiche-google-entreprise'],
  },

  // ------------------------------------------------------------------ 3. Les avis Google
  {
    slug: 'avis-google-en-avoir-plus-et-bien-repondre',
    groupe: 'visible',
    icon: 'star',
    monstre: 'mascotte',
    nom: 'Les avis Google : en avoir plus et bien répondre',
    resume: 'Demander des avis dans les règles, au bon moment, et répondre à chacun, même aux plus durs.',
    duree: 45,
    niveau: 'Débutant',
    h1: 'Les avis Google : en avoir plus, honnêtement, et bien y répondre',
    title: 'Avis Google : en avoir plus et bien répondre | Les Minis Monstres',
    description: 'Obtenir plus d’avis Google dans les règles, avec des messages prêts à copier, puis répondre aux bons comme aux mauvais avis, et savoir quand signaler.',
    lead: 'La plupart des clients contents ne laissent pas d’avis, simplement parce que personne ne le leur a demandé. Ce tuto vous apprend à demander au bon moment, dans les règles, puis à répondre à chaque avis avec calme.',
    pages: [
      {
        titre: 'Pourquoi les avis comptent, et ce qui est interdit',
        body: `## Deux raisons de s’y intéresser

**Pour vos futurs clients.** Entre deux commerces qu’il ne connaît pas, un client regarde les étoiles, le nombre d’avis, et surtout ce qu’ils racontent. Des avis récents et détaillés rassurent plus qu’une note parfaite avec trois avis datant de plusieurs années.

**Pour Google.** D’après son aide officielle, la notoriété d’un établissement fait partie des trois critères du classement sur la carte, et les avis la nourrissent. Un commerce avec des avis réguliers donne à Google des signes qu’il est actif et apprécié.

## Ce que disent les règles de Google

Le règlement des contenus de Google Maps est public. Il interdit notamment :

- **Les avis récompensés.** Pas de remise, de cadeau, de tirage au sort ou de point de fidélité en échange d’un avis, quel qu’il soit, même si vous ne demandez pas qu’il soit positif.
- **La sollicitation sélective.** Demander des avis seulement aux clients dont on est sûr, ou décourager les mécontents d’en laisser, est interdit.
- **Le conflit d’intérêts.** Pas d’avis écrit par vous, par vos salariés, par votre famille, ni contre un concurrent.
- **Les faux avis**, achetés ou écrits par d’autres pour vous.

Google combine des contrôles automatiques et des équipes humaines. Il peut supprimer des avis, bloquer pour un temps la publication de nouveaux avis et afficher un message d’alerte sur une fiche qui a triché.

## Ce que dit la loi

En France, diffuser ou faire diffuser de faux avis de consommateurs est une **pratique commerciale trompeuse**, au sens du Code de la consommation. La DGCCRF, l’administration chargée de protéger les consommateurs, enquête sur ces pratiques et peut sanctionner l’entreprise qui en profite, pas seulement celle qui vend les avis.

## Ce qui reste permis, et marche très bien

- Demander un avis à **tous** vos clients, simplement.
- Leur rendre la tâche facile avec un lien ou un QR code.
- Remercier de vive voix ceux qui l’ont fait.
- Répondre à chaque avis, bon ou mauvais.

C’est tout l’objet des pages suivantes.

## Un exemple

Prenons un exemple inventé. Marc, garagiste, reçoit un appel : une société lui propose « cinquante avis cinq étoiles en un mois ». La proposition est tentante, sa fiche n’en a que douze. Il refuse : s’il était repéré, sa fiche pourrait afficher un avertissement, et ses douze vrais avis valent plus que cinquante faux. Il décide plutôt de demander un avis à chaque client qui récupère sa voiture.`,
      },
      {
        titre: 'Votre lien d’avis et votre QR code',
        body: `Le premier frein, c’est la difficulté. Un client qui doit chercher votre fiche, trouver le bouton et se connecter abandonne souvent. Votre lien d’avis supprime ces étapes.

## Récupérer votre lien

Google fournit un lien qui ouvre directement la fenêtre pour écrire un avis sur votre fiche.

1. Ouvrez votre fiche d’établissement Google, connecté avec le compte qui la gère.
2. Allez dans les avis, puis choisissez **« Recevoir plus d’avis »**.
3. Google affiche un lien à copier, et un **QR code** à télécharger.

Les libellés des menus changent de temps en temps. Si vous ne trouvez pas ce bouton, cherchez « Recevoir plus d’avis » dans l’aide de Google : la marche à suivre à jour y est décrite.

L’outil « Mes avis Google » de la bande prépare aussi ce lien et ce QR code pour vous, prêts à imprimer ou à envoyer.

## Où le mettre

Le lien et le QR code doivent se trouver là où vos clients sont contents :

- **près de la caisse ou du comptoir**, sur un petit chevalet ;
- **dans votre message de fin de prestation**, par SMS ou par e-mail ;
- **sur vos factures et vos devis signés**, en bas de page ;
- **sur une carte de visite** ou un petit carton glissé dans le sac ou le colis ;
- **dans la signature de vos e-mails** ;
- **sur votre site**, sur la page de remerciement après une commande ou une demande.

## Un QR code qui donne envie

Un QR code seul ne dit rien. Accompagnez-le toujours d’une phrase courte et humaine :

> « Votre avis nous aide beaucoup. Un petit mot sur Google ? Il suffit de scanner. »

Imprimez-le assez grand pour être scanné de loin, et testez-le avec votre propre téléphone avant de l’afficher.

## Un exemple

Prenons un exemple inventé. Inès tient une boulangerie. Elle imprime son QR code sur un petit chevalet posé près de la caisse, avec la phrase « Le pain vous a plu ? Dites-le sur Google, merci ! ». Elle l’ajoute aussi au bas des bons de commande pour les gâteaux. Le samedi, quand la file est calme, elle le montre aux habitués.

## L’erreur à éviter

Envoyer les clients chercher votre fiche « sur Google ». Beaucoup tomberont sur une autre fiche, se perdront dans les menus ou abandonneront. Le lien direct fait toute la différence.

> Vérifiez votre lien de temps en temps. Si votre fiche change de propriétaire ou est recréée, l’ancien lien peut ne plus fonctionner.`,
      },
      {
        titre: 'Demander au bon moment, avec les bons mots',
        body: `## Le bon moment

Un avis se demande quand le client est content, c’est-à-dire juste après le service rendu, pas trois semaines plus tard :

- à la remise des clés, de la voiture ou du chantier ;
- au moment de payer, quand le client vous remercie ;
- le soir d’une livraison ou d’un événement ;
- quand un client vous dit spontanément sa satisfaction.

Si un client vous dit qu’il est déçu, réglez d’abord son problème avant de parler d’avis. Mais ne triez pas vos clients à l’avance : la règle est de proposer à tout le monde.

## À l’oral, en une phrase

> « Si vous êtes content, un petit avis sur Google m’aiderait beaucoup. Je vous envoie le lien ? »

Simple, sincère, sans insister. La plupart des gens acceptent volontiers, encore faut-il le leur proposer.

## Par SMS, juste après

> « Bonjour, merci pour votre confiance aujourd’hui. Si vous avez deux minutes, votre avis sur Google m’aiderait beaucoup : [votre lien]. Bonne soirée, Paul. »

## Par e-mail

> Objet : Merci, et une petite faveur
>
> Bonjour,
>
> Merci d’avoir fait appel à nous pour votre cuisine. Nous espérons que tout vous plaît.
>
> Si vous avez un moment, un avis sur Google aiderait d’autres personnes à nous trouver : [votre lien].
>
> Et si quelque chose ne va pas, répondez simplement à cet e-mail, nous regarderons ça ensemble.
>
> Bonne journée,
> Élodie

## Sur une facture ou un carton

> « Votre avis compte pour nous. Scannez ce code pour le laisser sur Google. Merci ! »

## Une relance, pas plus

Si le client n’a pas répondu, une seule relance quelques jours plus tard est acceptable. Au-delà, vous risquez d’agacer. Un client agacé laisse rarement un bon avis.

## Aider le client à écrire

Un client qui ne sait pas quoi dire n’écrit rien. Vous pouvez l’aider sans lui dicter : « Vous pouvez dire ce qui vous a plu, par exemple le délai ou l’accueil. » Ne lui demandez jamais de mettre cinq étoiles, et n’écrivez jamais l’avis à sa place.

## L’habitude plutôt que la campagne

Les avis viennent de la régularité. Une demande glissée dans chaque fin de prestation vaut mieux qu’un grand message envoyé un jour à tout votre carnet d’adresses. Des avis qui arrivent régulièrement paraissent aussi plus naturels, aux clients comme à Google.

> Le message de demande est la tâche parfaite à rendre automatique : il peut partir tout seul après chaque rendez-vous ou chaque commande, sans que vous ayez à y penser.`,
      },
      {
        titre: 'Répondre aux bons avis',
        body: `## Pourquoi répondre aussi aux bons avis

Répondre aux avis positifs montre que votre fiche est suivie, qu’une vraie personne est derrière. Cela fait plaisir au client, qui se sent reconnu, et donne envie aux suivants d’écrire à leur tour. Votre réponse est aussi lue par tous ceux qui découvriront votre fiche demain.

## Les trois ingrédients d’une bonne réponse

1. **Le merci, avec le prénom** si le client l’affiche.
2. **Un détail repris de son avis**, pour montrer que vous l’avez lu : le gâteau d’anniversaire, la rapidité, la couleur choisie.
3. **Une phrase de fin chaleureuse** : au plaisir de vous revoir, bonne installation, profitez bien de votre nouvelle cuisine.

Signez de votre prénom. Une personne répond, pas un service.

## Des exemples à adapter

**Pour un commerce :**

> « Merci beaucoup Julie ! Ravie que le fraisier ait fait l’unanimité pour l’anniversaire de votre fils. À très bientôt à la boutique. Inès »

**Pour un artisan :**

> « Merci Monsieur Durand pour ce retour. C’était un plaisir de refaire votre tableau électrique, et merci pour le café ! N’hésitez pas si vous avez besoin d’autre chose. Thomas »

**Pour un service à la personne :**

> « Merci Nathalie pour ce gentil message. Contente que les ourlets tombent parfaitement. Au plaisir de vous revoir pour les rideaux ! Claire, de l’atelier »

**Pour un avis avec seulement des étoiles, sans texte :**

> « Merci pour vos cinq étoiles, ça nous fait très plaisir ! À bientôt. Marc »

## Ce qu’il faut éviter

- **Le même texte copié partout.** « Merci pour votre avis ! » collé sous cinquante avis sonne creux. Variez, même un peu.
- **Les informations privées.** Ne citez jamais ce que le client a acheté, son adresse ou sa situation s’il ne l’a pas écrit lui-même.
- **La publicité lourde.** Une réponse n’est pas une annonce. Une petite mention d’une nouveauté passe, une liste de promotions non.

## Combien de temps y consacrer

Une réponse à un bon avis prend une minute. Répondez dans la semaine, idéalement en même temps que votre petite routine sur la fiche. L’outil « Mes avis Google » vous prépare une réponse pour chaque nouvel avis : vous la relisez, vous l’ajustez à votre façon, vous la publiez.

## Un exemple

Prenons un exemple inventé. Hugo est menuisier. Il recevait peu d’avis et n’y répondait jamais. Il prend l’habitude de répondre à chacun le dimanche soir, en reprenant un détail du chantier. Quelques mois plus tard, un nouveau client lui dit l’avoir choisi « parce qu’il répond à tout le monde, ça se voit qu’il est sérieux ».`,
      },
      {
        titre: 'Répondre à un avis négatif',
        body: `Un avis à une étoile fait mal, surtout quand on se sent injustement jugé. Pourtant, votre réponse compte plus que l’avis lui-même : elle s’adresse à tous les futurs clients, qui regardent surtout comment vous réagissez quand quelque chose se passe mal.

## La méthode en cinq temps

1. **Attendez quelques heures.** Ne répondez jamais à chaud. Relisez l’avis le lendemain, à tête reposée.
2. **Remerciez et nommez le problème.** « Merci d’avoir pris le temps d’écrire. Je comprends que l’attente vous ait agacé. » Montrer que vous avez compris désamorce beaucoup.
3. **Expliquez en deux phrases, sans vous justifier à l’excès.** Les faits, pas les reproches. Jamais de détail privé sur le client.
4. **Proposez une solution hors de Google.** Un numéro, une adresse e-mail, une invitation à repasser. La discussion se poursuit en privé.
5. **Signez de votre prénom.**

## Un exemple complet

Prenons un exemple inventé. Marc, garagiste, reçoit cet avis : « Voiture rendue avec un jour de retard, et la facture plus chère que prévu. »

Il répond le lendemain :

> « Bonjour, merci pour votre retour. Vous avez raison, la voiture a été rendue avec un jour de retard, et j’aurais dû vous prévenir plus tôt. La pièce commandée est arrivée avec un jour de décalage, ce qui explique aussi l’écart sur la facture. Je vous propose d’en parler au téléphone pour regarder ça ensemble. Marc »

Il reconnaît sa part, explique sans accuser, et ouvre la porte. Le prochain lecteur voit un garagiste honnête.

## Selon le type d’avis

**L’avis juste, mais sévère.** Reconnaissez, dites ce que vous avez changé : « Depuis, nous prévenons chaque client par SMS dès qu’un délai bouge. »

**L’avis injuste.** Restez factuel et poli : « Nous ne retrouvons pas votre visite à cette date. Pouvez-vous nous appeler pour que nous comprenions ce qui s’est passé ? »

**L’avis sur un point hors de votre contrôle**, comme le stationnement ou la météo. Remerciez, montrez de l’empathie, donnez une information utile : « Un parking gratuit se trouve à deux minutes, derrière l’église. »

## Les phrases à bannir

- « Vous mentez » ou « Ce client était désagréable » : même si c’est vrai, le lecteur retient le ton.
- Les réponses en majuscules, ou avec beaucoup de points d’exclamation.
- Les détails privés : « Vous n’aviez pas payé la dernière fois. »
- La contre-attaque point par point.

## Et si le client revient vers vous

Si vous réglez le problème en privé, ne lui demandez pas de modifier son avis contre un geste commercial : ce serait une contrepartie, interdite par Google. Vous pouvez simplement lui dire que, s’il le souhaite, il peut mettre son avis à jour. Beaucoup le font d’eux-mêmes.

> Une réponse calme à un mauvais avis rassure souvent plus qu’une dizaine de bons avis. Elle prouve qu’en cas de souci, on peut compter sur vous.`,
      },
      {
        titre: 'Signaler un avis, et les cas difficiles',
        body: `## Quand un avis peut être retiré

Seul son auteur peut supprimer un avis, ou Google s’il enfreint son règlement. Vous ne pouvez pas l’effacer vous-même. Mais vous pouvez **signaler** un avis qui ne respecte pas les règles, par exemple :

- des insultes, des propos haineux ou des menaces ;
- un avis qui ne parle pas de votre établissement ;
- un faux avis manifeste, ou écrit par un concurrent ;
- un avis qui contient des informations personnelles ;
- de la publicité ou des liens sans rapport.

Un avis simplement sévère, mais qui raconte une vraie expérience, ne sera pas retiré. Il faut y répondre, avec la méthode de la page précédente.

## Comment signaler

Depuis votre fiche d’établissement, ouvrez l’avis concerné et choisissez l’option pour le signaler, en indiquant la raison. Google examine la demande ; la réponse peut prendre du temps. L’aide de Google propose aussi un outil de gestion des avis pour suivre vos signalements.

Signaler n’empêche pas de répondre. Pendant l’examen, une réponse courte et polie montre aux lecteurs que vous restez serein.

## Les cas difficiles

**Une vague d’avis négatifs d’un coup**, souvent après un article, une polémique ou une publication virale, parfois de gens qui ne sont jamais venus. Ne répondez pas à chacun dans l’urgence. Signalez ceux qui enfreignent les règles, et suivez les démarches prévues dans l’aide de Google pour ces situations.

**Un ancien salarié ou un proche en conflit** qui publie un avis. C’est un conflit d’intérêts : signalez-le, et répondez sobrement.

**Un client qui menace d’un mauvais avis** pour obtenir une remise. Restez poli, ne cédez pas au chantage, gardez une trace écrite. S’il publie, répondez avec les faits, sans entrer dans la dispute.

**Un avis diffamatoire**, qui vous accuse à tort d’un délit, par exemple. Au-delà du signalement à Google, un professionnel du droit peut vous conseiller sur les recours possibles.

## Un exemple

Prenons un exemple inventé. Lina reçoit un avis à une étoile : « Service lamentable, à fuir. » Le prénom ne lui dit rien, la personne n’a jamais posté d’autre avis, et le texte ne décrit aucune visite. Elle le signale, puis répond : « Nous ne retrouvons pas votre passage. Pouvez-vous nous en dire plus, par téléphone ou sur place ? Lina. » Les lecteurs voient une commerçante calme et ouverte.

## Votre routine avis

- Activez les notifications de votre fiche pour être prévenu de chaque nouvel avis.
- Répondez dans la semaine, bons comme mauvais.
- Une fois par mois, relisez vos avis : ils disent aussi ce que vos clients aiment, et ce qu’ils voudraient voir changer.

### À faire aujourd’hui

- Récupérez votre lien d’avis et votre QR code, et testez-les avec votre téléphone.
- Choisissez votre phrase de demande, à l’oral et par SMS, et gardez-la dans vos notes.
- Demandez un avis à vos trois prochains clients, sans exception.
- Répondez au plus ancien avis resté sans réponse, avec la méthode adaptée.
- Activez les notifications de votre fiche Google.`,
      },
    ],
    faq: [
      { q: 'Puis-je offrir une petite remise à ceux qui laissent un avis ?', a: 'Non. Google interdit les avis obtenus contre une contrepartie, même modeste, et même si vous ne demandez pas un avis positif. Remerciez plutôt de vive voix.' },
      { q: 'Peut-on supprimer soi-même un avis négatif ?', a: 'Non. Seul son auteur peut le retirer, ou Google s’il enfreint son règlement. Vous pouvez y répondre, et le signaler s’il ne respecte pas les règles.' },
      { q: 'Un client m’a dit qu’il ne trouvait pas où laisser son avis.', a: 'C’est fréquent. Envoyez-lui directement votre lien d’avis ou montrez-lui le QR code : il arrive tout de suite au bon endroit, sans chercher votre fiche.' },
    ],
    voir: ['etre-trouve-pres-de-chez-soi', 'fiche-google-entreprise', 'faire-revenir-ses-clients'],
  },
];
