// Backend the /api/* rewrite forwards to. Set NEXT_PUBLIC_API_URL (e.g. http://localhost:5000)
// for local dev; falls back to the deployed backend when unset.
const API_TARGET = (process.env.NEXT_PUBLIC_API_URL || 'https://job-alert-portal-backend-wwc6.onrender.com').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig; 