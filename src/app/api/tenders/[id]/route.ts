/**
 * Get Tender by ID API Route
 * GET /api/tenders/[id]
 *
 * Migrated from TenderAPI Express route
 * Returns full tender details including raw OCDS JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { enrichTenderFromEtenders } from '@/lib/enrichment/etendersEnricher';
import { findTenderBySlugOrId } from '@/lib/utils/tender-lookup';

// Enable caching for tender details (revalidate every 1 hour)
export const revalidate = 3600;
export const runtime = 'nodejs';

interface NormalizedTender {
  id: string;
  ocid?: string;
  title: string;
  displayTitle?: string;
  description?: string;
  buyerName?: string;
  mainProcurementCategory?: string;
  detailedCategory?: string;
  closingDate?: string;
  submissionMethods?: string[];
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
  previousClosingDate?: string | null;
  dataQualityScore: number;
  raw?: unknown;
  enrichment?: {
    province?: string;
    deliveryLocation?: string;
    specialConditions?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactTelephone?: string;
    briefingDate?: string;
    briefingTime?: string;
    briefingVenue?: string;
    briefingMeetingLink?: string;
    tenderType?: string;
    hasBriefing?: boolean;
    briefingCompulsory?: boolean;
    documents?: Array<{
      id?: string;
      title?: string;
      url?: string;
      datePublished?: string;
      dateModified?: string;
      format?: string;
    }>;
  };
}

/**
 * Cached tender lookup function
 * Reduces database queries for frequently accessed tenders
 */
const getCachedTender = unstable_cache(
  async (id: string) => {
    return await findTenderBySlugOrId(id);
  },
  ['tender-by-id'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['tenders'],
  }
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();

  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Invalid tender ID',
          message: 'Tender ID must be a valid string',
        },
        { status: 400 }
      );
    }

    console.log(`📊 Fetching tender details for: ${id}`);

    // Try to find by slug or ID (supports both OCID and slug-based URLs)
    // Use cached version for better performance
    let release = await getCachedTender(id);

    if (!release) {
      console.log(`❌ Tender not found: ${id}`);
      return NextResponse.json(
        {
          error: 'Tender not found',
          message: `No tender found with ID or slug: ${id}`,
        },
        { status: 404 }
      );
    }

    // Parse the full OCDS JSON
    let rawData: unknown;
    try {
      rawData = JSON.parse(release.json);
    } catch (error) {
      console.error(`Error parsing JSON for tender ${id}:`, error);
      rawData = null;
    }

    const enrichment = {
      province: release.province || undefined,
      deliveryLocation: release.deliveryLocation || undefined,
      specialConditions: release.specialConditions || undefined,
      contactPerson: release.contactPerson || undefined,
      contactEmail: release.contactEmail || undefined,
      contactTelephone: release.contactTelephone || undefined,
      briefingDate: release.briefingDate || undefined,
      briefingTime: release.briefingTime || undefined,
      briefingVenue: release.briefingVenue || undefined,
      briefingMeetingLink: release.briefingMeetingLink || undefined,
      tenderType: release.tenderType || undefined,
      hasBriefing: typeof release.hasBriefing === 'boolean' ? release.hasBriefing : ((release.briefingDate || release.briefingVenue) ? true : undefined),
      briefingCompulsory: typeof release.briefingCompulsory === 'boolean' ? release.briefingCompulsory : undefined,
      documents: Array.isArray((release as any).enrichmentDocuments) ? ((release as any).enrichmentDocuments as any[]) : undefined,
    };

    // Attach enrichment to raw payload for consumers that rely on raw
    if (rawData && typeof rawData === 'object') {
      try {
        (rawData as any).__enrichment = enrichment;
      } catch {}
    }

    // Cache-first enrichment strategy: Check if we already have enriched data
    // Expected performance improvement: 500-1000ms reduction (avoids blocking external API call)
    try {
      const raw = rawData as any;
      const buyerNameCtx = raw?.buyer?.name || raw?.tender?.procuringEntity?.name || undefined;
      const titleCtx = raw?.tender?.title || undefined;
      const tenderIdHint = raw?.tender?.id != null ? String(raw?.tender?.id) : undefined;

      // Check if we have cached enrichment data
      const CACHE_VALIDITY_HOURS = 24; // How fresh the cache needs to be
      const cacheIsValid = release.enrichedAt &&
        (Date.now() - release.enrichedAt.getTime() < CACHE_VALIDITY_HOURS * 60 * 60 * 1000);

      // Parse cached briefing flags and documents from JSON fields
      let cachedBriefingFlags: any = null;
      let cachedDocumentUrls: any = null;

      if (cacheIsValid && release.briefingFlags) {
        try {
          cachedBriefingFlags = typeof release.briefingFlags === 'string'
            ? JSON.parse(release.briefingFlags)
            : release.briefingFlags;
        } catch {}
      }

      if (cacheIsValid && release.documentUrls) {
        try {
          cachedDocumentUrls = typeof release.documentUrls === 'string'
            ? JSON.parse(release.documentUrls)
            : release.documentUrls;
        } catch {}
      }

      // Use cached data if available and valid
      if (cacheIsValid && cachedBriefingFlags) {
        enrichment.hasBriefing = cachedBriefingFlags.hasBriefing ?? enrichment.hasBriefing;
        enrichment.briefingCompulsory = cachedBriefingFlags.briefingCompulsory ?? enrichment.briefingCompulsory;
      }

      if (cacheIsValid && cachedDocumentUrls && Array.isArray(cachedDocumentUrls)) {
        enrichment.documents = cachedDocumentUrls;
      }

      // Only make external API call if cache is missing or stale
      const needBriefingFlags = enrichment.briefingCompulsory === undefined || enrichment.hasBriefing === undefined;
      const needDocs = !Array.isArray(enrichment.documents);

      if (!cacheIsValid && (needBriefingFlags || needDocs)) {
        const title = typeof titleCtx === 'string' ? titleCtx.trim() : '';
        let tenderNumber: string | null = null;
        if (title) {
          let m = title.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i);
          if (m) tenderNumber = (m[0] || title).replace(/\s+/g, '');
          if (!tenderNumber) {
            m = title.match(/([A-Z0-9/\.-]{3,})[-_\s:/]*(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)\b/i);
            if (m) tenderNumber = (m[0] || title).replace(/\s+/g, '');
          }
        }
        if (!tenderNumber && tenderIdHint) tenderNumber = tenderIdHint;

        if (tenderNumber || titleCtx || tenderIdHint) {
          console.log(`🔄 Cache miss/stale - fetching fresh enrichment data for: ${release.ocid}`);
          const live = await enrichTenderFromEtenders(tenderNumber || titleCtx || tenderIdHint, 300, {
            buyerName: buyerNameCtx,
            title: titleCtx,
            tenderIdHint,
          });

          if (live) {
            enrichment.briefingCompulsory = live.briefingCompulsory ?? enrichment.briefingCompulsory;
            enrichment.hasBriefing = (live.hasBriefing ?? enrichment.hasBriefing) as any;
            enrichment.documents = live.documents || enrichment.documents;
            enrichment.tenderType = enrichment.tenderType || live.tenderType;
            enrichment.province = enrichment.province || live.province;
            enrichment.deliveryLocation = enrichment.deliveryLocation || live.deliveryLocation;
            enrichment.contactPerson = enrichment.contactPerson || live.contactPerson;
            enrichment.contactEmail = enrichment.contactEmail || live.contactEmail;
            enrichment.contactTelephone = enrichment.contactTelephone || live.contactTelephone;
            enrichment.briefingDate = enrichment.briefingDate || live.briefingDate;
            enrichment.briefingTime = enrichment.briefingTime || live.briefingTime;
            enrichment.briefingVenue = enrichment.briefingVenue || live.briefingVenue;
            enrichment.briefingMeetingLink = enrichment.briefingMeetingLink || live.briefingMeetingLink;

            // Cache the enriched data for future requests (fire-and-forget)
            prisma.oCDSRelease.update({
              where: { id: release.id },
              data: {
                enrichedAt: new Date(),
                briefingFlags: JSON.stringify({
                  hasBriefing: enrichment.hasBriefing,
                  briefingCompulsory: enrichment.briefingCompulsory,
                }),
                documentUrls: enrichment.documents ? JSON.stringify(enrichment.documents) : undefined,
              },
            }).catch(() => {}); // Best effort, don't block response
          }
        }
      } else if (cacheIsValid) {
        console.log(`✅ Cache hit - using cached enrichment for: ${release.ocid} (age: ${Math.round((Date.now() - release.enrichedAt!.getTime()) / 1000 / 60)}min)`);
      }
    } catch (e) {
      // best-effort, ignore errors
      console.error('⚠️  Enrichment cache-first strategy error:', e);
    }

    // Build normalized tender response
    const tender: NormalizedTender = {
      id: release.ocid,
      ocid: release.ocid,
      title: release.tenderTitle || release.ocid,
      displayTitle: release.tenderDisplayTitle || undefined,
      description: release.tenderDescription || undefined,
      buyerName: release.buyerName || undefined,
      mainProcurementCategory: release.mainCategory || undefined,
      detailedCategory: release.detailedCategory || undefined,
      closingDate: release.closingAt?.toISOString(),
      submissionMethods: release.submissionMethods
        ? JSON.parse(release.submissionMethods)
        : undefined,
      status: release.status || undefined,
      publishedAt: release.publishedAt?.toISOString(),
      updatedAt: release.updatedAt?.toISOString(),
      previousClosingDate: null, // Can be computed from timeline if needed
      dataQualityScore: 85, // Default score for now
      raw: rawData,
      enrichment,
    };

    const duration = Date.now() - startTime;

    // Add custom headers
    const headers = new Headers();
    headers.set('X-Data-Source', 'local-db');
    headers.set('X-Response-Time', `${duration}ms`);

    console.log(`✅ Tender fetched in ${duration}ms: ${release.tenderTitle}`);

    return NextResponse.json(tender, { headers });
  } catch (error) {
    console.error('❌ Error fetching tender:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch tender',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
