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
2. **Le pack** : Site Essentiel (500 €, une page), Site Visibilité (750 €, jusqu'à 15 pages), Site Boutique (1 200 €, WooCommerce).
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
- **Clair et sombre.** Chaque visuel existe dans les deux apparences : couleurs en variables, un jeu clair et un jeu sombre, appliqués selon `data-theme="light"` ou `data-theme="dark"` posé sur `<html>` par le connecteur. Le site s'ouvre en clair. En haut du site, un bouton rond avec un soleil (clair) et une lune (sombre) qui bascule, avec une petite animation : il appelle `minisTheme('dark')` ou `minisTheme('light')` (fourni par le connecteur, qui garde le choix du visiteur). Le client peut changer l'ouverture dans son espace (Mon compte › L'apparence de mon site).
- **Chaque site est différent.** Avant le visuel, fais une petite recherche sur le web : 3 à 5 sites de concurrents ou de marques du même métier. Note ce qui se fait (couleurs, mise en page, ce qui est mis en avant) et choisis une direction qui se distingue tout en restant dans l'esprit du métier. On s'inspire du style, jamais du contenu : rien ne vient des concurrents dans les textes.
- **Toutes les largeurs de téléphone.** Vérifier chaque page à 320, 360, 390 et 430 px : rien ne dépasse à droite, pas de défilement de côté. L'en-tête (nom, contact, panier, soleil / lune, trois traits) tient sur une ligne : boutons plus petits et nom plus court en dessous de 440 px.
- **Des petits effets flottants** en rapport avec le métier (flammes et gouttes de cire pour des bougies, pétales pour une fleuriste, bulles pour un savonnier…) : posés dans les parties de la page (position absolue, ils défilent avec elle, jamais fixés à l'écran), derrière le texte et loin de lui, discrets, qui bougent doucement, et arrêtés si le visiteur demande moins d'animations. Plus doux en sombre.
- **Site Visibilité (et Site Boutique, qui le contient) : le même niveau que l'Essentiel, plus Google.** Jusqu'à 15 pages :
  - l'accueil au niveau du modèle Essentiel ;
  - une page par service ou produit phare, chacune avec son mot clé (réponses « recherches » et produits du questionnaire) ;
  - une page locale par ville ou secteur donné par le client (réponse « villes »), jamais d'autre ville ;
  - une FAQ complète sur sa propre page ;
  - des pages de conseils sur le métier (validé par Alex, option 1) : savoir général et exact, sans rien dire du client qu'il n'ait donné (ni prix, ni promesse, ni délai, ni méthode de fabrication), et listées dans le résumé pour que le client les relise ;
  - sur chaque page : titre et description pour Google, données structurées de l'entreprise (nom, ville, activité, contact), liens entre les pages ; le plan du site à jour.
- **Le résumé pour le client.** Avec « à vérifier », l'atelier envoie aussi `resume` : le contenu du site expliqué au client (une ligne « - » par partie avec ses vraies informations, le menu téléphone et le soleil / lune, puis « À nous envoyer quand vous pourrez » avec ce qui manque). Alex le voit dans son e-mail de vérification, et le client le reçoit dans « Votre site est en ligne ». Pour le Site Visibilité et le Site Boutique, envoyer aussi `pages_total` (toutes les pages du site) et `pages_google` (celles faites pour Google : pages produits ou services, pages locales, conseils, questions fréquentes). L'e-mail dit « Votre site compte X pages, dont Y pages de visibilité Google », présentées comme autant de portes d'entrée sur le site. Pour le Site Boutique, envoyer aussi `articles` (le nombre d'articles mis dans la boutique) : l'e-mail le dit et rappelle que le client en ajoute sans limite depuis son application (Ma boutique › Mes articles). L'e-mail de livraison l'annonce, présente le contenu en cartes pastel avec les petits monstres, et rappelle que tout se règle depuis l'application (l'espace client).
- **Le prénom dans les e-mails** : celui de la personne, donné dans le formulaire de commande et de paiement (prénom du compte client), jamais le nom de l'entreprise. Pour Flore & Chenilles : Laurine.
- **Toujours cohérent avec l'espace client, sans demander.** Ce que le site affiche suit les réglages du client dans son application : boutique en pause (vente coupée) = aucun prix, aucun paiement en ligne, aucun frais chiffré nulle part (pages, accueil, descriptions Google), on parle de demande de réservation. Une incohérence trouvée se corrige tout de suite, on ne pose pas la question. Pour Flore, c'est l'extension `flore-vitrine` (1.1.0) qui le fait sur toutes les pages tant que `alexlia_vitrine_active()` est vrai.
- **Client déjà installé, sans commande dans l'atelier (ex. Flore).** `POST /aled08/v1/atelier/livraison` { fiche (id du compte client), type, resume, pages_total, pages_google, pages_formule, articles, forfait } envoie le même e-mail « Votre site est en ligne ». Par défaut c'est un **aperçu envoyé à Alex seulement**. `pages_formule` = les pages comprises dans la formule (15 pour Visibilité et Boutique) : au-delà, l'e-mail dit « Les X pages en plus vous sont offertes par les Minis Monstres ». `forfait` (le nom du forfait du client, ex. « Forfait Mini ») titre la carte « Votre forfait ». `offerts` : [[libellé, prix], …] (ex. la création du site, les pages de visibilité en plus chiffrées en packs à 15 € la page, le forfait, l'option nom de domaine) affiche une carte « Offert par les Minis Monstres » : chaque prix barré, puis « Offert ». Dans `resume`, une ligne « - Titre (N pages) : détail » met le titre en gras. Au client seulement avec `apercu: false` et `accord_alex: true`, quand Alex a dit « OK ».
- **Le minimum validé par Alex pour un Site Boutique** : la maquette `docs/modeles/site-boutique-mougiline.html` (essai Mougiline, validée le 21/11/2026) : accueil, boutique, fiche par produit, panier en tiroir, page de commande, page locale, conseils, questions, contact.
- **Le minimum validé par Alex pour un Site Essentiel** : la maquette `docs/modeles/site-essentiel-mougiline.html` (essai Mougiline, validé le 21/11/2026). Chaque nouveau site atteint au moins ce niveau (parties, menu téléphone, cadre des points forts, icônes, FAQ, contact), avec son propre style et uniquement le contenu de son client.
- **Un site qui vaut son prix et rivalise avec la concurrence : agréable et vendeur.** Même le Site Essentiel (une seule page) est une page longue et riche, découpée en parties qu'on fait défiler :
  - **En-tête collé en haut** : le nom, les liens vers chaque partie (celle qu'on lit s'allume), un bouton « Contact » toujours visible, le bouton soleil / lune.
  - **Sur téléphone, un menu à trois traits** qui se change en croix et ouvre un vrai panneau soigné (grands liens, chacun avec une petite icône dessinée dans l'esprit du métier, jamais de numéros ; couleurs du site, un petit effet du métier, un bouton contact en bas). Jamais une simple liste grise.
  - **Les parties** : une ouverture forte avec deux boutons d'action ; les points forts dans un cadre fixe aux couleurs du site (icônes, pas de bandeau qui défile en boucle) ; « Pourquoi choisir … » (3 ou 4 raisons avec icônes) ; ce que le client propose avec ses prix et un bouton « Commander » ou « Demander » sur chaque carte ; la saison ou le produit vedette s'il y en a un ; « Comment ça se passe » en étapes illustrées par des icônes (pas de numéros) ; la galerie ; où le trouver ; une **FAQ** (6 à 8 questions) ; le contact avec un formulaire dont le choix de demande se remplit selon le bouton cliqué ; un pied de page complet.
  - **Pas de gadget que le client n'a pas demandé** (générateur, simulateur, aperçu à personnaliser…).
  - Toutes ces parties se remplissent **uniquement avec ce que le client a donné** : on reformule, on met en valeur, on n'ajoute rien. Une partie sans matière est retirée ou marquée « bientôt » ; s'il en manque trop, on pose la question au client.

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
