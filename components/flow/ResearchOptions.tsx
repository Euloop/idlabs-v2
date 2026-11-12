'use client';

import SectionThree, { type Cover } from '../SectionThree';
import OptionTabs, { useOption } from './OptionTabs';

/* /home-2: the research papers with one of two covers: Paper (the default; each paper's real
   first page as a printed, punched cover, SectionThree's PaperCover) or Site (the live page's
   cover). Bottom tabs while the papers are on screen; ?research=. */

const COVERS: [Cover, string][] = [['paper', 'Paper'], ['site', 'Site']];
// From when the section's top reaches the middle of the screen until the next section comes up.
const arrived = (r: DOMRect, vh: number, nextTop: number) => r.top <= vh * 0.5 && nextTop >= vh - 1;

export default function ResearchOptions({ lead }: { lead?: string }) {
  const [cover, pick] = useOption<Cover>('research', COVERS, 'paper');
  return (
    <>
      <SectionThree lead={lead} cover={cover} />
      <OptionTabs
        groups={[{ label: 'Paper cover', options: COVERS, value: cover, onChange: (v) => pick(v as Cover) }]}
        selector="section.s3" label="Research options" when={arrived}
      />
    </>
  );
}
