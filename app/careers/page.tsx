import type { Metadata } from 'next';
import ComingSoon from '../../components/ComingSoon';
import { NOINDEX } from '../../components/seo';

export const metadata: Metadata = {
  robots: NOINDEX, // not for search (components/seo.ts)
  title: 'Careers — Identity Labs',
  description: 'Careers at Identity Labs: the page is coming soon; the open roles are listed meanwhile.',
};

export default function Careers() {
  return <ComingSoon page="careers" />;
}
