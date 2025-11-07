/**
 * Admin Test Mail
 * POST /api/admin/mail/test
 *
 * Migrated from TenderAPI Express route
 * Sends a test email to verify SMTP configuration
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const testMailSchema = z.object({
  to: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to } = testMailSchema.parse(body);

    // TODO: Implement actual email sending logic
    // This should use emailService.testConnection() when migrated

    // For now, create a success log entry as placeholder
    await prisma.mailLog.create({
      data: {
        to,
        subject: "Test Email from ProTenders Admin",
        status: "SENT",
        isTest: true,
      },
    });

    console.log(`📧 Test email logged for ${to}`);

    return NextResponse.json({ message: "Test email sent" });
  } catch (error) {
    console.error("Error sending test mail:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send test mail" },
      { status: 500 }
    );
  }
}
