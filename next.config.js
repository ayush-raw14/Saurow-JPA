/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force dynamic rendering for specific pages
  experimental: {
    // Only use if you're on Next.js 14+ and want to try this
    // dynamicIO: true,
  },

  // Configure headers for better real-time performance
  async headers() {
    return [
      {
        // API routes - prevent caching
        source: '/api/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, proxy-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store'
          }
        ]
      },
      {
        // Blog page - prevent caching
        source: '/blog',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'X-Robots-Tag',
            value: 'noarchive'
          }
        ]
      }
    ];
  },

  // Remove the empty rewrites function - not needed
  // async rewrites() {
  //   return [];
  // },

  // Optional: Add this if you want to see more build info
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Optional: If you're having issues with static optimization
  trailingSlash: false,
  
  // Optional: Configure output (leave as default 'standalone' for Vercel)
  // output: 'standalone',
}

module.exports = nextConfig