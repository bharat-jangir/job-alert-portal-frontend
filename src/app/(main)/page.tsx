import { Metadata } from 'next';
import Link from 'next/link';
import JobCard from '@/components/JobCard';
import ResultCard from '@/components/ResultCard';
import AdmitCardCard from '@/components/AdmitCardCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentManager from '@/components/ContentManager';

// SEO Metadata
export const metadata: Metadata = {
  title: 'RojgarResult - Latest Government Jobs, Results & Admit Cards 2025',
  description: 'Find latest government jobs, examination results, and admit cards. Stay updated with upcoming job notifications, UPSC, SSC, Railway, and Banking jobs.',
  keywords: 'government jobs, latest jobs, UPSC jobs, SSC jobs, railway jobs, banking jobs, job alerts, exam results, admit cards',
  openGraph: {
    title: 'RojgarResult - Latest Government Jobs, Results & Admit Cards 2025',
    description: 'Find latest government jobs, examination results, and admit cards. Stay updated with upcoming job notifications.',
    type: 'website',
    locale: 'en_US',
    siteName: 'RojgarResult',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RojgarResult - Latest Government Jobs, Results & Admit Cards 2025',
    description: 'Find latest government jobs, examination results, and admit cards. Stay updated with upcoming job notifications.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

// Define the job type
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

// Server-side data fetching function
async function getLatestJobs(): Promise<Job[]> {
  try {
    // In production, you would use the actual API URL
    // For development, we'll use relative URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3001';
    
    const response = await fetch(`${baseUrl}/api/jobs/latest`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch latest jobs');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching latest jobs:', error);
    // Return fallback data if API fails
    return [
      {
        id: 1,
        title: "BPSC Motor Vehicle Inspector Online Form 2025",
        slug: "bpsc-motor-vehicle",
        category: "Government Jobs",
        postedDate: "2025-01-15",
        lastDate: "2025-02-15",
        location: "Bihar",
        organization: "BPSC"
      },
      {
        id: 2,
        title: "SSC Stenographer Online Form 2025",
        slug: "ssc-stenographer",
        category: "Government Jobs",
        postedDate: "2025-01-13",
        lastDate: "2025-02-20",
        location: "All India",
        organization: "SSC"
      }
    ];
  }
}

async function getAllJobs(): Promise<Job[]> {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://yourdomain.com'
      : 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/jobs`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) throw new Error('Failed to fetch jobs');
    const result = await response.json();
    // Debug log
    console.log('API result:', result);
    if (Array.isArray(result.data)) {
      return result.data;
    }
    // If result.data is not an array, return an empty array
    return [];
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }
}

async function getRedirectLinks(type: string): Promise<any[]> {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3001';
      
    const response = await fetch(`${baseUrl}/api/redirect-links?type=${type}&pageSize=10`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const result = await response.json();
    return result.data?.links || [];
  } catch (error) {
    console.error(`Error fetching redirect links for ${type}:`, error);
    return [];
  }
}

async function getCategories(): Promise<string[]> {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://yourdomain.com'
      : 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/jobs/categories`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return [];
    const result = await response.json();
    return result.data?.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

const renderLink = (link: any, className: string) => {
  if (link.redirectType === 'external') {
    return (
      <a 
        href={link.externalUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={className}
      >
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
  // Fetch latest jobs on the server
  const latestJobs = await getLatestJobs();
  
  // Fetch redirect links
  const resultLinks = await getRedirectLinks('RESULT');
  const admitCardLinks = await getRedirectLinks('ADMITCARD');
  const naukriFormLinks = await getRedirectLinks('ONLINEFORM');
  const admissionLinks = await getRedirectLinks('ADMISSION');
  const categories = await getCategories();

  return (
    <>
      {/* Simple Header */}
     

      {/* Main Content */}
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="space-y-4">
                {/* Join Buttons */}
                <div className="bg-green-500 text-white p-3 text-center rounded">
                  <h3 className="font-semibold mb-2">Join WhatsApp Channel</h3>
                  <button className="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium">
                    Join Now
                  </button>
                </div>

                <div className="bg-blue-500 text-white p-3 text-center rounded">
                  <h3 className="font-semibold mb-2">Join Telegram Group</h3>
                  <button className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
                    Join Now
                  </button>
                </div>

                {/* Popular Jobs */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">Popular Jobs</h3>
                  <div className="space-y-1 text-sm">
                    <Link href="/jobs/upsc-cds" className="block text-blue-600 hover:underline">UPSC CDS II 2025 Apply Online</Link>
                    <Link href="/jobs/upsc-nda" className="block text-blue-600 hover:underline">UPSC NDA II 2025 Apply Online</Link>
                    <Link href="/jobs/ssc-cgl" className="block text-blue-600 hover:underline">SSC CGL 2025 Apply Online</Link>
                    <Link href="/jobs/bpsc" className="block text-blue-600 hover:underline">BPSC 71 Pre 2025 Apply Online</Link>
                    <Link href="/jobs/up-bed" className="block text-blue-600 hover:underline">UP B.Ed 2025 Result / Score Card</Link>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">Categories</h3>
                  <div className="space-y-1 text-sm">
                    <Link href="/category/scholarship" className="block text-blue-600 hover:underline">Scholarship & Sarkari Yojana</Link>
                    <Link href="/category/10th-12th" className="block text-blue-600 hover:underline">10th & 10+2 Jobs</Link>
                    <Link href="/category/police-defence" className="block text-blue-600 hover:underline">Police & Defence Jobs</Link>
                    <Link href="/category/admission" className="block text-blue-600 hover:underline">Admission / University Form</Link>
                    <Link href="/category/btech-mba" className="block text-blue-600 hover:underline">B.Tech / MBA Jobs</Link>
                    <Link href="/category/iti-diploma" className="block text-blue-600 hover:underline">ITI / Diploma / Apprentice Jobs</Link>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Latest Posts */}
              <div className="bg-white p-4 rounded border mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Latest Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border-l-4 border-blue-500 pl-2">
                    <Link href="/admit-card/mpesb-anm" className="text-sm text-blue-600 hover:underline font-medium">
                      MPESB ANM Admit Card 2025
                    </Link>
                  </div>
                  <div className="border-l-4 border-green-500 pl-2">
                    <Link href="/admit-card/neet-pg" className="text-sm text-green-600 hover:underline font-medium">
                      NEET PG Admit Card 2025 : Exam City
                    </Link>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-2">
                    <Link href="/admit-card/bihar-police" className="text-sm text-purple-600 hover:underline font-medium">
                      Bihar Police Constable Admit Card 2025 : Exam Date
                    </Link>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-2">
                    <Link href="/admit-card/union-bank" className="text-sm text-orange-600 hover:underline font-medium">
                      Union Bank Assistant Manager Admit Card 2025
                    </Link>
                  </div>
                </div>
              </div>

              {/* LATEST JOBS - Now dynamically rendered from API */}
              <div className="bg-white p-4 rounded border mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">LATEST JOBS</h2>
                <div className="space-y-2">
                  {latestJobs.map((job) => (
                    <div key={job.id} className="border-l-4 border-blue-500 pl-2">
                      <Link href={`/jobs/${job.slug}`} className="text-sm text-blue-600 hover:underline">
                        {job.title}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="mr-2">📍 {job.location}</span>
                        <span className="mr-2">🏢 {job.organization}</span>
                        <span>📅 Deadline: {new Date(job.lastDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <Link href="/latest-jobs" className="text-blue-600 hover:underline font-medium">
                    VIEW MORE
                  </Link>
                </div>
              </div>

              {/* CATEGORIES */}
              <div className="bg-white p-4 rounded border mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">CATEGORIES</h2>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat} className="border-l-4 border-purple-500 pl-2">
                      <a href={`/jobs?category=${encodeURIComponent(cat)}`} className="text-sm text-purple-600 hover:underline">{cat}</a>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="text-sm text-gray-500 italic">No categories found.</div>
                  )}
                </div>
              </div>

              {/* RESULT */}
              <div className="bg-white p-4 rounded border mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">RESULT</h2>
                <div className="space-y-2">
                  {resultLinks.map((link) => (
                    <div key={link._id} className="border-l-4 border-green-500 pl-2">
                      {renderLink(link, "text-sm text-green-600 hover:underline")}
                    </div>
                  ))}
                  {resultLinks.length === 0 && (
                    <div className="text-sm text-gray-500 italic">No results found.</div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <Link href="/results" className="text-blue-600 hover:underline font-medium">
                    VIEW MORE
                  </Link>
                </div>
              </div>

              {/* ADMIT CARD */}
              <div className="bg-white p-4 rounded border mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">ADMIT CARD</h2>
                <div className="space-y-2">
                  {admitCardLinks.map((link) => (
                    <div key={link._id} className="border-l-4 border-blue-500 pl-2">
                      {renderLink(link, "text-sm text-blue-600 hover:underline")}
                    </div>
                  ))}
                  {admitCardLinks.length === 0 && (
                    <div className="text-sm text-gray-500 italic">No admit cards found.</div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <Link href="/admit-cards" className="text-blue-600 hover:underline font-medium">
                    VIEW MORE
                  </Link>
                </div>
              </div>

              {/* NAUKRI FORM */}
              <div className="bg-white p-4 rounded border mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">NAUKRI FORM</h2>
                <div className="space-y-2">
                  {naukriFormLinks.map((link) => (
                    <div key={link._id} className="border-l-4 border-orange-500 pl-2">
                      {renderLink(link, "text-sm text-orange-600 hover:underline")}
                    </div>
                  ))}
                  {naukriFormLinks.length === 0 && (
                    <div className="text-sm text-gray-500 italic">No latest forms found.</div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <Link href="/latest-forms" className="text-blue-600 hover:underline font-medium">
                    VIEW MORE
                  </Link>
                </div>
              </div>

              {/* ADMISSION */}
              <div className="bg-white p-4 rounded border mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">ADMISSION</h2>
                <div className="space-y-2">
                  {admissionLinks.map((link) => (
                    <div key={link._id} className="border-l-4 border-purple-500 pl-2">
                      {renderLink(link, "text-sm text-purple-600 hover:underline")}
                    </div>
                  ))}
                  {admissionLinks.length === 0 && (
                    <div className="text-sm text-gray-500 italic">No admissions found.</div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <Link href="/admissions" className="text-blue-600 hover:underline font-medium">
                    VIEW MORE
                  </Link>
                </div>
              </div>
            </main>

            {/* Right Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="space-y-4">
                {/* Rojgar Result Tools */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">Rojgar Result Tools</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    The link of Rojgar Result Tools is available on RojgarResult.Com which will provide a lot of comfort to the candidates and this Rojgar Result 2025 is absolutely free for everyone.
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-green-600">
                      <span className="mr-1">✅</span>
                      <span>Rojgar Result</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <span className="mr-1">✅</span>
                      <span>Rojgar Result</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <span className="mr-1">✅</span>
                      <span>Rojgar Result</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <span className="mr-1">✅</span>
                      <span>Rojgar Result</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <span className="mr-1">✅</span>
                      <span>Rojgar Result</span>
                    </div>
                  </div>
                </div>

                {/* Rojgar Result Notification */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">Rojgar Result Notification</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>
                      ► Rojgar Result provides you the latest RojgarResult.Com updates for all of your Rojgar Result, Result, Sarkari communicating Updates in Hindi Language.
                    </p>
                    <p>
                      ► Rojgar Result has all the information you need about the Rojgar Result and the latest Rojgar Results. All the necessary information can be accessed by simply clicking the required link.
                    </p>
                    <p>
                      ► At the moment, all students desire to work for the government. This is why government jobs encourage people to join their ranks.
                    </p>
                  </div>
                </div>

                {/* Important Sections */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">Important Sections</h3>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold text-blue-600 text-sm mb-1">Rojgar Result Admit Card 2025:</h4>
                      <p className="text-xs text-gray-600">
                        This Admit card section of Rojgar Result is the important part where link of important admit card is available.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-600 text-sm mb-1">RojgarResult Results 2025:</h4>
                      <p className="text-xs text-gray-600">
                        This section of Rojgar Result is very important because the candidates who appeared for the exam now want to know when the result will come.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-white p-3 rounded border">
                  <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">FAQ</h3>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">What is Rojgar Result?</h4>
                      <p className="text-xs text-gray-600">
                        Go to Google and type Rojgar Result then click on the website RojgarResult.Com and get all the latest updates.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Is the Rojgar Result Updated Daily?</h4>
                      <p className="text-xs text-gray-600">
                        Rojgar Results 24×7 Updated webpage to provide information about the latest notification of the Government Exams.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Is Rojgar Result a Government Website?</h4>
                      <p className="text-xs text-gray-600">
                        Rojgar Result is not a government website, it only gives information about government jobs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
     
    </>
  );
}
