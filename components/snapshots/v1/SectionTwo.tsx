'use client';

import { useEffect, useRef, useState } from 'react';
import Glitch from './Glitch';
import { createPipeline } from './pipeline/engine';
import './pipeline/pipeline.css';
import './section.css';

/* SNAPSHOT v1 (frozen 2026-11-05, commit 18b8973) — do not edit; iterate on components/SectionTwo.tsx.
   Self-contained copy: own Glitch, engine, pipeline CSS and section CSS (classes renamed s2v1-*, .pipe-v1).

   Section 2 — Algorithm research. Figma 110:920 (part 1) and 110:898 (part 2).

   Transition from the hero: this section starts one viewport early (pulled up under
   the hero) so its stage is already pinned while the hero scrolls away above it.
   The page switches dark → white (a ~280ms eased switch when the hero's bottom edge crosses
   mid-screen); then the chrome and part 1 glitch in, so there is never an empty
   screen and nothing slides in from below.
   Everything after that is pinned; header and footer stay put and the parts swap in the
   band between them. Scroll budget, after the hero has left:
     0.7 viewport   part 1 holds in the centre (it glitched in on arrival)
     1 viewport     part 1 glitches out; after it has finished, the diagram draws itself in, line by line
     9.5 viewports  diagram scrubbed: overview → zoom into the globe → sourcing → scoring →
                    selection (held). In each stage the highlighted post is scrubbed through it
                    and callouts (heading + bracket, then notes with leaders) appear in turn
     0.6 viewport   selection fades out, its step label glitches out, part 3 glitches in
     0.6 viewport   hold, then the pin releases                                            */
const HOLD = 0.7;
const INTRO = 1;
const DIAGRAM = 9.5;
const OUTRO = 0.6;
const TAIL = 0.6;

/* Step label, top left. Index 0 is the overview (no number). Step 1 copy is from Figma;
   the overview line and steps 2 and 3 are draft. Notes over the diagram (copy and positions)
   live in pipeline/engine.js (NOTES) and are draft. */
const STEPS = [
  'Every post passes through three modules before it reaches a feed',
  'The Sourcing module determines how many people see your post',
  'The Scoring module predicts how each person will engage with your post',
  'The Selection module decides where your post lands in the feed',
];

type Note = { id: string; text: string; x: number; y: number; w: number };

const PART3 =
  'Our research lab backpropagates 500M posts/week to analyse how the algorithm treats each post as it goes through the sourcing and ranking stages. The dominant patterns that emerge fine-tune how we game ‘sourcing’ and ensure every post or launch we do goes consistently viral';

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

type View = { chrome: boolean; part1: boolean; part2: boolean; part3: boolean; step: number; notes: string };

export default function SectionTwo() {
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
    let smoothed = 0;
    let last: View = { chrome: false, part1: false, part2: false, part3: false, step: 0, notes: '' };
    let lastOutro = -1;
    let isLight = false;
    let lightAt = 0;
    let hiddenAt = -1; // when part 1 started glitching out (ms)
    let introShown = 0;
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

      // Part 1 glitches out when the hold is used up. The diagram starts drawing 0.25 viewport
      // later, and never before part 1's glitch-out has finished (~420ms), even on a fast
      // scroll — then it eases to where the scroll says it should be.
      const part1On = arrived && s < HOLD * vh;
      if (!part1On && s >= HOLD * vh) { if (hiddenAt < 0) hiddenAt = now; } else hiddenAt = -1;
      const introTarget = clamp((s - (HOLD + 0.25) * vh) / ((INTRO - 0.25) * vh));
      const gateOpen = introTarget <= 0 || (hiddenAt >= 0 && now - hiddenAt > 450) || reduce.matches;
      introShown = gateOpen ? introShown + (introTarget - introShown) * 0.25 : 0;
      if (Math.abs(introTarget - introShown) < 0.001) introShown = gateOpen ? introTarget : 0;
      const intro = introShown;
      const target = clamp((s - (HOLD + INTRO) * vh) / (DIAGRAM * vh));
      smoothed += (target - smoothed) * 0.14; // a soft follow, so the highlighted post never jumps ahead of its notes
      if (Math.abs(target - smoothed) < 0.0005) smoothed = target;
      const outro = clamp((s - (HOLD + INTRO + DIAGRAM) * vh) / (OUTRO * vh));

      // Outro: the diagram fades out (scrubbed), the step label glitches out, part 3 glitches in.
      if (outro !== lastOutro) {
        lastOutro = outro;
        part2.style.opacity = clamp(1 - outro / 0.6).toFixed(3);
      }

      const shown = arrived && intro >= 0.5 && outro < 0.3;
      const next: View = {
        chrome: chromeIn,
        part1: part1On,
        part2: shown,
        part3: arrived && outro >= 0.5,
        step: pipe.chapter(smoothed),
        notes: shown ? [...pipe.visible(smoothed, intro)].join(' ') : '',
      };
      if (next.chrome !== last.chrome || next.part1 !== last.part1 || next.part2 !== last.part2 || next.part3 !== last.part3 || next.step !== last.step || next.notes !== last.notes) {
        last = next;
        setView(next);
      }

      if (intro > 0 && outro < 1) {
        // Narrow screens: zoom the camera in inside each stage so labels stay legible.
        const boost = Math.max(1, 760 / Math.max(1, svg.clientWidth));
        pipe.render(reduce.matches ? 0 : (now - start) / 1000, smoothed, boost, reduce.matches, intro);
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
  // leaders start from the text edge. Glitch keeps the layout of hidden text, so this is
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
        const t = el.querySelector('.glitch')?.getBoundingClientRect();
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
      className="s2v1"
      aria-label="Algorithm research"
      data-chrome={chrome || undefined}
      style={{ height: `${(2 + HOLD + INTRO + DIAGRAM + OUTRO + TAIL) * 100}svh` }}
    >
      <div className="s2v1-stage">
        <div className="frame s2v1-frame">
          <header className="site-header s2v1-header">
            <a className="wordmark" href="/" aria-label="Identity Labs home">
              <span>Identity</span>
              <span className="wm-space"> </span>
              <em>Labs</em>
            </a>
            <a className="s2v1-menu" href="#" aria-label="Menu">
              <Glitch as="span" text="[M]" show={chrome} delay={120} />
            </a>
            <span className="tick tick-l" aria-hidden="true" />
            <span className="tick tick-r" aria-hidden="true" />
          </header>

          {/* Parts 1–3 share the band between header and footer; they swap in place. */}
          <div className="s2v1-window">
            <div className="s2v1-part1">
              <Glitch text="Virality is not luck, it’s engineering." show={part1} delay={80} />
              <Glitch text="The algorithm passes every post on X and LinkedIn through the same pipeline, scoring it on thousands of signals." show={part1} delay={240} />
            </div>

            <div className="s2v1-part2" ref={part2Ref}>
              <div className="s2v1-steps" aria-live="polite">
                {step > 0 && (
                  <span className="s2v1-num">
                    <Glitch as="span" text={`${step}.`} show={part2} />
                  </span>
                )}
                <Glitch as="span" className="s2v1-step" text={STEPS[step]} show={part2} delay={60} />
              </div>
              <div className="pipe-v1">
                <svg
                  ref={svgRef}
                  className="cam"
                  viewBox="0 0 1200 560"
                  role="img"
                  aria-label="Diagram of the X For You pipeline: posts are sourced, scored and selected into the feed"
                />
                {/* Callout text over the diagram, placed in SVG units (viewBox 1200 × 560). */}
                <div className="s2v1-notes" ref={notesRef}>
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      data-note={n.id}
                      className="s2v1-note"
                      style={{ left: `${(n.x / 1200) * 100}%`, top: `${(n.y / 560) * 100}%`, width: `${(n.w / 1200) * 100}%` }}
                    >
                      <Glitch as="span" text={n.text} show={on.has(n.id)} delay={120} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="s2v1-part3">
              <Glitch text={PART3} show={part3} delay={80} />
            </div>
          </div>

          <footer className="s2v1-foot">
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
