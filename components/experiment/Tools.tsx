'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

/* Section 4 · Our tech (Figma 124:2558). The four tools as tabs along the bottom; the dark
   card in the middle describes the selected one, over a collage of product screenshots.
   The active tab has a slim line underneath that fills up; when it completes the next tool
   takes over (a click jumps to that tool and carries on from there). Only while on screen.
   Copy is the client's.

   Each tool has its own screenshots (Figma sections 125:2735, 125:2736, 126:2915, 126:2925),
   laid out as in Figma around the card. On a tool change the old set fades out in place;
   the new set starts bunched at the centre at half size and spreads out to its places while
   growing to full size (strong ease-out, a 40ms stagger). Sequence, so nothing shows behind
   a card that isn't open yet: the card folds away upwards while its images fade; the next
   card folds out top to bottom; only once it is (nearly) open do its images scatter out. */

/* [file, x, y, w, h] in Figma px, from each tool's Figma section */
type Shot = [string, number, number, number, number];
const SHOTS: Shot[][] = [
  [
    ['classifier-1', 135, 182, 205, 141],
    ['classifier-2', 366, 206, 205, 117],
    ['classifier-3', 135, 348, 205, 321],
    ['classifier-4', 366, 348, 577, 457],
  ],
  [
    ['weighted-score', 292, 300, 309.81, 103.382],
    ['weighted-contributors', 668, 329, 241.394, 100.246],
    ['weighted-post', 300, 483, 173.348, 147.827],
    ['weighted-curve', 603, 521, 306.18, 163.478],
  ],
  [
    ['velocity-1', 277, 344, 332, 124],
    ['velocity-2', 626, 414, 151, 54],
    ['velocity-3', 793, 414, 152, 54],
    ['velocity-4', 277, 485, 152, 54],
    ['velocity-5', 445, 485, 461, 186],
  ],
  [
    ['cluster-1', 286, 385, 136, 68],
    ['cluster-2', 436, 318, 414, 135],
    ['cluster-3', 286, 468, 414, 192],
    ['cluster-4', 714, 468, 136, 68],
  ],
];
/* Each set is centred on the card and scaled to fit the stage (the classifier set is large). */
const FIT_W = 700;
const FIT_H = 470;
const SETS = SHOTS.map((set) => {
  const x0 = Math.min(...set.map((s) => s[1])), y0 = Math.min(...set.map((s) => s[2]));
  const x1 = Math.max(...set.map((s) => s[1] + s[3])), y1 = Math.max(...set.map((s) => s[2] + s[4]));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const k = Math.min(1, FIT_W / (x1 - x0), FIT_H / (y1 - y0));
  return set.map(([f, x, y, w, h]) => ({
    f,
    style: {
      '--x': ((x - cx) * k).toFixed(2), '--y': ((y - cy) * k).toFixed(2),
      '--w': (w * k).toFixed(2), '--h': (h * k).toFixed(2),
      // from the shot's own centre to the set's centre (where it starts, bunched up)
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

export default function Tools() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(1); // Figma shows Weighted Engagement Scoring
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

  // The active tab's line fills over CYCLE_MS; when it completes, the next tab takes over.
  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % TOOLS.length), CYCLE_MS);
    return () => clearTimeout(id);
  }, [inView, reduce, active]);

  // The card shows `shown`, which trails `active`: on a change the current card folds up
  // (data-leave, ~260ms); when that ends the next one mounts and folds out top to bottom.
  const [shown, setShown] = useState(active);
  const leaving = shown !== active;
  useEffect(() => {
    if (leaving && reduce) setShown(active);
  }, [leaving, reduce, active]);
  const tool = TOOLS[shown];

  return (
    <section ref={ref} id="tools" className="xp-s4" aria-label="Our tech">
      <div className="xp-col xp-s4-inner">
        <div className="xp-s4-stage">
          <div className="xp-shots" aria-hidden="true">
            {SETS.map((set, t) => (
              <div key={t} className="xp-set" data-on={t === shown && !leaving ? '' : undefined}>
                {set.map((s, i) => (
                  <img
                    key={s.f}
                    className="xp-shot"
                    src={`/experiment/tools/${s.f}.webp`}
                    alt=""
                    decoding="async"
                    style={{ ...s.style, '--i': i } as CSSProperties}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* keyed by tool: the old card folds up (bottom to top), then the new one mounts
              and folds out (top to bottom) */}
          <div
            key={shown}
            className="xp-card"
            role="tabpanel"
            id="xp-tool-panel"
            aria-labelledby={`xp-tab-${shown}`}
            data-leave={leaving ? '' : undefined}
            onAnimationEnd={(e) => { if (leaving && e.target === e.currentTarget) setShown(active); }}
          >
            <div className="xp-card-head">
              <img src="/experiment/tool-icon.svg" width={24} height={24} alt="" />
              <h3 className="xp-card-title">{tool.name}</h3>
            </div>
            <div className="xp-card-body">
              <p className="xp-card-text">{tool.text}</p>
              <a className="xp-try" href="#">[Try it →]</a>
            </div>
          </div>
        </div>

        <div className="xp-tabs" role="tablist" aria-label="Tools">
          {TOOLS.map((t, i) => (
            <button
              key={t.name}
              id={`xp-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls="xp-tool-panel"
              className="xp-tab"
              onClick={() => setActive(i)}
            >
              {t.name}
              {i === active && (
                <span key={active} className="xp-tab-bar" aria-hidden="true" data-run={inView && !reduce ? '' : undefined} />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
