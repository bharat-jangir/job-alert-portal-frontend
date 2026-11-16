import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'Page not found', robots: { index: false, follow: true } };

const popular = [
  ['Latest Jobs', '/latest-jobs'],
  ['Results', '/categories/result'],
  ['Admit Cards', '/categories/admit-card'],
  ['Answer Keys', '/categories/answer-key'],
  ['Online Forms', '/categories/online-form'],
  ['All Categories', '/categories'],
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-gray-100 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl font-bold text-blue-600">404</p>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">We couldn&apos;t find that page</h1>
          <p className="mt-2 text-sm text-gray-600">
            The post may have been moved or removed, or the address may be mistyped. Try searching, or jump to a popular section.
          </p>
          <form action="/search" method="get" className="mt-6 flex gap-2">
            <input name="q" type="search" required placeholder="Search jobs, results, admit cards…" className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Search</button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {popular.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full border border-gray-200 px-3 py-1 text-sm text-blue-700 hover:bg-blue-50">{label}</Link>
            ))}
          </div>
          <Link href="/" className="mt-6 inline-block text-sm font-semibold text-blue-700 hover:underline">← Back to home</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
