// /latest-jobs/page.tsx – content only, chrome comes from latest-jobs/layout.tsx
import Link from 'next/link';
import { Metadata } from 'next';
import { Calendar, Building2, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Latest Government Jobs 2025 – Sarkari Naukri | Job Alert',
  description: 'Find all latest government jobs notifications 2025. SSC, UPSC, Railway, Banking, Police and state government jobs.',
  robots: { index: true, follow: true },
};

interface Job {
  _id?: string;
  title: string;
  slug: string;
  lastDate: string;
  organization?: string;
  location?: string;
  salary?: string;
  publishedAt?: string;
}

async function getAllJobs(): Promise<Job[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/jobs/latest?limit=50`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error('Failed to fetch jobs');
    const result = await res.json();
    const payload = result.data ?? result;
    return Array.isArray(payload) ? payload : payload.jobs || [];
  } catch {
    return [];
  }
}

export default async function LatestJobsPage() {
  const jobs = await getAllJobs();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Latest Government Jobs 2025</h1>
        <p className="text-gray-500 text-sm">All new Sarkari Naukri notifications updated daily</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">
            Latest Jobs ({jobs.length})
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Found</h3>
            <p className="text-gray-500">Please check back later.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <Link
                key={job._id || job.slug}
                href={`/jobs/${job.slug}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 group-hover:bg-blue-700" />
                <div className="flex-1 min-w-0">
                  <span className="text-blue-700 text-sm font-medium group-hover:underline leading-snug block">
                    {job.title}
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {job.organization && (
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <Building2 className="h-3 w-3" />{job.organization}
                      </span>
                    )}
                    {job.location && (
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />{job.location}
                      </span>
                    )}
                    {job.lastDate && (
                      <span className="text-xs text-red-400 flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        Last: {new Date(job.lastDate).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">New</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/jobs"
          className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
        >
          View All Jobs with Filters →
        </Link>
      </div>
    </div>
  );
}