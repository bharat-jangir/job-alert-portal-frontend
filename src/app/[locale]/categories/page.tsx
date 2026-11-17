import type { Metadata } from 'next';
import Link from '@/i18n/link';
import { apiGet, withLang } from '@/lib/api';
import { getT } from '@/i18n/dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { pageAlternates } from '@/i18n/seo';
import Layout from '../latest-jobs/layout';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale);
  return { title: t('meta.categoriesTitle'), description: t('meta.categoriesDescription'), alternates: pageAlternates(locale, '/categories') };
}

interface Category { _id: string; name: string; displayName?: string; slug: string; sequenceNo?: number }

export default async function CategoriesIndex({ params }: Props) {
  const locale = (await params).locale as Locale;
  const t = getT(locale);
  // throws when the API is down (keeps the cached copy / shows the error page) instead of an empty list
  const list = await apiGet<Category[]>(withLang('/api/job-categories/active', locale), { revalidate: 300, tags: ['categories'] });
  const categories = (Array.isArray(list) ? list : []).sort((a, b) => (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0));

  return (
    <Layout>
      <nav className="text-xs text-gray-500 mb-2"><Link href="/" className="hover:underline">{t('common.home')}</Link> › <span>{t('common.categories')}</span></nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('list.categoriesHeading')}</h1>
      <p className="text-gray-500 text-sm mb-6">{t('list.categoriesSub')}</p>
      {categories.length === 0 ? (
        <p className="rounded-lg border bg-white p-8 text-center text-gray-500">{t('list.noCategories')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <Link key={c._id} href={`/categories/${c.slug}`} className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm transition hover:border-blue-400 hover:shadow-md">
              <span className="font-semibold text-blue-700">{c.displayName || c.name}</span>
              <span className="mt-1 block text-xs text-gray-500">{t('list.viewAllLower', { name: (c.displayName || c.name).toLowerCase() })}</span>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
