'use client';

import { useEffect, type RefObject } from 'react';

/* Back-to-back sticky sections each hold their content in the middle of their own stage, so
   scrolling from one to the next leaves most of a screen empty. This pulls `section` up under
   the previous section's hold, leaving `gap` px between the previous content's bottom and this
   one's top, but only as far as keeps this stage from locking before the previous content
   has scrolled off screen. Re-measured on resize. */
export function usePullUp(
  section: RefObject<HTMLElement | null>,
  sel: { prevContent: string; prevPin: string; content: string; pin: string },
  gap: number,
) {
  useEffect(() => {
    const s = section.current;
    const prevContent = document.querySelector<HTMLElement>(sel.prevContent);
    const prevPin = document.querySelector<HTMLElement>(sel.prevPin);
    const content = s?.querySelector<HTMLElement>(sel.content);
    const pin = s?.querySelector<HTMLElement>(sel.pin);
    if (!s || !prevContent || !prevPin || !content || !pin) return;
    const fit = () => {
      const below = prevPin.getBoundingClientRect().bottom - prevContent.getBoundingClientRect().bottom;
      const above = content.getBoundingClientRect().top - pin.getBoundingClientRect().top;
      // never more than `below`: this section's stage must not lock while the previous
      // content is still on screen (so the gap is at least `above`)
      s.style.marginTop = `${-Math.max(0, Math.min(below, below + above - gap))}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [section, sel.prevContent, sel.prevPin, sel.content, sel.pin, gap]);
}
