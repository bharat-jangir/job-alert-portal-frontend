// /jobs/answer-keys/page.tsx – SSR page using native fetch
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Answer Keys 2025 – Download Official Answer Key | Job Alert',
  description: 'Download official answer keys for SSC, UPSC, RRB, Police and all government exams. Raise objections online.',
  robots: { index: true, follow: true },
};

interface Job {
  _id: string;
  slug: string;
  title: string;
}

async function getAnswerKeys(): Promise<Job[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/jobs/by-type/answer-key`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.data || [];
  } catch {
    return [];
  }
}

function JobsList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🗝️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Answer Keys Found</h3>
        <p className="text-gray-500">No answer keys available at the moment. Please check back later.</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-gray-100">
      {jobs.map((job) => (
        <Link
          key={job._id}
          href={`/jobs/${job.slug}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors group"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 group-hover:bg-orange-700" />
          <span className="text-orange-700 text-sm font-medium group-hover:underline leading-snug">{job.title}</span>
          <span className="ml-auto text-xs text-white bg-orange-500 px-2 py-0.5 rounded-full flex-shrink-0">Available</span>
        </Link>
      ))}
    </div>
  );
}

export default async function AnswerKeysPage() {
  const jobs = await getAnswerKeys();
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Answer Keys 2025</h1>
        <p className="text-gray-500 text-sm">Official answer keys released by government exam boards</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-orange-500 px-4 py-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Latest Answer Keys</h2>
        </div>
        <Suspense fallback={<div className="flex justify-center items-center py-12 gap-2"><Loader2 className="h-5 w-5 animate-spin text-orange-500" /><span className="text-gray-500">Loading...</span></div>}>
          <JobsList jobs={jobs} />
        </Suspense>
      </div>
    </div>
  );
}