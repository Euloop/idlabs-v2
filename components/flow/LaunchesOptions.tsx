'use client';

import Launches from './Launches';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-2: the Launches section as the drifting cloud (default) or the simple video box; bottom
   tabs once it is on screen; ?launches=. */

type Variant = 'cloud' | 'box';
const VARIANTS: [Variant, string][] = [['cloud', 'Cloud'], ['box', 'Box']];
// The last section: from when its top reaches the middle of the screen.
const arrived = (r: DOMRect, vh: number) => r.top <= vh * 0.5;

export default function LaunchesOptions() {
  const [variant, pick] = useOption<Variant>('launches', VARIANTS, 'cloud');
  return (
    <>
      <Launches variant={variant} />
      <OptionTabs groups={[{ label: 'Launches layout', options: VARIANTS, value: variant, onChange: (v) => pick(v as Variant) }]}
        selector=".lc" label="Launches options" when={arrived} />
    </>
  );
}
