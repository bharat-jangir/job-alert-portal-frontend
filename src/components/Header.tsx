'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from '@/i18n/link';
import { SITE } from '@/lib/site';
import { basePath, formatDate, localePath } from '@/i18n/config';
import { useLocale, useT } from '@/i18n/provider';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useT();
  const locale = useLocale();
  // the visitor's path without the language prefix, so "active" matching works in every language
  const pathname = basePath(usePathname() || '/');

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/latest-jobs', label: t('nav.latestJobs') },
    { href: '/categories/online-form', label: t('nav.onlineForms') },
    { href: '/categories/admit-card', label: t('nav.admitCards') },
    { href: '/categories/result', label: t('nav.results') },
    { href: '/categories/answer-key', label: t('nav.answerKeys') },
    { href: '/about-us', label: t('nav.aboutUs') },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span>{t('header.lastUpdated', { date: formatDate(new Date(), locale, { day: 'numeric', month: 'long', year: 'numeric' }) })}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="hidden md:flex space-x-4">
                <a href="/sitemap.xml" className="hover:text-blue-200">{t('nav.sitemap')}</a>
                <Link href="/contact" className="hover:text-blue-200">{t('nav.contact')}</Link>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center py-4">
            <div className="flex items-center justify-between w-full md:w-auto mb-4 md:mb-0">
              <Link href="/" className="text-2xl font-bold text-blue-600 px-4">{SITE.name}</Link>
              {/* Mobile Menu Button */}
              <button
                aria-label={t('nav.menu')}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <form action={localePath(locale, '/search')} method="GET" className="flex">
                <input
                  type="text"
                  name="q"
                  placeholder={t('header.searchPlaceholder')}
                  className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  {t('header.searchButton')}
                </button>
              </form>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 bg-white px-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${(item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/'))
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden pb-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${(item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/'))
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              <a href="/sitemap.xml" className="text-gray-600 hover:text-blue-600 py-2">{t('nav.sitemap')}</a>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 py-2">{t('nav.contact')}</Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
} 