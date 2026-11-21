'use client';

import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';

/* /home-4 tools "Research live" (ToolsCollage `research`): the ground under the glass card — six
   terminal panes of research running at once (the data coming in, the classifier training, the
   weights derived, a velocity curve fitted, the audience clustered, the model evaluated), typed in.
   `set(p)` (0…1, from the section's scroll) types each pane's script, the panes a little apart; once
   a pane's script is done it carries on live, a line at a time, while it is on screen. The ingest
   pane is live from the start. Scrolling back un-types it. Everything is made up but plausible, and
   the same on every load (a seeded generator). Drawn by writing each pane's text straight into the
   DOM — no React render per character. */

export type ResearchTerminalHandle = { set: (p: number) => void };

/* `scatter` ("Research scatter", feedback 2026-11-16, after a printed-poster reference): no grid
   rules, no box — the eight pieces loose on four columns that run the frame's whole width, edge to
   edge, staggered up and down (a piece may overlap the next a little), each under a small caps label;
   two archival portraits redrawn in characters (a typewriter halftone, printed row by row, then
   flickering) in their own room. In the site's grey ink, not black. Positions in % of the 16:9 box. */
type Box = { l: number; t: number; w: number; h: number };
const C = [0, 25.6, 51.3, 77]; // the columns' left edges; each 23 wide, the last ending on the right edge
const SCATTER: Box[] = [
  { l: C[0], t: 0, w: 23, h: 31 },  // 01 ingest
  { l: C[1], t: 4, w: 23, h: 27 },  // 02 net
  { l: C[2], t: 0, w: 23, h: 35 },  // 03 classifier
  { l: C[1], t: 37, w: 23, h: 29 }, // 04 weights
  { l: C[0], t: 64, w: 23, h: 36 }, // 05 velocity
  { l: C[3], t: 2, w: 23, h: 30 },  // 06 graph
  { l: C[3], t: 56, w: 23, h: 44 }, // 07 clusters
  { l: C[1], t: 72, w: 23, h: 28 }, // 08 eval
];
// the portraits in characters: the image, where, and how many columns (filling the column's width)
const ASCII: { src: string; b: Box; cols: number }[] = [
  { src: '/assets/loader/reel/turing.webp', b: { l: C[0], t: 34, w: 23, h: 28 }, cols: 66 },
];
// the two pieces only the scatter has, filling its gaps: 09 the loss curve (canvas), 10 attention (characters)
const EXTRA: Box[] = [
  { l: C[2], t: 59, w: 23, h: 41 }, // 11 field map
  { l: C[2], t: 38, w: 23, h: 17 }, // 09 loss
  { l: C[3], t: 35, w: 23, h: 18 }, // 10 attention
];
const RAMP = ' .:-=+*#%@';
const at = (b: Box) => ({ left: `${b.l}%`, top: `${b.t}%`, width: `${b.w}%`, height: `${b.h}%` });

// a small seeded generator, so the numbers are the same every time
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n0 = (x: number) => Math.round(x).toLocaleString('en-US');
const f = (x: number, d = 3) => x.toFixed(d);
const sg = (x: number, d = 4) => (x >= 0 ? ' ' : '-') + Math.abs(x).toFixed(d);
const pad = (s: string | number, w: number) => String(s).padStart(w);
const bar = (x: number, w = 10) => '▇'.repeat(Math.round(x * w)) + '░'.repeat(w - Math.round(x * w));
const SPARK = '▁▂▃▄▅▆▇█';

type Pane = { title: string; sub: string; script: string[]; more: (i: number) => string; speed: number; start: number; always?: boolean };

function panes(): Pane[] {
  const r = rng(20261116);
  const id = () => String(18_400_000 + Math.floor(r() * 99_999)).padStart(8, '0');

  // 01 the data coming in, live from the start
  let clock = 4 * 60 + 31.208;
  const ingest: Pane = {
    title: '01 / Ingest', sub: 'x · linkedin', speed: 70, start: 0, always: true,
    script: ['$ stream --sources x,li --window 30s', 'connected  x.firehose   shards 0–63', 'connected  li.feed      shards 0–15', 'buffer 2,048 · checkpoint every 10s'],
    more: () => {
      clock += 0.12 + r() * 0.5;
      const m = Math.floor(clock / 60) % 60, s = clock % 60;
      const ratio = r() < 0.12 ? 2 + r() * 9 : 0.3 + r() * 1.4;
      return `${pad(m, 2).replace(' ', '0')}:${s.toFixed(3).padStart(6, '0')} ${r() < 0.7 ? 'x ' : 'li'} #${id()} v ${pad(n0(2_000 + r() * 180_000), 7)} ${ratio >= 2 ? '▲' : ' '}${f(ratio, 2)}×`;
    },
  };

  // 02 the classifier training
  const train: string[] = ['$ python train.py --model clf-v7 \\', '    --window 15m --target viral@30m', 'loading engagements … 2,184,092,417 ok', 'features: rate_15m Δrate new_aud', '          author_infl cluster_H  (5)', 'split 80/10/10 · seed 7', ''];
  let loss = 0.693, auc = 0.61;
  for (let e = 1; e <= 24; e++) {
    loss *= 0.9 - r() * 0.03; auc += (0.945 - auc) * (0.2 + r() * 0.08);
    train.push(`ep ${pad(e, 2).replace(' ', '0')}/24 loss ${f(loss, 4)} auc ${f(auc)} lr ${e < 16 ? '3.0e-4' : '1.0e-4'}`);
  }
  train.push('', `✓ clf-v7  auc ${f(auc)}  ECE 0.018`, '✓ saved clf-v7.ckpt  (41.2 MB)');
  const classifier: Pane = {
    title: '02 / Classifier', sub: 'train · viral@30m', speed: 34, start: 0.04, script: train,
    more: () => {
      const b = 12 + r() * 60, now = b * (0.4 + r() * 1.8), p = Math.min(0.99, Math.max(0.01, (now / b - 0.6) / 1.4));
      return `#${id()} ${pad(f(b, 0), 2)}→${pad(f(now, 0), 3)}/min p ${f(p, 2)} ${p > 0.66 ? 'VIRAL' : p > 0.4 ? 'EMERGING' : 'flat'}`;
    },
  };

  // 03 the weights, derived and fitted
  const w: string[] = [
    '# weighted engagement', '', 'w(e) = a(type) · σ(β·log(1+I(u))) · c(k)', '',
    'a = { like 1.0, reply 2.4,', '      repost 3.1, quote 4.6 }', 'I(u) = PageRank(G_follow, d=0.85)[u]', '',
    'S(p) = Σ w(e) / Σ w(ē)     e ∈ E(p)', '', '∂L/∂β = Σ (ŷ − y) · σ′(·) · log(1+I)', 'β ← β − η · ∂L/∂β        η = 0.01', '',
  ];
  let beta = 0.6, L = 0.91;
  for (let i = 1; i <= 14; i++) { beta += (1.84 - beta) * 0.32; L = 0.21 + (L - 0.21) * 0.62; w.push(`it ${pad(i * 10, 3).replace(/ /g, '0')}  β ${f(beta, 4)}  L ${f(L, 4)}`); }
  w.push('', '✓ converged  β = 1.8412  R² 0.874');
  let wi = 0;
  const weights: Pane = {
    title: '03 / Weights', sub: 'derivation · fit', speed: 30, start: 0.08, script: w,
    more: () => {
      wi++;
      const kinds = ['like ', 'reply', 'repost', 'quote'], k = Math.floor(r() * 4), I = r() * 98;
      const ww = [1, 2.4, 3.1, 4.6][k] * (1 / (1 + Math.exp(-1.8412 * Math.log(1 + I) / 3)));
      return `@u${pad(wi * 37 % 9973, 4)} ${kinds[k].padEnd(6)} I ${pad(f(I, 1), 4)} w ${f(ww, 3)}`;
    },
  };

  // 04 velocity, a curve fitted to one post's views
  const vel: string[] = ['v(t) = V∞ · (1 − e^(−λt))^κ', '', '$ fit --post #18492207 --every 30s', ''];
  const Vinf = 2_410_000, lam = 0.0213, kap = 1.62;
  const vt = (t: number) => Vinf * Math.pow(1 - Math.exp(-lam * t), kap);
  for (let t = 2; t <= 42; t += 4) {
    const v = vt(t), vh = v * (1 + (r() - 0.5) * 0.004);
    vel.push(`t +${pad(t, 2)}m  v ${pad(n0(v), 9)}  v̂ ${pad(n0(vh), 9)}`);
  }
  vel.push('', `λ ${lam} /min  κ ${kap}  V∞ 2.41M`, 'τ90 shelf-life 31.4h  ×11.5 median', `${Array.from({ length: 24 }, (_, i) => SPARK[Math.min(7, Math.floor((vt(i * 2 + 1) / vt(48)) * 8))]).join('')}`);
  let vtm = 42;
  const velocity: Pane = {
    title: '04 / Velocity', sub: 'curve fit · live', speed: 26, start: 0.12, script: vel,
    more: () => { vtm += 0.5; const v = vt(vtm); return `t +${f(vtm, 1)}m v ${n0(v * (1 + (r() - 0.5) * 0.003))} ε ${f(r() * 0.2, 2)}%`; },
  };

  // 05 the audience embedded and clustered
  const cl: string[] = ['$ embed --model e5-large --dim 1024', '    audience.parquet'];
  for (let k = 1; k <= 8; k++) cl.push(`[${'█'.repeat(k * 2)}${'░'.repeat(16 - k * 2)}] ${pad(k * 12.5, 4)}%  ${f(k * 0.2025, 2)}M`);
  cl.push('', '$ kmeans k=24 --init k++');
  let inert = 3.912e6;
  for (let it = 1; it <= 9; it++) { const d = 0.4 / it; inert *= 1 - d * 0.6; cl.push(`iter ${pad(it, 2).replace(' ', '0')}  inertia ${inert.toExponential(3)}  Δ −${f(d * 60, 2)}%`); }
  cl.push('silhouette 0.412  davies-bouldin 0.87', '');
  const NAMES = ['founders', 'vcs', 'ml-eng', 'design', 'growth', 'crypto', 'devtools', 'media', 'policy', 'biotech'];
  NAMES.slice(0, 6).forEach((nm, i) => { const p = 0.2 + r() * 0.7; cl.push(`c${pad(i * 3 + 2, 2).replace(' ', '0')} ${nm.padEnd(9)} ${bar(p)} ${f(p, 2)}`); });
  const clusters: Pane = {
    title: '05 / Clusters', sub: 'embed · k-means', speed: 30, start: 0.16, script: cl,
    more: () => { const nm = NAMES[Math.floor(r() * NAMES.length)], p = r(); return `#${id()} → ${nm.padEnd(9)} ${bar(p, 8)} +${f(p * 4, 1)}%`; },
  };

  // 06 the model evaluated: a tensor, attention, a confusion matrix
  const ev: string[] = ['>>> h = model.encode(batch)[11]', 'tensor([['];
  for (let i = 0; i < 6; i++) ev.push(`  ${[0, 1, 2, 3].map(() => sg((r() - 0.5) * 2.6)).join(',')}${i === 5 ? ']])' : ','}`);
  ev.push('', 'attn head 3 · layer 11 · max 0.884', '', '         pred:viral  pred:not', 'viral         1,912       118', 'not             203    41,882', '', 'precision 0.904  recall 0.942', 'f1 0.923  n 44,115');
  const evaluation: Pane = {
    title: '06 / Eval', sub: 'holdout · 44k posts', speed: 32, start: 0.2, script: ev,
    more: (i) => (i % 5 === 4 ? `batch ${pad(i + 1, 3)}  auc ${f(0.93 + r() * 0.02)}  ok` : ` ${[0, 1, 2, 3].map(() => sg((r() - 0.5) * 2.6)).join(',')}`),
  };

  return [ingest, classifier, weights, velocity, clusters, evaluation];
}

const MORE = 600; // live lines prepared per pane (it wraps round after)
type Built = { p: Pane; lines: string[]; at: number[]; scripted: number };
function build(): Built[] {
  return panes().map((p) => {
    const lines = [...p.script, ...Array.from({ length: MORE }, (_, i) => p.more(i))];
    const at: number[] = [];
    let c = 0;
    for (const l of lines) { at.push(c); c += l.length + 1; }
    at.push(c);
    return { p, lines, at, scripted: at[p.script.length] };
  });
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// a line's look (black on white): commands and results heavier, comments grey, hot lines inverted
function paint(l: string) {
  const cls = /^(\$|>>>)/.test(l) ? 'rt-cmd' : l.startsWith('✓') ? 'rt-ok' : l.startsWith('#') ? 'rt-dim' : /▲|VIRAL/.test(l) ? 'rt-hot' : '';
  const body = esc(l).replace(/(^|[^\w#@])(-?\d[\d.,]*(?:e[+-]?\d+)?)/g, '$1<i>$2</i>');
  return cls ? `<span class="${cls}">${body}</span>` : body;
}

/* The two moving panes, drawn on canvas every frame, fast: a neural network firing (activations
   running forward layer to layer, the nodes flickering on and off) and a follow graph with a post
   spreading through it (a wave out from one account, cluster to cluster, then the next). `k`: how much
   of it is built (0…1, by the scroll), `t`: seconds. Black on white, as the text. */
type Viz = { title: string; sub: string; start: number; draw: (c: CanvasRenderingContext2D, w: number, h: number, t: number, k: number, ink: (a: number) => string) => void };
const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

function neural(): Viz {
  const L = [6, 9, 9, 7, 3];
  return {
    title: 'Net', sub: 'mlp · forward pass', start: 0.06,
    draw(c, w, h, t, k, ink) {
      const px = (i: number) => 30 + (i / (L.length - 1)) * (w - 64);
      const py = (i: number, j: number) => h / 2 + (j - (L[i] - 1) / 2) * Math.min(18, (h - 30) / (L[i] - 1 || 1));
      const shown = k * L.length; // layers in, left to right
      const tick = Math.floor(t * 9); // 9 steps a second
      const front = (t * 3.2) % (L.length + 0.6); // the activation running forward
      c.lineWidth = 0.6;
      for (let i = 0; i < L.length - 1; i++) {
        if (i + 1 > shown) break;
        for (let a = 0; a < L[i]; a++) for (let b = 0; b < L[i + 1]; b++) {
          const wgt = hash(i * 31 + a, b);
          const hot = front > i && front < i + 1.4 && wgt > 0.72;
          c.strokeStyle = hot ? ink(0.75) : ink(0.05 + wgt * 0.1);
          c.beginPath(); c.moveTo(px(i), py(i, a)); c.lineTo(px(i + 1), py(i + 1, b)); c.stroke();
          if (hot) { // the signal itself, a dot on its way along the edge
            const u = Math.min(1, (front - i) / 1.2);
            c.fillStyle = ink(1); c.fillRect(px(i) + (px(i + 1) - px(i)) * u - 1, py(i, a) + (py(i + 1, b) - py(i, a)) * u - 1, 2, 2);
          }
        }
      }
      for (let i = 0; i < L.length; i++) {
        if (i + 0.5 > shown) break;
        for (let j = 0; j < L[i]; j++) {
          const on = hash(i * 13 + j, tick) > (front > i ? 0.35 : 0.8);
          c.beginPath(); c.arc(px(i), py(i, j), 3.2, 0, Math.PI * 2);
          c.fillStyle = on ? ink(1) : '#fff'; c.fill(); c.strokeStyle = ink(1); c.lineWidth = 0.8; c.stroke();
        }
      }
      if (k >= 1) {
        c.fillStyle = ink(1); c.font = '9px ui-monospace, monospace';
        c.fillText(`step ${n0(18_204 + tick * 3)}  loss ${(0.2107 + 0.004 * Math.sin(t * 7)).toFixed(4)}`, 6, h - 6);
        // the layers named, with their sizes; the output's probabilities live beside its nodes
        c.font = '7px ui-monospace, monospace'; c.fillStyle = ink(0.55); c.textAlign = 'center';
        ['x ∈ R6', 'h1 relu', 'h2 relu', 'h3 relu', 'ŷ softmax'].forEach((lab, i) => c.fillText(lab, px(i), py(i, 0) - 9));
        c.textAlign = 'left'; c.fillStyle = ink(0.8);
        const raw = [0, 1, 2].map((j) => Math.exp(1.6 * Math.sin(t * 2.1 + j * 2.3) + (j === 0 ? 1 : 0)));
        const sum = raw.reduce((a, b) => a + b, 0);
        raw.forEach((v, j) => c.fillText((v / sum).toFixed(2), px(L.length - 1) + 7, py(L.length - 1, j) + 2.5));
        c.fillStyle = ink(0.55);
        for (let j = 0; j < L[0]; j++) c.fillText(sg(Math.sin(t * 3 + j * 1.7) * 1.4, 2), 0, py(0, j) + 2.5);
      }
    },
  };
}

function loss(): Viz {
  // train and validation loss over training steps; a run draws across in 2.4s, then the next (a new seed)
  return {
    title: 'Loss', sub: 'train · val', start: 0.3,
    draw(c, w, h, t, k, ink) {
      const run = Math.floor(t / 2.4), u = k < 1 ? k : (t % 2.4) / 2.4;
      const N = 90, top = 6, bot = h - 16;
      const y = (v: number) => bot - (bot - top) * Math.min(1, v / 0.75);
      const tr = (i: number) => 0.08 + 0.62 * Math.exp(-i / 18) + 0.02 * Math.sin(i * 1.7 + run) + 0.015 * hash(i, run);
      const va = (i: number) => tr(i) + 0.03 + 0.05 * Math.max(0, (i - 55) / 35) ** 2;
      c.lineWidth = 0.6; c.strokeStyle = ink(0.15);
      for (let g = 0; g <= 3; g++) { const gy = top + ((bot - top) * g) / 3; c.beginPath(); c.moveTo(0, gy + 0.5); c.lineTo(w, gy + 0.5); c.stroke(); }
      const n = Math.max(2, Math.floor(u * N));
      const line = (f: (i: number) => number, a: number, dash: number[]) => {
        c.setLineDash(dash); c.strokeStyle = ink(a); c.lineWidth = 1; c.beginPath();
        for (let i = 0; i < n; i++) { const X = (i / (N - 1)) * w; if (i) c.lineTo(X, y(f(i))); else c.moveTo(X, y(f(i))); }
        c.stroke(); c.setLineDash([]);
      };
      line(va, 0.45, [3, 2]); line(tr, 0.9, []);
      const X = ((n - 1) / (N - 1)) * w;
      c.fillStyle = ink(1); c.fillRect(X - 1.5, y(tr(n - 1)) - 1.5, 3, 3);
      c.font = '9px ui-monospace, monospace';
      c.fillText(`step ${n0((n - 1) * 250)}  train ${tr(n - 1).toFixed(4)}  val ${va(n - 1).toFixed(4)}`, 0, h - 3);
    },
  };
}

function graph(): Viz {
  const r = rng(7);
  const C = [[0.22, 0.3], [0.72, 0.26], [0.3, 0.74], [0.76, 0.7], [0.5, 0.5]];
  const N = 56;
  const nodes = Array.from({ length: N }, (_, i) => {
    const cc = C[i % C.length];
    return { x: cc[0] + (r() - 0.5) * 0.3, y: cc[1] + (r() - 0.5) * 0.3, c: i % C.length, ph: r() * 6.28 };
  });
  const edges: [number, number][] = [];
  nodes.forEach((a, i) => {
    const near = nodes.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2] as const).filter(([j]) => j !== i).sort((p, q) => p[1] - q[1]);
    edges.push([i, near[0][0]], [i, near[1][0]]);
    if (r() < 0.12) edges.push([i, Math.floor(r() * N)]); // a bridge to another cluster
  });
  const adj = nodes.map(() => [] as number[]);
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const depth = (src: number) => { const d = nodes.map(() => 99); d[src] = 0; const q = [src]; while (q.length) { const a = q.shift()!; for (const b of adj[a]) if (d[b] > d[a] + 1) { d[b] = d[a] + 1; q.push(b); } } return d; };
  let wave = -1, D: number[] = [];
  return {
    title: 'Graph', sub: 'spread · follow graph', start: 0.14,
    draw(c, w, h, t, k, ink) {
      const cyc = Math.floor(t / 1.6); // a new post every 1.6s
      if (cyc !== wave) { wave = cyc; D = depth(Math.floor(hash(cyc, 3) * N)); }
      const front = ((t % 1.6) / 1.6) * 9; // the wave, hop by hop
      const shown = Math.floor(k * N);
      const P = nodes.map((n) => [10 + (n.x + Math.sin(t * 1.3 + n.ph) * 0.008) * (w - 20), 10 + (n.y + Math.cos(t * 1.1 + n.ph) * 0.008) * (h - 26)]);
      c.lineWidth = 0.6;
      for (const [a, b] of edges) {
        if (a >= shown || b >= shown) continue;
        const lit = k >= 1 && D[a] <= front && D[b] <= front;
        c.strokeStyle = lit ? ink(0.7) : ink(0.12);
        c.beginPath(); c.moveTo(P[a][0], P[a][1]); c.lineTo(P[b][0], P[b][1]); c.stroke();
      }
      for (let i = 0; i < shown; i++) {
        const lit = k >= 1 && D[i] <= front, edge = lit && D[i] > front - 1;
        c.beginPath(); c.arc(P[i][0], P[i][1], edge ? 4 : 2.6, 0, Math.PI * 2);
        c.fillStyle = lit ? ink(1) : '#fff'; c.fill(); c.strokeStyle = ink(1); c.lineWidth = 0.8; c.stroke();
      }
      if (k >= 1) {
        const reached = D.filter((d) => d <= front).length;
        c.fillStyle = ink(1); c.font = '9px ui-monospace, monospace';
        c.fillText(`post #${18_492_207 + wave}  reach ${reached}/${N}  hop ${Math.min(8, Math.floor(front))}`, 6, h - 6);
        // the hop ring: a dashed circle opening from the source as the wave goes out, the source crossed,
        // and the accounts at the front named
        const src = D.indexOf(0);
        if (src >= 0) {
          const [sx, sy] = P[src];
          c.setLineDash([3, 3]); c.strokeStyle = ink(0.35); c.lineWidth = 0.7;
          c.beginPath(); c.arc(sx, sy, 6 + front * Math.min(w, h) * 0.07, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
          c.strokeStyle = ink(1); c.lineWidth = 1.2; c.beginPath(); c.moveTo(sx - 7, sy); c.lineTo(sx + 7, sy); c.moveTo(sx, sy - 7); c.lineTo(sx, sy + 7); c.stroke();
          c.font = '7px ui-monospace, monospace'; c.fillStyle = ink(0.7);
          D.forEach((d, i) => { if (d <= front && d > front - 1 && i % 2 === 0) c.fillText(`@u${(i * 379) % 9973}`, P[i][0] + 6, P[i][1] - 4); });
        }
      }
    },
  };
}

/* 11 / Field map (the scatter, feedback 2026-11-16, after a site-plan reference): a small survey drawing
   in its own room — contour rings round a peak, a stippled field, a dashed guide and axis, a dashed target
   with a bold cross, spot values, bold corner brackets round a region of interest. Its parts fade in with
   the scroll (--rt-p, set by the draw loop). Plus registration crosses in the empty gutters between the
   columns, where they touch nothing. */
const fade = (from: number) => ({ opacity: `clamp(0, calc((var(--rt-p, 1) - ${from}) * 5), 1)` });
function contour(cx: number, cy: number, r: number, i: number) {
  const pts: string[] = [];
  for (let a = 0; a <= 64; a++) {
    const th = (a / 64) * Math.PI * 2;
    const rr = r * (1 + 0.13 * Math.sin(3 * th + i * 0.7) + 0.07 * Math.sin(5 * th - i) + 0.04 * Math.sin(9 * th + i * 1.3));
    pts.push(`${a ? 'L' : 'M'}${(cx + rr * Math.cos(th) * 1.25).toFixed(1)} ${(cy + rr * Math.sin(th)).toFixed(1)}`);
  }
  return pts.join('') + 'Z';
}
const cross = (x: number, y: number, s = 7) => `M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}`;
function FieldMap() {
  const spots: [number, number, string][] = [[52, 70, '360'], [300, 92, '0.874'], [60, 300, '288'], [296, 318, '2.41M']];
  const bl = 24, bt = 40, br = 376, bb = 350, arm = 26;
  return (
    <svg className="rt-plan" viewBox="0 0 400 380" preserveAspectRatio="xMinYMin meet" aria-hidden="true">
      <defs><pattern id="rt-dots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.9" /></pattern></defs>
      <path className="rt-plan-dots" style={fade(0.3)} d="M230 40C320 30 390 90 380 170C372 240 300 250 250 210C200 170 170 60 230 40Z" />
      <g className="rt-plan-contour" style={fade(0.35)}>
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={contour(150, 230, 14 + i * 15, i)} />)}
      </g>
      <g className="rt-plan-guide" style={fade(0.4)}>
        <path d="M0 196H400" /><path d="M0 20L400 370" />
        <text x="4" y="190">baseline · 15m</text>
      </g>
      <g className="rt-plan-mark" style={fade(0.45)}>
        {spots.map(([x, y, t]) => <g key={t}><circle cx={x} cy={y} r="4" /><path d={cross(x, y, 6)} /><text x={x + 9} y={y + 4}>{t}</text></g>)}
      </g>
      <g className="rt-plan-target" style={fade(0.55)}>
        <circle cx="262" cy="150" r="42" /><path className="rt-plan-bold" d={cross(262, 150, 11)} />
      </g>
      <g className="rt-plan-bracket" style={fade(0.65)}>
        <path d={`M${bl + arm} ${bt}H${bl}V${bb}H${bl + arm}M${br - arm} ${bt}H${br}V${bb}H${br - arm}`} />
        <text x={br} y={bb + 20} textAnchor="end">region of interest</text>
      </g>
    </svg>
  );
}
// the gutters' crosses: in % of the box, each centred in a gap between two columns
const GUTTER: [number, number][] = [[24.3, 18], [24.3, 62], [49.95, 34], [49.95, 92], [75.65, 8], [75.65, 52]];
function Gutters() {
  return (
    <svg className="rt-gutters" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" style={fade(0.2)}>
      {GUTTER.map(([x, y]) => <path key={`${x}-${y}`} d={`M${x * 10 - 8} ${y * 10}H${x * 10 + 8}M${x * 10} ${y * 10 - 14}V${y * 10 + 14}`} vectorEffect="non-scaling-stroke" />)}
    </svg>
  );
}

// the panes' titles, built once on first use
let headsCache: { heads: { title: string; sub: string }[]; vheads: { title: string; sub: string }[] } | null = null;
const HEADS = () => (headsCache ??= { heads: panes().map(({ title, sub }) => ({ title, sub })), vheads: [neural(), graph()].map(({ title, sub }) => ({ title, sub })) });

// the grid, left to right then down (4 × 2): text panes and the two moving ones
const ORDER: ({ t: number } | { v: number })[] = [{ t: 0 }, { v: 0 }, { t: 1 }, { t: 2 }, { t: 3 }, { v: 1 }, { t: 4 }, { t: 5 }];

/* `sequence` ("Research sequence", feedback 2026-11-16): the scatter's pieces shown one at a time in the
   middle of the frame, each typing or moving while it is up, then a quick cut to the next — at its own
   size, no zoom (feedback 2026-11-16). After the last the whole scatter simply appears. By the scroll (p): the pieces share
   0–SEQ_END, the settle runs SEQ_END–1. SEQ: the order, by key (o: ORDER's, a: a portrait, e: EXTRA's). */
const SEQ = ['o0', 'o1', 'o2', 'o3', 'o4', 'a0', 'o5', 'o6', 'o7', 'e1', 'e2', 'e0'];
// the run's clock: SEQ_STEP s a piece, then SEQ_SETTLE s for the scatter to build in (a piece every
// SETTLE_GAP s, each fading up over SETTLE_FADE s); SEQ_END is where the pieces end on it
// (shortened 2026-11-17, feedback: 0.35 / 1.4 / 0.06 / 0.6 before — 5.6s in all, now 2.4s; the last piece's
// fade, 11 × gap + fade, still ends inside the settle, so every piece is fully up when it is done)
const SEQ_STEP = 0.15, SEQ_SETTLE = 0.6, SETTLE_GAP = 0.025, SETTLE_FADE = 0.3;
const SEQ_END = (SEQ.length * SEQ_STEP) / (SEQ.length * SEQ_STEP + SEQ_SETTLE);
const SEQ_W = SEQ_END / SEQ.length;
// the sequence plays itself: SEQ_STEP seconds a piece, then the settle (the same shares of the clock)
const SEQ_DUR = SEQ.length * SEQ_STEP + SEQ_SETTLE;
const SEQ_PRE = SEQ_W * 0.2; // how far the scroll takes it (the first piece coming in) before the clock
const boxOf = (key: string): Box => (key[0] === 'o' ? SCATTER : key[0] === 'a' ? ASCII.map((a) => a.b) : EXTRA)[Number(key.slice(1))];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/* `auto` (with `sequence`): it plays itself once the scroll starts it (holding the page, the wheel playing it
   faster, the card coming in by itself — "Research sequence · auto"); without it the scroll drives the whole
   run, piece by piece, the settle and the card ("Research sequence · scroll"). */
const ResearchTerminal = forwardRef<ResearchTerminalHandle, { scatter?: boolean; sequence?: boolean; auto?: boolean }>(function ResearchTerminal({ scatter: scatterProp = false, sequence = false, auto = false }, ref) {
  const scatter = scatterProp || sequence;
  const root = useRef<HTMLDivElement>(null);
  const p = useRef(0);
  const kick = useRef<() => void>(() => {});
  useImperativeHandle(ref, () => ({ set: (v: number) => { if (v !== p.current) { p.current = v; kick.current(); } } }), []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const data = build();
    const viz = [neural(), graph(), loss()];
    const heat = el.querySelector<HTMLElement>('.rt-heat');
    let heatAt = -1;
    const bodies = Array.from(el.querySelectorAll<HTMLElement>('.rt-text'));
    const canvases = Array.from(el.querySelectorAll<HTMLCanvasElement>('.rt-canvas'));
    const states = Array.from(el.querySelectorAll<HTMLElement>('.rt-pane:not(.rt-viz) .rt-state'));
    const vstates = Array.from(el.querySelectorAll<HTMLElement>('.rt-viz .rt-state'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // sequence: each piece's own progress, over its turn on stage (done a little before the cut)
    const seqLocal = (key: string, P: number, share = 0.8) => clamp01((P - SEQ.indexOf(key) * SEQ_W) / (SEQ_W * share));
    const textKey = (i: number) => `o${ORDER.findIndex((o) => 't' in o && o.t === i)}`;
    const vizKey = (i: number) => (i < 2 ? `o${ORDER.findIndex((o) => 'v' in o && o.v === i)}` : 'e1');
    // a piece's content extent (offsets, so unaffected by its transform): the label, then the text (its
    // longest line and the lines showing), the art, or the canvas / drawing whole
    const extent = (node: HTMLElement) => {
      if (node.classList.contains('rt-ascii')) return { x: 0, y: 0, w: Math.max(1, node.offsetWidth), h: Math.max(1, node.offsetHeight) };
      const head = node.querySelector<HTMLElement>('.rt-head'), body = node.querySelector<HTMLElement>('.rt-body');
      const txt = node.querySelector<HTMLElement>('.rt-text, .rt-heat');
      let w = head ? head.offsetWidth : 0, h = body ? body.offsetTop + body.offsetHeight : node.offsetHeight;
      if (txt && body) {
        w = Math.max(w, Math.min(body.offsetWidth, txt.scrollWidth));
        h = body.offsetTop + Math.min(body.offsetHeight, txt.offsetHeight);
      } else if (body) w = Math.max(w, body.offsetWidth);
      return { x: 0, y: 0, w: Math.max(1, w), h: Math.max(1, h) };
    };
    const extents: ({ x: number; y: number; w: number; h: number } | undefined)[] = [];
    const lastSet = new WeakMap<HTMLElement, Record<string, string>>();
    const setOnce = (node: HTMLElement, k: string, v: string) => {
      let m = lastSet.get(node);
      if (!m) lastSet.set(node, (m = {}));
      if (m[k] === v) return;
      m[k] = v;
      if (k.startsWith('--')) node.style.setProperty(k, v); else (node.style as unknown as Record<string, string>)[k] = v;
    };
    const items = sequence ? SEQ.map((k) => el.querySelector<HTMLElement>(`[data-key="${k}"]`)!) : [];
    const gut = el.querySelector<SVGElement>('.rt-gutters');
    // the portraits: each image sampled to a grid of brightness, then drawn as characters (dark = dense)
    const arts = Array.from(el.querySelectorAll<HTMLElement>('.rt-ascii')).map((node, i) => {
      const a = { node, grid: [] as number[][], shown: -1, flickAt: 0 };
      const img = new Image();
      img.onload = () => {
        const cols = ASCII[i].cols, rowsN = Math.round(cols * (img.height / img.width) * 0.5);
        const cv = document.createElement('canvas'); cv.width = cols; cv.height = rowsN;
        const cx = cv.getContext('2d', { willReadFrequently: true })!;
        cx.drawImage(img, 0, 0, cols, rowsN);
        const px = cx.getImageData(0, 0, cols, rowsN).data;
        // brightness, stretched to the image's own range so the face reads (not a grey block)
        const lum = Array.from({ length: cols * rowsN }, (_, o) => (px[o * 4] * 0.3 + px[o * 4 + 1] * 0.59 + px[o * 4 + 2] * 0.11) / 255);
        const sorted = [...lum].sort((p, q) => p - q), lo = sorted[Math.floor(sorted.length * 0.04)], hi = sorted[Math.floor(sorted.length * 0.96)];
        a.grid = Array.from({ length: rowsN }, (_, y) => Array.from({ length: cols }, (_, x) => {
          const v = Math.min(1, Math.max(0, (lum[y * cols + x] - lo) / (hi - lo || 1)));
          return Math.min(RAMP.length - 1, Math.floor((1 - v) ** 1.15 * RAMP.length));
        }));
        a.shown = -1;
      };
      img.src = ASCII[i].src;
      return a;
    });
    // the ink, from the CSS (black in the grid, the site's grey in the scatter), for the canvases
    const rgb = (getComputedStyle(el).color.match(/[\d.]+/g) || ['0', '0', '0']).slice(0, 3).join(',');
    const ink = (a: number) => `rgba(${rgb},${a.toFixed(3)})`;
    const rows = data.map(() => 20);
    const cs = canvases.map(() => ({ w: 0, h: 0 }));
    const measure = () => {
      bodies.forEach((b, i) => {
        const lh = parseFloat(getComputedStyle(b).lineHeight) || 14;
        rows[i] = Math.max(4, Math.floor((b.parentElement!.clientHeight + 2) / lh));
      });
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvases.forEach((cv, i) => {
        const r = cv.parentElement!.getBoundingClientRect();
        cs[i] = { w: r.width, h: r.height };
        cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
        cv.style.width = `${r.width}px`; cv.style.height = `${r.height}px`;
        cv.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
      });
    };
    measure();
    const last = data.map(() => -1); // the char count drawn
    const ro = new ResizeObserver(() => { measure(); last.fill(-1); });
    ro.observe(el);

    const live = data.map(() => 0); // seconds live
    const lastState = data.map(() => '');
    let raf = 0, prev = performance.now(), visible = false, clock = 0;
    let frameNo = 0;
    let playFrom = -1; // sequence: when its own clock started (ms, −1: not started) — real time, so a slow frame never slows it
    let done = false; // sequence: played through — held (no rewind) until the scroll leaves above its start
    let doneAt = 0; // when it finished (ms): the wheel's leftover momentum is swallowed for a moment after
    let lockY = -1; // sequence: the page's scroll while it plays (held there; −1: not held)
    type LenisLike = { stop: () => void; start: () => void };
    const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;
    /* While the sequence plays the page holds still: scrolling down plays it faster instead of moving on
       (so the card comes up with the tools at their start, not already scrolled past); scrolling up lets
       the page go. */
    /* Phones (≤559px, client feedback 2026-11-21): no research behind the tools — the card shows at once, and
       nothing holds the page (mobile.css hides the panes) */
    const phoneMq = window.matchMedia('(max-width: 559px)');
    const off = () => sequence && auto && phoneMq.matches;
    const playing = () => sequence && auto && !off() && playFrom >= 0 && !done;
    const hold = () => { if (lockY < 0) { lockY = window.scrollY; lenis()?.stop(); } };
    let graceT = 0;
    // let the page go; `after` ms later for the smooth scroll (Lenis takes the wheel before this does, so the
    // grace that swallows a fast-forward's last ticks has to keep it paused too)
    const release = (after = 0) => {
      if (lockY < 0) return;
      lockY = -1;
      clearTimeout(graceT);
      if (after) graceT = window.setTimeout(() => lenis()?.start(), after); else lenis()?.start();
    };
    const boost = (px: number) => { playFrom -= px * 3; kick.current(); }; // 100px of wheel ≈ a piece sooner
    const onWheel = (e: WheelEvent) => {
      // just finished: a fast-forwarding scroll's last ticks don't carry the page on into the tools
      if (done && performance.now() - doneAt < 800) {
        if (e.deltaY > 0) { e.preventDefault(); e.stopPropagation(); } else { clearTimeout(graceT); lenis()?.start(); }
        return;
      }
      if (!playing()) return;
      if (e.deltaY > 0) { e.preventDefault(); e.stopPropagation(); boost(e.deltaY); }
      else release();
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? 0; };
    const onTouchMove = (e: TouchEvent) => {
      if (!playing()) return;
      const y = e.touches[0]?.clientY ?? 0, d = touchY - y;
      touchY = y;
      if (d > 0) { e.preventDefault(); boost(d * 2); } else release();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!playing() || !['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) return;
      e.preventDefault(); boost(200);
    };
    const onScroll = () => { if (playing() && lockY >= 0 && window.scrollY > lockY) window.scrollTo(0, lockY); };
    if (sequence && auto) {
      window.addEventListener('wheel', onWheel, { passive: false, capture: true });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
      window.addEventListener('keydown', onKey, { capture: true });
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    const section = el.closest('section');
    const setState = (node: HTMLElement, s: string) => { if (node.dataset.s !== s) { node.dataset.s = s; node.textContent = s; } };

    const draw = (now: number) => {
      raf = 0;
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      // sequence: the scroll (p) brings the first piece in; once it is all the way (p 1) the clock runs the
      // rest; scrolling back before that rewinds it to the scroll again
      let P = reduce ? 1 : p.current;
      if (off()) {
        P = 1; release();
        section?.setAttribute('data-seq-done', '');
        return; // hidden: nothing to draw, no next frame (visibility restarts it)
      } else if (sequence && auto && !reduce) {
        if (done) {
          // played: held as it ended, however the scroll goes back, until it leaves above the start (reset)
          P = 1;
          if (p.current <= 0) { done = false; playFrom = -1; P = 0; }
        } else if (p.current >= 1 && playFrom < 0 && !visible) {
          // passed without being seen (a jump down the page, a fast fling): it counts as played — never starts
          // off screen, where it would hold the page somewhere else
          done = true; doneAt = now - 10000; P = 1;
        } else if (p.current >= 1) {
          if (playFrom < 0) { playFrom = now; hold(); }
          P = Math.min(1, SEQ_PRE + (now - playFrom) / 1000 / SEQ_DUR);
          if (P >= 1) {
            done = true; doneAt = performance.now(); release(800);
            // the card's entrance (a timed rise, tools-collage.css) only now, not when the scroll takes it away
            section?.setAttribute('data-seq-in', '');
            window.setTimeout(() => section?.removeAttribute('data-seq-in'), 2000);
          }
        } else { playFrom = -1; release(); P = clamp01((p.current - 0.6) / 0.4) * SEQ_PRE; } // the first piece comes in over the last of the scroll's start, after the line has gone
        section?.toggleAttribute('data-seq-done', P >= 1);
      }
      if (visible && !reduce) clock += dt;
      /* sequence: what gets redrawn this frame. While the scatter fades in, nothing (the fade stays pure
         opacity and movement, smooth: redrawing the pieces under it made every frame a full repaint); during
         the run, the piece on stage and the next, and the hidden ones one a frame in turn, so they are
         current when the scatter appears; once done, everything (live). */
      frameNo++;
      // …and on through the card's entrance after (the glass blurs what is under it: kept still, it costs nothing)
      const settling = sequence && ((P >= SEQ_END && P < 1) || (done && now - doneAt < 1800));
      const cur = Math.min(SEQ.length - 1, Math.floor(P / SEQ_W));
      const turn = SEQ[frameNo % SEQ.length];
      // just after (the card in): the pieces catch up one a frame for a second, not all in one long frame
      // once played, the research is under the glass, blurred: it stays alive one piece a frame, in turn (all of
      // it every frame cost as much as the rest of the page); the scroll version alike once the card is up
      const behind = sequence && P >= 1;
      const redraw = (key: string) => !sequence || (!settling && (behind ? key === turn : key === SEQ[cur] || key === SEQ[cur + 1] || key === turn));
      el.style.setProperty('--rt-p', P.toFixed(3));
      data.forEach((d, i) => {
        const { p: pane, lines, at, scripted } = d;
        const local = sequence ? seqLocal(textKey(i), P) : Math.min(1, Math.max(0, (P - pane.start) / (0.94 - pane.start)));
        const on = pane.always ? P > 0 : local >= 1;
        if (on && visible && !reduce) live[i] += dt; else if (!on) live[i] = 0;
        const total = at[at.length - 1];
        // the script by the scroll, then the live lines on the clock (wrapping round the prepared ones)
        let c = Math.floor(local * scripted + live[i] * pane.speed);
        if (c >= total) c = scripted + ((c - scripted) % (total - scripted));
        const state = (sequence ? local <= 0 : P <= pane.start) ? 'queued' : local < 1 ? 'running' : 'live';
        if (state !== lastState[i]) { lastState[i] = state; setState(states[i], state); }
        if (c === last[i] || !redraw(textKey(i))) return;
        last[i] = c;
        // the line being typed: the last at or before c
        let lo = 0, hi = lines.length - 1;
        while (lo < hi) { const m = (lo + hi + 1) >> 1; if (at[m] <= c) lo = m; else hi = m - 1; }
        const from = Math.max(0, lo - rows[i] + 1);
        const out: string[] = [];
        for (let k = from; k < lo; k++) out.push(paint(lines[k]));
        out.push(paint(lines[lo].slice(0, c - at[lo])) + '<b class="rt-cur"></b>');
        bodies[i].innerHTML = out.join('\n');
      });
      // the portraits print row by row with the scroll, then flicker (a few characters a frame nudged
      // one step along the ramp) while live
      arts.forEach((a, i) => {
        if (!a.grid.length || !redraw(`a${i}`)) return;
        const k = sequence ? seqLocal(`a${i}`, P) : Math.min(1, Math.max(0, (P - 0.1 - i * 0.12) / 0.55));
        const n = Math.floor(k * a.grid.length);
        const flick = k >= 1 && visible && !reduce;
        // the flicker (live): ~15 times a second, a few hundred cells shown a step or two off the image —
        // always from the image itself, so it never drifts away from it
        const tick = Math.floor(clock * 15);
        if (n === a.shown && !(flick && tick !== a.flickAt)) return;
        a.shown = n; a.flickAt = tick;
        a.node.textContent = a.grid.slice(0, n).map((r, y) => r.map((v, x) => {
          if (flick && v > 1 && hash(x * 7 + y * 131, tick) < 0.06) return RAMP[Math.max(1, Math.min(RAMP.length - 1, v + (hash(y, x + tick) < 0.5 ? -2 : 2)))];
          return RAMP[v];
        }).join('')).join('\n');
      });
      // 10 / attention: a token × token map in shade characters, shifting ~12 times a second while live
      if (heat && redraw('e2')) {
        const k = sequence ? seqLocal('e2', P, 0.3) : Math.min(1, Math.max(0, (P - 0.35) / 0.4));
        const tick = k >= 1 && !reduce ? Math.floor(clock * 12) : -2 - Math.floor(k * 20);
        if (tick !== heatAt) {
          heatAt = tick;
          const R = 14, Cn = 40, SH = ' ·░▒▓█', T = Math.max(0, tick);
          const rowsShown = Math.floor(k * R);
          const out: string[] = [];
          for (let y = 0; y < rowsShown; y++) {
            let line = '';
            for (let x = 0; x < Cn; x++) {
              const d = Math.abs(x / Cn - y / R); // attention sits near the diagonal, with a few far heads
              const v = Math.exp(-d * 9) * 0.9 + 0.35 * hash(x + T * 0.37, y) * hash(y * 3, Math.floor(T / 3) + x) + (x % 11 === 3 ? 0.25 * hash(T, y) : 0);
              line += SH[Math.min(SH.length - 1, Math.floor(v * SH.length))];
            }
            out.push(line);
          }
          heat.textContent = out.join('\n');
        }
      }
      viz.forEach((v, i) => {
        if (!redraw(vizKey(i))) return;
        const k = sequence ? seqLocal(vizKey(i), P, 0.3) : Math.min(1, Math.max(0, (P - v.start) / (0.7 - v.start)));
        if (vstates[i]) setState(vstates[i], P <= v.start ? 'queued' : k < 1 ? 'running' : 'live');
        const ctx = canvases[i]?.getContext('2d');
        if (!ctx || !cs[i]?.w) return;
        ctx.clearRect(0, 0, cs[i].w, cs[i].h);
        if (k > 0) v.draw(ctx, cs[i].w, cs[i].h, clock, k, ink);
      });
      // sequence: the stage — the piece whose turn it is, centred at its own size; then the settle (the last
      // glides back to its place as the rest come in at theirs). All the reads first (the frame's size, the
      // extent of the piece on stage only — measuring all twelve every frame forced a layout each and made
      // it judder), then the writes, each only when its value changes.
      if (sequence) {
        const W = el.clientWidth, H = el.clientHeight;
        // the settle, in seconds: each piece's own soft fade up, one after another
        const ts = Math.max(0, (P - SEQ_END) / (1 - SEQ_END)) * SEQ_SETTLE;
        const inOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
        const pieceIn = (q: number) => inOut(clamp01((ts - q * SETTLE_GAP) / SETTLE_FADE));
        const u = inOut(clamp01(ts / SEQ_SETTLE));
        const cut = SEQ_W * 0.08;
        // every piece the same, the last too: in, its turn, a quick cut (feedback: no glide home for the last)
        const ons = items.map((_, q) => {
          const a = q * SEQ_W, z = (q + 1) * SEQ_W;
          return P < SEQ_END ? Math.min(clamp01((P - a) / cut), clamp01((z - P) / cut)) : 0;
        });
        // the extent of what is on stage (its label and lines so far, the art, the drawing); the last's is
        // kept from its turn through the settle, so it glides along one steady path
        items.forEach((node, q) => { if (ons[q] > 0) extents[q] = extent(node); });
        items.forEach((node, q) => {
          const key = SEQ[q], b = boxOf(key);
          setOnce(node, '--rt-p', seqLocal(key, P).toFixed(2)); // 11 / field map's parts
          // then the scatter builds in, every piece at its place, one after another, each easing up a touch
          if (P >= SEQ_END) {
            const e = pieceIn(q);
            setOnce(node, 'opacity', e.toFixed(3));
            setOnce(node, 'transform', `translate3d(0, ${((1 - e) * 10).toFixed(1)}px, 0)`);
            return;
          }
          setOnce(node, 'opacity', ons[q].toFixed(3));
          if (ons[q] <= 0) return; // off stage: where it is doesn't matter
          const ex = extents[q] ?? { x: 0, y: 0, w: 1, h: 1 };
          const ox = ex.x + ex.w / 2, oy = ex.y + ex.h / 2;
          const dx = W / 2 - ((b.l / 100) * W + ox), dy = H / 2 - ((b.t / 100) * H + oy);
          setOnce(node, 'transform', `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`);
        });
        if (gut) setOnce(gut as unknown as HTMLElement, 'opacity', u.toFixed(3));
      }
      if (visible) raf = requestAnimationFrame(draw);
    };
    const start = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(draw); } };
    kick.current = start;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
    io.observe(el);
    start();
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); kick.current = () => {};
      clearTimeout(graceT); release();
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove, { capture: true });
      window.removeEventListener('keydown', onKey, { capture: true });
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // only the titles are needed here: built once (panes() writes out every script — doing it on each render, when
  // the card above re-rendered every frame, was most of the section's cost)
  const { heads, vheads } = HEADS();
  let n = 0;
  return (
    <div className={sequence ? 'rt rt-scatter rt-seq' : scatter ? 'rt rt-scatter' : 'rt'} ref={root} aria-hidden="true">
      {scatter && <Gutters />}
      {scatter && ASCII.map((a, i) => <pre key={a.src} className="rt-ascii" data-key={`a${i}`} style={at(a.b)} />)}
      {ORDER.map((o, oi) => {
        const h = 't' in o ? heads[o.t] : vheads[o.v];
        const num = String(++n).padStart(2, '0');
        return (
          <div className={'t' in o ? 'rt-pane' : 'rt-pane rt-viz'} key={num} data-key={`o${oi}`} style={scatter ? at(SCATTER[oi]) : undefined}>
            <div className="rt-head">
              <span>{num} / {h.title.replace(/^\d+ \/ /, '')} <em>{h.sub}</em></span>
              <span className="rt-state" data-s="queued">queued</span>
            </div>
            <div className="rt-body">{'t' in o ? <pre className="rt-text" /> : <canvas className="rt-canvas" />}</div>
          </div>
        );
      })}
      {scatter && <>
        <div className="rt-pane rt-viz" data-key="e1" style={at(EXTRA[1])}>
          <div className="rt-head"><span>09 / Loss <em>train · val</em></span></div>
          <div className="rt-body"><canvas className="rt-canvas" /></div>
        </div>
        <div className="rt-pane" data-key="e2" style={at(EXTRA[2])}>
          <div className="rt-head"><span>10 / Attention <em>head 3 · layer 11</em></span></div>
          <div className="rt-body"><pre className="rt-heat" /></div>
        </div>
        <div className="rt-pane" data-key="e0" style={at(EXTRA[0])}>
          <div className="rt-head"><span>11 / Field map <em>reach · survey</em></span></div>
          <div className="rt-body"><FieldMap /></div>
        </div>
      </>}
    </div>
  );
});

// memo: the card over it re-renders as the tools scroll; this has nothing to redraw then
export default memo(ResearchTerminal);
