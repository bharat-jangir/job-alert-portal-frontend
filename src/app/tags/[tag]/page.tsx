import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Calendar, Building2, MapPin } from 'lucide-react';

import { apiGetList, SITE_URL as SITE } from '@/lib/api';
const PAGE_SIZE = 20;

interface Post {
  _id?: string; title: string; slug: string; lastDate?: string; organization?: string;
  location?: string; publishedAt?: string;
}

const unwrap = (r: any) => r?.data ?? r;

async function getPosts(tag: string, page: number): Promise<{ jobs: Post[]; total: number; totalPages: number }> {
  // throws if the API is down (see lib/api.ts): never cache an empty tag page
  const p = await apiGetList<{ jobs: Post[]; total: number; totalPages: number }>(
    `/api/jobs?tag=${encodeURIComponent(tag)}&page=${page}&limit=${PAGE_SIZE}`,
    { jobs: [], total: 0, totalPages: 0 },
    { tags: ['posts'] },
  );
  return { jobs: p?.jobs ?? [], total: p?.total ?? 0, totalPages: p?.totalPages ?? 0 };
}

const decode = (t: string) => { try { return decodeURIComponent(t); } catch { return t; } };

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ tag: string }>; searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const tag = decode((await params).tag);
  const page = Math.max(1, Math.floor(Number((await searchParams).page)) || 1);
  const { total } = await getPosts(tag, page);
  return {
    title: `${tag} – Latest Updates${page > 1 ? ` – Page ${page}` : ''}`,
    description: `All posts tagged “${tag}”: notifications, results, admit cards and more.`,
    alternates: { canonical: `${SITE}/tags/${encodeURIComponent(tag)}${page > 1 ? `?page=${page}` : ''}` },
    // thin tag archives hurt SEO: only index tags that have enough posts
    robots: { index: total >= 3, follow: true },
  };
}

export default async function TagPage({ params, searchParams }: {
  params: Promise<{ tag: string }>; searchParams: Promise<{ page?: string }>;
}) {
  const tag = decode((await params).tag);
  const page = Math.max(1, Math.floor(Number((await searchParams).page)) || 1);
  const { jobs, total, totalPages } = await getPosts(tag, page);
  // no posts for this tag, or a page number beyond the last one: a real 404, not an empty 200 page
  if (jobs.length === 0) notFound();
  const base = `/tags/${encodeURIComponent(tag)}`;
  return (
    <div className="w-full">
      <nav className="text-xs text-gray-500 mb-2">
        <Link href="/" className="hover:underline">Home</Link> › <span>#{tag}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">#{tag}</h1>
      <p className="text-gray-500 text-sm mb-6">{total} {total === 1 ? 'post' : 'posts'} · updated daily</p>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{tag} ({total})</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No posts with this tag.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <Link key={job._id || job.slug} href={`/jobs/${job.slug}`} className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 group">
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-blue-700 text-sm font-medium group-hover:underline leading-snug block">{job.title}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {job.organization && <span className="text-xs text-gray-400 flex items-center gap-0.5"><Building2 className="h-3 w-3" />{job.organization}</span>}
                    {job.location && <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="h-3 w-3" />{job.location}</span>}
                    {job.lastDate && <span className="text-xs text-red-400 flex items-center gap-0.5"><Calendar className="h-3 w-3" />Last: {new Date(job.lastDate).toLocaleDateString('en-IN')}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={`${base}?page=${page - 1}`} rel="prev" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">← Previous</Link>}
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`${base}?page=${page + 1}`} rel="next" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Next →</Link>}
        </div>
      )}
    </div>
  );
}
