# Gérer le site ALED08 : le guide du propriétaire

Ce guide explique, en français simple, comment fonctionne le site www.les-minis-monstres.fr au quotidien : les commandes, les paiements, les noms de domaine, les comptes clients et les demandes de modification. Tout se passe dans WordPress, menu **ALED08** (le visage souriant, en haut à gauche).

## 1. L'offre, en bref (offre unique du 21 novembre 2026)

- **La page de commande, de haut en bas** : le site (avec la case « E-commerce »), puis la façon de le faire vivre (Autonomie ou Forfait Mini), le nom de domaine avec le forfait Mini, et enfin le total avec le paiement (une fois ou en plusieurs fois) et le code promo.
- **Un seul site, payé une fois** (`config.offreSite` et `types` dans `src/config.js`) :
  - 👾 **Site Essentiel, 749 €, 549 € en offre de lancement jusqu'au 25 novembre 2027** (id `une-page`, `creation.prix` = le prix payé, `creation.prixNormal` = 749 €, réglage `lancement`) : site personnalisé, assemblé à partir de nos modules (accueil, présentation, services et tarifs, galerie, questions fréquentes, contact) et rempli avec les informations et les photos du client, design adapté à l'activité, compatible téléphone et ordinateur, formulaire de contact, bases du référencement Google, rendez-vous téléphonique de découverte, révisions illimitées jusqu'à validation finale, mise en ligne complète, modifiable par le client lui-même avec le forfait Mini, export du site possible. Prêt « en quelques jours » (aucun délai précis promis).
  - 🛒 **Option « E-commerce : + 200 € »** (`creation.ecommerce`), soit **749 € pendant l'offre de lancement, 949 € ensuite**, avec le site (id `boutique`, « Site Essentiel + e-commerce ») : boutique complète, produits et services, panier, paiement en ligne sécurisé, e-mails de commande automatiques, catalogue, prix, promotions, livraison et moyens de paiement gérés par le client depuis son espace client (Ma boutique), configuration complète de la boutique. C'est ce qu'apportait l'ancien Site Boutique.
  - **Le Site Visibilité n'est plus proposé** (id `vitrine`, 750 €, `retire: true`) : il reste défini pour les anciennes commandes, qui sont livrées comme prévu (CGV, article 7). L'extension le reçoit dans `data.json` avec `retire: true`.
- **L'histoire à raconter** : Alex a recréé et optimisé les « minis monstres », les modules dont un site est fait. Chaque module a été soigné une fois et se modifie à part : « le cerveau est prêt, il ne manque que votre contenu ». D'où le petit prix et un site prêt en quelques jours. Le client reçoit une première version (V1), qu'il modifie lui-même (bouton « Modifier mon site moi-même » de l'espace client) ou qu'il nous demande de modifier. Le bloc « Comment est fait votre site » est sur l'accueil et la page Tarifs (`C.modulesSite()` dans `src/lib/components.js`, modules dans `config.modules`).
- **Révisions** (`config.revisionsNote`) : illimitées sur le site commandé, jusqu'à ce que le client le valide. Après la mise en ligne, les modifications passent par le forfait Mini.
- **Ensuite, deux façons de faire vivre le site. L'abonnement est facultatif.**
  - ⚪ **Autonomie, 0 € par mois** (`config.creationSeule`, id `sans`) : le client gère son hébergement, son nom de domaine, ses sauvegardes et ses mises à jour. On lui remet l'export de son site, prêt à installer. L'automate saute le domaine et l'hébergement.
  - 🔵 **le forfait Mini, 10 € par mois, sans engagement** (`config.forfaits[0]`, id `base`) : hébergement, sauvegardes automatiques, sécurité, maintenance technique, espace client, les Minis Monstres à votre service, modifications incluses demandées depuis l'espace client. **Une modification peut prendre jusqu'à 48 h** (délai habituel, pas une garantie : les CGV le disent), une demande à la fois. C'est le seul abonnement. **Nom de domaine** : si le client a déjà le sien, le forfait reste à 10 € ; sinon on le lui fournit, à son nom, pour 2 € de plus par mois (`forfaits[0].domaine`), soit 12 €. Il n'est plus « compris » ni « offert ».
- **Trois extras seulement** (`aLaDemande` non retirés dans `src/config.js`) :
  - 📈 **Page de visibilité Google, 10 € la page, payée une fois** (id `packseo`, à l'unité ou par 5 ou 10) : nouvelle page optimisée pour Google, intégrée au site, référencement local soigné. Commandée et payée par carte tout de suite depuis l'espace client, une fois le site en ligne. C'est la façon de grandir sur Google (elle remplace le Site Visibilité).
  - 🌍 **Traduction anglaise** : sur devis.
  - ⚙️ **Fonctionnalité spécifique** : sur devis.
  - Tous les anciens extras sont retirés de la vente (`retire: true`), y compris les extras au mois et les lots d'articles de la boutique.
- **Code promo** : une seule case, au total et sur la page Commander. Un code promo donne une remise sur la création (jamais sur l'abonnement ni sur les extras). Vos codes se règlent dans ALED08 › Réglages › « Codes promo », un par ligne.
- **Paiement de la création** (`config.paiement`, `config.fractionne`) : le site se paie en entier à la commande, en une fois, ou en 3 ou 4 fois avec Alma ou Klarna sur la page de paiement Stripe (l'organisme nous verse tout de suite la somme entière). Le forfait démarre à la mise en ligne du site. Deuxième site : 10 % de remise. Le parrainage est retiré du site (19 novembre 2026).
- **Comparaison honnête** (`marche` dans `src/config.js`) : un site vitrine de cinq pages (`marche.pagesCompare`) chez un indépendant coûte 1 500 à 3 000 €, notre Site Essentiel 549 € en offre de lancement (il contient les mêmes parties : accueil, présentation, services, photos, contact), soit « 2 à 5 » fois moins (`marche.foisTexte`, calculé). Les pages le disent avec la prudence d'usage (des indépendants existent dès 800 €). Ne jamais annoncer plus.
- **Les anciens clients** gardent l'abonnement, les options et les extras qu'ils ont déjà, aux mêmes conditions, tant qu'ils ne les retirent pas (CGV, article 7). Rien n'est changé dans Stripe tout seul.

Les repères de prix du marché et la comparaison des assistants sont dans `docs/prix-et-ia-2026.md`.

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

Le paiement en deux temps : le client paie 25 % de la création à la commande (25 % du prix du site choisi, rien d'autre : les pages de visibilité Google se commandent plus tard depuis l'espace client). À la réception du site (statut « En ligne »), il choisit dans son espace, onglet « Ma commande » : le reste en une fois, ou en 6 ou 12 fois sans frais (engagement le temps de payer). C'est vrai aussi en Autonomie. Le même paiement Stripe démarre son abonnement, s'il en a un. Sans Stripe, ou s'il paie autrement, bouton « Reste payé (hors Stripe) » dans la fiche ; « Copier un lien de paiement du reste » donne un lien valable 24 heures.

Un ancien client retire ses anciens extras quand il veut (« Abonnement et factures », dans Mon compte) : l'abonnement Stripe est mis à jour, le nouveau prix s'applique à l'échéance suivante, et vous recevez un e-mail. Les anciens extras ne sont plus vendus.


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
| Site en ligne | Le site est en ligne | E-mail au client, avec le solde à payer s'il y en a un |
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

- **À la commande** : l'acompte de 25 % du site choisi (Site Essentiel, Site Visibilité ou Site Boutique), payé une fois. Les pages de visibilité Google (10 € la page) ne se prennent pas à la commande : le client les commande plus tard depuis son espace client et les paie par carte tout de suite (voir « Paiement direct par carte »).
- **À la réception** : le reste, en une fois, ou en 6 ou 12 fois sans frais (prix divisé par 6 ou 12, arrondi au centime inférieur). Avec l'abonnement, tout est dans un seul abonnement Stripe : la ligne de l'abonnement au mois et, s'il y a lieu, la ligne des mensualités du site. En Autonomie (sans abonnement), l'abonnement ne porte que les mensualités, ou bien c'est un simple paiement si le reste est réglé en une fois.
- **Fin du paiement en plusieurs fois** : l'extension compte les mensualités payées (« Lissage : 4 / 12 payées » dans la fiche et le tableau de bord). Après la dernière, la ligne des mensualités est retirée de l'abonnement : il ne reste que l'abonnement au mois, sans engagement. En Autonomie, l'abonnement entier s'arrête tout seul.
- Les factures Stripe apparaissent dans l'espace client dès qu'elles sont payées.

## 6. Le portail client Stripe

Le bouton « Gérer mon paiement et mes factures » de l'espace client ouvre le portail Stripe du client : il y change sa carte ou son IBAN et télécharge ses factures. Il faut le configurer une fois :

1. Stripe : **Paramètres › Facturation › Portail client**.
2. Autorisez : **mettre à jour le moyen de paiement**, **consulter l'historique des factures**.
3. N'autorisez PAS : annuler l'abonnement, changer d'offre, modifier la quantité. L'engagement pendant le paiement en plusieurs fois et les changements d'abonnement passent par vous (le client vous écrit, vous ajustez l'abonnement dans Stripe).
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

Offre du 19 novembre 2026 : les modifications sont incluses dans le forfait Mini, demandées depuis l'espace client, une demande à la fois, 48 h au plus. Sur le site public, la phrase est toujours la même : le client écrit sa demande, Cerise l'aide à la préciser, Bricou fait la modification ; Alex conçoit et contrôle. Le déroulé ci-dessous décrit l'extension telle qu'elle fonctionne : Cerise prépare la demande, puis elle arrive dans la liste « À faire ».

1. Le client écrit sa demande dans l'onglet « Modifications » (avec des photos s'il veut). La jauge apparaît : Demande reçue, Précisée avec Cerise, Chez Alex, Faite.
2. Cerise relit la demande (elle peut lire le site relié, sans rien modifier). Si c'est flou, elle pose une question (deux au plus), le client répond depuis la jauge.
3. Cerise reformule la demande clairement et la fait confirmer au client (« Vérifier ma demande » dans la jauge). Non : le client corrige, Cerise reprend (au deuxième « non », la demande part chez Alex avec les remarques).
4. Oui : Cerise répond « Merci pour vos précisions ! Je transmets votre demande à Alex », et Alex reçoit un e-mail avec la demande claire, la demande d'origine, les photos, les échanges et l'échéance.
5. Délais, à compter de la confirmation : **48 h au plus**, une demande à la fois. L'extra « demande en 24 heures » et l'extra « Deux demandes à la fois » n'existent plus.
6. Dans « Mon espace », onglet « À faire » : les demandes chez Alex, par échéance (orange à moins de 24 h, rouge en retard). Boutons « Je commence » puis « C'est fait, prévenir le client ». Un rappel part la veille de l'échéance, et un autre si elle est dépassée.
7. Le client peut annuler tant qu'Alex n'a pas cliqué « Je commence » (Alex est prévenu si la demande était déjà chez lui). Une demande qui attend le client plus de 7 jours est annulée toute seule. Si Cerise n'a pas pu relire une demande sous 24 h, elle part chez Alex telle quelle.
8. Pages de visibilité Google : le client commande une page (10 €, payée par carte), Mirette en prépare le sujet (titre, recherche visée, plan), puis la page est écrite et intégrée au site. Il n'y a plus de page automatique chaque mois ou chaque semaine.
9. La recherche de prospects a été retirée du tableau de gestion.

## 10. Le parrainage (retiré du site public)

Le parrainage est revenu le 25 novembre 2026 : voir la partie « Le parrainage : 6 mois offerts pour le parrain et pour le filleul », plus bas.

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
- [ ] La case « Code promo » de `/commander/` accepte un code valide et refuse les autres (plus de parrainage).
- [ ] `/comparatif-shopify/` redirige vers `/comparatif/` (301). Les anciennes adresses de l'électricien redirigent vers l'accueil.
- [ ] Les pages `/commander/`, `/commande-confirmee/` et `/mon-espace/` ne sont pas dans le plan du site et portent `noindex`.
- [ ] Supprimez la commande de test (Commandes › Corbeille) et le compte de test, ou gardez-les si vous voulez des exemples.
- [ ] Mentions légales et CGV à jour : SIRET quand il arrive, médiateur de la consommation.

## La petite bande (19 novembre 2026)

Le site public parle des Minis Monstres, jamais de la technique qui les fait tourner. La bande compte six monstres (`bande` dans `src/config.js`, dessins dans `src/lib/bestiaire.js`), chacun avec un prénom et un rôle :

- 🍒 **Cerise**, la secrétaire : répond aux questions et prend les demandes (bulle d'aide et espace client).
- 🔧 **Bricou**, le constructeur : construit le site et fait les modifications.
- ✍️ **Plume**, la rédactrice : prépare et soigne les textes.
- 👀 **Mirette**, la spécialiste visibilité : pages de visibilité Google et visibilité près de chez le client.
- 📦 **Mochi**, l'organisateur : pages, produits et commandes bien rangés.
- **Pépite**, la spécialiste des extras : présente les extras et prépare les devis.

Les autres monstres n'existent plus sur le site public. Il n'y a plus de compteur de points dans l'offre.

### Une demande pour Bricou (ancien circuit, éteint)

1. Le client choisit Bricou : sa demande passe à l'état « attente_alex ». Bricou lui écrit « Je la montre à Alex, et je m'y mets dans 30 minutes au plus tard ».
2. Alex reçoit un e-mail avec deux liens (il doit être connecté en administrateur) : **Laisser Bricou faire maintenant**, ou **Je m'en occupe moi-même**.
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

Voir la section 9 : Cerise prépare la demande avec le client, puis la modification est faite et contrôlée. L'ancien circuit de Bricou (aperçu, MCP) n'est plus utilisé.

## La barre de discussion de Cerise pour tous les visiteurs

Dans la bulle de Cerise, sur toutes les pages du site, un visiteur peut poser une question libre (prix, abonnements, délais, façon de travailler). Cerise répond avec les faits de l'offre (tirés de `data.json`) et peut proposer un lien vers une page. Elle ne peut rien modifier ni promettre.

- Point d'entrée public : `POST /wp-json/aled08/v1/bulle-site` (`admin-ajax.php` n'est pas joignable par les visiteurs sur ce site). Code : `includes/bulle-site.php`.
- Garde-fous : la demande doit venir d'une page du site ; 10 questions par heure et 30 par jour par visiteur (empreinte de l'adresse IP) ; 400 questions et 2 $ par jour pour tout le site (options `aled08_bulle_site_jour` et `aled08_bulle_site_budget`) ; question de 300 caractères au plus ; modèle rapide de la bulle (`aled08_bulle_modele`).
- Aucune question n'est enregistrée : seul le coût du jour est compté. Sans clé Claude, la barre répond « écrivez à Alex ».

## Le client modifie son site lui-même, en direct (21 novembre 2026)

- **Bouton « Modifier mon site moi-même »** sur l'accueil de l'application (et un rappel en haut de « Mes modifications »). Il apparaît dès que le site du client a le connecteur **2.12.0** ou plus.
- **Ce qui se passe :** l'application fabrique un lien signé avec la clé partagée du connecteur (valable 10 minutes, une seule fois). Le site du client ouvre alors le mode modification pour 2 heures, dans ce navigateur seulement (cookie HttpOnly). Pas de compte WordPress.
- **Ce que le client peut faire :** cliquer sur un texte du contenu d'une page (paragraphe, titre, élément de liste, bouton) et le réécrire ; cliquer sur une photo et en mettre une autre (JPG, PNG ou WebP, 8 Mo au plus). Chaque changement est en ligne tout de suite, avec une révision juste avant : « Annuler la dernière » revient en arrière. « Terminer » ferme le mode.
- **Pages faites par le thème (connecteur 2.13.0, ex. l'accueil de Flore) :** leurs textes et leurs photos se changent aussi. Le changement est gardé à part sur le site du client (option `alexlia_ed_gabarit`, par adresse de page) et remis à l'affichage à sa place (même balise, même texte ou même photo). Si le thème change ce texte plus tard, le changement ne s'applique plus, sans rien casser. Pas modifiables : en-tête, menu, pied de page, formulaires, fiches produits (elles se changent dans « Ma boutique »).
- **Ce qui reste une demande :** la mise en page, les menus, l'en-tête et le pied de page, ajouter ou retirer une partie. La barre le dit au client.
- **Pour Alex :** `POST /aled08/v1/atelier/edition {fiche, page}` donne le même lien (pour vérifier ou aider un client). Le journal du connecteur (Réglages › Alex & Co sur le site du client) note chaque ouverture et chaque changement.
- **Hébergeur o2switch :** son pare-feu (Tiger Protect) peut ralentir ou demander une vérification si on enchaîne beaucoup d'actions ; la barre affiche alors un message clair (« réessayez dans quelques secondes » / « rechargez la page »).
- **Aussi dans l'application :** « Mon compte » › le nom du site et sa phrase d'accroche (onglet du navigateur, Google) ; « Ma boutique » › « Mes prix » (prix, promo, en vente, en stock, pour tous les articles d'un coup).

## Les pages de visibilité Google, faites automatiquement (21 novembre 2026)

- **Prix :** 10 € la page, à l'unité ou en pack de 5 ou 10, payée par carte depuis l'espace client (onglet Extras).
- **Ce qui se passe :** Mirette choisit un sujet par page (`includes/lumi.php`). L'atelier automatique (la tâche planifiée, toutes les deux heures de 7 h à 21 h) lit `GET /aled08/v1/atelier/pages-google`, écrit chaque page sur le site du client, la met en ligne, puis la déclare avec `POST /aled08/v1/atelier/page-google {demande, titre, lien}` (`includes/pages-google.php`).
- **Quand toutes les pages d'une commande sont en ligne :** le client reçoit le joli e-mail « Vos pages Google sont en ligne » (la liste des pages avec leurs liens), et vous recevez un court e-mail. Rien à faire à la main.
- **Règle :** rien d'inventé sur le client (prix, délais, zones, méthodes) ; le reste est du savoir général sur son métier.

## Ma boutique : le client gère tout (19 novembre 2026)

Avec le Site Boutique (1 200 €), le client a un onglet « Ma boutique » (`includes/boutique.php`, `articles.php`, `boutique-gestion.php`) avec cinq rubriques :

1. **Mes articles** : le client gère son catalogue librement, sans limite d'articles (les anciens lots d'articles payants n'existent plus). Il saisit lui-même chaque article (photo, description, prix), créé tout de suite dans la boutique de son site (connecteur 2.1.0, `article_poser`). Si le site n'est pas relié, l'article vous arrive par e-mail à mettre en ligne.
2. **Mes prix** : prix, promo, en vente, en stock de chaque produit simple (connecteur 2.2.0, `catalogue` et `produit_regler`). Les anciennes valeurs restent dans le journal du connecteur. Les produits à variantes se règlent avec vous.
3. **Paiements** : le client installe lui-même Stripe ou PayPal depuis son espace client (voir « Stripe et PayPal sur le site du client »). **Les clés de paiement partent directement sur le site du client, en HTTPS : elles ne sont ni gardées, ni journalisées, ni réaffichées.**
4. **Commandes** : les 15 dernières, en lecture seule.
5. **Promos et soldes** : codes promo, soldes rapides, bandeau d'annonce et vacances (comme avant).

**Après chaque nouvelle version du connecteur, il faut le réinstaller sur chaque site client** (Flore et Chenilles en premier) : sans cela, ces rubriques affichent « L'extension de votre site doit être mise à jour ».

## Paiement direct par carte (19 novembre 2026)

- **Page de visibilité Google** (10 € la page, le seul extra à prix fixe) : le client paie sur la page sécurisée de Stripe au moment de commander, depuis son espace client. La demande reste en brouillon jusqu'au paiement, puis elle part chez vous (e-mail « PAYÉ PAR CARTE »), et Cerise et Mirette prennent le relais. Rien n'est reporté sur une facture suivante. Code : `includes/paiement-direct.php`. Le paiement est confirmé au retour du client et par le webhook (événement `checkout.session.completed`, déjà branché), une seule fois.
- **Traduction anglaise et fonctionnalité spécifique** : sur devis. Vous répondez au client avec un prix, il accepte avant le début du travail.
- Il n'y a plus d'extra au mois.
- Sans clés Stripe, l'ancien fonctionnement reste : vous recevez un e-mail « à facturer à la main ».

## Stripe et PayPal sur le site du client

- Dans « Ma boutique › Paiements », le client clique « Installer Stripe » ou « Installer PayPal » : le connecteur (2.4.0) installe l'extension officielle depuis le répertoire WordPress et l'active, en laissant le moyen de paiement **éteint** tant qu'il n'est pas réglé.
- Stripe : le client colle ses clés (vérifiées auprès de Stripe) et coche « Je propose ce moyen de paiement ». PayPal : il connecte son compte PayPal depuis les réglages de son site (lien fourni), ou vous le demande.
- Chez Flore et Chenilles, les deux extensions sont déjà installées et activées (Stripe éteint, PayPal pas encore connecté).

## Le paiement en plusieurs fois (Alma, Klarna)

Depuis le 20 novembre 2026, le « 6 ou 12 fois » maison est arrêté. Le paiement en plusieurs fois passe par un organisme externe, sur la page de paiement Stripe : il vous verse la somme entière tout de suite (moins sa commission) et le client le rembourse.

- **À activer une fois** : dans Stripe, Réglages › Moyens de paiement, activer **Alma** et **Klarna**. Tant qu'ils ne sont pas activés, le client qui choisit « En plusieurs fois » voit un message qui lui propose de payer en une fois.
- **Côté client** : à la réception du site, onglet « Ma commande », il choisit « En une fois » (carte, et le forfait démarre en même temps) ou « En plusieurs fois ». Dans ce second cas, il paie le reste avec Alma ou Klarna, puis démarre son forfait en un clic.
- **Côté vous** : un e-mail « Site payé (en plusieurs fois) » arrive dès l'accord de l'organisme. La fiche de la commande le note dans son journal.
- **Les commandes déjà étalées** (anciens 6 ou 12 fois) continuent jusqu'à leur dernière échéance, sans rien changer.

Code : `aled08e_stripe_solde_fois_session` et `aled08e_stripe_on_solde_fois` dans `includes/stripe.php`. Les organismes proposés se changent avec le filtre `aled08e_stripe_fois_moyens`.

## Installation 100 % automatique et atelier (20 novembre 2026)

Après le paiement, l'automate achète le domaine chez OVH, le fait pointer vers o2switch, crée l'espace et la base, installe WordPress et l'extension du pack, puis relie le site à sa fiche. Réglages posés : hébergeur « o2switch cPanel », essai à blanc OVH décoché (les achats de domaine partent sans validation), pose automatique cochée.

Il reste à saisir une fois, dans Réglages de l'espace client › Mise en ligne automatique :

- les trois clés OVH (à créer sur https://eu.api.ovh.com/createToken/), avec un moyen de paiement par défaut sur le compte OVH ;
- les accès cPanel o2switch : hôte, utilisateur, domaine principal, puis le jeton d'accès ou, à défaut, le mot de passe cPanel.

Ces valeurs sont enregistrées dans la base du site, jamais affichées ensuite. Les boutons « Tester OVH » et « Tester cPanel » disent si tout est bon.

L'atelier (`includes/atelier.php`, route `/wp-json/aled08/v1/atelier`, réservée à l'administrateur) transmet une action au site d'un client, signée avec sa clé de liaison. Le connecteur 2.9.0 y répond avec `atelier_rest` (toute l'interface REST du site, sauf les comptes et les mots de passe d'application) et `atelier_image`. Un seul branchement de Claude, celui des Minis Monstres, suffit donc pour tous les sites.

## Les chantiers : le site se crée sans Alex (20 novembre 2026, mis à jour le 22)

Après sa commande, le client remplit le questionnaire. L'atelier (une tâche programmée de Claude, toutes les deux heures de 7 h à 21 h) lit `/wp-json/aled08/v1/atelier/chantiers`, pose ses questions au client si besoin (e-mail + bloc « Nos questions pour votre site » dans l'onglet « Ma commande », où le client répond), fait le site, le contrôle, puis **le livre lui-même** : le client reçoit « Votre site est en ligne » (une V1 qu'il peut modifier), et Alex un e-mail « Site livré (V1) ».

### Trois agents : le constructeur, le contrôleur, Jarvis (22 novembre 2026)

Décision d'Alex : LMM tourne seul, chaque travail est vérifié par un second agent, et seuls les cas compliqués lui remontent. Le détail est dans `.claude/skills/nouveau-site/regles/organisation.md` et `escalade.md`.

| Tâche planifiée (claude.ai) | Quand | Rôle |
|---|---|---|
| « LMM · Le constructeur » (`trig_01MRc7z3rX6i3hSssqBFKBE8`) | 7 h 17 à 21 h 17, toutes les 2 h | Fait les sites, les pages Google, les modifications, puis les envoie au contrôle |
| « LMM · Le contrôleur » (`trig_01VBp8mxyTbiM1uTb6ybGpFt`) | 8 h 17 à 22 h 17, toutes les 2 h | Relit, puis livre ou renvoie à corriger |
| « LMM · Jarvis » (`trig_014KPYem6nbbgTn5FFFsZEUk`) | Chaque jour à 8 h 43 | Regarde l'ensemble, écrit à Alex seulement s'il le faut (et le lundi) |

- **À faire une fois par Alex :** dans claude.ai, sur chacune de ces trois tâches planifiées, activer le connecteur « Mini monstres ». Sans lui, un agent s'arrête dès son premier pas (il n'a pas accès au site). Ce réglage ne peut pas se faire depuis une conversation.
- **Tant que ce n'est pas fait :** l'option `aled08_agents` reste à `0` sur le site, et les modifications des clients arrivent chez Alex comme avant. Une fois les agents vérifiés : la passer à `1`, et poser `aled08_agents_en_place` à `1` (le chien de garde prévient alors Alex si les agents ne passent plus depuis une journée).
- **Chaque agent commence par** `GET /aled08/v1/atelier/poste?agent=NOM` : sa fiche de poste, son travail, la mémoire. La consigne de la tâche planifiée ne contient que ce premier pas et les garde-fous.
- **La mémoire commune (le « second cerveau »)** : `GET` et `POST /aled08/v1/atelier/memoire` (décisions d'Alex, notes par client, leçons, journal). Code : `includes/agents.php`.
- **Un cas pour Alex** : e-mail « À voir par vous ». Il répond dans une conversation avec Claude, qui relance le travail (`faire: "reprendre"`, `accord_alex: true`).
- **Essais sans WordPress** des états (site, modification, page Google) : le banc d'essai de la session du 22 novembre a vérifié que rien n'est livré sans contrôle, que trois refus envoient le cas chez Alex, et qu'un cas chez Alex est bloqué pour les agents.

### Les règles de création : un seul endroit (22 novembre 2026)

Toutes les règles (rien d'inventé, visuel, ce qui fait venir des demandes, Google, vitesse, accessibilité, pages légales, contrôle, livraison) sont écrites dans le skill « nouveau-site » : `.claude/skills/nouveau-site/regles/`, un fichier par sujet. `regles/sources.md` dit d'où viennent celles tirées du web et quand elles ont été relues.

- **Une session avec Alex** les lit dans le dépôt (commande `/nouveau-site`).
- **L'atelier automatique** les lit sur le site : `GET /aled08/v1/atelier/regles` (la liste), puis `?fichier=NOM`. Elles y arrivent à l'export : `scripts/wp-export.py` les range dans `regles-donnees.php` de l'extension (`includes/regles.php` les sert, à l'administrateur seulement).
- **Changer une règle** : modifier le fichier dans `regles/`, refaire l'export, réinstaller `aled08-espace.zip`. La consigne de la tâche programmée n'a pas à changer : elle ne contient que le déroulé et les garde-fous.

- Code : `includes/atelier.php` (routes `atelier/chantiers` et `atelier/chantier`, états dans `_aled08_chantier`, échanges dans `_aled08_chantier_fil`).
- Tant que `aled08_chantier_auto` vaut 1 (par défaut), l'e-mail « Questionnaire reçu » n'est plus envoyé à Alex.
- Un client qui ne répond pas reçoit un rappel au bout de 3 jours, une seule fois.
- La tâche programmée doit avoir le connecteur « Mini monstres » : il se règle dans claude.ai, sur la tâche elle-même.

## Le délai de création : 24 heures, annoncé « 24 à 48 heures »

Décision d'Alex (25 novembre 2026). Le site public et l'espace client annoncent un site en ligne « en 24 à 48 heures » après le questionnaire complet. En vrai, le site part **exactement 24 heures** après le moment où l'on a toutes les informations : l'envoi complet du questionnaire, ou la dernière réponse du client à une question de l'atelier.

Quand le contrôleur livre un site plus tôt, la commande passe à l'état « pret_livraison » avec l'heure prévue. À cette heure-là, le site passe « en ligne » et le client reçoit l'e-mail « Votre site est en ligne ». Une tâche WordPress s'en charge, avec un filet de sécurité qui vérifie toutes les 10 minutes. Le code est dans `src/wordpress/aled08-espace/includes/delai.php`. Si Alex livre lui-même un site depuis sa gestion, il part tout de suite.

## Le jeu-concours des Rubans

Ruban est le petit monstre cadeau : une boîte menthe avec un nœud rose (`petit('ruban')`). Le code est dans `includes/concours.php`, le règlement sur `/jeu-concours/`. Décisions d'Alex du 25 novembre 2026 : tout est automatique, en manches de 100 jours.

**La manche (100 jours).**
- Dix Rubans se cachent, deux par catégorie du règlement (`ALED08E_RUBANS_PAR_CATEGORIE`, décision d'Alex du 25 novembre 2026) : la page d'accueil, l'espace client, les mini-tutos, la page Tarifs et les questions fréquentes.
- À chaque manche, leurs cachettes sont tirées au hasard dans une réserve d'endroits bien visibles (`aled08e_concours_pool()`), jamais les mêmes que la manche d'avant.
- Le joueur doit être connecté. Tout le monde joue, sauf l'équipe et les anciens gagnants (décision d'Alex, 25 novembre 2026 : les clients aussi).
- Un gagnant qui a déjà un site ou une commande reçoit **un an de forfait Mini offert** (12 mois, `ALED08E_LOT_CLIENT_MOIS`, décision d'Alex du 25 novembre 2026). Ils sont ajoutés tout seuls avec `aled08e_mois_offerts_ajouter`, comme le parrainage : abonnement suspendu s'il est en cours, sinon mis de côté pour le démarrage du forfait. Ils s'affichent dans son « compteur de mois offerts » : accueil de l'espace, et Mon compte › Mon forfait. Il reçoit l'e-mail « Félicitations : un an de forfait offert ! ».
- Un clic sur un Ruban lance l'animation (saut, tour, confettis) et le compte. L'animation est jouée en JavaScript (Web Animations) et Ruban quitte la page au bout de 0,9 seconde quoi qu'il arrive ; si le serveur ne répond pas, un message s'affiche et Ruban revient à sa place.
- Les indices tiennent en un ou deux mots (« Tirelire », « Tic-tac », « Loupe »…), jamais l'endroit exact : trouver doit demander de chercher.
- Dans l'espace client, un compteur flottant (en bas à gauche) affiche les Rubans trouvés sur 5 et le chrono du tirage. Ouvert, il montre le temps exact et un indice par Ruban.
- Les dix trouvés, le joueur donne son e-mail et son numéro de portable. Le numéro sert seulement à empêcher les doublons : on n'appelle personne.

**Contre la triche :**
- Une participation par compte, par e-mail et par numéro de portable. 06…, +33 6… et 0033 6… sont le même numéro.
- Un numéro ou un e-mail déjà gagnant ne rejoue pas.
- Les doublons d'appareil ou d'adresse internet sont signalés à Alex.
- Chaque Ruban porte un jeton secret, vérifié par le serveur.

**Le tirage, tout seul.** À la fin des 100 jours (tâche WordPress toutes les heures, plus un filet à la première visite) :
1. Un gagnant est tiré au hasard (`random_int`).
2. Il reçoit l'e-mail « Félicitations : vous avez gagné un site internet ! », avec un code personnel `GAGNANT-XXXXXX` valable 30 jours, seulement avec son compte.
3. Alex reçoit une copie du résultat.
4. Une nouvelle manche commence aussitôt, avec de nouvelles cachettes.

**Le lot, comme un client qui a payé.** Le gagnant ouvre « Créer mon site » avec son code (le lien de l'e-mail le remplit). Il fait les mêmes choix qu'un client.
- Le Site Essentiel est à 0 €. L'option e-commerce reste payante.
- Avec le forfait Mini, il est « Offert jusqu'au … » pendant 6 mois (`ALED08E_LOT_SITE_MOIS`), nom de domaine compris (métas `aled08_offert` et `aled08_offert_fin`).
- Si tout est à 0 €, la commande passe « Payée » sans passer par Stripe, puis suit le parcours normal : questionnaire, création, livraison à 24 heures.
- Un mois avant la fin des 6 mois offerts, le client reçoit un rappel. À la fin, l'offre s'arrête et il est invité à démarrer son forfait ou à télécharger son site.
- Le site est à lui.

**L'accueil.** Un encart « Le jeu des Rubans » montre le chrono et le bouton « Je joue ». Il liste les derniers gagnants (nom de l'activité, ville, lien vers le site) dès que leur site est en ligne. Jamais de faux gagnants.

**Pour Alex** (Claude le fait sur demande), avec `POST /aled08/v1/atelier/concours` :
- Lancer : `{"faire": "ouvrir"}`.
- Nouvelles cachettes tout de suite : `{"faire": "melanger"}`.
- Placer un Ruban à la main : `{"faire": "cachette", "cachette": "tarifs", "chemin": "/tarifs/", "selecteur": "#detail", "indice": "…", "coin": "bas-droite"}`.
- Tirer au sort maintenant : `{"faire": "tirer"}`.
- Nouveau tirage si le gagnant triche : `{"faire": "retirer"}`.
- Arrêter : `{"faire": "arreter"}`.

`GET` donne la manche, la date du tirage, les cachettes, les joueurs, les inscrits, les doublons possibles et les tirages. Les données d'une manche sont effacées 3 mois après son tirage. Les noms et e-mails des gagnants sont gardés, pour qu'une même personne ne gagne pas deux fois.

## « Télécharger mon site » : la copie du site par le client

Décision d'Alex (25 novembre 2026) : **le site appartient au client.** Dans son espace, onglet **Mon site**, rubrique **Télécharger**, il choisit un format puis clique sur « Télécharger mon site ». Le zip se télécharge tout seul.

**Les deux formats :**
- **Pages HTML et CSS** : le site tel que les visiteurs le voient, avec toutes les pages, les feuilles de style, les scripts, les images et les polices. Les liens sont rendus relatifs : le dossier s'ouvre sur un ordinateur ou se pose chez n'importe quel hébergeur. Le formulaire de contact, la recherche et le panier n'y fonctionnent pas.
- **WordPress complet** : les fichiers de WordPress (wp-admin, wp-includes, wp-content avec le thème, les extensions et toutes les images) et la base de données en un fichier SQL, plus un modèle `wp-config-a-completer.php`. La copie ne contient ni `wp-config.php` (mots de passe du serveur) ni la clé du connecteur.

Chaque zip contient un `LISEZ-MOI.txt` qui explique quoi en faire.

**Comment ça marche :**
- Le zip est fabriqué sur le serveur du site du client, par le connecteur (action signée `copie`, `alexlia-connecteur/copie.php`, version 2.15.0 ou plus).
- Il est déposé à une adresse impossible à deviner, dans `wp-content/uploads/alexlia-copies/`, puis effacé au bout de 2 heures.
- Le navigateur du client le récupère directement là-bas. Côté espace : `includes/copie.php`.
- Une copie toutes les 5 minutes au plus par client.

**Si le connecteur d'un site est plus ancien que 2.15.0**, Alex reçoit un e-mail et le client voit « nous vous l'envoyons par e-mail ». Il faut alors mettre le connecteur à jour sur ce site. Flore et Chenilles est passé en 2.15.0 le 25 novembre 2026.

## Le parrainage : 6 mois offerts pour le parrain et pour le filleul

Décision d'Alex (25 novembre 2026) : on insiste sur le parrainage. Le code est dans `includes/parrainage.php`, la page publique est `/parrainage/` (l'ancienne `/fidelite/` y redirige), et le règlement est l'article 17 des conditions générales.

**Le principe**
- Chaque compte a un code (par exemple `LUCIE-B54`). Il est affiché sur l'accueil de l'espace client et dans Mon compte, rubrique « Parrainage », avec le lien et des boutons de partage : copier, WhatsApp, SMS, e-mail.
- Un nouveau client tape ce code dans « Code promo ou parrainage ». Le formulaire annonce : « 6 mois de forfait Mini offerts, pour vous et pour votre parrain ».
- Interdit : son propre code, être parrainé deux fois, cumuler avec un autre code.
- À la mise en ligne du site du filleul, l'avantage est programmé **un mois plus tard** (décision d'Alex : le délai de rétractation passé). Le parrain reçoit un e-mail tout de suite, avec la date.
- Un mois après, si la commande est toujours en ligne (ni annulée ni remboursée), le filleul reçoit 6 mois de forfait Mini offerts (s'il a ce forfait). Le parrain reçoit aussi 6 mois, pour chaque filleul, sans limite. Une tâche WordPress s'en charge, avec un filet de sécurité chaque jour.
- Trois e-mails partent : au parrain, au filleul et à Alex.

**Comment les mois sont offerts** (`aled08e_mois_offerts_ajouter`)
- **Abonnement Stripe en cours** : ses factures sont suspendues (`pause_collection`, factures annulées) jusqu'à une date reculée de 6 mois à chaque filleul.
- **Forfait déjà offert** (lot du jeu-concours) : la date de fin recule de 6 mois.
- **Forfait pas encore démarré** : les mois sont gardés (méta `aled08_mois_offerts`). Au démarrage du forfait, ils deviennent une période d'essai Stripe (`trial_end`) : la carte est enregistrée, rien n'est prélevé.

La durée se règle dans `src/config.js` (`fidelite.parrainageMois`, 6).

## La prospection par e-mail

Éteinte par défaut. Elle ne s'allume que quand Alex dit « lance la prospection » : bouton « Allumer la prospection » de l'espace de gestion (option `aled08_prospection_active`), et les trois tâches planifiées mises en route. Le code : `includes/prospection.php` et `includes/prospection-suite.php`. Les règles des agents : `regles/prospection.md`, `agent-repereur.md`, `agent-facteur.md`, `agent-repondeur.md`.

**Qui fait quoi.**
- **Le Repéreur** (chaque matin de semaine) trouve des entreprises sans site, avec une adresse e-mail qu'elles publient elles-mêmes.
- **Le Facteur** (toutes les heures, en semaine) revérifie chaque entreprise, puis envoie le mail. Il ne fournit que le sujet, une phrase vraie et trois points : le site fabrique le mail.
- **Le Répondeur** (trois fois par jour en semaine, avec le connecteur Gmail) lit les réponses. Il désinscrit ceux qui disent non, note les adresses fausses et prépare un brouillon de réponse dans Gmail pour les intéressés. Il n'envoie rien : Alex relit le brouillon et l'envoie.

**L'offre du mail** (décision d'Alex, 25 novembre 2026) : la même que pour tout le monde, le prix de lancement. Plus de code de réduction, jamais de « au lieu de ». Réglage : `prospection` dans `scripts/wp-espace-data.js` (`remise: 0`).

**Ce qui est automatique.**
- La position sur Google : quand le Facteur retient un prospect, le site la mesure lui-même avec le service Serper (réglage « Clé de mesure Google », que vous collez vous-même), pour la recherche notée par le Repéreur. Le mail le dit dans l'encadré « Nous avons fait le test » (« votre page Facebook arrive en 36e position, sur la 4e page »). Sans clé, le mail n'en parle pas. Un agent ne donne jamais de position : Google refuse les recherches faites par un programme.
- L'étude citée : « 64 % des petites entreprises ont déjà un site internet, 46 % disent qu'au moins 5 % de leurs clients viennent d'internet », source Baromètre France Num 2026 (DGE et Crédoc) écrite juste en dessous. Les chiffres sont dans `scripts/wp-espace-data.js` (`prospection.etude`) : les mettre à jour à chaque nouveau baromètre, chaque automne.
- Un nom de domaine libre : quand le Facteur retient un prospect sans site, le site cherche une adresse libre à partir du nom de l'entreprise (vérifiée auprès du registre officiel, puis revérifiée à l'envoi) et le mail l'annonce (« Bonne nouvelle : coiffurebeaugosse.fr est libre aujourd'hui »). Le mail ne parle pas du forfait ; l'encadré du prix dit que l'hébergement et la suite se choisissent après, expliqués sur le site.
- Les trois arguments du mail (Alex, 25 novembre 2026) : « 4 à 5 fois moins cher qu'une agence » (calculé avec `marche.agenceMin`), un vrai suivi (sans parler du forfait Mini), tout vous appartient. Le mail est écrit au « nous » et signé « La bande des Minis Monstres » : jamais « je » ni « Alex ». Il invite ensuite à voir les sites déjà en ligne (page Réalisations), puis à « Créer mon site ». Plus de démo ni d'aperçu personnalisé dans le mail : l'aperçu (`/?lmm_apercu=…`) reste dans le code, éteint par `apercuNote: 101` dans `scripts/wp-espace-data.js` (80 le rallume).
- La relance, une seule : 7 jours après le mail, ou 3 jours pour ceux qui ont cliqué.
- Le signal « entreprise récente » : créée depuis moins de 18 mois, + 15 points à la note.
- Ce qui marche : les résultats par métier, département et type de sujet. Le Repéreur va deux fois sur trois vers le métier qui répond le mieux.
- Le débrief du soir : chaque jour de semaine à 18 h 15 (heure de Paris), un e-mail à Alex avec les mails envoyés, les clics, les réponses, les refus, les adresses fausses, les commandes et les brouillons à envoyer.
- La pause automatique : plus de 5 % de désinscriptions ou plus de 8 % d'adresses fausses sur 7 jours (et au moins 40 envois) éteignent la prospection. Alex est prévenu, et lui seul la rallume.

**Les deux adresses** (Réglages de l'extension, « Prospection par e-mail »).
- « Adresse d'envoi » : vide, les mails partent de l'adresse du site, la même que celle des clients. Conseillé : une adresse à part, pour que les mails des clients ne souffrent jamais d'un signalement.
- « Adresse des réponses » : vide, les réponses arrivent à l'adresse de réception du site. Le Répondeur lit Gmail : cette adresse doit donc arriver dans le Gmail d'Alex, directement ou par un transfert automatique.

**On ne dit pas que c'est automatique** dans les mails (Alex, 25 novembre 2026). La politique de confidentialité (point « Si je vous ai écrit pour vous proposer un site ») dit que des outils automatiques aident à repérer les entreprises, à préparer les messages et à trier les réponses. Les réponses aux prospects sont toujours envoyées par Alex lui-même.
