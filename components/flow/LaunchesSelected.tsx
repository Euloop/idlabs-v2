'use client';

import { useRef, useState } from 'react';
import { LAUNCHES, slug, type Launch } from './LaunchesCloud';
import { LAUNCH_VIDEO } from './launch-videos';
import './launches-selected.css';

/* Launches "Selected" (/home-4, the client's pick, 2026-11-14): Float IV whose reel shows only these
   six, in this order (PICKS, Launches.tsx), then an end slide whose button goes to /launches. That
   page (LaunchesAll, below) shows every launch as a grid of 16:9 cards (picture; its video plays on
   hover), each linking to its X post. Statement in Season Mix, everything else in IBM Plex Mono. */

export const SELECTED = [
  'wispr-flow-feature-release',
  'pocket-fm-product-launch',
  'fish-audio-seed-raise',
  'playerzero',
  'matic-robots-design-documentary',
  'lovable-fundraise',
];
const BY_SLUG = new Map(LAUNCHES.map((l) => [slug(l), l]));
export const PICKS = SELECTED.map((s) => BY_SLUG.get(s)).filter((l): l is Launch => !!l);
// launches with no picture at all (Icon: its post is gone from X — 404 on 2026-11-16 — so no picture or video
// to take, and its card linked nowhere): left out of the list until they have one
const NO_IMAGE = new Set(['icon-launch']);
// every launch: the six first, then the rest in the list's order
const ALL = [...PICKS, ...LAUNCHES.filter((l) => !SELECTED.includes(slug(l)) && !NO_IMAGE.has(slug(l)))];
export const LAUNCH_COUNT = ALL.length;

// launches with a sharp picture in /assets/launches/hd; the rest use the small one; Icon has none
const HD = new Set(['airwallex-growth-story', 'akai', 'cartesia-fundraise-model-launch', 'deel-growth-story', 'fish-audio-seed-raise',
  'gamma-100m-arr-announcement', 'lovable-fundraise', 'matic-robots-design-documentary', 'matic-robots-launch', 'playerzero',
  'pocket-fm-product-launch', 'polyai-product-demo', 'wispr-flow-feature-release']);
const pad = (n: number) => String(n).padStart(2, '0');

function Card({ l, n }: { l: Launch; n: number }) {
  const s = slug(l);
  const video = LAUNCH_VIDEO[s];
  const [hot, setHot] = useState(false);
  const vref = useRef<HTMLVideoElement>(null);
  const on = () => { setHot(true); vref.current?.play().catch(() => {}); };
  const off = () => { setHot(false); vref.current?.pause(); };
  const label = `${l.client}${l.what ? ` — ${l.what}` : ''}${l.reach ? `, ${l.reach} views on X` : ''}`;
  const body = (
    <>
      <div className="lsel-media">
        {NO_IMAGE.has(s) ? (
          <span className="lsel-blank" aria-hidden="true">{l.client}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/assets/launches/${HD.has(s) ? 'hd/' : ''}${s}.webp`} alt="" loading="lazy" decoding="async" draggable={false} />
        )}
        {video && hot && (
          <video ref={vref} src={video} poster={`/assets/launches/hd/${s}.webp`} muted loop playsInline autoPlay preload="auto"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}
      </div>
      <div className="lsel-meta">
        <span className="lsel-n">{pad(n)}</span>
        <span className="lsel-name">
          <span className="lsel-client">{l.client}</span>
          {l.what && <span className="lsel-what">{l.what}</span>}
        </span>
        <span className="lsel-reach">{l.reach ? `${l.reach} views` : 'On X'}</span>
      </div>
    </>
  );
  return (
    <li className="lsel-item">
      {l.x ? (
        <a className="lsel-card" href={l.x} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}
          onPointerEnter={on} onPointerLeave={off} onFocus={on} onBlur={off}>{body}</a>
      ) : (
        <div className="lsel-card">{body}</div>
      )}
    </li>
  );
}

/** /launches: every launch. */
export default function LaunchesAll() {
  return (
    <div className="frame lc-frame lsel lsel-page">
      <header className="lsel-head">
        <p className="lsel-label">Launches · {pad(ALL.length)}</p>
        <h1 id="lc-title" className="lsel-title">Every launch we’ve done<br />for our clients.</h1>
        <p className="lsel-body">2B+ views in all. Each one links to its post on X.</p>
      </header>
      <ol className="lsel-grid">
        {ALL.map((l, i) => <Card key={slug(l)} l={l} n={i + 1} />)}
      </ol>
    </div>
  );
}
