/**
 * Commodity Spend Breakdown API Route
 * GET /api/demographics/commodities
 *
 * Returns commodity segment spend breakdown (UNSPSC classification)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/demographics/commodities
 * Get commodity spend breakdown with optional filtering
 * Query params:
 * - fiscalYear: Filter by fiscal year (e.g., "2025/26")
 * - limit: Limit number of results (default: all)
 * - minSpend: Minimum spend threshold in Rand
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');
    const limit = searchParams.get('limit');
    const minSpend = searchParams.get('minSpend');

    const whereClause: any = {};
    if (fiscalYear) whereClause.fiscalYear = fiscalYear;
    if (minSpend) {
      whereClause.totalSpend = {
        gte: parseFloat(minSpend),
      };
    }

    let commodities = await prisma.commoditySpendBreakdown.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: { totalSpend: 'desc' },
    });

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        commodities = commodities.slice(0, limitNum);
      }
    }

    // Calculate summary statistics
    const totalSpend = commodities.reduce(
      (sum, commodity) => sum + Number(commodity.totalSpend),
      0
    );

    // Enrich with computed percentages if not already present
    const enrichedCommodities = commodities.map(commodity => {
      const spend = Number(commodity.totalSpend);
      const percentOfTotal =
        commodity.percentOfTotal !== null
          ? Number(commodity.percentOfTotal)
          : totalSpend > 0
          ? (spend / totalSpend) * 100
          : 0;

      return {
        ...commodity,
        totalSpend: spend,
        percentOfTotal: Number(percentOfTotal.toFixed(2)),
      };
    });

    // Top 10 commodity segments
    const topCommodities = enrichedCommodities.slice(0, 10);

    // Group by family if available
    const byFamily = enrichedCommodities.reduce((acc, commodity) => {
      if (commodity.familyTitle) {
        const family = commodity.familyTitle;
        if (!acc[family]) {
          acc[family] = {
            familyTitle: family,
            totalSpend: 0,
            segmentCount: 0,
          };
        }
        acc[family].totalSpend += Number(commodity.totalSpend);
        acc[family].segmentCount += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    const familySummary = Object.values(byFamily).sort(
      (a: any, b: any) => b.totalSpend - a.totalSpend
    );

    return NextResponse.json({
      commodities: enrichedCommodities,
      count: commodities.length,
      summary: {
        totalSpend,
        topCommodities,
        byFamily: familySummary,
      },
      filters: {
        fiscalYear: fiscalYear || 'all',
        limit: limit || 'all',
        minSpend: minSpend || 'none',
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching commodity spend breakdown:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch commodity spend breakdown',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
