'use client';

import { useEffect, useRef, type ElementType } from 'react';

/* Glitch text — characters decode out of random glyphs (a few lit in the accent
   blue), roughly left to right, and dissolve the same way on exit. Modelled on the
   supplied screen recording. Layout never shifts: hidden characters keep their
   real glyph but are transparent, and whitespace is never scrambled, so line
   wrapping is identical in every frame. Reduced motion: plain show/hide. */

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789<>/\\|=+*_-:;.,?!#%&[]{}';
const IN_MS = 720;
const OUT_MS = 420;
const SWAP_GAP_MS = 60;

type Props = {
  text: string;
  show: boolean;
  as?: ElementType;
  className?: string;
  /** delay before appearing, ms */
  delay?: number;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Deterministic per-character jitter so the reveal order is stable between runs. */
const jitter = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** p: 0 = fully hidden, 1 = fully resolved. tick changes the random glyphs. */
function frame(text: string, p: number, tick: number) {
  const n = Math.max(1, text.length);
  let html = '';
  let run = '';
  let runCls = '';
  const flush = () => {
    if (!run) return;
    html += runCls ? `<span class="${runCls}">${esc(run)}</span>` : esc(run);
    run = '';
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    let cls = '';
    let out = ch;
    if (!/\s/.test(ch)) {
      const start = 0.62 * (i / n) + 0.18 * jitter(i);
      const end = start + 0.2;
      if (p <= start) cls = 'g-h';
      else if (p < end) {
        const r = jitter(i * 7 + tick * 13);
        out = GLYPHS[Math.floor(r * GLYPHS.length)];
        cls = r < 0.14 ? 'g-b' : 'g-s';
      }
    }
    if (cls !== runCls) { flush(); runCls = cls; }
    run += out;
  }
  flush();
  return html;
}

export default function Glitch({ text, show, as: Tag = 'p', className, delay = 0 }: Props) {
  const inner = useRef<HTMLSpanElement>(null);
  const state = useRef({ shown: '', p: 0, raf: 0, timer: 0 });

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const st = state.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cancelAnimationFrame(st.raf);
    clearTimeout(st.timer);

    const paint = (t: string, p: number, tick: number) => { el.innerHTML = frame(t, p, tick); };

    const animate = (t: string, from: number, to: number, ms: number, done?: () => void) => {
      if (reduce) { st.p = to; paint(t, to, 0); done?.(); return; }
      const t0 = performance.now();
      const span = Math.abs(to - from) * ms || 1;
      const step = (now: number) => {
        const u = Math.min(1, (now - t0) / span);
        st.p = from + (to - from) * u;
        paint(t, st.p, Math.floor(now / 45));
        if (u < 1) st.raf = requestAnimationFrame(step);
        else done?.();
      };
      st.raf = requestAnimationFrame(step);
    };

    const enter = () => { st.shown = text; animate(text, st.p, 1, IN_MS); };

    if (!show) {
      if (st.p > 0) animate(st.shown || text, st.p, 0, OUT_MS);
      else paint(text, 0, 0);
      return;
    }
    if (st.p > 0 && st.shown && st.shown !== text) {
      // Text change while visible: dissolve the old line, then decode the new one.
      animate(st.shown, st.p, 0, OUT_MS, () => { st.timer = window.setTimeout(enter, SWAP_GAP_MS); });
    } else {
      st.shown = text;
      st.timer = window.setTimeout(enter, st.p > 0 ? 0 : delay);
    }
    return () => { cancelAnimationFrame(st.raf); clearTimeout(st.timer); };
  }, [text, show, delay]);

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span ref={inner} className="glitch" aria-hidden="true">
        <span className="g-h">{text}</span>
      </span>
    </Tag>
  );
}
