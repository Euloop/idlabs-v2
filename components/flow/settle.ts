/* Phones: scroll "settle" (2026-11-17). Scroll-driven sections register the stretches of page scroll that
   are in between (a blank screen, a transition, text half typed) as [from, to] in page px, measured live.
   PhoneSettle.tsx, when a touch swipe comes to rest inside one, glides the page to its end in the swipe's
   direction — so every swipe ends on something. Stretches that touch join into one. */

// [from, to] in page px; an optional third value is the glide's length in ms (a long stretch that should
// play through — Launches — rather than the default quick glide)
export type SettleZone = [number, number, number?];
type Provider = () => SettleZone[];

const providers = new Set<Provider>();

/** Register a section's in-between stretches; returns the unregister. */
export function addSettleZones(fn: Provider): () => void {
  providers.add(fn);
  return () => { providers.delete(fn); };
}

/** All registered stretches, sorted, with any that touch or overlap (within `join` px) merged. */
export function settleZones(join = 48): SettleZone[] {
  const all: SettleZone[] = [];
  providers.forEach((fn) => { for (const z of fn()) if (z[1] - z[0] > 2) all.push([z[0], z[1], z[2]]); });
  all.sort((a, b) => a[0] - b[0]);
  const out: SettleZone[] = [];
  for (const z of all) {
    const last = out[out.length - 1];
    if (last && z[0] <= last[1] + join) { last[1] = Math.max(last[1], z[1]); if (z[2] !== undefined) last[2] = Math.max(last[2] ?? 0, z[2]); }
    else out.push(z);
  }
  return out;
}
