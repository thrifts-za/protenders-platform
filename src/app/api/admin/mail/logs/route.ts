/**
 * Admin Mail Logs
 * GET /api/admin/mail/logs
 *
 * Migrated from TenderAPI Express route
 * Returns email log history
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const logs = await prisma.mailLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error("Error fetching mail logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch mail logs" },
      { status: 500 }
    );
  }
}
