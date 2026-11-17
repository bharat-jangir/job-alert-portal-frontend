'use client';

import Link from '@/i18n/link';
import { SITE } from '@/lib/site';
import { useT } from '@/i18n/provider';

/** The categories every deployment ships with (see the backend category seed). */
const CATEGORIES = [
  { slug: 'job', key: 'nav.latestJobs' },
  { slug: 'result', key: 'nav.results' },
  { slug: 'admit-card', key: 'nav.admitCards' },
  { slug: 'answer-key', key: 'nav.answerKeys' },
  { slug: 'online-form', key: 'nav.onlineForms' },
  { slug: 'admission', key: 'footer.admissions' },
  { slug: 'syllabus', key: 'footer.syllabus' },
] as const;

const social = [
  { label: 'Telegram', href: SITE.telegram },
  { label: 'WhatsApp', href: SITE.whatsapp },
  { label: 'Facebook', href: SITE.facebook },
  { label: 'Twitter', href: SITE.twitter },
  { label: 'YouTube', href: SITE.youtube },
].filter((s) => s.href);

const link = 'text-gray-400 hover:text-white';

export default function Footer() {
  const t = useT();
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">{SITE.name}</h3>
            <p className="text-gray-400 text-sm">{t('footer.about')}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className={link}>{t('nav.home')}</Link></li>
              <li><Link href="/latest-jobs" className={link}>{t('nav.latestJobs')}</Link></li>
              <li><Link href="/categories" className={link}>{t('footer.allCategories')}</Link></li>
              <li><Link href="/about-us" className={link}>{t('nav.aboutUs')}</Link></li>
              <li><Link href="/faq" className={link}>{t('footer.faq')}</Link></li>
              <li><Link href="/contact" className={link}>{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.categories')}</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}><Link href={`/categories/${c.slug}`} className={link}>{t(c.key)}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className={link}>{t('footer.privacy')}</Link></li>
              <li><Link href="/terms" className={link}>{t('footer.terms')}</Link></li>
              <li><Link href="/disclaimer" className={link}>{t('footer.disclaimer')}</Link></li>
              <li><Link href="/dmca" className={link}>{t('footer.dmca')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.stayUpdated')}</h3>
            <ul className="space-y-2 text-sm">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className={link} target="_blank" rel="noopener noreferrer">{s.label}</a>
                </li>
              ))}
              <li><a href="/feed.xml" className={link}>{t('footer.rss')}</a></li>
              <li><a href="/sitemap.xml" className={link}>{t('footer.sitemap')}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>{t('footer.rights', { year: new Date().getFullYear(), name: SITE.name })}</p>
          <p className="mt-1 text-xs">{t('footer.verify')}</p>
        </div>
      </div>
    </footer>
  );
}
