import type { Metadata } from 'next';
import { NOINDEX } from '../../../components/seo';
import './unlock.css';

/* /exp/unlock: the password form in front of /exp (the check itself is in proxy.ts, on the server;
   this page holds no password and does no checking). */

export const metadata: Metadata = { title: 'Identity Labs — Experiments', robots: NOINDEX };

export default async function Unlock({ searchParams }: { searchParams: Promise<{ next?: string; e?: string }> }) {
  const { next, e } = await searchParams;
  const to = typeof next === 'string' && next.startsWith('/exp') ? next : '/exp';
  return (
    <main className="xu">
      <form className="xu-form" method="post" action="/exp/unlock">
        <label className="xu-label" htmlFor="xu-pw">Password</label>
        <input id="xu-pw" className="xu-input" type="password" name="password" autoComplete="current-password" autoFocus required />
        <input type="hidden" name="next" value={to} />
        <button className="xu-button" type="submit">Enter</button>
        {e ? <p className="xu-error" role="alert">That password isn&apos;t right.</p> : null}
      </form>
    </main>
  );
}
