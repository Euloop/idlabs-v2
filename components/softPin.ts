'use client';

import { useEffect, type RefObject } from 'react';

/* Soft pin (after the /experiment build): a sticky 100svh stage whose content eases into the
   centre and out again, instead of travelling at scroll speed and stopping dead when
   position: sticky locks.

   Layout contract: the section follows the previous one directly (no overlap); its stage is
   sticky (top 0, 100svh tall). Height = 1 viewport (the stage) + the hold + 1 viewport to
   leave (if it leaves; the last section doesn't).

   Arrive, the last viewport before the stage locks: the stage rises at scroll speed, and
   the content within it is held back so that on screen it starts at the bottom edge moving
   1:1 with the scroll and slows smoothly to rest in the centre as the stage locks.
   Leave, the last viewport before the stage releases: the reverse, from rest back up to 1:1,
   so it hands over seamlessly to the normal scroll. */

export type SoftPinState = {
  /** 0 → 1 over the viewport before the stage locks */
  arrive: number;
  /** 0 → 1 over the last viewport before the stage releases (0 if it never leaves) */
  leave: number;
  /** the stage is locked (content at rest in the centre or leaving) */
  locked: boolean;
};

export function softPin(top: number, height: number, vh: number, leaves: boolean) {
  // arrive: t = stage top (it sits at the section top until it locks)
  const t = Math.max(0, top);
  const f = t >= vh ? t - 0.5 * vh : (0.5 * t * t) / vh; // on-screen offset of the content
  let offset = f - t;
  const arrive = Math.min(1, Math.max(0, 1 - t / vh));
  let leave = 0;
  if (leaves) {
    const p = -top; // px scrolled since the stage locked
    const start = height - 2 * vh;
    leave = Math.min(1, Math.max(0, (p - start) / vh));
    offset += -0.5 * vh * leave * leave;
  }
  return { offset, state: { arrive, leave, locked: top <= 0 } as SoftPinState };
}

/** Applies the soft pin to `content` inside `section` each scroll frame; `onFrame` gets the
    progress (for scroll-typed text). */
export function useSoftPin(
  section: RefObject<HTMLElement | null>,
  content: RefObject<HTMLElement | null>,
  leaves: boolean,
  onFrame?: (s: SoftPinState) => void,
) {
  useEffect(() => {
    const s = section.current, c = content.current;
    if (!s || !c) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top > vh * 1.6 || r.bottom < -vh * 0.6) return; // far off screen
      const { offset, state } = softPin(r.top, r.height, vh, leaves);
      c.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      onFrame?.(state);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [section, content, leaves, onFrame]);
}
