'use client';

import { Av, C, Card, Frame, Pill, detailTime, eout, fmt, loopFade, seg, useLoop } from './shared';

/* Weighted Engagement: one post's breakdown builds — the score, what each kind of action
   contributed, the score against the raw count over 24h, and who it came from. (It used to open on
   the scored feed and click into the post; it now opens on the breakdown.) */

const CONTRIB: [string, number, boolean][] = [['Quotes', 25, false], ['Reposts', 31, true], ['Replies', 15, false], ['Likes', 13, false]];
const PEOPLE = [
  { h: 'paulg', inf: 86, tier: 'HIGH', act: 'Reposted', cl: 'VCs', col: '#5aa9e6', pts: 9 },
  { h: 'sama', inf: 84, tier: 'HIGH', act: 'Quoted', cl: 'Founders', col: '#3bb273', pts: 8 },
  { h: 'elonmusk', inf: 98, tier: 'ELITE', act: 'Replied', cl: 'Founders', col: '#3bb273', pts: 7 },
  { h: 'chamath', inf: 80, tier: 'STRONG', act: 'Reposted', cl: 'VCs', col: '#5aa9e6', pts: 5 },
  { h: 'JeffBezos', inf: 90, tier: 'ELITE', act: 'Liked', cl: 'Billionaires', col: '#8b6fd8', pts: 2 },
];

// Score over time (index 0–100 against hours after post)
const GX0 = 48, GX1 = 318, GY0 = 190, GY1 = 326;
const gx = (h: number) => GX0 + (h / 24) * (GX1 - GX0);
const gy = (v: number) => GY1 - (v / 100) * (GY1 - GY0);
const curve = (top: number, k: number, p: number) => {
  const n = Math.max(1, Math.round(48 * p));
  let d = '';
  for (let i = 0; i <= n; i++) {
    const h = (i / 48) * 24;
    const v = top * (1 - Math.exp(-h / k)) + (top > 80 ? 0.8 * Math.sin(h * 1.3) * Math.min(1, h / 6) : 0);
    d += `${i ? 'L' : 'M'}${gx(h).toFixed(1)} ${gy(v).toFixed(1)}`;
  }
  return d;
};

export default function Weighted({ playing, time, onEnd }: { playing: boolean; time?: number; onEnd?: () => void }) {
  const raw = useLoop(playing, 7, time, onEnd);
  const fade = loopFade(raw);
  const t = detailTime(raw, 3.7); // straight into the breakdown (it used to open from the feed at 3.35)
  const score = eout(seg(t, 3.9, 5.4));

  return (
    <Frame label="Weighted Engagement: each interaction scored by who performed it" title="Weighted Engagement" meta="Rescored 14m ago  ·  weights v3.2">
      <g opacity={fade}>
        {/* the post's breakdown */}
        <g>
            <Card x={14} y={44} w={218} h={106} />
            <text x={28} y={66} fontSize={9.5} fill={C.soft}>Weighted score</text>
            <text x={27} y={106} fontSize={36} fill={C.ink}>{fmt(84 * score)}<tspan fontSize={11} fill={C.mute}> /100</tspan></text>
            <text x={28} y={124} className="tm-m" fontSize={7.5} fill={C.ink} opacity={seg(t, 4.8, 5.3)}>×1.1 lift <tspan fill={C.mute}>vs raw baseline 76</tspan></text>
            <text x={28} y={138} className="tm-m" fontSize={6.8} fill={C.mute} opacity={seg(t, 5.0, 5.5)}>Rank 1 of 1,284 · 30d</text>

            <Card x={240} y={44} w={466} h={106} />
            <text x={254} y={63} fontSize={9.5} fill={C.ink}>Contribution by type</text>
            <text x={692} y={63} textAnchor="end" fontSize={7.2} fill={C.mute}>Index points · sum {fmt(84 * score)}</text>
            {CONTRIB.map(([l, v, hi], i) => {
              const k = eout(seg(t, 4.3 + i * 0.18, 5.3 + i * 0.18));
              const y = 82 + i * 16;
              return (
                <g key={l}>
                  <text x={254} y={y + 3} fontSize={8.3} fill={C.ink}>{l}</text>
                  <rect x={310} y={y - 2} width={350} height={4} rx={2} fill="#efeee9" />
                  <rect x={310} y={y - 2} width={(v / 100) * 350 * 2.4 * k} height={4} rx={2} fill={hi ? C.teal : '#6f6e69'} />
                  <text x={692} y={y + 3} textAnchor="end" className="tm-m" fontSize={7.8} fill={C.ink}>{fmt(v * k)}</text>
                </g>
              );
            })}
            <text x={254} y={144} fontSize={6.6} fill={C.mute}>Index points = action share × author influence, summed per type</text>

            <Card x={14} y={158} w={318} h={200} />
            <text x={28} y={177} fontSize={9.5} fill={C.ink}>Score over time</text>
            <line x1={210} x2={222} y1={174} y2={174} stroke={C.teal} strokeWidth={1.5} />
            <text x={226} y={176.5} fontSize={7} fill={C.soft}>Weighted</text>
            <line x1={264} x2={276} y1={174} y2={174} stroke={C.mute} strokeDasharray="2 2" />
            <text x={280} y={176.5} fontSize={7} fill={C.soft}>Raw</text>
            {[0, 50, 100].map((v) => (
              <g key={v}>
                <line x1={GX0} x2={GX1} y1={gy(v)} y2={gy(v)} stroke={C.grid} />
                <text x={GX0 - 5} y={gy(v) + 2.5} textAnchor="end" className="tm-m" fontSize={6.3} fill={C.mute}>{v}</text>
              </g>
            ))}
            {[0, 6, 12, 18, 24].map((h) => <text key={h} x={gx(h)} y={GY1 + 11} textAnchor="middle" className="tm-m" fontSize={6.3} fill={C.mute}>{h}h</text>)}
            <text x={(GX0 + GX1) / 2} y={GY1 + 24} textAnchor="middle" fontSize={6.5} fill={C.mute}>Hours after post</text>
            <path d={curve(76, 5.5, eout(seg(t, 4.5, 7.2)))} fill="none" stroke="#8a8883" strokeWidth={1.1} />
            <path d={curve(84, 5, eout(seg(t, 4.6, 7.4)))} fill="none" stroke={C.teal} strokeWidth={1.6} />

            <Card x={340} y={158} w={366} h={200} />
            <text x={354} y={177} fontSize={9.5} fill={C.ink}>Contributors</text>
            <text x={692} y={177} textAnchor="end" fontSize={7.2} fill={C.mute}>Ranked by points</text>
            {[['Account', 354], ['Influence', 470], ['Action', 532], ['Cluster', 596]].map(([l, x]) => (
              <text key={l} x={x as number} y={197} fontSize={7.2} fill={C.soft}>{l}</text>
            ))}
            <text x={692} y={197} textAnchor="end" fontSize={7.2} fill={C.soft}>Points</text>
            <line x1={340} x2={706} y1={204} y2={204} stroke={C.grid} />
            {PEOPLE.map((p, i) => {
              const k = eout(seg(t, 5.4 + i * 0.28, 5.9 + i * 0.28));
              const y = 220 + i * 24;
              return (
                <g key={p.h} opacity={k} transform={`translate(${8 * (1 - k)} 0)`}>
                  <Av h={p.h} x={360} y={y} r={6} />
                  <text x={371} y={y + 3} fontSize={8.2} fill={C.ink}>@{p.h}</text>
                  <text x={470} y={y + 3} className="tm-m" fontSize={7.5} fill={C.ink}>{p.inf} <tspan fontSize={5.8} fill={C.mute}>{p.tier}</tspan></text>
                  <Pill x={532} y={y} w={40} text={p.act} tone="grey" />
                  <circle cx={599} cy={y} r={2.2} fill={p.col} />
                  <text x={605} y={y + 3} fontSize={7.8} fill={C.soft}>{p.cl}</text>
                  <text x={692} y={y + 3} textAnchor="end" className="tm-m" fontSize={8} fill={C.ink}>+{p.pts}</text>
                </g>
              );
            })}
            <text x={354} y={347} className="tm-m" fontSize={6.8} fill={C.mute} opacity={seg(t, 7.0, 7.4)}>+ 156,855 others</text>
            <text x={692} y={347} textAnchor="end" className="tm-m" fontSize={7.5} fill={C.ink} opacity={seg(t, 7.0, 7.4)}>+53</text>
        </g>
      </g>
    </Frame>
  );
}
