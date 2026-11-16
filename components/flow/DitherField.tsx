'use client';

import { useEffect, useRef } from 'react';

/* The tools Showcase's colour field, dithered (feedback 2026-11-16, ?toolsBg=dither): the same soft wash
   of paper tones (tools-showcase.css .tsc-glow — warm paper, stone, sage) as a field of light, ordered-
   dithered (8 × 8 Bayer) down to four tones in 3px cells, so it reads as print. The light drifts slowly
   while the section is on screen (~12 fps, a cell grid of ~100k at most); still for reduced motion. */

// Bayer 8 × 8, as thresholds in 0…1
const B8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);
// dark to light: stone, the field's own, paper, near white (the window's #fbfaf8 kept apart)
const TONES = ['#b9bab2', '#cfcdc5', '#e0ddd4', '#efede7'].map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
// the light: soft blobs (x, y in 0…1 of the field, radius, strength), as .tsc-glow's gradients
const BLOBS: [number, number, number, number][] = [
  [0.12, 0.08, 0.42, 0.55], [0.44, 0.0, 0.34, 0.6], [0.72, 0.06, 0.36, 0.15],
  [1.0, 0.45, 0.32, -0.35], [0.0, 0.92, 0.36, 0.35], [0.5, 1.0, 0.36, 0.3], [0.84, 1.0, 0.32, -0.15],
];
const CELL = 3;

export default function DitherField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, img: ImageData | null = null, raf = 0, last = 0, on = false;
    const t0 = performance.now();

    const draw = (now: number) => {
      if (!img) return;
      const t = reduce ? 0 : (now - t0) / 1000;
      const d = img.data;
      const ar = w / h;
      // each blob drifts on its own slow loop (~20–40s)
      const bl = BLOBS.map(([x, y, r, s], i) => [x + 0.05 * Math.sin(t * (0.16 + i * 0.03) + i), y + 0.06 * Math.cos(t * (0.13 + i * 0.025) + i * 2), r, s]);
      for (let y = 0; y < h; y++) {
        const v = y / h;
        for (let x = 0; x < w; x++) {
          const u = x / w;
          let l = 0.42;
          for (const [bx, by, r, s] of bl) {
            const dx = (u - bx) * ar, dy = v - by;
            const sg = r * ar * 0.55; // the blob's spread, in the field's height units
            l += s * Math.exp(-(dx * dx + dy * dy) / (2 * sg * sg));
          }
          // four tones: the level below, or the one above where the light passes the cell's threshold
          const q = Math.max(0, Math.min(0.9999, l)) * (TONES.length - 1);
          const lo = Math.floor(q);
          const tone = TONES[q - lo > B8[(y & 7) * 8 + (x & 7)] ? lo + 1 : lo];
          const o = (y * w + x) * 4;
          d[o] = tone[0]; d[o + 1] = tone[1]; d[o + 2] = tone[2]; d[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };
    const loop = (now: number) => {
      raf = 0;
      if (!on) return;
      if (now - last > 80) { last = now; draw(now); }
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    const size = () => {
      const r = cv.getBoundingClientRect();
      w = Math.max(1, Math.ceil(r.width / CELL)); h = Math.max(1, Math.ceil(r.height / CELL));
      cv.width = w; cv.height = h;
      img = ctx.createImageData(w, h);
      draw(performance.now());
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);
  return <canvas ref={ref} className="tsc-dither" aria-hidden="true" />;
}
