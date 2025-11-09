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
import { enrichTenderFromEtenders } from '@/lib/enrichment/etendersEnricher';
import { RATE_LIMIT_DELAY_MS, DEFAULT_MAX_ENRICHMENT_PER_RUN, OCDS_API_BASE } from '@/lib/enrichment/constants';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution time

type SyncMode = 'daily' | 'backfill' | 'comprehensive';

interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  duration: number;
  enrichmentCount?: number;
  enrichmentSuccess?: number;
  enrichmentFailures?: number;
  error?: string;
  skippedNoEnrichment?: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret');
    const isVercelCron = !!request.headers.get('x-vercel-cron');

    const authorized =
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (cronSecret && secretParam === cronSecret) ||
      isVercelCron;

    if (!authorized) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      const modeParam = url.searchParams.get('mode') || 'daily';
      const mode = (modeParam === 'backfill' ? 'backfill' : modeParam === 'comprehensive' ? 'comprehensive' : 'daily') as SyncMode;
      const fromParam = url.searchParams.get('from') || undefined; // YYYY-MM-DD
      const toParam = url.searchParams.get('to') || undefined; // YYYY-MM-DD
      const windowDaysParam = url.searchParams.get('windowDays');
      const windowDays = windowDaysParam ? Math.max(1, Math.min(31, parseInt(windowDaysParam))) : 7;
      const resultPagesParam = url.searchParams.get('batchPages');
      const batchPages = resultPagesParam ? Math.max(1, Math.min(2, parseInt(resultPagesParam))) : 2; // API behaves better with 2 pages
      const requireEnrichment = url.searchParams.get('requireEnrichment') === '1';
      const incremental = url.searchParams.get('incremental') === '1';
      const enforceWindow = url.searchParams.get('enforceWindow') === '1';

      // Optional time window gating for incremental runs (8:00-16:00 SAST)
      if (incremental && enforceWindow) {
        const now = new Date();
        // Africa/Johannesburg is SAST (UTC+2, no DST currently)
        const fmt = new Intl.DateTimeFormat('en-ZA', { timeZone: 'Africa/Johannesburg', hour: '2-digit', hour12: false });
        const hourStr = fmt.format(now);
        const hour = parseInt(hourStr, 10);
        if (isFinite(hour)) {
          if (hour < 8 || hour >= 16) {
            console.log(`⏭️  Skipping incremental sync outside window (SAST hour=${hour})`);
            return NextResponse.json({ success: true, skipped: true, reason: 'outside_window' }, { status: 200 });
          }
        }
      }

      // Run sync logic
      const syncResult = await performSync({ mode, fromParam, toParam, windowDays, batchPages, requireEnrichment });

      // Update job log with success
      await prisma.jobLog.update({
        where: { id: job.id },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
          note: `Processed ${syncResult.recordsProcessed} records (${syncResult.recordsAdded} added, ${syncResult.recordsUpdated} updated)${syncResult.enrichmentCount ? `, enriched ${syncResult.enrichmentSuccess}/${syncResult.enrichmentCount} tenders` : ''}`,
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
export async function performSync(options?: {
  mode?: SyncMode;
  fromParam?: string;
  toParam?: string;
  windowDays?: number;
  batchPages?: number; // pages per batch (max 2)
  pageSize?: number; // releases per page (default: 100, can be increased to 2000 for fewer API calls)
  requireEnrichment?: boolean; // if true, skip creating new rows that lack enrichment
}): Promise<SyncResult> {
  const startTime = Date.now();

  const { mode = 'daily', fromParam, toParam, windowDays = 7, batchPages = 2, pageSize = 100, requireEnrichment = false } = options || {};

  // Feature flag: Enable enrichment via eTenders site API
  const enableEnrichment = process.env.ENABLE_ENRICHMENT === 'true';
  const configuredMaxEnrichment = parseInt(
    process.env.MAX_ENRICHMENT_PER_RUN || String(DEFAULT_MAX_ENRICHMENT_PER_RUN),
    10
  );

  // Comprehensive mode: Higher enrichment limit and force enrichment on all missing categories
  const isComprehensiveMode = mode === 'comprehensive';
  const baseMaxEnrichment = isComprehensiveMode ? 1000 : configuredMaxEnrichment;

  console.log(`🚀 Starting sync (mode: ${mode}, enrichment: ${enableEnrichment ? 'ENABLED' : 'DISABLED'}, baseMax: ${baseMaxEnrichment})`);

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

  // Helper to fetch one page of OCDS releases with retry logic
  // Uses provided pageSize (can be 15000 for maximum speed, matching DELTA_SYNC implementation)
  async function fetchReleases(page: number, pageSizeParam: number, attempt = 1, maxAttempts = 3): Promise<{ releases?: any[]; links?: { next?: string } }> {
    const base = `${(OCDS_API_BASE || 'https://ocds-api.etenders.gov.za').replace(/\/$/, '')}/api/OCDSReleases`;
    const url = `${base}?PageNumber=${page}&PageSize=${pageSizeParam}&dateFrom=${fromStr}&dateTo=${toStr}`;
    
    // Increase timeout for retries (API might be slow)
    const timeoutMs = attempt === 1 ? 45000 : 60000; // 45s first attempt, 60s retries
    
    try {
      if (attempt === 1) {
        console.log(`📡 Fetching OCDS releases (page ${page}, timeout: ${timeoutMs}ms): ${url}`);
      } else {
        console.log(`🔄 Retrying OCDS fetch (attempt ${attempt}/${maxAttempts}, timeout: ${timeoutMs}ms): ${url}`);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        const res = await fetch(url, { 
          headers: { 'Accept': 'application/json' }, 
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      
        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          const errorMsg = `HTTP ${res.status} ${res.statusText}${errorText ? ` - ${errorText.substring(0, 200)}` : ''}`;
          
          // Retry on 5xx errors (server errors) or 429 (rate limit)
          if ((res.status >= 500 && res.status < 600) || res.status === 429) {
            if (attempt < maxAttempts) {
              const retryDelay = Math.min(2000 * attempt, 15000); // Progressive backoff: 2s, 4s, 6s (max 15s)
              console.log(`⚠️  Server error ${res.status}, retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxAttempts})`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              return fetchReleases(page, pageSizeParam, attempt + 1, maxAttempts);
            }
          }
          
          throw new Error(`OCDS fetch failed: ${errorMsg}`);
        }
        
        const data = await res.json();
        console.log(`✅ Fetched ${data.releases?.length || 0} releases from page ${page}`);
        return data as { releases?: any[]; links?: { next?: string } };
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    } catch (err) {
      if (err instanceof Error) {
        // Handle timeout and network errors with retry
        const isTimeout = err.name === 'AbortError' || err.message.toLowerCase().includes('timeout') || err.message.toLowerCase().includes('timed out');
        const isNetworkError = err.message.includes('fetch') || 
                               err.message.includes('network') || 
                               err.message.includes('ECONNREFUSED') ||
                               err.message.includes('ENOTFOUND') ||
                               err.message.includes('ECONNRESET') ||
                               err.message.includes('ETIMEDOUT');
        
        if ((isTimeout || isNetworkError) && attempt < maxAttempts) {
          const retryDelay = Math.min(3000 * attempt, 15000); // Progressive backoff: 3s, 6s, 9s (max 15s)
          console.log(`⚠️  ${isTimeout ? 'Timeout' : 'Network'} error: ${err.message}, retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return fetchReleases(page, pageSize, attempt + 1, maxAttempts);
        }
        
        if (isTimeout) {
          throw new Error(`OCDS fetch timeout: Request exceeded ${timeoutMs}ms after ${attempt} attempts. The API may be slow or unavailable.`);
        }
        
        if (isNetworkError) {
          throw new Error(`OCDS API network error: ${err.message}. Unable to connect to the API. This usually means the API server is down or unreachable.`);
        }
        
        throw new Error(`OCDS fetch error: ${err.message}`);
      }
      throw err;
    }
  }

  let page = 1;
  // Use provided pageSize or default to 100 (can be 15000 for maximum speed, matching DELTA_SYNC implementation)
  const pageSizeParam = pageSize || 100;
  let processed = 0;
  let added = 0;
  let updated = 0;
  let enrichmentCount = 0;
  let enrichmentSuccess = 0;
  let enrichmentFailures = 0;
  let skippedNoEnrichment = 0;

  // Dynamic enrichment limit: Count new tenders and adjust limit accordingly
  // For comprehensive mode, also count tenders missing detailedCategory
  let maxEnrichmentPerRun = baseMaxEnrichment;

  if (isComprehensiveMode && enableEnrichment) {
    // Comprehensive mode: Count ALL tenders from today missing detailedCategory
    console.log(`🔍 Comprehensive mode: Counting tenders missing detailedCategory from ${fromStr} to ${toStr}...`);
    const missingCategoryCount = await prisma.oCDSRelease.count({
      where: {
        publishedAt: {
          gte: fromDate,
          lte: toDate,
        },
        detailedCategory: null,
      },
    });
    // Set limit to cover all missing categories (capped at 1000 for safety)
    maxEnrichmentPerRun = Math.min(missingCategoryCount + 50, 1000); // +50 buffer for new tenders
    console.log(`📊 Found ${missingCategoryCount} tenders missing detailedCategory, setting enrichment limit to ${maxEnrichmentPerRun}`);
  } else if (enableEnrichment) {
    // Regular mode: Fetch first page to estimate new tender count
    try {
      const firstPage = await fetchReleases(1, 100);
      const sampleReleases = firstPage.releases || [];
      if (sampleReleases.length > 0) {
        // Count how many of the first 100 are new (don't exist in DB)
        let newCount = 0;
        for (const rel of sampleReleases.slice(0, Math.min(20, sampleReleases.length))) {
          const publishedAtIso: string | undefined = rel?.date;
          const exists = await prisma.oCDSRelease.findUnique({
            where: { ocid_date: { ocid: String(rel.ocid), date: publishedAtIso ? new Date(publishedAtIso) : new Date() } },
            select: { ocid: true },
          });
          if (!exists) newCount++;
        }
        // Extrapolate: if 15/20 are new, expect ~75% new tenders
        const newPercentage = sampleReleases.length > 0 ? (newCount / Math.min(20, sampleReleases.length)) : 0;
        const estimatedNewTenders = Math.ceil(sampleReleases.length * newPercentage);

        // Dynamic limit: MAX(estimated new tenders, configured base max)
        maxEnrichmentPerRun = Math.max(estimatedNewTenders, baseMaxEnrichment);
        console.log(`📊 Estimated ${estimatedNewTenders} new tenders (${(newPercentage * 100).toFixed(0)}% of first page), setting enrichment limit to ${maxEnrichmentPerRun}`);
      }
    } catch (err) {
      console.log(`⚠️  Could not estimate new tender count, using base limit: ${baseMaxEnrichment}`);
      maxEnrichmentPerRun = baseMaxEnrichment;
    }
  }

  console.log(`✅ Final enrichment limit for this run: ${maxEnrichmentPerRun}`);

  // Helper to derive tender number from release
  function deriveTenderNumber(tender: any): string | null {
    if (!tender) return null;
    if (typeof tender.title === 'string') {
      const title = tender.title.trim();
      // Prefix style: RFP..., RFQ...
      let m = title.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i);
      if (m) return (m[0] || title).replace(/\s+/g, '');
      // Suffix style: .../RFP, .../RFQ
      m = title.match(/([A-Z0-9/\.-]{3,})[-_\s:/]*(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)\b/i);
      if (m) return (m[0] || title).replace(/\s+/g, '');
    }
    if (typeof tender.id === 'string' && tender.id.trim()) return tender.id.trim();
    if (typeof tender.id === 'number') return String(tender.id);
    return null;
  }

  const hardDeadlineMs = 280_000; // keep under 5m
  while (Date.now() - startTime < hardDeadlineMs) {
    let pagesThisBatch = 0;
    let hasMore = true;
    while (pagesThisBatch < batchPages && hasMore && Date.now() - startTime < hardDeadlineMs) {
      try {
        let pkg = await fetchReleases(page, pageSizeParam);
        const releases = pkg.releases || [];
        if (!releases.length) { 
          console.log(`ℹ️  No releases found for page ${page}, stopping`);
          hasMore = false; 
          break; 
        }
      
      for (const rel of releases) {
        const publishedAtIso: string | undefined = rel?.date;
        const closingIso: string | undefined = rel?.tender?.tenderPeriod?.endDate;
        const updatedAtIso: string | undefined = (rel?.tender?.documents || [])
          .map((d: any) => d?.dateModified || d?.datePublished)
          .filter(Boolean)
          .sort()
          .pop();

        // Enrichment via eTenders site API (if enabled and within limits)
        // In comprehensive mode, also check if existing record needs re-enrichment
        let enrichmentData = null;
        let shouldEnrich = enableEnrichment && enrichmentCount < maxEnrichmentPerRun;

        // For comprehensive mode: Also enrich existing records missing detailedCategory
        if (isComprehensiveMode && enableEnrichment && enrichmentCount < maxEnrichmentPerRun) {
          const publishedAtIso: string | undefined = rel?.date;
          const existingRecord = await prisma.oCDSRelease.findUnique({
            where: { ocid_date: { ocid: String(rel.ocid), date: publishedAtIso ? new Date(publishedAtIso) : new Date() } },
            select: { detailedCategory: true },
          });
          // If record exists but has no category, we should re-enrich it
          if (existingRecord && !existingRecord.detailedCategory) {
            shouldEnrich = true;
            console.log(`🔍 Comprehensive: Re-enriching existing tender ${rel?.ocid} (missing category)`);
          }
        }

        if (shouldEnrich) {
          const tenderNumber = deriveTenderNumber(rel?.tender);
          if (tenderNumber) {
            try {
              enrichmentCount++;
              console.log(`🔄 [${enrichmentCount}/${maxEnrichmentPerRun}] Enriching tender: ${tenderNumber}`);
              const buyerNameCtx = rel?.buyer?.name || rel?.tender?.procuringEntity?.name || undefined;
              const titleCtx = rel?.tender?.title || undefined;
              const tenderIdHint = typeof rel?.tender?.id === 'string' ? rel?.tender?.id : (rel?.tender?.id != null ? String(rel?.tender?.id) : undefined);
              enrichmentData = await enrichTenderFromEtenders(tenderNumber, RATE_LIMIT_DELAY_MS, {
                buyerName: buyerNameCtx,
                title: titleCtx,
                tenderIdHint,
              });
              if (enrichmentData) {
                enrichmentSuccess++;
                console.log(`✅ Enriched tender ${tenderNumber}: province=${enrichmentData.province}, contact=${enrichmentData.contactEmail || 'N/A'}, category=${enrichmentData.detailedCategory || 'N/A'}`);
              } else {
                enrichmentFailures++;
                console.log(`⚠️  No enrichment data found for tender ${tenderNumber}`);
              }
            } catch (err) {
              enrichmentFailures++;
              const errorMsg = err instanceof Error ? err.message : 'Unknown error';
              console.error(`❌ Enrichment failed for ${tenderNumber}: ${errorMsg}`);
            }
          } else {
            console.log(`ℹ️  No tender number found for release ${rel?.ocid}`);
          }
        } else if (!enableEnrichment) {
          // Only log once per batch to avoid spam
          if (processed === 0) {
            console.log(`ℹ️  Enrichment disabled (ENABLE_ENRICHMENT=false)`);
          }
        } else if (enrichmentCount >= maxEnrichmentPerRun) {
          // Only log once when limit is reached
          if (enrichmentCount === maxEnrichmentPerRun) {
            console.log(`⚠️  Enrichment limit reached (${maxEnrichmentPerRun}), skipping further enrichments`);
          }
        }

        const baseData = {
          json: JSON.stringify(rel),
          buyerName: rel?.buyer?.name || rel?.tender?.procuringEntity?.name || undefined,
          tenderTitle: rel?.tender?.title || undefined,
          tenderDescription: rel?.tender?.description || undefined,
          mainCategory: rel?.tender?.mainProcurementCategory || undefined,
          closingAt: closingIso ? new Date(closingIso) : undefined,
          status: rel?.tender?.status || undefined,
          publishedAt: publishedAtIso ? new Date(publishedAtIso) : undefined,
          updatedAt: updatedAtIso ? new Date(updatedAtIso) : undefined,
          tenderType: enrichmentData?.tenderType || rel?.tender?.procurementMethodDetails || rel?.tender?.procurementMethod || undefined,
        };

        const enrichmentFields = enrichmentData ? {
          province: enrichmentData.province || undefined,
          deliveryLocation: enrichmentData.deliveryLocation || undefined,
          specialConditions: enrichmentData.specialConditions || undefined,
          contactPerson: enrichmentData.contactPerson || undefined,
          contactEmail: enrichmentData.contactEmail || undefined,
          contactTelephone: enrichmentData.contactTelephone || undefined,
          briefingDate: enrichmentData.briefingDate || undefined,
          briefingTime: enrichmentData.briefingTime || undefined,
          briefingVenue: enrichmentData.briefingVenue || undefined,
          briefingMeetingLink: enrichmentData.briefingMeetingLink || undefined,
          hasBriefing: typeof enrichmentData.hasBriefing === 'boolean' ? enrichmentData.hasBriefing : undefined,
          briefingCompulsory: typeof enrichmentData.briefingCompulsory === 'boolean' ? enrichmentData.briefingCompulsory : undefined,
          detailedCategory: enrichmentData.detailedCategory || undefined,
          enrichmentDocuments: Array.isArray(enrichmentData.documents) ? (enrichmentData.documents as any) : undefined,
        } : {};

        const existing = await prisma.oCDSRelease.findUnique({
          where: { ocid_date: { ocid: String(rel.ocid), date: publishedAtIso ? new Date(publishedAtIso) : new Date() } },
        });
        
        // Enforce enrichment for new records when required
        if (!existing && requireEnrichment && enableEnrichment && !enrichmentData) {
          skippedNoEnrichment += 1;
          console.log(`⏭️  Skipping create for ${rel?.ocid} (no enrichment, requireEnrichment=true)`);
        } else {
          await prisma.oCDSRelease.upsert({
          where: { ocid_date: { ocid: String(rel.ocid), date: publishedAtIso ? new Date(publishedAtIso) : new Date() } },
          update: {
            ...baseData,
            ...enrichmentFields,
          },
          create: {
            ocid: String(rel.ocid),
            releaseId: String(rel.id),
            date: publishedAtIso ? new Date(publishedAtIso) : new Date(),
            tag: JSON.stringify(rel?.tag || ['compiled']),
            ...baseData,
            ...enrichmentFields,
          },
          });
          
          if (existing) {
          updated += 1;
          } else {
          added += 1;
          }
        }
        processed += 1;
        
        if (processed % 10 === 0) {
          console.log(`📊 Progress: ${processed} processed (${added} added, ${updated} updated, ${enrichmentCount} enriched)`);
        }
      }

        hasMore = Boolean(pkg.links?.next);
        page += 1;
        pagesThisBatch += 1;
      } catch (fetchError) {
        // If it's the first page and we get an error, fail the whole sync
        // Otherwise, for delta/enrichment sync, be more lenient - just break and process what we have
        // (matching DELTA_SYNC implementation)
        if (page === 1 && pagesThisBatch === 0) {
          console.error(`❌ Failed to fetch first page (pageSize=${pageSizeParam}): ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
          // Fallback: try smaller page sizes before aborting
          const fallbackSizes = [2000, 500, 100].filter((s) => s < pageSizeParam);
          for (const size of fallbackSizes) {
            try {
              console.log(`🔁 Falling back to smaller page size (${size}) for first page...`);
              const pkg = await fetchReleases(page, size);
              const releases = pkg.releases || [];
              if (!releases.length) {
                console.log(`ℹ️  No releases found for page ${page} with pageSize=${size}, stopping`);
                hasMore = false;
                break;
              }
              // Process with the smaller page size result
              for (const rel of releases) {
                const publishedAtIso: string | undefined = rel?.date;
                const closingIso: string | undefined = rel?.tender?.tenderPeriod?.endDate;
                const updatedAtIso: string | undefined = (rel?.tender?.documents || [])
                  .map((d: any) => d?.dateModified || d?.datePublished)
                  .filter(Boolean)
                  .sort()
                  .pop();

                // Enrichment via eTenders site API (if enabled and within limits)
                let enrichmentData = null;
                if (enableEnrichment && enrichmentCount < maxEnrichmentPerRun) {
                  const tenderNumber = deriveTenderNumber(rel?.tender);
                  if (tenderNumber) {
                    try {
                      enrichmentCount++;
                      console.log(`🔄 [${enrichmentCount}/${maxEnrichmentPerRun}] Enriching tender: ${tenderNumber}`);
                      enrichmentData = await enrichTenderFromEtenders(tenderNumber, RATE_LIMIT_DELAY_MS);
                      if (enrichmentData) {
                        enrichmentSuccess++;
                        console.log(`✅ Enriched tender ${tenderNumber}: province=${enrichmentData.province}, contact=${enrichmentData.contactEmail || 'N/A'}`);
                      } else {
                        enrichmentFailures++;
                        console.log(`⚠️  No enrichment data found for tender ${tenderNumber}`);
                      }
                    } catch (err) {
                      enrichmentFailures++;
                      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                      console.error(`❌ Enrichment failed for ${tenderNumber}: ${errorMsg}`);
                    }
                  } else {
                    console.log(`ℹ️  No tender number found for release ${rel?.ocid}`);
                  }
                } else if (!enableEnrichment) {
                  if (processed === 0) {
                    console.log(`ℹ️  Enrichment disabled (ENABLE_ENRICHMENT=false)`);
                  }
                } else if (enrichmentCount >= maxEnrichmentPerRun) {
                  if (enrichmentCount === maxEnrichmentPerRun) {
                    console.log(`⚠️  Enrichment limit reached (${maxEnrichmentPerRun}), skipping further enrichments`);
                  }
                }

                const baseData = {
                  json: JSON.stringify(rel),
                  buyerName: rel?.buyer?.name || rel?.tender?.procuringEntity?.name || undefined,
                  tenderTitle: rel?.tender?.title || undefined,
                  tenderDescription: rel?.tender?.description || undefined,
                  mainCategory: rel?.tender?.mainProcurementCategory || undefined,
                  closingAt: closingIso ? new Date(closingIso) : undefined,
                  status: rel?.tender?.status || undefined,
                  publishedAt: publishedAtIso ? new Date(publishedAtIso) : undefined,
                  updatedAt: updatedAtIso ? new Date(updatedAtIso) : undefined,
                  tenderType: enrichmentData?.tenderType || rel?.tender?.procurementMethodDetails || rel?.tender?.procurementMethod || undefined,
                };

                const enrichmentFields = enrichmentData ? {
                  province: enrichmentData.province || undefined,
                  deliveryLocation: enrichmentData.deliveryLocation || undefined,
                  specialConditions: enrichmentData.specialConditions || undefined,
                  contactPerson: enrichmentData.contactPerson || undefined,
                  contactEmail: enrichmentData.contactEmail || undefined,
                  contactTelephone: enrichmentData.contactTelephone || undefined,
                  briefingDate: enrichmentData.briefingDate || undefined,
                  briefingTime: enrichmentData.briefingTime || undefined,
                  briefingVenue: enrichmentData.briefingVenue || undefined,
                  briefingMeetingLink: enrichmentData.briefingMeetingLink || undefined,
                } : {};

                const existing = await prisma.oCDSRelease.findUnique({
                  where: { ocid_date: { ocid: String(rel.ocid), date: publishedAtIso ? new Date(publishedAtIso) : new Date() } },
                });
                
                await prisma.oCDSRelease.upsert({
                  where: { ocid_date: { ocid: String(rel.ocid), date: publishedAtIso ? new Date(publishedAtIso) : new Date() } },
                  update: {
                    ...baseData,
                    ...enrichmentFields,
                  },
                  create: {
                    ocid: String(rel.ocid),
                    releaseId: String(rel.id),
                    date: publishedAtIso ? new Date(publishedAtIso) : new Date(),
                    tag: JSON.stringify(rel?.tag || ['compiled']),
                    ...baseData,
                    ...enrichmentFields,
                  },
                });
                
                if (existing) {
                  updated += 1;
                } else {
                  added += 1;
                }
                processed += 1;
                
                if (processed % 10 === 0) {
                  console.log(`📊 Progress: ${processed} processed (${added} added, ${updated} updated, ${enrichmentCount} enriched)`);
                }
              }

              // With fallback fetch, do not assume there is a next link; rely on links
              hasMore = Boolean(pkg.links?.next);
              page += 1;
              pagesThisBatch += 1;
              // Successfully processed with smaller size, continue outer loop
              // Break out of fallback loop
              break;
            } catch (fallbackErr) {
              console.error(`⚠️  Fallback with pageSize=${size} failed: ${fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error'}`);
              // Try next fallback size
            }
          }
          if (pagesThisBatch === 0) {
            console.error(`❌ All fallbacks failed for first page. Aborting sync.`);
            throw fetchError;
          }
          // Continue to next iteration if fallback succeeded
          continue;
        }
        console.error(`⚠️  Failed to fetch page ${page}, skipping to next batch:`, fetchError instanceof Error ? fetchError.message : 'Unknown error');
        // For enrichment test, be lenient - process what we have
        hasMore = false;
        break;
      }
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
  
  console.log(`✅ Sync completed in ${duration}ms:`);
  console.log(`   - Processed: ${processed} records`);
  console.log(`   - Added: ${added}`);
  console.log(`   - Updated: ${updated}`);
  if (enableEnrichment) {
    console.log(`   - Enrichment: ${enrichmentSuccess}/${enrichmentCount} successful (${enrichmentFailures} failed)`);
  }
  
  return {
    success: true,
    recordsProcessed: processed,
    recordsAdded: added,
    recordsUpdated: updated,
    duration,
    enrichmentCount: enableEnrichment ? enrichmentCount : undefined,
    enrichmentSuccess: enableEnrichment ? enrichmentSuccess : undefined,
    enrichmentFailures: enableEnrichment ? enrichmentFailures : undefined,
    skippedNoEnrichment: requireEnrichment ? skippedNoEnrichment : undefined,
  };
}
