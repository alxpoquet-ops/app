# Poser une question, livrer, annoncer

Tout passe par les-minis-monstres.fr (outils WordPress « Mini monstres »). Les e-mails au client partent tout seuls : tu n'as rien d'autre à envoyer.

## Les étapes d'une commande dans l'atelier

`wp_rest_write` sur `/aled08/v1/atelier/chantier`, avec `{ "commande": ID, "faire": "…" }` :

| `faire` | Quand | Ce qui se passe |
|---|---|---|
| `question` + `texte` | Le questionnaire est incomplet, flou ou contradictoire | Le client reçoit un e-mail et répond dans son espace (onglet « Ma commande ») |
| `note` + `texte` (+ `etat`: `visuel`) | Tu commences le visuel, ou quelque chose bloque | Une ligne dans le journal de la commande |
| `livrer` + `texte`, `resume`, `lien` | Le site est prêt et relu | La commande passe en ligne, le client reçoit « Votre site est en ligne », Alex reçoit « Site livré (V1) » |
| `a_verifier` | Seulement si Alex a demandé à voir le site avant | Alex reçoit le site à vérifier, rien ne part au client |

## Poser une question au client

- **Toutes les questions en un seul message**, court, simple, numéroté.
- Seulement ce qui manque ou reste flou. Le questionnaire demande déjà : la ville et la zone, pourquoi on le choisit, comment ses clients achètent, l'envoi, la personnalisation, les étapes d'une commande, l'offre vedette, les marchés et leurs dates, les questions fréquentes, ce que contient chaque prix, l'adresse des mentions légales, les villes visées et les recherches Google de ses clients.
- **Jamais plus de deux séries de questions** par commande. Au-delà, on fait avec ce qu'on a : les parties sans matière sont retirées ou marquées « bientôt ».
- Si le site n'est pas encore installé ou relié : on peut poser les questions, puis on attend.

## Livrer la V1

Après le contrôle complet (`controle-qualite.md`), envoie `faire: "livrer"` avec :

- **`texte`** : une note courte pour Alex. Ce qui est fait, la direction choisie après la recherche sur les concurrents, ce que tu as décidé seul, les pages de conseils écrites, ce qui reste à compléter.
- **`resume`** : le contenu du site expliqué au client (voir plus bas). Obligatoire.
- **`lien`** : l'adresse du site, en https.
- **`pages_total`** et **`pages_google`** : quand le site a des pages de visibilité Google ou l'option e-commerce. Le total des pages, et celles faites pour Google (pages produits ou services, pages locales, conseils, questions fréquentes).
- **`articles`** : avec l'option e-commerce, le nombre d'articles mis dans la boutique.

L'e-mail « Votre site est en ligne » dit en haut que c'est une **V1** : le client peut la modifier lui-même (« Modifier mon site moi-même ») ou nous la faire modifier (« Mes modifications »). Il présente le contenu en cartes pastel avec les petits monstres, et rappelle que tout se règle depuis l'application.

## Le résumé pour le client (`resume`)

Vouvoiement, simple, rien d'inventé.

1. **Une ligne par partie ou par page**, qui commence par « - » et dit ce qu'elle contient avec ses vraies informations (prix, points forts, étapes, villes…). Une ligne « - Titre (N pages) : détail » met le titre en gras.
2. Une ligne sur le menu du téléphone et le bouton soleil / lune.
3. S'il y a des pages de conseils : une ligne qui les nomme, et invite le client à les relire et à demander toute correction depuis « Mes modifications ».
4. Enfin, **sans tiret**, ce qui s'affichera dans la carte « À ajouter quand vous pourrez » :
   - « À ajouter depuis votre espace client quand vous pourrez : … » avec ce qui manque (photos, avis de clients, dates, réseaux, adresse des mentions légales…) ;
   - « Pour être mieux trouvé sur Google, de votre côté : … » avec les conseils de `google.md` (fiche Google, avis).

## Les pages de visibilité Google commandées après coup

1. `wp_rest_read` sur `/aled08/v1/atelier/pages-google` : chaque ligne donne `demande`, `site`, `site_relie`, `sujet` (choisi par Mirette, ou « sujet à choisir »), `idees_du_client` et `questionnaire`.
2. Écris la page sur le site du client et mets-la en ligne (règles : `google.md`).
3. Relis-la en ligne, puis déclare-la : `wp_rest_write` sur `/aled08/v1/atelier/page-google` avec `{ "demande": N, "titre": "…", "lien": "https://…" }`.
4. Quand toutes les pages d'une même commande sont déclarées, le client reçoit « Vos pages Google sont en ligne » avec la liste et les liens, et Alex un court e-mail.

Un site pas encore relié (`site_relie` faux) : on passe, on reviendra.

## Un client déjà installé, sans commande dans l'atelier

`wp_rest_write` sur `/aled08/v1/atelier/livraison` avec `{ fiche (numéro du compte client), type, resume, pages_total, pages_google, pages_formule, articles, forfait, offerts }` envoie le même e-mail « Votre site est en ligne ».

- Par défaut, c'est un **aperçu envoyé à Alex seulement**.
- Au client : seulement avec `apercu: false` et `accord_alex: true`, quand Alex a dit « OK ».
- `pages_formule` : les pages payées par le client. Au-delà, l'e-mail dit « Les X pages en plus vous sont offertes par les Minis Monstres ».
- `forfait` : le nom de son forfait, qui titre la carte « Votre forfait ».
- `offerts` : `[[libellé, prix], …]` affiche une carte « Offert par les Minis Monstres », chaque prix barré puis « Offert ».

## Si quelque chose bloque

Une erreur qui se répète, un site injoignable : écris-le avec `faire: "note"` et arrête-toi pour ce site. Ne livre jamais un site que tu n'as pas pu relire en ligne.
