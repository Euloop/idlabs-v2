import type { Metadata } from 'next';
import LegalPage from '../../components/legal/LegalPage';
import { PRIVACY } from '../../components/legal/content';

export const metadata: Metadata = {
  title: 'Privacy Policy — Identity Labs',
  description: 'How Identity Labs collects, uses and protects personal data on this website.',
};

export default function Privacy() {
  return <LegalPage doc={PRIVACY} kind="privacy" />;
}
