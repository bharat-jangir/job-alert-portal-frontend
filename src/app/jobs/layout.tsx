import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
}