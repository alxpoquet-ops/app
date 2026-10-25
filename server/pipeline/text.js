// Textes « hors IA » : sous-titres, accroche, légendes et hashtags générés localement.
// Utilisé quand aucune clé IA n'est configurée, ou en secours si l'IA échoue.
import { NETWORKS } from '../config.js';

const STOP = new Set(`a à au aux avec ce ces cet cette c ça d de des du dans en et est été être il ils elle elles
je j tu nous vous on le la les l leur leurs lui ma mon mes ta ton tes sa son ses ne pas plus pour par sur sous
que qui quoi quand où un une y mais ou donc or ni car si se s qu n m t très trop tout tous toute toutes
fait faire avoir ai as a avons avez ont suis es sommes êtes sont comme aussi bien encore même chez entre vers
cela ceci celui celle ceux voici voilà alors après avant depuis pendant sans selon notre votre nos vos
the a an and or of to in on for with is are was were be this that it my your our at from by as just so
vraiment super trop petit petite grand grande nouveau nouvelle jour aujourd hui demain hier face puis ensuite enfin ambiance session lever moment moments petit chose choses gens`.split(/\s+/));

export const MOODS = {
  chill: { label: 'Chill', words: ['détente', 'calme', 'café', 'cosy', 'dimanche', 'relax', 'plage', 'soleil', 'zen', 'yoga'] },
  energique: { label: 'Énergique', words: ['sport', 'fête', 'soirée', 'match', 'entraînement', 'gym', 'danse', 'concert', 'course', 'motivation', 'run', 'party'] },
  inspirant: { label: 'Inspirant', words: ['voyage', 'nature', 'montagne', 'projet', 'réussite', 'rêve', 'objectif', 'lancement', 'aventure', 'découverte', 'paysage'] },
  emotion: { label: 'Émotion', words: ['amour', 'souvenir', 'famille', 'mariage', 'naissance', 'merci', 'hommage', 'émotion', 'bébé', 'anniversaire'] },
  fun: { label: 'Fun', words: ['drôle', 'fun', 'délire', 'blague', 'rire', 'chat', 'chien', 'challenge', 'trend', 'lol', 'mdr'] },
  lofi: { label: 'Lo-fi', words: ['nuit', 'étude', 'pluie', 'lecture', 'ville', 'chill', 'travail', 'rétro', 'vintage', 'automne'] },
};

const GENERIC_TAGS = {
  tiktok: ['pourtoi', 'fyp'],
  instagram: ['reels', 'instagood', 'reelsinstagram'],
  facebook: ['reels'],
  youtube: ['shorts'],
  x: [],
};

export const stripEmoji = (s) => (s || '').replace(/\p{Extended_Pictographic}|️|‍/gu, '').replace(/\s{2,}/g, ' ').trim();

const normalize = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function sentences(text) {
  return (text || '')
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.replace(/#[\p{L}\p{N}_]+/gu, '').trim())
    .filter((s) => s.length > 1);
}

export function keywords(text, max = 8) {
  const counts = new Map();
  const words = (text || '').toLowerCase().replace(/#[\p{L}\p{N}_]+/gu, '').match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) || [];
  words.forEach((w, i) => {
    if (w.length < 4 || STOP.has(w) || w.split('-').every((x) => STOP.has(x)) || /^\d+$/.test(w)) return;
    counts.set(w, (counts.get(w) || 0) + 1 + (words.length - i) / (words.length * 4)); // léger bonus aux premiers mots
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([w]) => w);
}

export function toHashtag(word) {
  const tag = normalize(word).replace(/[^a-z0-9]+/g, '');
  return tag.length > 1 ? tag : null;
}

export function guessMood(text) {
  const t = normalize(text || '');
  let best = 'inspirant';
  let bestScore = 0;
  for (const [mood, { words }] of Object.entries(MOODS)) {
    const score = words.reduce((n, w) => n + (t.includes(normalize(w)) ? 1 : 0), 0);
    if (score > bestScore) { best = mood; bestScore = score; }
  }
  return best;
}

function shorten(text, maxWords) {
  const words = text.split(/\s+/);
  return words.length <= maxWords ? text : `${words.slice(0, maxWords).join(' ')}…`;
}

// Répartit la description sur les images : une phrase courte par image.
export function captionsForSlides(description, count) {
  const parts = sentences(stripEmoji(description)).flatMap((s) => {
    const words = s.split(/\s+/);
    if (words.length <= 9) return [s];
    const chunks = [];
    for (let i = 0; i < words.length; i += 8) chunks.push(words.slice(i, i + 8).join(' '));
    return chunks;
  });
  const out = new Array(count).fill('');
  if (!parts.length) return out;
  // La 1re image porte l'accroche : les sous-titres commencent à la 2e (sauf s'il n'y a qu'une image).
  const slots = count === 1 ? [0] : Array.from({ length: count - 1 }, (_, i) => i + 1);
  const used = parts.slice(0, slots.length);
  used.forEach((p, i) => { out[slots[Math.floor((i * slots.length) / used.length)]] = p; });
  return out;
}

export function localPlan({ description, slideCount, networks, brand }) {
  const clean = stripEmoji(description);
  const first = sentences(clean)[0] || clean || 'Regarde ça';
  const tags = keywords(description).map(toHashtag).filter(Boolean);
  const userTags = (description.match(/#[\p{L}\p{N}_]+/gu) || []).map((t) => toHashtag(t.slice(1))).filter(Boolean);
  const base = [...new Set([...userTags, ...tags])];
  const body = description.replace(/#[\p{L}\p{N}_]+/gu, '').trim();

  const hashtags = {};
  const captions = {};
  for (const net of networks) {
    const max = NETWORKS[net].maxHashtags;
    const generic = GENERIC_TAGS[net].slice(0, Math.max(0, max - 2));
    hashtags[net] = [...new Set([...base.slice(0, max - generic.length), ...generic])];
    captions[net] = net === 'x' ? shorten(body, 30) : [body, brand?.signature].filter(Boolean).join('\n\n');
  }
  return {
    source: 'local',
    hook: shorten(first, 9),
    cta: brand?.cta || '',
    mood: guessMood(description),
    title: shorten(first, 12).slice(0, 90),
    // L'accroche reprend la 1re phrase : les sous-titres utilisent la suite (s'il y en a une).
    slideCaptions: captionsForSlides(sentences(clean).length > 1 ? sentences(clean).slice(1).join(' ') : clean, slideCount),
    captions,
    hashtags,
  };
}

// Texte final envoyé à un réseau : légende + hashtags, dans la limite de caractères.
export function composePost(net, caption, hashtags) {
  const tags = (hashtags || []).map((t) => `#${t.replace(/^#/, '')}`).join(' ');
  const limit = NETWORKS[net].maxCaption;
  let text = [caption?.trim(), tags].filter(Boolean).join('\n\n');
  if (text.length > limit) {
    const room = limit - tags.length - 3;
    text = room > 20 ? `${caption.slice(0, room - 1).trim()}…\n\n${tags}` : text.slice(0, limit);
  }
  return text;
}
