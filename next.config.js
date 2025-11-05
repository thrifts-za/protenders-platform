/** @type {import('next').NextConfig} */
const nextConfig = {
  // All API routes are now handled by local Next.js API routes
  // No need for proxying since migration is complete
  async rewrites() {
    return [];
  },
  // 301 Redirects for SEO - preserve old URLs and redirect to new structure
  async redirects() {
    return [
      // Old TenderAPI routes to new Next.js routes (if any exist)
      // Add specific redirects as needed based on old URL structure
      // Example:
      // {
      //   source: '/old-tender-path/:id',
      //   destination: '/tender/:id',
      //   permanent: true, // 301 redirect
      // },
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
