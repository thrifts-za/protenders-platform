import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Enforce JWT_SECRET - fail fast if not configured
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. This is required for security.');
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Get current admin user
 * GET /api/admin/auth/me
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { error: "Failed to get user info" },
      { status: 500 }
    );
  }
}
