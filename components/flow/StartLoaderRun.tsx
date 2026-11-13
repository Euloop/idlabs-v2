'use client';

import { useEffect } from 'react';

/* Drives StartLoader's sequence by setting attributes on the overlay — no React re-renders, so the
   cuts land on exact frames. All times in ms. */
const T = {
  hold: 2900, // from the start of the opening (words in the middle, parting on a spring, the image opening at 1000) to the first cut
  holdLogo: 3600, // the same with the drawn logo (Zoom): it draws first, the image opens at 1700
  endLogo: 2250, // Fade: from the logo starting (as the golden ratio fades) to the white lifting: drawn by ~1.7s, then held
  cut: 120, // each showreel image (hard cuts)
  passes: 1, // times through the reel (the first image is not repeated at the very start)
  golden: 650, // the golden ratio holds before the zoom
  land: 550, // into the zoom: the hero's entrance starts (the drawing is ~95% there, gliding in)
  zoom: 850, // golden ratio → the hero's construction (= the transform transitions in start-loader.css)
};
const MAX_WAIT = 2500; // start anyway if the images are slow

export default function StartLoaderRun({ frames }: { frames: number }) {
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
      const logo = root.dataset.intro === 'zoom';
      let t = Math.max(0, opened + (logo ? T.holdLogo : T.hold) - performance.now());
      const order: (number | 'golden')[] = [];
      for (let p = 0; p < T.passes; p++) for (let i = 0; i < frames; i++) if (p || i) order.push(i);
      order.push('golden');
      // The reel runs off the frame clock, not a timer per cut: each frame shows whichever image is
      // due by now, so a busy main thread can't bunch cuts together (queued timers fire back to back
      // and flash an image for a few ms). Starts on a frame; the zoom follows the golden ratio's hold.
      at(t, () => {
        let t0 = 0;
        const step = (now: number) => {
          if (cancelled) return;
          if (!t0) t0 = now;
          const k = Math.min(order.length - 1, Math.floor((now - t0) / T.cut));
          show(order[k]);
          if (k < order.length - 1) raf = requestAnimationFrame(step);
          // Zoom: the golden ratio zooms. Fade: it goes, the logo draws in its place, then the white lifts.
          else at(T.golden, logo ? zoom : () => { el.setAttribute('data-end', ''); at(T.endLogo, zoom); });
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
