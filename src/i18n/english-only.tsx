'use client';

import { useLocale, useT } from './provider';

/** Banner shown on the Hindi site above pages that exist in English only (legal, about, contact, FAQ). */
export default function EnglishOnlyNotice() {
  const locale = useLocale();
  const t = useT();
  if (locale === 'en') return null;
  return (
    <p className="mx-auto mb-4 max-w-3xl rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-900">
      {t('notice.englishOnly')}
    </p>
  );
}
