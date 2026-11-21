'use client';

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';

/* Tool loops for the Collage "Motion" option (ToolsCollage.tsx, motion): each tool's own UI,
   rebuilt in SVG on a 720 × 370 canvas (the app's look, lightly trimmed) and played as a short
   walkthrough — the list view, a click into one post, its detail charts drawing in. One loop
   lasts LOOP seconds (4), the time the Collage gives each tool, and ends faded back to the start. */

export const LOOP = 4; // real seconds per loop (and per tool in the Collage cycle); was 8: faster per the client 2026-11-18 (2.5 too fast)
/* each tool's own loop, in the LOOPS order (Classifier, Weighted, Velocity, Clusters): the Classifier
   a little slower than the rest (client, 2026-11-18) */
export const LOOP_S = [6, LOOP, LOOP, LOOP];
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
// the play, the hold and the close as shares of the loop (were 6.6, 0.8 and 0.6 of 8 s)
const PLAY = 0.8, HOLD = 0.1;
export function toDesign(r: number, loop = LOOP) {
  const play = PLAY * loop, hold = HOLD * loop;
  if (r < play) return (r / play) * STORY;
  if (r < play + hold) return STORY;
  return STORY + ((r - play - hold) / (loop - play - hold)) * (DESIGN - STORY);
}

/* Detail-only loops (Weighted, Velocity, Clusters): they open straight on the detail view, whose
   story used to start at `from` (after the list and the click). The story is stretched over the
   whole of it (0 … STORY → from … STORY); the closing and the fade after it are unchanged. */
export const detailTime = (t: number, from: number) => (t >= STORY ? t : from + (t / STORY) * (STORY - from));

/* The avatars (public/assets/tools-motion/av), fetched and decoded before a loop needs them, so no
   loop stalls on an image the first time it shows (the Showcase calls this as the section nears). */
const AV = ['0xgaut', 'DarioAmodei', 'FT', 'JeffBezos', 'MKBHD', 'WSJ', 'amasad', 'balajis', 'bgurley', 'business', 'chamath',
  'demishassabis', 'dhh', 'drjimfan', 'elonmusk', 'emollick', 'garrytan', 'gdb', 'jack', 'jsngr', 'karaswisher', 'karpathy',
  'lennysan', 'levelsio', 'levie', 'morganhousel', 'naval', 'nytimes', 'patio11', 'patrickc', 'paularambles', 'paulg', 'pmarca',
  'rauchg', 'sama', 'satyanadella', 'shl', 'sundarpichai', 'tim_cook'];
const avSrc = (h: string) => `/assets/tools-motion/av/${h}.webp`;
let preloaded: HTMLImageElement[] | null = null;
export function preloadAvatars() {
  if (preloaded) return;
  preloaded = AV.map((h) => {
    const img = new Image();
    img.src = avSrc(h);
    img.decode?.().catch(() => { /* drawn when it arrives */ });
    return img;
  });
}

/* The loop's clock, in timeline units (0 … DESIGN). Runs while `playing`; holds where it is otherwise.
   Before it has ever played (and with reduced motion) it shows `poster`; mounted already playing (the
   next tool in a cycle) it starts at 0, not on a flash of the poster. `onEnd` is called each time a
   loop completes (the Showcase moves to the next tool on it, so a tool never changes mid-loop). */
/* `time` (timeline units) drives the loop from outside instead (the scroll, in Motion Scroll). */
export function useLoop(playing: boolean, poster: number, time?: number, onEnd?: () => void, loop = LOOP) {
  const [t, setT] = useState(() => (playing ? 0 : poster));
  const elapsed = useRef(-1);
  const end = useRef(onEnd);
  end.current = onEnd;
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setT(poster); return; }
    if (elapsed.current < 0) elapsed.current = 0;
    const start = performance.now() - elapsed.current * 1000;
    let raf = 0;
    const tick = (now: number) => {
      const prev = elapsed.current;
      // (a frame's timestamp can be a little before `start`: never below 0, or crossing back over 0
      // would count as a loop ending)
      elapsed.current = Math.max(prev, (now - start) / 1000);
      if (Math.floor(elapsed.current / loop) > Math.floor(prev / loop)) end.current?.();
      setT(toDesign(elapsed.current % loop, loop));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, poster, loop]);
  return time ?? t;
}

export const C = {
  page: '#fbfaf8', card: '#ffffff', rule: '#e9e7e2', grid: '#efeee9', ink: '#1c1b19', soft: '#4b4a46',
  mute: '#8a8883', faint: '#b9b7b1', green: '#1f7a3d', greenBg: '#e4f1e6', zone: '#eff6ef',
  teal: '#0e6b6b', tealSoft: '#a9cccc', tan: '#d8ccb2', blueGrey: '#cfe0e0', grey: '#dcdad5',
};

const Clip = createContext('');

/* Phones (≤559px, client feedback 2026-11-21: "the visual is in landscape"): each loop drawn on a portrait
   canvas, PW wide — the same drawing, its panels taken out of the 720 × 370 canvas and laid out one under
   another (or two side by side), each scaled to the width it gets, so they read larger than the whole
   landscape canvas shrunk to the phone. A part: [sx, sy, sw, sh] of the landscape canvas → at (dx, dy), dw
   wide (its height follows). The canvas is PH tall for every tool (the card doesn't jump as the tools turn
   over); a layout shorter than that sits in its middle. Keyed by the loop's title. */
export const PW = 400, PH = 600;
const HEAD = 56; // the title and, under it, the live line
type Part = [sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number];
const PORTRAIT: Record<string, Part[]> = {
  // the chart, full width; "Right now" and "Calls" side by side under it
  'Engagement Classifier': [[14, 44, 494, 314, 8, HEAD, 384], [516, 44, 190, 110, 8, HEAD + 252, 188], [516, 162, 190, 196, 204, HEAD + 252, 188]],
  // the contribution by type across the top; the score beside the score over time; the contributors
  'Weighted Engagement': [[240, 44, 466, 106, 8, HEAD, 384], [14, 44, 218, 106, 8, HEAD + 93, 150], [14, 158, 318, 200, 164, HEAD + 93, 228], [340, 158, 366, 200, 8, HEAD + 242, 384]],
  // the post; the chart cropped to the post's own run (to +30m: the projection after it left out); the three numbers
  'Post Velocity': [[14, 44, 692, 34, 8, HEAD, 384], [14, 84, 560, 200, 8, HEAD + 25, 384], [14, 292, 226, 66, 8, HEAD + 170, 188], [248, 292, 226, 66, 204, HEAD + 170, 188], [482, 292, 224, 66, 8, HEAD + 231, 188]],
  // the post and the insight, then where the views landed in two halves: the big three, then the rest
  'Cluster Penetration': [[14, 44, 692, 70, 8, HEAD, 384], [14, 120, 340, 240, 50, HEAD + 45, 300], [340, 120, 366, 240, 8, HEAD + 265, 384]],
};
const partsH = (ps: Part[]) => Math.max(...ps.map(([, , sw, sh, , dy, dw]) => dy + (dw * sh) / sw)) + 8;

function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 559px)');
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return phone;
}

export function Frame({ label, title, meta, children }: { label: string; title: string; meta: string; children: ReactNode }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  // drawn in the browser only: the server's and the browser's floating point differ in the last
  // digits of a few computed positions, which React would report as a hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const phone = usePhone();
  const parts = phone ? PORTRAIT[title] : undefined;
  if (parts) {
    const h = partsH(parts), top = (PH - h) / 2;
    return (
      <svg className="tm tm-portrait" viewBox={`0 ${-top} ${PW} ${PH}`} role="img" aria-label={label}>
        <defs>
          <clipPath id={`${id}c`} clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5" /></clipPath>
        </defs>
        <rect y={-top} width={PW} height={PH} fill={C.page} />
        <text x={16} y={26} className="tm-title">{title}</text>
        <text x={16} y={42} className="tm-m" fontSize={8.5} fill={C.soft}>
          <tspan fill={C.green}>● LIVE</tspan>
          <tspan fill={C.faint}>{'  |  '}</tspan>
          {meta}
        </text>
        {mounted && (
          <Clip.Provider value={`url(#${id}c)`}>
            {parts.map(([sx, sy, sw, sh, dx, dy, dw], i) => (
              <svg key={i} x={dx} y={dy} width={dw} height={(dw * sh) / sw} viewBox={`${sx} ${sy} ${sw} ${sh}`} overflow="hidden">
                {children}
              </svg>
            ))}
          </Clip.Provider>
        )}
      </svg>
    );
  }
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
      <image href={avSrc(h)} x={x - r} y={y - r} width={r * 2} height={r * 2} clipPath={clip} preserveAspectRatio="xMidYMid slice" />
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
