/**
 * Admin Stats API Route
 * GET /api/admin/stats
 *
 * Migrated from TenderAPI Express route
 * Returns dashboard metrics and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface DashboardStats {
  totals: {
    releases: number;
    uniqueOcids: number;
    categories: number;
    buyers: number;
  };
  lastImportAt: string | null;
  recentActivity: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
  topBuyers: Array<{
    buyer: string;
    count: number;
  }>;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('=Ê Fetching admin dashboard statistics...');

    // Calculate date ranges
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all stats in parallel
    const [
      totalReleases,
      uniqueOcids,
      lastImport,
      recentActivity24h,
      recentActivity7d,
      recentActivity30d,
      categoryBreakdown,
      topBuyers,
    ] = await Promise.all([
      // Total releases
      prisma.oCDSRelease.count(),

      // Unique OCIDs (tenders)
      prisma.oCDSRelease.groupBy({
        by: ['ocid'],
      }).then((groups) => groups.length),

      // Last import timestamp
      prisma.oCDSRelease.findFirst({
        orderBy: { importedAt: 'desc' },
        select: { importedAt: true },
      }),

      // Recent activity - last 24h
      prisma.oCDSRelease.count({
        where: {
          publishedAt: { gte: last24h },
        },
      }),

      // Recent activity - last 7 days
      prisma.oCDSRelease.count({
        where: {
          publishedAt: { gte: last7d },
        },
      }),

      // Recent activity - last 30 days
      prisma.oCDSRelease.count({
        where: {
          publishedAt: { gte: last30d },
        },
      }),

      // Category breakdown (top 10)
      prisma.oCDSRelease.groupBy({
        by: ['mainCategory'],
        where: {
          mainCategory: { not: null },
        },
        _count: {
          mainCategory: true,
        },
        orderBy: {
          _count: {
            mainCategory: 'desc',
          },
        },
        take: 10,
      }),

      // Top buyers (top 10)
      prisma.oCDSRelease.groupBy({
        by: ['buyerName'],
        where: {
          buyerName: { not: null },
        },
        _count: {
          buyerName: true,
        },
        orderBy: {
          _count: {
            buyerName: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Count unique categories and buyers
    const categoryCount = await prisma.oCDSRelease.groupBy({
      by: ['mainCategory'],
      where: { mainCategory: { not: null } },
    }).then((g) => g.length);

    const buyerCount = await prisma.oCDSRelease.groupBy({
      by: ['buyerName'],
      where: { buyerName: { not: null } },
    }).then((g) => g.length);

    const stats: DashboardStats = {
      totals: {
        releases: totalReleases,
        uniqueOcids,
        categories: categoryCount,
        buyers: buyerCount,
      },
      lastImportAt: lastImport?.importedAt?.toISOString() || null,
      recentActivity: {
        last24h: recentActivity24h,
        last7d: recentActivity7d,
        last30d: recentActivity30d,
      },
      categoryBreakdown: categoryBreakdown.map((cat) => ({
        category: cat.mainCategory!,
        count: cat._count.mainCategory,
      })),
      topBuyers: topBuyers.map((buyer) => ({
        buyer: buyer.buyerName!,
        count: buyer._count.buyerName,
      })),
    };

    const duration = Date.now() - startTime;

    const headers = new Headers();
    headers.set('X-Data-Source', 'local-db');
    headers.set('X-Response-Time', `${duration}ms`);

    console.log(` Admin stats fetched in ${duration}ms`);

    return NextResponse.json(stats, { headers });
  } catch (error) {
    console.error('L Error fetching admin stats:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch admin stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
