/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add Permissions-Policy for microphone access
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: `microphone=(self "https://chat.winstonai.io" "https://we-rule.com" "https://www.we-rule.com" "https://${process.env.NEXT_PUBLIC_PORTFOLIO_HOST || 'example.com'}")`
          },
          // Optional: if you need to restrict embedding, prefer CSP frame-ancestors (example):
          // { key: 'Content-Security-Policy',
          //   value: 'frame-ancestors https://chat.winstonai.io https://we-rule.com https://www.we-rule.com https://YOUR-PORTFOLIO-HOST' }
        ]
      },
      {
        // Specific configuration for the widget - allows embedding from portfolio and WeRule/Squarespace
        source: '/winston-widget',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors https://williamacampbell.com https://we-rule.com https://*.squarespace.com'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://williamacampbell.com'
          }
        ]
      },
      {
        // Configuration for werule-widget - allows embedding from Squarespace
        source: '/werule-widget',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors https://williamacampbell.com https://we-rule.com https://*.squarespace.com https://squarespace.com'
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;