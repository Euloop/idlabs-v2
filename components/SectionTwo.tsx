'use client';

import { useEffect, useRef, useState } from 'react';
import TokenText from './TokenText';
import ScrollText, { type ScrollTextHandle } from './ScrollText';
import { createPipeline } from './pipeline/engine';
import './pipeline/pipeline.css';

/* Section 2 — Algorithm research. Figma 110:920 (part 1) and 110:898 (part 2).

   Transition from the hero: this section starts one viewport early (pulled up under
   the hero) so its stage is already pinned while the hero scrolls away above it.
   The page switches dark → white (a 400ms eased switch when about half the hero has gone);
   the chrome fades in. Everything else in this section is driven by the scroll position:
   text types in letter by letter as you scroll (and un-types as you scroll back), the
   diagram draws in, zooms, and each stage's story is scrubbed by the scroll.
   Everything after that is pinned; header and footer stay put and the parts swap in the
   band between them. Scroll budget, after the hero has left:
     1.5 viewport   part 1 types in (from just before the hero has gone), holds, types out
     1.2 viewport   the diagram draws itself in, line by line; its line above types in
     9 viewports    diagram: overview → zoom into the globe → sourcing → scoring → selection.
                    In each stage the highlighted post is scrubbed through it and the notes
                    (leader first, then text) write in and out as it passes
     0.6 viewport   selection fades out, its step label types out, part 3 types in
     1.4 viewport   hold, then the pin releases                                            */
const HOLD = 1.5;
const INTRO = 1.2;
const DIAGRAM = 9;
const OUTRO = 0.6;
const TAIL = 1.4;

/* Step label, centred below the diagram, indexed by chapter (0 overview, 1 sourcing,
   2 scoring, 3 selection). Copy is the client's (Notion) word for word — do not edit.
   Scoring and selection are both the Ranking module, so they share one line. Notes over
   the diagram use the wording of the client's pipeline figure (pipeline/engine.js NOTES). */
const STEPS = [
  'The algorithm passes every post on X and LinkedIn through the same pipeline, scoring it on thousands of signals.',
  '1) The Sourcing module determines how many people see your post',
  '2) The Ranking module then decides your post’s position in each feed',
  '2) The Ranking module then decides your post’s position in each feed',
];

type Note = { id: string; text: string; x: number; y: number; w: number };

const PART3 =
  'Our research lab backpropagates 500M posts/week to analyse how the algorithm treats each post as it goes through the sourcing and ranking stages. The dominant patterns that emerge fine-tune how we game ‘sourcing’ and ensure every post or launch we do goes consistently viral';

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));


export default function SectionTwo() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const part2Ref = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const pipeRef = useRef<ReturnType<typeof createPipeline> | null>(null);
  const [chrome, setChrome] = useState(false);
  const part1Ref = useRef<ScrollTextHandle>(null);
  const stepRef = useRef<ScrollTextHandle>(null);
  const part3Ref = useRef<ScrollTextHandle>(null);
  const noteRefs = useRef<Record<string, ScrollTextHandle | null>>({});
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    const part2 = part2Ref.current;
    if (!section || !svg || !part2) return;

    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>('.hero');
    const pipe = createPipeline(svg);
    pipeRef.current = pipe;
    svg.innerHTML = pipe.markup;
    setNotes(pipe.notes);
    pipe.render(0, 0, 1, false, 0); // start hidden: nothing drawn until the intro begins

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = performance.now();
    let lastChrome = false;
    let lastOutro = -1;
    let isLight = false;
    let night = false;
    let lightAt = 0;
    let raf = 0;
    let running = false;

    const update = (now: number) => {
      const vh = window.innerHeight;

      // Theme switch: the lights coming up, not a scrubbed blend (as on departuremono.com).
      // Once about half the hero has scrolled away html[data-theme] flips and CSS eases the
      // whole screen to light in 400ms (globals.css); scrolling back reverses it.
      // Hysteresis (55% / 65%) so it can't flicker at the threshold itself.
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      // Later the lights go down again ('night'): once the tools intro (ToolsIntro.tsx) has
      // held in place for a moment (~0.35 viewport into its hold), through Section 4.
      // Same 400ms ease, hysteresis. Section 3 (research papers) stays light.
      const ti = document.querySelector<HTMLElement>('.ti');
      const tiTop = ti ? ti.getBoundingClientRect().top : Infinity;
      night = night ? tiTop < -0.25 * vh : tiTop < -0.35 * vh;
      const light = !night && (isLight ? heroBottom < 0.65 * vh : heroBottom < 0.55 * vh);
      const theme = night ? 'night' : light ? 'light' : 'dark';
      if (root.dataset.theme !== theme) root.dataset.theme = theme;
      if (light !== isLight) {
        isLight = light;
        lightAt = now;
        root.style.setProperty('--theme', light ? '1' : '0');
      }
      // The chrome waits for the light to come up (~400ms).
      const lit = isLight && now - lightAt > 380;

      const r = section.getBoundingClientRect();
      // px scrolled since the hero fully left (negative while it is leaving).
      const s = -r.top - vh;
      const pinned = r.top <= 1 && r.bottom >= vh - 1;
      const chromeIn = pinned && lit;
      const V = (x: number) => x * vh; // viewports → px
      const sg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

      // Part 1 types in from just before the hero has gone, holds, and types out at the end
      // of its hold; the diagram then draws itself in over the next viewport.
      const p1 = isLight ? Math.min(sg(s, V(-0.45), V(0.35)), 1 - sg(s, V(HOLD - 0.45), V(HOLD))) : 0;
      part1Ref.current?.set(p1);
      const intro = clamp((s - (HOLD + 0.25) * vh) / ((INTRO - 0.25) * vh));
      const target = clamp((s - (HOLD + INTRO) * vh) / (DIAGRAM * vh));
      const outro = clamp((s - (HOLD + INTRO + DIAGRAM) * vh) / (OUTRO * vh));

      // Outro: the diagram fades out (scrubbed), the step label fades, part 3 types in.
      if (outro !== lastOutro) {
        lastOutro = outro;
        part2.style.opacity = clamp(1 - outro / 0.6).toFixed(3);
      }

      // Step label (below the diagram): overview line, then 1) Sourcing, then 2) Ranking (scoring and
      // selection). Each types in as its chapter starts and out as it ends.
      const P = target;
      const label = P < 0.113 ? 0 : P < 0.413 ? 1 : 2;
      const pl = label === 0 ? Math.min(sg(intro, 0.55, 1), 1 - sg(P, 0.07, 0.11))
        : label === 1 ? Math.min(sg(P, 0.115, 0.16), 1 - sg(P, 0.37, 0.41))
        : Math.min(sg(P, 0.415, 0.46), 1 - sg(outro, 0, 0.4));
      stepRef.current?.set(pl, STEPS[label]);

      // Notes: leader over the first part of each note's progress, then its text types.
      const np = pipe.noteProgress(P, intro) as Record<string, number>;
      for (const id in noteRefs.current) noteRefs.current[id]?.set(outro > 0 ? 0 : sg(np[id] || 0, 0.3, 1));

      // Part 3 types in as the diagram leaves.
      part3Ref.current?.set(sg(s, V(HOLD + INTRO + DIAGRAM + OUTRO * 0.4), V(HOLD + INTRO + DIAGRAM + OUTRO + 0.7)));

      if (chromeIn !== lastChrome) { lastChrome = chromeIn; setChrome(chromeIn); }

      if (intro > 0 && outro < 1) {
        // Narrow screens: zoom the camera in inside each stage so labels stay legible.
        const boost = Math.max(1, 760 / Math.max(1, svg.clientWidth));
        pipe.render(reduce.matches ? 0 : (now - start) / 1000, target, boost, reduce.matches, intro);
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
    // (the rAF loop also runs while the section is near, so the post-switch reveal fires on time)
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

  // Measure where each note's text really sits (it wraps differently per width) so the
  // leaders start from the text edge. ScrollText keeps the layout of untyped text, so this is
  // stable whether or not a note is showing.
  useEffect(() => {
    const box = notesRef.current;
    if (!box || !notes.length) return;
    const measure = () => {
      const b = box.getBoundingClientRect();
      if (!b.width) return;
      const k = 1200 / b.width;
      const rects: Record<string, number[]> = {};
      box.querySelectorAll<HTMLElement>('[data-note]').forEach((el) => {
        const t = el.querySelector('.tw')?.getBoundingClientRect();
        if (t) rects[el.dataset.note!] = [(t.left - b.left) * k, (t.top - b.top) * k, (t.right - b.left) * k, (t.bottom - b.top) * k];
      });
      pipeRef.current?.setRects(rects);
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [notes]);


  return (
    <section
      ref={sectionRef}
      className="s2"
      aria-label="Algorithm research"
      data-foot="/Algorithm Research"
      data-chrome={chrome || undefined}
      style={{ height: `${(2 + HOLD + INTRO + DIAGRAM + OUTRO + TAIL) * 100}svh` }}
    >
      <div className="s2-stage">
        <div className="frame s2-frame">
          {/* Layout only: the visible header and footer are the shared fixed chrome (SiteChrome.tsx). */}
          <header className="site-header s2-header s2-spacer" aria-hidden="true">
            <a className="wordmark" href="/" aria-label="Identity Labs home">
              <span>Identity</span>
              <span className="wm-space"> </span>
              <em>Labs</em>
            </a>
            <a className="s2-menu" href="#" aria-label="Menu">
              <TokenText as="span" text="[M]" show={chrome} delay={120} fade />
            </a>
            <span className="tick tick-l" aria-hidden="true" />
            <span className="tick tick-r" aria-hidden="true" />
          </header>

          {/* Parts 1–3 share the band between header and footer; they swap in place. */}
          <div className="s2-window">
            <div className="s2-part1">
              <ScrollText ref={part1Ref} text="Virality is not luck, it’s engineering." probs />
            </div>

            <div className="s2-part2" ref={part2Ref}>
              <div className="s2-steps" aria-live="polite">
                <ScrollText ref={stepRef} as="span" className="s2-step" text={STEPS[0]} probs />
              </div>
              <div className="pipe">
                <svg
                  ref={svgRef}
                  className="cam"
                  viewBox="0 0 1200 560"
                  role="img"
                  aria-label="Diagram of the X For You pipeline: posts are sourced, scored and selected into the feed"
                />
                {/* Callout text over the diagram, placed in SVG units (viewBox 1200 × 560). */}
                <div className="s2-notes" ref={notesRef}>
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      data-note={n.id}
                      className="s2-note"
                      style={{ left: `${(n.x / 1200) * 100}%`, top: `${(n.y / 560) * 100}%`, width: `${(n.w / 1200) * 100}%` }}
                    >
                      <ScrollText ref={(h) => { noteRefs.current[n.id] = h; }} as="span" text={n.text} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="s2-part3">
              <ScrollText ref={part3Ref} text={PART3} probs />
            </div>
          </div>

          <footer className="s2-foot s2-spacer" aria-hidden="true">
            <TokenText as="span" text="/Algorithm Research" show={chrome} delay={200} fade />
            <TokenText as="span" text="/Our Tech" show={chrome} delay={260} fade />
            <span className="tick tick-l" aria-hidden="true" />
            <span className="tick tick-r" aria-hidden="true" />
          </footer>
        </div>
      </div>
    </section>
  );
}
