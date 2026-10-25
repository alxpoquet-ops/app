// Étapes 1-2 : analyse des fichiers et découpage des vidéos en images clés candidates.
import fs from 'node:fs';
import path from 'node:path';
import { runFfmpeg, probe } from '../util/ffmpeg.js';

// Lit l'orientation EXIF d'un JPEG (photos de téléphone souvent "couchées").
export function jpegOrientation(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(128 * 1024);
    const len = fs.readSync(fd, buf, 0, buf.length, 0);
    if (buf.readUInt16BE(0) !== 0xffd8) return 1;
    let off = 2;
    while (off + 4 < len) {
      const marker = buf.readUInt16BE(off);
      const size = buf.readUInt16BE(off + 2);
      if (marker === 0xffe1 && buf.toString('ascii', off + 4, off + 8) === 'Exif') {
        const tiff = off + 10;
        const le = buf.toString('ascii', tiff, tiff + 2) === 'II';
        const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
        const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
        const ifd = tiff + u32(tiff + 4);
        const count = u16(ifd);
        for (let i = 0; i < count; i++) {
          const entry = ifd + 2 + i * 12;
          if (entry + 12 > len) break;
          if (u16(entry) === 0x0112) return u16(entry + 8) || 1;
        }
        return 1;
      }
      if ((marker & 0xff00) !== 0xff00) break;
      off += 2 + size;
    }
  } catch { /* pas d'EXIF */ } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
  return 1;
}

const ORIENT_FILTER = { 2: 'hflip', 3: 'hflip,vflip', 4: 'vflip', 5: 'transpose=0', 6: 'transpose=1', 7: 'transpose=3', 8: 'transpose=2' };

// Score de netteté/détail bon marché : un JPEG riche en détails pèse plus lourd
// qu'une image floue, noire ou uniforme à qualité égale.
function detailScore(thumb) {
  try { return fs.statSync(thumb).size; } catch { return 0; }
}

async function makeThumb(src, thumb) {
  await runFfmpeg(['-i', src, '-vf', 'scale=384:384:force_original_aspect_ratio=decrease', '-q:v', '5', '-frames:v', '1', thumb]);
}

export async function analyzeMedia(job, workDir, report) {
  const framesDir = path.join(workDir, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });
  const candidates = [];
  let videoSeconds = 0;

  for (const [mi, media] of job.media.entries()) {
    report(`Analyse de « ${media.name} »`, mi / job.media.length);
    const info = await probe(media.path);
    if (!info.hasVideo) throw new Error(`« ${media.name} » n'est ni une image ni une vidéo lisible.`);
    const isVideo = media.type === 'video' && info.duration > 0.5;

    if (!isVideo) {
      const out = path.join(framesDir, `m${mi}.jpg`);
      const orient = /\.jpe?g$/i.test(media.path) ? jpegOrientation(media.path) : 1;
      const vf = [ORIENT_FILTER[orient], "scale='min(2400,iw)':-2"].filter(Boolean).join(',');
      await runFfmpeg(['-i', media.path, '-vf', vf, '-q:v', '2', '-frames:v', '1', out]);
      const thumb = out.replace(/\.jpg$/, '_t.jpg');
      await makeThumb(out, thumb);
      const dims = await probe(out);
      candidates.push({ id: `c${candidates.length}`, src: out, thumb, media: mi, kind: 'photo', time: null, score: Infinity, width: dims.width, height: dims.height });
      continue;
    }

    videoSeconds += info.duration;
    // Nombre d'images candidates proportionnel à la durée (1 toutes les ~1,5 s, entre 6 et 30).
    const count = Math.max(6, Math.min(30, Math.round(info.duration / 1.5)));
    const pattern = path.join(framesDir, `v${mi}_%03d.jpg`);
    await runFfmpeg([
      '-i', media.path,
      '-vf', `fps=${count}/${info.duration.toFixed(3)},scale='min(2400,iw)':-2`,
      '-q:v', '2', '-frames:v', String(count), pattern,
    ], { duration: info.duration, onProgress: (p) => report(`Découpage de « ${media.name} »`, (mi + p) / job.media.length) });

    const frameDims = { width: null, height: null };
    const files = fs.readdirSync(framesDir).filter((f) => f.startsWith(`v${mi}_`) && !f.endsWith('_t.jpg')).sort();
    for (const [fi, f] of files.entries()) {
      const src = path.join(framesDir, f);
      const thumb = src.replace(/\.jpg$/, '_t.jpg');
      await makeThumb(src, thumb);
      if (!frameDims.width) Object.assign(frameDims, await probe(src));
      candidates.push({
        id: `c${candidates.length}`, src, thumb, media: mi, kind: 'video-frame', width: frameDims.width, height: frameDims.height,
        time: Number(((fi + 0.5) * info.duration / files.length).toFixed(2)),
        score: detailScore(thumb),
      });
    }
  }
  if (!candidates.length) throw new Error('Aucune image exploitable trouvée dans les fichiers.');
  return { candidates, videoSeconds };
}

// Sélection locale (sans IA) : toutes les photos, puis les images de vidéo les plus détaillées,
// réparties dans le temps (un « meilleur moment » par tranche de la vidéo).
export function pickLocally(candidates, target) {
  const photos = candidates.filter((c) => c.kind === 'photo');
  const frames = candidates.filter((c) => c.kind !== 'photo');
  const picked = photos.slice(0, target);
  const remaining = target - picked.length;
  if (remaining > 0 && frames.length) {
    const median = [...frames].map((f) => f.score).sort((a, b) => a - b)[Math.floor(frames.length / 2)];
    const usable = frames.filter((f) => f.score >= median * 0.45); // écarte noir / flou
    const pool = usable.length >= remaining ? usable : frames;
    const buckets = Math.min(remaining, pool.length);
    for (let b = 0; b < buckets; b++) {
      const slice = pool.slice(Math.floor((b * pool.length) / buckets), Math.floor(((b + 1) * pool.length) / buckets));
      picked.push(slice.reduce((best, c) => (c.score > best.score ? c : best), slice[0]));
    }
  }
  // Respecte l'ordre d'envoi des fichiers et la chronologie des vidéos.
  return picked.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
}
