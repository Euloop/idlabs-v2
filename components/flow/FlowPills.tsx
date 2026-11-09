'use client';

import { useImperativeHandle, useRef, type Ref } from 'react';
import { BH, BOUNDS, CY, FRAMES, PH, PILLS, SPAN_AT, STAGES, TAGS, U_RANKING, branchPath, handles } from './pills';
import { T, P_RANK, clamp, io, sg, smooth, type FlowHandle } from './timeline';
import './pills.css';

/* Minimal tree version of the pipeline (third style on /home-2). Same interface and timeline as
   the other two: render(intro, P) every frame.
     intro  the spine and its pills fade in left to right (branches stay hidden; no module tags)
     P      zoom in → "Sourcing module" → the post runs along the spine; at each step the pill
            fills in, its handle dots go ink and its branches draw out on their curves →
            camera eases to Ranking → the post runs into the feed and holds there.            */

export { P_RANK };

const NODE_STAGE: Record<string, number> = {};
STAGES.forEach((s, i) => s.nodes.forEach((id) => { NODE_STAGE[id] = i; }));

export default function FlowPills({ ref }: { ref?: Ref<FlowHandle> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pillRefs = useRef<Record<string, SVGGElement | null>>({});
  const branchRefs = useRef<Record<string, SVGGElement | null>>({});
  const branchLines = useRef<Record<string, (SVGPathElement | null)[]>>({});
  const legMask = useRef<(SVGPathElement | null)[][]>([]);
  const measure = useRef<{ leg: (SVGPathElement | null)[][]; dwell: (SVGPathElement | null)[][] }>({ leg: [], dwell: [] });
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const sweepRef = useRef<SVGRectElement>(null);
  const edgeRef = useRef<SVGRectElement>(null);
  const tagRefs = useRef<(SVGGElement | null)[]>([]);
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

      // Camera: whole chart → each module framed whole (follows the post on narrow screens).
      const narrow = W < 640;
      const m = smooth(r('move'));
      const sOv = Math.min(W / (BOUNDS.x1 - BOUNDS.x0 + 40), H / 380);
      const sCap = Math.min(1.15, H / 340, W / 280);
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
      if (s !== last.current.z) {
        last.current.z = s;
        svg.style.setProperty('--sw', (1 / s).toFixed(4));
      }

      // Draw-in sweep.
      const sweep = -60 + intro * (BOUNDS.x1 + 160);
      sweepRef.current?.setAttribute('width', String(Math.max(0, sweep + 200)));
      edgeRef.current?.setAttribute('x', String(sweep));

      // Module tags, one at a time.
      [
        { show: smooth(sg(r('srcDraw'), 0, 0.6)), level: 1 - 0.55 * m },
        { show: smooth(sg(r('rnkDraw'), 0, 0.6)), level: 1 },
      ].forEach((t, i) => {
        const g = tagRefs.current[i];
        if (g) g.style.opacity = (t.show * t.level).toFixed(3);
      });

      // Route.
      const pts = locate(u, true);
      const legT = STAGES.map((_, i) => io(sg(u, SPAN_AT[i * 2].a, SPAN_AT[i * 2].b)));
      const done = STAGES.map((_, i) => (i === STAGES.length - 1 ? 0 : sg(u, SPAN_AT[i * 2 + 1].b - 0.004, SPAN_AT[i * 2 + 1].b + 0.02)));
      legMask.current.forEach((paths, i) => paths.forEach((p) => p?.setAttribute('stroke-dasharray', `${legT[i].toFixed(4)} 2`)));

      PILLS.forEach((p) => {
        const g = pillRefs.current[p.id];
        if (!g) return;
        const st = NODE_STAGE[p.id];
        const a = st === undefined ? 1 : smooth(sg(legT[st], 0.7, 1));
        const d = st === undefined ? 0 : smooth(done[st]);
        g.style.setProperty('--a', a.toFixed(3));
        g.style.setProperty('--d', d.toFixed(3));
        g.style.setProperty('--r', smooth(sg(sweep, p.x - 20, p.x + p.w)).toFixed(3));
        // Branches draw out once the post has arrived: curve first, then the pill.
        const b = st === undefined ? 0 : sg(legT[st], 0.8, 1) * 0.5 + sg(u, SPAN_AT[st * 2 + 1].a, SPAN_AT[st * 2 + 1].a + 0.03) * 0.5;
        const bg = branchRefs.current[p.id];
        if (bg) bg.style.setProperty('--b', smooth(sg(b, 0.5, 1)).toFixed(3));
        branchLines.current[p.id]?.forEach((l) => l?.setAttribute('stroke-dasharray', `${smooth(sg(b, 0, 0.7)).toFixed(4)} 2`));
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
    <svg ref={svgRef} className="fp" viewBox={`${BOUNDS.x0} 0 ${BOUNDS.x1 - BOUNDS.x0} 600`} role="img"
      aria-label="Flowchart of the X For You pipeline: your post is sourced from Thunder (in-network) and Phoenix retrieval (out-of-network), hydrated and filtered, then scored by the Phoenix scorer, weighted scorer and author diversity, selected, passed through the visibility filter, and placed at a position in the feed.">
      <defs>
        <linearGradient id="fp-edge" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="fp-sweep" maskUnits="userSpaceOnUse" x="-400" y="-200" width="4000" height="1000">
          <rect ref={sweepRef} x="-400" y="-200" width="0" height="1000" fill="#fff" />
          <rect ref={edgeRef} x="-400" y="-200" width="200" height="1000" fill="url(#fp-edge)" />
        </mask>
        <mask id="fp-trav" maskUnits="userSpaceOnUse" x="-400" y="-200" width="4000" height="1000">
          {STAGES.map((st, i) => st.leg.map((d, k) => (
            <path key={`${i}-${k}`} ref={(el) => { (legMask.current[i] ??= [])[k] = el; }}
              d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={12} strokeDasharray="0 2" />
          )))}
        </mask>
      </defs>

      <g visibility="hidden" aria-hidden="true">
        {STAGES.map((st, i) => (
          <g key={i}>
            {st.leg.map((d, k) => <path key={`l${k}`} d={d} ref={(el) => { (measure.current.leg[i] ??= [])[k] = el; }} />)}
            {st.dwell.map((d, k) => <path key={`d${k}`} d={d} ref={(el) => { (measure.current.dwell[i] ??= [])[k] = el; }} />)}
          </g>
        ))}
      </g>

      {/* Spine: hairline, pale until the post passes. */}
      <g mask="url(#fp-sweep)" className="fp-ghost">
        {STAGES.map((st, i) => st.leg.map((d, k) => <path key={`${i}-${k}`} d={d} />))}
      </g>
      <g mask="url(#fp-trav)" className="fp-trav">
        {STAGES.map((st, i) => st.leg.map((d, k) => <path key={`${i}-${k}`} d={d} />))}
      </g>

      {/* Branches (the notes), fanned out on hairline curves. */}
      {PILLS.filter((p) => p.branches.length).map((p) => (
        <g key={p.id} ref={(el) => { branchRefs.current[p.id] = el; }} className="fp-branches">
          {p.branches.map((b, k) => (
            <path key={`l${k}`} className="fp-branch-line" d={branchPath(p, b)} pathLength={1} strokeDasharray="0 2"
              ref={(el) => { (branchLines.current[p.id] ??= [])[k] = el; }} />
          ))}
          {p.branches.map((b) => (
            <g key={b.label} className="fp-branch">
              <rect x={b.x} y={b.y - BH / 2} width={b.w} height={BH} rx={BH / 2} />
              <circle className="fp-port" cx={b.x} cy={b.y} r={2.2} />
              <text x={b.x + 12} y={b.y + 3.8}>{b.label}</text>
            </g>
          ))}
        </g>
      ))}

      {/* The post. */}
      {[0, 1].map((k) => (
        <g key={k} ref={(el) => { dotRefs.current[k] = el; }} className="fp-dot" style={{ opacity: 0 }}>
          <circle r={3.6} />
        </g>
      ))}

      {/* Main pills, with their handle dots and caption. */}
      {PILLS.map((p) => {
        const [hl, hr] = handles(p);
        return (
          <g key={p.id} ref={(el) => { pillRefs.current[p.id] = el; }} className={p.dark ? 'fp-pill fp-dark' : 'fp-pill'}>
            <rect className="fp-body" x={p.x} y={p.y - PH / 2} width={p.w} height={PH} rx={PH / 2} />
            <text className="fp-title" x={p.x + p.w / 2} y={p.y + 4.6} textAnchor="middle">{p.title}</text>
            <text className="fp-sub" x={p.x + p.w / 2} y={p.y + PH / 2 + 15} textAnchor="middle">{p.sub}</text>
            {p.id !== 'post' && <circle className="fp-handle" cx={hl} cy={p.y} r={3} />}
            {p.id !== 'feed' && <circle className="fp-handle" cx={hr} cy={p.y} r={3} />}
          </g>
        );
      })}

      {/* Module tags: quiet mono captions. */}
      {TAGS.map((t, i) => (
        <g key={t.label} ref={(el) => { tagRefs.current[i] = el; }} className="fp-tag" style={{ opacity: 0 }}>
          <text x={t.x} y={t.y}>{t.label}</text>
        </g>
      ))}
    </svg>
  );
}
