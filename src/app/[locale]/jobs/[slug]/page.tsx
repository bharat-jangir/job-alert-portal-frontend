import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from '@/i18n/link';
import JobContent from './JobContent';
import PostSections, { type Section } from '@/components/PostSections';
import { inlineToPlain } from '@/lib/inline';
import { apiGet, apiGetOptional, ApiError, withLang } from '@/lib/api';
import { getT, type TFunction } from '@/i18n/dictionary';
import { formatDate, isLocale, localePath, type Locale } from '@/i18n/config';
import { absoluteUrl, pageAlternates } from '@/i18n/seo';
import { enumLabel } from '@/i18n/labels';
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

/** Context-aware action button text based on post type (admit card, result, answer key, etc.) */
function getActionLabel(t: TFunction, type?: string, title?: string): string {
  const k = (type || '').toLowerCase().trim();
  const l = (title || '').toLowerCase();
  if (k === 'admit-card' || l.includes('admit card') || l.includes('hall ticket') || l.includes('call letter')) return t('post.actionAdmit');
  if (k === 'result' || l.includes('result') || l.includes('score card') || l.includes('merit list')) return t('post.actionResult');
  if (k === 'answer-key' || l.includes('answer key') || l.includes('ans key') || l.includes('objection')) return t('post.actionAnswerKey');
  if (k === 'syllabus' || l.includes('syllabus') || l.includes('exam pattern')) return t('post.actionSyllabus');
  if (k === 'admission' || l.includes('admission')) return t('post.actionAdmission');
  return t('post.actionApply');
}

/** Context-aware label for the date banner */
function getDateLabel(t: TFunction, type?: string, title?: string): string {
  const k = (type || '').toLowerCase().trim();
  const l = (title || '').toLowerCase();
  if (k === 'admit-card' || l.includes('admit card') || l.includes('hall ticket')) return t('post.dateAdmit');
  if (k === 'result' || l.includes('result')) return t('post.dateResult');
  if (k === 'answer-key' || l.includes('answer key')) return t('post.dateAnswerKey');
  return t('post.dateApply');
}


/** Post types that are real job openings (eligible for JobPosting rich results). */
const JOB_TYPES = new Set(['job', 'online-form']);

/**
 * Same URL + options for metadata and page, so Next de-duplicates it into one request.
 * Only a real 404 means "no such post". Any other failure (timeout, 5xx, API asleep) THROWS: Next then
 * keeps the last good copy of the page, or shows the error page. It must never become a cached 404 with
 * `noindex`, which could get a perfectly good post dropped from Google.
 */
async function getJob(slug: string, locale: Locale) {
  try {
    return await apiGet<any>(withLang(`/api/jobs/${encodeURIComponent(slug)}`, locale), { revalidate: 300, tags: ['posts', `post:${slug}`] });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Related posts are a bonus: the post is still worth showing without them. */
const getRelated = (slug: string, locale: Locale) =>
  apiGetOptional<any[]>(withLang(`/api/jobs/${encodeURIComponent(slug)}/related`, locale), [], { revalidate: 600, tags: ['posts'] });

const plain = (v?: string) => (v ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale);
  const job = await getJob(slug, locale);
  if (!job) return { title: t('meta.notFoundTitle'), robots: { index: false, follow: false } };

  const title = job.metaTitle || job.title;
  const description =
    job.metaDescription ||
    plain(job.description).slice(0, 160) ||
    t('meta.postFallbackDescription', { title: `${job.title}${job.organization ? ` – ${job.organization}` : ''}` });

  // A Hindi URL for a post that has no Hindi version shows English text. It must not compete with the
  // English page in search: point it at the English canonical and keep it out of the index.
  const served: Locale = job.language === locale ? locale : 'en';
  const path = `/jobs/${job.slug}`;
  const alternates = pageAlternates(served, path, job.availableLanguages ?? ['en']);
  if (served === 'en' && job.canonicalUrl) alternates.canonical = job.canonicalUrl;
  const url = alternates.canonical;
  const unavailable = served !== locale;

  return {
    title,
    description,
    alternates,
    robots: unavailable ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      locale: locale === 'hi' && !unavailable ? 'hi_IN' : 'en_IN',
      publishedTime: job.publishedAt,
      modifiedTime: job.updatedAt,
      images: pickImage(job) ? [{ url: pickImage(job)! }] : undefined,
    },
    twitter: { card: pickImage(job) ? 'summary_large_image' : 'summary', title, description },
  };
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const locale = (await params).locale as Locale;
  const t = getT(locale);
  const fmtDate = (d?: string, withYear = true) =>
    d && !isNaN(new Date(d).getTime())
      ? formatDate(d, locale, { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) })
      : null;
  const job = await getJob(slug, locale);

  if (!job) notFound();
  // The post was renamed: send the old URL to the new one permanently (keeps SEO equity).
  if (job.slug !== slug) permanentRedirect(localePath(locale, `/jobs/${job.slug}`));

  const related = await getRelated(job.slug, locale);
  const sections: Section[] = Array.isArray(job.sections) ? job.sections : [];
  const orgName = job.organizationId?.name || job.organization;
  const shownLocale: Locale = job.language === locale ? locale : 'en';
  const url = shownLocale === 'en' && job.canonicalUrl ? job.canonicalUrl : absoluteUrl(shownLocale, `/jobs/${job.slug}`);
  const hindiMissing = locale === 'hi' && job.language !== 'hi';
  const hindiAuto = locale === 'hi' && job.language === 'hi' && job.translationStatus === 'machine';
  const lastDate = fmtDate(job.lastDate);
  const expired = job.lastDate && new Date(job.lastDate) < new Date();

  // Structured data must match the page: JobPosting only for real openings, Article for the rest.
  const graph: any[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('common.home'), item: absoluteUrl(locale, '/') },
        { '@type': 'ListItem', position: 2, name: t('common.jobs'), item: absoluteUrl(locale, '/jobs') },
        { '@type': 'ListItem', position: 3, name: job.title, item: url },
      ],
    },
  ];
  if (JOB_TYPES.has(job.type) && job.lastDate) {
    graph.push({
      '@type': 'JobPosting',
      title: job.title,
      inLanguage: job.language,
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
      inLanguage: job.language,
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
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 ">
            <nav className="flex bg-white" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link href="/" className="text-gray-700 hover:text-blue-600">
                    {t('common.home')}
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link href="/jobs" className="text-gray-700 hover:text-blue-600">
                      {t('post.breadcrumbJobs')}
                    </Link>
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
            {hindiMissing && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900" lang="hi">
                {t('post.notInLanguage')}{' '}
                <Link href={`/jobs/${job.slug}`} className="font-semibold underline" hrefLang="en-IN">{t('post.readEnglish')}</Link>
              </p>
            )}
            {hindiAuto && (
              <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-xs text-blue-900">{t('post.autoTranslated')}</p>
            )}
            {locale === 'en' && (job.availableLanguages ?? []).includes('hi') && (
              <p className="mb-4 text-sm"><Link href={`/hi/jobs/${job.slug}`} hrefLang="hi-IN" lang="hi" className="font-semibold text-blue-700 hover:underline">{t('post.readHindi')}</Link></p>
            )}

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
                        {getActionLabel(t, job.type, job.title)}
                      </a>
                    )}
                  </div>
                </div>

                {job.updateNote && (
                  <p className="mb-3 text-sm rounded-lg border border-amber-200 bg-amber-50 text-amber-900 px-4 py-2">
                    <strong>{t('post.update')}</strong> {job.updateNote}
                    {fmtDate(job.updatedAt) && <span className="text-amber-700"> ({fmtDate(job.updatedAt)})</span>}
                  </p>
                )}
                <div className="flex justify-between items-center bg-blue-50/50 rounded-lg px-4 py-3 border border-blue-100">
                  <span className="text-sm font-medium text-gray-700">
                    {lastDate ? (
                      <>
                        {getDateLabel(t, job.type, job.title)}: <span className={`font-semibold ${expired ? 'text-red-600' : 'text-blue-700'}`}>{lastDate}{expired ? ` (${t('post.closed')})` : ''}</span>
                      </>
                    ) : (
                      <>{t('post.published')} <span className="text-blue-700 font-semibold">{fmtDate(job.publishedAt) ?? '-'}</span></>
                    )}
                  </span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${job.title} ${url}`)}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition"
                  >
                    {t('post.share')}
                  </a>
                </div>
              </div>

              {/* Grid Section for Details, Dates, and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-gray-100 bg-white">
                
                {/* Column 1: Job Details */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded"></span> {t('post.jobDetails')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{t('post.vacancy')}</span>
                      <span className="font-semibold text-gray-900">{job.totalVacancy}</span>
                    </div>
                    {job.ageLimit && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{t('post.ageLimit')}</span>
                        <span className="font-semibold text-gray-900">{job.ageLimit}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{t('post.experience')}</span>
                      <span className="font-semibold text-gray-900">{enumLabel(t, 'experience', job.experience)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{t('post.qualification')}</span>
                      <span className="font-semibold text-gray-900">{enumLabel(t, 'qualification', job.qualification)}</span>
                    </div>
                    {job.salary && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{t('post.salary')}</span>
                        <span className="font-semibold text-green-600">{job.salary}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Important Dates */}
                <div className="p-6 border-b md:border-b-0 lg:border-r border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-500 rounded"></span> {t('post.importantDates')}
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
                      <div className="text-sm text-gray-500 italic">{t('post.noDates')}</div>
                    )}
                  </div>
                </div>

                {/* Column 3: Tags & Categories */}
                <div className="p-6 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-500 rounded"></span> {t('post.categories')}
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
                      <span className="text-sm text-gray-500 italic">{t('post.noTags')}</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded"></span> {t('post.officialDetails')}
              </h2>
              {sections.length > 0 && <PostSections sections={sections} locale={locale} />}
              {job.htmlContent && <JobContent htmlContent={job.htmlContent} />}
              {sections.length === 0 && !job.htmlContent && (
                <p className="text-gray-500 italic">{t('post.detailsSoon')}</p>
              )}
            </div>

            {/* Eligibility Criteria */}
            {job.eligibility && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-green-600 rounded"></span> {t('post.eligibility')}
                </h2>
                <JobContent htmlContent={job.eligibility} />
              </div>
            )}

            {related.length > 0 && (
              <section className="mt-8" aria-labelledby="related-heading">
                <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-4">{t('post.related')}</h2>
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
      </div>

      {/* Footer */}
    </>
  );
}