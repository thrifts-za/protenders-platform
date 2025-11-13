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
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://cdn.clarity.ms https://www.clarity.ms https://scripts.clarity.ms https://cdn.mixpanel.com https://cdn.mxpnl.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://vercel.live https://ocds-api.etenders.gov.za https://www.etenders.gov.za https://api.mixpanel.com https://api-js.mixpanel.com https://www.clarity.ms https://cdn.jsdelivr.net https://www.google-analytics.com https://analytics.google.com",
              "frame-src 'self' https://app.powerbi.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Add HSTS only in production
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
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
