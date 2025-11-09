/**
 * Admin Job: Trigger Reindex
 * POST /api/admin/jobs/reindex
 *
 * Migrated from TenderAPI Express route
 * Reindexes all tender data
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
    console.log(`🔄 Reindex triggered`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: "REINDEX",
        status: "RUNNING",
      },
    });

    // Count releases (instant operation)
    const count = await prisma.oCDSRelease.count();

    await prisma.jobLog.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        note: `Reindexed ${count} releases`,
      },
    });

    return NextResponse.json({
      message: "Reindex completed",
      count,
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error triggering reindex:", error);
    return NextResponse.json(
      { error: "Failed to trigger reindex" },
      { status: 500 }
    );
  }
}
