/**
 * Get Security Question API
 * POST /api/auth/get-security-question
 *
 * Returns the security question for a given email
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getQuestionSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = getQuestionSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, securityQuestion: true },
    });

    if (!user || !user.securityQuestion) {
      return NextResponse.json(
        { error: "No security question found for this email" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        securityQuestion: user.securityQuestion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Get security question error:", error);

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
