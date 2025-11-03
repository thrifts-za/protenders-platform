import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tender-spotlight-pro.onrender.com';

// User type
export type User = {
  id: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin';
};

// Login credentials schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          // Check if this is a demo/guest login
          if (email === "demo@protenders.co.za" && password === "demo123") {
            return {
              id: "demo-user",
              email: "demo@protenders.co.za",
              name: "Demo User",
              role: "user" as const,
            };
          }

          // Primary user login (non-admin)
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }).catch(() => null);

          let baseUser: any = null;
          if (response && response.ok) {
            try {
              const user = await response.json();
              baseUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role || "user",
              } as const;
            } catch {}
          }

          // Attempt admin login to obtain backend JWT (if user is admin)
          let adminToken: string | null = null;
          try {
            const adminRes = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            if (adminRes.ok) {
              const adminData = await adminRes.json();
              adminToken = adminData.token;
              baseUser = {
                id: adminData.user?.id || baseUser?.id || email,
                email: adminData.user?.email || email,
                name: adminData.user?.name || baseUser?.name || email.split('@')[0],
                role: (adminData.user?.role || "admin") as const,
                adminToken,
              };
            }
          } catch {}

          // Fallback: Allow any email/password for development
          if (process.env.NODE_ENV === 'development') {
            const isAdmin = email.toLowerCase().includes('admin');
            return {
              id: email,
              email,
              name: email.split('@')[0],
              role: (isAdmin ? 'admin' : 'user') as const,
              adminToken: isAdmin ? 'dev-admin-token' : undefined,
            };
          }

          // Return whichever user we got, preferring admin if available
          if (baseUser) return baseUser as any;
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role || "user";
        // Persist backend admin JWT for admin API calls when available
        // @ts-expect-error dynamic field
        token.adminToken = (user as any).adminToken || token.adminToken || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = (token.role as 'user' | 'admin') || "user";
      }
      // @ts-expect-error add adminToken to session
      session.adminToken = (token as any).adminToken || null;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
