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
export default function LaunchesReel({ on, start = 0, alt = false }: { on: boolean; start?: number; alt?: boolean }) {
  const [i, setI] = useState(start);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true); // Float II: play / pause (kept across launches)
  const videoRef = useRef<HTMLVideoElement>(null);
  const n = REEL.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);
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
    <div className="lcr" ref={rootRef} data-alt={alt || undefined} role="region" aria-roledescription="carousel" aria-label="Client launches">
      {REEL.map((s, k) => {
        const active = k === i;
        const video = LAUNCH_VIDEO[slug(s)];
        return (
          <figure key={slug(s)} className="lcr-slide" data-on={active || undefined} aria-hidden={!active || undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="lcr-media" src={`/assets/launches/hd/${slug(s)}.webp`} alt=""
              loading={k === start || Math.abs(k - i) <= 1 ? 'eager' : 'lazy'} decoding="async" draggable={false} />
            {active && on && video && (
              <video ref={videoRef} key={video} className="lcr-media lcr-video" src={video} poster={`/assets/launches/hd/${slug(s)}.webp`}
                muted={muted} loop playsInline autoPlay={playing} preload="auto"
                onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }} />
            )}
          </figure>
        );
      })}
      <div className="lcr-shade" aria-hidden="true" />
      {alt && (['l', 'r'] as const).map((d) => (
        <button key={d} type="button" className="lcr-side" data-side={d} onClick={() => go(d === 'l' ? -1 : 1)} onKeyDown={onKey}
          tabIndex={on ? 0 : -1} aria-label={d === 'l' ? 'Previous launch' : 'Next launch'}>
          <span className="lcr-side-chev" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24"><path d={d === 'l' ? 'M15 4 7 12l8 8' : 'M9 4l8 8-8 8'} fill="none" stroke="currentColor" strokeWidth="1.1" /></svg>
          </span>
        </button>
      ))}

      <div className="lcr-cap" aria-live="polite">
        <p key={`r-${i}`} className="lcr-reach">{l.reach} views.</p>
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
