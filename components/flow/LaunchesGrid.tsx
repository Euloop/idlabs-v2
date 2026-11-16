'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PICTURED, RATIO_OF, type Launch } from './LaunchesCloud';

/* The launches as a draggable, endless grid (/home-2, Launches "Grid"; /launches), after cordia.studio:
   rows of tiles one height, each picture in its own proportions (16:9 mostly), in a regular rhythm, over a faint
   dotted ground that moves with them; soft fades at the top and bottom. Each block leaves an opening of empty cells holding one quiet line
   (2B+ views …); it moves with the grid.
   Drag (mouse, pen or touch) to pan in any direction, with a short glide after you let go; the pattern repeats without end.
   Each picture links to its X post; a drag is never a click. No glide with reduced motion. */

const TILE_H = 135; // every tile's height; its width follows its picture (16:9 → 240)
const ROW = TILE_H + 75; // row pitch (75 between rows)
const ROWS = 4, PER = 6; // one repeating block: 4 rows of 6 slots
const SLOT = 240, GAP = 100; // a slot (a 16:9 tile's width) and the gap between slots
const BW = PER * (SLOT + GAP); // the block's width, 2040 — wider than most screens: no picture twice in view

const PICTURED_FILE = (l: Launch) => `${l.client} ${l.what ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
type Tile = { l: Launch; src: string; x: number; y: number; w: number };
/* (feedback 2026-11-16: only the launches themselves — no video frames, no repeats) each launch once a block,
   in a fixed shuffled order, each tile in its picture's own proportions, centred in its slot. The opening in the
   middle two rows (as on cordia.studio, one quiet line) takes the two slots there in each: 24 − 4 = 20 slots, the
   twenty launches. */
const POOL = PICTURED.map((l, i) => ({ l, src: `/assets/launches/${PICTURED_FILE(l)}.webp`, ratio: RATIO_OF(l), k: Math.sin(i * 91.7 + 13.1) * 43758.5453 }))
  .sort((a, b) => (a.k - Math.floor(a.k)) - (b.k - Math.floor(b.k)));
const WIN_X0 = BW * 0.47, WIN_X1 = BW * 0.53, WIN_R0 = 1, WIN_R1 = 2;
const WIN_CX = BW / 2; // the opening's centre in the block
const WIN_CY = (WIN_R0 + 1) * ROW - (ROW - TILE_H) / 2; // the line sits in the gap between the opening's two rows
function buildBlock() {
  const tiles: Tile[] = [];
  let deal = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let i = 0; i < PER; i++) {
      const sx = GAP / 2 + i * (SLOT + GAP);
      if (r >= WIN_R0 && r <= WIN_R1 && sx + SLOT > WIN_X0 && sx < WIN_X1) continue; // the opening
      const pick = POOL[deal++ % POOL.length];
      const w = Math.round(TILE_H * pick.ratio);
      tiles.push({ l: pick.l, src: pick.src, x: sx + (SLOT - w) / 2, y: r * ROW, w });
    }
  }
  return { tiles, width: BW, height: ROWS * ROW };
}

// `onOpen` (/launches): a tile opens its launch (the video dialog) instead of the X post; `full`: the whole screen
export default function LaunchesGrid({ onOpen, full = false }: { onOpen?: (l: Launch) => void; full?: boolean } = {}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  /* scaled to the screen: a block (the twenty launches, each once) is always at least the view's width and height,
     so no picture is ever in view twice — big screens get slightly bigger tiles */
  const base = useMemo(buildBlock, []);
  const [f, setF] = useState(1);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => setF(Math.max(1, (stage.clientWidth + 40) / base.width, (stage.clientHeight + 40) / base.height));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [base]);
  const block = useMemo(() => ({ tiles: base.tiles.map((t) => ({ ...t, x: t.x * f, y: t.y * f, w: t.w * f })), width: base.width * f, height: base.height * f }), [base, f]);

  useEffect(() => {
    const stage = stageRef.current, plane = planeRef.current;
    if (!stage || !plane) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ox = stage.clientWidth / 2 - WIN_CX * f, oy = stage.clientHeight / 2 - WIN_CY * f; // the opening starts centred
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
  }, [block, f]);

  const copies = [[0, 0], [1, 0], [0, 1], [1, 1]]; // the block is larger than the view: 2 × 2 copies cover it
  return (
    <div className="lcg" ref={stageRef} data-full={full || undefined} aria-label="Launches — drag to look around">
      <div className="lcg-plane" ref={planeRef}>
        {copies.map(([cx, cy], ci) => (
          <p key={`line-${ci}`} className="lcg-line" aria-hidden={ci > 0 || undefined}
            style={{ left: WIN_CX * f + cx * block.width, top: WIN_CY * f + cy * block.height }}>
            2B+ views across the launches we’ve done for our clients
          </p>
        ))}
        {copies.map(([cx, cy], ci) => block.tiles.map((t, ti) => (
          <a key={`${ci}-${ti}`} className="lcg-tile" href={t.l.x} target="_blank" rel="noopener noreferrer" draggable={false}
            tabIndex={ci === 0 ? 0 : -1} aria-hidden={ci > 0 || undefined}
            aria-label={ci === 0 ? `${t.l.client}${t.l.what ? ` — ${t.l.what}` : ''}${onOpen ? ' — play the launch' : ' (opens in a new tab)'}` : undefined}
            onClick={onOpen ? (e) => { e.preventDefault(); onOpen(t.l); } : undefined}
            style={{ left: t.x + cx * block.width, top: t.y + cy * block.height, width: t.w, height: TILE_H * f }}>
            <img src={t.src} alt="" decoding="async" loading="lazy" draggable={false} />
          </a>
        )))}
      </div>
    </div>
  );
}

