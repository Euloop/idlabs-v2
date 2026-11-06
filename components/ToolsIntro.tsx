'use client';

import { useEffect, useRef } from 'react';
import ScrollText, { type ScrollTextHandle } from './ScrollText';
import { usePullUp } from './pullUp';
import './sections.css';

/* Section 4 part 1 · the bridge from the research to the tools. Figma 135:5393 (light) and
   135:5409 (dark). One centred line of the client's copy, typed in with the scroll like the
   other main text (faint probability under the word being written). Scrolls in normally,
   holds for a moment; ~0.35 viewport into the hold the page goes to night (SectionTwo.tsx
   drives html[data-theme]), then it scrolls on into the tools. */

const TEXT =
  'We turned this research into software, built on 2B+ data points, that weights every engagement by the engager’s influence, measures engagement velocity in real time, and maps how deep a post penetrates each niche, to forecast its reach and shelf-life within the first 30 minutes.';

export default function ToolsIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<ScrollTextHandle>(null);
  usePullUp(sectionRef, { prevContent: '.s3-band', prevPin: '.s3-pin', content: '.ti-text', pin: '.ti-pin' }, 200);

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      // types in over the last ~0.7 viewport of its arrival, done as the stage locks
      const top = sec.getBoundingClientRect().top;
      textRef.current?.set(Math.max(0, Math.min(1, (0.75 * vh - top) / (0.7 * vh))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="ti"
      data-foot="/Research paper"
      data-foot-night="/Analytical Tools"
      aria-label="From research to software"
    >
      <div className="ti-pin">
        <div className="frame ti-frame">
          <ScrollText ref={textRef} className="ti-text" text={TEXT} probs />
        </div>
      </div>
    </section>
  );
}
