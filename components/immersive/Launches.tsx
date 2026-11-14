'use client';

import { useEffect, useRef, useState } from 'react';
import { SHOTS, shot } from './data';
import { clamp, put, range, rnd, setDark, smooth, useScene } from './engine';
import { TILE, buildAtlas, fitCanvas, type Atlas } from './particles';

/* Scene 6 · Launches (after the Getty piece's "the picture fills the screen", then its ring of
   collectors with their works clustered around them).
   One launch opens out from a card to the full screen, with its reach over it. Then every launch
   becomes a cluster of tiles cut from its own picture, on a slowly turning ring with its name
   outside. Moving the pointer around the ring scrubs through them: the one under it stays lit,
   swells and shows in the middle; a click opens its post. */

/* The full-screen launches: every launch with a full-size picture, Airwallex first; the chevrons
   (or the arrow keys, while it is up) slide through them. */
const FEATURE = shot('airwallex-growth-story');
const SLIDES = [FEATURE, ...SHOTS.filter((s) => s.hd !== s.src && s !== FEATURE)];
const PER = 24;
const PER_MOBILE = 12;
const NL = SHOTS.length;

export default function Launches() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const bleed = useRef<HTMLDivElement>(null);
  const bleedImg = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const navOn = useRef(false);
  const shade = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const over = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<(HTMLAnchorElement | null)[]>([]);
  const side = useRef<HTMLDivElement>(null);
  const center = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const previewImg = useRef<HTMLImageElement>(null);
  const previewCap = useRef<HTMLParagraphElement>(null);
  const atlas = useRef<Atlas | null>(null);
  const hot = useRef(-1);
  const shown = useRef(-1);
  const hl = useRef(new Float32Array(NL));

  useEffect(() => {
    let live = true;
    buildAtlas(SHOTS.map((s) => s.src), NL * PER, (i) => Math.floor(i / PER), (i, k) => rnd(i * 13.7 + k * 5.3)).then((a) => {
      if (live) atlas.current = a;
    });
    return () => {
      live = false;
    };
  }, []);

  useScene(ref, (p, f) => {
    const { vw, vh, mobile } = f;

    // ── A · one launch fills the screen
    const cw = Math.min(vw * (mobile ? 0.7 : 0.3), 440);
    const ch = cw * 0.75;
    const e = smooth(range(p, 0.04, 0.16));
    const bo = 1 - smooth(range(p, 0.38, 0.44));
    const ix = ((vw - cw) / 2) * (1 - e);
    const iy = ((vh - ch) / 2) * (1 - e);
    put(bleed.current, 'clipPath', `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px round ${(4 * (1 - e)).toFixed(1)}px)`);
    put(bleed.current, 'opacity', bo.toFixed(3));
    put(bleed.current, 'visibility', bo < 0.01 ? 'hidden' : 'visible');
    put(bleedImg.current, 'transform', `translate3d(${(-f.mx * 14 * e).toFixed(1)}px, ${(-f.my * 10 * e).toFixed(1)}px, 0) scale(${(1.28 - 0.22 * e).toFixed(4)})`);
    put(shade.current, 'opacity', (e * 0.9).toFixed(3));
    const ho = 1 - smooth(range(p, 0.05, 0.11));
    put(head.current, 'opacity', ho.toFixed(3));
    put(head.current, 'transform', `translate3d(-50%, calc(-100% - ${(ch / 2 + 28).toFixed(1)}px), 0)`);
    const oo = smooth(range(p, 0.14, 0.18)) * (1 - smooth(range(p, 0.35, 0.39)));
    put(nav.current, 'opacity', oo.toFixed(3));
    put(nav.current, 'visibility', oo < 0.01 ? 'hidden' : 'visible');
    navOn.current = oo > 0.5;
    put(over.current, 'opacity', oo.toFixed(3));
    put(over.current, 'visibility', oo < 0.01 ? 'hidden' : 'visible');
    put(over.current, 'transform', `translate3d(0, ${((1 - oo) * 16).toFixed(1)}px, 0)`);
    setDark('launches', e > 0.5 && bo > 0.5 && p > 0 && p < 1);

    // ── B · the ring
    const q = smooth(range(p, 0.41, 0.56));
    const cx = mobile ? vw / 2 : vw * 0.63;
    const cy = mobile ? vh * 0.44 : vh / 2;
    const rx = mobile ? vw * 0.34 : Math.min(vw * 0.22, vh * 0.46);
    const ry = mobile ? vw * 0.42 : Math.min(vh * 0.34, rx * 0.86);
    const rot = (f.reduce ? 0 : f.t * 0.012) + (p - 0.6) * 0.8;
    const ang = (k: number) => (k / NL) * Math.PI * 2 - Math.PI / 2 + rot;

    // which launch is under the pointer: nearest by angle, within a band around the ring
    let h = -1;
    if (q > 0.9 && f.px > -1e3) {
      const dx = (f.px - cx) / rx;
      const dy = (f.py - cy) / ry;
      const dn = Math.hypot(dx, dy);
      if (dn > 0.42 && dn < 1.45) {
        const a = Math.atan2(dy, dx) - rot + Math.PI / 2;
        h = ((Math.round((a / (Math.PI * 2)) * NL) % NL) + NL) % NL;
      }
    }
    hot.current = h;
    if (stage.current) stage.current.style.cursor = h >= 0 ? 'pointer' : '';
    const kk = 1 - Math.exp(-f.dt * 9);
    for (let k = 0; k < NL; k++) hl.current[k] += ((k === h ? 1 : 0) - hl.current[k]) * kk;

    const cv = canvas.current;
    const ctx = cv && fitCanvas(cv, vw, vh);
    if (ctx) {
      ctx.clearRect(0, 0, vw, vh);
      const at = atlas.current;
      const per = mobile ? PER_MOBILE : PER;
      const R = Math.min(rx, ry);
      if (at && q > 0.001) {
        for (let k = 0; k < NL; k++) {
          const a = ang(k);
          const nx = cx + Math.cos(a) * rx * 0.8;
          const ny = cy + Math.sin(a) * ry * 0.8;
          const lit = hl.current[k];
          const dim = h >= 0 ? 0.16 + 0.84 * lit : 1;
          for (let j = 0; j < per; j++) {
            const i = k * PER + j;
            const qi = smooth(clamp(q * 1.6 - rnd(i * 3.9) * 0.6));
            const th = rnd(i * 2.1) * Math.PI * 2 + (f.reduce ? 0 : f.t * 0.2 * (rnd(i * 6.1) - 0.5));
            const rr = R * (0.1 + 0.05 * lit) * Math.sqrt(rnd(i * 4.7));
            const x = cx + (nx - cx + Math.cos(th) * rr) * qi;
            const y = cy + (ny - cy + Math.sin(th) * rr) * qi;
            const s = (5 + rnd(i * 8.3) * 7) * (1 + lit * 0.7) * (0.4 + 0.6 * qi);
            ctx.globalAlpha = qi * dim;
            ctx.drawImage(at.canvas, (i % at.cols) * TILE, Math.floor(i / at.cols) * TILE, TILE, TILE, x - s / 2, y - s / 2, s, s);
          }
        }
        ctx.globalAlpha = 1;
      }
    }

    labels.current.forEach((el, k) => {
      if (!el) return;
      const a = ang(k);
      const c = Math.cos(a);
      const x = cx + c * (rx + 14);
      const y = cy + Math.sin(a) * (ry + 12);
      const tx = c > 0.25 ? '0%' : c < -0.25 ? '-100%' : '-50%';
      const ty = Math.abs(c) <= 0.25 ? (Math.sin(a) < 0 ? '-100%' : '0%') : '-50%';
      el.style.textAlign = c > 0.25 ? 'left' : c < -0.25 ? 'right' : 'center';
      // near the top and bottom the labels sit close together: only the lit one keeps its detail line
      el.classList.toggle('is-pole', Math.abs(c) < 0.45 && hl.current[k] < 0.5);
      put(el, 'transform', `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${tx}, ${ty})`);
      const o = q * (h >= 0 ? 0.3 + 0.7 * hl.current[k] : 1);
      put(el, 'opacity', o.toFixed(3));
      put(el, 'visibility', q < 0.01 ? 'hidden' : 'visible');
    });

    // the middle: the reach, or the launch under the pointer
    if (h >= 0 && h !== shown.current && previewImg.current && previewCap.current) {
      const s = SHOTS[h];
      previewImg.current.src = s.src;
      previewCap.current.textContent = `${s.title}${s.meta ? ` — ${s.meta}` : ''}`;
    }
    if (h >= 0) shown.current = h;
    const pv = h >= 0 ? hl.current[h] : 0;
    const pw = Math.min(rx * 0.95, 360);
    put(preview.current, 'transform', `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.92 + 0.08 * pv).toFixed(4)})`);
    if (preview.current && preview.current.style.width !== `${pw}px`) preview.current.style.width = `${pw}px`;
    put(preview.current, 'opacity', pv.toFixed(3));
    const co = q * (1 - pv);
    put(center.current, 'transform', `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`);
    put(center.current, 'opacity', co.toFixed(3));
    const so = smooth(range(p, 0.5, 0.58));
    put(side.current, 'opacity', so.toFixed(3));
    put(side.current, 'visibility', so < 0.01 ? 'hidden' : 'visible');
  });

  const go = (d: number) => setSlide((i) => (i + d + SLIDES.length) % SLIDES.length);
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (!navOn.current) return;
      if (ev.key === 'ArrowRight') go(1);
      else if (ev.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onClick = () => {
    const h = hot.current;
    if (h >= 0) window.open(SHOTS[h].href, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="im-scene im-launches" ref={ref} id="im-launches" aria-label="Launches">
      <div className="im-stage" ref={stage} onClick={onClick}>
        <div className="im-launch-head" ref={head}>
          <p className="im-say">Launches we’ve done for our clients.</p>
        </div>
        <div className="im-bleed" ref={bleed} aria-hidden="true">
          <div className="im-bleed-imgs" ref={bleedImg}>
            {SLIDES.map((s, i) => (
              <img key={s.file} src={s.hd} alt="" draggable={false} decoding="async" loading="lazy" data-on={i === slide || undefined} />
            ))}
          </div>
          <div className="im-bleed-shade" ref={shade} />
        </div>
        <div className="im-bleed-text im-on-dark" ref={over} style={{ opacity: 0 }}>
          <div key={slide} className="im-bleed-copy">
            <p className="im-say im-say-xl">{SLIDES[slide].reach} views.</p>
            <p className="im-sub">{SLIDES[slide].title}{SLIDES[slide].what ? ` — ${SLIDES[slide].what}` : ''}. <a className="im-link" href={SLIDES[slide].href} target="_blank" rel="noopener noreferrer">Go to post ↗</a></p>
          </div>
        </div>
        <div className="im-bleed-nav" ref={nav} style={{ opacity: 0 }}>
          <button type="button" className="im-chev" aria-label="Previous launch" onClick={(ev) => { ev.stopPropagation(); go(-1); }}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <span className="im-bleed-count">{String(slide + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}</span>
          <button type="button" className="im-chev" aria-label="Next launch" onClick={(ev) => { ev.stopPropagation(); go(1); }}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </div>

        <canvas className="im-canvas" ref={canvas} aria-hidden="true" />
        <div className="im-ring-center" ref={center} aria-hidden="true" style={{ opacity: 0 }}>
          <span className="im-ring-big">2B+</span>
          <span className="im-ring-small">views across the launches we’ve done for our clients</span>
        </div>
        <div className="im-ring-preview" ref={preview} aria-hidden="true" style={{ opacity: 0 }}>
          <img ref={previewImg} alt="" src={SHOTS[0].src} draggable={false} />
          <p ref={previewCap} />
        </div>
        <nav className="im-labels" aria-label="Launches">
          {SHOTS.map((s, k) => (
            <a
              key={s.file}
              ref={(el) => { labels.current[k] = el; }}
              className="im-node-label im-ring-label"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(ev) => ev.stopPropagation()}
              style={{ opacity: 0 }}
            >
              <strong>{s.title}</strong>
              {s.meta && <span>{s.meta}</span>}
            </a>
          ))}
        </nav>
        <div className="im-side-text" ref={side} style={{ opacity: 0 }}>
          <p className="im-say">Each cluster is one launch, cut from its own picture.</p>
          <p className="im-sub">Move around the ring to see each one. Click to open the post.</p>
        </div>
      </div>
    </section>
  );
}
