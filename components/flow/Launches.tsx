import LaunchesCloud from './LaunchesCloud';
import LaunchesGrid from './LaunchesGrid';
import LaunchesSlides from './LaunchesSlides';
import LaunchesFloat from './LaunchesFloat';

/* Launches we've done for our clients (/home-2). A centred 12px mono caps label over a 16:9 panel
   just inside the rules, in one of two variants:
     cloud  the launches as cards drifting toward the viewer (LaunchesCloud.tsx)
     grid   the launch pictures in an endless grid you drag around (LaunchesGrid.tsx)
     box       the simple panel, a placeholder for the launch video
     carousel  big slides in a row running off the right edge, prev / next under (LaunchesSlides.tsx)
     slider    one big slide centred, prev / next either side (LaunchesSlides.tsx)
     float     a loading teaser that scatters into a full-width floating field (LaunchesFloat.tsx);
               leaves the frame, so it renders without it
   Light page; normal scroll; the last section, so it closes the page's corners. */
export type LaunchesVariant = 'cloud' | 'grid' | 'box' | 'carousel' | 'slider' | 'float';
export default function Launches({ variant = 'cloud' }: { variant?: LaunchesVariant }) {
  if (variant === 'float') return (
    <section className="lc" data-variant={variant} data-foot="/Launches" aria-labelledby="lc-title">
      <LaunchesFloat />
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
