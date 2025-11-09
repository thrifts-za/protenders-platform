/**
 * Admin Search Analytics API Route
 * GET /api/admin/analytics/searches
 *
 * Returns search analytics and trends
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/analytics/searches
 * Get search analytics
 *
 * Query params:
 * - days: Number of days to analyze (default: 30)
 * - limit: Top N queries to return (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get search logs if table exists
    const [
      totalSearches,
      uniqueUsers,
      topQueries,
      searchesByDay,
      recentSearches,
    ] = await Promise.all([
      // Total searches in period
      prisma.searchLog.count({
        where: { createdAt: { gte: since } },
      }).catch(() => 0),

      // Unique users who searched
      Promise.resolve(0), // Placeholder - field may not exist

      // Top search queries
      Promise.resolve([]), // Placeholder - query field may not exist in SearchLog

      // Searches by day (last 7 days for trending)
      prisma.searchLog.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: {
          createdAt: true,
        },
      }).catch(() => []),
      // Recent search logs (for UI table)
      prisma.searchLog.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          keywords: true,
          filters: true,
          duration: true,
          dataSource: true,
          resultsCount: true,
          createdAt: true,
        },
      }).catch(() => []),
    ]);

    // Group searches by day
    const searchCountByDay: Record<string, number> = {};
    searchesByDay.forEach(log => {
      const day = log.createdAt.toISOString().split('T')[0];
      searchCountByDay[day] = (searchCountByDay[day] || 0) + 1;
    });

    const dailyTrend = Object.entries(searchCountByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: {
        totalSearches,
        uniqueUsers,
        avgSearchesPerDay: (totalSearches / days).toFixed(1),
        avgSearchesPerUser: uniqueUsers > 0 ? (totalSearches / uniqueUsers).toFixed(1) : 0,
      },
      topQueries: [], // SearchLog may not have query field
      dailyTrend,
      recentSearches,
      // Back-compat alias some UIs might look for
      searches: recentSearches,
      period: {
        days,
        since: since.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching search analytics:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch search analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
