'use client';

import { useEffect } from 'react';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-2: the hero on dark paper (the live page's) or on the white page. Light puts
   html[data-hero='light']: everything the hero sits on — the page, the rules, the header — is
   white and its type dark (flow.css). The theme logic is untouched: the lights still come up at
   the same point and the hero still fades into Section 2, now white to white. Bottom tabs while
   the hero fills the screen; ?hero=. */

type Mode = 'dark' | 'light';
const MODES: [Mode, string][] = [['dark', 'Dark'], ['light', 'Light']];
const onHero = (r: DOMRect, vh: number) => r.top > -vh * 0.25 && r.bottom > vh * 0.6;

export default function HeroOptions() {
  const [mode, pick] = useOption<Mode>('hero', MODES, 'dark');
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'light') root.dataset.hero = 'light';
    else delete root.dataset.hero;
    return () => { delete root.dataset.hero; };
  }, [mode]);
  return (
    <OptionTabs groups={[{ label: 'Hero', options: MODES, value: mode, onChange: (v) => pick(v as Mode) }]}
      selector="div.hero" label="Hero options" when={onHero} dark={mode === 'dark'} />
  );
}
