import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Enforce JWT_SECRET - fail fast if not configured
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. This is required for security.');
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Admin logout
 * POST /api/admin/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Log audit
        await prisma.auditLog.create({
          data: {
            userId: decoded.userId,
            action: "LOGOUT",
          },
        });
      } catch (err) {
        // Token invalid, but that's okay for logout
        console.log("Token invalid during logout, but continuing anyway");
      }
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
