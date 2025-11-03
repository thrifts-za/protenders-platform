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
      // Run sync logic
      const syncResult = await performSync();

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
async function performSync(): Promise<SyncResult> {
  const startTime = Date.now();

  // Placeholder: In production, this would:
  // 1. Fetch latest releases from OCDS API
  // 2. Process and store new/updated tenders
  // 3. Trigger enrichment pipeline
  // 4. Update sync state cursor

  console.log('   Checking OCDS API for updates...');
  console.log('   Sync logic placeholder - full implementation pending');

  // Get current database stats for reporting
  const totalReleases = await prisma.oCDSRelease.count();

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  const duration = Date.now() - startTime;

  return {
    success: true,
    recordsProcessed: 0,
    recordsAdded: 0,
    recordsUpdated: 0,
    duration,
  };
}
