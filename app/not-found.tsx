import type { Metadata } from 'next';
import FibLines from '../components/flow/FibLines';
import './not-found.css';

/* 404: unmatched URLs anywhere on the site. Quiet, like /exp: the wordmark, one line, a way home.
   Next adds noindex to this page itself. */

export const metadata: Metadata = { title: 'Identity Labs — Page not found' };

export default function NotFound() {
  return (
    <main className="nf">
      {/* the loader's Fibonacci diagram, faint behind (FibLines, as .sl-fib) */}
      <FibLines className="nf-fib" fit="slice" />
      <a className="wordmark nf-mark" href="/" aria-label="Identity Labs home">
        <span>Identity</span>
        <span className="wm-space"> </span>
        <em>Labs</em>
      </a>
      <div className="nf-body">
        <p className="nf-code">404</p>
        <h1 className="nf-title">Page not found</h1>
        <a className="nf-home" href="/"><span className="nf-arrow" aria-hidden="true">←</span><span className="nf-text">Back to the home page</span></a>
      </div>
    </main>
  );
}
