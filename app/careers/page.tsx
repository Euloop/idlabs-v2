import type { Metadata } from 'next';
import ComingSoon from '../../components/ComingSoon';

export const metadata: Metadata = {
  title: 'Careers — Identity Labs',
  description: 'Careers at Identity Labs: the page is coming soon; the open roles are listed meanwhile.',
};

export default function Careers() {
  return <ComingSoon page="careers" />;
}
