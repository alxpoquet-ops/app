// Sous-titres animés (format ASS, rendu par libass) : accroche, sous-titres mot à mot, appel à l'action.
import { stripEmoji } from './text.js';

const ts = (sec) => {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const cs = Math.round((s % 60) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(Math.floor(cs / 100)).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
};

const clean = (t) => stripEmoji(t).replace(/[{}\\]/g, '').replace(/\s+/g, ' ').trim();

// Découpe en petits groupes lisibles (≈3 mots / 16 caractères), comme sur TikTok.
function groups(text) {
  const words = clean(text).split(' ').filter(Boolean);
  const out = [];
  let cur = [];
  for (const w of words) {
    if (cur.length && (cur.length >= 3 || [...cur, w].join(' ').length > 16)) { out.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
}

// Sépare un texte trop long sur deux lignes équilibrées.
function balance(text, maxChars) {
  if (text.length <= maxChars) return text;
  const words = text.split(' ');
  let best = text;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const diff = Math.abs(a.length - b.length);
    if (diff < bestDiff) { bestDiff = diff; best = `${a}\\N${b}`; }
  }
  return best;
}

export function buildAss({ w, h, slides, hook, cta, accent = 'FFD98A' }) {
  const vertical = h > w;
  const fs = Math.round(w * (vertical ? 0.078 : 0.06));
  const hookFs = Math.round(w * (vertical ? 0.092 : 0.075));
  const marginV = Math.round(h * (vertical ? 0.26 : 0.12)); // au-dessus des boutons des applis
  const outline = Math.max(4, Math.round(fs * 0.09));
  // Couleurs ASS : &HAABBGGRR
  const head = `[Script Info]
ScriptType: v4.00+
PlayResX: ${w}
PlayResY: ${h}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Montserrat ExtraBold,${fs},&H00FFFFFF,&H00FFFFFF,&H002A2228,&H64000000,-1,0,0,0,100,100,0,0,1,${outline},${Math.round(outline / 2)},2,${Math.round(w * 0.06)},${Math.round(w * 0.06)},${marginV},1
Style: Hook,Montserrat ExtraBold,${hookFs},&H003A2A2D,&H003A2A2D,&H00F6F9FB,&H00F6F9FB,-1,0,0,0,100,100,0,0,3,${Math.round(hookFs * 0.28)},0,5,${Math.round(w * 0.08)},${Math.round(w * 0.08)},0,1
Style: Cta,Montserrat ExtraBold,${Math.round(hookFs * 0.72)},&H003A2A2D,&H003A2A2D,&H00F6F9FB,&H00F6F9FB,-1,0,0,0,100,100,0,0,3,${Math.round(hookFs * 0.3)},0,5,${Math.round(w * 0.08)},${Math.round(w * 0.08)},0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const lines = [];
  const hl = `{\\c&H${accent.slice(4, 6)}${accent.slice(2, 4)}${accent.slice(0, 2)}&}`;

  // Accroche : gros texte qui "pop" au début, sur fond contrasté.
  const hookText = clean(hook || '');
  const first = slides[0];
  if (hookText && first) {
    const end = Math.min(first.start + first.duration, first.start + 2.8);
    lines.push(`Dialogue: 2,${ts(first.start + 0.15)},${ts(end)},Hook,,0,0,0,,{\\an8\\pos(${w / 2},${Math.round(h * (vertical ? 0.2 : 0.14))})\\fad(120,180)\\fscx70\\fscy70\\t(0,180,\\fscx106\\fscy106)\\t(180,280,\\fscx100\\fscy100)}${balance(hookText.toUpperCase(), 16)}`);
  }

  // Sous-titres mot à mot avec le mot courant en couleur.
  for (const s of slides) {
    if (!s.caption) continue;
    const gs = groups(s.caption);
    const start = s.start + (s === first && hookText ? Math.min(2.8, s.duration * 0.6) : 0.12);
    const span = s.start + s.duration - 0.1 - start;
    if (span <= 0.3) continue;
    const totalWords = gs.reduce((n, g) => n + g.length, 0);
    let t = start;
    for (const g of gs) {
      const gDur = (span * g.length) / totalWords;
      const wDur = gDur / g.length;
      g.forEach((_, wi) => {
        const text = g.map((word, k) => (k === wi ? `${hl}${word}{\\c&HFFFFFF&}` : word)).join(' ');
        const pop = wi === 0 ? '\\fscx88\\fscy88\\t(0,90,\\fscx100\\fscy100)' : '';
        lines.push(`Dialogue: 1,${ts(t + wi * wDur)},${ts(t + (wi + 1) * wDur)},Caption,,0,0,0,,{${pop}}${balance(text.toUpperCase(), 40)}`);
      });
      t += gDur;
    }
  }

  // Appel à l'action sur les 2 dernières secondes.
  const ctaText = clean(cta || '');
  const last = slides[slides.length - 1];
  if (ctaText && last && slides.length > 1) {
    const total = last.start + last.duration;
    lines.push(`Dialogue: 2,${ts(total - 2)},${ts(total - 0.05)},Cta,,0,0,0,,{\\an5\\pos(${w / 2},${Math.round(h * 0.42)})\\fad(150,100)\\fscx60\\fscy60\\t(0,200,\\fscx100\\fscy100)}${balance(ctaText.toUpperCase(), 18)}`);
  }
  return head + lines.join('\n') + '\n';
}
