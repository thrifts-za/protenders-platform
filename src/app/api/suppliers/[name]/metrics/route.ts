/**
 * Supplier Metrics API Route
 * GET /api/suppliers/:name/metrics
 *
 * Returns detailed metrics and analytics for a supplier
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/suppliers/:name/metrics
 * Get supplier metrics and analytics
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

    if (!supplierStats) {
      return NextResponse.json(
        { error: 'Supplier not found or no stats available' },
        { status: 404 }
      );
    }

    // Get all awards for this supplier
    const allAwards = await prisma.awardSupplier.findMany({
      where: {
        supplierName: {
          contains: supplierName,
          mode: 'insensitive',
        },
      },
    });

    // Get award details with values
    const awardDetails = await prisma.award.findMany({
      where: {
        ocid: {
          in: allAwards.map(a => a.ocid),
        },
      },
      select: {
        ocid: true,
        awardId: true,
        valueAmount: true,
        valueCurrency: true,
        date: true,
        status: true,
      },
    });

    // Calculate metrics
    const totalValue = awardDetails.reduce(
      (sum, award) => sum + (award.valueAmount || 0),
      0
    );

    const avgValue =
      awardDetails.length > 0 ? totalValue / awardDetails.length : 0;

    // Group by year
    const awardsByYear: Record<string, number> = {};
    awardDetails.forEach(award => {
      if (award.date) {
        const year = award.date.getFullYear().toString();
        awardsByYear[year] = (awardsByYear[year] || 0) + 1;
      }
    });

    // Get categories where supplier has won
    const tenders = await prisma.oCDSRelease.findMany({
      where: {
        ocid: {
          in: [...new Set(allAwards.map(a => a.ocid))],
        },
      },
      select: {
        mainCategory: true,
        buyerName: true,
      },
    });

    const categories = [...new Set(tenders.map(t => t.mainCategory).filter(Boolean))];
    const buyers = [...new Set(tenders.map(t => t.buyerName).filter(Boolean))];

    const metrics = {
      supplierName,
      performance: {
        wins6m: supplierStats.wins6m,
        winsPrev6m: supplierStats.winsPrev6m,
        wins24m: supplierStats.wins24m,
        winRate6m:
          supplierStats.winsPrev6m > 0
            ? ((supplierStats.wins6m - supplierStats.winsPrev6m) /
                supplierStats.winsPrev6m) *
              100
            : 0,
      },
      financial: {
        totalAwardValue: totalValue,
        averageAwardValue: avgValue,
        currency: 'ZAR',
        totalAwards: awardDetails.length,
      },
      activity: {
        awardsByYear,
        categoriesServed: categories.length,
        buyersWorkedWith: buyers.length,
        topBuyers: supplierStats.topBuyers
          ? JSON.parse(supplierStats.topBuyers)
          : [],
      },
      categories: categories.slice(0, 10),
      buyers: buyers.slice(0, 10),
      lastUpdated: supplierStats.computedAt.toISOString(),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('❌ Error fetching supplier metrics:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch supplier metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
