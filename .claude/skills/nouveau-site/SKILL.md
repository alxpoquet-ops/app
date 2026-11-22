---
name: nouveau-site
description: Créer, vérifier ou améliorer le site d'un client des Minis Monstres (Site Essentiel, option e-commerce, pages de visibilité Google). À utiliser quand Alex dit « créer un nouveau site », « nouveau client », « on lance un site », « fais le site de… », « vérifie le site de… », « ajoute des pages Google », ou tape /nouveau-site. Contient le parcours pas à pas et les règles de création (contenu, visuel, conversion, Google, vitesse, accessibilité, légal, livraison).
---

# Créer le site d'un client des Minis Monstres

Alex tient l'agence « Les Minis Monstres ». Il travaille surtout au téléphone : réponds en français, court et simple, sans jargon, au vouvoiement.

Ce fichier donne le parcours. Les règles détaillées sont dans `regles/` : lis le fichier d'une étape au moment où tu y arrives, pas tout d'un coup.

## Les cinq règles à ne jamais oublier

1. **Rien d'inventé.** Le site ne contient que ce que le client a donné. S'il manque une information : on la demande, ou on écrit « bientôt », ou on retire la partie.
2. **L'exemple vient du métier du client.** On prend exemple sur une marque connue du même métier que lui (des bougies pour des bougies, jamais un autre métier) : son organisation, pas son contenu. Le style reste celui du client.
3. **Un site qui vend.** En moins de dix secondes sur un téléphone, le visiteur comprend ce que fait le client, où, et comment le joindre.
4. **Le client peut modifier lui-même.** Textes et photos sont dans le contenu des pages, pas dans le thème.
5. **Jamais de secret dans la discussion ni dans le dépôt.** Mots de passe, clés et jetons se saisissent dans les réglages du site ou chez l'hébergeur.

Le détail et les autres règles : `regles/regles-d-or.md`. Lis-le en premier, à chaque fois.

## Deux façons de créer un site

**A. Tout seul (le cas normal).** Le client commande et paie sur les-minis-monstres.fr, remplit son questionnaire, et l'atelier automatique (une tâche planifiée de Claude, toutes les deux heures de 7 h à 21 h) crée le site et le livre. Cet atelier lit les mêmes règles que toi : elles lui sont servies par la route `GET /aled08/v1/atelier/regles`. Rien à faire ici, sauf si Alex demande de vérifier ou de corriger.

**B. Avec Alex (ce skill).** Pour un client hors commande en ligne, une reprise, une vérification, ou tant que l'installation automatique n'est pas réglée. Une seule étape à la fois : tu dis quoi faire, tu attends « fait », tu vérifies toi-même quand c'est possible, puis tu passes à la suite. Ne déroule jamais toute la liste d'un coup.

## Le parcours avec Alex

| Étape | Ce que tu fais | Fichier à lire |
|---|---|---|
| 1. Les questions de départ | Nom de domaine, site (avec ou sans e-commerce, pages Google), forfait, client, contenu. Avec AskUserQuestion, puis un résumé en trois lignes. | `regles/offre.md` |
| 2. Le nom de domaine et l'hébergement | Vérifier où pointe le domaine, puis installer (chemin automatique ou guidé). | `regles/installation.md` |
| 3. L'espace client | Compte client, forfait, lien entre le site et sa fiche. | `regles/installation.md` |
| 4. La recherche | Une marque connue du même métier que le client, et 2 ou 3 autres sites du métier : on prend exemple sur son organisation. | `regles/concurrents.md` |
| 5. Le site | Le contenu, le visuel, ce qui fait venir des demandes. | `regles/visuel.md`, `regles/conversion.md` |
| 6. Google | Titres, données de l'entreprise, pages de visibilité si achetées. | `regles/google.md` |
| 7. La finition | Vitesse, accessibilité, pages légales. | `regles/vitesse-accessibilite.md`, `regles/legal.md` |
| 8. Le contrôle | La liste complète, point par point. | `regles/controle-qualite.md` |
| 9. La livraison | La V1 part au client avec son e-mail. Alex est prévenu. | `regles/livraison.md` |

Termine par un court résumé pour Alex : ce qui est fait, ce qui reste, ce que le client doit compléter.

## Où sont les choses

- Les règles : `regles/` (un fichier par sujet). `regles/sources.md` dit d'où viennent les règles tirées du web et quand elles ont été relues.
- Les modèles validés par Alex (le niveau minimum) : `docs/modeles/site-essentiel-mougiline.html` et `docs/modeles/site-boutique-mougiline.html`.
- L'offre et les prix : `src/config.js` fait foi.
- Le fonctionnement de l'agence (commandes, paiements, atelier) : `docs/gestion-du-site.md`.
- Les extensions d'installation : `extensions/` et `extensions/LISEZ-MOI.md`.
- Le code de l'atelier : `src/wordpress/aled08-espace/includes/atelier.php`, `pages-google.php`, `regles.php`.

## Quand une règle change

Modifie le fichier dans `regles/`, puis refais l'export et la mise en ligne de l'extension (`python3 scripts/wp-export.py --sans-sdk`, puis installer `aled08-espace.zip` sur les-minis-monstres.fr) : l'atelier automatique lit alors la nouvelle version. Une règle ne s'écrit qu'à un seul endroit.

Travaille sur la branche indiquée par la session, sans ouvrir de demande de fusion sauf si Alex le demande.
