'use client';

import Services from '../Services';
import ServicesFocus, { type Pick } from './ServicesFocus';
import OptionTabs, { THEMES, useOption } from './OptionTabs';

/* /home-2: Services in one of five layouts — the one-column detail with a different way of
   picking the service (Radio, the default; Cycle; Numbers; Names — see ServicesFocus.tsx) or Grid
   (the three cards) — each in light or dark (dark brings the night down while it is on
   screen, ThemeDriver.tsx). Bottom tabs while Services is on screen; ?services= &servicesTheme=. */

type Layout = 'detail' | 'cycle' | 'numbers' | 'names' | 'grid';
type Theme = 'light' | 'dark';
const LAYOUTS: [Layout, string][] = [['detail', 'Radio'], ['cycle', 'Cycle'], ['numbers', 'Numbers'], ['names', 'Names'], ['grid', 'Grid']];
const PICK: Record<Exclude<Layout, 'grid'>, Pick> = { detail: 'radio', cycle: 'cycle', numbers: 'numbers', names: 'names' };
// From when Services' top reaches the middle of the screen until the next section comes up.
const arrived = (r: DOMRect, vh: number, nextTop: number) => r.top <= vh * 0.5 && nextTop >= vh - 1;

export default function ServicesOptions() {
  const [layout, pickLayout] = useOption<Layout>('services', LAYOUTS, 'detail');
  const [theme, pickTheme] = useOption<Theme>('servicesTheme', THEMES, 'light');
  const light = theme === 'light';
  return (
    <>
      {layout === 'grid' ? <Services key={theme} light={light} /> : <ServicesFocus key={layout + theme} light={light} pick={PICK[layout]} />}
      <OptionTabs
        groups={[
          { label: 'Services layout', options: LAYOUTS, value: layout, onChange: (v) => pickLayout(v as Layout) },
          { label: 'Services theme', options: THEMES, value: theme, onChange: (v) => pickTheme(v as Theme) },
        ]}
        selector="section.sv" label="Services options" when={arrived}
      />
    </>
  );
}
