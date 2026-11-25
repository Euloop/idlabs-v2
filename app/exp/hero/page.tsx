import type { Metadata } from 'next';
import HeroVertical from '../../../components/HeroVertical';
import StartLoader from '../../../components/flow/StartLoader';
import HeroLight from '../../../components/flow/HeroLight';
import SiteChrome from '../../../components/SiteChrome';
// the fixed nav's styles (SiteChrome) — on /home-4 they come in with the later sections
import '../../../components/sections.css';
import '../../../components/flow/flow.css';
import HtmlMark from '../../../components/HtmlMark';

/* /hero: the start loader and the hero on their own, to work on them. The loader opens with the
   Identity Labs logo drawing and splitting, then the image reel, then the white lifts onto the clean
   hero (/home-4's Fade hero: no golden-ratio construction). No golden ratio in the loader either.
   The fixed nav (SiteChrome) as on /home-4. No option tabs. Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — hero',
  robots: { index: false, follow: false },
};

export default function HeroPage() {
  return (
    <>
      {/* light hero before first paint (HeroLight keeps it and clears it on leaving) */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.hero='light'" }} />
      {/* page marker: the shared /home-2 styles key off html[data-s2] (HtmlMark) */}
      <span className="s2-flow" hidden />
      <HtmlMark name="s2" />
      {/* before the hero, so it covers it from first paint */}
      <StartLoader fixed />
      <HeroVertical />
      <HeroLight />
      {/* the nav: wordmark, Manifesto, Careers — fixed, as on /home-4 */}
      <SiteChrome />
    </>
  );
}
