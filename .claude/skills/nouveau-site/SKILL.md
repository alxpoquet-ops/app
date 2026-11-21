---
name: nouveau-site
description: Créer le site d'un nouveau client des Minis Monstres, pas à pas. À utiliser quand Alex dit « créer un nouveau site », « nouveau client », « on lance un site » ou tape /nouveau-site. Pose les questions (nom de domaine, pack, infos du client), puis guide Alex étape par étape jusqu'au site en ligne.
---

# Créer un nouveau site client

Alex tient l'agence « Les Minis Monstres ». Il travaille surtout au téléphone. Réponds en français, court et simple, sans jargon. Une seule étape à la fois : tu dis quoi faire, tu attends qu'il réponde « fait », tu vérifies toi-même quand c'est possible, puis tu passes à la suite. Ne déroule jamais toute la liste d'un coup.

Ne demande jamais de mot de passe, de clé ni de jeton dans la discussion. Ils se collent dans les réglages du site ou chez l'hébergeur.

## 1. Les questions de départ

Pose-les avec AskUserQuestion, dans cet ordre, puis résume en trois lignes avant de commencer.

1. **Le nom de domaine** (texte libre). Demande aussi s'il est déjà acheté.
2. **Le pack** : Site Essentiel (500 €, une page), Site Visibilité (750 €, jusqu'à 20 pages), Site Boutique (1 200 €, WooCommerce).
3. **Le forfait** : Autonomie (0 €), ou Forfait Mini (10 € par mois, 12 € si le nom de domaine est fourni).
4. **Le client** : prénom, nom de l'activité, métier, ville, e-mail, téléphone.
5. **Le contenu** : textes déjà prêts ou à écrire, photos, logo, couleurs ou ambiance voulue.

## 2. Vérifier le nom de domaine

Regarde toi-même où pointe le domaine, sans rien demander :

```bash
curl -s "https://dns.google/resolve?name=DOMAINE&type=NS"
curl -s "https://dns.google/resolve?name=DOMAINE&type=A"
```

- Aucune réponse : le domaine est libre, il faut l'acheter chez OVH.
- Serveurs `ovh.net` : acheté chez OVH, pas encore pointé vers o2switch.
- Serveurs `o2switch.net`, ou adresse `109.234.167.46` (celle de les-minis-monstres.fr) : il pointe déjà vers l'hébergement.

## 3. L'hébergement : deux chemins

Les sites sont hébergés chez **o2switch**. Les noms de domaine sont achetés chez **OVH**, avec les DNS `ns1.o2switch.net` et `ns2.o2switch.net`.

**Chemin automatique.** Il marche seulement si les clés OVH et le jeton cPanel o2switch sont réglés sur les-minis-monstres.fr (Les Minis Monstres › Réglages). Dans ce cas, une commande payée lance tout : domaine, https, WordPress, extension du pack, lien avec l'espace client. Le code est dans `src/wordpress/aled08-espace/includes/provision.php` et `pose.php`. Ce chemin n'a pas encore tourné pour de vrai : au premier essai, suis le journal de la commande et corrige ce qui bloque.

**Chemin guidé à la main.** À utiliser tant que le chemin automatique n'est pas réglé. Guide Alex, une étape à la fois :

1. Chez OVH : acheter le domaine, ou changer ses serveurs DNS pour `ns1.o2switch.net` et `ns2.o2switch.net`.
2. Dans le cPanel o2switch : Domaines › Créer un domaine, dossier `public_html/DOMAINE`.
3. Attendre le https (vérifie avec `curl -sI https://DOMAINE/`). Les DNS peuvent prendre quelques heures.
4. Dans le cPanel : installer WordPress sur ce domaine (Softaculous), en français.
5. Envoyer à Alex l'extension du pack avec SendUserFile : `extensions/minis-site-essentiel.zip`, `minis-site-visibilite.zip` ou `minis-site-boutique.zip`. Si le connecteur a changé depuis, refais-les d'abord avec `python3 scripts/wp-export.py --sans-sdk`.
6. Dans le WordPress du client : Extensions › Ajouter › Téléverser, installer, activer. La page « Minis Monstres » fait tout et chaque ligne passe au vert. Si une ligne reste rouge, « Relancer l'installation ».

## 4. L'espace client

- Le client a-t-il déjà un compte sur les-minis-monstres.fr ? Sinon, crée-le (rôle `aled08_client`) avec les outils WordPress « Mini_monstres », et règle `aled08_forfait` (`base` pour le Forfait Mini), `aled08_boutique` (1 pour un Site Boutique), `aled08_domaine_fourni` (1 si le domaine est fourni) et `aled08_site` (l'adresse du site, en https).
- Le lien entre le site et l'espace client se fait tout seul dès que `aled08_site` porte l'adresse du site. Vérifie dans la fiche du client, bloc « Bricou : site relié », que la ligne Connexion dit OK.
- Le mail de bienvenue aux couleurs du site part avec la note temporaire `aled08e_bienvenue_envoi` (voir `includes/bienvenue.php`). Ne l'envoie que si Alex le demande, et n'écris jamais le mot de passe dans le dépôt.

## 5. Travailler sur le site : par l'atelier, sans rien brancher

Tu n'as plus besoin qu'Alex relie chaque site à Claude. Dès que le site est installé, il se relie tout seul à sa fiche, et tu passes par les-minis-monstres.fr (outils WordPress « Mini monstres ») :

- Voir les sites reliés : `wp_rest_read` sur la route `/aled08/v1/atelier`.
- Agir sur un site : `wp_rest_write` sur `/aled08/v1/atelier` avec `{ "site": "DOMAINE", "action": "atelier_rest", "args": { "methode": "GET|POST|PUT|DELETE", "route": "/wp/v2/pages", "requete": { … }, "corps": { … } } }`. Toute l'interface REST du site est ouverte (pages, modèles, styles, réglages, menus, extensions), sauf les comptes et les mots de passe.
- Poser une image : action `atelier_image` avec `{ "url": "https://…" }` ou `{ "base64": "…", "nom": "photo.jpg", "alt": "…" }`.
- Quand le visuel est fini : action `visuel_fait` (note la date sur la fiche).

Le branchement Easy MCP AI reste possible en secours, si Alex le demande.

## 6 bis. Deux règles pour tout visuel (21 novembre 2026)

- **Rien d'inventé.** Le site ne contient que ce que le client a donné dans le questionnaire et dans ses réponses : pas de service, d'horaire, de délai, de produit, de parfum, de promesse ou de formule qu'il n'a pas dits. S'il manque quelque chose, on pose la question ; sinon on écrit « bientôt » ou on retire la partie.
- **Clair et sombre.** Chaque visuel existe dans les deux apparences : couleurs en variables, un jeu clair et un jeu sombre, appliqués selon `prefers-color-scheme` et selon `data-theme="light"` ou `data-theme="dark"` posé sur `<html>`. Le client choisit l'apparence d'ouverture dans son espace (Mon compte › L'apparence de mon site) ; le connecteur pose alors `data-theme`.

## 6. Le visuel

Par l'atelier, c'est ton travail :

- Un thème propre et léger, agréable d'abord au téléphone, puis sur ordinateur.
- Les couleurs, le logo et les photos du client.
- Remplacer tous les textes [entre crochets] par les vrais mots du client, simples et chaleureux.
- Garder le formulaire de contact, le menu et, pour une boutique, WooCommerce tel quel : on ne réinvente rien.
- Montre une capture à Alex avant de dire que c'est fini.

## 7. Avant d'ouvrir au public

Passe cette liste avec Alex, point par point :

- Les mentions légales et la politique de confidentialité sont complétées (nom, statut, SIRET, adresse). Pour une boutique : les conditions générales de vente aussi.
- Pour une boutique : Stripe ou PayPal est relié au compte du client, ou la boutique reste en vitrine sans panier.
- Plus aucun texte [entre crochets] sur le site.
- Réglages › Lecture : « Demander aux moteurs de recherche de ne pas indexer ce site » est décoché.
- Le formulaire de contact envoie bien un message d'essai.
- Dans la fiche de la commande, s'il y en a une : « Site en ligne ».

Termine par un court résumé : ce qui est fait, ce qui reste, et les identifiants à transmettre au client par un moyen sûr.

## Repères

- Mode d'emploi des extensions : `extensions/LISEZ-MOI.md`.
- Mise en ligne de les-minis-monstres.fr : `docs/gestion-du-site.md`.
- Travaille sur la branche indiquée par la session, sans ouvrir de demande de fusion sauf si Alex le demande.
