# Flore & Chenilles — site vitrine

Site pastel et élégant pour **Flore & Chenilles** : bouquets et décorations en fleurs éternelles
en fil chenille, faits main avec passion dans un atelier de Signy-l'Abbaye, dans les Ardennes
(Instagram : [@flore_et_chenilles](https://www.instagram.com/flore_et_chenilles/)).

Site statique : aucun serveur ni base de données, aucune dépendance à installer.
Il suffit d'héberger ces fichiers (GitHub Pages, Netlify, OVH…).

## Ce que contient le site

| Section | Contenu |
| --- | --- |
| **Accueil** | Diaporama de ses bouquets, logo, nouveauté mise en avant (bonsaï azalée) |
| **L'atelier** | Fait main avec passion dans les Ardennes, fils sélectionnés pour leur qualité et leur durabilité |
| **Comment ça se passe** | Les 4 étapes, du choix à la remise |
| **Mes créations** | 13 créations avec leurs vraies photos, leurs compositions et ses mots ; lien vers chaque publication Instagram ; bouton « Personnaliser ce bouquet » |
| **Votre bouquet à vous** | Compositeur interactif avec ses fleurs (lys, arum, pavot, gerbera, rose, tulipe, hortensia, tournesol, jonquille, feuillage), papier, ruban et petit mot |
| **Occasions** | Anniversaire, naissance, évènements, « merci la maîtresse » (fleur à 5 €), fleurs du souvenir sous cloche, juste parce que |
| **Livraison & retrait** | Retrait à l'atelier ; livraison dans un rayon de 20 km autour de Signy-l'Abbaye, puis 0,40 € par kilomètre supplémentaire |
| **Réseaux** | Mosaïque de publications Instagram, lien Facebook (à renseigner) |
| **FAQ & contact** | Questions fréquentes et formulaire qui prépare le message pour Instagram (ou l'e-mail) |

Le panier s'appelle « Ma sélection » : on y ajoute ses coups de cœur, puis on envoie une demande.
Le message de commande récapitule tout : créations, compositions, retrait ou livraison (avec la ville), date et coordonnées.

## D'où viennent les contenus

Les photos, les noms des bouquets, leurs compositions et les phrases entre guillemets viennent des
12 publications les plus récentes du compte Instagram (photos et images extraites de ses vidéos).
Instagram n'affiche pas les publications plus anciennes sans être connecté, et Facebook demande
une connexion : pour ajouter d'autres créations, il suffit de déposer leurs photos (voir plus bas).

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

- `products` : les créations (nom, photo, composition, ses mots, lien Instagram…) ;
- `price` : `null` affiche « Sur demande » ; mettez un nombre (`price: 45`) pour afficher un prix ;
  `quote: true` affiche « Sur devis » avec un bouton « Demander un devis » ;
- `delivery` : rayon de livraison (20 km) et prix au kilomètre supplémentaire (0,40 €) ;
- `contact.facebook` : **collez ici l'adresse de la page Facebook** pour afficher les boutons Facebook ;
- `contact.email` : ajoutez une adresse pour proposer « Envoyer par e-mail » ;
- `flowers`, `colors`, `papers`, `ribbons` : les fleurs et palettes du compositeur ;
- `occasions` : les cartes « pour chaque occasion » ;
- `reviews` : vos avis clients (la section n'apparaît que s'il y en a).

Les textes de présentation (accueil, atelier, FAQ…) se modifient directement dans `index.html`.

## Ajouter une création ou une photo

1. Déposez la photo (JPG, format portrait 4:5 idéalement, environ 800 px de large) dans `assets/photos/`.
2. Dans `data.js`, copiez un bloc de `products` et changez `id`, `name`, `image`, `desc`…
3. Pour la mosaïque, ajoutez une ligne dans `instagram.photos` avec `src`, `alt` et `url` (le lien de la publication).

## À compléter avant la mise en ligne

- [ ] Coller l'adresse de la page Facebook dans `contact.facebook`.
- [ ] Indiquer les prix connus (`price`) si vous souhaitez les afficher.
- [ ] Ajouter des mentions légales : elles sont obligatoires en France pour un site professionnel
      (nom ou raison sociale, SIRET, adresse, hébergeur).
- [ ] Une fois le site en ligne, remplacer dans `index.html` le chemin de `og:image` par son adresse complète
      (par exemple `https://alxpoquet-ops.github.io/app/assets/img/og-image.png`) pour de beaux aperçus de lien.

## Structure

```
index.html              la page
assets/css/style.css    la mise en forme (couleurs dans :root)
assets/js/data.js       le contenu modifiable
assets/js/flowers.js    le moteur d'illustrations (fleurs en fil chenille, en SVG)
assets/js/app.js        créations, sélection, compositeur, formulaires, animations
assets/photos/          ses photos et son logo
assets/fonts/           polices Fraunces et Jost, auto-hébergées (licence SIL OFL)
assets/img/             favicon, icône mobile, image de partage
```
