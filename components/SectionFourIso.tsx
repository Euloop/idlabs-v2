'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './iso.css';

/* Section 4, exploded-isometric version (/home-2 only; option B for the analytical tools).
   The four tools are the parts of one small device, each a different shape: a lid with a
   screen (Engagement Classifier), a circuit board with a chip (Weighted Engagement Scoring), a
   frame plate with a window cut through it (Post Velocity) and a base tray with a recessed floor
   (Cluster Penetration), held together by two screws. Assembled, it is one closed gadget (lid on
   tray, screw heads showing; the board and frame are inside), with the tools intro line under
   it. As you scroll it comes apart: the screws lift out, the parts separate, construction guides
   appear at the outer corners and each tool's name slides in on a leader (alternating sides). Hover or focus a name or a layer: it lifts, its
   etching turns accent, and its info card folds out on that side, hinged on the edge facing
   the device. Line drawing on the page's own paper (no tinted fills), dark and light.
   Copy is the client's (TOOLS as in SectionFour.tsx; INTRO as in ToolsIntro.tsx).
   Pinned; scroll budget: 1.3 viewport to come apart, then hold. `light`: the same section on
   the light page (data-lights-up switches the page theme while it is on screen). */

const INTRO =
  'We turned this research into software, built on 2B+ data points, that weights every engagement by the engager’s influence, measures engagement velocity in real time, and maps how deep a post penetrates each niche, to forecast its reach and shelf-life within the first 30 minutes.';

const TOOLS = [
  {
    name: 'Engagement Classifier',
    href: 'https://graphs-seven-pi.vercel.app/tools/classifier',
    text: 'A post is only fast or slow compared to itself. The classifier takes a post’s engagement rate in its first 15 minutes as a baseline and measures its performance after against it. This lets us predict how far a post will go within 30 minutes.',
  },
  {
    name: 'Weighted Engagement Scoring',
    href: 'https://graphs-seven-pi.vercel.app/tools/scoring',
    text: 'A 100 likes from a 100 strangers is not the same as 1 quote from someone important. Weighted Engagement scores each interaction by who performed it -their influence, their cluster, the kind of action.',
  },
  {
    name: 'Post Velocity',
    href: 'https://graphs-seven-pi.vercel.app/tools/velocity',
    text: 'Tracks how fast engagement is accelerating in real time. A steep curve in the first 6 hours is the strongest predictor of a breakout. Combined with the Classifier, it tells us how a launch/post will perform within its first 30 minutes.',
  },
  {
    name: 'Cluster Penetration',
    href: 'https://graphs-seven-pi.vercel.app/tools/clusters',
    text: 'Measures how deep a post travelled within a niche. When a post goes out, we can see which clusters it reached and how much of each it covered.',
  },
];

/* ── Geometry (SVG units, viewBox VW × VH). Parts are rounded rectangles in plate coordinates
   (u, v; the full footprint is S × S), projected isometrically and extruded by their thickness. */
const VW = 1000;
const VH = 660;
const S = 230;
const C = Math.cos(Math.PI / 6);
const SN = 0.5;
const X0 = VW / 2;
const GAP_OUT = 92; // part to part, apart
const LIFT = 70; // assembled: the gadget sits this much higher, the intro line under it
const LABEL_IN = 64;

const r2 = (n: number) => Math.round(n * 100) / 100;
type Pt = [number, number];
const P = (u: number, v: number): Pt => [r2(X0 + (u - v) * C), r2((u + v) * SN)];
const poly = (p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(' ');
const down = (p: Pt[], t: number) => p.map(([x, y]): Pt => [x, r2(y + t)]);

/* A rounded rectangle, projected: its outline, the extruded side band, and its outer extremes. */
type Rect = { u: number; v: number; w: number; h: number; r: number };
function solid({ u, v, w, h, r }: Rect, t: number) {
  const pts: Pt[] = [];
  const arc = (cu: number, cv: number, a0: number) => {
    for (let k = 0; k <= 8; k++) { const a = a0 + (k / 8) * (Math.PI / 2); pts.push(P(cu + Math.cos(a) * r, cv + Math.sin(a) * r)); }
  };
  arc(u + w - r, v + r, -Math.PI / 2);
  arc(u + w - r, v + h - r, 0);
  arc(u + r, v + h - r, Math.PI / 2);
  arc(u + r, v + r, Math.PI);
  const xs = pts.map((p) => p[0]);
  const iL = xs.indexOf(Math.min(...xs));
  const iR = xs.indexOf(Math.max(...xs));
  const lower = pts.slice(iR, iL + 1); // rightmost → front → leftmost
  return {
    top: poly(pts),
    outline: pts,
    band: poly([...lower, ...down(lower, t).reverse()]),
    left: pts[iL],
    right: pts[iR],
  };
}

/* A vertical cylinder (screw head, shaft): top ellipse + body, at screen point (x, y). */
const cyl = (x: number, y: number, r: number, h: number) => {
  const rx = r2(Math.SQRT2 * C * r), ry = r2(Math.SQRT2 * SN * r);
  return {
    body: `M${x - rx} ${y} V${r2(y + h)} A${rx} ${ry} 0 0 0 ${x + rx} ${r2(y + h)} V${y} Z`,
    rx, ry,
  };
};

/* Parts, top to bottom (index = tool). */
type Etch = { d?: string; dash?: string; circles?: [number, number, number][]; accent?: boolean; dy?: number };
const HOLES: Pt[] = [[24, S - 24], [S - 24, 24]]; // left and right corners, clear of the screen
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); };
const BOARD: Rect = { u: 36, v: 48, w: 158, h: 136, r: 8 };
const CHIP: Rect = { u: 94, v: 94, w: 42, h: 42, r: 3 };
const WINDOW: Rect = { u: 126, v: 26, w: 80, h: 80, r: 8 };
const RECESS: Rect = { u: 16, v: 16, w: S - 32, h: S - 32, r: 12 };
const rr = ({ u, v, w, h, r }: Rect) => `M${u + r} ${v} H${u + w - r} A${r} ${r} 0 0 1 ${u + w} ${v + r} V${v + h - r} A${r} ${r} 0 0 1 ${u + w - r} ${v + h} H${u + r} A${r} ${r} 0 0 1 ${u} ${v + h - r} V${v + r} A${r} ${r} 0 0 1 ${u + r} ${v} Z`;

const PARTS: { rect: Rect; t: number; etch: Etch[] }[] = [
  // Lid · Engagement Classifier: a screen with bars against the 15-minute baseline; screw holes
  {
    rect: { u: 0, v: 0, w: S, h: S, r: 22 }, t: 9,
    etch: [
      { d: rr({ u: 44, v: 52, w: 142, h: 126, r: 8 }) },
      { d: 'M56 160 H174' },
      { d: 'M56 122 H174', dash: '3 4' },
      { d: [24, 36, 30, 52, 72, 94].map((h, k) => { const x = 62 + k * 18; return `M${x} 160 V${160 - h} H${x + 9} V160`; }).join(' '), accent: true },
      { circles: HOLES.map(([u, v]): [number, number, number] => [u, v, 5]) },
    ],
  },
  // Board · Weighted Engagement Scoring: smaller board, the network as traces out from the chip
  {
    rect: BOARD, t: 5,
    etch: [
      {
        d: Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2 + 0.4, r = 44 + rnd(k) * 16;
          return `M${r2(115 + Math.cos(a) * 30)} ${r2(115 + Math.sin(a) * 30)} L${r2(115 + Math.cos(a) * r)} ${r2(115 + Math.sin(a) * r)}`;
        }).join(' '),
        circles: Array.from({ length: 8 }, (_, k): [number, number, number] => {
          const a = (k / 8) * Math.PI * 2 + 0.4, r = 44 + rnd(k) * 16;
          return [r2(115 + Math.cos(a) * r), r2(115 + Math.sin(a) * r), r2(2.5 + rnd(k + 20) * 4)];
        }),
        accent: true,
      },
      { d: Array.from({ length: 8 }, (_, k) => `M${62 + k * 14} ${BOARD.v + BOARD.h - 12} h7 v6 h-7 Z`).join(' ') },
    ],
  },
  // Frame · Post Velocity: a plate with a window cut through it; the curve beside it
  {
    rect: { u: 0, v: 0, w: S, h: S, r: 22 }, t: 7,
    etch: [
      { d: 'M26 128 V204 H112' },
      { d: 'M' + Array.from({ length: 22 }, (_, k) => { const t = k / 21; return `${r2(26 + t * 86)} ${r2(204 - 72 * Math.pow(t, 2.4))}`; }).join(' L'), accent: true },
      { d: 'M48 128 V204', dash: '3 4' },
    ],
  },
  // Tray · Cluster Penetration: a deep base with a recessed floor; the clusters on the floor
  {
    rect: { u: 0, v: 0, w: S, h: S, r: 22 }, t: 34,
    etch: [
      { d: rr(RECESS) },
      { d: 'M50 112 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0 M112 82 a36 36 0 1 0 72 0 a36 36 0 1 0 -72 0 M110 152 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0', dy: 8 },
      {
        circles: Array.from({ length: 20 }, (_, k): [number, number, number] => {
          const a = rnd(k) * Math.PI * 2, r = Math.sqrt(rnd(k + 50)) * 32;
          return [r2(90 + Math.cos(a) * r), r2(112 + Math.sin(a) * r), 1.5];
        }),
        accent: true, dy: 8,
      },
    ],
  },
];
const SOLIDS = PARTS.map((p) => solid(p.rect, p.t));
const CHIP_S = solid(CHIP, 9);
const WIN_S = solid(WINDOW, 0);
const RECESS_S = solid(RECESS, 0);
/* The recess floor's far edge: the rim's back chain (leftmost → back → rightmost), 8 lower. */
const RECESS_FLOOR = (() => {
  const o = RECESS_S.outline, iL = o.indexOf(RECESS_S.left), iR = o.indexOf(RECESS_S.right);
  return poly(down([...o.slice(iL), ...o.slice(0, iR + 1)], 8));
})();

/* Tray front face (the left side band): a port slot and a status light. */
const sidePt = (u: number, t: number): Pt => { const [x, y] = P(u, S); return [x, r2(y + t)]; };
const PORT = poly([sidePt(64, 13), sidePt(112, 13), sidePt(112, 21), sidePt(64, 21)]);
const LED = sidePt(150, 17);

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

export default function SectionFourIso({ light = false }: { light?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [e, setE] = useState(0); // 0 assembled → 1 apart
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const s = sectionRef.current;
    if (!s) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const p = -s.getBoundingClientRect().top / window.innerHeight; // viewports since pinned
      setE(smooth(clamp((p - 0.1) / 1.2)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const gap = GAP_OUT * e;
  // Part top-face offsets. Assembled (e = 0) the lid sits on the tray and the board and frame
  // are inside it (hidden); apart, every part is GAP below the one above.
  const T = PARTS.map((p) => p.t);
  const screwLift = gap * 1.15;
  const yLid = 0;
  const yBoard = yLid + T[0] + gap;
  const yFrame = yBoard + T[1] * e + gap;
  const yTray = yFrame + T[2] * e + gap;
  const total = screwLift + S + T[0] + (yTray - yLid) - T[0] + T[3]; // screws top → tray bottom
  const y0 = (VH - total) / 2 - LIFT * (1 - e) + screwLift;
  const layerY = [yLid, yBoard, yFrame, yTray].map((y) => y + y0);
  const labelsOn = e > 0.7;
  const open = labelsOn ? hover : null;
  const lift = (i: number) => (open === i ? 8 : 0);
  const apart = smooth(clamp((e - 0.15) / 0.5));
  const inner = smooth(clamp(e / 0.3)); // board and frame come out of the tray
  const introOn = 1 - smooth(clamp(e / 0.22));

  // where each name's leader meets its part (outer extreme point, mid-thickness)
  const anchor = (i: number) => {
    const left = i % 2 === 0;
    const [x, y] = left ? SOLIDS[i].left : SOLIDS[i].right;
    return { left, x, y: layerY[i] + y + T[i] / 2 - lift(i) };
  };

  return (
    <section
      ref={sectionRef}
      className="iso"
      data-mode={light ? 'light' : 'dark'}
      data-lights-up={light || undefined}
      data-foot="/Analytical Tools"
      aria-label={light ? 'Analytical tools (light)' : 'Analytical tools'}
    >
      <div className="iso-pin">
        <div className="frame iso-frame">
          <div className="iso-box" onPointerLeave={() => setHover(null)}>
            <svg className="iso-svg" viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label="The four analytical tools as the parts of one device: a lid, a circuit board, a frame and a base tray">
              {/* Construction guides from lid to tray at the outer corners. */}
              <g className="iso-guides" style={{ opacity: apart }}>
                {(['left', 'right'] as const).map((side) => {
                  const [x, y] = SOLIDS[0][side];
                  return <path key={side} d={`M${x} ${r2(layerY[0] + y + T[0] + 6)} V${r2(layerY[3] + SOLIDS[3][side][1] - 6)}`} />;
                })}
              </g>

              {/* Parts, bottom first so upper parts cover lower ones. */}
              {[3, 2, 1, 0].map((i) => {
                const y = layerY[i] - lift(i);
                const s = SOLIDS[i];
                return (
                  <g
                    key={i}
                    className="iso-plate"
                    data-on={open === i || undefined}
                    data-dim={(open !== null && open !== i) || undefined}
                    style={{ transform: `translateY(${r2(y)}px)`, opacity: i === 1 || i === 2 ? inner : undefined }}
                    onPointerEnter={() => labelsOn && setHover(i)}
                  >
                    <polygon className="iso-side" points={s.band} />
                    <polygon className="iso-top" points={s.top} />
                    {i === 3 && (
                      <>
                        {/* recess: rim, and its back walls down to the floor */}
                        <polygon className="iso-top" points={RECESS_S.top} />
                        <polyline className="iso-edge-soft" points={RECESS_FLOOR} />
                        <polygon className="iso-port" points={PORT} />
                        <circle className="iso-led" cx={LED[0]} cy={LED[1]} r={2.4} />
                      </>
                    )}
                    {i === 2 && (
                      <>
                        {/* the window cut through the frame: its rim and inner wall */}
                        <polygon className="iso-hole" points={WIN_S.top} />
                        <polygon className="iso-hole-wall" points={poly(down(WIN_S.outline, PARTS[2].t))} />
                      </>
                    )}
                    <g className="iso-etch" transform={`matrix(${C} ${SN} ${-C} ${SN} ${X0} 0)`}>
                      {PARTS[i].etch.map((et, k) => (
                        <g key={k} className={et.accent ? 'iso-ac' : undefined} transform={et.dy ? `translate(${et.dy} ${et.dy})` : undefined /* a screen drop of dy, in plate coords */}>
                          {et.d && <path d={et.d} strokeDasharray={et.dash} />}
                          {et.circles?.map(([u, v, r], j) => <circle key={j} cx={u} cy={v} r={r} />)}
                        </g>
                      ))}
                    </g>
                    {i === 1 && (
                      <>
                        <polygon className="iso-side" points={CHIP_S.band} transform="translate(0 -9)" />
                        <polygon className="iso-top" points={CHIP_S.top} transform="translate(0 -9)" />
                      </>
                    )}
                  </g>
                );
              })}

              {/* Screws: heads on the lid when assembled; lifted out, with their shafts, when apart. */}
              {HOLES.map(([u, v], k) => {
                const [x, yh] = P(u, v);
                const top = layerY[0] - lift(0) + yh - 5 - screwLift;
                const shaft = Math.min(screwLift, 30);
                const sh = cyl(x, r2(top + 5), 3, shaft);
                const head = cyl(x, r2(top), 7, 5);
                return (
                  <g key={k} className="iso-screw" data-dim={(open !== null && open !== 0) || undefined}>
                    {screwLift > 30 && <path className="iso-guide-s" d={`M${x} ${r2(top + 5 + shaft + 4)} V${r2(layerY[0] - lift(0) + yh - 3)}`} />}
                    {shaft > 0.5 && <path className="iso-side" d={sh.body} />}
                    <path className="iso-side" d={head.body} />
                    <ellipse className="iso-top" cx={x} cy={r2(top)} rx={head.rx} ry={head.ry} />
                    <path className="iso-edge-soft" d={`M${r2(x - head.rx * 0.5)} ${r2(top)} H${r2(x + head.rx * 0.5)}`} />
                  </g>
                );
              })}

              {/* Leaders, alternating sides (the names are the HTML buttons below). */}
              {TOOLS.map((t, i) => {
                const { left, x, y } = anchor(i);
                const x1 = left ? x - 10 : x + 10;
                const x2 = left ? x - LABEL_IN : x + LABEL_IN;
                const show = smooth(clamp((e - 0.55 - i * 0.06) / 0.25));
                return (
                  <g key={t.name} className="iso-label" data-on={open === i || undefined}
                    style={{ opacity: show, transform: `translateX(${r2((1 - show) * (left ? 10 : -10))}px)` }}>
                    <path className="iso-leader" d={`M${x2} ${y} H${x1}`} />
                    <path className="iso-arrow" d={left ? `M${x1 - 5} ${y - 3} L${x1} ${y} L${x1 - 5} ${y + 3}` : `M${x1 + 5} ${y - 3} L${x1} ${y} L${x1 + 5} ${y + 3}`} />
                  </g>
                );
              })}
            </svg>

            {/* The tools intro line, under the assembled device; it fades as the layers part. */}
            <p className="iso-intro" style={{ top: `${((y0 + total + 34) / VH) * 100}%`, opacity: introOn, visibility: introOn > 0 ? 'visible' : 'hidden' }}>
              {INTRO}
            </p>

            {/* Names: focusable buttons at the end of each leader. */}
            {TOOLS.map((t, i) => {
              const { left, x, y } = anchor(i);
              const show = smooth(clamp((e - 0.55 - i * 0.06) / 0.25));
              return (
                <button
                  key={t.name}
                  type="button"
                  className="iso-hit"
                  data-side={left ? 'l' : 'r'}
                  data-on={open === i || undefined}
                  tabIndex={labelsOn ? 0 : -1}
                  aria-expanded={open === i}
                  aria-controls={`iso-card-${light ? 'l' : 'd'}-${i}`}
                  style={{
                    top: `${(y / VH) * 100}%`,
                    [left ? 'right' : 'left']: `${((left ? VW - (x - LABEL_IN - 10) : x + LABEL_IN + 10) / VW) * 100}%`,
                    opacity: show, visibility: show > 0 ? 'visible' : 'hidden',
                    translate: `${r2((1 - show) * (left ? 10 : -10))}px -50%`,
                  } as CSSProperties}
                  onPointerEnter={() => labelsOn && setHover(i)}
                  onFocus={() => setHover(i)}
                  onClick={() => setHover((h) => (h === i ? null : i))}
                >
                  {t.name}
                </button>
              );
            })}

            {/* Info cards: beside each name, hinged on the edge facing the device. */}
            {TOOLS.map((t, i) => {
              const { left, x, y } = anchor(i);
              return (
                <div
                  key={t.name}
                  id={`iso-card-${light ? 'l' : 'd'}-${i}`}
                  className="iso-card"
                  data-side={left ? 'l' : 'r'}
                  data-open={open === i || undefined}
                  aria-hidden={open !== i}
                  style={{
                    top: `${(y / VH) * 100}%`,
                    [left ? 'right' : 'left']: `${((left ? VW - (x - 14) : x + 14) / VW) * 100}%`,
                    '--ty': `${[-22, -40, -60, -78][i]}%`,
                  } as CSSProperties}
                  onPointerEnter={() => setHover(i)}
                >
                  <h3 className="iso-card-title">{t.name}</h3>
                  <p className="iso-card-text">{t.text}</p>
                  <a className="iso-try" href={t.href} target="_blank" rel="noopener noreferrer" tabIndex={open === i ? 0 : -1}
                    aria-label={`Try ${t.name} (opens in a new tab)`}>[Try it →]</a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
