# Un site rapide et utilisable par tous

Un site lent ou difficile à utiliser perd des visiteurs avant qu'ils aient lu une ligne, et Google en tient compte. Sources dans `sources.md`.

## La vitesse : les trois mesures de Google

| Mesure | Ce qu'elle dit | Objectif |
|---|---|---|
| LCP | Le temps pour afficher le plus gros élément du haut de page | 2,5 secondes au plus |
| INP | Le temps de réaction quand on touche un bouton | 200 millisecondes au plus |
| CLS | Les sauts de mise en page pendant le chargement | 0,1 au plus |

Les mêmes seuils valent sur téléphone et sur ordinateur. Le point faible le plus courant est le LCP, presque toujours à cause de l'image du haut.

## Les images

- **L'image du haut de page** : dans le HTML de la page (une balise `img`, pas un fond en CSS), avec `fetchpriority="high"`, et **jamais** `loading="lazy"`.
- **Toutes les autres images** : `loading="lazy"` et `decoding="async"`.
- **Chaque image porte sa largeur et sa hauteur** (`width` et `height`) : la place est réservée, rien ne saute.
- **Le poids** : 1 600 px de large au plus. Environ 200 Ko pour l'image du haut, 150 Ko pour les autres. En WebP quand c'est possible, sinon en JPEG bien compressé.
- Une photo de téléphone de 5 Mo ne se pose jamais telle quelle : elle se réduit avant.

## Le reste de la vitesse

- **Deux familles de polices au plus**, avec `font-display: swap`, servies par le site lui-même. Pas d'appel à un service de polices extérieur (c'est aussi une question de vie privée, voir `legal.md`).
- **Pas de script lourd** : pas de carrousel automatique, pas de vidéo qui démarre seule, pas de bibliothèque d'animation. Les effets se font en CSS (`transform`, `opacity`).
- **Pas de contenu extérieur intégré** sans raison : une carte, une vidéo ou un fil de réseau social intégrés ralentissent la page et peuvent exiger un bandeau de consentement. À la place : un lien, ou une image cliquable.
- Les cadres qui se remplissent plus tard ont une taille réservée (`aspect-ratio` ou une hauteur minimale).

## L'accessibilité : les règles de base

Elles servent tout le monde : une personne malvoyante, quelqu'un en plein soleil, quelqu'un qui tient son téléphone d'une main.

**Lire**

- Le texte contraste assez avec son fond : rapport de **4,5 pour 1** au moins (3 pour 1 pour les gros titres et pour les icônes et bordures utiles). À vérifier **en clair et en sombre**, y compris le texte posé sur une photo ou une couleur pastel.
- Le texte courant fait au moins 16 px sur téléphone. Les champs de formulaire aussi (sinon l'iPhone zoome tout seul).
- Une information ne passe jamais par la couleur seule : un champ en erreur a aussi un message.

**Toucher**

- Tout ce qui se touche fait au moins **24 × 24 px**, avec de l'espace autour. Les boutons principaux visent 44 px de haut.
- Le site entier s'utilise au clavier : le menu, les questions fréquentes, le formulaire, le bouton soleil / lune. L'élément actif est toujours visible (un contour net).

**Comprendre**

- Un seul grand titre (`h1`) par page, puis des intertitres dans l'ordre.
- Chaque photo utile a un texte de remplacement (`alt`). Une image purement décorative a un `alt` vide.
- Chaque champ de formulaire a son intitulé visible, relié au champ.
- Les liens et les boutons disent où ils mènent : « Voir mes bougies », pas « Cliquez ici ».
- La page déclare sa langue (`lang="fr"`).
- Le bouton du menu dit s'il est ouvert ou fermé (`aria-expanded`), et les boutons sans texte ont un nom (`aria-label`).

**Le mouvement**

- Les animations s'arrêtent quand le visiteur demande moins d'animations (`prefers-reduced-motion`).
- Rien ne clignote, rien ne défile tout seul.

## Avec l'option e-commerce

Depuis le 28 juin 2025, une règle européenne demande que le commerce en ligne soit accessible. Les très petites entreprises en sont en principe dispensées, mais nous appliquons quand même les règles ci-dessus à toutes les boutiques : c'est mieux pour les clients, et ce point de droit reste à confirmer sur une source officielle avant de l'affirmer à un client.

## Vérifier

- Les quatre largeurs de téléphone (320, 360, 390, 430 px) : aucun défilement de côté.
- La page d'accueil, en clair puis en sombre : tout se lit.
- Au clavier (touche Tab) : on atteint tout, dans un ordre logique.
- Le poids des images du haut de page.
