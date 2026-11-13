'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollText, { type ScrollTextHandle } from '../ScrollText';
import { TOOLS, LOOPS } from './ToolsCollage';
import { LOOP } from './tool-motion/shared';
import './tools-showcase.css';

/* Analytical tools, "Showcase" layout (/home-2 and /home-4 Tools tabs). Two pinned screens:

   1. The intro (`intro`) — not pinned: it scrolls with the page, the text typed in by the scroll,
      done as it reaches the middle of the screen; the tools' names come up at the bottom of the
      screen just then, never before the text is complete:
        typed     the line we had (Motion's intro): the client's whole sentence in 12px mono caps,
                  then a black bar wipes across "2B+ data points"
        headline  its first clause as a headline ("We turned this research into software, built on
                  2B+ data points"), the rest under it, smaller and grey
   2. The tools: the four names as tabs; under them a soft colour field, rule to rule, with the
      active tool's walkthrough (tool-motion/, the same loops as Motion) in one big window; under
      it, centred, the tool's lead and what the walkthrough shows (the client's copy). The stage
      holds for HOLD screens before the page scrolls on. The tools cycle, one loop each (LOOP s),
      while it is on screen; a click picks one; the pointer on the window holds it.
   Sizes are Figma px × --px (the frame's unit). */

export type ShowcaseIntro = 'typed' | 'headline';

const INTRO =
  'We turned this research into software, built on 2B+ data points, that weights every engagement by the engager’s influence, measures engagement velocity in real time, and maps how deep a post penetrates each niche, to forecast its reach and shelf-life within the first 30 minutes.';
// the headline variant, as in the design (the sentence cut after "penetrates")
const HEAD = 'We turned this research into software, built on 2B+ data points';
const SUB = 'that weights every engagement by the engager’s influence, measures engagement velocity in real time, and maps how deep a post penetrates';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export default function ToolsShowcase({ intro = 'typed' }: { intro?: ShowcaseIntro }) {
  const introRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<ScrollTextHandle>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);

  // The intro, driven by the scroll: 0 as its text comes up over the bottom of the screen, 1 as it
  // reaches the middle (the intro isn't pinned: it scrolls with the page); scrolling back un-types it.
  // The space under it keeps the tools' names below the fold until then.
  useEffect(() => {
    const el = introRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = (el.querySelector('.tsi-typed, .tsi-split') ?? el).getBoundingClientRect();
      const mid = r.top + r.height / 2; // the text's own middle
      const p = reduce ? 1 : clamp((0.95 * vh - mid) / (0.45 * vh));
      if (intro === 'typed') {
        textRef.current?.set(range(p, 0, 0.75));
        textRef.current?.light?.(range(p, 0.78, 0.95));
      } else {
        textRef.current?.set(range(p, 0, 0.6));
        if (subRef.current) {
          const k = range(p, 0.55, 0.85);
          subRef.current.style.opacity = k.toFixed(3);
          subRef.current.style.translate = `0 ${((1 - k) * 8).toFixed(2)}px`;
        }
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [intro]);

  // The tools stage on screen: it covers the middle of the screen
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const vh = window.innerHeight;
      setInView(r.top < vh * 0.5 && r.bottom > vh * 0.5);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  // the cycle: next tool after one full loop, only while on screen and not held
  const running = inView && !held;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % TOOLS.length), LOOP * 1000);
    return () => window.clearTimeout(id);
  }, [running, active]);

  const t = TOOLS[active];
  const Loop = LOOPS[active];

  return (
    <section ref={sectionRef} className="tsc" data-intro={intro} data-foot="/Analytical Tools" aria-label="Analytical tools">
      <div ref={introRef} className="tsi">
        <div className="tsi-pin">
          <div className="frame tsi-frame">
            {intro === 'typed' ? (
              <ScrollText key="typed" ref={textRef} className="tsi-typed" text={INTRO} hl="2B+ data points" />
            ) : (
              <div className="tsi-split">
                <ScrollText key="headline" ref={textRef} as="h2" className="tsi-head" text={HEAD} />
                <p ref={subRef} className="tsi-sub">{SUB}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* the stage is a direct child of the section, so its sticky range is the whole section */}
      <div ref={stageRef} className="tsc-pin">
          <div className="frame tsc-frame">
            <div className="tsc-tabs" role="tablist" aria-label="Tools">
              {TOOLS.map((tool, i) => (
                <button key={tool.name} type="button" role="tab" id={`tsc-tab-${i}`} aria-selected={i === active} aria-controls="tsc-panel"
                  className="tsc-tab" onClick={() => setActive(i)}>
                  {tool.name}
                </button>
              ))}
            </div>

            <div className="tsc-field">
              <div className="tsc-glow" aria-hidden="true" />
              <a id="tsc-panel" role="tabpanel" aria-labelledby={`tsc-tab-${active}`} className="tsc-window"
                href={t.href} target="_blank" rel="noopener noreferrer" aria-label={`Try ${t.name} (opens in a new tab)`}
                onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}
                onFocus={(e) => setHeld(e.target.matches(':focus-visible'))} onBlur={() => setHeld(false)}>
                <div key={active} className="tsc-loop">
                  <Loop playing={running} />
                </div>
              </a>
            </div>

            <p key={active} className="tsc-cap">
              <span>{t.lead}</span> <span>{t.mA}</span> <span>{t.mB}</span>
            </p>
          </div>
      </div>
      <div className="tsc-hold" aria-hidden="true" />
    </section>
  );
}
