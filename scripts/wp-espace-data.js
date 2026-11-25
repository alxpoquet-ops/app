// Données de l'extension WordPress « ALED08 Espace client » : l'abonnement, types de site, options et extras,
// montants, délais, icônes et dessins de Cerise. Tout vient de src/config.js (source unique des prix).
// Appelé par scripts/wp-export.py : node scripts/wp-espace-data.js > data.json
//
// Mes Tutos (24 novembre 2026, fin de soirée) : de petits tutos GRATUITS et publics (/mini-tuto/<slug>/). L'espace client n'en
// garde que la liste {slug, nom, espace} pour ses liens d'aide « ? » (le champ espace d'un tuto = l'onglet concerné), et les
// extras « À la une » (config.tutosOffre.aLaUne). Plus rien n'est vendu : ni tuto, ni formation.
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

// Mes Tutos : le nom et l'onglet de l'espace client de chaque tuto (src/content/tutos/index.js). Rien du contenu.
const T = require('../src/content/tutos');
const tutosOffre = cfg.tutosOffre || {};
const ONGLETS_ESPACE = ['accueil', 'site', 'commande', 'demandes', 'extras', 'vacances', 'compte'];
function tutosAide(list) {
  return (list || []).filter((t) => t && /^[a-z0-9-]+$/.test(String(t.slug || ''))).map((t) => ({
    slug: t.slug, nom: String(t.nom || t.h1 || t.slug), espace: ONGLETS_ESPACE.includes(t.espace) ? t.espace : '',
  }));
}

const ICONS = [
  'trophy', 'smartphone', 'monitor', 'navigation', 'list-checks', 'receipt', 'circle-user', 'credit-card', 'clock', 'send', // Statistiques et sous-menus (25 novembre 2026)
  'key-round', 'shopping-bag', 'image-plus', 'plus', 'pencil', 'info', 'clock', 'sparkles', 'circle-check',
  'megaphone', 'search', 'lock', 'zap', 'scale',
  'house', 'message-circle', 'chart-line', 'qr-code', 'heart', 'gift', 'users', 'receipt', 'check', 'send', 'image-plus', 'download',
  'star', 'globe', 'log-out', 'whatsapp', 'pencil', 'circle-user', 'history', 'file-text', 'arrow-right', 'link', 'hourglass', 'sparkles',
  'package', 'credit-card', 'clipboard-check', 'rocket', 'circle-check', 'clock', 'shield-check', 'mail', 'triangle-alert', 'badge-euro',
  'calendar-check', 'wand-sparkles', 'refresh-cw', 'info', 'user', 'lock', 'key-round', 'user-check', 'pen-tool',
  'eye', 'timer', 'euro', 'shopping-bag', 'megaphone', 'target', 'search', 'map-pin', 'plus', 'x', 'wrench', 'camera', 'phone', 'gauge', 'sun', 'badge-percent', 'tag', 'zap', 'palette', 'layout-template', 'scale', 'lightbulb', 'coins', 'toolbox', 'ticket', 'repeat', 'clock', 'search-check', 'eye', 'circle-check', 'play', 'store', 'gift', 'rotate-ccw', 'party-popper',
  'book-open', 'circle-help', 'star', 'shopping-bag', 'languages',
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
    // la maison et ses ateliers (24 novembre 2026) : les cartes de l'accueil de l'espace client, et les outils vendus par abonnement
    // (outil par outil ou « toute la bande », essai gratuit, usage compris avec une limite par mois). Lus par includes/abonnements-outils.php.
    ateliers: (cfg.ateliers || []).map((a) => ({ id: a.id, label: a.label, path: a.path, monstre: a.monstre, color: a.color, chef: a.chef || '', court: a.court || '', cache: !!a.cache })),
    outilsOffre: cfg.outilsOffre ? {
      actif: cfg.outilsOffre.actif !== false,
      essaiJours: cfg.outilsOffre.essaiJours || 14,
      bande: cfg.outilsOffre.bande,
      outils: cfg.outilsOffre.outils.map((o) => ({ id: o.id, nom: o.nom, monstre: o.monstre, chef: o.chef || '', color: o.color || 'lilac', prix: o.prix, statut: o.statut === 'pret' ? 'pret' : 'bientot', limite: o.limite || 0, unite: o.unite || '', inclusSite: !!o.inclusSite, tag: o.tag || '', court: o.court || '', briques: o.briques || [] })),
    } : null,
    // Mes Tutos (gratuits) : les liens d'aide de l'espace (includes/aide.php) et les extras « À la une » de l'onglet Extras
    tutos: tutosAide(T.tutos),
    tutosALaUne: (tutosOffre.aLaUne || []).filter((s) => /^[a-z0-9-]+$/.test(String(s))),
    limites: cfg.limites || { bricouMois: 8, bulleJour: 40 },
    outilsLia: require('../src/content/outils-lia').outils,
    forfaits: forfaits.map((f) => ({ id: f.id, name: f.name, month: f.month, quota: f.quota || QUOTA[f.id] || 1, periode: f.periode || 'mois', jetons: f.jetons === undefined ? 1 : f.jetons, partage: !!f.partage, modifs: f.modifs, color: f.color, tagline: f.tagline, illimite: !!f.illimite, priorite: !!f.priorite, delai: f.delai || '', pageSeoSemaine: !!f.pageSeoSemaine, delaiMoyen: !!f.delaiMoyen, delaiTexte: f.delaiTexte || '', demandesMax: f.demandesMax || 1, pageSeo: f.pageSeo || (f.pageSeoSemaine ? 'semaine' : ''), optimisation: !!f.optimisation, main: f.main || [] })),
    forfaitsAnciens: (cfg.forfaitsAnciens || []).map((f) => ({ id: f.id, name: f.name, month: f.month, quota: f.quota || QUOTA[f.id] || 1, periode: f.periode || 'mois', jetons: f.jetons === undefined ? 1 : f.jetons, partage: !!f.partage, modifs: f.modifs, color: f.color, tagline: f.tagline, illimite: !!f.illimite, priorite: !!f.priorite, delai: f.delai || '', pageSeoSemaine: !!f.pageSeoSemaine, delaiMoyen: !!f.delaiMoyen, delaiTexte: f.delaiTexte || '', demandesMax: f.demandesMax || 1, pageSeo: f.pageSeo || (f.pageSeoSemaine ? 'semaine' : ''), optimisation: !!f.optimisation, main: f.main || [] })),
    extrasGroupes: cfg.extrasGroupes || [],
    optimisation: cfg.optimisation || null,
    // 21 novembre 2026 : une seule offre (Site Essentiel 400 €, option e-commerce + 200 € = type 'boutique'). Le Site Visibilité
    // ('vitrine') est gardé pour les anciennes commandes, avec retire: true : l'extension ne doit plus le proposer.
    types: types.map((t) => ({ id: t.id, name: t.name, label: t.label, price: t.price, delai: t.delai, but: t.but || '', inclus: t.inclus || [], retire: !!t.retire })),
    // l'option e-commerce, cochée sous le Site Essentiel (son prix : creation.ecommerce)
    ecommerce: cfg.offreSite ? { name: cfg.offreSite.option.name, prix: cfg.offreSite.option.prix, inclus: cfg.offreSite.option.inclus } : null,
    // quand : 'creation' (payée une fois, à la commande) ou 'mois' (extra de l'abonnement, à ajouter ou retirer)
    // retire : option ou extra qui n'est plus proposé (offre du 17 novembre 2026), gardé pour les clients qui l'ont déjà
    options: options.map((o) => ({ id: o.id, name: o.name, month: o.price.month || 0, once: o.price.once || 0, types: o.types || [], quand: o.quand || (o.price.month ? 'mois' : 'creation'), icon: o.icon || 'check', desc: o.desc || '', info: o.info || '', retire: !!o.retire, group: o.group || '', court: o.court || '', badge: o.badge || '' })),
    // offre événement : remise en % sur la création, avec un code donné sur une foire, un marché ou un salon
    evenement: cfg.evenement || { remise: 20 },
    // la prospection par e-mail (includes/prospection.php, 25 novembre 2026) : -10 % sur la création seulement, avec un code
    // personnel valable 30 jours après l'envoi, une seule relance au moins 7 jours après. Pour changer : config.prospection.
    prospection: Object.assign({ remise: 10, jours: 30, relanceJours: 7 }, cfg.prospection || {}),
    // l'identité de l'expéditeur, écrite au pied de chaque mail de prospection (jamais en dur dans l'extension)
    identite: { nom: site.name, proprietaire: site.owner, statut: (site.legal || {}).status || '', siren: (site.legal || {}).siren || '', codePostal: (site.address || {}).postalCode || '', ville: (site.address || {}).city || '' },
    // nos pages « Votre métier » (src/content/metiers.js) : les métiers que le Repéreur cherche d'abord (+10 à la note)
    metiers: require('../src/content/metiers').metiers.map((m) => ({ slug: m.slug, nom: m.nom, qui: m.qui || '' })),
    // création seule : le client a son hébergement, il reçoit le code de son site (pas de formule, pas d'hébergement chez nous)
    creationSeule: cfg.creationSeule ? { id: cfg.creationSeule.id, name: cfg.creationSeule.name, month: 0, quota: 0, periode: 'mois', jetons: 0, illimite: false, delai: '', main: cfg.creationSeule.main, seule: true } : null,
    creation: cfg.creation || { prix: 549, ecommerce: 200, boutique: 200 },
    // l'offre de lancement (25 novembre 2026) : creation.prix est payé jusqu'à lancement.jusquau, puis creation.prixNormal
    lancement: cfg.lancement || null,
    // le nom de domaine fourni par nous : supplément par mois sur le forfait (0 : compris)
    domainePrix: forfaits[0].domaine || 0,
    moisOfferts: annuel.moisOfferts,
    boost: boost.prix,
    // extras à la demande, payés une fois (commandés depuis l'espace client, ajoutés à la prochaine facture)
    aLaDemande: (cfg.aLaDemande || []).map((x) => ({ id: x.id, name: x.name, prix: x.prix, icon: x.icon, desc: x.desc, court: x.court || '', groupe: x.groupe || '', packs: x.packs || [], unite: x.unite || '', types: x.types || [], badge: x.badge || '', retire: !!x.retire, devis: !!x.devis, inclus: x.inclus || [] })),
    lissageDurees: lissage.durees || [6, 12],
    fractionne: cfg.fractionne || { fois: '3 ou 4', organismes: 'Alma ou Klarna' },
    acompte: paiement.acompte || 25,
    delais: { reponse: delais.reponse || '72 heures', titan: delais.titan || delais.reponse || '72 heures', urgent: delais.urgent || '24 heures' },
    parrainageMois: fidelite.parrainageMois,
    remiseSecondSite: fidelite.remiseSecondSite || 0,
      // les icônes de l'espace client, plus celles des outils de Cerise (lues dans leur définition)
    icons: Object.fromEntries([...new Set([...ICONS, ...require('../src/content/brief').sections.map((s) => s.icon), ...require('../src/content/outils-lia').outils.map((o) => o.icon), ...options.map((o) => o.icon).filter(Boolean), ...(cfg.aLaDemande || []).map((x) => x.icon), ...(cfg.extrasGroupes || []).map((g) => g.icon)])].map((n) => [n, icon(n)])),
    // Cerise (une humeur par dessin, mascotte = bonjour) et Alex, le petit monstre à lunettes
    // Cerise (une humeur par dessin), Alex en portrait, et la petite bande (Bricou fait les modifications)
    monsters: Object.fromEntries([
      ...['mascotte', 'clin', 'ravie', 'pense', 'triste'].map((n) => [n, monster(n)]),
      ['alex', alexPortrait()],
      ...['bricou', 'mochi', 'fantome', 'nuage', 'etoile', 'gelee', 'chaton', 'dino', 'champi', 'maxi', 'ruban'].map((n) => [n, petit(n)]),
    ]),
  })
);
