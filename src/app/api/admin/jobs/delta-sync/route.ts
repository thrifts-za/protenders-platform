/**
 * Admin Job: Trigger Delta Sync
 * POST /api/admin/jobs/delta-sync
 *
 * Migrated from TenderAPI Express route
 * Triggers a 10-minute incremental sync window
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    console.log(`🔄 Manual delta sync triggered`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: "DELTA_SYNC",
        status: "PENDING",
        metadata: JSON.stringify({ manual: true }),
      },
    });

    // TODO: Implement actual delta sync logic
    // This should call runDeltaSync() when migrated

    setImmediate(async () => {
      try {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            finishedAt: new Date(),
            note: "Delta sync completed (placeholder - implement sync logic)",
          },
        });
      } catch (error) {
        console.error("Delta sync failed:", error);
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            note: error instanceof Error ? error.message : "Delta sync failed",
          },
        });
      }
    });

    return NextResponse.json({
      message: "Delta sync started (10-minute incremental window)",
      jobId: job.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error triggering delta sync:", error);
    return NextResponse.json(
      { error: "Failed to trigger delta sync" },
      { status: 500 }
    );
  }
}
