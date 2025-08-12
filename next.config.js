/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      },
      {
        // Specific configuration for the widget - allows embedding from portfolio and WeRule/Squarespace
        source: '/winston-widget',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors https://williamacampbell.com https://we-rule.com https://*.squarespace.com'
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;
