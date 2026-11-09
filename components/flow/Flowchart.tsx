'use client';

import { useImperativeHandle, useRef, type Ref } from 'react';
import {
  BH, BOUNDS, CY, MODULES, NODES, NOTES, PANELS, POST, SPAN_AT, STAGES, U_RANKING, noteGeo,
} from './geometry';
import './flow.css';

/* The X For You pipeline as a flowchart (client's figure, IL line style). Driven imperatively:
   the section calls render() every frame with scroll progress, so scrolling never re-renders React.

   render(intro, P)
     intro  0 → 1  the whole chart draws itself in, left to right (connectors sweep in, box
                   outlines are traced, labels settle in behind them). No module outlines here.
     P      0 → 1  the story, one module at a time (T below):
                   zoom in → Sourcing module outline draws and is highlighted → the post runs
                   through Sourcing → camera moves on, Sourcing dims, Ranking module draws →
                   the post runs through Ranking into the feed, and the story ends there (no zoom out).
   On the route, boxes light up as the post arrives and settle back (still darker than the
   ones ahead) as it leaves; each note writes in with its box and stays.                      */

import { T, P_RANK } from './timeline';
export { P_RANK };

import { clamp, io, sg, smooth, type FlowHandle } from './timeline';
export type { FlowHandle };

const NODE_STAGE: Record<string, number> = {};
STAGES.forEach((s, i) => s.nodes.forEach((id) => { NODE_STAGE[id] = i; }));

export default function Flowchart({ ref }: { ref?: Ref<FlowHandle> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const outlineRefs = useRef<Record<string, SVGRectElement | null>>({});
  const noteRefs = useRef<(SVGGElement | null)[]>([]);
  const legMask = useRef<(SVGPathElement | null)[][]>([]);
  const measure = useRef<{ leg: (SVGPathElement | null)[][]; dwell: (SVGPathElement | null)[][] }>({ leg: [], dwell: [] });
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const sweepRef = useRef<SVGRectElement>(null);
  const edgeRef = useRef<SVGRectElement>(null);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);
  const moduleRefs = useRef<(SVGGElement | null)[]>([]);
  const moduleLines = useRef<(SVGRectElement | null)[]>([]);
  const postRef = useRef<SVGGElement>(null);
  const last = useRef({ vb: '', z: -1 });

  // Route position for progress u: which span, and the point(s) on its path(s).
  const locate = (u: number, ease: boolean) => {
    const sp = SPAN_AT.find((s) => u <= s.b) ?? SPAN_AT[SPAN_AT.length - 1];
    let t = sg(u, sp.a, sp.b);
    if (ease && sp.kind === 'leg') t = io(t);
    const paths = (sp.kind === 'leg' ? measure.current.leg : measure.current.dwell)[sp.stage];
    const pts = paths.map((p) => {
      if (!p) return { x: 0, y: CY };
      const L = p.getTotalLength();
      const q = p.getPointAtLength(t * L);
      return { x: q.x, y: q.y };
    });
    return { sp, t, pts };
  };

  useImperativeHandle(ref, () => ({
    render: (intro, P, reduce) => {
      const svg = svgRef.current;
      if (!svg) return;
      const W = svg.clientWidth || 1;
      const H = svg.clientHeight || 1;
      const r = (k: keyof typeof T) => sg(P, T[k][0], T[k][1]);

      // Route progress: Sourcing covers the route up to the end of Filtering, Ranking the rest.
      const u = P < P_RANK ? U_RANKING * r('srcRun') : U_RANKING + (1 - U_RANKING) * r('rnkRun');
      const dotX = locate(u, false).pts[0]?.x ?? 0;

      // ── Camera. Overview fits the whole chart. Zoomed in, the camera frames the current
      // module: the whole module when it fits, otherwise it follows the post inside it.
      // Narrow screens skip the overview: it would be too small to read.
      const sOv = Math.min(W / 2110, H / 380);
      const sFo = Math.min(1.08, H / 290, W / 300);
      const zz = W < 640 ? 1 : reduce ? 0 : smooth(r('zoomIn'));
      const s = Math.exp(Math.log(sOv) + (Math.log(sFo) - Math.log(sOv)) * zz);
      const vw = W / s;
      const vh = H / s;
      const frame = (x0: number, x1: number) =>
        x1 - x0 <= vw ? (x0 + x1) / 2 : clamp(dotX + vw * 0.14, x0 + vw / 2, x1 - vw / 2);
      const src = frame(-36, MODULES[0].x + MODULES[0].w + 30);
      const rnk = frame(MODULES[1].x - 30, MODULES[1].x + MODULES[1].w + 30);
      const follow = src + (rnk - src) * smooth(r('move'));
      const cx = BOUNDS.cx + (follow - BOUNDS.cx) * zz;
      const vb = `${(cx - vw / 2).toFixed(2)} ${(CY - vh / 2).toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`;
      if (vb !== last.current.vb) {
        last.current.vb = vb;
        svg.setAttribute('viewBox', vb);
      }
      if (s !== last.current.z) {
        // Hairlines stay hairlines at any zoom: widths and dot spacing are set in screen px.
        last.current.z = s;
        svg.style.setProperty('--sw', (1 / s).toFixed(4));
        svg.style.setProperty('--swd', (1.5 / s).toFixed(4));
        svg.style.setProperty('--dash', `0 ${(4.5 / s).toFixed(3)}`);
      }

      // ── Modules, one at a time: the outline is traced, highlighted while the post is inside,
      // and dimmed once the story moves on.
      const mods = [
        { draw: r('srcDraw'), level: 1 - 0.7 * smooth(r('move')) },
        { draw: r('rnkDraw'), level: 1 },
      ];
      mods.forEach((m, i) => {
        const g = moduleRefs.current[i];
        const line = moduleLines.current[i];
        const d = smooth(m.draw);
        if (line) line.style.strokeDasharray = d >= 1 ? 'none' : `${d.toFixed(4)} 2`;
        if (g) {
          g.style.opacity = d > 0 ? '1' : '0';
          g.style.setProperty('--m', (m.level).toFixed(3));
          g.style.setProperty('--ml', smooth(sg(m.draw, 0, 0.35)).toFixed(3));
        }
      });

      // ── Draw-in: a sweep from left to right.
      const sweep = -40 + intro * (BOUNDS.x1 + 120);
      sweepRef.current?.setAttribute('width', String(Math.max(0, sweep + 180)));
      edgeRef.current?.setAttribute('x', String(sweep - 20));
      if (postRef.current) postRef.current.style.opacity = sg(intro, 0, 0.12).toFixed(3);
      groupRefs.current.forEach((g, i) => {
        if (g) g.style.opacity = smooth(sg(sweep, PANELS[i].x - 40, PANELS[i].x + 120)).toFixed(3);
      });

      // ── Route: traversed connectors, the post itself, box states.
      const pos = locate(u, true);
      const legT = STAGES.map((_, i) => {
        const sp = SPAN_AT[i * 2];
        return io(sg(u, sp.a, sp.b));
      });
      const done = STAGES.map((_, i) => i === STAGES.length - 1 ? 0 : sg(u, SPAN_AT[i * 2 + 1].b - 0.004, SPAN_AT[i * 2 + 1].b + 0.02));

      legMask.current.forEach((paths, i) => paths.forEach((p) => p?.setAttribute('stroke-dasharray', `${legT[i].toFixed(4)} 2`)));

      NODES.forEach((n) => {
        const i = NODE_STAGE[n.id];
        const a = smooth(sg(legT[i], 0.7, 1));
        const d = smooth(done[i]);
        const reveal = sg(sweep, n.x - 10, n.x + n.w + 40);
        const g = nodeRefs.current[n.id];
        if (g) {
          g.style.setProperty('--a', a.toFixed(3));
          g.style.setProperty('--d', d.toFixed(3));
          g.style.setProperty('--r', smooth(sg(reveal, 0.35, 1)).toFixed(3));
        }
        const o = outlineRefs.current[n.id];
        if (o) o.style.strokeDasharray = reveal >= 1 ? 'none' : `${smooth(reveal).toFixed(4)} 2`;
      });

      NOTES.forEach((note, i) => {
        const g = noteRefs.current[i];
        if (!g) return;
        const st = NODE_STAGE[note.node];
        const a = smooth(sg(legT[st], 0.85, 1));
        g.style.opacity = (a * (1 - 0.3 * smooth(done[st]))).toFixed(3);
        g.style.transform = `translateY(${((1 - a) * (note.above ? -4 : 4)).toFixed(2)}px)`;
      });

      // The post: visible on the connectors; inside a stage it passes under the (opaque) box.
      const travelling = u > 0 && u < 1;
      dotRefs.current.forEach((dot, k) => {
        if (!dot) return;
        const p = pos.pts[k] ?? pos.pts[0];
        const show = travelling && (pos.pts.length > 1 || k === 0) && intro >= 1;
        dot.style.opacity = show ? '1' : '0';
        if (p) dot.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
      });
    },
  }));

  return (
    <svg ref={svgRef} className="fl" viewBox={`0 0 ${BOUNDS.x1} 600`} role="img"
      aria-label="Flowchart of the X For You pipeline: your post is sourced from Thunder (in-network) and Phoenix retrieval (out-of-network), hydrated and filtered, then scored by the Phoenix scorer, weighted scorer and author diversity, selected, passed through the visibility filter, and placed at a position in the feed.">
      <defs>
        <linearGradient id="fl-edge" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        {/* Draw-in: everything left of the sweep, with a soft leading edge. */}
        <mask id="fl-sweep" maskUnits="userSpaceOnUse" x="-200" y="0" width="2500" height="600">
          <rect ref={sweepRef} x="-200" y="0" width="0" height="600" fill="#fff" />
          <rect ref={edgeRef} x="-200" y="0" width="80" height="600" fill="url(#fl-edge)" />
        </mask>
        {/* Traversed connectors: each leg is revealed along its own path as the post moves. */}
        <mask id="fl-trav" maskUnits="userSpaceOnUse" x="-200" y="0" width="2500" height="600">
          {STAGES.map((st, i) =>
            st.leg.map((d, k) => (
              <path key={`${i}-${k}`} ref={(el) => { (legMask.current[i] ??= [])[k] = el; }}
                d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={14} strokeDasharray="0 2" />
            )),
          )}
        </mask>
      </defs>

      {/* Route geometry for measuring (never painted). */}
      <g visibility="hidden" aria-hidden="true">
        {STAGES.map((st, i) => (
          <g key={i}>
            {st.leg.map((d, k) => <path key={`l${k}`} d={d} ref={(el) => { (measure.current.leg[i] ??= [])[k] = el; }} />)}
            {st.dwell.map((d, k) => <path key={`d${k}`} d={d} ref={(el) => { (measure.current.dwell[i] ??= [])[k] = el; }} />)}
          </g>
        ))}
      </g>

      {/* Groups from the client's figure: barely-there panels. */}
      <g mask="url(#fl-sweep)">
      {PANELS.map((p, i) => (
        <g key={p.label} ref={(el) => { groupRefs.current[i] = el; }} className="fl-panel">
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={16} />
          <text x={p.x + 2} y={p.y - 10}>{p.label}</text>
        </g>
      ))}
      </g>

      {/* Module outlines: not part of the whole-chart view; each is drawn when its turn comes. */}
      {MODULES.map((m, i) => (
        <g key={m.label} ref={(el) => { moduleRefs.current[i] = el; }} className="fl-module" style={{ opacity: 0 }}>
          <rect ref={(el) => { moduleLines.current[i] = el; }} className="fl-module-line" x={m.x} y={m.y} width={m.w} height={m.h} rx={22} pathLength={1} />
          <g className="fl-module-label">
            <rect className="fl-module-bg" x={m.x + 14} y={m.y - 8} width={m.label.length * 7.6 + 20} height={16} />
            <text x={m.x + 24} y={m.y + 3.5}>{m.label}</text>
          </g>
        </g>
      ))}

      {/* Connectors: pale dotted lines (drawn in by the sweep), ink where the post has been. */}
      <g mask="url(#fl-sweep)">
        <g className="fl-ghost">
          {STAGES.map((st, i) => st.leg.map((d, k) => <path key={`${i}-${k}`} d={d} />))}
          {STAGES.map((st, i) => st.head.map((d, k) => <path key={`h${i}-${k}`} className="fl-head" d={d} />))}
        </g>
      </g>
      <g className="fl-trav" mask="url(#fl-trav)">
        {STAGES.map((st, i) => st.leg.map((d, k) => <path key={`${i}-${k}`} d={d} />))}
        {STAGES.map((st, i) => st.head.map((d, k) => <path key={`h${i}-${k}`} className="fl-head" d={d} />))}
      </g>

      {/* Notes: write in with their box and stay. */}
      {NOTES.map((n, i) => {
        const g = noteGeo(n);
        return (
          <g key={n.node} ref={(el) => { noteRefs.current[i] = el; }} className="fl-note" style={{ opacity: 0 }}>
            {n.arrow && <path className="fl-note-line" d={g.arrow} />}
            {n.arrow && <path className="fl-head" d={g.head} />}
            <text textAnchor="middle">
              {n.lines.map((l, k) => <tspan key={k} x={g.cx} y={g.textY[k]}>{l}</tspan>)}
            </text>
          </g>
        );
      })}

      {/* The post (accent), drawn under the boxes so it passes beneath them. */}
      {[0, 1].map((k) => (
        <g key={k} ref={(el) => { dotRefs.current[k] = el; }} className="fl-dot" style={{ opacity: 0 }}>
          <circle r={10} className="fl-dot-halo" />
          <circle r={4} />
        </g>
      ))}

      {/* Boxes. */}
      {NODES.map((n) => (
        <g key={n.id} ref={(el) => { nodeRefs.current[n.id] = el; }} className={n.dark ? 'fl-node fl-feed' : 'fl-node'}>
          <rect className="fl-fill" x={n.x} y={n.y} width={n.w} height={BH} rx={11} />
          {n.dark && <rect className="fl-tint" x={n.x} y={n.y} width={n.w} height={BH} rx={11} />}
          <rect ref={(el) => { outlineRefs.current[n.id] = el; }} className="fl-outline" x={n.x} y={n.y} width={n.w} height={BH} rx={11} pathLength={1} />
          <g className="fl-label">
            <text className="fl-title" x={n.x + n.w / 2} y={n.y + 23} textAnchor="middle">{n.title}</text>
            <text className="fl-sub" x={n.x + n.w / 2} y={n.y + 39} textAnchor="middle">{n.sub}</text>
          </g>
        </g>
      ))}

      {/* Your post: the dark source tile. */}
      <g ref={postRef} className="fl-post" style={{ opacity: 0 }}>
        <rect x={POST.x} y={POST.y} width={POST.w} height={POST.h} rx={6} />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M${POST.x + 7} ${POST.y + 11 + k * 6} H${POST.x + (k === 2 ? 15 : 19)}`} />
        ))}
        <text className="fl-post-title" x={POST.x + POST.w / 2} y={CY + 40} textAnchor="middle">Your post</text>
        <text className="fl-post-sub" x={POST.x + POST.w / 2} y={CY + 55} textAnchor="middle">X or LinkedIn</text>
      </g>
    </svg>
  );
}
