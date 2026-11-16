import type { ReactNode } from 'react';
import Link from 'next/link';
import { SITE } from '@/lib/api';

/** Shared layout for the legal pages (header/footer come from the (main) layout). */
export default function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro?: string; children: ReactNode }) {
  return (
    <div className="bg-gray-100 min-h-[60vh] py-8">
      <article className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white px-6 py-8 shadow-sm md:px-10">
        <nav className="mb-3 text-xs text-gray-500">
          <Link href="/" className="hover:underline">Home</Link> › <span>{title}</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">Last updated: {updated}</p>
        {intro && <p className="mt-4 text-gray-700 leading-relaxed">{intro}</p>}
        <div className="mt-6 space-y-6 text-gray-700 leading-relaxed [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_a]:text-blue-700 [&_a]:underline">
          {children}
        </div>
      </article>
    </div>
  );
}

/** "contact us" sentence that uses the configured e-mail when there is one, otherwise the contact form. */
export function ContactLine() {
  return SITE.email ? (
    <>
      using the <Link href="/contact">contact form</Link> or by e-mail at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
    </>
  ) : (
    <>
      using the <Link href="/contact">contact form</Link>
    </>
  );
}
