# Flore & Chenilles sur WordPress (o2switch)

La boutique en ligne complète, avec le même site qu’aujourd’hui :

- **la page d’accueil est identique** : créations, fiche d’une création, compositeur « Votre bouquet à vous »,
  cartes de vœux, papillons et chenilles, Instagram, FAQ, contact ;
- **WooCommerce** gère le reste :
  - le panier (« Ma sélection ») et la page de commande ;
  - le paiement par **carte bancaire** (Stripe) et par **PayPal** ;
  - le retrait à l’atelier et la livraison à 5 € ou 10 € ;
  - les e-mails de commande, le stock et les factures ;
  - l’espace client.
- **Laurine gère tout depuis WordPress**, ou depuis l’application mobile WooCommerce :
  - ajouter une création, avec ses photos et son prix ;
  - marquer une création comme unique ;
  - voir et suivre les commandes.

Deux fichiers sont à installer dans WordPress :

| Fichier | Contenu |
| --- | --- |
| [`dist/flore-et-chenilles-theme.zip`](dist/flore-et-chenilles-theme.zip) | le **thème** : le design du site |
| [`dist/flore-et-chenilles-boutique.zip`](dist/flore-et-chenilles-boutique.zip) | l’**extension** : la carte de vœux offerte, l’option bocal, les créations uniques, l’offre de lancement, le compositeur, le formulaire de contact, et l’import des 63 créations et des 36 pages de contenu (photos comprises) |

Pour les télécharger depuis GitHub, ouvrez le fichier puis cliquez sur **Download raw file**.

---

## Installation pas à pas

Comptez environ une heure, en suivant l’ordre ci-dessous.

### 1. Le nom de domaine

1. Dans votre espace client o2switch, commandez le nom de domaine (par exemple `floreetchenilles.fr`).
   S’il est acheté ailleurs, pointez-le vers votre hébergement o2switch.
2. Le certificat **https** est créé tout seul par o2switch dès que le domaine pointe vers l’hébergement.
   Dans cPanel, l’outil « Let’s Encrypt™ SSL » permet de le vérifier.

### 2. L’adresse e-mail de la boutique

Dans cPanel › **Comptes de messagerie**, créez une adresse sur votre domaine, par exemple
`contact@floreetchenilles.fr`.

Les e-mails de commande partiront de cette adresse : ils arrivent bien mieux qu’avec une adresse Gmail
utilisée comme expéditeur. Les réglages de connexion (serveur, port) se trouvent sur la même page, à la
ligne « Connect Devices ».

### 3. WordPress

1. Dans cPanel, ouvrez **Softaculous Apps Installer › WordPress › Installer**.
2. Remplissez ainsi :
   - **Adresse** : `https://` + votre domaine, sans dossier ;
   - **Langue** : Français ;
   - **Identifiant administrateur** : évitez « admin » ;
   - **Mot de passe** : un mot de passe long ;
   - **E-mail** : celui de Laurine.
3. Connectez-vous ensuite sur `https://votre-domaine/wp-admin`.

### 4. WooCommerce

1. Ouvrez **Extensions › Ajouter une extension**, cherchez « WooCommerce », puis cliquez sur
   **Installer** et **Activer**.
2. Vous pouvez passer l’assistant de démarrage de WooCommerce : l’étape 7 configure la boutique.

### 5. Le thème

1. Ouvrez **Apparence › Thèmes › Ajouter › Téléverser un thème**.
2. Choisissez `flore-et-chenilles-theme.zip`, puis cliquez sur **Installer** et **Activer**.

### 6. L’extension de la boutique

1. Ouvrez **Extensions › Ajouter une extension › Téléverser une extension**.
2. Choisissez `flore-et-chenilles-boutique.zip`, puis cliquez sur **Installer** et **Activer**.

### 7. La mise en place en deux clics

Ouvrez **WooCommerce › Flore & Chenilles** :

1. **Configurer la boutique** règle tout ceci :
   - les euros, et la France comme pays de vente ;
   - le **retrait gratuit à l’atelier**, la **livraison à 5 € jusqu’à 15 km** et **à 10 € de 15 à 25 km**
     (Ardennes) ;
   - les pages Panier, Commande et Mon compte ;
   - les couleurs des e-mails ;
   - les adresses `/creation/…` ;
   - les pages légales, créées en **brouillon**.
2. **Importer mes créations** ajoute :
   - les 63 créations, avec leurs photos, prix, catégories, vignettes « Vase offert » et « Pot offert »,
     les 7 créations uniques en stock 1, et les fleurs au choix ;
   - les 36 pages de contenu pour Google, aux mêmes adresses qu’aujourd’hui : `/fleurs/rose/`,
     `/occasions/fete-des-meres/`, `/conseils/…`.

   L’import dure une à deux minutes. S’il s’interrompt, un nouveau clic le fait reprendre où il s’était
   arrêté.

La page affiche ensuite la liste de ce qu’il reste à faire, et chaque ligne passe au vert une fois faite.
Sur cette même page se trouvent aussi :

- l’e-mail qui reçoit les messages du formulaire de contact ;
- l’Instagram et le Facebook ;
- le prix d’une fleur (8 €) et celui du bocal (+5 €) ;
- la mention TVA ;
- l’offre de lancement (−10 % jusqu’au 4 janvier 2027).

### 8. Le paiement par carte et par PayPal

Laurine crée elle-même ses comptes de paiement, avec son SIRET et son IBAN. Aucune clé ne passe par
quelqu’un d’autre.

- **Carte bancaire (et Apple Pay, Google Pay)**
  1. Installez l’extension « WooCommerce Stripe Payment Gateway ».
  2. Ouvrez **WooCommerce › Réglages › Paiements › Stripe**, puis cliquez sur
     **Créer ou connecter un compte**.
- **PayPal**
  1. Installez l’extension « WooCommerce PayPal Payments ».
  2. Connectez-la à un compte PayPal **professionnel** (un compte personnel se convertit gratuitement).
- **Paiement au retrait** (facultatif) : pour payer en espèces à l’atelier, activez
  **Paiement à la livraison** dans WooCommerce › Réglages › Paiements, puis renommez-le
  « Paiement au retrait à l’atelier ».

Stripe et PayPal prennent une petite commission sur chaque paiement : voyez leurs tarifs. L’argent arrive
ensuite sur le compte bancaire de Laurine.

Avant d’ouvrir la boutique, faites une vraie commande test, puis remboursez-la depuis la commande
(bouton **Rembourser**).

### 9. Les e-mails

1. Installez « **WP Mail SMTP** ».
2. Choisissez « Autre SMTP », puis renseignez l’adresse créée à l’étape 2 et son mot de passe. Le serveur
   et le port sont indiqués dans cPanel, à la ligne « Connect Devices ».
3. Dans **WooCommerce › Réglages › E-mails** :
   - **Adresse de l’expéditeur** : `contact@votre-domaine` ;
   - **Nouvelle commande › Destinataire** : l’adresse où Laurine veut recevoir les commandes, par exemple
     floreetchenilles@gmail.com.

Les messages du formulaire de contact arrivent à l’adresse indiquée dans WooCommerce › Flore & Chenilles. Il
n’y a plus besoin de FormSubmit.

### 10. Instagram

Pour afficher les 6 dernières publications avec le style du site :

1. Créez un flux gratuit sur **behold.so**, en vous connectant avec le compte Instagram.
2. Copiez l’adresse « JSON » du flux.
3. Collez-la dans WooCommerce › Flore & Chenilles › **Flux Instagram**.

Autre solution : installer l’extension « Smash Balloon Instagram Feed ». Son fil s’affiche alors à la place
des photos.

### 11. Les pages légales

L’étape 7 crée trois **brouillons** dans **Pages**. Les passages à compléter sont surlignés en jaune.

- **Conditions générales de vente** : nom, SIRET, adresse, et le **médiateur de la consommation**.
  Ce médiateur est obligatoire pour vendre aux particuliers ; la liste officielle se trouve sur
  economie.gouv.fr.
- **Mentions légales** : éditeur, et hébergeur. Vérifiez l’adresse d’o2switch sur o2switch.fr.
- **Politique de confidentialité**.

Relisez puis **publiez** les trois pages. Dès que les CGV sont publiées, le client doit les accepter pour
commander. Les liens apparaissent aussi dans le pied de page.

### 12. Ouvrir la boutique

Ouvrez **WooCommerce › Réglages › Visibilité du site**, puis cochez **En ligne**.

### 13. Google

- **Le plan du site** se trouve à `https://votre-domaine/wp-sitemap.xml`. Il contient les pages, les
  créations et les catégories.
- **Google Search Console**
  1. Ajoutez le domaine.
  2. Envoyez ce plan du site.
- **Fiche Google Business Profile** : créez la fiche « Flore & Chenilles » à Signy-l’Abbaye. C’est ce qui
  compte le plus pour les recherches locales.
- **Extension SEO (facultative)** : le thème remplit déjà les titres, descriptions, images de partage et la
  fiche « fleuriste » de l’accueil. Avec « Rank Math » ou « Yoast SEO », il leur laisse la main, et les
  titres et descriptions des pages importées sont repris.

### 14. Sauvegardes et mises à jour

- o2switch sauvegarde l’hébergement chaque jour. Pour restaurer, ouvrez cPanel › JetBackup.
- Gardez WordPress, WooCommerce et les extensions à jour : **Tableau de bord › Mises à jour**.

---

## Connexion d’un assistant (MCP) : extension « Connexion »

Certains hébergements retirent l’en-tête « Authorization » avant qu’il n’arrive à WordPress. Les mots de passe
d’application, et donc les MCP comme OneMCP, ne fonctionnent alors pas depuis l’extérieur : l’API répond
« rest_not_logged_in ».

L’extension [`dist/flore-et-chenilles-connexion.zip`](dist/flore-et-chenilles-connexion.zip) règle ce
problème :

- elle accepte aussi le mot de passe d’application par l’en-tête `X-FC-Auth`
  (`Basic base64(identifiant:mot de passe)`) ;
- WordPress le vérifie ensuite lui-même, comme d’habitude ;
- vous pouvez la désactiver dès que vous n’en avez plus besoin.

---

## Au quotidien

- **Ajouter une création**
  1. Ouvrez **Produits › Ajouter**.
  2. Renseignez le nom, le prix, la description courte, la photo principale (« Image produit »), les autres
     photos (« Galerie ») et la catégorie (Bouquets, Fleurs à l’unité ou Déco & cadeaux).
  3. Dans l’onglet **Flore & Chenilles**, si besoin :
     - **Création unique** : stock 1, puis « Vendue » toute seule après l’achat ;
     - **Vignette cadeau** : « Vase offert » ou « Pot offert » ;
     - **Nombre de fleurs** : prix calculé tout seul, à 8 € la fleur ;
     - **Étiquette** : « Nouveauté »… ;
     - **Mot de Laurine**.

  La création apparaît aussitôt sur l’accueil.
- **Une commande arrive**
  1. Laurine reçoit un e-mail.
  2. La commande s’ouvre dans **WooCommerce › Commandes**. Chaque création y affiche sa **carte de vœux**,
     la fleur, la couleur, l’option bocal ou la composition du bouquet.
  3. Une fois la création remise, passez la commande en **Terminée** : le client reçoit un e-mail.
- **Application mobile** : l’application gratuite « WooCommerce » (iOS, Android) prévient de chaque commande.

---

## Pour modifier le site (développement)

Le thème et l’extension sont fabriqués à partir du site d’origine. La source unique se trouve à la racine
du dépôt :

- les gabarits viennent de `index.html` ;
- le style vient de `assets/css/style.css` ;
- les scripts viennent de `assets/js/` ;
- les créations et les textes viennent de `assets/js/data.js` et `tools/seo/`.

Après une modification, refaites les deux .zip :

```bash
node tools/wordpress/build.js
```

Ensuite, dans WordPress, téléversez le nouveau .zip : WordPress propose de **remplacer la version
actuelle**. Les créations et réglages déjà dans WordPress sont gardés. L’import n’ajoute que ce qui
manque, et ne modifie jamais une création existante.

| Dossier | Contenu |
| --- | --- |
| `theme/flore-et-chenilles/` | `functions.php`, gabarits (`header.php`, `front-page.php`, `page.php`, `woocommerce.php`…), `inc/` (aides, référencement), `assets-src/` (style des pages de la boutique `woo.css`, script `lite.js`) ; `assets/` et `parts/` sont fabriqués |
| `plugin/flore-et-chenilles-boutique/` | `includes/` : réglages, prix et offre, panier et cartes de vœux, fiche, données de l’accueil, adresses du panier et du contact (`/wp-json/fc/v1/…`), administration, mise en place, import, e-mails, commandes WP-CLI (`wp fcb setup`, `wp fcb import`) ; `data/` et `import/` sont fabriqués |
| `plugin-connexion/` | la petite extension « Connexion » (mot de passe d’application par l’en-tête X-FC-Auth) |
| `dist/` | les .zip à téléverser |

Pour la page d’accueil, `assets/js/app.js` fonctionne de deux façons :

- **sur le site statique**, la sélection est gardée dans le navigateur, et la demande part par e-mail ;
- **sous WordPress**, le thème fournit `window.FC_WP`. La sélection est alors le panier WooCommerce, et le
  bouton « Commander » mène au paiement.

Les adresses du panier n’acceptent que les demandes venues du site lui-même (en-tête `X-FC-Shop`).
