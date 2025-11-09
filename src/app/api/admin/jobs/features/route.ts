/**
 * Admin Job: Trigger Features Computation
 * POST /api/admin/jobs/features
 *
 * Migrated from TenderAPI Express route
 * Computes AI features for tenders
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
    console.log(`🔄 Features computation triggered`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: "FEATURES",
        status: "PENDING",
      },
    });

    // TODO: Implement actual features logic
    // This should call intelligenceJobsService.runFeaturesJob() when migrated

    setImmediate(async () => {
      try {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            finishedAt: new Date(),
            note: "Features computation completed (placeholder - implement logic)",
          },
        });
      } catch (error) {
        console.error("Features job failed:", error);
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            note: error instanceof Error ? error.message : "Features failed",
          },
        });
      }
    });

    return NextResponse.json({
      message: "Features job started",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error triggering features:", error);
    return NextResponse.json(
      { error: "Failed to trigger features job" },
      { status: 500 }
    );
  }
}
