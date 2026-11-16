'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/** Shown when a page could not load its data (for example the API is waking up). Never cached. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <>
      <Header />
      <main className="bg-gray-100 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">This page is taking a moment</h1>
          <p className="mt-2 text-sm text-gray-600">
            We couldn&apos;t load the latest data just now. This is usually temporary — please try again in a few seconds.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={reset} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Try again</button>
            <Link href="/" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Go to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
