// La petite famille de monstres du site : huit bouilles kawaii, dessinées à la main en SVG,
// semées un peu partout (en-tête de page, cartes, pied de page, bandeaux). Lia reste à part : elle vit dans la bulle.
//
//   petit(nom, { cls, title, humeur })   nom : mochi, fantome, nuage, chaton, gelee, champi, dino, etoile
//   humeur : 'content' (yeux ouverts, par défaut) ou 'ravi' (yeux fermés qui sourient)
//
// Classes animées dans style.css : p-bob (flotte), p-cligne (cligne des yeux), p-salut (bras qui salue).
// Les animations s'arrêtent si le visiteur a demandé moins de mouvements.

const INK = '#2E2A47';
const ROSE = '#FF8FB8';

// Les couleurs de chaque monstre : corps, ombre douce du ventre, trait
const C = {
  mochi: { corps: '#FFC4AC', ventre: '#FFE3D6', trait: '#C2603F' },
  fantome: { corps: '#DCD2FF', ventre: '#F1ECFF', trait: '#6E54D6' },
  nuage: { corps: '#C4E4FF', ventre: '#E9F5FF', trait: '#3D84C9' },
  chaton: { corps: '#FFE59A', ventre: '#FFF4CF', trait: '#B98A10' },
  gelee: { corps: '#A9EFD4', ventre: '#DDFBEF', trait: '#2E9A71' },
  champi: { corps: '#FF9EC4', ventre: '#FFF4EA', trait: '#C24A80' },
  dino: { corps: '#BDEFAA', ventre: '#E6FADD', trait: '#4E9A3A' },
  etoile: { corps: '#FFE07A', ventre: '#FFF3C4', trait: '#C99A00' },
};

const t = (c, w = 3) => `stroke="${c.trait}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const ombre = (rx = 30, y = 112) => `<ellipse class="p-ombre" cx="60" cy="${y}" rx="${rx}" ry="4.5" fill="${INK}" opacity=".12"/>`;
// Un œil brillant : noir, avec deux reflets blancs
const oeil = (x, y, s = 1) => `<ellipse cx="${x}" cy="${y}" rx="${5.2 * s}" ry="${6.4 * s}" fill="${INK}"/><circle cx="${x + 1.8 * s}" cy="${y - 2.3 * s}" r="${2.2 * s}" fill="#fff"/><circle cx="${x - 1.7 * s}" cy="${y + 2.4 * s}" r="${0.95 * s}" fill="#fff"/>`;
// Un œil fermé qui sourit (^)
const ravi = (x, y, s = 1) => `<path d="M${x - 5.5 * s} ${y + 2 * s}q${5.5 * s} ${-8 * s} ${11 * s} 0" fill="none" stroke="${INK}" stroke-width="${3 * s}" stroke-linecap="round"/>`;
const yeux = (x1, x2, y, humeur, s = 1) => `<g class="p-cligne">${humeur === 'ravi' ? ravi(x1, y, s) + ravi(x2, y, s) : oeil(x1, y, s) + oeil(x2, y, s)}</g>`;
const joues = (x1, x2, y, s = 1) => `<ellipse cx="${x1}" cy="${y}" rx="${6 * s}" ry="${3.4 * s}" fill="${ROSE}" opacity=".6"/><ellipse cx="${x2}" cy="${y}" rx="${6 * s}" ry="${3.4 * s}" fill="${ROSE}" opacity=".6"/>`;
// Les bouches
const bouche = {
  w: (x, y) => `<path d="M${x - 5} ${y}q2.5 3.4 5 0q2.5 3.4 5 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  o: (x, y) => `<path d="M${x - 4.5} ${y - 1.5}q4.5 9 9 0Z" fill="#8A2C52" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M${x - 2} ${y + 2.6}q2 1.4 4 0" fill="none" stroke="${ROSE}" stroke-width="1.8" stroke-linecap="round"/>`,
  u: (x, y) => `<path d="M${x - 4} ${y}q4 4.5 8 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`,
  dent: (x, y) => `<path d="M${x - 5} ${y}q5 5 10 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M${x - 2.2} ${y + 1.9}l1.3 2.8 1.5-2.5Z" fill="#fff" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`,
};
// Un reflet sur le corps
const reflet = (d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".6"/>`;
// Une petite étincelle à quatre branches
const eclat = (x, y, r, c = '#FFE07A') => `<path d="M${x} ${y - r}q${r * 0.2} ${r * 0.8} ${r} ${r}q${-r * 0.8} ${r * 0.2} ${-r} ${r}q${-r * 0.2} ${-r * 0.8} ${-r} ${-r}q${r * 0.8} ${-r * 0.2} ${r} ${-r}Z" fill="${c}"/>`;

// Une étoile à cinq branches aux pointes arrondies (centre 60,64)
const ETOILE = (() => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 21 : 44;
    pts.push([60 + r * Math.cos(a), 66 + r * Math.sin(a)]);
  }
  const k = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
  let d = '';
  pts.forEach((p, i) => {
    const prev = pts[(i + 9) % 10], next = pts[(i + 1) % 10];
    const f = i % 2 ? 0.12 : 0.22;
    const a = k(p, prev, f), b = k(p, next, f);
    d += `${i ? 'L' : 'M'}${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  });
  return d + 'Z';
})();

const DESSINS = {
  // Une boule de mochi pêche, deux petites cornes et deux petits pieds
  mochi: (h) => {
    const c = C.mochi;
    return `${ombre(34)}<g class="p-bob">
<path d="M42 46l-4-12 12 7ZM78 46l4-12-12 7Z" fill="#FFE07A" stroke="#C99A00" stroke-width="2.4" stroke-linejoin="round"/>
<ellipse cx="44" cy="107" rx="9" ry="5" fill="${c.corps}" ${t(c, 2.6)}/><ellipse cx="76" cy="107" rx="9" ry="5" fill="${c.corps}" ${t(c, 2.6)}/>
<path d="M20 92C20 60 38 40 60 40S100 60 100 92C100 104 90 108 60 108S20 104 20 92Z" fill="${c.corps}" ${t(c)}/>
<ellipse cx="60" cy="96" rx="22" ry="8" fill="${c.ventre}"/>
${reflet('M33 66c4-9 11-14 19-16')}
${yeux(46, 74, 76, h, 1.25)}${joues(35, 85, 88)}${bouche.w(60, 87)}
</g>`;
  },
  // Un petit fantôme lilas qui lève les bras
  fantome: (h) => {
    const c = C.fantome;
    return `${ombre(26)}<g class="p-bob">
<path class="p-salut" d="M31 70c-9-2-13-10-9-14 4-3 9 1 11 7" fill="${c.corps}" ${t(c, 2.6)}/>
<path d="M89 70c9-2 13-10 9-14-4-3-9 1-11 7" fill="${c.corps}" ${t(c, 2.6)}/>
<path d="M30 100V64C30 41 44 28 60 28S90 41 90 64V100c-5 6-10 6-15 0-5 6-10 6-15 0-5 6-10 6-15 0-5 6-10 6-15 0Z" fill="${c.corps}" ${t(c)}/>
${reflet('M40 52c3-9 9-14 16-15')}
${yeux(49, 71, 62, h, 1.15)}${joues(41, 79, 73)}${bouche.o(60, 75)}
</g>`;
  },
  // Un nuage bleu ciel, tout doux
  nuage: (h) => {
    const c = C.nuage;
    return `${ombre(36)}<g class="p-bob">
<path d="M28 100C14 100 12 82 25 78 22 63 39 54 50 62 54 47 75 45 81 60 93 55 106 66 99 79 110 83 108 100 95 100Z" fill="${c.corps}" ${t(c)}/>
<ellipse cx="62" cy="93" rx="26" ry="5.5" fill="${c.ventre}"/>
${reflet('M33 72c1-5 5-8 10-8')}
${yeux(49, 74, 80, h, 1.12)}${joues(39, 84, 90, 0.9)}${bouche.u(61.5, 89)}
</g>`;
  },
  // Un chaton jaune beurre, oreilles pointues et moustaches
  chaton: (h) => {
    const c = C.chaton;
    return `${ombre(30)}<g class="p-bob">
<path d="M28 58L30 30 50 46ZM92 58L90 30 70 46Z" fill="${c.corps}" ${t(c)}/>
<path d="M33 50l1-12 9 8ZM87 50l-1-12-9 8Z" fill="${ROSE}" opacity=".7"/>
<path d="M24 80C24 56 40 44 60 44S96 56 96 80V92C96 103 88 108 78 108H42C32 108 24 103 24 92Z" fill="${c.corps}" ${t(c)}/>
<ellipse cx="60" cy="98" rx="20" ry="7" fill="${c.ventre}"/>
${reflet('M33 66c3-8 9-12 16-13')}
${yeux(46, 74, 74, h, 1.22)}${joues(36, 84, 85)}
<path d="M55.5 81.5h9l-4.5 4Z" fill="${ROSE}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
${bouche.w(60, 87)}
<path d="M27 79l-11-2M27 85l-11 2M93 79l11-2M93 85l11 2" stroke="${c.trait}" stroke-width="2" stroke-linecap="round" opacity=".7"/>
</g>`;
  },
  // Une gelée menthe, un seul grand œil et une antenne en cœur
  gelee: (h) => {
    const c = C.gelee;
    return `${ombre(32)}<g class="p-bob">
<path d="M60 44C60 34 62 26 67 21" fill="none" stroke="${c.trait}" stroke-width="3" stroke-linecap="round"/>
<path d="M67 21c-6-8-15-2-10 4l10 8 10-8c5-6-4-12-10-4Z" fill="${ROSE}" stroke="#C24A80" stroke-width="2.2" stroke-linejoin="round" transform="translate(0 -6)"/>
<path d="M24 98C24 62 40 44 60 44S96 62 96 98C96 104 91 106 87 102 83 98 79 106 73 104 67 102 65 108 59 106 53 104 51 99 45 102 39 106 31 106 24 98Z" fill="${c.corps}" ${t(c)}/>
${reflet('M34 72c3-10 10-17 19-19')}
<g class="p-cligne">${h === 'ravi' ? ravi(60, 72, 1.6) : `<circle cx="60" cy="72" r="13" fill="#fff" stroke="${c.trait}" stroke-width="2.6"/>${oeil(60, 73, 1.3)}`}</g>
${joues(38, 82, 86)}${bouche.dent(60, 92)}
</g>`;
  },
  // Un champignon rose à pois blancs, avec une petite bouille sous le chapeau
  champi: (h) => {
    const c = C.champi;
    return `${ombre(28)}<g class="p-bob">
<path d="M36 64C35 88 40 106 60 106S85 88 84 64Z" fill="${c.ventre}" stroke="${c.trait}" stroke-width="3" stroke-linejoin="round"/>
<path d="M14 62C14 34 36 20 60 20S106 34 106 62C106 68 100 71 94 69 80 64 40 64 26 69 20 71 14 68 14 62Z" fill="${c.corps}" ${t(c)}/>
<circle cx="40" cy="40" r="6" fill="#fff"/><circle cx="64" cy="31" r="4.5" fill="#fff"/><circle cx="84" cy="46" r="5.5" fill="#fff"/><circle cx="26" cy="56" r="3.5" fill="#fff"/><circle cx="96" cy="58" r="3" fill="#fff"/>
${yeux(49, 71, 82, h, 1.08)}${joues(41, 79, 93, 0.85)}${bouche.w(60, 93)}
</g>`;
  },
  // Un petit dino vert pomme, avec ses piquants et une dent qui dépasse
  dino: (h) => {
    const c = C.dino;
    return `${ombre(32)}<g class="p-bob">
<path d="M40 50l2-14 10 9ZM56 44l4-15 8 13ZM73 46l8-12 4 15Z" fill="#FFB38A" stroke="#C2603F" stroke-width="2.4" stroke-linejoin="round"/>
<ellipse cx="45" cy="107" rx="9" ry="5" fill="${c.corps}" ${t(c, 2.6)}/><ellipse cx="75" cy="107" rx="9" ry="5" fill="${c.corps}" ${t(c, 2.6)}/>
<path d="M22 88C22 60 38 44 60 44S98 60 98 88C98 103 88 108 60 108S22 103 22 88Z" fill="${c.corps}" ${t(c)}/>
<ellipse cx="60" cy="94" rx="21" ry="10" fill="${c.ventre}"/>
<path class="p-salut" d="M27 86c-9 1-13-6-9-10 3-3 8-1 10 3" fill="${c.corps}" ${t(c, 2.6)}/>
${reflet('M34 66c3-8 9-13 17-14')}
${yeux(47, 73, 72, h, 1.22)}${joues(36, 84, 83)}${bouche.dent(60, 84)}
</g>`;
  },
  // Un petit bricoleur turquoise, casque jaune et petite clé : c'est lui qui fait les modifications
  bricou: (h) => {
    const c = { corps: '#A8E6EE', ventre: '#DDF7FA', trait: '#2E8FA0' };
    return `${ombre(32)}<g class="p-bob">
<ellipse cx="45" cy="107" rx="9" ry="5" fill="${c.corps}" ${t(c, 2.6)}/><ellipse cx="75" cy="107" rx="9" ry="5" fill="${c.corps}" ${t(c, 2.6)}/>
<path d="M22 86C22 60 38 46 60 46S98 60 98 86C98 103 88 108 60 108S22 103 22 86Z" fill="${c.corps}" ${t(c)}/>
<ellipse cx="60" cy="95" rx="21" ry="9" fill="${c.ventre}"/>
<path d="M28 58C30 36 44 26 60 26S90 36 92 58Z" fill="#FFD45E" stroke="#C99A00" stroke-width="3" stroke-linejoin="round"/>
<rect x="21" y="54" width="78" height="9" rx="4.5" fill="#FFC23D" stroke="#C99A00" stroke-width="3"/>
<path d="M60 28V54" stroke="#FFF1B8" stroke-width="5" stroke-linecap="round"/>
${reflet('M38 46c3-8 9-13 16-14')}
<g transform="rotate(30 98 84)"><path d="M95 64c-4 1-6 5-5 9l3 2v17c0 2 2 4 4 4s4-2 4-4V75l3-2c1-4-1-8-5-9v6h-4Z" fill="#E4E2F2" stroke="#6B6789" stroke-width="2.2" stroke-linejoin="round"/></g>
<path class="p-salut" d="M93 86c9 1 13-6 9-10-3-3-8-1-10 3" fill="${c.corps}" ${t(c, 2.6)}/>
${yeux(47, 73, 76, h, 1.2)}${joues(36, 84, 86)}${bouche.w(60, 86)}
</g>`;
  },
  // Une étoile jaune, toute ronde, qui pétille
  etoile: (h) => {
    const c = C.etoile;
    return `${ombre(24, 110)}<g class="p-bob">
<path d="${ETOILE}" fill="${c.corps}" ${t(c, 3.2)}/>
${reflet('M47 56c2-4 4-7 7-8')}
${yeux(51, 69, 64, h, 0.95)}${joues(44, 76, 73, 0.8)}${bouche.u(60, 72)}
${eclat(100, 30, 6, '#FFE07A')}${eclat(18, 34, 4, '#FFB3D1')}
</g>`;
  },
};

const NOMS = Object.keys(DESSINS);

// Alex, l'humain de la bande : portrait chibi. Cheveux brun foncé, courts et un peu en pointe sur le dessus,
// côtés dégradés, grosses lunettes un peu carrées, pas de barbe, un sweat menthe.
function alexPortrait({ cls = '', title } = {}) {
  const PEAU = '#FFD9BE', PEAU_T = '#C98A64', CHEV = '#3A2820', CHEV_C = '#5C4336';
  const label = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"';
  const oeilA = (x) => `<ellipse cx="${x}" cy="69" rx="4.6" ry="5.6" fill="${INK}"/><circle cx="${x + 1.6}" cy="67" r="1.9" fill="#fff"/><circle cx="${x - 1.4}" cy="71" r=".8" fill="#fff"/>`;
  return `<svg class="petit petit-alex${cls ? ' ' + cls : ''}" viewBox="0 0 120 120" ${label}>
<ellipse class="p-ombre" cx="60" cy="116" rx="34" ry="3.5" fill="${INK}" opacity=".12"/>
<g class="p-bob">
<path d="M22 118C22 100 38 92 60 92S98 100 98 118Z" fill="#9FE8CB" stroke="#23805E" stroke-width="3" stroke-linejoin="round"/>
<path d="M50 93l10 9 10-9" fill="none" stroke="#23805E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M44 104v8M76 104v8" stroke="#DDF9EE" stroke-width="2.6" stroke-linecap="round"/>
<rect x="53" y="82" width="14" height="13" rx="5" fill="${PEAU}" stroke="${PEAU_T}" stroke-width="2.4"/>
<ellipse cx="27" cy="66" rx="6.5" ry="8" fill="${PEAU}" stroke="${PEAU_T}" stroke-width="2.6"/><ellipse cx="93" cy="66" rx="6.5" ry="8" fill="${PEAU}" stroke="${PEAU_T}" stroke-width="2.6"/>
<path d="M30 60C30 36 43 24 60 24S90 36 90 60C90 80 77 90 60 90S30 80 30 60Z" fill="${PEAU}" stroke="${PEAU_T}" stroke-width="3"/>
<defs><linearGradient id="degrade-alex" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CHEV}" stop-opacity=".95"/><stop offset="1" stop-color="${CHEV_C}" stop-opacity=".15"/></linearGradient></defs>
<path d="M31 62C30 50 31 42 35 36L41 34 37 60ZM89 62C90 50 89 42 85 36L79 34 83 60Z" fill="url(#degrade-alex)"/>
<path d="M32 46C30 30 42 17 60 17C76 17 90 27 88 46C84 40 80 37 76 36L78 30 71 34 70 27 64 33 61 25 56 32 52 26 49 33 43 29 43 37C38 38 34 41 32 46Z" fill="${CHEV}" stroke="${CHEV}" stroke-width="2" stroke-linejoin="round"/>
<path d="M40 28l1-10 6 7M46 24l3-11 5 9M57 21l4-12 5 10M68 23l6-10 2 10M77 28l7-7v10" fill="${CHEV}" stroke="${CHEV}" stroke-width="2" stroke-linejoin="round"/>
<path d="M50 22c4-3 9-4 14-3" fill="none" stroke="#7A5E4E" stroke-width="2" stroke-linecap="round" opacity=".7"/>
${oeilA(47)}${oeilA(73)}
<g fill="rgba(255,255,255,.18)" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"><rect x="35" y="58" width="24" height="20" rx="6"/><rect x="61" y="58" width="24" height="20" rx="6"/></g>
<path d="M59 66q1-2 2 0M35 64l-6-2M85 64l6-2" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<path d="M39 62l5-1M65 62l5-1" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>
<path d="M44 54q4-3 8-1M68 53q4-2 8 1" fill="none" stroke="${CHEV}" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cx="38" cy="81" rx="5" ry="2.8" fill="${ROSE}" opacity=".55"/><ellipse cx="82" cy="81" rx="5" ry="2.8" fill="${ROSE}" opacity=".55"/>
<path d="M53 82q7 6 14 0" fill="none" stroke="#8A3B2E" stroke-width="2.6" stroke-linecap="round"/>
</g></svg>`;
}

function petit(nom, { cls = '', title, humeur = 'content' } = {}) {
  const dessin = (DESSINS[nom] || DESSINS.mochi)(humeur);
  const label = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="petit petit-${DESSINS[nom] ? nom : 'mochi'}${cls ? ' ' + cls : ''}" viewBox="0 0 120 120" ${label}>${dessin}</svg>`;
}

module.exports = { petit, NOMS, eclat, COULEURS: C, alexPortrait };
