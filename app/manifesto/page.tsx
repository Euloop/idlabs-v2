import type { Metadata } from 'next';
import ComingSoon from '../../components/ComingSoon';

export const metadata: Metadata = {
  title: 'Manifesto — Identity Labs',
  description: 'The Identity Labs manifesto is coming soon.',
};

export default function Manifesto() {
  return <ComingSoon page="manifesto" />;
}
