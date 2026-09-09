import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Job Alert',
  description: 'Find latest government jobs, sarkari naukri, recruitment notifications, admit cards, and results.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
