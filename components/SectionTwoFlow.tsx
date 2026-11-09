'use client';

import { useEffect, useRef, useState } from 'react';
import TokenText from './TokenText';
import ScrollText, { type ScrollTextHandle } from './ScrollText';
import Flowchart from './flow/Flowchart';
import FlowCards from './flow/FlowCards';
import FlowPills from './flow/FlowPills';
import { P_RANK, type FlowHandle } from './flow/timeline';

/* Section 2, flowchart version (/home-2). Same section as SectionTwo.tsx (copy, pinning, theme
   switch, typed text) with the client's pipeline flowchart in place of the funnel diagram.
   Per client feedback (Nov 2026): the funnel animation was stealing the show; this tries the
   flowchart route in IL line language. After the whole chart draws in, the camera zooms in and
   the two modules play one at a time: Sourcing (outline drawn, the post runs through it), then
   Ranking, ending on the post in the feed. Timeline: T in flow/timeline.ts.

   Props (several diagram styles stacked on /home-2 for the client to choose from):
     variant  'line'  — IL line flowchart (flow/Flowchart.tsx)
              'cards' — node-editor cards on a dotted canvas (flow/FlowCards.tsx)
              'pills' — minimal tree: pills on a hairline spine, notes as branches (flow/FlowPills.tsx)
     follow   a further copy placed after another Section 2: not pulled up under the hero, does
              not drive the theme (the first copy does), and starts as it scrolls into view.
     night    false: the lights never go down after Section 3 (the page stays light).
   Original notes for the shared parts follow.

   Section 2 — Algorithm research. Figma 110:920 (part 1) and 110:898 (part 2).

   Transition from the hero: this section starts one viewport early (pulled up under
   the hero) so its stage is already pinned while the hero scrolls away above it.
   The page switches dark → white (a 400ms eased switch when about half the hero has gone);
   the chrome fades in. Everything else in this section is driven by the scroll position:
   text types in letter by letter as you scroll (and un-types as you scroll back), the
   diagram draws in, zooms, and each stage's story is scrubbed by the scroll.
   Everything after that is pinned; header and footer stay put and the parts swap in the
   band between them. Scroll budget, after the hero has left:
     1.3 viewport   part 1 types in (from just before the hero has gone), holds ~0.8 fully shown, types out
     0.6 viewport   the diagram draws itself in; its line above types in
     4.5 viewports  diagram (flowchart): Sourcing, then Ranking (T in flow/timeline.ts)
                    In each stage the highlighted post is scrubbed through it and the notes
                    (leader first, then text) write in and out as it passes
     0.6 viewport   selection fades out, its step label types out, part 3 types in
     1.4 viewport   hold, then the pin releases                                            */
const HOLD = 1.3;
const INTRO = 0.6;
const DIAGRAM = 4.5;
// After the diagram: a short rest on the final frame, then the pin releases and the page scrolls on.
const REST = 0.35;

/* Step label, centred below the diagram, indexed by chapter (0 overview, 1 sourcing,
   2 scoring, 3 selection). Copy is the client's (Notion) word for word — do not edit.
   Scoring and selection are both the Ranking module, so they share one line. Notes over
   the diagram use the wording of the client's pipeline figure (pipeline/engine.js NOTES). */
const STEPS = [
  'The algorithm passes every post on X and LinkedIn through the same pipeline, scoring it on thousands of signals.',
  '1) The Sourcing module determines how many people see your post',
  '2) The Ranking module then decides your post’s position in each feed',
  '2) The Ranking module then decides your post’s position in each feed',
];


/* Part 3 (the research lab line) is not part of this section on /home-2: it leads Section 3
   there (SectionThree lead prop). */

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));


export default function SectionTwoFlow({ variant = 'line', follow = false, night: nightOn = true }: { variant?: 'line' | 'cards' | 'pills'; follow?: boolean; night?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const flowRef = useRef<FlowHandle>(null);
  const part2Ref = useRef<HTMLDivElement>(null);
  const [chrome, setChrome] = useState(false);
  const part1Ref = useRef<ScrollTextHandle>(null);
  const stepRef = useRef<ScrollTextHandle>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const part2 = part2Ref.current;
    if (!section || !part2) return;

    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>('.hero');
    flowRef.current?.render(0, 0, false); // start hidden: nothing drawn until the intro begins

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastChrome = false;
    let lastOutro = -1;
    let isLight = false;
    let night = false;
    let lightsUp = false;
    let lightAt = 0;
    let raf = 0;
    let running = false;

    const update = (now: number) => {
      const vh = window.innerHeight;

      // Theme switch: the lights coming up, not a scrubbed blend (as on departuremono.com).
      // Once about half the hero has scrolled away html[data-theme] flips and CSS eases the
      // whole screen to light in 400ms (globals.css); scrolling back reverses it.
      // Hysteresis (55% / 65%) so it can't flicker at the threshold itself.
      if (follow) {
        // A later copy: the first copy owns the theme; this one just follows it.
        const light = root.dataset.theme === 'light';
        if (light !== isLight) { isLight = light; lightAt = now - 400; }
      } else {
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      // Later the lights go down again ('night'): once the tools intro (ToolsIntro.tsx) has
      // held in place for a moment (~0.35 viewport into its hold), through Section 4.
      // Same 400ms ease, hysteresis. Section 3 (research papers) stays light.
      const ti = document.querySelector<HTMLElement>('.ti');
      const tiTop = ti ? ti.getBoundingClientRect().top : Infinity;
      // night={false}: the page stays light after the hero (no dark tools section on it).
      night = nightOn && (night ? tiTop < -0.25 * vh : tiTop < -0.35 * vh);
      const light = !night && (isLight ? heroBottom < 0.65 * vh : heroBottom < 0.55 * vh);
      // A section marked data-lights-up (the light Services copy, /home-2) brings the light back
      // as soon as it is a quarter of the way onto the screen, so it never shows on the dark
      // page (75% / 85% hysteresis).
      // Several such sections can sit between dark ones (e.g. the light iso tools copy, then the
      // dark Services): the light holds only while one of them is on screen, and the night
      // comes back once it has scrolled away (its bottom above 25% / 15%).
      const ups = document.querySelectorAll<HTMLElement>('[data-lights-up]');
      const was = lightsUp;
      lightsUp = Array.from(ups).some((el) => {
        const b = el.getBoundingClientRect();
        return b.top < (was ? 0.85 : 0.75) * vh && b.bottom > (was ? 0.15 : 0.25) * vh;
      });
      // html[data-night-lock] (ThemeDriver: a section shown dark is on screen) wins.
      const theme = root.hasAttribute('data-night-lock') ? 'night' : lightsUp ? 'light' : night ? 'night' : light ? 'light' : 'dark';
      if (root.dataset.theme !== theme) root.dataset.theme = theme;
      if (light !== isLight) {
        isLight = light;
        lightAt = now;
        root.style.setProperty('--theme', light ? '1' : '0');
      }
      }
      // The chrome waits for the light to come up (~400ms).
      const lit = isLight && now - lightAt > 380;

      const r = section.getBoundingClientRect();
      // px scrolled since the hero fully left (negative while it is leaving).
      const s = -r.top - (follow ? 0 : vh);
      const pinned = r.top <= 1 && r.bottom >= vh - 1;
      const chromeIn = pinned && lit;
      const V = (x: number) => x * vh; // viewports → px
      const sg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

      // Part 1 types in from just before the hero has gone, holds, and types out at the end
      // of its hold; the diagram then draws itself in over the next viewport.
      // Types in by 0.2 of a screen, then stays fully readable until HOLD − 0.3, then types out.
      const p1 = isLight ? Math.min(sg(s, V(-0.45), V(0.2)), 1 - sg(s, V(HOLD - 0.3), V(HOLD))) : 0;
      part1Ref.current?.set(p1);
      const intro = clamp((s - (HOLD + 0.25) * vh) / ((INTRO - 0.25) * vh));
      const target = clamp((s - (HOLD + INTRO) * vh) / (DIAGRAM * vh));
      const outro = 0; // the diagram stays until the pin releases

      // The diagram layer is hidden until its intro starts: the engine only redraws while the
      // intro runs, so scrolling back up would otherwise leave its last frame (the globe) showing
      // under part 1 and through the hero. Outro: it fades out (scrubbed), part 3 fades in.
      const p2 = intro > 0 ? clamp(1 - outro / 0.6) : 0;
      if (p2 !== lastOutro) {
        lastOutro = p2;
        part2.style.opacity = p2.toFixed(3);
        part2.style.visibility = p2 > 0 ? 'visible' : 'hidden';
      }

      // Step label (below the diagram): overview line, then 1) Sourcing, then 2) Ranking (scoring and
      // selection). Each types in as its chapter starts and out as it ends.
      const P = target;
      const label = P < 0.06 ? 0 : P < P_RANK ? 1 : 2;
      const pl = label === 0 ? Math.min(sg(intro, 0.55, 1), 1 - sg(P, 0.03, 0.06))
        : label === 1 ? Math.min(sg(P, 0.06, 0.1), 1 - sg(P, P_RANK - 0.035, P_RANK))
        : Math.min(sg(P, P_RANK, P_RANK + 0.04), 1 - sg(outro, 0, 0.4));
      stepRef.current?.set(pl, STEPS[label]);

      // Part 3 (no typing): fades in as the diagram leaves.

      if (chromeIn !== lastChrome) { lastChrome = chromeIn; setChrome(chromeIn); }

      if (intro > 0 && outro < 1) {
        flowRef.current?.render(intro, P, reduce.matches);
      }
    };

    const loop = (now: number) => {
      update(now);
      raf = running ? requestAnimationFrame(loop) : 0;
    };
    const startLoop = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    const stopLoop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };

    // Run only while the section is on screen or within one viewport below it.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : (stopLoop(), update(performance.now()))),
      { rootMargin: '0px 0px 100% 0px' },
    );
    io.observe(section);
    const onScroll = () => { if (!running) update(performance.now()); };
    // (the rAF loop also runs while the section is near, so the post-switch reveal fires on time)
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update(performance.now());


    return () => {
      io.disconnect();
      stopLoop();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [follow, nightOn]);

  return (
    <>
    <section
      ref={sectionRef}
      className={follow ? 's2 s2-flow s2-follow' : 's2 s2-flow'}
      aria-label="Algorithm research"
      data-foot="/Algorithm Research"
      data-chrome={chrome || undefined}
      style={{ height: `${((follow ? 1 : 2) + HOLD + INTRO + DIAGRAM + REST) * 100}svh`, marginTop: follow ? 0 : undefined }}
    >
      <div className="s2-stage">
        <div className="frame s2-frame">
          {/* Layout only: the visible header and footer are the shared fixed chrome (SiteChrome.tsx). */}
          <header className="site-header s2-header s2-spacer" aria-hidden="true">
            <a className="wordmark" href="/" aria-label="Identity Labs home">
              <span>Identity</span>
              <span className="wm-space"> </span>
              <em>Labs</em>
            </a>
            <a className="s2-menu" href="#" aria-label="Menu">
              <TokenText as="span" text="[M]" show={chrome} delay={120} fade />
            </a>
            <span className="tick tick-l" aria-hidden="true" />
            <span className="tick tick-r" aria-hidden="true" />
          </header>

          {/* Parts 1–3 share the band between header and footer; they swap in place. */}
          <div className="s2-window">
            <div className="s2-part1">
              <ScrollText ref={part1Ref} text="Virality is not luck, it’s engineering." probs />
            </div>

            <div className="s2-part2" ref={part2Ref}>
              <div className="s2-steps" aria-live="polite">
                <ScrollText ref={stepRef} as="span" className="s2-step" text={STEPS[0]} probs />
              </div>
              <div className="pipe">
                {variant === 'cards' ? <FlowCards ref={flowRef} /> : variant === 'pills' ? <FlowPills ref={flowRef} /> : <Flowchart ref={flowRef} />}
              </div>
            </div>

          </div>

          <footer className="s2-foot s2-spacer" aria-hidden="true">
            <TokenText as="span" text="/Algorithm Research" show={chrome} delay={200} fade />
            <TokenText as="span" text="/Our Tech" show={chrome} delay={260} fade />
            <span className="tick tick-l" aria-hidden="true" />
            <span className="tick tick-r" aria-hidden="true" />
          </footer>
        </div>
      </div>
    </section>
    </>
  );
}
