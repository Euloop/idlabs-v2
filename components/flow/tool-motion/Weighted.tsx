'use client';

import { Av, C, Card, Frame, Pill, eout, fmt, lerp, loopFade, scenes, seg, useLoop } from './shared';

/* Weighted Engagement: the scored feed (the action weights up top, each post's weighted score
   counting up), the pointer opens the top post, and its breakdown builds — the score, what each
   kind of action contributed, the score against the raw count over 24h, and who it came from. */

const WEIGHTS: [string, number][] = [['Quote', 52], ['Repost', 26], ['Reply', 17], ['Like', 5]];

const POSTS = [
  {
    h: 'naval', name: 'Naval', meta: 'Aug 14 · #1',
    lines: ['The people who get rich in a downturn are the ones', 'who were already building when nobody was watching.', 'Leverage compounds quietly, then all at once. You', 'cannot start compounding the week the market turns.'],
    counts: ['6.1K', '19.8K', '128K', '9.4M', '61.2K'], score: 84, lift: '×1.1', liftUp: false,
    by: ['paulg', 'sama', 'chamath'], top: '+156,855  top @paulg 86', act: 'Reposted',
  },
  {
    h: 'patrickc', name: 'Patrick Collison', meta: 'Aug 19 · #2',
    lines: ['Stripe processed more volume in the last 24 hours', 'than in all of 2014. Most of it from businesses that', 'did not exist in 2014. The compounding is the point.'],
    counts: ['60', '140', '1.1K', '1.2M', '382'], score: 69, lift: '×6.9', liftUp: true,
    by: ['elonmusk', 'levie', 'shl'], top: '+1,307  top @elonmusk 98', act: 'Quoted',
  },
];
const COUNT_L = ['replies', 'reposts', 'likes', 'views', 'saves'];

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

export default function Weighted({ playing, time }: { playing: boolean; time?: number }) {
  const t = useLoop(playing, 7, time);
  const fade = loopFade(t);
  const sc = scenes(t, 3.35);
  const score = eout(seg(t, 3.9, 5.4));

  return (
    <Frame label="Weighted Engagement: each interaction scored by who performed it" title="Weighted Engagement" meta="Rescored 14m ago  ·  weights v3.2">
      <g opacity={fade}>
        {/* A: the scored feed */}
        {sc.a > 0 && (
          <g opacity={sc.a} transform={`translate(${sc.ax} 0)`}>
            <g opacity={eout(seg(t, 0.2, 0.7))}>
              {WEIGHTS.map(([l, w], i) => (
                <g key={l}>
                  <rect x={16 + i * 62} y={44} width={56} height={15} rx={7.5} fill="#fff" stroke={C.rule} />
                  <text x={44 + i * 62} y={54.5} textAnchor="middle" fontSize={7.8} fill={C.ink}>{l} <tspan className="tm-m" fill={C.mute}>{w}</tspan></text>
                </g>
              ))}
              <text x={268} y={54.5} className="tm-m" fontSize={7} fill={C.mute}>× Author Influence 0–100</text>
              <text x={704} y={54.5} textAnchor="end" fontSize={7.8} fill={C.mute}>Sort: <tspan fill={C.ink}>Weighted</tspan></text>
            </g>
            {POSTS.map((p, i) => {
              const k = eout(seg(t, 0.35 + i * 0.18, 0.95 + i * 0.18));
              const x = 14 + i * 350, y = 68;
              const s = eout(seg(t, 1.0 + i * 0.2, 2.3 + i * 0.2));
              const hover = i === 0 ? seg(t, 2.7, 2.9) : 0;
              return (
                <g key={p.h} opacity={k} transform={`translate(${x} ${y + 8 * (1 - k)})`}>
                  <rect x={0.5} y={0.5} width={341} height={263} rx={7} fill="#fff" stroke={hover ? lerp(0, 1, hover) > 0.5 ? '#cfcdc6' : C.rule : C.rule} />
                  <Av h={p.h} x={20} y={22} r={11} />
                  <text x={38} y={20} fontSize={9.8} fill={C.ink}>{p.name} <tspan fill={C.mute}>@{p.h}</tspan></text>
                  <text x={328} y={20} textAnchor="end" className="tm-m" fontSize={6.8} fill={C.mute}>{p.meta}</text>
                  {p.lines.map((l, j) => <text key={j} x={38} y={38 + j * 13} fontSize={9.2} fill={C.ink}>{l}</text>)}
                  {p.counts.map((c, j) => (
                    <text key={j} x={38 + j * 58} y={104} className="tm-m" fontSize={7} fill={C.soft}>{c} <tspan fill={C.faint}>{COUNT_L[j]}</tspan></text>
                  ))}
                  <line x1={0} x2={342} y1={120} y2={120} stroke={C.grid} />
                  <text x={16} y={150} fontSize={8.5} fill={C.soft}>Weighted</text>
                  <text x={64} y={152} fontSize={19} fill={C.ink}>{fmt(p.score * s)}<tspan fontSize={8} fill={C.mute}>/100</tspan></text>
                  <rect x={64} y={158} width={24 * s} height={1.6} fill={C.teal} />
                  <text x={326} y={150} textAnchor="end" className="tm-m" fontSize={8.5} fill={p.liftUp ? C.green : C.soft}>{p.lift}</text>
                  {p.by.map((h, j) => <Av key={h} h={h} x={22 + j * 8} y={184} r={5.5} />)}
                  <text x={46} y={186.5} className="tm-m" fontSize={7} fill={C.soft}>{p.top}</text>
                  <Pill x={326} y={184} w={44} text={p.act} tone="grey" anchor="end" />
                  {/* the live weighting: the four action weights splitting this post's score */}
                  <text x={16} y={218} className="tm-m" fontSize={6.5} fill={C.mute}>score by action</text>
                  {(i === 0 ? CONTRIB : [['Quotes', 38, false], ['Reposts', 14, true], ['Replies', 10, false], ['Likes', 7, false]] as [string, number, boolean][]).map(([l, v, hi], j, arr) => {
                    const tot = arr.reduce((a, b) => a + b[1], 0);
                    const x0 = 16 + arr.slice(0, j).reduce((a, b) => a + b[1], 0) / tot * 310;
                    return (
                      <g key={l}>
                        <rect x={x0} y={226} width={Math.max(0, (v / tot) * 310 * s - 2)} height={6} rx={1.5} fill={hi ? C.teal : ['#6f6e69', '#9b9993', '#c2c0ba', '#d8d6d0'][j]} />
                        <text x={x0} y={246} className="tm-m" fontSize={6.3} fill={C.mute} opacity={s}>{l} {v}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
            <g opacity={eout(seg(t, 1.2, 1.7))}>
              <rect x={14.5} y={340.5} width={691} height={20} rx={10} fill="#fff" stroke={C.rule} />
              <circle cx={28} cy={350.5} r={2} fill="#b8860b" />
              <text x={34} y={353} className="tm-m" fontSize={7} fill="#8a6a1c">Scoring</text>
              <svg x={76} y={343} width={620} height={14}>
                <text x={4 - ((t * 22) % 120)} y={10} className="tm-m" fontSize={7} fill={C.soft}>
                @nytimes “Unemployment among recent…” quoted by @elonmusk (98) · +8 · 31m ago   •   @karpathy “a 20-min walkthrough…” quoted by @lexfridman (82) · +5 · 34m ago
              </text>
              </svg>
            </g>
          </g>
        )}

        {/* B: the post's breakdown */}
        {sc.b > 0 && (
          <g opacity={sc.b} transform={`translate(${sc.bx} 0)`}>
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
        )}
      </g>
    </Frame>
  );
}
