'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type SVGProps } from 'react';
import { landscapeCuts } from './golden';

/* The Fibonacci diagram (after Figma Zoomcast 200:22, the footer's construction) as one SVG, every line
   placed by the arithmetic (feedback 2026-11-16: "mathematically right").
   fibTiling(n): the F(n+1) × F(n) rectangle tiled by n squares of the Fibonacci numbers, largest first,
   cut in turn from the left, top, right and bottom (golden.ts landscapeCuts — exact here too, since each
   cut leaves a Fibonacci rectangle) — n 6: 13 × 8 (8, 5, 3, 2, 1, 1); n 9: 55 × 34 (34 … 1, 1). The
   Fibonacci spiral is a quarter arc in each square. It is the golden spiral's whole-number form: the
   rectangle is F(n+1)/F(n) — 1.625 at n 6, 1.6176 at n 9 — against φ 1.6180, closer with each square.
   Drawn with it:
   - each square's inscribed circle;
   - the section lines, on the tiling's own edges: the third square's inner edge (upright) and the
     fourth's (level) carried across the whole, each with its mirror;
   - the diagonals: the whole rectangle's, corner to corner, and the two F(n−1) × F(n) end rectangles'
     — which cross it (all but) at right angles at the spiral's eye, as in the golden construction.
   `flip`: turned upside down (the small squares top right — the footer).
   Drawn in screen px once measured (`fit`: slice, edge to edge; fill, the box), every upright and level
   line on a pixel centre — 1px, one solid colour, crisp. Unmeasured (first paint) it is in its own units.
   Used behind the /home-4 "Video first" loader (.sl-fib, n 6) and in the footer's "Fibonacci · full". */

export const FW = 1280;
const f = (n: number) => +n.toFixed(2);

export function fibTiling(n: number) {
  const F = [1, 1];
  while (F.length < n + 1) F.push(F[F.length - 1] + F[F.length - 2]);
  const H = (F[n - 1] * FW) / F[n];
  const c = landscapeCuts(0, 0, FW, H, n);
  const squares = c.squares.map((q, i) => ({ ...q, n: F[n - 1 - i] }));
  return {
    n, W: FW, H, squares, arcs: c.arcs,
    /** the sequence 1, 1, 2, … up to the width, F(n+1) */
    seq: F.slice(0, n + 1),
    vlines: [FW - squares[2].x, squares[2].x],
    hlines: [H - squares[3].y, squares[3].y],
    diags: [[0, 0, FW, H], [0, H, FW - H, 0], [H, H, FW, 0]] as [number, number, number, number][],
  };
}
export type FibTiling = ReturnType<typeof fibTiling>;

type Fit = 'slice' | 'fill';

/** `fit`: how the drawing meets the svg's box — slice (cover, centred) or fill (stretch). `depth`: n squares. */
export default function FibLines({ fit = 'fill', depth = 6, flip = false, ...rest }: { fit?: Fit; depth?: number; flip?: boolean } & SVGProps<SVGSVGElement>) {
  const t = fibTiling(depth);
  const FH = t.H;
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<[number, number] | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => { const r = el.getBoundingClientRect(); if (r.width && r.height) setBox([Math.round(r.width), Math.round(r.height)]); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // units → screen px (or units, unmeasured); `snap` for upright and level lines: onto a pixel centre
  let sx = 1, sy = 1, ox = 0, oy = 0, vw = FW, vh = FH;
  if (box) {
    [vw, vh] = box;
    if (fit === 'slice') { sx = sy = Math.max(vw / FW, vh / FH); ox = (vw - FW * sx) / 2; oy = (vh - FH * sy) / 2; }
    else { sx = vw / FW; sy = vh / FH; }
  }
  const X = (x: number) => ox + x * sx, Y = (y: number) => oy + (flip ? FH - y : y) * sy;
  const snap = (v: number, max: number) => (box ? Math.min(max - 0.5, Math.max(0.5, Math.round(v - 0.5) + 0.5)) : v);
  const SX = (x: number) => snap(X(x), vw), SY = (y: number) => snap(Y(y), vh);
  const rect = (x: number, y: number, w: number, h: number) => {
    const x0 = SX(x), y0 = SY(y), x1 = SX(x + w), y1 = SY(y + h);
    return `M${f(x0)} ${f(y0)}H${f(x1)}V${f(y1)}H${f(x0)}Z`;
  };

  let i = 0;
  const o = () => ({ style: { '--i': i++ } as CSSProperties, pathLength: 1 });
  return (
    <svg ref={ref} viewBox={`0 0 ${f(vw)} ${f(vh)}`} preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth={1}
      shapeRendering={box ? 'crispEdges' : undefined} data-fit={box ? '' : undefined} aria-hidden="true" {...rest}>
      <g>
        <path className="fl-sq" d={rect(0, 0, FW, FH)} {...o()} />
        {t.squares.map((q, k) => <path key={`s${k}`} className="fl-sq" d={rect(q.x, q.y, q.s, q.s)} {...o()} />)}
        {t.squares.map((q, k) => (
          <ellipse key={`c${k}`} className="fl-c" cx={f(X(q.x + q.s / 2))} cy={f(Y(q.y + q.s / 2))} rx={f((q.s / 2) * sx)} ry={f((q.s / 2) * sy)}
            shapeRendering="geometricPrecision" {...o()} />
        ))}
        {t.vlines.map((x) => <path key={`v${x}`} className="fl-l" d={`M${f(SX(x))} ${f(SY(0))}V${f(SY(FH))}`} {...o()} />)}
        {t.hlines.map((y) => <path key={`h${y}`} className="fl-l" d={`M${f(SX(0))} ${f(SY(y))}H${f(SX(FW))}`} {...o()} />)}
        {t.diags.map(([a, b, c, d], k) => (
          <path key={`d${k}`} className="fl-d" d={`M${f(X(a))} ${f(Y(b))}L${f(X(c))} ${f(Y(d))}`} shapeRendering="geometricPrecision" {...o()} />
        ))}
      </g>
    </svg>
  );
}
