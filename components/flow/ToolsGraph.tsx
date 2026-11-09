'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './tools-graph.css';

/* Analytical tools, "Graph" layout (/home-2; option to the exploded device). A small, living
   network in the middle of the screen: Engagement Classifier is the hub (a dark green hexagon);
   the other tools hang off it on elbow lines — Post Velocity (open circle), Weighted Engagement
   Scoring (grey circle), Cluster Penetration (grey square) — and Account Analytics is ghosted
   (dashed, not yet live). It never sits still: every node drifts on its own slow sum of sines,
   the hub breathes and turns a few degrees, the lines bend with them, and now and then a signal
   runs out from the hub along a line. Hover or focus a node: it lifts, the others fade, and its
   info card folds out beside it (hinged on the side facing the node). The tools intro line sits
   at the bottom of the screen in the 512px column. Copy: the client's (as SectionFour.tsx). */

const INTRO =
  'We turned this research into software, built on 2B+ data points, that weights every engagement by the engager’s influence, measures engagement velocity in real time, and maps how deep a post penetrates each niche, to forecast its reach and shelf-life within the first 30 minutes.';

type Shape = 'hex' | 'ring' | 'disc' | 'square';
type Node = {
  id: string; name: string[]; shape: Shape; x: number; y: number;
  // elbow: the corner the line turns at, relative to the node; label offset and anchor
  elbow: [number, number]; label: [number, number]; ghost?: boolean;
  text?: string; href?: string; side: 'l' | 'r'; shots?: string[];
};

const HUB = { x: 280, y: 190 };
const NODES: Node[] = [
  {
    id: 'classifier', name: ['Engagement Classifier'], shape: 'hex', x: HUB.x, y: HUB.y, elbow: [0, 0], label: [0, 26], side: 'r',
    href: 'https://graphs-seven-pi.vercel.app/tools/classifier', shots: ['classifier-4', 'classifier-1', 'classifier-2'],
    text: 'A post is only fast or slow compared to itself. The classifier takes a post’s engagement rate in its first 15 minutes as a baseline and measures its performance after against it. This lets us predict how far a post will go within 30 minutes.',
  },
  {
    id: 'velocity', name: ['Post Velocity'], shape: 'ring', x: 340, y: 128, elbow: [-14, 34], label: [-2, 20], side: 'r',
    href: 'https://graphs-seven-pi.vercel.app/tools/velocity', shots: ['velocity-5', 'velocity-2', 'velocity-1'],
    text: 'Tracks how fast engagement is accelerating in real time. A steep curve in the first 6 hours is the strongest predictor of a breakout. Combined with the Classifier, it tells us how a launch/post will perform within its first 30 minutes.',
  },
  {
    id: 'weighted', name: ['Weighted', 'Engagement Scoring'], shape: 'disc', x: 202, y: 250, elbow: [18, -26], label: [0, 22], side: 'l',
    href: 'https://graphs-seven-pi.vercel.app/tools/scoring', shots: ['weighted-curve', 'weighted-score', 'weighted-post'],
    text: 'A 100 likes from a 100 strangers is not the same as 1 quote from someone important. Weighted Engagement scores each interaction by who performed it -their influence, their cluster, the kind of action.',
  },
  {
    id: 'cluster', name: ['Cluster', 'Penetration'], shape: 'square', x: 354, y: 242, elbow: [-24, -16], label: [2, 20], side: 'r',
    href: 'https://graphs-seven-pi.vercel.app/tools/clusters', shots: ['cluster-3', 'cluster-1', 'cluster-2'],
    text: 'Measures how deep a post travelled within a niche. When a post goes out, we can see which clusters it reached and how much of each it covered.',
  },
  { id: 'accounts', name: ['Account Analytics'], shape: 'ring', x: 206, y: 112, elbow: [30, 40], label: [4, 21], ghost: true, side: 'l' },
];
const VW = 560;
const VH = 380;
/* Cards open clear of the network: beyond its right edge (x 430) for tools on the right, beyond
   its left edge (x 130) for tools on the left, so the graph stays in view. */
const OPEN_R = 430;
const OPEN_L = 130;
/* Three small screenshots scattered behind the card, each peeking out past a different edge
   (top-right, lower-left, bottom-right): [left %, top %, width px, tilt°], relative to the card. */
const SCATTER: [number, number, number, number][] = [[66, -12, 124, 5], [-16, 58, 128, -5], [50, 90, 120, 3]];
/* Every card opens at the same height (near the top of the graph), whatever its node's height. */
const OPEN_Y = 18;

// Each node's own slow drift: two sines per axis, different periods and phases.
const DRIFT = NODES.map((n, i) => ({
  a: n.id === 'classifier' ? 1.2 : 3.4 + (i % 2) * 1.2,
  f1: 0.21 + i * 0.037, f2: 0.13 + i * 0.029, p1: i * 1.7, p2: i * 2.3,
}));

const hexPath = (r: number) => Array.from({ length: 6 }, (_, k) => {
  const a = Math.PI / 6 + (k * Math.PI) / 3;
  return `${k ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
}).join(' ') + ' Z';

export default function ToolsGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const lineRefs = useRef<(SVGPathElement | null)[]>([]);
  const pulseRefs = useRef<(SVGCircleElement | null)[]>([]);
  const hexRef = useRef<SVGPathElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hover;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = false;
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = reduce ? 0 : (now - t0) / 1000;
      const pos = NODES.map((n, i) => {
        const d = DRIFT[i];
        const lift = hoverRef.current === i ? -3 : 0;
        return {
          x: n.x + d.a * Math.sin(t * d.f1 * Math.PI * 2 * 0.5 + d.p1) + d.a * 0.5 * Math.sin(t * d.f2 * Math.PI * 2 + d.p2),
          y: n.y + lift + d.a * Math.cos(t * d.f2 * Math.PI * 2 * 0.6 + d.p2) + d.a * 0.5 * Math.sin(t * d.f1 * Math.PI * 2 * 0.8 + d.p1),
        };
      });
      const hub = pos[0];
      NODES.forEach((n, i) => {
        const g = nodeRefs.current[i];
        if (g) g.setAttribute('transform', `translate(${pos[i].x.toFixed(2)} ${pos[i].y.toFixed(2)})`);
        if (i === 0) return;
        // elbow line: hub → a corner near the node (it bends with both) → the node's edge
        const p = pos[i];
        const ex = p.x + n.elbow[0] + Math.sin(t * 0.4 + i) * 1.5;
        const ey = p.y + n.elbow[1] + Math.cos(t * 0.35 + i) * 1.5;
        const back = Math.hypot(ex - p.x, ey - p.y) || 1;
        const ux = p.x + ((ex - p.x) / back) * 7, uy = p.y + ((ey - p.y) / back) * 7;
        const hb = Math.hypot(ex - hub.x, ey - hub.y) || 1;
        const hx = hub.x + ((ex - hub.x) / hb) * 9, hy = hub.y + ((ey - hub.y) / hb) * 9;
        const d = `M${hx.toFixed(2)} ${hy.toFixed(2)} L${ex.toFixed(2)} ${ey.toFixed(2)} L${ux.toFixed(2)} ${uy.toFixed(2)}`;
        lineRefs.current[i]?.setAttribute('d', d);
        // a signal now and then: out from the hub along the line, every ~4–6 s per line
        const c = pulseRefs.current[i];
        if (c && !n.ghost) {
          const period = 4 + i * 0.7;
          const k = ((t + i * 1.3) % period) / 1.1; // 1.1 s run, then rest
          if (reduce || k > 1) { c.style.opacity = '0'; } else {
            const L1 = Math.hypot(ex - hx, ey - hy), L2 = Math.hypot(ux - ex, uy - ey), s = k * (L1 + L2);
            const [px, py] = s < L1 ? [hx + ((ex - hx) * s) / L1, hy + ((ey - hy) * s) / L1] : [ex + ((ux - ex) * (s - L1)) / L2, ey + ((uy - ey) * (s - L1)) / L2];
            c.setAttribute('cx', px.toFixed(2)); c.setAttribute('cy', py.toFixed(2));
            c.style.opacity = (Math.sin(k * Math.PI) * 0.9).toFixed(2);
          }
        }
      });
      // the hub breathes and turns a little
      hexRef.current?.setAttribute('transform', `rotate(${(Math.sin(t * 0.5) * 6).toFixed(2)}) scale(${(1 + Math.sin(t * 1.3) * 0.05).toFixed(3)})`);
      raf = visible && !reduce ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    if (svgRef.current) io.observe(svgRef.current);
    raf = requestAnimationFrame(frame);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="tg" data-foot="/Analytical Tools" aria-label="Analytical tools">
      <div className="frame tg-frame">
        <div className="tg-stage" onPointerLeave={() => setHover(null)}>
          <svg ref={svgRef} className="tg-svg" viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label="The analytical tools as one network around the Engagement Classifier">
            <defs>
              <filter id="tg-halo" x="-30%" y="-80%" width="160%" height="260%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            {NODES.map((n, i) => i > 0 && (
              <path key={n.id} ref={(el) => { lineRefs.current[i] = el; }} className={n.ghost ? 'tg-line tg-ghost' : 'tg-line'}
                data-on={hover === i || undefined} data-dim={(hover !== null && hover !== i && hover !== 0) || undefined} />
            ))}
            {NODES.map((n, i) => i > 0 && !n.ghost && <circle key={n.id} ref={(el) => { pulseRefs.current[i] = el; }} className="tg-pulse" r={1.6} style={{ opacity: 0 }} />)}
            {NODES.map((n, i) => (
              <g key={n.id} ref={(el) => { nodeRefs.current[i] = el; }} className={n.ghost ? 'tg-node tg-ghost' : 'tg-node'}
                data-on={hover === i || undefined} data-dim={(hover !== null && hover !== i) || undefined}
                onPointerEnter={() => !n.ghost && setHover(i)}>
                {/* label with a soft paper halo behind it */}
                <g className="tg-label" transform={`translate(${n.label[0]} ${n.label[1]})`}>
                  <rect className="tg-halo" x={-n.name.reduce((m, s) => Math.max(m, s.length), 0) * 3.4 - 6} y={-9} width={n.name.reduce((m, s) => Math.max(m, s.length), 0) * 6.8 + 12} height={n.name.length * 12 + 6} rx={6} filter="url(#tg-halo)" />
                  <text textAnchor="middle">
                    {n.name.map((s, k) => <tspan key={k} x={0} dy={k ? 12 : 0}>{s}</tspan>)}
                  </text>
                </g>
                {n.shape === 'hex' && <path ref={hexRef} className="tg-hex" d={hexPath(8)} />}
                {n.shape === 'ring' && <circle className="tg-ring" r={6} />}
                {n.shape === 'disc' && <circle className="tg-disc" r={6} />}
                {n.shape === 'square' && <rect className="tg-square" x={-5.5} y={-5.5} width={11} height={11} />}
                <circle className="tg-hit" r={16} />
              </g>
            ))}
          </svg>

          {/* Focusable names (screen readers / keyboard) over the nodes. */}
          {NODES.map((n, i) => !n.ghost && (
            <button key={n.id} type="button" className="tg-focus" aria-describedby={`tg-card-${i}`}
              style={{ left: `${(n.x / VW) * 100}%`, top: `${(n.y / VH) * 100}%` }}
              onFocus={() => setHover(i)} onBlur={() => setHover(null)} onPointerEnter={() => setHover(i)}>
              {n.name.join(' ')}
            </button>
          ))}

          {/* Info cards, opening clear of the network on their node's side, with a few of the
              tool's screens scattered small beneath. */}
          {NODES.map((n, i) => !n.ghost && (
            <div key={n.id} id={`tg-card-${i}`} className="tg-pop" data-side={n.side} data-open={hover === i || undefined} aria-hidden={hover !== i}
              onPointerEnter={() => setHover(i)}
              style={{
                top: `${(OPEN_Y / VH) * 100}%`,
                [n.side === 'r' ? 'left' : 'right']: `${((n.side === 'r' ? OPEN_R : VW - OPEN_L) / VW) * 100}%`,
              } as CSSProperties}>
              <div className="tg-shots" aria-hidden="true">
                {n.shots?.map((f, k) => (
                  <img key={f} className="tg-shot" src={`/assets/tools/${f}.webp`} alt="" decoding="async" loading="lazy"
                    style={{
                      // mirrored on the left-side card (positions, not a transform, so a hovered
                      // screen can still come in front of the card)
                      [n.side === 'r' ? 'left' : 'right']: `${SCATTER[k][0]}%`, top: `${SCATTER[k][1]}%`, width: SCATTER[k][2],
                      '--tilt': `${n.side === 'r' ? SCATTER[k][3] : -SCATTER[k][3]}deg`, '--k': k,
                    } as CSSProperties} />
                ))}
              </div>
              <div className="tg-card">
                <h3 className="tg-card-title">{n.name.join(' ')}</h3>
                <p className="tg-card-text">{n.text}</p>
                <a className="tg-try" href={n.href} target="_blank" rel="noopener noreferrer" tabIndex={hover === i ? 0 : -1}
                  aria-label={`Try ${n.name.join(' ')} (opens in a new tab)`}>[Try it →]</a>
              </div>
            </div>
          ))}
        </div>

        <p className="tg-intro">{INTRO}</p>
      </div>
    </section>
  );
}
