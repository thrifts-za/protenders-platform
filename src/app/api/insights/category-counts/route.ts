/**
 * Category Counts Insights API Route
 * GET /api/insights/category-counts
 *
 * Returns tender distribution across categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/insights/category-counts
 * Get tender counts by category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '365');

    // Calculate date range
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get categories with tender counts
    const categories = await prisma.oCDSRelease.groupBy({
      by: ['mainCategory'],
      where: {
        mainCategory: {
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
    });

    // Calculate total
    const total = categories.reduce((sum, cat) => sum + cat._count.ocid, 0);

    // Format response with percentages
    const categoryCounts = categories.map(cat => ({
      category: cat.mainCategory,
      count: cat._count.ocid,
      percentage: total > 0 ? ((cat._count.ocid / total) * 100).toFixed(2) : 0,
    }));

    return NextResponse.json({
      data: categoryCounts,
      total,
      period: {
        days,
        since: since.toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching category counts:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch category counts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
