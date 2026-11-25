/* Typing sound: a short, crisp key click per letter, synthesized (no audio files). Modelled on
   the profile of Monkeytype's "click" sound: ~18ms long, mostly 3–12 kHz, half gone after ~4ms,
   with a faint low thump under it. A press plays on every other letter, so the rhythm stays
   light rather than busy.

   One sound per press: a single noise burst through two filters mixed together (a broad
   high band for the click, a little low band for the thump) under one fast envelope. Pitch
   and level vary a little on every press so it never sounds machine-made. Spaces are silent,
   so words come out as little bursts.

   Timing: letters appear on animation frames, up to a frame after their ideal time. Each
   press is scheduled on the audio clock at its *ideal* time (`lag` back from now) plus a
   fixed LATENCY, so presses are evenly spaced and locked to the text.

   Browsers allow sound only after a click or key press, so `unlock()` must run from one. */

import type { CharInfo } from '../../../components/TokenText';

const LATENCY = 0.03; // s, headroom so a press is never scheduled in the past

/** volume 0..1; tone scales the pitch (1 = normal, <1 deeper, >1 brighter) */
export type SoundOpts = { volume: number; tone: number };

type Voice = { ctx: BaseAudioContext; out: AudioNode; noise: AudioBuffer };
let live: (Voice & { ctx: AudioContext }) | null = null;
let last = 0;
let letters = 0; // letters seen; a press on every other one

export function voice(ctx: BaseAudioContext): Voice {
  const len = Math.floor(ctx.sampleRate * 0.05);
  const noise = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return { ctx, out: ctx.destination, noise };
}

/** one key press at `when` (s) */
export function press(v: Voice, when: number, o: SoundOpts) {
  const { ctx, out, noise } = v;
  const r = () => Math.random();
  const pitch = o.tone * (0.92 + 0.16 * r());

  const src = ctx.createBufferSource();
  src.buffer = noise;
  const g = ctx.createGain();

  const click = ctx.createBiquadFilter(); // the click: broad, bright
  click.type = 'bandpass'; click.frequency.value = 3600 * pitch; click.Q.value = 0.45;
  const thump = ctx.createBiquadFilter(); // the faint thump under it
  thump.type = 'lowpass'; thump.frequency.value = 280 * pitch; thump.Q.value = 1.2;
  const thumpLevel = ctx.createGain();
  thumpLevel.gain.value = 2.2 / Math.min(1, o.tone); // deeper tones lean on the thump
  src.connect(click).connect(g);
  src.connect(thump).connect(thumpLevel).connect(g);
  g.connect(out);

  const peak = o.volume * (0.85 + 0.3 * r());
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(peak, when + 0.0008);
  g.gain.setTargetAtTime(0, when + 0.0012, 0.0045); // ~half gone at 4ms
  src.start(when, r() * 0.02, 0.022);
}

export function unlock() {
  if (!live) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC({ latencyHint: 'interactive' });
    live = { ...voice(ctx), ctx };
  }
  if (live.ctx.state !== 'running') void live.ctx.resume();
}

/** a letter appeared */
export function tick(ch: string, info: CharInfo, o: SoundOpts) {
  if (!live || live.ctx.state !== 'running' || o.volume <= 0 || /\s/.test(ch)) return;
  if (letters++ % 2) return; // every other letter: a lighter, less busy rhythm
  const now = live.ctx.currentTime;
  const when = Math.max(now + 0.002, now + LATENCY - info.lag / 1000);
  if (when - last < 0.004) return; // two letters on the same instant: one press
  last = when;
  press(live, when, o);
}
