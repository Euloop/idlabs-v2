'use client';

import { useEffect, useState } from 'react';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-4: how the start loader ends, and the hero it hands over to (?intro=).
   Zoom — the golden ratio zooms up and settles onto the hero's construction (the drawn hero).
   Fade — the golden ratio fades away where it is, onto the clean hero: the same copy, rails and
   logos, no construction behind them.
   StartLoader's inline script reads ?intro= into html[data-intro] before first paint, so the clean
   hero never flashes the drawing; a pick reloads the page so the loader plays with that ending.
   Bottom tabs while the hero fills the screen — only once the hero's entrance has played out (the
   loader, then every headline line, paragraph and logo in), so they never sit over it arriving. */

export type Intro = 'zoom' | 'fade';
const INTROS: [Intro, string][] = [['zoom', 'Zoom'], ['fade', 'Fade']];
const onHero = (r: DOMRect, vh: number) => r.top > -vh * 0.25 && r.bottom > vh * 0.6;
const never = () => false;

export default function HeroIntroOptions() {
  const [intro, pick] = useOption<Intro>('intro', INTROS, 'zoom');
  const [heroIn, setHeroIn] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.hero.hv');
    let live = true;
    const done = () => { if (live) setHeroIn(true); };
    // Every entrance animation in the hero, finished. They are held (paused) while the loader runs,
    // so this waits for the loader too; none at all (reduced motion) is ready at once. A cap in case
    // one is cancelled rather than finished.
    const all = hero ? hero.getAnimations({ subtree: true }).filter((a) => a.effect?.getTiming().iterations !== Infinity) : [];
    Promise.all(all.map((a) => a.finished.catch(() => undefined))).then(done);
    const cap = window.setTimeout(done, 25000);
    return () => { live = false; clearTimeout(cap); };
  }, []);

  return (
    <OptionTabs
      groups={[{ label: 'Hero intro', options: INTROS, value: intro, onChange: (v) => { pick(v as Intro); window.location.reload(); } }]}
      selector="div.hero" label="Hero intro options" when={heroIn ? onHero : never} />
  );
}
