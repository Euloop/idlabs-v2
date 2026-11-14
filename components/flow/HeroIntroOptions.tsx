'use client';

import { useEffect, useState } from 'react';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-4's hero tabs. The loader is /hero's now (StartLoader fixed: always onto the clean hero), so the
   earlier Zoom · Fade intro tab is gone; the Clients tab stays.
   Bottom tabs while the hero fills the screen — only once the hero's entrance has played out (the
   loader, then every headline line, paragraph and logo in), so they never sit over it arriving. */
/* Clients (?clients=): the client's 12 in their order with "Our Network" hidden (default), or the
   earlier 16 with the network card. html[data-clients], set before first paint by /home-4's script. */
type Clients = 'picked' | 'all';
const CLIENTS: [Clients, string][] = [['picked', 'Clients 12'], ['all', 'Clients 16 + Network']];
const onHero = (r: DOMRect, vh: number) => r.top > -vh * 0.25 && r.bottom > vh * 0.6;
const never = () => false;

export default function HeroIntroOptions() {
  const [clients, pickClients] = useOption<Clients>('clients', CLIENTS, 'picked');
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
        { label: 'Clients', options: CLIENTS, value: clients, onChange: (v) => { pickClients(v as Clients); document.documentElement.dataset.clients = v; } },
      ]}
      selector="div.hero" label="Hero intro options" when={heroIn ? onHero : never} />
  );
}
