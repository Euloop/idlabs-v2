'use client';

import { useEffect } from 'react';

/* Drives StartLoader's sequence by setting attributes on the overlay — no React re-renders, so the
   cuts land on exact frames. All times in ms. */
const T = {
  hold: 1800, // the first image is up this long from when it starts opening (the text fading in after it, CSS)
  cut: 85, // each showreel image
  passes: 1, // times through the reel (the first image is not repeated at the very start)
  golden: 650, // the golden ratio holds before the zoom
  zoom: 1100, // golden ratio → the hero's construction
};
const MAX_WAIT = 2500; // start anyway if the images are slow

export default function StartLoaderRun({ frames }: { frames: number }) {
  useEffect(() => {
    const root = document.documentElement;
    const el = document.querySelector<HTMLElement>('.sl');
    if (root.dataset.loader !== 'run' || !el) return;

    // React runs this twice in dev: the first run is cancelled, and only its own timers go with it.
    let cancelled = false;
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
    };

    const zoom = () => {
      const golden = el.querySelector<HTMLElement>('.sl-golden');
      const target = document.querySelector<HTMLElement>('.hv-golden');
      root.dataset.loader = 'zoom';
      const a = golden?.getBoundingClientRect();
      const b = target?.getBoundingClientRect();
      // Zoom only onto a golden-shaped target (the phone layout of the hero is not one): otherwise
      // the drawing just fades with the white.
      const fits = a && b && b.height > 0 && Math.abs(b.width / b.height - a.width / a.height) < 0.03;
      if (golden && a && b && fits) {
        // a is the drawing at its CSS scale-down (577.663 × 980.663 drawn at 208 tall); end at the target's size
        const s = b.height / golden.offsetHeight;
        golden.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${s})`;
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
      let t = Math.max(0, opened + T.hold - performance.now());
      const order: number[] = [];
      for (let p = 0; p < T.passes; p++) for (let i = 0; i < frames; i++) if (p || i) order.push(i);
      for (const i of order) { at(t, () => show(i)); t += T.cut; }
      at(t, () => show('golden'));
      at(t + T.golden, zoom);
    };

    // Start once every reel image is decoded, so no cut ever lands on a blank.
    let started = false;
    const go = () => { if (!started && !cancelled) { started = true; start(); } };
    const imgs = Array.from(el.querySelectorAll('img'));
    Promise.all(imgs.map((img) => img.decode().catch(() => {}))).then(go);
    at(MAX_WAIT, go);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      release();
    };
  }, [frames]);
  return null;
}
