'use client';

import Launches, { type LaunchesVariant as Variant } from './Launches';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-2: the Launches section as big slides (carousel), the drifting cloud, the draggable grid, the simple
   video box, the slider, or the floating load-and-scatter teaser (float, the default); bottom
   tabs once it is on screen; ?launches=. */

const VARIANTS: [Variant, string][] = [['float', 'Float'], ['carousel', 'Carousel'], ['cloud', 'Cloud'], ['grid', 'Grid'], ['box', 'Box'], ['slider', 'Slider']];
// The last section: from when its top reaches the middle of the screen.
const arrived = (r: DOMRect, vh: number) => r.top <= vh * 0.5;

export default function LaunchesOptions() {
  const [variant, pick] = useOption<Variant>('launches', VARIANTS, 'float');
  return (
    <>
      <Launches variant={variant} />
      <OptionTabs groups={[{ label: 'Launches layout', options: VARIANTS, value: variant, onChange: (v) => pick(v as Variant) }]}
        selector="section.lc" label="Launches options" when={arrived} />
    </>
  );
}
