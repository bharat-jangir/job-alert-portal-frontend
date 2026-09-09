import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import api from '@/lib/axios';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Job {
  _id: string;
  title: string;
  slug: string;
  htmlContent: string;
  organization: string;
  location: string;
  salary: string;
  qualification: string;
  experience: string;
  lastDate: string;
  applyLink: string;
  description: string;
  eligibility: string;
  totalVacancy: string;
  ageLimit?: string;
  tags: string[];
  importantDates: {
    label: string;
    date: string;
  }[];
  metaTitle?: string;
  metaDescription?: string;
  sourceUrl?: string;
}

interface JobMetadata {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  organization: string;
  qualification: string;
}

async function getJobMetadata(slug: string): Promise<JobMetadata | null> {
  try {
    const { data } = await api.get<{ data: Job }>(`/jobs/${slug}`);
    const job = data.data;
    return {
      title: job.title,
      metaTitle: job.metaTitle,
      metaDescription: job.metaDescription,
      organization: job.organization,
      qualification: job.qualification,
    };
  } catch (error) {
    console.error('Error fetching job metadata:', error);
    return null;
  }
}

async function getJob(slug: string) {
  try {
    const { data } = await api.get<{ data: Job }>(`/jobs/${slug}`);
    return data.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const metadata = await getJobMetadata(params.slug);
  
  if (!metadata) {
    return {
      title: 'Job Not Found',
      description: 'The requested job could not be found.'
    };
  }

  return {
    title: metadata.metaTitle || metadata.title,
    description: metadata.metaDescription || `Apply for ${metadata.title} at ${metadata.organization}. ${metadata.qualification} required.`,
    openGraph: {
      title: metadata.metaTitle || metadata.title,
      description: metadata.metaDescription || `Apply for ${metadata.title} at ${metadata.organization}. ${metadata.qualification} required.`,
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: [metadata.organization],
    },
  };
}

export default async function JobPage({ params }: { params: { slug: string } }) {
  const job = await getJob(params.slug);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 ">
            <nav className="flex bg-white" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a href="/" className="text-gray-700 hover:text-blue-600">
                    Home
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <a href="/jobs" className="text-gray-700 hover:text-blue-600">
                      Jobs
                    </a>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-500">{job.title}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Related Jobs */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Related Jobs</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-sm">Software Engineer</h4>
                    <p className="text-xs text-gray-600">Tech Corp</p>
                    <p className="text-xs text-gray-500">New York, NY</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-sm">Frontend Developer</h4>
                    <p className="text-xs text-gray-600">Web Solutions</p>
                    <p className="text-xs text-gray-500">San Francisco, CA</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium text-sm">Backend Developer</h4>
                    <p className="text-xs text-gray-600">Data Systems</p>
                    <p className="text-xs text-gray-500">Austin, TX</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Content - Job Details */}
            <div className="lg:col-span-6">
              {/* Job Header */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <span className="font-medium">{job.organization}</span>
                  <span className="mx-2">•</span>
                  <span>{job.location}</span>
                </div>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {job.experience}
                  </div>
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                    {job.qualification}
                  </div>
                  <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {job.salary}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Last Date to Apply: {new Date(job.lastDate).toLocaleDateString()}
                  </div>
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <div 
                  className="prose max-w-none job-content"
                  dangerouslySetInnerHTML={{ __html: job.htmlContent }}
                />
              </div>

              {/* Eligibility Criteria */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Eligibility Criteria</h2>
                <div className="prose max-w-none">
                  {job.eligibility}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Job Info */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Important Dates */}
                {job.importantDates && job.importantDates.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
                    <div className="space-y-3">
                      {job.importantDates.map((date, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">{date.label}</span>
                          <span className="font-medium text-sm">
                            {new Date(date.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Job Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Total Vacancy</span>
                      <span className="font-medium text-sm">{job.totalVacancy}</span>
                    </div>
                    {job.ageLimit && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Age Limit</span>
                        <span className="font-medium text-sm">{job.ageLimit}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Experience</span>
                      <span className="font-medium text-sm">{job.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Qualification</span>
                      <span className="font-medium text-sm">{job.qualification}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
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
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Save Job
                    </button>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                      Share Job
                    </button>
                    <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                      Print Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
} 