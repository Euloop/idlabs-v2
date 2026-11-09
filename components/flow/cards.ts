import { buildSpans } from './geometry';

/* Card version of the pipeline flowchart (node-editor style: dotted canvas, white cards, solid
   curved connectors between port circles). Same client copy as the line version: each card is
   the node's title, its sub-label, and its note if it has one. SVG user units. */

export const CW = 184; // card width
export const CY = 300;


export type Card = {
  id: string; title: string; sub: string; note?: [string, string];
  x: number; y: number; w: number; h: number; port: number; dark?: boolean;
};

/* Card anatomy: header (title, ···), one row with the sub-label, an optional row with the note. */
export const HEAD = 42;
export const ROW = 34;
export const NOTE = 48;
const PORT = HEAD + ROW / 2; // ports sit on the first row's centre line
const card = (id: string, title: string, sub: string, x: number, port: number, note?: [string, string], w = CW, dark = false): Card => ({
  id, title, sub, note, x, w, dark, port,
  y: port - PORT,
  h: HEAD + ROW + (note ? 4 + NOTE : 0) + 7,
});

/* Gentle zig-zag, as in the reference, so the connectors read as curves. Compact spacing so
   each module fits on one screen (the camera frames a whole module, it doesn't pan). */
const STEP = CW + 52; // card + connector
const END = 130; // Your post / Feed card width
const X = (() => {
  const x: Record<string, number> = { post: 0, thunder: END + 52 };
  const seq = ['hydration', 'filtering', 'scorer', 'weighted', 'diversity', 'selection', 'visibility', 'feed'];
  let at = x.thunder;
  seq.forEach((id) => { at += STEP + (id === 'scorer' ? 30 : 0); x[id] = at; });
  return x;
})();
export const CARDS: Card[] = [
  card('post', 'Your post', 'X or LinkedIn', X.post, 300, undefined, END),
  card('thunder', 'Thunder', 'In-network posts', X.thunder, 214),
  card('phoenix', 'Phoenix retrieval', 'Out-of-network posts', X.thunder, 386),
  card('hydration', 'Hydration', 'Feature enrichment', X.hydration, 300, ['Post metadata,', 'author info, media']),
  card('filtering', 'Filtering', 'Pre-scoring exclusion', X.filtering, 252, ['Duplicates, stale posts,', 'blocked & muted']),
  card('scorer', 'Phoenix scorer', 'Grok-based transformer', X.scorer, 306, ['P(like), P(reply),', 'P(repost), P(click)…']),
  card('weighted', 'Weighted scorer', 'Σ weight × P(action)', X.weighted, 258),
  card('diversity', 'Author diversity', 'Score attenuation', X.diversity, 306, ['Repeat authors', 'down-weighted']),
  card('selection', 'Selection', 'Top-K by final score', X.selection, 258),
  card('visibility', 'Visibility filter', 'Post-selection', X.visibility, 306, ['Spam, deleted,', 'unsafe content']),
  card('feed', 'Feed', 'Position r', X.feed, 258, undefined, END, true),
];
const C = Object.fromEntries(CARDS.map((c) => [c.id, c]));

/* Module tags: a small pill above the first card of each module (like the reference's "Start"). */
export const TAGS = [
  { label: 'Sourcing module', x: C.thunder.x, y: C.thunder.y - 34 },
  { label: 'Ranking module', x: C.scorer.x, y: C.scorer.y - 34 },
];
const RIGHT = C.feed.x + C.feed.w;
export const BOUNDS = { x0: -40, x1: RIGHT + 40, cx: RIGHT / 2 };
/* Camera frames per module (x range, with a margin): the camera fits the whole module. */
export const FRAMES = [
  [-36, C.filtering.x + CW + 36],
  [C.scorer.x - 36, RIGHT + 36],
] as const;

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const k = Math.max(28, (x2 - x1) * 0.5);
  return `M${x1} ${y1} C${x1 + k} ${y1} ${x2 - k} ${y2} ${x2} ${y2}`;
};
const link = (a: string, b: string) => curve(C[a].x + C[a].w, C[a].port, C[b].x, C[b].port);
const through = (id: string, end?: number) => `M${C[id].x} ${C[id].port} H${end ?? C[id].x + C[id].w}`;

export type CardStage = { nodes: string[]; leg: string[]; dwell: string[]; ports: [number, number][][] };
const order = ['hydration', 'filtering', 'scorer', 'weighted', 'diversity', 'selection', 'visibility', 'feed'];
const out = (id: string): [number, number] => [C[id].x + C[id].w, C[id].port];
const inn = (id: string): [number, number] => [C[id].x, C[id].port];

export const STAGES: CardStage[] = [
  {
    nodes: ['thunder', 'phoenix'],
    leg: [link('post', 'thunder'), link('post', 'phoenix')],
    dwell: [through('thunder'), through('phoenix')],
    ports: [[out('post'), inn('thunder')], [out('post'), inn('phoenix')]],
  },
  ...order.map((id, i): CardStage => {
    const from = i === 0 ? ['thunder', 'phoenix'] : [order[i - 1]];
    return {
      nodes: [id],
      leg: from.map((f) => link(f, id)),
      // The post comes to rest in the middle of the feed card.
      dwell: [through(id, id === 'feed' ? C.feed.x + C.feed.w / 2 : undefined)],
      ports: from.map((f) => [out(f), inn(id)]),
    };
  }),
];

const built = buildSpans(STAGES, 'scorer');
export const SPAN_AT = built.at;
export const U_RANKING = built.uRanking;
