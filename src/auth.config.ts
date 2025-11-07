import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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

          // Primary user login (local, Prisma)
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.password) {
            // Fallback: Allow any email/password for development if no user exists
            if (process.env.NODE_ENV === 'development') {
              const isAdmin = email.toLowerCase().includes('admin');
              return {
                id: email,
                email,
                name: email.split('@')[0],
                role: (isAdmin ? 'admin' : 'user') as string,
                adminToken: isAdmin ? 'dev-admin-token' : undefined,
              } as any;
            }
            return null;
          }

          const ok = await bcrypt.compare(password, user.password);
          if (!ok) return null;
          // Update last login timestamp (best-effort)
          try {
            await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
          } catch {}

          // Return NextAuth user object
          const result: any = {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: (user.role?.toLowerCase() === 'admin' ? 'admin' : 'user') as string,
          };
          // Preserve adminToken compatibility for existing admin pages (not required by middleware)
          if (result.role === 'admin') result.adminToken = 'admin-session';
          return result;
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
