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
const LOGO = 1.25; // the split logo, × the 103 × 23 wordmark (129 × 29)
const END_LOGO = 1.4; // the Fade ending's logo, in the image slot (144 × 32)

const BOOT = `(function(){var d=document.documentElement,q=new URLSearchParams(location.search).get('intro');d.dataset.intro=q==='fade'?'fade':'zoom';if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.dataset.loader='run';try{history.scrollRestoration='manual'}catch(e){}scrollTo(0,0)})()`;

export default function StartLoader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <div className="sl" aria-hidden="true">
        {/* Fade: the words; Zoom: the logo in two halves that overlap where the italic L tucks under the y */}
        <p className="sl-side sl-word sl-l">Engineering</p>
        <p className="sl-side sl-word sl-r">Virality</p>
        <Ink className="sl-side sl-logo sl-l" paths={IDENTITY} x={0} w={IDENTITY_W} scale={LOGO} />
        <Ink className="sl-side sl-logo sl-r" paths={LABS} x={LABS_X} w={WORDMARK_W - LABS_X} scale={LOGO} from={IDENTITY.length} />
        {/* Fade: the logo that draws at the end, where the golden ratio was */}
        <Ink className="sl-endlogo" paths={[...IDENTITY, ...LABS]} x={0} w={WORDMARK_W} scale={END_LOGO} />
        <div className="sl-slot">
          {REEL.map((r, i) => (
            <span className="sl-frame" data-on={i === 0 ? '' : undefined} key={r.src} style={{ width: `${r.w}px` }}>
              <img src={`/${r.src}`} alt="" decoding="async" fetchPriority={i === 0 ? 'high' : 'auto'}
                style={r.crop ? { height: `${r.crop}%`, objectFit: 'fill' } : undefined} />
            </span>
          ))}
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
      <StartLoaderRun frames={REEL.length} />
    </>
  );
}
