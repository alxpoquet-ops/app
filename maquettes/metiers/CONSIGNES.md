# Consignes pour fabriquer une maquette type de métier (Les Minis Monstres)

Le modèle validé par Alex : `maquettes/plombier-chauffagiste.html` (lis-le en entier avant de commencer). Une maquette
est la page d'accueil d'exemple qu'on montre à un artisan qu'on démarche par e-mail : « voici à quoi pourrait ressembler
votre site ». Elle est remplie automatiquement pour chaque prospect avec `{{ENTREPRISE}}`, `{{VILLE}}`, `{{INITIALE}}`.

## Ce que tu produis, pour chaque groupe de métier

1. `maquettes/metiers/<groupe>.html` : la maquette.
2. `maquettes/metiers/<groupe>.json` : `{"groupe": "...", "nom": "...", "mots": [...], "photos": {"accueil": "https://images.pexels.com/photos/ID/pexels-photo-ID.jpeg", ...}}`
   (groupe, nom et mots sont donnés dans ta mission : ne les change pas).

## Règles (toutes obligatoires)

- **Même structure que le modèle** : filigrane `<div class="filigrane">` (texte « MAQUETTE D’EXEMPLE · LES MINIS MONSTRES »),
  bandeau `<p class="bandeau">Maquette pour vous projeter, préparée pour <b>{{ENTREPRISE}}</b> par Les Minis Monstres (vue ordinateur) : votre site s’adapte aussi au téléphone, et il sera modifiable à 100 %, selon vos goûts.</p>`,
  en-tête collant avec logo `{{INITIALE}}` + `{{ENTREPRISE}}`, menu, bouton d'appel, bouton soleil/lune et menu téléphone (décoratifs),
  grand bandeau d'accueil avec photo, sections services (cartes avec pictos SVG dessinés à la main, simples), « pourquoi nous »
  (à compléter), « comment ça se passe » (étapes), secteur / zone (`{{VILLE}}`), avis (emplacements vides), contact, pied de page.
  Adapte les sections au métier (ex. un gîte : chambres, alentours, réserver ; un restaurant : carte, horaires).
- **Couleurs propres au métier**, différentes du plombier (bleu/orange) et entre elles. Polices Google Fonts possibles (comme le modèle).
  Contrastes lisibles (texte foncé sur fond clair, blanc sur fond foncé).
- **RIEN D'INVENTÉ sur l'entreprise** : pas de nom de personne, pas de numéro, pas d'adresse, pas de prix, pas d'horaires réels,
  pas d'années d'expérience, pas de chiffres (« 500 clients », « 4,9/5 »), pas de label ou certification, pas de promesse
  (« intervention en 30 min », « le moins cher »). Tout ce qui n'est pas `{{ENTREPRISE}}`/`{{VILLE}}`/`{{INITIALE}}` est
  visiblement un exemple : étiquettes `<span class="exemple">exemples à adapter</span>`, « Votre numéro », « Vos horaires »,
  « vos vrais avis Google ici », « L’avis d’un de vos clients s’affichera ici ». Les étoiles des avis restent décoratives, sans note.
- **Bien-être et métiers proches de la santé** : aucune promesse de soin ou de guérison, aucun mot médical (« soigner », « guérir »,
  « traitement », « thérapie » pour une maladie) ; écrire « détente », « bien-être », « accompagnement », et une petite ligne
  « Ces pratiques ne remplacent pas un avis médical. »
- **Pas de script, pas de `<form>`, pas d'`<input>`, pas de `<button>`, pas d'`<iframe>`, pas d'attribut `on…`** : le formulaire de
  contact est dessiné avec des `<div class="champ">` comme dans le modèle.
- **Photos** : uniquement Pexels (licence libre, usage commercial permis). Dans le HTML, écris `src="{{PHOTO:accueil}}"`,
  `{{PHOTO:atelier}}`, `{{PHOTO:detail}}` (3 photos, le nom du repère est libre, en minuscules sans espace), et mets l'adresse
  dans le JSON sous la forme exacte `https://images.pexels.com/photos/ID/pexels-photo-ID.jpeg` (sans paramètres).
  Pour trouver des photos : WebSearch « pexels <sujet> photo » puis ouvre la page pexels.com/photo/...-ID/ pour lire l'ID.
  **Vérifie chaque photo** : télécharge-la (`curl -s -o /tmp/<groupe>-<repere>.jpg "https://images.pexels.com/photos/ID/pexels-photo-ID.jpeg?auto=compress&cs=tinysrgb&w=800"`)
  puis regarde-la avec l'outil Read : elle doit montrer clairement le métier, sans texte, sans marque, sans logo, plutôt sans visage
  en gros plan. Si elle ne va pas, prends-en une autre.
- Textes en français, au « nous » de l'entreprise (« Nous intervenons… » reste au conditionnel d'exemple ou entre étiquettes),
  simples, chaleureux, vouvoiement. Pas d'anglais, pas de jargon.
- Le fichier doit contenir littéralement `{{ENTREPRISE}}`, `{{VILLE}}`, `filigrane` et `Maquette`. Taille : 8 à 60 Ko.
- Vérifie le rendu : `node -e` n'est pas nécessaire ; lance Playwright (déjà installé : `require('playwright')`) pour faire une
  capture 1280 × 2200 de ton fichier où tu remplaces les `{{…}}` (ENTREPRISE = un nom d'exemple, VILLE = « Metz », photos = les
  URL avec `?auto=compress&cs=tinysrgb&w=1280`), enregistre-la dans `/tmp/<groupe>.png` et regarde-la avec Read. Corrige ce qui
  déborde ou ce qui est illisible.

Ne touche à rien d'autre dans le dépôt. Pas de commit.
