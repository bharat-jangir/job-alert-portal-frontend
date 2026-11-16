import type { ReactNode } from 'react';

export const metadata = {
  title: 'Contact Us',
  description: 'Contact us to report a mistake, suggest a post or send feedback.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
