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


🔒 SECURITY-HARDENING PROMPT FOR CODE AGENT

Audit and secure my full-stack Next.js 14 application using the /app directory and hosted on Vercel, with a database hosted on Render.

🔐 Goals:

Enforce strict authentication and authorization:

Use middleware to protect all admin routes (/admin/**)

Ensure role-based access is implemented across both API and UI layers

Admin routes must be blocked in robots.txt and contain <meta name="robots" content="noindex">

Sanitize and validate all inputs (forms, query params, URL slugs, API payloads) to prevent:

SQL injection

XSS

CSRF

Path traversal

Open redirects

Database layer:

Use parameterized queries (e.g. Prisma or equivalent ORM)

Pool connections efficiently, limit query timeouts, and restrict public data exposure

Secure environment variables – never expose in client components

API security:

Lock API routes with proper auth tokens, session validation, or JWT

Implement rate limiting and bot protection (Edge Middleware or Vercel rate limit headers)

Return minimal error messages to avoid leaking internals

Session & cookie security:

Secure, HTTPOnly, SameSite=Strict, maxAge properly configured

Rotate tokens periodically and clear on logout

HTTPS and CSP:

Enforce HTTPS (Vercel does by default)

Add strict Content Security Policy, X-Frame-Options, and HSTS headers

Block inline scripts and third-party domains unless explicitly trusted

Dependency hygiene:

Audit all packages for vulnerabilities

Remove unused packages and scripts

Pin dependencies to prevent version drift

🔎 Final output must include:

Middleware for route protection

Secure cookie/session implementation

CSP config and custom headers in next.config.js

API route wrappers with auth checks

Input validation utilities (Zod or equivalent)

Database access pattern review for potential leaks or privilege abuse