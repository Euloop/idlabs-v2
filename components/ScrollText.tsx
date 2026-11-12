'use client';

import { useEffect, useImperativeHandle, useRef, type ElementType, type Ref } from 'react';

/* Scroll-typed text: the page sets a progress (0 → 1) every frame and that many letters are
   shown, left to right; scrolling back un-types them. No cursor, no timers. Each letter eases
   from pale grey to ink as it appears. With `probs`, a faint probability sits under the word
   currently being written. Layout never shifts: every letter is in the DOM from the start,
   just transparent, so wrapping is identical at any progress and the text box can be measured
   any time. Driven imperatively (ref.set) so scrolling doesn't re-render React. */

export type ScrollTextHandle = { set: (p: number, text?: string) => void; light?: (q: number) => void };

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  probs?: boolean;
  /* a phrase to highlight: its words are kept on one line, and light(q) wipes a dark bar across
     its letters (0 → 1), each letter turning white as the bar passes (as "500M posts/week") */
  hl?: string;
  ref?: Ref<ScrollTextHandle>;
};

const rand = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

export default function ScrollText({ text, as: Tag = 'p', className, probs = false, hl, ref }: Props) {
  const inner = useRef<HTMLSpanElement>(null);
  const srRef = useRef<HTMLSpanElement>(null);
  const st = useRef({ built: '', chars: [] as HTMLElement[], words: [] as HTMLElement[], wordOf: [] as number[], n: 0, pw: -1, p: 0, hlc: [] as HTMLElement[], m: 0 });

  const build = (t: string) => {
    const el = inner.current;
    if (!el) return;
    const s = st.current;
    el.textContent = '';
    s.chars = []; s.words = []; s.wordOf = []; s.hlc = []; s.m = 0;
    const h0 = hl ? t.indexOf(hl) : -1, h1 = h0 + (hl?.length ?? 0);
    let group: HTMLElement | null = null, pos = 0;
    (t.match(/\S+\s*|\s+/g) ?? []).forEach((w) => {
      const w0 = pos, w1 = pos + w.length;
      pos = w1;
      // the highlighted phrase's words go into one no-wrap group
      const inHl = h0 >= 0 && w0 < h1 && w1 > h0;
      if (inHl && !group) { group = document.createElement('span'); group.className = 'tc-hlg'; el.appendChild(group); }
      if (!inHl) group = null;
      const ws = document.createElement('span');
      ws.className = 'tw-w';
      const wi = s.words.length;
      for (const ch of w) {
        const c = document.createElement('span');
        c.className = 'tc';
        c.textContent = ch;
        const at = w0 + ws.childNodes.length;
        if (h0 >= 0 && at >= h0 && at < h1) { c.classList.add('tc-hl'); s.hlc.push(c); }
        ws.appendChild(c);
        s.chars.push(c);
        s.wordOf.push(wi);
      }
      (group ?? el).appendChild(ws);
      s.words.push(ws);
    });
    s.hlc[0]?.classList.add('tc-hl-a');
    s.hlc[s.hlc.length - 1]?.classList.add('tc-hl-b');
    s.built = t; s.n = 0; s.pw = -1;
    if (srRef.current) srRef.current.textContent = t;
  };

  const set = (p: number, t?: string) => {
    const s = st.current;
    if (t !== undefined && t !== s.built) build(t);
    else if (!s.built) build(text);
    s.p = p;
    const n = Math.round(Math.max(0, Math.min(1, p)) * s.chars.length);
    if (n !== s.n) {
      if (n > s.n) for (let i = s.n; i < n; i++) s.chars[i].classList.add('on');
      else for (let i = n; i < s.n; i++) s.chars[i].classList.remove('on');
      s.n = n;
    }
    if (probs) {
      // the word being written carries a faint probability; none once the line is complete
      const w = n > 0 && n < s.chars.length ? s.wordOf[n - 1] : -1;
      if (w !== s.pw) {
        if (s.pw >= 0) s.words[s.pw]?.querySelector('.tk-p')?.remove();
        if (w >= 0) {
          const e = document.createElement('span');
          e.className = 'tk-p tk-s';
          e.textContent = (0.04 + 0.28 * rand(w + s.chars.length)).toFixed(2);
          s.words[w].appendChild(e);
        }
        s.pw = w;
      }
    }
  };

  const light = (q: number) => {
    const s = st.current;
    const m = Math.round(Math.max(0, Math.min(1, q)) * s.hlc.length);
    if (m === s.m) return;
    if (m > s.m) for (let i = s.m; i < m; i++) s.hlc[i].classList.add('lit');
    else for (let i = m; i < s.m; i++) s.hlc[i].classList.remove('lit');
    s.m = m;
  };
  useImperativeHandle(ref, () => ({ set, light }));
  useEffect(() => { build(text); set(st.current.p); }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Tag className={className}>
      <span className="sr-only" ref={srRef}>{text}</span>
      <span ref={inner} className="tw" aria-hidden="true">
        <span className="tc">{text}</span>
      </span>
    </Tag>
  );
}
