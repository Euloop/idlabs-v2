'use client';

import { useEffect, useMemo, useRef } from 'react';
import { PICTURED, RATIO_OF, type Launch } from './LaunchesCloud';

/* The launches as a draggable, endless grid (/home-2, Launches "Grid"), after cordia.studio:
   a strict grid — fixed column pitch, one tile height, even gaps — of wide (16:9) and tall (9:16)
   tiles (the tall ones a centred crop of the same pictures) in a regular rhythm, over a faint
   dotted ground that moves with them; soft fades at the top and bottom. Each block leaves an opening of empty cells holding one quiet line
   (2B+ views …); it moves with the grid.
   Drag (mouse, pen or touch) to pan in any direction, with a short glide after you let go; the pattern repeats without end.
   Each picture links to its X post; a drag is never a click. No glide with reduced motion. */

const COL = 150; // column pitch, px
const TILE_H = 135; // every tile's height (a wide tile is 16:9 at this height)
const WIDE = 240; // 16:9
const TALL = 76; // 9:16
const ROW = TILE_H + COL / 2; // row pitch: the gap equals a tall tile's width
const COLS = 21; // columns in one repeating block (three motifs)
const ROWS = 4; // rows in one repeating block

type Tile = { l: Launch; x: number; y: number; w: number };

/* One block: ROWS rows, every cell filled — no random gaps. Each row repeats one motif of wide
   (two columns) and tall (one column) tiles, shifted by two columns from the row above so the
   rows interlock instead of stacking; pictures are dealt in turn, offset per row. */
const MOTIF = ['W', 'T', 'W', 'T', 'T'] as const; // 7 columns
/* An opening in each block, as on cordia.studio: these cells stay empty and hold one quiet line. */
const WIN = { c0: 9, c1: 12, r0: 1, r1: 2 }; // as cordia.studio: an opening about three columns wide (with the tiles it displaces) across two rows
const inWindow = (r: number, col: number, cols: number) => r >= WIN.r0 && r <= WIN.r1 && col + cols - 1 >= WIN.c0 && col <= WIN.c1;
const WIN_CX = ((WIN.c0 + WIN.c1 + 1) / 2) * COL - (COL - TALL) / 2; // the opening's centre in the block
const WIN_CY = (WIN.r0 + 1) * ROW - (ROW - TILE_H) / 2; // the line sits in the gap between the opening's two rows
const MOTIF_COLS = 7;
function buildBlock() {
  const tiles: Tile[] = [];
  for (let r = 0; r < ROWS; r++) {
    const shift = (r * 2) % MOTIF_COLS;
    let c = -shift; // start before 0 so the shifted motif still fills the row from its left edge
    let deal = r * 5;
    while (c < COLS - shift) {
      for (const kind of MOTIF) {
        const cols = kind === 'W' ? 2 : 1;
        const col = ((c % COLS) + COLS) % COLS; // wrap into the block (the block repeats)
        if (inWindow(r, col, cols)) { c += cols; continue; }
        tiles.push({ l: PICTURED[deal++ % PICTURED.length], x: col * COL, y: r * ROW, w: kind === 'W' ? WIDE : TALL });
        c += cols;
      }
    }
  }
  return { tiles, width: COLS * COL, height: ROWS * ROW };
}

export default function LaunchesGrid() {
  const stageRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const block = useMemo(buildBlock, []);

  useEffect(() => {
    const stage = stageRef.current, plane = planeRef.current;
    if (!stage || !plane) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ox = stage.clientWidth / 2 - WIN_CX, oy = stage.clientHeight / 2 - WIN_CY; // the opening starts centred
    let vx = 0, vy = 0;
    let dragging = false, moved = 0, lx = 0, ly = 0, lt = 0;
    let raf = 0;
    const place = () => {
      // keep the offset within one block: the 2 × 2 copies of the block then always cover the view
      const px = ((ox % block.width) + block.width) % block.width - block.width;
      const py = ((oy % block.height) + block.height) % block.height - block.height;
      plane.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      stage.style.backgroundPosition = `${px.toFixed(1)}px ${py.toFixed(1)}px`;
    };
    const glide = () => {
      raf = 0;
      if (dragging || reduce) return;
      vx *= 0.92; vy *= 0.92;
      ox += vx; oy += vy;
      place();
      if (Math.abs(vx) + Math.abs(vy) > 0.15) raf = requestAnimationFrame(glide);
    };
    const down = (e: PointerEvent) => {
      dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; lt = performance.now(); vx = vy = 0;
      cancelAnimationFrame(raf); raf = 0;
      // the pointer is captured only once it really drags (below), so a plain click reaches the link
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly, now = performance.now(), dt = Math.max(1, now - lt);
      ox += dx; oy += dy; moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6 && !stage.hasPointerCapture(e.pointerId)) { stage.setPointerCapture(e.pointerId); stage.dataset.dragging = ''; }
      vx = (dx / dt) * 16; vy = (dy / dt) * 16; // px per frame
      lx = e.clientX; ly = e.clientY; lt = now;
      place();
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete stage.dataset.dragging;
      try { stage.releasePointerCapture(e.pointerId); } catch {}
      if (performance.now() - lt > 80) { vx = vy = 0; } // held still before letting go: no glide
      raf = requestAnimationFrame(glide);
    };
    // a drag is not a click
    const click = (e: MouseEvent) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } };
    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    stage.addEventListener('click', click, true);
    place();
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', down); stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerup', up); stage.removeEventListener('pointercancel', up);
      stage.removeEventListener('click', click, true);
    };
  }, [block]);

  const copies = [[0, 0], [1, 0], [0, 1], [1, 1]]; // the block is larger than the view: 2 × 2 copies cover it
  return (
    <div className="lcg" ref={stageRef} aria-label="Launches — drag to look around">
      <div className="lcg-plane" ref={planeRef}>
        {copies.map(([cx, cy], ci) => (
          <p key={`line-${ci}`} className="lcg-line" aria-hidden={ci > 0 || undefined}
            style={{ left: WIN_CX + cx * block.width, top: WIN_CY + cy * block.height }}>
            2B+ views across the launches we’ve done for our clients
          </p>
        ))}
        {copies.map(([cx, cy], ci) => block.tiles.map((t, ti) => (
          <a key={`${ci}-${ti}`} className="lcg-tile" href={t.l.x} target="_blank" rel="noopener noreferrer" draggable={false}
            tabIndex={ci === 0 ? 0 : -1} aria-hidden={ci > 0 || undefined}
            aria-label={ci === 0 ? `${t.l.client}${t.l.what ? ` — ${t.l.what}` : ''} (opens in a new tab)` : undefined}
            style={{ left: t.x + cx * block.width, top: t.y + cy * block.height, width: t.w, height: TILE_H }}>
            <img src={`/assets/launches/${PICTURED_FILE(t.l)}.webp`} alt="" decoding="async" loading="lazy" draggable={false} />
          </a>
        )))}
      </div>
    </div>
  );
}

const PICTURED_FILE = (l: Launch) => `${l.client} ${l.what ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
