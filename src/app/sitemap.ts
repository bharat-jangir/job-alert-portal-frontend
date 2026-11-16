// frontend/src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { apiGet, SITE_URL as BASE_URL } from '@/lib/api';

interface Slug { slug: string; updatedAt?: string }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // These THROW when the API is down: Google then gets an error (and retries) or the last good sitemap,
  // never an empty one that would look like "every page was removed".
  const [posts, categories] = await Promise.all([
    apiGet<Slug[]>('/api/jobs/sitemap', { revalidate: 600, tags: ['sitemap'] }),
    apiGet<{ slug: string }[]>('/api/job-categories/active', { revalidate: 600, tags: ['sitemap', 'categories'] }),
  ]);

  // only categories that have posts: empty ones are noindex, so listing them would contradict the page
  const counted = await Promise.all(
    (Array.isArray(categories) ? categories : []).map(async (c) => {
      try {
        const r = await apiGet<{ total?: number }>(`/api/jobs?type=${encodeURIComponent(c.slug)}&limit=1`, { revalidate: 600, tags: ['sitemap', 'posts'] });
        return (r?.total ?? 0) > 0 ? c.slug : null;
      } catch {
        return null; // one failing category must not fail the whole sitemap
      }
    }),
  );

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE_URL}/latest-jobs`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/jobs`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/about-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/dmca`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = counted
    .filter((s): s is string => !!s)
    .map((slug) => ({ url: `${BASE_URL}/categories/${slug}`, lastModified: now, changeFrequency: 'hourly' as const, priority: 0.8 }));

  const postRoutes: MetadataRoute.Sitemap = (Array.isArray(posts) ? posts : []).map((p) => ({
    url: `${BASE_URL}/jobs/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
