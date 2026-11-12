import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Calendar, Building2, MapPin } from 'lucide-react';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const PAGE_SIZE = 20;

interface Category { _id: string; name: string; displayName?: string; slug: string }
interface Post {
  _id?: string; title: string; slug: string; lastDate?: string; organization?: string;
  location?: string; publishedAt?: string;
}

const unwrap = (r: any) => r?.data ?? r;

async function getCategory(slug: string): Promise<Category | null> {
  // Throw (don't return null) when the API is unreachable, so a temporary outage shows an
  // error instead of a cached 404. Only a genuine "not in the list" is a 404.
  const res = await fetch(`${API}/api/job-categories/active`, { next: { revalidate: 300, tags: ['categories'] } });
  if (!res.ok) throw new Error(`categories API ${res.status}`);
  const list = unwrap(await res.json());
  return (Array.isArray(list) ? list : []).find((c: Category) => c.slug === slug) ?? null;
}

async function getPosts(slug: string, page: number): Promise<{ jobs: Post[]; total: number; totalPages: number }> {
  try {
    const res = await fetch(`${API}/api/jobs?type=${encodeURIComponent(slug)}&page=${page}&limit=${PAGE_SIZE}`, {
      next: { revalidate: 60, tags: ['posts'] },
    });
    if (!res.ok) return { jobs: [], total: 0, totalPages: 0 };
    const p = unwrap(await res.json());
    return { jobs: p.jobs ?? [], total: p.total ?? 0, totalPages: p.totalPages ?? 0 };
  } catch {
    return { jobs: [], total: 0, totalPages: 0 };
  }
}

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await searchParams;
  const cat = await getCategory(slug);
  if (!cat) return { title: 'Not found', robots: { index: false } };
  const name = cat.displayName || cat.name;
  const n = Number(page) > 1 ? ` – Page ${Number(page)}` : '';
  return {
    title: `${name} 2026${n} – Latest Updates | Job Alert`,
    description: `All latest ${name.toLowerCase()} notifications, dates and direct links, updated daily.`,
    alternates: { canonical: `${SITE}/categories/${slug}${Number(page) > 1 ? `?page=${Number(page)}` : ''}` },
  };
}

export default async function CategoryPage({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);

  const cat = await getCategory(slug);
  if (!cat) notFound();
  const { jobs, total, totalPages } = await getPosts(slug, page);
  const name = cat.displayName || cat.name;

  return (
    <div className="w-full">
      <nav className="text-xs text-gray-500 mb-2">
        <Link href="/" className="hover:underline">Home</Link> › <span>{name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
      <p className="text-gray-500 text-sm mb-6">{total} {total === 1 ? 'post' : 'posts'} · updated daily</p>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{name} ({total})</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No posts in this category yet.</div>
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
          {page > 1 && <Link href={`/categories/${slug}?page=${page - 1}`} rel="prev" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">← Previous</Link>}
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`/categories/${slug}?page=${page + 1}`} rel="next" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Next →</Link>}
        </div>
      )}
    </div>
  );
}
