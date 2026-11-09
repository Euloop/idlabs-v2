'use client';

import Services from '../Services';
import ServicesFocus from './ServicesFocus';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-2: the Services section in one of two layouts — Detail (one column, a service at a time;
   default) or Grid (the three cards). Bottom tabs while Services is on screen; ?services=. */

type Layout = 'detail' | 'grid';
const LAYOUTS: [Layout, string][] = [['detail', 'Detail'], ['grid', 'Grid']];
// Show from when Services' top reaches the middle of the screen until the next section's top edge
// comes up from below.
const arrived = (r: DOMRect, vh: number, nextTop: number) => r.top <= vh * 0.5 && nextTop >= vh - 1;

export default function ServicesOptions() {
  const [layout, pick] = useOption<Layout>('services', LAYOUTS, 'detail');
  return (
    <>
      {layout === 'grid' ? <Services light /> : <ServicesFocus />}
      <OptionTabs options={LAYOUTS} value={layout} onChange={pick} selector=".sv" label="Services layout" when={arrived} />
    </>
  );
}
