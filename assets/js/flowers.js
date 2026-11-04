/*!
 * Flore & Chenilles — moteur d'illustrations
 * Dessine en SVG des fleurs « en fil chenille » : bouquets emballés, petits pots,
 * fleurs nouées, icônes… Aucune dépendance. API exposée : window.FC_FLOWERS
 *
 * Le contour duveteux vient du filtre SVG #fc-fuzz déclaré dans index.html.
 */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Utilitaires
   * ------------------------------------------------------------------ */
  const r1 = (v) => Math.round(v * 10) / 10;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rad = (d) => (d * Math.PI) / 180;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutBack = (t) => {
    const c1 = 1.5, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------------ *
   * Couleurs
   * ------------------------------------------------------------------ */
  function hexToRgb(hex) {
    let h = String(hex).replace('#', '').trim();
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function hslToHex(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue(p, q, h + 1 / 3); g = hue(p, q, h); b = hue(p, q, h - 1 / 3);
    }
    const x = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
    return '#' + x(r) + x(g) + x(b);
  }
  function tone(hex, dl, ds) {
    const hsl = rgbToHsl.apply(null, hexToRgb(hex));
    return hslToHex(hsl[0], clamp(hsl[1] + (ds || 0), 0, 1), clamp(hsl[2] + dl, 0, 1));
  }
  const palCache = {};
  /** Décline une couleur pastel en 4 nuances : base, light, dark, deep. */
  function pal(hex) {
    if (!palCache[hex]) {
      palCache[hex] = { base: hex, light: tone(hex, 0.07), mid: tone(hex, -0.06, 0.02), dark: tone(hex, -0.13, 0.05), deep: tone(hex, -0.28, 0.08) };
    }
    return palCache[hex];
  }

  /* Registre des couleurs nommées (rempli par app.js depuis data.js). */
  const REG = { colors: {}, papers: {}, ribbons: {}, pots: {} };
  function register(o) {
    Object.keys(o || {}).forEach((k) => {
      if (REG[k] && o[k]) Object.assign(REG[k], o[k]);
    });
  }
  function hexOf(group, key, fallback) {
    const e = REG[group] && REG[group][key];
    if (e) return e.hex || e;
    if (typeof key === 'string' && key.charAt(0) === '#') return key;
    return fallback;
  }

  const STEM = pal('#A6C39F');
  const LEAF = pal('#B2CDAE');
  const SAGE = '#B5CDB8';
  const GOLD = '#F5D58C';

  /* ------------------------------------------------------------------ *
   * Formes de base
   * ------------------------------------------------------------------ */
  const petalCache = {};
  /** Pétale « boucle » partant de (0,0) jusqu'à (0,-L), largeur W. */
  function petal(L, W, pointy) {
    const key = L + '|' + W + '|' + (pointy ? 1 : 0);
    if (petalCache[key]) return petalCache[key];
    const c1y = -L * 0.16, c2y = -L * (pointy ? 0.84 : 1.02), c2x = W * (pointy ? 0.45 : 0.98);
    return (petalCache[key] =
      'M0 0C' + r1(-W) + ' ' + r1(c1y) + ' ' + r1(-c2x) + ' ' + r1(c2y) + ' 0 ' + r1(-L) +
      'C' + r1(c2x) + ' ' + r1(c2y) + ' ' + r1(W) + ' ' + r1(c1y) + ' 0 0Z');
  }

  function heart(r, hex) {
    const c = pal(hex || GOLD);
    let s = `<circle r="${r}" fill="${c.base}" stroke="${c.dark}" stroke-width="1.8"/>`;
    for (let i = 0; i < 7; i++) {
      const a = i * 2.39996, rr = r * 0.62 * Math.sqrt((i + 0.5) / 7);
      s += `<circle cx="${r1(rr * Math.cos(a))}" cy="${r1(rr * Math.sin(a))}" r="${r1(r * 0.13)}" fill="${c.deep}" opacity=".55"/>`;
    }
    return s;
  }

  function leafPair(y, spread, L, W) {
    const d = petal(L, W, true);
    const st = `fill="${LEAF.base}" stroke="${LEAF.dark}" stroke-width="1.8" stroke-linejoin="round"`;
    return `<path d="${d}" ${st} transform="translate(0 ${y}) rotate(${180 + spread})"/>` +
      `<path d="${d}" ${st} transform="translate(0 ${y}) rotate(${180 - spread})"/>`;
  }

  /* ------------------------------------------------------------------ *
   * Têtes de fleurs (centrées sur 0,0 ; « haut » = -y ; rayon ≈ 28)
   * ------------------------------------------------------------------ */
  const HEADS = {
    rose(c) {
      let d = '';
      const turns = 3, n = 66, R = 21;
      for (let i = 0; i <= n; i++) {
        const t = i / n, th = t * turns * 2 * Math.PI + 0.5, r = 1.2 + t * (R - 1.2);
        d += (i ? 'L' : 'M') + r1(r * Math.cos(th)) + ' ' + r1(r * Math.sin(th));
      }
      return leafPair(15, 58, 19, 7.5) +
        `<circle r="${R + 3.6}" fill="${c.dark}"/>` +
        `<path d="${d}" fill="none" stroke="${c.base}" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="${d}" fill="none" stroke="${c.light}" stroke-width="1.7" stroke-linecap="round" opacity=".8"/>`;
    },

    tulipe(c) {
      const st = `fill="${c.base}" stroke="${c.dark}" stroke-width="2.3" stroke-linejoin="round"`;
      const hi = `fill="none" stroke="${c.light}" stroke-width="1.5" stroke-linecap="round"`;
      return '<g transform="translate(0 16)">' +
        `<path d="${petal(40, 12.5, true)}" ${st}/>` +
        `<path d="${petal(27, 6, true)}" ${hi} transform="translate(0 -5)"/>` +
        `<path d="${petal(34, 12, true)}" ${st} transform="rotate(-23)"/>` +
        `<path d="${petal(22, 5.5, true)}" ${hi} transform="rotate(-23) translate(0 -5)"/>` +
        `<path d="${petal(34, 12, true)}" ${st} transform="rotate(23)"/>` +
        `<path d="${petal(22, 5.5, true)}" ${hi} transform="rotate(23) translate(0 -5)"/>` +
        '</g>';
    },

    marguerite(c) {
      const d = petal(24, 6, false);
      let s = '';
      for (let i = 0; i < 11; i++) {
        s += `<path d="${d}" transform="rotate(${r1((i * 360) / 11)}) translate(0 -5)" fill="${c.base}" stroke="${c.dark}" stroke-width="1.8" stroke-linejoin="round"/>`;
      }
      return s + heart(8.5);
    },

    cosmos(c) {
      const d = petal(22, 11.5, false), h = petal(13, 4.5, false);
      let s = '';
      for (let i = 0; i < 8; i++) s += `<path d="${d}" transform="rotate(${i * 45 + 22.5}) translate(0 -3)" fill="${c.base}" stroke="${c.dark}" stroke-width="2" stroke-linejoin="round"/>`;
      for (let i = 0; i < 8; i++) s += `<path d="${h}" transform="rotate(${i * 45 + 22.5}) translate(0 -7)" fill="none" stroke="${c.light}" stroke-width="1.3"/>`;
      return s + `<circle r="9.5" fill="${c.deep}" opacity=".5"/>` + heart(6.2);
    },

    hortensia(c) {
      let s = `<circle r="24" fill="${c.dark}"/>`;
      const pts = [];
      for (let i = 0; i < 10; i++) pts.push([21 * Math.cos((i * Math.PI) / 5 + 0.2), 21 * Math.sin((i * Math.PI) / 5 + 0.2)]);
      for (let i = 0; i < 6; i++) pts.push([11.5 * Math.cos((i * Math.PI) / 3 + 0.5), 11.5 * Math.sin((i * Math.PI) / 3 + 0.5)]);
      pts.push([0, 0]);
      const d = petal(7.4, 4.8, false);
      pts.forEach((p, k) => {
        const fill = k % 3 === 0 ? c.light : c.base;
        s += `<g transform="translate(${r1(p[0])} ${r1(p[1])}) rotate(${(k * 29) % 90})">`;
        for (let i = 0; i < 4; i++) s += `<path d="${d}" transform="rotate(${i * 90})" fill="${fill}" stroke="${c.dark}" stroke-width="1.2"/>`;
        s += `<circle r="1.5" fill="${c.deep}"/></g>`;
      });
      return s;
    },

    lavande(c) {
      let s = `<path d="M0 4V-62" stroke="${STEM.dark}" stroke-width="2" stroke-linecap="round"/>`;
      for (let k = 0; k < 9; k++) {
        const y = r1(-6 - k * 6.4), y2 = r1(-9 - k * 6.4), sz = 6 - k * 0.38, rx = r1(sz * 0.62), ry = r1(sz);
        s += `<ellipse cx="-3.4" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(-26 -3.4 ${y})" fill="${k % 2 ? c.base : c.light}" stroke="${c.dark}" stroke-width="1.4"/>`;
        s += `<ellipse cx="3.4" cy="${y2}" rx="${rx}" ry="${ry}" transform="rotate(26 3.4 ${y2})" fill="${k % 2 ? c.light : c.base}" stroke="${c.dark}" stroke-width="1.4"/>`;
      }
      return s + `<ellipse cx="0" cy="-66" rx="2.6" ry="4.2" fill="${c.base}" stroke="${c.dark}" stroke-width="1.4"/>`;
    },

    gypsophile(c) {
      const br = [[-17, -30], [-7, -44], [6, -38], [18, -26], [-1, -22], [11, -50]];
      let s = '';
      br.forEach((b) => {
        s += `<path d="M0 4Q${r1(b[0] * 0.2)} ${r1(b[1] * 0.55)} ${b[0]} ${b[1]}" fill="none" stroke="${STEM.dark}" stroke-width="1.3" stroke-linecap="round"/>`;
      });
      br.forEach((b, i) => {
        for (let j = 0; j < 5; j++) {
          const a = j * 1.2566 + i * 0.7, rr = j ? 4.3 : 0;
          s += `<circle cx="${r1(b[0] + rr * Math.cos(a))}" cy="${r1(b[1] + rr * Math.sin(a))}" r="2.7" fill="${c.base}" stroke="${c.dark}" stroke-width="1"/>`;
        }
      });
      return s;
    },

    eucalyptus(c) {
      let s = `<path d="M0 4Q3 -30 0 -66" fill="none" stroke="${c.deep}" stroke-width="2" stroke-linecap="round"/>`;
      for (let k = 0; k < 7; k++) {
        const y = -4 - k * 9, r = 8.2 - k * 0.65, side = k % 2 ? 1 : -1, cx = side * r * 0.95;
        s += `<circle cx="${r1(cx)}" cy="${r1(y)}" r="${r1(r)}" fill="${k % 3 ? c.base : c.light}" stroke="${c.dark}" stroke-width="1.6"/>`;
        s += `<path d="M${side} ${r1(y + 1)}L${r1(cx + side * r * 0.5)} ${r1(y - 1)}" stroke="${c.light}" stroke-width="1" stroke-linecap="round"/>`;
      }
      return s;
    }
  };

  const isPale = (hex) => rgbToHsl.apply(null, hexToRgb(hex))[2] > 0.9;

  Object.assign(HEADS, {
    /* Lys : six pétales pointus en étoile, étamines. */
    lys(c) {
      const back = petal(29, 8.5, true), front = petal(30, 9, true), vein = petal(19, 2.6, true);
      let s = '';
      for (let i = 0; i < 3; i++) s += `<path d="${back}" transform="rotate(${i * 120 + 60})" fill="${c.mid}" stroke="${c.dark}" stroke-width="2" stroke-linejoin="round"/>`;
      for (let i = 0; i < 3; i++) {
        s += `<path d="${front}" transform="rotate(${i * 120})" fill="${c.base}" stroke="${c.dark}" stroke-width="2.1" stroke-linejoin="round"/>`;
        s += `<path d="${vein}" transform="rotate(${i * 120}) translate(0 -4)" fill="none" stroke="${c.light}" stroke-width="1.4"/>`;
      }
      for (let i = 0; i < 6; i++) {
        const a = rad(i * 60 + 30), x = r1(Math.sin(a) * 15), y = r1(-Math.cos(a) * 15);
        s += `<path d="M0 0L${x} ${y}" stroke="#EDE3C4" stroke-width="1.3" stroke-linecap="round"/>`;
        s += `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.5" transform="rotate(${i * 60 + 30} ${x} ${y})" fill="#C98A4E"/>`;
      }
      return s + '<circle r="3.2" fill="#DCE6B9" stroke="#B9C795" stroke-width="1"/>';
    },

    /* Arum : un cornet élégant et son pistil doré. */
    arum(c) {
      return `<path d="M-1 27C-15 16 -21 -6 -10 -22C-4 -31 11 -32 19 -23C10 -21 5 -12 6 2C6 13 4 21 -1 27Z" fill="${c.base}" stroke="${c.dark}" stroke-width="2.3" stroke-linejoin="round"/>` +
        `<path d="M-7 -19C-1 -27 10 -27 16 -22C9 -19 5 -12 5 -2C2 -9 -2 -15 -7 -19Z" fill="${c.mid}"/>` +
        '<path d="M2 6L6 -15" stroke="#E7B94C" stroke-width="6.5" stroke-linecap="round"/>' +
        '<path d="M2 6L6 -15" stroke="#F4D57A" stroke-width="3.6" stroke-linecap="round"/>' +
        `<path d="M-10 18C-15 6 -15 -7 -8 -16" fill="none" stroke="${c.light}" stroke-width="1.6" stroke-linecap="round"/>`;
    },

    /* Pavot : quatre grands pétales ronds, cœur sombre. */
    pavot(c) {
      const big = petal(22, 15, false), small = petal(19, 13, false);
      let s = '';
      for (let i = 0; i < 4; i++) s += `<path d="${big}" transform="rotate(${i * 90 + 45})" fill="${c.mid}" stroke="${c.dark}" stroke-width="2" stroke-linejoin="round"/>`;
      for (let i = 0; i < 4; i++) {
        s += `<path d="${small}" transform="rotate(${i * 90})" fill="${c.base}" stroke="${c.dark}" stroke-width="2" stroke-linejoin="round"/>`;
        s += `<path d="${petal(11, 5, false)}" transform="rotate(${i * 90}) translate(0 -6)" fill="none" stroke="${c.light}" stroke-width="1.3"/>`;
      }
      s += '<circle r="8" fill="#3F3448"/>';
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        s += `<circle cx="${r1(Math.cos(a) * 9.4)}" cy="${r1(Math.sin(a) * 9.4)}" r="1.6" fill="#2F2836"/>`;
      }
      return s + '<circle r="3.4" fill="#BFCB9C"/>';
    },

    /* Gerbera : deux couronnes de fins pétales. */
    gerbera(c) {
      const outer = petal(22, 4.4, false), inner = petal(14, 3.6, false);
      let s = '';
      for (let i = 0; i < 20; i++) s += `<path d="${outer}" transform="rotate(${r1(i * 18)}) translate(0 -5)" fill="${c.base}" stroke="${c.dark}" stroke-width="1.3" stroke-linejoin="round"/>`;
      for (let i = 0; i < 16; i++) s += `<path d="${inner}" transform="rotate(${r1(i * 22.5 + 11)}) translate(0 -4)" fill="${c.light}" stroke="${c.dark}" stroke-width="1"/>`;
      return s + `<circle r="7.5" fill="${c.dark}"/>` + heart(4.8, '#F1E2A6');
    },

    /* Tournesol : pétales jaunes, grand cœur brun. */
    tournesol(c) {
      const outer = petal(22, 6.5, true), inner = petal(18, 6, true);
      let s = '';
      for (let i = 0; i < 16; i++) s += `<path d="${outer}" transform="rotate(${r1(i * 22.5)}) translate(0 -9)" fill="${c.base}" stroke="${c.dark}" stroke-width="1.6" stroke-linejoin="round"/>`;
      for (let i = 0; i < 16; i++) s += `<path d="${inner}" transform="rotate(${r1(i * 22.5 + 11.25)}) translate(0 -8)" fill="${c.light}" stroke="${c.dark}" stroke-width="1.2" stroke-linejoin="round"/>`;
      s += '<circle r="12.5" fill="#6E4A2C" stroke="#4E331E" stroke-width="2"/>';
      for (let i = 0; i < 24; i++) {
        const a = i * 2.39996, rr = 10.5 * Math.sqrt((i + 0.5) / 24);
        s += `<circle cx="${r1(rr * Math.cos(a))}" cy="${r1(rr * Math.sin(a))}" r="1.3" fill="#8F6842"/>`;
      }
      return s;
    },

    /* Jonquille : six pétales et une couronne froncée. */
    jonquille(c) {
      const p6 = petal(22, 9, true);
      const cor = pal(isPale(c.base) ? '#F4CF67' : tone(c.base, -0.06, 0.18));
      let s = '';
      for (let i = 0; i < 6; i++) {
        s += `<path d="${p6}" transform="rotate(${i * 60})" fill="${c.base}" stroke="${c.dark}" stroke-width="1.8" stroke-linejoin="round"/>`;
        s += `<path d="${petal(13, 2.6, true)}" transform="rotate(${i * 60}) translate(0 -5)" fill="none" stroke="${c.light}" stroke-width="1.2"/>`;
      }
      let d = '';
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2, rr = 9.5 + (i % 2 ? 1.5 : 0);
        d += (i ? 'L' : 'M') + r1(Math.cos(a) * rr) + ' ' + r1(Math.sin(a) * rr);
      }
      return s + `<path d="${d}Z" fill="${cor.base}" stroke="${cor.dark}" stroke-width="1.6" stroke-linejoin="round"/>` +
        `<circle r="5.6" fill="${cor.dark}" opacity=".5"/><circle r="2.2" fill="#ECE4B2"/>`;
    }
  });

  /* Métadonnées : « focal » = fleur principale, « filler » = brin/feuillage. */
  const TYPES = {
    rose: { kind: 'focal', size: 1 },
    tulipe: { kind: 'focal', size: 1 },
    marguerite: { kind: 'focal', size: 1 },
    cosmos: { kind: 'focal', size: 1 },
    hortensia: { kind: 'focal', size: 1.05 },
    lavande: { kind: 'filler', size: 1 },
    gypsophile: { kind: 'filler', size: 1 },
    eucalyptus: { kind: 'filler', size: 1, fixed: SAGE },
    lys: { kind: 'focal', size: 1.12 },
    arum: { kind: 'focal', size: 1 },
    pavot: { kind: 'focal', size: 1 },
    gerbera: { kind: 'focal', size: 1 },
    tournesol: { kind: 'focal', size: 1.08, fixed: '#F5C451' },
    jonquille: { kind: 'focal', size: 0.98 }
  };
  const kindOf = (t) => (TYPES[t] ? TYPES[t].kind : 'focal');

  function headSVG(type, hex) {
    const T = TYPES[type] || TYPES.rose;
    return (HEADS[type] || HEADS.rose)(pal(T.fixed || hex || '#F3C4CF'));
  }

  /* ------------------------------------------------------------------ *
   * Mise en place du bouquet
   * ------------------------------------------------------------------ */
  const GEO = {
    paper: { B: { x: 200, y: 345 }, C: { x: 200, y: 208 } },
    pot: { B: { x: 200, y: 352 }, C: { x: 200, y: 220 } },
    none: { B: { x: 200, y: 360 }, C: { x: 200, y: 214 } },
    bocal: { B: { x: 200, y: 424 }, C: { x: 200, y: 322 } }
  };
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  const FILLER_ANGLES = [-16, 20, -34, 38, 2, -48, 50, -25, 29, -42, 44, -7, 11, -30, 34];

  /**
   * Calcule, pour chaque fleur, l'angle (a) et la longueur (L) de sa tige depuis
   * le point de liage B, ainsi que la rotation/échelle de la tête.
   * Les places sont stables : ajouter une fleur ne bouscule pas les autres.
   */
  function layout(items, container) {
    const g = GEO[container] || GEO.paper, B = g.B, C = g.C;
    const focal = [], fill = [];
    items.forEach((it) => (kindOf(it.type) === 'focal' ? focal : fill).push(it));
    const nF = focal.length;
    const res = [];
    focal.forEach((it, i) => {
      const r = nF === 1 ? 0 : 24 * Math.sqrt(i + 0.45), th = i * GOLDEN + 0.9;
      const x = C.x + r * Math.cos(th), y = C.y + r * Math.sin(th) * 0.68 - (nF === 1 ? 6 : 0);
      const dx = x - B.x, dy = B.y - y;
      const a = (Math.atan2(dx, dy) * 180) / Math.PI, L = Math.hypot(dx, dy);
      const depth = clamp((y - (C.y - 75)) / 150, 0, 1);
      const solo = nF === 1 && items.length === 1 ? (container === 'none' ? 1.5 : 1.22) : 1;
      res.push({ it, a, L, rot: a * 0.55, s: solo * TYPES[it.type].size * (0.9 + 0.16 * depth), z: y });
    });
    const fr = nF ? 24 * Math.sqrt(nF - 0.55) : 0;
    const spread = 0.6 + 0.4 * Math.min(1, nF / 10);
    fill.forEach((it, j) => {
      const base = FILLER_ANGLES[j % FILLER_ANGLES.length];
      const a = base * spread;
      const L = ((B.y - C.y) * 0.9 + fr * 0.6 + (j % 3) * 8) * (1 - (0.25 * Math.abs(a)) / 50) * (container === 'bocal' ? 0.6 : 1);
      res.push({ it, a, L, rot: a, s: 0.98, z: -1000 + j });
    });
    return res;
  }
  const headPos = (B, a, L) => ({ x: B.x + L * Math.sin(rad(a)), y: B.y - L * Math.cos(rad(a)) });
  const paperScale = (n) => 0.5 + 0.5 * Math.min(1, n / 14);

  /* ------------------------------------------------------------------ *
   * Contenants : pochette transparente et nœud, pot, bocal, carte de vœux
   * ------------------------------------------------------------------ */
  /* La pochette est dessinée dans le repère du bouquet : liage B = (200, 345),
     col de la pochette en y = 375, là où se place le nœud. */
  const FILM = 'fill="#FFFFFF" stroke="#FFFFFF" stroke-linejoin="round" stroke-width="2.2"';
  const FILM_EDGE = 'fill="none" stroke="#8EA3B8" stroke-opacity=".38" stroke-width="1" stroke-linejoin="round"';
  const glint = (w, o) => `fill="none" stroke="#FFFFFF" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"`;
  const POUCH_BACK = 'M187 377L58 198L90 176L112 190L138 150L166 176L200 134L234 176L262 150L288 190L310 176L342 198L213 377Z';
  const POUCH_FRONT = 'M124 284L143 297L160 290L179 303L200 296L221 303L240 290L257 297L276 284L213 377L187 377Z';
  const POUCH_SKIRT = 'M188 380C182 404 170 432 159 470Q170 463 179 471Q190 463 200 473Q210 463 221 471Q230 463 241 470C230 432 218 404 212 380Z';
  /** Fond de la pochette transparente (derrière les tiges). */
  function pouchBack() {
    return `<path d="${POUCH_BACK}" ${FILM} fill-opacity=".34" stroke-opacity=".95"/>` +
      `<path d="${POUCH_BACK}" ${FILM_EDGE}/>` +
      `<path d="M92 180L189 368M140 154L194 366M260 154L206 366M308 180L211 368" ${glint(2.4, 0.55)}/>` +
      '<path d="M200 140V364" fill="none" stroke="#9FB4C8" stroke-opacity=".22" stroke-width="1.2"/>';
  }
  /** Devant de la pochette et petite jupe sous le nœud (les tiges restent visibles). */
  function pouchFront() {
    return `<path d="${POUCH_FRONT}" ${FILM} fill-opacity=".3" stroke-opacity=".95"/>` +
      `<path d="${POUCH_FRONT}" ${FILM_EDGE}/>` +
      `<path d="M238 298L210 370" ${glint(4, 0.7)}/><path d="M156 296L191 368" ${glint(2, 0.45)}/>` +
      `<path d="${POUCH_SKIRT}" ${FILM} fill-opacity=".36" stroke-opacity=".95"/>` +
      `<path d="${POUCH_SKIRT}" ${FILM_EDGE}/>` +
      `<path d="M205 388Q213 420 225 460" ${glint(3, 0.6)}/>`;
  }
  /** Extrémité basse d'une tige, visible à travers la pochette (h : tête, k : échelle, v : variation). */
  const tailPos = (B, h, k, v) => ({ x: r1(B.x - (h.x - B.x) * 0.15), y: r1(B.y + (112 - (v % 3) * 5) * k) });

  /** Nœud de ruban centré en (0,0) ; sans la bande qui fait le tour si noBand. */
  function bowInner(p, noBand) {
    const st = 'stroke-width="1.4" stroke-linejoin="round"';
    return (noBand ? '' : `<path stroke="${p.base}" fill="none" stroke-width="7" stroke-linecap="round" d="M-62 -6Q0 10 62 -10"/>` +
      `<path stroke="${p.light}" fill="none" stroke-width="1.6" stroke-linecap="round" opacity=".9" d="M-60 -8Q0 7 60 -12"/>`) +
      `<path fill="${p.dark}" d="M-2 2L-20 46L-12 42L-8 52L4 4Z"/>` +
      `<path fill="${p.base}" stroke="${p.dark}" ${st} d="M2 2L22 44L13 41L10 51L-4 4Z"/>` +
      `<path fill="${p.base}" stroke="${p.dark}" ${st} d="M0 0C-12 -20 -36 -16 -32 -2C-29 9 -12 8 0 0Z"/>` +
      `<path fill="${p.base}" stroke="${p.dark}" ${st} d="M0 0C12 -20 36 -16 32 -2C29 9 12 8 0 0Z"/>` +
      `<path stroke="${p.light}" fill="none" stroke-width="1.6" stroke-linecap="round" d="M-6 -3C-14 -10 -24 -9 -26 -3"/>` +
      `<path stroke="${p.light}" fill="none" stroke-width="1.6" stroke-linecap="round" d="M6 -3C14 -10 24 -9 26 -3"/>` +
      `<ellipse rx="6.5" ry="5.5" fill="${p.base}" stroke="${p.dark}" stroke-width="1.4"/>`;
  }
  /* Le nœud de la pochette : rose tendre, avec deux rubans frisés. */
  const BOW = pal('#EDB3C7');
  function pouchBow() {
    const curl = (x, s) => `<path d="M${x} 5c${4 * s} 10 ${-6 * s} 15 ${-s} 25c${5 * s} 10 ${-5 * s} 16 ${s} 26c${5 * s} 9 ${-2 * s} 15 ${2 * s} 21" fill="none" stroke="${BOW.mid}" stroke-width="2" stroke-linecap="round"/>`;
    return curl(-5, 1) + curl(6, -1) + bowInner(BOW, true);
  }
  function potSVG(p) {
    return `<path d="M140 364L260 364L247 468Q200 482 153 468Z" fill="${p.base}" stroke="${p.dark}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M151 372L166 372L172 469Q162 467 156 465Z" fill="${p.light}" opacity=".75"/>` +
      `<rect x="128" y="346" width="144" height="24" rx="11" fill="${p.base}" stroke="${p.dark}" stroke-width="1.6"/>` +
      `<rect x="138" y="351" width="58" height="5" rx="2.5" fill="${p.light}" opacity=".85"/>`;
  }
  /** Fond du bocal (ombre et mousse) puis bocal transparent avec son couvercle, dessiné par-dessus les fleurs. */
  function bocalBase() {
    return '<ellipse cx="200" cy="448" rx="112" ry="10" fill="#4A2C3D" opacity=".08"/>' +
      '<path d="M104 300V430Q104 442 116 442H284Q296 442 296 430V300Z" fill="#FFFFFF" fill-opacity=".1"/>' +
      '<ellipse cx="200" cy="428" rx="82" ry="11" fill="#A9BE95"/>' +
      '<ellipse cx="186" cy="425" rx="40" ry="5" fill="#BFD0AC" opacity=".8"/>';
  }
  function bocalJar() {
    const body = 'M116 442Q104 442 104 430V238Q104 210 134 201L148 197V184H252V197L266 201Q296 210 296 238V430Q296 442 284 442Z';
    return `<path d="${body}" fill="#FFFFFF" fill-opacity=".14" stroke="#FFFFFF" stroke-opacity=".95" stroke-width="2.6" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="none" stroke="#8FA2B6" stroke-opacity=".3" stroke-width="1.1" stroke-linejoin="round"/>` +
      '<path d="M122 418V248Q122 228 140 220" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M280 330V258" fill="none" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="140" y="160" width="120" height="28" rx="8" fill="#D9BE9C" stroke="#BE9F7B" stroke-width="1.6"/>' +
      '<rect x="140" y="170" width="120" height="4" fill="#C8AA86" opacity=".7"/>' +
      '<rect x="150" y="164" width="44" height="4" rx="2" fill="#F1DFC6" opacity=".9"/>';
  }

  function wrapText(txt, max, lines) {
    const words = String(txt).trim().split(/\s+/).filter(Boolean);
    const out = [];
    let cur = '';
    words.forEach((w) => {
      while (w.length > max) {
        if (cur) { out.push(cur); cur = ''; }
        out.push(w.slice(0, max)); w = w.slice(max);
      }
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
      else { out.push(cur); cur = w; }
    });
    if (cur) out.push(cur);
    if (out.length > lines) {
      out.length = lines;
      out[lines - 1] = out[lines - 1].replace(/.{0,1}$/, '') + '…';
    }
    return out;
  }
  const clip = (t, n) => (t.length > n ? t.slice(0, n - 1) + '…' : t);
  /* Carte de vœux : { to, msg, from } (ou un simple texte). */
  function cardParts(card) {
    if (!card || typeof card !== 'object') card = { msg: card };
    const to = String(card.to || '').trim(), msg = String(card.msg || '').trim(), from = String(card.from || '').trim();
    const lines = msg ? wrapText(msg, 19, 4) : [];
    const h = 24 + (to ? 16 : 0) + lines.length * 14.5 + (from ? 18 : 0) + 6;
    return { to, from, lines, h: Math.max(58, h), empty: !to && !msg && !from };
  }
  const CARD_W = 132, CARD_DX = 90, CARD_DY = 18;
  /** Petite carte de vœux accrochée au nœud (bx, by). */
  function cardSVG(card, bx, by) {
    const c = cardParts(card);
    if (c.empty) return '';
    const W = CARD_W, tx = bx + CARD_DX, ty = by + CARD_DY;
    let y = 24, txt = '';
    if (c.to) { txt += `<text x="${-W / 2 + 14}" y="${y}" font-size="10.5" fill="#A24E74">${esc(clip(c.to, 22) + (/[,!.?:]$/.test(c.to) ? '' : ','))}</text>`; y += 16; }
    c.lines.forEach((ln) => { txt += `<text x="0" y="${r1(y)}" text-anchor="middle">${esc(ln)}</text>`; y += 14.5; });
    if (c.from) txt += `<text x="${W / 2 - 14}" y="${r1(y + 3)}" text-anchor="end" font-size="10.5" fill="#A24E74">${esc('— ' + clip(c.from, 20))}</text>`;
    const hx = -W / 2 + 13, hy = 11;
    const ax = r1(tx + hx * Math.cos(rad(7)) - hy * Math.sin(rad(7))), ay = r1(ty + hx * Math.sin(rad(7)) + hy * Math.cos(rad(7)));
    const flower = [0, 72, 144, 216, 288].map((a) => `<circle cx="${r1(W / 2 - 15 + 3.2 * Math.sin(rad(a)))}" cy="${r1(13 - 3.2 * Math.cos(rad(a)))}" r="2.5" fill="#F3C4CF"/>`).join('');
    return `<path d="M${bx + 4} ${by + 4}Q${bx + 16} ${by + 28} ${ax} ${ay}" fill="none" stroke="#C9B6A8" stroke-width="1.1"/>` +
      `<g class="fc-card" transform="translate(${tx} ${ty}) rotate(7)">` +
      `<rect x="${-W / 2}" y="0" width="${W}" height="${r1(c.h)}" rx="7" fill="#FFFDF9" stroke="#E7D6CE" stroke-width="1.2"/>` +
      `<rect x="${-W / 2 + 5}" y="5" width="${W - 10}" height="${r1(c.h - 10)}" rx="4" fill="none" stroke="#F0C3D2" stroke-width="1.1" stroke-dasharray="1 4" stroke-linecap="round"/>` +
      `<circle cx="${hx}" cy="${hy}" r="2.6" fill="#FFFDF9" stroke="#D8C8BC" stroke-width="1.2"/>` +
      flower + `<circle cx="${W / 2 - 15}" cy="13" r="1.8" fill="${GOLD}"/>` +
      `<g font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11.5" fill="#5E4A5A">${txt}</g>` +
      '</g>';
  }

  /** Petite chenille mascotte (groupe SVG) posée en (x, y). */
  function mascot(x, y, sc) {
    const cols = ['#C6E6D3', '#D9CBF0', '#F3C4CF', '#F8CDB5'];
    let s = `<g transform="translate(${x} ${y}) scale(${sc || 1})">`;
    cols.forEach((c, i) => {
      s += `<circle cx="${i * 11}" cy="${i % 2 ? -1.5 : 0}" r="${6.4 + i * 0.4}" fill="${c}" stroke="${tone(c, -0.13, 0.05)}" stroke-width="1.3"/>`;
    });
    s += '<g transform="translate(46 -4)">' +
      `<circle r="8.6" fill="#F3C4CF" stroke="${tone('#F3C4CF', -0.13, 0.05)}" stroke-width="1.3"/>` +
      '<circle cx="3.2" cy="-1.4" r="1.5" fill="#4B3A48"/>' +
      '<circle cx="3" cy="3.4" r="1.9" fill="#EBA7BC" opacity=".8"/>' +
      '<path d="M-2 -8Q-4 -15 -8 -16M3 -8Q5 -15 9 -16" fill="none" stroke="#6E5A6A" stroke-width="1.1" stroke-linecap="round"/>' +
      '<circle cx="-8" cy="-16" r="1.5" fill="#6E5A6A"/><circle cx="9" cy="-16" r="1.5" fill="#6E5A6A"/>' +
      '</g></g>';
    return s;
  }

  /* ------------------------------------------------------------------ *
   * Rendu statique d'un bouquet → chaîne <svg>
   * cfg : { flowers:[[type, couleur], …], container:'paper'|'pot'|'none',
   *         paper, ribbon, pot, message }
   * opt : { fit, aspect, pad, animate, tag, mascot, label, viewBox }
   * ------------------------------------------------------------------ */
  function normalize(cfg) {
    return (cfg.flowers || []).map((fl, i) => {
      const type = Array.isArray(fl) ? fl[0] : fl.type;
      const col = Array.isArray(fl) ? fl[1] : fl.color;
      return { id: fl.id != null ? fl.id : i, type: HEADS[type] ? type : 'rose', hex: hexOf('colors', col, '#F3C4CF') };
    });
  }

  function bouquetSVG(cfg, opt) {
    opt = opt || {};
    cfg = cfg || {};
    const container = GEO[cfg.container] ? cfg.container : 'paper';
    const B = GEO[container].B;
    const items = normalize(cfg);
    const lay = layout(items, container).sort((p, q) => p.z - q.z);
    const k = container === 'paper' ? paperScale(items.length) : 1;
    const anim = !!opt.animate;
    const kT = `translate(${B.x} ${B.y}) scale(${k.toFixed(3)}) translate(${-B.x} ${-B.y})`;

    let stemD = '', stemAnim = '', heads = '';
    lay.forEach((l, idx) => {
      const h = headPos(B, l.a, l.L);
      let d = `M${B.x} ${B.y}L${r1(h.x)} ${r1(h.y)}`;
      if (container === 'paper') {
        const t = tailPos(B, h, k, idx);
        d = `M${t.x} ${t.y}L${B.x} ${B.y}L${r1(h.x)} ${r1(h.y)}`;
      } else if (container === 'none') {
        const ex = B.x - (h.x - B.x) * 0.22, ey = items.length === 1 ? B.y + 84 : 484 - (idx % 3) * 3;
        d = `M${r1(h.x)} ${r1(h.y)}L${B.x} ${B.y}L${r1(ex)} ${ey}`;
      }
      const delay = 0.45 + idx * 0.07;
      if (anim) stemAnim += `<path class="fc-grow" pathLength="1" style="--d:${r1(delay - 0.3)}s" d="${d}"/>`;
      else stemD += d;
      heads += `<g transform="translate(${r1(h.x)} ${r1(h.y)}) rotate(${r1(l.rot)}) scale(${(Math.round(l.s * 100) / 100)})">` +
        (anim ? `<g class="fc-bloom" style="--d:${r1(delay)}s">` : '') +
        headSVG(l.it.type, l.it.hex) +
        (anim ? '</g>' : '') + '</g>';
    });

    const rp = pal(hexOf('ribbons', cfg.ribbon, '#E6A4B6'));
    let s = '';
    if (container === 'paper') s += `<g class="fc-paper" transform="${kT}">${pouchBack()}</g>`;
    if (container === 'bocal') s += bocalBase();

    let stems = anim
      ? `<g stroke="${STEM.dark}" stroke-width="4.6">${stemAnim}</g><g stroke="${STEM.base}" stroke-width="3">${stemAnim}</g>`
      : (stemD ? `<path d="${stemD}" stroke="${STEM.dark}" stroke-width="4.6"/><path d="${stemD}" stroke="${STEM.base}" stroke-width="3"/>` : '');
    if (container === 'none' && items.length) {
      const lf = items.length === 1 ? petal(58, 10, true) : petal(78, 11, true), st = `fill="${LEAF.base}" stroke="${LEAF.dark}" stroke-width="1.8"`;
      stems += `<path d="${lf}" ${st} transform="translate(${B.x - 3} ${B.y + 10}) rotate(-30)"/>` +
        `<path d="${lf}" ${st} transform="translate(${B.x + 3} ${B.y + 10}) rotate(26)"/>`;
    }
    s += `<g class="fc-stems" filter="url(#fc-fuzz)" fill="none" stroke-linecap="round" stroke-linejoin="round">${stems}</g>`;

    if (container === 'paper') s += `<g class="fc-paper" transform="${kT}">${pouchFront()}</g>`;
    if (container === 'pot') s += potSVG(pal(hexOf('pots', cfg.pot, '#EDC3AE')));
    s += `<g class="fc-heads" filter="url(#fc-fuzz)">${heads}</g>`;
    if (container === 'bocal') s += bocalJar();

    const bowY = container === 'paper' ? B.y + 30 * k : B.y;
    if (container !== 'pot' && container !== 'bocal' && items.length) {
      s += `<g transform="translate(${B.x} ${r1(bowY)}) scale(${(container === 'none' ? 0.62 : k).toFixed(3)})"><g class="fc-bow">${container === 'none' ? bowInner(rp, true) : pouchBow()}</g></g>`;
    }
    if (opt.mascot && container === 'paper') s += `<g class="fc-mascot">${mascot(B.x + 18 * k, B.y - 46 * k, 0.7)}</g>`;
    if (opt.tag && (cfg.card || cfg.message)) s += cardSVG(cfg.card || cfg.message, B.x, bowY);

    let vb = opt.viewBox || '0 20 400 490';
    if (opt.fit) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const add = (x, y, r) => {
        x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r);
        x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r);
      };
      lay.forEach((l) => {
        const h = headPos(B, l.a, l.L);
        add(h.x, h.y, 30 * l.s);
        if (kindOf(l.it.type) === 'filler') { const t = headPos(h, l.a, 68); add(t.x, t.y, 12); }
      });
      if (container === 'paper') {
        add(B.x + (56 - 200) * k, B.y + (132 - 345) * k, 0);
        add(B.x + (344 - 200) * k, B.y + (482 - 345) * k, 0);
      } else if (container === 'pot') {
        add(128, 346, 0); add(272, 482, 0);
      } else if (container === 'bocal') {
        add(96, 150, 0); add(304, 458, 0);
      } else {
        add(B.x, items.length === 1 ? B.y + 90 : 488, 0); add(B.x - 40, B.y, 0); add(B.x + 40, B.y, 0);
      }
      if (opt.tag && (cfg.card || cfg.message)) {
        const c = cardParts(cfg.card || cfg.message);
        if (!c.empty) add(B.x + CARD_DX + CARD_W / 2 + 10, bowY + CARD_DY + c.h + 10, 0);
      }
      const pad = opt.pad != null ? opt.pad : 16;
      x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
      let w = x1 - x0, h = y1 - y0;
      if (opt.aspect) {
        if (w / h < opt.aspect) { const nw = h * opt.aspect; x0 -= (nw - w) / 2; w = nw; }
        else { const nh = w / opt.aspect; y0 -= nh - h; h = nh; }
      }
      vb = `${r1(x0)} ${r1(y0)} ${r1(w)} ${r1(h)}`;
    }
    return `<svg class="fc-svg${anim ? ' fc-anim' : ''}${anim && opt.gentle ? ' fc-gentle' : ''}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(opt.label || 'Illustration de bouquet')}">${s}</svg>`;
  }

  /* ------------------------------------------------------------------ *
   * Icône d'une fleur seule (sélecteur, panier…)
   * ------------------------------------------------------------------ */
  function flowerIconSVG(type, hex) {
    const filler = kindOf(type) === 'filler';
    const vb = filler ? '-38 -74 76 80' : '-34 -34 68 68';
    return `<svg class="fc-icon" viewBox="${vb}" aria-hidden="true" focusable="false"><g filter="url(#fc-fuzz)">${headSVG(type, hex)}</g></svg>`;
  }

  /* ------------------------------------------------------------------ *
   * Illustrations décoratives
   * ------------------------------------------------------------------ */
  /** L'atelier : un bocal de fils chenille, quelques fleurs terminées. */
  function atelierSVG() {
    const cols = ['#EBA7BC', '#F3C4CF', '#D9CBF0', '#BBA9E2', '#C9DDF2', '#C6E6D3', '#F7E6B0', '#F8CDB5'];
    const angs = [-30, -21, -12, -4, 4, 12, 21, 30];
    let sticks = '', tops = '';
    cols.forEach((hex, i) => {
      const c = pal(hex), L = 176 + ((i * 5) % 3) * 22;
      const x0 = 150 + i * 6, y0 = 440, a = rad(angs[i]);
      const x1 = x0 + L * Math.sin(a), y1 = y0 - L * Math.cos(a);
      const mx = (x0 + x1) / 2 + (i % 2 ? 10 : -10), my = (y0 + y1) / 2;
      const d = `M${r1(x0)} ${y0}Q${r1(mx)} ${r1(my)} ${r1(x1)} ${r1(y1)}`;
      sticks += `<path d="${d}" stroke="${c.dark}" stroke-width="12"/><path d="${d}" stroke="${c.base}" stroke-width="9"/><path d="${d}" stroke="${c.light}" stroke-width="2.4" opacity=".9"/>`;
      if (i === 1) tops += `<g transform="translate(${r1(x1)} ${r1(y1 - 6)}) rotate(${angs[i] * 0.6}) scale(1.05)">${HEADS.tulipe(pal('#F3C4CF'))}</g>`;
      if (i === 4) tops += `<g transform="translate(${r1(x1)} ${r1(y1 - 4)}) rotate(${angs[i] * 0.6}) scale(1.1)">${HEADS.marguerite(pal('#FBF6F1'))}</g>`;
      if (i === 6) tops += `<g transform="translate(${r1(x1)} ${r1(y1 - 4)}) rotate(${angs[i] * 0.6})">${HEADS.cosmos(pal('#D9CBF0'))}</g>`;
    });
    const jar = '<path d="M118 318h104l-4 124q-48 14-96 0z" fill="#fff" fill-opacity=".4" stroke="#fff" stroke-width="2.5" stroke-opacity=".95"/>' +
      '<rect x="112" y="306" width="116" height="16" rx="8" fill="#fff" fill-opacity=".6" stroke="#fff" stroke-width="2"/>' +
      '<path d="M134 338v88" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>' +
      '<path d="M146 338v30" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>';
    const tulip = `<g transform="translate(262 400) rotate(-62)"><path d="M0 14V128" stroke="${STEM.dark}" stroke-width="4.6" stroke-linecap="round"/><path d="M0 14V128" stroke="${STEM.base}" stroke-width="3" stroke-linecap="round"/><path d="${petal(42, 9, true)}" transform="translate(0 92) rotate(28)" fill="${LEAF.base}" stroke="${LEAF.dark}" stroke-width="1.8"/>${HEADS.tulipe(pal('#D9CBF0'))}</g>`;
    const rose = `<g transform="translate(330 452) scale(.82)">${HEADS.rose(pal('#F8CDB5'))}</g>`;
    const daisy = `<g transform="translate(118 452) rotate(74)"><path d="M0 12V104" stroke="${STEM.dark}" stroke-width="4.6" stroke-linecap="round"/><path d="M0 12V104" stroke="${STEM.base}" stroke-width="3" stroke-linecap="round"/><g transform="scale(.82)">${HEADS.marguerite(pal('#FBF6F1'))}</g></g>`;
    return '<svg class="fc-svg" viewBox="20 120 360 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fils chenille et fleurs en cours de création">' +
      '<ellipse cx="200" cy="470" rx="170" ry="16" fill="#4B3A48" opacity=".06"/>' +
      `<g filter="url(#fc-fuzz)" fill="none" stroke-linecap="round">${sticks}</g>` +
      `<g filter="url(#fc-fuzz)">${tops}</g>` + jar +
      `<g filter="url(#fc-fuzz)">${daisy}${tulip}${rose}${mascot(36, 470, 0.72)}</g>` +
      '</svg>';
  }

  function giftcardSVG() {
    const a = pal('#F6DCE1'), b = pal('#DCEDE2');
    return '<svg class="fc-svg" viewBox="40 60 320 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carte cadeau Flore &amp; Chenilles">' +
      '<ellipse cx="200" cy="350" rx="130" ry="12" fill="#4B3A48" opacity=".06"/>' +
      `<g transform="rotate(7 200 220)"><rect x="76" y="138" width="250" height="160" rx="18" fill="${b.base}" stroke="${b.dark}" stroke-width="1.6"/></g>` +
      `<g transform="rotate(-7 200 220)"><rect x="70" y="128" width="260" height="166" rx="18" fill="${a.base}" stroke="${a.dark}" stroke-width="1.6"/>` +
      '<rect x="84" y="142" width="232" height="138" rx="12" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/>' +
      '<text x="200" y="214" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="31" fill="#4B3A48">Carte cadeau</text>' +
      '<text x="200" y="244" text-anchor="middle" font-family="Jost, Arial, sans-serif" font-size="11" letter-spacing="3.5" fill="#6E5A6A">FLORE &amp; CHENILLES</text>' +
      `<g filter="url(#fc-fuzz)"><g transform="translate(96 150) scale(.8)">${HEADS.cosmos(pal('#D9CBF0'))}</g><g transform="translate(306 272) scale(.7)">${HEADS.rose(pal('#F8CDB5'))}</g></g></g>` +
      `<g transform="translate(286 132) rotate(14) scale(.8)">${bowInner(pal('#E6A4B6'), true)}</g>` +
      '</svg>';
  }

  function butterflySVG(hex) {
    const c = pal(hex || '#D9CBF0');
    const wing = `<path d="M-1 -2C-12 -24 -31 -18 -26 -4C-22 4 -10 4 -1 -2Z" fill="${c.base}" stroke="${c.dark}" stroke-width="1.4"/>` +
      `<path d="M-1 2C-13 4 -21 17 -12 20C-6 21 -2 12 -1 2Z" fill="${c.light}" stroke="${c.dark}" stroke-width="1.4"/>`;
    return '<svg class="fc-butterfly" viewBox="-32 -28 64 54" aria-hidden="true" focusable="false">' +
      `<g class="bf-wing bf-l">${wing}</g><g class="bf-wing bf-r"><g transform="scale(-1 1)">${wing}</g></g>` +
      '<path d="M0 -9V13" stroke="#6E5A6A" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M0 -9Q-3 -17 -7 -19M0 -9Q3 -17 7 -19" fill="none" stroke="#6E5A6A" stroke-width="1" stroke-linecap="round"/>' +
      '</svg>';
  }

  /** Chenille de la barre de progression (segments animables). */
  function caterpillarSVG() {
    const cols = ['#C6E6D3', '#C9DDF2', '#D9CBF0', '#F8CDB5'];
    let s = '';
    cols.forEach((c, i) => {
      s += `<circle class="cat-seg" style="--i:${i}" cx="${7 + i * 9}" cy="13" r="${5.2 + i * 0.35}" fill="${c}" stroke="${tone(c, -0.14, 0.05)}" stroke-width="1.1"/>`;
    });
    s += `<g class="cat-head" style="--i:4"><circle cx="45" cy="11" r="7" fill="#F3C4CF" stroke="${tone('#F3C4CF', -0.14, 0.05)}" stroke-width="1.1"/>` +
      '<circle cx="47.6" cy="9.6" r="1.25" fill="#4B3A48"/><circle cx="47.4" cy="13.6" r="1.5" fill="#EBA7BC" opacity=".85"/>' +
      '<path d="M42.5 5Q41 0 38 -1M46.5 4.5Q48 -.5 51 -1.5" fill="none" stroke="#6E5A6A" stroke-width=".9" stroke-linecap="round"/>' +
      '<circle cx="38" cy="-1" r="1.1" fill="#6E5A6A"/><circle cx="51" cy="-1.5" r="1.1" fill="#6E5A6A"/></g>';
    return `<svg viewBox="0 -4 56 26" aria-hidden="true" focusable="false">${s}</svg>`;
  }

  /* ------------------------------------------------------------------ *
   * Scène animée pour « Votre bouquet à vous »
   * ------------------------------------------------------------------ */
  function createStage(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const B = GEO.paper.B;
    svg.innerHTML =
      '<g class="st-back"></g>' +
      `<g class="st-stems" filter="url(#fc-fuzz)" fill="none" stroke-linecap="round" stroke-linejoin="round"><g class="st-s1" stroke="${STEM.dark}" stroke-width="4.6"></g><g class="st-s2" stroke="${STEM.base}" stroke-width="3"></g></g>` +
      '<g class="st-front"></g><g class="st-heads" filter="url(#fc-fuzz)"></g><g class="st-bow"></g><g class="st-tag"></g>';
    const q = (c) => svg.querySelector(c);
    const back = q('.st-back'), front = q('.st-front'), s1g = q('.st-s1'), s2g = q('.st-s2');
    const headsG = q('.st-heads'), bowG = q('.st-bow'), tagG = q('.st-tag');
    back.innerHTML = pouchBack();
    front.innerHTML = pouchFront();
    bowG.innerHTML = pouchBow();

    const nodes = new Map();
    const k0 = paperScale(0);
    const paperK = { cur: k0, from: k0, to: k0, t0: 0 };
    const ASPECT = 400 / 490;
    let cardH = 0;
    /* Cadre « caméra » : zoome sur le bouquet et recule quand il grandit. */
    function fitBox(lay, k) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const add = (x, y, r) => {
        x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r);
        x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r);
      };
      lay.forEach((l) => {
        const h = headPos(B, l.a, l.L);
        add(h.x, h.y, 32 * l.s);
        if (kindOf(l.it.type) === 'filler') { const t = headPos(h, l.a, 68); add(t.x, t.y, 12); }
      });
      add(B.x + (56 - 200) * k, B.y + (132 - 345) * k, 0);
      add(B.x + (344 - 200) * k, B.y + (482 - 345) * k, 0);
      if (cardH) add(B.x + CARD_DX + CARD_W / 2 + 10, B.y + 30 * k + CARD_DY + cardH + 12, 0);
      const pad = 20;
      y0 -= pad; y1 += pad;
      let hw = Math.max(B.x - x0, x1 - B.x) + pad;
      hw = Math.max(hw, 140);
      let w = hw * 2, h = y1 - y0;
      if (w / h < ASPECT) w = h * ASPECT;
      else { const nh = w / ASPECT; y0 -= nh - h; h = nh; }
      return [B.x - w / 2, y0, w, h];
    }
    const cam = { cur: fitBox([], k0), from: null, to: null, t0: 0 };
    cam.from = cam.cur.slice(); cam.to = cam.cur.slice();
    const applyCam = () => svg.setAttribute('viewBox', cam.cur.map(r1).join(' '));
    const reduce = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const DUR = reduce ? 1 : 760;
    let curCard = null;
    let raf = 0;
    const mk = (t) => document.createElementNS(NS, t);

    function applyK(k) {
      const t = `translate(${B.x} ${B.y}) scale(${k.toFixed(4)}) translate(${-B.x} ${-B.y})`;
      back.setAttribute('transform', t);
      front.setAttribute('transform', t);
      bowG.setAttribute('transform', `translate(${B.x} ${r1(B.y + 30 * k)}) scale(${k.toFixed(4)})`);
      tagG.setAttribute('transform', `translate(0 ${r1((k - 1) * 30)})`);
    }
    function draw(n, k) {
      const c = n.cur, h = headPos(B, c.a, c.L);
      const x = r1(h.x), y = r1(h.y);
      n.head.setAttribute('transform', `translate(${x} ${y}) rotate(${r1(c.rot)}) scale(${Math.max(0, c.s).toFixed(3)})`);
      const t = tailPos(B, h, k, n.v);
      const d = `M${t.x} ${t.y}L${B.x} ${B.y}L${x} ${y}`;
      n.l1.setAttribute('d', d);
      n.l2.setAttribute('d', d);
    }
    function tick(now) {
      let active = false;
      let tk = (now - paperK.t0) / DUR;
      if (tk < 1) active = true;
      tk = clamp(tk, 0, 1);
      const ek = easeOutCubic(tk);
      paperK.cur = lerp(paperK.from, paperK.to, ek);
      nodes.forEach((n, id) => {
        let t = (now - n.t0 - n.delay) / DUR;
        if (t < 1) active = true;
        t = clamp(t, 0, 1);
        const e = easeOutCubic(t), es = n.pop ? easeOutBack(t) : e;
        n.cur = { a: lerp(n.from.a, n.to.a, e), L: lerp(n.from.L, n.to.L, e), rot: lerp(n.from.rot, n.to.rot, e), s: lerp(n.from.s, n.to.s, es) };
        draw(n, paperK.cur);
        if (t >= 1 && n.removing) {
          n.head.remove(); n.l1.remove(); n.l2.remove();
          nodes.delete(id);
        }
      });
      applyK(paperK.cur);
      cam.cur = cam.from.map((v, i) => lerp(v, cam.to[i], ek));
      applyCam();
      raf = active ? requestAnimationFrame(tick) : 0;
    }
    function setCard(card) {
      const c = cardParts(card);
      const key = c.empty ? '' : JSON.stringify([c.to, c.lines, c.from]);
      cardH = c.empty ? 0 : c.h;
      if (key === curCard) return;
      curCard = key;
      tagG.innerHTML = c.empty ? '' : cardSVG(card, B.x, B.y + 30);
    }

    let seq = 0;
    function set(cfg) {
      const now = performance.now();
      const items = normalize(cfg);
      const lay = layout(items, 'paper');
      const seen = new Set();
      let born = 0;
      setCard(cfg.card || cfg.message);
      lay.forEach((l) => {
        const id = l.it.id;
        seen.add(id);
        const to = { a: l.a, L: l.L, rot: l.rot, s: l.s };
        let n = nodes.get(id);
        if (!n || n.removing) {
          if (n) { n.head.remove(); n.l1.remove(); n.l2.remove(); }
          const head = mk('g');
          head.innerHTML = headSVG(l.it.type, l.it.hex);
          const l1 = mk('path'), l2 = mk('path');
          s1g.appendChild(l1); s2g.appendChild(l2);
          n = { head, l1, l2, v: seq++, cur: { a: to.a, L: to.L * 0.45, rot: to.rot, s: 0 }, pop: true, delay: born++ * 60 };
          nodes.set(id, n);
        } else {
          n.pop = false; n.delay = 0;
        }
        n.from = Object.assign({}, n.cur);
        n.to = to; n.t0 = now; n.z = l.z; n.removing = false;
      });
      nodes.forEach((n, id) => {
        if (!seen.has(id) && !n.removing) {
          n.from = Object.assign({}, n.cur);
          n.to = { a: n.cur.a, L: n.cur.L * 0.35, rot: n.cur.rot, s: 0 };
          n.t0 = now; n.delay = 0; n.pop = false; n.removing = true; n.z = -5000;
        }
      });
      Array.from(nodes.values()).sort((p, q2) => p.z - q2.z).forEach((n) => headsG.appendChild(n.head));
      paperK.from = paperK.cur; paperK.to = paperScale(items.length); paperK.t0 = now;
      cam.from = cam.cur.slice(); cam.to = fitBox(lay, paperK.to);
      if (!raf) raf = requestAnimationFrame(tick);
    }

    applyK(k0);
    applyCam();
    return { set };
  }

  global.FC_FLOWERS = {
    register,
    pal,
    tone,
    hex: (key) => hexOf('colors', key, key),
    types: TYPES,
    bouquet: bouquetSVG,
    icon: flowerIconSVG,
    stage: createStage,
    card: cardSVG,
    atelier: atelierSVG,
    giftcard: giftcardSVG,
    butterfly: butterflySVG,
    caterpillar: caterpillarSVG
  };
})(window);
