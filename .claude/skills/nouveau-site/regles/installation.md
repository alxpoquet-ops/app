# Installer le site et le relier à son espace client

Pour le parcours avec Alex. L'atelier automatique n'a pas besoin de ce fichier : il reçoit des sites déjà installés et reliés.

## 1. Vérifier le nom de domaine

Regarde toi-même où pointe le domaine, sans rien demander :

```bash
curl -s "https://dns.google/resolve?name=DOMAINE&type=NS"
curl -s "https://dns.google/resolve?name=DOMAINE&type=A"
```

- Aucune réponse : le domaine est libre, il faut l'acheter chez OVH.
- Serveurs `ovh.net` : acheté chez OVH, pas encore pointé vers o2switch.
- Serveurs `o2switch.net`, ou adresse `109.234.167.46` (celle de les-minis-monstres.fr) : il pointe déjà vers l'hébergement.

## 2. L'hébergement : deux chemins

Les sites sont hébergés chez **o2switch**. Les noms de domaine sont achetés chez **OVH**, avec les DNS `ns1.o2switch.net` et `ns2.o2switch.net`.

**Chemin automatique.** Il marche seulement si les clés OVH et les accès cPanel o2switch sont saisis sur les-minis-monstres.fr (Réglages de l'espace client › Mise en ligne automatique). Dans ce cas, une commande payée lance tout : domaine, https, WordPress, extension du site, lien avec l'espace client. Code : `src/wordpress/aled08-espace/includes/provision.php` et `pose.php`. Ce chemin n'a pas encore tourné pour de vrai : au premier essai, suis le journal de la commande et corrige ce qui bloque.

**Chemin guidé à la main.** Tant que le chemin automatique n'est pas réglé. Une étape à la fois avec Alex :

1. Chez OVH : acheter le domaine, ou changer ses serveurs DNS pour `ns1.o2switch.net` et `ns2.o2switch.net`.
2. Dans le cPanel o2switch : Domaines › Créer un domaine, dossier `public_html/DOMAINE`.
3. Attendre le https (vérifie avec `curl -sI https://DOMAINE/`). Les DNS peuvent prendre quelques heures.
4. Dans le cPanel : installer WordPress sur ce domaine (Softaculous), en français.
5. Envoyer à Alex l'extension du site avec SendUserFile : `extensions/minis-site-essentiel.zip` (Site Essentiel), `minis-site-boutique.zip` (avec l'option e-commerce), ou `minis-site-visibilite.zip` (seulement pour un ancien Site Visibilité). Si le connecteur a changé depuis, refais-les d'abord avec `python3 scripts/wp-export.py --sans-sdk`.
6. Dans le WordPress du client : Extensions › Ajouter › Téléverser, installer, activer. La page « Minis Monstres » fait tout et chaque ligne passe au vert. Si une ligne reste rouge : « Relancer l'installation ».

## 3. L'espace client

- Le client a-t-il déjà un compte sur les-minis-monstres.fr ? Sinon, crée-le (rôle `aled08_client`) avec les outils WordPress « Mini monstres », et règle `aled08_forfait` (`base` pour le Forfait Mini), `aled08_boutique` (1 avec l'option e-commerce), `aled08_domaine_fourni` (1 si le domaine est fourni) et `aled08_site` (l'adresse du site, en https).
- Le lien entre le site et l'espace client se fait tout seul dès que `aled08_site` porte l'adresse du site. Vérifie dans la fiche du client que la ligne Connexion dit OK.
- Le mail de bienvenue part avec la note temporaire `aled08e_bienvenue_envoi` (voir `includes/bienvenue.php`). Ne l'envoie que si Alex le demande, et n'écris jamais le mot de passe dans le dépôt.

## 4. Travailler sur le site : par l'atelier

Dès que le site est installé, il se relie tout seul à sa fiche. Tu passes par les-minis-monstres.fr (outils WordPress « Mini monstres »), sans rien brancher sur le site du client.

| Pour | Appel |
|---|---|
| Voir les sites reliés | `wp_rest_read` sur `/aled08/v1/atelier` |
| Agir sur un site | `wp_rest_write` sur `/aled08/v1/atelier` avec `{ "site": "DOMAINE", "action": "atelier_rest", "args": { "methode": "GET|POST|PUT|DELETE", "route": "/wp/v2/pages", "requete": { … }, "corps": { … } } }` |
| Poser une image | action `atelier_image` avec `{ "url": "https://…", "alt": "…" }` ou `{ "base64": "…", "nom": "photo.jpg", "alt": "…" }` |
| Noter que le visuel est fini | action `visuel_fait` |
| Voir les commandes en cours | `wp_rest_read` sur `/aled08/v1/atelier/chantiers` (ajouter `{"commande": ID}` pour le questionnaire et les échanges) |
| Poser une question au client, noter, livrer | `wp_rest_write` sur `/aled08/v1/atelier/chantier` (voir `livraison.md`) |
| Ouvrir le mode modification d'un client (pour vérifier ou aider) | `wp_rest_write` sur `/aled08/v1/atelier/edition` avec `{ "fiche": ID, "page": "/" }` : un lien valable 10 minutes, une seule fois |
| Voir l'application comme un client | `wp_rest_write` sur `/aled08/v1/atelier/voir-client` avec `{ "fiche": ID }` |
| Lire les règles servies à l'atelier automatique | `wp_rest_read` sur `/aled08/v1/atelier/regles` |

Toute l'interface REST du site du client est ouverte (pages, modèles, styles, réglages, menus), sauf les comptes et les mots de passe.

## 5. L'hébergeur o2switch et ses protections

Le pare-feu d'o2switch (Tiger Protect) ralentit ou bloque les rafales de requêtes (réponse 429, ou une page « Security check »). Quand tu vérifies un site : une requête à la fois, avec une petite pause, et garde en cache ce qui ne change pas (images, styles).
