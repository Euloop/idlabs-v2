'use client';

import { useEffect, useRef } from 'react';

/* /home-4 tools "Motion glyphs" and "Motion numbers": the collage (Figma Zoomcast 213:618 "tool section
   bg-2", its frame 213:632 exported whole, assets/tools-dither/bg.webp) drawn as small characters (feedback
   2026-11-16: not a dither) — each cell a character whose weight and ink match the picture's darkness there.
   Glyphs (default): letters and numbers, light 1 i l … to dense M W N; ~12 times a second cells swap to
   another of the same weight, and soft bands of density sweep across diagonally.
   Numbers (`numbers`, "it should have numbers flowing"): digits only, flowing down each column at its own
   speed through the still picture, a brighter streak now and then running down with them.
   Glyphs are drawn once to an atlas and stamped. Only while on screen; one still frame for reduced motion. */

const SRC = '/assets/tools-dither/bg.webp';
// light to dense, in weight groups (a cell may show any of its group)
const LETTERS = ['', '', '.', '1il', 'ijt7', 'rcvx', 'znuo', 'aes3', 'kh52', 'dbpq4', '690g', '8Bmw', 'MWN'];
// Numbers, after the client's print reference (grey typewriter halftones on white): the whole frame, the
// light tones rows of - and =, the darks digits, all in grey on the page's white
const DIGITS = ['-', '-', '=', '=', ':', '1', '17', '74', '2345', '359', '690', '08'];
const NUM_INK = '#4a4a4a';
const INK = '#2a2a2a';

export default function DitherBg({ numbers = false }: { numbers?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const GROUPS = numbers ? DIGITS : LETTERS;
    const FPS = numbers ? 24 : 12;
    // a cell, in CSS px: numbers just big enough to read
    const CW = 6, CH = 9; // a cell, in CSS px: big enough to read the characters
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const img = new Image();
    let lum: Float32Array | null = null, cols = 0, rows = 0, dpr = 1;
    let rgb: string[] = []; // glyphs: each cell's colour in the picture, deepened
    let atlas: HTMLCanvasElement | null = null;
    const index: number[][] = []; // each group's glyphs, as atlas slots
    let raf = 0, last = 0, visible = false;
    const t0 = performance.now();

    // the glyph atlas: every character once, at the canvas's resolution
    const buildAtlas = () => {
      const all = GROUPS.join('').split('');
      atlas = document.createElement('canvas');
      atlas.width = Math.ceil(all.length * CW * dpr); atlas.height = Math.ceil(CH * dpr);
      const a = atlas.getContext('2d')!;
      a.scale(dpr, dpr);
      a.fillStyle = numbers ? NUM_INK : INK; a.textBaseline = 'middle'; a.textAlign = 'center';
      a.font = `${numbers ? 500 : 500} ${numbers ? CH - 1.2 : CH - 0.6}px ${getComputedStyle(cv).fontFamily || 'monospace'}`;
      let k = 0;
      index.length = 0;
      for (const g of GROUPS) {
        const slots: number[] = [];
        for (const ch of g) { a.fillText(ch, k * CW + CW / 2, CH / 2 + 0.3); slots.push(k++); }
        index.push(slots);
      }
    };

    // the picture at the grid's size, as darkness (0 light … 1 dark), stretched to its own range
    const prepare = () => {
      if (!img.complete || !img.naturalWidth) return;
      const r = cv.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cols = Math.max(1, Math.floor(r.width / CW)); rows = Math.max(1, Math.floor(r.height / CH));
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      const off = document.createElement('canvas'); off.width = cols; off.height = rows;
      const oc = off.getContext('2d', { willReadFrequently: true })!;
      const k = Math.max(cols * CW / img.naturalWidth, rows * CH / img.naturalHeight);
      const dw = (img.naturalWidth * k) / CW, dh = (img.naturalHeight * k) / CH;
      oc.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
      const px = oc.getImageData(0, 0, cols, rows).data;
      lum = new Float32Array(cols * rows);
      let lo = 1, hi = 0;
      for (let i = 0; i < cols * rows; i++) { const v = 1 - (px[i * 4] * 0.3 + px[i * 4 + 1] * 0.59 + px[i * 4 + 2] * 0.11) / 255; lum[i] = v; if (v < lo) lo = v; if (v > hi) hi = v; }
      for (let i = 0; i < cols * rows; i++) lum[i] = (lum[i] - lo) / (hi - lo || 1);
      rgb = Array.from({ length: cols * rows }, (_, i) => `rgb(${Math.round(px[i * 4] * 0.72)},${Math.round(px[i * 4 + 1] * 0.72)},${Math.round(px[i * 4 + 2] * 0.72)})`);
      buildAtlas();
    };

    const hash = (a: number, b: number) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };

    const frame = (time: number) => {
      if (!lum || !atlas) return;
      const t = (time - t0) / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, cv.width, cv.height);
      const sw = CW * dpr, sh = CH * dpr;
      // glyphs: the collage itself, faint, under its letters (so it reads as bg-2), then each letter in the
      // picture's own colour there (fillText; numbers stamp the grey atlas)
      if (!numbers) {
        const r = cv.width / dpr, h = cv.height / dpr;
        const k = Math.max(r / img.naturalWidth, h / img.naturalHeight);
        ctx.globalAlpha = 0.16;
        ctx.drawImage(img, (cv.width - img.naturalWidth * k * dpr) / 2, (cv.height - img.naturalHeight * k * dpr) / 2, img.naturalWidth * k * dpr, img.naturalHeight * k * dpr);
        ctx.font = `500 ${(CH - 1.2) * dpr}px ${getComputedStyle(cv).fontFamily || 'monospace'}`;
        ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      }
      const chars = GROUPS.join('');
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          let band: number, pick: number, streak = 0;
          if (numbers) {
            band = 0.06 * Math.sin(x * 0.07 + y * 0.09 - t * 1.6);
            // the flow: each column's digits stream down at its own speed (4–14 cells a second); the digit
            // in a cell is the stream's at that point, so they move through the still picture
            const speed = 4 + hash(x, 7) * 10;
            pick = hash(x * 1.7, Math.floor(y - t * speed));
            // a brighter streak running down with them, now and then
            const run = ((y - t * speed * 1.6 + hash(x, 3) * 400) % 46 + 46) % 46;
            if (run < 6) streak = (1 - run / 6) * 0.45;
          } else {
            band = 0.09 * Math.sin(x * 0.07 + y * 0.09 - t * 1.6) + 0.05 * Math.sin(x * 0.02 - y * 0.12 + t * 0.9);
            // a steady pick per cell, re-picked now and then (a different beat per cell)
            pick = hash(i, Math.floor((Math.floor(t * FPS) + hash(x, y) * 40) / 6));
          }
          // numbers: the picture's tones pushed apart (darks darker, lights lighter), as the references
          const raw = lum[i] + band;
          const tone = numbers ? Math.max(0, Math.min(1, (raw - 0.42) * 1.9 + 0.42)) : raw;
          const g = Math.max(0, Math.min(GROUPS.length - 1, Math.round(tone * (GROUPS.length - 1))));
          const slots = index[g];
          if (!slots.length) continue;
          const s = slots[Math.floor(pick * slots.length)];
          // ink with the darkness too, so the picture reads (weight alone is too even)
          const v = Math.max(0, Math.min(1, raw));
          // numbers: solid ink, two-tone (the texture marks lighter); letters: ink with the darkness
          if (numbers) {
            ctx.globalAlpha = Math.min(1, (g <= 3 ? 0.4 : g <= 5 ? 0.6 : 0.9) + streak);
            ctx.drawImage(atlas, s * sw, 0, sw, sh, x * sw, y * sh, sw, sh);
          } else {
            ctx.globalAlpha = Math.min(1, 0.3 + 0.7 * v);
            ctx.fillStyle = rgb[i];
            ctx.fillText(chars[s], x * sw + sw / 2, y * sh + sh / 2 + 0.3 * dpr);
          }
        }
      }
    };

    const loop = (time: number) => {
      raf = 0;
      if (time - last >= 1000 / FPS) { last = time; frame(time); }
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(loop); };

    img.onload = () => { prepare(); frame(performance.now()); };
    img.src = SRC;
    const ro = new ResizeObserver(() => { prepare(); frame(performance.now()); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
    io.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [numbers]);

  return <canvas ref={ref} className="tcl-dither" aria-hidden="true" />;
}
