'use client';

import { useEffect } from 'react';

/* /home-4: the hero always on the white page (HeroOptions' Light, without the tabs). The page also
   sets html[data-hero] in an inline script before first paint, so the dark hero never flashes;
   this keeps it set and clears it when leaving the page. */
export default function HeroLight() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.hero = 'light';
    return () => { delete root.dataset.hero; };
  }, []);
  return null;
}
