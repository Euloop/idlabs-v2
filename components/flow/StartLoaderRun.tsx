'use client';

import { useEffect } from 'react';

/* Drives StartLoader's sequence by setting attributes on the overlay — no React re-renders, so the
   cuts land on exact frames. All times in ms. */
const T = {
  hold: 2900, // from the start of the opening (words in the middle, parting on a spring, the image opening at 1000) to the first cut
  holdLogo: 4250,
  logoLater: 1000, // /hero: the logo finishes drawing before it splits (start-loader.css), so all of it 1000 later // the same with the drawn logo (Zoom): it draws first (~2.3s), the image opens at 2350
  endLogo: 2900, // Fade: from the logo starting (as the golden ratio fades) to the white lifting: drawn by ~2.5s, then held
  cut: 120, // each showreel image (hard cuts)
  passes: 1, // times through the reel (the first image is not repeated at the very start)
  golden: 650, // the golden ratio holds before the zoom
  land: 550, // into the zoom: the hero's entrance starts (the drawing is ~95% there, gliding in)
  zoom: 850, // golden ratio → the hero's construction (= the transform transitions in start-loader.css)
};
const MAX_WAIT = 2500; // start anyway if the images are slow

/* /hero's reel runs on one beat, both halves (metric montage, as the reference: a cut every 3 frames
   at 30fps). 100ms is a whole number of frames at 30, 60 and 120Hz, so every image is on screen
   exactly as long as the next — a beat that isn't (120ms at 60Hz = 7.2 frames) alternates 7 and 8
   frames and reads as uneven. Every cut lands on the grid: no ramps, no holds. The first half is
   six bars of four, the golden half three; the spiral draws over its first two bars
   (start-loader.css), and the white lifts after three beats on the last image. */
const BEAT = 100;
const G = { hold: 3 * BEAT };

export default function StartLoaderRun({ frames, golden = 0 }: { frames: number; golden?: number }) {
  useEffect(() => {
    const root = document.documentElement;
    const el = document.querySelector<HTMLElement>('.sl');
    if (root.dataset.loader !== 'run' || !el) return;

    // React runs this twice in dev: the first run is cancelled, and only its own timers go with it.
    let cancelled = false;
    let raf = 0;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => { if (!cancelled) fn(); }, ms));

    // Hold the page still: the wheel, touch and keys never reach Lenis or the window.
    const block = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
    const keys = (e: KeyboardEvent) => {
      if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) block(e);
    };
    const opts = { capture: true, passive: false } as const;
    window.addEventListener('wheel', block, opts);
    window.addEventListener('touchmove', block, opts);
    window.addEventListener('keydown', keys, opts);
    const release = () => {
      window.removeEventListener('wheel', block, opts);
      window.removeEventListener('touchmove', block, opts);
      window.removeEventListener('keydown', keys, opts);
    };

    // a hard cut: the frame (or the golden ratio) on, the one before it off
    const parts = Array.from(el.querySelectorAll<HTMLElement>('.sl-frame, .sl-golden'));
    let on = parts[0];
    const show = (i: number | 'golden') => {
      const next = i === 'golden' ? parts[parts.length - 1] : parts[i];
      if (!next || next === on) return;
      on.removeAttribute('data-on');
      next.setAttribute('data-on', '');
      on = next;
      if (i === 'golden') snap(next);
    };
    // The 1px golden ratio on whole pixels: the drawing's corner at N + 0.36 (the 1px layer's own corner
    // at N) puts every edge line's centre on a pixel centre, so all four render as one crisp pixel
    // (half way between two, a line spreads over both and reads thicker — the right edge did).
    const bold = el.querySelector<HTMLElement>('.sl-g-bold');
    const snap = (g: HTMLElement) => {
      const r = g.getBoundingClientRect();
      const nudge = (v: number) => Math.round(v - 0.36) + 0.36 - v;
      const ml = parseFloat(getComputedStyle(g).marginLeft) + nudge(r.left);
      const mt = nudge(r.top);
      g.style.marginLeft = `${ml}px`;
      g.style.marginTop = `${mt}px`;
      if (bold) { bold.style.marginLeft = `${ml - 0.36}px`; bold.style.marginTop = `${mt - 0.36}px`; }
    };

    const zoom = () => {
      const golden = el.querySelector<HTMLElement>('.sl-golden');
      const target = document.querySelector<HTMLElement>('.hv-golden');
      root.dataset.loader = 'zoom';
      // the hero's entrance starts in the zoom's final glide, not after it stops
      at(T.land, () => root.setAttribute('data-sl-land', ''));
      const a = golden?.getBoundingClientRect();
      const b = target?.getBoundingClientRect();
      // Zoom only onto a golden-shaped target (the phone layout of the hero is not one): otherwise
      // the drawing just fades with the white.
      const fits = a && b && b.height > 0 && Math.abs(b.width / b.height - a.width / a.height) < 0.03;
      // Fade (?intro=fade): no zoom — the drawing fades where it is, onto the clean hero (CSS)
      const fade = root.dataset.intro === 'fade';
      if (fade) { /* start-loader.css: html[data-intro='fade'] */ } else if (golden && a && b && fits) {
        // a is the drawing at its CSS scale-down (577.663 × 980.663 drawn at 208 tall); end at the target's size
        const s = b.height / golden.offsetHeight;
        golden.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${s})`;
        // the 1px layer, laid out at 1:1, goes the same way about the same corner
        if (bold) bold.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.height / a.height})`;
      } else if (golden) golden.style.opacity = '0';
      at(T.zoom, () => {
        // Landed: the hero's own construction takes over in the same frame (identical pixels, so
        // the swap does not show), and the hero's entrance plays from here.
        root.dataset.loader = 'done';
        el.dataset.show = 'gone';
        release();
      });
    };

    const start = () => {
      const opened = (window as { __slReady?: number }).__slReady ?? performance.now();
      const logo = root.dataset.intro === 'zoom' || root.dataset.slOpen === 'logo';
      const reelEnd = root.dataset.slEnd === 'reel';
      const hold = logo ? T.holdLogo + (root.dataset.slOpen === 'logo' ? T.logoLater : 0) : T.hold;
      let t = Math.max(0, opened + hold - performance.now());
      // The schedule: what shows from when (ms after the reel starts).
      type Step = { show: number | 'golden'; at: number; fx?: () => void };
      const order: Step[] = [];
      let clock = 0;
      const push = (show: Step['show'], dur: number, fx?: () => void) => { order.push({ show, at: clock, fx }); clock += dur; };
      const plain = frames - golden;
      const cut = golden ? BEAT : T.cut;
      for (let p = 0; p < T.passes; p++) for (let i = 0; i < plain; i++) if (p || i) push(i, cut);
      if (golden) {
        // no pause: the golden images cut straight on, and the spiral draws over them as they change
        // (start-loader.css .sl-sp-arc), then stays put while the rest cut under it
        for (let i = plain; i < frames; i++) push(i, BEAT, i === plain ? () => el.setAttribute('data-spiral', '') : undefined);
      }
      if (!reelEnd) push('golden', T.cut);
      // The reel runs off the frame clock, not a timer per cut: each frame shows whichever image is
      // due by now, so a busy main thread can't bunch cuts together (queued timers fire back to back
      // and flash an image for a few ms). Starts on a frame; the zoom follows the golden ratio's hold.
      at(t, () => {
        let t0 = 0;
        let k = 0;
        let shown = -1;
        const step = (now: number) => {
          if (cancelled) return;
          if (!t0) t0 = now;
          const e = now - t0;
          // (4ms of slack: a vsync can land a hair before a boundary, and must still count as on it,
          // or that image gets one frame more than the rest)
          while (k + 1 < order.length && order[k + 1].at <= e + 4) k++;
          if (k !== shown) { shown = k; show(order[k].show); order[k].fx?.(); }
          if (k < order.length - 1) raf = requestAnimationFrame(step);
          // Zoom: the golden ratio zooms. Fade: it goes, the logo draws in its place, then the white lifts.
          else if (reelEnd) at(golden ? G.hold : T.cut, zoom); // /hero: the last image's beat, then the white lifts
          else at(T.golden, root.dataset.intro === 'zoom' ? zoom : () => { el.setAttribute('data-end', ''); at(T.endLogo, zoom); });
        };
        raf = requestAnimationFrame(step);
      });
    };

    // Start once every reel image is decoded, so no cut ever lands on a blank.
    let started = false;
    const go = () => { if (!started && !cancelled) { started = true; start(); } };
    const imgs = Array.from(el.querySelectorAll('img'));
    Promise.all(imgs.map((img) => img.decode().catch(() => {}))).then(go);
    at(MAX_WAIT, go);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      release();
    };
  }, [frames]);
  return null;
}
