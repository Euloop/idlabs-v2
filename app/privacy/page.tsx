import type { Metadata } from 'next';
import LegalPage from '../../components/legal/LegalPage';
import { PRIVACY } from '../../components/legal/content';
import { SITE_URL } from '../../components/seo';

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/privacy` },
  title: 'Privacy Policy — Identity Labs',
  description: 'How Identity Labs collects, uses and protects personal data on this website.',
};

export default function Privacy() {
  return <LegalPage doc={PRIVACY} kind="privacy" />;
}
