// Petits monstres (SVG dessinés à la main, originaux) : la mascotte d'Alex & Lia
// et un monstre par forfait. Chaque fonction renvoie un <svg> autonome.
//   monster('chico' | 'power' | 'titan' | 'mascotte' | 'triste', { size, cls, title })

const INK = '#2E2A47';

const C = {
  mascotte: { body: '#FFA3C8', light: '#FFE0EC', deep: '#B93474', foot: '#FF86B6', noeud: '#FF4F9A' }, // Lia, rose
  chico: { body: '#A6EBCF', light: '#D9F8EC', deep: '#2E8F6A', foot: '#86DDBA' },
  power: { body: '#C9B8FF', light: '#EEE8FF', deep: '#6A4ED6', foot: '#B29CFF' },
  titan: { body: '#FFBE9C', light: '#FFE6D8', deep: '#CC5F33', foot: '#FFA57A' },
  triste: { body: '#BFDDFB', light: '#E4F1FE', deep: '#3F78B8', foot: '#A3CDF7' },
};

// Yeux ronds avec reflets ; « dir » décale les pupilles
function eyes(x1, x2, y, c, { rx = 11, ry = 12, pupil = 6.6, dir = 0, cils = false } = {}) {
  const e = (x) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${c.deep}" stroke-width="3"/>
<circle cx="${x + 1 + dir}" cy="${y + 3}" r="${pupil}" fill="${INK}"/>
<circle cx="${x + 3.4 + dir}" cy="${y - 0.4}" r="2.5" fill="#fff"/>
<circle cx="${x - 1.4 + dir}" cy="${y + 6}" r="1.2" fill="#fff"/>`;
  // cils : trois petits traits vers l'extérieur de chaque œil
  const l = (x, sx) => [[-9.5, -8.5, -14.5, -13], [-5.5, -11.5, -8, -17.5], [-0.5, -12.6, -1, -18.5]]
    .map(([a, b, cx, cy]) => `<path d="M${x + sx * a} ${y + b}L${x + sx * cx} ${y + cy}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`).join('');
  return `<g class="m-eyes">${cils ? l(x1, 1) + l(x2, -1) : ''}${e(x1)}${e(x2)}</g>`;
}
const blush = (x1, x2, y) =>
  `<ellipse cx="${x1}" cy="${y}" rx="8" ry="4.6" fill="#FF8FB5" opacity=".55"/><ellipse cx="${x2}" cy="${y}" rx="8" ry="4.6" fill="#FF8FB5" opacity=".55"/>`;
const feet = (c, y = 141) =>
  `<ellipse cx="62" cy="${y}" rx="13" ry="7.5" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/><ellipse cx="98" cy="${y}" rx="13" ry="7.5" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/>`;
const shadow = (rx = 40) => `<ellipse class="m-shadow" cx="80" cy="152" rx="${rx}" ry="5.5" fill="${INK}" opacity=".09"/>`;

const parts = {
  // Lia, la mascotte : monstre fille rose, grands cils, nœud sur la tête, tient une petite page de site
  mascotte(c) {
    return `${shadow()}
<g class="m-bob">
${feet(c)}
<path d="M80 24c33 0 54 25 54 59 0 35-22 61-54 61S26 118 26 83c0-34 21-59 54-59Z" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2"/>
<ellipse cx="80" cy="112" rx="31" ry="23" fill="${c.light}"/>
<path d="M52 38c8-9 20-12 30-11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>
<g transform="rotate(-14 104 26)"><path d="M104 26c-9-12-24-12-24-1s15 12 24 1Z" fill="${c.noeud}" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/><path d="M104 26c9-12 24-12 24-1s-15 12-24 1Z" fill="${c.noeud}" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/><circle cx="104" cy="26" r="6" fill="#FFD45E" stroke="${c.deep}" stroke-width="2.6"/></g>
<path class="m-wave" d="M33 92c-12-4-17-17-11-22 6-4 13 6 17 13" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
${eyes(63, 97, 78, c, { cils: true })}
${blush(49, 111, 97)}
<path d="M71 97q9 9 18 0" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
<g transform="rotate(-8 120 118)"><rect x="100" y="100" width="44" height="34" rx="7" fill="#fff" stroke="${c.deep}" stroke-width="3"/><rect x="106" y="107" width="18" height="5" rx="2.5" fill="#7EDDB5"/><rect x="106" y="116" width="32" height="4" rx="2" fill="#D9D4EA"/><rect x="106" y="124" width="24" height="4" rx="2" fill="#D9D4EA"/></g>
<path d="M126 106c6-3 10 2 7 7" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round"/>
</g>`;
  },
  // Chico : petite boule menthe, deux cornes
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
  // Power : gros monstre lilas tout rond, grosses lunettes rondes, petites oreilles, éclair sur le ventre
  power(c) {
    return `${shadow(48)}
<g class="m-bob">
<ellipse cx="58" cy="144" rx="14" ry="7.5" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/><ellipse cx="102" cy="144" rx="14" ry="7.5" fill="${c.foot}" stroke="${c.deep}" stroke-width="3"/>
<path d="M40 46c-9-6-12-17-5-21 6 3 11 9 14 15" fill="${c.foot}" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/>
<path d="M120 46c9-6 12-17 5-21-6 3-11 9-14 15" fill="${c.foot}" stroke="${c.deep}" stroke-width="3" stroke-linejoin="round"/>
<path d="M80 30c40 0 64 26 64 60 0 33-25 56-64 56S16 123 16 90c0-34 24-60 64-60Z" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2"/>
<ellipse cx="80" cy="118" rx="40" ry="22" fill="${c.light}"/>
<path d="m85 106-11 15h7l-3 12 13-18h-7l4-9Z" fill="#FFD45E" stroke="${c.deep}" stroke-width="2.4" stroke-linejoin="round"/>
<path class="m-flex" d="M20 96c-12 2-17 14-11 18 5 3 11-3 15-9" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<path class="m-flex m-flex-r" d="M140 96c12 2 17 14 11 18-5 3-11-3-15-9" fill="${c.body}" stroke="${c.deep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
${eyes(60, 100, 76, c, { rx: 9, ry: 10, pupil: 5.6 })}
<g fill="rgba(255,255,255,.22)" stroke="${INK}" stroke-width="3.6"><circle cx="60" cy="77" r="17"/><circle cx="100" cy="77" r="17"/></g>
<path d="M77 75q3-4 6 0" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
<path d="M43 73l-9-4M117 73l9-4" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
<path d="M49 68q4-6 10-6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/><path d="M89 68q4-6 10-6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
${blush(42, 118, 99)}
<path d="M72 100q8 7 16 0" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
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

// Logo : une tache de peinture, une petite fenêtre de site, une étincelle (l'IA).
// La tache est vert menthe : elle répond à l'éclaboussure rose derrière « Lia » dans le nom.
function logoMark({ id = 'lg', size, teinte = 'menthe' } = {}) {
  const T = teinte === 'rose' ? ['#FF8CC0', '#D9408B', '#34B27F'] : ['#9BEBCB', '#2FA878', '#E2589A'];
  const dim = size ? ` width="${size}" height="${size}"` : '';
  return `<svg class="logo" viewBox="0 0 64 64"${dim} aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T[0]}"/><stop offset="1" stop-color="${T[1]}"/></linearGradient></defs>
<path d="M51.9 32.0C52.6 32.9 54.4 33.9 55.6 35.1C56.8 36.3 59.3 38.2 59.2 39.3C59.1 40.4 56.4 40.9 55.0 41.5C53.5 42.1 51.3 42.0 50.5 42.7C49.6 43.4 50.2 44.8 49.8 45.7C49.4 46.5 48.5 47.1 47.9 47.9C47.3 48.7 46.6 49.2 46.1 50.4C45.6 51.5 45.6 53.2 45.1 54.7C44.6 56.2 44.4 59.1 43.3 59.3C42.2 59.5 39.9 57.0 38.4 56.0C37.0 55.0 35.9 53.5 34.8 53.1C33.7 52.8 32.9 53.8 32.0 53.7C31.1 53.6 30.2 52.7 29.3 52.7C28.3 52.8 27.5 53.0 26.1 53.9C24.8 54.8 22.1 58.4 21.2 58.0C20.3 57.6 21.0 53.1 20.8 51.5C20.5 49.9 20.1 49.1 19.6 48.2C19.1 47.3 18.4 46.9 17.8 46.2C17.1 45.6 16.6 45.0 15.7 44.5C14.8 44.0 13.7 43.7 12.5 43.3C11.3 42.8 10.3 42.3 8.6 41.7C6.9 41.2 2.9 41.0 2.3 40.0C1.7 38.9 4.0 36.9 5.1 35.6C6.1 34.2 7.6 33.1 8.4 32.0C9.2 30.9 9.5 30.1 9.8 29.1C10.0 28.1 9.4 26.9 9.8 26.0C10.1 25.2 11.7 24.7 11.9 23.7C12.1 22.6 11.2 21.2 10.9 19.8C10.6 18.4 9.4 16.0 10.1 15.2C10.8 14.4 13.5 15.0 15.1 15.1C16.7 15.3 18.6 16.1 19.7 16.0C20.8 15.8 20.9 14.6 21.6 14.1C22.4 13.5 23.2 13.0 24.0 12.7C24.9 12.4 25.9 13.1 26.7 12.3C27.5 11.5 27.9 9.5 28.8 7.8C29.7 6.2 30.9 2.5 32.0 2.4C33.1 2.2 34.3 5.6 35.3 7.0C36.2 8.4 36.8 9.9 37.7 10.5C38.6 11.2 39.7 10.7 40.7 11.0C41.7 11.2 42.8 11.3 43.6 11.9C44.4 12.5 44.4 14.1 45.4 14.6C46.3 15.0 48.1 14.4 49.4 14.6C50.7 14.8 52.6 14.9 53.0 15.9C53.4 16.9 52.0 19.3 51.7 20.6C51.5 22.0 51.5 22.9 51.4 24.0C51.3 25.0 51.4 25.9 51.4 26.8C51.4 27.7 51.4 28.6 51.4 29.4C51.5 30.3 51.2 31.1 51.9 32.0Z" fill="url(#${id})"/><circle cx="44.5" cy="62.2" r="1.7" fill="${T[1]}"/><circle cx="6.1" cy="12.1" r="1.9" fill="${T[1]}"/><circle cx="56.0" cy="13.6" r="1.4" fill="${T[1]}"/>
<rect x="17.5" y="21" width="29" height="23" rx="5.5" fill="#fff"/>
<path d="M17.5 28.4h29" stroke="${INK}" stroke-width="1.6"/>
<circle cx="22" cy="24.8" r="1.35" fill="#F27BA8"/><circle cx="26" cy="24.8" r="1.35" fill="#F2B83A"/><circle cx="30" cy="24.8" r="1.35" fill="#34B27F"/>
<path d="M32 30.6Q32.9 35.3 37.6 36.2 32.9 37.1 32 41.8 31.1 37.1 26.4 36.2 31.1 35.3 32 30.6Z" fill="${T[2]}"/>
<path d="M40.6 31.4q.4 1.9 2.3 2.3-1.9.4-2.3 2.3-.4-1.9-2.3-2.3 1.9-.4 2.3-2.3Z" fill="#8C6CF2"/></svg>`;
}

module.exports = { monster, logoMark, COLORS: C };
