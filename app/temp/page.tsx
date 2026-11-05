import type { Metadata } from 'next';
import SectionTwoV1 from '../../components/snapshots/v1/SectionTwo';

/* Temp page: a frozen snapshot of Section 2 (diagram story v1, commit 18b8973), kept for
   reference while the live version on the home page is iterated. Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — Section 2 snapshot (v1)',
  robots: { index: false, follow: false },
};

export default function Temp() {
  return (
    <>
      {/* Same page material and frame rules as the home page; with no hero above it the
          section switches the page to light straight away. */}
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop-dark"><div className="texture" /></div>
        <div className="backdrop-light" />
      </div>
      <div className="frame rails" aria-hidden="true"><span className="rails-light" /></div>
      <SectionTwoV1 />
    </>
  );
}
