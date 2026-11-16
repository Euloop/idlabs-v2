import type { Metadata, Viewport } from 'next';
import SmoothScroll from '../components/SmoothScroll';
import './globals.css';

// the site's address, for the link previews' absolute URLs (opengraph-image / twitter-image): the production domain
// Vercel gives the build, else identitylabs.com
const SITE = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://identitylabs.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Identity Labs',
  openGraph: { siteName: 'Identity Labs', type: 'website' },
  twitter: { card: 'summary_large_image' },
  description:
    'Identity Labs is a consulting firm based in London. The largest tech companies on earth rely on our algorithm research, analytics software, and deployed services to reach a billion people.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#2a2c31' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // suppressHydrationWarning: the pages' inline scripts set html data-* attributes before React hydrates
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/assets/texture.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/fonts/instrument-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/ibm-plex-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body><SmoothScroll />{children}</body>
    </html>
  );
}
