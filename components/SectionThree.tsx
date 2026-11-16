'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import ScrollText, { type ScrollTextHandle } from './ScrollText';
import PaperPage from './immersive/PaperPage';
import { PAPER_TEXT } from './immersive/paperText';
import './sections.css';

/* Section 3 · Research paper. Figma 130:3569 (layout, our style); the paper build and its
   hover come from the /experiment page (Figma 127:3334): each paper is a stack of two pages,
   a back page turned -1.5° and the front page with its own title and cover figures, built
   at the experiment's size and scaled to Figma's (×1.123) with the page unit.
   Hover (pointer devices): the front page lifts a little and the back page fans out.
   Normal scroll: Section 2's part 3 scrolls away and this section follows at scroll speed;
   its stage holds once it reaches the top, then scrolls on. Always light. "Read our published findings" types in with the scroll
   as the block arrives (and un-types going back). */

const AUTHORS = 'Jajoo R, Husain (2026)';
const LAB = 'Identity Labs Research';
const X_TITLE = 'How the X Algorithm Works: Candidate Sourcing, Ranking, & the Determinants of Reach.';
const A = '/assets/research/';

type Fig = { src: string; className: string };
type PaperProps = { title: string; figs: Fig[]; href?: string };

export const PAPERS: PaperProps[] = [
  {
    title: X_TITLE,
    href: 'https://assets.ctfassets.net/xsgwjwcuxltx/2D7hwss9WnXBNLD3T8e7mK/8a276a95b9f7b0f2f1c0d1d6b14b450e/How_the_X_Algorithm_Works_2026.pdf',
    figs: [
      { src: `${A}front-fig-1.webp`, className: 'pp-ff1' },
      { src: `${A}front-fig-2.webp`, className: 'pp-ff2' },
      { src: `${A}front-fig-3.webp`, className: 'pp-ff3' },
    ],
  },
  {
    title: 'How the LinkedIn Algorithm Works: Two-Pass Retrieval, Multi-Objective Ranking, and the Determinants of Reach.',
    href: 'https://assets.ctfassets.net/xsgwjwcuxltx/7ydGxl5W28i2QZued6Z4N7/3ef2f08644ca45b23820e3b6aa6bc9ca/How_the_LinkedIn_Algorithm_Works_2026.pdf',
    figs: [
      { src: `${A}linkedin-fig-1.webp`, className: 'pp-lf1' },
      { src: `${A}linkedin-fig-2.webp`, className: 'pp-lf2' },
      { src: `${A}linkedin-fig-3.webp`, className: 'pp-lf3' },
    ],
  },
];

/* cover "paper" (/home-2's Paper tab): the paper's real first page (immersive/PaperPage.tsx) as
   the front page, at US Letter proportions and punched like the site's front page (the black
   behind it shows through the holes), over the site's textured back page. */
export function PaperCover({ title, figs, href = '#', index, holes = true }: PaperProps & { index: number; holes?: boolean }) {
  return (
    <a className="pp pp-letter" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${title} ${AUTHORS}, ${LAB} (PDF, opens in a new tab)`}>
      <span className="pp-box" aria-hidden="true">
        <span className="pp-page pp-back">
          <img className="pp-abs" src={`${A}paper-back.svg`} alt="" style={{ '--iw': 276.097, '--ih': 357.3, '--il': 0, '--it': 0 } as CSSProperties} />
        </span>
        <span className="pp-page pp-front">
          <PaperPage paper={PAPER_TEXT[index]} fig={figs[0].src} stack={false} holes={holes} />
        </span>
      </span>
    </a>
  );
}

export type Cover = 'site' | 'paper';

export function Paper({ title, figs, href = '#' }: PaperProps) {
  return (
    <a className="pp" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${title} ${AUTHORS}, ${LAB} (PDF, opens in a new tab)`}>
      <span className="pp-box" aria-hidden="true">
        {/* back page (the same under both papers) */}
        <span className="pp-page pp-back">
          <img className="pp-abs" src={`${A}paper-back.svg`} alt="" style={{ '--iw': 276.097, '--ih': 337.388, '--il': 0, '--it': 0 } as CSSProperties} />
          <img className="pp-abs" src={`${A}grid-back.svg`} alt="" style={{ '--iw': 228.939, '--ih': 190.356, '--il': 31.28, '--it': 19.28 } as CSSProperties} />
          <span className="pp-title">{X_TITLE}</span>
          <span className="pp-meta"><span>{AUTHORS}</span><span>{LAB}</span></span>
          <span className="pp-abs pp-fig pp-bf1"><img src={`${A}back-fig-1.webp`} alt="" /></span>
          <span className="pp-abs pp-fig pp-bf2"><img src={`${A}back-fig-2.webp`} alt="" /></span>
          <span className="pp-abs pp-fig pp-bf3"><img src={`${A}back-fig-3.webp`} alt="" /></span>
        </span>
        {/* front page */}
        <span className="pp-page pp-front">
          <img className="pp-abs" src={`${A}paper-front.svg`} alt="" style={{ '--iw': 276.097, '--ih': 337.388, '--il': 0.01, '--it': 0 } as CSSProperties} />
          <img className="pp-abs" src={`${A}grid-front.svg`} alt="" style={{ '--iw': 228.083, '--ih': 189.497, '--il': 31.73, '--it': 19.72 } as CSSProperties} />
          <span className="pp-title">{title}</span>
          <span className="pp-meta"><span>{AUTHORS}</span><span>{LAB}</span></span>
          {figs.map((f) => (
            <span key={f.src} className={`pp-abs pp-fig ${f.className}`}><img src={f.src} alt="" /></span>
          ))}
        </span>
      </span>
    </a>
  );
}

/* lead: replaces "Read our published findings" with a paragraph (on /home-2, Section 2's part 3
   line moves here); it types in the same way. */
// holes: the Paper cover's punched holes (on by default; /home-4 turns them off)
export default function SectionThree({ lead, cover = 'site', holes = true }: { lead?: string; cover?: Cover; holes?: boolean } = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const readRef = useRef<ScrollTextHandle>(null);
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const leadEl = sec.querySelector<HTMLElement>('.s3-lead');
      if (leadEl) {
        // The lead is simply there, written in full (feedback 2026-11-16: no typing — it started before the
        // research text above had moved)
        readRef.current?.set(1);
        return;
      }
      const arrive = Math.max(0, Math.min(1, 1 - sec.getBoundingClientRect().top / vh));
      readRef.current?.set(Math.max(0, Math.min(1, (arrive - 0.45) / 0.55)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // The stage's height, for /home-2's short hold (flow.css: where it pins, how tall the section is).
    const pin = sec.querySelector<HTMLElement>('.s3-pin');
    const ro = new ResizeObserver(() => { if (pin) sec.style.setProperty('--s3-h', `${pin.offsetHeight}px`); });
    if (pin) ro.observe(pin);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <section ref={sectionRef} className="s3" data-foot="/Research paper" aria-label="Research papers">
      <div className="s3-pin">
        <div className="frame s3-frame">
          <div className="s3-inner">
            {lead ? (
              <ScrollText ref={readRef} as="p" className="s3-lead" text={lead} />
            ) : (
              <a className="s3-read" href="#">
                <ScrollText ref={readRef} as="span" text={'Read our\npublished findings'} />
              </a>
            )}
            <div className="s3-band">
              <div className="s3-papers">
                {PAPERS.map((p, i) => cover === 'paper' ? <PaperCover key={p.title} {...p} index={i} holes={holes} /> : <Paper key={p.title} {...p} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
