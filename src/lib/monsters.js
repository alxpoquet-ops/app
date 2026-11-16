// Les mascottes et le logo d'Alex & Lia. Dessins originaux en SVG, faits à la main.
//   Lia  : un joli petit monstre fille, rose et tout rond (style chibi), avec un nœud, de grands yeux,
//          une queue en cœur, et un bonnet à Noël. C'est l'IA.
//   Alex : un petit monstre menthe à lunettes, avec sa clé plate. C'est l'humain qui vérifie tout.
//
//   monster('mascotte' | 'bonjour' | 'coucou' | 'clin' | 'ravie' | 'pense' | 'triste' | 'alex', { size, cls, title })
//
// Les classes m-bob, m-eyes, m-wave, m-wave-r et m-shadow sont animées dans style.css.
// Le groupe m-look (les pupilles) est déplacé par main.js : les yeux suivent le pointeur du visiteur.

const INK = '#2E2A47';
const LIA = { body: '#FFA3C8', light: '#FFE0EC', deep: '#B93474', foot: '#FF86B6', noeud: '#FF4F9A', iris: '#8C5BE0', irisBas: '#FF7DB3' };
const ALEX = { body: '#9FE8CB', light: '#DDF9EE', deep: '#23805E', foot: '#7FDDB8', iris: '#2F7FD0', irisBas: '#7EDDB5' };
const OR = '#FFD45E';
const OR_D = '#C98A00';

const trait = (c, w = 3.2) => `stroke="${c.deep}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const ombre = (rx) => `<ellipse class="m-shadow" cx="80" cy="152" rx="${rx}" ry="5.5" fill="${INK}" opacity=".09"/>`;
const joues = (x1, x2, y, c = '#FF7FAE', o = 0.5) => `<ellipse cx="${x1}" cy="${y}" rx="8.6" ry="4.8" fill="${c}" opacity="${o}"/><ellipse cx="${x2}" cy="${y}" rx="8.6" ry="4.8" fill="${c}" opacity="${o}"/>`;

// ---------------------------------------------------------------- les yeux
// Un œil ouvert : le blanc (fixe), puis la pupille dans le groupe m-look (mobile). dx, dy : regard de départ.
const blanc = (x, y, c, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${c.deep}" stroke-width="2.8"/>`;
const pupille = (x, y, c, r, { dx = 0, dy = 0 } = {}) => {
  const px = x + 0.5 + dx;
  const py = y + 2 + dy;
  return `<circle cx="${px}" cy="${py}" r="${r}" fill="${c.iris}"/>
<ellipse cx="${px}" cy="${py + r * 0.45}" rx="${r * 0.66}" ry="${r * 0.44}" fill="${c.irisBas}" opacity=".85"/>
<circle cx="${px}" cy="${py}" r="${r * 0.52}" fill="${INK}"/>
<circle cx="${px + r * 0.42}" cy="${py - r * 0.46}" r="${r * 0.34}" fill="#fff"/>
<circle cx="${px - r * 0.36}" cy="${py + r * 0.42}" r="${r * 0.16}" fill="#fff"/>`;
};
// Paupière épaisse et trois cils vers l'extérieur (sx = 1 : œil gauche, -1 : œil droit)
const paupiere = (x, y, rx, ry) => `<path d="M${x - rx} ${y - 3}C${x - rx + 2} ${y - ry - 2} ${x + rx - 2} ${y - ry - 2} ${x + rx} ${y - 3}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
const cils = (x, y, sx) => [[-13.5, -7, -19, -10.5], [-10.5, -12.2, -15, -18], [-5, -15.6, -7, -21.6]]
  .map(([a, b, cx, cy]) => `<path d="M${x + sx * a} ${y + b}L${x + sx * cx} ${y + cy}" stroke="${INK}" stroke-width="2.700" stroke-linecap="round"/>`).join('');
// Œil fermé qui sourit, avec ses cils
const ferme = (x, y, sx, avecCils = true) => `<path d="M${x - 11} ${y + 3}C${x - 6.500} ${y - 7} ${x + 6.500} ${y - 7} ${x + 11} ${y + 3}" fill="none" stroke="${INK}" stroke-width="3.600" stroke-linecap="round"/>${avecCils ? `<path d="M${x - sx * 11} ${y + 3}l${-sx * 5} ${-1.500}M${x - sx * 8.500} ${y - 2.500}l${-sx * 4.500} ${-3.500}" stroke="${INK}" stroke-width="2.400" stroke-linecap="round"/>` : ''}`;

// Les deux yeux de Lia : grands, brillants, posés bas sur le visage (c'est ce qui la rend « chibi »).
// g, d : 'o' ouvert, 'f' fermé. regard : décalage des pupilles.
function yeuxLia({ g = 'o', d = 'o', regard = {}, y = 97, sansCils = false } = {}) {
  const X1 = 58;
  const X2 = 102;
  const fixe = (x, etat, sx) => (etat === 'o' ? (sansCils ? '' : cils(x, y, sx)) + blanc(x, y, LIA, 14, 15.5) : ferme(x, y + 2, sx));
  const mobile = (x, etat) => (etat === 'o' ? pupille(x, y, LIA, 10, regard) : '');
  const dessus = (x, etat) => (etat === 'o' ? paupiere(x, y, 14, 15.5) : '');
  return `<g class="m-eyes">${fixe(X1, g, 1)}${fixe(X2, d, -1)}<g class="m-look">${mobile(X1, g)}${mobile(X2, d)}</g>${dessus(X1, g)}${dessus(X2, d)}</g>`;
}

// ---------------------------------------------------------------- Lia
// Une petite boule toute ronde, comme un mochi : la tête et le corps ne font qu'un, de grands yeux,
// de petits bras, deux petits pieds, une queue en cœur. Un nœud sur la tête, et un bonnet à Noël.
const bouches = {
  // sourire ouvert, petite langue et une canine
  sourire: `<path d="M72 111C74.500 120.500 85.500 120.500 88 111Z" fill="#7A1F45" stroke="${INK}" stroke-width="2.600" stroke-linejoin="round"/><path d="M75.500 116.500C78 118.500 82 118.500 84.500 116.500" fill="none" stroke="#FF8FA8" stroke-width="2.800" stroke-linecap="round"/><path d="M75 111.600l2 4 2.200-4Z" fill="#fff" stroke="${INK}" stroke-width="1.300" stroke-linejoin="round"/>`,
  // petite bouche de chat
  chat: `<path d="M71 112q4.500 5 9 0q4.500 5 9 0" fill="none" stroke="${INK}" stroke-width="3.200" stroke-linecap="round" stroke-linejoin="round"/>`,
  // sourire fermé, une canine qui dépasse
  malin: `<path d="M72 112q8 7 16 0" fill="none" stroke="${INK}" stroke-width="3.400" stroke-linecap="round"/><path d="M75.500 114.600l2 4.400 2.400-3.600Z" fill="#fff" stroke="${INK}" stroke-width="1.400" stroke-linejoin="round"/>`,
  // très contente
  rire: `<path d="M69 109C72.500 124 87.500 124 91 109Z" fill="#7A1F45" stroke="${INK}" stroke-width="2.600" stroke-linejoin="round"/><path d="M74.500 118.500C77.500 121 82.500 121 85.500 118.500" fill="none" stroke="#FF8FA8" stroke-width="3.400" stroke-linecap="round"/><path d="M72.500 109.600l2.200 4.600 2.400-4.600ZM83 109.600l2.200 4.600 2.400-4.600Z" fill="#fff" stroke="${INK}" stroke-width="1.300" stroke-linejoin="round"/>`,
  // elle réfléchit : petite bouche ronde
  rond: `<ellipse cx="82" cy="115" rx="3.800" ry="3.400" fill="#7A1F45" stroke="${INK}" stroke-width="2.400"/>`,
  // triste
  moue: `<path d="M72 119q8-6.500 16 0" fill="none" stroke="${INK}" stroke-width="3.400" stroke-linecap="round"/>`,
};

// Les petits bras de Lia. Le bras qui salue porte la classe m-wave.
const bras = {
  gSalut: `<path class="m-wave" d="M30 106c-11-4-16-14-11-18 5-3 11 3 15 10" fill="${LIA.body}" ${trait(LIA)}/>`,
  gBas: `<path d="M29 117c-10 2-15-6-11-11 4-3 9 0 13 4" fill="${LIA.body}" ${trait(LIA)}/>`,
  dSalut: `<path class="m-wave m-wave-r" d="M130 106c11-4 16-14 11-18-5-3-11 3-15 10" fill="${LIA.body}" ${trait(LIA)}/>`,
  dBas: `<path d="M131 117c10 2 15-6 11-11-4-3-9 0-13 4" fill="${LIA.body}" ${trait(LIA)}/>`,
  // elle tient une petite page de site : c'est elle qui les fabrique
  dPage: `<g transform="rotate(-8 122 122)"><rect x="105" y="108" width="36" height="28" rx="6" fill="#fff" stroke="${LIA.deep}" stroke-width="3"/><rect x="110" y="114" width="15" height="4.500" rx="2.200" fill="#7EDDB5"/><rect x="110" y="122" width="26" height="3.600" rx="1.800" fill="#D9D4EA"/><rect x="110" y="129" width="19" height="3.600" rx="1.800" fill="#D9D4EA"/></g><path d="M128 112c6-3 10 2 7 7" fill="${LIA.body}" ${trait(LIA)}/>`,
};

const etoile = (x, y, r, c = OR) => `<path d="M${x} ${y - r}c${r * 0.18} ${r * 0.62} ${r * 0.38} ${r * 0.82} ${r} ${r}c${-r * 0.62} ${r * 0.18} ${-r * 0.82} ${r * 0.38} ${-r} ${r}c${-r * 0.18} ${-r * 0.62} ${-r * 0.38} ${-r * 0.82} ${-r} ${-r}c${r * 0.62} ${-r * 0.18} ${r * 0.82} ${-r * 0.38} ${r} ${-r}Z" fill="${c}"/>`;

const HUMEURS = {
  bonjour: { yeux: {}, bouche: 'sourire', bras: ['gSalut', 'dPage'] },
  // la même, sans la page à la main : pour les petites tailles (la bulle en bas de l'écran)
  coucou: { yeux: {}, bouche: 'chat', bras: ['gSalut', 'dBas'] },
  clin: { yeux: { d: 'f' }, bouche: 'malin', bras: ['gSalut', 'dBas'] },
  ravie: { yeux: { g: 'f', d: 'f' }, bouche: 'rire', bras: ['gSalut', 'dSalut'], plus: etoile(16, 70, 7) + etoile(146, 74, 5.500, '#FF8FB5') + etoile(140, 56, 4) },
  pense: { yeux: { regard: { dx: 3, dy: -4.500 } }, bouche: 'rond', bras: ['gBas', 'dBas'], plus: `<circle cx="136" cy="74" r="3" fill="${LIA.light}" stroke="${LIA.deep}" stroke-width="1.800"/><circle cx="146" cy="62" r="4.400" fill="${LIA.light}" stroke="${LIA.deep}" stroke-width="1.800"/>` },
  triste: {
    yeux: { regard: { dx: -1, dy: 3 }, y: 99, sansCils: true }, bouche: 'moue', bras: ['gBas', 'dBas'],
    plus: `<path d="M42 77l15-5M118 77l-15-5" stroke="${INK}" stroke-width="3.200" stroke-linecap="round"/>`,
    apres: `<path d="M117 110c3 5 3 9 0 10-3 0-3-5 0-10Z" fill="#8FD3FF" stroke="#3F78B8" stroke-width="1.600"/>`,
  },
};

// Le bonnet de Noël : caché par défaut ; il s'affiche quand la page porte la classe « noel »
// (le petit script en tête de page la pose du 15 novembre au 6 janvier). Le nœud et les cornes se cachent alors dessous.
const BONNET = `<g class="m-noel" display="none" transform="rotate(-6 80 54)">
<path d="M38 52C38 30 56 12 82 9C100 7 118 13 127 28L119 34C114 25 107 21 99 22C108 30 116 40 122 52Z" fill="#EF4B5F" stroke="#A3263A" stroke-width="3" stroke-linejoin="round"/>
<path d="M99 22C108 30 116 40 122 52H111C107 41 102 31 95 24Z" fill="#B72C42" opacity=".35"/>
<path d="M50 40C56 26 68 17 82 14" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round" opacity=".45"/>
<circle cx="125" cy="33" r="8.500" fill="#fff" stroke="#D2CBE6" stroke-width="2.600"/><circle cx="122" cy="30" r="2.400" fill="#EDE8F7"/>
<rect x="32" y="46" width="96" height="17" rx="8.500" fill="#fff" stroke="#D2CBE6" stroke-width="2.600"/>
<circle cx="46" cy="54" r="2.200" fill="#EDE8F7"/><circle cx="62" cy="51" r="1.800" fill="#EDE8F7"/><circle cx="78" cy="56" r="2.200" fill="#EDE8F7"/><circle cx="96" cy="52" r="1.800" fill="#EDE8F7"/><circle cx="112" cy="55" r="2.200" fill="#EDE8F7"/>
</g>`;

function lia(humeur) {
  const h = HUMEURS[humeur] || HUMEURS.bonjour;
  const c = LIA;
  return `${ombre(42)}
<g class="m-bob">
<path d="M32 132c-9 3-16-1-18-8" fill="none" stroke="${c.deep}" stroke-width="8.400" stroke-linecap="round"/><path d="M32 132c-9 3-16-1-18-8" fill="none" stroke="${c.foot}" stroke-width="3.600" stroke-linecap="round"/>
<path d="M13.500 127.500c-6.500-3.500-9-9-5.500-12 2.600-2.200 5.800-.800 6.600 2 2.200-2.200 5.800-2 7 1 1.600 4-2.600 8-8.100 9Z" fill="${c.noeud}" stroke="${c.deep}" stroke-width="2.400" stroke-linejoin="round"/>
<ellipse cx="63" cy="145" rx="11" ry="6" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/><ellipse cx="97" cy="145" rx="11" ry="6" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/>
<g class="m-cornes"><path d="M53 61c-7-6-8-15-2-18 4 3 7 8 8 14Z" fill="${OR}" stroke="${OR_D}" stroke-width="2.600" stroke-linejoin="round"/><path d="M107 61c7-6 8-15 2-18-4 3-7 8-8 14Z" fill="${OR}" stroke="${OR_D}" stroke-width="2.600" stroke-linejoin="round"/></g>
<path d="M80 50c35 0 58 21 58 50 0 28-23 45-58 45S22 128 22 100c0-29 23-50 58-50Z" fill="${c.body}" ${trait(c)}/>
<ellipse cx="80" cy="129" rx="27" ry="12.500" fill="${c.light}"/>
<path d="M42 76c6-11 16-17 27-18" fill="none" stroke="#fff" stroke-width="4.400" stroke-linecap="round" opacity=".55"/>
<g class="m-noeud" transform="translate(106 54) rotate(-16) scale(.86) translate(-106 -30)"><path d="M106 30c-8-11-21-11-21-1s13 11 21 1Z" fill="${c.noeud}" ${trait(c, 2.800)}/><path d="M106 30c8-11 21-11 21-1s-13 11-21 1Z" fill="${c.noeud}" ${trait(c, 2.800)}/><path d="M91 26c3-1 6 0 8 2M121 26c-3-1-6 0-8 2" fill="none" stroke="#fff" stroke-width="1.800" stroke-linecap="round" opacity=".6"/><circle cx="106" cy="30" r="5.400" fill="${OR}" stroke="${c.deep}" stroke-width="2.400"/></g>
${h.plus || ''}
${bras[h.bras[0]]}
${yeuxLia(h.yeux)}
${joues(40, 120, 116, '#FF7FAE', 0.55)}
${bouches[h.bouche]}
${h.apres || ''}
${bras[h.bras[1]]}
${BONNET}
</g>`;
}

// ---------------------------------------------------------------- Alex
// Petit monstre menthe, deux petites cornes, une mèche, de grosses lunettes rondes et une clé plate.
function alex() {
  const c = ALEX;
  const oeil = (x) => `${blanc(x, 92, c, 8.5, 9.5)}`;
  return `${ombre(32)}
<g class="m-bob">
<ellipse cx="66" cy="143" rx="11.500" ry="6.800" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/><ellipse cx="94" cy="143" rx="11.500" ry="6.800" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/>
<path d="M56 62c-7-7-7-16-1-19 4 4 7 9 8 15Z" fill="${OR}" stroke="${OR_D}" stroke-width="2.800" stroke-linejoin="round"/>
<path d="M104 62c7-7 7-16 1-19-4 4-7 9-8 15Z" fill="${OR}" stroke="${OR_D}" stroke-width="2.800" stroke-linejoin="round"/>
<path d="M80 50c28 0 46 21 46 48 0 28-19 48-46 48S34 126 34 98c0-27 18-48 46-48Z" fill="${c.body}" ${trait(c)}/>
<ellipse cx="80" cy="123" rx="25" ry="16.500" fill="${c.light}"/>
<path d="M57 63c6-6 14-8 21-8" fill="none" stroke="#fff" stroke-width="3.600" stroke-linecap="round" opacity=".6"/>
<path d="M70 52c0-8 4-13 9-15-1 5 0 8 2 11 2-5 5-8 10-9-2 5-2 9-1 13Z" fill="${c.deep}" stroke="${c.deep}" stroke-width="2" stroke-linejoin="round"/>
<path class="m-wave" d="M38 108c-10-3-15-14-10-19 5-3 11 5 15 11" fill="${c.body}" ${trait(c)}/>
<g transform="rotate(28 128 104)"><path d="M125 84c-5 1-8 6-7 11l4 3v22c0 3 2 5 5 5s5-2 5-5v-22l4-3c1-5-2-10-7-11v8h-4Z" fill="#DADCEC" stroke="#6B6789" stroke-width="2.600" stroke-linejoin="round"/></g>
<path d="M122 110c9 3 13 11 8 14-5 2-9-3-12-9" fill="${c.body}" ${trait(c)}/>
<g class="m-eyes">${oeil(65)}${oeil(95)}<g class="m-look">${pupille(65, 91.5, c, 5.6)}${pupille(95, 91.5, c, 5.6)}</g></g>
<g fill="rgba(255,255,255,.2)" stroke="${INK}" stroke-width="3.600"><circle cx="65" cy="92" r="15"/><circle cx="95" cy="92" r="15"/></g>
<path d="M79.500 90.500q.500-3 1 0" fill="none" stroke="${INK}" stroke-width="3.600" stroke-linecap="round"/>
<path d="M50.200 89l-8-3.500M109.800 89l8-3.500" stroke="${INK}" stroke-width="3.600" stroke-linecap="round"/>
<path d="M55 84q3.500-5 9-5.200M85 84q3.500-5 9-5.200" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round" opacity=".85"/>
${joues(49, 111, 110, '#FF9FB4', 0.6)}
<path d="M71 113q9 8 18 0" fill="none" stroke="${INK}" stroke-width="3.400" stroke-linecap="round"/>
<path d="M82.500 116l2.100 4.400 2.300-4Z" fill="#fff" stroke="${INK}" stroke-width="1.400" stroke-linejoin="round"/>
</g>`;
}

// Les anciens noms (un monstre par forfait) rendent Lia, avec une humeur.
const ANCIENS = { mascotte: 'bonjour', chico: 'bonjour', power: 'clin', titan: 'ravie' };

function monster(kind, { size, cls = '', title } = {}) {
  const nom = kind === 'alex' ? 'alex' : (HUMEURS[kind] ? kind : (ANCIENS[kind] || 'bonjour'));
  const label = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"';
  const dim = size ? ` width="${size}" height="${size}"` : '';
  const dessin = nom === 'alex' ? alex() : lia(nom);
  const classes = nom === 'alex' ? 'monster monster-alex' : `monster monster-lia monster-${nom}`;
  return `<svg class="${classes}${cls ? ' ' + cls : ''}" viewBox="0 0 160 160"${dim} ${label}>${dessin}</svg>`.replace(/(\d)\.(\d)00\b/g, '$1.$2');
}

// Logo : un petit monstre en autocollant (contour blanc), tout rond, rose et lilas, deux petites cornes dorées,
// de grands yeux brillants, des joues roses et un sourire en « w ». Une étincelle à côté.
// Il reste lisible en tout petit (icône de l'onglet).
function logoMark({ id = 'lg', size } = {}) {
  const dim = size ? ` width="${size}" height="${size}"` : '';
  const oeil = (x) => `<ellipse cx="${x}" cy="35" rx="4.3" ry="5.4" fill="${INK}"/><circle cx="${x + 1.5}" cy="33" r="1.8" fill="#fff"/><circle cx="${x - 1.4}" cy="37" r=".8" fill="#fff"/>`;
  return `<svg class="logo" viewBox="0 0 64 64"${dim} aria-hidden="true" focusable="false"><defs>
<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB8D6"/><stop offset=".55" stop-color="#E6B9FF"/><stop offset="1" stop-color="#B9A6FF"/></linearGradient></defs>
<g stroke="#fff" stroke-width="7" stroke-linejoin="round" fill="#fff">
<path d="M19 20l-3-10 9 6ZM45 20l3-10-9 6Z"/>
<path d="M9 40C9 23 19 13 32 13S55 23 55 40C55 52 46 56 32 56S9 52 9 40Z"/></g>
<path d="M19 20l-3-10 9 6ZM45 20l3-10-9 6Z" fill="#FFE07A" stroke="#D9A400" stroke-width="1.8" stroke-linejoin="round"/>
<path d="M9 40C9 23 19 13 32 13S55 23 55 40C55 52 46 56 32 56S9 52 9 40Z" fill="url(#${id})" stroke="#9B6FD8" stroke-width="2.2"/>
<path d="M16 30c2-6 6-10 11-11" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>
${oeil(24)}${oeil(40)}
<ellipse cx="17.5" cy="43" rx="4" ry="2.4" fill="#FF7FAE" opacity=".7"/><ellipse cx="46.5" cy="43" rx="4" ry="2.4" fill="#FF7FAE" opacity=".7"/>
<path d="M28 42.5q2 2.8 4 0q2 2.8 4 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M57 9q.6 3.4 4 4q-3.4.6-4 4q-.6-3.4-4-4q3.4-.6 4-4Z" fill="#FFE07A"/></svg>`;
}

module.exports = { monster, logoMark, HUMEURS: Object.keys(HUMEURS) };
