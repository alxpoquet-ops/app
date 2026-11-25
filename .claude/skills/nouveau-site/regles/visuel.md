# Le visuel du site

Le niveau minimum, validé par Alex, est celui des deux modèles :

- `docs/modeles/site-essentiel-mougiline.html` : le Site Essentiel.
- `docs/modeles/site-boutique-mougiline.html` : avec l'option e-commerce.

Chaque nouveau site atteint au moins ce niveau, avec son propre style et uniquement le contenu de son client.

## Avant de commencer

1. Regarde ce qui existe sur le site : pages créées par l'installation, thème actif, styles.
2. Fais la recherche **dans le métier du client** (voir `concurrents.md`) : une marque connue du même métier donne l'exemple pour l'organisation du site.
3. Liste la matière fournie par le client : textes, prix, photos, logo, couleurs. Ce qui manque se demande, ou la partie est retirée.

## Une page longue et riche

Même le Site Essentiel est une page longue, découpée en parties qu'on fait défiler. Voici notre base. L'ordre des parties 3 à 10 et la façon de montrer les produits suivent l'exemple de la référence du métier (par exemple les produits avant les points forts, si c'est ce que fait la marque connue) :

1. **L'en-tête, collé en haut** : le nom, les liens vers chaque partie (celle qu'on lit s'allume), un bouton « Contact » toujours visible, le bouton soleil / lune.
2. **L'ouverture** : un titre fort, une phrase, deux boutons d'action (voir `conversion.md` pour le titre et les boutons).
3. **Les points forts** dans un cadre fixe aux couleurs du site, avec des icônes. Pas de bandeau qui défile en boucle.
4. **« Pourquoi choisir … »** : 3 ou 4 raisons avec icônes, tirées de la réponse du client.
5. **Ce que le client propose** : ses produits ou services, avec leurs prix s'il les a donnés, et un bouton « Commander » ou « Demander » sur chaque carte.
6. **Le produit vedette ou de saison**, s'il y en a un.
7. **« Comment ça se passe »** : les étapes, illustrées par des icônes (pas de numéros).
8. **La galerie** : ses photos.
9. **Où le trouver** : ville, zone, marchés et dates s'il en a donné.
10. **Les questions fréquentes** : 6 à 8 questions, réponses tirées uniquement du questionnaire.
11. **Le contact** : un formulaire court, dont le choix de demande se remplit selon le bouton cliqué.
12. **Le pied de page** : coordonnées, horaires s'ils sont donnés, liens, pages légales.

Une partie sans matière est retirée ou marquée « bientôt », et le résumé de livraison le dit au client.

## Jamais deux sites pareils

Décision d'Alex (25 novembre 2026) : **deux clients ne doivent jamais avoir le même site**, même s'ils font le même métier. La base ci-dessus garantit un site correct ; la forme change d'un client à l'autre.

1. **Regarde les derniers sites livrés.** Avant de dessiner, lis les empreintes des 15 derniers sites : `GET /aled08/v1/atelier/memoire` avec `{"type": "client", "q": "Empreinte", "limite": 15}`. Ton site doit différer d'eux sur au moins **quatre** des points ci-dessous, et de tout site du même métier sur au moins **cinq**.
2. **Inspire-toi de la concurrence du même métier** (`concurrents.md`) : regarde comment deux ou trois sites qui marchent dans ce métier placent leurs parties, montrent leurs photos et leurs produits, et choisis des formes qui conviennent à ce métier. On s'inspire, on ne copie jamais.
3. **Ce qui varie** (choisis une option par ligne, différente des sites récents) :
   - **L'ouverture** : grande photo plein écran avec le titre dessus ; photo d'un côté et texte de l'autre ; titre seul sur un fond de couleur avec une petite image ; mosaïque de 3 photos.
   - **L'ordre des parties 3 à 10** : par exemple les produits juste après l'ouverture, ou l'histoire du client d'abord, ou les avis et la zone avant les services. Seules restent fixes l'ouverture en premier, le contact et le pied de page à la fin.
   - **La forme des images** : coins très arrondis, coins droits, cercles, arches, cadres décalés, photos inclinées façon polaroïd, formes organiques.
   - **Les cartes** : en grille de 2 ou 3, en liste avec la photo à gauche, en grandes bandes alternées, en carrousel à faire défiler soi-même.
   - **Le fond des parties** : couleurs alternées, une seule couleur avec des séparations en vague, en diagonale ou droites, fonds texturés légers.
   - **Les titres** : centrés ou alignés à gauche, avec un petit sur-titre, un trait, un chiffre ou une icône.
   - **Les boutons** : ronds, carrés ou à bords doux ; pleins ou en contour.
   - **Les polices** : un autre couple titre / texte que les sites récents, toujours deux familles au plus.
   - **Les petits décors** : formes flottantes, motifs du métier (épis, feuilles, outils…), ou rien du tout pour un métier sobre.
4. **Toujours correct.** Varier ne veut jamais dire désordonner : le contact reste facile à trouver, tout reste lisible sur téléphone, contrasté, rapide, et chaque partie garde son contenu de la base. Dans le doute, on choisit la forme la plus claire.
5. **Note l'empreinte du site.** À la fin, enregistre ce que tu as choisi : `POST /aled08/v1/atelier/memoire` avec `{ "type": "client", "client": FICHE, "titre": "Empreinte du site : NOM", "texte": "métier : … ; ouverture : … ; ordre : … ; images : … ; cartes : … ; fonds : … ; titres : … ; boutons : … ; polices : … ; décors : …", "par": "constructeur" }`. Le contrôleur compare cette empreinte aux précédentes.

## Sur téléphone

- Un menu à trois traits qui se change en croix et ouvre un vrai panneau soigné : grands liens, chacun avec une petite icône dessinée dans l'esprit du métier (jamais de numéros), couleurs du site, un petit effet du métier, un bouton contact en bas. Jamais une simple liste grise.
- L'en-tête (nom, contact, panier, soleil / lune, trois traits) tient sur une ligne : boutons plus petits et nom plus court sous 440 px.
- Vérifie chaque page à **320, 360, 390 et 430 px** de large : rien ne dépasse à droite, aucun défilement de côté.
- Le pouce d'abord : les boutons importants sont larges et faciles à toucher (voir `vitesse-accessibilite.md`).

## Clair et sombre

- Toutes les couleurs sont des variables. Un jeu clair et un jeu sombre, appliqués selon `data-theme="light"` ou `data-theme="dark"` posé sur `<html>` par le connecteur.
- Le site s'ouvre en **clair**.
- En haut du site, un bouton rond avec un soleil (clair) et une lune (sombre), qui bascule avec une petite animation. Au clic il appelle `minisTheme('dark')` ou `minisTheme('light')` (fourni par le connecteur, qui garde le choix du visiteur).
- Le client choisit l'ouverture dans son espace (Mon compte › L'apparence de mon site).
- Vérifie les deux apparences : textes lisibles, cartes et boutons visibles, pas de blanc qui éblouit en sombre.

## Les petits effets flottants

En rapport avec le métier : flammes et gouttes de cire pour des bougies, pétales pour une fleuriste, bulles pour un savonnier.

- Posés dans les parties de la page (position absolue, ils défilent avec elle), jamais fixés à l'écran.
- Derrière le texte et loin de lui, discrets, qui bougent doucement.
- En CSS seulement (`transform`, `opacity`), arrêtés si le visiteur demande moins d'animations (`prefers-reduced-motion`).
- Plus doux en sombre.

## Les couleurs, les polices, les photos

- Les couleurs, l'ambiance, le logo et les polices demandés par le client. S'il n'a rien précisé : une palette dans l'esprit de son métier, mais à lui (pas la copie des couleurs de la référence).
- Deux familles de polices au plus : une pour les titres, une pour le texte.
- Ses photos, bien cadrées, partout où il en a donné.
- **Sans photo du client** (décision d'Alex, 22 novembre 2026) : de belles images libres de droits en rapport avec son métier, **pour l'ambiance seulement** : le haut de page, le fond d'une partie, la présentation.
  - Jamais dans les cartes de produits, la galerie ou une fiche produit, et jamais présentées comme ses créations : ces endroits attendent ses vraies photos (une carte sans photo porte une icône aux couleurs du site ; une galerie vide est retirée ou marquée « bientôt »).
  - Elles viennent d'une banque d'images dont la licence permet un usage commercial sans mention (Unsplash, Pexels, Pixabay), jamais du site d'un concurrent ni d'un moteur de recherche.
  - Elles sont copiées sur le site du client avec `atelier_image`, pas affichées depuis leur site d'origine.
  - Leur texte de remplacement décrit l'image, sans dire que c'est le travail du client.
  - Le résumé de livraison le dit : « Les images en place sont des images d'attente : remplacez-les par vos photos quand vous voulez, avec le bouton Modifier mon site moi-même. »
- Les icônes sont dessinées dans le même style sur tout le site.

## Avec l'option e-commerce

La boutique en plus du reste :

- les produits du questionnaire, avec leur prix et un bouton d'ajout au panier ;
- une fiche par produit (quantité, et un champ de personnalisation si le client en propose) ;
- un panier toujours accessible en haut, avec le nombre d'articles ;
- la page de commande.

Les frais de livraison, les moyens de paiement et les conditions de vente ne s'inventent pas : le client les ajoute depuis son espace (Ma boutique). Tant qu'ils manquent, la boutique reste en vitrine (voir `legal.md`).

## Où mettre le contenu

Le texte et les photos vont dans le **contenu des pages** (les blocs de la page), pas dans le modèle du thème. C'est ce qui permet au client de les changer lui-même avec « Modifier mon site moi-même ». Le thème porte la mise en page, les styles, l'en-tête, le menu et le pied de page.

## À ne pas faire

- Un gadget que le client n'a pas demandé (générateur, simulateur, aperçu à personnaliser).
- Un carrousel qui tourne tout seul, une vidéo qui démarre seule, une fenêtre qui s'ouvre toute seule.
- Un texte de remplissage, un texte [entre crochets], du « lorem ipsum ».
- Toucher aux comptes, aux mots de passe, aux moyens de paiement ou aux extensions.
