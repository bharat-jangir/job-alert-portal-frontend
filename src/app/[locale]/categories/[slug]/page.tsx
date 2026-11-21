import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import Link from '@/i18n/link';
import { apiGet, apiGetList, apiGetOptional, withLang } from '@/lib/api';
import { getT } from '@/i18n/dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { pageAlternates } from '@/i18n/seo';
import PostRow, { type PostRowData } from '@/components/PostRow';
import Pager from '@/components/Pager';

const PAGE_SIZE = 20;

interface Category { _id: string; name: string; displayName?: string; slug: string }
interface ExtLink { _id: string; title: string; redirectType: string; externalUrl?: string }
type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

/** Admin "redirect links" use the category slug without hyphens, upper-cased (answer-key -> ANSWERKEY). */
const redirectType = (slug: string) => slug.replace(/-/g, '').toUpperCase();

async function getCategory(slug: string, locale: Locale): Promise<Category | null> {
  // throws if the API is down (shows the error page / keeps the cached copy) instead of caching a false 404
  const list = await apiGet<Category[]>(withLang('/api/job-categories/active', locale), { revalidate: 300, tags: ['categories'] });
  return (Array.isArray(list) ? list : []).find((c) => c.slug === slug) ?? null;
}

async function getPosts(slug: string, page: number, locale: Locale) {
  const p = await apiGetList<{ jobs: PostRowData[]; total: number; totalPages: number }>(
    withLang(`/api/jobs?type=${encodeURIComponent(slug)}&page=${page}&limit=${PAGE_SIZE}`, locale),
    { jobs: [], total: 0, totalPages: 0 },
    { tags: ['posts'] },
  );
  return { jobs: p?.jobs ?? [], total: p?.total ?? 0, totalPages: p?.totalPages ?? 0 };
}

const pageNumber = async (searchParams: Props['searchParams']) => Math.max(1, Math.floor(Number((await searchParams).page)) || 1);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale);
  const page = await pageNumber(searchParams);
  const cat = await getCategory(slug, locale);
  if (!cat) return { title: t('meta.notFoundTitle'), robots: { index: false } };
  const name = cat.displayName || cat.name;
  const { total } = await getPosts(slug, page, locale);
  const year = new Date().getFullYear();
  return {
    title: page > 1 ? t('meta.categoryTitlePage', { name, year, page }) : t('meta.categoryTitle', { name, year }),
    description: t('meta.categoryDescription', { name: name.toLowerCase() }),
    alternates: pageAlternates(locale, `/categories/${slug}${page > 1 ? `?page=${page}` : ''}`),
    // an empty category is a thin page: keep it out of the index until it has content
    robots: { index: total > 0, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const locale = (await params).locale as Locale;
  const t = getT(locale);
  const page = await pageNumber(searchParams);

  const cat = await getCategory(slug, locale);
  if (!cat) notFound();
  const { jobs, total, totalPages } = await getPosts(slug, page, locale);
  // ?page=999 is a real 404, not an empty page that returns 200
  if (page > 1 && jobs.length === 0) notFound();

  const name = cat.displayName || cat.name;
  // admin-curated external links for this category (first page only); a missing list is not fatal
  const external: ExtLink[] = page === 1
    ? ((await apiGetOptional<{ links?: ExtLink[] }>(`/api/redirect-links?type=${redirectType(slug)}&pageSize=50`, {})).links ?? [])
        .filter((l) => l.redirectType === 'external' && l.externalUrl)
    : [];
  // nothing to show at all: offer the newest posts instead of a dead end
  const latest: PostRowData[] = jobs.length === 0 && external.length === 0 && page === 1
    ? await apiGetOptional<PostRowData[]>(withLang('/api/jobs/latest?limit=8', locale), [])
    : [];

  const siteUrl = SITE_URL;
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const itemList = jobs.length > 0 && {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: jobs.slice(0, 20).map((j, i) => ({ '@type': 'ListItem', position: (page - 1) * PAGE_SIZE + i + 1, url: `${siteUrl}${prefix}/jobs/${j.slug}`, name: j.title })),
  };

  return (
    <div className="w-full">
      {itemList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />}
      <nav className="text-xs text-gray-500 mb-2">
        <Link href="/" className="hover:underline">{t('common.home')}</Link> › <Link href="/categories" className="hover:underline">{t('common.categories')}</Link> › <span>{name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
      <p className="text-gray-500 text-sm mb-6">{total === 1 ? t('common.post1') : t('common.posts', { count: total })} · {t('common.updatedDaily')}</p>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{name} ({total})</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="text-center py-14 px-4">
            <p className="text-lg font-semibold text-gray-800">{t('list.emptyCategoryTitle', { name: name.toLowerCase() })}</p>
            <p className="mt-1 text-sm text-gray-500">{t('list.emptyCategoryText')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => <PostRow key={job._id || job.slug} job={job} locale={locale} t={t} />)}
          </div>
        )}
      </div>

      {external.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-700 px-4 py-3"><h2 className="text-white font-semibold text-sm uppercase tracking-wide">{t('list.moreLinks')}</h2></div>
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
          <div className="bg-gray-700 px-4 py-3"><h2 className="text-white font-semibold text-sm uppercase tracking-wide">{t('list.latestUpdates')}</h2></div>
          <ul className="divide-y divide-gray-100">
            {latest.map((p) => (
              <li key={p.slug}><Link href={`/jobs/${p.slug}`} className="block px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 hover:underline">{p.title}</Link></li>
            ))}
          </ul>
        </div>
      )}

      <Pager base={`/categories/${slug}`} page={page} totalPages={totalPages} t={t} />
    </div>
  );
}
