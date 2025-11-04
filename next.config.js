/** @type {import('next').NextConfig} */
const nextConfig = {
  // All API routes are now handled by local Next.js API routes
  // No need for proxying since migration is complete
  async rewrites() {
    return [];
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
