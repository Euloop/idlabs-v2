'use client';

import { useEffect, useRef, useState } from 'react';
import { TOOLS, LOOPS } from './ToolsCollage';
import { LOOP_S, Landscape } from './tool-motion/shared';
import './tools-slider.css';

/* The analytical tools on phones (≤559px, client 2026-11-23), in place of the Collage card (ToolsCollage,
   hidden there: tools-slider.css). A slider of dark 3:4 cards, the next one peeking in at the right: one tool a
   card — its walkthrough as on desktop (the landscape drawing, not the phones' portrait one), then "1. Engagement
   Classifier", its copy as one paragraph and "Try it →" (client's mockup, 2026-11-23) — swiped right to left
   (native scroll snap), and moving on by itself after a while. No tool names or progress bars; small dots show where you are.
   The auto-slide holds while the section is off screen or a finger is on the track, and starts its wait
   over after every change, so a swipe is never followed straight away by a jump. */

// how long a tool stays: whole loops of its walkthrough, at least 7s (so it never cuts a loop short)
const dwell = (i: number) => Math.ceil(7 / LOOP_S[i]) * LOOP_S[i] * 1000;

// one card and the gap after it (the cards are narrower than the track: the next one peeks in)
const stride = (t: HTMLElement) => {
  const [a, b] = t.children as unknown as HTMLElement[];
  return b ? b.offsetLeft - a.offsetLeft : t.clientWidth;
};

export default function ToolsSlider() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [touching, setTouching] = useState(false);
  /* two looks (client, 2026-11-23): light (the default: white cards, the walkthroughs as they are) and dark (the
     cards dark, their walkthroughs too, on the white page) — the dark one for now on /?tools=dark, to compare */
  const [tone, setTone] = useState<'light' | 'dark'>('light');
  useEffect(() => { if (new URLSearchParams(window.location.search).get('tools') === 'dark') setTone('dark'); }, []);

  // on screen (any real part of it): plays and auto-slides only then
  useEffect(() => {
    const s = ref.current;
    if (!s) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(s);
    return () => io.disconnect();
  }, []);

  // the slide in view follows the scroll (a swipe, or the auto-slide's own scroll)
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let raf = 0;
    const measure = () => { raf = 0; setActive(Math.min(TOOLS.length - 1, Math.max(0, Math.round(t.scrollLeft / stride(t))))); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    t.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); t.removeEventListener('scroll', onScroll); };
  }, []);

  const go = (i: number) => {
    const t = track.current;
    if (!t) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    t.scrollTo({ left: i * stride(t), behavior: reduce ? 'auto' : 'smooth' });
  };

  // the auto-slide: after the active tool's dwell, the next (the last back to the first)
  useEffect(() => {
    if (!inView || touching) return;
    const id = window.setTimeout(() => go((active + 1) % TOOLS.length), dwell(active));
    return () => window.clearTimeout(id);
  }, [active, inView, touching]);

  return (
    <section ref={ref} className="tsl" data-tone={tone} data-foot="/Analytical Tools" aria-labelledby="tsl-title" aria-roledescription="carousel">
      <h2 id="tsl-title" className="tsl-label">Analytical tools</h2>
      <div ref={track} className="tsl-track"
        onTouchStart={() => setTouching(true)} onTouchEnd={() => setTouching(false)} onTouchCancel={() => setTouching(false)}>
        {TOOLS.map((t, i) => {
          const Loop = LOOPS[i];
          return (
            <article key={t.name} className="tsl-slide" aria-roledescription="slide" aria-label={`${i + 1} of ${TOOLS.length}: ${t.name}`}>
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
    </section>
  );
}
