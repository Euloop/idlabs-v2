'use client';

import { useEffect, useRef } from 'react';
import OptionTabs, { useOption } from './OptionTabs';
import { addSettleZones } from './settle';

/* /home-2: the research lab's line on its own screen, between Section 2 and the research papers.
   One short centred column of 12px mono caps. The stage pins while the line types in with the
   scroll (letter by letter, the site's .tc letters), then a black bar wipes across
   "1B+ views worth of posts" and each letter it passes turns white. Scrolling back un-does both.
   The stage is half a screen, held mid-screen (flow.css); the papers after it come up only as it lets go. Two sizes, 12px or 20px (bottom tabs; ?lab=). */

type Size = 'small' | 'large';
const SIZES: [Size, string][] = [['small', '12px'], ['large', '20px']];

const PRE = 'We backpropagate ';
const HL = '1B+ views worth of posts';
const POST =
  ' to analyse how the algorithm treats each post as it goes through the sourcing and ranking stages. The dominant patterns that emerge fine-tune our approach and ensure every post or launch we do goes consistently\u00a0viral.'; // (no orphan: the last two words kept together)
const TEXT = PRE + HL + POST;

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
// tabs while the held stage covers the middle of the screen
const held = (r: DOMRect, vh: number) => r.top <= vh * 0.5 && r.bottom >= vh * 0.5;

// `fixed`: no tabs (the live home page), the default size
export default function ResearchLab({ fixed = false }: { fixed?: boolean } = {}) {
  const ref = useRef<HTMLElement>(null);
  const hlRef = useRef<HTMLSpanElement>(null);
  const [size, pick] = useOption<Size>('lab', SIZES, 'small');

  useEffect(() => {
    const sec = ref.current;
    const hl = hlRef.current;
    if (!sec || !hl) return;
    const chars = Array.from(sec.querySelectorAll<HTMLElement>('.rl-text .tc'));
    const lit = Array.from(hl.querySelectorAll<HTMLElement>('.tc'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let n = 0, m = 0, raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = sec.getBoundingClientRect();
      // 0 → 1 as the section comes up (its top from the bottom of the screen to where the
      // half-screen stage holds, 25% down), then 1 → 2 over the held stretch
      const s = clamp((vh - r.top) / (0.75 * vh)) + clamp((0.25 * vh - r.top) / Math.max(1, r.height - 0.5 * vh));

      const type = reduce ? 1 : range(s, 0.55, 1.35);
      const bar = reduce ? 1 : range(s, 1.4, 1.8);
      const nn = Math.round(type * chars.length);
      if (nn !== n) {
        for (let i = Math.min(n, nn); i < Math.max(n, nn); i++) chars[i].classList.toggle('on', nn > n);
        n = nn;
      }
      hl.style.setProperty('--hl', bar.toFixed(4));
      const mm = Math.round(bar * lit.length);
      if (mm !== m) {
        for (let i = Math.min(m, mm); i < Math.max(m, mm); i++) lit[i].classList.toggle('lit', mm > m);
        m = mm;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // Phones (flow/settle.ts): from coming on screen until the line is typed and its bar across (s 1.8: the
    // section's top 0.55 screens above the screen's) — a swipe stopping part way glides on to the finished line
    const offSettle = addSettleZones(() => {
      const vh = window.innerHeight, top = sec.getBoundingClientRect().top + window.scrollY;
      return [[top - vh, top + 0.55 * vh]];
    });
    return () => { offSettle(); cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const letters = (t: string) => Array.from(t).map((c, i) => <span key={i} className="tc">{c}</span>);
  return (
    <section ref={ref} className="rl" data-size={size} data-foot="/Research lab" aria-label="Our research lab">
      <div className="rl-pin">
        <div className="frame rl-frame">
          <p className="rl-text">
            <span className="sr-only">{TEXT}</span>
            <span aria-hidden="true">
              {letters(PRE)}
              <span ref={hlRef} className="rl-hl">{letters(HL)}</span>
              {letters(POST)}
            </span>
          </p>
        </div>
      </div>
      {!fixed && <OptionTabs groups={[{ label: 'Text size', options: SIZES, value: size, onChange: (v) => pick(v as Size) }]} selector="section.rl" label="Research lab options" when={held} />}
    </section>
  );
}
