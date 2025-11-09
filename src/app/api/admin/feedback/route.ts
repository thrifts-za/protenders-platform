/**
 * Admin Feedback API Route
 * GET /api/admin/feedback
 *
 * Returns paginated list of user feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/feedback
 * Get paginated feedback list
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - status: Filter by status (pending, reviewed, resolved)
 * - category: Filter by category
 * - sortOrder: asc or desc (default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    // Fetch feedback and total count in parallel
    const [feedbackList, total] = await Promise.all([
      prisma.feedback
        .findMany({
          where,
          orderBy: {
            createdAt: sortOrder,
          },
          skip,
          take: limit,
        })
        .catch(() => []),

      prisma.feedback.count({ where }).catch(() => 0),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: feedbackList,
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
      },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch feedback',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
