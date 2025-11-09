/**
 * Admin Job: Enrich Today's Tenders
 * POST /api/admin/jobs/enrich-today
 *
 * Tests enrichment by syncing today's tenders with enrichment enabled
 * This allows manual testing of the enrichment integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OCDS_API_BASE } from '@/lib/enrichment/constants';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution time

/**
 * POST /api/admin/jobs/enrich-today
 * Trigger sync for today's tenders with enrichment enabled
 */
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
    const { maxEnrichment = 10, windowDays = 1 } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const wnd = Math.max(1, Math.min(30, parseInt(String(windowDays), 10)));
    const fromDate = new Date(today.getTime() - (wnd - 1) * 24 * 60 * 60 * 1000);
    const fromStr = fromDate.toISOString().split('T')[0];
    
    // End of day for proper date range (like old TenderAPI)
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    const todayEndStr = todayEnd.toISOString().split('T')[0];

    console.log(`🔄 Enrichment test triggered for today: ${todayStr} (max enrichment: ${maxEnrichment})`);

    // Create job log entry
    const job = await prisma.jobLog.create({
      data: {
        type: 'ENRICHMENT_TEST',
        status: 'RUNNING',
        startedAt: new Date(),
        metadata: JSON.stringify({
          date: todayStr,
          manual: true,
          maxEnrichment,
          enrichmentEnabled: true,
        }),
      },
    });

    // Call the sync function with enrichment enabled
    // We'll temporarily enable enrichment via environment override
    const originalEnableEnrichment = process.env.ENABLE_ENRICHMENT;
    const originalMaxEnrichment = process.env.MAX_ENRICHMENT_PER_RUN;

    try {
      // Temporarily enable enrichment for this test
      process.env.ENABLE_ENRICHMENT = 'true';
      process.env.MAX_ENRICHMENT_PER_RUN = String(maxEnrichment);

      console.log(`🔧 Enrichment test config: ENABLE_ENRICHMENT=true, MAX_ENRICHMENT_PER_RUN=${maxEnrichment}`);
      console.log(`📅 Syncing tenders for window: ${fromStr} → ${todayEndStr} (days=${wnd})`);

      // Quick API health check before attempting full sync
      console.log(`🏥 Checking OCDS API availability...`);
      const ocdsBase = (OCDS_API_BASE || 'https://ocds-api.etenders.gov.za').replace(/\/$/, '');
      const healthCheckUrl = `${ocdsBase}/api/OCDSReleases?PageNumber=1&PageSize=1&dateFrom=${todayStr}&dateTo=${todayStr}`;
      try {
        const healthController = new AbortController();
        const healthTimeout = setTimeout(() => healthController.abort(), 20000); // 20s health check (API can be slow)
        
        const healthRes = await fetch(healthCheckUrl, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
          signal: healthController.signal,
        });
        clearTimeout(healthTimeout);
        
        if (healthRes.ok) {
          console.log(`✅ OCDS API is reachable (HTTP ${healthRes.status})`);
        } else {
          console.log(`⚠️  OCDS API returned HTTP ${healthRes.status} - proceeding anyway, full sync may still succeed`);
        }
      } catch (healthError) {
        const isTimeout = healthError instanceof Error && (healthError.name === 'AbortError' || healthError.message?.toLowerCase().includes('timeout'));
        const errorMsg = healthError instanceof Error ? healthError.message : 'Unknown error';
        // Do NOT fail the job just because the health check failed; proceed to full sync which has robust retries/timeouts
        console.warn(`⚠️  OCDS API health check ${isTimeout ? 'timed out' : 'failed'} (${errorMsg}). Proceeding to full sync anyway...`);
      }

      // Import and call the sync function
      const syncModule = await import('@/app/api/cron/sync/route');
      const performSync = syncModule.performSync;
      
      // Call sync for today only (matching old TenderAPI sync-today + DELTA_SYNC behavior)
      // Use large pageSize (15000) for maximum speed, matching DELTA_SYNC implementation
      console.log(`🚀 Calling performSync for selected window...`);
      console.log(`📋 Sync parameters: mode=daily, from=${fromStr}, to=${todayEndStr}, windowDays=${wnd}, batchPages=2, pageSize=15000`);
      
      const syncResult = await performSync({
        mode: 'daily',
        fromParam: fromStr,
        toParam: todayEndStr, // Use end of day
        windowDays: wnd,
        batchPages: 2, // behaves well with 2 pages
        pageSize: 15000, // fewer API calls
      });
      
      // Log if no releases found
      if (syncResult.recordsProcessed === 0) {
        console.log(`⚠️  No releases found for date ${todayStr}. This might be normal if there are no tenders published today.`);
      }
      
      console.log(`✅ Sync completed:`, syncResult);

      // Restore original env vars
      if (originalEnableEnrichment !== undefined) {
        process.env.ENABLE_ENRICHMENT = originalEnableEnrichment;
      } else {
        delete process.env.ENABLE_ENRICHMENT;
      }
      if (originalMaxEnrichment !== undefined) {
        process.env.MAX_ENRICHMENT_PER_RUN = originalMaxEnrichment;
      } else {
        delete process.env.MAX_ENRICHMENT_PER_RUN;
      }

      // Update job log with success
      const note = `Processed ${syncResult.recordsProcessed} records (${syncResult.recordsAdded} added, ${syncResult.recordsUpdated} updated)${
        syncResult.enrichmentCount
          ? `. Enriched ${syncResult.enrichmentSuccess}/${syncResult.enrichmentCount} tenders (${syncResult.enrichmentFailures} failed)`
          : ''
      }`;

      await prisma.jobLog.update({
        where: { id: job.id },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
          note,
          metadata: JSON.stringify({
            ...syncResult,
            date: todayStr,
            manual: true,
            enrichmentEnabled: true,
          }),
        },
      });

      console.log(`✅ Enrichment test completed: ${note}`);

      return NextResponse.json({
        message: 'Enrichment test completed successfully',
        jobId: job.id,
        date: todayStr,
        result: {
          recordsProcessed: syncResult.recordsProcessed,
          recordsAdded: syncResult.recordsAdded,
          recordsUpdated: syncResult.recordsUpdated,
          enrichmentCount: syncResult.enrichmentCount || 0,
          enrichmentSuccess: syncResult.enrichmentSuccess || 0,
          enrichmentFailures: syncResult.enrichmentFailures || 0,
          duration: syncResult.duration,
        },
      });
    } catch (syncError) {
      // Restore original env vars on error
      if (originalEnableEnrichment !== undefined) {
        process.env.ENABLE_ENRICHMENT = originalEnableEnrichment;
      } else {
        delete process.env.ENABLE_ENRICHMENT;
      }
      if (originalMaxEnrichment !== undefined) {
        process.env.MAX_ENRICHMENT_PER_RUN = originalMaxEnrichment;
      } else {
        delete process.env.MAX_ENRICHMENT_PER_RUN;
      }

      // Log detailed error information
      const errorMessage = syncError instanceof Error ? syncError.message : 'Unknown error';
      const errorStack = syncError instanceof Error ? syncError.stack : undefined;
      console.error('❌ Enrichment test sync error:', {
        message: errorMessage,
        stack: errorStack,
        error: syncError,
      });

      // Provide helpful error message for common issues
      let helpfulNote = errorMessage;
      const msgLower = errorMessage.toLowerCase();
      if (msgLower.includes('timeout') || msgLower.includes('timed out') || msgLower.includes('aborterror')) {
        helpfulNote = `API timeout: The OCDS API took too long to respond. This usually means the API is slow or unavailable. Try again in a few minutes or check if the API is operational.`;
      } else if (msgLower.includes(' 5') || msgLower.includes('http 5')) {
        helpfulNote = `API server error: The OCDS API returned a 500 error. The server may be temporarily down. Try again later.`;
      } else if (msgLower.includes('http 4')) {
        helpfulNote = `API request rejected: The OCDS API returned a 4xx error. The request parameters may be invalid or too large. Try a smaller date range or lower page size.`;
      } else if (msgLower.includes('fetch') || msgLower.includes('network')) {
        helpfulNote = `Network error: Unable to connect to the OCDS API. Check your internet connection or API availability.`;
      }

      // Update job log with detailed error
      try {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            finishedAt: new Date(),
            note: helpfulNote,
            metadata: JSON.stringify({
              error: errorMessage,
              stack: errorStack,
              date: todayStr,
              manual: true,
              helpfulNote,
            }),
          },
        });
      } catch (updateError) {
        console.error('Failed to update job log with error:', updateError);
      }

      throw syncError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Error running enrichment test:', {
      message: errorMessage,
      stack: errorStack,
      error,
    });

    // Try to update job log if it exists
    try {
      const jobs = await prisma.jobLog.findMany({
        where: { type: 'ENRICHMENT_TEST', status: 'RUNNING' },
        orderBy: { startedAt: 'desc' },
        take: 1,
      });

      if (jobs.length > 0) {
        await prisma.jobLog.update({
          where: { id: jobs[0].id },
          data: {
            status: 'FAILED',
            finishedAt: new Date(),
            note: `Error: ${errorMessage}${errorStack ? ` (${errorStack.substring(0, 200)})` : ''}`,
            metadata: JSON.stringify({
              error: errorMessage,
              stack: errorStack,
              timestamp: new Date().toISOString(),
            }),
          },
        });
      }
    } catch (updateError) {
      console.error('Failed to update job log:', updateError);
    }

    return NextResponse.json(
      {
        error: 'Failed to run enrichment test',
        message: errorMessage,
        details: errorStack ? errorStack.substring(0, 500) : undefined,
      },
      { status: 500 }
    );
  }
}
