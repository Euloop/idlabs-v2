'use client';

import { useEffect, type RefObject } from 'react';

/* Soft pin: a sticky stage whose content eases into the centre and eases out again, instead
   of travelling at scroll speed and stopping dead when position: sticky locks (which reads
   as a sudden lurch).

   Layout contract: the section is pulled up by one viewport (margin-top: -100svh) and its
   stage is sticky (top 0, 100svh tall), so the stage locks one viewport early. Its height
   includes one extra viewport at the start (arrive) and one at the end (leave).

   Arrive, first viewport of scroll after the stage locks: the content starts half a screen
   low (centre on the bottom edge, just entering) and rises to the centre on an ease-out
   quad. Its speed starts at exactly 1:1 with the scroll and falls smoothly to 0.
   Leave, last viewport before the stage unlocks: the reverse, from 0 back up to 1:1, so it
   hands over seamlessly to the normal scroll when the sticky releases. */

export const ARRIVE = 1; // viewports
export const LEAVE = 1; // viewports

/** Offset (px, + = down) for the content, given the section's rect top and height. */
export function softPinOffset(top: number, height: number, vh: number) {
  const p = -top; // px scrolled since the stage locked
  const arrive = Math.min(1, Math.max(0, p / (ARRIVE * vh)));
  const leaveStart = height - vh - LEAVE * vh;
  const leave = Math.min(1, Math.max(0, (p - leaveStart) / (LEAVE * vh)));
  const down = 0.5 * vh * (1 - arrive) * (1 - arrive); // ease-out: 1:1 → 0
  const up = -0.5 * vh * leave * leave; // ease-in: 0 → 1:1
  return down + up;
}

/** Applies the soft pin to `content` inside `section` on every scroll frame. */
export function useSoftPin(section: RefObject<HTMLElement | null>, content: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const s = section.current, c = content.current;
    if (!s || !c) return;
    const apply = () => {
      const r = s.getBoundingClientRect();
      c.style.transform = `translate3d(0, ${softPinOffset(r.top, r.height, window.innerHeight).toFixed(2)}px, 0)`;
    };
    apply();
    window.addEventListener('scroll', apply, { passive: true });
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('scroll', apply);
      window.removeEventListener('resize', apply);
    };
  }, [section, content]);
}
