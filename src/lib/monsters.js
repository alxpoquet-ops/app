// Les mascottes et le logo des Minis Monstres. Dessins originaux en SVG, faits à la main.
//   Cerise : l'assistante de la bande, rose cerise, avec son casque micro (et un bonnet à Noël). Elle répond dans la bulle.
//   Alex : le chef de chantier de la bande, dessiné dans bestiaire.js (alexPortrait).
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

// ---------------------------------------------------------------- Cerise
// Cerise, l'assistante de la bande : elle vit dans la bulle, en bas de l'écran. Un petit monstre rose cerise, tout rond
// comme le reste de la famille, avec son casque micro (le bout du micro est une cerise) et deux cerises sur l'arceau.
// Dessinée dans un carré de 120 (comme bestiaire.js). Les humeurs gardent les noms d'avant (bonjour, coucou, clin…).
const CE = { corps: '#FFA9B6', ventre: '#FFE3E8', trait: '#C8435E', casque: '#8C7BEA', casqueD: '#5B4BC4', coussin: '#C9C0FF', rouge: '#E8435A', rougeD: '#A62238', tige: '#3E9A55' };
const tc = (w = 3) => `stroke="${CE.trait}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const oeilC = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="7.4" fill="${INK}"/><circle cx="${x + 2.1}" cy="${y - 2.7}" r="2.5" fill="#fff"/><circle cx="${x - 2}" cy="${y + 2.8}" r="1.1" fill="#fff"/>`;
const fermeC = (x, y) => `<path d="M${x - 6.5} ${y + 2.5}q6.5-9.5 13 0" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
const yeuxC = (g, d, y = 75) => {
  const un = (x, e) => (e === 'o' ? `<g class="m-look">${oeilC(x, y)}</g>` : fermeC(x, y));
  return `<g class="m-eyes">${un(47, g)}${un(73, d)}</g>`;
};
const BOUCHES_C = {
  w: `<path d="M54 87q3 4 6 0q3 4 6 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  sourire: `<path d="M54.5 85.5q5.5 10 11 0Z" fill="#8A2C52" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round"/><path d="M57.5 89.6q2.5 1.6 5 0" fill="none" stroke="#FF8FB8" stroke-width="2" stroke-linecap="round"/>`,
  malin: `<path d="M54 86.5q6 5.5 12 0" fill="none" stroke="${INK}" stroke-width="2.7" stroke-linecap="round"/><path d="M56.6 88.6l1.4 3 1.6-2.7Z" fill="#fff" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`,
  rire: `<path d="M53 84.5q7 13 14 0Z" fill="#8A2C52" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round"/><path d="M56.5 90.5q3.5 2.2 7 0" fill="none" stroke="#FF8FB8" stroke-width="2.4" stroke-linecap="round"/>`,
  rond: `<ellipse cx="60" cy="88" rx="3" ry="2.8" fill="#8A2C52" stroke="${INK}" stroke-width="2"/>`,
  moue: `<path d="M54.5 90q5.5-5 11 0" fill="none" stroke="${INK}" stroke-width="2.7" stroke-linecap="round"/>`,
};
const BRAS_C = {
  gSalut: `<path class="m-wave" d="M27 90c-9-1-13-9-8-12 4-2 8 1 10 5" fill="${CE.corps}" ${tc(2.6)}/>`,
  gBas: `<path d="M26 96c-8 2-12-4-9-8 3-3 7-1 9 2" fill="${CE.corps}" ${tc(2.6)}/>`,
  dSalut: `<path class="m-wave m-wave-r" d="M93 90c9-1 13-9 8-12-4-2-8 1-10 5" fill="${CE.corps}" ${tc(2.6)}/>`,
  dBas: `<path d="M94 96c8 2 12-4 9-8-3-3-7-1-9 2" fill="${CE.corps}" ${tc(2.6)}/>`,
};
const HUMEURS = {
  bonjour: { yeux: ['o', 'o'], bouche: 'sourire', bras: ['gSalut', 'dBas'] },
  // pour les petites tailles (la bulle en bas de l'écran)
  coucou: { yeux: ['o', 'o'], bouche: 'w', bras: ['gSalut', 'dBas'] },
  clin: { yeux: ['o', 'f'], bouche: 'malin', bras: ['gSalut', 'dBas'] },
  ravie: { yeux: ['f', 'f'], bouche: 'rire', bras: ['gSalut', 'dSalut'], plus: `${eclatC(14, 50, 6)}${eclatC(108, 48, 4.5, '#FF8FB8')}${eclatC(104, 30, 3.5)}` },
  pense: { yeux: ['o', 'o'], bouche: 'rond', bras: ['gBas', 'dBas'], plus: `<circle cx="104" cy="44" r="2.6" fill="${CE.ventre}" stroke="${CE.trait}" stroke-width="1.6"/><circle cx="111" cy="33" r="3.8" fill="${CE.ventre}" stroke="${CE.trait}" stroke-width="1.6"/>` },
  triste: { yeux: ['o', 'o'], bouche: 'moue', bras: ['gBas', 'dBas'], plus: '', apres: `<path d="M38 64l10-3.5M82 64l-10-3.5" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M37 86c2.4 4 2.4 7 0 8-2.4 0-2.4-4 0-8Z" fill="#8FD3FF" stroke="#3F78B8" stroke-width="1.3"/>` },
};
function eclatC(x, y, r, c = OR) {
  return `<path d="M${x} ${y - r}q${r * 0.2} ${r * 0.8} ${r} ${r}q${-r * 0.8} ${r * 0.2} ${-r} ${r}q${-r * 0.2} ${-r * 0.8} ${-r} ${-r}q${r * 0.8} ${-r * 0.2} ${r} ${-r}Z" fill="${c}"/>`;
}

// Le bonnet de Noël : caché par défaut ; il s'affiche quand la page porte la classe « noel »
// (le petit script en tête de page la pose du 15 novembre au 6 janvier). L'arceau du casque et les cerises passent alors dessous.
const BONNET = `<g class="m-noel" display="none"><g transform="translate(0 7) scale(.75)"><g transform="rotate(-6 80 54)">
<path d="M38 52C38 30 56 12 82 9C100 7 118 13 127 28L119 34C114 25 107 21 99 22C108 30 116 40 122 52Z" fill="#EF4B5F" stroke="#A3263A" stroke-width="3" stroke-linejoin="round"/>
<path d="M99 22C108 30 116 40 122 52H111C107 41 102 31 95 24Z" fill="#B72C42" opacity=".35"/>
<path d="M50 40C56 26 68 17 82 14" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round" opacity=".45"/>
<circle cx="125" cy="33" r="8.500" fill="#fff" stroke="#D2CBE6" stroke-width="2.600"/><circle cx="122" cy="30" r="2.400" fill="#EDE8F7"/>
<rect x="32" y="46" width="96" height="17" rx="8.500" fill="#fff" stroke="#D2CBE6" stroke-width="2.600"/>
<circle cx="46" cy="54" r="2.200" fill="#EDE8F7"/><circle cx="62" cy="51" r="1.800" fill="#EDE8F7"/><circle cx="78" cy="56" r="2.200" fill="#EDE8F7"/><circle cx="96" cy="52" r="1.800" fill="#EDE8F7"/><circle cx="112" cy="55" r="2.200" fill="#EDE8F7"/>
</g></g></g>`;

function cerise(humeur) {
  const h = HUMEURS[humeur] || HUMEURS.bonjour;
  const c = CE;
  const coque = (x) => `<rect x="${x}" y="58" width="13" height="21" rx="6.5" fill="${c.casque}" stroke="${c.casqueD}" stroke-width="2.6"/><rect x="${x + 3.5}" y="62" width="6" height="13" rx="3" fill="${c.coussin}"/>`;
  return `<ellipse class="m-shadow" cx="60" cy="112" rx="31" ry="4.5" fill="${INK}" opacity=".12"/>
<g class="m-bob">
<ellipse cx="45" cy="107" rx="9" ry="5" fill="${c.corps}" ${tc(2.6)}/><ellipse cx="75" cy="107" rx="9" ry="5" fill="${c.corps}" ${tc(2.6)}/>
<path d="M22 88C22 60 38 44 60 44S98 60 98 88C98 103 88 108 60 108S22 103 22 88Z" fill="${c.corps}" ${tc()}/>
<ellipse cx="60" cy="96" rx="21" ry="9" fill="${c.ventre}"/>
<path d="M34 64c3-8 9-13 17-14" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".6"/>
<g class="m-arceau"><path d="M22 70C21 47 38 34 60 34S99 47 98 70" fill="none" stroke="${c.casqueD}" stroke-width="7" stroke-linecap="round"/><path d="M22 70C21 47 38 34 60 34S99 47 98 70" fill="none" stroke="${c.casque}" stroke-width="3.4" stroke-linecap="round"/>
<path d="M41 39c-1 4-3 7-5 9M41 39c1 4 2 7 5 9" fill="none" stroke="${c.tige}" stroke-width="1.6" stroke-linecap="round"/><path d="M41 39c3-3 6-3 8-1-3 2-5 2-8 1Z" fill="#6BCB77"/>
<circle cx="35.5" cy="50" r="3.6" fill="${c.rouge}" stroke="${c.rougeD}" stroke-width="1.5"/><circle cx="46.5" cy="50" r="3.6" fill="${c.rouge}" stroke="${c.rougeD}" stroke-width="1.5"/><circle cx="34.5" cy="48.8" r="1" fill="#fff"/><circle cx="45.5" cy="48.8" r="1" fill="#fff"/></g>
${h.plus || ''}
${BRAS_C[h.bras[0]]}
${yeuxC(h.yeux[0], h.yeux[1])}
<ellipse cx="35" cy="84" rx="6" ry="3.4" fill="#FF6F91" opacity=".55"/><ellipse cx="85" cy="84" rx="6" ry="3.4" fill="#FF6F91" opacity=".55"/>
${BOUCHES_C[h.bouche]}
${h.apres || ''}
${coque(13)}${coque(94)}
<path d="M100 79c0 12-8 17-18 15" fill="none" stroke="${c.casqueD}" stroke-width="3" stroke-linecap="round"/>
<path d="M79.5 91.5c.3-2.4 1.6-4 3.8-4.6" fill="none" stroke="${c.tige}" stroke-width="1.6" stroke-linecap="round"/>
<circle cx="79" cy="95.5" r="4.4" fill="${c.rouge}" stroke="${c.rougeD}" stroke-width="1.8"/><circle cx="77.6" cy="94" r="1.3" fill="#fff"/>
${BRAS_C[h.bras[1]]}
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

// Les anciens noms (un monstre par forfait) rendent Cerise, avec une humeur.
const ANCIENS = { mascotte: 'bonjour', chico: 'bonjour', power: 'clin', titan: 'ravie' };

function monster(kind, { size, cls = '', title } = {}) {
  const nom = kind === 'alex' ? 'alex' : (HUMEURS[kind] ? kind : (ANCIENS[kind] || 'bonjour'));
  const label = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"';
  const dim = size ? ` width="${size}" height="${size}"` : '';
  const dessin = nom === 'alex' ? alex() : cerise(nom);
  const classes = nom === 'alex' ? 'monster monster-alex' : `monster monster-lia monster-${nom}`;
  const vb = nom === 'alex' ? '0 0 160 160' : '0 0 120 120';
  return `<svg class="${classes}${cls ? ' ' + cls : ''}" viewBox="${vb}"${dim} ${label}>${dessin}</svg>`.replace(/(\d)\.(\d)00\b/g, '$1.$2');
}

// Logo : la tête d'Alex en autocollant (contour blanc) : petit monstre bleu pervenche, casque blanc de chef de chantier
// avec son étoile dorée, grosses lunettes un peu carrées, joues roses et sourire en « w ».
// Il reste lisible en tout petit (icône de l'onglet).
function logoMark({ id = 'lg', size } = {}) {
  const dim = size ? ` width="${size}" height="${size}"` : '';
  const CORPS = 'M8 44C8 27 18 17 32 17S56 27 56 44C56 54 48 59 32 59S8 54 8 44Z';
  const CASQUE = 'M12 27C13 14 21 6 32 6S51 14 52 27Z';
  const oeil = (x) => `<ellipse cx="${x}" cy="40" rx="2.6" ry="3.2" fill="${INK}"/><circle cx="${x + 1}" cy="38.7" r="1.05" fill="#fff"/>`;
  return `<svg class="logo" viewBox="0 0 64 64"${dim} aria-hidden="true" focusable="false">
<g fill="#fff" stroke="#fff" stroke-width="7" stroke-linejoin="round"><path d="${CORPS}"/><path d="${CASQUE}"/><rect x="7" y="24" width="50" height="7" rx="3.5"/></g>
<path d="${CORPS}" fill="#BCC8FF" stroke="#4F5FC4" stroke-width="2.2"/>
<path d="M14 42c1-5 3-8 6-9.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>
<path d="${CASQUE}" fill="#fff" stroke="#7D87BE" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M32 8V25" stroke="#DCE1F7" stroke-width="3.4" stroke-linecap="round"/>
<rect x="7" y="24" width="50" height="7" rx="3.5" fill="#F1F3FF" stroke="#7D87BE" stroke-width="2.2"/>
<path d="M22 11.2l1.1 2.9 3.1.2-2.4 1.9.8 3-2.6-1.7-2.6 1.7.8-3-2.4-1.9 3.1-.2Z" fill="#FFC23D" stroke="#C99A00" stroke-width="1" stroke-linejoin="round"/>
${oeil(23)}${oeil(41)}
<g fill="rgba(255,255,255,.22)" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round"><rect x="15" y="33.5" width="16" height="13" rx="4"/><rect x="33" y="33.5" width="16" height="13" rx="4"/></g>
<path d="M31 38.5q1-1.4 2 0M15 37l-4.5-1.2M49 37l4.5-1.2" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="13.5" cy="50" rx="3.6" ry="2.1" fill="#FF7FAE" opacity=".65"/><ellipse cx="50.5" cy="50" rx="3.6" ry="2.1" fill="#FF7FAE" opacity=".65"/>
<path d="M28 51q2 2.6 4 0q2 2.6 4 0" fill="none" stroke="${INK}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

module.exports = { monster, logoMark, HUMEURS: Object.keys(HUMEURS) };
