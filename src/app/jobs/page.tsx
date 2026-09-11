// /jobs/page.tsx – SSR all-jobs listing with native fetch
import { Suspense } from 'react';
import { Loader2, MapPin, Building2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Latest Government Jobs 2025 – Sarkari Naukri | Job Alert',
  description: 'Browse all latest government job notifications. UPSC, SSC, Railway, Bank, Police and state government jobs 2025.',
  robots: { index: true, follow: true },
};

interface Job {
  _id: string;
  title: string;
  slug: string;
  organization: string;
  location: string;
  salary: string;
  qualification: string;
  experience: string;
  lastDate: string;
  tags: string[];
}

interface JobsData {
  jobs: Job[];
  total: number;
}

interface JobsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

async function getJobs(page: number = 1, search?: string): Promise<JobsData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (search) params.set('search', search);
    const res = await fetch(`${baseUrl}/api/jobs?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { jobs: [], total: 0 };
    const result = await res.json();
    // Backend returns { jobs, total } wrapped in response interceptor as { data: { jobs, total } }
    // Direct NestJS response (no global interceptor) → { jobs, total }
    const payload = result.data ?? result;
    return {
      jobs: payload.jobs || [],
      total: payload.total || 0,
    };
  } catch {
    return { jobs: [], total: 0 };
  }
}

function JobsList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">💼</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Found</h3>
        <p className="text-gray-500">No jobs available at the moment. Please check back later.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Link
          key={job._id}
          href={`/jobs/${job.slug}`}
          className="block bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
        >
          <div className="p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-blue-700 group-hover:text-blue-800 mb-1 leading-snug">
                  {job.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                  {job.organization && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />{job.organization}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{job.location}
                    </span>
                  )}
                  {job.lastDate && (
                    <span className="flex items-center gap-1 text-red-500 font-medium">
                      <Calendar className="h-3 w-3" />Last Date: {new Date(job.lastDate).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              {job.salary && (
                <div className="text-sm font-semibold text-green-700 whitespace-nowrap flex-shrink-0">
                  {job.salary}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.experience && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{job.experience}</span>
              )}
              {job.qualification && (
                <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">{job.qualification}</span>
              )}
              {(job.tags || []).slice(0, 3).map((tag, i) => (
                <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{tag}</span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Pagination({ currentPage, totalPages, search }: { currentPage: number; totalPages: number; search: string }) {
  const pages: React.ReactNode[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  const href = (p: number) => `/jobs?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

  if (start > 1) {
    pages.push(<Link key="first" href={href(1)} className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-sm">1</Link>);
    if (start > 2) pages.push(<span key="s-ellipsis" className="px-2 text-gray-400">…</span>);
  }
  for (let i = start; i <= end; i++) {
    pages.push(
      <Link key={i} href={href(i)} className={`px-3 py-1.5 rounded border text-sm ${currentPage === i ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>{i}</Link>
    );
  }
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push(<span key="e-ellipsis" className="px-2 text-gray-400">…</span>);
    pages.push(<Link key="last" href={href(totalPages)} className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-sm">{totalPages}</Link>);
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      {currentPage > 1 && (
        <Link href={href(currentPage - 1)} className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-sm">← Prev</Link>
      )}
      {pages}
      {currentPage < totalPages && (
        <Link href={href(currentPage + 1)} className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-sm">Next →</Link>
      )}
    </div>
  );
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || '';
  const { jobs, total } = await getJobs(currentPage, search);
  const totalPages = Math.ceil(total / 10);
  const from = ((currentPage - 1) * 10) + 1;
  const to = Math.min(currentPage * 10, total);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Latest Government Jobs 2025</h1>
        <p className="text-gray-500 text-sm">Sarkari Naukri – Latest Govt Job Notifications</p>
      </div>

      {/* Search */}
      <form action="/jobs" method="GET" className="flex gap-2 mb-6">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search jobs, organization, location…"
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Search</button>
      </form>

      {search && (
        <div className="mb-4 text-sm text-gray-500">
          Showing results for: <strong className="text-gray-800">"{search}"</strong> &nbsp;
          <Link href="/jobs" className="text-blue-600 hover:underline">Clear</Link>
        </div>
      )}

      {/* Count */}
      {total > 0 && (
        <div className="mb-4 text-xs text-gray-400">Showing {from}–{to} of {total} jobs</div>
      )}

      {/* Jobs List */}
      <Suspense fallback={<div className="flex justify-center items-center py-16 gap-2"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /><span className="text-gray-500">Loading jobs…</span></div>}>
        <JobsList jobs={jobs} />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} search={search} />}
    </div>
  );
}