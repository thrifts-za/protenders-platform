/**
 * Closing Value Insights API Route
 * GET /api/insights/closing-value
 *
 * Returns tender value metrics by closing date
 */

import { NextRequest, NextResponse} from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/insights/closing-value
 * Get tender counts and values by closing date ranges
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const groupBy = searchParams.get('groupBy') || 'week'; // week, month, quarter

    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Get tenders with closing dates
    const tenders = await prisma.oCDSRelease.findMany({
      where: {
        closingAt: {
          gte: oneYearAgo,
          lte: now,
        },
      },
      select: {
        closingAt: true,
        mainCategory: true,
        status: true,
      },
    });

    // Group by time period
    const grouped: Record<string, { count: number; categories: Set<string> }> = {};

    tenders.forEach(tender => {
      if (!tender.closingAt) return;

      let key: string;
      const date = tender.closingAt;

      if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'quarter') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
      } else {
        // Week
        const week = Math.floor((date.getTime() - oneYearAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
        key = `Week ${week}`;
      }

      if (!grouped[key]) {
        grouped[key] = { count: 0, categories: new Set() };
      }
      grouped[key].count++;
      if (tender.mainCategory) {
        grouped[key].categories.add(tender.mainCategory);
      }
    });

    // Format response
    const data = Object.entries(grouped).map(([period, stats]) => ({
      period,
      tenderCount: stats.count,
      categoryCount: stats.categories.size,
    }));

    // Sort by period
    data.sort((a, b) => a.period.localeCompare(b.period));

    return NextResponse.json({
      data,
      total: tenders.length,
      groupBy,
      period: {
        from: oneYearAgo.toISOString(),
        to: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching closing value:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch closing value metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
