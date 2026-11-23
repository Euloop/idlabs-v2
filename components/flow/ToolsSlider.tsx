'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { TOOLS, LOOPS } from './ToolsCollage';
import { Landscape } from './tool-motion/shared';
import './tools-slider.css';

/* The analytical tools on phones (≤559px, client 2026-11-23), in place of the Collage card (ToolsCollage,
   hidden there: tools-slider.css). A row of 3:4 cards, the next one peeking in at the right: one tool a card —
   its walkthrough as on desktop (the landscape drawing), its name, its copy as one paragraph and "Try it →".
   Scroll-driven (client, 2026-11-23: "scrolling there will swipe the cards"): the section pins to the screen
   while the page scrolls on, and the scroll moves the row across, one card per stretch, each card holding still
   at the start and end of its stretch (so it rests, and its walkthrough plays) and sliding between. The pills
   show where you are and take you to a card (the page scrolls to its place). */

const N = TOOLS.length;

// one card and the gap after it (the cards are narrower than the track: the next one peeks in)
const stride = (t: HTMLElement) => {
  const [a, b] = t.children as unknown as HTMLElement[];
  return b ? b.offsetLeft - a.offsetLeft : t.clientWidth;
};

// within a card's stretch: still for the first and last 22%, an eased slide between
const HOLD = 0.22;
const ease = (f: number) => {
  const x = Math.min(1, Math.max(0, (f - HOLD) / (1 - 2 * HOLD)));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

export default function ToolsSlider() {
  const ref = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  /* two looks (client, 2026-11-23): light (the default) and dark (the cards dark, their walkthroughs too, on the
     white page) — the dark one for now on /?tools=dark, to compare */
  const [tone, setTone] = useState<'light' | 'dark'>('light');
  useEffect(() => { if (new URLSearchParams(window.location.search).get('tools') === 'dark') setTone('dark'); }, []);

  // on screen (the pinned part, which stays on screen through the section): the walkthrough plays only then
  useEffect(() => {
    const s = pin.current;
    if (!s) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(s);
    return () => io.disconnect();
  }, []);

  // the page's scroll through the section → the row's position, and the card in view
  useEffect(() => {
    const sec = ref.current, t = track.current;
    if (!sec || !t) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const span = sec.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      const p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / span)) * (N - 1);
      const seg = Math.min(N - 2, Math.floor(p));
      const at = seg + ease(p - seg);
      t.scrollLeft = at * stride(t);
      setActive(Math.round(at));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // a pill: the page scrolls to where that card rests
  const go = (i: number) => {
    const sec = ref.current;
    if (!sec) return;
    const span = sec.offsetHeight - window.innerHeight;
    const top = sec.getBoundingClientRect().top + window.scrollY + (span * i) / (N - 1);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section ref={ref} className="tsl" data-tone={tone} data-foot="/Analytical Tools" aria-labelledby="tsl-title"
      aria-roledescription="carousel" style={{ '--n': N } as React.CSSProperties}>
      <div ref={pin} className="tsl-pin">
        <h2 id="tsl-title" className="tsl-label">Analytical tools</h2>
        <div ref={track} className="tsl-track">
          {TOOLS.map((t, i) => {
            const Loop = LOOPS[i];
            return (
              <article key={t.name} className="tsl-slide" aria-roledescription="slide" aria-label={`${i + 1} of ${N}: ${t.name}`}>
                <a className="tsl-shot" href={t.href} target="_blank" rel="noopener noreferrer" aria-label={`Try ${t.name} (opens in a new tab)`}>
                  <Landscape.Provider value><Loop playing={inView && i === active} /></Landscape.Provider>
                </a>
                <h3 className="tsl-name">{t.name}</h3>
                <p className="tsl-copy">{[t.lead, t.mA, t.mB].filter(Boolean).join(' ')}</p>
                {/* named by aria-label, not an .sr-only span: absolutely placed, that span escaped the track's clip and
                    widened the page; containing it (position: relative on the cards) doubled Section 2's frame time */}
                <a className="tsl-try" href={t.href} target="_blank" rel="noopener noreferrer" aria-label={`Try ${t.name} (opens in a new tab)`}>
                  Try it →
                </a>
              </article>
            );
          })}
        </div>
        {/* where you are, as pills (client's reference, 2026-11-23): the active one long, its neighbours shorter,
            the rest dots (no progress fill: client, 2026-11-23) */}
        <div className="tsl-dots">
          {TOOLS.map((t, i) => (
            <button key={t.name} type="button" className="tsl-dot" aria-label={`Show ${t.name}`} aria-current={i === active || undefined}
              data-near={Math.abs(i - active) === 1 || undefined} onClick={() => go(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
