import Link from 'next/link';
import type { Metadata } from 'next';
import { apiGet, SITE_URL } from '@/lib/api';
import Layout from '../latest-jobs/layout';

export const metadata: Metadata = {
  title: 'All Categories – Jobs, Results, Admit Cards & More',
  description: 'Browse every category: latest government jobs, results, admit cards, answer keys, online forms, admissions and syllabus.',
  alternates: { canonical: `${SITE_URL}/categories` },
};

interface Category { _id: string; name: string; displayName?: string; slug: string; sequenceNo?: number }

export default async function CategoriesIndex() {
  // throws when the API is down (keeps the cached copy / shows the error page) instead of an empty list
  const list = await apiGet<Category[]>('/api/job-categories/active', { revalidate: 300, tags: ['categories'] });
  const categories = (Array.isArray(list) ? list : []).sort((a, b) => (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0));

  return (
    <Layout>
      <nav className="text-xs text-gray-500 mb-2"><Link href="/" className="hover:underline">Home</Link> › <span>Categories</span></nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">All Categories</h1>
      <p className="text-gray-500 text-sm mb-6">Pick a category to see the newest posts.</p>
      {categories.length === 0 ? (
        <p className="rounded-lg border bg-white p-8 text-center text-gray-500">No categories yet. Please check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <Link key={c._id} href={`/categories/${c.slug}`} className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm transition hover:border-blue-400 hover:shadow-md">
              <span className="font-semibold text-blue-700">{c.displayName || c.name}</span>
              <span className="mt-1 block text-xs text-gray-500">View all {(c.displayName || c.name).toLowerCase()} →</span>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
