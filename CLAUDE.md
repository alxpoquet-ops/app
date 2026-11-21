# Les Minis Monstres : repères pour Claude

- Les extensions d'installation des sites clients sont gardées dans `extensions/` : `minis-site-essentiel.zip`, `minis-site-visibilite.zip`, `minis-site-boutique.zip`. Quand Alex en demande une, la lui envoyer telle quelle (après `python3 scripts/wp-export.py --sans-sdk` si le connecteur a changé). Mode d'emploi : `extensions/LISEZ-MOI.md`. Code : `src/wordpress/minis-site/`.
- Le site se construit avec `node build.js` ; `node scripts/check.js` doit donner 0 erreur, 0 avertissement, 0 phrase dupliquée.
- La marche à suivre pour mettre en ligne est dans `docs/gestion-du-site.md`.
- Pour créer le site d'un nouveau client, suivre la marche guidée `.claude/skills/nouveau-site/SKILL.md` (commande `/nouveau-site`) : questions d'abord, puis une étape à la fois.
- Niveau minimum d'un Site Essentiel (validé par Alex) : `docs/modeles/site-essentiel-mougiline.html`. Règles : rien d'inventé, clair par défaut avec bouton soleil / lune, recherche de concurrents, menu téléphone avec icônes, pas de gadget non demandé.
