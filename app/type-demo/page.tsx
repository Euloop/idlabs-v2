import type { Metadata, Viewport } from 'next';
import TypeDemo from './TypeDemo';
import './type-demo.css';

/* /type-demo: the TokenText animation on its own, white background, looping a few lines.
   For screen-recording social posts. Not linked from the site. */

export const metadata: Metadata = {
  title: 'Identity Labs — type demo',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function TypeDemoPage() {
  return <TypeDemo />;
}
