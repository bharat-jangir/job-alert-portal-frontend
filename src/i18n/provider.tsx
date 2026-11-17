'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Locale } from './config';
import { makeT, type Messages, type TFunction } from './dictionary';

interface Ctx { locale: Locale; t: TFunction }
const I18nContext = createContext<Ctx | null>(null);

/** Gives client components (header, search box, error page) the language and its messages. */
export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: makeT(messages) }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useCtx(): Ctx {
  const c = useContext(I18nContext);
  if (!c) throw new Error('I18nProvider is missing: wrap the page in app/[locale]/layout.tsx');
  return c;
}

export const useLocale = (): Locale => useCtx().locale;
export const useT = (): TFunction => useCtx().t;
