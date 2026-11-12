'use client';

import { useRef } from 'react';
import { SERVICES, shot } from './data';
import { clamp, lerp, put, range, setCaption, smooth, useScene } from './engine';

/* Scene 5 · Services (after the Getty piece's portrait moment: one picture in the middle, two
   smaller ones floating either side, a small caption under it, the story below in small type).
   "Deployed services" opens on its own; then each service in turn, holding still for a stretch of
   scroll before the next takes over. The services flow vertically
   with the scroll: the coming one rises from below, its main picture growing in as its side
   pictures drift in from the edges; the outgoing one lifts away, its side pictures parting. Side
   pictures sit at different depths, follow the pointer and bob. Every picture links to its post. */

const MAIN = 0.78; // main picture aspect (w / h), a portrait crop
// the two side pictures mirror each other (same size, same reach, same drift) so the fan stays
// centred; only their heights differ, one a little above the main picture, one a little below
const SIDE = [
  { x: -1, y: -0.08, s: 0.37, d: 0.6 },
  { x: 1, y: 0.08, s: 0.37, d: 0.6 },
];

export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const caps = useRef<(HTMLParagraphElement | null)[]>([]);
  const texts = useRef<(HTMLDivElement | null)[]>([]);

  useScene(ref, (p, f) => {
    const { vw, vh, mobile } = f;
    // each service holds still for a while, then flows to the next: within every step the first
    // 45% of the scroll is a hold, the move happens over the rest; the last service holds to the end
    const raw = lerp(-1, SERVICES.length - 1, range(p, 0.02, 0.9));
    const k0 = Math.floor(raw);
    const sp = Math.min(SERVICES.length - 1, k0 + smooth(range(raw - k0, 0.45, 1)));
    const t = f.reduce ? 0 : f.t;

    const io = 1 - smooth(range(sp, -0.85, -0.55));
    put(intro.current, 'opacity', io.toFixed(3));
    put(intro.current, 'transform', `translate3d(-50%, calc(-50% - ${((1 - io) * 30).toFixed(1)}px), 0)`);
    put(intro.current, 'visibility', io < 0.01 ? 'hidden' : 'visible');

    const MH = mobile ? Math.min(vh * 0.3, vw * 0.6 / MAIN) : Math.min(vh * 0.34, 380);
    const MW = MH * MAIN;
    const cy = mobile ? -vh * 0.16 : -vh * 0.16;
    const reach = mobile ? vw * 0.3 : Math.min(vw * 0.22, MW * 0.5 + 220);

    SERVICES.forEach((sv, k) => {
      const rel = sp - k; // < 0 still to come (below), > 0 gone (above)
      const a = Math.abs(rel);
      const flow = -rel * vh * 0.22;

      // main picture
      const mo = clamp(1.15 - a * 2.1);
      const ms = 1 - Math.min(1, a) * 0.28;
      const main = cards.current[k * 3];
      put(main, 'transform', `translate3d(${(f.mx * 8).toFixed(1)}px, ${(cy + flow + f.my * 6 + Math.sin(t * 0.5 + k) * 4).toFixed(1)}px, 0) scale(${((MH / 400) * ms).toFixed(4)})`);
      put(main, 'opacity', mo.toFixed(3));
      put(main, 'visibility', mo < 0.01 ? 'hidden' : 'visible');

      // side pictures: part outward as they leave, drift in from the edges as they come
      SIDE.forEach((sd, j) => {
        const el = cards.current[k * 3 + 1 + j];
        const out = Math.min(1, a) * vw * 0.18;
        const x = sd.x * (reach + out) + f.mx * 18 * sd.d;
        const y = cy + sd.y * vh + flow * (0.6 + sd.d) + f.my * 18 * sd.d + Math.sin(t * 0.55 + j * 2 + k) * 8;
        const o = clamp(1 - (a - 0.1) * 2.6);
        put(el, 'transform', `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${((MH / 400) * sd.s * (mobile ? 0.8 : 1)).toFixed(4)})`);
        put(el, 'opacity', o.toFixed(3));
        put(el, 'visibility', o < 0.01 ? 'hidden' : 'visible');
      });

      // caption and the service, under the main picture
      const to = clamp(1 - (a - 0.12) * 3.4);
      const top = cy + MH / 2 + flow;
      put(caps.current[k], 'transform', `translate3d(-50%, ${(top + 12).toFixed(1)}px, 0)`);
      put(caps.current[k], 'opacity', to.toFixed(3));
      const tx = texts.current[k];
      put(tx, 'transform', `translate3d(-50%, ${(top + (mobile ? 40 : 52) - rel * 20).toFixed(1)}px, 0)`);
      put(tx, 'opacity', to.toFixed(3));
      put(tx, 'visibility', to < 0.01 ? 'hidden' : 'visible');
    });
  });

  return (
    <section className="im-scene im-services" ref={ref} id="im-services" aria-label="Services">
      <div className="im-stage">
        <div className="im-statement" ref={intro}>
          <p className="im-say">We forward deploy our Creative + Growth team within our clients’ orgs to run the biggest product launches and scale company brand.</p>
        </div>

        <div className="im-svc">
          {SERVICES.flatMap((sv, k) =>
            sv.shots.map((file, j) => {
              const s = shot(file);
              const w = j === 0 ? 400 * MAIN : 400 * s.ratio;
              return (
                <a
                  key={`${k}-${file}`}
                  ref={(el) => { cards.current[k * 3 + j] = el; }}
                  className={`im-svc-card${j === 0 ? ' is-main' : ''}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.title}${s.meta ? `, ${s.meta}` : ''} (opens the post)`}
                  tabIndex={j === 0 ? undefined : -1}
                  style={{ width: w, height: 400, marginLeft: -w / 2, marginTop: -200, opacity: 0 }}
                  onPointerEnter={() => setCaption({ title: s.title, meta: s.meta, hint: 'Open the post ↗' })}
                  onPointerLeave={() => setCaption(null)}
                  draggable={false}
                >
                  <img src={j === 0 ? s.hd : s.src} alt="" draggable={false} loading="lazy" decoding="async" />
                </a>
              );
            }),
          )}
        </div>

        {SERVICES.map((sv, k) => {
          const s = shot(sv.shots[0]);
          return (
            <p key={sv.title} className="im-svc-cap" ref={(el) => { caps.current[k] = el; }} style={{ opacity: 0 }}>
              <span>{s.title}</span>{s.meta && <> — {s.meta}</>}
            </p>
          );
        })}

        {SERVICES.map((sv, k) => (
          <div key={sv.title} className="im-svc-text" ref={(el) => { texts.current[k] = el; }} style={{ opacity: 0 }}>
            <h2 className="im-svc-title">{sv.title}</h2>
            <p className="im-svc-body">{sv.text}</p>
            <p className="im-svc-list">{sv.included.join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
