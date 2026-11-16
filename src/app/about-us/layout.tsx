import type { ReactNode } from 'react';

export const metadata = {
  title: 'About Us',
  description: 'Who we are and how we publish government job, result and admit card updates.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
