/**
 * Buyer Metrics API Route
 * GET /api/buyers/:name/metrics
 *
 * Returns detailed metrics and analytics for a buyer/procuring entity
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/buyers/:name/metrics
 * Get buyer metrics and analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const buyerName = decodeURIComponent(name);

    // Get buyer stats
    const buyerStats = await prisma.buyerStats.findUnique({
      where: {
        buyerName,
      },
    });

    // Get all tenders from this buyer
    const tenders = await prisma.oCDSRelease.findMany({
      where: {
        buyerName: {
          contains: buyerName,
          mode: 'insensitive',
        },
      },
      select: {
        ocid: true,
        tenderTitle: true,
        mainCategory: true,
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

    // Group by category
    const categoryCount: Record<string, number> = {};
    tenders.forEach(t => {
      if (t.mainCategory) {
        categoryCount[t.mainCategory] = (categoryCount[t.mainCategory] || 0) + 1;
      }
    });

    // Sort categories by count
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));

    // Group by status
    const statusCount: Record<string, number> = {};
    tenders.forEach(t => {
      if (t.status) {
        statusCount[t.status] = (statusCount[t.status] || 0) + 1;
      }
    });

    const metrics = {
      buyerName,
      stats: buyerStats
        ? {
            awards24m: buyerStats.awards24m,
            avgAwardZAR: buyerStats.avgAwardZAR,
            amendmentRate: buyerStats.amendmentRate,
            contractOverrunRate: buyerStats.contractOverrunRate,
            lastComputed: buyerStats.computedAt.toISOString(),
          }
        : null,
      activity: {
        totalTenders: tenders.length,
        tenders6m,
        tenders12m,
        averageTendersPerMonth: tenders12m > 0 ? (tenders12m / 12).toFixed(1) : 0,
      },
      categories: {
        total: Object.keys(categoryCount).length,
        topCategories,
      },
      status: statusCount,
      recentTenders: tenders.slice(0, 10).map(t => ({
        ocid: t.ocid,
        title: t.tenderTitle,
        category: t.mainCategory,
        status: t.status,
        closingDate: t.closingAt?.toISOString(),
        publishedDate: t.publishedAt?.toISOString(),
      })),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('❌ Error fetching buyer metrics:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch buyer metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
