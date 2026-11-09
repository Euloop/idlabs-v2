import Hero from '../components/Hero';
import SectionTwo from '../components/SectionTwo';
import SectionThree from '../components/SectionThree';
import ToolsIntro from '../components/ToolsIntro';
import SectionFour from '../components/SectionFour';
import SiteChrome from '../components/SiteChrome';

/* Identity Labs hero — Figma "Zoomcast" 109:897 / frame 109:715.

   Layout system (from the design):
   • .frame    — 1056px column bounded by the two vertical rules, 24px inner padding.
   • .golden   — the golden-ratio construction filling the column (1006 × 592).
                 Columns split 384 : 622 (≈ 0.382 : 0.618); the small column's
                 rows split 366 : 226 (again 0.618 : 0.382).
   • Text lives inside the squares: headline in the small square,
     body copy in the large square. On narrow screens the construction
     turns vertical so the squares stay square instead of stretching. */

export default function Home() {
  return (
    <>
    <Hero />
    <SectionTwo />
    <SectionThree />
    <ToolsIntro />
    <SectionFour />
    <SiteChrome />
    </>
  );
}
