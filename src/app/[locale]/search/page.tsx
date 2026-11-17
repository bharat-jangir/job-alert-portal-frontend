// /search/page.tsx – Premium search with pagination + all-jobs fallback
import Link from '@/i18n/link';
import { Metadata } from 'next';
import { Search, Building2, MapPin, Clock, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiGetList, withLang } from '@/lib/api';
import { getT, type TFunction } from '@/i18n/dictionary';
import { formatDate, isLocale, type Locale } from '@/i18n/config';
import { enumLabel } from '@/i18n/labels';

const PAGE_SIZE = 15;

interface Job {
  _id: string;
  slug: string;
  title: string;
  organization?: string;
  location?: string;
  salary?: string;
  lastDate?: string;
  type?: string;
  qualification?: string;
  experience?: string;
  tags?: string[];
}

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  job:              { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Job' },
  result:           { bg: 'bg-green-100',   text: 'text-green-700',   label: 'Result' },
  'answer-key':     { bg: 'bg-orange-100',  text: 'text-orange-700',  label: 'Answer Key' },
  'admit-card':     { bg: 'bg-purple-100',  text: 'text-purple-700',  label: 'Admit Card' },
  'online-form':    { bg: 'bg-pink-100',    text: 'text-pink-700',    label: 'Online Form' },
  admission:        { bg: 'bg-teal-100',    text: 'text-teal-700',    label: 'Admission' },
  syllabus:         { bg: 'bg-yellow-100',  text: 'text-yellow-700',  label: 'Syllabus' },
  upcoming:         { bg: 'bg-indigo-100',  text: 'text-indigo-700',  label: 'Upcoming' },
  verification:     { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Verification' },
  'sarkari-yojana': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Yojana' },
  update:           { bg: 'bg-gray-100',    text: 'text-gray-600',    label: 'Update' },
};

function getTypeStyle(type: string | undefined, t: TFunction) {
  const c = TYPE_COLORS[type || ''] || { bg: 'bg-gray-100', text: 'text-gray-600', label: type || 'Post' };
  return { ...c, label: enumLabel(t, 'types', type) || c.label };
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 not-italic">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

async function fetchJobs(params: URLSearchParams, locale: Locale): Promise<{ jobs: Job[]; total: number }> {
  // never cached; throws if the API is down so the visitor gets "try again", not a misleading "No jobs available"
  const payload = await apiGetList<any>(withLang(`/api/jobs?${params}`, locale), {}, { revalidate: 0 });
  return {
    jobs: payload?.jobs || (Array.isArray(payload) ? payload : []),
    total: payload?.total || 0,
  };
}

export async function generateMetadata({ params, searchParams }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale);
  const q = (await searchParams).q?.trim() || '';
  const year = new Date().getFullYear();
  return {
    title: q ? t('meta.searchTitle', { q }) : t('meta.searchTitleBrowse', { year }),
    description: q ? t('meta.searchDescription', { q }) : t('meta.searchDescriptionBrowse', { year }),
    robots: { index: false, follow: true },
  };
}

function JobCard({ job, query, locale, t }: { job: Job; query: string; locale: Locale; t: TFunction }) {
  const typeStyle = getTypeStyle(job.type, t);
  const isExpired = job.lastDate ? new Date(job.lastDate) < new Date() : false;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${typeStyle.bg} ${typeStyle.text}`}>
            {typeStyle.label}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition leading-snug mb-1.5">
              <HighlightedText text={job.title} query={query} />
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {job.organization && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <HighlightedText text={job.organization} query={query} />
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3 flex-shrink-0" />{job.location}
                </span>
              )}
              {job.lastDate && (
                <span className={`flex items-center gap-1 text-xs font-medium ${isExpired ? 'text-red-500' : 'text-orange-500'}`}>
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  {isExpired ? t('search.expired') : t('search.last')}
                  {formatDate(job.lastDate, locale)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {job.salary && (
                <span className="text-[11px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded font-medium">
                  {job.salary}
                </span>
              )}
              {job.qualification && (
                <span className="text-[11px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded">
                  {enumLabel(t, 'qualification', job.qualification)}
                </span>
              )}
              {(job.tags || []).slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[11px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  currentPage, totalPages, q, t,
}: { currentPage: number; totalPages: number; q: string; t: TFunction }) {
  const href = (p: number) =>
    `/search?${q ? `q=${encodeURIComponent(q)}&` : ''}page=${p}`;

  const range: number[] = [];
  const delta = 2;
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  for (let i = left; i <= right; i++) range.push(i);

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5 flex-wrap">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition">
          <ChevronLeft className="h-4 w-4" /> {t('common.prev').replace('← ', '')}
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-300 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" /> {t('common.prev').replace('← ', '')}
        </span>
      )}

      {/* First page + ellipsis */}
      {left > 1 && (
        <>
          <Link href={href(1)} className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-400 transition">1</Link>
          {left > 2 && <span className="px-2 text-gray-400 text-sm">…</span>}
        </>
      )}

      {/* Page range */}
      {range.map((p) => (
        <Link key={p} href={href(p)}
          className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
            p === currentPage
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
          }`}>
          {p}
        </Link>
      ))}

      {/* Last page + ellipsis */}
      {right < totalPages && (
        <>
          {right < totalPages - 1 && <span className="px-2 text-gray-400 text-sm">…</span>}
          <Link href={href(totalPages)} className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-400 transition">{totalPages}</Link>
        </>
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition">
          {t('common.next').replace(' →', '')} <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-300 cursor-not-allowed">
          {t('common.next').replace(' →', '')} <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const locale = (await params).locale as Locale;
  const t = getT(locale);
  const resolvedParams = await searchParams;
  const q = (resolvedParams.q || '').trim();
  const currentPage = Math.max(1, Number(resolvedParams.page) || 1);

  const qs = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(currentPage) });
  if (q) qs.set('search', q);

  const { jobs, total } = await fetchJobs(qs, locale);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = ((currentPage - 1) * PAGE_SIZE) + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);
  const isSearch = !!q;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Quick chips — browse mode only */}
      {!isSearch && (
        <div className="bg-blue-700 px-4 py-3">
          <div className="max-w-4xl mx-auto flex flex-wrap gap-2 items-center">
            <span className="text-xs text-blue-200 font-medium mr-1">{t('search.quick')}</span>
            {['SSC CGL', 'UPSC IAS', 'PM Kisan', 'RRB NTPC', 'Bihar Police', 'IBPS PO'].map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}
                className="text-xs text-blue-100 bg-blue-600 hover:bg-blue-500 border border-blue-500 px-3 py-1 rounded-full transition">
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active search strip */}
      {isSearch && (
        <div className="bg-blue-700 px-4 py-2.5">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Search className="h-4 w-4 text-blue-200 flex-shrink-0" />
            <span className="text-sm text-blue-100">{t('search.resultsFor')} <strong className="text-white">"{q}"</strong></span>
          </div>
        </div>
      )}

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-blue-600">{t('common.home')}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-600">{t('search.breadcrumb')}</span>
            {isSearch && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-700 truncate max-w-[200px]">"{q}"</span>
              </>
            )}
          </nav>

          {/* Header row — count + clear */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              {isSearch ? (
                <h1 className="text-lg font-bold text-gray-800">
                  {total > 0
                    ? <>{total === 1 ? t('search.resultCount1') : t('search.resultCount', { count: total })} <span className="text-blue-600">"{q}"</span></>
                    : <>{t('search.noResultsFor')} <span className="text-blue-600">"{q}"</span></>
                  }
                </h1>
              ) : (
                <h1 className="text-lg font-bold text-gray-800">
                  {t('search.allJobs')}
                  {total > 0 && <span className="ml-2 text-sm font-normal text-gray-500">{t('search.postsCount', { count: total })}</span>}
                </h1>
              )}
              {total > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{t('search.showing', { from, to, total })}</p>
              )}
            </div>
            {isSearch && (
              <Link href="/search"
                className="flex-shrink-0 text-xs text-gray-500 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 px-3 py-1.5 rounded-lg transition">
                {t('search.clearSearch')}
              </Link>
            )}
          </div>

          {/* Results */}
          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {isSearch ? t('search.nothingFound') : t('search.noJobsAvailable')}
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                {isSearch ? t('search.tryDifferent') : t('search.checkLater')}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  <FileText className="h-4 w-4" /> {t('search.browseAll')}
                </Link>
                <Link href="/categories/result" className="inline-flex items-center gap-1.5 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">{t('nav.results')}</Link>
                <Link href="/categories/admit-card" className="inline-flex items-center gap-1.5 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">{t('nav.admitCards')}</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {jobs.map((job) => <JobCard key={job._id} job={job} query={q} locale={locale} t={t} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} q={q} t={t} />
              )}

              {/* Related searches (search mode only) */}
              {isSearch && (
                <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('search.related')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {[t('search.suffixResult', { q }), t('search.suffixAdmit', { q }), t('search.suffixAnswer', { q }), t('search.suffixSyllabus', { q }), `${q} ${new Date().getFullYear()}`].map((s) => (
                      <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}
                        className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-full transition">
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}