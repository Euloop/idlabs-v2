import type { Metadata } from 'next';
import Hero from '../../components/Hero';
import Section2Options from '../../components/flow/Section2Options';
import ResearchOptions from '../../components/flow/ResearchOptions';
import ResearchLab from '../../components/flow/ResearchLab';
import ToolsOptions from '../../components/flow/ToolsOptions';
import SiteChrome from '../../components/SiteChrome';
import ServicesOptions from '../../components/flow/ServicesOptions';
import LaunchesOptions from '../../components/flow/LaunchesOptions';
import ThemeDriver from '../../components/flow/ThemeDriver';
import HeroOptions from '../../components/flow/HeroOptions';
import SiteFooter from '../../components/flow/SiteFooter';

/* /home-2: the full home page with Section 2's funnel diagram replaced by the client's pipeline
   flowchart (components/flow/), in three styles the client can switch between (line, cards,
   minimal tree; ?style=line|cards|pills). Everything else is the live page. Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — flowchart version',
  robots: { index: false, follow: false },
  // the launch reel plays its videos straight from X's video server, which refuses another site's
  // referrer (components/flow/launch-videos.ts)
  referrer: 'no-referrer',
};

export default function Home2() {
  return (
    <>
      {/* page marker: the /home-2 styles key off body:has(.s2-flow), whichever Section 2 is shown */}
      <span className="s2-flow" hidden />
      <Hero />
      {/* The hero dark (as live) or light (Dark · Light tabs at the bottom, ?hero=). */}
      <HeroOptions />
      {/* One Section 2 at a time, in the style picked with the switch at the bottom (or ?style=).
          The page stays light after the hero: the dark tools and services copies are hidden. */}
      <Section2Options />
      {/* The research lab's line on its own screen (typed in, "500M posts/week" highlighted). */}
      <ResearchLab />
      {/* The papers under "Read our published findings"; Paper · Site cover tabs at the bottom
          (?research=). */}
      <ResearchOptions lead="Read our published findings" />
      {/* Hidden: <ToolsIntro /> (its line sits under the iso device) and the dark copies
          <SectionFour />, <SectionFourIso />, <Services />. Section 3 doesn't pin here (flow.css). */}
      {/* The tools in one of two layouts (Graph · Device tabs at the bottom, ?tools=). */}
      <ToolsOptions />
      {/* Services in one of two layouts (Detail · Grid tabs at the bottom, ?services=). */}
      <ServicesOptions />
      {/* Launches as the cloud or the simple video box (Cloud · Box tabs at the bottom, ?launches=). */}
      <LaunchesOptions />
      {/* Footer: links, the reading list shelf, closing bar; dark (brings the night theme in). */}
      <SiteFooter />
      <SiteChrome />
      <ThemeDriver />
    </>
  );
}
