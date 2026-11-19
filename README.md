# ALED08 : site internet

Site des **Minis Monstres** (agence web d'Alex) : des sites internet à petit prix, pensés pour Google, avec un espace client pour demander ses modifications.

- **Trois sites, payés une fois** (offre du 19 novembre 2026) : 👾 Site Essentiel 500 € (une page, « Exister sur internet »), 🚀 Site Visibilité 750 € (jusqu'à 20 pages, « Être trouvé sur Google »), 🛒 Site Boutique 1 200 € (« Vendre sur internet »). Acompte de 25 % à la commande, le reste à la réception, en une fois ou en 6 ou 12 fois sans frais. Révisions illimitées jusqu'à validation, export du site possible.
- **Ensuite, au choix, sans abonnement imposé** : ⚪ Autonomie, 0 € par mois (le client gère hébergement, nom de domaine, sauvegardes et mises à jour, et reçoit l'export de son site), ou 🔵 Forfait Mini, 10 € par mois sans engagement (hébergement, nom de domaine, sauvegardes automatiques, sécurité, maintenance technique, espace client, modifications incluses en 48 h au plus, une demande à la fois).
- **Trois extras** : 📈 page de visibilité Google, 15 € la page, payée une fois par carte depuis l'espace client ; 🌍 traduction anglaise, sur devis ; ⚙️ fonctionnalité spécifique, sur devis.
- **Comparaison honnête** : `marche.fois` vaut « 2 à 4 » (site vitrine de cinq pages chez un indépendant, 1 500 à 3 000 €, face au Site Visibilité à 750 €).
- **Il n'y a plus** d'option à la création, d'extra au mois ni de lot d'articles payant pour la boutique : le client gère son catalogue librement.
- **La bande** (six monstres, `bande` dans `src/config.js`) : 🍒 Cerise, la secrétaire ; 🔧 Bricou, le constructeur ; ✍️ Plume, la rédactrice ; 👀 Mirette, la spécialiste visibilité ; 📦 Mochi, l'organisateur ; Pépite, la spécialiste des extras. Cerise aide à préciser chaque demande, Bricou fait la modification, Alex conçoit et contrôle. Cerise suit le visiteur dans une bulle, en bas de chaque page.

Site **statique**, rapide, sans base de données : un petit générateur Node.js (sans aucune dépendance) produit toutes les pages HTML dans `dist/`.

---

## Pages

| Rubrique | Adresse | Contenu |
|---|---|---|
| Accueil | `/` | Phrase principale, les trois sites, Autonomie ou Forfait Mini, espace client, visibilité Google |
| Créer mon site | `/creer-mon-site/` | **Configurateur** : choix du site, Autonomie ou Forfait Mini, nom de domaine vérifié en direct, récapitulatif |
| Tarifs | `/tarifs/` | Les trois sites (500, 750, 1 200 €), Autonomie ou Forfait Mini (10 € par mois), les trois extras, la comparaison avec le marché |
| Nos outils | `/nos-outils/` | Demandes de modification (Cerise précise, Bricou fait) ; outils gratuits (QR code, lien d'avis, factures) |
| Mon espace (démo) | `/mon-espace/` | Démo de l'espace client : onglets Accueil, Demandes, Extras, Ma boutique, Mon compte |
| Visibilité sur Google | `/referencement-seo/` | Ce que nous faisons pour rendre un site visible, la page de visibilité Google, ce que nous ne promettons pas |
| Comparatif Shopify | `/comparatif-shopify/` | Shopify Basic ligne par ligne, et le coût sur un an |
| Autres | | Fidélité (remise sur un deuxième site, plus de parrainage), Notre méthode, Contact, page Ardennes, FAQ, pages légales, plan du site, merci, 404 |

Chaque rubrique a sa couleur pastel (menu, pastille en haut de page) pour qu'on sache toujours où l'on est.

## Où changer les prix

Tout est dans **`src/config.js`** : `types` (les trois sites et leurs prix), `creation` (prix et nombre de pages), `forfaits` (Forfait Mini), `creationSeule` (Autonomie), `aLaDemande` (extras), `fidelite`, `paiement`, `marche` (repères du marché), `bande`, `phrase`. Le site, le configurateur et les données structurées se mettent à jour au prochain `npm run build`.

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

### WordPress (www.les-minis-monstres.fr)
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
| `src/lib/monsters.js` | Les mascottes (Cerise en cinq humeurs, Alex à lunettes), en SVG dessiné à la main, et le logo |
| `src/assets/css/style.css` | Le design (couleurs pastel dans `:root`) |
| `src/assets/js/main.js` | Menu, configurateur, vérification du nom de domaine, formulaire |

## Structure

```
build.js                 générateur (pages, sitemap, robots, manifest, envoi.php)
scripts/check.js         contrôle qualité SEO et anti-duplication
scripts/generate-images.js  image de partage et icônes
scripts/add-icons.js     ajoute des icônes Lucide à src/lib/icons.js
src/config.js            configuration et prix
src/lib/                 gabarit, composants, mascottes, icônes, mini-markdown
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

Crédits : police Nunito (SIL Open Font License), icônes Lucide (ISC), pictogramme WhatsApp (Simple Icons, CC0). Cerise et Alex, les mascottes, sont des dessins originaux.
