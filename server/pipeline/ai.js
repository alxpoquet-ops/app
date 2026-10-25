// Étape 3 (mode intelligent) : Claude regarde les images, choisit les meilleurs moments,
// écrit l'accroche, les sous-titres, les légendes et les hashtags adaptés à chaque réseau.
import fs from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import { getSettings, NETWORKS } from '../config.js';
import { MOODS } from './text.js';

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
const MAX_IMAGES = 24;

const NET_RULES = {
  tiktok: 'TikTok : ton direct et tendance, 1-3 phrases, 3 à 5 hashtags (mélange niche + populaires).',
  instagram: 'Instagram : légende soignée avec une phrase d\'accroche, saut de ligne, appel à l\'action ; 10 à 15 hashtags pertinents.',
  facebook: 'Facebook : ton chaleureux et conversationnel, 2-4 phrases, 2 à 4 hashtags maximum.',
  youtube: 'YouTube Shorts : description courte et claire ; titre séparé (max 90 caractères, accrocheur) ; 5 à 8 hashtags dont "shorts".',
  x: 'X : un seul message percutant, légende + hashtags doivent tenir en 260 caractères ; 1 à 3 hashtags.',
};

function schema(networks, maxSlides) {
  const netProps = (item) => Object.fromEntries(networks.map((n) => [n, item]));
  return {
    type: 'object',
    additionalProperties: false,
    required: ['slides', 'hook', 'cta', 'mood', 'title', 'captions', 'hashtags'],
    properties: {
      slides: {
        type: 'array',
        description: `Images retenues, dans l'ordre du montage (entre 1 et ${maxSlides}).`,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'subtitle'],
          properties: {
            id: { type: 'string', description: 'Identifiant de l\'image (ex: c3).' },
            subtitle: { type: 'string', description: 'Sous-titre incrusté sur cette image (max 8 mots, peut être vide).' },
          },
        },
      },
      hook: { type: 'string', description: 'Accroche affichée en grand au début (max 7 mots).' },
      cta: { type: 'string', description: 'Appel à l\'action affiché à la fin (max 6 mots).' },
      mood: { type: 'string', enum: Object.keys(MOODS) },
      title: { type: 'string', description: 'Titre court (YouTube), max 90 caractères.' },
      captions: { type: 'object', additionalProperties: false, required: networks, properties: netProps({ type: 'string' }) },
      hashtags: {
        type: 'object', additionalProperties: false, required: networks,
        properties: netProps({ type: 'array', items: { type: 'string', description: 'Hashtag sans le #.' } }),
      },
    },
  };
}

export function aiEnabled() {
  return Boolean(getSettings().anthropicApiKey);
}

export async function planWithAI({ description, candidates, networks, targetSlides, brand }) {
  const settings = getSettings();
  const client = new Anthropic({ apiKey: settings.anthropicApiKey, timeout: 180_000 });

  // Échantillon réparti si trop d'images candidates.
  const sample = candidates.length <= MAX_IMAGES
    ? candidates
    : Array.from({ length: MAX_IMAGES }, (_, i) => candidates[Math.floor((i * candidates.length) / MAX_IMAGES)]);

  const content = [];
  for (const c of sample) {
    const label = c.kind === 'photo' ? `photo envoyée (fichier ${c.media + 1})` : `image extraite de la vidéo ${c.media + 1} à ${c.time}s`;
    content.push({ type: 'text', text: `Image ${c.id} — ${label}` });
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: fs.readFileSync(c.thumb).toString('base64') } });
  }
  content.push({
    type: 'text',
    text: [
      `Description de la publication écrite par l'utilisateur :\n"""${description}"""`,
      `Réseaux visés : ${networks.map((n) => NETWORKS[n].label).join(', ')}.`,
      `Choisis environ ${targetSlides} images (toutes les photos envoyées si possible, sinon les plus belles, nettes et variées ; évite les doublons, le flou, les images noires). Ordonne-les pour raconter une histoire avec une image forte en premier.`,
      'Règles par réseau :',
      ...networks.map((n) => `- ${NET_RULES[n]}`),
      brand?.signature ? `Ajoute cette signature à la fin des légendes Instagram/Facebook/YouTube : ${brand.signature}` : '',
      `Appel à l'action par défaut si pertinent : "${brand?.cta || ''}".`,
      'Écris dans la langue de la description. Pas d\'emoji dans hook, cta et sous-titres (ils sont incrustés dans la vidéo) ; les emojis sont permis dans les légendes. Pas d\'information inventée.',
    ].filter(Boolean).join('\n'),
  });

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: schema(networks, Math.max(targetSlides + 3, 4)) } },
    system: 'Tu es un monteur vidéo et community manager expert des formats courts (Reels, TikTok, Shorts). Tu prépares un diaporama vidéo dynamique à partir des images fournies.',
    messages: [{ role: 'user', content }],
  });

  if (response.stop_reason === 'refusal') throw new Error('L\'IA a refusé cette demande.');
  if (response.stop_reason === 'max_tokens') throw new Error('Réponse de l\'IA incomplète.');
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const plan = JSON.parse(text);

  const byId = new Map(candidates.map((c) => [c.id, c]));
  const slides = plan.slides.filter((s) => byId.has(s.id));
  if (!slides.length) throw new Error('L\'IA n\'a retenu aucune image valide.');
  return {
    source: 'ia',
    picked: slides.map((s) => byId.get(s.id)),
    slideCaptions: slides.map((s) => s.subtitle || ''),
    hook: plan.hook,
    cta: plan.cta,
    mood: MOODS[plan.mood] ? plan.mood : 'inspirant',
    title: (plan.title || '').slice(0, 100),
    captions: plan.captions,
    hashtags: Object.fromEntries(Object.entries(plan.hashtags).map(([k, v]) => [k, v.map((t) => t.replace(/^#/, '').replace(/\s+/g, '')).filter(Boolean)])),
  };
}
