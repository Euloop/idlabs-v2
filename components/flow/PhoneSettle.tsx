'use client';

import { useEffect } from 'react';
import { settleZones } from './settle';

/* Phones only (≤559px), touch only: when a swipe (and its momentum) comes to rest inside one of the
   in-between stretches the sections registered (settle.ts), the page glides on to the stretch's end in the
   direction of the swipe — or back to its start on a swipe up — so a swipe never ends on a blank screen or
   mid-animation. Free scrolling everywhere else. A new touch stops a glide at once. Desktop: nothing runs
   (no touch, and the width check). */

const QUIET = 150; // ms without a scroll event: the momentum has stopped

export default function PhoneSettle() {
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 559px)');
    let touching = false, armed = false, startY = 0, lastY = window.scrollY, lastDir = 0;
    let timer = 0, raf = 0, gliding = false;

    const stopGlide = () => { if (raf) cancelAnimationFrame(raf); raf = 0; gliding = false; };
    const glide = (to: number, ms?: number) => {
      const from = window.scrollY, d = to - from;
      if (Math.abs(d) < 2) return;
      // the stretch's own length (scaled by how much of it is left), or a quick glide
      const dur = ms ? Math.max(380, ms * Math.min(1, Math.abs(d) / 900)) : Math.min(900, Math.max(380, 320 + Math.abs(d) * 0.22));
      const t0 = performance.now();
      gliding = true;
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        // ease out; a long glide eases in and out, so it reads as one move
        const e = ms ? (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) : 1 - Math.pow(1 - t, 3);
        window.scrollTo(0, from + d * e);
        if (t < 1) raf = requestAnimationFrame(step);
        else { raf = 0; gliding = false; lastY = window.scrollY; }
      };
      raf = requestAnimationFrame(step);
    };

    const settle = () => {
      timer = 0;
      if (!armed || touching || gliding || !mq.matches) return;
      armed = false;
      // the tools' research sequence holds the page while it plays: leave it be
      const lenis = (window as unknown as { __lenis?: { isStopped?: boolean } }).__lenis;
      if (lenis?.isStopped) return;
      const y = window.scrollY;
      const z = settleZones().find(([a, b]) => y > a + 1 && y < b - 1);
      if (!z) return;
      const swipe = y - startY;
      const dir = Math.abs(swipe) > 4 ? Math.sign(swipe) : lastDir;
      const fwd = dir > 0 ? true : dir < 0 ? false : y - z[0] > z[1] - y;
      glide(fwd ? z[1] : z[0], z[2]);
    };
    const schedule = () => { clearTimeout(timer); timer = window.setTimeout(settle, QUIET); };

    const onTouchStart = () => { touching = true; armed = false; stopGlide(); clearTimeout(timer); startY = window.scrollY; };
    const onTouchEnd = () => { touching = false; if (!mq.matches) return; armed = true; schedule(); };
    const onScroll = () => {
      if (gliding) return;
      const y = window.scrollY;
      if (y !== lastY) lastDir = y > lastY ? 1 : -1;
      lastY = y;
      if (armed && !touching) schedule();
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      stopGlide(); clearTimeout(timer);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return null;
}
