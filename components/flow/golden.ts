/* The golden construction, as the hero and the loader draw it: squares cut from a golden rectangle in
   turn, each with a quarter arc, which together make the spiral. Coordinates in the caller's units. */

export const PHI = (1 + Math.sqrt(5)) / 2;

export type Square = { x: number; y: number; s: number };
export type Cuts = {
  squares: Square[];
  /** the dividing line after each cut */
  lines: string[];
  /** one quarter arc per square, each its own path (to draw them one by one) */
  arcs: string[];
  /** the whole spiral, one path */
  spiral: string;
  /** the same spiral drawn the other way: from the eye out (landscape only) */
  outward?: string;
};

const f = (n: number) => +n.toFixed(2);

/** Lying down (w > h): squares cut left, top, right, bottom — the spiral turns clockwise inward. */
export function landscapeCuts(x: number, y: number, w: number, h: number, n = 10): Cuts {
  const squares: Square[] = [], lines: string[] = [], arcs: string[] = [];
  const ends: { from: [number, number]; s: number }[] = [];
  let spiral = '', last: [number, number] = [x, y];
  for (let i = 0; i < n; i++) {
    const k = i % 4;
    const s = k % 2 === 0 ? h : w;
    let from: [number, number], to: [number, number];
    if (k === 0) { squares.push({ x, y, s }); from = [x, y + s]; to = [x + s, y]; x += s; w -= s; lines.push(`M${f(x)} ${f(y)}V${f(y + h)}`); }
    else if (k === 1) { squares.push({ x, y, s }); from = [x, y]; to = [x + s, y + s]; y += s; h -= s; lines.push(`M${f(x)} ${f(y)}H${f(x + w)}`); }
    else if (k === 2) { squares.push({ x: x + w - s, y, s }); from = [x + w, y]; to = [x + w - s, y + s]; w -= s; lines.push(`M${f(x + w)} ${f(y)}V${f(y + h)}`); }
    else { squares.push({ x, y: y + h - s, s }); from = [x + s, y + h]; to = [x, y + h - s]; h -= s; lines.push(`M${f(x)} ${f(y + h)}H${f(x + w)}`); }
    const a = `A${f(s)} ${f(s)} 0 0 1 ${f(to[0])} ${f(to[1])}`;
    arcs.push(`M${f(from[0])} ${f(from[1])}${a}`);
    spiral += i === 0 ? `M${f(from[0])} ${f(from[1])}${a}` : a;
    ends.push({ from, s });
    last = to;
  }
  const outward = `M${f(last[0])} ${f(last[1])}` + ends.reverse().map(({ from, s }) => `A${f(s)} ${f(s)} 0 0 0 ${f(from[0])} ${f(from[1])}`).join('');
  return { squares, lines, arcs, spiral, outward };
}

/** Standing up (h > w), as the loader's golden half (StartLoader.tsx): cut top, left, bottom, right. */
export function portraitCuts(x: number, y: number, w: number, h: number, n = 10): Cuts {
  const squares: Square[] = [], lines: string[] = [], arcs: string[] = [];
  let spiral = `M${f(x + w)} ${f(y)}`;
  let pen: [number, number] = [x + w, y];
  for (let i = 0; i < n; i++) {
    const k = i % 4;
    const s = k % 2 === 0 ? w : h;
    let to: [number, number];
    if (k === 0) { squares.push({ x, y, s }); to = [x, y + s]; y += s; h -= s; lines.push(`M${f(x)} ${f(y)}H${f(x + w)}`); }
    else if (k === 1) { squares.push({ x, y, s }); to = [x + s, y + s]; x += s; w -= s; lines.push(`M${f(x)} ${f(y)}V${f(y + h)}`); }
    else if (k === 2) { squares.push({ x, y: y + h - s, s }); to = [x + s, y + h - s]; h -= s; lines.push(`M${f(x)} ${f(y + h)}H${f(x + w)}`); }
    else { squares.push({ x: x + w - s, y, s }); to = [x + w - s, y]; w -= s; lines.push(`M${f(x + w)} ${f(y)}V${f(y + h)}`); }
    const a = `A${f(s)} ${f(s)} 0 0 0 ${f(to[0])} ${f(to[1])}`;
    arcs.push(`M${f(pen[0])} ${f(pen[1])}${a}`);
    spiral += a;
    pen = to;
  }
  return { squares, lines, arcs, spiral };
}
