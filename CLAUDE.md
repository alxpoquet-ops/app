# Les Minis Monstres : repères pour Claude

- Les extensions d'installation des sites clients sont gardées dans `extensions/` : `minis-site-essentiel.zip`, `minis-site-visibilite.zip`, `minis-site-boutique.zip`. Quand Alex en demande une, la lui envoyer telle quelle (après `python3 scripts/wp-export.py --sans-sdk` si le connecteur a changé). Mode d'emploi : `extensions/LISEZ-MOI.md`. Code : `src/wordpress/minis-site/`.
- Le site se construit avec `node build.js` ; `node scripts/check.js` doit donner 0 erreur, 0 avertissement, 0 phrase dupliquée.
- La marche à suivre pour mettre en ligne est dans `docs/gestion-du-site.md`.
