'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { PHI, landscapeCuts, portraitCuts, type Square } from './golden';
import { IDENTITY, LABS, WORDMARK_H, WORDMARK_W } from './wordmark-paths';
import './footer-golden.css';

/* /footer: the golden ratio in the footer, above the links. Variants (SiteFooter's `golden`, tabs
   ?golden=):
     spiral    the hero's construction laid on its side across the footer; the spiral draws in as you
               scroll down to the footer and ends at its eye, where the logo draws
     compound  the spiral as growth: each turn is φ× the last, as the Fibonacci numbers are — labelled
               as views from the eye out (… 377M, 610M, 987M, 1.6B), it draws outward with the scroll
               while a counter climbs from 13M to 2B+, finishing as the page reaches its end
     focus     the cleanest: the golden rectangle, two hairlines across it at the golden section
               (0.618 across, 0.382 down), the frame's square where they cross, and the closing line
               set in the bottom square, from its left edge. The
               construction turned over (bottom up), so its first two cuts are those lines: the spiral
               draws in from them and curls into the upper right.
     reel      the loader's golden half, slowed down: the images cut under the spiral, captioned
     trace     interactive: point at a square and the spiral draws out to it, its ratio read out
   All on the footer's dark ground, the construction in the hero's 12% lines. Type: Season Mix for
   the statements, IBM Plex Mono for everything else — no sans. */

export type GoldenVariant = 'spiral' | 'compound' | 'focus' | 'reel' | 'trace';

const W = 1000;
const H = W / PHI;
const LAND = landscapeCuts(0, 0, W, H, 10);
const pc = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
const vars = (v: Record<string, string | number>) => v as CSSProperties;

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => setR(matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  return r;
}

/** true while the element is at least `amount` on screen */
function useOnScreen(ref: RefObject<Element | null>, amount = 0.3) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: amount });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount]);
  return on;
}

/** The wordmark, one path per letter, drawn (outline, then fill) when a parent has [data-draw]. */
function Mark({ className = '' }: { className?: string }) {
  return (
    <svg className={`fg-ink ${className}`} viewBox={`0 0 ${WORDMARK_W} ${WORDMARK_H}`} role="img" aria-label="Identity Labs">
      {[...IDENTITY, ...LABS].map((d, i) => <path key={i} d={d} pathLength={1} style={vars({ '--i': i })} />)}
    </svg>
  );
}

/** The landscape construction's lines: the outer rectangle and each cut. */
function Lines({ stagger = false }: { stagger?: boolean }) {
  return (
    <g className="fg-lines">
      <rect x={0} y={0} width={W} height={H} vectorEffect="non-scaling-stroke" />
      {LAND.lines.map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" style={stagger ? vars({ '--i': i + 1 }) : undefined} />)}
    </g>
  );
}

/* A square's corner away from its arc's centre (clear of the spiral), for labels. Landscape cuts go
   left, top, right, bottom. */
const OUTER = ['tl', 'tr', 'br', 'bl'] as const;
function at(sq: Square, corner: 'tl' | 'tr' | 'br' | 'bl'): CSSProperties {
  return {
    left: pc(sq.x, W), top: pc(sq.y, H), width: pc(sq.s, W), height: pc(sq.s, H),
    alignItems: corner[1] === 'l' ? 'flex-start' : 'flex-end',
    justifyContent: corner[0] === 't' ? 'flex-start' : 'flex-end',
    textAlign: corner[1] === 'l' ? 'left' : 'right',
  };
}
const ratio = (i: number) => (PHI ** -i).toFixed(3);
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const power = (i: number) => `φ${i ? '⁻' : ''}${String(i).split('').map((c) => SUP[+c]).join('')}`;

function Closing({ body }: { body?: string }) {
  return (
    <>
      <p className="fg-say">Distribution,<br />built on research.</p>
      {body && <p className="fg-body">{body}</p>}
      <p className="fg-cta"><a href="#">Start a project <span aria-hidden="true">→</span></a></p>
    </>
  );
}

/* ───────── Spiral: drawn by the scroll ───────── */
function SpiralBand() {
  const ref = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGPathElement>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      // 0 as the band's top comes on screen, 1 by the time most of it has (reachable at the page's end)
      const p = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.95 - r.top) / (r.height * 0.9)));
      el.style.setProperty('--p', p.toFixed(4));
      if (arc.current) arc.current.style.strokeDashoffset = String(1.02 * (1 - p));
      setDone(p > 0.97);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); };
  }, []);
  const eye = LAND.squares[7];
  return (
    <div className="fg fg-spiral" ref={ref} data-draw={done || undefined}>
      <div className="fg-box">
        <svg className="fg-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <Lines stagger />
          <path ref={arc} className="fg-arc" d={LAND.spiral} pathLength={1} />
        </svg>
        {LAND.squares.slice(0, 3).map((sq, i) => (
          <span className="fg-at fg-label" key={i} style={at(sq, OUTER[i % 4])}>{String(i + 1).padStart(2, '0')} · {ratio(i)}</span>
        ))}
        <div className="fg-at fg-copy" style={at(LAND.squares[0], 'bl')}><Closing /></div>
        {/* the eye: the logo, centred on the spiral's last turns */}
        <div className="fg-eye" style={{ left: pc(eye.x + eye.s / 2, W), top: pc(eye.y + eye.s / 2, H) }}><Mark /></div>
      </div>
    </div>
  );
}

/* ───────── Compound: the spiral as growth ───────── */
// Each square is φ× the one inside it, as each Fibonacci number is (nearly) φ× the one before. Read
// from the eye out as millions of views: 13M at the eye, 21M, 34M … 987M, and 1.6B for the whole.
const FIB = [1597, 987, 610, 377, 233, 144, 89, 55, 34, 21]; // square 0 (the whole) … 9 (the innermost), in M
const fmt = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)}B` : `${Math.round(m)}M`);
// how far along the outward spiral (0–1) each square's arc is complete: arc length goes with its side
const TOTAL = LAND.squares.reduce((a, q) => a + q.s, 0);
const DONE = LAND.squares.map((_, i) => LAND.squares.slice(i).reduce((a, q) => a + q.s, 0) / TOTAL);
const START = 13; // M, at the eye
const GROW = 10.5; // turns at ×φ: 13M × φ^10.5 ≈ 2.03B — so "2B+" at the end
function CompoundBand() {
  const ref = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGPathElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, shown = '';
    const measure = () => {
      raf = 0;
      // 0 as the band's top comes on (95% down the screen), 1 at the very end of the page
      const vh = innerHeight;
      const from = el.getBoundingClientRect().top + scrollY - vh * 0.95;
      const to = document.documentElement.scrollHeight - vh - 2; // (2px slack: the end may round short)
      const p = reduce ? 1 : Math.min(1, Math.max(0, (scrollY - from) / Math.max(1, to - from)));
      el.style.setProperty('--p', p.toFixed(4));
      if (arc.current) arc.current.style.strokeDashoffset = String(1.02 * (1 - p));
      // the counter: 13M at the eye, ×φ a turn, 2B+ as the last turn closes
      const t = p >= 1 ? '2B+' : fmt(START * PHI ** (GROW * p));
      if (t !== shown && count.current) { shown = t; count.current.textContent = t; }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); };
  }, []);
  return (
    <div className="fg fg-compound" ref={ref}>
      <div className="fg-box">
        <svg className="fg-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <Lines />
          <path ref={arc} className="fg-arc" d={LAND.outward} pathLength={1} />
        </svg>
        {LAND.squares.slice(0, 4).map((sq, i) => (
          <span className="fg-at fg-label fg-c-fib" key={i} style={{ ...at(sq, OUTER[i % 4]), ...vars({ '--t': DONE[i].toFixed(3) }) }}>{fmt(FIB[i])}</span>
        ))}
        <div className="fg-at fg-c-count" style={at(LAND.squares[0], 'bl')}>
          <span className="fg-c-num" ref={count}>13M</span>
          <span className="fg-label">Views, ×1.618 a turn</span>
        </div>
        <div className="fg-at fg-copy fg-c-copy" style={at(LAND.squares[1], 'bl')}>
          <p className="fg-say">Attention compounds.</p>
          <p className="fg-body">Each turn of the spiral is 1.618× the last, as the Fibonacci numbers are. Reach that spreads grows the same way.</p>
          <p className="fg-cta"><a href="#">Start a project <span aria-hidden="true">→</span></a></p>
        </div>
      </div>
    </div>
  );
}

/* ───────── Focus: the golden section, and nothing else ───────── */
const FX = 1 / PHI;     // 0.618 across
const FY = 1 - 1 / PHI; // 0.382 down
// Focus's figure notes: the spiral's pole (where it converges) — the innermost square's centre,
// turned over as the drawing is — as fractions of the width and height
const EYE = LAND.squares[LAND.squares.length - 1];
const POLE = { x: (EYE.x + EYE.s / 2) / W, y: 1 - (EYE.y + EYE.s / 2) / H };
// the first three squares, turned over (their outer corner, clear of each arc): A the whole height,
// B under the crossing, C top right
const SQ_NOTES: { name: string; r: string; style: CSSProperties }[] = [
  { name: 'A', r: '1.000', style: { left: 0, bottom: 0 } },
  { name: 'B', r: '0.618', style: { right: 0, bottom: 0, textAlign: 'right' } },
  { name: 'C', r: '0.382', style: { right: 0, top: 0, textAlign: 'right' } },
];
const DIM = -20; // the dimension lines, this far outside the rectangle (in its units ≈ px)

function FocusBand() {
  const ref = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGPathElement>(null);
  // Drawn by the scroll, not a timer (so never behind a fast scroll): --p 0 as the rectangle's top
  // comes on screen (90% down), 1 once the whole of it is on, or at the page's end if that is sooner.
  // The stages are in footer-golden.css; the spiral's dash is set here (.2–.95 of the way).
  useEffect(() => {
    const el = ref.current, box = el?.querySelector<HTMLElement>('.fg-box');
    if (!el || !box) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = innerHeight, r = box.getBoundingClientRect();
      const from = r.top + scrollY - vh * 0.9;
      const to = Math.min(from + r.height, document.documentElement.scrollHeight - vh - 2);
      const p = reduce ? 1 : Math.min(1, Math.max(0, (scrollY - from) / Math.max(1, to - from)));
      el.style.setProperty('--p', p.toFixed(4));
      const q = Math.min(1, Math.max(0, (p - 0.2) / 0.75));
      if (arc.current) arc.current.style.strokeDashoffset = String(1.02 * (1 - q));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); };
  }, []);
  const x = pc(FX, 1), y = pc(FY, 1);
  const fx = FX * W;
  return (
    <div className="fg fg-focus" ref={ref}>
      <div className="fg-box">
        {/* the spiral (the construction turned over: its first cuts at 0.618 across, 0.382 down) */}
        <svg className="fg-svg fg-f-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {/* the golden rectangle itself: the bounding box the hairlines run across */}
          <rect className="fg-f-rect" x={0} y={0} width={W} height={H} vectorEffect="non-scaling-stroke" />
          <g transform={`translate(0 ${H}) scale(1 -1)`}>
            <g className="fg-lines">
              {LAND.lines.slice(2).map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" />)}
            </g>
            <path ref={arc} className="fg-arc fg-f-arc" d={LAND.spiral} pathLength={1} />
          </g>
          {/* a dimension line, as on a drawing: across the top (0.618 | 0.382 of the width), ticked at
              the ends and the cut */}
          <g className="fg-f-dims">
            <path d={`M0 ${DIM}H${W}` + [0, fx, W].map((t) => `M${t} ${DIM - 5}v10`).join('')} vectorEffect="non-scaling-stroke" />
          </g>
          {/* the pole: a small cross where the spiral converges */}
          <path className="fg-f-pole" d={`M${POLE.x * W - 6} ${POLE.y * H}h12M${POLE.x * W} ${POLE.y * H - 6}v12`} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="fg-f-v" style={{ left: x }} aria-hidden="true" />
        <span className="fg-f-h" style={{ top: y }} aria-hidden="true" />
        {/* the frame's square where they cross */}
        <span className="fg-f-tick" style={{ left: x, top: y }} aria-hidden="true" />
        {/* the figure's notes, small and faint: the measures, the formula, the squares, the points */}
        <div className="fg-f-notes" aria-hidden="true">
          <span className="fg-label fg-f-dx" style={{ left: pc(FX / 2, 1) }}>0.618</span>
          <span className="fg-label fg-f-dx" style={{ left: pc(FX + (1 - FX) / 2, 1) }}>0.382</span>
          <span className="fg-label fg-f-formula">φ = (1 + √5) / 2 ≈ 1.6180339887<br />a / b = (a + b) / a = φ</span>
          <span className="fg-label fg-f-p" style={{ right: pc(1 - FX, 1), bottom: pc(1 - FY, 1) }}>P (0.618, 0.382)</span>
          {SQ_NOTES.map((q) => <span className="fg-label fg-f-sq" key={q.name} style={q.style}>{q.name} · {q.r}</span>)}
        </div>
        {/* in the bottom square (right of 0.618, under 0.382), set from its left edge, up by the
            crossing: inside the spiral's arc there */}
        <div className="fg-f-copy" style={{ left: x, top: y }}>
          <p className="fg-say">Built on research.<br />Engineered to spread.</p>
          <p className="fg-body">We reverse engineer how X and LinkedIn distribute, and build what makes launches travel.</p>
          <p className="fg-cta"><a href="#">Start a project <span aria-hidden="true">→</span></a></p>
        </div>
        <p className="fg-label fg-f-note">Fig. 01 — The golden section: where the eye comes to rest.</p>
      </div>
    </div>
  );
}

/* ───────── Reel: the loader's golden half, slowed ───────── */
const G_W = 126.5;
const G_H = 200;
const POR = portraitCuts(4, 4, 192 / PHI, 192, 10);
const REEL: [string, string][] = [
  ['black', 'The construction'],
  ['m51', 'M51, the Whirlpool Galaxy'],
  ['eiffel', 'The Eiffel Tower, 1889'],
  ['katrina', 'Hurricane Katrina, 2005'],
  ['mona', 'Mona Lisa, Leonardo'],
  ['whirlpool', 'M51 and its companion'],
  ['birds', 'Birds in flight'],
  ['solar', 'The solar system'],
  ['pearl', 'Girl with a Pearl Earring, Vermeer'],
  ['m74', 'M74, the Phantom Galaxy'],
  ['begonia', 'A begonia leaf'],
];
const REEL_MS = 1600;
function ReelBand() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref, 0.3);
  const reduce = useReducedMotion();
  const [k, setK] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!on || reduce || held) return;
    const t = window.setInterval(() => setK((v) => (v + 1) % REEL.length), REEL_MS);
    return () => window.clearInterval(t);
  }, [on, reduce, held]);
  return (
    <div className="fg fg-reel" ref={ref} data-draw={on || undefined}>
      <div className="fg-reel-copy">
        <p className="fg-say">Proportion,<br />found everywhere.</p>
        <p className="fg-body">From galaxies to storms to portraits. We look for the same patterns in what spreads.</p>
        <p className="fg-cta"><a href="#">Start a project <span aria-hidden="true">→</span></a></p>
      </div>
      <div className="fg-reel-frame">
        {REEL.map(([g], i) => (
          <img key={g} src={`/assets/loader/golden/${g}.webp`} width={253} height={400} alt="" data-on={i === k || undefined} decoding="async" loading="lazy" />
        ))}
        <svg className="fg-reel-spiral" viewBox={`0 0 ${G_W} ${G_H}`} aria-hidden="true">
          <g className="fg-reel-lines">
            <rect x={4} y={4} width={192 / PHI} height={192} />
            <path d={POR.lines.join('')} />
          </g>
          <path className="fg-reel-arc fg-reel-edge" d={POR.spiral} pathLength={1} />
          <path className="fg-reel-arc" d={POR.spiral} pathLength={1} />
        </svg>
      </div>
      <ol className="fg-reel-list" onMouseLeave={() => setHeld(false)}>
        {REEL.map(([g, name], i) => (
          <li key={g}>
            <button type="button" aria-pressed={i === k} onMouseEnter={() => { setHeld(true); setK(i); }} onFocus={() => { setHeld(true); setK(i); }} onClick={() => setK(i)}>
              <span className="fg-reel-n">{String(i + 1).padStart(2, '0')}</span>{name}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ───────── Trace: the spiral follows the pointer ───────── */
function TraceBand() {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const n = LAND.squares.length;
  const pick = (e: PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    const i = LAND.squares.findIndex((s) => x >= s.x && x <= s.x + s.s && y >= s.y && y <= s.y + s.s);
    setActive(i < 0 ? n - 1 : i);
  };
  const shown = active ?? n - 1;
  const sq = active === null ? null : LAND.squares[active];
  return (
    <div className="fg fg-trace" data-draw="">
      <div className="fg-box" ref={box} onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setActive(null)}>
        <svg className="fg-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {sq && <rect className="fg-trace-sq" x={sq.x} y={sq.y} width={sq.s} height={sq.s} />}
          <Lines />
          {LAND.arcs.map((d, i) => (
            <path key={i} className="fg-arc fg-trace-arc" d={d} pathLength={1} data-on={i <= shown || undefined}
              style={vars({ '--d': `${active === null ? i * 60 : Math.max(0, i - (shown - 3)) * 70}ms` })} />
          ))}
        </svg>
        <div className="fg-at fg-trace-read" style={at(LAND.squares[0], 'bl')} aria-live="polite">
          <span className="fg-label">{active === null ? 'The golden ratio' : `Square ${String(active + 1).padStart(2, '0')} of ${n}`}</span>
          <span className="fg-trace-num">{active === null ? '1.618' : ratio(active)}</span>
          <span className="fg-label">{active === null ? 'Point at a square' : `${power(active)} of the whole`}</span>
        </div>
        <div className="fg-at fg-copy fg-trace-cta" style={at(LAND.squares[1], 'bl')}>
          <Closing body="We find the patterns that make attention compound, and build the systems that repeat them." />
        </div>
      </div>
    </div>
  );
}

export default function FooterGolden({ variant }: { variant: GoldenVariant }): ReactNode {
  switch (variant) {
    case 'spiral': return <SpiralBand />;
    case 'compound': return <CompoundBand />;
    case 'focus': return <FocusBand />;
    case 'reel': return <ReelBand />;
    case 'trace': return <TraceBand />;
  }
}
