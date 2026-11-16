import type { Metadata } from 'next';
import LaunchesGridPage from '../../components/flow/LaunchesPage';
import SiteFooter from '../../components/flow/SiteFooter';
import SiteChrome from '../../components/SiteChrome';
import '../../components/sections.css';
import '../../components/flow/flow.css';
import HtmlMark from '../../components/HtmlMark';

/* /launches-2: a variant of /launches (2026-11-16) — the launches grid over the whole screen (drag to look
   around); a tile opens its launch in the video dialog (LaunchesPage). Light page from the start (no hero),
   the fixed nav and the Fibonacci footer, as on /. Not linked from the site. */

export const metadata: Metadata = {
  title: 'Launches 2 — Identity Labs',
  robots: { index: false, follow: false },
  description: 'Every launch Identity Labs has done for its clients: 2B+ views on X.',
  // the cards play X's videos on hover, which refuse another site's referrer (flow/launch-videos.ts)
  referrer: 'no-referrer',
};

export default function Launches2Page() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='light'" }} />
      <span className="s2-flow" hidden />
      <HtmlMark name="s2" />
      {/* html[data-lcp]: this page (its dashed margin lines, launches-float.css) */}
      <HtmlMark name="lcp" />
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-dark"><div className="texture" /></div>
        <div className="backdrop-light" />
      </div>
      <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>
      <main>
        <section className="lc lcp" data-variant="grid-page" data-foot="/Launches" aria-labelledby="lc-title"><LaunchesGridPage /></section>
      </main>
      <SiteFooter layout="fib" />
      <SiteChrome />
    </>
  );
}
