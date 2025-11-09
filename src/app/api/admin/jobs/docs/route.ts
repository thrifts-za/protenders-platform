/**
 * Admin Job: Trigger Document Ingestion
 * POST /api/admin/jobs/docs
 *
 * Migrated from TenderAPI Express route
 * Ingests and processes tender documents
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
    console.log(`🔄 Document ingestion triggered`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: "DOCS_INGEST",
        status: "PENDING",
      },
    });

    // TODO: Implement actual document ingestion logic
    // This should call intelligenceJobsService.runDocsIngestJob() when migrated

    setImmediate(async () => {
      try {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            finishedAt: new Date(),
            note: "Document ingestion completed (placeholder - implement logic)",
          },
        });
      } catch (error) {
        console.error("Docs ingest job failed:", error);
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            note: error instanceof Error ? error.message : "Docs ingest failed",
          },
        });
      }
    });

    return NextResponse.json({
      message: "Docs ingest job started",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error triggering docs ingest:", error);
    return NextResponse.json(
      { error: "Failed to trigger docs ingest job" },
      { status: 500 }
    );
  }
}
