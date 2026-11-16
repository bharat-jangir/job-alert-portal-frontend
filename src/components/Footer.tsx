import Link from 'next/link';
import { SITE } from '@/lib/api';

/** The categories every deployment ships with (see the backend category seed). */
const CATEGORIES = [
  { slug: 'job', label: 'Latest Jobs' },
  { slug: 'result', label: 'Results' },
  { slug: 'admit-card', label: 'Admit Cards' },
  { slug: 'answer-key', label: 'Answer Keys' },
  { slug: 'online-form', label: 'Online Forms' },
  { slug: 'admission', label: 'Admissions' },
  { slug: 'syllabus', label: 'Syllabus' },
];

const social = [
  { label: 'Telegram', href: SITE.telegram },
  { label: 'WhatsApp', href: SITE.whatsapp },
  { label: 'Facebook', href: SITE.facebook },
  { label: 'Twitter', href: SITE.twitter },
  { label: 'YouTube', href: SITE.youtube },
].filter((s) => s.href);

const link = 'text-gray-400 hover:text-white';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">{SITE.name}</h3>
            <p className="text-gray-400 text-sm">
              Government job notifications, results, admit cards and answer keys in one place.
              We are an independent information site and are not affiliated with any government body.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className={link}>Home</Link></li>
              <li><Link href="/latest-jobs" className={link}>Latest Jobs</Link></li>
              <li><Link href="/categories" className={link}>All Categories</Link></li>
              <li><Link href="/about-us" className={link}>About Us</Link></li>
              <li><Link href="/faq" className={link}>FAQ</Link></li>
              <li><Link href="/contact" className={link}>Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}><Link href={`/categories/${c.slug}`} className={link}>{c.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className={link}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={link}>Terms &amp; Conditions</Link></li>
              <li><Link href="/disclaimer" className={link}>Disclaimer</Link></li>
              <li><Link href="/dmca" className={link}>DMCA / Content Removal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Stay Updated</h3>
            <ul className="space-y-2 text-sm">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className={link} target="_blank" rel="noopener noreferrer">{s.label}</a>
                </li>
              ))}
              <li><a href="/feed.xml" className={link}>RSS Feed</a></li>
              <li><a href="/sitemap.xml" className={link}>Sitemap</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="mt-1 text-xs">Always confirm dates and details on the official website before applying.</p>
        </div>
      </div>
    </footer>
  );
}
