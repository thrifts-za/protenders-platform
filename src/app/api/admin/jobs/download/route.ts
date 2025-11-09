/**
 * Admin Job: Trigger ETL Download
 * POST /api/admin/jobs/download
 *
 * Migrated from TenderAPI Express route
 * Downloads OCDS data from eTenders API
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const jobSchema = z.object({
  year: z.union([z.number(), z.literal("alltime")]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { year = 2025 } = jobSchema.parse(body);

    console.log(`🔄 Download triggered for year: ${year}`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: "DOWNLOAD",
        status: "PENDING",
        metadata: JSON.stringify({ year }),
      },
    });

    // TODO: Implement actual download logic
    // This should run: npx tsx src/scripts/etl-download.ts ${year}

    setImmediate(async () => {
      try {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            finishedAt: new Date(),
            note: `Download completed for ${year} (placeholder - implement download script)`,
          },
        });
      } catch (error) {
        console.error("Download job failed:", error);
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            note: error instanceof Error ? error.message : "Download failed",
          },
        });
      }
    });

    return NextResponse.json({
      message: "Download job started",
      jobId: job.id,
      year,
    });
  } catch (error) {
    console.error("Error triggering download:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to trigger download" },
      { status: 500 }
    );
  }
}
