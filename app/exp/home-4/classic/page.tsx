import type { Metadata } from 'next';
import Home4 from '../../../../components/Home4';

/* /home-4/classic: /home-4 with the loader from before 2026-11-14 — the words or the logo splitting, the
   image reel and the golden ratio, ending in the Zoom (onto the drawn hero) or the Fade (onto the clean
   hero), ?intro=zoom|fade. The Loader tab moves between this and /home-4. Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — home 4 (classic loader)',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function Home4Classic() {
  return <Home4 loader="classic" />;
}
