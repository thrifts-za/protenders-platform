/**
 * Supplier Classifications API Route
 * GET /api/demographics/suppliers
 *
 * Returns supplier type classifications with spend breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/demographics/suppliers
 * Get supplier classification data with optional filtering
 * Query params:
 * - fiscalYear: Filter by fiscal year (e.g., "2025/26")
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');

    const whereClause: any = {};
    if (fiscalYear) whereClause.fiscalYear = fiscalYear;

    const suppliers = await prisma.supplierClassification.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: { totalSpend: 'desc' },
    });

    // Calculate summary statistics
    const totalSpend = suppliers.reduce(
      (sum, supplier) => sum + Number(supplier.totalSpend),
      0
    );

    const totalSupplierCount = suppliers.reduce(
      (sum, supplier) => sum + (supplier.supplierCount || 0),
      0
    );

    // Enrich with computed percentages if not already present
    const enrichedSuppliers = suppliers.map(supplier => {
      const spend = Number(supplier.totalSpend);
      const percentOfTotal =
        supplier.percentOfTotal !== null
          ? Number(supplier.percentOfTotal)
          : totalSpend > 0
          ? (spend / totalSpend) * 100
          : 0;

      return {
        ...supplier,
        totalSpend: spend,
        percentOfTotal: Number(percentOfTotal.toFixed(2)),
      };
    });

    // Top 5 supplier types
    const topSuppliers = enrichedSuppliers.slice(0, 5);

    return NextResponse.json({
      suppliers: enrichedSuppliers,
      count: suppliers.length,
      summary: {
        totalSpend,
        totalSupplierCount,
        topSuppliers,
      },
      filters: {
        fiscalYear: fiscalYear || 'all',
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching supplier classifications:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch supplier classifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
