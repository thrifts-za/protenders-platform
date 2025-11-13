/**
 * Demographic Spend Time-Series API Route
 * GET /api/demographics/timeseries
 *
 * Returns monthly demographic spend trends across PPPFA categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/demographics/timeseries
 * Get demographic spend time-series data with optional filtering
 * Query params:
 * - fiscalYear: Filter by fiscal year (e.g., "2025/26")
 * - categoryCode: Filter by specific PPPFA category code
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');
    const categoryCode = searchParams.get('categoryCode');

    const whereClause: any = {};
    if (fiscalYear) whereClause.fiscalYear = fiscalYear;
    if (categoryCode) whereClause.categoryCode = categoryCode;

    const timeSeries = await prisma.demographicSpendTimeSeries.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: [
        { fiscalYear: 'desc' },
        { monthNumber: 'asc' },
        { categoryCode: 'asc' },
      ],
      include: {
        category: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    // Calculate summary statistics
    const totalSpend = timeSeries.reduce(
      (sum, record) => sum + Number(record.spendAmount),
      0
    );

    // Group by category for breakdown
    const byCategory = timeSeries.reduce((acc, record) => {
      const code = record.categoryCode;
      if (!acc[code]) {
        acc[code] = {
          code,
          name: record.category.name,
          totalSpend: 0,
          recordCount: 0,
        };
      }
      acc[code].totalSpend += Number(record.spendAmount);
      acc[code].recordCount += 1;
      return acc;
    }, {} as Record<string, any>);

    // Group by month for trends
    const byMonth = timeSeries.reduce((acc, record) => {
      const month = record.month;
      if (!acc[month]) {
        acc[month] = {
          month,
          monthNumber: record.monthNumber,
          fiscalYear: record.fiscalYear,
          totalSpend: 0,
          categories: [] as any[],
        };
      }
      acc[month].totalSpend += Number(record.spendAmount);
      acc[month].categories.push({
        code: record.categoryCode,
        name: record.category.name,
        spendAmount: Number(record.spendAmount),
      });
      return acc;
    }, {} as Record<string, any>);

    const monthlyTrends = Object.values(byMonth).sort(
      (a: any, b: any) => a.monthNumber - b.monthNumber
    );

    return NextResponse.json({
      timeSeries,
      count: timeSeries.length,
      summary: {
        totalSpend,
        byCategory: Object.values(byCategory),
        monthlyTrends,
      },
      filters: {
        fiscalYear: fiscalYear || 'all',
        categoryCode: categoryCode || 'all',
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching demographic time-series:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch demographic time-series',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
