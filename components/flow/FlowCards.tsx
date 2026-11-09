'use client';

import { useImperativeHandle, useRef, type Ref } from 'react';
import { BOUNDS, CARDS, CY, FRAMES, HEAD, NOTE, ROW, SPAN_AT, STAGES, TAGS, U_RANKING } from './cards';
import { T, P_RANK, clamp, io, sg, smooth, type FlowHandle } from './timeline';
import './cards.css';

/* The pipeline as node-editor cards (second style option on /home-2). Same interface and
   timeline as the line flowchart (Flowchart.tsx): render(intro, P) every frame.
     intro  the whole chart fades in left to right over the dotted canvas (no module tags)
     P      zoom in → "Sourcing module" tag appears, the post runs through Sourcing → camera
            moves on, Sourcing tag dims, "Ranking module" tag appears → the post runs through
            Ranking into the feed, and it holds there.
   Connectors are pale until the post has passed, then solid ink; their port circles follow.
   Cards ahead of the post are faded; a card's edge goes ink while the post is in it. */

export { P_RANK };

const NODE_STAGE: Record<string, number> = {};
STAGES.forEach((s, i) => s.nodes.forEach((id) => { NODE_STAGE[id] = i; }));

export default function FlowCards({ ref }: { ref?: Ref<FlowHandle> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<Record<string, SVGGElement | null>>({});
  const legMask = useRef<(SVGPathElement | null)[][]>([]);
  const portRefs = useRef<(SVGGElement | null)[][]>([]);
  const measure = useRef<{ leg: (SVGPathElement | null)[][]; dwell: (SVGPathElement | null)[][] }>({ leg: [], dwell: [] });
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const sweepRef = useRef<SVGRectElement>(null);
  const edgeRef = useRef<SVGRectElement>(null);
  const tagRefs = useRef<(SVGGElement | null)[]>([]);
  const canvasRef = useRef<SVGRectElement>(null);
  const last = useRef({ vb: '', z: -1 });

  const locate = (u: number, ease: boolean) => {
    const sp = SPAN_AT.find((s) => u <= s.b) ?? SPAN_AT[SPAN_AT.length - 1];
    let t = sg(u, sp.a, sp.b);
    if (ease && sp.kind === 'leg') t = io(t);
    const paths = (sp.kind === 'leg' ? measure.current.leg : measure.current.dwell)[sp.stage] ?? [];
    return paths.map((p) => {
      if (!p) return { x: 0, y: CY };
      const q = p.getPointAtLength(t * p.getTotalLength());
      return { x: q.x, y: q.y };
    });
  };

  useImperativeHandle(ref, () => ({
    render: (intro, P, reduce) => {
      const svg = svgRef.current;
      if (!svg) return;
      const W = svg.clientWidth || 1;
      const H = svg.clientHeight || 1;
      const r = (k: keyof typeof T) => sg(P, T[k][0], T[k][1]);

      const u = P < P_RANK ? U_RANKING * r('srcRun') : U_RANKING + (1 - U_RANKING) * r('rnkRun');
      const dotX = locate(u, false)[0]?.x ?? 0;

      // ── Camera: whole chart → the current module (whole module when it fits, else follow).
      // Wide screens: each module is framed whole (scale to fit it), so nothing pans inside a
      // module; the camera eases between the two fits. Narrow screens can't fit a module
      // legibly, so there the camera follows the post inside it.
      const narrow = W < 640;
      const m = smooth(r('move'));
      const sOv = Math.min(W / (BOUNDS.x1 - BOUNDS.x0 + 40), H / 420);
      const sCap = Math.min(1, H / 330, W / 290);
      const fit = ([x0, x1]: readonly [number, number]) => (narrow ? sCap : Math.min(sCap, W / (x1 - x0)));
      const sFo = Math.exp(Math.log(fit(FRAMES[0])) + (Math.log(fit(FRAMES[1])) - Math.log(fit(FRAMES[0]))) * m);
      const zz = narrow ? 1 : reduce ? 0 : smooth(r('zoomIn'));
      const s = Math.exp(Math.log(sOv) + (Math.log(sFo) - Math.log(sOv)) * zz);
      const vw = W / s;
      const vh = H / s;
      const frame = ([x0, x1]: readonly [number, number]) =>
        x1 - x0 <= vw + 1 ? (x0 + x1) / 2 : clamp(dotX + vw * 0.12, x0 + vw / 2, x1 - vw / 2);
      const follow = frame(FRAMES[0]) + (frame(FRAMES[1]) - frame(FRAMES[0])) * m;
      const cx = BOUNDS.cx + (follow - BOUNDS.cx) * zz;
      const vb = `${(cx - vw / 2).toFixed(2)} ${(CY - vh / 2).toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`;
      if (vb !== last.current.vb) { last.current.vb = vb; svg.setAttribute('viewBox', vb); }
      svg.style.setProperty('--fr', `${(4 * (1 - m)).toFixed(3)}%`);
      if (s !== last.current.z) {
        last.current.z = s;
        svg.style.setProperty('--sw', (1 / s).toFixed(4));
        svg.style.setProperty('--sw2', (1.75 / s).toFixed(4));
      }

      // ── Draw-in: canvas first, then cards and connectors left to right.
      if (canvasRef.current) canvasRef.current.style.opacity = smooth(sg(intro, 0, 0.4)).toFixed(3);
      const sweep = -60 + intro * (BOUNDS.x1 + 160);
      sweepRef.current?.setAttribute('width', String(Math.max(0, sweep + 200)));
      edgeRef.current?.setAttribute('x', String(sweep));

      // ── Module tags, one at a time.
      const tags = [
        { show: smooth(sg(r('srcDraw'), 0, 0.6)), level: 1 - 0.55 * smooth(r('move')) },
        { show: smooth(sg(r('rnkDraw'), 0, 0.6)), level: 1 },
      ];
      tags.forEach((t, i) => {
        const g = tagRefs.current[i];
        if (!g) return;
        g.style.opacity = (t.show * t.level).toFixed(3);
        g.style.transform = `translateY(${((1 - t.show) * 6).toFixed(2)}px)`;
      });

      // ── Route.
      const pts = locate(u, true);
      const legT = STAGES.map((_, i) => io(sg(u, SPAN_AT[i * 2].a, SPAN_AT[i * 2].b)));
      const done = STAGES.map((_, i) => (i === STAGES.length - 1 ? 0 : sg(u, SPAN_AT[i * 2 + 1].b - 0.004, SPAN_AT[i * 2 + 1].b + 0.02)));
      legMask.current.forEach((paths, i) => paths.forEach((p) => p?.setAttribute('stroke-dasharray', `${legT[i].toFixed(4)} 2`)));
      portRefs.current.forEach((ports, i) => ports.forEach((g, k) => {
        if (!g) return;
        // start port goes ink as the post leaves, end port as it arrives
        g.style.setProperty('--on', (k % 2 === 0 ? sg(legT[i], 0, 0.05) : sg(legT[i], 0.95, 1)).toFixed(3));
      }));

      CARDS.forEach((c) => {
        const g = cardRefs.current[c.id];
        if (!g) return;
        const st = NODE_STAGE[c.id];
        // Your post is the origin: always "arrived".
        const a = st === undefined ? 1 : smooth(sg(legT[st], 0.7, 1));
        const d = st === undefined ? smooth(sg(u, 0, 0.02)) : smooth(done[st]);
        const reveal = sg(sweep, c.x - 20, c.x + c.w);
        g.style.setProperty('--a', a.toFixed(3));
        g.style.setProperty('--d', d.toFixed(3));
        g.style.setProperty('--r', smooth(reveal).toFixed(3));
        g.style.transform = `translateY(${((1 - smooth(reveal)) * 8).toFixed(2)}px)`;
      });

      const travelling = u > 0 && u < 1 && intro >= 1;
      dotRefs.current.forEach((dot, k) => {
        if (!dot) return;
        const p = pts[k] ?? pts[0];
        dot.style.opacity = travelling && (pts.length > 1 || k === 0) ? '1' : '0';
        if (p) dot.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
      });
    },
  }));

  return (
    <svg ref={svgRef} className="fc" viewBox={`${BOUNDS.x0} 0 ${BOUNDS.x1 - BOUNDS.x0} 600`} role="img"
      aria-label="Flowchart of the X For You pipeline: your post is sourced from Thunder (in-network) and Phoenix retrieval (out-of-network), hydrated and filtered, then scored by the Phoenix scorer, weighted scorer and author diversity, selected, passed through the visibility filter, and placed at a position in the feed.">
      <defs>
        <pattern id="fc-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="1.1" />
        </pattern>
        <linearGradient id="fc-edge" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="fc-sweep" maskUnits="userSpaceOnUse" x="-400" y="-200" width="3600" height="1000">
          <rect ref={sweepRef} x="-400" y="-200" width="0" height="1000" fill="#fff" />
          <rect ref={edgeRef} x="-400" y="-200" width="200" height="1000" fill="url(#fc-edge)" />
        </mask>
        <mask id="fc-trav" maskUnits="userSpaceOnUse" x="-400" y="-200" width="3600" height="1000">
          {STAGES.map((st, i) => st.leg.map((d, k) => (
            <path key={`${i}-${k}`} ref={(el) => { (legMask.current[i] ??= [])[k] = el; }}
              d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={16} strokeDasharray="0 2" />
          )))}
        </mask>
        <filter id="fc-shadow" x="-20%" y="-30%" width="140%" height="170%">
          <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#000" floodOpacity="0.05" />
        </filter>
      </defs>

      {/* Measuring only. */}
      <g visibility="hidden" aria-hidden="true">
        {STAGES.map((st, i) => (
          <g key={i}>
            {st.leg.map((d, k) => <path key={`l${k}`} d={d} ref={(el) => { (measure.current.leg[i] ??= [])[k] = el; }} />)}
            {st.dwell.map((d, k) => <path key={`d${k}`} d={d} ref={(el) => { (measure.current.dwell[i] ??= [])[k] = el; }} />)}
          </g>
        ))}
      </g>

      {/* Dotted canvas. */}
      <rect ref={canvasRef} className="fc-canvas" x={-3000} y={-2000} width={9000} height={5000} style={{ opacity: 0 }} />

      {/* Connectors: pale, then ink where the post has been. */}
      <g mask="url(#fc-sweep)" className="fc-ghost">
        {STAGES.map((st, i) => st.leg.map((d, k) => <path key={`${i}-${k}`} d={d} />))}
      </g>
      <g mask="url(#fc-trav)" className="fc-trav">
        {STAGES.map((st, i) => st.leg.map((d, k) => <path key={`${i}-${k}`} d={d} />))}
      </g>

      {/* The post, under the cards. */}
      {[0, 1].map((k) => (
        <g key={k} ref={(el) => { dotRefs.current[k] = el; }} className="fc-dot" style={{ opacity: 0 }}>
          <circle r={11} className="fc-dot-halo" />
          <circle r={4.5} />
        </g>
      ))}

      {/* Cards. */}
      {CARDS.map((c) => (
        <g key={c.id} ref={(el) => { cardRefs.current[c.id] = el; }} className={c.dark ? 'fc-card fc-dark' : 'fc-card'}>
          <rect className="fc-body" x={c.x} y={c.y} width={c.w} height={c.h} rx={12} />
          <rect className="fc-edge" x={c.x} y={c.y} width={c.w} height={c.h} rx={12} />
          <text className="fc-title" x={c.x + 14} y={c.y + 27}>{c.title}</text>
          {[0, 1, 2].map((k) => <circle key={k} className="fc-more" cx={c.x + c.w - 26 + k * 5.5} cy={c.y + 22} r={1.4} />)}
          <rect className="fc-row" x={c.x + 7} y={c.y + HEAD} width={c.w - 14} height={ROW} rx={8} />
          <text className="fc-sub" x={c.x + 16} y={c.y + HEAD + 22}>{c.sub}</text>
          {c.note && (
            <>
              <rect className="fc-row" x={c.x + 7} y={c.y + HEAD + ROW + 4} width={c.w - 14} height={NOTE} rx={8} />
              <text className="fc-note">
                <tspan x={c.x + 16} y={c.y + HEAD + ROW + 23}>{c.note[0]}</tspan>
                <tspan x={c.x + 16} y={c.y + HEAD + ROW + 40}>{c.note[1]}</tspan>
              </text>
            </>
          )}
        </g>
      ))}

      {/* Port circles on the card edges, above the cards. */}
      <g mask="url(#fc-sweep)">
        {STAGES.map((st, i) => st.ports.map((pair, k) => pair.map(([x, y], e) => (
          <g key={`${i}-${k}-${e}`} ref={(el) => { (portRefs.current[i] ??= [])[k * 2 + e] = el; }} className="fc-port">
            <circle cx={x} cy={y} r={4.2} />
          </g>
        ))))}
      </g>

      {/* Module tags. */}
      {TAGS.map((t, i) => (
        <g key={t.label} ref={(el) => { tagRefs.current[i] = el; }} className="fc-tag" style={{ opacity: 0 }}>
          <rect x={t.x} y={t.y} width={t.label.length * 7.6 + 24} height={26} rx={8} />
          <text x={t.x + 12} y={t.y + 17.5}>{t.label}</text>
        </g>
      ))}
    </svg>
  );
}
