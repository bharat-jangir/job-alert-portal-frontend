import type { Metadata } from 'next';
import { absoluteUrl } from './seo';

/**
 * generateMetadata for pages that only exist in English. Their /hi/ twin renders the same English text
 * inside the Hindi chrome, so it canonicalises to the English page and stays out of the index.
 */
export function englishOnly(path: string, meta: Metadata) {
  return async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
      ...meta,
      alternates: { canonical: absoluteUrl('en', path) },
      ...(locale === 'en' ? {} : { robots: { index: false, follow: true } }),
    };
  };
}
