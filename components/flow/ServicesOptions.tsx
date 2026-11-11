'use client';

import Services from '../Services';
import ServicesFocus, { type Pick } from './ServicesFocus';
import ServicesCards from './ServicesCards';
import OptionTabs, { THEMES, useOption } from './OptionTabs';

/* /home-2: Services in one of five layouts — Columns (ruled cells, the default) or Cards (separate
   hairline cards), see ServicesCards.tsx; the one-column detail picked by Cycle or Numbers (see
   ServicesFocus.tsx); or Grid (the three diagram cells, Services.tsx) — each in light or dark (dark
   brings the night down while it is on screen, ThemeDriver.tsx). Bottom tabs while Services is on
   screen; ?services= &servicesTheme=. */

type Layout = 'columns' | 'cards' | 'cycle' | 'numbers' | 'grid';
type Theme = 'light' | 'dark';
const LAYOUTS: [Layout, string][] = [['columns', 'Columns'], ['cards', 'Cards'], ['cycle', 'Cycle'], ['numbers', 'Numbers'], ['grid', 'Grid']];
const PICK: Partial<Record<Layout, Pick>> = { cycle: 'cycle', numbers: 'numbers' };
// From when Services' top reaches the middle of the screen until the next section comes up.
const arrived = (r: DOMRect, vh: number, nextTop: number) => r.top <= vh * 0.5 && nextTop >= vh - 1;

export default function ServicesOptions() {
  const [layout, pickLayout] = useOption<Layout>('services', LAYOUTS, 'columns');
  const [theme, pickTheme] = useOption<Theme>('servicesTheme', THEMES, 'light');
  const light = theme === 'light';
  return (
    <>
      {layout === 'grid' ? <Services key={theme} light={light} />
        : layout === 'columns' || layout === 'cards' ? <ServicesCards key={layout + theme} light={light} layout={layout} />
        : <ServicesFocus key={layout + theme} light={light} pick={PICK[layout]} />}
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
