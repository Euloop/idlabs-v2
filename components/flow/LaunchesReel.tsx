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
export const REEL: Launch[] = PICTURED.filter((l) => l.reach).sort((a, b) => parseFloat(b.reach!) - parseFloat(a.reach!));

const pad = (n: number) => String(n).padStart(2, '0');

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
   chevron lights); "Watch the post" is a small button. */
export default function LaunchesReel({ on, start = 0, alt = false, card = false, track = false }: { on: boolean; start?: number; alt?: boolean; card?: boolean; track?: boolean }) {
  const [i, setI] = useState(start);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true); // Float II: play / pause (kept across launches)
  const videoRef = useRef<HTMLVideoElement>(null);
  const n = REEL.length;
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
      const p = g.p0 - g.dx / el.clientWidth, now = performance.now(), dt = Math.max(1, now - g.t) / 1000;
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
  useEffect(() => { if (!on) doneRef.current = false; }, [on]);
  useEffect(() => {
    const el = rootRef.current;
    if (!track || !el) return;
    let raf = 0, last = 0, idle = 0, cur = -1;
    let dir = 0; // the way the wheel last moved it (+1 forward, −1 back), for the settle
    const wrap = (x: number) => ((x % n) + n) % n;
    const paint = () => {
      const p = pos.current;
      slideRefs.current.forEach((sl, k) => {
        if (!sl) return;
        let d = wrap(k - start - p);
        if (d > n / 2) d -= n;
        const near = Math.abs(d) < 1.5;
        sl.style.visibility = near ? 'visible' : 'hidden';
        if (near) sl.style.translate = `${(d * 100).toFixed(3)}% 0`;
      });
      const idx = wrap(start + Math.round(p));
      if (idx !== cur) { cur = idx; setI(idx); }
      if (!movedRef.current && p > 0.5) { movedRef.current = true; setMoved(true); }
      el.toggleAttribute('data-sliding', Math.abs(target.current - p) > 0.004 || !!drag.current?.on);
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
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
      if (Math.abs(target.current - pos.current) < 0.0004 && Math.abs(vel.current) < 0.002) { pos.current = target.current; vel.current = 0; }
      paint();
      raf = pos.current !== target.current || vel.current !== 0 || drag.current?.on ? requestAnimationFrame(frame) : 0;
    };
    kick.current = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
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
      target.current = Math.min(n, Math.max(0, t + dy / el.clientWidth));
      dir = dy > 0 ? 1 : -1;
      if (target.current >= n) doneRef.current = true; // the cycle is complete: from now on the page's
      window.clearTimeout(idle);
      // once the wheel rests, settle on a launch: the next one the way it was going if it is over a
      // quarter of the way there, else back to the one it left (the spring eases it in)
      idle = window.setTimeout(() => {
        const tt = target.current, f = tt - Math.floor(tt);
        target.current = Math.min(n, Math.max(0, f < 1e-6 ? tt : dir > 0 ? (f > 0.25 ? Math.ceil(tt) : Math.floor(tt)) : (f < 0.75 ? Math.floor(tt) : Math.ceil(tt))));
        kick.current();
      }, 320);
      kick.current();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); window.clearTimeout(idle); cancelAnimationFrame(raf); kick.current = () => {}; };
  }, [track, n, start]);

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

  /* Float II: the caption's left edge and the controls' right edge line up with the header's
     wordmark and its last nav link (measured, so it holds at every frame width). */
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!alt || !el) return;
    const fit = () => {
      const wm = document.querySelector('.chrome .wordmark')?.getBoundingClientRect();
      const links = document.querySelectorAll('.chrome-nav a');
      const last = links[links.length - 1]?.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      if (wm && wm.width) el.style.setProperty('--al', `${Math.round(wm.left - box.left)}px`);
      if (last && last.width) el.style.setProperty('--ar', `${Math.round(box.right - last.right)}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [alt]);

  const l = REEL[i];
  const hasVideo = !!LAUNCH_VIDEO[slug(l)];

  return (
    <div className="lcr" ref={rootRef} data-alt={alt || undefined} data-card={card || undefined} data-track={track || undefined}
      data-moved={(track && moved) || undefined}
      onPointerDown={track ? onDown : undefined} onPointerMove={track ? onMove : undefined} onPointerUp={track ? onUp : undefined}
      onPointerCancel={track ? onUp : undefined} onClickCapture={track ? onClickCapture : undefined}
      role="region" aria-roledescription="carousel" aria-label="Client launches">
      {REEL.map((s, k) => {
        const active = k === i;
        const video = LAUNCH_VIDEO[slug(s)];
        return (
          <figure key={slug(s)} ref={(el) => { slideRefs.current[k] = el; }} className="lcr-slide" data-on={active || undefined} aria-hidden={!active || undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="lcr-media" src={`/assets/launches/hd/${slug(s)}.webp`} alt=""
              loading={k === start || Math.abs(k - i) <= 1 ? 'eager' : 'lazy'} decoding="async" draggable={false} />
            {active && on && video && (
              <video ref={videoRef} key={video} className="lcr-media lcr-video" src={video} poster={`/assets/launches/hd/${slug(s)}.webp`}
                muted={muted} loop playsInline autoPlay={playing} preload="auto"
                onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }} />
            )}
            {track && <div className="lcr-shade" aria-hidden="true" />}
          </figure>
        );
      })}
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

      <div className="lcr-cap" aria-live="polite">
        <p key={`r-${i}`} className="lcr-reach">{l.reach} views</p>
        <p key={`s-${i}`} className="lcr-sub">
          {l.client}{l.what ? ` — ${l.what}.` : '.'}{' '}
          {l.x && <a href={l.x} target="_blank" rel="noopener noreferrer" tabIndex={on ? 0 : -1}>Watch the post <span aria-hidden="true">↗</span></a>}
        </p>
      </div>

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
