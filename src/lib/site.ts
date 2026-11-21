/**
 * Public site identity. Pure constants (no server-only values), so client components can import it.
 * One setting, NEXT_PUBLIC_SITE_NAME, controls the brand everywhere: header, footer, page titles,
 * legal pages, RSS feed and structured data.
 */
export const SITE_URL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

/** Public contact / community links, configured per deployment. Empty values hide the matching UI. */
export const SITE = {
  name: process.env.SITE_NAME || process.env.NEXT_PUBLIC_SITE_NAME || 'Sarkari Job Update',
  email: process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  telegram: process.env.TELEGRAM_URL || process.env.NEXT_PUBLIC_TELEGRAM_URL || '',
  whatsapp: process.env.WHATSAPP_URL || process.env.NEXT_PUBLIC_WHATSAPP_URL || '',
  facebook: process.env.FACEBOOK_URL || process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  twitter: process.env.TWITTER_URL || process.env.NEXT_PUBLIC_TWITTER_URL || '',
  youtube: process.env.YOUTUBE_URL || process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
};
