/**
 * Server-side API access for the public site.
 *
 * Why this exists: pages used to catch every failure and return an empty list. On a host where the API
 * sleeps or restarts (Render free tier, deploys) one slow request made Next.js cache an EMPTY page for the
 * whole revalidate window. Here failures THROW instead, so:
 *   - during ISR revalidation Next keeps serving the last good copy of the page;
 *   - on a first render the visitor gets the error page, which is not cached.
 * Slow starts are absorbed by a generous timeout plus retries.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
import { SITE, SITE_URL } from './site';
export { SITE, SITE_URL };

const INTERNAL_KEY = process.env.API_INTERNAL_KEY || '';

/** Adds `lang=hi` to an API path for the Hindi site (English is the API default, so nothing is added). */
export function withLang(path: string, locale: string): string {
  if (locale === 'en') return path;
  return `${path}${path.includes('?') ? '&' : '?'}lang=${locale}`;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

interface GetOptions {
  revalidate?: number; // seconds (default 60); 0 = no cache
  tags?: string[];
  timeoutMs?: number; // per attempt (default 15s: covers a cold start)
  retries?: number; // extra attempts after the first (default 2)
}

/** 4xx answers that are NOT a verdict on the request: the server was busy, so try again and never read it as "empty". */
const isTransient = (status: number) => status === 429 || status === 408;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const unwrap = (j: any) => (j && typeof j === 'object' && 'data' in j && 'meta' in j ? j.data : j?.data ?? j);

/** GET a JSON endpoint of the backend. Throws ApiError on any failure (never returns "empty" for an error). */
export async function apiGet<T = any>(path: string, opts: GetOptions = {}): Promise<T> {
  const { revalidate = 60, tags, timeoutMs = 15_000, retries = 2 } = opts;
  let last: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        // revalidate: 0 means "never cache" (search results)
        ...(revalidate === 0 ? { cache: 'no-store' as const } : { next: { revalidate, ...(tags ? { tags } : {}) } }),
        // server-side only (never NEXT_PUBLIC): lets the API skip its per-IP rate limit for this web server,
        // whose single IP carries every visitor's page view
        headers: INTERNAL_KEY ? { 'x-internal-key': INTERNAL_KEY } : undefined,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) return unwrap(await res.json()) as T;
      // 4xx is a definite answer (e.g. 404): retrying will not change it. 429/408 are not: retry them.
      if (res.status < 500 && !isTransient(res.status)) throw new ApiError(res.status, `${path} -> ${res.status}`);
      last = new ApiError(res.status, `${path} -> ${res.status}`);
    } catch (e) {
      if (e instanceof ApiError && e.status < 500 && !isTransient(e.status)) throw e;
      last = e;
    }
    if (attempt < retries) await wait(700 * (attempt + 1));
  }
  throw last instanceof Error ? last : new Error(`Could not reach the API (${path})`);
}

/**
 * For minor widgets (organisations, FAQs, ad-hoc side lists) where showing the page without them is
 * better than failing it. Do NOT use for the main content of a page.
 */
export async function apiGetOptional<T>(path: string, fallback: T, opts: GetOptions = {}): Promise<T> {
  try {
    return await apiGet<T>(path, { retries: 1, timeoutMs: 8000, ...opts });
  } catch (e) {
    console.warn(`[api] optional ${path} unavailable:`, (e as Error).message);
    return fallback;
  }
}

/**
 * For paginated list endpoints: a 4xx answer (for example a page number beyond the API's cap) means
 * "no results here" and returns `empty`; server errors and outages still throw (never cached as empty).
 */
export async function apiGetList<T>(path: string, empty: T, opts: GetOptions = {}): Promise<T> {
  try {
    return await apiGet<T>(path, opts);
  } catch (e) {
    // a rate limit (429) is not "no results": let it fail so the visitor gets the error page, not a fake 404
    if (e instanceof ApiError && e.status < 500 && !isTransient(e.status)) return empty;
    throw e;
  }
}
