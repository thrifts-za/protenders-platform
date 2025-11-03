import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return;
  if (pathname === "/admin/login") return; // allow login

  const session = req.auth;
  if (!session || !session.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    if (pathname !== "/admin") url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  // Require admin role
  const role = (session.user as any).role || "user";
  if (role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
});

export const config = { matcher: ["/admin/:path*"] };
