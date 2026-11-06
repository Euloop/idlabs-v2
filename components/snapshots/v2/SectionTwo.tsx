'use client';

/* SNAPSHOT v2 (frozen 2026-11-06, commit 295dae8): Section 2 with looping diagram stages.
   Self-contained copy: own TokenText, engine, pipeline CSS and section CSS (classes s2v2-*, .pipe-v2). Don't edit. */

import { useEffect, useRef, useState } from 'react';
import TokenText from './TokenText';
import { createPipeline } from './pipeline/engine';
import './pipeline/pipeline.css';
import './section.css';

/* Section 2 — Algorithm research. Figma 110:920 (part 1) and 110:898 (part 2).

   Transition from the hero: this section starts one viewport early (pulled up under
   the hero) so its stage is already pinned while the hero scrolls away above it.
   The page switches dark → white (a ~280ms eased switch when the hero's bottom edge crosses
   mid-screen); then the chrome and part 1 stream in, so there is never an empty
   screen and nothing slides in from below.
   Everything after that is pinned; header and footer stay put and the parts swap in the
   band between them. Scroll budget, after the hero has left:
     1.5 viewport   part 1 holds in the centre (it types in on arrival)
     1.2 viewport   part 1 fades out; after it has finished, the diagram draws itself in, line by line
     9 viewports    diagram (scroll drives the camera; each stage's story loops on its own): overview → zoom into the globe → sourcing → scoring →
                    selection (held). In each stage the highlighted post runs through it on a loop
                    and callouts (heading + bracket, then notes with leaders) appear in turn
     0.6 viewport   selection fades out, its step label fades, part 3 types in
     1.4 viewport   hold, then the pin releases                                            */
const HOLD = 1.5;
const INTRO = 1.2;
const DIAGRAM = 9;
const OUTRO = 0.6;
const TAIL = 1.4;

/* Step label, top centre above the diagram, indexed by chapter (0 overview, 1 sourcing,
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

type View = { chrome: boolean; part1: boolean; part2: boolean; part3: boolean; step: number; notes: string };

export default function SectionTwoV2() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const part2Ref = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const pipeRef = useRef<ReturnType<typeof createPipeline> | null>(null);
  const [view, setView] = useState<View>({ chrome: false, part1: false, part2: false, part3: false, step: 0, notes: '' });
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
    let last: View = { chrome: false, part1: false, part2: false, part3: false, step: 0, notes: '' };
    let lastOutro = -1;
    let isLight = false;
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
      const light = isLight ? heroBottom < 0.65 * vh : heroBottom < 0.55 * vh;
      if (light !== isLight) {
        isLight = light;
        lightAt = now;
        root.dataset.theme = light ? 'light' : 'dark';
        root.style.setProperty('--theme', light ? '1' : '0');
      }
      // Section 2 text waits for the light to come up (~400ms).
      const lit = isLight && now - lightAt > 380;

      const r = section.getBoundingClientRect();
      // px scrolled since the hero fully left (negative while it is leaving).
      const s = -r.top - vh;
      const pinned = r.top <= 1 && r.bottom >= vh - 1;
      // Section 2 text only appears once the light has settled.
      const arrived = pinned && lit;
      const chromeIn = arrived;

      // Everything here follows the scroll directly (Lenis already smooths it); only the
      // stage stories inside the diagram run on their own clocks (pipeline/engine.js).
      // Part 1 fades out when its hold is used up; the diagram draws itself in over the next
      // viewport, starting 0.25 viewport later so the two never overlap.
      const part1On = arrived && s < HOLD * vh;
      const introTarget = clamp((s - (HOLD + 0.25) * vh) / ((INTRO - 0.25) * vh));
      const intro = introTarget;
      const target = clamp((s - (HOLD + INTRO) * vh) / (DIAGRAM * vh));
      const outro = clamp((s - (HOLD + INTRO + DIAGRAM) * vh) / (OUTRO * vh));

      // Outro: the diagram fades out (scrubbed), the step label fades, part 3 types in.
      if (outro !== lastOutro) {
        lastOutro = outro;
        part2.style.opacity = clamp(1 - outro / 0.6).toFixed(3);
      }

      const part3On = arrived && outro >= 0.5;

      const shown = arrived && intro >= 0.5 && outro < 0.3;
      const next: View = {
        chrome: chromeIn,
        part1: part1On,
        part2: shown,
        part3: part3On,
        step: pipe.chapter(target),
        notes: shown ? [...pipe.visible(target, intro)].join(' ') : '',
      };
      if (next.chrome !== last.chrome || next.part1 !== last.part1 || next.part2 !== last.part2 || next.part3 !== last.part3 || next.step !== last.step || next.notes !== last.notes) {
        last = next;
        setView(next);
      }

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
  // leaders start from the text edge. TokenText keeps the layout of unshown text, so this is
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
        const t = el.querySelector('.v2tw')?.getBoundingClientRect();
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

  const { chrome, part1, part2, part3, step } = view;
  const on = new Set(view.notes.split(' '));

  return (
    <section
      ref={sectionRef}
      className="s2v2"
      aria-label="Algorithm research"
      data-chrome={chrome || undefined}
      style={{ height: `${(2 + HOLD + INTRO + DIAGRAM + OUTRO + TAIL) * 100}svh` }}
    >
      <div className="s2v2-stage">
        <div className="frame s2v2-frame">
          <header className="site-header s2v2-header">
            <a className="wordmark" href="/" aria-label="Identity Labs home">
              <span>Identity</span>
              <span className="wm-space"> </span>
              <em>Labs</em>
            </a>
            <a className="s2v2-menu" href="#" aria-label="Menu">
              <TokenText as="span" text="[M]" show={chrome} delay={120} fade />
            </a>
            <span className="tick tick-l" aria-hidden="true" />
            <span className="tick tick-r" aria-hidden="true" />
          </header>

          {/* Parts 1–3 share the band between header and footer; they swap in place. */}
          <div className="s2v2-window">
            <div className="s2v2-part1">
              <TokenText text="Virality is not luck, it’s engineering." show={part1} delay={200} probs />
            </div>

            <div className="s2v2-part2" ref={part2Ref}>
              <div className="s2v2-steps" aria-live="polite">
                <TokenText as="span" className="s2v2-step" text={STEPS[step]} show={part2} delay={120} probs />
              </div>
              <div className="pipe-v2">
                <svg
                  ref={svgRef}
                  className="cam"
                  viewBox="0 0 1200 560"
                  role="img"
                  aria-label="Diagram of the X For You pipeline: posts are sourced, scored and selected into the feed"
                />
                {/* Callout text over the diagram, placed in SVG units (viewBox 1200 × 560). */}
                <div className="s2v2-notes" ref={notesRef}>
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      data-note={n.id}
                      className="s2v2-note"
                      style={{ left: `${(n.x / 1200) * 100}%`, top: `${(n.y / 560) * 100}%`, width: `${(n.w / 1200) * 100}%` }}
                    >
                      <TokenText as="span" text={n.text} show={on.has(n.id)} delay={160} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="s2v2-part3">
              <TokenText text={PART3} show={part3} delay={160} probs />
            </div>
          </div>

          <footer className="s2v2-foot">
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
