'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

/* The reading list (/home-2 footer): books standing on a shelf, spines out. One book is pulled
   out and turned to show its cover (the first by default); hovering or focusing another turns
   that one out instead (after a short rest, see onPointerMove), and the rest close up. Each book is a CSS 3D box with hard edges (front
   cover, back, spine, page block), seen straight on at eye level, turned on its spine's centre (rotateY 90° = spine facing you, 28° =
   cover facing you with the spine at an angle). Covers and spines are our own typographic
   designs, not the publishers'. A tap or click pulls a book out too (touch screens have no
   hover); the books don't link anywhere yet. The shelf runs between the frame rules and sizes
   the books to fill it (--k); narrow screens: it scrolls sideways. */

type Book = {
  title: string;
  author: string;
  /** spine thickness, px */
  t: number;
  /** height, px */
  h: number;
  bg: string;
  ink: string;
  /** cover pattern */
  art: 'grid' | 'rings' | 'bars' | 'dots' | 'plain';
  /** binding material: the surface every face gets (footer.css) */
  mat: 'cloth' | 'linen' | 'paper' | 'leather' | 'gloss';
};

const BOOKS: Book[] = [
  { title: 'Contagious', author: 'Jonah Berger', t: 40, h: 286, bg: '#c2551e', ink: '#f6efe6', art: 'grid', mat: 'cloth' },
  { title: 'The Tipping Point', author: 'Malcolm Gladwell', t: 46, h: 300, bg: '#e9e5dc', ink: '#1f1f1f', art: 'rings', mat: 'linen' },
  { title: 'Hooked', author: 'Nir Eyal', t: 34, h: 270, bg: '#1b1c1f', ink: '#ebebeb', art: 'bars', mat: 'gloss' },
  { title: 'Influence', author: 'Robert Cialdini', t: 52, h: 292, bg: '#383f4c', ink: '#ebebeb', art: 'plain', mat: 'cloth' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', t: 58, h: 304, bg: '#cfcfcb', ink: '#1f1f1f', art: 'dots', mat: 'paper' },
  { title: 'The Attention Merchants', author: 'Tim Wu', t: 50, h: 296, bg: '#2f4a36', ink: '#e9e5dc', art: 'grid', mat: 'linen' },
  { title: 'Made to Stick', author: 'Chip Heath & Dan Heath', t: 38, h: 278, bg: '#8f8f8f', ink: '#1b1c1f', art: 'bars', mat: 'paper' },
  { title: 'Algorithms to Live By', author: 'Brian Christian & Tom Griffiths', t: 48, h: 290, bg: '#f2f0ea', ink: '#c2551e', art: 'rings', mat: 'cloth' },
  { title: 'Weapons of Math Destruction', author: 'Cathy O’Neil', t: 42, h: 282, bg: '#111214', ink: '#c2551e', art: 'dots', mat: 'leather' },
  { title: 'Breakthrough Advertising', author: 'Eugene Schwartz', t: 44, h: 298, bg: '#6b5a45', ink: '#f2ece0', art: 'plain', mat: 'leather' },
  { title: 'Ogilvy on Advertising', author: 'David Ogilvy', t: 40, h: 284, bg: '#dcd6c8', ink: '#2a2c31', art: 'grid', mat: 'linen' },
  { title: 'The Black Swan', author: 'Nassim Nicholas Taleb', t: 46, h: 294, bg: '#232427', ink: '#ebebeb', art: 'rings', mat: 'gloss' },
  { title: 'Superforecasting', author: 'Philip E. Tetlock', t: 44, h: 288, bg: '#b9b2a2', ink: '#1f1f1f', art: 'bars', mat: 'paper' },
  { title: 'The Signal and the Noise', author: 'Nate Silver', t: 50, h: 302, bg: '#1f2a3a', ink: '#d9d3c4', art: 'dots', mat: 'cloth' },
  { title: 'Positioning', author: 'Al Ries & Jack Trout', t: 36, h: 274, bg: '#e3dccd', ink: '#c2551e', art: 'plain', mat: 'paper' },
  { title: 'Everybody Lies', author: 'Seth Stephens-Davidowitz', t: 42, h: 290, bg: '#9a3f17', ink: '#f6efe6', art: 'rings', mat: 'linen' },
  { title: 'Scientific Advertising', author: 'Claude C. Hopkins', t: 30, h: 268, bg: '#2a2c31', ink: '#cfcfcb', art: 'grid', mat: 'leather' },
  { title: 'Trust Me, I’m Lying', author: 'Ryan Holiday', t: 40, h: 284, bg: '#f2f0ea', ink: '#111214', art: 'bars', mat: 'gloss' },
  { title: 'The Filter Bubble', author: 'Eli Pariser', t: 38, h: 280, bg: '#4a5560', ink: '#ebebeb', art: 'dots', mat: 'paper' },
  { title: 'Alchemy', author: 'Rory Sutherland', t: 46, h: 296, bg: '#c9a96a', ink: '#1f1f1f', art: 'rings', mat: 'cloth' },
  { title: 'Antifragile', author: 'Nassim Nicholas Taleb', t: 56, h: 306, bg: '#e9e5dc', ink: '#232427', art: 'grid', mat: 'linen' },
  { title: 'Range', author: 'David Epstein', t: 40, h: 282, bg: '#3d5a45', ink: '#e9e5dc', art: 'plain', mat: 'cloth' },
  { title: 'The Art of Statistics', author: 'David Spiegelhalter', t: 44, h: 292, bg: '#8f8f8f', ink: '#f2f0ea', art: 'dots', mat: 'paper' },
  { title: 'Never Split the Difference', author: 'Chris Voss', t: 42, h: 286, bg: '#16171a', ink: '#e9e5dc', art: 'bars', mat: 'leather' },
];

/* Book sizes are in "shelf px": the shelf scales them (--k) so the whole row, one book open,
   fills the shelf from rule to rule, never below KMIN (then it scrolls sideways). */
const W0 = 240; // cover width
const GAP = 6;
const PAD = 24; // each side
const KMIN = 0.72, KMAX = 1.4;
const SUM_T = BOOKS.reduce((a, b) => a + b.t, 0);
const OPEN_EXTRA = 0.883 * W0 + 10 - 0.265 * 44; // an average book opening adds this much width
const HOVER_MS = 110;

/* "il": every book bound in Identity Labs' colours instead of its own (the client: "have these
   books colour in IL"). The IL feel: dark browns, greys, black and old paper — an archive shelf.
   No bright accents. Darks carry the shelf; old-paper spines break it up. Titles are old paper on
   the darks and dark brown on the papers. Placed by hand so neighbours always part. */
export type ShelfPalette = 'classic' | 'il';
const IL: Record<string, [string, string]> = {
  espresso: ['#2b211a', '#e6dcc6'],
  brown: ['#3d2f24', '#d9cdb4'],
  walnut: ['#5a4535', '#e9e0cc'],
  umber: ['#6e5a48', '#efe7d6'],
  black: ['#141414', '#cfc6b4'],
  charcoal: ['#232325', '#bfb6a4'],
  slate: ['#4a4a48', '#e6e1d9'],
  grey: ['#7d7a74', '#1c1b19'],
  warmgrey: ['#a19a8f', '#241d17'],
  oldpaper: ['#e6dcc6', '#3d2f24'],
  aged: ['#d9ccb0', '#2b211a'],
  parchment: ['#efe7d6', '#5a4535'],
};
const IL_ORDER = [
  'espresso', 'oldpaper', 'black', 'walnut', 'slate', 'aged', 'brown', 'charcoal', 'parchment', 'umber', 'black', 'grey',
  'espresso', 'oldpaper', 'slate', 'walnut', 'warmgrey', 'black', 'aged', 'brown', 'charcoal', 'parchment', 'umber', 'black',
];
function colours(b: Book, i: number, palette: ShelfPalette) {
  if (palette !== 'il') return { bg: b.bg, ink: b.ink };
  const [bg, ink] = IL[IL_ORDER[i % IL_ORDER.length]];
  return { bg, ink };
}

export default function Bookshelf({ palette = 'il' }: { palette?: ShelfPalette } = {}) {
  const [open, setOpen] = useState(0);
  const ref = useRef<HTMLUListElement>(null);
  const hover = useRef({ timer: 0, x: NaN, y: NaN });

  /* Hover intent. Opening a book widens it and slides its neighbours along, so the book under a
     still cursor changes by itself; following that would flip books back and forth. So only real
     cursor movement counts, and a book opens once the cursor has rested on it for HOVER_MS: a
     sweep across the shelf doesn't flip every book, and layout moving under a still cursor
     changes nothing. */
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return; // touch: tap to open (onClick)
    const h = hover.current;
    if (e.clientX === h.x && e.clientY === h.y) return;
    h.x = e.clientX; h.y = e.clientY;
    const li = (e.target as Element).closest<HTMLElement>('.bs-book');
    const i = li ? Number(li.dataset.i) : -1;
    clearTimeout(h.timer);
    if (i >= 0 && i !== open) h.timer = window.setTimeout(() => setOpen(i), HOVER_MS);
  };
  const onPointerLeave = () => clearTimeout(hover.current.timer);
  useEffect(() => () => clearTimeout(hover.current.timer), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const avail = el.clientWidth - 2 * PAD - GAP * (BOOKS.length - 1) - 4; // 4: rounding headroom
      const k = Math.min(KMAX, Math.max(KMIN, avail / (SUM_T + OPEN_EXTRA)));
      el.style.setProperty('--k', k.toFixed(4));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <ul ref={ref} className="bs" aria-label="Reading list" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} style={{ '--w0': W0, '--gap': `${GAP}px`, '--pad': `${PAD}px` } as CSSProperties}>
      {BOOKS.map((b, i) => (
        <li
          key={b.title}
          className="bs-book"
          data-i={i}
          data-open={open === i || undefined}
          data-art={b.art}
          data-mat={b.mat}
          style={{ '--t0': b.t, '--h0': b.h, '--bg': colours(b, i, palette).bg, '--ink': colours(b, i, palette).ink } as CSSProperties}
        >
          <a href="#" className="bs-hit" onFocus={() => setOpen(i)} onClick={(e) => { e.preventDefault(); setOpen(i); }} aria-label={`${b.title} by ${b.author}`}>
            <span className="bs-box" aria-hidden="true">
              <span className="bs-face bs-cover">
                <span className="bs-c-author">{b.author}</span>
                <span className="bs-c-title">{b.title}</span>
                <span className="bs-c-foot"><span>Identity Labs</span><span>Reading list · {String(i + 1).padStart(2, '0')}</span></span>
              </span>
              <span className="bs-face bs-back" />
              <span className="bs-face bs-spine">
                <span className="bs-s-title">{b.title}</span>
                <span className="bs-s-author">{b.author.split(' & ')[0].split(' ').slice(-1)[0]}</span>
                <span className="bs-s-num">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <span className="bs-face bs-pages" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
