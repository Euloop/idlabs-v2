import StartLoaderRun from './StartLoaderRun';
import './start-loader.css';

/* /home-4 start loader — Figma "Start loading aniamtion" 1–4 (184:117, 184:135, 184:152, 184:174).
   White screen, ENGINEERING · VIRALITY either side, the line from the hero's copy at the bottom, and a
   208px-tall slot in the middle: the first image with the text, then a showreel of hard cuts (same
   height, each image its own width), then the golden ratio drawing, which zooms up onto the hero's
   construction (.hv-golden, HeroVertical) — the SVG is that construction at 1/4.71, so its strokes
   land at exactly the hero's 1.325px. Drawn 1:1 in Figma px, like the hero.

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
  { src: 'assets/loader/reel-3.png', w: 164, crop: 108.94 },
  { src: 'assets/tools-collage/c7.webp', w: 132 },
  { src: 'assets/tools-collage/c9.webp', w: 161 },
  { src: 'assets/research/back-fig-3.webp', w: 144 },
  { src: 'assets/tools-collage/c1.webp', w: 183 },
];

// Right after the overlay, before hydration: marks html[data-sl-ready] (and the time) once the first
// image has loaded, which starts the opening (start-loader.css) — so it never opens on an empty frame.
const READY = `(function(){var d=document.documentElement;if(d.dataset.loader!=='run')return;var img=document.querySelector('.sl-frame img');function r(){if(d.hasAttribute('data-sl-ready'))return;d.setAttribute('data-sl-ready','');window.__slReady=performance.now()}if(!img||img.complete)return r();img.addEventListener('load',r);img.addEventListener('error',r);setTimeout(r,2500)})()`;

const BOOT = `(function(){var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.dataset.loader='run';try{history.scrollRestoration='manual'}catch(e){}scrollTo(0,0)})()`;

export default function StartLoader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <div className="sl" aria-hidden="true">
        <p className="sl-side sl-l">Engineering</p>
        <p className="sl-side sl-r">Virality</p>
        <div className="sl-slot">
          {REEL.map((r, i) => (
            <span className="sl-frame" data-on={i === 0 ? '' : undefined} key={r.src} style={{ width: `${r.w}px` }}>
              <img src={`/${r.src}`} alt="" decoding="async" fetchPriority={i === 0 ? 'high' : 'auto'}
                style={r.crop ? { height: `${r.crop}%`, objectFit: 'fill' } : undefined} />
            </span>
          ))}
          {/* golden ratio (Figma 184:290): 122.636 × 208.141 in the slot (the SVG's own size), drawn
              at the hero's 577.663 × 980.663 and scaled down in CSS so the zoom stays sharp */}
          <img className="sl-golden" src="/assets/loader/golden.svg" width={577.663} height={980.663} alt="" />
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
