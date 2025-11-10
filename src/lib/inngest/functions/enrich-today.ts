/**
 * Inngest Function: Enrich Today's Tenders
 *
 * Enriches tenders from today that are missing detailed category information.
 * Triggered manually from the admin dashboard.
 *
 * Benefits:
 * - No timeout constraints (can run for hours if needed)
 * - Automatic retries on failure
 * - Step-based execution with progress tracking
 * - No database connection pool exhaustion
 */

import { inngest } from '../client';
import { prisma } from '@/lib/prisma';
import { enrichTenderFromEtenders } from '@/lib/enrichment/etendersEnricher';
import { RATE_LIMIT_DELAY_MS, DEFAULT_MAX_ENRICHMENT_PER_RUN } from '@/lib/enrichment/constants';

interface EnrichTodayResult {
  success: boolean;
  tendersProcessed: number;
  tendersEnriched: number;
  failures: number;
  duration: number;
}

/**
 * Enrich today's tenders function
 *
 * Triggered by: 'tender/enrich-today.requested' event
 * Sent from: Admin dashboard
 */
export const enrichTodayFunction = inngest.createFunction(
  {
    id: 'enrich-today',
    name: 'Enrich Today\'s Tenders',
    retries: 2,
    // Allow multiple enrichment jobs to run (but with concurrency limit)
    concurrency: {
      limit: 2,
    },
  },
  { event: 'tender/enrich-today.requested' },
  async ({ event, step }) => {
    const startTime = Date.now();
    const {
      maxEnrichment = parseInt(
        process.env.MAX_ENRICHMENT_PER_RUN || String(DEFAULT_MAX_ENRICHMENT_PER_RUN),
        10
      ),
      rateLimit = RATE_LIMIT_DELAY_MS,
      adminUserId,
    } = event.data;

    // Step 1: Create job log
    const job = await step.run('create-job-log', async () => {
      return await prisma.jobLog.create({
        data: {
          type: 'ENRICHMENT_MANUAL',
          status: 'RUNNING',
          startedAt: new Date(),
          metadata: JSON.stringify({
            source: 'inngest',
            triggeredBy: 'admin',
            adminUserId,
            maxEnrichment,
          }),
        },
      });
    });

    try {
      // Step 2: Find today's tenders missing detailedCategory
      const tendersToEnrich = await step.run('find-tenders-to-enrich', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tenders = await prisma.oCDSRelease.findMany({
          where: {
            publishedAt: {
              gte: today,
            },
            detailedCategory: null,
          },
          select: {
            ocid: true,
            date: true,
            json: true,
          },
          take: maxEnrichment,
          orderBy: {
            publishedAt: 'desc',
          },
        });

        console.log(`📊 Found ${tenders.length} tenders from today missing detailedCategory`);

        return tenders.map((tender) => {
          const release = JSON.parse(tender.json as string);
          return {
            ocid: tender.ocid,
            publishedAt: tender.date,
            release,
            tenderNumber: deriveTenderNumber(release?.tender),
          };
        });
      });

      // Filter out tenders without tender numbers
      const enrichableTenders = tendersToEnrich.filter((t) => t.tenderNumber);
      console.log(`📊 ${enrichableTenders.length} tenders have valid tender numbers`);

      // Step 3: Enrich each tender (parallel execution with rate limiting)
      const enrichmentResults = await Promise.all(
        enrichableTenders.map((tender, index) =>
          step.run(`enrich-tender-${index}`, async () => {
            try {
              console.log(
                `🔄 [${index + 1}/${enrichableTenders.length}] Enriching: ${tender.tenderNumber}`
              );

              const buyerName =
                tender.release?.buyer?.name || tender.release?.tender?.procuringEntity?.name;
              const title = tender.release?.tender?.title;
              const tenderIdHint =
                typeof tender.release?.tender?.id === 'string'
                  ? tender.release.tender.id
                  : tender.release?.tender?.id != null
                  ? String(tender.release.tender.id)
                  : undefined;

              // Add rate limit delay
              if (index > 0) {
                await new Promise((resolve) => setTimeout(resolve, rateLimit));
              }

              const enrichmentData = await enrichTenderFromEtenders(
                tender.tenderNumber!,
                rateLimit,
                {
                  buyerName,
                  title,
                  tenderIdHint,
                }
              );

              if (enrichmentData) {
                // Update the tender with enrichment data
                await prisma.oCDSRelease.update({
                  where: {
                    ocid_date: {
                      ocid: tender.ocid,
                      date: tender.publishedAt,
                    },
                  },
                  data: {
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
                    enrichedAt: new Date(),
                  },
                });

                console.log(
                  `✅ Enriched ${tender.tenderNumber}: ${enrichmentData.province || 'N/A'} - ${enrichmentData.detailedCategory || 'N/A'}`
                );
                return { success: true, tenderNumber: tender.tenderNumber };
              } else {
                console.log(`⚠️  No enrichment data for ${tender.tenderNumber}`);
                return { success: false, tenderNumber: tender.tenderNumber };
              }
            } catch (err) {
              console.error(`❌ Enrichment failed for ${tender.tenderNumber}:`, err);
              return { success: false, tenderNumber: tender.tenderNumber, error: err };
            }
          })
        )
      );

      // Calculate stats
      const tendersEnriched = enrichmentResults.filter((r) => r.success).length;
      const failures = enrichmentResults.filter((r) => !r.success).length;
      const duration = Date.now() - startTime;

      const result: EnrichTodayResult = {
        success: true,
        tendersProcessed: enrichableTenders.length,
        tendersEnriched,
        failures,
        duration,
      };

      // Step 4: Update job log with success
      await step.run('update-job-log-success', async () => {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: 'SUCCESS',
            finishedAt: new Date(),
            note: `Enriched ${tendersEnriched}/${enrichableTenders.length} tenders from today (${failures} failures)`,
            metadata: JSON.stringify(result),
          },
        });
      });

      console.log(
        `✅ Enrichment completed: ${tendersEnriched}/${enrichableTenders.length} tenders enriched in ${duration}ms`
      );
      return result;
    } catch (error) {
      // Update job log with failure
      await step.run('update-job-log-failure', async () => {
        await prisma.jobLog.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            finishedAt: new Date(),
            note: error instanceof Error ? error.message : 'Enrichment failed',
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
