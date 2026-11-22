# Poser une question, livrer, annoncer

Tout passe par les-minis-monstres.fr (outils WordPress « Mini monstres »). Les e-mails au client partent tout seuls : tu n'as rien d'autre à envoyer.

## Les étapes d'une commande dans l'atelier

Depuis le 22 novembre 2026, un site passe par deux agents : le constructeur le fait, le contrôleur le relit et le livre (`organisation.md`).

`wp_rest_write` sur `/aled08/v1/atelier/chantier`, avec `{ "commande": ID, "faire": "…" }` :

| `faire` | Qui | Quand | Ce qui se passe |
|---|---|---|---|
| `question` + `texte` | Le constructeur | Seulement si l'essentiel manque (voir ci-dessous) | Le client reçoit un e-mail et répond dans son espace (onglet « Ma commande ») |
| `note` + `texte` (+ `etat`: `visuel`) | Le constructeur | Il commence le site, ou quelque chose bloque | Une ligne dans le journal de la commande |
| `a_controler` + `resume`, `lien`, `texte` | Le constructeur | Le site est fini et relu | Le site part au contrôle. Rien n'est envoyé au client |
| `corriger` + `texte` | Le contrôleur | Un défaut | Le site repart chez le constructeur, avec la liste des corrections |
| `livrer` + `texte` | Le contrôleur | Tout est bon | La commande passe en ligne, le client reçoit « Votre site est en ligne », Alex reçoit « Site livré (V1) » |
| `pour_alex` + `texte` | L'un ou l'autre | Un cas de `escalade.md` | Alex reçoit « À voir par vous », le travail attend |

`livrer` est refusé tant que le site n'est pas passé par `a_controler`.

## Question ou livraison : selon ce qui manque

Décision d'Alex (22 novembre 2026). Le site est promis en quelques heures : on ne fait pas attendre un client pour un détail.

**On pose une question avant de livrer seulement si l'essentiel manque :**

- ce qu'il vend ou ce qu'il fait ;
- sa ville ou sa zone ;
- comment ses clients le joignent ou lui achètent ;
- ou une vraie contradiction, qui obligerait à écrire quelque chose de faux (deux prix différents pour le même produit, par exemple).

**Dans tous les autres cas, on livre tout de suite** avec ce qu'on a (il manque ses horaires, les étapes d'une commande, des photos, des avis, un prix…). Les parties sans matière sont retirées ou marquées « bientôt », et le résumé de livraison liste ce qu'il reste à envoyer. Le client complète ensuite lui-même, ou nous le demande.

**Quand il faut vraiment poser une question :**

- Toutes les questions en un seul message, court, simple, numéroté.
- Jamais plus de deux séries de questions par commande. Au-delà, on livre avec ce qu'on a.
- Si le site n'est pas encore installé ou relié : on peut poser la question, puis on attend.

Pour mémoire, le questionnaire demande déjà : la ville et la zone, pourquoi on le choisit, des avis de clients, comment ses clients achètent, l'envoi, la personnalisation, les étapes d'une commande, l'offre vedette, les marchés et leurs dates, les questions fréquentes, les villes visées, les recherches Google de ses clients, le lien de sa fiche Google, un site dont le style lui plaît, ses photos, ses prix et ce qu'ils comprennent, le nom et l'adresse pour les mentions légales.

## Remettre le site au contrôle, puis le livrer

Après avoir passé lui-même toute la liste de `controle-qualite.md`, **le constructeur** envoie `faire: "a_controler"` avec :

- **`resume`** : le contenu du site expliqué au client (voir plus bas). Obligatoire.
- **`lien`** : l'adresse du site, en https.
- **`texte`** : sa note pour le contrôle et pour Alex. Ce qui est fait, la référence du métier choisie et ce qu'on a repris de son organisation, ce qu'il a décidé seul, les images d'attente, les pages de conseils écrites, ce qui reste à compléter.
- **`pages_total`** et **`pages_google`** : quand le site a des pages de visibilité Google ou l'option e-commerce. Le total des pages, et celles faites pour Google (pages produits ou services, pages locales, conseils, questions fréquentes).
- **`articles`** : avec l'option e-commerce, le nombre d'articles mis dans la boutique.

**Le contrôleur** relit tout, puis envoie `faire: "livrer"` avec son verdict dans `texte` (ou `corriger`).

L'e-mail « Votre site est en ligne » dit en haut que c'est une **V1** : le client peut la modifier lui-même (« Modifier mon site moi-même ») ou nous la faire modifier (« Mes modifications »). Il présente le contenu en cartes pastel avec les petits monstres, et rappelle que tout se règle depuis l'application.

## Le résumé pour le client (`resume`)

Vouvoiement, simple, rien d'inventé.

1. **Une ligne par partie ou par page**, qui commence par « - » et dit ce qu'elle contient avec ses vraies informations (prix, points forts, étapes, villes…). Une ligne « - Titre (N pages) : détail » met le titre en gras.
2. Une ligne sur le menu du téléphone et le bouton soleil / lune.
3. S'il y a des pages de conseils : une ligne qui les nomme, et invite le client à les relire et à demander toute correction depuis « Mes modifications ».
4. Enfin, **sans tiret**, ce qui s'affichera dans la carte « À ajouter quand vous pourrez » :
   - « À ajouter depuis votre espace client quand vous pourrez : … » avec ce qui manque (photos, avis de clients, horaires, dates, réseaux…), et, s'il y en a, la phrase sur les images d'attente à remplacer ;
   - « Pour être mieux trouvé sur Google, de votre côté : … » avec les conseils de `google.md` (fiche Google, avis).

## Les pages de visibilité Google commandées après coup

1. `wp_rest_read` sur `/aled08/v1/atelier/pages-google` : chaque ligne donne `demande`, `etat`, `role`, `site`, `site_relie`, `sujet` (choisi par Mirette, ou « sujet à choisir »), `idees_du_client`, `questionnaire`, `entre_agents`.
2. **Le constructeur** écrit la page **en brouillon** sur le site du client (règles : `google.md`), puis l'envoie au contrôle : `wp_rest_write` sur `/aled08/v1/atelier/page-google` avec `{ "demande": N, "faire": "a_controler", "titre": "…", "page": NUMÉRO, "texte": "…" }`.
3. **Le contrôleur** la relit. Bonne : il la publie, ajoute le lien depuis la page indiquée, puis `{ "demande": N, "faire": "valider", "lien": "https://…" }`. Sinon : `{ "demande": N, "faire": "corriger", "texte": "…" }`.
4. Quand toutes les pages d'une même commande sont validées, le client reçoit « Vos pages Google sont en ligne » avec la liste et les liens, et Alex un court e-mail.

Un site pas encore relié (`site_relie` faux) : on passe, on reviendra.

## Les modifications demandées par les clients

`wp_rest_read` sur `/aled08/v1/atelier/demandes`, puis `wp_rest_write` sur `/aled08/v1/atelier/demande` avec `{ "demande": N, "faire": "…" }` :

| `faire` | Qui | Ce qui se passe |
|---|---|---|
| `commencer` | Le constructeur | Le client voit que Bricou s'en occupe |
| `a_controler` + `texte` | Le constructeur | La modification part au contrôle (`texte` : la page, avant, après) |
| `corriger` + `texte` | Le contrôleur | Elle repart chez le constructeur |
| `faite` + `texte` | Le contrôleur | Le client reçoit « Votre modification est en ligne », avec le petit mot de `texte` |
| `pour_alex` + `texte` | L'un ou l'autre | Alex reçoit « À voir par vous », le client voit que sa demande a besoin de son regard |

## Un client déjà installé, sans commande dans l'atelier

`wp_rest_write` sur `/aled08/v1/atelier/livraison` avec `{ fiche (numéro du compte client), type, resume, pages_total, pages_google, pages_formule, articles, forfait, offerts }` envoie le même e-mail « Votre site est en ligne ».

- Par défaut, c'est un **aperçu envoyé à Alex seulement**.
- Au client : seulement avec `apercu: false` et `accord_alex: true`, quand Alex a dit « OK ».
- `pages_formule` : les pages payées par le client. Au-delà, l'e-mail dit « Les X pages en plus vous sont offertes par les Minis Monstres ».
- `forfait` : le nom de son forfait, qui titre la carte « Votre forfait ».
- `offerts` : `[[libellé, prix], …]` affiche une carte « Offert par les Minis Monstres », chaque prix barré puis « Offert ».

## Si quelque chose bloque

Une erreur passagère : écris-le avec `faire: "note"` et laisse ce travail pour le prochain passage. La même erreur au passage suivant : c'est un cas pour Alex (`escalade.md`). On ne remet jamais au contrôle, et on ne livre jamais, un site qu'on n'a pas pu relire en ligne.
