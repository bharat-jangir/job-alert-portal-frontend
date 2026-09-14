import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface RedirectLink {
  _id: string;
  slug: string;
  title: string;
  redirectType: string;
  externalUrl?: string;
}

async function getResults() {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3001';
      
    const response = await fetch(`${baseUrl}/api/redirect-links?type=RESULT&pageSize=100`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) return [];
    const result = await response.json();
    return result.data?.links || [];
  } catch (error) {
    console.error('Error fetching results:', error);
    return [];
  }
}

const renderLink = (link: RedirectLink, className: string) => {
  if (link.redirectType === 'external') {
    return (
      <a 
        href={link.externalUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={className}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{link.title}</h2>
        </div>
      </a>
    );
  }
  
  const href = link.slug?.startsWith('/') ? link.slug : `/jobs/${link.slug}`;
  return (
    <Link href={href} className={className}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{link.title}</h2>
      </div>
    </Link>
  );
};

function JobsList({ jobs }: { jobs: RedirectLink[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600">No results available at the moment. Please check back later.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job._id} className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
          {renderLink(job, "block")}
        </div>
      ))}
    </div>
  );
}

export default async function ResultsPage() {
  const jobs = await getResults();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Results</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Browse all available results.</p>
          </div>
          <Suspense fallback={<div className="flex justify-center items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading results...</span></div>}>
            <JobsList jobs={jobs} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
