'use client';

import { useRef } from 'react';
import { useSoftPin } from './softPin';

/* Section 3 · Research paper (Figma 121:1400). Two papers — the X algorithm and the LinkedIn
   algorithm (Figma 127:3334) — each a stack of two pages: a back page turned -1.5° and the
   front page with its own title and cover figures. Built at Figma size (310.25 × 347) and
   scaled with the page unit. Hover (pointer devices only): the front page lifts a little and
   the back page fans out from under it; pressing settles it slightly. No scroll reveal.
   Soft pin (softPin.ts): the papers rise in and slow smoothly to a stop in the centre, hold
   for half a screen of scroll, then ease back into the normal scroll. */

const AUTHORS = 'Jajoo R, Husain (2026)';
const LAB = 'Identity Labs Research';
const X_TITLE = 'How the X Algorithm Works: Candidate Sourcing, Ranking, & the Determinants of Reach.';

type Fig = { src: string; className: string };
type PaperProps = { title: string; figs: Fig[]; href?: string };

const X_FIGS: Fig[] = [
  { src: '/experiment/front-fig-1.webp', className: 'xp-ff1' },
  { src: '/experiment/front-fig-2.webp', className: 'xp-ff2' },
  { src: '/experiment/front-fig-3.webp', className: 'xp-ff3' },
];
const LI_FIGS: Fig[] = [
  { src: '/experiment/linkedin-fig-1.webp', className: 'xp-lf1' },
  { src: '/experiment/linkedin-fig-2.webp', className: 'xp-lf2' },
  { src: '/experiment/linkedin-fig-3.webp', className: 'xp-lf3' },
];

const PAPERS: PaperProps[] = [
  { title: X_TITLE, figs: X_FIGS },
  {
    title: 'How the LinkedIn Algorithm Works: Two-Pass Retrieval, Multi-Objective Ranking, and the Determinants of Reach.',
    figs: LI_FIGS,
  },
];

function Paper({ title, figs, href = '#' }: PaperProps) {
  return (
    <a className="xp-paper" href={href} aria-label={`${title} ${AUTHORS}, ${LAB}`}>
      <span className="xp-paper-box" aria-hidden="true">
        {/* back page (the same under both papers) */}
        <span className="xp-page xp-page-back">
          <img className="xp-abs" src="/experiment/paper-back.svg" width={276.097} height={337.388} alt="" style={{ left: 0, top: 0 }} />
          <img className="xp-abs" src="/experiment/grid-back.svg" width={228.939} height={190.356} alt="" style={{ left: 31.28, top: 19.28 }} />
          <span className="xp-paper-title">{X_TITLE}</span>
          <span className="xp-paper-meta"><span>{AUTHORS}</span><span>{LAB}</span></span>
          <span className="xp-abs xp-fig xp-bf1"><img src="/experiment/back-fig-1.webp" alt="" /></span>
          <span className="xp-abs xp-fig xp-bf2"><img src="/experiment/back-fig-2.webp" alt="" /></span>
          <span className="xp-abs xp-fig xp-bf3"><img src="/experiment/back-fig-3.webp" alt="" /></span>
        </span>
        {/* front page */}
        <span className="xp-page xp-page-front">
          <img className="xp-abs" src="/experiment/paper-front.svg" width={276.097} height={337.388} alt="" style={{ left: 0.01, top: 0 }} />
          <img className="xp-abs" src="/experiment/grid-front.svg" width={228.083} height={189.497} alt="" style={{ left: 31.73, top: 19.72 }} />
          <span className="xp-paper-title">{title}</span>
          <span className="xp-paper-meta"><span>{AUTHORS}</span><span>{LAB}</span></span>
          {figs.map((f) => (
            <span key={f.src} className={`xp-abs xp-fig ${f.className}`}><img src={f.src} alt="" /></span>
          ))}
        </span>
      </span>
    </a>
  );
}

export default function Papers() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useSoftPin(sectionRef, innerRef);
  return (
    <section ref={sectionRef} id="papers" className="xp-s3" data-softpin="" aria-label="Research paper">
      <div className="xp-s3-pin">
        <div className="xp-col xp-s3-inner" ref={innerRef}>
          <div className="xp-papers">
            {PAPERS.map((p) => <Paper key={p.title} {...p} />)}
          </div>
          <a className="xp-read" href="#">
            <span>Read our published finding</span>
          </a>
        </div>
      </div>
    </section>
  );
}
