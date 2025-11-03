/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to backend (excluding NextAuth routes)
  async rewrites() {
    return [
      {
        source: '/api/tenders/:path*',
        destination: 'https://api.protenders.co.za/api/tenders/:path*',
      },
      // Note: search and facets are handled by local API routes for SSR stability
      {
        source: '/api/insights/:path*',
        destination: 'https://api.protenders.co.za/api/insights/:path*',
      },
      {
        source: '/api/recommendations/:path*',
        destination: 'https://api.protenders.co.za/api/recommendations/:path*',
      },
      {
        source: '/api/users/:path*',
        destination: 'https://api.protenders.co.za/api/users/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'https://api.protenders.co.za/api/admin/:path*',
      },
      {
        source: '/ai/:path*',
        destination: 'https://api.protenders.co.za/ai/:path*',
      },
    ];
  },
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'protenders.co.za',
      },
    ],
  },
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

module.exports = nextConfig;
