import en from './messages/en.json';
import hi from './messages/hi.json';
import { DEFAULT_LOCALE, type Locale } from './config';

export type Messages = typeof en;

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = T extends string ? never : { [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>> }[keyof T & string];
export type MessageKey = Paths<Messages>;

const dictionaries: Record<Locale, Messages> = { en, hi: hi as Messages };

export const getMessages = (locale: Locale): Messages => dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];

export type TFunction = (key: MessageKey, vars?: Record<string, string | number>) => string;

const lookup = (obj: any, path: string): string | undefined =>
  path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);

/** Translator over a dictionary. Missing Hindi keys fall back to English, never to a blank. `{name}` placeholders. */
export function makeT(messages: Messages): TFunction {
  return (key, vars) => {
    const raw = lookup(messages, key) ?? lookup(dictionaries[DEFAULT_LOCALE], key) ?? key;
    return vars ? raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : raw;
  };
}

/** Server components: `const t = getT(locale)`. */
export const getT = (locale: Locale): TFunction => makeT(getMessages(locale));
