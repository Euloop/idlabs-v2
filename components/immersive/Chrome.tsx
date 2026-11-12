'use client';

import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from './data';
import { onCaption, put, useTick, type Caption } from './engine';

/* /home-3's fixed chrome, after the Getty piece: no frame, no rules — the wordmark small and centred at the top, a
   small black index button top right (square, like every button here), a slim progress rail on the right edge (its marks jump to
   the chapters), and a caption box bottom right that names whatever is under the pointer.
   It all turns light while a dark scene is up (html[data-im-dark]). */

export default function Chrome() {
  const [open, setOpen] = useState(false);
  const [cap, setCap] = useState<Caption>(null);
  const [marks, setMarks] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const thumb = useRef<HTMLSpanElement>(null);
  const lastCap = useRef<Caption>(null);

  useEffect(() => onCaption((c) => {
    if (c) lastCap.current = c;
    setCap(c);
  }), []);

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setMarks(CHAPTERS.map((c) => {
        const el = document.getElementById(c.id);
        return el && max > 0 ? Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / max) : 0;
      }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useTick((f) => {
    const max = document.documentElement.scrollHeight - f.vh;
    const p = max > 0 ? f.sy / max : 0;
    let a = 0;
    marks.forEach((m, i) => { if (p >= m - 0.002) a = i; });
    // the marks sit evenly on the rail; the bar moves piecewise between them
    const n = CHAPTERS.length - 1;
    const m0 = marks[a] ?? 0;
    const m1 = a < n ? marks[a + 1] ?? 1 : 1;
    const along = a < n ? Math.min(1, Math.max(0, (p - m0) / Math.max(1e-6, m1 - m0))) : 0;
    put(thumb.current, 'transform', `translate3d(0, ${(((a + along) / n) * 100).toFixed(2)}%, 0)`);
    if (a !== active) setActive(a);
  });

  const shown = cap ?? lastCap.current;

  return (
    <>
      <header className="im-header">
        <span aria-hidden="true" />
        <a className="im-wordmark" href="#im-top" aria-label="Identity Labs, back to the top"><span className="im-logo" /></a>
        <button className="im-menu" type="button" aria-expanded={open} aria-controls="im-index" onClick={() => setOpen((o) => !o)}>
          <span className="im-menu-icon" aria-hidden="true"><i /><i /></span>
          <span className="im-visually-hidden">{open ? 'Close the index' : 'Open the index'}</span>
        </button>
      </header>

      <nav className="im-rail" aria-label="Chapters">
        <span className="im-rail-track" aria-hidden="true"><span className="im-rail-thumb" ref={thumb} /></span>
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.id} style={{ top: `${(i / (CHAPTERS.length - 1)) * 100}%` }}>
              <a href={`#${c.id}`} onClick={() => setOpen(false)} data-on={i === active || undefined}>
                <span className="im-rail-dot" aria-hidden="true" />
                <span className="im-rail-label">{c.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="im-caption" data-on={cap ? '' : undefined} aria-live="polite">
        {shown ? (
          <>
            <strong>{shown.title}</strong>
            {shown.meta && <span>{shown.meta}</span>}
            {shown.hint && <em>{shown.hint}</em>}
          </>
        ) : null}
      </div>

      <div className="im-index" id="im-index" data-open={open || undefined} aria-hidden={!open}>
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.id} style={{ transitionDelay: open ? `${80 + i * 40}ms` : '0ms' }}>
              <a href={`#${c.id}`} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
                <span className="im-index-n">{String(i + 1).padStart(2, '0')}</span>
                <span>{c.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
