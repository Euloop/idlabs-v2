'use client';

import SectionTwoFlow from '../SectionTwoFlow';
import SectionTwo from '../SectionTwo';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-2: one Section 2 at a time. Minimal (the tree) is the default; the bottom tabs
   (Minimal · Line · Cards · Diagram, while Section 2 is pinned) switch it; ?style= links each
   one. Diagram is the live page's funnel diagram (SectionTwo.tsx) without its closing text: after the
   animation it scrolls on normally. Switching remounts
   the section in the new style at the same scroll position. */

type Style = 'line' | 'cards' | 'pills' | 'diagram';
const STYLES: [Style, string][] = [['pills', 'Minimal'], ['line', 'Line'], ['cards', 'Cards'], ['diagram', 'Diagram']];

export default function Section2Options() {
  const [style, pick] = useOption<Style>('style', STYLES, 'pills');
  return (
    <>
      {style === 'diagram' ? <SectionTwo key="diagram" noOutro /> : <SectionTwoFlow key={style} variant={style} night={false} />}
      <OptionTabs groups={[{ label: 'Diagram style', options: STYLES, value: style, onChange: (v) => pick(v as Style) }]} selector="section.s2" label="Section 2 options" />
    </>
  );
}
