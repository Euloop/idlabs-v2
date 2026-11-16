'use client';

import { useEffect, useRef, useState } from 'react';
import LaunchesGrid from './LaunchesGrid';
import LaunchesReel from './LaunchesReel';
import { PICTURED, slug, type Launch } from './LaunchesCloud';
import './launches-float.css';

/* /launches (2026-11-16): the launches grid of /home-2 (LaunchesGrid, after cordia.studio — drag to look around),
   over the whole screen. A tile opens its launch in a dialog: the home page's full-screen launch reel (Float II's
   dress — the video playing, its reach, client and "Go to post", play / pause, sound, previous / next) in a 16:9
   box over the dimmed grid. Closed by its × , Escape or a click outside; the page holds still while it is open. */

type LenisLike = { stop: () => void; start: () => void };

export default function LaunchesPage() {
  const [open, setOpen] = useState<Launch | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const backTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    backTo.current = document.activeElement as HTMLElement | null;
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    lenis?.stop();
    const d = document.documentElement;
    const was = d.style.overflow;
    d.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      d.style.overflow = was;
      lenis?.start();
      backTo.current?.focus?.();
    };
  }, [open]);

  const start = open ? Math.max(0, PICTURED.findIndex((l) => slug(l) === slug(open))) : 0;

  return (
    <>
      <div className="lcp-grid">
        <h1 id="lc-title" className="sr-only">Every launch we’ve done for our clients</h1>
        <LaunchesGrid full onOpen={setOpen} />
      </div>
      {open && (
        <div className="lcp-dialog" role="dialog" aria-modal="true" aria-label={`${open.client}${open.what ? ` — ${open.what}` : ''}`}
          onPointerDown={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="lcp-box">
            {/* keyed on the launch it opened with: a new tile opens a fresh reel there */}
            <LaunchesReel key={slug(open)} on alt list={PICTURED} start={start} />
          </div>
          <button ref={closeRef} type="button" className="lcp-close" onClick={() => setOpen(null)} aria-label="Close">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
