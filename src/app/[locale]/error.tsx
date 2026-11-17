'use client';

import { useEffect } from 'react';
import Link from '@/i18n/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useT } from '@/i18n/provider';

/** Shown when a page could not load its data (for example the API is waking up). Never cached. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <>
      <Header />
      <main className="bg-gray-100 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{t('errors.errorHeading')}</h1>
          <p className="mt-2 text-sm text-gray-600">{t('errors.errorText')}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={reset} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{t('errors.tryAgain')}</button>
            <Link href="/" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{t('errors.goHome')}</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
