/**
 * Top Buyers Insights API Route
 * GET /api/insights/top-buyers
 *
 * Returns top buyers by tender volume
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/insights/top-buyers
 * Get top buyers by tender count
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const days = parseInt(searchParams.get('days') || '365');

    // Calculate date range
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get buyers with tender counts
    const buyers = await prisma.oCDSRelease.groupBy({
      by: ['buyerName'],
      where: {
        buyerName: {
          not: null,
        },
        publishedAt: {
          gte: since,
        },
      },
      _count: {
        ocid: true,
      },
      orderBy: {
        _count: {
          ocid: 'desc',
        },
      },
      take: limit,
    });

    // Format response
    const topBuyers = buyers.map(buyer => ({
      name: buyer.buyerName,
      tenderCount: buyer._count.ocid,
    }));

    return NextResponse.json({
      data: topBuyers,
      total: topBuyers.length,
      period: {
        days,
        since: since.toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching top buyers:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch top buyers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
