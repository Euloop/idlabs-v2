import { Fragment, type CSSProperties } from 'react';
import ClientLogos from '../components/ClientLogos';
import SectionTwo from '../components/SectionTwo';
import SectionThree from '../components/SectionThree';
import ToolsIntro from '../components/ToolsIntro';
import SectionFour from '../components/SectionFour';
import SiteChrome from '../components/SiteChrome';

/* Identity Labs hero — Figma "Zoomcast" 109:897 / frame 109:715.

   Layout system (from the design):
   • .frame    — 1056px column bounded by the two vertical rules, 24px inner padding.
   • .golden   — the golden-ratio construction filling the column (1006 × 592).
                 Columns split 384 : 622 (≈ 0.382 : 0.618); the small column's
                 rows split 366 : 226 (again 0.618 : 0.382).
   • Text lives inside the squares: headline in the small square,
     body copy in the large square. On narrow screens the construction
     turns vertical so the squares stay square instead of stretching. */

const HEADLINE = 'Identity labs is a consulting firm based in San\u00a0Francisco.';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

function Ticks() {
  return (
    <>
      <span className="tick tick-l" aria-hidden="true" />
      <span className="tick tick-r" aria-hidden="true" />
    </>
  );
}

export default function Home() {
  const words = HEADLINE.split(' ');

  return (
    <>
    {/* Fixed page material: dark paper, with the light page wiped over it on the theme switch. */}
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-dark"><div className="texture" /></div>
      <div className="backdrop-light" />
    </div>
    <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>

    <div className="hero">

      <div className="frame">
        <header className="site-header">
          {/* Wordmark and nav are the fixed header in SiteChrome.tsx, on screen everywhere. */}
          <Ticks />
        </header>

        <main className="golden">
          {/* Construction artwork (Figma 109:716), revealed outward from the spiral's eye. */}
          <div className="spiral-box" aria-hidden="true">
            <img className="spiral" src="/assets/golden-icon.svg" width={1006.88} height={592.795} alt="" />
          </div>

          <div className="cell cell-small">
            <h1 className="headline" aria-label={HEADLINE}>
              {words.map((w, i) => (
                <Fragment key={i}>
                  <span className="w" aria-hidden="true">
                    <span className="wi" style={delay(380 + i * 45)}>{w}</span>
                  </span>
                  {i < words.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </h1>
          </div>

          <div className="cell cell-large">
            <div className="body-copy">
              <p className="rise" style={delay(760)}>
                The largest tech companies on earth rely on our algorithm research, analytics software, and deployed
                services to reach a billion people.
              </p>
              <div>
                <p className="rise" style={delay(840)}>We do three things:</p>
                <ul>
                  <li className="rise" style={delay(920)}>
                    Algorithm research on the largest weighted engagement datasets (1T+ views) to reverse engineer X and
                    LI algorithms and predictably go viral
                  </li>
                  <li className="rise" style={delay(990)}>
                    Build analytics software that can model acceleration/<wbr />decay of engagement and can predict if
                    something will cross 1M views in the first 30 minutes, account-level audience identification, etc.
                  </li>
                  <li className="rise" style={delay(1060)}>
                    Forward deploy our Creative + Growth team within our clients&apos; orgs to run the biggest product
                    launches and scale company brand.
                  </li>
                </ul>
              </div>
              <p className="rise" style={delay(1140)}>
                In the last 2 years, $1T was spent on paid marketing on Meta and Google. Paid reach is getting more
                expensive with diminishing returns. Companies now need organic distribution faster than we can hire and
                build systems to provide it. Identity Labs has grown 7x in revenue to $20M ARR because of this demand.
              </p>
            </div>
          </div>

          <Ticks />
        </main>

        <ClientLogos />
      </div>
    </div>

    <SectionTwo />
    <SectionThree />
    <ToolsIntro />
    <SectionFour />
    <SiteChrome />
    </>
  );
}
