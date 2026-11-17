# Gérer le site ALED08 : le guide du propriétaire

Ce guide explique, en français simple, comment fonctionne le site www.aled08.fr au quotidien : les commandes, les paiements, les noms de domaine, les comptes clients et les demandes de modification. Tout se passe dans WordPress, menu **ALED08** (le visage souriant, en haut à gauche).

## 1. L'offre, en bref (depuis le 17 novembre 2026)

- **La page de commande, de haut en bas** : le site, l'option boutique, le choix « On s'occupe de tout » ou « Je m'en occupe moi-même », puis (seulement avec « On s'occupe de tout ») le nom de domaine, et enfin le total avec le paiement (une fois ou étalé) et le code promo. Il n'y a plus de formule à choisir : un seul abonnement.
- **Le site** : « Site Internet Professionnel », 500 €, jusqu'à 15 pages. Design personnalisé, adapté à tous les écrans, formulaire de contact, accompagnement personnalisé, les Minis Monstres. La « carte Google » et le « référencement Google de base » ne sont plus annoncés (retirés le 17 novembre 2026) : ne les promettez pas. Les pages non utilisées deviennent des pages pour Google (SEO) : par exemple 8 pages pour l'activité, 7 pour Google.
- **Une seule option à la commande** : Boutique en ligne 200 €, payée une fois (catalogue, panier, paiement en ligne, commandes, e-mails automatiques).
- **Le Pack SEO, plus tard** : 25 € payé une fois, 10 pages SEO en plus. Il ne se choisit plus à la commande (dans `src/config.js`, l'option `packseo` a `quand: 'espace'`). Le client le commande quand il veut depuis son espace client, onglet « Mes demandes ». Le code promo ne s'y applique pas.
- **« On s'occupe de tout » = l'abonnement, 10 € par mois, sans engagement.** Il n'y en a plus qu'un (nom interne « Tranquillité », `forfaits[0]`, id `base` dans `src/config.js`), et il comprend tout. Nom de domaine (choisi par le client à la commande, réservé à son nom) et hébergement offerts la première année (sauf avec la boutique en ligne), installation et mise en ligne, puis chaque mois sauvegardes, sécurité, surveillance, maintenance, modifications incluses sans limite (12 à 24 heures en moyenne) et une page SEO en plus chaque semaine. À l'année : 2 mois offerts (100 €). Sur le site, on dit « l'abonnement ».
- **La formule Évolution (20 €) est retirée** depuis le 17 novembre 2026 : plus de choix entre deux formules, plus de « priorité », plus de changement de formule. Tout ce qu'elle apportait (12 à 24 heures en moyenne, une page SEO par semaine) est maintenant dans l'abonnement à 10 €.
- **« Je m'en occupe moi-même » = la création seule (500 €, sans abonnement)** : rien au mois. Le client gère son nom de domaine et son hébergement (il peut déjà les avoir). Il paie le site comme les autres : acompte 25 %, puis le reste à la réception, en une fois ou en 6 ou 12 fois sans frais (engagement le temps du paiement). L'automate saute le domaine et l'hébergement : la commande passe directement à « Tout est prêt » et vous recevez l'e-mail « CRÉATION SEULE ». À la fin, remettez-lui le code du site : les fichiers et une sauvegarde complète, avec une petite notice d'installation. Il l'installe lui-même ou avec l'aide de son hébergeur, et peut suivre des tutoriels publics gratuits (les guides d'aide de son hébergeur, par exemple). Maintenance, sauvegardes, sécurité et modifications ne sont pas comprises. Il peut prendre l'abonnement plus tard.
- **Modifications incluses, sans les compter.** Plus d'intervention par trimestre, plus d'intervention en plus à 5 €, plus d'énergie ni de limite de retouches. Le déroulé est dans la partie 9.
- **Code promo ou parrainage** (l'offre événement est retirée du site) : une seule case, au total et sur la page Commander. Un code promo donne 20 % de remise sur la création (le site et la boutique, jamais l'abonnement ni le Pack SEO). Vos codes se règlent dans ALED08 › Réglages › « Codes promo », un par ligne. Il n'y a plus de code par défaut : tant que la liste est vide, aucun code promo ne marche. Le code de parrainage d'un client marche dans la même case : il devient le parrain de la commande (un mois offert à chacun).
- **Paiement de la création** : 25 % à la commande (site et boutique), le reste à la réception, en une fois ou en 6 ou 12 fois sans frais, avec l'abonnement comme en création seule. Avec l'abonnement et un paiement étalé, l'abonnement est payé au mois. Parrainage : 1 mois offert pour vous deux. Deuxième site : 10 % de remise.
- **Les anciens clients** gardent leurs options et extras tant qu'ils ne les retirent pas (ils les voient dans « Abonnement et factures », seulement pour les retirer). Un abonnement déjà en cours continue à son prix actuel (c'est ce que disent les CGV, article 7). Un client qui avait la formule Évolution est lu par l'extension comme l'abonnement unique, et son prix Stripe ne change pas tant que vous ne le modifiez pas.

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

Le paiement en deux temps : le client paie 25 % de la création à la commande (boutique en ligne comprise s'il l'a prise, rien d'autre : le Pack SEO se commande plus tard depuis l'espace client). À la réception du site (statut « En ligne »), il choisit dans son espace, onglet « Ma commande » : le reste en une fois, ou en 6 ou 12 fois sans frais (engagement le temps de payer). C'est vrai aussi en création seule. Le même paiement Stripe démarre son abonnement, s'il en a un. Sans Stripe, ou s'il paie autrement, bouton « Reste payé (hors Stripe) » dans la fiche ; « Copier un lien de paiement du reste » donne un lien valable 24 heures.

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

- **À la commande** : l'acompte de 25 % (boutique comprise si elle est choisie), payé une fois. Le Pack SEO ne se prend plus à la commande : le client le commande plus tard depuis « Mes demandes », et il s'ajoute à sa prochaine facture Stripe (sans abonnement, vous le facturez à la main).
- **À la réception** : le reste, en une fois, ou en 6 ou 12 fois sans frais (prix divisé par 6 ou 12, arrondi au centime inférieur). Avec l'abonnement, tout est dans un seul abonnement Stripe : la ligne de l'abonnement au mois et, s'il y a lieu, la ligne des mensualités du site. En création seule, l'abonnement ne porte que les mensualités, ou bien c'est un simple paiement si le reste est réglé en une fois.
- **Fin du paiement en plusieurs fois** : l'extension compte les mensualités payées (« Lissage : 4 / 12 payées » dans la fiche et le tableau de bord). Après la dernière, la ligne des mensualités est retirée de l'abonnement : il ne reste que l'abonnement au mois, sans engagement. En création seule, l'abonnement entier s'arrête tout seul.
- Les factures Stripe apparaissent dans l'espace client dès qu'elles sont payées.

## 6. Le portail client Stripe

Le bouton « Gérer mon paiement et mes factures » de l'espace client ouvre le portail Stripe du client : il y change sa carte ou son IBAN et télécharge ses factures. Il faut le configurer une fois :

1. Stripe : **Paramètres › Facturation › Portail client**.
2. Autorisez : **mettre à jour le moyen de paiement**, **consulter l'historique des factures**.
3. N'autorisez PAS : annuler l'abonnement, changer d'offre, modifier la quantité. L'engagement pendant le paiement en plusieurs fois et les changements d'abonnement (passage du mois à l'année, par exemple) passent par vous (le client vous écrit, vous ajustez l'abonnement dans Stripe).
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

Depuis le 17 novembre 2026, les modifications sont incluses et le client ne choisit plus « Bricou ou Alex ». Le déroulé :

1. Le client écrit sa demande dans « Mes demandes » (avec des photos s'il veut).
2. Bricou prépare la modification tout de suite, en tâche de fond, et un aperçu.
3. Le client regarde l'aperçu et clique « Oui, c'est bon » (ou « Non, ce n'est pas ça » : la demande vous revient, avec son commentaire).
4. Vous recevez l'e-mail « Modification à valider » avec deux liens : « Valider maintenant » ou « Refuser, je reprends la main ».
5. Sans refus de votre part sous 30 minutes, la modification est mise en ligne toute seule, et le client reçoit « Votre modification est en ligne ».
6. Si Bricou ne peut pas faire la demande (trop grande, floue, site pas relié), elle vous revient : vous la faites à la main. Le délai annoncé aux clients est de 12 à 24 heures en moyenne, pour tous.

Dans la fiche d'une demande, l'état « en attente de votre validation » veut dire que le client a dit oui et que les 30 minutes courent.

### Cerise, pour de vrai (Claude, d'Anthropic)

Quand le client choisit « Cerise, instantané », Cerise prépare la modification toute seule, en tâche de fond, en une à deux minutes. Rien ne change encore sur le site : le client reçoit un e-mail, ouvre « Voir l’aperçu » (sa vraie page, avec un bandeau « Aperçu »), puis clique « Oui, mettre en ligne » ou « Non, ce n’est pas ça ». Oui : c’est mis en ligne et vous recevez « Cerise a mis en ligne une modification à vérifier ». Non : la demande vous revient, avec son commentaire. L’aperçu reste valable 21 jours.

Avec Alex, les modifications sont annoncées en 12 à 24 heures en moyenne, sans limite de nombre (plus d'intervention par trimestre ni d'extra « sous 24 heures »).

Ce qu'elle sait faire : changer un texte (horaires, prix affiché, phrase), modifier le contenu ou le titre d'une page, publier une actualité, ajouter la photo jointe, changer le nom ou le slogan du site. Ce qu'elle ne fait jamais : supprimer, toucher aux extensions, au thème, aux comptes, aux prix d'une boutique, aux CGV ou mentions légales. Si la demande est floue ou risquée, elle ne touche à rien et vous la passe (e-mail « Cerise vous passe une demande »). Le jeton n'est alors pas compté : la demande devient une modification d'Alex.

À installer une fois :

1. Une clé Claude : sur platform.claude.com, créez un compte, ajoutez un moyen de paiement (on paie à l'usage, quelques centimes par demande), puis API keys, Create key. Collez-la dans les Minis Monstres › Réglages, rubrique Cerise, ou mieux dans wp-config.php : `define('ALED08_ANTHROPIC_KEY', 'sk-ant-...');`. Bouton « Tester Cerise » pour vérifier.
2. L'extension `alexlia-sdk.zip` (kit officiel Anthropic) sur aled08.fr. Elle ne charge rien tant que Cerise ne travaille pas.

Pour chaque client :

1. Sur le site du client, installez `alexlia-connecteur.zip` (dans `wp-export/` après `python3 scripts/wp-export.py`).
2. Dans la fiche du client sur aled08.fr (Utilisateurs, le client, rubrique « Cerise : site relié ») : mettez l'adresse du site (en https), cochez « Créer la clé », enregistrez. Copiez la clé affichée.
3. Sur le site du client, Réglages › Les Minis Monstres : collez la clé, enregistrez. De retour sur la fiche client, la ligne « Connexion » doit dire OK.

Tant qu'un client n'est pas relié, ses demandes « par Cerise » arrivent chez vous par e-mail comme avant, et vous les faites à la main.

Après le passage de Cerise, la fiche de la demande montre un encadré « Travail de Cerise » : la liste des changements avec un lien vers chaque page, sa note pour vous, et trois boutons :
- « C'est bon, vérifié » ;
- « Annuler les changements de Cerise » : chaque page est remise exactement comme avant (une révision est gardée avant chaque changement). Une actualité publiée ou un nom de site changé se défont à la main, l'encadré vous dit lesquels ;
- « Relancer Cerise » si elle n'a pas pu finir.

Sécurité : chaque échange avec le site client est signé avec la clé du client, valable 5 minutes et une seule fois. Sur le site client, la case « Pause » dans Réglages › Les Minis Monstres coupe Cerise tout de suite. Le journal des 100 derniers changements est sur la même page. Si le pare-feu de l'hébergeur bloque l'adresse `/wp-json/alexlia/v1/action`, demandez au support de l'autoriser.

### Les Jetons Cerise et les outils

Tout ce que fait Cerise se compte en **Jetons Cerise**. Un jeton vaut 1 centime. Les outils ne demandent qu'une chose : **votre clé Claude**, entrée une fois dans les Minis Monstres, Réglages, « Clé Claude ». Tant qu'elle manque, le tableau de bord de la gestion vous le rappelle, les outils où Cerise écrit sont grisés et les outils gratuits marchent.

**Les 15 outils** (définis dans `src/content/outils-lia.js`, un seul fichier pour le site, la Documentation et l'espace client) :

| Famille | Outils |
|---|---|
| Réseaux | Publier partout, Idées de publications |
| Textes | Corriger un texte, Réécrire un texte, Traduire un texte, Répondre à un client, Fiche produit |
| Photos | Annonce en image, Recadrer et alléger une photo, Conseils sur une photo, Recopier le texte d'une photo |
| Mon site | Conseils pour ma page, QR code |
| Avis | Répondre à un avis, Lien d'avis Google |

Quatre sont gratuits parce qu'ils tournent dans le navigateur du client : Annonce en image (seuls les mots trouvés par Cerise coûtent des jetons), Recadrer et alléger une photo, QR code, Lien d'avis Google.

**Les règles du compteur** (`includes/jetons.php`) :

- **L'abonnement donne 100 jetons chaque mois** (`forfaits[0].jetons` dans `src/config.js`). Ils reviennent le 1er et ne se reportent pas. Au-delà, le client rachète des jetons à l'utilisation (1 € les 100). L'option Cerise + a été supprimée le 16 novembre 2026.
- **Seulement si l'abonnement court** : abonnement Stripe actif, ou case « Abonnement actif hors Stripe », ou « Abonnement offert à vie », ou compte famille. Une commande pas encore payée ne donne aucun jeton. La fiche du client le dit quand c'est le cas.
- **Un extra ajouté ou retiré en cours de mois** compte à partir du mois suivant, comme sa facture.
- **Une modification par Cerise** coûte 30 jetons, plus 1 par tranche de 10 mots écrits, plus 10 par photo (`jetonsLia.modif`). Le prix s'affiche pendant que le client écrit. Si Cerise passe la demande à Alex, si la mise en ligne échoue, si le client refuse l'aperçu ou annule dans les 24 heures, les jetons sont rendus. Si Cerise n'est pas reliée au site du client, la demande va à Alex, sans jeton.
- **Un outil** a un prix fixe (`jetons`) : ce qu'il coûte chez Claude (`coutCts`, en centimes) × 4, arrondi au-dessus. Pour une modification, c'est × 2. Les jetons sont comptés au lancement et rendus si Cerise ne rend rien d'utilisable (panne, réponse coupée, texte qui ne veut rien dire : Cerise répond alors « STOP » avec ce qu'il faut donner).
- **Garde-fous** : un seul outil à la fois par client, 40 essais par heure, longueur de la réponse bornée par le prix de l'outil, texte trop long refusé (jamais coupé), page lue seulement sur le site du client.
- **La recharge** : 100 jetons pour 1 €, 500 pour 5 €, 1000 pour 10 € (`jetonsLia.recharge`), 5000 jetons par mois au plus. Elle s'ajoute à la prochaine facture Stripe si le client a un abonnement mensuel actif, et les jetons arrivent tout de suite. Sinon vous recevez un e-mail : ajoutez les jetons dans sa fiche (« Jetons Cerise en plus ») et facturez-les.
- **Publier partout** : publier son propre texte est gratuit ; « Cerise adapte mon texte » coûte des jetons. Le client relie Bluesky ou Mastodon lui-même, sans réglage de votre part. Facebook, Instagram et LinkedIn n'apparaissent dans « Mes réseaux » que si vous déclarez l'application chez le réseau (Réglages, « Publier sur les réseaux », marche à suivre sur place). Sans cela, le texte est copié et le réseau s'ouvre. Le code est dans `includes/reseaux.php`.
- **Vérifier que vous vous y retrouvez** : Réglages, en bas, « Jetons Cerise : le bilan du mois ». Pour chaque client : les jetons comptés, leur valeur, ce que Claude a vraiment coûté, et ce qu'il reste. Si un outil coûte plus que prévu, montez son `coutCts` et son `jetons` dans `outils-lia.js` et relancez l'export.
- **Changer de modèle** : Cerise et les outils utilisent le modèle réglé dans les Réglages (par défaut `claude-opus-5-5`). Avec `claude-sonnet-5-5`, le coût est divisé par deux, pour les mêmes prix en jetons.
- **Confidentialité** : la politique de confidentialité dit que les textes, photos et adresses de page confiés à Cerise sont envoyés à Claude (Anthropic). Relisez ce passage, il vous engage.

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
