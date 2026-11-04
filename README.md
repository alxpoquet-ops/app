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
- `jar` : le bocal transparent proposé en option pour les fleurs à l'unité (5 €) ;
- `promo` : l'offre de lancement (pourcentage, date de début `from` et de fin `until`, au format AAAA-MM-JJ) ;
  mettez `percent: 0` pour l'arrêter plus tôt ;
- `critters` : `false` pour retirer les papillons et chenilles animés ;
- `blague` : `false` pour retirer la petite blague (le papillon en haut à gauche qui éclate au clic) ;
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

## À compléter avant la mise en ligne

- [ ] Activer le formulaire : envoyer un premier message depuis le site, puis cliquer sur « Activate Form »
      dans l'e-mail reçu sur floreetchenilles@gmail.com (voir plus haut).
- [ ] Coller l'adresse de la page Facebook dans `contact.facebook`.
- [ ] Ajouter des mentions légales : elles sont obligatoires en France pour un site professionnel
      (nom ou raison sociale, SIRET, adresse, hébergeur).
- [ ] Une fois le site en ligne, remplacer dans `index.html` le chemin de `og:image` par son adresse complète
      (par exemple `https://alxpoquet-ops.github.io/app/assets/img/og-image.png`) pour de beaux aperçus de lien.

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
```
