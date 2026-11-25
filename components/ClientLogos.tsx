import type { CSSProperties } from 'react';

/* Client logo strip — Figma 109:774. Each logo is a box of the exported
   size (w × h, px) holding one or more SVG parts placed by inset,
   exactly as in the design. The Lovable heart is built from four masked groups. */

type Part = { src: string; inset: string };
type MaskedPart = Part & { box: string; mx: number; my: number };
type Logo = { name: string; w: number; h: number; parts: Part[]; masked?: MaskedPart[] };

const LOGOS: Logo[] = [
  {
    name: 'Cursor', w: 81.823, h: 20.334,
    parts: [
      { src: 'cursor-1.svg', inset: '2.75% 78.32% 2.62% 1.05%' },
      { src: 'cursor-2.svg', inset: '27.3% 63.02% 24.75% 26.83%' },
      { src: 'cursor-3.svg', inset: '27.3% 50.45% 23.93% 39.02%' },
      { src: 'cursor-4.svg', inset: '27.3% 37.5% 24.75% 51.92%' },
      { src: 'cursor-5.svg', inset: '27.3% 25.64% 24.75% 64.14%' },
      { src: 'cursor-6.svg', inset: '26.49% 12.29% 23.92% 75.42%' },
      { src: 'cursor-7.svg', inset: '27.3% 0 24.75% 89.42%' },
    ],
  },
  { name: 'OpenAI', w: 74.235, h: 19.796, parts: [{ src: 'openai.svg', inset: '0' }] },
  {
    name: 'Airwallex', w: 84.706, h: 11.576,
    parts: [
      { src: 'airwallex-word.svg', inset: '0.13% 0.01% 0.01% 23.31%' },
      { src: 'airwallex-mark.svg', inset: '-0.03% 79.44% 0.11% 0' },
    ],
  },
  { name: 'Gamma', w: 78.896, h: 13.675, parts: [{ src: 'gamma.svg', inset: '0' }] },
  { name: 'Deel', w: 59.556, h: 20.615, parts: [{ src: 'deel.svg', inset: '0 0.44% 1.75% 0' }] },
  {
    name: 'Lovable', w: 84.183, h: 15.153,
    parts: [{ src: 'lovable-word.svg', inset: '1.03% -0.62% 4.28% 22.74%' }],
    masked: [
      { box: '-12.5% 80.96% -13.57% -4.07%', mx: 3.426, my: 1.895, src: 'lovable-g1.svg', inset: '-7.35% -7.22%' },
      { box: '-47.1% 76.45% 21.03% -6.04%', mx: 5.086, my: 7.137, src: 'lovable-g2.svg', inset: '-7.35% -5.64%' },
      { box: '-51.27% 77.28% 40.56% -0.39%', mx: 0.324, my: 7.77, src: 'lovable-g3.svg', inset: '-8.37% -7.22%' },
      { box: '-21.99% 84.09% 46.17% 2.01%', mx: -1.695, my: 3.332, src: 'lovable-g4.svg', inset: '-12.23% -12.01%' },
    ],
  },
];

const vars = (v: Record<string, string | number>) => v as CSSProperties;

function LogoPart({ src, inset }: Part) {
  return (
    <span className="part" style={{ inset }}>
      <img src={`/assets/${src}`} alt="" />
    </span>
  );
}

export default function ClientLogos() {
  return (
    <section className="clients" aria-label="Clients">
      <ul className="logo-grid">
        {LOGOS.map((logo, i) => (
          <li className="tile" key={logo.name} style={vars({ '--d': `${1240 + i * 50}ms` })}>
            <span className="logo" style={vars({ '--w': logo.w, '--h': logo.h })} role="img" aria-label={logo.name}>
              {logo.parts.map((p) => <LogoPart key={p.src} {...p} />)}
              {logo.masked?.map((m) => (
                <span className="lv" key={m.src} style={{ inset: m.box, ...vars({ '--mx': m.mx, '--my': m.my }) }}>
                  <LogoPart src={m.src} inset={m.inset} />
                </span>
              ))}
            </span>
            <img className="glow" src="/assets/tile-glow.webp" alt="" decoding="async" />
          </li>
        ))}
      </ul>
      <span className="tick tick-l" aria-hidden="true" />
      <span className="tick tick-r" aria-hidden="true" />
    </section>
  );
}
