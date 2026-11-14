import type { Metadata } from 'next';
import LaunchesAll from '../../components/flow/LaunchesSelected';
import SiteFooter from '../../components/flow/SiteFooter';
import SiteChrome from '../../components/SiteChrome';
import '../../components/sections.css';
import '../../components/flow/flow.css';

/* /launches: every launch, as the cards of Launches "Selected" (/home-4's See all button). Light page
   from the start (no hero), the fixed nav and the footer. */

export const metadata: Metadata = {
  title: 'Identity Labs — launches',
  robots: { index: false, follow: false },
  // the cards play X's videos on hover, which refuse another site's referrer (flow/launch-videos.ts)
  referrer: 'no-referrer',
};

export default function LaunchesPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='light'" }} />
      <span className="s2-flow" hidden />
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-dark"><div className="texture" /></div>
        <div className="backdrop-light" />
      </div>
      <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>
      <main>
        <section className="lc" data-variant="all" data-foot="/Launches" aria-labelledby="lc-title"><LaunchesAll /></section>
      </main>
      <SiteFooter />
      <SiteChrome />
    </>
  );
}
