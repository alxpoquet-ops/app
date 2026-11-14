# ALED08 : site internet

Site d'**ALED08**, sites internet et services autour de l'IA, à petit prix et accessibles à tous :

- **sites internet** en trois formats (une page, avec onglets, boutique en ligne), en **paiement unique** ou en **abonnement mensuel** tout compris, avec des options (hébergement et nom de domaine, maintenance, référencement local, logo, rédaction…) ;
- **petits jeux 2D** jouables dans le navigateur (la page Jeux contient une démo jouable) ;
- **automatisations** (tri des mails, rappels, relances, résumés) et **initiation à l'IA** en visio ;
- un programme de **fidélité et parrainage**.

Site **statique**, rapide, sans base de données : un petit générateur Node.js (sans aucune dépendance) produit toutes les pages HTML dans `dist/`.

---

## Pages

| Rubrique | Adresse | Contenu |
|---|---|---|
| Accueil | `/` | Promesse, « Que voulez-vous faire ? », étapes, les trois formules, l'IA expliquée franchement |
| Sites internet | `/sites-internet/` | Les trois formats avec schéma, ce que comprend chaque site, paiement unique ou abonnement |
| Tarifs | `/tarifs/` | Formules (sélecteur une fois / au mois), options, **simulateur de prix**, autres services |
| Jeux 2D | `/jeux-2d/` | Démo jouable « Attrape-éclairs », idées, prix |
| Automatisations | `/automatisations/` | Exemple animé de tri des mails, exemples, prix, initiation à l'IA |
| Ma méthode | `/methode/` | Ce que fait l'IA, ce que je fais moi-même, mes limites |
| Fidélité | `/fidelite/` | Parrainage, remise client fidèle, avantage abonnés |
| Contact | `/contact/` | Formulaire de devis (prérempli depuis les boutons et le simulateur) |
| Autres | | Page locale Ardennes, FAQ complète, pages légales, plan du site, merci, 404 |

Chaque rubrique a sa couleur (menu, pastille en haut de page, liseré) pour qu'on sache toujours où l'on est.

## Où changer les prix

Tout est dans **`src/config.js`** : `formules` (prix unique, prix mensuel, délais, contenu), `abonnement`, `options` (prix selon la façon de payer), `modification`, `jeux`, `automatisations`, `initiation`, `fidelite`, `paiement`. Le site, le simulateur et les données structurées se mettent à jour au prochain `npm run build`.

## À faire avant la mise en ligne

1. **Informations légales** dans `src/config.js` (`legal`) : SIRET, mention TVA (par exemple « TVA non applicable, art. 293 B du CGI » en micro-entreprise), **médiateur de la consommation** (obligatoire pour vendre aux particuliers).
2. Faire relire les **conditions générales** (`src/content/legal.js`) : c'est un modèle.
3. Vérifier les prix, l'engagement de l'abonnement (12 mois) et les conditions de parrainage.

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
`scripts/wp-export.py` produit un thème et une extension d'import à partir de `dist/`. Il date de l'ancien site d'électricien et doit être adapté au nouveau site avant de s'en servir (formulaire, nouvelles pages, redirection des anciennes adresses).

## Modifier le contenu

| Fichier | Contenu |
|---|---|
| `src/config.js` | Coordonnées, rubriques, formules, options, prix, informations légales |
| `src/pages/main.js` | Toutes les pages |
| `src/content/faq.js` | Questions fréquentes par rubrique (reprises sur `/faq/`) |
| `src/content/legal.js` | Mentions légales, confidentialité, conditions générales |
| `src/lib/components.js` | Cartes de formules, tableau des options, simulateur, bandeaux |
| `src/assets/css/style.css` | Le design (couleurs dans `:root`, une couleur par rubrique) |
| `src/assets/js/main.js` | Menu, sélecteur de paiement, simulateur, jeu, petites étoiles |

## Structure

```
build.js                 générateur (pages, sitemap, robots, manifest, envoi.php)
scripts/check.js         contrôle qualité SEO et anti-duplication
scripts/generate-images.js  image de partage et icônes
scripts/add-icons.js     ajoute des icônes Lucide à src/lib/icons.js
src/config.js            configuration et prix
src/lib/                 gabarit, composants, icônes, mini-markdown
src/pages/main.js        les pages
src/content/             FAQ et pages légales
src/assets/              CSS, JS, police Nunito (OFL), images
src/static/              fichiers copiés tels quels (.htaccess, favicon…)
src/server/envoi.php     traitement du formulaire de devis
dist/                    SITE GÉNÉRÉ, à mettre en ligne
docs/                    documents de l'ancienne activité d'électricien (archives)
```

Crédits : police Nunito (SIL Open Font License), icônes Lucide (ISC), pictogramme WhatsApp (Simple Icons, CC0).
