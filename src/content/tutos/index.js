// Mini Tuto (décision d'Alex, 24 novembre 2026) : l'atelier des formations des Minis Monstres.
// Plein de petits tutos gratuits, clairs, efficaces et généreux, rangés par thème, puis trois grandes formations
// « Apprendre à avoir ses Minis Monstres » (src/content/formations.js). Le but : que les gens apprennent vraiment.
//
// FORMAT D'UN TUTO (le même que src/content/guides.js, plus quelques champs) :
//   slug         : adresse, /mini-tuto/<slug>/ (minuscules, tirets, unique, jamais celui d'un guide existant)
//   groupe       : l'id d'un thème ci-dessous
//   icon         : une icône de src/lib/icons.js (vérifier qu'elle existe)
//   monstre      : le petit monstre qui présente le tuto (mascotte, bricou, etoile, mochi, gelee, champi, chaton, dino, clin, ravie)
//   nom          : le titre court (carte du hub)
//   resume       : une phrase (carte du hub)
//   duree        : minutes de lecture et de mise en pratique (nombre)
//   niveau       : 'Débutant' | 'Intermédiaire'
//   h1, title (≤ 65 caractères, finit par « | Les Minis Monstres »), description (120 à 160 caractères), lead
//   body         : le tuto en Markdown (## titres, listes numérotées pour les étapes, **gras**, > encadrés).
//                  Toujours : à quoi ça sert, les étapes une par une, un exemple concret, les erreurs à éviter,
//                  et une liste « À faire aujourd'hui » à la fin. Chaque mot technique expliqué la première fois.
//   faq          : [{ q, a }] (2 à 4, facultatif)
//   voir         : slugs de tutos ou de guides liés (2 à 3)
//   formation    : slug de la grande formation liée (facultatif) : 'formation-automatiser-ses-taches', 'formation-assistant-qui-ecrit',
//                  'formation-monter-sa-petite-bande'. La page du tuto montre alors la carte « Pour tout savoir ».
// Consigne d'Alex (24 novembre 2026) : un tuto explique RAPIDEMENT l'essentiel (400 à 700 mots), sans tout dire, pour donner envie
// de la formation ; la formation, elle, dit tout ce qu'il faut savoir.
// Règles (scripts/check.js) : aucun tiret long, pas de phrase de 9 mots ou plus reprise d'une autre page,
// rien d'inventé (pas de chiffre sans source fiable, pas de faux avis), vouvoiement, français simple, phrases courtes.
const groupes = [
  { id: 'visible', titre: 'Être vu sur internet', texte: 'Google, les mots-clés, les avis : pour qu’on vous trouve.', icon: 'search-check', color: 'butter', monstre: 'gelee' },
  { id: 'site', titre: 'Un site qui attire', texte: 'Un beau site, de bonnes photos, des textes qui donnent envie.', icon: 'wand-sparkles', color: 'mint', monstre: 'bricou' },
  { id: 'reseaux', titre: 'Les réseaux sociaux', texte: 'TikTok, Instagram, Facebook : se lancer et publier sans y passer ses soirées.', icon: 'megaphone', color: 'pink', monstre: 'etoile' },
  { id: 'clients', titre: 'Trouver et garder des clients', texte: 'Un bon stand, les bons prix, des clients qui reviennent.', icon: 'store', color: 'peach', monstre: 'mochi' },
  { id: 'temps', titre: 'Gagner du temps et de l’argent', texte: 'Trier ses mails, automatiser, comparer : moins de corvées, plus de métier.', icon: 'clock', color: 'sky', monstre: 'chaton' },
  { id: 'monstres', titre: 'Les Minis Monstres', texte: 'Comment on travaille, et comment tirer le meilleur de votre site et de vos outils.', icon: 'heart-handshake', color: 'lilac', monstre: 'mascotte' },
];
const tutos = [
  ...require('./visible'),
  ...require('./site'),
  ...require('./reseaux'),
  ...require('./clients'),
  ...require('./temps'),
  ...require('./monstres'),
];
module.exports = { groupes, tutos };
