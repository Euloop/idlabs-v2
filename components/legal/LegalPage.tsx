import type { ReactNode } from 'react';
import SiteChrome from '../SiteChrome';
import SiteFooter from '../flow/SiteFooter';
import type { LegalDoc } from './content';
import '../sections.css';
import '../flow/flow.css';
import './legal.css';

/* /privacy and /terms in the clean hero's style (HeroVertical, Fade): the white page between the
   hero's rails, the fixed wordmark and nav, a 512px column — the title in the hero's headline face
   with its first line pale, the section titles in that face too, everything else IBM Plex Mono at 12px
   in the hero's body caps (email addresses as written). No bold anywhere. */

// email addresses in the text become mail links
const EMAIL = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
function linkify(text: string): ReactNode[] {
  return text.split(EMAIL).map((part, i) => (i % 2 ? <a key={i} href={`mailto:${part}`}>{part}</a> : part));
}

// section titles are capitals on the live site; in the headline face they read in sentence case, as the
// hero's headline does (proper nouns kept)
const sentence = (t: string) => {
  const s = t.toLowerCase().replace(/\bindia\b/g, 'India');
  return s.charAt(0).toUpperCase() + s.slice(1);
};


export default function LegalPage({ doc }: { doc: LegalDoc; kind: 'privacy' | 'terms' }) {
  // "LAST UPDATED 27 AUGUST 2026 — IDENTITY LABS" → the date alone (the title above already names us)
  const updated = doc.updated.replace(/\s*—\s*IDENTITY LABS\s*$/i, '');
  return (
    <>
      {/* a light page from the start, as /launches: the site's backdrop and its frame rules (rails), so
          the rules sit where the nav and the footer expect them at every frame width */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='light'" }} />
      {/* page marker: the fixed chrome's light-page styles key off body:has(.s2-flow) */}
      <span className="s2-flow" hidden />
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-dark"><div className="texture" /></div>
        <div className="backdrop-light" />
      </div>
      <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>
      {/* the hero's markers: the squares on the rules at the header's base, scrolling with the page */}
      <div className="frame lg-ticks" aria-hidden="true">
        <div className="site-header"><span className="tick tick-l" /><span className="tick tick-r" /></div>
      </div>
      {/* white behind the fixed header, so the text scrolls away under it, not through it */}
      <div className="frame lg-veil" aria-hidden="true" />
      <main className="lg">
        <header className="lg-head">
          <h1 className="lg-title">
            <span className="lg-title-pale">Identity Labs</span>
            <span>{doc.title}</span>
          </h1>
          <p className="lg-meta">{updated}</p>
        </header>
        <ol className="lg-sections">
          {doc.sections.map((s) => (
            <li className="lg-section" key={s.n} id={`section-${s.n}`}>
              <h2 className="lg-h">
                <span className="lg-n">{String(s.n).padStart(2, '0')}</span>
                {sentence(s.title)}
              </h2>
              {s.paras.map((p, i) => <p key={i}>{linkify(p)}</p>)}
            </li>
          ))}
        </ol>
      </main>
      {/* the Fibonacci footer, as the live pages (no tabs); it carries the legal links */}
      <SiteFooter layout="fib" />
      <SiteChrome />
    </>
  );
}
