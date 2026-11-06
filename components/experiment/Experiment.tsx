'use client';

import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import TokenText from './TokenText';
import Logos from './Logos';
import Tools from './Tools';
import Research from './Research';
import Papers from './Papers';
import './experiment.css';

/* Landing page v2 (experiment). Figma 121:3: hero 121:1255, section 2 parts 1–3
   (121:1115, 121:976, 121:837), section 3 / research paper 121:1400.

   Layout: one 1054px column (Figma x 112–1166 in a 1280 frame). The chrome is fixed and
   shared by every section: the wordmark + section nav on the left (Figma x 111, y 303) and
   the footer labels (y 761). Only the content in the middle scrolls / pins.
   The nav indicator and the footer labels follow the section in view. */

const SECTIONS = [
  { nav: 0, foot: ['/ Intro', '/ What we do'] },
  { nav: 1, foot: ['/Algorithm Research', '/Our Tech'] },
  { nav: 1, foot: ['/Research paper', '/Our Tech'] },
  { nav: 1, foot: ['/Research paper', '/Our Tech'] },
];

const NAV = [
  { label: 'What we do', href: '#intro' },
  { label: 'Our Tech', href: '#research' },
  { label: 'Our Services', href: '#' },
  { label: 'Press', href: '#' },
  { label: 'Contact us', href: '#' },
  { label: 'Footnotes', href: '#' },
];

/* Headline lines as set in Figma; the first line is muted. */
const HEADLINE = ['Identity labs is a', 'consulting firm based', 'in San Francisco.'];

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a href={href} className="xp-roll" aria-label={label} aria-current={active ? 'true' : undefined}>
      <span className="xp-roll-track" aria-hidden="true">
        <span>{label}</span>
        <span>{label}</span>
      </span>
    </a>
  );
}

export default function Experiment() {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState(0);

  // Section in view = the last one whose top has passed the middle of the screen.
  useEffect(() => {
    const els = ['intro', 'research', 'papers', 'tools'].map((id) => document.getElementById(id));
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let a = 0;
      // soft-pinned sections start one viewport before their content arrives
      els.forEach((el, i) => {
        if (!el) return;
        const top = el.getBoundingClientRect().top + ('softpin' in el.dataset ? window.innerHeight : 0);
        if (top < mid) a = i;
      });
      setActive(a);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    setReady(true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Indicator sits on the active nav item.
  const navIndex = SECTIONS[active].nav;
  useEffect(() => {
    const place = () => {
      const item = navRef.current?.children[navIndex] as HTMLElement | undefined;
      if (item) setIndicator(item.offsetTop);
    };
    place();
    document.fonts?.ready.then(place);
  }, [navIndex]);

  const [footL, footR] = SECTIONS[active].foot;

  return (
    <div className="xp">
      {/* Fixed chrome, shared by every section. */}
      <div className="xp-chrome">
        <div className="xp-col">
          <aside className="xp-side">
            <a className="xp-wordmark" href="#intro" aria-label="Identity Labs home">
              <img src="/experiment/wordmark.svg" width={103} height={23} alt="" />
            </a>
            <nav className="xp-nav" aria-label="Sections">
              <span className="xp-track" aria-hidden="true">
                <span className="xp-thumb" style={{ transform: `translateY(${indicator}px)` }} />
              </span>
              <div className="xp-links" ref={navRef}>
                {NAV.map((n, i) => (
                  <NavLink key={n.label} href={n.href} label={n.label} active={i === navIndex} />
                ))}
              </div>
            </nav>
          </aside>
          {/* Footer labels: hidden for now (kept so they can come back). */}
          <footer className="xp-foot" hidden>
            <TokenText as="span" text={footL} show={ready} delay={500} fade />
            <TokenText as="span" text={footR} show={ready} delay={560} fade />
          </footer>
        </div>
      </div>

      {/* Hero (Figma 121:1255) */}
      <section className="xp-hero" id="intro" aria-label="Intro">
        <div className="xp-col">
          <div className="xp-hero-copy">
            <h1 className="xp-headline" aria-label={HEADLINE.join(' ')}>
              {HEADLINE.map((line, l) => (
                <span key={l} className={l === 0 ? 'xp-line xp-line-muted' : 'xp-line'} aria-hidden="true">
                  {line.split(' ').map((w, i, arr) => (
                    <Fragment key={i}>
                      <span className="xp-w">
                        <span className="xp-wi" style={delay(300 + (l * 3 + i) * 45)}>{w}</span>
                      </span>
                      {i < arr.length - 1 ? ' ' : null}
                    </Fragment>
                  ))}
                </span>
              ))}
            </h1>
            <div className="xp-body">
              <p>
                The largest tech companies on earth rely on our algorithm research, analytics software, and deployed
                services to reach a billion people.
              </p>
              <div>
                <p>We do three things:</p>
                <ul>
                  <li>
                    Algorithm research on the largest weighted engagement datasets (1T+ views) to reverse engineer X and
                    LI algorithms and predictably go viral
                  </li>
                  <li>
                    Build analytics software that can model acceleration/<wbr />decay of engagement and can predict if
                    something will cross 1M views in the first 30 minutes, account-level audience identification, etc.
                  </li>
                  <li>
                    Forward deploy our Creative + Growth team within our clients&apos; orgs to run the biggest product
                    launches and scale company brand.
                  </li>
                </ul>
              </div>
              <p>
                In the last 2 years, $1T was spent on paid marketing on Meta and Google. Paid reach is getting more
                expensive with diminishing returns. Companies now need organic distribution faster than we can hire and
                build systems to provide it. Identity Labs has grown 7x in revenue to $20M ARR because of this demand.
              </p>
            </div>
          </div>
          {/* Client logos: below the fold, rise in when scrolled to. */}
          <Logos />
        </div>
      </section>

      {/* Section 2 · Algorithm research (Figma 121:1115, 121:976, 121:837) — pinned */}
      <Research />

      {/* Section 3 · Research paper (Figma 121:1400) */}
      <Papers />

      {/* Section 4 · Our tech (Figma 124:2558) */}
      <Tools />
    </div>
  );
}
