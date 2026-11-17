import Header from '@/components/Header';
import Footer from '@/components/Footer';
import React from 'react';

export default function LatestJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 px-2 md:px-4 py-6">
        {/* Left Sidebar */}
        <aside className="hidden md:block md:w-1/5 lg:w-1/6 sticky top-24 self-start">
          <div className="bg-white rounded shadow p-4 mb-4">
            {/* Example: Ad or Info */}
            <div className="text-gray-700 text-sm font-medium">Advertisement</div>
            <div className="mt-2 h-32 bg-gray-200 rounded" />
          </div>
        </aside>
        {/* Main Content */}
        <section className="w-full md:w-3/5 lg:w-2/3 mx-auto">
          {children}
        </section>
        {/* Right Sidebar */}
        <aside className="hidden md:block md:w-1/5 lg:w-1/6 sticky top-24 self-start">
          <div className="bg-white rounded shadow p-4 mb-4">
            {/* Example: Ad or Info */}
            <div className="text-gray-700 text-sm font-medium">Advertisement</div>
            <div className="mt-2 h-32 bg-gray-200 rounded" />
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
} 