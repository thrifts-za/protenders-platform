/**
 * Batch Processor for Tender Enrichment
 *
 * Properly manages database connections by:
 * 1. Fetching data in batches (quick DB operation, connection released)
 * 2. Processing enrichment (external API, no DB connection held)
 * 3. Writing results in batches (quick DB operation, connection released)
 */

import { prisma } from '@/lib/prisma';
import { enrichTenderFromEtenders } from './etendersEnricher';
import { generateSlug } from '@/lib/utils/slug';

export interface TenderData {
  ocid: string;
  release: any;
  publishedAt: Date;
  shouldEnrich: boolean;
  tenderNumber: string | null;
}

export interface EnrichmentResult {
  ocid: string;
  release: any;
  enrichmentData: any | null;
  error?: string;
}

/**
 * Batch check which tenders need enrichment (comprehensive mode)
 * Quick DB query, connection released immediately after
 */
export async function checkTendersNeedingEnrichment(
  ocids: Array<{ ocid: string; publishedAt: Date }>
): Promise<Set<string>> {
  const needsEnrichment = new Set<string>();

  // Batch query - single DB connection, quick operation
  const existing = await prisma.oCDSRelease.findMany({
    where: {
      OR: ocids.map(({ ocid, publishedAt }) => ({
        AND: [
          { ocid },
          { date: publishedAt }
        ]
      }))
    },
    select: {
      ocid: true,
      date: true,
      detailedCategory: true,
    }
  });

  // Connection released here automatically

  // Mark tenders missing detailedCategory
  for (const record of existing) {
    if (!record.detailedCategory) {
      needsEnrichment.add(`${record.ocid}_${record.date.toISOString()}`);
    }
  }

  return needsEnrichment;
}

/**
 * Process enrichment for a batch of tenders
 * NO database connections held during this operation
 */
export async function enrichBatch(
  tenders: TenderData[],
  rateLimit: number,
  maxEnrichment: number
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = [];
  let enrichmentCount = 0;

  for (const tender of tenders) {
    if (!tender.shouldEnrich || !tender.tenderNumber || enrichmentCount >= maxEnrichment) {
      results.push({
        ocid: tender.ocid,
        release: tender.release,
        enrichmentData: null,
      });
      continue;
    }

    try {
      enrichmentCount++;
      console.log(`🔄 [${enrichmentCount}/${maxEnrichment}] Enriching: ${tender.tenderNumber}`);

      const rel = tender.release;
      const buyerNameCtx = rel?.buyer?.name || rel?.tender?.procuringEntity?.name;
      const titleCtx = rel?.tender?.title;
      const tenderIdHint = typeof rel?.tender?.id === 'string'
        ? rel.tender.id
        : (rel?.tender?.id != null ? String(rel.tender.id) : undefined);

      // External API call - NO DB CONNECTION HELD
      const enrichmentData = await enrichTenderFromEtenders(
        tender.tenderNumber,
        rateLimit,
        {
          buyerName: buyerNameCtx,
          title: titleCtx,
          tenderIdHint,
        }
      );

      results.push({
        ocid: tender.ocid,
        release: tender.release,
        enrichmentData,
      });

      if (enrichmentData) {
        console.log(`✅ Enriched ${tender.tenderNumber}: ${enrichmentData.province || 'N/A'}`);
      } else {
        console.log(`⚠️  No enrichment data for ${tender.tenderNumber}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Enrichment failed for ${tender.tenderNumber}: ${errorMsg}`);

      results.push({
        ocid: tender.ocid,
        release: tender.release,
        enrichmentData: null,
        error: errorMsg,
      });
    }
  }

  return results;
}

/**
 * Batch write enriched tenders to database
 * Quick DB operations with connection released after each small batch
 */
export async function writeBatch(
  results: EnrichmentResult[],
  requireEnrichment: boolean
): Promise<{ added: number; updated: number; skipped: number }> {
  let added = 0;
  let updated = 0;
  let skipped = 0;

  // Process in micro-batches to avoid long connection holds
  const MICRO_BATCH_SIZE = 5;

  for (let i = 0; i < results.length; i += MICRO_BATCH_SIZE) {
    const batch = results.slice(i, i + MICRO_BATCH_SIZE);

    // Quick batch write - connection held only during this operation
    for (const result of batch) {
      const rel = result.release;
      const enrichmentData = result.enrichmentData;

      const publishedAtIso: string | undefined = rel?.date;
      const closingIso: string | undefined = rel?.tender?.tenderPeriod?.endDate;
      const updatedAtIso: string | undefined = (rel?.tender?.documents || [])
        .map((d: any) => d?.dateModified || d?.datePublished)
        .filter(Boolean)
        .sort()
        .pop();

      // Generate slug
      const title = rel?.tender?.title || '';
      const description = rel?.tender?.description || '';
      const textForSlug = description && description.trim().length > 10 ? description : title;
      let baseSlug = generateSlug(textForSlug);

      if (baseSlug.length > 80) {
        baseSlug = baseSlug.slice(0, 80).replace(/-+$/, '');
      }

      const slug = textForSlug && textForSlug.trim().length > 0
        ? `${baseSlug}-${rel.ocid}`
        : rel.ocid;

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
        slug: slug,
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
        enrichmentDocuments: Array.isArray(enrichmentData.documents) ? enrichmentData.documents as any : undefined,
        // Phase 2 enhancement fields
        organOfStateType: enrichmentData.organOfStateType || undefined,
        municipalityType: enrichmentData.municipalityType || undefined,
        departmentLevel: enrichmentData.departmentLevel || undefined,
        hasESubmission: typeof enrichmentData.hasESubmission === 'boolean' ? enrichmentData.hasESubmission : undefined,
        estimatedValueMin: enrichmentData.estimatedValueMin ?? undefined,
        estimatedValueMax: enrichmentData.estimatedValueMax ?? undefined,
        documentCount: typeof enrichmentData.documentCount === 'number' ? enrichmentData.documentCount : undefined,
        hasDocuments: typeof enrichmentData.hasDocuments === 'boolean' ? enrichmentData.hasDocuments : undefined,
        city: enrichmentData.city || undefined,
        district: enrichmentData.district || undefined,
        tenderTypeCategory: enrichmentData.tenderTypeCategory || undefined,
        dataQualityScore: typeof enrichmentData.dataQualityScore === 'number' ? enrichmentData.dataQualityScore : undefined,
        enrichedAt: new Date(),
      } : {};

      // Quick check if exists
      const existing = await prisma.oCDSRelease.findUnique({
        where: {
          ocid_date: {
            ocid: String(rel.ocid),
            date: publishedAtIso ? new Date(publishedAtIso) : new Date()
          }
        },
        select: { ocid: true }
      });

      // Skip if requireEnrichment and no enrichment data
      if (!existing && requireEnrichment && !enrichmentData) {
        skipped++;
        console.log(`⏭️  Skipping ${rel?.ocid} (no enrichment, requireEnrichment=true)`);
        continue;
      }

      // Quick upsert
      await prisma.oCDSRelease.upsert({
        where: {
          ocid_date: {
            ocid: String(rel.ocid),
            date: publishedAtIso ? new Date(publishedAtIso) : new Date()
          }
        },
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
        updated++;
      } else {
        added++;
      }
    }

    // Connection automatically released after each micro-batch
    // Small delay between micro-batches to let other requests through
    if (i + MICRO_BATCH_SIZE < results.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  return { added, updated, skipped };
}
