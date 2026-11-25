import type { Metadata, Viewport } from 'next';
import Opening from '../../../components/immersive/Opening';
import Pipeline from '../../../components/immersive/Pipeline';
import Research from '../../../components/immersive/Research';
import Tools from '../../../components/immersive/Tools';
import Services from '../../../components/immersive/Services';
import Launches from '../../../components/immersive/Launches';
import Outro from '../../../components/immersive/Outro';
import Chrome from '../../../components/immersive/Chrome';
import '../../../components/immersive/immersive.css';

/* /home-3: the whole site as one immersive, scroll-driven piece, after getty.edu/tracingart.
   No frame rules: full-bleed scenes on warm paper, each a tall section with a sticky stage
   (components/immersive/). An experiment, not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — immersive',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#f6f4ef' };

export default function Home3() {
  return (
    <div className="im">
      <Chrome />
      <main>
        <Opening />
        <Pipeline />
        <Research />
        <Tools />
        <Services />
        <Launches />
        <Outro />
      </main>
    </div>
  );
}
