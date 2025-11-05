/**
 * Admin Job: Trigger Today's Sync
 * POST /api/admin/jobs/sync-today
 *
 * Migrated from TenderAPI Express route
 * Quick sync for today only
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { performSync } from "@/app/api/cron/sync/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { pageSize = 2000, batchPages = 2, enableEnrichment, requireEnrichment = false } = body || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`🔄 Manual sync triggered for today: ${today.toISOString().split('T')[0]}`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: "SYNC",
        status: "RUNNING",
        startedAt: new Date(),
        metadata: JSON.stringify({ date: today.toISOString().split('T')[0], manual: true, pageSize, batchPages, requireEnrichment, enableEnrichment }),
      },
    });

    const fromStr = today.toISOString().slice(0, 10);
    const toStr = fromStr;

    const origEnable = process.env.ENABLE_ENRICHMENT;
    if (typeof enableEnrichment === 'boolean') process.env.ENABLE_ENRICHMENT = enableEnrichment ? 'true' : 'false';
    try {
      const res = await performSync({ mode: 'daily', fromParam: fromStr, toParam: toStr, windowDays: 1, batchPages, pageSize, requireEnrichment });
      await prisma.jobLog.update({
        where: { id: job.id },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
          note: `Processed ${res.recordsProcessed} records (${res.recordsAdded} added, ${res.recordsUpdated} updated)${res.enrichmentCount ? `, enriched ${res.enrichmentSuccess}/${res.enrichmentCount}` : ''}`,
          metadata: JSON.stringify({ ...res, date: fromStr }),
        },
      });

      return NextResponse.json({ message: "Today's sync completed", jobId: job.id, date: fromStr, result: res });
    } catch (error) {
      console.error("Today's sync failed:", error);
      await prisma.jobLog.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          note: error instanceof Error ? error.message : 'Sync failed',
        },
      });
      return NextResponse.json({ error: 'Failed to run today sync', message: (error as Error).message }, { status: 500 });
    } finally {
      if (origEnable !== undefined) process.env.ENABLE_ENRICHMENT = origEnable; else delete process.env.ENABLE_ENRICHMENT;
    }
  } catch (error) {
    console.error("Error triggering today's sync:", error);
    return NextResponse.json(
      { error: "Failed to trigger today's sync" },
      { status: 500 }
    );
  }
}
