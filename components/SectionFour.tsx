'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePullUp } from './pullUp';
import './sections.css';

/* Section 4 · Analytical tools. Figma 130:4097 / 132:4683 (dark); tool views from the Figma
   sections Engagement Classifier, Weighted Engagement, Post Velocity and Cluster Penetration.
   The four tools are listed down the left; the selected tool's screenshots and the frosted
   info card over them are on screen together. The tools cycle on their own: the active name
   has a slim line that fills up, then the next tool's screenshots spread out from the centre
   and its card folds out. Clicking (or focusing) a name selects that tool. Cycling pauses
   while the pointer or focus is on the card (someone is reading it). Scrolls in at normal
   speed and holds (last section). */

/* [file, x, y, w, h] in Figma px: the dark screenshots (Figma, the second group in each tool's
   section: 134:5363–66, 134:5349–52, 134:5353–57). Weighted Engagement uses the arrangement of
   Figma 135:5972 (overlapping; listed in layer order, later on top). Order of sets = TOOLS. */
type Shot = [string, number, number, number, number];
const SHOTS: Shot[][] = [
  [
    ['classifier-d-1', 633, 561, 133, 91],
    ['classifier-d-2', 783, 445, 133, 207],
    ['classifier-d-3', 633, 669, 133, 76],
    ['classifier-d-4', 783, 669, 398, 270],
  ],
  [
    ['weighted-d-contributors', 622, 217, 386, 160],
    ['weighted-d-clusters', 376, 341, 667, 53],
    ['weighted-d-curve', 563, 396, 476, 254],
    ['weighted-d-score', 322, 177, 493, 164],
    ['weighted-d-post', 319, 394, 273, 232],
  ],
  [
    ['velocity-d-1', 171, 597, 164, 59],
    ['velocity-d-2', 352, 597, 164, 59],
    ['velocity-d-3', 534, 597, 163, 59],
    ['velocity-d-4', 171, 674, 359, 134],
    ['velocity-d-5', 548, 674, 499, 201],
  ],
  [
    ['cluster-d-1', 161, 596, 457, 150],
    ['cluster-d-2', 634, 534, 457, 212],
    ['cluster-d-3', 161, 763, 150, 75],
    ['cluster-d-4', 327, 762, 150, 76],
  ],
];
/* Each set is centred on the stage and scaled to fill the same box, so all four read the same size. */
const FIT_W = 780;
const FIT_H = 480;
const SETS = SHOTS.map((set) => {
  const x0 = Math.min(...set.map((s) => s[1])), y0 = Math.min(...set.map((s) => s[2]));
  const x1 = Math.max(...set.map((s) => s[1] + s[3])), y1 = Math.max(...set.map((s) => s[2] + s[4]));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const k = Math.min(FIT_W / (x1 - x0), FIT_H / (y1 - y0));
  return set.map(([f, x, y, w, h]) => ({
    f,
    style: {
      '--x': ((x - cx) * k).toFixed(2), '--y': ((y - cy) * k).toFixed(2),
      '--w': (w * k).toFixed(2), '--h': (h * k).toFixed(2),
      '--dx': ((cx - (x + w / 2)) * k).toFixed(2), '--dy': ((cy - (y + h / 2)) * k).toFixed(2),
    } as CSSProperties,
  }));
});

const TOOLS = [
  {
    name: 'Engagement Classifier',
    text: 'A post is only fast or slow compared to itself. The classifier takes a post’s engagement rate in its first 15 minutes as a baseline and measures its performance after against it. This lets us predict how far a post will go within 30 minutes.',
  },
  {
    name: 'Weighted Engagement Scoring',
    text: 'A 100 likes from a 100 strangers is not the same as 1 quote from someone important. Weighted Engagement scores each interaction by who performed it -their influence, their cluster, the kind of action.',
  },
  {
    name: 'Post Velocity',
    text: 'Tracks how fast engagement is accelerating in real time. A steep curve in the first 6 hours is the strongest predictor of a breakout. Combined with the Classifier, it tells us how a launch/post will perform within its first 30 minutes.',
  },
  {
    name: 'Cluster Penetration',
    text: 'Measures how deep a post travelled within a niche. When a post goes out, we can see which clusters it reached and how much of each it covered.',
  },
];

const CYCLE_MS = 7000;

export default function SectionFour() {
  const sectionRef = useRef<HTMLElement>(null);
  const [atRest, setAtRest] = useState(false);
  const [active, setActive] = useState(1); // Figma shows Weighted Engagement Scoring
  const [reduce, setReduce] = useState(false);
  const [reading, setReading] = useState(false); // pointer or focus on the card
  const open = atRest;

  // Normal scroll in: the stage rises at scroll speed and holds once it reaches the top;
  // the screenshots come in once it is halfway up the screen.
  useEffect(() => {
    const s = sectionRef.current;
    if (!s) return;
    let raf = 0;
    const measure = () => { raf = 0; setAtRest(s.getBoundingClientRect().top < window.innerHeight * 0.5); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  usePullUp(sectionRef, { prevContent: '.ti-text', prevPin: '.ti-pin', content: '.s4-inner', pin: '.s4-pin' }, 200);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // The active name's line fills over CYCLE_MS; then the next tool takes over. Paused while
  // the card is open (someone is reading).
  const cycling = atRest && !reduce && !reading;
  useEffect(() => {
    if (!cycling) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % TOOLS.length), CYCLE_MS);
    return () => clearTimeout(id);
  }, [cycling, active]);


  const tool = TOOLS[active];

  return (
    <section ref={sectionRef} className="s4" data-foot="/Analytical Tools" aria-label="Analytical tools">
      <div className="s4-pin">
        <div className="frame s4-frame">
          <div className="s4-inner" data-on={atRest || undefined}>
            <div
              className="s4-tabs"
              role="tablist"
              aria-label="Tools"
              aria-orientation="vertical"
            >
              {TOOLS.map((t, i) => (
                <button
                  key={t.name}
                  id={`s4-tab-${i}`}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  aria-controls="s4-tool-panel"
                  className="s4-tab"
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  {t.name}
                  {i === active && (
                    <span
                      key={active}
                      className="s4-tab-bar"
                      aria-hidden="true"
                      data-run={atRest && !reduce ? '' : undefined}
                      data-paused={!cycling || undefined}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="s4-stage">
              <div className="s4-shots" aria-hidden="true">
                {SETS.map((set, t) => (
                  <div key={t} className="s4-set" data-on={atRest && t === active ? '' : undefined}>
                    {set.map((s, i) => (
                      <img
                        key={s.f}
                        className="s4-shot"
                        src={`/assets/tools/${s.f}.webp`}
                        alt=""
                        decoding="async"
                        style={{ ...s.style, '--i': i } as CSSProperties}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* keyed by tool: switching tools while it is open folds the new card out again */}
              <div
                key={open ? active : 'closed'}
                className="s4-card"
                role="tabpanel"
                id="s4-tool-panel"
                aria-labelledby={`s4-tab-${active}`}
                aria-hidden={!open || undefined}
                data-open={open || undefined}
                onPointerEnter={() => setReading(true)}
                onPointerLeave={() => setReading(false)}
                onFocus={() => setReading(true)}
                onBlur={() => setReading(false)}
              >
                <div className="s4-card-in">
                  <div className="s4-card-head">
                    <img src="/assets/tools/tool-icon.svg" width={24} height={24} alt="" />
                    <h3 className="s4-card-title">{tool.name}</h3>
                  </div>
                  <div className="s4-card-body">
                    <p className="s4-card-text">{tool.text}</p>
                    <a className="s4-try" href="#" tabIndex={open ? 0 : -1}>[Try it →]</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
