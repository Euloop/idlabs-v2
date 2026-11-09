/* Launches we've done for our clients (/home-2). A centred 12px mono caps label over a panel that
   runs rule to rule — a 16:9 placeholder (#f4f4f4) for
   the launch video. Light page; normal scroll; the last section, so it closes the page's corners. */
export default function Launches() {
  return (
    <section className="lc" data-foot="/Launches" aria-labelledby="lc-title">
      <div className="frame lc-frame">
        <h2 id="lc-title" className="lc-label">Launches we’ve done for our clients</h2>
        <div className="lc-panel" role="img" aria-label="Client launches video (coming soon)" />
      </div>
    </section>
  );
}
