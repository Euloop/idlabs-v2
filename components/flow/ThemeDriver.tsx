'use client';

import { useEffect } from 'react';

/* /home-2: the page is light after the hero, but a section shown in its dark option (the tools
   or Services set to Dark) brings the night down from the moment it starts to come on screen,
   and the light comes back the moment the section after it starts to come on screen. One writer only: this sets
   html[data-night-lock], and Section 2 (which writes the page theme as you scroll) honours it,
   so the two never fight (no flicker). It also writes the theme itself when the lock changes. */
const DARK = '[data-lights-down], .sv[data-tone="dark"], .iso[data-mode="dark"]';
const SECTIONS = '.hero, .s2, .s3, .tg, .iso, .sv, .lc';

export default function ThemeDriver() {
  useEffect(() => {
    const root = document.documentElement;
    let down = false;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const was = down;
      // The page takes the theme of the section coming in: the last section whose top edge has
      // entered the screen (8% up from the bottom). So the switch happens as soon as the next
      // section shows, for both — no dark section lingering or vanishing on a light page.
      let current: HTMLElement | null = null;
      let best = -Infinity;
      document.querySelectorAll<HTMLElement>(SECTIONS).forEach((el) => {
        const t = el.getBoundingClientRect().top;
        if (t < 0.92 * vh && t > best) { best = t; current = el; }
      });
      down = !!current && (current as HTMLElement).matches(DARK);
      if (down === was) return;
      root.toggleAttribute('data-night-lock', down);
      if (down) root.dataset.theme = 'night';
      else if (root.dataset.theme === 'night') root.dataset.theme = 'light';
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // a section switched to / from dark (tabs): re-check
    const mo = new MutationObserver(onScroll);
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-mode', 'data-tone', 'data-lights-down'], childList: true });
    return () => { cancelAnimationFrame(raf); mo.disconnect(); root.removeAttribute('data-night-lock'); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  return null;
}
