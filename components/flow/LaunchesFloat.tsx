'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PICTURED, RATIO_OF, slug, type Launch } from './LaunchesCloud';
import LaunchesReel, { REEL, type ReelEnd } from './LaunchesReel';
import { LAUNCH_VIDEO } from './launch-videos';
import './launches-float.css';

/* The launches as a loading teaser that scatters into a floating field (/home-2, Launches "Float"),
   after getty.edu/tracingart. The section pins for a while and uses the whole screen width; its margin
   lines are dashed, starting at the section's top edge:
     1 load     once pinned, the two words sit together in the centre, then separate as a wave of
                launch thumbnails opens out between them from the middle. Scroll driven: it reverses, and plays on every visit. A short hold on the wave.
     2 scatter  scrolling bursts the tiles straight off the curve across the full width, centre
                first, each bowing outward: the real launches land as pictures, the rest as pale
                blank tiles; the words fade and the headline comes up in the middle
     3 float    the field drifts — each tile bobs and moves with the scroll and the pointer at its
                own depth (near tiles are bigger and move more)
     4 zoom     the headline goes; the launch nearest the middle grows from its place to fill the
                screen, over the field (which stays as it is)
     5 reel     the full-page launch reel takes over (LaunchesReel.tsx: videos, prev / next); a
                short hold, then the section releases and the footer comes up under it
   Everything follows the scroll through a damped value, so it glides and reverses. Pictures link to their X posts; on hover / focus a caption under each names the client,
   the launch and its views. Reduced motion: the
   field, still, straight away. */

const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // in-out cubic
const easeSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2; // in-out sine
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/* Style writes, only when the value changes: the loop runs every frame, and a write that changes
   nothing still makes the browser recheck styles (a custom property, all the element's descendants). */
const written = new WeakMap<HTMLElement, Record<string, string>>();
function put(el: HTMLElement, k: string, v: string) {
  let m = written.get(el);
  if (!m) written.set(el, (m = {}));
  if (m[k] === v) return;
  m[k] = v;
  if (k.startsWith('--')) el.style.setProperty(k, v);
  else (el.style as unknown as Record<string, string>)[k] = v;
}

/* The field: a jittered grid over the full width and 1¾ screens of height (the lower rows come up
   with the scroll), with an opening in the middle for the headline. Units: fractions of the stage
   (x from the centre, −.5 … .5; y from the centre, −.5 … 1.25). Pictures take the cells on screen
   at the end of the scatter, blank tiles the rest. */
type Tile = { key: number; l?: Launch; frame?: string; dup: boolean; fx: number; fy: number; w: number; ratio: number; d: number; ph: number };
const COLS = 7, ROWS = 6, Y0 = -0.5, Y1 = 1.25;
/* Past the launches' own pictures, the rest of the field (where a launch used to repeat, or a blank tile
   sat) shows frames from the launch videos (feedback 2026-11-16: no duplicates, no empty boxes) — 29 picked
   from the nine videos (assets/launches/frames/<launch>-<n>.webp, 640 × 360), taken a video at a time in
   turn so two from one launch are never next in line. Each links to its launch. */
const FRAME_SETS: [string, number[]][] = [
  ['matic-robots-launch', [1, 2, 3, 4]], ['wispr-flow-feature-release', [1, 2, 3, 4]], ['polyai-product-demo', [1, 2, 3, 4]],
  ['matic-robots-design-documentary', [1, 2, 3, 4]], ['cartesia-fundraise-model-launch', [2, 3, 4]], ['fish-audio-seed-raise', [1, 2, 4]],
  ['pocket-fm-product-launch', [1, 3, 4]], ['gamma-100m-arr-announcement', [1, 3]], ['playerzero', [1, 3]],
];
const FRAMES: { file: string; launch: Launch }[] = (() => {
  const out: { file: string; launch: Launch }[] = [];
  for (let round = 0; round < 4; round++) {
    for (const [s, ns] of FRAME_SETS) {
      const l = PICTURED.find((p) => slug(p) === s);
      if (l && ns[round] !== undefined) out.push({ file: `${s}-${ns[round]}`, launch: l });
    }
  }
  return out;
})();
const TILES: Tile[] = (() => {
  const cells: { fx: number; fy: number; seen: number; i: number }[] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    const fx = -0.5 + (c + 0.5) / COLS + (rnd(i + 3) - 0.5) * (0.62 / COLS);
    const fy = Y0 + ((r + 0.5) / ROWS) * (Y1 - Y0) + (rnd(i + 19) - 0.5) * (0.5 * (Y1 - Y0) / ROWS);
    if (Math.abs(fx) < 0.2 && Math.abs(fy) < 0.2) continue; // the headline's opening
    cells.push({ fx, fy, seen: fy < 0.42 && fy > -0.46 ? 0 : 1, i });
  }
  // on-screen cells first (shuffled), so the launches are what you see when the field opens
  cells.sort((a, b) => a.seen - b.seen || rnd(a.i + 71) - rnd(b.i + 71));
  return cells.map((c, k) => {
    // every launch once; then the video frames, one each, as long as they last (blank tiles after that)
    const fr = k >= PICTURED.length ? FRAMES[k - PICTURED.length] : undefined;
    const l = k < PICTURED.length ? PICTURED[k] : fr?.launch;
    const d = 0.62 + rnd(c.i + 5) * 0.7; // depth: 0.62 far … 1.32 near
    return {
      key: k, l, frame: fr?.file, dup: k >= PICTURED.length, fx: c.fx, fy: c.fy, d, ph: rnd(c.i + 11) * Math.PI * 2,
      w: (l ? 0.085 + rnd(c.i + 7) * 0.05 : 0.05 + rnd(c.i + 7) * 0.04) * d, // of the stage width
      ratio: fr ? 16 / 9 : l ? RATIO_OF(l) : [1, 4 / 5, 4 / 3][Math.floor(rnd(c.i + 13) * 3)],
    };
  });
})();
// the ribbon's order: shuffled, so pictures and blanks interleave along the wave
const ORDER = TILES.map((t) => t.key).sort((a, b) => rnd(a + 97) - rnd(b + 97));
const RIBBON_POS = new Map(ORDER.map((k, i) => [k, i]));
const N = TILES.length;
/* The launch the zoom goes into: the picture tile nearest the middle of the screen when the float
   ends (a launch with a video first, and one the reel has), so the zoom starts from a tile you can
   see. The reel then opens on that launch. */
const FLOAT_TRAVEL = 0.62; // how far (stage heights × depth) the field rises over the float
const HERO_LAUNCH = 'matic-robots-launch'; // the launch the zoom goes into
const HERO = (() => {
  let best = -1, bd = Infinity;
  TILES.forEach((t, i) => {
    if (!t.l || t.dup || !REEL.includes(t.l)) return;
    const ey = t.fy - FLOAT_TRAVEL * t.d;
    // distance from the middle; tiles without a video count as twice as far
    const dd = (t.fx * t.fx + ey * ey) * (LAUNCH_VIDEO[slug(t.l)] ? 1 : 4);
    if (dd < bd) { bd = dd; best = i; }
  });
  // HERO_LAUNCH takes that central tile; the launch that was there takes HERO_LAUNCH's old place
  const m = TILES.findIndex((t) => !t.dup && t.l && slug(t.l) === HERO_LAUNCH);
  if (best >= 0 && m >= 0 && m !== best) {
    const a = TILES[best], b = TILES[m];
    [a.l, b.l] = [b.l, a.l];
    [a.ratio, b.ratio] = [b.ratio, a.ratio];
  }
  return best;
})();
const HERO_SLIDE = Math.max(0, REEL.indexOf(TILES[HERO]?.l as Launch));
/* Timeline, in screens of scroll from the pin's start. The first FIELD screens are the load,
   scatter and float (as fractions of it, `prog`); then the zoom and the reel. */
// the zoom over 1.1 screens (was 0.7: too fast), the reel in front at its end
const FIELD = 3.2, ZOOM = [3.2, 4.3], REEL_IN = [4.22, 4.38], REEL_UI = [4.35, 4.6];


/* alt (Float II): the words read "Launches we" / "have done"; no headline over the field (it stays
   for screen readers); the reel in its alt dress (LaunchesReel.tsx).
   card (Float III): the zoom settles the launch in the centre between the margin lines (the frame's
   width, 16:9) instead of filling the screen; the rest of the field fades away under it, and the
   reel takes the card's place with prev / next chevrons in the side margins. */
/* track (Float IV): the card as a track of launches, the next one peeking in past the right margin
   (tryprofound.com's story cards). */
// The width of one word space in an element's font, plus its tracking (cached per font; it changes
// when the web font swaps in).
let spaceCtx: CanvasRenderingContext2D | null = null;
const spaceCache = new Map<string, number>();
function spaceOf(el: HTMLElement | null) {
  if (!el) return 0;
  const cs = getComputedStyle(el);
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const ls = parseFloat(cs.letterSpacing) || 0;
  const key = `${font}|${ls}|${document.fonts?.status}`;
  let w = spaceCache.get(key);
  if (w === undefined) {
    spaceCtx ??= document.createElement('canvas').getContext('2d');
    if (!spaceCtx) return 0;
    spaceCtx.font = font;
    w = spaceCtx.measureText(' ').width + ls;
    spaceCache.set(key, w);
  }
  return w;
}

/* picks (Launches "Selected"): Float IV whose reel holds only these launches, in this order, then an
   end slide with a button to /launches (`end`). The zoom goes into the first of them: the central
   tile carries it, swapped with the tile that had it (both 16:9), so the reel opens on it with no cut. */
// `words` (alt): the pair that parts, in place of "Launches we" / "have done" (Selected, the home page's:
// "Our trajectory" / "changing launches"); the screen readers' heading reads them as one line
export default function LaunchesFloat({ alt = false, card = false, track = false, picks, end, words }: { alt?: boolean; card?: boolean; track?: boolean; picks?: Launch[]; end?: ReelEnd; words?: [string, string] }) {
  const reelStart = picks ? 0 : HERO_SLIDE;
  const heroPic = picks ? picks[0] : REEL[HERO_SLIDE];
  // each tile's launch (TILES', or with picks the first pick moved onto the hero tile)
  const tileL = useMemo(() => {
    const ls = TILES.map((t) => t.l);
    if (!picks?.length) return ls;
    const m = TILES.findIndex((t) => !t.dup && t.l && slug(t.l) === slug(picks[0]));
    const h = ls[HERO];
    ls[HERO] = picks[0];
    if (m >= 0 && m !== HERO) ls[m] = h;
    return ls;
  }, [picks]);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const leftRef = useRef<HTMLParagraphElement>(null);
  const rightRef = useRef<HTMLParagraphElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const [reelOn, setReelOn] = useState(false);
  const reelOnRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current, stage = stageRef.current;
    if (!root || !stage) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0, last = performance.now(), clock = 0;
    let ys = reduce ? FIELD : 0;        // damped screens of scroll since the pin
    let heroHd = false;
    let overDark = false;
    let mx = 0, my = 0, tmx = 0, tmy = 0; // pointer, −1 … 1 (damped)
    let near = false;
    // read once (and on resize), not every frame: the margin lines' width (Float III's card) and the
    // fixed header's wordmark
    const measureRails = () => (root.querySelector('.lcf-rails') as HTMLElement | null)?.offsetWidth ?? 0;
    let railsW = measureRails();
    let wmEl: HTMLElement | null = null;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now; clock += dt * 1000;
      // every layout read first, before this frame's writes (a read after a write makes the browser
      // lay the page out again on the spot)
      const W = stage.clientWidth, H = stage.clientHeight;
      const r = root.getBoundingClientRect();
      if (!wmEl?.isConnected) wmEl = document.querySelector<HTMLElement>('.chrome .wordmark');
      const wm = wmEl?.getBoundingClientRect();
      const sr = (card && reelRef.current ? reelRef.current : stage).getBoundingClientRect();
      const space = spaceOf(leftRef.current);
      const lw = leftRef.current?.offsetWidth ?? 0, rw = rightRef.current?.offsetWidth ?? 0;
      const vh = window.innerHeight;

      // everything follows the scroll through the pin (screens since its start), damped so it
      // glides; scrolling back reverses it, and every visit plays it again
      // arriving (section top still on screen): the stage's contents sit higher, close under the
      // section's top edge, and ease down to the centre as it pins (no half screen of blank above)
      const arrive = clamp(r.top / vh);
      put(stage, '--lift', `${(-easeOut(arrive) * 0.42 * H).toFixed(1)}px`);
      const target = Math.max(0, -r.top / vh);
      ys = reduce ? Math.max(FIELD, target) : ys + (target - ys) * (1 - Math.exp(-dt * 4));
      const prog = clamp(ys / FIELD);
      mx += (tmx - mx) * (1 - Math.exp(-dt * 3)); my += (tmy - my) * (1 - Math.exp(-dt * 3));

      const load = reduce ? 1 : span(prog, 0, 0.28);   // the wave opens out from the centre
      const s = span(prog, 0.33, 0.8);                  // scatter, straight off the curve
      // float travel: the field keeps rising at the same rate through the zoom (it never stops),
      // until the reel is in front; the hero holds where the zoom found it and grows from there
      const q = Math.max(0, (Math.min(ys, REEL_IN[1]) - 0.7 * FIELD) / (0.3 * FIELD));

      // ribbon geometry; g: how far the load has opened it out from the centre
      const narrow = W < 760; // phones: a wider wave, the words above and below it
      const amp = Math.min(H * 0.1, 72);
      const cardH = Math.max(34, Math.min(W * 0.042, 58));
      const gap = Math.max(10, W * 0.008);
      /* the words never leave the screen, on any width: parted, each must fit between the wave and its
         edge of the screen (a margin in), so first the wave narrows (to 55% of its width), then the
         words scale down; together (and on phones, one above the other) the line must fit across */
      const edge = Math.max(16, W * 0.03), half = W / 2 - edge, wide = Math.max(lw, rw, 1);
      const rib0 = narrow ? W * 0.66 : Math.min(W * 0.34, 520);
      const ribW = narrow ? rib0 : Math.max(rib0 * 0.55, Math.min(rib0, 2 * (half - space / 2 - cardH * 0.95 - gap - wide)));
      const wk = Math.min(1,
        narrow ? (W - 2 * edge) / wide : (half - space / 2 - (ribW / 2 + cardH * 0.95 + gap)) / wide,
        (W - 2 * edge) / Math.max(1, lw + space + rw));
      const gl = span(load, 0.02, 0.92), g = mix(1 - (1 - gl) * (1 - gl), ease(gl), 0.4); // opens quickly at first: room for the first cards
      const t = clock / 1000;
      const z = easeSine(span(ys, ZOOM[0], ZOOM[1]));    // the zoom into the hero launch (a gentle in-out: no rush in the middle)
      const reelIn = span(ys, REEL_IN[0], REEL_IN[1]);
      const ui = ease(span(ys, REEL_UI[0], REEL_UI[1]));

      // first pass: each tile's place in the field (load → scatter → float)
      const P: { x: number; y: number; sc: number; fw: number; fh: number; b: number; si: number; from: number }[] = [];
      TILES.forEach((tile, i) => {
        const el = cardRefs.current[i];
        if (!el) return;
        const u = (RIBBON_POS.get(tile.key) ?? 0) / (N - 1);
        const from = Math.abs(u - 0.5) * 2; // 0 at the centre of the wave … 1 at its ends
        // the field size and place
        const fw = Math.max(tile.w * W, 56 * tile.d);
        const fh = fw / tile.ratio;
        // 1 · load: the wave opens out from the centre — thumbnails appear centre first and the
        // whole curve stretches out with the words
        const b = easeOut(clamp((load - 0.1 - from * 0.62) / 0.25)); // centre first, each over a quarter of the load
        const wx = (u - 0.5) * ribW * g;
        const wy = -Math.sin(u * Math.PI * 2) * amp * g;
        const ribScale = (cardH / fh) * mix(0.55, 1, b);
        // 2 · scatter: each tile leaves its spot on the curve, centre first, bowing outward on the way
        const si = ease(clamp((s - from * 0.32 - rnd(i + 31) * 0.12) / 0.56)); // each tile flies over about half the scatter
        // 3 · float: depth parallax with the scroll, the pointer and a slow bob
        const fx = tile.fx * W + (reduce ? 0 : mx * 16 * tile.d + Math.cos(t * 0.42 + tile.ph) * 5 * tile.d);
        const fy = (tile.fy - (i === HERO ? Math.min(q, 1) : q) * FLOAT_TRAVEL * tile.d) * H + (reduce ? 0 : my * 10 * tile.d + Math.sin(t * 0.55 + tile.ph) * 7 * tile.d);
        const dx = tile.fx * W - wx, dy = tile.fy * H - wy, dl = Math.hypot(dx, dy) || 1;
        const bow = Math.sin(Math.PI * si) * Math.min(90, dl * 0.18); // sideways to the path
        const x = mix(wx, fx, si) - (dy / dl) * bow, y = mix(wy, fy, si) + (dx / dl) * bow;
        const sc = mix(ribScale, 1, si);
        P[i] = { x, y, sc, fw, fh, b, si, from };
      });

      // 4 · zoom: only the hero tile moves — it grows from its place to the full stage (its picture
      // covers); the rest of the field stays exactly as it is, underneath.
      // Float III: the target is a card between the margin lines, a little below the middle
      const TW = card ? Math.min(W, railsW || W) : W;
      const TH = card ? Math.min(TW * 9 / 16, H * 0.74) : H;
      const TY = card ? Math.min(H * 0.035, (H - TH) / 2) : 0;
      const h0 = P[HERO];
      const hw = h0 ? h0.fw * h0.sc : W, hh = h0 ? h0.fh * h0.sc : H;
      const cx = h0 ? mix(h0.x, 0, z) : 0, cy = h0 ? mix(h0.y, TY, z) : TY;
      TILES.forEach((tile, i) => {
        const el = cardRefs.current[i];
        const p = P[i];
        if (!el || !p) return;
        // the card variants once zoomed in: the rest of the field is gone (opacity 0): leave it be
        if (card && z >= 1 && i !== HERO) { put(el, 'opacity', '0.000'); return; }
        if (i === HERO) {
          put(el, 'width', `${(z > 0 ? mix(hw, TW, z) : p.fw).toFixed(1)}px`);
          put(el, 'height', `${(z > 0 ? mix(hh, TH, z) : p.fh).toFixed(1)}px`);
          put(el, 'transform', `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)${z > 0 ? '' : ` scale(${(p.sc).toFixed(4)})`}`);
          put(el, 'zIndex', z > 0 ? '950' : String(p.si > 0.5 ? Math.round(tile.d * 100) : 200 + Math.round((1 - p.from) * 100)));
          // the sharp picture for the close-up
          if (z > 0.05 && !heroHd) { heroHd = true; el.querySelector('img')?.setAttribute('src', `/assets/launches/hd/${slug(heroPic)}.webp`); }
        } else {
          put(el, 'width', `${p.fw.toFixed(1)}px`);
          put(el, 'height', `${p.fh.toFixed(1)}px`);
          put(el, 'transform', `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${p.sc.toFixed(4)})`);
          put(el, 'zIndex', String(p.si > 0.5 ? Math.round(tile.d * 100) : 200 + Math.round((1 - p.from) * 100)));
        }
        put(el, 'opacity', (card && i !== HERO ? p.b * (1 - z) : p.b).toFixed(3));
        // blank tiles carry a picture in the ribbon (cycled), which fades as they land
        put(el, '--pic', tile.l ? '1' : (1 - span(p.si, 0.35, 0.85)).toFixed(3));
        el.toggleAttribute('data-live', p.si > 0.98 && z <= 0);
      });

      // 5 · the reel comes in front of the zoomed launch (same picture: no visible cut)
      if (reelRef.current) {
        if (card) { // the reel takes the card's place exactly (same picture: no visible cut)
          const rl = reelRef.current;
          put(rl, 'left', `${((W - TW) / 2).toFixed(1)}px`); put(rl, 'top', `${((H - TH) / 2 + TY).toFixed(1)}px`);
          put(rl, 'width', `${TW.toFixed(1)}px`); put(rl, 'height', `${TH.toFixed(1)}px`);
          put(rl, '--gut', `${((W - TW) / 2).toFixed(1)}px`);
        }
        put(reelRef.current, 'opacity', reelIn.toFixed(3));
        put(reelRef.current, '--ui', ui.toFixed(3));
        put(reelRef.current, 'visibility', reelIn > 0 ? 'visible' : 'hidden');
        put(reelRef.current, 'pointerEvents', ui > 0.9 ? 'auto' : 'none'); // interactive once fully in front
      }
      const on = reelIn >= 1;
      if (on !== reelOnRef.current) { reelOnRef.current = on; setReelOn(on); }
      // the fixed header turns light while the dark reel is behind it
      const line = wm ? wm.top + wm.height / 2 : 34;
      const dark = reelIn > 0.5 && sr.top < line && sr.bottom > line;
      if (dark !== overDark) { overDark = dark; document.documentElement.toggleAttribute('data-over-dark', dark); }

      // the words: together in the centre before the load, pushed apart as the wave opens;
      // they fade as the scatter starts. (gap, the fitted wave and wk, the words' scale: above)
      // together they read as one line: half a word space each side of the centre, in the words' own
      // font (each word's box already carries its last letter's tracking); apart, as before
      const wordOff = (space * wk) / 2 + (ribW / 2 + cardH * 0.95 + gap) * g;
      // together, the pair is centred as a whole (the two words differ in length); as the wave opens
      // between them they part evenly around it
      const pairX = (((lw - rw) * wk) / 2) * (1 - g);
      const wordO = String(clamp((vh - r.top) / (vh * 0.6)) * (1 - span(prog, 0.33, 0.48)));
      const vOff = gap + (amp + cardH + 14) * g;
      if (leftRef.current) {
        put(leftRef.current, 'transformOrigin', narrow ? '50% 100%' : '100% 50%');
        put(leftRef.current, 'transform', (narrow ? `translate(-50%, calc(-100% - ${vOff}px))` : `translate(calc(-100% - ${(wordOff - pairX).toFixed(1)}px), -50%)`) + ` scale(${wk.toFixed(4)})`);
        put(leftRef.current, 'opacity', wordO);
      }
      if (rightRef.current) {
        put(rightRef.current, 'transformOrigin', narrow ? '50% 0%' : '0% 50%');
        put(rightRef.current, 'transform', (narrow ? `translate(-50%, ${vOff}px)` : `translate(${(wordOff + pairX).toFixed(1)}px, -50%)`) + ` scale(${wk.toFixed(4)})`);
        put(rightRef.current, 'opacity', wordO);
      }
      if (headRef.current) {
        const h = ease(span(prog, 0.6, 0.8)) * (1 - span(ys, ZOOM[0], ZOOM[0] + 0.25));
        put(headRef.current, 'opacity', h.toFixed(3));
        put(headRef.current, 'transform', `translate(-50%, calc(-50% + ${((1 - h) * 18 - q * 0.08 * H).toFixed(1)}px))`);
        headRef.current.toggleAttribute('data-live', h > 0.5);
      }

      raf = near ? requestAnimationFrame(frame) : 0;
    };

    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting;
      if (near) start();
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(root);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tmx = (e.clientX / window.innerWidth) * 2 - 1;
      tmy = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    const onResize = () => { railsW = measureRails(); if (near) start(); };
    window.addEventListener('resize', onResize);
    frame(performance.now()); // place everything before the first paint
    return () => {
      io.disconnect(); cancelAnimationFrame(raf);
      if (overDark) document.documentElement.removeAttribute('data-over-dark');
      window.removeEventListener('pointermove', onMove); window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="lcf" ref={rootRef}>
      {/* the section's own margin lines, dashed, from its top edge down (over the page's solid pair) */}
      <div className="frame lcf-rails" aria-hidden="true" />
      <div className="lcf-stage" ref={stageRef}>
        <div className="lcf-space">
          {TILES.map((t, i) => {
            const tile = { ...t, l: tileL[i] };
            const pic = tile.l ?? PICTURED[i % PICTURED.length];
            const img = <img className="lcf-img" src={t.frame ? `/assets/launches/frames/${t.frame}.webp` : `/assets/launches/${slug(pic)}.webp`} alt="" decoding="async" draggable={false} />;
            const ref = (el: HTMLElement | null) => { cardRefs.current[i] = el; };
            return tile.l ? (
              <a key={tile.key} ref={ref} className="lcf-card" href={tile.l.x} target="_blank" rel="noopener noreferrer"
                tabIndex={tile.dup ? -1 : undefined} aria-hidden={tile.dup || undefined}
                data-cap={`${tile.l.client}${tile.l.what ? ` · ${tile.l.what}` : ''}`} data-sub={tile.l.reach ? `${tile.l.reach} views on X` : 'On X'}
                aria-label={`${tile.l.client}${tile.l.what ? ` — ${tile.l.what}` : ''}${tile.l.reach ? `, ${tile.l.reach} views on X` : ''} (opens in a new tab)`}>
                {img}
              </a>
            ) : (
              <span key={tile.key} ref={ref} className="lcf-card lcf-blank" aria-hidden="true">{img}</span>
            );
          })}
        </div>
        <p className="lcf-word" ref={leftRef} aria-hidden="true">{alt ? (words?.[0] ?? 'Launches we') : 'Launches'}</p>
        <p className="lcf-word" ref={rightRef} aria-hidden="true">{alt ? (words?.[1] ?? 'have done') : '2B+ views'}</p>
        {alt ? (
          <h2 id="lc-title" className="sr-only">{words ? words.join(' ') : 'Launches we have done for our clients'}</h2>
        ) : (
          <div className="lcf-head" ref={headRef}>
            <h2 id="lc-title" className="lcf-title">2B+ views across the launches we’ve done for our clients</h2>
          </div>
        )}
        <div className="lcf-reel" ref={reelRef}>
          <LaunchesReel on={reelOn} start={reelStart} alt={alt} card={card} track={track} list={picks} end={end} />
        </div>
      </div>
    </div>
  );
}
