# 3h12

Un jeu court en pixel art isométrique, fait avec **Godot 4.5**.

Noé se réveille dans une pièce plongée dans le noir. Il trouve une lanterne. Il veut sortir, mais à la porte, une voix
lui dit qu'il lui manque quelque chose. À chaque souvenir retrouvé (sa mère, la mer, le déménagement, son grand-père),
il croit pouvoir partir… et se réveille dans la même pièce.

Un jeu un peu effrayant au début, de plus en plus lumineux, sur la dépression, le déménagement et ce qu'on n'ose pas dire.

> 📖 Toute l'histoire, avec la fin : [`docs/HISTOIRE.md`](docs/HISTOIRE.md) (attention, ça révèle tout).

## Lancer le jeu

1. Installer [Godot 4.5](https://godotengine.org/download) (version standard, pas besoin de la version .NET).
2. Ouvrir Godot → **Importer** → choisir le fichier `project.godot` de ce dossier.
3. Appuyer sur **F5** (ou le bouton ▶ en haut à droite).

## Commandes

| Action | Clavier | Manette | Tactile / souris |
|---|---|---|---|
| Se déplacer | ZQSD / WASD / flèches | stick gauche, croix | toucher le sol |
| Examiner, parler, valider | E, Espace, Entrée | A | toucher l'objet, ou le texte en bas à gauche |
| Choisir une réponse | haut / bas puis E | croix puis A | toucher la réponse |
| Plein écran | F11 | | |

## Organisation du projet

```
project.godot          réglages (résolution 384×216, agrandie en pixels entiers)
scenes/main.tscn       la seule scène : tout est construit par le code
scripts/
  game.gd              état de la partie (boucle, souvenirs, choix) + contrôles
  main.gd              monde, lumière, interface, écrans titre / générique / fin
  director.gd          LA LOGIQUE DE L'HISTOIRE : quoi se passe, quand
  rooms.gd             plan des pièces et ce qu'elles contiennent à chaque boucle
  room.gd              dessin du sol, des murs, des portes, du décor mural
  prop.gd              dessin des meubles et objets
  player.gd            Noé (déplacement, lanterne)
  shadow.gd            l'Autre (la silhouette)
  sprites.gd           pixel art du personnage, écrit en texte
  dialogue.gd          boîte de dialogue, narratrice, choix
  ambience.gd          sons générés en direct (provisoire)
  iso.gd, pal.gd       projection isométrique, palette de couleurs
shaders/darkness.gdshader   l'obscurité tramée et la lumière sous la porte
story/dialogues.json   TOUS LES TEXTES DU JEU
assets/fonts/          police Jersey 10 (licence OFL)
docs/HISTOIRE.md       la bible de l'histoire
```

## Modifier les textes

Tout est dans `story/dialogues.json`, une réplique par ligne :

```json
"carton_open": [
    {"w": "d",    "t": "Sous trois couches de papier journal : un bol."},
    {"w": "noe",  "t": "Elle me l'a glissé en cachette."},
    {"w": "narr", "t": "Tu commences à te souvenir. Doucement."}
]
```

- `w` = qui parle : `d` (description), `noe` (Noé), `narr` (la voix douce), `voice` (au téléphone), `echo` (la petite voix inquiétante)
- `{"choice": ["Option A", "Option B"]}` = un choix
- `{"fx": "shake"}` = un effet (`shake`, `knock`, `static`, `buzz`, `chime`, `thud`, `flash`)
- `{"wait": 1.0}` = une pause

Variantes automatiques : `bed_c3` est utilisé à la boucle 3 au lieu de `bed`, et `carton_after` une fois le souvenir trouvé.

## Version navigateur

`export_presets.cfg` contient un préréglage **Web** (sans threads, compatible avec n'importe quel hébergement).
Dans Godot : **Projet → Exporter… → Web → Exporter le projet**. Les modèles d'export (« export templates »)
s'installent depuis ce même menu la première fois. Sur navigateur, l'image s'agrandit pour remplir l'écran ;
sur PC, elle s'agrandit par multiples entiers pour garder des pixels nets.

## Outils de test

Lancer directement une boucle, une pièce, un dialogue (pratique pour travailler une scène) :

```bash
godot --path . -- --cycle=3 --room=entree --at=3,3 --say=knock
godot --path . -- --cycle=5 --room=entree --dead          # la boucle noire, lanterne éteinte
godot --path . -- --autoplay                              # joue toute l'histoire, en accéléré
```

`--shot=capture.png --wait=2` prend une capture d'écran puis quitte.

## Où on en est (prototype jouable)

- ✅ L'histoire complète, de bout en bout : 4 boucles, fausse fin, boucle noire, porte, palier, appel, écran de fin
- ✅ 5 pièces isométriques, obscurité tramée, lanterne, fil de lumière sous la porte
- ✅ Choix multiples (11 choix), compteur d'« ouverture » qui change la lumière et une réplique de la fin
- ✅ Clavier, manette, souris et tactile
- 🟡 Graphismes **provisoires** dessinés par le code : à remplacer par de vraies planches (Aseprite)
- 🟡 Sons **provisoires** générés par le code : à remplacer par une musique et des bruitages
- ⬜ Voix de la narratrice (comédienne ou ElevenLabs)
- ⬜ Sauvegarde, menu pause, réglages (volume, vitesse du texte)
- ⬜ Exports : Windows / Mac / Linux, Android / iOS ; consoles via un studio de portage (W4 Games, Lone Wolf, Pineapple Works)

## Crédits

- Police **Jersey 10**, The Soft Type Project Authors, licence SIL Open Font License (`assets/fonts/OFL-Jersey10.txt`).
