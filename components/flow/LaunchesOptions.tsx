'use client';

import Launches, { type LaunchesVariant as Variant } from './Launches';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-2: the Launches section as big slides (carousel), the drifting cloud, the draggable grid, the simple
   video box, the slider, or the floating load-and-scatter teaser (float; float2, Float II, is the default; float3, Float III, settles into a card between the margin lines; float4, Float IV, the same card as a
   track of launches with the next one peeking in, after tryprofound.com's story cards); bottom
   tabs once it is on screen; ?launches=. */

// Hidden for now (the code stays in Launches.tsx): ['carousel', 'Carousel'], ['cloud', 'Cloud'], ['grid', 'Grid'], ['box', 'Box'], ['slider', 'Slider']
const VARIANTS: [Variant, string][] = [['float2', 'Float II'], ['float3', 'Float III'], ['float4', 'Float IV'], ['float', 'Float']];
// The last section: from when its top reaches the middle of the screen.
const arrived = (r: DOMRect, vh: number) => r.top <= vh * 0.5;

// `only`: a page that offers just some of the variants (/home-4: Float II, III, IV); the first is the default
export default function LaunchesOptions({ only }: { only?: Variant[] } = {}) {
  const options = only ? VARIANTS.filter(([id]) => only.includes(id)) : VARIANTS;
  const [variant, pick] = useOption<Variant>('launches', options, options[0][0]);
  return (
    <>
      <Launches variant={variant} />
      <OptionTabs groups={[{ label: 'Launches layout', options, value: variant, onChange: (v) => pick(v as Variant) }]}
        selector="section.lc" label="Launches options" when={arrived} />
    </>
  );
}
