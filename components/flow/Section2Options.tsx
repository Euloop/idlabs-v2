'use client';

import SectionTwoFlow from '../SectionTwoFlow';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-2: one Section 2 at a time. Minimal (the tree) is the default; the bottom tabs
   (Minimal · Line · Cards, while Section 2 is pinned) switch it; ?style= links each one.
   Switching remounts the section in the new style at the same scroll position. */

type Style = 'line' | 'cards' | 'pills';
const STYLES: [Style, string][] = [['pills', 'Minimal'], ['line', 'Line'], ['cards', 'Cards']];

export default function Section2Options() {
  const [style, pick] = useOption<Style>('style', STYLES, 'pills');
  return (
    <>
      <SectionTwoFlow key={style} variant={style} night={false} />
      <OptionTabs options={STYLES} value={style} onChange={pick} selector=".s2" label="Diagram style" />
    </>
  );
}
