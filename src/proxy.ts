import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES } from '@/i18n/config';

/**
 * Language routing. Pages live under app/[locale]/. The default language (English) is served at the
 * root: "/jobs/x" is rewritten internally to "/en/jobs/x" (the visitor's URL does not change), while
 * other languages keep their prefix ("/hi/jobs/x"). The internal "/en/..." form is never public: it
 * redirects to the clean URL so one page never has two addresses.
 */
/** Real files (images, fonts, the XML/robots routes). A dot alone is not enough: tags like "B.Ed Jobs" are pages. */
const FILE = /^\/(?:feed\.xml|sitemap\.xml|robots\.txt|favicon\.ico)$|\.(?:png|jpe?g|gif|svg|webp|avif|ico|css|js|map|woff2?|ttf|otf|pdf|txt|xml|json|webmanifest)$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (FILE.test(pathname)) return NextResponse.next();
  const url = request.nextUrl.clone();

  const prefix = `/${DEFAULT_LOCALE}`;
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    url.pathname = pathname.slice(prefix.length) || '/';
    return NextResponse.redirect(url, 308);
  }

  const hasLocale = LOCALES.some((l) => l !== DEFAULT_LOCALE && (pathname === `/${l}` || pathname.startsWith(`/${l}/`)));
  if (hasLocale) return NextResponse.next();

  url.pathname = `${prefix}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // everything except the API proxy, Next internals and the on-demand revalidation hook (files are skipped in proxy())
  matcher: ['/((?!api/|_next/|internal/).*)'],
};
