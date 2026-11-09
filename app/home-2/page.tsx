import type { Metadata } from 'next';
import Hero from '../../components/Hero';
import SectionTwoFlow from '../../components/SectionTwoFlow';
import SectionThree from '../../components/SectionThree';
import ToolsIntro from '../../components/ToolsIntro';
import SectionFour from '../../components/SectionFour';
import SectionFourIso from '../../components/SectionFourIso';
import SiteChrome from '../../components/SiteChrome';
import Services from '../../components/Services';

/* /home-2: the full home page with Section 2's funnel diagram replaced by the client's pipeline
   flowchart (components/flow/), shown in three styles for the client to choose from (line, cards,
   minimal tree). Everything else is the live page. Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — flowchart version',
  robots: { index: false, follow: false },
};

export default function Home2() {
  return (
    <>
      <Hero />
      <SectionTwoFlow />
      {/* Style option B: the same section with the pipeline as node-editor cards. */}
      <SectionTwoFlow variant="cards" follow />
      {/* Style option C: minimal tree — pills on a hairline spine, notes as branches. */}
      <SectionTwoFlow variant="pills" follow />
      <SectionThree />
      <ToolsIntro />
      <SectionFour />
      {/* Section 4 option B: the tools as an exploded isometric stack. */}
      <SectionFourIso />
      {/* The same, on the light page. */}
      <SectionFourIso light />
      <Services />
      {/* The same section on the light page, for the client to compare. */}
      <Services light />
      <SiteChrome />
    </>
  );
}
