'use client';

import { useEffect, useRef, type ElementType } from 'react';

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

type Props = {
  text: string;
  show: boolean;
  as?: ElementType;
  className?: string;
  /** delay before the first letter, ms */
  delay?: number;
  /** a faint probability under each word as it starts */
  /** true: a probability under every word; a number n: only n of them, spread evenly
      through the line (for long paragraphs, where one per word gets busy) */
  probs?: boolean | number;
  /** no typing: the whole line fades in */
  fade?: boolean;
  /** minimum time on screen after typing finishes, ms */
  hold?: number;
};

const rand = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

export default function TokenText({ text, show, as: Tag = 'p', className, delay = 0, probs = false, fade = false, hold = 0 }: Props) {
  const inner = useRef<HTMLSpanElement>(null);
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

    const chars = () => Array.from(el.querySelectorAll<HTMLElement>('.xtc'));
    const build = (t: string) => {
      el.textContent = '';
      // words (with their trailing space) hold their letters, so line breaks stay at spaces
      (t.match(/\S+\s*|\s+/g) ?? []).forEach((w) => {
        const ws = document.createElement('span');
        ws.className = 'xtw-w';
        for (const ch of w) {
          const c = document.createElement('span');
          c.className = 'xtc';
          c.textContent = ch;
          ws.appendChild(c);
        }
        el.appendChild(ws);
      });
      s.built = t;
      s.count = 0;
      s.doneAt = 0;
      el.classList.remove('xtk-out');
    };

    const type = () => {
      const cs = chars();
      el.classList.remove('xtk-out');
      if (reduce || fade) { cs.forEach((c) => c.classList.add('on')); s.count = cs.length; s.doneAt = performance.now(); return; }
      // per-letter schedule with a small beat after punctuation
      const per = Math.min(CHAR_MS, MAX_MS / Math.max(1, cs.length));
      const at: number[] = [];
      let t = 0;
      cs.forEach((c) => { at.push(t); const ch = c.textContent!; t += per * (/[.:;?!]/.test(ch) ? 6 : ch === ',' ? 3 : 1); });
      const from = s.count;
      const t0 = performance.now() - (from ? at[Math.min(from, at.length - 1)] : 0);
      let wordIx = 0;
      // which words get a probability: all, or n spread evenly through the line
      const wordCount = (text.match(/\S+/g) ?? []).length;
      const pick = typeof probs === 'number'
        ? new Set(Array.from({ length: probs }, (_, k) => Math.round(((k + 1) * wordCount) / (probs + 1))))
        : null;
      s.typing = true;
      const step = (now: number) => {
        const e = now - t0;
        let n = s.count;
        while (n < cs.length && at[n] <= e) {
          const c = cs[n];
          c.classList.add('on');
          if (probs && c === c.parentElement!.firstElementChild && c.textContent!.trim()) {
            const ix = wordIx++;
            if (!pick || pick.has(ix)) {
              const p = document.createElement('span');
              p.className = 'xtk-p';
              p.textContent = (0.04 + 0.28 * rand(ix + text.length)).toFixed(2);
              c.parentElement!.appendChild(p);
              later(() => p.remove(), 650);
            }
          }
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
      el.classList.add('xtk-out');
      later(() => {
        chars().forEach((c) => c.classList.remove('on'));
        el.querySelectorAll('.xtk-p').forEach((p) => p.remove());
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
      if (s.count < chars().length || el.classList.contains('xtk-out')) later(type, s.count > 0 ? 0 : delay);
    } else hideHeld();

    return clear;
  }, [text, show, delay, probs, fade, hold]);

  return (
    <Tag className={className}>
      <span className="xp-sr">{text}</span>
      <span ref={inner} className="xtw" aria-hidden="true">
        <span className="xtc">{text}</span>
      </span>
    </Tag>
  );
}
