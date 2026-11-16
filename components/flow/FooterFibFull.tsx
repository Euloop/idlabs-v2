'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import FibLines, { fibTiling, FW } from './FibLines';
import './footer-fib-full.css';

/* Footer "Fibonacci · full" (/home-4 and /footer, ?golden=fib-full; feedback 2026-11-16): the Fibonacci
   footer with its construction whole and faint inside the frame, rule to rule — the 13 × 8 tiling, its
   circles, section lines and diagonals (FibLines) — and over it the statement (top left) and the links
   box (`children`, its bottom on the drawing's bottom), then the closing bar under it.
   The golden spiral over the tiling draws in once, the first time the footer comes on screen; the lines
   are simply there. Point anywhere on it (the links too) and the square under the pointer lights, the
   spiral draws out to it over the dimmed whole, and the small figures read it out — just above the links,
   on the left: the sequence with that square's number marked, its ratio to the one before, and φ. Each
   square carries its number, small, in its corner. */

// 55 × 34, nine squares (34, 21, 13, 8, 5, 3, 2, 1, 1): the spiral three turns deeper than the 13 × 8
// the loader uses; turned upside down, the small squares top right (feedback 2026-11-16)
const T = fibTiling(9);
const FH = T.H;
const N = T.squares.length;
const PHI = (1 + Math.sqrt(5)) / 2;
const SEQ = T.seq;
// square i (largest first) ↔ its place in SEQ
const seqAt = (i: number) => N - 1 - i;
// the squares big enough to carry their number (3 and up: ~70px at 1056 wide)
const LABELLED = T.squares.filter((q) => q.n >= 3).length;
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

// `say` false (Fibonacci · low): no statement — the open part only the drawing and the read-out
export default function FooterFibFull({ children, say = true }: { children?: ReactNode; say?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // the spiral's draw-in: once, the first time a fifth of it is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.setAttribute('data-drawn', ''); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.setAttribute('data-drawn', ''); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (e: PointerEvent) => {
    const r = ref.current?.querySelector('.fff-art')?.getBoundingClientRect(); // the drawing itself (the box may be taller)
    if (!r) return;
    // (turned over: the pointer's y read from the bottom)
    const x = ((e.clientX - r.left) / r.width) * FW, y = FH - ((e.clientY - r.top) / r.height) * FH;
    const i = T.squares.findIndex((q) => x >= q.x && x <= q.x + q.s && y >= q.y && y <= q.y + q.s);
    setActive(i < 0 ? null : i);
  };

  const sq = active === null ? null : T.squares[active];
  const k = active === null ? null : seqAt(active);
  const ratio = k === null || k === 0 ? null : SEQ[k] / SEQ[k - 1];

  return (
    <div className={say ? 'fff' : 'fff fff-low'} ref={ref} onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setActive(null)}>
      <div className="fff-art" aria-hidden="true">
        <FibLines className="fff-lines" depth={9} flip />
        <svg className="fff-over" viewBox={`0 0 ${FW} ${+FH.toFixed(2)}`} preserveAspectRatio="none">
          <g transform={`translate(0 ${FH}) scale(1 -1)`}>
          {sq && <rect className="fff-lit" x={sq.x} y={sq.y} width={sq.s} height={sq.s} vectorEffect="non-scaling-stroke" />}
          {/* the whole spiral (drawn in once); then the arcs out to the square pointed at, outside in */}
          <path className="fff-arc fff-arc-all" d={T.arcs.join('').replace(/(?!^)M[\d. ]+/g, '')} pathLength={1} data-dim={active !== null || undefined} />
          {T.arcs.map((d, i) => (
            <path key={i} className="fff-arc fff-arc-on" d={d} pathLength={1} data-on={(active !== null && i <= active) || undefined}
              style={{ '--d': `${i * 60}ms` } as CSSProperties} />
          ))}
          </g>
        </svg>
        <div className="fff-nums">
          {T.squares.slice(0, LABELLED).map((q, i) => (
            <span key={i} className="fff-n" data-on={active === i || undefined} style={{ left: pct(q.x, FW), top: pct(FH - q.y - q.s, FH) }}>{q.n}</span>
          ))}
        </div>
      </div>

      <div className="fff-top">
        {say ? (
          <div className="fff-say fg">
            <p className="fg-say">Built on research.<br />Engineered to spread.</p>
            <p className="fg-body">We reverse engineer how X and LinkedIn distribute, and build what makes launches travel.</p>
          </div>
        ) : <span />}
        {/* the small figures, bottom right of the open part, just above the links */}
        <div className="fff-read" aria-live="polite">
          <span className="fff-seq">
            {SEQ.map((n, i) => <span key={i} data-on={k === i || undefined} data-prev={(k !== null && k > 0 && i === k - 1) || undefined}>{n}</span>)}
          </span>
          <span className="fff-rule">
            {k === null ? 'Fₙ = Fₙ₋₁ + Fₙ₋₂' : `Square ${String(active! + 1).padStart(2, '0')} of ${String(N).padStart(2, '0')} · F${k + 1} = ${SEQ[k]}`}
          </span>
          <span className="fff-ratio">
            {k === null ? `φ ≈ ${PHI.toFixed(6)}` : ratio === null ? 'the first square' : `${SEQ[k]} / ${SEQ[k - 1]} = ${ratio.toFixed(3)}  ·  φ ${ratio > PHI ? '+' : '−'} ${Math.abs(ratio - PHI).toFixed(3)}`}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
