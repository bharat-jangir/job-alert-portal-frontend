/**
 * Languages of the public site. English is the default and lives at the root (`/jobs/x`);
 * every other language is a path prefix (`/hi/jobs/x`). One site, one sitemap, no subdomains.
 * Adding a language: add it here, add `messages/<code>.json`, and add it to the backend LANGS list.
 */
export const LOCALES = ['en', 'hi'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (v: unknown): v is Locale => (LOCALES as readonly string[]).includes(v as string);

export const LOCALE_META: Record<Locale, { label: string; htmlLang: string; hreflang: string; ogLocale: string; dateLocale: string }> = {
  en: { label: 'English', htmlLang: 'en-IN', hreflang: 'en-IN', ogLocale: 'en_IN', dateLocale: 'en-IN' },
  hi: { label: 'हिन्दी', htmlLang: 'hi-IN', hreflang: 'hi-IN', ogLocale: 'hi_IN', dateLocale: 'hi-IN' },
};

/** `/jobs/x` -> `/hi/jobs/x` for Hindi, unchanged for English. External URLs and hashes pass through. */
export function localePath(locale: Locale, href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (locale === DEFAULT_LOCALE) return href;
  if (href === '/') return `/${locale}`;
  // already prefixed (e.g. a link built from a pathname)
  if (href === `/${locale}` || href.startsWith(`/${locale}/`) || href.startsWith(`/${locale}?`)) return href;
  return `/${locale}${href}`;
}

/** Removes a leading locale segment: `/hi/jobs/x` -> `/jobs/x`, `/hi` -> `/`. */
export function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (l === DEFAULT_LOCALE) continue;
    if (pathname === `/${l}`) return '/';
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

/** Like stripLocale but also removes the default language's internal "/en" prefix (usePathname can report it). */
export function basePath(pathname: string): string {
  if (pathname === `/${DEFAULT_LOCALE}`) return '/';
  if (pathname.startsWith(`/${DEFAULT_LOCALE}/`)) return pathname.slice(DEFAULT_LOCALE.length + 1);
  return stripLocale(pathname);
}

/** The locale a pathname is in (the default when it has no prefix). */
export function localeOfPath(pathname: string): Locale {
  for (const l of LOCALES) {
    if (l !== DEFAULT_LOCALE && (pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return l;
  }
  return DEFAULT_LOCALE;
}

export function formatDate(value: string | number | Date | undefined | null, locale: Locale, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  // numbers stay 0-9 in both languages: this is what the post tables use too
  return d.toLocaleDateString(`${LOCALE_META[locale].dateLocale}-u-nu-latn`, opts ?? { day: 'numeric', month: 'short', year: 'numeric' });
}
