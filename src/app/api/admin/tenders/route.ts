/**
 * Admin Tenders Catalog API Route
 * GET /api/admin/tenders
 *
 * Returns paginated list of tenders with filters for admin management
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/tenders
 * Get paginated tender catalog with filters
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - status: Filter by status
 * - category: Filter by mainCategory
 * - buyer: Filter by buyerName
 * - search: Search in title/description
 * - fromDate: Filter tenders published after this date
 * - toDate: Filter tenders published before this date
 * - sortBy: Sort field (publishedAt, closingAt, etc.)
 * - sortOrder: asc or desc (default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const buyer = searchParams.get('buyer');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.mainCategory = {
        contains: category,
        mode: 'insensitive',
      };
    }

    if (buyer) {
      where.buyerName = {
        contains: buyer,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        {
          tenderTitle: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          tenderDescription: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (fromDate || toDate) {
      where.publishedAt = {};
      if (fromDate) {
        where.publishedAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.publishedAt.lte = new Date(toDate);
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'publishedAt' || sortBy === 'closingAt' || sortBy === 'updatedAt') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.publishedAt = sortOrder;
    }

    // Fetch tenders and total count in parallel
    const [tenders, total] = await Promise.all([
      prisma.oCDSRelease.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          ocid: true,
          releaseId: true,
          date: true,
          buyerName: true,
          tenderTitle: true,
          tenderDescription: true,
          mainCategory: true,
          closingAt: true,
          publishedAt: true,
          status: true,
          province: true,
          tenderType: true,
          contactEmail: true,
          contactPerson: true,
          updatedAt: true,
        },
      }),

      prisma.oCDSRelease.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: tenders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      filters: {
        status,
        category,
        buyer,
        search,
        fromDate,
        toDate,
      },
      sort: {
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Error fetching admin tenders:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch tenders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
