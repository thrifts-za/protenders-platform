/**
 * Admin Job: Trigger Manual OCDS Sync
 * POST /api/admin/jobs/sync-now
 *
 * Migrated from TenderAPI Express route
 * Triggers a manual sync of OCDS data from eTenders API
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { dryRun = false } = body;

    console.log(`🔄 Manual sync triggered${dryRun ? ' (DRY RUN)' : ''}`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: "SYNC",
        status: "PENDING",
        metadata: JSON.stringify({ dryRun, manual: true }),
      },
    });

    // TODO: Implement actual sync logic
    // This should call the sync scheduler service when migrated
    // For now, just return success to establish the API endpoint

    setImmediate(async () => {
      try {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            finishedAt: new Date(),
            note: "Manual sync completed (placeholder - implement sync logic)",
          },
        });
      } catch (error) {
        console.error("Sync job failed:", error);
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
      message: `Sync ${dryRun ? '(dry run) ' : ''}started`,
      jobId: job.id,
      dryRun,
    });
  } catch (error) {
    console.error("Error triggering sync:", error);
    return NextResponse.json(
      { error: "Failed to trigger sync" },
      { status: 500 }
    );
  }
}
