/**
 * Cron Sync API Route
 * POST /api/cron/sync
 *
 * Scheduled endpoint for automated tender synchronization
 * Called by Vercel Cron every 6 hours
 *
 * Security: Validates CRON_SECRET to prevent unauthorized access
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution time

interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  duration: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled sync job...');

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: 'DELTA_SYNC',
        status: 'RUNNING',
        startedAt: new Date(),
        metadata: JSON.stringify({
          source: 'vercel-cron',
          trigger: 'scheduled',
        }),
      },
    });

    try {
      // Parse query params for backfill/windowed operation
      const url = new URL(request.url);
      const modeParam = url.searchParams.get('mode') || 'daily';
      const mode = (modeParam === 'backfill' ? 'backfill' : 'daily') as SyncMode;
      const fromParam = url.searchParams.get('from') || undefined; // YYYY-MM-DD
      const toParam = url.searchParams.get('to') || undefined; // YYYY-MM-DD
      const windowDaysParam = url.searchParams.get('windowDays');
      const windowDays = windowDaysParam ? Math.max(1, Math.min(31, parseInt(windowDaysParam))) : 7;
      const resultPagesParam = url.searchParams.get('batchPages');
      const batchPages = resultPagesParam ? Math.max(1, Math.min(2, parseInt(resultPagesParam))) : 2; // API behaves better with 2 pages

      // Run sync logic
      const syncResult = await performSync({ mode, fromParam, toParam, windowDays, batchPages });

      // Update job log with success
      await prisma.jobLog.update({
        where: { id: job.id },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
          note: `Processed ${syncResult.recordsProcessed} records (${syncResult.recordsAdded} added, ${syncResult.recordsUpdated} updated)`,
          metadata: JSON.stringify({
            ...syncResult,
            source: 'vercel-cron',
          }),
        },
      });

      console.log(`Sync completed successfully in ${syncResult.duration}ms`);
      console.log(`   Processed: ${syncResult.recordsProcessed} records`);
      console.log(`   Added: ${syncResult.recordsAdded}`);
      console.log(`   Updated: ${syncResult.recordsUpdated}`);

      return NextResponse.json({
        ...syncResult,
        jobId: job.id,
      });
    } catch (syncError) {
      // Update job log with failure
      await prisma.jobLog.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          note: syncError instanceof Error ? syncError.message : 'Sync failed',
        },
      });

      throw syncError;
    }
  } catch (error) {
    console.error('Sync job failed:', error);

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        duration,
      },
      { status: 500 }
    );
  }
}

/**
 * Perform the actual sync operation
 *
 * NOTE: This is a placeholder implementation that logs the sync.
 * The full sync logic from TenderAPI (OCDS API fetching, processing, etc.)
 * should be implemented here or in a separate service file.
 *
 * For now, this demonstrates the infrastructure is working.
 */
type SyncMode = 'daily' | 'backfill';

async function performSync(options?: {
  mode?: SyncMode;
  fromParam?: string;
  toParam?: string;
  windowDays?: number;
  batchPages?: number; // pages per batch (max 2)
}): Promise<SyncResult> {
  const startTime = Date.now();

  const { mode = 'daily', fromParam, toParam, windowDays = 7, batchPages = 2 } = options || {};

  // Determine date range using cursor (daily) or backfill window
  const syncStateId = 'ocds_etenders_sa';
  const existingState = await prisma.syncState.findUnique({ where: { id: syncStateId } });
  const now = new Date();
  let fromDate: Date;
  let toDate: Date;

  if (mode === 'backfill') {
    const startCursor = fromParam ? new Date(`${fromParam}T00:00:00Z`) : (existingState?.lastSyncedDate ?? new Date('2021-01-01T00:00:00Z'));
    const endBound = toParam ? new Date(`${toParam}T23:59:59Z`) : now;
    fromDate = startCursor;
    const windowMs = windowDays * 24 * 60 * 60 * 1000;
    toDate = new Date(Math.min(startCursor.getTime() + windowMs - 1, endBound.getTime()));
  } else {
    const defaultFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    fromDate = existingState?.lastSyncedDate ?? defaultFrom;
    toDate = now;
  }

  const toStr = toDate.toISOString().slice(0, 10);
  const fromStr = fromDate.toISOString().slice(0, 10);

  // Helper to fetch one page of OCDS releases
  async function fetchReleases(page: number, pageSize: number) {
    const base = 'https://ocds-api.etenders.gov.za/api/OCDSReleases';
    const url = `${base}?PageNumber=${page}&PageSize=${pageSize}&dateFrom=${fromStr}&dateTo=${toStr}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
    if (!res.ok) throw new Error(`OCDS fetch failed: ${res.status}`);
    return res.json() as Promise<{ releases?: any[]; links?: { next?: string } }>;
  }

  let page = 1;
  const pageSize = 100;
  let processed = 0;
  let added = 0;
  let updated = 0;

  const hardDeadlineMs = 280_000; // keep under 5m
  while (Date.now() - startTime < hardDeadlineMs) {
    let pagesThisBatch = 0;
    let hasMore = true;
    while (pagesThisBatch < batchPages && hasMore && Date.now() - startTime < hardDeadlineMs) {
      const pkg = await fetchReleases(page, pageSize);
      const releases = pkg.releases || [];
      if (!releases.length) { hasMore = false; break; }

      for (const rel of releases) {
        const publishedAtIso: string | undefined = rel?.date;
        const closingIso: string | undefined = rel?.tender?.tenderPeriod?.endDate;
        const updatedAtIso: string | undefined = (rel?.tender?.documents || [])
          .map((d: any) => d?.dateModified || d?.datePublished)
          .filter(Boolean)
          .sort()
          .pop();

        await prisma.oCDSRelease.upsert({
          where: { ocid_date: { ocid: String(rel.ocid), date: publishedAtIso ? new Date(publishedAtIso) : new Date() } },
          update: {
            json: JSON.stringify(rel),
            buyerName: rel?.buyer?.name || rel?.tender?.procuringEntity?.name || undefined,
            tenderTitle: rel?.tender?.title || undefined,
            tenderDescription: rel?.tender?.description || undefined,
            mainCategory: rel?.tender?.mainProcurementCategory || undefined,
            closingAt: closingIso ? new Date(closingIso) : undefined,
            status: rel?.tender?.status || undefined,
            publishedAt: publishedAtIso ? new Date(publishedAtIso) : undefined,
            updatedAt: updatedAtIso ? new Date(updatedAtIso) : undefined,
            tenderType: rel?.tender?.procurementMethodDetails || rel?.tender?.procurementMethod || undefined,
          },
          create: {
            ocid: String(rel.ocid),
            releaseId: String(rel.id),
            date: publishedAtIso ? new Date(publishedAtIso) : new Date(),
            tag: JSON.stringify(rel?.tag || ['compiled']),
            json: JSON.stringify(rel),
            buyerName: rel?.buyer?.name || rel?.tender?.procuringEntity?.name || undefined,
            tenderTitle: rel?.tender?.title || undefined,
            tenderDescription: rel?.tender?.description || undefined,
            mainCategory: rel?.tender?.mainProcurementCategory || undefined,
            closingAt: closingIso ? new Date(closingIso) : undefined,
            status: rel?.tender?.status || undefined,
            publishedAt: publishedAtIso ? new Date(publishedAtIso) : undefined,
            updatedAt: updatedAtIso ? new Date(updatedAtIso) : undefined,
            tenderType: rel?.tender?.procurementMethodDetails || rel?.tender?.procurementMethod || undefined,
          },
        });
        processed += 1;
      }

      hasMore = Boolean(pkg.links?.next);
      page += 1;
      pagesThisBatch += 1;
    }

    if (!pagesThisBatch) break;
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Update sync cursor: daily → toDate; backfill → advance past window
  const newCursorDate = mode === 'backfill' ? new Date(Math.min(toDate.getTime() + 1000, Date.now())) : toDate;
  await prisma.syncState.upsert({
    where: { id: 'ocds_etenders_sa' },
    update: { lastRunAt: new Date(), lastSuccessAt: new Date(), lastSyncedDate: newCursorDate },
    create: { id: 'ocds_etenders_sa', lastRunAt: new Date(), lastSuccessAt: new Date(), lastSyncedDate: newCursorDate },
  });

  const duration = Date.now() - startTime;
  return {
    success: true,
    recordsProcessed: processed,
    recordsAdded: added,
    recordsUpdated: updated,
    duration,
  };
}
