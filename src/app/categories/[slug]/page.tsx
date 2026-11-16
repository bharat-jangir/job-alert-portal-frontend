import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Calendar, Building2, MapPin, ExternalLink } from 'lucide-react';
import { apiGet, apiGetList, apiGetOptional, SITE_URL } from '@/lib/api';

const PAGE_SIZE = 20;

interface Category { _id: string; name: string; displayName?: string; slug: string }
interface Post {
  _id?: string; title: string; slug: string; lastDate?: string; organization?: string;
  location?: string; publishedAt?: string;
}
interface ExtLink { _id: string; title: string; redirectType: string; externalUrl?: string }

/** Admin "redirect links" use the category slug without hyphens, upper-cased (answer-key -> ANSWERKEY). */
const redirectType = (slug: string) => slug.replace(/-/g, '').toUpperCase();

async function getCategory(slug: string): Promise<Category | null> {
  // throws if the API is down (shows the error page / keeps the cached copy) instead of caching a false 404
  const list = await apiGet<Category[]>('/api/job-categories/active', { revalidate: 300, tags: ['categories'] });
  return (Array.isArray(list) ? list : []).find((c) => c.slug === slug) ?? null;
}

async function getPosts(slug: string, page: number) {
  const p = await apiGetList<{ jobs: Post[]; total: number; totalPages: number }>(
    `/api/jobs?type=${encodeURIComponent(slug)}&page=${page}&limit=${PAGE_SIZE}`,
    { jobs: [], total: 0, totalPages: 0 },
    { tags: ['posts'] },
  );
  return { jobs: p?.jobs ?? [], total: p?.total ?? 0, totalPages: p?.totalPages ?? 0 };
}

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = Math.max(1, Math.floor(Number((await searchParams).page)) || 1);
  const cat = await getCategory(slug);
  if (!cat) return { title: 'Not found', robots: { index: false } };
  const name = cat.displayName || cat.name;
  const { total } = await getPosts(slug, page);
  return {
    title: `${name} 2026${page > 1 ? ` – Page ${page}` : ''} – Latest Updates`,
    description: `All latest ${name.toLowerCase()} notifications, dates and direct links, updated daily.`,
    alternates: { canonical: `${SITE_URL}/categories/${slug}${page > 1 ? `?page=${page}` : ''}` },
    // an empty category is a thin page: keep it out of the index until it has content
    robots: { index: total > 0, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const page = Math.max(1, Math.floor(Number((await searchParams).page)) || 1);

  const cat = await getCategory(slug);
  if (!cat) notFound();
  const { jobs, total, totalPages } = await getPosts(slug, page);
  // ?page=999 is a real 404, not an empty page that returns 200
  if (page > 1 && jobs.length === 0) notFound();

  const name = cat.displayName || cat.name;
  // admin-curated external links for this category (first page only); a missing list is not fatal
  const external: ExtLink[] = page === 1
    ? ((await apiGetOptional<{ links?: ExtLink[] }>(`/api/redirect-links?type=${redirectType(slug)}&pageSize=50`, {})).links ?? [])
        .filter((l) => l.redirectType === 'external' && l.externalUrl)
    : [];
  // nothing to show at all: offer the newest posts instead of a dead end
  const latest: Post[] = jobs.length === 0 && external.length === 0 && page === 1
    ? await apiGetOptional<Post[]>('/api/jobs/latest?limit=8', [])
    : [];

  const itemList = jobs.length > 0 && {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: jobs.slice(0, 20).map((j, i) => ({ '@type': 'ListItem', position: (page - 1) * PAGE_SIZE + i + 1, url: `${SITE_URL}/jobs/${j.slug}`, name: j.title })),
  };

  return (
    <div className="w-full">
      {itemList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />}
      <nav className="text-xs text-gray-500 mb-2">
        <Link href="/" className="hover:underline">Home</Link> › <Link href="/categories" className="hover:underline">Categories</Link> › <span>{name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
      <p className="text-gray-500 text-sm mb-6">{total} {total === 1 ? 'post' : 'posts'} · updated daily</p>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{name} ({total})</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="text-center py-14 px-4">
            <p className="text-lg font-semibold text-gray-800">No {name.toLowerCase()} posts yet</p>
            <p className="mt-1 text-sm text-gray-500">New updates are added every day. Check back soon, or browse what is new right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <Link key={job._id || job.slug} href={`/jobs/${job.slug}`} className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 group">
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-blue-700 text-sm font-medium group-hover:underline leading-snug block">{job.title}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {job.organization && <span className="text-xs text-gray-400 flex items-center gap-0.5"><Building2 className="h-3 w-3" />{job.organization}</span>}
                    {job.location && <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="h-3 w-3" />{job.location}</span>}
                    {job.lastDate && <span className="text-xs text-red-400 flex items-center gap-0.5"><Calendar className="h-3 w-3" />Last: {new Date(job.lastDate).toLocaleDateString('en-IN')}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {external.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-700 px-4 py-3"><h2 className="text-white font-semibold text-sm uppercase tracking-wide">More links</h2></div>
          <ul className="divide-y divide-gray-100">
            {external.map((l) => (
              <li key={l._id}>
                <a href={l.externalUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 hover:underline">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {l.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {latest.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-700 px-4 py-3"><h2 className="text-white font-semibold text-sm uppercase tracking-wide">Latest updates</h2></div>
          <ul className="divide-y divide-gray-100">
            {latest.map((p) => (
              <li key={p.slug}><Link href={`/jobs/${p.slug}`} className="block px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 hover:underline">{p.title}</Link></li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={`/categories/${slug}?page=${page - 1}`} rel="prev" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">← Previous</Link>}
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`/categories/${slug}?page=${page + 1}`} rel="next" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Next →</Link>}
        </div>
      )}
    </div>
  );
}
