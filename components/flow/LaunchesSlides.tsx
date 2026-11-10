'use client';

import { useEffect, useRef, useState } from 'react';
import { PICTURED, slug, type Launch } from './LaunchesCloud';
import './launches-slides.css';

/* The launches one at a time, as big 16:9 slides (/home-2, Launches "Carousel" and "Slider"):
   the launch picture, the client's wordmark top left, the reach, what it was, and a link to the
   post. Only launches with a reach figure, biggest first.
     carousel  the slide fills the frame rule to rule; the row runs out past both screen edges
               (the first slide starts at the left rule; from the second on, the one before peeks
               in on the left, the next on the right); the title left, prev / next top right
     slider    one slide, centred, prev / next either side of it
   All 16:9. Drag to move (both); the buttons wrap around at the ends. Arrow keys work while a
   button has focus. */

const SLIDES = PICTURED.filter((l) => l.reach).sort((a, b) => parseFloat(b.reach!) - parseFloat(a.reach!));

/* each client's logo (drawn white over the picture). The ones in /assets/clients were taken from
   the clients' own sites (Pocket FM: the wordmark, without its seasonal icon). Clients without
   one (Fish Audio, Akai) get their name set in type. */
const WORDMARK: Record<string, string> = {
  Gamma: '/assets/gamma.svg',
  Deel: '/assets/deel.svg',
  Lovable: '/assets/lovable-word.svg',
  Airwallex: '/assets/airwallex-word.svg',
  'Matic Robots': '/assets/clients/matic.svg',
  Cartesia: '/assets/clients/cartesia.svg',
  PolyAI: '/assets/clients/polyai.svg',
  PlayerZero: '/assets/clients/playerzero.svg',
  'Pocket FM': '/assets/clients/pocketfm.svg',
  'Wispr Flow': '/assets/clients/wispr.svg',
};

function Slide({ l, active, near }: { l: Launch; active: boolean; near: boolean }) {
  const mark = WORDMARK[l.client];
  return (
    <figure className="lcs-slide" aria-hidden={!active || undefined}>
      {/* full-size frames from the posts (1600px; public/assets/launches/hd) */}
      <img className="lcs-img" src={`/assets/launches/hd/${slug(l)}.webp`} alt="" draggable={false} loading={near ? 'eager' : 'lazy'} decoding="async" />
      <div className="lcs-shade" aria-hidden="true" />
      <div className="lcs-logo">
        {mark ? <img src={mark} alt={l.client} /> : <span>{l.client}</span>}
      </div>
      <figcaption className="lcs-cap">
        <span className="lcs-reach">{l.reach} Views</span>
        <span className="lcs-sub">
          {l.client}{l.what ? `’s ${l.what}` : ''}<i>•</i>{l.reach} views on X{l.li && <><i>•</i>Also on LinkedIn</>}
        </span>
      </figcaption>
      {l.x && (
        <a className="lcs-see" href={l.x} target="_blank" rel="noopener noreferrer" tabIndex={active ? 0 : -1}
          aria-label={`See ${l.client}’s post on X (opens in a new tab)`}>[See post]</a>
      )}
    </figure>
  );
}

const Chevron = ({ dir }: { dir: 'l' | 'r' }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <path d={dir === 'l' ? 'M7.5 2.5 4 6l3.5 3.5' : 'M4.5 2.5 8 6 4.5 9.5'} fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export default function LaunchesSlides({ mode }: { mode: 'carousel' | 'slider' }) {
  const [i, setI] = useState(0);
  const n = SLIDES.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  };

  /* Drag (mouse, pen, touch) to move between slides: the row follows the pointer, and on release
     it settles on the nearest slide (a flick of an eighth of a slide is enough to move one).
     Past the first or last slide it only gives a little. A drag is never a click on [See post]. */
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x0: number; dx: number; moved: boolean; w: number } | null>(null);
  const dragged = useRef(false);
  const setDx = (px: number) => trackRef.current?.style.setProperty('--dx', `${px}px`);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { id: e.pointerId, x0: e.clientX, dx: 0, moved: false, w: viewRef.current?.clientWidth ?? 1 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    let dx = e.clientX - d.x0;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      viewRef.current?.setPointerCapture(d.id);
      trackRef.current?.setAttribute('data-drag', '');
    }
    if ((i === 0 && dx > 0) || (i === n - 1 && dx < 0)) dx *= 0.35; // ends: a little give
    d.dx = dx;
    setDx(dx);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    dragged.current = true;
    let steps = Math.round(-d.dx / d.w);
    if (steps === 0 && Math.abs(d.dx) > d.w / 8) steps = d.dx < 0 ? 1 : -1;
    trackRef.current?.removeAttribute('data-drag');
    setDx(0);
    setI((v) => Math.min(n - 1, Math.max(0, v + steps)));
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; }
  };
  useEffect(() => { const t = trackRef.current; return () => t?.removeAttribute('data-drag'); }, []);

  const prev = <button type="button" className="lcs-btn lcs-prev" onClick={() => go(-1)} onKeyDown={onKey} aria-label="Previous launch"><Chevron dir="l" /></button>;
  const next = <button type="button" className="lcs-btn lcs-next" onClick={() => go(1)} onKeyDown={onKey} aria-label="Next launch"><Chevron dir="r" /></button>;

  return (
    <div className="lcs" data-mode={mode} role="region" aria-roledescription="carousel" aria-label="Client launches">
      {mode === 'slider' && prev}
      <div className="lcs-view" ref={viewRef}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture} onDragStart={(e) => e.preventDefault()}>
        <div className="lcs-track" ref={trackRef} style={{ '--i': i } as React.CSSProperties} aria-live="polite">
          {SLIDES.map((l, k) => <Slide key={slug(l)} l={l} active={k === i} near={Math.abs(k - i) <= 1} />)}
        </div>
      </div>
      {mode === 'slider' && next}
      {mode === 'carousel' && <div className="lcs-nav">{prev}{next}</div>}
    </div>
  );
}
