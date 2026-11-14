import type { Metadata } from 'next';
import HeroVertical from '../../components/HeroVertical';
import StartLoader from '../../components/flow/StartLoader';
import SectionTwo from '../../components/SectionTwo';
import ResearchLab from '../../components/flow/ResearchLab';
import SectionThree from '../../components/SectionThree';
import MonoTrail from '../../components/flow/MonoTrail';
import ToolsOptions from '../../components/flow/ToolsOptions';
import ServicesCards from '../../components/flow/ServicesCards';
import LaunchesOptions from '../../components/flow/LaunchesOptions';
import SiteFooter from '../../components/flow/SiteFooter';
import SiteChrome from '../../components/SiteChrome';
import ThemeDriver from '../../components/flow/ThemeDriver';
import HeroLight from '../../components/flow/HeroLight';
import HeroIntroOptions from '../../components/flow/HeroIntroOptions';
import HeroNetwork from '../../components/flow/HeroNetwork';
// /home-2 gets this through the flowchart variants of Section 2; here only the diagram is shown
import '../../components/flow/flow.css';

/* /home-4: /home-2 with the picks made — the new light hero (HeroVertical.tsx, Figma 183:3), Section 2 Diagram, research papers with the
   Paper cover, tools Showcase or Motion (tabs, ?tools=), Services Columns (light). Tabs remain only for Launches
   (Float II · Float III · Float IV, ?launches=) and the footer's reading list (Classic · IL colours,
   ?books=). Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — home 4',
  robots: { index: false, follow: false },
  // the launch reel plays X's videos, which refuse another site's referrer (flow/launch-videos.ts)
  referrer: 'no-referrer',
};

export default function Home4() {
  return (
    <>
      {/* light hero before first paint (HeroLight keeps it and clears it on leaving) */}
      <script dangerouslySetInnerHTML={{ __html: "var d=document.documentElement;d.dataset.hero='light';d.dataset.clients=new URLSearchParams(location.search).get('clients')==='all'?'all':'picked'" }} />
      {/* page marker: the /home-2 styles key off body:has(.s2-flow) */}
      <span className="s2-flow" hidden />
      {/* the new light hero: the golden construction upright (Figma 183:3) */}
      {/* start loader (Figma 184:117–174): before the hero, so its zoom lands on it */}
      <StartLoader />
      <HeroVertical />
      <HeroLight />
      {/* loader ending + hero: Zoom (drawn hero) or Fade (clean hero), bottom tabs (?intro=) */}
      <HeroIntroOptions />
      {/* hidden with the client's 12 (Clients tab, html[data-clients='picked'], the default) */}
      {/* below the hero's clients, both variants: a bordered "Our Network" card — placeholder
          names until the client confirms a real, publishable list (see HeroNetwork.tsx) */}
      <HeroNetwork />
      <SectionTwo noOutro compact />
      <ResearchLab />
      <SectionThree lead="Read our published findings" cover="paper" holes={false} />
      <MonoTrail selector="section.s3 .s3-band" />
      {/* tools: Showcase (default) or Motion, bottom tabs (?tools=) */}
      <ToolsOptions only={['showcase', 'motion']} />
      <ServicesCards light layout="columns" />
      {/* launches: Selected (default: the client's six and See all → /launches) or Float II–IV (?launches=) */}
      <LaunchesOptions only={['selected', 'float2', 'float3', 'float4']} />
      <SiteFooter />
      <SiteChrome />
      <ThemeDriver />
    </>
  );
}
