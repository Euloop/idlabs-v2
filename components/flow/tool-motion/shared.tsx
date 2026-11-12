'use client';

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';

/* Tool loops for the Collage "Motion" option (ToolsCollage.tsx, motion): each tool's own UI,
   rebuilt in SVG on a 720 × 370 canvas (the app's look, lightly trimmed) and played as a short
   walkthrough — the list view, a click into one post, its detail charts drawing in. One loop
   lasts LOOP seconds (8), the time the Collage gives each tool, and ends faded back to the start. */

export const LOOP = 8; // real seconds per loop (and per tool in the Collage cycle)
/* The loops are timed on a 10-unit timeline (DESIGN); the clock plays it in LOOP real seconds. */
export const DESIGN = 10;
export const W = 720, H = 370;

export const cl = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eout = (x: number) => 1 - Math.pow(1 - x, 3);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Path-keyframe helper: [time, value] pairs, eased between. */
export function keys(t: number, k: [number, number][]) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], eio(seg(t, k[i - 1][0], k[i][0])));
  }
  return k[k.length - 1][1];
}

/* Real seconds → timeline units. Every loop's story is done by 8.8 units; the rest is closing up
   and the fade. So the story plays in the first PLAY seconds, holds finished for HOLD, then the
   last units (closing, fade) run in what is left — the loop always ends complete with the cycle. */
export const STORY = 8.8;
const PLAY = 6.6, HOLD = 0.8;
export function toDesign(r: number) {
  if (r < PLAY) return (r / PLAY) * STORY;
  if (r < PLAY + HOLD) return STORY;
  return STORY + ((r - PLAY - HOLD) / (LOOP - PLAY - HOLD)) * (DESIGN - STORY);
}

/* The loop's clock, in timeline units (0 … DESIGN). Runs while `playing`; holds where it is otherwise.
   Before it has ever played (and with reduced motion) it shows `poster`. */
/* `time` (timeline units) drives the loop from outside instead (the scroll, in Motion Scroll). */
export function useLoop(playing: boolean, poster: number, time?: number) {
  const [t, setT] = useState(poster);
  const elapsed = useRef(-1);
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setT(poster); return; }
    if (elapsed.current < 0) elapsed.current = 0;
    const start = performance.now() - elapsed.current * 1000;
    let raf = 0;
    const tick = (now: number) => {
      elapsed.current = (now - start) / 1000;
      setT(toDesign(elapsed.current % LOOP));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, poster]);
  return time ?? t;
}

export const C = {
  page: '#fbfaf8', card: '#ffffff', rule: '#e9e7e2', grid: '#efeee9', ink: '#1c1b19', soft: '#4b4a46',
  mute: '#8a8883', faint: '#b9b7b1', green: '#1f7a3d', greenBg: '#e4f1e6', zone: '#eff6ef',
  teal: '#0e6b6b', tealSoft: '#a9cccc', tan: '#d8ccb2', blueGrey: '#cfe0e0', grey: '#dcdad5',
};

const Clip = createContext('');

export function Frame({ label, title, meta, children }: { label: string; title: string; meta: string; children: ReactNode }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  // drawn in the browser only: the server's and the browser's floating point differ in the last
  // digits of a few computed positions, which React would report as a hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <svg className="tm" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <defs>
        <clipPath id={`${id}c`} clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5" /></clipPath>
      </defs>
      <rect width={W} height={H} fill={C.page} />
      <text x={16} y={29} className="tm-title">{title}</text>
      <text x={W - 16} y={27} textAnchor="end" className="tm-m" fontSize={8.5} fill={C.soft}>
        <tspan fill={C.green}>● LIVE</tspan>
        <tspan fill={C.faint}>{'  |  '}</tspan>
        {meta}
      </text>
      {mounted && <Clip.Provider value={`url(#${id}c)`}>{children}</Clip.Provider>}
    </svg>
  );
}

export function Card({ x, y, w, h, o = 1 }: { x: number; y: number; w: number; h: number; o?: number }) {
  return <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={7} fill={C.card} stroke={C.rule} opacity={o} />;
}

export function Av({ h, x, y, r, ring }: { h: string; x: number; y: number; r: number; ring?: string }) {
  const clip = useContext(Clip);
  return (
    <g>
      {ring && <circle cx={x} cy={y} r={r + 2.2} fill="none" stroke={ring} strokeWidth={1} />}
      <circle cx={x} cy={y} r={r} fill={C.grey} />
      <image href={`/assets/tools-motion/av/${h}.webp`} x={x - r} y={y - r} width={r * 2} height={r * 2} clipPath={clip} preserveAspectRatio="xMidYMid slice" />
    </g>
  );
}

export function Pill({ x, y, text, w, tone = 'green', anchor = 'start' }: { x: number; y: number; text: string; w: number; tone?: 'green' | 'grey'; anchor?: 'start' | 'end' }) {
  const x0 = anchor === 'end' ? x - w : x;
  const g = tone === 'green';
  return (
    <g>
      <rect x={x0} y={y - 7.5} width={w} height={15} rx={7.5} fill={g ? C.greenBg : '#f1f0ec'} stroke={g ? 'none' : C.rule} />
      <text x={x0 + w / 2} y={y + 3} textAnchor="middle" fontSize={8} className={g ? '' : 'tm-m'} fill={g ? C.green : C.soft}>{text}</text>
    </g>
  );
}

/* The pointer: glides between points; `press` 0…1 dips it for a click. */
export function Cursor({ x, y, press = 0, o = 1 }: { x: number; y: number; press?: number; o?: number }) {
  const s = 1 - 0.14 * press;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} style={{ pointerEvents: 'none' }}>
      {press > 0 && <circle r={10 + 8 * press} fill="none" stroke={C.ink} strokeOpacity={0.25 * (1 - press)} />}
      <path d="M0 0 L0 14.5 L3.6 11 L6.2 16.6 L8.6 15.5 L6 10 L11 10 Z" fill={C.ink} stroke="#fff" strokeWidth={1.1} strokeLinejoin="round" />
    </g>
  );
}

/* A click at time `at`: 0 → 1 → 0 over 0.32s. */
export const click = (t: number, at: number) => Math.sin(Math.PI * seg(t, at - 0.12, at + 0.2));

/* The loop's end: everything fades out over the last 0.6s, and fades in over the first 0.4s. */
export const loopFade = (t: number) => Math.min(seg(t, 0, 0.4), 1 - seg(t, DESIGN - 0.6, DESIGN - 0.05));

/* Scene A (the list) gives way to scene B (the detail) at `at`. */
export function scenes(t: number, at: number) {
  const ka = eio(seg(t, at, at + 0.3)), kb = eio(seg(t, at + 0.22, at + 0.62));
  return { a: 1 - ka, b: kb, ax: -16 * ka, bx: 16 * (1 - kb) };
}

export function Spark({ x, y, w, h, pts, p = 1, color = C.green }: { x: number; y: number; w: number; h: number; pts: number[]; p?: number; color?: string }) {
  const n = pts.length - 1;
  const max = Math.max(...pts);
  const m = Math.max(1, Math.round(n * p));
  const d = pts.slice(0, m + 1).map((v, i) => `${i ? 'L' : 'M'}${(x + (i / n) * w).toFixed(1)} ${(y + h - (v / max) * h).toFixed(1)}`).join(' ');
  return <path d={d} fill="none" stroke={color} strokeWidth={1} strokeLinejoin="round" />;
}
