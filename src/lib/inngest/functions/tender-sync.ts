/**
 * Inngest Function: Tender Sync
 *
 * Replaces the cron sync route (/api/cron/sync) with a durable, step-based execution.
 * Handles OCDS API fetching, enrichment, and database updates without timeout constraints.
 *
 * Benefits over API route:
 * - No 5-minute timeout limit
 * - Automatic retries with exponential backoff
 * - Step-based execution (can resume from failure)
 * - No database connection pool exhaustion
 * - Built-in monitoring and observability
 */

import { inngest } from '../client';
import { prisma } from '@/lib/prisma';
import { enrichTenderFromEtenders } from '@/lib/enrichment/etendersEnricher';
import { generateSlug } from '@/lib/utils/slug';
import {
  RATE_LIMIT_DELAY_MS,
  DEFAULT_MAX_ENRICHMENT_PER_RUN,
  OCDS_API_BASE,
} from '@/lib/enrichment/constants';

interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  enrichmentCount: number;
  enrichmentSuccess: number;
  enrichmentFailures: number;
  skippedNoEnrichment: number;
  duration: number;
}

/**
 * Main tender sync function
 *
 * Triggered by: 'tender/sync.requested' event
 * Sent from: GitHub Actions cron, admin dashboard
 */
export const tenderSyncFunction = inngest.createFunction(
  {
    id: 'tender-sync',
    name: 'Tender Sync - OCDS Data Ingestion',
    // Retries: Automatic with exponential backoff for external API failures
    // Wait times: 1min, 5min, 15min (good for API outages that may self-resolve)
    retries: 3,
    onFailure: async ({ error }) => {
      // Log external API failures for monitoring
      if (error.name?.includes('ExternalAPI')) {
        console.error(`🚨 External OCDS API failure after all retries: ${error.message}`);
      } else {
        console.error(`🚨 Application error in tender sync: ${error.message}`);
      }
    },
    // Concurrency: Only 1 sync at a time to avoid conflicts
    concurrency: {
      limit: 1,
    },
  },
  { event: 'tender/sync.requested' },
  async ({ event, step }) => {
    const startTime = Date.now();
    const {
      maxEnrichment = DEFAULT_MAX_ENRICHMENT_PER_RUN,
      fromDate,
      toDate,
      requireEnrichment = false,
      triggeredBy = 'cron',
    } = event.data;

    // Step 1: Create job log
    const job = await step.run('create-job-log', async () => {
      return await prisma.jobLog.create({
        data: {
          type: 'DELTA_SYNC',
          status: 'RUNNING',
          startedAt: new Date(),
          metadata: JSON.stringify({
            source: 'inngest',
            triggeredBy,
            maxEnrichment,
          }),
        },
      });
    });

    try {
      // Step 2: Determine date range
      const dateRange = await step.run('determine-date-range', async () => {
        const syncStateId = 'ocds_etenders_sa';
        const existingState = await prisma.syncState.findUnique({
          where: { id: syncStateId },
        });

        const now = new Date();
        const from = fromDate
          ? new Date(fromDate)
          : existingState?.lastSyncedDate ?? new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const to = toDate ? new Date(toDate) : now;

        // Update lastRunAt to track when sync started
        await prisma.syncState.upsert({
          where: { id: syncStateId },
          update: {
            lastRunAt: now,
          },
          create: {
            id: syncStateId,
            lastRunAt: now,
          },
        });

        return {
          fromDate: from,
          toDate: to,
          fromStr: from.toISOString().slice(0, 10),
          toStr: to.toISOString().slice(0, 10),
        };
      });

      // Step 3: Health check - Test API availability before full sync
      const apiHealth = await step.run('check-api-health', async () => {
        const base = `${(OCDS_API_BASE || 'https://ocds-api.etenders.gov.za').replace(/\/$/, '')}/api/OCDSReleases`;
        const healthUrl = `${base}?PageNumber=1&PageSize=1&dateFrom=${dateRange.fromStr}&dateTo=${dateRange.toStr}`;

        console.log(`🏥 Checking OCDS API health: ${healthUrl}`);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for health check

          const res = await fetch(healthUrl, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            return {
              healthy: false,
              status: res.status,
              statusText: res.statusText,
              error: `External API returned ${res.status} ${res.statusText}`,
            };
          }

          console.log(`✅ API health check passed`);
          return { healthy: true, status: res.status, statusText: res.statusText, error: null };
        } catch (err: any) {
          return {
            healthy: false,
            status: 0,
            statusText: 'Network Error',
            error: err.name === 'AbortError'
              ? 'External API timeout - no response within 15 seconds'
              : `External API network error: ${err.message}`,
          };
        }
      });

      // If API is unhealthy, fail gracefully with clear messaging
      if (!apiHealth.healthy) {
        const externalApiError = new Error(
          `External OCDS API is unavailable: ${apiHealth.error}. This is an infrastructure issue on the eTenders.gov.za side, not a ProTenders application error.`
        );
        externalApiError.name = 'ExternalAPIError';

        await step.run('update-job-log-external-api-failure', async () => {
          await prisma.jobLog.update({
            where: { id: job.id },
            data: {
              status: 'FAILED',
              finishedAt: new Date(),
              note: `External API Unavailable: ${apiHealth.error}. The eTenders OCDS API is experiencing issues. This will auto-retry.`,
              metadata: JSON.stringify({
                source: 'inngest',
                triggeredBy,
                failureType: 'EXTERNAL_API_UNAVAILABLE',
                apiStatus: apiHealth.status,
                apiError: apiHealth.error,
              }),
            },
          });
        });

        throw externalApiError;
      }

      // Step 4: Fetch OCDS releases (with retry)
      const releases = await step.run('fetch-ocds-releases', async () => {
        const base = `${(OCDS_API_BASE || 'https://ocds-api.etenders.gov.za').replace(/\/$/, '')}/api/OCDSReleases`;
        const url = `${base}?PageNumber=1&PageSize=2000&dateFrom=${dateRange.fromStr}&dateTo=${dateRange.toStr}`;

        console.log(`📡 Fetching OCDS releases: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        try {
          const res = await fetch(url, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            const error = new Error(
              `External OCDS API error: ${res.status} ${res.statusText}. This is an eTenders.gov.za infrastructure issue.`
            );
            error.name = 'ExternalAPIError';
            throw error;
          }

          const data = await res.json();
          const releasesData = data.releases || [];
          console.log(`✅ Fetched ${releasesData.length} releases`);
          return releasesData;
        } catch (err: any) {
          clearTimeout(timeoutId);

          // Wrap network errors to distinguish from app errors
          if (err.name === 'AbortError') {
            const timeoutError = new Error(
              'External OCDS API timeout after 60 seconds. The eTenders API is slow or unresponsive.'
            );
            timeoutError.name = 'ExternalAPITimeout';
            throw timeoutError;
          }

          if (err.name !== 'ExternalAPIError') {
            const networkError = new Error(
              `External OCDS API network failure: ${err.message}`
            );
            networkError.name = 'ExternalAPINetworkError';
            throw networkError;
          }

          throw err;
        }
      });

      // Step 5: Determine enrichment strategy
      const enrichmentConfig = await step.run('configure-enrichment', async () => {
        const enableEnrichment = process.env.ENABLE_ENRICHMENT === 'true';

        if (!enableEnrichment) {
          return {
            enabled: false,
            maxEnrichment: 0,
            releasesToEnrich: [],
          };
        }

        // Identify which releases need enrichment (new ones without tender numbers yet)
        const releasesToEnrich = [];
        let count = 0;

        for (const rel of releases) {
          if (count >= maxEnrichment) break;

          const tenderNumber = deriveTenderNumber(rel?.tender);
          if (!tenderNumber) continue;

          const publishedAt = rel?.date ? new Date(rel.date) : new Date();

          // Check if exists in DB
          const existing = await prisma.oCDSRelease.findUnique({
            where: {
              ocid_date: {
                ocid: String(rel.ocid),
                date: publishedAt,
              },
            },
            select: { detailedCategory: true },
          });

          // Enrich if new or missing detailedCategory
          if (!existing || !existing.detailedCategory) {
            releasesToEnrich.push({
              release: rel,
              tenderNumber,
              publishedAt,
            });
            count++;
          }
        }

        console.log(`📊 Will enrich ${releasesToEnrich.length} tenders (max: ${maxEnrichment})`);

        return {
          enabled: true,
          maxEnrichment,
          releasesToEnrich,
        };
      });

      // Step 6: Enrich tenders (parallel steps for each tender)
      const enrichmentResults = await Promise.all(
        enrichmentConfig.releasesToEnrich.map((item, index) =>
          step.run(`enrich-tender-${index}`, async () => {
            try {
              const { release, tenderNumber } = item;

              console.log(`🔄 [${index + 1}/${enrichmentConfig.releasesToEnrich.length}] Enriching: ${tenderNumber}`);

              const buyerName = release?.buyer?.name || release?.tender?.procuringEntity?.name;
              const title = release?.tender?.title;
              const tenderIdHint =
                typeof release?.tender?.id === 'string'
                  ? release.tender.id
                  : release?.tender?.id != null
                  ? String(release.tender.id)
                  : undefined;

              const enrichmentData = await enrichTenderFromEtenders(tenderNumber, RATE_LIMIT_DELAY_MS, {
                buyerName,
                title,
                tenderIdHint,
              });

              if (enrichmentData) {
                console.log(
                  `✅ Enriched ${tenderNumber}: ${enrichmentData.province || 'N/A'} - ${enrichmentData.detailedCategory || 'N/A'}`
                );
                return { success: true, enrichmentData, release };
              } else {
                console.log(`⚠️  No enrichment data for ${tenderNumber}`);
                return { success: false, enrichmentData: null, release };
              }
            } catch (err) {
              console.error(`❌ Enrichment failed:`, err);
              return { success: false, enrichmentData: null, release: item.release, error: err };
            }
          })
        )
      );

      // Step 7: Save to database (batch upsert)
      const dbResults = await step.run('save-to-database', async () => {
        let added = 0;
        let updated = 0;
        let skipped = 0;

        // Merge enriched data with original releases
        const enrichmentMap = new Map();
        for (let i = 0; i < enrichmentResults.length; i++) {
          const result = enrichmentResults[i];
          if (result.success && result.enrichmentData) {
            const rel = enrichmentConfig.releasesToEnrich[i].release;
            enrichmentMap.set(rel.ocid, result.enrichmentData);
          }
        }

        // Process all releases (enriched and non-enriched)
        for (const rel of releases) {
          const publishedAt = rel?.date ? new Date(rel.date) : new Date();
          const closingIso = rel?.tender?.tenderPeriod?.endDate;
          const updatedAtIso = (rel?.tender?.documents || [])
            .map((d: any) => d?.dateModified || d?.datePublished)
            .filter(Boolean)
            .sort()
            .pop();

          const enrichmentData = enrichmentMap.get(rel.ocid) || null;

          // Generate slug - MUST be unique across all records
          // Include date hash to avoid collisions when same OCID has multiple versions
          const title = rel?.tender?.title || '';
          const description = rel?.tender?.description || '';
          const textForSlug = description && description.trim().length > 10 ? description : title;
          let baseSlug = generateSlug(textForSlug);

          if (baseSlug.length > 70) {
            baseSlug = baseSlug.slice(0, 70).replace(/-+$/, '');
          }

          // Include date hash to ensure uniqueness for same OCID with different dates
          const dateHash = publishedAt.getTime().toString(36).slice(-6);
          const slug =
            textForSlug && textForSlug.trim().length > 0
              ? `${baseSlug}-${dateHash}-${rel.ocid}`
              : `${rel.ocid}-${dateHash}`;

          const baseData = {
            json: JSON.stringify(rel),
            buyerName: rel?.buyer?.name || rel?.tender?.procuringEntity?.name || undefined,
            tenderTitle: rel?.tender?.title || undefined,
            tenderDescription: rel?.tender?.description || undefined,
            mainCategory: rel?.tender?.mainProcurementCategory || undefined,
            closingAt: closingIso ? new Date(closingIso) : undefined,
            status: rel?.tender?.status || undefined,
            publishedAt: publishedAt,
            updatedAt: updatedAtIso ? new Date(updatedAtIso) : undefined,
            tenderType:
              enrichmentData?.tenderType ||
              rel?.tender?.procurementMethodDetails ||
              rel?.tender?.procurementMethod ||
              undefined,
            slug: slug,
          };

          const enrichmentFields = enrichmentData
            ? {
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
                hasBriefing:
                  typeof enrichmentData.hasBriefing === 'boolean'
                    ? enrichmentData.hasBriefing
                    : undefined,
                briefingCompulsory:
                  typeof enrichmentData.briefingCompulsory === 'boolean'
                    ? enrichmentData.briefingCompulsory
                    : undefined,
                detailedCategory: enrichmentData.detailedCategory || undefined,
                enrichmentDocuments: Array.isArray(enrichmentData.documents)
                  ? (enrichmentData.documents as any)
                  : undefined,
                organOfStateType: enrichmentData.organOfStateType || undefined,
                municipalityType: enrichmentData.municipalityType || undefined,
                departmentLevel: enrichmentData.departmentLevel || undefined,
                hasESubmission:
                  typeof enrichmentData.hasESubmission === 'boolean'
                    ? enrichmentData.hasESubmission
                    : undefined,
                estimatedValueMin: enrichmentData.estimatedValueMin ?? undefined,
                estimatedValueMax: enrichmentData.estimatedValueMax ?? undefined,
                documentCount:
                  typeof enrichmentData.documentCount === 'number'
                    ? enrichmentData.documentCount
                    : undefined,
                hasDocuments:
                  typeof enrichmentData.hasDocuments === 'boolean'
                    ? enrichmentData.hasDocuments
                    : undefined,
                city: enrichmentData.city || undefined,
                district: enrichmentData.district || undefined,
                tenderTypeCategory: enrichmentData.tenderTypeCategory || undefined,
                dataQualityScore:
                  typeof enrichmentData.dataQualityScore === 'number'
                    ? enrichmentData.dataQualityScore
                    : undefined,
                tenderDisplayTitle: enrichmentData.displayTitle || undefined,
                enrichedAt: new Date(),
              }
            : {};

          // Check if exists
          const existing = await prisma.oCDSRelease.findUnique({
            where: {
              ocid_date: {
                ocid: String(rel.ocid),
                date: publishedAt,
              },
            },
            select: { ocid: true },
          });

          // Skip if requireEnrichment and no enrichment data
          if (!existing && requireEnrichment && !enrichmentData) {
            skipped++;
            continue;
          }

          // Upsert
          await prisma.oCDSRelease.upsert({
            where: {
              ocid_date: {
                ocid: String(rel.ocid),
                date: publishedAt,
              },
            },
            update: {
              ...baseData,
              ...enrichmentFields,
            },
            create: {
              ocid: String(rel.ocid),
              releaseId: String(rel.id),
              date: publishedAt,
              tag: JSON.stringify(rel?.tag || ['compiled']),
              ...baseData,
              ...enrichmentFields,
            },
          });

          if (existing) {
            updated++;
          } else {
            added++;
          }
        }

        return { added, updated, skipped };
      });

      // Step 8: Update sync state cursor
      await step.run('update-sync-state', async () => {
        const syncStateId = 'ocds_etenders_sa';
        const now = new Date();
        await prisma.syncState.upsert({
          where: { id: syncStateId },
          update: {
            lastSyncedDate: dateRange.toDate,
            lastSuccessAt: now,
            updatedAt: now,
          },
          create: {
            id: syncStateId,
            lastSyncedDate: dateRange.toDate,
            lastSuccessAt: now,
          },
        });
      });

      // Calculate stats
      const enrichmentSuccess = enrichmentResults.filter((r) => r.success).length;
      const enrichmentFailures = enrichmentResults.filter((r) => !r.success).length;
      const duration = Date.now() - startTime;

      const result: SyncResult = {
        success: true,
        recordsProcessed: releases.length,
        recordsAdded: dbResults.added,
        recordsUpdated: dbResults.updated,
        enrichmentCount: enrichmentResults.length,
        enrichmentSuccess,
        enrichmentFailures,
        skippedNoEnrichment: dbResults.skipped,
        duration,
      };

      // Step 9: Update job log with success
      await step.run('update-job-log-success', async () => {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: 'SUCCESS',
            finishedAt: new Date(),
            note: `Processed ${result.recordsProcessed} records (${result.recordsAdded} added, ${result.recordsUpdated} updated)${result.enrichmentCount ? `, enriched ${result.enrichmentSuccess}/${result.enrichmentCount} tenders` : ''}`,
            metadata: JSON.stringify(result),
          },
        });
      });

      console.log(`✅ Sync completed in ${duration}ms`);
      return result;
    } catch (error: any) {
      // Categorize the error type for better debugging
      const isExternalAPIError = error.name?.includes('ExternalAPI') || error.name?.includes('ExternalAPITimeout');
      const errorCategory = isExternalAPIError ? 'EXTERNAL_API_FAILURE' : 'APPLICATION_ERROR';

      // Update job log with categorized failure
      await step.run('update-job-log-failure', async () => {
        const errorMessage = error instanceof Error ? error.message : 'Sync failed';
        const userFriendlyNote = isExternalAPIError
          ? `External API Issue: ${errorMessage.split('.')[0]}. This is not a ProTenders error - the eTenders API is experiencing problems.`
          : `Application Error: ${errorMessage}`;

        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            finishedAt: new Date(),
            note: userFriendlyNote,
            metadata: JSON.stringify({
              source: 'inngest',
              triggeredBy,
              errorCategory,
              errorName: error.name,
              errorMessage: errorMessage,
              isExternalAPIError,
            }),
          },
        });
      });

      throw error;
    }
  }
);

/**
 * Helper: Derive tender number from release
 */
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
