# Les extensions d'installation des sites clients

Une extension par type de site. On la met sur le WordPress tout neuf du client, on l'active, et tout se prépare tout seul. Il ne reste que le visuel.

| Fichier | Type de site | Ce qui est posé |
|---|---|---|
| `minis-site-essentiel.zip` | Site Essentiel | Une page unique (présentation, services, contact), mentions légales, confidentialité |
| `minis-site-visibilite.zip` | Site Visibilité | Accueil, services, réalisations, à propos, questions fréquentes, contact, mentions légales, confidentialité |
| `minis-site-boutique.zip` | Site Boutique | Le Site Visibilité, plus WooCommerce réglé pour la France, Stripe, PayPal et les conditions générales de vente |

## Comment s'en servir

1. Dans le WordPress du client : Extensions › Ajouter › Téléverser, choisir le fichier, installer, activer.
2. La page « Minis Monstres » s'ouvre et fait tout, étape par étape. Chaque ligne passe au vert.
3. Suivre « Ce qu'il reste à faire » en bas de cette page : le visuel.

## Le lien avec l'espace client se fait tout seul

À la fin de l'installation, le site envoie son adresse et sa clé à les-minis-monstres.fr, qui le rappelle pour vérifier que c'est bien lui.

- Si une fiche client porte déjà cette adresse (c'est le cas après une commande avec nom de domaine), le site est relié aussitôt.
- Sinon il attend : dès que l'adresse est mise dans la fiche du client, il est relié, sans clé à recopier.
- Sur une adresse provisoire ou sans https, le lien ne se fait pas : relancer l'installation une fois le site sur son adresse définitive.

Un e-mail prévient Alex dans les deux premiers cas.

## Ce que chaque extension fait, dans les trois cas

- Réglages : français, heure de Paris, adresses de page lisibles, commentaires fermés.
- Ménage : l'article, la page et l'extension d'exemple de WordPress.
- Extensions maison : le connecteur (lien avec l'espace client, sa clé est créée) et la mention « Site fait par ».
- Extensions de wordpress.org : Easy MCP AI, Rank Math SEO, Converter for Media, Contact Form 7.
- Un formulaire de contact en français, les pages avec des textes [entre crochets] à remplacer, le menu.

Relancer l'installation ne casse rien : ce qui existe déjà est gardé.

## D'où elles viennent

Le code est dans `src/wordpress/minis-site/`. Les trois archives sont refabriquées par `python3 scripts/wp-export.py --sans-sdk`, qui les recopie ici avec la dernière version du connecteur.

## La pose toute seule sur o2switch

Quand le jeton cPanel d'o2switch est réglé sur les-minis-monstres.fr, plus besoin de mettre l'extension à la main : après une commande, le nom de domaine est acheté chez OVH et pointé vers o2switch, puis le site se pose tout seul.

1. Le domaine est ajouté sur l'hébergement o2switch, avec le https.
2. Une base de données est créée, WordPress est installé en français.
3. L'extension du type commandé se pose et déroule son installation.
4. Le site se relie à l'espace client, et le fichier de pose s'efface.

Les identifiants du WordPress sont rangés dans la note interne de la commande. Si une étape échoue quatre fois, la pose s'arrête, Alex reçoit un e-mail, et il reste la méthode à la main ci-dessus.

Le code : `src/wordpress/aled08-espace/includes/pose.php` et `src/wordpress/aled08-espace/pose/minis-pose.php`. Réglage : Les Minis Monstres › Réglages, case « Poser le site tout seul sur o2switch ».
