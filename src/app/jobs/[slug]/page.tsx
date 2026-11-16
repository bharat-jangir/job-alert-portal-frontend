import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import JobContent from './JobContent';
import PostSections, { type Section } from '@/components/PostSections';
import { inlineToPlain } from '@/lib/inline';
import { apiGet, apiGetOptional, ApiError } from '@/lib/api';
import { SITE as SITE_BRAND } from '@/lib/site';

/** Social/Article image: explicit OG image, else the first image block in the body. */
function pickImage(job: any): string | undefined {
  if (job.ogImage) return job.ogImage;
  const first = (Array.isArray(job.sections) ? job.sections : []).find((x: any) => x?.type === 'image' && x.src);
  return first?.src;
}

interface Job {
  _id: string;
  title: string;
  slug: string;
  type?: string;
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

/** Resolves context-aware action button text based on post type (admit card, result, answer key, etc.) */
function getActionLabel(type?: string, title?: string): string {
  const t = (type || '').toLowerCase().trim();
  const lowerTitle = (title || '').toLowerCase();

  if (t === 'admit-card' || lowerTitle.includes('admit card') || lowerTitle.includes('hall ticket') || lowerTitle.includes('call letter')) {
    return 'Download Admit Card';
  }
  if (t === 'result' || lowerTitle.includes('result') || lowerTitle.includes('score card') || lowerTitle.includes('merit list')) {
    return 'Check Result';
  }
  if (t === 'answer-key' || lowerTitle.includes('answer key') || lowerTitle.includes('ans key') || lowerTitle.includes('objection')) {
    return 'Check Answer Key';
  }
  if (t === 'syllabus' || lowerTitle.includes('syllabus') || lowerTitle.includes('exam pattern')) {
    return 'Download Syllabus';
  }
  if (t === 'admission' || lowerTitle.includes('admission')) {
    return 'Apply for Admission';
  }
  return 'Apply Online';
}

/** Resolves context-aware date banner label */
function getDateLabel(type?: string, title?: string): string {
  const t = (type || '').toLowerCase().trim();
  const lowerTitle = (title || '').toLowerCase();

  if (t === 'admit-card' || lowerTitle.includes('admit card') || lowerTitle.includes('hall ticket')) {
    return 'Download Last Date';
  }
  if (t === 'result' || lowerTitle.includes('result')) {
    return 'Result Declared Date';
  }
  if (t === 'answer-key' || lowerTitle.includes('answer key')) {
    return 'Objection Last Date';
  }
  return 'Last Date to Apply';
}

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
/** Post types that are real job openings (eligible for JobPosting rich results). */
const JOB_TYPES = new Set(['job', 'online-form']);

/**
 * Same URL + options for metadata and page, so Next de-duplicates it into one request.
 * Only a real 404 means "no such post". Any other failure (timeout, 5xx, API asleep) THROWS: Next then
 * keeps the last good copy of the page, or shows the error page. It must never become a cached 404 with
 * `noindex`, which could get a perfectly good post dropped from Google.
 */
async function getJob(slug: string) {
  try {
    return await apiGet<any>(`/api/jobs/${encodeURIComponent(slug)}`, { revalidate: 300, tags: ['posts', `post:${slug}`] });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Related posts are a bonus: the post is still worth showing without them. */
const getRelated = (slug: string) =>
  apiGetOptional<any[]>(`/api/jobs/${encodeURIComponent(slug)}/related`, [], { revalidate: 600, tags: ['posts'] });

const plain = (v?: string) => (v ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const fmtDate = (d?: string, withYear = true) =>
  d && !isNaN(new Date(d).getTime())
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) })
    : null;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: 'Not found', robots: { index: false, follow: false } };

  const title = job.metaTitle || job.title;
  const description =
    job.metaDescription ||
    plain(job.description).slice(0, 160) ||
    `${job.title}${job.organization ? ` – ${job.organization}` : ''}. Last date, eligibility, vacancies and how to apply.`;
  const url = job.canonicalUrl || `${SITE}/jobs/${job.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: job.publishedAt,
      modifiedTime: job.updatedAt,
      images: pickImage(job) ? [{ url: pickImage(job)! }] : undefined,
    },
    twitter: { card: pickImage(job) ? 'summary_large_image' : 'summary', title, description },
  };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) notFound();
  // The post was renamed: send the old URL to the new one permanently (keeps SEO equity).
  if (job.slug !== slug) permanentRedirect(`/jobs/${job.slug}`);

  const related = await getRelated(job.slug);
  const sections: Section[] = Array.isArray(job.sections) ? job.sections : [];
  const orgName = job.organizationId?.name || job.organization;
  const url = job.canonicalUrl || `${SITE}/jobs/${job.slug}`;
  const lastDate = fmtDate(job.lastDate);
  const expired = job.lastDate && new Date(job.lastDate) < new Date();

  // Structured data must match the page: JobPosting only for real openings, Article for the rest.
  const graph: any[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${SITE}/jobs` },
        { '@type': 'ListItem', position: 3, name: job.title, item: url },
      ],
    },
  ];
  if (JOB_TYPES.has(job.type) && job.lastDate) {
    graph.push({
      '@type': 'JobPosting',
      title: job.title,
      description: plain(job.description) || job.title,
      datePosted: job.publishedAt,
      validThrough: job.lastDate,
      employmentType: 'FULL_TIME',
      directApply: false,
      hiringOrganization: { '@type': 'Organization', name: orgName || 'Government of India' },
      jobLocation: {
        '@type': 'Place',
        address: { '@type': 'PostalAddress', addressLocality: job.location || 'India', addressCountry: 'IN' },
      },
      baseSalary: job.salary
        ? { '@type': 'MonetaryAmount', currency: 'INR', value: { '@type': 'QuantitativeValue', value: job.salary } }
        : undefined,
      identifier: { '@type': 'PropertyValue', name: orgName || SITE_BRAND.name, value: job.slug },
      url,
    });
  } else {
    graph.push({
      '@type': 'Article',
      headline: job.title,
      description: plain(job.description) || undefined,
      datePublished: job.publishedAt,
      dateModified: job.updatedAt,
      mainEntityOfPage: url,
      image: pickImage(job) || undefined,
      publisher: { '@type': 'Organization', name: SITE_BRAND.name },
    });
  }
  const faqs = sections.filter((x): x is Extract<Section, { type: 'faq' }> => x.type === 'faq').flatMap((x) => x.items);
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: inlineToPlain(f.question), acceptedAnswer: { '@type': 'Answer', text: inlineToPlain(f.answer) } })),
    });
  }
  const jsonLd = { '@context': 'https://schema.org', '@graph': graph };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

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
                    {job.applyLink && (
                      <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm w-full md:w-auto"
                      >
                        {getActionLabel(job.type, job.title)}
                      </a>
                    )}
                  </div>
                </div>

                {job.updateNote && (
                  <p className="mb-3 text-sm rounded-lg border border-amber-200 bg-amber-50 text-amber-900 px-4 py-2">
                    <strong>Update:</strong> {job.updateNote}
                    {fmtDate(job.updatedAt) && <span className="text-amber-700"> ({fmtDate(job.updatedAt)})</span>}
                  </p>
                )}
                <div className="flex justify-between items-center bg-blue-50/50 rounded-lg px-4 py-3 border border-blue-100">
                  <span className="text-sm font-medium text-gray-700">
                    {lastDate ? (
                      <>
                        {getDateLabel(job.type, job.title)}: <span className={`font-semibold ${expired ? 'text-red-600' : 'text-blue-700'}`}>{lastDate}{expired ? ' (closed)' : ''}</span>
                      </>
                    ) : (
                      <>Published: <span className="text-blue-700 font-semibold">{fmtDate(job.publishedAt) ?? '-'}</span></>
                    )}
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
                            {fmtDate(item.date) ?? '—'}
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
                        <Link
                          key={index}
                          href={`/tags/${encodeURIComponent(tag)}`}
                          className="bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-medium shadow-sm hover:border-blue-400 hover:text-blue-700 transition-colors"
                        >
                          {tag}
                        </Link>
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
              {sections.length > 0 && <PostSections sections={sections} />}
              {job.htmlContent && <JobContent htmlContent={job.htmlContent} />}
              {sections.length === 0 && !job.htmlContent && (
                <p className="text-gray-500 italic">Details will be updated soon.</p>
              )}
            </div>

            {/* Eligibility Criteria */}
            {job.eligibility && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-green-600 rounded"></span> Eligibility Criteria
                </h2>
                <JobContent htmlContent={job.eligibility} />
              </div>
            )}

            {related.length > 0 && (
              <section className="mt-8" aria-labelledby="related-heading">
                <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-4">Related updates</h2>
                <ul className="bg-white rounded-xl border border-gray-200 divide-y">
                  {related.map((r: any) => (
                    <li key={r._id}>
                      <Link href={`/jobs/${r.slug}`} className="flex justify-between gap-4 p-4 hover:bg-gray-50">
                        <span className="text-blue-700 font-medium">{r.title}</span>
                        <span className="text-xs text-gray-400 shrink-0">{fmtDate(r.publishedAt, false)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
    </>
  );
}