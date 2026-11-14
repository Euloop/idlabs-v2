'use client';

import { Av, C, Card, Cursor, Frame, eio, eout, fmt, lerp, loopFade, rng, seg, useLoop } from './shared';

/* Engagement Classifier: the "Rate vs baseline" plot. Every post starts at its own baseline (its
   first 15 minutes) and runs right as it ages; most sink, a few climb into the green. The plot is
   drawn and still (the lines growing read badly); the walkthrough is the pointer moving over it,
   resting on one post after another — an emerging one, a decaying one, a climber, then the one that
   climbed furthest — its line lit, the rest faded back, its card open (the app's own hover card).
   Right: the counts, and the classifier's calls coming in. */

const PX0 = 70, PX1 = 494, PY0 = 80, PY1 = 320;
const MMIN = 3.2, MMAX = 720, RMAX = 4.9, RMIN = -3.5;
const xs = (m: number) => PX0 + (Math.log(m / MMIN) / Math.log(MMAX / MMIN)) * (PX1 - PX0);
const ys = (r: number) => PY0 + ((RMAX - r) / (RMAX - RMIN)) * (PY1 - PY0);
const X15 = xs(15), Y0 = ys(0);

const FACES = ['elonmusk', 'sama', 'naval', 'paulg', 'karpathy', 'levie', 'MKBHD', 'nytimes', 'FT', 'garrytan', 'jack', 'chamath',
  'dhh', 'satyanadella', 'pmarca', 'rauchg', 'balajis', 'emollick', 'business', 'gdb'];

type Post = { pts: [number, number][]; d: string; r: number; face?: string; color: string; i: number };

const pathD = (a: [number, number][]) => a.map(([x, y], j) => `${j ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

const POSTS: Post[] = (() => {
  const R = rng(11);
  const out: Post[] = [];
  for (let i = 0; i < 74; i++) {
    const hero = i === 0;
    const end = hero ? 4.0 : i < 6 ? 1.1 + R() * 2.1 : i < 10 ? 0.1 + R() * 0.5 : i < 14 ? -0.15 + R() * 0.3 : -0.5 - Math.pow(R(), 0.8) * 2.9;
    const mEnd = hero ? 593 : 15 * Math.pow(48, 0.22 + 0.78 * Math.pow(R(), 0.55));
    // a gentle wander (low frequencies only), so the lines and the dots riding them move smoothly
    const ph = R() * 6, K = 40;
    const pts: [number, number][] = [];
    for (let j = 0; j <= K; j++) {
      const u = j / K;
      const m = 15 * Math.pow(mEnd / 15, u);
      const shape = hero ? Math.pow(u, 1.5) : end < 0 ? (1 - Math.exp(-3.2 * u)) / (1 - Math.exp(-3.2)) : Math.pow(u, 0.9);
      const wob = (0.09 * Math.sin(u * 7.5 + ph) + 0.03 * Math.sin(u * 15 + ph * 2)) * Math.min(1, u * 3);
      pts.push([xs(m), ys(Math.min(RMAX - 0.15, end * shape + wob))]);
    }
    const na = end > 0.5 ? 0.5 + R() * 0.5 : R() * 0.5;
    const g = Math.round(lerp(125, 143, na)), rr = Math.round(lerp(125, 47, na)), b = Math.round(lerp(118, 78, na));
    const face = hero ? 'paularambles' : i % 4 === 1 && FACES.length ? FACES[(i >> 2) % FACES.length] : undefined;
    out.push({ pts, d: pathD(pts), r: hero ? 8 : face ? 6 : 1.8 + R() * 2.6, face, color: `rgb(${rr} ${g} ${b})`, i });
  }
  return out;
})();
const HERO = POSTS[0];

/* The posts the pointer rests on, in turn (each with a face: the card shows who posted it), and when:
   it arrives at `a`, the card is open until `b`. */
const rOf = (y: number) => RMAX - ((y - PY0) / (PY1 - PY0)) * (RMAX - RMIN); // a y back to log2 of the rate
const mOf = (x: number) => MMIN * Math.pow(MMAX / MMIN, (x - PX0) / (PX1 - PX0));  // an x back to minutes
const age = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, '0')}m` : `${Math.round(m)}m`);
type Stop = { p: Post; a: number; b: number; views: string; kind: string; aud: number };
const STOPS: Stop[] = [
  { p: POSTS[9], a: 1.0, b: 2.95, views: '84.2K', kind: 'Emerging', aud: 41 },
  { p: POSTS[17], a: 3.25, b: 5.15, views: '12.6K', kind: 'Decaying', aud: 9 },
  { p: POSTS[1], a: 5.45, b: 7.35, views: '412K', kind: 'Viral', aud: 47 },
  { p: HERO, a: 7.65, b: 9.35, views: '1.7M', kind: 'Viral', aud: 54 },
];
const end = (p: Post) => p.pts[p.pts.length - 1];
// the pointer's path: in from the bottom right, onto each post's end point (just under it), out again
const KEYS: [number, number, number][] = [
  [0.35, PX1 + 40, PY1 + 30],
  ...STOPS.flatMap((s): [number, number, number][] => { const [x, y] = end(s.p); return [[s.a, x + 2, y + 3], [s.b - 0.3, x + 2, y + 3]]; }),
  [9.75, PX1 + 40, PY1 + 30],
];
function pointer(t: number): [number, number] {
  if (t <= KEYS[0][0]) return [KEYS[0][1], KEYS[0][2]];
  for (let i = 1; i < KEYS.length; i++) {
    const [t0, x0, y0] = KEYS[i - 1], [t1, x1, y1] = KEYS[i];
    if (t <= t1) { const k = eio(seg(t, t0, t1)); return [lerp(x0, x1, k), lerp(y0, y1, k)]; }
  }
  return [KEYS[KEYS.length - 1][1], KEYS[KEYS.length - 1][2]];
}

const YL: [number, string][] = [[3, '8× baseline'], [2, '4× baseline'], [1, '2× baseline'], [0, 'baseline'], [-1, '½ baseline'], [-2, '¼ baseline'], [-3, '⅛ baseline']];
const XL: [number, string][] = [[5, '5m'], [10, '10m'], [15, '15m'], [30, '30m'], [60, '1h'], [120, '2h'], [240, '4h'], [480, '8h'], [720, '12h']];

const CALLS = [
  { h: 'patrickc', meta: 'article · 1h 15m · 76.8K', line: '1.12× baseline · 49% new audience ·' },
  { h: 'amasad', meta: 'video · 58m · 123K', line: '1.12× baseline · 39% new audience ·' },
  { h: 'lennysan', meta: 'article · 1h 04m · 50.1K', line: '1.09× baseline · 45% new audience ·' },
];
const COUNTS: [string, number, boolean][] = [['Viral', 58, true], ['Emerging', 8, true], ['Decaying', 230, false], ['High reach', 19, false], ['Flat', 5, false], ['Unscored', 26, false]];

export default function Classifier({ playing, time, onEnd }: { playing: boolean; time?: number; onEnd?: () => void }) {
  const t = useLoop(playing, 7, time, onEnd);
  const fade = loopFade(t);
  const grow = 1; // the counts as they are: nothing counts up
  // how far each stop's hover is on (0…1), and the strongest — the rest of the plot fades back by it
  const on = STOPS.map((s) => Math.min(eout(seg(t, s.a - 0.05, s.a + 0.25)), 1 - seg(t, s.b - 0.25, s.b)));
  const dim = Math.max(...on);
  const lit = (p: Post) => { const k = STOPS.findIndex((s) => s.p === p); return k < 0 ? 0 : on[k]; };
  const [cx, cy] = pointer(t);

  return (
    <Frame label="Engagement Classifier: every post's view rate against its own baseline" title="Engagement Classifier" meta="1,284 posts · polled every 30s">
      <g opacity={fade}>
        <Card x={14} y={44} w={494} h={314} />
        <text x={28} y={62} fontSize={10.5} fill={C.ink}>Rate vs baseline</text>
        <text x={494} y={62} textAnchor="end" className="tm-m" fontSize={7.5} fill={C.mute}>
          {fmt(320 * grow)} posts · <tspan fill={C.green}>{fmt(58 * grow)} viral</tspan> · {fmt(8 * grow)} emerging
        </text>

        {/* the field: unscored before 15m, the green above baseline */}
        <rect x={PX0} y={PY0} width={X15 - PX0} height={PY1 - PY0} fill="#f3f2ee" />
        <rect x={X15} y={PY0} width={PX1 - X15} height={Y0 - PY0} fill={C.zone} />
        <rect x={X15} y={Y0} width={PX1 - X15} height={PY1 - Y0} fill="#f7f6f3" />
        {XL.map(([m]) => <line key={m} x1={xs(m)} x2={xs(m)} y1={PY0} y2={PY1} stroke="#fff" strokeWidth={1} />)}
        {YL.map(([r, l]) => (
          <text key={r} x={PX0 - 6} y={ys(r) + 2.5} textAnchor="end" className="tm-m" fontSize={6.5} fill={r === 0 ? C.ink : C.mute}>{l}</text>
        ))}
        {XL.map(([m, l]) => <text key={l} x={xs(m)} y={PY1 + 11} textAnchor="middle" className="tm-m" fontSize={6.5} fill={C.mute}>{l}</text>)}
        <text x={(PX0 + PX1) / 2} y={PY1 + 23} textAnchor="middle" className="tm-m" fontSize={6.5} fill={C.soft}>post age</text>
        <text x={X15 - 3} y={PY0 + 9} textAnchor="end" className="tm-m" fontSize={6} fill={C.mute}>unscored</text>
        <line x1={X15} x2={X15} y1={PY0} y2={PY1} stroke={C.faint} strokeDasharray="1.5 2" />
        <line x1={PX0} x2={PX1} y1={Y0} y2={Y0} stroke={C.ink} strokeDasharray="4 3" strokeWidth={0.9} />
        <text x={X15 + 4} y={Y0 - 4} className="tm-m" fontSize={6.5} fill={C.ink}>baseline = first 15m</text>

        {/* the posts, drawn: each from the baseline out to its age now; the one pointed at lit (green
            above the baseline, ink below), the rest faded back while it is */}
        {POSTS.map((p) => {
          const l = lit(p);
          const up = end(p)[1] < Y0;
          const base = p === HERO ? 0.55 : 0.42;
          return (
            <path key={p.i} d={p.d} fill="none" stroke={l > 0 ? (up ? C.green : C.ink) : p === HERO ? C.green : '#8f8d87'}
              strokeWidth={lerp(p === HERO ? 0.9 : 0.6, 1.7, l)}
              strokeOpacity={lerp(base * (1 - 0.7 * dim), 1, l)} />
          );
        })}
        {/* the heads, at each line's end: a dot, or the poster's face (ringed green when it climbed);
            the one pointed at a little larger */}
        {POSTS.map((p) => {
          const l = lit(p);
          const o = lerp(1 - 0.6 * dim, 1, l);
          const [ex, ey] = end(p);
          if (p.face) {
            return (
              <g key={p.i} opacity={o}>
                <Av h={p.face} x={ex} y={ey} r={p.r * (1 + 0.25 * l)} ring={p === HERO || ey < Y0 - 20 ? C.green : undefined} />
              </g>
            );
          }
          return <circle key={p.i} cx={ex} cy={ey} r={p.r} fill={p.color} stroke="#fff" strokeWidth={0.6} opacity={o} />;
        })}

        {/* the hover cards: the post pointed at — who, how old, how seen, the call — beside it, kept
            inside the plot (above the point when it is low, below when it is high) */}
        {STOPS.map((st, k) => {
          const h = on[k];
          if (h <= 0) return null;
          const [ex, ey] = end(st.p);
          const hero = st.p === HERO;
          const r = rOf(ey), mult = Math.pow(2, r);
          const w = 214, ht = hero ? 120 : 96;
          const x = Math.max(PX0 + 6, Math.min(PX1 - w - 6, ex - w - 12));
          const y = ey < (PY0 + PY1) / 2 ? Math.min(PY1 - ht - 4, ey + 14) : Math.max(PY0 + 4, ey - ht - 14);
          const green = st.kind === 'Viral' || st.kind === 'Emerging';
          const handle = hero ? 'paularambles' : st.p.face!;
          const rate = `${mult >= 1 ? mult.toFixed(mult >= 10 ? 1 : 2) : mult.toFixed(2)}× baseline`;
          return (
            <g key={k} transform={`translate(${x} ${y + 6 * (1 - h)})`} opacity={h}>
              <rect x={0} y={0} width={w} height={ht} rx={7} fill="#fff" stroke={C.rule} />
              <rect x={0} y={0} width={w} height={ht} rx={7} fill="none" stroke="rgb(0 0 0 / .04)" strokeWidth={4} />
              <Av h={handle} x={15} y={16} r={7} />
              <text x={27} y={15} fontSize={8.5} fill={C.ink}>{hero ? '“paula” ' : ''}<tspan fill={C.mute}>@{handle}</tspan></text>
              <text x={27} y={25} className="tm-m" fontSize={6.3} fill={C.mute}>{hero ? 'text · 9h 53m old · 1.7M views' : `post · ${age(mOf(ex))} old · ${st.views} views`}</text>
              <text x={204} y={15} textAnchor="end" className="tm-m" fontSize={7.5} fill={green ? C.green : C.soft}>{st.kind}</text>
              {hero && <>
                <text x={10} y={44} fontSize={8.2} fill={C.ink}>unsurprisingly the website this is from is</text>
                <text x={10} y={55} fontSize={8.2} fill={C.ink}>literally cookingforengineers dot com</text>
              </>}
              {[['baseline', hero ? '52/min' : '38/min'], ['now', hero ? '2.9K/min' : `${fmt(38 * mult)}/min`], ['new audience', `${st.aud}%`]].map(([l, v], i) => (
                <g key={l}>
                  <text x={10 + i * 70} y={hero ? 72 : 48} className="tm-m" fontSize={6.3} fill={C.mute}>{l}</text>
                  <text x={10 + i * 70} y={hero ? 84 : 60} className="tm-m" fontSize={7.8} fill={C.ink}>{v}</text>
                </g>
              ))}
              <text x={10} y={hero ? 100 : 78} className="tm-m" fontSize={6.6} fill={C.soft}>{hero ? '16.0× baseline · 54% new audience ·' : `${rate} · ${st.aud}% new audience ·`}</text>
              <text x={10} y={hero ? 110 : 88} className="tm-m" fontSize={6.6} fill={C.soft}>{hero ? 'accelerating through reshares.' : st.kind === 'Decaying' ? 'slowing below its own baseline.' : st.kind === 'Emerging' ? 'picking up past its first 15 minutes.' : 'compounding through quotes.'}</text>
            </g>
          );
        })}

        {/* right: the counts, then the calls */}
        <Card x={516} y={44} w={190} h={110} />
        <text x={530} y={62} fontSize={10.5} fill={C.ink}>Right now</text>
        <text x={692} y={62} textAnchor="end" className="tm-m" fontSize={6.5} fill={C.mute}>346 posts</text>
        {COUNTS.map(([l, n, g], i) => {
          const x = 530 + (i % 3) * 58, y = 84 + Math.floor(i / 3) * 34;
          return (
            <g key={l}>
              <text x={x} y={y} className="tm-m" fontSize={6.3} fill={C.mute}>{l}</text>
              <text x={x} y={y + 15} className="tm-m" fontSize={12} fill={g ? C.green : C.ink}>{fmt(n * grow)}</text>
            </g>
          );
        })}

        <Card x={516} y={162} w={190} h={196} />
        <text x={530} y={180} fontSize={10.5} fill={C.ink}>Calls</text>
        <text x={692} y={180} textAnchor="end" className="tm-m" fontSize={6.5} fill={C.mute}>emerging first</text>
        {CALLS.map((c, i) => {
          const k = eout(seg(t, 2.0 + i * 0.45, 2.5 + i * 0.45));
          const y = 204 + i * 50;
          return (
            <g key={c.h} opacity={k} transform={`translate(${6 * (1 - k)} 0)`}>
              {i > 0 && <line x1={524} x2={698} y1={y - 16} y2={y - 16} stroke={C.grid} />}
              <Av h={c.h} x={536} y={y} r={7.5} />
              <text x={549} y={y - 1} fontSize={8.5} fill={C.ink}>@{c.h}</text>
              <text x={549} y={y + 9} className="tm-m" fontSize={6.2} fill={C.mute}>{c.meta}</text>
              <text x={696} y={y - 1} textAnchor="end" fontSize={7.5} fill={C.green}>Emerging</text>
              <text x={549} y={y + 20} fontSize={7.2} fill={C.soft}>{c.line}</text>
            </g>
          );
        })}

        <Cursor x={cx} y={cy} o={Math.min(seg(t, 0.35, 0.7), 1 - seg(t, 9.45, 9.75))} />
      </g>
    </Frame>
  );
}
