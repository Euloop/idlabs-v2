# Identity Labs — hero landing page

Next.js 16 (App Router, TypeScript, plain CSS, static export) build of Figma "Zoomcast" section `109:897` (frame `109:715`, 1280 × 832).
File key `aWd28sY1hrq3jdhoRdAlku`.

- `npm run dev` → http://localhost:3000
- `npm run build` → static site in `out/`
- Page: `app/page.tsx` (live, iterate here); `/temp` (`app/temp/page.tsx`) is a frozen, self-contained snapshot of Section 2 v1 (`components/snapshots/v1/`, classes `s2v1-*` / `.pipe-v1`, commit 18b8973) and `/temp2` (`app/temp2/page.tsx`) of v2, the variant whose diagram stages auto-loop (`components/snapshots/v2/`, classes `s2v2-*` / `.pipe-v2` / `v2tw`, commit 295dae8) — don't edit them; logo strip: `components/ClientLogos.tsx`; styles: `app/globals.css`; assets and fonts: `public/`.

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
- Everything in Section 2 is driven by the scroll position (Lenis smooths the wheel). Text types in letter by letter as you scroll and un-types as you scroll back (`components/ScrollText.tsx`, set imperatively each frame; each letter eases from pale grey to ink; part 1, the step label and part 3 carry a faint probability under the word being written). Header/footer labels just fade in once the light is up (`TokenText.tsx`, `fade`).
- Diagram: scroll drives the draw-in, the zoom, the stage changes and each stage's story (highlighted post scrubbed through it). Each note writes in as the post reaches it — leader line first, then its text — and writes out as it passes (`noteProgress` in `pipeline/engine.js`).
- Page material is a fixed `.backdrop`: dark paper, with the light page above it. Theme switch is the lights coming up, as on departuremono.com (an IntersectionObserver flips one CSS variable; CSS eases colours with `.4s ease`): when ~half the hero has scrolled away (55% / 65% hysteresis) `html[data-theme]` flips and the light layer, the frame rules and the hero content all ease over one 400ms `ease` — a single smooth ramp, no scroll scrub, no flicker. Same in reverse. Section 2 text streams in once the light is up. Reduced motion: instant switch.
- Section starts one viewport early under the hero (pinned stage). Everything after that is pinned; parts 1–3 swap in place in the band between header and footer. After the hero leaves: part 1 holds 1.5vh, then fades out; the whole-system diagram draws itself in line by line starting 0.25vh after part 1 leaves (1.2vh), the diagram takes 9vh, all scrubbed by the scroll, then Selection fades out, the step label fades and part 3 streams in (0.6vh), 1.4vh hold, release.
- Diagram: `components/pipeline/engine.js` keeps the three stage drawings (sourcing, scoring, selection) from the supplied `x-for-you-pipeline.html` (original kept in `ref/`); the story/camera on top is v31 + highlighted post and callouts:
  - Overview: ALL POSTS globe on the left, posts flowing into a solid ring funnel (sourcing → blue scoring waist → selection), a few reaching the FEED slots. After part 1 it draws itself in as pen strokes: every line (globe outline, each ring front then back, silhouettes, feed screen, slots, ground) is traced along its own path, staggered left → right; the solid fill settles in last.
  - Zoom in: the camera zooms into the globe until it *is* the Sourcing stage's globe (same points, rotation, size, place). The funnel's fill drops first, then its lines are erased along their paths, left → right; Thunder, Phoenix and the candidate grid are revealed behind the erase front (SVG mask).
  - Stage to stage: outgoing stage slides left and fades, incoming comes in from the right (≤ 2 on screen), Emil Kowalski's strong ease-in-out `cubic-bezier(0.77,0,0.175,1)`. Selection is held to the end (no zoom out).
  - Your post: one highlighted post (accent blue) is scrubbed through each stage — out of the globe via Phoenix into the candidate grid (hydrated, survives the filter); through the scorer (its P(action) values, score, diversity factor); as the blue bar above the top-K cut, through the visibility filter into feed slot 2. The overview shows it as the blue particle.
  - Step label (centred below the diagram) names the current module: the overview line, then 1) Sourcing, then 2) Ranking (scoring + selection). Notes (`NOTES` in engine.js, SVG units) explain each point, one at a time as the post reaches it; each note is one short term from the client's figure, one note on screen at a time. The page measures each note's real text box (it wraps differently per width) and the leader starts from the text edge facing its anchor: a short stub towards it, then straight to the anchor dot. Leaders draw as pen strokes; text is HTML over the SVG, streamed in.
  - Reduced motion: crossfades only. Narrow screens: stages zoomed ×(760 / width), cropped at the sides (open item).
  - Alignment: the overview and every stage fill the same horizontal span (viewBox x 170–1030), centred: `SPAN`, `EXT`, `OV`, `SS` in engine.js scale each view to it (overview ×1.1, scoring ×0.86).
  Styles are scoped under `.pipe`; fonts mapped to IBM Plex Mono / Inter.
- Copy is fixed by the client — do not reword. Part 1, the step lines (`STEPS` in `SectionTwo.tsx`) and part 3 are the Notion copy word for word; part 1 shows only the headline because its second sentence is the overview step line. Notes use the step names from the client's pipeline figure, kept short (Candidate sources, In-network, Out-of-network, Candidate hydration, Pre-scoring filters, Scoring, Weighted sum, Selection, Post-selection filters, Ranked For You timeline).
- In dev, open http://localhost:3000 (Next 16 blocks dev scripts on 127.0.0.1).

## Sections 3–4 · Research papers, tools intro, analytical tools
- Shared fixed chrome (`components/SiteChrome.tsx`): wordmark + nav (Manifesto, Careers; 12px IBM Plex Mono caps) on screen everywhere, hero included, colour follows the theme; footer label from the section in view (`data-foot`, `data-foot-night`).
- Themes: `html[data-theme]` = dark (hero) → light (Section 2–3) → `night` (the hero's dark material again) from ~0.35 viewport into the tools intro's hold, through Section 4. Driven from `SectionTwo.tsx`.
- Section 3 (`SectionThree.tsx`, Figma 130:3569): two papers on a grid, always light; normal scroll, holds 1 viewport.
- Tools intro (`ToolsIntro.tsx`, Figma 135:5393 / 135:5409): one line typed in with the scroll; holds; the page goes to night.
- Section 4 (`SectionFour.tsx`, Figma 132:4683 / 135:5972): dark screenshots (`public/assets/tools/*-d-*.webp`) with the frosted info card over them; tools cycle every 7s, click a name to select, cycling pauses while reading the card.
- `pullUp.ts` tucks a section under the previous one's hold to keep gaps short, never so far that it locks while the previous content is still on screen.

## Performance
Texture and tile glow are WebP (2.6 MB PNG → 105 KB), texture is preloaded with high priority, fonts preloaded and self-hosted.

## Open items
- Nav links (Manifesto, Careers) point to `#` — destinations not confirmed.
- Wordmark space tracking tightened to -4.4 (Figma says -3.36) to match the rendered gap.
