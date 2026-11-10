'use client';

import { useEffect, useLayoutEffect, useRef, type ElementType } from 'react';

/* Typed text, no cursor: letters appear one by one, fast, each easing from pale grey to
   ink. With `probs`, a faint probability flashes under each word as it starts (a nod to a
   model writing). Exit is a short fade of the whole line. Layout never shifts: every
   letter is in the DOM from the start, just transparent, so wrapping is identical in every
   frame and the text box can be measured any time. `fade` shows everything at once (small
   chrome labels). `hold` keeps the text on screen for at least that long after it has
   finished typing, even if `show` turns off sooner (so a fast scroll can't skip it);
   `onHeld` reports when that time is up. Reduced motion: plain show/hide. */

const CHAR_MS = 18; // per letter on short lines
const MAX_MS = 1000; // whole line, however long
const OUT_MS = 220;
const PROB_MS = 650;

export type CharInfo = {
  /** ms this letter is late against its ideal time (letters land on animation frames) */
  lag: number;
  /** the probability shown under this letter's word, if any */
  prob?: number;
  /** first letter of a word */
  first: boolean;
};

type Props = {
  text: string;
  show: boolean;
  as?: ElementType;
  className?: string;
  /** delay before the first letter, ms */
  delay?: number;
  /** a faint probability under each word as it starts */
  probs?: boolean;
  /** no typing: the whole line fades in */
  fade?: boolean;
  /** minimum time on screen after typing finishes, ms */
  hold?: number;
  /** tuning (defaults are the site's): ms per letter, cap for a whole line,
      a probability on every Nth word (0 = none), how long each one shows */
  charMs?: number;
  maxMs?: number;
  probEvery?: number;
  probMs?: number;
  /** called as each letter appears (e.g. for a typing sound) */
  onChar?: (ch: string, info: CharInfo) => void;
};

const rand = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

export default function TokenText({ text, show, as: Tag = 'p', className, delay = 0, probs = false, fade = false, hold = 0, charMs = CHAR_MS, maxMs = MAX_MS, probEvery = 1, probMs = PROB_MS, onChar }: Props) {
  const inner = useRef<HTMLSpanElement>(null);
  const onCharRef = useRef(onChar);
  useLayoutEffect(() => { onCharRef.current = onChar; });
  const st = useRef({ built: '', count: 0, raf: 0, timers: [] as number[], doneAt: 0, typing: false });

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const s = st.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clear = () => {
      s.timers.forEach(clearTimeout); s.timers = []; cancelAnimationFrame(s.raf);
      // typing cut off (the text or `show` changed mid-line): nothing left to hold for
      if (s.typing) { s.typing = false; s.doneAt = performance.now() - hold; }
    };
    const later = (fn: () => void, ms: number) => { s.timers.push(window.setTimeout(fn, ms)); };
    clear();

    const chars = () => Array.from(el.querySelectorAll<HTMLElement>('.tc'));
    const build = (t: string) => {
      el.textContent = '';
      // words (with their trailing space) hold their letters, so line breaks stay at spaces
      (t.match(/\S+\s*|\s+/g) ?? []).forEach((w) => {
        const ws = document.createElement('span');
        ws.className = 'tw-w';
        for (const ch of w) {
          const c = document.createElement('span');
          c.className = 'tc';
          c.textContent = ch;
          ws.appendChild(c);
        }
        el.appendChild(ws);
      });
      s.built = t;
      s.count = 0;
      s.doneAt = 0;
      el.classList.remove('tk-out');
    };

    const type = () => {
      const cs = chars();
      el.classList.remove('tk-out');
      if (reduce || fade) { cs.forEach((c) => c.classList.add('on')); s.count = cs.length; s.doneAt = performance.now(); return; }
      // per-letter schedule with a small beat after punctuation
      const per = Math.min(charMs, maxMs / Math.max(1, cs.length));
      const at: number[] = [];
      let t = 0;
      cs.forEach((c) => { at.push(t); const ch = c.textContent!; t += per * (/[.:;?!]/.test(ch) ? 6 : ch === ',' ? 3 : 1); });
      const from = s.count;
      const t0 = performance.now() - (from ? at[Math.min(from, at.length - 1)] : 0);
      let wordIx = 0;
      let wordProb: number | undefined;
      s.typing = true;
      const step = (now: number) => {
        const e = now - t0;
        let n = s.count;
        while (n < cs.length && at[n] <= e) {
          const c = cs[n];
          c.classList.add('on');
          const first = c === c.parentElement!.firstElementChild && !!c.textContent!.trim();
          if (first) wordProb = undefined;
          const wi = probs && probEvery > 0 && first ? wordIx++ : -1;
          if (wi >= 0 && wi % probEvery === 0) {
            const p = document.createElement('span');
            p.className = 'tk-p';
            p.textContent = (0.04 + 0.28 * rand(wi + text.length)).toFixed(2);
            wordProb = Number(p.textContent);
            if (probMs !== PROB_MS) p.style.animationDuration = `${probMs}ms`;
            c.parentElement!.appendChild(p);
            later(() => p.remove(), probMs);
          }
          onCharRef.current?.(c.textContent!, { lag: e - at[n], prob: wordProb, first });
          n++;
        }
        s.count = n;
        if (n < cs.length) s.raf = requestAnimationFrame(step);
        else { s.typing = false; s.doneAt = performance.now(); }
      };
      s.raf = requestAnimationFrame(step);
    };

    const hide = (done?: () => void) => {
      if (s.count === 0) { done?.(); return; }
      el.classList.add('tk-out');
      later(() => {
        chars().forEach((c) => c.classList.remove('on'));
        el.querySelectorAll('.tk-p').forEach((p) => p.remove());
        s.count = 0;
        s.doneAt = 0;
        done?.();
      }, reduce ? 0 : OUT_MS);
    };

    /* hide, but not before the text has been typed and readable for `hold` ms */
    const hideHeld = (done?: () => void) => {
      if (!hold || reduce || s.count === 0) { hide(done); return; }
      const wait = () => {
        if (s.typing || !s.doneAt) { later(wait, 60); return; }
        const left = hold - (performance.now() - s.doneAt);
        if (left > 0) later(() => hide(done), left);
        else hide(done);
      };
      wait();
    };

    if (s.built !== text) {
      if (s.count > 0) hideHeld(() => { build(text); if (show) later(type, 80); });
      else { build(text); if (show) later(type, delay); }
    } else if (show) {
      if (s.count < chars().length || el.classList.contains('tk-out')) later(type, s.count > 0 ? 0 : delay);
    } else hideHeld();

    return clear;
  }, [text, show, delay, probs, fade, hold, charMs, maxMs, probEvery, probMs]);

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span ref={inner} className="tw" aria-hidden="true">
        <span className="tc">{text}</span>
      </span>
    </Tag>
  );
}
