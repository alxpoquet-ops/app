// Données de l'extension WordPress « ALED08 Espace client » (forfaits, icônes, monstres).
// Appelé par scripts/wp-export.py : node scripts/wp-espace-data.js > data.json
const { site, forfaits, annuel, options, fidelite } = require('../src/config');
const { icon } = require('../src/lib/icons');
const { monster } = require('../src/lib/monsters');

const ICONS = ['house', 'message-circle', 'chart-line', 'qr-code', 'heart', 'gift', 'users', 'receipt', 'check', 'send', 'image-plus', 'download', 'star', 'globe', 'log-out', 'whatsapp', 'pencil', 'circle-user', 'history', 'file-text', 'arrow-right', 'link', 'hourglass', 'sparkles'];
const QUOTA = { chico: 1, power: 4 }; // modifications par mois (Power : une par semaine)
const mail = options.find((o) => o.id === 'mail');

process.stdout.write(
  JSON.stringify({
    name: site.name,
    whatsapp: site.whatsapp,
    forfaits: forfaits.map((f) => ({ id: f.id, name: f.name, month: f.month, quota: QUOTA[f.id] || 1, modifs: f.modifs, color: f.color, tagline: f.tagline })),
    moisOfferts: annuel.moisOfferts,
    mail: { name: mail.name, month: mail.price.month },
    parrainageMois: fidelite.parrainageMois,
    icons: Object.fromEntries(ICONS.map((n) => [n, icon(n)])),
    monsters: Object.fromEntries(['mascotte', 'chico', 'power'].map((n) => [n, monster(n)])),
  })
);
