/** Extraction d'images-clés côté navigateur (aucun upload de la vidéo complète). */

const MAX = 1024;

function canvasFrom(src: CanvasImageSource, w: number, h: number): string {
  const k = Math.min(1, MAX / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * k);
  c.height = Math.round(h * k);
  c.getContext('2d')!.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.75);
}

export async function imageToDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  return canvasFrom(bmp, bmp.width, bmp.height);
}

export async function videoKeyframes(file: File, count = 10): Promise<{ at: number; dataUrl: string }[]> {
  const url = URL.createObjectURL(file);
  const v = document.createElement('video');
  v.src = url;
  v.muted = true;
  v.playsInline = true;
  await new Promise<void>((ok, ko) => {
    v.onloadedmetadata = () => ok();
    v.onerror = () => ko(new Error('Vidéo illisible'));
  });
  const frames: { at: number; dataUrl: string }[] = [];
  const d = v.duration || 1;
  for (let i = 0; i < count; i++) {
    const at = (d * (i + 0.5)) / count;
    v.currentTime = at;
    await new Promise<void>((ok) => (v.onseeked = () => ok()));
    frames.push({ at, dataUrl: canvasFrom(v, v.videoWidth, v.videoHeight) });
  }
  URL.revokeObjectURL(url);
  return frames;
}
