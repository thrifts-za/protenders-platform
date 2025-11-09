import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Enforce JWT_SECRET - fail fast if not configured
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. This is required for security.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "24h";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Admin login
 * POST /api/admin/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || user.role === "USER") {
      return NextResponse.json(
        {
          error: "Invalid credentials",
          message: "Email or password incorrect",
        },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
          message: "Email or password incorrect",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Log audit
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          metadata: JSON.stringify({
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
          }),
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit:", auditError);
      // Continue anyway - don't fail login because audit failed
    }

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
