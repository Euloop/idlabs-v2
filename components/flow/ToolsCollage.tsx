'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import ScrollText, { type ScrollTextHandle } from '../ScrollText';
import './tools-collage.css';
import { LOOP_S } from './tool-motion/shared';
import Classifier from './tool-motion/Classifier';
import Weighted from './tool-motion/Weighted';
import Velocity from './tool-motion/Velocity';
import Clusters from './tool-motion/Clusters';
import DitherBg from './DitherBg';
import ResearchTerminal, { type ResearchTerminalHandle } from './ResearchTerminal';

/* Motion (the "Motion" layout, White): in place of the two screenshots, one window per tool
   playing a walkthrough of the tool's own UI (tool-motion/), a loop per turn of the cycle. */
export const LOOPS = [Classifier, Weighted, Velocity, Clusters];
/* Motion: the walkthrough window, as large as the card allows beside a narrower text column (the
   client: all the text on the left, the walkthrough bigger). 720:370, centred on the card's height. */
const MOTION_RECT = { x: 306, y: 68.5, w: 642, h: 330 };
/* Motion Scroll (scroll): no cycle — once the card is in, the section stays pinned and the scroll
   moves through the tools, PER screens each; each tool's walkthrough plays on its own clock (from
   its start when the tool comes up, looping while it stays). The active name's bar shows how far
   through its stretch you are; a name click scrolls to that tool. Phones (no pin) keep the cycle. */
const PER = 0.7, HOLD_AT = 0.86; // 0.7 screen per tool (was 1.6, then 1.0: the client wanted it faster, 2026-11-18)

/* Analytical tools, "Collage" layout (/home-2; option to Graph, Device and Stack). Figma
   "Tool section variant 4" (163:713, white) and "… - paper light theme" (165:762). A collage of
   archive scraps fills the frame rule to rule; a frosted glass card sits over it. Left: the title,
   the active tool's lead line and the four tool names. Right: two of the tool's own views (the
   ones with a chart in them), each with a note on a leader (text, a run, a bend, a dot on the
   image). The tools cycle on their own (7s); click a name to pick one; cycling pauses while the
   pointer is on the card. `theme`: white, paper (the paper light theme: warm paper page, its own rules) or dark (the same sheet
   in the dark: brown-black paper, the collage dimmed to sepia, the glass smoked).
   All copy is the client's (the tool texts and the tools intro, cut at sentence or clause
   boundaries, never reworded). Coordinates are Figma px in the card (972 × 467); the CSS scales
   them with the frame (--u). */

type Shot = { src: string; w: number; h: number; alt: string };
type Tool = {
  name: string;
  href: string;
  lead: string;
  /* a: the image the upper note points at, b: the one the lower note points at */
  a: Shot; b: Shot;
  noteA: string; noteB: string;
  /* row: b | a side by side (b on the left); col: a over b */
  layout: 'row' | 'col';
  /* Motion: the text under the lead — the client's final copy for each tool, word for word (2026-11-22; do
     not edit). mB may be empty (one paragraph) */
  mA: string; mB: string;
  /* Showcase: the caption under the window, the lead and the walkthrough in one short text (two lines) */
  cap: string;
};

const S = (f: string, w: number, h: number, alt: string): Shot => ({ src: `/assets/tools/${f}.webp`, w, h, alt });

export const TOOLS: Tool[] = [
  {
    name: 'Engagement Classifier',
    href: 'https://graphs-seven-pi.vercel.app/tools/classifier',
    lead: 'A post is only fast or slow compared to itself.',
    a: S('classifier-4', 818, 649, 'Rate vs baseline: each post’s engagement rate against its own first 15 minutes'),
    b: S('classifier-3', 320, 499, 'Calls: posts the classifier marks as emerging'),
    noteA: 'The classifier takes a post’s engagement rate in its first 15 minutes as a baseline and measures its performance after against it.',
    noteB: 'This lets us predict how far a post will go within 30 minutes.',
    layout: 'row',
    mA: 'The classifier takes a post’s engagement rate in its first 15 minutes as a baseline and measures its performance after against it.',
    mB: 'This lets us predict how far a post will go within 30 minutes.',
    cap: 'A post is only fast or slow compared to itself. Each is measured against its own first 15 minutes; the few that climb are called viral within 30 minutes.',
  },
  {
    name: 'Weighted Engagement Scoring',
    href: 'https://graphs-seven-pi.vercel.app/tools/scoring',
    lead: 'A 100 likes from a 100 strangers is not the same as 1 quote from someone important.',
    a: S('weighted-score', 920, 307, 'Weighted score and its contribution by type of action'),
    b: S('weighted-curve', 560, 299, 'Weighted score over time against the raw baseline'),
    noteA: 'Weighted Engagement scores each interaction by who performed it -their influence, their cluster, the kind of action.',
    noteB: 'Weights every engagement by the engager’s influence',
    layout: 'col',
    mA: 'Weighted Engagement scores each interaction by who performed it -their influence, their cluster, the kind of action.',
    mB: '',
    cap: '100 likes from strangers are not worth one quote from someone important. Every interaction is scored by who made it: influence, cluster, action.',
  },
  {
    name: 'Post Velocity',
    href: 'https://graphs-seven-pi.vercel.app/tools/velocity',
    lead: 'Tracks how fast engagement is accelerating in real time.',
    a: S('velocity-5', 1120, 452, 'Total views over time for one post'),
    b: S('velocity-1', 806, 302, 'Projected views with the typical range'),
    noteA: 'A steep curve in the first 6 hours is the strongest predictor of a breakout.',
    noteB: 'Combined with the Classifier, it tells us how a launch/post will perform within its first 30 minutes.',
    layout: 'col',
    mA: 'A steep curve in the first 6 hours is the strongest predictor of a breakout.',
    mB: 'Combined with the Classifier, it tells us how a launch/post will perform within its first 30 minutes.',
    cap: 'Tracks how fast engagement accelerates in real time. Views are sampled every 30 seconds: at +42m this post runs ×11.5 a typical one.',
  },
  {
    name: 'Cluster Penetration',
    href: 'https://graphs-seven-pi.vercel.app/tools/clusters',
    lead: 'Measures how deep a post travelled within a niche.',
    a: S('cluster-3', 1120, 520, 'Where the views landed, by cluster'),
    b: S('cluster-2', 1120, 367, 'Penetration by cluster'),
    noteA: 'When a post goes out, we can see which clusters it reached',
    noteB: 'and how much of each it covered.',
    layout: 'col',
    mA: 'When a post goes out, we can see which clusters it reached and how much of each it covered.',
    mB: '',
    cap: 'Measures how deep a post travels within a niche: which clusters it reached, and how much of each. One quote at +5h carried this one into five more.',
  },
];

/* The images' box in the card: centred where the design has them (436–916 × 114–362), at most
   480 wide; side by side at most 248 tall (the design's), stacked at most 256 (so 12px notes of
   three or four lines still fit above and below inside the card). */
const CX = 676, CY = 238, MAXW = 480, MAXH_ROW = 248, MAXH_COL = 256, GAP = 8, COL_DROP = 12;
type Rect = { x: number; y: number; w: number; h: number };
function place(t: Tool): { a: Rect; b: Rect } {
  const ra = t.a.w / t.a.h, rb = t.b.w / t.b.h;
  if (t.layout === 'row') {
    const h = Math.min(MAXH_ROW, (MAXW - GAP) / (ra + rb));
    const wb = h * rb, wa = h * ra, x0 = CX - (wb + GAP + wa) / 2, y = CY - h / 2;
    return { b: { x: x0, y, w: wb, h }, a: { x: x0 + wb + GAP, y, w: wa, h } };
  }
  const w = Math.min(MAXW, (MAXH_COL - GAP) / (1 / ra + 1 / rb));
  // stacked pairs sit COL_DROP lower, where the lower note has room to spare
  const ha = w / ra, hb = w / rb, x = CX - w / 2, y0 = CY + COL_DROP - (ha + GAP + hb) / 2;
  return { a: { x, y: y0, w, h: ha }, b: { x, y: y0 + ha + GAP, w, h: hb } };
}

/* Leaders, from the design's two vectors (129, 130): 1px ink, a dot of r 2.67.
   Upper note → image a: from the note's last line, RUN across, then a short slant down to a dot
   just above the image. Lower note ← image b: a dot just below the image, a slant down, then
   across to the note's line. Notes are 12px on an 18px line (LINE = half of it); the lower
   note is narrowed when needed so it ends NOTE_EDGE inside the card's right edge. */
const RUN = 48, SLANT_X = 8, SLANT_Y = 34, SLANT_YB = 24, CLEAR_A = 11, CLEAR_B = 9, TEXT_GAP = 10, NOTE_W = 300, NOTE_EDGE = 20, LINE = 9;
function leaders(r: { a: Rect; b: Rect }, wA = NOTE_W) {
  const da = { x: r.a.x + r.a.w * 0.8, y: r.a.y - CLEAR_A };
  const ya = da.y - SLANT_Y, xa0 = da.x - SLANT_X - RUN;
  const db = { x: r.b.x + r.b.w * 0.42, y: r.b.y + r.b.h + CLEAR_B };
  const yb = db.y + SLANT_YB, xb1 = db.x + SLANT_X + RUN / 2;
  const left = xb1 + TEXT_GAP;
  return {
    a: { d: `M${xa0} ${ya} H${da.x - SLANT_X} L${da.x} ${da.y}`, dot: da, note: { right: xa0 - TEXT_GAP, bottom: ya + LINE, width: wA } },
    b: { d: `M${db.x} ${db.y} L${db.x + SLANT_X} ${yb} H${xb1}`, dot: db, note: { left, top: yb - LINE, width: Math.min(NOTE_W, 972 - NOTE_EDGE - left) } },
  };
}

/* The collage behind the card (Figma "Tool section bg 3", 176:87; was 163:728), in paint order, box px (1056 × 569).
   [file, left, top, width, height, blend?, rotate°?, inner w, inner h, opacity?, fit-top?] —
   rotated scraps: the box is the rotated image's bounds and the image (inner w × h) is centred in it. */
type Scrap = { f: string; x: number; y: number; w: number; h: number; blend?: CSSProperties['mixBlendMode']; rot?: number; iw?: number; ih?: number; o?: number; top?: boolean };
const SCRAPS: Scrap[] = [
  { f: 'c1', x: 579, y: -31, w: 750, h: 852 }, // "Tool section bg 3" (176:87): the new right-hand piece
  { f: 'c2', x: 308, y: -70, w: 400, h: 400, blend: 'darken' },
  { f: 'c3', x: 171, y: 95, w: 424, h: 516, blend: 'darken' },
  { f: 'c4', x: 551, y: 316, w: 214.743, h: 287.825, blend: 'lighten', rot: -11.43, iw: 166.523, ih: 259.98 },
  { f: 'c5', x: -35, y: -70, w: 392, h: 496, top: true },
  { f: 'c6', x: 401, y: 190, w: 275.116, h: 196.269, blend: 'darken', rot: -14.04, iw: 248.539, ih: 140.176 },
  { f: 'c7', x: 0, y: 190, w: 242, h: 381 },
  { f: 'c8', x: 124, y: 236, w: 325.723, h: 325.723, blend: 'multiply', rot: -21.58, iw: 251, ih: 251, o: 0.67 },
  { f: 'c9', x: 475.43, y: 177.52, w: 178.137, h: 220.961, rot: 4.89, iw: 161, ih: 208 },
];

const CYCLE_MS = 7000;

/* White: an immersive arrival. The section pins for longer; the research line types in, centred
   on the white page, then lifts away while the collage builds behind it — the scraps float up one
   by one, then the paper ground, the glass card and the card's contents in turn. All scroll
   driven (damped, so it glides) and reversible. The scraps keep a slight depth drift. Phones keep
   the plain layout. Values go to CSS variables on the section (--a-*), read by both collage
   copies (the one behind the card and its blurred twin), so they always match. */
const INTRO =
  'We turned this research into software, built on 2B+ data points, that weights every engagement by the engager’s influence, measures engagement velocity in real time, and maps how deep a post penetrates each niche, to forecast its reach and shelf-life within the first 30\u00a0minutes.';
const DEPTH = [0.4, 0.9, 0.6, 1.3, 0.5, 1.1, 0.7, 1.4, 1.0]; // per scrap, for the drift
// in screens of scroll from the pin's start (negative: still arriving)
// typed line, a hold to read it, out; the pictures one by one; then the paper colour fills the
// rectangle from its centre; the card; its contents; a hold to read (the pin ends at 3.5)
const T_WHITE = { typeA: -0.6, typeB: 0.3, textOutA: 0.7, textOutB: 0.97, scrap0: 0.8, scrapStep: 0.08, scrapLen: 0.34, bgA: 1.62, bgB: 1.95, cardA: 1.88, cardB: 2.18, inA: 2.05, inStep: 0.08, inLen: 0.2, shots: [2.25, 2.45], lines: [2.4, 2.6], notes: [2.52, 2.7], live: 2.7, drift0: 2.7 }; // done at 2.7, a short hold, release at 3.5
/* Gather: the same build, but it opens on the line set large in serif, with the nine collage pieces
   floating loose around it across the whole screen, rising with the scroll (as the launches field).
   Then each piece travels in, straightens and settles into its place in the collage; the paper
   colour fills, the card and its contents come in as in White. */
/* Research live (`research`, /home-4): the line, then in place of the collage a 16:9 box of research
   running (ResearchTerminal) opens from its centre and types in with the scroll (termA–termB); once it
   is done the glass card comes up over it, the research blurred behind and still running. */
const T_R = { ...T_WHITE, bgA: 0.85, bgB: 1.15, termA: 1.0, termB: 2.3, cardA: 2.4, cardB: 2.7, inA: 2.57, shots: [2.77, 2.97], lines: [2.92, 3.12], notes: [3.04, 3.22], live: 3.22, drift0: 3.22 };
/* Motion glyphs / Motion numbers (`dither`, /home-4): Motion scroll with the new collage (Figma 213:618)
   drawn in small moving letters and numbers, or in flowing digits (`dither='numbers'`) (DitherBg). The intro line types in as in Motion scroll; then, with no build, the dithered frame
   and the card come into view together (one rise, bgA–bgB = cardA–cardB); then a screen per tool. */
const T_D = { ...T_WHITE, bgA: 0.78, bgB: 1.08, cardA: 0.78, cardB: 1.08, inA: 0.8, inStep: 0.03, inLen: 0.18, shots: [0.84, 1.0], lines: [0.9, 1.06], notes: [0.96, 1.12], live: 1.2, drift0: 1.2 };
// Research sequence: the pieces one by one need more room (2.8 screens, then the settle), the rest after
/* Research sequence (feedback 2026-11-16): the scroll only starts it — termA–termB brings the first piece
   in — then it plays itself out on its own clock (ResearchTerminal), and the card comes up by itself when
   it ends (html… section[data-seq-done], tools-collage.css); so the card's steps are all at termB here,
   gated by that, and the tools follow from live. */
// the card's steps on the frame's (bgA–bgB): going back up they go together; coming down the card waits
// for the sequence anyway. termA from bgA too: it resets only once the frame has closed.
// the line goes first (textOut, done by 0.72), then the frame and card (0.74–0.96): never on screen
// together, coming down or going back up (feedback 2026-11-16: the line came back over the card)
/* Research sequence · scroll: the scroll drives the run itself — the pieces over termA–termB (3.2 screens),
   then the card; the line and the frame in the same order as the auto one */
const T_SS = { ...T_R, textOutA: 0.5, textOutB: 0.72, bgA: 0.74, bgB: 0.96, termA: 1.0, termB: 4.2, cardA: 4.3, cardB: 4.6, inA: 4.47, shots: [4.67, 4.87], lines: [4.82, 5.02], notes: [4.94, 5.12], live: 5.12, drift0: 5.12 };
const T_S = { ...T_R, textOutA: 0.5, textOutB: 0.72, bgA: 0.74, bgB: 0.96, termA: 0.74, termB: 1.0, cardA: 0.74, cardB: 0.96, inA: 0.74, inStep: 0, inLen: 0.22, shots: [0.74, 0.96], lines: [0.74, 0.96], notes: [0.74, 0.96], live: 1.3, drift0: 1.3 }; // the tools start a little after, so a stray scroll tick as it ends still lands on the first
const TG = { typeA: -0.6, typeB: 0.25, textOutA: 0.95, textOutB: 1.3, gather0: 1.0, gatherStep: 0.08, gatherLen: 0.9, bgA: 2.35, bgB: 2.7, cardA: 2.65, cardB: 2.95, inA: 2.82, inStep: 0.08, inLen: 0.2, shots: [3.02, 3.22], lines: [3.17, 3.37], notes: [3.27, 3.45], live: 3.45, drift0: 3.45 }; // release at 4.3
// where each piece floats (centre, as a fraction of the screen from its middle), its tilt and depth
const FLOAT: { x: number; y: number; r: number; d: number }[] = [
  { x: -0.33, y: -0.27, r: -4, d: 1.1 }, { x: 0.37, y: -0.32, r: 3, d: 0.8 }, { x: -0.4, y: 0.12, r: 2, d: 0.7 },
  { x: 0.43, y: 0.06, r: -3, d: 1.2 }, { x: -0.22, y: 0.42, r: 4, d: 0.9 }, { x: 0.39, y: 0.42, r: -2, d: 1.0 },
  { x: -0.06, y: -0.42, r: 3, d: 0.6 }, { x: 0.16, y: 0.5, r: -4, d: 1.3 }, { x: -0.46, y: -0.08, r: 5, d: 0.75 },
];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const spanT = (y: number, a: number, b: number) => clamp01((y - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10); // gentler start and landing
const v = (n: number) => `calc(${n.toFixed(2)} * var(--u))`;

function Scraps({ blur = false }: { blur?: boolean }) {
  return (
    <div className={blur ? 'tcl-scraps tcl-blur' : 'tcl-scraps'} aria-hidden="true">
      <div className="tcl-scraps-in">
      {SCRAPS.map((s, i) => (
        <div key={s.f} className="tcl-scrap" style={{ left: v(s.x), top: v(s.y), width: v(s.w), height: v(s.h), mixBlendMode: s.blend,
          // laid down like paper: slides up into place while it unmasks from the bottom edge up
          // (Gather overrides all three per piece: --a-o, --a-k, --a-t)
          opacity: `var(--a-o${i}, min(1, var(--a-s${i}, 1) * 3))`,
          clipPath: `var(--a-k${i}, inset(calc((1 - var(--a-s${i}, 1)) * 100%) -40px -40px -40px))`,
          transform: `var(--a-t${i}, translate3d(0, calc((1 - var(--a-s${i}, 1)) * 64px + var(--a-d${i}, 0px)), 0) rotate(calc((1 - var(--a-s${i}, 1)) * -2.5deg)))` } as CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/assets/tools-collage/${s.f}.webp`} alt="" draggable={false}
            className={s.top ? 'tcl-fit-top' : undefined}
            style={s.rot !== undefined ? { width: v(s.iw!), height: v(s.ih!), rotate: `${s.rot}deg`, opacity: s.o, inset: 'auto', left: '50%', top: '50%', translate: '-50% -50%' } : undefined} />
        </div>
      ))}
      </div>
    </div>
  );
}

export type CollageTheme = 'white' | 'gather' | 'paper' | 'dark';

export default function ToolsCollage({ theme = 'white', motion = false, scroll = false, intro = 'small', research = false, dither = false }: { theme?: CollageTheme; motion?: boolean; scroll?: boolean; intro?: 'small' | 'large'; research?: boolean | 'scatter' | 'sequence' | 'auto'; dither?: boolean | 'numbers' }) {
  const termRef = useRef<ResearchTerminalHandle>(null);
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const immersive = theme === 'white' || theme === 'gather';
  const gather = theme === 'gather';
  const TL = gather ? TG : dither ? T_D : research === 'auto' ? T_S : research === 'sequence' ? T_SS : research ? T_R : T_WHITE;
  const boxRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<ScrollTextHandle>(null);
  // White: during the build the panel (views, leaders, notes) is drawn by the scroll (data-static);
  // once a tool is switched (cycle or click) the panel plays its own timed draw-in as usual
  const [switched, setSwitched] = useState(false);
  // Motion Scroll: tools passed since the card came in (null: not scroll driven, e.g. phones)
  const [scrollU, setScrollU] = useState<number | null>(null);

  /* Paper: the paper comes in over the whole screen as a theme change, not as a sheet with a hard
     top edge. A fixed wash of the paper (first in the body, so under the page's rails) fades in
     as the section rises into view and out again as it leaves, scroll driven both ways. */
  useEffect(() => {
    const s = ref.current;
    if (!s || theme !== 'paper') return;
    const wash = document.createElement('div');
    wash.className = 'tcl-paper-wash';
    wash.setAttribute('aria-hidden', 'true');
    document.body.prepend(wash);
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const vh = window.innerHeight;
      const k = (x: number) => smooth(clamp01(x));
      const a = Math.min(k((vh - r.top) / (0.75 * vh)), k((r.bottom - 0.1 * vh) / (0.65 * vh)));
      wash.style.opacity = a.toFixed(4);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); wash.remove(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [theme]);

  // On screen once its top is halfway up (as the other tool layouts); cycles only then.
  useEffect(() => {
    const s = ref.current;
    if (!s) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const vh = window.innerHeight;
      // the immersive arrival: only once the card is in
      const start = immersive && window.innerWidth >= 720 ? -TL.live * vh : vh * 0.5;
      setInView(r.top < start && r.bottom > vh * 0.3);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [immersive, gather, TL]);

  // The immersive arrival (White): every frame while near the screen, eased toward the scroll.
  useEffect(() => {
    const s = ref.current;
    if (!s || !immersive) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const phone = window.matchMedia('(max-width: 719px)');
    // one timeline per mode (each reads only its own fields)
    const T = TL as typeof T_WHITE & typeof TG;
    const pin = s.querySelector<HTMLElement>('.tcl-pin');
    let raf = 0, last = performance.now(), y = NaN;
    const put = (k: string, val: number) => s.style.setProperty(k, val.toFixed(4));
    let frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const vh = window.innerHeight;
      const rect = s.getBoundingClientRect();
      const target = -rect.top / vh; // screens of scroll since the pin
      const goal = target; // reversible: scrolling back up rewinds the build
      // near the screen: glide toward the scroll; away from it, or after a big jump, snap — so the
      // state is always the scroll's when the section comes back (never stale)
      const inRange = rect.top < vh * 1.2 && rect.bottom > -vh * 0.2;
      y = Number.isNaN(y) || reduce || !inRange || Math.abs(goal - y) > 1.2 ? goal : y + (goal - y) * (1 - Math.exp(-dt * (gather ? 4 : 6)));
      const yDrift = target;
      if (phone.matches) {
        introRef.current?.set(1);
        // Phones (2026-11-17): the research sequence plays here too, before the card. The scroll brings it to
        // its start as the box rises to the middle of the screen (0 → 1), then it plays itself and the card
        // comes up after, as on larger screens (ResearchTerminal `auto`). Without research: all in at once.
        const bx = boxRef.current?.getBoundingClientRect();
        if (research === 'auto' && bx && bx.height) {
          const startTop = vh * 0.85, at = Math.max(0, (vh - bx.height) / 2);
          termRef.current?.set(clamp01((startTop - bx.top) / Math.max(1, startTop - at)));
        } else termRef.current?.set(1);
        SCRAPS.forEach((_, i) => { put(`--a-s${i}`, 1); s.style.setProperty(`--a-d${i}`, '0px'); });
        ['--a-bg', '--a-card', '--a-c0', '--a-c1', '--a-c2', '--a-c3', '--a-p0', '--a-p1', '--a-p2'].forEach((k) => put(k, 1));
        put('--a-text', 0);
        SCRAPS.forEach((_, i) => { s.style.setProperty(`--a-t${i}`, 'none'); s.style.setProperty(`--a-k${i}`, 'none'); put(`--a-o${i}`, 1); });
        put('--a-dash', 0);
      } else if (gather) {
        introRef.current?.set(spanT(y, T.typeA, T.typeB));
        put('--a-text', 1 - smooth(spanT(y, T.textOutA, T.textOutB)));
        put('--a-bg', smooth(spanT(y, T.bgA, T.bgB)));
        // each piece: loose on the screen, rising with the scroll, then gathered into its place
        const box = boxRef.current?.getBoundingClientRect();
        const pr = pin?.getBoundingClientRect();
        const W = window.innerWidth, H = vh;
        if (box && pr) {
          const u = box.width / 1056;
          SCRAPS.forEach((sc, i) => {
            const f = FLOAT[i];
            const g = smoother(spanT(y, T.gather0 + i * T.gatherStep, T.gather0 + i * T.gatherStep + T.gatherLen));
            const yf = Math.min(y, T.gather0 + i * T.gatherStep); // the rise stops where its gathering starts
            const hx = box.left + (sc.x + sc.w / 2) * u, hy = box.top + (sc.y + sc.h / 2) * u; // home (in the collage)
            const fx = W / 2 + f.x * W;
            const fy = pr.top + H / 2 + f.y * H + (0.35 - yf * 0.42) * f.d * H; // rises as you scroll
            const k = Math.min(1, (150 + 80 * f.d) / (Math.max(sc.w, sc.h) * u)); // loose: a card of ~150–250px
            const dx = (fx - hx) * (1 - g), dy = (fy - hy) * (1 - g);
            const sca = k + (1 - k) * g, rot = f.r * (1 - g);
            s.style.setProperty(`--a-t${i}`, `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sca.toFixed(4)})`);
            // cut to the collage's rectangle as it comes in (the crop is in the piece's own frame, so it
            // travels with it): it lands already trimmed to the box
            const c = smooth(spanT(g, 0.05, 0.8)) * u; // drawn in gradually over most of the flight
            const ct = Math.max(0, -sc.y) * c, cl = Math.max(0, -sc.x) * c;
            const cr = Math.max(0, sc.x + sc.w - 1056) * c, cb = Math.max(0, sc.y + sc.h - 569) * c;
            s.style.setProperty(`--a-k${i}`, c > 0 ? `inset(${ct.toFixed(1)}px ${cr.toFixed(1)}px ${cb.toFixed(1)}px ${cl.toFixed(1)}px)` : 'none');
            put(`--a-o${i}`, smooth(spanT(y, T.typeA - 0.1 + i * 0.03, T.typeA + 0.35 + i * 0.03)));
            put(`--a-s${i}`, 1);
          });
          // margin lines: dashed while the pieces float loose past them, solid again once home
          put('--a-dash', 1 - smooth(spanT(y, T.gather0 + 8 * T.gatherStep + T.gatherLen * 0.5, T.gather0 + 8 * T.gatherStep + T.gatherLen)));
          // the collage's edge only applies once the pieces are home
          put('--a-home', smooth(spanT(y, T.gather0 + 8 * T.gatherStep + T.gatherLen * 0.7, T.gather0 + 8 * T.gatherStep + T.gatherLen)));
        }
        put('--a-card', smooth(spanT(y, T.cardA, T.cardB)));
        for (let k = 0; k < 4; k++) { const a = T.inA + k * T.inStep; put(`--a-c${k}`, smooth(spanT(y, a, a + T.inLen))); }
        put('--a-p0', smooth(spanT(y, T.shots[0], T.shots[1])));
        put('--a-p1', smooth(spanT(y, T.lines[0], T.lines[1])));
        put('--a-p2', smooth(spanT(y, T.notes[0], T.notes[1])));
      } else {
        introRef.current?.set(spanT(y, T.typeA, T.typeB));
        put('--a-text', 1 - smooth(spanT(y, T.textOutA, T.textOutB)));
        put('--a-bg', smooth(spanT(y, T.bgA, T.bgB)));
        if (research) { const TT = research === 'auto' ? T_S : research === 'sequence' ? T_SS : T_R; termRef.current?.set(spanT(y, TT.termA, TT.termB)); }
        if (!research && !dither) SCRAPS.forEach((_, i) => {
          const a = T.scrap0 + i * T.scrapStep;
          put(`--a-s${i}`, smooth(spanT(y, a, a + T.scrapLen)));
          // the drift: deeper scraps move a little more as the section scrolls on (Motion Scroll:
          // they settle and stay put once the card is in, while the tools change)
          const yd = scroll ? Math.min(yDrift, T.drift0) : yDrift;
          s.style.setProperty(`--a-d${i}`, `${(-(Math.max(yd, T.drift0 - 1.2) - T.drift0) * 26 * DEPTH[i]).toFixed(1)}px`);
        });
        put('--a-card', smooth(spanT(y, T.cardA, T.cardB)));
        for (let k = 0; k < 4; k++) { const a = T.inA + k * T.inStep; put(`--a-c${k}`, smooth(spanT(y, a, a + T.inLen))); }
        put('--a-p0', smooth(spanT(y, T.shots[0], T.shots[1])));
        put('--a-p1', smooth(spanT(y, T.lines[0], T.lines[1])));
        put('--a-p2', smooth(spanT(y, T.notes[0], T.notes[1])));
      }
      raf = inRange && Math.abs(goal - y) > 0.0005 ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    // Motion Scroll reads the same glided value: where in the run of tools the scroll is
    const inner = frame;
    frame = (now: number) => {
      inner(now);
      // the card takes clicks only once it is in (before, its link sat invisibly under the line)
      s.toggleAttribute('data-built', phone.matches || y >= T.cardA + 0.2);
      // "2B+ data points" lights once the line is typed (as "500M posts/week")
      introRef.current?.light?.(phone.matches ? 1 : spanT(y, T.typeB, T.typeB + 0.22));
      // rounded to the bar's own step (½%): a new value — a render of the card — only when the bar would move
      // (the glide's every-frame float re-rendered the whole card 60 times a second)
      if (scroll) setScrollU(phone.matches ? null : Math.min(4 - 1e-4, Math.max(0, Math.round(((y - T.live) / PER) * 200) / 200)));
    };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    frame(performance.now());
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', kick); window.removeEventListener('resize', kick);
      ['--a-text', '--a-bg', '--a-card', '--a-c0', '--a-c1', '--a-c2', '--a-c3', '--a-p0', '--a-p1', '--a-p2'].forEach((k) => s.style.removeProperty(k));
      s.style.removeProperty('--a-home'); s.style.removeProperty('--a-dash');
      SCRAPS.forEach((_, i) => ['s', 'd', 't', 'k', 'o'].forEach((v) => s.style.removeProperty(`--a-${v}${i}`)));
    };
  }, [immersive, gather, scroll, research, TL]);

  // Paper dark is its own dark band under the fixed header: while it is behind the wordmark's
  // line, the header turns light, as over the footer (html[data-over-dark], footer.css).
  useEffect(() => {
    const s = ref.current;
    const root = document.documentElement;
    if (!s || theme !== 'dark') return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const wm = document.querySelector('.chrome .wordmark')?.getBoundingClientRect();
      const top = wm ? wm.top + wm.height / 2 : 34;
      root.toggleAttribute('data-over-dark', r.top < top && r.bottom > top);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll);
      root.removeAttribute('data-over-dark');
    };
  }, [theme]);

  // The cycle is the active name's progress bar: it fills over CYCLE_MS (CSS) and, once full,
  // the next tool comes up. It holds (frozen where it is) while the section is off screen or the
  // pointer / focus is on the card, so bar and timing never drift apart.
  const running = inView && !paused;
  const next = () => { setSwitched(true); setActive((a) => (a + 1) % TOOLS.length); };

  const driven = scroll && scrollU !== null;
  const idx = driven ? Math.min(TOOLS.length - 1, Math.floor(scrollU)) : active;
  const local = driven ? scrollU - idx : 0;
  const t = TOOLS[idx];
  const r = motion ? { a: MOTION_RECT, b: MOTION_RECT } : place(t);
  const Loop = LOOPS[idx];
  const cycleMs = motion ? LOOP_S[idx] * 1000 : CYCLE_MS;
  const l = leaders(r, motion ? 360 : NOTE_W);
  const noteA = motion ? t.mA : t.noteA, noteB = motion ? t.mB : t.noteB;

  return (
    <section ref={ref} className="tcl" data-theme-tc={theme} data-immersive={immersive || undefined} data-gather={gather || undefined} data-motion={motion || undefined} data-scroll={scroll || undefined} data-research={research || undefined} data-seq={research === 'sequence' || research === 'auto' || undefined} data-dither={dither || undefined} data-numbers={dither === 'numbers' || undefined} data-intro={intro} data-foot="/Analytical Tools" aria-label="Analytical tools">
      <div className="tcl-pin">
      {immersive && <ScrollText ref={introRef} className="tcl-intro" text={INTRO} hl="2B+ data points" />}
      <div className="frame tcl-frame">
        <div className="tcl-box" ref={boxRef}>
          {/* the collage covers the whole box, so the dither takes its place rather than lying under it */}
          {research ? <ResearchTerminal ref={termRef} scatter={research === 'scatter'} sequence={research === 'sequence' || research === 'auto'} auto={research === 'auto'} /> : dither ? <DitherBg numbers={dither === 'numbers'} /> : <Scraps />}
          {/* research: the glass fills the whole frame once the card comes in, so the research behind it is a
              quiet blur, not a busy edge round the card (feedback 2026-11-16) */}
          {research && <div className="tcl-glass" aria-hidden="true" />}

          {/* keyboard focus in the card holds the cycle (a mouse click on a name does not) */}
          <div className="tcl-card"
            onFocus={(e) => setPaused(e.target.matches(':focus-visible'))} onBlur={() => setPaused(false)}>
            {/* the glass: the same collage, blurred, seen through the card (a copy rather than
                backdrop-filter, which drops the blended scraps in some browsers) */}
            {!research && !dither && <Scraps blur />}
            <h2 className="tcl-title tcl-in0">Analytical Tools</h2>
            {!motion && <p key={`lead-${idx}`} className="tcl-lead tcl-in1">{t.lead}</p>}

            <ul className="tcl-list tcl-in2" role="tablist" aria-label="Tools">
              {TOOLS.map((tool, i) => (
                <li key={tool.name} role="presentation">
                  <button type="button" role="tab" id={`tcl-tab-${i}`} aria-selected={i === idx} aria-controls="tcl-panel"
                    className="tcl-name" onClick={() => {
                      if (driven) { // scroll to that tool's stretch
                        const s = ref.current;
                        if (s) window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY + (TL.live + i * PER + 0.04) * window.innerHeight, behavior: 'smooth' });
                        return;
                      }
                      if (i !== active) setSwitched(true); setActive(i);
                    }}>
                    {tool.name}
                    {i === idx && (
                      <span className="tcl-prog" aria-hidden="true">
                        {driven ? (
                          <span className="tcl-prog-fill" style={{ animation: 'none', transform: `scaleX(${Math.min(1, local / HOLD_AT).toFixed(4)})` }} />
                        ) : (
                        <span key={active} className="tcl-prog-fill" data-run={running || undefined}
                          style={{ animationDuration: `${cycleMs}ms` }} onAnimationEnd={next} />
                        )}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div key={idx} data-static={(immersive && (driven ? idx === 0 : !switched)) || undefined} id="tcl-panel" role="tabpanel" aria-labelledby={`tcl-tab-${idx}`} className="tcl-panel tcl-in3">
              {/* the pointer resting on the tool's views holds the cycle (someone is reading them) */}
              <a className="tcl-shots" href={t.href} target="_blank" rel="noopener noreferrer" aria-label={`Try ${t.name} (opens in a new tab)`}
                onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
                {motion ? (
                  <div className="tcl-shot tcl-motion" style={{ left: v(r.a.x), top: v(r.a.y), width: v(r.a.w), height: v(r.a.h), '--i': 0 } as CSSProperties}>
                    {/* one clock with the cycle bar: both run, hold and restart together */}
                    <Loop playing={driven ? inView : running} />
                  </div>
                ) : (['b', 'a'] as const).map((k, i) => {
                  const p = r[k], s = t[k];
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={k} className="tcl-shot" src={s.src} alt={s.alt} draggable={false}
                      style={{ left: v(p.x), top: v(p.y), width: v(p.w), height: v(p.h), '--i': i } as CSSProperties} />
                  );
                })}
              </a>

              {motion ? (
                // Motion: the lead and the notes run as one column on the left, no leaders
                <div className="tcl-mnotes">
                  {/* the lead and the notes as one paragraph (client, 2026-11-23: it read broken into 2–3 lines) */}
                  <p key={`lead-${idx}`} className="tcl-lead tcl-in1">{[t.lead, noteA, noteB].filter(Boolean).join(' ')}</p>
                  {/* the client's "Try it →" after each tool's copy: the tool itself, in a new tab */}
                  <a className="tcl-note tcl-try" href={t.href} target="_blank" rel="noopener noreferrer" style={{ '--i': 2 } as CSSProperties}>
                    Try it →<span className="sr-only"> {t.name} (opens in a new tab)</span>
                  </a>
                </div>
              ) : (<>
              <svg className="tcl-lines" viewBox="0 0 972 467" preserveAspectRatio="none" aria-hidden="true">
                <path className="tcl-line" d={l.a.d} pathLength={1} style={{ '--i': 0 } as CSSProperties} />
                <path className="tcl-line" d={l.b.d} pathLength={1} style={{ '--i': 1 } as CSSProperties} />
              </svg>
              <span className="tcl-dot" style={{ left: v(l.a.dot.x), top: v(l.a.dot.y), '--i': 0 } as CSSProperties} aria-hidden="true" />
              <span className="tcl-dot" style={{ left: v(l.b.dot.x), top: v(l.b.dot.y), '--i': 1 } as CSSProperties} aria-hidden="true" />

              <p className="tcl-note tcl-note-a" style={{ right: v(972 - l.a.note.right), bottom: v(467 - l.a.note.bottom), width: v(l.a.note.width), '--i': 0 } as CSSProperties}>{noteA}</p>
              <p className="tcl-note tcl-note-b" style={{ left: v(l.b.note.left), top: v(l.b.note.top), width: v(l.b.note.width), '--i': 1 } as CSSProperties}>{noteB}</p>
              </>)}
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
