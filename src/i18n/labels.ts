import type { MessageKey, TFunction } from './dictionary';

/** Translated label for a backend enum value (qualification, experience, post type). Unknown values show as-is. */
export function enumLabel(t: TFunction, group: 'qualification' | 'experience' | 'types', value?: string): string {
  if (!value) return '';
  const key = `${group}.${value}` as MessageKey;
  const label = t(key);
  return label === key ? value : label;
}
