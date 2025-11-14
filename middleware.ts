import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware for:
 * 1. Redirect management (301/302 redirects)
 * 2. 404 error detection (logging handled in app)
 * 3. SEO optimization
 *
 * Note: This uses Edge Runtime, so database operations are done via fetch to API routes
 */

// In-memory cache for redirects (refreshed periodically)
let redirectsCache: Map<string, { toPath: string; statusCode: number; preserveQuery: boolean; id: string }> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

async function getRedirects() {
  const now = Date.now();

  // Return cached redirects if still valid
  if (redirectsCache && now - cacheTimestamp < CACHE_TTL) {
    return redirectsCache;
  }

  try {
    // Fetch redirects from API route
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://protenders.co.za';
    const response = await fetch(`${baseUrl}/api/redirects/active`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error("Failed to fetch redirects:", response.statusText);
      return redirectsCache || new Map();
    }

    const redirects = await response.json();

    // Build cache map
    const cache = new Map();
    for (const redirect of redirects) {
      cache.set(redirect.fromPath, {
        toPath: redirect.toPath,
        statusCode: redirect.statusCode,
        preserveQuery: redirect.preserveQuery,
        id: redirect.id,
      });
    }

    redirectsCache = cache;
    cacheTimestamp = now;

    return cache;
  } catch (error) {
    console.error("Error loading redirects:", error);
    // Return existing cache or empty map on error
    return redirectsCache || new Map();
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") && !pathname.endsWith("/") // Skip files but not directories
  ) {
    return NextResponse.next();
  }

  try {
    // Get redirects from cache
    const redirects = await getRedirects();
    const redirect = redirects.get(pathname);

    if (redirect) {
      // Build destination URL
      const destination = redirect.toPath;
      const redirectUrl = new URL(
        redirect.preserveQuery ? `${destination}${search}` : destination,
        request.url
      );

      // Track redirect hit asynchronously (fire and forget)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://protenders.co.za';
      fetch(`${baseUrl}/api/redirects/${redirect.id}/track`, {
        method: "POST",
      }).catch(() => {
        // Silently fail if tracking fails
      });

      // Return redirect response
      return NextResponse.redirect(redirectUrl, redirect.statusCode);
    }

    // Add custom header to track potential 404s (can be logged in app)
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, continue to the page normally
    return NextResponse.next();
  }
}

// Configure which routes should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)",
  ],
};
