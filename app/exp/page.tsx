import type { Metadata } from 'next';
import { NOINDEX } from '../../components/seo';
import './unlock/unlock.css';

/* /exp: the index of experiments and old versions (behind the password, proxy.ts) */

export const metadata: Metadata = { title: 'Identity Labs — Experiments', robots: NOINDEX };

const PAGES = [
  ['/exp/home-4', 'Home 4 — the home page with its option tabs'],
  ['/exp/home-4/classic', 'Home 4 — classic loader'],
  ['/exp/home-3', 'Home 3 — immersive'],
  ['/exp/home-2', 'Home 2 — flowchart version'],
  ['/exp/old-home', 'Old home page'],
  ['/exp/hero', 'Hero'],
  ['/exp/footer', 'Footer variants'],
  ['/exp/launches-2', 'Launches 2'],
  ['/exp/experiment', 'Experiment'],
  ['/exp/type-demo', 'Type demo'],
  ['/exp/temp', 'Section 2 snapshot (v1)'],
  ['/exp/temp2', 'Section 2 snapshot (v2)'],
] as const;

export default function ExpIndex() {
  return (
    <main className="xu">
      <nav className="xu-form" aria-label="Experiments">
        <p className="xu-label">Experiments</p>
        {PAGES.map(([href, label]) => (
          <a key={href} href={href} className="xu-link">{label}</a>
        ))}
      </nav>
    </main>
  );
}
