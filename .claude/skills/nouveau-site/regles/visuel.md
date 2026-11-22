# Le visuel du site

Le niveau minimum, validé par Alex, est celui des deux modèles :

- `docs/modeles/site-essentiel-mougiline.html` : le Site Essentiel.
- `docs/modeles/site-boutique-mougiline.html` : avec l'option e-commerce.

Chaque nouveau site atteint au moins ce niveau, avec son propre style et uniquement le contenu de son client.

## Avant de commencer

1. Regarde ce qui existe sur le site : pages créées par l'installation, thème actif, styles.
2. Fais la recherche du métier (voir `concurrents.md`) et choisis une direction.
3. Liste la matière fournie par le client : textes, prix, photos, logo, couleurs. Ce qui manque se demande, ou la partie est retirée.

## Une page longue et riche

Même le Site Essentiel est une page longue, découpée en parties qu'on fait défiler. Dans l'ordre :

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

Une partie sans matière est retirée ou marquée « bientôt ». S'il en manque trop, pose la question au client.

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

- Les couleurs, l'ambiance, le logo et les polices demandés par le client. S'il n'a rien précisé : une palette qui se distingue des sites du même métier tout en restant dans son esprit.
- Deux familles de polices au plus : une pour les titres, une pour le texte.
- Ses photos, bien cadrées. Sans photo : une même image de base partout, jamais une photo qui ferait croire à une réalisation du client.
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
