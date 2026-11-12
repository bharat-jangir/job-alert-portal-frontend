const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const revalidate = 600;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** RSS 2.0 feed of the 50 newest published posts (aggregators, Google News/Discover, readers). */
export async function GET() {
  let posts: any[] = [];
  try {
    const res = await fetch(`${API}/api/jobs/latest?limit=50`, { next: { revalidate: 600, tags: ['posts'] } });
    if (res.ok) {
      const j = await res.json();
      const d = j.data ?? j;
      posts = Array.isArray(d) ? d : d.jobs ?? [];
    }
  } catch {}

  const items = posts.map((p) => {
    const url = `${SITE}/jobs/${p.slug}`;
    const date = new Date(p.publishedAt || p.updatedAt || Date.now()).toUTCString();
    return `<item><title>${esc(p.title)}</title><link>${esc(url)}</link><guid isPermaLink="true">${esc(url)}</guid><pubDate>${date}</pubDate>${
      p.type ? `<category>${esc(p.type)}</category>` : ''}${p.description ? `<description>${esc(p.description)}</description>` : ''}</item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>Job Alert – Latest Sarkari Naukri, Results &amp; Admit Cards</title>
<link>${SITE}</link>
<description>Latest government jobs, results, admit cards and answer keys.</description>
<language>en-IN</language>
<atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join('\n')}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } });
}
