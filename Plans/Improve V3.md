🔧 Goals:

Eliminate unnecessary server-side rendering. Use static generation or ISR wherever possible.

Leverage React Server Components for data-fetching routes and keep client components strictly for interactivity.

Optimize all database interactions for speed (connection pooling, light payloads, query indexing).

Split client bundles and remove any unused JS to reduce load times.

Cache aggressively at all layers: DB results, API responses, and page rendering.

Use edge functions/middleware where user context or geolocation is needed.

Implement lazy loading for images and components where appropriate.

🔍 SEO MUST-HAVES:

Ensure robots.txt and sitemap.xml are correctly generated and publicly accessible.

Auto-generate sitemap using all dynamic route paths (/blog/[slug], /products/[id], etc.) and keep it updated at build time or via ISR.

Use semantic HTML5 tags in all public-facing pages.

Every page must have <title>, meta descriptions, og:* tags, and canonical URLs.

Dynamic routes should include metadata() and generateStaticParams() where applicable.

Set proper revalidate times based on content freshness.

Use next/headers for server-only logic and avoid client-fetching for SEO-relevant data.

🔐 Admin vs. User Side:

Admin area should be server-protected using middleware, and should not be indexed (add noindex via meta tags and block in robots.txt).

User side should be fully SEO optimized and fast-loading with prefetching where logical.

Final output must include:

Updated robots.txt, sitemap.xml, and all relevant Next.js SEO config

Optimized middleware.ts for access control

Performance budget checks (e.g. LCP under 2.5s, TTFB under 200ms)

List of all dynamic paths with proper metadata and static generation strategy