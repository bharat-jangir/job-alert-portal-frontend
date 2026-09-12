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
    // Assuming backend returns an array of { title, slug } for /api/jobs/by-type/:type
    return Array.isArray(result) ? result.slice(0, 10) : [];
  } catch (error) {
    console.error(`Error fetching jobs for type ${type}:`, error);
    return [];
  }
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
  if (link.redirectType === 'external') {
    return (
      <a href={link.externalUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {link.title}
      </a>
    );
  }

  const href = link.slug?.startsWith('/') ? link.slug : `/jobs/${link.slug}`;
  return (
    <Link href={href} className={className}>
      {link.title}
    </Link>
  );
};

export default async function Home() {
  const latestJobs = await getLatestJobs();
  const popularJobs = await getPopularJobs();
  
  const resultLinks = await getRedirectLinks('RESULT');
  const resultJobs = await getJobsByType('result');
  const combinedResults = [...resultJobs, ...resultLinks].slice(0, 10);
  
  const admitCardLinks = await getRedirectLinks('ADMITCARD');
  const admitCardJobs = await getJobsByType('admit-card');
  const combinedAdmitCards = [...admitCardJobs, ...admitCardLinks].slice(0, 10);
  
  const naukriFormLinks = await getRedirectLinks('ONLINEFORM');
  const admissionLinks = await getRedirectLinks('ADMISSION');
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

        {/* ================= SECTION 3: 3-COLUMN MAIN CONTENT LAYOUT ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* COLUMN 1: RESULTS */}
          <div className="bg-white rounded border shadow-sm flex flex-col justify-between">
            <div className="p-4">
              <h2 className="text-base font-bold text-white bg-green-600 -mx-4 -mt-4 p-3 rounded-t border-b uppercase tracking-wide text-center">
                RESULTS
              </h2>
              <div className="space-y-2 mt-4">
                {combinedResults.map((link, idx) => (
                  <div key={link._id || idx} className="border-b border-gray-100 pb-1.5">
                    {renderLink(link, "text-sm text-green-700 hover:underline font-medium block")}
                  </div>
                ))}
                {combinedResults.length === 0 && (
                  <div className="text-sm text-gray-500 italic">No results found.</div>
                )}
              </div>
            </div>
            <div className="p-3 bg-gray-50 text-center border-t rounded-b">
              <Link href="/results" className="text-blue-600 hover:underline text-xs font-bold uppercase">
                View All Results →
              </Link>
            </div>
          </div>

          {/* COLUMN 2: ADMIT CARDS */}
          <div className="bg-white rounded border shadow-sm flex flex-col justify-between">
            <div className="p-4">
              <h2 className="text-base font-bold text-white bg-blue-600 -mx-4 -mt-4 p-3 rounded-t border-b uppercase tracking-wide text-center">
                ADMIT CARD
              </h2>
              <div className="space-y-2 mt-4">
                {combinedAdmitCards.map((link, idx) => (
                  <div key={link._id || idx} className="border-b border-gray-100 pb-1.5">
                    {renderLink(link, "text-sm text-blue-700 hover:underline font-medium block")}
                  </div>
                ))}
                {combinedAdmitCards.length === 0 && (
                  <div className="text-sm text-gray-500 italic">No admit cards found.</div>
                )}
              </div>
            </div>
            <div className="p-3 bg-gray-50 text-center border-t rounded-b">
              <Link href="/admit-cards" className="text-blue-600 hover:underline text-xs font-bold uppercase">
                View All Admit Cards →
              </Link>
            </div>
          </div>

          {/* COLUMN 3: LATEST JOBS & ONLINE FORMS */}
          <div className="bg-white rounded border shadow-sm flex flex-col justify-between">
            <div className="p-4">
              <h2 className="text-base font-bold text-white bg-red-600 -mx-4 -mt-4 p-3 rounded-t border-b uppercase tracking-wide text-center">
                LATEST JOBS
              </h2>
              <div className="space-y-3 mt-4">
                {latestJobs.map((job) => (
                  <div key={job.id} className="border-b border-gray-100 pb-2">
                    <Link href={`/jobs/${job.slug}`} className="text-sm text-red-700 hover:underline font-medium block">
                      {job.title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                      <span>📍 {job.location || job.organization?.name || 'All India'}</span>
                      {job.lastDate && (
                        <span>📅 {new Date(job.lastDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Additional Forms / Admission Sub-Section */}
                {naukriFormLinks.length > 0 && (
                  <div className="pt-2 border-t">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Latest Forms</span>
                    {naukriFormLinks.slice(0, 3).map((link) => (
                      <div key={link._id} className="mb-1">
                        {renderLink(link, "text-sm text-orange-600 hover:underline block")}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 bg-gray-50 text-center border-t rounded-b">
              <Link href="/latest-jobs" className="text-blue-600 hover:underline text-xs font-bold uppercase">
                View All Latest Jobs →
              </Link>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}