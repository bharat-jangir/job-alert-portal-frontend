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

async function getAdmissions() {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3001';
      
    const response = await fetch(`${baseUrl}/api/redirect-links?type=ADMISSION&pageSize=100`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) return [];
    const result = await response.json();
    return result.data?.links || [];
  } catch (error) {
    console.error('Error fetching admissions:', error);
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

function LinkList({ links }: { links: RedirectLink[] }) {
  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Admissions Found</h3>
        <p className="text-gray-600">No admissions available at the moment. Please check back later.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div key={link._id} className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
          {renderLink(link, "block")}
        </div>
      ))}
    </div>
  );
}

export default async function AdmissionsPage() {
  const links = await getAdmissions();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Admissions</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Browse all available admissions.</p>
          </div>
          <Suspense fallback={<div className="flex justify-center items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading admissions...</span></div>}>
            <LinkList links={links} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
