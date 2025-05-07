/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/winston-widget.html',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM *'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *"
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;