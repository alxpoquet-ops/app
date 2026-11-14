# Espace client : le mode d'emploi

## L'offre

- **Création** : une page 150 €, site vitrine 250 €, boutique 450 €. En une fois (30 % à la commande, le reste à la mise en ligne) ou lissée sur 2 ans, avec un engagement de 2 ans.
- **Chico, 5 € par mois** : hébergement, nom de domaine, sauvegardes, mises à jour, une modification par mois.
- **Power, 20 € par mois** : tout Chico, plus le SEO, un rapport mensuel (visiteurs, ventes, positions) et une modification par semaine.
- **À l'année** : 2 mois offerts.
- **Options** : adresse e-mail pro (3 € par mois), traduction en anglais (50 €).

## Comment ça marche

- Le client envoie ses **demandes de modification** depuis son espace client (ou par WhatsApp). C'est vous qui les faites, avec vos propres outils et l'IA si vous voulez. Le client n'a pas accès à l'IA.
- L'espace client lui donne aussi, **gratuitement** s'il est hébergé chez vous : le suivi de ses demandes, un tableau de bord (visites, appels, recherches Google), son QR code, son lien d'avis Google et ses factures.

## Pour démarrer simplement

1. **Paiements** : Stripe. Un abonnement par forfait (au mois et à l'année), un paiement lissé sur 24 mois pour la création, et le portail client Stripe pour les factures et la carte bancaire.
2. **Demandes** : au début, WhatsApp ou un formulaire qui vous envoie un e-mail. Notez le compteur de modifications du mois de chaque client dans un tableau.
3. **Espace client** : ensuite, sur votre WordPress, une page protégée par connexion avec le formulaire de demande, le suivi (reçue, en cours, faite) et les factures. La démo `/mon-espace/` du site montre exactement ce qu'il verra.
4. **Tableau de bord** : les chiffres viennent de Google Search Console et de l'outil de statistiques du site ; le rapport mensuel de Power peut partir automatiquement par e-mail.

Quand l'espace client ouvre, passez `espaceClient.ouvert` à `true` dans `src/config.js` : le bandeau « ouvre bientôt » disparaît.
