'use client';

import SectionFourIso from '../SectionFourIso';
import ToolsGraph from './ToolsGraph';
import OptionTabs, { THEMES, useOption } from './OptionTabs';

/* /home-2: the analytical tools in one of two layouts — Graph (a small living network; default)
   or Device (the exploded isometric device) — each in light or dark (dark brings the night down
   while it is on screen, ThemeDriver.tsx). Bottom tabs while the section is on screen;
   ?tools= &toolsTheme=. */

type Layout = 'graph' | 'device';
type Theme = 'light' | 'dark';
const LAYOUTS: [Layout, string][] = [['graph', 'Graph'], ['device', 'Device']];
// From when the section's top reaches the middle of the screen until the next section comes up.
const inView = (r: DOMRect, vh: number, nextTop: number) => r.top <= vh * 0.5 && nextTop >= vh - 1;

export default function ToolsOptions() {
  const [layout, pickLayout] = useOption<Layout>('tools', LAYOUTS, 'graph');
  const [theme, pickTheme] = useOption<Theme>('toolsTheme', THEMES, 'light');
  const light = theme === 'light';
  return (
    <>
      {layout === 'device' ? <SectionFourIso key={theme} light={light} /> : <ToolsGraph key={theme} light={light} />}
      <OptionTabs
        groups={[
          { label: 'Tools layout', options: LAYOUTS, value: layout, onChange: (v) => pickLayout(v as Layout) },
          { label: 'Tools theme', options: THEMES, value: theme, onChange: (v) => pickTheme(v as Theme) },
        ]}
        selector="section.iso, section.tg" label="Tools options" when={inView}
      />
    </>
  );
}
