/**
 * Overall Stats Insights API Route
 * GET /api/insights/stats
 *
 * Returns overall platform statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/insights/stats
 * Get overall platform statistics
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get counts in parallel
    const [
      totalTenders,
      activeTenders,
      tenders7d,
      tenders30d,
      totalBuyers,
      totalCategories,
      recentSearches,
      totalUsers,
      totalAlerts,
    ] = await Promise.all([
      // Total tenders
      prisma.oCDSRelease.count(),

      // Active tenders (closing in future)
      prisma.oCDSRelease.count({
        where: {
          closingAt: {
            gte: now,
          },
        },
      }),

      // Tenders in last 7 days
      prisma.oCDSRelease.count({
        where: {
          publishedAt: {
            gte: sevenDaysAgo,
          },
        },
      }),

      // Tenders in last 30 days
      prisma.oCDSRelease.count({
        where: {
          publishedAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),

      // Unique buyers
      prisma.oCDSRelease.groupBy({
        by: ['buyerName'],
        where: {
          buyerName: {
            not: null,
          },
        },
        _count: true,
      }).then(result => result.length),

      // Unique categories
      prisma.oCDSRelease.groupBy({
        by: ['mainCategory'],
        where: {
          mainCategory: {
            not: null,
          },
        },
        _count: true,
      }).then(result => result.length),

      // Recent searches count (last 24 hours)
      prisma.searchLog.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      }).catch(() => 0), // Handle if table doesn't exist

      // Total users
      prisma.user.count().catch(() => 0),

      // Total active alerts
      prisma.savedSearch.count({
        where: {
          alertFrequency: {
            not: 'none',
          },
        },
      }).catch(() => 0),
    ]);

    // Get latest sync info
    const syncState = await prisma.syncState.findUnique({
      where: { id: 'ocds_etenders_sa' },
    }).catch(() => null);

    const stats = {
      tenders: {
        total: totalTenders,
        active: activeTenders,
        last7Days: tenders7d,
        last30Days: tenders30d,
        avgPerDay: tenders30d > 0 ? (tenders30d / 30).toFixed(1) : 0,
      },
      buyers: {
        total: totalBuyers,
      },
      categories: {
        total: totalCategories,
      },
      platform: {
        users: totalUsers,
        activeAlerts: totalAlerts,
        recentSearches: recentSearches,
      },
      sync: syncState
        ? {
            lastRunAt: syncState.lastRunAt?.toISOString(),
            lastSuccessAt: syncState.lastSuccessAt?.toISOString(),
            lastSyncedDate: syncState.lastSyncedDate?.toISOString(),
          }
        : null,
      generatedAt: now.toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
