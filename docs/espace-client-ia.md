# Espace client, jetons IA et automatisation : le mode d'emploi

Ce document explique comment faire tourner l'offre presque toute seule : entretien, forfaits Chico, Power et Titan, jetons IA, outil de publication sur les réseaux et modification des sites par l'IA.

## L'offre, en bref

- **Création à prix fixe** : une page 100 €, site vitrine 150 €, boutique 250 €.
- **Entretien** : 10 € par mois, toujours compris (hébergement, nom de domaine, sauvegardes, mises à jour des extensions, espace client).
- **Forfaits IA**, en plus de l'entretien : Chico +5 € (3 jetons, 1 publication offerte), Power +10 € (10 jetons, SEO suivi, support prioritaire), Titan +15 € (30 jetons, SEO suivi, support prioritaire).
- **Jetons IA** : 1 jeton = 1 petite modification du site ou 1 publication. Tout le monde a accès à tous les outils ; seuls les jetons changent. **Recharge** : 5 € les 10 jetons.
- **À l'année** : engagement d'un an, payé en une fois, 2 mois offerts.

---

## Étape 0 : vendre dès maintenant, sans rien développer

- Le site fait déjà le travail commercial : le configurateur « Créer mon site » envoie une demande complète (type de site, nom de domaine vérifié, forfait, options).
- **Paiements** : dans Stripe, créez un lien de paiement pour l'acompte, un abonnement par forfait (au mois et à l'année) et un paiement unique « Recharge 10 jetons ». Stripe envoie les factures et donne au client un portail pour changer de carte ou arrêter.
- **Demandes des clients** : par WhatsApp ou e-mail. Vous tenez les jetons dans un simple tableau (un client par ligne, jetons restants) et vous faites les modifications avec Claude, ou avec moi via le connecteur WordPress, comme pour aled08.fr.

## Étape 1 : l'outil de publication, sans code, avec Make

C'est l'outil le plus demandé (« une photo et quelques mots, et ça publie partout »). Il peut tourner en quelques jours, sans développement :

1. **Le formulaire** : une page « Publier » dans l'espace client (un formulaire WordPress avec envoi de photo) : photo, quelques mots, réseaux cochés.
2. **Le scénario Make**, déclenché par ce formulaire (webhook) :
   1. **Module Claude (Anthropic)** : il reçoit la photo et le texte, et renvoie les trois textes. Consigne à lui donner :

      > Tu es le community manager de {nom de l'entreprise}, à {ville}. À partir de la photo et de ce texte : « {texte du client} », écris en français : 1) un texte Instagram de 2 à 3 phrases, chaleureux, suivi de 5 hashtags utiles ; 2) un texte Facebook de 3 à 4 phrases avec une invitation à venir ou à réserver ; 3) un texte pour la fiche Google de 2 phrases avec la ville. Réponds uniquement en JSON : {"instagram": "...", "facebook": "...", "google": "..."}.

   2. **Recadrage de l'image** : carré pour Instagram, paysage pour Facebook (module de traitement d'image de Make, ou un service comme Cloudinary).
   3. **Publication** : les modules Facebook Pages, Instagram for Business et Google Business Profile de Make.
   4. **E-mail de confirmation** au client, et un jeton retiré de son compteur.
3. **Côté client** : un compte Instagram professionnel relié à une page Facebook, et une fiche Google. Il les connecte une fois ; vous gardez une connexion par client dans Make.

Coût de l'IA pour une publication : environ 0,02 $ avec Claude Opus 5.5. Vous la vendez 1 jeton, soit 0,50 €.

## Étape 2 : les comptes clients et les jetons

**Le principe** : aled08.fr (WordPress) devient le « centre de contrôle ».

- **Comptes clients** : des utilisateurs WordPress avec un rôle « client », qui se connectent sur `aled08.fr/mon-espace/`. La démo du site montre exactement ce qu'ils verront.
- **Abonnements** : Stripe Billing (au mois ou à l'année). Une petite extension WordPress (je peux l'écrire) écoute Stripe : paiement reçu, forfait activé ; paiement refusé, rappel ; résiliation, fin du forfait à la date prévue.
- **Les jetons** : un compteur par client dans WordPress.
  - Chaque mois, à la date anniversaire, le compteur est remis au niveau du forfait (3, 10 ou 30).
  - Chaque modification publiée ou chaque publication retire un jeton.
  - Une recharge payée sur Stripe ajoute 10 jetons automatiquement.
  - Quand il ne reste plus de jeton, l'espace propose de recharger ou de changer de forfait.
- **Les sites des clients** : un WordPress par client sur votre hébergement o2switch. Chaque site a un mot de passe d'application avec le rôle Éditeur : l'espace client s'en sert pour modifier le contenu, et rien d'autre.

## Étape 3 : modifier le site en écrivant à l'IA

**Ce que voit le client** : il écrit « ajoute qu'on est fermés le lundi », il voit l'aperçu, il clique sur Publier (1 jeton).

**Ce qui se passe derrière** :

1. L'espace client envoie la demande et le contenu de la page à **l'API Claude**, depuis votre serveur.
2. L'IA n'a le droit d'utiliser que quelques outils prévus à l'avance : lire une page, proposer un nouveau texte, remplacer une image, mettre à jour les horaires ou un prix.
3. Elle renvoie une proposition. L'espace client affiche l'aperçu.
4. Le client valide : la modification est enregistrée dans WordPress, qui garde chaque version (retour en arrière gratuit). Un jeton est retiré. Vous recevez un e-mail.

**Les garde-fous** :

- La clé de l'API reste sur le serveur (dans `wp-config.php`), jamais dans le navigateur.
- L'IA ne touche qu'au contenu : pas aux extensions, au thème, aux comptes ni aux réglages.
- Aperçu obligatoire avant publication, et journal de toutes les modifications.
- Le texte du client est traité comme une demande, jamais comme des instructions qui permettraient de sortir de ce cadre.

**Coût** : avec Claude Opus 5.5 (`claude-opus-5-5`, 4 $ par million de jetons lus, 20 $ par million écrits), une modification coûte environ 0,05 $. Vendue 1 jeton (0,50 €), la marge est confortable, même pour Titan.

## Étape 4 : le SEO et les rapports

- **Rapport mensuel** (Power et Titan) : l'API Google Search Console donne les recherches, les positions et les clics. Un rapport simple part par e-mail chaque mois.
- **Contenus** : Claude prépare des brouillons dans WordPress ; vous relisez avant de publier. Mieux vaut peu de contenus utiles que beaucoup de pages vides : Google pénalise les sites qui publient en masse.

## Ce que ça coûte (ordre de grandeur)

| Poste | Coût |
|---|---|
| Hébergement | Votre offre o2switch actuelle, qui accepte plusieurs sites |
| Noms de domaine | Environ 10 à 15 € par an et par client |
| Stripe | 1,5 % + 0,25 € par paiement par carte européenne |
| API Claude | Environ 0,02 à 0,05 $ par jeton utilisé |
| Make (publication) | Un abonnement modeste au début |

## Dans quel ordre avancer

1. **Maintenant** : valider les prix, mettre le site en ligne, vendre avec les demandes par message.
2. **Premiers clients** : Stripe (abonnements, recharges, portail client).
3. **Ensuite** : l'outil de publication avec Make (sans code).
4. **Dès quelques clients** : l'espace client sur WordPress avec le compteur de jetons et la modification par l'IA.
5. **Enfin** : les rapports SEO automatiques.

Quand l'espace client ouvre, passez `espaceClient.ouvert` à `true` dans `src/config.js` : le bandeau « ouvre bientôt » disparaît de la page Espace client.

## À ne pas oublier

- Les conditions générales et la politique de confidentialité du site parlent déjà de l'IA, des jetons et des paiements : à faire relire.
- Signer les accords de traitement des données (RGPD) proposés par vos fournisseurs (Stripe, Anthropic, Make).
- Garder une sauvegarde quotidienne de chaque site client.
