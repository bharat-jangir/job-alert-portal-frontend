// frontend/src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { apiGet, SITE_URL as BASE_URL } from '@/lib/api';
import { LOCALE_META, localePath } from '@/i18n/config';

interface Slug { slug: string; updatedAt?: string; languages?: string[] }

const url = (lang: 'en' | 'hi', path: string) => `${BASE_URL}${localePath(lang, path) === '/' ? '' : localePath(lang, path)}` || BASE_URL;

/** One entry per language with hreflang alternates, for pages that exist in both languages. */
function bilingual(path: string, base: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>, langs: ('en' | 'hi')[] = ['en', 'hi']): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  if (langs.length > 1) {
    for (const l of langs) languages[LOCALE_META[l].hreflang] = url(l, path);
    languages['x-default'] = url('en', path);
  }
  return langs.map((l) => ({ url: url(l, path), ...base, ...(langs.length > 1 ? { alternates: { languages } } : {}) }));
}

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
  const hourly = { lastModified: now, changeFrequency: 'hourly' as const };
  // pages that exist in English only: their /hi/ twin is noindex, so it is not listed
  const staticRoutes: MetadataRoute.Sitemap = [
    ...bilingual('/', { ...hourly, priority: 1 }),
    ...bilingual('/latest-jobs', { ...hourly, priority: 0.9 }),
    ...bilingual('/jobs', { ...hourly, priority: 0.9 }),
    ...bilingual('/categories', { lastModified: now, changeFrequency: 'weekly', priority: 0.6 }),
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
    .flatMap((slug) => bilingual(`/categories/${slug}`, { ...hourly, priority: 0.8 }));

  // a post is listed in Hindi only when it really has a Hindi version
  const postRoutes: MetadataRoute.Sitemap = (Array.isArray(posts) ? posts : []).flatMap((p) =>
    bilingual(
      `/jobs/${p.slug}`,
      { lastModified: p.updatedAt ? new Date(p.updatedAt) : now, changeFrequency: 'weekly', priority: 0.7 },
      p.languages?.includes('hi') ? ['en', 'hi'] : ['en'],
    ),
  );

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
