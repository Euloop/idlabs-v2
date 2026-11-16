'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { portraitCuts, PHI } from './golden';
import { IDENTITY, LABS, WORDMARK_H, WORDMARK_W } from './wordmark-paths';
import './footer-stamps.css';

/* Footer "Moneyball" (/home-4 and /footer, ?golden=stamps) — Figma Zoomcast 209:3 "footer variant - moneyball":
   in the Fibonacci footer's top band, one stack of three stamps in the middle — two square ones tilted
   behind, the tall one in front with its field and year — and under it the headline and the description.
   The client's brief: every industry gets its revolution — the right people with the right point of view
   reorganise a field. Five slides: the opening (all of them, "Every industry gets its Revolution"), then one field each: baseball (Bill James), finance (Jim Simons), advertising
   (Mark Zuckerberg), organic content (Identity Labs). The stack, the headline and the description swap
   together while the footer is on screen — every QUICK, or every SLOW while pointed at (time to read) — the
   three stamps gathering into the middle, the slide swapping while they are together, then scattering back to
   their places (the words fading out with the gather and up with the scatter); a click moves on. Pointing at the stack spreads
   its three a little. No tabs, no progress (as the design).
   Stamp papers: the design's own (image 29, image 634452728; public/assets/footer-stamps/frame-*.webp).
   Photos: the design's own, from its four frames (Zoomcast 210:128 main, 210:250 advertising, 210:372
   baseball, 210:494 finance; public/assets/footer-stamps/fig, in grey). Identity Labs' three are drawn until
   the team photo the client wants exists. Sizes are the design's px (a 481px column). */

type Pic = { src: string; by?: string } | { draw: ReactNode };
// `fit`: the photos' boxes as the slide's own Figma frame has them (CSS vars, footer-stamps.css): each photo is
// stretched to its box as Figma draws it (the designer cropped them there), the front one with the frame's crop
type Slide = { id: string; field: string; year: string; head: string; body: string; front: Pic; left: Pic; right: Pic; fit?: Record<string, string> };
const MAIN_FRONT = { '--fiw': '101.41%', '--fih': '103.89%', '--fil': '0.17%', '--fit': '-0.88%' };

const A = '/assets/footer-stamps/';

// Identity Labs' own, drawn: the wordmark; an exact golden rectangle (80 × 80φ) cut nine times; a data card
const IlMark = (
  <svg className="fst-draw" viewBox={`-12 -40 ${WORDMARK_W + 24} ${WORDMARK_H + 80}`} aria-hidden="true">
    {[...IDENTITY, ...LABS].map((d, k) => <path key={k} d={d} className="fst-ink" />)}
  </svg>
);
const GH = 80 * PHI;
const CON = portraitCuts(20, (150 - GH) / 2, 80, GH, 9);
const IlGolden = (
  <svg className="fst-draw" viewBox="0 0 120 150" aria-hidden="true">
    <rect x={20} y={(150 - GH) / 2} width={80} height={GH} className="fst-line" />
    {CON.lines.map((d, k) => <path key={k} d={d} className="fst-line" />)}
    <path d={CON.spiral} className="fst-line fst-arc" />
  </svg>
);
const IlData = (
  <svg className="fst-draw" viewBox="0 0 120 150" aria-hidden="true">
    {/* (the formulas on the right: the front stamp covers this one's left) */}
    <text x={108} y={30} textAnchor="end" className="fst-mono">n = 2B+</text>
    <text x={108} y={46} textAnchor="end" className="fst-mono">v = Δe / Δt</text>
    <text x={108} y={62} textAnchor="end" className="fst-mono">t ≤ 30 min</text>
    <path d="M12 128 C40 126 52 118 64 100 S88 52 108 40" className="fst-line fst-arc" />
    <path d="M12 128H108M12 128V76" className="fst-line" />
  </svg>
);

const SLIDES: Slide[] = [
  // the opening, all of them together: one face from each field
  {
    id: 'all', field: 'Revolutions', year: '1977–Now',
    fit: { '--lw': '119.858px', '--lh': '121.07px', '--rw': '126.79px', '--rh': '127.955px', ...MAIN_FRONT }, // 210:232
    head: 'Every industry gets its Revolution',
    body: 'The right people, with the right point of view, reorganise a field, bringing analytical rigour to a world that ran on gut feel. It has happened before.',
    front: { src: `${A}fig/main-front.webp` },
    left: { src: `${A}fig/main-left.webp` },
    right: { src: `${A}fig/main-right.webp` },
  },
  {
    id: 'baseball', field: 'Baseball', year: '1977',
    fit: { '--lw': '120.484px', '--lh': '119.933px', '--rw': '126.79px', '--rh': '127.955px', '--fw': '115px', '--fh': '157px', '--fl': '8.7px' }, // 210:476
    head: 'Baseball got its revolution',
    body: 'In 1977 Bill James self-published his first Baseball Abstract. Sabermetrics put the box score over the scout’s eye, and a game run on instinct started counting.',
    front: { src: `${A}fig/base-front.webp` },
    left: { src: `${A}fig/base-left.webp` },
    right: { src: `${A}fig/base-right.webp` },
  },
  {
    id: 'finance', field: 'Finance', year: '1982',
    fit: { '--lw': '119.858px', '--lh': '121.07px', '--rw': '126.768px', '--rh': '128.053px', '--fw': '118px', '--fh': '159px', '--fl': '8.7px' }, // 210:598
    head: 'Finance got its revolution',
    body: 'Jim Simons, a codebreaker turned mathematician, founded Renaissance Technologies in 1982. Its Medallion fund traded on models instead of hunches, and the models won.',
    front: { src: `${A}fig/fin-front.webp` },
    left: { src: `${A}fig/fin-left.webp` },
    right: { src: `${A}fig/fin-right.webp` },
  },
  {
    id: 'ads', field: 'Advertising', year: '2007',
    fit: { '--lw': '119.473px', '--lh': '120.239px', '--rw': '129.561px', '--rh': '129.561px', '--rfit': 'cover', ...MAIN_FRONT }, // 210:354
    head: 'Advertising got its revolution',
    body: 'In 2007 Mark Zuckerberg launched Facebook Ads: every impression targeted, measured and paid for on results. Billboards gave way to performance you could count.',
    front: { src: `${A}fig/ads-front.webp` },
    left: { src: `${A}fig/ads-left.webp` },
    right: { src: `${A}fig/ads-right.webp` },
  },
  {
    id: 'organic', field: 'Organic content', year: 'Now',
    head: 'Organic content is next',
    body: 'Most posts still go out on instinct. Identity Labs reverse engineers how X and LinkedIn distribute, and engineers launches to travel: reach no one can buy.',
    front: { draw: IlMark }, left: { draw: IlGolden }, right: { draw: IlData },
  },
];
// how long each slide holds: quick while the footer is just looked at, so it visibly moves on; slow while
// pointed at, so its words can be read (feedback 2026-11-16)
const QUICK = 5000;
const SLOW = 8500;
// a change: the three gather in the middle (GATHER, footer-stamps.css), the slide swaps while they are
// together, then they scatter back out to their places
const GATHER = 560;

function Photo({ p, className }: { p: Pic; className: string }) {
  return (
    <span className={className}>
      {'src' in p
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={p.src} alt="" title={p.by} decoding="async" />
        : p.draw}
    </span>
  );
}

/* a line of words, each its own box (--i its place) for the words' own motion (footer-stamps.css .fst-w);
   keyed by its slide, so a new slide's words mount fresh and play their way in */
function Split({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="fst-w" aria-hidden="true" style={{ '--i': i } as CSSProperties}><span>{w}</span></span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  );
}

export default function FooterStamps() {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [gathered, setGathered] = useState(false);
  const [held, setHeld] = useState(false);
  const [seen, setSeen] = useState(false);
  const timer = useRef(0);
  const s = SLIDES[at];
  // move on: gather; once together, swap the slide and let them scatter
  const next = () => {
    if (gathered) return;
    setGathered(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setAt((i) => (i + 1) % SLIDES.length); setGathered(false); }, GATHER);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // the cycle: QUICK, or SLOW while pointed at (a new pointing restarts the slide's time at SLOW)
  useEffect(() => {
    if (!seen || gathered || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(next, held ? SLOW : QUICK);
    return () => clearTimeout(t);
  }, [at, held, seen, gathered]);
  // the next slide's photos, fetched ahead so a swap never shows an empty stamp
  useEffect(() => {
    const n = SLIDES[(at + 1) % SLIDES.length];
    for (const p of [n.front, n.left, n.right]) if ('src' in p) { const i = new Image(); i.src = p.src; }
  }, [at]);

  return (
    <div className="fst" ref={ref} data-gathered={gathered || undefined}
      onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      {/* the stack (209:107) */}
      <button type="button" className="fst-stack" style={s.fit as CSSProperties} onClick={next} aria-label={`${s.field}, ${s.year}. Next`}>
        {/* left, behind: the square paper at −4.4°, its photo inset (209:108) */}
        <span className="fst-sq fst-sq-l">
          <span className="fst-tilt">
            <span className="fst-paper-sq" />
            <Photo p={s.left} className="fst-pic fst-pic-sq" />
          </span>
        </span>
        {/* right, behind: the square paper at 9.86° (209:112) */}
        <span className="fst-sq fst-sq-r">
          <span className="fst-tilt">
            <span className="fst-paper-sq" />
            <Photo p={s.right} className="fst-pic fst-pic-sq" />
          </span>
        </span>
        {/* front: the tall paper, its photo, its field and year (209:116) */}
        <span className="fst-front">
          <span className="fst-paper-tall" />
          <Photo p={s.front} className="fst-pic fst-pic-tall" />
          <span className="fst-face"><span>{s.field}</span><span>{s.year}</span></span>
        </span>
      </button>

      {/* the words (209:122): out with the gather, up again with the scatter */}
      <div className="fst-words" aria-live="polite">
        <p className="fst-head" aria-label={s.head}><Split key={`h-${s.id}`} text={s.head} /></p>
        <p className="fst-body" aria-label={s.body}><Split key={`b-${s.id}`} text={s.body} /></p>
      </div>
    </div>
  );
}
