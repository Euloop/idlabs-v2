'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import TokenText from '../../components/TokenText';
import { tick, unlock } from './tick';

const LINES = [
  'Virality is not luck, it’s engineering.',
  'Every post on X and LinkedIn passes through the same pipeline before anyone sees it.',
  'The algorithm scores every post on thousands of signals.',
  'Sourcing decides how many people see your post.',
  'Ranking decides where it lands in each feed.',
];

/* Control values; DEFAULTS below match the site. */
const SPEED = { slow: [36, 2000], normal: [18, 1000], fast: [9, 500] } as const; // ms per letter, cap per line
const NUMBERS = { off: 0, few: 3, half: 2, all: 1 } as const; // a number on every Nth word
const LINGER = { short: 650, long: 1400 } as const; // ms each number shows
const INK = { quick: 200, normal: 500, slow: 1200 } as const; // grey → ink, ms
const HOLD = { '2s': 2000, '3s': 3000, '5s': 5000 } as const; // finished line stays this long
const SIZE = { s: 0.75, m: 1, l: 1.3 } as const;
const SOUND = { off: 0, soft: 0.045, medium: 0.08, loud: 0.14 } as const; // key press volume
const TONE = { deep: 0.4, normal: 1, bright: 1.3 } as const; // pitch of the press

type Settings = {
  speed: keyof typeof SPEED;
  numbers: keyof typeof NUMBERS;
  linger: keyof typeof LINGER;
  ink: keyof typeof INK;
  hold: keyof typeof HOLD;
  size: keyof typeof SIZE;
  sound: keyof typeof SOUND;
  tone: keyof typeof TONE;
};

const GROUPS: { key: keyof Settings; label: string; options: [string, string][]; section?: string }[] = [
  { section: 'Animation', key: 'speed', label: 'Speed', options: [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']] },
  { key: 'numbers', label: 'Numbers', options: [['off', 'Off'], ['few', 'Few'], ['half', 'Half'], ['all', 'All']] },
  { key: 'linger', label: 'Linger', options: [['short', 'Short'], ['long', 'Long']] },
  { key: 'ink', label: 'Ink', options: [['quick', 'Quick'], ['normal', 'Soft'], ['slow', 'Slow']] },
  { key: 'hold', label: 'Hold', options: [['2s', '2s'], ['3s', '3s'], ['5s', '5s']] },
  { key: 'size', label: 'Size', options: [['s', 'S'], ['m', 'M'], ['l', 'L']] },
  { section: 'Sound', key: 'sound', label: 'Volume', options: [['off', 'Off'], ['soft', 'Soft'], ['medium', 'Med'], ['loud', 'Loud']] },
  { key: 'tone', label: 'Tone', options: [['deep', 'Deep'], ['normal', 'Normal'], ['bright', 'Bright']] },
];

const DEFAULTS: Settings = { speed: 'normal', numbers: 'all', linger: 'short', ink: 'normal', hold: '3s', size: 'm', sound: 'soft', tone: 'normal' };

/* Same schedule as TokenText: how long a line takes to type. */
const typingMs = (text: string, charMs: number, maxMs: number) => {
  const chars = Array.from(text);
  const per = Math.min(charMs, maxMs / Math.max(1, chars.length));
  return chars.reduce((t, ch) => t + per * (/[.:;?!]/.test(ch) ? 6 : ch === ',' ? 3 : 1), 0);
};

export default function TypeDemo() {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [bar, setBar] = useState(true);
  const [open, setOpen] = useState(false);
  const [heard, setHeard] = useState(false); // browsers allow sound only after a click or key
  const setRef = useRef<HTMLDivElement>(null);
  const [charMs, maxMs] = SPEED[s.speed];

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(t);
  }, []);

  // next line once this one has typed and held (plus the ~0.3s fade-out before it types)
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setI((n) => (n + 1) % LINES.length), 300 + typingMs(LINES[i], charMs, maxMs) + HOLD[s.hold]);
    return () => clearTimeout(t);
  }, [i, show, charMs, maxMs, s.hold]);

  // H hides the settings button for recording; Esc or a click outside closes the card.
  // Any click or key also switches the sound on.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      unlock(); setHeard(true);
      if (e.key === 'h' || e.key === 'H') { setBar((b) => !b); setOpen(false); }
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => { unlock(); setHeard(true); if (!setRef.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onDown); };
  }, []);

  return (
    <main className="td" style={{ '--td-scale': SIZE[s.size], '--td-ink': `${INK[s.ink]}ms` } as React.CSSProperties}>
      <TokenText
        className="td-text"
        text={LINES[i]}
        show={show}
        probs
        charMs={charMs}
        maxMs={maxMs}
        probEvery={NUMBERS[s.numbers]}
        probMs={LINGER[s.linger]}
        onChar={(ch, info) => tick(ch, info, { volume: SOUND[s.sound], tone: TONE[s.tone] })}
      />

      <div className="td-set" ref={setRef} data-hidden={!bar || undefined}>
        <div className="td-card" id="td-card" data-open={open || undefined} role="group" aria-label="Animation settings" inert={!open || !bar}>
          {GROUPS.map((g) => (
            <Fragment key={g.key}>
            {g.section && <div className="td-head">{g.section}</div>}
            <div className="td-row" role="group" aria-label={g.label}>
              <span className="td-label">{g.label}</span>
              <span className="td-opts">
                {g.options.map(([id, text], oi) => (
                  <Fragment key={id}>
                    {oi > 0 && <span className="td-sep" aria-hidden="true">·</span>}
                    <button type="button" aria-pressed={s[g.key] === id} onClick={() => setS((p) => ({ ...p, [g.key]: id }))}>{text}</button>
                  </Fragment>
                ))}
              </span>
            </div>
            </Fragment>
          ))}
        </div>
        <button type="button" className="td-toggle" aria-expanded={open} aria-controls="td-card" tabIndex={bar ? 0 : -1} onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Settings'}
        </button>
      </div>
      <p className="td-hint" data-hidden={!bar || undefined}>{heard || s.sound === 'off' ? 'Press H to hide' : 'Click anywhere for sound · H to hide'}</p>
    </main>
  );
}
