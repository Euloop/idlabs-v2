import LaunchesCloud from './LaunchesCloud';
import LaunchesGrid from './LaunchesGrid';
import LaunchesSlides from './LaunchesSlides';
import LaunchesFloat from './LaunchesFloat';
import { PICKS, LAUNCH_COUNT } from './LaunchesSelected';

/* Launches we've done for our clients (/home-2). A centred 12px mono caps label over a 16:9 panel
   just inside the rules, in one of two variants:
     cloud  the launches as cards drifting toward the viewer (LaunchesCloud.tsx)
     grid   the launch pictures in an endless grid you drag around (LaunchesGrid.tsx)
     box       the simple panel, a placeholder for the launch video
     carousel  big slides in a row running off the right edge, prev / next under (LaunchesSlides.tsx)
     slider    one big slide centred, prev / next either side (LaunchesSlides.tsx)
     float     a loading teaser that scatters into a full-width floating field (LaunchesFloat.tsx);
               leaves the frame, so it renders without it
     float2    Float II: the same, its words "Launches" / "we have done", no headline over the field,
               and the reel with a smaller reach, a mono line under it and side prev / next areas
   Light page; normal scroll; the last section, so it closes the page's corners. */
export type LaunchesVariant = 'cloud' | 'grid' | 'box' | 'carousel' | 'slider' | 'float' | 'float2' | 'float3' | 'float4' | 'selected';
export default function Launches({ variant = 'cloud' }: { variant?: LaunchesVariant }) {
  /* selected: Float IV whose reel shows only the client's six, in their order, then an end slide
     with a See all button to /launches (LaunchesSelected.tsx: the list and that page) */
  if (variant === 'selected') return (
    <section className="lc" data-variant={variant} data-foot="/Launches" aria-labelledby="lc-title">
      <LaunchesFloat alt card track picks={PICKS} end={{ href: '/launches', total: LAUNCH_COUNT }} />
    </section>
  );
  if (variant === 'float' || variant === 'float2' || variant === 'float3' || variant === 'float4') return (
    <section className="lc" data-variant={variant} data-foot="/Launches" aria-labelledby="lc-title">
      {/* keyed: each variant gets a fresh float (its scroll loop reads alt / card once, at mount) */}
      <LaunchesFloat key={variant} alt={variant !== 'float'} card={variant === 'float3' || variant === 'float4'} track={variant === 'float4'} />
    </section>
  );
  return (
    <section className="lc" data-variant={variant} data-foot="/Launches" aria-labelledby="lc-title">
      <div className="frame lc-frame">
        <h2 id="lc-title" className="lc-label">Launches we’ve done for our clients</h2>
        {variant === 'cloud' ? (
          <div className="lc-panel"><LaunchesCloud /></div>
        ) : variant === 'carousel' || variant === 'slider' ? (
          <LaunchesSlides mode={variant} />
        ) : variant === 'grid' ? (
          <div className="lc-panel lc-gridp"><LaunchesGrid /></div>
        ) : (
          <div className="lc-panel lc-box" role="img" aria-label="Client launches video (coming soon)" />
        )}
      </div>
    </section>
  );
}
