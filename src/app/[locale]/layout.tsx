import '../globals.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import { SITE, SITE_URL } from '@/lib/site';
import { LOCALES, LOCALE_META, isLocale, type Locale } from '@/i18n/config';
import { getMessages, getT } from '@/i18n/dictionary';
import { I18nProvider } from '@/i18n/provider';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
// Devanagari glyphs only download when a page actually uses them (unicode-range), so English visitors pay nothing
const deva = Noto_Sans_Devanagari({ subsets: ['devanagari'], display: 'swap', variable: '--font-deva', preload: false });

// Unknown languages never reach here ("/fr/x" is rewritten under "/en" by proxy.ts and 404s in the
// catch-all), and the layout also 404s on them. `dynamicParams = false` is deliberately NOT set: with it,
// regenerating an expired ISR page answered 404 (NoFallbackError) on the first request after expiry.
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale);
  const year = new Date().getFullYear();
  return {
    metadataBase: new URL(SITE_URL),
    alternates: { types: { 'application/rss+xml': `${SITE_URL}/feed.xml` } },
    title: { default: `${SITE.name} – ${t('meta.homeTitle', { year })}`, template: `%s | ${SITE.name}` },
    description: t('meta.siteDescription'),
    keywords: t('meta.keywords'),
    authors: [{ name: SITE.name }],
    creator: SITE.name,
    openGraph: { type: 'website', locale: LOCALE_META[locale].ogLocale, siteName: SITE.name, url: SITE_URL },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
    ...((process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION)
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  return (
    <html lang={LOCALE_META[l].htmlLang} className={`scroll-smooth ${inter.variable} ${deva.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900" style={{ fontFamily: 'var(--font-inter), var(--font-deva), system-ui, sans-serif' }}>
        <I18nProvider locale={l} messages={getMessages(l)}>{children}</I18nProvider>
      </body>
    </html>
  );
}
