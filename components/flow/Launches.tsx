import LaunchesCloud from './LaunchesCloud';

/* Launches we've done for our clients (/home-2). A centred 12px mono caps label over a 16:9 panel
   just inside the rules, in one of two variants:
     cloud  the launches as cards drifting toward the viewer (LaunchesCloud.tsx)
     box    the simple panel, a placeholder for the launch video
   Light page; normal scroll; the last section, so it closes the page's corners. */
export default function Launches({ variant = 'cloud' }: { variant?: 'cloud' | 'box' }) {
  return (
    <section className="lc" data-variant={variant} data-foot="/Launches" aria-labelledby="lc-title">
      <div className="frame lc-frame">
        <h2 id="lc-title" className="lc-label">Launches we’ve done for our clients</h2>
        {variant === 'cloud' ? (
          <div className="lc-panel"><LaunchesCloud /></div>
        ) : (
          <div className="lc-panel lc-box" role="img" aria-label="Client launches video (coming soon)" />
        )}
      </div>
    </section>
  );
}
