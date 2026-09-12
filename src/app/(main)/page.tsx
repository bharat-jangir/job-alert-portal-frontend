import { Metadata } from 'next';
import Link from 'next/link';

// SEO Metadata
export const metadata: Metadata = {
  title: 'RojgarResult - Latest Government Jobs, Results & Admit Cards 2026',
  description: 'Find latest government jobs, examination results, and admit cards. Stay updated with upcoming job notifications, UPSC, SSC, Railway, and Banking jobs.',
  keywords: 'government jobs, latest jobs, UPSC jobs, SSC jobs, railway jobs, banking jobs, job alerts, exam results, admit cards',
  openGraph: {
    title: 'RojgarResult - Latest Government Jobs, Results & Admit Cards 2026',
    description: 'Find latest government jobs, examination results, and admit cards.',
    type: 'website',
    locale: 'en_US',
    siteName: 'RojgarResult',
  },
};

interface Job {
  id: number;
  title: string;
  slug: string;
  category: string;
  postedDate: string;
  lastDate: string;
  location: string;
  organization: string;
}

async function getLatestJobs(): Promise<Job[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await fetch(`${baseUrl}/api/jobs/latest`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error('Failed to fetch latest jobs');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching latest jobs:', error);
    return [
      {
        id: 1,
        title: "BPSC Motor Vehicle Inspector Online Form 2026",
        slug: "bpsc-motor-vehicle",
        category: "Government Jobs",
        postedDate: "2026-01-15",
        lastDate: "2026-02-15",
        location: "Bihar",
        organization: "BPSC"
      },
      {
        id: 2,
        title: "SSC Stenographer Online Form 2026",
        slug: "ssc-stenographer",
        category: "Government Jobs",
        postedDate: "2026-01-13",
        lastDate: "2026-02-20",
        location: "All India",
        organization: "SSC"
      }
    ];
  }
}

async function getPopularJobs(): Promise<Job[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await fetch(`${baseUrl}/api/jobs/popular`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) return [];
    const result = await response.json();
    const data = Array.isArray(result) ? result : (result.data || []);
    return data.slice(0, 5);
  } catch (error) {
    console.error('Error fetching popular jobs:', error);
    return [];
  }
}

async function getRedirectLinks(type: string): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await fetch(`${baseUrl}/api/redirect-links?type=${type}&pageSize=10`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) return [];
    const result = await response.json();
    return result.data?.links || [];
  } catch (error) {
    console.error(`Error fetching redirect links for ${type}:`, error);
    return [];
  }
}

// Fetch jobs by category type (e.g. 'result', 'admit-card')
async function getJobsByType(type: string): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await fetch(`${baseUrl}/api/jobs/by-type/${type}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) return [];
    const result = await response.json();
    const data = result.data ?? result;
    return Array.isArray(data) ? data.slice(0, 10) : [];
  } catch (error) {
    console.error(`Error fetching jobs for type ${type}:`, error);
    return [];
  }
}

async function getActiveCategories(): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/job-categories/active`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return [];
    const result = await response.json();
    return result.data ?? result;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

function slugToRedirectType(slug: string): string {
  return slug.replace(/-/g, '').toUpperCase();
}

async function getOrganizations(): Promise<{ _id: string, name: string, slug: string }[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/organizations/active`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return [];
    const result = await response.json();
    const data = result.data ?? result;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

async function getFaqs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/faqs/public`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const result = await res.json();
    const payload = result.data ?? result;
    return Array.isArray(payload) ? payload.slice(0, 4) : [];
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

async function getBulletins(): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/jobs/bulletins`, {
      next: { revalidate: 60 } // Shorter cache for bulletins
    });
    if (!response.ok) return [];
    const result = await response.json();
    return Array.isArray(result) ? result : (result.data || []);
  } catch (error) {
    console.error('Error fetching bulletins:', error);
    return [];
  }
}

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

export default async function Home() {
  const popularJobs = await getPopularJobs();
  
  const allCategories = await getActiveCategories();
  const homeCategories = allCategories
    .filter((c: any) => c.showOnHome && !c.isDeleted)
    .sort((a: any, b: any) => a.sequenceNo - b.sequenceNo);

  const categoryData = await Promise.all(
    homeCategories.map(async (category: any) => {
      const jobs = await getJobsByType(category.slug);
      const redirectLinks = await getRedirectLinks(slugToRedirectType(category.slug));
      const combined = [...jobs, ...redirectLinks].slice(0, 10);
      return { ...category, items: combined };
    })
  );
  
  const organizations = await getOrganizations();
  const faqs = await getFaqs();
  const bulletins = await getBulletins();

  return (
    <div className="bg-gray-100 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">

        {/* ================= SECTION 1: TOP SIDEBAR CONTENT (GRID/BANNER ROW) ================= */}
        <section className="space-y-4">
          {/* Social Channels Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-600 text-white p-4 rounded flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-lg">Join WhatsApp Channel</h3>
                <p className="text-xs text-green-100">Get instant job alerts on your phone</p>
              </div>
              <button className="bg-white text-green-700 hover:bg-green-50 px-4 py-1.5 rounded font-semibold text-sm">
                Join Now
              </button>
            </div>

            <div className="bg-blue-600 text-white p-4 rounded flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-lg">Join Telegram Group</h3>
                <p className="text-xs text-blue-100">Get daily updates and PDF notifications</p>
              </div>
              <button className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-1.5 rounded font-semibold text-sm">
                Join Now
              </button>
            </div>
          </div>

          {/* Widgets Grid (Popular Jobs, Categories, Tools & FAQs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Popular Jobs */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1 text-sm uppercase">Popular Jobs</h3>
              <div className="space-y-1.5 text-sm">
                {popularJobs.length > 0 ? (
                  popularJobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.slug}`} className="block text-blue-600 hover:underline truncate">
                      {job.title}
                    </Link>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">No popular jobs found.</div>
                )}
              </div>
            </div>

            {/* Organizations */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1 text-sm uppercase">Top Organizations</h3>
              <div className="space-y-1.5 text-sm">
                {organizations.length > 0 ? (
                  organizations.slice(0, 5).map((org) => (
                    <Link key={org._id} href={`/search?q=${encodeURIComponent(org.name)}`} className="block text-purple-600 hover:underline truncate">
                      {org.name}
                    </Link>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">No organizations available.</div>
                )}
              </div>
            </div>

            {/* Rojgar Result Info & Tools */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1 text-sm uppercase">Rojgar Tools & Info</h3>
              <p className="text-xs text-gray-600 mb-2">
                Free tools and official updates in Hindi for all exam notifications.
              </p>
              <div className="space-y-1 text-xs font-medium">
                <Link href="/results" className="block text-green-700 hover:underline">✅ Latest Sarkari Results</Link>
                <Link href="/admit-cards" className="block text-green-700 hover:underline">✅ Download Admit Cards</Link>
                <Link href="/latest-jobs" className="block text-green-700 hover:underline">✅ Online Application Links</Link>
                <Link href="/verification" className="block text-green-700 hover:underline">✅ Verification Tools</Link>
              </div>
            </div>

            {/* Quick FAQs */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-1 text-sm uppercase">Help & FAQ</h3>
              <div className="space-y-2">
                {faqs.length > 0 ? (
                  faqs.map((faq: any) => (
                    <details key={faq._id} className="group cursor-pointer">
                      <summary className="font-medium text-gray-800 text-xs truncate list-none flex justify-between items-center group-hover:text-blue-600">
                        <span className="truncate pr-2">{faq.question}</span>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="text-xs text-gray-600 mt-1 pl-1 border-l-2 border-blue-200 whitespace-pre-wrap">{faq.answer}</p>
                    </details>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">No FAQs available.</div>
                )}
              </div>
              <div className="mt-3 text-right">
                <Link href="/faq" className="text-blue-600 text-xs font-semibold hover:underline">
                  VIEW ALL FAQS →
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
              LATEST BULLETIN & ANNOUNCEMENTS
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
                No active announcements right now.
              </div>
            )}
          </div>
        </section>

        {/* ================= SECTION 3: DYNAMIC GRID LAYOUT ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
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
                              <span>📍 {item.location || item.organization?.name || 'All India'}</span>
                              {item.lastDate && (
                                <span>📅 {new Date(item.lastDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </>
                        ) : (
                          renderLink(item, `text-sm ${textClass} hover:underline font-medium block`)
                        )}
                      </div>
                    ))}
                    {category.items.length === 0 && (
                      <div className="text-sm text-gray-500 italic">No items found.</div>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 text-center border-t rounded-b">
                  <Link href={`/categories/${category.slug}`} className="text-blue-600 hover:underline text-xs font-bold uppercase">
                    View All {category.displayName} →
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