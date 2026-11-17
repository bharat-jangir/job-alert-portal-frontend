import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePath, type Locale } from './config';
import { SITE_URL } from '@/lib/site';

/** Absolute URL of a path in a language. */
export const absoluteUrl = (locale: Locale, path: string) => `${SITE_URL}${localePath(locale, path) === '/' ? '' : localePath(locale, path)}`;

/**
 * `alternates` for Next metadata. `available` lists the languages this exact page really exists in
 * (a post without a Hindi version must not claim a Hindi alternate). Each language canonicalises to itself;
 * with 2+ languages hreflang tags (and x-default = English) are added.
 */
export function pageAlternates(locale: Locale, path: string, available: readonly Locale[] = LOCALES) {
  const langs = available.includes(locale) ? available : [...available, locale];
  const alt: Record<string, string> = {};
  if (langs.length > 1) {
    for (const l of langs) alt[LOCALE_META[l].hreflang] = absoluteUrl(l, path);
    if (langs.includes(DEFAULT_LOCALE)) alt['x-default'] = absoluteUrl(DEFAULT_LOCALE, path);
  }
  return { canonical: absoluteUrl(locale, path), languages: Object.keys(alt).length ? alt : undefined };
}
