'use client';

import { Av, C, Card, Frame, Spark, detailTime, eout, fmt, lerp, loopFade, rng, seg, useLoop } from './shared';

/* Post Velocity: the fastest post in flight (it used to open on the list of posts and click into
   it; it now opens on the post): its total-views curve is sampled out to now —
   the engagements that bent it marked where they landed, the typical post below, the projection
   past NOW — with its acceleration, checkpoints and projected shelf life underneath. */

// the post's first-hour sparkline (the acceleration card)
const SPARK = (() => {
  const R = rng(40);
  return Array.from({ length: 30 }, (_, j) => 0.15 + R() * 0.35 + (j > 22 ? R() * (j - 20) * 0.18 : 0) + (j < 3 ? 0.6 * R() : 0));
})();

// the watched post: cumulative views (K) by minute
const CUM: [number, number][] = [[0, 0], [1, 70], [3, 150], [5, 196], [10, 288], [15, 342], [20, 386], [25, 414], [30, 436], [32, 470], [35, 556], [37, 688], [40, 830], [42, 936.6]];
const PROJ: [number, number][] = [[42, 936.6], [46, 1010], [50, 1080], [55, 1160], [60, 1240]];
const at = (pts: [number, number][], m: number) => {
  for (let i = 1; i < pts.length; i++) if (m <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (m - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]));
  return pts[pts.length - 1][1];
};
const X0 = 60, X1 = 698, Y0 = 124, Y1 = 262;
const px = (m: number) => X0 + (m / 60) * (X1 - X0);
const py = (v: number) => Y1 - (v / 1500) * (Y1 - Y0);
const NOW = 42;
const EVENTS = [
  { h: 'paulg', m: 3, label: '@paulg · reply', dy: 14 },
  { h: 'patrickc', m: 9, label: '@patrickc · liked', dy: -14 },
  { h: 'naval', m: 31, label: '@naval · quoted', dy: 14 },
];
const BUCKET_TONE = ['#d6d4cd', '#cfe0e0', '#e6e4de', '#e6e4de', '#e6e4de', '#e6e4de', '#cfe0e0', '#dccfb2', '#e6e4de'];

export default function Velocity({ playing, time, onEnd }: { playing: boolean; time?: number; onEnd?: () => void }) {
  const raw = useLoop(playing, 7.6, time, onEnd);
  const fade = loopFade(raw);
  const t = detailTime(raw, 3.7); // straight into the one post (it used to open from the list at 3.3)
  const sweep = NOW * seg(t, 3.8, 7.4); // sampled up to this minute
  const proj = eout(seg(t, 7.45, 8.6));

  const line = (() => {
    let d = '';
    const n = Math.max(1, Math.round(sweep * 2));
    for (let i = 0; i <= n; i++) { const m = (i / n) * sweep; d += `${i ? 'L' : 'M'}${px(m).toFixed(1)} ${py(at(CUM, m)).toFixed(1)}`; }
    return d;
  })();
  const projD = (() => {
    const end = NOW + (60 - NOW) * proj;
    let d = `M${px(NOW)} ${py(at(CUM, NOW))}`;
    for (let m = NOW + 1; m <= end; m += 1) d += ` L${px(m).toFixed(1)} ${py(at(PROJ, m)).toFixed(1)}`;
    return d;
  })();

  return (
    <Frame label="Post Velocity: how fast engagement is accelerating in real time" title="Post Velocity" meta="412 posts in flight · sampled every 30s">
      <g opacity={fade}>
        <g>
            <Card x={14} y={44} w={692} h={34} />
            <Av h="sama" x={32} y={61} r={9} />
            <text x={47} y={58} fontSize={8.6} fill={C.ink}>Sam Altman <tspan fill={C.mute}>@sama</tspan></text>
            <text x={47} y={70} fontSize={7.4} fill={C.soft}>gpt-6 training run finished last night. eval numbers in the image…</text>
            <text x={692} y={64} textAnchor="end" className="tm-m" fontSize={7.4} fill={C.soft}>
              posted 42m ago  ·  <tspan fill={C.ink}>{fmt(at(CUM, sweep) * 1000)} views</tspan>  ·  {fmt(lerp(2100, 40351, seg(t, 3.8, 7.4)))} /min now
            </text>

            <Card x={14} y={84} w={692} h={200} />
            <text x={28} y={102} fontSize={9.5} fill={C.ink}>Total views</text>
            <text x={560} y={101} textAnchor="end" className="tm-m" fontSize={6.6} fill={C.mute}>cumulative impressions · sampled 30s</text>
            {['30s', '1m', '5m', '10m', '15m'].map((l, i) => (
              <g key={l}>
                {l === '5m' && <rect x={571 + i * 26} y={92} width={22} height={13} rx={3} fill="#efeee9" />}
                <text x={582 + i * 26} y={101.5} textAnchor="middle" fontSize={7} fill={l === '5m' ? C.ink : C.mute}>{l}</text>
              </g>
            ))}
            {[0, 375, 750, 1125, 1500].map((v) => (
              <g key={v}>
                <line x1={X0} x2={X1} y1={py(v)} y2={py(v)} stroke={C.grid} />
                <text x={X0 - 5} y={py(v) + 2.5} textAnchor="end" className="tm-m" fontSize={6.3} fill={C.mute}>{v === 0 ? '0' : v >= 1000 ? `${(v / 1000).toFixed(1)}M` : `${v}.0K`}</text>
              </g>
            ))}
            {[0, 15, 30, 45, 60].map((m) => <text key={m} x={px(m)} y={Y1 + 11} textAnchor="middle" className="tm-m" fontSize={6.3} fill={C.mute}>{m ? `+${m}m` : '0'}</text>)}
            {/* views gained per 5 minutes, as the sampling passes them */}
            {BUCKET_TONE.map((tone, b) => {
              const m0 = b * 5, m1 = Math.min(NOW, m0 + 5);
              const k = seg(sweep, m0, m1);
              if (k <= 0) return null;
              const gain = at(CUM, m1) - at(CUM, m0);
              const h = (gain / 420) * (Y1 - Y0) * eout(k);
              return <rect key={b} x={px(m0) + 0.5} y={Y1 - h} width={px(m1) - px(m0) - 1} height={h} fill={tone} opacity={0.85} />;
            })}
            <path d={`M${px(0)} ${py(0)} L${px(60 * Math.min(1, sweep / NOW + proj * 0.3))} ${py(300 * Math.min(1, sweep / NOW + proj * 0.3))}`} stroke={C.faint} strokeDasharray="1.5 2.5" fill="none" />
            <text x={X1} y={py(300) - 4} textAnchor="end" fontSize={6.5} fill={C.mute} opacity={proj}>typical post</text>
            <text x={px(0.5)} y={118} className="tm-m" fontSize={6.3} fill={C.soft} opacity={seg(sweep, 0.3, 1.5)}>+30s ×2.5</text>
            <text x={px(30)} y={118} textAnchor="middle" className="tm-m" fontSize={6.3} fill={C.soft} opacity={seg(sweep, 29, 31)}>+30m ×1.5</text>
            <text x={X1} y={118} textAnchor="end" className="tm-m" fontSize={6.3} fill={C.soft} opacity={proj}>+60m · projected</text>
            <path d={line} fill="none" stroke={C.teal} strokeWidth={1.5} strokeLinejoin="round" />
            {proj > 0 && <path d={projD} fill="none" stroke={C.teal} strokeWidth={1.1} strokeDasharray="1.5 3" />}
            {/* the scan head (sampling), then NOW */}
            <line x1={px(sweep)} x2={px(sweep)} y1={Y0} y2={Y1} stroke={C.teal} strokeWidth={0.8} opacity={sweep >= NOW ? 1 : 0.35} />
            <text x={px(NOW)} y={118} textAnchor="middle" className="tm-m" fontSize={6.5} fill={C.teal} opacity={seg(t, 7.3, 7.6)}>NOW</text>
            <text x={px(NOW) - 5} y={py(at(CUM, NOW)) - 6} textAnchor="end" fontSize={7} fill={C.ink} opacity={seg(t, 7.5, 7.9)}>this post</text>
            {EVENTS.map((e) => {
              const k = eout(seg(sweep, e.m, e.m + 2.2));
              if (k <= 0) return null;
              const x = px(e.m), y = py(at(CUM, e.m));
              return (
                <g key={e.h} opacity={k}>
                  <Av h={e.h} x={x} y={y} r={7 * (0.6 + 0.4 * k)} ring={C.ink} />
                  <text x={x + 10} y={y + e.dy + 2} className="tm-m" fontSize={6.3} fill={C.soft}>{e.label}</text>
                </g>
              );
            })}

            <Card x={14} y={292} w={226} h={66} />
            <text x={28} y={309} fontSize={8.5} fill={C.soft}>Acceleration</text>
            <rect x={164} y={299} width={62} height={14} rx={7} fill={C.greenBg} opacity={seg(t, 5.5, 5.9)} />
            <text x={195} y={308.6} textAnchor="middle" fontSize={7} fill={C.green} opacity={seg(t, 5.5, 5.9)}>↗ Accelerating</text>
            <text x={28} y={333} className="tm-m" fontSize={15} fill={C.ink}>+{fmt(2744 * eout(seg(t, 4.2, 7.4)))}<tspan fontSize={7} fill={C.mute}> /min²</tspan></text>
            <text x={28} y={348} fontSize={6.8} fill={C.mute}>slope of the gain rate · last 10m</text>
            <Spark x={164} y={322} w={62} h={20} pts={SPARK} p={seg(t, 4.0, 7.4)} />

            <Card x={248} y={292} w={226} h={66} />
            <text x={262} y={309} fontSize={8.5} fill={C.soft}>Checkpoints</text>
            <text x={460} y={309} textAnchor="end" className="tm-m" fontSize={6.5} fill={C.mute} opacity={seg(t, 7.3, 7.7)}>×11.5 typical now</text>
            {[['+30s', '45,500 /min', '×2.5 typical', 0.5], ['+30m', '5,975 /min', '×1.5 typical', 30], ['+60m', '— reads in 18m', '', 41.5]].map(([l, v, x, m], i) => (
              <g key={l as string} opacity={seg(sweep, m as number, (m as number) + 1)}>
                <text x={262} y={324 + i * 12} className="tm-m" fontSize={6.8} fill={C.soft}>{l}</text>
                <text x={398} y={324 + i * 12} textAnchor="end" className="tm-m" fontSize={6.8} fill={C.ink}>{v}</text>
                <text x={460} y={324 + i * 12} textAnchor="end" className="tm-m" fontSize={6.3} fill={C.mute}>{x}</text>
              </g>
            ))}

            <Card x={482} y={292} w={224} h={66} />
            <text x={496} y={309} fontSize={8.5} fill={C.soft}>Shelf life</text>
            <text x={692} y={309} textAnchor="end" className="tm-m" fontSize={6.5} fill={C.mute}>still rising at +{Math.round(sweep)}m</text>
            <text x={496} y={331} fontSize={15} fill={C.ink}>{fmt(lerp(4, 31, eout(seg(t, 5.0, 8.0))))}h <tspan fontSize={7} fill={C.mute}>projected · typical text post 9h</tspan></text>
            <rect x={496} y={340} width={196} height={3} rx={1.5} fill="#efeee9" />
            <rect x={496} y={340} width={196 * eout(seg(t, 5.0, 8.0))} height={3} rx={1.5} fill={C.green} />
            <rect x={496} y={346} width={196 * (9 / 31)} height={3} rx={1.5} fill="#d6d4cd" />
        </g>
      </g>
    </Frame>
  );
}
