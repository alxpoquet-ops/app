# La prospection par e-mail

Décision d'Alex (25 novembre 2026) : trouver, partout en France, les petites entreprises qui ont besoin d'un site, et leur écrire un joli mail. Deux agents s'en chargent : **le Repéreur** trouve (`agent-repereur`), **le Facteur** vérifie et écrit (`agent-facteur`). Comme pour les sites, celui qui trouve n'est pas celui qui écrit : le Facteur relit chaque prospect avant le premier mail.

**La prospection est éteinte par défaut.** Elle s'allume dans l'espace de gestion d'Alex (bloc « Prospection », bouton « Allumer la prospection ») ou dans les Réglages de l'extension (case « Prospection activée », option `aled08_prospection_active`). Éteinte, les deux agents reçoivent `rien_a_faire: true` et s'arrêtent, et la route refuse d'ajouter ou d'envoyer quoi que ce soit.

## Les garde-fous (à respecter à chaque prospect, sans exception)

La CNIL permet d'écrire à un professionnel sans son accord préalable, à ces conditions. Ce sont les nôtres :

1. **Prospection entre professionnels seulement** : une entreprise, un artisan, un commerçant, un indépendant, une association. Jamais un particulier.
2. **Une adresse professionnelle publiée par l'entreprise elle-même** : sur sa fiche Google, sa page Facebook ou Instagram, un annuaire qu'elle a rempli. On note l'adresse exacte de cette page (`url_source_email`) : elle est citée au pied du mail.
3. **Une offre liée à son métier** : un site internet pour son activité. Les trois points du mail parlent de son métier à elle.
4. **L'identité de l'expéditeur, la source de l'adresse et la désinscription en un clic** dans chaque mail. La route les ajoute elle-même : l'agent n'écrit jamais le pied du mail.
5. **La liste d'opposition** : une entreprise ou une adresse qui s'est désinscrite (ou qui a répondu « STOP ») ne reçoit plus jamais rien. La route la garde même si le prospect est effacé, et refuse tout ajout ou envoi qui la touche.
6. **On ne parle jamais d'IA**, ni d'outil automatique. C'est Alex qui écrit.
7. **Rien de faux** : la phrase personnelle dit seulement ce que le Repéreur a vraiment constaté. Pas de promesse de résultat (« plus de clients garantis »), pas de fausse urgence, pas de prix écrit à la main (le prix et la remise viennent de la configuration).

## L'offre du mail

- **-10 % sur la création du site seulement**, jamais sur le forfait.
- Un **code personnel** par prospect (par exemple `MAIL10-7KQ2`), créé au premier envoi, **accepté 30 jours** après l'envoi, jusqu'à la fin du 30e jour. Il se tape dans la case « Code promo » du configurateur ou de la page Commander. Une commande payée avec lui l'a utilisé.
- Une commande passée avec ce code (ou avec l'adresse e-mail du prospect) le marque « commande » tout seul.
- Le mail cite le prix du Site Essentiel et le prix réduit, calculés par la route. L'agent n'écrit aucun chiffre.

## Qui cibler

**Oui** : les entreprises actives, petites et indépendantes, **sans site internet**, ou avec un site cassé, abandonné ou illisible sur téléphone (le Repéreur dit lequel). D'abord les métiers de nos pages « Votre métier » (le poste du Repéreur les donne), puis d'autres TPE dont les clients cherchent sur internet avant d'acheter (coiffeurs, esthéticiennes, auto-écoles, serruriers, déménageurs, chauffagistes, restaurants, cavistes, salles de sport…).

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
| Trouver l'adresse e-mail | Ce que **l'entreprise publie elle-même** : sa fiche Google, sa page Facebook ou Instagram, un annuaire qu'elle a rempli (PagesJaunes, annuaire de la Chambre de métiers ou de commerce, de sa fédération, la liste des associations de sa mairie) | On note l'adresse exacte de la page (`url_source_email`) |

**Interdit** :

- deviner une adresse (`contact@`, `prenom.nom@`, `nom@gmail.com`), même si elle a l'air probable ;
- une adresse vue ailleurs que chez l'entreprise ou un annuaire qu'elle a rempli (un forum, une fuite, un document, un autre site qui la recopie) ;
- l'adresse personnelle d'un dirigeant, ou une adresse tirée de la liste des dirigeants ;
- un fichier acheté, loué ou échangé ;
- aspirer en masse un site qui l'interdit (ses conditions d'utilisation ou son fichier `robots.txt`) ; LinkedIn, jamais ;
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
| (automatique) | + 10 | Le métier a sa page chez nous : `metier_page` est le slug d'une page « Votre métier » |

**En dessous de 60 : écarté** (la route le garde quelques mois pour ne pas le retrouver, sans jamais lui écrire). Dans le doute sur un critère, on ne le coche pas.

## Le rythme

- Le quota : 20 envois par jour la première semaine, puis 20 de plus chaque semaine depuis le premier envoi, jusqu'à 150 (options `aled08_prospection_quota_depart` et `aled08_prospection_quota_max`). Les relances comptent.
- Au plus 30 envois par heure, en semaine de 8 h à 18 h (heure du site), et seulement quand le site et les ventes sont ouverts.
- Une seule relance, au moins 7 jours après le premier mail, tant que le code est valable. Puis plus rien.
- On ne relance jamais quelqu'un qui a répondu, s'est désinscrit ou a commandé. Les réponses arrivent dans la boîte d'Alex : il les note dans son espace (« A répondu », « Ne plus lui écrire »), ou le dit dans une conversation, qui appelle la route avec `faire: "repondu"` ou `"desinscrire"`.
- Le Repéreur ne garde pas plus de trois jours d'envois d'avance : le poste lui dit combien en trouver.

## Combien de temps on garde

Un prospect écarté s'efface après 180 jours ; un prospect sans suite, trois ans après le premier mail. La liste d'opposition, elle, reste toujours (des empreintes, jamais l'adresse en clair).

## Ce que les agents ne font jamais

- Écrire un mail eux-mêmes, en HTML ou avec un autre outil : seule la route envoie, avec le gabarit d'Alex.
- Écrire à une adresse qui n'a pas de source publiée par l'entreprise.
- Changer une option de la prospection (l'allumer, le quota) : c'est Alex.
- Promettre un prix, une remise ou un délai que la route n'a pas mis dans le mail.
- Répondre à un prospect : c'est Alex qui répond, depuis sa boîte.
