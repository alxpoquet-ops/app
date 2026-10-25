// Mini-synthétiseur : compose des boucles musicales originales (donc libres de droits)
// pour chaque ambiance. Produit un WAV stéréo 44,1 kHz.
import fs from 'node:fs';

const SR = 44100;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

// Accords en notes MIDI (voicings pensés pour sonner "pad").
const CH = {
  Am: [57, 60, 64, 67], F: [53, 57, 60, 64], C: [48, 55, 60, 64], G: [55, 59, 62, 67],
  Em: [52, 55, 59, 62], Dm: [50, 57, 60, 65], Dm9: [50, 57, 60, 64, 65], G7: [55, 59, 62, 65],
  Cmaj7: [48, 55, 59, 64], Am7: [57, 60, 64, 67], Fmaj7: [53, 57, 60, 64], Bb: [58, 62, 65], E: [52, 56, 59, 64],
};

export const PRESETS = {
  chill:     { bpm: 90,  prog: ['Am7', 'Fmaj7', 'C', 'G'], kick: [0, 2.5], snare: [1, 3], hats: 8, swing: 0, bass: 'roots', arp: 'slow', pad: 0.5, lp: 0.12 },
  energique: { bpm: 124, prog: ['Am', 'F', 'C', 'G'], kick: [0, 1, 2, 3], snare: [1, 3], hats: 'off', swing: 0, bass: 'offbeat', arp: 'fast', pad: 0.35, lp: 0.35 },
  inspirant: { bpm: 110, prog: ['C', 'G', 'Am', 'F'], kick: [0, 2], snare: [1, 3], hats: 8, swing: 0, bass: 'roots8', arp: 'eighths', pad: 0.5, lp: 0.25 },
  emotion:   { bpm: 72,  prog: ['F', 'Am', 'G', 'C'], kick: [], snare: [], hats: 0, swing: 0, bass: 'whole', arp: 'piano', pad: 0.7, lp: 0.08 },
  fun:       { bpm: 118, prog: ['C', 'F', 'G', 'C'], kick: [0, 1.5, 2, 3], snare: [1, 3], hats: 8, swing: 0, bass: 'bouncy', arp: 'stabs', pad: 0.25, lp: 0.4 },
  lofi:      { bpm: 80,  prog: ['Dm9', 'G7', 'Cmaj7', 'Am7'], kick: [0, 2.75], snare: [1, 3], hats: 8, swing: 0.18, bass: 'roots', arp: 'keys', pad: 0.45, lp: 0.06, crackle: true },
};

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// variant > 1 : transposition + progression décalée + arpège inversé pour un 2e morceau distinct.
export function synthesize(mood, outFile, { seconds = 64, seed = 7, variant = 1 } = {}) {
  const base = PRESETS[mood];
  const shift = [0, 3, -2, 5][(variant - 1) % 4];
  const rot = (variant - 1) % base.prog.length;
  const p = { ...base, prog: [...base.prog.slice(rot), ...base.prog.slice(0, rot)], reverseArp: variant % 2 === 0, shift };
  const beat = 60 / p.bpm;
  const bar = beat * 4;
  const bars = Math.ceil(seconds / bar);
  const total = Math.ceil(bars * bar * SR);
  const L = new Float32Array(total);
  const R = new Float32Array(total);
  const rand = rng(seed + mood.length * 97);

  const add = (start, dur, fn, gain = 1, pan = 0) => {
    const s0 = Math.max(0, Math.floor(start * SR));
    const n = Math.min(total - s0, Math.floor(dur * SR));
    const gl = gain * Math.cos((pan + 1) * Math.PI / 4);
    const gr = gain * Math.sin((pan + 1) * Math.PI / 4);
    for (let i = 0; i < n; i++) {
      const v = fn(i / SR, i);
      L[s0 + i] += v * gl;
      R[s0 + i] += v * gr;
    }
  };

  const env = (t, dur, a, r) => Math.min(1, t / a) * Math.min(1, Math.max(0, (dur - t) / r));
  const sw = (pos) => (p.swing && pos % 0.5 === 0.25 ? p.swing * beat : 0);

  for (let b = 0; b < bars; b++) {
    const t0 = b * bar;
    const chord = CH[p.prog[b % p.prog.length]].map((n) => n + p.shift);
    const intro = b < 2;
    const outro = b >= bars - 1;

    // Pad : notes douces légèrement désaccordées.
    chord.forEach((note, k) => {
      const f = midi(note);
      add(t0, bar + 0.3, (t) => {
        const e = env(t, bar + 0.3, 0.35, 0.5);
        return e * (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.003 * t) + 0.18 * Math.sin(4 * Math.PI * f * t));
      }, p.pad * 0.07, k % 2 ? 0.35 : -0.35);
    });

    // Basse.
    const root = midi(chord[0] - (chord[0] >= 52 ? 24 : 12));
    const bassNote = (start, dur, g = 1) => add(start, dur, (t) => {
      const e = env(t, dur, 0.008, 0.06);
      const x = Math.sin(2 * Math.PI * root * t);
      return e * Math.tanh(1.6 * x + 0.3 * Math.sin(4 * Math.PI * root * t));
    }, 0.22 * g);
    if (!intro) {
      if (p.bass === 'roots') { bassNote(t0, beat * 1.5); bassNote(t0 + beat * 2.5, beat * 1.4, 0.8); }
      if (p.bass === 'roots8') for (let i = 0; i < 8; i++) bassNote(t0 + i * beat / 2, beat / 2.2, i % 2 ? 0.7 : 1);
      if (p.bass === 'offbeat') for (let i = 0; i < 4; i++) bassNote(t0 + i * beat + beat / 2, beat / 2.2);
      if (p.bass === 'whole') bassNote(t0, bar, 0.8);
      if (p.bass === 'bouncy') [0, 0.75, 1.5, 2, 2.75, 3.5].forEach((x, i) => bassNote(t0 + x * beat, beat * 0.4, i % 2 ? 0.75 : 1));
    }

    // Mélodie / arpèges (triangle ou "piano" à décroissance exponentielle).
    const pluck = (start, f, dur, g, pan, bright = 1) => add(start, dur, (t) => {
      const e = Math.exp(-t * (3 / dur)) * Math.min(1, t / 0.004);
      const ph = (f * t) % 1;
      const tri = 4 * Math.abs(ph - 0.5) - 1;
      return e * (tri * 0.6 + bright * 0.4 * Math.sin(2 * Math.PI * 2 * f * t));
    }, g, pan);
    const notes = chord.map((n) => n + 12);
    if (p.reverseArp) notes.reverse();
    if (p.arp === 'slow') notes.forEach((n, i) => pluck(t0 + i * beat, midi(n), beat * 1.8, 0.07, i % 2 ? 0.4 : -0.4));
    if (p.arp === 'eighths' || p.arp === 'fast') {
      const step = p.arp === 'fast' ? beat / 4 : beat / 2;
      for (let i = 0; i < bar / step - 0.01; i++) {
        if (intro && p.arp === 'fast' && i % 2) continue;
        pluck(t0 + i * step, midi(notes[(i * (i % 3 ? 1 : 2)) % notes.length]), step * 1.6, p.arp === 'fast' ? 0.045 : 0.06, Math.sin(i) * 0.5);
      }
    }
    if (p.arp === 'piano') {
      notes.forEach((n, i) => pluck(t0 + i * beat * 0.5, midi(n), bar, 0.06, (i - 1.5) * 0.25, 0.6));
      pluck(t0 + beat * 2.5, midi(notes[notes.length - 1] + 12), beat * 2, 0.04, 0.2, 0.5);
    }
    if (p.arp === 'stabs') [0.5, 1.5, 2.5, 3.25].forEach((x) => chord.forEach((n) => pluck(t0 + x * beat, midi(n + 12), beat * 0.5, 0.03, 0, 0.8)));
    if (p.arp === 'keys') chord.forEach((n, i) => pluck(t0 + (i * 0.25 + (b % 2) * 2) * beat, midi(n + 12), beat * 2.5, 0.05, (i - 1.5) * 0.3, 0.3));

    if (intro && b === 0) continue; // 1re mesure sans batterie : montée en douceur
    // Batterie.
    for (const k of p.kick) add(t0 + k * beat, 0.35, (t) => {
      const f = 45 + 110 * Math.exp(-t * 28);
      return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * 1.1;
    }, 0.55);
    if (!intro) for (const s of p.snare) add(t0 + s * beat, 0.25, (t) => {
      const n = rand() * 2 - 1;
      return (0.75 * n + 0.35 * Math.sin(2 * Math.PI * 190 * t)) * Math.exp(-t * 18);
    }, 0.22, 0.05);
    const hatTimes = p.hats === 'off' ? [0.5, 1.5, 2.5, 3.5] : p.hats ? Array.from({ length: p.hats }, (_, i) => i * (4 / p.hats)) : [];
    let prev = 0;
    for (const h of hatTimes) add(t0 + h * beat + sw(h), 0.06, () => {
      const n = rand() * 2 - 1;
      const v = n - prev; // passe-haut grossier = "tss"
      prev = n;
      return v * 0.5;
    }, (p.hats === 'off' ? 0.12 : 0.07) * (outro ? 0.6 : 1), 0.3);
  }

  // Grain vinyle (lo-fi).
  if (p.crackle) for (let i = 0; i < total; i++) {
    const c = rand() < 0.0009 ? (rand() - 0.5) * 0.3 : 0;
    const hiss = (rand() - 0.5) * 0.006;
    L[i] += c + hiss; R[i] += c * 0.8 + hiss;
  }

  // Filtre passe-bas doux, saturation légère, normalisation, fondus.
  let yl = 0; let yr = 0;
  let peak = 0;
  const a = Math.min(1, p.lp * 2.5);
  for (let i = 0; i < total; i++) {
    yl += a * (L[i] - yl); yr += a * (R[i] - yr);
    L[i] = Math.tanh(yl * 1.4); R[i] = Math.tanh(yr * 1.4);
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const norm = 0.89 / (peak || 1);
  const fade = SR * 2;
  const pcm = Buffer.alloc(total * 4);
  for (let i = 0; i < total; i++) {
    const f = Math.min(1, i / (SR * 0.05), (total - i) / fade);
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm * f)) * 32767), i * 4);
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm * f)) * 32767), i * 4 + 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
  header.writeUInt32LE(SR, 24); header.writeUInt32LE(SR * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(outFile, Buffer.concat([header, pcm]));
  return { bpm: p.bpm, seconds: total / SR };
}
