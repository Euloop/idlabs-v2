import type { Metadata } from 'next';
import SiteChrome from '../../components/SiteChrome';
import SiteFooter from '../../components/flow/SiteFooter';
import HtmlMark from '../../components/HtmlMark';
import type { ReactNode } from 'react';
import { ABOUT_INTRO, ABOUT_JSON_LD, ABOUT_PARAS, FOUNDERS } from '../../components/about/content';
import { SITE_URL, ldJson } from '../../components/seo';
import '../../components/sections.css';
import '../../components/flow/flow.css';
import '../../components/legal/legal.css';

/* /about (2026-11-17): the founders' public details, to corroborate them for search. A first version in
   the legal pages' style (LegalPage.tsx: the white page, rails, a 512px column, Season Mix titles, mono
   body); the design comes later. The schema.org graph goes out as one JSON-LD script. */

const DESCRIPTION =
  "Identity Labs is a growth consulting firm that helps the world's largest technology companies build predictable organic distribution. Founded in March 2022, led by co-founders Ruchir Jajoo and Vedika Bhaia.";

export const metadata: Metadata = {
  title: 'About | Identity Labs',
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: { title: 'About | Identity Labs', description: DESCRIPTION, url: '/about' },
};


// the founders' full names in the copy, linked to their own sites
function linkNames(text: string): ReactNode[] {
  const re = new RegExp(`(${FOUNDERS.map((f) => f.name).join('|')})`);
  return text.split(re).map((part, i) => {
    const f = FOUNDERS.find((x) => x.name === part);
    return f ? <a key={i} href={f.url} target="_blank" rel="noopener">{part}</a> : part;
  });
}

export default function About() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ABOUT_JSON_LD) }} />
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='light'" }} />
      <span className="s2-flow" hidden />
      <HtmlMark name="s2" />
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-dark"><div className="texture" /></div>
        <div className="backdrop-light" />
      </div>
      <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>
      <div className="frame lg-ticks" aria-hidden="true">
        <div className="site-header"><span className="tick tick-l" /><span className="tick tick-r" /></div>
      </div>
      <div className="frame lg-veil" aria-hidden="true" />
      <main className="lg">
        <header className="lg-head">
          <h1 className="lg-title">
            <span>About</span>
            <span className="lg-title-pale">Identity Labs</span>
          </h1>
          <p className="lg-meta">{ABOUT_INTRO}</p>
        </header>
        <div className="lg-sections">
          <section className="lg-section">
            {ABOUT_PARAS.map((p, i) => <p key={i}>{i === 0 ? linkNames(p) : p}</p>)}
          </section>
          <section className="lg-section">
            <h2 className="lg-h">Founders</h2>
            {FOUNDERS.map((f) => (
              <p key={f.name}><a href={f.url} target="_blank" rel="noopener">{f.name}</a>, {f.role}</p>
            ))}
          </section>
        </div>
      </main>
      <SiteFooter layout="fib" />
      <SiteChrome />
    </>
  );
}
