'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { localePath } from './config';
import { useLocale } from './provider';

/**
 * next/link that keeps the visitor in their language: an internal "/jobs/x" becomes "/hi/jobs/x" on the
 * Hindi site. External URLs, hashes and mailto: pass through. Use this instead of next/link everywhere.
 */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const to = typeof href === 'string' ? localePath(locale, href) : href;
  return <NextLink href={to} {...rest} />;
}
