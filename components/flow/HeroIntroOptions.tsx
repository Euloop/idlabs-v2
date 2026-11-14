'use client';

import { useEffect, useState } from 'react';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-4's hero tabs. Loader: New (today's, /hero's: onto the clean hero; /home-4) or the one before it,
   ending in the Zoom (onto the drawn hero) or the Fade (onto the clean hero) — /home-4/classic?intro=.
   A pick goes to that page (the two loaders are different markup, built into each page), keeping the
   other tabs' picks in the address. Then the Clients tab.
   Bottom tabs while the hero fills the screen — only once the hero's entrance has played out (the
   loader, then every headline line, paragraph and logo in), so they never sit over it arriving. */
/* Clients (?clients=): the client's 12 in their order with "Our Network" hidden (default), or the
   earlier 16 with the network card. html[data-clients], set before first paint by /home-4's script. */
type Clients = 'picked' | 'all';
const CLIENTS: [Clients, string][] = [['picked', 'Clients 12'], ['all', 'Clients 16 + Network']];
const onHero = (r: DOMRect, vh: number) => r.top > -vh * 0.25 && r.bottom > vh * 0.6;
const never = () => false;
/* `first`: the New loader with only the reel's first half (the people and papers, no golden spirals),
   on /home-4 itself (?loader=first, read before first paint by StartLoader `choice`) */
type Loader = 'new' | 'first' | 'zoom' | 'fade';
const LOADERS: [Loader, string][] = [['new', 'New loader'], ['first', 'New · first half'], ['zoom', 'Zoom'], ['fade', 'Fade']];

export default function HeroIntroOptions({ loader = 'new' }: { loader?: 'new' | 'classic' } = {}) {
  const [clients, pickClients] = useOption<Clients>('clients', CLIENTS, 'picked');
  // which loader this page plays: New here; on /home-4/classic its ending, from ?intro= (Zoom by default)
  const [current, setCurrent] = useState<Loader>(loader === 'new' ? 'new' : 'zoom');
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (loader === 'classic') setCurrent(q.get('intro') === 'fade' ? 'fade' : 'zoom');
    else if (q.get('loader') === 'first') setCurrent('first');
  }, [loader]);
  const pickLoader = (v: Loader) => {
    const q = new URLSearchParams(window.location.search);
    q.delete('intro');
    q.delete('loader');
    if (v === 'zoom' || v === 'fade') q.set('intro', v);
    if (v === 'first') q.set('loader', 'first');
    const qs = q.toString();
    window.location.href = `${v === 'new' || v === 'first' ? '/home-4' : '/home-4/classic'}${qs ? `?${qs}` : ''}`;
  };
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
      groups={[
        { label: 'Loader', options: LOADERS, value: current, onChange: (v) => pickLoader(v as Loader) },
        { label: 'Clients', options: CLIENTS, value: clients, onChange: (v) => { pickClients(v as Clients); document.documentElement.dataset.clients = v; } },
      ]}
      selector="div.hero" label="Hero intro options" when={heroIn ? onHero : never} />
  );
}
