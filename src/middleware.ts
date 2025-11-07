import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { checkRateLimit, parseWindow } from "@/lib/rateLimit";

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  // Admin app pages guard
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return; // allow login

    const session = req.auth;
    if (!session || !session.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      if (pathname !== "/admin") url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }

    // Require admin role for app pages
    const role = (session.user as any).role || "user";
    if (role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Admin API guard
  if (pathname.startsWith("/api/admin")) {
    // Allow auth endpoints without session
    if (
      pathname.startsWith("/api/admin/auth/login") ||
      pathname.startsWith("/api/admin/auth/me") ||
      pathname.startsWith("/api/admin/auth/logout")
    ) {
      return;
    }

    const session = req.auth;
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  // Generic API rate limiting (public and admin APIs)
  if (pathname.startsWith("/api/")) {
    // Skip auth endpoints
    if (pathname.startsWith("/api/auth")) return;
    if (pathname.startsWith("/api/admin/auth")) return;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Bucket selection: allow simple specialization per route if needed
    const isSearch = pathname.startsWith("/api/search") || pathname.startsWith("/api/recommendations");
    const isAdmin = pathname.startsWith("/api/admin");

    // Defaults align with Admin Config examples
    const defaultMax = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);
    const defaultWindow = parseWindow(process.env.RATE_LIMIT_WINDOW || "15m", 15 * 60_000);

    const [max, windowMs] = isAdmin
      ? [Math.max(100, defaultMax), defaultWindow]
      : isSearch
      ? [defaultMax, defaultWindow]
      : [defaultMax, defaultWindow];

    const key = `${ip}:${isAdmin ? "admin" : isSearch ? "search" : "api"}`;
    const result = checkRateLimit({ key, windowMs, max });
    if (result.limited) {
      return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          "x-ratelimit-limit": String(result.limit),
          "x-ratelimit-remaining": String(result.remaining),
          "x-ratelimit-reset": String(Math.floor(result.resetAt / 1000)),
        },
      });
    }

    // Attach helpful headers
    const res = NextResponse.next();
    res.headers.set("x-ratelimit-limit", String(result.limit));
    res.headers.set("x-ratelimit-remaining", String(result.remaining));
    res.headers.set("x-ratelimit-reset", String(Math.floor(result.resetAt / 1000)));
    return res;
  }
});

export const config = { matcher: ["/admin/:path*", "/api/:path*"] };
