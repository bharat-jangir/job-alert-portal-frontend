// content only, chrome comes from latest-jobs/layout.tsx
import type { Metadata } from 'next';
import Link from '@/i18n/link';
import { apiGet, withLang } from '@/lib/api';
import { getT } from '@/i18n/dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { pageAlternates } from '@/i18n/seo';
import PostRow, { type PostRowData } from '@/components/PostRow';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale);
  const year = new Date().getFullYear();
  return {
    title: t('meta.latestJobsTitle', { year }),
    description: t('meta.latestJobsDescription', { year }),
    alternates: pageAlternates(locale, '/latest-jobs'),
    robots: { index: true, follow: true },
  };
}

async function getAllJobs(locale: Locale): Promise<PostRowData[]> {
  // throws if the API is down: Next keeps the last good page instead of caching an empty list
  const payload = await apiGet<any>(withLang('/api/jobs/latest?limit=50', locale), { tags: ['posts'] });
  return Array.isArray(payload) ? payload : payload?.jobs || [];
}

export default async function LatestJobsPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const t = getT(locale);
  const jobs = await getAllJobs(locale);
  const year = new Date().getFullYear();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('list.latestHeading', { year })}</h1>
        <p className="text-gray-500 text-sm">{t('list.latestSub')}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{t('list.latestBox', { count: jobs.length })}</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('list.noJobsTitle')}</h3>
            <p className="text-gray-500">{t('list.noJobsText')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => <PostRow key={job._id || job.slug} job={job} locale={locale} t={t} isNew />)}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/jobs" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-sm">
          {t('list.viewAllWithFilters')}
        </Link>
      </div>
    </div>
  );
}
