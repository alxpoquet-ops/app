// Lia, la mascotte d'Alex & Lia : une petite tête « chibi » aux cheveux roses, avec deux mains.
// Dessin original en SVG, fait à la main. Une seule fonction, plusieurs humeurs :
//   chibi('bonjour' | 'clin' | 'ravie' | 'pense' | 'triste', { size, cls, title })
// Les classes m-bob, m-eyes, m-wave et m-shadow sont animées dans style.css.
// Le groupe m-look est déplacé par main.js : les yeux de Lia suivent le pointeur du visiteur.

const INK = '#3B2450'; // traits des yeux et de la bouche
const K = {
  cheveux: '#FF9CC8',
  ombre: '#F470AE', // mèches du dessous
  reflet: '#FFD6E9',
  trait: '#B93474', // contour
  peau: '#FFEDE2',
  peauTrait: '#D98A93',
  joue: '#FF8FB5',
  iris: '#7A4BC4',
  irisBas: '#FF7DB3',
  etoile: '#FFD45E',
  etoileTrait: '#C98A00',
  bouche: '#C2456E',
  langue: '#FF8FA8',
};

const s = (w = 3) => `stroke="${K.trait}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

// Un œil ouvert : grand, brillant, avec deux reflets. dx et dy déplacent le regard.
function oeil(x, y, { dx = 0, dy = 0 } = {}) {
  return `<ellipse cx="${x}" cy="${y}" rx="8.6" ry="10.8" fill="${INK}"/>
<ellipse cx="${x + dx}" cy="${y + 1 + dy}" rx="6.4" ry="8.4" fill="${K.iris}"/>
<ellipse cx="${x + dx}" cy="${y + 5 + dy}" rx="4.6" ry="3.6" fill="${K.irisBas}" opacity=".9"/>
<circle cx="${x + 3 + dx}" cy="${y - 4.5 + dy}" r="3.1" fill="#fff"/>
<circle cx="${x - 3 + dx}" cy="${y + 4.5 + dy}" r="1.5" fill="#fff"/>
<path d="M${x - 10} ${y - 7.5}C${x - 6} ${y - 14} ${x + 6} ${y - 14} ${x + 10} ${y - 7.5}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
}
// Un œil fermé qui sourit (^) ou un clin d'œil
const oeilFerme = (x, y) => `<path d="M${x - 9} ${y + 2}C${x - 5} ${y - 6} ${x + 5} ${y - 6} ${x + 9} ${y + 2}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;

const HUMEURS = {
  bonjour: {
    yeux: `${oeil(62, 97)}${oeil(98, 97)}`,
    bouche: `<path d="M72 111.5C75 118.5 85 118.5 88 111.5Z" fill="${K.bouche}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M76.500 115.200C78.500 117 81.500 117 83.500 115.200" fill="none" stroke="${K.langue}" stroke-width="2.4" stroke-linecap="round"/>`,
    main: 'salut',
  },
  clin: {
    yeux: `${oeil(62, 97)}${oeilFerme(98, 97)}`,
    bouche: `<path d="M72 111.5C75 118.5 85 118.5 88 111.5Z" fill="${K.bouche}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`,
    main: 'salut',
  },
  ravie: {
    yeux: `${oeilFerme(62, 97)}${oeilFerme(98, 97)}`,
    bouche: `<path d="M70 110C73 120 87 120 90 110Z" fill="${K.bouche}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M75.500 115.500C78 118 82 118 84.500 115.500" fill="none" stroke="${K.langue}" stroke-width="2.6" stroke-linecap="round"/>`,
    main: 'hourra',
  },
  pense: {
    yeux: `${oeil(62, 97, { dx: 2, dy: -2.5 })}${oeil(98, 97, { dx: 2, dy: -2.5 })}`,
    bouche: `<ellipse cx="81" cy="113.500" rx="3.6" ry="3" fill="${K.bouche}" stroke="${INK}" stroke-width="2.2"/>`,
    main: 'menton',
  },
  triste: {
    yeux: `${oeil(62, 99, { dy: 2 })}${oeil(98, 99, { dy: 2 })}<path d="M52 84.500l15 3M108 84.500l-15 3" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M108.500 109c2.500 4 2.500 7 0 8-2.500-1-2.500-4 0-8Z" fill="#8FD0FF" stroke="#4E9AD6" stroke-width="1.2"/>`,
    bouche: `<path d="M73 116C77 111 83 111 87 116" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`,
    main: 'bas',
  },
};

// Les deux mains : petites, rondes, sans bras (elles flottent près de la tête)
function mains(pose) {
  const main = (d, cls = '') => `<path${cls ? ` class="${cls}"` : ''} d="${d}" fill="${K.peau}" stroke="${K.peauTrait}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  const droite = main('M118 139c0-7 5-11 10.500-10 5 .900 7.500 5.500 6 10.500-1.200 4-5 6-9.500 5.500-4.500-.500-7-2.500-7-6Z');
  if (pose === 'salut') return main('M22 122c-5-7-3-15 3-17 5-1.800 8.500 2 9.500 8 3-2 6.500-.500 7.500 3 1.200 4.500-1.500 9-6.500 11.500-5.500 2.700-10.500 1-13.500-5.500Z', 'm-wave') + droite;
  if (pose === 'hourra') return main('M18 106c-4-6-2-13 3.500-15 5-1.800 9 1.500 10 7 3-1.500 6 0 7 3.500 1.200 4.500-1.500 9-6.500 11-5.500 2.200-11 0-14-6.500Z', 'm-wave') + main('M142 106c4-6 2-13-3.500-15-5-1.800-9 1.500-10 7-3-1.500-6 0-7 3.500-1.200 4.500 1.500 9 6.500 11 5.500 2.200 11 0 14-6.500Z', 'm-wave m-wave-r');
  if (pose === 'menton') return main('M92 133c-1-6.500 3-11 8.500-11 5.500 0 9 4 8.500 9.500-.500 5-4.500 8-9.500 7.500-4-.400-7-2.500-7.500-6Z') + main('M27 139c0-7 5-11 10.500-10 5 .900 7.500 5.500 6 10.500-1.200 4-5 6-9.500 5.500-4.500-.500-7-2.500-7-6Z');
  return main('M27 141c0-7 5-11 10.500-10 5 .900 7.500 5.500 6 10.500-1.200 4-5 6-9.500 5.500-4.500-.500-7-2.500-7-6Z') + droite;
}

function chibi(humeur = 'bonjour', { size, cls = '', title } = {}) {
  const h = HUMEURS[humeur] || HUMEURS.bonjour;
  const label = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"';
  const dim = size ? ` width="${size}" height="${size}"` : '';
  const dessin = `<ellipse class="m-shadow" cx="80" cy="153" rx="38" ry="5" fill="${INK}" opacity=".1"/>
<g class="m-bob">
<path d="M31 96C24 54 50 24 80 24s56 30 49 72c3 18-3 33-15 39l-10-9H56l-10 9c-12-6-18-21-15-39Z" fill="${K.ombre}" ${s()}/>
<circle cx="33" cy="47" r="15.500" fill="${K.cheveux}" ${s()}/><circle cx="127" cy="47" r="15.500" fill="${K.cheveux}" ${s()}/>
<path d="M27 44c2-5 6-8 11-8M121 44c2-5 6-8 11-8" fill="none" stroke="${K.reflet}" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="80" cy="96" rx="42" ry="37" fill="${K.peau}" stroke="${K.peauTrait}" stroke-width="2.8"/>
<ellipse cx="50" cy="110" rx="7.6" ry="4.4" fill="${K.joue}" opacity=".6"/><ellipse cx="110" cy="110" rx="7.6" ry="4.4" fill="${K.joue}" opacity=".6"/>
<g class="m-look"><g class="m-eyes">${h.yeux}</g></g>
${h.bouche}
<path d="M37 92C33 60 54 37 80 37s47 23 43 55c-3-9-8-15-15-18-1 8-7 13-15 13-1-7-5-11-10-14-4 8-12 14-22 14-1-6-4-10-8-12-7 3-13 9-16 17Z" fill="${K.cheveux}" ${s()}/>
<path d="M54 52c9-7 22-9 35-5" fill="none" stroke="${K.reflet}" stroke-width="4.500" stroke-linecap="round" opacity=".9"/>
<path d="M78 26C73 13 86 8 91 14c-4 1-8 5-8 12Z" fill="${K.cheveux}" ${s(2.8)}/>
<path d="M111 55l2.600 5.400 5.900.800-4.300 4.100 1.100 5.900-5.300-2.900-5.300 2.900 1.100-5.900-4.300-4.100 5.900-.800Z" fill="${K.etoile}" stroke="${K.etoileTrait}" stroke-width="1.800" stroke-linejoin="round"/>
${mains(h.main)}
</g>`;
  return `<svg class="monster chibi chibi-${humeur}${cls ? ' ' + cls : ''}" viewBox="0 0 160 160"${dim} ${label}>${dessin}</svg>`.replace(/(\d)\.(\d)00\b/g, '$1.$2');
}

module.exports = { chibi, HUMEURS: Object.keys(HUMEURS), COULEURS: K };
