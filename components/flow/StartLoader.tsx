import type { CSSProperties } from 'react';
import StartLoaderRun from './StartLoaderRun';
import { IDENTITY, IDENTITY_W, LABS, LABS_X, WORDMARK_H, WORDMARK_W } from './wordmark-paths';
import './start-loader.css';

/* /home-4 start loader — Figma "Start loading aniamtion" 1–4 (184:117, 184:135, 184:152, 184:174).
   White screen, ENGINEERING · VIRALITY either side, the line from the hero's copy at the bottom, and a
   208px-tall slot in the middle: the first image with the text, then a showreel of hard cuts (same
   height, each image its own width), then the golden ratio drawing, which zooms up onto the hero's
   construction (.hv-golden, HeroVertical) — the SVG is that construction at 1/4.71, so its strokes
   land at exactly the hero's 1.325px. Drawn 1:1 in Figma px, like the hero.

   The two endings (html[data-intro], HeroIntroOptions):
   Zoom — the Identity Labs logo draws in the middle (each letter's outline, then its fill, left to
   right), then splits: "Identity" springs to the left edge and "Labs" to the right, and the first
   image opens between them. The golden ratio zooms onto the drawn hero.
   Fade — ENGINEERING VIRALITY in the middle, splitting the same way. At the end the golden ratio
   fades, the logo draws in its place, holds, and fades away with the white onto the clean hero.

   html[data-loader]: "run" (overlay up, page animations held) → "zoom" → "done" (overlay gone; the
   hero's own entrance plays from there). Set before first paint by the inline script, so the hero
   never shows under it; skipped entirely for reduced motion. Must be rendered before the hero. */

// The reel, in order. src: under /public. w: the image's width at 208 tall. crop: the image runs that %
// of the slot's height from the top (Figma's crop on 184:172). The first three are Figma's; the rest are
// the same archival family from the tools collage and the research papers. Each entry is a hard cut.
export type ReelImage = { src: string; w: number; crop?: number };
const REEL: ReelImage[] = [
  { src: 'assets/loader/reel-1-einstein.png', w: 174 },
  { src: 'assets/loader/reel-2.png', w: 161 },
  { src: 'assets/tools-collage/c4.webp', w: 133 },
  { src: 'assets/research/back-fig-2.webp', w: 151 },
  { src: 'assets/tools-collage/c3.webp', w: 171 },
  { src: 'assets/research/front-fig-1.webp', w: 182 },
  { src: 'assets/loader/reel-3.png', w: 164, crop: 108.94 },
  { src: 'assets/tools-collage/c7.webp', w: 132 },
  { src: 'assets/tools-collage/c6.webp', w: 369 },
  { src: 'assets/research/linkedin-fig-3.webp', w: 167 },
  { src: 'assets/tools-collage/c9.webp', w: 161 },
  { src: 'assets/research/back-fig-3.webp', w: 144 },
  { src: 'assets/research/linkedin-fig-2.webp', w: 168 },
  { src: 'assets/tools-collage/c1.webp', w: 183 },
];

// /hero's reel, first half: the people and the papers — scientists, equations, patent drawings,
// research figures — ending on the nautilus construction, which hands over to the golden half.
// 25: the opener, then 24 cuts — six bars of four on the 100ms beat (StartLoaderRun's BEAT).
// Oppenheimer and Tesla from Figma "start loader more iamges" (Zoomcast 194:2); Einstein, the optics
// plate and the nautilus drawing are /home-4's PNGs as small WebPs at the frame's 2× (1.6–1.9MB PNGs
// decode slowly enough to hold a cut); the rest
// (assets/loader/reel) public domain, from Wikimedia Commons — colour portraits set in grey.
const R = (n: string, w: number): ReelImage => ({ src: `assets/loader/reel/${n}.webp`, w });
const REEL_HERO: ReelImage[] = [
  R('einstein-opener', 174),
  R('euclid', 156),
  { src: 'assets/loader/reel-tesla.webp', w: 155.5 },
  R('fibonacci', 136),
  R('curie', 156),
  { src: 'assets/loader/reel/optics.webp', w: 164, crop: 108.94 },
  R('newton', 156),
  R('principia', 150),
  R('galileo', 156),
  R('kepler', 189),
  R('lovelace', 156),
  { src: 'assets/tools-collage/c3.webp', w: 171 },
  R('ramanujan', 156),
  { src: 'assets/research/linkedin-fig-3.webp', w: 167 },
  R('turing', 156),
  { src: 'assets/tools-collage/c7.webp', w: 132 },
  R('maxwell', 166.5),
  R('vitruvian', 153),
  R('planck', 156),
  { src: 'assets/research/front-fig-1.webp', w: 182 },
  R('hilbert', 156),
  R('leonardo-notes', 152),
  R('einstein-board', 166.5),
  { src: 'assets/loader/reel-oppenheimer.webp', w: 157.5 },
  R('nautilus-construction', 161),
];

// Second half: the golden ratio at work. Each image is warped so its own upright
// golden rectangle — big square on top, the spiral's eye low on the right — lands on one rectangle:
// 118.67 × 192 at (4, 4) in a 126.5 × 200 frame (files at 2×, assets/loader/golden). The spiral
// over them (<Spiral>) is that rectangle's, so it stays put while the images cut under it.
// Six from Zoomcast 194:2 (their own drawn spirals aligned to ours: blackboard, Eiffel, Mona Lisa, birds,
// solar system, begonia); the rest public domain / CC0 from Wikimedia Commons, fitted by their centre and
// size: M51 (Hubble), Katrina (NASA), Vermeer, Botticelli, Weston's Nautilus (1927), a fern fiddlehead,
// an ear, the Vatican staircase, a snail, an ammonite. 16, all different — four bars of four — the
// subjects alternating: construction, nature, cosmos, art.
const GOLDEN = ['black', 'nautilus', 'eiffel', 'm51', 'mona', 'fern', 'katrina', 'birds', 'ear', 'stairs', 'pearl', 'ammonite', 'solar', 'snail', 'venus', 'begonia'];
// /hero's one frame, the whole reel through: 208 tall (the slot) at the golden frames' proportion,
// 126.5 : 200 — so its size never changes, cut to cut or half to half. The first half's images are
// cropped to fill it (cover, centred); the golden images and their spiral drawing (in its own 126.5 ×
// 200 units, VB_*) scale up together to it, so they stay locked.
// /hero's beat (StartLoaderRun BEAT; start-loader.css's clock assumes 24 + 16 cuts of it): every cut is
// a CSS animation set this far apart, run by the compositor — not stepped from the main thread,
// where any busy moment held an image on screen.
const REEL_BEAT = 100;
const VB_W = 126.5;
const VB_H = 200;
const G_H = 208;
const G_W = (VB_W * G_H) / VB_H; // 131.56


/* The construction, in the frame's px: squares cut from the golden rectangle in turn — top, left,
   bottom, right — each with a quarter arc, which together make the spiral. */
const PHI = (1 + Math.sqrt(5)) / 2;
// The bulge (as the reference: each picture a slightly convex screen) is baked into the /hero images
// (assets/loader/bulged): in the frame's own −1…1 coordinates a point at radius ρ goes to
// ρ·(1 + 0.08(1 − ρ²/2)) — the centre 8% larger, the corners in place, so the frame stays a plain,
// filled rectangle while straight lines in the picture bow gently out. The spiral and its
// construction go through the same warp, here, so they stay on the images' own spirals; no filter
// runs in the browser.
const BULGE_K = 0.08;
function bulge(x: number, y: number): [number, number] {
  const u = (x - VB_W / 2) / (VB_W / 2), v = (y - VB_H / 2) / (VB_H / 2);
  const k = 1 + BULGE_K * (1 - (u * u + v * v) / 2);
  return [VB_W / 2 + u * k * (VB_W / 2), VB_H / 2 + v * k * (VB_H / 2)];
}
// a polyline through the warp: `pts` in the frame's units, warped, as path data
const f2 = (n: number) => +n.toFixed(2);
const poly = (pts: [number, number][]) => pts.map(([x, y], i) => { const [X, Y] = bulge(x, y); return `${i ? 'L' : 'M'}${f2(X)} ${f2(Y)}`; }).join('');
const seg = (x0: number, y0: number, x1: number, y1: number, n = 16): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
// a quarter arc about (cx, cy) from one point to another, the short way round
const quarter = (cx: number, cy: number, x0: number, y0: number, x1: number, y1: number, n = 24): [number, number][] => {
  const r = Math.hypot(x0 - cx, y0 - cy), a0 = Math.atan2(y0 - cy, x0 - cx);
  let d = Math.atan2(y1 - cy, x1 - cx) - a0;
  if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
  return Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos(a0 + (d * i) / n), cy + r * Math.sin(a0 + (d * i) / n)]);
};
/* The construction, in the frame's units: squares cut from the golden rectangle in turn — top, left,
   bottom, right — each with a quarter arc, which together make the spiral; all through the bulge. */
function construction() {
  let x = 4, y = 4, w = 192 / PHI, h = 192;
  const outer = poly([...seg(x, y, x + w, y), ...seg(x + w, y, x + w, y + h).slice(1), ...seg(x + w, y + h, x, y + h).slice(1), ...seg(x, y + h, x, y).slice(1)]);
  const lines: string[] = [];
  const arc: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const k = i % 4;
    const s = k % 2 === 0 ? w : h;
    if (k === 0) { arc.push(...quarter(x + s, y + s, x + s, y, x, y + s)); y += s; h -= s; lines.push(poly(seg(x, y, x + w, y))); }
    else if (k === 1) { arc.push(...quarter(x + s, y, x, y, x + s, y + s)); x += s; w -= s; lines.push(poly(seg(x, y, x, y + h))); }
    else if (k === 2) { arc.push(...quarter(x, y + h - s, x, y + h, x + s, y + h - s)); h -= s; lines.push(poly(seg(x, y + h, x + w, y + h))); }
    else { arc.push(...quarter(x + w - s, y + s, x + w, y + s, x + w - s, y)); w -= s; lines.push(poly(seg(x + w, y, x + w, y + h))); }
  }
  return { outer, lines: lines.join(''), arc: poly(arc) };
}
const CON = construction();
/* Two layers: the construction lines, thin, in difference (dark on light images, light on dark); and
   the spiral itself, the highlight — a bright white line with a glow over a soft dark edge, so it
   reads as lit on every image, light or dark, as in the reference. */
function Spiral() {
  return (
    // inside the golden zoom layer with the images (.sl-zoom-b), so it pushes in with them and crops at
    // the frame; the construction's difference blend reaches the images there
    <>
      <svg className="sl-spiral" viewBox={`0 0 ${VB_W} ${VB_H}`} width={G_W} height={G_H} aria-hidden="true">
        <path className="sl-sp-line" d={CON.outer} />
        <path className="sl-sp-line" d={CON.lines} />
      </svg>
      {/* the flash: a brighter, wider glow of the same arc, flaring on each golden cut and dying away
          within the beat (start-loader.css .sl-spiral-flash; StartLoaderRun sets the beat) */}
      <svg className="sl-spiral sl-spiral-flash" viewBox={`0 0 ${VB_W} ${VB_H}`} width={G_W} height={G_H} aria-hidden="true">
        <path className="sl-sp-arc sl-sp-halo" d={CON.arc} pathLength={1} />
        <path className="sl-sp-arc" d={CON.arc} pathLength={1} />
      </svg>
      <svg className="sl-spiral sl-spiral-glow" viewBox={`0 0 ${VB_W} ${VB_H}`} width={G_W} height={G_H} aria-hidden="true">
        <path className="sl-sp-arc sl-sp-edge" d={CON.arc} pathLength={1} />
        <path className="sl-sp-arc sl-sp-halo" d={CON.arc} pathLength={1} />
        <path className="sl-sp-arc" d={CON.arc} pathLength={1} />
      </svg>
    </>
  );
}

// Right after the overlay, before hydration. Once the first image has loaded (and the fonts, so the
// words measure true): sets --l-dx / --r-dx / --dy on the overlay — how far each of the pair shown
// (the words, or the logo's halves) must move to sit side by side in the middle of the screen, one
// space apart (--sl-gap for the logo: its halves' overlap) — then marks html[data-sl-ready]
// (and the time), which starts the opening (start-loader.css). Never opens on an empty frame.
const READY = `(function(){var d=document.documentElement;if(d.dataset.loader!=='run')return;var sl=document.querySelector('.sl'),img=sl&&sl.querySelector('.sl-frame img'),done=0;function go(){if(done)return;done=1;function vis(q){var a=sl.querySelectorAll(q);for(var i=0;i<a.length;i++)if(a[i].getClientRects().length)return a[i]}var l=vis('.sl-l').getBoundingClientRect(),r=vis('.sl-r').getBoundingClientRect(),cs=getComputedStyle(sl),gv=parseFloat(cs.getPropertyValue('--sl-gap')),gap=isNaN(gv)?parseFloat(cs.fontSize)*0.6+0.96:gv,x=(innerWidth-(l.width+gap+r.width))/2;sl.style.setProperty('--l-dx',(x-l.left)+'px');sl.style.setProperty('--r-dx',(x+l.width+gap-r.left)+'px');sl.style.setProperty('--dy',(innerHeight/2-(l.top+l.height/2))+'px');d.setAttribute('data-sl-ready','');window.__slReady=performance.now()}function r(){var f=document.fonts;f&&f.ready?f.ready.then(go,go):go()}setTimeout(go,3000);if(!img||img.complete)return r();img.addEventListener('load',r);img.addEventListener('error',r)})()`;

// html[data-intro]: the loader's ending and the hero after it (?intro=zoom|fade, HeroIntroOptions),
// set first so the clean hero is right even when the loader is skipped.
// The drawn wordmark: one path per letter (wordmark-paths.ts), its outline drawn then filled
// (start-loader.css .sl-ink). --i staggers the letters. `x`/`w` crop the 103 × 23 wordmark.
function Ink({ paths, x, w, scale, from = 0, className }: { paths: string[]; x: number; w: number; scale: number; from?: number; className: string }) {
  return (
    <svg className={`sl-ink ${className}`} viewBox={`${x} 0 ${w} ${WORDMARK_H}`} width={w * scale} height={WORDMARK_H * scale} aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} pathLength={1} style={{ '--i': from + i } as CSSProperties} />)}
    </svg>
  );
}
const LOGO = 1.5; // the split logo, × the 103 × 23 wordmark (155 × 35)
const END_LOGO = 1.65; // the Fade ending's logo, in the image slot (170 × 38)

// /hero (fixed): the logo opening (html[data-sl-open='logo']), the reel, then the white lifts onto the
// clean hero (data-intro 'fade') with no golden ratio (html[data-sl-end='reel']).
// `choice` (/home-4): ?loader=first plays only the reel's first half (html[data-sl-reel='first']): no golden
// half, the white lifting after the nautilus drawing (HeroIntroOptions' Loader tab)
const BOOT = (fixed: boolean, choice: boolean) => `(function(){var d=document.documentElement,u=new URLSearchParams(location.search),q=u.get('intro');${
  fixed ? "d.dataset.intro='fade';d.dataset.slOpen='logo';d.dataset.slEnd='reel';" : "d.dataset.intro=q==='fade'?'fade':'zoom';"}${
  choice ? "d.dataset.slReel=u.get('loader')==='first'?'first':'full';" : ''}if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.dataset.loader='run';try{history.scrollRestoration='manual'}catch(e){}scrollTo(0,0)})()`;

export default function StartLoader({ fixed = false, choice = false }: { fixed?: boolean; choice?: boolean }) {
  const reel = fixed ? REEL_HERO : REEL;
  // /hero: each image already cropped to the frame and bulged (assets/loader/bulged, by its file name)
  const bulged = (src: string) => `assets/loader/bulged/${src.split('/').pop()!.replace(/\.\w+$/, '')}.webp`;
  // /hero: each frame's moment on the beat (ms from the reel's start), for its own CSS animation
  // (start-loader.css .sl[data-reel]): the opener before the first cut, then one beat each
  const at = (i: number) => (fixed && i > 0 ? { '--at': `${(i - 1) * REEL_BEAT}ms` } : {});
  const reelFrames = reel.map((r, i) => (
    <span className={fixed && i === reel.length - 1 ? 'sl-frame sl-last-a' : 'sl-frame'} data-on={i === 0 ? '' : undefined} key={r.src} style={{ width: `${fixed ? G_W : r.w}px`, ...at(i) } as CSSProperties}>
      <img src={`/${fixed ? bulged(r.src) : r.src}`} alt="" decoding="async" fetchPriority={i === 0 ? 'high' : 'auto'}
        style={r.crop && !fixed ? { height: `${r.crop}%`, objectFit: 'fill' } : undefined} />
    </span>
  ));
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT(fixed, choice) }} />
      {/* its script sets the halves' offsets (style) before React hydrates */}
      <div className="sl" aria-hidden="true" suppressHydrationWarning>
        {/* Fade: the words; Zoom: the logo in two halves that overlap where the italic L tucks under the y */}
        <p className="sl-side sl-word sl-l">Engineering</p>
        <p className="sl-side sl-word sl-r">Virality</p>
        <Ink className="sl-side sl-logo sl-l" paths={IDENTITY} x={0} w={IDENTITY_W} scale={LOGO} />
        <Ink className="sl-side sl-logo sl-r" paths={LABS} x={LABS_X} w={WORDMARK_W - LABS_X} scale={LOGO} from={IDENTITY.length} />
        {/* Fade: the logo that draws at the end, where the golden ratio was */}
        <Ink className="sl-endlogo" paths={[...IDENTITY, ...LABS]} x={0} w={WORDMARK_W} scale={END_LOGO} />
        <div className="sl-slot">
          {/* /hero: one fixed frame (.sl-stage, clipping) holding two zoom layers — the first half's
              images (.sl-zoom-a, pushed from the centre) and the golden half's images with the spiral
              (.sl-zoom-b, pushed about the spiral's eye). The camera move is one transform on one layer;
              a cut only switches which image inside it shows. /home-4: the frames on their own. */}
          {fixed ? (
            <span className="sl-stage">
              <span className="sl-zoom sl-zoom-a">{reelFrames}</span>
              <span className="sl-zoom sl-zoom-b">
                {GOLDEN.map((g, i) => (
                  <span className={i === GOLDEN.length - 1 ? 'sl-frame sl-gframe sl-last' : 'sl-frame sl-gframe'} key={`${g}-${i}`}
                    style={{ width: `${G_W}px`, ...at(reel.length + i) } as CSSProperties}>
                    <img src={`/assets/loader/bulged/g-${g}.webp`} width={G_W} height={G_H} alt="" decoding="async" />
                  </span>
                ))}
                <Spiral />
              </span>
            </span>
          ) : reelFrames}
          {/* golden ratio (Figma 184:290): 122.636 × 208.141 in the slot (the SVG's own size), drawn
              at the hero's 577.663 × 980.663 and scaled down in CSS so the zoom stays sharp. Two
              layers: 1px lines while it holds (the design's 0.28px drop edges at that size), handing
              over during the zoom to the design's own, which lands on the hero's construction 1:1.
              The 1px one is laid out at its true size beside the scaled box, not inside it: an SVG
              <img> is drawn as a bitmap at its layout size, so shrunk by a transform its lines resample
              unevenly (one edge one pixel, another two). */}
          <span className="sl-golden">
            <img className="sl-g-thin" src="/assets/loader/golden.svg" width={577.663} height={980.663} alt="" />
          </span>
          <img className="sl-g-bold" src="/assets/loader/golden-bold.svg" width={124} height={210} alt="" />
        </div>
        <p className="sl-caption">
          The largest tech companies on earth rely on our algorithm research, analytics software, and deployed services
          to reach a billion people.
        </p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: READY }} />
      <StartLoaderRun frames={reel.length + (fixed ? GOLDEN.length : 0)} golden={fixed ? GOLDEN.length : 0} />
    </>
  );
}
