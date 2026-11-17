import type { MetadataRoute } from 'next';
import { SITE_URL } from '../components/seo';

/* /robots.txt: every crawler, search and AI answer engines alike, may read the site; the experimental
   routes carry noindex in their own metadata instead of a Disallow here (a disallowed page can't be
   read, so its noindex would never be seen). */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
