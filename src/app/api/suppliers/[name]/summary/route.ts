/**
 * Supplier Summary API Route
 * GET /api/suppliers/:name/summary
 *
 * Returns summary information about a supplier
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/suppliers/:name/summary
 * Get supplier summary with recent awards
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const supplierName = decodeURIComponent(name);

    // Get supplier stats
    const supplierStats = await prisma.supplierStats.findUnique({
      where: {
        supplierName,
      },
    });

    // Get recent awards for this supplier
    const awards = await prisma.awardSupplier.findMany({
      where: {
        supplierName: {
          contains: supplierName,
          mode: 'insensitive',
        },
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get tenders where this supplier won
    const tenderOcids = [...new Set(awards.map(a => a.ocid))];
    const tenders = await prisma.oCDSRelease.findMany({
      where: {
        ocid: {
          in: tenderOcids.slice(0, 10),
        },
      },
      select: {
        ocid: true,
        tenderTitle: true,
        buyerName: true,
        mainCategory: true,
        status: true,
        closingAt: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    const summary = {
      supplierName,
      stats: supplierStats
        ? {
            wins6m: supplierStats.wins6m,
            winsPrev6m: supplierStats.winsPrev6m,
            wins24m: supplierStats.wins24m,
            topBuyers: supplierStats.topBuyers
              ? JSON.parse(supplierStats.topBuyers)
              : [],
            lastComputed: supplierStats.computedAt.toISOString(),
          }
        : null,
      recentAwards: awards.map(award => ({
        ocid: award.ocid,
        awardId: award.awardId,
        supplierId: award.supplierId,
        legalName: award.legalName,
        createdAt: award.createdAt.toISOString(),
      })),
      recentTenders: tenders.map(tender => ({
        ocid: tender.ocid,
        title: tender.tenderTitle,
        buyer: tender.buyerName,
        category: tender.mainCategory,
        status: tender.status,
        closingDate: tender.closingAt?.toISOString(),
        publishedDate: tender.publishedAt?.toISOString(),
      })),
      totalAwardsFound: awards.length,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('❌ Error fetching supplier summary:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch supplier summary',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
