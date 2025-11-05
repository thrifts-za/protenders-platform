/**
 * Admin Suppliers Catalog API Route
 * GET /api/admin/suppliers
 *
 * Returns list of suppliers with their award stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/suppliers
 * Get suppliers catalog with award stats
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - search: Search supplier name
 * - sortBy: awardCount, latestAward (default: awardCount)
 * - sortOrder: asc or desc (default: desc)
 * - minAwards: Minimum award count filter
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search');
    const minAwards = searchParams.get('minAwards')
      ? parseInt(searchParams.get('minAwards')!)
      : null;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'awardCount';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const where: any = {
      supplierName: {
        not: null,
      },
    };

    if (search) {
      where.supplierName = {
        ...where.supplierName,
        contains: search,
        mode: 'insensitive',
      };
    }

    // Group by supplier and count awards (primary source)
    const suppliersWithCounts = await prisma.awardSupplier.groupBy({
      by: ['supplierName'],
      where,
      _count: {
        id: true,
      },
      _max: {
        createdAt: true,
      },
      _min: {
        createdAt: true,
      },
    }).catch(() => [] as any[]);

    // Fallback: if no AwardSupplier data, use SupplierStats (wins24m)
    let viaSupplierStats = false;
    let statsRows: { supplierName: string; wins24m: number }[] = [];
    if (!suppliersWithCounts || suppliersWithCounts.length === 0) {
      viaSupplierStats = true;
      const stats = await prisma.supplierStats.findMany({
        where: search
          ? { supplierName: { contains: search, mode: 'insensitive' } }
          : undefined,
        orderBy: { wins24m: 'desc' },
        take: limit + skip, // we'll paginate after mapping
        select: { supplierName: true, wins24m: true },
      }).catch(() => [] as any[]);
      statsRows = stats.filter((s) => s.supplierName);
    }

    // Build working list depending on source
    let filteredSuppliers = suppliersWithCounts as any[];
    if (viaSupplierStats) {
      filteredSuppliers = statsRows.map((row) => ({
        supplierName: row.supplierName,
        _count: { id: row.wins24m || 0 },
        _max: { createdAt: undefined as Date | undefined },
        _min: { createdAt: undefined as Date | undefined },
      }));
    }

    // Filter by minAwards if specified
    if (minAwards !== null) {
      filteredSuppliers = filteredSuppliers.filter(
        (s) => (s._count?.id || 0) >= minAwards
      );
    }

    // Sort
    if (sortBy === 'awardCount') {
      filteredSuppliers.sort((a, b) => {
        const diff = b._count.id - a._count.id;
        return sortOrder === 'desc' ? diff : -diff;
      });
    } else if (sortBy === 'latestAward') {
      filteredSuppliers.sort((a, b) => {
        const aTime = a._max.createdAt?.getTime() || 0;
        const bTime = b._max.createdAt?.getTime() || 0;
        const diff = bTime - aTime;
        return sortOrder === 'desc' ? diff : -diff;
      });
    }

    // Paginate
    const total = filteredSuppliers.length;
    const paginatedSuppliers = filteredSuppliers.slice(skip, skip + limit);

    // Format response
    const suppliers = paginatedSuppliers.map((supplier) => ({
      name: supplier.supplierName,
      awardCount: supplier._count.id,
      latestAwardAt: supplier._max.createdAt?.toISOString(),
      firstAwardAt: supplier._min.createdAt?.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      filters: {
        search,
        minAwards,
      },
      sort: {
        sortBy,
        sortOrder,
      },
      source: viaSupplierStats ? 'supplier-stats' : 'award-suppliers',
    });
  } catch (error) {
    console.error('Error fetching admin suppliers:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch suppliers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
