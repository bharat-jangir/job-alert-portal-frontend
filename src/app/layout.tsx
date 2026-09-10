import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Job Alert – Latest Sarkari Naukri, Results & Admit Cards 2025',
    template: '%s | Job Alert',
  },
  description: 'Find latest government jobs, sarkari naukri, recruitment notifications, admit cards, and results.',
  keywords: 'sarkari naukri, government jobs, admit card, result, answer key, online form, SSC, UPSC, Railway, Bank',
  authors: [{ name: 'Job Alert' }],
  creator: 'Job Alert',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Job Alert',
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  verification: { google: 'your-google-site-verification' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.className}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
