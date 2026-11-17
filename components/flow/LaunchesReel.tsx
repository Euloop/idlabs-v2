'use client';

import { useEffect, useRef, useState } from 'react';
import { PICTURED, slug, type Launch } from './LaunchesCloud';
import { LAUNCH_VIDEO } from './launch-videos';

/* The full-page launch reel at the end of Launches "Float" (LaunchesFloat.tsx zooms one launch up
   to fill the screen, then hands over to this). One launch at a time, full bleed: its video plays
   (muted, looping; a sound toggle), or its picture when the post is a photo. Bottom left the reach,
   large, and what it was with a link to the post; bottom right prev / next and the count.
   Slides crossfade. The parent sets `on` once the reel is in front; only then does the active
   video load and play. Arrow keys work while a control has focus. */

/* Only launches with a reach figure, biggest first (as the slides). It opens on `start`: the
   launch the field zoomed into. */
/* the big picture of a launch: its HD file, or (the launches without one: the reel on /launches shows them all)
   its usual one */
const NO_HD = new Set(['anything', 'enterpret', 'freehand', 'lindy', 'lovable-agent-launch', 'superblocks', 'triple-whale']);
const HD = (l: Launch) => (NO_HD.has(slug(l)) ? `/assets/launches/${slug(l)}.webp` : `/assets/launches/hd/${slug(l)}.webp`);
export const REEL: Launch[] = PICTURED.filter((l) => l.reach).sort((a, b) => parseFloat(b.reach!) - parseFloat(a.reach!));

const pad = (n: number) => String(n).padStart(2, '0');

/* Each client's logo for the caption, in place of its name (white, through a mask), all at about the
   same visual area. Akai has no logo file: its name stays, in mono. Fish Audio is its mark and name
   set together, as the hero's lockup. */
const LOGO: Record<string, { src: string; ratio: number; boost?: number }> = {
  'Matic Robots': { src: '/assets/clients/matic.svg', ratio: 181 / 52, boost: 0.9 },
  'Pocket FM': { src: '/assets/clients/pocketfm.svg', ratio: 340 / 53 },
  'Fish Audio': { src: '/assets/clients/fishaudio-mark.svg', ratio: 434.6 / 160.9 },
  'Lovable': { src: '/assets/clients/lovable.svg', ratio: 911 / 155 },
  'Airwallex': { src: '/assets/clients/airwallex.svg', ratio: 102.088 / 13.952 },
  'Gamma': { src: '/assets/hero-v/gamma.svg', ratio: 78.5852 / 13.6214 },
  'Wispr Flow': { src: '/assets/clients/wispr.svg', ratio: 446 / 125 },
  'Cartesia': { src: '/assets/clients/cartesia.svg', ratio: 579 / 83, boost: 1.04 },
  'Deel': { src: '/assets/hero-v/deel.svg', ratio: 53.1222 / 17.9855, boost: 0.9 },
  'PolyAI': { src: '/assets/clients/polyai.svg', ratio: 120 / 36 },
  'PlayerZero': { src: '/assets/clients/playerzero.svg', ratio: 2551 / 373, boost: 1.04 },
};
const AREA = 1900; // px², at the reel's full size (the card variants scale it with --lk)
function ClientLogo({ client }: { client: string }) {
  const lg = LOGO[client];
  if (!lg) return <span className="lcr-client">{client}</span>;
  const h = Math.min(26, Math.sqrt(AREA / lg.ratio) * (lg.boost ?? 1));
  const mark = <span className="lcr-logo" role={client === 'Fish Audio' ? undefined : 'img'} aria-label={client === 'Fish Audio' ? undefined : client}
    style={{ '--src': `url('${lg.src}')`, '--w': (client === 'Fish Audio' ? 11 * lg.ratio : h * lg.ratio).toFixed(1), '--h': (client === 'Fish Audio' ? 11 : h).toFixed(1) } as React.CSSProperties} />;
  if (client === 'Fish Audio') return <span className="lcr-lockup" role="img" aria-label={client}>{mark}<span className="lcr-lockup-name" aria-hidden="true">Fish Audio</span></span>;
  return mark;
}

const Chevron = ({ dir }: { dir: 'l' | 'r' }) => (
  <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true">
    <path d={dir === 'l' ? 'M7.5 2.5 4 6l3.5 3.5' : 'M4.5 2.5 8 6 4.5 9.5'} fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const PlayPause = ({ playing }: { playing: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
    {playing ? <><rect x="4" y="3" width="2.4" height="10" /><rect x="9.6" y="3" width="2.4" height="10" /></> : <path d="M5 3v10l8-5z" />}
  </svg>
);

const Speaker = ({ muted }: { muted: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M2.5 6h2.5l3.5-3v10L5 10H2.5z" />
    {muted ? <path d="m11 6 3.5 4m0-4L11 10" /> : <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.8a6 6 0 0 1 0 8.4" />}
  </svg>
);

/* alt (Float II): the reach smaller, the line under it in mono, and a full-height area at each side
   with a chevron at its middle for prev / next — on hover a soft dark comes in from that edge and
   the chevron lights. */
/* card (Float III): the reel is a card between the margin lines (LaunchesFloat.tsx sizes it); prev /
   next are the same side areas as Float II, inside the card (a soft dark from that edge on hover). */
/* track (Float IV, after tryprofound.com's story cards): the launches sit side by side and slide
   across (no crossfade); the next one peeks in past the card's right edge and a click on it moves on.
   Prev / next are Float II's side areas inside the card (a soft dark from that edge on hover, the
   chevron lights); "Go to post" is a small button. */
/* list / end (Launches "Selected"): only these launches, in this order, and after them one more slide,
   `end`, with a button to the page of all launches. The track then runs one way, first to the end
   slide (no wrap back to the first), and hands the scroll to the page there. */
export type ReelEnd = { href: string; total: number };
export default function LaunchesReel({ on, start = 0, alt = false, card = false, track = false, list, end }: { on: boolean; start?: number; alt?: boolean; card?: boolean; track?: boolean; list?: Launch[]; end?: ReelEnd }) {
  const [i, setI] = useState(start);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true); // Float II: play / pause (kept across launches)
  const videoRef = useRef<HTMLVideoElement>(null);
  const slides = list ?? REEL;
  const n = slides.length + (end ? 1 : 0);
  const finite = !!end; // with an end slide the track runs one way, to it
  const last = finite ? n - 1 : n; // how far the track goes
  /* track (Float IV): one continuous position `pos` (launches from `start`, fractional), eased every
     frame toward `target`, like the page's own smooth scroll. The wheel over the reel, a drag, the
     arrows and the peeks all just move the target; the reel glides there, and only once the wheel
     rests does it settle on the nearest launch (eased too). Each slide is placed from `pos` directly.
     `moved`: it has gone forward (from then on the previous launch peeks in at the left too). */
  const [moved, setMoved] = useState(false);
  const movedRef = useRef(false);
  const pos = useRef(0);
  const target = useRef(0);
  const vel = useRef(0); // the spring's speed, launches per second
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const kick = useRef<() => void>(() => {});
  const go = (d: number) => {
    if (!track) { setI((v) => (v + d + n) % n); return; }
    target.current = Math.round(target.current) + d;
    if (end) target.current = Math.min(last, Math.max(0, target.current));
    kick.current();
  };

  /* track: drag the reel sideways (it follows the pointer); past 60px a release moves on (left drag:
     next, right: back), less springs back. A drag never counts as a click on what it started on. */
  const drag = useRef<{ x: number; id: number; p0: number; dx: number; on: boolean; t: number; v: number } | null>(null);
  const dragged = useRef(false);
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!track || !on || e.button !== 0 || (e.target as HTMLElement).closest('a, .lcr-nav')) return;
    drag.current = { x: e.clientX, id: e.pointerId, p0: pos.current, dx: 0, on: false, t: performance.now(), v: 0 };
    dragged.current = false;
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = drag.current, el = rootRef.current;
    if (!g || !el) return;
    g.dx = e.clientX - g.x;
    if (!g.on && Math.abs(g.dx) > 6) { g.on = true; dragged.current = true; el.setPointerCapture(g.id); el.setAttribute('data-dragging', ''); }
    if (g.on) {
      let p = g.p0 - g.dx / el.clientWidth;
      const now = performance.now(), dt = Math.max(1, now - g.t) / 1000;
      if (end) p = Math.min(last, Math.max(0, p)); // with an end slide: no dragging past either end
      g.v = g.v * 0.6 + ((p - pos.current) / dt) * 0.4; // its speed, smoothed: kept for the release
      g.t = now;
      target.current = pos.current = p;
      kick.current();
    }
  };
  const onUp = () => {
    const g = drag.current, el = rootRef.current;
    drag.current = null;
    if (!g || !g.on || !el) return;
    el.removeAttribute('data-dragging');
    const p = g.p0 - g.dx / el.clientWidth;
    target.current = Math.round(p + (g.dx < -60 ? 0.35 : g.dx > 60 ? -0.35 : 0));
    if (end) target.current = Math.min(last, Math.max(0, target.current));
    vel.current = Math.max(-6, Math.min(6, g.v)); // the throw carries into the spring
    kick.current();
  };

  /* track: scrolling with the pointer over the reel moves it sideways (down: forward) instead of the
     page, once through: when the first launch is back in the middle the page takes the scroll and
     goes on to the footer, and from then on the reel leaves the scroll to the page both ways
     (coming back up from the footer the page simply goes up). It takes the scroll again only after
     the reel has been left (scrolled back up into the float). Elsewhere the page scrolls as usual. */
  const onRef = useRef(on);
  onRef.current = on;
  const doneRef = useRef(false);
  // the reel left (scrolled back up into the float): the wheel is the reel's again; with an end slide
  // it also goes back to the first launch, the picture the zoom lands on
  useEffect(() => {
    if (on) return;
    doneRef.current = false;
    if (!finite) return;
    pos.current = target.current = vel.current = 0;
    movedRef.current = false; setMoved(false);
    kick.current();
  }, [on, finite]);
  useEffect(() => {
    const el = rootRef.current;
    if (!track || !el) return;
    let raf = 0, then = 0, idle = 0, cur = -1;
    let dir = 0; // the way the wheel last moved it (+1 forward, −1 back), for the settle
    const wrap = (x: number) => ((x % n) + n) % n;
    const paint = () => {
      const p = pos.current;
      slideRefs.current.forEach((sl, k) => {
        if (!sl) return;
        let d = finite ? k - start - p : wrap(k - start - p);
        if (!finite && d > n / 2) d -= n;
        const near = Math.abs(d) < 1.5;
        sl.style.visibility = near ? 'visible' : 'hidden';
        if (near) sl.style.translate = `${(d * 100).toFixed(3)}% 0`;
      });
      const idx = wrap(start + Math.round(p));
      if (idx !== cur) { cur = idx; setI(idx); }
      if (!movedRef.current && p > 0.5) { movedRef.current = true; setMoved(true); }
      if (p >= last - 0.001) doneRef.current = true; // at the end, however it got there: the page's scroll from now on
      el.toggleAttribute('data-sliding', Math.abs(target.current - p) > 0.004 || !!drag.current?.on);
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - then) / 1000);
      then = now;
      if (!drag.current?.on) {
        // a critically damped spring toward the target, in small steps: it eases in and out, the
        // wheel's separate notches blend into one glide, and it never overshoots
        const K = 70, C = 2 * Math.sqrt(K);
        for (let r = dt; r > 0; r -= 1 / 240) {
          const h = Math.min(r, 1 / 240);
          vel.current += (K * (target.current - pos.current) - C * vel.current) * h;
          pos.current += vel.current * h;
        }
      }
      // with an end slide the reel stops there: a throw's momentum never carries it past (or before the first)
      if (finite && pos.current > last) { pos.current = last; vel.current = Math.min(0, vel.current); }
      if (finite && pos.current < 0) { pos.current = 0; vel.current = Math.max(0, vel.current); }
      if (Math.abs(target.current - pos.current) < 0.0004 && Math.abs(vel.current) < 0.002) { pos.current = target.current; vel.current = 0; }
      paint();
      raf = pos.current !== target.current || vel.current !== 0 || drag.current?.on ? requestAnimationFrame(frame) : 0;
    };
    kick.current = () => { if (!raf) { then = performance.now(); raf = requestAnimationFrame(frame); } };
    paint();
    const onWheel = (e: WheelEvent) => {
      if (!onRef.current || e.ctrlKey || doneRef.current) return;
      const k = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? el.clientHeight : 1;
      // twice the wheel's distance sideways: a whole cycle (13 launches) in a reasonable scroll
      const dy = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * k * 2;
      const t = target.current;
      if (dy < 0 && t <= 0) return; // at the start, going up: the page's
      e.preventDefault();
      e.stopPropagation(); // the page's smooth scroll (Lenis, on the window) must not see it either
      target.current = Math.min(last, Math.max(0, t + dy / el.clientWidth));
      dir = dy > 0 ? 1 : -1;
      window.clearTimeout(idle);
      // once the wheel rests, settle on a launch: the next one the way it was going if it is over a
      // quarter of the way there, else back to the one it left (the spring eases it in)
      idle = window.setTimeout(() => {
        const tt = target.current, f = tt - Math.floor(tt);
        target.current = Math.min(last, Math.max(0, f < 1e-6 ? tt : dir > 0 ? (f > 0.25 ? Math.ceil(tt) : Math.floor(tt)) : (f < 0.75 ? Math.floor(tt) : Math.ceil(tt))));
        kick.current();
      }, 320);
      kick.current();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); window.clearTimeout(idle); cancelAnimationFrame(raf); kick.current = () => {}; };
  }, [track, n, start, finite, last]);

  const onClickCapture = (e: React.MouseEvent) => {
    if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; }
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  };

  // play the active video while the reel is in front; pause it otherwise
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (on && playing) v.play().catch(() => { /* autoplay refused: the poster stays */ });
    else v.pause();
  }, [on, i, playing]);
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted; }, [muted, i]);

  /* Float II: the caption's left edge and the controls' right edge sit 25px in from the header frame's
     rules, where the wordmark and the last nav link used to be (measured, so it holds at every frame
     width). Measured from the frame, not those two: the wordmark is centred now and the nav is off
     (2026-11-17), which had pulled the caption to the middle of the launch. */
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!alt || !el) return;
    const fit = () => {
      const fr = document.querySelector('.chrome .chrome-frame')?.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      if (fr && fr.width) {
        el.style.setProperty('--al', `${Math.round(fr.left + 25 - box.left)}px`);
        el.style.setProperty('--ar', `${Math.round(box.right - (fr.right - 25))}px`);
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [alt]);

  const l = slides[i] as Launch | undefined; // none on the end slide
  const atEnd = !l;
  const hasVideo = !!l && !!LAUNCH_VIDEO[slug(l)];

  return (
    <div className="lcr" ref={rootRef} data-alt={alt || undefined} data-card={card || undefined} data-track={track || undefined}
      data-moved={(track && moved) || undefined} data-end={atEnd || undefined}
      onPointerDown={track ? onDown : undefined} onPointerMove={track ? onMove : undefined} onPointerUp={track ? onUp : undefined}
      onPointerCancel={track ? onUp : undefined} onClickCapture={track ? onClickCapture : undefined}
      role="region" aria-roledescription="carousel" aria-label="Client launches">
      {slides.map((s, k) => {
        const active = k === i;
        const video = LAUNCH_VIDEO[slug(s)];
        return (
          <figure key={slug(s)} ref={(el) => { slideRefs.current[k] = el; }} className="lcr-slide" data-on={active || undefined} aria-hidden={!active || undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="lcr-media" src={HD(s)} alt=""
              loading={k === start || Math.abs(k - i) <= 1 ? 'eager' : 'lazy'} decoding="async" draggable={false} />
            {active && on && video && (
              <video ref={videoRef} key={video} className="lcr-media lcr-video" src={video} poster={HD(s)}
                muted={muted} loop playsInline autoPlay={playing} preload="auto"
                onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }} />
            )}
            {track && <div className="lcr-shade" aria-hidden="true" />}
          </figure>
        );
      })}
      {end && (
        <figure ref={(el) => { slideRefs.current[slides.length] = el; }} className="lcr-slide lcr-end" data-on={atEnd || undefined} aria-hidden={!atEnd || undefined}>
          <div className="lcr-end-in">
            <a className="lcr-end-btn" href={end.href} tabIndex={on && atEnd ? 0 : -1}>See all launches <span aria-hidden="true">→</span></a>
          </div>
        </figure>
      )}
      {!track && <div className="lcr-shade" aria-hidden="true" />}
      {track && (
        <button type="button" className="lcr-peekhit" data-side="r" onClick={() => go(1)} tabIndex={-1} aria-hidden="true" />
      )}
      {track && moved && (
        <button type="button" className="lcr-peekhit" data-side="l" onClick={() => go(-1)} tabIndex={-1} aria-hidden="true" />
      )}
      {alt && (['l', 'r'] as const).map((d) => (
        <button key={d} type="button" className="lcr-side" data-side={d} onClick={() => go(d === 'l' ? -1 : 1)} onKeyDown={onKey}
          tabIndex={on ? 0 : -1} aria-label={d === 'l' ? 'Previous launch' : 'Next launch'}>
          <span className="lcr-side-chev" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24"><path d={d === 'l' ? 'M15 4 7 12l8 8' : 'M9 4l8 8-8 8'} fill="none" stroke="currentColor" strokeWidth="1.1" /></svg>
          </span>
        </button>
      ))}

      {l && (
      <div className="lcr-cap" aria-live="polite">
        <p key={`r-${i}`} className="lcr-reach">{l.reach ? `${l.reach} views` : 'On X'}</p>
        <p key={`s-${i}`} className="lcr-sub">
          <span className="lcr-who"><ClientLogo client={l.client} />{l.what && <span className="lcr-what">{l.what}</span>}</span>{' '}
          {l.x && <a href={l.x} target="_blank" rel="noopener noreferrer" tabIndex={on ? 0 : -1}>Go to post <span aria-hidden="true">↗</span></a>}
        </p>
      </div>
      )}

      {alt ? (
        // Float II: prev / next live at the sides; bottom right, play / pause and sound
        hasVideo && (
          <div className="lcr-nav">
            <button type="button" className="lcr-btn" onClick={() => setPlaying((p) => !p)} tabIndex={on ? 0 : -1}
              aria-label={playing ? 'Pause video' : 'Play video'} aria-pressed={!playing}><PlayPause playing={playing} /></button>
            <button type="button" className="lcr-btn" onClick={() => setMuted((m) => !m)} tabIndex={on ? 0 : -1}
              aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted}><Speaker muted={muted} /></button>
          </div>
        )
      ) : (
      <div className="lcr-nav">
        {hasVideo && (
          <button type="button" className="lcr-btn lcr-sound" onClick={() => setMuted((m) => !m)} tabIndex={on ? 0 : -1}
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted}><Speaker muted={muted} /></button>
        )}
        <button type="button" className="lcr-btn" onClick={() => go(-1)} onKeyDown={onKey} tabIndex={on ? 0 : -1} aria-label="Previous launch"><Chevron dir="l" /></button>
        <span className="lcr-count" aria-label={`Launch ${i + 1} of ${n}`}>{pad(i + 1)} / {pad(n)}</span>
        <button type="button" className="lcr-btn" onClick={() => go(1)} onKeyDown={onKey} tabIndex={on ? 0 : -1} aria-label="Next launch"><Chevron dir="r" /></button>
      </div>
      )}
    </div>
  );
}
