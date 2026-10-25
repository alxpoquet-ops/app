// Étape 4 : bibliothèque musicale (morceaux générés par l'app + morceaux ajoutés par l'utilisateur).
import fs from 'node:fs';
import path from 'node:path';
import { PATHS } from '../config.js';
import { runFfmpeg, probe } from '../util/ffmpeg.js';
import { MOODS } from './text.js';
import { PRESETS, synthesize } from './synth.js';

const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|flac)$/i;
const VARIANTS = 2; // 2 compositions par ambiance

// Compose les morceaux maison au premier démarrage (quelques secondes).
export async function ensureGeneratedMusic(log = console.log) {
  for (const mood of Object.keys(PRESETS)) {
    for (let v = 1; v <= VARIANTS; v++) {
      const out = path.join(PATHS.musicGenerated, `${mood}-${v}.m4a`);
      if (fs.existsSync(out)) continue;
      const wav = out.replace(/\.m4a$/, '.wav');
      const { bpm } = synthesize(mood, wav, { seed: v * 31, variant: v });
      await runFfmpeg(['-i', wav, '-c:a', 'aac', '-b:a', '192k', out]);
      fs.unlinkSync(wav);
      fs.writeFileSync(out.replace(/\.m4a$/, '.json'), JSON.stringify({ mood, bpm, title: `${MOODS[mood].label} #${v}` }));
      log(`🎵 Musique générée : ${MOODS[mood].label} #${v} (${bpm} BPM)`);
    }
  }
}

export function listTracks() {
  const tracks = [];
  for (const f of fs.readdirSync(PATHS.musicGenerated).filter((x) => x.endsWith('.m4a'))) {
    let meta = {};
    try { meta = JSON.parse(fs.readFileSync(path.join(PATHS.musicGenerated, f.replace(/\.m4a$/, '.json')), 'utf8')); } catch { /* méta absente */ }
    tracks.push({ id: `gen:${f}`, file: path.join(PATHS.musicGenerated, f), origin: 'Composée par l\'app', ...meta });
  }
  // Morceaux perso : data/music/<ambiance>/fichier.mp3 ou data/music/<ambiance>__titre.mp3
  const walk = (dir, moodHint) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, MOODS[entry.name] ? entry.name : moodHint);
      else if (AUDIO_EXT.test(entry.name)) {
        const prefix = entry.name.split('__')[0];
        const mood = MOODS[prefix] ? prefix : moodHint || 'inspirant';
        tracks.push({ id: `user:${path.relative(PATHS.music, full)}`, file: full, origin: 'Ajoutée par toi', mood, bpm: null, title: entry.name.replace(AUDIO_EXT, '').replace(/^.*__/, '') });
      }
    }
  };
  walk(PATHS.music, null);
  return tracks;
}

export function findTrack(id) {
  return listTracks().find((t) => t.id === id);
}

// Les morceaux de l'utilisateur sont prioritaires ; on évite de reprendre le précédent.
export function pickTrack(mood, excludeId) {
  const all = listTracks();
  const pools = [
    all.filter((t) => t.mood === mood && t.origin.startsWith('Ajoutée')),
    all.filter((t) => t.mood === mood),
    all,
  ];
  for (const pool of pools) {
    const options = pool.filter((t) => t.id !== excludeId);
    if (options.length) return options[Math.floor(Math.random() * options.length)];
  }
  return null;
}

export async function addUserTrack(tmpFile, originalName, mood) {
  await probe(tmpFile); // vérifie que c'est bien un fichier audio lisible
  const dir = path.join(PATHS.music, MOODS[mood] ? mood : 'inspirant');
  fs.mkdirSync(dir, { recursive: true });
  const safe = originalName.replace(/[^\p{L}\p{N}._ -]+/gu, '_').slice(0, 80);
  const dest = path.join(dir, safe);
  fs.renameSync(tmpFile, dest);
  return listTracks().find((t) => t.file === dest);
}

export function removeUserTrack(id) {
  const t = findTrack(id);
  if (!t || !id.startsWith('user:')) throw new Error('Morceau introuvable ou non supprimable.');
  fs.unlinkSync(t.file);
}
