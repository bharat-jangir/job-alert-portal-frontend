import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, MapPin, Building2, Calendar } from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';

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

interface JobsPageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

async function getJobs(page: number = 1, search?: string) {
  try {
    const { data } = await api.get('/jobs', {
      params: {
        page,
        limit: 10,
        search: search || undefined
      }
    });
    return data.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return {
      jobs: [],
      total: 0
    };
  }
}

function JobsList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
        <p className="text-gray-600">
          No jobs available at the moment. Please check back later.
        </p>
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
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {job.title}
                </h2>
                <div className="flex items-center text-gray-600 mb-4">
                  <Building2 className="h-4 w-4 mr-1" />
                  <span className="mr-4">{job.organization}</span>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600 mb-1">
                  {job.salary}
                </div>
                <div className="text-sm text-gray-500">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Last Date: {new Date(job.lastDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                {job.experience}
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                {job.qualification}
              </span>
              {job.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    pages.push(
      <Link
        key="first"
        href={`/jobs?page=1`}
        className="px-3 py-1 rounded hover:bg-gray-100"
      >
        1
      </Link>
    );
    if (startPage > 2) {
      pages.push(
        <span key="start-ellipsis" className="px-2">
          ...
        </span>
      );
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <Link
        key={i}
        href={`/jobs?page=${i}`}
        className={`px-3 py-1 rounded ${
          currentPage === i
            ? 'bg-blue-500 text-white'
            : 'hover:bg-gray-100'
        }`}
      >
        {i}
      </Link>
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="end-ellipsis" className="px-2">
          ...
        </span>
      );
    }
    pages.push(
      <Link
        key="last"
        href={`/jobs?page=${totalPages}`}
        className="px-3 py-1 rounded hover:bg-gray-100"
      >
        {totalPages}
      </Link>
    );
  }

  return (
    <div className="mt-8 flex items-center justify-center space-x-2">
      {currentPage > 1 && (
        <Link
          href={`/jobs?page=${currentPage - 1}`}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          Previous
        </Link>
      )}
      {pages}
      {currentPage < totalPages && (
        <Link
          href={`/jobs?page=${currentPage + 1}`}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          Next
        </Link>
      )}
    </div>
  );
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const search = searchParams.search || '';
  const { jobs, total } = await getJobs(currentPage, search);
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through our curated list of job opportunities. Find the perfect match for your skills and aspirations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form action="/jobs" method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              name="search"
              placeholder="Search jobs by title, organization, or location..."
              defaultValue={search}
              className="pl-10"
            />
          </form>
          {search && (
            <div className="mt-2 text-sm text-gray-500">
              Showing results for: <span className="font-medium">{search}</span>
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className="max-w-4xl mx-auto">
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading jobs...</span>
                </div>
              </div>
            }
          >
            <JobsList jobs={jobs} />
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} jobs
          </div>
        </div>
      </div>
    </div>
  );
} 