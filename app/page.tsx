import type { Metadata } from 'next';
import HeroVertical from '../components/HeroVertical';
import StartLoader from '../components/flow/StartLoader';
import SectionTwo from '../components/SectionTwo';
import ResearchLab from '../components/flow/ResearchLab';
import SectionThree from '../components/SectionThree';
import MonoTrail from '../components/flow/MonoTrail';
import ToolsShowcase from '../components/flow/ToolsShowcase';
import ServicesCards from '../components/flow/ServicesCards';
import Launches from '../components/flow/Launches';
import SiteFooter from '../components/flow/SiteFooter';
import SiteChrome from '../components/SiteChrome';
import ThemeDriver from '../components/flow/ThemeDriver';
import HeroLight from '../components/flow/HeroLight';
// the diagram's styles (on /home-2 they come with the flowchart variants of Section 2)
import '../components/flow/flow.css';

/* The home page: /home-4 with its picks made and no option tabs (2026-11-14). The /hero loader and
   the clean light hero after it (StartLoader fixed: html[data-intro='fade']); the client's 12 logos,
   no "Our Network" (html[data-clients='picked']); Section 2 Diagram; research papers with the
   Paper cover; tools Showcase; Services Columns (light); Launches Selected (Float IV with the six,
   then See all → /launches); the Fibonacci footer. The previous home page is at /old-home;
   /home-4 keeps the tabs for trying variants. */

export const metadata: Metadata = {
  title: 'Identity Labs',
  description:
    'Identity Labs is a consulting firm based in San Francisco. The largest tech companies on earth rely on our algorithm research, analytics software, and deployed services to reach a billion people.',
  // the launch reel plays X's videos, which refuse another site's referrer (flow/launch-videos.ts)
  referrer: 'no-referrer',
};

export default function Home() {
  return (
    <>
      {/* light hero and the client's 12 logos, before first paint (HeroLight keeps the light and
          clears it on leaving) */}
      <script dangerouslySetInnerHTML={{ __html: "var d=document.documentElement;d.dataset.hero='light';d.dataset.clients='picked'" }} />
      {/* page marker: the shared /home-2 styles key off body:has(.s2-flow) */}
      <span className="s2-flow" hidden />
      {/* the start loader as /hero: the logo drawn and split, the reel, then the golden spirals, onto
          the clean hero (no golden construction); before the hero, so it covers it from first paint */}
      <StartLoader fixed />
      <HeroVertical />
      <HeroLight />
      <SectionTwo noOutro compact />
      <ResearchLab fixed />
      <SectionThree lead="Read our published findings" cover="paper" holes={false} />
      <MonoTrail selector="section.s3 .s3-band" />
      <ToolsShowcase />
      <ServicesCards light layout="columns" />
      <Launches variant="selected" />
      <SiteFooter layout="fib" />
      <SiteChrome />
      <ThemeDriver />
    </>
  );
}
