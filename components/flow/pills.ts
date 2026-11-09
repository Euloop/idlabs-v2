import { buildSpans } from './geometry';

/* Minimal version of the pipeline (third style on /home-2), after a user-flow map: small pills on
   one hairline spine, notes fanned out as tiny outlined branch pills on hairline curves.
   Client copy: titles and sub-labels as in the flowchart; each note is split at its commas into
   branch pills (e.g. "Post metadata, author info, media" → Post metadata · Author info · Media). */

export const CY = 300;
export const PH = 30; // main pill height
export const BH = 22; // branch pill height
const GAP = 46; // spine connector length between handles
const HANDLE = 8; // handle dot sits this far outside the pill

const W13 = (t: string) => Math.round(t.length * 7.3 + 34); // Inter 13
const W11 = (t: string) => Math.round(t.length * 6.2 + 24); // Inter 11

export type Branch = { label: string; x: number; y: number; w: number };
export type Pill = {
  id: string; title: string; sub: string; x: number; y: number; w: number; dark?: boolean;
  up?: boolean; branches: Branch[];
};

type Spec = { id: string; title: string; sub: string; branches?: string[]; up?: boolean; dark?: boolean };
const SPECS: Spec[] = [
  { id: 'post', title: 'Your post', sub: 'X or LinkedIn' },
  { id: 'thunder', title: 'Thunder', sub: 'In-network posts' },
  { id: 'phoenix', title: 'Phoenix retrieval', sub: 'Out-of-network posts' },
  { id: 'hydration', title: 'Hydration', sub: 'Feature enrichment', branches: ['Post metadata', 'Author info', 'Media'], up: true },
  { id: 'filtering', title: 'Filtering', sub: 'Pre-scoring exclusion', branches: ['Duplicates', 'Stale posts', 'Blocked & muted'] },
  { id: 'scorer', title: 'Phoenix scorer', sub: 'Grok-based transformer', branches: ['P(like)', 'P(reply)', 'P(repost)', 'P(click)…'], up: true },
  { id: 'weighted', title: 'Weighted scorer', sub: 'Σ weight × P(action)' },
  { id: 'diversity', title: 'Author diversity', sub: 'Score attenuation', branches: ['Repeat authors down-weighted'] },
  { id: 'selection', title: 'Selection', sub: 'Top-K by final score' },
  { id: 'visibility', title: 'Visibility filter', sub: 'Post-selection', branches: ['Spam', 'Deleted', 'Unsafe content'] },
  { id: 'feed', title: 'Feed', sub: 'Position r', dark: true },
];

/* Lay out the spine left to right; Thunder and Phoenix retrieval share a column (fork). */
export const PILLS: Pill[] = (() => {
  const out: Pill[] = [];
  let x = 0;
  const place = (s: Spec, px: number, y: number) => {
    const w = W13(s.title);
    const cx = px + w / 2;
    const branches = (s.branches ?? []).map((label, i): Branch => ({
      label, w: W11(label), x: cx + 26,
      // above: listed top-down in the client's order; below: also top-down
      y: s.up ? y - 58 - (s.branches!.length - 1 - i) * 30 : y + 64 + i * 30,
    }));
    out.push({ id: s.id, title: s.title, sub: s.sub, x: px, y, w, dark: s.dark, up: s.up, branches });
    return w;
  };
  for (const s of SPECS) {
    if (s.id === 'phoenix') continue;
    if (s.id === 'thunder') {
      const ph = SPECS.find((p) => p.id === 'phoenix')!;
      const w = Math.max(W13(s.title), W13(ph.title));
      place(s, x + (w - W13(s.title)) / 2, CY - 70);
      place(ph, x + (w - W13(ph.title)) / 2, CY + 70);
      x += w + GAP + 2 * HANDLE;
      continue;
    }
    x += place(s, x, CY) + GAP + 2 * HANDLE + (s.id === 'filtering' ? 110 : 0);
  }
  return out;
})();
const P = Object.fromEntries(PILLS.map((p) => [p.id, p]));

const right = (id: string) => P[id].x + P[id].w + HANDLE;
const left = (id: string) => P[id].x - HANDLE;
export const handles = (p: Pill) => [left(p.id), right(p.id)];

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const k = (x2 - x1) * 0.5;
  return `M${x1} ${y1} C${x1 + k} ${y1} ${x2 - k} ${y2} ${x2} ${y2}`;
};
const link = (a: string, b: string) => curve(right(a), P[a].y, left(b), P[b].y);

/* Branch connectors: from the pill's top/bottom centre, bending out to each branch pill's left end. */
export const branchPath = (p: Pill, b: Branch) => {
  const cx = p.x + p.w / 2;
  const y0 = p.up ? p.y - PH / 2 : p.y + PH / 2 + 20; // below: start under the caption
  return `M${cx} ${y0} C${cx} ${b.y} ${cx} ${b.y} ${b.x} ${b.y}`;
};

const RIGHT = right('feed');
export const BOUNDS = { x0: left('post') - 30, x1: RIGHT + 30, cx: (left('post') + RIGHT) / 2 };
const branchRight = (id: string) => Math.max(P[id].x + P[id].w, ...P[id].branches.map((b) => b.x + b.w));
export const FRAMES = [
  [left('post') - 36, Math.max(branchRight('filtering'), right('filtering')) + 36],
  [left('scorer') - 36, RIGHT + 36],
] as const;
export const TAGS = [
  { label: 'Sourcing module', x: left('thunder'), y: P.thunder.y - 46 },
  { label: 'Ranking module', x: left('scorer'), y: CY + 62 },
];

export type PillStage = { nodes: string[]; leg: string[]; dwell: string[] };
const order = ['hydration', 'filtering', 'scorer', 'weighted', 'diversity', 'selection', 'visibility', 'feed'];
export const STAGES: PillStage[] = [
  {
    nodes: ['thunder', 'phoenix'],
    leg: [link('post', 'thunder'), link('post', 'phoenix')],
    dwell: ['thunder', 'phoenix'].map((id) => `M${left(id)} ${P[id].y} H${right(id)}`),
  },
  ...order.map((id, i): PillStage => ({
    nodes: [id],
    leg: (i === 0 ? ['thunder', 'phoenix'] : [order[i - 1]]).map((f) => link(f, id)),
    dwell: [`M${left(id)} ${CY} H${id === 'feed' ? P.feed.x + P.feed.w / 2 : right(id)}`],
  })),
];

const built = buildSpans(STAGES, 'scorer');
export const SPAN_AT = built.at;
export const U_RANKING = built.uRanking;
