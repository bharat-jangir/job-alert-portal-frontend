import type { ReactNode } from 'react';

/**
 * Safe inline formatting for CMS text fields (paragraphs, list items, table cells…).
 * Supported: **bold**, *italic* / _italic_, ~~strike~~, `code`, [label](https://url).
 * Output is React nodes (never raw HTML), and links are limited to http(s)/mailto/tel or
 * site-relative paths, so editor text can't inject markup or javascript: URLs.
 */
type Node =
  | { t: 'text'; v: string }
  | { t: 'b' | 'i' | 's'; c: Node[] }
  | { t: 'code'; v: string }
  | { t: 'a'; href: string; c: Node[] };

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

function parse(src: string): Node[] {
  const out: Node[] = [];
  let buf = '';
  const flush = () => { if (buf) { out.push({ t: 'text', v: buf }); buf = ''; } };
  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i);
    let m: RegExpMatchArray | null;
    if (rest.startsWith('\\') && /[*_~`\[\]\\]/.test(rest[1] ?? '')) { buf += rest[1]; i += 2; continue; }
    if ((m = rest.match(/^`([^`]+)`/))) { flush(); out.push({ t: 'code', v: m[1] }); i += m[0].length; continue; }
    if ((m = rest.match(/^\*\*([^*]+?)\*\*/))) { flush(); out.push({ t: 'b', c: parse(m[1]) }); i += m[0].length; continue; }
    if ((m = rest.match(/^~~([^~]+?)~~/))) { flush(); out.push({ t: 's', c: parse(m[1]) }); i += m[0].length; continue; }
    if ((m = rest.match(/^\*([^*\s][^*]*?)\*/)) || (m = rest.match(/^_([^_\s][^_]*?)_(?![A-Za-z0-9])/))) { flush(); out.push({ t: 'i', c: parse(m[1]) }); i += m[0].length; continue; }
    if ((m = rest.match(/^\[([^\]]+)\]\(([^)\s]+)\)/))) {
      flush();
      out.push(SAFE_HREF.test(m[2]) ? { t: 'a', href: m[2], c: parse(m[1]) } : { t: 'text', v: m[1] });
      i += m[0].length; continue;
    }
    buf += src[i]; i++;
  }
  flush();
  return out;
}

function render(nodes: Node[], key = ''): ReactNode[] {
  return nodes.map((n, k) => {
    const id = `${key}${k}`;
    switch (n.t) {
      case 'text': return n.v;
      case 'b': return <strong key={id}>{render(n.c, id)}</strong>;
      case 'i': return <em key={id}>{render(n.c, id)}</em>;
      case 's': return <s key={id}>{render(n.c, id)}</s>;
      case 'code': return <code key={id} className="px-1 py-0.5 rounded bg-gray-100 text-[0.9em] font-mono">{n.v}</code>;
      case 'a': {
        const external = /^https?:\/\//i.test(n.href);
        return (
          <a key={id} href={n.href} className="text-blue-700 underline hover:text-blue-900"
            {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>
            {render(n.c, id)}
          </a>
        );
      }
    }
  });
}

export function Inline({ text }: { text: string }) {
  return <>{render(parse(text ?? ''))}</>;
}

/** Same text without the markup, for JSON-LD, meta descriptions and the table of contents. */
export function inlineToPlain(text: string): string {
  const walk = (nodes: Node[]): string =>
    nodes.map((n) => (n.t === 'text' ? n.v : n.t === 'code' ? n.v : walk(n.c))).join('');
  return walk(parse(text ?? ''));
}
