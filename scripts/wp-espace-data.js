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
  'eye', 'timer', 'euro', 'shopping-bag', 'megaphone', 'target', 'search', 'map-pin', 'plus', 'x', 'wrench', 'camera', 'phone', 'gauge', 'sun', 'badge-percent', 'tag', 'zap', 'palette', 'layout-template', 'scale', 'lightbulb', 'coins', 'toolbox', 'ticket', 'repeat', 'clock', 'search-check', 'eye', 'circle-check',
];

process.stdout.write(
  JSON.stringify({
    name: site.name,
    whatsapp: '',
    email: site.email,
    brief: require('../src/content/brief').sections,
    jetonsLia: cfg.jetonsLia,
    // énergie et outils en pause (novembre 2026) : l'extension cache l'onglet Outils et ne compte plus d'énergie
    enService: cfg.enService || { outils: true, energie: true },
    limites: cfg.limites || { bricouMois: 8, bulleJour: 40 },
    outilsLia: require('../src/content/outils-lia').outils,
    forfaits: forfaits.map((f) => ({ id: f.id, name: f.name, month: f.month, quota: f.quota || QUOTA[f.id] || 1, periode: f.periode || 'mois', jetons: f.jetons === undefined ? 1 : f.jetons, partage: !!f.partage, modifs: f.modifs, color: f.color, tagline: f.tagline, illimite: !!f.illimite, priorite: !!f.priorite, delai: f.delai || '', pageSeoSemaine: !!f.pageSeoSemaine, main: f.main || [] })),
    types: types.map((t) => ({ id: t.id, name: t.name, label: t.label, price: t.price, delai: t.delai })),
    // quand : 'creation' (payée une fois, à la commande) ou 'mois' (extra de l'abonnement, à ajouter ou retirer)
    // retire : option ou extra qui n'est plus proposé (offre du 17 novembre 2026), gardé pour les clients qui l'ont déjà
    options: options.map((o) => ({ id: o.id, name: o.name, month: o.price.month || 0, once: o.price.once || 0, types: o.types || [], quand: o.quand || (o.price.month ? 'mois' : 'creation'), icon: o.icon || 'check', desc: o.desc || '', info: o.info || '', retire: !!o.retire })),
    // offre événement : remise en % sur la création, avec un code donné sur une foire, un marché ou un salon
    evenement: cfg.evenement || { remise: 20 },
    // création seule : le client a son hébergement, il reçoit le code de son site (pas de formule, pas d'hébergement chez nous)
    creationSeule: cfg.creationSeule ? { id: cfg.creationSeule.id, name: cfg.creationSeule.name, month: 0, quota: 0, periode: 'mois', jetons: 0, illimite: false, delai: '', main: cfg.creationSeule.main, seule: true } : null,
    creation: cfg.creation || { prix: 500, boutique: 200 },
    moisOfferts: annuel.moisOfferts,
    boost: boost.prix,
    // extras à la demande, payés une fois (commandés depuis l'espace client, ajoutés à la prochaine facture)
    aLaDemande: (cfg.aLaDemande || []).map((x) => ({ id: x.id, name: x.name, prix: x.prix, icon: x.icon, desc: x.desc, retire: !!x.retire })),
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
