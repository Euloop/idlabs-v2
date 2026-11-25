import type { Metadata } from 'next';
import Home4 from '../../../components/Home4';

/* /home-4: every section's variants on bottom tabs (the page body: components/Home4.tsx), with today's
   loader; /home-4/classic has the loader before it (Zoom · Fade). Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — home 4',
  robots: { index: false, follow: false },
  // the launch reel plays X's videos, which refuse another site's referrer (flow/launch-videos.ts)
  referrer: 'no-referrer',
};

export default function Home4Page() {
  return <Home4 loader="new" />;
}
