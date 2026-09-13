import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import JobContent from './JobContent';

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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/jobs/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const { data: job } = await res.json();
    return {
      title: job.title,
      metaTitle: job.metaTitle,
      metaDescription: job.metaDescription,
      organization: job.organization,
      qualification: job.qualification,
    };
  } catch {
    return null;
  }
}

async function getJob(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/jobs/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const metadata = await getJobMetadata(resolvedParams.slug);

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

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const job = await getJob(resolvedParams.slug);

  if (!job) {
    notFound();
  }

  // JSON-LD Structured Data for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.title,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.organization || 'Government of India',
    },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: job.location || 'India', addressCountry: 'IN' },
    },
    baseSalary: job.salary ? {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: { '@type': 'QuantitativeValue', value: job.salary, unitText: 'YEAR' },
    } : undefined,
    validThrough: job.lastDate,
    datePosted: new Date().toISOString(),
    employmentType: 'FULL_TIME',
    educationRequirements: job.qualification,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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

          {/* Single Column Layout */}
          <div className="max-w-4xl mx-auto">
            {/* Job Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              {/* Top Section */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-blue-50/50 to-white">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium text-blue-700">{job.organization}</span>
                      <span className="mx-2">•</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm w-full md:w-auto"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-blue-50/50 rounded-lg px-4 py-3 border border-blue-100">
                  <span className="text-sm font-medium text-gray-700">
                    Last Date to Apply: <span className="text-blue-700 font-semibold">{new Date(job.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </span>
                  <div className="flex gap-2">
                    <button className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition">Save</button>
                    <button className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition">Share</button>
                  </div>
                </div>
              </div>

              {/* Grid Section for Details, Dates, and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-gray-100 bg-white">
                
                {/* Column 1: Job Details */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded"></span> Job Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Vacancy</span>
                      <span className="font-semibold text-gray-900">{job.totalVacancy}</span>
                    </div>
                    {job.ageLimit && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Age Limit</span>
                        <span className="font-semibold text-gray-900">{job.ageLimit}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Experience</span>
                      <span className="font-semibold text-gray-900">{job.experience}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Qualification</span>
                      <span className="font-semibold text-gray-900">{job.qualification}</span>
                    </div>
                    {job.salary && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Salary</span>
                        <span className="font-semibold text-green-600">{job.salary}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Important Dates */}
                <div className="p-6 border-b md:border-b-0 lg:border-r border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-500 rounded"></span> Important Dates
                  </h3>
                  <div className="space-y-3">
                    {job.importantDates && job.importantDates.length > 0 ? (
                      job.importantDates.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">{item.label}</span>
                          <span className="font-semibold text-gray-900 whitespace-nowrap ml-2">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic">No specific dates listed.</div>
                    )}
                  </div>
                </div>

                {/* Column 3: Tags & Categories */}
                <div className="p-6 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-500 rounded"></span> Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags && job.tags.length > 0 ? (
                      job.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-medium shadow-sm hover:border-gray-300 transition-colors"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic">No tags available.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded"></span> Official Details & Description
              </h2>
              <JobContent htmlContent={job.htmlContent} />
            </div>

            {/* Eligibility Criteria */}
            {job.eligibility && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-green-600 rounded"></span> Eligibility Criteria
                </h2>
                <div className="prose max-w-none text-gray-700">
                  {job.eligibility}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
    </>
  );
}