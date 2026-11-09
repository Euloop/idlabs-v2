/* Flowchart of the X For You pipeline: the client's flowchart (nodes, groups, notes) redrawn
   as an IL line diagram. Everything is in SVG user units; one row, centre line y = 300.
   Node titles, sub-labels and notes are the client's flowchart copy word for word. */

export const CY = 300;
export const BW = 160; // box width
export const BH = 52; // box height
export const BOUNDS = { x0: 0, x1: 2050, cx: 1025 };

export type FlowNode = { id: string; title: string; sub: string; x: number; y: number; w: number; dark?: boolean };

const box = (id: string, title: string, sub: string, x: number, cy = CY, w = BW, dark = false): FlowNode =>
  ({ id, title, sub, x, y: cy - BH / 2, w, dark });

export const NODES: FlowNode[] = [
  box('thunder', 'Thunder', 'In-network posts', 128, 245),
  box('phoenix', 'Phoenix retrieval', 'Out-of-network posts', 128, 355),
  box('hydration', 'Hydration', 'Feature enrichment', 348),
  box('filtering', 'Filtering', 'Pre-scoring exclusion', 556),
  box('scorer', 'Phoenix scorer', 'Grok-based transformer', 812),
  box('weighted', 'Weighted scorer', 'Σ weight × P(action)', 1020),
  box('diversity', 'Author diversity', 'Score attenuation', 1228),
  box('selection', 'Selection', 'Top-K by final score', 1484),
  box('visibility', 'Visibility filter', 'Post-selection', 1692),
  box('feed', 'Feed', 'Position r', 1900, CY, 112, true),
];
const N = Object.fromEntries(NODES.map((n) => [n.id, n]));

/* Your post: the dark source tile on the far left. */
export const POST = { x: 12, y: CY - 17, w: 26, h: 34 };

/* Groups: tinted panels (as in the client's figure) and the two dashed module outlines. */
export const PANELS = [
  { label: 'Candidate sources', x: 108, y: 196, w: 200, h: 208 },
  { label: 'Scoring', x: 790, y: 196, w: 620, h: 208 },
];
export const MODULES = [
  { label: 'Sourcing module', x: 92, y: 140, w: 648, h: 320 },
  { label: 'Ranking module', x: 768, y: 140, w: 1268, h: 320 },
];

/* Side notes: the notes attached to a node in the client's figure. `arrow` points into the box. */
export type FlowNote = { node: string; lines: string[]; above: boolean; arrow: boolean };
export const NOTES: FlowNote[] = [
  { node: 'hydration', lines: ['Post metadata,', 'author info, media'], above: true, arrow: true },
  { node: 'filtering', lines: ['Duplicates, stale posts,', 'blocked & muted'], above: false, arrow: true },
  { node: 'scorer', lines: ['P(like), P(reply),', 'P(repost), P(click)…'], above: true, arrow: true },
  { node: 'diversity', lines: ['Repeat authors', 'down-weighted'], above: false, arrow: false },
  { node: 'visibility', lines: ['Spam, deleted,', 'unsafe content'], above: false, arrow: true },
];
export const noteGeo = (n: FlowNote) => {
  const b = N[n.node];
  const cx = b.x + b.w / 2;
  return n.above
    ? { cx, textY: [214, 228], arrow: `M${cx} 240 V${b.y - 2}`, head: `M${cx - 3.5} ${b.y - 7} L${cx} ${b.y - 2} L${cx + 3.5} ${b.y - 7}` }
    : { cx, textY: n.arrow ? [384, 398] : [364, 378], arrow: `M${cx} ${b.y + BH + 2} V366`, head: `M${cx - 3.5} 361 L${cx} 366 L${cx + 3.5} 361` };
};

/* The post's route. Stage i = a leg along the connectors into the stage's box(es), then a dwell
   through them (under the box, which is opaque). Stage 0 forks: the post goes to both
   candidate sources at once and the two copies merge again at Hydration. */
export type Stage = { nodes: string[]; leg: string[]; dwell: string[]; head: string[] };

const line = (x0: number, x1: number, y = CY) => `M${x0} ${y} H${x1}`;
const chevron = (x: number, y = CY) => `M${x - 6} ${y - 3.5} L${x - 1} ${y} L${x - 6} ${y + 3.5}`;
const right = (id: string) => N[id].x + N[id].w;

const order = ['hydration', 'filtering', 'scorer', 'weighted', 'diversity', 'selection', 'visibility', 'feed'];

export const STAGES: Stage[] = [
  {
    nodes: ['thunder', 'phoenix'],
    leg: [
      'M44 300 H78 Q84 300 84 294 V251 Q84 245 90 245 H128',
      'M44 300 H78 Q84 300 84 306 V349 Q84 355 90 355 H128',
    ],
    dwell: [line(128, 288, 245), line(128, 288, 355)],
    head: [chevron(128, 245), chevron(128, 355)],
  },
  ...order.map((id, i): Stage => {
    const n = N[id];
    const leg = i === 0
      ? [
          'M288 245 H312 Q318 245 318 251 V294 Q318 300 324 300 H348',
          'M288 355 H312 Q318 355 318 349 V306 Q318 300 324 300 H348',
        ]
      : [line(right(order[i - 1]), n.x)];
    // The post comes to rest in the middle of the feed tile.
    const dwell = [line(n.x, id === 'feed' ? n.x + n.w / 2 : n.x + n.w)];
    return { nodes: [id], leg, dwell, head: [chevron(n.x)] };
  }),
];

/* Timeline weights (route progress u ∈ 0..1): a leg, then a dwell, per stage. Shared with the
   card version (cards.ts). */
export function buildSpans(stages: { nodes: string[] }[], rankingNode: string) {
  const spans = stages.flatMap((_, i) => [
    { stage: i, kind: 'leg' as const, w: 1 },
    { stage: i, kind: 'dwell' as const, w: i === stages.length - 1 ? 0.5 : 0.9 },
  ]);
  const total = spans.reduce((a, s) => a + s.w, 0);
  let acc = 0;
  const at = spans.map((s) => { const a = acc / total; acc += s.w; return { ...s, a, b: acc / total }; });
  /* Route progress at which the post leaves the Sourcing module (start of the leg into ranking). */
  const uRanking = at.find((s) => s.kind === 'leg' && stages[s.stage].nodes[0] === rankingNode)!.a;
  return { at, uRanking };
}
const built = buildSpans(STAGES, 'scorer');
export const SPAN_AT = built.at;
export const U_RANKING = built.uRanking;
