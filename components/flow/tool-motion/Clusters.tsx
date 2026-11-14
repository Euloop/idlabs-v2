'use client';

import { Av, C, Card, Frame, detailTime, eout, fmt, loopFade, seg, useLoop } from './shared';

/* Cluster Penetration: one watched post's map (it used to open on the list of watched posts and
   click into one; it now opens on the map), replayed over the post's first hours — it lives in Founders and
   VCs, then @elonmusk's quote at +5h spills it into Tech Twitter, Media, Finance and the rest. */

type Bub = { name: string; k: number; share: number; x: number; y: number; s: number; e: number; faces: string[]; dashed?: boolean; inside?: boolean };
const BUBS: Bub[] = [
  { name: 'Founders', k: 512, share: 57, x: 118, y: 238, s: 0, e: 6.2, faces: ['naval', 'levie', 'shl', 'levelsio', 'patio11'], inside: true },
  { name: 'VCs', k: 205, share: 34, x: 262, y: 292, s: 0.6, e: 6.0, faces: ['paulg', 'garrytan', 'bgurley'], inside: true },
  { name: 'Tech Twitter', k: 236, share: 36, x: 272, y: 196, s: 5.0, e: 6.0, faces: ['elonmusk', 'jack', 'karpathy'], inside: true },
  { name: 'Finance', k: 96, share: 21, x: 392, y: 192, s: 5.45, e: 6.4, faces: ['morganhousel', 'chamath'] },
  { name: 'Media', k: 82, share: 18, x: 398, y: 278, s: 5.3, e: 6.3, faces: ['karaswisher', 'WSJ'] },
  { name: 'AI Research', k: 28, share: 9, x: 494, y: 236, s: 5.6, e: 6.5, faces: ['gdb'] },
  { name: 'Design', k: 15, share: 6, x: 556, y: 288, s: 5.8, e: 6.5, faces: ['jsngr'] },
  { name: 'Outside watched clusters', k: 30, share: 0, x: 612, y: 196, s: 5.2, e: 6.5, faces: [], dashed: true },
];
const rad = (k: number) => 2.9 * Math.sqrt(k);
const HOURS = 6.5;
const INSIGHT = [
  'The post lived in Founders and VCs for its first five hours. @elonmusk’s quote (+5h) blew it out of that core —',
  'Tech Twitter, then Media and Finance within 90 minutes, tripling total reach.',
];

export default function Clusters({ playing, time, onEnd }: { playing: boolean; time?: number; onEnd?: () => void }) {
  const raw = useLoop(playing, 8.4, time, onEnd);
  const fade = loopFade(raw);
  const t = detailTime(raw, 3.8); // straight into the post's map (it used to open from the list at 3.3)
  const hrs = HOURS * seg(t, 3.9, 8.7);
  const grow = BUBS.map((b) => eout(seg(hrs, b.s, b.e)));
  const reached = BUBS.filter((b, i) => !b.dashed && grow[i] > 0.04).length;
  const views = BUBS.reduce((a, b, i) => a + b.k * grow[i], 0);
  const quote = seg(hrs, 4.85, 5.25);
  const typed = Math.round(seg(t, 3.9, 8.0) * (INSIGHT[0].length + INSIGHT[1].length));

  return (
    <Frame label="Cluster Penetration: which clusters a post reached and how deep" title="Cluster Penetration" meta="51 posts monitored · resolved 12s ago">
      <g opacity={fade}>
        <g>
            <Card x={14} y={44} w={692} h={32} />
            <Av h="patrickc" x={32} y={60} r={9} />
            <text x={47} y={57} fontSize={8.6} fill={C.ink}>Patrick Collison <tspan fill={C.mute}>@patrickc</tspan></text>
            <text x={47} y={69} fontSize={7.3} fill={C.soft}>Stripe processed more volume in the last 24 hours than in all of 2014. Most…</text>
            <text x={590} y={63} textAnchor="end" className="tm-m" fontSize={7.3} fill={C.soft}>posted 2d ago  ·  <tspan fill={C.ink}>{(views / 1000 + 0.004).toFixed(2)}M views</tspan></text>
            <rect x={598} y={53} width={96} height={15} rx={7.5} fill={C.greenBg} />
            <text x={646} y={63.2} textAnchor="middle" fontSize={7.3} fill={C.green}>{reached} of 11 clusters reached</text>

            <Card x={14} y={82} w={692} h={32} />
            <text x={28} y={95} className="tm-m" fontSize={6.8} fill={C.teal}>Key insight</text>
            <text x={90} y={95} fontSize={7.2} fill={C.soft}>{INSIGHT[0].slice(0, typed)}</text>
            <text x={90} y={107} fontSize={7.2} fill={C.soft}>{INSIGHT[1].slice(0, Math.max(0, typed - INSIGHT[0].length))}</text>

            <Card x={14} y={120} w={692} h={240} />
            <text x={28} y={138} fontSize={9.5} fill={C.ink}>Where the views landed</text>
            <text x={692} y={138} textAnchor="end" fontSize={6.8} fill={C.mute}>bubble area = views contributed · tint = share of cluster reached</text>

            {/* the quote that broke it out */}
            {quote > 0 && (
              <g opacity={Math.min(1, quote * 2)}>
                <path d={`M${BUBS[0].x + 34} ${BUBS[0].y - 58} Q ${BUBS[0].x + 70} ${BUBS[2].y - 58} ${BUBS[2].x - rad(BUBS[2].k) - 3} ${BUBS[2].y - 6}`}
                  fill="none" stroke={C.ink} strokeWidth={0.8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - quote} />
                <text x={BUBS[0].x + 40} y={BUBS[2].y - 44} className="tm-m" fontSize={6.5} fill={C.ink}>@elonmusk quoted · +5h</text>
              </g>
            )}

            {BUBS.map((b, i) => {
              const g = grow[i];
              if (g <= 0) return null;
              const R = rad(b.k) * Math.sqrt(g);
              const tint = 0.18 + (b.share / 57) * 0.5;
              return (
                <g key={b.name}>
                  <circle cx={b.x} cy={b.y} r={R} fill={b.dashed ? 'none' : C.teal} fillOpacity={tint * g} stroke={b.dashed ? C.faint : C.teal} strokeWidth={b.dashed ? 0.8 : i === 0 ? 1.2 : 0.5} strokeOpacity={b.dashed ? 1 : 0.6} strokeDasharray={b.dashed ? '2 2' : undefined} />
                  {b.faces.map((f, j) => {
                    const fk = seg(g, 0.45 + j * 0.1, 0.65 + j * 0.1);
                    if (fk <= 0) return null;
                    const n = b.faces.length;
                    const ang = -Math.PI / 2 + (j / n) * Math.PI * 2 + 0.6;
                    const rr = n === 1 ? 0 : rad(b.k) * (b.inside ? 0.42 : 0.4);
                    const fx = b.x + Math.cos(ang) * rr, fy = b.y + Math.sin(ang) * rr + (b.inside ? 8 : 0);
                    const pulse = f === 'elonmusk' ? Math.sin(Math.PI * seg(hrs, 4.9, 5.6)) : 0;
                    return (
                      <g key={f} opacity={fk}>
                        {pulse > 0 && <circle cx={fx} cy={fy} r={7 + 8 * pulse} fill="none" stroke={C.ink} strokeOpacity={0.5 * (1 - pulse * 0.6)} />}
                        <Av h={f} x={fx} y={fy} r={6 * (0.7 + 0.3 * fk)} />
                      </g>
                    );
                  })}
                  {b.inside ? (
                    <g opacity={seg(g, 0.3, 0.6)}>
                      <text x={b.x} y={b.y - R + 16} textAnchor="middle" fontSize={8.4} fill={C.ink}>{b.name}</text>
                      <text x={b.x} y={b.y - R + 26} textAnchor="middle" className="tm-m" fontSize={6.3} fill={C.soft}>{fmt(b.k * g)}K · {fmt(b.share * g)}% of cluster</text>
                    </g>
                  ) : (
                    <g opacity={seg(g, 0.3, 0.6)}>
                      <text x={b.x} y={b.y + rad(b.k) + 11} textAnchor="middle" fontSize={7.8} fill={C.ink}>{b.name}</text>
                      <text x={b.x} y={b.y + rad(b.k) + 20} textAnchor="middle" className="tm-m" fontSize={6.2} fill={C.mute}>{fmt(b.k * g)}K{b.share ? ` · ${b.share}%` : ''}</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* the replay clock */}
            <line x1={28} x2={692} y1={346} y2={346} stroke={C.grid} strokeWidth={2} strokeLinecap="round" />
            <line x1={28} x2={28 + (hrs / HOURS) * 664} y1={346} y2={346} stroke={C.teal} strokeWidth={2} strokeLinecap="round" />
            <line x1={28 + (5 / HOURS) * 664} x2={28 + (5 / HOURS) * 664} y1={342} y2={350} stroke={C.ink} strokeWidth={0.8} />
            <circle cx={28 + (hrs / HOURS) * 664} cy={346} r={3} fill="#fff" stroke={C.teal} strokeWidth={1.2} />
            <text x={28} y={338} className="tm-m" fontSize={6.3} fill={C.mute}>+{hrs.toFixed(1)}h after posting</text>
            <text x={692} y={338} textAnchor="end" className="tm-m" fontSize={6.3} fill={C.mute}>+6.5h</text>
        </g>
      </g>
    </Frame>
  );
}
