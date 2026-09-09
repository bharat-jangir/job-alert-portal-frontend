import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';

interface Job {
  _id: string;
  slug: string;
  title: string;
}

async function getAnswerKeys() {
  try {
    const { data } = await api.get('/jobs/by-type/answer-key');
    return data.data || [];
  } catch (error) {
    console.error('Error fetching answer keys:', error);
    return [];
  }
}

function JobsList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Answer Keys Found</h3>
        <p className="text-gray-600">No answer keys available at the moment. Please check back later.</p>
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

export default async function AnswerKeysPage() {
  const jobs = await getAnswerKeys();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Answer Keys</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Browse all available answer keys.</p>
        </div>
        <Suspense fallback={<div className="flex justify-center items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading answer keys...</span></div>}>
          <JobsList jobs={jobs} />
        </Suspense>
      </div>
    </div>
  );
} 