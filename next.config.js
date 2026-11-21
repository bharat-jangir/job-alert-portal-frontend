// Backend the /api/* rewrite forwards to. Set BACKEND_API_BASE_URL (e.g. http://localhost:5000)
// for local dev; falls back to the deployed backend when unset.
const API_TARGET = (
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://job-alert-portal-backend-wwc6.onrender.com'
).replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SITE_NAME: process.env.SITE_NAME || process.env.NEXT_PUBLIC_SITE_NAME || 'Sarkari Job Update',
    SITE_URL: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    BACKEND_API_BASE_URL: process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    TELEGRAM_URL: process.env.TELEGRAM_URL || process.env.NEXT_PUBLIC_TELEGRAM_URL || '',
    WHATSAPP_URL: process.env.WHATSAPP_URL || process.env.NEXT_PUBLIC_WHATSAPP_URL || '',
    FACEBOOK_URL: process.env.FACEBOOK_URL || process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    TWITTER_URL: process.env.TWITTER_URL || process.env.NEXT_PUBLIC_TWITTER_URL || '',
    YOUTUBE_URL: process.env.YOUTUBE_URL || process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
    CONTACT_EMAIL: process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  // A stray lockfile in a parent folder confuses workspace-root detection.
  turbopack: { root: __dirname },
  // One canonical page per post type: /categories/<slug>. Old and duplicate URLs keep working (308).
  async redirects() {
    const to = (source, destination) => ({ source, destination, permanent: true });
    return [
      to('/results', '/categories/result'),
      to('/jobs/results', '/categories/result'),
      to('/admit-cards', '/categories/admit-card'),
      to('/jobs/admit-cards', '/categories/admit-card'),
      to('/jobs/answer-keys', '/categories/answer-key'),
      to('/latest-forms', '/categories/online-form'),
      to('/admissions', '/categories/admission'),
      to('/category/:slug', '/categories/:slug'),
      to('/about', '/about-us'),
      to('/privacy', '/privacy-policy'),
      to('/terms-and-conditions', '/terms'),
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_TARGET}/api/:path*`,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig; 