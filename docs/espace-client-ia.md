# Espace client : le mode d'emploi

## L'offre

- **Création** : une page 150 €, site vitrine 250 €, boutique 450 €. En une fois (30 % à la commande, le reste à la mise en ligne) ou lissée sur 2 ans, avec un engagement de 2 ans.
- **Chico, 5 € par mois** : hébergement, nom de domaine, sauvegardes, mises à jour, une modification par mois.
- **Power, 20 € par mois** : tout Chico, plus le SEO, un rapport mensuel (visiteurs, ventes, positions) et une modification par semaine.
- **À l'année** : 2 mois offerts.
- **Options** : adresse e-mail pro (3 € par mois), traduction en anglais (50 €).
- **Parrainage** : un mois de forfait offert au parrain et au filleul quand le site du filleul est en ligne.

## Où est l'espace client ?

- `https://www.aled08.fr/mon-espace/` : la vraie page. Formulaire de connexion si on n'est pas connecté, tableau de bord sinon.
- `https://www.aled08.fr/mon-espace/demo/` : la démonstration, pour les prospects.
- Le code est l'extension WordPress **ALED08 Espace client** (`src/wordpress/aled08-espace/`), empaquetée par `scripts/wp-export.py`.

## Créer un compte client

1. WordPress › Comptes › Ajouter : identifiant, e-mail, prénom.
2. Rôle : **Client ALED08**.
3. Cochez « Envoyer une notification » : le client reçoit un e-mail en français avec le lien pour choisir son mot de passe et l'adresse de son espace.
4. Plus bas, la partie **Espace client ALED08** : forfait, adresse du site, lien d'avis Google, « Parrainé par (code) » si quelqu'un l'a recommandé.

Tout se modifie ensuite dans la fiche du compte (Comptes › le client) : chiffres du tableau de bord, recherches Google, lien du rapport mensuel, factures (une par ligne : `date ; libellé ; montant ; lien`), mois offerts.

## Les demandes de modification

- Le client écrit sa demande (avec une photo s'il veut) dans « Mes demandes ».
- Vous recevez un e-mail avec un lien direct vers la demande, dans le menu **Demandes clients** de WordPress.
- Vous changez le statut : Reçue, En cours, Faite. Un message facultatif s'affiche chez le client.
- Quand vous passez à « Faite », le client reçoit un e-mail.
- Le compteur du mois suit le forfait : Chico 1, Power 4. Au-delà, la demande est quand même envoyée et marquée « hors forfait ».

## Le parrainage

- Chaque client a un code (ex. `LILA-7K2`) et un lien `https://www.aled08.fr/creer-mon-site/?parrain=LILA-7K2`, dans l'onglet Parrainage, avec un bouton WhatsApp.
- Le lien garde le code 60 jours dans le navigateur du visiteur ; le code remplit tout seul le champ « Code de parrainage » du formulaire de contact.
- Vous voyez le code (et le nom du parrain) dans l'e-mail de demande. Le parrain voit le nombre de demandes reçues avec son code.
- Quand le site du filleul est en ligne, créez son compte avec « Parrainé par » = le code : le parrain reçoit un e-mail et son compteur « sites en ligne » augmente. Notez le mois offert dans « Mois offerts à utiliser ».

## Paiements

Stripe, pour commencer simplement : un abonnement par forfait (au mois et à l'année), un paiement lissé sur 24 mois pour la création. Ajoutez le lien de chaque facture dans la fiche du client.
