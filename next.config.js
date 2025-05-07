/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/winston-widget',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors https://williamacampbell.com',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
