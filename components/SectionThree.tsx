'use client';

import { useCallback, useRef } from 'react';
import ScrollText, { type ScrollTextHandle } from './ScrollText';
import { useSoftPin, type SoftPinState } from './softPin';
import './sections.css';

/* Section 3 · Research paper. Figma 130:3569 (layout, our style); the paper build and its
   hover come from the /experiment page (Figma 127:3334): each paper is a stack of two pages,
   a back page turned -1.5° and the front page with its own title and cover figures, built
   at the experiment's size and scaled to Figma's (×1.123) with the page unit.
   Hover (pointer devices): the front page lifts a little and the back page fans out.
   Soft pin (softPin.ts): the block rises in and comes to rest in the centre, holds, and
   eases back into the normal scroll. "Read our published findings" types in with the scroll
   as the block arrives (and un-types as it leaves). */

const AUTHORS = 'Jajoo R, Husain (2026)';
const LAB = 'Identity Labs Research';
const X_TITLE = 'How the X Algorithm Works: Candidate Sourcing, Ranking, & the Determinants of Reach.';
const A = '/assets/research/';

type Fig = { src: string; className: string };
type PaperProps = { title: string; figs: Fig[]; href?: string };

const PAPERS: PaperProps[] = [
  {
    title: X_TITLE,
    figs: [
      { src: `${A}front-fig-1.webp`, className: 'pp-ff1' },
      { src: `${A}front-fig-2.webp`, className: 'pp-ff2' },
      { src: `${A}front-fig-3.webp`, className: 'pp-ff3' },
    ],
  },
  {
    title: 'How the LinkedIn Algorithm Works: Two-Pass Retrieval, Multi-Objective Ranking, and the Determinants of Reach.',
    figs: [
      { src: `${A}linkedin-fig-1.webp`, className: 'pp-lf1' },
      { src: `${A}linkedin-fig-2.webp`, className: 'pp-lf2' },
      { src: `${A}linkedin-fig-3.webp`, className: 'pp-lf3' },
    ],
  },
];

function Paper({ title, figs, href = '#' }: PaperProps) {
  return (
    <a className="pp" href={href} aria-label={`${title} ${AUTHORS}, ${LAB}`}>
      <span className="pp-box" aria-hidden="true">
        {/* back page (the same under both papers) */}
        <span className="pp-page pp-back">
          <img className="pp-abs" src={`${A}paper-back.svg`} width={276.097} height={337.388} alt="" style={{ left: 0, top: 0 }} />
          <img className="pp-abs" src={`${A}grid-back.svg`} width={228.939} height={190.356} alt="" style={{ left: 31.28, top: 19.28 }} />
          <span className="pp-title">{X_TITLE}</span>
          <span className="pp-meta"><span>{AUTHORS}</span><span>{LAB}</span></span>
          <span className="pp-abs pp-fig pp-bf1"><img src={`${A}back-fig-1.webp`} alt="" /></span>
          <span className="pp-abs pp-fig pp-bf2"><img src={`${A}back-fig-2.webp`} alt="" /></span>
          <span className="pp-abs pp-fig pp-bf3"><img src={`${A}back-fig-3.webp`} alt="" /></span>
        </span>
        {/* front page */}
        <span className="pp-page pp-front">
          <img className="pp-abs" src={`${A}paper-front.svg`} width={276.097} height={337.388} alt="" style={{ left: 0.01, top: 0 }} />
          <img className="pp-abs" src={`${A}grid-front.svg`} width={228.083} height={189.497} alt="" style={{ left: 31.73, top: 19.72 }} />
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

export default function SectionThree() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<ScrollTextHandle>(null);
  const onFrame = useCallback((s: SoftPinState) => {
    const sg = (v: number, a: number, b: number) => Math.max(0, Math.min(1, (v - a) / (b - a)));
    readRef.current?.set(Math.min(sg(s.arrive, 0.45, 1), 1 - sg(s.leave, 0.1, 0.6)));
  }, []);
  useSoftPin(sectionRef, innerRef, true, onFrame);

  return (
    <section ref={sectionRef} className="s3" data-foot="/Research paper" aria-label="Research papers">
      <div className="s3-pin">
        <div className="frame s3-frame">
          <div className="s3-inner" ref={innerRef}>
            <a className="s3-read" href="#">
              <ScrollText as="span" text={'Read our\npublished findings'} />
            </a>
            <div className="s3-band">
              <div className="s3-papers">
                {PAPERS.map((p) => <Paper key={p.title} {...p} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
