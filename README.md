# Identity Labs — hero landing page

Next.js 16 (App Router, TypeScript, plain CSS, static export) build of Figma "Zoomcast" section `109:897` (frame `109:715`, 1280 × 832).
File key `aWd28sY1hrq3jdhoRdAlku`.

- `npm run dev` → http://localhost:3000
- `npm run build` → static site in `out/`
- Page: `app/page.tsx`; logo strip: `components/ClientLogos.tsx`; styles: `app/globals.css`; assets and fonts: `public/`.

## Layout system
- `.frame`: 1056px column between the two vertical rules, 24px inner padding; it is the size container (`100cqw` = content width).
- `.golden`: the golden construction spans the content width. ≥960px horizontal (384 : 622 columns, 366 : 226 rows) — headline in the small square, body copy in the large square; type scales with the column (`--gu`), with 30px / 13px minimums.
- <960px: construction rotated vertical so squares stay square; headline in the large square, body copy below it. Logos 8 → 4 → 2 columns.
- Frame width steps: 1056 (<1512w), 1440 (1512–1899w), 1560 (≥1900w), and is also capped by viewport height (content ≤ 100svh × 1008/832, floor 880px) so header → logos always fit on desktop. Header and logo strip scale with the frame (`--px`).
- 12px markers sit on the rules at the header base, the 61.8% split and below the logos.

## Motion (CSS only, honours prefers-reduced-motion)
Rules draw down, spiral reveals outward from its eye, headline words rise through a mask, body blocks and logo tiles fade up in sequence; nav links roll on hover.

## Section 2 · Algorithm research (Figma 110:920, 110:898)
- Frame rules are one fixed `.frame.rails` pair for the whole page; colour follows `--theme`, so they run unbroken across the transition.
- Section 2 chrome/text stay hidden until the stage pins, then appear with `components/Glitch.tsx` (decode from random glyphs, accent-blue flicker, left→right; reverse on exit; no layout shift; reduced-motion = plain toggle).
- Page material is a fixed `.backdrop` (white base + dark paper layer). `--theme` 0→1 fades the dark paper as the hero leaves.
- Section is `700svh` tall with a sticky stage: part 1 holds 0.7vh, hands over (part 1 out, then part 2 in), the diagram scrubs over 4.4vh, short hold, release.
- Diagram: `components/pipeline/engine.js` is v26 from the supplied `x-for-you-pipeline.html` (original kept in `ref/`), with only the helpers it uses. Changes: lookups scoped to its `<svg>`, a zoom boost on narrow screens (applied inside stages only), and in-SVG chapter label/dots removed (page renders the step label). Styles are scoped under `.pipe`; fonts mapped to IBM Plex Mono / Inter.
- Step copy 2 and 3 in `SectionTwo.tsx` is draft — replace with final copy.
- In dev, open http://localhost:3000 (Next 16 blocks dev scripts on 127.0.0.1).

## Performance
Texture and tile glow are WebP (2.6 MB PNG → 105 KB), texture is preloaded with high priority, fonts preloaded and self-hosted.

## Open items
- Nav links (Manifesto, Careers) point to `#` — destinations not confirmed.
- Wordmark space tracking tightened to -4.4 (Figma says -3.36) to match the rendered gap.
