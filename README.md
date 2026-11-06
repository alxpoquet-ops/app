# Flore & Chenilles — site vitrine

Site pastel et élégant pour **Flore & Chenilles** : bouquets et décorations en fleurs éternelles
en fil chenille, faits main avec passion dans un atelier de Signy-l'Abbaye, dans les Ardennes
(Instagram : [@flore_et_chenilles](https://www.instagram.com/flore_et_chenilles/)).

Site statique : aucun serveur ni base de données, aucune dépendance à installer.
Il suffit d'héberger ces fichiers (GitHub Pages, Netlify, OVH…).

## Ce que contient le site

| Section | Contenu |
| --- | --- |
| **Accueil** | Diaporama de ses bouquets, logo, nouveauté mise en avant (bonsaï azalée), pastille « Offre de lancement −10 % », bandeau « fait main, fleurs éternelles, sans pollen, carte de vœux offerte… » |
| **L'atelier** | Fait main avec passion dans les Ardennes, fils sélectionnés pour leur qualité et leur durabilité |
| **Comment ça se passe** | Les 4 étapes, du choix à la remise |
| **Mes créations** | Les 63 créations, toutes en vente avec leur prix : bouquets (8 € par fleur ou prix fixé par Laurine, vase offert pour ceux présentés en vase), fleurs à l'unité (8 €, vignette « Bocal » : en option à +5 €, la fleur est fixée à l'intérieur d'un bocal transparent qui la protège), déco & cadeaux (théière 38 €, bonsaï 35 €, arrosoirs de lavande 31 €, petits pots de 12 à 18 €, boîte gâteau 15 €). Filtres, bouton « Voir plus », plusieurs photos par création, flèches (ou glisser du doigt) pour passer d'une création à l'autre, carte de vœux à écrire, lien vers la publication Instagram |
| **Le prix d'une fleur** | « Une fleur à 8 €, c'est… » du temps, des fils chenille, une tige de fer, du scotch de masquage, de la colle, du maquillage, un emballage et plein d'amour, avec la carte de vœux offerte |
| **Offre de lancement** | −10 % sur toutes les créations jusqu'au 4 janvier 2027 : prix barrés, remise déduite automatiquement du total et indiquée dans l'e-mail de commande ; l'offre disparaît toute seule après la date |
| **Papillons et chenilles** | Une quinzaine de petites bêtes animées un peu partout : chenilles qui se promènent (et parlent quand on clique dessus), une chenille qui dort dans la FAQ, papillons qui s'envolent quand on les approche, un papillon qui traverse l'écran de temps en temps et un autre qui apporte chaque création jusqu'au panier |
| **Votre bouquet à vous** | Compositeur interactif, avec son prix calculé (8 € par fleur, feuillage offert), avec ses fleurs (lys, arum, pavot, gerbera, rose, tulipe, hortensia, tournesol, jonquille, feuillage), emballé dans une pochette transparente avec un nœud, et sa carte de vœux personnalisée (pour, message, de la part de) |
| **Occasions** | Anniversaire, naissance, évènements, « merci la maîtresse » (fleurs à 8 €), une fleur en bocal pour fleurir une sépulture, juste parce que |
| **Livraison & retrait** | Retrait gratuit à l'atelier ; livraison 5 € jusqu'à 15 km et 10 € jusqu'à 25 km autour de Signy-l'Abbaye (ajoutée automatiquement au total), au-delà à voir ensemble |
| **Réseaux** | Mosaïque Instagram (dernières publications automatiques via Behold, sinon photos du site), lien Facebook (à renseigner) |
| **FAQ & contact** | Questions fréquentes et formulaire qui **envoie directement un e-mail** |

Le panier s'appelle « Ma sélection ». À la fin, la demande récapitule tout : créations, options, cartes de vœux,
retrait ou livraison (avec l'adresse), date et coordonnées, puis elle part **par e-mail**, sans passer par Instagram.
Aucun paiement n'est demandé sur le site : Laurine confirme le prix, la date et la remise.

Chaque création est emballée dans une **pochette transparente fermée d'un nœud**. Ce n'est pas une option :
le client choisit seulement ses fleurs et écrit sa **carte de vœux, offerte**.

## D'où viennent les contenus

Les noms des bouquets, leurs compositions et les phrases entre guillemets viennent du compte Instagram.
Les photos viennent d'Instagram et du dossier de photos de Laurine (dossier `assets/gallery/` :
une vignette `-s.webp` et une grande image `.webp` pour chaque photo).

## Recevoir les messages et les commandes par e-mail

Le formulaire de contact et la demande de commande envoient un e-mail grâce au service gratuit
[FormSubmit](https://formsubmit.co) : pas de compte à créer. Les messages arrivent sur
**floreetchenilles@gmail.com** (ligne `email` de la rubrique `contact` dans `assets/js/data.js`).

1. Pour changer d'adresse : modifiez la ligne `email`, puis changez le numéro `?v=` dans `index.html` (voir plus bas).
2. Une fois le site en ligne, envoyez un premier message de test depuis le formulaire de contact.
3. FormSubmit envoie alors un e-mail à cette adresse : cliquez sur **« Activate Form »**.
   Ce premier message sert seulement à l'activation.
4. C'est tout : chaque message et chaque commande arrivent ensuite directement dans la boîte mail.
   Pour répondre au client, il suffit de cliquer sur « Répondre ».

Bon à savoir :

- `showEmail: true` affiche aussi l'adresse sur le site (contact, pied de page). Mettez `false` pour la cacher.
- Pour ne pas laisser l'adresse dans le code, FormSubmit fournit après activation un identifiant
  aléatoire (« random string ») : il peut remplacer l'adresse dans `email`.
- Pour utiliser un autre service (Formspree…), collez son adresse dans `formEndpoint`.
- Tant qu'aucune adresse n'est renseignée, le site propose au visiteur de copier son message
  et de l'envoyer en message privé.

## Voir le site

**En ligne (recommandé) — GitHub Pages, gratuit :**

1. Sur GitHub, ouvrez le dépôt, puis **Settings → Pages**.
2. Dans *Build and deployment*, choisissez **Deploy from a branch**.
3. Sélectionnez la branche qui contient le site, dossier **/ (root)**, puis **Save**.
4. Une à deux minutes plus tard, le site est en ligne à l'adresse `https://alxpoquet-ops.github.io/app/`.

**Sur votre ordinateur :** double-cliquez sur `index.html`. Pour un rendu identique à la version en ligne
(polices comprises), lancez un petit serveur depuis ce dossier :

```bash
python3 -m http.server 8000
```

puis ouvrez <http://localhost:8000>.

## Modifier le contenu

Tout le contenu « vivant » est rassemblé dans **`assets/js/data.js`**, commenté en français :

- `unitPrice` : le prix d'une fleur (8 €), utilisé partout sur le site ;
- `count` (dans une création) : le nombre de fleurs du bouquet ; son prix est calculé tout seul
  (`count` × 8 €). `price: 35` donne un prix fixe. `gift: 'Vase offert'` ajoute la petite vignette sur la photo ;
  tout ce qui est dans un vase devient une **création unique** (vignette « Création unique », un seul exemplaire
  dans la sélection) ; `unique: false` l'enlève, `unique: true` l'ajoute à une autre création ;
- `jar` : le bocal transparent proposé en option pour les fleurs à l'unité (5 €) ;
- `promo` : l'offre de lancement (pourcentage, date de début `from` et de fin `until`, au format AAAA-MM-JJ) ;
  mettez `percent: 0` pour l'arrêter plus tôt ;
- `critters` : `false` pour retirer les papillons et chenilles animés ;
- `products` : les créations, dans l'ordre d'affichage (nom, catégorie, photos, description…) ;
- sans `price` ni `count`, une création est « sur demande » ;
- `delivery.zones` : les zones de livraison (5 € jusqu'à 15 km, 10 € jusqu'à 25 km) ;
- `packaging` : le texte de l'emballage (pochette transparente et nœud) ;
- `card.suggestions` : les idées de messages proposées pour la carte de vœux ;
- `contact.email` : l'adresse qui reçoit les messages (voir plus haut) ;
- `contact.facebook` : **collez ici l'adresse de la page Facebook** pour afficher les boutons Facebook ;
- `categories` : les filtres de la boutique (avec la phrase d'introduction des fleurs à l'unité) ;
- `flowers`, `colors` : les fleurs et couleurs du compositeur ;
- `occasions` : les cartes « pour chaque occasion » ;
- `reviews` : vos avis clients (la section n'apparaît que s'il y en a).

Les textes de présentation (accueil, atelier, FAQ…) se modifient directement dans `index.html`.

Après une modification de `style.css`, `app.js`, `flowers.js` ou `data.js`, changez le numéro
`?v=…` des quatre liens en haut de `index.html` (par exemple `?v=20261110`) : les visiteurs
chargeront aussitôt la nouvelle version au lieu d'une copie gardée en mémoire par leur navigateur.

## Ajouter une création

1. Pour une photo du dossier de Laurine : créez la vignette et la grande image dans `assets/gallery/`
   (`g151-s.webp`, environ 480 px de large, et `g151.webp`, environ 1200 px), puis écrivez `photo: 'g151'`.
   Pour une photo JPG classique : déposez-la dans `assets/photos/` (format portrait 4:5, environ 800 px
   de large) et écrivez `image: 'assets/photos/mon-bouquet.jpg'`.
2. Dans `data.js`, copiez une ligne de `products` et changez `id`, `name`, `category`, `photo`, `desc`…
3. D'autres photos de la même création : `more: ['g152', 'g153']`.

## Afficher automatiquement les dernières publications Instagram

La mosaïque « Sur les réseaux » peut se mettre à jour toute seule, grâce au service gratuit
[Behold](https://behold.so) (6 dernières publications, actualisées toutes les 24 h) :

1. Créez un compte gratuit sur behold.so.
2. Cliquez sur « Connect Instagram » et connectez le compte **@flore_et_chenilles**
   (il faut ses identifiants Instagram).
3. Créez un flux de type « JSON », puis copiez son adresse (« Feed URL »), qui ressemble à
   `https://feeds.behold.so/abc123`.
4. Collez-la dans `assets/js/data.js`, à la ligne `feedUrl: ''`, puis changez le numéro `?v=` dans `index.html`.

Tant que l'adresse est vide, ou si le service ne répond pas, les photos actuelles du site s'affichent.

## Référencement (SEO) : les pages d'entrée

En plus de la page du site, 96 pages de contenu servent de portes d'entrée depuis Google.
Elles renvoient toutes vers le site, mais le site ne les affiche pas dans son menu :

| Dossier | Pages |
| --- | --- |
| `creations/…/` | une page par création (photo, prix, composition, langage des fleurs, lien « Commander sur le site ») |
| `fleurs/…/` | rose, tulipe, lys, gerbera, pavot et coquelicot, arum, hortensia, tournesol, muguet, lavande, jonquille, marguerite, pensée |
| `occasions/…/` | cadeau maîtresse, fleur pour une sépulture, anniversaire, naissance, mariage, fête des mères, Saint-Valentin, remerciement, fête des grands-mères, Noël |
| `conseils/…/` | la fleur en fil chenille, l'entretien, le comparatif avec les fleurs séchées et stabilisées, les fleurs sans pollen, le prix d'un bouquet, composer son bouquet, 40 idées de messages pour la carte |
| `fleurs-eternelles-ardennes/`, `livraison-fleurs-signy-l-abbaye/` | les pages locales |
| `guide/` | le plan de toutes les pages |

Chaque page a son titre, sa description, son adresse de référence (canonical), son image de partage
et des données structurées pour Google (produit avec son prix, fil d'Ariane, article…).
`sitemap.xml` liste toutes les adresses. La page d'accueil décrit l'atelier comme un artisan fleuriste
de Signy-l'Abbaye. Un lien `…/#creation-<identifiant>` ouvre directement la fiche d'une création sur le site.

**Mettre les pages à jour.** Les pages sont fabriquées à partir de `assets/js/data.js` (créations, prix)
et de `tools/seo/content.js` (textes). Après une modification, lancez depuis le dossier du site :

```bash
node tools/seo/build.js
```

Si le site change d'adresse (nom de domaine), indiquez la nouvelle adresse :

```bash
SITE_URL=https://www.floreetchenilles.fr/ node tools/seo/build.js
```

**Faire connaître le site à Google.**

1. Ouvrez [Google Search Console](https://search.google.com/search-console), ajoutez une propriété
   « Préfixe d'URL » avec l'adresse `https://alxpoquet-ops.github.io/app/`, puis validez-la
   (méthode « Balise HTML » : envoyez-moi la balise, je l'ajoute à `index.html`).
2. Dans « Sitemaps », envoyez `sitemap.xml`. Google découvre alors toutes les pages.
3. Créez une fiche [Google Business Profile](https://www.google.com/business/) « Flore & Chenilles »
   (zone desservie : Signy-l'Abbaye et ses environs) : c'est ce qui compte le plus pour les
   recherches locales, comme « fleurs éternelles Ardennes ».
4. Bon à savoir : sur GitHub Pages, un fichier `robots.txt` n'est lu qu'à la racine d'un nom de domaine.
   Avec un nom de domaine à vous (par exemple floreetchenilles.fr), le `robots.txt` fourni
   fonctionne tel quel et le référencement en profite.

## Boutique en ligne avec WordPress (recommandé)

Le dossier [`wordpress/`](wordpress/README.md) contient la version WordPress + WooCommerce :

- le même site ;
- le paiement par carte et PayPal ;
- les commandes, le stock et les créations uniques ;
- les e-mails ;
- l’import en un clic des 63 créations et des 36 pages de contenu.

Elle s’installe sur o2switch en suivant le [guide pas à pas](wordpress/README.md). Les deux fichiers à
téléverser sont dans `wordpress/dist/`. Pour les refaire après une modification du site :

```bash
node tools/wordpress/build.js
```

La section suivante concerne l’autre possibilité : mettre en ligne le site statique tel quel, sans
paiement en ligne.

## Héberger le site sur o2switch

Le site n'a besoin que d'un hébergement web classique : o2switch convient parfaitement.
L'hébergement récupère lui-même le site sur GitHub (le dépôt est public) : aucun mot de passe
n'est à transmettre. Trois fichiers s'en occupent :

| Fichier | Rôle |
| --- | --- |
| `.cpanel.yml` | indique à cPanel comment mettre le site en ligne (bouton « Deploy HEAD Commit ») |
| `tools/o2switch/deploy.sh` | copie les fichiers du site dans `public_html` (sans les outils ni le README) ; retire les pages supprimées, sans toucher aux autres fichiers |
| `tools/o2switch/update.sh` | pour une tâche cron : récupère les nouveautés de GitHub et remet le site à jour s'il y en a |
| `.htaccess` | site en https et sans « www », pages compressées, mise en cache des images, du style et des scripts |

**Première installation (une seule fois, dans cPanel).**

1. **Git™ Version Control** › **Create** : cochez « Clone a Repository », puis
   - Clone URL : `https://github.com/alxpoquet-ops/app.git`
   - Repository Path : `repositories/app`
   - Repository Name : `app`
2. **Manage** › onglet « Basic Information » › « Checked-Out Branch » : choisissez
   `claude/fervent-lamport-uzm5xw`, puis **Update**.
3. Onglet « Pull or Deploy » › **Deploy HEAD Commit** : le site est copié dans `public_html`.
4. **Mises à jour automatiques** : **Tâches Cron** › « Toutes les 15 minutes », commande :

   ```bash
   /bin/bash $HOME/repositories/app/tools/o2switch/update.sh > /dev/null 2>&1
   ```

   Chaque modification publiée sur GitHub arrive ensuite sur o2switch en 15 minutes au plus.
   Sans tâche cron, il suffit de cliquer sur « Update from Remote » puis « Deploy HEAD Commit ».
5. **Certificat https** : il est créé automatiquement par o2switch (outil « Let's Encrypt » ou
   « SSL/TLS Status » dans cPanel) dès que le nom de domaine pointe vers l'hébergement.

Pour un nom de domaine supplémentaire dont le dossier n'est pas `public_html`, donnez le dossier
en argument : `.../deploy.sh /home/identifiant/floreetchenilles.fr` (et de même pour `update.sh`).

**Passer à votre nom de domaine.** Les adresses de référence (canonical, sitemap, robots.txt,
image de partage, données structurées de la page d'accueil) se changent en une commande :

```bash
SITE_URL=https://floreetchenilles.fr/ node tools/seo/build.js
```

La copie sur GitHub Pages peut rester en ligne : ses pages indiquent alors à Google que l'adresse
officielle est celle du nom de domaine.

## À compléter avant la mise en ligne

- [ ] Activer le formulaire : envoyer un premier message depuis le site, puis cliquer sur « Activate Form »
      dans l'e-mail reçu sur floreetchenilles@gmail.com (voir plus haut).
- [ ] Coller l'adresse de la page Facebook dans `contact.facebook`.
- [ ] Ajouter des mentions légales : elles sont obligatoires en France pour un site professionnel
      (nom ou raison sociale, SIRET, adresse, hébergeur : o2switch).
- [ ] Installer le site sur o2switch et passer au nom de domaine (voir « Héberger le site sur o2switch »).
- [ ] Déclarer le site dans Google Search Console et envoyer `sitemap.xml` (voir « Référencement »).

## Structure

```
index.html              la page
assets/css/style.css    la mise en forme (couleurs dans :root)
assets/js/data.js       le contenu modifiable
assets/js/flowers.js    le moteur d'illustrations (fleurs en fil chenille, pochette, carte, en SVG)
assets/js/app.js        créations, sélection, compositeur, cartes de vœux, envoi des e-mails, animations
assets/photos/          ses photos (JPG) et son logo
assets/gallery/         les photos de Laurine (vignettes et grandes images WebP)
assets/fonts/           polices Fraunces et Jost, auto-hébergées (licence SIL OFL)
assets/img/             favicon, icône mobile, image de partage
assets/css/pages.css    la mise en forme des pages de contenu
.htaccess, .cpanel.yml  réglages et mise en ligne sur o2switch
tools/o2switch/         scripts de mise en ligne sur o2switch (site statique)
tools/wordpress/        fabrique le thème et l'extension WordPress (wordpress/dist/*.zip)
wordpress/              la version WordPress + WooCommerce et son guide d'installation
tools/seo/              le générateur des pages de contenu (build.js) et leurs textes (content.js)
creations/ fleurs/ occasions/ conseils/ guide/ …   les pages de contenu générées
sitemap.xml robots.txt  le plan du site pour les moteurs de recherche
```
