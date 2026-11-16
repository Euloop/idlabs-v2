'use client';

import SectionFourIso from '../SectionFourIso';
import ToolsGraph from './ToolsGraph';
import ToolsStack from './ToolsStack';
import ToolsCollage, { type CollageTheme as Paper } from './ToolsCollage';
import ToolsShowcase, { type ShowcaseIntro } from './ToolsShowcase';
import OptionTabs, { THEMES, useOption, type Group } from './OptionTabs';

/* /home-2: the analytical tools in one of four layouts — Collage (glass card over archive scraps,
   ToolsCollage.tsx; in Gather), Stack (glass panes in a row, ToolsStack.tsx), Graph (a
   small living network) or Device (the exploded isometric device). Stack, Graph and Device come in
   light or dark (dark brings the night down while it is on screen, ThemeDriver.tsx); Collage in
   paper, paper dark or white. Motion: the Collage in White, the screenshots replaced by a
   walkthrough of each tool's UI (tool-motion/) — the default —; Motion scroll, the same played by
   the scroll instead of a cycle; its intro line at 12px or 20px (?toolsIntro=).
   Showcase: the tool names as tabs over one big walkthrough window on a soft colour field, the
   copy centred under it (ToolsShowcase.tsx).
   Bottom tabs while the section is on screen; ?tools= &toolsTheme= (&collageTheme=). */

type Layout = 'graph' | 'device' | 'stack' | 'collage' | 'motion' | 'motionScroll' | 'showcase' | 'research' | 'scatter' | 'sequence' | 'auto' | 'dither' | 'numbers';
type Theme = 'light' | 'dark';
const LAYOUTS: [Layout, string][] = [['motion', 'Motion'], ['showcase', 'Showcase'], ['motionScroll', 'Motion scroll'], ['dither', 'Motion glyphs'], ['numbers', 'Motion numbers'], ['research', 'Research live'], ['scatter', 'Research scatter'], ['sequence', 'Research sequence · scroll'], ['auto', 'Research sequence · auto (/)'], ['collage', 'Collage'], ['stack', 'Stack'], ['graph', 'Graph'], ['device', 'Device']];
type Intro = 'small' | 'large';
const INTROS: [Intro, string][] = [['small', '12px'], ['large', '20px']];
// Showcase's intro screen: the typed line we had, or the headline (?toolsLine=)
const LINES: [ShowcaseIntro, string][] = [['typed', 'Typed line'], ['headline', 'Headline']];
const PAPERS: [Paper, string][] = [['gather', 'Gather'], ['white', 'White'], ['paper', 'Paper'], ['dark', 'Paper dark']];
// From when the section's top reaches the middle of the screen until the next section comes up.
const inView = (r: DOMRect, vh: number, nextTop: number) => r.top <= vh * 0.5 && nextTop >= vh - 1;
// Showcase (its intro and tools screens): while it covers the middle
const acrossMiddle = (r: DOMRect, vh: number) => r.top <= vh * 0.5 && r.bottom >= vh * 0.5;

// `only`: a page that offers just some of the layouts (/home-4: Showcase, Motion); the first is the default
export default function ToolsOptions({ only }: { only?: Layout[] } = {}) {
  const layouts = only ? only.map((id) => LAYOUTS.find(([l]) => l === id)!) : LAYOUTS;
  const [layout, pickLayout] = useOption<Layout>('tools', layouts, layouts[0][0]);
  const [theme, pickTheme] = useOption<Theme>('toolsTheme', THEMES, 'light');
  const [paper, pickPaper] = useOption<Paper>('collageTheme', PAPERS, 'gather');
  const [intro, pickIntro] = useOption<Intro>('toolsIntro', INTROS, 'small');
  const [line, pickLine] = useOption<ShowcaseIntro>('toolsLine', LINES, 'typed');
  const light = theme === 'light';
  const collage = layout === 'collage';
  return (
    <>
      {layout === 'device' ? <SectionFourIso key={theme} light={light} />
        : layout === 'stack' ? <ToolsStack key={theme} light={light} />
        : collage ? <ToolsCollage theme={paper} />
        : layout === 'motion' ? <ToolsCollage key="motion" theme="white" motion intro={intro} />
        : layout === 'showcase' ? <ToolsShowcase intro={line} />
        : layout === 'numbers' ? <ToolsCollage key="numbers" theme="white" motion scroll dither="numbers" intro={intro} />
        : layout === 'dither' ? <ToolsCollage key="dither" theme="white" motion scroll dither intro={intro} />
        : layout === 'auto' ? <ToolsCollage key="auto" theme="white" motion scroll research="auto" intro={intro} />
        : layout === 'sequence' ? <ToolsCollage key="sequence" theme="white" motion scroll research="sequence" intro={intro} />
        : layout === 'scatter' ? <ToolsCollage key="scatter" theme="white" motion scroll research="scatter" intro={intro} />
        : layout === 'research' ? <ToolsCollage key="research" theme="white" motion scroll research intro={intro} />
        : layout === 'motionScroll' ? <ToolsCollage key="motionScroll" theme="white" motion scroll intro={intro} />
        : <ToolsGraph key={theme} light={light} />}
      <OptionTabs
        groups={[
          { label: 'Tools layout', options: layouts, value: layout, onChange: (v) => pickLayout(v as Layout) },
          // Motion is the Collage in White with the tools' walkthroughs: no theme to pick, but its
          // intro line comes in two sizes
          ...(layout === 'showcase' ? [{ label: 'Tools intro', options: LINES, value: line, onChange: (v) => pickLine(v as ShowcaseIntro) } as Group] : layout === 'motion' || layout === 'motionScroll' || layout === 'dither' || layout === 'numbers' || layout === 'research' || layout === 'scatter' || layout === 'sequence' || layout === 'auto' ? [{ label: 'Intro size', options: INTROS, value: intro, onChange: (v) => pickIntro(v as Intro) } as Group] : [(collage
            ? { label: 'Collage theme', options: PAPERS, value: paper, onChange: (v) => pickPaper(v as Paper) }
            : { label: 'Tools theme', options: THEMES, value: theme, onChange: (v) => pickTheme(v as Theme) }) as Group]),
        ]}
        selector="section.iso, section.tg, section.tk, section.tcl, section.tsc" label="Tools options" when={layout === 'showcase' ? acrossMiddle : inView} dark={collage && paper === 'dark'}
      />
    </>
  );
}
