'use client';

import { useEffect, useRef, type RefObject } from 'react';

/* /home-3's scroll engine: one requestAnimationFrame loop for the whole page.
   Each scene is a tall <section> with a sticky 100vh stage inside; the loop hands the scene its
   progress through the section (0 → 1) and a shared Frame (time, viewport, smoothed pointer), and
   the scene writes transforms straight to the DOM (or draws its canvas). Sections are measured on
   resize only, never per frame, so the loop does no layout reads. Lenis (SmoothScroll in the root
   layout) drives the real window scroll, so scrollY is all we need. */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Deterministic noise in [0, 1): the same layout on the server and the client. */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Wrap v into [-h/2, h/2). */
export const wrap = (v: number, h: number) => ((((v + h / 2) % h) + h) % h) - h / 2;

type RGB = [number, number, number];
export const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
export const mix = (a: RGB, b: RGB, t: number) =>
  `rgb(${Math.round(lerp(a[0], b[0], t))} ${Math.round(lerp(a[1], b[1], t))} ${Math.round(lerp(a[2], b[2], t))})`;

export type Frame = {
  t: number; // seconds
  dt: number;
  vw: number;
  vh: number;
  sy: number;
  /** pointer, -1..1 from the centre, smoothed */
  mx: number;
  my: number;
  /** pointer in viewport px (raw); far off screen when there is none */
  px: number;
  py: number;
  reduce: boolean;
  mobile: boolean;
};
export const frame: Frame = { t: 0, dt: 1 / 60, vw: 1280, vh: 800, sy: 0, mx: 0, my: 0, px: -1e4, py: -1e4, reduce: false, mobile: false };

type SceneFn = (p: number, f: Frame) => void;
/* Each scene's progress is eased toward the scroll (on top of Lenis), so the stage floats a beat
   behind the hand instead of being bolted to it. `damp`: how quickly it catches up (1/s). */
type Entry = { el: HTMLElement; top: number; h: number; fn: { current: SceneFn }; vis: boolean; ps: number; init: boolean; damp: number };
const scenes = new Set<Entry>();
const ticks = new Set<{ current: (f: Frame) => void }>();
let raf = 0;
let users = 0;
let tmx = 0;
let tmy = 0;
let ro: ResizeObserver | undefined;
let mq: MediaQueryList | undefined;

function measure() {
  frame.vw = window.innerWidth;
  frame.vh = window.innerHeight;
  frame.mobile = frame.vw < 760;
  frame.reduce = !!mq?.matches;
  const sy = window.scrollY;
  scenes.forEach((s) => {
    const r = s.el.getBoundingClientRect();
    s.top = r.top + sy;
    s.h = r.height;
  });
}

function loop(now: number) {
  raf = requestAnimationFrame(loop);
  const t = now / 1000;
  frame.dt = frame.t ? Math.min(0.05, Math.max(0.001, t - frame.t)) : 1 / 60;
  frame.t = t;
  frame.sy = window.scrollY;
  const k = 1 - Math.exp(-frame.dt * 4.5);
  frame.mx += (tmx - frame.mx) * k;
  frame.my += (tmy - frame.my) * k;
  scenes.forEach((s) => {
    if (!s.h) return;
    const span = s.h - frame.vh;
    const p = span > 0 ? clamp((frame.sy - s.top) / span) : 0;
    if (!s.init) {
      s.ps = p;
      s.init = true;
    }
    s.ps += (p - s.ps) * (frame.reduce ? 1 : 1 - Math.exp(-frame.dt * s.damp));
    if (Math.abs(p - s.ps) < 1e-5) s.ps = p;
    const vis = frame.sy + frame.vh > s.top - 4 && frame.sy < s.top + s.h + 4;
    // keep calling while the eased progress settles, and once after the scene leaves the screen
    if (vis || s.vis || s.ps !== p) s.fn.current(s.ps, frame);
    s.vis = vis;
  });
  ticks.forEach((fn) => fn.current(frame));
}

const onMove = (e: PointerEvent) => {
  tmx = (e.clientX / frame.vw) * 2 - 1;
  tmy = (e.clientY / frame.vh) * 2 - 1;
  frame.px = e.clientX;
  frame.py = e.clientY;
};
const onLeave = () => {
  tmx = 0;
  tmy = 0;
  frame.px = -1e4;
  frame.py = -1e4;
};

function start() {
  if (users++ > 0) return;
  mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  mq.addEventListener('change', measure);
  ro = new ResizeObserver(measure);
  ro.observe(document.body);
  document.fonts?.ready.then(measure);
  raf = requestAnimationFrame(loop);
}
function stop() {
  if (--users > 0) return;
  cancelAnimationFrame(raf);
  window.removeEventListener('resize', measure);
  window.removeEventListener('load', measure);
  window.removeEventListener('pointermove', onMove);
  document.documentElement.removeEventListener('pointerleave', onLeave);
  mq?.removeEventListener('change', measure);
  ro?.disconnect();
}

/** Run `fn(progress, frame)` every frame while the section is on screen. */
export function useScene(ref: RefObject<HTMLElement | null>, fn: SceneFn, damp = 3.2) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const entry: Entry = { el, top: 0, h: 0, fn: fnRef, vis: false, ps: 0, init: false, damp };
    scenes.add(entry);
    start();
    measure();
    return () => {
      scenes.delete(entry);
      stop();
    };
  }, [ref, damp]);
}

/** Run `fn(frame)` every frame. */
export function useTick(fn: (f: Frame) => void) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  useEffect(() => {
    const entry = fnRef;
    ticks.add(entry);
    start();
    return () => {
      ticks.delete(entry);
      stop();
    };
  }, []);
}

/* Dark scenes: while any scene says it is dark, html[data-im-dark] turns the fixed chrome light. */
const darkKeys = new Set<string>();
export function setDark(key: string, on: boolean) {
  if (on === darkKeys.has(key)) return;
  if (on) darkKeys.add(key);
  else darkKeys.delete(key);
  document.documentElement.toggleAttribute('data-im-dark', darkKeys.size > 0);
}

/* The hover caption at the bottom right (Chrome.tsx), fed by whatever is under the pointer. */
export type Caption = { title: string; meta?: string; hint?: string } | null;
const capListeners = new Set<(c: Caption) => void>();
export function setCaption(c: Caption) {
  capListeners.forEach((l) => l(c));
}
export function onCaption(l: (c: Caption) => void) {
  capListeners.add(l);
  return () => {
    capListeners.delete(l);
  };
}

/** Write a style property only when it changed (cheap guard against redundant style writes). */
export function put(el: HTMLElement | null | undefined, prop: 'transform' | 'opacity' | 'filter' | 'zIndex' | 'visibility' | 'backgroundColor' | 'color' | 'clipPath', v: string) {
  if (el && el.style[prop] !== v) el.style[prop] = v;
}

/** Ease `cur` toward `target` at `rate` (1/s), frame-rate independent. */
export const follow = (cur: number, target: number, rate: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-dt * rate));
