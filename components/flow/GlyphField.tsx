'use client';

import { useEffect, useRef } from 'react';

/* The tools' colour field as a typed research plate (feedback 2026-11-16, ?toolsBg=type; the client's
   reference: a poster whose pictures are set in typewriter characters, on white, with sparse mono labels,
   and architectural drawings' dot grids). On paper white:
   - a drafting grid: a dot every cell, a cross every fifth;
   - two figures generated from the maths, no pictures, typed in characters from the numbers and equations
     themselves — a density ramp of · : - = + 1 7 3 φ 8 Σ # — ordered-dithered (Bayer 8 × 8) so their edges
     dissolve into the page: the golden construction (its squares and the spiral's quarter arcs) right; engagement curves against their own
     baseline left, the few that climb away typed heavier;
   - a small table of engagement figures between them (time, engagements, velocity against baseline);
   - mono labels and formulas set on the grid, about the research.
   Drawn once per size on a canvas (crisp at the screen's density); a few cells re-type every 700ms within
   their own density, so the plate is quietly alive while on screen — still for reduced motion. */

const RAMP = ' ·:-=+173φ8Σ#';
// cells of equal weight swap among these when re-typed (the ramp's middle has look-alikes)
const ALT: Record<string, string> = { '1': '17', '7': '71', '3': '35', '8': '80', φ: 'φ∅', Σ: 'Σ∑', '=': '=≈', '+': '+×' };
const B8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

const PAPER = '#f4f3ef';
const INK = '#2b2b2b';
const GRID = '#cfcdc6';
const NOTE = '#3a3a3a';

// The figures, generated — no pictures: each a darkness 0…1 at (u, v) in its region (0…1 across, down;
// `ar` its width over height), typed through the ramp. Regions: fractions of the field (x0, y0, x1, y1).
const PHI = (1 + Math.sqrt(5)) / 2;
// a seeded random, so the curves are the same on every draw
const rand = (() => { let a = 7; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
// 36 posts' engagement against their own baseline, by age: most settle under it, a few climb away
const CURVES = Array.from({ length: 36 }, (_, i) => {
  const viral = i % 9 === 0;
  return { k: viral ? 0.55 + rand() * 0.35 : -(0.15 + rand() * 0.65), bend: 1.4 + rand() * 1.6, viral };
});
// the standing construction in a unit golden rectangle: x in widths, y and side in heights; c, the arc's
// centre as a corner of its square (0/1 across, 0/1 down) — top, left, bottom, right in turn
const CON = (() => {
  let x = 0, y = 0, w = 1 / PHI, h = 1; // in heights
  const squares: { x: number; y: number; s: number; c: [number, number] }[] = [];
  for (let i = 0; i < 9; i++) {
    const k = i % 4;
    const s = k % 2 === 0 ? w : h;
    if (k === 0) { squares.push({ x, y, s, c: [1, 1] }); y += s; h -= s; }
    else if (k === 1) { squares.push({ x, y, s, c: [1, 0] }); x += s; w -= s; }
    else if (k === 2) { squares.push({ x, y: y + h - s, s, c: [0, 0] }); h -= s; }
    else { squares.push({ x: x + w - s, y, s, c: [0, 1] }); w -= s; }
  }
  // x was in heights too: express it in widths for the caller (x · φ), keeping s in heights
  return { squares: squares.map((q) => ({ ...q, x: q.x * PHI })) };
})();
const FIGS: { r: [number, number, number, number]; f: (u: number, v: number, ar: number) => number }[] = [
  // Fig. 2 — the golden construction, standing (as the loader's): squares cut in turn, each with its
  // quarter arc — together the spiral — the arcs typed heaviest, the squares' edges light, every other
  // square a faint tone
  {
    r: [0.6, 0.18, 0.97, 0.98],
    f: (u, v, ar) => {
      const h = Math.min(0.92, (0.92 * ar) * PHI), w = h / PHI;
      const X = u * ar - (ar - w) / 2, Y = v - (1 - h) / 2;
      if (X < -0.01 || Y < -0.01 || X > w + 0.01 || Y > h + 0.01) return 0;
      const lw = 0.006; // a line, as a fraction of the plate's height
      let d = 0;
      for (const [i, q] of CON.squares.entries()) {
        const sx = q.x * w, sy = q.y * h, ss = q.s * h;
        if (X < sx - lw || Y < sy - lw || X > sx + ss + lw || Y > sy + ss + lw) continue;
        // the square's edge
        const edge = Math.min(Math.abs(X - sx), Math.abs(X - sx - ss), Math.abs(Y - sy), Math.abs(Y - sy - ss));
        if (edge < lw) d = Math.max(d, 0.4);
        // its arc: about the corner the spiral turns on, radius the side
        const [cx, cy] = q.c;
        const dist = Math.abs(Math.hypot(X - (sx + cx * ss), Y - (sy + cy * ss)) - ss);
        d = Math.max(d, Math.exp(-((dist / (lw * 2.4)) ** 2)));
        // every other square a faint tone, so the cuts read
        if (i % 2 === 0) d = Math.max(d, 0.09);
      }
      return d;
    },
  },
  // Fig. 1 — engagement rate against each post's own baseline, by age (log time): the baseline dashed
  {
    r: [0.02, 0.42, 0.4, 0.98],
    f: (u, v) => {
      const t = u; // age, 0 → 12h
      const base = 0.55; // the baseline, as a height in the plate
      let d = 0;
      for (const c of CURVES) {
        // after the first 15 minutes (t 0.18) each curve leaves the baseline, as e(t)/e₀ − 1 ∝ k · (t − t₀)^bend
        const tt = Math.max(0, t - 0.18);
        const y = base - c.k * 0.5 * Math.pow(tt / 0.82, c.bend);
        const w = c.viral ? 0.022 : 0.012;
        d = Math.max(d, (c.viral ? 1 : 0.42) * Math.exp(-(((v - y) / w) ** 2)));
      }
      const dash = Math.abs(v - base) < 0.008 && Math.floor(u * 60) % 2 === 0 ? 0.9 : 0;
      const axis = u < 0.01 || v > 0.985 ? 0.6 : 0;
      return Math.min(1, d + dash + axis);
    },
  },
];
// labels on the grid: x, y (fractions), lines
const LABELS: [number, number, string[]][] = [
  [0.03, 0.06, ['IDENTITY LABS /', 'RESEARCH PLATE 04']],
  [0.3, 0.06, ['REACH ∝ Σ wᵢ · eᵢ', 'w: ENGAGER INFLUENCE']],
  [0.56, 0.06, ['v(t) = Δe / Δt', 't ≤ 30 MIN']],
  [0.8, 0.06, ['n = 2,000,000,000+', 'DATA POINTS']],
  [0.03, 0.3, ['FIG. 1 — RATE VS OWN BASELINE,', 'n = 36 POSTS, 0–12 H']],
  [0.62, 0.15, ['FIG. 2 — THE GOLDEN CONSTRUCTION,', 'a / b = (a + b) / a = φ']],
];
// the table: velocity against the post's own baseline, minute by minute
const TABLE = ['  t     e       v/v₀', ...[5, 10, 15, 20, 25, 30].map((t, i) => {
  const e = Math.round(38 * t * (1 + i * 0.21));
  return `${String(t).padStart(3)}m  ${String(e).padStart(5)}   ${(1 + i * 0.29).toFixed(2)}×`;
}), '', 'P(viral | v/v₀ > 1.4) = 0.62'];

export default function GlyphField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mono = getComputedStyle(document.documentElement).getPropertyValue('--mono').trim() || 'monospace';
    let cells: { x: number; y: number; ch: string }[] = [];
    let cw = 6, ch = 9, live = true, on = false, timer = 0;

    const draw = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const { width: W, height: H } = cv.getBoundingClientRect();
      if (!W || !H) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the type scales a little with the field (8–10px)
      const fs = Math.max(8, Math.min(10, W / 130));
      cw = fs * 0.6; ch = fs * 1.05;
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);

      // the drafting grid
      const g = fs * 2.4;
      ctx.fillStyle = GRID;
      for (let y = g, j = 1; y < H; y += g, j++) for (let x = g, i = 1; x < W; x += g, i++) {
        if (i % 5 === 0 && j % 5 === 0) { ctx.fillRect(x - 3, y - 0.5, 6, 1); ctx.fillRect(x - 0.5, y - 3, 1, 6); }
        else ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      }

      // the figures, typed
      ctx.font = `${fs}px ${mono}`;
      ctx.textBaseline = 'top';
      cells = [];
      FIGS.forEach((fig) => {
        const [x0, y0, x1, y1] = fig.r;
        const cols = Math.floor(((x1 - x0) * W) / cw), rows = Math.floor(((y1 - y0) * H) / ch);
        if (cols < 4 || rows < 4) return;
        const ar = ((x1 - x0) * W) / ((y1 - y0) * H);
        ctx.fillStyle = INK;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          // the plate's edges fade out, so it dissolves into the page
          const ex = Math.min(c, cols - 1 - c) / (cols * 0.12), ey = Math.min(r, rows - 1 - r) / (rows * 0.12);
          const v = fig.f((c + 0.5) / cols, (r + 0.5) / rows, ar) * Math.min(1, ex, ey) * (RAMP.length - 1);
          const lo = Math.floor(v);
          const k = Math.min(RAMP.length - 1, v - lo > B8[(r & 7) * 8 + (c & 7)] ? lo + 1 : lo);
          if (k <= 0) continue;
          const x = x0 * W + c * cw, y = y0 * H + r * ch, t = RAMP[k];
          ctx.fillText(t, x, y);
          if (ALT[t]) cells.push({ x, y, ch: t });
        }
      });

      // the table and the labels
      ctx.fillStyle = NOTE;
      ctx.font = `${fs}px ${mono}`;
      TABLE.forEach((line, i) => ctx.fillText(line, 0.43 * W, 0.64 * H + i * fs * 1.6));
      LABELS.forEach(([x, y, lines]) => lines.forEach((line, i) => ctx.fillText(line, x * W, y * H + i * fs * 1.5)));
    };

    // re-type a few cells within their weight: clear the cell to paper (the grid dot under it is lost,
    // which reads as the type covering it) and set its look-alike
    const tick = () => {
      if (!live || !on || !cells.length) return;
      ctx.font = `${(ch / 1.05)}px ${mono}`;
      for (let n = 0; n < Math.max(6, cells.length * 0.015); n++) {
        const c = cells[(Math.random() * cells.length) | 0];
        const a = ALT[c.ch];
        const next = a[(a.indexOf(c.ch) + 1) % a.length] ?? c.ch;
        ctx.fillStyle = PAPER; ctx.fillRect(c.x, c.y, cw, ch);
        ctx.fillStyle = INK; ctx.fillText(next, c.x, c.y);
        c.ch = next;
      }
    };

    document.fonts?.ready.then(() => { if (live) draw(); });
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(cv);
    if (!reduce) timer = window.setInterval(tick, 700);
    return () => { live = false; ro.disconnect(); io.disconnect(); clearInterval(timer); };
  }, []);
  return <canvas ref={ref} className="tsc-dither tsc-glyph" aria-hidden="true" />;
}
