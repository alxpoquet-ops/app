# ⚡ ALED08 — Site internet

Site vitrine d'**ALED08** (artisan électricien, dépannage dans toutes les Ardennes). Spécialité : **le dépannage électrique au forfait, sur devis annoncé avant de venir** (déplacement, recherche de panne, proposition de solution et devis de réparation compris), **à tout moment sur rendez-vous**. Travaux sur devis gratuit.

Site **statique**, rapide, sans base de données ni CMS : un petit générateur Node.js (sans aucune dépendance) produit toutes les pages HTML dans le dossier `dist/`, prêtes à être envoyées sur n'importe quel hébergement.

---

## Contenu du site

| Type | Nombre | Exemples |
|---|---|---|
| Pages principales | 13 | Accueil, Qui suis-je, Prestations, Tarifs, Zone, Réalisations, FAQ, Devis, Contact, Blog, plan du site, merci, 404 |
| Pages prestations | 7 | Dépannage, Recherche de panne, Tableaux, Prises et interrupteurs, Éclairage intérieur/extérieur, Mise en sécurité |
| **Pages SEO** | **74** | 26 communes, 3 secteurs, 7 pages « Ardennes », 5 pages service × ville, 12 pannes, 14 prestations techniques, 7 situations |
| Articles de blog | 12 | Trouver une panne, remplacer un tableau, différentiel ou disjoncteur, prix d'un dépannage… |
| Pages légales | 3 | Mentions légales, Confidentialité / cookies, Conditions générales |

Chaque page SEO a un **contenu unique** : texte propre, 3 cas concrets, une FAQ dédiée, un appel à l'action, un bouton de devis et des liens internes. Le script `npm run check` vérifie l'absence de phrases dupliquées entre les pages.

**SEO intégré :** balises title et description uniques (« dépannage électrique + commune » dans le titre de chaque page commune), canonical, Open Graph et Twitter Card, données structurées schema.org (`Electrician`/LocalBusiness avec offre à 79 € et zone de 45 km, `Service` avec prix par commune, `Person`, `FAQPage`, `BreadcrumbList`, `BlogPosting`), `sitemap.xml`, `robots.txt`, fil d'Ariane, maillage interne entre communes, pannes, prestations et articles. Audit Lighthouse : 100/100 en performance, accessibilité, bonnes pratiques et SEO sur les pages testées.

**Fonctionnalités :** bouton d'appel et barre de contact fixe sur mobile, bouton WhatsApp, formulaires de contact et de devis (préremplis selon la page d'origine), prix du dépannage par commune, déroulement du passage étape par étape, galerie avant/après interactive, avis clients réels (section masquée tant qu'il n'y en a pas), carte Google Maps chargée seulement après consentement, bannière cookies conforme RGPD.

---

## ⚠️ À faire AVANT la mise en ligne

Tout se règle dans **`src/config.js`** :

1. **Téléphone** : `phoneDisplay`, `phoneIntl`, `whatsapp`. Le numéro actuel (06 39 98 00 00) est **fictif**.
2. **E-mail** de réception des demandes (`email`).
3. **Domaine** définitif (`url`). Par défaut : `https://www.aled08.fr`.
4. **Informations légales** (`legal`) : SIRET, immatriculation, assureur et numéro de contrat, **médiateur de la consommation** (obligatoire), hébergeur, mention TVA si vous êtes en franchise (`TVA non applicable, art. 293 B du CGI`).
5. **Disponibilités** (`hours` : aucun horaire affiché, « à tout moment, sur rendez-vous »), **forfait dépannage** (`forfait`), **grille** (`tarifs`) et **secteurs** (`secteurs`) : vérifiez qu'ils correspondent exactement à votre pratique.
6. **Distances** des communes (`communes`) : elles sont **indicatives**. Vérifiez-les, surtout celles proches d'une limite de tranche (Charleville-Mézières, Renwez, Sedan).
7. **Avis clients** : `src/content/avis.js` est vide et la section « Avis » est masquée. Ajoutez-y vos vrais avis au fur et à mesure (voir `docs/guide-referencement-local.md`). Ne publiez jamais d'avis inventés.
7 bis. **Votre photo** : ajoutez un portrait (`portrait` dans `src/config.js`). À défaut, un pictogramme est affiché.
8. **Photos** : les visuels avant/après (`src/assets/img/realisations/`) sont des illustrations. Remplacez-les dès que possible par vos propres photos de chantier.
9. **Numéro Enedis** cité dans certaines pages (`09 726 750 08`, dépannage des Ardennes) : vérifiez-le sur enedis.fr.
10. Relisez les textes qui décrivent vos pratiques et ajustez-les si besoin : forfait dépannage sur devis, annoncé au téléphone avant de venir (déplacement, recherche de panne, proposition de solution, devis de réparation sans obligation), **panne non trouvée = remise sur le forfait, montant non affiché** (`notFoundDiscount` dans `forfait`), aucun prix de pièce affiché, réparation sur devis, devis de travaux gratuit, pas de majoration le soir et le week-end.

Le build affiche un rappel tant que des éléments restent à compléter.

---

## Documents utiles

- `docs/analyse-concurrence.md` : qui apparaît sur Google dans le secteur, à quels prix, et où ALED08 se démarque.
- `docs/guide-referencement-local.md` : fiche Google Business Profile (texte prêt à copier), méthode pour obtenir de vrais avis, annuaires, Search Console.
- `docs/captures/` : captures de présentation du site.

## Utilisation

Prérequis : **Node.js 18 ou plus** (aucun `npm install` nécessaire).

```bash
npm run build     # génère le site dans dist/
npm run check     # contrôle : liens cassés, H1, meta, JSON-LD, contenus dupliqués
npm run serve     # aperçu local sur http://localhost:8080
npm run images    # régénère l'image Open Graph et les icônes PNG (nécessite Playwright)
```

## Mise en ligne

### Hébergement mutualisé (OVH, o2switch, IONOS…) — recommandé
1. `npm run build`
2. Envoyez **tout le contenu** du dossier `dist/` (y compris `.htaccess` et `envoi.php`) à la racine du site (`www/`) par FTP, avec FileZilla par exemple.
3. Le formulaire fonctionne grâce à `envoi.php` (fonction `mail()` de PHP). Faites un test d'envoi après la mise en ligne.
4. Activez le certificat HTTPS (Let's Encrypt, gratuit chez la plupart des hébergeurs).

### Netlify, Cloudflare Pages ou autre hébergement statique
Commande de build `node build.js`, dossier publié `dist`. PHP n'y étant pas disponible, indiquez dans `formAction` l'URL d'un service de formulaires (Formspree, Netlify Forms…).

### Après la mise en ligne
- Créez ou complétez votre **fiche Google Business Profile** (catégorie « Électricien », horaires, zone desservie, lien vers le site). C'est le levier n°1 du référencement local.
- Déclarez le site dans **Google Search Console** et soumettez `https://www.aled08.fr/sitemap.xml`.
- Demandez à vos clients satisfaits un avis Google, puis renseignez `googleReviewsUrl`.

---

## Modifier le contenu

| Fichier | Contenu |
|---|---|
| `src/config.js` | Coordonnées, disponibilités, tarifs, communes et distances, informations légales |
| `src/pages/main.js` | Accueil, Qui suis-je, Tarifs, Zone, Devis, Contact… |
| `src/content/services.js` | Les 7 pages prestations principales |
| `src/content/seo-*.js` | Les 62 pages SEO (communes, Ardennes, symptômes, services, situations) |
| `src/content/blog-1.js`, `blog-2.js` | Les articles de blog |
| `src/content/faq.js` | La FAQ complète |
| `src/content/avis.js` | Les avis clients |
| `src/content/legal.js` | Mentions légales, confidentialité, conditions générales |
| `src/assets/css/style.css` | Le design (couleurs dans `:root`) |

Les textes s'écrivent dans un format simple : paragraphes séparés par une ligne vide, `- ` pour les listes, `## ` pour les titres, `**gras**`, `[lien](/page/)`, `> ` pour un encadré conseil, `!> ` pour un encadré attention, et `[[cta]]` pour insérer un bloc « demande de devis ».

**Ajouter une page locale** : copiez un bloc dans `src/content/seo-villes.js`, changez `slug`, `city`, les textes, la FAQ et les cas concrets, puis ajoutez la commune dans `communes` (`src/config.js`) avec `page: 'electricien-...'`. Lancez `npm run build` puis `npm run check`.

## Structure

```
build.js                 générateur (pages, sitemap, robots, manifest)
scripts/check.js         contrôle qualité SEO et anti-duplication
scripts/generate-images.js  image Open Graph et icônes
src/config.js            configuration de l'entreprise
src/lib/                 gabarit, composants, icônes, mini-markdown
src/pages/               pages principales et gabarits (pages SEO, articles)
src/content/             tous les textes
src/assets/              CSS, JS, police Nunito (OFL), images
src/static/              fichiers copiés tels quels (.htaccess, favicon…)
src/server/envoi.php     traitement des formulaires
dist/                    SITE GÉNÉRÉ, à mettre en ligne
```

Crédits : police Nunito (SIL Open Font License), icônes Lucide (ISC), pictogramme WhatsApp (Simple Icons, CC0).
