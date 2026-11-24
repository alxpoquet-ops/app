// Mini Tuto (décision d'Alex, 24 novembre 2026) : l'atelier des formations des Minis Monstres.
// Plein de petits tutos gratuits, clairs, efficaces et généreux, rangés par thème, puis trois grandes formations
// « Apprendre à avoir ses Minis Monstres » (src/content/formations.js). Le but : que les gens apprennent vraiment.
//
// NOUVEAU PRINCIPE (Alex, 24 novembre 2026, soir) : « Minis Tutos, Minis Prix ». Une vingtaine de tutos COMPLETS, vendus 4,99 €
// chacun (config.tutosOffre), sauf 2 ou 3 entièrement gratuits. Plus de grandes formations : leur contenu devient des tutos.
// Un tuto est découpé en PAGES ; les config.tutosOffre.apercuPages premières (2) sont publiques et doivent déjà apprendre quelque
// chose et donner envie ; la suite n'est lisible qu'après l'achat. Qualité exigée : propre, efficace, clair, rien de bâclé.
//
// FORMAT D'UN TUTO :
//   slug, groupe (id d'un thème ci-dessous), icon (existe dans src/lib/icons.js), monstre (mascotte, bricou, etoile, mochi, gelee,
//   champi, chaton, dino, clin, ravie), nom, resume (une phrase), duree (minutes, nombre), niveau ('Débutant' | 'Intermédiaire'),
//   gratuit (true pour les 2 ou 3 tutos offerts, sinon absent),
//   h1, title (≤ 65 caractères, finit par « | Les Minis Monstres »), description (120 à 160 caractères), lead (2 phrases),
//   pages : [{ titre, body }]  5 à 8 pages, 300 à 600 mots chacune, en Markdown (## sous-titres possibles, listes, **gras**, > encadrés),
//           une page = une étape ou une notion ; la dernière page finit par « ### À faire aujourd'hui » (une liste).
//           Pas à pas précis et vérifiés, exemples concrets, modèles prêts à copier, erreurs à éviter, rien de remplissage.
//   faq : [{ q, a }] (2 à 4), voir : slugs de tutos ou de guides liés (2 à 3).
// Règles (scripts/check.js) : aucun tiret long, pas de phrase de 9 mots ou plus reprise d'une autre page, rien d'inventé
// (pas de chiffre sans source fiable, pas de faux avis), vouvoiement, français simple, phrases courtes. Jamais un mot sur l'IA,
// sauf dans le thème 'bande' (tutos sur l'assistant Claude et la clé API, accord d'Alex).
const groupes = [
  { id: 'visible', titre: 'Être vu sur internet', texte: 'Google, les mots-clés, les avis : pour qu’on vous trouve.', icon: 'search-check', color: 'butter', monstre: 'gelee' },
  { id: 'site', titre: 'Un site qui attire', texte: 'Un beau site, de bonnes photos, des textes qui donnent envie.', icon: 'wand-sparkles', color: 'mint', monstre: 'bricou' },
  { id: 'reseaux', titre: 'Les réseaux sociaux', texte: 'TikTok, Instagram, Facebook : se lancer et publier sans y passer ses soirées.', icon: 'megaphone', color: 'pink', monstre: 'etoile' },
  { id: 'clients', titre: 'Trouver et garder des clients', texte: 'Un bon stand, les bons prix, des clients qui reviennent.', icon: 'store', color: 'peach', monstre: 'mochi' },
  { id: 'temps', titre: 'Gagner du temps et de l’argent', texte: 'Trier ses mails, automatiser, comparer : moins de corvées, plus de métier.', icon: 'clock', color: 'sky', monstre: 'chaton' },
  { id: 'bande', titre: 'Avoir ses propres Minis Monstres', texte: 'Automatiser, se faire aider par un assistant, monter sa petite bande.', icon: 'sparkles', color: 'lilac', monstre: 'mascotte' },
];
const tutos = [
  ...require('./visible'),
  ...require('./site'),
  ...require('./reseaux'),
  ...require('./clients'),
  ...require('./temps'),
  ...require('./bande'),
];
module.exports = { groupes, tutos };
