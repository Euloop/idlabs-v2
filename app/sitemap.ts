import type { MetadataRoute } from 'next';
import { MAIN_PAGES, SITE_URL } from '../components/seo';

// /sitemap.xml: the main pages only (components/seo.ts MAIN_PAGES); experiments are left out
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return MAIN_PAGES.map((p) => ({ url: `${SITE_URL}${p.path === '/' ? '' : p.path}`, lastModified, changeFrequency: p.changeFrequency, priority: p.priority }));
}
