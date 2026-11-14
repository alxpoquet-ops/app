# ALED08 : site internet

Site d'**ALED08** : des sites internet à petit prix, pensés pour Google, avec un espace client pour les modifier grâce à l'IA.

- **Création** : une page 150 €, vitrine 250 €, boutique 450 €, en une fois ou lissée sur 2 ans.
- **Forfaits** : Chico 5 €/mois (hébergement, domaine, sauvegardes, mises à jour, 1 modification par mois), Power 20 €/mois (+ SEO, rapport mensuel, 1 modification par semaine). À l'année : 2 mois offerts.
- **Options** : e-mail pro, traduction. Les modifications sont faites par moi, sur demande depuis l'espace client.

Site **statique**, rapide, sans base de données : un petit générateur Node.js (sans aucune dépendance) produit toutes les pages HTML dans `dist/`.

---

## Pages

| Rubrique | Adresse | Contenu |
|---|---|---|
| Accueil | `/` | Promesse, types de site, forfaits, espace client, SEO, comparaison avec Shopify |
| Créer mon site | `/creer-mon-site/` | **Configurateur** : type de site, nom de domaine vérifié en direct, forfait, au mois ou à l'année, options, récapitulatif |
| Forfaits | `/forfaits/` | Entretien, Chico, Power, Titan (au mois ou à l'année), jetons IA, prix de création, options |
| Nos outils | `/nos-outils/` | Demandes de modification gérées par moi ; outils gratuits (tableau de bord, QR code, lien d'avis, factures) |
| Mon espace (démo) | `/mon-espace/` | Démo : demandes et suivi, tableau de bord, QR code, lien d'avis, forfait et factures |
| SEO | `/referencement-seo/` | Ce que je fais, le SEO dans chaque forfait, ce que je ne promets pas |
| Comparatif Shopify | `/comparatif-shopify/` | Shopify Basic ligne par ligne, et le coût sur un an |
| Autres | | Fidélité, Ma méthode, Contact, page Ardennes, FAQ, pages légales, plan du site, merci, 404 |

Chaque rubrique a sa couleur pastel (menu, pastille en haut de page) pour qu'on sache toujours où l'on est.

## Où changer les prix

Tout est dans **`src/config.js`** : `types` (prix de création), `entretien`, `forfaits` (supplément et jetons), `jetons` (recharge), `annuel` (mois offerts), `options`, `fidelite`, `paiement`, `shopify` (prix relevés pour le comparatif, avec la date). Le site, le configurateur et les données structurées se mettent à jour au prochain `npm run build`.

L'espace client est ouvert sur `/mon-espace/` (WordPress, extension « ALED08 Espace client »). Le mode d'emploi complet du propriétaire (commandes, Stripe, noms de domaine, comptes automatiques) est dans `docs/gestion-du-site.md`.

## À faire avant la mise en ligne

1. **Informations légales** dans `src/config.js` (`legal`) : SIRET, mention TVA (par exemple « TVA non applicable, art. 293 B du CGI » en micro-entreprise), **médiateur de la consommation**.
2. Faire relire les **conditions générales** et la **politique de confidentialité** (`src/content/legal.js`) : ce sont des modèles.
3. Revérifier les **prix de Shopify** sur shopify.com/fr/tarifs et mettre à jour `shopify` dans `src/config.js`.

Le build affiche un rappel tant que des éléments restent à compléter.

## Utilisation

Prérequis : **Node.js 18 ou plus** (aucun `npm install` nécessaire).

```bash
npm run build     # génère le site dans dist/
npm run check     # contrôle : liens cassés, H1, meta, JSON-LD, phrases en double
npm run serve     # aperçu local sur http://localhost:8080
npm run images    # régénère l'image de partage et les icônes (nécessite Playwright)
```

## Mise en ligne

### Hébergement mutualisé (o2switch, OVH, IONOS…)
1. `npm run build`
2. Envoyez tout le contenu de `dist/` (y compris `.htaccess` et `envoi.php`) à la racine du site.
3. Le formulaire passe par `envoi.php` (fonction `mail()` de PHP) : faites un envoi de test.

### WordPress (www.aled08.fr)
`node build.js && python3 scripts/wp-export.py` produit trois archives dans `wp-export/` :
- `aled08.zip` : le thème (styles, en-tête, pied de page, formulaire de contact, redirections des anciennes adresses) ;
- `aled08-import.zip` : extension d'import à usage unique (crée les pages à partir de `dist/`, à désactiver et supprimer après usage) ;
- `aled08-espace.zip` : l'extension **ALED08 Espace client** (`src/wordpress/aled08-espace/`) : commandes passées sur `/commander/` (CPT `aled08_commande`), paiement Stripe sans SDK (`includes/stripe.php`, webhook `aled08/v1/stripe`), comptes clients automatiques et suppression après 12 mois (`includes/comptes.php`), menu d'administration « ALED08 » (`includes/admin.php`), espace client sur `/mon-espace/`. Ses données (prix, quotas, icônes, monstres) viennent de `data.json`, généré par `scripts/wp-espace-data.js` depuis `src/config.js`. Les styles propres à l'espace sont dans `src/assets/css/espace.css`.

Le guide du propriétaire : `docs/gestion-du-site.md`.

## Modifier le contenu

| Fichier | Contenu |
|---|---|
| `src/config.js` | Coordonnées, rubriques, types de site, forfaits, options, prix, informations légales |
| `src/pages/main.js` | Toutes les pages |
| `src/content/faq.js` | Questions fréquentes par rubrique (reprises sur `/faq/`) |
| `src/content/legal.js` | Mentions légales, confidentialité, conditions générales |
| `src/lib/components.js` | Cartes des forfaits, configurateur, maquettes de l'espace client, comparatif |
| `src/lib/monsters.js` | Les petits monstres (SVG dessinés à la main) et le logo |
| `src/assets/css/style.css` | Le design (couleurs pastel dans `:root`) |
| `src/assets/js/main.js` | Menu, au mois ou à l'année, configurateur, vérification du nom de domaine, formulaire |

## Structure

```
build.js                 générateur (pages, sitemap, robots, manifest, envoi.php)
scripts/check.js         contrôle qualité SEO et anti-duplication
scripts/generate-images.js  image de partage et icônes
scripts/add-icons.js     ajoute des icônes Lucide à src/lib/icons.js
src/config.js            configuration et prix
src/lib/                 gabarit, composants, monstres, icônes, mini-markdown
src/pages/main.js        les pages
src/content/             FAQ et pages légales
src/assets/              CSS, JS, police Nunito (OFL), images
src/static/              fichiers copiés tels quels (.htaccess, favicon…)
src/server/envoi.php     traitement du formulaire de devis
dist/                    SITE GÉNÉRÉ, à mettre en ligne
src/wordpress/aled08-espace/  extension WordPress « ALED08 Espace client » (commandes, Stripe, comptes, admin, espace)
scripts/wp-export.py     export WordPress : thème, import des pages, extension (avec data.json)
docs/gestion-du-site.md  guide du propriétaire : commandes, Stripe, noms de domaine, comptes, vérifications
docs/                    (autres fichiers : archives de l'ancienne activité d'électricien)
```

Crédits : police Nunito (SIL Open Font License), icônes Lucide (ISC), pictogramme WhatsApp (Simple Icons, CC0). Les monstres sont des dessins originaux.
