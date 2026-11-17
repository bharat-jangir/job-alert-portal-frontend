import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from '@/i18n/link';
import { apiGetList, withLang } from '@/lib/api';
import { getT } from '@/i18n/dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { pageAlternates } from '@/i18n/seo';
import PostRow, { type PostRowData } from '@/components/PostRow';
import Pager from '@/components/Pager';

const PAGE_SIZE = 20;
type Props = {
  params: Promise<{ locale: string; tag: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getPosts(tag: string, page: number, locale: Locale): Promise<{ jobs: PostRowData[]; total: number; totalPages: number }> {
  // throws if the API is down (see lib/api.ts): never cache an empty tag page
  const p = await apiGetList<{ jobs: PostRowData[]; total: number; totalPages: number }>(
    withLang(`/api/jobs?tag=${encodeURIComponent(tag)}&page=${page}&limit=${PAGE_SIZE}`, locale),
    { jobs: [], total: 0, totalPages: 0 },
    { tags: ['posts'] },
  );
  return { jobs: p?.jobs ?? [], total: p?.total ?? 0, totalPages: p?.totalPages ?? 0 };
}

const decode = (t: string) => { try { return decodeURIComponent(t); } catch { return t; } };
const pageNumber = async (sp: Props['searchParams']) => Math.max(1, Math.floor(Number((await sp).page)) || 1);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, tag: rawTag } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale);
  const tag = decode(rawTag);
  const page = await pageNumber(searchParams);
  const { total } = await getPosts(tag, page, locale);
  return {
    title: `${t('meta.tagTitle', { tag })}${page > 1 ? ` – ${t('meta.pageSuffix', { page })}` : ''}`,
    description: t('meta.tagDescription', { tag }),
    alternates: pageAlternates(locale, `/tags/${encodeURIComponent(tag)}${page > 1 ? `?page=${page}` : ''}`),
    // thin tag archives hurt SEO: only index tags that have enough posts
    robots: { index: total >= 3, follow: true },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const p = await params;
  const locale = p.locale as Locale;
  const t = getT(locale);
  const tag = decode(p.tag);
  const page = await pageNumber(searchParams);
  const { jobs, total, totalPages } = await getPosts(tag, page, locale);
  // no posts for this tag, or a page number beyond the last one: a real 404, not an empty 200 page
  if (jobs.length === 0) notFound();
  return (
    <div className="w-full">
      <nav className="text-xs text-gray-500 mb-2">
        <Link href="/" className="hover:underline">{t('common.home')}</Link> › <span>#{tag}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">#{tag}</h1>
      <p className="text-gray-500 text-sm mb-6">{total === 1 ? t('common.post1') : t('common.posts', { count: total })} · {t('common.updatedDaily')}</p>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{tag} ({total})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {jobs.map((job) => <PostRow key={job._id || job.slug} job={job} locale={locale} t={t} />)}
        </div>
      </div>

      <Pager base={`/tags/${encodeURIComponent(tag)}`} page={page} totalPages={totalPages} t={t} />
    </div>
  );
}
