import type { Metadata } from 'next';
import ComingSoon from '../../components/ComingSoon';
import { NOINDEX } from '../../components/seo';

export const metadata: Metadata = {
  robots: NOINDEX, // not for search (components/seo.ts)
  title: 'Manifesto — Identity Labs',
  description: 'The Identity Labs manifesto is coming soon.',
};

export default function Manifesto() {
  return <ComingSoon page="manifesto" />;
}
