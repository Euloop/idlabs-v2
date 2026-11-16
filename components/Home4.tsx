import HeroVertical from './HeroVertical';
import StartLoader from './flow/StartLoader';
import SectionTwo from './SectionTwo';
import ResearchLab from './flow/ResearchLab';
import SectionThree from './SectionThree';
import MonoTrail from './flow/MonoTrail';
import ToolsOptions from './flow/ToolsOptions';
import ServicesCards from './flow/ServicesCards';
import LaunchesOptions from './flow/LaunchesOptions';
import SiteFooter from './flow/SiteFooter';
import SiteChrome from './SiteChrome';
import ThemeDriver from './flow/ThemeDriver';
import HeroLight from './flow/HeroLight';
import HeroIntroOptions from './flow/HeroIntroOptions';
import HeroNetwork from './flow/HeroNetwork';
// /home-2 gets this through the flowchart variants of Section 2; here only the diagram is shown
import './flow/flow.css';
import HtmlMark from './HtmlMark';

/* /home-4 and /home-4/classic (the page's body; the routes add their metadata). /home-4: /home-2 with the picks made — the new light hero (HeroVertical.tsx, Figma 183:3), Section 2 Diagram, research papers with the
   Paper cover, tools Showcase or Motion scroll (tabs, ?tools=), Services Columns (light). Tabs remain only for Launches
   (Float II · Float III · Float IV, ?launches=) and the footer's reading list (Classic · IL colours,
   ?books=). Not linked from the site.
   The loader: `new`, today's (/hero's: the logo, the reel, the golden spirals, onto the clean hero),
   or `classic`, the one before it, which ends in the Zoom (the drawn hero) or the Fade (the clean hero),
   ?intro= — /home-4/classic. The Loader tab (HeroIntroOptions) moves between them. */

export default function Home4({ loader = 'new' }: { loader?: 'new' | 'classic' }) {
  return (
    <>
      {/* light hero before first paint (HeroLight keeps it and clears it on leaving) */}
      <script dangerouslySetInnerHTML={{ __html: "var d=document.documentElement;d.dataset.hero='light';d.dataset.clients=new URLSearchParams(location.search).get('clients')==='all'?'all':'picked'" }} />
      {/* page marker: the /home-2 styles key off html[data-s2] (HtmlMark) */}
      <span className="s2-flow" hidden />
      <HtmlMark name="s2" />
      {/* the new light hero: the golden construction upright (Figma 183:3) */}
      {/* start loader (Figma 184:117–174): before the hero, so its zoom lands on it */}
      {/* the start loader as /hero: the logo drawn and split, the reel of people and papers, then the
          golden spirals, onto the clean hero (no golden construction) */}
      {loader === 'new' ? <StartLoader fixed choice /> : <StartLoader />}
      <HeroVertical />
      <HeroLight />
      {/* loader ending + hero: Zoom (drawn hero) or Fade (clean hero), bottom tabs (?intro=) */}
      <HeroIntroOptions loader={loader} />
      {/* hidden with the client's 12 (Clients tab, html[data-clients='picked'], the default) */}
      {/* below the hero's clients, both variants: a bordered "Our Network" card — placeholder
          names until the client confirms a real, publishable list (see HeroNetwork.tsx) */}
      <HeroNetwork />
      <SectionTwo noOutro compact />
      <ResearchLab />
      <SectionThree lead="Read our published findings" cover="paper" holes={false} />
      <MonoTrail selector="section.s3 .s3-band" />
      {/* tools: Research sequence · auto (default, as /, since 2026-11-16); Showcase; Motion scroll (the scroll moves through the tools, as /); Motion glyphs (that over the new collage, in small moving letters and numbers, no build); Motion numbers (the same in flowing digits); Research live (research typing in, then the glass card); Research scatter (the same loose, print-style); Research sequence · scroll (the scatter's pieces one by one by the scroll, then all) and · auto (the same playing itself once started) — bottom tabs (?tools=) */}
      <ToolsOptions only={['auto', 'showcase', 'motionScroll', 'dither', 'numbers', 'research', 'scatter', 'sequence']} />
      <ServicesCards light layout="columns" still />
      {/* launches: Selected (default: the client's six and See all → /launches) or Float II–IV (?launches=) */}
      <LaunchesOptions only={['selected', 'float2', 'float3', 'float4']} words={['Our trajectory', 'changing launches']} />
      {/* footer: Fibonacci (default, Figma Zoomcast 200:4) or the reading list, bottom tabs (?footer=) */}
      {/* every footer variant, as /footer (bottom tabs, ?golden=): Spiral · Compound · Focus · Reel · Trace ·
          Reading list · Fibonacci (/) · Fibonacci + Focus — opening on Fibonacci, the footer / has */}
      <SiteFooter golden start="fib-low" />
      <SiteChrome />
      <ThemeDriver />
    </>
  );
}
