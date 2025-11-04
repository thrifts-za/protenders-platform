/**
 * Admin Buyers Catalog API Route
 * GET /api/admin/buyers
 *
 * Returns list of buyers with their activity stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/buyers
 * Get buyers catalog with activity stats
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - search: Search buyer name
 * - sortBy: tenderCount, latestTender (default: tenderCount)
 * - sortOrder: asc or desc (default: desc)
 * - minTenders: Minimum tender count filter
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
    const minTenders = searchParams.get('minTenders')
      ? parseInt(searchParams.get('minTenders')!)
      : null;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'tenderCount';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const where: any = {
      buyerName: {
        not: null,
      },
    };

    if (search) {
      where.buyerName = {
        ...where.buyerName,
        contains: search,
        mode: 'insensitive',
      };
    }

    // Group by buyer and count tenders
    const buyersWithCounts = await prisma.oCDSRelease.groupBy({
      by: ['buyerName'],
      where,
      _count: {
        ocid: true,
      },
      _max: {
        publishedAt: true,
      },
      _min: {
        publishedAt: true,
      },
    });

    // Filter by minTenders if specified
    let filteredBuyers = buyersWithCounts;
    if (minTenders !== null) {
      filteredBuyers = buyersWithCounts.filter(
        (b) => b._count.ocid >= minTenders
      );
    }

    // Sort
    if (sortBy === 'tenderCount') {
      filteredBuyers.sort((a, b) => {
        const diff = b._count.ocid - a._count.ocid;
        return sortOrder === 'desc' ? diff : -diff;
      });
    } else if (sortBy === 'latestTender') {
      filteredBuyers.sort((a, b) => {
        const aTime = a._max.publishedAt?.getTime() || 0;
        const bTime = b._max.publishedAt?.getTime() || 0;
        const diff = bTime - aTime;
        return sortOrder === 'desc' ? diff : -diff;
      });
    }

    // Paginate
    const total = filteredBuyers.length;
    const paginatedBuyers = filteredBuyers.slice(skip, skip + limit);

    // Format response
    const buyers = paginatedBuyers.map((buyer) => ({
      name: buyer.buyerName,
      tenderCount: buyer._count.ocid,
      latestTenderAt: buyer._max.publishedAt?.toISOString(),
      firstTenderAt: buyer._min.publishedAt?.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: buyers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      filters: {
        search,
        minTenders,
      },
      sort: {
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Error fetching admin buyers:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch buyers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
