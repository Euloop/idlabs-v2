import type { Metadata } from 'next';
import HeroVertical from '../../components/HeroVertical';
import HeroLight from '../../components/flow/HeroLight';
import SiteFooter from '../../components/flow/SiteFooter';
import SiteChrome from '../../components/SiteChrome';
// the fixed nav's styles (SiteChrome) — on /home-4 they come in with the later sections
import '../../components/sections.css';
import '../../components/flow/flow.css';
import HtmlMark from '../../components/HtmlMark';

/* /footer: to work on the footer. The Fade hero (the clean hero, no golden-ratio construction) with
   no start loader, and the footer straight below it, with its golden-ratio variants in place of the reading list
   (SiteFooter golden: Spiral · Compound · Focus · Reel · Trace · Reading list, bottom tabs, ?golden=) —
   and Fibonacci (/), the footer / has (?golden=fib).
   The fixed nav (SiteChrome) as on /home-4. Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — footer',
  robots: { index: false, follow: false },
};

export default function FooterPage() {
  return (
    <>
      {/* light hero, and the Fade hero (html[data-intro], which StartLoader's script sets elsewhere),
          before first paint (HeroLight keeps the light and clears it on leaving) */}
      <script dangerouslySetInnerHTML={{ __html: "var d=document.documentElement;d.dataset.hero='light';d.dataset.intro='fade'" }} />
      {/* page marker: the shared /home-2 styles key off html[data-s2] (HtmlMark) */}
      <span className="s2-flow" hidden />
      <HtmlMark name="s2" />
      <HeroVertical />
      <HeroLight />
      <SiteFooter golden />
      {/* the nav: wordmark, Manifesto, Careers — fixed, as on /home-4 */}
      <SiteChrome />
    </>
  );
}
