import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from '@/i18n/link';
import { apiGet, apiGetOptional, withLang, SITE } from '@/lib/api';
import { getT } from '@/i18n/dictionary';
import { formatDate, isLocale, LOCALE_META, type Locale } from '@/i18n/config';
import { pageAlternates } from '@/i18n/seo';
import { toPlainText } from '@/lib/sanitize';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale);
  const title = `${SITE.name} – ${t('meta.homeTitle', { year: new Date().getFullYear() })}`;
  return {
    title: { absolute: title },
    description: t('meta.homeDescription'),
    keywords: t('meta.keywords'),
    alternates: pageAlternates(locale, '/'),
    openGraph: { title, description: t('meta.homeDescription'), type: 'website', locale: LOCALE_META[locale].ogLocale, siteName: SITE.name },
  };
}

interface Job {
  _id?: string;
  title: string;
  slug: string;
  lastDate?: string;
  location?: string;
  organization?: string | { name?: string };
}

/** Admin "redirect links" use the category slug without hyphens, upper-cased (answer-key -> ANSWERKEY). */
function slugToRedirectType(slug: string): string {
  return slug.replace(/-/g, '').toUpperCase();
}

// Main content: these THROW when the API is unreachable, so Next keeps serving the last good page
// (or shows the error page) instead of caching an empty home page. See lib/api.ts.
const TAGS = { tags: ['posts', 'home'] };
const getActiveCategories = (l: Locale) => apiGet<any[]>(withLang('/api/job-categories/active', l), { revalidate: 300, tags: ['categories', 'home'] });
const getJobsByType = (type: string, l: Locale) => apiGet<any[]>(withLang(`/api/jobs/by-type/${encodeURIComponent(type)}`, l), TAGS);

// Side widgets: the page is still worth showing without them.
const getPopularJobs = (l: Locale) => apiGetOptional<Job[]>(withLang('/api/jobs/popular', l), [], TAGS);
const getBulletins = (l: Locale) => apiGetOptional<any[]>(withLang('/api/jobs/bulletins', l), [], TAGS);
const getOrganizations = () => apiGetOptional<{ _id: string; name: string; slug: string }[]>('/api/organizations/active', [], { tags: ['organizations'] });
const getFaqs = async () => (await apiGetOptional<any[]>('/api/faqs/public', [], { revalidate: 300 })).slice(0, 4);
const getRedirectLinks = async (type: string) =>
  (await apiGetOptional<{ links?: any[] }>(`/api/redirect-links?type=${type}&pageSize=10`, {})).links ?? [];

const renderLink = (link: any, className: string) => {
  const content = (
    <>
      <span className="align-middle">{link.title}</span>
      {link.tag && (
        <span className="inline-flex bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1.5 uppercase leading-none border border-red-200 align-middle -mt-0.5">
          {link.tag}
        </span>
      )}
    </>
  );

  if (link.redirectType === 'external') {
    return (
      <a href={link.externalUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  const href = link.slug?.startsWith('/') ? link.slug : `/jobs/${link.slug}`;
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
};

export default async function Home({ params }: Props) {
  const raw = (await params).locale;
  // "/anything.png" or a mistyped one-segment address matches [locale]: answer 404, not a crash
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = getT(locale);
  const popularJobs = await getPopularJobs(locale);
  
  const allCategories = await getActiveCategories(locale);
  const homeCategories = allCategories
    .filter((c: any) => c.showOnHome && !c.isDeleted)
    .sort((a: any, b: any) => a.sequenceNo - b.sequenceNo);

  const categoryData = await Promise.all(
    homeCategories.map(async (category: any) => {
      const jobs = await getJobsByType(category.slug, locale);
      const redirectLinks = await getRedirectLinks(slugToRedirectType(category.slug));
      const combined = [...jobs, ...redirectLinks].slice(0, 10);
      return { ...category, items: combined };
    })
  );
  
  const organizations = await getOrganizations();
  const faqs = await getFaqs();
  const bulletins = await getBulletins(locale);

  return (
    <div className="bg-gray-100 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">

        {/* ================= SECTION 1: TOP SIDEBAR CONTENT (GRID/BANNER ROW) ================= */}
        <section className="space-y-4">
          {/* Social Channels Row */}
          {/* Community channels: only shown when the links are configured (no dead buttons) */}
          {(SITE.whatsapp || SITE.telegram) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SITE.whatsapp && (
                <div className="bg-green-600 text-white p-4 rounded flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-lg">{t('home.joinWhatsApp')}</h3>
                    <p className="text-xs text-green-100">{t('home.joinWhatsAppSub')}</p>
                  </div>
                  <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="bg-white text-green-700 hover:bg-green-50 px-4 py-1.5 rounded font-semibold text-sm">
                    Join Now
                  </a>
                </div>
              )}
              {SITE.telegram && (
                <div className="bg-blue-600 text-white p-4 rounded flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-lg">{t('home.joinTelegram')}</h3>
                    <p className="text-xs text-blue-100">{t('home.joinTelegramSub')}</p>
                  </div>
                  <a href={SITE.telegram} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-1.5 rounded font-semibold text-sm">
                    Join Now
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Widgets Grid (Popular Jobs, Categories, Tools & FAQs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Popular Jobs */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1 text-sm uppercase">{t('home.popularJobs')}</h3>
              <div className="space-y-1.5 text-sm">
                {popularJobs.length > 0 ? (
                  popularJobs.map((job) => (
                    <Link key={job.slug} href={`/jobs/${job.slug}`} className="block text-blue-600 hover:underline truncate">
                      {job.title}
                    </Link>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">{t('home.noPopular')}</div>
                )}
              </div>
            </div>

            {/* Organizations */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1 text-sm uppercase">{t('home.topOrganizations')}</h3>
              <div className="space-y-1.5 text-sm">
                {organizations.length > 0 ? (
                  organizations.slice(0, 5).map((org) => (
                    <Link key={org._id} href={`/search?q=${encodeURIComponent(org.name)}`} className="block text-purple-600 hover:underline truncate">
                      {org.name}
                    </Link>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">{t('home.noOrganizations')}</div>
                )}
              </div>
            </div>

            {/* Rojgar Result Info & Tools */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1 text-sm uppercase">{t('home.toolsTitle')}</h3>
              <p className="text-xs text-gray-600 mb-2">
                {t('home.toolsIntro')}
              </p>
              <div className="space-y-1 text-xs font-medium">
                <Link href="/categories/result" className="block text-green-700 hover:underline">{t('home.toolResults')}</Link>
                <Link href="/categories/admit-card" className="block text-green-700 hover:underline">{t('home.toolAdmit')}</Link>
                <Link href="/categories/online-form" className="block text-green-700 hover:underline">{t('home.toolForms')}</Link>
                <Link href="/categories/verification" className="block text-green-700 hover:underline">{t('home.toolVerification')}</Link>
              </div>
            </div>

            {/* Quick FAQs */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1 text-sm uppercase">{t('home.helpFaq')}</h3>
              <div className="space-y-2">
                {faqs.length > 0 ? (
                  faqs.map((faq: any) => (
                    <details key={faq._id} className="group cursor-pointer">
                      <summary className="font-medium text-gray-800 text-xs truncate list-none flex justify-between items-center group-hover:text-blue-600">
                        <span className="truncate pr-2">{faq.question}</span>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="text-xs text-gray-600 mt-1 pl-1 border-l-2 border-blue-200 whitespace-pre-wrap">{toPlainText(faq.answer)}</p>
                    </details>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">{t('home.noFaqs')}</div>
                )}
              </div>
              <div className="mt-3 text-right">
                <Link href="/faq" className="text-blue-600 text-xs font-semibold hover:underline">
                  {t('home.viewAllFaqs')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: BULLETIN / LATEST POSTS BANNER ================= */}
        <section className="bg-white p-4 rounded border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              {t('home.bulletin')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {bulletins.length > 0 ? (
              bulletins.map((job, idx) => {
                const colors = [
                  'border-blue-500 bg-blue-50/50 text-blue-700',
                  'border-green-500 bg-green-50/50 text-green-700',
                  'border-purple-500 bg-purple-50/50 text-purple-700',
                  'border-orange-500 bg-orange-50/50 text-orange-700'
                ];
                const colorClass = colors[idx % colors.length];
                
                return (
                  <div key={job._id} className={`border-l-4 ${colorClass.split(' text-')[0]} p-2 rounded-r`}>
                    <Link href={`/jobs/${job.slug}`} className={`text-sm ${colorClass.split(' ')[2]} hover:underline font-semibold block truncate`}>
                      {job.title}
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 text-sm text-gray-500 italic py-2">
                {t('home.noBulletins')}
              </div>
            )}
          </div>
        </section>

        {/* ================= SECTION 3: DYNAMIC GRID LAYOUT ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryData.length === 0 && (
            <div className="md:col-span-3 bg-white rounded border p-8 text-center">
              <p className="text-lg font-semibold text-gray-800">{t('home.emptyTitle')}</p>
              <p className="mt-1 text-sm text-gray-500">{t('home.emptyText')}</p>
            </div>
          )}
          {categoryData.map((category, idx) => {
            const colors = [
              'bg-green-600',
              'bg-blue-600',
              'bg-red-600',
              'bg-purple-600',
              'bg-orange-600',
            ];
            const textColors = [
              'text-green-700',
              'text-blue-700',
              'text-red-700',
              'text-purple-700',
              'text-orange-700',
            ];
            const colorClass = colors[idx % colors.length];
            const textClass = textColors[idx % textColors.length];

            const isJobCategory = category.slug === 'job';

            return (
              <div key={category._id} className="bg-white rounded border shadow-sm flex flex-col justify-between">
                <div className="p-4">
                  <h2 className={`text-base font-bold text-white ${colorClass} -mx-4 -mt-4 p-3 rounded-t border-b uppercase tracking-wide text-center`}>
                    {category.displayName || category.name}
                  </h2>
                  <div className="space-y-3 mt-4">
                    {category.items.map((item: any, i: number) => (
                      <div key={item._id || i} className="border-b border-gray-100 pb-2">
                        {isJobCategory ? (
                          <>
                            <Link href={`/jobs/${item.slug}`} className={`text-sm ${textClass} hover:underline font-medium block`}>
                              {item.title}
                            </Link>
                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                              <span>📍 {item.location || item.organization?.name || t('common.allIndia')}</span>
                              {item.lastDate && (
                                <span>📅 {formatDate(item.lastDate, locale)}</span>
                              )}
                            </div>
                          </>
                        ) : (
                          renderLink(item, `text-sm ${textClass} hover:underline font-medium block`)
                        )}
                      </div>
                    ))}
                    {category.items.length === 0 && (
                      <div className="text-sm text-gray-500 italic">{t('home.noItems')}</div>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 text-center border-t rounded-b">
                  <Link href={`/categories/${category.slug}`} className="text-blue-600 hover:underline text-xs font-bold uppercase">
                    {t('common.viewAll', { name: category.displayName || category.name })}
                  </Link>
                </div>
              </div>
            );
          })}

        </section>

      </div>
    </div>
  );
}