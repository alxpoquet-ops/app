// Étape 5 : montage FFmpeg — effet Ken Burns, fond flou si besoin, transitions, sous-titres, musique.
import fs from 'node:fs';
import path from 'node:path';
import { PATHS } from '../config.js';
import { runFfmpeg } from '../util/ffmpeg.js';
import { buildAss } from './subtitles.js';

const FPS = 30;

const STYLE = {
  chill:     { transitions: ['fade', 'smoothleft', 'dissolve', 'smoothup'], td: 0.6, grade: 'eq=saturation=1.08:contrast=1.03' },
  energique: { transitions: ['slideleft', 'zoomin', 'slideup', 'circleopen', 'wipeleft'], td: 0.3, grade: 'eq=saturation=1.2:contrast=1.08' },
  inspirant: { transitions: ['smoothleft', 'circleopen', 'fade', 'smoothup', 'radial'], td: 0.5, grade: 'eq=saturation=1.12:contrast=1.05' },
  emotion:   { transitions: ['fade', 'fadeblack', 'dissolve'], td: 0.8, grade: 'eq=saturation=0.95:contrast=1.04,vignette=PI/5' },
  fun:       { transitions: ['slideright', 'circleopen', 'slideup', 'zoomin', 'pixelize'], td: 0.35, grade: 'eq=saturation=1.25:contrast=1.06' },
  lofi:      { transitions: ['fade', 'hblur', 'fadegrays', 'dissolve'], td: 0.6, grade: 'eq=saturation=0.85:contrast=0.97:gamma=1.04,vignette=PI/4,noise=alls=7:allf=t' },
};

// Mouvements de caméra (zoom avant/arrière, panoramiques) appliqués en alternance.
function kenBurns(i, frames, w, h) {
  const p = `on/${frames}`;
  const center = { x: 'iw/2-(iw/zoom/2)', y: 'ih/2-(ih/zoom/2)' };
  const moves = [
    { z: `1+0.16*${p}`, ...center },
    { z: '1.14', x: `(iw-iw/zoom)*${p}`, y: center.y },
    { z: `1.16-0.16*${p}`, ...center },
    { z: '1.14', x: `(iw-iw/zoom)*(1-${p})`, y: center.y },
    { z: `1.04+0.12*${p}`, x: center.x, y: `(ih-ih/zoom)*0.35*(1-${p})` },
  ];
  const m = moves[i % moves.length];
  return `zoompan=z='${m.z}':x='${m.x}':y='${m.y}':d=${frames}:s=${w}x${h}:fps=${FPS}`;
}

export function slideTimings(count, slideDuration, firstBonus = 0) {
  const out = [];
  let t = 0;
  for (let i = 0; i < count; i++) {
    const duration = slideDuration + (i === 0 ? firstBonus : 0);
    out.push({ start: t, duration });
    t += duration;
  }
  return { timings: out, total: t };
}

async function renderSlide({ src, srcW, srcH, out, index, seconds, w, h, grade }) {
  const frames = Math.round(seconds * FPS);
  // Rendu sur une toile 1,25x plus grande pour un zoom fluide (moins de tremblement).
  const W = Math.round((w * 1.25) / 2) * 2;
  const H = Math.round((h * 1.25) / 2) * 2;
  const srcRatio = srcW / srcH;
  const dstRatio = w / h;
  const cover = Math.abs(Math.log(srcRatio / dstRatio)) < 0.35;
  const base = cover
    ? `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1[c]`
    : `[0:v]split[a][b];[a]scale=${Math.round(W / 8)}:${Math.round(H / 8)}:force_original_aspect_ratio=increase,crop=${Math.round(W / 8)}:${Math.round(H / 8)},boxblur=6:2,scale=${W}:${H},eq=brightness=-0.07:saturation=1.2[bg];`
      + `[b]scale=${Math.round(W * 0.96)}:${Math.round(H * 0.96)}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[c]`;
  const filter = `${base};[c]${kenBurns(index, frames, w, h)},${grade},format=yuv420p[v]`;
  await runFfmpeg([
    '-i', src, '-filter_complex', filter, '-map', '[v]', '-frames:v', String(frames),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-r', String(FPS), out,
  ]);
}

/**
 * Monte une vidéo pour un format donné.
 * plan.slides : [{ src, width, height, caption }], plan.music : { file }, plan.slideDuration
 */
export async function renderVideo({ plan, format, workDir, outFile, onProgress }) {
  const { w, h } = format;
  const style = STYLE[plan.mood] || STYLE.inspirant;
  const dir = path.join(workDir, `render-${format.id}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const n = plan.slides.length;
  const td = n > 1 ? Math.min(style.td, plan.slideDuration * 0.4) : 0;
  const { timings, total } = slideTimings(n, plan.slideDuration, plan.firstBonus || 0);

  // 1) Chaque image devient un petit clip animé.
  for (const [i, s] of plan.slides.entries()) {
    onProgress?.((i / n) * 0.65, `Animation de l'image ${i + 1}/${n}`);
    const seconds = timings[i].duration + (i < n - 1 ? td : 0); // chevauchement pour la transition
    await renderSlide({ src: s.src, srcW: s.width, srcH: s.height, out: path.join(dir, `s${i}.mp4`), index: i, seconds, w, h, grade: style.grade });
  }

  // 2) Sous-titres.
  fs.writeFileSync(path.join(dir, 'subs.ass'), buildAss({
    w, h, hook: plan.hook, cta: plan.cta,
    slides: plan.slides.map((s, i) => ({ ...timings[i], caption: s.caption })),
  }));

  // 3) Assemblage : transitions + sous-titres + musique.
  const inputs = [];
  for (let i = 0; i < n; i++) inputs.push('-i', `s${i}.mp4`);
  const filters = [];
  let last = '[0:v]';
  let offset = 0;
  for (let i = 1; i < n; i++) {
    offset += timings[i - 1].duration;
    const tr = style.transitions[(i - 1) % style.transitions.length];
    filters.push(`${last}[${i}:v]xfade=transition=${tr}:duration=${td.toFixed(3)}:offset=${offset.toFixed(3)}[x${i}]`);
    last = `[x${i}]`;
  }
  const fontsDir = path.relative(dir, PATHS.fonts).split(path.sep).join('/');
  filters.push(`${last}subtitles=subs.ass:fontsdir='${fontsDir}'[vout]`);

  if (plan.music?.file) {
    inputs.push('-stream_loop', '-1', '-i', plan.music.file);
    const fadeOut = Math.min(1.5, total / 4);
    filters.push(`[${n}:a]atrim=0:${total.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.3,afade=t=out:st=${(total - fadeOut).toFixed(3)}:d=${fadeOut.toFixed(3)},volume=${plan.musicVolume ?? 0.9}[aout]`);
  }
  await runFfmpeg([
    ...inputs,
    '-filter_complex', filters.join(';'),
    '-map', '[vout]', ...(plan.music?.file ? ['-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100'] : []),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-movflags', '+faststart', '-t', total.toFixed(3), path.resolve(outFile),
  ], { cwd: dir, duration: total, onProgress: (p) => onProgress?.(0.65 + p * 0.35, 'Assemblage, transitions et sous-titres') });

  // Miniature pour l'interface.
  await runFfmpeg(['-ss', String(Math.min(1.2, total / 2)), '-i', path.resolve(outFile), '-frames:v', '1', '-vf', 'scale=480:-2', '-q:v', '4', outFile.replace(/\.mp4$/, '.jpg')]);
  fs.rmSync(dir, { recursive: true, force: true });
  return { duration: total };
}
