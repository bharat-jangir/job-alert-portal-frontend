#!/usr/bin/env node
/**
 * Crawls the running site and fails on broken internal links.
 *   SITE_URL=http://localhost:3000 npm run check:links
 * Starts from "/" and every <loc> in /sitemap.xml, follows same-site links, and reports:
 *   - BROKEN : 404 / 5xx (including pages reached through a redirect)
 *   - BAD TEXT: leftovers that mean something is wrong ("undefined", "[object Object]", "yourdomain.com", "NaN")
 *   - EMPTY  : pages that show an "nothing here" message (informational; exit code unaffected)
 * Exit code 1 if anything is BROKEN or has BAD TEXT.
 */
const BASE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const MAX = Number(process.env.MAX_PAGES || 500);
const SKIP = /^\/(_next|api|admin)\b|\.(png|jpe?g|gif|svg|webp|ico|css|js|map|woff2?|pdf)(\?|$)/i;
const EMPTY = /(No [\w\s-]{2,40}(found|yet|available)|nothing here|coming soon|Fresh updates are on the way)/i;
const BAD = /(\bundefined\b|\[object Object\]|yourdomain\.com|\bNaN\b)/;

const seen = new Map(); // path -> { status, via }
const queue = ['/'];
const broken = [], badText = [], empties = [], redirects = [];

async function addSitemap() {
  try {
    const res = await fetch(`${BASE}/sitemap.xml`);
    if (!res.ok) { broken.push(['/sitemap.xml', res.status, 'sitemap']); return; }
    for (const m of (await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const u = new URL(m[1].replace(/&amp;/g, '&'));
      queue.push(u.pathname + u.search);
    }
  } catch (e) { broken.push(['/sitemap.xml', 'ERR', e.message]); }
}

async function visit(path, via) {
  if (seen.has(path) || seen.size >= MAX) return;
  seen.set(path, null);
  let res;
  try { res = await fetch(BASE + path, { redirect: 'manual', headers: { 'user-agent': 'link-checker' } }); }
  catch (e) { broken.push([path, 'ERR', via]); return; }
  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get('location') || '';
    redirects.push([path, res.status, loc]);
    const t = new URL(loc, BASE);
    if (t.origin === new URL(BASE).origin) await visit(t.pathname + t.search, `redirect from ${path}`);
    return;
  }
  seen.set(path, res.status);
  if (res.status >= 400) { broken.push([path, res.status, via]); return; }
  const type = res.headers.get('content-type') || '';
  if (!type.includes('text/html')) return;
  const html = await res.text();
  // visible text only: drop scripts/styles (JSON-LD and RSC payloads legitimately contain odd strings)
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  const bad = text.match(BAD);
  if (bad) badText.push([path, bad[0]]);
  if (EMPTY.test(text)) empties.push([path, (text.match(EMPTY) || [''])[0]]);
  for (const m of html.matchAll(/<a\s[^>]*?href="([^"#]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (!href.startsWith('/') || href.startsWith('//') || SKIP.test(href)) continue;
    queue.push(href);
  }
}

await addSitemap();
while (queue.length && seen.size < MAX) {
  const batch = queue.splice(0, 6);
  await Promise.all(batch.map((p) => visit(p, 'link')));
}

console.log(`Checked ${seen.size} pages on ${BASE}  (${redirects.length} redirects followed)`);
for (const [p, s, v] of broken) console.log(`BROKEN   ${s}  ${p}   <- ${v}`);
for (const [p, w] of badText) console.log(`BAD TEXT "${w}"  ${p}`);
for (const [p, w] of empties) console.log(`EMPTY    ${p}   ("${w.trim()}")`);
if (!broken.length && !badText.length) console.log('OK: no broken links, no leftover placeholder text.');
process.exit(broken.length || badText.length ? 1 : 0);
