import type { NextConfig } from 'next';

// The experiments and old versions of the site moved under /exp (behind a password, proxy.ts) on
// 2026-11-25; their old addresses forward there. Exact paths only: /experiment/* is also the public
// folder of that page's fonts and images, which must stay where they are.
const MOVED = ['/old-home', '/hero', '/home-2', '/home-3', '/home-4', '/home-4/classic', '/launches-2', '/type-demo', '/temp', '/temp2', '/footer', '/experiment'];

/* No static export since 2026-11-25: /exp's password check (proxy.ts) needs a server. The pages are
   still prerendered; Vercel serves them as before. */
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: {
    agentUpgrade: 'security',
  },
  async redirects() {
    return MOVED.map((p) => ({ source: p, destination: `/exp${p}`, permanent: true }));
  },
};

export default nextConfig;
