/**
 * Tender Intelligence API Route
 * GET /api/tenders/:id/intel
 *
 * Returns AI-generated intelligence for a tender
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/tenders/:id/intel
 * Get intelligence data for a tender
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get tender features (opportunity score, data quality, etc.)
    const features = await prisma.tenderFeatures.findUnique({
      where: {
        ocid: id,
      },
    });

    // Get buyer stats if available
    const tender = await prisma.oCDSRelease.findFirst({
      where: {
        ocid: id,
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        buyerName: true,
        mainCategory: true,
      },
    });

    let buyerStats = null;
    if (tender?.buyerName) {
      buyerStats = await prisma.buyerStats.findUnique({
        where: {
          buyerName: tender.buyerName,
        },
      });
    }

    // Get category stats if available
    let categoryStats = null;
    if (tender?.mainCategory) {
      categoryStats = await prisma.categoryStats.findUnique({
        where: {
          category: tender.mainCategory,
        },
      });
    }

    // Get related tenders (if feature exists)
    let relatedTenders: any[] = [];
    if (features?.relatedOcids) {
      const relatedOcids = JSON.parse(features.relatedOcids);
      if (relatedOcids.length > 0) {
        const related = await prisma.oCDSRelease.findMany({
          where: {
            ocid: {
              in: relatedOcids.slice(0, 5), // Top 5 related
            },
          },
          select: {
            ocid: true,
            tenderTitle: true,
            buyerName: true,
            mainCategory: true,
            status: true,
            closingAt: true,
          },
        });

        relatedTenders = related.map(r => ({
          ocid: r.ocid,
          title: r.tenderTitle,
          buyer: r.buyerName,
          category: r.mainCategory,
          status: r.status,
          closingDate: r.closingAt?.toISOString(),
        }));
      }
    }

    // Build intelligence response
    const intelligence = {
      ocid: id,
      opportunityScore: features?.opportunityScore || null,
      dataQualityScore: features?.dataQualityScore || null,
      dataQualityDetails: features?.dataQualityDetails
        ? JSON.parse(features.dataQualityDetails)
        : null,
      estimatedValue: {
        valueZAR: features?.estValueZAR || null,
        valueBand: features?.estValueBand
          ? JSON.parse(features.estValueBand)
          : null,
        profitMidZAR: features?.profitMidZAR || null,
      },
      competition: {
        hhi: features?.competitionHHI || null,
        level:
          features?.competitionHHI != null
            ? features.competitionHHI < 0.15
              ? 'high'
              : features.competitionHHI < 0.25
              ? 'moderate'
              : 'low'
            : null,
      },
      buyer: buyerStats
        ? {
            name: tender?.buyerName,
            awards24m: buyerStats.awards24m,
            avgAwardZAR: buyerStats.avgAwardZAR,
            amendmentRate: buyerStats.amendmentRate,
            contractOverrunRate: buyerStats.contractOverrunRate,
          }
        : null,
      category: categoryStats
        ? {
            name: tender?.mainCategory,
            p25ZAR: categoryStats.p25ZAR,
            p50ZAR: categoryStats.p50ZAR,
            p75ZAR: categoryStats.p75ZAR,
            marginLow: categoryStats.marginLow,
            marginHigh: categoryStats.marginHigh,
          }
        : null,
      relatedTenders,
      lastComputed: features?.computedAt?.toISOString() || null,
    };

    return NextResponse.json(intelligence);
  } catch (error) {
    console.error('❌ Error fetching tender intelligence:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch tender intelligence',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
