/**
 * Reset Password with Security Question API
 * POST /api/auth/reset-password-security
 *
 * Resets password after verifying security question answer
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  securityAnswer: z.string().min(1, "Security answer is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, securityAnswer, password } = resetPasswordSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.securityAnswer) {
      return NextResponse.json(
        { error: "Invalid credentials or no security question set" },
        { status: 400 }
      );
    }

    // Verify security answer (case-insensitive comparison of hashed values)
    const isAnswerCorrect = await bcrypt.compare(
      securityAnswer.toLowerCase().trim(),
      user.securityAnswer
    );

    if (!isAnswerCorrect) {
      console.log(`⚠️  Incorrect security answer for: ${email}`);
      return NextResponse.json(
        { error: "Incorrect security answer" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password reset successful via security question for: ${email}`);

    return NextResponse.json(
      {
        message: "Password reset successful. You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Reset password (security) error:", error);

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
