import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

// Edge-safe auth configuration without Prisma/bcrypt
const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = (auth?.user as any)?.role === "admin";

      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnAdminLogin = nextUrl.pathname === "/admin/login";
      const isOnAdminApi = nextUrl.pathname.startsWith("/api/admin");

      if (isOnAdmin && !isOnAdminLogin) {
        if (!isLoggedIn) return false; // Redirect to login
        if (!isAdmin) return false; // Redirect to home
        return true;
      }

      if (isOnAdminApi) {
        // Allow auth endpoints
        if (
          nextUrl.pathname.startsWith("/api/admin/auth/login") ||
          nextUrl.pathname.startsWith("/api/admin/auth/me") ||
          nextUrl.pathname.startsWith("/api/admin/auth/logout")
        ) {
          return true;
        }
        return isLoggedIn && isAdmin;
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const { auth } = NextAuth(authConfig);
