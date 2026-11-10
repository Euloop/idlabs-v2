/* The UI panes of the Stack layout (ToolsStack.tsx): each a calm, reduced version of the tool's
   own main view (public/assets/tools/*: classifier-4, weighted-score, velocity-5, cluster-3) —
   one chart, its figures from the tool's screen, lots of air. No avatars, no axes beyond what
   the chart needs. One coordinate system per pane (260 × 330, the pane box), so everything
   scales with the pane. Colours come from the pane's CSS variables (light / dark). */

const W = 260;
const H = 330;

/* deterministic pseudo-random (same on server and client) */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Head({ tool, title }: { tool: string; title: string }) {
  return (
    <>
      <text className="tp-tool" x={20} y={30}>{tool}</text>
      <text className="tp-title" x={20} y={62}>{title}</text>
    </>
  );
}

/* ── Engagement Classifier: a handful of posts against their own first 15 minutes; the viral
   ones climb away from the baseline. ── */
const CL = { x0: 36, x1: 236, base: 200, top: 112, bot: 280 };
const TRAILS = (() => {
  const r = rng(11);
  return Array.from({ length: 12 }, (_, k) => {
    const up = k % 3 === 0;
    const end = CL.base + (up ? -(46 + r() * 40) : 14 + r() * 62);
    const c = CL.x0 + 90 + r() * 40;
    return {
      d: `M${CL.x0} ${CL.base} C${c} ${CL.base} ${c} ${end} ${CL.x1} ${end.toFixed(1)}`,
      y: end, viral: up,
    };
  });
})();

function Classifier() {
  return (
    <>
      <Head tool="Engagement Classifier" title="Rate vs baseline" />
      {TRAILS.map((t, k) => <path key={k} className={t.viral ? 'tp-trail tp-trail-hi' : 'tp-trail'} d={t.d} />)}
      <line className="tp-base" x1={CL.x0} x2={CL.x1} y1={CL.base} y2={CL.base} />
      <circle className="tp-dot-start" cx={CL.x0} cy={CL.base} r={3} />
      {TRAILS.map((t, k) => t.viral && <circle key={k} className="tp-dot-hi" cx={CL.x1} cy={t.y} r={3} />)}
      <text className="tp-axis" x={CL.x0} y={CL.base - 8}>baseline · first 15m</text>
      <text className="tp-axis" x={20} y={H - 20}>58 viral of 320</text>
    </>
  );
}

/* ── Weighted Engagement Scoring: the score and what it is made of. ── */
function Weighted() {
  const rows: [string, number, boolean][] = [['Quotes', 25, false], ['Reposts', 31, true], ['Replies', 15, false], ['Likes', 13, false]];
  const bx = 84, bw = 136;
  return (
    <>
      <Head tool="Weighted Engagement Scoring" title="Weighted score" />
      <text className="tp-big" x={18} y={158}>84</text>
      <text className="tp-axis" x={112} y={158}>/100</text>
      {rows.map(([t, v, hi], k) => {
        const y = 214 + k * 20;
        return (
          <g key={t}>
            <text className="tp-label" x={20} y={y + 3}>{t}</text>
            <rect className="tp-track" x={bx} y={y - 1.5} width={bw} height={3} rx={1.5} />
            <rect className={hi ? 'tp-bar tp-bar-hi' : 'tp-bar'} x={bx} y={y - 1.5} width={(bw * v) / 40} height={3} rx={1.5} />
          </g>
        );
      })}
    </>
  );
}

/* ── Post Velocity: views climbing, NOW, then the projection; a typical post beneath. ── */
const VE = { x0: 20, x1: 240, y0: 110, y1: 280 };
const VY = (v: number) => VE.y1 - (v / 1.4) * (VE.y1 - VE.y0); // v in millions
const VX = (m: number) => VE.x0 + (m / 60) * (VE.x1 - VE.x0); // minutes
const VLINE: [number, number][] = [[0, 0], [5, 0.15], [10, 0.27], [20, 0.36], [30, 0.46], [35, 0.6], [40, 0.79], [42, 0.85]];
const VPROJ: [number, number][] = [[42, 0.85], [48, 1.04], [60, 1.25]];
const path = (pts: [number, number][]) => pts.map(([m, v], i) => `${i ? 'L' : 'M'}${VX(m).toFixed(1)} ${VY(v).toFixed(1)}`).join(' ');

function Velocity() {
  return (
    <>
      <Head tool="Post Velocity" title="Total views" />
      <line className="tp-floor" x1={VE.x0} x2={VE.x1} y1={VE.y1} y2={VE.y1} />
      <path className="tp-typical" d={`M${VX(0)} ${VY(0)} L${VX(60)} ${VY(0.33)}`} />
      <path className="tp-line" d={path(VLINE)} />
      <path className="tp-proj" d={path(VPROJ)} />
      <line className="tp-now" x1={VX(42)} x2={VX(42)} y1={VE.y0} y2={VE.y1} />
      <text className="tp-axis tp-now-t" x={VX(42)} y={VE.y0 - 6} textAnchor="middle">NOW</text>
      <circle className="tp-dot-start" cx={VX(42)} cy={VY(0.85)} r={3} />
      <text className="tp-axis" x={VE.x0} y={VE.y1 + 14}>0</text>
      <text className="tp-axis" x={VE.x1} y={VE.y1 + 14} textAnchor="end">+60m</text>
    </>
  );
}

/* ── Cluster Penetration: where the views landed, the four largest clusters. ── */
const CLUSTERS: [string, number, number, number, number][] = [
  // name, share %, cx, cy, r
  ['Founders', 57, 92, 168, 48],
  ['Tech Twitter', 36, 192, 140, 30],
  ['VCs', 34, 186, 228, 28],
  ['Finance', 21, 82, 262, 17],
];

function Cluster() {
  return (
    <>
      <Head tool="Cluster Penetration" title="Where the views landed" />
      {CLUSTERS.map(([name, share, cx, cy, r]) => (
        <g key={name}>
          <circle className="tp-bub" cx={cx} cy={cy} r={r} style={{ fillOpacity: 0.1 + share / 100 } as React.CSSProperties} />
          <text className="tp-label" x={cx} y={r >= 28 ? cy + 3 : cy + r + 12} textAnchor="middle">{name}</text>
        </g>
      ))}
    </>
  );
}

const UIS = [Classifier, Weighted, Velocity, Cluster];

export default function PaneUI({ tool }: { tool: number }) {
  const UI = UIS[tool];
  return (
    <svg className="tp" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <UI />
    </svg>
  );
}
