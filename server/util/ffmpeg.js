// Lancement de ffmpeg/ffprobe avec suivi de progression.
import { spawn } from 'node:child_process';
import { FFMPEG, FFPROBE } from '../config.js';

export function runFfmpeg(args, { duration, onProgress, cwd } = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG, ['-hide_banner', '-y', '-loglevel', 'error', '-nostats', '-progress', 'pipe:1', ...args], { cwd });
    let stderr = '';
    let buf = '';
    proc.stdout.on('data', (chunk) => {
      buf += chunk;
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        const m = line.match(/^out_time_(?:ms|us)=(\d+)/);
        if (m && duration && onProgress) onProgress(Math.min(1, Number(m[1]) / 1e6 / duration));
      }
    });
    proc.stderr.on('data', (c) => { stderr = (stderr + c).slice(-4000); });
    proc.on('error', (err) => reject(new Error(`ffmpeg introuvable (${err.message}). Installe ffmpeg ou utilise Docker.`)));
    proc.on('close', (code) => {
      if (code === 0) { onProgress?.(1); resolve(); } else reject(new Error(`ffmpeg a échoué (${code}): ${stderr.trim().split('\n').slice(-3).join(' | ')}`));
    });
  });
}

export function probe(file) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFPROBE, ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]);
    let out = '';
    let err = '';
    proc.stdout.on('data', (c) => { out += c; });
    proc.stderr.on('data', (c) => { err += c; });
    proc.on('error', (e) => reject(new Error(`ffprobe introuvable (${e.message})`)));
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Fichier illisible : ${err.trim().slice(0, 200)}`));
      const info = JSON.parse(out);
      const video = info.streams.find((s) => s.codec_type === 'video');
      const audio = info.streams.find((s) => s.codec_type === 'audio');
      let rotation = Number(video?.tags?.rotate || 0);
      const sideRot = video?.side_data_list?.find((d) => d.rotation !== undefined);
      if (sideRot) rotation = Number(sideRot.rotation);
      const swap = Math.abs(rotation) % 180 === 90;
      resolve({
        duration: Number(info.format?.duration || video?.duration || 0),
        width: swap ? video?.height : video?.width,
        height: swap ? video?.width : video?.height,
        hasVideo: !!video,
        hasAudio: !!audio,
        codec: video?.codec_name,
        frames: Number(video?.nb_frames || 0),
      });
    });
  });
}

let cachedVersion;
export async function ffmpegAvailable() {
  if (cachedVersion !== undefined) return cachedVersion;
  cachedVersion = await new Promise((resolve) => {
    const p = spawn(FFMPEG, ['-version']);
    let out = '';
    p.stdout.on('data', (c) => { out += c; });
    p.on('error', () => resolve(null));
    p.on('close', (code) => resolve(code === 0 ? out.split('\n')[0] : null));
  });
  return cachedVersion;
}
