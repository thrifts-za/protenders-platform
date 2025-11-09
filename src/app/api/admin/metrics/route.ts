/**
 * Admin Metrics API Route
 * GET /api/admin/metrics
 *
 * Returns operational metrics for monitoring and admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/metrics
 * Get operational metrics
 */
export async function GET(request: NextRequest) {
  // Require admin authentication
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get metrics in parallel
    const [
      // Database metrics
      totalTenders,
      totalUsers,
      totalSavedSearches,
      totalSavedTenders,

      // Activity metrics (last 24h)
      newTenders24h,
      newUsers24h,
      searches24h,
      alerts24h,

      // Activity metrics (last 7d)
      newTenders7d,
      newUsers7d,

      // System health
      syncState,

      // Popular categories
      topCategories,
    ] = await Promise.all([
      // Database counts
      prisma.oCDSRelease.count(),
      prisma.user.count().catch(() => 0),
      prisma.savedSearch.count().catch(() => 0),
      prisma.savedTender.count().catch(() => 0),

      // Activity metrics (24h)
      prisma.oCDSRelease.count({
        where: { publishedAt: { gte: last24h } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: last24h } },
      }).catch(() => 0),
      prisma.searchLog.count({
        where: { createdAt: { gte: last24h } },
      }).catch(() => 0),
      prisma.alertLog.count({
        where: { createdAt: { gte: last24h } },
      }).catch(() => 0),

      // Activity metrics (7d)
      prisma.oCDSRelease.count({
        where: { publishedAt: { gte: last7d } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: last7d } },
      }).catch(() => 0),

      // System health
      prisma.syncState.findUnique({
        where: { id: 'ocds_etenders_sa' },
      }),

      // Popular categories (last 7 days)
      prisma.oCDSRelease.groupBy({
        by: ['mainCategory'],
        where: {
          mainCategory: { not: null },
          publishedAt: { gte: last7d },
        },
        _count: { ocid: true },
        orderBy: { _count: { ocid: 'desc' } },
        take: 5,
      }),
    ]);

    // Calculate growth rates
    const tenderGrowthRate = newTenders7d > 0 ? ((newTenders24h * 7) / newTenders7d) * 100 : 0;
    const userGrowthRate = newUsers7d > 0 ? ((newUsers24h * 7) / newUsers7d) * 100 : 0;

    // Sync health - check if last sync was recent
    const lastSyncAgo = syncState?.lastSuccessAt
      ? now.getTime() - syncState.lastSuccessAt.getTime()
      : null;
    const syncHealthy = lastSyncAgo !== null && lastSyncAgo < 24 * 60 * 60 * 1000;

    // Get unique OCIDs count
    const uniqueOcids = await prisma.oCDSRelease.groupBy({
      by: ['ocid'],
    }).then(results => results.length);

    // Get total searches and search results from SearchLog
    const totalSearches = await prisma.searchLog.count().catch(() => 0);
    const searchResults = await prisma.searchLog.aggregate({
      _sum: { resultsCount: true },
    }).then(res => res._sum.resultsCount || 0).catch(() => 0);

    // Calculate data source ratio (estimate based on recent searches)
    const recentSearches = await prisma.searchLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: { dataSource: true },
    }).catch(() => []);

    const localDbCount = recentSearches.filter(s => s.dataSource === 'local-db').length;
    const totalRecentSearches = recentSearches.length;
    const localDbRatio = totalRecentSearches > 0 ? Math.round((localDbCount / totalRecentSearches) * 100) : 100;

    // Get database size (rough estimate based on table sizes)
    const dbSizeQuery = await prisma.$queryRaw<Array<{ size: bigint }>>`
      SELECT pg_database_size(current_database()) as size
    `.catch(() => [{ size: BigInt(0) }]);
    const dbSizeBytes = Number(dbSizeQuery[0]?.size || 0);
    const dbSizeMB = (dbSizeBytes / (1024 * 1024)).toFixed(2);

    // Get last import time (most recent tender)
    const lastImport = await prisma.oCDSRelease.findFirst({
      orderBy: { publishedAt: 'desc' },
      select: { publishedAt: true },
    });

    return NextResponse.json({
      // Dashboard compatibility fields (top-level)
      totalReleases: totalTenders,
      uniqueOcids: uniqueOcids,
      totalSearches: totalSearches,
      searchResults: searchResults,
      dataSourceRatio: {
        localDb: localDbRatio,
        liveApi: 100 - localDbRatio,
      },
      databaseSize: `${dbSizeMB} MB`,
      lastImport: lastImport?.publishedAt?.toISOString(),
      nextCronRun: '03:00 SAST',

      // Detailed metrics (nested structure)
      database: {
        tenders: totalTenders,
        users: totalUsers,
        savedSearches: totalSavedSearches,
        savedTenders: totalSavedTenders,
      },
      activity: {
        last24h: {
          newTenders: newTenders24h,
          newUsers: newUsers24h,
          searches: searches24h,
          alertExecutions: alerts24h,
        },
        last7d: {
          newTenders: newTenders7d,
          newUsers: newUsers7d,
        },
      },
      growth: {
        tendersPerDay: (newTenders7d / 7).toFixed(1),
        usersPerDay: (newUsers7d / 7).toFixed(1),
        tenderGrowthRate: tenderGrowthRate.toFixed(1) + '%',
        userGrowthRate: userGrowthRate.toFixed(1) + '%',
      },
      system: {
        syncHealth: syncHealthy ? 'healthy' : 'warning',
        lastSyncAt: syncState?.lastSuccessAt?.toISOString(),
      },
      popular: {
        categories: topCategories.map(cat => ({
          name: cat.mainCategory,
          count: cat._count.ocid,
        })),
      },
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch admin metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
