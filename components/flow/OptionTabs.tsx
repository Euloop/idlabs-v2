'use client';

import { Fragment, useEffect, useState } from 'react';
import './options.css';

/* /home-2: small tabs at the bottom centre of the screen to switch between design options of one
   section (Section 2's diagram styles; the tools' and Services' layouts and light / dark).
   12px mono caps in a hairline box; several groups sit in one bar, split by a hairline.
   Shown only while `when(rect, vh, nextTop)` holds for the section `selector` (by default: its
   stage is pinned and the next section's top edge is still below the screen); it fades in and
   vanishes at once. Checked on scroll and, while shown, every frame (smooth scrolling moves the
   page between scroll events).
   A × at the bar's right end tucks it away: the bar gives way to a single "Open" button at the
   bottom right (shown under the same condition), which brings it back. Remembered per bar
   (by `label`) in this browser. */

export type Group<T extends string = string> = {
  label: string;
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
};

type Props = {
  groups: Group[];
  selector: string;
  label: string;
  when?: (r: DOMRect, vh: number, nextTop: number) => boolean;
  /** dark bar (over a section in its own dark theme, while the page stays light) */
  dark?: boolean;
};

const pinnedAndAlone = (r: DOMRect, vh: number, nextTop: number) => r.top <= 1 && r.bottom >= vh - 1 && nextTop >= vh - 1;

export default function OptionTabs({ groups, selector, label, when = pinnedAndAlone, dark = false }: Props) {
  const [show, setShow] = useState(false);
  const [closed, setClosedState] = useState(false);
  const key = groups.map((g) => g.value).join('|');
  const store = `opt-tabs-closed:${label}`;

  useEffect(() => {
    try { setClosedState(window.localStorage.getItem(store) === '1'); } catch { /* no storage: stays open */ }
  }, [store]);
  const setClosed = (v: boolean) => {
    setClosedState(v);
    try { if (v) window.localStorage.setItem(store, '1'); else window.localStorage.removeItem(store); } catch { /* not remembered */ }
  };

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      let next = el.nextElementSibling as HTMLElement | null;
      while (next && (getComputedStyle(next).position === 'fixed' || next.tagName === 'NAV')) next = next.nextElementSibling as HTMLElement | null;
      const nextTop = next ? next.getBoundingClientRect().top : Infinity;
      const on = el.isConnected && when(el.getBoundingClientRect(), vh, nextTop);
      setShow(on); // always the measured state (React skips it when unchanged): never stuck on
      if (on) raf = requestAnimationFrame(measure);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); setShow(false); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [selector, key, when]);

  const barOn = show && !closed;
  return (
    <>
      <nav className="opt-tabs" data-on={barOn || undefined} data-dark={dark || undefined} aria-label={label} aria-hidden={!barOn || undefined}>
        <div className="opt-tabs-scroll">
        {groups.map((g, gi) => (
          <Fragment key={g.label}>
            {gi > 0 && <span className="opt-tabs-rule" aria-hidden="true" />}
            <span role="group" aria-label={g.label} className="opt-tabs-group">
              {g.options.map(([id, text], i) => (
                <span key={id}>
                  {i > 0 && <span className="opt-tabs-sep" aria-hidden="true">·</span>}
                  <button type="button" aria-pressed={g.value === id} tabIndex={barOn ? 0 : -1} onClick={() => g.onChange(id)}>{text}</button>
                </span>
              ))}
            </span>
          </Fragment>
        ))}
        </div>
        <span className="opt-tabs-rule" aria-hidden="true" />
        <button type="button" className="opt-tabs-close" aria-label={`Hide ${label}`} tabIndex={barOn ? 0 : -1} onClick={() => setClosed(true)}>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        </button>
      </nav>
      <button type="button" className="opt-tabs-open" data-on={(show && closed) || undefined} data-dark={dark || undefined}
        aria-label={`Open ${label}`} tabIndex={show && closed ? 0 : -1} onClick={() => setClosed(false)}>Open</button>
    </>
  );
}

/** Read / write a design option in the address (?key=value), so each option can be linked. */
export function useOption<T extends string>(key: string, options: [T, string][], fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get(key);
    if (q && options.some(([id]) => id === q)) setValue(q as T);
  }, [key, options]);
  const pick = (v: T) => {
    setValue(v);
    const u = new URL(window.location.href);
    u.searchParams.set(key, v);
    window.history.replaceState(null, '', u);
  };
  return [value, pick] as const;
}

export const THEMES: ['light' | 'dark', string][] = [['light', 'Light'], ['dark', 'Dark']];
