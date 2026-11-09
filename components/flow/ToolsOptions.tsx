'use client';

import SectionFourIso from '../SectionFourIso';
import ToolsGraph from './ToolsGraph';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-2: the analytical tools in one of two layouts — Graph (a small living network; default)
   or Device (the exploded isometric device). Bottom tabs while the section is on screen; ?tools=. */

type Layout = 'graph' | 'device';
const LAYOUTS: [Layout, string][] = [['graph', 'Graph'], ['device', 'Device']];
// From when the section's top reaches the middle of the screen until the next section comes up.
const inView = (r: DOMRect, vh: number, nextTop: number) => r.top <= vh * 0.5 && nextTop >= vh - 1;

export default function ToolsOptions() {
  const [layout, pick] = useOption<Layout>('tools', LAYOUTS, 'graph');
  return (
    <>
      {layout === 'device' ? <SectionFourIso light /> : <ToolsGraph />}
      <OptionTabs options={LAYOUTS} value={layout} onChange={pick} selector=".iso, .tg" label="Tools layout" when={inView} />
    </>
  );
}
