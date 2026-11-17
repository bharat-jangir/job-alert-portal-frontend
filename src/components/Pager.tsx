import Link from '@/i18n/link';
import type { TFunction } from '@/i18n/dictionary';

/** Previous / "Page 2 of 5" / Next. `base` is the page path, with or without a query string. */
export default function Pager({ base, page, totalPages, t }: { base: string; page: number; totalPages: number; t: TFunction }) {
  if (totalPages <= 1) return null;
  const href = (p: number) => `${base}${base.includes('?') ? '&' : '?'}page=${p}`;
  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm">
      {page > 1 && <Link href={href(page - 1)} rel="prev" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">{t('common.previous')}</Link>}
      <span className="text-gray-500">{t('common.pageOf', { page, total: totalPages })}</span>
      {page < totalPages && <Link href={href(page + 1)} rel="next" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">{t('common.next')}</Link>}
    </div>
  );
}
