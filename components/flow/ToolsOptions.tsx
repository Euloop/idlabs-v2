'use client';

import SectionFourIso from '../SectionFourIso';
import ToolsGraph from './ToolsGraph';
import ToolsStack from './ToolsStack';
import ToolsCollage, { type CollageTheme as Paper } from './ToolsCollage';
import OptionTabs, { THEMES, useOption, type Group } from './OptionTabs';

/* /home-2: the analytical tools in one of four layouts — Collage (glass card over archive scraps,
   ToolsCollage.tsx; in Gather), Stack (glass panes in a row, ToolsStack.tsx), Graph (a
   small living network) or Device (the exploded isometric device). Stack, Graph and Device come in
   light or dark (dark brings the night down while it is on screen, ThemeDriver.tsx); Collage in
   paper, paper dark or white. Motion: the Collage in White, the screenshots replaced by a
   walkthrough of each tool's UI (tool-motion/) — the default —, its intro line at 12px or 20px (?toolsIntro=).
   Bottom tabs while the section is on screen; ?tools= &toolsTheme= (&collageTheme=). */

type Layout = 'graph' | 'device' | 'stack' | 'collage' | 'motion';
type Theme = 'light' | 'dark';
const LAYOUTS: [Layout, string][] = [['motion', 'Motion'], ['collage', 'Collage'], ['stack', 'Stack'], ['graph', 'Graph'], ['device', 'Device']];
type Intro = 'small' | 'large';
const INTROS: [Intro, string][] = [['small', '12px'], ['large', '20px']];
const PAPERS: [Paper, string][] = [['gather', 'Gather'], ['white', 'White'], ['paper', 'Paper'], ['dark', 'Paper dark']];
// From when the section's top reaches the middle of the screen until the next section comes up.
const inView = (r: DOMRect, vh: number, nextTop: number) => r.top <= vh * 0.5 && nextTop >= vh - 1;

export default function ToolsOptions() {
  const [layout, pickLayout] = useOption<Layout>('tools', LAYOUTS, 'motion');
  const [theme, pickTheme] = useOption<Theme>('toolsTheme', THEMES, 'light');
  const [paper, pickPaper] = useOption<Paper>('collageTheme', PAPERS, 'gather');
  const [intro, pickIntro] = useOption<Intro>('toolsIntro', INTROS, 'small');
  const light = theme === 'light';
  const collage = layout === 'collage';
  return (
    <>
      {layout === 'device' ? <SectionFourIso key={theme} light={light} />
        : layout === 'stack' ? <ToolsStack key={theme} light={light} />
        : collage ? <ToolsCollage theme={paper} />
        : layout === 'motion' ? <ToolsCollage key="motion" theme="white" motion intro={intro} />
        : <ToolsGraph key={theme} light={light} />}
      <OptionTabs
        groups={[
          { label: 'Tools layout', options: LAYOUTS, value: layout, onChange: (v) => pickLayout(v as Layout) },
          // Motion is the Collage in White with the tools' walkthroughs: no theme to pick, but its
          // intro line comes in two sizes
          ...(layout === 'motion' ? [{ label: 'Intro size', options: INTROS, value: intro, onChange: (v) => pickIntro(v as Intro) } as Group] : [(collage
            ? { label: 'Collage theme', options: PAPERS, value: paper, onChange: (v) => pickPaper(v as Paper) }
            : { label: 'Tools theme', options: THEMES, value: theme, onChange: (v) => pickTheme(v as Theme) }) as Group]),
        ]}
        selector="section.iso, section.tg, section.tk, section.tcl" label="Tools options" when={inView} dark={collage && paper === 'dark'}
      />
    </>
  );
}
