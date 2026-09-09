import Link from 'next/link';

interface Job {
  id?: number;
  _id?: string;
  title: string;
  slug: string;
  category?: string;
  postedDate?: string;
  lastDate: string;
  location?: string;
  organization?: string;
  salary?: string;
}

async function getAllJobs(): Promise<Job[]> {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://yourdomain.com'
      : 'http://localhost:3001';
    let response = await fetch(`${baseUrl}/api/jobs`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) throw new Error('Failed to fetch jobs');
    const result = await response.json();
    // Handle both possible response formats
    if (Array.isArray(result.data)) {
      return result.data;
    }
    if (result.data && Array.isArray(result.data.jobs)) {
      return result.data.jobs;
    }
    return [];
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }
}

export default async function LatestJobsPage() {
  let jobs = await getAllJobs();
  if (!Array.isArray(jobs)) jobs = [];

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-blue-700 mb-6 border-b pb-2">All Jobs</h1>
      <div className="bg-white rounded border divide-y">
        {jobs.length === 0 && (
          <div className="p-6 text-center text-gray-500">No jobs found.</div>
        )}
        {Array.isArray(jobs) && jobs.map((job) => (
          <div key={job._id || job.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-blue-50 transition">
            <div>
              <Link href={`/jobs/${job.slug}`} className="text-blue-700 font-semibold hover:underline text-base md:text-lg">
                {job.title}
              </Link>
              <div className="text-xs text-gray-500 mt-1 space-x-2">
                {job.postedDate && <span>📅 Posted: {new Date(job.postedDate).toLocaleDateString()}</span>}
                {job.lastDate && <span>⏰ Last Date: {new Date(job.lastDate).toLocaleDateString()}</span>}
                {job.organization && <span>🏢 {job.organization}</span>}
                {job.location && <span>📍 {job.location}</span>}
                {job.category && <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium ml-2">{job.category}</span>}
              </div>
            </div>
            <div className="mt-2 md:mt-0">
              <Link href={`/jobs/${job.slug}`} className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm font-medium shadow">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 