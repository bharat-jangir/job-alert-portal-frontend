import type { ReactNode } from 'react';
import JobContent from '@/app/jobs/[slug]/JobContent';
import { Inline, inlineToPlain } from '@/lib/inline';

/**
 * Typed content blocks from the CMS (mirror of the backend zod schema post-sections.schema.ts).
 * Server component: renders to plain HTML, no client JS. Text fields accept safe inline
 * formatting (**bold**, *italic*, [link](url), `code`, ~~strike~~) via <Inline>.
 */
type Align = 'left' | 'center' | 'right';
export type Leaf =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'list'; title?: string; ordered?: boolean; items: string[] }
  | { type: 'steps'; title?: string; items: string[] }
  | { type: 'image'; src: string; alt?: string; caption?: string; width?: number; height?: number; link?: string }
  | { type: 'button'; label: string; url: string; style?: 'primary' | 'secondary' | 'outline'; align?: Align }
  | { type: 'keyvalue'; title?: string; items: { label: string; value: string }[] }
  | { type: 'callout'; tone?: 'info' | 'warning' | 'success'; text: string }
  | { type: 'quote'; text: string; cite?: string; style?: 'quote' | 'pull' }
  | { type: 'links'; title?: string; items: { label: string; url: string }[] }
  | { type: 'download'; label: string; url: string; fileType?: string; size?: string }
  | { type: 'separator'; style?: 'line' | 'dots' | 'space' };

export type Section =
  | Leaf
  | { type: 'table'; title?: string; headers: string[]; rows: string[][]; align?: Align[] }
  | { type: 'faq'; title?: string; items: { question: string; answer: string }[] }
  | { type: 'accordion'; title?: string; items: { title: string; content: string }[] }
  | { type: 'timeline'; title?: string; items: { date: string; title: string; text?: string }[] }
  | { type: 'gallery'; title?: string; images: { src: string; alt?: string; caption?: string }[] }
  | { type: 'video'; url: string; title: string; caption?: string }
  | { type: 'audio'; src: string; title?: string }
  | { type: 'embed'; url: string; title: string; caption?: string; height?: number }
  | { type: 'code'; code: string; language?: string }
  | { type: 'toc'; title?: string }
  | { type: 'ad'; slot: string }
  | { type: 'columns'; columns: { blocks: Leaf[] }[] }
  | { type: 'html'; html: string };

const tones = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  success: 'bg-green-50 border-green-200 text-green-900',
};
const alignCls: Record<Align, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };
const justifyCls: Record<Align, string> = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };
const colsCls: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };
const btnCls = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-800 text-white hover:bg-gray-900',
  outline: 'border-2 border-blue-600 text-blue-700 hover:bg-blue-50',
};

const slug = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/** Stable, unique anchor ids for heading blocks (also used by the table of contents). */
export function headingIds(sections: Section[]): Map<number, string> {
  const used = new Set<string>();
  const ids = new Map<number, string>();
  sections.forEach((s, i) => {
    if (s.type !== 'heading') return;
    let id = slug(inlineToPlain(s.text)) || `section-${i + 1}`;
    for (let n = 2; used.has(id); n++) id = `${id.replace(/-\d+$/, '')}-${n}`;
    used.add(id);
    ids.set(i, id);
  });
  return ids;
}

/** YouTube / Vimeo page URL -> privacy-friendly embed URL (null if not recognised). */
export function toVideoEmbed(raw: string): string | null {
  try {
    const u = new URL(raw);
    const h = u.hostname.replace(/^www\.|^m\./, '');
    if (h === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (h === 'youtube.com' || h === 'youtube-nocookie.com') {
      if (u.pathname.startsWith('/embed/')) return `https://www.youtube-nocookie.com${u.pathname}`;
      const v = u.searchParams.get('v');
      return v ? `https://www.youtube-nocookie.com/embed/${v}` : null;
    }
    if (h === 'vimeo.com' || h === 'player.vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {}
  return null;
}

function Block({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      {title && <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>}
      {children}
    </section>
  );
}

function Caption({ text }: { text?: string }) {
  return text ? <figcaption className="mt-2 text-sm text-gray-500 text-center"><Inline text={text} /></figcaption> : null;
}

function Frame({ src, title, ratio, height }: { src: string; title: string; ratio?: boolean; height?: number }) {
  return (
    <iframe
      src={src} title={title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
      sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
      className={`w-full rounded-lg border-0 ${ratio ? 'aspect-video' : ''}`}
      style={ratio ? undefined : { height: height ?? 500 }}
    />
  );
}

function renderBlock(s: Section | Leaf, key: string | number, ctx: { sections: Section[]; ids: Map<number, string>; index: number }): ReactNode {
  switch (s.type) {
    case 'paragraph':
      return <p key={key} className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line"><Inline text={s.text} /></p>;
    case 'heading': {
      const H = (`h${s.level}`) as 'h2' | 'h3' | 'h4';
      const size = s.level === 2 ? 'text-2xl' : s.level === 3 ? 'text-xl' : 'text-lg';
      return <H key={key} id={ctx.ids.get(ctx.index)} className={`font-bold text-gray-900 mt-6 mb-3 scroll-mt-24 ${size}`}><Inline text={s.text} /></H>;
    }
    case 'callout':
      return <div key={key} role="note" className={`border rounded-lg p-4 mb-4 text-sm ${tones[s.tone ?? 'info']}`}><Inline text={s.text} /></div>;
    case 'quote':
      return s.style === 'pull' ? (
        <figure key={key} className="my-8 text-center border-y-4 border-blue-600 py-6">
          <blockquote className="text-2xl font-semibold text-gray-900 leading-snug"><Inline text={s.text} /></blockquote>
          {s.cite && <figcaption className="mt-3 text-sm text-gray-500">— {s.cite}</figcaption>}
        </figure>
      ) : (
        <figure key={key} className="my-6 border-l-4 border-blue-500 pl-4 italic text-gray-700">
          <blockquote><Inline text={s.text} /></blockquote>
          {s.cite && <figcaption className="mt-2 text-sm not-italic text-gray-500">— {s.cite}</figcaption>}
        </figure>
      );
    case 'list': {
      const L = s.ordered ? 'ol' : 'ul';
      return (
        <Block key={key} title={s.title}>
          <L className={`pl-6 space-y-1 text-gray-700 ${s.ordered ? 'list-decimal' : 'list-disc'}`}>
            {s.items.map((it, k) => <li key={k}><Inline text={it} /></li>)}
          </L>
        </Block>
      );
    }
    case 'steps':
      return (
        <Block key={key} title={s.title}>
          <ol className="space-y-2">
            {s.items.map((it, k) => (
              <li key={k} className="flex gap-3 text-gray-700">
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mt-0.5">{k + 1}</span>
                <span><Inline text={it} /></span>
              </li>
            ))}
          </ol>
        </Block>
      );
    case 'table':
      return (
        <Block key={key} title={s.title}>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{s.headers.map((h, c) => <th key={c} scope="col" className={`p-3 font-semibold text-gray-900 border-b ${alignCls[s.align?.[c] ?? 'left']}`}><Inline text={h} /></th>)}</tr>
              </thead>
              <tbody>
                {s.rows.map((row, r) => (
                  <tr key={r} className="border-b last:border-0">
                    {s.headers.map((_, c) => <td key={c} className={`p-3 text-gray-700 align-top ${alignCls[s.align?.[c] ?? 'left']}`}><Inline text={row[c] ?? ''} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      );
    case 'keyvalue':
      return (
        <Block key={key} title={s.title}>
          <dl className="rounded-lg border border-gray-200 divide-y text-sm">
            {s.items.map((it, k) => (
              <div key={k} className="grid grid-cols-3 gap-3 p-3">
                <dt className="font-semibold text-gray-900">{it.label}</dt>
                <dd className="col-span-2 text-gray-700"><Inline text={it.value} /></dd>
              </div>
            ))}
          </dl>
        </Block>
      );
    case 'timeline':
      return (
        <Block key={key} title={s.title}>
          <ol className="relative border-l-2 border-blue-200 ml-2 space-y-5">
            {s.items.map((it, k) => (
              <li key={k} className="pl-5 relative">
                <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-blue-600" aria-hidden />
                <time className="text-xs font-semibold uppercase tracking-wide text-blue-700">{it.date}</time>
                <p className="font-semibold text-gray-900"><Inline text={it.title} /></p>
                {it.text && <p className="text-gray-700 text-sm"><Inline text={it.text} /></p>}
              </li>
            ))}
          </ol>
        </Block>
      );
    case 'links':
      return (
        <Block key={key} title={s.title}>
          <ul className="space-y-2">
            {s.items.map((l, k) => (
              <li key={k}>
                <a href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline">
                  {l.label} <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </Block>
      );
    case 'download':
      return (
        <a key={key} href={s.url} target="_blank" rel="noopener noreferrer nofollow"
          className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
          <span className="shrink-0 rounded bg-red-50 text-red-700 text-xs font-bold px-2 py-1 uppercase">{s.fileType || 'file'}</span>
          <span className="flex-1 font-medium text-gray-900">{s.label}</span>
          {s.size && <span className="text-xs text-gray-500">{s.size}</span>}
          <span aria-hidden className="text-blue-700">⬇</span>
        </a>
      );
    case 'button':
      return (
        <div key={key} className={`mb-4 flex ${justifyCls[s.align ?? 'left']}`}>
          <a href={s.url} target="_blank" rel="noopener noreferrer nofollow"
            className={`inline-block rounded-lg px-6 py-3 font-semibold transition ${btnCls[s.style ?? 'primary']}`}>
            {s.label}
          </a>
        </div>
      );
    case 'image': {
      const img = (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.src} alt={s.alt ?? ''} width={s.width} height={s.height} loading="lazy" decoding="async"
          className="mx-auto h-auto max-w-full rounded-lg" />
      );
      return (
        <figure key={key} className="my-6">
          {s.link ? <a href={s.link} target="_blank" rel="noopener noreferrer nofollow">{img}</a> : img}
          <Caption text={s.caption} />
        </figure>
      );
    }
    case 'gallery':
      return (
        <Block key={key} title={s.title}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {s.images.map((im, k) => (
              <figure key={k}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt={im.alt ?? ''} loading="lazy" decoding="async" className="w-full aspect-square object-cover rounded-lg" />
                <Caption text={im.caption} />
              </figure>
            ))}
          </div>
        </Block>
      );
    case 'video': {
      const src = toVideoEmbed(s.url);
      if (!src) return null;
      return (
        <figure key={key} className="my-6">
          <Frame src={src} title={s.title} ratio />
          <Caption text={s.caption} />
        </figure>
      );
    }
    case 'audio':
      return (
        <figure key={key} className="my-4">
          {s.title && <figcaption className="mb-1 text-sm font-medium text-gray-800">{s.title}</figcaption>}
          <audio controls preload="none" src={s.src} className="w-full" />
        </figure>
      );
    case 'embed':
      return (
        <figure key={key} className="my-6">
          <Frame src={s.url} title={s.title} height={s.height} />
          <Caption text={s.caption} />
        </figure>
      );
    case 'code':
      return (
        <pre key={key} className="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          <code className={s.language ? `language-${s.language}` : undefined}>{s.code}</code>
        </pre>
      );
    case 'separator':
      return s.style === 'space' ? <div key={key} className="h-8" aria-hidden />
        : s.style === 'dots' ? <p key={key} className="my-6 text-center tracking-[0.5em] text-gray-400" aria-hidden>•••</p>
        : <hr key={key} className="my-6 border-gray-200" />;
    case 'accordion':
      return (
        <Block key={key} title={s.title}>
          <div className="divide-y border rounded-lg">
            {s.items.map((it, k) => (
              <details key={k} className="p-4">
                <summary className="cursor-pointer font-medium text-gray-900">{it.title}</summary>
                <p className="mt-2 text-gray-700 whitespace-pre-line"><Inline text={it.content} /></p>
              </details>
            ))}
          </div>
        </Block>
      );
    case 'faq':
      return (
        <Block key={key} title={s.title || 'Frequently asked questions'}>
          <div className="divide-y border rounded-lg">
            {s.items.map((f, k) => (
              <details key={k} className="p-4 group">
                <summary className="cursor-pointer font-medium text-gray-900">{f.question}</summary>
                <p className="mt-2 text-gray-700 whitespace-pre-line"><Inline text={f.answer} /></p>
              </details>
            ))}
          </div>
        </Block>
      );
    case 'toc': {
      const items = ctx.sections
        .map((sec, i) => (sec.type === 'heading' && sec.level <= 3 ? { id: ctx.ids.get(i)!, text: inlineToPlain(sec.text), level: sec.level } : null))
        .filter((x): x is { id: string; text: string; level: 2 | 3 | 4 } => !!x);
      if (items.length < 2) return null;
      return (
        <nav key={key} aria-label="Table of contents" className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 font-bold text-gray-900">{s.title || 'Table of contents'}</p>
          <ol className="space-y-1 text-sm">
            {items.map((it) => (
              <li key={it.id} className={it.level === 3 ? 'ml-4' : ''}>
                <a href={`#${it.id}`} className="text-blue-700 hover:underline">{it.text}</a>
              </li>
            ))}
          </ol>
        </nav>
      );
    }
    case 'ad':
      // Reserved box (prevents layout shift). Plug your ad network script into [data-ad-slot].
      return (
        <aside key={key} data-ad-slot={s.slot} aria-label="Advertisement"
          className="my-6 flex min-h-[250px] items-center justify-center text-xs text-gray-400">
          {process.env.NODE_ENV !== 'production' ? `Ad slot: ${s.slot}` : null}
        </aside>
      );
    case 'columns':
      return (
        <div key={key} className={`my-6 grid grid-cols-1 gap-6 ${colsCls[s.columns.length] ?? 'md:grid-cols-2'}`}>
          {s.columns.map((col, c) => (
            <div key={c}>{col.blocks.map((b, k) => renderBlock(b, `${c}-${k}`, { ...ctx, index: -1 }))}</div>
          ))}
        </div>
      );
    case 'html':
      return <JobContent key={key} htmlContent={s.html} />;
    default:
      return null; // unknown block type from a newer CMS version: skip instead of crashing the page
  }
}

export default function PostSections({ sections }: { sections: Section[] }) {
  const ids = headingIds(sections);
  return (
    <div className="space-y-2">
      {sections.map((s, i) => renderBlock(s, i, { sections, ids, index: i }))}
    </div>
  );
}
