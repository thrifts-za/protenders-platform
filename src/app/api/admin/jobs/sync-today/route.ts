/**
 * Admin Job: Trigger Today's Sync
 * POST /api/admin/jobs/sync-today
 *
 * Migrated from TenderAPI Express route
 * Quick sync for today only
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`🔄 Manual sync triggered for today: ${today.toISOString().split('T')[0]}`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: "SYNC",
        status: "PENDING",
        metadata: JSON.stringify({ date: today.toISOString().split('T')[0], manual: true }),
      },
    });

    // TODO: Implement actual sync logic
    // This should call syncScheduler.triggerManualSync(false, today, today) when migrated

    setImmediate(async () => {
      try {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            finishedAt: new Date(),
            note: "Today's sync completed (placeholder - implement sync logic)",
          },
        });
      } catch (error) {
        console.error("Today's sync failed:", error);
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            note: error instanceof Error ? error.message : "Sync failed",
          },
        });
      }
    });

    return NextResponse.json({
      message: "Today's sync started",
      jobId: job.id,
      date: today.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error("Error triggering today's sync:", error);
    return NextResponse.json(
      { error: "Failed to trigger today's sync" },
      { status: 500 }
    );
  }
}
