/**
 * Get Tender by ID API Route
 * GET /api/tenders/[id]
 *
 * Migrated from TenderAPI Express route
 * Returns full tender details including raw OCDS JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface NormalizedTender {
  id: string;
  ocid?: string;
  title: string;
  displayTitle?: string;
  description?: string;
  buyerName?: string;
  mainProcurementCategory?: string;
  closingDate?: string;
  submissionMethods?: string[];
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
  previousClosingDate?: string | null;
  dataQualityScore: number;
  raw?: unknown;
}

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

    // Query local DB for the most recent release of this tender
    const release = await prisma.oCDSRelease.findFirst({
      where: { ocid: id },
      orderBy: { date: 'desc' }, // Most recent release
    });

    if (!release) {
      console.log(`❌ Tender not found: ${id}`);
      return NextResponse.json(
        {
          error: 'Tender not found',
          message: `No tender found with ID: ${id}`,
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

    // Build normalized tender response
    const tender: NormalizedTender = {
      id: release.ocid,
      ocid: release.ocid,
      title: release.tenderTitle || release.ocid,
      displayTitle: release.tenderDisplayTitle || undefined,
      description: release.tenderDescription || undefined,
      buyerName: release.buyerName || undefined,
      mainProcurementCategory: release.mainCategory || undefined,
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
