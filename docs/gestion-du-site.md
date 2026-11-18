# Gérer le site ALED08 : le guide du propriétaire

Ce guide explique, en français simple, comment fonctionne le site www.les-minis-monstres.fr au quotidien : les commandes, les paiements, les noms de domaine, les comptes clients et les demandes de modification. Tout se passe dans WordPress, menu **ALED08** (le visage souriant, en haut à gauche).

## 1. L'offre, en bref (mise à jour le 18 novembre 2026 : un seul abonnement, et des extras à la carte)

- **La page de commande, de haut en bas** : le site, l'option boutique, le choix « On s'occupe de tout » ou « Je m'en occupe moi-même », puis (seulement avec « On s'occupe de tout ») l'abonnement Mini et le nom de domaine, et enfin le total avec le paiement (une fois ou étalé) et le code promo.
- **Le site** : « Site Internet Professionnel », 500 €, jusqu'à 15 pages. Design personnalisé, adapté à tous les écrans, formulaire de contact, accompagnement personnalisé, les Minis Monstres. La « carte Google » et le « référencement Google de base » ne sont plus annoncés (retirés le 17 novembre 2026) : ne les promettez pas. Les pages non utilisées deviennent des pages pour Google (SEO) : par exemple 8 pages pour l'activité, 7 pour Google.
- **Une seule option à la commande** : Boutique en ligne 200 €, payée une fois (catalogue, panier, paiement en ligne, commandes, e-mails automatiques).
- **Les pages SEO supplémentaires, plus tard** : « Page SEO optimisée », 15 € la page, payée une fois. Par exemple : service + ville, FAQ, métier, page locale, guide. Elle ne se choisit pas à la commande (dans `src/config.js`, l'option `packseo` a `quand: 'espace'`, `price.once: 5`, `pages: 1`). Le client la commande quand il veut, une page à la fois, depuis son espace client, onglet « Mes demandes ». Lumi la prépare, je la relis, puis elle est mise en ligne. Le code promo ne s'y applique pas. L'ancien Pack SEO à 25 € (10 pages) n'existe plus.
- **Deux achats bien séparés : créer le site, puis le maintenir.** Créer : 500 € une fois (boutique : + 200 €). Maintenir : l'abonnement **Mini, 10 € par mois, sans engagement** (id `base`, `forfaits` dans `src/config.js`), le seul qui existe depuis le 18 novembre 2026. **Maxi n'est plus proposé.**
  - Mini comprend : hébergement, **nom de domaine offert tant que l'abonnement est actif**, installation et mise en ligne, sauvegardes, sécurité, maintenance technique, tableau de bord, et les modifications incluses. **Une modification peut prendre jusqu'à 48 h** (délai habituel, pas une garantie : les CGV le disent). Une demande à la fois. Son dessin est le monstre « Maxi ».
  - **Tout le reste se prend en extra, depuis l'espace client**, sans engagement (liste dans `src/config.js` : `aLaDemande` pour les extras payés une fois, `options` avec `price.month` pour les extras au mois, regroupés par `extrasGroupes`). Les extras payés une fois se commandent dans « Mes demandes » et s'ajoutent à la prochaine facture Stripe, Alex les fait sous 7 jours. Les extras au mois se cochent dans « Abonnement et factures » (ligne d'abonnement Stripe en plus).
  - **Extras payés une fois** : page SEO optimisée 15 € (packs 1, 5, 10), article 15 €, avis Google sur le site 40 €, prise de rendez-vous 100 €, bouton WhatsApp 20 €, lettre d'information 60 €, Instagram en direct 50 €, traduction en anglais 100 €, page en plus 10 €, photos retouchées 25 €, reprise de l'ancien site 100 €, point de 30 minutes 15 €, et « demande en 24 heures » 5 € (case à cocher sur une demande de modification). **Au mois** : assistant Cerise sur le site 15 €, deux demandes à la fois 5 €, analyse de Mirette 5 €, une page SEO optimisée chaque mois 15 €, chaque semaine 50 €, e-mail pro 3 €, gestion du stock et comptes clients (boutiques) 5 € chacun. **Ces prix sont des propositions : on les change dans `config.js`.**
  - Certains extras sont des services qu'Alex installe à la main à la demande (Instagram, avis Google, rendez-vous, WhatsApp, lettre d'information, assistant sur le site, traduction). L'espace client les vend et vous prévient par e-mail, il ne les installe pas tout seul. L'assistant Cerise sur le site d'un client n'est pas encore automatisé (la barre de Cerise du site Les Minis Monstres, `includes/bulle-site.php`, en est le modèle).
  - **Ce qui dépend d'un extra dans l'extension** : l'analyse de Mirette (`aled08e_mirette_actif`), les pages SEO automatiques de Lumi (`aled08e_seo_rythme`, extras `seomois` et `seosemaine`), deux demandes à la fois (`aled08e_demandes_max`).
  - **L'ancien Maxi** (`forfaitsAnciens` dans `config.js`) : un client qui l'a déjà le garde (priorité, deux demandes, page SEO chaque semaine, analyse de Mirette), sa fiche l'affiche « ancien, plus proposé ». Rien n'est changé dans Stripe tout seul : si vous voulez le passer à Mini plus des extras, changez-le à la main (fiche client et abonnement Stripe).
  - **Changer d'abonnement** n'existe plus (un seul abonnement) : le client ajoute ou retire des extras au mois quand il veut.
- **« Je m'en occupe moi-même » = la création seule (500 €, sans abonnement)** : rien au mois. Le client gère son nom de domaine et son hébergement (il peut déjà les avoir). Il paie le site comme les autres : acompte 25 %, puis le reste à la réception, en une fois ou en 6 ou 12 fois sans frais (engagement le temps du paiement). L'automate saute le domaine et l'hébergement : la commande passe directement à « Tout est prêt » et vous recevez l'e-mail « CRÉATION SEULE ». À la fin, remettez-lui le code du site : les fichiers et une sauvegarde complète, avec une petite notice d'installation. Il l'installe lui-même ou avec l'aide de son hébergeur, et peut suivre des tutoriels publics gratuits (les guides d'aide de son hébergeur, par exemple). Maintenance, sauvegardes, sécurité et modifications ne sont pas comprises. Il peut prendre un abonnement (Mini ou Maxi) plus tard.
- **Modifications incluses, sans les compter.** Plus d'intervention par trimestre, plus d'intervention en plus à 5 €, plus d'énergie ni de limite de retouches. Le déroulé est dans la partie 9.
- **Code promo ou parrainage** (l'offre événement est retirée du site) : une seule case, au total et sur la page Commander. Un code promo donne 20 % de remise sur la création (le site et la boutique, jamais l'abonnement ni les pages SEO supplémentaires). Vos codes se règlent dans ALED08 › Réglages › « Codes promo », un par ligne. Il n'y a plus de code par défaut : tant que la liste est vide, aucun code promo ne marche. Le code de parrainage d'un client marche dans la même case : il devient le parrain de la commande (un mois offert à chacun).
- **Paiement de la création** : 25 % à la commande (site et boutique), le reste à la réception, en une fois ou en 6 ou 12 fois sans frais, avec l'abonnement comme en création seule. Avec l'abonnement et un paiement étalé, l'abonnement est payé au mois. Parrainage : 1 mois offert pour vous deux. Deuxième site : 10 % de remise.
- **Les anciens clients** gardent leurs options et extras tant qu'ils ne les retirent pas (ils les voient dans « Abonnement et factures », seulement pour les retirer). Un abonnement déjà en cours continue à son prix actuel (c'est ce que disent les CGV, article 7). Un client qui avait l'ancienne formule à 20 € (id `evolution`) est maintenant lu par l'extension comme Maxi, et un client à 10 € (id `base`) comme Mini. Leur prix Stripe ne change pas tant que vous ne le modifiez pas.

Les repères de prix du marché et la comparaison des assistants IA sont dans `docs/prix-et-ia-2026.md`.

Tous les prix viennent d'un seul fichier, `src/config.js`. Si un prix change, on relance `node build.js && python3 scripts/wp-export.py` et on réinstalle le thème et l'extension (voir la partie 12). L'extension lit ses prix dans son fichier `data.json`, fabriqué à ce moment-là.

## 2. Où sont les choses

| Pour… | Allez dans… |
|---|---|
| Voir ce qui demande une action | ALED08 › Tableau de bord |
| Suivre une commande, cliquer sur ses étapes | ALED08 › Commandes |
| Lire et traiter une demande de modification | ALED08 › Demandes clients |
| Activer Stripe, régler l'e-mail de réception | ALED08 › Réglages |
| Modifier la fiche d'un client (forfait, lien d'avis, chiffres, factures saisies à la main) | Comptes › le client › partie « Espace client ALED08 » |

Pages du site : `/creer-mon-site/` (configurateur), `/commander/` (récapitulatif et formulaire), `/commande-confirmee/` (merci), `/mon-espace/` (espace client, connexion sur la page elle-même), `/mon-espace/demo/` (démonstration).

Une pastille rouge sur le menu ALED08 indique le nombre de commandes à traiter.

## 3. Une commande, de A à Z

Le paiement en deux temps : le client paie 25 % de la création à la commande (boutique en ligne comprise s'il l'a prise, rien d'autre : les pages SEO supplémentaires se commandent plus tard depuis l'espace client). À la réception du site (statut « En ligne »), il choisit dans son espace, onglet « Ma commande » : le reste en une fois, ou en 6 ou 12 fois sans frais (engagement le temps de payer). C'est vrai aussi en création seule. Le même paiement Stripe démarre son abonnement, s'il en a un. Sans Stripe, ou s'il paie autrement, bouton « Reste payé (hors Stripe) » dans la fiche ; « Copier un lien de paiement du reste » donne un lien valable 24 heures.

Un ancien client retire ses anciens extras quand il veut (« Abonnement et factures », dans Mon compte) : l'abonnement Stripe est mis à jour, le nouveau prix s'applique à l'échéance suivante, et vous recevez un e-mail. Aucun extra ne s'ajoute plus.


### Ce qui se passe tout seul

1. Le client configure son site, clique « Commander », remplit `/commander/` et accepte les conditions.
2. L'extension vérifie tout côté serveur (champs, e-mail, nom de domaine libre, cases cochées) et recalcule tous les montants : le navigateur ne fait jamais foi.
3. Elle crée le **compte client** (ou rattache la commande au compte qui a déjà cet e-mail), puis la **commande** avec une référence du type `ALED-2026-0001`.
4. Elle envoie deux e-mails : le récapitulatif complet pour vous (avec le lien de la fiche), et le récapitulatif pour le client (avec ce qui se passe ensuite). Un nouveau client reçoit aussi « Votre espace client ALED08 » avec le lien pour choisir son mot de passe.
5. **Si Stripe est activé** : le client est envoyé sur la page de paiement Stripe. Quand le paiement est confirmé, la commande passe à « Payée », le client reçoit un e-mail, et vous recevez le récapitulatif du nom de domaine à réserver.
   **Si Stripe n'est pas activé** : la commande reste « En attente de paiement » et le client voit « Je vous envoie le lien de paiement sous 24 heures ». C'est à vous de lui envoyer un lien ou un RIB, puis de cliquer « Marquer payée ».

### Ce que vous faites, dans la fiche de la commande

Les boutons sont dans la colonne de droite. Chaque clic est noté dans le journal, en bas de la fiche.

| Bouton | Quand | Ce que ça fait |
|---|---|---|
| Marquer payée (hors Stripe) | Le client a payé par virement, espèces, ou par un lien envoyé à la main | Statut « Payée », e-mail au client |
| Domaine réservé | Vous avez commandé le nom de domaine chez o2switch | Le rappel quotidien s'arrête |
| Création en cours | Vous commencez le site | Le client voit « Création » dans sa frise |
| Site en ligne | Le site est en ligne | E-mail au client, avec le solde à payer s'il y en a un ; le parrain reçoit son mois offert |
| Solde payé (hors Stripe) | Le solde a été réglé autrement | Le solde est noté payé |
| Copier un lien de paiement du solde | Stripe activé, solde dû | Un lien de paiement valable 24 heures, à envoyer au client |
| Renvoyer l'e-mail d'accès à l'espace | Le client ne retrouve pas l'e-mail | Nouveau lien pour choisir le mot de passe (le mot de passe actuel n'est pas changé) |
| Brancher sur l'hébergement | Seulement si le cPanel est configuré (partie 11) | Crée le domaine additionnel et la boîte e-mail |
| Annuler la commande | La commande ne se fera pas | Statut « Annulée ». Le client n'est pas prévenu automatiquement : écrivez-lui. Si un abonnement Stripe existe, arrêtez-le aussi dans Stripe |

Vous pouvez aussi écrire une **note pour vous** dans la fiche : le client ne la voit pas.

### Ce que le client voit

Dans son espace, onglet « Ma commande » : une frise (Commande reçue, Paiement, Création, En ligne), son nom de domaine et son état, ses montants, et selon le cas le bouton « Payer maintenant » (commande en attente) ou « Payer le solde de X € » (site en ligne, solde dû). Dans « Forfait et factures » : son forfait, ses factures Stripe (ajoutées toutes seules) et celles que vous saisissez à la main, et le bouton « Gérer mon paiement et mes factures » s'il est client Stripe.

## 4. La mise en ligne automatique (nom de domaine, hébergement, SSL)

Dès que la commande est payée, l'automate enchaîne tout seul, une étape toutes les cinq minutes au plus :

1. **Nom de domaine** : acheté chez OVH au nom du client (vous êtes contact technique). Tant que la case « Essai à blanc » est cochée dans les réglages, vous recevez un e-mail avec le prix et vous cliquez « Confirmer l'achat OVH » dans la fiche. Décochez la case quand vous avez confiance.
2. **Hébergement** : le domaine est rattaché à votre hébergement OVH (dossier `sites/le-domaine.fr`, www compris), ou ajouté dans cPanel si vous avez un jeton, ou à la main (vous recevez un e-mail et vous cliquez « Domaine ajouté sur l'hébergement »).
3. **DNS et e-mail pro** : l'automate attend que le domaine pointe vers l'hébergement, puis crée la boîte contact@ si l'option est commandée (le client reçoit ses identifiants par e-mail).
4. **Certificat SSL** : dès que le site répond en HTTPS, le client reçoit « Tout est prêt, je crée votre site » et la commande passe à « Prêt ». Vous recevez le même signal.
5. **Création** : c'est vous. Quand le site est terminé, cliquez « Site en ligne ».

Le client voit chaque étape dans son espace, onglet « Ma commande », avec Cerise qui avance sur la frise. Le texte dit « en général une heure environ, jusqu'à 24 heures pour certains noms de domaine ». La page se met à jour toute seule.

Si une étape échoue trois fois ou dure trop longtemps, vous recevez un e-mail « Intervention nécessaire » avec l'erreur exacte. Le client voit seulement « je m'en occupe personnellement ». Dans la fiche : « Réessayer maintenant », « Passer l'étape » (si vous l'avez faite à la main) ou « Tout est prêt (forcer) ».

### Régler OVH, pas à pas

1. Ouvrez un compte sur ovhcloud.com et enregistrez un moyen de paiement par défaut (carte ou prélèvement). Commandez l'hébergement web « Pro » (ou plus, voir le point 11).
2. Créez les clés d'API sur https://eu.api.ovh.com/createToken/ avec ces droits : `GET /auth/time`, `GET /me`, `POST /me/contact`, `GET /me/contact/*`, `GET /me/order/*`, `POST /me/order/*/payWithRegisteredPaymentMean`, `GET /order/cart`, `POST /order/cart`, `GET /order/cart/*`, `POST /order/cart/*`, `GET /domain/*`, `PUT /domain/*`, `POST /domain/*/nameServers/update`, `GET /hosting/web/*`, `POST /hosting/web/*`, `GET /email/domain/*`, `POST /email/domain/*`. Validité : illimitée.
3. Dans WordPress, menu ALED08, Réglages, section « Mise en ligne automatique » : collez les trois clés, le nom de l'hébergement (Web Cloud, Hébergements, « nom du service », par exemple `xxxxx.cluster0yy.hosting.ovh.net`), laissez « Essai à blanc » coché, enregistrez, puis « Tester OVH ». Le test affiche votre identifiant OVH et l'état de l'hébergement.
4. Faites une vraie commande de test avec un domaine à 4,99 € HT (un .fr jamais utilisé), suivez-la dans la fiche, et mesurez les délais réels.

Prix OVH relevés le 14 novembre 2026 : .fr 4,99 € HT la première année puis 7,79 € HT par an ; .com 8,49 € HT puis 14,29 € HT. Le renouvellement automatique est activé par l'automate.

## 5. Activer Stripe, pas à pas

Tant qu'aucune clé n'est enregistrée, le site fonctionne en mode « paiement en attente » : les commandes sont prises, les e-mails partent, et vous envoyez le lien de paiement vous-même. Vous pouvez donc ouvrir le site avant d'avoir fini cette partie.

### 5.1 Le compte Stripe

1. Créez un compte sur https://stripe.com (ou connectez-vous). Renseignez l'activité, le RIB de réception et l'identité : Stripe vérifie ces informations avant de vous verser l'argent.
2. Dans **Paramètres › Informations sur l'entreprise**, mettez le nom « ALED08 » : il apparaît sur les relevés bancaires des clients.

### 5.2 Les moyens de paiement

Dans **Paramètres › Paiements › Moyens de paiement**, activez :
- **Cartes** (déjà actives).
- **Prélèvement SEPA** : pratique pour les forfaits mensuels. Attention : un paiement SEPA est confirmé en quelques jours. La commande reste « En attente de paiement, prélèvement en cours » jusqu'à la confirmation, puis passe à « Payée » toute seule.

Le site n'impose aucun moyen de paiement : la page de paiement propose ce que vous avez activé ici.

### 5.3 Les clés

1. Dans Stripe : **Développeurs › Clés API**. Copiez la **clé secrète** (elle commence par `sk_test_` en mode test, `sk_live_` en mode réel).
2. Dans WordPress : **ALED08 › Réglages**, collez-la dans « Clé secrète », puis **Enregistrer**. La clé n'est jamais réaffichée : la page indique seulement « clé enregistrée, se termine par …xxxx ».
3. Cliquez **Tester la connexion** : vous devez lire « OK (mode test) » ou « OK (mode réel) ». Sinon, l'erreur renvoyée par Stripe s'affiche telle quelle.

Vous préférez ne pas garder la clé dans la base de données ? Mettez-la dans `wp-config.php` :
```php
define('ALED08_STRIPE_SECRET', 'sk_live_…');
define('ALED08_STRIPE_WEBHOOK_SECRET', 'whsec_…');
```
Les constantes passent avant les réglages de la page.

### 5.4 Le webhook (indispensable)

Le webhook est la façon dont Stripe prévient le site qu'un paiement est confirmé. Sans lui, les commandes restent « En attente de paiement » même quand le client a payé.

1. Dans Stripe : **Développeurs › Webhooks › Ajouter une destination** (ou « Ajouter un point de terminaison »).
2. Adresse à appeler : `https://www.les-minis-monstres.fr/wp-json/aled08/v1/stripe`
3. Format des événements : **Snapshot** (l'objet complet est envoyé). Version d'API : **2026-10-28.endive**. Si Stripe propose « version du compte », choisissez explicitement cette version.
4. Événements à cocher (7) :
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Une fois créé, cliquez sur le webhook et révélez le **secret de signature** (il commence par `whsec_`). Collez-le dans **ALED08 › Réglages › Secret du webhook**, puis Enregistrer.
6. Dans Stripe, « Envoyer un événement test » : il doit apparaître dans ALED08 › Tableau de bord › Derniers événements Stripe (un événement test est noté « ignoré » ou « commande inconnue » : c'est normal, il ne correspond à aucune commande).

Chaque événement est vérifié (signature) et traité une seule fois. Le tableau de bord garde les 50 derniers.

Faites tout d'abord en **mode test** (clés `sk_test_` et webhook créé en mode test, carte de test 4242 4242 4242 4242). Quand une commande de test passe de bout en bout (payée, facture dans l'espace client, nom de domaine à réserver dans votre e-mail), recommencez les points 5.3 et 5.4 en **mode réel** : le webhook de test et le webhook réel sont deux objets différents dans Stripe, chacun avec son secret.

### 5.5 Comment Stripe facture une commande

- **À la commande** : l'acompte de 25 % (boutique comprise si elle est choisie), payé une fois. Les pages SEO optimisées (15 € la page) ne se prennent pas à la commande : le client les commande plus tard depuis « Mes demandes », et chacune s'ajoute à sa prochaine facture Stripe (sans abonnement, vous la facturez à la main).
- **À la réception** : le reste, en une fois, ou en 6 ou 12 fois sans frais (prix divisé par 6 ou 12, arrondi au centime inférieur). Avec l'abonnement, tout est dans un seul abonnement Stripe : la ligne de l'abonnement au mois et, s'il y a lieu, la ligne des mensualités du site. En création seule, l'abonnement ne porte que les mensualités, ou bien c'est un simple paiement si le reste est réglé en une fois.
- **Fin du paiement en plusieurs fois** : l'extension compte les mensualités payées (« Lissage : 4 / 12 payées » dans la fiche et le tableau de bord). Après la dernière, la ligne des mensualités est retirée de l'abonnement : il ne reste que l'abonnement au mois, sans engagement. En création seule, l'abonnement entier s'arrête tout seul.
- Les factures Stripe apparaissent dans l'espace client dès qu'elles sont payées.

## 6. Le portail client Stripe

Le bouton « Gérer mon paiement et mes factures » de l'espace client ouvre le portail Stripe du client : il y change sa carte ou son IBAN et télécharge ses factures. Il faut le configurer une fois :

1. Stripe : **Paramètres › Facturation › Portail client**.
2. Autorisez : **mettre à jour le moyen de paiement**, **consulter l'historique des factures**.
3. N'autorisez PAS : annuler l'abonnement, changer d'offre, modifier la quantité. L'engagement pendant le paiement en plusieurs fois et les changements d'abonnement (passage de Mini à Maxi ou l'inverse, à partir du mois suivant, ou passage du mois à l'année) passent par vous (le client vous écrit, vous ajustez l'abonnement dans Stripe).
4. Enregistrez. Le lien du portail est créé à chaque clic et expire en 5 minutes : il n'y a rien à copier.

## 7. Les factures : mention TVA et SIRET

- Le **pied de page** des factures se règle dans ALED08 › Réglages, « Pied de page des factures ». Par défaut : « ALED08, entreprise individuelle. TVA non applicable, art. 293 B du CGI. » (franchise en base de TVA). Il est envoyé à Stripe pour l'abonnement et pour le solde.
- Réglez aussi le pied de page par défaut dans Stripe (**Paramètres › Facturation › Modèle de facture**) : il couvre la toute première facture de chaque abonnement et sert de filet.
- **Le SIRET** : quand vous le recevez, ajoutez-le au pied de page (par exemple « ALED08, entreprise individuelle, SIRET 000 000 000 00000. TVA non applicable, art. 293 B du CGI. »), dans Stripe (Informations sur l'entreprise) et dans `src/config.js` (`legal.siret`) pour les mentions légales du site, puis relancez le build et l'export.
- Si un jour vous dépassez le seuil de la franchise de TVA, il faudra changer la mention, activer la TVA dans Stripe (Stripe Tax ou taux manuel) et revoir les prix affichés. Prenez conseil avant.

## 8. Les comptes clients automatiques

- Le compte est créé à la commande : identifiant tiré de l'e-mail, prénom, nom, rôle « Client ALED08 ». Le client reçoit « Votre espace client ALED08 » avec le lien pour choisir son mot de passe. Si l'e-mail a déjà un compte, la commande est rattachée à ce compte et son mot de passe ne change pas.
- La connexion se fait sur `/mon-espace/` (pas sur wp-login.php, filtré par le pare-feu o2switch). « Mot de passe oublié » fonctionne depuis cette page.
- Un client n'a accès à rien d'autre que son espace : s'il arrive sur l'administration, il est renvoyé sur `/mon-espace/`.
- **Dernière connexion** : notée à chaque connexion et à chaque visite de l'espace (au plus une fois par jour). Visible dans la fiche du client.
- **Suppression automatique** : chaque nuit, la tâche `aled08_quotidien` cherche les comptes clients sans connexion depuis 12 mois ET sans abonnement actif. Un mois avant, le client reçoit un e-mail d'avertissement ; s'il se reconnecte, c'est annulé. À 12 mois, le compte est supprimé avec ses demandes et ses photos. « Abonnement actif » veut dire : abonnement Stripe actif ou en retard de paiement, OU case « Abonnement actif hors Stripe » cochée dans la fiche du client, OU une commande non annulée de moins de 12 mois. Un administrateur n'est jamais concerné.
- Le tableau de bord montre les comptes qui seront supprimés dans les 30 jours, et le journal des créations, avertissements et suppressions. Pour garder un compte qui paie autrement, cochez « Abonnement actif hors Stripe » dans sa fiche.
- Cette règle de conservation est indiquée dans la politique de confidentialité du site.

### Créer un compte à la main (ancien client, cas particulier)

Comptes › Ajouter : identifiant, e-mail, prénom, rôle **Client ALED08**, case « Envoyer une notification » cochée. Plus bas, la partie « Espace client ALED08 » : forfait, adresse du site, lien d'avis Google, « Parrainé par (code) ». Pensez à cocher « Abonnement actif hors Stripe » si ce client ne paie pas par Stripe.

## 9. Les demandes de modification

Depuis le 17 novembre 2026 (deuxième version) : **les Minis Monstres aident, c'est Alex qui modifie.** Aucun petit monstre ne touche au site d'un client.

1. Le client écrit sa demande dans l'onglet « Demandes » (avec des photos s'il veut). La jauge apparaît : Demande reçue, Précisée avec Cerise, Chez Alex, Faite.
2. Cerise relit la demande (elle peut lire le site relié, sans rien modifier). Si c'est flou, elle pose une question (deux au plus), le client répond depuis la jauge.
3. Cerise reformule la demande clairement et la fait confirmer au client (« Vérifier ma demande » dans la jauge). Non : le client corrige, Cerise reprend (au deuxième « non », la demande part chez Alex avec les remarques).
4. Oui : Cerise répond « Merci pour vos précisions ! Je transmets votre demande à Alex », et Alex reçoit un e-mail avec la demande claire, la demande d'origine, les photos, les échanges et l'échéance.
5. Délais, à compter de la confirmation : **48 h au plus** (24 h si le client a coché « Votre demande en 24 heures », 5 €), une demande à la fois (deux avec l'extra « Deux demandes à la fois »). Un extra commandé : sous 7 jours.
6. Dans « Mon espace », onglet « À faire » : les demandes chez Alex, les anciens Maxi d'abord puis par échéance (orange à moins de 24 h, rouge en retard). Boutons « Je commence » puis « C'est fait, prévenir le client ». Un rappel part la veille de l'échéance, et un autre si elle est dépassée.
7. Le client peut annuler tant qu'Alex n'a pas cliqué « Je commence » (Alex est prévenu si la demande était déjà chez lui). Une demande qui attend le client plus de 7 jours est annulée toute seule. Si Cerise n'a pas pu relire une demande sous 24 h, elle part chez Alex telle quelle.
8. Pages SEO : Lumi analyse le site (pages existantes, recherches Google) et choisit le sujet (titre, recherche visée, plan). Elle crée une demande « Page SEO » chez Alex, qui écrit et publie la page. Extras : une page SEO chaque mois, ou chaque semaine. Pack : un sujet par page, une échéance tous les trois jours.
9. La recherche de prospects a été retirée du tableau de gestion.

## 10. Le parrainage

- Chaque client a un code (par exemple `LILA-7K2`) et un lien `https://www.les-minis-monstres.fr/creer-mon-site/?parrain=LILA-7K2`, onglet Parrainage, avec un bouton WhatsApp.
- Le code suit le visiteur jusqu'à la commande (champ « Code de parrainage » de `/commander/`, prérempli). Vous le voyez dans l'e-mail de commande et dans la fiche.
- Quand vous cliquez « Site en ligne », le parrain reçoit un e-mail et un mois offert est noté chez le parrain et chez le filleul (« Mois offerts à utiliser » dans leurs fiches). Pour l'appliquer, ajoutez un coupon ou un crédit dans Stripe sur l'abonnement concerné, puis remettez le compteur à zéro dans la fiche.

## 11. Hébergement : OVH ou o2switch, et la migration

Comparaison relevée le 14 novembre 2026 (prix HT) :

| | o2switch (offre Cloud) | OVH (offre Pro) |
|---|---|---|
| Prix | 16 € par mois (192 € par an) | 1,99 € par mois la première année, puis 9,99 € par mois (12 mois payés d'avance) |
| Sites | illimités, un seul compte cPanel | 100 sites, 10 bases de données de 2 Go (3 WordPress par base possibles), 100 boîtes e-mail |
| Domaine | 1 offert tant que l'hébergement est actif ; .fr environ 10,75 € HT par an | 1 offert la première année ; .fr 4,99 € HT puis 7,79 € HT |
| Automatisation | pas d'API pour acheter un domaine ; jetons cPanel désactivés en novembre 2026 | tout par API : domaine, rattachement, SSL, base, WordPress, e-mail |
| Serveur | LiteSpeed, support réputé | Apache, support en heures ouvrées |
| Pour 10 sites | environ 22 € par mois | environ 16,50 € par mois |
| Pour 30 sites | environ 35 € par mois | environ 29,50 € par mois sur Pro (bases partagées), 39,50 € sur Performance |

Décision prise (14 novembre 2026) : **noms de domaine achetés automatiquement chez OVH, sites hébergés chez o2switch** (sites illimités). Dans les réglages : clés OVH renseignées, nom de l'hébergement OVH laissé vide, hébergeur « Automatique ». L'automate achète le domaine avec les DNS o2switch (ns1/ns2.o2switch.net), puis vous envoie un e-mail : ajoutez le domaine dans cPanel (2 minutes), cliquez « Domaine ajouté sur l'hébergement », et la suite (certificat HTTPS, « tout est prêt ») est automatique. Le jour où o2switch rétablit les jetons d'API, renseignez-le (section suivante) et cette étape devient automatique aussi.

Si un jour vous préférez tout héberger chez OVH, la marche à suivre est ci-dessous.

1. Commandez l'hébergement Pro, créez les clés (point 4), testez l'automate sur un domaine d'essai.
2. Les nouveaux clients partent chez OVH dès que l'automate tourne.
3. Les sites existants restent chez o2switch jusqu'à la fin du contrat annuel (pas de remboursement au prorata), puis sont migrés par lots de 5 : sauvegarde JetBackup (fichiers, base, e-mails), envoi par FTP dans le bon dossier, import de la base, wp-config.php, retrait de LiteSpeed Cache, permaliens, test, puis bascule des DNS en heure creuse et certificat SSL. Comptez 30 minutes à 2 heures par site.
4. Les noms de domaine se transfèrent en dernier (.fr 4,59 € HT, 8 jours minimum ; .com 8,49 € HT), une fois le site et les e-mails vérifiés chez OVH.
5. Ne renouvelez pas o2switch ; ses données sont supprimées 30 jours après l'échéance.

### cPanel o2switch (secours)

Si o2switch rétablit les jetons d'API, l'automate peut ajouter le domaine et la boîte e-mail dans cPanel : ajoutez dans wp-config.php `ALED08_CPANEL_HOST` (le nom du nœud, par exemple `chabot.o2switch.net`), `ALED08_CPANEL_USER`, `ALED08_CPANEL_TOKEN` et `ALED08_CPANEL_MAIN_DOMAIN`, puis choisissez « o2switch cPanel » comme hébergeur dans les réglages et testez. Le jeton donne tous les droits du compte : gardez-le hors de la base de données.

## 12. Mettre à jour le site, le thème et l'extension

Sur l'ordinateur, dans le dossier du projet :
```bash
node build.js                      # fabrique le site dans dist/
node scripts/check.js              # 0 erreur, 0 avertissement attendus
python3 scripts/wp-export.py       # fabrique wp-export/aled08.zip, aled08-import.zip, aled08-espace.zip
```
Puis dans WordPress :
1. **Apparence › Thèmes › Ajouter › Téléverser** `aled08.zip` (remplacer le thème existant). Le thème contient les styles, dont `assets/css/espace.css` pour l'espace client.
2. **Extensions › Ajouter › Téléverser** `aled08-espace.zip` (remplacer). L'extension garde ses réglages et ses commandes : seuls les fichiers changent.
3. Pour recréer les pages à partir du site généré : téléverser `aled08-import.zip`, l'activer (il fait son travail à l'activation), puis le désactiver et le supprimer. Il met aussi en place les redirections des anciennes adresses (par exemple `/comparatif-shopify/` vers `/comparatif/`).
4. Vider le cache LiteSpeed (barre d'administration, « Purge All »).

Ne touchez jamais aux fichiers de l'extension directement sur le serveur : la prochaine mise à jour les écraserait. Les changements se font dans `src/wordpress/aled08-espace/`, puis export.

## 12 bis. Le site sur son propre nom : les-minis-monstres.fr

Le site des Minis Monstres vit sur **son propre WordPress**, à l'adresse `https://www.les-minis-monstres.fr`, entièrement séparé de aled08.fr (qui sera réutilisé pour un autre site). L'adresse du site est dans `src/config.js` (`site.url`).

**Installer (ou réinstaller) sur un WordPress neuf**
1. Générez les fichiers : `node build.js` puis `python3 scripts/wp-export.py` (le dossier `wp-export/` est créé, il n'est pas dans git).
2. Sur le WordPress du nouveau domaine : Extensions › Ajouter › Téléverser, choisissez **`minis-installeur.zip`**, installez, activez.
3. L'installeur dépaquette tout seul le thème, l'espace client, le kit Claude, crée les pages et règle WordPress. Un message vert résume ce qui a été fait. Supprimez ensuite l'extension « installeur ».
4. Entrez vos clés dans **Les Minis Monstres › Réglages** : Stripe (clé et webhook), Claude, OVH si vous l'utilisez, adresse e-mail.
5. **Stripe** : dans Développeurs › Webhooks, l'adresse est `https://www.les-minis-monstres.fr/wp-json/aled08/v1/stripe`.
6. **E-mails** : les messages partent de l'adresse du nouveau nom. Vérifiez chez votre fournisseur d'e-mail que le domaine peut envoyer (SPF et DKIM), sinon ils iront dans les indésirables.
7. **Google Search Console** : ajoutez le nouveau site et envoyez `https://www.les-minis-monstres.fr/wp-sitemap.xml`.
8. **Comptes clients** : les comptes de l'ancien WordPress ne sont pas recopiés. Recréez-les (Utilisateurs, rôle « client Minis Monstres ») ou faites-les se réinscrire.

**Sites clients** : le connecteur (1.5.1) et la mention « Site fait par les Minis Monstres » pointent vers le nouveau nom. Les sites déjà installés gardent l'ancien lien tant que vous ne les mettez pas à jour.

## 13. Vérifications après la mise en ligne

Faites cette liste une fois, en vrai, avec un téléphone et un ordinateur.

- [ ] `/creer-mon-site/` : le bouton « Commander » ouvre `/commander/` avec la bonne configuration (type, forfait, période, lissage, nom de domaine, options).
- [ ] `/commander/` : une commande de test avec une adresse e-mail à vous. Les deux e-mails arrivent (récapitulatif pour vous, récapitulatif pour le client), puis l'e-mail « Votre espace client ALED08 ».
- [ ] Le lien du mot de passe fonctionne ; la connexion sur `/mon-espace/` fonctionne ; l'onglet « Ma commande » montre la bonne frise et les bons montants.
- [ ] Erreurs volontaires : e-mail invalide, case CGV décochée, nom de domaine déjà pris. Le message s'affiche en haut du formulaire et la configuration est conservée.
- [ ] Stripe en mode test : paiement par carte 4242 4242 4242 4242. La commande passe à « Payée », vous recevez l'e-mail « nom de domaine à réserver », la facture apparaît dans l'espace du client, l'événement est dans le tableau de bord.
- [ ] Stripe : « Site en ligne » envoie l'e-mail avec le solde ; le bouton « Payer le solde » fonctionne et la commande note « solde payé ».
- [ ] Stripe : le bouton « Gérer mon paiement et mes factures » ouvre le portail, sans possibilité d'annuler l'abonnement.
- [ ] Stripe en mode réel : clés et webhook réels enregistrés, test de connexion « OK (mode réel) ». Une vraie commande à 5 € sur un compte à vous, puis remboursement depuis Stripe.
- [ ] Le prélèvement SEPA, si activé : la commande reste « prélèvement en cours » puis passe à « Payée » quelques jours plus tard.
- [ ] ALED08 › Tableau de bord : la tâche quotidienne est planifiée (date affichée). Si elle ne tourne pas (sites peu visités), ajoutez une tâche cron chez o2switch qui appelle `https://www.les-minis-monstres.fr/wp-cron.php?doing_wp_cron` une fois par jour.
- [ ] Une demande de modification depuis l'espace de test, avec une photo : e-mail reçu, statut « Faite » envoie l'e-mail au client.
- [ ] Le lien de parrainage préremplit le code sur `/commander/`.
- [ ] `/comparatif-shopify/` redirige vers `/comparatif/` (301). Les anciennes adresses de l'électricien redirigent vers l'accueil.
- [ ] Les pages `/commander/`, `/commande-confirmee/` et `/mon-espace/` ne sont pas dans le plan du site et portent `noindex`.
- [ ] Supprimez la commande de test (Commandes › Corbeille) et le compte de test, ou gardez-les si vous voulez des exemples.
- [ ] Mentions légales et CGV à jour : SIRET quand il arrive, médiateur de la consommation.

## La petite bande (novembre 2026)

Le site public ne parle ni d'IA ni de jetons. Alex conçoit et fait les sites. À côté, ses automatisations sont dessinées en petits monstres (`src/lib/bestiaire.js`), chacun avec un prénom et un seul rôle (`bande` dans `src/config.js`) :

- **Cerise** : l'assistante de la bulle d'aide (et les questions dans l'espace client).
- **Mochi** : le gardien (mises à jour, sauvegardes, surveillance), compris dans l'abonnement.
- **Bricou** : le bricoleur, qui fait les modifications demandées par le client.
- **Plume** (textes, avis) et **Pouf** (réseaux, photos) : les outils de l'espace client.
- Un monstre par option au mois : **Lumi** (Suivi Google), **Mirette** (Chiffres détaillés), **Minou** (e-mail pro), **Pistache** (stock), **Champi** (comptes clients).
- **Alex** a son portrait (`alexPortrait()`).

Dans l'espace client, le compteur s'appelle « énergie » (100 points par mois, recharge 1 € les 100).

### Une demande pour Bricou

1. Le client choisit Bricou : sa demande passe à l'état « attente_alex ». Bricou lui écrit « Je la montre à Alex, et je m'y mets dans 30 minutes au plus tard ».
2. Alex reçoit un e-mail avec deux liens (il doit être connecté en administrateur) : **Laisser Bricou faire maintenant**, ou **Je m'en occupe moi-même** (l'énergie du client lui est rendue).
3. Sans réponse en 30 minutes, Bricou se lance tout seul. Le client reçoit « Demande confirmée : Bricou s'en occupe » (ou « Alex a validé votre demande » si Alex a cliqué).
4. Bricou prépare la modification. Le client valide l'aperçu avant toute mise en ligne, comme avant.

## (Ancien) Bricou avec le MCP WordPress du site client : plus utilisé

Par défaut, Bricou modifie le site d'un client avec le connecteur (quelques outils, aperçu, accord du client, puis mise en ligne). Pour lui donner tous les outils du MCP du site (l'extension « Easy MCP AI » : pages, articles, menus, médias, CSS, réglages, historique…) :

1. Sur le site du client, dans l'extension MCP, créer une clé (jeton) pour Bricou.
2. Dans la fiche du client (Utilisateurs), section « Bricou : MCP WordPress du site » : coller l'adresse du MCP (`https://site-du-client.fr/wp-json/easy-mcp-ai/v1/mcp`) et la clé. Pour revenir au connecteur : « Retirer le MCP ».
3. Une demande de modification suit alors ce circuit : Bricou modifie le site tout de suite avec les outils du MCP ; le client voit l'avant / l'après et un lien vers le résultat (jauge, étape « Visuel à valider ») et valide ; Alex reçoit le mail de validation (mis en ligne sans refus sous 30 minutes). Si le client dit non, si Alex refuse ou si la demande est annulée, Bricou remet le site comme avant avec le journal de ses actions (`_aled08_mcp_journal`) et l'historique du site ; si ce n'est pas possible, Alex reçoit un e-mail.
4. Les outils qu'on ne peut pas défaire sont interdits par défaut (supprimer une extension ou un compte, mettre à jour, WP-CLI, rechercher-remplacer dans la base…). La liste est l'option `aled08_mcp_interdits` (un nom d'outil par ligne) ; la vider autorise tous les outils.

Les fichiers PHP du thème restent en lecture seule dans le MCP : un texte écrit en dur dans le thème (le nom du site dans l'en-tête, par exemple) ne peut pas être changé par Bricou avec le MCP.

### MCP intégré au connecteur (version 2 et suivantes) : ÉTEINT par défaut

Avec le MCP, Bricou modifie le site AVANT la validation du client : c'est pourquoi il est éteint. Le circuit normal (aperçu, validation, puis mise en ligne) ne touche au site qu'après le « oui ». Réactivation : option `aled08_mcp_actif` = 1.


Le connecteur (extension « Les Minis Monstres : connecteur ») contient son propre serveur MCP (`/wp-json/alexlia/v1/mcp`, HTTP, réponses JSON). Pour un nouveau client : installer le connecteur et le relier comme avant (même clé de liaison) ; rien d'autre. L'espace client voit que le connecteur a le MCP (champ `mcp` de l'action « infos »), déduit la clé du MCP de la clé de liaison (HMAC, calcul à sens unique refait des deux côtés) et Bricou travaille avec ces outils : lister, lire, remplacer un texte, modifier, créer, importer une image, nom et slogan, `texte_visible`, `affichage_remplacer` (texte écrit en dur par le thème, remplacé à l'écran), CSS additionnel, révisions et `restaurer_revision`. Les changements sont faits tout de suite, le client valide ensuite (jauge, étape « à valider »), et tout est remis comme avant s'il refuse. Dans la fiche du client, une case permet de ne pas utiliser le MCP (retour à l'aperçu avant mise en ligne). Les champs « adresse et clé du MCP » ne servent que pour une autre extension MCP.

## Le circuit d'une demande

Voir la section 9 : Cerise prépare la demande avec le client, Alex fait la modification. Le circuit de Bricou (modifications par l'IA, aperçu, MCP) n'est plus utilisé.

## La barre de discussion de Cerise pour tous les visiteurs

Dans la bulle de Cerise, sur toutes les pages du site, un visiteur peut poser une question libre (prix, abonnements, délais, façon de travailler). Cerise répond avec les faits de l'offre (tirés de `data.json`) et peut proposer un lien vers une page. Elle ne peut rien modifier ni promettre.

- Point d'entrée public : `POST /wp-json/aled08/v1/bulle-site` (`admin-ajax.php` n'est pas joignable par les visiteurs sur ce site). Code : `includes/bulle-site.php`.
- Garde-fous : la demande doit venir d'une page du site ; 10 questions par heure et 30 par jour par visiteur (empreinte de l'adresse IP) ; 400 questions et 2 $ par jour pour tout le site (options `aled08_bulle_site_jour` et `aled08_bulle_site_budget`) ; question de 300 caractères au plus ; modèle rapide de la bulle (`aled08_bulle_modele`).
- Aucune question n'est enregistrée : seul le coût du jour est compté. Sans clé Claude, la barre répond « écrivez à Alex ».
