# La prospection par e-mail

Décision d'Alex (25 novembre 2026) : trouver, partout en France, les petites entreprises qui ont besoin d'un site, et leur écrire un joli mail. Trois agents s'en chargent : **le Repéreur** trouve (`agent-repereur`), **le Facteur** vérifie et écrit (`agent-facteur`), **le Répondeur** lit les réponses (`agent-repondeur`). Comme pour les sites, celui qui trouve n'est pas celui qui écrit : le Facteur relit chaque prospect avant le premier mail. Décision d'Alex (25 novembre 2026, soir) : le plus automatique possible. Chaque soir de semaine, à 18 h 15, Alex reçoit le débrief du jour, envoyé par le site.

**La prospection est éteinte par défaut.** Elle s'allume dans l'espace de gestion d'Alex (bloc « Prospection », bouton « Allumer la prospection ») ou dans les Réglages de l'extension (case « Prospection activée », option `aled08_prospection_active`). Éteinte, les deux agents reçoivent `rien_a_faire: true` et s'arrêtent, et la route refuse d'ajouter ou d'envoyer quoi que ce soit.

## Les garde-fous (à respecter à chaque prospect, sans exception)

La CNIL permet d'écrire à un professionnel sans son accord préalable, à ces conditions. Ce sont les nôtres :

1. **Prospection entre professionnels seulement** : une entreprise, un artisan, un commerçant, un indépendant, une association. Jamais un particulier.
2. **Une adresse professionnelle publiée par l'entreprise elle-même** : sur sa fiche Google, sa page Facebook ou Instagram, un annuaire qu'elle a rempli. On note l'adresse exacte de cette page (`url_source_email`) : elle est citée au pied du mail.
3. **Une offre liée à son métier** : un site internet pour son activité. Les trois points du mail parlent de son métier à elle.
4. **L'identité de l'expéditeur, la source de l'adresse et la désinscription en un clic** dans chaque mail. La route les ajoute elle-même : l'agent n'écrit jamais le pied du mail.
5. **La liste d'opposition** : une entreprise ou une adresse qui s'est désinscrite (ou qui a répondu « STOP ») ne reçoit plus jamais rien. La route la garde même si le prospect est effacé, et refuse tout ajout ou envoi qui la touche.
6. **On ne parle jamais d'IA**, ni d'outil automatique. **C'est la bande des Minis Monstres qui écrit, au « nous »** : une petite famille (décision d'Alex, 25 novembre 2026). Jamais « je » ni le prénom d'Alex dans un mail ; le mail est signé « La bande des Minis Monstres ».
7. **Rien de faux** : la phrase personnelle dit seulement ce que le Repéreur a vraiment constaté. Pas de promesse de résultat (« plus de clients garantis »), pas de fausse urgence, pas de prix écrit à la main (le prix et la remise viennent de la configuration).

## L'offre du mail

Décision d'Alex (25 novembre 2026, soir) : **les prospects ont la même offre que tout le monde, le prix de lancement.**

- Le mail annonce le prix de lancement de la création du site, sa date de fin et le prix d'après, tirés de la configuration. **Plus de code de réduction, plus de -10 %.** On n'écrit jamais « au lieu de ».
- Une commande passée avec l'adresse e-mail du prospect le marque « commande » tout seul.
- L'agent n'écrit aucun chiffre : le prix vient de la route.

## Ce que le mail dit toujours

**La forme du premier mail** (Alex, 26 novembre 2026 : « trop de texte », « plus familial et vendeur ») : court, chaleureux, en petites parties à titre coloré, dans cet ordre :

1. « Bonjour ! » et la phrase vraie (et l'encadré « Nous avons fait le test » s'il y a une mesure) ;
2. « On a imaginé votre site » : la maquette (quand elle sera branchée) ;
3. « Un site, c'est quoi ? » : une vitrine ouverte jour et nuit, et une adresse à soi ; puis les trois points du métier ;
4. « Et pour vous, ça demande quoi ? » : un questionnaire d'une dizaine de minutes ; on écrit les textes, on s'occupe de tout ; en ligne en 24 à 48 heures ;
5. « Tout compris dans le prix » : le prix de lancement et ce qui est compris (`aled08e_px_inclus()`) ;
6. « L'hébergement aussi, si vous voulez » : hébergement, sécurité, sauvegardes, mises à jour et modifications, au prix de la configuration (10 € par mois, 12 € avec le nom de domaine), sans engagement, **sans nommer le forfait** ;
7. une ligne pour les trois arguments (moins cher qu'une agence, un vrai suivi, tout vous appartient), les deux boutons, puis **le téléphone d'Alex** pour en parler (`prospection.telephone` dans la configuration ; tant qu'il est vide, « répondez simplement à ce mail ») ;
8. « À très vite, la bande des Minis Monstres ».

L'étude France Num reste dans la configuration mais ne figure plus dans le premier mail. Ce qui suit décrit le fond de ces parties.


Décision d'Alex (25 novembre 2026) : le mail lui-même doit convaincre. La route y écrit trois arguments, avec les chiffres de la configuration :

1. **C'est moins cher** : « 4 à 5 fois moins cher qu'une agence » (calculé), parce que nos charges sont réduites au maximum.
2. **Il y a un vrai suivi** : un espace client, des tutos pour chaque étape, une bande qui reste aux côtés du client. Le mail ne nomme pas le forfait Mini ; depuis le 26 novembre 2026, il propose l'hébergement avec son prix (partie 6 ci-dessus).
3. **Tout appartient au client** : le site et le nom de domaine sont à lui, il récupère son site quand il veut.

**La preuve, chiffrée.** Quand le Facteur retient un prospect, le site mesure lui-même sa position sur Google pour la recherche notée par le Repéreur (`recherche`, par exemple « coiffeur Signy-l'Abbaye »), avec le service Serper (réglage « Clé de mesure Google »). Le mail le dit dans un encadré « Nous avons fait le test » : « Votre page Facebook arrive en 36e position, sur la 4e page des résultats. Or la plupart des gens ne regardent que la première page. Envie de vous rapprocher de la première page, avec votre propre site ? C'est notre métier. » Sur la première page, il dit « bravo », puis que les clients y voient une page Facebook et non leur vitrine ; absent des 50 premiers, « c'est comme si vous n'existiez pas encore ». **Aucun agent ne donne ni n'écrit de position** : Google refuse les recherches faites par un programme, seul le service de mesure la connaît. Sans clé, le mail n'en parle pas. On ne promet jamais la première place : « vous rapprocher », « c'est notre métier ».

Le mail ajoute aussi qu'un site, c'est une adresse à soi, à mettre sur ses cartes de visite, sa vitrine et ses factures.

**Ce que disent les chiffres.** Le mail cite une étude officielle, avec sa source juste en dessous : « En France, 64 % des petites entreprises ont déjà un site internet. Et près d'une sur deux (46 %) dit qu'au moins 5 % de ses clients viennent d'internet. » (Baromètre France Num 2026, DGE et Crédoc, 9 655 TPE et PME). Les chiffres sont dans la configuration (`prospection.etude`), recopiés du rapport ; on les met à jour à chaque nouveau baromètre. **Jamais de « un site, c'est X % de clients en plus »** : aucune étude sérieuse ne le mesure, ce serait de la publicité trompeuse. L'agent n'écrit aucun de ces chiffres.

**Un nom de domaine libre, à son nom.** Quand le Facteur retient un prospect sans site, le site cherche lui-même une adresse libre à partir du nom de l'entreprise. **Le domaine reprend toujours le nom entier, tous ses mots dans l'ordre, « de », « du », « et » compris** : jamais un mot en moins (Alex, 25 novembre 2026 : `fabriquereve.fr` pour « Fabrique de Rêve », « une erreur comme ça ne doit jamais arriver »). Seuls tombent l'article du début et la forme juridique, et les accents (une adresse avec accent se tape mal). La forme avec des tirets passe en premier, « ça fait plus joli » : « Fabrique de Rêve » à Pourcy donne fabrique-de-reve.fr, fabriquedereve.fr, la-fabrique-de-reve.fr, fabrique-de-reve-pourcy.fr, fabrique-de-reve.com. Le site vérifie ce garde-fou à chaque étape (quand il cherche, à l'envoi, et dans le mail lui-même) ; l'adresse est vérifiée auprès du registre officiel, puis revérifiée au moment de l'envoi. Le mail l'annonce dans un encadré « Bonne nouvelle » : l'adresse est libre aujourd'hui, nous pouvons créer le site à cette adresse, enregistrée à son nom. Aucun agent n'écrit de nom de domaine. Le mail ne parle pas du forfait : l'encadré du prix dit seulement que l'hébergement et la suite se choisissent après, et que tout est expliqué sur le site.

**Ce que coûte l'absence de site**, dit avec des faits mesurés et sans fausse urgence : « ceux qui font cette recherche trouvent d'abord 35 autres résultats avant le vôtre », ou, absent des résultats, « pour eux, c'est comme si vous n'existiez pas encore ».

Puis il invite à voir les sites déjà en ligne (« Plutôt que mille mots, voyez par vous-même ») : le premier bouton mène à notre page Réalisations, le second à « Créer mon site ». **Plus de démo ni d'aperçu personnalisé dans le mail** : Alex a trouvé qu'ils ne donnaient pas envie. (L'aperçu personnalisé existe toujours dans le code, éteint : `apercuNote` à 101 dans la configuration.)

**La maquette par métier** (Alex, 26 novembre 2026, en préparation, pas encore branchée) : une maquette d'accueil par métier (`maquettes/`), remplie avec le nom et la ville du prospect, avec filigrane « Maquette d'exemple ». On montre toujours **la vue ordinateur** (capture à 1280 px de large, même quand le prospect l'ouvre sur son téléphone), et on dit que le site s'adapte au téléphone. Quand elle sera branchée, le mail la présente toujours ainsi : « Pour vous aider à vous projeter, nous avons préparé une maquette de ce que pourrait donner le site de … Voici la vue sur ordinateur ; votre site s'adapte aussi parfaitement au téléphone. Ce n'est qu'une maquette : votre site sera modifiable à 100 %, selon vos goûts (textes, photos, couleurs). », avec le bouton « Voir la maquette de votre site ». Jamais présentée comme le site fini, jamais rien d'inventé dessus sur l'entreprise. L'agent n'écrit aucun de ces arguments ni aucun chiffre : il donne le sujet, la phrase vraie et les trois points du métier.

## Qui cibler

**Oui** : les entreprises actives, petites et indépendantes, **sans site internet**, ou avec un site cassé, abandonné ou illisible sur téléphone (le Repéreur dit lequel). **Tous les petits métiers** dont les clients cherchent sur internet avant de venir, pas seulement ceux de nos pages (Alex, 25 novembre 2026 : « il y a tellement d'autres entrepreneurs »). La tournée passe département par département, les Ardennes d'abord, et dans chaque département par tous les métiers : ceux de nos pages « Votre métier » (+ 10 points), puis les autres (tableau « Les autres métiers » ci-dessous). Le poste donne chaque fois le métier et ses codes NAF.

**Les petits qu'on ne voit pas** (Alex, 25 novembre 2026 : « vise aussi les petits artisans pas très connus qui publient sur AlloVoisins ou autre… les petits qui font des foires ») : créateurs et artisans d'art, exposants des foires, marchés de Noël, marchés de créateurs et salons d'artisans, petits producteurs, services à la maison proposés sur les plateformes entre voisins. Ce sont souvent des micro-entrepreneurs qui n'ont qu'une page Facebook, une boutique Etsy ou un profil sur une plateforme : ceux à qui un site change le plus la vie. À chaque zone, le Repéreur cherche aussi par là (`travail.chercher_aussi` dans son poste), en plus de l'annuaire par métier. Les mêmes garde-fous valent : une vraie entreprise (SIREN actif), un e-mail qu'elle publie elle-même, pas de site correct.

**Non** :

- les entreprises qui ont déjà un site correct, même simple ;
- les grandes entreprises, les chaînes et les franchises (catégorie ETI ou GE, plusieurs dizaines d'établissements, une marque nationale) ;
- les administrations, les écoles, les mairies, les hôpitaux ;
- les entreprises fermées, en sommeil ou sans activité visible ;
- les entreprises dont les informations ne sont pas diffusées dans l'annuaire (« diffusion partielle », nom remplacé par `[ND]`) : elles ont demandé la discrétion ;
- les professions de santé réglementées (médecins, dentistes, kinésithérapeutes, infirmiers, pharmaciens, vétérinaires, sages-femmes) et les avocats, notaires et huissiers : leur communication est encadrée par leur ordre (`escalade`, point 4) ;
- nos clients et anciens clients (la route refuse une adresse qui a un compte chez nous) ;
- les activités à risque (armes, jeux d'argent, tabac, vapotage, alcool en vente à distance, produits réglementés).

## Les sources autorisées

| Pour | Source | Comment |
|---|---|---|
| Lister les entreprises | L'API publique et gratuite « Recherche d'entreprises » de l'État : `https://recherche-entreprises.api.gouv.fr/search` | Filtres ci-dessous, une requête à la fois (7 par seconde au plus) |
| Savoir s'il y a un site | Une recherche sur le web : nom de l'entreprise + ville | Les 10 premiers résultats, la fiche Google, la page Facebook |
| Repérer les petits qu'on ne voit pas | Les listes d'exposants des foires, marchés de Noël, marchés de créateurs et salons d'artisans (mairies, offices de tourisme, organisateurs, fest.fr, jds.fr, evenements-createurs.fr) ; les annuaires de créateurs (marche-des-createurs.fr, creatrices-et-createurs.com…) ; les plateformes de services (AlloVoisins, StarOfService, Leboncoin) ; Etsy | Seulement pour **repérer un nom**, page par page, comme un visiteur. On note où on l'a vu (`vu_sur`, `url_vu_sur`) |
| Vérifier que c'est une entreprise | L'API Recherche d'entreprises, avec son nom (`q=`) et le département | Pas de SIREN actif : c'est peut-être un particulier, on passe |
| Trouver l'adresse e-mail | Ce que **l'entreprise publie elle-même** : sa fiche Google, sa page Facebook ou Instagram, un annuaire qu'elle a rempli (PagesJaunes, annuaire de la Chambre de métiers ou de commerce, de sa fédération, un annuaire de créateurs où elle a rempli sa fiche, sa fiche d'exposant, la liste des associations de sa mairie) | On note l'adresse exacte de la page (`url_source_email`) |

**Interdit** :

- deviner une adresse (`contact@`, `prenom.nom@`, `nom@gmail.com`), même si elle a l'air probable ;
- une adresse vue ailleurs que chez l'entreprise ou un annuaire qu'elle a rempli (un forum, une fuite, un document, un autre site qui la recopie) ;
- l'adresse personnelle d'un dirigeant, ou une adresse tirée de la liste des dirigeants ;
- un fichier acheté, loué ou échangé ;
- aspirer en masse un site qui l'interdit (ses conditions d'utilisation ou son fichier `robots.txt`) ; LinkedIn, jamais ;
- sur AlloVoisins et les autres plateformes de mise en relation : un robot (leurs conditions l'interdisent : « contournement des limitations techniques (… robots …) », CGU AlloVoisins du 17 avril 2026), un message par leur messagerie, une adresse tirée de la plateforme (elle cache les coordonnées : la route refuse une source AlloVoisins), un profil « particulier » ;
- écrire à quelqu'un de la liste d'opposition, ou contourner un refus de la route.

### L'API Recherche d'entreprises

`GET https://recherche-entreprises.api.gouv.fr/search?activite_principale=10.71C,10.71D&departement=08&etat_administratif=A&per_page=25&page=1`

- `activite_principale` : un ou plusieurs codes NAF, séparés par des virgules (le tableau ci-dessous) ;
- `departement` : `01` à `95`, `2A`, `2B`, `971` à `976` ;
- `etat_administratif=A` : seulement les entreprises actives ;
- `categorie_entreprise=PME` écarte les grandes ; `per_page` vaut 25 au plus ; `page` pour la suite.

Dans chaque résultat : `siren`, `nom_complet`, `siege.liste_enseignes` (le nom sur la vitrine), `siege.libelle_commune`, `siege.code_postal`, `nature_juridique` (`1000` : entrepreneur individuel), `complements.est_entrepreneur_individuel`, `date_creation`, `tranche_effectif_salarie`, `nombre_etablissements`. Si un champ manque, lisez la documentation de l'API (`https://recherche-entreprises.api.gouv.fr/docs/`) plutôt que de deviner.

### Les codes NAF de nos métiers

| Page métier (`metier_page`) | Codes NAF |
|---|---|
| `site-internet-artisan` | 43.22A (plomberie, chauffage), 43.21A (électricité), 43.99C (maçonnerie), 43.32A (menuiserie), 43.34Z (peinture), 43.91B (couverture), 81.30Z (paysagiste) |
| `site-internet-therapeute` | 86.90F (sophrologie, naturopathie, réflexologie), 96.04Z (bien-être) |
| `site-internet-createur-artiste` | 90.03A, 90.03B (création artistique), 32.12Z (bijoux), 32.40Z (jeux, jouets) |
| `site-internet-gite-chambre-hotes` | 55.20Z (hébergement touristique), 55.10Z (petits hôtels indépendants) |
| `site-internet-commercant` | 47.71Z (vêtements), 47.59B (maison), 47.78C (cadeaux, déco), 47.65Z (jeux), 47.61Z (librairie) |
| `site-internet-association` | 94.99Z (associations), 93.12Z (clubs de sport), 90.01Z (troupes, chorales) |
| `site-internet-boulangerie-patisserie` | 10.71C (boulangerie), 10.71D (pâtisserie), 47.24Z (dépôt de pain), 10.82Z (chocolaterie) |
| `site-internet-photographe` | 74.20Z |
| `site-internet-coach-sportif` | 85.51Z (enseignement du sport), 93.13Z (salles de sport) |
| `site-internet-food-truck` | 56.10C (restauration rapide, cuisine ambulante) |
| `site-internet-fleuriste` | 47.76Z |
| `site-internet-garage-automobile` | 45.20A (voitures), 45.20B (autres véhicules), 45.40Z (motos) |
| `site-internet-producteur-local` | 01.13Z (légumes), 01.21Z (vigne), 01.49Z (apiculture, petits élevages), 01.50Z (polyculture-élevage), 10.51C (fromagerie) |
| `site-internet-toiletteur` | 96.09Z (vérifiez le toilettage dans le nom ou l'enseigne : ce code couvre d'autres services) |
| `site-internet-services-a-domicile` | 81.21Z (ménage), 88.10A (aide à domicile), 81.30Z (jardinage) |
| `site-internet-traiteur` | 56.21Z |

### Les autres métiers (sans page chez nous)

| Métier de la tournée (`zone.metier`) | Codes NAF |
|---|---|
| `autre-coiffure` | 96.02A (coiffure, barbiers) |
| `autre-esthetique` | 96.02B (esthétique, ongleries) |
| `autre-restaurant` | 56.10A (restaurants), 56.30Z (cafés, bars ; pas de bar-tabac) |
| `autre-alimentation` | 47.22Z (boucherie), 47.23Z (poissonnerie), 47.21Z (primeurs), 47.29Z (épiceries fines), 47.25Z (cavistes) |
| `autre-batiment` | 43.31Z (plâtrerie), 43.33Z (carrelage), 43.32B (serrurerie, menuiserie métal), 43.29A (isolation), 81.22Z (ramonage, nettoyage) |
| `autre-auto-ecole` | 85.53Z |
| `autre-taxi` | 49.32Z (taxis, VTC) |
| `autre-demenagement` | 49.42Z |
| `autre-immobilier` | 68.31Z (agences indépendantes seulement, jamais un réseau) |
| `autre-reparation` | 95.11Z, 95.12Z (informatique, téléphones), 95.21Z, 95.22Z (électroménager), 95.23Z (cordonnerie) |
| `autre-couture` | 14.13Z (couture), 96.01B (pressing, retouches) |
| `autre-loisirs` | 85.52Z (musique, danse), 93.29Z (loisirs), 85.59B (cours particuliers) |
| `autre-createurs` | 32.12Z, 32.13Z (bijoux), 32.99Z (autres créations), 23.41Z (céramique), 16.29Z (objets en bois), 90.03A (création artistique), 13.92Z, 14.19Z (textile), 20.42Z (savons, cosmétiques artisanaux) |
| `autre-marches` | 47.89Z (vente sur les marchés et foires), 47.81Z (alimentaire sur les marchés), 47.82Z (textile sur les marchés) |
| `autre-producteurs` | 01.13Z (maraîchage), 01.49Z (apiculture), 10.51C (fromages), 10.82Z (confiserie), 10.52Z (glaces), 10.39B (confitures) |
| `autre-services-maison` | 81.30Z (jardinage), 81.21Z (ménage), 43.39Z, 43.34Z (petits travaux, peinture), 95.24Z (meubles) |

Pour ces métiers, `metier_page` reste vide (pas de page chez nous) ; `zone.metier` reprend le nom de la tournée (`autre-coiffure`…). Les exclusions de « Qui cibler » restent valables (santé réglementée, droit, tabac, jeux, chaînes et franchises…).

Un code NAF large (96.09Z, 47.78C, 94.99Z) ramène des activités très différentes : gardez seulement celles qui correspondent vraiment au métier.

## La note sur 100

Le Repéreur ne donne pas de chiffre : il coche ce qu'il a constaté (`criteres`), et la route calcule.

| Critère | Points | On le coche quand… |
|---|---|---|
| `sans_site` | + 40 | Aucun site trouvé (recherche nom + ville, fiche Google, page Facebook) |
| `site_casse` (à la place) | + 30 | Un site existe mais il est cassé, abandonné (plus de deux ans sans nouvelle), ou illisible sur téléphone. Son adresse va dans `site_actuel` |
| `metier_recherche` | + 20 | Un métier où l'on cherche sur internet avant d'acheter ou d'appeler |
| `activite_recente` | + 20 | Une activité réelle et récente : des avis de moins d'un an, une fiche ou une page tenue à jour, des publications récentes |
| `independante` | + 10 | Une petite entreprise indépendante : pas une chaîne ni une franchise, un seul ou quelques établissements |
| (automatique) | + 15 | L'entreprise est **créée depuis moins de 18 mois** : c'est le moment où l'on a besoin d'un site. Ce n'est pas une case à cocher : le Repéreur donne `date_creation` (la date de l'annuaire de l'État), et la route calcule |
| (automatique) | + 10 | Le métier a sa page chez nous : `metier_page` est le slug d'une page « Votre métier » |

**En dessous de 60 : écarté** (la route le garde quelques mois pour ne pas le retrouver, sans jamais lui écrire). Dans le doute sur un critère, on ne le coche pas.

## Le rythme

- Le quota : 20 envois par jour la première semaine, puis 20 de plus chaque semaine depuis le premier envoi, jusqu'à 150 (options `aled08_prospection_quota_depart` et `aled08_prospection_quota_max`). Les relances comptent.
- Au plus 30 envois par heure, en semaine de 8 h à 18 h (heure du site), et seulement quand le site et les ventes sont ouverts.
- Une seule relance, **7 jours** après le premier mail, ou **3 jours** quand le prospect a cliqué dans le mail (les sites déjà en ligne, « Créer mon site ») : il a montré de l'intérêt, on ne le laisse pas refroidir. Jamais plus de 30 jours après le premier mail. Puis plus rien.
- On ne relance jamais quelqu'un qui a répondu, s'est désinscrit ou a commandé. Le Répondeur lit les réponses et les note tout seul (`faire: "repondu"`, `"desinscrire"`, `"rebond"`). Alex peut aussi les noter dans son espace (« A répondu », « Ne plus lui écrire »).
- **La pause automatique** : sur 7 jours et au moins 40 envois, plus de 5 % de désinscriptions ou plus de 8 % d'adresses fausses éteignent la prospection toute seule, et Alex est prévenu. Lui seul la rallume.

## Ce qui marche

La route compte, pour chaque métier, chaque département et chaque type de sujet, les clics, les réponses, les intéressés, les commandes et les refus (`ce_qui_marche`, dans le poste). À partir de 10 mails par groupe :

- le Repéreur est envoyé deux fois sur trois vers le métier qui répond le mieux, et une fois sur trois dans la tournée normale, pour continuer d'essayer les autres ;
- le Facteur dit le type de chaque sujet (`sujet_type`) et lit lequel marche le mieux.

## Les réponses

Elles arrivent à l'adresse des réponses (réglage « Adresse des réponses », sinon l'adresse de réception du site), qui doit arriver dans le Gmail d'Alex. Le Répondeur désinscrit ceux qui disent non, note les adresses fausses, et **prépare un brouillon** pour les intéressés et les questions. **Aucun agent n'envoie de réponse à un prospect : Alex relit le brouillon et l'envoie.**
- Le Repéreur ne garde pas plus de trois jours d'envois d'avance : le poste lui dit combien en trouver.

## Combien de temps on garde

Un prospect écarté s'efface après 180 jours, un prospect à qui l'on n'a jamais écrit aussi ; un prospect sans suite, trois ans après le premier mail. **La collecte seule** (option `aled08_prospection_collecte`, Alex, 25 novembre 2026) permet d'enregistrer des prospects pour plus tard pendant que la prospection est éteinte : rien ne part, le Facteur les vérifiera au lancement. La liste d'opposition, elle, reste toujours (des empreintes, jamais l'adresse en clair).

## Ce que les agents ne font jamais

- Écrire un mail eux-mêmes, en HTML ou avec un autre outil : seule la route envoie, avec le gabarit d'Alex.
- Écrire à une adresse qui n'a pas de source publiée par l'entreprise.
- Changer une option de la prospection (l'allumer, le quota) : c'est Alex.
- Promettre un prix, une remise ou un délai que la route n'a pas mis dans le mail.
- Envoyer une réponse à un prospect : le Répondeur prépare un brouillon, c'est Alex qui l'envoie, depuis sa boîte.
