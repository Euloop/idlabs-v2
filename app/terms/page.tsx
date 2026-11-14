import type { Metadata } from 'next';
import LegalPage from '../../components/legal/LegalPage';
import { TERMS } from '../../components/legal/content';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Identity Labs',
  description: 'The terms that govern your use of the Identity Labs website and its tools.',
};

export default function Terms() {
  return <LegalPage doc={TERMS} kind="terms" />;
}
