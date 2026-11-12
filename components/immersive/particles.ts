'use client';

/* Tiles for the canvas scenes (Pipeline, Launches): each particle is a small square crop of one
   launch picture, pre-cut into an atlas once so a frame is just a few hundred atlas blits. */

export const TILE = 48; // atlas cell, px

export type Atlas = { canvas: HTMLCanvasElement; cols: number };

const cache = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(src: string) {
  let p = cache.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    cache.set(src, p);
  }
  return p;
}

/** Cut `count` crops: crop i comes from picture `pick(i)`, a square of `zoom(i)` × the picture's
    height, placed by noise `seed(i)`. Pictures that fail to load leave their cells empty. */
export async function buildAtlas(
  srcs: string[],
  count: number,
  pick: (i: number) => number,
  seed: (i: number, k: number) => number,
): Promise<Atlas> {
  const imgs = await Promise.all(srcs.map((s) => loadImage(s).catch(() => null)));
  const cols = Math.ceil(Math.sqrt(count));
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = cols * TILE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { canvas, cols };
  ctx.imageSmoothingQuality = 'high';
  for (let i = 0; i < count; i++) {
    const img = imgs[pick(i)];
    if (!img) continue;
    const side = img.naturalHeight * (0.22 + 0.4 * seed(i, 1));
    const sx = (img.naturalWidth - side) * seed(i, 2);
    const sy = (img.naturalHeight - side) * seed(i, 3);
    ctx.drawImage(img, sx, sy, side, side, (i % cols) * TILE, Math.floor(i / cols) * TILE, TILE, TILE);
  }
  return { canvas, cols };
}

/** Size a canvas to its box at the device pixel ratio (max 2); returns the 2D context scaled to CSS px. */
export function fitCanvas(c: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.round(w * dpr);
  const H = Math.round(h * dpr);
  if (c.width !== W || c.height !== H) {
    c.width = W;
    c.height = H;
  }
  const ctx = c.getContext('2d');
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
