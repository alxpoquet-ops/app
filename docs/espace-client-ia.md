# Espace client, paiements et IA : comment tout automatiser

Ce document explique comment faire fonctionner les forfaits Chico, Power et Titan presque tout seuls : comptes clients, paiements, modification des sites par l'IA, publication sur les réseaux et suivi SEO.

## En résumé

- **Vous pouvez vendre tout de suite**, sans rien développer : les demandes arrivent par message et vous les traitez avec l'IA.
- **Ensuite, on automatise brique par brique**, dans cet ordre : paiements, modification par IA, publication sur les réseaux, rapports SEO.
- **Tout tourne sur votre hébergement o2switch actuel**, avec WordPress, Stripe pour les paiements et l'API Claude (Anthropic) pour l'IA.

---

## Étape 0 : dès maintenant, sans développement

- Le site fait déjà le travail commercial : le configurateur « Créer mon site » envoie une demande complète (type de site, nom de domaine, forfait, options).
- **Paiements** : créez dans Stripe des liens de paiement pour l'acompte et pour chaque forfait (au mois et à l'année). Stripe envoie les factures et donne au client un portail pour changer sa carte ou arrêter son forfait.
- **Demandes des clients** (une modification, une publication) : par WhatsApp ou e-mail. Vous les faites avec Claude, ou avec moi via le connecteur WordPress, comme pour aled08.fr.
- L'intérêt : vérifier que les prix et les forfaits plaisent avant d'investir du temps de développement.

## Étape 1 : les comptes et les paiements

**Le principe** : aled08.fr (WordPress) devient le « centre de contrôle ».

- **Comptes clients** : des utilisateurs WordPress avec un rôle « client ». Ils se connectent sur `aled08.fr/mon-espace/`.
- **Abonnements** : Stripe Billing, au mois ou à l'année. Stripe Checkout pour s'abonner, portail client Stripe pour les factures, la carte et la résiliation.
- **Une petite extension WordPress** (je peux l'écrire) reçoit les notifications de Stripe : paiement reçu, forfait activé ; paiement refusé, rappel ; résiliation, fin du forfait à la date prévue.
- **Les options** sont des lignes en plus sur l'abonnement Stripe : on les ajoute ou on les retire en un clic, depuis l'espace client.
- **Les sites des clients** : un WordPress par client sur votre hébergement o2switch (qui accepte plusieurs sites), ou un WordPress « multisite ». Chaque site a un **mot de passe d'application** WordPress avec le rôle Éditeur : c'est lui que l'espace client utilise pour modifier le contenu, et rien d'autre.
- **Noms de domaine** : au début, réservés à la main chez votre registraire. Plus tard, automatisés avec l'API du registraire (OVHcloud ou Gandi, par exemple). La vérification de disponibilité est déjà en place sur le site.

## Étape 2 : modifier le site avec l'IA (Power et Titan)

**Ce que voit le client** : il écrit « ajoute qu'on est fermés le lundi », il voit l'aperçu, il clique sur Publier.

**Ce qui se passe derrière** :

1. L'espace client envoie la demande et le contenu de la page concernée à **l'API Claude**, depuis votre serveur.
2. L'IA n'a le droit d'utiliser que quelques outils prévus à l'avance : lire une page, proposer un nouveau texte, remplacer une image, mettre à jour les horaires ou un prix.
3. Elle renvoie une proposition structurée. L'espace client affiche l'aperçu.
4. Le client valide : la modification est enregistrée dans WordPress, qui garde chaque version (retour en arrière en un clic). Vous recevez un e-mail récapitulatif.

**Les garde-fous** :

- La clé de l'API reste sur le serveur (dans `wp-config.php`), jamais dans le navigateur.
- L'IA ne touche qu'au contenu : pas aux extensions, au thème, aux comptes ni aux réglages.
- Aperçu obligatoire avant publication, et journal de toutes les modifications.
- Une limite raisonnable de demandes par mois, pour rester dans un « usage normal ».
- Le texte du client est traité comme une demande, jamais comme des instructions qui permettraient de sortir de ce cadre : l'IA ne peut appeler que les outils prévus.

**Modèle et coût** :

- Modèle conseillé : **Claude Opus 5.5** (`claude-opus-5-5`), à 4 $ par million de jetons lus et 20 $ par million de jetons écrits.
- Une modification lit environ 5 000 jetons et en écrit environ 1 500 : **environ 0,05 $**. Même 100 modifications dans le mois coûtent environ 5 $.
- Si vous voulez réduire encore le coût des tâches très simples (légendes, petites corrections), un modèle plus léger comme Claude Haiku 5.5 existe : à tester sur de vrais exemples avant de basculer.

## Étape 3 : publier sur les réseaux (Titan)

**Ce que voit le client** : il ajoute une photo et quelques mots, il choisit « Publier partout » ou « Programmer ».

**Ce qui se passe derrière** :

1. Claude regarde la photo et écrit un texte adapté à chaque réseau : court avec des mots-clés pour Instagram, plus détaillé pour Facebook, avec l'adresse pour la fiche Google.
2. L'image est recadrée automatiquement : carré pour Instagram, paysage pour Facebook.
3. La publication part tout de suite ou à l'heure choisie.

**Comment publier** :

- **Pour démarrer, le plus simple : Make (ou Zapier).** L'espace client envoie la photo et les textes à un scénario Make qui publie sur Facebook, Instagram et la fiche Google. Abonnement mensuel modeste, rien à faire valider.
- **Plus tard, en direct** : l'API de Meta (page Facebook et compte Instagram professionnel relié à cette page) et l'API Google Business Profile. Il faut faire valider votre application par Meta et demander l'accès à Google : comptez quelques semaines.
- **Côté client** : un compte Instagram professionnel, une page Facebook et une fiche Google. Il les connecte une seule fois avec un bouton « Connecter », et peut retirer l'accès quand il veut.

## Étape 4 : le SEO automatique, mais relu

- **Rapport mensuel** : l'API Google Search Console donne les recherches, les positions et les clics de chaque site. Un rapport simple part par e-mail chaque mois (Power et Titan).
- **Contenus** : Claude prépare les articles et les pages locales en **brouillon** dans WordPress. Vous relisez, puis vous publiez.
- **Pourquoi pas 10 pages par jour** : Google pénalise les sites qui publient en masse des pages faites pour le classement plutôt que pour les lecteurs (ses règles anti-spam parlent de contenus produits à grande échelle). Le risque : le site du client perd sa place, et votre réputation avec. D'où la promesse de Titan : **jusqu'à 10 contenus utiles par mois**, relus.

## Ce que ça coûte (ordre de grandeur)

| Poste | Coût |
|---|---|
| Hébergement | Votre offre o2switch actuelle, qui accepte plusieurs sites |
| Noms de domaine | Environ 10 à 15 € par an et par client |
| Stripe | 1,5 % + 0,25 € par paiement par carte européenne |
| API Claude | Quelques euros par client et par mois, Titan compris |
| Make (publication) | Un abonnement modeste au début |

## Dans quel ordre avancer

1. **Maintenant** : valider les prix, mettre le site en ligne, vendre avec les demandes par message.
2. **Premiers clients** : Stripe (liens de paiement et portail client).
3. **Dès 3 à 5 clients Power** : l'espace client avec la modification par IA.
4. **Ensuite** : la publication sur les réseaux avec Make.
5. **Enfin** : le rapport SEO automatique.

Quand l'espace client ouvre, passez `espaceClient.ouvert` à `true` dans `src/config.js` : le bandeau « ouvre bientôt » disparaît de la page Espace client.

## À ne pas oublier

- Les conditions générales et la politique de confidentialité du site mentionnent déjà l'IA et les paiements : à faire relire.
- Signer les accords de traitement des données (RGPD) proposés par vos fournisseurs (Stripe, Anthropic, Make).
- Garder une sauvegarde quotidienne de chaque site client.
