'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/* Lenis smooth wheel scrolling. Native scrolling on touch devices (syncTouch off),
   and disabled entirely when the visitor prefers reduced motion. Lenis drives the
   real window scroll, so position: sticky and the scroll-linked effects keep working. */
export default function SmoothScroll() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | undefined;
    const update = () => {
      lenis?.destroy();
      lenis = preference.matches
        ? undefined
        : new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true, syncTouch: false, anchors: true });
      // shared, so a section can hold the page still for a moment (ResearchTerminal's sequence)
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    };
    update();
    preference.addEventListener('change', update);
    return () => {
      preference.removeEventListener('change', update);
      lenis?.destroy();
    };
  }, []);
  return null;
}
