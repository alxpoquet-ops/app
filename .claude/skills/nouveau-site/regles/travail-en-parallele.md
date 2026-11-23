# Beaucoup de travail : l'ordre, et les sous-agents en parallèle

Décision d'Alex (23 novembre 2026) : quand plusieurs travaux attendent, l'agent les fait dans un ordre fixe, et peut se faire aider par des sous-agents qui travaillent en même temps que lui.

## 1. L'ordre

1. **Les modifications** : elles sont rapides, et le client attend.
2. **Les pages de visibilité Google.**
3. **Les sites.**

Dans chaque groupe, du plus ancien au plus récent. Un travail renvoyé (`a_corriger` pour le constructeur) passe avant un travail neuf du même groupe.

## 2. Les sous-agents

Dès qu'il y a plus d'un travail, et si tu as l'outil pour lancer un sous-agent, confie chaque part du travail à un sous-agent : ils avancent en parallèle. Tu restes le chef : tu répartis, tu lis ce que chacun rend, et toi seul écris le bilan du passage.

**Le découpage :**

- **Un sous-agent, un client.** Jamais deux sous-agents sur le même site en même temps : ils écraseraient le travail l'un de l'autre. Toutes les demandes d'un même client vont au même sous-agent, qui les fait l'une après l'autre.
- **Trois sous-agents au plus en même temps.** Tout passe par les-minis-monstres.fr, et l'hébergeur bloque les rafales. Quand un sous-agent a fini, le suivant peut partir.
- **Six sites au plus par passage** (deux tours de trois). Les autres attendent le passage suivant, deux heures plus tard : rien ne se perd, chaque travail garde son état.
- Un seul travail en attente : fais-le toi-même, sans sous-agent.

**Ce que tu donnes à chaque sous-agent :**

1. Sa mission : le client, les travaux à faire (numéro de commande ou de demande), et la partie de ta fiche de poste qui les concerne, recopiée.
2. Les noms des règles à lire. Il les lit lui-même : `GET /aled08/v1/atelier/regles` avec `{"fichier": "NOM"}`.
3. **Les garde-fous de ta tâche planifiée, recopiés mot pour mot.** Ils passent avant tout, pour lui comme pour toi.
4. Ce qu'il ne fait pas : toucher à un autre client ou à un autre travail que le sien, écrire le bilan (`passage`), écrire une note `decision` dans la mémoire, mettre `accord_alex` dans un appel.
5. Ce qu'il te rend : ce qu'il a fait, l'appel envoyé à l'atelier (`a_controler`, `livrer`, `corriger`, `faite`, `valider`, `pour_alex`…) et sa réponse, ce qui bloque.

**Pour le constructeur :** chaque sous-agent fait le travail jusqu'à l'envoi au contrôle (`a_controler`), compris. Il relit lui-même son texte phrase par phrase avant de l'envoyer (le second regard de ta fiche). Le vrai contrôle reste celui du contrôleur.

**Pour le contrôleur :** chaque sous-agent contrôle les travaux d'un client et décide lui-même : livrer (`livrer`, `faite`, `valider`) ou renvoyer (`corriger`). Avec la même règle : dans le doute, il refuse.

## 3. Après les sous-agents

- Lis ce que chacun a rendu. Un sous-agent qui n'a pas fini, ou qui s'est trompé de client : son travail reste dans son état et sera repris au passage suivant. Dis-le dans ton bilan.
- Une erreur qu'un sous-agent signale : même règle que d'habitude (`escalade` si elle revient).
- Les leçons et les faits sur un client que les sous-agents te rapportent : c'est toi qui les écris dans la mémoire.
- Ton bilan compte tout le travail du passage, le tien et celui des sous-agents.

Sans l'outil pour lancer un sous-agent, fais tout toi-même, dans le même ordre, avec la même limite de six sites.
