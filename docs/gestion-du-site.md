# Gérer le site ALED08 : le guide du propriétaire

Ce guide explique, en français simple, comment fonctionne le site www.aled08.fr au quotidien : les commandes, les paiements, les noms de domaine, les comptes clients et les demandes de modification. Tout se passe dans WordPress, menu **ALED08** (le visage souriant, en haut à gauche).

## 1. L'offre, en bref

- **Création à prix fixe** : une page 150 €, site vitrine 250 €, boutique en ligne 450 €. Page en plus : 40 €.
- **Forfaits mensuels** : Chico 5 € (1 modification par mois), Power 20 € (SEO suivi, rapport mensuel, 1 modification par semaine), Titan 40 € (1 modification par jour ouvré, 1 article de blog par mois, réponse sous 24 heures). À l'année : 2 mois offerts (le client paie 10 mois).
- **Paiement de la création** : soit un acompte de 30 % à la commande et le solde de 70 % à la mise en ligne, soit un lissage sur 24 mensualités (ou 2 annuités si le forfait est à l'année), avec un engagement de 24 mois.
- **Options** : adresse e-mail pro 3 € par mois, traduction en anglais 50 € une fois.
- **Parrainage** : 1 mois de forfait offert au parrain et au filleul quand le site du filleul est en ligne.
- **Délai de réponse aux demandes** : sous 48 heures (Titan : 24 heures).

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

Le client voit chaque étape dans son espace, onglet « Ma commande », avec Lia qui avance sur la frise. Le texte dit « en général une heure environ, jusqu'à 24 heures pour certains noms de domaine ». La page se met à jour toute seule.

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
2. Adresse à appeler : `https://www.aled08.fr/wp-json/aled08/v1/stripe`
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

- **Un abonnement par commande** : la ligne du forfait (au mois ou à l'année), la ligne de l'option e-mail pro si elle est prise, et, si le client a choisi le lissage, une ligne « Création du site, lissée » (prix divisé par 24, arrondi au centime inférieur ; ou divisé par 2 si le forfait est à l'année).
- **Sans lissage** : l'acompte de 30 % et la traduction éventuelle sont facturés une seule fois, sur la première facture. Le solde de 70 % est demandé à la mise en ligne (bouton dans l'espace client, ou lien copié depuis la fiche).
- **Fin du lissage** : l'extension compte les échéances payées (« Lissage : 12 / 24 payées » dans la fiche et le tableau de bord). Après la 24e (ou la 2e annuité), la ligne est retirée de l'abonnement toute seule : il ne reste que le forfait. Une vérification tourne chaque nuit pour recompter depuis les factures Stripe, au cas où un événement serait passé à côté.
- Les factures Stripe apparaissent dans l'espace client dès qu'elles sont payées.

## 6. Le portail client Stripe

Le bouton « Gérer mon paiement et mes factures » de l'espace client ouvre le portail Stripe du client : il y change sa carte ou son IBAN et télécharge ses factures. Il faut le configurer une fois :

1. Stripe : **Paramètres › Facturation › Portail client**.
2. Autorisez : **mettre à jour le moyen de paiement**, **consulter l'historique des factures**.
3. N'autorisez PAS : annuler l'abonnement, changer d'offre, modifier la quantité. L'engagement de 24 mois et les changements de forfait passent par vous (le client vous écrit, vous ajustez l'abonnement dans Stripe).
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

- Le client écrit sa demande (avec une photo s'il veut) dans « Mes demandes ». Vous recevez un e-mail avec un lien direct.
- Dans ALED08 › Demandes clients, vous changez le statut : Reçue, En cours, Faite, avec un message facultatif affiché chez le client. En passant à « Faite », le client reçoit un e-mail.
- Le compteur du mois suit le forfait : Chico 1, Power 4, Titan 20. Au-delà, la demande part quand même et est marquée « hors forfait » : vous dites au client si elle attend le mois prochain ou si elle est facturée.
- Délai de réponse annoncé : 48 heures, 24 heures pour Titan.

## 10. Le parrainage

- Chaque client a un code (par exemple `LILA-7K2`) et un lien `https://www.aled08.fr/creer-mon-site/?parrain=LILA-7K2`, onglet Parrainage, avec un bouton WhatsApp.
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

Décision prise : tout chez OVH, en douceur.

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
- [ ] ALED08 › Tableau de bord : la tâche quotidienne est planifiée (date affichée). Si elle ne tourne pas (sites peu visités), ajoutez une tâche cron chez o2switch qui appelle `https://www.aled08.fr/wp-cron.php?doing_wp_cron` une fois par jour.
- [ ] Une demande de modification depuis l'espace de test, avec une photo : e-mail reçu, statut « Faite » envoie l'e-mail au client.
- [ ] Le lien de parrainage préremplit le code sur `/commander/`.
- [ ] `/comparatif-shopify/` redirige vers `/comparatif/` (301). Les anciennes adresses de l'électricien redirigent vers l'accueil.
- [ ] Les pages `/commander/`, `/commande-confirmee/` et `/mon-espace/` ne sont pas dans le plan du site et portent `noindex`.
- [ ] Supprimez la commande de test (Commandes › Corbeille) et le compte de test, ou gardez-les si vous voulez des exemples.
- [ ] Mentions légales et CGV à jour : SIRET quand il arrive, médiateur de la consommation.
