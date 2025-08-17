/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the experimental dynamicIO as it's canary-only
  
  // Configure headers for better real-time performance
  async headers() {
    return [
      {
        source: '/api/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      },
      {
        source: '/blog',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
    ];
  },

  // Configure ISR if you want some caching but with revalidation
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig