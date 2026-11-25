import { NextResponse, type NextRequest } from 'next/server';

/* /exp/*: the experiments and old versions of the site, behind a password (2026-11-25).

   The password is only ever in the server's environment (EXP_PASSWORD on Vercel, .env.local in
   development): never in the repo, never in anything sent to a browser. The unlock form posts here,
   the check runs here, and what the browser keeps is an httpOnly cookie holding an HMAC derived from
   the password, not the password itself. Changing EXP_PASSWORD signs everyone out. With no
   EXP_PASSWORD set, /exp stays shut. */

const COOKIE = 'exp_pass';
const UNLOCK = '/exp/unlock';
const enc = new TextEncoder();

async function token(secret: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('idlabs-exp-v1'));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

// constant-time comparison of two hex strings
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// only ever send people back into /exp (no open redirect)
function safeNext(v: unknown) {
  return typeof v === 'string' && /^\/exp(\/|\?|$)/.test(v) && !v.includes('\\') ? v : '/exp';
}

function toUnlock(req: NextRequest, next: string, wrong = false) {
  const u = new URL(UNLOCK, req.url);
  u.search = '';
  u.searchParams.set('next', next);
  if (wrong) u.searchParams.set('e', '1');
  return NextResponse.redirect(u, 303);
}

export async function proxy(req: NextRequest) {
  const secret = process.env.EXP_PASSWORD;
  const { pathname, search } = req.nextUrl;

  if (pathname === UNLOCK) {
    if (req.method !== 'POST') return NextResponse.next();
    const form = await req.formData().catch(() => null);
    const next = safeNext(form?.get('next'));
    const given = String(form?.get('password') ?? '');
    if (!secret || !given || !same(await token(given), await token(secret))) return toUnlock(req, next, true);
    const res = NextResponse.redirect(new URL(next, req.url), 303);
    res.cookies.set(COOKIE, await token(secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/exp',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  const cookie = req.cookies.get(COOKIE)?.value;
  if (secret && cookie && same(cookie, await token(secret))) {
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }
  return toUnlock(req, pathname + search);
}

export const config = { matcher: ['/exp', '/exp/:path*'] };
