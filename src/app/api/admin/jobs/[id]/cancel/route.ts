/**
 * Admin Job: Cancel Running Job
 * POST /api/admin/jobs/:id/cancel
 *
 * Migrated from TenderAPI Express route
 * Marks a running job as cancelled
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    const job = await prisma.jobLog.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.status !== "RUNNING" && job.status !== "PENDING") {
      return NextResponse.json(
        { error: "Job is not running" },
        { status: 400 }
      );
    }

    // Mark as cancelled (failed with note)
    await prisma.jobLog.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        note: "Cancelled by admin",
      },
    });

    console.log(`❌ Job ${jobId} cancelled by admin`);

    return NextResponse.json({
      message: "Job cancelled successfully",
      jobId,
    });
  } catch (error) {
    console.error("Error cancelling job:", error);
    return NextResponse.json(
      { error: "Failed to cancel job" },
      { status: 500 }
    );
  }
}
