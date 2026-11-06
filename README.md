# Identity Labs — hero landing page

Next.js 16 (App Router, TypeScript, plain CSS, static export) build of Figma "Zoomcast" section `109:897` (frame `109:715`, 1280 × 832).
File key `aWd28sY1hrq3jdhoRdAlku`.

- `npm run dev` → http://localhost:3000
- `npm run build` → static site in `out/`
- Page: `app/page.tsx` (live, iterate here); `/temp` (`app/temp/page.tsx`) is a frozen, self-contained snapshot of Section 2 v1 (`components/snapshots/v1/`, classes `s2v1-*` / `.pipe-v1`, commit 18b8973) — don't edit it; logo strip: `components/ClientLogos.tsx`; styles: `app/globals.css`; assets and fonts: `public/`.

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
- Section 2 text stays hidden until the stage pins, then types in with `components/TokenText.tsx`: letters appear one by one, fast (≤1s per line), each easing from pale grey to ink, no cursor. The main texts (part 1, the step label, part 3) also flash a faint probability under each word; the diagram notes type without them. Exit is a 220ms fade; header/footer labels just fade; no layout shift; reduced motion = plain toggle.
- Scroll drives everything directly (Lenis smooths the wheel; no extra easing, gates or holds): part 1, the diagram drawing itself in, the zoom, the stage changes, the step label, part 3. Only the stories inside the diagram stages loop on their own clocks.
- Page material is a fixed `.backdrop`: dark paper, with the light page above it. Theme switch is the lights coming up, as on departuremono.com (an IntersectionObserver flips one CSS variable; CSS eases colours with `.4s ease`): when ~half the hero has scrolled away (55% / 65% hysteresis) `html[data-theme]` flips and the light layer, the frame rules and the hero content all ease over one 400ms `ease` — a single smooth ramp, no scroll scrub, no flicker. Same in reverse. Section 2 text streams in once the light is up. Reduced motion: instant switch.
- Section starts one viewport early under the hero (pinned stage). Everything after that is pinned; parts 1–3 swap in place in the band between header and footer. After the hero leaves: part 1 holds 1.5vh, then fades out; the whole-system diagram draws itself in line by line starting 0.25vh after part 1 leaves (1.2vh), the diagram takes 9vh: scroll drives the camera (zoom into the globe, slides between stages) and picks the stage; inside each stage the story (highlighted post, notes, leaders) loops on its own clock — a short rest, the story (sourcing 8.5s, scoring 6.8s, selection 6.4s), a 2s hold, again — so a visitor can stay and watch it all (reduced motion: scrubbed by scroll instead), then Selection fades out, the step label fades and part 3 streams in (0.6vh), 1.4vh hold, release.
- Diagram: `components/pipeline/engine.js` keeps the three stage drawings (sourcing, scoring, selection) from the supplied `x-for-you-pipeline.html` (original kept in `ref/`); the story/camera on top is v31 + highlighted post and callouts:
  - Overview: ALL POSTS globe on the left, posts flowing into a solid ring funnel (sourcing → blue scoring waist → selection), a few reaching the FEED slots. After part 1 it draws itself in as pen strokes: every line (globe outline, each ring front then back, silhouettes, feed screen, slots, ground) is traced along its own path, staggered left → right; the solid fill settles in last.
  - Zoom in: the camera zooms into the globe until it *is* the Sourcing stage's globe (same points, rotation, size, place). The funnel's fill drops first, then its lines are erased along their paths, left → right; Thunder, Phoenix and the candidate grid are revealed behind the erase front (SVG mask).
  - Stage to stage: outgoing stage slides left and fades, incoming comes in from the right (≤ 2 on screen), Emil Kowalski's strong ease-in-out `cubic-bezier(0.77,0,0.175,1)`. Selection is held to the end (no zoom out).
  - Your post: one highlighted post (accent blue) runs through each stage on the stage's loop — out of the globe via Phoenix into the candidate grid (hydrated, survives the filter); through the scorer (its P(action) values, score, diversity factor); as the blue bar above the top-K cut, through the visibility filter into feed slot 2. The overview shows it as the blue particle.
  - Step label (top centre, above the diagram) names the current module: the overview line, then 1) Sourcing, then 2) Ranking (scoring + selection). Notes (`NOTES` in engine.js, SVG units) explain each point, one at a time as the post reaches it; each note is one short term from the client's figure, one note on screen at a time. The page measures each note's real text box (it wraps differently per width) and the leader starts from the text edge facing its anchor: a short stub towards it, then straight to the anchor dot. Leaders draw as pen strokes; text is HTML over the SVG, streamed in.
  - Reduced motion: crossfades only. Narrow screens: stages zoomed ×(760 / width), cropped at the sides (open item).
  Styles are scoped under `.pipe`; fonts mapped to IBM Plex Mono / Inter.
- Copy is fixed by the client — do not reword. Part 1, the step lines (`STEPS` in `SectionTwo.tsx`) and part 3 are the Notion copy word for word; part 1 shows only the headline because its second sentence is the overview step line. Notes use the step names from the client's pipeline figure, kept short (Candidate sources, In-network, Out-of-network, Candidate hydration, Pre-scoring filters, Scoring, Weighted sum, Selection, Post-selection filters, Ranked For You timeline).
- In dev, open http://localhost:3000 (Next 16 blocks dev scripts on 127.0.0.1).

## Performance
Texture and tile glow are WebP (2.6 MB PNG → 105 KB), texture is preloaded with high priority, fonts preloaded and self-hosted.

## Open items
- Nav links (Manifesto, Careers) point to `#` — destinations not confirmed.
- Wordmark space tracking tightened to -4.4 (Figma says -3.36) to match the rendered gap.
