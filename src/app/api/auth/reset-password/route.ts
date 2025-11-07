/**
 * Password Reset API
 * POST /api/auth/reset-password
 *
 * Sends password reset email with token
 * (Simplified version - full implementation would include email service)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resetSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // But only create token if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token in database
      await prisma.user.update({
        where: { email },
        data: {
          // Note: These fields need to be added to the User schema
          // resetToken: resetToken,
          // resetTokenExpiry: resetTokenExpiry,
        },
      });

      // TODO: Send password reset email
      // await sendPasswordResetEmail(email, resetToken);

      console.log(`📧 Password reset requested for: ${email}`);
      console.log(`🔑 Reset token: ${resetToken} (expires in 1 hour)`);
    }

    // Always return success message to prevent email enumeration
    return NextResponse.json({
      message:
        "If an account exists with this email, a password reset link has been sent",
    });
  } catch (error) {
    console.error("❌ Password reset error:", error);

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
        error: "Password reset failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
