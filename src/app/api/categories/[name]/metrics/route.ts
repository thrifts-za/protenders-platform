/**
 * Category Metrics API Route
 * GET /api/categories/:name/metrics
 *
 * Returns detailed metrics and analytics for a procurement category
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/categories/:name/metrics
 * Get category metrics and analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const categoryName = decodeURIComponent(name);

    // Get category stats
    const categoryStats = await prisma.categoryStats.findUnique({
      where: {
        category: categoryName,
      },
    });

    // Get all tenders in this category
    const tenders = await prisma.oCDSRelease.findMany({
      where: {
        mainCategory: categoryName,
      },
      select: {
        ocid: true,
        tenderTitle: true,
        buyerName: true,
        status: true,
        closingAt: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 100, // Limit for performance
    });

    // Calculate metrics
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const tenders6m = tenders.filter(
      t => t.publishedAt && t.publishedAt >= sixMonthsAgo
    ).length;

    const tenders12m = tenders.filter(
      t => t.publishedAt && t.publishedAt >= oneYearAgo
    ).length;

    // Group by buyer
    const buyerCount: Record<string, number> = {};
    tenders.forEach(t => {
      if (t.buyerName) {
        buyerCount[t.buyerName] = (buyerCount[t.buyerName] || 0) + 1;
      }
    });

    // Sort buyers by count
    const topBuyers = Object.entries(buyerCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([buyer, count]) => ({ buyer, count }));

    // Group by status
    const statusCount: Record<string, number> = {};
    tenders.forEach(t => {
      if (t.status) {
        statusCount[t.status] = (statusCount[t.status] || 0) + 1;
      }
    });

    // Calculate active tenders (closing in future)
    const activeTenders = tenders.filter(
      t => t.closingAt && t.closingAt > now
    ).length;

    const metrics = {
      category: categoryName,
      valueStats: categoryStats
        ? {
            p25ZAR: categoryStats.p25ZAR,
            p50ZAR: categoryStats.p50ZAR,
            p75ZAR: categoryStats.p75ZAR,
            marginLow: categoryStats.marginLow,
            marginHigh: categoryStats.marginHigh,
            lastComputed: categoryStats.computedAt.toISOString(),
          }
        : null,
      activity: {
        totalTenders: tenders.length,
        activeTenders,
        tenders6m,
        tenders12m,
        averageTendersPerMonth: tenders12m > 0 ? (tenders12m / 12).toFixed(1) : 0,
      },
      buyers: {
        total: Object.keys(buyerCount).length,
        topBuyers,
      },
      status: statusCount,
      recentTenders: tenders.slice(0, 10).map(t => ({
        ocid: t.ocid,
        title: t.tenderTitle,
        buyer: t.buyerName,
        status: t.status,
        closingDate: t.closingAt?.toISOString(),
        publishedDate: t.publishedAt?.toISOString(),
      })),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('❌ Error fetching category metrics:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch category metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
