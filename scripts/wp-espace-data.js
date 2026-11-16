// Données de l'extension WordPress « ALED08 Espace client » : l'abonnement, types de site, options et extras,
// montants, délais, icônes et dessins de Cerise. Tout vient de src/config.js (source unique des prix).
// Appelé par scripts/wp-export.py : node scripts/wp-espace-data.js > data.json
const cfg = require('../src/config');
const { icon } = require('../src/lib/icons');
const { monster } = require('../src/lib/monsters');
const { petit, alexPortrait } = require('../src/lib/bestiaire');

const { site, forfaits, types, annuel, options, fidelite } = cfg;
const boost = cfg.boost || { prix: 5 };
const paiement = cfg.paiement || { acompte: 25 };
const lissage = cfg.lissage || { mois: 24 };
const delais = cfg.delais || { reponse: '72 heures', titan: '72 heures' };
// Quotas de modifications par mois : lus dans config.js (f.quota) ; valeurs de repli si absents.
const QUOTA = { base: 1 };

const ICONS = [
  'house', 'message-circle', 'chart-line', 'qr-code', 'heart', 'gift', 'users', 'receipt', 'check', 'send', 'image-plus', 'download',
  'star', 'globe', 'log-out', 'whatsapp', 'pencil', 'circle-user', 'history', 'file-text', 'arrow-right', 'link', 'hourglass', 'sparkles',
  'package', 'credit-card', 'clipboard-check', 'rocket', 'circle-check', 'clock', 'shield-check', 'mail', 'triangle-alert', 'badge-euro',
  'calendar-check', 'wand-sparkles', 'refresh-cw', 'info', 'user', 'lock', 'key-round', 'user-check', 'pen-tool',
  'eye', 'timer', 'euro', 'shopping-bag', 'megaphone', 'target', 'search', 'map-pin', 'plus', 'x', 'wrench', 'camera', 'phone', 'gauge', 'sun', 'badge-percent', 'tag', 'zap', 'palette', 'layout-template', 'scale', 'lightbulb', 'coins', 'toolbox',
];

process.stdout.write(
  JSON.stringify({
    name: site.name,
    whatsapp: '',
    email: site.email,
    brief: require('../src/content/brief').sections,
    jetonsLia: cfg.jetonsLia,
    outilsLia: require('../src/content/outils-lia').outils,
    forfaits: forfaits.map((f) => ({ id: f.id, name: f.name, month: f.month, quota: f.quota || QUOTA[f.id] || 1, periode: f.periode || 'mois', jetons: f.jetons === undefined ? 1 : f.jetons, partage: !!f.partage, modifs: f.modifs, color: f.color, tagline: f.tagline })),
    types: types.map((t) => ({ id: t.id, name: t.name, label: t.label, price: t.price, delai: t.delai })),
    // quand : 'creation' (payée une fois, à la commande) ou 'mois' (extra de l'abonnement, à ajouter ou retirer)
    options: options.map((o) => ({ id: o.id, name: o.name, month: o.price.month || 0, once: o.price.once || 0, types: o.types || [], quand: o.quand || (o.price.month ? 'mois' : 'creation'), icon: o.icon || 'check', desc: o.desc || '', info: o.info || '' })),
    creation: cfg.creation || { prix: 500, boutique: 200 },
    moisOfferts: annuel.moisOfferts,
    boost: boost.prix,
    // extras à la demande, payés une fois (commandés depuis l'espace client, ajoutés à la prochaine facture)
    aLaDemande: (cfg.aLaDemande || []).map((x) => ({ id: x.id, name: x.name, prix: x.prix, icon: x.icon, desc: x.desc })),
    lissageDurees: lissage.durees || [6, 12],
    acompte: paiement.acompte || 25,
    delais: { reponse: delais.reponse || '72 heures', titan: delais.titan || delais.reponse || '72 heures', urgent: delais.urgent || '24 heures' },
    parrainageMois: fidelite.parrainageMois,
    remiseSecondSite: fidelite.remiseSecondSite || 0,
      // les icônes de l'espace client, plus celles des outils de Cerise (lues dans leur définition)
    icons: Object.fromEntries([...new Set([...ICONS, ...require('../src/content/outils-lia').outils.map((o) => o.icon), ...options.map((o) => o.icon).filter(Boolean), ...(cfg.aLaDemande || []).map((x) => x.icon)])].map((n) => [n, icon(n)])),
    // Cerise (une humeur par dessin, mascotte = bonjour) et Alex, le petit monstre à lunettes
    // Cerise (une humeur par dessin), Alex en portrait, et la petite bande (Bricou fait les modifications)
    monsters: Object.fromEntries([
      ...['mascotte', 'clin', 'ravie', 'pense', 'triste'].map((n) => [n, monster(n)]),
      ['alex', alexPortrait()],
      ...['bricou', 'mochi', 'fantome', 'nuage', 'etoile', 'gelee', 'chaton', 'dino', 'champi'].map((n) => [n, petit(n)]),
    ]),
  })
);
