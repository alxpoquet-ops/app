// Petits monstres (SVG dessinés à la main, originaux) : la mascotte d'ALED08
// et un monstre par forfait. Chaque fonction renvoie un <svg> autonome.
//   monster('chico' | 'power' | 'titan' | 'mascotte' | 'triste', { size, cls, title })

const INK = '#2E2A47';

const C = {
  mascotte: { body: '#FFB8D2', light: '#FFE3EE', deep: '#C94A7C', foot: '#FF9DC2' },
  chico: { body: '#A6EBCF', light: '#D9F8EC', deep: '#2E8F6A', foot: '#86DDBA' },
  power: { body: '#C9B8FF', light: '#EEE8FF', deep: '#6A4ED6', foot: '#B29CFF' },
  titan: { body: '#FFBE9C', light: '#FFE6D8', deep: '#CC5F33', foot: '#FFA57A' },
  triste: { body: '#BFDDFB', light: '#E4F1FE', deep: '#3F78B8', foot: '#A3CDF7' },
};

// Yeux ronds avec reflets ; « dir » décale les pupilles
function eyes(x1, x2, y, c, { rx = 11, ry = 12, pupil = 6.6, dir = 0 } = {}) {
  const e = (x) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${c.deep}" stroke-width="3"/>
<circle cx="${x + 1 + dir}" cy="${y + 3}" r="${pupil}" fill="${INK}"/>
<circle cx="${x + 3.4 + dir}" cy="${y - 0.4}" r="2.5" fill="#fff"/>
<circle cx="${x - 1.4 + dir}" cy="${y + 6}" r="1.2" fill="#fff"/>`;
  return `<g class="m-eyes">${e(x1)}${e(x2)}</g>`;
}
const blush = (x1, x2, y) =>
  `<ellipse cx="${x1}" cy="${y}" rx="8" ry="4.6" fill="#FF8FB5" opacity=".55"/><ellipse cx="${x2}" cy="${y}" rx="8" ry="4.6" fill="#FF8FB5" opacity=".55"/>`;
const feet = (c, y = 141) =>
  `<ellipse cx="62" cy="${y}" rx="13" ry="7.5" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/><ellipse cx="98" cy="${y}" rx="13" ry="7.5" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/>`;
const shadow = (rx = 40) => `<ellipse class="m-shadow" cx="80" cy="152" rx="${rx}" ry="5.5" fill="${INK}" opacity=".09"/>`;

const parts = {
  // Mascotte : boule rose, antenne éclair, tient une petite page de site
  mascotte(c) {
    return `${shadow()}
<g class="m-bob">
${feet(c)}
<path d="M80 22v-9" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round"/>
<path d="M83 0 72 14h7l-3 10 11-15h-7l3-9Z" fill="#FFD45E" stroke="${c.deep}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M80 24c33 0 54 25 54 59 0 35-22 61-54 61S26 118 26 83c0-34 21-59 54-59Z" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2"/>
<ellipse cx="80" cy="112" rx="31" ry="23" fill="${c.light}"/>
<path class="m-wave" d="M33 92c-12-4-17-17-11-22 6-4 13 6 17 13" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
${eyes(63, 97, 76, c)}
${blush(50, 110, 95)}
<path d="M71 96q9 9 18 0" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
<g transform="rotate(-8 120 118)"><rect x="100" y="100" width="44" height="34" rx="7" fill="#fff" stroke="${c.deep}" stroke-width="3"/><rect x="106" y="107" width="18" height="5" rx="2.5" fill="#FFB8D2"/><rect x="106" y="116" width="32" height="4" rx="2" fill="#D9D4EA"/><rect x="106" y="124" width="24" height="4" rx="2" fill="#D9D4EA"/></g>
<path d="M126 106c6-3 10 2 7 7" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round"/>
</g>`;
  },
  // Chico : petite boule menthe, deux cornes, une dent
  chico(c) {
    return `${shadow(36)}
<g class="m-bob">
${feet(c)}
<path d="M55 40c-6-12-2-22 6-23 3 8 4 15 3 22" fill="#FFD45E" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/>
<path d="M105 40c6-12 2-22-6-23-3 8-4 15-3 22" fill="#FFD45E" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/>
<path d="M80 30c32 0 52 24 52 56 0 33-21 58-52 58S28 119 28 86c0-32 20-56 52-56Z" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2"/>
<ellipse cx="80" cy="114" rx="29" ry="21" fill="${c.light}"/>
<path class="m-wave" d="M34 96c-13-3-19-16-13-21 6-5 13 5 18 12" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M126 98c9 4 12 13 7 15-5 2-9-4-11-10" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
${eyes(63, 97, 82, c)}
${blush(50, 110, 101)}
<path d="M71 101q9 8 18 0" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
<path d="M76.5 103.6 79 109l2.6-5.2" fill="#fff" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
</g>`;
  },
  // Power : lilas, cornes pêche, éclair sur le ventre, bras levés
  power(c) {
    return `${shadow(38)}
<g class="m-bob">
${feet(c, 143)}
<path d="M54 36C40 28 35 12 43 5c5 9 13 18 20 23" fill="#FFC2A3" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/>
<path d="M106 36c14-8 19-24 11-31-5 9-13 18-20 23" fill="#FFC2A3" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/>
<path d="M80 22c31 0 50 27 51 61 1 35-19 61-51 61S28 118 29 83c1-34 20-61 51-61Z" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2"/>
<ellipse cx="80" cy="114" rx="28" ry="23" fill="${c.light}"/>
<path d="m86 99-13 18h8l-4 15 15-21h-8l5-12Z" fill="#FFD45E" stroke="${c.deep}" stroke-width="2.6" stroke-linejoin="round"/>
<path class="m-flex" d="M33 82c-15-8-19-26-9-29 8-2 12 13 15 21" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<path class="m-flex m-flex-r" d="M127 82c15-8 19-26 9-29-8-2-12 13-15 21" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M53 60l15 4M107 60l-15 4" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
${eyes(63, 97, 76, c, { dir: 0.5 })}
${blush(49, 111, 94)}
<path d="M69 92q11 10 22 0" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
<path d="M72.4 94.4 74.5 99.5l2.4-4.1M83.2 95.4l2.3 4.1 2.2-5.1" fill="#fff" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
</g>`;
  },
  // Titan : pêche, large, couronne, grand sourire, étoile
  titan(c) {
    return `${shadow(44)}
<g class="m-bob">
${feet(c)}
<path d="M56 38 60 16l11 13 9-17 9 17 11-13 4 22Z" fill="#FFD45E" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/>
<circle cx="80" cy="28" r="3.4" fill="#FF8FB5"/><circle cx="64" cy="30" r="2.6" fill="#8FD3FF"/><circle cx="96" cy="30" r="2.6" fill="#8FD3FF"/>
<path d="M80 34c40 0 60 23 60 56 0 32-24 54-60 54s-60-22-60-54c0-33 20-56 60-56Z" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2"/>
<path d="M22 70c-9-6-10-16-4-18 5 0 8 7 9 12M138 70c9-6 10-16 4-18-5 0-8 7-9 12" fill="${c.body}" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/>
<ellipse cx="80" cy="117" rx="33" ry="20" fill="${c.light}"/>
<path d="m80 108 3.5 7 7.7 1.1-5.6 5.4 1.3 7.6L80 125.5l-6.9 3.6 1.3-7.6-5.6-5.4 7.7-1.1Z" fill="#FFD45E" stroke="${c.deep}" stroke-width="2" stroke-linejoin="round"/>
<path class="m-wave" d="M27 104c-14 0-21-12-16-17 5-4 12 4 17 10" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M133 104c14 0 21-12 16-17-5-4-12 4-17 10" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
${eyes(61, 99, 74, c, { rx: 12, ry: 13, pupil: 7.2 })}
${blush(45, 115, 94)}
<path d="M64 89c5 13 27 13 32 0Z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<ellipse cx="80" cy="97" rx="7.5" ry="3.6" fill="#FF8FB5"/>
<path d="M68 90.5 70 95l2.6-4.3M87.4 90.6 90 95l2-4.4" fill="#fff"/>
</g>`;
  },
  // Monstre un peu triste (page introuvable)
  triste(c) {
    return `${shadow(36)}
<g class="m-bob">
${feet(c)}
<path d="M80 30c32 0 52 24 52 56 0 33-21 58-52 58S28 119 28 86c0-32 20-56 52-56Z" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2"/>
<ellipse cx="80" cy="114" rx="29" ry="21" fill="${c.light}"/>
<path d="M36 102c-11 2-17-6-13-11 4-4 10 0 14 5M124 102c11 2 17-6 13-11-4-4-10 0-14 5" fill="${c.body}" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/>
<path d="M54 66l13-4M106 66l-13-4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
${eyes(63, 97, 82, c, { dir: -1 })}
<path d="M106 92c3 5 3 9 0 10-3 0-3-5 0-10Z" fill="#8FD3FF" stroke="${c.deep}" stroke-width="1.6"/>
${blush(50, 110, 101)}
<path d="M71 106q9-7 18 0" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
</g>`;
  },
};

function monster(kind, { size, cls = '', title } = {}) {
  const c = C[kind] || C.mascotte;
  const draw = (parts[kind] || parts.mascotte)(c);
  const label = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"';
  const dim = size ? ` width="${size}" height="${size}"` : '';
  return `<svg class="monster monster-${kind}${cls ? ' ' + cls : ''}" viewBox="0 0 160 160"${dim} ${label}>${draw}</svg>`;
}

// Tête de la mascotte, pour le logo et les icônes
function logoMark({ id = 'lg', size } = {}) {
  const c = C.mascotte;
  const dim = size ? ` width="${size}" height="${size}"` : '';
  return `<svg class="logo" viewBox="0 0 64 64"${dim} aria-hidden="true" focusable="false"><defs><radialGradient id="${id}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFD3E3"/><stop offset="1" stop-color="${c.body}"/></radialGradient></defs>
<path d="M32 9V3" stroke="${c.deep}" stroke-width="2.6" stroke-linecap="round"/><path d="M34.4-1 27 8.4h4.6l-2 6.6 7.4-9.8h-4.6l2-6.2Z" fill="#FFD45E" stroke="${c.deep}" stroke-width="1.8" stroke-linejoin="round" transform="translate(0 2)"/>
<path d="M32 10c14.5 0 25 10.5 25 25S46.5 61 32 61 7 49.5 7 35s10.5-25 25-25Z" fill="url(#${id})" stroke="${c.deep}" stroke-width="2.6"/>
<ellipse cx="23.5" cy="33" rx="5.6" ry="6.2" fill="#fff" stroke="${c.deep}" stroke-width="2"/><ellipse cx="40.5" cy="33" rx="5.6" ry="6.2" fill="#fff" stroke="${c.deep}" stroke-width="2"/>
<circle cx="24.3" cy="34.6" r="3.4" fill="${INK}"/><circle cx="41.3" cy="34.6" r="3.4" fill="${INK}"/><circle cx="25.6" cy="32.7" r="1.3" fill="#fff"/><circle cx="42.6" cy="32.7" r="1.3" fill="#fff"/>
<ellipse cx="16.5" cy="43" rx="4" ry="2.4" fill="#FF8FB5" opacity=".6"/><ellipse cx="47.5" cy="43" rx="4" ry="2.4" fill="#FF8FB5" opacity=".6"/>
<path d="M27.5 43.5q4.5 4.5 9 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/></svg>`;
}

module.exports = { monster, logoMark, COLORS: C };
