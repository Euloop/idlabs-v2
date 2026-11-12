'use client';

import { useEffect, useRef } from 'react';
import ClientLogos from '../ClientLogos';
import { SHOTS, type Shot } from './data';
import { clamp, ease, follow, lerp, put, range, rnd, setCaption, smooth, useScene, wrap } from './engine';
import { loadImage } from './particles';

/* Scene 1 · Opening (after getty.edu/tracingart's intro, frame by frame).
   Load: the wordmark waits alone in the middle while the pictures load, then glides up into the
   header; the ribbon grows out from the centre — first a flat thin line, then the wave — pushing
   "Organic" and "Reach" apart. The ribbon is a deck of cards seen at an angle (3D-tilted, stacked
   tight), undulating in place.
   Scroll: the deck collapses into a loose pile in the middle, then bursts outward, the pictures
   flying toward you and settling into a deep, drifting field; the hero copy plays one statement at
   a time in the clear middle. Each card follows its place on a spring (far cards drift behind near
   ones), so the field floats rather than scrolls. In the field every picture links to its post. */

const N = 72; // cards on desktop
const N_MOBILE = 40;
const KEEP = 26; // cards that stay on in the field (the rest dissolve in the burst)
const KEEP_MOBILE = 14;
const BASE = 200; // card box height (px) before scaling
const GHOSTS = 18;
const DECK = 0.8; // card shape in the ribbon (w / h)

type Card = { shot: Shot; aspect: number; fx: number; fy: number; d: number; seed: number; gx: number; gy: number; gh: number; gr: number };
const ASPECTS = [16 / 9, 0.8, 1, 16 / 9, 1.3, 0.75];
const CARDS: Card[] = Array.from({ length: N }, (_, i) => {
  const s = SHOTS[(i * 7) % SHOTS.length]; // 7 is coprime with 20: every picture before any repeats
  let fx = 0;
  let fy = 0;
  for (let k = 0; k < 24; k++) {
    fx = rnd(i * 3.1 + k * 17.3) - 0.5;
    fy = rnd(i * 5.7 + k * 11.9 + 2) - 0.5;
    if (Math.abs(fx) > 0.2) break;
  }
  const th = rnd(i * 8.1 + 5) * Math.PI * 2;
  const r = Math.sqrt(rnd(i * 6.3 + 6));
  return {
    shot: s, aspect: ASPECTS[i % ASPECTS.length], fx: fx * 1.06, fy, d: 0.3 + 0.7 * rnd(i * 9.3 + 4), seed: rnd(i * 2.3 + 8),
    gx: Math.cos(th) * r, gy: Math.sin(th) * r * 0.8, gh: 0.6 + 0.4 * rnd(i * 4.4 + 7), gr: (rnd(i * 3.9 + 9) - 0.5) * 18,
  };
});
const GHOST = Array.from({ length: GHOSTS }, (_, i) => ({
  fx: (rnd(i * 4.4 + 40) - 0.5) * 1.1,
  fy: rnd(i * 6.1 + 41) - 0.5,
  d: 0.2 + 0.5 * rnd(i * 2.9 + 42),
  w: 70 + rnd(i * 3.7 + 43) * 150,
  h: 60 + rnd(i * 5.3 + 44) * 130,
}));

const STATEMENTS: { kicker?: string; body: React.ReactNode; sub?: React.ReactNode }[] = [
  { body: <>Identity Labs is a consulting firm based in San&nbsp;Francisco.</> },
  { body: <>The largest tech companies on earth rely on our algorithm research, analytics software, and deployed services to reach <em>a billion people</em>.</> },
  { body: <>In the last 2 years, <em>$1T</em> was spent on paid marketing on Meta and Google.</>, sub: 'Paid reach is getting more expensive with diminishing returns.' },
  { body: <>Companies now need organic distribution faster than we can hire and build systems to provide it.</> },
  {
    body: <>Identity Labs has grown <em>7x</em> in revenue to <em>$20M ARR</em> because of this demand.</>,
    sub: (
      <span className="im-logos"><ClientLogos /></span>
    ),
  },
];
const SEG_START = 0.21;
const SEG = (1 - SEG_START) / STATEMENTS.length;
const MIN_WAIT = 1.1; // s the wordmark holds alone, however fast the pictures load
const GREY = [201, 197, 189];
const INK = [22, 21, 19];

export default function Opening() {
  const ref = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const ghosts = useRef<(HTMLSpanElement | null)[]>([]);
  const states = useRef<(HTMLDivElement | null)[]>([]);
  const mark = useRef<HTMLDivElement>(null);
  const wordL = useRef<HTMLSpanElement>(null);
  const wordR = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const hover = useRef<number>(-1);
  const hv = useRef(new Float32Array(N));
  const pos = useRef({ x: new Float32Array(N), y: new Float32Array(N), gy: new Float32Array(GHOSTS), init: false });
  const t0 = useRef(-1);
  const readyAt = useRef(-1);
  const markTo = useRef({ dx: 0, dy: 0 });
  const landed = useRef(false);

  useEffect(() => {
    const now = performance.now() / 1000;
    t0.current = now;
    const root = document.documentElement;
    if (window.scrollY > 40) {
      // arriving mid-page (reload, anchor): no intro
      readyAt.current = now - 10;
      landed.current = true;
      root.setAttribute('data-im-ready', '');
    } else {
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        readyAt.current = Math.max(performance.now() / 1000, t0.current + MIN_WAIT);
        const w = document.querySelector('.im-wordmark')?.getBoundingClientRect();
        if (w) markTo.current = { dx: w.left + w.width / 2 - window.innerWidth / 2, dy: w.top + 4 + w.height / 2 - window.innerHeight / 2 };
      };
      Promise.all([...SHOTS.map((s) => loadImage(s.src).catch(() => null)), document.fonts?.ready]).then(go);
      const id = window.setTimeout(go, 4000);
      return () => {
        window.clearTimeout(id);
        root.removeAttribute('data-im-ready');
      };
    }
    return () => root.removeAttribute('data-im-ready');
  }, []);

  useScene(ref, (p, f) => {
    if (t0.current < 0) return;
    const { vw, vh, mobile, dt } = f;
    const tl = f.t - t0.current;
    const r = readyAt.current < 0 ? -1 : f.t - readyAt.current; // time since the pictures are in
    const n = mobile ? N_MOBILE : N;
    const keep = mobile ? KEEP_MOBILE : KEEP;
    const RW = Math.min(vw * (mobile ? 0.6 : 0.38), 640);
    const textHalf = mobile ? 0 : Math.min(400, vw * 0.29);
    const P = pos.current;

    // ── load sequence
    const g = f.reduce ? 1 : r < 0 ? 0 : 1 - Math.pow(1 - range(r, 0.3, 2.0), 3); // ribbon growth
    const mv = ease(range(r, 0, 0.95)); // wordmark: middle → header
    const markIn = smooth(range(tl, 0.15, 0.6));
    if (r > 0.95 && !landed.current) {
      landed.current = true;
      document.documentElement.setAttribute('data-im-ready', '');
    }
    put(mark.current, 'opacity', (landed.current ? 0 : markIn).toFixed(3));
    put(mark.current, 'transform', `translate3d(calc(-50% + ${(markTo.current.dx * mv).toFixed(1)}px), calc(-50% + ${(markTo.current.dy * mv).toFixed(1)}px), 0)`);

    // ── scroll: collapse into a pile, then burst into the field
    const m = range(p, 0.012, 0.2);
    const drift = range(p, 0.05, 1) * vh * 2.6;
    const H = Math.max(vh * 1.7, vh + 640);
    const R0 = Math.min(vw, vh) * (mobile ? 0.26 : 0.17);
    field.current?.classList.toggle('is-live', m > 0.85);
    if (!P.init) P.init = true;

    const wave = f.reduce ? 0 : Math.sin(tl * 0.45) * 0.28;
    const A = RW * 0.17 * Math.pow(g, 1.4) * (1 + f.my * 0.3);
    const L = RW * g;
    const T = (mobile ? 7 : 11) * g;
    const kh = 1 - Math.exp(-dt * 10);

    for (let i = 0; i < N; i++) {
      const el = cards.current[i];
      if (!el) continue;
      if (i >= n) {
        put(el, 'visibility', 'hidden');
        continue;
      }
      const c = CARDS[i];
      const u = i / (n - 1);

      // the ribbon: a deck of tilted cards along one sine period
      const a = u * Math.PI * 2 + 0.5 + wave + f.mx * 0.5;
      const twist = Math.sin(u * Math.PI * 3 + tl * 0.3);
      const slope = (-Math.cos(a) * A * Math.PI * 2) / Math.max(1, L);
      const nl = Math.hypot(slope, 1);
      const off = (c.seed - 0.5) * 2 * T * twist;
      const rx = (u - 0.5) * L + (-slope / nl) * off;
      const ry = -Math.sin(a) * A + off / nl;
      const rz = 0.5 + 0.5 * Math.cos(u * Math.PI * 3 + tl * 0.3 + c.seed * 2);
      const rh = ((mobile ? 40 : 62) + (mobile ? 8 : 12) * rz) * (0.55 + 0.45 * g);
      const grow = f.reduce ? 1 : smooth(clamp((g - Math.abs(u - 0.5) * 0.92) * 5)); // centre first

      // the pile
      const px = c.gx * R0;
      const py = c.gy * R0 + vh * 0.03;
      const ph = (mobile ? 50 : 72) * c.gh;

      // the field
      const d = c.d;
      const fh = (mobile ? 40 : 54) + (mobile ? 56 : 118) * d;
      const half = (fh * c.aspect) / 2;
      let fx = c.fx * vw;
      const minX = textHalf + half + 24;
      if (Math.abs(fx) < minX) fx = Math.sign(fx || 1) * (minX + Math.abs(fx) * 0.35);
      fx += f.mx * 34 * d;
      const fy = wrap(c.fy * H - drift * (0.4 + 0.6 * d), H) + f.my * 22 * d + (f.reduce ? 0 : Math.sin(tl * 0.45 + i) * 6 * d);

      const mi = clamp(m * 1.45 - c.seed * 0.45);
      const cl = smooth(range(mi, 0, 0.42)); // collapse
      const bu = smooth(range(mi, 0.38, 1)); // burst
      const kept = i < keep;
      const tx = lerp(lerp(rx, px, cl), fx, bu);
      const ty = lerp(lerp(ry, py, cl), fy, bu);
      const h = lerp(lerp(rh, ph, cl), fh, bu);
      // the deck: every card the same gentle turn, seen through its own lens (no shear between cards)
      const rotY = lerp(-34, 0, cl);
      const rotZ = lerp(c.gr * cl, 0, bu);
      // in the ribbon every card is cut to one portrait shape; the whole picture opens in the field
      const crop = c.aspect > DECK ? ((1 - DECK / c.aspect) / 2) * 100 * (1 - cl) : 0;

      // springs: each card floats after its place, far ones slower; wrap jumps snap
      if (r < 0 || m === 0) {
        P.x[i] = tx;
        P.y[i] = ty;
      } else {
        const rate = bu < 1 ? 7 : 2 + 3.5 * d;
        if (bu >= 1 && Math.abs(ty - P.y[i]) > vh * 0.7) P.y[i] = ty;
        P.x[i] = follow(P.x[i], tx, rate, dt);
        P.y[i] = follow(P.y[i], ty, rate, dt);
      }
      hv.current[i] += ((hover.current === i ? 1 : 0) - hv.current[i]) * kh;
      const fly = 1 + Math.sin(bu * Math.PI) * 0.35; // toward the viewer mid-burst
      const gone = kept ? 0 : bu;
      const s = (h / BASE) * (0.3 + 0.7 * grow) * fly * (1 + hv.current[i] * 0.1) * (1 - gone * 0.7);
      put(el, 'transform', `translate3d(${P.x[i].toFixed(1)}px, ${P.y[i].toFixed(1)}px, 0) perspective(900px) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${s.toFixed(4)})`);
      put(el, 'clipPath', crop > 0.05 ? `inset(0 ${crop.toFixed(2)}%)` : 'none');
      const back = mobile && (Math.abs(fx) < vw * 0.36 || Math.abs(fy) < vh * 0.24) ? 0.3 : 1;
      const o = grow * lerp(1, (0.6 + 0.4 * d) * back, bu) * (1 - gone);
      put(el, 'opacity', o.toFixed(3));
      put(el, 'visibility', o < 0.01 ? 'hidden' : 'visible');
      // the deck stacks in order along the path, each card over the one before
      put(el, 'zIndex', String(hover.current === i ? 300 : cl < 0.5 ? i : Math.round(d * 100)));
    }

    for (let i = 0; i < GHOSTS; i++) {
      const gq = GHOST[i];
      const x = gq.fx * vw + f.mx * 20 * gq.d;
      const y = wrap(gq.fy * H - drift * (0.4 + 0.6 * gq.d), H) + f.my * 12 * gq.d;
      if (Math.abs(y - P.gy[i]) > vh * 0.7 || m === 0) P.gy[i] = y;
      else P.gy[i] = follow(P.gy[i], y, 1.8 + 2 * gq.d, dt);
      put(ghosts.current[i], 'transform', `translate3d(${x.toFixed(1)}px, ${P.gy[i].toFixed(1)}px, 0)`);
      put(ghosts.current[i], 'opacity', (smooth(range(m, 0.45, 1)) * 0.9).toFixed(3));
    }

    // the two words: pushed apart as the ribbon grows, greyed by the collapse, gone in the burst
    const wIn = f.reduce ? 1 : smooth(range(r, 0.35, 1.2));
    const ink = smooth(range(r, 0.6, 1.8)) * (1 - smooth(range(m, 0.05, 0.3)));
    const col = `rgb(${GREY.map((v, k) => Math.round(lerp(v, INK[k], ink))).join(' ')})`;
    const wo = (wIn * (1 - smooth(range(m, 0.3, 0.6)))).toFixed(3);
    const spread = smooth(range(m, 0.2, 0.6)) * vw * 0.08;
    if (mobile) {
      const v = A + 30 + spread;
      put(wordL.current, 'transform', `translate3d(-50%, calc(-100% - ${v.toFixed(1)}px), 0)`);
      put(wordR.current, 'transform', `translate3d(-50%, ${v.toFixed(1)}px, 0)`);
    } else {
      const gap = L / 2 + 40 + spread;
      put(wordL.current, 'transform', `translate3d(calc(-100% - ${gap.toFixed(1)}px), -50%, 0)`);
      put(wordR.current, 'transform', `translate3d(${gap.toFixed(1)}px, -50%, 0)`);
    }
    for (const w of [wordL.current, wordR.current]) {
      put(w, 'opacity', wo);
      put(w, 'color', col);
    }
    put(cue.current, 'opacity', ((f.reduce ? 1 : smooth(range(r, 2.2, 2.8))) * (1 - range(p, 0.004, 0.025))).toFixed(3));

    // statements, one at a time
    for (let i = 0; i < STATEMENTS.length; i++) {
      const a0 = SEG_START + i * SEG;
      const b0 = a0 + SEG;
      const last = i === STATEMENTS.length - 1;
      const o = smooth(range(p, a0 - 0.02, a0 + 0.045)) * (last ? 1 : 1 - smooth(range(p, b0 - 0.05, b0 - 0.005)));
      const el = states.current[i];
      put(el, 'opacity', o.toFixed(3));
      put(el, 'transform', `translate3d(-50%, calc(-50% + ${((1 - o) * 22).toFixed(1)}px), 0)`);
      put(el, 'filter', o > 0.99 || o < 0.01 ? 'none' : `blur(${((1 - o) * 10).toFixed(1)}px)`);
      put(el, 'visibility', o < 0.01 ? 'hidden' : 'visible');
    }
  });

  const enter = (i: number) => {
    hover.current = i;
    const s = CARDS[i].shot;
    setCaption({ title: s.title, meta: s.meta, hint: 'Open the post ↗' });
  };
  const leave = () => {
    hover.current = -1;
    setCaption(null);
  };

  return (
    <section className="im-scene im-open" ref={ref} id="im-top" aria-label="Identity Labs">
      <div className="im-stage">
        <div className="im-ghosts" aria-hidden="true">
          {GHOST.map((g, i) => (
            <span key={i} ref={(el) => { ghosts.current[i] = el; }} className="im-ghost" style={{ width: g.w, height: g.h, marginLeft: -g.w / 2, marginTop: -g.h / 2 }} />
          ))}
        </div>

        <div className="im-field" ref={field}>
          {CARDS.map((c, i) => {
            const w = BASE * c.aspect;
            const dup = i >= SHOTS.length;
            return (
              <a
                key={i}
                ref={(el) => { cards.current[i] = el; }}
                className="im-card"
                href={c.shot.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={dup ? undefined : `${c.shot.title}${c.shot.meta ? `, ${c.shot.meta}` : ''} (opens the post)`}
                aria-hidden={dup || undefined}
                tabIndex={dup ? -1 : undefined}
                style={{ width: w, height: BASE, marginLeft: -w / 2, marginTop: -BASE / 2, opacity: 0, visibility: 'hidden' }}
                onPointerEnter={() => enter(i)}
                onPointerLeave={leave}
                onFocus={() => enter(i)}
                onBlur={leave}
                draggable={false}
              >
                <img src={c.shot.src} alt="" draggable={false} decoding="async" />
              </a>
            );
          })}
        </div>

        <div className="im-open-mark im-logo" ref={mark} aria-hidden="true" />
        <div className="im-words" aria-hidden="true">
          <span className="im-word" ref={wordL}>Organic</span>
          <span className="im-word" ref={wordR}>Reach</span>
        </div>
        <div className="im-cue" ref={cue} aria-hidden="true"><span>↓</span> Scroll down</div>

        {STATEMENTS.map((s, i) => (
          <div key={i} className={`im-statement${i === 0 ? ' im-statement-first' : ''}`} ref={(el) => { states.current[i] = el; }} style={{ opacity: 0 }}>
            {i === 0 ? <h1 className="im-say">{s.body}</h1> : <p className="im-say">{s.body}</p>}
            {s.sub && <div className="im-sub">{s.sub}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
