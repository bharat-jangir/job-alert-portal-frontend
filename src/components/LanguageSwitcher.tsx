'use client';

import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { Languages } from 'lucide-react';
import { basePath, localePath, type Locale } from '@/i18n/config';
import { useLocale, useT } from '@/i18n/provider';

/**
 * Toggle between English and Hindi for the page the visitor is on. `target` can be given by pages that
 * know better (a post only has a Hindi version when it was translated): it overrides the guess.
 */
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname() || '/';
  const other: Locale = locale === 'hi' ? 'en' : 'hi';
  const href = localePath(other, basePath(pathname));
  return (
    <NextLink
      href={href}
      hrefLang={other === 'hi' ? 'hi-IN' : 'en-IN'}
      lang={other}
      title={t('lang.switchLabel')}
      aria-label={t('lang.switchLabel')}
      className={`inline-flex items-center gap-1.5 rounded-md border border-white/40 px-2.5 py-1 text-sm font-semibold hover:bg-white/10 ${className}`}
    >
      <Languages className="h-4 w-4" aria-hidden />
      {t('lang.switchTo')}
    </NextLink>
  );
}
