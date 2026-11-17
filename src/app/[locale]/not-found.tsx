'use client';

import Link from '@/i18n/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { localePath } from '@/i18n/config';
import { useLocale, useT } from '@/i18n/provider';

const popular = [
  ['nav.latestJobs', '/latest-jobs'],
  ['nav.results', '/categories/result'],
  ['nav.admitCards', '/categories/admit-card'],
  ['nav.answerKeys', '/categories/answer-key'],
  ['nav.onlineForms', '/categories/online-form'],
  ['footer.allCategories', '/categories'],
] as const;

export default function NotFound() {
  const t = useT();
  const locale = useLocale();
  return (
    <>
      <meta name="robots" content="noindex, follow" />
      <Header />
      <main className="bg-gray-100 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl font-bold text-blue-600">404</p>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">{t('errors.notFoundHeading')}</h1>
          <p className="mt-2 text-sm text-gray-600">{t('errors.notFoundText')}</p>
          <form action={localePath(locale, '/search')} method="get" className="mt-6 flex gap-2">
            <input name="q" type="search" required placeholder={t('errors.searchPlaceholder')} className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{t('common.search')}</button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {popular.map(([key, href]) => (
              <Link key={href} href={href} className="rounded-full border border-gray-200 px-3 py-1 text-sm text-blue-700 hover:bg-blue-50">{t(key)}</Link>
            ))}
          </div>
          <Link href="/" className="mt-6 inline-block text-sm font-semibold text-blue-700 hover:underline">{t('errors.backHome')}</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
