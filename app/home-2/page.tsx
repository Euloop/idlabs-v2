import type { Metadata } from 'next';
import Hero from '../../components/Hero';
import Section2Options from '../../components/flow/Section2Options';
import SectionThree from '../../components/SectionThree';
import ToolsOptions from '../../components/flow/ToolsOptions';
import SiteChrome from '../../components/SiteChrome';
import ServicesOptions from '../../components/flow/ServicesOptions';
import Launches from '../../components/flow/Launches';

/* /home-2: the full home page with Section 2's funnel diagram replaced by the client's pipeline
   flowchart (components/flow/), in three styles the client can switch between (line, cards,
   minimal tree; ?style=line|cards|pills). Everything else is the live page. Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — flowchart version',
  robots: { index: false, follow: false },
};

const RESEARCH_LEAD =
  'Our research lab backpropagates 500M posts/week to analyse how the algorithm treats each post as it goes through the sourcing and ranking stages. The dominant patterns that emerge fine-tune how we game ‘sourcing’ and ensure every post or launch we do goes consistently viral. Read our findings here';

export default function Home2() {
  return (
    <>
      <Hero />
      {/* One Section 2 at a time, in the style picked with the switch at the bottom (or ?style=).
          The page stays light after the hero: the dark tools and services copies are hidden. */}
      <Section2Options />
      {/* Section 2's closing line leads the research papers here. */}
      <SectionThree lead={RESEARCH_LEAD} />
      {/* Hidden: <ToolsIntro /> (its line sits under the iso device) and the dark copies
          <SectionFour />, <SectionFourIso />, <Services />. Section 3 doesn't pin here (flow.css). */}
      {/* The tools in one of two layouts (Graph · Device tabs at the bottom, ?tools=). */}
      <ToolsOptions />
      {/* Services in one of two layouts (Detail · Grid tabs at the bottom, ?services=). */}
      <ServicesOptions />
      <Launches />
      <SiteChrome />
    </>
  );
}
