import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';

interface Job {
  _id: string;
  slug: string;
  title: string;
}

interface SearchPageProps {
  searchParams: { q?: string };
}

async function getSearchedJobs(q: string) {
  try {
    const { data } = await api.get('/jobs', { params: { search: q } });
    // Support both array and {jobs: []} response
    if (Array.isArray(data.data)) return data.data;
    if (data.data && Array.isArray(data.data.jobs)) return data.data.jobs;
    return [];
  } catch (error) {
    console.error('Error fetching searched jobs:', error);
    return [];
  }
}

function JobsList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
        <p className="text-gray-600">No jobs match your search. Please try another keyword.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Link
          key={job._id}
          href={`/jobs/${job.slug}`}
          className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = searchParams.q || '';
  if (!q) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Search Jobs</h1>
          <p className="text-gray-600">Please enter a search term.</p>
        </div>
      </div>
    );
  }
  const jobs = await getSearchedJobs(q);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Results</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Showing results for: <span className="font-semibold">{q}</span></p>
        </div>
        <Suspense fallback={<div className="flex justify-center items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading jobs...</span></div>}>
          <JobsList jobs={jobs} />
        </Suspense>
      </div>
    </div>
  );
} 