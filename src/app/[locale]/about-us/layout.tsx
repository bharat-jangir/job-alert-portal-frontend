import { englishOnly } from '@/i18n/english-only-metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const meta: Metadata = {
  title: 'About Us',
  description: 'Who we are and how we publish government job, result and admit card updates.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const generateMetadata = englishOnly('/about-us', meta);
