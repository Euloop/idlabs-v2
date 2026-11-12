'use client';

import { useEffect } from 'react';

/* A mouse trail of mono characters inside a grid band (after paper.design/mono): the pointer leaves
   a soft blot on the band's own grid — one character per grid square — that decays through
   a → * → z → - → · and is gone. Faster moves leave a bigger blot; each square has its own grain so
   the edges are ragged. The site's grey, IBM Plex Mono. A canvas the band's size, behind its
   content (the papers), drawing only while something is left to fade. Mouse only; off with
   reduced motion. `cols`: the band's grid squares across (its grid starts at its top-left). */

const RAMP: [number, string][] = [[0.86, 'a'], [0.66, '*'], [0.46, 'z'], [0.27, '-'], [0.09, '·']];
const DECAY = 0.972; // per frame at 60fps (a full blot fades in ~1.7s)
const R = 4.2; // blot radius, in squares

export default function MonoTrail({ selector, cols: COLS = 64 }: { selector: string; cols?: number }) {
  useEffect(() => {
    const band = document.querySelector<HTMLElement>(selector);
    if (!band) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // made here, not by React: it lives inside the band (another component's)
    const canvas = document.createElement('canvas');
    canvas.className = 'mono-trail';
    canvas.setAttribute('aria-hidden', 'true');
    const prevPos = band.style.position, prevIso = band.style.isolation;
    if (getComputedStyle(band).position === 'static') band.style.position = 'relative';
    band.style.isolation = 'isolate';
    band.prepend(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    let W = 0, H = 0, cell = 1, rows = 0, dpr = 1;
    let field = new Float32Array(0), grain = new Float32Array(0);
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = band.clientWidth; H = band.clientHeight;
      cell = W / COLS;
      rows = Math.max(1, Math.ceil(H / cell));
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      field = new Float32Array(COLS * rows);
      grain = new Float32Array(COLS * rows).map((_, i) => {
        const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
        return 0.7 + 0.6 * (x - Math.floor(x));
      });
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(band);

    let raf = 0, last = performance.now(), px = NaN, py = NaN;
    const deposit = (x: number, y: number, amt: number) => {
      const c0 = x / cell, r0 = y / cell;
      for (let r = Math.max(0, Math.floor(r0 - R)); r <= Math.min(rows - 1, Math.ceil(r0 + R)); r++) {
        for (let c = Math.max(0, Math.floor(c0 - R)); c <= Math.min(COLS - 1, Math.ceil(c0 + R)); c++) {
          const d = Math.hypot(c + 0.5 - c0, r + 0.5 - r0) / R;
          if (d >= 1) continue;
          const i = r * COLS + c;
          field[i] = Math.min(1.15, field[i] + amt * Math.pow(1 - d, 1.4) * grain[i]);
        }
      }
    };

    const draw = (now: number) => {
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      const k = Math.pow(DECAY, dt);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = `400 ${Math.max(8, Math.round(cell * 0.68))}px "IBM Plex Mono", ui-monospace, monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      let alive = false;
      for (let i = 0; i < field.length; i++) {
        let v = field[i];
        if (v <= 0) continue;
        v *= k;
        if (v < 0.05) { field[i] = 0; continue; }
        field[i] = v;
        alive = true;
        const ch = RAMP.find(([t]) => v >= t)?.[1];
        if (!ch) continue;
        const c = i % COLS, r = (i / COLS) | 0;
        // the site's grey: darker and stronger where the blot is dense
        const a = Math.min(1, v);
        const g = Math.round(178 - 38 * a);
        ctx.fillStyle = `rgba(${g}, ${g}, ${g - 4}, ${(0.26 + 0.34 * a).toFixed(3)})`;
        ctx.fillText(ch, (c + 0.5) * cell + 0.5, (r + 0.5) * cell + 1);
      }
      raf = alive ? requestAnimationFrame(draw) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const b = band.getBoundingClientRect();
      const x = e.clientX - b.left, y = e.clientY - b.top;
      if (x < 0 || y < 0 || x > b.width || y > b.height) { px = NaN; return; }
      if (Number.isNaN(px)) { px = x; py = y; }
      const dist = Math.hypot(x - px, y - py);
      // along the path, a blot every half square; faster moves leave more
      const steps = Math.max(1, Math.ceil(dist / (cell / 2)));
      const amt = Math.min(0.85, 0.3 + dist / 90);
      for (let s = 1; s <= steps; s++) deposit(px + ((x - px) * s) / steps, py + ((y - py) * s) / steps, amt / Math.sqrt(steps));
      px = x; py = y;
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(draw); }
    };
    const onScroll = () => { px = NaN; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll);
      canvas.remove();
      band.style.position = prevPos; band.style.isolation = prevIso;
    };
  }, [selector, COLS]);

  return null;
}
