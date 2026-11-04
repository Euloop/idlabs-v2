'use client';

import { useEffect, useRef, useState } from 'react';
import Glitch from './Glitch';
import { createPipeline } from './pipeline/engine';
import './pipeline/pipeline.css';

/* Section 2 — Algorithm research. Figma 110:920 (part 1) and 110:898 (part 2).

   Transition from the hero: this section starts one viewport early (pulled up under
   the hero) so its stage is already pinned while the hero scrolls away above it.
   The page fades dark → white; once the hero has faded out (theme ≥ 0.45, hero's bottom
   edge near mid-screen) the chrome and part 1 glitch in, so there is never an empty
   screen and nothing slides in from below.
   Scroll budget (viewport heights after the hero has left):
     0    → 0.7   part 1 holds
     0.7  → 0.8   part 1 glitches out while the diagram starts to build (no empty beat)
     0.8  → 1.8   the diagram builds in, scrubbed: a soft left→right wipe in the direction
                  posts travel (all posts → funnel → feed); the step label glitches in midway
     1.8  → 6.2   the camera is scrubbed: overview → sourcing → scoring → selection → overview
     6.2  → 6.6   hold, then the pin releases                                              */
const HOLD = 0.7;
const GAP = 0.1;
const BUILD = 1.0;
const DIAGRAM = 4.4;
const TOTAL = 6.6;

/* Step 1 copy is from Figma. Steps 2 and 3 are draft copy — replace when final. */
const STEPS = [
  'The Sourcing module determines how many people see your post',
  'The Scoring module predicts how each person will engage with your post',
  'The Selection module decides where your post lands in the feed',
];

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (x: number) => x * x * (3 - 2 * x);

type View = { chrome: boolean; part1: boolean; part2: boolean; step: number };

export default function SectionTwo() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ chrome: false, part1: false, part2: false, step: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>('.hero');
    const pipe = createPipeline(svg);
    svg.innerHTML = pipe.markup;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = performance.now();
    let smoothed = 0;
    let last: View = { chrome: false, part1: false, part2: false, step: 0 };
    let raf = 0;
    let running = false;

    const update = (now: number) => {
      const vh = window.innerHeight;

      // Theme 0 → 1 while the hero's bottom edge travels from 90% to 10% of the viewport,
      // eased so the mid-grey passes quickly. The hero content is gone by theme ≈ 0.45.
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      const theme = smooth(clamp((0.9 * vh - heroBottom) / (0.8 * vh)));
      root.style.setProperty('--theme', theme.toFixed(3));
      root.style.setProperty('--hero-fade', clamp(1 - theme / 0.45).toFixed(3));

      const r = section.getBoundingClientRect();
      // d = viewport heights scrolled since the hero fully left (negative while it is leaving).
      const d = Math.min(TOTAL, (-r.top - vh) / vh);
      const build = clamp((d - HOLD - GAP) / BUILD);
      section.style.setProperty('--build', smooth(build).toFixed(4));
      const pinned = r.top <= 1 && r.bottom >= vh - 1;
      const arrived = pinned && theme >= 0.45;

      const target = clamp((d - HOLD - GAP - BUILD) / DIAGRAM);
      smoothed += (target - smoothed) * 0.16;
      if (Math.abs(target - smoothed) < 0.0005) smoothed = target;

      const ci = pipe.chapter(smoothed);
      const next: View = {
        chrome: arrived,
        part1: arrived && d < HOLD,
        part2: arrived && build > 0.45,
        step: ci <= 1 ? 0 : ci === 2 ? 1 : 2,
      };
      if (next.chrome !== last.chrome || next.part1 !== last.part1 || next.part2 !== last.part2 || next.step !== last.step) {
        last = next;
        setView(next);
      }

      if (build > 0) {
        // Narrow screens: zoom the camera in inside each stage so labels stay legible.
        const boost = Math.max(1, 760 / Math.max(1, svg.clientWidth));
        pipe.render(reduce.matches ? 0 : (now - start) / 1000, smoothed, boost);
      }
    };

    const loop = (now: number) => {
      update(now);
      raf = running ? requestAnimationFrame(loop) : 0;
    };
    const startLoop = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    const stopLoop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };

    // Run only while the section is on screen or within one viewport below it.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : (stopLoop(), update(performance.now()))),
      { rootMargin: '0px 0px 100% 0px' },
    );
    io.observe(section);
    const onScroll = () => { if (!running) update(performance.now()); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update(performance.now());

    return () => {
      io.disconnect();
      stopLoop();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const { chrome, part1, part2, step } = view;

  return (
    <section
      ref={sectionRef}
      className="s2"
      aria-label="Algorithm research"
      data-chrome={chrome || undefined}
      style={{ height: `${(TOTAL + 2) * 100}svh` }}
    >
      <div className="s2-stage">
        <div className="frame s2-frame">
          <header className="site-header s2-header">
            <a className="wordmark" href="/" aria-label="Identity Labs home">
              <span>Identity</span>
              <span className="wm-space"> </span>
              <em>Labs</em>
            </a>
            <a className="s2-menu" href="#" aria-label="Menu">
              <Glitch as="span" text="[M]" show={chrome} delay={120} />
            </a>
            <span className="tick tick-l" aria-hidden="true" />
            <span className="tick tick-r" aria-hidden="true" />
          </header>

          {/* Part 1 */}
          <div className="s2-part1">
            <Glitch text="Virality is not luck, it’s engineering." show={part1} delay={80} />
            <Glitch text="The algorithm passes every post on X and LinkedIn through the same pipeline, scoring it on thousands of signals." show={part1} delay={240} />
          </div>

          {/* Part 2 */}
          <div className="s2-part2">
            <div className="s2-steps" aria-live="polite">
              <span className="s2-num">
                <Glitch as="span" text={`${step + 1}.`} show={part2} />
              </span>
              <Glitch as="span" className="s2-step" text={STEPS[step]} show={part2} delay={60} />
            </div>
            <div className="pipe">
              <svg
                ref={svgRef}
                className="cam"
                viewBox="0 0 1200 560"
                role="img"
                aria-label="Diagram of the X For You pipeline: posts are sourced, scored and selected into the feed"
              />
            </div>
          </div>

          <footer className="s2-foot">
            <Glitch as="span" text="/Algorithm Research" show={chrome} delay={200} />
            <Glitch as="span" text="/Our Tech" show={chrome} delay={260} />
            <span className="tick tick-l" aria-hidden="true" />
            <span className="tick tick-r" aria-hidden="true" />
          </footer>
        </div>
      </div>
    </section>
  );
}
