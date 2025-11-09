/**
 * Forgot Password API
 * POST /api/auth/forgot-password
 *
 * Sends a password reset email with a unique token
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Add PasswordResetToken model to Prisma schema before enabling this feature
    // For now, return a message that this feature is not yet implemented
    return NextResponse.json(
      {
        error: "Password reset feature is currently under maintenance. Please contact support.",
      },
      { status: 503 }
    );

    /* Temporarily disabled - needs PasswordResetToken model in Prisma schema
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success (don't reveal if email exists for security)
    if (!user) {
      console.log(`⚠️  Password reset requested for non-existent email: ${email}`);
      return NextResponse.json(
        {
          message: "If an account with that email exists, you will receive a password reset link.",
        },
        { status: 200 }
      );
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // In production, send email here
    // For now, log the reset link
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    console.log(`✅ Password reset token generated for: ${email}`);
    console.log(`🔗 Reset link: ${resetUrl}`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(email, user.name || '', resetUrl);

    return NextResponse.json(
      {
        message: "If an account with that email exists, you will receive a password reset link.",
        // Include reset URL in development only
        ...(process.env.NODE_ENV === 'development' && { resetUrl }),
      },
      { status: 200 }
    );
    */
  } catch (error) {
    console.error("❌ Forgot password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "An error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
