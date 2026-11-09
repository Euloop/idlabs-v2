/* Diagram timeline shared by both diagram styles (fractions of the diagram's scroll budget):
   zoom in → Sourcing module drawn and highlighted → the post runs through Sourcing → camera moves
   on, Ranking drawn → the post runs through Ranking into the feed; then it holds there. */
export const T = {
  zoomIn: [0, 0.06],
  srcDraw: [0.05, 0.12],
  srcRun: [0.12, 0.42],
  move: [0.43, 0.5],
  rnkDraw: [0.47, 0.54],
  rnkRun: [0.54, 0.92],
} as const;
/** Diagram progress at which the story moves to the Ranking module. */
export const P_RANK = T.move[0];

export type FlowHandle = { render: (intro: number, P: number, reduce: boolean) => void };

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const sg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
// Emil Kowalski's ease-in-out, as for the stage changes in the current diagram.
export const io = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
