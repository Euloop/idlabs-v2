import type { Metadata, Viewport } from 'next';
import Experiment from '../../../components/experiment/Experiment';

/* /experiment — landing page v2 layout (Figma "Zoomcast" section 121:3, "landing page v2 - experminet").
   Entirely separate from the home page: its own components, styles and assets
   (components/experiment/, public/experiment/). Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — experiment',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function ExperimentPage() {
  return <Experiment />;
}
