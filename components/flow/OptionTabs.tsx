'use client';

import { useEffect, useState } from 'react';
import './options.css';

/* /home-2: small tabs at the bottom centre of the screen to switch between design options of one
   section (Section 2's diagram styles, the Services layouts). 12px mono caps in a hairline box.
   Shown only while `when(rect, vh)` holds for the section `selector` (by default: its stage is
   pinned and the next section's top edge is still below the screen); it fades in and vanishes
   at once. Checked on scroll and, while shown, every frame (smooth scrolling moves the page
   between scroll events). */

type Props<T extends string> = {
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
  selector: string;
  label: string;
  when?: (r: DOMRect, vh: number, nextTop: number) => boolean;
};

const pinnedAndAlone = (r: DOMRect, vh: number, nextTop: number) => r.top <= 1 && r.bottom >= vh - 1 && nextTop >= vh - 1;

export default function OptionTabs<T extends string>({ options, value, onChange, selector, label, when = pinnedAndAlone }: Props<T>) {
  const [show, setShow] = useState(false);

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
  }, [selector, value, when]);

  return (
    <nav className="opt-tabs" data-on={show || undefined} aria-label={label}>
      {options.map(([id, text], i) => (
        <span key={id}>
          {i > 0 && <span className="opt-tabs-sep" aria-hidden="true">·</span>}
          <button type="button" aria-pressed={value === id} tabIndex={show ? 0 : -1} onClick={() => onChange(id)}>{text}</button>
        </span>
      ))}
    </nav>
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
