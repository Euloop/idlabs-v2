'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './tools-collage.css';

/* Analytical tools, "Collage" layout (/home-2; option to Graph, Device and Stack). Figma
   "Tool section variant 4" (163:713, white) and "… - paper light theme" (165:762). A collage of
   archive scraps fills the frame rule to rule; a frosted glass card sits over it. Left: the title,
   the active tool's lead line and the four tool names. Right: two of the tool's own views (the
   ones with a chart in them), each with a note on a leader (text, a run, a bend, a dot on the
   image). The tools cycle on their own (7s); click a name to pick one; cycling pauses while the
   pointer is on the card. `theme`: white, paper (the paper light theme: warm paper page, its own rules) or dark (the same sheet
   in the dark: brown-black paper, the collage dimmed to sepia, the glass smoked).
   All copy is the client's (the tool texts and the tools intro, cut at sentence or clause
   boundaries, never reworded). Coordinates are Figma px in the card (972 × 467); the CSS scales
   them with the frame (--u). */

type Shot = { src: string; w: number; h: number; alt: string };
type Tool = {
  name: string;
  href: string;
  lead: string;
  /* a: the image the upper note points at, b: the one the lower note points at */
  a: Shot; b: Shot;
  noteA: string; noteB: string;
  /* row: b | a side by side (b on the left); col: a over b */
  layout: 'row' | 'col';
};

const S = (f: string, w: number, h: number, alt: string): Shot => ({ src: `/assets/tools/${f}.webp`, w, h, alt });

const TOOLS: Tool[] = [
  {
    name: 'Engagement Classifier',
    href: 'https://graphs-seven-pi.vercel.app/tools/classifier',
    lead: 'A post is only fast or slow compared to itself.',
    a: S('classifier-4', 818, 649, 'Rate vs baseline: each post’s engagement rate against its own first 15 minutes'),
    b: S('classifier-3', 320, 499, 'Calls: posts the classifier marks as emerging'),
    noteA: 'The classifier takes a post’s engagement rate in its first 15 minutes as a baseline and measures its performance after against it.',
    noteB: 'This lets us predict how far a post will go within 30 minutes.',
    layout: 'row',
  },
  {
    name: 'Weighted Engagement Scoring',
    href: 'https://graphs-seven-pi.vercel.app/tools/scoring',
    lead: 'A 100 likes from a 100 strangers is not the same as 1 quote from someone important.',
    a: S('weighted-score', 920, 307, 'Weighted score and its contribution by type of action'),
    b: S('weighted-curve', 560, 299, 'Weighted score over time against the raw baseline'),
    noteA: 'Weighted Engagement scores each interaction by who performed it -their influence, their cluster, the kind of action.',
    noteB: 'Weights every engagement by the engager’s influence',
    layout: 'col',
  },
  {
    name: 'Post Velocity',
    href: 'https://graphs-seven-pi.vercel.app/tools/velocity',
    lead: 'Tracks how fast engagement is accelerating in real time.',
    a: S('velocity-5', 1120, 452, 'Total views over time for one post'),
    b: S('velocity-1', 806, 302, 'Projected views with the typical range'),
    noteA: 'A steep curve in the first 6 hours is the strongest predictor of a breakout.',
    noteB: 'Combined with the Classifier, it tells us how a launch/post will perform within its first 30 minutes.',
    layout: 'col',
  },
  {
    name: 'Cluster Penetration',
    href: 'https://graphs-seven-pi.vercel.app/tools/clusters',
    lead: 'Measures how deep a post travelled within a niche.',
    a: S('cluster-3', 1120, 520, 'Where the views landed, by cluster'),
    b: S('cluster-2', 1120, 367, 'Penetration by cluster'),
    noteA: 'When a post goes out, we can see which clusters it reached',
    noteB: 'and how much of each it covered.',
    layout: 'col',
  },
];

/* The images' box in the card: centred where the design has them (436–916 × 114–362), at most
   480 wide; side by side at most 248 tall (the design's), stacked at most 256 (so 12px notes of
   three or four lines still fit above and below inside the card). */
const CX = 676, CY = 238, MAXW = 480, MAXH_ROW = 248, MAXH_COL = 256, GAP = 8, COL_DROP = 12;
type Rect = { x: number; y: number; w: number; h: number };
function place(t: Tool): { a: Rect; b: Rect } {
  const ra = t.a.w / t.a.h, rb = t.b.w / t.b.h;
  if (t.layout === 'row') {
    const h = Math.min(MAXH_ROW, (MAXW - GAP) / (ra + rb));
    const wb = h * rb, wa = h * ra, x0 = CX - (wb + GAP + wa) / 2, y = CY - h / 2;
    return { b: { x: x0, y, w: wb, h }, a: { x: x0 + wb + GAP, y, w: wa, h } };
  }
  const w = Math.min(MAXW, (MAXH_COL - GAP) / (1 / ra + 1 / rb));
  // stacked pairs sit COL_DROP lower, where the lower note has room to spare
  const ha = w / ra, hb = w / rb, x = CX - w / 2, y0 = CY + COL_DROP - (ha + GAP + hb) / 2;
  return { a: { x, y: y0, w, h: ha }, b: { x, y: y0 + ha + GAP, w, h: hb } };
}

/* Leaders, from the design's two vectors (129, 130): 1px ink, a dot of r 2.67.
   Upper note → image a: from the note's last line, RUN across, then a short slant down to a dot
   just above the image. Lower note ← image b: a dot just below the image, a slant down, then
   across to the note's line. Notes are 12px on an 18px line (LINE = half of it); the lower
   note is narrowed when needed so it ends NOTE_EDGE inside the card's right edge. */
const RUN = 48, SLANT_X = 8, SLANT_Y = 34, SLANT_YB = 24, CLEAR_A = 11, CLEAR_B = 9, TEXT_GAP = 10, NOTE_W = 300, NOTE_EDGE = 20, LINE = 9;
function leaders(r: { a: Rect; b: Rect }) {
  const da = { x: r.a.x + r.a.w * 0.8, y: r.a.y - CLEAR_A };
  const ya = da.y - SLANT_Y, xa0 = da.x - SLANT_X - RUN;
  const db = { x: r.b.x + r.b.w * 0.42, y: r.b.y + r.b.h + CLEAR_B };
  const yb = db.y + SLANT_YB, xb1 = db.x + SLANT_X + RUN / 2;
  const left = xb1 + TEXT_GAP;
  return {
    a: { d: `M${xa0} ${ya} H${da.x - SLANT_X} L${da.x} ${da.y}`, dot: da, note: { right: xa0 - TEXT_GAP, bottom: ya + LINE, width: NOTE_W } },
    b: { d: `M${db.x} ${db.y} L${db.x + SLANT_X} ${yb} H${xb1}`, dot: db, note: { left, top: yb - LINE, width: Math.min(NOTE_W, 972 - NOTE_EDGE - left) } },
  };
}

/* The collage behind the card (Figma 163:728), in paint order, box px (1056 × 569).
   [file, left, top, width, height, blend?, rotate°?, inner w, inner h, opacity?, fit-top?] —
   rotated scraps: the box is the rotated image's bounds and the image (inner w × h) is centred in it. */
type Scrap = { f: string; x: number; y: number; w: number; h: number; blend?: CSSProperties['mixBlendMode']; rot?: number; iw?: number; ih?: number; o?: number; top?: boolean };
const SCRAPS: Scrap[] = [
  { f: 'c1', x: 579, y: -29, w: 600, h: 771 },
  { f: 'c2', x: 308, y: -70, w: 400, h: 400, blend: 'darken' },
  { f: 'c3', x: 171, y: 97, w: 424, h: 516, blend: 'darken' },
  { f: 'c4', x: 551, y: 318, w: 214.743, h: 287.825, blend: 'lighten', rot: -11.43, iw: 166.523, ih: 259.98 },
  { f: 'c5', x: -35, y: -70, w: 392, h: 496, top: true },
  { f: 'c6', x: 401, y: 192, w: 275.116, h: 196.269, blend: 'darken', rot: -14.04, iw: 248.539, ih: 140.176 },
  { f: 'c7', x: 0, y: 192, w: 242, h: 381 },
  { f: 'c8', x: 124, y: 238, w: 325.723, h: 325.723, blend: 'multiply', rot: -21.58, iw: 251, ih: 251, o: 0.67 },
  { f: 'c9', x: 475.43, y: 179.52, w: 178.137, h: 220.961, rot: 4.89, iw: 161, ih: 208 },
];

const CYCLE_MS = 7000;
const v = (n: number) => `calc(${n.toFixed(2)} * var(--u))`;

function Scraps({ blur = false }: { blur?: boolean }) {
  return (
    <div className={blur ? 'tcl-scraps tcl-blur' : 'tcl-scraps'} aria-hidden="true">
      <div className="tcl-scraps-in">
      {SCRAPS.map((s) => (
        <div key={s.f} className="tcl-scrap" style={{ left: v(s.x), top: v(s.y), width: v(s.w), height: v(s.h), mixBlendMode: s.blend } as CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/assets/tools-collage/${s.f}.webp`} alt="" draggable={false}
            className={s.top ? 'tcl-fit-top' : undefined}
            style={s.rot !== undefined ? { width: v(s.iw!), height: v(s.ih!), rotate: `${s.rot}deg`, opacity: s.o, inset: 'auto', left: '50%', top: '50%', translate: '-50% -50%' } : undefined} />
        </div>
      ))}
      </div>
    </div>
  );
}

export type CollageTheme = 'white' | 'paper' | 'dark';

export default function ToolsCollage({ theme = 'white' }: { theme?: CollageTheme }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  // On screen once its top is halfway up (as the other tool layouts); cycles only then.
  useEffect(() => {
    const s = ref.current;
    if (!s) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      setInView(r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.3);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  // Paper dark is its own dark band under the fixed header: while it is behind the wordmark's
  // line, the header turns light, as over the footer (html[data-over-dark], footer.css).
  useEffect(() => {
    const s = ref.current;
    const root = document.documentElement;
    if (!s || theme !== 'dark') return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const wm = document.querySelector('.chrome .wordmark')?.getBoundingClientRect();
      const top = wm ? wm.top + wm.height / 2 : 34;
      root.toggleAttribute('data-over-dark', r.top < top && r.bottom > top);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll);
      root.removeAttribute('data-over-dark');
    };
  }, [theme]);

  // The cycle is the active name's progress bar: it fills over CYCLE_MS (CSS) and, once full,
  // the next tool comes up. It holds (frozen where it is) while the section is off screen or the
  // pointer / focus is on the card, so bar and timing never drift apart.
  const running = inView && !paused;
  const next = () => setActive((a) => (a + 1) % TOOLS.length);

  const t = TOOLS[active];
  const r = place(t);
  const l = leaders(r);

  return (
    <section ref={ref} className="tcl" data-theme-tc={theme} data-foot="/Analytical Tools" aria-label="Analytical tools">
      <div className="tcl-pin">
      <div className="frame tcl-frame">
        <div className="tcl-box">
          <Scraps />

          {/* keyboard focus in the card holds the cycle (a mouse click on a name does not) */}
          <div className="tcl-card"
            onFocus={(e) => setPaused(e.target.matches(':focus-visible'))} onBlur={() => setPaused(false)}>
            {/* the glass: the same collage, blurred, seen through the card (a copy rather than
                backdrop-filter, which drops the blended scraps in some browsers) */}
            <Scraps blur />
            <h2 className="tcl-title">/Analytical Tool</h2>
            <p key={`lead-${active}`} className="tcl-lead">{t.lead}</p>

            <ul className="tcl-list" role="tablist" aria-label="Tools">
              {TOOLS.map((tool, i) => (
                <li key={tool.name} role="presentation">
                  <button type="button" role="tab" id={`tcl-tab-${i}`} aria-selected={i === active} aria-controls="tcl-panel"
                    className="tcl-name" onClick={() => setActive(i)}>
                    {tool.name}
                    {i === active && (
                      <span className="tcl-prog" aria-hidden="true">
                        <span key={active} className="tcl-prog-fill" data-run={running || undefined}
                          style={{ animationDuration: `${CYCLE_MS}ms` }} onAnimationEnd={next} />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div key={active} id="tcl-panel" role="tabpanel" aria-labelledby={`tcl-tab-${active}`} className="tcl-panel">
              {/* the pointer resting on the tool's views holds the cycle (someone is reading them) */}
              <a className="tcl-shots" href={t.href} target="_blank" rel="noopener noreferrer" aria-label={`Try ${t.name} (opens in a new tab)`}
                onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
                {(['b', 'a'] as const).map((k, i) => {
                  const p = r[k], s = t[k];
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={k} className="tcl-shot" src={s.src} alt={s.alt} draggable={false}
                      style={{ left: v(p.x), top: v(p.y), width: v(p.w), height: v(p.h), '--i': i } as CSSProperties} />
                  );
                })}
              </a>

              <svg className="tcl-lines" viewBox="0 0 972 467" preserveAspectRatio="none" aria-hidden="true">
                <path className="tcl-line" d={l.a.d} pathLength={1} style={{ '--i': 0 } as CSSProperties} />
                <path className="tcl-line" d={l.b.d} pathLength={1} style={{ '--i': 1 } as CSSProperties} />
              </svg>
              <span className="tcl-dot" style={{ left: v(l.a.dot.x), top: v(l.a.dot.y), '--i': 0 } as CSSProperties} aria-hidden="true" />
              <span className="tcl-dot" style={{ left: v(l.b.dot.x), top: v(l.b.dot.y), '--i': 1 } as CSSProperties} aria-hidden="true" />

              <p className="tcl-note tcl-note-a" style={{ right: v(972 - l.a.note.right), bottom: v(467 - l.a.note.bottom), width: v(l.a.note.width), '--i': 0 } as CSSProperties}>{t.noteA}</p>
              <p className="tcl-note tcl-note-b" style={{ left: v(l.b.note.left), top: v(l.b.note.top), width: v(l.b.note.width), '--i': 1 } as CSSProperties}>{t.noteB}</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
