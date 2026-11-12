// Backend the /api/* rewrite forwards to. Set NEXT_PUBLIC_API_URL (e.g. http://localhost:5000)
// for local dev; falls back to the deployed backend when unset.
const API_TARGET = (process.env.NEXT_PUBLIC_API_URL || 'https://job-alert-portal-backend-wwc6.onrender.com').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A stray lockfile in a parent folder confuses workspace-root detection.
  turbopack: { root: __dirname },
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