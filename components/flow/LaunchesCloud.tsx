'use client';

import { useEffect, useRef } from 'react';

/* The launches as a drifting cloud (/home-2, in the Launches section's 16:9 area), after a
   reference recording: just the launch pictures — straight, in different sizes, many of them —
   fly quickly toward the viewer around a large central word in a soft fog; they start bunched far
   behind the word and fan out, leaving past the panel's edges. No fading: they appear tiny
   behind the fog and stay solid until they are gone. Each
   picture links to its X post. It never stops on hover; it pauses off screen, and is still with
   reduced motion. */

export type Launch = { client: string; what?: string; x?: string; reach?: string; li?: string };
/* The client's list (post links without tracking parameters). Profound: link to come. */
export const LAUNCHES: Launch[] = [
  { client: 'Matic Robots', what: 'Launch', reach: '25M+', x: 'https://x.com/maticrobots/status/2087962897267990915', li: 'https://www.linkedin.com/posts/mehulnariyawala_introducing-matic-cues-a-new-way-to-control-activity-7493734976891465728-FqbX' },
  { client: 'Matic Robots', what: 'Design documentary', reach: '10M+', x: 'https://x.com/mehul/status/2089784603737575470' },
  { client: 'Pocket FM', what: 'Product launch', reach: '12M+', x: 'https://x.com/RohanNayak2/status/2101019876269973593', li: 'https://www.linkedin.com/posts/rohan-nayak_introducing-sherpa-the-most-advanced-fiction-activity-7506789825765752832-rHMW' },
  { client: 'Fish Audio', what: 'Seed raise', reach: '25M+', x: 'https://x.com/FishAudio/status/2082152596739862853', li: 'https://www.linkedin.com/posts/rissacao_fish-audio-turns-one-today-were-celebrating-activity-7487918594153000960-225k' },
  { client: 'Lovable', what: 'Agent launch', x: 'https://x.com/antonosika/status/1948017850809270314' },
  { client: 'Lovable', what: 'Fundraise', reach: '20M+', x: 'https://x.com/antonosika/status/1945899512503112035', li: 'https://www.linkedin.com/posts/antonosika_lovable-just-crossed-100m-arr-in-8-months-activity-7353786061354889216-CPds' },
  { client: 'Airwallex', what: 'Growth story', reach: '45M+', x: 'https://x.com/awxjack/status/1998015620072587516', li: 'https://www.linkedin.com/posts/jack-zhang-05200222_stripe-offered-to-acquire-us-for-12-billion-activity-7403782045119967232-9-Ne' },
  { client: 'Gamma', what: '$100M ARR announcement', reach: '20M+', x: 'https://x.com/thisisgrantlee/status/1987880600661889356', li: 'https://www.linkedin.com/posts/grantslee_today-as-shared-by-the-new-york-times-we-activity-7393646492839763968-Bws-' },
  { client: 'Wispr Flow', what: 'Feature release', reach: '10M+', x: 'https://x.com/tankots/status/2025981424470479008', li: 'https://www.linkedin.com/posts/tankots_we-offered-5-people-a-porsche-911-gt3-rs-activity-7431748842519318528-RY-e' },
  { client: 'Cartesia', what: 'Fundraise + model launch', reach: '20M+', x: 'https://x.com/krandiash/status/1983202316397453676', li: 'https://www.linkedin.com/posts/krandiash_weve-raised-100m-from-kleiner-perkins-activity-7388968595499728896-0UJn' },
  { client: 'Deel', what: 'Growth story', reach: '10M+', x: 'https://x.com/bouazizalex/status/1978809723727012176', li: 'https://www.linkedin.com/posts/alexbouaziz_deel-has-raised-300m-at-a-173b-valuation-activity-7384573205698568193-FtqD' },
  { client: 'Icon', what: 'Launch', reach: '10M+', x: 'https://x.com/kennandavison/status/1915450754434797914', li: 'https://www.linkedin.com/posts/kennandavison_introducing-icon-the-worlds-first-ai-admaker-activity-7292601719627079680-39q7' },
  { client: 'PolyAI', what: 'Product demo', reach: '10M+', x: 'https://x.com/polyaivoice/status/2023789465509015972' },
  { client: 'Superblocks', x: 'https://x.com/bradmenezes/status/1927414638632735069', li: 'https://www.linkedin.com/posts/bradmenezes_im-excited-to-introduce-clark-the-first-activity-7333180866963128320-ScnY/' },
  { client: 'Freehand', x: 'https://x.com/freehand_ai/status/2082510919960281594', li: 'https://www.linkedin.com/posts/nitinjayakrishnan_weve-raised-75m-to-give-you-a-guarantee-activity-7488281116756336640-gluA' },
  { client: 'Akai', reach: '2.0M+', x: 'https://x.com/Bouazizalex/status/2102127902510944722', li: 'https://www.linkedin.com/posts/alexbouaziz_introducing-akai-deel-added-140m-arr-in-ugcPost-7507885192196427776-_R9L/' },
  { client: 'PlayerZero', reach: '2.7M+', x: 'https://x.com/akoratana/status/2036111467016319074' },
  { client: 'Anything', x: 'https://x.com/anything/status/1996279683932172751', li: 'https://www.linkedin.com/posts/dhruvamin_introducing-anything-max-vibe-coding-thats-activity-7402049356226621440-h9m3' },
  { client: 'Lindy', x: 'https://x.com/Altimor/status/1960755364208763321', li: 'https://www.linkedin.com/posts/florentcrivello_announcing-lindy-build-the-new-state-of-activity-7366524899475058691-fXIy' },
  { client: 'Enterpret', x: 'https://x.com/varunconfirms/status/1982794433964753379', li: 'https://www.linkedin.com/posts/vsharma11_13-years-ago-my-first-job-was-at-linkedin-activity-7388560201647325184-N7OZ' },
  { client: 'Triple Whale', x: 'https://x.com/AY_Orbach/status/1948049118586437969', li: 'https://www.linkedin.com/posts/avrahamorbach_introducing-moby-a-hyper-intelligent-dtc-activity-7353818672387235842-_So1' },
];

/* Each launch's picture: the post's video poster frame or photo, fetched once from the X posts
   (via fxtwitter) and saved small in public/assets/launches/<slug>.webp. Icon's post has none. */
export const slug = (l: Launch) => `${l.client} ${l.what ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const NO_IMAGE = new Set(['icon-launch']);
/* Image proportions (w / h) where they are not 16:9. */
const RATIO: Record<string, number> = { 'lovable-fundraise': 4 / 3, 'airwallex-growth-story': 4 / 3, 'deel-growth-story': 3 / 4 };
const PASSES = 4; // each launch appears this many times, at different depths: a dense field

const NEAR = 430; // z where a card loops back: by then it has left past the panel's edges
const FAR = -1700; // z where cards appear
const SPEED = 300; // z units per second
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Only launches with a picture; PASSES copies at staggered depths. Each tile holds one direction
// (golden-angle spacing, so they spread evenly), stays straight and has its own size; its distance
// from the middle grows as it comes forward — far away they bunch up behind the word, near they fan out.
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
export const PICTURED = LAUNCHES.filter((l) => !NO_IMAGE.has(slug(l)));
export const RATIO_OF = (l: Launch) => RATIO[slug(l)] ?? 16 / 9;
const CARDS = Array.from({ length: PASSES }, () => PICTURED).flat().map((l, i, all) => ({
  ...l, key: i, file: slug(l),
  dx: Math.cos(i * GOLDEN), dy: Math.sin(i * GOLDEN),
  spread: 0.8 + rnd(i + 40) * 0.35, // how far out it fans, as a fraction of the half-size
  size: 160 + Math.round(rnd(i + 7) * 140), // tile width, px
  ratio: RATIO[slug(l)] ?? 16 / 9,
  z0: FAR + ((NEAR - FAR) * i) / all.length,
}));

export default function LaunchesCloud() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = false;
    let t = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) t += dt;
      const w = stage.clientWidth / 2, h = stage.clientHeight / 2;
      CARDS.forEach((c, i) => {
        const el = cardRefs.current[i];
        if (!el) return;
        const span = NEAR - FAR;
        const z = FAR + ((((c.z0 - FAR) + t * SPEED) % span) + span) % span;
        const k = (z - FAR) / span; // 0 far → 1 near
        const r = (0.05 + 1.35 * Math.pow(k, 1.5)) * c.spread; // bunched far away, fanned out past the edges near
        el.style.transform = `translate3d(${(c.dx * r * w).toFixed(1)}px, ${(c.dy * r * h * 0.86).toFixed(1)}px, ${z.toFixed(1)}px)`;
        el.style.zIndex = String(Math.round(k * 1000));
      });
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    io.observe(stage);
    raf = requestAnimationFrame(frame);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="lcc" ref={stageRef}>
      <div className="lcc-space">
        {CARDS.map((c, i) => (
          <a key={c.key} ref={(el) => { cardRefs.current[i] = el; }} className="lcc-card" href={c.x} target="_blank" rel="noopener noreferrer"
            style={{ width: c.size, aspectRatio: String(c.ratio) }}
            tabIndex={i < PICTURED.length ? 0 : -1} aria-hidden={i >= PICTURED.length || undefined}
            aria-label={`${c.client}${c.what ? ` — ${c.what}` : ''}${c.reach ? `, ${c.reach} views on X` : ''} (opens in a new tab)`}>
            <img className="lcc-img" src={`/assets/launches/${c.file}.webp`} alt="" decoding="async" loading="lazy" draggable={false} />
          </a>
        ))}
      </div>
      <div className="lcc-glow" aria-hidden="true" />
      <p className="lcc-word" aria-hidden="true">Launches</p>
    </div>
  );
}
