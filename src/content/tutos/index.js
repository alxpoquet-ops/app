// Mini Tuto (décision d'Alex, 24 novembre 2026, fin de soirée) : l'aide des Minis Monstres, en petits tutos GRATUITS.
// Une bonne vingtaine, tous sur ce qui se passe chez nous pour un site internet : « une sorte de FAQ, mais en mini tuto ».
// Rangés par thème ; en haut, « À la une » : les extras à mettre en avant (config.tutosOffre.aLaUne), pour donner envie
// de les prendre depuis l'espace client, sans agresser.
//
// FORMAT D'UN TUTO :
//   slug        : adresse /mini-tuto/<slug>/ (minuscules, tirets, unique)
//   groupe      : l'id d'un thème ci-dessous
//   icon        : une icône qui existe dans src/lib/icons.js
//   monstre     : mascotte, bricou, etoile, mochi, gelee, champi, chaton, dino, clin, ravie
//   nom         : titre court (carte), resume : une phrase (carte), duree : minutes de lecture (nombre)
//   h1, title (≤ 65 caractères, finit par « | Les Minis Monstres »), description (120 à 160 caractères), lead (1 à 2 phrases)
//   body        : le tuto en Markdown, court et clair (250 à 600 mots) : la réponse tout de suite, puis les étapes numérotées
//                 (où cliquer, quoi remplir, ce qui se passe ensuite), un encadré « > Bon à savoir » si utile.
//   faq         : [{ q, a }] facultatif (1 à 3), voir : 2 à 3 slugs de tutos liés
//   espace      : facultatif, l'onglet de l'espace client concerné ('accueil', 'commande', 'demandes', 'extras', 'vacances', 'compte')
//                 pour le lien « Ouvrir mon espace client » et pour l'aide dans l'espace.
// Règles : TOUT doit être exact par rapport au site et au code (src/config.js, src/wordpress/aled08-espace/) : rien d'inventé,
// aucun bouton ou délai qui n'existe pas. Vouvoiement, « nous/on », Alex nommé, français simple, phrases courtes, aucun tiret long,
// pas de phrase de 9 mots ou plus reprise d'une autre page, jamais un mot sur l'IA (ce sont nos outils et nos petits monstres).
const groupes = [
  { id: 'creer', titre: 'Créer mon site avec vous', texte: 'Comment ça marche, de la commande à la mise en ligne.', icon: 'wand-sparkles', color: 'mint', monstre: 'bricou' },
  { id: 'espace', titre: 'Mon espace client', texte: 'Se connecter, modifier son site, suivre ses demandes.', icon: 'circle-user', color: 'sky', monstre: 'mascotte' },
  { id: 'extras', titre: 'Les extras', texte: 'Aller plus loin quand vous voulez : Google, boutique, anglais.', icon: 'sparkles', color: 'butter', monstre: 'etoile' },
  { id: 'pourquoi', titre: 'Pourquoi les Minis Monstres', texte: 'Qui nous sommes, comment on travaille, et pourquoi c’est moins cher.', icon: 'heart-handshake', color: 'lilac', monstre: 'mochi' },
];
const tutos = [...require('./creer'), ...require('./espace'), ...require('./extras'), ...require('./pourquoi')];
module.exports = { groupes, tutos };
