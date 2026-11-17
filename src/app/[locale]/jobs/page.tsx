// /jobs/page.tsx – SSR all-jobs listing with native fetch
import { Suspense } from 'react';
import { Loader2, MapPin, Building2, Calendar } from 'lucide-react';
import Link from '@/i18n/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { enumLabel } from '@/i18n/labels';
import { apiGetList, withLang } from '@/lib/api';
import { getT, type TFunction } from '@/i18n/dictionary';
import { formatDate, isLocale, localePath, type Locale } from '@/i18n/config';
import { pageAlternates } from '@/i18n/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale);
  const year = new Date().getFullYear();
  return {
    title: t('meta.latestJobsTitle', { year }),
    description: t('meta.jobsDescription', { year }),
    alternates: pageAlternates(locale, '/jobs'),
    robots: { index: true, follow: true },
  };
}

interface Job {
  _id: string;
  title: string;
  slug: string;
  organization: string;
  location: string;
  salary: string;
  qualification: string;
  experience: string;
  lastDate: string;
  tags: string[];
}

interface JobsData {
  jobs: Job[];
  total: number;
}

interface JobsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

async function getJobs(locale: Locale, page: number = 1, search?: string): Promise<JobsData> {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (search) params.set('search', search);
  // throws if the API is down: no empty page gets cached (see lib/api.ts)
  const payload = await apiGetList<any>(withLang(`/api/jobs?${params}`, locale), {}, { tags: ['posts'] });
  return { jobs: payload?.jobs || [], total: payload?.total || 0 };
}

function JobsList({ jobs, locale, t }: { jobs: Job[]; locale: Locale; t: TFunction }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">💼</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('list.noJobsTitle')}</h3>
        <p className="text-gray-500">{t('list.noJobsAvailable')}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Link
          key={job._id}
          href={`/jobs/${job.slug}`}
          className="block bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
        >
          <div className="p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-blue-700 group-hover:text-blue-800 mb-1 leading-snug">
                  {job.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                  {job.organization && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />{job.organization}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{job.location}
                    </span>
                  )}
                  {job.lastDate && (
                    <span className="flex items-center gap-1 text-red-500 font-medium">
                      <Calendar className="h-3 w-3" />{t('common.lastDate', { date: formatDate(job.lastDate, locale) })}
                    </span>
                  )}
                </div>
              </div>
              {job.salary && (
                <div className="text-sm font-semibold text-green-700 whitespace-nowrap flex-shrink-0">
                  {job.salary}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.experience && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{enumLabel(t, 'experience', job.experience)}</span>
              )}
              {job.qualification && (
                <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">{enumLabel(t, 'qualification', job.qualification)}</span>
              )}
              {(job.tags || []).slice(0, 3).map((tag, i) => (
                <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{tag}</span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Pagination({ currentPage, totalPages, search, t }: { currentPage: number; totalPages: number; search: string; t: TFunction }) {
  const pages: React.ReactNode[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  const href = (p: number) => `/jobs?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

  if (start > 1) {
    pages.push(<Link key="first" href={href(1)} className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-sm">1</Link>);
    if (start > 2) pages.push(<span key="s-ellipsis" className="px-2 text-gray-400">…</span>);
  }
  for (let i = start; i <= end; i++) {
    pages.push(
      <Link key={i} href={href(i)} className={`px-3 py-1.5 rounded border text-sm ${currentPage === i ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>{i}</Link>
    );
  }
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push(<span key="e-ellipsis" className="px-2 text-gray-400">…</span>);
    pages.push(<Link key="last" href={href(totalPages)} className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-sm">{totalPages}</Link>);
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      {currentPage > 1 && (
        <Link href={href(currentPage - 1)} className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-sm">{t('common.prev')}</Link>
      )}
      {pages}
      {currentPage < totalPages && (
        <Link href={href(currentPage + 1)} className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-sm">{t('common.next')}</Link>
      )}
    </div>
  );
}

export default async function JobsPage({ params, searchParams }: JobsPageProps) {
  const locale = (await params).locale as Locale;
  const t = getT(locale);
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || '';
  const { jobs, total } = await getJobs(locale, currentPage, search);
  // a page number beyond the last one is a real 404, not an empty 200 page
  if (currentPage > 1 && jobs.length === 0) notFound();
  const totalPages = Math.ceil(total / 10);
  const from = ((currentPage - 1) * 10) + 1;
  const to = Math.min(currentPage * 10, total);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('list.latestHeading', { year: new Date().getFullYear() })}</h1>
        <p className="text-gray-500 text-sm">{t('list.jobsSub')}</p>
      </div>

      {/* Search */}
      <form action={localePath(locale, '/jobs')} method="GET" className="flex gap-2 mb-6">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder={t('list.jobsSearchPlaceholder')}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">{t('common.search')}</button>
      </form>

      {search && (
        <div className="mb-4 text-sm text-gray-500">
          {t('list.showingResultsFor')} <strong className="text-gray-800">"{search}"</strong> &nbsp;
          <Link href="/jobs" className="text-blue-600 hover:underline">{t('common.clear')}</Link>
        </div>
      )}

      {/* Count */}
      {total > 0 && (
        <div className="mb-4 text-xs text-gray-400">{t('list.showing', { from, to, total })}</div>
      )}

      {/* Jobs List */}
      <Suspense fallback={<div className="flex justify-center items-center py-16 gap-2"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /><span className="text-gray-500">{t('list.loadingJobs')}</span></div>}>
        <JobsList jobs={jobs} locale={locale} t={t} />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} search={search} t={t} />}
    </div>
  );
}