import { apiGet } from '@/lib/api';
import { SITE, SITE_URL } from '@/lib/site';

export const revalidate = 600;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** RSS 2.0 feed of the 50 newest published posts (aggregators, Google News/Discover, readers). */
export async function GET() {
  // throws if the API is down: a 5xx is retried by readers, whereas an empty feed would look like "no posts"
  const d = await apiGet<any>('/api/jobs/latest?limit=50', { revalidate: 600, tags: ['posts'] });
  const posts: any[] = Array.isArray(d) ? d : d?.jobs ?? [];

  const items = posts.map((p) => {
    const url = `${SITE_URL}/jobs/${p.slug}`;
    const date = new Date(p.publishedAt || p.updatedAt || Date.now()).toUTCString();
    return `<item><title>${esc(p.title)}</title><link>${esc(url)}</link><guid isPermaLink="true">${esc(url)}</guid><pubDate>${date}</pubDate>${
      p.type ? `<category>${esc(p.type)}</category>` : ''}${p.description ? `<description>${esc(p.description)}</description>` : ''}</item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${esc(SITE.name)} – Latest Sarkari Naukri, Results &amp; Admit Cards</title>
<link>${SITE_URL}</link>
<description>Latest government jobs, results, admit cards and answer keys.</description>
<language>en-IN</language>
<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join('\n')}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } });
}
