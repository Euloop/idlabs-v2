'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollText, { type ScrollTextHandle } from '../ScrollText';
import { createPipeline } from '../pipeline/engine';
import '../pipeline/pipeline.css';
import { RESEARCH_LEAD } from './data';
import { clamp, follow, put, range, smooth, useScene } from './engine';

/* Scene 2 · The pipeline: the live site's scientific diagram (components/pipeline/engine.js, the
   same drawing as Section 2 on /), set loose in the room.
   The diagram draws itself in, then plays its whole story with the scroll — the globe of posts,
   the zoom in, sourcing (Thunder / Phoenix), scoring, selection into the feed — its callouts
   typing in as on the live page. The room stays clean: the diagram just floats (a slow drift, a
   3D tilt toward the pointer, no frame around it, its camera free to spill past its box), and
   the step lines play below in the serif.
   At the end the diagram lifts away and the research line takes the stage. */

const STEPS = [
  'The algorithm passes every post on X and LinkedIn through the same pipeline, scoring it on thousands of signals.',
  'The Sourcing module determines how many people see your post.',
  'The Ranking module then decides your post’s position in each feed.',
];
type Note = { id: string; text: string; x: number; y: number; w: number };

export default function Pipeline() {
  const ref = useRef<HTMLElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const notesBox = useRef<HTMLDivElement>(null);
  const steps = useRef<(HTMLParagraphElement | null)[]>([]);
  const lead = useRef<HTMLDivElement>(null);
  const pipe = useRef<ReturnType<typeof createPipeline> | null>(null);
  const noteRefs = useRef<Record<string, ScrollTextHandle | null>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const stepO = useRef([0, 0, 0]);
  const t0 = useRef(0);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const p = createPipeline(el);
    pipe.current = p;
    el.innerHTML = p.markup;
    setNotes(p.notes);
    p.render(0, 0, 1, false, 0);
    t0.current = performance.now() / 1000;
  }, []);

  // where each note's text really sits, so the leaders start from its edge (as on the live page)
  useEffect(() => {
    const box = notesBox.current;
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
      pipe.current?.setRects(rects);
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [notes]);

  useScene(ref, (p, f) => {
    const { vh, mobile, dt } = f;
    const pp = pipe.current;
    const t = f.reduce ? 0 : f.t;

    const intro = range(p, 0.02, 0.13); // the diagram draws itself in
    const P = range(p, 0.13, 0.85); // its story
    const out = smooth(range(p, 0.85, 0.92)); // it lifts away
    const lo = smooth(range(p, 0.9, 0.97)); // the research line

    // the diagram, floating
    const fo = (1 - out) * smooth(range(intro, 0, 0.15));
    const y = Math.sin(t * 0.45) * 7 - out * vh * 0.18 + (mobile ? -vh * 0.06 : -vh * 0.04);
    const x = Math.cos(t * 0.37) * 5;
    const s = 0.96 + 0.04 * smooth(intro) - out * 0.06;
    put(float.current, 'transform', `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), 0) perspective(1800px) rotateX(${(-f.my * 4).toFixed(2)}deg) rotateY(${(f.mx * 5).toFixed(2)}deg) scale(${s.toFixed(4)})`);
    put(float.current, 'opacity', fo.toFixed(3));
    put(float.current, 'visibility', fo < 0.01 ? 'hidden' : 'visible');
    if (pp && intro > 0 && out < 1) {
      const w = svg.current?.clientWidth || 1;
      pp.render(t - t0.current, P, Math.max(1, 760 / w), f.reduce, intro);
      const np = pp.noteProgress(P, intro) as Record<string, number>;
      for (const id in noteRefs.current) noteRefs.current[id]?.set(out > 0 ? 0 : clamp(((np[id] || 0) - 0.3) / 0.7));
    }

    // the step line under the diagram: overview, sourcing, ranking
    if (pp) {
      const { MID } = pp.timeline as { MID: number[] };
      const label = P < MID[0] ? 0 : P < MID[1] ? 1 : 2;
      STEPS.forEach((_, i) => {
        const target = i === label && intro > 0.5 && out < 0.5 ? 1 : 0;
        stepO.current[i] = f.reduce ? target : follow(stepO.current[i], target, 5, dt);
        const o = stepO.current[i];
        put(steps.current[i], 'opacity', o.toFixed(3));
        put(steps.current[i], 'transform', `translate3d(-50%, ${((1 - o) * (target ? 14 : -14)).toFixed(1)}px, 0)`);
        put(steps.current[i], 'filter', o > 0.99 || o < 0.01 ? 'none' : `blur(${((1 - o) * 6).toFixed(1)}px)`);
        put(steps.current[i], 'visibility', o < 0.01 ? 'hidden' : 'visible');
      });
    }

    put(lead.current, 'opacity', lo.toFixed(3));
    put(lead.current, 'transform', `translate3d(-50%, calc(-50% + ${((1 - lo) * 22).toFixed(1)}px), 0)`);
    put(lead.current, 'filter', lo > 0.99 || lo < 0.01 ? 'none' : `blur(${((1 - lo) * 8).toFixed(1)}px)`);
    put(lead.current, 'visibility', lo < 0.01 ? 'hidden' : 'visible');
  });

  return (
    <section className="im-scene im-pipe" ref={ref} id="im-pipeline" aria-label="The pipeline">
      <div className="im-stage">
        <div className="im-diagram" ref={float}>
          <div className="pipe">
            <svg
              ref={svg}
              className="cam"
              viewBox="0 0 1200 560"
              role="img"
              aria-label="Diagram of the X For You pipeline: posts are sourced, scored and selected into the feed"
            />
            <div className="s2-notes" ref={notesBox}>
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

        <div className="im-steps" aria-live="polite">
          {STEPS.map((x, i) => (
            <p key={i} className="im-say im-step" ref={(el) => { steps.current[i] = el; }} style={{ opacity: 0 }}>{x}</p>
          ))}
        </div>

        <div className="im-statement" ref={lead} style={{ opacity: 0 }}>
          <p className="im-say">{RESEARCH_LEAD}</p>
          <p className="im-sub"><a className="im-link" href="#im-research">Read our findings</a></p>
        </div>
      </div>
    </section>
  );
}
