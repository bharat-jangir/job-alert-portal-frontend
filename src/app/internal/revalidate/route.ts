import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';

/**
 * On-demand revalidation webhook. The API calls this after a post is published/edited/deleted
 * so pages update immediately instead of waiting for the ISR window.
 * Body: { secret, tags?: string[], paths?: string[] }
 */
export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return NextResponse.json({ error: 'Revalidation not configured' }, { status: 503 });

  let body: { secret?: string; tags?: unknown; paths?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const a = Buffer.from(String(body.secret ?? ''));
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tags = (Array.isArray(body.tags) ? body.tags : []).filter((t): t is string => typeof t === 'string').slice(0, 50);
  const paths = (Array.isArray(body.paths) ? body.paths : []).filter((p): p is string => typeof p === 'string' && p.startsWith('/')).slice(0, 50);

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: true, tags, paths });
}
