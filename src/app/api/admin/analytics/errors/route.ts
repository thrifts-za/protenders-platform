/**
 * Admin Error Analytics API Route
 * GET /api/admin/analytics/errors
 *
 * Returns error logs and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/analytics/errors
 * Get error analytics
 *
 * Query params:
 * - days: Number of days to analyze (default: 7)
 * - limit: Max error logs to return (default: 50)
 * - severity: Filter by severity (error, warning, critical)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const limit = Math.min(200, parseInt(searchParams.get('limit') || '50'));
    const severity = searchParams.get('severity');

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Build where clause
    const where: any = {
      createdAt: { gte: since },
    };

    if (severity) {
      where.severity = severity;
    }

    // Get error logs if table exists - use all available fields
    const [
      errorLogs,
      totalErrors,
    ] = await Promise.all([
      // Recent error logs
      prisma.errorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }).catch(() => []),

      // Total count
      prisma.errorLog.count({ where }).catch(() => 0),
    ]);

    // Get sync state for error tracking
    const syncState = await prisma.syncState.findUnique({
      where: { id: 'ocds_etenders_sa' },
    }).catch(() => null);

    return NextResponse.json({
      summary: {
        totalErrors,
        avgErrorsPerDay: (totalErrors / days).toFixed(1),
      },
      recentErrors: errorLogs,
      syncState: syncState ? {
        lastRunAt: syncState.lastRunAt?.toISOString(),
        lastSuccessAt: syncState.lastSuccessAt?.toISOString(),
      } : null,
      period: {
        days,
        since: since.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching error analytics:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch error analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
