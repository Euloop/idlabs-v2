'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import PaneUI from './ToolsStackPanes';
import './tools-stack.css';

/* Analytical tools, "Stack" layout (/home-2; option to Graph and Device). The four tools as pairs of
   panes (the tool's UI and its name card) standing one behind the other, seen from the side: the row runs from the front (lower
   left) to the back (upper right). Each pane is a small, quiet version of that tool's own view,
   drawn as UI (ToolsStackPanes.tsx). The intro line sits below.
   Hover a pane: it lifts out of the stack and a dark callout writes in above the stack, clear of
   it — a faint dot on the pane, a leader straight up past the top pane, a square corner, then
   across to a card with the tool's name, its text and Try it (line first, then the card, as
   Section 2's notes). Click a pane to open the tool. Coming on screen, the stack fans out.
   `light` false: the dark option (brings the night down, ThemeDriver.tsx). Copy: the client's. */

const INTRO =
  'We turned this research into software, built on 2B+ data points, that weights every engagement by the engager’s influence, measures engagement velocity in real time, and maps how deep a post penetrates each niche, to forecast its reach and shelf-life within the first 30\u00a0minutes.'; // no-break space: the last two words never split

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
    text: 'Measures how deep a post travelled within a niche. When a post goes out, we can see which clusters it reached and how much of each it\u00a0covered.',
  },
];

/* Front to back, two panes per tool: its UI, then its name card (Weighted Engagement Scoring's
   in green). `o`: the pane's place along the row, in gaps — the two panes of a tool stand close,
   tools further apart. */
const PAIR = 0.55; // gap between a tool's two panes
const STEP = 1.75; // from one tool to the next
const PANES = TOOLS.flatMap((_, t) => [
  { tool: t, kind: 'ui' as const, o: t * STEP },
  { tool: t, kind: (t === 1 ? 'green' : 'name') as 'green' | 'name', o: t * STEP + PAIR },
]);
const SPAN = (TOOLS.length - 1) * STEP + PAIR;

/* The callout sits clear of the stack, in the free space above or below it: the first two tools
   (lower left of the row) open below, the last two (upper right) above. From the dot the leader
   runs straight down / up to CLEAR px past the lowest / highest pane, turns a square corner and
   runs RUN px across; the card sits on the end of that line. */
const BELOW = (t: number) => t < 2;
const CLEAR = 36;
const RUN = 48;
const NOTE_W = 420; // the card's width (tools-stack.css)

// Leaving a pane closes its callout after a moment, so the pointer can travel onto the callout
// (to click Try it) without it closing.
const CLOSE_MS = 160;
// With a callout open, another pane takes over only once the pointer rests on it this long —
// so crossing a pane on the way up to the card does not switch it.
const SWITCH_MS = 220;

/* The scene's 3D turn and the stage's perspective (tools-stack.css), to place the stack: the
   panes are projected here as the CSS does it, and the scene is moved so the stack's outline is
   centred on the screen. */
const TURN_X = (-9 * Math.PI) / 180;
const TURN_Y = (-38 * Math.PI) / 180;
const PERSP = 4200;
const PERSP_Y = 0.45;
function stackBox(sx: number, sy: number, pw: number, ph: number, gap: number, w: number, h: number) {
  const ox = w / 2, oy = h * PERSP_Y;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of PANES) {
    const z = (SPAN / 2 - p.o) * gap;
    for (const cx of [-pw / 2, pw / 2]) for (const cy of [-ph / 2, ph / 2]) {
      // rotateY, then rotateX (CSS: rotateX(..) rotateY(..)), then perspective
      const x = cx * Math.cos(TURN_Y) + z * Math.sin(TURN_Y);
      const zy = -cx * Math.sin(TURN_Y) + z * Math.cos(TURN_Y);
      const y = cy * Math.cos(TURN_X) - zy * Math.sin(TURN_X);
      const zz = cy * Math.sin(TURN_X) + zy * Math.cos(TURN_X);
      const k = PERSP / (PERSP - zz);
      const X = ox + (sx + x - ox) * k, Y = oy + (sy + y - oy) * k;
      x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y);
    }
  }
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

export default function ToolsStack({ light = true }: { light?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState<number | null>(null); // the hovered tool (both its panes)
  const stageRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const closeRef = useRef(0);
  const dotBRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [at, setAt] = useState<{ x: number; y: number; len: number; below: boolean; flip: boolean } | null>(null);
  const paneRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // Centre the stack on the screen (while the section holds, the frame is pinned at the top).
  useEffect(() => {
    const place = () => {
      const st = stageRef.current, fr = st?.parentElement;
      if (!st || !fr) return;
      const cs = getComputedStyle(st);
      const pw = parseFloat(cs.getPropertyValue('--pw')), ph = parseFloat(cs.getPropertyValue('--ph')), gap = parseFloat(cs.getPropertyValue('--gap'));
      const w = st.offsetWidth, h = st.offsetHeight;
      const tx = window.innerWidth / 2 - (fr.getBoundingClientRect().left + st.offsetLeft);
      const ty = window.innerHeight / 2 - st.offsetTop;
      let sx = w / 2, sy = h / 2;
      for (let k = 0; k < 4; k++) { const b = stackBox(sx, sy, pw, ph, gap, w, h); sx += tx - b.cx; sy += ty - b.cy; }
      setPos({ x: sx, y: sy });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, []);

  // In view once its top is halfway up the screen (as the other tool layouts).
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
    return () => { cancelAnimationFrame(raf); clearTimeout(closeRef.current); clearTimeout(switchRef.current); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hover;
  const switchRef = useRef(0);
  const open = (i: number) => {
    clearTimeout(closeRef.current); clearTimeout(switchRef.current);
    const t = PANES[i].tool; // a tool's two panes are one target: moving between them changes nothing
    if (hoverRef.current === null || hoverRef.current === t) setHover(t);
    else switchRef.current = window.setTimeout(() => setHover(t), SWITCH_MS);
  };
  const keep = () => { clearTimeout(closeRef.current); clearTimeout(switchRef.current); };
  function close() { clearTimeout(closeRef.current); closeRef.current = window.setTimeout(() => setHover(null), CLOSE_MS + SWITCH_MS); }

  // Follow the hovered tool's dot (on its UI pane) (in stage px) while it lifts and settles.
  useEffect(() => {
    if (hover === null) { setAt(null); return; }
    let raf = 0;
    const t0 = performance.now();
    const track = () => {
      const below = BELOW(hover);
      const st = stageRef.current?.getBoundingClientRect(), d = (below ? dotBRefs : dotRefs).current[hover]?.getBoundingClientRect();
      if (st && d) {
        const x = d.left + d.width / 2 - st.left, y = d.top + d.height / 2 - st.top;
        const rects = paneRefs.current.map((el) => el?.getBoundingClientRect()).filter((r): r is DOMRect => !!r);
        const edge = below ? Math.max(...rects.map((r) => r.bottom)) - st.top + CLEAR : Math.min(...rects.map((r) => r.top)) - st.top - CLEAR;
        // no room for the card on the right inside the frame: it turns left instead
        setAt({ x, y, len: Math.max(24, Math.abs(edge - y)), below, flip: x + RUN + 10 + NOTE_W > st.width });
      }
      if (performance.now() - t0 < 900) raf = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(raf);
  }, [hover]);

  const ht = hover !== null ? TOOLS[hover] : null;

  return (
    <section ref={ref} className="tk" data-mode={light ? 'light' : 'dark'} data-lights-down={light ? undefined : ''} data-foot="/Analytical Tools" aria-label="Analytical tools">
      <div className="frame tk-frame">
        <div ref={stageRef} className="tk-stage" data-hover={hover !== null || undefined} data-card={at ? (at.below ? 'below' : 'above') : undefined}>
          <div className="tk-scene" data-in={inView || undefined} style={{ '--span': SPAN, ...(pos && { left: pos.x, top: pos.y }) } as CSSProperties}>
            {PANES.map((p, i) => (
              <a
                key={i}
                ref={(el) => { paneRefs.current[i] = el; }}
                className={`tk-pane tk-${p.kind}`}
                href={TOOLS[p.tool].href}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={-1}
                style={{ '--i': i, '--o': p.o } as CSSProperties}
                data-on={hover === p.tool || undefined}
                data-dim={(hover !== null && hover !== p.tool) || undefined}
                onPointerEnter={() => open(i)}
                onPointerLeave={() => { clearTimeout(switchRef.current); close(); }}
                aria-hidden="true"
              >
                {p.kind === 'ui' && <span ref={(el) => { dotRefs.current[p.tool] = el; }} className="tk-anchor" />}
                {p.kind === 'ui' && <span ref={(el) => { dotBRefs.current[p.tool] = el; }} className="tk-anchor tk-anchor-b" />}
                {p.kind === 'ui' ? <PaneUI tool={p.tool} /> : <span className="tk-pane-name">{TOOLS[p.tool].name}</span>}
              </a>
            ))}
          </div>

          {/* callout for the hovered tool (one for the pair): dot, up or down, square corner,
              across, then the tool's name, its text and Try it */}
          {ht && at && (
            <div key={hover} className="tk-call" data-flip={at.flip || undefined} data-below={at.below || undefined} style={{ left: at.x, top: at.y } as CSSProperties}>
              <svg className="tk-call-svg" width={RUN + 8} height={at.len + 8}
                viewBox={at.below ? `-4 -4 ${RUN + 8} ${at.len + 8}` : `-4 ${-at.len - 4} ${RUN + 8} ${at.len + 8}`} aria-hidden="true">
                <path className="tk-call-line" d={`M0 0 V${at.below ? at.len : -at.len} H${RUN}`} pathLength={1} />
                <circle className="tk-call-dot" r={3} />
              </svg>
              <div className="tk-call-box" style={{ [at.flip ? 'right' : 'left']: RUN + 10, ...(at.below ? { top: at.len } : { bottom: at.len }) } as CSSProperties}
                onPointerEnter={keep} onPointerLeave={close}>
                <h3 className="tk-call-title">{ht.name}</h3>
                <p className="tk-call-text">{ht.text}</p>
                <a className="tk-try" href={ht.href} target="_blank" rel="noopener noreferrer" aria-label={`Try ${ht.name} (opens in a new tab)`}>[Try it →]</a>
              </div>
            </div>
          )}
        </div>

        <p className="tk-intro">{INTRO}</p>

        {/* the same for keyboard and screen readers (the stack is pointer-only) */}
        <ul className="tk-sr">
          {TOOLS.map((t) => (
            <li key={t.name}>
              <h3>{t.name}</h3>
              <p>{t.text}</p>
              <a href={t.href} target="_blank" rel="noopener noreferrer">Try {t.name} (opens in a new tab)</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
