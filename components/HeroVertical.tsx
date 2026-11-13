import type { CSSProperties } from 'react';
import './hero-vertical.css';

/* /home-4 hero — Figma "new hero light theme" (183:3). The golden construction stood upright
   (577 × 980, centred in the frame): the headline and body copy sit in its large square, the client
   logos of the launch reel's clients in a 4 × 5 grid filling the band under it, down to the construction's
   bottom line, which is the hero's bottom edge (the whole drawing shows; it runs on below the
   first screen). Drawn 1:1 — no scaling to fit the screen. Light only. Same page material, rails and .hero wrapper as Hero.tsx, so the theme
   switch and Section 2 work unchanged. Positions are Figma px inside the construction (× --px). */

const LINES = ['Identity labs is a', 'consulting firm based', 'in San Francisco.'];

type Part = { src: string; inset: string };
type Masked = Part & { box: string; mx: number; my: number };

/* Client logos. Every logo is drawn at the same visual size: scaled so its visible ink box covers
   the same area (AREA, px²) — a wide wordmark comes out lower, a compact one taller — rather than
   all at one height, which makes long wordmarks look big and short ones small. `boost` lifts a
   light, thin-stroked logo a little so it carries the same weight as the rest, and eases a heavy,
   solid one (Stripe, Deel, Matic) down.
     design  the eight in Figma 183:34: the box (w × h) holding its parts by inset; vw × vh is the
             ink inside it (the exported SVG's size)
     file    a launch client's logo file (/assets/clients, as LaunchesSlides.tsx), masked in grey;
             ratio from its viewBox
     text    a launch client with no logo file yet: its name set in type, the font size from the
             same area rule (clamped) */
type Logo =
  | { kind: 'design'; name: string; w: number; h: number; vw: number; vh: number; parts: Part[]; masked?: Masked[]; boost?: number }
  | { kind: 'file'; name: string; src: string; ratio: number; boost?: number }
  | { kind: 'text'; name: string };

const AREA = 1300;

// From Figma 183:34 (Cursor, Ramp and OpenAI left out: only the launch reel's clients here).
const DESIGN: Logo[] = [
  {
    kind: 'design', name: 'Lovable', w: 93.115, h: 16.761, vw: 93.115, vh: 16.2,
    parts: [{ src: 'lovable-word.svg', inset: '1.04% 0 3.67% 22.6%' }],
    masked: [
      { box: '-12.57% 81.08% -14.28% -4.04%', mx: 3.764, my: 2.103, src: 'lovable-g1.svg', inset: '-9.56% -9.51%' },
      { box: '-47.37% 76.59% 20.51% -6%', mx: 5.591, my: 7.935, src: 'lovable-g2.svg', inset: '-9.56% -7.42%' },
      { box: '-51.6% 77.42% 40.19% -0.38%', mx: 0.357, my: 8.645, src: 'lovable-g3.svg', inset: '-10.89% -9.51%' },
      { box: '-22.12% 84.19% 45.82% 2%', mx: -1.862, my: 3.703, src: 'lovable-g4.svg', inset: '-15.9% -15.81%' },
    ],
  },
  { kind: 'design', name: 'Stripe', w: 68.126, h: 32.473, vw: 52.4, vh: 21.863, boost: 0.86, parts: [{ src: 'stripe.svg', inset: '16.19% 11.54% 16.49% 11.55%' }] },
  {
    kind: 'design', name: 'Airwallex', w: 102.088, h: 13.952, vw: 102.088, vh: 13.952,
    parts: [
      { src: 'airwallex-word.svg', inset: '0.11% 0 -0.01% 23.31%' },
      { src: 'airwallex-mark.svg', inset: '-0.06% 79.44% 0.13% 0' },
    ],
  },
  { kind: 'design', name: 'Gamma', w: 78.585, h: 13.621, vw: 78.585, vh: 13.621, parts: [{ src: 'gamma.svg', inset: '0' }] },
  { kind: 'design', name: 'Deel', w: 53.124, h: 18.389, vw: 53.122, vh: 17.986, boost: 0.9, parts: [{ src: 'deel.svg', inset: '0.01% 0 2.18% 0' }] },
];

// The rest of the launch reel's clients (LaunchesCloud.tsx); Airwallex, Deel, Gamma and Lovable are
// in DESIGN.
const MORE: Logo[] = [
  { kind: 'file', name: 'Cartesia', src: 'cartesia.svg', ratio: 579 / 83, boost: 1.04 },
  { kind: 'text', name: 'Triple Whale' },
  { kind: 'file', name: 'Matic Robots', src: 'matic.svg', ratio: 181 / 52, boost: 0.9 },
  { kind: 'text', name: 'Superblocks' },
  { kind: 'text', name: 'Lindy' },
  { kind: 'file', name: 'PlayerZero', src: 'playerzero.svg', ratio: 2551 / 373, boost: 1.04 },
  { kind: 'text', name: 'Enterpret' },
  { kind: 'file', name: 'PolyAI', src: 'polyai.svg', ratio: 120 / 36 },
  { kind: 'file', name: 'Pocket FM', src: 'pocketfm.svg', ratio: 340 / 53 },
  { kind: 'text', name: 'Fish Audio' },
  { kind: 'file', name: 'Wispr Flow', src: 'wispr.svg', ratio: 446 / 125 },
  { kind: 'text', name: 'Freehand' },
  { kind: 'text', name: 'Anything' },
  { kind: 'text', name: 'Akai' },
  { kind: 'text', name: 'Icon' },
];

/* Placement, in the construction's px. Four even columns across its 577 width (centres at 1/8,
   3/8, 5/8, 7/8) and five even rows filling the band under the square (606 → 980), each logo in
   the middle of its cell. The first two rows sit above the line through the spiral's eye (748.8,
   the bottom of the screen); the other three are below the fold. ORDER: the launch-video clients
   from the design first, then logos and type-set names interleaved. */
const COLS = [1, 3, 5, 7].map((k) => (577.663 * k) / 8);
const ROWS = Array.from({ length: 5 }, (_, r) => 605.923 + ((979.999 - 605.923) * (r + 0.5)) / 5);
const ORDER = [
  'Airwallex', 'Lovable', 'Stripe', 'Gamma',
  'Deel', 'Triple Whale', 'Matic Robots', 'Superblocks',
  'Cartesia', 'Lindy', 'PolyAI', 'Enterpret',
  'Fish Audio', 'PlayerZero', 'Freehand', 'Pocket FM',
  'Anything', 'Wispr Flow', 'Akai', 'Icon',
];
const BY_NAME = new Map([...DESIGN, ...MORE].map((l) => [l.name, l]));
const PLACED = ORDER.map((name, i) => ({ l: BY_NAME.get(name)!, cx: COLS[i % 4], cy: ROWS[Math.floor(i / 4)] }));

const fit = (vw: number, vh: number, boost = 1) => Math.sqrt(AREA / (vw * vh)) * boost;
// Inter Medium: ~0.56em per character, ink ~0.72em tall
const textSize = (name: string) => Math.min(18, Math.max(15, Math.sqrt(AREA / (0.56 * name.length * 0.72))));

const vars = (v: Record<string, string | number>) => v as CSSProperties;
const delay = (ms: number) => vars({ '--d': `${ms}ms` });
const src = (f: string) => `/assets/hero-v/${f}`;

function Ticks() {
  return (
    <>
      <span className="tick tick-l" aria-hidden="true" />
      <span className="tick tick-r" aria-hidden="true" />
    </>
  );
}

function LogoPart({ src: s, inset }: Part) {
  return (
    <span className="part" style={{ inset }}>
      <img src={src(s)} alt="" />
    </span>
  );
}

export default function HeroVertical() {
  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-dark"><div className="texture" /></div>
        <div className="backdrop-light" />
      </div>
      <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>

      <div className="hero hv">
        <div className="frame">
          <header className="site-header">
            {/* wordmark and nav: the fixed header in SiteChrome.tsx */}
            <Ticks />
          </header>

          <main className="hv-main">
            <div className="hv-golden">
              {/* construction (Figma 183:18): the golden rectangle upright, 12% grey lines */}
              <img className="hv-construction" src={src('construction.svg')} width={577.663} height={980.663} alt="" aria-hidden="true" />

              <div className="hv-copy">
                <h1 className="hv-headline" aria-label={LINES.join(' ')}>
                  {LINES.map((l, i) => (
                    <span className="hv-line" key={l} aria-hidden="true">
                      <span className="hv-li" style={delay(380 + i * 90)}>{l}</span>
                    </span>
                  ))}
                </h1>

                <div className="hv-body">
                  <p className="rise" style={delay(760)}>
                    The largest tech companies on earth rely on our algorithm research, analytics software, and deployed
                    services to reach a billion people.
                  </p>
                  <div>
                    <p className="rise" style={delay(840)}>We do three things:</p>
                    <ul>
                      <li className="rise" style={delay(920)}>
                        Algorithm research on the largest weighted engagement datasets (1T+ views) to reverse engineer X
                        and LI algorithms and predictably go viral
                      </li>
                      <li className="rise" style={delay(990)}>
                        Build analytics software that can model acceleration/<wbr />decay of engagement and can predict if
                        something will cross 1M views in the first 30 minutes, account-level audience identification, etc.
                      </li>
                      <li className="rise" style={delay(1060)}>
                        Forward deploy our Creative + Growth team within our clients&apos; orgs to run the biggest product
                        launches and scale company brand.
                      </li>
                    </ul>
                  </div>
                  <p className="rise" style={delay(1140)}>
                    In the last 2 years, $1T was spent on paid marketing on Meta and Google. Paid reach is getting more
                    expensive with diminishing returns. Companies now need organic distribution faster than we can hire
                    and build systems to provide it. Identity Labs has grown 7x in revenue to $20M ARR because of this
                    demand.
                  </p>
                </div>
              </div>

              <ul className="hv-logos" aria-label="Clients">
                {PLACED.map(({ l, cx, cy }, i) => {
                  const at = { '--cx': cx, '--cy': cy, '--d': `${1240 + i * 40}ms` };
                  if (l.kind === 'design') {
                    return (
                      <li className="hv-logo-slot" key={l.name} style={vars({ ...at, '--w': l.w, '--h': l.h, '--s': fit(l.vw, l.vh, l.boost) })}>
                        <span className="hv-logo" role="img" aria-label={l.name}>
                          {l.parts.map((p) => <LogoPart key={p.src} {...p} />)}
                          {l.masked?.map((m) => (
                            <span className="hv-lv" key={m.src} style={{ inset: m.box, ...vars({ '--mx': m.mx, '--my': m.my }) }}>
                              <LogoPart src={m.src} inset={m.inset} />
                            </span>
                          ))}
                        </span>
                      </li>
                    );
                  }
                  if (l.kind === 'file') {
                    const k = fit(l.ratio, 1, l.boost); // ink of 1 × ratio, scaled to the area
                    return (
                      <li className="hv-more" key={l.name} style={vars(at)}>
                        <span className="hv-more-mark" role="img" aria-label={l.name}
                          style={vars({ '--src': `url('/assets/clients/${l.src}')`, '--w': l.ratio * k, '--h': k })} />
                      </li>
                    );
                  }
                  return (
                    <li className="hv-more hv-more-text" key={l.name} style={vars({ ...at, '--fs': textSize(l.name) })}>{l.name}</li>
                  );
                })}
              </ul>
            </div>

            <Ticks />
          </main>
        </div>
      </div>
    </>
  );
}
