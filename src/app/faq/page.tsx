// /faq/page.tsx – Public SSR FAQ page
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaqAccordion } from '@/components/FaqAccordion';
import Link from 'next/link';
import { HelpCircle, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) – Job Alert',
  description: 'Find answers to common questions about government jobs, admit cards, results, answer keys and sarkari naukri notifications on Job Alert.',
  robots: { index: true, follow: true },
};

interface Faq {
  _id: string;
  question: string;
  answer: string;
  category?: string;
}

async function getFaqs(): Promise<Faq[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/faqs/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const result = await res.json();
    const payload = result.data ?? result;
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
}

const STATIC_FAQS: Faq[] = [
  { _id: 's1', question: 'What is Job Alert?', category: 'General', answer: 'Job Alert is a free platform that aggregates the latest Government of India job notifications, results, admit cards, answer keys, online forms, and sarkari yojana updates in one place.' },
  { _id: 's2', question: 'How do I apply for a government job listed here?', category: 'Applying', answer: 'Click on the job listing and then click the "Apply Now" button. You will be redirected to the official government website where you can submit your application. Job Alert does not collect your personal data.' },
  { _id: 's3', question: 'How often is the data updated?', category: 'General', answer: 'Our team updates job notifications daily. You can also subscribe to our newsletter or join our Telegram group for instant notifications.' },
  { _id: 's4', question: 'Is Job Alert free to use?', category: 'General', answer: 'Yes, Job Alert is completely free for all users. We will never charge you for accessing job notifications, results or admit cards.' },
  { _id: 's5', question: 'How do I download an admit card?', category: 'Admit Cards', answer: 'Go to the Admit Cards section, click on your exam, and follow the link to the official website. You will need your registration number and date of birth to download the hall ticket.' },
  { _id: 's6', question: 'Where can I check exam results?', category: 'Results', answer: 'Visit the Results section on Job Alert. Each result post links directly to the official board or commission website where you can check your result by roll number or registration number.' },
];

export default async function FaqPage() {
  const dbFaqs = await getFaqs();
  const faqs = dbFaqs.length > 0 ? dbFaqs : STATIC_FAQS;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-blue-700 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full mb-4">
            <HelpCircle className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-blue-200 text-sm">Everything you need to know about Job Alert and government job applications</p>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-600">FAQ</span>
          </nav>

          {faqs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No FAQs available yet.</div>
          ) : (
            <FaqAccordion faqs={faqs} />
          )}

          {/* Contact CTA */}
          <div className="mt-12 bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <h3 className="font-semibold text-gray-800 mb-1">Still have questions?</h3>
            <p className="text-sm text-gray-500 mb-4">Our team is here to help you with any queries about government jobs.</p>
            <Link href="/contact"
              className="inline-block bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition">
              Contact Us →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
