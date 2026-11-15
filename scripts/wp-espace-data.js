// Données de l'extension WordPress « ALED08 Espace client » : forfaits, types de site, options,
// montants, délais, icônes et monstres. Tout vient de src/config.js (source unique des prix).
// Appelé par scripts/wp-export.py : node scripts/wp-espace-data.js > data.json
const cfg = require('../src/config');
const { icon } = require('../src/lib/icons');
const { monster } = require('../src/lib/monsters');

const { site, forfaits, types, annuel, options, fidelite } = cfg;
const boost = cfg.boost || { prix: 1 };
const paiement = cfg.paiement || { acompte: 25 };
const lissage = cfg.lissage || { mois: 24 };
const delais = cfg.delais || { reponse: '72 heures', titan: '24 heures' };
// Quotas de modifications par mois : lus dans config.js (f.quota) ; valeurs de repli si absents.
const QUOTA = { chico: 1, power: 2, titan: 2 };

const ICONS = [
  'house', 'message-circle', 'chart-line', 'qr-code', 'heart', 'gift', 'users', 'receipt', 'check', 'send', 'image-plus', 'download',
  'star', 'globe', 'log-out', 'whatsapp', 'pencil', 'circle-user', 'history', 'file-text', 'arrow-right', 'link', 'hourglass', 'sparkles',
  'package', 'credit-card', 'clipboard-check', 'rocket', 'circle-check', 'clock', 'shield-check', 'mail', 'triangle-alert', 'badge-euro',
  'calendar-check', 'wand-sparkles', 'refresh-cw', 'info', 'user', 'lock', 'key-round',
  'eye', 'timer', 'euro', 'shopping-bag', 'megaphone', 'target', 'search', 'map-pin', 'plus', 'x', 'wrench', 'camera', 'phone',
];

process.stdout.write(
  JSON.stringify({
    name: site.name,
    whatsapp: '',
    email: site.email,
    forfaits: forfaits.map((f) => ({ id: f.id, name: f.name, month: f.month, quota: f.quota || QUOTA[f.id] || 1, jetons: f.jetons === undefined ? 1 : f.jetons, partage: !!f.partage, modifs: f.modifs, color: f.color, tagline: f.tagline })),
    types: types.map((t) => ({ id: t.id, name: t.name, label: t.label, price: t.price, delai: t.delai })),
    options: options.map((o) => ({ id: o.id, name: o.name, month: o.price.month || 0, once: o.price.once || 0, types: o.types || [] })),
    moisOfferts: annuel.moisOfferts,
    boost: boost.prix,
    lissageDurees: lissage.durees || [6, 12],
    acompte: paiement.acompte || 25,
    delais: { reponse: delais.reponse || '72 heures', titan: delais.titan || '24 heures' },
    parrainageMois: fidelite.parrainageMois,
    remiseSecondSite: fidelite.remiseSecondSite || 0,
    icons: Object.fromEntries(ICONS.map((n) => [n, icon(n)])),
    monsters: Object.fromEntries(['mascotte', 'chico', 'power', 'titan'].map((n) => [n, monster(n)])),
  })
);
