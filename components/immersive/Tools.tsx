'use client';

import { useRef, type CSSProperties } from 'react';
import { TOOLS, TOOLS_LEAD } from './data';
import { clamp, hex, lerp, mix, put, range, rnd, setCaption, smooth, useScene, wrap } from './engine';

/* Scene 4 · Software (after the Getty piece's artist names: "Berthe Morisot" over a picture,
   "Claude Monet" rising from below). The tools' lead line plays over drifting collage pieces; then
   the four tools' names roll up the screen in very large type, each crossing its own screenshot,
   while the room takes the tool's tint. The screenshot tilts to the pointer and links to the tool. */

const PAPER = hex('#f6f4ef');
const TINTS = TOOLS.map((t) => hex(t.tint));
const GAP = 0.66; // name pitch, in viewport heights
const REST = -0.335; // where a name settles, above its picture (viewport heights from the middle)
const SMALL = 0.42; // the next name's size while it waits below, against the current one's
const COLLAGE = Array.from({ length: 9 }, (_, i) => ({
  src: `/assets/tools-collage/c${i + 1}.webp`,
  x: [-0.36, 0.34, -0.3, 0.4, -0.42, 0.3, 0.1, -0.12, 0.44][i],
  y: [-0.3, -0.36, 0.28, 0.22, 0.02, 0.5, -0.55, 0.6, -0.05][i],
  h: 110 + rnd(i * 3.3 + 70) * 120,
  d: 0.35 + 0.65 * rnd(i * 4.1 + 71),
  rot: (rnd(i * 5.9 + 72) - 0.5) * 10,
}));

export default function Tools() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lead = useRef<HTMLDivElement>(null);
  const bits = useRef<(HTMLImageElement | null)[]>([]);
  const names = useRef<(HTMLParagraphElement | null)[]>([]);
  const shots = useRef<(HTMLAnchorElement | null)[]>([]);
  const notes = useRef<(HTMLDivElement | null)[]>([]);

  useScene(ref, (p, f) => {
    const { vw, vh, mobile } = f;
    // the first name rises in as the lead line fades, so the hand-over is never empty
    // each tool holds still for a while (first 40% of its step), then the next rises in; the
    // last one holds to the end. Before the first tool the move is plain (the lead hands over).
    const raw = lerp(-1.4, TOOLS.length - 1, range(p, 0.1, 0.93));
    const k0 = Math.floor(raw);
    const sp = raw < 0 ? raw : Math.min(TOOLS.length - 1, k0 + smooth(range(raw - k0, 0.4, 1)));

    // the room's tint
    let bg: string;
    if (sp < 0) bg = mix(PAPER, TINTS[0], smooth(range(sp, -0.8, -0.1)));
    else {
      const k = Math.min(TOOLS.length - 2, Math.floor(sp));
      bg = mix(TINTS[k], TINTS[k + 1], smooth(range(sp - k, 0.3, 0.7)));
    }
    put(stage.current, 'backgroundColor', bg);

    // the lead line and its collage
    const lo = 1 - smooth(range(p, 0.07, 0.14));
    put(lead.current, 'opacity', lo.toFixed(3));
    put(lead.current, 'transform', `translate3d(-50%, calc(-50% - ${((1 - lo) * 16).toFixed(1)}px), 0)`);
    put(lead.current, 'visibility', lo < 0.01 ? 'hidden' : 'visible');
    const H = vh * 1.8;
    COLLAGE.forEach((c, i) => {
      const el = bits.current[i];
      const x = c.x * vw * (mobile ? 1.1 : 1) + f.mx * 26 * c.d;
      const y = wrap(c.y * vh * 1.4 - range(p, 0, 0.2) * vh * 1.4 * (0.5 + c.d), H) + f.my * 16 * c.d;
      const o = 1 - smooth(range(p, 0.1, 0.17));
      put(el, 'transform', `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${c.rot.toFixed(1)}deg)`);
      put(el, 'opacity', (o * (mobile ? 0.45 : 0.95)).toFixed(3));
    });

    // the names roll up (after Getty's "Berthe Morisot" / "Claude Monet"): the tool on screen has
    // its name large above its screenshot; the next one waits small below and grows as it rises
    // into place, while the current one shrinks and fades away over the top.
    TOOLS.forEach((_, k) => {
      const y = (k - sp) * GAP * vh + REST * vh;
      const yn = y / vh;
      const below = smooth(range(yn, REST + 0.08, REST + GAP)); // 0 in place above the picture, 1 waiting below
      const sc = lerp(1, SMALL, below) * (1 - smooth(range(yn, REST, REST - 0.35)) * 0.45);
      const nameO = 1 - smooth(range(yn, REST - 0.12, REST - 0.42));
      const x = f.mx * 14 * (k % 2 ? 1 : -1);
      const nm = names.current[k];
      put(nm, 'transform', `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), 0) scale(${sc.toFixed(4)})`);
      put(nm, 'opacity', nameO.toFixed(3));
      put(nm, 'visibility', Math.abs(y) > vh * 0.95 || nameO < 0.01 ? 'hidden' : 'visible');

      const o = clamp(1 - (Math.abs(sp - k) - 0.22) * 2.6);
      const el = shots.current[k];
      put(el, 'opacity', o.toFixed(3));
      put(el, 'visibility', o < 0.01 ? 'hidden' : 'visible');
      put(el, 'transform', `translate3d(-50%, calc(-50% + ${((k - sp) * 60 + (f.reduce ? 0 : Math.sin(f.t * 0.6 + k) * 6)).toFixed(1)}px), 0) perspective(1200px) rotateX(${(-f.my * 5).toFixed(2)}deg) rotateY(${(f.mx * 7).toFixed(2)}deg) scale(${(0.93 + 0.07 * o).toFixed(4)})`);
      const n = notes.current[k];
      const no = clamp(1 - (Math.abs(sp - k) - 0.18) * 3.2);
      put(n, 'opacity', no.toFixed(3));
      put(n, 'visibility', no < 0.01 ? 'hidden' : 'visible');
      put(n, 'transform', `translate3d(0, calc(${mobile ? '0%' : '-50%'} + ${((k - sp) * 30).toFixed(1)}px), 0)`);
    });
  });

  return (
    <section className="im-scene im-tools" ref={ref} id="im-tools" aria-label="Software">
      <div className="im-stage" ref={stage}>
        <div className="im-collage" aria-hidden="true">
          {COLLAGE.map((c, i) => (
            <img key={c.src} ref={(el) => { bits.current[i] = el; }} src={c.src} alt="" className="im-collage-bit" style={{ height: c.h, opacity: 0 }} draggable={false} />
          ))}
        </div>
        <div className="im-statement im-tools-lead" ref={lead}>
          <p className="im-say im-say-md">{TOOLS_LEAD}</p>
        </div>

        {TOOLS.map((t, k) => (
          <a
            key={t.name}
            ref={(el) => { shots.current[k] = el; }}
            className="im-tool-shot"
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.name} (opens the tool)`}
            style={{ '--r': t.w / t.h, opacity: 0 } as CSSProperties}
            onPointerEnter={() => setCaption({ title: t.name, meta: t.lead, hint: 'Open the tool ↗' })}
            onPointerLeave={() => setCaption(null)}
          >
            <img src={t.img} alt="" width={t.w} height={t.h} draggable={false} />
          </a>
        ))}

        <div className="im-names" aria-hidden="true">
          {TOOLS.map((t, k) => (
            <p key={t.name} className="im-name" ref={(el) => { names.current[k] = el; }}>{t.name}</p>
          ))}
        </div>

        {TOOLS.map((t, k) => (
          <div key={t.name} className="im-tool-note" ref={(el) => { notes.current[k] = el; }} style={{ opacity: 0 }}>
            <p className="im-tool-lead">{t.lead}</p>
            <p className="im-tool-text">{t.text}</p>
            <a className="im-link" href={t.href} target="_blank" rel="noopener noreferrer">Open the tool ↗</a>
          </div>
        ))}
      </div>
    </section>
  );
}
