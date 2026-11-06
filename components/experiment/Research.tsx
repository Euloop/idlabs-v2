'use client';

import { useEffect, useRef, useState } from 'react';
import TokenText from './TokenText';
import { createPipeline } from './pipeline/engine';
import { ARRIVE, LEAVE, softPinOffset } from './softPin';
import './pipeline/pipeline.css';

/* Section 2 · Algorithm research, v2 layout (Figma 121:1115, 121:976, 121:837).
   Story, copy, text motion and scroll budget follow the home page's section 2 (commit 295dae8):
   TokenText, diagram drawn in as pen strokes, zoom into the globe, stage stories looping on
   their own clocks, scroll driving texts / draw-in / zoom / stage changes directly.
   Differences for v2: white page (no theme switch); the wordmark and nav are the page's
   fixed chrome (Experiment.tsx); and part 1 arrives by normal scroll: the stage is sticky,
   so "Virality is not luck…" rides up from the bottom of the screen with the section (typing
   in as soon as it enters the viewport) and stays pinned in the centre once the section
   reaches the top. Step labels sit below the diagram, with room between them.

   Scroll budget after the stage pins:
     1.5 viewport   part 1 holds in the centre
     1.2 viewport   part 1 fades out; then the diagram draws itself in, line by line
     9 viewports    diagram: overview → zoom into the globe → sourcing → scoring → selection (held)
     0.6 viewport   selection fades out, its step label fades, part 3 types in
     1.4 viewport   hold, then the pin releases                                               */
const HOLD = 1.5;
const INTRO = 1.2;
const DIAGRAM = 9;
const OUTRO = 0.6;
const TAIL = 1.4;

/* Client copy (Notion), word for word — do not edit. The algorithm line sits above the
   overview diagram (client: it replaces "Every post passes through three modules…").
   Scoring and selection are both the Ranking module, so they share one line. */
const PART1 = 'Virality is not luck, it’s engineering.';
const STEPS = [
  'The algorithm passes every post on X and LinkedIn through the same pipeline, scoring it on thousands of signals.',
  '1) The Sourcing module determines how many people see your post',
  '2) The Ranking module then decides your post’s position in each feed',
  '2) The Ranking module then decides your post’s position in each feed',
];
const PART3 =
  'Our research lab backpropagates 500M posts/week to analyse how the algorithm treats each post as it goes through the sourcing and ranking stages. The dominant patterns that emerge fine-tune how we game ‘sourcing’ and ensure every post or launch we do goes consistently viral';

type Note = { id: string; text: string; x: number; y: number; w: number };
type View = { part1: boolean; part2: boolean; part3: boolean; step: number; notes: string };

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export default function Research() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const part2Ref = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const pipeRef = useRef<ReturnType<typeof createPipeline> | null>(null);
  const [view, setView] = useState<View>({ part1: false, part2: false, part3: false, step: 0, notes: '' });
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    const part2 = part2Ref.current;
    const win = windowRef.current;
    if (!section || !svg || !part2 || !win) return;

    const pipe = createPipeline(svg);
    pipeRef.current = pipe;
    svg.innerHTML = pipe.markup;
    setNotes(pipe.notes);
    pipe.render(0, 0, 1, false, 0); // nothing drawn until the intro begins

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = performance.now();
    let last: View = { part1: false, part2: false, part3: false, step: 0, notes: '' };
    let lastOutro = -1;
    let raf = 0;
    let running = false;

    const update = (now: number) => {
      const vh = window.innerHeight;
      const r = section.getBoundingClientRect();
      // Soft pin (softPin.ts): the stage locks one viewport early; over that viewport the
      // content rises from the bottom edge to the centre, slowing smoothly to a stop, and over
      // the last viewport it speeds up smoothly again before the stage releases.
      win.style.transform = `translate3d(0, ${softPinOffset(r.top, r.height, vh).toFixed(2)}px, 0)`;
      const s = -r.top - ARRIVE * vh; // px scrolled since part 1 settled in the centre
      // Part 1 starts typing the moment it enters at the bottom of the screen.
      const part1On = r.top < 0.02 * vh && s < HOLD * vh;
      const intro = clamp((s - (HOLD + 0.25) * vh) / ((INTRO - 0.25) * vh));
      const target = clamp((s - (HOLD + INTRO) * vh) / (DIAGRAM * vh));
      const outro = clamp((s - (HOLD + INTRO + DIAGRAM) * vh) / (OUTRO * vh));

      if (outro !== lastOutro) {
        lastOutro = outro;
        part2.style.opacity = clamp(1 - outro / 0.6).toFixed(3);
      }

      const pinned = r.top <= 1 && r.bottom > 0;
      const shown = pinned && intro >= 0.5 && outro < 0.3;
      const next: View = {
        part1: part1On,
        part2: shown,
        part3: pinned && outro >= 0.5,
        step: pipe.chapter(target),
        notes: shown ? [...pipe.visible(target, intro)].join(' ') : '',
      };
      if (next.part1 !== last.part1 || next.part2 !== last.part2 || next.part3 !== last.part3 || next.step !== last.step || next.notes !== last.notes) {
        last = next;
        setView(next);
      }

      // Hidden until the draw-in starts: zero-length pen strokes would still show their caps as dots.
      const drawn = intro > 0 ? 'visible' : 'hidden';
      if (svg.style.visibility !== drawn) svg.style.visibility = drawn;

      if (intro > 0 && outro < 1) {
        // Phones only: zoom the camera in inside each stage so labels stay legible. (Above
        // that the stages keep the overview's scale, so all four views line up.)
        const boost = Math.max(1, 560 / Math.max(1, svg.clientWidth));
        pipe.render(reduce.matches ? 0 : (now - start) / 1000, target, boost, reduce.matches, intro);
      }
    };

    const loop = (now: number) => {
      update(now);
      raf = running ? requestAnimationFrame(loop) : 0;
    };
    const startLoop = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    const stopLoop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : (stopLoop(), update(performance.now()))),
      { rootMargin: '0px 0px 50% 0px' },
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

  // Measure each note's real text box so leaders start from the text edge.
  useEffect(() => {
    const box = notesRef.current;
    if (!box || !notes.length) return;
    const measure = () => {
      const b = box.getBoundingClientRect();
      if (!b.width) return;
      const k = 1200 / b.width;
      const rects: Record<string, number[]> = {};
      box.querySelectorAll<HTMLElement>('[data-note]').forEach((el) => {
        const t = el.querySelector('.xtw')?.getBoundingClientRect();
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

  const { part1, part2, part3, step } = view;
  const on = new Set(view.notes.split(' '));

  return (
    <section
      ref={sectionRef}
      id="research"
      className="xp-s2"
      aria-label="Algorithm research"
      data-softpin=""
      style={{ height: `${(1 + ARRIVE + HOLD + INTRO + DIAGRAM + OUTRO + TAIL + LEAVE) * 100}svh` }}
    >
      <div className="xp-stage">
        <div className="xp-col xp-window" ref={windowRef}>
          <div className="xp-part1">
            <TokenText text={PART1} show={part1} delay={0} probs />
          </div>

          <div className="xp-part2" ref={part2Ref}>
            <div className="xp-steps" aria-live="polite">
              <TokenText as="span" className="xp-step" text={STEPS[step]} show={part2} delay={120} probs />
            </div>
            <div className="xpipe">
              <svg
                ref={svgRef}
                className="cam"
                viewBox="0 0 1200 560"
                role="img"
                aria-label="Diagram of the X For You pipeline: posts are sourced, scored and selected into the feed"
              />
              <div className="xp-notes" ref={notesRef}>
                {notes.map((n) => (
                  <div
                    key={n.id}
                    data-note={n.id}
                    className="xp-note"
                    style={{ left: `${(n.x / 1200) * 100}%`, top: `${(n.y / 560) * 100}%`, width: `${(n.w / 1200) * 100}%` }}
                  >
                    <TokenText as="span" text={n.text} show={on.has(n.id)} delay={160} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="xp-part3">
            {/* long paragraph: only two probabilities, so it doesn't get busy */}
            <TokenText text={PART3} show={part3} delay={160} probs={2} />
          </div>
        </div>
      </div>
    </section>
  );
}
