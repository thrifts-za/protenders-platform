/**
 * Admin Mail Template
 * PUT /api/admin/mail/template
 *
 * Migrated from TenderAPI Express route
 * Updates email template configuration
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const templateSchema = z.object({
  subject: z.string().optional(),
  headerHtml: z.string().optional(),
  footerHtml: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = templateSchema.parse(body);

    const existing = await prisma.config.findUnique({
      where: { key: "mailTemplate" },
    });
    const currentTemplate = existing ? JSON.parse(existing.value) : {};

    const updated = { ...currentTemplate, ...data };

    await prisma.config.upsert({
      where: { key: "mailTemplate" },
      create: { key: "mailTemplate", value: JSON.stringify(updated) },
      update: { value: JSON.stringify(updated) },
    });

    console.log(`📧 Mail template updated`);

    return NextResponse.json({
      message: "Mail template updated",
      template: updated,
    });
  } catch (error) {
    console.error("Error updating mail template:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update mail template" },
      { status: 500 }
    );
  }
}
