import { englishOnly } from '@/i18n/english-only-metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const meta: Metadata = {
  title: 'Contact Us',
  description: 'Contact us to report a mistake, suggest a post or send feedback.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const generateMetadata = englishOnly('/contact', meta);
