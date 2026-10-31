# Flore & Chenilles — site vitrine & boutique

Site pastel, doux et élégant pour **Flore & Chenilles**, atelier de bouquets de fleurs en fil chenille
(Instagram : [@flore_et_chenilles](https://www.instagram.com/flore_et_chenilles/)).

Site statique : aucun serveur ni base de données, aucune dépendance à installer.
Il suffit d'héberger ces fichiers (GitHub Pages, Netlify, OVH…).

## Ce que contient le site

| Section | Contenu |
| --- | --- |
| **Accueil** | Grand bouquet animé (les fleurs « éclosent » au chargement), pétales qui tombent, papillons, badge tournant « fait main », raccourci vers la nouveauté |
| **L'atelier** | Présentation, valeurs (fait main, éternelles, sans pollen, sur mesure) |
| **Comment ça se passe** | Les 4 étapes, de l'idée au bouquet |
| **Boutique** | 9 créations filtrables, fiche détaillée avec choix de couleur (l'illustration change de couleur), quantité, panier |
| **Votre bouquet à vous** | Compositeur interactif : couleur, fleurs une à une, papier, ruban, petit mot sur une étiquette ; aperçu animé en direct, prix calculé, bouton « Surprise », lien de partage du bouquet |
| **Occasions** | Anniversaire, naissance, mariage… chaque carte pré-remplit le compositeur |
| **Instagram** | Mosaïque reliée au compte |
| **FAQ** | Questions fréquentes (accordéon) |
| **Contact** | Formulaire qui prépare le message et l'envoie via Instagram (ou e-mail) |

Petits plus : une chenille qui avance en haut de l'écran au fil de la lecture (et se retourne quand on remonte),
le panier mémorisé dans le navigateur, une version mobile soignée, l'accessibilité au clavier,
et le respect du réglage « réduire les animations ».

## Voir le site

**En ligne (recommandé) — GitHub Pages, gratuit :**

1. Sur GitHub, ouvrez le dépôt, puis **Settings → Pages**.
2. Dans *Build and deployment*, choisissez **Deploy from a branch**.
3. Sélectionnez la branche qui contient le site (par exemple `main` après fusion), dossier **/ (root)**, puis **Save**.
4. Une à deux minutes plus tard, le site est en ligne à l'adresse `https://alxpoquet-ops.github.io/app/`.

Vous pouvez ensuite y brancher un nom de domaine (par exemple `floreetchenilles.fr`) depuis la même page.

**Sur votre ordinateur :** double-cliquez sur `index.html`. Tout fonctionne, mais certains navigateurs
bloquent les polices quand le fichier est ouvert hors ligne. Pour un rendu identique à la version en ligne,
lancez un petit serveur depuis ce dossier :

```bash
python3 -m http.server 8000
```

puis ouvrez <http://localhost:8000>.

## Modifier le contenu

Tout le contenu « vivant » est rassemblé dans **`assets/js/data.js`**, commenté en français :

- `products` : les créations de la boutique (nom, prix, description, couleurs proposées…) ;
- `flowers` : les fleurs du compositeur et leur prix à l'unité ; `builder.basePrice` : le prix papier + ruban + carte ;
- `colors`, `papers`, `ribbons` : les palettes ;
- `occasions` : les cartes « idées cadeaux » ;
- `contact.email` : ajoutez votre adresse pour afficher le bouton « Envoyer par e-mail » ;
- `reviews` : vos avis clients (la section ne s'affiche que s'il y en a).

Les textes de présentation (accueil, atelier, FAQ…) se modifient directement dans `index.html`.

> ⚠️ Les prix, compositions et textes actuels sont des **propositions de départ** :
> pensez à les ajuster à votre catalogue réel avant la mise en ligne.

## Ajouter vos vraies photos

Les visuels actuels sont des illustrations dessinées en SVG dans l'esprit « fil chenille ».
Pour les remplacer par vos photos :

1. Déposez vos images (JPG ou WebP, environ 1200 px de large) dans `assets/photos/`.
2. Dans `data.js`, ajoutez `image: 'assets/photos/mon-bouquet.jpg'` au produit concerné.
3. Pour la mosaïque Instagram, remplissez `instagram.photos` :
   `{ src: 'assets/photos/insta-1.jpg', alt: 'Bouquet de tulipes rose poudré' }`.

## Commandes et messages

Le site n'encaisse pas de paiement : c'est voulu, pour rester simple.
Le panier et le formulaire de contact **préparent un message** (récapitulatif complet de la commande,
composition détaillée des bouquets personnalisés, coordonnées du client) puis :

- **Instagram** : le message est copié et la conversation privée avec `@flore_et_chenilles` s'ouvre ;
  le client n'a plus qu'à coller et envoyer ;
- **E-mail** (si `contact.email` est renseigné) : la messagerie du client s'ouvre avec le message prêt ;
- **Formulaire en ligne** (optionnel) : créez un formulaire gratuit sur [Formspree](https://formspree.io)
  et collez son adresse dans `contact.formEndpoint` pour recevoir les messages directement par e-mail.

## À compléter avant la mise en ligne

- [ ] Vérifier les prix et descriptions dans `data.js`.
- [ ] Ajouter vos photos (voir plus haut).
- [ ] Renseigner votre e-mail dans `contact.email` (facultatif).
- [ ] Ajouter des mentions légales : elles sont obligatoires en France pour un site professionnel
      (nom ou raison sociale, SIRET, adresse, hébergeur), ainsi que des conditions générales de vente si vous vendez en ligne.
- [ ] Une fois le site en ligne, remplacer dans `index.html` le chemin de `og:image` par son adresse complète
      (par exemple `https://alxpoquet-ops.github.io/app/assets/img/og-image.png`) pour de beaux aperçus de lien.

## Structure

```
index.html              la page
assets/css/style.css    la mise en forme (couleurs dans :root)
assets/js/data.js       le contenu modifiable
assets/js/flowers.js    le moteur d'illustrations (fleurs en fil chenille, en SVG)
assets/js/app.js        boutique, panier, compositeur, formulaires, animations
assets/fonts/           polices Fraunces et Jost, auto-hébergées (licence SIL OFL)
assets/img/             favicon, icône mobile, image de partage
assets/photos/          vos photos
```
