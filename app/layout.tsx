import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Identity Labs',
  description:
    'Identity Labs is a consulting firm based in San Francisco. The largest tech companies on earth rely on our algorithm research, analytics software, and deployed services to reach a billion people.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#2a2c31' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/assets/texture.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/fonts/instrument-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/ibm-plex-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
