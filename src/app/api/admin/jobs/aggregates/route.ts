/**
 * Admin Job: Trigger Aggregates Computation
 * POST /api/admin/jobs/aggregates
 *
 * Migrated from TenderAPI Express route
 * Computes tender aggregates and statistics
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
    console.log(`🔄 Aggregates computation triggered`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: "AGGREGATES",
        status: "PENDING",
      },
    });

    // TODO: Implement actual aggregates logic
    // This should call intelligenceJobsService.runAggregatesJob() when migrated

    setImmediate(async () => {
      try {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            finishedAt: new Date(),
            note: "Aggregates computation completed (placeholder - implement logic)",
          },
        });
      } catch (error) {
        console.error("Aggregates job failed:", error);
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            note: error instanceof Error ? error.message : "Aggregates failed",
          },
        });
      }
    });

    return NextResponse.json({
      message: "Aggregates job started",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error triggering aggregates:", error);
    return NextResponse.json(
      { error: "Failed to trigger aggregates job" },
      { status: 500 }
    );
  }
}
